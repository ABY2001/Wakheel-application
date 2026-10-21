import mongoose from "mongoose";

const matterSchema = new mongoose.Schema(
  {
    citizenId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    assignedAdvocateId: {
      type: mongoose.Schema.Types.Mixed,
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
    caseTitle: {
      type: String,
      trim: true,
    },
    matterType: {
      type: String,
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
    bench: {
      type: String,
      default: "Division Bench",
    },
    petitioner: {
      type: String,
    },
    respondent: {
      type: String,
    },
    status: {
      type: String,
      default: "Admitted",
    },
    filingDate: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    nextHearingDate: {
      type: mongoose.Schema.Types.Mixed,
    },
    statutoryActs: [{ type: String }],
    timeline: [
      {
        date: { type: mongoose.Schema.Types.Mixed, default: Date.now },
        title: { type: String, required: true },
        remarks: { type: String, default: "" },
        orderCopyUrl: { type: String },
        stage: { type: String, default: "Completed" },
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
