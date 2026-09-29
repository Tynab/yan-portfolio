import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes, HashRouter } from "react-router-dom";
import PageLayout from "../components/pageLayout/PageLayout";
import { settings } from "../portfolio.js";

// Mỗi trang là một chunk riêng: vào Home không phải tải SVG/ảnh của các trang khác.
const Home = lazy(() => import("../pages/home/HomeComponent"));
const Splash = lazy(() => import("../pages/splash/Splash"));
const Certifications = lazy(() =>
  import("../pages/certifications/CertificationsPage")
);
const Experience = lazy(() => import("../pages/experience/Experience"));
const Contact = lazy(() => import("../pages/contact/ContactComponent"));
const Projects = lazy(() => import("../pages/projects/Projects"));
const Error404 = lazy(() => import("../pages/errors/error404/Error"));

// Tóm tắt: Router chính (react-router v7) — layout route giữ Header/TopButton cố định, các trang render qua <Outlet/>.
export default function Main({ theme }) {
  return (
    <HashRouter>
      {/* Splash nằm ngoài layout route nên cần Suspense riêng khi được bật. */}
      <Suspense fallback={null}>
        <Routes>
          {settings.isSplash && (
            <Route path="/splash" element={<Splash theme={theme} />} />
          )}
          {/* "/" chuyển sang /home (hoặc /splash) để menu đánh dấu đúng mục Home. */}
          <Route
            path="/"
            element={
              <Navigate to={settings.isSplash ? "/splash" : "/home"} replace />
            }
          />
          <Route element={<PageLayout />}>
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
            <Route path="/contact" element={<Contact theme={theme} />} />
            <Route path="/projects" element={<Projects theme={theme} />} />
            {/* Catch-all: mọi path không khớp route nào ở trên đều rơi vào trang 404. */}
            <Route path="*" element={<Error404 />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
