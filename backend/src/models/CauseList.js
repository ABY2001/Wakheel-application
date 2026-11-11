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
      default: "Court Forum Pending",
    },
    courtHall: {
      type: String,
      required: true,
    },
    bench: {
      type: String,
      required: true,
    },
    itemNumber: {
      type: Number,
      required: true,
    },
    caseNumber: {
      type: String,
      required: true,
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
      default: "Listed in daily causelist",
    },
  },
  { timestamps: true }
);

export const CauseList = mongoose.model("CauseList", causeListSchema);
