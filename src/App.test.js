// Tóm tắt: Smoke test — App render không lỗi (bọc đủ provider như index.js).
import React from "react";
import { render } from "@testing-library/react";
import { BaseProvider, LightTheme } from "baseui";
import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";

test("App renders without crashing", () => {
  const engine = new Styletron();
  render(
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </BaseProvider>
    </StyletronProvider>
  );
});
