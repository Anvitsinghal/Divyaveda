import express from "express";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
} from "../../controllers/category.controller.js";

import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

router.post(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("CATEGORY_CREATE"),
  createCategory
);

router.get(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("CATEGORY_VIEW"),
  getAllCategories
);

router.put(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("CATEGORY_UPDATE"),
  updateCategory
);

router.delete(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("CATEGORY_DELETE"),
  deleteCategory
);

export default router;
