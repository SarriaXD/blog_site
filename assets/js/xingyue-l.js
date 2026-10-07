/* sarria.ca — Geely Xingyue L (Monjaro) built procedurally in three.js.
 *
 * Coordinates: metres. +X is the front of the car, +Y is up, Z is across
 * the car. The ground is y = 0 and the car is centred on x = 0.
 *
 * The body is a loft: for every station along X we compute one closed
 * cross-section (a rounded polyline) from a handful of longitudinal
 * curves — roof line, belt line, shoulder width, wheel arches — and the
 * stations are stitched into one smooth skin. Lamps, grille, trim and
 * wheels are separate meshes positioned on that skin.
 *
 * Proportions were measured off side, front and rear photographs of the
 * car (Wikimedia Commons) and scaled to the published dimensions.
 */

import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

export const DIMS = {
    length: 4.77,
    width: 1.895,
    height: 1.689,
    wheelbase: 2.845,
    frontAxle: 1.33, // long nose: ~1.05 m front overhang, ~0.87 m rear
    rearAxle: -1.515,
    wheelRadius: 0.368,
    rimRadius: 0.254,
    tireWidth: 0.255,
    track: 1.66,
}

const X_REAR = -2.385
const X_FRONT = 2.385
const Y_FLOOR = 0.2
const ARCH_R = 0.425
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
        const theta = Math.acos(cosT)
        if (theta > Math.PI - 1e-3 || theta < 1e-3) {
            for (let k = 0; k <= segs; k++) out.push([x, y])
            continue
        }
        const half = theta / 2
        let d = r / Math.tan(half)
        const maxD = Math.min(la, lb) * 0.5
        if (d > maxD) d = maxD
        const rr = d * Math.tan(half)
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
        const a1 = Math.atan2(t1y - cy, t1x - cx)
        const a2 = Math.atan2(t2y - cy, t2x - cx)
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
function curve(knots, segs = 14) {
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
// windscreen → bonnet → grille face → front bumper.
const yTop = curve([
    [X_REAR, 0.4, 0],
    [-2.36, 0.58, 0.03],
    [-2.335, 0.98, 0.02],
    [-2.3, 1.07, 0.03],
    [-2.245, 1.13, 0.02],
    [-2.0, 1.515, 0.03],
    [-1.92, 1.56, 0.08],
    [-1.2, 1.612, 0.5],
    [-0.3, 1.616, 0.5],
    [0.4, 1.55, 0.12],
    [1.01, 1.135, 0.07],
    [1.12, 1.125, 0.12],
    [2.2, 1.005, 0.6],
    [2.3, 0.985, 0.03],
    [2.34, 0.935, 0.015],
    [2.372, 0.56, 0.02],
    [X_FRONT, 0.5, 0],
])

// Underside / bumper lower edges.
const yBottom = curve([
    [X_REAR, 0.36, 0],
    [-2.33, 0.3, 0.04],
    [-2.1, Y_FLOOR + 0.02, 0.05],
    [2.2, Y_FLOOR + 0.015, 0.05],
    [2.32, 0.215, 0.03],
    [X_FRONT, 0.24, 0],
])

// Belt line: bottom of the side glass, continuing as the top of the fenders.
const yBelt = curve([
    [X_REAR, 1.0, 0],
    [-2.3, 1.12, 0.05],
    [-2.2, 1.19, 0.1],
    [-1.6, 1.175, 0.4],
    [-1.0, 1.157, 0.4],
    [0.0, 1.145, 0.4],
    [0.95, 1.13, 0.1],
    [1.12, 1.115, 0.1],
    [2.2, 0.985, 0.2],
    [2.3, 0.955, 0.04],
    [X_FRONT, 0.85, 0],
])

// Half width at the shoulder (widest part of the body, mirrors excluded).
const zShoulder = curve([
    [X_REAR, 0.62, 0],
    [-2.35, 0.74, 0.05],
    [-2.28, 0.83, 0.08],
    [-2.1, 0.905, 0.15],
    [-1.8, 0.94, 0.4],
    [1.6, 0.947, 0.5],
    [1.95, 0.92, 0.25],
    [2.18, 0.855, 0.2],
    [2.31, 0.72, 0.1],
    [2.365, 0.6, 0.04],
    [X_FRONT, 0.48, 0],
])

// Half width of the roof side / windscreen edge / bonnet crown edge.
const zRoofEdge = curve([
    [X_REAR, 0.5, 0],
    [-2.3, 0.56, 0.05],
    [-2.0, 0.66, 0.15],
    [-1.5, 0.72, 0.3],
    [-0.3, 0.73, 0.3],
    [0.4, 0.72, 0.1],
    [1.0, 0.8, 0.04],
    [1.12, 0.74, 0.06],
    [2.2, 0.66, 0.2],
    [2.3, 0.58, 0.04],
    [X_FRONT, 0.4, 0],
])

// Half width of the lower bumpers: the bumper corners stand wider than the
// nose and tail above them, which gives the car its planted stance.
const zBumper = curve([
    [X_REAR, 0.42, 0],
    [-2.36, 0.68, 0.08],
    [-2.26, 0.84, 0.12],
    [-2.0, 0.925, 0.3],
    [2.0, 0.925, 0.3],
    [2.26, 0.84, 0.12],
    [2.36, 0.7, 0.08],
    [X_FRONT, 0.5, 0],
])

/** Height of the body's lower edge at the side, lifted over the arches. */
function sideBottom(x) {
    const sill = Math.max(0.245, yBottom(x) + 0.01)
    let y = sill
    for (const cx of [DIMS.frontAxle, DIMS.rearAxle]) {
        const dx = x - cx
        if (Math.abs(dx) < ARCH_R) {
            const arch = ARCH_Y + Math.sqrt(ARCH_R * ARCH_R - dx * dx)
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
// Knot roles, from the roof centre down the +Z side to the floor.
// Segment i of a ring (between knot i and i+1) is used to pick materials.
const SEG = {
    TOP: 0, // roof centre → roof side (roof, windscreen, bonnet)
    GLASS: 1, // roof side → belt line (side glass + pillars / fender top)
    SHOULDER: 2, // belt crease → shoulder crease
    DOOR: 3, // shoulder → mid door
    LOWER: 4, // mid door → sill crease
    SILL: 5, // sill crease → sill bottom
    WELL_TOP: 6,
    WELL: 7,
    FLOOR: 8,
}

/** Half cross-section knots [y, z, r] at station x. */
function halfProfileKnots(x) {
    const top = yTop(x)
    const belt = Math.min(yBelt(x), top - 0.03)
    const zs = zShoulder(x)
    const zr = Math.min(zRoofEdge(x), zs - 0.02)
    const bottom = sideBottom(x)
    const arch = inArch(x)

    const bonnet = smoothstep(1.0, 1.12, x) // 1 on the bonnet
    const screen = smoothstep(0.3, 0.5, x) // 1 from the windscreen forward
    const rear = smoothstep(-2.25, -2.37, x) // 1 on the tailgate
    const tail = smoothstep(-1.95, -2.15, x) // 1 over the rear glass and tailgate
    const zb = Math.max(zs, zBumper(x))

    // Roof side: the roof rounds down a long way to the glass; the
    // windscreen edge, the bonnet crown edge and the tailgate stay flat.
    const p1y = top - lerp(lerp(lerp(0.045, 0.03, screen), 0.02, bonnet), 0.03, tail)
    const p1r = lerp(lerp(0.25, 0.05, bonnet), 0.08, tail)
    // Belt crease / fender top edge.
    const p2y = belt
    const p2z = lerp(zs - 0.035, zs - 0.06, bonnet)
    const p2r = lerp(0.012, 0.05, bonnet)
    // Shoulder line: a sharp crease ~17 cm under the belt.
    let p3y = Math.min(belt - lerp(0.17, 0.15, bonnet), top - 0.12)
    const p3r = 0.012
    const ends = Math.max(smoothstep(1.9, 2.3, x), smoothstep(-2.0, -2.3, x))
    const p3z = lerp(zs - 0.005, zb - 0.02, ends)
    // Mid door — widest point.
    let p4y = 0.62
    const p4z = zb + 0.004
    // Sill crease (chrome strip sits here).
    let p5y = 0.36
    const p5z = zb - 0.05
    // Sill bottom.
    let p6y = bottom
    const p6z = zb - lerp(0.13, 0.06, Math.max(bonnet, rear))
    // Inner wheel well wall.
    const zIn = arch ? 0.52 : p6z - 0.02
    const wellY = arch ? bottom : Math.max(Y_FLOOR, bottom - 0.02)

    p3y = Math.max(p3y, p6y + 0.04)
    if (p4y < p6y + 0.03) p4y = p6y + 0.03
    if (p5y < p6y + 0.015) p5y = p6y + 0.015
    const knots = [
        [top, 0, 0],
        [p1y, zr, p1r],
        [p2y, p2z, p2r],
        [p3y, p3z, p3r],
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
    const segOf = [0]
    for (let i = 1; i < knots.length - 1; i++) {
        for (let k = 0; k <= CORNER_SEGS; k++) segOf.push(k <= CORNER_SEGS / 2 ? i - 1 : i)
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
function knotAt(x, index, side = 1) {
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
    let lo = dir > 0 ? 1.0 : X_REAR
    let hi = dir > 0 ? X_FRONT : -1.0
    for (let i = 0; i < 30; i++) {
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

/** Point and outward normal of the nose/tail skin at (y, z). */
function surfaceAt(y, z, dir) {
    const d = 0.003
    const p = new THREE.Vector3(faceX(y, z, dir), y, z)
    const dy = new THREE.Vector3(faceX(y + d, z, dir), y + d, z).sub(p)
    const dz = new THREE.Vector3(faceX(y, z + d, dir), y, z + d).sub(p)
    const n = new THREE.Vector3().crossVectors(dy, dz).normalize()
    if (dir < 0) n.negate()
    return { p, n }
}

/**
 * A panel set into the nose (dir 1) or tail (dir -1). The panel is a grid
 * over z ∈ [z0, z1]; at parameter t along z its vertical extent is
 * [yLo(t), yHi(t)]. It follows the skin, is pushed `offset` metres out
 * along the surface normal, and has a rim folded back into the body.
 */
function facePatch(z0, z1, yLo, yHi, dir, offset, material, ny = 4, nz = 24, rim = 0.02) {
    const fLo = typeof yLo === 'function' ? yLo : () => yLo
    const fHi = typeof yHi === 'function' ? yHi : () => yHi
    const P = (y, z) => new THREE.Vector3(faceX(y, z, dir), y, z)
    const d = 0.003
    const cols = nz + 1
    const rows = ny + 1
    const pos = []
    const idx = []
    const grid = []
    const push = (v) => pos.push(v.x, v.y, v.z)
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            const t = i / nz
            const z = lerp(z0, z1, t)
            const y = lerp(fLo(t), fHi(t), j / ny)
            const p = P(y, z)
            const dy = P(y + d, z).sub(p)
            const dz = P(y, z + d * Math.sign(z1 - z0 || 1)).sub(p)
            const n = new THREE.Vector3().crossVectors(dy, dz).normalize()
            if (dir < 0) n.negate()
            if (z1 < z0) n.negate()
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
    if ((dir > 0) !== z1 < z0) idx.reverse()
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
        roughness: 0.34,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        envMapIntensity: 1.1,
    })
    const glass = new THREE.MeshPhysicalMaterial({
        color: 0x04050a,
        metalness: 0,
        roughness: 0.04,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        transparent: true,
        opacity: 0.88,
        envMapIntensity: 1.0,
    })
    const gloss = new THREE.MeshPhysicalMaterial({
        color: 0x08090b,
        metalness: 0,
        roughness: 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.0,
    })
    const trim = new THREE.MeshStandardMaterial({ color: 0x111214, metalness: 0, roughness: 0.62, envMapIntensity: 0.8 })
    const under = new THREE.MeshStandardMaterial({ color: 0x08090a, metalness: 0, roughness: 0.95, envMapIntensity: 0.4 })
    const chrome = new THREE.MeshStandardMaterial({ color: 0xe6e7ea, metalness: 1, roughness: 0.09, envMapIntensity: 1.2 })
    const satin = new THREE.MeshStandardMaterial({ color: 0xa9abb0, metalness: 1, roughness: 0.38, envMapIntensity: 1.0 })
    const wheelDark = new THREE.MeshStandardMaterial({ color: 0x2b2d31, metalness: 0.95, roughness: 0.32, envMapIntensity: 1.0 })
    const wheelBright = new THREE.MeshStandardMaterial({ color: 0xd4d6da, metalness: 1, roughness: 0.2, envMapIntensity: 1.1 })
    const rubber = new THREE.MeshStandardMaterial({ color: 0x111214, metalness: 0, roughness: 0.88, envMapIntensity: 0.6 })
    const steel = new THREE.MeshStandardMaterial({ color: 0x5c5e63, metalness: 1, roughness: 0.5 })
    const lampDrl = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf4f7ff, emissiveIntensity: 3, roughness: 0.3 })
    const lampRed = new THREE.MeshPhysicalMaterial({
        color: 0x5a0208,
        emissive: 0xff1a12,
        emissiveIntensity: 2.4,
        roughness: 0.08,
        clearcoat: 1,
        envMapIntensity: 1.2,
    })
    const lampLens = new THREE.MeshPhysicalMaterial({
        color: 0x06070a,
        metalness: 0,
        roughness: 0.3,
        clearcoat: 0.45,
        clearcoatRoughness: 0.12,
        envMapIntensity: 0.6,
    })
    const lampInner = new THREE.MeshStandardMaterial({ color: 0x2a2c30, metalness: 0.9, roughness: 0.25 })
    const interior = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.9, envMapIntensity: 0.3 })
    return { paint, glass, gloss, trim, under, chrome, satin, wheelDark, wheelBright, rubber, steel, lampDrl, lampRed, lampLens, lampInner, interior }
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
        const nearEnd = Math.min(x - X_REAR, X_FRONT - x) < 0.35
        let near = false
        for (const cx of [DIMS.frontAxle, DIMS.rearAxle]) {
            if (Math.abs(Math.abs(x - cx) - ARCH_R) < 0.08) near = true
        }
        const nearCowl = Math.abs(x - 1.05) < 0.15 || Math.abs(x - 0.4) < 0.12
        const nearTail = Math.abs(x + 2.245) < 0.1 || Math.abs(x + 2.0) < 0.1
        x += near ? 0.012 : nearEnd || nearCowl || nearTail ? 0.018 : 0.035
    }
    push(X_FRONT)
    return Array.from(new Set(xs)).sort((a, b) => a - b)
}

// Rear edge of the side glass: the D-pillar leans forward as it rises.
function glassKick(y) {
    return -1.58 - clamp((y - 1.17) / 0.33, 0, 1) * 0.2
}

function bodyMaterialFor(seg, x, y, z) {
    const az = Math.abs(z)
    if (seg >= SEG.WELL_TOP) return MAT.UNDER
    if (seg === SEG.SILL) return MAT.TRIM
    // black lower corners of the front bumper (the inserts with chrome blades)
    if (x > 2.27 && seg >= SEG.SHOULDER && seg <= SEG.LOWER && y < 0.57 && az > 0.55) return MAT.TRIM
    if (x < -2.28 && y < 0.55) return MAT.TRIM // rear bumper's lower section is black
    if (seg === SEG.TOP) {
        if (x > 0.42 && x < 1.0) return MAT.GLASS // windscreen
        if (x > -2.235 && x < -2.01) return MAT.GLASS // rear glass
        if (x > -1.55 && x < 0.1 && az < 0.5) return MAT.GLASS // panoramic roof
        return MAT.PAINT
    }
    if (seg === SEG.GLASS) {
        // side glass with black pillars (A, B, C) up to the D-pillar kick
        if (x < 1.0 && x > glassKick(y)) return MAT.GLASS
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
            const seg = Math.min(r0.segs[j], r0.segs[j1])
            const cx = (xs[i] + xs[i + 1]) / 2
            const cy = (r0.pts[j][0] + r0.pts[j1][0] + r1.pts[j][0] + r1.pts[j1][0]) / 4
            const cz = (r0.pts[j][1] + r0.pts[j1][1] + r1.pts[j][1] + r1.pts[j1][1]) / 4
            const m = bodyMaterialFor(seg, cx, cy, cz)
            faces[m].push(idx(i, j), idx(i, j1), idx(i + 1, j1))
            faces[m].push(idx(i, j), idx(i + 1, j1), idx(i + 1, j))
        }
    }
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
            if (forward) faces[MAT.PAINT].push(a, b, c)
            else faces[MAT.PAINT].push(a, c, b)
        }
    }
    cap(xs.length - 1, true)
    cap(0, false)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    const index = []
    const matList = []
    const lookup = [mats.paint, mats.glass, mats.gloss, mats.under, mats.trim]
    for (const m of [MAT.PAINT, MAT.GLASS, MAT.GLOSS, MAT.UNDER, MAT.TRIM]) {
        const list = faces[m]
        if (!list.length) continue
        geo.addGroup(index.length, list.length, matList.length)
        matList.push(lookup[m])
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
    const geo = new THREE.TubeGeometry(curve3, Math.max(8, points.length * 3), radius, 10, closed)
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

    // chrome belt strip: along the window sills, then up the D-pillar kick
    const belt = skinLine(2, 0.98, -1.56, side, 0.007, 0.0, 0.04)
    const kickTop = knotAt(-1.78, 1, side)
    kickTop.z += 0.006 * side
    kickTop.y -= 0.01
    const kickMid = knotAt(-1.68, 2, side)
    kickMid.y += 0.16
    kickMid.z = THREE.MathUtils.lerp(knotAt(-1.68, 2, side).z, kickTop.z, 0.5)
    belt.push(kickMid, kickTop)
    g.add(tubeAlong(belt, 0.009, mats.chrome))

    // thin black trim along the top of the glass
    const roofTrim = skinLine(1, -1.8, 0.42, side, 0.003, -0.004, 0.06)
    g.add(tubeAlong(roofTrim, 0.006, mats.gloss))

    // sill chrome strip
    const sillPts = skinLine(5, -1.0, 0.95, side, 0.012, -0.004, 0.05)
    g.add(tubeAlong(sillPts, 0.011, mats.chrome))

    // door shut lines (fender/door, door/door, door/quarter)
    for (const x of [0.955, -0.015, -1.02]) {
        const pts = []
        const k = halfProfileKnots(x)
        for (let i = 2; i <= 6; i++) {
            const p = new THREE.Vector3(x, k[i][0], k[i][1] * side)
            p.z += 0.003 * side
            pts.push(p)
        }
        g.add(tubeAlong(pts, 0.0028, mats.under))
    }
    // bonnet / fender seam along the bonnet edge, and the bonnet's rear edge
    g.add(tubeAlong(skinLine(1, 1.12, 2.3, side, 0.0, 0.003, 0.06), 0.0028, mats.under))

    // black wheel-arch cladding
    for (const cx of [DIMS.frontAxle, DIMS.rearAxle]) {
        const shape = new THREE.Shape()
        const ro = ARCH_R + 0.045
        const ri = ARCH_R - 0.012
        const a0 = Math.PI + 0.12
        const a1 = -0.12
        shape.absarc(0, 0, ro, a0, a1, true)
        shape.absarc(0, 0, ri, a1, a0, false)
        shape.closePath()
        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: 0.16,
            bevelEnabled: true,
            bevelThickness: 0.012,
            bevelSize: 0.008,
            bevelSegments: 3,
            curveSegments: 48,
        })
        const m = new THREE.Mesh(geo, mats.trim)
        const zOuter = zShoulder(cx) + 0.014
        m.position.set(cx, ARCH_Y, side > 0 ? zOuter - 0.16 : -zOuter)
        g.add(m)
    }

    // door handles: body-colour pulls with a chrome insert
    for (const x of [-0.13, -1.17]) {
        const k = halfProfileKnots(x)
        const y = 0.975
        const t = clamp((k[2][0] - y) / (k[2][0] - k[3][0]), 0, 1)
        const z = THREE.MathUtils.lerp(k[2][1], k[3][1], t)
        const pull = new THREE.Mesh(new RoundedBoxGeometry(0.19, 0.03, 0.03, 3, 0.012), mats.paint)
        pull.position.set(x, y, side * (z + 0.012))
        g.add(pull)
        const insert = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.012, 0.012, 2, 0.004), mats.chrome)
        insert.position.set(x, y - 0.006, side * (z + 0.026))
        g.add(insert)
    }

    // mirror on the door's front top corner
    const mx = 0.78
    const mk = halfProfileKnots(mx)
    const mirror = new THREE.Group()
    const housing = new THREE.Mesh(new RoundedBoxGeometry(0.25, 0.12, 0.14, 3, 0.05), mats.paint)
    const glassFace = new THREE.Mesh(new RoundedBoxGeometry(0.01, 0.1, 0.12, 2, 0.02), mats.lampLens)
    glassFace.position.set(-0.122, 0, 0)
    const cap = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.012, 0.13, 2, 0.005), mats.chrome)
    cap.position.set(0.01, -0.05, 0)
    const stalk = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.03, 0.12, 2, 0.012), mats.trim)
    stalk.position.set(0.0, -0.045, -0.1 * side)
    mirror.add(housing, glassFace, cap, stalk)
    mirror.position.set(mx, mk[2][0] + 0.03, side * (mk[2][1] + 0.1))
    mirror.rotation.y = side * -0.1
    g.add(mirror)

    // roof rail: follows the roof curve
    const railPts = []
    for (let x = -1.95; x <= 0.36; x += 0.1) railPts.push(new THREE.Vector3(x, yTop(x) + 0.014, side * 0.58))
    g.add(tubeAlong(railPts, 0.024, mats.satin))
    for (const rx of [-1.9, 0.3]) {
        const foot = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.04, 0.06, 2, 0.015), mats.trim)
        foot.position.set(rx, yTop(rx) + 0.002, side * 0.58)
        g.add(foot)
    }
    return g
}

/* ------------------------------------------------------------------ */
/* front and rear fascia                                               */

function trapezoid(wTop, wBottom, h, rBottom = 0) {
    const s = new THREE.Shape()
    if (rBottom > 0) {
        s.moveTo(-wBottom / 2 + rBottom, -h / 2)
        s.lineTo(wBottom / 2 - rBottom, -h / 2)
        s.quadraticCurveTo(wBottom / 2, -h / 2, wBottom / 2 + (rBottom * (wTop - wBottom)) / (2 * h), -h / 2 + rBottom)
        s.lineTo(wTop / 2, h / 2)
        s.lineTo(-wTop / 2, h / 2)
        s.lineTo(-wBottom / 2 - (rBottom * (wTop - wBottom)) / (2 * h), -h / 2 + rBottom)
        s.quadraticCurveTo(-wBottom / 2, -h / 2, -wBottom / 2 + rBottom, -h / 2)
    } else {
        s.moveTo(-wBottom / 2, -h / 2)
        s.lineTo(wBottom / 2, -h / 2)
        s.lineTo(wTop / 2, h / 2)
        s.lineTo(-wTop / 2, h / 2)
    }
    s.closePath()
    return s
}

/** x of the centre-line nose/tail skin at height y. */
function xAtCentre(y, dir) {
    let lo = dir > 0 ? 2.2 : X_REAR
    let hi = dir > 0 ? X_FRONT : -2.2
    for (let i = 0; i < 28; i++) {
        const mid = (lo + hi) / 2
        const above = yTop(mid) > y
        if (dir > 0) {
            if (above) lo = mid
            else hi = mid
        } else if (above) hi = mid
        else lo = mid
    }
    return (lo + hi) / 2
}

function buildFront(mats) {
    const g = new THREE.Group()

    // --- grille: trapezoid, chrome frame, waterfall slats ---
    const yTopG = 0.925
    const yBotG = 0.575
    const yc = (yTopG + yBotG) / 2
    const xT = xAtCentre(yTopG, 1)
    const xB = xAtCentre(yBotG, 1)
    const tilt = Math.atan2(xT - xB, yTopG - yBotG)
    const nose = new THREE.Group()
    nose.position.set((xT + xB) / 2 + 0.01, yc, 0)
    nose.rotation.z = -tilt

    const hG = yTopG - yBotG
    const frameOuter = trapezoid(1.0, 0.8, hG, 0.05)
    const frameInner = trapezoid(0.96, 0.765, hG - 0.04, 0.035)
    frameOuter.holes.push(new THREE.Path(frameInner.getPoints(12)))
    const frame = new THREE.Mesh(
        new THREE.ExtrudeGeometry(frameOuter, { depth: 0.035, bevelEnabled: true, bevelSize: 0.005, bevelThickness: 0.005, bevelSegments: 3, curveSegments: 12 }),
        mats.chrome
    )
    frame.rotation.y = Math.PI / 2
    frame.position.x = -0.018
    nose.add(frame)
    const recess = new THREE.Mesh(new THREE.ExtrudeGeometry(frameInner, { depth: 0.14, bevelEnabled: false, curveSegments: 12 }), mats.gloss)
    recess.rotation.y = Math.PI / 2
    recess.position.x = -0.16
    nose.add(recess)
    // waterfall slats: vertical chrome bars that bow outwards towards the middle
    const slats = 15
    const h = hG - 0.06
    for (let i = 0; i < slats; i++) {
        const t = (i + 0.5) / slats - 0.5
        const zTop = t * 0.9
        const zBot = t * 0.7
        const slat = new THREE.Mesh(new RoundedBoxGeometry(0.03, h, 0.014, 2, 0.004), mats.chrome)
        slat.position.set(-0.04 + 0.03 * Math.cos(t * Math.PI), 0, (zTop + zBot) / 2)
        slat.rotation.x = Math.atan2(zTop - zBot, h)
        nose.add(slat)
    }
    const badge = new THREE.Mesh(new RoundedBoxGeometry(0.014, 0.08, 0.11, 2, 0.02), mats.chrome)
    badge.position.set(0.0, 0.07, 0)
    nose.add(badge)
    g.add(nose)

    // --- headlights: long wedges from the grille corner back along the fender ---
    for (const side of [1, -1]) {
        const zIn = 0.5 * side
        const zOut = 0.905 * side
        // surround (black) → lens → inner reflector detail → DRL lines
        const top = (t) => 0.925 - 0.02 * t
        const bot = (t) => Math.min(lerp(0.77, 0.915, Math.pow(t, 0.8)), top(t) - 0.004)
        g.add(facePatch(zIn - 0.008 * side, zOut + 0.004 * side, (t) => bot(t) - 0.008, (t) => top(t) + 0.006, 1, 0.002, mats.gloss, 4, 48, 0.03))
        g.add(facePatch(zIn, zOut, bot, top, 1, 0.006, mats.lampLens, 4, 48, 0.025))
        // projector units: chrome bezels with a lit centre, sitting in the dark lens
        for (const [zz, yy, rr] of [
            [0.6, 0.845, 0.034],
            [0.73, 0.862, 0.026],
        ]) {
            const { p, n } = surfaceAt(yy, zz * side, 1)
            const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.004, 10, 40), mats.chrome)
            ring.position.copy(p).addScaledVector(n, 0.006)
            ring.lookAt(p.clone().add(n))
            g.add(ring)
            const eye = new THREE.Mesh(new THREE.CircleGeometry(rr - 0.008, 32), mats.lampInner)
            eye.position.copy(p).addScaledVector(n, 0.005)
            eye.lookAt(p.clone().add(n))
            g.add(eye)
        }
        // chrome brow continuing the grille frame along the lamp's top edge
        g.add(facePatch(zIn - 0.01 * side, zOut, (t) => top(t) + 0.004, (t) => top(t) + 0.016, 1, 0.009, mats.chrome, 1, 48, 0.006))
        // daytime running light: top line, inner hook, lower line
        g.add(facePatch(zIn + 0.004 * side, zOut - 0.015 * side, (t) => top(t) - 0.014, (t) => top(t) - 0.007, 1, 0.009, mats.lampDrl, 1, 48, 0.004))
        g.add(facePatch(zIn + 0.004 * side, zIn + 0.012 * side, (t) => bot(0) + 0.02, (t) => top(0) - 0.007, 1, 0.009, mats.lampDrl, 4, 2, 0.004))
        g.add(facePatch(zIn + 0.004 * side, zIn + 0.26 * side, (t) => bot(t * 0.6) + 0.009, (t) => bot(t * 0.6) + 0.016, 1, 0.009, mats.lampDrl, 1, 24, 0.004))
    }

    // --- lower bumper: one wide black intake with slats, the plate on it, and a
    //     chrome lip that curves up at both ends into the corner blades ---
    g.add(facePatch(-0.56, 0.56, 0.305, 0.565, 1, 0.001, mats.gloss, 3, 40, 0.03))
    for (const yy of [0.345, 0.395, 0.445]) {
        g.add(facePatch(-0.54, 0.54, yy - 0.008, yy + 0.008, 1, 0.007, mats.trim, 1, 40, 0.004))
    }
    const plate = new THREE.Mesh(new RoundedBoxGeometry(0.01, 0.14, 0.44, 2, 0.005), mats.satin)
    plate.position.set(xAtCentre(0.5, 1) + 0.014, 0.5, 0)
    plate.rotation.z = -tilt
    g.add(plate)
    const lipLo = (t) => 0.287 + 0.2 * smoothstep(0.84, 1, Math.abs(2 * t - 1))
    g.add(facePatch(-0.7, 0.7, lipLo, (t) => lipLo(t) + 0.016, 1, 0.008, mats.chrome, 1, 80, 0.006))
    for (const side of [1, -1]) {
        // vertical chrome blade on the black corner insert
        g.add(facePatch(0.5 * side, 0.535 * side, 0.3, 0.565, 1, 0.008, mats.chrome, 4, 2, 0.006))
    }
    const skid = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.045, 0.94, 2, 0.015), mats.satin)
    skid.position.set(X_FRONT - 0.016, 0.25, 0)
    g.add(skid)
    return g
}

function buildRear(mats) {
    const g = new THREE.Group()
    const tilt = Math.atan2(xAtCentre(0.84, -1) - xAtCentre(0.78, -1), 0.06)

    // --- light bar across the tailgate, flaring into wedge lamps that wrap the corners ---
    const yBar = 1.005
    const wedgeTop = (t) => yBar + 0.012 + 0.03 * smoothstep(0.55, 1.0, t)
    const wedgeBot = (t) => yBar - 0.012 - 0.03 * smoothstep(0.55, 1.0, t)
    for (const side of [1, -1]) {
        const z0 = 0
        const z1 = 0.94 * side
        g.add(facePatch(z0, z1, (t) => wedgeBot(t) - 0.006, (t) => wedgeTop(t) + 0.004, -1, 0.001, mats.gloss, 4, 70, 0.03))
        g.add(facePatch(z0, z1 - 0.01 * side, wedgeBot, wedgeTop, -1, 0.006, mats.lampRed, 3, 70, 0.006))
        g.add(facePatch(z0, z1 - 0.03 * side, (t) => wedgeTop(t) + 0.005, (t) => wedgeTop(t) + 0.013, -1, 0.008, mats.chrome, 1, 70, 0.004))
    }
    // lettering plinth: a row of small chrome bars
    for (let i = -2; i <= 2; i++) {
        const letter = new THREE.Mesh(new RoundedBoxGeometry(0.006, 0.03, 0.05, 1, 0.002), mats.chrome)
        letter.position.set(xAtCentre(0.95, -1) - 0.004, 0.95, i * 0.1)
        letter.rotation.z = -tilt
        g.add(letter)
    }

    // --- number plate recess ---
    const plateRecess = new THREE.Mesh(new RoundedBoxGeometry(0.012, 0.18, 0.56, 2, 0.008), mats.gloss)
    plateRecess.position.set(xAtCentre(0.76, -1) - 0.004, 0.76, 0)
    plateRecess.rotation.z = -tilt
    g.add(plateRecess)
    const plate = new THREE.Mesh(new RoundedBoxGeometry(0.006, 0.14, 0.44, 2, 0.004), mats.satin)
    plate.position.set(xAtCentre(0.76, -1) - 0.013, 0.76, 0)
    plate.rotation.z = -tilt
    g.add(plate)

    // --- lower bumper: black section with a chrome frame and diffuser ---
    const outer = trapezoid(1.3, 1.08, 0.17, 0.04)
    const inner = trapezoid(1.27, 1.055, 0.148, 0.035)
    outer.holes.push(new THREE.Path(inner.getPoints(10)))
    const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(outer, { depth: 0.02, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 2, curveSegments: 10 }), mats.chrome)
    frame.rotation.y = -Math.PI / 2
    frame.position.set(X_REAR + 0.008, 0.43, 0)
    g.add(frame)
    // matte black diffuser, flush with the bumper face
    const diffuser = new THREE.Mesh(new THREE.ExtrudeGeometry(inner, { depth: 0.05, bevelEnabled: false, curveSegments: 10 }), mats.trim)
    diffuser.rotation.y = -Math.PI / 2
    diffuser.position.set(X_REAR + 0.045, 0.43, 0)
    g.add(diffuser)
    for (const yy of [0.39, 0.43, 0.47]) {
        const fin = new THREE.Mesh(new RoundedBoxGeometry(0.02, 0.012, 1.0, 1, 0.004), mats.under)
        fin.position.set(X_REAR - 0.002, yy, 0)
        g.add(fin)
    }
    for (const side of [1, -1]) {
        const refl = new THREE.Mesh(new RoundedBoxGeometry(0.01, 0.022, 0.14, 2, 0.004), mats.lampRed)
        refl.position.set(X_REAR - 0.004, 0.5, side * 0.52)
        g.add(refl)
    }

    // --- roof spoiler: a thin extension of the roof over the glass ---
    const spoiler = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.036, 1.2, 3, 0.016), mats.paint)
    spoiler.position.set(-2.03, yTop(-1.95) - 0.028, 0)
    spoiler.rotation.z = 0.2
    g.add(spoiler)
    const spoilerUnder = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.008, 1.14), mats.gloss)
    spoilerUnder.position.set(-2.06, yTop(-1.95) - 0.052, 0)
    spoilerUnder.rotation.z = 0.2
    g.add(spoilerUnder)
    const brake = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.01, 0.5), mats.lampRed)
    brake.position.set(-2.158, yTop(-1.95) - 0.054, 0)
    brake.rotation.z = 0.2
    g.add(brake)

    // --- shark fin ---
    const fin = new THREE.Shape()
    fin.moveTo(-0.1, 0)
    fin.lineTo(0.12, 0)
    fin.lineTo(0.1, 0.03)
    fin.quadraticCurveTo(0.02, 0.07, -0.1, 0.07)
    fin.closePath()
    const finMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(fin, { depth: 0.03, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.012, bevelSegments: 4 }), mats.paint)
    finMesh.position.set(-1.7, yTop(-1.7) - 0.014, -0.015)
    g.add(finMesh)

    // --- rear wiper ---
    const wiper = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.014, 0.5), mats.trim)
    wiper.position.set(-2.23, 1.17, 0.12)
    wiper.rotation.z = -1.05
    g.add(wiper)
    return g
}

/* ------------------------------------------------------------------ */
/* interior silhouettes                                                */

function buildInterior(mats) {
    const g = new THREE.Group()
    const dash = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.22, 1.5, 2, 0.05), mats.interior)
    dash.position.set(0.7, 0.97, 0)
    g.add(dash)
    for (const [x, z] of [
        [-0.15, 0.38],
        [-0.15, -0.38],
        [-1.05, 0.4],
        [-1.05, -0.4],
        [-1.05, 0],
    ]) {
        const seat = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.5, 0.5, 2, 0.08), mats.interior)
        seat.position.set(x, 0.8, z)
        g.add(seat)
        const back = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.62, 0.5, 2, 0.06), mats.interior)
        back.position.set(x - 0.22, 1.12, z)
        back.rotation.z = 0.25
        g.add(back)
        const head = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.18, 0.26, 2, 0.05), mats.interior)
        head.position.set(x - 0.32, 1.46, z)
        g.add(head)
    }
    const floor = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.05, 1.5), mats.interior)
    floor.position.set(-0.7, 0.55, 0)
    g.add(floor)
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.018, 12, 40), mats.interior)
    wheel.position.set(0.35, 1.12, 0.38)
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
    ctx.fillStyle = '#3a3a3a'
    for (const v of [0.468, 0.5, 0.532]) ctx.fillRect(0, c.height * v - 3, c.width, 6)
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

    const prof = [
        [r - 0.004, -w / 2 + 0.03],
        [r + 0.02, -w / 2 + 0.012],
        [r + 0.06, -w / 2 + 0.002],
        [R - 0.025, -w / 2 + 0.006],
        [R - 0.007, -w / 2 + 0.03],
        [R, -w / 2 + 0.055],
        [R, w / 2 - 0.055],
        [R - 0.007, w / 2 - 0.03],
        [R - 0.025, w / 2 - 0.006],
        [r + 0.06, w / 2 - 0.002],
        [r + 0.02, w / 2 - 0.012],
        [r - 0.004, w / 2 - 0.03],
    ].map(([rad, y]) => new THREE.Vector2(rad, y))
    const rubber = mats.rubber.clone()
    rubber.bumpMap = tireTexture()
    rubber.bumpScale = 0.5
    g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 112), rubber))

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.006, r - 0.006, w - 0.06, 72, 1, true), mats.wheelDark)
    g.add(barrel)
    const lip = new THREE.Mesh(new THREE.TorusGeometry(r - 0.004, 0.011, 14, 112), mats.wheelBright)
    lip.rotation.x = Math.PI / 2
    lip.position.y = w / 2 - 0.03
    g.add(lip)

    // five Y-shaped twin spokes, machined faces with dark pockets
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
        addHole(a + 18 * deg, a + 54 * deg, 0.08, r - 0.045)
        addHole(a - 2.5 * deg, a + 2.5 * deg, 0.11, r - 0.08)
    }
    const spokes = new THREE.Mesh(
        new THREE.ExtrudeGeometry(face, { depth: 0.045, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.005, bevelSegments: 3, curveSegments: 28 }),
        mats.wheelBright
    )
    spokes.rotation.x = -Math.PI / 2
    spokes.position.y = w / 2 - 0.085
    g.add(spokes)
    // dark spoke flanks: a second, slightly smaller disc behind in gunmetal
    const pockets = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.02, r - 0.02, 0.012, 56), mats.wheelDark)
    pockets.position.y = w / 2 - 0.09
    g.add(pockets)
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 32), mats.wheelBright)
    hub.position.y = w / 2 - 0.03
    g.add(hub)
    for (let k = 0; k < 5; k++) {
        const a = k * 72 * deg + 36 * deg
        const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.012, 6), mats.wheelBright)
        nut.position.set(Math.cos(a) * 0.058, w / 2 - 0.036, Math.sin(a) * 0.058)
        g.add(nut)
    }
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.028, 64), mats.steel)
    disc.position.y = w / 2 - 0.14
    g.add(disc)
    const caliper = new THREE.Mesh(new RoundedBoxGeometry(0.07, 0.05, 0.13, 2, 0.012), mats.trim)
    caliper.position.set(-0.13, w / 2 - 0.14, 0.09)
    caliper.rotation.y = 0.6
    g.add(caliper)
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.02, r - 0.02, 0.01, 48), mats.under)
    drum.position.y = w / 2 - 0.16
    g.add(drum)

    g.rotation.x = Math.PI / 2
    const wrap = new THREE.Group()
    wrap.add(g)
    return wrap
}

/* ------------------------------------------------------------------ */
/* assembly                                                            */

export function buildCar() {
    const mats = createMaterials()
    const car = new THREE.Group()
    car.name = 'xingyue-l'
    car.add(buildBody(mats))
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
    m.roughness = paint.metallic ? 0.34 : 0.45
    m.needsUpdate = true
}
