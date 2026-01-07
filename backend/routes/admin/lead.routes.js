import express from "express";
import multer from "multer"; // 1. Import Multer for file handling
import { 
  getAllLeads, 
  createLead, 
  updateLead, 
  getStaffMembers 
} from "../../controllers/admin/lead.controller.js";
import { importLeads } from "../../controllers/admin/import.controller.js"; // 2. Import the new Controller

import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";
import { syncGoogleSheetLeads } from "../../controllers/admin/lead.controller.js";


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

// C. Standard Routes
router.get("/", isAuthenticated, loadUserRoles, checkPermission("LEAD_VIEW"), getAllLeads);
router.post("/", isAuthenticated, loadUserRoles, checkPermission("LEAD_CREATE"), createLead);
router.put("/:id", isAuthenticated, loadUserRoles, checkPermission("LEAD_UPDATE"), updateLead);
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