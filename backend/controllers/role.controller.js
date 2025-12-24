import { Role } from "../models/role.master.js";
import { User } from "../models/user.master.js"; // Import User for safety check

// 1. CREATE ROLE
export const createRole = async (req, res) => {
  try {
    // FIXED: Destructure 'role_name' (matching frontend), not 'roleName'
    const { role_name, description, screen_access } = req.body;

    if (!role_name) {
      return res.status(400).json({ message: "Role name is required" });
    }

    const existing = await Role.findOne({ role_name });
    if (existing) {
      return res.status(400).json({ message: "Role already exists" });
    }

    const role = await Role.create({
      role_name,
      description,
      // Ensure it's an array of strings
      screen_access: screen_access || [], 
      created_by: req.user.id
    });

    res.status(201).json({
      message: "Role created successfully",
      role
    });
  } catch (error) {
    console.error("Create Role Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 2. GET ALL ROLES
export const getAllRoles = async (req, res) => {
  try {
    // FIXED: Removed .populate("screen_access") because it's just an array of strings now.
    const roles = await Role.find(); 
    res.json({ roles }); // Ensure response structure matches frontend expectation
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. GET ROLE BY ID
export const getRoleById = async (req, res) => {
  try {
    // FIXED: Removed .populate("screen_access")
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. UPDATE ROLE
export const updateRole = async (req, res) => {
  try {
    // FIXED: Destructure 'role_name' to match frontend payload
    const { role_name, description, screen_access } = req.body;

    const updates = {};
    if (role_name !== undefined) updates.role_name = role_name;
    if (description !== undefined) updates.description = description;
    if (screen_access !== undefined) updates.screen_access = screen_access;

    updates.updated_by = req.user.id;

    // FIXED: Removed .populate("screen_access")
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json({
      message: "Role updated successfully",
      role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. DELETE ROLE
export const deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id;

    // A. Safety Check: Don't delete if Users are assigned
    // We check if any ACTIVE user has this role_id
    const usersWithRole = await User.countDocuments({ role_id: roleId, isActive: true });
    
    if (usersWithRole > 0) {
      return res.status(400).json({ 
        message: `Cannot delete: ${usersWithRole} user(s) are currently assigned this role.` 
      });
    }

    // B. Hard Delete (Actually remove it)
    // This fixes the issue where "Deleted" roles were still showing up
    const role = await Role.findByIdAndDelete(roleId);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};