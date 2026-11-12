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
      default: "",
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
      default: "",
    },
    caseNumber: {
      type: String,
      default: "",
    },
    cnrNumber: {
      type: String,
      trim: true,
      default: "",
    },
    courtForum: {
      type: String,
      default: "",
    },
    courtHall: {
      type: String,
      default: "",
    },
    bench: {
      type: String,
      default: "",
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
    stageIndex: {
      type: Number,
      default: 0,
    },
    stages: [{ type: mongoose.Schema.Types.Mixed }],
    documents: [{ type: mongoose.Schema.Types.Mixed }],
    queries: [{ type: mongoose.Schema.Types.Mixed }],
    clientAuthorization: { type: mongoose.Schema.Types.Mixed },
    trustDisbursement: { type: mongoose.Schema.Types.Mixed },
    udinOrSrn: { type: String },
    partnerNotes: { type: String },
    clientPanOrCin: { type: String },
    category: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Matter = mongoose.model("Matter", matterSchema);
