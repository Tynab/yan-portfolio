import React from "react";
import "./SoftwareSkill.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

// Chuỗi cache-bust: nginx phục vụ /skills/ với no-cache nên phải bump giá trị này mỗi khi đổi PNG kỹ năng.
const skillAssetVersion = "2026-06-29-lfs-refresh";

// Tóm tắt: Render lưới kỹ năng phần mềm từ cấu hình, hỗ trợ cả Iconify và ảnh tĩnh.
function SoftwareSkill({ logos = [] }) {
  return (
    <div>
      <div className="software-skills-main-div">
        <ul className="dev-icons">
          {logos.map((logo) => {
            return (
              <OverlayTrigger
                key={logo.skillName}
                placement={"top"}
                overlay={
                  <Tooltip id={`software-skill-${logo.skillName}`}>
                    <strong>{logo.skillName}</strong>
                  </Tooltip>
                }
              >
                <li className="software-skill-inline" name={logo.skillName}>
                  {logo.fontAwesomeClassname && (
                    <span
                      className="iconify"
                      data-icon={logo.fontAwesomeClassname}
                      style={logo.style}
                      data-inline="false"
                    ></span>
                  )}
                  {!logo.fontAwesomeClassname && logo.imageSrc && (
                    <img
                      className="skill-image"
                      style={logo.style}
                      // BASE_URL (Vite) thay cho PUBLIC_URL (CRA) để trỏ đúng thư mục public/skills/ khi deploy.
                      src={`${import.meta.env.BASE_URL}skills/${
                        logo.imageSrc
                      }?v=${skillAssetVersion}`}
                      alt={logo.skillName}
                    />
                  )}
                </li>
              </OverlayTrigger>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default SoftwareSkill;
