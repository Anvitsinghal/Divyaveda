import { Lead } from "../../models/lead.master.js";
import { Role } from "../../models/role.master.js";
import { User } from "../../models/user.master.js";
import { fetchSheetRows } from "../../utils/googleSheet.js";
import { cleanLeadRow } from "../../utils/leadCleaner.js";

/* =====================================================
   1. GET ALL LEADS (Pagination + Filters + RBAC)
===================================================== */
export const getAllLeads = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentUser = await User.findById(userId).populate("role_id");

    const roleName = currentUser?.role_id?.role_name || "";
    const isManagerOrAbove =
      req.user.isSuperAdmin ||
      ["Manager", "Admin", "Super Admin"].includes(roleName);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    // 🔐 Visibility
    if (!isManagerOrAbove) {
      query.assigned_to = userId;
    }

    // Filters
    if (req.query.platform) query.platform = req.query.platform;
    if (req.query.segment) query.segment = req.query.segment;
    if (req.query.client_profile) query.client_profile = req.query.client_profile;
    if (req.query.lead_status) query.lead_status = req.query.lead_status;

    // Date filter
    if (req.query.from_date || req.query.to_date) {
      query.createdAt = {};
      if (req.query.from_date) query.createdAt.$gte = new Date(req.query.from_date);
      if (req.query.to_date) query.createdAt.$lte = new Date(req.query.to_date);
    }

    // Search
    if (req.query.search) {
      const s = req.query.search;
      query.$or = [
        { full_name: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
        { phone: { $regex: s, $options: "i" } }
      ];
    }

    const total = await Lead.countDocuments(query);
    const convertedCount = await Lead.countDocuments({ ...query, converted: true });

    const leads = await Lead.find(query)
      .populate("assigned_to", "name email")
      .populate("created_by", "name email")
      .populate("converted_by", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: leads,
      total,
      convertedCount,
      pendingCount: total - convertedCount,
      totalPages: Math.ceil(total / limit),
      page
    });
  } catch (error) {
    console.error("❌ Get Leads Error:", error);
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

    // ✅ 1. CLEAN EMPTY VALUES (Handle empty strings sent from frontend)
    // We do this for all potential fields to avoid DB errors
    const fieldsToClean = [
      "segment", "interest_level", "req_time", "client_profile", 
      "last_followed_up", "next_follow_up", "converted_by", "assigned_to"
    ];
    fieldsToClean.forEach((f) => {
      if (body[f] === "") body[f] = null;
    });

    const currentUser = await User.findById(req.user.id).populate("role_id");
    const roleName = currentUser?.role_id?.role_name || "";
    const isManagerOrAbove =
      currentUser?.isSuperAdmin ||
      ["Manager", "Admin", "Super Admin"].includes(roleName);

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const isAssignedUser =
      lead.assigned_to && lead.assigned_to.toString() === req.user.id;

    if (!isManagerOrAbove && !isAssignedUser) {
      return res.status(403).json({ message: "Not allowed to edit this lead" });
    }

    // ✅ 2. ASSIGNMENT LOGIC (Manager Only)
    if (Object.prototype.hasOwnProperty.call(body, "assigned_to") && isManagerOrAbove) {
      lead.assigned_to = body.assigned_to || null;
      // Only update assigned_date if it was actually changed to a user
      if (body.assigned_to) lead.assigned_date = new Date(); 
    }

    // ✅ 3. EXPANDED EDITABLE FIELDS 
    // I added full_name, phone, email, company, platform to this list
    const editableFields = [
      "full_name",       // <--- ADDED
      "phone",           // <--- ADDED
      "email",           // <--- ADDED
      "company",         // <--- ADDED
      "platform",        // <--- ADDED
      "segment",
      "interest_level",
      "req_time",
      "client_profile",
      "call_outcome",
      "last_followed_up",
      "next_follow_up",
      "location",
      "lead_status"
    ];

    editableFields.forEach((field) => {
      if (body[field] !== undefined) {
        lead[field] = body[field];
      }
    });

    // ✅ 4. REMARKS LOGIC
    if (body.remarks && body.remarks.trim() !== "") {
      lead.remarks.push({
        text: body.remarks, // Use 'text' or 'comment' depending on your Schema. usually 'text' is better
        by: req.user.id,
        date: new Date()
      });
    }

    // ✅ 5. CONVERSION LOGIC (THE FIX)
    if (isManagerOrAbove && (body.converted === true || body.converted === "true" || body.converted === false || body.converted === "false")) {
      
      const isConverting = body.converted === true || body.converted === "true";
      lead.converted = isConverting;

      if (isConverting) {
        // FIX: If frontend sent a specific person, use them. Otherwise use current user.
        if (body.converted_by) {
            lead.converted_by = body.converted_by;
        } else {
            lead.converted_by = req.user.id;
        }
        lead.converted_date = new Date();
      } else {
        // If un-converting (setting to false), clear these fields
        lead.converted_by = null;
        lead.converted_date = null;
      }
    }

    lead.last_modified_date = new Date();

    await lead.save();

    // Return the updated lead with populated names
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
