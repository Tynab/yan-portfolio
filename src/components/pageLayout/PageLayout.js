import React from "react";
import Header from "../header/Header";
import TopButton from "../topButton/TopButton";

// Tóm tắt: Khung trang dùng chung — Header + nội dung + nút cuộn lên (TopButton).
function PageLayout({ className, children }) {
  return (
    <div className={className}>
      <Header />
      {children}
      <TopButton />
    </div>
  );
}

export default PageLayout;
