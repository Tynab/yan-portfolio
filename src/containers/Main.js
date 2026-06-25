import React from "react";
import { Route, Switch, HashRouter } from "react-router-dom";
import Home from "../pages/home/HomeComponent";
import Splash from "../pages/splash/Splash";
import Education from "../pages/education/EducationComponent";
import Experience from "../pages/experience/Experience";
import Opensource from "../pages/opensource/Opensource";
import Contact from "../pages/contact/ContactComponent";
import Projects from "../pages/projects/Projects";
import { settings } from "../portfolio.js";
import Error404 from "../pages/errors/error404/Error";

// Tóm tắt: Router chính gom mọi route, chọn landing page theo cấu hình splash.
const sharedRoutes = [
  { path: "/home", component: Home },
  { path: "/experience", exact: true, component: Experience },
  { path: "/education", component: Education },
  { path: "/opensource", component: Opensource },
  { path: "/contact", component: Contact },
  { path: "/projects", component: Projects },
];

function renderRoute({ path, exact = false, component: Component }, theme) {
  return (
    <Route
      key={path}
      path={path}
      exact={exact}
      render={(props) => <Component {...props} theme={theme} />}
    />
  );
}

export default function Main({ theme }) {
  const landingRoute = {
    path: "/",
    exact: true,
    component: settings.isSplash ? Splash : Home,
  };
  const splashRoute = settings.isSplash
    ? [{ path: "/splash", component: Splash }]
    : [];
  const routes = [landingRoute, ...sharedRoutes, ...splashRoute];

  return (
    <HashRouter basename="/">
      <Switch>
        {routes.map((route) => renderRoute(route, theme))}
        <Route
          path="*"
          render={(props) => <Error404 {...props} theme={theme} />}
        />
      </Switch>
    </HashRouter>
  );
}
