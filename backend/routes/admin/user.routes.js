import express from "express";
import { searchUsers,getAllUsers,assignRole } from "../../controllers/admin/user.controller.js";
import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

// Route: GET /api/admin/users/search?query=anvit
// Security: Only admins with ANALYTICS_USER_VIEW permission can search
router.get(
  "/search",
  isAuthenticated,
  loadUserRoles,
  checkPermission("ANALYTICS_USER_VIEW"), 
  searchUsers
);
router.get(
  "/", // This matches /admin/users
  isAuthenticated,
  loadUserRoles,
  checkPermission("USER_ROLE_VIEW"), // Ensure your Admin Role has this string!
  getAllUsers
);

// 2. Assign Role
router.post(
  "/assign", // This matches /admin/users/assign (or /admin/user-roles/assign depending on index.js)
  isAuthenticated,
  loadUserRoles,
  checkPermission("USER_ROLE_ASSIGN"), 
  assignRole
);
export default router;