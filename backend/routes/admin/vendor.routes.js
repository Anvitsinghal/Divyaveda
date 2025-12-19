import express from "express";
import {
  createVendor,
  getAllVendors,
  updateVendor,
  deactivateVendor
} from "../../controllers/vendor.controller.js";

import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

router.post(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("VENDOR_CREATE"),
  createVendor
);

router.get(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("VENDOR_VIEW"),
  getAllVendors
);

router.put(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("VENDOR_UPDATE"),
  updateVendor
);

router.delete(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("VENDOR_DELETE"),
  deactivateVendor
);

export default router;
