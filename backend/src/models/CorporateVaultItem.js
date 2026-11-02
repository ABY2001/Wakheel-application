import mongoose from "mongoose";

const corporateVaultItemSchema = new mongoose.Schema(
  {
    vaultId: {
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
    docType: {
      type: String,
      enum: ["moa_aoa", "certificate_of_incorporation", "dsc_token", "pan_tan", "trademark_cert", "gst_reg"],
      default: "moa_aoa",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: String,
      default: "1.4 MB",
    },
    uploadedAt: {
      type: String,
      default: "2026-04-12",
    },
    validUntil: {
      type: String,
    },
    holderName: {
      type: String,
      default: "Company Master",
    },
    issuingAuthority: {
      type: String,
      default: "Registrar of Companies / e-Mudhra",
    },
    status: {
      type: String,
      enum: ["valid", "expiring_soon", "expired"],
      default: "valid",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

corporateVaultItemSchema.index({ userId: 1, companyName: 1 });

export const CorporateVaultItem =
  mongoose.models.CorporateVaultItem ||
  mongoose.model("CorporateVaultItem", corporateVaultItemSchema);
