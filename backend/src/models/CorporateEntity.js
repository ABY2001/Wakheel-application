import mongoose from "mongoose";

const corporateEntitySchema = new mongoose.Schema(
  {
    entityId: {
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
    },
    cin: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      uppercase: true,
    },
    rocJurisdiction: {
      type: String,
      default: "RoC Delhi & Haryana",
      trim: true,
    },
    entityType: {
      type: String,
      enum: ["pvt_ltd", "public_ltd", "opc", "llp", "section_8"],
      default: "pvt_ltd",
      index: true,
    },
    incorporationDate: {
      type: String,
      default: "2022-04-12",
    },
    authorizedCapital: {
      type: Number,
      default: 5000000, // 50 Lakhs
    },
    paidUpCapital: {
      type: Number,
      default: 2500000, // 25 Lakhs
    },
    registeredAddress: {
      type: String,
      default: "Plot 42, Okhla Industrial Area Phase-III, New Delhi, DL 110020",
    },
    email: {
      type: String,
      trim: true,
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true,
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
    },
    directors: [
      {
        din: { type: String, required: true },
        name: { type: String, required: true },
        designation: { type: String, default: "Director" }, // Managing Director, Director, Independent Director, KMP
        appointmentDate: { type: String },
        pan: { type: String },
        active: { type: Boolean, default: true },
      },
    ],
    financialYearEnd: {
      type: String,
      default: "March 31",
    },
    complianceHealthScore: {
      type: Number,
      default: 95,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["active", "strike_off", "amalgamated", "dormant"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

corporateEntitySchema.index({ userId: 1, companyName: 1 });

export const CorporateEntity =
  mongoose.models.CorporateEntity ||
  mongoose.model("CorporateEntity", corporateEntitySchema);
