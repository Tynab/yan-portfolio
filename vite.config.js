import { defineConfig, normalizePath, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Tóm tắt: Plugin bắt buộc esbuild transform JSX trong file .js của src/ trước khi rollup phân tích import.
// (plugin-react/esbuild.loader không áp dụng cho bước import-analysis khi build production.)
// So khớp bằng tiền tố đường dẫn (không dùng RegExp) để thư mục chứa ký tự như "(", "+" vẫn build được.
const srcDir = normalizePath(fileURLToPath(new URL("./src/", import.meta.url)));
const jsAsJsx = {
  name: "load-js-as-jsx",
  enforce: "pre",
  async load(id) {
    const filepath = normalizePath(id.split("?")[0]);
    if (!filepath.startsWith(srcDir) || !filepath.endsWith(".js")) return null;
    const code = readFileSync(filepath, "utf-8");
    return transformWithEsbuild(code, filepath, {
      loader: "jsx",
      jsx: "automatic",
    });
  },
};

// Tóm tắt: Cấu hình Vite — base tương đối, output vào build/, cho phép JSX trong .js, và cấu hình Vitest.
export default defineConfig({
  plugins: [jsAsJsx, react()],
  // base tương đối + outDir "build": giữ nguyên đường dẫn asset và tên thư mục mà Dockerfile/nginx.conf đang kỳ vọng.
  base: "./",
  build: { outDir: "build" },
  server: { port: 3000 },
  // Quét dependency (dev) cũng phải hiểu JSX trong .js của src/.
  optimizeDeps: { esbuildOptions: { loader: { ".js": "jsx" } } },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
});
