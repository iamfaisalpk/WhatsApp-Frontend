import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const { token, user, isAuthLoaded } = useSelector((state) => state.auth);

    if (!isAuthLoaded) {
        console.log("ProtectedRoute: Waiting for auth to load...");
        return <div>Loading...</div>; 
    }

    if (!token) {
        console.log("ProtectedRoute: No token, redirecting to /auth.");
        return <Navigate to="/auth" replace />;
    }

    if (token && (!user?.name || !user?.profilePic)) {
        console.log("ProtectedRoute: Token exists, but profile not complete, redirecting to /setup-profile.");
        return <Navigate to="/setup-profile" replace />;
    }

    console.log("ProtectedRoute: Token and profile complete, rendering Outlet.");
    return <Outlet />;
};

export default ProtectedRoute;
