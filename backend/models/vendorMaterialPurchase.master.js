import mongoose from "mongoose";

const vendorMaterialPurchaseSchema = new mongoose.Schema(
  {
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true
    },

    material_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RawMaterial",
      required: true
    },

    quantity: {
      type: Number,
      required: true
    },

    unit_price: {
      type: Number
    },

    total_amount: {
      type: Number
    },

    bill_no: {
      type: String
    },

    // ✅ NEW FIELD
    bill_image: {
      type: String // store image URL / path (S3, Cloudinary, local)
    },

    payment_status: {
      type: String,
      enum: ["PENDING", "PAID", "PARTIAL"],
      default: "PENDING"
    },

    purchased_at: {
      type: Date,
      default: Date.now
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

export const VendorMaterialPurchase = mongoose.model(
  "VendorMaterialPurchase",
  vendorMaterialPurchaseSchema
);
