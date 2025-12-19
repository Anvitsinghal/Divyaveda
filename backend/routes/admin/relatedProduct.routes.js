import express from "express";
import {
  addRelatedProduct,
  getRelatedProducts,
  removeRelatedProduct
} from "../../controllers/relatedProduct.controller.js";

import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

/* ================= ADD RELATED PRODUCT ================= */
router.post(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("RELATED_PRODUCT_CREATE"),
  addRelatedProduct
);

/* ================= GET RELATED PRODUCTS BY PRODUCT ================= */
router.get(
  "/:productId",
  isAuthenticated,
  loadUserRoles,
  checkPermission("RELATED_PRODUCT_VIEW"),
  getRelatedProducts
);

/* ================= REMOVE RELATED PRODUCT ================= */
router.delete(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("RELATED_PRODUCT_DELETE"),
  removeRelatedProduct
);

export default router;
