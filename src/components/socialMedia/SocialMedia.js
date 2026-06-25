import React from "react";
import "./SocialMedia.css";
import { socialMediaLinks } from "../../portfolio";
import styled from "styled-components";

const IconWrapper = styled.span`
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
