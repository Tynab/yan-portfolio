import React from "react";
import { createRoot } from "react-dom/client";
import { BaseProvider, LightTheme } from "baseui";
import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";
import { HelmetProvider } from "react-helmet-async";

import "./index.css";
import App from "./App";
import "./assests/font-awesome/css/all.css";

const engine = new Styletron();

// Tóm tắt: Entry point — gắn Styletron/BaseUI + Helmet provider rồi render app (React 18 createRoot).
const container = document.getElementById("root");
createRoot(container).render(
  // Thứ tự bọc bắt buộc: Styletron (engine cho BaseUI) -> BaseUI -> Helmet (quản lý <head>) -> App.
  <StyletronProvider value={engine}>
    <BaseProvider theme={LightTheme}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </BaseProvider>
  </StyletronProvider>
);
