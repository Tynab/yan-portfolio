import React from "react";
import "./Header.css";
import { Fade } from "react-awesome-reveal";
import { NavLink } from "react-router-dom";
import { greeting, settings } from "../../portfolio.js";
import SeoHeader from "../seoHeader/SeoHeader";

const onMouseEnter = (event, color) => {
  const el = event.currentTarget;
  el.style.backgroundColor = color;
};

const onMouseOut = (event) => {
  const el = event.currentTarget;
  el.style.backgroundColor = "transparent";
};

const navItems = [
  { path: "/home", label: "Home" },
  { path: "/education", label: "Education" },
  { path: "/experience", label: "Experience" },
  { path: "/projects", label: "Projects" },
];

// Tóm tắt: Header điều phối SEO metadata, logo và menu điều hướng chính.
function Header({ theme }) {
  const link = settings.isSplash ? "/splash" : "/home";
  return (
    <Fade direction="down" duration={1000}>
      <SeoHeader />
      <div>
        <header className="header">
          <NavLink to={link} className="logo">
            <span style={{ color: theme.text }}> &lt;</span>
            <span className="logo-name" style={{ color: theme.text }}>
              {greeting.logo_name}
            </span>
            <span style={{ color: theme.text }}>/&gt;</span>
          </NavLink>
          <input className="menu-btn" type="checkbox" id="menu-btn" />
          <label className="menu-icon" htmlFor="menu-btn">
            <span className="navicon"></span>
          </label>
          <ul className="menu" style={{ backgroundColor: theme.body }}>
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  style={({ isActive }) => ({
                    color: theme.text,
                    fontWeight: isActive ? "bold" : "normal",
                  })}
                  onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
                  onMouseOut={onMouseOut}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </header>
      </div>
    </Fade>
  );
}

export default Header;
