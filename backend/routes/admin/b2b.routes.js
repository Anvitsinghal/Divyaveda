import express from "express";
import { isAuthenticated } from "../../middleware/isAuthenticated.js";
import { loadUserRoles } from "../../middleware/loadUserRoles.js";
import { checkPermission } from "../../middleware/checkPermission.js";
import {
  listB2B,
  createB2B,
  updateB2B,
} from "../../controllers/admin/b2b.controller.js";
import { B2B } from "../../models/b2b.master.js";

const router = express.Router();

/**
 * ✅ Allow Editing If:
 * 1. Manager/Admin/SuperAdmin
 * 2. User is the one who converted the lead (converted_by)
 * 3. User is currently assigned to the lead (assigned_to)
 */
const allowB2BEdit = async (req, res, next) => {
  try {
    const b2bId = req.params.id;
    // We need lead_id to check assigned_to
    const record = await B2B.findById(b2bId).populate("lead_id");
    
    if (!record) {
      return res.status(404).json({ message: "B2B not found" });
    }

    const user = req.user;
    const currentUserId = String(user.id);
    const roleName = user?.role_name || user?.role;
    
    // 1. Check Admin Roles
    const isManagerOrAbove = user?.isSuperAdmin === true || 
      ["Manager", "Admin", "Super Admin"].includes(roleName);

    if (isManagerOrAbove) return next();

    // 2. Check Converted By
    // record.converted_by is an ObjectId in DB, convert to String for comparison
    const isConvertedUser = record.converted_by && String(record.converted_by) === currentUserId;

    // 3. Check Assigned User (on the parent lead)
    const isAssignedUser = record.lead_id?.assigned_to && String(record.lead_id.assigned_to) === currentUserId;

    if (isConvertedUser || isAssignedUser) {
      return next();
    }

    return res.status(403).json({ message: "Access denied: not allowed to edit this B2B" });
  } catch (error) {
    console.error("allowB2BEdit Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// =======================
// ROUTES
// =======================

router.get("/", isAuthenticated, loadUserRoles, checkPermission("B2B_VIEW"), listB2B);
router.post("/", isAuthenticated, loadUserRoles, checkPermission("B2B_CREATE"), createB2B);

// 🔥 The Middleware here is key
router.put(
  "/:id",
  isAuthenticated,
  loadUserRoles,
  allowB2BEdit, 
  updateB2B
);

export default router;