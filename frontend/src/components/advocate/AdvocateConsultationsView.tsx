"use client";

import React, { useState, useEffect } from "react";
import { advocateApi } from "@/lib/api";
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
  CreditCard,
  PenTool,
} from "lucide-react";

export interface ConsultationItem {
  _id: string;
  id?: string;
  citizenId: string;
  citizenName?: string;
  contactPhone?: string;
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
  actionItems?: string;
  followUpDate?: string;
  feeAmount: number;
  paymentStatus: "pending" | "paid" | "waived";
  status: "scheduled" | "completed" | "rescheduled" | "cancelled";
  cancellationReason?: string;
  rescheduleReason?: string;
  createdAt?: string;
  completedAt?: string;
}

interface AdvocateConsultationsViewProps {
  token?: string;
  advocateName?: string;
}

export const AdvocateConsultationsView: React.FC<AdvocateConsultationsViewProps> = ({
  token,
  advocateName = "Adv. Meera Krishnan",
}) => {
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Host Video Chamber Modal State
  const [activeVideoRoom, setActiveVideoRoom] = useState<ConsultationItem | null>(null);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [inCallQuickNotes, setInCallQuickNotes] = useState<string>("");

  // Record Legal Advice Modal State
  const [adviceModalItem, setAdviceModalItem] = useState<ConsultationItem | null>(null);
  const [adviceContent, setAdviceContent] = useState<string>("");
  const [actionItems, setActionItems] = useState<string>("");
  const [followUpDate, setFollowUpDate] = useState<string>("");
  const [isSubmittingAdvice, setIsSubmittingAdvice] = useState<boolean>(false);

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

  // Dossier Detail Modal
  const [detailItem, setDetailItem] = useState<ConsultationItem | null>(null);

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const res = await advocateApi.getConsultations(token);
      if (res && res.success && Array.isArray(res.consultations)) {
        setConsultations(res.consultations);
      }
    } catch (err) {
      console.error("Failed to load advocate consultations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [token]);

  // Timer for active video chamber room
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeVideoRoom) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSessionSeconds(0);
      setInCallQuickNotes("");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeVideoRoom]);

  // Format Timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // KPI Calculations
  const totalSessions = consultations.length;
  const upcomingCount = consultations.filter((c) => c.status === "scheduled" || c.status === "rescheduled").length;
  const completedCount = consultations.filter((c) => c.status === "completed").length;
  const totalFeesCollected = consultations
    .filter((c) => c.paymentStatus === "paid")
    .reduce((acc, curr) => acc + (Number(curr.feeAmount) || 0), 0);

  // Filtered consultations
  const filteredConsultations = consultations.filter((c) => {
    const matchesSearch =
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.citizenName && c.citizenName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.clientNotes && c.clientNotes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.adviceNotes && c.adviceNotes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "UPCOMING") return c.status === "scheduled" || c.status === "rescheduled";
    if (statusFilter === "COMPLETED") return c.status === "completed";
    if (statusFilter === "CANCELLED") return c.status === "cancelled";
    return true;
  });

  // Handle Record Advice
  const handleSaveAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adviceModalItem || !adviceContent.trim()) return;

    try {
      setIsSubmittingAdvice(true);
      const res = await advocateApi.recordConsultationAdvice(
        adviceModalItem._id || adviceModalItem.id || "",
        adviceContent.trim(),
        {
          actionItems: actionItems.trim(),
          followUpDate: followUpDate || undefined,
        },
        token
      );
      if (res && res.success) {
        setFeedback({
          type: "success",
          text: "Legal advice & findings recorded successfully. Synced to citizen consultation dossier.",
        });
        setAdviceModalItem(null);
        setAdviceContent("");
        setActionItems("");
        setFollowUpDate("");
        await fetchConsultations();
      } else {
        setFeedback({ type: "error", text: res?.message || "Failed to record legal advice." });
      }
    } catch (err: any) {
      console.error("Advice submit error:", err);
      setFeedback({ type: "error", text: err?.message || "Failed to submit advice." });
    } finally {
      setIsSubmittingAdvice(false);
    }
  };

  // Handle Reschedule
  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleItem || !newDate) return;

    try {
      setIsSubmittingReschedule(true);
      const res = await advocateApi.rescheduleConsultation(
        rescheduleItem._id || rescheduleItem.id || "",
        newDate,
        newTimeSlot,
        rescheduleReason.trim(),
        token
      );
      if (res && res.success) {
        setFeedback({
          type: "success",
          text: `Chamber consultation rescheduled to ${newDate} (${newTimeSlot}). Citizen has been notified.`,
        });
        setRescheduleItem(null);
        setNewDate("");
        setRescheduleReason("");
        await fetchConsultations();
      } else {
        setFeedback({ type: "error", text: res?.message || "Failed to reschedule session." });
      }
    } catch (err: any) {
      console.error("Reschedule error:", err);
      setFeedback({ type: "error", text: err?.message || "Failed to reschedule session." });
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  // Handle Cancel
  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelItem) return;

    try {
      setIsSubmittingCancel(true);
      const res = await advocateApi.cancelConsultation(
        cancelItem._id || cancelItem.id || "",
        cancelReason.trim() || "Chamber schedule adjournment due to urgent court listing",
        token
      );
      if (res && res.success) {
        setFeedback({
          type: "success",
          text: "Consultation cancelled. Fee refund process initiated to client.",
        });
        setCancelItem(null);
        setCancelReason("");
        await fetchConsultations();
      } else {
        setFeedback({ type: "error", text: res?.message || "Failed to cancel consultation." });
      }
    } catch (err: any) {
      console.error("Cancel error:", err);
      setFeedback({ type: "error", text: err?.message || "Failed to cancel consultation." });
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
              Chamber OS • Appointments &amp; Virtual Sessions
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
              Host: {advocateName}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mt-1">
            Chamber Consultations &amp; Video Sessions
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Host encrypted virtual video consultations, manage physical High Court chamber bookings, and dispatch formal written legal advice.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchConsultations}
            disabled={loading}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Refresh Chamber Calendar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-black dark:text-white">
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-black dark:text-white" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-zinc-500" />
            )}
            <span className="font-semibold">{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4-KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1 shadow-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 block">TOTAL CHAMBER BOOKINGS</span>
          <div className="text-2xl font-extrabold text-black dark:text-white">{totalSessions}</div>
          <span className="text-[11px] text-zinc-400">All recorded sessions</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1 shadow-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 block">UPCOMING &amp; CONFIRMED</span>
          <div className="text-2xl font-extrabold text-black dark:text-white">{upcomingCount}</div>
          <span className="text-[11px] text-zinc-400">Scheduled hearings &amp; visits</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1 shadow-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 block">COMPLETED &amp; ADVISED</span>
          <div className="text-2xl font-extrabold text-black dark:text-white">{completedCount}</div>
          <span className="text-[11px] text-zinc-400">Advice dispatched to client</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1 shadow-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 block">CHAMBER REVENUE EARNED</span>
          <div className="text-2xl font-extrabold text-black dark:text-white">
            ₹{totalFeesCollected.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-zinc-400">Paid consultation fees</span>
        </div>
      </div>

      {/* Search & Tabs Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          {[
            { id: "ALL", label: "All Sessions" },
            { id: "UPCOMING", label: "Upcoming / Active" },
            { id: "COMPLETED", label: "Completed" },
            { id: "CANCELLED", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-white dark:bg-black text-black dark:text-white shadow-xs font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by client, matter, or advice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3">
          <RefreshCw className="w-5 h-5 mx-auto animate-spin text-zinc-400" />
          <p>Syncing chamber consultation records...</p>
        </div>
      ) : filteredConsultations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2">
          <Scale className="w-8 h-8 mx-auto text-zinc-400" />
          <h3 className="text-sm font-bold text-black dark:text-white">No Consultations Found</h3>
          <p className="text-xs text-zinc-500">
            {searchQuery
              ? "No sessions match your search criteria."
              : "No appointments scheduled under this category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredConsultations.map((item) => {
            const isVideo = item.consultationType === "video";
            const isChamber = item.consultationType === "chamber";
            const isUpcoming = item.status === "scheduled" || item.status === "rescheduled";
            const isCompleted = item.status === "completed";
            const isCancelled = item.status === "cancelled";

            return (
              <div
                key={item._id || item.id}
                className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs hover:border-black dark:hover:border-white transition-all flex flex-col justify-between"
              >
                {/* Header Strip */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white flex items-center gap-1">
                        {isVideo && <Video className="w-3 h-3" />}
                        {isChamber && <Building className="w-3 h-3" />}
                        {!isVideo && !isChamber && <PhoneCall className="w-3 h-3" />}
                        <span>{item.consultationType} Chamber</span>
                      </span>

                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                        {item.durationMinutes || 45} MINS
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isUpcoming
                          ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                          : isCompleted
                          ? "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white"
                          : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 line-through"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Subject & Client Info */}
                  <div>
                    <h3 className="text-sm font-bold text-black dark:text-white leading-snug">
                      {item.subject}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                      <span className="font-semibold text-black dark:text-white flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.citizenName || "Citizen Client"}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">ID: {item.citizenId}</span>
                    </div>
                  </div>

                  {/* Date & Fee Metadata */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">SCHEDULED SESSION</span>
                      <span className="font-bold text-black dark:text-white flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {item.scheduledDate ? item.scheduledDate.split("T")[0] : "Today"} • {item.timeSlot}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">FEE SETTLEMENT</span>
                      <span className="font-bold text-black dark:text-white flex items-center gap-1 mt-0.5">
                        <CreditCard className="w-3 h-3" />
                        ₹{item.feeAmount || 1500} • <span className="capitalize">{item.paymentStatus || "Paid"}</span>
                      </span>
                    </div>
                  </div>

                  {/* Client Pre-Session Brief Notes */}
                  {item.clientNotes && (
                    <div className="p-2.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 text-xs space-y-0.5">
                      <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 block">
                        CLIENT BRIEF / GRIEVANCE NOTES:
                      </span>
                      <p className="text-zinc-700 dark:text-zinc-300 italic line-clamp-2">
                        "{item.clientNotes}"
                      </p>
                    </div>
                  )}

                  {/* Advocate Post-Consultation Advice Notes */}
                  {item.adviceNotes && (
                    <div className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase font-bold text-black dark:text-white flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-black dark:text-white" />
                          DISPATCHED LEGAL ADVICE &amp; FINDINGS:
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">Synced to Citizen Vault</span>
                      </div>
                      <p className="text-zinc-800 dark:text-zinc-200 font-serif leading-relaxed line-clamp-3">
                        {item.adviceNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons Strip */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDetailItem(item)}
                      className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white cursor-pointer transition-colors"
                    >
                      View Dossier
                    </button>

                    {isUpcoming && (
                      <>
                        <button
                          onClick={() => {
                            setRescheduleItem(item);
                            setNewDate(item.scheduledDate ? item.scheduledDate.split("T")[0] : "");
                            setNewTimeSlot(item.timeSlot || "10:30 AM - 11:15 AM");
                            setRescheduleReason("");
                          }}
                          className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white cursor-pointer transition-colors"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => {
                            setCancelItem(item);
                            setCancelReason("");
                          }}
                          className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {/* Record / Edit Advice Button */}
                    <button
                      onClick={() => {
                        setAdviceModalItem(item);
                        setAdviceContent(item.adviceNotes || "");
                        setActionItems(item.actionItems || "");
                        setFollowUpDate(item.followUpDate ? item.followUpDate.split("T")[0] : "");
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-xs font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>{item.adviceNotes ? "Edit Legal Advice" : "Record Legal Advice"}</span>
                    </button>

                    {/* Launch Host Video Chamber Button */}
                    {isVideo && isUpcoming && (
                      <button
                        onClick={() => {
                          setActiveVideoRoom(item);
                          setInCallQuickNotes(item.adviceNotes || "");
                        }}
                        className="px-4 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Host Video Chamber</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Virtual Video Chamber Host Room (WebRTC Simulator)              */}
      {/* ========================================================================= */}
      {activeVideoRoom && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl h-[88vh] bg-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Top Chamber Bar */}
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    LIVE CHAMBER CONSULTATION
                  </span>
                </div>
                <span className="text-zinc-600">|</span>
                <span className="text-xs text-zinc-300 font-semibold truncate max-w-xs sm:max-w-md">
                  {activeVideoRoom.subject}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-black">
                  HOST COUNSEL
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full font-mono text-xs font-bold bg-zinc-800 text-white border border-zinc-700">
                  {formatTimer(sessionSeconds)}
                </span>
                <button
                  onClick={() => setActiveVideoRoom(null)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Canvas & Side In-Call Notes Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden">
              {/* Video Panels (2 Columns on Large) */}
              <div className="lg:col-span-2 p-4 bg-zinc-950 flex flex-col justify-between space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  {/* Host Video Stream (Advocate) */}
                  <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden min-h-[220px]">
                    {isVideoMuted ? (
                      <div className="flex flex-col items-center gap-2 text-zinc-500">
                        <VideoOff className="w-8 h-8" />
                        <span className="text-xs font-mono">Advocate Video Muted</span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex flex-col items-center justify-center relative">
                        <Scale className="w-16 h-16 text-zinc-700" />
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-bold text-white border border-zinc-700">
                          {advocateName} (Host • Chamber)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remote Client Stream */}
                  <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden min-h-[220px]">
                    <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center relative">
                      <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg font-bold text-white mb-2">
                        {activeVideoRoom.citizenName?.charAt(0) || "C"}
                      </div>
                      <span className="text-xs text-zinc-400 font-medium">
                        {activeVideoRoom.citizenName || "Citizen Client"}
                      </span>
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-bold text-white border border-zinc-700">
                        Citizen Client • WebRTC Video Live
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Controls Bar */}
                <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                  <button
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`p-3 rounded-full cursor-pointer transition-all ${
                      isMicMuted ? "bg-rose-500 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-white"
                    }`}
                    title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                  >
                    {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setIsVideoMuted(!isVideoMuted)}
                    className={`p-3 rounded-full cursor-pointer transition-all ${
                      isVideoMuted ? "bg-rose-500 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-white"
                    }`}
                    title={isVideoMuted ? "Turn On Camera" : "Turn Off Camera"}
                  >
                    {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(activeVideoRoom.meetingLink || window.location.href);
                        setFeedback({ type: "success", text: "Secure meeting room link copied to clipboard!" });
                      }
                    }}
                    className="p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
                    title="Copy Meeting Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      const item = activeVideoRoom;
                      setActiveVideoRoom(null);
                      setAdviceModalItem(item);
                      setAdviceContent(inCallQuickNotes);
                    }}
                    className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Conclude &amp; Record Advice</span>
                  </button>

                  <button
                    onClick={() => setActiveVideoRoom(null)}
                    className="px-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Leave Room
                  </button>
                </div>
              </div>

              {/* Side In-Call Notepad & Client Dossier (1 Column on Large) */}
              <div className="p-4 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 flex flex-col justify-between space-y-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="space-y-1 pb-3 border-b border-zinc-800">
                    <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block">CLIENT BRIEF</span>
                    <h4 className="text-xs font-bold text-white">{activeVideoRoom.subject}</h4>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      {activeVideoRoom.clientNotes || "No preliminary briefing notes submitted by client."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block">
                      IN-CALL CHAMBER NOTEPAD:
                    </span>
                    <textarea
                      rows={8}
                      value={inCallQuickNotes}
                      onChange={(e) => setInCallQuickNotes(e.target.value)}
                      placeholder="Jot down client disclosures, disputed facts, statutory provisions to contest, or interim relief notes during the call..."
                      className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none leading-relaxed font-mono"
                    />
                    <span className="text-[10px] text-zinc-500 block">
                      Notes will carry over to the Record Written Advice memo upon concluding session.
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-white font-bold">
                    <Shield className="w-3.5 h-3.5" />
                    <span>256-bit End-to-End Encrypted Chamber</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Complies with Advocate-Client Privilege (Sec. 126, Indian Evidence Act / BSA 2023).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Record Written Legal Advice & Findings                           */}
      {/* ========================================================================= */}
      {adviceModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-black dark:text-white" />
                <h3 className="text-base font-bold text-black dark:text-white">
                  Record Formal Legal Advice &amp; Findings
                </h3>
              </div>
              <button
                onClick={() => setAdviceModalItem(null)}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 block">
                MATTER / SUBJECT BRIEF:
              </span>
              <span className="font-bold text-black dark:text-white">{adviceModalItem.subject}</span>
              <p className="text-zinc-500 text-[11px]">
                Citizen: {adviceModalItem.citizenName || adviceModalItem.citizenId} • Date:{" "}
                {adviceModalItem.scheduledDate?.split("T")[0]} ({adviceModalItem.timeSlot})
              </p>
            </div>

            <form onSubmit={handleSaveAdvice} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white block uppercase tracking-wider">
                  Chamber Legal Findings &amp; Ratio Decidendi:
                </label>
                <textarea
                  rows={5}
                  value={adviceContent}
                  onChange={(e) => setAdviceContent(e.target.value)}
                  placeholder="Record formal opinion, binding statutory provisions (e.g. Telegraph Act Sec. 16, NI Act Sec. 138), precedent ratios, and assessment of legal merits..."
                  className="w-full p-3.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none leading-relaxed font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white block uppercase tracking-wider">
                    Recommended Action for Client:
                  </label>
                  <input
                    type="text"
                    value={actionItems}
                    onChange={(e) => setActionItems(e.target.value)}
                    placeholder="e.g. Obtain revenue sketch, execute vakalat"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white block uppercase tracking-wider">
                    Follow-up Court / Chamber Date:
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500">
                Saving this advice will mark the consultation as <strong>Completed</strong> and immediately publish this formal memorandum into the citizen's Consultation &amp; Vault Dossier.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAdviceModalItem(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdvice || !adviceContent.trim()}
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmittingAdvice ? "Saving..." : "Save & Dispatch to Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Reschedule Consultation                                         */}
      {/* ========================================================================= */}
      {rescheduleItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-black dark:text-white">
                Reschedule Chamber Session
              </h3>
              <button
                onClick={() => setRescheduleItem(null)}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-black dark:text-white">New Scheduled Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-black dark:text-white">Chamber Time Slot</label>
                <select
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                >
                  <option value="10:30 AM - 11:15 AM">10:30 AM - 11:15 AM (Morning High Court Slot)</option>
                  <option value="02:30 PM - 03:15 PM">02:30 PM - 03:15 PM (Post-Lunch Chamber Slot)</option>
                  <option value="04:30 PM - 05:15 PM">04:30 PM - 05:15 PM (Evening Conference Slot)</option>
                  <option value="06:00 PM - 06:45 PM">06:00 PM - 06:45 PM (Chamber Consultation)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-black dark:text-white">Adjournment Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Urgent Special Bench listing before High Court"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRescheduleItem(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReschedule || !newDate}
                  className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingReschedule ? "Saving..." : "Confirm Reschedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Cancel Consultation                                             */}
      {/* ========================================================================= */}
      {cancelItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-black dark:text-white">
                Cancel Consultation Session
              </h3>
              <button
                onClick={() => setCancelItem(null)}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Are you sure you want to cancel this chamber session for{" "}
                <span className="font-bold text-black dark:text-white">{cancelItem.subject}</span>?
              </p>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-black dark:text-white">Cancellation Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Counsel engaged in Division Bench final hearing"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500">
                Cancelling will automatically initiate a full fee refund of ₹{cancelItem.feeAmount || 1500} to the client's original payment source.
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancelItem(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  Keep Active
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCancel}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingCancel ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: Full Session Dossier & Print View                               */}
      {/* ========================================================================= */}
      {detailItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 block">
                  CHAMBER CONSULTATION DOSSIER
                </span>
                <h3 className="text-base font-bold text-black dark:text-white">{detailItem.subject}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer text-zinc-600 dark:text-zinc-400"
                  title="Print Consultation Memo"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDetailItem(null)}
                  className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 block font-mono">STATUS</span>
                <span className="font-bold text-black dark:text-white capitalize">{detailItem.status}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 block font-mono">CHAMBER TYPE</span>
                <span className="font-bold text-black dark:text-white capitalize">{detailItem.consultationType}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 block font-mono">FEE AMOUNT</span>
                <span className="font-bold text-black dark:text-white">
                  ₹{detailItem.feeAmount || 1500} ({detailItem.paymentStatus || "Paid"})
                </span>
              </div>
            </div>

            {/* Client Brief */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 block">
                CLIENT SUBMITTED BRIEF:
              </span>
              <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                {detailItem.clientNotes || "No briefing notes submitted by client prior to session."}
              </p>
            </div>

            {/* Written Legal Advice */}
            <div className="p-4 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900">
                <span className="text-[10px] font-mono uppercase font-bold text-black dark:text-white flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  DISPATCHED ADVOCATE LEGAL FINDINGS &amp; OPINION:
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Privileged Advice</span>
              </div>
              <p className="text-xs text-zinc-800 dark:text-zinc-200 font-serif leading-relaxed whitespace-pre-line">
                {detailItem.adviceNotes || "Pending written advice. Click 'Record Legal Advice' to draft findings."}
              </p>
              {detailItem.actionItems && (
                <div className="pt-2 text-xs">
                  <span className="font-bold text-black dark:text-white">Action by Client:</span>{" "}
                  <span className="text-zinc-600 dark:text-zinc-400">{detailItem.actionItems}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setDetailItem(null)}
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
