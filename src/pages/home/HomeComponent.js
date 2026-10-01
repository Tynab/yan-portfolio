import React from "react";
import Greeting from "../../containers/greeting/Greeting";
import Skills from "../../containers/skills/Skills";
import PageTitle from "../../components/seoHeader/PageTitle";

// Tóm tắt: Trang home ghép hero greeting và phần kỹ năng.
function Home({ theme }) {
  return (
    <>
      <PageTitle />
      <Greeting theme={theme} />
      <Skills theme={theme} />
    </>
  );
}

export default Home;
