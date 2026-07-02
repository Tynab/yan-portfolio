// Tóm tắt: Smoke test — App render không lỗi.
import React from "react";
import { render } from "@testing-library/react";
import App from "./App";

test("App renders without crashing", () => {
  render(<App />);
});
