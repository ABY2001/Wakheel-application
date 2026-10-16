import mongoose from "mongoose";

const caseNoteSchema = new mongoose.Schema(
  {
    advocateId: {
      type: String,
      required: true,
      index: true,
    },
    matterId: {
      type: String,
      default: "",
    },
    matterTitle: {
      type: String,
      default: "General Chamber Memo",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["hearing_memo", "client_instructions", "precedent_notes", "witness_cross", "general"],
      default: "hearing_memo",
    },
    isConfidential: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const CaseNote = mongoose.model("CaseNote", caseNoteSchema);
