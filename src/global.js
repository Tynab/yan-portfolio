import { createGlobalStyle } from "styled-components";

// Tóm tắt: GlobalStyles chuẩn hóa box model, font nền và màu theo theme hiện hành.
export const GlobalStyles = createGlobalStyle`
  *,
  *::after,
  *::before {
    box-sizing: border-box;
  }

  /* Màu theme dưới dạng CSS variable để :hover/:focus-visible xử lý bằng CSS thay vì JS. */
  :root {
    --color-body: ${({ theme }) => theme.body};
    --color-text: ${({ theme }) => theme.text};
    --color-secondary-text: ${({ theme }) => theme.secondaryText};
    --color-highlight: ${({ theme }) => theme.highlight};
    --color-header: ${({ theme }) => theme.headerColor};
  }

  /* body giữ layout block: #root phải rộng đúng bằng viewport, nếu body là flex
     thì #root co theo nội dung và node tooltip chèn vào <body> thành flex item gây reflow. */
  body {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    font-family: BlinkMacSystemFont, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    transition: background-color 0.25s linear, color 0.25s linear;
  }`;
