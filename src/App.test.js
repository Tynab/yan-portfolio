// Tóm tắt: Smoke test — App render không lỗi (bọc đủ provider như index.js) và applyTheme gắn đúng CSS variable.
import React from "react";
import { render } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { applyTheme, chosenTheme } from "./theme";

test("App renders without crashing", () => {
  applyTheme(chosenTheme);
  render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
});

test("applyTheme sets the shared CSS variables on <html>", () => {
  applyTheme(chosenTheme);
  const style = document.documentElement.style;
  expect(style.getPropertyValue("--color-body")).toBe(chosenTheme.body);
  expect(style.getPropertyValue("--color-text")).toBe(chosenTheme.text);
  expect(style.getPropertyValue("--color-secondary-text")).toBe(
    chosenTheme.secondaryText
  );
  expect(style.getPropertyValue("--color-highlight")).toBe(
    chosenTheme.highlight
  );
  expect(style.getPropertyValue("--color-header")).toBe(
    chosenTheme.headerColor
  );
});
