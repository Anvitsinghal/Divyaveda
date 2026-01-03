import { Lead } from "../../models/lead.master.js";
import { Role } from "../../models/role.master.js";
import { User } from "../../models/user.master.js";
import { fetchSheetRows } from "../../utils/googleSheet.js";
import { cleanLeadRow } from "../../utils/leadCleaner.js";

// ==========================================
// 1. GET ALL LEADS
// ==========================================
export const getAllLeads = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch User & Role
    const currentUser = await User.findById(userId).populate("role_id");
    
    if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
    }

    const userRole = currentUser.role_id?.role_name; 

    // Base Query
    let query = { isActive: true };

    // --- FILTER LOGIC ---
    const { source, status } = req.query; 
    
    if (source) query.source = source;
    if (status) query.lead_status = status; 

    // --- ROLE VISIBILITY ---
    if (userRole === "Staff") {
      query.$or = [
        { assigned_to: userId },
        { created_by: userId }
      ];
    }

    // Execute Query
    const leads = await Lead.find(query)
      .populate("assigned_to", "name email")
      .populate("created_by", "name email")
      .sort({ created_date: -1 });

    res.json(leads);
  } catch (error) {
    console.error("❌ Get Leads Error:", error); 
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// ==========================================
// 2. CREATE LEAD (Manual Entry)
// ==========================================
export const createLead = async (req, res) => {
  try {
    const { full_name, phone, email, platform, lead_status, company_name } = req.body;

    const currentUser = await User.findById(req.user.id).populate("role_id");
    const isStaff = currentUser.role_id?.role_name === "Staff";

    const newLead = await Lead.create({
      full_name,       
      phone,            
      email,
      platform,         
      company: company_name, 
      lead_status: lead_status || "NEW", 
      
      created_by: req.user.id,
      assigned_to: isStaff ? req.user.id : null, 
      isActive: true,
      source: "MANUAL"
    });

    res.status(201).json({ message: "Lead created successfully", lead: newLead });
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 3. UPDATE LEAD (FIXED ASSIGNMENT & PERMISSIONS)
// ==========================================
// ==========================================
// 3. UPDATE LEAD
// ==========================================
export const updateLead = async (req, res) => {
  try {
    const { lead_status, comment, assigned_to } = req.body;
    const leadId = req.params.id;

    // Fetch user details + Role
    const currentUser = await User.findById(req.user.id).populate("role_id");
    const userRole = currentUser.role_id?.role_name || "";
    const isSuperAdmin = currentUser.isSuperAdmin === true; // ✅ Explicit Flag Check

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // --- ASSIGNMENT LOGIC ---
    // We check if 'assigned_to' was sent in the request
    if (req.body.hasOwnProperty('assigned_to')) {
       // ✅ FIX: Allow if User is Super Admin (flag) OR has a Manager/Admin role
       if (isSuperAdmin || ["Manager", "Admin", "Super Admin"].includes(userRole)) {
          // If value is empty string "", set to NULL (Unassign)
          lead.assigned_to = assigned_to === "" ? null : assigned_to;
       }
    }

    // --- STATUS & REMARKS ---
    if (lead_status) lead.lead_status = lead_status;
    
    if (comment) {
      lead.remarks.push({
        comment: comment,
        date: new Date(),
        by: req.user.id
      });
    }

    await lead.save();
    
    // Return fresh data
    const updatedLead = await Lead.findById(leadId)
        .populate("assigned_to", "name email")
        .populate("created_by", "name email");

    res.json({ message: "Lead updated successfully", lead: updatedLead });

  } catch (error) {
    console.error("Update Lead Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 4. GET STAFF LIST
// ==========================================
// ==========================================
// 4. GET STAFF LIST (Updated: All Roles Except simple_user)
// ==========================================
export const getStaffMembers = async (req, res) => {
  try {
    // 1. Find all roles that are NOT "simple_user"
    // We use $regex to make it case-insensitive (matches "simple_user", "Simple_User", etc.)
    const eligibleRoles = await Role.find({ 
      role_name: { $not: { $regex: /^simple_user$/i } } 
    });

    if (!eligibleRoles.length) return res.json([]);

    // Get the IDs of these allowed roles
    const roleIds = eligibleRoles.map(r => r._id);

    // 2. Find Users who have these roles
    const staff = await User.find({ role_id: { $in: roleIds }, isActive: true })
      .select("name _id email role_id") // Fetch Role info too
      .populate("role_id", "role_name"); // Populate the role name for the UI

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 5. SYNC GOOGLE SHEET LEADS
// ==========================================
export const syncGoogleSheetLeads = async (req, res) => {
  try {
    const rows = await fetchSheetRows();
    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
      // Skip empty rows
      const hasAnyValue = row._rawData?.some(
        (cell) => cell && String(cell).trim() !== ""
      );
      if (!hasAnyValue) continue;

      const cleanLead = cleanLeadRow(row);
      if (!cleanLead) continue;

      const exists = await Lead.findOne({ phone: cleanLead.phone });
      if (exists) {
        skipped++;
        continue;
      }

      await Lead.create(cleanLead);
      inserted++;
    }

    res.json({
      message: `✅ Sheet Sync Complete | Inserted: ${inserted}, Skipped: ${skipped}`
    });

  } catch (error) {
    console.error("❌ Google Sheet Sync Error:", error);
    res.status(500).json({ message: "Google Sheet sync failed" });
  }
};