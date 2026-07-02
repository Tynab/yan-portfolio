import React from "react";
import PageLayout from "../../components/pageLayout/PageLayout";
import Greeting from "../../containers/greeting/Greeting";
import Skills from "../../containers/skills/Skills";

// Tóm tắt: Trang home ghép header, hero greeting, kỹ năng và nút cuộn lên.
function Home({ theme }) {
  return (
    <PageLayout theme={theme}>
      <Greeting theme={theme} />
      <Skills theme={theme} />
    </PageLayout>
  );
}

export default Home;
