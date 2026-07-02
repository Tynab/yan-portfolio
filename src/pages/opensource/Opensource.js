import React from "react";
import Header from "../../components/header/Header";
import OpensourceCharts from "../../containers/opensourceCharts/OpensourceCharts";
import Organizations from "../../containers/organizations/Organizations";
import PullRequests from "../../containers/pullRequests/PullRequests";
import Issues from "../../containers/issues/Issues";
import TopButton from "../../components/topButton/TopButton";
import "./Opensource.css";

// Tóm tắt: Trang Open Source gom tổ chức, biểu đồ đóng góp, PR và issue.
function Opensource({ theme }) {
  return (
    <div className="opensource-main">
      <Header theme={theme} />
      <Organizations theme={theme} />
      <OpensourceCharts theme={theme} />
      <PullRequests theme={theme} />
      <Issues theme={theme} />
      <TopButton theme={theme} />
    </div>
  );
}

export default Opensource;
