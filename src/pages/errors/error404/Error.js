import React from "react";
import Header from "../../../components/header/Header";
import TopButton from "../../../components/topButton/TopButton";
import { Fade } from "react-awesome-reveal";
import "./Error.css";
import { Link } from "react-router-dom";

// Tóm tắt: Trang lỗi 404 giữ layout theme và CTA quay về Home.
function Error({ theme }) {
  return (
    <div className="error-main">
      <Header theme={theme} />
      <div className="error-class">
        <Fade direction="up" duration={2000}>
          <h1>Woops</h1>
          <h1 className="error-404">404</h1>
          <p>The requested page is unavailable at the moment!</p>
          <Link
            className="main-button"
            to="/home"
            style={{
              color: theme.body,
              backgroundColor: theme.text,
              border: `solid 1px ${theme.text}`,
              display: "inline-flex",
            }}
          >
            Go Home
          </Link>
        </Fade>
      </div>
      <TopButton theme={theme} />
    </div>
  );
}

export default Error;
