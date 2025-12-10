import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';

interface RoleBasedRouteProps {
    allowedRoles: string[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles }) => {
    const { auth } = useAuth();
    const location = useLocation();

    return auth?.role && allowedRoles.includes(auth.role) ? (
        <Outlet />
    ) : auth?.accessToken ? (
        <Navigate to="/unauthorized" state={{ from: location }} replace />
    ) : (
        <Navigate to="/login" state={{ from: location }} replace />
    );
};

export default RoleBasedRoute;
