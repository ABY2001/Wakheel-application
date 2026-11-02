import mongoose from "mongoose";

const networkContactSchema = new mongoose.Schema(
  {
    contactId: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    degree: {
      type: String,
      default: "1st",
    },
    role: {
      type: String,
      default: "Legal Counsel",
    },
    chamber: {
      type: String,
      default: "Independent Chambers",
    },
    bench: {
      type: String,
      default: "High Court of Kerala",
    },
    court: {
      type: String,
      default: "High Court of Kerala",
    },
    location: {
      type: String,
      default: "Kochi, Kerala",
    },
    stage: {
      type: String,
      enum: [
        "discover",
        "connected",
        "contacted",
        "engaged",
        "meeting",
        "active",
        "shortlisted",
        "inquired",
        "consulted",
        "hearing",
        "retained",
      ],
      default: "discover",
      index: true,
    },
    practiceArea: {
      type: String,
      default: "Constitutional Law",
    },
    source: {
      type: String,
      default: "Bar Council Directory",
    },
    mutualsCount: {
      type: Number,
      default: 0,
    },
    statusQuote: {
      type: String,
    },
    lastActive: {
      type: String,
      default: "Recently",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    barEnrollment: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    feeText: {
      type: String,
    },
    assignedMatterNo: {
      type: String,
    },
    assignedMatterTitle: {
      type: String,
    },
    nextHearingDate: {
      type: String,
    },
    briefsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const NetworkContact = mongoose.model("NetworkContact", networkContactSchema);
