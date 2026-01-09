import { B2B } from "../../models/b2b.master.js";
import { Lead } from "../../models/lead.master.js";
import { User } from "../../models/user.master.js";

/* ------------------ HELPERS ------------------ */

const isManagerOrAbove = (user) => {
  const roleName = user?.role_id?.role_name || "";
  return user?.isSuperAdmin === true || ["Manager", "Admin", "Super Admin"].includes(roleName);
};

const loadUserWithRole = async (req) => {
  return User.findById(req.user.id).populate("role_id");
};

/**
 * Leads visible to this user (ONLY converted + active)
 * (used only as an extra safety filter when needed)
 */
const getVisibleLeadIds = async (user) => {
  const query = {
    converted: true,
    isActive: true,
  };

  const leads = await Lead.find(query).select("_id");
  return leads.map((l) => l._id);
};

/* ------------------ LIST B2B ------------------ */

export const listB2B = async (req, res) => {
  try {
    const { 
      search, 
      order_status, 
      from_date, 
      to_date, 
      platform, 
      segment, 
      lead_id 
    } = req.query;

    const user = await User.findById(req.user.id).populate("role_id");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const roleName = user?.role_id?.role_name || "";
    const isManagerOrAbove =
      user.isSuperAdmin === true ||
      ["Manager", "Admin", "Super Admin"].includes(roleName);

    // 1. Initialize Query
    let query = {};

    // 2. Role-Based Security (Existing)
    if (!isManagerOrAbove) {
      query.converted_by = req.user.id;
    }

    // 3. Direct B2B Filters
    if (lead_id) query.lead_id = lead_id;
    if (order_status) query.order_status = order_status;

    // 4. Text Search (Client Name or Mobile)
    if (search) {
      query.$or = [
        { client_name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } }
      ];
    }

    // 5. Date Range Filter (on order_date)
    if (from_date || to_date) {
      query.order_date = {};
      if (from_date) query.order_date.$gte = new Date(from_date);
      if (to_date) query.order_date.$lte = new Date(to_date);
    }

    // 6. Lead-Related Filters (Platform/Segment)
    // Since these live on the Lead model, we find matching leads first
    if (platform || segment) {
      const leadCriteria = { converted: true };
      if (platform) leadCriteria.platform = platform;
      if (segment) leadCriteria.segment = segment;

      const matchingLeads = await Lead.find(leadCriteria).select("_id");
      const leadIds = matchingLeads.map(l => l._id);
      
      // Merge with existing query
      query.lead_id = { $in: leadIds };
    }

    // Execute Query
    const records = await B2B.find(query)
      .populate("lead_id")
      .populate("converted_by", "name email")
      .populate("created_by", "name email")
      .sort({ createdAt: -1 });

    res.json({ 
      data: records, 
      total: records.length 
    });
  } catch (error) {
    console.error("❌ listB2B error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* ------------------ CREATE B2B ------------------ */

export const createB2B = async (req, res) => {
  try {
    const user = await loadUserWithRole(req);
    const { lead_id } = req.body;

    if (!lead_id) {
      return res.status(400).json({ message: "lead_id is required" });
    }

    const existing = await B2B.findOne({ lead_id });
    

    const lead = await Lead.findById(lead_id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (!lead.converted) {
      return res.status(400).json({ message: "Lead is not converted" });
    }

    // Staff safety check
    if (
      !isManagerOrAbove(user) &&
      (!lead.assigned_to || lead.assigned_to.toString() !== req.user.id)
    ) {
      return res.status(403).json({ message: "Not allowed to create B2B for this lead" });
    }

    const record = await B2B.create({
      lead_id,
      client_name: lead.full_name,
      mobile: lead.phone,
      email: lead.email,
      company: lead.company,

      order_date: req.body.order_date || null,
      order_details: req.body.order_details || null,

      total_order_value: Number(req.body.total_order_value || 0),
      amount_received: Number(req.body.amount_received || 0),
      amount_pending:
        Number(req.body.total_order_value || 0) -
        Number(req.body.amount_received || 0),

      last_receipt_date: req.body.last_receipt_date || null,
      order_status: req.body.order_status || "OPEN",

      converted_by: lead.converted_by || req.user.id,
      created_by: lead.created_by || req.user.id,
      additional_remarks: req.body.additional_remarks || null,
    });

    res.status(201).json({ message: "B2B created", data: record });
  } catch (error) {
    console.error("CREATE B2B ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ------------------ UPDATE B2B ------------------ */

export const updateB2B = async (req, res) => {
  try {
    const b2bId = req.params.id;

    const record = await B2B.findById(b2bId)
      .populate("lead_id")
      .populate("converted_by", "name email")
      .populate("created_by", "name email");

    if (!record) {
      return res.status(404).json({ message: "B2B not found" });
    }

    // ❗ IMPORTANT:
    // Permission is ALREADY handled by allowB2BEdit middleware
    // DO NOT RECHECK PERMISSIONS HERE

    const updates = {};

    const allowedFields = [
      "order_date",
      "order_details",
      "total_order_value",
      "amount_received",
      "last_receipt_date",
      "order_status",
      "additional_remarks",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Auto-calc pending
    const total =
      updates.total_order_value ?? record.total_order_value ?? 0;
    const received =
      updates.amount_received ?? record.amount_received ?? 0;

    updates.amount_pending = total - received;

    const updated = await B2B.findByIdAndUpdate(
      b2bId,
      updates,
      { new: true }
    )
      .populate("lead_id")
      .populate("converted_by", "name email")
      .populate("created_by", "name email");

    res.json({
      message: "B2B updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Update B2B Error:", error);
    res.status(500).json({ message: error.message });
  }
};

