import { useAdminAuth } from "../context/AuthContext";

const PermissionGate = ({ routeName, children }) => {
  const { admin, permissions } = useAdminAuth();

  if (admin?.isSuperAdmin) return children;

  if (!permissions || !Array.isArray(permissions)) {
    return null;
  }

  const hasPermission = permissions.includes(routeName);
  
  if (hasPermission) {
    return children;
  }

  return null;
};

export default PermissionGate;