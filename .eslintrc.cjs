// Tóm tắt: Cấu hình ESLint độc lập (thay preset react-app của CRA).
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
  settings: { react: { version: "detect" } },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  rules: {
    "react/prop-types": "off",
    // SVG dùng thuộc tính kebab-case (stroke-miterlimit...) sẵn có; cảnh báo thay vì lỗi để không chặn build.
    "react/no-unknown-property": "warn",
  },
  ignorePatterns: ["build/", "src/assests/font-awesome/**"],
  overrides: [
    {
      // Vitest cung cấp các global (test, expect, describe...) khi bật globals: true.
      files: ["**/*.test.js", "src/setupTests.js"],
      globals: {
        test: "readonly",
        expect: "readonly",
        describe: "readonly",
        it: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        vi: "readonly",
      },
    },
  ],
};
