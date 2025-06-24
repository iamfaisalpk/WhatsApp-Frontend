import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const { token, user, isAuthLoaded } = useSelector((state) => state.auth);

    useEffect(() => {
        console.log(" [ProtectedRoute]", { token, user, isAuthLoaded });
    }, [token, user, isAuthLoaded]);

    if (!isAuthLoaded) {
        return (
            <div className="flex flex-col justify-center items-center h-screen gap-2">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-500 border-solid"></div>
                <p className="text-sm text-gray-500">Loading...</p>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    if (!user?.name || !user?.profilePic) {
        return <Navigate to="/setup-profile" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
