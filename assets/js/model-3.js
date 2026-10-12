/* sarria.ca — Tesla Model 3 (2024+ "Highland" refresh, Premium trim) built
 * procedurally in three.js.
 *
 * Coordinates: metres. +X is the front of the car, +Y is up, Z is across
 * the car. The ground is y = 0 and the car is centred on x = 0.
 *
 * The body is a loft: for every station along X we compute one closed
 * cross-section (a rounded polyline) from a handful of longitudinal
 * curves — roof line, belt line, shoulder width, wheel arches — and the
 * stations are stitched into one smooth skin. Lamps, intakes, trim and
 * wheels are separate meshes positioned on that skin.
 *
 * Proportions follow the published dimensions (4720 × 1850 × 1441 mm on a
 * 2875 mm wheelbase, 18" Photon wheels on 235/45 tyres) and side, front
 * and rear photographs of the refreshed car: short front overhang, long
 * raked windscreen, roof peaking over the B-pillar, fastback rear glass
 * into a short deck with a ducktail, slim headlamps and C-shaped tail
 * lamps, and every piece of exterior trim in satin black.
 */

import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

export const DIMS = {
    length: 4.72,
    width: 1.85,
    height: 1.441,
    wheelbase: 2.875,
    frontAxle: 1.5, // ~0.86 m front overhang, ~0.985 m rear
    rearAxle: -1.375,
    wheelRadius: 0.334, // 235/45 R18
    rimRadius: 0.2286,
    tireWidth: 0.235,
    track: 1.58,
}

const X_REAR = -2.36
const X_FRONT = 2.36
const Y_FLOOR = 0.14
const ARCH_R = 0.395
const ARCH_Y = DIMS.wheelRadius + 0.01

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

// Key stations along the car.
const X_COWL = 0.85 // windscreen base
const X_HEADER = -0.05 // windscreen header / front glass roof
const X_BPILLAR = -0.36 // cross member between the two glass roof panels
const X_DECK = -2.06 // base of the rear glass, where the trunk lid starts
const X_TAIL = -2.27 // trunk lid edge (ducktail)

// Centre-line top contour: rear bumper → trunk face → trunk lid → rear
// glass → roof → windscreen → bonnet → nose → front bumper.
const yTop = curve([
    [X_REAR, 0.3, 0],
    [-2.35, 0.42, 0.03],
    [-2.335, 0.74, 0.02],
    [-2.32, 0.8, 0.04],
    [-2.29, 0.9, 0.03],
    [X_TAIL, 0.955, 0.035],
    [-2.12, 0.985, 0.2],
    [X_DECK, 1.0, 0.05],
    [-1.3, 1.335, 0.45],
    [-0.65, 1.43, 0.5],
    [-0.15, 1.441, 0.6],
    [0.3, 1.405, 0.45],
    [X_COWL, 1.06, 0.06],
    [0.96, 1.025, 0.1],
    [2.0, 0.79, 0.6],
    [2.24, 0.71, 0.07],
    [2.33, 0.6, 0.035],
    [2.352, 0.46, 0.02],
    [X_FRONT, 0.36, 0],
])

// Underside / bumper lower edges.
const yBottom = curve([
    [X_REAR, 0.29, 0],
    [-2.33, 0.25, 0.04],
    [-2.1, Y_FLOOR + 0.02, 0.05],
    [2.1, Y_FLOOR + 0.015, 0.05],
    [2.3, 0.2, 0.03],
    [X_FRONT, 0.25, 0],
])

// Belt line: bottom of the side glass, continuing as the top of the fenders.
const yBelt = curve([
    [X_REAR, 0.82, 0],
    [-2.3, 0.9, 0.05],
    [-2.1, 0.975, 0.1],
    [-1.6, 1.02, 0.4],
    [-1.0, 1.01, 0.4],
    [0.0, 0.995, 0.4],
    [0.8, 0.985, 0.1],
    [1.15, 0.965, 0.15],
    [2.0, 0.8, 0.25],
    [2.3, 0.7, 0.04],
    [X_FRONT, 0.6, 0],
])

// Half width at the shoulder (widest part of the body, mirrors excluded).
const zShoulder = curve([
    [X_REAR, 0.46, 0],
    [-2.35, 0.52, 0.08],
    [-2.26, 0.69, 0.16],
    [-2.1, 0.815, 0.22],
    [-1.9, 0.885, 0.3],
    [-1.5, 0.925, 0.4],
    [-0.6, 0.92, 0.5],
    [0.9, 0.912, 0.5],
    [1.55, 0.9, 0.3],
    [1.9, 0.865, 0.25],
    [2.1, 0.8, 0.15],
    [2.25, 0.68, 0.1],
    [2.33, 0.52, 0.05],
    [X_FRONT, 0.3, 0],
])

// Half width of the roof side / windscreen edge / bonnet crown edge.
const zRoofEdge = curve([
    [X_REAR, 0.42, 0],
    [-2.3, 0.52, 0.05],
    [X_DECK, 0.6, 0.15],
    [-1.7, 0.64, 0.3],
    [-1.0, 0.66, 0.3],
    [-0.3, 0.655, 0.3],
    [0.3, 0.68, 0.15],
    [X_COWL, 0.75, 0.05],
    [1.0, 0.745, 0.08],
    [2.0, 0.64, 0.2],
    [2.25, 0.5, 0.08],
    [2.33, 0.4, 0.04],
    [X_FRONT, 0.26, 0],
])

// Half width of the lower bumpers. The sedan's bumpers sit just inside
// the shoulder; the corners are softer than the SUV's.
const zBumper = curve([
    [X_REAR, 0.38, 0],
    [-2.35, 0.5, 0.08],
    [-2.26, 0.67, 0.16],
    [-2.1, 0.8, 0.22],
    [-1.9, 0.87, 0.3],
    [2.0, 0.86, 0.3],
    [2.1, 0.82, 0.15],
    [2.25, 0.7, 0.1],
    [2.33, 0.55, 0.05],
    [X_FRONT, 0.34, 0],
])

/** Height of the body's lower edge at the side, lifted over the arches. */
function sideBottom(x) {
    const sill = Math.max(0.215, yBottom(x) + 0.01)
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
    SHOULDER: 2, // belt → shoulder
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

    const bonnet = smoothstep(0.9, 1.05, x) // 1 on the bonnet
    const screen = smoothstep(0.2, 0.5, x) // 1 from the windscreen forward
    const rear = smoothstep(-2.25, -2.34, x) // 1 on the trunk face
    const deck = smoothstep(-1.95, -2.1, x) // 1 over the trunk lid
    const zb = Math.max(zs, zBumper(x))

    // Roof side: the glasshouse has a strong tumblehome, so the roof rounds
    // a long way down into the glass; the bonnet crown and deck are flatter.
    const p1y = top - lerp(lerp(lerp(0.05, 0.035, screen), 0.025, bonnet), 0.03, deck)
    const p1r = lerp(lerp(0.3, 0.06, bonnet), 0.1, deck)
    // Belt / fender top edge: a soft shoulder rather than a crease.
    const p2y = belt
    const p2z = lerp(zs - 0.045, zs - 0.07, bonnet)
    const p2r = lerp(0.035, 0.06, bonnet)
    // Widest line of the flanks, a hand under the belt, with the rear
    // haunch swelling out over the rear arch.
    let p3y = Math.min(belt - lerp(0.13, 0.12, bonnet), top - 0.1)
    const haunch = smoothstep(-0.7, -1.4, x) * (1 - smoothstep(-1.9, -2.2, x))
    const ends = Math.max(smoothstep(1.9, 2.3, x), smoothstep(-2.0, -2.3, x))
    const p3z = lerp(zs - 0.003 + 0.006 * haunch, zb - 0.02, ends)
    const p3r = 0.08
    // Mid door.
    let p4y = 0.58
    const p4z = zb + 0.002
    // Rocker crease: the lower door tucks in towards the sill.
    let p5y = 0.33
    const p5z = zb - 0.045
    // Sill bottom.
    let p6y = bottom
    const p6z = zb - lerp(0.11, 0.05, Math.max(bonnet, rear))
    // Inner wheel well wall.
    const zIn = arch ? 0.5 : p6z - 0.02
    const wellY = arch ? bottom : Math.max(Y_FLOOR, bottom - 0.02)

    p3y = Math.max(p3y, p6y + 0.04)
    if (p4y < p6y + 0.03) p4y = p6y + 0.03
    if (p5y < p6y + 0.015) p5y = p6y + 0.015
    const knots = [
        [top, 0, 0],
        [p1y, zr, p1r],
        [p2y, p2z, p2r],
        [p3y, p3z, p3r],
        [p4y, p4z, 0.3],
        [p5y, p5z, 0.07],
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
        color: 0x55585c,
        metalness: 0.75,
        roughness: 0.4,
        clearcoat: 1,
        // not a mirror: the glTF body is 26k triangles, and a point light's
        // highlight on a near-mirror clearcoat lights one quad at a time,
        // reading as a square sliding over the hood
        clearcoatRoughness: 0.12,
        envMapIntensity: 1.1,
    })
    const glass = new THREE.MeshPhysicalMaterial({
        color: 0x04050a,
        metalness: 0,
        roughness: 0.04,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        transparent: true,
        opacity: 0.9,
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
    // "chrome delete": every bit of brightwork on the refreshed car is satin black
    const trim = new THREE.MeshStandardMaterial({ color: 0x111214, metalness: 0, roughness: 0.62, envMapIntensity: 0.8 })
    const satinBlack = new THREE.MeshStandardMaterial({ color: 0x1c1d20, metalness: 0.6, roughness: 0.42, envMapIntensity: 0.9 })
    const under = new THREE.MeshStandardMaterial({ color: 0x08090a, metalness: 0, roughness: 0.95, envMapIntensity: 0.4 })
    const wheelDark = new THREE.MeshStandardMaterial({ color: 0x1f2024, metalness: 0.85, roughness: 0.36, envMapIntensity: 1.0 })
    const wheelBright = new THREE.MeshStandardMaterial({ color: 0xcfd2d6, metalness: 1, roughness: 0.22, envMapIntensity: 1.1 })
    const rubber = new THREE.MeshStandardMaterial({ color: 0x111214, metalness: 0, roughness: 0.88, envMapIntensity: 0.6 })
    const steel = new THREE.MeshStandardMaterial({ color: 0x5c5e63, metalness: 1, roughness: 0.5 })
    const lampDrl = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf4f7ff, emissiveIntensity: 3, roughness: 0.3 })
    const lampRed = new THREE.MeshPhysicalMaterial({
        color: 0x5a0208,
        emissive: 0xff1a12,
        emissiveIntensity: 2.2,
        roughness: 0.18,
        clearcoat: 1,
        envMapIntensity: 1.1,
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
    const screen = new THREE.MeshStandardMaterial({ color: 0x0a0d12, emissive: 0x1a2634, emissiveIntensity: 0.8, roughness: 0.3 })
    return { paint, glass, gloss, trim, satinBlack, under, wheelDark, wheelBright, rubber, steel, lampDrl, lampRed, lampLens, lampInner, interior, screen }
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
        const nearCowl = Math.abs(x - X_COWL) < 0.15 || Math.abs(x - X_HEADER) < 0.12 || Math.abs(x - X_BPILLAR) < 0.1
        const nearTail = Math.abs(x - X_TAIL) < 0.1 || Math.abs(x - X_DECK) < 0.12
        x += near ? 0.012 : nearEnd || nearCowl || nearTail ? 0.018 : 0.035
    }
    push(X_FRONT)
    return Array.from(new Set(xs)).sort((a, b) => a - b)
}

// Rear edge of the side glass: the C-pillar sweeps forward as it rises.
function glassKick(y) {
    return -1.74 + clamp((y - 1.0) / 0.36, 0, 1) * 0.42
}

function bodyMaterialFor(seg, x, y, z) {
    const az = Math.abs(z)
    if (seg >= SEG.WELL_TOP) return MAT.UNDER
    // black lower sections of both bumpers
    if (x > 2.26 && y < 0.43) return MAT.TRIM
    if (x < -2.3 && y < 0.44) return MAT.TRIM
    if (seg === SEG.TOP) {
        // windscreen, front glass roof, rear glass: one dark run of glass
        // broken only by the cross member over the B-pillar
        if (x > X_BPILLAR - 0.08 && x < X_BPILLAR + 0.04) return MAT.GLOSS
        if (x > X_DECK && x < X_COWL) return MAT.GLASS
        return MAT.PAINT
    }
    if (seg === SEG.GLASS) {
        // side glass with black pillars up to the C-pillar sweep
        if (x < 0.8 && x > glassKick(y)) return MAT.GLASS
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
            if (forward) faces[MAT.UNDER].push(a, b, c)
            else faces[MAT.UNDER].push(a, c, b)
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

    // satin black window surround: along the sills, then up the C-pillar sweep
    const belt = skinLine(2, 0.8, -1.72, side, 0.006, 0.0, 0.04)
    const kickTop = knotAt(-1.32, 1, side)
    kickTop.z += 0.005 * side
    kickTop.y -= 0.008
    const kickMid = knotAt(-1.55, 2, side)
    kickMid.y += 0.17
    kickMid.z = THREE.MathUtils.lerp(knotAt(-1.55, 2, side).z, kickTop.z, 0.5)
    belt.push(kickMid, kickTop)
    g.add(tubeAlong(belt, 0.0075, mats.satinBlack))

    // thin black seal along the top of the glass, A-pillar to C-pillar
    const roofTrim = skinLine(1, -1.34, 0.78, side, 0.003, -0.004, 0.06)
    g.add(tubeAlong(roofTrim, 0.005, mats.gloss))

    // black rocker lip under the sill
    const sillPts = skinLine(6, -1.0, 1.1, side, 0.004, 0.006, 0.05)
    g.add(tubeAlong(sillPts, 0.009, mats.trim))

    // door shut lines (fender/door, door/door, door/quarter)
    for (const x of [0.74, -0.2, -1.2]) {
        const pts = []
        const k = halfProfileKnots(x)
        for (let i = 2; i <= 6; i++) {
            const p = new THREE.Vector3(x, k[i][0], k[i][1] * side)
            p.z += 0.003 * side
            pts.push(p)
        }
        g.add(tubeAlong(pts, 0.0026, mats.under))
    }
    // bonnet / fender seam along the bonnet edge, and the trunk lid seam
    g.add(tubeAlong(skinLine(1, 0.98, 2.25, side, 0.0, 0.003, 0.06), 0.0026, mats.under))
    g.add(tubeAlong(skinLine(1, X_DECK - 0.02, X_TAIL + 0.02, side, 0.0, 0.003, 0.05), 0.0026, mats.under))

    // flush door handles: a slim body-colour blade sunk into a shallow recess
    for (const x of [-0.1, -1.1]) {
        const k = halfProfileKnots(x)
        const y = 0.925
        const t = clamp((k[2][0] - y) / (k[2][0] - k[3][0]), 0, 1)
        const z = THREE.MathUtils.lerp(k[2][1], k[3][1], t)
        const recess = new THREE.Mesh(new RoundedBoxGeometry(0.19, 0.034, 0.012, 2, 0.006), mats.gloss)
        recess.position.set(x, y, side * (z - 0.001))
        g.add(recess)
        const blade = new THREE.Mesh(new RoundedBoxGeometry(0.17, 0.024, 0.012, 2, 0.005), mats.paint)
        blade.position.set(x, y, side * (z + 0.004))
        g.add(blade)
    }

    // side camera repeater on the front fender, behind the arch
    {
        const x = 1.02
        const k = halfProfileKnots(x)
        const y = 0.86
        const t = clamp((k[2][0] - y) / (k[2][0] - k[3][0]), 0, 1)
        const z = THREE.MathUtils.lerp(k[2][1], k[3][1], t)
        const cam = new THREE.Mesh(new RoundedBoxGeometry(0.075, 0.04, 0.014, 2, 0.012), mats.gloss)
        cam.position.set(x, y, side * (z + 0.004))
        g.add(cam)
    }

    // mirror on the door's front top corner: body-colour cap on a black base
    const mx = 0.6
    const mk = halfProfileKnots(mx)
    const mirror = new THREE.Group()
    const housing = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.09, 0.12, 3, 0.04), mats.paint)
    const glassFace = new THREE.Mesh(new RoundedBoxGeometry(0.01, 0.078, 0.1, 2, 0.02), mats.lampLens)
    glassFace.position.set(-0.098, 0, 0)
    const base = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.026, 0.105, 2, 0.012), mats.trim)
    base.position.set(0.0, -0.052, 0)
    const stalk = new THREE.Mesh(new RoundedBoxGeometry(0.09, 0.026, 0.09, 2, 0.012), mats.trim)
    stalk.position.set(0.0, -0.045, -0.075 * side)
    mirror.add(housing, glassFace, base, stalk)
    mirror.position.set(mx, mk[2][0] + 0.03, side * (mk[2][1] + 0.065))
    mirror.rotation.y = side * -0.08
    g.add(mirror)

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
    let lo = dir > 0 ? 2.0 : X_REAR
    let hi = dir > 0 ? X_FRONT : -2.0
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

    // --- headlamps: two thin slivers at the leading edge of the fenders,
    //     a dark lens with the daytime running light along its upper edge ---
    for (const side of [1, -1]) {
        const zIn = 0.34 * side
        const zOut = 0.78 * side
        const top = (t) => 0.79 - 0.045 * Math.pow(t, 1.4)
        const bot = (t) => Math.min(top(t) - lerp(0.042, 0.026, t), top(t) - 0.004)
        g.add(facePatch(zIn - 0.008 * side, zOut + 0.004 * side, (t) => bot(t) - 0.008, (t) => top(t) + 0.006, 1, 0.002, mats.gloss, 4, 48, 0.03))
        g.add(facePatch(zIn, zOut, bot, top, 1, 0.006, mats.lampLens, 4, 48, 0.025))
        // projector hidden deep in the lens
        {
            const { p, n } = surfaceAt(0.762, 0.5 * side, 1)
            const eye = new THREE.Mesh(new THREE.CircleGeometry(0.016, 24), mats.lampInner)
            eye.position.copy(p).addScaledVector(n, 0.004)
            eye.lookAt(p.clone().add(n))
            g.add(eye)
        }
        // DRL: a continuous strip along the top edge of the lamp
        g.add(facePatch(zIn + 0.004 * side, zOut - 0.012 * side, (t) => top(t) - 0.014, (t) => top(t) - 0.006, 1, 0.009, mats.lampDrl, 1, 48, 0.004))
    }

    // --- nose: no grille. A sensor window under the bonnet lip, a wide low
    //     black intake with a body-colour lip above, and black corner inserts ---
    {
        const { p, n } = surfaceAt(0.62, 0, 1)
        const radar = new THREE.Mesh(new RoundedBoxGeometry(0.006, 0.05, 0.13, 2, 0.01), mats.gloss)
        radar.position.copy(p).addScaledVector(n, 0.002)
        radar.lookAt(p.clone().add(n))
        radar.rotateY(Math.PI / 2)
        g.add(radar)
    }
    g.add(facePatch(-0.6, 0.6, 0.27, 0.415, 1, 0.001, mats.gloss, 3, 48, 0.03))
    // honeycomb-ish mesh suggested by three slim black bars
    for (const yy of [0.3, 0.34, 0.38]) {
        g.add(facePatch(-0.58, 0.58, yy - 0.006, yy + 0.006, 1, 0.007, mats.trim, 1, 48, 0.004))
    }
    for (const side of [1, -1]) {
        // vertical corner inserts (the "air curtain" vents)
        g.add(facePatch(0.67 * side, 0.74 * side, (t) => 0.3 + 0.06 * t, (t) => 0.48 - 0.03 * t, 1, 0.002, mats.gloss, 4, 5, 0.02))
        g.add(facePatch(0.688 * side, 0.722 * side, (t) => 0.325 + 0.055 * t, (t) => 0.455 - 0.03 * t, 1, 0.008, mats.trim, 4, 2, 0.004))
    }
    // front plate mount, flat across the lip
    const plate = new THREE.Mesh(new RoundedBoxGeometry(0.008, 0.12, 0.34, 2, 0.005), mats.satinBlack)
    plate.position.set(xAtCentre(0.52, 1) + 0.006, 0.52, 0)
    const tilt = Math.atan2(xAtCentre(0.6, 1) - xAtCentre(0.45, 1), 0.15)
    plate.rotation.z = -tilt
    g.add(plate)
    // lower splitter lip
    const skid = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.03, 0.9, 2, 0.012), mats.trim)
    skid.position.set(X_FRONT - 0.02, 0.235, 0)
    g.add(skid)
    return g
}

function buildRear(mats) {
    const g = new THREE.Group()
    const tilt = Math.atan2(xAtCentre(0.84, -1) - xAtCentre(0.78, -1), 0.06)

    // --- C-shaped tail lamps: a slim red blade across the trunk lid that
    //     thickens as it wraps the corner onto the quarter panel ---
    for (const side of [1, -1]) {
        const z0 = 0.15 * side
        const z1 = 0.76 * side
        const lo = (t) => 0.868 - 0.012 * t - 0.035 * smoothstep(0.55, 1, t)
        const hi = (t) => 0.9 + 0.04 * smoothstep(0.3, 1, t)
        g.add(facePatch(z0 - 0.006 * side, z1 + 0.004 * side, (t) => lo(t) - 0.006, (t) => hi(t) + 0.005, -1, 0.001, mats.gloss, 4, 56, 0.03))
        g.add(facePatch(z0, z1 - 0.01 * side, lo, hi, -1, 0.006, mats.lampLens, 3, 56, 0.006))
        // the lit element, a "C": a strip along the top, a bar down the outer
        // end and a shorter strip back along the bottom
        g.add(facePatch(z0 + 0.004 * side, z1 - 0.024 * side, (t) => hi(t) - 0.024, (t) => hi(t) - 0.006, -1, 0.009, mats.lampRed, 1, 56, 0.004))
        g.add(facePatch(z1 - 0.07 * side, z1 - 0.024 * side, (t) => lo(0.92) + 0.006, (t) => hi(0.92) - 0.006, -1, 0.009, mats.lampRed, 4, 3, 0.004))
        g.add(facePatch(z1 - 0.3 * side, z1 - 0.06 * side, lo(0.92) + 0.006, lo(0.92) + 0.022, -1, 0.009, mats.lampRed, 1, 16, 0.004))
    }
    // "TESLA" lettering: a row of small raised bars on the trunk lid
    for (let i = -2; i <= 2; i++) {
        const letter = new THREE.Mesh(new RoundedBoxGeometry(0.005, 0.024, 0.04, 1, 0.002), mats.satinBlack)
        letter.position.set(xAtCentre(0.81, -1) - 0.003, 0.81, i * 0.068)
        letter.rotation.z = -tilt
        g.add(letter)
    }

    // --- number plate recess in the bumper ---
    const plateRecess = new THREE.Mesh(new RoundedBoxGeometry(0.012, 0.17, 0.54, 2, 0.008), mats.gloss)
    plateRecess.position.set(xAtCentre(0.62, -1) - 0.004, 0.62, 0)
    g.add(plateRecess)
    const plate = new THREE.Mesh(new RoundedBoxGeometry(0.006, 0.13, 0.42, 2, 0.004), mats.satinBlack)
    plate.position.set(xAtCentre(0.62, -1) - 0.013, 0.62, 0)
    g.add(plate)

    // --- lower bumper: black diffuser with reflectors either side ---
    const diffuser = new THREE.Mesh(new THREE.ExtrudeGeometry(trapezoid(1.0, 0.86, 0.1, 0.03), { depth: 0.04, bevelEnabled: false, curveSegments: 10 }), mats.trim)
    diffuser.rotation.y = -Math.PI / 2
    diffuser.position.set(X_REAR + 0.036, 0.35, 0)
    g.add(diffuser)
    for (const yy of [0.33, 0.37]) {
        const fin = new THREE.Mesh(new RoundedBoxGeometry(0.02, 0.01, 0.8, 1, 0.003), mats.under)
        fin.position.set(X_REAR - 0.002, yy, 0)
        g.add(fin)
    }
    for (const side of [1, -1]) {
        const refl = new THREE.Mesh(new RoundedBoxGeometry(0.01, 0.02, 0.1, 2, 0.004), mats.lampRed)
        refl.position.set(xAtCentre(0.47, -1) - 0.003, 0.47, side * 0.62)
        g.add(refl)
    }

    // --- high-mounted brake light at the top of the rear glass ---
    const brake = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.006, 0.36), mats.lampRed)
    brake.position.set(-1.38, yTop(-1.38) - 0.04, 0)
    brake.rotation.z = 0.5
    g.add(brake)
    return g
}

/* ------------------------------------------------------------------ */
/* interior silhouettes                                                */

function buildInterior(mats) {
    const g = new THREE.Group()
    // low, flat dash with the wood-look strip and the landscape screen
    const dash = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.16, 1.45, 2, 0.05), mats.interior)
    dash.position.set(0.72, 0.9, 0)
    g.add(dash)
    const screen = new THREE.Mesh(new RoundedBoxGeometry(0.02, 0.21, 0.36, 2, 0.008), mats.screen)
    screen.position.set(0.38, 1.0, 0)
    screen.rotation.z = -0.15
    g.add(screen)
    for (const [x, z] of [
        [-0.25, 0.37],
        [-0.25, -0.37],
        [-1.1, 0.4],
        [-1.1, -0.4],
        [-1.1, 0],
    ]) {
        const seat = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.36, 0.48, 2, 0.08), mats.interior)
        seat.position.set(x, 0.6, z)
        g.add(seat)
        const back = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.6, 0.48, 2, 0.06), mats.interior)
        back.position.set(x - 0.22, 0.92, z)
        back.rotation.z = 0.3
        g.add(back)
        const head = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.16, 0.24, 2, 0.05), mats.interior)
        head.position.set(x - 0.34, 1.23, z)
        g.add(head)
    }
    const floor = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.05, 1.5), mats.interior)
    floor.position.set(-0.6, 0.42, 0)
    g.add(floor)
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.018, 12, 40), mats.interior)
    wheel.position.set(0.32, 0.95, 0.37)
    wheel.rotation.y = Math.PI / 2
    wheel.rotation.x = 0.35
    g.add(wheel)
    return g
}

/* ------------------------------------------------------------------ */
/* wheels                                                              */

function tireTexture() {
    if (typeof document === 'undefined') return null
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

/** 18" Photon: a near-flat dark aero cover with a ring of bright blades. */
function buildWheel(mats) {
    const g = new THREE.Group()
    const R = DIMS.wheelRadius
    const r = DIMS.rimRadius
    const w = DIMS.tireWidth

    const prof = [
        [r - 0.004, -w / 2 + 0.03],
        [r + 0.02, -w / 2 + 0.012],
        [r + 0.055, -w / 2 + 0.002],
        [R - 0.022, -w / 2 + 0.006],
        [R - 0.006, -w / 2 + 0.028],
        [R, -w / 2 + 0.05],
        [R, w / 2 - 0.05],
        [R - 0.006, w / 2 - 0.028],
        [R - 0.022, w / 2 - 0.006],
        [r + 0.055, w / 2 - 0.002],
        [r + 0.02, w / 2 - 0.012],
        [r - 0.004, w / 2 - 0.03],
    ].map(([rad, y]) => new THREE.Vector2(rad, y))
    const rubber = mats.rubber.clone()
    const bump = tireTexture()
    if (bump) {
        rubber.bumpMap = bump
        rubber.bumpScale = 0.5
    }
    g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 112), rubber))

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.006, r - 0.006, w - 0.06, 72, 1, true), mats.wheelDark)
    g.add(barrel)
    // the aero cover: a shallow dish with a soft outer lip
    const dishProf = [
        [r - 0.004, w / 2 - 0.03],
        [r - 0.012, w / 2 - 0.018],
        [r - 0.03, w / 2 - 0.015],
        [0.12, w / 2 - 0.034],
        [0.07, w / 2 - 0.04],
        [0.0, w / 2 - 0.042],
    ].map(([rad, y]) => new THREE.Vector2(rad, y))
    g.add(new THREE.Mesh(new THREE.LatheGeometry(dishProf, 96), mats.wheelDark))
    // bright blades laid on the dish: each one a slim, slightly twisted vane
    const blades = 7
    for (let k = 0; k < blades; k++) {
        const a = (k / blades) * Math.PI * 2
        const shape = new THREE.Shape()
        shape.moveTo(0.075, -0.012)
        shape.lineTo(r - 0.035, -0.03)
        shape.quadraticCurveTo(r - 0.028, -0.004, r - 0.04, 0.012)
        shape.lineTo(0.08, 0.012)
        shape.closePath()
        const vane = new THREE.Mesh(
            new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.002, bevelSegments: 2, curveSegments: 8 }),
            mats.wheelBright
        )
        vane.rotation.x = -Math.PI / 2
        vane.rotation.z = a
        vane.position.y = w / 2 - 0.034
        g.add(vane)
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.016, 32), mats.wheelDark)
    hub.position.y = w / 2 - 0.026
    g.add(hub)
    const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.004, 24), mats.wheelBright)
    badge.position.y = w / 2 - 0.016
    g.add(badge)
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.026, 64), mats.steel)
    disc.position.y = w / 2 - 0.14
    g.add(disc)
    const caliper = new THREE.Mesh(new RoundedBoxGeometry(0.065, 0.045, 0.12, 2, 0.012), mats.trim)
    caliper.position.set(-0.12, w / 2 - 0.14, 0.085)
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
    car.name = 'model-3'
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

// Current Model 3 palette. Stealth Grey is the no-cost colour.
export const PAINTS = [
    { name: 'Stealth Grey', hex: 0x55585c, metallic: true },
    { name: 'Pearl White Multi-Coat', hex: 0xe9eae7, metallic: false },
    { name: 'Diamond Black', hex: 0x0b0c0e, metallic: true },
    { name: 'Deep Blue Metallic', hex: 0x16304f, metallic: true },
    { name: 'Ultra Red', hex: 0x8a0f17, metallic: true },
    { name: 'Quicksilver', hex: 0x9ea2a6, metallic: true },
]

export function applyPaint(materials, paint) {
    const m = materials.paint
    m.color.setHex(paint.hex)
    m.metalness = paint.metallic ? 0.75 : 0.05
    m.roughness = paint.metallic ? 0.4 : 0.45
    m.needsUpdate = true
}
