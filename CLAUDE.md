# CLAUDE.md

Personal website of Sarria (Qi Wang), live at https://sarria.ca.

## What this is

A hand-written static site: plain HTML, one CSS file, a few small JS files. No framework, no build step, no package manager. Open `index.html` in a browser or serve the folder with any static server. The only external dependency is three.js, loaded from jsDelivr by the `/cars` page through an import map.

## Deployment

- Hosted on **Vercel**, connected to this GitHub repo (`SarriaXD/blog_site`). Pushing to `master` deploys.
- `vercel.json` sets `framework: null`, no build or install command, and serves the repo root. `cleanUrls` is on, so `/tools` serves `tools/index.html`. `404.html` at the root is the custom not-found page.
- Nothing needs installing on Vercel. If the dashboard still shows a Next.js preset, `vercel.json` overrides it.

## Layout

- `index.html` — home: hero, three discipline features, tech stack (logo grid + carousel), Flutter project (sticky scrollytelling), chatbot showcase (sticky scrollytelling). A fixed `<canvas id="bg">` behind everything carries the scroll-driven 3D background.
- `tools/index.html`, `tools/device-mockup/index.html` — tools index and the device mockup tool (POSTs to `https://api.sarria.ca/mockup-device`).
- `cars/index.html` — real-time studio render of the Geely Xingyue L (three.js). Full-viewport stage, a side rail of camera presets (Tesla-style view switching), paint swatches, specs below.
- `articles/index.html` — placeholder until articles exist.
- `linkedin/index.html` — meta-refresh redirect to LinkedIn.
- `404.html` — not found.
- `assets/css/style.css` — all styles. Design tokens live in `:root`. Breakpoints: 734px (phone) and 1068px (tablet).
- `assets/js/main.js` — nav menu, reveal-on-scroll, parallax (`data-parallax`), sticky scrolly sections (`data-scrolly`), carousel.
- `assets/js/bg.js` — home page background. Raw WebGL (no library), one particle system whose vertex shader morphs between six formations as `[data-chapter]` sections scroll in: nebula (hero), stream (features), orbits (stack), warp tunnel (Flutter), globe (chatbot), horizon (footer). A gravity well follows the `[data-well]` element nearest the middle of the viewport (`data-well="dim"` for a faint hole, `"none"` for position only); its `[data-swallow]` children are scaled, spun and pulled into the hole once they scroll past the centre, and `--q` (0–1) on the well reports how far along that is. Scroll velocity stretches particles into streaks. Disabled entirely under `prefers-reduced-motion` or without WebGL.
- `assets/js/mockup.js` — device mockup tool only.
- `assets/js/cars.js` — the `/cars` scene: renderer, HDRI environment, blurred planar floor reflection (custom `Reflector` shader), contact shadow baked once at start, bloom + ACES, camera presets with spherical fly-to, idle auto-rotate.
- `assets/js/xingyue-l.js` — the car itself, built procedurally: the body is a loft of rounded cross-sections driven by longitudinal curves (`yTop`, `yBelt`, `zShoulder`, `zRoofEdge`, arches), with per-face material regions (paint, glass, trim). Lamps and the rear light bar are `facePatch` panels sampled from the skin; trims are tubes along profile knots. Dimensions are the real car's (4770 × 1895 × 1689 mm, 2845 mm wheelbase, 255/45 R20).
- `assets/hdr/studio.hdr` — 1k studio HDRI from Poly Haven (CC0), used for image-based lighting on `/cars`.
- `assets/img/` — WebP images, pre-sized (hero ≤1200px, phone screenshots 640px, logos 160px). Convert new images with ImageMagick: `convert in.png -resize 1200x\> -quality 82 out.webp`.

## Conventions

- Nav and footer are duplicated verbatim in every page. Change them in all six HTML files (home, tools, device-mockup, cars, articles, 404; `linkedin/` is a bare redirect).
- Design language is deliberately restrained: black canvas, `--fg-2` grey for secondary text, one accent (`--link` / `--accent`), system font stack, backdrop blur only on the nav. Keep colour to the images.
- Animations are scroll-driven only. Elements with `.reveal` fade up once; `[data-parallax="0.1"]` moves relative to its parent; `[data-scrolly]` sections swap `[data-scene]` elements as `.step` elements cross the viewport centre; the home background (`bg.js`) plays its story from scroll position. All motion is disabled under `prefers-reduced-motion`.
- `bg.js` owns `transform` on `[data-swallow]` elements, so don't also give them `data-parallax` or a CSS `transform`; use the `translate` property for static offsets (see `.hero__art .art-main`). Sections on the home page have no tinted background so the canvas shows through; `.section--tint` is still available for other pages.
- Icons are inline SVG from Font Awesome Free (CC BY 4.0).
- `/cars` is the heaviest page. Keep it self-contained: three.js version pinned in the import map, no other libraries. To check it headlessly, serve the folder and screenshot with Playwright using Chromium's SwiftShader flags (`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`); software rendering runs well under 1 fps there, so wait generously before screenshots.
