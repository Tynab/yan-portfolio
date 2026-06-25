import React from "react";
import "./Project.css";
import GithubRepoCard from "../../components/githubRepoCard/GithubRepoCard";
import Button from "../../components/button/Button";
import { greeting } from "../../portfolio.js";
import ProjectsData from "../../shared/opensource/projects.json";

// Tóm tắt: Section project legacy dùng dữ liệu snapshot, tránh phụ thuộc token GitHub runtime.
export default function Projects({ theme }) {
  const repositories = ProjectsData.data || [];

  return (
    <div className="main" id="opensource">
      <h1 className="project-title">Open Source Projects</h1>
      <div className="repo-cards-div-main">
        {repositories.map((repo) => {
          return <GithubRepoCard repo={repo} key={repo.id} theme={theme} />;
        })}
      </div>
      <Button
        text={"More Projects"}
        className="project-button"
        href={greeting.github_repo}
        newTab={true}
        theme={theme}
      />
    </div>
  );
}
