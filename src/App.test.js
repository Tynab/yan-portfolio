import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

// Tóm tắt: Smoke test đảm bảo App mount/unmount được trong DOM giả lập.
it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
