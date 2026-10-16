import mongoose from "mongoose";

const legalNoticeSchema = new mongoose.Schema(
  {
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    noticeType: {
      type: String,
      enum: [
        "Cheque Bounce Demand (Sec 138 NI Act)",
        "Recovery of Money & Outstanding Invoices",
        "Tenant Eviction & Arrears of Rent",
        "Breach of Contract & Liquidated Damages",
        "Consumer Deficient Service Demand",
        "Defamation & Cease and Desist",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
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
    statutoryNoticeDays: {
      type: Number,
      default: 15, // 15 days for Sec 138 NI Act, 30 days for general
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
      enum: ["Drafted", "Dispatched", "Item Delivered", "Addressee Left / Unserved", "Awaiting Expiry of Statutory Period", "Escalated to Court Action"],
      default: "Dispatched",
    },
    draftContent: {
      type: String,
      default: "",
    },
    pdfUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const LegalNotice = mongoose.model("LegalNotice", legalNoticeSchema);
