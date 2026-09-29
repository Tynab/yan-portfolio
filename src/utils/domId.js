// Tóm tắt: Tạo id DOM hợp lệ từ chuỗi tự do (vd. "Jupyter Notebook") để aria-describedby trỏ đúng tooltip.
export function toDomId(...parts) {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
