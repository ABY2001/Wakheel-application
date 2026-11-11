"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  X,
  Scale,
  Search,
  Activity,
  Briefcase,
  ExternalLink,
  Plus,
  RefreshCw,
  Check,
  Building,
  FileText,
} from "lucide-react";
import { citizenApi } from "@/lib/api";

export interface LegalMatter {
  id: string;
  caseNumber: string;
  title: string;
  court: string;
  assignedAdvocate: string;
  nextHearing: string;
  filingDate: string;
  status: "Admitted" | "Pre Filing" | "Notice Issued" | "Under Scrutiny" | "Disposed";
  cnrNumber?: string;
  courtHall?: string;
  statutoryActs?: string[];
  timeline?: Array<{
    date: string;
    title: string;
    remarks: string;
    stage: string;
  }>;
}

const DEFAULT_MATTERS: LegalMatter[] = [];

interface MyLegalMattersViewProps {
  onSelectMatter?: (matterTitle: string) => void;
  onOpenConsultation?: () => void;
  onNavigateTab?: (tab: string) => void;
  initialShowCnrTracker?: boolean;
}

export function MyLegalMattersView({
  onSelectMatter,
  onOpenConsultation,
  onNavigateTab,
  initialShowCnrTracker = false,
}: MyLegalMattersViewProps = {}) {
  const [matters, setMatters] = useState<LegalMatter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatterDetail, setSelectedMatterDetail] = useState<LegalMatter | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCnrTracker, setShowCnrTracker] = useState(initialShowCnrTracker);
  const [customCnr, setCustomCnr] = useState("");
  const [isSearchingCnr, setIsSearchingCnr] = useState(false);
  const [liveTrackedResult, setLiveTrackedResult] = useState<any | null>(null);
  const [cnrFeedback, setCnrFeedback] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Create New Petition / Matter Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreatingMatter, setIsCreatingMatter] = useState(false);
  const [registeredAdvocates, setRegisteredAdvocates] = useState<any[]>([]);
  const [newPetitionTitle, setNewPetitionTitle] = useState("");
  const [newPetitionCategory, setNewPetitionCategory] = useState("Family & Matrimonial");
  const [newPetitionCourt, setNewPetitionCourt] = useState("Family Court / High Court of Kerala");
  const [newPetitionSummary, setNewPetitionSummary] = useState("");
  const [newPetitionAdvocateId, setNewPetitionAdvocateId] = useState("");

  useEffect(() => {
    if (initialShowCnrTracker) {
      setShowCnrTracker(true);
    }
  }, [initialShowCnrTracker]);

  useEffect(() => {
    let active = true;
    citizenApi
      .getAdvocates()
      .then((res) => {
        if (active && res?.advocates && Array.isArray(res.advocates)) {
          setRegisteredAdvocates(res.advocates);
          if (res.advocates.length > 0) {
            setNewPetitionAdvocateId((prev) => prev || res.advocates[0].id || res.advocates[0]._id || "");
          }
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleCreateNewPetition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetitionTitle.trim()) return;
    setIsCreatingMatter(true);
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("wakheel_token") || localStorage.getItem("token") || ""
        : "";
    const chosenAdv = registeredAdvocates.find(
      (a) => (a.id || a._id || a.userId) === newPetitionAdvocateId
    );
    const advName = chosenAdv?.fullName || chosenAdv?.name || "Pending Counsel Assignment";
    try {
      const res = await citizenApi.createMatter(token, {
        matterTitle: newPetitionTitle.trim(),
        title: newPetitionTitle.trim(),
        matterType: newPetitionCategory,
        description: newPetitionSummary.trim(),
        courtForum: newPetitionCourt.trim() || "Family Court / High Court of Kerala",
        advocateId: chosenAdv ? (chosenAdv.id || chosenAdv._id || chosenAdv.userId) : undefined,
        advocateName: advName,
        assignedAdvocate: advName,
        status: "Pre Filing",
      });
      if (res?.success && res.matter) {
        const m = res.matter;
        const createdItem: LegalMatter = {
          id: m._id || m.id || `mat_${Date.now()}`,
          caseNumber: m.caseNumber || "PETITION DRAFT",
          title: m.matterTitle || m.title || newPetitionTitle.trim(),
          court: m.courtForum || m.court || newPetitionCourt,
          assignedAdvocate: m.advocateName || m.assignedAdvocate || advName,
          nextHearing: m.nextHearingDate || "Pending Registry Filing",
          filingDate: m.filingDate || new Date().toISOString().split("T")[0],
          status: "Pre Filing",
          cnrNumber: m.cnrNumber || "",
          courtHall: m.courtHall || "Filing Counter",
          statutoryActs: m.statutoryActs || [],
          timeline: m.timeline || [],
        };
        setMatters((prev) => [createdItem, ...prev]);
        setShowCreateModal(false);
        setNewPetitionTitle("");
        setNewPetitionSummary("");
      }
    } catch (err) {
      console.error("Failed to create new petition/matter:", err);
    } finally {
      setIsCreatingMatter(false);
    }
  };

  // Sync matters from backend API on mount
  useEffect(() => {
    const fetchMatters = async () => {
      setIsLoading(true);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("wakheel_token") || ""
          : "";
      try {
        if (!token) {
          setMatters([]);
          setIsLoading(false);
          return;
        }
        const res = await citizenApi.getMatters(token);
        if (res?.success && Array.isArray(res.matters)) {
          const normalized: LegalMatter[] = res.matters.map((m: any) => ({
            id: m.id || m._id,
            caseNumber: m.caseNumber || "Pending Case No.",
            title: m.title || m.matterTitle || "Legal Matter",
            court: m.court || m.courtForum || "Court Forum Pending",
            assignedAdvocate: m.assignedAdvocate || m.advocateName || "Pending Counsel Assignment",
            nextHearing: m.nextHearing || (m.nextHearingDate ? `${new Date(m.nextHearingDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} (${m.courtHall || "Bench Pending"})` : "Not Scheduled"),
            filingDate: m.filingDate || (m.createdAt ? m.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]),
            status: m.status === "active" ? "Admitted" : m.status === "notice_issued" ? "Notice Issued" : (m.status || "Pre Filing"),
            cnrNumber: m.cnrNumber || "",
            courtHall: m.courtHall || "Pending",
            statutoryActs: m.statutoryActs || [],
            timeline: m.timeline || [],
          }));
          setMatters(normalized);
        } else {
          setMatters([]);
        }
      } catch (err) {
        console.warn("Could not fetch matters from backend:", err);
        setMatters([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatters();
  }, []);

  const handleSelect = (matter: LegalMatter) => {
    setSelectedMatterDetail(matter);
    if (onSelectMatter) {
      onSelectMatter(`${matter.caseNumber} — ${matter.title.split("v.")[0].trim()}...`);
    }
  };

  const handleTrackCnr = async () => {
    const query = customCnr.trim();
    if (!query) return;
    setIsSearchingCnr(true);
    setLiveTrackedResult(null);
    setCnrFeedback(null);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("wakheel_token") || localStorage.getItem("token") || ""
        : "";

    try {
      const res = await citizenApi.trackCase(token, query);
      if (res?.success && res.matter) {
        setLiveTrackedResult(res);
      } else {
        setCnrFeedback(res?.message || "No matching case found for this CNR or case number.");
      }
    } catch (err: any) {
      console.warn("Live CNR tracking error:", err);
      setCnrFeedback(err?.message || "Unable to lookup case details.");
    } finally {
      setIsSearchingCnr(false);
    }
  };

  const handleImportTrackedCase = async (caseData: any) => {
    setIsImporting(true);
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("wakheel_token") || localStorage.getItem("token") || ""
        : "";

    try {
      const res = await citizenApi.createMatter(token, {
        caseNumber: caseData.caseNumber,
        matterTitle: caseData.title || caseData.caseTitle,
        courtForum: caseData.court,
        advocateId: caseData.advocateId,
        assignedAdvocate: caseData.assignedAdvocate || "Pending Counsel Assignment",
        cnrNumber: caseData.cnrNumber,
        courtHall: caseData.courtHall,
        status: caseData.status || "Admitted",
        statutoryActs: caseData.statutoryActs,
      });

      if (res?.success && res.matter) {
        const imported: LegalMatter = {
          id: res.matter.id || res.matter._id,
          caseNumber: res.matter.caseNumber,
          title: res.matter.matterTitle || res.matter.title,
          court: res.matter.courtForum || res.matter.court,
          assignedAdvocate: res.matter.assignedAdvocate || res.matter.advocateName || "Pending Counsel Assignment",
          nextHearing: res.matter.nextHearing || "Listed for hearing",
          filingDate: res.matter.filingDate || new Date().toISOString().split("T")[0],
          status: res.matter.status || "Admitted",
          cnrNumber: res.matter.cnrNumber,
          courtHall: res.matter.courtHall,
          statutoryActs: res.matter.statutoryActs,
          timeline: res.matter.timeline,
        };
        setMatters((prev) => [imported, ...prev.filter((m) => m.id !== imported.id)]);
        setLiveTrackedResult(null);
        setSelectedMatterDetail(imported);
      }
    } catch (err) {
      console.warn("Error importing case docket:", err);
    } finally {
      setIsImporting(false);
    }
  };

  const filteredMatters = matters.filter((m) => {
    // 1. Status Filter
    if (statusFilter !== "All" && (m.status || "").toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    // 2. Search Query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();

    return (
      (m.caseNumber && m.caseNumber.toLowerCase().includes(q)) ||
      (m.title && m.title.toLowerCase().includes(q)) ||
      (m.court && m.court.toLowerCase().includes(q)) ||
      (m.assignedAdvocate && m.assignedAdvocate.toLowerCase().includes(q)) ||
      (m.cnrNumber && m.cnrNumber.toLowerCase().includes(q)) ||
      (m.courtHall && m.courtHall.toLowerCase().includes(q)) ||
      (m.nextHearing && m.nextHearing.toLowerCase().includes(q)) ||
      (m.statutoryActs && m.statutoryActs.some((act) => act.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Header exactly matching user screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
            My Legal Matters
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Track court status, hearing postings, and assigned advocate updates
          </p>
        </div>

        {/* Optional Search / CNR Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Petition / Matter</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCnrTracker(!showCnrTracker)}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{showCnrTracker ? "Hide CNR Search" : "16-Digit CNR Search"}</span>
          </button>
        </div>
      </div>

      {/* Optional CNR Search Drawer */}
      {showCnrTracker && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={customCnr}
                onChange={(e) => {
                  setCustomCnr(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTrackCnr();
                }}
                placeholder="Enter 16-Digit CNR Number or Case Number..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
            <button
              type="button"
              disabled={isSearchingCnr || !customCnr.trim()}
              onClick={handleTrackCnr}
              className="px-4 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shrink-0"
            >
              {isSearchingCnr ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Querying e-Courts...</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5" />
                  <span>Track Live Docket</span>
                </>
              )}
            </button>
            {customCnr && (
              <button
                type="button"
                onClick={() => {
                  setCustomCnr("");
                  setSearchQuery("");
                  setLiveTrackedResult(null);
                  setCnrFeedback(null);
                }}
                className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {cnrFeedback && (
            <div className="p-3.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
              {cnrFeedback}
            </div>
          )}

          {/* Live eCourts Docket Result Card */}
          {liveTrackedResult && liveTrackedResult.matter && (
            <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-ping" />
                  <span className="text-xs font-bold text-black dark:text-white">
                    {liveTrackedResult.isLinkedToUser
                      ? "Active Case Docket in Your Account"
                      : "Live e-Courts National Judicial Data Grid (NJDG) Record"}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  CNR: {liveTrackedResult.matter.cnrNumber}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs">
                    {liveTrackedResult.matter.caseNumber}
                  </span>
                  <span className="font-bold text-sm text-black dark:text-white">
                    {liveTrackedResult.matter.title || liveTrackedResult.matter.matterTitle}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">Court &amp; Bench</span>
                  <span className="font-semibold text-black dark:text-white">
                    {liveTrackedResult.matter.court}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">Next Hearing</span>
                  <span className="font-semibold text-black dark:text-white">
                    {liveTrackedResult.matter.nextHearing}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">Current Stage</span>
                  <span className="font-semibold text-black dark:text-white">
                    {liveTrackedResult.matter.status || liveTrackedResult.matter.stage}
                  </span>
                </div>
              </div>

              {liveTrackedResult.canImportToDocket && !liveTrackedResult.isLinkedToUser && (
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
                  <button
                    type="button"
                    disabled={isImporting}
                    onClick={() => handleImportTrackedCase(liveTrackedResult.matter)}
                    className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isImporting ? "Importing to Docket..." : "Import & Track in My Matters"}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dedicated Search and Stage Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by case number, title, court forum, CNR number, or assigned advocate..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-2 shrink-0">
            <span className="text-xs text-zinc-500 font-mono px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              Showing {filteredMatters.length} of {matters.length} matters
            </span>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-[11px] font-mono text-zinc-400 mr-1 shrink-0">Filter by Stage:</span>
          {["All", "Admitted", "Notice Issued", "Pre Filing", "Under Scrutiny", "Disposed"].map((st) => {
            const count = st === "All" ? matters.length : matters.filter((m) => (m.status || "").toLowerCase() === st.toLowerCase()).length;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                {st}
                <span className="ml-1.5 opacity-70 font-mono text-[10px]">
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Matters Stack matching exact card layout */}
      <div className="space-y-4 sm:space-y-5">
        {isLoading ? (
          <div className="p-12 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 bg-white dark:bg-black">
            <div className="w-8 h-8 border-2 border-zinc-300 border-t-black dark:border-zinc-700 dark:border-t-white rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-medium">Checking active court dockets &amp; e-Courts filings...</p>
          </div>
        ) : matters.length === 0 ? (
          <div className="p-10 sm:p-14 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-4 bg-white dark:bg-black">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-black dark:text-white">
              <Scale className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-black dark:text-white">
                No Active Legal Matters Yet
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                You do not have any court proceedings linked to your account. Track an ongoing matter via its 16-digit CNR number or book a consultation with an advocate to file a new matter.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center gap-2 cursor-pointer hover:opacity-90 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Petition / Assign Advocate</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCnrTracker(true)}
                className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-bold text-xs flex items-center gap-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <Activity className="w-4 h-4" />
                <span>Track Case via 16-Digit CNR</span>
              </button>
              {onOpenConsultation && (
                <button
                  type="button"
                  onClick={onOpenConsultation}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white font-bold text-xs flex items-center gap-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book Legal Consultation</span>
                </button>
              )}
            </div>
          </div>
        ) : filteredMatters.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-3 bg-white dark:bg-black">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-black dark:text-white">
              <Scale className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-black dark:text-white">
              No legal matters found
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              No court matters match &quot;{searchQuery}&quot;{statusFilter !== "All" ? ` under stage &quot;${statusFilter}&quot;` : ""}. Try searching by case number, party name, court forum, or CNR number.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
              }}
              className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer hover:opacity-90 shadow-xs"
            >
              Clear Search &amp; Filters
            </button>
          </div>
        ) : (
          filteredMatters.map((matter) => (
            <div
              key={matter.id}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-5 sm:p-7 space-y-4 shadow-xs transition-colors"
            >
              {/* Top Row: Case Number Badge & Status Pill */}
              <div className="flex items-center justify-between gap-3">
                <span className="px-3 py-1 rounded-md bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs uppercase tracking-wider">
                  {matter.caseNumber}
                </span>

                <span className="px-3 py-0.5 rounded-full text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                  {matter.status}
                </span>
              </div>

              {/* Matter Title */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-black dark:text-white leading-snug">
                  {matter.title}
                </h3>
              </div>

              {/* Details Row: Court, Assigned Advocate, Next Hearing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                <div>
                  <span className="text-zinc-500">Court: </span>
                  <span className="font-semibold text-black dark:text-white">
                    {matter.court}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-500">Assigned Advocate: </span>
                  <span className="font-semibold text-black dark:text-white">
                    {matter.assignedAdvocate}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-500">Next Hearing: </span>
                  <span className="font-bold text-black dark:text-white">
                    {matter.nextHearing}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Filing Date & View Matter Details Button */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-900 text-xs">
                <span className="text-zinc-400 font-mono text-[11px] sm:text-xs">
                  Filing Date: {matter.filingDate}
                </span>

                <button
                  type="button"
                  onClick={() => handleSelect(matter)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-xs font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View Matter Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Matter Details Slide-Over / Modal */}
      {selectedMatterDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs">
                    {selectedMatterDetail.caseNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                    {selectedMatterDetail.status}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-black dark:text-white">
                  {selectedMatterDetail.title}
                </h3>
                {selectedMatterDetail.cnrNumber && (
                  <span className="text-xs text-zinc-400 font-mono block">
                    CNR: {selectedMatterDetail.cnrNumber} • {selectedMatterDetail.courtHall}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedMatterDetail(null)}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Counsel & Hearing Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 block">
                  Assigned Legal Counsel
                </span>
                <span className="font-bold text-black dark:text-white text-sm block">
                  {selectedMatterDetail.assignedAdvocate}
                </span>
                <span className="text-zinc-500 text-[11px]">
                  Bar Council of Kerala Empanelled Counsel
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 block">
                  Next Listed Hearing
                </span>
                <span className="font-bold text-black dark:text-white text-sm block">
                  {selectedMatterDetail.nextHearing}
                </span>
                <span className="text-zinc-500 text-[11px]">
                  {selectedMatterDetail.court}
                </span>
              </div>
            </div>

            {/* Applicable Statutes */}
            {selectedMatterDetail.statutoryActs && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 block">
                  Applicable Statutory Provisions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMatterDetail.statutoryActs.map((act, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300"
                    >
                      {act}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Progression Milestones Timeline */}
            {selectedMatterDetail.timeline && (
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 block">
                  Case Progression Milestones
                </span>
                <div className="space-y-2.5">
                  {selectedMatterDetail.timeline.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3"
                    >
                      <div className="mt-0.5">
                        {step.stage === "Completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-black dark:text-white" />
                        ) : (
                          <Clock className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-xs space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-black dark:text-white">
                            {step.title}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                            {step.date}
                          </span>
                        </div>
                        <p className="text-zinc-500 text-[11px] leading-relaxed">
                          {step.remarks}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMatterDetail(null);
                      onNavigateTab("task-and-timeline");
                    }}
                    className="w-full py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>View Complete Chronological Case Timeline &amp; Next Steps</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedMatterDetail(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                Close
              </button>

              {onOpenConsultation && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMatterDetail(null);
                    onOpenConsultation();
                  }}
                  className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs shadow-xs hover:opacity-90 cursor-pointer"
                >
                  Schedule Chamber Consultation
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Petition / Matter Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Create Petition / Legal Matter
                </h3>
                <p className="text-xs text-zinc-500">
                  Assign directly to a verified advocate so it appears in their chamber pipeline immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPetition} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  Petition / Matter Title
                </label>
                <input
                  type="text"
                  required
                  value={newPetitionTitle}
                  onChange={(e) => setNewPetitionTitle(e.target.value)}
                  placeholder="e.g., Mutual Consent Divorce Petition under Sec. 13B HMA"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    Case Category
                  </label>
                  <select
                    value={newPetitionCategory}
                    onChange={(e) => setNewPetitionCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  >
                    <option value="Family & Matrimonial">Family &amp; Matrimonial</option>
                    <option value="Property & Real Estate">Property &amp; Real Estate</option>
                    <option value="Civil Litigation">Civil Litigation</option>
                    <option value="Criminal Defense & Bail">Criminal Defense &amp; Bail</option>
                    <option value="Corporate & Commercial">Corporate &amp; Commercial</option>
                    <option value="Constitutional Writs">Constitutional Writs</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    Court / Forum
                  </label>
                  <input
                    type="text"
                    value={newPetitionCourt}
                    onChange={(e) => setNewPetitionCourt(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  Select Assigned Advocate
                </label>
                <select
                  value={newPetitionAdvocateId}
                  onChange={(e) => setNewPetitionAdvocateId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                >
                  {registeredAdvocates.length === 0 ? (
                    <option value="">No registered advocates loaded yet</option>
                  ) : (
                    registeredAdvocates.map((adv) => {
                      const advId = adv.id || adv._id || adv.userId;
                      return (
                        <option key={advId} value={advId}>
                          {adv.fullName || adv.name} ({adv.barCouncilNumber || "Verified"})
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  Petition Facts / Relief Sought
                </label>
                <textarea
                  rows={3}
                  value={newPetitionSummary}
                  onChange={(e) => setNewPetitionSummary(e.target.value)}
                  placeholder="Briefly state key dates, mutual settlement terms, or urgency..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingMatter || !newPetitionTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs shadow-xs hover:opacity-90 cursor-pointer disabled:opacity-50"
                >
                  {isCreatingMatter ? "Submitting Petition..." : "Submit Petition to Advocate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
