# Deploy portfolio bằng Cloudflare Pages

Tóm tắt: Runbook hiện hành — site tĩnh React/Vite chạy trực tiếp tại apex `https://yamiannephilim.com/` trên Cloudflare Pages, deploy tự động khi merge vào `main`. Không còn Docker, nginx, Cloudflare Tunnel, self-hosted runner hay Worker failover. Tài liệu kiến trúc cũ được lưu ở [docs/legacy/DEPLOY-docker.md](legacy/DEPLOY-docker.md).

> **Không bao giờ dán token/mật khẩu vào chat** (kể cả khi nhờ AI hỗ trợ), issue, PR hay commit. Token chỉ nhập trực tiếp vào ô _Secret_ của GitHub hoặc dashboard Cloudflare.

## 1. Kiến trúc

```text
GitHub Tynab/yan-portfolio (main)
        │ merge / push
        ▼
Cloudflare Pages — Git integration
        │ build: node scripts/verify-lfs-assets.js && npm run build
        ▼
build/  (index.html, assets/, skills/, icons/, og-image.png, manifest.json, robots.txt)
        │
        ▼
https://yamiannephilim.com/   ← canonical, phục vụ trực tiếp từ Pages

www.yamiannephilim.com/*            --302→ https://yamiannephilim.com/*
www.yamiannephilim.com/wedding-card --302→ https://tynab.github.io/Yami-Buzzy
portfolio.yamiannephilim.com        ✗ không còn tồn tại (không DNS, không route, không redirect)
```

- Không có origin Docker/nginx, không có `/healthz`, không có Worker probe/failover.
- `portfolio.yamiannephilim.com` đã bị gỡ hoàn toàn theo yêu cầu chủ repo; bookmark cũ sẽ không còn hoạt động.
- Repo không còn `Dockerfile`, `nginx.conf`, `.dockerignore`, `cloudflare/`, `scripts/server/`, `deploy.yml` hay `deploy-worker.yml`.

## 2. Cấu hình Cloudflare Pages

Tạo project trong **cùng Cloudflare account** với zone `yamiannephilim.com`:

| Trường                 | Giá trị                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| Source                 | GitHub → `Tynab/yan-portfolio`                                                                      |
| Production branch      | `main`                                                                                              |
| Build command          | `node scripts/verify-lfs-assets.js && npm run build`                                                |
| Build output directory | `build` (không phải `dist`)                                                                         |
| Environment variable   | `HUSKY=0` (phòng thủ; husky 9 vốn thoát 0 khi không có `.git`)                                      |
| Node version           | Để mặc định 22.x của build image; **không** pin `NODE_VERSION` trừ khi default không thỏa `engines` |
| Functions              | Không tạo `functions/`                                                                              |
| Custom domain          | `yamiannephilim.com` (apex, không `www`, không `portfolio`)                                         |

Cloudflare Pages Free hiện có giới hạn build/số file/kích thước file; kiểm tra lại tại thời điểm triển khai. Repo hiện có 155 file trong `public/`, file lớn nhất ~223 KB, nằm dưới giới hạn 25 MiB/file.

**Bắt buộc trước khi nối Pages:** bật branch protection cho `main`, yêu cầu check CI `Lint, test & build` và chặn push trực tiếp. Pages Git integration không có biến gate kiểu `DEPLOY_ENABLED`; branch protection là hàng rào duy nhất để một merge đỏ không deploy thẳng production.

> **Lỗi Git installation `8000011`:** nếu tạo Pages project báo lỗi này, cài lại Cloudflare Pages GitHub App cho repo: GitHub → Settings → Applications → Cloudflare Pages → Configure → chọn `Tynab/yan-portfolio` → Save. Sau đó tạo lại project. Không tạo project direct-upload thay thế vì sẽ mất deploy tự động khi merge `main`.

## 3. Deploy thường ngày

1. Tạo nhánh từ `main`, sửa nội dung/code.
2. Chạy local:

   ```bash
   npm ci
   node scripts/verify-lfs-assets.js
   npm run lint
   npm test
   npm run build
   npm run preview
   ```

3. Mở PR; đợi CI xanh và branch protection cho phép merge.
4. Merge vào `main`. Cloudflare Pages tự build và deploy commit đó.
5. Kiểm tra **Workers & Pages → project → Deployments** báo `Success`, rồi mở `https://yamiannephilim.com/` để smoke test.

Không có workflow GitHub Actions nào deploy production ngoài Pages. `ci.yml` chỉ chạy lint/test/build.

## 4. Cutover apex (một lần, thủ công)

Thực hiện theo thứ tự, có snapshot rollback trước khi đụng DNS/route:

1. **Snapshot** (lưu private, không commit): record apex/`www`/`portfolio` (type, target, proxy, TTL); MX/TXT/SPF/DKIM/DMARC/CAA/NS/Email Routing; Worker `yan-failover-redirect` + toàn bộ Workers/cron/routes; Redirect/Page Rules; Tunnel ingress; container `yan-portfolio`; runner.
2. **Khóa deploy cũ:** đặt GitHub repository variables `DEPLOY_ENABLED=false` và `WORKER_DEPLOY_ENABLED=false`; xác nhận không có run đang chạy.
3. **Merge PR migration vào `main`** (branch protection + CI xanh). Pages build commit merge. **Chờ deployment production của đúng commit đó `Success`**, mở `pages.dev` production kiểm tra canonical/OG/favicon trước khi đụng domain.
4. **Attach custom domain** `yamiannephilim.com` trong Pages → Custom domains. Nếu Cloudflare yêu cầu thay record apex, chỉ thay record web; không đụng MX/TXT/NS.
5. Khi domain `Active` và certificate hợp lệ, **gỡ route `yamiannephilim.com/*`** khỏi Worker `yan-failover-redirect` (Worker → Settings → Domains & Routes).
6. Smoke test ngay:

   ```bash
   curl -sS -I https://yamiannephilim.com/
   curl -sS -I https://yamiannephilim.com/og-image.png
   curl -sS -I https://yamiannephilim.com/favicon.ico
   curl -sS -I https://yamiannephilim.com/manifest.json
   curl -sS -I https://yamiannephilim.com/robots.txt
   ```

   Kỳ vọng `200`, không có `Location` sang `portfolio`/GitHub, content-type đúng, `/favicon.ico` là file ICO thật.

7. Test browser các route `/#/home`, `/#/certifications`, `/#/experience`, `/#/projects`, `/#/contact`, reload, menu, animation; kiểm tra JSON-LD `Person.url` trong DOM (Helmet inject lúc runtime, curl không thấy).
8. Kiểm tra lại MX/SPF/DKIM/DMARC/Email Routing ngay sau attach. Nếu lỗi, rollback trước khi làm bước 5.

## 5. Redirect `www` và ngoại lệ wedding-card

Tạo **một Single Redirects ruleset**, thứ tự:

1. `www.yamiannephilim.com/wedding-card` → `https://tynab.github.io/Yami-Buzzy`, **302**, không giữ query.
2. `www.yamiannephilim.com/*` → `https://yamiannephilim.com` + path, **302**, giữ query.

Sau đó gỡ route `www.yamiannephilim.com/*` khỏi Worker. Không tạo redirect cho `portfolio` — hostname này bị xóa hoàn toàn.

Kiểm tra:

```bash
curl -sS -I https://www.yamiannephilim.com/
curl -sS -I "https://www.yamiannephilim.com/foo?q=1"
curl -sS -I "https://www.yamiannephilim.com/wedding-card?x=1"
curl -sS -I https://yamiannephilim.com/
```

Không được có redirect loop. `www` giữ path/query là thay đổi có chủ đích so với Worker cũ (Worker bỏ path/query).

## 6. Rollback

- **Pages build hỏng:** Workers & Pages → project → Deployments → chọn deployment ổn định trước → Rollback; hoặc revert commit trên `main` để Pages build lại bản trước.
- **Apex/certificate/DNS lỗi:** khôi phục đúng record apex/`www` từ snapshot; gỡ custom domain Pages nếu cần. Vì `portfolio` đã bị gỡ, không còn đường rollback về Docker; chỉ quay lại bản Pages ổn định hoặc git revert.
- **Sau khi đã xóa container/Tunnel ingress:** rollback chỉ còn bằng Pages deployment rollback/git; muốn dựng lại Docker phải khôi phục image + ingress + DNS từ snapshot.
- Không dùng 301 cho các host này; 302 tránh browser cache vĩnh viễn.

## 7. Dọn hạ tầng cũ

Repo đã ở trạng thái không còn Docker/Worker. Các thao tác **thủ công** còn lại sau cutover:

1. Cloudflare Dashboard: xóa Worker `yan-failover-redirect` (nếu còn), mọi cron trigger/route còn sót; xác nhận không còn route trên apex/`www`. Xóa luôn 3 Page Rule cũ (2 rule `301` về `portfolio.yamiannephilim.com` và rule wedding-card) — chúng đang `Disabled` nhưng nếu bật lại sẽ xung đột với Pages/Redirect Rules.
2. Xóa record DNS `portfolio` (nếu còn). Không đụng record của dịch vụ khác.
3. Trên server: xóa **chỉ** container `yan-portfolio` và image `yamiannephilim/portfolio`; xóa **chỉ** ingress `portfolio.yamiannephilim.com` khỏi Cloudflare Tunnel. Không dừng Docker daemon/Tunnel dùng chung.
4. Gỡ self-hosted runner và hook root `/usr/local/libexec/gha-runner-guard.sh` + dòng `ACTIONS_RUNNER_HOOK_JOB_STARTED` trong `/opt/actions-runner/.env` nếu không còn dùng.
5. Thu hồi secret không còn dùng: DockerHub token, Cloudflare Worker token/account ID, Telegram token, GitHub PAT bootstrap. Xóa hai biến `DEPLOY_ENABLED`, `WORKER_DEPLOY_ENABLED`.
6. Xác nhận email/DNS khác không bị ảnh hưởng.

## 8. Kiểm tra sau deploy

- `build/` có `index.html`, `assets/`, `skills/`, `icons/`, `favicon.ico`, `og-image.png`, `manifest.json`, `robots.txt`.
- `index.html` chỉ chứa canonical/OG apex; không còn `portfolio.yamiannephilim.com`.
- `public/og-image.png` hiển thị `yamiannephilim.com` (template `assets-src/og-image.html`).
- `src/seo.test.js` xanh; `npm test` chạy 6 file: App, theme, Main, Header, Tooltip, seo.
- Không có `_headers`, `_redirects`, `404.html` trong `public/` (Pages SPA fallback mặc định; thêm `404.html` sẽ phá fallback).
- Không có service worker.
- Icon skill vẫn dùng `?v=skillAssetVersion`; bump khi đổi ảnh.

## 9. Cache và asset

- Pages dùng cache mặc định của Cloudflare; không port các header `immutable` của nginx sang `_headers` khi chưa có nhu cầu đo được.
- Vẫn phải bump `skillAssetVersion` khi ghi đè ảnh skill cùng tên.
- Không đặt CSP nghiêm khi còn AdSense/gtag/Iconify inline.
- `_headers`/`_redirects` chỉ thêm khi có kiểm thử cụ thể; không thêm catch-all 200 rewrite.

## 10. AdSense/gtag

- `index.html` nạp AdSense `ca-pub-8856447829714090` và gtag `AW-825508380`.
- Sau cutover, xác nhận cả hai script tải được trên apex và ghi lại quyết định `ads.txt`. Chỉ thêm `public/ads.txt` nếu tài khoản AdSense báo thiếu.
