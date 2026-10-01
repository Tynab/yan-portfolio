import React, { useState, useEffect } from "react";
import "./Splash.css";
import { Navigate } from "react-router-dom";
import LoaderLogo from "../../components/Loader/LoaderLogo.js";
import { seo } from "../../portfolio.js";

// Thời lượng animation grow trong Splash.css; hết thời gian này mới chuyển sang /home.
const SPLASH_DURATION_MS = 5500;

// Người dùng bật "giảm chuyển động" thì bỏ qua splash (kiểm tra an toàn khi không có matchMedia, ví dụ jsdom).
function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Tóm tắt: Splash hiển thị logo động rồi tự chuyển sang trang home.
function AnimatedSplash({ theme }) {
  return (
    <main className="logo_wrapper">
      {/* Splash nằm ngoài PageLayout nên tự có landmark <main> và một h1 (ẩn) cho screen reader. */}
      <h1 className="visually-hidden">{seo.title}</h1>
      <div className="screen" style={{ backgroundColor: theme.splashBg }}>
        <LoaderLogo theme={theme} />
      </div>
    </main>
  );
}

function Splash({ theme }) {
  const [skip] = useState(prefersReducedMotion);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (skip) return undefined;
    // Hiện splash 5.5s rồi tự điều hướng sang /home.
    const id = setTimeout(() => setRedirect(true), SPLASH_DURATION_MS);
    return () => clearTimeout(id);
  }, [skip]);

  if (skip || redirect) {
    return <Navigate to="/home" replace />;
  }

  return <AnimatedSplash theme={theme} />;
}

export default Splash;
