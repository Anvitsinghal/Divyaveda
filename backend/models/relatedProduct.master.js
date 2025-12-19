import mongoose from "mongoose";

const relatedProductSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    related_product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
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

// prevent same related product from being added twice
relatedProductSchema.index(
  { product_id: 1, related_product_id: 1 },
  { unique: true }
);

export const RelatedProduct = mongoose.model(
  "RelatedProduct",
  relatedProductSchema
);
