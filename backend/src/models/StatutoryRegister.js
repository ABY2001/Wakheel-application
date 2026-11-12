import mongoose from "mongoose";

const statutoryRegisterSchema = new mongoose.Schema(
  {
    registerEntryId: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    cin: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    registerType: {
      type: String,
      enum: ["members", "directors", "charges", "loans_investments", "contracts_interested"],
      default: "members",
      index: true,
    },
    statutoryForm: {
      type: String,
      default: "MGT-1",
    },
    folioOrRefNumber: {
      type: String,
      required: true,
      trim: true,
    },
    primaryHolderName: {
      type: String,
      required: true,
      trim: true,
    },
    identificationNumber: {
      type: String,
      trim: true,
    },
    entryDate: {
      type: String,
      required: true,
    },
    particulars: {
      type: String,
      required: true,
    },
    quantityOrAmount: {
      type: Number,
      default: 0,
    },
    distinctiveFrom: {
      type: String,
    },
    distinctiveTo: {
      type: String,
    },
    certificateNumber: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "transferred", "satisfied", "ceased"],
      default: "active",
      index: true,
    },
    certifiedBy: {
      type: String,
      default: "",
    },
    certifiedAt: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

statutoryRegisterSchema.index({ userId: 1, registerType: 1 });
statutoryRegisterSchema.index({ userId: 1, companyName: 1 });

export const StatutoryRegister =
  mongoose.models.StatutoryRegister ||
  mongoose.model("StatutoryRegister", statutoryRegisterSchema);
