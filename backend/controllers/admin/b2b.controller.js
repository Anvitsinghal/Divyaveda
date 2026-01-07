import { B2B } from "../../models/b2b.master.js";
import { Lead } from "../../models/lead.master.js";
import { User } from "../../models/user.master.js";

/* ------------------ HELPERS ------------------ */

const isManagerOrAbove = (user) => {
  const roleName = user?.role_id?.role_name || "";
  return true;
};

const loadUserWithRole = async (req) => {
  return User.findById(req.user.id).populate("role_id");
};

/**
 * Leads visible to this user (ONLY converted leads)
 */
const getVisibleLeadIds = async (user) => {
  const query = {
    converted: true,
    isActive: true,
  };

  // Staff → only their assigned leads
  if (!isManagerOrAbove(user)) {
    query.assigned_to = user._id;
  }

  const leads = await Lead.find(query).select("_id");
  return leads.map((l) => l._id);
};

/* ------------------ LIST B2B ------------------ */

export const listB2B = async (req, res) => {
  try {
    const user = await loadUserWithRole(req);

    const allowedLeadIds = await getVisibleLeadIds(user);
    if (!allowedLeadIds.length) {
      return res.json({ data: [], total: 0 });
    }

    const records = await B2B.find({
      lead_id: { $in: allowedLeadIds },
    })
      .populate("lead_id")
      .populate("converted_by", "name email")
      .populate("created_by", "name email")
      .sort({ createdAt: -1 });

    // 🔥 VERY IMPORTANT: remove broken records
    const safeRecords = records.filter((r) => r.lead_id);

    res.json({
      data: safeRecords,
      total: safeRecords.length,
    });
  } catch (error) {
    console.error("LIST B2B ERROR:", error);
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
    const user = await loadUserWithRole(req);
    const record = await B2B.findById(req.params.id).populate("lead_id");

    if (!record) {
      return res.status(404).json({ message: "B2B not found" });
    }

    const lead = record.lead_id;
    const canEdit =
      isManagerOrAbove(user) ||
      (lead?.assigned_to && lead.assigned_to.toString() === req.user.id);

    if (!canEdit) {
      return res.status(403).json({ message: "Not allowed to edit this B2B" });
    }

    const updates = {
      total_order_value: record.total_order_value,
      amount_received: record.amount_received,
      ...req.body,
    };

    updates.amount_pending =
      Number(updates.total_order_value || 0) -
      Number(updates.amount_received || 0);

    const updated = await B2B.findByIdAndUpdate(
      record._id,
      updates,
      { new: true }
    )
      .populate("lead_id")
      .populate("converted_by", "name email")
      .populate("created_by", "name email");

    res.json({ message: "B2B updated", data: updated });
  } catch (error) {
    console.error("UPDATE B2B ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
