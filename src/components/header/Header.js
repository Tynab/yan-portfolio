import React, { useEffect, useRef, useState } from "react";
import "./Header.css";
import { Fade } from "react-awesome-reveal";
import { Link, NavLink, useLocation } from "react-router-dom";
import { greeting } from "../../portfolio.js";
import SeoHeader from "../seoHeader/SeoHeader";

const navItems = [
  { path: "/home", label: "Home" },
  { path: "/certifications", label: "Certifications" },
  { path: "/experience", label: "Experience" },
  { path: "/projects", label: "Projects" },
  { path: "/contact", label: "Contact" },
];

// Tóm tắt: Header điều phối SEO metadata, logo và menu điều hướng chính.
function Header() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const toggleRef = useRef(null);
  const closeMenu = () => setMenuOpen(false);

  // Đổi route (kể cả Back/Forward) thì đóng menu: chỉnh state ngay khi render thay vì dùng effect.
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  // Escape đóng menu đang mở và trả focus về nút mở menu.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <Fade direction="down" duration={1000} triggerOnce>
      <SeoHeader />
      <div>
        <header className="header">
          {/* Link thường (không phải NavLink) để logo không bao giờ mang aria-current; luôn về /home. */}
          <Link to="/home" className="logo" onClick={closeMenu}>
            <span> &lt;</span>
            <span className="logo-name">{greeting.logo_name}</span>
            <span>/&gt;</span>
          </Link>
          {/* Nút thật (thay cho checkbox ẩn) để bàn phím và screen reader mở được menu dưới 768px. */}
          <button
            ref={toggleRef}
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
                  {/* end: chỉ khớp đúng path, không đánh dấu active cho route con. */}
                  <NavLink to={item.path} end onClick={closeMenu}>
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
