import express from "express";
import {
  createScreen,
  getAllScreens,
  getScreenById,
  updateScreen,
  deleteScreen
} from "../../controllers/screen.controller.js";

import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

/* ================= CREATE SCREEN ================= */
router.post(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("SCREEN_CREATE"),
  createScreen
);

/* ================= GET ALL SCREENS ================= */
router.get(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("SCREEN_VIEW"),
  getAllScreens
);

/* ================= GET SCREEN BY ID ================= */
router.get(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("SCREEN_VIEW"),
  getScreenById
);

/* ================= UPDATE SCREEN ================= */
router.put(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("SCREEN_UPDATE"),
  updateScreen
);

/* ================= DELETE SCREEN ================= */
router.delete(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("SCREEN_DELETE"),
  deleteScreen
);

export default router;
