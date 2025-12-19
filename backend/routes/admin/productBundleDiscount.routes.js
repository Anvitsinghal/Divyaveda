import express from "express";
import {
  applyDiscountToProduct,
  getDiscountsByProduct,
  removeDiscountFromProduct
} from "../../controllers/productBundleDiscount.controller.js";

import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

/* ================= APPLY DISCOUNT TO PRODUCT ================= */
router.post(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("PRODUCT_BUNDLE_DISCOUNT_CREATE"),
  applyDiscountToProduct
);

/* ================= GET DISCOUNTS BY PRODUCT ================= */
router.get(
  "/:productId",
  isAuthenticated,
  loadUserRoles,
  checkPermission("PRODUCT_BUNDLE_DISCOUNT_VIEW"),
  getDiscountsByProduct
);

/* ================= REMOVE DISCOUNT FROM PRODUCT ================= */
router.delete(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("PRODUCT_BUNDLE_DISCOUNT_DELETE"),
  removeDiscountFromProduct
);

export default router;
