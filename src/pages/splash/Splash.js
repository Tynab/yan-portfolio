import React, { useState, useEffect } from "react";
import "./Splash.css";
import { Navigate } from "react-router-dom";
import LoaderLogo from "../../components/Loader/LoaderLogo.js";

// Tóm tắt: Splash hiển thị logo động rồi tự chuyển sang trang home.
function AnimatedSplash({ theme }) {
  return (
    <div className="logo_wrapper">
      <div className="screen" style={{ backgroundColor: theme.splashBg }}>
        <LoaderLogo id="logo" theme={theme} />
      </div>
    </div>
  );
}

function Splash({ theme }) {
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setRedirect(true), 5500);
    return () => clearTimeout(id);
  }, []);

  return redirect ? (
    <Navigate to="/home" replace />
  ) : (
    <AnimatedSplash theme={theme} />
  );
}

export default Splash;
