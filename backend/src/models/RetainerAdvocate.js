import mongoose from "mongoose";

const retainerAdvocateSchema = new mongoose.Schema(
  {
    advocateId: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    barEnrollmentNumber: {
      type: String,
      required: true,
      trim: true,
    },
    primaryJurisdiction: {
      type: String,
      default: "",
    },
    specialization: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    retainerFee: {
      type: Number,
      default: 0,
    },
    appearanceRatePerHearing: {
      type: Number,
      default: 0,
    },
    activeBriefsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active_retainer", "empanelled", "inactive"],
      default: "active_retainer",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

retainerAdvocateSchema.index({ userId: 1, barEnrollmentNumber: 1 });

export const RetainerAdvocate =
  mongoose.models.RetainerAdvocate ||
  mongoose.model("RetainerAdvocate", retainerAdvocateSchema);
