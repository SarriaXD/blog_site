# CLAUDE.md

Personal website of Sarria (Qi Wang), live at https://sarria.ca.

## What this is

A hand-written static site: plain HTML, one CSS file, a few small JS files. No framework, no build step, no package manager. Open `index.html` in a browser or serve the folder with any static server. The only external dependency is three.js, loaded from jsDelivr by the `/cars` page through an import map.

## Deployment

- Hosted on **Vercel**, connected to this GitHub repo (`SarriaXD/blog_site`). Pushing to `master` deploys.
- `vercel.json` sets `framework: null`, no build or install command, and serves the repo root. `cleanUrls` is on, so `/tools` serves `tools/index.html`. `404.html` at the root is the custom not-found page.
- Nothing needs installing on Vercel. If the dashboard still shows a Next.js preset, `vercel.json` overrides it.

## Layout

- `index.html` — home, written as a film. Seven `[data-ch]` chapter sections (Intro, Craft, Stack, App, Chatbot, Cars, Contact), each `--len` viewports tall with a sticky `.ch__pin` holding its `.cap` captions (`data-at="a b"` is the slice of the chapter where a caption is visible). A fixed `<canvas id="film">` behind everything draws every frame in code; there are no images on the page. `.rail` is the chapter dot rail, `.timecode` the film counter, `.scroll-hint` the opening cue.
- `tools/index.html`, `tools/device-mockup/index.html` — tools index and the device mockup tool (POSTs to `https://api.sarria.ca/mockup-device`).
- `cars/index.html` — real-time studio render of the Tesla Model 3 (2024+ refresh, Premium trim; three.js). Full-viewport stage, a side rail of camera presets, paint swatches, specs below.
- `articles/index.html` — placeholder until articles exist.
- `linkedin/index.html` — meta-refresh redirect to LinkedIn.
- `404.html` — not found.
- `assets/css/style.css` — all styles. Design tokens live in `:root`. Breakpoints: 734px (phone) and 1068px (tablet).
- `assets/js/main.js` — nav menu, reveal-on-scroll, parallax (`data-parallax`), sticky scrolly sections (`data-scrolly`), carousel.
- `assets/js/film.js` — the home page film. Canvas 2D, no library. Scrolling is the playhead: `T` runs from 0 at the top of the first chapter to 7 at the end of the last, eased with a short lag for feel (snapped under `prefers-reduced-motion`). Each scene is a function of its local progress `t` (0–1 while the caption is pinned), its visibility `v` (neighbouring scenes cross-fade during the viewport where one caption scrolls out and the next scrolls in) and a clock for ambient motion. Scenes: prairie night with aurora and a skyline (Intro); phone, browser and server rack drawn stroke by stroke (Craft); the stack as a constellation (Stack); a phone running the driving test app with four screens on a streaming road (App); the chatbot window typing its replies (Chatbot); a blueprint side elevation of the Model 3 with rolling wheels and dimension lines (Cars); dawn over the same horizon (Contact). Drawing is in "units" (the shorter viewport side is 1000 units; `F.px` is one CSS pixel); line drawings are `Path` polylines so they can be traced partially; soft light goes on a low-res glow layer composited with `lighter`; a vignette and grain finish each frame. Captions are real HTML, faded by the script from the same scroll position.
- `assets/js/mockup.js` — device mockup tool only.
- `assets/js/cars.js` — the `/cars` scene: renderer, HDRI environment (highlights compressed at load so dark glass and lamp lenses don't blow out), area lights for the shoulder highlights, blurred planar floor reflection (custom `Reflector` shader), contact shadow baked once the car is in, 8× MSAA + SMAA, a deliberately weak bloom (anything stronger washes the headlamps white), ACES, camera presets with spherical fly-to, idle auto-rotate. The car comes from `model-3.js` unless a glTF binary exists at `assets/models/model-3.glb`: then `loadCar()` loads that instead (the `GLB` constant says which axis the file's nose points along and which material names count as paint; the paint is swapped for ours so the swatches work). No such file is committed; downloadable CC-BY models of the refreshed Model 3 exist on Sketchfab (search "Tesla model 3 2024", downloads need a free account) and must be credited in the page footer if used.
- `assets/js/model-3.js` — the car itself, built procedurally: the body is a loft of rounded cross-sections driven by longitudinal curves (`yTop`, `yBelt`, `zShoulder`, `zRoofEdge`, `zBumper`, arches), with per-face material regions (paint, glass, trim). Headlamps, tail lamps, the lower intake and corner vents are `facePatch` panels: grids in (y, z) that bisect the skin for x, so they sit flush on the nose or tail; trims are tubes along profile knots. Key stations: cowl at x = 0.85, windscreen header at −0.05, B-pillar cross member at −0.36 (the roof is glass from the cowl to the trunk lid, broken only there), rear glass base at −2.06, trunk edge at −2.27; front axle at x = 1.5, rear at −1.375; belt line ≈ 1.0 m; roof peaks at 1.441 m over the B-pillar; everything scaled to the published dimensions (4720 × 1850 × 1441 mm, 2875 mm wheelbase, 235/45 R18). Chrome delete: all trim is satin black. Wheels are the 18" Photon aero covers. `PAINTS` is the current Tesla palette.
- `assets/js/xingyue-l.js` — the previous car (Geely Xingyue L), same construction, kept for reference; nothing imports it.
- `assets/hdr/studio.hdr` — 1k studio HDRI from Poly Haven (CC0), used for image-based lighting on `/cars`.
- `assets/img/` — WebP images, pre-sized (phone screenshots 640px, logos 160px), plus the favicon and touch icon. The home page no longer uses any of them; the tools pages and 404 do. Convert new images with ImageMagick: `convert in.png -resize 1200x\> -quality 82 out.webp`.

## Conventions

- Nav and footer are duplicated verbatim in every page. Change them in all six HTML files (home, tools, device-mockup, cars, articles, 404; `linkedin/` is a bare redirect).
- Design language is deliberately restrained: black canvas, `--fg-2` grey for secondary text, one accent (`--link` / `--accent`), system font stack, backdrop blur only on the nav. Keep colour to the images.
- Animations are scroll-driven only. Elements with `.reveal` fade up once; `[data-parallax="0.1"]` moves relative to its parent; `[data-scrolly]` sections swap `[data-scene]` elements as `.step` elements cross the viewport centre; the home film plays from scroll position. Under `prefers-reduced-motion` the film still follows the scroll but nothing moves on its own, and every other animation is off.
- On the home page, `film.js` owns `opacity`, `transform` and `visibility` on `.cap` elements; don't animate them from CSS. To add a chapter: a `[data-ch]` section with `--len`, captions with `data-at`, a scene object in `film.js` (`draw(c, g, t, v, time)` and optional `sky`) appended to `scenes`, and a button in `.rail`. `.section--tint` is still available for other pages.
- Icons are inline SVG from Font Awesome Free (CC BY 4.0).
- `/cars` is the heaviest page. Keep it self-contained: three.js version pinned in the import map, no other libraries. To check it headlessly, serve the folder and screenshot with Playwright using Chromium's SwiftShader flags (`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`); software rendering runs well under 1 fps there, so wait generously before screenshots.
- To check the home film headlessly, emulate `prefers-reduced-motion: reduce` so the playhead snaps to the scroll position, scroll to `chapterTop + t × (1 − vh / chapterHeight) × chapterHeight` for local progress `t`, and screenshot.
