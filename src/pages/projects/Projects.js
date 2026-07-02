import React from "react";
import PageLayout from "../../components/pageLayout/PageLayout";
import GithubRepoCard from "../../components/githubRepoCard/GithubRepoCard";
import Button from "../../components/button/Button";
import { Fade } from "react-awesome-reveal";
import { greeting, projectsHeader } from "../../portfolio.js";
import ProjectsData from "../../shared/opensource/projects.json";
import "./Projects.css";
import ProjectsImg from "./ProjectsImg";

// Tóm tắt: Trang Projects render danh sách repository nổi bật từ snapshot JSON nội bộ.
function Projects({ theme }) {
  return (
    <PageLayout theme={theme} className="projects-main">
      <div className="basic-projects">
        <Fade direction="up" duration={2000}>
          <div className="projects-heading-div">
            <div className="projects-heading-img-div">
              <ProjectsImg theme={theme} />
            </div>
            <div className="projects-heading-text-div">
              <h1
                className="projects-heading-text"
                style={{ color: theme.text }}
              >
                {projectsHeader.title}
              </h1>
              <p
                className="projects-header-detail-text subTitle"
                style={{ color: theme.secondaryText }}
              >
                {projectsHeader["description"]}
              </p>
            </div>
          </div>
        </Fade>
      </div>
      <div className="repo-cards-div-main">
        {ProjectsData.data.map((repo) => {
          return <GithubRepoCard key={repo.id} repo={repo} theme={theme} />;
        })}
      </div>
      <Button
        text={"More Projects"}
        className="project-button"
        href={greeting.github_repo}
        newTab={true}
        theme={theme}
      />
    </PageLayout>
  );
}

export default Projects;
