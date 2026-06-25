import React from "react";
import "./SoftwareSkill.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

// Tóm tắt: Render lưới kỹ năng phần mềm từ cấu hình, hỗ trợ cả Iconify và ảnh tĩnh.
class SoftwareSkill extends React.Component {
  render() {
    const logos = this.props.logos || [];

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
                        src={`${process.env.PUBLIC_URL}/skills/${logo.imageSrc}`}
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
}

export default SoftwareSkill;
