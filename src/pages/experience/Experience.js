import React from "react";
import PageLayout from "../../components/pageLayout/PageLayout";
import ExperienceAccordion from "../../containers/experienceAccordion/ExperienceAccordion.js";
import "./Experience.css";
import { experience } from "../../portfolio.js";
import { Fade } from "react-awesome-reveal";
import ExperienceImg from "./ExperienceImg";

// Tóm tắt: Trang Experience hiển thị phần giới thiệu và accordion kinh nghiệm làm việc.
function Experience({ theme }) {
  return (
    <PageLayout theme={theme} className="experience-main">
      <div className="basic-experience">
        <Fade direction="up" duration={2000}>
          <div className="experience-heading-div">
            <div className="experience-heading-img-div">
              <ExperienceImg theme={theme} />
            </div>
            <div className="experience-heading-text-div">
              <h1
                className="experience-heading-text"
                style={{ color: theme.text }}
              >
                {experience.title}
              </h1>
              <h3
                className="experience-heading-sub-text"
                style={{ color: theme.text }}
              >
                {experience["subtitle"]}
              </h3>
              <p
                className="experience-header-detail-text subTitle"
                style={{ color: theme.secondaryText }}
              >
                {experience["description"]}
              </p>
            </div>
          </div>
        </Fade>
      </div>
      <ExperienceAccordion sections={experience["sections"]} theme={theme} />
    </PageLayout>
  );
}

export default Experience;
