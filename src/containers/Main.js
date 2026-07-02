import React from "react";
import { Route, Routes, HashRouter } from "react-router-dom";
import Home from "../pages/home/HomeComponent";
import Splash from "../pages/splash/Splash";
import Education from "../pages/education/EducationComponent";
import Experience from "../pages/experience/Experience";
import Opensource from "../pages/opensource/Opensource";
import Contact from "../pages/contact/ContactComponent";
import Projects from "../pages/projects/Projects";
import { settings } from "../portfolio.js";
import Error404 from "../pages/errors/error404/Error";

// Tóm tắt: Router chính (v6) — chọn landing theo splash, còn lại là các route trang.
export default function Main({ theme }) {
  // isSplash đang tắt (false) nên "/" render thẳng Home; bật settings.isSplash để dùng màn splash làm landing.
  const Landing = settings.isSplash ? Splash : Home;
  return (
    <HashRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/" element={<Landing theme={theme} />} />
        <Route path="/home" element={<Home theme={theme} />} />
        <Route path="/experience" element={<Experience theme={theme} />} />
        <Route path="/education" element={<Education theme={theme} />} />
        <Route path="/opensource" element={<Opensource theme={theme} />} />
        <Route path="/contact" element={<Contact theme={theme} />} />
        <Route path="/projects" element={<Projects theme={theme} />} />
        {settings.isSplash && (
          <Route path="/splash" element={<Splash theme={theme} />} />
        )}
        {/* Catch-all: mọi path không khớp route nào ở trên đều rơi vào trang 404. */}
        <Route path="*" element={<Error404 theme={theme} />} />
      </Routes>
    </HashRouter>
  );
}
