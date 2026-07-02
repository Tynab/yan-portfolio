# YAN Portfolio

YAN Portfolio là trang portfolio cá nhân của **Nguyễn Đặng Trường An (Yami An)**, xây bằng React 18 + Vite. Toàn bộ nội dung tập trung trong `src/portfolio.js` và các file JSON snapshot dưới `src/shared/opensource/`; component chỉ nhận dữ liệu qua props và render lại — muốn đổi nội dung thì sửa data, không sửa component.

- Portfolio trực tuyến: https://yamiannephilim.com/
- Hồ sơ/CV: [Google Drive](https://drive.google.com/file/d/1HqRpwMKDX9vYGbZFWkyDungwJ_pgMFe_/view?usp=sharing)
- Liên hệ: [GitHub](https://github.com/Tynab) · [LinkedIn](https://www.linkedin.com/in/yamiannephilim/) · [Facebook](https://www.facebook.com/yami.an.nephilim/) · [X/Twitter](https://twitter.com/yamiannephilim) · [Gmail](mailto:yamiannephilim@gmail.com)

## Stack kỹ thuật

- **React 18** + `react-dom` 18 (`createRoot`), **react-router-dom 6** với `HashRouter` (route dạng `/#/...`).
- **Vite 5** (`@vitejs/plugin-react`) làm build tool/dev server, thay cho Create React App; một plugin nội bộ (`jsAsJsx` trong `vite.config.js`) cho phép JSX tồn tại trong file `.js` để không phải đổi tên hàng loạt.
- `styled-components` 6 cho theme (`ThemeProvider`, `GlobalStyles`); `styletron-react` + `styletron-engine-atomic` + `baseui` cho riêng accordion ở trang Experience.
- `react-awesome-reveal` + `@emotion/react` cho animation cuộn trang (thay cho `react-reveal`, không còn tương thích React 18).
- `react-bootstrap` 2 + `bootstrap` 5 cho tooltip/overlay.
- `react-helmet-async` (`HelmetProvider`) cho meta tag SEO và JSON-LD Person.
- `chart.js` 4 + `react-chartjs-2` 5 cho biểu đồ đóng góp open-source.
- `Vitest` + `@testing-library/react` + `jsdom` cho test; ESLint cấu hình độc lập (`.eslintrc.cjs`, không còn dùng preset `react-app`).
- Font Awesome vendor sẵn trong `src/assests/font-awesome`; icon/ảnh kỹ năng nằm trong `public/skills`.

Toàn bộ component đã chuyển thành **function component** (không còn class component).

## Kiến trúc source

```text
index.html                     # Entry HTML của Vite (nằm ở repo root, không phải public/)
vite.config.js                 # Cấu hình Vite: base "./", outDir "build", plugin jsAsJsx, Vitest
src/
  index.js                     # Entry point: Styletron + BaseUI + HelmetProvider, createRoot(...).render
  App.js                       # Root app: ThemeProvider + GlobalStyles, truyền theme xuống Main
  global.js                    # GlobalStyles dùng chung (box-sizing, màu nền/chữ theo theme)
  portfolio.js                 # Nguồn dữ liệu nội dung chính của portfolio
  theme.js                     # 14 bảng theme màu, chosenTheme chọn theme đang dùng
  containers/Main.js           # HashRouter + khai báo route, chọn landing theo settings.isSplash
  components/                  # Header, card, chart, social, footer, pageLayout... (đều là function component)
  components/pageLayout/       # PageLayout dùng chung cho các trang route (Header + nội dung + TopButton)
  containers/                  # Section tái sử dụng cho Home/Open Source (greeting, skills, charts...)
  pages/                       # Màn hình route-level (home, education, experience, projects, opensource, contact, splash, errors)
  shared/opensource/*.json     # Snapshot organizations, pull_requests, issues, projects
  assests/                     # images, fonts, font-awesome vendor (tên cố ý sai chính tả, không đổi thành "assets")
```

`src/assests/font-awesome` là vendor/minified asset, bị loại khỏi ESLint (`ignorePatterns` trong `.eslintrc.cjs`) — không chỉnh tay hay thêm comment nội bộ. Các file source tự viết mở đầu bằng comment tóm tắt tiếng Việt (`// Tóm tắt:` hoặc khối `/* ... */`); CSS/SCSS tự viết cũng có header mô tả vai trò stylesheet.

## Luồng chạy chính

1. `src/index.js` tạo Styletron engine, bọc `StyletronProvider` → `BaseProvider` (BaseUI) → `HelmetProvider`, rồi `createRoot(...).render(<App />)`.
2. `App` bọc `ThemeProvider` (styled-components) + `GlobalStyles`, truyền `chosenTheme` xuống `Main`.
3. `Main` (`containers/Main.js`) dùng `HashRouter` + `Routes` (react-router-dom 6); landing route chọn theo `settings.isSplash` (đang tắt — `"/"` render thẳng Home); còn lại là route cho Home, Education, Experience, Projects, Open Source, Contact và `Error404` bắt mọi path không khớp.
4. Các trang dùng `PageLayout` (Header + nội dung + `TopButton`) và lấy dữ liệu từ `portfolio.js` hoặc snapshot trong `src/shared/opensource`.
5. `SeoHeader` sinh meta tag và JSON-LD Person qua `react-helmet-async`.

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

nginx phục vụ `/skills/` với header `no-cache`, nên **mỗi khi thêm/đổi PNG skill phải bump hằng số `skillAssetVersion`** trong `SoftwareSkill.js` để bust cache.

## Lệnh phát triển

```bash
npm install
npm run dev            # Vite dev server, mặc định cổng 3000
npm run lint           # ESLint trên src/**/*.js (loại trừ vendor font-awesome)
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

- `Dockerfile` build nhiều stage: stage `build` dùng `node:22-alpine`, cài dependency bằng `npm ci`, verify LFS rồi `npm run build`; stage runtime dùng `nginx:1.27-alpine` copy `build/` vào `/usr/share/nginx/html` và serve trên cổng `80` theo `nginx.conf` (SPA fallback `try_files ... /index.html`, `/skills/` set `no-cache`, các asset tĩnh khác cache 7 ngày).
- `Jenkinsfile`: build Docker image → push lên Docker Hub (`yamiannephilim/portfolio`) → dừng/xóa container cũ → chạy container mới trên network `yan`, kèm thông báo Telegram ở mỗi bước.
- Ngoài Docker, `npm run deploy` publish `build/` lên branch `gh-pages` để host qua GitHub Pages.

## Ghi chú bảo trì

- ESLint bỏ qua `src/assests/font-awesome` (vendor/minified bundle) — cấu hình trong `.eslintignore`/`ignorePatterns` của `.eslintrc.cjs`.
- `base: "./"` + `build.outDir: "build"` trong `vite.config.js` là phần thực sự điều khiển đường dẫn asset tương đối và thư mục output (Vite không đọc field `homepage` của CRA). `package.json` vẫn còn `"homepage": "."` như một field thừa từ thời CRA — không dựa vào nó, và nếu dọn thì phải kiểm tra cả hai chỗ nhất quán.
- `overrides` trong `package.json` ghim version một số dependency transitive để vá lỗ hổng bảo mật — không gỡ khi không cần thiết.
- `src/serviceWorker.js` (từ thời CRA, luôn ở trạng thái unregister) đã bị xóa hẳn khi migrate sang Vite — không thêm lại service worker vì sẽ phá vỡ chiến lược no-cache/deploy hiện tại.
