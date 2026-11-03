import mongoose from "mongoose";

const dscCertificateSchema = new mongoose.Schema(
  {
    certificateId: {
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
    holderName: {
      type: String,
      required: true,
      trim: true,
    },
    holderRole: {
      type: String,
      enum: ["practicing_cs", "practicing_ca", "company_director", "authorized_signatory"],
      default: "practicing_cs",
    },
    pan: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    din: {
      type: String,
      trim: true,
    },
    membershipNumber: {
      type: String,
      trim: true,
    },
    tokenProvider: {
      type: String,
      default: "e-Mudhra", // e-Mudhra, Capricorn CA, VSign, Pantasign, IDSign
    },
    hardwareModel: {
      type: String,
      default: "WatchData ProxKey USB Token (FIPS 140-2 Level 2)",
    },
    serialNumber: {
      type: String,
      required: true,
      trim: true,
    },
    issuerCa: {
      type: String,
      default: "e-Mudhra Sub-CA for Class 3 Individual 2014 (CCA India)",
    },
    validFrom: {
      type: String,
      default: "2024-05-10",
    },
    validTo: {
      type: String,
      default: "2027-05-09",
    },
    keyAlgorithm: {
      type: String,
      default: "RSA 2048-bit / SHA-256",
    },
    keyUsage: {
      type: [String],
      default: ["Digital Signature", "Non-Repudiation"],
    },
    tokenStatus: {
      type: String,
      enum: ["plugged_in", "unplugged", "locked", "expired"],
      default: "plugged_in",
    },
    totalSignaturesAffixed: {
      type: Number,
      default: 142,
    },
    lastUsedAt: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

dscCertificateSchema.index({ userId: 1, serialNumber: 1 });
dscCertificateSchema.index({ holderRole: 1, tokenStatus: 1 });

export const DscCertificate =
  mongoose.models.DscCertificate ||
  mongoose.model("DscCertificate", dscCertificateSchema);
