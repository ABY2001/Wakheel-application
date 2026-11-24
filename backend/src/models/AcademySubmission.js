import mongoose from "mongoose";

const rubricBreakdownSchema = new mongoose.Schema(
  {
    statutoryAccuracy: { type: Number, default: 0, max: 15 },
    casePrecedents: { type: Number, default: 0, max: 15 },
    draftingAndPrayer: { type: Number, default: 0, max: 10 },
    legalReasoning: { type: Number, default: 0, max: 10 },
  },
  { _id: false }
);

const academySubmissionSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    assignmentId: {
      type: String,
      required: [true, "Assignment reference ID is required"],
      index: true,
    },
    assignmentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademyAssignment",
    },
    assignmentTitle: {
      type: String,
      required: true,
      trim: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },
    studentEmail: {
      type: String,
      required: [true, "Student email is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    submittedDate: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    issuesRaised: {
      type: String,
      default: "",
    },
    submissionText: {
      type: String,
      required: [true, "Memorial or brief submission text is required"],
    },
    prayerOrConclusion: {
      type: String,
      default: "",
    },
    attachmentName: {
      type: String,
      default: "",
    },
    attachmentUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending Evaluation", "Graded", "Needs Revision"],
      default: "Pending Evaluation",
      index: true,
    },
    score: {
      type: Number,
      default: null,
    },
    grade: {
      type: String,
      default: "",
    },
    feedback: {
      type: String,
      default: "",
    },
    rubricBreakdown: {
      type: rubricBreakdownSchema,
      default: () => ({}),
    },
    evaluatedBy: {
      type: String,
      default: "",
    },
    evaluatedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    evaluatedDate: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const AcademySubmission = mongoose.model("AcademySubmission", academySubmissionSchema);
export default AcademySubmission;
