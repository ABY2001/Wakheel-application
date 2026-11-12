import mongoose from "mongoose";

const balanceSheetReconSchema = new mongoose.Schema(
  {
    reconId: {
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
    financialYear: {
      type: String,
      required: true,
      default: "FY 2025-26",
    },
    accountingStandard: {
      type: String,
      enum: ["AS", "Ind_AS"],
      default: "Ind_AS",
    },
    totalAssets: {
      type: Number,
      default: 0,
    },
    totalLiabilities: {
      type: Number,
      default: 0,
    },
    shareCapital: {
      type: Number,
      default: 0,
    },
    reservesAndSurplus: {
      type: Number,
      default: 0,
    },
    longTermBorrowings: {
      type: Number,
      default: 0,
    },
    tradePayables: {
      type: Number,
      default: 0,
    },
    tangibleFixedAssets: {
      type: Number,
      default: 0,
    },
    cashAndBank: {
      type: Number,
      default: 0,
    },
    bookDepreciationScheduleII: {
      type: Number,
      default: 0,
    },
    taxDepreciationRule5: {
      type: Number,
      default: 0,
    },
    depreciationDifference: {
      type: Number,
      default: 0,
    },
    deferredTaxAssetLiability: {
      type: Number,
      default: 0,
    },
    reconciliationNotes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["reconciled", "variance_detected", "under_audit"],
      default: "reconciled",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

balanceSheetReconSchema.index({ userId: 1, clientName: 1, financialYear: 1 });

export const BalanceSheetRecon =
  mongoose.models.BalanceSheetRecon ||
  mongoose.model("BalanceSheetRecon", balanceSheetReconSchema);
