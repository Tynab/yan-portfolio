import React, { useState } from "react";
import "./Header.css";
import { Fade } from "react-awesome-reveal";
import { NavLink } from "react-router-dom";
import { greeting, settings } from "../../portfolio.js";
import SeoHeader from "../seoHeader/SeoHeader";

const navItems = [
  { path: "/home", label: "Home" },
  { path: "/certifications", label: "Certifications" },
  { path: "/experience", label: "Experience" },
  { path: "/projects", label: "Projects" },
];

// Tóm tắt: Header điều phối SEO metadata, logo và menu điều hướng chính.
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const link = settings.isSplash ? "/splash" : "/home";
  const closeMenu = () => setMenuOpen(false);

  return (
    <Fade direction="down" duration={1000} triggerOnce>
      <SeoHeader />
      <div>
        <header className="header">
          <NavLink to={link} className="logo" onClick={closeMenu}>
            <span> &lt;</span>
            <span className="logo-name">{greeting.logo_name}</span>
            <span>/&gt;</span>
          </NavLink>
          {/* Nút thật (thay cho checkbox ẩn) để bàn phím và screen reader mở được menu dưới 768px. */}
          <button
            type="button"
            className="menu-icon"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="navicon" aria-hidden="true"></span>
          </button>
          <nav aria-label="Primary">
            <ul
              id="primary-navigation"
              className={menuOpen ? "menu menu-open" : "menu"}
            >
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink to={item.path} onClick={closeMenu}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </header>
      </div>
    </Fade>
  );
}

export default Header;
