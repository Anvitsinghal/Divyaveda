import express from "express";
import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";
import { listB2B, createB2B, updateB2B } from "../../controllers/admin/b2b.controller.js";

const router = express.Router();

router.get(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("B2B_VIEW"),
  listB2B
);

router.post(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("B2B_CREATE"),
  createB2B
);

router.put(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  checkPermission("B2B_UPDATE"),
  updateB2B
);

export default router;

