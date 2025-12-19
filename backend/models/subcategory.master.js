import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
  {
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
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

// prevent duplicate subcategory names under same category
subcategorySchema.index(
  { category_id: 1, name: 1 },
  { unique: true }
);

export const SubCategory = mongoose.model(
  "SubCategory",
  subcategorySchema
);
