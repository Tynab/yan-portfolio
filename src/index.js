import React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";

// base.css nạp đầu tiên (reset + màu nền body), các stylesheet sau có thể ghi đè.
import "./base.css";
import "./index.css";
import App from "./App";
import { applyTheme, chosenTheme } from "./theme";

// Tóm tắt: Entry point — gắn màu theme thành CSS variable, rồi render app (React 18 createRoot) trong Helmet provider.
// Icon mạng xã hội/nút lên đầu trang là SVG inline (components/icons), không cần Font Awesome CDN.
// Gắn theme TRƯỚC khi render để lần paint đầu đã đúng màu, không nháy.
applyTheme(chosenTheme);

const container = document.getElementById("root");
createRoot(container).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
