import React from "react";
import "./Button.css";

const onMouseEnter = (event, color, bgColor) => {
  const el = event.target;
  el.style.color = color;
  el.style.backgroundColor = bgColor;
};

const onMouseOut = (event, color, bgColor) => {
  const el = event.target;
  el.style.color = color;
  el.style.backgroundColor = bgColor;
};

// Tóm tắt: Button dùng chung cho các CTA, tự bật rel an toàn khi mở tab mới.
export default function Button({ text, className, href, newTab, theme }) {
  const newTabProps = newTab
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <div className={className}>
      <a
        className="main-button"
        href={href}
        {...newTabProps}
        style={{
          color: theme.body,
          backgroundColor: theme.text,
          border: `solid 1px ${theme.text}`,
        }}
        onMouseEnter={(event) => onMouseEnter(event, theme.text, theme.body)}
        onMouseOut={(event) => onMouseOut(event, theme.body, theme.text)}
      >
        {text}
      </a>
    </div>
  );
}
