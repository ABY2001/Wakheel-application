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
} from "lucide-react";
import {
  csCaCopilotApi,
  Section186Params,
  Clause43bParams,
  GstDrc01Params,
  MsmeInvoiceItem,
} from "@/lib/csCaCopilotApi";

interface SpecializedCsCaCopilotViewProps {
  firmName?: string;
  practitionerName?: string;
  defaultClient?: {
    name: string;
    cin?: string;
    pan?: string;
    gstin?: string;
    paidUpCapital?: number;
  };
}

// Indian Rupee Formatter
const formatInr = (amount?: number | null) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export function SpecializedCsCaCopilotView({
  firmName = "Wakheel Corporate & Tax Advisory LLP",
  practitionerName = "CS Rajesh Sharma & CA Ramanathan Iyer",
  defaultClient = {
    name: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    pan: "AAECS1234F",
    gstin: "07AAECS1234F1Z8",
    paidUpCapital: 25000000,
  },
}: SpecializedCsCaCopilotViewProps) {
  // Active Tab: sec-186 | clause-43b | gst-drc01 | statutory-chat
  const [activeTab, setActiveTab] = useState<"sec-186" | "clause-43b" | "gst-drc01" | "statutory-chat">("sec-186");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // =========================================================================
  // PILLAR 1: SECTION 186 DRAFTER STATE (CS)
  // =========================================================================
  const [sec186Inputs, setSec186Inputs] = useState<Section186Params>({
    entityName: defaultClient.name,
    cin: defaultClient.cin || "U72200DL2022PTC394812",
    paidUpCapital: defaultClient.paidUpCapital || 25000000,
    freeReserves: 15000000,
    securitiesPremium: 5000000,
    existingLoans: 12000000,
    existingInvestments: 4000000,
    existingGuarantees: 2000000,
    existingSecurities: 0,
    proposedAmount: 15000000,
    targetEntityName: "Zenith FinTech India Pvt Ltd",
    targetCin: "U67190DL2021PTC389012",
    transactionType: "inter_corporate_loan",
    interestRate: 10.5,
    tenureMonths: 24,
    purpose: "Expansion of AI cloud compute servers and working capital facilities",
    hasPfiDefault: false,
    signatoryName: "CS Rajesh Sharma",
    signatoryMembership: "FCS-8921",
  });

  const [sec186Loading, setSec186Loading] = useState(false);
  const [sec186Result, setSec186Result] = useState<any>(null);
  const [sec186ActiveDoc, setSec186ActiveDoc] = useState<"board" | "egm" | "mgt14">("board");

  // Real-time calculation of Section 186 limits
  const sec186Limits = useMemo(() => {
    const paidUp = Number(sec186Inputs.paidUpCapital || 0);
    const reserves = Number(sec186Inputs.freeReserves || 0);
    const secPrem = Number(sec186Inputs.securitiesPremium || 0);
    const proposed = Number(sec186Inputs.proposedAmount || 0);
    const existing =
      Number(sec186Inputs.existingLoans || 0) +
      Number(sec186Inputs.existingInvestments || 0) +
      Number(sec186Inputs.existingGuarantees || 0) +
      Number(sec186Inputs.existingSecurities || 0);

    const totalReserves = reserves + secPrem;
    const limit60 = 0.6 * (paidUp + totalReserves);
    const limit100 = totalReserves;
    const statutoryCeiling = Math.max(limit60, limit100);
    const totalExposure = existing + proposed;
    const requiresSpecialResolution = totalExposure > statutoryCeiling;
    const gSecYield = 7.15;
    const isInterestCompliant = Number(sec186Inputs.interestRate || 0) >= gSecYield;

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
    };
  }, [sec186Inputs]);

  const handleGenerateSec186 = async () => {
    setSec186Loading(true);
    try {
      const res = await csCaCopilotApi.draftSection186(sec186Inputs);
      if (res && res.data) {
        setSec186Result(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSec186Loading(false);
    }
  };

  // =========================================================================
  // PILLAR 2: SECTION 43B(h) MSME ANALYZER STATE (CA)
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
    },
    {
      id: "INV-003",
      invoiceNumber: "DL/25-26/512",
      supplierName: "Vanguard Server Hosting LLP",
      supplierUdyam: "UDYAM-DL-01-0099312",
      enterpriseType: "small",
      invoiceDate: "2026-01-15",
      amount: 675000,
      agreedCreditPeriodDays: 15,
      paymentDate: null,
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
    },
  ]);

  const [clause43bLoading, setClause43bLoading] = useState(false);
  const [clause43bResult, setClause43bResult] = useState<any>(null);

  const handleRunClause43bAnalysis = async () => {
    setClause43bLoading(true);
    try {
      const res = await csCaCopilotApi.analyzeClause43bMsme({
        clientName: defaultClient.name,
        pan: defaultClient.pan,
        assessmentYear: "2026-27",
        financialYear: "2025-26",
        invoices: msmeInvoices,
      });
      if (res && res.data) {
        setClause43bResult(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClause43bLoading(false);
    }
  };

  // =========================================================================
  // PILLAR 3: GST DRC-01 SCN REPLIER STATE (CA & CS)
  // =========================================================================
  const [drc01Inputs, setDrc01Inputs] = useState<GstDrc01Params>({
    clientName: defaultClient.name,
    gstin: defaultClient.gstin || "07AAECS1234F1Z8",
    noticeNumber: "SCN/GST/2026/DRC01-8921",
    noticeDate: "2026-10-10",
    financialYear: "2020-21",
    section: "73",
    allegationType: "itc_2a_vs_3b_mismatch",
    demandTax: 845000,
    demandInterest: 385000,
    demandPenalty: 84500,
    officerDesignation: "Assistant Commissioner of State Tax, Ward 44, New Delhi",
    additionalFacts: "The supplier M/s Zenith Tech confirmed under statutory CA certification that outward tax of ₹8,45,000 was duly discharged in their monthly GSTR-3B return for September 2020.",
    signatoryName: "CA Ramanathan Iyer",
    signatoryDesignation: "Authorized Representative & Chartered Accountant (M.No 054921)",
  });

  const [drc01Loading, setDrc01Loading] = useState(false);
  const [drc01Result, setDrc01Result] = useState<any>(null);

  const handleGenerateDrc01Reply = async () => {
    setDrc01Loading(true);
    try {
      const res = await csCaCopilotApi.draftGstDrc01Reply(drc01Inputs);
      if (res && res.data) {
        setDrc01Result(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDrc01Loading(false);
    }
  };

  // =========================================================================
  // PILLAR 4: STATUTORY CHAT STATE
  // =========================================================================
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; text: string; time: string; engine?: string }[]
  >([
    {
      role: "assistant",
      text: `Welcome to Wakheel Statutory AI Copilot. I am specialized in Indian Corporate Law (Companies Act 2013, ICSI Secretarial Standards), Direct Tax (Income Tax Act 1961, Form 3CD clauses), and Indirect Tax (CGST Act 2017, CBIC Circulars).\n\nSelect a statutory topic or ask any specific compliance question below to generate authoritative paperbooks, section cross-checks, or resolution drafts.`,
      time: "Just now",
      engine: "wakheel-statutory-corpus",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendChat = async (promptText?: string) => {
    const textToSend = promptText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = {
      role: "user" as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!promptText) setChatInput("");
    setChatLoading(true);

    try {
      const res = await csCaCopilotApi.queryStatutoryAssistant({
        prompt: textToSend,
        category: "general",
        practiceMode: "unified",
        matterContext: { entity: defaultClient.name },
      });

      if (res && res.answer) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: res.answer,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            engine: res.engine || "statutory-engine",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* =========================================================================
          TOP BANNER: SPECIALIZED AI COPILOT FOR CS & CA (High Contrast Redesign)
      ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white relative overflow-hidden shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[11px] font-mono font-extrabold tracking-widest uppercase shadow-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                SPECIALIZED AI COPILOT
              </span>
              <span className="px-3 py-1 rounded-full border border-red-300 dark:border-red-800 bg-red-100 dark:bg-red-950/80 text-[11px] font-mono font-bold text-red-900 dark:text-red-200">
                ICSI Secretarial &amp; ICAI Tax Specialization
              </span>
              <span className="px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-100 dark:bg-emerald-950/80 text-[11px] font-mono font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Statutory Grounded Engine
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
                Statutory Intelligence Engine for CS &amp; CA
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 max-w-3xl leading-relaxed font-normal">
              Autonomous statutory drafting and computational engine covering Companies Act Section 186 loan threshold audits &amp; resolution packs, Section 43B(h) MSME disallowances &amp; 3x RBI penal interest calculations, and Form GST DRC-06 show-cause notice rebuttal drafting.
            </p>
          </div>

          {/* Quick Context Pill */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs font-mono shrink-0">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Active Assessee / Client Context:</div>
            <div className="font-extrabold text-zinc-950 dark:text-white text-sm">{defaultClient.name}</div>
            <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
              CIN: {defaultClient.cin} • PAN: {defaultClient.pan}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PILLAR NAVIGATION TABS (4 Specialized Pillars)
      ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            {
              id: "sec-186",
              label: "Section 186 Loans & Guarantees Drafter",
              sub: "CS Practice",
              icon: Building2,
              badge: sec186Limits.requiresSpecialResolution ? "Special Res. Mandated" : "Board Res. OK",
              badgeColor: sec186Limits.requiresSpecialResolution ? "text-amber-700 bg-amber-100" : "text-emerald-700 bg-emerald-100",
            },
            {
              id: "clause-43b",
              label: "Clause 43B(h) MSME Disallowance Engine",
              sub: "CA Practice",
              icon: Calculator,
              badge: "AY 2026-27 Active",
              badgeColor: "text-blue-700 bg-blue-100",
            },
            {
              id: "gst-drc01",
              label: "GST DRC-01 SCN Notice Replier",
              sub: "CA & CS Practice",
              icon: Scale,
              badge: "Form GST DRC-06",
              badgeColor: "text-purple-700 bg-purple-100",
            },
            {
              id: "statutory-chat",
              label: "Statutory Legal Assistant",
              sub: "Interactive Canvas",
              icon: Sparkles,
              badge: "Dual-Mode AI",
              badgeColor: "text-zinc-700 bg-zinc-200",
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md scale-102"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent font-semibold"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-zinc-800 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-900"
                      : tab.badgeColor
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          PILLAR 1: SECTION 186 DRAFTER & LIMITS GAUGE (CS PRACTICE)
      ========================================================================= */}
      {activeTab === "sec-186" && (
        <div className="space-y-6">
          
          {/* Statutory Threshold Limits Live Gauge */}
          <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-zinc-900 dark:text-white" />
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-950 dark:text-white">
                    Section 186(2) Statutory Thresholds &amp; Real-Time Exposure Gauge
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    Calculates higher of 60% of (Paid-up Capital + Free Reserves + Securities Premium) OR 100% of (Free Reserves + Securities Premium).
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border ${
                  sec186Limits.requiresSpecialResolution
                    ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200"
                    : "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {sec186Limits.requiresSpecialResolution
                  ? "Special Resolution (EGM) Required u/s 186(3)"
                  : "Within Ceiling: Unanimous Board Resolution Sufficient"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400 uppercase font-bold block">
                  1. Statutory Limit (60% Rule)
                </span>
                <span className="text-lg font-black text-zinc-950 dark:text-white block">
                  {formatInr(sec186Limits.limit60)}
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">
                  60% of (Capital + Reserves)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400 uppercase font-bold block">
                  2. Statutory Limit (100% Rule)
                </span>
                <span className="text-lg font-black text-zinc-950 dark:text-white block">
                  {formatInr(sec186Limits.limit100)}
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">
                  100% of Free Reserves + Premium
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400 uppercase font-bold block">
                  3. Permissible Ceiling (Higher of 1 &amp; 2)
                </span>
                <span className="text-lg font-black text-blue-700 dark:text-blue-400 block">
                  {formatInr(sec186Limits.statutoryCeiling)}
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">
                  Max exposure without Special Resolution
                </span>
              </div>

              <div
                className={`p-4 rounded-2xl border space-y-1 ${
                  sec186Limits.requiresSpecialResolution
                    ? "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                    : "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                }`}
              >
                <span className="text-[11px] uppercase font-bold block">
                  4. Total Exposure Post-Transaction
                </span>
                <span className="text-lg font-black block">
                  {formatInr(sec186Limits.totalExposure)}
                </span>
                <span className="text-[11px] font-semibold block">
                  {sec186Limits.excess > 0
                    ? `Exceeds ceiling by ${formatInr(sec186Limits.excess)}`
                    : `Headroom remaining: ${formatInr(sec186Limits.statutoryCeiling - sec186Limits.totalExposure)}`}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Parameter Adjustment & Generator Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Input Form Column */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h4 className="text-xs font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300">
                  Transaction &amp; Entity Parameters
                </h4>
                <span className="text-[11px] font-mono text-zinc-500">Sec 186 Drafter</span>
              </div>

              <div className="space-y-3 text-xs font-sans">
                <div>
                  <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                    Lending Company Name &amp; CIN
                  </label>
                  <input
                    type="text"
                    value={sec186Inputs.entityName}
                    onChange={(e) => setSec186Inputs({ ...sec186Inputs, entityName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Paid-up Capital (₹)
                    </label>
                    <input
                      type="number"
                      value={sec186Inputs.paidUpCapital}
                      onChange={(e) => setSec186Inputs({ ...sec186Inputs, paidUpCapital: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Free Reserves (₹)
                    </label>
                    <input
                      type="number"
                      value={sec186Inputs.freeReserves}
                      onChange={(e) => setSec186Inputs({ ...sec186Inputs, freeReserves: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Securities Premium (₹)
                    </label>
                    <input
                      type="number"
                      value={sec186Inputs.securitiesPremium}
                      onChange={(e) => setSec186Inputs({ ...sec186Inputs, securitiesPremium: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Existing Exposure (₹)
                    </label>
                    <input
                      type="number"
                      value={sec186Inputs.existingLoans}
                      onChange={(e) => setSec186Inputs({ ...sec186Inputs, existingLoans: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                    Proposed Transaction Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={sec186Inputs.proposedAmount}
                    onChange={(e) => setSec186Inputs({ ...sec186Inputs, proposedAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                    Target Borrower / Entity Name
                  </label>
                  <input
                    type="text"
                    value={sec186Inputs.targetEntityName}
                    onChange={(e) => setSec186Inputs({ ...sec186Inputs, targetEntityName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Transaction Type
                    </label>
                    <select
                      value={sec186Inputs.transactionType}
                      onChange={(e) => setSec186Inputs({ ...sec186Inputs, transactionType: e.target.value as any })}
                      className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium"
                    >
                      <option value="inter_corporate_loan">Inter-Corporate Loan</option>
                      <option value="investment_shares">Securities Investment</option>
                      <option value="corporate_guarantee">Corporate Guarantee</option>
                      <option value="security">Provision of Security</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Interest Rate (% p.a.)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={sec186Inputs.interestRate}
                      onChange={(e) => setSec186Inputs({ ...sec186Inputs, interestRate: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                    Specific Commercial Purpose
                  </label>
                  <textarea
                    rows={2}
                    value={sec186Inputs.purpose}
                    onChange={(e) => setSec186Inputs({ ...sec186Inputs, purpose: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium text-xs resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateSec186}
                disabled={sec186Loading}
                className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {sec186Loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Analyzing Limits &amp; Drafting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Generate Section 186 Paperbook Pack</span>
                  </>
                )}
              </button>
            </div>

            {/* Generated Documents Viewer Column */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  {[
                    { id: "board", label: "1. Board Resolution (Unanimous)", badge: "Sec 186(5)" },
                    { id: "egm", label: "2. EGM Notice & Explanatory", badge: "Sec 186(3) & 102" },
                    { id: "mgt14", label: "3. Form MGT-14 Brief", badge: "ROC Filing" },
                  ].map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSec186ActiveDoc(doc.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        sec186ActiveDoc === doc.id
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <span>{doc.label}</span>
                      <span className="text-[10px] font-mono opacity-80">({doc.badge})</span>
                    </button>
                  ))}
                </div>

                {sec186Result && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const content =
                          sec186ActiveDoc === "board"
                            ? sec186Result.drafts.boardResolution
                            : sec186ActiveDoc === "egm"
                            ? sec186Result.drafts.egmNoticeAndResolution
                            : JSON.stringify(sec186Result.drafts.mgt14FilingBrief, null, 2);
                        handleCopy(content, "sec186-copy");
                      }}
                      className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {copiedId === "sec186-copy" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Copy Paperbook</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer"
                      title="Print Paperbook"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Document Paperbook Content Box */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 min-h-[460px] overflow-y-auto font-mono text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed whitespace-pre-wrap">
                {sec186Result ? (
                  sec186ActiveDoc === "board" ? (
                    sec186Result.drafts.boardResolution
                  ) : sec186ActiveDoc === "egm" ? (
                    sec186Result.drafts.egmNoticeAndResolution
                  ) : (
                    <div>
                      <div className="font-sans font-extrabold text-sm text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800 mb-3">
                        FORM MGT-14 STATUTORY FILING BRIEF &amp; COMPLIANCE CHECKLIST
                      </div>
                      <div className="space-y-3 font-sans text-xs">
                        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold block">Filing Authority</span>
                            <span className="font-extrabold">{sec186Result.drafts.mgt14FilingBrief.filingAuthority}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold block">Mandatory Deadline</span>
                            <span className="font-extrabold text-red-600 dark:text-red-400">{sec186Result.drafts.mgt14FilingBrief.filingDeadline}</span>
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1.5 uppercase font-mono text-[11px]">
                            Mandatory E-Form Attachments:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-zinc-700 dark:text-zinc-300">
                            {sec186Result.drafts.mgt14FilingBrief.mandatoryAttachments.map((att: string, i: number) => (
                              <li key={i}>{att}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1.5 uppercase font-mono text-[11px]">
                            Company Secretary Compliance Verification:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-zinc-700 dark:text-zinc-300">
                            {sec186Result.drafts.mgt14FilingBrief.compliancePointers.map((p: string, i: number) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-3 font-sans">
                    <Building2 className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
                    <div className="space-y-1">
                      <div className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">
                        Section 186 Paperbook Not Yet Generated
                      </div>
                      <p className="text-xs text-zinc-500 max-w-sm">
                        Adjust the capital parameters and proposed loan details on the left, then click &quot;Generate Section 186 Paperbook Pack&quot;.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PILLAR 2: CLAUSE 43B(h) MSME ANALYZER (CA PRACTICE)
      ========================================================================= */}
      {activeTab === "clause-43b" && (
        <div className="space-y-6">
          
          {/* Statutory Rule Banner */}
          <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Calculator className="w-5 h-5 text-zinc-900 dark:text-white" />
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-950 dark:text-white">
                    Section 43B(h) MSME Statutory Compliance &amp; Penal Compound Interest Engine
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    Strict Section 15 MSMED Act time limit: 15 days (default) or up to 45 days (if agreed in writing). Disallowed under 43B(h) if unpaid as of 31st March, plus monthly compound interest at 3x RBI Bank Rate (20.25% p.a.).
                  </p>
                </div>
              </div>
              <button
                onClick={handleRunClause43bAnalysis}
                disabled={clause43bLoading}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {clause43bLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Auditing Invoices...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Run Full 43B(h) Audit &amp; Interest Check</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Metrics from Result */}
            {clause43bResult && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Purchases Evaluated</span>
                  <span className="text-base font-black text-zinc-950 dark:text-white block">
                    {formatInr(clause43bResult.summary.totalPurchases)}
                  </span>
                  <span className="text-[10px] text-zinc-500">{clause43bResult.summary.totalInvoices} Invoices Analyzed</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Allowed Deductions</span>
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-400 block">
                    {formatInr(clause43bResult.summary.totalAllowed)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">Paid on time / Exempt</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 space-y-1">
                  <span className="text-[10px] text-red-900 dark:text-red-300 uppercase font-bold block">
                    Disallowed u/s 43B(h)
                  </span>
                  <span className="text-base font-black text-red-700 dark:text-red-400 block">
                    {formatInr(clause43bResult.summary.totalDisallowed)}
                  </span>
                  <span className="text-[10px] text-red-600 dark:text-red-300 font-bold">Added back to Income</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 space-y-1">
                  <span className="text-[10px] text-amber-900 dark:text-amber-300 uppercase font-bold block">
                    Sec 16 Penal Interest
                  </span>
                  <span className="text-base font-black text-amber-700 dark:text-amber-400 block">
                    {formatInr(clause43bResult.summary.totalPenalInterest)}
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-300 font-bold">@ 20.25% (Inadmissible)</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Tax Impact (@ 25.17%)</span>
                  <span className="text-base font-black text-zinc-950 dark:text-white block">
                    {formatInr(clause43bResult.summary.taxImpactAt25Percent)}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">Extra corporate tax cash outflow</span>
                </div>
              </div>
            )}
          </div>

          {/* Invoice Simulator Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h4 className="text-xs font-mono font-bold uppercase text-zinc-800 dark:text-zinc-200">
                  Micro &amp; Small Enterprise Creditors Aging Schedule ({msmeInvoices.length} Invoices)
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Simulated audit schedule verifying MSME classification, 15/45 days rule, and Section 16 interest liability.
                </p>
              </div>
              <button
                onClick={() => {
                  const newInv: MsmeInvoiceItem = {
                    id: `INV-${Date.now().toString().slice(-4)}`,
                    invoiceNumber: `DL/25-26/${Math.floor(100 + Math.random() * 900)}`,
                    supplierName: "Apex Micro Component Systems",
                    supplierUdyam: "UDYAM-DL-05-0081290",
                    enterpriseType: "micro",
                    invoiceDate: "2026-03-01",
                    amount: 500000,
                    agreedCreditPeriodDays: 45,
                    paymentDate: null,
                  };
                  setMsmeInvoices([...msmeInvoices, newInv]);
                }}
                className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Invoice</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-3">Supplier &amp; Udyam</th>
                    <th className="py-3 px-2">Type</th>
                    <th className="py-3 px-2 font-mono">Invoice Date</th>
                    <th className="py-3 px-2 text-right">Amount (₹)</th>
                    <th className="py-3 px-2">Agreed Days</th>
                    <th className="py-3 px-2">Payment Date</th>
                    <th className="py-3 px-2 text-right">Penal Interest</th>
                    <th className="py-3 px-3 text-right">43B(h) Status</th>
                    <th className="py-3 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-sans">
                  {(clause43bResult ? clause43bResult.invoices : msmeInvoices).map((inv: any, idx: number) => {
                    const isDisallowed = inv.statusBadge === "DISALLOWED_43B_H" || (!clause43bResult && !inv.paymentDate);
                    return (
                      <tr key={inv.id || idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-zinc-950 dark:text-white">{inv.supplierName}</div>
                          <div className="text-[10px] font-mono text-zinc-500 font-medium">
                            {inv.invoiceNumber} • {inv.supplierUdyam || "Udyam Verified"}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              inv.enterpriseType === "micro"
                                ? "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300"
                                : inv.enterpriseType === "small"
                                ? "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300"
                                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            }`}
                          >
                            {inv.enterpriseType}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-mono text-zinc-700 dark:text-zinc-300">{inv.invoiceDate}</td>
                        <td className="py-3 px-2 font-mono font-black text-right text-zinc-950 dark:text-white">
                          {formatInr(inv.amount)}
                        </td>
                        <td className="py-3 px-2 font-mono text-zinc-600 dark:text-zinc-400">
                          {inv.agreedCreditPeriodDays || 15} Days
                        </td>
                        <td className="py-3 px-2 font-mono text-zinc-700 dark:text-zinc-300">
                          {inv.paymentDate ? (
                            <span>{inv.paymentDate}</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400 font-bold">UNPAID (Pending)</span>
                          )}
                        </td>
                        <td className="py-3 px-2 font-mono text-right font-bold text-amber-600 dark:text-amber-400">
                          {inv.penalInterest ? formatInr(inv.penalInterest) : "₹0"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold ${
                              isDisallowed
                                ? "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200 border border-red-300"
                                : inv.enterpriseType === "trader" || inv.enterpriseType === "medium"
                                ? "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                                : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300"
                            }`}
                          >
                            {isDisallowed
                              ? "DISALLOWED 43B(h)"
                              : inv.enterpriseType === "trader" || inv.enterpriseType === "medium"
                              ? "EXEMPT FROM 43B(h)"
                              : "ALLOWED DEDUCTION"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => {
                              setMsmeInvoices(msmeInvoices.filter((_, i) => i !== idx));
                            }}
                            className="text-zinc-400 hover:text-red-600 cursor-pointer p-1"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Form 3CD Clause 22 Disclosure Report Box */}
            {clause43bResult && (
              <div className="pt-4 border-t-2 border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-red-600" />
                    Form 3CD Clause 22 Report (Ready for Tax Audit Dossier)
                  </span>
                  <button
                    onClick={() => handleCopy(clause43bResult.form3CdClause22Text, "copy-3cd-clause22")}
                    className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedId === "copy-3cd-clause22" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied Clause 22</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Copy Clause 22 Statement</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap leading-relaxed">
                  {clause43bResult.form3CdClause22Text}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          PILLAR 3: GST DRC-01 SCN REPLIER (CA & CS PRACTICE)
      ========================================================================= */}
      {activeTab === "gst-drc01" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-zinc-900 dark:text-white" />
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-950 dark:text-white">
                    Form GST DRC-06 Statutory Rebuttal &amp; Grounds Drafter
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    Automated formal legal reply to Show Cause Notices under Section 73 / 74 / 74A with Supreme Court, High Court &amp; CBIC Circular citations.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 border border-purple-300">
                Rule 142(4) DRC-06
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* SCN Inputs Form */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h4 className="text-xs font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300">
                  SCN Demand Parameters
                </h4>
                <span className="text-[11px] font-mono text-zinc-500">Notice Details</span>
              </div>

              <div className="space-y-3 text-xs font-sans">
                <div>
                  <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                    SCN Reference Number
                  </label>
                  <input
                    type="text"
                    value={drc01Inputs.noticeNumber}
                    onChange={(e) => setDrc01Inputs({ ...drc01Inputs, noticeNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Financial Year
                    </label>
                    <select
                      value={drc01Inputs.financialYear}
                      onChange={(e) => setDrc01Inputs({ ...drc01Inputs, financialYear: e.target.value })}
                      className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono"
                    >
                      <option value="2017-18">FY 2017-18</option>
                      <option value="2018-19">FY 2018-19</option>
                      <option value="2019-20">FY 2019-20</option>
                      <option value="2020-21">FY 2020-21</option>
                      <option value="2021-22">FY 2021-22</option>
                      <option value="2022-23">FY 2022-23</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Statutory Section
                    </label>
                    <select
                      value={drc01Inputs.section}
                      onChange={(e) => setDrc01Inputs({ ...drc01Inputs, section: e.target.value as any })}
                      className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono"
                    >
                      <option value="73">Section 73 (Non-Fraud)</option>
                      <option value="74">Section 74 (Fraud / Willful)</option>
                      <option value="74A">Section 74A (Unified Regime)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                    Allegation / Ground of SCN
                  </label>
                  <select
                    value={drc01Inputs.allegationType}
                    onChange={(e) => setDrc01Inputs({ ...drc01Inputs, allegationType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium"
                  >
                    <option value="itc_2a_vs_3b_mismatch">GSTR-2A vs GSTR-3B ITC Mismatch</option>
                    <option value="supplier_cancellation_retrospective">Supplier Registration Cancelled Retrospectively</option>
                    <option value="section_16_4_time_bar">Section 16(4) Time-Barred ITC (Relief u/s 16(5))</option>
                    <option value="blocked_credit_17_5">Ineligible / Blocked Credit under Section 17(5)</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Tax (₹)
                    </label>
                    <input
                      type="number"
                      value={drc01Inputs.demandTax}
                      onChange={(e) => setDrc01Inputs({ ...drc01Inputs, demandTax: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Interest (₹)
                    </label>
                    <input
                      type="number"
                      value={drc01Inputs.demandInterest}
                      onChange={(e) => setDrc01Inputs({ ...drc01Inputs, demandInterest: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Penalty (₹)
                    </label>
                    <input
                      type="number"
                      value={drc01Inputs.demandPenalty}
                      onChange={(e) => setDrc01Inputs({ ...drc01Inputs, demandPenalty: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                    Adjudicating Officer &amp; Ward
                  </label>
                  <input
                    type="text"
                    value={drc01Inputs.officerDesignation}
                    onChange={(e) => setDrc01Inputs({ ...drc01Inputs, officerDesignation: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                    Factual Defense Details
                  </label>
                  <textarea
                    rows={2}
                    value={drc01Inputs.additionalFacts}
                    onChange={(e) => setDrc01Inputs({ ...drc01Inputs, additionalFacts: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium text-xs resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateDrc01Reply}
                disabled={drc01Loading}
                className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {drc01Loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Formulating Legal Defense...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Generate Form GST DRC-06 Reply</span>
                  </>
                )}
              </button>
            </div>

            {/* DRC-06 Reply Preview */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-purple-600" />
                  <h4 className="text-xs font-mono font-bold uppercase text-zinc-900 dark:text-white">
                    Form GST DRC-06 Statutory Legal Paperbook
                  </h4>
                </div>

                {drc01Result && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(drc01Result.replyContent, "copy-drc06")}
                      className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {copiedId === "copy-drc06" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Copy Reply</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="p-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 min-h-[460px] overflow-y-auto font-mono text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed whitespace-pre-wrap">
                {drc01Result ? (
                  drc01Result.replyContent
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-3 font-sans">
                    <Scale className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
                    <div className="space-y-1">
                      <div className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">
                        DRC-06 Rebuttal Not Yet Generated
                      </div>
                      <p className="text-xs text-zinc-500 max-w-sm">
                        Select the SCN allegation type (e.g. 2A vs 3B mismatch or Section 16(4) time-bar) and click &quot;Generate Form GST DRC-06 Reply&quot;.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PILLAR 4: STATUTORY CHAT ASSISTANT (CS & CA)
      ========================================================================= */}
      {activeTab === "statutory-chat" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 space-y-5 shadow-xs">
          
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-sm font-extrabold text-zinc-950 dark:text-white">
                  Interactive Statutory Counsel &amp; Section Research Canvas
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                  Ask any question on Companies Act 2013, Income Tax Act 1961, CGST Act 2017, and ICAI/ICSI standards.
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setChatMessages([
                  {
                    role: "assistant",
                    text: `Canvas reset. How can I assist your CS or CA practice today?`,
                    time: "Just now",
                    engine: "statutory-corpus",
                  },
                ])
              }
              className="text-xs font-mono text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
            >
              Clear Conversation
            </button>
          </div>

          {/* Quick Prompt Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              "Analyze Section 186 loan threshold and special resolution mandate",
              "Explain Section 43B(h) MSME disallowance and 15/45 days rule",
              "How to defend GST DRC-01 notice citing GSTR-2A vs 3B mismatch?",
              "What are the reporting requirements under Form 3CD Clause 44 for GST expenditure?",
              "Draft board resolution for CSR Committee under Section 135",
            ].map((promptText, i) => (
              <button
                key={i}
                onClick={() => handleSendChat(promptText)}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <ArrowRight className="w-3 h-3 text-amber-500" />
                <span>{promptText}</span>
              </button>
            ))}
          </div>

          {/* Chat Stream Window */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 min-h-[420px] max-h-[560px] overflow-y-auto space-y-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs">
                    W
                  </div>
                )}
                <div
                  className={`max-w-2xl p-4 rounded-2xl text-xs space-y-1.5 shadow-xs ${
                    msg.role === "user"
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                      : "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-70 font-mono">
                    <span>{msg.role === "user" ? "Practitioner Query" : `Wakheel AI (${msg.engine || "Statutory"})`}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div className="leading-relaxed whitespace-pre-wrap font-sans font-normal">
                    {msg.text}
                  </div>
                  {msg.role === "assistant" && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleCopy(msg.text, `chat-${idx}`)}
                        className="text-[10px] font-mono text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === `chat-${idx}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center gap-2 p-3 text-xs text-zinc-500 font-mono">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span>Wakheel AI is analyzing statutory provisions and generating paperbook...</span>
              </div>
            )}
          </div>

          {/* Prompt Input Box */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Ask any statutory question (e.g., Section 185 exemptions, Clause 43B(h), DRC-01 rebuttal)..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChat();
                }
              }}
              className="flex-1 p-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-red-600 transition-all font-sans font-medium"
            />
            <button
              onClick={() => handleSendChat()}
              disabled={chatLoading || !chatInput.trim()}
              className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
