"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  ShieldCheck,
  Search,
  Users,
  Scale,
  History,
  Calendar,
  FolderLock,
  FileText,
  Video,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  ExternalLink,
  FileCheck2,
  X,
  ChevronRight,
  Star,
  Award,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Advocate, mockAdvocates } from "@/components/client/AdvocateSearchAndMatch";

export interface AssignedMatterInfo {
  id: string;
  advocateId: string;
  advocateName: string;
  caseNo: string;
  cnr: string;
  court: string;
  status: "Active Stay Granted" | "Pre-Trial • Evidence Stage" | "Arbitration Active" | "Statutory Notice Phase";
  statusColor: string;
  nextSittingDate: string;
  nextSittingDetails: {
    bench: string;
    itemNo: string;
    hall: string;
    time: string;
    purpose: string;
  };
  documentCount: number;
  title: string;
  synopsis: string;
  keyReliefs: string[];
  recentHistory: { date: string; event: string }[];
}

const DEFAULT_ASSIGNED_MATTERS: Record<string, AssignedMatterInfo> = {
  "adv-meera": {
    id: "mat_wpc_19482",
    advocateId: "adv-meera",
    advocateName: "Adv. Meera Krishnan",
    caseNo: "WP(C) 19482/2024",
    cnr: "KCHC01-019482-2024",
    court: "High Court of Kerala (Court Hall 2A)",
    status: "Active Stay Granted",
    statusColor: "emerald",
    nextSittingDate: "12 Nov 2026",
    nextSittingDetails: {
      bench: "Hon'ble Mr. Justice P.B. Suresh Kumar & Hon'ble Mr. Justice C. Pratheep Kumar",
      itemNo: "Item No. 18 (Motion List)",
      hall: "Court Hall 2A, Ernakulam",
      time: "10:15 AM",
      purpose: "Hearing on stay extension & KSEB compliance affidavit",
    },
    documentCount: 8,
    title: "WP(C) 19482/2024 — Gopakumar Nambiar v. Kerala State Electricity Board & Anr.",
    synopsis:
      "Writ petition under Article 226 of Constitution of India challenging unauthorized high-tension overhead line alignment cutting across cultivated rubber holding without serving prior written notice under Section 16 of Indian Telegraph Act, 1885.",
    keyReliefs: [
      "Writ of Certiorari quashing unilateral transmission deviation order.",
      "Writ of Mandamus directing District Magistrate to hear Section 16(1) objections.",
      "Interim stay restraining KSEB contractors from felling standing yielding trees.",
    ],
    recentHistory: [
      {
        date: "16 Oct 2026",
        event: "Daily order passed extending interim stay against line erection for 4 weeks.",
      },
      {
        date: "04 Oct 2026",
        event: "Reply affidavit submitted countering KSEB Assistant Executive Engineer's statement.",
      },
      {
        date: "14 Jun 2024",
        event: "Writ admitted; notice issued to KSEB & District Magistrate with ad-interim stay.",
      },
    ],
  },
  "adv-sarah": {
    id: "mat_os_412",
    advocateId: "adv-sarah",
    advocateName: "Adv. Sarah Jenkins",
    caseNo: "OS 412/2023",
    cnr: "KCER02-000412-2023",
    court: "Principal Munsiff Court, Ernakulam",
    status: "Pre-Trial • Evidence Stage",
    statusColor: "blue",
    nextSittingDate: "04 Nov 2026",
    nextSittingDetails: {
      bench: "Principal Munsiff, Ernakulam",
      itemNo: "Item No. 7 (Trial List)",
      hall: "Court Room No. 3",
      time: "11:00 AM",
      purpose: "Plaintiff witness cross-examination & survey commissioner sketch verification",
    },
    documentCount: 6,
    title: "OS 412/2023 — Gopakumar Nambiar v. Varghese Builders & Developers",
    synopsis:
      "Original Civil Suit for permanent prohibitory injunction and boundary demarcation regarding 32 Ares of ancestral Jenmam property against encroachment during adjacent commercial construction.",
    keyReliefs: [
      "Decree of permanent prohibitory injunction against boundary alteration.",
      "Advocate Commissioner survey report confirmation under Order XXVI CPC.",
      "Restoration of natural drainage easement along western property boundary.",
    ],
    recentHistory: [
      {
        date: "20 Sep 2026",
        event: "Advocate Commissioner submitted verified re-survey sketch with revenue seal.",
      },
      {
        date: "12 Aug 2026",
        event: "Defendant's written statement taken on record; preliminary issues framed.",
      },
      {
        date: "18 Nov 2023",
        event: "Interim injunction granted under Order XXXIX Rules 1 & 2 CPC.",
      },
    ],
  },
  "adv-rajesh": {
    id: "mat_nclt_041",
    advocateId: "adv-rajesh",
    advocateName: "Adv. Rajesh V. Varma",
    caseNo: "ARB/NCLT/KOCHI/2024/041",
    cnr: "KLNCLT-000041-2024",
    court: "NCLT Kochi Bench & Commercial Arbitral Tribunal",
    status: "Arbitration Active",
    statusColor: "purple",
    nextSittingDate: "18 Nov 2026",
    nextSittingDetails: {
      bench: "Sole Arbitrator (Hon'ble Retd. High Court Judge)",
      itemNo: "Arbitration Hearing Slot 2",
      hall: "Chamber Hall 4, Marine Drive, Kochi",
      time: "02:30 PM",
      purpose: "Section 17 interim relief arguments and admission of documentary ledger exhibits",
    },
    documentCount: 5,
    title: "ARB/NCLT/KOCHI/2024/041 — Malabar Infotech Solutions v. Coastal Logistics",
    synopsis:
      "Commercial arbitration under Arbitration and Conciliation Act, 1996 for recovery of outstanding milestone software licensing dues and breach of exclusive maintenance agreement covenants.",
    keyReliefs: [
      "Award for recovery of Rs. 48.6 Lakhs with 18% commercial interest.",
      "Interim preservation of escrow deposits under Section 17.",
      "Indemnity against unauthorized proprietary code deployment.",
    ],
    recentHistory: [
      {
        date: "10 Oct 2026",
        event: "Statement of Defence and Counter-claim filed by Coastal Logistics.",
      },
      {
        date: "15 Sep 2026",
        event: "Arbitral Tribunal constituted following Section 11 High Court appointment.",
      },
    ],
  },
  "adv-priya": {
    id: "mat_cc_892",
    advocateId: "adv-priya",
    advocateName: "Adv. Priya Nair",
    caseNo: "CC 892/2024",
    cnr: "KLDCDRC-000892-2024",
    court: "District Consumer Commission, Ernakulam",
    status: "Statutory Notice Phase",
    statusColor: "amber",
    nextSittingDate: "25 Nov 2026",
    nextSittingDetails: {
      bench: "President & Members, DCDRC Ernakulam",
      itemNo: "Item No. 12 (Admission)",
      hall: "Consumer Court Hall, Vytilla",
      time: "11:30 AM",
      purpose: "Filing of Opposite Party written version & mediation exploration",
    },
    documentCount: 4,
    title: "CC 892/2024 — Gopakumar v. Apex Electrical Infra Pvt Ltd",
    synopsis:
      "Consumer complaint under Section 35 of Consumer Protection Act, 2019 claiming compensation for defective high-voltage transformer installation and continuous property nuisance.",
    keyReliefs: [
      "Full refund of equipment consideration with 12% interest.",
      "Compensation of Rs. 5 Lakhs for mental agony and property damage.",
      "Litigation costs of Rs. 25,000.",
    ],
    recentHistory: [
      {
        date: "08 Oct 2026",
        event: "Notice served through registered speed post; postal delivery confirmed.",
      },
      {
        date: "18 Sep 2026",
        event: "Complaint admitted; registry summons issued to Opposite Party.",
      },
    ],
  },
};

const ASSIGNED_ADVOCATES_LIST: Advocate[] = [
  {
    id: "adv-meera",
    name: "Adv. Meera Krishnan",
    title: "Senior Counsel • High Court Writs",
    location: "Ernakulam, Kerala",
    experience: "16+ Years Experience",
    rating: 4.9,
    reviewsCount: 168,
    matchScore: 99,
    specialties: ["Constitutional Law", "High Court Writs", "Administrative Law"],
    fee: "₹3,500 / session",
    barCouncilNumber: "K/001429/2012",
  },
  {
    id: "adv-sarah",
    name: "Adv. Sarah Jenkins",
    title: "Senior Property & Tenancy Advocate",
    location: "Kochi, Kerala",
    experience: "12+ Years Experience",
    rating: 4.9,
    reviewsCount: 142,
    matchScore: 98,
    specialties: ["Tenancy Disputes", "Real Estate Agreements", "Deposit Recovery"],
    fee: "₹2,500 / session",
    barCouncilNumber: "K/001429/2012",
  },
  {
    id: "adv-rajesh",
    name: "Adv. Rajesh V. Varma",
    title: "Civil & Commercial Contract Specialist",
    location: "Trivandrum, Kerala",
    experience: "15+ Years Experience",
    rating: 4.8,
    reviewsCount: 98,
    matchScore: 94,
    specialties: ["Contract Review", "Sublease Indemnity", "Commercial Disputes"],
    fee: "₹3,000 / session",
    barCouncilNumber: "K/000892/2008",
  },
  {
    id: "adv-priya",
    name: "Adv. Priya Nair",
    title: "Family Law & Civil Rights Advocate",
    location: "Kollam, Kerala",
    experience: "9+ Years Experience",
    rating: 4.9,
    reviewsCount: 116,
    matchScore: 89,
    specialties: ["Matrimonial Law", "Property Partition", "Consumer Complaints"],
    fee: "₹2,000 / session",
    barCouncilNumber: "K/002105/2017",
  },
];

interface MyAdvocatesViewProps {
  onOpenConsultation?: (advocate: Advocate) => void;
  onOpenBooking?: (advocate: Advocate) => void;
  onNavigateTab?: (tab: string) => void;
  initialSelectedMatter?: string;
}

export function MyAdvocatesView({
  onOpenConsultation,
  onOpenBooking,
  onNavigateTab,
}: MyAdvocatesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPracticeArea, setSelectedPracticeArea] = useState("all");
  const [selectedAdvocateId, setSelectedAdvocateId] = useState<string>("adv-meera");
  const [sittingModalOpen, setSittingModalOpen] = useState(false);

  // Filter advocates based on search and practice area
  const filteredAdvocates = useMemo(() => {
    return ASSIGNED_ADVOCATES_LIST.filter((adv) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        adv.name.toLowerCase().includes(q) ||
        adv.title.toLowerCase().includes(q) ||
        adv.location.toLowerCase().includes(q) ||
        adv.barCouncilNumber?.toLowerCase().includes(q) ||
        adv.specialties.some((s) => s.toLowerCase().includes(q));

      const matchArea =
        selectedPracticeArea === "all" ||
        adv.specialties.some((s) =>
          s.toLowerCase().includes(selectedPracticeArea.toLowerCase())
        );

      return matchSearch && matchArea;
    });
  }, [searchTerm, selectedPracticeArea]);

  // Resolve current active matter for the selected advocate
  const currentMatter =
    DEFAULT_ASSIGNED_MATTERS[selectedAdvocateId] ||
    DEFAULT_ASSIGNED_MATTERS["adv-meera"];

  const currentAdvocate =
    ASSIGNED_ADVOCATES_LIST.find((a) => a.id === selectedAdvocateId) ||
    ASSIGNED_ADVOCATES_LIST[0];

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6">
      {/* =========================================================================
          HEADER: Matches Image 2 Screenshot Exactly
          Verified Advocate Directory / Search Verified Advocates
      ========================================================================= */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-6 sm:p-7 space-y-5 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-widest text-zinc-500 uppercase flex items-center gap-1.5 mb-1 font-mono">
              <Sparkles className="w-4 h-4 text-black dark:text-white" />
              Verified Advocate Directory
            </span>
            <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">
              Search Verified Advocates
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500">
              Find Bar-enrolled advocates matched to your legal matter.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white font-bold self-start md:self-auto shrink-0 shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Bar-Verified Advocates</span>
          </div>
        </div>

        {/* Search Bar & Specialty Filter Controls matching Screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by advocate name, legal issue, or city..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedPracticeArea}
              onChange={(e) => setSelectedPracticeArea(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer font-medium"
            >
              <option value="all">All Practice Areas (10)</option>
              <option value="Constitutional">Constitutional &amp; High Court Writs</option>
              <option value="Tenancy">Property &amp; Tenancy Law</option>
              <option value="Commercial">Commercial &amp; Contract Law</option>
              <option value="Consumer">Consumer &amp; Family Law</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN PAGE: Divided as Two Sections (Exact match to handwritten sketch)
          1. My Advocates (Left Column)
          2. Assigned Matter & Matter Details (Right Column)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =====================================================================
            SECTION 1: My Advocates (Left Column - ~5 Cols)
        ===================================================================== */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2 font-mono">
              <Users className="w-4 h-4" />
              My Advocates
            </h3>
            <span className="text-[11px] font-mono text-zinc-400">
              {filteredAdvocates.length} Retained Counsels
            </span>
          </div>

          {/* Advocates Cards List */}
          <div className="space-y-3.5">
            {filteredAdvocates.map((adv) => {
              const isSelected = selectedAdvocateId === adv.id;
              const matterForAdv = DEFAULT_ASSIGNED_MATTERS[adv.id];

              return (
                <div
                  key={adv.id}
                  onClick={() => setSelectedAdvocateId(adv.id)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer space-y-3.5 shadow-2xs ${
                    isSelected
                      ? "border-black dark:border-white bg-zinc-50 dark:bg-zinc-900/60 ring-1 ring-black dark:ring-white"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-zinc-400"
                  }`}
                >
                  {/* Top info row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {adv.name.replace("Adv.", "").trim().slice(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-black text-sm text-black dark:text-white hover:underline">
                            {adv.name}
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-zinc-400">
                            • {adv.barCouncilNumber}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                          {adv.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 pt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {adv.location}
                          </span>
                          <span>•</span>
                          <span>{adv.experience}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-xs font-bold text-black dark:text-white">
                        {adv.fee}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        ⭐ {adv.rating} ({adv.reviewsCount})
                      </span>
                    </div>
                  </div>

                  {/* Assigned Matter Pill */}
                  {matterForAdv && (
                    <div className="p-2 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 font-medium">Assigned Case:</span>
                      <span className="font-mono font-bold text-black dark:text-white truncate max-w-[200px]">
                        {matterForAdv.caseNo}
                      </span>
                    </div>
                  )}

                  {/* Two Buttons matching sketch: [ Consultation ] [ Book call ] */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenConsultation?.(adv);
                      }}
                      className="py-2 px-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Consultation</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBooking?.(adv);
                      }}
                      className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book call</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredAdvocates.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                No retained advocates match your search.
              </div>
            )}
          </div>
        </div>

        {/* =====================================================================
            SECTION 2: Assigned Matter & Matter Details (Right Column - ~7 Cols)
        ===================================================================== */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section Header: Assigned Matter */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2 font-mono">
              <Scale className="w-4 h-4" />
              Assigned Matter
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
              Counsel: {currentAdvocate.name}
            </span>
          </div>

          {/* Top Card: Status, Case no, CNR, Court + 3 Buttons (View timeline, Next sitting, Documents) */}
          <div className="p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black space-y-5 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                  Status:
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-bold text-black dark:text-white">
                    {currentMatter.status}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                  Case no:
                </span>
                <span className="font-mono font-bold text-black dark:text-white block">
                  {currentMatter.caseNo}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                  CNR:
                </span>
                <span className="font-mono text-zinc-600 dark:text-zinc-400 block">
                  {currentMatter.cnr}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                  Court:
                </span>
                <span className="font-semibold text-black dark:text-white block">
                  {currentMatter.court}
                </span>
              </div>
            </div>

            {/* The 3 Action Buttons / Pills from the Sketch: [ View timeline ] [ Next sitting ] [ Documents ] */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab?.("task-and-timeline")}
                className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>View timeline</span>
              </button>

              <button
                type="button"
                onClick={() => setSittingModalOpen(true)}
                className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Next sitting</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab?.("documents")}
                className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <FolderLock className="w-3.5 h-3.5" />
                <span>Documents ({currentMatter.documentCount})</span>
              </button>
            </div>
          </div>

          {/* Lower Section Header: Matter Details */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800 pt-2">
            <h4 className="text-sm font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2 font-mono">
              <FileText className="w-4 h-4" />
              Matter Details
            </h4>
            <span className="text-[11px] font-mono text-zinc-400">
              Vakalatnama on record
            </span>
          </div>

          {/* Matter Details Container matching Sketch */}
          <div className="p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black space-y-5 shadow-2xs">
            {/* Title & Synopsis */}
            <div className="space-y-2">
              <h4 className="text-base font-black text-black dark:text-white leading-snug">
                {currentMatter.title}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {currentMatter.synopsis}
              </p>
            </div>

            {/* Counsel & Chamber Details */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center shrink-0">
                  {currentAdvocate.name.replace("Adv.", "").trim().slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-black dark:text-white block">
                    {currentAdvocate.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Retained Counsel • {currentAdvocate.barCouncilNumber}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenConsultation?.(currentAdvocate)}
                  className="px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black font-bold text-[11px] cursor-pointer hover:opacity-90"
                >
                  Consult Counsel
                </button>
              </div>
            </div>

            {/* Key Prayers / Reliefs Claimed */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black dark:text-white block">
                Substantive Reliefs Claimed:
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                {currentMatter.keyReliefs.map((relief, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-black dark:text-white" />
                    <span>{relief}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Daily Orders / Procedural Milestones */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                Recent Court Proceedings &amp; Daily Orders:
              </span>
              <div className="space-y-2">
                {currentMatter.recentHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs flex items-start gap-3"
                  >
                    <span className="font-mono text-[10px] font-bold text-black dark:text-white shrink-0 mt-0.5">
                      {item.date}
                    </span>
                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {item.event}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[11px] font-mono text-zinc-400">
                Certified eCourts Registry Sync Active
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab?.("document-filing")}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>File Document</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab?.("task-and-timeline")}
                  className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer hover:opacity-90 flex items-center gap-1.5"
                >
                  <span>Full Docket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Sitting Modal */}
      {sittingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white">
                  eCourts Hearing Schedule
                </span>
                <h3 className="text-lg font-black text-black dark:text-white mt-1">
                  Next Sitting Details
                </h3>
                <p className="text-xs text-zinc-500 font-mono">
                  {currentMatter.caseNo} • {currentMatter.court}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSittingModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Sitting Date &amp; Time:</span>
                <span className="font-bold text-black dark:text-white font-mono">
                  {currentMatter.nextSittingDate} • {currentMatter.nextSittingDetails.time}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-500 block">Court Hall &amp; Item:</span>
                <span className="font-semibold text-black dark:text-white block">
                  {currentMatter.nextSittingDetails.hall} ({currentMatter.nextSittingDetails.itemNo})
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-500 block">Presiding Bench:</span>
                <span className="font-semibold text-black dark:text-white block">
                  {currentMatter.nextSittingDetails.bench}
                </span>
              </div>
              <div className="space-y-1 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500 block">Stage &amp; Purpose:</span>
                <span className="text-zinc-700 dark:text-zinc-300 block">
                  {currentMatter.nextSittingDetails.purpose}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSittingModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
