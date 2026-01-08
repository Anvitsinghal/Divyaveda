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
      startDate, // Mapped from frontend 'from_date'
      endDate    // Mapped from frontend 'to_date'
    } = req.query;

    const query = { isActive: true };

    // 1. Text Search
    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    // 2. Dropdown Filters
    if (platform) query.platform = platform;
    if (segment) query.segment = segment;
    if (lead_status) query.lead_status = lead_status;
    if (client_profile) query.client_profile = client_profile;
    if (interest_level) query.interest_level = interest_level;
    if (req_time) query.req_time = req_time;

    // 3. Assignment Filter
    if (assigned === "assigned") {
      query.assigned_to = { $ne: null };
    } else if (assigned === "unassigned") {
      query.assigned_to = null;
    }

    // 4. ✅ DATE FIX: Filter by 'created_date' (String) instead of 'createdAt'
    // Since 'created_date' is stored as "YYYY-MM-DD", string comparison works perfectly.
    if (startDate || endDate) {
      query.created_date = {};
      if (startDate) {
        query.created_date.$gte = startDate; // e.g. "2025-10-01"
      }
      if (endDate) {
        query.created_date.$lte = endDate;   // e.g. "2025-10-31"
      }
    }

    // --- Execute Query ---
    // Sorted by created_date descending (newest leads first)
    const leads = await Lead.find(query)
      .populate("assigned_to", "name email")
      .populate("converted_by", "name email")
      .sort({ created_date: -1 }) 
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get Counts
    const total = await Lead.countDocuments(query);
    const convertedCount = await Lead.countDocuments({ ...query, converted: true });
    const pendingCount = await Lead.countDocuments({ ...query, converted: false });

    res.json({
      data: leads,
      total,
      convertedCount,
      pendingCount,
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
