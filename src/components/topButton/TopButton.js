import React, { useEffect, useState } from "react";
import "./TopButton.css";

// Tóm tắt: Nút nổi theo dõi scroll và đưa người dùng về đầu trang.
export default function TopButton({ theme }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(
        document.body.scrollTop > 30 || document.documentElement.scrollTop > 30
      );
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  function goUpEvent() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const onMouseEnter = (color, bgColor) => {
    const topButton = document.getElementById("topButton");
    const arrow = document.getElementById("arrow");
    if (!topButton || !arrow) {
      return;
    }

    topButton.style.color = color;
    topButton.style.backgroundColor = bgColor;
    arrow.style.color = color;
    arrow.style.backgroundColor = bgColor;
  };

  const onMouseLeave = (color, bgColor) => {
    const topButton = document.getElementById("topButton");
    const arrow = document.getElementById("arrow");
    if (!topButton || !arrow) {
      return;
    }

    topButton.style.color = color;
    topButton.style.backgroundColor = bgColor;
    arrow.style.color = color;
    arrow.style.backgroundColor = bgColor;
  };

  return (
    <button
      type="button"
      onClick={goUpEvent}
      id="topButton"
      style={{
        color: theme.body,
        backgroundColor: theme.text,
        border: `solid 1px ${theme.text}`,
        visibility: isVisible ? "visible" : "hidden",
      }}
      title="Go up"
      aria-label="Cuộn lên đầu trang"
      onMouseEnter={() => onMouseEnter(theme.text, theme.body)}
      onMouseLeave={() => onMouseLeave(theme.body, theme.text)}
    >
      <i className="fas fa-arrow-up" id="arrow" aria-hidden="true" />
    </button>
  );
}
