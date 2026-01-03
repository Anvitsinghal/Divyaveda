import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  // --- 1. Universal Columns ---
  created_date: { type: String, default: "" }, // Saved as String (e.g. "2025-10-09")
  
  ad_name: { type: String, default: null },
  campaign_name: { type: String, default: null },
  platform: { type: String, default: "other" },
  
  // Specific Headers from your Sheet 2
  business_type: { type: String, default: null }, // Mapped from 'what_type_of_business...'
  role: { type: String, default: null },          // Mapped from 'what_is_your_role...'
  
  full_name: { type: String, default: "Unknown" },
  email: { type: String, default: null },
  phone: { type: String, required: true, unique: true }, // UNIQUE KEY
  
  location: { type: String, default: null },
  company: { type: String, default: null },
  
  // --- 2. System Fields (CRITICAL) ---
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  assigned_date: { type: Date, default: null },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  // --- 3. Flexible Status ---
  lead_status: { type: String, default: "NEW" }, // No "Enum", accepts anything

  successfully_connected: { type: String, default: "Pending" },
  converted: { type: Boolean, default: false },
  
  remarks: [{
    comment: String,
    date: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  }],

  // --- 4. Data Storage ---
  source: { type: String, default: "MANUAL" },
  isActive: { type: Boolean, default: true },
  
  // Stores the entire raw Excel row for analysis
  meta_data: { type: mongoose.Schema.Types.Mixed } 

}, { timestamps: true });

export const Lead = mongoose.model("Lead", leadSchema);