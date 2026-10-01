// Tóm tắt: Khung <svg> inline dùng chung cho các icon (thay font icon Font Awesome nạp từ CDN).
import React from "react";
import "./SvgIcon.css";

// Icon chỉ để trang trí: aria-hidden + focusable="false"; tên truy cập do phần tử cha (link/nút) cung cấp.
// Kích thước giống glyph font: cao 1em, rộng theo tỉ lệ viewBox (glyph Font Awesome cao 512 đơn vị).
export default function SvgIcon({ width, height = 512, path, className }) {
  return (
    <svg
      className={className ? `svg-icon ${className}` : "svg-icon"}
      viewBox={`0 0 ${width} ${height}`}
      width={`${width / height}em`}
      height="1em"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      <path d={path} />
    </svg>
  );
}
