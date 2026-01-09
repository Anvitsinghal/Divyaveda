import { Lead } from "../../models/lead.master.js";
import { Role } from "../../models/role.master.js";
import { User } from "../../models/user.master.js";
import { fetchSheetRows } from "../../utils/googleSheet.js";
import { cleanLeadRow } from "../../utils/leadCleaner.js";
import { B2B } from "../../models/b2b.master.js";

/* =====================================================
   1. GET ALL LEADS (Pagination + Filters + RBAC)
===================================================== */
/* =====================================================
   1. GET ALL LEADS (Pagination + Filters + RBAC)
===================================================== */
export const getAllLeads = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search,
      platform,
      segment,
      lead_status,
      client_profile,
      interest_level,
      req_time,
      assigned,
      call_outcome, // NEW: Filter param
      startDate,
      endDate
    } = req.query;

    const query = { isActive: true };

    // ... (Keep existing Search, Dropdown, and Assignment logic) ...
    if (search) { /* ... */ }
    if (platform) query.platform = platform;
    if (segment) query.segment = segment;
    if (lead_status) query.lead_status = lead_status;
    if (client_profile) query.client_profile = client_profile;
    if (interest_level) query.interest_level = interest_level;
    if (req_time) query.req_time = req_time;
    if (call_outcome) query.call_outcome = call_outcome; // NEW: Filter logic

    // ... (Keep Date Fix and Role-based visibility logic) ...

    // --- Execute Query ---
    const leads = await Lead.find(query)
      .populate("assigned_to", "name email")
      .populate("converted_by", "name email")
      .sort({ created_date: -1 }) 
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // --- UPDATED COUNTS ---
    const total = await Lead.countDocuments(query);
    const convertedCount = await Lead.countDocuments({ ...query, converted: true });
    const pendingCount = await Lead.countDocuments({ ...query, converted: false });
    
    // NEW: Calculate specific counts for the summary cards
    const connectedCount = await Lead.countDocuments({ ...query, call_outcome: "connected" });
    const interestedCount = await Lead.countDocuments({ 
      ...query, 
      $or: [
        { lead_status: "INTERESTED" }, 
        { interest_level: { $in: ["i", "hi"] } } 
      ] 
    });

    res.json({
      data: leads,
      total,
      convertedCount,
      pendingCount,
      connectedCount, // Send to frontend
      interestedCount, // Send to frontend
      totalPages: Math.ceil(total / limit),
      page: Number(page)
    });
  } catch (error) {
    console.error("Get Leads Error:", error);
    res.status(500).json({ message: error.message });
  }
};
/* =====================================================
   2. CREATE LEAD (Manual)
===================================================== */
export const createLead = async (req, res) => {
  try {
    const { full_name, phone, email, platform, lead_status, company_name } = req.body;

    const currentUser = await User.findById(req.user.id).populate("role_id");
    const isStaff = currentUser?.role_id?.role_name === "Staff";

    const lead = await Lead.create({
      full_name,
      phone,
      email,
      platform,
      company: company_name,
      lead_status: lead_status || "NEW",
      created_by: req.user.id,
      assigned_to: isStaff ? req.user.id : null,
      source: "MANUAL",
      isActive: true
    });

    res.status(201).json({ message: "Lead created", lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   3. UPDATE LEAD (FIXED ENUM HANDLING)
===================================================== */
export const updateLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const body = { ...req.body };

    const currentUser = await User.findById(req.user.id).populate("role_id");
    if (!currentUser) return res.status(401).json({ message: "Unauthorized" });

    const roleName = currentUser.role_id?.role_name || "";
    const isManagerOrAbove =
      currentUser.isSuperAdmin === true ||
      ["Manager", "Admin", "Super Admin"].includes(roleName);
    const currentUserId = String(currentUser._id);

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // Permission Check
    const isAssignedUser = lead.assigned_to && String(lead.assigned_to) === currentUserId;
    if (!isManagerOrAbove && !isAssignedUser) {
      return res.status(403).json({ message: "Not allowed to edit this lead" });
    }

    // Clean empty values
    ["segment", "interest_level", "req_time", "client_profile", "last_followed_up", "next_follow_up", "converted_by"].forEach((field) => {
      if (body[field] === "") body[field] = null;
    });

    // Assignment (Manager only)
    if (isManagerOrAbove && Object.prototype.hasOwnProperty.call(body, "assigned_to")) {
      lead.assigned_to = body.assigned_to || null;
      lead.assigned_date = body.assigned_to ? new Date() : null;
    }

    // Editable Fields
    const editableFields = [
      "full_name", "phone", "email", "company", "platform", "segment",
      "interest_level", "req_time", "client_profile", "call_outcome",
      "last_followed_up", "next_follow_up", "location", "lead_status"
    ];
    editableFields.forEach((field) => {
      if (body[field] !== undefined) lead[field] = body[field];
    });

    // Remarks
    if (body.remarks && body.remarks.trim()) {
      lead.remarks.push({ comment: body.remarks, by: currentUserId, date: new Date() });
    }

    // Conversion Logic
    if (typeof body.converted === "boolean") {
      lead.converted = body.converted;
      if (body.converted) {
        // 🔥 FIX: Ensure we use the explicitly passed ID or current user ID
        lead.converted_by = body.converted_by || currentUserId;
        lead.converted_date = new Date();
      } else {
        lead.converted_by = null;
        lead.converted_date = null;
      }
    }

    lead.last_modified_date = new Date();
    await lead.save();

    // 🔥 AUTO CREATE B2B (Fixed Logic)
    if (lead.converted === true) {
      const existingB2B = await B2B.findOne({ lead_id: lead._id });
      if (!existingB2B) {
        await B2B.create({
          lead_id: lead._id,
          client_name: lead.full_name,
          mobile: lead.phone,
          email: lead.email,
          company: lead.company,
          // 🔥 IMPORTANT: Use the ID that was just saved to the lead
          converted_by: lead.converted_by, 
          created_by: currentUserId,
          order_status: "OPEN",
          total_order_value: 0,
          amount_received: 0,
        });
      }
    }

    const updatedLead = await Lead.findById(leadId)
      .populate("assigned_to", "name email")
      .populate("created_by", "name email")
      .populate("converted_by", "name email");

    res.json({ message: "Lead updated successfully", lead: updatedLead });
  } catch (error) {
    console.error("❌ Update Lead Error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   4. GET STAFF MEMBERS
===================================================== */
export const getStaffMembers = async (req, res) => {
  try {
    const roles = await Role.find({
      role_name: { $not: { $regex: /^simple_user$/i } }
    });

    const roleIds = roles.map((r) => r._id);

    const staff = await User.find({
      role_id: { $in: roleIds },
      isActive: true
    })
      .select("name email role_id")
      .populate("role_id", "role_name");

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   5. SYNC GOOGLE SHEET LEADS
===================================================== */
export const syncGoogleSheetLeads = async (req, res) => {
  try {
    const rows = await fetchSheetRows();
    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
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
      message: `✅ Sheet Sync Complete`,
      inserted,
      skipped
    });
  } catch (error) {
    console.error("❌ Google Sheet Sync Error:", error);
    res.status(500).json({ message: "Google Sheet sync failed" });
  }
};
