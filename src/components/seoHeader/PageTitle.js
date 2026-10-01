// Tóm tắt: Đặt <title> riêng cho từng trang ("<Trang> | Yami An's Portfolio") qua react-helmet-async.
import React from "react";
import { Helmet } from "react-helmet-async";
import { seo } from "../../portfolio.js";

// Không truyền title (trang Home) thì dùng title mặc định của site.
function pageTitle(title) {
  return title ? `${title} | ${seo.title}` : seo.title;
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
