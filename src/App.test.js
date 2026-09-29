// Tóm tắt: Smoke test — App render không lỗi (bọc đủ provider như index.js).
import React from "react";
import { render } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";

test("App renders without crashing", () => {
  render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
});
