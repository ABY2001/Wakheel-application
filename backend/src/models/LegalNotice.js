import mongoose from "mongoose";

const legalNoticeSchema = new mongoose.Schema(
  {
    citizenId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    matterId: {
      type: mongoose.Schema.Types.Mixed,
    },
    noticeType: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    senderName: {
      type: String,
      default: "Gopakumar Nambiar",
    },
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },
    recipientAddress: {
      type: String,
      required: true,
    },
    claimAmount: {
      type: String,
      default: "",
    },
    statutoryNoticeDays: {
      type: Number,
      default: 15, // 15 days for Sec 138 NI Act, 30 days for general/Sec 80 CPC
    },
    dispatchDate: {
      type: Date,
      default: Date.now,
    },
    speedPostTrackingNumber: {
      type: String,
      default: "EK948102391IN",
    },
    deliveryStatus: {
      type: String,
      default: "Dispatched",
    },
    daysRemaining: {
      type: Number,
      default: 15,
    },
    draftContent: {
      type: String,
      default: "",
    },
    pdfUrl: {
      type: String,
      default: "",
    },
    advocateName: {
      type: String,
      default: "Adv. Meera Krishnan",
    },
    trackingHistory: [
      {
        date: String,
        time: String,
        location: String,
        activity: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const LegalNotice = mongoose.model("LegalNotice", legalNoticeSchema);
