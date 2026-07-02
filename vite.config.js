import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { transformWithEsbuild } from "vite";

// Tóm tắt: Plugin bắt buộc esbuild transform JSX trong file .js của src/ trước khi rollup phân tích import.
// (plugin-react/esbuild.loader không áp dụng cho bước import-analysis khi build production.)
// Chỉ áp dụng cho src/ của chính project — loại trừ node_modules và font-awesome đã vendor sẵn.
const projectSrcJsRE = new RegExp(
  `^${process.cwd().replace(/[\\/]/g, "[\\\\/]")}[\\\\/]src[\\\\/].*\\.js$`
);
const jsAsJsx = {
  name: "load-js-as-jsx",
  enforce: "pre",
  async load(id) {
    const [filepath] = id.split("?");
    if (
      filepath.includes("/node_modules/") ||
      filepath.includes("\\node_modules\\")
    )
      return null;
    if (
      filepath.includes("assests/font-awesome/") ||
      filepath.includes("assests\\font-awesome\\")
    )
      return null;
    if (!projectSrcJsRE.test(filepath)) return null;
    const code = readFileSync(filepath, "utf-8");
    return transformWithEsbuild(code, filepath, { loader: "jsx" });
  },
};

// Tóm tắt: Cấu hình Vite — base tương đối, output vào build/, cho phép JSX trong .js, và cấu hình Vitest.
export default defineConfig({
  plugins: [jsAsJsx, react()],
  base: "./",
  build: { outDir: "build" },
  server: { port: 3000 },
  // Cho phép cú pháp JSX trong file .js (tránh đổi tên hàng loạt file) khi chạy dev/optimize.
  esbuild: { loader: "jsx", include: /src\/.*\.js$/ },
  optimizeDeps: { esbuildOptions: { loader: { ".js": "jsx" } } },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
});
