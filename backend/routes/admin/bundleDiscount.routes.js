import express from "express";
import {
  createBundleDiscount,
  getAllBundleDiscounts,
  updateBundleDiscount,
  deleteBundleDiscount
} from "../../controllers/bundleDiscount.controller.js";

import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

/* ================= CREATE BUNDLE DISCOUNT ================= */
router.post(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("BUNDLE_DISCOUNT_CREATE"),
  createBundleDiscount
);

/* ================= GET ALL BUNDLE DISCOUNTS ================= */
router.get(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("BUNDLE_DISCOUNT_VIEW"),
  getAllBundleDiscounts
);

/* ================= UPDATE BUNDLE DISCOUNT ================= */
router.put(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("BUNDLE_DISCOUNT_UPDATE"),
  updateBundleDiscount
);

/* ================= DELETE BUNDLE DISCOUNT ================= */
router.delete(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("BUNDLE_DISCOUNT_DELETE"),
  deleteBundleDiscount
);

export default router;
