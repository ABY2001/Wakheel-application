import mongoose from "mongoose";

const subjectScoreSchema = new mongoose.Schema(
  {
    score: { type: Number, default: 0 },
    attempted: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
  },
  { _id: false }
);

const academyMockExamResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    studentName: {
      type: String,
      default: "Candidate",
    },
    studentEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    examId: {
      type: String,
      default: "mock_clat_01",
    },
    examTitle: {
      type: String,
      default: "CLAT 2027 All India CBT Mock Examination 01",
    },
    totalScore: {
      type: Number,
      required: true,
    },
    maxScore: {
      type: Number,
      default: 120,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    timeSpentSeconds: {
      type: Number,
      default: 7200,
    },
    allIndiaRank: {
      type: Number,
      default: null,
    },
    percentile: {
      type: Number,
      default: null,
    },
    subjectBreakdown: {
      legalReasoning: { type: subjectScoreSchema, default: () => ({}) },
      logicalReasoning: { type: subjectScoreSchema, default: () => ({}) },
      constitutionalLaw: { type: subjectScoreSchema, default: () => ({}) },
      englishLanguage: { type: subjectScoreSchema, default: () => ({}) },
      currentAffairs: { type: subjectScoreSchema, default: () => ({}) },
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
  },
  { timestamps: true }
);

export const AcademyMockExamResult = mongoose.model(
  "AcademyMockExamResult",
  academyMockExamResultSchema
);
export default AcademyMockExamResult;
