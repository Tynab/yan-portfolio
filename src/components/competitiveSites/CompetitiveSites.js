import React from "react";
import "./CompetitiveSites.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toDomId } from "../../utils/domId";

// Tóm tắt: Render các hồ sơ luyện tập/chứng chỉ online trong trang Education.
function CompetitiveSites({ logos = [] }) {
  return (
    <div className="competitive-sites-main-div">
      <ul className="dev-icons">
        {logos.map((logo) => {
          return (
            <OverlayTrigger
              key={logo.siteName}
              placement={"top"}
              overlay={
                <Tooltip id={toDomId("competitive-site", logo.siteName)}>
                  <strong>{logo.siteName}</strong>
                </Tooltip>
              }
            >
              <li className="competitive-sites-inline" name={logo.siteName}>
                <a
                  href={logo.profileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span
                    className="iconify"
                    data-icon={logo.iconifyClassname}
                    style={logo.style}
                    data-inline="false"
                  ></span>
                </a>
              </li>
            </OverlayTrigger>
          );
        })}
      </ul>
    </div>
  );
}

export default CompetitiveSites;
