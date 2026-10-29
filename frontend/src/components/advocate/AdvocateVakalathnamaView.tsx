"use client";

import React, { useState } from "react";
import {
  FileText,
  Shield,
  Stamp,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Lock,
  Printer,
  Download,
  Send,
  Smartphone,
  KeyRound,
  FileCheck,
  Building2,
  Scale,
  User,
  Users,
  Copy,
  Check,
  RefreshCw,
  Plus,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Eye,
  PenTool,
} from "lucide-react";

export interface AdvocateVakalathnamaViewProps {
  advocateName?: string;
  barCouncilNumber?: string;
  token?: string;
}

export interface VakalathItem {
  id: string;
  caseNumber: string;
  courtName: string;
  clientName: string;
  clientPhone: string;
  aadhaarLast4: string;
  partyRole: string;
  stampSerial: string;
  stampAmount: number;
  courtFeeAmount: number;
  signedAt: string;
  status: "verified" | "pending_otp" | "draft";
  hashSha256: string;
}

export function AdvocateVakalathnamaView({
  advocateName = "Adv. Meera Krishnan",
  barCouncilNumber = "K/001429/2012",
  token,
}: AdvocateVakalathnamaViewProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    "generator" | "stamping" | "esign" | "scrutiny" | "register"
  >("generator");

  // Form State
  const [courtName, setCourtName] = useState("High Court of Kerala at Ernakulam");
  const [caseNumber, setCaseNumber] = useState("WP(C) 19482/2024");
  const [petitionerName, setPetitionerName] = useState("Gopakumar Nambiar");
  const [petitionerAge, setPetitionerAge] = useState("52");
  const [petitionerFather, setPetitionerFather] = useState("Late K. Raman Nambiar");
  const [petitionerAddress, setPetitionerAddress] = useState("Nambiar House, Cheranalloor P.O., Ernakulam — 682034");
  const [petitionerPhone, setPetitionerPhone] = useState("+91 94471 28930");
  const [petitionerAadhaar, setPetitionerAadhaar] = useState("8920");
  const [respondentName, setRespondentName] = useState("Kerala State Electricity Board & Anr.");
  const [appearanceFor, setAppearanceFor] = useState("Petitioner");

  // Welfare Stamp State
  const [stampAffixed, setStampAffixed] = useState(true);
  const [stampSerialNumber, setStampSerialNumber] = useState("KAWF-2026-KLHC-98214-E");
  const [stampBalance, setStampBalance] = useState(18);

  // Client E-Sign OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isClientSigned, setIsClientSigned] = useState(true);
  const [signTimestamp, setSignTimestamp] = useState("29 Oct 2026, 10:15:32 IST");
  const [signHash, setSignHash] = useState("SHA256: 4f8a92b1c83409ef1277a884e931b2c4d98a0018");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Pre-configured Executed Register
  const [vakalathRegister, setVakalathRegister] = useState<VakalathItem[]>([
    {
      id: "vak_101",
      caseNumber: "WP(C) 19482/2024",
      courtName: "High Court of Kerala (Court Hall 2A)",
      clientName: "Gopakumar Nambiar",
      clientPhone: "+91 94471 28930",
      aadhaarLast4: "8920",
      partyRole: "Petitioner",
      stampSerial: "KAWF-2026-KLHC-98214-E",
      stampAmount: 25,
      courtFeeAmount: 2,
      signedAt: "Today, 10:15 IST",
      status: "verified",
      hashSha256: "4f8a92b1c83409ef1277a884e931b2c4d98a0018",
    },
    {
      id: "vak_102",
      caseNumber: "ARB/NCLT/KOCHI/2024/041",
      courtName: "NCLT Kochi Bench (Court Hall 1)",
      clientName: "Apex Logistics Ltd (MD: Rajesh Menon)",
      clientPhone: "+91 98460 44120",
      aadhaarLast4: "4412",
      partyRole: "Petitioner",
      stampSerial: "KAWF-2026-NCLT-98120-E",
      stampAmount: 25,
      courtFeeAmount: 2,
      signedAt: "26 Oct 2026",
      status: "verified",
      hashSha256: "9b34e128ccaa0194812f8832a104bb91238914aa",
    },
    {
      id: "vak_103",
      caseNumber: "Bail Appl. 8920/2026",
      courtName: "High Court of Kerala (Court Hall 3B)",
      clientName: "Muhammed Shafi",
      clientPhone: "+91 98472 11980",
      aadhaarLast4: "1198",
      partyRole: "Petitioner / Accused No. 1",
      stampSerial: "KAWF-2026-KLHC-97994-E",
      stampAmount: 25,
      courtFeeAmount: 2,
      signedAt: "24 Oct 2026",
      status: "verified",
      hashSha256: "117a09bcdef449102837418293aa88231049c812",
    },
  ]);

  // Send Simulated OTP to Client
  const handleSendClientOtp = () => {
    setOtpSent(true);
    setOtpValue("");
    showToast(`6-Digit eCourts Vakalathnama authentication OTP dispatched to ${petitionerPhone}.`);
  };

  // Verify OTP and Cryptographically Sign
  const handleVerifyOtp = () => {
    if (otpValue.trim() !== "749201" && otpValue.trim().length !== 6) {
      showToast("Please enter the 6-digit OTP (Test Demo Code: 749201).");
      return;
    }
    setIsClientSigned(true);
    setOtpSent(false);
    setSignTimestamp(new Date().toLocaleDateString("en-IN") + " " + new Date().toLocaleTimeString("en-IN"));
    showToast("Client Aadhaar eSign authenticated & cryptographically sealed onto Vakalathnama.");
  };

  // Affix Welfare Stamp
  const handleAffixStamp = () => {
    if (stampBalance <= 0) {
      showToast("Insufficient Welfare Stamps. Please purchase from Bar Council e-Portal.");
      return;
    }
    setStampAffixed(true);
    setStampBalance((prev) => prev - 1);
    const newSerial = `KAWF-2026-KLHC-${Math.floor(10000 + Math.random() * 90000)}-E`;
    setStampSerialNumber(newSerial);
    showToast(`Affixed Kerala Advocate Welfare Stamp (₹25 + ₹2) #${newSerial}.`);
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
      {/* 1. TOP HEADER & STATUTORY AUTHORITY BANNER                     */}
      {/* ============================================================== */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B1728]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                Civil Procedure Code (Order III, Rule 4) • Milestone 7
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a8] border border-[#6B1728]/30">
                Kerala Advocates Welfare Fund Act § 23 (₹25 + ₹2)
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-[10px] font-mono text-zinc-400">Roll: {barCouncilNumber}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white flex items-center gap-2.5">
              <span>High Court Vakalathnama E-Signing &amp; Welfare Stamp Suite</span>
            </h2>

            <p className="text-xs text-zinc-500 max-w-3xl">
              Statutory appointment of pleader under Order III Rule 4 CPC, digital Kerala Advocates Welfare Fund stamp affixation,
              Aadhaar/OTP client e-signing, and High Court Registry E-Filing 3.0 scrutiny clearance.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-black dark:text-white">
              <Stamp className="w-3.5 h-3.5 text-[#6B1728]" />
              <span>Digital Welfare Stamps:</span>
              <span className="font-mono font-bold text-[#6B1728] dark:text-[#ff94a8]">{stampBalance} Units</span>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Formatted Vakalath</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-900 text-xs">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
              Counsel on Record
            </span>
            <div className="font-bold text-black dark:text-white truncate">{advocateName}</div>
            <span className="text-[11px] text-zinc-500 font-mono">Roll: {barCouncilNumber}</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
              Mandatory Statutory Duty
            </span>
            <div className="text-base font-bold text-black dark:text-white">₹27.00 Total</div>
            <span className="text-[11px] text-zinc-500">₹25 Welfare Stamp + ₹2 Court Fee</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
              Client Authentication
            </span>
            <div className="text-base font-bold text-black dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#6B1728]" />
              <span>Aadhaar OTP Verified</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">IT Act 2000 § 3A Compliant</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
              Registry Scrutiny Status
            </span>
            <div className="text-base font-bold text-black dark:text-white">Zero Defects (D-204 Clear)</div>
            <span className="text-[11px] text-zinc-500">Ready for E-Filing 3.0 Docket</span>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("generator")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "generator"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Interactive Vakalath Drafter</span>
          </button>

          <button
            onClick={() => setActiveTab("stamping")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "stamping"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Stamp className="w-3.5 h-3.5 text-[#6B1728]" />
            <span>Welfare Stamp Stamping (₹25 + ₹2)</span>
          </button>

          <button
            onClick={() => setActiveTab("esign")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "esign"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Client Aadhaar / Mobile OTP E-Sign</span>
            {isClientSigned && (
              <span className="w-2 h-2 rounded-full bg-[#6B1728]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("scrutiny")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "scrutiny"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>E-Filing 3.0 Scrutiny Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab("register")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "register"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Executed Vakalath Register ({vakalathRegister.length})</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TAB: INTERACTIVE VAKALATH DRAFTER & OFFICIAL PLEADING PAPER */}
      {/* ============================================================== */}
      {activeTab === "generator" && (
        <div className="space-y-6">
          {/* Top Form Controls Row */}
          <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-black dark:text-white">
              Vakalathnama Particulars Form
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Court / Tribunal:</label>
                <select
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="High Court of Kerala at Ernakulam">High Court of Kerala at Ernakulam</option>
                  <option value="NCLT Kochi Bench">National Company Law Tribunal (NCLT Kochi)</option>
                  <option value="Sessions Court, Ernakulam">Principal District &amp; Sessions Court</option>
                  <option value="Supreme Court of India">Supreme Court of India (New Delhi)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Case Number &amp; Year:</label>
                <input
                  type="text"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Appearing For:</label>
                <select
                  value={appearanceFor}
                  onChange={(e) => setAppearanceFor(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="Petitioner">Petitioner / Appellant</option>
                  <option value="Respondent">Respondent / Defendant</option>
                  <option value="Applicant">Applicant / Intervenor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Client / Party Name:</label>
                <input
                  type="text"
                  value={petitionerName}
                  onChange={(e) => setPetitionerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Opposite Party Name:</label>
                <input
                  type="text"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Client Mobile for OTP:</label>
                <input
                  type="text"
                  value={petitionerPhone}
                  onChange={(e) => setPetitionerPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* OFFICIAL HIGH COURT VAKALATHNAMA PLEADING PAPER PREVIEW */}
          <div className="p-8 md:p-14 rounded-3xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 shadow-2xl max-w-4xl mx-auto space-y-8 font-serif leading-relaxed text-zinc-900 dark:text-zinc-100">
            {/* Top Stamps Area */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1 font-sans">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold block">
                  FORM NO. 12 • RULES OF PRACTICE
                </span>
                <span className="text-xs font-bold text-black dark:text-white uppercase">
                  VAKALATHNAMA (ORDER III RULE 4 C.P.C.)
                </span>
              </div>

              {/* Physical/Digital Stamp Representations */}
              <div className="flex items-center gap-3 self-end sm:self-auto font-sans">
                {/* 1. Court Fee Stamp (₹2.00) */}
                <div className="w-24 h-28 rounded-lg border-2 border-dashed border-zinc-400 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 p-2 flex flex-col justify-between text-center shadow-xs">
                  <div className="text-[9px] font-bold uppercase text-zinc-600 dark:text-zinc-300">
                    Court Fee
                  </div>
                  <div className="text-sm font-black text-black dark:text-white">₹2.00</div>
                  <div className="text-[8px] font-mono text-zinc-400">Govt of Kerala</div>
                </div>

                {/* 2. Kerala Advocates Welfare Fund Stamp (₹25.00) */}
                <div className="w-28 h-28 rounded-xl border-2 border-[#6B1728] bg-[#6B1728]/10 dark:bg-[#6B1728]/25 p-2 flex flex-col justify-between text-center shadow-md relative overflow-hidden">
                  <div className="text-[8px] font-bold uppercase tracking-tight text-[#6B1728] dark:text-[#ff94a8]">
                    Advocates Welfare Fund
                  </div>
                  <div className="text-base font-black text-[#6B1728] dark:text-[#ff94a8]">
                    ₹25.00
                  </div>
                  <div className="text-[8px] font-mono font-bold text-zinc-700 dark:text-zinc-300 truncate">
                    {stampSerialNumber}
                  </div>
                  <div className="text-[7px] text-zinc-500 uppercase">Bar Council of Kerala</div>
                </div>
              </div>
            </div>

            {/* Pleading Cause Title Header */}
            <div className="text-center space-y-1">
              <h3 className="text-base sm:text-lg font-bold uppercase tracking-wide">
                IN THE {courtName.toUpperCase()}
              </h3>
              <p className="font-sans font-bold text-sm tracking-tight">
                {caseNumber}
              </p>
            </div>

            {/* Cause Title Block */}
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <strong>{petitionerName}</strong>, aged {petitionerAge} years,<br />
                  Son of {petitionerFather},<br />
                  Residing at {petitionerAddress}.
                </div>
                <div className="font-bold">... {appearanceFor}</div>
              </div>

              <div className="text-center font-bold text-xs uppercase tracking-widest text-zinc-500 font-sans">
                — VERSUS —
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <strong>{respondentName}</strong>,<br />
                  Represented by its Secretary / Authorized Officers.
                </div>
                <div className="font-bold">... Opposite Party / Respondents</div>
              </div>
            </div>

            {/* Appointment Statement */}
            <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-justify">
              <p>
                <strong>KNOW ALL MEN BY THESE PRESENTS</strong> that I/we, the above-named <strong>{appearanceFor}</strong>, do
                hereby appoint, nominate, and constitute:
              </p>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-sans text-xs space-y-1">
                <div className="font-bold text-black dark:text-white">
                  1. {advocateName} (Roll No: {barCouncilNumber})
                </div>
                <div className="text-zinc-600 dark:text-zinc-400">
                  2. Adv. Rahul Deshmukh (Roll No: K/003412/2024) • Junior Counsel
                </div>
                <div className="text-zinc-600 dark:text-zinc-400">
                  3. Adv. Ananya Iyer (Roll No: K/002189/2023) • Associate Counsel
                </div>
                <div className="text-[11px] text-zinc-500 pt-1">
                  Chamber 402, High Court Advocates Association Building, Marine Drive, Kochi — 682031
                </div>
              </div>

              <p>
                to be my/our Advocate(s) in the above-mentioned matter, to appear, plead, and act for me/us, and to conduct and
                prosecute (or defend) the same, and all proceedings that may be taken in respect of any application connected therewith
                or any decree or order passed therein, including appeals, reviews, revisions, and execution petitions.
              </p>

              {/* 5 Powers Clauses */}
              <div className="space-y-2 pl-4 border-l-2 border-black dark:border-white font-sans text-xs">
                <p>
                  <strong>1. Pleadings &amp; Applications:</strong> To sign, verify, and file petitions, affidavits, interim applications,
                  rejoinders, and certified true copy applications.
                </p>
                <p>
                  <strong>2. Settlement &amp; Compromise:</strong> To settle, compromise, or withdraw the said matter on terms mutually
                  agreed with written instructions from me/us.
                </p>
                <p>
                  <strong>3. Registry Refunds &amp; Monies:</strong> To apply for, inspect, and receive monies, deposits, refunds, and
                  documents from the registry and grant valid receipts on my/our behalf.
                </p>
                <p>
                  <strong>4. Engagement of Senior Counsel:</strong> To nominate, brief, and engage Senior Advocates to conduct arguments
                  before the Hon&apos;ble Bench.
                </p>
              </div>

              <p>
                And I/we do hereby ratify and confirm all acts done by my/our said advocate(s) in the premises as if done by myself/ourselves.
              </p>
            </div>

            {/* Signature & Acceptance Grid */}
            <div className="pt-8 border-t-2 border-black dark:border-white grid grid-cols-1 sm:grid-cols-2 gap-8 font-sans text-xs">
              {/* Left Side: Advocate Acceptance */}
              <div className="space-y-3">
                <span className="font-bold text-black dark:text-white uppercase tracking-wider text-[10px] block">
                  ADVOCATE ACCEPTANCE ENDORSEMENT
                </span>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  I/We hereby accept the appointment as Advocate(s) for the above-named party on the terms agreed.
                </p>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <strong className="block text-black dark:text-white">{advocateName}</strong>
                  <span className="font-mono text-[10px] text-zinc-500 block">Enrolled: {barCouncilNumber}</span>
                  <span className="text-[10px] text-[#6B1728] font-bold block">✓ Digitally Accepted</span>
                </div>
              </div>

              {/* Right Side: Client Digital Signature */}
              <div className="space-y-3 text-right">
                <span className="font-bold text-black dark:text-white uppercase tracking-wider text-[10px] block">
                  CLIENT / EXECUTANT SIGNATURE
                </span>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  Signed, sealed, and delivered by the executant via Aadhaar/OTP cryptographic verification.
                </p>

                {isClientSigned ? (
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-left space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-black dark:text-white">{petitionerName}</strong>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#6B1728] text-white">
                        eSign Verified
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono block">
                      Aadhaar: ···· ···· {petitionerAadhaar} • Mobile: {petitionerPhone}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono block truncate">
                      {signHash}
                    </span>
                    <span className="text-[9px] text-zinc-400 block">{signTimestamp}</span>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-center text-zinc-400 text-xs">
                    Signature Pending • Awaiting Client OTP
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. TAB: WELFARE STAMP STAMPING (₹25 + ₹2)                      */}
      {/* ============================================================== */}
      {activeTab === "stamping" && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Stamp className="w-5 h-5 text-[#6B1728]" />
                <h3 className="text-base font-bold text-black dark:text-white">
                  Kerala Advocates Welfare Fund Act Stamping Protocol
                </h3>
              </div>
              <p className="text-xs text-zinc-500 max-w-3xl">
                Under Section 23 of the Kerala Advocates Welfare Fund Act, 1980, every Vakalathnama presented before any
                court, tribunal, or authority must be affixed with an Advocate Welfare Fund Stamp of ₹25.00 and Court Fee Stamp of ₹2.00.
                Failure to affix the stamp constitutes an incurable registry defect under High Court Scrutiny Code D-204.
              </p>
            </div>

            {/* Stamp Details Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <div className="space-y-4">
                <span className="font-bold text-black dark:text-white text-xs uppercase tracking-wider block">
                  Current Stamp Attachment Status
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500">Welfare Stamp Duty:</span>
                    <strong className="text-black dark:text-white">₹25.00 (Mandatory)</strong>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500">Court Fee Stamp:</span>
                    <strong className="text-black dark:text-white">₹2.00 (Schedule II Art. 10)</strong>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500">Unique Stamp Serial:</span>
                    <strong className="font-mono text-[#6B1728] dark:text-[#ff94a8]">{stampSerialNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Status:</span>
                    <span className="font-bold text-[#6B1728] dark:text-[#ff94a8]">✓ Affixed &amp; Cancelled</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAffixStamp}
                    className="px-4 py-2 rounded-xl bg-[#6B1728] text-white hover:bg-[#7A1B2E] font-bold text-xs transition cursor-pointer"
                  >
                    Generate New Digital Stamp
                  </button>
                </div>
              </div>

              {/* Graphical Stamp Visualizer */}
              <div className="p-6 rounded-2xl bg-white dark:bg-black border border-[#6B1728]/40 flex items-center justify-center">
                <div className="w-48 h-56 rounded-2xl border-4 border-[#6B1728] bg-[#6B1728]/10 dark:bg-[#6B1728]/25 p-4 flex flex-col justify-between text-center relative overflow-hidden shadow-xl">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono tracking-widest uppercase font-bold text-[#6B1728] dark:text-[#ff94a8] block">
                      STATE BAR COUNCIL
                    </span>
                    <h5 className="text-xs font-black uppercase text-black dark:text-white">
                      ADVOCATES WELFARE FUND
                    </h5>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-3xl font-black font-mono text-[#6B1728] dark:text-[#ff94a8]">
                      ₹25
                    </div>
                    <span className="text-[9px] text-zinc-500 font-mono block">TWENTY FIVE RUPEES</span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full h-4 bg-black dark:bg-white rounded-xs opacity-70" />
                    <span className="text-[8px] font-mono font-bold text-black dark:text-white block">
                      {stampSerialNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. TAB: CLIENT AADHAAR / MOBILE OTP E-SIGN WORKFLOW           */}
      {/* ============================================================== */}
      {activeTab === "esign" && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#6B1728]" />
                <h3 className="text-base font-bold text-black dark:text-white">
                  Client Aadhaar / Mobile OTP Cryptographic E-Sign
                </h3>
              </div>
              <p className="text-xs text-zinc-500 max-w-3xl">
                Complies with Section 3A of the Information Technology Act, 2000 and High Court E-Filing 3.0 standards.
                The client receives a time-sensitive 6-digit OTP on their registered mobile number to execute the Vakalathnama.
              </p>
            </div>

            {/* OTP Simulator Console */}
            <div className="max-w-xl mx-auto p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="space-y-0.5">
                  <span className="font-bold text-black dark:text-white block">Executant Details:</span>
                  <span className="text-zinc-500">{petitionerName} ({petitionerPhone})</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                  Aadhaar: ···· {petitionerAadhaar}
                </span>
              </div>

              {!otpSent && (
                <div className="text-center py-4 space-y-4">
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                    Click below to transmit the eCourts Vakalathnama signing OTP to client&apos;s registered mobile number ({petitionerPhone}).
                  </p>
                  <button
                    onClick={handleSendClientOtp}
                    className="px-6 py-3 rounded-full bg-[#6B1728] text-white hover:bg-[#7A1B2E] font-bold text-xs transition cursor-pointer shadow-md flex items-center gap-2 mx-auto"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch 6-Digit OTP to Client</span>
                  </button>
                </div>
              )}

              {otpSent && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-3.5 rounded-2xl bg-[#6B1728]/10 dark:bg-[#6B1728]/25 border border-[#6B1728]/30 space-y-1">
                    <span className="font-bold text-[#6B1728] dark:text-[#ff94a8] block text-[11px]">
                      SMS Gateway Transmitted:
                    </span>
                    <p className="text-zinc-700 dark:text-zinc-300 text-xs">
                      &ldquo;eCourts Kerala: Your OTP to electronically sign Vakalathnama for {caseNumber} with {advocateName} is <strong>749201</strong>. Valid for 10 minutes.&rdquo;
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-black dark:text-white block">
                      Enter Received 6-Digit OTP:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                        placeholder="e.g. 749201"
                        className="w-full p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-sm font-mono font-bold text-black dark:text-white tracking-widest text-center focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setOtpValue("749201")}
                        className="px-3 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold shrink-0 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                        title="Auto-fill demonstration code"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setOtpSent(false)}
                      className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVerifyOtp}
                      className="px-6 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 transition cursor-pointer"
                    >
                      Verify OTP &amp; Affix eSign
                    </button>
                  </div>
                </div>
              )}

              {isClientSigned && (
                <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 space-y-2">
                  <div className="flex items-center gap-2 text-[#6B1728] dark:text-[#ff94a8] font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Cryptographic Signature Sealed</span>
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-0.5 font-mono">
                    <div>Signer: {petitionerName} (Aadhaar ···· {petitionerAadhaar})</div>
                    <div>Timestamp: {signTimestamp}</div>
                    <div className="truncate">Hash: {signHash}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. TAB: E-FILING 3.0 SCRUTINY CHECKLIST                        */}
      {/* ============================================================== */}
      {activeTab === "scrutiny" && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#6B1728]" />
                <h3 className="text-base font-bold text-black dark:text-white">
                  High Court E-Filing 3.0 Scrutiny Checklist
                </h3>
              </div>
              <p className="text-xs text-zinc-500 max-w-3xl">
                Automatic pre-filing compliance audit matching High Court Rules of Practice Scrutiny standards.
                Prevents Defect Code D-204 (Stamping Defect) and Defect Code D-101 (Authority Defect).
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {[
                {
                  code: "R-101",
                  title: "Appointment in Writing Signed by Party (CPC Order III Rule 4)",
                  detail: "Client authorization properly executed with full name, parentage, and residential address.",
                  status: "PASS",
                },
                {
                  code: "R-204",
                  title: "Kerala Advocates Welfare Fund Stamp (₹25.00) Affixation (§ 23)",
                  detail: `Authentic welfare stamp #${stampSerialNumber} affixed and cancelled for matter.`,
                  status: "PASS",
                },
                {
                  code: "R-205",
                  title: "Court Fee Stamp (₹2.00) Court Fees Act Schedule II Art. 10",
                  detail: "Mandatory judicial court fee stamp attached.",
                  status: "PASS",
                },
                {
                  code: "R-301",
                  title: "Advocate on Record Roll Verification with State Bar Council",
                  detail: `Roll number ${barCouncilNumber} matches active Bar Council of Kerala Master Registry.`,
                  status: "PASS",
                },
                {
                  code: "R-401",
                  title: "IT Act 2000 Section 3A Cryptographic Integrity Verification",
                  detail: "Aadhaar eSign OTP verified with SHA-256 tamper-evident digital seal.",
                  status: "PASS",
                },
                {
                  code: "R-501",
                  title: "Complete Address for Service & Mandatory Phone / Email Included",
                  detail: "Advocate chamber address and client telephone verified for service.",
                  status: "PASS",
                },
              ].map((item) => (
                <div
                  key={item.code}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-2 py-0.2 rounded-md bg-zinc-200 dark:bg-zinc-800 font-bold text-black dark:text-white">
                        {item.code}
                      </span>
                      <strong className="text-black dark:text-white text-xs">{item.title}</strong>
                    </div>
                    <p className="text-zinc-500 text-[11px]">{item.detail}</p>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#6B1728] text-white shrink-0">
                    ✓ {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-black dark:text-white block">
                  Scrutiny Clearance Score: 100% (Zero Registry Defects)
                </span>
                <span className="text-[11px] text-zinc-500">
                  Ready for direct transmission to High Court E-Filing 3.0 Registry Portal.
                </span>
              </div>

              <button
                onClick={() => showToast("Vakalathnama bundle attached to High Court E-Filing dossier.")}
                className="px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 transition cursor-pointer shrink-0"
              >
                Attach to E-Filing Docket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. TAB: EXECUTED VAKALATHNAMA REGISTER                         */}
      {/* ============================================================== */}
      {activeTab === "register" && (
        <div className="space-y-5">
          <div className="rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white">
                  Executed Vakalathnama Register
                </h3>
                <p className="text-xs text-zinc-500">
                  Permanent chamber repository of client appointments &amp; welfare stamps
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export Register</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Case No &amp; Court</th>
                    <th className="py-3 px-4">Client / Executant</th>
                    <th className="py-3 px-4">Welfare Stamp Ref</th>
                    <th className="py-3 px-4">Duty (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {vakalathRegister.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-black dark:text-white block font-mono">
                          {item.caseNumber}
                        </span>
                        <span className="text-[10px] text-zinc-500 truncate max-w-xs block">
                          {item.courtName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-black dark:text-white block">
                          {item.clientName}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Aadhaar: ···· {item.aadhaarLast4} • {item.partyRole}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#6B1728] dark:text-[#ff94a8]">
                        {item.stampSerial}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-black dark:text-white">
                        ₹{item.stampAmount + item.courtFeeAmount}.00
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a8] border border-[#6B1728]/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Registry Verified
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setCaseNumber(item.caseNumber);
                            setPetitionerName(item.clientName);
                            setActiveTab("generator");
                            showToast(`Loaded ${item.caseNumber} into pleading drafter.`);
                          }}
                          className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white underline cursor-pointer"
                        >
                          View Pleading
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvocateVakalathnamaView;
