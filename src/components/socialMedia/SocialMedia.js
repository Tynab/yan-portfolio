import React from "react";
import "./SocialMedia.css";
import { socialMediaLinks } from "../../portfolio";
import styled from "styled-components";

// styled-components v6 chuyển tiếp mọi prop xuống DOM; chỉ giữ lại các prop
// hợp lệ cho <span> để tránh cảnh báo "unknown attribute" (backgroundColor,
// fontAwesomeIcon, link, name... chỉ dùng cho style/logic, không phải HTML).
const nonDomProps = new Set([
  "backgroundColor",
  "fontAwesomeIcon",
  "link",
  "name",
  "theme",
  "onToggle",
]);
const IconWrapper = styled.span.withConfig({
  shouldForwardProp: (prop) => !nonDomProps.has(prop),
})`
  i {
    background-color: ${(props) => props.backgroundColor};
  }
  &:hover i {
    background-color: ${({ theme }) => theme.text};
    transition: 0.3s ease-in;
  }
`;

// Tóm tắt: Render các kênh liên hệ xã hội từ cấu hình portfolio.js.
export default function SocialMedia(props) {
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
            <IconWrapper {...media} {...props}>
              <i className={`fab ${media.fontAwesomeIcon}`}></i>
            </IconWrapper>
          </a>
        );
      })}
    </div>
  );
}
