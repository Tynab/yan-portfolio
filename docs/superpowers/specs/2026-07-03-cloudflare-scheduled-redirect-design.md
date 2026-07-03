# Thiết kế: Redirect theo khung giờ bằng Cloudflare Worker

- **Ngày:** 2026-07-03
- **Phạm vi:** hạ tầng Cloudflare cho domain `yamiannephilim.com` (không đụng code app trong `src/`).
- **Trạng thái:** Thiết kế đã được duyệt; chờ review spec trước khi lập kế hoạch thực thi.

## 1. Mục tiêu

Hàng ngày, tự động chuyển hướng 2 domain theo giờ Việt Nam:

- **23:30 → 08:30** (đêm): `www.yamiannephilim.com/*` và `yamiannephilim.com/*` → `https://github.com/Tynab`
- **08:30 → 23:30** (ngày): trỏ về lại `https://portfolio.yamiannephilim.com` (như 2 Page Rules hiện tại)

Riêng `www.yamiannephilim.com/wedding-card` giữ nguyên hành vi hiện tại: luôn (24/7) → `https://tynab.github.io/Yami-Buzzy`.

## 2. Quyết định đã chốt (brainstorm)

| Chủ đề               | Lựa chọn                                                                        |
| -------------------- | ------------------------------------------------------------------------------- |
| Lịch                 | **Lặp hàng ngày**, vĩnh viễn                                                    |
| Giải pháp            | **Cloudflare Worker** tính giờ VN tại mỗi request (không cron, không API token) |
| Rule #1 wedding-card | **Tái hiện trong Worker** (www + `/wedding-card` → Yami-Buzzy, 24/7)            |
| Vị trí code / deploy | **Lưu vào repo** (`cloudflare/`) + người dùng tự dán vào dashboard theo README  |
| Status code          | **302** (bắt buộc — 301 bị browser cache vĩnh viễn, phá lịch theo giờ)          |
| Nhánh làm việc       | `develop` (chỉ thêm file hạ tầng + docs, không đụng app)                        |

## 3. Bảng hành vi

| Giờ VN              | Mọi path trên 2 domain                         | Riêng `www…/wedding-card`                    |
| ------------------- | ---------------------------------------------- | -------------------------------------------- |
| 08:30:00 – 23:29:59 | `302` → `https://portfolio.yamiannephilim.com` | `302` → `https://tynab.github.io/Yami-Buzzy` |
| 23:30:00 – 08:29:59 | `302` → `https://github.com/Tynab`             | `302` → `https://tynab.github.io/Yami-Buzzy` |

Chi tiết logic:

- Tính giờ VN bằng `Intl.DateTimeFormat` với `timeZone: "Asia/Ho_Chi_Minh"` (VN không có DST → ổn định), quy về **phút-trong-ngày**: `phut = gio*60 + phut`.
- Đêm ⇔ `phut >= 1410` (23:30) **hoặc** `phut < 510` (08:30). Biên: đúng 23:30:00 đã là đêm; đúng 08:30:00 đã là ngày.
- **Không truyền path/query** sang URL đích (giống Page Rules hiện tại, vốn không dùng `$1`): mọi path đều về đúng URL đích cố định.
- wedding-card chỉ đặc cách trên host `www.yamiannephilim.com` (trên apex, `/wedding-card` xưa nay vẫn theo rule forwarding thường — giữ nguyên).

## 4. Kiến trúc & thành phần

- **1 Worker** (tên gợi ý: `yan-schedule-redirect`), gắn **2 route**: `www.yamiannephilim.com/*` và `yamiannephilim.com/*` (zone `yamiannephilim.com`; DNS records đã proxy màu cam sẵn vì Page Rules đang hoạt động).
- Worker route có ưu tiên cao hơn Page Rules → sau khi Worker chạy ổn, **disable cả 3 Page Rules** (rule wedding-card + 2 rule forwarding) cho sạch; không xóa để rollback dễ.
- File trong repo:
  - `cloudflare/redirect-worker.js` — code Worker (ES module, `export default { fetch }`), mở đầu bằng `// Tóm tắt:` + comment tiếng Việt theo convention repo. Các hằng số cấu hình (giờ chuyển, 3 URL đích, status code) đặt ở đầu file.
  - `cloudflare/README.md` — hướng dẫn tiếng Việt từng bước: tạo Worker → dán code → Deploy → gắn 2 route → test bằng `curl -I` → tắt 3 Page Rules → verify lại → cách rollback.

## 5. Kiểm thử & rollback

- **Test ngày** (ngay sau deploy): `curl -I https://www.yamiannephilim.com` và `https://yamiannephilim.com` → `Location: https://portfolio.yamiannephilim.com`; `curl -I https://www.yamiannephilim.com/wedding-card` → `Location: https://tynab.github.io/Yami-Buzzy`; status đều `302`.
- **Test đêm không cần đợi 23:30**: sửa tạm hằng số giờ trong dashboard (ví dụ đặt giờ-bắt-đầu-đêm = phút hiện tại) → verify `Location: https://github.com/Tynab` → hoàn lại giá trị thật.
- **Rollback**: gỡ 2 route khỏi Worker + bật lại 3 Page Rules. Không có thay đổi phá hủy nào.

## 6. Ngoài phạm vi (Non-goals)

- Không deploy tự động (wrangler/API) — người dùng thao tác dashboard theo README (Claude không có quyền truy cập Cloudflare).
- Không đổi DNS, không đổi trạng thái proxy, không xóa Page Rules (chỉ disable).
- Không truyền path/query sang đích (giữ đúng hành vi cũ).
- Không đụng code app, không đụng pipeline Jenkins/Docker.

## 7. Định nghĩa hoàn thành (Done)

- 2 file `cloudflare/redirect-worker.js` + `cloudflare/README.md` được commit lên `develop`; code có Tóm tắt/comment tiếng Việt; README đủ để tự thao tác không cần hỏi thêm.
- Logic giờ được kiểm chứng bằng test cục bộ (chạy hàm tính phút-trong-ngày với các mốc biên 23:29/23:30/08:29/08:30 bằng Node).
- Sau khi người dùng deploy theo README: 3 lệnh `curl -I` ở mục 5 trả đúng `302` + `Location` kỳ vọng (ban ngày), và test-đêm-giả-lập trả GitHub.
