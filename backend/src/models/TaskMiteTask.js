import mongoose from "mongoose";

const taskMiteTaskSchema = new mongoose.Schema(
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
    caseMatter: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "in_review", "completed"],
      default: "not_started",
      index: true,
    },
    type: {
      type: String,
      default: "Court Filing",
    },
    dueDate: {
      type: String,
      default: "Upcoming",
    },
    dueTime: {
      type: String,
    },
    isDueUrgent: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["urgent", "high", "medium", "low"],
      default: "high",
    },
    assignee: {
      name: { type: String, default: "Chamber Counsel" },
      role: { type: String, default: "Associate" },
      avatarInitials: { type: String, default: "CC" },
    },
    notes: {
      type: String,
    },
    completedAt: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const TaskMiteTask = mongoose.model("TaskMiteTask", taskMiteTaskSchema);
