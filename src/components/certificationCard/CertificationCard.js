import React from "react";
import "./CertificationCard.css";
import { Fade } from "react-awesome-reveal";

// Tóm tắt: Card chứng chỉ với logo đơn vị cấp và link chứng thực ngoài.
function CertificationCard({ certificate, theme }) {
  return (
    <Fade direction="up" duration={2000} className="cert-card-reveal">
      <div className="cert-card">
        <div className="content">
          <a
            href={certificate.certificate_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="content-overlay"></div>
            <div
              className="cert-header"
              style={{ backgroundColor: certificate.color_code }}
            >
              <img
                className="logo_img"
                // new URL(..., import.meta.url): cách Vite nạp ảnh động thay cho require() của CRA.
                src={
                  new URL(
                    `../../assests/images/${certificate.logo_path}`,
                    import.meta.url
                  ).href
                }
                alt={certificate.alt_name}
              />
            </div>
            <div className="content-details fadeIn-top">
              <h3 className="content-title" style={{ color: theme.body }}>
                Certificate
              </h3>
            </div>
          </a>
        </div>
        <div className="cert-body">
          <h2 className="cert-body-title" style={{ color: theme.text }}>
            {certificate.title}
          </h2>
          <h3
            className="cert-body-subtitle"
            style={{ color: theme.secondaryText }}
          >
            {certificate.subtitle}
          </h3>
        </div>
      </div>
    </Fade>
  );
}

export default CertificationCard;
