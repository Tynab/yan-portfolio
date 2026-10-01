import React from "react";
import "./SocialMedia.css";
import { socialMediaLinks } from "../../portfolio";
import {
  FacebookFIcon,
  GithubIcon,
  GoogleIcon,
  LinkedinInIcon,
  XTwitterIcon,
} from "../icons/brandIcons";

// Khóa fontAwesomeIcon trong portfolio.js -> icon SVG inline (không còn nạp Font Awesome từ CDN).
// Dùng Map để khóa lạ (kể cả "constructor", "toString"...) trả về undefined thay vì thuộc tính của Object.
const socialIcons = new Map([
  ["fa-github", GithubIcon],
  ["fa-linkedin-in", LinkedinInIcon],
  ["fa-google", GoogleIcon],
  ["fa-x-twitter", XTwitterIcon],
  ["fa-facebook-f", FacebookFIcon],
]);

// Tóm tắt: Render các kênh liên hệ xã hội từ cấu hình portfolio.js.
export default function SocialMedia() {
  return (
    <div className="social-media-div">
      {socialMediaLinks.map((media) => {
        const externalLink =
          !media.link.startsWith("mailto:") && !media.link.startsWith("tel:");
        const newTabProps = externalLink
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {};
        // Khóa không có trong bảng thì bỏ icon, link vẫn giữ tên truy cập qua aria-label.
        const Icon = socialIcons.get(media.fontAwesomeIcon);

        return (
          <a
            key={media.name}
            href={media.link}
            className="icon-button"
            aria-label={media.name}
            title={media.name}
            {...newTabProps}
          >
            {/* Màu nền riêng của từng mạng xã hội truyền qua CSS variable; hover/focus xử lý trong CSS. */}
            <span
              className="social-icon"
              style={{ "--icon-bg": media.backgroundColor }}
              aria-hidden="true"
            >
              {Icon && <Icon />}
            </span>
          </a>
        );
      })}
    </div>
  );
}
