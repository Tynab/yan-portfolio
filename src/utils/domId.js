// Tóm tắt: Tạo id DOM hợp lệ từ chuỗi tự do (vd. "Jupyter Notebook") để aria-describedby trỏ đúng tooltip.
// "+" và "#" được đổi thành chữ để "C", "C++", "C#" không trùng id (bong bóng tooltip luôn nằm trong DOM).
export function toDomId(...parts) {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/\+/g, "-plus-")
    .replace(/#/g, "-sharp-")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}
