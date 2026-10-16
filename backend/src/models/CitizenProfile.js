import mongoose from "mongoose";

const citizenProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "Ernakulam" },
      district: { type: String, default: "Ernakulam" },
      state: { type: String, default: "Kerala" },
      pincode: { type: String, default: "" },
    },
    preferredLanguage: {
      type: String,
      enum: ["en", "ml"],
      default: "en",
    },
    emergencyContact: {
      name: { type: String, default: "" },
      relationship: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    aadhaarLast4: {
      type: String,
      trim: true,
      default: "",
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },
    kycVerified: {
      type: Boolean,
      default: false,
    },
    notificationPreferences: {
      whatsapp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      courtHearingAlerts: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

export const CitizenProfile = mongoose.model("CitizenProfile", citizenProfileSchema);
