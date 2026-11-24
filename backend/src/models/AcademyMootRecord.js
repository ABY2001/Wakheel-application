import mongoose from "mongoose";

const academyMootRecordSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    studentName: {
      type: String,
      default: "Law Scholar",
      trim: true,
    },
    studentEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    caseId: {
      type: String,
      required: true,
      index: true,
    },
    caseTitle: {
      type: String,
      required: true,
      trim: true,
    },
    totalScore: {
      type: Number,
      required: true,
    },
    maxScore: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    verdict: {
      type: String,
      enum: ["Bench Unanimously Concurs", "Split 2:1 In Favor", "Dismissed with Reprimand"],
      required: true,
    },
    completedDate: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    drillStats: {
      totalAttempts: { type: Number, default: 0 },
      correctAnswers: { type: Number, default: 0 },
      accuracyRate: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const AcademyMootRecord = mongoose.model(
  "AcademyMootRecord",
  academyMootRecordSchema
);
export default AcademyMootRecord;
