"use client";

import React, { useState, useEffect } from "react";
import { citizenApi } from "@/lib/api";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Truck,
  MapPin,
  Copy,
  Search,
  Trash2,
  Download,
  RefreshCw,
  Eye,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Calendar,
} from "lucide-react";

export interface LegalNoticeTrackingEvent {
  date: string;
  time: string;
  location: string;
  activity: string;
}

export interface LegalNoticeItem {
  _id: string;
  id?: string;
  citizenId?: string;
  matterId?: string;
  noticeType: string;
  title: string;
  senderName?: string;
  recipientName: string;
  recipientAddress: string;
  claimAmount?: string;
  statutoryNoticeDays: number;
  dispatchDate: string;
  speedPostTrackingNumber: string;
  deliveryStatus: string;
  daysRemaining: number;
  advocateName?: string;
  draftContent?: string;
  pdfUrl?: string;
  trackingHistory?: LegalNoticeTrackingEvent[];
  createdAt?: string;
}

interface LegalNoticesViewProps {
  token?: string;
  onSelectNotice?: (notice: LegalNoticeItem) => void;
}

export const LegalNoticesView: React.FC<LegalNoticesViewProps> = ({
  token = "dev_token",
}) => {
  const [notices, setNotices] = useState<LegalNoticeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [activeTrackingNotice, setActiveTrackingNotice] = useState<LegalNoticeItem | null>(null);
  const [activeDraftNotice, setActiveDraftNotice] = useState<LegalNoticeItem | null>(null);
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  // Quick Tracker Modal (Look up any consignment number)
  const [isQuickTrackOpen, setIsQuickTrackOpen] = useState<boolean>(false);
  const [quickTrackBarcode, setQuickTrackBarcode] = useState<string>("");
  const [quickTrackResult, setQuickTrackResult] = useState<any | null>(null);
  const [isQuickTracking, setIsQuickTracking] = useState<boolean>(false);

  // New Notice Issuance Modal & AI Draft Form State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState<boolean>(false);
  const [isSavingNotice, setIsSavingNotice] = useState<boolean>(false);

  // Form Fields
  const [noticeType, setNoticeType] = useState<string>("Cheque Bounce Demand (Sec 138 NI Act)");
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [senderName, setSenderName] = useState<string>("Gopakumar Nambiar");
  const [advocateName, setAdvocateName] = useState<string>("Adv. Meera Krishnan");
  const [claimAmount, setClaimAmount] = useState<string>("");
  const [statutoryNoticeDays, setStatutoryNoticeDays] = useState<number>(15);
  const [chequeNumber, setChequeNumber] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [chequeDate, setChequeDate] = useState<string>("");
  const [returnMemoDate, setReturnMemoDate] = useState<string>("");
  const [facts, setFacts] = useState<string>("");
  const [customTitle, setCustomTitle] = useState<string>("");
  const [draftContent, setDraftContent] = useState<string>("");

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await citizenApi.getLegalNotices(token);
      if (res && res.notices) {
        setNotices(res.notices);
      }
    } catch (err) {
      console.error("Failed to load legal notices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [token]);

  // Adjust statutory notice days based on selected type
  const handleNoticeTypeChange = (type: string) => {
    setNoticeType(type);
    if (type.includes("138") || type.toLowerCase().includes("cheque")) {
      setStatutoryNoticeDays(15);
    } else if (type.includes("80") || type.toLowerCase().includes("government")) {
      setStatutoryNoticeDays(60);
    } else if (type.includes("Recovery") || type.includes("Eviction")) {
      setStatutoryNoticeDays(30);
    } else {
      setStatutoryNoticeDays(15);
    }
  };

  // Generate Draft with AI
  const handleGenerateDraft = async () => {
    try {
      setIsGeneratingDraft(true);
      const res = await citizenApi.generateNoticeDraft(token, {
        noticeType,
        senderName,
        recipientName: recipientName || "Opposite Party",
        recipientAddress: recipientAddress || "Postal Address",
        claimAmount,
        facts,
        chequeNumber,
        bankName,
        chequeDate,
        returnMemoDate,
        advocateName,
        statutoryNoticeDays,
      });

      if (res && res.draftContent) {
        setDraftContent(res.draftContent);
        if (res.suggestedTitle) setCustomTitle(res.suggestedTitle);
        if (res.statutoryNoticeDays) setStatutoryNoticeDays(res.statutoryNoticeDays);
        setCreateStep(2);
      }
    } catch (err) {
      console.error("Draft generation failed:", err);
      alert("Notice draft generation failed. Please check network connectivity.");
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  // Create & Book Speed Post Consignment
  const handleSaveAndIssueNotice = async () => {
    if (!recipientName.trim() || !recipientAddress.trim()) {
      alert("Please provide the recipient's full legal name and postal address.");
      return;
    }

    try {
      setIsSavingNotice(true);
      const res = await citizenApi.createLegalNotice(token, {
        noticeType,
        title: customTitle || `Statutory Legal Notice to ${recipientName}`,
        recipientName: recipientName.trim(),
        recipientAddress: recipientAddress.trim(),
        senderName,
        advocateName,
        claimAmount,
        statutoryNoticeDays: Number(statutoryNoticeDays),
        draftContent,
      });

      if (res && res.success) {
        setIsCreateModalOpen(false);
        resetCreateForm();
        await fetchNotices();
      } else {
        alert(res?.message || "Failed to register statutory legal notice.");
      }
    } catch (err) {
      console.error("Failed to register legal notice:", err);
      alert("An error occurred while creating notice.");
    } finally {
      setIsSavingNotice(false);
    }
  };

  const resetCreateForm = () => {
    setCreateStep(1);
    setNoticeType("Cheque Bounce Demand (Sec 138 NI Act)");
    setRecipientName("");
    setRecipientAddress("");
    setClaimAmount("");
    setStatutoryNoticeDays(15);
    setChequeNumber("");
    setBankName("");
    setChequeDate("");
    setReturnMemoDate("");
    setFacts("");
    setCustomTitle("");
    setDraftContent("");
  };

  // Track any Consignment Barcode
  const handleQuickTrack = async (barcode: string) => {
    if (!barcode.trim()) return;
    try {
      setIsQuickTracking(true);
      setQuickTrackResult(null);
      const res = await citizenApi.trackNoticeSpeedPost(token, barcode.trim());
      if (res && res.success) {
        setQuickTrackResult(res);
      } else {
        alert(res?.message || "Consignment tracking lookup failed.");
      }
    } catch (err) {
      console.error("Quick track failed:", err);
      alert("Unable to query India Post tracking gateway.");
    } finally {
      setIsQuickTracking(false);
    }
  };

  // Delete Notice
  const handleDeleteNotice = async (noticeId: string) => {
    if (!confirm("Are you sure you want to remove this statutory notice record?")) return;
    try {
      await citizenApi.deleteLegalNotice(token, noticeId);
      setNotices((prev) => prev.filter((n) => n._id !== noticeId && n.id !== noticeId));
    } catch (err) {
      console.error("Failed to delete notice:", err);
    }
  };

  // Copy Draft
  const handleCopyDraft = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  // Copy Barcode
  const handleCopyBarcode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(code);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  // Filter notices
  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.speedPostTrackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.noticeType.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedTypeFilter === "ALL") return true;
    if (selectedTypeFilter === "ACTIVE") return (n.daysRemaining || 0) > 0;
    if (selectedTypeFilter === "EXPIRED") return (n.daysRemaining || 0) <= 0;
    if (selectedTypeFilter === "DELIVERED") return n.deliveryStatus?.toLowerCase().includes("delivered");
    if (selectedTypeFilter === "SEC_138") return n.noticeType?.includes("138");
    if (selectedTypeFilter === "SEC_80") return n.noticeType?.includes("80");
    return true;
  });

  // Calculate KPIs
  const totalNotices = notices.length;
  const activeCountdowns = notices.filter((n) => (n.daysRemaining || 0) > 0).length;
  const deliveredNotices = notices.filter((n) => n.deliveryStatus?.toLowerCase().includes("delivered")).length;

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6">
      {/* ============================================================== */}
      {/* 1. Header Bar with Actions                                     */}
      {/* ============================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">
              Statutory Legal Notices & Speed Post Tracking
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
              INDIA POST GATEWAY
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Automated statutory countdowns (15, 30 & 60-day limitation rules) with registered postal trajectory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setQuickTrackBarcode("");
              setQuickTrackResult(null);
              setIsQuickTrackOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-zinc-500" />
            <span>Track Any Consignment</span>
          </button>

          <button
            onClick={() => {
              resetCreateForm();
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Draft & Issue Notice</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. KPI Statutory Summary Metrics                               */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
              Total Notices
            </span>
            <FileText className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-black dark:text-white mt-2">{totalNotices}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Pre-litigation demand notices issued</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
              Active Countdowns
            </span>
            <Clock className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-black dark:text-white mt-2">{activeCountdowns}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Within statutory response window</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
              Delivered via Speed Post
            </span>
            <CheckCircle2 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-black dark:text-white mt-2">{deliveredNotices}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Service completed with proof</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
              Legal Certainty
            </span>
            <ShieldAlert className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-base font-bold text-black dark:text-white mt-2">Sec 27 Gen. Clauses Act</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Valid presumption of postal service</p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. Search and Type Filter Controls                             */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by recipient, barcode (e.g. EK9481...), notice title or section..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Notices" },
            { id: "ACTIVE", label: "Active Window" },
            { id: "DELIVERED", label: "Delivered" },
            { id: "SEC_138", label: "Sec 138 NI Act" },
            { id: "SEC_80", label: "Sec 80 CPC" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                selectedTypeFilter === tab.id
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-black dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={fetchNotices}
            title="Refresh notice register"
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. Notice Dossier Cards                                        */}
      {/* ============================================================== */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400" />
          <p className="text-xs text-zinc-500">Synchronizing statutory notices and tracking data...</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3">
          <FileText className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700" />
          <h3 className="text-sm font-bold text-black dark:text-white">No statutory notices found</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            {searchQuery
              ? `No records matching "${searchQuery}". Try clearing search filters.`
              : "Generate pre-litigation demand notices under Section 138 NI Act or Section 80 CPC with automated India Post speed post consignment tracking."}
          </p>
          <button
            onClick={() => {
              resetCreateForm();
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black inline-flex items-center gap-1.5 cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Legal Notice</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((notice) => {
            const daysLeft = notice.daysRemaining !== undefined ? notice.daysRemaining : 0;
            const isDelivered = notice.deliveryStatus?.toLowerCase().includes("delivered");

            return (
              <div
                key={notice._id || notice.id}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-4"
              >
                {/* Notice Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                        {notice.noticeType}
                      </span>
                      {notice.claimAmount && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                          Claim: {notice.claimAmount}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-black dark:text-white">{notice.title}</h3>
                  </div>

                  {/* Statutory Countdown Badge - Strict Monochrome */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {daysLeft > 0 ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-black text-white dark:bg-white dark:text-black inline-flex items-center gap-1.5 shadow-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{daysLeft} days remaining to respond</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white inline-flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Statutory Period Expired — Ready to File</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-3 border-t border-zinc-100 dark:border-zinc-900">
                  {/* Recipient */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">
                      Recipient / Addressee
                    </span>
                    <span className="font-bold text-black dark:text-white block">{notice.recipientName}</span>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                      {notice.recipientAddress}
                    </p>
                  </div>

                  {/* Speed Post Tracking */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">
                      India Post Speed Post
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-black dark:text-white">
                        {notice.speedPostTrackingNumber}
                      </span>
                      <button
                        onClick={() => handleCopyBarcode(notice.speedPostTrackingNumber)}
                        title="Copy tracking number"
                        className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        {copiedTracking === notice.speedPostTrackingNumber ? (
                          <Check className="w-3 h-3 text-black dark:text-white" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="w-2 h-2 rounded-full bg-black dark:bg-white inline-block" />
                      <span className="text-[11px] font-semibold text-black dark:text-white">
                        {notice.deliveryStatus}
                      </span>
                    </div>
                  </div>

                  {/* Limitation Period */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">
                      Statutory Period
                    </span>
                    <span className="font-bold text-black dark:text-white block">
                      {notice.statutoryNoticeDays} Days Notice Period
                    </span>
                    <p className="text-[11px] text-zinc-500">
                      Dispatched:{" "}
                      {notice.dispatchDate
                        ? new Date(notice.dispatchDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Registered"}
                    </p>
                  </div>

                  {/* Signatory Advocate */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">
                      Counsel / Chamber
                    </span>
                    <span className="font-bold text-black dark:text-white block">
                      {notice.advocateName || "Adv. Meera Krishnan"}
                    </span>
                    <p className="text-[11px] text-zinc-500">Sender: {notice.senderName || "Gopakumar Nambiar"}</p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveDraftNotice(notice)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-zinc-500" />
                      <span>View Notice Draft</span>
                    </button>

                    <button
                      onClick={() => setActiveTrackingNotice(notice)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Track Speed Post</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteNotice(notice._id || notice.id || "")}
                    title="Delete notice record"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. Speed Post Tracking Drawer / Modal                          */}
      {/* ============================================================== */}
      {activeTrackingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                    INDIA POST
                  </span>
                  <h3 className="text-base font-bold text-black dark:text-white">Speed Post Consignment History</h3>
                </div>
                <p className="text-xs font-mono text-zinc-500 mt-0.5">
                  Consignment No: {activeTrackingNotice.speedPostTrackingNumber}
                </p>
              </div>
              <button
                onClick={() => setActiveTrackingNotice(null)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Consignment Status Banner */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 block uppercase">Current Delivery State</span>
                <span className="text-sm font-bold text-black dark:text-white flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-black dark:text-white" />
                  {activeTrackingNotice.deliveryStatus}
                </span>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Addressee: {activeTrackingNotice.recipientName} ({activeTrackingNotice.recipientAddress})
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-mono text-zinc-400 block uppercase">Limitation Status</span>
                <span className="text-xs font-bold text-black dark:text-white block mt-0.5">
                  {activeTrackingNotice.daysRemaining} days left in {activeTrackingNotice.statutoryNoticeDays}-day window
                </span>
                <span className="text-[10px] text-zinc-500">Section 27 Legal Presumption Active</span>
              </div>
            </div>

            {/* Postal Checkpoints Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                Postal Trajectory Checkpoints
              </h4>

              <div className="space-y-4 pl-2 border-l-2 border-zinc-200 dark:border-zinc-800">
                {(activeTrackingNotice.trackingHistory && activeTrackingNotice.trackingHistory.length > 0
                  ? activeTrackingNotice.trackingHistory
                  : [
                      {
                        date: new Date().toLocaleDateString("en-IN"),
                        time: "10:30:00",
                        location: "Kochi GPO",
                        activity: "Item Booked via Inland Speed Post",
                      },
                    ]
                ).map((event, idx) => (
                  <div key={idx} className="relative pl-6 space-y-1">
                    {/* Stepper Dot */}
                    <div className="absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full bg-black dark:bg-white border-2 border-white dark:border-black" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <span className="font-bold text-black dark:text-white">{event.location}</span>
                      <span className="font-mono text-[11px] text-zinc-400">
                        {event.date} &bull; {event.time}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">{event.activity}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Footnote */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 space-y-1">
              <span className="font-bold text-black dark:text-white block">
                Proof of Service under Indian Evidence Act & Sec 27 General Clauses Act
              </span>
              <p>
                Service by registered Speed Post with proof of delivery or postal endorsement is admissible as valid
                tender of statutory notice before Judicial Magistrates and Civil Courts.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveTrackingNotice(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black cursor-pointer"
              >
                Close Tracking History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. View & Copy Legal Notice Text Modal                         */}
      {/* ============================================================== */}
      {activeDraftNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                  {activeDraftNotice.noticeType}
                </span>
                <h3 className="text-base font-bold text-black dark:text-white">{activeDraftNotice.title}</h3>
              </div>
              <button
                onClick={() => setActiveDraftNotice(null)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notice Draft Text Display */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {activeDraftNotice.draftContent ||
                `DEMAND NOTICE\n\nTo,\n${activeDraftNotice.recipientName}\n${activeDraftNotice.recipientAddress}\n\nTake notice that my client demands compliance with statutory provisions within ${activeDraftNotice.statutoryNoticeDays} days.\n\n${activeDraftNotice.advocateName}`}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-zinc-500 font-mono">
                Statutory Window: {activeDraftNotice.statutoryNoticeDays} Days &bull; Consignment:{" "}
                {activeDraftNotice.speedPostTrackingNumber}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyDraft(activeDraftNotice.draftContent || "")}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedDraft ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-black dark:text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Copy Full Draft</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    const blob = new Blob([activeDraftNotice.draftContent || ""], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `Statutory_Notice_${activeDraftNotice.speedPostTrackingNumber}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Draft</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. Quick Consignment Lookup Modal                              */}
      {/* ============================================================== */}
      {isQuickTrackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-black dark:text-white" />
                <h3 className="text-base font-bold text-black dark:text-white">Track India Post Consignment</h3>
              </div>
              <button
                onClick={() => setIsQuickTrackOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Enter Speed Post / Registered Post Barcode Number
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={quickTrackBarcode}
                  onChange={(e) => setQuickTrackBarcode(e.target.value.toUpperCase())}
                  placeholder="e.g. EK948102391IN or KL094812304IN"
                  className="flex-1 px-3 py-2 text-xs font-mono uppercase rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
                <button
                  onClick={() => handleQuickTrack(quickTrackBarcode)}
                  disabled={isQuickTracking || !quickTrackBarcode.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isQuickTracking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Track</span>
                </button>
              </div>
            </div>

            {quickTrackResult && (
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-black dark:text-white">
                    {quickTrackResult.trackingNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black text-white dark:bg-white dark:text-black">
                    {quickTrackResult.deliveryStatus}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  {quickTrackResult.trackingHistory?.map((step: any, idx: number) => (
                    <div key={idx} className="text-xs flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-black dark:text-white block">{step.location}</span>
                        <span className="text-[11px] text-zinc-500">{step.activity}</span>
                      </div>
                      <span className="font-mono text-[10px] text-zinc-400 whitespace-nowrap">
                        {step.date} {step.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. Draft & Issue Statutory Notice Wizard Modal                 */}
      {/* ============================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                    STEP {createStep} OF 2
                  </span>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    {createStep === 1 ? "Notice Particulars & Statutory Ground" : "Review AI Legal Notice & Issue"}
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {createStep === 1
                    ? "Specify the statutory demand type, recipient coordinates, and claim facts."
                    : "Edit formal advocate legal draft before booking India Post Speed Post consignment."}
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: FORM INPUTS */}
            {createStep === 1 && (
              <div className="space-y-4">
                {/* Notice Type Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Statutory Notice Category
                  </label>
                  <select
                    value={noticeType}
                    onChange={(e) => handleNoticeTypeChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  >
                    <option value="Cheque Bounce Demand (Sec 138 NI Act)">
                      Cheque Bounce Demand (Sec 138 NI Act) — 15 Days
                    </option>
                    <option value="Recovery of Money & Outstanding Invoices">
                      Recovery of Money & Commercial Invoices (Order 37 CPC) — 15/30 Days
                    </option>
                    <option value="Section 80 CPC Notice of Suit Against Statutory Authority">
                      Notice of Suit to Government / Public Body (Section 80 CPC) — 60 Days
                    </option>
                    <option value="Eviction & Tenancy Termination (Sec 106 TP Act)">
                      Eviction & Tenancy Termination (Sec 106 TP Act) — 15/30 Days
                    </option>
                    <option value="Deficiency in Service & Consumer Claim">
                      Deficiency in Service & Consumer Claim (CPA 2019) — 15 Days
                    </option>
                    <option value="General Statutory Legal Notice">General Statutory Legal Notice</option>
                  </select>
                </div>

                {/* Recipient Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Recipient Full Name / Entity *
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Coastal Logistics & Infra Ltd"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Claim Amount / Value (if any)
                    </label>
                    <input
                      type="text"
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(e.target.value)}
                      placeholder="e.g. ₹4,50,000"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Recipient Full Postal Address (with PIN Code) *
                  </label>
                  <textarea
                    rows={2}
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="e.g. Plot 12, Port Trust Road, Willingdon Island, Kochi, Kerala 682003"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
                  />
                </div>

                {/* Cheque Bounce Specific Fields */}
                {noticeType.includes("138") && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase">
                      Section 138 Statutory Cheque Particulars
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] text-zinc-400 block font-mono">CHEQUE NO.</label>
                        <input
                          type="text"
                          value={chequeNumber}
                          onChange={(e) => setChequeNumber(e.target.value)}
                          placeholder="e.g. 492019"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 block font-mono">DRAWEE BANK</label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. Federal Bank, Kochi"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 block font-mono">CHEQUE DATE</label>
                        <input
                          type="text"
                          value={chequeDate}
                          onChange={(e) => setChequeDate(e.target.value)}
                          placeholder="e.g. 25-Sep-2024"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 block font-mono">RETURN MEMO DATE</label>
                        <input
                          type="text"
                          value={returnMemoDate}
                          onChange={(e) => setReturnMemoDate(e.target.value)}
                          placeholder="e.g. 04-Oct-2024"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Facts Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Dispute Summary & Cause of Action
                  </label>
                  <textarea
                    rows={3}
                    value={facts}
                    onChange={(e) => setFacts(e.target.value)}
                    placeholder="Describe the underlying transaction, breach, default, or grievance..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
                  />
                </div>

                {/* Counsel & Period */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Advocate Name / Signatory
                    </label>
                    <input
                      type="text"
                      value={advocateName}
                      onChange={(e) => setAdvocateName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Statutory Cure Window (Days)
                    </label>
                    <input
                      type="number"
                      value={statutoryNoticeDays}
                      onChange={(e) => setStatutoryNoticeDays(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleGenerateDraft}
                    disabled={isGeneratingDraft || !recipientName.trim() || !recipientAddress.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isGeneratingDraft ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Legal Notice Draft...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate Draft</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: REVIEW DRAFT & CONFIRM POSTAL BOOKING */}
            {createStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Notice Title / Subject
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Advocate Notice Text (Full Draft)
                    </label>
                    <span className="text-[10px] font-mono text-zinc-400">Statutory Format Admissible in Court</span>
                  </div>
                  <textarea
                    rows={12}
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    className="w-full p-3 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white leading-relaxed resize-y"
                  />
                </div>

                {/* India Post Speed Post Auto-Allocation Alert */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                  <Truck className="w-5 h-5 text-black dark:text-white shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-black dark:text-white block">
                      Automatic Speed Post Consignment Allocation
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Upon confirmation, an India Post tracking number (EK...IN) will be booked, initiating the{" "}
                      {statutoryNoticeDays}-day statutory limitation countdown.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => setCreateStep(1)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    Back to Particulars
                  </button>

                  <button
                    onClick={handleSaveAndIssueNotice}
                    disabled={isSavingNotice || !draftContent.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isSavingNotice ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Registering & Booking Speed Post...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Register & Issue Notice</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
