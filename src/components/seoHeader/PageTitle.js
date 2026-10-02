// Tóm tắt: Đặt <title> riêng cho từng trang ("<Trang> | Yami An") qua react-helmet-async.
import React from "react";
import { Helmet } from "react-helmet-async";
import { seo } from "../../portfolio.js";

// Không truyền title (trang Home) thì dùng title đầy đủ của site (seo.title);
// trang con dùng hậu tố ngắn seo.brand để title không quá dài trên tab/kết quả tìm kiếm.
function pageTitle(title) {
  return title ? `${title} | ${seo.brand}` : seo.title;
}

// Helmet của trang mount sau SeoHeader (nằm trong Header) nên title của trang được ưu tiên.
function PageTitle({ title }) {
  return (
    <Helmet>
      <title>{pageTitle(title)}</title>
    </Helmet>
  );
}

export default PageTitle;
