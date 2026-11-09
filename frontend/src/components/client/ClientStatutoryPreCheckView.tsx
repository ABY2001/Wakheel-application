"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  ShieldCheck,
  Scale,
  Calculator,
  Percent,
  FileCheck,
  Building2,
  Copy,
  Check,
  Printer,
  Download,
  AlertTriangle,
  Info,
  Send,
  RefreshCw,
  Plus,
  Trash2,
  ChevronRight,
  FileText,
  Clock,
  Layers,
  ArrowRight,
  Lock,
  Hash,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import {
  csCaCopilotApi,
  Section186Params,
  Clause43bParams,
  GstDrc01Params,
  MsmeInvoiceItem,
} from "@/lib/csCaCopilotApi";

interface ClientStatutoryPreCheckViewProps {
  clientName?: string;
  cin?: string;
  pan?: string;
  gstin?: string;
  onInitiateFiling?: (serviceId: string, initialNotes: string, generatedReport?: string) => void;
}

const formatInr = (amount?: number | null) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export function ClientStatutoryPreCheckView({
  clientName = "Inworth Technologies Pvt Ltd",
  cin = "U72200KL2023PTC081290",
  pan = "AABCI9812G",
  gstin = "32AABCI9812G1Z2",
  onInitiateFiling,
}: ClientStatutoryPreCheckViewProps) {
  // Active diagnostic engine: "sec-186" | "clause-43b" | "gst-drc01"
  const [activeEngine, setActiveEngine] = useState<"sec-186" | "clause-43b" | "gst-drc01">("sec-186");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // =========================================================================
  // 1. SECTION 186 INTER-CORPORATE LOANS & GUARANTEES CALCULATOR (CS)
  // =========================================================================
  const [sec186Inputs, setSec186Inputs] = useState<Section186Params>({
    entityName: clientName,
    cin: cin,
    paidUpCapital: 25000000, // ₹2.5 Cr
    freeReserves: 15000000,  // ₹1.5 Cr
    securitiesPremium: 5000000, // ₹50 L
    existingLoans: 12000000, // ₹1.2 Cr
    existingInvestments: 4000000,
    existingGuarantees: 2000000,
    existingSecurities: 0,
    proposedAmount: 15000000, // ₹1.5 Cr
    targetEntityName: "Zenith FinTech India Pvt Ltd",
    targetCin: "U67190DL2021PTC389012",
    transactionType: "inter_corporate_loan",
    interestRate: 10.5,
    tenureMonths: 24,
    purpose: "Expansion of AI cloud computing servers and working capital credit",
    hasPfiDefault: false,
    signatoryName: "CS Rajesh Sharma",
    signatoryMembership: "FCS-9214",
  });

  const [sec186Loading, setSec186Loading] = useState(false);
  const [sec186Result, setSec186Result] = useState<any>(null);

  // Real-time calculation per Section 186(2) Companies Act 2013
  const sec186Stats = useMemo(() => {
    const paidUp = Number(sec186Inputs.paidUpCapital || 0);
    const reserves = Number(sec186Inputs.freeReserves || 0);
    const secPrem = Number(sec186Inputs.securitiesPremium || 0);
    const existing =
      Number(sec186Inputs.existingLoans || 0) +
      Number(sec186Inputs.existingInvestments || 0) +
      Number(sec186Inputs.existingGuarantees || 0) +
      Number(sec186Inputs.existingSecurities || 0);
    const proposed = Number(sec186Inputs.proposedAmount || 0);

    const totalReserves = reserves + secPrem;
    const limit60 = 0.6 * (paidUp + totalReserves);
    const limit100 = totalReserves;
    const statutoryCeiling = Math.max(limit60, limit100);
    const totalExposure = existing + proposed;
    const requiresSpecialResolution = totalExposure > statutoryCeiling;
    const gSecYield = 7.15; // Benchmark 1-year / 3-year G-Sec yield
    const isInterestCompliant = Number(sec186Inputs.interestRate || 0) >= gSecYield;
    const utilizationPct = statutoryCeiling > 0 ? Math.round((totalExposure / statutoryCeiling) * 100) : 0;

    return {
      limit60,
      limit100,
      statutoryCeiling,
      existing,
      proposed,
      totalExposure,
      excess: Math.max(0, totalExposure - statutoryCeiling),
      requiresSpecialResolution,
      isInterestCompliant,
      gSecYield,
      utilizationPct,
    };
  }, [sec186Inputs]);

  const handleGenerateSec186 = async () => {
    setSec186Loading(true);
    try {
      const res = await csCaCopilotApi.draftSection186(sec186Inputs);
      if (res && res.data) {
        setSec186Result(res.data);
      } else {
        // Instant statutory fallback
        setSec186Result({
          statutoryLimits: {
            statutoryCeiling: sec186Stats.statutoryCeiling,
            proposedTotalExposure: sec186Stats.totalExposure,
            exceedsThreshold: sec186Stats.requiresSpecialResolution,
            excessAmount: sec186Stats.excess,
          },
          governanceRequirements: {
            approvalType: sec186Stats.requiresSpecialResolution
              ? "SPECIAL RESOLUTION IN GENERAL MEETING (Form MGT-14)"
              : "BOARD RESOLUTION UNDER SECTION 179(3)",
            filingRequired: sec186Stats.requiresSpecialResolution ? "Form MGT-14 within 30 days" : "None (Board Minutes)",
          },
          resolutions: {
            boardResolutionDraft: `RESOLVED THAT pursuant to the provisions of Section 179(3) and Section 186 of the Companies Act, 2013 read with the Companies (Meetings of Board and its Powers) Rules, 2014, consent of the Board of Directors of ${sec186Inputs.entityName} be and is hereby accorded to grant an inter-corporate loan of ${formatInr(sec186Inputs.proposedAmount)} to M/s ${sec186Inputs.targetEntityName} at an interest rate of ${sec186Inputs.interestRate}% p.a. for a tenure of ${sec186Inputs.tenureMonths} months.`,
            specialResolutionDraft: sec186Stats.requiresSpecialResolution
              ? `RESOLVED AS A SPECIAL RESOLUTION THAT pursuant to Section 186(3) of the Companies Act, 2013, the consent of the Members of ${sec186Inputs.entityName} be and is hereby accorded to exceed the statutory ceiling of ${formatInr(sec186Stats.statutoryCeiling)} and advance financial commitments up to an aggregate limit of ${formatInr(sec186Stats.totalExposure)}.`
              : null,
          },
        });
      }
    } catch (e) {
      console.warn("handleGenerateSec186 fallback:", e);
    } finally {
      setSec186Loading(false);
    }
  };

  // =========================================================================
  // 2. SECTION 43B(h) MSME 45-DAY PAYMENT DISALLOWANCE AUDIT (CA)
  // =========================================================================
  const [msmeInvoices, setMsmeInvoices] = useState<MsmeInvoiceItem[]>([
    {
      id: "INV-001",
      invoiceNumber: "MH/25-26/089",
      supplierName: "MicroTech Precision Tools Pvt Ltd",
      supplierUdyam: "UDYAM-MH-03-0012489",
      enterpriseType: "micro",
      invoiceDate: "2026-02-10",
      amount: 850000,
      agreedCreditPeriodDays: 45,
      paymentDate: "2026-04-12",
      notes: "Written supply agreement in place. Payment cleared 16 days past 45-day cutoff.",
    },
    {
      id: "INV-002",
      invoiceNumber: "KA/25-26/142",
      supplierName: "Apex PolyFab Industries",
      supplierUdyam: "UDYAM-KR-08-0045120",
      enterpriseType: "small",
      invoiceDate: "2026-03-20",
      amount: 1420000,
      agreedCreditPeriodDays: 30,
      paymentDate: "2026-04-10",
      notes: "Settled on 10 April 2026 within agreed 30-day window (prior to 19 April statutory cutoff).",
    },
    {
      id: "INV-003",
      invoiceNumber: "DL/25-26/512",
      supplierName: "Vanguard Cloud Server Hosting LLP",
      supplierUdyam: "UDYAM-DL-01-0099312",
      enterpriseType: "small",
      invoiceDate: "2026-01-15",
      amount: 675000,
      agreedCreditPeriodDays: 15,
      paymentDate: null,
      notes: "Unpaid as on 31 March 2026. 100% disallowed under Section 43B(h).",
    },
    {
      id: "INV-004",
      invoiceNumber: "TN/25-26/304",
      supplierName: "Om Retail Traders & Distributors",
      supplierUdyam: "UDYAM-TN-02-0038921",
      enterpriseType: "trader",
      invoiceDate: "2026-01-20",
      amount: 980000,
      agreedCreditPeriodDays: 60,
      paymentDate: "2026-04-20",
      notes: "Trader/Retailer registration. Exempt from 43B(h) disallowance per OM 2/1/2021-P&G/Policy.",
    },
    {
      id: "INV-005",
      invoiceNumber: "GJ/25-26/781",
      supplierName: "Zenith Micro Semiconductor Labs",
      supplierUdyam: "UDYAM-GJ-04-0021943",
      enterpriseType: "micro",
      invoiceDate: "2026-02-28",
      amount: 1250000,
      agreedCreditPeriodDays: 45,
      paymentDate: "2026-05-10",
      notes: "Paid on 10 May 2026. Disallowed for FY 25-26, deductible in FY 26-27 upon actual payment.",
    },
  ]);

  const [clause43bLoading, setClause43bLoading] = useState(false);
  const [clause43bResult, setClause43bResult] = useState<any>(null);

  // Client-side local analysis for instantaneous feedback
  const local43bStats = useMemo(() => {
    let totalInvoicesAmount = 0;
    let disallowedAmount = 0;
    let penalInterest = 0;
    let countDisallowed = 0;

    const analyzedInvoices = msmeInvoices.map((inv) => {
      totalInvoicesAmount += Number(inv.amount || 0);

      // Traders are exempt from 43B(h) per OM 2/1/2021-P&G/Policy
      if (inv.enterpriseType === "trader") {
        return {
          ...inv,
          dueDate: inv.invoiceDate,
          isDisallowed: false,
          delayDays: 0,
          interest: 0,
          reason: "Traders/Retailers exempt from Section 43B(h) per MSME Ministry Circular.",
        };
      }

      const invDate = new Date(inv.invoiceDate);
      const creditDays = Math.min(inv.agreedCreditPeriodDays || 15, 45); // Max 45 days under Sec 15
      const dueDate = new Date(invDate.getTime() + creditDays * 24 * 60 * 60 * 1000);
      const yearEnd = new Date("2026-03-31T23:59:59");

      let payDate = inv.paymentDate ? new Date(inv.paymentDate) : null;
      let isDisallowed = false;
      let delayDays = 0;

      if (!payDate) {
        // Unpaid as of year-end
        isDisallowed = true;
        delayDays = Math.max(0, Math.round((yearEnd.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
      } else {
        // Paid, check if paid after due date AND after year-end
        if (payDate > dueDate && payDate > yearEnd) {
          isDisallowed = true;
          delayDays = Math.max(0, Math.round((payDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
        } else if (payDate > dueDate) {
          // Paid late, but paid before year end -> allowed under 43B(h), but attracts Sec 16 penal interest
          delayDays = Math.max(0, Math.round((payDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
        }
      }

      // Penal interest per Sec 16 MSMED Act: 3x RBI Bank Rate (3 * 6.75% = 20.25% p.a.)
      const annualRate = 0.2025;
      const interest = delayDays > 0 ? Math.round(Number(inv.amount || 0) * (annualRate / 365) * delayDays) : 0;

      if (isDisallowed) {
        disallowedAmount += Number(inv.amount || 0);
        countDisallowed++;
      }
      penalInterest += interest;

      return {
        ...inv,
        dueDate: dueDate.toISOString().split("T")[0],
        isDisallowed,
        delayDays,
        interest,
        reason: isDisallowed
          ? `Settled past the 45-day statutory limit of ${dueDate.toISOString().split("T")[0]}. Added back to taxable income.`
          : "Compliant or settled within statutory limit.",
      };
    });

    const taxImpact = Math.round(disallowedAmount * 0.2517); // 25.17% corporate tax rate (Sec 115BAA)

    return {
      totalInvoicesAmount,
      disallowedAmount,
      taxImpact,
      penalInterest,
      countDisallowed,
      analyzedInvoices,
    };
  }, [msmeInvoices]);

  const handleRunClause43bAnalysis = async () => {
    setClause43bLoading(true);
    try {
      const res = await csCaCopilotApi.analyzeClause43bMsme({
        clientName,
        pan,
        assessmentYear: "2026-27",
        financialYear: "2025-26",
        invoices: msmeInvoices,
      });
      if (res && res.data) {
        setClause43bResult(res.data);
      } else {
        setClause43bResult(local43bStats);
      }
    } catch (e) {
      setClause43bResult(local43bStats);
    } finally {
      setClause43bLoading(false);
    }
  };

  // =========================================================================
  // 3. GST DRC-01 SCN LEGAL REBUTTAL DRAFTER (CA & CS)
  // =========================================================================
  const [drc01Inputs, setDrc01Inputs] = useState<GstDrc01Params>({
    clientName,
    gstin,
    noticeNumber: "SCN/GST/2026/DRC01-8921",
    noticeDate: "2026-10-10",
    financialYear: "2020-21",
    section: "73",
    allegationType: "itc_2a_vs_3b_mismatch",
    demandTax: 845000,
    demandInterest: 385000,
    demandPenalty: 84500,
    officerDesignation: "Assistant Commissioner of Central & State Tax, Ward 44",
    additionalFacts: "The supplier confirmed under statutory CA certification that outward tax was discharged in GSTR-3B. Input tax credit is protected under High Court rulings in Suncraft Energies and Section 16(4) Finance Act 2024 relief.",
    signatoryName: "Gopakumar Nambiar",
    signatoryDesignation: "Managing Director / Authorized Signatory",
  });

  const [drc01Loading, setDrc01Loading] = useState(false);
  const [drc01Result, setDrc01Result] = useState<any>(null);

  const handleDraftDrc01 = async () => {
    setDrc01Loading(true);
    try {
      const res = await csCaCopilotApi.draftGstDrc01Reply(drc01Inputs);
      if (res && res.data) {
        setDrc01Result(res.data);
      } else {
        // Fallback draft
        setDrc01Result({
          formalReplyDraft: `BEFORE THE HON'BLE ${drc01Inputs.officerDesignation?.toUpperCase()}
REPLY TO SHOW CAUSE NOTICE IN FORM GST DRC-01
Notice Reference: ${drc01Inputs.noticeNumber} | Notice Date: ${drc01Inputs.noticeDate}
Taxpayer: ${drc01Inputs.clientName} | GSTIN: ${drc01Inputs.gstin} | FY: ${drc01Inputs.financialYear}

RESPECTFULLY SHEWETH:

1. PRELIMINARY OBJECTIONS & STATUTORY PROTECTIONS:
The Assessee submits that the proposed demand of Tax ${formatInr(drc01Inputs.demandTax)} along with Interest and Penalty under Section ${drc01Inputs.section} is wholly erroneous, unsustainable in law, and barred by statutory amendments.

2. ITC MATCHING & JUDICIAL PRECEDENTS:
The Department's contention regarding GSTR-2A vs GSTR-3B disparity cannot form the sole foundation for recovery without first investigating the registered supplier, as held by the Hon'ble Calcutta High Court in Suncraft Energies (MAT 1218/2023) and affirmed by the Hon'ble Supreme Court.

3. RETROSPECTIVE BENEFIT OF FINANCE ACT 2024:
Pursuant to Section 16(5) inserted by the Finance (No. 2) Act, 2024 with retrospective effect from 01-July-2017, the time limit for claiming input tax credit for FY 2020-21 has been extended to 30-November-2021, and the Assessee stands fully compliant.

PRAYER:
In light of the facts and binding judicial precedents, it is respectfully prayed that the proposed demand in Form GST DRC-01 be dropped in its entirety.

Dated: ${new Date().toLocaleDateString("en-IN")}
For ${drc01Inputs.clientName}
${drc01Inputs.signatoryName} (${drc01Inputs.signatoryDesignation})`,
          defenseRatios: [
            "Suncraft Energies Ltd v. ACST (Calcutta HC / SC Dismissal of SLP)",
            "Section 16(5) & 16(6) inserted by Finance (No. 2) Act, 2024",
            "Union of India v. Bharti Airtel Ltd (2022) 4 SCC 328",
          ],
        });
      }
    } catch (e) {
      console.warn("handleDraftDrc01 fallback:", e);
    } finally {
      setDrc01Loading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Hero Header */}
      <div className="p-6 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-extrabold uppercase tracking-wider">
                PRIORITY 3 • AI DIAGNOSTICS
              </span>
              <span className="text-xs font-mono text-zinc-500 font-semibold">
                Client-Facing Compliance Pre-Check
              </span>
            </div>
            <h2 className="text-xl font-black text-black dark:text-white">
              AI Statutory Pre-Check &amp; Risk Diagnostics Studio
            </h2>
            <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
              Run instant compliance audits before filing. Simulate Section 186 loan thresholds, evaluate Section 43B(h) MSME tax disallowances, or draft statutory DRC-01 GST replies to attach directly to your CA/CS engagement docket.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white shadow-xs">
              Entity: {clientName.split(" ")[0]} ({cin.slice(0, 10)}...)
            </span>
          </div>
        </div>

        {/* 3 Diagnostic Engine Nav Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <button
            onClick={() => setActiveEngine("sec-186")}
            className={`flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all cursor-pointer border ${
              activeEngine === "sec-186"
                ? "bg-white dark:bg-black border-black dark:border-white shadow-xs"
                : "bg-white/50 dark:bg-black/50 border-transparent hover:bg-white dark:hover:bg-black text-zinc-500"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeEngine === "sec-186" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-extrabold block text-black dark:text-white">Section 186 Threshold</span>
              <span className="text-[10px] text-zinc-400 block font-mono">Loans &amp; Guarantees (Companies Act)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveEngine("clause-43b")}
            className={`flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all cursor-pointer border ${
              activeEngine === "clause-43b"
                ? "bg-white dark:bg-black border-black dark:border-white shadow-xs"
                : "bg-white/50 dark:bg-black/50 border-transparent hover:bg-white dark:hover:bg-black text-zinc-500"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeEngine === "clause-43b" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-extrabold block text-black dark:text-white">Section 43B(h) MSME</span>
              <span className="text-[10px] text-zinc-400 block font-mono">45-Day Payment Audit &amp; Interest</span>
            </div>
          </button>

          <button
            onClick={() => setActiveEngine("gst-drc01")}
            className={`flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all cursor-pointer border ${
              activeEngine === "gst-drc01"
                ? "bg-white dark:bg-black border-black dark:border-white shadow-xs"
                : "bg-white/50 dark:bg-black/50 border-transparent hover:bg-white dark:hover:bg-black text-zinc-500"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeEngine === "gst-drc01" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-extrabold block text-black dark:text-white">GST DRC-01 SCN Drafter</span>
              <span className="text-[10px] text-zinc-400 block font-mono">Legal Rebuttal &amp; Precedents</span>
            </div>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ENGINE 1: SECTION 186 INTER-CORPORATE LOANS (CS)
      ========================================================================= */}
      {activeEngine === "sec-186" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Input Form */}
            <div className="lg:col-span-1 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900">
                <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white font-mono flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Financial Position &amp; Proposal
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Sec 186(2)</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-500 font-medium block mb-1">Paid-Up Share Capital (₹)</label>
                  <input
                    type="number"
                    value={sec186Inputs.paidUpCapital}
                    onChange={(e) => setSec186Inputs({ ...sec186Inputs, paidUpCapital: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 font-medium block mb-1">Free Reserves &amp; Surplus (₹)</label>
                  <input
                    type="number"
                    value={sec186Inputs.freeReserves}
                    onChange={(e) => setSec186Inputs({ ...sec186Inputs, freeReserves: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 font-medium block mb-1">Securities Premium Account (₹)</label>
                  <input
                    type="number"
                    value={sec186Inputs.securitiesPremium}
                    onChange={(e) => setSec186Inputs({ ...sec186Inputs, securitiesPremium: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 font-medium block mb-1">Existing Loans / Guarantees (₹)</label>
                  <input
                    type="number"
                    value={sec186Inputs.existingLoans}
                    onChange={(e) => setSec186Inputs({ ...sec186Inputs, existingLoans: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono"
                  />
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900">
                  <label className="text-black dark:text-white font-bold block mb-1">Proposed Transaction Amount (₹)</label>
                  <input
                    type="number"
                    value={sec186Inputs.proposedAmount}
                    onChange={(e) => setSec186Inputs({ ...sec186Inputs, proposedAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10 border border-black dark:border-white text-black dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 font-medium block mb-1">Target Entity Name</label>
                  <input
                    type="text"
                    value={sec186Inputs.targetEntityName}
                    onChange={(e) => setSec186Inputs({ ...sec186Inputs, targetEntityName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-500 font-medium block mb-1">Interest Rate (% p.a.)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={sec186Inputs.interestRate}
                      onChange={(e) => setSec186Inputs({ ...sec186Inputs, interestRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-500 font-medium block mb-1">Tenure (Months)</label>
                    <input
                      type="number"
                      value={sec186Inputs.tenureMonths}
                      onChange={(e) => setSec186Inputs({ ...sec186Inputs, tenureMonths: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateSec186}
                  disabled={sec186Loading}
                  className="w-full py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer shadow-xs mt-2 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{sec186Loading ? "Computing Statues..." : "Generate Resolutions & Governance Pack"}</span>
                </button>
              </div>
            </div>

            {/* Right: Live Statutory Analytics & Verdict */}
            <div className="lg:col-span-2 space-y-5">
              {/* Statutory Threshold Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Statutory Ceiling</span>
                  <div className="text-xl font-black font-mono mt-1 text-black dark:text-white">
                    {formatInr(sec186Stats.statutoryCeiling)}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">
                    Higher of 60%(P+R) or 100% R
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Total Proposed Exposure</span>
                  <div className="text-xl font-black font-mono mt-1 text-black dark:text-white">
                    {formatInr(sec186Stats.totalExposure)}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">
                    Existing {formatInr(sec186Stats.existing)} + New {formatInr(sec186Stats.proposed)}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Ceiling Utilization</span>
                  <div className="text-xl font-black font-mono mt-1 text-black dark:text-white">
                    {sec186Stats.utilizationPct}%
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${sec186Stats.requiresSpecialResolution ? "bg-red-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(100, sec186Stats.utilizationPct)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Legal Verdict Banner */}
              <div
                className={`p-5 rounded-2xl border ${
                  sec186Stats.requiresSpecialResolution
                    ? "bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-200"
                    : "bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {sec186Stats.requiresSpecialResolution ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h4 className="text-sm font-black">
                      {sec186Stats.requiresSpecialResolution
                        ? "EXCEEDS SECTION 186(2) STATUTORY CEILING — SPECIAL RESOLUTION REQUIRED"
                        : "WITHIN SECTION 186(2) STATUTORY CEILING — BOARD APPROVAL SUFFICIENT"}
                    </h4>
                    <p className="text-xs leading-relaxed opacity-90">
                      {sec186Stats.requiresSpecialResolution
                        ? `The proposed exposure exceeds the ceiling by ${formatInr(sec186Stats.excess)}. Under Section 186(3) of Companies Act 2013, a Special Resolution must be passed in a General Meeting of Members, and e-Form MGT-14 must be filed with the ROC within 30 days.`
                        : `The proposed exposure of ${formatInr(sec186Stats.totalExposure)} is within the permissible limit of ${formatInr(sec186Stats.statutoryCeiling)}. A unanimous Board Resolution under Section 179(3) is legally sufficient.`}
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono">
                      <span>• Section 186(7) Interest Compliance: {sec186Stats.isInterestCompliant ? "COMPLIANT (≥ 7.15% G-Sec)" : "DEFICIENT (Below G-Sec yield)"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated Resolutions & Action Button */}
              {sec186Result && (
                <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900">
                    <span className="text-xs font-bold text-black dark:text-white uppercase font-mono">
                      Statutory Resolution Drafts
                    </span>
                    <button
                      onClick={() => handleCopy(sec186Result.resolutions?.boardResolutionDraft || "", "sec186_res")}
                      className="text-xs text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer font-medium"
                    >
                      {copiedId === "sec186_res" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Draft</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {sec186Result.resolutions?.boardResolutionDraft}
                    </div>
                    {sec186Result.resolutions?.specialResolutionDraft && (
                      <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/30 font-mono text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {sec186Result.resolutions?.specialResolutionDraft}
                      </div>
                    )}
                  </div>

                  {onInitiateFiling && (
                    <div className="pt-2 flex items-center justify-end">
                      <button
                        onClick={() =>
                          onInitiateFiling(
                            "board-advisor",
                            `Section 186 Inter-Corporate Loan Diagnostic Report attached. Proposed transaction: ${formatInr(sec186Inputs.proposedAmount)} to ${sec186Inputs.targetEntityName}. Approval type: ${sec186Stats.requiresSpecialResolution ? "Special Resolution & Form MGT-14" : "Board Resolution Section 179(3)"}.`,
                            JSON.stringify(sec186Result, null, 2)
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer shadow-xs flex items-center gap-2"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Engage Company Secretary with this Pre-Check Dossier</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ENGINE 2: SECTION 43B(h) MSME 45-DAY PAYMENT DISALLOWANCE (CA)
      ========================================================================= */}
      {activeEngine === "clause-43b" && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">Total Invoices Scrutinized</span>
              <div className="text-xl font-black font-mono mt-1 text-black dark:text-white">
                {local43bStats.analyzedInvoices.length} Invoices
              </div>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">
                {formatInr(local43bStats.totalInvoicesAmount)} total purchase value
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">Section 43B(h) Disallowed</span>
              <div className="text-xl font-black font-mono mt-1 text-red-600 dark:text-red-400">
                {formatInr(local43bStats.disallowedAmount)}
              </div>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">
                {local43bStats.countDisallowed} invoice(s) paid past 45 days
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">Estimated Tax Impact</span>
              <div className="text-xl font-black font-mono mt-1 text-black dark:text-white">
                {formatInr(local43bStats.taxImpact)}
              </div>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">
                Added to taxable profit @ 25.17%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">Sec 16 MSME Penal Interest</span>
              <div className="text-xl font-black font-mono mt-1 text-amber-600 dark:text-amber-400">
                {formatInr(local43bStats.penalInterest)}
              </div>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">
                Compounded @ 20.25% p.a. (3x Bank Rate)
              </span>
            </div>
          </div>

          {/* Statutory Warning Notice */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Critical Statutory Prohibition under Section 23 of MSMED Act 2006</span>
            </div>
            <p className="leading-relaxed opacity-90 pl-6">
              Compound penal interest payable under Section 16 is strictly non-deductible under the Income Tax Act, 1961. Furthermore, any trade dues to Micro &amp; Small suppliers outstanding beyond 45 days as of 31st March must be disclosed in Form 3CD Clause 22 and cannot be deducted until the fiscal year in which actual payment is remitted.
            </p>
          </div>

          {/* Invoice Audit Breakdown Table */}
          <div className="p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-900">
              <div>
                <h4 className="text-xs font-bold text-black dark:text-white uppercase font-mono">
                  Micro &amp; Small Enterprise Supplier Ledger
                </h4>
                <p className="text-[10px] text-zinc-500">
                  Section 15 (45-Day Cutoff) &amp; Section 16 (Compound Interest Calculation)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunClause43bAnalysis}
                  disabled={clause43bLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{clause43bLoading ? "Auditing..." : "Re-Calculate Disallowances"}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 font-mono text-[10px] text-zinc-500 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Inv #</th>
                    <th className="py-2.5 px-3">Supplier Name &amp; Udyam</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Invoice / Due Date</th>
                    <th className="py-2.5 px-3">Payment Date</th>
                    <th className="py-2.5 px-3">Sec 43B(h) Status</th>
                    <th className="py-2.5 px-3 text-right">Penal Interest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {local43bStats.analyzedInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                      <td className="py-3 px-3 font-mono font-bold text-black dark:text-white">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold block text-black dark:text-white">{inv.supplierName}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{inv.supplierUdyam}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 uppercase font-bold text-zinc-600 dark:text-zinc-400">
                          {inv.enterpriseType}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-black dark:text-white">
                        {formatInr(inv.amount)}
                      </td>
                      <td className="py-3 px-3 text-[11px] font-mono text-zinc-500">
                        <span>Inv: {inv.invoiceDate}</span>
                        <span className="block text-zinc-400">Due: {inv.dueDate}</span>
                      </td>
                      <td className="py-3 px-3 text-[11px] font-mono">
                        {inv.paymentDate ? (
                          <span className="text-zinc-600 dark:text-zinc-300">{inv.paymentDate}</span>
                        ) : (
                          <span className="text-red-500 font-bold">Unpaid</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {inv.isDisallowed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-bold">
                            <AlertCircle className="w-3 h-3" />
                            Disallowed (+{formatInr(inv.amount)})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            <Check className="w-3 h-3" />
                            Allowed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-right font-bold text-amber-600 dark:text-amber-400">
                        {inv.interest > 0 ? formatInr(inv.interest) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {onInitiateFiling && (
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  Ready to file Form 3CD Tax Audit with full Section 43B(h) Schedule?
                </span>
                <button
                  onClick={() =>
                    onInitiateFiling(
                      "tax-audit",
                      `Section 43B(h) MSME Disallowance Pre-Check attached. Total purchase ledger analyzed: ${formatInr(local43bStats.totalInvoicesAmount)}. Disallowed amount to be added to taxable business profits: ${formatInr(local43bStats.disallowedAmount)} across ${local43bStats.countDisallowed} invoices. Penal interest under Section 16 MSMED Act: ${formatInr(local43bStats.penalInterest)}.`,
                      JSON.stringify(local43bStats, null, 2)
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Engage Chartered Accountant with this MSME Pre-Check</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          ENGINE 3: GST DRC-01 SCN LEGAL REBUTTAL DRAFTER (CA & CS)
      ========================================================================= */}
      {activeEngine === "gst-drc01" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Input Form */}
            <div className="lg:col-span-1 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900">
                <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white font-mono flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  DRC-01 Notice Specifics
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Rule 142(1)</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-500 font-medium block mb-1">Notice Reference Number</label>
                  <input
                    type="text"
                    value={drc01Inputs.noticeNumber}
                    onChange={(e) => setDrc01Inputs({ ...drc01Inputs, noticeNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-500 font-medium block mb-1">Notice Date</label>
                    <input
                      type="date"
                      value={drc01Inputs.noticeDate}
                      onChange={(e) => setDrc01Inputs({ ...drc01Inputs, noticeDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-500 font-medium block mb-1">Financial Year</label>
                    <input
                      type="text"
                      value={drc01Inputs.financialYear}
                      onChange={(e) => setDrc01Inputs({ ...drc01Inputs, financialYear: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-500 font-medium block mb-1">Primary Allegation Category</label>
                  <select
                    value={drc01Inputs.allegationType}
                    onChange={(e) => setDrc01Inputs({ ...drc01Inputs, allegationType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white cursor-pointer"
                  >
                    <option value="itc_2a_vs_3b_mismatch">ITC Mismatch (GSTR-2A/2B vs 3B / Rule 36(4))</option>
                    <option value="supplier_cancellation_retrospective">Retrospective Cancellation of Supplier GSTIN</option>
                    <option value="section_16_4_time_bar">Section 16(4) Limitation Bar (Finance Act 2024 Relief)</option>
                    <option value="blocked_credit_17_5">Ineligible / Blocked Credit under Section 17(5)</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-500 font-medium block mb-1">Proposed Tax Demand (₹)</label>
                  <input
                    type="number"
                    value={drc01Inputs.demandTax}
                    onChange={(e) => setDrc01Inputs({ ...drc01Inputs, demandTax: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 font-medium block mb-1">Issuing Officer &amp; Ward</label>
                  <input
                    type="text"
                    value={drc01Inputs.officerDesignation}
                    onChange={(e) => setDrc01Inputs({ ...drc01Inputs, officerDesignation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleDraftDrc01}
                  disabled={drc01Loading}
                  className="w-full py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer shadow-xs mt-2 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{drc01Loading ? "Drafting Legal Grounds..." : "Draft Statutory Legal Reply"}</span>
                </button>
              </div>
            </div>

            {/* Right: Drafted Legal Reply Preview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-black dark:text-white uppercase font-mono">
                      Statutory DRC-01 Written Reply (Form GST DRC-06)
                    </span>
                    <p className="text-[10px] text-zinc-500">
                      Standard pleading format for personal hearing &amp; adjudication submission
                    </p>
                  </div>

                  {drc01Result && (
                    <button
                      onClick={() => handleCopy(drc01Result.formalReplyDraft, "drc01_reply")}
                      className="text-xs text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer font-medium"
                    >
                      {copiedId === "drc01_reply" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Pleading</span>
                    </button>
                  )}
                </div>

                {drc01Result ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-[450px] overflow-y-auto">
                      {drc01Result.formalReplyDraft}
                    </div>

                    {drc01Result.defenseRatios && (
                      <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                        <span className="font-bold text-black dark:text-white block font-mono text-[11px]">
                          Cited Judicial Authorities &amp; Precedents:
                        </span>
                        <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                          {drc01Result.defenseRatios.map((ratio: string, rIdx: number) => (
                            <li key={rIdx}>{ratio}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {onInitiateFiling && (
                      <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900">
                        <span className="text-[11px] text-zinc-500">
                          Route this pleading to our Advocate &amp; CA Litigation Team for filing?
                        </span>
                        <button
                          onClick={() =>
                            onInitiateFiling(
                              "tax-compliance",
                              `GST DRC-01 Show Cause Notice Reply drafted. SCN Ref: ${drc01Inputs.noticeNumber}. Allegation: ${drc01Inputs.allegationType}. Demanded tax: ${formatInr(drc01Inputs.demandTax)}. Draft legal response and precedent grounds attached.`,
                              drc01Result.formalReplyDraft
                            )
                          }
                          className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer shadow-xs flex items-center gap-2"
                        >
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>Engage Advocate / CA for Representation</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/50">
                    <Scale className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                    <h5 className="text-xs font-bold text-black dark:text-white">Notice Reply Canvas</h5>
                    <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
                      Fill in the DRC-01 reference details on the left and click "Draft Statutory Legal Reply" to formulate an authoritative High Court-tested pleading.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
