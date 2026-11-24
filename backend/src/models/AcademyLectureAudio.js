import mongoose from "mongoose";

const academyLectureAudioSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Lecture title is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    targetBatch: {
      type: String,
      required: [true, "Target cohort / batch is required"],
      trim: true,
    },
    facultyName: {
      type: String,
      required: [true, "Faculty name is required"],
      trim: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    duration: {
      type: String,
      default: "15:00",
    },
    durationSeconds: {
      type: Number,
      default: 900,
    },
    date: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    audioUrl: {
      type: String,
      default: "",
    },
    statutoryNotes: {
      type: String,
      default: "",
    },
    keyCitations: {
      type: [String],
      default: [],
    },
    listensCount: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ["Faculty Masterclass", "Oral Argument Drill", "Rapid Doctrine Revision"],
      default: "Faculty Masterclass",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const AcademyLectureAudio = mongoose.model(
  "AcademyLectureAudio",
  academyLectureAudioSchema
);
export default AcademyLectureAudio;
