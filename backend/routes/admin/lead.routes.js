import express from "express";
import multer from "multer"; // 1. Import Multer for file handling
import {
  getAllLeads,
  createLead,
  updateLead,
  getStaffMembers,
} from "../../controllers/admin/lead.controller.js";
import { importLeads } from "../../controllers/admin/import.controller.js"; // 2. Import the new Controller

import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";
import { syncGoogleSheetLeads } from "../../controllers/admin/lead.controller.js";
import { Lead } from "../../models/lead.master.js";


console.log("🔥 lead.routes.js LOADED");


const router = express.Router();

// 3. Configure Upload (Saves file temporarily to 'uploads/' folder)
const upload = multer({ dest: "uploads/" });

// --- ROUTES ---

// A. Get Staff List (Keep this at the top)
router.get("/staff", isAuthenticated, loadUserRoles, getStaffMembers); 

// B. Import Leads (NEW ROUTE)
// Placing it before /:id is safer practice
router.post(
  "/import", 
  isAuthenticated, 
  loadUserRoles, 
  // checkPermission("LEAD_CREATE"), // Optional: Uncomment if you want to restrict this to creators only
  upload.single("file"), // Middleware to process the Excel file
  importLeads
);

// Helper: allow assigned user OR manager/admin/super admin to edit
const allowLeadEdit = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id).select("assigned_to");
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const userId = String(req.user.id);

    // ✅ CORRECT ROLE RESOLUTION
    const roleName = req.user?.role_id?.role_name || "";
    const isManagerOrAbove =
      req.user?.isSuperAdmin === true ||
      ["Manager", "Admin", "Super Admin"].includes(roleName);

    // ✅ CORRECT ASSIGNED USER CHECK
    const isAssignedUser =
      lead.assigned_to && String(lead.assigned_to) === userId;

    // 🔐 FINAL PERMISSION CHECK
    if (!isManagerOrAbove && !isAssignedUser) {
      return res.status(403).json({
        message: "Permission Denied: You do not have access.",
      });
    }

    next();
  } catch (error) {
    console.error("❌ allowLeadEdit error:", error);
    res.status(500).json({ message: error.message });
  }
};


// C. Standard Routes
router.get(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("LEAD_VIEW"),
  getAllLeads
);
router.post(
  "/",
  isAuthenticated,
  loadUserRoles,
  checkPermission("LEAD_CREATE"),
  createLead
);
router.put(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  allowLeadEdit,
  updateLead
);
router.post(
  "/sync-sheet",
  (req, res, next) => {
    console.log("🔥 /sync-sheet ROUTE HIT");
    next();
  },
  isAuthenticated,
  loadUserRoles,
  (req, res, next) => {
    console.log("🔥 middlewares passed");
    next();
  },
  syncGoogleSheetLeads
);

export default router;