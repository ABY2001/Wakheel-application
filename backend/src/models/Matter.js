import mongoose from "mongoose";

const matterSchema = new mongoose.Schema(
  {
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedAdvocateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    advocateName: {
      type: String,
      default: "Adv. Meera Krishnan",
    },
    matterTitle: {
      type: String,
      required: true,
      trim: true,
    },
    matterType: {
      type: String,
      enum: ["Writ Petition (Civil)", "Bail Application", "Commercial Arbitration", "Civil Appeal", "Criminal Misc", "Original Petition", "Company Petition"],
      default: "Writ Petition (Civil)",
    },
    caseNumber: {
      type: String,
      default: "WP(C) 19482/2024",
    },
    cnrNumber: {
      type: String,
      trim: true,
      default: "KLHC01-019482-2024",
    },
    courtForum: {
      type: String,
      default: "High Court of Kerala (Ernakulam)",
    },
    courtHall: {
      type: String,
      default: "Court Hall 2A",
    },
    status: {
      type: String,
      enum: ["active", "stay_granted", "notice_issued", "hearing_scheduled", "reserved_for_orders", "disposed"],
      default: "active",
    },
    nextHearingDate: {
      type: Date,
    },
    statutoryActs: [{ type: String }],
    timeline: [
      {
        date: { type: Date, default: Date.now },
        title: { type: String, required: true },
        remarks: { type: String, default: "" },
        orderCopyUrl: { type: String },
        stage: { type: String, default: "In Progress" },
      },
    ],
    totalFeesBilled: {
      type: Number,
      default: 0,
    },
    feesPaid: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Matter = mongoose.model("Matter", matterSchema);
