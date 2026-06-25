import React from "react";
import "./TalkCard.css";

// Tóm tắt: Card talk gom link slide và sự kiện cho phần chia sẻ/kỹ thuật.
export default function TalkCard({ talkDetails }) {
  return (
    <div>
      <div className="container">
        <div className="rectangle">
          <div className="diagonal-fill"></div>
          <div className="talk-card-title">{talkDetails.title}</div>
          <p className="talk-card-subtitle">{talkDetails.subtitle}</p>

          <div className="card-footer-button-div">
            <a
              href={talkDetails.slides_url}
              target="_blank"
              rel="noopener noreferrer"
              className="talk-button"
            >
              Slides
            </a>
            <a
              href={talkDetails.event_url}
              target="_blank"
              rel="noopener noreferrer"
              className="talk-button"
            >
              Event
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
