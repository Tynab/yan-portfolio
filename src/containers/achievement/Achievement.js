import React from "react";
import "./Achievement.css";
import AchivementCard from "../../components/achievementCard/AchivementCard";
import { achievementSection } from "../../portfolio";

// Tóm tắt: Section thành tựu legacy, render các card achievement khi cấu hình có dữ liệu.
export default function Achievement() {
  return (
    <div className="main" id="achievements">
      <div className="achievement-main-div">
        <div className="achievement-header">
          <h1 className="heading achievement-heading">
            {achievementSection.title}
          </h1>
          <p className="subTitle achievement-subtitle">
            {achievementSection.subtitle}
          </p>
        </div>
        <div className="achievement-cards-div">
          {achievementSection.achivementsCards.map((card) => {
            return (
              <AchivementCard
                key={card.title}
                cardInfo={{
                  title: card.title,
                  description: card.subtitle,
                  image: card.image,
                  footer: card.footerLink,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
