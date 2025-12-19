import mongoose from "mongoose";

const bundleDiscountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    discount_type: {
      type: String,
      enum: ["PERCENTAGE", "FLAT"],
      required: true
    },

    discount_value: {
      type: Number,
      required: true
    },

    min_products: {
      type: Number,
      default: 1
    },

    isActive: {
      type: Boolean,
      default: true
    },

    valid_from: {
      type: Date
    },

    valid_to: {
      type: Date
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

export const BundleDiscount = mongoose.model(
  "BundleDiscount",
  bundleDiscountSchema
);
