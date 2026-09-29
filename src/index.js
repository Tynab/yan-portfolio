import React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";

import "./index.css";
import "./tooltip.css";
import App from "./App";

// Tóm tắt: Entry point — gắn Helmet provider rồi render app (React 18 createRoot).
// Font Awesome 6 được nạp từ CDN trong index.html, không bundle thêm bản FA5.
const container = document.getElementById("root");
createRoot(container).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
