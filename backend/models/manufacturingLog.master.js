import mongoose from "mongoose";

const manufacturingLogSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    material_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RawMaterial",
      required: true
    },

    quantity_used: {
      type: Number,
      required: true
    },

    manufactured_qty: {
      type: Number,
      required: true
    },

    manufacturing_date: {
      type: Date,
      default: Date.now
    },

    remarks: {
      type: String
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

export const ManufacturingLog = mongoose.model(
  "ManufacturingLog",
  manufacturingLogSchema
);
