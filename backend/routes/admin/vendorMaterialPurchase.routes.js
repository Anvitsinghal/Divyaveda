import express from "express";
import {
  createVendorMaterialPurchase,
  getAllVendorMaterialPurchases,
  getPurchasesByVendor
} from "../../controllers/vendorMaterialPurchase.controller.js";

import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

/* ========== CREATE VENDOR PURCHASE ========== */
router.post(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("VENDOR_PURCHASE_CREATE"),
  createVendorMaterialPurchase
);

/* ========== GET ALL PURCHASES ========== */
router.get(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("VENDOR_PURCHASE_VIEW"),
  getAllVendorMaterialPurchases
);

/* ========== GET PURCHASES BY VENDOR ========== */
router.get(
  "/vendor/:vendorId",
  isAuthenticated,
  loadUserRoles,
  checkPermission("VENDOR_PURCHASE_VIEW"),
  getPurchasesByVendor
);

export default router;
