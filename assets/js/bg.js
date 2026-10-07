/* sarria.ca — scroll-driven 3D background. No dependencies.
 *
 * A fixed WebGL canvas sits behind the home page. Scrolling is the
 * playhead: the page is split into chapters (`[data-chapter]` sections)
 * and the dust field morphs from one formation to the next as each
 * chapter scrolls in — nebula, stream, orbits, warp tunnel, globe,
 * horizon. A gravity well follows the nearest `[data-well]` element;
 * particles spiral into it and the element's `[data-swallow]` children
 * are pulled into the hole as they scroll past the middle of the screen.
 * Scroll velocity stretches the particles into streaks.
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
uniform vec2 uPull;
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
    float ang = q.x * TAU + s * 0.12 + uTime * 0.012;
    float rad = 1.6 + q.y * q.y * 9.0;
    float z = -mod(q.z * 24.0 + s * 1.1, 24.0) - 0.8;
    return vec3(cos(ang) * rad, sin(ang) * rad * 0.55 + (q.w - 0.5) * 2.5, z);
}

/* 1 — stream: a wide river of dust flowing toward the camera. */
vec3 fStream(vec4 q, float s) {
    float z = -mod(q.z * 24.0 + s * 2.2, 24.0) - 0.8;
    float x = (q.x - 0.5) * 22.0 + sin(z * 0.35 + q.w * TAU) * 0.7;
    float y = (q.y - 0.5) * 11.0 + cos(z * 0.25 + q.x * TAU) * 0.4;
    return vec3(x, y, z);
}

/* 2 — orbits: three tilted rings turning around the well. */
vec3 fOrbits(vec4 q, float s) {
    float ring = floor(q.w * 3.0);
    float dir = mod(ring, 2.0) == 0.0 ? 1.0 : -1.0;
    float rad = 1.3 + ring * 0.75 + (q.y - 0.5) * 0.22;
    float ang = q.x * TAU + (s * (0.55 + ring * 0.2) + uTime * 0.02) * dir;
    vec3 p = vec3(cos(ang) * rad, (q.z - 0.5) * 0.12, sin(ang) * rad);
    p = rotX(p, 0.32 + ring * 0.42);
    p = rotZ(p, ring * 1.05 - 0.4);
    return uWell + p;
}

/* 3 — warp: a tunnel streaming past the camera, aimed at the well. */
vec3 fWarp(vec4 q, float s) {
    float ang = q.x * TAU + s * 0.08;
    float rad = 2.0 + q.y * 1.4;
    float z = -mod(q.z * 30.0 + s * 7.0, 30.0) - 0.5;
    vec3 p = vec3(cos(ang) * rad, sin(ang) * rad, z);
    p = rotX(p, atan(uWell.y, -uWell.z));
    p = rotY(p, -atan(uWell.x, -uWell.z));
    return p;
}

/* 4 — globe: a sphere of dust turning behind the well. */
vec3 fGlobe(vec4 q, float s) {
    float phi = acos(1.0 - 2.0 * q.y);
    float th = q.x * TAU + s * 0.3 + uTime * 0.02;
    float rad = 3.3 + (q.z - 0.5) * 0.1;
    if (q.w > 0.94) rad += (q.w - 0.94) * 30.0;
    vec3 p = vec3(sin(phi) * cos(th), cos(phi), sin(phi) * sin(th)) * rad;
    p = rotZ(p, 0.35);
    return vec3(uWell.xy * 1.4, -7.0) + p;
}

/* 5 — horizon: a quiet floor of dust running out to the distance. */
vec3 fHorizon(vec4 q, float s) {
    float x = (q.x - 0.5) * 32.0;
    float z = -mod(q.z * 30.0 + s * 1.4, 30.0) - 0.6;
    float y = -1.5 + (q.y - 0.5) * 0.18 + sin(x * 0.4 + z * 0.3) * 0.1;
    return vec3(x, y, z);
}

vec3 swirl(vec3 p, out float f) {
    vec2 d = p.xy - uWell.xy;
    float r = length(d);
    float R = max(0.05, uPull.y);
    f = uPull.x * exp(-(r * r) / (R * R));
    float ang = atan(d.y, d.x) + f * 2.8;
    float r2 = r * (1.0 - 0.85 * f);
    vec2 g = -d * uPull.x * 0.06;
    return vec3(uWell.xy + vec2(cos(ang), sin(ang)) * r2 + g, mix(p.z, uWell.z, f * 0.5));
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
    return swirl(p, f);
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
    float hl = min(len * 0.5, 110.0 * uDpr);
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
uniform highp vec4 uHole;
uniform float uTime;
void main() {
    vec2 d = gl_FragCoord.xy - uHole.xy;
    float r = length(d) / max(1.0, uHole.z);
    float s = uHole.w;
    float core = s * (1.0 - smoothstep(0.8, 1.0, r));
    float ring = exp(-pow((r - 1.0) * 7.0, 2.0));
    float halo = exp(-max(0.0, r - 1.0) * 2.4) * step(1.0, r) * 0.32;
    float ang = atan(d.y, d.x);
    float lobe = 0.72 + 0.28 * sin(ang + uTime * 0.35);
    float glow = s * (ring * 0.95 + halo) * lobe;
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

    const sections = Array.from(document.querySelectorAll('[data-chapter]'))

    const MODES = {
        full: { pull: 1, hole: 1 },
        dim: { pull: 0.5, hole: 0.4 },
        none: { pull: 0, hole: 0 },
    }
    const wells = Array.from(document.querySelectorAll('[data-well]')).map(
        (el) => ({
            el,
            mode: MODES[el.dataset.well] || MODES.full,
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
        wellX: 0.5,
        wellY: 0.5,
        strength: 0,
        pull: 0,
        radius: 80,
        chapter: 0,
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
        const ease = 1 - Math.exp(-dt * 9)
        const prev = state.scroll
        state.scroll += (y - state.scroll) * ease
        const v = (state.scroll - prev) / dt / vh
        state.vel += (v - state.vel) * (1 - Math.exp(-dt * 12))

        /* chapter: hold each formation, morph as the next section arrives */
        let idx = 0
        const tops = sections.map((s) => s.getBoundingClientRect().top)
        for (let i = 0; i < tops.length; i++) if (tops[i] <= vh * 0.55) idx = i
        let u = 0
        if (idx + 1 < tops.length) {
            u = clamp((vh - tops[idx + 1]) / (vh * 0.45), 0, 1)
        }
        state.chapter = idx + smooth(u)

        /* well: the data-well element nearest the middle of the screen */
        let best = null, bestScore = 0
        for (const w of wells) {
            const r = w.el.getBoundingClientRect()
            if (r.width < 2 || r.height < 2) continue
            const cy = r.top + r.height / 2
            const prox = smooth(clamp(1 - Math.abs(cy - vh * 0.45) / (vh * 0.8), 0, 1))
            const q = clamp((vh * 0.5 - cy) / (vh * 0.6), 0, 1)
            w.rect = r
            w.prox = prox
            w.q = q
            if (w.items.length) w.el.style.setProperty('--q', q.toFixed(3))
            const score = prox * (0.5 + 0.5 * w.mode.pull)
            if (score > bestScore) {
                bestScore = score
                best = w
            }

            /* foreground pulled into the hole */
            for (const it of w.items) {
                const e = Math.pow(q, 1.6)
                const tx = -it.dx * e
                const ty = -it.dy * e - (cy - vh / 2) * 0.08
                const sc = 1 - 0.96 * e
                const rz = e * 160 * it.dir
                const ry = e * 70 * it.dir
                it.el.style.transform =
                    `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) ` +
                    `rotate(${rz.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg) ` +
                    `scale(${sc.toFixed(4)})`
                it.el.style.opacity = (1 - smooth(clamp((q - 0.55) / 0.45, 0, 1))).toFixed(3)
            }
        }

        let tx = 0.5, ty = 0.5, tStrength = 0, tPull = 0, tRadius = state.radius
        if (best) {
            const r = best.rect
            tx = (r.left + r.width / 2) / width
            ty = (r.top + r.height / 2) / vh
            const boost = 1 + Math.min(Math.abs(state.vel), 3) * 0.12
            tStrength = best.prox * best.mode.hole * boost
            tPull = best.prox * best.mode.pull * boost * (1 + best.q * 0.6)
            const base = Math.min(r.width, r.height)
            tRadius = best.mode.hole > 0.5 ? base * (0.18 + 0.22 * best.q) : base * 0.12
        }
        const wEase = 1 - Math.exp(-dt * 6)
        state.wellX += (tx - state.wellX) * wEase
        state.wellY += (ty - state.wellY) * wEase
        state.strength += (tStrength - state.strength) * wEase
        state.pull += (tPull - state.pull) * wEase
        state.radius += (tRadius - state.radius) * wEase

        /* ---------- draw ---------- */

        const aspect = width / vh
        const ndcX = state.wellX * 2 - 1
        const ndcY = 1 - state.wellY * 2
        const vx = (ndcX * aspect * -WELL_Z) / FOCAL
        const vy = (ndcY * -WELL_Z) / FOCAL
        const pullR = ((state.radius / (vh / 2)) * -WELL_Z) / FOCAL * 3.4
        const delta = clamp(state.vel * 0.045, -0.3, 0.3)
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
        gl.uniform2f(pu.uPull, state.pull, pullR)
        gl.drawArrays(gl.TRIANGLES, 0, COUNT * 6)
        gl.disableVertexAttribArray(aSeed)

        if (state.strength > 0.01) {
            gl.useProgram(hole.p)
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
            gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf)
            gl.enableVertexAttribArray(aCornerH)
            gl.vertexAttribPointer(aCornerH, 2, gl.FLOAT, false, 0, 0)
            gl.uniform2f(hole.u.uRes, canvas.width, canvas.height)
            gl.uniform4f(
                hole.u.uHole,
                state.wellX * canvas.width,
                (1 - state.wellY) * canvas.height,
                state.radius * dpr,
                state.strength
            )
            gl.uniform1f(hole.u.uTime, t)
            gl.drawArrays(gl.TRIANGLES, 0, 6)
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
