import mongoose from "mongoose";

const causeListSchema = new mongoose.Schema(
  {
    advocateId: {
      type: String,
      required: true,
      index: true,
    },
    courtDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    courtName: {
      type: String,
      required: true,
      default: "High Court of Kerala (Ernakulam)",
    },
    courtHall: {
      type: String,
      required: true, // e.g. "Court Hall 2A"
    },
    bench: {
      type: String,
      required: true, // e.g. "Division Bench (Chief Justice & Justice K. Babu)"
    },
    itemNumber: {
      type: Number,
      required: true, // e.g. 14
    },
    caseNumber: {
      type: String,
      required: true, // e.g. "WP(C) 19482/2024"
    },
    cnrNumber: {
      type: String,
      default: "",
    },
    petitioner: {
      type: String,
      required: true,
    },
    respondent: {
      type: String,
      required: true,
    },
    appearanceFor: {
      type: String,
      enum: ["Petitioner", "Respondent", "Intervenor", "Standing Counsel"],
      default: "Petitioner",
    },
    stage: {
      type: String,
      default: "Notice Before Admission / Interim Relief",
    },
    status: {
      type: String,
      enum: ["listed", "passed_over", "heard", "adjourned", "disposed"],
      default: "listed",
    },
    boardRemarks: {
      type: String,
      default: "Listed as Item #14 in daily causelist",
    },
  },
  { timestamps: true }
);

export const CauseList = mongoose.model("CauseList", causeListSchema);
