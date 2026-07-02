import React from "react";
import PullRequestChart from "../../components/pullRequestChart/PullRequestChart.js";
import IssueChart from "../../components/issueChart/IssueChart.js";
import { Fade } from "react-awesome-reveal";
import "./OpensourceCharts.css";

// Tóm tắt: Gom hai biểu đồ doughnut cho pull request và issue.
function OpensourceCharts({ theme }) {
  return (
    <div className="main-div">
      <div className="os-charts-header-div">
        <Fade direction="up" duration={2000} triggerOnce>
          <h1 className="os-charts-header" style={{ color: theme.text }}>
            Contributions
          </h1>
        </Fade>
      </div>
      <div className="os-charts-body-div">
        <PullRequestChart />
        <IssueChart />
      </div>
    </div>
  );
}

export default OpensourceCharts;
