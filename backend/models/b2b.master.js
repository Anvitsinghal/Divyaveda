import mongoose from "mongoose";

const b2bSchema = new mongoose.Schema(
  {
    lead_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      unique: true,
      required: true,
    },
    sr_no: { type: Number, unique: true },

    client_name: { type: String, default: null },
    mobile: { type: String, default: null },
    email: { type: String, default: null },
    company: { type: String, default: null },

    order_date: { type: Date, default: null },
    order_details: { type: String, default: null },
    total_order_value: { type: Number, default: 0 },
    amount_received: { type: Number, default: 0 },
    last_receipt_date: { type: Date, default: null },
    amount_pending: { type: Number, default: 0 },
    order_status: { type: String, default: "OPEN" },

    converted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    additional_remarks: { type: String, default: null },
  },
  { timestamps: true }
);

//
// ✅ DOCUMENT MIDDLEWARE — OK to use next()
//
b2bSchema.pre("save", async function () {
  // auto sr_no
  if (!this.sr_no) {
    const last = await this.constructor.findOne().sort({ sr_no: -1 }).lean();
    this.sr_no = last?.sr_no ? last.sr_no + 1 : 1;
  }

  // auto pending
  this.amount_pending =
    (this.total_order_value || 0) - (this.amount_received || 0);
});

//
// ✅ QUERY MIDDLEWARE — DO NOT use next()
// 
b2bSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() || {};

  const total =
    update.total_order_value ?? update.$set?.total_order_value;
  const received =
    update.amount_received ?? update.$set?.amount_received;

  if (typeof total !== "undefined" || typeof received !== "undefined") {
    const t =
      typeof total !== "undefined"
        ? total
        : this._update.total_order_value || 0;

    const r =
      typeof received !== "undefined"
        ? received
        : this._update.amount_received || 0;

    this.set({ amount_pending: t - r });
  }
});

export const B2B = mongoose.model("B2B", b2bSchema);
