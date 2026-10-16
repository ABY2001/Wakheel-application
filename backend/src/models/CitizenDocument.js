import mongoose from "mongoose";

const citizenDocumentSchema = new mongoose.Schema(
  {
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    matterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Matter",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Identity & KYC", "Property Deed / Revenue", "Court Petition / Writ", "Vakalatnama", "Legal Notice", "Affidavit", "Certified Court Order", "Evidence & Exhibits"],
      default: "Evidence & Exhibits",
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
    sha256Hash: {
      type: String,
      default: "",
    },
    isSigned: {
      type: Boolean,
      default: false,
    },
    signedAt: {
      type: Date,
    },
    signatoryConsentId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const CitizenDocument = mongoose.model("CitizenDocument", citizenDocumentSchema);
