import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RequireAuth = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>; // Replace with a nice spinner later
    }

    return (
        user 
            ? <Outlet /> // Renders the child route (e.g., Profile, Checkout)
            : <Navigate to="/login" state={{ from: location }} replace />
    );
}

export default RequireAuth;