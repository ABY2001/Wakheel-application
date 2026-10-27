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
} from "lucide-react";
import { advocateApi } from "@/lib/api";

export interface CourtCauselistRadarViewProps {
  advocateName?: string;
  barCouncilNumber?: string;
  token?: string;
}

interface CauselistItem {
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

interface ScheduleConflict {
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

export function CourtCauselistRadarView({
  advocateName = "Adv. Meera Krishnan",
  barCouncilNumber = "K/001429/2012",
  token,
}: CourtCauselistRadarViewProps) {
  // State
  const [items, setItems] = useState<CauselistItem[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourtFilter, setSelectedCourtFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

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
      if (res && res.success) {
        setItems(res.items || []);
        setConflicts(res.conflicts || []);
      }
    } catch (err) {
      console.warn("Failed to load causelist radar from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRadarData();
  }, [token]);

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
      }
    } catch (err) {
      console.error("Passover submit error:", err);
      alert("Failed to submit passover request.");
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
      }
    } catch (err) {
      console.error("Reassign submit error:", err);
      alert("Failed to delegate representation.");
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
      }
    } catch (err) {
      console.error("Dispatch client update error:", err);
      alert("Failed to dispatch client update.");
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

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-black dark:text-white flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. TOP HEADER & CAUSELIST RADAR OVERVIEW                       */}
      {/* ============================================================== */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                Courtroom Logistics • Milestone 5
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
                Roll: {barCouncilNumber}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
              Smart Court Causelist Aggregator &amp; Schedule Conflict Radar
            </h2>
            <p className="text-xs text-zinc-500 max-w-3xl">
              Live daily causelist tracker across High Court Division Benches, NCLT, and Sessions Courts.
              Monitors concurrent venue conflicts, auto-generates High Court passover slips, and dispatches automated hearing updates to clients.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              onClick={loadRadarData}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Causelist</span>
            </button>
          </div>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
              Today&apos;s Listed Hearings
            </span>
            <div className="text-2xl font-black text-black dark:text-white">{items.length} Matters</div>
            <span className="text-[11px] text-zinc-500">Across 4 Benches &amp; Tribunals</span>
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
              Next Calling Item
            </span>
            <div className="text-base font-bold text-black dark:text-white truncate">
              Court Hall 2A (Item #14)
            </div>
            <span className="text-[11px] text-zinc-500">WP(C) 19482/2024 • Est. 10:45 AM</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
              Registry Sync Status
            </span>
            <div className="text-xs font-bold text-black dark:text-white mt-1">
              eCourts Kerala High Court
            </div>
            <span className="text-[11px] text-zinc-500">Verified at 07:00 IST Today</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. REAL-TIME SCHEDULE CONFLICT RADAR ALERT BANNER              */}
      {/* ============================================================== */}
      {conflicts.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-black dark:text-white" />
              <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">
                Chamber Conflict Radar: Concurrent Listing Alert
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white">
              Action Advised
            </span>
          </div>

          <div className="space-y-3">
            {conflicts.slice(0, 2).map((conf) => (
              <div
                key={conf.id}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <span className="font-bold text-black dark:text-white text-xs block">
                      {conf.severityLabel}: {conf.itemA.caseNumber} ({conf.timeA}) vs {conf.itemB.caseNumber} ({conf.timeB})
                    </span>
                    <p className="text-zinc-500 text-[11px]">{conf.distanceWarning}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const targetItem = items.find((i) => i._id === conf.itemA.id) || items[0];
                        setActivePassoverItem(targetItem);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-[11px] font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                    >
                      Draft Passover Memo
                    </button>
                    <button
                      onClick={() => {
                        const targetItem = items.find((i) => i._id === conf.itemB.id) || items[1];
                        setActiveReassignItem(targetItem);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold hover:opacity-90 cursor-pointer"
                    >
                      Delegate to Associate
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 italic pl-3 border-l-2 border-black dark:border-white">
                  &ldquo;{conf.recommendation}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. CAUSELIST FILTERS & CONTROLS                                */}
      {/* ============================================================== */}
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
            <option value="Sessions">Sessions Court</option>
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
            <option value="stay">Stay Granted</option>
          </select>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. DAILY CAUSELIST MATTERS ROSTER                              */}
      {/* ============================================================== */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
            No listed court hearings found matching filter criteria.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item._id}
              className="p-6 md:p-7 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs hover:border-black dark:hover:border-white transition-all"
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
                    {item.status === "passover_requested" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                        Passover Requested
                      </span>
                    )}
                    {item.status === "associate_assigned" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                        Delegated to {item.assignedAssociate?.name || "Associate"}
                      </span>
                    )}
                    {item.status === "stay_granted" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black">
                        Ad-Interim Stay Granted
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                    <span className="font-semibold text-black dark:text-white">{item.courtName}</span>
                    <span>•</span>
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">{item.courtHall}</span>
                    <span>•</span>
                    <span>{item.bench}</span>
                  </div>

                  <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                    <strong className="text-black dark:text-white">{item.petitioner}</strong> vs {item.respondent}
                  </p>
                </div>

                {/* Right Side Calling Status */}
                <div className="text-right space-y-1 self-start sm:self-auto shrink-0">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                    Calling Status
                  </span>
                  <div className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-black dark:text-white">
                    {item.callingStatus || "Listed in Daily Cause List"}
                  </div>
                </div>
              </div>

              {/* Stage & Board Remarks */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                <div className="flex justify-between items-center text-zinc-500">
                  <span>Procedural Stage: <strong className="text-black dark:text-white">{item.stage}</strong></span>
                  {item.cnrNumber && <span className="font-mono text-[10px]">{item.cnrNumber}</span>}
                </div>
                {item.boardRemarks && (
                  <p className="text-zinc-600 dark:text-zinc-400 text-[11px] italic">
                    Note: {item.boardRemarks}
                  </p>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-900">
                <div className="text-[11px] text-zinc-500">
                  Appearing for: <strong className="text-black dark:text-white">{item.appearanceFor || "Petitioner"}</strong>
                </div>

                <div className="flex items-center gap-2">
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
                    Reassign Associate
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
          ))
        )}
      </div>

      {/* ============================================================== */}
      {/* 5. MODAL: HIGH COURT PASSOVER MEMO GENERATOR                   */}
      {/* ============================================================== */}
      {activePassoverItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  High Court Rules of Practice (Rule 52)
                </span>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Passover Slip: {activePassoverItem.caseNumber} (Item #{activePassoverItem.itemNumber})
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
                  <strong className="text-black dark:text-white">{advocateName} ({barCouncilNumber})</strong>
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
                  className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
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
                <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-bold text-black dark:text-white">
                    <span>Passover Slip #{passoverSlipResult.slipNumber}</span>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1 text-[10px] text-zinc-600 dark:text-zinc-400 hover:underline cursor-pointer"
                    >
                      <Printer className="w-3 h-3" /> Print
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300 italic">
                    Registered with Court Master for {activePassoverItem.courtHall}.
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
                  className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  Submit Passover to Bench
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODAL: DELEGATE TO JUNIOR ASSOCIATE                         */}
      {/* ============================================================== */}
      {activeReassignItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
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
      {/* 7. MODAL: RECORD HEARING OUTCOME & DISPATCH CLIENT UPDATE      */}
      {/* ============================================================== */}
      {activeNotifyItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
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
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Automated Client Notification Preview (WhatsApp &amp; SMS)
                  </span>
                  <span className="text-[10px] text-zinc-400">Recipient: {activeNotifyItem.petitioner} ({activeNotifyItem.clientPhone || "+91 94471 28930"})</span>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-black dark:text-white text-[11px]">English Message:</span>
                  <div className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                    Namaskaram {activeNotifyItem.petitioner}, your matter {activeNotifyItem.caseNumber} was heard before the Hon&apos;ble Court today. Outcome: {hearingOutcome}. {benchDictationNote} Next listing date: {nextListingDate}. Warm regards, {advocateName}.
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-black dark:text-white text-[11px]">Malayalam Message (മലയാളം):</span>
                  <div className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                    നമസ്കാരം {activeNotifyItem.petitioner}, താങ്കളുടെ കേസ് {activeNotifyItem.caseNumber} ഇന്ന് ബഹുമാനപ്പെട്ട കോടതി പരിഗണിച്ചു. വിധി/ഉത്തരവ്: {hearingOutcome}. {benchDictationNote} അടുത്ത വാദം കേൾക്കുന്ന തീയതി: {nextListingDate}. സ്നേഹാദരങ്ങളോടെ, {advocateName}.
                  </div>
                </div>
              </div>

              {dispatchSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-black dark:text-white flex items-center gap-2">
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
                  className="px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
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
