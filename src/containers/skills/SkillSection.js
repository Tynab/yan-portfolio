import React from "react";
import "./Skills.css";
import SoftwareSkill from "../../components/softwareSkills/SoftwareSkill";
import { skills } from "../../portfolio";
import { Fade } from "react-awesome-reveal";
import DataScienceImg from "./DataScienceImg";
import FullStackImg from "./FullStackImg";
import CloudInfraImg from "./CloudInfraImg";
import DesignImg from "./DesignImg";

// Chọn illustration tương ứng với từng nhóm kỹ năng trong portfolio.js.
function GetSkillSvg(props) {
  if (props.fileName === "DataScienceImg")
    return <DataScienceImg theme={props.theme} />;
  else if (props.fileName === "FullStackImg")
    return <FullStackImg theme={props.theme} />;
  else if (props.fileName === "CloudInfraImg")
    return <CloudInfraImg theme={props.theme} />;
  return <DesignImg theme={props.theme} />;
}

// Tóm tắt: Render từng nhóm kỹ năng, icon công nghệ và mô tả năng lực.
function SkillSection({ theme }) {
  return (
    <div>
      {skills.data.map((skill, i) => {
        return (
          <div key={i} className="skills-main-div">
            <Fade direction="left" duration={2000} triggerOnce>
              <div className="skills-image-div">
                <GetSkillSvg fileName={skill.fileName} theme={theme} />
              </div>
            </Fade>

            <div className="skills-text-div">
              <Fade direction="right" duration={1000} triggerOnce>
                <h1 className="skills-heading" style={{ color: theme.text }}>
                  {skill.title}
                </h1>
              </Fade>
              <Fade direction="right" duration={1500} triggerOnce>
                <SoftwareSkill logos={skill.softwareSkills} />
              </Fade>
              <Fade direction="right" duration={2000} triggerOnce>
                <div>
                  {skill.skills.map((skillSentence, i) => {
                    return (
                      <p
                        key={i}
                        className="subTitle skills-text"
                        style={{ color: theme.secondaryText }}
                      >
                        {skillSentence}
                      </p>
                    );
                  })}
                </div>
              </Fade>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SkillSection;
