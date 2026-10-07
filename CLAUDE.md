# CLAUDE.md

Personal website of Sarria, live at https://sarria.ca.

## Deployment

- Hosted on **Vercel**, connected to this GitHub repo (`SarriaXD/blog_site`). Pushing to `master` triggers a production deploy.
- No `vercel.json`; project settings live in the Vercel dashboard. `.vercel/` is gitignored.
- Node.js version is pinned to **24.x** via `engines.node` in `package.json` (overrides the Vercel project setting; Node 20 was discontinued there). `.node-version` mirrors it for local version managers.
- `@vercel/analytics` is mounted in `app/layout.tsx`.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4 (via `@tailwindcss/postcss`), custom UI kit in `components/ui` (no Material-UI anymore, despite the README)
- **Liquid glass design system**: every surface is built on `Glass` (`components/ui/liquid-glass.tsx`). Layers: CSS backdrop blur/tint → optional SVG `feDisplacementMap` refraction (map generated per element in `lib/utils/glass-map.ts`, Chromium only, auto-skipped on WebKit) → specular rim → content. Tints and layer styles live in `app/globals.css` under `@layer components` (keep them layered so Tailwind utilities can override). The animated colour field behind pages is `components/layout/aurora.tsx`.
- framer-motion for animation; SVGs imported as React components via `@svgr/webpack` (configured for webpack and turbopack in `next.config.mjs`)
- Package manager: **pnpm** (`pnpm-lock.yaml`)

## Commands

- `pnpm dev` — local dev server
- `pnpm build` — production build (run before pushing to catch errors Vercel would hit)
- `pnpm lint` — ESLint

## Layout

- `app/` — routes (`articles`, `tools`, `linkedin`, `design-system`), page-level components in `app/_components`
- `components/` — `layout`, `providers`, `ui`
- `lib/` — `data`, `types`, `utils`
- `hooks/hooks.ts` — shared hooks
- `public/` — static assets
