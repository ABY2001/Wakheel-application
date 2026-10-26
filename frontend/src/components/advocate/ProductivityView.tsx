"use client";

import React, { useState, useEffect } from "react";
import {
  StickyNote,
  Calendar,
  CheckCircle2,
  Clock,
  Activity,
  GraduationCap,
  Plus,
  Search,
  Check,
  Play,
  Award,
  Sparkles,
  ArrowRight,
  User,
  X,
  FileText,
  Bookmark,
  Shield,
  Scale,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { advocateApi, CaseNoteItem, CauseListItem } from "@/lib/api";
import { AdvocateConsultationsView } from "./AdvocateConsultationsView";
import dynamic from "next/dynamic";

const CourtroomVoiceSimulatorView = dynamic(
  () => import("./CourtroomVoiceSimulatorView").then((mod) => mod.CourtroomVoiceSimulatorView),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
        Loading Courtroom Oral Hearing Simulator...
      </div>
    ),
  }
);

interface ProductivityViewProps {
  activeModule?: string;
  onSelectModule?: (mod: string) => void;
  advocateName?: string;
}

export function ProductivityView({
  activeModule = "notes",
  onSelectModule,
  advocateName = "Adv. Meera Krishnan",
}: ProductivityViewProps) {
  const [currentTab, setCurrentTab] = useState<string>(activeModule);
  const [activeTaskFilter, setActiveTaskFilter] = useState<"all" | "urgent" | "causelist">("all");

  // Live state from Backend
  const [notes, setNotes] = useState<CaseNoteItem[]>([]);
  const [causeList, setCauseList] = useState<CauseListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // New Note Modal / Inline Form
  const [showAddNote, setShowAddNote] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<"hearing_memo" | "precedent_notes" | "client_instructions">("hearing_memo");
  const [newTags, setNewTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Case Tracker Live State
  const [trackerCnr, setTrackerCnr] = useState("DLHC010049212026");
  const [trackerCaseQuery, setTrackerCaseQuery] = useState("");
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [trackerResult, setTrackerResult] = useState<any>(null);
  const [isImportingCase, setIsImportingCase] = useState(false);
  const [trackerFeedback, setTrackerFeedback] = useState<string | null>(null);

  const handleTrackDocket = async (overrideQuery?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : trackerCnr.trim() || trackerCaseQuery.trim();
    if (!q) return;
    try {
      setTrackerLoading(true);
      setTrackerFeedback(null);
      const res = await advocateApi.trackCase(undefined, q);
      if (res && res.success && res.matter) {
        setTrackerResult(res);
      }
    } catch (err: any) {
      console.warn("Tracker lookup failed:", err);
    } finally {
      setTrackerLoading(false);
    }
  };

  const handleImportDocket = async (addToCauseList = false) => {
    if (!trackerResult?.matter) return;
    try {
      setIsImportingCase(true);
      const res = await advocateApi.createMatter(undefined, {
        caseNumber: trackerResult.matter.caseNumber,
        title: trackerResult.matter.title || trackerResult.matter.caseTitle,
        courtForum: trackerResult.matter.court || trackerResult.matter.courtForum,
        cnrNumber: trackerResult.matter.cnrNumber,
        courtHall: trackerResult.matter.courtHall,
        status: trackerResult.matter.status || "Admitted",
        statutoryActs: trackerResult.matter.statutoryActs,
        addToCauseList,
      });
      if (res?.success) {
        setTrackerFeedback(
          addToCauseList
            ? `Docket pinned to Daily Cause List & added to active matters!`
            : `Docket added to chamber active matters!`
        );
        setTrackerResult((prev: any) => ({
          ...prev,
          isLinkedToUser: true,
          source: "advocate_docket",
        }));
        if (addToCauseList) {
          const clRes = await advocateApi.getCauseList();
          if (clRes.success && clRes.causeList) setCauseList(clRes.causeList);
        }
      }
    } catch (err: any) {
      console.warn("Import docket failed:", err);
      setTrackerFeedback("Import failed. Please check backend connection.");
    } finally {
      setIsImportingCase(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [notesRes, clRes, trackerRes] = await Promise.all([
          advocateApi.getCaseNotes(),
          advocateApi.getCauseList(),
          advocateApi.trackCase(undefined, "DLHC010049212026"),
        ]);
        if (isMounted) {
          if (notesRes.success && notesRes.notes) setNotes(notesRes.notes);
          if (clRes.success && clRes.causeList) setCauseList(clRes.causeList);
          if (trackerRes && trackerRes.success && trackerRes.matter) setTrackerResult(trackerRes);
        }
      } catch (err) {
        console.error("Error loading productivity data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      setIsSubmitting(true);
      const res = await advocateApi.createCaseNote({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        tags: newTags ? newTags.split(",").map((t) => t.trim()) : [],
      });
      if (res.success && res.note) {
        setNotes((prev) => [res.note, ...prev]);
        setShowAddNote(false);
        setNewTitle("");
        setNewContent("");
        setNewTags("");
      }
    } catch (err) {
      console.error("Failed to create case note:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "notes", label: "Notes", icon: StickyNote },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "appointments", label: "Appointments", icon: Clock },
    { id: "taskmite", label: "Taskmite", icon: CheckCircle2 },
    { id: "time-sheet", label: "Time Sheet", icon: Clock },
    { id: "case-tracker", label: "Case Tracker", icon: Activity },
    { id: "practice-ai", label: "Practice with AI", icon: GraduationCap },
  ];

  const handleTabChange = (id: string) => {
    setCurrentTab(id);
    if (onSelectModule) onSelectModule(id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
              Productivity Suite
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
              Chamber Workflow
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mt-1">
            Chamber Task &amp; Time Management
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Organize case briefs, hearing schedules, task checklists, court billing hours, live eCourts tracking, and AI court practice.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW: Notes */}
      {currentTab === "notes" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-black dark:text-white">Chamber Briefing Notes &amp; Memos</h3>
              <p className="text-xs text-zinc-500">Confidential research, case preparation notes, and precedent citations.</p>
            </div>
            <button
              onClick={() => setShowAddNote(!showAddNote)}
              className="px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer hover:opacity-85 transition-opacity"
            >
              {showAddNote ? "Cancel" : "+ New Note"}
            </button>
          </div>

          {/* New Note Form */}
          {showAddNote && (
            <form
              onSubmit={handleCreateNote}
              className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                Draft New Chamber Memo / Precedent
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Memo Title (e.g. Valsamma v. KSEB Analysis)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden"
                  required
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden"
                >
                  <option value="hearing_memo">Hearing Memo</option>
                  <option value="precedent_notes">Precedent Notes</option>
                  <option value="client_instructions">Client Instructions</option>
                </select>
              </div>
              <textarea
                rows={3}
                placeholder="Memo contents, statutory citations, or client briefing notes..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden"
                required
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Tags (comma separated, e.g. Telegraph Act, Division Bench)"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden flex-1"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer hover:opacity-85 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Memo"}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {notes.map((n) => (
              <div
                key={n._id}
                className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs hover:border-black dark:hover:border-white transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 uppercase tracking-wider">
                      {n.category.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-black dark:text-white">{n.title}</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                    {n.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {(n.tags || []).slice(0, 2).map((t, tidx) => (
                      <span key={tidx} className="text-[9px] font-mono text-zinc-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-black dark:text-white">
                    Confidential
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: Calendar */}
      {currentTab === "calendar" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Listed Hearings Today</span>
              <div className="text-2xl font-bold text-black dark:text-white">
                {causeList.filter((c) => new Date(c.courtDate).toDateString() === new Date().toDateString()).length} Hearings
              </div>
              <span className="text-[10px] text-zinc-500">Court Hall 2A &amp; Court Hall 1</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Total Causelist Items</span>
              <div className="text-2xl font-bold text-black dark:text-white">
                {causeList.length} Matters
              </div>
              <span className="text-[10px] text-zinc-500">High Court of Kerala &amp; NCLT</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Jurisdictions</span>
              <div className="text-2xl font-bold text-black dark:text-white">Ernakulam</div>
              <span className="text-[10px] text-zinc-500">High Court, NCLT, Sub Court</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-black dark:text-white">Daily Court Causelist Schedule</h3>
              <span className="text-xs font-mono text-zinc-500">
                Live Feed: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {causeList.map((h) => (
                <div key={h._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-black dark:text-white font-mono">10:30 AM</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        Item #{h.itemNumber}
                      </span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {h.courtHall} • {h.courtName}
                      </span>
                    </div>
                    <div className="text-zinc-500 text-[11px] font-mono">
                      {h.caseNumber} • {h.petitioner} vs {h.respondent}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Bench: {h.bench}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-black dark:text-white">
                      {h.stage}
                    </span>
                    <button className="px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer hover:opacity-85">
                      Pass Slip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Appointments */}
      {currentTab === "appointments" && (
        <AdvocateConsultationsView />
      )}

      {/* VIEW: Taskmite */}
      {currentTab === "taskmite" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-black dark:text-white">Taskmite — Chamber Action Checklist</h3>
              <p className="text-xs text-zinc-500">Track filing deadlines, associate tasks, and court document submissions.</p>
            </div>
            <button className="px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer">
              + Add Task
            </button>
          </div>

          <div className="space-y-3">
            {[
              { task: "File Rejoinder Affidavit in WP 1024/2026 before 04:00 PM", priority: "URGENT", due: "Today", assignedTo: "Adv. Rajiv Malhotra", done: false },
              { task: "Serve advance copy of Bail Application on Standing Counsel", priority: "HIGH", due: "Tomorrow, 11:00 AM", assignedTo: "Suresh Rawat", done: false },
              { task: "Draft Section 14 Eviction Notice for Alex Morgan matter", priority: "MEDIUM", due: "14 Oct", assignedTo: "Adv. Preeti Sharma", done: true },
              { task: "Prepare synopsis of case laws on retrospective application of BNSS Section 479", priority: "MEDIUM", due: "15 Oct", assignedTo: "Kunal Verma", done: false },
            ].map((t, idx) => (
              <div key={idx} className={`p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 transition-all ${t.done ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer ${
                    t.done ? "bg-black text-white dark:bg-white dark:text-black border-transparent" : "border-zinc-300 dark:border-zinc-700"
                  }`}>
                    {t.done && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className={`text-xs font-bold text-black dark:text-white ${t.done ? "line-through text-zinc-400" : ""}`}>
                      {t.task}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                      <span>Assigned: {t.assignedTo}</span>
                      <span>•</span>
                      <span>Due: {t.due}</span>
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: Time Sheet */}
      {currentTab === "time-sheet" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Logged Billable Hours (Oct)</span>
              <div className="text-2xl font-bold text-black dark:text-white">142.5 Hrs</div>
              <span className="text-[10px] text-zinc-500">₹ 22,000 / hour standard rate</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Court Appearance Hours</span>
              <div className="text-2xl font-bold text-black dark:text-white">48.0 Hrs</div>
              <span className="text-[10px] text-zinc-500">High Court &amp; Appellate Benches</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Drafting &amp; Research Hours</span>
              <div className="text-2xl font-bold text-black dark:text-white">94.5 Hrs</div>
              <span className="text-[10px] text-zinc-500">Chamber associate time included</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-black dark:text-white">Live Active Billing Timer</h3>
              <button className="px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer">
                + Log Entry
              </button>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-black dark:text-white animate-pulse" />
                <div>
                  <span className="text-xs font-bold text-black dark:text-white">Active Session: CyberCorp Commercial Arbitration Rejoinder</span>
                  <p className="text-[11px] text-zinc-500">Matter #ARB-2026/104 • Client: CyberCorp Technologies Ltd</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-base font-bold text-black dark:text-white">01:42:18</span>
                <button className="px-4 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer">
                  Pause &amp; Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Case Tracker */}
      {currentTab === "case-tracker" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white">Live eCourts Case Search &amp; Docket Tracker</h3>
                <p className="text-xs text-zinc-500">Query 16-digit CNR numbers or case proceedings against National Judicial Data Grid (NJDG).</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                <Shield className="w-3.5 h-3.5" />
                <span>e-Courts NJDG Sync Active</span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTrackDocket();
              }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <input
                type="text"
                placeholder="Enter 16-Digit CNR Number"
                value={trackerCnr}
                onChange={(e) => setTrackerCnr(e.target.value)}
                className="px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden"
              />
              <input
                type="text"
                placeholder="Case Type &amp; Number (e.g. WP(C) 1024/2026)"
                value={trackerCaseQuery}
                onChange={(e) => setTrackerCaseQuery(e.target.value)}
                className="px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={trackerLoading}
                className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {trackerLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Querying NJDG...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Track Live Docket</span>
                  </>
                )}
              </button>
            </form>

            {/* Sample CNR Chips for Quick Testing */}
            <div className="flex items-center flex-wrap gap-2 pt-1 text-[11px] text-zinc-500">
              <span className="font-semibold text-black dark:text-white">Sample Dockets:</span>
              <button
                type="button"
                onClick={() => {
                  setTrackerCnr("DLHC010049212026");
                  handleTrackDocket("DLHC010049212026");
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
              >
                DLHC010049212026 (Delhi HC)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrackerCnr("KLHC010194822024");
                  handleTrackDocket("KLHC010194822024");
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
              >
                KLHC010194822024 (Kerala HC)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrackerCnr("KLER020084122024");
                  handleTrackDocket("KLER020084122024");
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
              >
                KLER020084122024 (Sub Court)
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {trackerFeedback && (
            <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-black dark:text-white">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-black dark:text-white" />
                <span>{trackerFeedback}</span>
              </div>
              <button
                onClick={() => setTrackerFeedback(null)}
                className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Docket Details Card */}
          {trackerResult?.matter && (
            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white animate-ping" />
                  <span className="text-xs font-bold text-black dark:text-white">
                    Active Case Status: CNR #{trackerResult.matter.cnrNumber || trackerCnr}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                    {trackerResult.isLinkedToUser ? "Chamber Active Docket" : "eCourts NJDG Live"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-500">Live Synced</span>
                  <button
                    onClick={() => handleTrackDocket()}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer text-zinc-600 dark:text-zinc-400"
                    title="Re-sync Docket"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Case Title & Court */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-black text-white dark:bg-white dark:text-black">
                    {trackerResult.matter.caseNumber}
                  </span>
                  <span className="text-xs font-bold text-black dark:text-white">
                    {trackerResult.matter.title || trackerResult.matter.caseTitle}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  {trackerResult.matter.court || trackerResult.matter.courtForum}
                </p>
              </div>

              {/* 4-Metric Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2 pb-2">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-500 text-[10px] block font-semibold uppercase tracking-wider">COURT &amp; BENCH</span>
                  <span className="font-bold text-black dark:text-white block">
                    {trackerResult.matter.courtHall || "Court Hall 2A"}
                  </span>
                  <span className="text-[11px] text-zinc-400 block line-clamp-1">
                    {trackerResult.matter.bench || "Division Bench"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-500 text-[10px] block font-semibold uppercase tracking-wider">NEXT HEARING DATE</span>
                  <span className="font-bold text-black dark:text-white block">
                    {trackerResult.matter.nextHearing || "Today, 12 Oct 2026 (Item 14)"}
                  </span>
                  <span className="text-[11px] text-zinc-400 block">
                    Cause List #{trackerResult.matter.causeListItemNumber || 14}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-500 text-[10px] block font-semibold uppercase tracking-wider">STAGE OF CASE</span>
                  <span className="font-bold text-black dark:text-white block">
                    {trackerResult.matter.stage || trackerResult.matter.status || "Admitted"}
                  </span>
                  <span className="text-[11px] text-zinc-400 block">
                    Filing: {trackerResult.matter.filingDate || "2026-06-14"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-500 text-[10px] block font-semibold uppercase tracking-wider">COUNSEL ON RECORD</span>
                  <span className="font-bold text-black dark:text-white block">
                    {trackerResult.matter.assignedAdvocate || "Adv. Sarah Jenkins"}
                  </span>
                  <span className="text-[11px] text-zinc-400 block">Lead Arguing Counsel</span>
                </div>
              </div>

              {/* Statutory Acts */}
              {Array.isArray(trackerResult.matter.statutoryActs) && trackerResult.matter.statutoryActs.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Statutory Provisions &amp; Acts</span>
                  <div className="flex flex-wrap gap-1.5">
                    {trackerResult.matter.statutoryActs.map((act: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-black dark:text-white"
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Proceedings Timeline */}
              {Array.isArray(trackerResult.matter.timeline) && trackerResult.matter.timeline.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-bold text-black dark:text-white">Court Proceedings &amp; Interim Orders</span>
                  <div className="space-y-2">
                    {trackerResult.matter.timeline.map((event: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-zinc-400 font-bold">{event.date}</span>
                            <span className="font-bold text-black dark:text-white">{event.title}</span>
                          </div>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{event.remarks}</p>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                          {event.stage || "Completed"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="text-[11px] text-zinc-500">
                  {trackerResult.isLinkedToUser
                    ? "✓ Docket linked to your chamber pipeline."
                    : "Docket available on National Judicial Data Grid (NJDG)."}
                </div>
                <div className="flex items-center gap-2">
                  {!trackerResult.isLinkedToUser ? (
                    <>
                      <button
                        onClick={() => handleImportDocket(false)}
                        disabled={isImportingCase}
                        className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer disabled:opacity-50"
                      >
                        {isImportingCase ? "Importing..." : "Add to Active Matters"}
                      </button>
                      <button
                        onClick={() => handleImportDocket(true)}
                        disabled={isImportingCase}
                        className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-85 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Pin to Daily Cause List</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>Tracked in Chamber Matters</span>
                      </span>
                      <button
                        onClick={() => handleImportDocket(true)}
                        disabled={isImportingCase}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                      >
                        Add to Cause List
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: Practice with AI - Milestone 3 Interactive Courtroom Voice Simulator */}
      {currentTab === "practice-ai" && (
        <CourtroomVoiceSimulatorView advocateName={advocateName} />
      )}
    </div>
  );
}
