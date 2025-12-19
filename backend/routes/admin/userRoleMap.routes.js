import express from "express";
import {
  assignRoleToUser,
  getUserRoles,
  removeRoleFromUser
} from "../../controllers/userRoleMap.controller.js";

import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

/* ================= ASSIGN ROLE TO USER ================= */
router.post(
  "/assign",
  isAuthenticated,
  loadUserRoles,
  checkPermission("USER_ROLE_ASSIGN"),
  assignRoleToUser
);

/* ================= GET ROLES OF A USER ================= */
router.get(
  "/:userId",
  isAuthenticated,
  loadUserRoles,
  checkPermission("USER_ROLE_VIEW"),
  getUserRoles
);

/* ================= REMOVE ROLE FROM USER ================= */
router.delete(
  "/remove",
  isAuthenticated,
  loadUserRoles,
  checkPermission("USER_ROLE_REMOVE"),
  removeRoleFromUser
);

export default router;
