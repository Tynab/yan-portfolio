import React from "react";
import "./App.css";
import Main from "./containers/Main";
import { chosenTheme } from "./theme";

// Tóm tắt: App là root composition, truyền theme đang dùng xuống router chính.
// Màu toàn cục (CSS variable) đã được applyTheme() gắn trong index.js trước khi render.
function App() {
  return <Main theme={chosenTheme} />;
}

export default App;
