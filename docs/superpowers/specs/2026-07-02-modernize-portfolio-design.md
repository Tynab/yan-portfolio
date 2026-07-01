# Thiết kế: Hiện đại hóa & dọn dẹp YAN-Portfolio

- **Ngày:** 2026-07-02
- **Repo:** YAN-Portfolio (React SPA, hiện tại CRA + React 16)
- **Trạng thái:** Đã brainstorm & duyệt thiết kế; chờ review spec trước khi lập kế hoạch thực thi.

## 1. Mục tiêu

Hiện đại hóa toàn diện codebase mà **không thay đổi giao diện/hành vi người dùng**:

1. Xóa sạch dead code & asset không dùng (xóa mạnh tay).
2. Migrate build tool **CRA (react-scripts) → Vite**.
3. Nâng **major** toàn bộ dependency runtime (React 16→18, react-router v5→v6, chart.js v2→v4, react-bootstrap beta→v2, react-helmet→react-helmet-async, react-reveal→react-awesome-reveal, cân nhắc styled-components 5→6).
4. Refactor sâu: class component → function component + hooks, tách layout/logic dùng chung.
5. Bổ sung comment & summary **tiếng Việt** cho toàn bộ file non-autogen.
6. Viết lại **README.md (tiếng Việt)** đúng stack mới; đồng bộ lại CLAUDE.md.

## 2. Quyết định đã chốt (brainstorm)

| Chủ đề                      | Lựa chọn                            |
| --------------------------- | ----------------------------------- |
| Mức xóa dead code           | Xóa mạnh tay (verify-trước-khi-xóa) |
| Mức refactor                | Refactor sâu                        |
| Nâng dependency             | Nâng major toàn bộ                  |
| Animation thay react-reveal | **react-awesome-reveal**            |
| Build tool                  | **Migrate sang Vite**               |
| Verify                      | build + lint + test + chạy app      |
| Ngôn ngữ README & comment   | **Tiếng Việt**                      |

## 3. Ngoài phạm vi (Non-goals)

- Thay đổi nội dung portfolio (dữ liệu trong `portfolio.js`, ảnh đang dùng, text).
- Thay đổi thiết kế/giao diện (màu theme, layout) — mục tiêu là **giữ nguyên diện mạo**.
- Đổi tên thư mục `src/assests/` (giữ nguyên để tránh churn hàng loạt import; sai chính tả nhưng vô hại).
- Thêm test coverage mới ngoài việc giữ/di trú smoke test hiện có (có thể bổ sung nhẹ nếu rẻ, không bắt buộc).
- CI/CD Jenkins: chỉ cập nhật nếu Vite làm hỏng; không tái cấu trúc pipeline.

## 4. Nguyên tắc thực thi

- **6 phase tuần tự, mỗi phase = 1 commit độc lập, verify đầy đủ trước khi sang phase sau.** Dễ bisect & rollback vì repo gần như không có test.
- Làm việc trên nhánh feature riêng (`feature/modernize-portfolio`).
- Sau mỗi phase: `npm run build` pass, `npm run lint` sạch, `npm test` pass, chạy dev server rà 6 trang (Home/Education/Experience/Projects/Opensource/Contact) — diện mạo không đổi.

## 5. Phase 1 — Dọn dead code & asset

**Giao thức:** dựng reachability từ entry point (`index → App → Main → routed pages → import đệ quy`); file self-authored không reachable + không có tham chiếu động = xóa. Verify từng file (grep importer + `require`/string động) ngay trước khi xóa, rồi build lại.

**Ứng viên đã xác định (phải verify lại lúc thực thi):**

- Container chết: `containers/{projects, blogs, talks, podcast, StartupProjects, achievement, education, contact}`.
- Component chỉ phục vụ các container chết: rà `blogCard`, `talkCard`, `achievementCard`, `degreeCard`, `publicationsCard` (giữ nếu còn nơi dùng).
- Data không dùng: `src/shared/experience_data.json`, `src/shared/contact_data.json`.
- Asset: quét tham chiếu (`import`/`require`/CSS `url()`/`portfolio.js` `imageSrc`/`public/skills`) → xóa ảnh/PNG/SVG orphan trong `src/assests/images` và `public/` (giữ `public/icons`, favicon, manifest, robots).
- Dependency trong `package.json` không còn ai import (sẽ dọn kỹ hơn ở Phase 2/3).

**Verify:** build (vẫn CRA) + lint + test + chạy app.

## 6. Phase 2 — Migrate CRA → Vite (giữ nguyên version deps)

- Thêm `vite`, `@vitejs/plugin-react`. Cấu hình esbuild loader nhận **JSX trong file `.js`** để **không phải đổi tên ~66 file**.
- `public/index.html` → `index.html` ở root; bỏ `%PUBLIC_URL%`; thêm `<script type="module" src="/src/index.js">`.
- `vite.config.js`: `base: './'` (thay `homepage:"."`), `build.outDir: 'build'` (giữ nguyên đường dẫn cho Dockerfile & gh-pages).
- Env: `process.env.PUBLIC_URL` → `import.meta.env.BASE_URL` trong `SoftwareSkill.js`.
- **Xóa `src/serviceWorker.js`** (boilerplate CRA, vô nghĩa với Vite, vốn đã unregister) + gỡ import trong `index.js`.
- Test runner: `react-scripts test` → **Vitest** + `@testing-library/react` + `jsdom`; cập nhật `App.test.js`; thêm `setupTests`.
- Lint: bỏ preset CRA `react-app` → ESLint config độc lập (`eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` tùy chọn); giữ `--ignore-pattern` cho font-awesome.
- Gỡ `react-scripts`. `package.json` scripts: `dev` (vite), `build` (vite build), `preview`, `test` (vitest), `lint`. Cập nhật `predeploy`/`deploy` nếu cần (giữ `-d build`).
- `.gitignore`: đảm bảo ignore output (`build/`), thêm `.vite`/cache nếu cần.
- Dockerfile: kiểm tra build stage vẫn `npm run build` → `/app/build` (không đổi nginx). Điều chỉnh nếu Vite đổi output.

**Verify:** `npm run dev`, `npm run build`, `npm run preview`, lint, test + rà 6 trang.

## 7. Phase 3 — Nâng major dependencies + thay animation

**Ma trận nâng cấp (version đích tham khảo, chốt bản stable lúc thực thi):**

| Package           | Từ       | Đến                                           | Ghi chú breaking                                                            |
| ----------------- | -------- | --------------------------------------------- | --------------------------------------------------------------------------- |
| react / react-dom | 16.10    | 18.x                                          | `ReactDOM.render` → `createRoot`                                            |
| react-router-dom  | 5.1      | 6.x                                           | `Switch`→`Routes`, `component/render`→`element`, `useHistory`→`useNavigate` |
| chart.js          | 2.9      | 4.x                                           | đăng ký component, đổi cấu trúc options                                     |
| react-chartjs-2   | 2.9      | 5.x                                           | API mới theo chart.js 4                                                     |
| react-bootstrap   | 1.0-beta | 2.x                                           | API OverlayTrigger/Tooltip ổn định                                          |
| react-helmet      | 6.1      | react-helmet-async 2.x                        | thêm `HelmetProvider`                                                       |
| react-reveal      | 1.2      | react-awesome-reveal 4.x (+ `@emotion/react`) | đổi tên/props hiệu ứng ở ~26 file                                           |
| styled-components | 5.1      | 6.x                                           | transient props, thay đổi API nội bộ                                        |

- **Đánh giá gỡ `baseui`/`styletron-*`**: nếu chỉ là wrapper thừa ở `index.js` (app dùng styled-components để theme) → gỡ để giảm bề mặt nâng cấp; nếu có nơi dùng thật → nâng lên bản hỗ trợ React 18.
- Rà mọi `require("../../assests/...")` → đổi sang `import` (Vite/ESM).
- Đồng bộ peer deps cho React 18 (testing-library, react-bootstrap...).

**Verify:** build + lint + test + rà kỹ animation (awesome-reveal), tooltip (bootstrap 2), chart (chart.js 4), SEO head (helmet-async), routing (v6).

## 8. Phase 4 — Refactor sâu

- Chuyển **class → function component + hooks** cho toàn bộ page/container còn là class.
- Tách **`PageLayout`** gói pattern lặp `Header + nội dung + TopButton` ở mọi page.
- Gom cách truyền `theme` (cân nhắc `useTheme`/context của styled-components thay vì prop-drilling).
- Gộp/rút gọn các `*Img.js` trùng cấu trúc.
- Rút hardcode ra hằng số (vd `skillAssetVersion`, màu chart), gỡ import/biến thừa, đồng nhất style code.
- Cân nhắc truyền `theme` cho `PullRequestChart`/`IssueChart` (hiện hardcode màu) — chỉ nếu không đổi diện mạo.

**Verify:** build + lint + test + rà 6 trang (diện mạo không đổi).

## 9. Phase 5 — Comment & summary tiếng Việt

- Mỗi file non-autogen: summary `// Tóm tắt:` (hoặc `/* */`) ở đầu + comment inline cho logic **không hiển nhiên** (không chú thích máy móc từng dòng).
- CSS/SCSS tự viết: header mô tả vai trò stylesheet.
- **Miễn trừ (autogen/boilerplate):** `src/assests/font-awesome/**`; phần dữ liệu SVG path trong `*Img.js` (chỉ summary file, không chú thích path).

**Verify:** lint (comment không phá lint) + build.

## 10. Phase 6 — README + CLAUDE.md

- Viết lại `README.md` (tiếng Việt) đúng trạng thái sau cùng: stack mới (Vite, React 18, router v6, chart.js 4, awesome-reveal), cấu trúc thư mục thật (đã xóa dead code), cách build/dev/test/preview, deploy (Docker/nginx/Jenkins/gh-pages), Git LFS, `skillAssetVersion`, biến `import.meta.env.BASE_URL`.
- Đồng bộ lại `CLAUDE.md` cho khớp stack mới (lệnh, kiến trúc, gotcha, "không tự ý đổi").

**Verify:** đọc lại, đối chiếu lệnh thực chạy.

## 11. Rủi ro & giảm thiểu

- **Không có test** ⇒ dựa vào build + lint + chạy app sau mỗi phase; commit theo phase để rollback nhanh.
- **Breaking API** (styled-components 6, router 6, chart.js 4) ⇒ sửa tay theo checklist; test thủ công từng khu vực ảnh hưởng.
- **react-awesome-reveal khác API** ⇒ rà toàn bộ ~26 file dùng Fade/Slide, so sánh hiệu ứng trước/sau.
- **Vite xử lý asset khác CRA** ⇒ đổi `require()`→`import`, kiểm tra ảnh/font load đúng ở cả dev và `preview`.
- **Peer dependency lệch** ⇒ khóa version tương thích React 18; chạy `npm ls` kiểm tra.
- **Docker build cần Git LFS** ⇒ giữ `scripts/verify-lfs-assets.js`; đảm bảo asset LFS đã pull.
- **Đổi hạ tầng (homepage/PUBLIC_URL/serviceWorker)** ⇒ được cho phép qua quyết định migrate Vite; giữ `outDir: build` để không đụng nginx/gh-pages.

## 12. Định nghĩa hoàn thành (Done)

- App chạy trên Vite + React 18, `build`/`dev`/`preview`/`test`/`lint` đều pass.
- Không còn file/asset chết; `package.json` không còn dependency thừa.
- Không còn class component; có `PageLayout`; không còn boilerplate CRA.
- Mọi file non-autogen có summary + comment tiếng Việt.
- README.md (tiếng Việt) & CLAUDE.md khớp stack mới.
- 6 trang giữ nguyên diện mạo & hành vi so với bản gốc.
