import { Role } from "../models/role.master.js";
import { User } from "../models/user.master.js"; // <--- ADD THIS IMPORT

export const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // 1. Check if we already have the Role ID
      let userRoleId = req.user.role_id;
      let userRoleName = ""; // To store name for super admin check
          if (req.user.isSuperAdmin) {

        return next();

      }
      // ---------------------------------------------------------
      // 🚑 SELF-HEALING FIX: If Role ID is missing, fetch it now!
      // ---------------------------------------------------------
      if (!userRoleId) {
        console.log(`⚠️ Role ID missing for user ${req.user.id}. Fetching from DB...`);
        const user = await User.findById(req.user.id);
        
        if (!user || !user.role_id) {
           console.log("❌ Denied: User has no role assigned in DB.");
           return res.status(403).json({ message: "Access Denied: No Role Assigned" });
        }
        
        userRoleId = user.role_id; // Found it!
      }
      // ---------------------------------------------------------

      // 2. Fetch the Role Details (Permissions)
      const role = await Role.findById(userRoleId);

      if (!role) {
        console.log("❌ Denied: Role ID exists but Role not found in DB.");
        return res.status(403).json({ message: "Access Denied: Role not found" });
      }

      // 3. Super Admin Bypass
      if (role.role_name === "Super Admin") {
        return next();
      }

      // 4. CHECK PERMISSION
      if (role.screen_access && role.screen_access.includes(requiredPermission)) {
        return next(); // ✅ Success
      }

      // 5. Fail
      console.log(`❌ Denied: Role '${role.role_name}' lacks '${requiredPermission}'`);
      return res.status(403).json({ 
        message: `Access Denied: You need ${requiredPermission} permission.` 
      });

    } catch (error) {
      console.error("RBAC Error:", error);
      res.status(500).json({ message: "Server Error during permission check" });
    }
  };
};