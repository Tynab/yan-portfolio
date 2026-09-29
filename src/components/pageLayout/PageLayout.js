import React, { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../header/Header";
import TopButton from "../topButton/TopButton";

// Tóm tắt: Layout route dùng chung — Header + trang hiện tại (<Outlet/>) + nút cuộn lên (TopButton).
// Header/TopButton chỉ mount một lần nên animation của Header không chạy lại mỗi lần chuyển trang.
function PageLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    // "instant" để bỏ qua scroll-behavior: smooth của html khi đổi trang.
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
          <Outlet />
        </Suspense>
      </main>
      <TopButton />
    </>
  );
}

export default PageLayout;
