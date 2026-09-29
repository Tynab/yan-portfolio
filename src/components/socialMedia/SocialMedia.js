import React from "react";
import "./SocialMedia.css";
import { socialMediaLinks } from "../../portfolio";

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
            <i
              className={`fab ${media.fontAwesomeIcon}`}
              style={{ "--icon-bg": media.backgroundColor }}
              aria-hidden="true"
            ></i>
          </a>
        );
      })}
    </div>
  );
}
