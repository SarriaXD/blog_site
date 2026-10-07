# CLAUDE.md

Personal website of Sarria (Qi Wang), live at https://sarria.ca.

## What this is

A hand-written static site: plain HTML, one CSS file, three small JS files. No framework, no build step, no package manager. Open `index.html` in a browser or serve the folder with any static server.

## Deployment

- Hosted on **Vercel**, connected to this GitHub repo (`SarriaXD/blog_site`). Pushing to `master` deploys.
- `vercel.json` sets `framework: null`, no build or install command, and serves the repo root. `cleanUrls` is on, so `/tools` serves `tools/index.html`. `404.html` at the root is the custom not-found page.
- Nothing needs installing on Vercel. If the dashboard still shows a Next.js preset, `vercel.json` overrides it.

## Layout

- `index.html` — home: hero, three discipline features, tech stack (logo grid + carousel), Flutter project (sticky scrollytelling), chatbot showcase (sticky scrollytelling). A fixed `<canvas id="bg">` behind everything carries the scroll-driven 3D background.
- `tools/index.html`, `tools/device-mockup/index.html` — tools index and the device mockup tool (POSTs to `https://api.sarria.ca/mockup-device`).
- `articles/index.html` — placeholder until articles exist.
- `linkedin/index.html` — meta-refresh redirect to LinkedIn.
- `404.html` — not found.
- `assets/css/style.css` — all styles. Design tokens live in `:root`. Breakpoints: 734px (phone) and 1068px (tablet).
- `assets/js/main.js` — nav menu, reveal-on-scroll, parallax (`data-parallax`), sticky scrolly sections (`data-scrolly`), carousel.
- `assets/js/bg.js` — home page background. Raw WebGL (no library), one particle system whose vertex shader morphs between six formations as `[data-chapter]` sections scroll in: nebula (hero), stream (features), orbits (stack), warp tunnel (Flutter), globe (chatbot), horizon (footer). A gravity well follows the `[data-well]` element nearest the middle of the viewport (`data-well="dim"` for a faint hole, `"none"` for position only); its `[data-swallow]` children are scaled, spun and pulled into the hole once they scroll past the centre, and `--q` (0–1) on the well reports how far along that is. Scroll velocity stretches particles into streaks. Disabled entirely under `prefers-reduced-motion` or without WebGL.
- `assets/js/mockup.js` — device mockup tool only.
- `assets/img/` — WebP images, pre-sized (hero ≤1200px, phone screenshots 640px, logos 160px). Convert new images with ImageMagick: `convert in.png -resize 1200x\> -quality 82 out.webp`.

## Conventions

- Nav and footer are duplicated verbatim in every page. Change them in all five HTML files.
- Design language is deliberately restrained: black canvas, `--fg-2` grey for secondary text, one accent (`--link` / `--accent`), system font stack, backdrop blur only on the nav. Keep colour to the images.
- Animations are scroll-driven only. Elements with `.reveal` fade up once; `[data-parallax="0.1"]` moves relative to its parent; `[data-scrolly]` sections swap `[data-scene]` elements as `.step` elements cross the viewport centre; the home background (`bg.js`) plays its story from scroll position. All motion is disabled under `prefers-reduced-motion`.
- `bg.js` owns `transform` on `[data-swallow]` elements, so don't also give them `data-parallax` or a CSS `transform`; use the `translate` property for static offsets (see `.hero__art .art-main`). Sections on the home page have no tinted background so the canvas shows through; `.section--tint` is still available for other pages.
- Icons are inline SVG from Font Awesome Free (CC BY 4.0).
