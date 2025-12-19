import mongoose from "mongoose";

const userRoleMapSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    created_by: {
      type: String,
      default: "system"
    },

    updated_by: {
      type: String
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

// optional but recommended: prevent duplicate active role assignments
userRoleMapSchema.index(
  { user_id: 1, role_id: 1 },
  { unique: true }
);

export const UserRoleMap = mongoose.model(
  "UserRoleMap",
  userRoleMapSchema
);
