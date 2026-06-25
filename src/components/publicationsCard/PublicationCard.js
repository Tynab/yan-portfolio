import React from "react";
import "./PublicationCard.css";
import { Fade } from "react-reveal";

// Tóm tắt: Card publication thử nghiệm, giữ layout tương đồng với repo card.
export default function PublicationCard({ pub, theme }) {
  function openPubInNewTab(url) {
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (win) {
      win.focus();
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPubInNewTab(pub.url);
    }
  }

  return (
    <div
      className="publication-card-div"
      style={{ backgroundColor: theme.highlight }}
    >
      <Fade bottom duration={2000} distance="40px">
        <div
          role="button"
          tabIndex={0}
          onClick={() => openPubInNewTab(pub.url)}
          onKeyDown={handleKeyDown}
        >
          <div className="publication-name-div">
            <p className="publication-name" style={{ color: theme.text }}>
              {pub.name}
            </p>
          </div>
          <p className="publication-description" style={{ color: theme.text }}>
            {pub.description}
          </p>
          <div className="publication-details">
            <p
              className="publication-creation-date subTitle"
              style={{ color: theme.secondaryText }}
            >
              Published on {pub.createdAt.split("T")[0]}
            </p>
          </div>
        </div>
      </Fade>
    </div>
  );
}
