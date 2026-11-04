"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Mail,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  FileText,
  FileCheck,
  Scale,
  Building2,
  Calculator,
  Percent,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Send,
  Eye,
  KeyRound,
  Video,
  ExternalLink,
  Download,
  Printer,
  ChevronRight,
  ChevronDown,
  X,
  Copy,
  Check,
  Sparkles,
  Paperclip,
  Gavel,
  Calendar,
  AlertCircle,
} from "lucide-react";
import {
  statutoryNoticeApi,
  StatutoryNoticeItem,
  NoticeAnnexure,
} from "@/lib/statutoryNoticeApi";
import { useTheme } from "@/context/ThemeContext";

interface StatutoryNoticeMailroomViewProps {
  firmName?: string;
  csName?: string;
  caName?: string;
  defaultClient?: {
    name: string;
    cin?: string;
    pan?: string;
    gstin?: string;
  };
}

export function StatutoryNoticeMailroomView({
  firmName = "Wakheel Corporate & Tax Advisory LLP",
  csName = "CS Rajesh Sharma (FCS-8921, CP-10293)",
  caName = "CA Ramanathan Iyer (M.No 054921, FRN-018241N)",
  defaultClient = {
    name: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    pan: "AAECS1234F",
    gstin: "07AAECS1234F1Z8",
  },
}: StatutoryNoticeMailroomViewProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // State
  const [notices, setNotices] = useState<StatutoryNoticeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<StatutoryNoticeItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters
  const [portalFilter, setPortalFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [replyStudioOpen, setReplyStudioOpen] = useState(false);
  const [hearingModalOpen, setHearingModalOpen] = useState(false);
  const [newNoticeModalOpen, setNewNoticeModalOpen] = useState(false);
  const [attachAnnexureOpen, setAttachAnnexureOpen] = useState(false);
  const [isDscSigning, setIsDscSigning] = useState(false);

  // Reply Studio State
  const [customObjection, setCustomObjection] = useState("");
  const [customFacts, setCustomFacts] = useState("");
  const [generatingReply, setGeneratingReply] = useState(false);

  // Annexure Form State
  const [annexureTitle, setAnnexureTitle] = useState("");
  const [annexureLabel, setAnnexureLabel] = useState("Annexure A");
  const [annexureFileName, setAnnexureFileName] = useState("GSTR2B_Reconciliation.xlsx");

  // Hearing Form State
  const [hearingDate, setHearingDate] = useState("2026-11-20");
  const [hearingTime, setHearingTime] = useState("11:30 AM");
  const [hearingMode, setHearingMode] = useState<"VIRTUAL_VC" | "PHYSICAL_APPEARANCE">("VIRTUAL_VC");
  const [hearingLink, setHearingLink] = useState("https://delhigst.webex.com/meet/adjudication");
  const [assignedCounsel, setAssignedCounsel] = useState(csName);

  // New Notice Ingestion Form State
  const [newReference, setNewReference] = useState("");
  const [newPortal, setNewPortal] = useState<"GSTN" | "CBDT_INCOME_TAX" | "MCA21">("GSTN");
  const [newAuthority, setNewAuthority] = useState("Office of the Assistant Commissioner of State Tax");
  const [newSection, setNewSection] = useState("Section 73(1), CGST Act, 2017");
  const [newSubject, setNewSubject] = useState("");
  const [newDemandAmount, setNewDemandAmount] = useState<number>(500000);
  const [newLimitationDays, setNewLimitationDays] = useState<number>(30);

  // Load Notices
  const loadNotices = async () => {
    setLoading(true);
    try {
      const res = await statutoryNoticeApi.getNotices({
        portal: portalFilter,
        status: statusFilter,
        search: searchQuery,
      });
      if (res.success && res.notices) {
        setNotices(res.notices);
        if (!selectedNotice && res.notices.length > 0) {
          setSelectedNotice(res.notices[0]);
        }
      }
    } catch (err) {
      console.error("Error loading statutory notices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, [portalFilter, statusFilter, searchQuery]);

  // Format Currency
  const formatInr = (amount?: number | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Copy to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Limitation Calculator
  const getLimitationInfo = (deadlineStr: string, status: string) => {
    if (status === "REPLY_FILED" || status === "DISCHARGED_CLOSED") {
      return {
        daysLeft: 0,
        label: status === "REPLY_FILED" ? "Reply Filed On Time" : "Closed / Discharged",
        colorClass: "text-blue-600 dark:text-blue-400",
        badgeStyle: isDark
          ? { backgroundColor: "#1e1b4b", color: "#c7d2fe", borderColor: "#3730a3" }
          : { backgroundColor: "#e0e7ff", color: "#3730a3", borderColor: "#a5b4fc" },
        urgent: false,
      };
    }

    const now = new Date();
    const deadline = new Date(deadlineStr);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return {
        daysLeft: diffDays,
        label: "Limitation Expired (Urgent Condonation Needed)",
        colorClass: "text-red-600 dark:text-red-400",
        badgeStyle: isDark
          ? { backgroundColor: "#450a0a", color: "#fecaca", borderColor: "#991b1b" }
          : { backgroundColor: "#fee2e2", color: "#991b1b", borderColor: "#fca5a5" },
        urgent: true,
      };
    } else if (diffDays <= 5) {
      return {
        daysLeft: diffDays,
        label: `CRITICAL: ${diffDays} Days Left to Respond`,
        colorClass: "text-red-600 dark:text-red-400",
        badgeStyle: isDark
          ? { backgroundColor: "#450a0a", color: "#fecaca", borderColor: "#991b1b" }
          : { backgroundColor: "#fee2e2", color: "#991b1b", borderColor: "#fca5a5" },
        urgent: true,
      };
    } else if (diffDays <= 15) {
      return {
        daysLeft: diffDays,
        label: `${diffDays} Days Left to Respond`,
        colorClass: "text-amber-600 dark:text-amber-400",
        badgeStyle: isDark
          ? { backgroundColor: "#451a03", color: "#fde68a", borderColor: "#78350f" }
          : { backgroundColor: "#fef3c7", color: "#92400e", borderColor: "#fcd34d" },
        urgent: false,
      };
    } else {
      return {
        daysLeft: diffDays,
        label: `${diffDays} Days Remaining`,
        colorClass: "text-emerald-600 dark:text-emerald-400",
        badgeStyle: isDark
          ? { backgroundColor: "#052e16", color: "#a7f3d0", borderColor: "#166534" }
          : { backgroundColor: "#d1fae5", color: "#065f46", borderColor: "#6ee7b7" },
        urgent: false,
      };
    }
  };

  // Filtered Notices Count and Metrics
  const metrics = useMemo(() => {
    const totalExposure = notices.reduce(
      (sum, n) => sum + (n.demandBreakdown?.totalDisputedAmount || 0),
      0
    );
    const criticalCount = notices.filter(
      (n) => n.riskSeverity === "CRITICAL" && n.status !== "REPLY_FILED" && n.status !== "DISCHARGED_CLOSED"
    ).length;
    const pendingCount = notices.filter(
      (n) => n.status === "PENDING_RESPONSE" || n.status === "REPLY_DRAFTED"
    ).length;
    const filedCount = notices.filter((n) => n.status === "REPLY_FILED").length;

    return { totalExposure, criticalCount, pendingCount, filedCount };
  }, [notices]);

  // Handle Legal Reply Generation
  const handleGenerateReply = async () => {
    if (!selectedNotice) return;
    setGeneratingReply(true);
    try {
      const res = await statutoryNoticeApi.generateReply(
        selectedNotice.id || selectedNotice.noticeId,
        {
          authorName: `${csName} & ${caName}`,
          customJurisdictionalObjection: customObjection.trim() || undefined,
          customFacts: customFacts.trim() || undefined,
        }
      );
      if (res.success && res.notice) {
        setSelectedNotice(res.notice);
        setNotices((prev) =>
          prev.map((n) =>
            (n.id || n.noticeId) === (res.notice.id || res.notice.noticeId) ? res.notice : n
          )
        );
      }
    } catch (err) {
      console.error("Error generating reply:", err);
    } finally {
      setGeneratingReply(false);
    }
  };

  // Handle DSC Signing
  const handleSignDsc = async () => {
    if (!selectedNotice) return;
    setIsDscSigning(true);
    try {
      const res = await statutoryNoticeApi.signWithDsc(
        selectedNotice.id || selectedNotice.noticeId,
        {
          dscSignatory: csName,
          dscSerialNumber: "7A 4B 91 02 C8 3F E1 2D",
          role: "Authorized CS / Counsel",
        }
      );
      if (res.success && res.notice) {
        setSelectedNotice(res.notice);
        setNotices((prev) =>
          prev.map((n) =>
            (n.id || n.noticeId) === (res.notice.id || res.notice.noticeId) ? res.notice : n
          )
        );
        alert(`✅ Reply Digitally Signed & Filed successfully! Acknowledgment #${res.filingReceipt.acknowledgmentNumber}`);
      }
    } catch (err) {
      console.error("Error signing reply with DSC:", err);
      alert("Failed to sign reply with DSC. Ensure token is connected.");
    } finally {
      setIsDscSigning(false);
    }
  };

  // Handle Add Annexure
  const handleAddAnnexure = async () => {
    if (!selectedNotice || !annexureTitle.trim()) return;
    try {
      const res = await statutoryNoticeApi.attachAnnexure(
        selectedNotice.id || selectedNotice.noticeId,
        {
          label: annexureLabel,
          documentTitle: annexureTitle,
          fileName: annexureFileName,
          sha256Hash: `sha256_${Math.random().toString(36).substring(2, 15)}`,
        }
      );
      if (res.success && res.notice) {
        setSelectedNotice(res.notice);
        setNotices((prev) =>
          prev.map((n) =>
            (n.id || n.noticeId) === (res.notice.id || res.notice.noticeId) ? res.notice : n
          )
        );
        setAttachAnnexureOpen(false);
        setAnnexureTitle("");
      }
    } catch (err) {
      console.error("Error attaching annexure:", err);
    }
  };

  // Handle Schedule Hearing
  const handleScheduleHearing = async () => {
    if (!selectedNotice) return;
    try {
      const res = await statutoryNoticeApi.scheduleHearing(
        selectedNotice.id || selectedNotice.noticeId,
        {
          hearingDate,
          hearingTime,
          hearingMode,
          meetingLink: hearingLink,
          assignedCounsel,
          benchOrOfficer: selectedNotice.issuingAuthority,
        }
      );
      if (res.success && res.notice) {
        setSelectedNotice(res.notice);
        setNotices((prev) =>
          prev.map((n) =>
            (n.id || n.noticeId) === (res.notice.id || res.notice.noticeId) ? res.notice : n
          )
        );
        setHearingModalOpen(false);
        alert("✅ Virtual Personal Hearing scheduled successfully!");
      }
    } catch (err) {
      console.error("Error scheduling hearing:", err);
    }
  };

  // Handle Create New Notice
  const handleCreateNotice = async () => {
    if (!newReference.trim() || !newSubject.trim()) return;
    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + newLimitationDays);
      const limitationDeadline = deadline.toISOString().split("T")[0];

      const res = await statutoryNoticeApi.createNotice({
        referenceNumber: newReference,
        portal: newPortal,
        issuingAuthority: newAuthority,
        statutorySection: newSection,
        noticeType: "SHOW_CAUSE_NOTICE",
        allegationSubject: newSubject,
        allegationDetails: `Notice served by ${newAuthority} under ${newSection}. Statutory response mandated within ${newLimitationDays} days.`,
        demandBreakdown: {
          principalTaxOrFee: newDemandAmount,
          interest: Math.round(newDemandAmount * 0.18),
          penalty: Math.round(newDemandAmount * 0.1),
          totalDisputedAmount: Math.round(newDemandAmount * 1.28),
        },
        financialYear: "2025-26",
        dateOfNotice: new Date().toISOString().split("T")[0],
        dateOfService: new Date().toISOString().split("T")[0],
        limitationDeadline,
        statutoryDaysAllowed: newLimitationDays,
        clientEntity: {
          name: defaultClient.name,
          cin: defaultClient.cin,
          pan: defaultClient.pan,
          gstin: defaultClient.gstin,
        },
      });

      if (res.success && res.notice) {
        setNotices((prev) => [res.notice, ...prev]);
        setSelectedNotice(res.notice);
        setNewNoticeModalOpen(false);
        setNewReference("");
        setNewSubject("");
      }
    } catch (err) {
      console.error("Error creating notice:", err);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* =========================================================================
          TOP EXECUTIVE COMMAND BANNER: STATUTORY E-NOTICE & SCN MAILROOM
      ========================================================================= */}
      <div
        className="p-6 sm:p-7 rounded-3xl border-2 relative overflow-hidden shadow-xs"
        style={
          isDark
            ? { backgroundColor: "#09090b", borderColor: "#27272a", color: "#ffffff" }
            : { backgroundColor: "#ffffff", borderColor: "#e4e4e7", color: "#09090b" }
        }
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-[11px] font-mono font-black tracking-widest uppercase shadow-xs border"
                style={
                  isDark
                    ? { backgroundColor: "#ffffff", color: "#09090b", borderColor: "#ffffff" }
                    : { backgroundColor: "#09090b", color: "#ffffff", borderColor: "#09090b" }
                }
              >
                STATUTORY E-NOTICE MAILROOM
              </span>
              <span
                className="px-3 py-1 rounded-full border text-[11px] font-mono font-bold flex items-center gap-1.5"
                style={
                  isDark
                    ? { backgroundColor: "#450a0a", color: "#fecaca", borderColor: "#991b1b" }
                    : { backgroundColor: "#fee2e2", color: "#991b1b", borderColor: "#fca5a5" }
                }
              >
                <Clock className="w-3.5 h-3.5 text-red-600" />
                Limitation Clocks Active
              </span>
              <span
                className="px-3 py-1 rounded-full border text-[11px] font-mono font-bold"
                style={
                  isDark
                    ? { backgroundColor: "#1e1b4b", color: "#c7d2fe", borderColor: "#3730a3" }
                    : { backgroundColor: "#e0e7ff", color: "#3730a3", borderColor: "#a5b4fc" }
                }
              >
                MCA21 • GSTN • CBDT Faceless Unit
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2
                className="text-2xl sm:text-3xl font-black tracking-tight"
                style={{ color: isDark ? "#ffffff" : "#09090b" }}
              >
                Show Cause Notices &amp; Statutory Summons Mailroom
              </h2>
            </div>

            <p
              className="text-xs sm:text-sm max-w-3xl leading-relaxed font-normal"
              style={{ color: isDark ? "#d4d4d8" : "#3f3f46" }}
            >
              Centralized dispute gateway tracking incoming inquiry summons under MCA Section 206, GST DRC-01/01A show cause demands, and Income Tax Section 148A reassessments with statutory limitation clocks, jurisdictional rebuttal drafter, and Class 3 DSC execution.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2.5 shrink-0">
            <button
              onClick={() => setNewNoticeModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer border"
              style={
                isDark
                  ? { backgroundColor: "#ffffff", color: "#09090b", borderColor: "#ffffff" }
                  : { backgroundColor: "#09090b", color: "#ffffff", borderColor: "#09090b" }
              }
            >
              <Plus className="w-4 h-4" />
              <span>Ingest Notice / SCN</span>
            </button>

            <button
              onClick={loadNotices}
              className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-xs"
              style={
                isDark
                  ? { backgroundColor: "#18181b", color: "#f4f4f5", borderColor: "#3f3f46" }
                  : { backgroundColor: "#f4f4f5", color: "#18181b", borderColor: "#d4d4d8" }
              }
              title="Refresh notices from statutory APIs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-red-600" : ""}`} />
              <span>Sync Portals</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div
          className="p-4 rounded-2xl border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-6 font-mono"
          style={
            isDark
              ? { backgroundColor: "#18181b", borderColor: "#27272a" }
              : { backgroundColor: "#f4f4f5", borderColor: "#e4e4e7" }
          }
        >
          <div>
            <span className="text-[10px] uppercase font-bold block" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
              TOTAL DISPUTED EXPOSURE
            </span>
            <span className="font-black text-base text-red-600 dark:text-red-400">
              {formatInr(metrics.totalExposure)}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold block" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
              CRITICAL LIMITATIONS (&lt; 5 DAYS)
            </span>
            <span className="font-black text-base text-amber-600 dark:text-amber-400">
              {metrics.criticalCount} Notices Urgently Due
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold block" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
              PENDING REBUTTALS
            </span>
            <span className="font-black text-base" style={{ color: isDark ? "#ffffff" : "#09090b" }}>
              {metrics.pendingCount} Drafts in Progress
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold block" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
              REPLIES FILED WITH DSC
            </span>
            <span className="font-black text-base text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {metrics.filedCount} Discharged / Acknowledged
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PORTAL TABS & SEARCH BAR
      ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", label: "All Notices", icon: Mail, count: notices.length },
            { id: "GSTN", label: "GSTN (DRC-01 / 01A)", icon: Percent, count: notices.filter((n) => n.portal === "GSTN").length },
            { id: "CBDT_INCOME_TAX", label: "Income Tax (148A / 143(2))", icon: Calculator, count: notices.filter((n) => n.portal === "CBDT_INCOME_TAX").length },
            { id: "MCA21", label: "MCA21 (Sec 206 Inquiry)", icon: Building2, count: notices.filter((n) => n.portal === "MCA21").length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = portalFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setPortalFilter(tab.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border"
                style={
                  isActive
                    ? isDark
                      ? { backgroundColor: "#ffffff", color: "#09090b", borderColor: "#ffffff" }
                      : { backgroundColor: "#09090b", color: "#ffffff", borderColor: "#09090b" }
                    : isDark
                    ? { backgroundColor: "#18181b", color: "#a1a1aa", borderColor: "#27272a" }
                    : { backgroundColor: "#ffffff", color: "#52525b", borderColor: "#e4e4e7" }
                }
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                <span
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                  style={
                    isActive
                      ? isDark
                        ? { backgroundColor: "#e4e4e7", color: "#09090b" }
                        : { backgroundColor: "#27272a", color: "#ffffff" }
                      : isDark
                      ? { backgroundColor: "#27272a", color: "#a1a1aa" }
                      : { backgroundColor: "#f4f4f5", color: "#71717a" }
                  }
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_RESPONSE">Pending Response</option>
            <option value="REPLY_DRAFTED">Reply Drafted</option>
            <option value="REPLY_FILED">Reply Filed</option>
            <option value="HEARING_SCHEDULED">Hearing Scheduled</option>
          </select>

          <div className="relative w-56 sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, section, DIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          NOTICES LIST & ACTIVE DOSSIER SPLIT VIEW
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Notice Cards List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="p-8 rounded-2xl border text-center font-mono text-xs text-zinc-500 animate-pulse">
              Syncing statutory notice dockets...
            </div>
          ) : notices.length === 0 ? (
            <div className="p-8 rounded-2xl border text-center font-mono text-xs text-zinc-500 space-y-2">
              <Mail className="w-8 h-8 mx-auto text-zinc-400" />
              <p>No statutory notices found under selected filters.</p>
            </div>
          ) : (
            notices.map((notice) => {
              const isSelected = selectedNotice?.noticeId === notice.noticeId;
              const lim = getLimitationInfo(notice.limitationDeadline, notice.status);

              return (
                <div
                  key={notice.noticeId}
                  onClick={() => setSelectedNotice(notice)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-3 relative ${
                    isSelected ? "shadow-md scale-101" : "shadow-xs hover:border-zinc-400"
                  }`}
                  style={
                    isSelected
                      ? isDark
                        ? { backgroundColor: "#18181b", borderColor: "#ffffff", color: "#ffffff" }
                        : { backgroundColor: "#ffffff", borderColor: "#09090b", color: "#09090b" }
                      : isDark
                      ? { backgroundColor: "#09090b", borderColor: "#27272a", color: "#ffffff" }
                      : { backgroundColor: "#ffffff", borderColor: "#e4e4e7", color: "#09090b" }
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="px-2 py-0.5 rounded font-mono text-[10px] font-black uppercase"
                          style={
                            notice.portal === "GSTN"
                              ? { backgroundColor: "#dbeafe", color: "#1e40af" }
                              : notice.portal === "CBDT_INCOME_TAX"
                              ? { backgroundColor: "#fef3c7", color: "#92400e" }
                              : { backgroundColor: "#e0e7ff", color: "#3730a3" }
                          }
                        >
                          {notice.portal}
                        </span>
                        <span className="font-mono text-xs font-black truncate max-w-[180px]">
                          {notice.referenceNumber}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs line-clamp-2 pt-0.5">
                        {notice.allegationSubject}
                      </h4>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 border"
                      style={lim.badgeStyle}
                    >
                      {notice.status === "REPLY_FILED" ? "Reply Filed" : `${notice.riskSeverity}`}
                    </span>
                  </div>

                  {/* Limitation Clock Strip */}
                  <div
                    className="p-2 rounded-xl border flex items-center justify-between text-[11px] font-mono"
                    style={
                      isDark
                        ? { backgroundColor: "#09090b", borderColor: "#27272a" }
                        : { backgroundColor: "#f4f4f5", borderColor: "#e4e4e7" }
                    }
                  >
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="font-bold">Due: {notice.limitationDeadline}</span>
                    </div>
                    <span className={`font-black ${lim.colorClass}`}>{lim.label}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 font-mono">
                    <span style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>Disputed Demand:</span>
                    <span className="font-black text-red-600 dark:text-red-400">
                      {formatInr(notice.demandBreakdown?.totalDisputedAmount)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Active Notice Deep-Dive Dossier (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedNotice ? (
            <div
              className="p-6 rounded-3xl border-2 space-y-6 shadow-xs"
              style={
                isDark
                  ? { backgroundColor: "#09090b", borderColor: "#27272a", color: "#ffffff" }
                  : { backgroundColor: "#ffffff", borderColor: "#e4e4e7", color: "#09090b" }
              }
            >
              {/* Header Strip */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded font-mono text-[10px] font-black uppercase"
                      style={
                        selectedNotice.portal === "GSTN"
                          ? { backgroundColor: "#dbeafe", color: "#1e40af" }
                          : selectedNotice.portal === "CBDT_INCOME_TAX"
                          ? { backgroundColor: "#fef3c7", color: "#92400e" }
                          : { backgroundColor: "#e0e7ff", color: "#3730a3" }
                      }
                    >
                      {selectedNotice.portal}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-500">
                      Ref #{selectedNotice.referenceNumber}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black leading-snug">
                    {selectedNotice.allegationSubject}
                  </h3>
                  <div className="text-xs text-zinc-500 font-mono">
                    Issuing Authority: <strong className="text-zinc-900 dark:text-zinc-100">{selectedNotice.issuingAuthority}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReplyStudioOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer border"
                    style={
                      isDark
                        ? { backgroundColor: "#ffffff", color: "#09090b", borderColor: "#ffffff" }
                        : { backgroundColor: "#09090b", color: "#ffffff", borderColor: "#09090b" }
                    }
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Legal Reply Studio</span>
                  </button>

                  <button
                    onClick={() => setHearingModalOpen(true)}
                    className="p-2 rounded-xl border transition-all cursor-pointer"
                    style={
                      isDark
                        ? { backgroundColor: "#18181b", borderColor: "#3f3f46" }
                        : { backgroundColor: "#f4f4f5", borderColor: "#d4d4d8" }
                    }
                    title="Hearing / Virtual VC Details"
                  >
                    <Video className="w-4 h-4 text-indigo-500" />
                  </button>
                </div>
              </div>

              {/* Allegation Details Box */}
              <div
                className="p-4 rounded-2xl border space-y-2 text-xs"
                style={
                  isDark
                    ? { backgroundColor: "#18181b", borderColor: "#27272a" }
                    : { backgroundColor: "#f4f4f5", borderColor: "#e4e4e7" }
                }
              >
                <div className="flex items-center justify-between font-mono font-bold">
                  <span className="text-[10px] uppercase text-zinc-500">Statutory Charge / Allegation</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{selectedNotice.statutorySection}</span>
                </div>
                <p className="leading-relaxed font-sans">{selectedNotice.allegationDetails}</p>
              </div>

              {/* Demand Exposure Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-2xl border bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Principal Tax / Fee</span>
                  <span className="text-sm font-black text-zinc-950 dark:text-white">
                    {formatInr(selectedNotice.demandBreakdown?.principalTaxOrFee)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl border bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Statutory Interest</span>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                    {formatInr(selectedNotice.demandBreakdown?.interest)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl border bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Proposed Penalty</span>
                  <span className="text-sm font-black text-red-600 dark:text-red-400">
                    {formatInr(selectedNotice.demandBreakdown?.penalty)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl border bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900">
                  <span className="text-[10px] text-red-800 dark:text-red-200 uppercase font-bold block">Total Demand Exposure</span>
                  <span className="text-sm font-black text-red-700 dark:text-red-300">
                    {formatInr(selectedNotice.demandBreakdown?.totalDisputedAmount)}
                  </span>
                </div>
              </div>

              {/* Limitation Clock Alert Banner */}
              <div
                className="p-4 rounded-2xl border flex items-center justify-between"
                style={getLimitationInfo(selectedNotice.limitationDeadline, selectedNotice.status).badgeStyle}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 shrink-0" />
                  <div>
                    <h5 className="font-extrabold text-xs">
                      {getLimitationInfo(selectedNotice.limitationDeadline, selectedNotice.status).label}
                    </h5>
                    <p className="text-[11px] font-mono">
                      Notice Date: {selectedNotice.dateOfNotice} • Service Date: {selectedNotice.dateOfService} • Statutory Window: {selectedNotice.statutoryDaysAllowed} Days
                    </p>
                  </div>
                </div>

                {selectedNotice.status !== "REPLY_FILED" && (
                  <button
                    onClick={() => setReplyStudioOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border shadow-xs bg-white text-black dark:bg-black dark:text-white cursor-pointer shrink-0"
                  >
                    Draft Rebuttal Now
                  </button>
                )}
              </div>

              {/* Annexures & Evidence Documents */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Evidence Annexures ({selectedNotice.annexures?.length || 0})</span>
                  </h4>
                  <button
                    onClick={() => setAttachAnnexureOpen(true)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Attach Annexure</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedNotice.annexures && selectedNotice.annexures.length > 0 ? (
                    selectedNotice.annexures.map((ann) => (
                      <div
                        key={ann.annexureId}
                        className="p-3 rounded-xl border flex items-center justify-between text-xs font-mono"
                        style={
                          isDark
                            ? { backgroundColor: "#18181b", borderColor: "#27272a" }
                            : { backgroundColor: "#f4f4f5", borderColor: "#e4e4e7" }
                        }
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-zinc-900 dark:text-white mr-1.5">{ann.label}:</span>
                            <span className="truncate">{ann.documentTitle}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono shrink-0 ml-2">
                          Hash: {ann.sha256Hash?.slice(0, 10)}...
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl border text-center text-xs text-zinc-500 font-mono">
                      No annexures attached yet. Click "+ Attach Annexure" to append evidence documents.
                    </div>
                  )}
                </div>
              </div>

              {/* Filing Status / Acknowledgment */}
              {selectedNotice.filingReceipt && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-emerald-900 dark:text-emerald-200">
                    <span className="font-extrabold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Statutory Reply Filed on Portal
                    </span>
                    <span>ACK #{selectedNotice.filingReceipt.acknowledgmentNumber}</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    <div>DSC Signatory: <strong>{selectedNotice.filingReceipt.dscSignatory}</strong></div>
                    <div>USB Crypto Token Serial: {selectedNotice.filingReceipt.dscSerialNumber}</div>
                    <div>Submission Timestamp: {selectedNotice.filingReceipt.filedOn}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-3xl border-2 text-center text-zinc-500 font-mono text-xs">
              Select a statutory notice from the left to inspect legal dockets and limitation clocks.
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: SCN LEGAL REPLY STUDIO & JURISDICTIONAL REBUTTAL
      ========================================================================= */}
      {replyStudioOpen && selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div
            className="w-full max-w-4xl max-h-[90vh] rounded-3xl border shadow-2xl p-6 sm:p-7 space-y-5 overflow-y-auto"
            style={
              isDark
                ? { backgroundColor: "#09090b", borderColor: "#27272a", color: "#ffffff" }
                : { backgroundColor: "#ffffff", borderColor: "#e4e4e7", color: "#09090b" }
            }
          >
            <div className="flex items-start justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1">
                <span
                  className="px-2.5 py-0.5 rounded font-mono text-[10px] font-black uppercase tracking-wider"
                  style={{ backgroundColor: "#e0e7ff", color: "#3730a3" }}
                >
                  LEGAL REBUTTAL DRAFTER (RULE 142 / SEC 148A / SEC 206)
                </span>
                <h3 className="text-lg font-black tracking-tight">
                  Statutory Rebuttal: Ref #{selectedNotice.referenceNumber}
                </h3>
                <p className="text-xs text-zinc-500 font-mono">
                  Assessee: {selectedNotice.clientEntity.name} • {selectedNotice.statutorySection}
                </p>
              </div>

              <button
                onClick={() => setReplyStudioOpen(false)}
                className="p-1.5 rounded-lg border hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Jurisdictional Grounds & Facts Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Custom Jurisdictional Objection (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customObjection}
                  onChange={(e) => setCustomObjection(e.target.value)}
                  placeholder="e.g. Notice issued without mandatory DIN or sanction under Section 151..."
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Custom Factual Submissions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customFacts}
                  onChange={(e) => setCustomFacts(e.target.value)}
                  placeholder="e.g. Assessee submitted Form 2 under DPIIT startup notification on 14-Aug-2023..."
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleGenerateReply}
                disabled={generatingReply}
                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs border bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{generatingReply ? "Synthesizing Rebuttal..." : "Generate Jurisdictional Reply"}</span>
              </button>

              <button
                onClick={() =>
                  handleCopy(
                    selectedNotice.rebuttalDraft?.draftText || "No draft available",
                    "draft-copy"
                  )
                }
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border shadow-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                {copiedId === "draft-copy" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === "draft-copy" ? "Copied" : "Copy Draft"}</span>
              </button>
            </div>

            {/* Drafted Rebuttal Preview */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                Official Rebuttal Text (For Portal Submission &amp; Video Hearing)
              </span>
              <pre
                className="p-4 rounded-2xl border text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-72"
                style={
                  isDark
                    ? { backgroundColor: "#18181b", borderColor: "#27272a", color: "#f4f4f5" }
                    : { backgroundColor: "#f4f4f5", borderColor: "#e4e4e7", color: "#18181b" }
                }
              >
                {selectedNotice.rebuttalDraft?.draftText ||
                  "Click 'Generate Jurisdictional Reply' above to synthesize statutory objections, factual grounds, and precedents."}
              </pre>
            </div>

            {/* DSC Signing Gateway */}
            <div
              className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={
                isDark
                  ? { backgroundColor: "#18181b", borderColor: "#27272a" }
                  : { backgroundColor: "#f4f4f5", borderColor: "#e4e4e7" }
              }
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                  <h5 className="font-extrabold text-xs">Execute &amp; File with Class 3 USB Crypto Token</h5>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Signatory: {csName} • Token: WatchData ProxKey (FIPS 140-2 Level 2)
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignDsc}
                disabled={isDscSigning}
                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer border bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isDscSigning ? "Affixing DSC..." : "Sign & File Reply"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: VIRTUAL VC HEARING & APPOINTMENT SCHEDULER
      ========================================================================= */}
      {hearingModalOpen && selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div
            className="w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-4"
            style={
              isDark
                ? { backgroundColor: "#09090b", borderColor: "#27272a", color: "#ffffff" }
                : { backgroundColor: "#ffffff", borderColor: "#e4e4e7", color: "#09090b" }
            }
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold">Personal Hearing &amp; Virtual VC Scheduler</h3>
              </div>
              <button
                onClick={() => setHearingModalOpen(false)}
                className="p-1 rounded-lg border hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Hearing Date &amp; Time
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={hearingDate}
                    onChange={(e) => setHearingDate(e.target.value)}
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={hearingTime}
                    onChange={(e) => setHearingTime(e.target.value)}
                    placeholder="11:30 AM"
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Hearing Mode
                </label>
                <select
                  value={hearingMode}
                  onChange={(e) => setHearingMode(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                >
                  <option value="VIRTUAL_VC">Virtual Video Conference (Webex / MS Teams)</option>
                  <option value="PHYSICAL_APPEARANCE">Physical Court / Officer Chamber Appearance</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  VC Meeting Link / Court Chamber
                </label>
                <input
                  type="text"
                  value={hearingLink}
                  onChange={(e) => setHearingLink(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Appearing Counsel / Practitioner
                </label>
                <input
                  type="text"
                  value={assignedCounsel}
                  onChange={(e) => setAssignedCounsel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              {selectedNotice.hearingSchedule?.meetingLink && (
                <div className="pt-1">
                  <a
                    href={selectedNotice.hearingSchedule.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Launch Virtual VC Session</span>
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setHearingModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleScheduleHearing}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black cursor-pointer shadow-xs"
              >
                Save Hearing Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: INGEST NEW STATUTORY NOTICE / SCN
      ========================================================================= */}
      {newNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div
            className="w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-4"
            style={
              isDark
                ? { backgroundColor: "#09090b", borderColor: "#27272a", color: "#ffffff" }
                : { backgroundColor: "#ffffff", borderColor: "#e4e4e7", color: "#09090b" }
            }
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-zinc-900 dark:text-white" />
                <h3 className="text-sm font-bold">Ingest Statutory Notice / SCN</h3>
              </div>
              <button
                onClick={() => setNewNoticeModalOpen(false)}
                className="p-1 rounded-lg border hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Portal Framework
                </label>
                <select
                  value={newPortal}
                  onChange={(e) => {
                    const p = e.target.value as any;
                    setNewPortal(p);
                    if (p === "GSTN") {
                      setNewSection("Section 73(1), CGST Act, 2017");
                      setNewAuthority("Office of the Assistant Commissioner of State Tax, Ward 44");
                    } else if (p === "CBDT_INCOME_TAX") {
                      setNewSection("Section 148A(b), Income Tax Act, 1961");
                      setNewAuthority("National Faceless Assessment Centre, Delhi");
                    } else {
                      setNewSection("Section 206(1), Companies Act, 2013");
                      setNewAuthority("Office of Registrar of Companies, NCT of Delhi");
                    }
                  }}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium"
                >
                  <option value="GSTN">GSTN (DRC-01 / DRC-01A SCN)</option>
                  <option value="CBDT_INCOME_TAX">CBDT (Income Tax Sec 148A / 143(2))</option>
                  <option value="MCA21">MCA21 (ROC Sec 206 Inquiry / Summons)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Notice Reference Number / DIN
                </label>
                <input
                  type="text"
                  value={newReference}
                  onChange={(e) => setNewReference(e.target.value)}
                  placeholder="e.g. ZA0702260192841 / DIN-2026-ITBA-901"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Issuing Authority &amp; Section
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newAuthority}
                    onChange={(e) => setNewAuthority(e.target.value)}
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-[11px]"
                  />
                  <input
                    type="text"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-[11px] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Notice Subject &amp; Allegation Summary
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Show cause for ITC difference between GSTR-2B and 3B"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Disputed Demand Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={newDemandAmount}
                    onChange={(e) => setNewDemandAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Limitation Response Days
                  </label>
                  <input
                    type="number"
                    value={newLimitationDays}
                    onChange={(e) => setNewLimitationDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setNewNoticeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNotice}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black cursor-pointer shadow-xs"
              >
                Ingest Notice Docket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: ATTACH ANNEXURE EVIDENCE
      ========================================================================= */}
      {attachAnnexureOpen && selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div
            className="w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-4"
            style={
              isDark
                ? { backgroundColor: "#09090b", borderColor: "#27272a", color: "#ffffff" }
                : { backgroundColor: "#ffffff", borderColor: "#e4e4e7", color: "#09090b" }
            }
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-zinc-900 dark:text-white" />
                <h3 className="text-sm font-bold">Attach Evidence Document</h3>
              </div>
              <button
                onClick={() => setAttachAnnexureOpen(false)}
                className="p-1 rounded-lg border hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Annexure Label
                </label>
                <input
                  type="text"
                  value={annexureLabel}
                  onChange={(e) => setAnnexureLabel(e.target.value)}
                  placeholder="e.g. Annexure A / Annexure 1"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Document Title / Description
                </label>
                <input
                  type="text"
                  value={annexureTitle}
                  onChange={(e) => setAnnexureTitle(e.target.value)}
                  placeholder="e.g. Supplier-wise GSTR-2B vs 3B Reconciliation Sheet"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Simulated File Name
                </label>
                <input
                  type="text"
                  value={annexureFileName}
                  onChange={(e) => setAnnexureFileName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setAttachAnnexureOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAnnexure}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black cursor-pointer shadow-xs"
              >
                Append to Legal Docket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
