import mongoose from "mongoose";

const taskMiteNoteSchema = new mongoose.Schema(
  {
    noteId: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled Note",
    },
    category: {
      type: String,
      default: "hearing_memo",
    },
    categoryLabel: {
      type: String,
      default: "Hearing Memo",
    },
    content: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: ["Chamber"],
    },
    updatedAt: {
      type: String,
      default: "Just now",
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TaskMiteNote = mongoose.model("TaskMiteNote", taskMiteNoteSchema);
