import React from "react";

// Tóm tắt: Card thành tựu legacy, render ảnh, mô tả và các link footer.
export default function AchivementCard({ cardInfo }) {
  const footer = cardInfo.footer || [];

  function openUrlInNewTab(url) {
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (win) {
      win.focus();
    }
  }

  return (
    <div className="certificate-card">
      <div className="certificate-image-div">
        <img src={cardInfo.image} alt="PWA" className="card-image"></img>
      </div>
      <div className="certificate-detail-div">
        <h5 className="card-title">{cardInfo.title}</h5>
        <p className="card-subtitle">{cardInfo.description}</p>
      </div>
      <div className="certificate-card-footer">
        {footer.map((v, i) => {
          return (
            <p key={`${v.name}-${i}`} onClick={() => openUrlInNewTab(v.url)}>
              {v.name}
            </p>
          );
        })}
      </div>
    </div>
  );
}
