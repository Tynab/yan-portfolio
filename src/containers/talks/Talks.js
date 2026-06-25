import React from "react";
import "./Talks.css";
import TalkCard from "../../components/talkCard/TalkCard";
import { talkSection } from "../../portfolio";

// Tóm tắt: Section talks legacy, render các buổi chia sẻ kỹ thuật khi cấu hình có dữ liệu.
export default function Talks() {
  return (
    <div className="main" id="talks">
      <div className="talk-header">
        <h1 className="talk-header-title">{talkSection.title}</h1>
        <p className="subTitle talk-header-subtitle">{talkSection.subtitle}</p>
        {talkSection.talks.map((talk) => {
          return (
            <TalkCard
              key={talk.title}
              talkDetails={{
                title: talk.title,
                subtitle: talk.subtitle,
                slides_url: talk.slides_url,
                event_url: talk.event_url,
                image: talk.image,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
