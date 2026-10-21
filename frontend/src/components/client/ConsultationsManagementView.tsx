"use client";

import React, { useState, useEffect } from "react";
import { citizenApi } from "@/lib/api";
import {
  PhoneCall,
  Video,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  X,
  Check,
  FileText,
  User,
  Shield,
  Mic,
  MicOff,
  VideoOff,
  Share2,
  Download,
  Printer,
  ChevronRight,
  MapPin,
  Scale,
} from "lucide-react";

export interface ConsultationItem {
  _id: string;
  id?: string;
  citizenId: string;
  advocateId?: string;
  advocateName: string;
  barCouncilNumber?: string;
  matterId?: string;
  consultationType: "video" | "chamber" | "phone";
  scheduledDate: string;
  timeSlot: string;
  durationMinutes: number;
  meetingLink?: string;
  chamberAddress?: string;
  subject: string;
  clientNotes?: string;
  adviceNotes?: string;
  feeAmount: number;
  paymentStatus: "pending" | "paid" | "waived";
  status: "scheduled" | "completed" | "rescheduled" | "cancelled";
  cancellationReason?: string;
  rescheduleReason?: string;
  createdAt?: string;
}

interface ConsultationsManagementViewProps {
  token?: string;
  onOpenBookingModal?: () => void;
}

export const ConsultationsManagementView: React.FC<ConsultationsManagementViewProps> = ({
  token = "dev_token",
  onOpenBookingModal,
}) => {
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Video Chamber Room Modal State
  const [activeVideoRoom, setActiveVideoRoom] = useState<ConsultationItem | null>(null);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);

  // Reschedule Modal State
  const [rescheduleItem, setRescheduleItem] = useState<ConsultationItem | null>(null);
  const [newDate, setNewDate] = useState<string>("");
  const [newTimeSlot, setNewTimeSlot] = useState<string>("10:30 AM - 11:15 AM");
  const [rescheduleReason, setRescheduleReason] = useState<string>("");
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState<boolean>(false);

  // Cancel Modal State
  const [cancelItem, setCancelItem] = useState<ConsultationItem | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);

  // View Dossier Modal State
  const [viewDossierItem, setViewDossierItem] = useState<ConsultationItem | null>(null);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const res = await citizenApi.getConsultations(token);
      if (res && res.consultations) {
        setConsultations(res.consultations);
      }
    } catch (err) {
      console.error("Failed to load consultations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [token]);

  // Timer for active video chamber
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeVideoRoom) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSessionSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeVideoRoom]);

  // Execute Reschedule
  const handleConfirmReschedule = async () => {
    if (!rescheduleItem || !newDate) {
      alert("Please select a new consultation date.");
      return;
    }

    try {
      setIsSubmittingReschedule(true);
      const res = await citizenApi.rescheduleConsultation(
        token,
        rescheduleItem._id,
        newDate,
        newTimeSlot,
        rescheduleReason
      );

      if (res && res.success) {
        setRescheduleItem(null);
        setNewDate("");
        setRescheduleReason("");
        await fetchConsultations();
      } else {
        alert(res?.message || "Failed to reschedule consultation.");
      }
    } catch (err) {
      console.error("Reschedule failed:", err);
      alert("Error processing reschedule request.");
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  // Execute Cancel
  const handleConfirmCancel = async () => {
    if (!cancelItem) return;

    try {
      setIsSubmittingCancel(true);
      const res = await citizenApi.cancelConsultation(token, cancelItem._id, cancelReason);
      if (res && res.success) {
        setCancelItem(null);
        setCancelReason("");
        await fetchConsultations();
      } else {
        alert(res?.message || "Failed to cancel consultation.");
      }
    } catch (err) {
      console.error("Cancel failed:", err);
      alert("Error processing cancellation request.");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Filter consultations
  const filteredConsultations = consultations.filter((c) => {
    const matchesSearch =
      c.advocateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.chamberAddress && c.chamberAddress.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.clientNotes && c.clientNotes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "ALL") return true;
    if (statusFilter === "SCHEDULED") return c.status === "scheduled" || c.status === "rescheduled";
    if (statusFilter === "COMPLETED") return c.status === "completed";
    if (statusFilter === "CANCELLED") return c.status === "cancelled";
    return true;
  });

  // Calculate Metrics
  const totalSessions = consultations.length;
  const scheduledCount = consultations.filter((c) => c.status === "scheduled" || c.status === "rescheduled").length;
  const completedCount = consultations.filter((c) => c.status === "completed").length;
  const totalFeesIncurred = consultations.reduce((sum, c) => sum + (c.feeAmount || 0), 0);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6">
      {/* ============================================================== */}
      {/* 1. Header Bar with Actions                                     */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">
              Legal Consultations &amp; Chamber Sessions
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
              HIGH COURT &amp; CIVIL CHAMBERS
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Manage virtual video consultations, physical chamber appointments, and post-conference legal advice memos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenBookingModal && (
            <button
              onClick={onOpenBookingModal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Session</span>
            </button>
          )}

          <button
            onClick={fetchConsultations}
            title="Refresh consultations"
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. KPI Summary Metrics (Monochrome Zinc)                       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
              Total Sessions
            </span>
            <Calendar className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-black dark:text-white mt-2">{totalSessions}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Consultations and conferences</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
              Upcoming / Active
            </span>
            <Clock className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-black dark:text-white mt-2">{scheduledCount}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Scheduled on chamber calendar</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
              Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-black dark:text-white mt-2">{completedCount}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">With legal advice notes</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
              Chamber Fees Paid
            </span>
            <Shield className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-black dark:text-white mt-2">
            ₹{totalFeesIncurred.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Professional consultation fees</p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. Search and Status Tabs                                      */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by advocate name, matter, conference subject or notes..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Sessions" },
            { id: "SCHEDULED", label: "Upcoming" },
            { id: "COMPLETED", label: "Completed" },
            { id: "CANCELLED", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === tab.id
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-black dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. Consultation Dossier Cards                                  */}
      {/* ============================================================== */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400" />
          <p className="text-xs text-zinc-500">Synchronizing advocate chamber appointments...</p>
        </div>
      ) : filteredConsultations.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3">
          <Calendar className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700" />
          <h3 className="text-sm font-bold text-black dark:text-white">No consultations found</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            {searchQuery
              ? `No records matching "${searchQuery}". Clear query to view all sessions.`
              : "Schedule a virtual video chamber or physical meeting with empaneled counsel."}
          </p>
          {onOpenBookingModal && (
            <button
              onClick={onOpenBookingModal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black inline-flex items-center gap-1.5 cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Book First Consultation</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConsultations.map((c) => {
            const isScheduled = c.status === "scheduled" || c.status === "rescheduled";
            const isCompleted = c.status === "completed";
            const isCancelled = c.status === "cancelled";
            const isVideo = c.consultationType === "video";

            return (
              <div
                key={c._id || c.id}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white flex items-center gap-1">
                        {isVideo ? <Video className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                        <span>{isVideo ? "Virtual Video Chamber" : "Physical Chamber Visit"}</span>
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        Date: {new Date(c.scheduledDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} &bull; {c.timeSlot}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-black dark:text-white">{c.subject}</h3>
                    <p className="text-xs text-zinc-500">
                      Counsel: <span className="font-bold text-black dark:text-white">{c.advocateName}</span> &bull; {c.barCouncilNumber || "High Court of Kerala"}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="self-start sm:self-auto">
                    {isScheduled && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-black text-white dark:bg-white dark:text-black inline-flex items-center gap-1.5 shadow-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Confirmed Session</span>
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed &bull; Advice Recorded</span>
                      </span>
                    )}
                    {isCancelled && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 inline-flex items-center gap-1.5 line-through">
                        <X className="w-3.5 h-3.5" />
                        <span>Cancelled</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs pt-3 border-t border-zinc-100 dark:border-zinc-900">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">
                      Venue / Chamber Coordinates
                    </span>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {c.chamberAddress || "Chamber #412, KHCAA Complex, Marine Drive, Kochi 682031"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">
                      Consultation Retainer Fee
                    </span>
                    <span className="font-mono font-bold text-black dark:text-white text-sm block">
                      ₹{(c.feeAmount || 1500).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Status: {c.paymentStatus?.toUpperCase()}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">
                      Client Briefing Notes
                    </span>
                    <p className="text-[11px] text-zinc-500 line-clamp-2">
                      {c.clientNotes || "No briefing notes attached prior to session."}
                    </p>
                  </div>
                </div>

                {/* Post-Session Legal Advice Summary (if completed) */}
                {c.adviceNotes && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Scale className="w-3.5 h-3.5 text-black dark:text-white" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                        Advocate Written Advice &amp; Chamber Findings
                      </span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans text-xs">
                      {c.adviceNotes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewDossierItem(c)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-zinc-500" />
                      <span>View Session Dossier</span>
                    </button>

                    {isScheduled && (
                      <>
                        <button
                          onClick={() => {
                            setRescheduleItem(c);
                            setNewDate(c.scheduledDate?.split("T")[0] || "");
                            setNewTimeSlot(c.timeSlot || "10:30 AM - 11:15 AM");
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Reschedule</span>
                        </button>

                        <button
                          onClick={() => {
                            setCancelItem(c);
                            setCancelReason("");
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
                  </div>

                  {isVideo && isScheduled && (
                    <button
                      onClick={() => setActiveVideoRoom(c)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-xs transition-opacity"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Virtual Video Chamber</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. Virtual Video Chamber Modal (Live WebRTC Simulator)         */}
      {/* ============================================================== */}
      {activeVideoRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-white shadow-2xl space-y-4 max-h-[92vh] flex flex-col justify-between">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-white">Secure Video Chamber &bull; High Court Counsel</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Counsel: {activeVideoRoom.advocateName} &bull; Room: meet.wakheel.law/chambers-09
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                  {formatTimer(sessionSeconds)}
                </span>
                <button
                  onClick={() => setActiveVideoRoom(null)}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 min-h-[360px]">
              {/* Advocate Primary Stream (2 Cols) */}
              <div className="md:col-span-2 relative rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto text-xl font-bold">
                    MK
                  </div>
                  <span className="text-sm font-bold block">{activeVideoRoom.advocateName}</span>
                  <span className="text-xs text-zinc-400 font-mono block">Counsel Video Feed Active</span>
                </div>

                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-mono">
                  Kerala High Court Chambers
                </div>
              </div>

              {/* Citizen Stream & Case Summary (1 Col) */}
              <div className="flex flex-col gap-3">
                {/* Citizen Self View */}
                <div className="h-44 rounded-2xl bg-zinc-900 border border-zinc-800 relative flex items-center justify-center">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto text-sm font-bold">
                      GO
                    </div>
                    <span className="text-xs font-bold block">You (Client)</span>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono bg-black/60">
                    Self View
                  </div>
                </div>

                {/* Case Subject Memo */}
                <div className="flex-1 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs space-y-2">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                    Session Agenda
                  </span>
                  <p className="text-zinc-300 text-[11px] leading-relaxed line-clamp-4">
                    {activeVideoRoom.subject}
                  </p>
                  <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-400">
                    Encrypted WebRTC Chamber
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                    isMicMuted
                      ? "bg-white text-black border-white"
                      : "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"
                  }`}
                  title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsVideoMuted(!isVideoMuted)}
                  className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                    isVideoMuted
                      ? "bg-white text-black border-white"
                      : "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"
                  }`}
                  title={isVideoMuted ? "Start Camera" : "Stop Camera"}
                >
                  {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={() => setActiveVideoRoom(null)}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-white text-black hover:opacity-90 cursor-pointer shadow-xs"
              >
                End Chamber Conference
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. Reschedule Consultation Modal                               */}
      {/* ============================================================== */}
      {rescheduleItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">Reschedule Chamber Session</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Counsel: {rescheduleItem.advocateName}</p>
              </div>
              <button
                onClick={() => setRescheduleItem(null)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">New Scheduled Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Preferred Time Slot</label>
                <select
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                >
                  <option>10:30 AM - 11:15 AM</option>
                  <option>02:30 PM - 03:15 PM</option>
                  <option>04:00 PM - 04:45 PM</option>
                  <option>05:30 PM - 06:15 PM</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Reason for Rescheduling</label>
                <textarea
                  rows={2}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Awaiting certified revenue sketch from Taluk Office..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setRescheduleItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmReschedule}
                disabled={isSubmittingReschedule || !newDate}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSubmittingReschedule ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Calendar...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm Reschedule</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. Cancel Consultation Modal                                   */}
      {/* ============================================================== */}
      {cancelItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-black dark:text-white">Cancel Consultation</h3>
              <button
                onClick={() => setCancelItem(null)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Are you sure you want to cancel your session with <span className="font-bold text-black dark:text-white">{cancelItem.advocateName}</span>?
              Consultation fees will be credited back to your original payment source.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Reason for Cancellation</label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Matter settled amicably with opposite party..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setCancelItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                Keep Session
              </button>

              <button
                onClick={handleConfirmCancel}
                disabled={isSubmittingCancel}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSubmittingCancel ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Cancellation...</span>
                  </>
                ) : (
                  <span>Cancel Consultation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. View Session Dossier Modal                                  */}
      {/* ============================================================== */}
      {viewDossierItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                  CONSULTATION RECORD &bull; {viewDossierItem._id}
                </span>
                <h3 className="text-base font-bold text-black dark:text-white mt-0.5">{viewDossierItem.subject}</h3>
              </div>
              <button
                onClick={() => setViewDossierItem(null)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-zinc-400 font-mono text-[10px] block">COUNSEL</span>
                  <span className="font-bold text-black dark:text-white">{viewDossierItem.advocateName}</span>
                </div>
                <div>
                  <span className="text-zinc-400 font-mono text-[10px] block">DATE &amp; TIME</span>
                  <span className="font-bold text-black dark:text-white">
                    {new Date(viewDossierItem.scheduledDate).toLocaleDateString("en-IN")} &bull; {viewDossierItem.timeSlot}
                  </span>
                </div>
              </div>
            </div>

            {viewDossierItem.adviceNotes && (
              <div className="space-y-1 text-xs">
                <span className="font-mono font-bold text-zinc-400 uppercase text-[10px] block">
                  Official Written Advice &amp; Findings
                </span>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {viewDossierItem.adviceNotes}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setViewDossierItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
