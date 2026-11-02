import mongoose from "mongoose";

const corporateContractSchema = new mongoose.Schema(
  {
    contractId: {
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    contractType: {
      type: String,
      enum: ["sha_ssa", "nda", "founders_agreement", "director_service", "commercial_lease", "vendor_msa", "ip_assignment"],
      default: "sha_ssa",
      index: true,
    },
    parties: {
      type: [String],
      required: true,
    },
    effectiveDate: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: String,
    },
    contractValue: {
      type: Number,
      default: 0,
    },
    stampDutyPaid: {
      type: Number,
      default: 500,
    },
    eStampCertificateNumber: {
      type: String,
      trim: true,
    },
    governingLaw: {
      type: String,
      default: "Laws of India (Exclusive Jurisdiction: New Delhi Courts)",
    },
    keyClauses: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["drafted", "under_negotiation", "executed", "stamped_registered", "expired"],
      default: "executed",
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

corporateContractSchema.index({ userId: 1, companyName: 1 });
corporateContractSchema.index({ userId: 1, contractType: 1 });

export const CorporateContract =
  mongoose.models.CorporateContract ||
  mongoose.model("CorporateContract", corporateContractSchema);
