import express from "express";
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct
} from "../../controllers/product.controller.js";

import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

router.post(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("PRODUCT_CREATE"),
  createProduct
);

router.get(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("PRODUCT_VIEW"),
  getAllProducts
);

router.put(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("PRODUCT_UPDATE"),
  updateProduct
);

router.delete(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("PRODUCT_DELETE"),
  deleteProduct
);

export default router;
