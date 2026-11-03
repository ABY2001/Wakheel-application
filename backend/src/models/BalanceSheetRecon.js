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
      default: "ca_1",
      index: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
      default: "CyberCorp Technologies Pvt Ltd",
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
      default: 45000000,
    },
    totalLiabilities: {
      type: Number,
      default: 45000000,
    },
    shareCapital: {
      type: Number,
      default: 2500000,
    },
    reservesAndSurplus: {
      type: Number,
      default: 18500000,
    },
    longTermBorrowings: {
      type: Number,
      default: 12000000,
    },
    tradePayables: {
      type: Number,
      default: 6500000,
    },
    tangibleFixedAssets: {
      type: Number,
      default: 22000000,
    },
    cashAndBank: {
      type: Number,
      default: 8400000,
    },
    bookDepreciationScheduleII: {
      type: Number,
      default: 2800000,
    },
    taxDepreciationRule5: {
      type: Number,
      default: 3450000,
    },
    depreciationDifference: {
      type: Number,
      default: 650000, // Timing difference for Deferred Tax
    },
    deferredTaxAssetLiability: {
      type: Number,
      default: -163800, // Negative for DTL at 25.17% corporate tax rate
    },
    reconciliationNotes: {
      type: String,
      default: "Depreciation timing differences reconciled under Ind AS 12. Book profit adjusted for MAT under Section 115JB.",
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
