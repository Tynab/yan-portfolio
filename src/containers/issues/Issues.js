import React from "react";
import "./Issues.css";
import { Fade } from "react-awesome-reveal";
import IssueCard from "../../components/issueCard/IssueCard";
import issuesData from "../../shared/opensource/issues.json";

// Tóm tắt: Section liệt kê issue open/closed đã đóng góp từ snapshot JSON.
function Issues({ theme }) {
  return (
    <div>
      <div className="issues-header-div">
        <Fade direction="up" duration={2000} triggerOnce>
          <h1 className="issues-header" style={{ color: theme.text }}>
            Issues
          </h1>
        </Fade>
      </div>
      <div className="issues-body-div">
        {issuesData["data"].map((issue) => {
          return <IssueCard key={issue.id} issue={issue} />;
        })}
      </div>
    </div>
  );
}

export default Issues;
