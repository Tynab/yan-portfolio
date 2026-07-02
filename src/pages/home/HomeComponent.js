import React from "react";
import Header from "../../components/header/Header";
import Greeting from "../../containers/greeting/Greeting";
import Skills from "../../containers/skills/Skills";
import TopButton from "../../components/topButton/TopButton";

// Tóm tắt: Trang home ghép header, hero greeting, kỹ năng và nút cuộn lên.
function Home({ theme }) {
  return (
    <div>
      <Header theme={theme} />
      <Greeting theme={theme} />
      <Skills theme={theme} />
      <TopButton theme={theme} />
    </div>
  );
}

export default Home;
