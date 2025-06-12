import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'; 
import { useSelector } from 'react-redux';

const ProtectedRoute = () => {
    const { success } = useSelector((state) => state.auth);
    const isAuthenticated = success === 'Login successful!';

    return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;