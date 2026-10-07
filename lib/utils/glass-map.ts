/**
 * Builds a displacement map for an SVG `feDisplacementMap` that bends the
 * backdrop near the rounded edges of an element, simulating the thick,
 * light-bending rim of a slab of glass.
 *
 * The map is encoded in the usual way: red = horizontal offset, green =
 * vertical offset, 128 = no displacement. Pixels close to the edge sample
 * the backdrop from further inside the element (along the inward normal of
 * the rounded rectangle), which compresses the background into a bevelled
 * band while the centre stays undistorted.
 */

export interface GlassMapOptions {
    /** Element width in CSS px. */
    width: number
    /** Element height in CSS px. */
    height: number
    /** Border radius in CSS px. */
    radius: number
    /** Thickness of the refracting rim in CSS px. */
    band?: number
    /** 0..1 — how far (relative to the band) edge pixels are pulled inward. */
    strength?: number
}

export interface GlassMap {
    /** data: URL of the PNG displacement map. */
    href: string
    /** `scale` attribute for feDisplacementMap, in CSS px. */
    scale: number
    width: number
    height: number
}

const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v))

const smoothstep = (edge0: number, edge1: number, x: number) => {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
    return t * t * (3 - 2 * t)
}

export const defaultBand = (width: number, height: number) =>
    clamp(Math.min(width, height) * 0.34, 6, 56)

const cache = new Map<string, GlassMap>()

export function buildGlassMap({
    width,
    height,
    radius,
    band,
    strength = 0.9,
}: GlassMapOptions): GlassMap | null {
    if (typeof document === 'undefined') return null
    width = Math.round(width)
    height = Math.round(height)
    if (width < 4 || height < 4) return null

    const bandPx = band ?? defaultBand(width, height)
    const r = clamp(radius, 0, Math.min(width, height) / 2)
    const key = `${width}x${height}:${r.toFixed(1)}:${bandPx.toFixed(1)}:${strength}`
    const cached = cache.get(key)
    if (cached) return cached

    // Texture resolution: the map is smooth, so it can be rendered at a
    // fraction of the element size. Keep at least ~6 texels across the band.
    const longest = Math.max(width, height)
    let res = Math.min(1, 384 / longest)
    res = Math.max(res, Math.min(1, 6 / bandPx))
    const w = Math.max(2, Math.round(width * res))
    const h = Math.max(2, Math.round(height * res))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const image = ctx.createImageData(w, h)
    const data = image.data
    const disp = new Float32Array(w * h * 2)

    const cx = width / 2
    const cy = height / 2
    const hw = width / 2 - r
    const hh = height / 2 - r
    const maxShift = bandPx * strength
    let max = 0

    for (let j = 0; j < h; j++) {
        const py = ((j + 0.5) * height) / h
        for (let i = 0; i < w; i++) {
            const px = ((i + 0.5) * width) / w
            const dx = px - cx
            const dy = py - cy
            const qx = Math.abs(dx) - hw
            const qy = Math.abs(dy) - hh
            const ox = Math.max(qx, 0)
            const oy = Math.max(qy, 0)
            // Signed distance to the rounded rectangle (negative inside).
            const sd = Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r
            const depth = Math.max(0, -sd)

            // Outward normal of the rounded rect at this pixel.
            let nx: number
            let ny: number
            if (qx > 0 && qy > 0) {
                const len = Math.hypot(ox, oy) || 1
                nx = (Math.sign(dx) * ox) / len
                ny = (Math.sign(dy) * oy) / len
            } else if (qx > qy) {
                nx = Math.sign(dx) || 1
                ny = 0
            } else {
                nx = 0
                ny = Math.sign(dy) || 1
            }

            // 1 at the edge, 0 once we are deeper than the band.
            const k = 1 - smoothstep(0, bandPx, depth)
            // Lens profile: steep near the rim, soft further in.
            const mag = maxShift * Math.pow(k, 1.75)
            const sx = -nx * mag
            const sy = -ny * mag
            const idx = (j * w + i) * 2
            disp[idx] = sx
            disp[idx + 1] = sy
            const a = Math.max(Math.abs(sx), Math.abs(sy))
            if (a > max) max = a
        }
    }

    if (max < 0.05) return null

    for (let p = 0; p < w * h; p++) {
        const o = p * 4
        data[o] = 128 + (127 * disp[p * 2]) / max
        data[o + 1] = 128 + (127 * disp[p * 2 + 1]) / max
        data[o + 2] = 128
        data[o + 3] = 255
    }
    ctx.putImageData(image, 0, 0)

    const map: GlassMap = {
        href: canvas.toDataURL('image/png'),
        // feDisplacementMap offsets by scale * (channel - 0.5); our channels
        // span ±0.5 for ±max px, so scale = 2 * max.
        scale: 2 * max,
        width,
        height,
    }
    if (cache.size > 200) cache.clear()
    cache.set(key, map)
    return map
}

let svgBackdropSupport: boolean | null = null

/**
 * Whether `backdrop-filter: url(#svg-filter)` can be expected to render.
 * Chromium supports it; WebKit (Safari and every iOS browser) parses it but
 * paints nothing, so we skip the refraction layer there and keep the pure
 * CSS glass, which still looks right.
 */
export function supportsSvgBackdropFilter(): boolean {
    if (svgBackdropSupport !== null) return svgBackdropSupport
    if (typeof window === 'undefined' || typeof CSS === 'undefined') {
        return false
    }
    const hasBackdrop =
        CSS.supports('backdrop-filter', 'blur(1px)') ||
        CSS.supports('-webkit-backdrop-filter', 'blur(1px)')
    const ua = navigator.userAgent
    const isWebKit =
        /AppleWebKit/.test(ua) && !/Chrome\/|Chromium\/|Edg\//.test(ua)
    svgBackdropSupport = hasBackdrop && !isWebKit
    return svgBackdropSupport
}
