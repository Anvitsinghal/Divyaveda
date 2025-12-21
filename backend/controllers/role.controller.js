import { Role } from "../models/role.master.js";

export const createRole = async (req, res) => {
  try {
    const { roleName, description, screen_access } = req.body;

    const existing = await Role.findOne({ role_name: roleName });
    if (existing) {
      return res.status(400).json({
        message: "Role already exists"
      });
    }

    const role = await Role.create({
      role_name: roleName,
      description,
      screen_access,
      created_by: req.user.id
    });

    res.status(201).json({
      message: "Role created successfully",
      role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().populate("screen_access");
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).populate("screen_access");

    if (!role) {
      return res.status(404).json({
        message: "Role not found"
      });
    }

    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { roleName, description, screen_access } = req.body;

    const updates = {};
    if (roleName !== undefined) updates.role_name = roleName;
    if (description !== undefined) updates.description = description;
    if (screen_access !== undefined) updates.screen_access = screen_access;

    updates.updated_by = req.user.id;

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate("screen_access");

    if (!role) {
      return res.status(404).json({
        message: "Role not found"
      });
    }

    res.json({
      message: "Role updated successfully",
      role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updated_by: req.user.id },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({
        message: "Role not found"
      });
    }

    res.json({
      message: "Role deactivated successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
