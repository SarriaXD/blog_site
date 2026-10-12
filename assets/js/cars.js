/* sarria.ca — /cars: real-time studio render of the Tesla Model 3.
 *
 * three.js is loaded from a CDN through the import map in cars/index.html.
 * The car is built procedurally in model-3.js; if a downloaded glTF is
 * dropped at /assets/models/model-3.glb it is used instead (see GLB
 * below). Lighting is image based (a CC0 studio HDRI from Poly Haven)
 * plus a long overhead softbox; the floor is a planar reflection blurred
 * by how far the reflected surface sits above the floor (read back from
 * the reflection pass's depth) and darkened by a contact shadow baked once
 * the car is in. Bloom and ACES tone mapping run in a half-float post
 * chain. Frames are only rendered while something moves, and the pixel
 * ratio steps down on machines that cannot hold ~30 fps.
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { Reflector } from 'three/addons/objects/Reflector.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js'
import { HorizontalBlurShader } from 'three/addons/shaders/HorizontalBlurShader.js'
import { VerticalBlurShader } from 'three/addons/shaders/VerticalBlurShader.js'
import { buildCar, createMaterials, applyPaint, PAINTS, DIMS } from './model-3.js'

const stage = document.getElementById('stage')
const canvas = stage.querySelector('canvas')
const loading = stage.querySelector('.car-stage__loading')
const viewList = stage.querySelector('[data-views]')
const paintList = stage.querySelector('[data-paints]')
const caption = stage.querySelector('[data-caption]')
const fpsEl = stage.querySelector('[data-fps]')

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const isSmall = window.matchMedia('(max-width: 734px)').matches

/* ------------------------------------------------------------------ */
/* camera presets (Tesla-style view switcher)                          */

const VIEWS = [
    { id: 'hero', label: 'Front ¾', pos: [5.7, 1.35, 4.6], target: [0.75, 0.62, 0.1], fov: 30 },
    { id: 'front', label: 'Front', pos: [7.9, 1.0, 0.5], target: [0.4, 0.6, 0], fov: 28 },
    { id: 'side', label: 'Side', pos: [0.1, 0.9, 8.3], target: [0, 0.66, 0], fov: 28 },
    { id: 'rear34', label: 'Rear ¾', pos: [-5.5, 1.5, 4.5], target: [-0.3, 0.62, 0], fov: 30 },
    { id: 'rear', label: 'Rear', pos: [-7.9, 1.15, -0.4], target: [-0.3, 0.64, 0], fov: 28 },
    { id: 'top', label: 'Top', pos: [1.0, 8.0, 2.4], target: [0, 0.5, 0], fov: 32 },
    { id: 'wheel', label: 'Wheel', pos: [3.5, 0.62, 2.9], target: [1.45, 0.36, 0.72], fov: 24 },
    { id: 'lamp', label: 'Headlight', pos: [3.8, 0.95, 1.8], target: [2.15, 0.76, 0.6], fov: 22 },
]

/* ------------------------------------------------------------------ */
/* optional downloaded model                                           */

// A glTF binary of the car at this path replaces the procedural model.
// The file's longest horizontal axis is turned to lie along x, `nose` says
// which way the car then faces, and it is scaled to the real length and
// stood on the floor. Materials whose name matches `paintName` (or, failing
// that, the opaque one covering the most triangles) become the paint so
// the swatches still work. The committed file is "Tesla model 3 2024" by
// brandonleong28 on Sketchfab, CC BY 4.0, credited in the page footer; its
// material names are opaque, hence the exact match below.
const GLB = {
    url: '/assets/models/model-3.glb',
    nose: '+x',
    paintName: /^Geohoodsub00021Mtl$|paint|carrosserie|exterior|lack/i,
    notPaint: /glass|window|wind|tire|tyre|wheel|rim|interior|seat|light|lamp|lens|chrome|rubber|plastic|black|mirror|logo/i,
}

/* ------------------------------------------------------------------ */
/* renderer                                                            */

function supportsWebGL2() {
    try {
        const c = document.createElement('canvas')
        return !!c.getContext('webgl2')
    } catch {
        return false
    }
}

if (!supportsWebGL2()) {
    loading.textContent = 'This page needs WebGL 2 to render the car.'
    throw new Error('WebGL2 unavailable')
}

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false, // the post chain renders into its own multisampled target
    alpha: false,
    powerPreference: 'high-performance',
})
// Quality levels, stepped down at runtime if frames come in slow.
// `refl` scales the reflection target from the drawing-buffer size; phones
// need more of it because their reflection covers few pixels to begin with.
const QUALITY = [
    { dpr: Math.min(window.devicePixelRatio || 1, isSmall ? 1.25 : 1.5), refl: isSmall ? 0.8 : 0.7, bloom: true },
    { dpr: 1, refl: 0.7, bloom: true },
    { dpr: 1, refl: 0.5, bloom: false },
]
let qualityLevel = 0
let DPR = QUALITY[0].dpr
renderer.setPixelRatio(DPR)
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.1
renderer.setClearColor(0x000000, 1)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80)
camera.position.set(...VIEWS[0].pos)

const controls = new OrbitControls(camera, canvas)
controls.target.set(...VIEWS[0].target)
controls.enableDamping = true
controls.dampingFactor = 0.06
controls.enablePan = false
controls.minDistance = 1.6
controls.maxDistance = 13
controls.minPolarAngle = 0.12
controls.maxPolarAngle = Math.PI / 2 - 0.035
controls.rotateSpeed = 0.6
controls.zoomSpeed = 0.7
controls.autoRotateSpeed = 0.55
controls.update()

/* ------------------------------------------------------------------ */
/* lights                                                              */

// the key is a spot high overhead: a small source, so paint takes a tight
// highlight rather than mirroring a softbox, and a round pool on the floor
const key = new THREE.SpotLight(0xfff4e4, 150, 0, 0.4, 0.35, 2)
key.position.set(0.2, 9, 0.3)
key.target.position.set(0.2, 0, 0.3)
scene.add(key, key.target)

// The softboxes: long strips either side for the highlight lines along the
// shoulder, a cool rim behind, a warm fill in front. They are not scene
// lights. A RectAreaLight is a hard-edged rectangle, and from the angles a
// view change passes through the hood mirrors it as a bright square; so
// they are painted into the environment map instead (paintLights below),
// as soft-edged ellipses that the paint's roughness then filters like any
// other part of the studio. The floor draws the same list analytically.
const ENV_ROTATION = new THREE.Euler(0, Math.PI * 0.42, 0)
function softbox(color, intensity, width, height, position, target) {
    const pos = new THREE.Vector3(...position)
    const away = pos.clone().sub(new THREE.Vector3(...target)).normalize() // the RectAreaLight frame: +z away from the target
    const right = new THREE.Vector3(0, 1, 0).cross(away).normalize()
    const up = away.clone().cross(right)
    return {
        color: new THREE.Color(color),
        intensity,
        position: pos,
        right: right.multiplyScalar(width / 2),
        up: up.multiplyScalar(height / 2),
        normal: away.clone().negate(),
    }
}
const areaLights = [
    softbox(0xffffff, 3.2, 6.5, 0.35, [0, 2.3, 4.4], [0, 0.9, 0]),
    softbox(0xffffff, 3.2, 6.5, 0.35, [0, 2.3, -4.4], [0, 0.9, 0]),
    softbox(0xd9e6ff, 3.2, 1.2, 3.2, [-4.6, 2.3, -3.6], [0, 0.8, 0]),
    softbox(0xfff1e0, 3.4, 4.5, 1.2, [4.5, 1.6, 4.2], [0, 0.8, 0]),
]

/* ------------------------------------------------------------------ */
/* the key light, visible: a spot's cone with dust drifting through it   */

const studio = new THREE.Group()
studio.name = 'studio'
const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 1, 48, 1, true),
    new THREE.ShaderMaterial({
        uniforms: { color: { value: new THREE.Color(0xfff4e4) }, strength: { value: 0.07 } },
        vertexShader: /* glsl */ `
            varying float vY;
            varying vec3 vN;
            varying vec3 vV;
            void main() {
                vY = position.y + 0.5;
                vN = normalize(normalMatrix * normal);
                vec4 mv = modelViewMatrix * vec4(position, 1.0);
                vV = normalize(-mv.xyz);
                gl_Position = projectionMatrix * mv;
            }`,
        fragmentShader: /* glsl */ `
            uniform vec3 color;
            uniform float strength;
            varying float vY;
            varying vec3 vN;
            varying vec3 vV;
            void main() {
                // soft at the silhouette, brightest facing us; the beam gathers
                // toward the source but fades out before the apex, so there is
                // no cut edge to see from any angle
                float edge = pow(abs(dot(normalize(vN), normalize(vV))), 1.6);
                float fall = mix(0.1, 1.0, vY * vY) * (1.0 - smoothstep(0.7, 0.97, vY));
                gl_FragColor = vec4(color * strength * edge * fall, 1.0);
            }`,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
    })
)
// a cone from the spot down to its pool on the floor
const BEAM_R = Math.tan(key.angle) * key.position.y
const BEAM_TOP = 0.08 / BEAM_R // radius at the apex, as a fraction of the floor's
beam.scale.set(BEAM_R, key.position.y, BEAM_R)
beam.position.set(key.position.x, key.position.y / 2, key.position.z)
{
    const pos = beam.geometry.attributes.position
    for (let i = 0; i < pos.count; i++) {
        const t = pos.getY(i) + 0.5 // 1 at the top
        const k = THREE.MathUtils.lerp(1.0, BEAM_TOP, t)
        pos.setX(i, pos.getX(i) * k)
        pos.setZ(i, pos.getZ(i) * k)
    }
    pos.needsUpdate = true
    beam.geometry.computeVertexNormals()
}
studio.add(beam)

/** The beam is for looking at from the floor: let it go as the camera climbs toward the spot. */
function fadeBeam() {
    const k = 1 - THREE.MathUtils.smoothstep(camera.position.y, key.position.y - 3.5, key.position.y - 1.5)
    beam.visible = k > 0.001
    beam.material.uniforms.strength.value = 0.07 * k
    dust.material.opacity = 0.55 * k
}

function dustSprite() {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.35, 'rgba(255,255,255,0.5)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
}
const DUST = 360
const dustPos = new Float32Array(DUST * 3)
const dustSeed = new Float32Array(DUST * 2)
for (let i = 0; i < DUST; i++) {
    const a = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random())
    const y = Math.random()
    const k = THREE.MathUtils.lerp(1.0, BEAM_TOP, y)
    dustPos[i * 3] = key.position.x + Math.cos(a) * r * BEAM_R * k
    dustPos[i * 3 + 1] = y * key.position.y
    dustPos[i * 3 + 2] = key.position.z + Math.sin(a) * r * BEAM_R * k
    dustSeed[i * 2] = Math.random() * Math.PI * 2
    dustSeed[i * 2 + 1] = 0.6 + Math.random() * 0.8
}
const dust = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(dustPos, 3)),
    new THREE.PointsMaterial({
        map: dustSprite(),
        color: 0xfff1d6,
        size: 0.028,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    })
)
studio.add(dust)
scene.add(studio)

/** Drift the motes down through the beam, swaying a little. */
function stepDust(dt, now) {
    const pos = dust.geometry.attributes.position
    const top = key.position.y
    for (let i = 0; i < DUST; i++) {
        let y = pos.getY(i) - dt * 0.07 * dustSeed[i * 2 + 1]
        if (y < 0.02) y += top
        pos.setY(i, y)
        const sway = Math.sin(now * 0.0004 * dustSeed[i * 2 + 1] + dustSeed[i * 2]) * dt * 0.02
        pos.setX(i, pos.getX(i) + sway)
    }
    pos.needsUpdate = true
}

/* ------------------------------------------------------------------ */
/* car                                                                 */

let car = null
let materials = null

/** Orient, scale and ground an imported model; swap its paint for ours. */
function fitImported(root) {
    const mats = createMaterials()
    const group = new THREE.Group()
    group.name = 'model-3-glb'
    group.add(root)
    group.updateMatrixWorld(true)
    let box = new THREE.Box3().setFromObject(group)
    let size = box.getSize(new THREE.Vector3())
    root.rotation.y = (size.z > size.x ? Math.PI / 2 : 0) + (GLB.nose === '-x' ? Math.PI : 0)
    group.updateMatrixWorld(true)
    box = new THREE.Box3().setFromObject(group)
    size = box.getSize(new THREE.Vector3())
    const s = DIMS.length / Math.max(size.x, 1e-6)
    root.scale.setScalar(s)
    group.updateMatrixWorld(true)
    box = new THREE.Box3().setFromObject(group)
    const centre = box.getCenter(new THREE.Vector3())
    root.position.set(-centre.x, -box.min.y, -centre.z)

    // find the paint: by name first, else the biggest opaque material
    const area = new Map()
    const byName = new Set()
    root.traverse((o) => {
        if (!o.isMesh) return
        const list = Array.isArray(o.material) ? o.material : [o.material]
        const n = o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count
        for (const m of list) {
            if (!m) continue
            const name = m.name || ''
            if (GLB.paintName.test(name) && !GLB.notPaint.test(name)) byName.add(m)
            if (!m.transparent && !GLB.notPaint.test(name)) area.set(m, (area.get(m) || 0) + n / list.length)
        }
    })
    let paintMats = byName
    if (!paintMats.size && area.size) {
        const best = [...area.entries()].sort((a, b) => b[1] - a[1])[0][0]
        paintMats = new Set([best])
    }
    root.traverse((o) => {
        if (!o.isMesh) return
        const swap = (m) => (paintMats.has(m) ? mats.paint : m)
        o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material)
        const list = Array.isArray(o.material) ? o.material : [o.material]
        for (const m of list) {
            if (!m || m === mats.paint) continue
            if ('envMapIntensity' in m) m.envMapIntensity = 1.0
            // roughness 0 on big surfaces turns the HDRI into sparkle; keep a little
            if ('roughness' in m) m.roughness = Math.max(m.roughness, m.transparent ? 0.06 : 0.28)
        }
    })
    return { group, materials: mats }
}

async function loadCar() {
    try {
        const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js')
        const gltf = await new GLTFLoader().loadAsync(GLB.url, (e) => {
            if (loading && e.lengthComputable) loading.textContent = `Loading the car… ${Math.round((100 * e.loaded) / e.total)}%`
        })
        stage.dataset.model = 'glb'
        return fitImported(gltf.scene)
    } catch {
        stage.dataset.model = 'procedural'
        return buildCar()
    }
}

/* ------------------------------------------------------------------ */
/* contact shadow baked once (car is static)                           */

const SHADOW_HALF = new THREE.Vector2(3.4, 1.8)
const SHADOW_RES = 1024

function bakeContactShadow() {
    const rtA = new THREE.WebGLRenderTarget(SHADOW_RES, SHADOW_RES / 2, { depthBuffer: true })
    const rtB = new THREE.WebGLRenderTarget(SHADOW_RES, SHADOW_RES / 2, { depthBuffer: false })
    const cam = new THREE.OrthographicCamera(-SHADOW_HALF.x, SHADOW_HALF.x, SHADOW_HALF.y, -SHADOW_HALF.y, 0, 1.75)
    cam.position.set(0, 0, 0)
    cam.rotation.x = Math.PI / 2 // look straight up
    const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.BasicDepthPacking })
    const tmp = new THREE.Scene()
    tmp.overrideMaterial = depth
    tmp.add(car)

    const prevRT = renderer.getRenderTarget()
    const prevClear = renderer.getClearColor(new THREE.Color())
    const prevAlpha = renderer.getClearAlpha()
    renderer.setRenderTarget(rtA)
    renderer.setClearColor(0x000000, 1)
    renderer.clear()
    renderer.render(tmp, cam)
    scene.add(car)

    // separable blur, two rounds
    const quadScene = new THREE.Scene()
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const hMat = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(HorizontalBlurShader.uniforms),
        vertexShader: HorizontalBlurShader.vertexShader,
        fragmentShader: HorizontalBlurShader.fragmentShader,
    })
    const vMat = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(VerticalBlurShader.uniforms),
        vertexShader: VerticalBlurShader.vertexShader,
        fragmentShader: VerticalBlurShader.fragmentShader,
    })
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), hMat)
    quadScene.add(quad)
    for (const amount of [2.2, 1.1]) {
        quad.material = hMat
        hMat.uniforms.tDiffuse.value = rtA.texture
        hMat.uniforms.h.value = amount / SHADOW_RES
        renderer.setRenderTarget(rtB)
        renderer.render(quadScene, quadCam)
        quad.material = vMat
        vMat.uniforms.tDiffuse.value = rtB.texture
        vMat.uniforms.v.value = amount / (SHADOW_RES / 2)
        renderer.setRenderTarget(rtA)
        renderer.render(quadScene, quadCam)
    }
    renderer.setRenderTarget(prevRT)
    renderer.setClearColor(prevClear, prevAlpha)
    rtB.dispose()
    quad.geometry.dispose()
    return rtA.texture
}

/* ------------------------------------------------------------------ */
/* floor: blurred planar reflection + contact shadow                   */

/** Soft value noise for the floor's mottling, tiled in world space. */
function noiseTexture() {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 256
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, 256, 256)
    for (const [cells, amp] of [
        [6, 0.5],
        [16, 0.3],
        [40, 0.2],
    ]) {
        const small = document.createElement('canvas')
        small.width = cells
        small.height = cells
        const sc = small.getContext('2d')
        const img = sc.createImageData(cells, cells)
        for (let i = 0; i < cells * cells; i++) {
            const v = Math.round(128 + (Math.random() - 0.5) * 255 * amp)
            img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v
            img.data[i * 4 + 3] = 255
        }
        sc.putImageData(img, 0, 0)
        ctx.globalAlpha = amp
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(small, 0, 0, 256, 256)
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.colorSpace = THREE.NoColorSpace
    return tex
}

const NLIGHTS = areaLights.length
const floorShader = {
    name: 'StudioFloor',
    uniforms: {
        color: { value: new THREE.Color(0x1a1b1e) },
        tDiffuse: { value: null },
        tBlur1: { value: null },
        tBlur2: { value: null },
        tBlur3: { value: null },
        tBlur4: { value: null },
        textureMatrix: { value: new THREE.Matrix4() },
        tShadow: { value: null },
        shadowRect: { value: new THREE.Vector4(0, 0, SHADOW_HALF.x, SHADOW_HALF.y) },
        tDepth: { value: null },
        invProj: { value: new THREE.Matrix4() },
        camWorld: { value: new THREE.Matrix4() },
        projScale: { value: new THREE.Vector2(1, 1) },
        texel: { value: new THREE.Vector2(1 / 1024, 1 / 1024) },
        tEnv: { value: null },
        envRot: { value: new THREE.Matrix3() },
        envStrength: { value: 0.0 },
        tNoise: { value: null },
        strength: { value: 0.85 },
        lightPos: { value: areaLights.map((l) => l.position) },
        lightRight: { value: areaLights.map((l) => l.right) },
        lightUp: { value: areaLights.map((l) => l.up) },
        lightNormal: { value: areaLights.map((l) => l.normal) },
        lightColor: { value: areaLights.map((l) => l.color.clone().multiplyScalar(l.intensity * 0.12)) },
    },
    vertexShader: /* glsl */ `
        uniform mat4 textureMatrix;
        varying vec4 vUv;
        varying vec3 vWorld;
        #include <common>
        #include <logdepthbuf_pars_vertex>
        void main() {
            vUv = textureMatrix * vec4(position, 1.0);
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorld = wp.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            #include <logdepthbuf_vertex>
        }`,
    // Reflector only copies uniforms and shaders, not defines, so the light
    // count is spliced into the source
    fragmentShader: `#define NLIGHTS ${NLIGHTS}\n` + /* glsl */ `
        uniform vec3 color;
        uniform sampler2D tDiffuse;
        uniform sampler2D tBlur1;
        uniform sampler2D tBlur2;
        uniform sampler2D tBlur3;
        uniform sampler2D tBlur4;
        uniform sampler2D tShadow;
        uniform sampler2D tDepth;
        uniform sampler2D tEnv;
        uniform sampler2D tNoise;
        uniform vec4 shadowRect;
        uniform mat4 invProj;
        uniform mat4 camWorld;
        uniform mat3 envRot;
        uniform vec2 projScale;
        uniform vec2 texel;
        uniform float strength;
        uniform float envStrength;
        uniform vec3 lightPos[NLIGHTS];
        uniform vec3 lightRight[NLIGHTS];
        uniform vec3 lightUp[NLIGHTS];
        uniform vec3 lightNormal[NLIGHTS];
        uniform vec3 lightColor[NLIGHTS];
        varying vec4 vUv;
        varying vec3 vWorld;
        #include <common>
        #include <logdepthbuf_pars_fragment>

        // Height above the floor of the surface seen in the reflection at
        // uv, and its distance from the (virtual) camera, from the depth
        // the reflection pass wrote.
        vec2 probe(vec2 uv) {
            float z = texture2D(tDepth, uv).r;
            vec4 p = invProj * vec4(uv * 2.0 - 1.0, z * 2.0 - 1.0, 1.0);
            p /= p.w;
            float h = (camWorld * p).y;
            return vec2(clamp(h, 0.0, 4.0), max(-p.z, 0.05));
        }

        // The reflection, blurred by a radius in level-0 texels: pick from
        // the pre-blurred pyramid so a wide blur costs nothing extra.
        vec4 reflection(vec2 uv, float radiusPx) {
            float L = clamp(log2(max(radiusPx, 1.0)) - 0.5, 0.0, 4.0);
            float f = fract(L);
            int i = int(floor(L));
            vec4 a;
            vec4 b;
            if (i == 0) { a = texture2D(tDiffuse, uv); b = texture2D(tBlur1, uv); }
            else if (i == 1) { a = texture2D(tBlur1, uv); b = texture2D(tBlur2, uv); }
            else if (i == 2) { a = texture2D(tBlur2, uv); b = texture2D(tBlur3, uv); }
            else { a = texture2D(tBlur3, uv); b = texture2D(tBlur4, uv); }
            return mix(a, b, f);
        }

        void main() {
            #include <logdepthbuf_fragment>
            vec3 V = normalize(cameraPosition - vWorld);
            vec3 N = vec3(0.0, 1.0, 0.0);
            float NdV = clamp(V.y, 0.0, 1.0);
            float d = length(vWorld.xz);

            // floor material: dark epoxy with faint mottling in tone and gloss
            vec2 nuv = vWorld.xz * 0.16;
            float n1 = texture2D(tNoise, nuv).r;
            float n2 = texture2D(tNoise, nuv * 2.9 + vec2(0.37, 0.11)).r;
            float tone = 0.86 + 0.28 * n1;
            float gloss = 0.82 + 0.36 * n2;
            float spec = (0.24 + 0.6 * pow(1.0 - NdV, 3.0)) * strength * gloss;

            // the car in the floor: sharp where it touches, soft higher up
            vec2 uv = vUv.xy / vUv.w;
            vec2 hd = probe(uv);
            // a polished floor is close to a mirror: the blur grows with the
            // height of what it reflects (1.5 cm per metre, a roof is still
            // crisp) and the image only loses a little as the surface rises
            float rPx = min(hd.x * 0.015, 0.05) * projScale.y / hd.y / texel.y;
            vec4 car = reflection(uv, rPx) * (1.0 - 0.15 * clamp(hd.x / 1.5, 0.0, 1.0));

            // the studio around it: the HDRI's softboxes, and the area lights
            // as soft rectangles, hidden where the car is
            vec3 R = reflect(-V, N);
            vec3 studio = texture2D(tEnv, equirectUv(envRot * R)).rgb * envStrength;
            for (int i = 0; i < NLIGHTS; i++) {
                float denom = dot(R, lightNormal[i]);
                if (denom < -1e-4) {
                    float t = dot(lightPos[i] - vWorld, lightNormal[i]) / denom;
                    if (t > 0.0) {
                        vec3 p = vWorld + R * t - lightPos[i];
                        vec2 q = vec2(dot(p, lightRight[i]) / dot(lightRight[i], lightRight[i]), dot(p, lightUp[i]) / dot(lightUp[i], lightUp[i]));
                        // an elliptical bloom, not the panel's rectangle: a glossy
                        // floor smears a light into a streak with no corners, and
                        // the smear widens with the distance the reflected ray travels
                        float soft = 0.6 + 0.12 * t;
                        float m = (1.0 - smoothstep(1.0 - soft, 1.0 + soft, length(q))) / (1.0 + soft);
                        studio += lightColor[i] * m / (1.0 + 0.03 * t * t);
                    }
                }
            }
            studio *= (1.0 - car.a) * 0.6;

            vec2 suv = (vWorld.xz - shadowRect.xy) / (2.0 * shadowRect.zw) + 0.5;
            float sh = 0.0;
            if (all(greaterThan(suv, vec2(0.0))) && all(lessThan(suv, vec2(1.0)))) {
                sh = texture2D(tShadow, suv).r;
            }
            sh = smoothstep(0.0, 0.9, sh);

            float pool = 1.0 - smoothstep(2.8, 4.4, d);
            vec3 base = color * tone * (0.3 + 1.1 * pool);
            vec3 col = base * (1.0 - sh * 0.93) + (car.rgb + studio) * spec * (1.0 - sh * 0.6);
            col *= 1.0 - smoothstep(5.5, 12.5, d);
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
        }`,
}

let renderReflection = () => {}
const floorSize = 30
const floor = new Reflector(new THREE.PlaneGeometry(floorSize, floorSize), {
    color: 0x1a1b1e, // Reflector overwrites the shader's `color` uniform with its own (a mid grey) unless told
    clipBias: 0.002,
    textureWidth: 1024,
    textureHeight: 1024,
    textureType: THREE.HalfFloatType,
    multisample: 0, // the blur hides edges; MSAA and a depth texture don't mix well
    shader: floorShader,
})
floor.rotation.x = -Math.PI / 2
floor.position.y = 0
// Blur pyramid of the reflection: four halvings, each a separable 9-tap
// gaussian, so the floor can pick any softness without ghosting.
const blurLevels = []
const blurTemps = []
const blurQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2))
const blurScene = new THREE.Scene()
blurScene.add(blurQuad)
const blurCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
const blurH = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(HorizontalBlurShader.uniforms),
    vertexShader: HorizontalBlurShader.vertexShader,
    fragmentShader: HorizontalBlurShader.fragmentShader,
    depthTest: false,
    depthWrite: false,
})
const blurV = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(VerticalBlurShader.uniforms),
    vertexShader: VerticalBlurShader.vertexShader,
    fragmentShader: VerticalBlurShader.fragmentShader,
    depthTest: false,
    depthWrite: false,
})
for (let i = 0; i < 4; i++) {
    const opts = { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }
    blurLevels.push(new THREE.WebGLRenderTarget(1, 1, opts))
    blurTemps.push(new THREE.WebGLRenderTarget(1, 1, opts))
}
function blurPyramid() {
    const prevRT = renderer.getRenderTarget()
    let src = floor.getRenderTarget().texture
    for (let i = 0; i < 4; i++) {
        blurQuad.material = blurH
        blurH.uniforms.tDiffuse.value = src
        blurH.uniforms.h.value = 1 / blurLevels[i].width
        renderer.setRenderTarget(blurTemps[i])
        renderer.render(blurScene, blurCam)
        blurQuad.material = blurV
        blurV.uniforms.tDiffuse.value = blurTemps[i].texture
        blurV.uniforms.v.value = 1 / blurLevels[i].height
        renderer.setRenderTarget(blurLevels[i])
        renderer.render(blurScene, blurCam)
        src = blurLevels[i].texture
    }
    renderer.setRenderTarget(prevRT)
}

{
    const rt = floor.getRenderTarget()
    rt.texture.generateMipmaps = false
    rt.texture.minFilter = THREE.LinearFilter
    rt.texture.magFilter = THREE.LinearFilter
    rt.depthTexture = new THREE.DepthTexture(rt.width, rt.height)
    const u = floor.material.uniforms
    u.tDepth.value = rt.depthTexture
    u.tNoise.value = noiseTexture()
    blurLevels.forEach((l, i) => (u['tBlur' + (i + 1)].value = l.texture))
    const clearColor = new THREE.Color()
    const reflect = floor.onBeforeRender
    // The reflection is rendered up front, before the main pass, rather than
    // from the floor's onBeforeRender: switching render targets in the middle
    // of a multisampled pass makes tile-based (mobile) GPUs store and reload
    // the whole MSAA buffer, which cost more than the reflection itself.
    floor.onBeforeRender = () => {}
    renderReflection = () => {
        camera.updateMatrixWorld()
        // render over a transparent clear so the alpha says where the car
        // is; the studio shows through everywhere else
        const bg = scene.background
        const alpha = renderer.getClearAlpha()
        renderer.getClearColor(clearColor)
        scene.background = null
        renderer.setClearColor(0x000000, 0)
        studio.visible = false
        reflect.call(floor, renderer, scene, camera)
        studio.visible = true
        renderer.setClearColor(clearColor, alpha)
        scene.background = bg
        blurPyramid()
        // hand the floor the virtual camera so the shader can turn depth
        // back into height above the floor
        const vc = floor.camera
        u.invProj.value.copy(vc.projectionMatrix).invert()
        u.camWorld.value.copy(vc.matrixWorld)
        const e = vc.projectionMatrix.elements
        u.projScale.value.set(0.5 * e[0], 0.5 * e[5])
    }
}
scene.add(floor)

let carReady = false
loadCar().then(({ group, materials: m }) => {
    car = group
    materials = m
    scene.add(car)
    floor.material.uniforms.tShadow.value = bakeContactShadow()
    carReady = true
    ready()
})

/* ------------------------------------------------------------------ */
/* post                                                                */

const maxSamples = renderer.capabilities.maxSamples || 4
const composerTarget = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    samples: Math.min(4, maxSamples),
})
const composer = new EffectComposer(renderer, composerTarget)
composer.setPixelRatio(DPR)
composer.addPass(new RenderPass(scene, camera))
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.14, 0.3, 1.5)
composer.addPass(bloom)
composer.addPass(new OutputPass())
// MSAA handles geometry edges; SMAA on the tone-mapped image cleans up the
// specular shimmer on thin chrome and the lamp edges that MSAA leaves behind.
const smaa = new SMAAPass(1, 1)
composer.addPass(smaa)

/* ------------------------------------------------------------------ */
/* environment                                                         */

// The HDRI is a small photo studio: a white cyclorama fills half the
// sphere at a luminance near 1, the softboxes a percent of it at 10–500.
// Glossy paint mirrors that cyc as a flat grey-white sheet, so every colour
// reads pale from the side and the floor glows. Pull the room down to the
// black of a car studio and keep only the lights: paint and a polished
// floor are meant to show the softboxes as shapes on dark.
// The ceiling goes too, lamps included: two small lamps sit at the zenith,
// where an equirect has almost no resolution, and the roughness-filtered
// environment turns them into a soft square that the hood mirrors from
// any high angle. The spot is the only light overhead.
function darkenRoom(tex, floor = 0.1, lo = 1.6, hi = 4.5, ceiling = 0.82) {
    const { width: W, height: H, data: d } = tex.image
    for (let i = 0; i < d.length; i += 4) {
        const y = (i >> 2) / W
        const v = tex.flipY ? 1 - (y + 0.5) / H : (y + 0.5) / H
        const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]
        const t = v > ceiling ? 0 : Math.min(1, Math.max(0, (lum - lo) / (hi - lo)))
        const k = floor + (1 - floor) * t * t * (3 - 2 * t)
        d[i] *= k
        d[i + 1] *= k
        d[i + 2] *= k
    }
}

// Paint the softboxes into the equirect, seen from the middle of the car:
// each is an ellipse with a soft edge, in radiance, at the direction its
// panel is seen in. three.js samples the environment through the scene's
// rotation, so the direction is rotated into the texture's frame first.
function paintLights(tex, lights, rotation) {
    const { width: W, height: H, data } = tex.image
    const unrot = new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationFromEuler(rotation)).transpose()
    const eye = new THREE.Vector3(0, 0.8, 0)
    const T = new THREE.Vector3()
    const D = new THREE.Vector3()
    const P = new THREE.Vector3()
    const list = lights.map((l) => ({ ...l, toEye: l.position.clone().sub(eye), rr: l.right.lengthSq(), uu: l.up.lengthSq() }))
    for (let y = 0; y < H; y++) {
        const v = tex.flipY ? 1 - (y + 0.5) / H : (y + 0.5) / H
        const lat = (v - 0.5) * Math.PI
        for (let x = 0; x < W; x++) {
            const lon = ((x + 0.5) / W - 0.5) * Math.PI * 2
            // the inverse of three's equirectUv: u from atan2(z, x), v from asin(y)
            T.set(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon))
            D.copy(T).applyMatrix3(unrot)
            const o = (y * W + x) * 4
            for (const l of list) {
                const denom = D.dot(l.normal)
                if (denom >= -1e-4) continue
                const t = l.toEye.dot(l.normal) / denom
                if (t <= 0) continue
                P.copy(D).multiplyScalar(t).sub(l.toEye)
                const qx = P.dot(l.right) / l.rr
                const qy = P.dot(l.up) / l.uu
                const r = Math.sqrt(qx * qx + qy * qy)
                if (r >= 1) continue
                const e = Math.min(1, (1 - r) / 0.3)
                const m = e * e * (3 - 2 * e) * l.intensity
                data[o] += l.color.r * m
                data[o + 1] += l.color.g * m
                data[o + 2] += l.color.b * m
            }
        }
    }
}

// The softboxes in the HDRI peak above 500 — fine for paint, but on dark
// glass and lamp lenses even a 4% Fresnel reflection of that blows out to
// white. Compress the highlights above a knee so glossy blacks stay black.
function compressHighlights(tex, knee = 3, range = 4.5) {
    const d = tex.image.data
    for (let i = 0; i < d.length; i++) {
        if ((i & 3) === 3) continue // alpha
        const v = d[i]
        if (v > knee) d[i] = knee + (v - knee) / (1 + (v - knee) / range)
    }
    tex.needsUpdate = true
}

/** A small, heavily blurred copy of the HDRI for the floor's glossy reflection. */
function blurredEquirect(tex, W = 128, H = 64) {
    const { width, height, data } = tex.image
    const bx = width / W
    const by = height / H
    const box = new Float32Array(W * H * 3)
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            let r = 0
            let g = 0
            let b = 0
            let n = 0
            for (let yy = Math.floor(y * by); yy < Math.floor((y + 1) * by); yy++) {
                for (let xx = Math.floor(x * bx); xx < Math.floor((x + 1) * bx); xx++) {
                    const i = (yy * width + xx) * 4
                    r += data[i]
                    g += data[i + 1]
                    b += data[i + 2]
                    n++
                }
            }
            const o = (y * W + x) * 3
            box[o] = r / n
            box[o + 1] = g / n
            box[o + 2] = b / n
        }
    }
    // two box blurs, wrapping horizontally
    const R = 3
    let src = box
    for (let pass = 0; pass < 2; pass++) {
        const tmp = new Float32Array(W * H * 3)
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                for (let c = 0; c < 3; c++) {
                    let acc = 0
                    for (let k = -R; k <= R; k++) acc += src[(y * W + ((x + k + W) % W)) * 3 + c]
                    tmp[(y * W + x) * 3 + c] = acc / (2 * R + 1)
                }
            }
        }
        const out = new Float32Array(W * H * 3)
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                for (let c = 0; c < 3; c++) {
                    let acc = 0
                    for (let k = -R; k <= R; k++) acc += tmp[(Math.min(H - 1, Math.max(0, y + k)) * W + x) * 3 + c]
                    out[(y * W + x) * 3 + c] = acc / (2 * R + 1)
                }
            }
        }
        src = out
    }
    const half = new Uint16Array(W * H * 4)
    for (let i = 0; i < W * H; i++) {
        half[i * 4] = THREE.DataUtils.toHalfFloat(src[i * 3])
        half[i * 4 + 1] = THREE.DataUtils.toHalfFloat(src[i * 3 + 1])
        half[i * 4 + 2] = THREE.DataUtils.toHalfFloat(src[i * 3 + 2])
        half[i * 4 + 3] = THREE.DataUtils.toHalfFloat(1)
    }
    const out = new THREE.DataTexture(half, W, H, THREE.RGBAFormat, THREE.HalfFloatType)
    out.flipY = tex.flipY
    out.wrapS = THREE.RepeatWrapping
    out.wrapT = THREE.ClampToEdgeWrapping
    out.minFilter = THREE.LinearFilter
    out.magFilter = THREE.LinearFilter
    out.colorSpace = tex.colorSpace
    out.needsUpdate = true
    return out
}

new RGBELoader().setDataType(THREE.FloatType).load(
    '/assets/hdr/studio.hdr',
    (tex) => {
        darkenRoom(tex)
        paintLights(tex, areaLights, ENV_ROTATION)
        compressHighlights(tex)
        tex.mapping = THREE.EquirectangularReflectionMapping
        scene.environment = tex
        scene.environmentIntensity = 1.0
        scene.environmentRotation = ENV_ROTATION
        const u = floor.material.uniforms
        u.tEnv.value = blurredEquirect(tex)
        u.envRot.value.setFromMatrix4(new THREE.Matrix4().makeRotationFromEuler(scene.environmentRotation))
        u.envStrength.value = 0.15
        envReady = true
        ready()
    },
    undefined,
    () => {
        // fall back to a neutral room if the HDR fails to load
        import('three/addons/environments/RoomEnvironment.js').then(({ RoomEnvironment }) => {
            const pmrem = new THREE.PMREMGenerator(renderer)
            scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
            envReady = true
            ready()
        })
    }
)

// Frames are rendered only while the camera moves or `dirty` asks for more.
let dirty = 2
function invalidate() {
    dirty = 2
}

let isReady = false
let envReady = false
function ready() {
    if (isReady || !carReady || !envReady) return
    isReady = true
    invalidate()
    stage.classList.add('is-ready')
    loading.remove()
    armIdle()
}

/* ------------------------------------------------------------------ */
/* size                                                                */

function resize() {
    const w = stage.clientWidth
    const h = stage.clientHeight
    if (!w || !h) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    // presets back off on narrow stages; the orbit limits must follow or the
    // first controls.update() after a fly-to snaps the camera back in
    controls.maxDistance = 13 * distanceScale()
    renderer.setSize(w, h, false)
    composer.setSize(w, h)
    bloom.setSize(w / 2, h / 2) // the bloom is soft and weak; a quarter-res chain is plenty
    smaa.setSize(w * DPR, h * DPR)
    const q = QUALITY[qualityLevel]
    const rw = Math.min(1280, Math.round(w * DPR * q.refl))
    const rh = Math.min(1280, Math.round(h * DPR * q.refl))
    floor.getRenderTarget().setSize(rw, rh)
    floor.material.uniforms.texel.value.set(1 / rw, 1 / rh)
    for (let i = 0; i < 4; i++) {
        const lw = Math.max(1, rw >> (i + 1))
        const lh = Math.max(1, rh >> (i + 1))
        blurLevels[i].setSize(lw, lh)
        blurTemps[i].setSize(lw, lh)
    }
    if (currentView && !move && typeof flyTo === 'function') flyTo(currentView, true)
    invalidate()
}
new ResizeObserver(resize).observe(stage)

function setQuality(level) {
    qualityLevel = Math.min(level, QUALITY.length - 1)
    const q = QUALITY[qualityLevel]
    DPR = q.dpr
    renderer.setPixelRatio(DPR)
    composer.setPixelRatio(DPR)
    bloom.enabled = q.bloom
    resize()
}

/* ------------------------------------------------------------------ */
/* camera moves                                                        */

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
let move = null
let currentView = VIEWS[0]

/** Presets are framed for landscape; back off as the stage gets narrower. */
function distanceScale() {
    const aspect = camera.aspect || 1
    return aspect < 1.35 ? Math.pow(1.35 / aspect, 0.65) : 1
}

function flyTo(view, instant = false) {
    currentView = view
    const from = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target))
    const toPos = new THREE.Vector3(...view.pos)
    const toTarget = new THREE.Vector3(...view.target)
    const to = new THREE.Spherical().setFromVector3(toPos.clone().sub(toTarget))
    to.radius *= distanceScale()
    // shortest way round
    let dTheta = to.theta - from.theta
    while (dTheta > Math.PI) dTheta -= Math.PI * 2
    while (dTheta < -Math.PI) dTheta += Math.PI * 2
    move = {
        t0: performance.now(),
        dur: reduceMotion || instant ? 0 : 1500,
        from,
        dTheta,
        to,
        fromTarget: controls.target.clone(),
        toTarget,
        fromFov: camera.fov,
        toFov: view.fov,
    }
    controls.autoRotate = false
    controls.enabled = false
    // drop whatever a drag or pinch was still easing out, or it replays as
    // a jump when the controls come back at the end of the move
    controls._sphericalDelta?.set(0, 0, 0)
    controls._panOffset?.set(0, 0, 0)
    controls._scale = 1
    invalidate()
}

function stepMove(now) {
    if (!move) return
    const t = move.dur === 0 ? 1 : Math.min(1, (now - move.t0) / move.dur)
    const e = easeInOut(t)
    const sph = new THREE.Spherical(
        THREE.MathUtils.lerp(move.from.radius, move.to.radius, e),
        THREE.MathUtils.lerp(move.from.phi, move.to.phi, e),
        move.from.theta + move.dTheta * e
    )
    controls.target.lerpVectors(move.fromTarget, move.toTarget, e)
    camera.position.setFromSpherical(sph).add(controls.target)
    camera.fov = THREE.MathUtils.lerp(move.fromFov, move.toFov, e)
    camera.updateProjectionMatrix()
    camera.lookAt(controls.target)
    if (t >= 1) {
        move = null
        controls.enabled = true
        controls.update()
        armIdle()
    }
}

/* ------------------------------------------------------------------ */
/* idle auto-rotate                                                    */

let idleTimer = 0
function armIdle() {
    clearTimeout(idleTimer)
    controls.autoRotate = false
    if (reduceMotion) return
    idleTimer = setTimeout(() => {
        controls.autoRotate = true
    }, 5000)
}
controls.addEventListener('start', () => {
    clearTimeout(idleTimer)
    controls.autoRotate = false
    currentView = null
    setActiveView(null)
})
controls.addEventListener('end', armIdle)

/* ------------------------------------------------------------------ */
/* UI                                                                  */

function setActiveView(id) {
    viewList.querySelectorAll('button').forEach((b) => {
        const on = b.dataset.view === id
        b.classList.toggle('is-active', on)
        b.setAttribute('aria-pressed', String(on))
    })
    if (caption) {
        const v = VIEWS.find((v) => v.id === id)
        caption.textContent = v ? v.label : 'Free view'
    }
}

for (const v of VIEWS) {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'car-views__btn'
    b.dataset.view = v.id
    b.setAttribute('aria-pressed', 'false')
    b.innerHTML = `<span class="car-views__dot"></span><span>${v.label}</span>`
    b.addEventListener('click', () => {
        setActiveView(v.id)
        flyTo(v)
    })
    viewList.appendChild(b)
}
setActiveView(VIEWS[0].id)

PAINTS.forEach((p, i) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'car-paints__swatch'
    b.setAttribute('role', 'radio')
    b.setAttribute('aria-checked', String(i === 0))
    b.setAttribute('aria-label', p.name)
    b.title = p.name
    b.style.setProperty('--swatch', '#' + p.hex.toString(16).padStart(6, '0'))
    b.addEventListener('click', () => {
        paintList.querySelectorAll('[role="radio"]').forEach((el) => el.setAttribute('aria-checked', 'false'))
        b.setAttribute('aria-checked', 'true')
        if (materials) applyPaint(materials, p)
        invalidate()
    })
    paintList.appendChild(b)
})

// keyboard: ← → cycle views
window.addEventListener('keydown', (e) => {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    const active = viewList.querySelector('.is-active')
    let i = active ? VIEWS.findIndex((v) => v.id === active.dataset.view) : -1
    i = (i + (e.key === 'ArrowRight' ? 1 : -1) + VIEWS.length) % VIEWS.length
    setActiveView(VIEWS[i].id)
    flyTo(VIEWS[i])
})

/* ------------------------------------------------------------------ */
/* loop                                                                */

let visible = true
new IntersectionObserver(
    (entries) => {
        visible = entries[0].isIntersecting
        if (visible) requestAnimationFrame(frame)
    },
    { threshold: 0.02 }
).observe(stage)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && visible) requestAnimationFrame(frame)
})

resize()
flyTo(VIEWS[0], true)

let lastFrame = 0
let lastRender = 0
let sampled = 0
let slow = 0
let fpsCount = 0
let fpsT0 = 0
function frame(now) {
    if (!visible || document.hidden) return
    requestAnimationFrame(frame)
    // let the display pace us (120 Hz where the browser allows it); the
    // small gate only folds duplicate callbacks
    if (now - lastFrame < 4) return
    lastFrame = now
    let moved
    if (move) {
        stepMove(now)
        moved = true
    } else moved = controls.update()
    if (!moved && dirty <= 0) {
        lastRender = 0
        if (fpsEl && fpsT0 && now - fpsT0 > 1000) {
            fpsEl.textContent = 'idle'
            fpsT0 = 0
            fpsCount = 0
        }
        return
    }
    if (!moved) dirty--
    if (!reduceMotion && lastRender) stepDust(Math.min(0.1, (now - lastRender) / 1000), now)
    fadeBeam()
    renderReflection()
    composer.render()
    fpsCount++
    if (!fpsT0) fpsT0 = now
    else if (now - fpsT0 >= 500) {
        if (fpsEl) fpsEl.textContent = `${Math.round((fpsCount * 1000) / (now - fpsT0))} fps · ${DPR}×`
        fpsCount = 0
        fpsT0 = now
    }
    // while frames are flowing, watch the pace; drop a quality level if
    // more than half of a 90-frame window came in under 30 fps
    if (lastRender && isReady) {
        sampled++
        if (now - lastRender > 34) slow++
        if (sampled >= 90) {
            if (slow > 45 && qualityLevel < QUALITY.length - 1) setQuality(qualityLevel + 1)
            sampled = 0
            slow = 0
        }
    }
    lastRender = now
}
requestAnimationFrame(frame)
