import { Navigate, useLocation } from "react-router";

export const ProtectedRoute = ({ user, allowedRoles, children }) => {
    const location = useLocation();

    if (!user) {
        return <Navigate to="/sign-in" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export const GuestRoute = ({ user, children }) => {
    if (user) {
        return <Navigate to="/" replace />;
    }
    return children;
};