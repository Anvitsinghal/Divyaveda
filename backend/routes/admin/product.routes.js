import express from "express";
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct
} from "../../controllers/product.controller.js"; // Ensure path points to 'admin' folder if that's where it is
import { upload } from "../../middleware/fileUpload.js";
import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

// 1. Create Product (FIXED: Added upload middleware)
router.post(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("PRODUCT_CREATE"),
  // This processes the files so req.body and req.files are available in controller
  upload.fields([
    { name: "main_image", maxCount: 1 },
    { name: "images", maxCount: 10 }
  ]),
  createProduct
);

// 2. Read Products
router.get(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("PRODUCT_VIEW"),
  getAllProducts
);

// 3. Update Product (FIXED: Added upload middleware)
router.put(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("PRODUCT_UPDATE"),
  upload.fields([
    { name: "main_image", maxCount: 1 },
    { name: "images", maxCount: 10 }
  ]),
  updateProduct
);

// 4. Delete Product
router.delete(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("PRODUCT_DELETE"),
  deleteProduct
);

export default router;