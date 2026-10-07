/* sarria.ca — scroll-driven 3D background. No dependencies.
 *
 * A fixed WebGL canvas sits behind the home page. Scrolling is the
 * playhead: the page is split into chapters (`[data-chapter]` sections)
 * and the dust field morphs from one formation to the next as each
 * chapter scrolls in — nebula, stream, orbits, warp tunnel, globe,
 * horizon. A gravity well follows the nearest `[data-well]` element and
 * plays that element's effect (`data-well="hole|spawn|portal|shield|
 * dim|none"`): particles gather, ring or scatter around it and its
 * `[data-swallow]` children are swallowed, materialised, flown through
 * a portal or lifted away as they scroll past the middle of the screen.
 * Scroll velocity stretches the particles into streaks, and finishing a
 * chapter sends a shockwave through the field.
 */
(() => {
    'use strict'

    const canvas = document.getElementById('bg')
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        canvas.remove()
        return
    }

    const gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: true,
        powerPreference: 'low-power',
    })
    if (!gl) {
        canvas.remove()
        return
    }

    /* ---------- shaders ---------- */

    const PARTICLE_VS = `
precision highp float;
attribute vec4 aSeed;
attribute vec2 aCorner;
uniform vec2 uRes;
uniform float uDpr;
uniform float uFocal;
uniform float uTime;
uniform float uScroll;
uniform float uDelta;
uniform float uChapter;
uniform vec3 uWell;
uniform vec4 uPull;   // strength, radius, target radius ratio, static twist
uniform vec2 uOrbit;  // orbit rate, tilt out of the screen plane
varying vec2 vUv;
varying float vL;
varying float vAlpha;
varying float vTint;

const float TAU = 6.28318530718;

vec3 rotX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }
vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
vec3 rotZ(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z); }

float weight(float i) {
    float d = abs(uChapter - i);
    return d >= 1.0 ? 0.0 : smoothstep(0.0, 1.0, 1.0 - d);
}

/* 0 — nebula: a slowly turning cloud with a clear core, drifting past. */
vec3 fNebula(vec4 q, float s) {
    float ang = q.x * TAU + s * 0.1 + uTime * 0.012;
    float rad = 1.6 + q.y * q.y * 9.0;
    float z = -mod(q.z * 24.0 + s * 0.9, 24.0) - 0.8;
    return vec3(cos(ang) * rad, sin(ang) * rad * 0.55 + (q.w - 0.5) * 2.5, z);
}

/* 1 — stream: a wide river of dust flowing toward the camera. */
vec3 fStream(vec4 q, float s) {
    float z = -mod(q.z * 24.0 + s * 1.3, 24.0) - 0.8;
    float x = (q.x - 0.5) * 22.0 + sin(z * 0.35 + q.w * TAU) * 0.7;
    float y = (q.y - 0.5) * 11.0 + cos(z * 0.25 + q.x * TAU) * 0.4;
    return vec3(x, y, z);
}

/* 2 — orbits: three tilted rings turning around the well. */
vec3 fOrbits(vec4 q, float s) {
    float ring = floor(q.w * 3.0);
    float dir = mod(ring, 2.0) == 0.0 ? 1.0 : -1.0;
    float rad = 1.3 + ring * 0.75 + (q.y - 0.5) * 0.22;
    float ang = q.x * TAU + (s * (0.4 + ring * 0.15) + uTime * 0.02) * dir;
    vec3 p = vec3(cos(ang) * rad, (q.z - 0.5) * 0.12, sin(ang) * rad);
    p = rotX(p, 0.32 + ring * 0.42);
    p = rotZ(p, ring * 1.05 - 0.4);
    return uWell + p;
}

/* 3 — warp: a tunnel streaming past the camera, aimed at the well. */
vec3 fWarp(vec4 q, float s) {
    float ang = q.x * TAU + s * 0.06;
    float rad = 2.0 + q.y * 1.4;
    float z = -mod(q.z * 30.0 + s * 4.5, 30.0) - 0.5;
    vec3 p = vec3(cos(ang) * rad, sin(ang) * rad, z);
    p = rotX(p, atan(uWell.y, -uWell.z));
    p = rotY(p, -atan(uWell.x, -uWell.z));
    return p;
}

/* 4 — globe: a sphere of dust turning behind the well. */
vec3 fGlobe(vec4 q, float s) {
    float phi = acos(1.0 - 2.0 * q.y);
    float th = q.x * TAU + s * 0.25 + uTime * 0.02;
    float rad = 3.3 + (q.z - 0.5) * 0.1;
    if (q.w > 0.94) rad += (q.w - 0.94) * 30.0;
    vec3 p = vec3(sin(phi) * cos(th), cos(phi), sin(phi) * sin(th)) * rad;
    p = rotZ(p, 0.35);
    return vec3(uWell.xy * 1.4, -7.0) + p;
}

/* 5 — horizon: a quiet floor of dust running out to the distance. */
vec3 fHorizon(vec4 q, float s) {
    float x = (q.x - 0.5) * 32.0;
    float z = -mod(q.z * 30.0 + s * 1.2, 30.0) - 0.6;
    float y = -1.5 + (q.y - 0.5) * 0.18 + sin(x * 0.4 + z * 0.3) * 0.1;
    return vec3(x, y, z);
}

/* The well. Particles inside its radius are drawn toward a target
   radius (0 = swallowed, 1 = a ring, >1 = blown outward), twisted,
   set orbiting and optionally tilted into a 3D shell. */
vec3 swirl(vec3 p, float s, float jitter, out float f) {
    vec2 d = p.xy - uWell.xy;
    float r = length(d);
    float R = max(0.05, uPull.y);
    f = uPull.x * exp(-(r * r) / (R * R));
    float ang = atan(d.y, d.x)
        + f * uPull.w
        + f * uOrbit.x * (s * 0.5 + uTime * 0.22);
    float r2 = mix(r, R * uPull.z * (0.9 + 0.2 * jitter), f);
    vec2 g = -d * uPull.x * 0.04 * clamp(1.0 - uPull.z, 0.0, 1.0);
    float z = mix(p.z, uWell.z + sin(ang) * R * uOrbit.y, f);
    return vec3(uWell.xy + vec2(cos(ang), sin(ang)) * r2 + g, z);
}

vec3 place(vec4 q, float s, out float f) {
    vec3 p = vec3(0.0);
    float w;
    w = weight(0.0); if (w > 0.0) p += w * fNebula(q, s);
    w = weight(1.0); if (w > 0.0) p += w * fStream(q, s);
    w = weight(2.0); if (w > 0.0) p += w * fOrbits(q, s);
    w = weight(3.0); if (w > 0.0) p += w * fWarp(q, s);
    w = weight(4.0); if (w > 0.0) p += w * fGlobe(q, s);
    w = weight(5.0); if (w > 0.0) p += w * fHorizon(q, s);
    return swirl(p, s, q.w, f);
}

void main() {
    vec4 q = aSeed;
    float f0, f1;
    vec3 p1 = place(q, uScroll, f1);
    vec3 p0 = place(q, uScroll - uDelta, f0);
    if (distance(p0, p1) > 1.5) p0 = p1;

    float depth = -p1.z;
    float alpha = smoothstep(26.0, 14.0, depth) * smoothstep(0.3, 1.3, depth);
    alpha *= 0.3 + 0.7 * fract(q.w * 13.7 + q.x * 3.1);
    alpha *= 0.72 + 0.28 * sin(uTime * (0.5 + q.w * 1.1) + q.z * TAU);
    alpha *= 1.0 + f1 * 1.8;

    float big = step(0.982, fract(q.y * 91.7 + q.z * 7.3));
    float wr = (0.005 + 0.011 * fract(q.x * 57.3 + q.w * 11.7)) * (1.0 + big * 2.2);

    float k = uFocal * uRes.y * 0.5;
    vec2 px1 = p1.xy * k / max(0.05, -p1.z);
    vec2 px0 = p0.xy * k / max(0.05, -p0.z);
    float rad = wr * k / max(0.05, depth);
    float minR = 0.8 * uDpr;
    if (rad < minR) { alpha *= pow(rad / minR, 1.6); rad = minR; }
    rad = min(rad, 9.0 * uDpr);

    vec2 axis = px1 - px0;
    float len = length(axis);
    axis = len > 1e-3 ? axis / len : vec2(1.0, 0.0);
    float hl = min(len * 0.5, 80.0 * uDpr);
    vec2 center = px1 - axis * hl;
    vec2 perp = vec2(-axis.y, axis.x);
    vec2 corner = center + axis * aCorner.x * (hl + rad) + perp * aCorner.y * rad;

    vL = hl / rad;
    vUv = vec2(aCorner.x * (vL + 1.0), aCorner.y);
    alpha /= 1.0 + vL * 0.25;
    if (p1.z > -0.25) { alpha = 0.0; corner = vec2(0.0); }

    vAlpha = alpha;
    vTint = clamp(weight(3.0) * 0.75 + f1 * 1.2 + big * 0.2, 0.0, 1.0);
    gl_Position = vec4(corner / (uRes * 0.5), 0.0, 1.0);
}`

    const PARTICLE_FS = `
precision mediump float;
varying vec2 vUv;
varying float vL;
varying float vAlpha;
varying float vTint;
void main() {
    float dx = vUv.x - clamp(vUv.x, -vL, vL);
    float d = length(vec2(dx, vUv.y));
    float a = smoothstep(1.0, 0.25, d) * vAlpha;
    vec3 col = mix(vec3(1.0, 0.97, 0.93), vec3(0.42, 0.7, 1.0), vTint);
    gl_FragColor = vec4(col * a, a);
}`

    /* A dark disc with a bright ring; also used ring-only for portals and
       the chapter shockwave. */
    const HOLE_VS = `
precision highp float;
attribute vec2 aCorner;
uniform vec2 uRes;
uniform vec4 uHole;
void main() {
    vec2 px = uHole.xy + aCorner * uHole.z * 3.2;
    gl_Position = vec4(px / uRes * 2.0 - 1.0, 0.0, 1.0);
}`

    const HOLE_FS = `
precision mediump float;
uniform highp vec4 uHole;  // centre px, radius px, core strength
uniform float uRing;       // ring strength
uniform float uTime;
void main() {
    vec2 d = gl_FragCoord.xy - uHole.xy;
    float r = length(d) / max(1.0, uHole.z);
    float core = uHole.w * (1.0 - smoothstep(0.8, 1.0, r));
    float ring = exp(-pow((r - 1.0) * 7.0, 2.0));
    float halo = exp(-max(0.0, r - 1.0) * 2.4) * step(1.0, r) * 0.32;
    float ang = atan(d.y, d.x);
    float lobe = 0.72 + 0.28 * sin(ang + uTime * 0.35);
    float glow = uRing * (ring * 0.95 + halo) * lobe;
    vec3 col = mix(vec3(1.0), vec3(0.5, 0.75, 1.0), 0.55) * glow;
    gl_FragColor = vec4(col, core);
}`

    const compile = (type, src) => {
        const sh = gl.createShader(type)
        gl.shaderSource(sh, src)
        gl.compileShader(sh)
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(sh) || 'shader error')
        }
        return sh
    }
    const program = (vs, fs) => {
        const p = gl.createProgram()
        gl.attachShader(p, compile(gl.VERTEX_SHADER, vs))
        gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs))
        gl.linkProgram(p)
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(p) || 'link error')
        }
        const u = {}
        const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS)
        for (let i = 0; i < n; i++) {
            const info = gl.getActiveUniform(p, i)
            u[info.name] = gl.getUniformLocation(p, info.name)
        }
        return { p, u }
    }

    let particles, hole
    try {
        particles = program(PARTICLE_VS, PARTICLE_FS)
        hole = program(HOLE_VS, HOLE_FS)
    } catch (err) {
        console.warn('bg: shader setup failed', err)
        canvas.remove()
        return
    }

    /* ---------- geometry ---------- */

    const small = window.matchMedia('(max-width: 734px)').matches
    const COUNT = small ? 3200 : 7000
    const CORNERS = [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]

    // Seeded so the field looks the same on every visit.
    let seed = 0x9e3779b9
    const rand = () => {
        seed = (seed + 0x6d2b79f5) | 0
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }

    const data = new Float32Array(COUNT * 6 * 6)
    for (let i = 0, o = 0; i < COUNT; i++) {
        const a = rand(), b = rand(), c = rand(), d = rand()
        for (let v = 0; v < 6; v++) {
            data[o++] = a
            data[o++] = b
            data[o++] = c
            data[o++] = d
            data[o++] = CORNERS[v * 2]
            data[o++] = CORNERS[v * 2 + 1]
        }
    }
    const particleBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuf)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

    const quadBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(CORNERS), gl.STATIC_DRAW)

    const aSeed = gl.getAttribLocation(particles.p, 'aSeed')
    const aCornerP = gl.getAttribLocation(particles.p, 'aCorner')
    const aCornerH = gl.getAttribLocation(hole.p, 'aCorner')

    /* ---------- page model ---------- */

    const FOCAL = 1.0 / Math.tan((60 * Math.PI) / 360)
    const WELL_Z = -5

    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
    const smooth = (t) => t * t * (3 - 2 * t)
    const ramp = (v, from, to) => smooth(clamp((v - from) / (to - from), 0, 1))

    const sections = Array.from(document.querySelectorAll('[data-chapter]'))

    const wells = Array.from(document.querySelectorAll('[data-well]')).map(
        (el) => ({
            el,
            mode: el.dataset.well || 'hole',
            items: Array.from(el.querySelectorAll('[data-swallow]')).map(
                (item, i) => ({
                    el: item,
                    dir: item.dataset.swallow === 'left' ? -1 : i % 2 ? -1 : 1,
                    dx: 0,
                    dy: 0,
                })
            ),
        })
    )

    // Where each swallowed element sits relative to its well, untransformed.
    const measure = () => {
        for (const w of wells) {
            if (!w.items.length) continue
            for (const it of w.items) it.el.style.transform = ''
            const wr = w.el.getBoundingClientRect()
            const wx = wr.left + wr.width / 2
            const wy = wr.top + wr.height / 2
            for (const it of w.items) {
                const r = it.el.getBoundingClientRect()
                it.dx = r.left + r.width / 2 - wx
                it.dy = r.top + r.height / 2 - wy
            }
        }
    }

    const setItem = (it, tx, ty, sc, rz, ry, opacity) => {
        it.el.style.transform =
            `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) ` +
            `rotate(${rz.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg) ` +
            `scale(${sc.toFixed(4)})`
        it.el.style.opacity = opacity.toFixed(3)
    }

    /* Each effect reads where its element is (cy: centre in viewport px;
       enter: 0→1 as it rises into the middle; leave: 0→1 as it goes out
       the top, starting once it is well past the centre so the picture
       gets its time on screen) and returns the well the background
       should show, after moving the element's own children. */
    const EFFECTS = {
        /* swallowed by a black hole */
        hole(w, c) {
            const e = smooth(c.leave)
            for (const it of w.items) {
                setItem(
                    it,
                    -it.dx * e,
                    -it.dy * e - c.par,
                    1 - 0.96 * e,
                    e * 70 * it.dir,
                    e * 18 * it.dir,
                    1 - ramp(c.leave, 0.5, 0.9)
                )
            }
            return {
                x: c.cx,
                y: c.cy,
                radius: c.base * (0.18 + 0.2 * c.leave),
                pull: c.prox * (1 + 0.5 * c.leave),
                target: 0,
                twist: 2.0,
                orbit: 0.5,
                tilt: 0,
                core: c.prox,
                ring: c.prox,
            }
        },

        /* materialises out of gathered dust, dissolves back into it */
        spawn(w, c) {
            const inA = smooth(c.enter)
            // dissolving is quick and calm, so it may start a little earlier
            const leave = clamp((c.vh * 0.4 - c.cy) / (c.vh * 0.4), 0, 1)
            const out = smooth(leave)
            for (const it of w.items) {
                setItem(
                    it,
                    0,
                    -c.par,
                    0.9 + 0.1 * inA + 0.08 * out,
                    0,
                    0,
                    inA * (1 - ramp(leave, 0.1, 0.55))
                )
            }
            const burst = Math.sin(Math.PI * clamp(leave / 0.75, 0, 1))
            return {
                x: c.cx,
                y: c.cy,
                radius: c.base * 0.45,
                pull: Math.max((1 - inA) * 1.0, burst * 1.1, c.prox * 0.15),
                target: 0.3 + 2.4 * ramp(leave, 0, 0.45),
                twist: 1.2 * (1 - out),
                orbit: 0.4,
                tilt: 0.5,
                core: 0,
                ring: 0,
                weight: Math.max(c.prox, burst * 0.9, (1 - inA) * 0.8),
            }
        },

        /* flies toward the viewer through a ring of light */
        portal(w, c) {
            const e = smooth(c.leave)
            for (const it of w.items) {
                setItem(
                    it,
                    0,
                    -c.par,
                    1 + 0.3 * e,
                    0,
                    0,
                    1 - ramp(c.leave, 0.35, 0.85)
                )
            }
            return {
                x: c.cx,
                y: c.cy,
                radius: c.base * 0.5 * (1 - 0.55 * e),
                pull: c.prox * 0.9,
                target: 1,
                twist: 0.3,
                orbit: 0.6,
                tilt: 0.15,
                core: 0,
                ring: c.prox * (0.5 + 0.7 * c.leave),
            }
        },

        /* wrapped in an orbiting shell, then lifts away with it */
        shield(w, c) {
            const e = smooth(c.leave)
            const sc = 1 - 0.4 * e
            const rise = -c.vh * 0.22 * e
            for (const it of w.items) {
                setItem(it, 0, rise - c.par, sc, 0, 0, 1 - ramp(c.leave, 0.55, 0.95))
            }
            return {
                x: c.cx,
                y: c.cy + rise,
                radius: c.base * 0.6 * sc,
                pull: c.prox * (1 - 0.6 * ramp(c.leave, 0.7, 1)),
                target: 1,
                twist: 0.8,
                orbit: 1.4,
                tilt: 0.75,
                core: 0,
                ring: c.prox * 0.2,
            }
        },

        /* a faint hole the orbit rings turn around */
        dim(w, c) {
            return {
                x: c.cx,
                y: c.cy,
                radius: c.base * 0.12,
                pull: c.prox * 0.5,
                target: 0,
                twist: 1.2,
                orbit: 0.3,
                tilt: 0,
                core: c.prox * 0.4,
                ring: c.prox * 0.4,
            }
        },

        /* position only: aims the tunnel and centres the globe */
        none(w, c) {
            return {
                x: c.cx,
                y: c.cy,
                radius: c.base * 0.3,
                pull: 0,
                target: 0,
                twist: 0,
                orbit: 0,
                tilt: 0,
                core: 0,
                ring: 0,
            }
        },
    }
    const SELECT_WEIGHT = { hole: 1, spawn: 1, portal: 1, shield: 1, dim: 0.75, none: 0.5 }
    const WELL_KEYS = ['radius', 'pull', 'target', 'twist', 'orbit', 'tilt', 'core', 'ring']

    /* ---------- state ---------- */

    let width = 0, height = 0, dpr = 1
    const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2)
        width = window.innerWidth
        height = window.innerHeight
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
        gl.viewport(0, 0, canvas.width, canvas.height)
        measure()
    }

    const state = {
        scroll: window.scrollY,
        vel: 0,
        chapter: 0,
        idx: -1,
        well: { x: 0.5, y: 0.5, radius: 80, pull: 0, target: 0, twist: 0, orbit: 0, tilt: 0, core: 0, ring: 0 },
        pulse: { age: 10, x: 0.5, y: 0.5 },
    }
    let lastTime = performance.now()
    let needsMeasure = true

    const frame = (now) => {
        const dt = clamp((now - lastTime) / 1000, 0.001, 0.05)
        lastTime = now
        if (needsMeasure) {
            needsMeasure = false
            measure()
        }

        const vh = height
        const y = window.scrollY
        const prev = state.scroll
        state.scroll += (y - state.scroll) * (1 - Math.exp(-dt * 10))
        const v = (state.scroll - prev) / dt / vh
        state.vel += (v - state.vel) * (1 - Math.exp(-dt * 12))

        /* chapter: hold each formation, morph as the next section arrives */
        let idx = 0
        const tops = sections.map((s) => s.getBoundingClientRect().top)
        for (let i = 0; i < tops.length; i++) if (tops[i] <= vh * 0.45) idx = i
        let u = 0
        if (idx + 1 < tops.length) {
            u = clamp((vh * 1.05 - tops[idx + 1]) / (vh * 0.6), 0, 1)
        }
        state.chapter = idx + smooth(u)

        /* a shockwave each time a chapter is completed */
        if (state.idx >= 0 && idx !== state.idx) {
            state.pulse = { age: 0, x: state.well.x, y: state.well.y }
        }
        state.idx = idx
        state.pulse.age += dt

        /* well: the data-well element nearest the middle of the screen */
        let bestScore = 0
        let target = null
        for (const w of wells) {
            const r = w.el.getBoundingClientRect()
            if (r.width < 2 || r.height < 2) continue
            const cx = r.left + r.width / 2
            const cy = r.top + r.height / 2
            const c = {
                cx,
                cy,
                vh,
                base: Math.min(r.width, r.height),
                prox: smooth(clamp(1 - Math.abs(cy - vh * 0.45) / (vh * 0.8), 0, 1)),
                enter: clamp((vh * 0.95 - cy) / (vh * 0.45), 0, 1),
                leave: clamp((vh * 0.3 - cy) / (vh * 0.45), 0, 1),
                par: (cy - vh / 2) * 0.08,
            }
            if (w.items.length) w.el.style.setProperty('--q', c.leave.toFixed(3))
            const fx = EFFECTS[w.mode] || EFFECTS.hole
            const t = fx(w, c)
            const score = (t.weight ?? c.prox) * (SELECT_WEIGHT[w.mode] || 1)
            if (score > bestScore) {
                bestScore = score
                target = t
            }
        }

        const S = state.well
        const T = target || {
            x: width / 2, y: vh / 2, radius: S.radius,
            pull: 0, target: 0, twist: 0, orbit: 0, tilt: 0, core: 0, ring: 0,
        }
        const wEase = 1 - Math.exp(-dt * 6)
        S.x += (T.x / width - S.x) * wEase
        S.y += (T.y / vh - S.y) * wEase
        for (const k of WELL_KEYS) S[k] += (T[k] - S[k]) * wEase

        /* ---------- draw ---------- */

        const aspect = width / vh
        const ndcX = S.x * 2 - 1
        const ndcY = 1 - S.y * 2
        const vx = (ndcX * aspect * -WELL_Z) / FOCAL
        const vy = (ndcY * -WELL_Z) / FOCAL
        const pullR = (((S.radius / (vh / 2)) * -WELL_Z) / FOCAL) * (S.target > 0.5 ? 1.6 : 3.4)
        const delta = clamp(state.vel * 0.03, -0.22, 0.22)
        const t = now / 1000

        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.enable(gl.BLEND)

        gl.useProgram(particles.p)
        gl.blendFunc(gl.ONE, gl.ONE)
        gl.bindBuffer(gl.ARRAY_BUFFER, particleBuf)
        gl.enableVertexAttribArray(aSeed)
        gl.vertexAttribPointer(aSeed, 4, gl.FLOAT, false, 24, 0)
        gl.enableVertexAttribArray(aCornerP)
        gl.vertexAttribPointer(aCornerP, 2, gl.FLOAT, false, 24, 16)
        const pu = particles.u
        gl.uniform2f(pu.uRes, canvas.width, canvas.height)
        gl.uniform1f(pu.uDpr, dpr)
        gl.uniform1f(pu.uFocal, FOCAL)
        gl.uniform1f(pu.uTime, t)
        gl.uniform1f(pu.uScroll, state.scroll / vh)
        gl.uniform1f(pu.uDelta, delta)
        gl.uniform1f(pu.uChapter, state.chapter)
        gl.uniform3f(pu.uWell, vx, vy, WELL_Z)
        gl.uniform4f(pu.uPull, S.pull, pullR, S.target, S.twist)
        gl.uniform2f(pu.uOrbit, S.orbit, S.tilt)
        gl.drawArrays(gl.TRIANGLES, 0, COUNT * 6)
        gl.disableVertexAttribArray(aSeed)

        const drawRing = (x, y, radius, core, ring) => {
            gl.uniform4f(hole.u.uHole, x * canvas.width, (1 - y) * canvas.height, radius * dpr, core)
            gl.uniform1f(hole.u.uRing, ring)
            gl.drawArrays(gl.TRIANGLES, 0, 6)
        }
        const pulseAge = state.pulse.age
        const showWell = S.core > 0.01 || S.ring > 0.01
        if (showWell || pulseAge < 1.1) {
            gl.useProgram(hole.p)
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
            gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf)
            gl.enableVertexAttribArray(aCornerH)
            gl.vertexAttribPointer(aCornerH, 2, gl.FLOAT, false, 0, 0)
            gl.uniform2f(hole.u.uRes, canvas.width, canvas.height)
            gl.uniform1f(hole.u.uTime, t)
            if (showWell) drawRing(S.x, S.y, S.radius, S.core, S.ring)
            if (pulseAge < 1.1) {
                const a = pulseAge / 1.1
                drawRing(
                    state.pulse.x,
                    state.pulse.y,
                    40 + smooth(a) * Math.max(width, vh) * 0.9,
                    0,
                    0.7 * (1 - a) * (1 - a)
                )
            }
        }
    }

    /* ---------- loop ---------- */

    let raf = 0
    const loop = (now) => {
        frame(now)
        raf = requestAnimationFrame(loop)
    }
    const start = () => {
        if (raf) return
        lastTime = performance.now()
        raf = requestAnimationFrame(loop)
    }
    const stop = () => {
        cancelAnimationFrame(raf)
        raf = 0
    }

    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', () =>
        document.hidden ? stop() : start()
    )
    window.addEventListener('load', () => {
        needsMeasure = true
    })
    if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(() => {
            needsMeasure = true
        })
        wells.forEach((w) => ro.observe(w.el))
    }

    canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault()
        stop()
        canvas.remove()
    })

    resize()
    document.body.classList.add('has-bg')
    start()
})()
