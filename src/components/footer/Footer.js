import React from "react";
import "./Footer.css";
import { Fade } from "react-reveal";
import { greeting } from "../../portfolio.js";

// Tóm tắt: Footer nhỏ dùng theme phụ để hiển thị credit chủ portfolio.
export default function Footer(props) {
  return (
    <div className="footer-div">
      <Fade>
        <p className="footer-text" style={{ color: props.theme.secondaryText }}>
          Made with{" "}
          <span role="img" aria-label="love">
            ❤️
          </span>{" "}
          by {greeting.title}
        </p>
        {/* <ToggleSwitch theme={props.theme} onToggle={props.onToggle}/> */}
      </Fade>
    </div>
  );
}
