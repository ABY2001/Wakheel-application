import mongoose from "mongoose";

const gstReturnSchema = new mongoose.Schema(
  {
    gstReturnId: {
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
    gstin: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    returnType: {
      type: String,
      enum: ["GSTR-1", "GSTR-3B", "GSTR-9", "GSTR-9C"],
      default: "GSTR-3B",
      index: true,
    },
    returnPeriod: {
      type: String,
      required: true,
      default: "October 2026",
    },
    dueDate: {
      type: String,
      required: true,
      default: "2026-11-20",
    },
    filingDate: {
      type: String,
    },
    taxableTurnover: {
      type: Number,
      default: 0,
    },
    igstAmount: {
      type: Number,
      default: 0,
    },
    cgstAmount: {
      type: Number,
      default: 0,
    },
    sgstAmount: {
      type: Number,
      default: 0,
    },
    totalTaxLiability: {
      type: Number,
      default: 0,
    },
    itcClaimed: {
      type: Number,
      default: 0,
    },
    itcAvailable2B: {
      type: Number,
      default: 0,
    },
    itcDifference: {
      type: Number,
      default: 0,
    },
    arn: {
      type: String, // Application Reference Number
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["pending_reconciliation", "ready_to_file", "filed", "overdue"],
      default: "ready_to_file",
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

gstReturnSchema.index({ userId: 1, gstin: 1, returnPeriod: 1 });

export const GstReturn =
  mongoose.models.GstReturn ||
  mongoose.model("GstReturn", gstReturnSchema);
