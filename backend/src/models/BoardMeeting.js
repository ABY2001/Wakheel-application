import mongoose from "mongoose";

const boardMeetingSchema = new mongoose.Schema(
  {
    meetingId: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      default: "cs_1",
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      default: "CyberCorp Technologies Pvt Ltd",
    },
    cin: {
      type: String,
      trim: true,
      default: "U72200DL2022PTC394812",
    },
    meetingNumber: {
      type: String,
      required: true,
      trim: true,
      default: "BM-04/2026-27",
    },
    meetingType: {
      type: String,
      enum: ["board_meeting", "audit_committee", "nrc_committee", "agm", "egm"],
      default: "board_meeting",
      index: true,
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
      index: true,
    },
    time: {
      type: String,
      default: "11:00 AM",
    },
    venue: {
      type: String,
      default: "Board Room, Registered Office & Two-Way Video Conference (Rule 3)",
    },
    isVideoConference: {
      type: Boolean,
      default: true,
    },
    chairperson: {
      type: String,
      default: "Dr. Vikram Malhotra (Chairman & Independent Director)",
    },
    directors: [
      {
        name: { type: String, required: true },
        din: { type: String, default: "" },
        status: {
          type: String,
          enum: ["present", "present_vc", "leave_of_absence", "special_invitee"],
          default: "present",
        },
      },
    ],
    isShorterNotice: {
      type: Boolean,
      default: false,
    },
    shorterNoticeReason: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["scheduled", "notice_sent", "draft_minutes", "minutes_signed"],
      default: "scheduled",
      index: true,
    },
    agendaItems: [
      {
        itemNumber: Number,
        title: String,
        description: String,
        proposedBy: String,
        isStatutory: Boolean,
      },
    ],
    minutes: {
      draftContent: String,
      finalContent: String,
      signedBy: String,
      signedAt: String,
      enteredInBookAt: String,
    },
  },
  {
    timestamps: true,
  }
);

export const BoardMeeting = mongoose.model("BoardMeeting", boardMeetingSchema);
