// Tóm tắt: Cloudflare Worker chuyển hướng theo khung giờ VN — đêm (23:30–08:30) trỏ GitHub,
// ngày trỏ portfolio; riêng www/wedding-card luôn trỏ Yami-Buzzy 24/7.
// Deploy: dán toàn bộ file này vào Cloudflare dashboard theo cloudflare/README.md.

// ===== Cấu hình (chỉ sửa ở đây) =====
const NIGHT_START_MINUTES = 23 * 60 + 30; // 23:30 giờ VN — bắt đầu khung đêm
const DAY_START_MINUTES = 8 * 60 + 30; // 08:30 giờ VN — bắt đầu khung ngày
const NIGHT_TARGET = "https://github.com/Tynab";
const DAY_TARGET = "https://portfolio.yamiannephilim.com";
const WEDDING_CARD_TARGET = "https://tynab.github.io/Yami-Buzzy";
// 302 bắt buộc: 301 bị browser cache vĩnh viễn nên sẽ phá lịch chuyển theo giờ.
const STATUS_CODE = 302;

// Quy thời điểm hiện tại về phút-trong-ngày (0–1439) theo múi giờ VN (không có DST).
function minutesOfDayInVietnam(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  // Một số runtime trả "24" cho nửa đêm khi hour12: false — quy về 0 bằng % 24.
  return (Number(map.hour) % 24) * 60 + Number(map.minute);
}

// Đêm ⇔ phút >= 23:30 hoặc < 08:30 (khung giờ vắt qua nửa đêm nên dùng OR).
function isNightInVietnam(minutes) {
  return minutes >= NIGHT_START_MINUTES || minutes < DAY_START_MINUTES;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Giữ nguyên hành vi Page Rule #1 cũ: chỉ trên www, mọi khung giờ.
    if (
      url.hostname === "www.yamiannephilim.com" &&
      url.pathname === "/wedding-card"
    ) {
      return Response.redirect(WEDDING_CARD_TARGET, STATUS_CODE);
    }

    // Không truyền path/query sang đích — giống hệt 2 Page Rules forwarding cũ.
    const target = isNightInVietnam(minutesOfDayInVietnam())
      ? NIGHT_TARGET
      : DAY_TARGET;
    return Response.redirect(target, STATUS_CODE);
  },
};

// Xuất riêng cho unit test (Vitest); Cloudflare bỏ qua các named export này.
export { minutesOfDayInVietnam, isNightInVietnam };
