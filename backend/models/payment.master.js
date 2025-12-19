import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },

    payment_method: {
      type: String,
      enum: ["CARD", "UPI", "NETBANKING", "COD"],
      required: true
    },

    payment_gateway: {
      type: String // Razorpay, Stripe, Paytm, etc.
    },

    transaction_id: {
      type: String,
      unique: true,
      sparse: true
    },

    amount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING"
    },

    paid_at: {
      type: Date
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

export const Payment = mongoose.model("Payment", paymentSchema);
