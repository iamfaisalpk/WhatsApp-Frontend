import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { token, user, isAuthLoaded, sessionRestoring } = useSelector(
    (state) => state.auth
  );

  if (!isAuthLoaded || sessionRestoring) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-2">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-500 border-solid"></div>
        <p className="text-sm text-gray-500">Restoring session...</p>
      </div>
    );
  }

  //  Don’t redirect while restoring
  if (!token && !sessionRestoring) {
    return <Navigate to="/auth" replace />;
  }

  const isProfileIncomplete = !user?.name || !user?.profilePic;
  if (isProfileIncomplete) {
    return <Navigate to="/setup-profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
