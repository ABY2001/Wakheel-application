import mongoose from "mongoose";

const academyTuitionRequestSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    studentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    studentCode: {
      type: String,
      default: "STU-4KMAC5",
    },
    targetExam: {
      type: String,
      default: "CLAT 2027 (NLUs)",
    },
    reason: {
      type: String,
      default: "Intensive Bar and Judicial Services chamber coaching",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    requestedAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
    reviewedAt: {
      type: String,
    },
    reviewedBy: {
      type: String,
      default: "Prof. Dr. Rajesh Varma",
    },
    facultyNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const AcademyTuitionRequest =
  mongoose.models.AcademyTuitionRequest ||
  mongoose.model("AcademyTuitionRequest", academyTuitionRequestSchema);
