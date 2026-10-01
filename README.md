# YAN Portfolio

YAN Portfolio là trang portfolio cá nhân của **Nguyễn Đặng Trường An (Yami An)**, xây bằng React 18 + Vite. Toàn bộ nội dung tập trung trong `src/portfolio.js` và snapshot danh sách project `src/shared/opensource/projects.json`; component chỉ nhận dữ liệu qua props và render lại — muốn đổi nội dung thì sửa data, không sửa component.

- Portfolio trực tuyến: https://yamiannephilim.com/
- Hồ sơ/CV: [Google Drive](https://drive.google.com/file/d/1JWoXHF78fXxbPtxaJqgELhQ28aLLwsBx/view?usp=sharing)
- Liên hệ: [GitHub](https://github.com/Tynab) · [LinkedIn](https://www.linkedin.com/in/yamiannephilim/) · [Facebook](https://www.facebook.com/yami.an.nephilim/) · [X/Twitter](https://twitter.com/yamiannephilim) · [Gmail](mailto:yamiannephilim@gmail.com)

## Stack kỹ thuật

- **React 18** + `react-dom` 18 (`createRoot`), **react-router-dom 7** với `HashRouter` (route dạng `/#/...`).
- **Vite 7** (`@vitejs/plugin-react`) làm build tool/dev server, thay cho Create React App; một plugin nội bộ (`jsAsJsx` trong `vite.config.js`) cho phép JSX tồn tại trong file `.js` để không phải đổi tên hàng loạt.
- Theme bằng CSS variable, không dùng thư viện CSS-in-JS: `applyTheme()` trong `src/theme.js` gắn màu của `chosenTheme` thành `--color-body`, `--color-text`, `--color-secondary-text`, `--color-highlight`, `--color-header` lên `<html>`; style nền toàn cục (box-sizing, màu nền/chữ) nằm trong `src/base.css`. Accordion trang Experience dùng `<details>`/`<summary>` gốc.
- `react-awesome-reveal` + `@emotion/react` cho animation cuộn trang.
- Tooltip tự viết trong `src/components/tooltip` (portal ra `<body>`, hiện khi hover hoặc focus bàn phím, đóng bằng Escape, gắn `role="tooltip"` + `aria-describedby`); không dùng thư viện UI.
- Icon mạng xã hội và nút lên đầu trang là SVG inline trong `src/components/icons` (path giữ nguyên từ Font Awesome Free 6.4.2, icon theo giấy phép CC BY 4.0), không nạp font icon từ CDN. Riêng icon kỹ năng/chứng chỉ dạng Iconify vẫn nạp script Iconify từ CDN (`defer`) trong `index.html`.
- `react-helmet-async` (`HelmetProvider`): `SeoHeader` đặt `<title>` mặc định và JSON-LD Person; mỗi trang đặt `<title>` riêng qua `src/components/seoHeader/PageTitle.js`.
- `Vitest` 5 + `@testing-library/react` + `jsdom` cho test; ESLint cấu hình độc lập (`.eslintrc.cjs`, không còn dùng preset `react-app`). Node theo `engines`: `^22.13.0 || >=24.0.0`.

Toàn bộ component đã chuyển thành **function component** (không còn class component).

## Kiến trúc source

```text
index.html                     # Entry HTML của Vite (nằm ở repo root, không phải public/)
vite.config.js                 # Cấu hình Vite: base "./", outDir "build", plugin jsAsJsx, Vitest
src/
  index.js                     # Entry point: applyTheme(chosenTheme), HelmetProvider, createRoot(...).render
  App.js                       # Root app: truyền chosenTheme xuống Main
  base.css                     # Style nền toàn cục (box-sizing, màu nền/chữ theo CSS variable --color-*)
  portfolio.js                 # Nguồn dữ liệu nội dung chính của portfolio
  theme.js                     # 14 bảng theme màu, chosenTheme, applyTheme() gắn CSS variable
  containers/Main.js           # HashRouter + layout route, các trang nạp lazy (React.lazy) theo route
  components/                  # Header, card, social, pageLayout... (đều là function component)
  components/pageLayout/       # Layout route: Header + <main> (Suspense + <Outlet/>) + TopButton, mount một lần
  components/tooltip/          # Tooltip accessible tự viết (portal, hover/focus, Escape)
  components/icons/            # Icon SVG inline (SvgIcon, brandIcons, solidIcons)
  components/seoHeader/        # SeoHeader (title mặc định + JSON-LD) và PageTitle (title từng trang)
  containers/                  # Section tái sử dụng (greeting, skills, certifications, experience accordion)
  pages/                       # Màn hình route-level (home, certifications, experience, projects, contact, splash, errors)
  shared/opensource/projects.json # Snapshot các repository hiển thị ở trang Projects
  assests/                     # images, fonts (WOFF2) — tên cố ý sai chính tả, không đổi thành "assets"
public/skills/                 # Icon kỹ năng WebP
public/icons/                  # Favicon, apple-touch, android/manifest, ms-tile
assets-src/README.md           # Quy ước và cách sinh lại asset nhị phân
scripts/
  verify-lfs-assets.js         # Chặn build nếu asset là con trỏ Git LFS (checkout hỏng)
  generate-icons.py            # Sinh toàn bộ icon site từ ảnh cá nhân (Pillow)
  server/                      # bootstrap-runner.sh, install-runner.sh: cài self-hosted runner lên server deploy
.github/workflows/             # ci.yml, deploy.yml, deploy-worker.yml
cloudflare/                    # redirect-worker.js (+ test), wrangler.toml, README.md
docs/DEPLOY.md                 # Kiến trúc CI/CD, secret/variable, thiết lập từ đầu, rollback
Dockerfile, nginx.conf
```

Các file source tự viết mở đầu bằng comment tóm tắt tiếng Việt (`// Tóm tắt:` hoặc khối `/* ... */`); CSS tự viết cũng có header mô tả vai trò stylesheet.

## Luồng chạy chính

1. `src/index.js` gọi `applyTheme(chosenTheme)` trước khi render (lần paint đầu đã đúng màu, không nháy), nạp `base.css` + `index.css`, rồi `createRoot(...).render(...)` trong `HelmetProvider`.
2. `App` truyền `chosenTheme` xuống `Main`.
3. `Main` (`containers/Main.js`) dùng `HashRouter` + `Routes` (react-router-dom 7); `"/"` chuyển hướng sang `/home` (hoặc `/splash` nếu bật `settings.isSplash`) để menu đánh dấu đúng mục Home; còn lại là route cho Home, Certifications (`/education` cũ tự chuyển hướng sang `/certifications`), Experience, Projects, Contact và `Error404` bắt mọi path không khớp. Mỗi trang là một chunk riêng (`React.lazy`).
4. Mọi trang (trừ Splash) nằm dưới layout route `PageLayout` (Header + `<main>` + `TopButton`), nên Header không remount khi chuyển trang; khi người dùng chuyển trang, focus được đưa về `<main>`. Menu Header gồm Home, Certifications, Experience, Projects, Contact.
5. `SeoHeader` (trong Header) đặt `<title>` mặc định và JSON-LD Person; mỗi trang dùng `PageTitle` để đặt `<title>` dạng `"<Trang> | Yami An's Portfolio"` (Home giữ title mặc định). Description/Open Graph để tĩnh trong `index.html` cho crawler không chạy JS.

## Cấu hình nội dung

- Thông tin cá nhân, social links, SEO, kỹ năng, chứng chỉ, kinh nghiệm, project header và contact nằm trong `src/portfolio.js`.
- Danh sách project trên trang Projects lấy từ `src/shared/opensource/projects.json` (trang Open Source của template gốc đã gỡ, thư mục này chỉ còn file đó).
- Icon mạng xã hội: khóa `fontAwesomeIcon` trong `socialMediaLinks` được ánh xạ sang component SVG trong `SocialMedia.js`; thêm mạng mới thì thêm path vào `components/icons/brandIcons.js` và khai báo trong Map đó.
- Ảnh trang Contact lấy từ `contactSection.profile_image_url` (avatar GitHub).
- Theme hiện tại là `blueTheme` trong số 14 palette khai báo ở `src/theme.js`; đổi `chosenTheme` để reskin toàn bộ site.
- `settings.isSplash = false`: route `/` chuyển thẳng sang `/home`. Đặt `true` để dùng màn splash làm landing.

## Skill icon (`SoftwareSkill.js`)

Mỗi skill trong `portfolio.js` chọn một trong hai chế độ hiển thị:

- `fontAwesomeClassname` → icon Iconify (tên khóa giữ từ template), nạp qua script CDN Iconify khai báo trong `index.html`.
- `imageSrc` → ảnh `public/skills/*.webp` (cao 96px, hiển thị cao 48px cho màn hình retina), nạp theo đường dẫn `${import.meta.env.BASE_URL}skills/<tên-file>?v=${skillAssetVersion}`.

nginx cache `/skills/` dài hạn (`immutable`), nên **mỗi khi thêm/đổi ảnh skill phải bump hằng số `skillAssetVersion`** trong `SoftwareSkill.js` để bust cache. Cách chuyển ảnh gốc sang WebP 96px: `assets-src/README.md`.

## Icon site (`public/icons/`)

- Favicon, apple-touch-icon, icon Android/manifest và ms-tile được sinh từ **ảnh cá nhân của chủ site** bằng `python3 scripts/generate-icons.py <ảnh>` (cần Pillow; tham số `--focus`, `--zoom`, `--out`, `--only` xem docstring của script). Script ghi đúng tên file mà `index.html`/`public/manifest.json` tham chiếu và bỏ metadata EXIF/GPS.
- Bộ icon hiện tại sinh từ ảnh chân dung của chủ portfolio (`--focus 0.47,0.33 --zoom 2.2`, vùng cắt tập trung vào khuôn mặt); ảnh gốc không commit vào repo. `ms-icon-310x310.png` đồng thời là ảnh preview (`og:image`) khi chia sẻ link.
- `ms-icon-310x310.png` đồng thời là `og:image` khi chia sẻ link.

## Lệnh phát triển

```bash
npm install
npm run dev            # Vite dev server, mặc định cổng 3000
npm run lint           # ESLint trên src/**/*.js
npm test               # vitest run — chạy test một lần
npm run test:watch     # vitest ở chế độ watch
npm run build          # vite build -> thư mục build/
npm run preview        # Preview bản build production cục bộ
```

Test hiện có (chưa phải coverage đầy đủ):

- `src/App.test.js` — smoke test render App và `applyTheme` gắn đúng CSS variable.
- `src/theme.test.js` — giá trị mặc định của CSS variable trong `src/base.css` khớp `chosenTheme` (tránh nháy màu khi tải trang).
- `src/containers/Main.test.js` — router: `/` → `/home`, `/education` → `/certifications`, trang 404 và `<title>` từng trang.
- `src/components/header/Header.test.js` — Escape đóng menu và trả focus, chỉ một link `aria-current`, có mục Contact, đổi route thì đóng menu.
- `src/components/tooltip/Tooltip.test.js` — ARIA của tooltip (`toDomId`), hiện khi focus/hover, ẩn bằng Escape, giữ mở khi rê chuột sang bong bóng.
- `cloudflare/redirect-worker.test.js` — Worker failover: probe `/healthz` (sống/chết, lỗi kết nối, timeout), memo 30 giây, wedding-card, chế độ pass-through.

Không còn `npm start` / `react-scripts` — dự án đã rời Create React App, dùng Vite làm build tool.

## Asset nhị phân

Repo **không còn dùng Git LFS**: hạn mức LFS của tài khoản đã hết và mọi file nhị phân đều nhỏ (icon kỹ năng WebP, icon site, ảnh logo, font web), nên tất cả lưu dạng blob Git thường; `.gitattributes` chỉ đánh dấu chúng là `binary`. Clone bình thường, không cần `git lfs pull`, và đừng thêm lại rule `filter=lfs`.

`scripts/verify-lfs-assets.js` vẫn được giữ làm chốt chặn checkout hỏng/cũ: Dockerfile và CI chạy nó và **fail** nếu asset nào trong `public/` hoặc `src/assests/` là con trỏ LFS.

## CI, Docker và deploy

- GitHub Actions (`.github/workflows/`):
  - `ci.yml` — mỗi push (`main`/`develop`) và pull request: `npm ci`, verify asset, lint, test, build, rồi build thử Docker image (không push). Không dùng secret.
  - `deploy.yml` — push `main` hoặc Run workflow (tùy chọn `image_tag` để deploy lại/rollback), chỉ chạy khi biến repo `DEPLOY_ENABLED` = `true`: build & push `yamiannephilim/portfolio` (`latest` + `sha-<7 ký tự>`) lên Docker Hub, rồi **self-hosted runner trên server** chạy lại container `yan-portfolio` (tên mà Cloudflare Tunnel trỏ tới), chờ HEALTHCHECK `healthy` (lỗi thì rollback image cũ) và báo Telegram.
  - `deploy-worker.yml` — push `main` có đổi `cloudflare/**` hoặc chính file workflow, hoặc Run workflow, chỉ chạy khi `WORKER_DEPLOY_ENABLED` = `true`: test Worker → `npx wrangler@4 deploy` → xác nhận qua API version mới nhận 100% traffic → smoke test (Cloudflare chặn IP runner ở edge thì chỉ cảnh báo — khi đó phải `curl -sI https://yamiannephilim.com` tay từ máy nhà).
- `Dockerfile` build nhiều stage: stage `build` dùng `node:22-alpine`, `npm ci`, chạy `scripts/verify-lfs-assets.js`, `npm run lint && npm test` (lỗi là dừng build) rồi `npm run build`; stage runtime dùng `nginx:1.27-alpine` serve `build/` trên cổng `80`, kèm `HEALTHCHECK` gọi `/healthz`.
- `nginx.conf`: SPA fallback `try_files ... /index.html`, bật gzip; `/healthz` trả `200 ok` (`no-store`, không ghi log); `/favicon.ico` trả `icons/favicon.ico`. Cache: `index.html`, `manifest.json`, `robots.txt` `no-cache`; `/assets/` (tên có hash) và `/skills/` (có `?v=`) 1 năm `immutable`; asset tĩnh khác 7 ngày.
- Chi tiết: [docs/DEPLOY.md](docs/DEPLOY.md) (kiến trúc, secret/variable, thiết lập, rollback, bảo mật) và [cloudflare/README.md](cloudflare/README.md) (Worker).
- Site thật chạy ở `https://portfolio.yamiannephilim.com/`, nên URL Open Graph/JSON-LD phải dùng domain `portfolio.`.

## Cloudflare Worker (`cloudflare/`)

Worker `yan-failover-redirect` (`redirect-worker.js`, route khai báo trong `wrangler.toml`) chuyển hướng theo **tình trạng server**:

- `yamiannephilim.com/*` và `www.yamiannephilim.com/*` → `302` (`no-store`) tới `https://portfolio.yamiannephilim.com`; chỉ khi probe `GET /healthz` lỗi kết nối, quá 3 giây hoặc trả `502`/`503`/`504`/`520–526`/`530` thì chuyển sang `https://github.com/Tynab`. Kết quả probe được nhớ 30 giây trong mỗi isolate.
- `www.yamiannephilim.com/wedding-card` giữ nguyên: luôn → `https://tynab.github.io/Yami-Buzzy` (không probe).

## Ghi chú bảo trì

- `base: "./"` + `build.outDir: "build"` trong `vite.config.js` là phần thực sự điều khiển đường dẫn asset tương đối và thư mục output (Vite không đọc field `homepage` của CRA). `package.json` vẫn còn `"homepage": "."` như một field thừa từ thời CRA — không dựa vào nó, và nếu dọn thì phải kiểm tra cả hai chỗ nhất quán.
- Không còn dùng `overrides` trong `package.json`: các bản ghim cứng (vd. `js-yaml@4.2.0`, `postcss@8.5.15`) từng chặn chính các bản vá bảo mật mới hơn. Khi cần vá dependency gián tiếp, ưu tiên `npm update <pkg>`; nếu buộc phải dùng `overrides` thì ghi dạng range (`^x.y.z`) thay vì phiên bản cứng, và chạy `npm audit` sau mỗi lần cập nhật lockfile.
- `src/serviceWorker.js` (từ thời CRA, luôn ở trạng thái unregister) đã bị xóa hẳn khi migrate sang Vite — không thêm lại service worker vì sẽ phá vỡ chiến lược no-cache/deploy hiện tại.
