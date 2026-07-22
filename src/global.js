import { createGlobalStyle } from "styled-components";

// Tóm tắt: GlobalStyles chuẩn hóa box model, font nền và màu theo theme hiện hành.
export const GlobalStyles = createGlobalStyle`
  *,
  *::after,
  *::before {
    box-sizing: border-box;
  }

  /* Tắt scroll anchoring: react-bootstrap chèn node tooltip vào <body> mỗi lần
     hover icon, khiến trình duyệt bù trừ scroll sai và đẩy trang trượt lên vài px. */
  html,
  body {
    overflow-anchor: none;
  }

  body {
    align-items: center;
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    display: flex;
    font-family: BlinkMacSystemFont, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    transition: all 0.25s linear;
  }`;
