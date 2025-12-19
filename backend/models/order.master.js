import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // snapshot of delivery details at order time
    delivery_address: {
      type: String,
      required: true
    },

    phone_number: {
      type: String,
      required: true
    },

    total_amount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: [
        "PLACED",
        "PAID",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED"
      ],
      default: "PLACED"
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

export const Order = mongoose.model("Order", orderSchema);
