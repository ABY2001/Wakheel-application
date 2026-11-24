import mongoose from "mongoose";

const bookChapterSchema = new mongoose.Schema(
  {
    chapterNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    pageNumber: {
      type: Number,
      default: 1,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: true }
);

const academyBookSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    department: {
      type: String,
      default: "General Jurisprudence",
      trim: true,
    },
    edition: {
      type: String,
      default: "2026 Academic Edition",
    },
    fileSize: {
      type: String,
      default: "12.5 MB",
    },
    totalPages: {
      type: Number,
      default: 100,
    },
    format: {
      type: String,
      enum: ["PDF", "EPUB"],
      default: "PDF",
    },
    coverGradient: {
      type: String,
      default: "from-amber-600 via-amber-700 to-zinc-950",
    },
    description: {
      type: String,
      default: "",
    },
    uploadedBy: {
      type: String,
      default: "Wakheel Faculty",
    },
    uploadedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    uploadedDate: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    chapters: [bookChapterSchema],
    fileUrl: {
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

export const AcademyBook = mongoose.model("AcademyBook", academyBookSchema);
export default AcademyBook;
