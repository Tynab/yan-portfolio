# YAN Portfolio

YAN Portfolio là trang portfolio cá nhân của **Nguyễn Đặng Trường An (Yami An)**, xây bằng React 18 + Vite. Toàn bộ nội dung tập trung trong `src/portfolio.js` và các file JSON snapshot dưới `src/shared/opensource/`; component chỉ nhận dữ liệu qua props và render lại — muốn đổi nội dung thì sửa data, không sửa component.

- Portfolio trực tuyến: https://yamiannephilim.com/
- Hồ sơ/CV: [Google Drive](https://drive.google.com/file/d/1HqRpwMKDX9vYGbZFWkyDungwJ_pgMFe_/view?usp=sharing)
- Liên hệ: [GitHub](https://github.com/Tynab) · [LinkedIn](https://www.linkedin.com/in/yamiannephilim/) · [Facebook](https://www.facebook.com/yami.an.nephilim/) · [X/Twitter](https://twitter.com/yamiannephilim) · [Gmail](mailto:yamiannephilim@gmail.com)

## Stack kỹ thuật

- **React 18** + `react-dom` 18 (`createRoot`), **react-router-dom 6** với `HashRouter` (route dạng `/#/...`).
- **Vite 7** (`@vitejs/plugin-react`) làm build tool/dev server, thay cho Create React App; một plugin nội bộ (`jsAsJsx` trong `vite.config.js`) cho phép JSX tồn tại trong file `.js` để không phải đổi tên hàng loạt.
- `styled-components` 6 cho theme (`ThemeProvider`, `GlobalStyles`); `GlobalStyles` còn xuất màu theme thành CSS variable (`--color-body`, `--color-text`, `--color-highlight`...) để hover/focus viết bằng CSS thuần. Accordion trang Experience dùng `<details>`/`<summary>` gốc (không còn `baseui`/`styletron`).
- `react-awesome-reveal` + `@emotion/react` cho animation cuộn trang (thay cho `react-reveal`, không còn tương thích React 18).
- `react-bootstrap` 2 cho tooltip/overlay; không nạp Bootstrap CSS, style tooltip tối thiểu nằm trong `src/tooltip.css`.
- `react-helmet-async` (`HelmetProvider`) cho meta tag SEO và JSON-LD Person.
- `chart.js` 4 + `react-chartjs-2` 5 cho biểu đồ đóng góp open-source.
- `Vitest` 5 (cần Node `^22.12` hoặc `>=24`, khai báo trong `engines`) + `@testing-library/react` + `jsdom` cho test; ESLint cấu hình độc lập (`.eslintrc.cjs`, không còn dùng preset `react-app`).
- Font Awesome 6 nạp từ CDN trong `index.html` (không bundle); icon/ảnh kỹ năng nằm trong `public/skills`.

Toàn bộ component đã chuyển thành **function component** (không còn class component).

## Kiến trúc source

```text
index.html                     # Entry HTML của Vite (nằm ở repo root, không phải public/)
vite.config.js                 # Cấu hình Vite: base "./", outDir "build", plugin jsAsJsx, Vitest
src/
  index.js                     # Entry point: HelmetProvider, createRoot(...).render
  App.js                       # Root app: ThemeProvider + GlobalStyles, truyền theme xuống Main
  global.js                    # GlobalStyles dùng chung (box-sizing, màu nền/chữ, CSS variable theo theme)
  tooltip.css                  # Style tooltip react-bootstrap (thay cho Bootstrap CSS)
  portfolio.js                 # Nguồn dữ liệu nội dung chính của portfolio
  theme.js                     # 14 bảng theme màu, chosenTheme chọn theme đang dùng
  containers/Main.js           # HashRouter + layout route, các trang nạp lazy (React.lazy) theo route
  components/                  # Header, card, chart, social, pageLayout... (đều là function component)
  components/pageLayout/       # Layout route: Header + <Outlet/> (Suspense) + TopButton, mount một lần
  containers/                  # Section tái sử dụng cho Home/Open Source (greeting, skills, charts...)
  pages/                       # Màn hình route-level (home, certifications, experience, projects, opensource, contact, splash, errors)
  shared/opensource/*.json     # Snapshot organizations, pull_requests, issues, projects
  assests/                     # images, fonts (tên cố ý sai chính tả, không đổi thành "assets")
```

Các file source tự viết mở đầu bằng comment tóm tắt tiếng Việt (`// Tóm tắt:` hoặc khối `/* ... */`); CSS tự viết cũng có header mô tả vai trò stylesheet.

## Luồng chạy chính

1. `src/index.js` bọc `HelmetProvider` rồi `createRoot(...).render(<App />)`.
2. `App` bọc `ThemeProvider` (styled-components) + `GlobalStyles`, truyền `chosenTheme` xuống `Main`.
3. `Main` (`containers/Main.js`) dùng `HashRouter` + `Routes` (react-router-dom 6); landing route chọn theo `settings.isSplash` (đang tắt — `"/"` render thẳng Home); còn lại là route cho Home, Certifications (`/education` cũ tự chuyển hướng sang `/certifications`), Experience, Projects, Open Source, Contact và `Error404` bắt mọi path không khớp. Mỗi trang là một chunk riêng (`React.lazy`).
4. Mọi trang (trừ Splash) nằm dưới layout route `PageLayout` (Header + `<Outlet/>` + `TopButton`), nên Header không remount khi chuyển trang; trang lấy dữ liệu từ `portfolio.js` hoặc snapshot trong `src/shared/opensource`.
5. `SeoHeader` set `<title>` và JSON-LD Person qua `react-helmet-async`; description/Open Graph để tĩnh trong `index.html` cho crawler không chạy JS.

## Cấu hình nội dung

- Thông tin cá nhân, social links, SEO, kỹ năng, chứng chỉ, kinh nghiệm, project header và contact nằm trong `src/portfolio.js`.
- Danh sách project trên trang Projects lấy từ `src/shared/opensource/projects.json`.
- Trang Open Source dùng `organizations.json`, `pull_requests.json`, `issues.json` để render logo tổ chức, chart và card đóng góp. Các file này là snapshot tĩnh, import lúc build — không gọi API lúc runtime.
- Theme hiện tại là `blueTheme` trong số 14 palette khai báo ở `src/theme.js`; đổi `chosenTheme` để reskin toàn bộ site.
- `settings.isSplash = false`: route `/` render thẳng Home. Đặt `true` để dùng màn splash làm landing.

## Skill icon (`SoftwareSkill.js`)

Mỗi skill trong `portfolio.js` chọn một trong hai chế độ hiển thị:

- `fontAwesomeClassname` → icon Iconify, nạp qua script CDN khai báo trong `index.html`.
- `imageSrc` → ảnh PNG runtime từ `public/skills/`, nạp theo đường dẫn `${import.meta.env.BASE_URL}skills/<tên-file>?v=${skillAssetVersion}` (dùng `import.meta.env.BASE_URL` của Vite, không còn `process.env.PUBLIC_URL` của CRA).

nginx cache `/skills/` dài hạn (`immutable`), nên **mỗi khi thêm/đổi PNG skill phải bump hằng số `skillAssetVersion`** trong `SoftwareSkill.js` để bust cache.

## Lệnh phát triển

```bash
npm install
npm run dev            # Vite dev server, mặc định cổng 3000
npm run lint           # ESLint trên src/**/*.js
npm test               # vitest run — chạy test một lần
npm run test:watch     # vitest ở chế độ watch
npm run build          # vite build -> thư mục build/
npm run preview        # Preview bản build production cục bộ
npm run deploy         # predeploy chạy build, sau đó gh-pages publish build/ lên branch gh-pages
```

Chỉ có `src/App.test.js` (smoke test render App), nên `npm test` xanh không đồng nghĩa với coverage đầy đủ.

Không còn `npm start` / `react-scripts` — dự án đã rời Create React App, dùng Vite làm build tool.

## Git LFS

Asset nhị phân (`svg`, `png`, `jpg`, `gif`, `woff`, `woff2`, `ttf`, `eot`, `ico`) được theo dõi bằng Git LFS theo khai báo trong `.gitattributes`. Sau khi clone repo, chạy:

```bash
git lfs install
git lfs pull
```

Build Docker chạy `scripts/verify-lfs-assets.js` và **fail** nếu còn asset nào là LFS pointer chưa resolve.

## CI, Docker và deploy

- `Dockerfile` build nhiều stage: stage `build` dùng `node:22-alpine`, cài dependency bằng `npm ci`, verify LFS rồi `npm run build`; stage runtime dùng `nginx:1.27-alpine` copy `build/` vào `/usr/share/nginx/html` và serve trên cổng `80` theo `nginx.conf` (SPA fallback `try_files ... /index.html`, bật gzip; `index.html` `no-cache`, `/assets/` (tên có hash) và `/skills/` (có `?v=`) cache 1 năm `immutable`, asset tĩnh khác cache 7 ngày).
- `Jenkinsfile`: build Docker image → push lên Docker Hub (`yamiannephilim/portfolio`) → dừng/xóa container cũ → chạy container mới trên network `yan`, kèm thông báo Telegram ở mỗi bước.
- Ngoài Docker, `npm run deploy` publish `build/` lên branch `gh-pages` để host qua GitHub Pages.

## Ghi chú bảo trì

- `base: "./"` + `build.outDir: "build"` trong `vite.config.js` là phần thực sự điều khiển đường dẫn asset tương đối và thư mục output (Vite không đọc field `homepage` của CRA). `package.json` vẫn còn `"homepage": "."` như một field thừa từ thời CRA — không dựa vào nó, và nếu dọn thì phải kiểm tra cả hai chỗ nhất quán.
- `overrides` trong `package.json` ghim version một số dependency transitive để vá lỗ hổng bảo mật — không gỡ khi không cần thiết.
- `src/serviceWorker.js` (từ thời CRA, luôn ở trạng thái unregister) đã bị xóa hẳn khi migrate sang Vite — không thêm lại service worker vì sẽ phá vỡ chiến lược no-cache/deploy hiện tại.
