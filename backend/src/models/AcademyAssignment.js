import mongoose from "mongoose";

const academyAssignmentSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    targetBatch: {
      type: String,
      required: [true, "Target batch is required"],
      trim: true,
    },
    badge: {
      type: String,
      default: "DRAFTING MEMORIAL",
    },
    instructions: {
      type: String,
      required: [true, "Instructions are required"],
    },
    faculty: {
      type: String,
      required: [true, "Faculty name is required"],
      trim: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    dueDate: {
      type: String,
      required: [true, "Due date is required"],
    },
    maxScore: {
      type: Number,
      default: 50,
    },
    referenceRatio: {
      type: String,
      default: "",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const AcademyAssignment = mongoose.model("AcademyAssignment", academyAssignmentSchema);
export default AcademyAssignment;
