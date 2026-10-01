import React from "react";
import "./CompetitiveSites.css";
import Tooltip from "../tooltip/Tooltip";
import { toDomId } from "../../utils/domId";

// Tóm tắt: Render các hồ sơ luyện tập/chứng chỉ online trong trang Certifications.
function CompetitiveSites({ logos = [] }) {
  return (
    <div className="competitive-sites-main-div">
      <ul className="dev-icons">
        {logos.map((logo) => {
          return (
            <li className="competitive-sites-inline" key={logo.siteName}>
              {/* Trigger là chính link (focus được bằng Tab) nên aria-describedby gắn đúng phần tử đang focus. */}
              <Tooltip
                id={toDomId("competitive-site", logo.siteName)}
                content={logo.siteName}
              >
                <a
                  href={logo.profileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={logo.siteName}
                >
                  <span
                    aria-hidden="true"
                    className="iconify"
                    data-icon={logo.iconifyClassname}
                    style={logo.style}
                    data-inline="false"
                  ></span>
                </a>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default CompetitiveSites;
