import mongoose from "mongoose";

const taxAudit3CDSchema = new mongoose.Schema(
  {
    auditId: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    pan: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    financialYear: {
      type: String,
      required: true,
      default: "FY 2025-26",
    },
    assessmentYear: {
      type: String,
      required: true,
      default: "AY 2026-27",
    },
    auditType: {
      type: String,
      enum: ["tax_audit_44ab", "statutory_audit_143", "caro_2020"],
      default: "tax_audit_44ab",
      index: true,
    },
    turnover: {
      type: Number,
      default: 0,
    },
    grossProfitRatio: {
      type: Number,
      default: 0,
    },
    netProfitRatio: {
      type: Number,
      default: 0,
    },
    disallowanceSec43B: {
      type: Number,
      default: 0,
    },
    disallowanceSec40A3: {
      type: Number,
      default: 0,
    },
    disallowanceSec40aia: {
      type: Number,
      default: 0,
    },
    totalDisallowances: {
      type: Number,
      default: 0,
    },
    udin: {
      type: String,
      trim: true,
      uppercase: true,
    },
    caFirmName: {
      type: String,
      default: "",
    },
    caPartnerName: {
      type: String,
      default: "",
    },
    caMembershipNumber: {
      type: String,
      default: "",
    },
    caFirmRegistrationNumber: {
      type: String,
      default: "",
    },
    auditOpinion: {
      type: String,
      enum: ["unqualified_clean", "qualified", "adverse", "disclaimer"],
      default: "unqualified_clean",
    },
    status: {
      type: String,
      enum: ["in_progress", "draft_report", "udin_generated", "signed_uploaded"],
      default: "udin_generated",
      index: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

taxAudit3CDSchema.index({ userId: 1, pan: 1, assessmentYear: 1 });

export const TaxAudit3CD =
  mongoose.models.TaxAudit3CD ||
  mongoose.model("TaxAudit3CD", taxAudit3CDSchema);
