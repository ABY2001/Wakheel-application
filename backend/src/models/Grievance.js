import mongoose from "mongoose";

const grievanceSchema = new mongoose.Schema(
  {
    citizenId: {
      type: mongoose.Schema.Types.Mixed,
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
      default: "Medium",
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
      riskScore: { type: String, default: "Moderate" },
      statutoryLimitation: { type: String, default: "As per Limitation Act, 1963" },
    },
    matchedAdvocates: [
      {
        id: { type: String },
        fullName: { type: String },
        barCouncilNumber: { type: String },
        specialization: [{ type: String }],
        chamberAddress: { type: String },
        consultationFee: { type: Number },
        rating: { type: Number },
        experience: { type: String },
        courts: [{ type: String }],
      },
    ],
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
