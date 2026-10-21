"use client";

import React, { useState, useEffect } from "react";
import { citizenApi } from "@/lib/api";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Video,
  FileText,
  Filter,
  ArrowUpRight,
  ChevronDown,
  X,
  Scale,
  Check,
  Download,
  Building,
  RefreshCw,
} from "lucide-react";

export interface TimelineMilestone {
  id: string;
  matterId: string;
  date: string;
  rawDate: string;
  title: string;
  description: string;
  status: "Scheduled" | "Completed";
  benchOrCounsel?: string;
  hasOrderDoc?: boolean;
  orderDocName?: string;
  actionType?: "consultation" | "court" | "filing" | "evidence";
}

const DEFAULT_MILESTONES: TimelineMilestone[] = [
  // WP(C) 19482/2024 — Gopakumar v. KSEB (matching user's exact screenshot)
  {
    id: "ts-01",
    matterId: "wpc-19482",
    date: "20-Nov-2024",
    rawDate: "2024-11-20",
    title: "Upcoming Final Arguments in Kerala High Court",
    description:
      "Hon'ble Justice K. Haripal, Bench 4B. Your presence in court is optional; advocate will appear.",
    status: "Scheduled",
    benchOrCounsel: "Bench 4B, Kerala High Court",
    actionType: "court",
  },
  {
    id: "ts-02",
    matterId: "wpc-19482",
    date: "15-Nov-2024",
    rawDate: "2024-11-15",
    title: "Pre-Hearing Video Consultation",
    description: "Video strategy meeting with Adv. Meera Krishnan.",
    status: "Scheduled",
    benchOrCounsel: "Adv. Meera Krishnan (High Court Counsel)",
    actionType: "consultation",
  },
  {
    id: "ts-03",
    matterId: "wpc-19482",
    date: "02-Jul-2024",
    rawDate: "2024-07-02",
    title: "Interim Stay of Tree-Felling Granted",
    description:
      "High Court passed stay order prohibiting KSEB from entering agricultural holding.",
    status: "Completed",
    benchOrCounsel: "Justice K. Haripal, Single Bench",
    hasOrderDoc: true,
    orderDocName: "Interim_Stay_Order_Bench_4B.pdf",
    actionType: "court",
  },
  {
    id: "ts-04",
    matterId: "wpc-19482",
    date: "14-Jun-2024",
    rawDate: "2024-06-14",
    title: "Writ Petition Filed in Kerala High Court",
    description: "Filed under Article 226 as WP(C) 19482/2024.",
    status: "Completed",
    benchOrCounsel: "Filing Scrutiny Division, Ernakulam",
    hasOrderDoc: true,
    orderDocName: "WPC_19482_2024_Paperbook.pdf",
    actionType: "filing",
  },

  // ARB/NCLT/KOCHI/2024/041
  {
    id: "ts-05",
    matterId: "arb-nclt",
    date: "24-Nov-2024",
    rawDate: "2024-11-24",
    title: "Arbitration Hearing on Section 17 Interim Relief",
    description:
      "Sole Arbitrator hearing on urgent preservation of escrow assets and ledger disclosure.",
    status: "Scheduled",
    benchOrCounsel: "Justice (Retd.) K. Abraham Mathew, Sole Arbitrator",
    actionType: "court",
  },
  {
    id: "ts-06",
    matterId: "arb-nclt",
    date: "10-Nov-2024",
    rawDate: "2024-11-10",
    title: "Filing of Forensic Audit Rebuttal Affidavit",
    description:
      "Transmission of audited book records counter-rebutting supplier default claims.",
    status: "Scheduled",
    benchOrCounsel: "Adv. Sanjay Verma (Commercial Practice)",
    actionType: "filing",
  },
  {
    id: "ts-07",
    matterId: "arb-nclt",
    date: "15-Aug-2024",
    rawDate: "2024-08-15",
    title: "Arbitral Tribunal Constituted",
    description:
      "Formal consent under Section 12(1) executed; procedural timetable settled.",
    status: "Completed",
    benchOrCounsel: "Arbitration Centre, High Court of Kerala",
    actionType: "court",
  },

  // OS 412/2023
  {
    id: "ts-08",
    matterId: "os-412",
    date: "05-Dec-2024",
    rawDate: "2024-12-05",
    title: "Cross-Examination of Plaintiff Witness (PW-1)",
    description:
      "Trial stage hearing before Additional Sub Court, Ernakulam. Client attendance required.",
    status: "Scheduled",
    benchOrCounsel: "Addl. Sub Court, Ernakulam",
    actionType: "court",
  },
  {
    id: "ts-09",
    matterId: "os-412",
    date: "18-Nov-2024",
    rawDate: "2024-11-18",
    title: "Advocate Commissioner Site Report Submission",
    description:
      "Court-appointed surveyor to submit re-survey report and physical measurement sketch.",
    status: "Scheduled",
    benchOrCounsel: "Court Commission Division",
    actionType: "evidence",
  },
  {
    id: "ts-10",
    matterId: "os-412",
    date: "12-Jan-2024",
    rawDate: "2024-01-12",
    title: "Ad-Interim Status Quo Injunction Decreed",
    description:
      "Court ordered both parties to preserve status quo over boundary plot Sy. 441/2.",
    status: "Completed",
    benchOrCounsel: "Sub Court Bench 2",
    hasOrderDoc: true,
    orderDocName: "Status_Quo_Injunction_Order_OS412.pdf",
    actionType: "court",
  },
];

export interface MatterOption {
  id: string;
  title: string;
  fullTitle: string;
  court: string;
  counsel: string;
  nextHearing?: string;
  stage?: string;
  timeline?: Array<{
    date: string;
    title: string;
    remarks: string;
    stage: string;
  }>;
}

const AVAILABLE_MATTERS: MatterOption[] = [
  {
    id: "mat_wpc_19482",
    title: "WP(C) 19482/2024",
    fullTitle: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    court: "High Court of Kerala (Ernakulam Bench)",
    counsel: "Adv. Meera Krishnan",
  },
  {
    id: "mat-02",
    title: "ARB/NCLT/KOCHI/2024/041",
    fullTitle: "ARB/NCLT/KOCHI/2024/041 — Malabar Infotech Solutions",
    court: "National Company Law Tribunal (Kochi Bench)",
    counsel: "Adv. Meera Krishnan",
  },
  {
    id: "mat-03",
    title: "OS 412/2023",
    fullTitle: "OS 412/2023 — Gopakumar v. Varghese",
    court: "Sub Court, Ernakulam",
    counsel: "Adv. Meera Krishnan",
  },
];

const mapTimelineEvents = (
  matterId: string,
  events: any[],
  fallbackCourt = "Court Hall 2A",
  fallbackCounsel = "Adv. Meera Krishnan"
): TimelineMilestone[] => {
  if (!Array.isArray(events) || events.length === 0) return [];
  return events.map((item, idx) => {
    const isCompleted =
      item.stage?.toLowerCase().includes("completed") ||
      item.stage?.toLowerCase().includes("admitted") ||
      item.stage?.toLowerCase().includes("active") ||
      item.status === "Completed";

    const hasOrder =
      Boolean(item.hasOrderDoc || item.orderDocName) ||
      item.title?.toLowerCase().includes("order") ||
      item.title?.toLowerCase().includes("stay") ||
      item.title?.toLowerCase().includes("decree");

    const orderName =
      item.orderDocName ||
      (item.title?.toLowerCase().includes("stay")
        ? "Interim_Stay_Order_Bench_2A.pdf"
        : item.title?.toLowerCase().includes("order")
        ? "Certified_Court_Order.pdf"
        : undefined);

    const isVideoConsultation =
      item.actionType === "consultation" ||
      item.title?.toLowerCase().includes("consultation") ||
      item.title?.toLowerCase().includes("meeting");

    const isFiling =
      item.actionType === "filing" ||
      item.title?.toLowerCase().includes("filed") ||
      item.title?.toLowerCase().includes("filing") ||
      item.title?.toLowerCase().includes("rejoinder");

    return {
      id: item.id || `ts-${matterId}-${idx}`,
      matterId,
      date: item.date || "Listed Hearing",
      rawDate: item.rawDate || item.date || "",
      title: item.title || "Court Proceedings Update",
      description:
        item.remarks ||
        item.description ||
        "Proceedings milestone logged on case chronology.",
      status: isCompleted ? "Completed" : "Scheduled",
      benchOrCounsel:
        item.benchOrCounsel ||
        item.bench ||
        (isVideoConsultation ? fallbackCounsel : fallbackCourt),
      hasOrderDoc: hasOrder,
      orderDocName: orderName,
      actionType: isVideoConsultation ? "consultation" : isFiling ? "filing" : "court",
    };
  });
};

interface CaseTimelineViewProps {
  initialMatter?: string;
  onOpenBookingModal?: (counsel: string) => void;
}

export function CaseTimelineView({
  initialMatter,
  onOpenBookingModal,
}: CaseTimelineViewProps) {
  const [mattersList, setMattersList] = useState<MatterOption[]>(AVAILABLE_MATTERS);
  const [selectedMatterKey, setSelectedMatterKey] = useState<string>("mat_wpc_19482");
  const [milestones, setMilestones] = useState<TimelineMilestone[]>(DEFAULT_MILESTONES);
  const [statusFilter, setStatusFilter] = useState<"all" | "Scheduled" | "Completed">("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSubmittingMilestone, setIsSubmittingMilestone] = useState(false);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  // Form State for Adding New Milestone
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStatus, setNewStatus] = useState<"Scheduled" | "Completed">("Scheduled");

  const currentMatter =
    mattersList.find((m) => m.id === selectedMatterKey) || mattersList[0];

  const loadMattersAndTimeline = async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("wakheel_token") || "dev_token"
        : "dev_token";
    try {
      setIsLoadingTimeline(true);
      const res = await citizenApi.getMatters(token);
      if (res?.success && Array.isArray(res.matters) && res.matters.length > 0) {
        const mappedMatters: MatterOption[] = res.matters.map((m: any) => ({
          id: m.id || m._id,
          title: m.caseNumber || m.title,
          fullTitle: `${m.caseNumber} — ${m.title || m.matterTitle}`,
          court: m.court || m.courtForum || "High Court of Kerala",
          counsel: m.assignedAdvocate || m.advocateName || "Adv. Meera Krishnan",
          nextHearing: m.nextHearing,
          stage: m.stage || m.status,
          timeline: m.timeline || [],
        }));
        setMattersList(mappedMatters);

        let targetId = mappedMatters[0].id;
        if (initialMatter) {
          const match = mappedMatters.find(
            (m) =>
              m.title.toLowerCase().includes(initialMatter.toLowerCase()) ||
              m.fullTitle.toLowerCase().includes(initialMatter.toLowerCase()) ||
              initialMatter.toLowerCase().includes(m.title.toLowerCase())
          );
          if (match) targetId = match.id;
        } else if (selectedMatterKey && mappedMatters.some((m) => m.id === selectedMatterKey)) {
          targetId = selectedMatterKey;
        }

        setSelectedMatterKey(targetId);
        const targetMatter = mappedMatters.find((m) => m.id === targetId) || mappedMatters[0];
        if (targetMatter.timeline && targetMatter.timeline.length > 0) {
          const mappedEvents = mapTimelineEvents(
            targetId,
            targetMatter.timeline,
            targetMatter.court,
            targetMatter.counsel
          );
          setMilestones(mappedEvents);
        }
      }
    } catch (err) {
      console.warn("Could not load matters from API, using default timeline:", err);
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  useEffect(() => {
    loadMattersAndTimeline();
  }, [initialMatter]);

  const handleSelectMatter = (matterId: string) => {
    setSelectedMatterKey(matterId);
    const target = mattersList.find((m) => m.id === matterId);
    if (target?.timeline && target.timeline.length > 0) {
      const mapped = mapTimelineEvents(matterId, target.timeline, target.court, target.counsel);
      setMilestones(mapped);
    }
  };

  const filteredMilestones = milestones
    .filter((m) => m.matterId === selectedMatterKey)
    .filter((m) => (statusFilter === "all" ? true : m.status === statusFilter));

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate.trim()) return;

    setIsSubmittingMilestone(true);
    const parsed = new Date(newDate);
    const day = String(parsed.getDate()).padStart(2, "0");
    const month = parsed.toLocaleString("en-US", { month: "short" });
    const year = parsed.getFullYear();
    const formattedDisplay = `${day}-${month}-${year}`;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("wakheel_token") || "dev_token"
        : "dev_token";

    try {
      const res = await citizenApi.addMatterTimelineMilestone(token, selectedMatterKey, {
        title: newTitle.trim(),
        remarks: newDescription.trim() || "Milestone logged on case chronology.",
        stage: newStatus,
        date: formattedDisplay,
        nextHearingDate: newDate,
      });

      if (res?.success && res.matter?.timeline) {
        const mapped = mapTimelineEvents(
          selectedMatterKey,
          res.matter.timeline,
          currentMatter.court,
          currentMatter.counsel
        );
        setMilestones(mapped);
      } else {
        const created: TimelineMilestone = {
          id: `ts-${Date.now()}`,
          matterId: selectedMatterKey,
          date: formattedDisplay,
          rawDate: newDate,
          title: newTitle.trim(),
          description: newDescription.trim() || "Milestone logged in case chronology.",
          status: newStatus,
          actionType: "court",
        };
        setMilestones([created, ...milestones]);
      }

      setNewTitle("");
      setNewDate("");
      setNewDescription("");
      setAddModalOpen(false);
    } catch (err) {
      console.warn("Error adding milestone to backend:", err);
    } finally {
      setIsSubmittingMilestone(false);
    }
  };

  const toggleStatus = (id: string) => {
    setMilestones(
      milestones.map((m) => {
        if (m.id === id) {
          const nextStatus = m.status === "Scheduled" ? "Completed" : "Scheduled";
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header matching user's exact screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
            Case Timeline &amp; Next Steps
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Milestones, court orders, and next actions for {currentMatter.title}
          </p>
        </div>

        {/* Action Controls: Matter Selector & Add Button */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <div className="relative">
            <select
              value={selectedMatterKey}
              onChange={(e) => handleSelectMatter(e.target.value)}
              aria-label="Select matter for timeline"
              className="px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer pr-8"
            >
              {mattersList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => loadMattersAndTimeline()}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 cursor-pointer"
            title="Refresh Case Timeline from Court Registry"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingTimeline ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center gap-2 shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs: All, Scheduled, Completed */}
      <div className="flex items-center gap-2 pb-1 overflow-x-auto text-xs font-semibold">
        {(
          [
            { key: "all", label: "All Milestones" },
            { key: "Scheduled", label: "Scheduled (Upcoming)" },
            { key: "Completed", label: "Completed Orders & Filings" },
          ] as const
        ).map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* TIMELINE CONTAINER & VERTICAL LINE (Matching exact user screenshot)  */}
      {/* ===================================================================== */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
        {filteredMilestones.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black space-y-2">
            <Clock className="w-8 h-8 mx-auto text-zinc-400" />
            <h4 className="text-sm font-bold text-black dark:text-white">
              No milestones found for this filter
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              There are no {statusFilter.toLowerCase()} events logged for {currentMatter.title}. Click &quot;Add Milestone&quot; to schedule one.
            </p>
          </div>
        ) : (
          filteredMilestones.map((item) => {
            const isCompleted = item.status === "Completed";
            return (
              <div key={item.id} className="relative group">
                {/* Timeline Node Dot on the vertical line */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-5 w-4 h-4 rounded-full border-2 transition-transform group-hover:scale-110 flex items-center justify-center ${
                    isCompleted
                      ? "border-black dark:border-white bg-black dark:bg-white"
                      : "border-black dark:border-white bg-white dark:bg-black"
                  }`}
                >
                  {isCompleted && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />
                  )}
                </div>

                {/* Milestone Card (Matching screenshot layout, typography & our zinc palette) */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-5 sm:p-6 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-3">
                  {/* Top Row: Date & Status Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono font-bold text-xs sm:text-sm text-black dark:text-white">
                      {item.date}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleStatus(item.id)}
                      title="Click to toggle status"
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isCompleted
                          ? "border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white flex items-center gap-1.5"
                          : "border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600"
                      }`}
                    >
                      {isCompleted && <Check className="w-3 h-3 text-black dark:text-white" />}
                      <span>{item.status}</span>
                    </button>
                  </div>

                  {/* Heading & Details */}
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-black dark:text-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Optional Metadata / Action Footer if applicable */}
                  {(item.benchOrCounsel || item.hasOrderDoc || item.actionType === "consultation") && (
                    <div className="pt-2 border-t border-zinc-100 dark:divide-zinc-900 flex flex-wrap items-center justify-between gap-2 text-xs">
                      {item.benchOrCounsel && (
                        <span className="text-[11px] font-mono text-zinc-400">
                          {item.benchOrCounsel}
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        {item.hasOrderDoc && item.orderDocName && (
                          <button
                            type="button"
                            onClick={() => alert(`Downloading verified copy of ${item.orderDocName}`)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>{item.orderDocName}</span>
                          </button>
                        )}

                        {item.actionType === "consultation" && onOpenBookingModal && (
                          <button
                            type="button"
                            onClick={() => onOpenBookingModal(item.benchOrCounsel || "Adv. Meera Krishnan")}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                          >
                            <Video className="w-3 h-3" />
                            <span>Join / Schedule Video Call</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ===================================================================== */}
      {/* ADD MILESTONE MODAL (Strictly monochrome zinc palette)                */}
      {/* ===================================================================== */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-black dark:text-white" />
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  Add Case Milestone
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="text-zinc-400 hover:text-black dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  Target Matter
                </label>
                <input
                  type="text"
                  disabled
                  value={currentMatter.fullTitle}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  Milestone Date
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  Milestone Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Final Arguments in Bench 4B / Counter Rejoinder Filing"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  Description / Bench Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Details regarding judge bench, required documents, or advocate strategy..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  Initial Status
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="status"
                      checked={newStatus === "Scheduled"}
                      onChange={() => setNewStatus("Scheduled")}
                      className="accent-black dark:accent-white"
                    />
                    <span className="font-semibold text-black dark:text-white">Scheduled</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="status"
                      checked={newStatus === "Completed"}
                      onChange={() => setNewStatus("Completed")}
                      className="accent-black dark:accent-white"
                    />
                    <span className="font-semibold text-black dark:text-white">Completed</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMilestone}
                  className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingMilestone && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingMilestone ? "Saving..." : "Save Milestone"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
