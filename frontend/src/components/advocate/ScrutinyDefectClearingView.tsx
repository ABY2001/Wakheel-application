"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Upload,
  Download,
  Copy,
  Check,
  Printer,
  ChevronRight,
  X,
  FileCheck2,
  Building,
  Scale,
  Shield,
  Eye,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Send,
  Calendar,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export type DefectStatus = "pending" | "cured" | "waived";
export type DocketStage =
  | "under_scrutiny"
  | "defects_notified"
  | "defects_cured"
  | "numbered_listed";

export interface ScrutinyDefect {
  id: string;
  code: string;
  category: "indexing" | "court_fee" | "translation" | "service" | "affidavit" | "vakalath";
  ruleReference: string;
  objectionText: string;
  actionRequired: string;
  severity: "high" | "medium" | "low";
  status: DefectStatus;
  curedAt?: string;
  curedRemarks?: string;
  replacementFileName?: string;
}

export interface EFilingDocket {
  id: string;
  filingToken: string;
  court: string;
  bench: string;
  matterTitle: string;
  caseType: string;
  caseYear: string;
  stage: DocketStage;
  stageLabel: string;
  petitionerName: string;
  respondentName: string;
  advocateName: string;
  barCouncilNumber: string;
  standingCounselName: string;
  sectionOfficer: string;
  scrutinyDivision: string;
  efilingDate: string;
  defectNotifiedDate?: string;
  statutoryCureDeadline?: string;
  daysRemaining?: number;
  courtHall?: string;
  itemNumber?: string;
  listingDate?: string;
  defects: ScrutinyDefect[];
}

const INITIAL_DOCKETS: EFilingDocket[] = [
  {
    id: "dkt-01",
    filingToken: "EF-KLHC-2026-0049182",
    court: "High Court of Kerala at Ernakulam",
    bench: "Hon'ble Division Bench 2A (Hon'ble Mr. Justice P.B. Suresh Kumar & Hon'ble Mr. Justice C. Pratheep Kumar)",
    matterTitle: "WP(C) 19482/2024 — Gopakumar Nambiar v. KSEB & Anr.",
    caseType: "Writ Petition (Civil) - WP(C)",
    caseYear: "2026",
    stage: "defects_notified",
    stageLabel: "Defects Notified (Action Required)",
    petitionerName: "Gopakumar Nambiar",
    respondentName: "Kerala State Electricity Board Ltd. & Anr.",
    advocateName: "Adv. Meera Krishnan",
    barCouncilNumber: "K/1429/2016",
    standingCounselName: "Adv. Standing Counsel for KSEB",
    sectionOfficer: "Sri. V. Santhosh Kumar (Section Officer)",
    scrutinyDivision: "Judicial Scrutiny Branch (Writs Section)",
    efilingDate: "21 Oct 2026",
    defectNotifiedDate: "24 Oct 2026",
    statutoryCureDeadline: "31 Oct 2026 (5:00 PM)",
    daysRemaining: 3,
    courtHall: "Court Hall 2A",
    itemNumber: "Item No. 18 (Motion List)",
    listingDate: "Tomorrow, 29 Oct 2026",
    defects: [
      {
        id: "def-01",
        code: "D-101",
        category: "indexing",
        ruleReference: "Rule 14(2) Kerala High Court Rules",
        objectionText:
          "Annexure P-4 Survey sketch pages 14 to 18 not consecutively machine-numbered; handwritten folio numbers obscured by margin fold.",
        actionRequired:
          "Upload consecutively re-paginated PDF of Annexure P-4 with clear top-right folios.",
        severity: "high",
        status: "pending",
      },
      {
        id: "def-02",
        code: "D-302",
        category: "translation",
        ruleReference: "Rule 32 Kerala High Court Rules (True Translation)",
        objectionText:
          "Annexure P-2 Revenue tax receipt and Mahazar are in vernacular Malayalam. Formal Rule 32 Advocate True Translation Certificate missing.",
        actionRequired:
          "Affix Rule 32 Advocate True Translation Certificate signed by counsel with enrollment number.",
        severity: "high",
        status: "pending",
      },
      {
        id: "def-03",
        code: "D-405",
        category: "service",
        ruleReference: "Rule 35(1) Advance Service on Standing Counsel",
        objectionText:
          "Proof of advance service of motion paperbook on Standing Counsel for KSEB not annexed in the digital service memo.",
        actionRequired:
          "Attach physical acknowledgment stamp slip or official e-Service delivery token.",
        severity: "medium",
        status: "cured",
        curedAt: "26 Oct 2026, 04:30 PM",
        curedRemarks:
          "Service acknowledgment receipt #KSEB-SC-4482 signed by Standing Counsel clerk annexed.",
        replacementFileName: "KSEB_Standing_Counsel_Service_Proof_Ack.pdf",
      },
    ],
  },
  {
    id: "dkt-02",
    filingToken: "EF-KLHC-2026-0051204",
    court: "High Court of Kerala at Ernakulam",
    bench: "Single Bench Criminal (Hon'ble Mr. Justice C.S. Dias)",
    matterTitle: "Bail Appl. 8920/2026 — Shafeeq Rahman v. State of Kerala",
    caseType: "Bail Application - Section 483 BNSS",
    caseYear: "2026",
    stage: "defects_cured",
    stageLabel: "Defects Cured / Ready for Re-Presentation",
    petitionerName: "Shafeeq Rahman",
    respondentName: "State of Kerala (Represented by Sub Inspector of Police, Aluva)",
    advocateName: "Adv. Meera Krishnan",
    barCouncilNumber: "K/1429/2016",
    standingCounselName: "Public Prosecutor (High Court of Kerala)",
    sectionOfficer: "Smt. Bindu Menon (Section Officer)",
    scrutinyDivision: "Criminal Scrutiny Branch",
    efilingDate: "24 Oct 2026",
    defectNotifiedDate: "26 Oct 2026",
    statutoryCureDeadline: "02 Nov 2026 (5:00 PM)",
    daysRemaining: 5,
    courtHall: "Court Hall 3B",
    itemNumber: "Item No. 42",
    listingDate: "30 Oct 2026",
    defects: [
      {
        id: "def-04",
        code: "D-204",
        category: "court_fee",
        ruleReference: "Kerala Court Fees & Suits Valuation Act (Schedule II, Art 13)",
        objectionText:
          "Shortage of Rs. 50 Court Fee adhesive stamp on petition; Advocate Welfare Fund stamp of Rs. 25 missing on Vakalathnama.",
        actionRequired:
          "Pay differential e-Court fee and annex e-Challan payment receipt.",
        severity: "high",
        status: "cured",
        curedAt: "27 Oct 2026, 11:15 AM",
        curedRemarks:
          "Government treasury e-Challan KL-TR-2026-90412 for Rs. 75 successfully paid and annexed.",
        replacementFileName: "Treasury_eChallan_CourtFee_KL90412.pdf",
      },
      {
        id: "def-05",
        code: "D-508",
        category: "affidavit",
        ruleReference: "Oaths Act 1969 & Criminal Rules of Practice Rule 24",
        objectionText:
          "Deponent verification affidavit omitted notary registration serial number and commission expiry date.",
        actionRequired:
          "Submit verified re-attestation by Notary Public with serial folio number.",
        severity: "medium",
        status: "cured",
        curedAt: "27 Oct 2026, 02:45 PM",
        curedRemarks:
          "Re-attested verification affidavit with Notary Adv. K.R. Joseph (Reg No. 142/2018) uploaded.",
        replacementFileName: "Re_Attested_Verification_Affidavit_Notary.pdf",
      },
    ],
  },
  {
    id: "dkt-03",
    filingToken: "EF-NCLT-2026-001094",
    court: "National Company Law Tribunal (Kochi Bench)",
    bench: "Court Hall 1 (Hon'ble Judicial Member & Hon'ble Technical Member)",
    matterTitle: "ARB/NCLT/KOCHI/2024/041 — Malabar Marine Products v. Coastal Logistics",
    caseType: "Section 9 Commercial Arbitration Application",
    caseYear: "2026",
    stage: "numbered_listed",
    stageLabel: "Numbered & Registered (Scrutiny Cleared)",
    petitionerName: "Malabar Marine Products Ltd.",
    respondentName: "Coastal Logistics Infrastructure Pvt. Ltd.",
    advocateName: "Adv. Meera Krishnan",
    barCouncilNumber: "K/1429/2016",
    standingCounselName: "Adv. Rajesh V. Varma (Counsel for Respondent)",
    sectionOfficer: "Registrar (Judicial) NCLT",
    scrutinyDivision: "Registry Scrutiny Cell",
    efilingDate: "15 Oct 2026",
    defectNotifiedDate: "18 Oct 2026",
    statutoryCureDeadline: "25 Oct 2026",
    daysRemaining: 0,
    courtHall: "NCLT Hall 1",
    itemNumber: "Item No. 07",
    listingDate: "18 Nov 2026",
    defects: [
      {
        id: "def-06",
        code: "D-612",
        category: "vakalath",
        ruleReference: "NCLT Rules 2016 Rule 26 (Representation)",
        objectionText:
          "Corporate Board Resolution authorizing signatory was dated prior to the incorporation of the petitioner's subsidiary.",
        actionRequired:
          "Produce certified true extract of Board Resolution passed pursuant to Section 179 Companies Act.",
        severity: "high",
        status: "cured",
        curedAt: "20 Oct 2026, 05:00 PM",
        curedRemarks:
          "Fresh Board Resolution dated 14 Oct 2026 signed by Managing Director filed and scrutinized.",
        replacementFileName: "Certified_Board_Resolution_14Oct2026.pdf",
      },
    ],
  },
  {
    id: "dkt-04",
    filingToken: "EF-KLHC-2026-0052811",
    court: "High Court of Kerala at Ernakulam",
    bench: "Single Bench Criminal (Hon'ble Mr. Justice Bechu Kurian Thomas)",
    matterTitle: "Crl.M.C. 3192/2026 — Ananthu Krishnan v. State of Kerala",
    caseType: "Section 528 BNSS (FIR Quashing)",
    caseYear: "2026",
    stage: "under_scrutiny",
    stageLabel: "Under Primary Scrutiny",
    petitionerName: "Ananthu Krishnan & Anr.",
    respondentName: "State of Kerala & Defacto Complainant",
    advocateName: "Adv. Meera Krishnan",
    barCouncilNumber: "K/1429/2016",
    standingCounselName: "Senior Public Prosecutor",
    sectionOfficer: "Sri. K.P. Haridas (Junior Scrutiny Officer)",
    scrutinyDivision: "Filing Scrutiny Branch 3",
    efilingDate: "27 Oct 2026",
    statutoryCureDeadline: "03 Nov 2026",
    daysRemaining: 6,
    defects: [],
  },
];

interface ScrutinyDefectClearingViewProps {
  token?: string;
  advocateName?: string;
  barCouncilNumber?: string;
}

export const ScrutinyDefectClearingView: React.FC<ScrutinyDefectClearingViewProps> = ({
  token = "advocate_token",
  advocateName = "Adv. Meera Krishnan",
  barCouncilNumber = "K/1429/2016",
}) => {
  const [dockets, setDockets] = useState<EFilingDocket[]>(INITIAL_DOCKETS);
  const [selectedDocketId, setSelectedDocketId] = useState<string>(INITIAL_DOCKETS[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  // Modals
  const [activeDefectModal, setActiveDefectModal] = useState<ScrutinyDefect | null>(null);
  const [cureRemarksInput, setCureRemarksInput] = useState("");
  const [cureFileNameInput, setCureFileNameInput] = useState("");
  const [showMotionModal, setShowMotionModal] = useState(false);
  const [showRePresentModal, setShowRePresentModal] = useState(false);
  const [showNewDocketModal, setShowNewDocketModal] = useState(false);

  // Motion Slip Generator parameters
  const [motionCourtHall, setMotionCourtHall] = useState("Court Hall 2A");
  const [motionBench, setMotionBench] = useState(
    "Hon'ble Division Bench 2A (Hon'ble Mr. Justice P.B. Suresh Kumar & Hon'ble Mr. Justice C. Pratheep Kumar)"
  );
  const [motionDate, setMotionDate] = useState("Tomorrow, 29 October 2026");
  const [motionItemNo, setMotionItemNo] = useState("Item No. 18 (Urgent Admission)");
  const [motionUrgencyGrounds, setMotionUrgencyGrounds] = useState(
    "Imminent high-tension line drawing scheduled by respondents for 30 October 2026 across petitioner's agricultural holding. All scrutiny defects stand cured. Stay extension application requires immediate consideration to avert fait accompli."
  );
  const [motionPrayer, setMotionPrayer] = useState(
    "Humbly prayed that this Hon'ble Court may be pleased to grant urgent leave to move the motion slip and list the matter for hearing on interim relief today / tomorrow as Item No. 18."
  );
  const [copiedState, setCopiedState] = useState<string | null>(null);

  // New docket state
  const [newMatterTitle, setNewMatterTitle] = useState("");
  const [newCaseType, setNewCaseType] = useState("WP(C)");
  const [newPetitioner, setNewPetitioner] = useState("");
  const [newRespondent, setNewRespondent] = useState("");

  const activeDocket = useMemo(() => {
    return dockets.find((d) => d.id === selectedDocketId) || dockets[0];
  }, [dockets, selectedDocketId]);

  const filteredDockets = useMemo(() => {
    return dockets.filter((d) => {
      const matchStage =
        stageFilter === "all" ||
        (stageFilter === "pending" && d.stage === "defects_notified") ||
        (stageFilter === "cured" && d.stage === "defects_cured") ||
        (stageFilter === "scrutiny" && d.stage === "under_scrutiny") ||
        (stageFilter === "listed" && d.stage === "numbered_listed");

      const q = searchQuery.trim().toLowerCase();
      const matchQ =
        !q ||
        d.matterTitle.toLowerCase().includes(q) ||
        d.filingToken.toLowerCase().includes(q) ||
        d.caseType.toLowerCase().includes(q) ||
        d.petitionerName.toLowerCase().includes(q) ||
        d.respondentName.toLowerCase().includes(q);

      return matchStage && matchQ;
    });
  }, [dockets, stageFilter, searchQuery]);

  // Statistics
  const totalDocketsCount = dockets.length;
  const pendingDefectCount = dockets.reduce(
    (acc, d) => acc + d.defects.filter((def) => def.status === "pending").length,
    0
  );
  const curedReadyCount = dockets.filter((d) => d.stage === "defects_cured").length;
  const listedCount = dockets.filter((d) => d.stage === "numbered_listed").length;

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(key);
    setTimeout(() => setCopiedState(null), 2200);
  };

  const handleCureDefectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDefectModal || !activeDocket) return;

    setDockets((prev) =>
      prev.map((doc) => {
        if (doc.id !== activeDocket.id) return doc;
        const updatedDefects = doc.defects.map((def) => {
          if (def.id !== activeDefectModal.id) return def;
          return {
            ...def,
            status: "cured" as DefectStatus,
            curedAt: "Just now",
            curedRemarks: cureRemarksInput.trim() || "Defect cured as per High Court Rules specifications.",
            replacementFileName: cureFileNameInput.trim() || "Cured_Document_Signed.pdf",
          };
        });

        const allCured = updatedDefects.every((d) => d.status === "cured" || d.status === "waived");
        return {
          ...doc,
          defects: updatedDefects,
          stage: allCured ? "defects_cured" : doc.stage,
          stageLabel: allCured ? "Defects Cured / Ready for Re-Presentation" : doc.stageLabel,
        };
      })
    );

    setActiveDefectModal(null);
    setCureRemarksInput("");
    setCureFileNameInput("");
  };

  const handleCreateNewDocket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatterTitle.trim()) return;

    const newDoc: EFilingDocket = {
      id: `dkt-${Date.now()}`,
      filingToken: `EF-KLHC-2026-00${Math.floor(10000 + Math.random() * 90000)}`,
      court: "High Court of Kerala at Ernakulam",
      bench: "Single Bench / Court Hall 4",
      matterTitle: `${newMatterTitle.trim()} — ${newPetitioner || "Petitioner"} v. ${newRespondent || "Respondent"}`,
      caseType: newCaseType,
      caseYear: "2026",
      stage: "under_scrutiny",
      stageLabel: "Under Primary Scrutiny",
      petitionerName: newPetitioner || "Petitioner",
      respondentName: newRespondent || "Respondent",
      advocateName: advocateName,
      barCouncilNumber: barCouncilNumber,
      standingCounselName: "Government Pleader / Standing Counsel",
      sectionOfficer: "Registry Scrutiny Wing",
      scrutinyDivision: "Filing Scrutiny Division",
      efilingDate: "Today",
      statutoryCureDeadline: "07 Days from Scrutiny Notice",
      daysRemaining: 7,
      defects: [],
    };

    setDockets((prev) => [newDoc, ...prev]);
    setSelectedDocketId(newDoc.id);
    setShowNewDocketModal(false);
    setNewMatterTitle("");
    setNewPetitioner("");
    setNewRespondent("");
  };

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6B1728] animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
              Scrutiny Defect Clearing &amp; E-Filing Docket
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            High Court e-Filing 3.0 objection cure slips, statutory limitation tracking, and urgent motion memo generators
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMotionModal(true)}
            className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5 text-[#6B1728]" />
            <span>Generate Motion Slip</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRePresentModal(true)}
            className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-black dark:text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Re-Presentation Memo</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewDocketModal(true)}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            title="Add New E-Filing Docket"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Bar with Burgundy Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Active Dockets</span>
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-black dark:text-white font-mono">{totalDocketsCount}</div>
          <span className="text-[11px] text-zinc-500 block">e-Filing 3.0 Verified Registry</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#6B1728]" />
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B1728]">
              Pending Scrutiny Defects
            </span>
            <AlertTriangle className="w-4 h-4 text-[#6B1728]" />
          </div>
          <div className="text-2xl font-black text-black dark:text-white font-mono flex items-center gap-2">
            <span>{pendingDefectCount}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6B1728]/10 text-[#6B1728] dark:bg-[#6B1728]/25 dark:text-[#F3B8C2]">
              Action Required
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 block">Rule 41(2) Cure Limiting</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Cured &amp; Ready</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-black dark:text-white font-mono">{curedReadyCount}</div>
          <span className="text-[11px] text-zinc-500 block">Ready to Re-Present with Memo</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Numbered &amp; Listed</span>
            <Scale className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-black dark:text-white font-mono">{listedCount}</div>
          <span className="text-[11px] text-zinc-500 block">Assigned Court Hall &amp; Item No.</span>
        </div>
      </div>

      {/* Main Workspace Canvas: Two Columns (Left: Docket Selector, Right: Defect Inspection & Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dockets List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search & Filter Toolbar */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter dockets by token, party, or case..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-all font-sans"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1 text-[11px]">
              {[
                { id: "all", label: "All" },
                { id: "pending", label: "Defects Notified" },
                { id: "cured", label: "Cured" },
                { id: "listed", label: "Listed" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStageFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    stageFilter === f.id
                      ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dockets Cards List */}
          <div className="space-y-2.5">
            {filteredDockets.map((docket) => {
              const isSelected = docket.id === activeDocket?.id;
              const pendingCount = docket.defects.filter((d) => d.status === "pending").length;

              return (
                <div
                  key={docket.id}
                  onClick={() => setSelectedDocketId(docket.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "bg-white dark:bg-black border-black dark:border-white shadow-sm ring-1 ring-black dark:ring-white"
                      : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                  }`}
                >
                  {/* Left accent strip if defects pending */}
                  {pendingCount > 0 && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-sm bg-[#6B1728]" />
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase">
                        {docket.filingToken}
                      </span>
                      {pendingCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#6B1728]/10 text-[#6B1728] dark:bg-[#6B1728]/25 dark:text-[#F3B8C2]">
                          {pendingCount} Defect{pendingCount > 1 ? "s" : ""}
                        </span>
                      ) : docket.stage === "defects_cured" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Cured &amp; Ready
                        </span>
                      ) : docket.stage === "numbered_listed" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white">
                          Numbered
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800">
                          In Scrutiny
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-black dark:text-white leading-snug line-clamp-2">
                      {docket.matterTitle}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                    <span>{docket.caseType}</span>
                    <span className="font-mono text-[10px]">{docket.efilingDate}</span>
                  </div>
                </div>
              );
            })}

            {filteredDockets.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                No e-filing dockets match your search or filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Docket Scrutiny Inspection, Curing & Motion Details (8 Cols) */}
        {activeDocket && (
          <div className="lg:col-span-8 space-y-6">
            {/* Active Docket Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-5">
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md font-mono font-bold text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                      {activeDocket.filingToken}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      Filing Date: {activeDocket.efilingDate}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-black dark:text-white tracking-tight">
                    {activeDocket.matterTitle}
                  </h2>
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 shrink-0" />
                    <span>{activeDocket.court}</span>
                  </p>
                </div>

                {/* Stage Badge with Burgundy for Defects */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      activeDocket.stage === "defects_notified"
                        ? "bg-[#6B1728]/10 text-[#6B1728] dark:bg-[#6B1728]/25 dark:text-[#F3B8C2] border border-[#6B1728]/30"
                        : activeDocket.stage === "defects_cured"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    <span>{activeDocket.stageLabel}</span>
                  </span>
                </div>
              </div>

              {/* Four Meta Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Bench Allocation</span>
                  <p className="font-semibold text-black dark:text-white truncate" title={activeDocket.bench}>
                    {activeDocket.courtHall ? `${activeDocket.courtHall}` : activeDocket.bench}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Section Officer</span>
                  <p className="font-semibold text-black dark:text-white truncate" title={activeDocket.sectionOfficer}>
                    {activeDocket.sectionOfficer}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Opposite Counsel</span>
                  <p className="font-semibold text-black dark:text-white truncate" title={activeDocket.standingCounselName}>
                    {activeDocket.standingCounselName}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Cure Limitation</span>
                  <p className="font-semibold text-black dark:text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#6B1728]" />
                    <span>{activeDocket.daysRemaining !== undefined ? `${activeDocket.daysRemaining} Days Left` : "N/A"}</span>
                  </p>
                </div>
              </div>

              {/* Progress Stage Tracker */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                  Registry E-Filing Milestone Tracker
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-black dark:bg-white" />
                    <span className="font-bold text-black dark:text-white block text-[11px]">1. E-Filed</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{activeDocket.efilingDate}</span>
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`h-1.5 w-full rounded-full ${
                        activeDocket.stage !== "under_scrutiny"
                          ? "bg-black dark:bg-white"
                          : "bg-[#6B1728] animate-pulse"
                      }`}
                    />
                    <span className="font-bold text-black dark:text-white block text-[11px]">2. Scrutiny</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {activeDocket.defectNotifiedDate || "In progress"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`h-1.5 w-full rounded-full ${
                        activeDocket.stage === "defects_cured" || activeDocket.stage === "numbered_listed"
                          ? "bg-black dark:bg-white"
                          : "bg-zinc-200 dark:bg-zinc-800"
                      }`}
                    />
                    <span className="font-bold text-black dark:text-white block text-[11px]">3. Re-Presented</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {activeDocket.stage === "defects_cured" || activeDocket.stage === "numbered_listed"
                        ? "Cured"
                        : "Pending"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`h-1.5 w-full rounded-full ${
                        activeDocket.stage === "numbered_listed"
                          ? "bg-black dark:bg-white"
                          : "bg-zinc-200 dark:bg-zinc-800"
                      }`}
                    />
                    <span className="font-bold text-black dark:text-white block text-[11px]">4. Court Listed</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {activeDocket.courtHall || "Awaiting"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrutiny Objections & Defects Section */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-black dark:text-white tracking-tight flex items-center gap-2">
                    <span>Registry Scrutiny Objections &amp; Cure Slips</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white">
                      {activeDocket.defects.length} Items
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Defects noted under High Court Rules of Practice. Click &quot;Cure Defect&quot; to upload corrected annexures.
                  </p>
                </div>

                {activeDocket.defects.some((d) => d.status === "pending") && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#6B1728]/10 text-[#6B1728] dark:bg-[#6B1728]/25 dark:text-[#F3B8C2]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Cure Deadline: {activeDocket.statutoryCureDeadline}</span>
                  </span>
                )}
              </div>

              {/* Defect Cards */}
              <div className="space-y-3">
                {activeDocket.defects.map((defect) => (
                  <div
                    key={defect.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                      defect.status === "cured"
                        ? "bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 opacity-90"
                        : "bg-white dark:bg-black border-zinc-300 dark:border-zinc-700 shadow-xs ring-1 ring-[#6B1728]/20"
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-black text-white dark:bg-white dark:text-black">
                          {defect.code}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">
                          {defect.ruleReference}
                        </span>
                        {defect.status === "cured" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Check className="w-3 h-3" />
                            <span>Cured on {defect.curedAt}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#6B1728]/10 text-[#6B1728] dark:bg-[#6B1728]/25 dark:text-[#F3B8C2]">
                            <AlertCircle className="w-3 h-3" />
                            <span>Defect Action Required</span>
                          </span>
                        )}
                      </div>

                      {/* Objection Remarks */}
                      <p className="text-xs sm:text-sm font-semibold text-black dark:text-white leading-relaxed">
                        &quot;{defect.objectionText}&quot;
                      </p>

                      {/* Action Required */}
                      <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
                        <span className="font-bold text-black dark:text-white block">
                          Registry Prescribed Rectification:
                        </span>
                        <p>{defect.actionRequired}</p>
                      </div>

                      {/* Cured History remarks if already cured */}
                      {defect.status === "cured" && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300 space-y-0.5">
                          <span className="font-bold block">Verified Curing Statement:</span>
                          <p>{defect.curedRemarks}</p>
                          {defect.replacementFileName && (
                            <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 block pt-0.5">
                              Enclosure: {defect.replacementFileName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 flex sm:flex-col gap-2">
                      {defect.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDefectModal(defect);
                            setCureRemarksInput("");
                            setCureFileNameInput("");
                          }}
                          className="px-4 py-2 rounded-xl bg-[#6B1728] text-white hover:bg-[#7A1B2E] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Cure Defect</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDefectModal(defect);
                            setCureRemarksInput(defect.curedRemarks || "");
                            setCureFileNameInput(defect.replacementFileName || "");
                          }}
                          className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer"
                        >
                          Edit Curing
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {activeDocket.defects.length === 0 && (
                  <div className="p-8 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                    <span className="font-bold text-black dark:text-white block text-sm">
                      Zero Scrutiny Objections
                    </span>
                    <p className="mt-1">
                      No defects recorded by the Registry. The paperbook satisfies all rules of practice.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Cure Defect Action Dialog */}
      {activeDefectModal && activeDocket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
              <div className="space-y-0.5">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black">
                  {activeDefectModal.code}
                </span>
                <h3 className="text-sm font-bold text-black dark:text-white">
                  Cure Registry Scrutiny Objection
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDefectModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCureDefectSubmit} className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Registry Objection:</span>
                <p className="font-semibold text-black dark:text-white">&quot;{activeDefectModal.objectionText}&quot;</p>
                <span className="text-[10px] font-mono text-[#6B1728] block pt-1">{activeDefectModal.ruleReference}</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-black dark:text-white block">
                  Counsel Curing Statement / Rectification Explanation:
                </label>
                <textarea
                  rows={3}
                  required
                  value={cureRemarksInput}
                  onChange={(e) => setCureRemarksInput(e.target.value)}
                  placeholder="e.g. Scrutiny defect cured. Annexure P-4 survey sketch re-paginated from pages 14 to 18 with clear legible folio numbers in accordance with Rule 14(2)."
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-black dark:text-white block">
                  Enclosure / Replacement File Name:
                </label>
                <input
                  type="text"
                  value={cureFileNameInput}
                  onChange={(e) => setCureFileNameInput(e.target.value)}
                  placeholder="e.g. Re_Paginated_Annexure_P4_Survey_Sketch.pdf"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white font-mono focus:outline-none focus:border-black"
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Filing Token: {activeDocket.filingToken}</span>
                <span className="font-bold text-black dark:text-white">{advocateName}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveDefectModal(null)}
                  className="px-4 py-2 rounded-xl text-zinc-500 hover:text-black dark:hover:text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#6B1728] text-white hover:bg-[#7A1B2E] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  Confirm &amp; Mark Cured
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Urgent Motion Slip / Mentioning Memo Generator */}
      {showMotionModal && activeDocket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 shrink-0">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B1728]">
                  HIGH COURT OF KERALA • MOTION ADMISSION BRANCH
                </span>
                <h3 className="text-base sm:text-lg font-bold text-black dark:text-white">
                  Motion Slip &amp; Urgent Mentioning Memo Generator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMotionModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Two Panes (Config Form on Left, Formatted Paperbook on Right) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Form Controls */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-black dark:text-white block">Court Hall &amp; Bench:</label>
                    <input
                      type="text"
                      value={motionCourtHall}
                      onChange={(e) => setMotionCourtHall(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-black dark:text-white block">Posting Date Requested:</label>
                    <input
                      type="text"
                      value={motionDate}
                      onChange={(e) => setMotionDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-black dark:text-white block">Item Number / Motion Category:</label>
                    <input
                      type="text"
                      value={motionItemNo}
                      onChange={(e) => setMotionItemNo(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-black dark:text-white block">Specific Grounds of Urgency:</label>
                    <textarea
                      rows={4}
                      value={motionUrgencyGrounds}
                      onChange={(e) => setMotionUrgencyGrounds(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white"
                    />
                  </div>
                </div>

                {/* Formatted Certified Motion Slip Paperbook Preview */}
                <div className="space-y-2 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black dark:text-white text-xs">Certified Court Slip Preview:</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          `IN THE HIGH COURT OF KERALA AT ERNAKULAM\n\nMOTION SLIP / MENTIONING MEMO\n\nBEFORE: ${motionBench}\nCOURT HALL: ${motionCourtHall}\nDATE OF POSTING: ${motionDate}\nITEM CATEGORY: ${motionItemNo}\n\nMATTER: ${activeDocket.matterTitle}\nE-FILING TOKEN: ${activeDocket.filingToken}\n\nCOUNSEL FOR PETITIONER: ${advocateName} (${barCouncilNumber})\nCOUNSEL FOR RESPONDENT: ${activeDocket.standingCounselName}\n\nGROUNDS OF URGENCY:\n${motionUrgencyGrounds}\n\nPRAYER:\n${motionPrayer}\n\nDated this the 28th day of October 2026.\n\nSd/-\n${advocateName}\nCounsel for Petitioner`,
                          "motion"
                        )
                      }
                      className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedState === "motion" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedState === "motion" ? "Copied!" : "Copy Slip"}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-serif text-[11px] leading-relaxed text-black dark:text-white flex-1 overflow-y-auto space-y-2 whitespace-pre-wrap select-all">
                    <div className="text-center font-bold tracking-wider border-b pb-2 border-zinc-300 dark:border-zinc-700">
                      IN THE HIGH COURT OF KERALA AT ERNAKULAM
                      <div className="text-[10px] font-sans font-normal text-zinc-500 pt-0.5">
                        MOTION SLIP / URGENT MENTIONING MEMO
                      </div>
                    </div>

                    <div className="space-y-1 pt-1 text-[10px] font-sans">
                      <div><span className="font-bold">Bench:</span> {motionBench}</div>
                      <div><span className="font-bold">Court Hall:</span> {motionCourtHall} | <span className="font-bold">Requested:</span> {motionDate}</div>
                      <div><span className="font-bold">Filing Token:</span> {activeDocket.filingToken}</div>
                      <div><span className="font-bold">Case Title:</span> {activeDocket.matterTitle}</div>
                      <div><span className="font-bold">Petitioner Counsel:</span> {advocateName} ({barCouncilNumber})</div>
                      <div><span className="font-bold">Standing Counsel:</span> {activeDocket.standingCounselName}</div>
                    </div>

                    <div className="pt-2 text-[11px]">
                      <span className="font-bold underline block mb-1">GROUNDS OF EXTREME URGENCY:</span>
                      {motionUrgencyGrounds}
                    </div>

                    <div className="pt-2 text-[11px]">
                      <span className="font-bold underline block mb-1">PRAYER:</span>
                      {motionPrayer}
                    </div>

                    <div className="pt-4 text-right">
                      <span className="block font-bold">Sd/-</span>
                      <span className="block font-bold">{advocateName}</span>
                      <span className="text-[10px] text-zinc-500">Roll No: {barCouncilNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-zinc-500 font-mono">
                Complies with Kerala High Court Practice Directions (Motion Admission Rules)
              </span>
              <button
                type="button"
                onClick={() => setShowMotionModal(false)}
                className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Re-Presentation Memorandum Generator */}
      {showRePresentModal && activeDocket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 shrink-0">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B1728]">
                  RULE 41(2) RE-PRESENTATION MEMO
                </span>
                <h3 className="text-base sm:text-lg font-bold text-black dark:text-white">
                  Formal Defect Clearance Memorandum
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRePresentModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-black dark:text-white text-xs">
                  Registry Paperbook Filing Draft:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const defectSummary = activeDocket.defects
                      .map(
                        (d, idx) =>
                          `${idx + 1}. Defect ${d.code} (${d.ruleReference}):\n   Objection: ${d.objectionText}\n   Cure Action: ${d.status === "cured" ? d.curedRemarks : "Cured as instructed."}`
                      )
                      .join("\n\n");

                    handleCopyText(
                      `IN THE HIGH COURT OF KERALA AT ERNAKULAM\n\n${activeDocket.caseType} No. ${activeDocket.caseYear}\nFiling Token: ${activeDocket.filingToken}\n\nBETWEEN:\n${activeDocket.petitionerName} ... Petitioner\nAND\n${activeDocket.respondentName} ... Respondents\n\nMEMORANDUM OF RE-PRESENTATION\n(Filed under Rule 41(2) of the Rules of the High Court of Kerala, 1971)\n\nThe Petitioner above named respectfully submits as follows:\n\n1. The above petition was scrutinized by the Registry on ${activeDocket.defectNotifiedDate || "24 Oct 2026"} and certain formal defects were notified.\n\n2. All the defects pointed out by the Registry have been rectified as detailed below:\n\n${defectSummary}\n\n3. The petition is re-presented well within the statutory period of 7 days as prescribed under Rule 41(2).\n\nWherefore it is prayed that this Hon'ble Court may be pleased to accept this re-presentation, clear the scrutiny defects, assign regular case number, and list the matter before the Hon'ble Court for admission.\n\nDated this the 28th day of October 2026 at Ernakulam.\n\nSd/-\n${advocateName}\nCounsel for Petitioner (Roll: ${barCouncilNumber})`,
                      "re-present"
                    );
                  }}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  {copiedState === "re-present" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedState === "re-present" ? "Copied to Clipboard!" : "Copy Full Memo"}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] text-black dark:text-zinc-200 leading-relaxed whitespace-pre-wrap select-all">
                {`IN THE HIGH COURT OF KERALA AT ERNAKULAM

${activeDocket.caseType}
Filing Token: ${activeDocket.filingToken}

BETWEEN:
${activeDocket.petitionerName}
... Petitioner
AND
${activeDocket.respondentName}
... Respondents

MEMORANDUM OF RE-PRESENTATION
(Filed under Rule 41(2) of the Rules of the High Court of Kerala, 1971)

The Petitioner above named respectfully submits as follows:

1. The above petition was scrutinized by the Registry on ${activeDocket.defectNotifiedDate || "24 Oct 2026"} and scrutiny defects were pointed out.

2. All the defects pointed out by the Registry have been rectified as follows:
${activeDocket.defects
  .map(
    (d, i) =>
      `   (${i + 1}) Defect ${d.code} (${d.ruleReference}):\n       Objection: ${d.objectionText}\n       Cure: ${d.status === "cured" ? d.curedRemarks : "Cured as directed by Registry."}`
  )
  .join("\n\n")}

3. The petition is re-presented within the statutory period of 7 days.

Wherefore it is prayed that the Registry may accept this re-presentation, clear scrutiny, assign regular case number, and post before the Hon'ble Bench.

Dated at Ernakulam on 28-Oct-2026.

Sd/-
${advocateName}
Counsel for Petitioner
Bar Council Enrollment: ${barCouncilNumber}`}
              </div>
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowRePresentModal(false)}
                className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Add New E-Filing Docket */}
      {showNewDocketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
              <h3 className="text-base font-bold text-black dark:text-white">
                Add New High Court E-Filing Docket
              </h3>
              <button
                type="button"
                onClick={() => setShowNewDocketModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewDocket} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-black dark:text-white block">Matter Title / Short Cause:</label>
                <input
                  type="text"
                  required
                  value={newMatterTitle}
                  onChange={(e) => setNewMatterTitle(e.target.value)}
                  placeholder="e.g. WP(C) 20114/2026"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white font-sans focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-black dark:text-white block">Case Type:</label>
                  <select
                    value={newCaseType}
                    onChange={(e) => setNewCaseType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none focus:border-black"
                  >
                    <option value="WP(C)">Writ Petition (Civil) - WP(C)</option>
                    <option value="Bail Appl.">Bail Application (Sec 483 BNSS)</option>
                    <option value="Crl.M.C.">Criminal M.C. (Sec 528 BNSS)</option>
                    <option value="RSA">Regular Second Appeal (RSA)</option>
                    <option value="ARB.O.P.">Commercial Arbitration (Sec 9/11)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-black dark:text-white block">Advocate In-Charge:</label>
                  <input
                    type="text"
                    disabled
                    value={advocateName}
                    className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-black dark:text-white block">Petitioner Name:</label>
                <input
                  type="text"
                  value={newPetitioner}
                  onChange={(e) => setNewPetitioner(e.target.value)}
                  placeholder="e.g. Mathew Varghese"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-black dark:text-white block">Respondent Name:</label>
                <input
                  type="text"
                  value={newRespondent}
                  onChange={(e) => setNewRespondent(e.target.value)}
                  placeholder="e.g. State of Kerala & Others"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewDocketModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-500 hover:text-black dark:hover:text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  Register Docket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrutinyDefectClearingView;
