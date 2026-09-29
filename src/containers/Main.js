import React, { lazy } from "react";
import { Navigate, Route, Routes, HashRouter } from "react-router-dom";
import PageLayout from "../components/pageLayout/PageLayout";
import { settings } from "../portfolio.js";

// Mỗi trang là một chunk riêng: vào Home không phải tải chart.js (Opensource) hay SVG của Contact.
const Home = lazy(() => import("../pages/home/HomeComponent"));
const Splash = lazy(() => import("../pages/splash/Splash"));
const Certifications = lazy(() =>
  import("../pages/certifications/CertificationsPage")
);
const Experience = lazy(() => import("../pages/experience/Experience"));
const Opensource = lazy(() => import("../pages/opensource/Opensource"));
const Contact = lazy(() => import("../pages/contact/ContactComponent"));
const Projects = lazy(() => import("../pages/projects/Projects"));
const Error404 = lazy(() => import("../pages/errors/error404/Error"));

// Tóm tắt: Router chính (v6) — layout route giữ Header/TopButton cố định, các trang render qua <Outlet/>.
export default function Main({ theme }) {
  // isSplash đang tắt (false) nên "/" render thẳng Home; bật settings.isSplash để dùng màn splash làm landing.
  const Landing = settings.isSplash ? Splash : Home;
  return (
    <HashRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        {settings.isSplash && (
          <Route path="/" element={<Landing theme={theme} />} />
        )}
        {settings.isSplash && (
          <Route path="/splash" element={<Splash theme={theme} />} />
        )}
        <Route element={<PageLayout />}>
          {!settings.isSplash && (
            <Route path="/" element={<Landing theme={theme} />} />
          )}
          <Route path="/home" element={<Home theme={theme} />} />
          <Route path="/experience" element={<Experience theme={theme} />} />
          <Route
            path="/certifications"
            element={<Certifications theme={theme} />}
          />
          {/* Giữ link cũ (bookmark, kết quả tìm kiếm) từ trước khi đổi tên route. */}
          <Route
            path="/education"
            element={<Navigate to="/certifications" replace />}
          />
          <Route path="/opensource" element={<Opensource theme={theme} />} />
          <Route path="/contact" element={<Contact theme={theme} />} />
          <Route path="/projects" element={<Projects theme={theme} />} />
          {/* Catch-all: mọi path không khớp route nào ở trên đều rơi vào trang 404. */}
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
