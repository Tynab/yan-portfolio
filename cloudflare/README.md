# Cloudflare Worker: Redirect theo tình trạng server

Tóm tắt: Worker `yan-schedule-redirect` chuyển hướng `yamiannephilim.com` về portfolio khi server còn sống, và chỉ chuyển sang GitHub khi không "ping" được server (không kết nối được / Bad Gateway 502 và các lỗi origin tương đương). Hướng dẫn cấu hình, deploy (dashboard hoặc wrangler/GitHub Actions), kiểm tra và rollback.

## Hành vi

| Request                                                       | Server portfolio sống                           | Server portfolio chết                                                                              |
| ------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `www.yamiannephilim.com/wedding-card`                         | `302` → https://tynab.github.io/Yami-Buzzy      | `302` → https://tynab.github.io/Yami-Buzzy (không probe)                                           |
| `www.yamiannephilim.com/*` và `yamiannephilim.com/*` (khác)   | `302` → https://portfolio.yamiannephilim.com    | `302` → https://github.com/Tynab                                                                   |
| `portfolio.yamiannephilim.com/*` (chỉ khi gắn route tùy chọn) | Trả nguyên response của origin (không redirect) | Điều hướng trang (GET): `302` → https://github.com/Tynab; asset/API: giữ nguyên status thật (502…) |

- Bỏ hẳn lịch chuyển theo giờ cũ (23:30–08:30): giờ chỉ chuyển sang GitHub khi server thật sự không trả lời được.
- Dùng **302** kèm `Cache-Control: no-store` để browser lẫn CDN không cache quyết định — server sống lại là chuyển về portfolio ngay (không dùng 301 vì browser cache vĩnh viễn).
- Không truyền path/query sang đích (giống 2 Page Rules forwarding cũ).
- Header `Location` là đúng chuỗi hằng số (vd. `https://portfolio.yamiannephilim.com`, không còn `/` ở cuối như bản cũ dùng `Response.redirect`) — browser xử lý như nhau.
- Lỗi lập trình bất ngờ trong Worker: vẫn `302` về portfolio (thà hiện portfolio còn hơn trang lỗi 1101 của Cloudflare). Riêng host portfolio thì trả request cho origin, không redirect về chính nó.

## Cấu hình

Chỉ sửa khối `// ===== Cấu hình (chỉ sửa ở đây) =====` đầu file `redirect-worker.js` rồi deploy lại:

| Hằng số                | Giá trị                                        | Ý nghĩa                                                     |
| ---------------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| `PORTFOLIO_TARGET`     | `https://portfolio.yamiannephilim.com`         | Đích khi server sống                                        |
| `FALLBACK_TARGET`      | `https://github.com/Tynab`                     | Đích khi server chết                                        |
| `WEDDING_CARD_TARGET`  | `https://tynab.github.io/Yami-Buzzy`           | Đích cố định của `www.yamiannephilim.com/wedding-card`      |
| `PORTFOLIO_HEALTH_URL` | `https://portfolio.yamiannephilim.com/healthz` | URL được probe                                              |
| `HEALTH_TIMEOUT_MS`    | `3000`                                         | Quá 3 giây không phản hồi ⇒ chết                            |
| `HEALTH_CACHE_MS`      | `30000`                                        | Nhớ kết quả probe 30 giây trong mỗi isolate                 |
| `ORIGIN_DOWN_STATUSES` | `502, 503, 504, 520–526, 530`                  | Status bị coi là "không tới được server" (xem mục bên dưới) |
| `STATUS_CODE`          | `302`                                          | Mã redirect                                                 |

`/healthz` là endpoint nginx trả `200 ok` (no-store). Kể cả khi bản nginx có `/healthz` chưa lên server, SPA fallback (`try_files ... /index.html`) vẫn trả `200` cho đường dẫn này nên probe vẫn đúng.

## Vì sao probe HTTP thay vì ping

- Cloudflare Workers **không gửi được ICMP ping** — Worker chỉ có `fetch()` (HTTP/HTTPS) và socket TCP, không có ICMP/raw socket. "Ping" ở đây là một request `GET /healthz` nhẹ.
- Probe HTTP còn chính xác hơn ping: nó đi đúng đường của khách truy cập (Cloudflare → reverse proxy/tunnel → container nginx). Khi chạy `docker stop portfolio`, máy chủ vẫn ping được nhưng khách nhận **502 Bad Gateway** — probe HTTP bắt được đúng trường hợp đó.
- Probe dùng `redirect: "manual"` nên `3xx` vẫn tính là sống (server có trả lời), và **không** dùng option `cache` của `fetch` (chỉ có ở một số compatibility date) hay các option cache trong `cf`. `/healthz` không có đuôi file tĩnh nên mặc định Cloudflare không cache, nginx cũng trả `no-store`.

## Status nào bị coi là "chết"

| Kết quả probe                                    | Nguồn gốc thường gặp                                                                    | Quyết định       |
| ------------------------------------------------ | --------------------------------------------------------------------------------------- | ---------------- |
| Lỗi mạng/DNS, hoặc quá `HEALTH_TIMEOUT_MS` (3 s) | Không kết nối được tới server                                                           | Chết → GitHub    |
| `502` Bad Gateway                                | Reverse proxy/Cloudflare không tới được container (vd. `docker stop portfolio`)         | Chết → GitHub    |
| `503`, `504`                                     | Proxy báo dịch vụ không sẵn sàng / hết thời gian chờ upstream                           | Chết → GitHub    |
| `520`–`526`                                      | Mã lỗi origin của Cloudflare (từ chối kết nối, timeout, origin không tới được, lỗi SSL) | Chết → GitHub    |
| `530`                                            | Cloudflare không phân giải/kết nối được origin (vd. tunnel/DNS lỗi)                     | Chết → GitHub    |
| `2xx`, `3xx`, `4xx`, `500` và status khác        | Server vẫn trả lời                                                                      | Sống → portfolio |

Cloudflare không chỉ báo `502` khi mất origin mà còn dùng nhóm `52x`/`530`, nên danh sách trên rộng hơn một mình `502`. `500` không nằm trong danh sách vì nghĩa là server **có** trả lời (chỉ là lỗi ứng dụng) — đúng yêu cầu "chỉ chuyển khi không ping được server".

## Memo, timeout và độ trễ chuyển đổi

- Mỗi isolate của Worker nhớ kết quả probe **30 giây** (`HEALTH_CACHE_MS`), kể cả kết quả "chết". Vì vậy sau khi server chết hoặc sống lại, có thể mất tới ~30 giây (mỗi data center/isolate tự probe riêng) thì mọi request mới chuyển theo.
- Các request đến cùng lúc trong một isolate dùng chung **một** probe. Nếu probe dùng chung bị treo quá `2 × HEALTH_TIMEOUT_MS` (vd. request khởi tạo nó bị hủy giữa chừng), request đang chờ sẽ tự probe lại thay vì treo theo.
- Khi probe hết hạn, khách đầu tiên phải chờ probe (thường vài chục ms; tệ nhất 3 giây khi server không phản hồi) rồi mới được redirect.
- Lưu lượng probe rất nhỏ: tối đa khoảng 1 request/30 giây cho mỗi isolate đang hoạt động.
- Mỗi lần Jenkins deploy (dừng → xóa → chạy lại container `portfolio`) sẽ có vài giây server trả 502; nếu đúng lúc đó có probe thì khách vào apex/www sẽ được chuyển sang GitHub tối đa ~30 giây — đây là hệ quả bình thường của cơ chế failover.
- Mỗi lần probe, Worker ghi một dòng log `health probe: <status hoặc lỗi> => up|down`; ở chế độ pass-through ghi `pass-through: <status hoặc lỗi> => down` khi origin chết. Xem ở tab `Logs` của Worker (bật Workers Logs).

## Route tùy chọn: pass-through cho `portfolio.yamiannephilim.com/*`

Mặc định Worker **không** gắn vào `portfolio.yamiannephilim.com`, nên ai vào thẳng portfolio khi server chết vẫn thấy trang lỗi 502 của Cloudflare. Nếu muốn cả trường hợp này cũng chuyển sang GitHub, có thể gắn thêm route `portfolio.yamiannephilim.com/*` vào **cùng Worker**:

- Worker chuyển tiếp mọi request tới origin bằng `fetch(request)` và trả nguyên response (status/header/body).
- Chỉ khi origin chết (lỗi kết nối hoặc status trong `ORIGIN_DOWN_STATUSES`) **và** request là điều hướng trang (`GET` có `Sec-Fetch-Mode: navigate` hoặc `Accept` chứa `text/html`) thì trả `302` (no-store) → GitHub. Asset (ảnh/JS/CSS) giữ nguyên status thật; nếu không kết nối được origin thì asset nhận `502` no-store.
- Kết quả quan sát được cập nhật luôn vào memo, nên apex/www cũng chuyển theo ngay.
- Đánh đổi: **mọi** request tới portfolio (kể cả asset) đều chạy qua Worker — tốn quota Workers (gói Free giới hạn số request/ngày) và thêm một chặng xử lý.

Cách bật:

- Dùng cách A (dashboard): Worker → `Settings` → `Domains & Routes` → `Add` → `Route` → `portfolio.yamiannephilim.com/*` (zone `yamiannephilim.com`).
- Dùng cách B (wrangler/GitHub Actions): bỏ comment dòng route portfolio trong `cloudflare/wrangler.toml` rồi deploy. Lưu ý: với API token giới hạn theo zone (token CI), `wrangler deploy` chỉ **thêm** route còn thiếu chứ không gỡ route; chỉ khi đăng nhập bằng `npx wrangler@4 login` (quyền mọi zone) thì danh sách route mới bị thay toàn bộ theo file. Vì vậy giữ `wrangler.toml` và route trên dashboard luôn khớp nhau.

Ngay sau khi bật, **bắt buộc** kiểm tra (vì Worker gọi `fetch(request)` tới chính host đang gắn route, cần xác nhận request đó tới origin bình thường):

```bash
# Trang chủ portfolio: kỳ vọng 200 và nội dung HTML bình thường (không phải 302, không lặp redirect)
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Accept: text/html" https://portfolio.yamiannephilim.com/
# Asset: kỳ vọng 200
curl -s -o /dev/null -w "%{http_code}\n" https://portfolio.yamiannephilim.com/manifest.json
```

Đồng thời mở tab `Logs` của Worker để thấy các request `portfolio.yamiannephilim.com` đi qua Worker với status `200`. Nếu thấy trang lỗi của Cloudflare, redirect lặp hoặc status bất thường → gỡ route portfolio ngay, **cả hai bước**: (1) xóa route `portfolio.yamiannephilim.com/*` trên dashboard (Worker → `Settings` → `Domains & Routes`) — bước này mới thực sự tắt route; (2) comment lại dòng đó trong `cloudflare/wrangler.toml` và commit, nếu không lần deploy CI sau sẽ gắn route trở lại (token CI chỉ thêm route, không gỡ). Sau đó có thể giả lập sự cố như mục **Kiểm tra** (kỳ vọng trang chủ portfolio `302` → GitHub, asset giữ `502`).

## Deploy

Worker trên Cloudflare tên **`yan-schedule-redirect`** (giữ tên cũ). Chọn một trong hai cách; sau khi đã dùng cách B thì không sửa code trực tiếp trên dashboard nữa (lần deploy sau sẽ ghi đè).

### Cách A — Cloudflare dashboard (dán code)

1. **Mở Worker**: Dashboard → `Workers & Pages` → `yan-schedule-redirect`. Nếu chưa có: `Create` → `Create Worker` → đặt tên `yan-schedule-redirect` → `Deploy` (bản hello-world mặc định).
2. **Dán code**: `Edit code` → xóa hết code cũ, dán toàn bộ nội dung file `redirect-worker.js` → `Deploy`.
3. **Kiểm tra route**: Worker → `Settings` → `Domains & Routes` — phải có đủ 2 route trên zone `yamiannephilim.com` (thiếu thì `Add` → `Route`):

   - `www.yamiannephilim.com/*`
   - `yamiannephilim.com/*`

   Route `portfolio.yamiannephilim.com/*` là **tùy chọn** — xem mục trên trước khi gắn.

4. **Bật log** (khuyên dùng): Worker → `Settings` → `Observability` → bật Workers Logs để xem dòng `health probe: ...`.
5. **Kiểm tra** theo mục **Kiểm tra** bên dưới.
6. **Page Rules cũ**: nếu chưa làm từ trước, Dashboard → zone `yamiannephilim.com` → `Rules` → `Page Rules` → gạt **OFF** cả 3 rule (rule wedding-card + 2 rule forwarding). **Không xóa** — giữ lại để rollback.

### Cách B — wrangler / GitHub Actions

- `cloudflare/wrangler.toml` khai báo: `name = "yan-schedule-redirect"` (trùng tên ⇒ deploy cập nhật đúng Worker đang chạy), `main = "redirect-worker.js"`, `compatibility_date` cố định, `workers_dev = false`, 2 route `yamiannephilim.com/*` + `www.yamiannephilim.com/*` (zone `yamiannephilim.com`), route portfolio để comment (tùy chọn), và bật `[observability]`.
- Workflow GitHub Actions `.github/workflows/deploy-worker.yml` chạy `wrangler deploy` với file cấu hình này. Cần khai báo trong repo GitHub (`Settings` → `Secrets and variables` → `Actions`):
  - Secret `CLOUDFLARE_API_TOKEN`: tạo ở Cloudflare → `My Profile` → `API Tokens` → `Create Token` → template **Edit Cloudflare Workers** (không thấy template thì **Create Custom Token** với quyền Account: _Workers Scripts_ Edit, _Account Settings_ Read, _Workers Tail_ Read (tuỳ chọn); Zone: _Workers Routes_ Edit; User: _User Details_ Read, _Memberships_ Read), giới hạn `Account Resources` = tài khoản của bạn và `Zone Resources` = zone `yamiannephilim.com`.
  - Secret `CLOUDFLARE_ACCOUNT_ID`: Account ID (thường hiện ở cột bên phải trang Overview của zone `yamiannephilim.com` hoặc trang `Workers & Pages`).
  - Variable `WORKER_DEPLOY_ENABLED` = `true` để bật bước deploy Worker trong workflow.
  - Trigger và chi tiết workflow: xem `docs/DEPLOY.md`.
- Deploy tay từ máy (không cần GitHub Actions):

  ```bash
  npx wrangler@4 login
  # Kiểm tra cấu hình + bundle, không upload (cloudflare/dist đã nằm trong .gitignore):
  npx wrangler@4 deploy --dry-run --config cloudflare/wrangler.toml --outdir cloudflare/dist
  # Deploy thật:
  npx wrangler@4 deploy --config cloudflare/wrangler.toml
  ```

- Lần deploy đầu bằng wrangler sẽ ghi đè bản đang dán trên dashboard (wrangler có thể cảnh báo Worker từng được sửa trên dashboard) — bình thường. Thư mục tạm `.wrangler/` mà wrangler sinh ra không cần commit.

## Kiểm tra

Chạy trong PowerShell (`curl.exe`, lọc bằng `findstr /i`) hoặc Git Bash/Linux (`curl`, thay `findstr /i` bằng `grep -i`).

1. **Bình thường (server sống)**:

   ```powershell
   curl.exe -sI https://www.yamiannephilim.com | findstr /i "HTTP location cache-control"
   curl.exe -sI https://yamiannephilim.com | findstr /i "HTTP location cache-control"
   curl.exe -sI https://www.yamiannephilim.com/wedding-card | findstr /i "HTTP location"
   curl.exe -s https://portfolio.yamiannephilim.com/healthz
   ```

   Kỳ vọng: 2 lệnh đầu `302`, `location: https://portfolio.yamiannephilim.com`, `cache-control: no-store`; lệnh 3 `location: https://tynab.github.io/Yami-Buzzy`; lệnh cuối in `ok` (hoặc HTML của trang chủ nếu bản nginx có `/healthz` chưa deploy — vẫn là 200).

2. **Giả lập sự cố** (SSH vào server chạy Docker):

   ```bash
   docker stop portfolio
   # Đợi hơn 30 giây cho memo hết hạn, rồi chạy (trên máy bất kỳ):
   curl -sI https://portfolio.yamiannephilim.com/healthz | grep -i "^HTTP"   # kỳ vọng 502 (hoặc 52x/530)
   curl -sI https://yamiannephilim.com | grep -i -E "^HTTP|^location"          # kỳ vọng location: https://github.com/Tynab
   curl -sI https://www.yamiannephilim.com/wedding-card | grep -i "^location"  # vẫn Yami-Buzzy
   docker start portfolio
   # Đợi hơn 30 giây rồi chạy lại lệnh apex: kỳ vọng location quay về https://portfolio.yamiannephilim.com
   ```

   Tab `Logs` của Worker sẽ hiện `health probe: 502 => down` rồi `health probe: 200 => up`. Request có thể rơi vào isolate/data center khác nhau nên kết quả có thể lệch nhau tối đa ~30 giây — chạy lại curl vài lần nếu cần. Nếu sau khi deploy mà response vẫn như cũ, kiểm tra lại route (`Settings` → `Domains & Routes`) và log trước khi thử lại.

## Rollback

1. **Về phiên bản Worker trước**: Worker → tab `Deployments` → chọn phiên bản trước → `Rollback` (hoặc `npx wrangler@4 rollback --config cloudflare/wrangler.toml`). Nếu đang deploy bằng GitHub Actions, revert commit tương ứng trong git nữa — nếu không lần deploy sau sẽ đưa code mới quay lại.
2. **Gỡ hẳn Worker như trước khi có nó**: Worker → `Settings` → `Domains & Routes` → xóa các route; `Rules` → `Page Rules` → bật lại 3 rule cũ. Hành vi Page Rules cũ khôi phục nguyên vẹn.

## Test cục bộ

`npm test` (Vitest) tự chạy cả `cloudflare/redirect-worker.test.js`; chỉ chạy riêng Worker: `npx vitest run cloudflare`. Test mock `fetch` toàn cục và kiểm tra: wedding-card không probe; probe `200`/`3xx`/`404`/`500` → portfolio; `502`/`503`/`504`/`520`–`526`/`530`, lỗi mạng và timeout 3 giây → GitHub; header `Location` + `Cache-Control: no-store`; memo 30 giây; gộp probe đồng thời; probe bị treo; chế độ pass-through của host portfolio; lỗi bất ngờ → portfolio.
