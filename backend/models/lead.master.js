import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  // Lead Basic Details
  client_name: { type: String, required: true },
  company_name: { type: String }, // B2B ke liye
  contact_number: { type: String, required: true },
  email: { type: String },
  lead_type: { 
    type: String, 
    enum: ["B2B", "B2C"], 
    required: true 
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ["NEW", "IN_PROGRESS", "FOLLOW_UP", "CLOSED_WON", "CLOSED_LOST"],
    default: "NEW"
  },
  
  // Important: Kisne create ki vs Kisko assign hui
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  // Manager is field ko update karega leads distribute karne ke liye
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // Comments / Call History
  remarks: [
    {
      comment: String,
      updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      date: { type: Date, default: Date.now }
    }
  ],

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Lead = mongoose.model("Lead", leadSchema);