import { UserRoleMap } from "../models/userRoleMap.master.js";

export const loadUserRoles = async (req, res, next) => {
  try {
    // Ensure req.user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    // superadmin shortcut
    if (req.user.isSuperAdmin) {
      req.user.roles = ["superadmin"];
      return next();
    }

    const roles = await UserRoleMap.find({
      user_id: req.user.id,
      isActive: true
    }).populate("role_id", "role_name");

    req.user.roles = roles.map(r => r.role_id?.role_name).filter(Boolean);

    // Ensure roles is always an array
    if (!req.user.roles || req.user.roles.length === 0) {
      req.user.roles = [];
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load roles",
      error: error.message
    });
  }
};
