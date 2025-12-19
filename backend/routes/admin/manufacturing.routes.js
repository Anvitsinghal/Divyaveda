import express from "express";
import {
  createManufacturingLog,
  getAllManufacturingLogs,
  getLogsByProduct
} from "../../controllers/manufacturing.controller.js";

import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

/* ========== CREATE MANUFACTURING ENTRY ========== */
router.post(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("MANUFACTURING_CREATE"),
  createManufacturingLog
);

/* ========== GET ALL MANUFACTURING LOGS ========== */
router.get(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("MANUFACTURING_VIEW"),
  getAllManufacturingLogs
);

/* ========== GET LOGS BY PRODUCT ========== */
router.get(
  "/product/:productId",
  isAuthenticated,
  loadUserRoles,
  checkPermission("MANUFACTURING_VIEW"),
  getLogsByProduct
);

export default router;
