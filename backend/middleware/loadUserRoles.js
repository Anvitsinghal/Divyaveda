import { User } from "../models/user.master.js"; // Changed from UserRoleMap

export const loadUserRoles = async (req, res, next) => {
  try {
    // 1. Safety Check
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // 2. Fetch the User (specifically the role_id)
    const user = await User.findById(req.user.id).select("role_id isActive isSuperAdmin");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "User account is inactive" });
    }

    // 3. CRITICAL FIX: Attach the role_id to req.user
    // This allows checkPermission.js to find it immediately without re-fetching
    req.user.role_id = user.role_id; 
    
    // Optional: Pass the SuperAdmin flag along if needed
    req.user.isSuperAdmin = user.isSuperAdmin;

    next();
  } catch (error) {
    console.error("LoadUserRoles Error:", error);
    return res.status(500).json({
      message: "Failed to load user roles",
      error: error.message
    });
  }
};