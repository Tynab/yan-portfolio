import React from "react";
import Header from "../header/Header";
import TopButton from "../topButton/TopButton";

// Tóm tắt: Khung trang dùng chung — Header + nội dung + nút cuộn lên (TopButton).
function PageLayout({ theme, className, children }) {
  return (
    <div className={className}>
      <Header theme={theme} />
      {children}
      <TopButton theme={theme} />
    </div>
  );
}

export default PageLayout;
