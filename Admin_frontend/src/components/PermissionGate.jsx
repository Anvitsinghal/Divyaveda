import { useAdminAuth } from "../context/AuthContext";

const PermissionGate = ({ routeName, children }) => {
  // 1. Destructure 'permissions' (the flat array we created in AuthContext)
  const { admin, permissions } = useAdminAuth();

  // 2. SuperAdmin Override (Always allow)
  if (admin?.isSuperAdmin) return children;

  // 3. Safety Check: If permissions aren't loaded yet, hide content
  if (!permissions || !Array.isArray(permissions)) return null;

  // 4. Simple Check: Does the list contain the requested permission?
  // This matches the string (e.g., "CATEGORY_CREATE") passed as routeName
  if (permissions.includes(routeName)) {
    return children;
  }

  // 5. If not found, hide the UI (return null)
  return null;
};

export default PermissionGate;