import mongoose from "mongoose";

const boardResolutionSchema = new mongoose.Schema(
  {
    resolutionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      default: "cs_1",
      index: true,
    },
    meetingId: {
      type: String,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      default: "CyberCorp Technologies Pvt Ltd",
    },
    cin: {
      type: String,
      default: "U72200DL2022PTC394812",
    },
    resolutionNumber: {
      type: String,
      required: true,
      trim: true,
      default: "RES-01/BM-04/2026-27",
    },
    type: {
      type: String,
      enum: ["board", "special", "ordinary", "circular"],
      default: "board",
      index: true,
    },
    category: {
      type: String,
      enum: [
        "banking",
        "director_appointment",
        "share_allotment",
        "borrowing",
        "statutory_compliance",
        "general_corporate",
      ],
      default: "banking",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    actSection: {
      type: String,
      default: "Companies Act, 2013",
    },
    preambleText: {
      type: String,
      default: "",
    },
    resolutionText: {
      type: String,
      required: true,
    },
    furtherResolutionText: {
      type: String,
      default: "",
    },
    authorizedSignatories: {
      type: [String],
      default: ["CS Rajesh Sharma", "Dr. Vikram Malhotra"],
    },
    status: {
      type: String,
      enum: ["draft", "passed_unanimously", "passed_majority", "circulated"],
      default: "passed_unanimously",
    },
    isCtcGenerated: {
      type: Boolean,
      default: false,
    },
    ctcCertifiedBy: {
      type: String,
      default: "",
    },
    ctcCertifiedAt: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const BoardResolution = mongoose.model("BoardResolution", boardResolutionSchema);
