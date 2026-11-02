import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema(
  {
    eventId: {
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
      enum: ["hearing", "consultation", "deadline", "meeting", "task"],
      default: "hearing",
    },
    date: {
      type: String, // "YYYY-MM-DD" e.g. "2026-10-30"
      required: true,
      index: true,
    },
    time: {
      type: String, // e.g. "10:15 AM"
      default: "10:00 AM",
    },
    duration: {
      type: String, // e.g. "45m"
      default: "45m",
    },
    caseNumber: {
      type: String,
      trim: true,
    },
    forum: {
      type: String,
      trim: true,
    },
    clientName: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["confirmed", "urgent", "completed", "tentative"],
      default: "confirmed",
    },
  },
  {
    timestamps: true,
  }
);

export const CalendarEvent = mongoose.model("CalendarEvent", calendarEventSchema);
