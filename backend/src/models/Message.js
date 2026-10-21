import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["citizen", "advocate", "system"],
      default: "citizen",
    },
    senderName: {
      type: String,
      required: true,
      default: "Gopakumar Nambiar",
    },
    recipientId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    recipientRole: {
      type: String,
      enum: ["citizen", "advocate", "system"],
      default: "advocate",
    },
    recipientName: {
      type: String,
      default: "Adv. Meera Krishnan",
    },
    matterId: {
      type: String,
      default: "",
      index: true,
    },
    matterTitle: {
      type: String,
      default: "General Legal Counsel & Consultation",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        fileSize: String,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    isPrivileged: {
      type: Boolean,
      default: true, // Section 126 Indian Evidence Act / BSA 2023 Privileged Communication
    },
    category: {
      type: String,
      enum: ["general", "hearing_update", "document_request", "urgent"],
      default: "general",
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
