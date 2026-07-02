import React from "react";
import PageLayout from "../../components/pageLayout/PageLayout";
import OpensourceCharts from "../../containers/opensourceCharts/OpensourceCharts";
import Organizations from "../../containers/organizations/Organizations";
import PullRequests from "../../containers/pullRequests/PullRequests";
import Issues from "../../containers/issues/Issues";
import "./Opensource.css";

// Tóm tắt: Trang Open Source gom tổ chức, biểu đồ đóng góp, PR và issue.
function Opensource({ theme }) {
  return (
    <PageLayout theme={theme} className="opensource-main">
      <Organizations theme={theme} />
      <OpensourceCharts theme={theme} />
      <PullRequests theme={theme} />
      <Issues theme={theme} />
    </PageLayout>
  );
}

export default Opensource;
