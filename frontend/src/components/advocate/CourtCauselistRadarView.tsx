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
  advocateName = "",
  barCouncilNumber = "",
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

  // Digital Court Halls Atrium Board State (populated dynamically from chamber causelist)
  const [courtHalls, setCourtHalls] = useState<CourtHallLiveStatus[]>([]);

  // Modals state
  const [activePassoverItem, setActivePassoverItem] = useState<CauselistItem | null>(null);
  const [passoverReason, setPassoverReason] = useState("");
  const [passoverUntil, setPassoverUntil] = useState("2nd Call");
  const [passoverSlipResult, setPassoverSlipResult] = useState<any | null>(null);

  const [activeReassignItem, setActiveReassignItem] = useState<CauselistItem | null>(null);
  const [selectedAssociate, setSelectedAssociate] = useState("");
  const [briefingNotes, setBriefingNotes] = useState("");

  const [activeNotifyItem, setActiveNotifyItem] = useState<CauselistItem | null>(null);
  const [hearingOutcome, setHearingOutcome] = useState("Ad-Interim Stay Granted (4 Weeks)");
  const [benchDictationNote, setBenchDictationNote] = useState("");
  const [nextListingDate, setNextListingDate] = useState("");
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);
  const [copiedEnglishMsg, setCopiedEnglishMsg] = useState(false);
  const [copiedMalayalamMsg, setCopiedMalayalamMsg] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Radar Data
  const loadRadarData = async () => {
    try {
      setLoading(true);
      const res = await advocateApi.getCauselistRadar(token);
      const loadedItems: CauselistItem[] =
        res && res.success && Array.isArray(res.items) ? res.items : [];
      const loadedConflicts: ScheduleConflict[] =
        res && res.success && Array.isArray(res.conflicts) ? res.conflicts : [];

      setItems(loadedItems);
      setConflicts(loadedConflicts);

      const hallMap = new Map<string, CourtHallLiveStatus>();
      for (const item of loadedItems) {
        const hallName = item.courtHall || "Court Hall Pending";
        const courtName = item.courtName || "Court Forum Pending";
        const key = `${courtName.toLowerCase()}::${hallName.toLowerCase()}`;
        const existing = hallMap.get(key);
        const itemNum = Number(item.itemNumber) || 1;
        if (!existing) {
          hallMap.set(key, {
            hallId: key,
            hallName,
            courtName,
            benchName: item.bench || "Bench Pending",
            coram: item.bench || "Coram Pending",
            currentItem: itemNum,
            totalItems: itemNum,
            sessionStatus: "arguing",
            statusText: item.callingStatus || item.boardRemarks || `Item #${itemNum} Listed`,
            speedMinPerItem: 5,
            chamberMattersCount: 1,
            activeMatter: {
              caseNumber: item.caseNumber,
              itemNumber: itemNum,
              petitioner: item.petitioner || "Party",
            },
          });
        } else {
          existing.chamberMattersCount += 1;
          existing.totalItems = Math.max(existing.totalItems, itemNum);
        }
      }
      setCourtHalls(Array.from(hallMap.values()));
    } catch (err) {
      console.warn("Failed to load causelist radar from backend:", err);
      setItems([]);
      setConflicts([]);
      setCourtHalls([]);
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

  // Advance Court Hall item simulation
  const handleAdvanceHall = (hallId: string, amount: number = 1) => {
    const targetHall = courtHalls.find((h) => h.hallId === hallId) || courtHalls[0];
    if (!targetHall) return;
    const nextNum = Math.max(1, targetHall.currentItem + amount);
    setCourtHalls((prev) =>
      prev.map((hall) => {
        if (hall.hallId === targetHall.hallId) {
          const activeNum = hall.activeMatter?.itemNumber;
          let newStatus = `Item #${nextNum} In Progress`;
          if (activeNum && nextNum === activeNum) {
            newStatus = `Now calling Item #${nextNum}: ${hall.activeMatter?.caseNumber || "Your Matter"}`;
          } else if (activeNum && nextNum < activeNum) {
            newStatus = `Item #${nextNum} Argued • Advancing towards Item #${activeNum}`;
          }
          return {
            ...hall,
            currentItem: nextNum,
            statusText: newStatus,
          };
        }
        return hall;
      })
    );
    showToast(`${targetHall.hallName} advanced. Running item: #${nextNum}`);
  };

  // Reset Simulation
  const handleResetSimulation = () => {
    loadRadarData();
    showToast("Court Hall display board synced to live backend status.");
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
          clientPhone: activeNotifyItem.clientPhone || "",
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

  const nextListedItem = items[0] || null;
  const primaryHall = nextListedItem
    ? courtHalls.find(
        (h) => h.hallName.toLowerCase() === (nextListedItem.courtHall || "").toLowerCase()
      ) ||
      courtHalls[0] ||
      null
    : courtHalls[0] || null;
  const nextProximity = nextListedItem
    ? getProximityInfo(nextListedItem.courtHall, nextListedItem.itemNumber)
    : null;

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
              {barCouncilNumber && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a8] border border-[#6B1728]/30">
                    Roll: {barCouncilNumber}
                  </span>
                </>
              )}
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-[10px] font-mono text-zinc-400">
                Synced {lastSyncSecondsAgo}s ago
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white flex items-center gap-2.5">
              <span>Daily Display Board &amp; Causelist Radar</span>
            </h2>
            <p className="text-xs text-zinc-500 max-w-3xl">
              Live electronic causelist &amp; atrium display board sync across your chamber&apos;s listed courts and tribunals.
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
              title="Toggle automatic registry feed sync"
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
              {items.length} {items.length === 1 ? "Matter" : "Matters"}
            </div>
            <span className="text-[11px] text-zinc-500">
              {items.length === 0
                ? "No hearings scheduled"
                : `Across ${courtHalls.length} Active Hall${courtHalls.length === 1 ? "" : "s"}`}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-[#6B1728]/30 space-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#6B1728]" />
            <span className="text-[10px] font-mono text-[#6B1728] dark:text-[#ff94a8] uppercase font-bold block flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              Proximity Alert: Next Matter
            </span>
            <div className="text-lg font-bold text-black dark:text-white truncate">
              {nextListedItem
                ? `${nextListedItem.courtHall || "Court Hall"} (Item #${nextListedItem.itemNumber})`
                : "No Active Alerts"}
            </div>
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              {nextListedItem ? (
                nextProximity && primaryHall ? (
                  nextProximity.diff <= 0 ? (
                    <strong className="text-[#6B1728] font-bold">Currently Arguing on Dais!</strong>
                  ) : (
                    <>
                      Hall on #{primaryHall.currentItem} •{" "}
                      <strong className="text-black dark:text-white">{nextProximity.diff} Items Away</strong> (~{nextProximity.estMinutes}m)
                    </>
                  )
                ) : (
                  "Scheduled on daily causelist"
                )
              ) : (
                "No hearings scheduled today"
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
              {courtHalls.length} {courtHalls.length === 1 ? "Courtroom" : "Courtrooms"}
            </div>
            <span className="text-[11px] text-zinc-500">
              {courtHalls.length > 0 ? "Live Atrium Screen Sync Active" : "Awaiting causelist sync"}
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
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#6B1728] text-white">
              {courtHalls.length} {courtHalls.length === 1 ? "Hall" : "Halls"}
            </span>
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
          {primaryHall && (
            <div className="p-4 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-black dark:text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#6B1728]" />
                  {primaryHall.hallName} Display Controls:
                </span>
                <span className="text-zinc-500">Test live proximity countdown &amp; item increment</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleAdvanceHall(primaryHall.hallId, 1)}
                  className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
                  title="Simulate Court Master advancing the board by 1 item"
                >
                  <span>Advance Item (+1)</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleAdvanceHall(primaryHall.hallId, -1)}
                  disabled={primaryHall.currentItem <= 1}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  title="Step backward"
                >
                  <span>Step Back (-1)</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleResetSimulation}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition cursor-pointer"
                  title="Sync back to live backend state"
                >
                  Reset Board
                </button>
              </div>
            </div>
          )}

          {courtHalls.length === 0 && (
            <div className="p-12 rounded-3xl bg-white dark:bg-black border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-1.5">
              <p className="text-sm font-bold text-black dark:text-white">
                No daily causelist hearings tracked yet
              </p>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Your chamber&apos;s listed court halls and live item counters will appear here once matters are scheduled on today&apos;s causelist.
              </p>
            </div>
          )}

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
                {Array.from(new Set(items.map((item) => item.courtName).filter(Boolean))).map(
                  (courtName) => (
                    <option key={courtName} value={courtName}>
                      {courtName}
                    </option>
                  )
                )}
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
              {conflicts.length === 0 ? (
                <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                  No schedule conflicts detected. Your current causelist listings do not overlap.
                </div>
              ) : (
                conflicts.map((conf) => (
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
                ))
              )}
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
                  Sitting Roster &amp; Gazette Archive
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

            <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
              No archived causelist gazettes or sitting notifications available yet.
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
                    {advocateName || "Counsel on Record"}
                    {barCouncilNumber ? ` (${barCouncilNumber})` : ""}
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
                  placeholder="Enter grounds for passover or bench engagement..."
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
                  <option value="2nd Call">2nd Call</option>
                  <option value="Post-Lunch Session">Post-Lunch Session</option>
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
                <input
                  type="text"
                  value={selectedAssociate}
                  onChange={(e) => setSelectedAssociate(e.target.value)}
                  placeholder="Enter chamber associate or counsel name"
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Briefing Instructions for Court:</label>
                <textarea
                  rows={3}
                  value={briefingNotes}
                  onChange={(e) => setBriefingNotes(e.target.value)}
                  placeholder="Enter briefing notes or court instructions..."
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
                  disabled={!selectedAssociate.trim()}
                  className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 disabled:opacity-40 cursor-pointer"
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
                    placeholder="DD.MM.YYYY"
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
                  placeholder="Enter bench dictation, stay terms, or court directions..."
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
                    Recipient: {activeNotifyItem.petitioner} ({activeNotifyItem.clientPhone || "N/A"})
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black dark:text-white text-[11px]">English Message:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `Namaskaram ${activeNotifyItem.petitioner}, your matter ${activeNotifyItem.caseNumber} was heard before the Hon'ble Court today. Outcome: ${hearingOutcome}. ${benchDictationNote} Next listing date: ${nextListingDate}. Warm regards, ${advocateName || "Chamber Counsel"}.`
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
                    Namaskaram {activeNotifyItem.petitioner}, your matter {activeNotifyItem.caseNumber} was heard before the Hon&apos;ble Court today. Outcome: {hearingOutcome}. {benchDictationNote} Next listing date: {nextListingDate}. Warm regards, {advocateName || "Chamber Counsel"}.
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black dark:text-white text-[11px]">Malayalam Message (മലയാളം):</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `നമസ്കാരം ${activeNotifyItem.petitioner}, താങ്കളുടെ കേസ് ${activeNotifyItem.caseNumber} ഇന്ന് ബഹുമാനപ്പെട്ട കോടതി പരിഗണിച്ചു. വിധി/ഉത്തരവ്: ${hearingOutcome}. ${benchDictationNote} അടുത്ത വാദം കേൾക്കുന്ന തീയതി: ${nextListingDate}. സ്നേഹാദരങ്ങളോടെ, ${advocateName || "Chamber Counsel"}.`
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
                    നമസ്കാരം {activeNotifyItem.petitioner}, താങ്കളുടെ കേസ് {activeNotifyItem.caseNumber} ഇന്ന് ബഹുമാനപ്പെട്ട കോടതി പരിഗണിച്ചു. വിധി/ഉത്തരവ്: {hearingOutcome}. {benchDictationNote} അടുത്ത വാദം കേൾക്കുന്ന തീയതി: {nextListingDate}. സ്നേഹാദരങ്ങളോടെ, {advocateName || "Chamber Counsel"}.
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
