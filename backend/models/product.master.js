import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    subcategory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true
    },

    description: {
      type: String
    },

    // main image shown on product card
    main_image: {
      type: String,
      
    },

    // additional product images (4–10)
    images: [
      {
        type: String
      }
    ],

    price: {
      type: Number,
      required: true
    },

    volume: {
      type: String // e.g. "200ml", "500g"
    },

    advantages: [
      {
        type: String
      }
    ],

    stock_quantity: {
      type: Number,
      default: 0
    },

    is_new_launch: {
      type: Boolean,
      default: false
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

export const Product = mongoose.model("Product", productSchema);
