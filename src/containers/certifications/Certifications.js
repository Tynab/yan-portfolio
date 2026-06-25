import React, { Component } from "react";
import "./Certifications.css";
import { Fade } from "react-reveal";
import { certifications } from "../../portfolio";
import CertificationCard from "../../components/certificationCard/CertificationCard";

// Tóm tắt: Section chứng chỉ, render danh sách certificate từ portfolio.js.
class Certifications extends Component {
  render() {
    const theme = this.props.theme;
    return (
      <div className="main" id="certs">
        <div className="certs-header-div">
          <Fade bottom duration={2000} distance="20px">
            <h1 className="certs-header" style={{ color: theme.text }}>
              Certifications
            </h1>
          </Fade>
        </div>
        <div className="certs-body-div">
          {certifications.certifications.map((cert) => {
            return (
              <CertificationCard
                key={cert.certificate_link}
                certificate={cert}
                theme={theme}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

export default Certifications;
