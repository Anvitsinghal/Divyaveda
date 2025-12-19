import express from "express";
import {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory
} from "../../controllers/subcategory.controller.js";

import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

/* ================= CREATE SUBCATEGORY ================= */
router.post(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("SUBCATEGORY_CREATE"),
  createSubCategory
);

/* ================= GET ALL SUBCATEGORIES ================= */
router.get(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("SUBCATEGORY_VIEW"),
  getAllSubCategories
);

/* ================= GET SUBCATEGORY BY ID ================= */
router.get(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("SUBCATEGORY_VIEW"),
  getSubCategoryById
);

/* ================= UPDATE SUBCATEGORY ================= */
router.put(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("SUBCATEGORY_UPDATE"),
  updateSubCategory
);

/* ================= DELETE SUBCATEGORY (SOFT) ================= */
router.delete(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("SUBCATEGORY_DELETE"),
  deleteSubCategory
);

export default router;
