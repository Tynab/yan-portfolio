import React from "react";
import ProjectLanguages from "../../components/projectLanguages/ProjectLanguages";
import "./GithubRepoCard.css";
import { Fade } from "react-awesome-reveal";
import { toDomId } from "../../utils/domId";

// Tóm tắt: Card repository tĩnh cho trang Projects (dữ liệu từ snapshot projects.json).
export default function GithubRepoCard({ repo, theme }) {
  // Id cho tên/mô tả để <a> bọc cả card có accessible name ngắn gọn thay vì đọc toàn bộ nội dung card.
  const nameId = toDomId("repo-name", repo.id);
  const descriptionId = toDomId("repo-description", repo.id);
  // Ngày tạo hiển thị dạng "Feb 2025" (UTC để không lệch tháng theo múi giờ); thiếu ngày thì ẩn dòng này.
  const createdLabel = repo.createdAt
    ? new Date(repo.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;
  // Cả card là một <a> thật: vùng bấm phủ cả padding, hỗ trợ middle-click / mở tab mới / copy link.
  return (
    <a
      className="repo-card-div"
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-labelledby={nameId}
      aria-describedby={descriptionId}
      style={{ backgroundColor: theme.highlight }}
    >
      <Fade direction="up" duration={2000} triggerOnce>
        <div>
          <div className="repo-name-div">
            <svg
              aria-hidden="true"
              className="octicon repo-svg"
              height="16"
              role="img"
              viewBox="0 0 12 16"
              width="12"
            >
              <path
                fillRule="evenodd"
                d="M4 9H3V8h1v1zm0-3H3v1h1V6zm0-2H3v1h1V4zm0-2H3v1h1V2zm8-1v12c0 .55-.45 1-1 1H6v2l-1.5-1.5L3 16v-2H1c-.55 0-1-.45-1-1V1c0-.55.45-1 1-1h10c.55 0 1 .45 1 1zm-1 10H1v2h2v-1h3v1h5v-2zm0-10H2v9h9V1z"
              ></path>
            </svg>
            <p id={nameId} className="repo-name" style={{ color: theme.text }}>
              {repo.name}
              <span className="visually-hidden">
                {" "}
                (GitHub, opens in a new tab)
              </span>
            </p>
          </div>
          <p
            id={descriptionId}
            className="repo-description"
            style={{ color: theme.text }}
          >
            {repo.description}
          </p>
          <div className="repo-details">
            {createdLabel && (
              <p
                className="repo-creation-date subTitle"
                style={{ color: theme.text }}
              >
                Created {createdLabel}
              </p>
            )}
            <ProjectLanguages logos={repo.languages || []} />
          </div>
        </div>
      </Fade>
    </a>
  );
}
