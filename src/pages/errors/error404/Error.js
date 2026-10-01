import React from "react";
import { Fade } from "react-awesome-reveal";
import "../../../components/button/Button.css";
import "./Error.css";
import { Link } from "react-router-dom";
import PageTitle from "../../../components/seoHeader/PageTitle";

// Tóm tắt: Trang lỗi 404 giữ layout theme và CTA quay về Home.
function Error() {
  return (
    <div className="error-main">
      <PageTitle title="Page Not Found" />
      <div className="error-class">
        <Fade direction="up" duration={2000} triggerOnce>
          <h1>Oops</h1>
          <p className="error-404">404</p>
          <p>The requested page is unavailable at the moment!</p>
          <Link
            className="main-button"
            to="/home"
            style={{ display: "inline-flex" }}
          >
            Go Home
          </Link>
        </Fade>
      </div>
    </div>
  );
}

export default Error;
