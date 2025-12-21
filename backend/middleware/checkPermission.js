import { Role } from "../models/role.master.js";
import { Screen } from "../models/screen.master.js";

export const checkPermission = (routeName) => {
  return async (req, res, next) => {
    try {
      // superadmin bypass
      if (req.user.isSuperAdmin) {
        return next();
      }

      // Ensure roles are loaded
      if (!req.user.roles || req.user.roles.length === 0) {
        return res.status(403).json({
          message: "No roles assigned. Access denied."
        });
      }

      // Find the screen that contains this route/permission
      const screen = await Screen.findOne({
        routes: routeName,
        isActive: true
      });

      if (!screen) {
        // If screen not found, allow access (permissive approach)
        // Or deny: return res.status(403).json({ message: "Permission not configured" });
        return next();
      }

      // Get all roles with their screen_access
      const userRoles = await Role.find({
        role_name: { $in: req.user.roles },
        isActive: true
      }).populate("screen_access");

      // Check if any of the user's roles have access to this screen
      const screenId = screen._id.toString();
      const hasAccess = userRoles.some(role => {
        if (!role.screen_access || !Array.isArray(role.screen_access)) {
          return false;
        }
        return role.screen_access.some(
          roleScreen => roleScreen._id.toString() === screenId
        );
      });

      if (!hasAccess) {
        return res.status(403).json({
          message: "Insufficient permissions. Access denied."
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Permission check failed",
        error: error.message
      });
    }
  };
};
