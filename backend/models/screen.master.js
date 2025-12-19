import mongoose from "mongoose";

const screenSchema = new mongoose.Schema(
  {
    screen_name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    // all API routes that belong to this screen / feature
    routes: [
      {
        type: String,
        required: true
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

export const Screen = mongoose.model("Screen", screenSchema);
