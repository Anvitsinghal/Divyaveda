import { User } from "../models/user.master.js";
import { UserRoleMap } from "../models/userRoleMap.master.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const allowedFields = [
      "username",
      "email",
      "phone_number",
      "address",
      "age",
      "gender",
      "isActive"
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    updates.updated_by = req.user.id;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be boolean"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isActive,
        updated_by: req.user.id
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserRoles = async (req, res) => {
  try {
    const roles = await UserRoleMap.find({
      user_id: req.params.id,
      isActive: true
    }).populate("role_id");

    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
