"use client";

import React, { useState, useEffect } from "react";
import { citizenApi } from "@/lib/api";
import {
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Building,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  X,
  Search,
  RefreshCw,
  Plus,
  Shield,
  ArrowUpRight,
  ChevronRight,
  FileText,
  User,
  Scale,
} from "lucide-react";

export interface InvoiceLineItem {
  description: string;
  category?: string;
  sacCode?: string;
  amount: number;
}

export interface CitizenInvoiceItem {
  _id: string;
  id?: string;
  invoiceNumber: string;
  advocateId?: string;
  advocateName?: string;
  barCouncilNumber?: string;
  chamberAddress?: string;
  citizenId?: string;
  clientName: string;
  clientPhone?: string;
  clientAddress?: string;
  matterId?: string;
  matterTitle?: string;
  items: InvoiceLineItem[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  totalAmount: number;
  status: "unpaid" | "paid" | "partially_paid" | "cancelled";
  dueDate?: string;
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
  receiptNumber?: string;
  createdAt?: string;
}

interface InvoicesAndPaymentsViewProps {
  token?: string;
  onInvoicePaid?: () => void;
}

export const InvoicesAndPaymentsView: React.FC<InvoicesAndPaymentsViewProps> = ({
  token = "dev_token",
  onInvoicePaid,
}) => {
  const [invoices, setInvoices] = useState<CitizenInvoiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selected invoice for full Tax Invoice view
  const [activeInvoice, setActiveInvoice] = useState<CitizenInvoiceItem | null>(null);

  // Payment Gateway Modal State
  const [payingInvoice, setPayingInvoice] = useState<CitizenInvoiceItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "NetBanking" | "Card" | "Portal_Escrow">("UPI");
  const [upiId, setUpiId] = useState<string>("gopakumar@okhdfcbank");
  const [selectedBank, setSelectedBank] = useState<string>("State Bank of India");
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    transactionId: string;
    receiptNumber: string;
    amount: number;
  } | null>(null);

  // Request New Invoice Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [reqMatterTitle, setReqMatterTitle] = useState<string>("WP(C) 19482/2024 — High Court Writ Representation");
  const [reqServiceDesc, setReqServiceDesc] = useState<string>("Senior Counsel Conference & Counter Affidavit Drafting");
  const [reqAmount, setReqAmount] = useState<number>(12000);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState<boolean>(false);

  // Copy feedback
  const [copiedInvoiceNumber, setCopiedInvoiceNumber] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await citizenApi.getInvoices(token);
      if (res && res.invoices) {
        setInvoices(res.invoices);
      }
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [token]);

  // Execute Payment Simulation
  const handleConfirmPayment = async () => {
    if (!payingInvoice) return;
    try {
      setIsProcessingPayment(true);
      const now = new Date();
      const generatedTxnId = `${paymentMethod.toUpperCase()}/${now.getFullYear()}/${Math.floor(
        10000000 + Math.random() * 90000000
      )}`;

      // Simulate network / gateway roundtrip
      await new Promise((r) => setTimeout(r, 1200));

      const res = await citizenApi.payInvoice(token, payingInvoice._id, paymentMethod, generatedTxnId);
      if (res && res.success) {
        setPaymentSuccessData({
          transactionId: res.invoice?.transactionId || generatedTxnId,
          receiptNumber: res.invoice?.receiptNumber || `REC-${now.getFullYear()}/041`,
          amount: res.invoice?.totalAmount || payingInvoice.totalAmount,
        });
        await fetchInvoices();
        if (onInvoicePaid) onInvoicePaid();
      } else {
        alert(res?.message || "Payment settlement failed.");
      }
    } catch (err) {
      console.error("Payment failed:", err);
      alert("Error processing payment gateway settlement.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Create Invoice Request
  const handleCreateRequest = async () => {
    try {
      setIsSubmittingRequest(true);
      const res = await citizenApi.createInvoiceRequest(token, {
        matterTitle: reqMatterTitle,
        serviceDescription: reqServiceDesc,
        estimatedAmount: reqAmount,
      });

      if (res && res.success) {
        setIsRequestModalOpen(false);
        await fetchInvoices();
      } else {
        alert(res?.message || "Failed to create invoice request.");
      }
    } catch (err) {
      console.error("Error creating invoice request:", err);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Copy to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInvoiceNumber(id);
    setTimeout(() => setCopiedInvoiceNumber(null), 2000);
  };

  // Print invoice modal
  const handlePrint = () => {
    window.print();
  };

  // Download plain text invoice summary
  const handleDownloadInvoiceSummary = (inv: CitizenInvoiceItem) => {
    const text = `TAX INVOICE & ADVOCATE FEE MEMORANDUM
Invoice No: ${inv.invoiceNumber}
Date: ${inv.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0]}
Status: ${inv.status.toUpperCase()}
Advocate: ${inv.advocateName || "Adv. Meera Krishnan"} (${inv.barCouncilNumber || "K/001429/2012"})
Chambers: ${inv.chamberAddress || "High Court Road, Ernakulam, Kochi"}
Client: ${inv.clientName}
Matter: ${inv.matterTitle || "Legal Retainer"}

ITEMIZED CHARGES:
${inv.items?.map((it, idx) => `${idx + 1}. ${it.description} [SAC: 9982] - ₹${it.amount.toLocaleString("en-IN")}`).join("\n")}

Subtotal: ₹${inv.subtotal.toLocaleString("en-IN")}
GST @ 18% (CGST 9% + SGST 9%): ₹${inv.gstAmount.toLocaleString("en-IN")}
Total Payable: ₹${inv.totalAmount.toLocaleString("en-IN")}
${inv.status === "paid" ? `\nPAYMENT DETAILS:\nPaid At: ${inv.paidAt}\nPayment Mode: ${inv.paymentMethod}\nTxn ID: ${inv.transactionId}\nReceipt No: ${inv.receiptNumber}` : ""}`;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice_${inv.invoiceNumber.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.matterTitle && inv.matterTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inv.advocateName && inv.advocateName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      inv.items?.some((it) => it.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "ALL") return true;
    if (statusFilter === "UNPAID") return inv.status === "unpaid" || inv.status === "partially_paid";
    if (statusFilter === "PAID") return inv.status === "paid";
    return true;
  });

  // Calculate Metrics
  const totalBills = invoices.length;
  const totalIncurred = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalSettled = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPending = invoices
    .filter((inv) => inv.status === "unpaid" || inv.status === "partially_paid")
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6">
      {/* ============================================================== */}
      {/* 1. Header Bar with Actions                                     */}
      {/* ============================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">
              Fee Invoices & Legal Retainer Settlement
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
              GST SAC 9982
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Itemized court fees, clerkage welfare stamps, and instant UPI / Escrow payment settlement with formal tax receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Request Retainer Fee Note</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. KPI Summary Metrics (Monochrome Zinc)                       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
              Total Incurred
            </span>
            <Receipt className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-black dark:text-white mt-2">
            ₹{totalIncurred.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">{totalBills} tax invoices issued</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
              Settled / Paid
            </span>
            <CheckCircle2 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-black dark:text-white mt-2">
            ₹{totalSettled.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">With confirmed GST receipts</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
              Outstanding Dues
            </span>
            <Clock className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-black dark:text-white mt-2">
            ₹{totalPending.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Pending chamber settlement</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
              Legal Compliance
            </span>
            <Shield className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-base font-bold text-black dark:text-white mt-2">18% GST (CGST + SGST)</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Kerala Bar & CGST compliant</p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. Search and Status Filters                                   */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice number, case reference, or service item..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Invoices" },
            { id: "UNPAID", label: "Pending Dues" },
            { id: "PAID", label: "Settled / Paid" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === tab.id
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-black dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={fetchInvoices}
            title="Refresh invoices"
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. Invoice Dossier Cards                                        */}
      {/* ============================================================== */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400" />
          <p className="text-xs text-zinc-500">Synchronizing advocate chamber invoices...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3">
          <Receipt className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700" />
          <h3 className="text-sm font-bold text-black dark:text-white">No invoice records found</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            {searchQuery
              ? `No records matching "${searchQuery}". Clear search query to view all.`
              : "All chamber fees and retainers are settled, or no invoices have been issued yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((inv) => {
            const isPaid = inv.status === "paid";

            return (
              <div
                key={inv._id || inv.invoiceNumber}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-4"
              >
                {/* Invoice Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                        {inv.invoiceNumber}
                      </span>
                      <button
                        onClick={() => handleCopy(inv.invoiceNumber, inv._id)}
                        className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                        title="Copy invoice number"
                      >
                        {copiedInvoiceNumber === inv._id ? (
                          <Check className="w-3 h-3 text-black dark:text-white" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        Date: {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Issued"}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-black dark:text-white">
                      {inv.matterTitle || "Legal Representation & Retainer Fee"}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Counsel: {inv.advocateName || "Adv. Meera Krishnan"} &bull; {inv.barCouncilNumber || "K/001429/2012"}
                    </p>
                  </div>

                  {/* Status & Amount Badge */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-1">
                    <div className="text-right">
                      <span className="text-xl font-bold font-mono text-black dark:text-white block">
                        ₹{(inv.totalAmount || inv.subtotal).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        Subtotal ₹{inv.subtotal.toLocaleString("en-IN")} + 18% GST (₹{inv.gstAmount.toLocaleString("en-IN")})
                      </span>
                    </div>

                    <div className="mt-1">
                      {isPaid ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Paid via {inv.paymentMethod || "UPI"}</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-black text-white dark:bg-white dark:text-black inline-flex items-center gap-1.5 shadow-xs">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Due for Settlement</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Itemized Services Preview */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                    Itemized Particulars (SAC Code 9982 - Legal Services)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {inv.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-black dark:text-white block">{item.description}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {item.category || "Legal Consultation"}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-black dark:text-white">
                          ₹{item.amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveInvoice(inv)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-zinc-500" />
                      <span>View Tax Invoice</span>
                    </button>

                    <button
                      onClick={() => handleDownloadInvoiceSummary(inv)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Download Receipt</span>
                    </button>
                  </div>

                  <div>
                    {!isPaid ? (
                      <button
                        onClick={() => {
                          setPayingInvoice(inv);
                          setPaymentSuccessData(null);
                        }}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Now &bull; ₹{inv.totalAmount.toLocaleString("en-IN")}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-zinc-500">
                        Txn: {inv.transactionId || "UPI/CONFIRMED"} &bull; Receipt: {inv.receiptNumber || "REC-2026/041"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. Interactive Payment Gateway Modal                           */}
      {/* ============================================================== */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                    RAZORPAY / ESCROW GATEWAY
                  </span>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    {paymentSuccessData ? "Payment Successful" : "Complete Fee Settlement"}
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Beneficiary: {payingInvoice.advocateName || "Adv. Meera Krishnan"} (Chamber Escrow)
                </p>
              </div>
              <button
                onClick={() => {
                  setPayingInvoice(null);
                  setPaymentSuccessData(null);
                }}
                className="p-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Payment Succeeded */}
            {paymentSuccessData ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-black dark:text-white">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-black dark:text-white">Settlement Verified</h4>
                  <p className="text-xs text-zinc-500">
                    Your payment of ₹{paymentSuccessData.amount.toLocaleString("en-IN")} has been credited to the chamber
                    escrow account.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Transaction ID:</span>
                    <span className="font-bold text-black dark:text-white">{paymentSuccessData.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">GST Receipt No:</span>
                    <span className="font-bold text-black dark:text-white">{paymentSuccessData.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Matter Docket:</span>
                    <span className="font-bold text-black dark:text-white">Milestone Updated in Chamber ERP</span>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setPayingInvoice(null);
                      setPaymentSuccessData(null);
                    }}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black cursor-pointer shadow-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Amount Summary Box */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 block uppercase">Bill Payable</span>
                    <span className="text-xs font-bold text-black dark:text-white">{payingInvoice.invoiceNumber}</span>
                    <p className="text-[11px] text-zinc-500 truncate max-w-xs">{payingInvoice.matterTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block">Total with 18% GST</span>
                    <span className="text-2xl font-bold font-mono text-black dark:text-white">
                      ₹{payingInvoice.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Method Tabs */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                    Select Payment Channel
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "UPI", label: "UPI Apps", icon: QrCode },
                      { id: "NetBanking", label: "NetBanking", icon: Building },
                      { id: "Card", label: "Cards", icon: CreditCard },
                      { id: "Portal_Escrow", label: "Legal Escrow", icon: Shield },
                    ].map((m) => {
                      const Icon = m.icon;
                      const isSelected = paymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer space-y-1.5 ${
                            isSelected
                              ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs"
                              : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                          }`}
                        >
                          <Icon className="w-5 h-5 mx-auto" />
                          <span className="text-xs font-bold block">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Channel Specific Form */}
                {paymentMethod === "UPI" && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black dark:text-white">Pay via UPI Virtual ID</span>
                      <span className="text-[10px] font-mono text-zinc-400">Zero Transaction Charges</span>
                    </div>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobileNumber@upi or user@okhdfcbank"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                    <div className="flex items-center gap-2 pt-1">
                      {["Google Pay", "PhonePe", "Paytm", "BHIM UPI"].map((app) => (
                        <span
                          key={app}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === "NetBanking" && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <label className="text-xs font-bold text-black dark:text-white block">Select Primary Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    >
                      <option>State Bank of India (SBI)</option>
                      <option>Federal Bank (Kerala)</option>
                      <option>HDFC Bank</option>
                      <option>Canara Bank</option>
                      <option>ICICI Bank</option>
                      <option>South Indian Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === "Card" && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black dark:text-white">Debit / Credit Card</span>
                      <span className="text-[10px] font-mono text-zinc-400">RuPay / Visa / MasterCard</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Card Number (4532 •••• •••• ••••)"
                      defaultValue="4532 9481 2019 4810"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        defaultValue="08/28"
                        className="px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        defaultValue="842"
                        className="px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "Portal_Escrow" && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <span className="text-xs font-bold text-black dark:text-white block">Advocate Chamber Trust Escrow</span>
                    <p className="text-xs text-zinc-500">
                      Funds are held in high-security portal escrow and disbursed to chamber counsel upon filing proof
                      submission or court appearance confirmation.
                    </p>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => setPayingInvoice(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConfirmPayment}
                    disabled={isProcessingPayment}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Authorizing Payment Settlement...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirm & Pay ₹{payingInvoice.totalAmount.toLocaleString("en-IN")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. Formal Printable Digital Tax Invoice Modal                  */}
      {/* ============================================================== */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 print:hidden">
              <span className="text-xs font-mono font-bold text-zinc-500">
                GST SAC CODE 9982 &bull; TAX INVOICE
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Print Document</span>
                </button>

                <button
                  onClick={() => handleDownloadInvoiceSummary(activeInvoice)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Plain Text</span>
                </button>

                <button
                  onClick={() => setActiveInvoice(null)}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tax Invoice Document Body */}
            <div className="space-y-6 text-black dark:text-white font-sans">
              {/* Letterhead */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b-2 border-black dark:border-white">
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-tight">
                    {activeInvoice.advocateName || "Adv. Meera Krishnan"}
                  </h2>
                  <p className="text-xs text-zinc-500 font-mono">
                    Advocate &bull; Bar Council Roll No: {activeInvoice.barCouncilNumber || "K/001429/2012"}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-md">
                    {activeInvoice.chamberAddress || "Chamber 12, Ernakulam Law Chambers, High Court Road, Kochi 682031"}
                  </p>
                </div>

                <div className="text-left sm:text-right font-mono">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-black text-white dark:bg-white dark:text-black inline-block uppercase">
                    TAX INVOICE
                  </span>
                  <div className="text-xs mt-2 text-zinc-500">
                    <span className="font-bold text-black dark:text-white block">{activeInvoice.invoiceNumber}</span>
                    <span>Issued: {activeInvoice.createdAt ? new Date(activeInvoice.createdAt).toLocaleDateString("en-IN") : "2026-10-18"}</span>
                  </div>
                </div>
              </div>

              {/* Billed To and Matter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">BILLED TO (CLIENT)</span>
                  <span className="font-bold text-black dark:text-white text-sm block">{activeInvoice.clientName}</span>
                  <p className="text-zinc-500">{activeInvoice.clientAddress || "Panampilly Nagar, Ernakulam, Kerala"}</p>
                  <p className="text-zinc-500">{activeInvoice.clientPhone || "+91 94471 28400"}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">MATTER REFERENCE</span>
                  <span className="font-bold text-black dark:text-white block">{activeInvoice.matterTitle}</span>
                  <div className="text-zinc-500 pt-1">
                    Status: <span className="uppercase font-bold text-black dark:text-white">{activeInvoice.status}</span>
                  </div>
                  {activeInvoice.paidAt && (
                    <div className="text-zinc-500">
                      Paid: {new Date(activeInvoice.paidAt).toLocaleDateString("en-IN")} via {activeInvoice.paymentMethod}
                    </div>
                  )}
                </div>
              </div>

              {/* Table of Services */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase">
                      <th className="p-3 w-12">#</th>
                      <th className="p-3">Description of Legal Professional Services</th>
                      <th className="p-3 font-mono">SAC</th>
                      <th className="p-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {activeInvoice.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/50">
                        <td className="p-3 font-mono text-zinc-400">{idx + 1}</td>
                        <td className="p-3 font-semibold text-black dark:text-white">
                          {item.description}
                          <span className="block text-[10px] text-zinc-400 font-mono font-normal">
                            Category: {item.category || "Professional Representation"}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-zinc-500">{item.sacCode || "9982"}</td>
                        <td className="p-3 text-right font-mono font-bold text-black dark:text-white">
                          ₹{item.amount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals and GST breakdown */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 text-xs">
                <div className="text-[11px] text-zinc-500 max-w-md space-y-1">
                  <span className="font-bold text-black dark:text-white block font-mono">Statutory Notes:</span>
                  <p>
                    Services classified under SAC 9982 (Legal Services). Tax payable on reverse charge basis where
                    applicable under Section 9(3) of the CGST Act, 2017.
                  </p>
                </div>

                <div className="w-full sm:w-72 space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Taxable Subtotal:</span>
                    <span className="font-bold text-black dark:text-white">₹{activeInvoice.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>CGST @ 9%:</span>
                    <span>₹{(activeInvoice.cgstAmount || Math.round(activeInvoice.gstAmount / 2)).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>SGST @ 9%:</span>
                    <span>₹{(activeInvoice.sgstAmount || Math.round(activeInvoice.gstAmount / 2)).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                    <span>Total Payable:</span>
                    <span>₹{activeInvoice.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Digital Seal & Signatory */}
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-end text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">Electronic Verification</span>
                  <span className="font-mono text-black dark:text-white">Wakheel Secured Chamber Ledger</span>
                </div>

                <div className="text-right space-y-1">
                  <div className="w-32 border-b border-zinc-400 ml-auto pb-1 text-center font-serif italic text-zinc-500 text-xs">
                    Meera Krishnan
                  </div>
                  <span className="font-bold text-black dark:text-white block">Adv. Meera Krishnan</span>
                  <span className="text-[10px] text-zinc-500 font-mono">High Court of Kerala</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. Request Retainer Invoice Modal                              */}
      {/* ============================================================== */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">Request Retainer Fee Memo</h3>
                <p className="text-xs text-zinc-500">Generate an itemized fee invoice for ongoing court representation or briefing.</p>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Case / Matter</label>
                <input
                  type="text"
                  value={reqMatterTitle}
                  onChange={(e) => setReqMatterTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Service / Briefing Description
                </label>
                <input
                  type="text"
                  value={reqServiceDesc}
                  onChange={(e) => setReqServiceDesc(e.target.value)}
                  placeholder="e.g. High Court Senior Appearance Fee"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Estimated Retainer Amount (₹)
                </label>
                <input
                  type="number"
                  value={reqAmount}
                  onChange={(e) => setReqAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                />
                <span className="text-[10px] text-zinc-400 font-mono">
                  Plus standard 18% GST = ₹{Math.round(reqAmount * 1.18).toLocaleString("en-IN")} Total
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateRequest}
                disabled={isSubmittingRequest || !reqServiceDesc.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSubmittingRequest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Invoice...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Issue Retainer Invoice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
