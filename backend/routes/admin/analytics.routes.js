import express from "express";
import {
  getUserSessions,
  getDailyActiveUsers,
  getUserLoginHistory
} from "../../controllers/userAnalysis.controller.js";

import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

/* ===== USER SESSION ANALYTICS ===== */
router.get(
  "/sessions",
  isAuthenticated,
  loadUserRoles,
  checkPermission("ANALYTICS_USER_VIEW"),
  getUserSessions
);

/* ===== DAILY ACTIVE USERS ===== */
router.get(
  "/daily-active-users",
  isAuthenticated,
  loadUserRoles,
  checkPermission("ANALYTICS_DAU_VIEW"),
  getDailyActiveUsers
);

/* ===== USER LOGIN HISTORY ===== */
router.get(
  "/login-history/:userId",
  isAuthenticated,
  loadUserRoles,
  checkPermission("ANALYTICS_USER_VIEW"),
  getUserLoginHistory
);

export default router;
