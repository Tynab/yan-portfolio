import React, { Suspense, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import Header from "../header/Header";
import TopButton from "../topButton/TopButton";

// Tóm tắt: Layout route dùng chung — Header + trang hiện tại (<Outlet/>) + nút cuộn lên (TopButton).
// Header/TopButton chỉ mount một lần nên animation của Header không chạy lại mỗi lần chuyển trang.
function PageLayout() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const mainRef = useRef(null);
  // Pathname đã xử lý gần nhất: lần render đầu (vào thẳng một URL) không cướp focus.
  const lastPathRef = useRef(pathname);

  useEffect(() => {
    // "instant" để bỏ qua scroll-behavior: smooth của html khi đổi trang.
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    // Redirect (<Navigate replace>, vd /education -> /certifications) không phải người dùng chuyển trang.
    if (navigationType === "REPLACE") return;
    // Chuyển trang: đưa focus về nội dung mới để bàn phím/screen reader bắt đầu từ đầu trang,
    // preventScroll vì đã cuộn lên đầu ở trên.
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, navigationType]);

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} ref={mainRef}>
        <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
          <Outlet />
        </Suspense>
      </main>
      <TopButton />
    </>
  );
}

export default PageLayout;
