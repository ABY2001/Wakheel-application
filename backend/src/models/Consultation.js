import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
  {
    citizenId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    advocateId: {
      type: mongoose.Schema.Types.Mixed,
    },
    advocateName: {
      type: String,
      default: "Adv. Meera Krishnan",
    },
    matterId: {
      type: mongoose.Schema.Types.Mixed,
    },
    consultationType: {
      type: String,
      enum: ["video", "chamber", "phone"],
      default: "video",
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
      default: "10:30 AM - 11:15 AM",
    },
    durationMinutes: {
      type: Number,
      default: 45,
    },
    meetingLink: {
      type: String,
      default: "https://meet.wakheel.law/chambers-krishnan-09",
    },
    chamberAddress: {
      type: String,
      default: "Chamber #412, High Court Advocates Association Complex, Marine Drive, Kochi",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    clientNotes: {
      type: String,
      default: "",
    },
    adviceNotes: {
      type: String,
      default: "",
    },
    feeAmount: {
      type: Number,
      default: 1500,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "waived"],
      default: "paid",
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "rescheduled", "cancelled"],
      default: "scheduled",
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    rescheduleReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Consultation = mongoose.model("Consultation", consultationSchema);
