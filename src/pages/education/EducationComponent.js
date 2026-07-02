import React from "react";
import PageLayout from "../../components/pageLayout/PageLayout";
import Certifications from "../../containers/certifications/Certifications";
import CompetitiveSites from "../../components/competitiveSites/CompetitiveSites";
import EducationImg from "./EducationImg";
import { competitiveSites } from "../../portfolio";
import { certifications } from "../../portfolio";
import "./EducationComponent.css";
import { Fade } from "react-awesome-reveal";

// Tóm tắt: Trang Education hiện tập trung vào hồ sơ luyện tập và chứng chỉ.
function Education({ theme }) {
  return (
    <PageLayout theme={theme} className="education-main">
      <div className="basic-education">
        <Fade direction="up" duration={2000} triggerOnce>
          <div className="heading-div">
            <div className="heading-img-div">
              <EducationImg theme={theme} />
            </div>
            <div className="heading-text-div">
              <h1 className="heading-text" style={{ color: theme.text }}>
                Education
              </h1>
              <h3 className="heading-sub-text" style={{ color: theme.text }}>
                Basic Qualification and Certifcations
              </h3>
              <CompetitiveSites logos={competitiveSites.competitiveSites} />
            </div>
          </div>
        </Fade>
        {certifications.certifications.length > 0 ? (
          <Certifications theme={theme} />
        ) : null}
      </div>
    </PageLayout>
  );
}

export default Education;
