import express from "express";
import { 
  applyDiscountToProduct, 
  getDiscountsByProduct, 
  removeDiscountFromProduct 
} from "../../controllers/productBundleDiscount.controller.js"; // Importing YOUR function names

import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

// 1. Create (Apply Discount)
router.post(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("PRODUCT_BUNDLE_DISCOUNT_CREATE"), 
  applyDiscountToProduct
);

// 2. Read (Get Active Discounts)
router.get(
  "/:productId",
  isAuthenticated,
  loadUserRoles,
  checkPermission("PRODUCT_BUNDLE_DISCOUNT_VIEW"),
  getDiscountsByProduct
);

// 3. Delete (Soft Remove)
router.delete(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("PRODUCT_BUNDLE_DISCOUNT_DELETE"),
  removeDiscountFromProduct
);

export default router;