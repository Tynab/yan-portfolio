import React, { useEffect, useState } from "react";
import "./TopButton.css";
import { ArrowUpIcon } from "../icons/solidIcons";

// Người dùng bật "giảm chuyển động" thì cuộn tức thì thay vì cuộn mượt.
function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Tóm tắt: Nút nổi theo dõi scroll và đưa người dùng về đầu trang.
export default function TopButton() {
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
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  // Trang khai báo lang="en" nên nhãn truy cập dùng tiếng Anh; title trùng nhãn để không đọc lặp hai câu khác nhau.
  return (
    <button
      type="button"
      onClick={goUpEvent}
      id="topButton"
      className={isVisible ? "is-visible" : undefined}
      title="Back to top"
      aria-label="Back to top"
    >
      <ArrowUpIcon />
    </button>
  );
}
