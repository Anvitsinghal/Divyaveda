import mongoose from "mongoose";

const productBundleDiscountSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    bundle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BundleDiscount",
      required: true
    },

    created_by: {
      type: String,
      default: "system"
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    }
  }
);

// prevent duplicate product–bundle mapping
productBundleDiscountSchema.index(
  { product_id: 1, bundle_id: 1 },
  { unique: true }
);

export const ProductBundleDiscount = mongoose.model(
  "ProductBundleDiscount",
  productBundleDiscountSchema
);
