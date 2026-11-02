import mongoose from "mongoose";

const calendarBacklogSchema = new mongoose.Schema(
  {
    taskId: {
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
    },
    category: {
      type: String,
      enum: ["drafting", "evidence", "client", "research", "filing"],
      default: "drafting",
    },
    priority: {
      type: String,
      enum: ["urgent", "high", "normal", "medium", "low"],
      default: "high",
    },
    estimatedTime: {
      type: String,
      default: "30m",
    },
    caseRef: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CalendarBacklog = mongoose.model("CalendarBacklog", calendarBacklogSchema);
