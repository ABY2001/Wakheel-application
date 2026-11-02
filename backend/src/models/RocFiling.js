import mongoose from "mongoose";

const rocFilingSchema = new mongoose.Schema(
  {
    filingId: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      default: "cs_1",
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      default: "CyberCorp Technologies Pvt Ltd",
    },
    cin: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    formName: {
      type: String,
      required: true,
      trim: true,
      index: true, // "AOC-4", "MGT-7", "DIR-12", "PAS-3", "CHG-1", "CHG-4", "MGT-14", "DPT-3", "DIR-3 KYC"
    },
    formDescription: {
      type: String,
      required: true,
    },
    financialYear: {
      type: String,
      default: "FY 2025-26",
    },
    statutorySection: {
      type: String,
      default: "Section 137, Companies Act 2013",
    },
    dueDate: {
      type: String, // "YYYY-MM-DD"
      required: true,
      index: true,
    },
    filingDate: {
      type: String, // "YYYY-MM-DD"
    },
    status: {
      type: String,
      enum: ["drafted", "dsc_affixed", "uploaded_mca", "approved", "resubmission", "rejected", "overdue"],
      default: "drafted",
      index: true,
    },
    srn: {
      type: String, // Service Request Number
      trim: true,
      uppercase: true,
    },
    challanAmount: {
      type: Number,
      default: 600,
    },
    lateFeeAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "exempt"],
      default: "unpaid",
    },
    signatoryDin: {
      type: String,
    },
    signatoryName: {
      type: String,
    },
    pcsCertificateNumber: {
      type: String,
      default: "FCS 9482, CP 10293",
    },
    attachmentCount: {
      type: Number,
      default: 2,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

rocFilingSchema.index({ userId: 1, formName: 1 });
rocFilingSchema.index({ userId: 1, dueDate: 1 });

export const RocFiling =
  mongoose.models.RocFiling ||
  mongoose.model("RocFiling", rocFilingSchema);
