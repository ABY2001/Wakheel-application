import mongoose from "mongoose";

const statutoryChallanSchema = new mongoose.Schema(
  {
    challanId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      default: "cs_1",
      index: true,
    },
    portal: {
      type: String,
      enum: ["MCA21", "GSTN", "CBDT_INCOME_TAX"],
      required: true,
      index: true,
    },
    challanType: {
      type: String,
      required: true,
      trim: true,
    },
    entityName: {
      type: String,
      required: true,
      trim: true,
    },
    cinOrPanOrGstin: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    financialYear: {
      type: String,
      default: "2025-26",
    },
    assessmentYear: {
      type: String,
      default: "2026-27",
    },
    filingForm: {
      type: String,
      required: true,
      trim: true, // "AOC-4", "MGT-7", "DIR-3 KYC", "GSTR-3B", "ITR-6", "MGT-14"
    },
    srnOrCpinOrCin: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    bsrCode: {
      type: String,
      default: "0290142", // 7 digits
    },
    challanSerialNumber: {
      type: String,
      default: "00124", // 5 digits
    },
    tenderedBank: {
      type: String,
      default: "State Bank of India (SBI)",
    },
    paymentMode: {
      type: String,
      enum: ["INTERNET_BANKING", "NEFT_RTGS", "DEBIT_CREDIT_CARD", "UPI"],
      default: "INTERNET_BANKING",
    },
    amountBreakdown: {
      baseFeeOrTax: { type: Number, default: 600 },
      additionalOrLateFee: { type: Number, default: 0 },
      interest: { type: Number, default: 0 },
      penalty: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
    },
    paymentStatus: {
      type: String,
      enum: ["GENERATED", "PAID", "EXPIRED", "FAILED"],
      default: "GENERATED",
      index: true,
    },
    paidAt: {
      type: String,
    },
    receiptNumber: {
      type: String,
    },
    dscSignatory: {
      type: String,
      default: "CS Rajesh Sharma (FCS-8921)",
    },
    clientBilled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

statutoryChallanSchema.index({ userId: 1, portal: 1 });
statutoryChallanSchema.index({ portal: 1, paymentStatus: 1 });
statutoryChallanSchema.index({ entityName: 1, filingForm: 1 });

export const StatutoryChallan =
  mongoose.models.StatutoryChallan ||
  mongoose.model("StatutoryChallan", statutoryChallanSchema);
