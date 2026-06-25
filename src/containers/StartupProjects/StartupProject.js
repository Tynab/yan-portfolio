import React from "react";
import "./StartupProjects.css";
import { bigProjects } from "../../portfolio";

// Tóm tắt: Section startup project legacy, render logo dự án nổi bật nếu có cấu hình.
export default function StartupProject() {
  function openProjectInNewWindow(url) {
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (win) {
      win.focus();
    }
  }

  return (
    <div className="main" id="projects">
      <div>
        <h1 className="skills-heading">{bigProjects.title}</h1>
        <p className="subTitle project-subtitle">{bigProjects.subtitle}</p>
        <div className="startup-projects-main">
          <div className="startup-project-text">
            {bigProjects.projects.map((project) => {
              return (
                <div
                  key={project.link}
                  className="saaya-health-div"
                  role="button"
                  tabIndex={0}
                  onClick={() => openProjectInNewWindow(project.link)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openProjectInNewWindow(project.link);
                    }
                  }}
                >
                  <img alt="Saad Working" src={project.image}></img>
                </div>
              );
            })}
          </div>
          <div className="starup-project-image"></div>
        </div>
      </div>
    </div>
  );
}
