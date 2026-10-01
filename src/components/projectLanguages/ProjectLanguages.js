import React, { useId } from "react";
import "./ProjectLanguages.css";
import Tooltip from "../tooltip/Tooltip";
import { toDomId } from "../../utils/domId";

// Tóm tắt: Hiển thị icon ngôn ngữ/công nghệ của từng repository.
function ProjectLanguages({ logos = [] }) {
  // Nhiều card cùng có một ngôn ngữ (vd. Python) => thêm id riêng của từng card để id tooltip không trùng.
  const cardId = useId();

  return (
    <div>
      <div className="software-skills-main-div">
        <ul className="dev-icons-languages">
          {logos.map((logo) => {
            return (
              // Chỉ hover: icon nằm trong link của card nên không thêm điểm focus lồng trong link.
              <Tooltip
                key={logo.name}
                id={toDomId("language-tooltip", cardId, logo.name)}
                content={logo.name}
              >
                <li className="software-skill-inline-languages">
                  <span
                    className="iconify"
                    data-icon={logo.iconifyClass}
                    data-inline="false"
                  ></span>
                </li>
              </Tooltip>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default ProjectLanguages;
