"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  Scale,
  Building,
  User,
  Users,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  FileCheck,
  Sparkles,
  Info,
  Layers,
  X,
  FileDown,
  History,
} from "lucide-react";

export interface AdvocateConflictScannerViewProps {
  advocateName?: string;
  barCouncilNumber?: string;
  token?: string;
}

export interface ConflictCheckResult {
  scanId: string;
  timestamp: string;
  proposedClient: string;
  adverseParty: string;
  subjectMatter: string;
  courtForum: string;
  severity: "critical" | "warning" | "clear";
  severityTitle: string;
  bciRuleCited: string;
  statutorySummary: string;
  conflictingMatters: Array<{
    caseNumber: string;
    partyRole: string;
    courtName: string;
    year: string;
    activeStatus: string;
    chamberRole: string;
  }>;
  riskVectors: Array<{
    category: string;
    description: string;
    level: "high" | "medium" | "low";
  }>;
  recommendedAction: string;
  waiverApplicable: boolean;
}

export function AdvocateConflictScannerView({
  advocateName = "Adv. Meera Krishnan",
  barCouncilNumber = "K/001429/2012",
  token,
}: AdvocateConflictScannerViewProps) {
  // Active Tab
  const [activeTab, setActiveTab] = useState<"scanner" | "audit-log" | "ethical-wall" | "rules-guide">(
    "scanner"
  );

  // Form State
  const [proposedClient, setProposedClient] = useState("Marine Exports Pvt Ltd");
  const [adverseParty, setAdverseParty] = useState("Apex Logistics Ltd");
  const [promotersOrSubsidiaries, setPromotersOrSubsidiaries] = useState("Apex Maritime Cargo & Cold Storage Division");
  const [subjectMatter, setSubjectMatter] = useState("Commercial Breach of Contract & Asset Attachment");
  const [courtForum, setCourtForum] = useState("High Court of Kerala (Commercial Appellate Division)");
  const [scanDepth, setScanDepth] = useState<"standard" | "deep">("deep");

  // Scanner Live Progression State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgressStage, setScanProgressStage] = useState("");
  const [scanResult, setScanResult] = useState<ConflictCheckResult | null>(null);

  // Modals state
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [showDeclineLetterModal, setShowDeclineLetterModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Historical Conflict Clearance Logs
  const [auditLogs, setAuditLogs] = useState<ConflictCheckResult[]>([
    {
      scanId: "BCI-SCAN-2026-0941",
      timestamp: "Today, 09:15 IST",
      proposedClient: "Marine Exports Pvt Ltd",
      adverseParty: "Apex Logistics Ltd",
      subjectMatter: "Commercial Arbitration Counter-Claim under Section 9",
      courtForum: "NCLT Kochi Bench",
      severity: "critical",
      severityTitle: "CRITICAL CONFLICT DETECTED — MANDATORY BCI RULE 8 BAR",
      bciRuleCited: "Bar Council of India Rules Part VI, Ch. II, R. 8 & Advocates Act § 35",
      statutorySummary:
        "Advocate has previously advised and currently acts for Apex Logistics Ltd in ARB/NCLT/KOCHI/2024/041. Representation of the opposite party is prohibited under mandatory Bar Council ethics rules.",
      conflictingMatters: [
        {
          caseNumber: "ARB/NCLT/KOCHI/2024/041",
          partyRole: "Petitioner (Current Client)",
          courtName: "NCLT Kochi Bench",
          year: "2024-Present",
          activeStatus: "Active Roster",
          chamberRole: "Senior Counsel on Record",
        },
      ],
      riskVectors: [
        {
          category: "Direct Adversarial Representation",
          description: "Representing opposing party against an active chamber client on record.",
          level: "high",
        },
        {
          category: "Confidential Information Cross-Contamination",
          description: "Access to trade secrets and financial balance sheets of Apex Logistics Ltd.",
          level: "high",
        },
      ],
      recommendedAction:
        "MANDATORY REFUSAL OF BRIEF: Advocate must immediately decline representation of Marine Exports Pvt Ltd and issue a non-engagement formal letter pursuant to BCI Rule 8.",
      waiverApplicable: false,
    },
    {
      scanId: "BCI-SCAN-2026-0812",
      timestamp: "24 Oct 2026, 14:30 IST",
      proposedClient: "Vanguard Infrastructure Ltd",
      adverseParty: "KSEB Contracting Division",
      subjectMatter: "Telegraph Line Injunction Challenge (Section 10)",
      courtForum: "High Court of Kerala (Court Hall 2A)",
      severity: "warning",
      severityTitle: "POTENTIAL CONFLICT DETECTED — MANDATORY DISCLOSURE REQUIRED",
      bciRuleCited: "Bar Council of India Rules Part VI, Ch. II, R. 10",
      statutorySummary:
        "Chamber currently represents Gopakumar Nambiar against KSEB in WP(C) 19482/2024. While not direct representation of KSEB, position taken in statutory interpretation must not clash.",
      conflictingMatters: [
        {
          caseNumber: "WP(C) 19482/2024",
          partyRole: "Petitioner vs KSEB",
          courtName: "High Court of Kerala",
          year: "2024",
          activeStatus: "Active Roster",
          chamberRole: "Counsel on Record",
        },
      ],
      riskVectors: [
        {
          category: "Substantive Legal Position Harmony",
          description: "Both matters contest Section 16 Telegraph Act referrals against the same utility board.",
          level: "medium",
        },
      ],
      recommendedAction:
        "RULE 10 FULL DISCLOSURE: Obtain written informed consent from Vanguard Infrastructure Ltd acknowledging chamber's active writ against KSEB.",
      waiverApplicable: true,
    },
    {
      scanId: "BCI-SCAN-2026-0701",
      timestamp: "20 Oct 2026, 11:00 IST",
      proposedClient: "Cochin Port Trust Workers Union",
      adverseParty: "Ministry of Ports & Shipping",
      subjectMatter: "Industrial Dispute & Pension Equalization",
      courtForum: "Central Government Industrial Tribunal (CGIT)",
      severity: "clear",
      severityTitle: "ZERO ADVERSE CONFLICT DETECTED — ETHICS CLEARANCE CERTIFIED",
      bciRuleCited: "BCI Rules Part VI, Section II (Rules 8–10 Compliant)",
      statutorySummary:
        "No prior representation, confidential disclosures, or pecuniary interests detected across chamber archives or corporate registers.",
      conflictingMatters: [],
      riskVectors: [
        {
          category: "Adverse Party Roster Check",
          description: "No match found across 420 active or concluded chamber dockets.",
          level: "low",
        },
      ],
      recommendedAction:
        "SAFE TO ACCEPT BRIEF: Issue Vakalathnama and execute statutory Advocate Welfare Fund stamping.",
      waiverApplicable: false,
    },
  ]);

  // Execute Conflict Scanner Simulation
  const handleExecuteScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setScanProgressStage("Querying Chamber Active Dockets & eCourts CNR Database...");

    setTimeout(() => {
      setScanProgressStage("Cross-referencing MCA Corporate Director DIN & Subsidiary Holdings...");
    }, 600);

    setTimeout(() => {
      setScanProgressStage("Auditing Bar Council of India Rule 8, 9, 10 Ethics Standards...");
    }, 1200);

    setTimeout(() => {
      setIsScanning(false);

      // Evaluate match condition
      const clientLower = proposedClient.toLowerCase();
      const adverseLower = adverseParty.toLowerCase();

      let result: ConflictCheckResult;

      if (adverseLower.includes("apex") || adverseLower.includes("logistics")) {
        result = {
          scanId: `BCI-SCAN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          proposedClient,
          adverseParty,
          subjectMatter,
          courtForum,
          severity: "critical",
          severityTitle: "CRITICAL CONFLICT DETECTED — MANDATORY BCI RULE 8 BAR",
          bciRuleCited: "Bar Council of India Rules Part VI, Chapter II, Section II, Rule 8",
          statutorySummary: `Advocate currently acts as Senior Counsel on record for Apex Logistics Ltd in active commercial dispute ARB/NCLT/KOCHI/2024/041. Appearing against Apex Logistics Ltd for ${proposedClient} represents a direct breach of Rule 8 and invites disciplinary proceedings under Section 35 of the Advocates Act, 1961.`,
          conflictingMatters: [
            {
              caseNumber: "ARB/NCLT/KOCHI/2024/041",
              partyRole: "Petitioner (Active Chamber Retainer)",
              courtName: "NCLT Kochi Bench",
              year: "2024-Present",
              activeStatus: "Active Roster",
              chamberRole: "Senior Counsel on Record",
            },
          ],
          riskVectors: [
            {
              category: "Rule 8 Direct Adversarial Bar",
              description: "Advocate has advised and drawn pleadings for Apex Logistics Ltd in commercial proceedings.",
              level: "high",
            },
            {
              category: "Fiduciary Confidentiality Breach",
              description: "Chamber has privileged corporate disclosures, bank audits, and dispute strategies on file.",
              level: "high",
            },
            {
              category: "Corporate Veil Cross-Holding",
              description: `Subsidiary '${promotersOrSubsidiaries}' shares common managing directors with active client.`,
              level: "high",
            },
          ],
          recommendedAction:
            "MANDATORY REFUSAL OF BRIEF: Advocate must immediately refuse to act, appear, or plead for Marine Exports Pvt Ltd. Issue formal Non-Engagement Notice.",
          waiverApplicable: false,
        };
      } else if (adverseLower.includes("kseb") || adverseLower.includes("electricity")) {
        result = {
          scanId: `BCI-SCAN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          proposedClient,
          adverseParty,
          subjectMatter,
          courtForum,
          severity: "warning",
          severityTitle: "POTENTIAL CONFLICT DETECTED — RULE 10 MANDATORY DISCLOSURE",
          bciRuleCited: "Bar Council of India Rules Part VI, Chapter II, Section II, Rule 10",
          statutorySummary: `Chamber currently represents Gopakumar Nambiar against KSEB in WP(C) 19482/2024. While the chamber is not representing KSEB, Section 10 Telegraph Act principles are simultaneously being argued in Division Bench 2A. Full disclosure to ${proposedClient} is mandatory prior to brief acceptance.`,
          conflictingMatters: [
            {
              caseNumber: "WP(C) 19482/2024",
              partyRole: "Petitioner vs KSEB",
              courtName: "High Court of Kerala (Court Hall 2A)",
              year: "2024",
              activeStatus: "Active Roster",
              chamberRole: "Counsel on Record",
            },
          ],
          riskVectors: [
            {
              category: "Jurisprudential Position Alignment",
              description: "Chamber has argued against KSEB's line drawing routes under Section 16(1).",
              level: "medium",
            },
          ],
          recommendedAction:
            "OBTAIN WRITTEN WAIVER: Issue BCI Rule 10 Written Disclosure and obtain countersigned client consent.",
          waiverApplicable: true,
        };
      } else {
        result = {
          scanId: `BCI-SCAN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          proposedClient,
          adverseParty,
          subjectMatter,
          courtForum,
          severity: "clear",
          severityTitle: "ZERO ADVERSE CONFLICT DETECTED — ETHICS CLEARANCE CERTIFIED",
          bciRuleCited: "BCI Rules Part VI, Section II (Rules 8, 9, 10 Compliant)",
          statutorySummary: `Exhaustive audit across 420 active and concluded chamber files, CNR numbers, and corporate databases reveals zero conflict of interest, prior advisory, or pecuniary connection with ${adverseParty}.`,
          conflictingMatters: [],
          riskVectors: [
            {
              category: "Chamber Roster Search",
              description: "No match for opposing party in 5-year retrospective archive.",
              level: "low",
            },
            {
              category: "Associate Independence Check",
              description: "All chamber associates certified free of prior employment or representation with adverse party.",
              level: "low",
            },
          ],
          recommendedAction:
            "SAFE TO ACCEPT BRIEF: Issue Vakalathnama, execute statutory Welfare Fund Stamping, and register matter.",
          waiverApplicable: false,
        };
      }

      setScanResult(result);
      setAuditLogs([result, ...auditLogs]);
      showToast("Bar Council conflict audit complete.");
    }, 1800);
  };

  // Preset Scenario Loaders
  const loadScenarioA = () => {
    setProposedClient("Marine Exports Pvt Ltd");
    setAdverseParty("Apex Logistics Ltd");
    setPromotersOrSubsidiaries("Apex Maritime Cargo & Cold Storage Division");
    setSubjectMatter("Commercial Breach of Contract & Asset Attachment (S.9)");
    setCourtForum("NCLT Kochi Bench");
  };

  const loadScenarioB = () => {
    setProposedClient("Vanguard Infrastructure Ltd");
    setAdverseParty("Kerala State Electricity Board (KSEB)");
    setPromotersOrSubsidiaries("Chief Engineer Transmission Circle");
    setSubjectMatter("Substation Line Drawing Injunction (Section 10 Telegraph Act)");
    setCourtForum("High Court of Kerala (Court Hall 2A)");
  };

  const loadScenarioC = () => {
    setProposedClient("Cochin Port Trust Workers Union");
    setAdverseParty("Ministry of Ports & Shipping");
    setPromotersOrSubsidiaries("Major Port Authorities Board");
    setSubjectMatter("Industrial Tribunal Wage Revision Dispute");
    setCourtForum("Central Government Industrial Tribunal (CGIT)");
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
      {/* 1. TOP HEADER & BCI STATUTORY ETHICS BANNER                    */}
      {/* ============================================================== */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B1728]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                Professional Ethics &amp; Conduct • Milestone 6
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a8] border border-[#6B1728]/30">
                BCI Rules Pt. VI, Ch. II, R. 8–10
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-[10px] font-mono text-zinc-400">Roll: {barCouncilNumber}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white flex items-center gap-2.5">
              <span>Bar Council Adverse Party Conflict &amp; Ethics Scanner</span>
            </h2>

            <p className="text-xs text-zinc-500 max-w-3xl">
              Automated statutory conflict-of-interest audit engine under the Advocates Act, 1961. Cross-checks proposed
              clients and adverse parties against active chamber dockets, prior representation history, corporate subsidiary
              cross-holdings, and witness lists to prevent professional misconduct sanctions under Section 35.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
            <button
              onClick={() => setActiveTab("audit-log")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>Chamber Audit Log ({auditLogs.length})</span>
            </button>
          </div>
        </div>

        {/* 3 Statutory Rules Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-900 text-xs">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#6B1728] dark:text-[#ff94a8] block">
              BCI Rule 8: Adverse Party Bar
            </span>
            <div className="font-bold text-black dark:text-white">Strict Non-Adversarial Representation</div>
            <p className="text-[11px] text-zinc-500">
              An advocate who has advised, drawn pleadings, or acted for a party shall never appear or plead for the opposite party.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-zinc-600 dark:text-zinc-400 block">
              BCI Rule 9: Witness Disqualification
            </span>
            <div className="font-bold text-black dark:text-white">Material Witness Prohibition</div>
            <p className="text-[11px] text-zinc-500">
              An advocate should not accept a brief or appear in any matter where they have reason to believe they will be called as a witness.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-zinc-600 dark:text-zinc-400 block">
              BCI Rule 10: Full Client Disclosure
            </span>
            <div className="font-bold text-black dark:text-white">Mandatory Fiduciary Disclosure</div>
            <p className="text-[11px] text-zinc-500">
              Advocate must make full and frank disclosure to client of any prior connections, interest, or representation with parties.
            </p>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "scanner"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Search className="w-3.5 h-3.5 text-[#6B1728]" />
            <span>Interactive Conflict Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab("audit-log")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "audit-log"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Clearance Audit Trail</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
              {auditLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ethical-wall")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "ethical-wall"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Chamber Ethical Screens (Chinese Wall)</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TAB: INTERACTIVE CONFLICT SCANNER CONSOLE                   */}
      {/* ============================================================== */}
      {activeTab === "scanner" && (
        <div className="space-y-6">
          {/* Quick Scenario Loader Pills */}
          <div className="p-4 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="font-bold text-black dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#6B1728]" />
              Quick Test Scenarios:
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={loadScenarioA}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-[11px] font-semibold text-black dark:text-white cursor-pointer"
              >
                🔴 Scenario A: Direct Opposing Client (Rule 8 Bar)
              </button>

              <button
                onClick={loadScenarioB}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-[11px] font-semibold text-black dark:text-white cursor-pointer"
              >
                🟠 Scenario B: Common Counter-Party (Rule 10 Waiver)
              </button>

              <button
                onClick={loadScenarioC}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-[11px] font-semibold text-black dark:text-white cursor-pointer"
              >
                🟢 Scenario C: Clean Representation (Zero Conflict)
              </button>
            </div>
          </div>

          {/* Conflict Input Form */}
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-black dark:text-white">
                Client Intake Conflict Audit Form
              </h3>
              <p className="text-xs text-zinc-500">
                Enter proposed representation details to cross-reference against chamber roster, adverse party databases, and former retainers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">
                  Proposed Client / Retainer Entity:
                </label>
                <input
                  type="text"
                  value={proposedClient}
                  onChange={(e) => setProposedClient(e.target.value)}
                  placeholder="e.g. Marine Exports Pvt Ltd"
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">
                  Adverse / Opposing Party Name(s):
                </label>
                <input
                  type="text"
                  value={adverseParty}
                  onChange={(e) => setAdverseParty(e.target.value)}
                  placeholder="e.g. Apex Logistics Ltd"
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">
                  Opposing Promoters / Subsidiaries / Guarantors:
                </label>
                <input
                  type="text"
                  value={promotersOrSubsidiaries}
                  onChange={(e) => setPromotersOrSubsidiaries(e.target.value)}
                  placeholder="e.g. Apex Maritime Cargo & Cold Storage Division"
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">
                  Subject Matter &amp; Dispute Description:
                </label>
                <input
                  type="text"
                  value={subjectMatter}
                  onChange={(e) => setSubjectMatter(e.target.value)}
                  placeholder="e.g. Commercial Breach of Contract & Asset Attachment"
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">
                  Target Court / Tribunal Forum:
                </label>
                <select
                  value={courtForum}
                  onChange={(e) => setCourtForum(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="High Court of Kerala (Commercial Appellate Division)">High Court of Kerala (Commercial Appellate Division)</option>
                  <option value="High Court of Kerala (Writ Jurisdiction DB 2A)">High Court of Kerala (Writ Jurisdiction DB 2A)</option>
                  <option value="NCLT Kochi Bench">NCLT Kochi Bench</option>
                  <option value="Sessions Court / JFCM-II Ernakulam">Sessions Court / JFCM-II Ernakulam</option>
                  <option value="Arbitral Tribunal (Kochi / Kakkanad)">Arbitral Tribunal (Kochi / Kakkanad)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">
                  Audit Search Depth:
                </label>
                <select
                  value={scanDepth}
                  onChange={(e) => setScanDepth(e.target.value as any)}
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="deep">Deep Forensic (Subsidiaries, Former Partners &amp; 5-Year CNR Archive)</option>
                  <option value="standard">Standard (Direct Chamber Roster &amp; Active Dockets)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
              <button
                onClick={handleExecuteScan}
                disabled={isScanning}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#6B1728] text-white hover:bg-[#7A1B2E] transition font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Audit...</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-4 h-4" />
                    <span>Execute BCI Rule 8 Conflict Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Scanning Progress Bar */}
          {isScanning && (
            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-black dark:text-white flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#6B1728]" />
                  {scanProgressStage}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Scanning 420 Dockets...</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-[#6B1728] animate-pulse" />
              </div>
            </div>
          )}

          {/* Scan Results Panel */}
          {scanResult && !isScanning && (
            <div
              className={`p-6 md:p-8 rounded-3xl bg-white dark:bg-black border shadow-lg space-y-6 animate-in fade-in zoom-in-95 ${
                scanResult.severity === "critical"
                  ? "border-[#6B1728] dark:border-[#7A1B2E] ring-1 ring-[#6B1728]/30"
                  : scanResult.severity === "warning"
                  ? "border-zinc-400 dark:border-zinc-600"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              {/* Header Status Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-900">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {scanResult.severity === "critical" && (
                      <XCircle className="w-5 h-5 text-[#6B1728]" />
                    )}
                    {scanResult.severity === "warning" && (
                      <AlertTriangle className="w-5 h-5 text-black dark:text-white" />
                    )}
                    {scanResult.severity === "clear" && (
                      <CheckCircle2 className="w-5 h-5 text-black dark:text-white" />
                    )}
                    <h3 className="font-black text-base text-black dark:text-white tracking-tight">
                      {scanResult.severityTitle}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#6B1728] dark:text-[#ff94a8] block">
                    Statute: {scanResult.bciRuleCited}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-zinc-400">ID: {scanResult.scanId}</span>
                </div>
              </div>

              {/* Statutory Summary Box */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                <span className="font-bold text-black dark:text-white block uppercase tracking-wider text-[10px]">
                  Judicial &amp; Ethical Determination:
                </span>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  {scanResult.statutorySummary}
                </p>
              </div>

              {/* Conflicting Matters Roster (if any) */}
              {scanResult.conflictingMatters.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-black dark:text-white block uppercase tracking-wider">
                    Chamber Cross-Matches ({scanResult.conflictingMatters.length} Conflicting Dockets)
                  </span>

                  <div className="space-y-2">
                    {scanResult.conflictingMatters.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#6B1728]/10 dark:bg-[#6B1728]/20 border border-[#6B1728]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-black dark:text-white text-sm">
                            {m.caseNumber}
                          </span>
                          <p className="text-zinc-600 dark:text-zinc-300">
                            {m.courtName} • {m.partyRole}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6B1728] text-white">
                            {m.chamberRole}
                          </span>
                          <span className="text-[10px] text-zinc-400 block mt-1">{m.activeStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Vectors */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-black dark:text-white block uppercase tracking-wider">
                  Risk Vector Breakdown:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {scanResult.riskVectors.map((r, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-black dark:text-white">{r.category}</strong>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[9px] font-bold uppercase ${
                            r.level === "high"
                              ? "bg-[#6B1728] text-white"
                              : "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white"
                          }`}
                        >
                          {r.level} Risk
                        </span>
                      </div>
                      <p className="text-zinc-500 text-[11px] leading-relaxed">{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Action & Action Trigger Buttons */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1 max-w-xl">
                  <span className="font-bold text-black dark:text-white uppercase tracking-wider text-[10px] block">
                    Statutory Recommended Next Step:
                  </span>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                    {scanResult.recommendedAction}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {scanResult.severity === "critical" && (
                    <button
                      onClick={() => setShowDeclineLetterModal(true)}
                      className="px-4 py-2 rounded-xl bg-[#6B1728] text-white hover:bg-[#7A1B2E] font-bold text-xs transition cursor-pointer"
                    >
                      Draft Rule 8 Non-Engagement Notice
                    </button>
                  )}

                  {scanResult.severity === "warning" && (
                    <button
                      onClick={() => setShowWaiverModal(true)}
                      className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 transition cursor-pointer"
                    >
                      Draft Rule 10 Conflict Waiver
                    </button>
                  )}

                  {scanResult.severity === "clear" && (
                    <button
                      onClick={() => setShowCertificateModal(true)}
                      className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Generate BCI Clearance Certificate</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. TAB: CHAMBER CLEARANCE AUDIT LOG                            */}
      {/* ============================================================== */}
      {activeTab === "audit-log" && (
        <div className="space-y-5">
          <div className="rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white">
                  Chamber Conflict Screening Register
                </h3>
                <p className="text-xs text-zinc-500">
                  Immutable statutory audit record of all client intake checks
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export Register</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Scan Ref &amp; Time</th>
                    <th className="py-3 px-4">Proposed Client</th>
                    <th className="py-3 px-4">Adverse Party</th>
                    <th className="py-3 px-4">Forum &amp; Subject</th>
                    <th className="py-3 px-4 text-center">Determination</th>
                    <th className="py-3 px-4 text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {auditLogs.map((log) => (
                    <tr key={log.scanId} className="hover:bg-zinc-50 dark:hover:bg-zinc-950 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-black dark:text-white block">
                          {log.scanId}
                        </span>
                        <span className="text-[10px] text-zinc-400">{log.timestamp}</span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-black dark:text-white">
                        {log.proposedClient}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                        {log.adverseParty}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-500">
                        <span className="block truncate max-w-xs">{log.subjectMatter}</span>
                        <span className="text-[10px] text-zinc-400">{log.courtForum}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {log.severity === "critical" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a8] border border-[#6B1728]/30">
                            Rule 8 Barred
                          </span>
                        )}
                        {log.severity === "warning" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white">
                            Waiver Required
                          </span>
                        )}
                        {log.severity === "clear" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black text-white dark:bg-white dark:text-black">
                            Cleared
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setScanResult(log);
                            setShowCertificateModal(true);
                          }}
                          className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white underline cursor-pointer"
                        >
                          View Docket Stamp
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

      {/* ============================================================== */}
      {/* 4. TAB: CHINESE WALL & ETHICAL SCREEN BUILDER                  */}
      {/* ============================================================== */}
      {activeTab === "ethical-wall" && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#6B1728]" />
                <h3 className="text-base font-bold text-black dark:text-white">
                  Chamber Ethical Screen &amp; Information Barrier Protocol
                </h3>
              </div>
              <p className="text-xs text-zinc-500 max-w-3xl">
                When a chamber associate has a prior employment or educational connection with an adverse party,
                statutory standards allow the firm to proceed only upon establishing an impermeable information barrier
                excluding that associate from files, communications, and fee shares.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-black dark:text-white block">Screened Junior Associate:</span>
                <div className="font-mono text-zinc-700 dark:text-zinc-300">Adv. Rahul Deshmukh</div>
                <p className="text-[11px] text-zinc-500">
                  Prior clerkship at opposing law firm. Disqualified from all dockets involving KSEB contracting disputes.
                </p>
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#6B1728] text-white">
                  Access Revoked
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-black dark:text-white block">Protected Case Vault:</span>
                <div className="font-mono text-zinc-700 dark:text-zinc-300">WP(C) 19482/2024 Bundle</div>
                <p className="text-[11px] text-zinc-500">
                  256-bit encrypted partition with hardware security key required. Audit log tracks all read queries.
                </p>
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                  Encrypted Partition
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-black dark:text-white block">Fee Carve-Out Protocol:</span>
                <div className="font-mono text-zinc-700 dark:text-zinc-300">Statutory Fee Exclusion</div>
                <p className="text-[11px] text-zinc-500">
                  Disqualified associate receives zero profit share or billing percentage from the walled matter.
                </p>
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                  Certified Compliant
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => showToast("Chamber Chinese Wall protocol memorandum generated.")}
                className="px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 transition cursor-pointer"
              >
                Generate Ethical Screen Memo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODAL: RULE 8 FORMAL DECLINE / NON-ENGAGEMENT LETTER        */}
      {/* ============================================================== */}
      {showDeclineLetterModal && scanResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-[#6B1728] uppercase tracking-wider block">
                  Mandatory Professional Declination Notice
                </span>
                <h3 className="text-base font-bold text-black dark:text-white">
                  BCI Rule 8 Non-Engagement Letter
                </h3>
              </div>
              <button
                onClick={() => setShowDeclineLetterModal(false)}
                className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-5 overflow-y-auto text-xs max-h-[75vh]">
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 font-serif leading-relaxed text-zinc-800 dark:text-zinc-200">
                <div className="text-center pb-3 border-b border-zinc-200 dark:border-zinc-800 font-sans">
                  <h4 className="font-bold text-black dark:text-white text-sm uppercase">CHAMBERS OF {advocateName}</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">Advocate, High Court of Kerala • Roll: {barCouncilNumber}</span>
                </div>

                <p>
                  To,<br />
                  The Authorized Representative / Managing Director<br />
                  <strong>{scanResult.proposedClient}</strong>
                </p>

                <p>
                  <strong>Subject: Non-Engagement Notice pursuant to Bar Council of India Rules Part VI, Chapter II, Rule 8</strong>
                </p>

                <p>Dear Sir/Madam,</p>

                <p>
                  We refer to your inquiry regarding representation in the matter of <em>{scanResult.subjectMatter}</em> against <strong>{scanResult.adverseParty}</strong> before the Hon&apos;ble {scanResult.courtForum}.
                </p>

                <p>
                  Please be formally advised that upon conducting our mandatory statutory conflict-of-interest audit, our chamber
                  has identified an existing and active professional engagement on behalf of {scanResult.adverseParty}. Under
                  <strong> Rule 8 of the Bar Council of India Rules (Standards of Professional Conduct)</strong>, an advocate
                  who has acted, advised, or drawn pleadings for a party is statutorily prohibited from acting, appearing, or
                  pleading for the opposite party.
                </p>

                <p>
                  Consequently, to uphold statutory professional ethics and avoid conflict of interest under Section 35 of the
                  Advocates Act, 1961, our chamber cannot accept your brief in this matter. We recommend that you engage alternate
                  independent counsel. No confidential information submitted by you has been or will be disclosed.
                </p>

                <div className="pt-4 font-sans text-xs">
                  <p>Yours faithfully,</p>
                  <strong className="block mt-1 text-black dark:text-white">{advocateName}</strong>
                  <span className="text-[10px] text-zinc-500 font-mono">Advocate on Record ({barCouncilNumber})</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 font-sans">
                <button
                  onClick={() => setShowDeclineLetterModal(false)}
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                    setShowDeclineLetterModal(false);
                    showToast("Decline letter sent to print spooler.");
                  }}
                  className="px-5 py-2 rounded-full bg-[#6B1728] text-white hover:bg-[#7A1B2E] text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print &amp; Dispatch Decline Letter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODAL: RULE 10 CONFLICT DISCLOSURE & WAIVER AGREEMENT       */}
      {/* ============================================================== */}
      {showWaiverModal && scanResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  BCI Rule 10 Compliance Instrument
                </span>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Conflict Disclosure &amp; Informed Written Consent Waiver
                </h3>
              </div>
              <button
                onClick={() => setShowWaiverModal(false)}
                className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 leading-relaxed">
                <span className="font-bold text-black dark:text-white block uppercase tracking-wider text-[10px]">
                  Fiduciary Disclosure Statement:
                </span>
                <p className="text-zinc-700 dark:text-zinc-300">
                  I, <strong>{advocateName}</strong>, Advocate on Record (Roll No: {barCouncilNumber}), hereby make full and
                  frank disclosure to <strong>{scanResult.proposedClient}</strong> under Rule 10 of the Bar Council of India
                  Rules that our chamber maintains ongoing legal representations involving {scanResult.adverseParty} in
                  unrelated statutory challenges.
                </p>

                <p className="text-zinc-700 dark:text-zinc-300">
                  Having audited the files, the chamber certifies that no confidential communications, trade secrets, or
                  substantive cross-disclosures exist between the matters, and independent counsel boundaries are strictly
                  enforced.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-black dark:text-white block">Client Acceptance &amp; Consent:</span>
                <p className="text-zinc-600 dark:text-zinc-400 text-[11px]">
                  By countersigning below, the client acknowledges the disclosure, waives objection under Rule 10, and
                  authorizes {advocateName} to execute the Vakalathnama.
                </p>
                <div className="pt-4 grid grid-cols-2 gap-4">
                  <div className="border-t border-dashed border-zinc-400 pt-2 text-center text-[10px] text-zinc-500">
                    Advocate Signature
                  </div>
                  <div className="border-t border-dashed border-zinc-400 pt-2 text-center text-[10px] text-zinc-500">
                    Client Authorized Signatory
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setShowWaiverModal(false)}
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowWaiverModal(false);
                    showToast("Rule 10 Conflict Waiver agreement recorded and cleared.");
                  }}
                  className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 transition cursor-pointer"
                >
                  Execute &amp; Record Waiver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODAL: CERTIFIED BCI ETHICS CLEARANCE CERTIFICATE           */}
      {/* ============================================================== */}
      {showCertificateModal && scanResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Official Docket Filing Attachment
                </span>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Bar Council Ethics Clearance Certificate
                </h3>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 space-y-5 text-center">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold block">
                    BAR COUNCIL OF INDIA (STANDARDS OF CONDUCT)
                  </span>
                  <h4 className="text-lg font-black text-black dark:text-white tracking-tight">
                    CERTIFICATE OF ETHICS &amp; CONFLICT CLEARANCE
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-400 block">
                    Ref ID: {scanResult.scanId} • Date: {scanResult.timestamp}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-left space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Proposed Client:</span>
                    <strong className="text-black dark:text-white">{scanResult.proposedClient}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Adverse Party:</span>
                    <strong className="text-black dark:text-white">{scanResult.adverseParty}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Forum / Tribunal:</span>
                    <strong className="text-black dark:text-white">{scanResult.courtForum}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 italic text-left leading-relaxed">
                  &ldquo;This is to certify that a comprehensive adverse party search and ethics audit has been performed under
                  Part VI, Chapter II, Rules 8 to 10 of the Bar Council of India Rules. The proposed representation is confirmed
                  free of statutory conflict, prior opposing representation, or material witness disqualification.&rdquo;
                </p>

                <div className="pt-4 flex items-end justify-between text-left text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 block font-mono">Certified By:</span>
                    <strong className="text-black dark:text-white block">{advocateName}</strong>
                    <span className="text-[10px] font-mono text-zinc-500">Enrollment: {barCouncilNumber}</span>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-[#6B1728] text-white">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      BCI Validated
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                    setShowCertificateModal(false);
                    showToast("Clearance certificate sent to print spooler.");
                  }}
                  className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvocateConflictScannerView;
