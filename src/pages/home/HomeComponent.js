import React from "react";
import Greeting from "../../containers/greeting/Greeting";
import Skills from "../../containers/skills/Skills";

// Tóm tắt: Trang home ghép hero greeting và phần kỹ năng.
function Home({ theme }) {
  return (
    <>
      <Greeting theme={theme} />
      <Skills theme={theme} />
    </>
  );
}

export default Home;
