/* sarria.ca — Geely Xingyue L (Monjaro) built procedurally in three.js.
 *
 * Coordinates: metres. +X is the front of the car, +Y is up, Z is across
 * the car. The ground is y = 0 and the car is centred on x = 0.
 *
 * The body is a loft: for every station along X we compute one closed
 * cross-section (a rounded polyline) from a handful of longitudinal
 * curves — roof line, belt line, shoulder width, wheel arches — and the
 * stations are stitched into one smooth skin. Trim, lamps, glass,
 * wheels and the grille are separate meshes positioned on that skin.
 */

import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

export const DIMS = {
    length: 4.77,
    width: 1.895,
    height: 1.689,
    wheelbase: 2.845,
    frontAxle: 1.425,
    rearAxle: -1.42,
    wheelRadius: 0.369, // 255/45 R20
    rimRadius: 0.254,
    tireWidth: 0.255,
    track: 1.6,
}

const X_REAR = -2.385
const X_FRONT = 2.385
const Y_FLOOR = 0.2
const ARCH_R = 0.452
const ARCH_Y = DIMS.wheelRadius + 0.015

/* ------------------------------------------------------------------ */
/* small maths                                                         */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const lerp = (a, b, t) => a + (b - a) * t
const smoothstep = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)
}

/**
 * Rounds the corners of a polyline. Each knot is [x, y, r]; the corner at
 * a knot is replaced by an arc of radius r (clamped to the neighbouring
 * edge lengths). Every interior knot always yields `segs + 1` points so
 * polylines built from the same knot list stay point-compatible.
 */
function roundedPolyline(knots, segs = 6) {
    const out = []
    const n = knots.length
    for (let i = 0; i < n; i++) {
        const [x, y, r = 0] = knots[i]
        if (i === 0 || i === n - 1 || r <= 0) {
            const copies = i === 0 || i === n - 1 ? 1 : segs + 1
            for (let k = 0; k < copies; k++) out.push([x, y])
            continue
        }
        const [px, py] = knots[i - 1]
        const [nx, ny] = knots[i + 1]
        let ax = px - x
        let ay = py - y
        let bx = nx - x
        let by = ny - y
        const la = Math.hypot(ax, ay) || 1e-9
        const lb = Math.hypot(bx, by) || 1e-9
        ax /= la
        ay /= la
        bx /= lb
        by /= lb
        const cosT = clamp(ax * bx + ay * by, -1, 1)
        const theta = Math.acos(cosT) // angle between the two edges
        if (theta > Math.PI - 1e-3 || theta < 1e-3) {
            for (let k = 0; k <= segs; k++) out.push([x, y])
            continue
        }
        const half = theta / 2
        let d = r / Math.tan(half) // distance from corner to tangent points
        const maxD = Math.min(la, lb) * 0.5
        if (d > maxD) d = maxD
        const rr = d * Math.tan(half)
        // bisector direction
        let mx = ax + bx
        let my = ay + by
        const lm = Math.hypot(mx, my) || 1e-9
        mx /= lm
        my /= lm
        const cx = x + (mx * rr) / Math.sin(half)
        const cy = y + (my * rr) / Math.sin(half)
        const t1x = x + ax * d
        const t1y = y + ay * d
        const t2x = x + bx * d
        const t2y = y + by * d
        let a1 = Math.atan2(t1y - cy, t1x - cx)
        let a2 = Math.atan2(t2y - cy, t2x - cx)
        let da = a2 - a1
        while (da > Math.PI) da -= Math.PI * 2
        while (da < -Math.PI) da += Math.PI * 2
        for (let k = 0; k <= segs; k++) {
            const a = a1 + (da * k) / segs
            out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr])
        }
    }
    return out
}

/** Longitudinal curve: knots [x, y, r] → function x ↦ y (lookup table). */
function curve(knots, segs = 12) {
    const pts = roundedPolyline(knots, segs)
    pts.sort((a, b) => a[0] - b[0])
    return (x) => {
        if (x <= pts[0][0]) return pts[0][1]
        if (x >= pts[pts.length - 1][0]) return pts[pts.length - 1][1]
        let lo = 0
        let hi = pts.length - 1
        while (hi - lo > 1) {
            const mid = (lo + hi) >> 1
            if (pts[mid][0] <= x) lo = mid
            else hi = mid
        }
        const [x0, y0] = pts[lo]
        const [x1, y1] = pts[hi]
        return x1 === x0 ? y0 : lerp(y0, y1, (x - x0) / (x1 - x0))
    }
}

/* ------------------------------------------------------------------ */
/* longitudinal design curves (side view and plan view)                */

// Centre-line top contour: rear bumper → tailgate → rear glass → roof →
// windscreen → bonnet → grille → front bumper.
const yTop = curve([
    [X_REAR, 0.46, 0],
    [-2.37, 0.86, 0.04],
    [-2.36, 0.9, 0.03],
    [-2.345, 0.99, 0.02],
    [-2.3, 1.06, 0.03],
    [-2.28, 1.1, 0.02],
    [-2.04, 1.555, 0.03],
    [-1.95, 1.6, 0.06],
    [-1.0, 1.635, 0.4],
    [-0.3, 1.64, 0.4],
    [0.12, 1.6, 0.14],
    [0.95, 1.1, 0.08],
    [1.05, 1.07, 0.1],
    [2.1, 0.99, 0.5],
    [2.27, 0.95, 0.06],
    [2.315, 0.925, 0.015],
    [2.36, 0.62, 0.03],
    [X_FRONT, 0.5, 0],
])

// Underside / bumper lower edges.
const yBottom = curve([
    [X_REAR, 0.37, 0],
    [-2.34, 0.3, 0.04],
    [-2.1, Y_FLOOR + 0.01, 0.05],
    [2.1, Y_FLOOR + 0.01, 0.05],
    [2.34, 0.3, 0.04],
    [X_FRONT, 0.37, 0],
])

// Belt line (bottom of the side glass). Rises towards the rear.
const yBelt = curve([
    [X_REAR, 1.04, 0],
    [-2.25, 1.055, 0.1],
    [-1.6, 1.02, 0.3],
    [0.45, 0.985, 0.3],
    [0.95, 0.985, 0.05],
    [1.05, 0.98, 0.1],
    [2.15, 0.9, 0.1],
    [2.3, 0.86, 0.05],
    [X_FRONT, 0.6, 0],
])

// Half width at the shoulder (widest part of the body, mirrors excluded).
const zShoulder = curve([
    [X_REAR, 0.66, 0],
    [-2.36, 0.76, 0.05],
    [-2.3, 0.84, 0.08],
    [-2.15, 0.915, 0.15],
    [-1.9, 0.945, 0.4],
    [1.5, 0.947, 0.5],
    [2.0, 0.915, 0.25],
    [2.2, 0.85, 0.2],
    [2.31, 0.74, 0.12],
    [2.365, 0.6, 0.05],
    [X_FRONT, 0.46, 0],
])

// Half width of the greenhouse / bonnet crown edge.
const zRoofEdge = curve([
    [X_REAR, 0.5, 0],
    [-2.28, 0.54, 0.05],
    [-2.0, 0.6, 0.15],
    [-1.2, 0.655, 0.3],
    [-0.3, 0.665, 0.3],
    [0.12, 0.66, 0.1],
    [0.95, 0.835, 0.04],
    [1.1, 0.76, 0.08],
    [2.1, 0.68, 0.2],
    [2.28, 0.6, 0.05],
    [X_FRONT, 0.42, 0],
])

/** Height of the body's lower edge at the side, lifted over the arches. */
function sideBottom(x) {
    const sill = Math.max(0.235, yBottom(x) + 0.01)
    let y = sill
    for (const cx of [DIMS.frontAxle, DIMS.rearAxle]) {
        const dx = x - cx
        if (Math.abs(dx) < ARCH_R) {
            const arch = ARCH_Y + Math.sqrt(ARCH_R * ARCH_R - dx * dx)
            // soft max so the arch meets the sill with a small fillet
            const k = 0.04
            const h = clamp(0.5 + (0.5 * (arch - sill)) / k, 0, 1)
            y = Math.max(y, lerp(sill, arch, h) + k * h * (1 - h))
        }
    }
    return y
}

function inArch(x) {
    for (const cx of [DIMS.frontAxle, DIMS.rearAxle]) {
        if (Math.abs(x - cx) < ARCH_R - 0.005) return true
    }
    return false
}

/* ------------------------------------------------------------------ */
/* cross-section                                                       */

const CORNER_SEGS = 5
// Knot roles, in order from the roof centre down the +Z side to the floor.
// Segment i of a ring (between knot i and i+1) is used to pick materials.
const SEG = {
    TOP: 0, // roof centre → roof edge (roof, windscreen, bonnet crown)
    GLASS: 1, // roof edge → belt line (side glass, pillars, bonnet shoulder)
    SHOULDER: 2, // belt → shoulder
    DOOR: 3, // shoulder → mid door
    LOWER: 4, // mid door → lower crease
    SILL: 5, // lower crease → sill bottom
    WELL_TOP: 6, // under the sill / arch lip inwards
    WELL: 7, // inner wheel-well wall
    FLOOR: 8, // floor
}

/** Half cross-section knots [y, z, r] at station x. */
function halfProfileKnots(x) {
    const top = yTop(x)
    const belt = Math.min(yBelt(x), top - 0.03)
    const zs = zShoulder(x)
    const zr = Math.min(zRoofEdge(x), zs - 0.02)
    const bottom = sideBottom(x)
    const arch = inArch(x)

    const bonnet = smoothstep(0.95, 1.1, x) // 1 on the bonnet
    const rear = smoothstep(-2.25, -2.37, x) // 1 on the tailgate

    // Roof edge: on the bonnet the "roof edge" is the crown break line.
    const p1y = top - lerp(0.035, 0.02, bonnet)
    const p1r = lerp(0.09, 0.05, bonnet)
    // Belt / fender top.
    const p2y = belt
    const p2z = lerp(zs - 0.035, zs - 0.07, bonnet)
    const p2r = lerp(0.015, 0.05, bonnet)
    // Shoulder.
    const p3y = Math.min(belt - lerp(0.09, 0.16, bonnet), top - 0.15)
    const p3r = 0.05
    // Mid door — widest point.
    let p4y = 0.64
    const p4z = zs + 0.004
    // Lower crease.
    let p5y = 0.345
    const p5z = zs - 0.05
    // Sill bottom.
    let p6y = bottom
    const p6z = zs - lerp(0.13, 0.05, Math.max(bonnet, rear))
    // Inner wheel well wall.
    const zIn = arch ? 0.52 : p6z - 0.02
    const wellY = arch ? bottom : Math.max(Y_FLOOR, bottom - 0.02)

    // keep the profile strictly descending in y
    const p3yArch = Math.max(p3y, p6y + 0.04)
    if (p4y < p6y + 0.03) p4y = p6y + 0.03
    if (p5y < p6y + 0.015) p5y = p6y + 0.015
    const knots = [
        [top, 0, 0],
        [p1y, zr, p1r],
        [p2y, p2z, p2r],
        [p3yArch, zs - 0.005, p3r],
        [p4y, p4z, 0.35],
        [p5y, p5z, 0.08],
        [p6y, p6z, 0.03],
        [wellY, zIn, 0],
        [Y_FLOOR, zIn, 0],
        [Y_FLOOR, 0, 0],
    ]
    let prev = Infinity
    for (const k of knots) {
        if (k[0] > prev - 0.004) k[0] = prev - 0.004
        prev = k[0]
    }
    return knots
}

/** Full ring of [y, z] points for station x, plus a per-point segment id. */
function ring(x) {
    const knots = halfProfileKnots(x)
    const half = roundedPolyline(
        knots.map(([y, z, r]) => [z, y, r]),
        CORNER_SEGS
    ).map(([z, y]) => [y, z])
    // segment id for each point of the half profile
    const segOf = []
    segOf.push(0)
    for (let i = 1; i < knots.length - 1; i++) {
        for (let k = 0; k <= CORNER_SEGS; k++) {
            segOf.push(k <= CORNER_SEGS / 2 ? i - 1 : i)
        }
    }
    segOf.push(knots.length - 2)
    const pts = half.slice()
    const segs = segOf.slice()
    for (let i = half.length - 2; i >= 1; i--) {
        pts.push([half[i][0], -half[i][1]])
        segs.push(segOf[i])
    }
    return { pts, segs }
}

/** World position of a named knot of the profile at station x. */
export function knotAt(x, index, side = 1) {
    const k = halfProfileKnots(x)[index]
    return new THREE.Vector3(x, k[0], k[1] * side)
}

/** Height of the upper skin at station x and lateral offset z (or -Infinity past the widest point). */
function skinHeightAt(x, z) {
    const az = Math.abs(z)
    const knots = halfProfileKnots(x)
    const half = roundedPolyline(
        knots.map(([ky, kz, r]) => [kz, ky, r]),
        CORNER_SEGS
    )
    for (let i = 0; i < half.length - 1; i++) {
        const [z0, y0] = half[i]
        const [z1, y1] = half[i + 1]
        if (z1 < z0 - 1e-6) break
        if (az >= z0 && az <= z1 && z1 !== z0) return lerp(y0, y1, (az - z0) / (z1 - z0))
    }
    return -Infinity
}

/** x where the skin at lateral z passes height y, searching in from the front (dir 1) or rear (dir -1). */
function faceX(y, z, dir) {
    let lo = dir > 0 ? 1.4 : X_REAR
    let hi = dir > 0 ? X_FRONT : -1.4
    for (let i = 0; i < 28; i++) {
        const mid = (lo + hi) / 2
        const h = skinHeightAt(mid, z)
        if (dir > 0) {
            if (h > y) lo = mid
            else hi = mid
        } else if (h > y) hi = mid
        else lo = mid
    }
    return (lo + hi) / 2
}

/**
 * A panel set into the nose (dir 1) or tail (dir -1): a grid over
 * y ∈ [y0, y1], z ∈ [z0, z1] that follows the skin, pushed `offset` metres
 * out along the surface normal, with a rim folded back into the body.
 */
export function facePatch(y0, y1, z0, z1, dir, offset, material, ny = 4, nz = 24, rim = 0.02) {
    const P = (y, z) => new THREE.Vector3(faceX(y, z, dir), y, z)
    const d = 0.003
    const cols = nz + 1
    const rows = ny + 1
    const pos = []
    const idx = []
    const grid = []
    const push = (v) => pos.push(v.x, v.y, v.z)
    for (let j = 0; j < rows; j++) {
        const y = lerp(y0, y1, j / ny)
        for (let i = 0; i < cols; i++) {
            const z = lerp(z0, z1, i / nz)
            const p = P(y, z)
            const dy = P(y + d, z).sub(p)
            const dz = P(y, z + d).sub(p)
            const n = new THREE.Vector3().crossVectors(dy, dz).normalize()
            if (dir < 0) n.negate()
            grid.push({ p, n })
            push(p.clone().addScaledVector(n, offset))
        }
    }
    const at = (i, j) => j * cols + i
    for (let j = 0; j < ny; j++) {
        for (let i = 0; i < nz; i++) {
            idx.push(at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j), at(i + 1, j + 1), at(i, j + 1))
        }
    }
    const outline = []
    for (let i = 0; i < cols; i++) outline.push(at(i, 0))
    for (let j = 1; j < rows; j++) outline.push(at(nz, j))
    for (let i = nz - 1; i >= 0; i--) outline.push(at(i, ny))
    for (let j = ny - 1; j >= 1; j--) outline.push(at(0, j))
    const base = pos.length / 3
    for (const o of outline) push(grid[o].p.clone().addScaledVector(grid[o].n, -rim))
    for (let k = 0; k < outline.length; k++) {
        const k1 = (k + 1) % outline.length
        idx.push(outline[k], base + k1, outline[k1], outline[k], base + k, base + k1)
    }
    if (dir > 0) idx.reverse()
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    geo.setIndex(idx)
    geo.computeVertexNormals()
    return new THREE.Mesh(geo, material)
}

/* ------------------------------------------------------------------ */
/* materials                                                           */

export function createMaterials() {
    const paint = new THREE.MeshPhysicalMaterial({
        color: 0x8d9094,
        metalness: 0.75,
        roughness: 0.42,
        clearcoat: 1,
        clearcoatRoughness: 0.035,
        envMapIntensity: 1.1,
    })
    const glass = new THREE.MeshPhysicalMaterial({
        color: 0x05070a,
        metalness: 0.2,
        roughness: 0.02,
        clearcoat: 1,
        clearcoatRoughness: 0.0,
        transparent: true,
        opacity: 0.92,
        envMapIntensity: 1.3,
    })
    const gloss = new THREE.MeshPhysicalMaterial({
        color: 0x08090b,
        metalness: 0.1,
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.1,
    })
    const trim = new THREE.MeshStandardMaterial({
        color: 0x111214,
        metalness: 0.0,
        roughness: 0.62,
        envMapIntensity: 0.8,
    })
    const under = new THREE.MeshStandardMaterial({
        color: 0x08090a,
        metalness: 0.0,
        roughness: 0.95,
        envMapIntensity: 0.4,
    })
    const chrome = new THREE.MeshStandardMaterial({
        color: 0xe6e7ea,
        metalness: 1,
        roughness: 0.07,
        envMapIntensity: 1.2,
    })
    const satin = new THREE.MeshStandardMaterial({
        color: 0xa9abb0,
        metalness: 1,
        roughness: 0.38,
        envMapIntensity: 1.0,
    })
    const wheelDark = new THREE.MeshStandardMaterial({
        color: 0x2b2d31,
        metalness: 0.95,
        roughness: 0.32,
        envMapIntensity: 1.0,
    })
    const wheelBright = new THREE.MeshStandardMaterial({
        color: 0xd4d6da,
        metalness: 1,
        roughness: 0.18,
        envMapIntensity: 1.1,
    })
    const rubber = new THREE.MeshStandardMaterial({
        color: 0x111214,
        metalness: 0,
        roughness: 0.88,
        envMapIntensity: 0.6,
    })
    const steel = new THREE.MeshStandardMaterial({
        color: 0x5c5e63,
        metalness: 1,
        roughness: 0.5,
    })
    const lampDrl = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xf4f7ff,
        emissiveIntensity: 7,
        roughness: 0.3,
    })
    const lampRed = new THREE.MeshPhysicalMaterial({
        color: 0x5a0208,
        emissive: 0xff1a12,
        emissiveIntensity: 2.6,
        roughness: 0.08,
        clearcoat: 1,
        envMapIntensity: 1.2,
    })
    const lampLens = new THREE.MeshPhysicalMaterial({
        color: 0x0a0b0e,
        metalness: 0.3,
        roughness: 0.05,
        clearcoat: 1,
        envMapIntensity: 1.3,
    })
    const interior = new THREE.MeshStandardMaterial({
        color: 0x1a1a1c,
        roughness: 0.9,
        envMapIntensity: 0.3,
    })
    return {
        paint,
        glass,
        gloss,
        trim,
        under,
        chrome,
        satin,
        wheelDark,
        wheelBright,
        rubber,
        steel,
        lampDrl,
        lampRed,
        lampLens,
        interior,
    }
}

/* ------------------------------------------------------------------ */
/* body loft                                                           */

const MAT = { PAINT: 0, GLASS: 1, GLOSS: 2, UNDER: 3, TRIM: 4 }

function stations() {
    const xs = []
    const push = (x) => xs.push(clamp(x, X_REAR, X_FRONT))
    let x = X_REAR
    while (x < X_FRONT) {
        push(x)
        const nearEnd = Math.min(x - X_REAR, X_FRONT - x) < 0.3
        let near = false
        for (const cx of [DIMS.frontAxle, DIMS.rearAxle]) {
            if (Math.abs(Math.abs(x - cx) - ARCH_R) < 0.08) near = true
        }
        const nearCowl = Math.abs(x - 0.95) < 0.12 || Math.abs(x - 0.12) < 0.1 || x > 2.1
        const nearTail = Math.abs(x + 2.28) < 0.1 || Math.abs(x + 2.04) < 0.08
        x += near ? 0.012 : nearEnd || nearCowl || nearTail ? 0.02 : 0.04
    }
    push(X_FRONT)
    return Array.from(new Set(xs)).sort((a, b) => a - b)
}

function bodyMaterialFor(seg, x, y, z) {
    const az = Math.abs(z)
    if (seg >= SEG.WELL_TOP) return MAT.UNDER
    if (seg === SEG.SILL) return MAT.TRIM
    if (x > 2.3 && seg >= SEG.SHOULDER && seg <= SEG.LOWER && y < 0.6 && az > 0.42) return MAT.TRIM
    if (seg === SEG.TOP) {
        if (x > 0.14 && x < 0.94) return MAT.GLASS // windscreen
        if (x > -2.265 && x < -2.055) return MAT.GLASS // rear glass
        if (x > -1.8 && x < -0.05 && az < 0.5) return MAT.GLASS // panoramic roof
        return MAT.PAINT
    }
    if (seg === SEG.GLASS) {
        // side glass + blacked-out pillars, with the rear quarter kick-up
        const belt = yBelt(x)
        const kick = -1.98 - (y - belt) * 0.55
        if (x < 0.47 && x > kick) return MAT.GLASS
        return MAT.PAINT
    }
    return MAT.PAINT
}

function buildBody(mats) {
    const xs = stations()
    const rings = xs.map((x) => ring(x))
    const n = rings[0].pts.length
    const positions = []
    const faces = { 0: [], 1: [], 2: [], 3: [], 4: [] }

    for (let i = 0; i < xs.length; i++) {
        for (const [y, z] of rings[i].pts) positions.push(xs[i], y, z)
    }
    const idx = (i, j) => i * n + ((j + n) % n)
    for (let i = 0; i < xs.length - 1; i++) {
        const r0 = rings[i]
        const r1 = rings[i + 1]
        for (let j = 0; j < n; j++) {
            const j1 = (j + 1) % n
            const seg = r0.segs[j] === r0.segs[j1] ? r0.segs[j] : Math.min(r0.segs[j], r0.segs[j1])
            const cx = (xs[i] + xs[i + 1]) / 2
            const cy = (r0.pts[j][0] + r0.pts[j1][0] + r1.pts[j][0] + r1.pts[j1][0]) / 4
            const cz = (r0.pts[j][1] + r0.pts[j1][1] + r1.pts[j][1] + r1.pts[j1][1]) / 4
            const m = bodyMaterialFor(seg, cx, cy, cz)
            faces[m].push(idx(i, j), idx(i, j1), idx(i + 1, j1))
            faces[m].push(idx(i, j), idx(i + 1, j1), idx(i + 1, j))
        }
    }
    // end caps with their own vertices so the edge stays crisp
    const cap = (i, forward) => {
        const base = positions.length / 3
        const r = rings[i]
        let cy = 0
        for (const [y] of r.pts) cy += y
        cy /= n
        positions.push(xs[i], cy, 0)
        for (const [y, z] of r.pts) positions.push(xs[i], y, z)
        for (let j = 0; j < n; j++) {
            const a = base
            const b = base + 1 + j
            const c = base + 1 + ((j + 1) % n)
            const m = MAT.PAINT
            if (forward) faces[m].push(a, b, c)
            else faces[m].push(a, c, b)
        }
    }
    cap(xs.length - 1, true)
    cap(0, false)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    const index = []
    const order = [MAT.PAINT, MAT.GLASS, MAT.GLOSS, MAT.UNDER, MAT.TRIM]
    const matList = []
    for (const m of order) {
        const list = faces[m]
        if (!list.length) continue
        geo.addGroup(index.length, list.length, matList.length)
        matList.push([mats.paint, mats.glass, mats.gloss, mats.under, mats.trim][m])
        for (const v of list) index.push(v)
    }
    geo.setIndex(index)
    geo.computeVertexNormals()
    const mesh = new THREE.Mesh(geo, matList)
    mesh.name = 'body'
    return mesh
}

/* ------------------------------------------------------------------ */
/* trim lines along the skin                                           */

function tubeAlong(points, radius, material, closed = false) {
    const curve3 = new THREE.CatmullRomCurve3(points, closed, 'centripetal', 0.5)
    const geo = new THREE.TubeGeometry(curve3, Math.max(8, points.length * 2), radius, 8, closed)
    return new THREE.Mesh(geo, material)
}

/** Sample knot `index` of the profile along x, offset outward in z. */
function skinLine(index, x0, x1, side, zOff = 0, yOff = 0, step = 0.05) {
    const pts = []
    const dir = x1 > x0 ? 1 : -1
    for (let x = x0; dir > 0 ? x <= x1 + 1e-6 : x >= x1 - 1e-6; x += step * dir) {
        const p = knotAt(x, index, side)
        p.z += zOff * side
        p.y += yOff
        pts.push(p)
    }
    const last = knotAt(x1, index, side)
    last.z += zOff * side
    last.y += yOff
    if (pts[pts.length - 1].distanceTo(last) > 1e-4) pts.push(last)
    return pts
}

function buildTrim(mats, side) {
    const g = new THREE.Group()

    // chrome window surround: belt line → up the D-pillar → roof edge → A-pillar
    const belt = skinLine(2, 0.47, -1.98, side, 0.006, 0.0)
    const roof = skinLine(1, -2.0, 0.14, side, 0.004, -0.004)
    const loop = [...belt, ...roof]
    g.add(tubeAlong(loop, 0.0085, mats.chrome, true))

    // sill chrome strip
    const sillPts = skinLine(5, -1.05, 1.05, side, 0.012, -0.004)
    g.add(tubeAlong(sillPts, 0.01, mats.chrome))

    // door shut lines (fender/door, door/door, door/quarter)
    for (const x of [0.56, -0.44, -1.3]) {
        const pts = []
        const k = halfProfileKnots(x)
        for (let i = 2; i <= 6; i++) {
            const p = new THREE.Vector3(x, k[i][0], k[i][1] * side)
            p.z += 0.003 * side
            pts.push(p)
        }
        g.add(tubeAlong(pts, 0.0028, mats.under))
    }
    // bonnet / fender seam
    const bonnet = skinLine(1, 1.08, 2.26, side, 0.0, 0.004)
    g.add(tubeAlong(bonnet, 0.0028, mats.under))

    // black wheel-arch cladding
    for (const cx of [DIMS.frontAxle, DIMS.rearAxle]) {
        const shape = new THREE.Shape()
        const ro = ARCH_R + 0.05
        const ri = ARCH_R - 0.012
        const a0 = Math.PI + 0.18
        const a1 = -0.18
        shape.absarc(0, 0, ro, a0, a1, true)
        shape.absarc(0, 0, ri, a1, a0, false)
        shape.closePath()
        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: 0.16,
            bevelEnabled: true,
            bevelThickness: 0.012,
            bevelSize: 0.008,
            bevelSegments: 2,
            curveSegments: 40,
        })
        const m = new THREE.Mesh(geo, mats.trim)
        // extrusion runs 0 → 0.16 along +z; park it so 1.2 cm stands proud of the skin
        const zOuter = zShoulder(cx) + 0.012
        m.position.set(cx, ARCH_Y, side > 0 ? zOuter - 0.16 : -zOuter)
        g.add(m)
    }

    // flush door handles (thin dark recess + small chrome tab)
    for (const x of [-0.18, -1.02]) {
        const k = halfProfileKnots(x)
        const z = THREE.MathUtils.lerp(k[2][1], k[3][1], 0.35)
        const y = THREE.MathUtils.lerp(k[2][0], k[3][0], 0.35) - 0.03
        const recess = new THREE.Mesh(new RoundedBoxGeometry(0.17, 0.028, 0.006, 2, 0.003), mats.under)
        recess.position.set(x, y, side * (z + 0.001))
        g.add(recess)
        const tab = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.016, 0.004), mats.chrome)
        tab.position.set(x + 0.07, y, side * (z + 0.004))
        g.add(tab)
    }

    // mirror
    const mx = 0.52
    const mk = halfProfileKnots(mx)
    const mirror = new THREE.Group()
    const housing = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.12, 0.13, 3, 0.045), mats.paint)
    housing.position.set(0, 0, 0)
    const glassFace = new THREE.Mesh(new RoundedBoxGeometry(0.01, 0.1, 0.11, 2, 0.02), mats.lampLens)
    glassFace.position.set(-0.118, 0, 0)
    const stalk = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.03, 0.12, 2, 0.012), mats.trim)
    stalk.position.set(0.02, -0.055, -0.09 * side)
    mirror.add(housing, glassFace, stalk)
    mirror.position.set(mx, mk[2][0] + 0.07, side * (mk[2][1] + 0.1))
    mirror.rotation.y = side * -0.08
    g.add(mirror)

    // roof rail: follows the roof curve
    const railPts = []
    for (let x = -1.95; x <= 0.06; x += 0.1) {
        railPts.push(new THREE.Vector3(x, yTop(x) + 0.012, side * 0.56))
    }
    g.add(tubeAlong(railPts, 0.024, mats.satin))
    for (const rx of [-1.9, 0.0]) {
        const foot = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.04, 0.06, 2, 0.015), mats.trim)
        foot.position.set(rx, yTop(rx) + 0.002, side * 0.56)
        g.add(foot)
    }

    return g
}

/* ------------------------------------------------------------------ */
/* front and rear fascia                                               */

function trapezoid(wTop, wBottom, h) {
    const s = new THREE.Shape()
    s.moveTo(-wBottom / 2, -h / 2)
    s.lineTo(wBottom / 2, -h / 2)
    s.lineTo(wTop / 2, h / 2)
    s.lineTo(-wTop / 2, h / 2)
    s.closePath()
    return s
}

function buildFront(mats) {
    const g = new THREE.Group()
    // the grille sits on the sloping nose between y 0.62 and 0.92
    const yTopG = 0.915
    const yBotG = 0.625
    const yc = (yTopG + yBotG) / 2
    const xAt = (y) => {
        // invert yTop on the nose slope by bisection
        let lo = 2.3
        let hi = X_FRONT
        for (let i = 0; i < 24; i++) {
            const mid = (lo + hi) / 2
            if (yTop(mid) > y) lo = mid
            else hi = mid
        }
        return (lo + hi) / 2
    }
    const xT = xAt(yTopG)
    const xB = xAt(yBotG)
    const tilt = Math.atan2(xT - xB, yTopG - yBotG) // lean back of the nose
    const nose = new THREE.Group()
    nose.position.set((xT + xB) / 2 + 0.012, yc, 0)
    nose.rotation.z = -tilt
    // in `nose` space: local +Y is up the fascia, local +X points out of the car

    const frameOuter = trapezoid(1.14, 0.94, yTopG - yBotG)
    const frameInner = trapezoid(1.1, 0.9, yTopG - yBotG - 0.04)
    frameOuter.holes.push(new THREE.Path(frameInner.getPoints()))
    const frame = new THREE.Mesh(
        new THREE.ExtrudeGeometry(frameOuter, { depth: 0.04, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2 }),
        mats.chrome
    )
    frame.rotation.y = Math.PI / 2
    frame.position.x = -0.02
    nose.add(frame)

    const recess = new THREE.Mesh(new THREE.ExtrudeGeometry(frameInner, { depth: 0.14, bevelEnabled: false }), mats.gloss)
    recess.rotation.y = Math.PI / 2
    recess.position.x = -0.16
    nose.add(recess)

    // waterfall slats: vertical chrome bars bowing outwards in the middle
    const slats = 17
    const h = yTopG - yBotG - 0.05
    for (let i = 0; i < slats; i++) {
        const t = (i + 0.5) / slats - 0.5
        const zTop = t * 1.1
        const zBot = t * 0.9
        const dz = zTop - zBot
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.03, h, 0.016), mats.chrome)
        slat.position.set(-0.035 + 0.03 * Math.cos(t * Math.PI), 0, (zTop + zBot) / 2)
        slat.rotation.x = Math.atan2(dz, h)
        nose.add(slat)
    }
    // badge plinth
    const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 32), mats.chrome)
    badge.rotation.z = Math.PI / 2
    badge.position.set(0.01, 0.06, 0)
    nose.add(badge)
    g.add(nose)

    // headlights: slim units set into the corner, wrapping round into the fender
    for (const side of [1, -1]) {
        const z = (a, b) => (side > 0 ? [a, b] : [-a, -b])
        g.add(facePatch(0.838, 0.912, ...z(0.49, 0.81), 1, 0.001, mats.gloss, 4, 40, 0.03))
        g.add(facePatch(0.845, 0.905, ...z(0.5, 0.8), 1, 0.004, mats.lampLens, 4, 40, 0.025))
        // L-shaped daytime running light
        g.add(facePatch(0.886, 0.898, ...z(0.505, 0.785), 1, 0.009, mats.lampDrl, 1, 40, 0.004))
        g.add(facePatch(0.852, 0.898, ...z(0.505, 0.52), 1, 0.009, mats.lampDrl, 3, 2, 0.004))
    }

    // lower bumper: black mesh intake, chrome lip, corner blades, skid plate
    const intake = new THREE.Mesh(new THREE.ExtrudeGeometry(trapezoid(1.0, 0.92, 0.17), { depth: 0.03, bevelEnabled: false }), mats.gloss)
    intake.rotation.y = Math.PI / 2
    intake.position.set(X_FRONT - 0.022, 0.455, 0)
    g.add(intake)
    const lip = new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.02, 1.0, 2, 0.008), mats.chrome)
    lip.position.set(X_FRONT + 0.004, 0.365, 0)
    g.add(lip)
    for (const side of [1, -1]) {
        const blade = new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.17, 0.028, 2, 0.01), mats.chrome)
        blade.position.set(X_FRONT - 0.006, 0.455, side * 0.505)
        blade.rotation.x = side * 0.1
        g.add(blade)
    }
    const skid = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.05, 0.9, 2, 0.015), mats.satin)
    skid.position.set(X_FRONT - 0.014, 0.32, 0)
    g.add(skid)
    // number plate
    const plate = new THREE.Mesh(new RoundedBoxGeometry(0.008, 0.1, 0.42, 2, 0.004), mats.satin)
    plate.position.set(X_FRONT + 0.01, 0.47, 0)
    g.add(plate)
    return g
}

function buildRear(mats) {
    const g = new THREE.Group()
    const xAt = (y) => {
        let lo = X_REAR
        let hi = -2.28
        for (let i = 0; i < 24; i++) {
            const mid = (lo + hi) / 2
            if (yTop(mid) < y) lo = mid
            else hi = mid
        }
        return (lo + hi) / 2
    }
    // full-width light bar set into the tailgate, wrapping the corners, chrome strip above
    g.add(facePatch(0.94, 0.992, -0.885, 0.885, -1, 0.001, mats.gloss, 4, 110, 0.03))
    g.add(facePatch(0.948, 0.976, -0.87, 0.87, -1, 0.006, mats.lampRed, 3, 110, 0.006))
    g.add(facePatch(0.98, 0.988, -0.875, 0.875, -1, 0.007, mats.chrome, 1, 110, 0.004))
    const tilt = Math.atan2(xAt(0.81) - xAt(0.75), 0.06)

    // number plate recess and plate
    const plateRecess = new THREE.Mesh(new RoundedBoxGeometry(0.01, 0.17, 0.56, 2, 0.006), mats.gloss)
    plateRecess.position.set(xAt(0.78) - 0.004, 0.78, 0)
    plateRecess.rotation.z = -tilt
    g.add(plateRecess)
    const plate = new THREE.Mesh(new RoundedBoxGeometry(0.006, 0.11, 0.44, 2, 0.004), mats.satin)
    plate.position.set(xAt(0.78) - 0.012, 0.78, 0)
    plate.rotation.z = -tilt
    g.add(plate)

    // lower bumper: black diffuser framed in chrome
    const outer = trapezoid(1.34, 1.1, 0.19)
    const inner = trapezoid(1.28, 1.06, 0.15)
    outer.holes.push(new THREE.Path(inner.getPoints()))
    const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(outer, { depth: 0.025, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 2 }), mats.chrome)
    frame.rotation.y = -Math.PI / 2
    frame.position.set(X_REAR + 0.005, 0.44, 0)
    g.add(frame)
    const diffuser = new THREE.Mesh(new THREE.ExtrudeGeometry(inner, { depth: 0.04, bevelEnabled: false }), mats.gloss)
    diffuser.rotation.y = -Math.PI / 2
    diffuser.position.set(X_REAR + 0.02, 0.44, 0)
    g.add(diffuser)
    for (const side of [1, -1]) {
        const refl = new THREE.Mesh(new RoundedBoxGeometry(0.01, 0.025, 0.12, 2, 0.004), mats.lampRed)
        refl.position.set(X_REAR - 0.006, 0.40, side * 0.5)
        g.add(refl)
    }

    // roof spoiler
    const spoiler = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.04, 1.14, 3, 0.018), mats.paint)
    spoiler.position.set(-2.06, yTop(-2.0) - 0.022, 0)
    spoiler.rotation.z = 0.2
    g.add(spoiler)
    const spoilerUnder = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.008, 1.08), mats.gloss)
    spoilerUnder.position.set(-2.08, yTop(-2.0) - 0.05, 0)
    spoilerUnder.rotation.z = 0.2
    g.add(spoilerUnder)
    const brake = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.01, 0.46), mats.lampRed)
    brake.position.set(-2.158, yTop(-2.0) - 0.044, 0)
    brake.rotation.z = 0.2
    g.add(brake)

    // shark fin
    const fin = new THREE.Shape()
    fin.moveTo(-0.1, 0)
    fin.lineTo(0.12, 0)
    fin.lineTo(0.1, 0.03)
    fin.quadraticCurveTo(0.02, 0.07, -0.1, 0.07)
    fin.closePath()
    const finMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(fin, { depth: 0.03, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.012, bevelSegments: 4 }), mats.paint)
    finMesh.position.set(-1.72, yTop(-1.72) - 0.014, -0.015)
    g.add(finMesh)

    // wiper
    const wiper = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.015, 0.5), mats.trim)
    wiper.position.set(-2.265, 1.15, 0.1)
    wiper.rotation.z = -1.1
    g.add(wiper)
    return g
}

/* ------------------------------------------------------------------ */
/* interior silhouettes                                                */

function buildInterior(mats) {
    const g = new THREE.Group()
    const dash = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.22, 1.5, 2, 0.05), mats.interior)
    dash.position.set(0.6, 0.98, 0)
    g.add(dash)
    for (const [x, z] of [
        [-0.25, 0.38],
        [-0.25, -0.38],
        [-1.1, 0.4],
        [-1.1, -0.4],
        [-1.1, 0],
    ]) {
        const seat = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.5, 0.5, 2, 0.08), mats.interior)
        seat.position.set(x, 0.75, z)
        g.add(seat)
        const back = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.62, 0.5, 2, 0.06), mats.interior)
        back.position.set(x - 0.22, 1.06, z)
        back.rotation.z = 0.25
        g.add(back)
        const head = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.18, 0.26, 2, 0.05), mats.interior)
        head.position.set(x - 0.32, 1.42, z)
        g.add(head)
    }
    const floor = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.05, 1.5), mats.interior)
    floor.position.set(-0.7, 0.5, 0)
    g.add(floor)
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.018, 12, 40), mats.interior)
    wheel.position.set(0.25, 1.05, 0.38)
    wheel.rotation.y = Math.PI / 2
    wheel.rotation.x = 0.3
    g.add(wheel)
    return g
}

/* ------------------------------------------------------------------ */
/* wheels                                                              */

function tireTexture() {
    const c = document.createElement('canvas')
    c.width = 1024
    c.height = 256
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, c.width, c.height)
    // circumferential grooves (v = across the tread)
    ctx.fillStyle = '#3a3a3a'
    for (const v of [0.468, 0.5, 0.532]) {
        ctx.fillRect(0, c.height * v - 3, c.width, 6)
    }
    // sipes across the tread blocks
    ctx.fillStyle = '#505050'
    for (let i = 0; i < 64; i++) {
        const x = (i / 64) * c.width
        ctx.save()
        ctx.translate(x, c.height / 2)
        ctx.rotate(0.3)
        ctx.fillRect(-2, -c.height * 0.045, 4, c.height * 0.09)
        ctx.restore()
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    tex.colorSpace = THREE.NoColorSpace
    return tex
}

function buildWheel(mats) {
    const g = new THREE.Group()
    const R = DIMS.wheelRadius
    const r = DIMS.rimRadius
    const w = DIMS.tireWidth

    // tyre (lathe around Y, then the group is rotated so the axle is Z)
    const prof = [
        [r - 0.004, -w / 2 + 0.03],
        [r + 0.02, -w / 2 + 0.012],
        [r + 0.07, -w / 2 + 0.002],
        [R - 0.03, -w / 2 + 0.006],
        [R - 0.008, -w / 2 + 0.03],
        [R, -w / 2 + 0.055],
        [R, w / 2 - 0.055],
        [R - 0.008, w / 2 - 0.03],
        [R - 0.03, w / 2 - 0.006],
        [r + 0.07, w / 2 - 0.002],
        [r + 0.02, w / 2 - 0.012],
        [r - 0.004, w / 2 - 0.03],
    ].map(([rad, y]) => new THREE.Vector2(rad, y))
    const tyreGeo = new THREE.LatheGeometry(prof, 96)
    const rubber = mats.rubber.clone()
    const tex = tireTexture()
    rubber.bumpMap = tex
    rubber.bumpScale = 0.5
    const tyre = new THREE.Mesh(tyreGeo, rubber)
    g.add(tyre)

    // rim barrel + lip
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.006, r - 0.006, w - 0.06, 64, 1, true), mats.wheelDark)
    g.add(barrel)
    const lip = new THREE.Mesh(new THREE.TorusGeometry(r - 0.004, 0.011, 12, 96), mats.wheelBright)
    lip.rotation.x = Math.PI / 2
    lip.position.y = w / 2 - 0.03
    g.add(lip)

    // spokes: 5 twin spokes cut from a disc
    const face = new THREE.Shape()
    face.absarc(0, 0, r - 0.014, 0, Math.PI * 2, false)
    const addHole = (a0, a1, ri, ro) => {
        const p = new THREE.Path()
        p.absarc(0, 0, ro, a0, a1, false)
        p.absarc(0, 0, ri, a1, a0, true)
        p.closePath()
        face.holes.push(p)
    }
    const deg = Math.PI / 180
    for (let k = 0; k < 5; k++) {
        const a = k * 72 * deg
        addHole(a + 15 * deg, a + 57 * deg, 0.078, r - 0.045)
        addHole(a - 3.5 * deg, a + 3.5 * deg, 0.1, r - 0.065)
    }
    const spokeGeo = new THREE.ExtrudeGeometry(face, {
        depth: 0.045,
        bevelEnabled: true,
        bevelThickness: 0.006,
        bevelSize: 0.005,
        bevelSegments: 3,
        curveSegments: 24,
    })
    const spokes = new THREE.Mesh(spokeGeo, mats.wheelBright)
    spokes.rotation.x = -Math.PI / 2
    spokes.position.y = w / 2 - 0.085
    g.add(spokes)
    // hub + nuts
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 32), mats.wheelBright)
    hub.position.y = w / 2 - 0.03
    g.add(hub)
    for (let k = 0; k < 5; k++) {
        const a = k * 72 * deg + 36 * deg
        const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.012, 6), mats.wheelBright)
        nut.position.set(Math.cos(a) * 0.055, w / 2 - 0.036, Math.sin(a) * 0.055)
        g.add(nut)
    }
    // brake disc + caliper
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.028, 64), mats.steel)
    disc.position.y = w / 2 - 0.14
    g.add(disc)
    const caliper = new THREE.Mesh(new RoundedBoxGeometry(0.07, 0.05, 0.13, 2, 0.012), mats.trim)
    caliper.position.set(-0.13, w / 2 - 0.14, 0.09)
    caliper.rotation.y = 0.6
    g.add(caliper)
    // dark drum behind so you can't see through the spokes
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.02, r - 0.02, 0.01, 48), mats.under)
    drum.position.y = w / 2 - 0.16
    g.add(drum)

    g.rotation.x = Math.PI / 2 // axle along Z, face towards +Z
    const wrap = new THREE.Group()
    wrap.add(g)
    return wrap
}

/* ------------------------------------------------------------------ */
/* assembly                                                            */

/**
 * Builds the whole car. Returns { group, materials, wheels } — the
 * group's origin is on the ground under the car's centre.
 */
export function buildCar() {
    const mats = createMaterials()
    const car = new THREE.Group()
    car.name = 'xingyue-l'

    const body = buildBody(mats)
    car.add(body)
    car.add(buildTrim(mats, 1), buildTrim(mats, -1))
    car.add(buildFront(mats), buildRear(mats))
    car.add(buildInterior(mats))

    const wheels = []
    const proto = buildWheel(mats)
    for (const [x, side] of [
        [DIMS.frontAxle, 1],
        [DIMS.frontAxle, -1],
        [DIMS.rearAxle, 1],
        [DIMS.rearAxle, -1],
    ]) {
        const w = proto.clone()
        w.position.set(x, DIMS.wheelRadius, (side * DIMS.track) / 2)
        if (side < 0) w.rotation.y = Math.PI
        car.add(w)
        wheels.push(w)
    }

    car.traverse((o) => {
        if (o.isMesh) {
            o.castShadow = true
            o.receiveShadow = false
        }
    })
    return { group: car, materials: mats, wheels }
}

export const PAINTS = [
    { name: 'Aurora Silver', hex: 0x8d9094, metallic: true },
    { name: 'Obsidian Black', hex: 0x0b0c0f, metallic: true },
    { name: 'Oyster White', hex: 0xe9eae6, metallic: false },
    { name: 'Basalt Grey', hex: 0x4a4d52, metallic: true },
    { name: 'Kingfisher Blue', hex: 0x16314e, metallic: true },
    { name: 'Mars Red', hex: 0x7a0f14, metallic: true },
]

export function applyPaint(materials, paint) {
    const m = materials.paint
    m.color.setHex(paint.hex)
    m.metalness = paint.metallic ? 0.75 : 0.05
    m.roughness = paint.metallic ? 0.42 : 0.5
    m.needsUpdate = true
}
