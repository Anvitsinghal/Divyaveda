import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    // --- Universal ---
    created_date: { type: String, default: "" },
    last_modified_date: { type: Date, default: Date.now },

    ad_name: { type: String, default: null },
    campaign_name: { type: String, default: null },
    platform: { type: String, default: "other" },

    business_type: { type: String, default: null },
    role: { type: String, default: null },

    full_name: { type: String, default: "Unknown" },
    email: { type: String, default: null },
    phone: { type: String, required: true, unique: true },

    location: { type: String, default: null },
    company: { type: String, default: null },

    // --- System ---
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assigned_date: { type: Date, default: null },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    converted_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // --- Status ---
    lead_status: { type: String, default: "NEW" },
    successfully_connected: { type: String, default: "Pending" },
    converted: { type: Boolean, default: false },

    // --- Qualification ---
    segment: { type: String, enum: ["pcd", "tp", "both"], default: null },
    interest_level: { type: String, enum: ["ni", "mi", "i", "hi"], default: null },
    req_time: { type: String, enum: ["imm", "1mon", "3mon", "future"], default: null },
    client_profile: {
      type: String,
      enum: [
        "distributor",
        "pcd aspirant",
        "brand owner",
        "retailer",
        "medical store",
        "doctor",
        "clinic",
        "others",
      ],
      default: null,
    },

    call_outcome: { type: String, default: null },
    last_followed_up: { type: Date, default: null },
    next_follow_up: { type: Date, default: null },

    days_since_last_followed_up: { type: Number, default: null },

    remarks: [
      {
        comment: String,
        date: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],

    source: { type: String, default: "MANUAL" },
    isActive: { type: Boolean, default: true },
    meta_data: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

/* ======================================================
   SAFE HOOKS (NO next(), NO async conflict)
====================================================== */

// ✅ SAVE
leadSchema.pre("save", function () {
  this.last_modified_date = new Date();

  if (this.last_followed_up) {
    this.days_since_last_followed_up = Math.floor(
      (Date.now() - new Date(this.last_followed_up)) / (1000 * 60 * 60 * 24)
    );
  } else {
    this.days_since_last_followed_up = null;
  }
});

// ✅ UPDATE
leadSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() || {};
  update.last_modified_date = new Date();

  if (update.last_followed_up) {
    update.days_since_last_followed_up = Math.floor(
      (Date.now() - new Date(update.last_followed_up)) / (1000 * 60 * 60 * 24)
    );
  }

  this.setUpdate(update);
});

export const Lead = mongoose.model("Lead", leadSchema);
