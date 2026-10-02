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
        {/* Báo cho screen reader biết link mở tab mới; class visually-hidden có trong App.css. */}
        {newTab && (
          <span className="visually-hidden"> (opens in a new tab)</span>
        )}
      </a>
    </div>
  );
}
