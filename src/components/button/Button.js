import React from "react";
import "./Button.css";

// Tóm tắt: Button dùng chung cho các CTA, tự bật rel an toàn khi mở tab mới.
export default function Button({ text, className, href, newTab }) {
  const newTabProps = newTab
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <div className={className}>
      <a className="main-button" href={href} {...newTabProps}>
        {text}
      </a>
    </div>
  );
}
