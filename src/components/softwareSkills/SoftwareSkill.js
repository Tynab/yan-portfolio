import React from "react";
import "./SoftwareSkill.css";
import Tooltip from "../tooltip/Tooltip";
import { toDomId } from "../../utils/domId";

// Chuỗi cache-bust: nginx trả /skills/ với Cache-Control "immutable" (1 năm) nên trình duyệt không hỏi lại server;
// PHẢI bump giá trị này mỗi khi thêm/đổi/chuyển định dạng ảnh kỹ năng, nếu không người dùng cũ vẫn thấy ảnh trong cache.
const skillAssetVersion = "2026-10-01-webp";

// Tóm tắt: Render lưới kỹ năng phần mềm từ cấu hình, hỗ trợ cả Iconify và ảnh tĩnh.
function SoftwareSkill({ logos = [] }) {
  return (
    <div>
      <div className="software-skills-main-div">
        <ul className="dev-icons">
          {logos.map((logo) => {
            return (
              <li className="software-skill-inline" key={logo.skillName}>
                <Tooltip
                  id={toDomId("software-skill", logo.skillName)}
                  content={logo.skillName}
                >
                  {/* Wrapper ổn định (Iconify thay thế <span class="iconify"> bằng <svg>), focus được bằng Tab để
                      người dùng bàn phím cũng xem được tooltip; role="img" + aria-label là tên truy cập của icon. */}
                  <span
                    className="software-skill-icon"
                    tabIndex={0}
                    role="img"
                    aria-label={logo.skillName}
                  >
                    {logo.fontAwesomeClassname && (
                      <span
                        className="iconify"
                        data-icon={logo.fontAwesomeClassname}
                        style={logo.style}
                        data-inline="false"
                        aria-hidden="true"
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
                        // width/height giữ chỗ trước khi ảnh tải xong (không layout shift); CSS cố định cao 48px.
                        width="48"
                        height="48"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </span>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default SoftwareSkill;
