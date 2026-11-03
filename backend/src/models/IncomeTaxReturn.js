import mongoose from "mongoose";

const incomeTaxReturnSchema = new mongoose.Schema(
  {
    itrId: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      default: "ca_1",
      index: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
      default: "CyberCorp Technologies Pvt Ltd",
    },
    pan: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    assessmentYear: {
      type: String,
      required: true,
      default: "AY 2026-27",
      index: true,
    },
    financialYear: {
      type: String,
      required: true,
      default: "FY 2025-26",
    },
    itrForm: {
      type: String,
      enum: ["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"],
      default: "ITR-6",
      index: true,
    },
    grossTotalIncome: {
      type: Number,
      default: 0,
    },
    deductionsChapterVIA: {
      type: Number,
      default: 0,
    },
    taxableIncome: {
      type: Number,
      default: 0,
    },
    taxPayable: {
      type: Number,
      default: 0,
    },
    tdsTcsCredit: {
      type: Number,
      default: 0,
    },
    advanceTaxPaid: {
      type: Number,
      default: 0,
    },
    selfAssessmentTax: {
      type: Number,
      default: 0,
    },
    refundDueOrPayable: {
      type: Number,
      default: 0,
    },
    aisReconciliationStatus: {
      type: String,
      enum: ["matched", "mismatched", "pending_review"],
      default: "matched",
    },
    filingDueDate: {
      type: String,
      default: "2026-10-31",
    },
    filingDate: {
      type: String,
    },
    acknowledgementNumber: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["drafted", "computed", "client_approved", "filed_verified", "processed_143_1", "defective_139_9"],
      default: "drafted",
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

incomeTaxReturnSchema.index({ userId: 1, pan: 1, assessmentYear: 1 });

export const IncomeTaxReturn =
  mongoose.models.IncomeTaxReturn ||
  mongoose.model("IncomeTaxReturn", incomeTaxReturnSchema);
