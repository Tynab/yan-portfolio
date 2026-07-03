# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Content-driven single-page portfolio, React 18 on Vite. All components are **function components**; content lives in data files and flows down through props — edit data, not components, to change the site.

**Render flow:** [index.js](src/index.js) (`createRoot`, Styletron engine + BaseUI `BaseProvider` + `HelmetProvider`) → [App.js](src/App.js) (styled-components `ThemeProvider` + `GlobalStyles`, passes `theme` down) → [Main.js](src/containers/Main.js) (react-router-dom 6 `HashRouter`/`Routes`, hash-based routes e.g. `/#/home`; landing route chosen by `settings.isSplash`; `Error404` catch-all). `theme` is threaded to pages as a prop. Route pages share [PageLayout.js](src/components/pageLayout/PageLayout.js) (Header + content + TopButton). [SeoHeader.js](src/components/seoHeader/SeoHeader.js) builds meta tags + JSON-LD Person via `react-helmet-async`.

**Content sources:**

- [src/portfolio.js](src/portfolio.js) — central config. Exports many named objects: `settings` (`{isSplash}`), `seo`, `greeting`, `socialMediaLinks`, `skills`, `competitiveSites`, `degrees`, `certifications`, `experience`, `projectsHeader`, `publications*`, `contactPageData`/`contactInfo`.
- `src/shared/opensource/*.json` (`organizations`, `pull_requests`, `issues`, `projects`) — static snapshots imported at build time; nothing is fetched at runtime. `projects.json` feeds the Projects page.

**Theming:** [src/theme.js](src/theme.js) defines 14 palettes; `chosenTheme` (currently `blueTheme`) selects the active one — change it to reskin the whole app. [src/global.js](src/global.js) is minimal (box-sizing, body colors, a global `0.25s` transition that animates theme changes); per-component `.css` carries the rest.

**Skill icons:** [SoftwareSkill.js](src/components/softwareSkills/SoftwareSkill.js) has two modes — `fontAwesomeClassname` → Iconify (external CDN `<script>` in `index.html`), or `imageSrc` → runtime PNG from `public/skills/` loaded as `${import.meta.env.BASE_URL}skills/<img>?v=${skillAssetVersion}` (Vite's `import.meta.env.BASE_URL`, not CRA's `process.env.PUBLIC_URL`).

**Styling stack:** styled-components 6 + Styletron/BaseUI (kept only for the Experience accordion, [ExperienceAccordion.js](src/containers/experienceAccordion/ExperienceAccordion.js)); react-awesome-reveal + `@emotion/react` (scroll animations, replaced react-reveal which doesn't support React 18); react-bootstrap 2 (tooltips); chart.js 4 / react-chartjs-2 5 (open-source charts).

## Commands (build / test / run)

```bash
npm install
npm run dev                                        # Vite dev server on :3000
npm run lint                                        # ESLint over src/**/*.js (font-awesome vendor dir excluded)
npm test                                            # vitest run — single run
npm run test:watch                                  # vitest in watch mode
npm run build                                        # vite build -> build/
npm run preview                                      # preview the production build locally
npm run deploy                                       # predeploy builds, then gh-pages publishes build/ to the gh-pages branch
```

No more `npm start` / `react-scripts` — the project moved off Create React App to Vite. `npm test` (Vitest + `@testing-library/react` + jsdom) picks up two files: `src/App.test.js` (a render smoke test) and `cloudflare/redirect-worker.test.js` (15 tests for the redirect worker's schedule logic). App/UI coverage is still just the smoke test — don't treat a green run as UI coverage.

**Deployment:** multi-stage [Dockerfile](Dockerfile) — `node:22-alpine` builds (`npm ci`, LFS verify, `npm run build`), `nginx:1.27-alpine` serves `build/` on :80 via [nginx.conf](nginx.conf) (SPA fallback, `/skills/` no-cache, 7-day static cache). [Jenkinsfile](Jenkinsfile): build → push Docker Hub (`yamiannephilim/portfolio`) → redeploy on the `yan` network + Telegram. Expected Node is **22** (per Dockerfile; no `engines`/`.nvmrc` enforces it).

**Domain scheduling:** [cloudflare/redirect-worker.js](cloudflare/redirect-worker.js) is a Cloudflare Worker that redirects `www`/apex `yamiannephilim.com` to GitHub between 23:30–08:30 VN time and back to the portfolio by day (`www…/wedding-card` stays on its own target 24/7) — the public domain pointing at GitHub at night is **intentional, not an outage**. It is deployed **manually** (paste into the Cloudflare dashboard per [cloudflare/README.md](cloudflare/README.md)); editing the file in-repo does NOT redeploy it.

## Coding conventions

- Self-authored files open with a Vietnamese `// Tóm tắt:` (or `/* … */`) summary comment; CSS/SCSS carry a header comment describing the stylesheet. Match this when adding files.
- Formatting is tool-enforced: `.husky/pre-commit` runs `lint-staged`, which prettifies staged `*.{js,css,md}` (and `package.json` via `prettier-package-json`). Don't hand-format.
- ESLint config is standalone ([.eslintrc.cjs](.eslintrc.cjs): `eslint:recommended` + `plugin:react/recommended` + `plugin:react-hooks/recommended`), not the old CRA `react-app` preset.

## Rules when editing code

- **Routes vs nav:** Header only links Home/Education/Experience/Projects. `/contact` and `/opensource` are routed but reachable only via hash URL / in-page buttons. Splash is off (`isSplash: false`). The Education page renders CompetitiveSites + Certifications only (no degrees).
- **Adding/changing a skill PNG:** bump the `skillAssetVersion` constant in [SoftwareSkill.js](src/components/softwareSkills/SoftwareSkill.js) — nginx serves `/skills/` as `no-cache` while everything else gets a 7-day cache, so the version query string is the cache-bust.
- **Reveal animations (react-awesome-reveal):** every `<Fade>` must keep `triggerOnce` — without it, elements re-hide and re-animate each time they cross the viewport, which caused violent scroll juddering (all 29 current usages have it). Also, `Fade` wraps each child in its own `<div>`: when the animated element is a flex/grid item, put the sizing class on the Fade itself via `className` (see `.cert-card-reveal` in [CertificationCard.js](src/components/certificationCard/CertificationCard.js)) — sizing only the inner element collapses the layout.
- **Binary assets use Git LFS** (svg/png/jpg/gif/woff/woff2/ttf/eot/ico per `.gitattributes`). Run `git lfs install && git lfs pull` after cloning; the Docker build runs [scripts/verify-lfs-assets.js](scripts/verify-lfs-assets.js) and **fails** if any tracked binary is still an unresolved LFS pointer.
- **`.js` files hold JSX.** [vite.config.js](vite.config.js) defines a custom `jsAsJsx` plugin (`enforce: "pre"`, esbuild-transforms any `src/**/*.js` as JSX before Rollup's import analysis) plus matching `esbuild`/`optimizeDeps` loader overrides, so components didn't need a mass rename to `.jsx` during the CRA→Vite migration. It explicitly excludes `node_modules` and the vendored `src/assests/font-awesome/`. Keep new component files under `src/` as `.js` to stay covered by this plugin.

## Do not change on your own

- **`src/assests/` is misspelled on purpose** (not `assets`) and referenced that way everywhere — renaming it breaks every import.
- **`src/assests/font-awesome/`** is vendored/minified and ESLint-ignored — don't edit or annotate it.
- **`vite.config.js`'s `base: "./"` + `build.outDir: "build"`** are what actually control relative asset paths and output location now (needed for gh-pages + nginx) — Vite ignores package.json's `homepage` field, but `"homepage": "."` is still left in package.json as a harmless leftover; don't rely on it and don't "clean it up" without checking both files stay consistent. The `overrides` block in package.json should also stay — it pins transitive deps for security advisories AND pins `react-uid`/`react-window`/`react-virtualized-auto-sizer` to React-18-compatible versions for baseui (removing those brings back npm ERESOLVE peer warnings).
- **Vite stays on v7.** Vite 8 switches to the rolldown/oxc toolchain and drops the bundled esbuild that the `jsAsJsx` plugin depends on — upgrading to v8 broke both build and tests when tried. Don't bump the Vite major (and never run `npm audit fix --force`, which force-installs vite 8) without first migrating the JSX-in-`.js` handling.
- **`src/serviceWorker.js` was deleted** during the CRA→Vite migration (it was already dormant/unregistered) — don't reintroduce a service worker; it would break the no-cache/deploy expectations baked into `nginx.conf`.
