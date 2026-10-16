import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true, // e.g. "INV-2026/KL-041"
    },
    advocateId: {
      type: String,
      required: true,
      index: true,
    },
    advocateName: {
      type: String,
      default: "Adv. Meera Krishnan",
    },
    citizenId: {
      type: String,
      default: "default_citizen",
    },
    clientName: {
      type: String,
      required: true,
    },
    clientPhone: {
      type: String,
      default: "",
    },
    matterId: {
      type: String,
      default: "",
    },
    matterTitle: {
      type: String,
      default: "Legal Representation & Retainer",
    },
    items: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    gstRate: {
      type: Number,
      default: 18, // 18% GST for legal consultancy services where applicable
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["unpaid", "paid", "partially_paid", "cancelled"],
      default: "unpaid",
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
    paidAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "NEFT/RTGS", "Cheque", "Cash", "Portal_Escrow"],
      default: "UPI",
    },
  },
  { timestamps: true }
);

export const Invoice = mongoose.model("Invoice", invoiceSchema);
