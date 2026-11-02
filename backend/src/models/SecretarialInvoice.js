import mongoose from "mongoose";

const secretarialInvoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      default: "cs_1",
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },
    clientCompanyName: {
      type: String,
      required: true,
      trim: true,
    },
    clientGstin: {
      type: String,
      trim: true,
    },
    sacCode: {
      type: String,
      default: "9982", // Legal & Accounting / Secretarial Services
    },
    billingType: {
      type: String,
      enum: ["monthly_retainer", "annual_roc_package", "event_filing", "nclt_appearance"],
      default: "monthly_retainer",
      index: true,
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
      default: 18,
    },
    gstAmount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "issued", "paid", "overdue"],
      default: "issued",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

secretarialInvoiceSchema.index({ userId: 1, invoiceNumber: 1 });

export const SecretarialInvoice =
  mongoose.models.SecretarialInvoice ||
  mongoose.model("SecretarialInvoice", secretarialInvoiceSchema);
