import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Fade } from "react-awesome-reveal";
import "./IssueChart.css";
import IssueData from "../../shared/opensource/issues.json";

ChartJS.register(ArcElement, Tooltip, Legend);

const CHART_COLORS = ["#28a745", "#d73a49"];
const CHART_HOVER_COLORS = ["#28a745dd", "#d73a49dd"];

// Tóm tắt: Biểu đồ phân phối issue open/closed từ dữ liệu snapshot.
function IssueChart() {
  const data = {
    labels: ["Open", "Closed"],
    datasets: [
      {
        data: [IssueData["open"], IssueData["closed"]],
        backgroundColor: CHART_COLORS,
        hoverBackgroundColor: CHART_HOVER_COLORS,
      },
    ],
  };

  return (
    <div className="issue-chart">
      <Fade direction="up" duration={2000}>
        <h2 className="issue-chart-header">Issue Distribution</h2>
      </Fade>
      <Doughnut
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          animation: {
            duration: 4000,
          },
          plugins: {
            legend: {
              position: "top",
            },
          },
        }}
      />
    </div>
  );
}

export default IssueChart;
