import React from "react";
import "./App.css";
import Main from "./containers/Main";
import { ThemeProvider } from "styled-components";
import { chosenTheme } from "./theme";
import { GlobalStyles } from "./global";

// Tóm tắt: App là root composition, nơi gắn theme toàn cục và router chính.
function App() {
  return (
    <ThemeProvider theme={chosenTheme}>
      <>
        <GlobalStyles />
        <Main theme={chosenTheme} />
      </>
    </ThemeProvider>
  );
}

export default App;
