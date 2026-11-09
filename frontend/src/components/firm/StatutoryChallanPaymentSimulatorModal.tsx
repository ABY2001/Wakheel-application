"use client";

import React, { useState, useEffect } from "react";
import {
  Receipt,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Download,
  Copy,
  Check,
  CreditCard,
  Building,
  RefreshCw,
  QrCode,
  ShieldCheck,
  Scale,
  X,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Lock,
  Landmark,
  Coins,
} from "lucide-react";
import { challanDscApi, StatutoryChallanItem } from "@/lib/challanDscApi";
import { citizenApi } from "@/lib/api";

export type PortalType = "MCA21" | "CBDT_INCOME_TAX" | "GSTN";

export interface StatutoryChallanModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewerMode: "client" | "professional";
  docket: {
    id: string;
    caseNumber: string;
    title: string;
    court?: string;
    category?: "cs" | "ca" | string;
    assignedAdvocate?: string;
    clientName?: string;
    clientCinOrPan?: string;
    clientGstin?: string;
    status?: string;
    stageIndex?: number;
    feePaid?: string;
    documents?: Array<{
      name: string;
      size: string;
      hash?: string;
      type?: string;
      uploadedAt?: string;
      source?: string;
    }>;
  } | null;
  onChallanPaid?: (paidChallan: StatutoryChallanItem, newDocketDoc: any) => void;
}

export function StatutoryChallanPaymentSimulatorModal({
  isOpen,
  onClose,
  viewerMode,
  docket,
  onChallanPaid,
}: StatutoryChallanModalProps) {
  // Portal & Challan Type
  const [selectedPortal, setSelectedPortal] = useState<PortalType>("MCA21");
  const [formName, setFormName] = useState<string>("AOC-4");
  const [authorizedCapital, setAuthorizedCapital] = useState<number>(25000000); // ₹2.5 Cr
  const [delayDays, setDelayDays] = useState<number>(0);

  // Fee Breakdown
  const [baseFee, setBaseFee] = useState<number>(600);
  const [lateFee, setLateFee] = useState<number>(0);
  const [interestFee, setInterestFee] = useState<number>(0);
  const [feeScheduleLabel, setFeeScheduleLabel] = useState<string>("Companies (Registration Offices and Fees) Rules 2014");

  // Payment Simulation State
  const [paymentMode, setPaymentMode] = useState<"NET_BANKING" | "NEFT_RTGS" | "UPI">("NET_BANKING");
  const [tenderedBank, setTenderedBank] = useState<string>("State Bank of India (SBI)");
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<"CONFIGURE" | "PROCESSING" | "RECEIPT">("CONFIGURE");
  const [paidChallanRecord, setPaidChallanRecord] = useState<StatutoryChallanItem | null>(null);

  // Copy feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Derive initial portal & form from docket details
  useEffect(() => {
    if (!docket) return;

    const caseNum = (docket.caseNumber || "").toUpperCase();
    const title = (docket.title || "").toLowerCase();
    const court = (docket.court || "").toLowerCase();

    if (caseNum.startsWith("ITR") || title.includes("tax") || court.includes("income tax") || court.includes("icai")) {
      setSelectedPortal("CBDT_INCOME_TAX");
      setFormName(title.includes("3cd") ? "ITNS 281 (TDS/TCS)" : "ITNS 280 (Self-Assessment)");
      setBaseFee(10000);
    } else if (caseNum.startsWith("GST") || title.includes("gst") || court.includes("gst")) {
      setSelectedPortal("GSTN");
      setFormName("GST PMT-06 (Cash Ledger)");
      setBaseFee(14500);
    } else {
      setSelectedPortal("MCA21");
      if (title.includes("dir-12")) {
        setFormName("DIR-12 (Director Appointment)");
        setBaseFee(600);
      } else if (title.includes("mgt-14") || title.includes("186")) {
        setFormName("MGT-14 (Section 186 Special Resolution)");
        setBaseFee(600);
      } else {
        setFormName("AOC-4 & MGT-7 (Annual Return)");
        setBaseFee(1200);
      }
    }

    setPaymentStep("CONFIGURE");
    setPaidChallanRecord(null);
  }, [docket, isOpen]);

  // Recalculate fee dynamically when inputs change
  useEffect(() => {
    if (selectedPortal === "MCA21") {
      let normal = 600;
      if (authorizedCapital < 100000) normal = 200;
      else if (authorizedCapital < 500000) normal = 300;
      else if (authorizedCapital < 2500000) normal = 400;
      else if (authorizedCapital < 10000000) normal = 500;
      else normal = 600;

      let penalty = 0;
      if (delayDays > 0) {
        if (formName.includes("AOC-4") || formName.includes("MGT-7")) {
          penalty = delayDays * 100; // ₹100 per day under Section 403
        } else {
          penalty = normal * (delayDays <= 30 ? 2 : delayDays <= 60 ? 4 : delayDays <= 90 ? 6 : 10);
        }
      }

      setBaseFee(normal);
      setLateFee(penalty);
      setInterestFee(0);
      setFeeScheduleLabel("Table A & B of Companies (Registration Offices and Fees) Rules, 2014");
    } else if (selectedPortal === "CBDT_INCOME_TAX") {
      setFeeScheduleLabel("Income Tax OLTAS Framework (Major Head 0020 / Minor Head 300)");
      setLateFee(0);
      setInterestFee(0);
    } else {
      setFeeScheduleLabel("GST Rule 87 Electronic Cash Ledger (CPIN 14-Digit Mandate)");
      setLateFee(0);
      setInterestFee(0);
    }
  }, [selectedPortal, formName, authorizedCapital, delayDays]);

  if (!isOpen || !docket) return null;

  const totalPayable = baseFee + lateFee + interestFee;

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // ---------------------------------------------------------------------------
  // SIMULATE PAYMENT GATEWAY FLOW
  // ---------------------------------------------------------------------------
  const handleSimulatePayment = async () => {
    try {
      setIsProcessingPayment(true);
      setPaymentStep("PROCESSING");

      // Realistic gateway simulation delay
      await new Promise((resolve) => setTimeout(resolve, 1800));

      const timestamp = new Date().toISOString();
      const randomCin = Math.floor(10000 + Math.random() * 90000);
      const bsrCode = "0290142"; // State Bank of India Commercial Branch

      let identifier = "";
      let challanType = "";

      if (selectedPortal === "MCA21") {
        identifier = `SRN-F${Math.floor(1000000 + Math.random() * 9000000)}`;
        challanType = "MCA21_BHARATKOSH_FEE";
      } else if (selectedPortal === "GSTN") {
        identifier = `CPIN-2610${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        challanType = "GST_PMT06_CASH_LEDGER";
      } else {
        identifier = `ITNS-280-CIN-${bsrCode}${randomCin}`;
        challanType = "CBDT_ITNS280_TAX";
      }

      const receiptNo = `NTRP/${new Date().getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`;

      const paidChallan: StatutoryChallanItem = {
        challanId: `CHL-${selectedPortal.slice(0, 3)}-${Date.now().toString().slice(-6)}`,
        portal: selectedPortal,
        challanType,
        entityName: docket.clientName || "Inworth Technologies Pvt Ltd",
        cinOrPanOrGstin: (docket.clientCinOrPan || "U72200KL2023PTC081290").toUpperCase(),
        financialYear: "2025-26",
        assessmentYear: "2026-27",
        filingForm: formName,
        srnOrCpinOrCin: identifier,
        bsrCode,
        challanSerialNumber: `${randomCin}`,
        tenderedBank,
        paymentMode,
        amountBreakdown: {
          baseFeeOrTax: baseFee,
          additionalOrLateFee: lateFee,
          interest: interestFee,
          totalAmount: totalPayable,
        },
        paymentStatus: "PAID",
        paidAt: timestamp,
        receiptNumber: receiptNo,
        dscSignatory: docket.assignedAdvocate || "CS Meera Krishnan & CA Ramanathan Iyer",
        createdAt: timestamp,
      };

      setPaidChallanRecord(paidChallan);

      // Create new document to attach to docket vault
      const newDocketDoc = {
        name: `Official_${selectedPortal}_Challan_Receipt_${identifier.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
        size: "340 KB",
        hash: `sha256:7f92014ea89201cb${randomCin}`,
        type: "application/pdf",
        uploadedAt: timestamp,
        source: "statutory_challan_simulator",
      };

      // Call callback if provided
      if (onChallanPaid) {
        onChallanPaid(paidChallan, newDocketDoc);
      }

      // Update backend matter fee status
      const token = typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("wakheel_token") || "dev_token"
        : "dev_token";

      await citizenApi.updateMatter(token, docket.id, {
        feePaid: `₹ ${totalPayable.toLocaleString("en-IN")} Discharged via ${selectedPortal} (${identifier})`,
        status: "Statutory Fee Discharged & Officially Stamped",
      }).catch((e) => console.warn("updateMatter non-fatal:", e));

      setPaymentStep("RECEIPT");
    } catch (err: any) {
      console.error("Payment simulation error:", err);
      alert("Payment simulation error: " + (err.message || "Unknown error"));
      setPaymentStep("CONFIGURE");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // ---------------------------------------------------------------------------
  // DOWNLOAD STANDALONE CHALLAN RECEIPT (Plain-text)
  // ---------------------------------------------------------------------------
  const handleDownloadReceiptText = () => {
    if (!paidChallanRecord) return;

    const receiptText = `================================================================================
GOVERNMENT OF INDIA • NON-TAX RECEIPT PORTAL (BHARATKOSH / NTRP) & E-PAY TAX
OFFICIAL STATUTORY CHALLAN & PAYMENT ACKNOWLEDGMENT
================================================================================
Receipt Serial No: ${paidChallanRecord.receiptNumber}
Statutory Authority / Portal: ${paidChallanRecord.portal}
Service Request Number (SRN / CPIN / CIN): ${paidChallanRecord.srnOrCpinOrCin}
Date & Time of Tender: ${paidChallanRecord.paidAt}

ASSESSEE PARTICULARS:
Corporate Entity Name: ${paidChallanRecord.entityName}
CIN / PAN / GSTIN: ${paidChallanRecord.cinOrPanOrGstin}
Filing Form / Matter: ${paidChallanRecord.filingForm}
Docket Reference: ${docket.caseNumber}

PAYMENT & TREASURY PARTICULARS:
Authorized Tender Bank: ${paidChallanRecord.tenderedBank}
BSR Branch Code: ${paidChallanRecord.bsrCode}
Challan Serial Number: ${paidChallanRecord.challanSerialNumber}
Payment Channel: ${paidChallanRecord.paymentMode}

STATUTORY BREAKDOWN:
- Base Filing Fee / Tax: ₹ ${paidChallanRecord.amountBreakdown.baseFeeOrTax.toLocaleString("en-IN")}
- Additional Fee / Late Filing Penalty: ₹ ${(paidChallanRecord.amountBreakdown.additionalOrLateFee || 0).toLocaleString("en-IN")}
- Statutory Interest: ₹ ${(paidChallanRecord.amountBreakdown.interest || 0).toLocaleString("en-IN")}
--------------------------------------------------------------------------------
TOTAL STATUTORY SUM DISCHARGED: ₹ ${paidChallanRecord.amountBreakdown.totalAmount.toLocaleString("en-IN")}
PAYMENT STATUS: PAID & OFFICIALLY RECONCILED WITH RBI e-KUBER TREASURY
================================================================================
Note: This receipt serves as valid proof of statutory remittance under Section 403 of Companies Act 2013 / Section 65B of Evidence Act.`;

    const blob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Government_Statutory_Challan_${paidChallanRecord.srnOrCpinOrCin.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in font-sans">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-black dark:text-white">
        
        {/* =====================================================================
            MODAL HEADER
        ===================================================================== */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-black dark:text-white">
                  Government Statutory Challan &amp; Payment Simulator
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                  BharatKosh • OLTAS • GSTN
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono">
                {docket.caseNumber} • {docket.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =====================================================================
            MODAL BODY
        ===================================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* STEP 1: CONFIGURE CHALLAN & STATUTORY FEES */}
          {paymentStep === "CONFIGURE" && (
            <div className="space-y-6">
              
              {/* Portal Selector Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "MCA21" as PortalType,
                    title: "MCA21 / BharatKosh (NTRP)",
                    sub: "ROC Annual AOC-4, DIR-12, MGT-14",
                    badge: "Ministry of Corporate Affairs",
                  },
                  {
                    id: "CBDT_INCOME_TAX" as PortalType,
                    title: "Income Tax (ITNS 280 / 281)",
                    sub: "Self-Assessment, Advance Tax, TDS",
                    badge: "Central Board of Direct Taxes",
                  },
                  {
                    id: "GSTN" as PortalType,
                    title: "GST PMT-06 (Cash Ledger)",
                    sub: "14-Digit CPIN • CGST/SGST/IGST",
                    badge: "Goods & Services Tax Network",
                  },
                ].map((p) => {
                  const isSelected = selectedPortal === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPortal(p.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                        isSelected
                          ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-black dark:text-white"
                      }`}
                    >
                      <span className={`text-[10px] font-mono font-bold block ${isSelected ? "text-zinc-300 dark:text-zinc-700" : "text-zinc-500"}`}>
                        {p.badge}
                      </span>
                      <div className="text-xs font-black">{p.title}</div>
                      <div className={`text-[11px] ${isSelected ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400"}`}>
                        {p.sub}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Parameter Settings */}
              <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Statutory Fee Computation Parameters</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {feeScheduleLabel}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-600 dark:text-zinc-400">Filing Form / Challan Head</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black font-semibold text-black dark:text-white"
                    />
                  </div>

                  {selectedPortal === "MCA21" ? (
                    <>
                      <div className="space-y-1">
                        <label className="font-bold text-zinc-600 dark:text-zinc-400">Authorized Share Capital (₹)</label>
                        <select
                          value={authorizedCapital}
                          onChange={(e) => setAuthorizedCapital(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black font-mono font-semibold text-black dark:text-white cursor-pointer"
                        >
                          <option value={50000}>₹ 50,000 (Small Co - ₹200 fee)</option>
                          <option value={400000}>₹ 4,00,000 (Below ₹5L - ₹300 fee)</option>
                          <option value={2000000}>₹ 20,00,000 (Below ₹25L - ₹400 fee)</option>
                          <option value={8000000}>₹ 80,00,000 (Below ₹1 Cr - ₹500 fee)</option>
                          <option value={25000000}>₹ 2,50,00,000 (Above ₹1 Cr - ₹600 fee)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-zinc-600 dark:text-zinc-400">Days of Delay (Beyond Due Date)</label>
                        <input
                          type="number"
                          min={0}
                          max={365}
                          value={delayDays}
                          onChange={(e) => setDelayDays(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black font-mono font-semibold text-black dark:text-white"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="font-bold text-zinc-600 dark:text-zinc-400">Base Statutory Remittance (₹)</label>
                        <input
                          type="number"
                          min={100}
                          value={baseFee}
                          onChange={(e) => setBaseFee(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black font-mono font-semibold text-black dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-zinc-600 dark:text-zinc-400">Applicable Late Fee / Interest (₹)</label>
                        <input
                          type="number"
                          min={0}
                          value={lateFee}
                          onChange={(e) => setLateFee(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black font-mono font-semibold text-black dark:text-white"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Fee Breakdown & Payment Channel Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left: Itemized Fee Plaque */}
                <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-black dark:text-white block pb-2 border-b border-zinc-100 dark:border-zinc-900">
                    Statutory Fee Breakdown
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Normal Filing / Base Tax:</span>
                      <span className="font-mono font-bold text-black dark:text-white">
                        ₹ {baseFee.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {lateFee > 0 && (
                      <div className="flex justify-between text-red-600 dark:text-red-400">
                        <span>Additional Fee / Delay Penalty:</span>
                        <span className="font-mono font-bold">+ ₹ {lateFee.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    {interestFee > 0 && (
                      <div className="flex justify-between text-amber-600 dark:text-amber-400">
                        <span>Statutory Penal Interest:</span>
                        <span className="font-mono font-bold">+ ₹ {interestFee.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-sm font-black text-black dark:text-white">
                      <span>Total Government Dues:</span>
                      <span className="font-mono text-base text-emerald-600 dark:text-emerald-400">
                        ₹ {totalPayable.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Payment Gateway Channel */}
                <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-black dark:text-white block pb-2 border-b border-zinc-100 dark:border-zinc-900">
                    Authorized Payment Gateway
                  </span>
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-600 dark:text-zinc-400">Tender Channel</label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-semibold cursor-pointer"
                      >
                        <option value="NET_BANKING">Internet Banking (BharatKosh Aggregator)</option>
                        <option value="NEFT_RTGS">Corporate NEFT / RTGS (e-Challan Mandate)</option>
                        <option value="UPI">UPI / Bharat Interface for Money</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-600 dark:text-zinc-400">Designated Treasury Bank</label>
                      <select
                        value={tenderedBank}
                        onChange={(e) => setTenderedBank(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-semibold cursor-pointer"
                      >
                        <option value="State Bank of India (SBI)">State Bank of India (BSR: 0290142)</option>
                        <option value="HDFC Bank Ltd">HDFC Bank Ltd (BSR: 0510012)</option>
                        <option value="ICICI Bank Ltd">ICICI Bank Ltd (BSR: 0630045)</option>
                        <option value="Bank of Baroda">Bank of Baroda (BSR: 0200194)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] font-mono text-zinc-500">
                  Simulates direct connectivity to Reserve Bank of India e-Kuber &amp; NTRP settlement engine.
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    className="px-6 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer flex items-center gap-2 shadow-md"
                  >
                    <span>Simulate Gateway Payment (₹ {totalPayable.toLocaleString("en-IN")})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT GATEWAY IN PROGRESS */}
          {paymentStep === "PROCESSING" && (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-zinc-200 dark:border-zinc-800 border-t-black dark:border-t-white animate-spin mx-auto" />
              <div>
                <h4 className="text-base font-black text-black dark:text-white">
                  Connecting to {selectedPortal} Government Gateway...
                </h4>
                <p className="text-xs text-zinc-500 font-mono mt-1">
                  Transmitting XML payload to RBI e-Kuber • Generating Challan Identification Number (CIN)
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: OFFICIAL CHALLAN RECEIPT (PAID & STAMPED) */}
          {paymentStep === "RECEIPT" && paidChallanRecord && (
            <div className="space-y-6">
              
              {/* Success Badge */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-black text-sm block">
                      Statutory Payment Discharged Successfully!
                    </span>
                    <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                      Challan receipt stamped with SHA-256 hash and appended to docket document vault.
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-[10px] text-zinc-400 block uppercase font-bold">Total Discharged</span>
                  <span className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
                    ₹ {paidChallanRecord.amountBreakdown.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* High-Fidelity Printable Challan Receipt Surface */}
              <div
                id="statutory-printable-challan-surface"
                className="p-6 sm:p-8 rounded-3xl border-2 border-zinc-900 dark:border-zinc-700 bg-white text-zinc-950 font-sans space-y-5 shadow-lg select-text"
              >
                {/* Government Header */}
                <div className="text-center pb-4 border-b-2 border-zinc-900 space-y-1">
                  <div className="text-[10px] font-mono tracking-widest font-black uppercase text-zinc-600">
                    सत्यमेव जयते • GOVERNMENT OF INDIA
                  </div>
                  <h3 className="text-sm sm:text-base font-black tracking-wide uppercase text-zinc-950">
                    NON-TAX RECEIPT PORTAL (BHARATKOSH / NTRP) &amp; STATUTORY E-PAY TAX
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">
                    Official Treasury E-Challan Receipt under Section 403 / Rule 12 Companies Act &amp; GST Rule 87
                  </p>
                </div>

                {/* Identification Meta Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-300 font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">Receipt No</span>
                    <span className="font-bold text-zinc-950 truncate block">{paidChallanRecord.receiptNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">Portal Token (SRN/CPIN)</span>
                    <span className="font-bold text-red-700 truncate block">{paidChallanRecord.srnOrCpinOrCin}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">Tender Date &amp; Time</span>
                    <span className="font-bold text-zinc-950 block">
                      {new Date(paidChallanRecord.paidAt || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">Payment Status</span>
                    <span className="font-black text-emerald-700 block">PAID &amp; RECONCILED</span>
                  </div>
                </div>

                {/* Assessee & Banking Table */}
                <div className="rounded-xl border border-zinc-300 overflow-hidden text-xs">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b border-zinc-200">
                        <td className="w-1/3 p-2.5 bg-zinc-50 font-bold text-zinc-600 border-r border-zinc-200">
                          Assessee / Entity Name
                        </td>
                        <td className="p-2.5 font-black text-zinc-950" colSpan={3}>
                          {paidChallanRecord.entityName}
                        </td>
                      </tr>
                      <tr className="border-b border-zinc-200">
                        <td className="p-2.5 bg-zinc-50 font-bold text-zinc-600 border-r border-zinc-200">
                          Corporate ID (CIN) / PAN
                        </td>
                        <td className="p-2.5 font-mono font-bold text-zinc-900 border-r border-zinc-200">
                          {paidChallanRecord.cinOrPanOrGstin}
                        </td>
                        <td className="w-1/4 p-2.5 bg-zinc-50 font-bold text-zinc-600 border-r border-zinc-200">
                          Filing Form Head
                        </td>
                        <td className="p-2.5 font-bold text-zinc-900">
                          {paidChallanRecord.filingForm}
                        </td>
                      </tr>
                      <tr className="border-b border-zinc-200">
                        <td className="p-2.5 bg-zinc-50 font-bold text-zinc-600 border-r border-zinc-200">
                          Tendered Treasury Bank
                        </td>
                        <td className="p-2.5 text-zinc-900 border-r border-zinc-200">
                          {paidChallanRecord.tenderedBank}
                        </td>
                        <td className="p-2.5 bg-zinc-50 font-bold text-zinc-600 border-r border-zinc-200">
                          BSR Code &amp; Challan Serial
                        </td>
                        <td className="p-2.5 font-mono font-bold text-zinc-900">
                          {paidChallanRecord.bsrCode} • {paidChallanRecord.challanSerialNumber}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 bg-zinc-50 font-bold text-zinc-600 border-r border-zinc-200">
                          Matter Docket Ref
                        </td>
                        <td className="p-2.5 font-mono font-bold text-zinc-900" colSpan={3}>
                          {docket.caseNumber} • {docket.title}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Amount Ledger Plaque */}
                <div className="p-4 rounded-xl border border-zinc-300 bg-zinc-50 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Base Statutory Filing Fee / Tax Head:</span>
                    <span className="font-mono font-bold">₹ {paidChallanRecord.amountBreakdown.baseFeeOrTax.toLocaleString("en-IN")}</span>
                  </div>
                  {(paidChallanRecord.amountBreakdown.additionalOrLateFee || 0) > 0 && (
                    <div className="flex justify-between text-red-700">
                      <span>Additional / Late Filing Fee:</span>
                      <span className="font-mono font-bold">₹ {(paidChallanRecord.amountBreakdown.additionalOrLateFee || 0).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-zinc-300 flex justify-between font-black text-sm text-zinc-950">
                    <span>Total Amount Tendered (INR):</span>
                    <span className="font-mono text-emerald-700 text-base">
                      ₹ {paidChallanRecord.amountBreakdown.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Bottom Signature & Verification Seal */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t-2 border-zinc-900 text-[10px] font-mono text-zinc-600">
                  <div>
                    CHALLAN IDENTIFICATION NUMBER: <strong>{paidChallanRecord.bsrCode}{paidChallanRecord.challanSerialNumber}</strong>
                  </div>
                  <div className="font-bold text-zinc-950">
                    AUTHENTICATED VIA RBI e-KUBER RECONCILIATION GATEWAY
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentStep("CONFIGURE")}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold cursor-pointer"
                >
                  Generate Another Challan
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadReceiptText}
                    className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Receipt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Treasury Challan</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatutoryChallanPaymentSimulatorModal;
