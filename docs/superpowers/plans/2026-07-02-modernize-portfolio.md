# YAN-Portfolio Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize the portfolio (dead-code cleanup, CRA→Vite, React 16→18 + major deps, deep refactor to function components, Vietnamese comments, README rewrite) without changing the visible UI/behavior.

**Architecture:** Sequential 6-phase migration on branch `feature/modernize-portfolio`. Each phase is self-contained, ends in a passing build + lint + test + manual app check, and is committed separately so any phase can be bisected/reverted. Verification leans on build/lint/run-app because the repo has almost no automated tests.

**Tech Stack (target):** Vite 5/6 + `@vitejs/plugin-react`, React 18, react-router-dom 6, chart.js 4 + react-chartjs-2 5, react-bootstrap 2, react-helmet-async 2, react-awesome-reveal 4 (+ `@emotion/react`), styled-components 6, Vitest + @testing-library/react + jsdom, ESLint (standalone).

## Global Constraints

Every task implicitly includes these (copied from the spec):

- **No visible UI/behavior change.** The 6 pages (Home, Education, Experience, Projects, Opensource, Contact) must look and behave identically before/after.
- **Do NOT rename `src/assests/`** (misspelled on purpose; renaming churns every import).
- **Do NOT touch portfolio content** (`portfolio.js` data values, in-use images, copy text).
- Vite `build.outDir` MUST be `build` and `base` MUST be `'./'` (keep Dockerfile/nginx/gh-pages pointing at `build/`).
- Comments & summaries in **Vietnamese**; file-level summary uses `// Tóm tắt:` (or `/* */`).
- **Autogen exemptions (never comment/refactor):** `src/assests/font-awesome/**`; SVG path data inside `*Img.js` (file-level summary only).
- Node **22** (per Dockerfile). Keep `scripts/verify-lfs-assets.js`.
- **Verify after every task:** `npm run build`, `npm run lint`, `npm test` all pass; run the app for tasks that can change rendering.

---

## Phase 1 — Dead code & asset cleanup

> Still on CRA in this phase. Verification commands: `npm run build`, `npm run lint`, `npm test -- --watchAll=false`.

### Task 1.1: Delete dead container + component + data files

**Files:**

- Delete: `src/containers/projects/` (Projects.js + Project.css)
- Delete: `src/containers/blogs/` (Blogs.js + css)
- Delete: `src/containers/talks/` (Talks.js + css)
- Delete: `src/containers/podcast/` (Podcast.js + css)
- Delete: `src/containers/StartupProjects/` (StartupProject.js + css)
- Delete: `src/containers/achievement/` (Achievement.js + css)
- Delete: `src/containers/education/` (Educations.js + css)
- Delete: `src/containers/contact/` (Contact.js + css)
- Delete: `src/components/blogCard/`, `src/components/talkCard/`, `src/components/achievementCard/`, `src/components/degreeCard/`, `src/components/publicationsCard/`
- Delete: `src/shared/experience_data.json`, `src/shared/contact_data.json`

- [ ] **Step 1: Prove each target is unreferenced.** For every directory/file above, confirm no live importer.

Run (Grep tool or shell), expect **no matches outside the files being deleted**:

```bash
git grep -nE "containers/(projects|blogs|talks|podcast|StartupProjects|achievement|education|contact)/" -- 'src/*.js'
git grep -nE "(blogCard|talkCard|achievementCard|AchivementCard|degreeCard|DegreeCard|publicationsCard|PublicationCard|BlogCard|TalkCard)" -- 'src/*.js'
git grep -nE "experience_data|contact_data" -- 'src'
```

Expected: matches only appear _inside_ the files listed for deletion (e.g. `containers/blogs/Blogs.js` importing `blogCard`), never from a live page/container. If any live file references a target, STOP and reassess.

- [ ] **Step 2: Delete the files.**

```bash
git rm -r src/containers/projects src/containers/blogs src/containers/talks \
  src/containers/podcast src/containers/StartupProjects src/containers/achievement \
  src/containers/education src/containers/contact \
  src/components/blogCard src/components/talkCard src/components/achievementCard \
  src/components/degreeCard src/components/publicationsCard \
  src/shared/experience_data.json src/shared/contact_data.json
```

- [ ] **Step 3: Verify build/lint/test still pass.**

```bash
npm run build && npm run lint && npm test -- --watchAll=false
```

Expected: build succeeds, lint clean, test passes. (If lint flags an unused import somewhere pointing at a deleted file, fix it — but there should be none since targets had no live importers.)

- [ ] **Step 4: Commit.**

```bash
git add -A && git commit -m "chore: remove dead containers, cards, and unused data files"
```

### Task 1.2: Remove now-orphaned exports from `portfolio.js`

**Files:**

- Modify: `src/portfolio.js`

Deleting the containers in 1.1 may orphan these exports: `blogSection`, `talkSection`, `podcastSection`, `achievementSection`, `bigProjects`, `publications`/`publicationsHeader`, `degrees`, `contactInfo`. Remove only those with no remaining importer.

- [ ] **Step 1: Find which exports are still used.** For each candidate, grep live usage:

```bash
git grep -nE "\b(blogSection|talkSection|podcastSection|achievementSection|bigProjects|publications|publicationsHeader|degrees|contactInfo)\b" -- 'src/*.js' ':!src/portfolio.js'
```

Expected: lists remaining consumers. Any candidate with **zero** hits here is dead. (Note: `contactInfo` was only used by the deleted `containers/contact/Contact.js`; `degrees` only by deleted `containers/education/Educations.js` — expect both dead. `SeoHeader.js` uses `contactPageData`, not `contactInfo`.)

- [ ] **Step 2: Delete the dead export blocks** from `src/portfolio.js` (the `const X = {...}` definitions and their entries in the bottom `export { ... }` list). Keep every export that still has a consumer.

- [ ] **Step 3: Verify no dangling references.**

```bash
npm run build && npm run lint && npm test -- --watchAll=false
```

Expected: all pass. Lint (`no-undef`/unused) catches any export you removed that was still referenced — if so, restore it.

- [ ] **Step 4: Commit.**

```bash
git add -A && git commit -m "chore: drop portfolio.js exports orphaned by dead-code removal"
```

### Task 1.3: Delete unreferenced images/assets

**Files:**

- Delete: unreferenced files under `src/assests/images/` and `public/` (except `public/icons`, `public/manifest.json`, `public/robots.txt`, `public/index.html`, and in-use `public/skills/*`)

Images are referenced 3 ways: static `import`, dynamic `require(\`.../\${logo_path}\`)`where`logo_path`is a string in`portfolio.js`/shared JSON, and CSS`url()`. Skill PNGs in`public/skills`are referenced by`imageSrc`strings in`portfolio.js`.

- [ ] **Step 1: Build the referenced-basename set.** Collect every image basename referenced by:
  - `logo_path` / `imageSrc` / `*_image_path` string values in `src/portfolio.js` and `src/shared/**/*.json`
  - static `import ... from "...images/..."` and `require("...images/...")` literals
  - `url(...)` in `src/**/*.css`

```bash
# reference strings (portfolio + shared json + css + js)
git grep -nhoE "[A-Za-z0-9_./-]+\.(png|jpe?g|svg|gif|webp)" -- 'src/portfolio.js' 'src/shared' 'src/**/*.css' 'src/**/*.js' | sort -u
# actual files present
git ls-files 'src/assests/images' 'public/skills'
```

- [ ] **Step 2: Diff and delete the orphans.** Any file in `src/assests/images/` (and any `public/skills/*.png`) whose basename is NOT in the referenced set is dead. Expected template leftovers include (verify each has zero references before deleting): `animated_ashutosh.png`, `delhivery_logo.png`, `saayaHealthLogo.png`, `muffito_logo.png`, `legato_logo.png`, `codeInLogo.png`, `freecopy_logo.png`, `nextuLogo.jpg`, `dsc_logo.png`, `iiitk_logo.png`, and other unused `*_logo.*`. Do NOT delete a file that appears in the referenced set.

```bash
git rm src/assests/images/<orphan1> src/assests/images/<orphan2> ...
```

- [ ] **Step 3: Verify build embeds all referenced assets.**

```bash
npm run build && npm run lint && npm test -- --watchAll=false
```

Expected: build succeeds (CRA fails the build on a missing `import`/`require` target — a green build proves no in-use image was deleted). Then start the app and visually confirm Education (cert logos), Experience, Projects, Contact, and Skills icons still show images.

- [ ] **Step 4: Commit.**

```bash
git add -A && git commit -m "chore: delete unreferenced image assets"
```

---

## Phase 2 — Migrate CRA → Vite (keep dependency versions)

> After this phase, verification commands change to: `npm run build`, `npm run lint`, `npm test` (Vitest, non-watch), `npm run preview`.

### Task 2.1: Install Vite, add config, move index.html

**Files:**

- Modify: `package.json` (add devDeps)
- Create: `vite.config.js`
- Move: `public/index.html` → `index.html` (repo root), edit contents

- [ ] **Step 1: Install build deps.**

```bash
npm install -D vite @vitejs/plugin-react
```

- [ ] **Step 2: Create `vite.config.js`** at repo root:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Tóm tắt: Cấu hình Vite cho portfolio — giữ base tương đối và output vào build/.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { outDir: "build" },
  server: { port: 3000 },
  // Cho phép cú pháp JSX trong file .js (tránh đổi tên hàng loạt file).
  esbuild: { loader: "jsx", include: /src\/.*\.js$/ },
  optimizeDeps: { esbuildOptions: { loader: { ".js": "jsx" } } },
});
```

- [ ] **Step 3: Move and rewrite `index.html`.** `git mv public/index.html index.html`, then: remove all `%PUBLIC_URL%` (replace `%PUBLIC_URL%/foo` with `/foo`), and before `</body>` add the module entry:

```html
<script type="module" src="/src/index.js"></script>
```

Keep the existing Iconify CDN `<script>` and favicon/manifest links (rewritten to `/...`).

- [ ] **Step 4: Do not verify yet** (entry not wired). Proceed to 2.2.

### Task 2.2: Rewrite entry, fix env, delete serviceWorker

**Files:**

- Modify: `src/index.js`
- Modify: `src/components/softwareSkills/SoftwareSkill.js:40`
- Delete: `src/serviceWorker.js`

- [ ] **Step 1: Delete the service worker + its import.**

```bash
git rm src/serviceWorker.js
```

In `src/index.js` remove `import * as serviceWorker from "./serviceWorker";` and the `serviceWorker.unregister();` line. (React-18 `createRoot` swap happens in Phase 3; keep `ReactDOM.render` for now so this phase is a pure tooling swap.)

- [ ] **Step 2: Fix the skills env var.** In `SoftwareSkill.js` replace `process.env.PUBLIC_URL` with `import.meta.env.BASE_URL` (note `BASE_URL` already ends with `/`, so use `${import.meta.env.BASE_URL}skills/${logo.imageSrc}?v=${skillAssetVersion}`).

- [ ] **Step 3: Verify dev boots.**

```bash
npm run dev
```

Expected: Vite serves on :3000, app renders. Ctrl-C after confirming.

- [ ] **Step 4: Commit** (partial phase; acceptable — still boots).

```bash
git add -A && git commit -m "build: wire Vite entry, drop CRA service worker, fix skills BASE_URL"
```

### Task 2.3: Convert dynamic `require()` image loads to Vite-compatible imports

**Files:**

- Modify: `src/components/certificationCard/CertificationCard.js:26`
- Modify: `src/components/experienceCard/ExperienceCard.js:21`
- Modify: `src/pages/contact/ContactComponent.js:29`

Vite does not support dynamic `require(\`...\${var}\`)`. Use`new URL(..., import.meta.url)`.

- [ ] **Step 1: Replace each dynamic require.** Pattern (apply per file, adjusting the variable):

```js
// before:
src={require(`../../assests/images/${certificate.logo_path}`)}
// after:
src={new URL(`../../assests/images/${certificate.logo_path}`, import.meta.url).href}
```

Apply the same transform to `experience["logo_path"]` in `ExperienceCard.js` and `ContactData["profile_image_path"]` in `ContactComponent.js`.

- [ ] **Step 2: Verify images resolve in dev and build.**

```bash
npm run build && npm run preview
```

Expected: build succeeds; on the preview server, cert logos (Education), experience logos, and the contact profile image all render.

- [ ] **Step 3: Commit.**

```bash
git add -A && git commit -m "build: convert dynamic require() image loads to import.meta URLs"
```

### Task 2.4: Swap test runner to Vitest

**Files:**

- Modify: `package.json`
- Create: `src/setupTests.js`
- Modify: `src/App.test.js`
- Modify: `vite.config.js` (add `test` block)

- [ ] **Step 1: Install.**

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: Add Vitest config** to `vite.config.js` (inside `defineConfig({...})`):

```js
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
```

- [ ] **Step 3: Create `src/setupTests.js`:**

```js
// Tóm tắt: Nạp matcher jest-dom cho Vitest.
import "@testing-library/jest-dom";
```

- [ ] **Step 4: Rewrite `src/App.test.js`** to the RTL smoke test:

```js
// Tóm tắt: Smoke test — App render không lỗi.
import { render } from "@testing-library/react";
import App from "./App";

test("App renders without crashing", () => {
  render(<App />);
});
```

- [ ] **Step 5: Run the test.**

```bash
npx vitest run
```

Expected: 1 passed.

- [ ] **Step 6: Commit.**

```bash
git add -A && git commit -m "test: migrate to Vitest + testing-library"
```

### Task 2.5: Replace CRA ESLint preset with standalone config

**Files:**

- Create: `.eslintrc.cjs`
- Modify: `package.json` (remove `eslintConfig` block)

- [ ] **Step 1: Install plugins.**

```bash
npm install -D eslint eslint-plugin-react eslint-plugin-react-hooks
```

- [ ] **Step 2: Create `.eslintrc.cjs`:**

```js
// Tóm tắt: Cấu hình ESLint độc lập (thay preset react-app của CRA).
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: "detect" } },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  rules: { "react/prop-types": "off" },
  ignorePatterns: ["build/", "src/assests/font-awesome/**"],
};
```

- [ ] **Step 3: Remove** the `"eslintConfig": { "extends": "react-app" }` block from `package.json`.

- [ ] **Step 4: Run lint and fix real errors.**

```bash
npx eslint "src/**/*.js"
```

Expected: passes (or only fixable warnings). Fix genuine errors; do not silence with broad disables.

- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "chore: standalone ESLint config (drop CRA react-app preset)"
```

### Task 2.6: Rewrite package.json scripts, remove react-scripts

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Replace the `scripts` block:**

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint \"src/**/*.js\"",
    "test": "vitest run",
    "test:watch": "vitest",
    "predeploy": "npm run build",
    "deploy": "gh-pages -b gh-pages -d build",
    "prepare": "husky"
  },
```

- [ ] **Step 2: Remove `react-scripts`** and the CRA `browserslist` block (Vite uses its own targets) from `package.json`, then reinstall:

```bash
npm uninstall react-scripts
```

- [ ] **Step 3: Update `.gitignore`** — ensure `build/` (or Vite `dist/`) and `node_modules` ignored; remove CRA-only entries if present.

- [ ] **Step 4: Full verify.**

```bash
npm run build && npm run lint && npm test && npm run preview
```

Expected: all pass; preview serves the site correctly. Visually check all 6 pages.

- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "build: replace react-scripts with Vite scripts"
```

### Task 2.7: Confirm Docker build still works

**Files:**

- Modify (if needed): `Dockerfile`

- [ ] **Step 1: Check the build stage.** `Dockerfile` runs `npm ci` + `node scripts/verify-lfs-assets.js` + `npm run build`, copies `/app/build`. Since `outDir` is `build`, no path change is needed. Confirm `npm ci` works against the new `package-lock.json` (regenerate lockfile: `npm install` and commit it).

- [ ] **Step 2: Build the image (if Docker available).**

```bash
docker build -t portfolio-vite-test .
```

Expected: image builds; the LFS check passes (requires `git lfs pull`). If Docker is unavailable, note it and rely on `npm run build` + `preview` as the proxy.

- [ ] **Step 3: Commit any Dockerfile/lockfile changes.**

```bash
git add -A && git commit -m "build: sync lockfile and confirm Docker build on Vite"
```

---

## Phase 3 — Major dependency upgrades + animation swap

> Do these as ordered sub-tasks; verify (`build` + `lint` + `test` + run app) after EACH task, not just at the end — this is where breakage concentrates.

### Task 3.1: React 16 → 18

**Files:**

- Modify: `package.json`, `src/index.js`

- [ ] **Step 1: Install.**

```bash
npm install react@18 react-dom@18
```

- [ ] **Step 2: Switch to `createRoot`** in `src/index.js`:

```js
import { createRoot } from "react-dom/client";
// ...
const container = document.getElementById("root");
createRoot(container).render(
  <StyletronProvider value={engine}>
    <BaseProvider theme={LightTheme}>
      <App />
    </BaseProvider>
  </StyletronProvider>
);
```

- [ ] **Step 3: Verify.** `npm run build && npm run lint && npm test && npm run dev`. Expected: app renders. Note any console warnings from old deps (fixed in later tasks). Commit: `git commit -am "deps: upgrade to React 18 (createRoot)"`.

### Task 3.2: react-router-dom 5 → 6

**Files:**

- Modify: `package.json`, `src/containers/Main.js`, plus any file using `withRouter`/`useHistory`/`this.props.history`

- [ ] **Step 1: Install.** `npm install react-router-dom@6`

- [ ] **Step 2: Find router API usages** that break:

```bash
git grep -nE "withRouter|useHistory|props\.history|props\.match|<Switch|Redirect" -- 'src'
```

Fix each (v6): `useHistory()`→`useNavigate()`, `history.push(x)`→`navigate(x)`.

- [ ] **Step 3: Rewrite `Main.js`** to v6 (`Routes`/`Route element`, `path="*"` for 404):

```jsx
import { Route, Routes, HashRouter } from "react-router-dom";
// ...
export default function Main({ theme }) {
  const Landing = settings.isSplash ? Splash : Home;
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing theme={theme} />} />
        <Route path="/home" element={<Home theme={theme} />} />
        <Route path="/experience" element={<Experience theme={theme} />} />
        <Route path="/education" element={<Education theme={theme} />} />
        <Route path="/opensource" element={<Opensource theme={theme} />} />
        <Route path="/contact" element={<Contact theme={theme} />} />
        <Route path="/projects" element={<Projects theme={theme} />} />
        {settings.isSplash && (
          <Route path="/splash" element={<Splash theme={theme} />} />
        )}
        <Route path="*" element={<Error404 theme={theme} />} />
      </Routes>
    </HashRouter>
  );
}
```

- [ ] **Step 4: Verify** every route by hash URL: `/#/`, `/#/home`, `/#/education`, `/#/experience`, `/#/projects`, `/#/opensource`, `/#/contact`, and a bad URL → 404. `npm run build && npm run lint && npm test`. Commit: `git commit -am "deps: migrate react-router to v6"`.

### Task 3.3: chart.js 2 → 4 + react-chartjs-2 2 → 5

**Files:**

- Modify: `package.json`, `src/components/issueChart/IssueChart.js`, `src/components/pullRequestChart/PullRequestChart.js`

- [ ] **Step 1: Install.** `npm install chart.js@4 react-chartjs-2@5`

- [ ] **Step 2: Register controllers** (v4 is tree-shaken). Both charts use Doughnut — add at top of each chart file:

```js
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
ChartJS.register(ArcElement, Tooltip, Legend);
```

- [ ] **Step 3: Migrate options** to v4 shape if needed (e.g. `legend`/`tooltips` moved under `plugins`). Keep the same colors and data so the charts look identical.

- [ ] **Step 4: Verify** the Opensource page renders both doughnut charts with correct colors/legend. `npm run build && npm run lint && npm test`. Commit: `git commit -am "deps: upgrade chart.js to v4 + react-chartjs-2 v5"`.

### Task 3.4: react-bootstrap beta → 2

**Files:**

- Modify: `package.json`, the 6 files importing `react-bootstrap`

- [ ] **Step 1: Install.** `npm install react-bootstrap@2` (bootstrap 5 already present). Ensure `import "bootstrap/dist/css/bootstrap.min.css"` still loads (check where CSS is imported today; keep it).

- [ ] **Step 2: Verify tooltips** (`OverlayTrigger`/`Tooltip`) in: `SoftwareSkill`, `CompetitiveSites`, `OrganizationList`, `PullRequestCard`, `IssueCard`, `ProjectLanguages`. The v2 API for these is compatible; confirm hover tooltips still appear.

- [ ] **Step 3: Verify + commit.** `npm run build && npm run lint && npm test`, hover-check tooltips. `git commit -am "deps: upgrade react-bootstrap to v2"`.

### Task 3.5: react-helmet → react-helmet-async

**Files:**

- Modify: `package.json`, `src/index.js`, `src/components/seoHeader/SeoHeader.js`, `src/portfolio.js` (only the `react-helmet` import, if any)

- [ ] **Step 1: Install.** `npm uninstall react-helmet && npm install react-helmet-async`

- [ ] **Step 2: Wrap the app** in `HelmetProvider` in `src/index.js` (outermost or just inside providers):

```jsx
import { HelmetProvider } from "react-helmet-async";
// wrap <App /> with <HelmetProvider>...</HelmetProvider>
```

- [ ] **Step 3: Update imports** — replace `import { Helmet } from "react-helmet"` with `from "react-helmet-async"` in `SeoHeader.js` (and anywhere else the grep in Step 4 finds).

- [ ] **Step 4: Verify.**

```bash
git grep -n "react-helmet\"" -- 'src'   # expect: no results (all -async now)
npm run build && npm run lint && npm test
```

Check page `<title>`/meta render (view source / devtools head). Commit: `git commit -am "deps: switch to react-helmet-async"`.

### Task 3.6: react-reveal → react-awesome-reveal

**Files:**

- Modify: `package.json`, all files importing `react-reveal` (re-grep after Phase 1; ~24 files incl. pages, containers, cards)

- [ ] **Step 1: Install.** `npm uninstall react-reveal && npm install react-awesome-reveal @emotion/react`

- [ ] **Step 2: Get the live file list.**

```bash
git grep -lE "react-reveal" -- 'src/*.js'
```

- [ ] **Step 3: Map imports per file.** `react-reveal` default-imports (`import Fade from "react-reveal/Fade"`) → named imports from `react-awesome-reveal` (`import { Fade } from "react-awesome-reveal"`). Do the same for `Slide`, `Zoom`, `Rotate`, `Roll`, `Bounce` if present. Note prop differences: react-awesome-reveal uses `direction="up|down|left|right"` instead of react-reveal's `top/bottom/left/right` booleans, and `triggerOnce` instead of relying on default. Preserve the existing visual effect (e.g. `<Fade bottom>` → `<Fade direction="up" triggerOnce>`; verify direction matches the original motion).

- [ ] **Step 4: Verify** each page's reveal animations still play and content is visible (a broken reveal can leave content at opacity 0). `npm run build && npm run lint && npm test`, then scroll every page. Commit: `git commit -am "deps: replace react-reveal with react-awesome-reveal"`.

### Task 3.7: styled-components 5 → 6

**Files:**

- Modify: `package.json`, `src/global.js`, `src/theme.js` (consumers), any styled usage

- [ ] **Step 1: Install.** `npm install styled-components@6`

- [ ] **Step 2: Check breaking changes** — v6 drops some v5 behaviors; grep for `styled(` and `createGlobalStyle`, verify `ThemeProvider` usage in `App.js` and `useContext`/`props.theme` reads still work. The theme object shape is unchanged, so `props.theme.text` etc. keep working.

- [ ] **Step 3: Verify** theming (colors) and the global 0.25s transition still apply across all pages. `npm run build && npm run lint && npm test`. Commit: `git commit -am "deps: upgrade styled-components to v6"`.

### Task 3.8: Evaluate removing baseui/styletron

**Files:**

- Modify (if removing): `package.json`, `src/index.js`

- [ ] **Step 1: Determine if baseui/styletron are used** beyond the `index.js` wrapper:

```bash
git grep -nE "baseui|styletron" -- 'src' ':!src/index.js'
```

Expected: no results (only the index.js provider wrapper uses them).

- [ ] **Step 2: If unused elsewhere, remove the wrapper** in `index.js` (render `<App />` directly, keeping `HelmetProvider`) and uninstall:

```bash
npm uninstall baseui styletron-engine-atomic styletron-react
```

If they ARE used elsewhere, instead upgrade to React-18-compatible versions and skip removal.

- [ ] **Step 3: Verify + commit.** `npm run build && npm run lint && npm test && npm run dev` — app renders identically. `git commit -am "chore: remove unused baseui/styletron providers"` (or the upgrade equivalent).

---

## Phase 4 — Deep refactor (no visible change)

### Task 4.1: Convert class components → function components

**Files:** all remaining class components (re-grep post-Phase-1). After deletions, this is the routed pages + used containers + used components, e.g.: `HomeComponent`, `EducationComponent`, `Experience`, `pages/projects/Projects`, `Opensource`, `ContactComponent`, `Error`, `Splash`, `Header`, `SkillSection`, `ExperienceAccordion`, `Certifications`, `Organizations`, `PullRequests`, `Issues`, `OpensourceCharts`, `OrganizationList`, `IssueChart`, `PullRequestChart`, `CompetitiveSites`, `CertificationCard`, `IssueCard`, `PullRequestCard`, `ProjectLanguages`, `LoaderLogo`, `ToggleSwitch`, `SoftwareSkill`, `ExperienceCard`, and the `*Img.js` classes.

- [ ] **Step 1: Re-list class components.** `git grep -lE "extends (React\\.)?Component" -- 'src/*.js'`

- [ ] **Step 2: Convert each using this mechanical pattern.** Example — `Opensource.js`:

```jsx
// before: class Opensource extends Component { render() { return (<div>...{this.props.theme}...</div>); } }
// after:
export default function Opensource({ theme }) {
  return (
    <div className="opensource-main">
      <Header theme={theme} />
      {/* ...same children, this.props.theme -> theme... */}
    </div>
  );
}
```

Rules: `this.props.X` → destructured prop `X`; `this.state`/lifecycle → `useState`/`useEffect` (most of these have neither); keep JSX and class names byte-identical. `*Img.js` become `const X = ({ theme }) => (<svg>...</svg>)` with the SVG untouched.

- [ ] **Step 3: Verify after each handful of conversions.** `npm run build && npm run lint && npm test`, spot-check the affected page. Do NOT convert all 30 then verify once — convert ~5, verify, repeat, so a regression is easy to locate.

- [ ] **Step 4: Commit in logical batches** (e.g. per directory): `git commit -am "refactor: convert <area> to function components"`.

### Task 4.2: Extract a shared `PageLayout`

**Files:**

- Create: `src/components/pageLayout/PageLayout.js`
- Modify: each routed page

- [ ] **Step 1: Create the layout** capturing the repeated `Header + content + TopButton` shell:

```jsx
// Tóm tắt: Khung trang dùng chung — Header + nội dung + nút cuộn lên.
import Header from "../header/Header";
import TopButton from "../topButton/TopButton";

export default function PageLayout({ theme, className, children }) {
  return (
    <div className={className}>
      <Header theme={theme} />
      {children}
      <TopButton theme={theme} />
    </div>
  );
}
```

- [ ] **Step 2: Adopt it** in pages whose structure is exactly Header+content+TopButton (e.g. `Opensource`, `Education`, `Contact`, `Projects`). Keep the outer `className` (e.g. `opensource-main`) so CSS is unchanged. Leave pages with a different shell alone.

- [ ] **Step 3: Verify** those pages render identically (header + content + scroll button). `npm run build && npm run lint && npm test`. Commit: `git commit -am "refactor: extract shared PageLayout"`.

### Task 4.3: Consolidate `*Img.js` + extract constants

**Files:**

- Modify: `*Img.js` files, `SoftwareSkill.js`, chart components

- [ ] **Step 1: DRY the Img components** only where they share identical structure (theme-colored SVG wrapper). If each SVG is genuinely unique, leave them — do NOT force a bad abstraction. YAGNI.

- [ ] **Step 2: Hoist magic values** — keep `skillAssetVersion` as a named constant (already is); pull chart color hexes in `IssueChart`/`PullRequestChart` into named consts at top of file for clarity (same values → same appearance).

- [ ] **Step 3: Remove leftover unused imports/vars** flagged by lint across the tree.

- [ ] **Step 4: Verify + commit.** `npm run build && npm run lint && npm test`. `git commit -am "refactor: tidy Img components and hoist constants"`.

---

## Phase 5 — Vietnamese comments & summaries

### Task 5.1: Comment sweep across all non-autogen files

**Files:** every `src/**/*.js` and `src/**/*.css`/`*.scss` EXCEPT `src/assests/font-awesome/**`

- [ ] **Step 1: Inventory files missing a summary.**

```bash
git grep -L "Tóm tắt" -- 'src/**/*.js' 'src/**/*.css' 'src/**/*.scss' ':!src/assests/font-awesome/**'
```

- [ ] **Step 2: Add a file-level `// Tóm tắt:` summary** (one line, Vietnamese) at the top of each JS file (just after imports) and a `/* Tóm tắt: */` header to each CSS/SCSS. For files that already have one, improve it if stale after refactor.

- [ ] **Step 3: Add inline Vietnamese comments** for non-obvious logic only (e.g. the `settings.isSplash` landing choice, the `skillAssetVersion` cache-bust rationale, chart.js registration, awesome-reveal direction mapping, the `import.meta.url` asset trick). Do NOT comment trivial lines. For `*Img.js`, add only the file-level summary — leave SVG path data uncommented.

- [ ] **Step 4: Verify lint still clean** (comments don't break anything) and build passes.

```bash
npm run lint && npm run build
```

- [ ] **Step 5: Commit.** `git commit -am "docs: add Vietnamese summaries and comments across source"`.

---

## Phase 6 — README + CLAUDE.md

### Task 6.1: Rewrite README.md (Vietnamese)

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Rewrite** to reflect the final stack: Vite (dev/build/preview/test scripts), React 18, react-router 6, chart.js 4, react-awesome-reveal, styled-components 6; the real (post-cleanup) folder structure; content model (`portfolio.js` + `shared/opensource/*.json`); theming (`chosenTheme`); skills via `public/skills` + `skillAssetVersion` + `import.meta.env.BASE_URL`; Git LFS + `verify-lfs-assets.js`; deployment (Docker/nginx `build/`, Jenkins, gh-pages). Remove stale CRA/`npm start`/react-reveal references.

- [ ] **Step 2: Verify** every command in the README actually runs (`npm run dev/build/preview/test/lint`).

- [ ] **Step 3: Commit.** `git commit -am "docs: rewrite README for Vite/React 18 stack"`.

### Task 6.2: Sync CLAUDE.md

**Files:**

- Modify: `CLAUDE.md`

- [ ] **Step 1: Update** commands (Vite/Vitest), architecture (function components, PageLayout, router v6, no dead containers), and the "do not change" list (`base:'./'` replaces `homepage`, `import.meta.env.BASE_URL` replaces `PUBLIC_URL`, serviceWorker removed). Remove now-obsolete gotchas (dead-container trap no longer applies).

- [ ] **Step 2: Commit.** `git commit -am "docs: sync CLAUDE.md with modernized stack"`.

---

## Self-Review (completed by plan author)

- **Spec coverage:** Phase 1 ↔ spec §5 (cleanup); Phase 2 ↔ §6 (Vite); Phase 3 ↔ §7 (deps + awesome-reveal, incl. baseui eval §7); Phase 4 ↔ §8 (refactor, PageLayout, Img, constants); Phase 5 ↔ §9 (VN comments + autogen exemptions); Phase 6 ↔ §10 (README + CLAUDE.md). Verify-per-phase (§4) baked into every task. Risks (§11) mitigated by ordered per-task verification.
- **Placeholder scan:** Concrete deletion candidates, exact upgrade commands, and real code for every breaking migration are provided. The image-orphan set and post-Phase-1 class/reveal lists are intentionally derived at execution time via the given grep commands (contents change as earlier tasks delete files); each such step includes the exact command to produce the list.
- **Type/name consistency:** `PageLayout({ theme, className, children })` consumed consistently in 4.2; `skillAssetVersion` name preserved; router v6 element names match imports.
