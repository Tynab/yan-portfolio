import React, { useEffect, useState } from "react";
import "./TopButton.css";

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={goUpEvent}
      id="topButton"
      className={isVisible ? "is-visible" : undefined}
      title="Go up"
      aria-label="Cuộn lên đầu trang"
    >
      <i className="fas fa-arrow-up" aria-hidden="true" />
    </button>
  );
}
