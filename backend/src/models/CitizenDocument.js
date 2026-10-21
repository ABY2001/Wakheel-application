import mongoose from "mongoose";

const citizenDocumentSchema = new mongoose.Schema(
  {
    citizenId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    matterId: {
      type: mongoose.Schema.Types.Mixed,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Evidence & Exhibits",
    },
    subType: {
      type: String,
      default: "all",
    },
    matter: {
      type: String,
      default: "General Legal Vault",
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: String,
      default: "1.2 MB",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    pages: {
      type: Number,
      default: 1,
    },
    sha256Hash: {
      type: String,
      default: "",
    },
    isSigned: {
      type: Boolean,
      default: true,
    },
    signedAt: {
      type: Date,
      default: Date.now,
    },
    signatoryConsentId: {
      type: String,
      default: "",
    },
    filingStatus: {
      type: String,
      default: "Ready in Vault",
    },
    advocateName: {
      type: String,
      default: "Adv. Meera Krishnan",
    },
    advocateId: {
      type: mongoose.Schema.Types.Mixed,
      default: "adv_1",
    },
    remarks: {
      type: String,
      default: "",
    },
    details: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const CitizenDocument = mongoose.model("CitizenDocument", citizenDocumentSchema);
