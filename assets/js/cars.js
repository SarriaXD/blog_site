/* sarria.ca — /cars: real-time studio render of the Tesla Model 3.
 *
 * three.js is loaded from a CDN through the import map in cars/index.html.
 * The car is built procedurally in model-3.js; if a downloaded glTF is
 * dropped at /assets/models/model-3.glb it is used instead (see GLB
 * below). Lighting is image based (a CC0 studio HDRI from Poly Haven)
 * plus a long overhead softbox; the floor is a planar reflection blurred
 * through mip levels and darkened by a contact shadow baked once the car
 * is in. Bloom and ACES tone mapping run in a half-float post chain.
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
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import { buildCar, createMaterials, applyPaint, PAINTS, DIMS } from './model-3.js'

const stage = document.getElementById('stage')
const canvas = stage.querySelector('canvas')
const loading = stage.querySelector('.car-stage__loading')
const viewList = stage.querySelector('[data-views]')
const paintList = stage.querySelector('[data-paints]')
const caption = stage.querySelector('[data-caption]')

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
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
})
const DPR = Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 2)
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

RectAreaLightUniformsLib.init()
const key = new THREE.RectAreaLight(0xffffff, 3.2, 4.2, 1.0)
key.position.set(0.2, 3.9, 0.3)
key.lookAt(0.2, 0, 0.3)
scene.add(key)
// long thin strips either side: the highlight lines along the shoulder
for (const sz of [1, -1]) {
    const strip = new THREE.RectAreaLight(0xffffff, 1.6, 6.5, 0.35)
    strip.position.set(0, 2.3, sz * 4.4)
    strip.lookAt(0, 0.9, 0)
    scene.add(strip)
}
const rim = new THREE.RectAreaLight(0xd9e6ff, 2.0, 1.2, 3.2)
rim.position.set(-4.6, 2.3, -3.6)
rim.lookAt(0, 0.8, 0)
scene.add(rim)
const fill = new THREE.RectAreaLight(0xfff1e0, 1.2, 3, 2)
fill.position.set(4.5, 1.6, 4.2)
fill.lookAt(0, 0.8, 0)
scene.add(fill)

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
        for (const m of list) if (m && m !== mats.paint && 'envMapIntensity' in m) m.envMapIntensity = 1.0
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

const floorShader = {
    name: 'StudioFloor',
    uniforms: {
        color: { value: new THREE.Color(0x0c0c0e) },
        tDiffuse: { value: null },
        textureMatrix: { value: new THREE.Matrix4() },
        tShadow: { value: null },
        shadowRect: { value: new THREE.Vector4(0, 0, SHADOW_HALF.x, SHADOW_HALF.y) },
        blur: { value: 2.8 },
        strength: { value: 0.55 },
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
    fragmentShader: /* glsl */ `
        uniform vec3 color;
        uniform sampler2D tDiffuse;
        uniform sampler2D tShadow;
        uniform vec4 shadowRect;
        uniform float blur;
        uniform float strength;
        varying vec4 vUv;
        varying vec3 vWorld;
        #include <common>
        #include <logdepthbuf_pars_fragment>
        void main() {
            #include <logdepthbuf_fragment>
            vec3 V = normalize(cameraPosition - vWorld);
            float grazing = pow(1.0 - clamp(V.y, 0.0, 1.0), 2.2);
            float d = length(vWorld.xz);
            // the reflection gets softer further from the car
            float lod = blur + smoothstep(1.5, 7.0, d) * 2.5;
            vec3 refl = texture2DProjLodEXT(tDiffuse, vUv, lod).rgb;
            float reflAmt = mix(0.28, 1.0, grazing) * strength;

            vec2 suv = (vWorld.xz - shadowRect.xy) / (2.0 * shadowRect.zw) + 0.5;
            float sh = 0.0;
            if (all(greaterThan(suv, vec2(0.0))) && all(lessThan(suv, vec2(1.0)))) {
                sh = texture2D(tShadow, suv).r;
            }
            sh = smoothstep(0.0, 0.9, sh);

            float pool = exp(-d * d * 0.05);
            vec3 base = color * (0.3 + 0.7 * pool);
            vec3 col = base * (1.0 - sh * 0.93) + refl * reflAmt * (1.0 - sh * 0.55);
            col *= 1.0 - smoothstep(5.5, 12.5, d);
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
        }`,
}

const floorSize = 30
const floor = new Reflector(new THREE.PlaneGeometry(floorSize, floorSize), {
    clipBias: 0.002,
    textureWidth: 1024,
    textureHeight: 1024,
    textureType: THREE.HalfFloatType,
    multisample: isSmall ? 0 : 4,
    shader: floorShader,
})
floor.rotation.x = -Math.PI / 2
floor.position.y = 0
{
    const tex = floor.getRenderTarget().texture
    tex.generateMipmaps = true
    tex.minFilter = THREE.LinearMipmapLinearFilter
    tex.magFilter = THREE.LinearFilter
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
    samples: Math.min(isSmall ? 4 : 8, maxSamples),
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

new RGBELoader().setDataType(THREE.FloatType).load(
    '/assets/hdr/studio.hdr',
    (tex) => {
        compressHighlights(tex)
        tex.mapping = THREE.EquirectangularReflectionMapping
        scene.environment = tex
        scene.environmentIntensity = 1.0
        scene.environmentRotation = new THREE.Euler(0, Math.PI * 0.42, 0)
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

let isReady = false
let envReady = false
function ready() {
    if (isReady || !carReady || !envReady) return
    isReady = true
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
    renderer.setSize(w, h, false)
    composer.setSize(w, h)
    bloom.setSize(w, h)
    smaa.setSize(w * DPR, h * DPR)
    const rw = Math.min(1536, Math.round(w * DPR * 0.75))
    const rh = Math.min(1536, Math.round(h * DPR * 0.75))
    floor.getRenderTarget().setSize(rw, rh)
    if (currentView && !move && typeof flyTo === 'function') flyTo(currentView, true)
}
new ResizeObserver(resize).observe(stage)

/* ------------------------------------------------------------------ */
/* camera moves                                                        */

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
let move = null
let currentView = VIEWS[0]

/** Presets are framed for landscape; back off as the stage gets narrower. */
function distanceScale() {
    const aspect = camera.aspect || 1
    return aspect < 1.35 ? Math.pow(1.35 / aspect, 0.8) : 1
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
function frame(now) {
    if (!visible || document.hidden) return
    requestAnimationFrame(frame)
    // cap to ~60 fps on high-refresh displays; the reflection pass is not free
    if (now - lastFrame < 15) return
    lastFrame = now
    if (move) stepMove(now)
    else controls.update()
    composer.render()
}
requestAnimationFrame(frame)
