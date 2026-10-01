import React from "react";
import ExperienceCard from "../../components/experienceCard/ExperienceCard.js";
import "./ExperienceAccordion.css";

// Tóm tắt: Accordion gom kinh nghiệm theo từng nhóm trong experience.sections (portfolio.js).
// Dùng <details>/<summary> gốc thay cho baseui: có sẵn bàn phím + ARIA, không cần tải baseui/styletron.
// name chung => trình duyệt hỗ trợ sẽ chỉ mở một nhóm tại một thời điểm (giống Accordion của baseui).
function ExperienceAccordion({ theme, sections }) {
  return (
    <div className="experience-accord">
      {sections.map((section) => {
        return (
          <details
            className="accord-panel"
            name="experience-sections"
            key={section["title"]}
          >
            <summary className="accord-header">
              <span>{section["title"]}</span>
              <span className="accord-chevron" aria-hidden="true" />
            </summary>
            <div className="accord-content">
              {section["experiences"].map((experience, index) => {
                return (
                  <ExperienceCard
                    key={`${section["title"]}-${experience["company"]}-${index}`}
                    index={index}
                    totalCards={section["experiences"].length}
                    experience={experience}
                    theme={theme}
                  />
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}

export default ExperienceAccordion;
