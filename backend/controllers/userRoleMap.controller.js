import { UserRoleMap } from "../models/userRoleMap.master.js";
import { User } from "../models/user.master.js";
import { Role } from "../models/role.master.js";

export const assignRoleToUser = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;

    const user = await User.findById(user_id);
    if (!user || !user.isActive) {
      return res.status(404).json({
        message: "User not found or inactive"
      });
    }

    const role = await Role.findById(role_id);
    if (!role) {
      return res.status(404).json({
        message: "Role not found"
      });
    }

    const existing = await UserRoleMap.findOne({
      user_id,
      role_id,
      isActive: true
    });

    if (existing) {
      return res.status(400).json({
        message: "Role already assigned to user"
      });
    }

    const userRole = await UserRoleMap.create({
      user_id,
      role_id,
      isActive: true,
      created_by: req.user.id
    });

    res.status(201).json({
      message: "Role assigned successfully",
      userRole
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeRoleFromUser = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;

    const removedRole = await UserRoleMap.findOneAndUpdate(
      { user_id, role_id, isActive: true },
      {
        isActive: false,
        updated_by: req.user.id
      },
      { new: true }
    );

    if (!removedRole) {
      return res.status(404).json({
        message: "Active role mapping not found"
      });
    }

    const activeRoleCount = await UserRoleMap.countDocuments({
      user_id,
      isActive: true
    });

  
    if (activeRoleCount === 0) {
      const simpleUserRole = await Role.findOne({
        roleName: "simple_user"
      });

      if (!simpleUserRole) {
        return res.status(500).json({
          message: "simple_user role not configured"
        });
      }

      await UserRoleMap.create({
        user_id,
        role_id: simpleUserRole._id,
        isActive: true,
        created_by: req.user.id
      });
    }

    res.json({
      message: "Role removed successfully. User now has default role if needed."
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRolesByUser = async (req, res) => {
  try {
    const roles = await UserRoleMap.find({
      user_id: req.params.userId,
      isActive: true
    }).populate("role_id");

    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
