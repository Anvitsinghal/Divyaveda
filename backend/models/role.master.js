import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    role_name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    // which screens this role can access
    screen_access: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Screen"
      }
    ],

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

export const Role = mongoose.model("Role", roleSchema);
