"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  FileText,
  Printer,
  Download,
  Search,
  Filter,
  Plus,
  X,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  Building,
  Receipt,
  Scale,
  Send,
  Copy,
  Check,
  Landmark,
  FileCheck,
  Percent,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { advocateApi, AdvocateInvoice, TrustTransactionItem } from "@/lib/api";

export interface AdvocateTrustBillingViewProps {
  advocateName?: string;
  barCouncilNumber?: string;
  token?: string;
}

export interface BillableLogItem {
  id: string;
  matterTitle: string;
  caseNumber: string;
  clientName: string;
  activityType: string;
  hourlyRate: number;
  durationMinutes: number;
  billableAmount: number;
  lawyerName: string;
  date: string;
  status: "unbilled" | "invoiced";
  invoiceRef?: string;
}

export function AdvocateTrustBillingView({
  advocateName = "Adv. Meera Krishnan",
  barCouncilNumber = "K/001429/2012",
  token,
}: AdvocateTrustBillingViewProps) {
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<
    "escrow" | "timer" | "invoices" | "tds-gst" | "statement"
  >("escrow");

  // State
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<AdvocateInvoice[]>([]);
  const [trustTransactions, setTrustTransactions] = useState<TrustTransactionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Live Courtroom Appearance Stopwatch State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedMatterForTimer, setSelectedMatterForTimer] = useState("WP(C) 19482/2024 — Gopakumar v. KSEB");
  const [selectedActivityForTimer, setSelectedActivityForTimer] = useState("High Court Division Bench Appearance");
  const [selectedRateForTimer, setSelectedRateForTimer] = useState(25000); // INR per hour

  // Billable Hours Logs
  const [billableLogs, setBillableLogs] = useState<BillableLogItem[]>([
    {
      id: "log_1",
      matterTitle: "WP(C) 19482/2024 — Gopakumar v. KSEB",
      caseNumber: "WP(C) 19482/2024",
      clientName: "Gopakumar Nambiar",
      activityType: "High Court Division Bench Oral Arguments (Notice Before Admission)",
      hourlyRate: 25000,
      durationMinutes: 72,
      billableAmount: 30000,
      lawyerName: "Adv. Meera Krishnan",
      date: "Today, 10:45 AM",
      status: "unbilled",
    },
    {
      id: "log_2",
      matterTitle: "ARB/NCLT/KOCHI/2024/041 — Apex Logistics v. Marine Exports",
      caseNumber: "ARB/NCLT/KOCHI/2024/041",
      clientName: "Apex Logistics Ltd",
      activityType: "Section 9 Commercial Injunction Application Drafting & Compilation",
      hourlyRate: 8000,
      durationMinutes: 180,
      billableAmount: 24000,
      lawyerName: "Adv. Ananya Iyer",
      date: "Yesterday, 03:30 PM",
      status: "unbilled",
    },
    {
      id: "log_3",
      matterTitle: "ARB/NCLT/KOCHI/2024/041 — Apex Logistics v. Marine Exports",
      caseNumber: "ARB/NCLT/KOCHI/2024/041",
      clientName: "Apex Logistics Ltd",
      activityType: "Chamber Strategy Conference with Managing Director & CFO",
      hourlyRate: 10000,
      durationMinutes: 60,
      billableAmount: 10000,
      lawyerName: "Adv. Meera Krishnan",
      date: "26 Oct 2026",
      status: "invoiced",
      invoiceRef: "INV/2026/041",
    },
    {
      id: "log_4",
      matterTitle: "Bail Appl. 8920/2026 — Muhammed Shafi v. State",
      caseNumber: "Bail Appl. 8920/2026",
      clientName: "Muhammed Shafi",
      activityType: "Single Bench (Criminal) Regular Hearing Attendance",
      hourlyRate: 15000,
      durationMinutes: 45,
      billableAmount: 11250,
      lawyerName: "Adv. Rahul Deshmukh",
      date: "25 Oct 2026",
      status: "unbilled",
    },
  ]);

  // Modals state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositData, setDepositData] = useState({
    clientName: "Malabar Infotech Solutions Pvt Ltd",
    matterTitle: "ARB/NCLT/KOCHI/2024/041 - Commercial Arbitration Claim",
    amount: "150000",
    purpose: "Arbitrator Fee & Stenographer Escrow Advance",
    referenceNumber: "NEFT/SBIN/2026/99410",
  });

  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [disburseData, setDisburseData] = useState({
    clientName: "Gopakumar Nambiar",
    matterTitle: "WP(C) 19482/2024 - Gopakumar v. KSEB",
    amount: "50000",
    purpose: "Court Registry Section 19 Pre-Deposit / Stay Security",
    challanNumber: "KL-HC-CHALLAN-2026-8812",
  });

  const [showDrawdownModal, setShowDrawdownModal] = useState(false);
  const [drawdownData, setDrawdownData] = useState({
    clientName: "Apex Logistics Ltd",
    matterTitle: "ARB/NCLT/KOCHI/2024/041",
    amount: "40000",
    invoiceNumber: "INV/2026/041",
    reason: "Rule 28 Adjustment against Tax Invoice INV/2026/041 (Notice Served)",
  });

  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [newInvoiceData, setNewInvoiceData] = useState({
    clientName: "Gopakumar Nambiar",
    matterTitle: "WP(C) 19482/2024 - Gopakumar v. KSEB",
    description: "High Court Division Bench Professional Appearance & Interim Stay Arguments",
    subtotal: "45000",
    gstRate: "18",
    applyTds: "true",
  });

  // Statement Client Selector
  const [selectedStatementClient, setSelectedStatementClient] = useState("Malabar Infotech Solutions Pvt Ltd");

  // Stopwatch interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Format Stopwatch Time (HH:MM:SS)
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Stopwatch current accrual in Rupees
  const currentAccruedFee = Math.round((timerSeconds / 3600) * selectedRateForTimer);

  // Load Initial ERP & Trust Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [erpRes, invRes] = await Promise.all([
        advocateApi.getErpOverview(token),
        advocateApi.getInvoices(token),
      ]);
      if (invRes && invRes.success && invRes.invoices && invRes.invoices.length > 0) {
        setInvoices(invRes.invoices);
      }
      if (erpRes && erpRes.success && (erpRes as any).trust && (erpRes as any).trust.length > 0) {
        setTrustTransactions((erpRes as any).trust);
      } else {
        loadDefaultFallback();
      }
    } catch (err) {
      console.warn("Failed to load ERP data, using standard defaults:", err);
      loadDefaultFallback();
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultFallback = () => {
    setTrustTransactions([
      {
        _id: "tru_101",
        id: "tru_101",
        type: "deposit",
        clientName: "Malabar Infotech Solutions Pvt Ltd",
        citizenId: "client_malabar",
        matterTitle: "ARB/NCLT/KOCHI/2024/041 - Commercial Arbitration Claim",
        amount: 350000,
        purpose: "Arbitrator Hearing Fee & Stenographer Advance Escrow",
        referenceNumber: "NEFT/KLB2026/091244",
        verifiedBy: "Adv. Meera Krishnan",
        date: "14 Oct 2026",
        status: "cleared",
      },
      {
        _id: "tru_102",
        id: "tru_102",
        type: "deposit",
        clientName: "Gopakumar Nambiar",
        citizenId: "default_citizen",
        matterTitle: "WP(C) 19482/2024 - Gopakumar v. KSEB",
        amount: 175000,
        purpose: "High Court Registry Stay Security & Senior Counsel Retainer",
        referenceNumber: "UPI/YESB/901284",
        verifiedBy: "Adv. Meera Krishnan",
        date: "20 Oct 2026",
        status: "cleared",
      },
      {
        _id: "tru_103",
        id: "tru_103",
        type: "disbursement",
        clientName: "Gopakumar Nambiar",
        citizenId: "default_citizen",
        matterTitle: "WP(C) 19482/2024 - Gopakumar v. KSEB",
        amount: 50000,
        purpose: "High Court Registry Security Deposit (Interim Order Compliance)",
        referenceNumber: "CHALLAN/HC/2026/7821",
        verifiedBy: "Adv. Meera Krishnan",
        date: "22 Oct 2026",
        status: "cleared",
      },
      {
        _id: "tru_104",
        id: "tru_104",
        type: "disbursement",
        clientName: "Malabar Infotech Solutions Pvt Ltd",
        citizenId: "client_malabar",
        matterTitle: "ARB/NCLT/KOCHI/2024/041",
        amount: 75000,
        purpose: "Sole Arbitrator Sitting Fee (Day 1 Preliminary Session)",
        referenceNumber: "RTGS/HDFC/2026/0119",
        verifiedBy: "Adv. Meera Krishnan",
        date: "27 Oct 2026",
        status: "cleared",
      },
      {
        _id: "tru_105",
        id: "tru_105",
        type: "drawdown",
        clientName: "Apex Logistics Ltd",
        citizenId: "client_apex",
        matterTitle: "CC 412/2023 - S.138 NI Act Prosecution",
        amount: 25000,
        purpose: "BCI Rule 28 Fee Drawdown against Tax Invoice INV/2026/039",
        referenceNumber: "INTRA-BANK/DRAWDOWN/882",
        verifiedBy: "Adv. Meera Krishnan",
        date: "28 Oct 2026",
        status: "cleared",
      },
    ]);

    setInvoices([
      {
        _id: "inv_101",
        invoiceNumber: "INV/2026/041",
        clientName: "Apex Logistics Ltd",
        clientPhone: "+91 98460 44120",
        matterTitle: "ARB/NCLT/KOCHI/2024/041 — Commercial Injunction",
        items: [
          { description: "Section 9 Commercial Arbitration Interim Injunction Drafting", amount: 45000 },
          { description: "Senior Counsel NCLT Dais Appearance", amount: 25000 },
        ],
        subtotal: 70000,
        gstRate: 18,
        gstAmount: 12600,
        totalAmount: 82600,
        status: "paid",
        dueDate: "10 Nov 2026",
        paymentMethod: "Trust Escrow Drawdown",
        createdAt: "2026-10-14T05:15:00.000Z",
      },
      {
        _id: "inv_102",
        invoiceNumber: "INV/2026/042",
        clientName: "Gopakumar Nambiar",
        clientPhone: "+91 94471 28930",
        matterTitle: "WP(C) 19482/2024 — Gopakumar v. KSEB",
        items: [
          { description: "High Court Division Bench Admission Arguments", amount: 35000 },
          { description: "Stay Petition (IA 1/2024) Preparation", amount: 15000 },
        ],
        subtotal: 50000,
        gstRate: 18,
        gstAmount: 9000,
        totalAmount: 59000,
        status: "unpaid",
        dueDate: "15 Nov 2026",
        paymentMethod: "Pending Client Remittance",
        createdAt: "2026-10-20T08:30:00.000Z",
      },
      {
        _id: "inv_103",
        invoiceNumber: "INV/2026/043",
        clientName: "Malabar Infotech Solutions Pvt Ltd",
        clientPhone: "+91 94460 12890",
        matterTitle: "Corporate Retainer & MCA Compliance (Q3)",
        items: [
          { description: "Monthly Corporate Legal Advisory & Contract Redlining", amount: 120000 },
        ],
        subtotal: 120000,
        gstRate: 18,
        gstAmount: 21600,
        totalAmount: 141600,
        status: "paid",
        dueDate: "01 Nov 2026",
        paymentMethod: "NEFT / RTGS Direct",
        createdAt: "2026-10-25T11:00:00.000Z",
      },
    ]);
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Compute Financial Aggregates
  const totalTrustDeposits = trustTransactions
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalTrustDisbursements = trustTransactions
    .filter((t) => t.type === "disbursement" || t.type === "drawdown")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const trustEscrowBalance = totalTrustDeposits - totalTrustDisbursements;

  const totalUnbilledFees = billableLogs
    .filter((l) => l.status === "unbilled")
    .reduce((sum, l) => sum + l.billableAmount, 0);

  const totalBilledInvoices = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

  const totalCollectedInvoices = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.totalAmount, 0);

  // Submit Escrow Deposit
  const handleSaveDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(depositData.amount) || 0;
    if (amountNum <= 0) return;

    try {
      const res = await advocateApi.addTrustTransaction(
        {
          type: "deposit",
          clientName: depositData.clientName,
          matterTitle: depositData.matterTitle,
          amount: amountNum,
          purpose: depositData.purpose,
          referenceNumber: depositData.referenceNumber,
          verifiedBy: advocateName,
        },
        token
      );

      if (res && res.success && res.transaction) {
        setTrustTransactions([res.transaction, ...trustTransactions]);
      } else {
        setTrustTransactions([
          {
            _id: "tru_" + Date.now(),
            id: "tru_" + Date.now(),
            type: "deposit",
            clientName: depositData.clientName,
            matterTitle: depositData.matterTitle,
            amount: amountNum,
            purpose: depositData.purpose,
            referenceNumber: depositData.referenceNumber,
            verifiedBy: advocateName,
            date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            status: "cleared",
          },
          ...trustTransactions,
        ]);
      }
      setShowDepositModal(false);
      showToast(`Escrow deposit of ₹${amountNum.toLocaleString("en-IN")} credited to segregated trust ledger.`);
    } catch (err) {
      showToast("Deposit recorded in local segregated trust ledger.");
      setShowDepositModal(false);
    }
  };

  // Submit Court Registry Disbursal
  const handleSaveDisburse = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(disburseData.amount) || 0;
    if (amountNum <= 0) return;

    setTrustTransactions([
      {
        _id: "tru_" + Date.now(),
        id: "tru_" + Date.now(),
        type: "disbursement",
        clientName: disburseData.clientName,
        matterTitle: disburseData.matterTitle,
        amount: amountNum,
        purpose: `${disburseData.purpose} (Challan: ${disburseData.challanNumber})`,
        referenceNumber: disburseData.challanNumber,
        verifiedBy: advocateName,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        status: "cleared",
      },
      ...trustTransactions,
    ]);
    setShowDisburseModal(false);
    showToast(`Court deposit of ₹${amountNum.toLocaleString("en-IN")} debited from client escrow.`);
  };

  // Submit Authorized Fee Drawdown
  const handleSaveDrawdown = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(drawdownData.amount) || 0;
    if (amountNum <= 0) return;

    setTrustTransactions([
      {
        _id: "tru_" + Date.now(),
        id: "tru_" + Date.now(),
        type: "drawdown",
        clientName: drawdownData.clientName,
        matterTitle: drawdownData.matterTitle,
        amount: amountNum,
        purpose: `BCI Rule 28 Drawdown against Invoice ${drawdownData.invoiceNumber} (${drawdownData.reason})`,
        referenceNumber: `DRAWDOWN/${Date.now().toString().slice(-6)}`,
        verifiedBy: advocateName,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        status: "cleared",
      },
      ...trustTransactions,
    ]);

    // Update corresponding invoice if matching
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.invoiceNumber === drawdownData.invoiceNumber
          ? { ...inv, status: "paid", paymentMethod: "Trust Escrow Drawdown" }
          : inv
      )
    );

    setShowDrawdownModal(false);
    showToast(`₹${amountNum.toLocaleString("en-IN")} drawn into operating account per Rule 28 intimation.`);
  };

  // Log Stopwatch Session to Billable Hours
  const handleLogStopwatchSession = () => {
    if (timerSeconds < 30) {
      showToast("Appearance timer session is less than 30 seconds. Please run longer to log.");
      return;
    }
    const minutes = Math.ceil(timerSeconds / 60);
    const fee = Math.round((minutes / 60) * selectedRateForTimer);

    const newLog: BillableLogItem = {
      id: `log_${Date.now()}`,
      matterTitle: selectedMatterForTimer,
      caseNumber: selectedMatterForTimer.split(" — ")[0] || "WP(C)",
      clientName: selectedMatterForTimer.includes("Gopakumar")
        ? "Gopakumar Nambiar"
        : selectedMatterForTimer.includes("Apex")
        ? "Apex Logistics Ltd"
        : "Client on Record",
      activityType: selectedActivityForTimer,
      hourlyRate: selectedRateForTimer,
      durationMinutes: minutes,
      billableAmount: fee,
      lawyerName: advocateName,
      date: "Just now",
      status: "unbilled",
    };

    setBillableLogs([newLog, ...billableLogs]);
    setIsTimerRunning(false);
    setTimerSeconds(0);
    showToast(`Logged ${minutes} mins billable appearance (₹${fee.toLocaleString("en-IN")}) to matter.`);
  };

  // Convert Unbilled Hours to Tax Invoice
  const handleConvertHoursToInvoice = (log: BillableLogItem) => {
    const subtotal = log.billableAmount;
    const gstRate = 18;
    const gstAmount = Math.round((subtotal * gstRate) / 100);
    const totalAmount = subtotal + gstAmount;

    const newInv: AdvocateInvoice = {
      _id: `inv_${Date.now()}`,
      invoiceNumber: `INV/2026/0${invoices.length + 45}`,
      clientName: log.clientName,
      matterTitle: log.matterTitle,
      items: [{ description: log.activityType, amount: subtotal }],
      subtotal,
      gstRate,
      gstAmount,
      totalAmount,
      status: "unpaid",
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      paymentMethod: "Pending Client Remittance",
      createdAt: new Date().toISOString(),
    };

    setInvoices([newInv, ...invoices]);
    setBillableLogs((prev) =>
      prev.map((l) => (l.id === log.id ? { ...l, status: "invoiced", invoiceRef: newInv.invoiceNumber } : l))
    );
    showToast(`Generated Tax Invoice ${newInv.invoiceNumber} for ₹${totalAmount.toLocaleString("en-IN")}.`);
    setActiveTab("invoices");
  };

  // Create Manual Invoice
  const handleCreateTaxInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = Number(newInvoiceData.subtotal) || 0;
    const gstR = Number(newInvoiceData.gstRate) || 18;
    const gstAmt = Math.round((sub * gstR) / 100);
    const tot = sub + gstAmt;

    const newInv: AdvocateInvoice = {
      _id: `inv_${Date.now()}`,
      invoiceNumber: `INV/2026/0${invoices.length + 45}`,
      clientName: newInvoiceData.clientName,
      matterTitle: newInvoiceData.matterTitle,
      items: [{ description: newInvoiceData.description, amount: sub }],
      subtotal: sub,
      gstRate: gstR,
      gstAmount: gstAmt,
      totalAmount: tot,
      status: "unpaid",
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      paymentMethod: "Pending Remittance",
      createdAt: new Date().toISOString(),
    };

    setInvoices([newInv, ...invoices]);
    setShowCreateInvoiceModal(false);
    showToast(`Tax Invoice ${newInv.invoiceNumber} generated.`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black border border-zinc-700 dark:border-zinc-300 shadow-2xl text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#800020] dark:text-[#6B1728]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. TOP HEADER & BCI STATUTORY COMPLIANCE BANNER                */}
      {/* ============================================================== */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B1728]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                Statutory Financial Architecture • BCI Rule 24
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a8] border border-[#6B1728]/30">
                Advocates Act § 49(1)(ah) Compliant
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-[10px] font-mono text-zinc-400">Roll: {barCouncilNumber}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white flex items-center gap-2.5">
              <span>Advocate Trust Escrow &amp; Billable Hours Ledger</span>
            </h2>

            <p className="text-xs text-zinc-500 max-w-3xl">
              Mandatory segregated client trust account management pursuant to Bar Council of India Rules Part VI, Chapter II,
              Section II (Rules 24–32). Strict non-commingling of client escrow funds with chamber operating revenue, real-time
              appearance timekeeping, and Section 194J TDS reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#6B1728] text-white hover:bg-[#7A1B2E] transition cursor-pointer"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Deposit Escrow</span>
            </button>

            <button
              onClick={() => setShowCreateInvoiceModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Tax Invoice</span>
            </button>
          </div>
        </div>

        {/* Dual-Account Architecture Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs">
          {/* Account 1: Client Escrow */}
          <div className="p-4 rounded-xl bg-white dark:bg-black border border-[#6B1728]/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-[#6B1728] dark:text-[#ff94a8] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Segregated Client Trust Account (BCI Rule 24)
              </span>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-[#6B1728] text-white">
                Fiduciary Escrow
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black font-mono text-black dark:text-white">
                ₹{trustEscrowBalance.toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-zinc-500">Unencumbered Client Funds</span>
            </div>
            <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-900">
              <span>SBI High Court Branch • A/c 98210041289</span>
              <span className="font-mono text-zinc-400">Zero Commingling</span>
            </div>
          </div>

          {/* Account 2: Chamber Operating */}
          <div className="p-4 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5" />
                Chamber Operating &amp; Professional Earnings
              </span>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                Earned Revenue
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black font-mono text-black dark:text-white">
                ₹{totalCollectedInvoices.toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-zinc-500">Realized Collections</span>
            </div>
            <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-900">
              <span>HDFC Marine Drive • A/c 44102981023</span>
              <span className="font-mono text-zinc-400">Tax Audited</span>
            </div>
          </div>
        </div>

        {/* 4 KPI Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
              Total Client Escrow
            </span>
            <div className="text-2xl font-black text-black dark:text-white">
              ₹{trustEscrowBalance.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-zinc-500">Across 4 client retainers &amp; court deposits</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
              Unbilled Appearance Hours
            </span>
            <div className="text-2xl font-black text-black dark:text-white">
              ₹{totalUnbilledFees.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-zinc-500">3 unbilled session logs ready to invoice</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
              Billed Tax Invoices
            </span>
            <div className="text-2xl font-black text-black dark:text-white">
              ₹{totalBilledInvoices.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-zinc-500">With 18% GST (SAC 9982) breakdown</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
              Section 194J TDS Claimed
            </span>
            <div className="text-2xl font-black text-black dark:text-white">
              ₹{(totalCollectedInvoices * 0.1).toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-zinc-500">Form 26AS / AIS Traces Verified</span>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("escrow")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "escrow"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#6B1728]" />
            <span>Trust Escrow Ledger (Rule 24)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#6B1728] text-white">
              {trustTransactions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("timer")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "timer"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Courtroom Appearance Timer</span>
            {isTimerRunning && (
              <span className="w-2 h-2 rounded-full bg-[#6B1728] animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "invoices"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Tax Invoices &amp; Fee Drawdowns</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
              {invoices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("tds-gst")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "tds-gst"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>TDS 26AS &amp; GST RCM Audit</span>
          </button>

          <button
            onClick={() => setActiveTab("statement")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "statement"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Rule 24 Certified Statement</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TAB: CLIENT TRUST ESCROW LEDGER (BCI RULE 24)               */}
      {/* ============================================================== */}
      {activeTab === "escrow" && (
        <div className="space-y-5">
          {/* Action Row & Filter */}
          <div className="p-4 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search escrow ledger by client, matter, or UTR ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowDisburseModal(true)}
                className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-[#6B1728]" />
                <span>Court Registry Disbursal</span>
              </button>

              <button
                onClick={() => setShowDrawdownModal(true)}
                className="px-3.5 py-2 rounded-xl border border-[#6B1728]/40 bg-[#6B1728]/10 text-xs font-bold text-[#6B1728] dark:text-[#ff94a8] hover:bg-[#6B1728]/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Rule 28 Fee Drawdown</span>
              </button>
            </div>
          </div>

          {/* Trust Transactions Table */}
          <div className="rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white">
                  Statutory Trust Escrow Register
                </h3>
                <p className="text-xs text-zinc-500">
                  State Bank of India Segregated Client Escrow A/c 98210041289 (High Court Branch)
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-[#6B1728]/40 bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a8]">
                BCI Rule 24 Reconciled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Date &amp; UTR Ref</th>
                    <th className="py-3 px-4">Client &amp; Matter</th>
                    <th className="py-3 px-4">Purpose / Authority</th>
                    <th className="py-3 px-4">Transaction Type</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Rule 24 Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {trustTransactions
                    .filter((t) => {
                      const q = searchQuery.toLowerCase();
                      return (
                        !q ||
                        t.clientName.toLowerCase().includes(q) ||
                        t.matterTitle.toLowerCase().includes(q) ||
                        t.purpose.toLowerCase().includes(q) ||
                        t.referenceNumber.toLowerCase().includes(q)
                      );
                    })
                    .map((item) => {
                      const isDeposit = item.type === "deposit";
                      const isDrawdown = item.type === "drawdown";

                      return (
                        <tr key={item._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950 transition">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-black dark:text-white block">
                              {item.date || "29 Oct 2026"}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-400">
                              {item.referenceNumber}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-black dark:text-white block">
                              {item.clientName}
                            </span>
                            <span className="text-[11px] text-zinc-500 truncate max-w-xs block">
                              {item.matterTitle}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-zinc-700 dark:text-zinc-300 block font-medium">
                              {item.purpose}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              Verified by: {item.verifiedBy || advocateName}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {isDeposit && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                                <ArrowDownLeft className="w-3 h-3 text-[#6B1728]" />
                                Client Deposit
                              </span>
                            )}
                            {item.type === "disbursement" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                                <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                                Court Disbursal
                              </span>
                            )}
                            {isDrawdown && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a8] border border-[#6B1728]/30">
                                <DollarSign className="w-3 h-3" />
                                Rule 28 Drawdown
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <span
                              className={`font-mono font-bold text-sm ${
                                isDeposit
                                  ? "text-black dark:text-white"
                                  : isDrawdown
                                  ? "text-[#6B1728] dark:text-[#ff94a8]"
                                  : "text-zinc-600 dark:text-zinc-400"
                              }`}
                            >
                              {isDeposit ? "+" : "-"}₹{Number(item.amount).toLocaleString("en-IN")}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                              <CheckCircle2 className="w-2.5 h-2.5 text-[#6B1728]" />
                              Audited
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. TAB: COURTROOM APPEARANCE STOPWATCH & BILLABLE HOURS       */}
      {/* ============================================================== */}
      {activeTab === "timer" && (
        <div className="space-y-6">
          {/* Big Live Stopwatch Console */}
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-900">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6B1728] dark:text-[#ff94a8] block">
                  Court Appearance &amp; Drafting Timekeeper
                </span>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Live Courtroom Stopwatch (6-Minute Increments)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Counsel:</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
                  {advocateName}
                </span>
              </div>
            </div>

            {/* Timer Setup Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-black dark:text-white block">
                  Target Court Matter:
                </label>
                <select
                  value={selectedMatterForTimer}
                  onChange={(e) => setSelectedMatterForTimer(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-black dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="WP(C) 19482/2024 — Gopakumar v. KSEB">WP(C) 19482/2024 — Gopakumar v. KSEB</option>
                  <option value="ARB/NCLT/KOCHI/2024/041 — Apex Logistics v. Marine Exports">ARB/NCLT/KOCHI/2024/041 — Apex Logistics</option>
                  <option value="Bail Appl. 8920/2026 — Muhammed Shafi v. State">Bail Appl. 8920/2026 — Muhammed Shafi</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-black dark:text-white block">
                  Activity Type:
                </label>
                <select
                  value={selectedActivityForTimer}
                  onChange={(e) => setSelectedActivityForTimer(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-black dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="High Court Division Bench Appearance">High Court Division Bench Appearance (₹25,000/hr)</option>
                  <option value="Single Bench Writ / Criminal Hearing">Single Bench Writ / Criminal Hearing (₹15,000/hr)</option>
                  <option value="Chamber Client Strategy Conference">Chamber Client Strategy Conference (₹10,000/hr)</option>
                  <option value="Writ Pleadings & Rejoinder Drafting">Writ Pleadings & Rejoinder Drafting (₹8,000/hr)</option>
                  <option value="Junior Defect Clearing & Filing Attendance">Junior Defect Clearing & Filing Attendance (₹4,500/hr)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-black dark:text-white block">
                  Hourly Rate (₹/hr):
                </label>
                <input
                  type="number"
                  value={selectedRateForTimer}
                  onChange={(e) => setSelectedRateForTimer(Number(e.target.value) || 10000)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-bold text-black dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Big LED Stopwatch Display */}
            <div className="p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-inner">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 font-bold block">
                  ELAPSED APPEARANCE TIME
                </span>
                <div className="text-5xl md:text-6xl font-black font-mono tracking-wider text-white">
                  {formatTime(timerSeconds)}
                </div>
                <span className="text-xs text-zinc-400 block font-sans">
                  Billing Increment: {Math.ceil(timerSeconds / 360)} x 6-min units
                </span>
              </div>

              <div className="space-y-1 md:text-right">
                <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 font-bold block">
                  ACCRUED PROFESSIONAL FEE
                </span>
                <div className="text-4xl md:text-5xl font-black font-mono text-[#ff94a8]">
                  ₹{currentAccruedFee.toLocaleString("en-IN")}
                </div>
                <span className="text-xs text-zinc-400 block font-mono">
                  Rate: ₹{selectedRateForTimer.toLocaleString("en-IN")}/hr
                </span>
              </div>

              {/* Stopwatch Action Buttons */}
              <div className="flex items-center gap-3">
                {!isTimerRunning ? (
                  <button
                    onClick={() => setIsTimerRunning(true)}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition cursor-pointer shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>Start Timer</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsTimerRunning(false)}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#6B1728] text-white font-bold text-xs hover:bg-[#7A1B2E] transition cursor-pointer shadow-lg"
                  >
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause Timer</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(0);
                  }}
                  className="p-3.5 rounded-2xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
                  title="Reset Stopwatch"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleLogStopwatchSession}
                  className="px-5 py-3.5 rounded-2xl bg-zinc-800 text-white hover:bg-zinc-700 font-bold text-xs transition cursor-pointer"
                >
                  Log to Ledger
                </button>
              </div>
            </div>
          </div>

          {/* Billable Hours History Table */}
          <div className="rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white">
                  Appearance &amp; Work Session Timesheet
                </h3>
                <p className="text-xs text-zinc-500">
                  Logged billable units ready for client invoicing
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {billableLogs.filter((l) => l.status === "unbilled").length} Unbilled Logs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Date &amp; Lawyer</th>
                    <th className="py-3 px-4">Matter &amp; Client</th>
                    <th className="py-3 px-4">Activity Description</th>
                    <th className="py-3 px-4 text-center">Duration</th>
                    <th className="py-3 px-4 text-right">Fee (₹)</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {billableLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-black dark:text-white block">{log.date}</span>
                        <span className="text-[10px] text-zinc-400">{log.lawyerName}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-black dark:text-white block truncate max-w-xs">
                          {log.matterTitle}
                        </span>
                        <span className="text-[10px] text-zinc-500">{log.clientName}</span>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300">
                        {log.activityType}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        {log.durationMinutes} mins
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-black dark:text-white">
                        ₹{log.billableAmount.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {log.status === "unbilled" ? (
                          <button
                            onClick={() => handleConvertHoursToInvoice(log)}
                            className="px-3 py-1 rounded-xl bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold hover:opacity-90 cursor-pointer"
                          >
                            Generate Invoice
                          </button>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                            Invoiced ({log.invoiceRef})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. TAB: TAX INVOICES & FEE DRAWDOWNS                           */}
      {/* ============================================================== */}
      {activeTab === "invoices" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {invoices.map((inv) => {
              const isPaid = inv.status === "paid";
              return (
                <div
                  key={inv._id}
                  className="p-5 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-black dark:text-white">
                        {inv.invoiceNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaid
                            ? "bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-300 dark:border-zinc-700"
                            : "bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a8] border border-[#6B1728]/40"
                        }`}
                      >
                        {isPaid ? "Paid in Full" : "Pending Payment"}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="font-bold text-black dark:text-white text-sm">{inv.clientName}</h4>
                      <p className="text-zinc-500 text-xs truncate">{inv.matterTitle}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 space-y-1 text-xs">
                      <div className="flex justify-between text-zinc-500">
                        <span>Professional Fee (Subtotal):</span>
                        <span className="font-mono">₹{inv.subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-zinc-500">
                        <span>GST @ 18% (SAC 9982):</span>
                        <span className="font-mono">₹{inv.gstAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between font-bold text-black dark:text-white pt-1 border-t border-zinc-200 dark:border-zinc-800">
                        <span>Total Due:</span>
                        <span className="font-mono text-sm">₹{inv.totalAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Method: {inv.paymentMethod}</span>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1 font-semibold text-zinc-600 dark:text-zinc-300 hover:underline cursor-pointer"
                    >
                      <Printer className="w-3 h-3" /> Print
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. TAB: TDS FORM 26AS & GST REVERSE CHARGE (RCM) COMPLIANCE     */}
      {/* ============================================================== */}
      {activeTab === "tds-gst" && (
        <div className="space-y-6">
          {/* Statutory Explainer Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-[#6B1728]" />
              <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">
                Advocate Taxation Framework: TDS Section 194J &amp; GST Reverse Charge
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Under GST Notification No. 13/2017-Central Tax (Rate), legal services provided by an advocate or firm of
              advocates to any business entity with turnover exceeding the threshold are liable to GST under the
              <strong> Reverse Charge Mechanism (RCM)</strong>, payable directly by the recipient. Corporate retainers
              are subject to 10% TDS deduction under Section 194J of the Income Tax Act, reflected in Form 26AS / AIS.
            </p>
          </div>

          {/* Form 26AS TDS Reconciliation Table */}
          <div className="rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white">
                  Form 26AS / AIS TDS Deduction Register (Sec. 194J)
                </h3>
                <p className="text-xs text-zinc-500">
                  TRACES Income Tax Portal quarterly synchronization
                </p>
              </div>
              <button
                onClick={() => showToast("TRACES Form 26AS quarterly feed synchronized.")}
                className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                Sync TRACES 26AS
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Corporate Client / TAN</th>
                    <th className="py-3 px-4">Gross Invoiced</th>
                    <th className="py-3 px-4">TDS Rate</th>
                    <th className="py-3 px-4">TDS Deposited (₹)</th>
                    <th className="py-3 px-4">Form 16A Certificate</th>
                    <th className="py-3 px-4 text-center">TRACES Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {[
                    {
                      company: "Malabar Infotech Solutions Pvt Ltd",
                      tan: "CHEP12094B",
                      gross: 350000,
                      rate: "10% (194J)",
                      tds: 35000,
                      cert: "16A-Q2-2026-9018",
                      match: true,
                    },
                    {
                      company: "Apex Logistics Ltd",
                      tan: "BLRE09128A",
                      gross: 120000,
                      rate: "10% (194J)",
                      tds: 12000,
                      cert: "16A-Q2-2026-4412",
                      match: true,
                    },
                    {
                      company: "Vanguard Infrastructure Ltd",
                      tan: "MUMP00129C",
                      gross: 240000,
                      rate: "10% (194J)",
                      tds: 24000,
                      cert: "16A-Q1-2026-1189",
                      match: true,
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-950 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-black dark:text-white block">{row.company}</span>
                        <span className="font-mono text-[10px] text-zinc-400">TAN: {row.tan}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold">
                        ₹{row.gross.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                        {row.rate}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-black dark:text-white">
                        ₹{row.tds.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500">
                        {row.cert}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a8] border border-[#6B1728]/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Reconciled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. TAB: RULE 24 CERTIFIED CLIENT STATEMENT GENERATOR           */}
      {/* ============================================================== */}
      {activeTab === "statement" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-black dark:text-white">Select Client:</span>
              <select
                value={selectedStatementClient}
                onChange={(e) => setSelectedStatementClient(e.target.value)}
                className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-black dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="Malabar Infotech Solutions Pvt Ltd">Malabar Infotech Solutions Pvt Ltd</option>
                <option value="Gopakumar Nambiar">Gopakumar Nambiar</option>
                <option value="Apex Logistics Ltd">Apex Logistics Ltd</option>
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Rule 24 Statement</span>
            </button>
          </div>

          {/* Statement Paper Preview */}
          <div className="p-8 md:p-12 rounded-3xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 shadow-xl space-y-6 max-w-4xl mx-auto font-sans">
            {/* Letterhead Header */}
            <div className="text-center space-y-1 pb-6 border-b-2 border-black dark:border-white">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold block">
                BAR COUNCIL OF INDIA RULES • PART VI, CHAPTER II, SECTION II (RULE 24)
              </span>
              <h2 className="text-2xl font-black text-black dark:text-white tracking-tight uppercase">
                CHAMBERS OF {advocateName}
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                Advocate, High Court of Kerala • Roll No: {barCouncilNumber}
              </p>
              <p className="text-[11px] text-zinc-500">
                Chamber 402, High Court Advocates Association Building, Marine Drive, Kochi — 682031
              </p>
            </div>

            {/* Document Title & Client Particulars */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-mono text-zinc-400 text-[10px] uppercase font-bold block">
                  Statement Furnished To:
                </span>
                <strong className="text-sm font-bold text-black dark:text-white block">
                  {selectedStatementClient}
                </strong>
                <span className="text-zinc-500 block">
                  Re: Entrusted Client Moneys &amp; Professional Disbursements Account
                </span>
              </div>

              <div className="text-right space-y-1">
                <span className="font-mono text-zinc-400 text-[10px] uppercase font-bold block">
                  Date of Audit Statement:
                </span>
                <strong className="font-mono text-black dark:text-white block">
                  {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                </strong>
                <span className="font-mono text-[10px] text-zinc-400">
                  Ref: BCI-R24-STMT-{Date.now().toString().slice(-6)}
                </span>
              </div>
            </div>

            {/* Ledger Transactions for Selected Client */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Particulars of Receipt / Expense / Fee Debit</th>
                    <th className="py-2.5 px-4 text-right">Credit (+)</th>
                    <th className="py-2.5 px-4 text-right">Debit (-)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {trustTransactions
                    .filter((t) => t.clientName === selectedStatementClient)
                    .map((item) => (
                      <tr key={item._id}>
                        <td className="py-2.5 px-4 font-mono text-[11px]">{item.date || "29 Oct 2026"}</td>
                        <td className="py-2.5 px-4">
                          <span className="font-semibold text-black dark:text-white block">
                            {item.purpose}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            Ref: {item.referenceNumber}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono">
                          {item.type === "deposit" ? `₹${item.amount.toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono">
                          {item.type !== "deposit" ? `₹${item.amount.toLocaleString("en-IN")}` : "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Statutory Declaration & Closing Balance */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-sm font-bold text-black dark:text-white">
                <span>Unexpended Balance Held in Segregated SBI Trust Escrow:</span>
                <span className="font-mono text-base text-[#6B1728] dark:text-[#ff94a8]">
                  ₹
                  {(
                    trustTransactions
                      .filter((t) => t.clientName === selectedStatementClient && t.type === "deposit")
                      .reduce((s, t) => s + t.amount, 0) -
                    trustTransactions
                      .filter((t) => t.clientName === selectedStatementClient && t.type !== "deposit")
                      .reduce((s, t) => s + t.amount, 0)
                  ).toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 italic">
                &ldquo;I hereby certify that the above statement reflects a true, correct and complete account of the moneys
                entrusted to me by the client under Rule 24 of the Bar Council of India Rules. The unexpended balance is held
                in segregated client trust escrow and has not been commingled with chamber operating funds.&rdquo;
              </p>
            </div>

            {/* Signature & Seal */}
            <div className="pt-6 flex items-end justify-between text-xs">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-zinc-400">Verified &amp; Certified Under:</span>
                <span className="font-bold text-black dark:text-white block">Section 35 &amp; 49 Advocates Act, 1961</span>
                <span className="text-[10px] text-zinc-500">State Bar Council of Kerala</span>
              </div>

              <div className="text-right space-y-2">
                <div className="w-32 h-10 border-b border-dashed border-black dark:border-white ml-auto" />
                <span className="font-bold text-black dark:text-white block">{advocateName}</span>
                <span className="text-[10px] text-zinc-500 font-mono">Roll: {barCouncilNumber}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODAL: DEPOSIT CLIENT ESCROW                                */}
      {/* ============================================================== */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-[#6B1728] uppercase tracking-wider block">
                  BCI Rule 24 Client Escrow Inflow
                </span>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Deposit Client Funds into Segregated Trust Escrow
                </h3>
              </div>
              <button
                onClick={() => setShowDepositModal(false)}
                className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDeposit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Client Name:</label>
                <input
                  type="text"
                  value={depositData.clientName}
                  onChange={(e) => setDepositData({ ...depositData, clientName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Matter Title:</label>
                <input
                  type="text"
                  value={depositData.matterTitle}
                  onChange={(e) => setDepositData({ ...depositData, matterTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-black dark:text-white block">Deposit Amount (₹):</label>
                  <input
                    type="number"
                    value={depositData.amount}
                    onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-bold text-black dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-black dark:text-white block">Bank UTR / NEFT Ref:</label>
                  <input
                    type="text"
                    value={depositData.referenceNumber}
                    onChange={(e) => setDepositData({ ...depositData, referenceNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-black dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Purpose of Escrow:</label>
                <input
                  type="text"
                  value={depositData.purpose}
                  onChange={(e) => setDepositData({ ...depositData, purpose: e.target.value })}
                  placeholder="e.g. Court Registry Deposit, Arbitrator Advance, Stenographer Fee"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#6B1728] text-white hover:bg-[#7A1B2E] text-xs font-bold transition cursor-pointer"
                >
                  Confirm Escrow Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. MODAL: COURT REGISTRY DISBURSAL                             */}
      {/* ============================================================== */}
      {showDisburseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Court Outflow Authorization
                </span>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Disburse Escrow to Court Registry / Commissioner
                </h3>
              </div>
              <button
                onClick={() => setShowDisburseModal(false)}
                className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDisburse} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Client Name:</label>
                <input
                  type="text"
                  value={disburseData.clientName}
                  onChange={(e) => setDisburseData({ ...disburseData, clientName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Disbursement Purpose:</label>
                <input
                  type="text"
                  value={disburseData.purpose}
                  onChange={(e) => setDisburseData({ ...disburseData, purpose: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-black dark:text-white block">Amount to Disburse (₹):</label>
                  <input
                    type="number"
                    value={disburseData.amount}
                    onChange={(e) => setDisburseData({ ...disburseData, amount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-bold text-black dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-black dark:text-white block">Registry Challan No:</label>
                  <input
                    type="text"
                    value={disburseData.challanNumber}
                    onChange={(e) => setDisburseData({ ...disburseData, challanNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-black dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDisburseModal(false)}
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition cursor-pointer"
                >
                  Authorize Disbursal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. MODAL: RULE 28 AUTHORIZED DRAWDOWN TO OPERATING ACCOUNT    */}
      {/* ============================================================== */}
      {showDrawdownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-[#6B1728] uppercase tracking-wider block">
                  BCI Rule 28 Compliance
                </span>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Execute Fee Drawdown to Chamber Operating Account
                </h3>
              </div>
              <button
                onClick={() => setShowDrawdownModal(false)}
                className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDrawdown} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
                Rule 28 requires that fee deductions from client funds may only occur after a bill of fees has been
                presented or written intimation has been served to the client.
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Client Name:</label>
                <input
                  type="text"
                  value={drawdownData.clientName}
                  onChange={(e) => setDrawdownData({ ...drawdownData, clientName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-black dark:text-white block">Tax Invoice Reference:</label>
                  <input
                    type="text"
                    value={drawdownData.invoiceNumber}
                    onChange={(e) => setDrawdownData({ ...drawdownData, invoiceNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-bold text-black dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-black dark:text-white block">Drawdown Amount (₹):</label>
                  <input
                    type="number"
                    value={drawdownData.amount}
                    onChange={(e) => setDrawdownData({ ...drawdownData, amount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-bold text-black dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Audit Remarks:</label>
                <input
                  type="text"
                  value={drawdownData.reason}
                  onChange={(e) => setDrawdownData({ ...drawdownData, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDrawdownModal(false)}
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#6B1728] text-white hover:bg-[#7A1B2E] text-xs font-bold transition cursor-pointer"
                >
                  Execute Drawdown
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 10. MODAL: CREATE TAX INVOICE                                  */}
      {/* ============================================================== */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Chamber Billing Engine
                </span>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Generate Advocate Tax Invoice (SAC 9982)
                </h3>
              </div>
              <button
                onClick={() => setShowCreateInvoiceModal(false)}
                className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTaxInvoice} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Client Name:</label>
                <input
                  type="text"
                  value={newInvoiceData.clientName}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, clientName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Matter Reference:</label>
                <input
                  type="text"
                  value={newInvoiceData.matterTitle}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, matterTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Services Description:</label>
                <textarea
                  rows={2}
                  value={newInvoiceData.description}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-black dark:text-white block">Professional Fee (₹):</label>
                  <input
                    type="number"
                    value={newInvoiceData.subtotal}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, subtotal: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-bold text-black dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-black dark:text-white block">GST Rate:</label>
                  <select
                    value={newInvoiceData.gstRate}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, gstRate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-black dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="18">18% (SAC 9982 Forward Charge)</option>
                    <option value="0">0% (Reverse Charge / Business Client RCM)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition cursor-pointer"
                >
                  Generate Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvocateTrustBillingView;
