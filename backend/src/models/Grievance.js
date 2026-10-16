import mongoose from "mongoose";

const grievanceSchema = new mongoose.Schema(
  {
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Grievance title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Grievance narrative is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Property & Land Disputes",
        "Criminal & Bail Matter",
        "Commercial & Contracts",
        "Family & Matrimonial",
        "Cheque Bounce (Sec 138 NI Act)",
        "Consumer Protection & Deficient Service",
        "Employment & Labour Grievance",
        "Constitutional & Writ Petition",
        "Motor Accident Claims (MACT)",
        "Cyber Crime & Financial Fraud",
        "Other Legal Matter",
      ],
      default: "Other Legal Matter",
    },
    jurisdictionDistrict: {
      type: String,
      default: "Ernakulam",
    },
    preferredCourt: {
      type: String,
      default: "High Court of Kerala / District Court",
    },
    urgencyLevel: {
      type: String,
      enum: ["Low (General Inquiry)", "Medium (Standard Filing)", "High (Upcoming Deadline)", "Urgent (Interim Stay Needed)"],
      default: "Medium (Standard Filing)",
    },
    status: {
      type: String,
      enum: ["submitted", "triage_analyzed", "counsel_matched", "matter_opened", "resolved", "closed"],
      default: "submitted",
    },
    aiTriage: {
      summary: { type: String, default: "" },
      applicableActs: [{ type: String }],
      suggestedRemedies: [{ type: String }],
      estimatedCourtFee: { type: String, default: "Standard Ad-valorem Court Fees" },
      recommendedSpecialization: { type: String, default: "General Civil / High Court Advocate" },
      jurisdictionForum: { type: String, default: "District Court / High Court" },
      riskScore: { type: String, enum: ["Low", "Moderate", "High"], default: "Moderate" },
    },
    matchedAdvocateIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    assignedAdvocateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    linkedMatterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Matter",
    },
    evidenceDocs: [
      {
        name: { type: String },
        size: { type: String },
        fileUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Grievance = mongoose.model("Grievance", grievanceSchema);
