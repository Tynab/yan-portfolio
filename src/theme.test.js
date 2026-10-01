// Tóm tắt: Giá trị mặc định của CSS variable trong base.css (dùng cho lần paint trước khi JS chạy) phải khớp
// chosenTheme — đổi theme mà quên sửa base.css thì trang sẽ nháy màu cũ lúc tải.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { applyTheme, chosenTheme } from "./theme";

// Đọc file thô (import CSS trong vitest không trả nội dung).
const baseCss = readFileSync(join(__dirname, "base.css"), "utf8");

function cssDefault(variable) {
  const match = baseCss.match(new RegExp(`${variable}:\\s*([^;]+);`));
  return match ? match[1].trim().toLowerCase() : undefined;
}

test("base.css :root mặc định khớp chosenTheme", () => {
  expect(cssDefault("--color-body")).toBe(chosenTheme.body.toLowerCase());
  expect(cssDefault("--color-text")).toBe(chosenTheme.text.toLowerCase());
  expect(cssDefault("--color-secondary-text")).toBe(
    chosenTheme.secondaryText.toLowerCase()
  );
  expect(cssDefault("--color-highlight")).toBe(
    chosenTheme.highlight.toLowerCase()
  );
  expect(cssDefault("--color-header")).toBe(
    chosenTheme.headerColor.toLowerCase()
  );
});

test("applyTheme gắn 5 biến màu lên phần tử gốc", () => {
  const root = document.createElement("div");
  applyTheme(chosenTheme, root);
  expect(root.style.getPropertyValue("--color-body")).toBe(chosenTheme.body);
  expect(root.style.getPropertyValue("--color-header")).toBe(
    chosenTheme.headerColor
  );
});
