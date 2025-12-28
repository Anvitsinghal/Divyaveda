import express from "express";
import { getAllLeads, createLead, updateLead ,getStaffMembers} from "../../controllers/admin/lead.controller.js";
import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";

const router = express.Router();

// 1. Get Staff List (Put this BEFORE dynamic IDs)
router.get("/staff", isAuthenticated, loadUserRoles, getStaffMembers); 

// 2. Standard Routes
router.get("/", isAuthenticated, loadUserRoles, checkPermission("LEAD_VIEW"), getAllLeads);
router.post("/", isAuthenticated, loadUserRoles, checkPermission("LEAD_CREATE"), createLead);
router.put("/:id", isAuthenticated, loadUserRoles, checkPermission("LEAD_UPDATE"), updateLead);

export default router;