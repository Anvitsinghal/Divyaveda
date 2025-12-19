import mongoose from "mongoose";

const rawMaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    current_quantity: {
      type: Number,
      required: true,
      default: 0
    },

    unit: {
      type: String,
      required: true // kg, g, ml, liter, pieces
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

export const RawMaterial = mongoose.model(
  "RawMaterial",
  rawMaterialSchema
);
