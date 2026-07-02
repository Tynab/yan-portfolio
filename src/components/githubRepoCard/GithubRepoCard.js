import React from "react";
import ProjectLanguages from "../../components/projectLanguages/ProjectLanguages";
import "./GithubRepoCard.css";
import { Fade } from "react-awesome-reveal";

// Tóm tắt: Card repository tĩnh, dùng cho trang Projects và danh sách repo phụ.
export default function GithubRepoCard({ repo, theme }) {
  function openRepoInNewTab(url) {
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (win) {
      win.focus();
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openRepoInNewTab(repo.url);
    }
  }

  return (
    <div className="repo-card-div" style={{ backgroundColor: theme.highlight }}>
      <Fade direction="up" duration={2000} triggerOnce>
        <div
          role="button"
          tabIndex={0}
          onClick={() => openRepoInNewTab(repo.url)}
          onKeyDown={handleKeyDown}
        >
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
            <p className="repo-name" style={{ color: theme.text }}>
              {repo.name}
            </p>
          </div>
          <p className="repo-description" style={{ color: theme.text }}>
            {repo.description}
          </p>
          <div className="repo-details">
            <p
              className="repo-creation-date subTitle"
              style={{ color: theme.secondaryText }}
            >
              Created on {repo.createdAt?.split("T")[0]}
            </p>
            <ProjectLanguages
              className="repo-languages"
              logos={repo.languages || []}
            />
          </div>
        </div>
      </Fade>
    </div>
  );
}
