# Cloudflare Worker: Redirect theo khung giờ

Tóm tắt: Hướng dẫn deploy Worker chuyển hướng `yamiannephilim.com` theo giờ Việt Nam lên Cloudflare dashboard.

## Hành vi

| Giờ VN              | `www.yamiannephilim.com/*` và `yamiannephilim.com/*` | `www.yamiannephilim.com/wedding-card`      |
| ------------------- | ---------------------------------------------------- | ------------------------------------------ |
| 08:30:00 – 23:29:59 | `302` → https://portfolio.yamiannephilim.com         | `302` → https://tynab.github.io/Yami-Buzzy |
| 23:30:00 – 08:29:59 | `302` → https://github.com/Tynab                     | `302` → https://tynab.github.io/Yami-Buzzy |

- Dùng **302** (không dùng 301 — browser cache 301 vĩnh viễn sẽ phá lịch theo giờ).
- Không truyền path/query sang đích (giống 2 Page Rules forwarding cũ).
- Muốn đổi giờ/URL: sửa các hằng số đầu file `redirect-worker.js` (`NIGHT_START_MINUTES`, `DAY_START_MINUTES`, `NIGHT_TARGET`, `DAY_TARGET`, `WEDDING_CARD_TARGET`) rồi Deploy lại.

## Deploy (Cloudflare dashboard)

1. **Tạo Worker**: Dashboard → `Workers & Pages` → `Create` → `Create Worker` → đặt tên `yan-schedule-redirect` → `Deploy` (bản hello-world mặc định).
2. **Dán code**: mở Worker vừa tạo → `Edit code` → xóa hết code mẫu, dán toàn bộ nội dung file `redirect-worker.js` → `Deploy`.
3. **Gắn route**: Worker → `Settings` → `Domains & Routes` → `Add` → `Route`, chọn zone `yamiannephilim.com`, thêm lần lượt 2 route:
   - `www.yamiannephilim.com/*`
   - `yamiannephilim.com/*`
4. **Kiểm tra (trong khung ngày 08:30–23:30)** — chạy trong PowerShell (`curl.exe`) hoặc Git Bash (`curl`, thay `findstr /i` bằng `grep -i`):

   ```powershell
   curl.exe -sI https://www.yamiannephilim.com | findstr /i "HTTP location"
   curl.exe -sI https://yamiannephilim.com | findstr /i "HTTP location"
   curl.exe -sI https://www.yamiannephilim.com/wedding-card | findstr /i "HTTP location"
   ```

   Kỳ vọng: status `302`; `location: https://portfolio.yamiannephilim.com/` cho 2 lệnh đầu (có `/` cuối — chuẩn hóa URL của Response.redirect), `location: https://tynab.github.io/Yami-Buzzy` cho lệnh cuối.

5. **Giả lập ban đêm (không cần đợi 23:30)**: trong `Edit code`, sửa tạm `NIGHT_START_MINUTES` thành số phút hiện tại theo giờ VN (ví dụ đang 14:00 → `14 * 60`) → `Deploy` → chạy lại lệnh curl đầu tiên, kỳ vọng `location: https://github.com/Tynab` → hoàn lại `23 * 60 + 30` → `Deploy`. Nếu sau khi Deploy mà response vẫn hiện portfolio, kiểm tra lại cả 2 route đã gắn vào Worker chưa (`Settings` → `Domains & Routes`) và xem log trực tiếp ở tab `Logs` của Worker trước khi thử lại.
6. **Tắt 3 Page Rules cũ**: Dashboard → zone `yamiannephilim.com` → `Rules` → `Page Rules` → gạt toggle **OFF** cả 3 rule (rule wedding-card + 2 rule forwarding). **Không xóa** — giữ lại để rollback. (Worker route vốn được ưu tiên chạy trước Page Rules, tắt đi cho sạch và tránh nhầm lẫn.)
7. **Verify lại** các lệnh ở bước 4 sau khi tắt rules.

## Rollback

1. Worker → `Settings` → `Domains & Routes` → xóa 2 route vừa gắn.
2. `Rules` → `Page Rules` → bật lại 3 rule. Xong — hành vi cũ khôi phục nguyên vẹn.

## Test cục bộ

`npm test` (Vitest) tự chạy cả `cloudflare/redirect-worker.test.js` — test các mốc biên 23:29/23:30/08:29/08:30 và phép đổi UTC → giờ VN.
