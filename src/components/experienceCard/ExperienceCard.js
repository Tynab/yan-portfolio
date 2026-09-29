import React from "react";
import "./ExperienceCard.css";
import { Fade } from "react-awesome-reveal";

// Khoảng cách giữa các card; đoạn nối trên của timeline dùng đúng giá trị này (xem ExperienceCard.css).
const CARD_GAP = 50;

// Tóm tắt: Timeline card mô tả một vai trò công việc/kỳ thực tập và logo công ty.
function ExperienceCard({ experience, index, totalCards, theme }) {
  return (
    <div
      className="experience-list-item"
      style={{ marginTop: index === 0 ? 30 : CARD_GAP }}
    >
      <Fade direction="left" duration={2000} triggerOnce>
        <div className="experience-card-logo-div">
          <img
            className="experience-card-logo"
            // new URL(..., import.meta.url): cách Vite nạp ảnh động thay cho require() của CRA.
            src={
              new URL(
                `../../assests/images/${experience["logo_path"]}`,
                import.meta.url
              ).href
            }
            alt={experience["company"]}
          />
        </div>
      </Fade>
      <div className="experience-card-stepper">
        {/* Đoạn nối trên kéo lên qua khoảng margin-top của card, đoạn dưới chạy tới đáy card,
            nên timeline liền mạch bất kể chiều cao từng card. */}
        {index !== 0 && (
          <div
            className="experience-card-line experience-card-line-top"
            style={{ backgroundColor: theme.headerColor }}
          />
        )}
        <div
          className="experience-card-dot"
          style={{ backgroundColor: theme.headerColor }}
        />
        {index !== totalCards - 1 && (
          <div
            className="experience-card-line experience-card-line-bottom"
            style={{ backgroundColor: theme.headerColor }}
          />
        )}
      </div>
      <Fade
        direction="right"
        duration={2000}
        className="experience-card-reveal"
        triggerOnce
      >
        <div className="experience-card-row">
          <div
            className="arrow-left"
            style={{ borderRight: `10px solid ${theme.body}` }}
          ></div>
          <div
            className="experience-card"
            style={{ background: `${theme.body}` }}
          >
            <div className="experience-card-header">
              <div>
                <h2
                  className="experience-card-title"
                  style={{ color: theme.text }}
                >
                  {experience["title"]}
                </h2>
                <p
                  className="experience-card-company"
                  style={{ color: theme.text }}
                >
                  <a
                    href={experience["company_url"]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {experience["company"]}
                  </a>
                </p>
              </div>
              <div className="experience-card-heading-right">
                <p
                  className="experience-card-duration"
                  style={{ color: theme.secondaryText }}
                >
                  {experience["duration"]}
                </p>
                <p
                  className="experience-card-location"
                  style={{ color: theme.secondaryText }}
                >
                  {experience["location"]}
                </p>
              </div>
            </div>
            <p className="experience-card-description">
              {experience["description"]}
            </p>
          </div>
        </div>
      </Fade>
    </div>
  );
}

export default ExperienceCard;
