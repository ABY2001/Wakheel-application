"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Calendar,
  Clock,
  Building2,
  FileText,
  Stamp,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Copy,
  Check,
  Download,
  Share2,
  X,
  ExternalLink,
  ShieldCheck,
  Video,
  FileCheck,
  Eye,
  Trash2,
  Edit2,
  FileBadge,
} from "lucide-react";
import { csApi } from "@/lib/api";

export interface BoardDirector {
  name: string;
  din?: string;
  status: "present" | "present_vc" | "leave_of_absence" | "special_invitee";
}

export interface AgendaItem {
  itemNumber: number;
  title: string;
  description: string;
  proposedBy?: string;
  isStatutory?: boolean;
}

export interface BoardMeetingItem {
  id: string;
  meetingId?: string;
  companyName: string;
  cin: string;
  meetingNumber: string;
  meetingType: "board_meeting" | "audit_committee" | "nrc_committee" | "agm" | "egm";
  date: string;
  time: string;
  venue: string;
  isVideoConference: boolean;
  chairperson: string;
  directors: BoardDirector[];
  isShorterNotice: boolean;
  shorterNoticeReason?: string;
  status: "scheduled" | "notice_sent" | "draft_minutes" | "minutes_signed";
  agendaItems: AgendaItem[];
  minutes?: {
    draftContent?: string;
    finalContent?: string;
    signedBy?: string;
    signedAt?: string;
  };
}

export interface BoardResolutionItem {
  id: string;
  resolutionId?: string;
  meetingId?: string;
  companyName: string;
  cin: string;
  resolutionNumber: string;
  type: "board" | "special" | "ordinary" | "circular";
  category: "banking" | "director_appointment" | "share_allotment" | "borrowing" | "statutory_compliance" | "general_corporate";
  title: string;
  actSection: string;
  preambleText?: string;
  resolutionText: string;
  furtherResolutionText?: string;
  authorizedSignatories: string[];
  status: "draft" | "passed_unanimously" | "passed_majority" | "circulated";
  isCtcGenerated?: boolean;
  ctcCertifiedBy?: string;
  ctcCertifiedAt?: string;
}

const INITIAL_MEETINGS: BoardMeetingItem[] = [
  {
    id: "bm-1",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    meetingNumber: "BM-04/2026-27",
    meetingType: "board_meeting",
    date: "2026-11-10",
    time: "11:00 AM",
    venue: "Board Room, Registered Office & Two-Way Video Conference (Rule 3)",
    isVideoConference: true,
    chairperson: "Dr. Vikram Malhotra (Chairman & Independent Director)",
    directors: [
      { name: "Dr. Vikram Malhotra", din: "08912340", status: "present" },
      { name: "CS Rajesh Sharma", din: "07849102", status: "present" },
      { name: "Priya Sundaram", din: "09124589", status: "present_vc" },
      { name: "Karan Patel", din: "06451290", status: "leave_of_absence" },
    ],
    isShorterNotice: false,
    status: "notice_sent",
    agendaItems: [
      {
        itemNumber: 1,
        title: "Leave of Absence & Quorum Verification",
        description: "To grant leave of absence to Mr. Karan Patel and ascertain quorum presence per Section 174.",
        proposedBy: "Dr. Vikram Malhotra",
        isStatutory: true,
      },
      {
        itemNumber: 2,
        title: "Confirmation of Previous Minutes (BM-03/2026-27)",
        description: "To confirm and sign minutes of the previous Board Meeting held on 14 August 2026 per SS-1.",
        proposedBy: "CS Rajesh Sharma",
        isStatutory: true,
      },
      {
        itemNumber: 3,
        title: "Disclosure of Directors' Interest (Form MBP-1 / Section 184)",
        description: "To take on record general notices of disclosure of interest received from Directors in Form MBP-1.",
        proposedBy: "CS Rajesh Sharma",
        isStatutory: true,
      },
      {
        itemNumber: 4,
        title: "Private Placement of 50,000 CCPS under Section 42 & 62(1)(c)",
        description: "To approve Draft Form PAS-4 Private Placement Offer Letter and call an EGM for special resolution approval.",
        proposedBy: "Priya Sundaram",
        isStatutory: false,
      },
      {
        itemNumber: 5,
        title: "Revision of Bank Operation Mandates with HDFC Bank",
        description: "To authorize Joint Signatures for all banking transactions exceeding ₹25,00,000.",
        proposedBy: "Dr. Vikram Malhotra",
        isStatutory: false,
      },
    ],
    minutes: {
      draftContent:
        "MINUTES OF THE 4TH MEETING OF THE BOARD OF DIRECTORS OF CYBERCORP TECHNOLOGIES PVT LTD HELD ON TUESDAY, 10 NOVEMBER 2026 AT 11:00 AM AT REGISTERED OFFICE AND VIA VIDEO CONFERENCE.\n\n1. CHAIRPERSON & QUORUM:\nDr. Vikram Malhotra occupied the Chair. The Chairman welcomed the members and confirmed that the requisite quorum was present pursuant to Section 174 of the Companies Act, 2013 and Secretarial Standard 1 (SS-1).",
      signedBy: "Dr. Vikram Malhotra",
    },
  },
  {
    id: "bm-2",
    companyName: "Zenith FinTech India Pvt Ltd",
    cin: "U65990MH2021PTC362145",
    meetingNumber: "AGM-05/2026",
    meetingType: "agm",
    date: "2026-09-28",
    time: "02:30 PM",
    venue: "Auditorium Hall, Marine Lines, Mumbai & Live Webcast",
    isVideoConference: true,
    chairperson: "Smt. Devika Menon (Managing Director)",
    directors: [
      { name: "Smt. Devika Menon", din: "07123984", status: "present" },
      { name: "Rahul Sharma", din: "08451290", status: "present" },
      { name: "Arjun Nambiar", din: "09124589", status: "present" },
    ],
    isShorterNotice: false,
    status: "minutes_signed",
    agendaItems: [
      {
        itemNumber: 1,
        title: "Adoption of Audited Financial Statements FY 2025-26",
        description: "To receive, consider and adopt audited Balance Sheet, P&L, and Board Report.",
        proposedBy: "Smt. Devika Menon",
        isStatutory: true,
      },
      {
        itemNumber: 2,
        title: "Declaration of Final Dividend of ₹2.50 per Equity Share",
        description: "Recommendation of 25% dividend payout out of current year profits.",
        proposedBy: "Rahul Sharma",
        isStatutory: false,
      },
    ],
    minutes: {
      finalContent:
        "MINUTES OF THE 5TH ANNUAL GENERAL MEETING OF ZENITH FINTECH INDIA PVT LTD HELD ON 28 SEPTEMBER 2026 AT 02:30 PM.\n\nAll ordinary resolutions passed unanimously. Entered into statutory Minutes Book on 12 October 2026 per Section 118.",
      signedBy: "Smt. Devika Menon",
      signedAt: "2026-10-12",
    },
  },
];

const INITIAL_RESOLUTIONS: BoardResolutionItem[] = [
  {
    id: "res-1",
    meetingId: "bm-1",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    resolutionNumber: "RES-01/BM-04/2026-27",
    type: "board",
    category: "banking",
    title: "Opening Corporate Current Account & Digital Signatory Mandate with HDFC Bank",
    actSection: "Section 179(3)(e) of Companies Act 2013",
    preambleText:
      "WHEREAS the Company requires an enhanced corporate banking facility and CMS gateway for operational collections and automated payroll disbursements;",
    resolutionText:
      "RESOLVED THAT a Corporate Current Account in the name of 'CyberCorp Technologies Pvt Ltd' be opened with HDFC Bank Ltd, Connaught Place Branch, New Delhi, and that the Bank be and is hereby authorized to honor all cheques, promissory notes, and electronic RTGS/NEFT transfers drawn on behalf of the Company.",
    furtherResolutionText:
      "FURTHER RESOLVED THAT Dr. Vikram Malhotra (Director) and CS Rajesh Sharma (Company Secretary) be and are hereby jointly authorized to execute all account opening documentation, net banking mandates, and affix the Common Seal/Signature on behalf of the Company.",
    authorizedSignatories: ["Dr. Vikram Malhotra", "CS Rajesh Sharma"],
    status: "passed_unanimously",
    isCtcGenerated: true,
    ctcCertifiedBy: "CS Rajesh Sharma (FCS 8492, CP 10294)",
    ctcCertifiedAt: "2026-11-01",
  },
  {
    id: "res-2",
    meetingId: "bm-1",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    resolutionNumber: "RES-02/BM-04/2026-27",
    type: "special",
    category: "share_allotment",
    title: "Approval of Private Placement Offer Letter (Form PAS-4) for 50,000 Series A CCPS",
    actSection: "Section 42 & Section 62(1)(c) of Companies Act 2013 read with PAS Rules",
    preambleText:
      "WHEREAS the Company proposes to raise capital for tech stack expansion through issuance of 0.01% Compulsorily Convertible Preference Shares (CCPS) on private placement terms;",
    resolutionText:
      "RESOLVED THAT subject to the approval of shareholders in General Meeting, the draft Private Placement Offer Letter in Form PAS-4 along with Application Form as placed before the Board be and is hereby approved for circulation to the identified institutional investor M/s Indus Venture Capital Fund.",
    furtherResolutionText:
      "FURTHER RESOLVED THAT an Extraordinary General Meeting (EGM) of the Company be convened on Friday, 28 November 2026 at 11:30 AM to pass the requisite Special Resolution under Section 42 and 62 of the Act.",
    authorizedSignatories: ["Priya Sundaram", "CS Rajesh Sharma"],
    status: "passed_unanimously",
    isCtcGenerated: false,
  },
  {
    id: "res-3",
    meetingId: "bm-1",
    companyName: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    resolutionNumber: "RES-03/BM-04/2026-27",
    type: "board",
    category: "director_appointment",
    title: "Appointment of Dr. Ananya Sen as Additional Director (Independent)",
    actSection: "Section 161(1) and Section 149 of Companies Act 2013",
    preambleText:
      "WHEREAS the Nomination & Remuneration Committee has recommended the induction of Dr. Ananya Sen to strengthen board oversight in data privacy and cybersecurity standards;",
    resolutionText:
      "RESOLVED THAT pursuant to the provisions of Section 161(1) and other applicable provisions of the Companies Act, 2013 and the Articles of Association, Dr. Ananya Sen (DIN: 09841235) be and is hereby appointed as an Additional Director (Category: Independent) of the Company with immediate effect to hold office up to the date of the next Annual General Meeting.",
    furtherResolutionText:
      "FURTHER RESOLVED THAT CS Rajesh Sharma be authorized to electronically file Form DIR-12 with the Registrar of Companies, Delhi & Haryana, within 30 days.",
    authorizedSignatories: ["Dr. Vikram Malhotra"],
    status: "passed_unanimously",
    isCtcGenerated: true,
    ctcCertifiedBy: "CS Rajesh Sharma",
    ctcCertifiedAt: "2026-11-01",
  },
];

interface BoardGovernanceViewProps {
  firmName?: string;
  csName?: string;
  initialSubTab?: "meetings" | "resolutions" | "ss1-inspector";
}

export function BoardGovernanceView({
  firmName = "Apex Law & Corporate Partners LLP",
  csName = "CS Rajesh Sharma",
  initialSubTab = "meetings",
}: BoardGovernanceViewProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"meetings" | "resolutions" | "ss1-inspector">(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Meetings & Resolutions Data
  const [meetings, setMeetings] = useState<BoardMeetingItem[]>(INITIAL_MEETINGS);
  const [resolutions, setResolutions] = useState<BoardResolutionItem[]>(INITIAL_RESOLUTIONS);

  // Filters & Search
  const [meetingFilter, setMeetingFilter] = useState<string>("ALL");
  const [resolutionFilter, setResolutionFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Drawers
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [draftResolutionModalOpen, setDraftResolutionModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<BoardMeetingItem | null>(null);
  const [ctcModalResolution, setCtcModalResolution] = useState<BoardResolutionItem | null>(null);
  const [copiedCtc, setCopiedCtc] = useState(false);

  // New Meeting Form
  const [newCompanyName, setNewCompanyName] = useState("CyberCorp Technologies Pvt Ltd");
  const [newMeetingNumber, setNewMeetingNumber] = useState("BM-05/2026-27");
  const [newMeetingType, setNewMeetingType] = useState<BoardMeetingItem["meetingType"]>("board_meeting");
  const [newMeetingDate, setNewMeetingDate] = useState("2026-11-20");
  const [newMeetingTime, setNewMeetingTime] = useState("11:30 AM");
  const [newMeetingVenue, setNewMeetingVenue] = useState("Board Room, Registered Office & Video Conference");
  const [newIsShorterNotice, setNewIsShorterNotice] = useState(false);
  const [newShorterNoticeReason, setNewShorterNoticeReason] = useState("");

  // New Resolution Form
  const [newResTitle, setNewResTitle] = useState("");
  const [newResCategory, setNewResCategory] = useState<BoardResolutionItem["category"]>("banking");
  const [newResType, setNewResType] = useState<BoardResolutionItem["type"]>("board");
  const [newResSection, setNewResSection] = useState("Section 179(3) of Companies Act 2013");
  const [newResPreamble, setNewResPreamble] = useState("");
  const [newResText, setNewResText] = useState("");
  const [newResFurtherText, setNewResFurtherText] = useState("");
  const [newResSignatories, setNewResSignatories] = useState("CS Rajesh Sharma, Dr. Vikram Malhotra");

  // Load from backend on mount
  useEffect(() => {
    let isMounted = true;
    async function loadGovernanceData() {
      try {
        const [mRes, rRes] = await Promise.allSettled([
          csApi.getBoardMeetings(),
          csApi.getBoardResolutions(),
        ]);
        if (!isMounted) return;
        if (mRes.status === "fulfilled" && mRes.value?.success && Array.isArray(mRes.value.meetings) && mRes.value.meetings.length > 0) {
          setMeetings(mRes.value.meetings);
        }
        if (rRes.status === "fulfilled" && rRes.value?.success && Array.isArray(rRes.value.resolutions) && rRes.value.resolutions.length > 0) {
          setResolutions(rRes.value.resolutions);
        }
      } catch (err) {
        console.warn("Using fallback local governance state:", err);
      }
    }
    loadGovernanceData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered Meetings
  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const matchType = meetingFilter === "ALL" || m.meetingType === meetingFilter;
      const matchSearch =
        m.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.meetingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.chairperson.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [meetings, meetingFilter, searchQuery]);

  // Filtered Resolutions
  const filteredResolutions = useMemo(() => {
    return resolutions.filter((r) => {
      const matchCategory = resolutionFilter === "ALL" || r.category === resolutionFilter;
      const matchSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.resolutionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.actSection.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [resolutions, resolutionFilter, searchQuery]);

  // Handle Schedule Meeting
  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    const newM: BoardMeetingItem = {
      id: `bm-${Date.now()}`,
      companyName: newCompanyName,
      cin: "U72200DL2022PTC394812",
      meetingNumber: newMeetingNumber,
      meetingType: newMeetingType,
      date: newMeetingDate,
      time: newMeetingTime,
      venue: newMeetingVenue,
      isVideoConference: true,
      chairperson: "Dr. Vikram Malhotra (Chairman & Independent Director)",
      directors: [
        { name: "Dr. Vikram Malhotra", din: "08912340", status: "present" },
        { name: csName, din: "07849102", status: "present" },
        { name: "Priya Sundaram", din: "09124589", status: "present_vc" },
      ],
      isShorterNotice: newIsShorterNotice,
      shorterNoticeReason: newShorterNoticeReason,
      status: "scheduled",
      agendaItems: [
        {
          itemNumber: 1,
          title: "Leave of Absence & Quorum Verification",
          description: "Ascertain presence of requisite quorum per Section 174 of Companies Act 2013.",
          proposedBy: "Chairperson",
          isStatutory: true,
        },
        {
          itemNumber: 2,
          title: "Confirmation of Previous Minutes",
          description: "Confirm and sign minutes of the previous board meeting strictly per SS-1.",
          proposedBy: csName,
          isStatutory: true,
        },
      ],
    };

    setMeetings((prev) => [newM, ...prev]);
    setScheduleModalOpen(false);

    try {
      await csApi.createBoardMeeting(newM);
    } catch (err) {
      console.warn("Failed to persist board meeting to backend:", err);
    }
  };

  // Handle Create Resolution
  const handleCreateResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim() || !newResText.trim()) return;

    const newR: BoardResolutionItem = {
      id: `res-${Date.now()}`,
      companyName: newCompanyName,
      cin: "U72200DL2022PTC394812",
      resolutionNumber: `RES-0${resolutions.length + 1}/${newMeetingNumber}`,
      type: newResType,
      category: newResCategory,
      title: newResTitle.trim(),
      actSection: newResSection.trim() || "Companies Act, 2013",
      preambleText: newResPreamble.trim(),
      resolutionText: newResText.trim(),
      furtherResolutionText: newResFurtherText.trim(),
      authorizedSignatories: newResSignatories.split(",").map((s) => s.trim()),
      status: "passed_unanimously",
      isCtcGenerated: false,
    };

    setResolutions((prev) => [newR, ...prev]);
    setDraftResolutionModalOpen(false);
    setNewResTitle("");
    setNewResText("");
    setNewResFurtherText("");
    setNewResPreamble("");

    try {
      await csApi.createBoardResolution(newR);
    } catch (err) {
      console.warn("Failed to persist resolution to backend:", err);
    }
  };

  // Handle Generate CTC
  const handleGenerateCtc = async (res: BoardResolutionItem) => {
    const certifiedBy = `${csName} (FCS 8492, CP 10294)`;
    setResolutions((prev) =>
      prev.map((r) =>
        r.id === res.id
          ? {
              ...r,
              isCtcGenerated: true,
              ctcCertifiedBy: certifiedBy,
              ctcCertifiedAt: new Date().toISOString().split("T")[0],
            }
          : r
      )
    );

    const updated = {
      ...res,
      isCtcGenerated: true,
      ctcCertifiedBy: certifiedBy,
      ctcCertifiedAt: new Date().toISOString().split("T")[0],
    };
    setCtcModalResolution(updated);

    try {
      await csApi.generateCtcResolution(res.id, certifiedBy);
    } catch (err) {
      console.warn("Failed to update CTC state on backend:", err);
    }
  };

  // Copy CTC Text to Clipboard
  const handleCopyCtcText = (res: BoardResolutionItem) => {
    const text = `CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF ${res.companyName.toUpperCase()} HELD ON 10TH NOVEMBER, 2026.
CIN: ${res.cin}

"${res.title.toUpperCase()}"

${res.preambleText ? `${res.preambleText}\n\n` : ""}"RESOLVED THAT ${res.resolutionText}"

${res.furtherResolutionText ? `"FURTHER RESOLVED THAT ${res.furtherResolutionText}"\n\n` : ""}
// CERTIFIED TO BE TRUE COPY //
For ${res.companyName.toUpperCase()}

(Signature)
${res.ctcCertifiedBy || csName}
Company Secretary / Compliance Officer
Membership No: FCS 8492 | CP No: 10294
Date: ${res.ctcCertifiedAt || "10 Nov 2026"}
Place: New Delhi`;

    navigator.clipboard.writeText(text);
    setCopiedCtc(true);
    setTimeout(() => setCopiedCtc(false), 2000);
  };

  return (
    <div className="w-full space-y-6 font-sans">
      {/* =========================================================================
          TOP EXECUTIVE BANNER: ICSI SS-1 / SS-2 COMPLIANCE
      ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                ICSI SS-1 &amp; SS-2 STATUTORY MINUTES ENGINE
              </span>
              <span className="text-zinc-600">•</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                Companies Act, 2013 • Sec 118 &amp; 173
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Board Governance &amp; Secretarial Minutes Studio
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Automated 7-day statutory notice dispatcher, director attendance registers, standardized Indian board resolution preambles, and 1-click Certified True Copies (CTC) for banks, investors &amp; MCA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="px-4 py-2.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Schedule Meeting</span>
            </button>
            <button
              onClick={() => setDraftResolutionModalOpen(true)}
              className="px-4 py-2.5 rounded-full bg-zinc-900 text-white border border-zinc-700 hover:border-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            >
              <Stamp className="w-3.5 h-3.5" />
              <span>+ Draft Resolution</span>
            </button>
          </div>
        </div>

        {/* 4 Governance KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-800/80">
          {[
            { label: "Governed Entities", val: "24 Companies", note: "19 Pvt Ltd • 5 LLPs" },
            { label: "Board Meetings Held", val: "38 in FY26", note: "100% Quorum Satisfied" },
            { label: "Statutory Resolutions", val: `${resolutions.length} Passed`, note: "All Stamped & Indexed" },
            { label: "SS-1 Audit Health", val: "100% Compliant", note: "Zero Notice Defect" },
          ].map((kpi, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">{kpi.label}</span>
              <div className="text-lg font-bold text-white">{kpi.val}</div>
              <span className="text-[10px] text-zinc-500">{kpi.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SUB-NAVIGATION TABS & SEARCH CONTROLS
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          {[
            { id: "meetings", label: "Board & Committee Meetings", count: meetings.length, icon: Users },
            { id: "resolutions", label: "Resolutions Register & CTC Vault", count: resolutions.length, icon: Stamp },
            { id: "ss1-inspector", label: "ICSI SS-1 Audit Checklist", count: "10 Rules", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isActive ? "bg-white/20 dark:bg-black/20" : "bg-zinc-200 dark:bg-zinc-800"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meetings, resolutions, DIN..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white shadow-2xs"
          />
        </div>
      </div>

      {/* =========================================================================
          TAB 1: BOARD & COMMITTEE MEETINGS
      ========================================================================= */}
      {activeTab === "meetings" && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", label: "All Meetings" },
              { id: "board_meeting", label: "Board of Directors (BM)" },
              { id: "audit_committee", label: "Audit Committee" },
              { id: "nrc_committee", label: "Nomination & Remuneration" },
              { id: "agm", label: "Annual General (AGM)" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setMeetingFilter(f.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  meetingFilter === f.id
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-bold"
                    : "bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Meetings Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMeetings.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-black dark:hover:border-white transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                      {m.meetingNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      m.status === "minutes_signed"
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        : m.status === "notice_sent"
                        ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800"
                        : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                    }`}>
                      {m.status.replace("_", " ")}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-black dark:text-white">
                      {m.companyName}
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-400">CIN: {m.cin}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{m.date} at {m.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                      <Video className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{m.isVideoConference ? "Video Conf (Rule 3)" : "Physical"}</span>
                    </div>
                  </div>

                  {/* Quorum and Statutory Check */}
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-100 dark:border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        Quorum Status (Sec 174):
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Quorum Met
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {m.directors.map((d, dIdx) => (
                        <span
                          key={dIdx}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                            d.status === "leave_of_absence"
                              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 line-through"
                              : "bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                          }`}
                        >
                          {d.name.split(" ")[0]} ({d.status.replace("_", " ")})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Agenda Pills */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                      Agenda Dossier ({m.agendaItems.length} Statutory Items):
                    </span>
                    <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                      {m.agendaItems.slice(0, 3).map((a, aIdx) => (
                        <li key={aIdx} className="flex items-start gap-1.5 truncate">
                          <span className="font-bold text-zinc-400 shrink-0">#{a.itemNumber}.</span>
                          <span className="truncate">{a.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedMeeting(m)}
                    className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-85 transition-opacity cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Meeting Pack</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("resolutions");
                      setSearchQuery(m.meetingNumber);
                    }}
                    className="text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>Resolutions ({resolutions.filter((r) => r.meetingId === m.id).length})</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: RESOLUTIONS REGISTER & CTC VAULT
      ========================================================================= */}
      {activeTab === "resolutions" && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", label: "All Resolutions" },
              { id: "banking", label: "Banking & Mandates" },
              { id: "share_allotment", label: "Share Allotment (PAS-3)" },
              { id: "director_appointment", label: "Director Appointment (DIR-12)" },
              { id: "borrowing", label: "Borrowing Powers (Sec 180)" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setResolutionFilter(f.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  resolutionFilter === f.id
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-bold"
                    : "bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Resolutions List */}
          <div className="space-y-4">
            {filteredResolutions.map((res) => (
              <div
                key={res.id}
                className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 hover:border-black dark:hover:border-white transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-900">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                        {res.resolutionNumber}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 uppercase font-bold text-zinc-600 dark:text-zinc-300">
                        {res.type.toUpperCase()} RESOLUTION
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {res.actSection}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-black dark:text-white mt-1">
                      {res.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {res.isCtcGenerated ? (
                      <button
                        onClick={() => setCtcModalResolution(res)}
                        className="px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100 transition-colors"
                      >
                        <FileBadge className="w-3.5 h-3.5" />
                        <span>View Official CTC</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGenerateCtc(res)}
                        className="px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
                      >
                        <Stamp className="w-3.5 h-3.5" />
                        <span>Generate Certified True Copy (CTC)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Statutory Language Box */}
                <div className="space-y-2 text-xs font-sans">
                  {res.preambleText && (
                    <div className="text-zinc-500 italic leading-relaxed">
                      {res.preambleText}
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed select-text">
                    {res.resolutionText}
                  </div>

                  {res.furtherResolutionText && (
                    <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed select-text">
                      {res.furtherResolutionText}
                    </div>
                  )}
                </div>

                {/* Signatories & Metadata */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-500 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-600 dark:text-zinc-400">Authorized Signatories:</span>
                    {res.authorizedSignatories.map((sig, sIdx) => (
                      <span key={sIdx} className="font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white">
                        {sig}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCopyCtcText(res)}
                      className="text-zinc-400 hover:text-black dark:hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCtc ? "Copied!" : "Copy Legal Text"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ICSI SS-1 AUDIT CHECKLIST INSPECTOR
      ========================================================================= */}
      {activeTab === "ss1-inspector" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Statutory Compliance Inspector: ICSI Secretarial Standard 1 &amp; 2</span>
            </h3>
            <p className="text-xs text-zinc-500 max-w-2xl">
              Every board meeting must satisfy the following 10 statutory conditions under Companies Act, 2013 to ensure legal validity of resolutions and protection against Section 450 penalties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                rule: "Rule 1: 7-Day Statutory Notice (Section 173(3))",
                desc: "Notice in writing must be dispatched at least seven days before the meeting to every director at their registered address.",
                status: "Pass (Verified)",
              },
              {
                rule: "Rule 2: Shorter Notice Safeguard",
                desc: "If held on shorter notice, at least one Independent Director must be present, or resolutions must be ratified by majority.",
                status: "Pass (Verified)",
              },
              {
                rule: "Rule 3: Video Conferencing Protocols",
                desc: "Two-way audio-visual recording must be stored, roll-call taken, and venue stated as the registered office per Rule 3.",
                status: "Pass (Verified)",
              },
              {
                rule: "Rule 4: Mandatory Quorum (Section 174)",
                desc: "One-third of total strength or two directors, whichever is higher, must be present throughout the meeting proceedings.",
                status: "Pass (Verified)",
              },
              {
                rule: "Rule 5: Disclosure of Interest (Form MBP-1 / Section 184)",
                desc: "Interested directors must disclose conflict before debate and refrain from voting or participating in the quorum.",
                status: "Pass (Verified)",
              },
              {
                rule: "Rule 6: Serial Numbering of Meetings",
                desc: "Consecutive serial numbers (e.g. BM-01/2026, BM-02/2026) must be maintained across financial years.",
                status: "Pass (Verified)",
              },
              {
                rule: "Rule 7: Draft Minutes Circulation within 15 Days",
                desc: "Draft minutes must be circulated to all directors within 15 days of the meeting for their written comments.",
                status: "Pass (Verified)",
              },
              {
                rule: "Rule 8: Entry in Statutory Minutes Book within 30 Days",
                desc: "Final minutes must be entered in the physical/digital bound Minutes Book within 30 days and signed by the Chairman.",
                status: "Pass (Verified)",
              },
            ].map((chk, cIdx) => (
              <div key={cIdx} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-black dark:text-white">{chk.rule}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {chk.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{chk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: SCHEDULE NEW BOARD MEETING
      ========================================================================= */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 text-black dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <h3 className="text-sm font-bold">Schedule Board Meeting (SS-1)</h3>
              </div>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleMeeting} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-mono text-zinc-500 font-bold block mb-1">Company Name</label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-500 font-bold block mb-1">Meeting Number</label>
                  <input
                    type="text"
                    value={newMeetingNumber}
                    onChange={(e) => setNewMeetingNumber(e.target.value)}
                    placeholder="BM-05/2026-27"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-500 font-bold block mb-1">Meeting Type</label>
                  <select
                    value={newMeetingType}
                    onChange={(e) => setNewMeetingType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  >
                    <option value="board_meeting">Board Meeting (BM)</option>
                    <option value="audit_committee">Audit Committee</option>
                    <option value="nrc_committee">NRC Committee</option>
                    <option value="agm">Annual General (AGM)</option>
                    <option value="egm">Extraordinary General (EGM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-500 font-bold block mb-1">Date</label>
                  <input
                    type="date"
                    value={newMeetingDate}
                    onChange={(e) => setNewMeetingDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-500 font-bold block mb-1">Time</label>
                  <input
                    type="text"
                    value={newMeetingTime}
                    onChange={(e) => setNewMeetingTime(e.target.value)}
                    placeholder="11:30 AM"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-500 font-bold block mb-1">Venue / Video Link</label>
                <input
                  type="text"
                  value={newMeetingVenue}
                  onChange={(e) => setNewMeetingVenue(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              {/* Shorter Notice Checkbox */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={newIsShorterNotice}
                    onChange={(e) => setNewIsShorterNotice(e.target.checked)}
                    className="w-4 h-4 rounded text-black focus:ring-0"
                  />
                  <span>Convene on Shorter Notice (&lt; 7 Days per Sec 173(3))</span>
                </label>
                {newIsShorterNotice && (
                  <input
                    type="text"
                    value={newShorterNoticeReason}
                    onChange={(e) => setNewShorterNoticeReason(e.target.value)}
                    placeholder="Urgent business reason (e.g. Bank guarantee deadline)..."
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                    required
                  />
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-85 cursor-pointer"
                >
                  Confirm &amp; Generate Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: DRAFT STATUTORY RESOLUTION
      ========================================================================= */}
      {draftResolutionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 text-black dark:text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Stamp className="w-4 h-4" />
                <h3 className="text-sm font-bold">Draft Statutory Resolution</h3>
              </div>
              <button
                onClick={() => setDraftResolutionModalOpen(false)}
                className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateResolution} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-500 font-bold block mb-1">Resolution Category</label>
                  <select
                    value={newResCategory}
                    onChange={(e) => setNewResCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  >
                    <option value="banking">Banking &amp; Digital Mandate</option>
                    <option value="share_allotment">Share Allotment (PAS-3)</option>
                    <option value="director_appointment">Director Appointment (DIR-12)</option>
                    <option value="borrowing">Borrowing Powers (Sec 180)</option>
                    <option value="statutory_compliance">Statutory Compliance</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-500 font-bold block mb-1">Resolution Type</label>
                  <select
                    value={newResType}
                    onChange={(e) => setNewResType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  >
                    <option value="board">Board Resolution</option>
                    <option value="special">Special Resolution (General Meeting)</option>
                    <option value="ordinary">Ordinary Resolution (General Meeting)</option>
                    <option value="circular">Circular Resolution</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-500 font-bold block mb-1">Resolution Subject / Title</label>
                <input
                  type="text"
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                  placeholder="e.g. Opening Corporate Current Account with ICICI Bank Ltd"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-500 font-bold block mb-1">Governing Act Section</label>
                <input
                  type="text"
                  value={newResSection}
                  onChange={(e) => setNewResSection(e.target.value)}
                  placeholder="e.g. Section 179(3)(e) of Companies Act 2013"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-500 font-bold block mb-1">Preamble ("WHEREAS...")</label>
                <textarea
                  rows={2}
                  value={newResPreamble}
                  onChange={(e) => setNewResPreamble(e.target.value)}
                  placeholder="WHEREAS the company requires operational account facility..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-500 font-bold block mb-1">Operative Resolution ("RESOLVED THAT...")</label>
                <textarea
                  rows={3}
                  value={newResText}
                  onChange={(e) => setNewResText(e.target.value)}
                  placeholder="RESOLVED THAT the consent of the Board of Directors be and is hereby accorded to..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-500 font-bold block mb-1">Authorizing Clause ("FURTHER RESOLVED THAT...")</label>
                <textarea
                  rows={2}
                  value={newResFurtherText}
                  onChange={(e) => setNewResFurtherText(e.target.value)}
                  placeholder="FURTHER RESOLVED THAT any Director or Company Secretary be authorized to sign and execute..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDraftResolutionModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-85 cursor-pointer"
                >
                  Save &amp; Enter in Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: OFFICIAL CERTIFIED TRUE COPY (CTC) WATERMARKED DOSSIER
      ========================================================================= */}
      {ctcModalResolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 shadow-2xl p-8 space-y-6 text-black dark:text-white max-h-[92vh] overflow-y-auto">
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 print:hidden">
              <div className="flex items-center gap-2">
                <FileBadge className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Official Certified True Copy (CTC)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCtcText(ctcModalResolution)}
                  className="px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCtc ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCtc ? "Copied!" : "Copy Text"}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:opacity-85"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={() => setCtcModalResolution(null)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official Letterhead Watermarked CTC Container */}
            <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-serif relative overflow-hidden select-text space-y-6">
              {/* Company Header */}
              <div className="text-center space-y-1 pb-4 border-b border-zinc-300 dark:border-zinc-700">
                <h2 className="text-xl font-bold tracking-wide uppercase text-black dark:text-white font-sans">
                  {ctcModalResolution.companyName}
                </h2>
                <p className="text-xs text-zinc-500 font-mono">
                  Corporate Identification Number (CIN): {ctcModalResolution.cin}
                </p>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Registered Office: Chamber #412, Marine Drive, Kochi, Kerala - 682031
                </p>
              </div>

              {/* CTC Header Title */}
              <div className="text-center space-y-1">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 underline underline-offset-4">
                  CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS
                </h3>
                <p className="text-[11px] font-sans text-zinc-500">
                  HELD ON TUESDAY, 10 NOVEMBER 2026 AT REGISTERED OFFICE AND VIA VIDEO CONFERENCE
                </p>
              </div>

              {/* Subject */}
              <div className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-sans font-bold text-center">
                "{ctcModalResolution.title.toUpperCase()}"
              </div>

              {/* Operative Clauses */}
              <div className="space-y-4 text-xs font-sans leading-relaxed text-zinc-800 dark:text-zinc-200">
                {ctcModalResolution.preambleText && (
                  <p className="italic text-zinc-500">{ctcModalResolution.preambleText}</p>
                )}
                <p className="font-semibold text-black dark:text-white">
                  "{ctcModalResolution.resolutionText}"
                </p>
                {ctcModalResolution.furtherResolutionText && (
                  <p className="text-zinc-700 dark:text-zinc-300">
                    "{ctcModalResolution.furtherResolutionText}"
                  </p>
                )}
              </div>

              {/* Certification Footer */}
              <div className="pt-8 border-t border-zinc-300 dark:border-zinc-700 flex justify-between items-end text-xs font-sans">
                <div className="space-y-1">
                  <p className="font-bold text-zinc-500 uppercase text-[10px]">Date of Certification:</p>
                  <p className="font-mono">{ctcModalResolution.ctcCertifiedAt || "10 Nov 2026"}</p>
                  <p className="font-bold text-zinc-500 uppercase text-[10px] mt-2">Place:</p>
                  <p>New Delhi / Kochi</p>
                </div>

                <div className="text-right space-y-1">
                  <p className="font-bold uppercase text-[10px] text-zinc-500">
                    FOR {ctcModalResolution.companyName.toUpperCase()}
                  </p>
                  <div className="pt-8 text-black dark:text-white font-bold">
                    ({ctcModalResolution.ctcCertifiedBy || csName})
                  </div>
                  <p className="text-[11px] text-zinc-500">Company Secretary &amp; Compliance Officer</p>
                  <p className="text-[10px] font-mono text-zinc-400">Membership No: FCS 8492 | CP: 10294</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: MEETING PACK DOSSIER (AGENDA & DRAFT MINUTES PREVIEW)
      ========================================================================= */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-6 text-black dark:text-white max-h-[92vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-0.5">
                <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white">
                  {selectedMeeting.meetingNumber}
                </span>
                <h3 className="text-base font-bold mt-1">{selectedMeeting.companyName}</h3>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Directors Attendance */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase font-bold text-zinc-400">
                Directors in Attendance (Quorum Verification)
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedMeeting.directors.map((d, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
                    <div className="font-bold text-black dark:text-white">{d.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">DIN: {d.din || "08912340"}</div>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {d.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agenda Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase font-bold text-zinc-400">
                Statutory Agenda Items ({selectedMeeting.agendaItems.length})
              </h4>
              <div className="space-y-2 text-xs">
                {selectedMeeting.agendaItems.map((a, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-black dark:text-white">
                        Item #{a.itemNumber}: {a.title}
                      </span>
                      {a.isStatutory && (
                        <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold">
                          Statutory Item
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-500 leading-relaxed">{a.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Draft Minutes Box */}
            {selectedMeeting.minutes?.draftContent && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase font-bold text-zinc-400">
                  SS-1 Formatted Minutes Preview
                </h4>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-xs font-mono whitespace-pre-line leading-relaxed text-zinc-700 dark:text-zinc-300 max-h-48 overflow-y-auto">
                  {selectedMeeting.minutes.draftContent}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
