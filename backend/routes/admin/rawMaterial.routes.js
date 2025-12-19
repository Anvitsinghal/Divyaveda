import express from "express";
import {
  createRawMaterial,
  getAllRawMaterials,
  updateRawMaterial,
  deleteRawMaterial
} from "../../controllers/rawMaterial.controller.js";

import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

/* ========== CREATE RAW MATERIAL ========== */
router.post(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("RAW_MATERIAL_CREATE"),
  createRawMaterial
);

/* ========== GET ALL RAW MATERIALS ========== */
router.get(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("RAW_MATERIAL_VIEW"),
  getAllRawMaterials
);

/* ========== UPDATE RAW MATERIAL ========== */
router.put(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("RAW_MATERIAL_UPDATE"),
  updateRawMaterial
);

/* ========== DELETE RAW MATERIAL (SOFT) ========== */
router.delete(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("RAW_MATERIAL_DELETE"),
  deleteRawMaterial
);

export default router;
