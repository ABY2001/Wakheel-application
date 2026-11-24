import mongoose from "mongoose";

const academyCornellNoteSchema = new mongoose.Schema(
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
    author: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    topic: {
      type: String,
      default: "",
      trim: true,
    },
    cues: {
      type: [String],
      default: [],
    },
    content: {
      type: String,
      required: [true, "Note main content is required"],
    },
    summary: {
      type: String,
      default: "",
    },
    statutoryReferences: {
      type: [String],
      default: [],
    },
    landmarkCases: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
    isFacultyShared: {
      type: Boolean,
      default: false,
    },
    lastEdited: {
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

export const AcademyCornellNote = mongoose.model(
  "AcademyCornellNote",
  academyCornellNoteSchema
);
export default AcademyCornellNote;
