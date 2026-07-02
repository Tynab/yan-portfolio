import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Fade } from "react-awesome-reveal";
import "./PullRequestChart.css";
import PullRequestData from "../../shared/opensource/pull_requests.json";

ChartJS.register(ArcElement, Tooltip, Legend);

const CHART_COLORS = ["#28a745", "#6f42c1", "#d73a49"];
const CHART_HOVER_COLORS = ["#28a745dd", "#6f42c1dd", "#d73a49dd"];

// Tóm tắt: Biểu đồ phân phối trạng thái pull request từ dữ liệu snapshot.
function PullRequestChart() {
  const data = {
    labels: ["Open", "Merged", "Closed"],
    datasets: [
      {
        data: [
          PullRequestData["open"],
          PullRequestData["merged"],
          PullRequestData["closed"],
        ],
        backgroundColor: CHART_COLORS,
        hoverBackgroundColor: CHART_HOVER_COLORS,
      },
    ],
  };

  return (
    <div className="pr-chart">
      <Fade direction="up" duration={2000}>
        <h2 className="pr-chart-header">Pull Request Distribution</h2>
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

export default PullRequestChart;
