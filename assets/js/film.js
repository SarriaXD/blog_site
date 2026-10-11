/* sarria.ca — the home page as a film. No dependencies.
 *
 * One fixed canvas sits behind the page. Scrolling is the playhead:
 * each `[data-ch]` section is a chapter, and the playhead `T` runs
 * from 0 at the top of the first chapter to N at the end of the last.
 * Every frame is drawn in code from `T` — there are no images. Scenes
 * are plain functions of (local progress t, visibility v, clock), and
 * neighbouring scenes cross-fade while the caption of one chapter
 * scrolls out and the next one scrolls in.
 *
 * Coordinates: scenes draw in "units" where the shorter side of the
 * viewport is 1000 units. `F` describes the frame (W, H, the art area
 * above the captions, and `px`, the size of one CSS pixel in units).
 */
(() => {
    'use strict'

    const canvas = document.getElementById('film')
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.documentElement.classList.add('has-film')

    /* ---------- maths ---------- */

    const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x)
    const lerp = (a, b, t) => a + (b - a) * t
    const smooth = (x) => {
        x = clamp(x)
        return x * x * (3 - 2 * x)
    }
    const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3)
    const easeInOut = (x) => {
        x = clamp(x)
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
    }
    const TAU = Math.PI * 2
    /* 1 inside [a, b], easing in/out over `f` on each side */
    const env = (x, a, b, f = 0.08) =>
        smooth((x - a) / f) * smooth((b - x) / f)
    /* progress of x through [a, b] */
    const span = (x, a, b) => clamp((x - a) / (b - a))

    const rng = (seed) => {
        let s = seed >>> 0
        return () => {
            s = (s + 0x6d2b79f5) >>> 0
            let t = s
            t = Math.imul(t ^ (t >>> 15), t | 1)
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296
        }
    }
    const hash = (x) => {
        const s = Math.sin(x * 127.1 + 311.7) * 43758.5453
        return s - Math.floor(s)
    }
    /* smooth 1-D value noise in [0, 1] */
    const noise = (x) => {
        const i = Math.floor(x)
        const f = x - i
        const u = f * f * (3 - 2 * f)
        return lerp(hash(i), hash(i + 1), u)
    }

    const FONT =
        "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif"
    const INK = 'rgb(245, 241, 234)'
    const INK_DIM = 'rgba(245, 241, 234, 0.42)'
    const ACCENT = '#2997ff'
    const font = (size, weight = 500) => `${weight} ${size}px ${FONT}`

    /* ---------- strokes drawn stroke by stroke ----------
     * A path is a list of polylines. Keeping it as points lets us draw
     * only the first `p` of its length, which is how the line drawings
     * appear as you scroll.
     */
    class Path {
        constructor() {
            this.subs = []
            this.cur = null
            this.len = 0
        }
        m(x, y) {
            this.cur = [x, y]
            this.subs.push(this.cur)
            return this
        }
        l(x, y) {
            const c = this.cur
            if (!c) return this.m(x, y)
            const px = c[c.length - 2]
            const py = c[c.length - 1]
            this.len += Math.hypot(x - px, y - py)
            c.push(x, y)
            return this
        }
        c(x1, y1, x2, y2, x, y, n = 14) {
            const c = this.cur
            const x0 = c[c.length - 2]
            const y0 = c[c.length - 1]
            for (let i = 1; i <= n; i++) {
                const t = i / n
                const s = 1 - t
                this.l(
                    s * s * s * x0 + 3 * s * s * t * x1 + 3 * s * t * t * x2 + t * t * t * x,
                    s * s * s * y0 + 3 * s * s * t * y1 + 3 * s * t * t * y2 + t * t * t * y
                )
            }
            return this
        }
        q(x1, y1, x, y, n = 10) {
            const c = this.cur
            const x0 = c[c.length - 2]
            const y0 = c[c.length - 1]
            for (let i = 1; i <= n; i++) {
                const t = i / n
                const s = 1 - t
                this.l(
                    s * s * x0 + 2 * s * t * x1 + t * t * x,
                    s * s * y0 + 2 * s * t * y1 + t * t * y
                )
            }
            return this
        }
        /* arc from a0 to a1 (radians, y down); direction follows the sign */
        a(cx, cy, r, a0, a1, n) {
            n = n || Math.max(4, Math.ceil((Math.abs(a1 - a0) * r) / 14))
            for (let i = 0; i <= n; i++) {
                const a = lerp(a0, a1, i / n)
                const x = cx + Math.cos(a) * r
                const y = cy + Math.sin(a) * r
                if (i === 0 && !this.cur) this.m(x, y)
                else if (i === 0) this.l(x, y)
                else this.l(x, y)
            }
            return this
        }
        circle(cx, cy, r) {
            this.cur = null
            return this.a(cx, cy, r, 0, TAU)
        }
        z() {
            const c = this.cur
            if (c && c.length >= 4) this.l(c[0], c[1])
            this.cur = null
            return this
        }
        rr(x, y, w, h, r) {
            r = Math.min(r, w / 2, h / 2)
            this.m(x + r, y)
            this.l(x + w - r, y)
            this.a(x + w - r, y + r, r, -Math.PI / 2, 0)
            this.l(x + w, y + h - r)
            this.a(x + w - r, y + h - r, r, 0, Math.PI / 2)
            this.l(x + r, y + h)
            this.a(x + r, y + h - r, r, Math.PI / 2, Math.PI)
            this.l(x, y + r)
            this.a(x + r, y + r, r, Math.PI, Math.PI * 1.5)
            return this.z()
        }
        line(x0, y0, x1, y1) {
            return this.m(x0, y0).l(x1, y1)
        }
    }

    /* trace the first `p` of a path into the current context path */
    const trace = (c, path, p = 1) => {
        let budget = p >= 1 ? Infinity : path.len * clamp(p)
        c.beginPath()
        for (const s of path.subs) {
            c.moveTo(s[0], s[1])
            for (let i = 2; i < s.length; i += 2) {
                const px = s[i - 2]
                const py = s[i - 1]
                const d = Math.hypot(s[i] - px, s[i + 1] - py)
                if (d > budget) {
                    const k = budget / d
                    c.lineTo(px + (s[i] - px) * k, py + (s[i + 1] - py) * k)
                    return
                }
                budget -= d
                c.lineTo(s[i], s[i + 1])
            }
        }
    }

    /* ink: a thin bright line over a wide faint one, for a soft edge */
    const ink = (c, path, p, w, col = INK, alpha = 1) => {
        if (p <= 0 || alpha <= 0) return
        trace(c, path, p)
        c.lineCap = 'round'
        c.lineJoin = 'round'
        const a = c.globalAlpha
        c.strokeStyle = col
        c.globalAlpha = a * alpha * 0.18
        c.lineWidth = w * 3.2
        c.stroke()
        c.globalAlpha = a * alpha
        c.lineWidth = w
        c.stroke()
        c.globalAlpha = a
    }

    const fillPath = (c, path, col, alpha = 1) => {
        trace(c, path, 1)
        const a = c.globalAlpha
        c.globalAlpha = a * alpha
        c.fillStyle = col
        c.fill()
        c.globalAlpha = a
    }

    const text = (c, str, x, y, size, opts = {}) => {
        c.font = font(size, opts.weight || 500)
        c.textAlign = opts.align || 'left'
        c.textBaseline = opts.base || 'alphabetic'
        c.fillStyle = opts.col || INK
        const a = c.globalAlpha
        if (opts.alpha != null) c.globalAlpha = a * opts.alpha
        c.fillText(str, x, y)
        c.globalAlpha = a
    }

    const wrap = (c, str, maxW) => {
        const words = str.split(' ')
        const lines = []
        let line = ''
        for (const w of words) {
            const test = line ? line + ' ' + w : w
            if (c.measureText(test).width > maxW && line) {
                lines.push(line)
                line = w
            } else line = test
        }
        if (line) lines.push(line)
        return lines
    }

    /* type `str` into a box, `n` characters so far; returns height used */
    const typed = (c, str, n, x, y, maxW, size, lh, col = INK) => {
        c.font = font(size, 400)
        c.textAlign = 'left'
        c.textBaseline = 'alphabetic'
        c.fillStyle = col
        const lines = wrap(c, str, maxW)
        let left = n
        let yy = y
        for (const line of lines) {
            if (left <= 0) break
            c.fillText(line.slice(0, left), x, yy)
            left -= line.length + 1
            yy += lh
        }
        return lines.length * lh
    }

    /* soft radial glow (drawn on the low-res glow layer) */
    const glow = (g, x, y, r, col, alpha) => {
        if (alpha <= 0) return
        const grad = g.createRadialGradient(x, y, 0, x, y, r)
        grad.addColorStop(0, col)
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        const a = g.globalAlpha
        g.globalAlpha = a * alpha
        g.fillStyle = grad
        g.fillRect(x - r, y - r, r * 2, r * 2)
        g.globalAlpha = a
    }

    /* ---------- the frame ---------- */

    const F = {}
    let dpr = 1
    const GLOW_DIV = 6
    const glowCanvas = document.createElement('canvas')
    const gctx = glowCanvas.getContext('2d')
    const grain = document.createElement('canvas')
    let grainPattern = null

    const makeGrain = () => {
        grain.width = grain.height = 160
        const c = grain.getContext('2d')
        const img = c.createImageData(160, 160)
        const r = rng(7)
        for (let i = 0; i < img.data.length; i += 4) {
            const v = 128 + (r() - 0.5) * 255
            img.data[i] = img.data[i + 1] = img.data[i + 2] = v
            img.data[i + 3] = 255
        }
        c.putImageData(img, 0, 0)
        grainPattern = ctx.createPattern(grain, 'repeat')
    }

    const navH = () =>
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 48

    const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2)
        const w = window.innerWidth
        const h = window.innerHeight
        canvas.width = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
        canvas.style.width = w + 'px'
        canvas.style.height = h + 'px'
        glowCanvas.width = Math.ceil(canvas.width / GLOW_DIV)
        glowCanvas.height = Math.ceil(canvas.height / GLOW_DIV)
        const u = Math.min(w, h) / 1000
        F.u = u
        F.px = 1 / u
        F.W = w / u
        F.H = h / u
        F.cx = F.W / 2
        F.portrait = w < h
        F.narrow = w < 735
        F.top = (navH() + 12) / u
        const capH = F.portrait ? h * 0.4 : h * 0.3
        F.bot = (h - capH) / u
        F.ay = (F.top + F.bot) / 2
        F.ah = F.bot - F.top
        F.S = Math.min(F.ah, F.W * 0.92)
        F.scale = u * dpr
        if (!grainPattern) makeGrain()
    }

    /* ---------- chapters from the DOM ---------- */

    const chapterEls = Array.from(document.querySelectorAll('[data-ch]'))
    if (!chapterEls.length) return
    const N = chapterEls.length
    const chapters = chapterEls.map((el) => ({
        el,
        name: el.dataset.ch,
        top: 0,
        h: 0,
        g: 0,
        caps: Array.from(el.querySelectorAll('.cap')).map((cap) => {
            const [a, b] = (cap.dataset.at || '0 1').split(/\s+/).map(Number)
            return { el: cap, a, b, o: -1 }
        }),
    }))

    const measure = () => {
        const vh = window.innerHeight
        for (const ch of chapters) {
            const r = ch.el.getBoundingClientRect()
            ch.top = r.top + window.scrollY
            ch.h = r.height
            /* the share of the chapter spent handing over to the next one */
            ch.g = clamp(vh / ch.h, 0, 0.6)
        }
        chapters[N - 1].g = 0
    }

    /* raw playhead from the scroll position */
    const playhead = () => {
        const y = window.scrollY
        for (let i = N - 1; i >= 0; i--) {
            const ch = chapters[i]
            if (y >= ch.top || i === 0) {
                return i + clamp((y - ch.top) / ch.h, 0, 1)
            }
        }
        return 0
    }

    /* local progress and visibility of chapter i at playhead T */
    const local = (i, T) => {
        const ch = chapters[i]
        const prev = chapters[i - 1]
        const x = T - i
        const t = x <= 0 ? 0 : clamp(x / (1 - ch.g || 1))
        let v = 1
        if (x < 0) {
            v = prev ? smooth(1 + x / Math.max(prev.g, 1e-3)) : 0
        } else if (x > 1 - ch.g && ch.g > 0) {
            v = smooth((1 - x) / ch.g)
        }
        if (i === N - 1 && x >= 1) v = 1
        return { t, v }
    }

    /* ---------- shared drawings ---------- */

    const STARS = (() => {
        const r = rng(42)
        const out = []
        for (let i = 0; i < 260; i++) {
            out.push({
                x: r(),
                y: r() * 1.4,
                s: 0.6 + r() * 1.6,
                ph: r() * TAU,
                sp: 0.4 + r() * 1.2,
                b: 0.35 + r() * 0.65,
            })
        }
        return out
    })()

    const drawStars = (c, T, time, alpha) => {
        if (alpha <= 0) return
        const drift = T * 0.045
        c.fillStyle = INK
        for (const s of STARS) {
            const y = ((((s.y - drift) % 1.4) + 1.4) % 1.4) * F.H - 0.2 * F.H
            if (y < -10 || y > F.H + 10) continue
            const tw = 0.6 + 0.4 * Math.sin(time * s.sp + s.ph)
            c.globalAlpha = alpha * s.b * tw
            const sz = s.s * F.px * 1.4
            c.fillRect(s.x * F.W - sz / 2, y - sz / 2, sz, sz)
        }
        c.globalAlpha = 1
    }

    /* a modest skyline on the horizon, lit windows and all */
    const SKYLINE = (() => {
        const r = rng(9)
        const towers = []
        let x = -230
        while (x < 230) {
            const w = 14 + r() * 30
            const h = 14 + r() * (Math.abs(x) < 90 ? 70 : 34)
            const win = []
            for (let i = 0; i < Math.floor((w * h) / 90); i++) {
                win.push([r() * (w - 6) + 3, r() * (h - 8) + 4, r()])
            }
            towers.push({ x, w, h, win, cap: r() > 0.6 })
            x += w + 2 + r() * 10
        }
        return towers
    })()

    const drawGround = (c, g, yH, alpha, warm) => {
        if (alpha <= 0 || yH > F.H + 60) return
        const a = c.globalAlpha
        c.globalAlpha = a * alpha
        /* fields */
        c.fillStyle = '#060608'
        c.fillRect(0, yH, F.W, F.H - yH + 2)
        /* a few faint lines of snow fence running to the horizon */
        c.strokeStyle = INK
        c.lineWidth = F.px
        for (let i = 1; i <= 6; i++) {
            const k = i / 6
            const y = yH + Math.pow(k, 2.2) * (F.H - yH)
            c.globalAlpha = a * alpha * 0.05 * (1 - k * 0.4)
            c.beginPath()
            c.moveTo(0, y)
            c.lineTo(F.W, y)
            c.stroke()
        }
        /* skyline */
        const k = Math.min(1, F.W / 1600) * 0.9
        c.globalAlpha = a * alpha
        c.fillStyle = '#0c0c11'
        for (const tw of SKYLINE) {
            const x = F.cx + tw.x * k
            const h = tw.h * k
            c.fillRect(x, yH - h, tw.w * k, h + 1)
            if (tw.cap) c.fillRect(x + (tw.w * k) / 2 - 1, yH - h - 8 * k, 2, 8 * k)
        }
        c.fillStyle = warm ? 'rgb(255, 214, 160)' : 'rgb(255, 230, 190)'
        for (const tw of SKYLINE) {
            const x = F.cx + tw.x * k
            for (const [wx, wy, p] of tw.win) {
                if (p > 0.55) continue
                c.globalAlpha = a * alpha * (0.25 + p * 0.5)
                c.fillRect(x + wx * k, yH - tw.h * k + wy * k, 1.6, 1.6)
            }
        }
        /* horizon line */
        c.globalAlpha = a * alpha * 0.35
        c.strokeStyle = INK
        c.lineWidth = F.px
        c.beginPath()
        c.moveTo(0, yH + 0.5)
        c.lineTo(F.W, yH + 0.5)
        c.stroke()
        c.globalAlpha = a
    }

    /* ---------- scene 0 — night over the prairie ---------- */

    const AURORA = [
        ['rgba(110, 255, 182, 0.85)', 0],
        ['rgba(96, 214, 255, 0.75)', 0.09],
        ['rgba(186, 142, 255, 0.6)', 0.17],
    ]

    const horizon0 = (t) => F.H * 0.66 + smooth(span(t, 0.5, 1)) * F.H * 0.6

    const scene0 = {
        sky(c, g, t, v, time) {
            const yH = horizon0(t)
            /* a deep blue haze low in the sky, fading with the tilt */
            const grad = c.createLinearGradient(0, yH - F.H * 0.5, 0, yH)
            grad.addColorStop(0, 'rgba(10, 16, 36, 0)')
            grad.addColorStop(1, 'rgba(14, 24, 52, 0.75)')
            c.globalAlpha = v * (1 - smooth(span(t, 0.55, 0.95)))
            c.fillStyle = grad
            c.fillRect(0, yH - F.H * 0.5, F.W, F.H * 0.5)
            c.globalAlpha = 1
        },
        draw(c, g, t, v, time) {
            const yH = horizon0(t)
            const fade = 1 - smooth(span(t, 0.45, 0.92))
            /* aurora, on the glow layer so it comes out soft */
            if (fade > 0) {
                const cols = Math.ceil(F.W / 9)
                const step = F.W / cols
                g.globalAlpha = v * fade
                for (let i = 0; i <= cols; i++) {
                    const x = i * step
                    for (let r = 0; r < AURORA.length; r++) {
                        const [col, off] = AURORA[r]
                        const nx = x * 0.0022 + r * 17
                        const base =
                            yH - F.H * (0.14 + off) - (noise(nx + time * 0.025) - 0.5) * F.H * 0.16
                        const hgt = F.H * (0.12 + 0.18 * noise(nx * 1.7 + 40 + time * 0.03))
                        const str = 0.25 + 0.75 * noise(nx * 2.6 + 90 + time * 0.06)
                        const grad = g.createLinearGradient(0, base, 0, base - hgt)
                        grad.addColorStop(0, col)
                        grad.addColorStop(0.35, col.replace(/[\d.]+\)$/, '0.32)'))
                        grad.addColorStop(1, 'rgba(0,0,0,0)')
                        g.fillStyle = grad
                        g.globalAlpha = v * fade * str * 0.55
                        g.fillRect(x - step * 0.6, base - hgt, step * 1.3, hgt)
                    }
                }
                g.globalAlpha = 1
                /* a faint glow where the aurora meets the ground */
                glow(g, F.cx, yH, F.W * 0.5, 'rgba(90, 200, 170, 0.5)', v * fade * 0.35)
            }
            drawGround(c, g, yH, v, false)
            /* a pair of head lamps crawling along the horizon road */
            const carX = ((time * 0.012) % 1.3) * F.W - F.W * 0.15
            c.globalAlpha = v * 0.7 * (1 - smooth(span(t, 0.4, 0.6)))
            c.fillStyle = 'rgb(255, 236, 200)'
            c.fillRect(carX, yH - 1.5, 2.2, 1.6)
            c.fillRect(carX + 4, yH - 1.5, 2.2, 1.6)
            c.globalAlpha = 1
        },
    }

    /* ---------- scene 1 — three disciplines ---------- */

    const PHONE = (() => {
        const frame = new Path()
        frame.rr(0, 0, 220, 440, 36)
        frame.rr(10, 10, 200, 420, 28)
        frame.rr(80, 24, 60, 16, 8)
        frame.line(219, 110, 219, 150)
        frame.line(0, 100, 0, 128)
        frame.line(0, 140, 0, 168)
        const ui = new Path()
        ui.rr(26, 96, 168, 74, 14)
        ui.line(42, 118, 110, 118)
        ui.line(42, 136, 150, 136)
        ui.line(42, 152, 128, 152)
        for (let i = 0; i < 3; i++) {
            const y = 194 + i * 56
            ui.rr(26, y, 168, 44, 10)
            ui.circle(50, y + 22, 10)
            ui.line(72, y + 16, 150, y + 16)
            ui.line(72, y + 30, 120, y + 30)
        }
        ui.circle(170, 386, 22)
        ui.line(170, 376, 170, 396)
        ui.line(160, 386, 180, 386)
        ui.line(10, 408, 210, 408)
        ui.circle(60, 420, 4)
        ui.circle(110, 420, 4)
        ui.circle(160, 420, 4)
        return { frame, ui, w: 220, h: 440 }
    })()

    const BROWSER = (() => {
        const frame = new Path()
        frame.rr(0, 0, 480, 330, 16)
        frame.line(0, 40, 480, 40)
        frame.circle(20, 20, 5)
        frame.circle(38, 20, 5)
        frame.circle(56, 20, 5)
        frame.rr(90, 8, 150, 24, 8)
        frame.rr(16, 50, 448, 24, 12)
        const ui = new Path()
        ui.rr(32, 92, 416, 88, 12)
        ui.line(52, 118, 200, 118)
        ui.line(52, 138, 260, 138)
        ui.rr(52, 150, 70, 18, 9)
        ui.rr(32, 194, 200, 110, 12)
        ui.rr(250, 194, 198, 110, 12)
        ui.line(50, 218, 150, 218)
        ui.line(50, 236, 190, 236)
        ui.line(50, 254, 170, 254)
        ui.line(50, 272, 120, 272)
        ui.line(268, 214, 330, 214)
        return { frame, ui, w: 480, h: 330 }
    })()

    const SERVER = (() => {
        const frame = new Path()
        frame.rr(0, 0, 260, 420, 12)
        const ui = new Path()
        for (let i = 0; i < 6; i++) {
            const y = 18 + i * 66
            ui.rr(14, y, 232, 54, 7)
            ui.rr(24, y + 12, 10, 30, 3)
            for (let k = 0; k < 7; k++) ui.line(52 + k * 14, y + 14, 52 + k * 14, y + 40)
            ui.line(160, y + 27, 196, y + 27)
        }
        const cloud = new Path()
        cloud.m(40, 60).c(10, 60, 10, 20, 44, 22).c(52, -8, 100, -8, 110, 18).c(150, 8, 170, 50, 136, 60).z()
        return { frame, ui, cloud, w: 260, h: 420 }
    })()

    const drawDevice = (c, g, d, x, y, k, p, live, time, hue) => {
        if (p <= 0) return
        c.save()
        c.translate(x - (d.w * k) / 2, y - (d.h * k) / 2)
        c.scale(k, k)
        const w = (1.25 * F.px) / k
        ink(c, d.frame, span(p, 0, 0.45), w)
        ink(c, d.ui, span(p, 0.3, 1), w * 0.9, INK, 0.8)
        if (d === PHONE) {
            if (p > 0.6) {
                text(c, '9:41', 30, 36, 11, { weight: 600, alpha: span(p, 0.6, 0.8) })
                text(c, 'Driving Test', 26, 78, 15, { weight: 600, alpha: span(p, 0.6, 0.8) })
            }
            if (live > 0) {
                c.globalAlpha = live
                c.fillStyle = ACCENT
                c.beginPath()
                c.arc(170, 386, 22, 0, TAU)
                c.fill()
                c.strokeStyle = '#fff'
                c.lineWidth = 2.4
                c.beginPath()
                c.moveTo(170, 376)
                c.lineTo(170, 396)
                c.moveTo(160, 386)
                c.lineTo(180, 386)
                c.stroke()
                c.globalAlpha = 1
                glow(g, x, y + 166 * k, 70 * k, 'rgba(41, 151, 255, 0.8)', live * 0.6)
            }
        } else if (d === BROWSER) {
            if (p > 0.5) text(c, 'sarria.ca', 34, 67, 12, { alpha: span(p, 0.5, 0.7), col: INK_DIM })
            if (live > 0) {
                /* a sparkline drawing itself in the right card */
                const sp = new Path()
                for (let i = 0; i <= 24; i++) {
                    const xx = 268 + i * 6.8
                    const yy = 288 - (0.5 + 0.5 * Math.sin(i * 0.55 + 1) * Math.sin(i * 0.21)) * 48 - i * 0.6
                    i ? sp.l(xx, yy) : sp.m(xx, yy)
                }
                ink(c, sp, live, w * 1.4, ACCENT)
                c.globalAlpha = live
                c.fillStyle = ACCENT
                trace(c, (() => new Path().rr(52, 150, 70, 18, 9))(), 1)
                c.fill()
                c.globalAlpha = 1
            }
        } else {
            if (live > 0 || p > 0.8) {
                const a = span(p, 0.8, 1)
                for (let i = 0; i < 6; i++) {
                    const y = 18 + i * 66
                    for (let j = 0; j < 2; j++) {
                        const on = hash(i * 7 + j * 3 + Math.floor(time * (1.5 + j))) > 0.45
                        c.globalAlpha = a * (on ? 0.95 : 0.25)
                        c.fillStyle = j ? ACCENT : 'rgb(110, 240, 160)'
                        c.beginPath()
                        c.arc(214 + j * 14, y + 27, 3.2, 0, TAU)
                        c.fill()
                    }
                }
                c.globalAlpha = 1
            }
            if (live > 0) {
                c.save()
                c.translate(130 - 80, -150)
                ink(c, d.cloud, live, w)
                c.restore()
                c.globalAlpha = live
                c.setLineDash([6, 8])
                c.lineDashOffset = -time * 40
                c.strokeStyle = ACCENT
                c.lineWidth = w * 1.2
                c.beginPath()
                c.moveTo(130, -88)
                c.lineTo(130, -4)
                c.stroke()
                c.setLineDash([])
                c.globalAlpha = 1
            }
        }
        c.restore()
    }

    const scene1 = {
        draw(c, g, t, v, time) {
            const devices = [PHONE, BROWSER, SERVER]
            let pos
            let k
            if (F.portrait) {
                k = Math.min(0.8, F.W / 1150, F.ah / 1500)
                pos = [
                    [F.cx - 260 * k, F.ay - 450 * k],
                    [F.cx + 90 * k, F.ay + 20 * k],
                    [F.cx - 230 * k, F.ay + 470 * k],
                ]
            } else {
                const sp = Math.min(F.W * 0.3, 500)
                k = Math.min(1.2, F.ah / 560, sp / 430)
                pos = [
                    [F.cx - sp, F.ay],
                    [F.cx, F.ay],
                    [F.cx + sp, F.ay],
                ]
            }
            devices.forEach((d, i) => {
                const start = i * 0.28
                const p = easeOut(span(t, start, start + 0.24))
                const live = span(t, start + 0.22, start + 0.34)
                /* each device floats a little, in its own rhythm */
                const bob = Math.sin(time * 0.6 + i * 2.1) * 4 * k
                drawDevice(c, g, d, pos[i][0], pos[i][1] + bob, k, p, live, time)
            })
        },
    }

    /* ---------- scene 2 — the stack as a constellation ---------- */

    const NODES = [
        ['Flutter', -0.78, -0.42, 'MOBILE'],
        ['Dart', -0.96, 0.02],
        ['Android', -0.5, -0.78],
        ['Compose', -0.16, -0.5],
        ['Kotlin', -0.3, -0.04],
        ['Spring', -0.56, 0.42, 'BACKEND'],
        ['Java', -0.16, 0.72],
        ['React', 0.56, -0.5, 'WEB'],
        ['TypeScript', 0.9, 0.04],
        ['Python', 0.46, 0.62, 'DATA · AI'],
    ]
    const EDGES = [
        [0, 1],
        [0, 2],
        [2, 4],
        [4, 3],
        [3, 2],
        [4, 5],
        [5, 6],
        [6, 2],
        [7, 8],
        [8, 9],
        [5, 7],
        [6, 9],
    ]

    const scene2 = {
        draw(c, g, t, v, time) {
            const R = F.portrait ? Math.min(F.W * 0.4, F.ah * 0.3) : F.S * 0.44
            const ry = F.portrait ? R * 1.45 : R * 0.92
            const rot = (t - 0.5) * 0.1 + Math.sin(time * 0.05) * 0.02
            const cs = Math.cos(rot)
            const sn = Math.sin(rot)
            const pts = NODES.map(([, x, y]) => {
                const px = x * R
                const py = y * ry
                return [F.cx + px * cs - py * sn, F.ay + px * sn + py * cs]
            })
            const at = (i) => 0.04 + i * 0.05
            /* edges */
            for (const [a, b] of EDGES) {
                const p = span(t, Math.max(at(a), at(b)) + 0.03, Math.max(at(a), at(b)) + 0.14)
                if (p <= 0) continue
                const path = new Path().line(pts[a][0], pts[a][1], pts[b][0], pts[b][1])
                ink(c, path, easeOut(p), F.px, INK, 0.35)
            }
            /* nodes */
            const lab = Math.max(12, Math.min(15, F.W / 90)) * F.px
            NODES.forEach(([name, , , group], i) => {
                const p = span(t, at(i), at(i) + 0.09)
                if (p <= 0) return
                const [x, y] = pts[i]
                const pop = 1 + Math.sin(easeOut(p) * Math.PI) * 0.6
                const r = (3.2 + hash(i) * 1.6) * F.px * pop
                c.globalAlpha = v * easeOut(p)
                c.fillStyle = INK
                c.beginPath()
                c.arc(x, y, r, 0, TAU)
                c.fill()
                glow(g, x, y, 60 * F.px, 'rgba(120, 180, 255, 0.9)', v * easeOut(p) * 0.6)
                const yoff = NODES[i][2] > 0.3 ? 22 * F.px + r : -(12 * F.px + r)
                text(c, name, x, y + yoff, lab, {
                    align: 'center',
                    alpha: span(p, 0.5, 1),
                    weight: 500,
                })
                if (group) {
                    const gp = span(t, 0.68, 0.82)
                    const gy = NODES[i][2] > 0.3 ? yoff + lab * 1.5 : yoff - lab * 1.3
                    text(c, group, x, y + gy, lab * 0.72, {
                        align: 'center',
                        alpha: gp * 0.7,
                        weight: 600,
                        col: ACCENT,
                    })
                }
                c.globalAlpha = v
            })
        },
    }

    /* ---------- scene 3 — the driving test app ---------- */

    const drawRoad = (c, t, alpha, vpY) => {
        if (alpha <= 0) return
        const a = c.globalAlpha
        c.globalAlpha = a * alpha
        const bottom = F.H
        const grad = c.createLinearGradient(0, vpY, 0, bottom)
        grad.addColorStop(0, 'rgba(255,255,255,0)')
        grad.addColorStop(1, 'rgba(255,255,255,0.05)')
        c.fillStyle = grad
        c.fillRect(0, vpY, F.W, bottom - vpY)
        c.strokeStyle = INK
        c.lineCap = 'butt'
        /* edges */
        c.lineWidth = F.px
        c.globalAlpha = a * alpha * 0.4
        c.beginPath()
        c.moveTo(F.cx, vpY)
        c.lineTo(F.cx - F.W * 0.9, bottom)
        c.moveTo(F.cx, vpY)
        c.lineTo(F.cx + F.W * 0.9, bottom)
        c.stroke()
        /* centre line, streaming toward the camera as you scroll */
        c.globalAlpha = a * alpha * 0.8
        const n = 9
        const off = (t * 10) % 1
        for (let i = 0; i < n; i++) {
            const z0 = (i + off) / n
            const z1 = z0 + 0.4 / n
            const y0 = vpY + Math.pow(z0, 2.4) * (bottom - vpY)
            const y1 = vpY + Math.pow(z1, 2.4) * (bottom - vpY)
            c.lineWidth = 1 + Math.pow(z0, 2) * 6 * F.px
            c.beginPath()
            c.moveTo(F.cx, y0)
            c.lineTo(F.cx, y1)
            c.stroke()
        }
        c.globalAlpha = a
    }

    const PHONE_FRAME = new Path().rr(0, 0, 220, 440, 36)
    const PHONE_ISLAND = new Path().rr(80, 24, 60, 16, 8)

    /* draw a 220×440 phone at (x, y) scaled by k and run `screen` inside it */
    const drawPhone = (c, x, y, k, p, screen) => {
        c.save()
        c.translate(x - 110 * k, y - 220 * k)
        c.scale(k, k)
        const w = (1.25 * F.px) / k
        ink(c, PHONE_FRAME, p, w)
        if (p >= 1) {
            c.save()
            c.beginPath()
            c.roundRect(10, 10, 200, 420, 28)
            c.clip()
            c.fillStyle = '#050507'
            c.fillRect(10, 10, 200, 420)
            c.fillStyle = 'rgba(255,255,255,0.03)'
            c.fillRect(10, 10, 200, 420)
            screen(c, w)
            c.restore()
            ink(c, PHONE_ISLAND, 1, w, INK, 0.7)
            fillPath(c, PHONE_ISLAND, '#000')
        }
        c.restore()
    }

    const appBar = (c, title, w, accent, hue) => {
        text(c, '9:41', 30, 36, 11, { weight: 600 })
        text(c, title, 26, 80, 16, { weight: 600 })
        c.strokeStyle = accent
        c.lineWidth = w * 1.6
        c.beginPath()
        c.moveTo(26, 88)
        c.lineTo(50, 88)
        c.stroke()
    }

    const field = (c, y, label, value, w, accent, active) => {
        c.strokeStyle = active ? accent : INK_DIM
        c.lineWidth = w * (active ? 1.6 : 1)
        c.beginPath()
        c.roundRect(26, y, 168, 40, 10)
        c.stroke()
        text(c, label, 38, y - 6, 9, { col: INK_DIM, weight: 500 })
        text(c, value, 38, y + 25, 12, { col: INK })
    }

    const button = (c, y, label, accent) => {
        c.fillStyle = accent
        c.beginPath()
        c.roundRect(26, y, 168, 40, 20)
        c.fill()
        text(c, label, 110, y + 25, 13, { align: 'center', col: '#fff', weight: 600 })
    }

    const STOP = (() => {
        const p = new Path()
        for (let i = 0; i <= 8; i++) {
            const a = -Math.PI / 2 + Math.PI / 8 + (i * TAU) / 8
            i ? p.l(Math.cos(a) * 26, Math.sin(a) * 26) : p.m(Math.cos(a) * 26, Math.sin(a) * 26)
        }
        return p
    })()

    const screens = [
        /* 01 — Firebase sign in, then the verification mail */
        (c, w, s, accent) => {
            appBar(c, 'Welcome back', w, accent)
            const typedN = Math.floor(span(s, 0.05, 0.4) * 18)
            const mail = 'qi@sarria.ca'
            field(c, 130, 'Email', mail.slice(0, Math.min(typedN, mail.length)), w, accent, typedN < mail.length)
            const pw = '•'.repeat(Math.max(0, typedN - mail.length))
            field(c, 192, 'Password', pw, w, accent, typedN >= mail.length && s < 0.5)
            if (s < 0.5 && Math.sin(s * 60) > 0 && typedN < 18) {
                const cx = typedN < mail.length ? 38 + c.measureText(mail.slice(0, typedN)).width : 38 + pw.length * 7
                c.fillStyle = accent
                c.fillRect(cx + 1, typedN < mail.length ? 142 : 204, 1.4, 20)
            }
            button(c, 254, 'Sign in', accent)
            text(c, 'Continue with Google', 110, 324, 12, { align: 'center', col: INK_DIM })
            /* verification card slides up */
            const k = easeOut(span(s, 0.52, 0.8))
            if (k > 0) {
                c.save()
                c.translate(0, (1 - k) * 60)
                c.globalAlpha *= k
                c.fillStyle = '#0b0b0d'
                c.beginPath()
                c.roundRect(14, 300, 192, 130, 18)
                c.fill()
                c.strokeStyle = INK_DIM
                c.lineWidth = w
                c.stroke()
                /* envelope */
                const mailIcon = new Path().rr(84, 318, 52, 36, 5).m(84, 322).l(110, 342).l(136, 322)
                ink(c, mailIcon, span(s, 0.6, 0.85), w)
                const chk = span(s, 0.82, 1)
                if (chk > 0) {
                    c.fillStyle = accent
                    c.beginPath()
                    c.arc(130, 322, 10, 0, TAU)
                    c.fill()
                    ink(c, new Path().m(125, 322).l(129, 326).l(136, 318), chk, w * 1.6, '#fff')
                }
                text(c, 'Check your inbox', 110, 380, 13, { align: 'center', weight: 600 })
                text(c, 'We sent a link to qi@sarria.ca', 110, 400, 10, { align: 'center', col: INK_DIM })
                c.restore()
            }
        },
        /* 02 — a question, answered */
        (c, w, s, accent) => {
            appBar(c, 'Question 12 of 40', w, accent)
            /* progress */
            c.strokeStyle = INK_DIM
            c.lineWidth = w * 2
            c.beginPath()
            c.moveTo(26, 100)
            c.lineTo(194, 100)
            c.stroke()
            c.strokeStyle = accent
            c.beginPath()
            c.moveTo(26, 100)
            c.lineTo(26 + 168 * (0.28 + 0.02 * s), 100)
            c.stroke()
            /* sign card */
            c.strokeStyle = INK_DIM
            c.lineWidth = w
            c.beginPath()
            c.roundRect(26, 116, 168, 96, 14)
            c.stroke()
            c.save()
            c.translate(62, 164)
            fillPath(c, STOP, '#d23b3b', 0.9)
            ink(c, STOP, 1, w * 1.4, '#fff')
            text(c, 'STOP', 0, 4, 10, { align: 'center', col: '#fff', weight: 700 })
            c.restore()
            text(c, 'What must you do', 104, 150, 11, { weight: 600 })
            text(c, 'at this sign?', 104, 166, 11, { weight: 600 })
            text(c, 'Road signs · Regulatory', 104, 190, 9, { col: INK_DIM })
            const opts = ['Slow down and proceed', 'Come to a complete stop', 'Stop only if traffic', 'Yield to the right']
            const picked = s > 0.45
            opts.forEach((o, i) => {
                const y = 226 + i * 46
                const right = i === 1
                c.lineWidth = w
                c.strokeStyle = picked && right ? 'rgb(84, 214, 132)' : INK_DIM
                c.beginPath()
                c.roundRect(26, y, 168, 36, 10)
                if (picked && right) {
                    c.fillStyle = 'rgba(84, 214, 132, 0.15)'
                    c.fill()
                }
                c.stroke()
                c.beginPath()
                c.arc(44, y + 18, 6, 0, TAU)
                c.stroke()
                if (picked && right) {
                    c.fillStyle = 'rgb(84, 214, 132)'
                    c.fill()
                    ink(c, new Path().m(40, y + 18).l(43, y + 21).l(49, y + 14), span(s, 0.45, 0.6), w * 1.4, '#fff')
                }
                text(c, o, 58, y + 22, 10.5, { col: picked && right ? INK : INK_DIM })
            })
            const pill = easeOut(span(s, 0.62, 0.8))
            if (pill > 0) {
                c.globalAlpha *= pill
                c.fillStyle = 'rgb(84, 214, 132)'
                c.beginPath()
                c.roundRect(60, 408 - (1 - pill) * 10, 100, 24, 12)
                c.fill()
                text(c, 'Correct!', 110, 424 - (1 - pill) * 10, 11, { align: 'center', col: '#06220f', weight: 700 })
                c.globalAlpha /= pill
            }
        },
        /* 03 — dynamic colour */
        (c, w, s, accent, hue) => {
            appBar(c, 'Appearance', w, accent)
            /* wheel */
            const cx = 110
            const cy = 170
            const R = 54
            for (let i = 0; i < 48; i++) {
                const a0 = (i / 48) * TAU - Math.PI / 2
                const a1 = ((i + 1.2) / 48) * TAU - Math.PI / 2
                c.strokeStyle = `hsl(${(i / 48) * 360} 80% 60%)`
                c.lineWidth = 14
                c.beginPath()
                c.arc(cx, cy, R, a0, a1)
                c.stroke()
            }
            const ang = (hue / 360) * TAU - Math.PI / 2
            c.fillStyle = '#fff'
            c.beginPath()
            c.arc(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R, 9, 0, TAU)
            c.fill()
            c.fillStyle = accent
            c.beginPath()
            c.arc(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R, 6, 0, TAU)
            c.fill()
            c.fillStyle = accent
            c.beginPath()
            c.arc(cx, cy, 26, 0, TAU)
            c.fill()
            text(c, 'Pick a colour', 110, 258, 12, { align: 'center', weight: 600 })
            text(c, 'The whole app follows.', 110, 274, 10, { align: 'center', col: INK_DIM })
            /* preview tiles */
            const tiles = [
                [26, 292, 80, 54],
                [114, 292, 80, 54],
                [26, 354, 168, 44],
            ]
            tiles.forEach(([x, y, tw, th], i) => {
                c.fillStyle = i === 2 ? accent : `hsl(${hue} 60% ${i ? 22 : 34}%)`
                c.beginPath()
                c.roundRect(x, y, tw, th, 10)
                c.fill()
                c.strokeStyle = 'rgba(255,255,255,0.35)'
                c.lineWidth = w
                c.beginPath()
                c.moveTo(x + 12, y + 18)
                c.lineTo(x + tw * 0.55, y + 18)
                c.moveTo(x + 12, y + 30)
                c.lineTo(x + tw * 0.4, y + 30)
                c.stroke()
            })
            text(c, 'Start a test', 110, 381, 12, { align: 'center', col: '#fff', weight: 600 })
        },
        /* 04 — history */
        (c, w, s, accent) => {
            appBar(c, 'History', w, accent)
            const scores = [62, 70, 68, 78, 84, 82, 90, 94]
            const bx = 30
            const bw = 16
            const base = 250
            const k = easeOut(span(s, 0.05, 0.6))
            c.strokeStyle = INK_DIM
            c.lineWidth = w
            c.beginPath()
            c.moveTo(26, base + 0.5)
            c.lineTo(194, base + 0.5)
            c.stroke()
            scores.forEach((v, i) => {
                const h = (v / 100) * 120 * Math.min(1, k * scores.length - i)
                if (h <= 0) return
                c.fillStyle = i === scores.length - 1 ? accent : 'rgba(245,241,234,0.28)'
                c.beginPath()
                c.roundRect(bx + i * (bw + 4.6), base - h, bw, h, 4)
                c.fill()
            })
            const shown = Math.round(94 * k)
            text(c, `${shown}%`, 26, 136, 34, { weight: 700 })
            text(c, 'Best score · this week', 26, 154, 10, { col: INK_DIM })
            /* list */
            const rows = [
                ['Today', '94%', 'Pass'],
                ['Yesterday', '90%', 'Pass'],
                ['Tuesday', '82%', 'Pass'],
                ['Monday', '68%', 'Retry'],
            ]
            rows.forEach(([d, sc, r], i) => {
                const y = 282 + i * 36
                const a = span(s, 0.4 + i * 0.1, 0.55 + i * 0.1)
                if (a <= 0) return
                c.globalAlpha *= a
                text(c, d, 26, y + 16, 11)
                text(c, sc, 150, y + 16, 11, { align: 'right', col: INK_DIM })
                c.fillStyle = r === 'Pass' ? 'rgb(84, 214, 132)' : 'rgb(255, 160, 80)'
                c.beginPath()
                c.arc(186, y + 12, 3.5, 0, TAU)
                c.fill()
                c.strokeStyle = 'rgba(245,241,234,0.1)'
                c.beginPath()
                c.moveTo(26, y + 30)
                c.lineTo(194, y + 30)
                c.stroke()
                c.globalAlpha /= a
            })
        },
    ]

    const scene3 = {
        draw(c, g, t, v, time) {
            const k = Math.min(F.ah * 0.9, F.S * 1.1) / 440
            drawRoad(c, t, v * 0.5 * span(t, 0, 0.12), F.ay + 40 * k)
            const steps = screens.length
            const u = t * steps
            const idx = Math.min(steps - 1, Math.floor(u))
            const s = clamp(u - idx)
            const hue = idx === 2 ? (211 + 360 * easeInOut(s)) % 360 : 211
            const accent = `hsl(${hue} 100% 58%)`
            const sway = Math.sin(time * 0.5) * 0.012
            c.save()
            c.translate(F.cx, F.ay)
            c.rotate(sway)
            c.translate(-F.cx, -F.ay)
            drawPhone(c, F.cx, F.ay, k, easeOut(span(t, 0, 0.1)), (cc, w) => {
                /* cross-fade between screens at the boundaries */
                const out = idx === steps - 1 ? 1 : 1 - span(s, 0.94, 1)
                const fade = idx === 0 ? out : Math.min(span(s, 0, 0.08), out)
                cc.globalAlpha *= fade
                screens[idx](cc, w, s, accent, hue)
            })
            c.restore()
            glow(g, F.cx, F.ay, 320 * k, `hsla(${hue} 100% 60% / 0.5)`, v * 0.35 * span(t, 0, 0.12))
        },
    }

    /* ---------- scene 4 — the chatbot ---------- */

    const drawBowl = (c, x, y, k, time) => {
        c.save()
        c.translate(x, y)
        c.scale(k, k)
        const w = 1.4
        /* steam */
        for (let i = 0; i < 3; i++) {
            const p = new Path()
            const sx = -16 + i * 16
            p.m(sx, -22)
            for (let j = 1; j <= 5; j++) {
                p.l(sx + Math.sin(time * 2 + j * 1.4 + i) * 4, -22 - j * 6)
            }
            ink(c, p, 1, w, INK, 0.25 + 0.15 * Math.sin(time * 1.3 + i))
        }
        /* bowl */
        const bowl = new Path()
        bowl.m(-46, -10).c(-46, 24, -24, 36, 0, 36).c(24, 36, 46, 24, 46, -10)
        bowl.m(-52, -10).c(-52, -16, 52, -16, 52, -10).c(52, -4, -52, -4, -52, -10)
        bowl.m(-14, 36).l(-14, 44).l(14, 44).l(14, 36)
        ink(c, bowl, 1, w)
        /* noodles */
        const nd = new Path()
        for (let i = 0; i < 4; i++) {
            nd.m(-36 + i * 8, -12)
            nd.c(-30 + i * 10, -6, -38 + i * 12, 0, -28 + i * 14, -8)
        }
        ink(c, nd, 1, w * 0.9, 'rgb(255, 214, 140)', 0.9)
        /* egg */
        c.fillStyle = 'rgb(250, 246, 236)'
        c.beginPath()
        c.ellipse(22, -13, 13, 8, -0.3, 0, TAU)
        c.fill()
        c.fillStyle = 'rgb(255, 170, 60)'
        c.beginPath()
        c.ellipse(24, -13, 6, 4, -0.3, 0, TAU)
        c.fill()
        /* spring onion */
        c.fillStyle = 'rgb(120, 220, 130)'
        for (let i = 0; i < 5; i++) {
            c.beginPath()
            c.arc(-10 + i * 7, -16 + (i % 2) * 4, 1.6, 0, TAU)
            c.fill()
        }
        /* chopsticks */
        ink(c, new Path().m(-30, -58).l(10, -8).m(-20, -60).l(14, -10), 1, w * 1.1, 'rgb(205, 170, 120)')
        c.restore()
    }

    const drawSun = (c, x, y, r, time, col = 'rgb(255, 196, 80)') => {
        c.fillStyle = col
        c.beginPath()
        c.arc(x, y, r, 0, TAU)
        c.fill()
        c.strokeStyle = col
        c.lineWidth = r * 0.22
        c.lineCap = 'round'
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * TAU + time * 0.3
            c.beginPath()
            c.moveTo(x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * 1.5)
            c.lineTo(x + Math.cos(a) * r * 1.95, y + Math.sin(a) * r * 1.95)
            c.stroke()
        }
    }

    const bubble = (c, x, y, w, h, side, accent) => {
        c.beginPath()
        c.roundRect(x, y, w, h, 16)
        if (side === 'user') {
            c.fillStyle = accent
            c.fill()
        } else if (side === 'tool') {
            c.fillStyle = 'rgba(255,255,255,0.06)'
            c.fill()
        } else {
            c.fillStyle = 'rgba(255,255,255,0.04)'
            c.fill()
            c.strokeStyle = 'rgba(245,241,234,0.22)'
            c.lineWidth = 1
            c.stroke()
        }
    }

    const CHAT = [
        {
            user: 'What is in this?',
            image: true,
            tool: 'Analysing image',
            ai: 'It looks like a bowl of noodle soup with sliced pork, a soft-boiled egg and spring onion. Want a recipe, or an estimate of the calories?',
        },
        {
            user: 'Search for the latest news in Winnipeg',
            tool: 'Searching the web',
            ai: 'Here is what is making news in Winnipeg today: floodwaters receding in the southeast, and Habitat for Humanity breaking ground on homes for 15 families.',
            source: 'CBC Manitoba',
        },
        {
            user: 'Tell me the weather in Winnipeg',
            tool: 'Fetching forecast',
            ai: 'Sunny all week.',
            weather: true,
        },
    ]

    const scene4 = {
        draw(c, g, t, v, time) {
            const W = Math.min(F.W * 0.9, 680 * F.px * 0.9)
            const H = Math.min(F.ah * 0.94, 600 * F.px)
            const x0 = F.cx - W / 2
            const y0 = F.ay - H / 2
            /* type scale: pixel-sized, so the chat reads the same on a phone */
            const k = Math.max(0.8, Math.min(1.25, (W * F.u) / 560)) * F.px * 0.9
            const appear = easeOut(span(t, 0, 0.1))
            c.save()
            c.translate(F.cx, F.ay)
            c.scale(0.96 + 0.04 * appear, 0.96 + 0.04 * appear)
            c.translate(-F.cx, -F.ay)
            c.globalAlpha = v * appear
            /* window */
            c.fillStyle = 'rgba(8, 8, 10, 0.72)'
            c.beginPath()
            c.roundRect(x0, y0, W, H, 22)
            c.fill()
            c.strokeStyle = 'rgba(245,241,234,0.22)'
            c.lineWidth = F.px
            c.stroke()
            const bar = 44 * k
            c.beginPath()
            c.moveTo(x0, y0 + bar)
            c.lineTo(x0 + W, y0 + bar)
            c.stroke()
            for (let i = 0; i < 3; i++) {
                c.fillStyle = 'rgba(245,241,234,0.3)'
                c.beginPath()
                c.arc(x0 + 22 * k + i * 18 * k, y0 + bar / 2, 5 * k, 0, TAU)
                c.fill()
            }
            text(c, 'chat.sarria.ca', x0 + W / 2, y0 + bar / 2 + 4 * k, 12 * k, { align: 'center', col: INK_DIM })
            /* input */
            const inH = 44 * k
            c.strokeStyle = 'rgba(245,241,234,0.22)'
            c.beginPath()
            c.roundRect(x0 + 16 * k, y0 + H - inH - 16 * k, W - 32 * k, inH, inH / 2)
            c.stroke()
            text(c, 'Message', x0 + 36 * k, y0 + H - inH / 2 - 16 * k + 5 * k, 13 * k, { col: INK_DIM })
            c.fillStyle = INK
            c.beginPath()
            c.arc(x0 + W - 16 * k - inH / 2, y0 + H - 16 * k - inH / 2, 14 * k, 0, TAU)
            c.fill()
            ink(
                c,
                new Path()
                    .m(x0 + W - 16 * k - inH / 2, y0 + H - 16 * k - inH / 2 + 6 * k)
                    .l(x0 + W - 16 * k - inH / 2, y0 + H - 16 * k - inH / 2 - 6 * k)
                    .m(x0 + W - 16 * k - inH / 2 - 5 * k, y0 + H - 16 * k - inH / 2 - 1 * k)
                    .l(x0 + W - 16 * k - inH / 2, y0 + H - 16 * k - inH / 2 - 6 * k)
                    .l(x0 + W - 16 * k - inH / 2 + 5 * k, y0 + H - 16 * k - inH / 2 - 1 * k),
                1,
                2 * k,
                '#000'
            )
            /* conversation */
            const steps = CHAT.length
            const u = t * steps
            const idx = Math.min(steps - 1, Math.floor(u))
            const s = clamp(u - idx)
            const conv = CHAT[idx]
            const fade = idx === 0 ? 1 - span(s, 0.94, 1) : Math.min(span(s, 0, 0.08), 1 - span(s, 0.94, 1))
            c.save()
            c.beginPath()
            c.rect(x0, y0 + bar + 1, W, H - bar - inH - 24 * k)
            c.clip()
            c.globalAlpha *= fade
            const pad = 18 * k
            const maxW = W * 0.68
            let y = y0 + bar + 22 * k
            const fs = 14 * k
            const lh = 20 * k
            /* user */
            {
                const a = easeOut(span(s, 0, 0.12))
                c.font = font(fs, 400)
                const lines = wrap(c, conv.user, maxW - 2 * pad)
                const tw = Math.max(...lines.map((l) => c.measureText(l).width))
                const imgH = conv.image ? 120 * k : 0
                const bw = Math.max(tw, conv.image ? 190 * k : 0) + 2 * pad
                const bh = lines.length * lh + 1.6 * pad + imgH
                c.save()
                c.globalAlpha *= a
                c.translate((1 - a) * 20 * k, 0)
                bubble(c, x0 + W - pad - bw, y, bw, bh, 'user', ACCENT)
                if (conv.image) {
                    c.fillStyle = 'rgba(0,0,0,0.25)'
                    c.beginPath()
                    c.roundRect(x0 + W - pad - bw + pad * 0.6, y + pad * 0.6, bw - pad * 1.2, imgH, 10)
                    c.fill()
                    drawBowl(c, x0 + W - pad - bw / 2, y + pad * 0.6 + imgH * 0.56, k * 0.95, time)
                }
                lines.forEach((l, i) => text(c, l, x0 + W - pad - bw + pad, y + imgH + pad * 0.85 + fs + i * lh, fs, { col: '#fff', weight: 400 }))
                c.restore()
                y += bh + 14 * k
            }
            /* tool */
            {
                const a = easeOut(span(s, 0.14, 0.26))
                if (a > 0) {
                    c.save()
                    c.globalAlpha *= a * (1 - 0.5 * span(s, 0.4, 0.5))
                    c.font = font(fs * 0.9, 500)
                    const tw = c.measureText(conv.tool).width
                    const bh = 34 * k
                    bubble(c, x0 + pad, y, tw + 2 * pad + 18 * k, bh, 'tool')
                    /* spinner */
                    c.strokeStyle = ACCENT
                    c.lineWidth = 2 * k
                    c.beginPath()
                    c.arc(x0 + pad + 16 * k, y + bh / 2, 6 * k, time * 5, time * 5 + 4.2)
                    c.stroke()
                    text(c, conv.tool, x0 + pad + 30 * k, y + bh / 2 + fs * 0.33, fs * 0.9, { col: INK_DIM, weight: 500 })
                    c.restore()
                    y += bh + 14 * k
                }
            }
            /* assistant */
            {
                const a = easeOut(span(s, 0.3, 0.4))
                if (a > 0) {
                    c.save()
                    c.globalAlpha *= a
                    c.font = font(fs, 400)
                    const n = Math.floor(span(s, 0.34, 0.8) * (conv.ai.length + 2))
                    const lines = wrap(c, conv.ai, maxW - 2 * pad)
                    const extra = conv.source ? 54 * k : conv.weather ? 168 * k : 0
                    const bw = conv.weather ? Math.min(maxW, 320 * k) : maxW
                    const bh = lines.length * lh + 1.6 * pad + extra
                    bubble(c, x0 + pad, y, bw, bh, 'ai')
                    let ty = y + pad * 0.85 + fs
                    if (conv.weather) {
                        const wa = span(s, 0.4, 0.55)
                        c.save()
                        c.globalAlpha *= wa
                        text(c, '10°', x0 + pad * 2, ty + 26 * k, 40 * k, { weight: 600 })
                        text(c, 'Sunny · Winnipeg, 15:00', x0 + pad * 2, ty + 48 * k, 11 * k, { col: INK_DIM })
                        drawSun(c, x0 + pad + bw - 46 * k, ty + 14 * k, 12 * k, time)
                        const days = ['Fri', 'Sat', 'Sun', 'Mon', 'Tue']
                        const hi = [15, 20, 25, 30, 26]
                        const lo = [5, 10, 15, 20, 18]
                        const colW = (bw - 2 * pad) / 5
                        days.forEach((d, i) => {
                            const cx = x0 + pad * 2 + colW * i + colW / 2 - pad * 0.5
                            text(c, d, cx, ty + 72 * k, 10 * k, { align: 'center', col: INK_DIM })
                            const by = ty + 118 * k
                            const hh = ((hi[i] - lo[i]) / 30) * 36 * k * span(s, 0.5 + i * 0.03, 0.62 + i * 0.03)
                            const top = by - (hi[i] / 30) * 36 * k
                            c.strokeStyle = 'rgba(245,241,234,0.15)'
                            c.lineWidth = 4 * k
                            c.lineCap = 'round'
                            c.beginPath()
                            c.moveTo(cx, by - 36 * k)
                            c.lineTo(cx, by)
                            c.stroke()
                            c.strokeStyle = `hsl(${40 - hi[i]} 95% 62%)`
                            c.beginPath()
                            c.moveTo(cx, top + ((hi[i] - lo[i]) / 30) * 36 * k)
                            c.lineTo(cx, top + ((hi[i] - lo[i]) / 30) * 36 * k - hh)
                            c.stroke()
                            text(c, `${hi[i]}°`, cx, ty + 134 * k, 9.5 * k, { align: 'center', col: INK_DIM })
                        })
                        c.restore()
                        ty += extra
                    }
                    typed(c, conv.ai, n, x0 + pad * 2, ty, bw - 2 * pad, fs, lh)
                    if (conv.source) {
                        const sa = span(s, 0.74, 0.86)
                        c.save()
                        c.globalAlpha *= sa
                        const sy = y + lines.length * lh + pad * 1.1
                        c.fillStyle = 'rgba(255,255,255,0.06)'
                        c.beginPath()
                        c.roundRect(x0 + pad * 2, sy, 190 * k, 38 * k, 10)
                        c.fill()
                        c.fillStyle = 'rgb(226, 40, 50)'
                        c.beginPath()
                        c.arc(x0 + pad * 2 + 18 * k, sy + 19 * k, 7 * k, 0, TAU)
                        c.fill()
                        text(c, conv.source, x0 + pad * 2 + 34 * k, sy + 17 * k, 11 * k, { weight: 600 })
                        text(c, 'cbc.ca/news/canada/manitoba', x0 + pad * 2 + 34 * k, sy + 30 * k, 8.5 * k, { col: INK_DIM })
                        c.restore()
                    }
                    /* caret while typing */
                    if (n < conv.ai.length && Math.sin(time * 8) > 0) {
                        c.fillStyle = ACCENT
                        c.fillRect(x0 + pad * 2 + bw - 2 * pad - 2, y + bh - pad - 2 * k, 2 * k, 2 * k)
                    }
                    c.restore()
                }
            }
            c.restore()
            c.restore()
            glow(g, F.cx, F.ay, Math.max(W, H) * 0.7, 'rgba(41, 151, 255, 0.35)', v * appear * 0.4)
        },
    }

    /* ---------- scene 5 — a car, as a blueprint ---------- */

    const CAR = (() => {
        /* local coordinates: 1000 long (4720 mm), ground at y=358, roof at y=53, nose to the right */
        const body = new Path()
        body.m(8, 300)
        body.c(2, 296, 0, 290, 1, 282)
        body.l(4, 202)
        body.c(6, 182, 12, 164, 20, 156)
        body.c(34, 150, 54, 146, 64, 146)
        body.c(120, 122, 190, 86, 230, 74)
        body.c(300, 60, 400, 52, 470, 53)
        body.c(530, 54, 610, 72, 680, 133)
        body.c(700, 140, 800, 160, 924, 191)
        body.c(962, 200, 986, 212, 994, 231)
        body.c(999, 248, 1000, 268, 1000, 282)
        body.c(1000, 298, 990, 310, 950, 312)
        body.l(898, 312)
        body.a(818, 285, 84, Math.atan2(27, 79.5), Math.PI - Math.atan2(27, 79.5) - TAU, 26)
        body.l(289, 312)
        body.a(209, 285, 84, Math.atan2(27, 79.5), Math.PI - Math.atan2(27, 79.5) - TAU, 26)
        body.l(60, 312)
        body.c(30, 311, 12, 308, 8, 300)
        /* shoulder line, soft, rising towards the tail */
        body.m(30, 172).c(300, 180, 700, 178, 930, 190)
        /* rocker crease */
        body.m(300, 292).l(740, 292)

        const glass = new Path()
        glass.m(131, 142).c(170, 104, 200, 84, 221, 76).c(300, 62, 400, 58, 489, 62).l(669, 149).z()
        glass.m(437, 60).l(441, 149) /* B-pillar */
        glass.m(246, 73).l(248, 146) /* rear door / quarter glass */
        /* doors */
        glass.m(458, 152).c(458, 200, 457, 260, 457, 312)
        glass.m(246, 148).c(246, 200, 247, 260, 250, 312)
        glass.m(657, 152).c(657, 200, 655, 260, 652, 312)
        glass.rr(461, 159, 36, 6, 3)
        glass.rr(249, 159, 36, 6, 3)
        /* mirror */
        glass.rr(612, 132, 28, 16, 5)
        glass.m(620, 148).l(626, 152)

        const lamps = new Path()
        lamps.m(930, 196).l(990, 205).l(988, 211).l(928, 203).z()
        lamps.m(6, 158).l(44, 150).l(46, 162).l(8, 168).z()

        const dims = new Path()
        /* overall length */
        dims.m(0, 400).l(1000, 400)
        dims.m(0, 392).l(0, 408)
        dims.m(1000, 392).l(1000, 408)
        /* wheelbase */
        dims.m(209, 376).l(818, 376)
        dims.m(209, 370).l(209, 382)
        dims.m(818, 370).l(818, 382)
        /* height */
        dims.m(1050, 53).l(1050, 358)
        dims.m(1042, 53).l(1058, 53)
        dims.m(1042, 358).l(1058, 358)
        dims.m(0, 53).l(1050, 53)
        return { body, glass, lamps, dims }
    })()

    const drawWheel = (c, x, y, ang, p, w) => {
        if (p <= 0) return
        const tire = new Path().circle(x, y, 71)
        const rim = new Path().circle(x, y, 48)
        ink(c, tire, span(p, 0, 0.5), w * 1.4)
        ink(c, rim, span(p, 0.3, 0.7), w)
        /* seven vanes of the aero cover */
        const sp = new Path()
        for (let i = 0; i < 7; i++) {
            const a = ang + (i / 7) * TAU
            for (const d of [-0.08, 0.08]) {
                sp.m(x + Math.cos(a + d * 3) * 11, y + Math.sin(a + d * 3) * 11)
                sp.l(x + Math.cos(a + d) * 44, y + Math.sin(a + d) * 44)
            }
        }
        sp.circle(x, y, 11)
        ink(c, sp, span(p, 0.5, 1), w * 0.9, INK, 0.85)
        c.globalAlpha *= 0.3 * span(p, 0.6, 1)
        c.strokeStyle = INK
        c.lineWidth = w
        c.beginPath()
        c.arc(x, y, 28, 0, TAU)
        c.stroke()
        c.globalAlpha /= 0.3 * span(p, 0.6, 1) || 1
    }

    const scene5 = {
        draw(c, g, t, v, time) {
            const width = Math.min(F.W * 0.86, F.ah * 1.7, 1250)
            const k = width / 1000
            const x0 = F.cx - 500 * k
            const y0 = F.ay - 200 * k
            const w = (1.3 * F.px) / k
            glow(g, F.cx, F.ay, width * 0.6, 'rgba(41, 151, 255, 0.35)', v * 0.35 * span(t, 0.1, 0.5))
            c.save()
            c.translate(x0, y0)
            c.scale(k, k)
            /* ground */
            c.globalAlpha = v * 0.35 * span(t, 0, 0.1)
            c.strokeStyle = INK
            c.lineWidth = w
            c.beginPath()
            c.moveTo(-200, 358)
            c.lineTo(1250, 358)
            c.stroke()
            c.globalAlpha = v
            /* reflection: the drawing mirrored in the floor, fading with depth */
            const refl = span(t, 0.3, 0.7)
            if (refl > 0) {
                const bands = 6
                for (let b = 0; b < bands; b++) {
                    c.save()
                    c.beginPath()
                    c.rect(-100, 358 + b * 40, 1300, 40)
                    c.clip()
                    c.translate(0, 716)
                    c.scale(1, -1)
                    c.globalAlpha = v * 0.14 * refl * (1 - b / bands) * (1 - b / bands)
                    ink(c, CAR.body, span(t, 0, 0.42), w)
                    ink(c, CAR.glass, span(t, 0.12, 0.52), w * 0.9)
                    c.restore()
                }
                c.globalAlpha = v
            }
            ink(c, CAR.body, span(t, 0, 0.42), w)
            ink(c, CAR.glass, span(t, 0.12, 0.52), w * 0.9, INK, 0.9)
            const ang = t * 16
            drawWheel(c, 209, 287, ang, span(t, 0.3, 0.6), w)
            drawWheel(c, 818, 287, ang, span(t, 0.34, 0.64), w)
            /* lamps */
            const lamp = span(t, 0.55, 0.7)
            if (lamp > 0) {
                ink(c, CAR.lamps, lamp, w, INK, 0.8)
                const lit = span(t, 0.66, 0.78)
                if (lit > 0) {
                    c.globalAlpha = v * lit
                    c.fillStyle = 'rgba(200, 230, 255, 0.9)'
                    trace(c, CAR.lamps, 1)
                    c.fill()
                    c.globalAlpha = v
                    glow(g, x0 + 960 * k, y0 + 203 * k, 120 * k, 'rgba(180, 220, 255, 0.9)', v * lit * 0.8)
                    glow(g, x0 + 26 * k, y0 + 159 * k, 90 * k, 'rgba(255, 60, 60, 0.9)', v * lit * 0.7)
                    c.fillStyle = 'rgb(255, 70, 70)'
                    c.beginPath()
                    c.moveTo(6, 158)
                    c.lineTo(44, 150)
                    c.lineTo(46, 162)
                    c.lineTo(8, 168)
                    c.fill()
                }
            }
            /* dimensions, like a drawing office */
            const dp = span(t, 0.62, 0.9)
            if (dp > 0) {
                c.setLineDash([4, 6])
                ink(c, CAR.dims, dp, w * 0.8, INK, 0.5)
                c.setLineDash([])
                const fs = Math.max(11 * F.px, 11) / k
                const la = span(dp, 0.5, 1)
                text(c, '4720 mm', 500, 424, fs, { align: 'center', col: INK_DIM, alpha: la })
                text(c, '2875 mm wheelbase', 513, 364, fs * 0.9, { align: 'center', col: INK_DIM, alpha: la })
                c.save()
                c.translate(1050 + fs * 1.4, 205)
                c.rotate(-Math.PI / 2)
                text(c, '1441 mm', 0, 0, fs, { align: 'center', col: INK_DIM, alpha: la })
                c.restore()
                text(c, 'TESLA MODEL 3 · 1 : 1 · SIDE ELEVATION', 0, 17, fs * 0.85, {
                    col: INK_DIM,
                    alpha: la,
                    weight: 600,
                })
            }
            c.restore()
        },
    }

    /* ---------- scene 6 — dawn ---------- */

    const horizon6 = (t) => F.H * 1.12 - smooth(span(t, 0, 0.45)) * F.H * 0.44

    const scene6 = {
        sky(c, g, t, v, time) {
            const yH = horizon6(t)
            const warm = smooth(span(t, 0.1, 0.9))
            const sunY = yH + F.H * 0.09 - warm * F.H * 0.085
            /* dawn band */
            const grad = c.createLinearGradient(0, yH - F.H * 0.55, 0, yH)
            grad.addColorStop(0, 'rgba(12, 18, 44, 0)')
            grad.addColorStop(0.55, `rgba(70, 60, 110, ${0.35 * warm})`)
            grad.addColorStop(1, `rgba(255, 150, 90, ${0.55 * warm})`)
            c.globalAlpha = v
            c.fillStyle = grad
            c.fillRect(0, yH - F.H * 0.55, F.W, F.H * 0.55 + 2)
            /* the sun, still under the horizon */
            const sun = c.createRadialGradient(F.cx, sunY, 0, F.cx, sunY, F.H * 0.42)
            sun.addColorStop(0, `rgba(255, 220, 170, ${0.95 * warm})`)
            sun.addColorStop(0.12, `rgba(255, 170, 100, ${0.5 * warm})`)
            sun.addColorStop(1, 'rgba(255, 120, 60, 0)')
            c.fillStyle = sun
            c.fillRect(0, 0, F.W, F.H)
            c.globalAlpha = 1
        },
        draw(c, g, t, v, time) {
            const yH = horizon6(t)
            drawGround(c, g, yH, v, true)
            /* long thin cloud catching the light */
            const warm = smooth(span(t, 0.3, 0.95))
            if (warm > 0) {
                c.globalAlpha = v * warm * 0.5
                c.fillStyle = 'rgb(255, 180, 130)'
                for (let i = 0; i < 3; i++) {
                    const y = yH - F.H * (0.08 + i * 0.05)
                    const x = F.cx + (i - 1) * F.W * 0.18 + Math.sin(time * 0.05 + i) * 8
                    const w = F.W * (0.14 + 0.06 * i)
                    c.beginPath()
                    c.ellipse(x, y, w, 1.6 + i * 0.5, 0, 0, TAU)
                    c.fill()
                }
                c.globalAlpha = 1
            }
        },
    }

    const scenes = [scene0, scene1, scene2, scene3, scene4, scene5, scene6]

    /* ---------- HUD ---------- */

    const rail = document.querySelector('.rail')
    const railDots = rail ? Array.from(rail.querySelectorAll('button')) : []
    railDots.forEach((b, i) =>
        b.addEventListener('click', () => {
            const ch = chapters[i]
            if (ch) window.scrollTo({ top: ch.top + 2, behavior: reduce ? 'auto' : 'smooth' })
        })
    )
    const tc = document.querySelector('.timecode')
    const hint = document.querySelector('.scroll-hint')
    const pad2 = (n) => String(n).padStart(2, '0')

    /* ---------- the loop ---------- */

    let T = 0 /* eased playhead */
    let target = 0
    let last = performance.now()
    let activeDot = -1
    let running = true

    const starAlpha = (Tp) => {
        let a = 1
        if (Tp > 0.6) a = lerp(1, 0.4, smooth(span(Tp, 0.6, 1.2)))
        if (Tp > 5.8) a = lerp(0.4, 1, smooth(span(Tp, 5.8, 6.4)))
        if (Tp > 6) a *= 1 - 0.85 * smooth(span(Tp, 6.2, 6.9))
        return a
    }

    const frame = (now) => {
        if (!running) return
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        /* ambient motion (twinkle, aurora drift) stops under reduced motion */
        const time = reduce ? 0 : now / 1000
        target = playhead()
        T = reduce ? target : T + (target - T) * (1 - Math.exp(-dt * 7.5))
        if (Math.abs(target - T) < 0.0005) T = target

        /* visible chapters */
        const vis = []
        for (let i = 0; i < N; i++) {
            const { t, v } = local(i, T)
            if (v > 0.002) vis.push({ i, t, v })
        }

        ctx.setTransform(F.scale, 0, 0, F.scale, 0, 0)
        gctx.setTransform(F.scale / GLOW_DIV, 0, 0, F.scale / GLOW_DIV, 0, 0)
        ctx.globalAlpha = 1
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, F.W, F.H)
        gctx.globalCompositeOperation = 'source-over'
        gctx.fillStyle = '#000'
        gctx.fillRect(0, 0, F.W, F.H)

        for (const { t, v, i } of vis) scenes[i].sky && scenes[i].sky(ctx, gctx, t, v, time)
        drawStars(ctx, T, time, starAlpha(T))
        for (const { t, v, i } of vis) {
            ctx.globalAlpha = v
            gctx.globalAlpha = 1
            scenes[i].draw(ctx, gctx, t, v, time)
            ctx.globalAlpha = 1
        }

        /* glow layer */
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.globalCompositeOperation = 'lighter'
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(glowCanvas, 0, 0, canvas.width, canvas.height)
        ctx.globalCompositeOperation = 'source-over'

        /* vignette */
        ctx.setTransform(F.scale, 0, 0, F.scale, 0, 0)
        const vg = ctx.createRadialGradient(F.cx, F.H * 0.45, F.H * 0.3, F.cx, F.H * 0.5, Math.max(F.W, F.H) * 0.78)
        vg.addColorStop(0, 'rgba(0,0,0,0)')
        vg.addColorStop(1, 'rgba(0,0,0,0.55)')
        ctx.fillStyle = vg
        ctx.fillRect(0, 0, F.W, F.H)

        /* grain */
        if (grainPattern) {
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.globalAlpha = 0.045
            ctx.globalCompositeOperation = 'overlay'
            const ox = reduce ? 0 : Math.floor(hash(Math.floor(time * 12)) * 160)
            const oy = reduce ? 0 : Math.floor(hash(Math.floor(time * 12) + 9) * 160)
            ctx.translate(-ox, -oy)
            ctx.fillStyle = grainPattern
            ctx.fillRect(0, 0, canvas.width + 160, canvas.height + 160)
            ctx.globalCompositeOperation = 'source-over'
            ctx.globalAlpha = 1
        }

        /* captions */
        for (let i = 0; i < N; i++) {
            const ch = chapters[i]
            const x = target - i
            const t = x <= 0 ? 0 : clamp(x / (1 - ch.g || 1))
            for (const cap of ch.caps) {
                let o
                if (x < 0) o = 0
                else if (cap.a <= 0 && t <= cap.a + 0.001) o = 1
                else o = env(t, cap.a, cap.b, 0.07)
                if (cap.b >= 1 && t >= cap.b - 0.07) o = smooth((t - cap.a) / 0.07)
                if (i === N - 1 && t >= cap.a) o = 1
                o = clamp(o)
                if (Math.abs(o - cap.o) > 0.004 || (o === 0) !== (cap.o === 0)) {
                    cap.o = o
                    cap.el.style.opacity = o.toFixed(3)
                    cap.el.style.transform = `translate3d(0, ${((1 - o) * 14).toFixed(1)}px, 0)`
                    cap.el.style.visibility = o > 0.02 ? 'visible' : 'hidden'
                }
            }
        }

        /* HUD */
        const idx = Math.min(N - 1, Math.floor(T + 0.0001))
        if (idx !== activeDot) {
            railDots.forEach((b, i) => b.classList.toggle('is-active', i === idx))
            activeDot = idx
        }
        if (tc) {
            const sec = T * 9
            const s = Math.floor(sec)
            const f = Math.floor((sec - s) * 24)
            tc.textContent = `CH ${pad2(idx + 1)} / ${pad2(N)} · 00:${pad2(Math.floor(s / 60))}:${pad2(s % 60)}:${pad2(f)}`
        }
        if (hint) hint.style.opacity = String(clamp(1 - target * 12))

        requestAnimationFrame(frame)
    }

    /* pause while hidden */
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) running = false
        else if (!running) {
            running = true
            last = performance.now()
            requestAnimationFrame(frame)
        }
    })

    const onResize = () => {
        resize()
        measure()
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('load', measure)
    resize()
    measure()
    T = target = playhead()
    requestAnimationFrame(frame)
})()
