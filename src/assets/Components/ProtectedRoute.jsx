import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const { token, user, isAuthLoaded, sessionRestoring } = useSelector(
    (state) => state.auth,
  );

  const location = useLocation();
  const isPreviewInviteRoute = location.pathname.startsWith("/preview");

  if (!isAuthLoaded || sessionRestoring) {
    return (
      <div
        style={{
          height: "100dvh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "3px solid rgba(255,255,255,0.05)",
            borderTop: "3px solid #bc1888",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Initializing Nexus
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Redirect to login if no token
  if (!token && !sessionRestoring) {
    return <Navigate to="/auth" replace />;
  }

  const isProfileIncomplete = !user?.name;
  if (isProfileIncomplete && !isPreviewInviteRoute) {
    return <Navigate to="/setup-profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
