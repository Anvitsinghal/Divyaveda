import { Lead } from "../../models/lead.master.js";
import { Role } from "../../models/role.master.js";
import { User } from "../../models/user.master.js";

export const getAllLeads = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Fetch Role Name Correctly
    const currentUser = await User.findById(userId).populate("role_id");
    const userRole = currentUser.role_id?.role_name; 

    // Default Query: Active leads only
    let query = { isActive: true };

    // 2. VISIBILITY LOGIC
    if (userRole === "Staff") {
      query.$or = [
        { assigned_to: userId },
        { created_by: userId }
      ];
    }

    const leads = await Lead.find(query)
      .populate("assigned_to", "name email") // Ensures we get the Name/Email
      .populate("created_by", "name email")
      .sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. CREATE LEAD (Staff auto-assigns to self, Manager leaves unassigned)
export const createLead = async (req, res) => {
  try {
    const { client_name, contact_number, lead_type, company_name } = req.body;

    // Logic: If Staff creates it, assign to self. If Manager, keep null (to assign later).
    const isStaff = req.user.role_name === "Staff";

    const newLead = await Lead.create({
      client_name,
      contact_number,
      lead_type,
      company_name,
      created_by: req.user.id, // Always track who created it
      assigned_to: isStaff ? req.user.id : null, 
      isActive: true
    });

    res.status(201).json({ message: "Lead created successfully", lead: newLead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ... keep updateLead and getStaffMembers as they were ...
// 3. UPDATE LEAD (Bahut Critical Logic)
// Import these if missing


export const updateLead = async (req, res) => {
  try {
    const { status, comment, assigned_to } = req.body;
    const leadId = req.params.id;

    // 1. FETCH USER ROLE CORRECTLY
    // We need to know if the user is a "Manager" or "Staff"
    const currentUser = await User.findById(req.user.id).populate("role_id");
    const userRole = currentUser.role_id?.role_name; // Now this is "Manager"

    // 2. Find the Lead
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // 3. CHECK ADMIN RESTRICTION
    if (userRole === "Super Admin" || userRole === "Admin") {
      return res.status(403).json({ message: "Admins are View-Only. Cannot edit leads." });
    }

    // 4. MANAGER ASSIGNMENT LOGIC
    // Only run this if the logged-in user is actually a Manager
    if (userRole === "Manager") {
      if (assigned_to) {
        console.log(`✅ Manager assigning lead to: ${assigned_to}`); // Debug log
        lead.assigned_to = assigned_to;
      }
    }

    // 5. STAFF/MANAGER UPDATE LOGIC (Status & Comments)
    if (status) lead.status = status;
    
    if (comment) {
      lead.remarks.push({
        comment: comment,
        updated_by: req.user.id
      });
    }

    await lead.save();
    
    // Return the updated lead so frontend updates immediately
    res.json({ message: "Lead updated successfully", lead });

  } catch (error) {
    console.error("Update Lead Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getStaffMembers = async (req, res) => {
  try {
    // Find the Role ID for "Staff"
    const staffRole = await Role.findOne({ role_name: { $regex: /^staff$/i } });
    
    if (!staffRole) {
      return res.json([]); // No staff role defined yet
    }

    // Find Users with this Role
    const staff = await User.find({ role_id: staffRole._id, isActive: true })
      .select("name _id email");

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};