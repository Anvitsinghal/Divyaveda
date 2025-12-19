import mongoose from "mongoose";

const userAnalysisSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    session_id: {
      type: String,
      required: true
    },

    login_time: {
      type: Date,
      default: Date.now
    },

    logout_time: {
      type: Date
    },

    last_active: {
      type: Date
    },

    ip_address: {
      type: String
    },

    user_agent: {
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
      updatedAt: false // we don't need updated_at here
    }
  }
);

export const UserAnalysis = mongoose.model(
  "UserAnalysis",
  userAnalysisSchema
);
