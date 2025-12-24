import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();
  if (loading) return <div>Loading...</div>;
  if (!admin) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return <Outlet />;
};

export default ProtectedRoute;

