import { UserRoleMap } from "../models/userRoleMap.master.js";

export const loadUserRoles = async (req, res, next) => {
  try {
    // superadmin shortcut
    if (req.user.isSuperAdmin) {
      req.user.roles = ["superadmin"];
      return next();
    }

    const roles = await UserRoleMap.find({
      user_id: req.user.id,
      isActive: true
    }).populate("role_id", "roleName");

    req.user.roles = roles.map(r => r.role_id.roleName);

    next();
  } catch (error) {
    res.status(500).json({
      message: "Failed to load roles"
    });
  }
};
