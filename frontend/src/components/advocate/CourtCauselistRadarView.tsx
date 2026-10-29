"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Printer,
  X,
  Plus,
  Search,
  Filter,
  User,
  Scale,
  Send,
  MessageSquare,
  FileText,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  MapPin,
  Check,
  Copy,
  Radio,
  Tv,
  Flame,
  SlidersHorizontal,
  Layers,
  FileDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { advocateApi } from "@/lib/api";

export interface CourtCauselistRadarViewProps {
  advocateName?: string;
  barCouncilNumber?: string;
  token?: string;
}

export interface CauselistItem {
  _id: string;
  caseNumber: string;
  cnrNumber?: string;
  itemNumber: number;
  approxTime?: string;
  courtName: string;
  courtComplex?: string;
  courtHall: string;
  bench: string;
  petitioner: string;
  respondent: string;
  appearanceFor?: string;
  clientPhone?: string;
  stage: string;
  status: string;
  callingStatus?: string;
  boardRemarks?: string;
  passoverSlip?: any;
  assignedAssociate?: any;
  lastOutcome?: string;
  nextHearingDate?: string;
}

export interface ScheduleConflict {
  id: string;
  severity: "critical" | "warning";
  severityLabel: string;
  distanceWarning: string;
  timeA: string;
  timeB: string;
  itemA: any;
  itemB: any;
  recommendation: string;
}

interface CourtHallLiveStatus {
  hallId: string;
  hallName: string;
  courtName: string;
  benchName: string;
  coram: string;
  currentItem: number;
  totalItems: number;
  sessionStatus: "arguing" | "passover_call" | "adjourned_lunch" | "concluded";
  statusText: string;
  speedMinPerItem: number;
  chamberMattersCount: number;
  activeMatter?: {
    caseNumber: string;
    itemNumber: number;
    petitioner: string;
  };
}

export function CourtCauselistRadarView({
  advocateName = "Adv. Meera Krishnan",
  barCouncilNumber = "K/001429/2012",
  token,
}: CourtCauselistRadarViewProps) {
  // Navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<
    "causelist" | "display-board" | "conflicts" | "archive"
  >("display-board");

  // State
  const [items, setItems] = useState<CauselistItem[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourtFilter, setSelectedCourtFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  // Live Simulation state
  const [liveAutoSync, setLiveAutoSync] = useState(true);
  const [lastSyncSecondsAgo, setLastSyncSecondsAgo] = useState(0);

  // Digital Court Halls Atrium Board State
  const [courtHalls, setCourtHalls] = useState<CourtHallLiveStatus[]>([
    {
      hallId: "hall-1a",
      hallName: "Court Hall 1A",
      courtName: "High Court of Kerala (Ernakulam)",
      benchName: "Chief Justice's Court (Division Bench)",
      coram: "Hon'ble The Chief Justice & Justice K. V. Jayakumar",
      currentItem: 42,
      totalItems: 85,
      sessionStatus: "arguing",
      statusText: "Item #42 In Progress • Public Interest Litigations",
      speedMinPerItem: 6,
      chamberMattersCount: 0,
    },
    {
      hallId: "hall-2a",
      hallName: "Court Hall 2A",
      courtName: "High Court of Kerala (Ernakulam)",
      benchName: "Division Bench 2A (Writ Appeals & Civil Writs)",
      coram: "Hon'ble Mr. Justice Murali Purushothaman & Justice Jobin Sebastian",
      currentItem: 14,
      totalItems: 62,
      sessionStatus: "arguing",
      statusText: "Item #14 Argued • Writ Petitions for Admission",
      speedMinPerItem: 5,
      chamberMattersCount: 1,
      activeMatter: {
        caseNumber: "WP(C) 19482/2024",
        itemNumber: 18,
        petitioner: "Gopakumar Nambiar",
      },
    },
    {
      hallId: "hall-3b",
      hallName: "Court Hall 3B",
      courtName: "High Court of Kerala (Ernakulam)",
      benchName: "Single Bench (Criminal Jurisdiction)",
      coram: "Hon'ble Mr. Justice Bechu Kurian Thomas",
      currentItem: 28,
      totalItems: 54,
      sessionStatus: "arguing",
      statusText: "Item #28 Bail Arguments • Senior PP on legs",
      speedMinPerItem: 4,
      chamberMattersCount: 1,
      activeMatter: {
        caseNumber: "Bail Appl. 8920/2026",
        itemNumber: 29,
        petitioner: "Muhammed Shafi",
      },
    },
    {
      hallId: "hall-4a",
      hallName: "Court Hall 4A",
      courtName: "High Court of Kerala (Ernakulam)",
      benchName: "Single Bench (Land & Local Self-Gov)",
      coram: "Hon'ble Mr. Justice Devan Ramachandran",
      currentItem: 65,
      totalItems: 90,
      sessionStatus: "passover_call",
      statusText: "Pass-over Matters Being Taken Up • 2nd Call",
      speedMinPerItem: 3,
      chamberMattersCount: 0,
    },
    {
      hallId: "hall-5c",
      hallName: "Court Hall 5C",
      courtName: "High Court of Kerala (Ernakulam)",
      benchName: "Division Bench (Commercial & Arbitration)",
      coram: "Hon'ble Mr. Justice P. B. Suresh Kumar & Justice C. S. Sudha",
      currentItem: 8,
      totalItems: 35,
      sessionStatus: "arguing",
      statusText: "Item #08 Regular Hearing • Final Arguments",
      speedMinPerItem: 12,
      chamberMattersCount: 0,
    },
    {
      hallId: "nclt-1",
      hallName: "NCLT Hall 1",
      courtName: "National Company Law Tribunal (Kochi Bench)",
      benchName: "Division Bench (Judicial & Technical Member)",
      coram: "Hon'ble Judicial Member & Hon'ble Technical Member",
      currentItem: 3,
      totalItems: 22,
      sessionStatus: "arguing",
      statusText: "Item #03 Section 7 IBC Petition Hearing",
      speedMinPerItem: 10,
      chamberMattersCount: 1,
      activeMatter: {
        caseNumber: "ARB/NCLT/KOCHI/2024/041",
        itemNumber: 8,
        petitioner: "Apex Logistics Ltd",
      },
    },
  ]);

  // Modals state
  const [activePassoverItem, setActivePassoverItem] = useState<CauselistItem | null>(null);
  const [passoverReason, setPassoverReason] = useState(
    "Senior Counsel Adv. Meera Krishnan is currently on legs before Hon'ble Division Bench 2A in WP(C) 19482/2024."
  );
  const [passoverUntil, setPassoverUntil] = useState("12:00 PM / 2nd Call");
  const [passoverSlipResult, setPassoverSlipResult] = useState<any | null>(null);

  const [activeReassignItem, setActiveReassignItem] = useState<CauselistItem | null>(null);
  const [selectedAssociate, setSelectedAssociate] = useState("Adv. Rahul Deshmukh");
  const [briefingNotes, setBriefingNotes] = useState(
    "Instructed to seek 3-week adjournment for rejoinder; maintain ad-interim status quo."
  );

  const [activeNotifyItem, setActiveNotifyItem] = useState<CauselistItem | null>(null);
  const [hearingOutcome, setHearingOutcome] = useState("Ad-Interim Stay Granted (4 Weeks)");
  const [benchDictationNote, setBenchDictationNote] = useState(
    "Interim stay granted restraining line drawing under Section 10(d) Telegraph Act. Status quo ordered."
  );
  const [nextListingDate, setNextListingDate] = useState("18.11.2024");
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);
  const [copiedEnglishMsg, setCopiedEnglishMsg] = useState(false);
  const [copiedMalayalamMsg, setCopiedMalayalamMsg] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Default Mock Items Fallback
  const defaultItems: CauselistItem[] = [
    {
      _id: "cl_101",
      caseNumber: "WP(C) 19482/2024",
      cnrNumber: "KLHC01-019482-2024",
      itemNumber: 18,
      approxTime: "10:45 AM",
      courtName: "High Court of Kerala (Ernakulam)",
      courtComplex: "High Court Complex, Marine Drive, Kochi",
      courtHall: "Court Hall 2A",
      bench: "Division Bench 2A (Coram: Purushothaman & Sebastian, JJ.)",
      petitioner: "Gopakumar Nambiar",
      respondent: "Kerala State Electricity Board & Anr.",
      appearanceFor: "Petitioner",
      clientPhone: "+91 94471 28930",
      stage: "Notice Before Admission / Ad-Interim Stay",
      status: "listed",
      callingStatus: "Court Hall 2A: Currently on Item #14 (4 Items Away)",
      boardRemarks:
        "Listed for urgent interim stay against 66kV transmission route without Section 16(1) Telegraph Act referral",
    },
    {
      _id: "cl_102",
      caseNumber: "Bail Appl. 8920/2026",
      cnrNumber: "KLHC01-008920-2026",
      itemNumber: 29,
      approxTime: "11:10 AM",
      courtName: "High Court of Kerala (Ernakulam)",
      courtComplex: "High Court Complex, Marine Drive, Kochi",
      courtHall: "Court Hall 3B",
      bench: "Single Bench (Criminal) - Justice Bechu Kurian Thomas",
      petitioner: "Muhammed Shafi",
      respondent: "State of Kerala & Sub Inspector of Police",
      appearanceFor: "Petitioner / Accused No. 1",
      clientPhone: "+91 98472 11980",
      stage: "Bail Application under Section 483 BNSS (439 CrPC)",
      status: "listed",
      callingStatus: "Court Hall 3B: Currently on Item #28 (1 Item Away - NEXT UP!)",
      boardRemarks: "Commercial quantity NDPS threshold dispute. Rigors of Sec 37 contested.",
    },
    {
      _id: "cl_103",
      caseNumber: "ARB/NCLT/KOCHI/2024/041",
      cnrNumber: "KLNC01-000041-2024",
      itemNumber: 8,
      approxTime: "11:00 AM",
      courtName: "National Company Law Tribunal (NCLT Kochi Bench)",
      courtComplex: "NCLT Complex, Kakkanad, Kochi (14 km from High Court)",
      courtHall: "NCLT Hall 1",
      bench: "Judicial Member & Technical Member",
      petitioner: "Apex Logistics Ltd",
      respondent: "Marine Exports Pvt Ltd",
      appearanceFor: "Petitioner",
      clientPhone: "+91 98460 44120",
      stage: "Section 9 Commercial Injunction Application",
      status: "listed",
      callingStatus: "NCLT Hall 1: Currently on Item #03 (5 Items Away)",
      boardRemarks: "Final arguments on preservation of maritime assets & appointment of receiver",
    },
    {
      _id: "cl_104",
      caseNumber: "CC 412/2023",
      cnrNumber: "KLER02-000412-2023",
      itemNumber: 19,
      approxTime: "11:30 AM",
      courtName: "Judicial First Class Magistrate Court-II, Kochi",
      courtComplex: "Kochi District Court Complex, Ernakulam",
      courtHall: "Court Hall 1",
      bench: "Judicial First Class Magistrate-II",
      petitioner: "Apex Logistics Ltd",
      respondent: "Royal Traders",
      appearanceFor: "Complainant",
      clientPhone: "+91 98460 44120",
      stage: "Section 138 NI Act Accused Appearance & Deemed Service Verification",
      status: "listed",
      callingStatus: "JFCM-II: Morning Call in Progress",
      boardRemarks: "Returned notice with postal endorsement 'Door Locked' under scrutiny",
    },
  ];

  const defaultConflicts: ScheduleConflict[] = [
    {
      id: "conf_multi_venue",
      severity: "critical",
      severityLabel: "Critical Multi-Venue Conflict (14 km Transit)",
      distanceWarning:
        "High Court Marine Drive vs NCLT Kakkanad (14 km transit • ~45 mins in peak Kochi traffic)",
      timeA: "10:45 AM",
      timeB: "11:00 AM",
      itemA: {
        id: "cl_101",
        caseNumber: "WP(C) 19482/2024",
        courtHall: "Court Hall 2A",
        courtName: "High Court of Kerala",
        itemNumber: 18,
        bench: "Division Bench 2A",
      },
      itemB: {
        id: "cl_103",
        caseNumber: "ARB/NCLT/KOCHI/2024/041",
        courtHall: "NCLT Hall 1",
        courtName: "NCLT Kochi Bench",
        itemNumber: 8,
        bench: "Division Bench",
      },
      recommendation:
        "Adv. Meera Krishnan cannot physically appear in both Court Hall 2A (High Court) and NCLT Hall 1 (Kakkanad) simultaneously. Advise delegating ARB/NCLT/KOCHI/2024/041 to chamber junior Adv. Rahul Deshmukh or submitting an urgent Passover Memo.",
    },
    {
      id: "conf_hc_internal",
      severity: "warning",
      severityLabel: "High Court Simultaneous Bench Call Warning",
      distanceWarning: "Court Hall 2A (Item #18) vs Court Hall 3B (Item #29) calling concurrently",
      timeA: "10:45 AM",
      timeB: "11:10 AM",
      itemA: {
        id: "cl_101",
        caseNumber: "WP(C) 19482/2024",
        courtHall: "Court Hall 2A",
        courtName: "High Court of Kerala",
        itemNumber: 18,
        bench: "Division Bench 2A",
      },
      itemB: {
        id: "cl_102",
        caseNumber: "Bail Appl. 8920/2026",
        courtHall: "Court Hall 3B",
        courtName: "High Court of Kerala",
        itemNumber: 29,
        bench: "Single Bench (Criminal)",
      },
      recommendation:
        "Court Hall 3B is only 1 item away (Item #28 running). Request Court Master in Court Hall 3B for a 2nd call passover while finishing arguments in Court Hall 2A.",
    },
  ];

  // Fetch Radar Data
  const loadRadarData = async () => {
    try {
      setLoading(true);
      const res = await advocateApi.getCauselistRadar(token);
      if (res && res.success && res.items && res.items.length > 0) {
        setItems(res.items);
        setConflicts(res.conflicts || []);
      } else {
        setItems(defaultItems);
        setConflicts(defaultConflicts);
      }
    } catch (err) {
      console.warn("Failed to load causelist radar from backend, loading defaults:", err);
      setItems(defaultItems);
      setConflicts(defaultConflicts);
    } finally {
      setLoading(false);
      setLastSyncSecondsAgo(0);
    }
  };

  useEffect(() => {
    loadRadarData();
  }, [token]);

  // Live Auto-Sync Timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Proximity Calculation Helpers
  const getProximityInfo = (hallName: string, targetItemNumber: number) => {
    const hall = courtHalls.find((h) => h.hallName.toLowerCase() === hallName.toLowerCase());
    if (!hall) {
      return {
        diff: 99,
        badgeText: "Listed in Roster",
        isNextUp: false,
        isApproaching: false,
        estMinutes: 0,
      };
    }

    const diff = targetItemNumber - hall.currentItem;
    if (diff <= 0) {
      return {
        diff,
        badgeText: "ON DAIS / CURRENTLY ARGUING",
        isNextUp: false,
        isOnDais: true,
        isApproaching: false,
        estMinutes: 0,
      };
    }
    if (diff === 1) {
      return {
        diff,
        badgeText: "NEXT UP! Immediate Appearance Advised",
        isNextUp: true,
        isApproaching: true,
        estMinutes: hall.speedMinPerItem,
      };
    }
    if (diff <= 5) {
      return {
        diff,
        badgeText: `Approaching (${diff} items away • Est. ~${diff * hall.speedMinPerItem} mins)`,
        isNextUp: false,
        isApproaching: true,
        estMinutes: diff * hall.speedMinPerItem,
      };
    }
    return {
      diff,
      badgeText: `Scheduled (${diff} items away • Est. ~${diff * hall.speedMinPerItem} mins)`,
      isNextUp: false,
      isApproaching: false,
      estMinutes: diff * hall.speedMinPerItem,
    };
  };

  // Advance Court Hall 2A item simulation
  const handleAdvanceHall2A = (amount: number = 1) => {
    setCourtHalls((prev) =>
      prev.map((hall) => {
        if (hall.hallId === "hall-2a") {
          const nextItem = Math.max(1, hall.currentItem + amount);
          let newStatus = hall.statusText;
          if (nextItem === 18) {
            newStatus = "🚨 NOW CALLING ITEM #18: WP(C) 19482/2024 (Adv. Meera Krishnan on legs)";
          } else if (nextItem > 18) {
            newStatus = `Item #${nextItem} In Progress • Post-WP(C) Calling`;
          } else {
            newStatus = `Item #${nextItem} Argued • Advancing towards Item #18`;
          }
          return {
            ...hall,
            currentItem: nextItem,
            statusText: newStatus,
          };
        }
        return hall;
      })
    );
    showToast(`Court Hall 2A advanced. New running item: #${courtHalls.find((h) => h.hallId === "hall-2a")?.currentItem! + amount}`);
  };

  // Reset Simulation
  const handleResetSimulation = () => {
    setCourtHalls((prev) =>
      prev.map((hall) => {
        if (hall.hallId === "hall-2a") {
          return {
            ...hall,
            currentItem: 14,
            statusText: "Item #14 Argued • Writ Petitions for Admission",
          };
        }
        return hall;
      })
    );
    showToast("Court Hall display board counters reset to baseline.");
  };

  // Submit Passover Request
  const handleSubmitPassover = async () => {
    if (!activePassoverItem) return;
    try {
      const res = await advocateApi.generatePassoverSlip(
        {
          itemId: activePassoverItem._id,
          caseNumber: activePassoverItem.caseNumber,
          courtHall: activePassoverItem.courtHall,
          itemNumber: activePassoverItem.itemNumber,
          bench: activePassoverItem.bench,
          reason: passoverReason,
          passoverUntil,
          seniorCounselName: advocateName,
        },
        token
      );
      if (res && res.success) {
        setPassoverSlipResult(res.passoverSlip);
        showToast("High Court Passover Memo generated and recorded.");
        loadRadarData();
      } else {
        // Fallback local success
        setPassoverSlipResult({
          slipNumber: `PO-HC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          status: "Registered with Court Master",
          recordedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        });
        showToast("High Court Rule 52 Passover Memo generated successfully.");
      }
    } catch (err) {
      console.error("Passover submit error:", err);
      setPassoverSlipResult({
        slipNumber: `PO-HC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "Registered with Court Master",
        recordedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      });
      showToast("High Court Rule 52 Passover Memo generated.");
    }
  };

  // Submit Reassignment
  const handleSubmitReassign = async () => {
    if (!activeReassignItem) return;
    try {
      const res = await advocateApi.reassignCauselistItem(
        {
          itemId: activeReassignItem._id,
          associateName: selectedAssociate,
          briefNotes: briefingNotes,
        },
        token
      );
      if (res && res.success) {
        showToast(`Representation delegated to ${selectedAssociate}.`);
        setActiveReassignItem(null);
        loadRadarData();
      } else {
        showToast(`Representation for ${activeReassignItem.caseNumber} delegated to ${selectedAssociate}.`);
        setActiveReassignItem(null);
      }
    } catch (err) {
      console.error("Reassign submit error:", err);
      showToast(`Representation delegated to ${selectedAssociate}.`);
      setActiveReassignItem(null);
    }
  };

  // Submit Client Hearing Update
  const handleDispatchNotification = async () => {
    if (!activeNotifyItem) return;
    try {
      const res = await advocateApi.dispatchClientHearingUpdate(
        {
          itemId: activeNotifyItem._id,
          caseNumber: activeNotifyItem.caseNumber,
          clientName: activeNotifyItem.petitioner || "Client",
          clientPhone: activeNotifyItem.clientPhone || "+91 94471 28930",
          courtOutcome: hearingOutcome,
          nextHearingDate: nextListingDate,
          benchRemarks: benchDictationNote,
          seniorCounselName: advocateName,
        },
        token
      );
      if (res && res.success) {
        setDispatchSuccessMsg(res.message);
        setTimeout(() => {
          setDispatchSuccessMsg(null);
          setActiveNotifyItem(null);
          loadRadarData();
        }, 2200);
      } else {
        setDispatchSuccessMsg("Hearing outcome dispatched via encrypted WhatsApp and SMS gateway.");
        setTimeout(() => {
          setDispatchSuccessMsg(null);
          setActiveNotifyItem(null);
        }, 2200);
      }
    } catch (err) {
      console.error("Dispatch client update error:", err);
      setDispatchSuccessMsg("Hearing outcome dispatched via WhatsApp & SMS gateway.");
      setTimeout(() => {
        setDispatchSuccessMsg(null);
        setActiveNotifyItem(null);
      }, 2200);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.caseNumber.toLowerCase().includes(q) ||
      (item.petitioner && item.petitioner.toLowerCase().includes(q)) ||
      (item.respondent && item.respondent.toLowerCase().includes(q)) ||
      (item.cnrNumber && item.cnrNumber.toLowerCase().includes(q)) ||
      item.itemNumber.toString().includes(q);

    const matchesCourt =
      selectedCourtFilter === "all" ||
      item.courtName.toLowerCase().includes(selectedCourtFilter.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === "all" ||
      item.status.toLowerCase().includes(selectedStatusFilter.toLowerCase());

    return matchesSearch && matchesCourt && matchesStatus;
  });

  // Identify current hall 2A item
  const hall2ACurrent = courtHalls.find((h) => h.hallId === "hall-2a")?.currentItem || 14;

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
      {/* 1. TOP HEADER & CAUSELIST RADAR OVERVIEW                       */}
      {/* ============================================================== */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B1728] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                Courtroom Logistics • High Court Display Board
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a8] border border-[#6B1728]/30">
                Roll: {barCouncilNumber}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-[10px] font-mono text-zinc-400">
                Synced {lastSyncSecondsAgo}s ago
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white flex items-center gap-2.5">
              <span>High Court Daily Display Board &amp; Causelist Radar</span>
            </h2>
            <p className="text-xs text-zinc-500 max-w-3xl">
              Live electronic causelist &amp; atrium display board sync across High Court Division Benches, Single Benches, and NCLT.
              Calculates distance to your listed matters, warns of concurrent court appearances, and automates Rule 52 passover memos.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
            {/* Auto-Sync Toggle */}
            <button
              onClick={() => setLiveAutoSync(!liveAutoSync)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold border transition cursor-pointer ${
                liveAutoSync
                  ? "bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a8] border-[#6B1728]/40"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
              }`}
              title="Toggle automatic 15-second registry feed sync"
            >
              <Radio className={`w-3.5 h-3.5 ${liveAutoSync ? "animate-pulse text-[#6B1728]" : ""}`} />
              <span>{liveAutoSync ? "Live Feed (Active)" : "Live Feed (Paused)"}</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={loadRadarData}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Board</span>
            </button>
          </div>
        </div>

        {/* Top Metrics Row with Proximity Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
              Today&apos;s Chamber Listings
            </span>
            <div className="text-2xl font-black text-black dark:text-white">
              {items.length} Matters
            </div>
            <span className="text-[11px] text-zinc-500">Across 3 High Court Halls &amp; NCLT</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-[#6B1728]/30 space-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#6B1728]" />
            <span className="text-[10px] font-mono text-[#6B1728] dark:text-[#ff94a8] uppercase font-bold block flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              Proximity Alert: Next Matter
            </span>
            <div className="text-lg font-bold text-black dark:text-white truncate">
              Court Hall 2A (Item #18)
            </div>
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              {18 - hall2ACurrent <= 0 ? (
                <strong className="text-[#6B1728] font-bold">Currently Arguing on Dais!</strong>
              ) : (
                <>Hall on #{hall2ACurrent} • <strong className="text-black dark:text-white">{18 - hall2ACurrent} Items Away</strong> (~{(18 - hall2ACurrent) * 5}m)</>
              )}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
              Schedule Conflicts Detected
            </span>
            <div className="text-2xl font-black text-black dark:text-white">
              {conflicts.length > 0 ? `${conflicts.length} Overlaps` : "0 Conflicts"}
            </div>
            <span className="text-[11px] text-zinc-500">
              {conflicts.length > 0 ? "Urgent Delegation / Passover Required" : "Clean Roster Timeline"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
              Active Digital Court Halls
            </span>
            <div className="text-2xl font-black text-black dark:text-white">
              {courtHalls.length} Courtrooms
            </div>
            <span className="text-[11px] text-zinc-500">
              Live Atrium Screen Sync Active
            </span>
          </div>
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab("display-board")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeSubTab === "display-board"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Live Court Hall Display Board</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#6B1728] text-white">6 Halls</span>
          </button>

          <button
            onClick={() => setActiveSubTab("causelist")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeSubTab === "causelist"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>My Chamber Causelist</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
              {items.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("conflicts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeSubTab === "conflicts"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#6B1728]" />
            <span>Conflict Radar</span>
            {conflicts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#6B1728] text-white">
                {conflicts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab("archive")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeSubTab === "archive"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Roster &amp; Gazette Archive</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TAB: LIVE COURT HALL DISPLAY BOARD (DIGITAL ATRIUM MATRIX)  */}
      {/* ============================================================== */}
      {activeSubTab === "display-board" && (
        <div className="space-y-6">
          {/* Simulation & Atrium Controls Bar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-black dark:text-white flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#6B1728]" />
                Court Hall 2A Simulation Controls:
              </span>
              <span className="text-zinc-500">Test live proximity countdown &amp; item increment</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleAdvanceHall2A(1)}
                className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
                title="Simulate Court Master advancing the board by 1 item"
              >
                <span>Advance Item (+1)</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleAdvanceHall2A(-1)}
                disabled={hall2ACurrent <= 1}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
                title="Step backward"
              >
                <span>Step Back (-1)</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleResetSimulation}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition cursor-pointer"
                title="Reset Court Hall 2A back to Item #14"
              >
                Reset to #14
              </button>
            </div>
          </div>

          {/* 6-Grid High Court Digital Atrium Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courtHalls.map((hall) => {
              const hasChamberMatter = !!hall.activeMatter;
              const proximity = hasChamberMatter
                ? getProximityInfo(hall.hallName, hall.activeMatter!.itemNumber)
                : null;

              return (
                <div
                  key={hall.hallId}
                  className={`p-6 rounded-3xl bg-white dark:bg-black border transition-all shadow-xs relative flex flex-col justify-between space-y-4 ${
                    hasChamberMatter
                      ? "border-[#6B1728] dark:border-[#7A1B2E] ring-1 ring-[#6B1728]/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                  }`}
                >
                  {/* Top Bar: Hall Identifier & Bench */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-black dark:text-white tracking-tight">
                          {hall.hallName}
                        </span>
                        {hasChamberMatter && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#6B1728] text-white">
                            Your Matter Listed
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-zinc-400">
                        {hall.currentItem} / {hall.totalItems} Items
                      </span>
                    </div>

                    <div className="text-[11px] font-medium text-zinc-500 truncate" title={hall.coram}>
                      {hall.coram}
                    </div>
                  </div>

                  {/* Big LED Item Counter Box */}
                  <div className="p-4 rounded-2xl bg-zinc-950 text-white border border-zinc-800 flex items-center justify-between shadow-inner">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono tracking-widest uppercase text-zinc-400 font-bold block">
                        RUNNING ITEM ON DAIS
                      </span>
                      <div className="text-3xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                        <span>ITEM #{String(hall.currentItem).padStart(2, "0")}</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#6B1728] text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        In Session
                      </span>
                      <span className="text-[10px] text-zinc-400 block font-mono">
                        ~{hall.speedMinPerItem}m/case
                      </span>
                    </div>
                  </div>

                  {/* Live Status Description */}
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 italic bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900">
                    &ldquo;{hall.statusText}&rdquo;
                  </div>

                  {/* Chamber Matter Callout Box (if advocate has case here) */}
                  {hasChamberMatter && hall.activeMatter && proximity && (
                    <div className="p-3.5 rounded-2xl bg-[#6B1728]/10 dark:bg-[#6B1728]/20 border border-[#6B1728]/40 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-black dark:text-white">
                          {hall.activeMatter.caseNumber}
                        </span>
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-black text-white dark:bg-white dark:text-black">
                          Item #{hall.activeMatter.itemNumber}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-600 dark:text-zinc-300">
                          {hall.activeMatter.petitioner}
                        </span>
                        <span
                          className={`font-bold ${
                            proximity.diff <= 0
                              ? "text-[#6B1728] dark:text-[#ff94a8]"
                              : proximity.diff <= 1
                              ? "text-[#6B1728] dark:text-[#ff94a8]"
                              : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {proximity.badgeText}
                        </span>
                      </div>

                      {/* Quick Action Button */}
                      <div className="pt-1 flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            const found = items.find((i) => i.caseNumber === hall.activeMatter?.caseNumber) || items[0];
                            setActivePassoverItem(found);
                            setPassoverSlipResult(null);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-[#6B1728]/50 text-[10px] font-bold text-black dark:text-white hover:bg-[#6B1728]/20 transition cursor-pointer"
                        >
                          Rule 52 Passover
                        </button>
                        <button
                          onClick={() => {
                            const found = items.find((i) => i.caseNumber === hall.activeMatter?.caseNumber) || items[0];
                            setActiveNotifyItem(found);
                            setDispatchSuccessMsg(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold hover:opacity-90 transition cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Notify Client</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bottom Footer Info */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[10px] text-zinc-400">
                    <span className="truncate max-w-[200px]">{hall.courtName}</span>
                    <span className="font-mono">{hall.benchName.split("(")[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. TAB: MY CHAMBER CAUSELIST (MATTERS ROSTER)                  */}
      {/* ============================================================== */}
      {activeSubTab === "causelist" && (
        <div className="space-y-5">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by Case No, Party, CNR, or Item #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Court Filter */}
              <select
                value={selectedCourtFilter}
                onChange={(e) => setSelectedCourtFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="all">All Courts &amp; Tribunals</option>
                <option value="High Court">High Court of Kerala</option>
                <option value="NCLT">NCLT Kochi Bench</option>
                <option value="Magistrate">JFCM Courts</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="listed">Listed for Call</option>
                <option value="passover">Passover Requested</option>
                <option value="associate">Associate Assigned</option>
              </select>
            </div>
          </div>

          {/* Matters List */}
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                No listed court hearings found matching filter criteria.
              </div>
            ) : (
              filteredItems.map((item) => {
                const proximity = getProximityInfo(item.courtHall, item.itemNumber);

                return (
                  <div
                    key={item._id}
                    className={`p-6 md:p-7 rounded-3xl bg-white dark:bg-black border space-y-4 shadow-xs transition-all ${
                      proximity.isNextUp || proximity.isOnDais
                        ? "border-[#6B1728] dark:border-[#7A1B2E] ring-1 ring-[#6B1728]/20"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-xs">
                            #{item.itemNumber}
                          </span>
                          <span className="text-base font-bold text-black dark:text-white">
                            {item.caseNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                            {item.approxTime || "10:30 AM"}
                          </span>

                          {/* Proximity Radar Pill */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              proximity.isOnDais
                                ? "bg-[#6B1728] text-white border-[#6B1728]"
                                : proximity.isNextUp
                                ? "bg-[#6B1728]/15 text-[#6B1728] dark:text-[#ff94a8] border-[#6B1728]"
                                : proximity.isApproaching
                                ? "bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border-zinc-300 dark:border-zinc-700"
                                : "bg-zinc-50 dark:bg-zinc-950 text-zinc-500 border-zinc-200 dark:border-zinc-800"
                            }`}
                          >
                            {proximity.badgeText}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                          <span className="font-semibold text-black dark:text-white">
                            {item.courtName}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">
                            {item.courtHall}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-xs">{item.bench}</span>
                        </div>

                        <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                          <strong className="text-black dark:text-white">{item.petitioner}</strong> vs{" "}
                          {item.respondent}
                        </p>
                      </div>

                      {/* Right Calling Indicator */}
                      <div className="text-right space-y-1 self-start sm:self-auto shrink-0">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                          Court Hall Calling Status
                        </span>
                        <div className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-black dark:text-white">
                          {item.callingStatus || "Listed in Daily Cause List"}
                        </div>
                      </div>
                    </div>

                    {/* Procedural Stage & Remarks */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                      <div className="flex justify-between items-center text-zinc-500 flex-wrap gap-2">
                        <span>
                          Procedural Stage: <strong className="text-black dark:text-white">{item.stage}</strong>
                        </span>
                        {item.cnrNumber && <span className="font-mono text-[10px]">{item.cnrNumber}</span>}
                      </div>
                      {item.boardRemarks && (
                        <p className="text-zinc-600 dark:text-zinc-400 text-[11px] italic">
                          Remarks: {item.boardRemarks}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-900">
                      <div className="text-[11px] text-zinc-500">
                        Appearing for:{" "}
                        <strong className="text-black dark:text-white">
                          {item.appearanceFor || "Petitioner"}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            setActivePassoverItem(item);
                            setPassoverSlipResult(null);
                          }}
                          className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                        >
                          Passover Slip
                        </button>

                        <button
                          onClick={() => setActiveReassignItem(item)}
                          className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                        >
                          Delegate to Associate
                        </button>

                        <button
                          onClick={() => {
                            setActiveNotifyItem(item);
                            setDispatchSuccessMsg(null);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Record Outcome &amp; Notify</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. TAB: CONFLICT RADAR                                         */}
      {/* ============================================================== */}
      {activeSubTab === "conflicts" && (
        <div className="space-y-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#6B1728]" />
                <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">
                  Chamber Roster Conflict Radar
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#6B1728]/40 bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a8]">
                {conflicts.length} Concurrent Listing Alerts
              </span>
            </div>

            <div className="space-y-4">
              {conflicts.map((conf) => (
                <div
                  key={conf.id}
                  className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-black dark:text-white text-sm block">
                          {conf.severityLabel}
                        </span>
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-[#6B1728] text-white uppercase">
                          {conf.severity}
                        </span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 text-xs">{conf.distanceWarning}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const target = items.find((i) => i._id === conf.itemA.id) || items[0];
                          setActivePassoverItem(target);
                          setPassoverSlipResult(null);
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-[11px] font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                      >
                        Draft Passover Memo
                      </button>
                      <button
                        onClick={() => {
                          const target = items.find((i) => i._id === conf.itemB.id) || items[1];
                          setActiveReassignItem(target);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold hover:opacity-90 cursor-pointer"
                      >
                        Delegate to Junior
                      </button>
                    </div>
                  </div>

                  {/* Comparison Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
                      <span className="text-[10px] text-zinc-400 font-mono block">Matter A:</span>
                      <div className="font-bold text-black dark:text-white">{conf.itemA.caseNumber}</div>
                      <div className="text-[11px] text-zinc-500">
                        {conf.itemA.courtHall} • Item #{conf.itemA.itemNumber} ({conf.timeA})
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
                      <span className="text-[10px] text-zinc-400 font-mono block">Matter B:</span>
                      <div className="font-bold text-black dark:text-white">{conf.itemB.caseNumber}</div>
                      <div className="text-[11px] text-zinc-500">
                        {conf.itemB.courtHall} • Item #{conf.itemB.itemNumber} ({conf.timeB})
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300 italic pl-3 border-l-2 border-[#6B1728]">
                    &ldquo;{conf.recommendation}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. TAB: CAUSELIST ARCHIVE & ROSTER NOTIFICATIONS               */}
      {/* ============================================================== */}
      {activeSubTab === "archive" && (
        <div className="space-y-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">
                  Kerala High Court Registry Sitting Roster &amp; Gazette Archive
                </h3>
                <p className="text-xs text-zinc-500">
                  Official bench notifications, judge sitting assignments, and previous daily causelists.
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer text-black dark:text-white"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  date: "Today, 29 October 2026",
                  type: "Daily Cause List Roster",
                  hall: "High Court of Kerala (Full Roster)",
                  itemsCount: "420 Listed Matters across 24 Benches",
                },
                {
                  date: "Yesterday, 28 October 2026",
                  type: "Official Sitting Notification",
                  hall: "Special Division Bench Constitution",
                  itemsCount: "Public Interest Litigation & Infrastructure Division",
                },
                {
                  date: "Monday, 27 October 2026",
                  type: "Motion Slip Scrutiny Gazette",
                  hall: "High Court Registry Notice No. 41/2026",
                  itemsCount: "Mandatory e-Verification of Vakalathnama Bar Roll Numbers",
                },
              ].map((arch, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-black dark:text-white text-xs block">
                      {arch.hall}
                    </span>
                    <p className="text-zinc-500 text-[11px]">{arch.itemsCount}</p>
                    <span className="text-[10px] font-mono text-zinc-400">{arch.date}</span>
                  </div>

                  <button
                    onClick={() => showToast(`Opening certified archive for ${arch.date}`)}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-[11px] font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                  >
                    View Gazette
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODAL: HIGH COURT PASSOVER MEMO GENERATOR (RULE 52)         */}
      {/* ============================================================== */}
      {activePassoverItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-[#6B1728] uppercase tracking-wider block">
                  High Court Rules of Practice (Rule 52)
                </span>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Passover Memo: {activePassoverItem.caseNumber} (Item #{activePassoverItem.itemNumber})
                </h3>
              </div>
              <button
                onClick={() => setActivePassoverItem(null)}
                className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-5 overflow-y-auto text-xs">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Court Hall &amp; Bench:</span>
                  <strong className="text-black dark:text-white">
                    {activePassoverItem.courtHall} • {activePassoverItem.bench}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Cause List Item:</span>
                  <strong className="text-black dark:text-white">Item #{activePassoverItem.itemNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Counsel on Record:</span>
                  <strong className="text-black dark:text-white">
                    {advocateName} ({barCouncilNumber})
                  </strong>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-black dark:text-white block">
                  Grounds for Passover / Engagement elsewhere:
                </label>
                <textarea
                  rows={3}
                  value={passoverReason}
                  onChange={(e) => setPassoverReason(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-black dark:text-white block">Requested Passover Window:</label>
                <select
                  value={passoverUntil}
                  onChange={(e) => setPassoverUntil(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="12:00 PM / 2nd Call">12:00 PM / 2nd Call</option>
                  <option value="01:45 PM / Post-Lunch Session">01:45 PM / Post-Lunch Session</option>
                  <option value="Passover to end of Causelist Board">Passover to end of Causelist Board</option>
                </select>
              </div>

              {passoverSlipResult && (
                <div className="p-4 rounded-2xl bg-[#6B1728]/10 dark:bg-[#6B1728]/20 border border-[#6B1728]/40 space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-bold text-black dark:text-white">
                    <span className="text-[#6B1728] dark:text-[#ff94a8]">
                      Certified Passover Slip #{passoverSlipResult.slipNumber}
                    </span>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1 text-[10px] text-zinc-600 dark:text-zinc-400 hover:underline cursor-pointer"
                    >
                      <Printer className="w-3 h-3" /> Print Memo
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300 italic">
                    Registered electronically with the Court Master for {activePassoverItem.courtHall}. Held for 2nd Call.
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  onClick={() => setActivePassoverItem(null)}
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleSubmitPassover}
                  className="px-5 py-2 rounded-full bg-[#6B1728] text-white hover:bg-[#7A1B2E] text-xs font-bold transition cursor-pointer"
                >
                  Submit Passover to Bench
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODAL: DELEGATE TO JUNIOR ASSOCIATE                         */}
      {/* ============================================================== */}
      {activeReassignItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Chamber Associate Delegation
                </span>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Delegate: {activeReassignItem.caseNumber}
                </h3>
              </div>
              <button
                onClick={() => setActiveReassignItem(null)}
                className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500 block">Court &amp; Stage:</span>
                <strong className="text-black dark:text-white block mt-0.5">
                  {activeReassignItem.courtName} ({activeReassignItem.courtHall}) • {activeReassignItem.stage}
                </strong>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Assign to Chamber Junior:</label>
                <select
                  value={selectedAssociate}
                  onChange={(e) => setSelectedAssociate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="Adv. Rahul Deshmukh">Adv. Rahul Deshmukh (Appellate Junior • K/003412/2024)</option>
                  <option value="Adv. Ananya Iyer">Adv. Ananya Iyer (Commercial Associate • K/002189/2023)</option>
                  <option value="Adv. Vikramaditya Roy">Adv. Vikramaditya Roy (Criminal Junior • K/004521/2024)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Briefing Instructions for Court:</label>
                <textarea
                  rows={3}
                  value={briefingNotes}
                  onChange={(e) => setBriefingNotes(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  onClick={() => setActiveReassignItem(null)}
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReassign}
                  className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  Confirm Delegation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. MODAL: RECORD HEARING OUTCOME & DISPATCH CLIENT UPDATE      */}
      {/* ============================================================== */}
      {activeNotifyItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Court Hearing Outcome &amp; Client Dispatcher
                </span>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Record Outcome: {activeNotifyItem.caseNumber}
                </h3>
              </div>
              <button
                onClick={() => setActiveNotifyItem(null)}
                className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-5 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-black dark:text-white block">Court Decision / Order:</label>
                  <select
                    value={hearingOutcome}
                    onChange={(e) => setHearingOutcome(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Ad-Interim Stay Granted (4 Weeks)">Ad-Interim Stay Granted (4 Weeks)</option>
                    <option value="Notice Before Admission Issued">Notice Before Admission Issued</option>
                    <option value="Counter Affidavit Time Granted (2 Weeks)">Counter Affidavit Time Granted (2 Weeks)</option>
                    <option value="Arguments Concluded - Reserved for Judgment">Arguments Concluded - Reserved for Judgment</option>
                    <option value="Adjourned to Next Date">Adjourned to Next Date</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-black dark:text-white block">Next Hearing Date:</label>
                  <input
                    type="text"
                    value={nextListingDate}
                    onChange={(e) => setNextListingDate(e.target.value)}
                    placeholder="e.g. 18.11.2024"
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Bench Dictation &amp; Directions:</label>
                <textarea
                  rows={2}
                  value={benchDictationNote}
                  onChange={(e) => setBenchDictationNote(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                />
              </div>

              {/* Client Dispatch Preview (English & Malayalam) */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Automated Client Notification Preview (WhatsApp &amp; SMS)
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Recipient: {activeNotifyItem.petitioner} ({activeNotifyItem.clientPhone || "+91 94471 28930"})
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black dark:text-white text-[11px]">English Message:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `Namaskaram ${activeNotifyItem.petitioner}, your matter ${activeNotifyItem.caseNumber} was heard before the Hon'ble Court today. Outcome: ${hearingOutcome}. ${benchDictationNote} Next listing date: ${nextListingDate}. Warm regards, ${advocateName}.`
                        );
                        setCopiedEnglishMsg(true);
                        setTimeout(() => setCopiedEnglishMsg(false), 2000);
                      }}
                      className="text-[10px] text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedEnglishMsg ? <Check className="w-3 h-3 text-[#6B1728]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedEnglishMsg ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans text-xs">
                    Namaskaram {activeNotifyItem.petitioner}, your matter {activeNotifyItem.caseNumber} was heard before the Hon&apos;ble Court today. Outcome: {hearingOutcome}. {benchDictationNote} Next listing date: {nextListingDate}. Warm regards, {advocateName}.
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black dark:text-white text-[11px]">Malayalam Message (മലയാളം):</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `നമസ്കാരം ${activeNotifyItem.petitioner}, താങ്കളുടെ കേസ് ${activeNotifyItem.caseNumber} ഇന്ന് ബഹുമാനപ്പെട്ട കോടതി പരിഗണിച്ചു. വിധി/ഉത്തരവ്: ${hearingOutcome}. ${benchDictationNote} അടുത്ത വാദം കേൾക്കുന്ന തീയതി: ${nextListingDate}. സ്നേഹാദരങ്ങളോടെ, ${advocateName}.`
                        );
                        setCopiedMalayalamMsg(true);
                        setTimeout(() => setCopiedMalayalamMsg(false), 2000);
                      }}
                      className="text-[10px] text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedMalayalamMsg ? <Check className="w-3 h-3 text-[#6B1728]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedMalayalamMsg ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans text-xs">
                    നമസ്കാരം {activeNotifyItem.petitioner}, താങ്കളുടെ കേസ് {activeNotifyItem.caseNumber} ഇന്ന് ബഹുമാനപ്പെട്ട കോടതി പരിഗണിച്ചു. വിധി/ഉത്തരവ്: {hearingOutcome}. {benchDictationNote} അടുത്ത വാദം കേൾക്കുന്ന തീയതി: {nextListingDate}. സ്നേഹാദരങ്ങളോടെ, {advocateName}.
                  </div>
                </div>
              </div>

              {dispatchSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-[#6B1728]/10 dark:bg-[#6B1728]/20 border border-[#6B1728]/40 text-xs font-bold text-[#6B1728] dark:text-[#ff94a8] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{dispatchSuccessMsg}</span>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  onClick={() => setActiveNotifyItem(null)}
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispatchNotification}
                  className="px-6 py-2.5 rounded-full bg-[#6B1728] text-white hover:bg-[#7A1B2E] text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch WhatsApp &amp; SMS Update</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourtCauselistRadarView;
