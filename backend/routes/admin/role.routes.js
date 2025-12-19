import express from "express";
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole
} from "../../controllers/role.controller.js";

import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

/* ================= CREATE ROLE ================= */
router.post(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("ROLE_CREATE"),
  createRole
);

/* ================= GET ALL ROLES ================= */
router.get(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("ROLE_VIEW"),
  getAllRoles
);

/* ================= GET ROLE BY ID ================= */
router.get(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("ROLE_VIEW"),
  getRoleById
);

/* ================= UPDATE ROLE ================= */
router.put(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("ROLE_UPDATE"),
  updateRole
);

/* ================= DELETE ROLE ================= */
router.delete(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("ROLE_DELETE"),
  deleteRole
);

export default router;
