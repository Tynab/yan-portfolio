import React from "react";
import Certifications from "../../containers/certifications/Certifications";
import CompetitiveSites from "../../components/competitiveSites/CompetitiveSites";
import CertificationsImg from "./CertificationsImg";
import { certifications, competitiveSites } from "../../portfolio";
import "./CertificationsPage.css";
import { Fade } from "react-awesome-reveal";

// Tóm tắt: Trang Certifications — hồ sơ luyện tập và danh sách chứng chỉ.
function CertificationsPage({ theme }) {
  return (
    <div className="certifications-main">
      <div className="basic-certifications">
        <Fade direction="up" duration={2000} triggerOnce>
          <div className="heading-div">
            <div className="heading-img-div">
              <CertificationsImg theme={theme} />
            </div>
            <div className="heading-text-div">
              <h1 className="heading-text" style={{ color: theme.text }}>
                Certifications
              </h1>
              <h3 className="heading-sub-text" style={{ color: theme.text }}>
                Professional Certifications and Skill Assessments
              </h3>
              <CompetitiveSites logos={competitiveSites.competitiveSites} />
            </div>
          </div>
        </Fade>
        {certifications.certifications.length > 0 ? (
          <Certifications theme={theme} />
        ) : null}
      </div>
    </div>
  );
}

export default CertificationsPage;
