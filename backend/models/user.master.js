import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },
role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role", // This allows .populate("role_id") to work
      default: null
    },
    phone_number: {
      type: String,
      required: true
    },

    address: {
      type: String
    },

    age: {
      type: Number
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"]
    },

    isActive: {
      type: Boolean,
      default: true
    },

    last_login: {
      type: Date
    },
    isSuperAdmin: {
  type: Boolean,
  default: false
},
isEmailVerified: {
  type: Boolean,
  default: false
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

export const User = mongoose.model("User", userSchema);
