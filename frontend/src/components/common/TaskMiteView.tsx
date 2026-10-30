"use client";

import React, { useState, useMemo } from "react";
import {
  CheckSquare,
  Square,
  FileText,
  Plus,
  Table as TableIcon,
  Columns3,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Settings,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Filter,
  Trash2,
  Edit2,
  Tag,
  Briefcase,
  Layers,
  Sparkles,
  Flame,
  ArrowRight,
  Check,
} from "lucide-react";

export type TaskStatus = "not_started" | "in_progress" | "in_review" | "completed";
export type TaskPriority = "urgent" | "high" | "medium" | "low";
export type TaskType =
  | "Court Filing"
  | "Hearing Prep"
  | "Drafting"
  | "Research"
  | "Client Notice"
  | "Evidence Collection"
  | "Fee Recovery";

export interface TaskItem {
  id: string;
  title: string;
  caseMatter?: string;
  status: TaskStatus;
  type: TaskType;
  dueDate: string;
  dueTime?: string;
  isDueUrgent?: boolean;
  priority: TaskPriority;
  assignee: {
    name: string;
    role?: string;
    avatarInitials: string;
  };
  notes?: string;
  completedAt?: string;
}

export interface ChamberNote {
  id: string;
  title: string;
  category: "hearing_memo" | "precedent_notes" | "client_instructions" | "statute_draft";
  categoryLabel: string;
  content: string;
  tags: string[];
  updatedAt: string;
  isPinned?: boolean;
}

const INITIAL_ADVOCATE_TASKS: TaskItem[] = [
  {
    id: "task-1",
    title: "File Rejoinder Affidavit in WP(C) 19482/2024 before 04:00 PM",
    caseMatter: "WP(C) 19482/2024",
    status: "in_progress",
    type: "Court Filing",
    dueDate: "Today",
    dueTime: "04:00 PM",
    isDueUrgent: true,
    priority: "urgent",
    assignee: {
      name: "Adv. Rajiv Malhotra",
      role: "Senior Associate",
      avatarInitials: "RM",
    },
    notes: "Ensure Section 16 Indian Telegraph Act objection annexures are sworn before Commissioner of Oaths.",
  },
  {
    id: "task-2",
    title: "Serve advance copy of Bail Application on Public Prosecutor",
    caseMatter: "BA 4192/2026",
    status: "not_started",
    type: "Court Filing",
    dueDate: "Tomorrow",
    dueTime: "11:00 AM",
    isDueUrgent: true,
    priority: "high",
    assignee: {
      name: "Suresh Rawat",
      role: "Chamber Clerk",
      avatarInitials: "SR",
    },
    notes: "Obtain seal acknowledgement from High Court Prosecution Desk.",
  },
  {
    id: "task-3",
    title: "Prepare cross-examination questionnaire for Plaintiff Witness in OS 412/2023",
    caseMatter: "OS 412/2023",
    status: "in_review",
    type: "Hearing Prep",
    dueDate: "04 Nov 2026",
    priority: "high",
    assignee: {
      name: "Adv. Sarah Jenkins",
      role: "Senior Counsel",
      avatarInitials: "SJ",
    },
    notes: "Focus on Advocate Commissioner re-survey revenue marks and western boundary easement.",
  },
  {
    id: "task-4",
    title: "Research Supreme Court citations on retrospective Section 479 BNSS application",
    caseMatter: "Chamber Research",
    status: "in_progress",
    type: "Research",
    dueDate: "06 Nov 2026",
    priority: "medium",
    assignee: {
      name: "Kunal Verma",
      role: "Paralegal",
      avatarInitials: "KV",
    },
    notes: "Cross-reference recent 2024 Division Bench judgments from Bombay and Delhi High Courts.",
  },
  {
    id: "task-5",
    title: "Finalize Section 17 Interim Relief memo for NCLT Arbitral Tribunal",
    caseMatter: "ARB/NCLT/041/2024",
    status: "not_started",
    type: "Drafting",
    dueDate: "14 Nov 2026",
    priority: "high",
    assignee: {
      name: "Adv. Rajesh V. Varma",
      role: "Commercial Counsel",
      avatarInitials: "RV",
    },
    notes: "Attach audited escrow ledger statements and software maintenance logs.",
  },
  {
    id: "task-6",
    title: "Scrutiny clearance of registry defects in Commercial Suit #402",
    caseMatter: "CS 402/2026",
    status: "in_progress",
    type: "Court Filing",
    dueDate: "Friday",
    dueTime: "02:30 PM",
    priority: "urgent",
    assignee: {
      name: "Adv. Rajiv Malhotra",
      role: "Senior Associate",
      avatarInitials: "RM",
    },
    notes: "Pay supplementary court fee challan of Rs. 4,200 via e-Treasury portal.",
  },
  // Completed task
  {
    id: "task-7",
    title: "Draft Section 14 Eviction Notice for Alex Morgan tenancy matter",
    caseMatter: "Tenancy 108/2026",
    status: "completed",
    type: "Client Notice",
    dueDate: "14 Oct 2026",
    priority: "medium",
    assignee: {
      name: "Adv. Preeti Sharma",
      role: "Litigation Specialist",
      avatarInitials: "PS",
    },
    completedAt: "14 Oct 2026",
  },
  {
    id: "task-8",
    title: "Submit statutory 30-day notice under Section 35 Consumer Protection Act",
    caseMatter: "CC 892/2024",
    status: "completed",
    type: "Client Notice",
    dueDate: "08 Oct 2026",
    priority: "medium",
    assignee: {
      name: "Adv. Priya Nair",
      role: "Consumer Counsel",
      avatarInitials: "PN",
    },
    completedAt: "08 Oct 2026",
  },
];

const INITIAL_CHAMBER_NOTES: ChamberNote[] = [
  {
    id: "note-1",
    title: "BNSS Section 479 Retrospective Bail Application Precedents",
    category: "precedent_notes",
    categoryLabel: "Precedent Research",
    content:
      "Supreme Court in In Re Policy Strategy for Grant of Bail observed that benevolent criminal procedure amendments apply retrospectively to pending under-trials. Check Article 20(1) protections.",
    tags: ["BNSS", "Bail", "Article 20"],
    updatedAt: "2 hours ago",
    isPinned: true,
  },
  {
    id: "note-2",
    title: "WP(C) 19482/2024 — Division Bench Rejoinder Strategy Notes",
    category: "hearing_memo",
    categoryLabel: "Hearing Memo",
    content:
      "Section 16(1) of Indian Telegraph Act requires prior written notice to occupier before felling yielding trees. KSEB line survey was conducted ex-parte without revenue demarcation.",
    tags: ["High Court", "Telegraph Act", "Stay"],
    updatedAt: "Yesterday",
    isPinned: true,
  },
  {
    id: "note-3",
    title: "Section 34 Arbitration Limitation — 120-Day Inflexible Ceiling",
    category: "precedent_notes",
    categoryLabel: "Arbitration Law",
    content:
      "Supreme Court in Simplex Infrastructure reiterated Section 5 of Limitation Act cannot condone delay beyond 30 days statutory extension. Outer limit is strictly 120 days.",
    tags: ["Arbitration", "Limitation", "Commercial"],
    updatedAt: "3 days ago",
  },
  {
    id: "note-4",
    title: "Client Instructions: Malabar Infotech Software Licensing Dispute",
    category: "client_instructions",
    categoryLabel: "Client Instructions",
    content:
      "Client confirmed all software source modules were delivered by milestone 3. Opposing party withheld escrow release alleging UI bug fixes.",
    tags: ["Commercial", "Escrow", "Contract"],
    updatedAt: "5 days ago",
  },
];

interface TaskMiteViewProps {
  portalType?: "advocate" | "citizen";
  onSelectModule?: (mod: string) => void;
  advocateName?: string;
}

export function TaskMiteView({
  portalType = "advocate",
  onSelectModule,
  advocateName = "Adv. Meera Krishnan",
}: TaskMiteViewProps) {
  // Tools Secondary Drawer Navigation State
  const [activeTool, setActiveTool] = useState<"tasks" | "notes">("tasks");
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState<boolean>(true);

  // View Switcher: Table view vs Kanban board
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  // Accordion open/close states
  const [isOpenTasksExpanded, setIsOpenTasksExpanded] = useState<boolean>(true);
  const [isClosedTasksExpanded, setIsClosedTasksExpanded] = useState<boolean>(false);

  // Task & Notes State
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_ADVOCATE_TASKS);
  const [notesList, setNotesList] = useState<ChamberNote[]>(INITIAL_CHAMBER_NOTES);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Add Task Modal State
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCaseMatter, setNewCaseMatter] = useState("WP(C) 19482/2024");
  const [newType, setNewType] = useState<TaskType>("Court Filing");
  const [newDueDate, setNewDueDate] = useState("Today");
  const [newPriority, setNewPriority] = useState<TaskPriority>("urgent");
  const [newAssigneeName, setNewAssigneeName] = useState("Adv. Rajiv Malhotra");
  const [newNotes, setNewNotes] = useState("");

  // Add Note Modal State
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState<
    "hearing_memo" | "precedent_notes" | "client_instructions" | "statute_draft"
  >("hearing_memo");
  const [noteTags, setNoteTags] = useState("");

  // Selected Task for Detail Modal
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Filtered Tasks
  const { openTasks, closedTasks } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const matchesFilters = (t: TaskItem) => {
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.caseMatter && t.caseMatter.toLowerCase().includes(q)) ||
        t.assignee.name.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" ? t.status === "completed" : t.status !== "completed");
      const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
      const matchType = typeFilter === "all" || t.type === typeFilter;

      return matchSearch && matchPriority && matchType;
    };

    const open = tasks.filter((t) => t.status !== "completed" && matchesFilters(t));
    const closed = tasks.filter((t) => t.status === "completed" && matchesFilters(t));

    return { openTasks: open, closedTasks: closed };
  }, [tasks, searchQuery, statusFilter, priorityFilter, typeFilter]);

  // Toggle Task Completion
  const handleToggleTaskStatus = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isNowDone = t.status !== "completed";
          return {
            ...t,
            status: isNowDone ? "completed" : "in_progress",
            completedAt: isNowDone ? "Just now" : undefined,
          };
        }
        return t;
      })
    );
  };

  // Move task status in Kanban
  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === "completed" ? "Just now" : undefined,
          };
        }
        return t;
      })
    );
  };

  // Delete task
  const handleDeleteTask = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTask?.id === taskId) setSelectedTask(null);
  };

  // Submit new task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const initials = newAssigneeName
      .replace("Adv.", "")
      .trim()
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CH";

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      caseMatter: newCaseMatter.trim() || undefined,
      status: "not_started",
      type: newType,
      dueDate: newDueDate || "Upcoming",
      priority: newPriority,
      isDueUrgent: newPriority === "urgent" || newDueDate.toLowerCase().includes("today"),
      assignee: {
        name: newAssigneeName,
        avatarInitials: initials,
      },
      notes: newNotes.trim() || undefined,
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle("");
    setNewNotes("");
    setIsAddTaskModalOpen(false);
  };

  // Submit new note
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    const catLabels: Record<string, string> = {
      hearing_memo: "Hearing Memo",
      precedent_notes: "Precedent Research",
      client_instructions: "Client Instructions",
      statute_draft: "Statutory Draft",
    };

    const newNote: ChamberNote = {
      id: `note-${Date.now()}`,
      title: noteTitle.trim(),
      category: noteCategory,
      categoryLabel: catLabels[noteCategory] || "Note",
      content: noteContent.trim(),
      tags: noteTags
        ? noteTags
            .split(",")
            .map((t) => t.trim().replace(/^#/, ""))
            .filter(Boolean)
        : ["Chamber"],
      updatedAt: "Just now",
      isPinned: false,
    };

    setNotesList((prev) => [newNote, ...prev]);
    setNoteTitle("");
    setNoteContent("");
    setNoteTags("");
    setIsAddNoteModalOpen(false);
  };

  return (
    <div className="w-full flex font-sans min-h-[640px] border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-black overflow-hidden shadow-xs">
      {/* =========================================================================
          LEFT SECONDARY PANEL: TOOLS DRAWER (EXACT MATCH TO SCREENSHOT)
          Header: TOOLS
          Items: Tasks (checkbox icon) | Notes (document icon)
          Bottom: < Hide tools
      ========================================================================= */}
      {isToolsDrawerOpen && (
        <div className="w-56 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 flex flex-col justify-between p-3.5 transition-all">
          <div className="space-y-4">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 px-2 block">
              TOOLS
            </span>

            <div className="space-y-1">
              {/* Item 1: Tasks */}
              <button
                onClick={() => setActiveTool("tasks")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTool === "tasks"
                    ? "bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a6] border border-[#6B1728]/25 shadow-2xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4" />
                  <span>Tasks</span>
                </div>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {openTasks.length}
                </span>
              </button>

              {/* Item 2: Notes */}
              <button
                onClick={() => setActiveTool("notes")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTool === "notes"
                    ? "bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a6] border border-[#6B1728]/25 shadow-2xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>Notes</span>
                </div>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {notesList.length}
                </span>
              </button>
            </div>
          </div>

          {/* Bottom: < Hide tools button */}
          <button
            onClick={() => setIsToolsDrawerOpen(false)}
            className="flex items-center gap-1.5 px-2 py-2 text-xs font-medium text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Hide tools</span>
          </button>
        </div>
      )}

      {/* When Tools Drawer is collapsed: small toggle bar */}
      {!isToolsDrawerOpen && (
        <div className="w-10 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center py-4 justify-between">
          <div className="space-y-4">
            <button
              onClick={() => setIsToolsDrawerOpen(true)}
              title="Expand Tools"
              className="p-2 rounded-xl text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setActiveTool("tasks");
                setIsToolsDrawerOpen(true);
              }}
              title="Tasks"
              className={`p-2 rounded-xl cursor-pointer ${
                activeTool === "tasks" ? "text-[#6B1728] dark:text-[#ff94a6]" : "text-zinc-500"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setActiveTool("notes");
                setIsToolsDrawerOpen(true);
              }}
              title="Notes"
              className={`p-2 rounded-xl cursor-pointer ${
                activeTool === "notes" ? "text-[#6B1728] dark:text-[#ff94a6]" : "text-zinc-500"
              }`}
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN WORKSPACE AREA
      ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-black">
        {/* =====================================================================
            TOP ACTION BAR: EXACT MATCH TO SCREENSHOT
            [+ Add new] [Table view | Kanban board] [Filter Icon]
        ===================================================================== */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-black">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* + Add new Button */}
            <button
              onClick={() => {
                if (activeTool === "tasks") {
                  setIsAddTaskModalOpen(true);
                } else {
                  setIsAddNoteModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-extrabold text-xs tracking-wide shadow-xs cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add new</span>
            </button>

            {/* View Switchers: Table view | Kanban board */}
            {activeTool === "tasks" && (
              <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setViewMode("table")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white text-black dark:bg-black dark:text-white border border-zinc-200 dark:border-zinc-800 shadow-2xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Table view</span>
                </button>
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "kanban"
                      ? "bg-white text-black dark:bg-black dark:text-white border border-zinc-200 dark:border-zinc-800 shadow-2xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Columns3 className="w-3.5 h-3.5" />
                  <span>Kanban board</span>
                </button>
              </div>
            )}

            {/* Filter Slider Icon Button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isFilterOpen
                  ? "bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a6] border-[#6B1728]/30"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-black dark:hover:text-white"
              }`}
              title="Toggle Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, dockets, assignees..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>
        </div>

        {/* Filter Popover Row if toggled */}
        {isFilterOpen && (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-2 text-xs animate-in fade-in duration-150">
            <span className="font-mono text-[10px] uppercase font-bold text-zinc-400 mr-1">
              FILTERS:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open Tasks</option>
              <option value="completed">Completed Tasks</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-medium"
            >
              <option value="all">All Types</option>
              <option value="Court Filing">Court Filing</option>
              <option value="Hearing Prep">Hearing Prep</option>
              <option value="Drafting">Drafting</option>
              <option value="Research">Research</option>
              <option value="Client Notice">Client Notice</option>
            </select>

            {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || typeFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setTypeFilter("all");
                }}
                className="text-[11px] text-[#6B1728] dark:text-[#ff94a6] hover:underline font-bold ml-auto cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* =====================================================================
            VIEW 1: TASKS (TABLE VIEW & KANBAN VIEW)
        ===================================================================== */}
        {activeTool === "tasks" && (
          <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
            {viewMode === "table" ? (
              <div className="space-y-4">
                {/* Accordion 1: Open tasks (X) */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xs">
                  {/* Accordion Header */}
                  <button
                    onClick={() => setIsOpenTasksExpanded(!isOpenTasksExpanded)}
                    className="w-full px-4 py-3 bg-zinc-50/60 dark:bg-zinc-900/60 flex items-center justify-between cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      {isOpenTasksExpanded ? (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                      )}
                      <span className="font-extrabold text-sm text-black dark:text-white">
                        Open tasks
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {openTasks.length}
                      </span>
                    </div>

                    <span className="text-[11px] text-zinc-400 font-mono">
                      {isOpenTasksExpanded ? "Click to collapse" : "Click to expand"}
                    </span>
                  </button>

                  {/* Table Contents when Expanded */}
                  {isOpenTasksExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 bg-zinc-50/30 dark:bg-zinc-900/30">
                            <th className="py-3 px-4 font-bold w-10"></th>
                            <th className="py-3 px-4 font-bold">Task Title</th>
                            <th className="py-3 px-4 font-bold">Status</th>
                            <th className="py-3 px-4 font-bold">Type</th>
                            <th className="py-3 px-4 font-bold">Due date</th>
                            <th className="py-3 px-4 font-bold">Priority</th>
                            <th className="py-3 px-4 font-bold">Assignee</th>
                            <th className="py-3 px-4 font-bold text-right w-12">
                              <Settings className="w-3.5 h-3.5 inline text-zinc-400" />
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                          {openTasks.length > 0 ? (
                            openTasks.map((t) => (
                              <tr
                                key={t.id}
                                onClick={() => setSelectedTask(t)}
                                className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                              >
                                {/* Checkbox */}
                                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={(e) => handleToggleTaskStatus(t.id, e)}
                                    className="w-4 h-4 rounded-md border border-zinc-300 dark:border-zinc-700 flex items-center justify-center hover:border-black dark:hover:border-white transition-colors cursor-pointer"
                                  >
                                    {t.status === "completed" && (
                                      <Check className="w-3 h-3 text-[#6B1728] dark:text-[#ff94a6]" />
                                    )}
                                  </button>
                                </td>

                                {/* Title + Matter Reference */}
                                <td className="py-3 px-4">
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-black dark:text-white group-hover:text-[#6B1728] dark:group-hover:text-[#ff94a6] transition-colors">
                                      {t.title}
                                    </span>
                                    {t.caseMatter && (
                                      <span className="text-[10px] font-mono text-zinc-400 block">
                                        Matter: {t.caseMatter}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Status */}
                                <td className="py-3 px-4">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      t.status === "in_progress"
                                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                        : t.status === "in_review"
                                        ? "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        t.status === "in_progress"
                                          ? "bg-blue-500 animate-pulse"
                                          : t.status === "in_review"
                                          ? "bg-purple-500"
                                          : "bg-zinc-400"
                                      }`}
                                    />
                                    {t.status === "in_progress"
                                      ? "In Progress"
                                      : t.status === "in_review"
                                      ? "In Review"
                                      : "Not Started"}
                                  </span>
                                </td>

                                {/* Type */}
                                <td className="py-3 px-4">
                                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                                    {t.type}
                                  </span>
                                </td>

                                {/* Due Date */}
                                <td className="py-3 px-4">
                                  <div
                                    className={`flex items-center gap-1.5 font-medium ${
                                      t.isDueUrgent
                                        ? "text-[#6B1728] dark:text-[#ff94a6] font-bold"
                                        : "text-zinc-600 dark:text-zinc-400"
                                    }`}
                                  >
                                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                                    <span>{t.dueDate}</span>
                                    {t.dueTime && (
                                      <span className="text-[10px] font-mono text-zinc-400">
                                        ({t.dueTime})
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Priority */}
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                                      t.priority === "urgent"
                                        ? "bg-[#6B1728]/15 text-[#6B1728] dark:text-[#ff94a6] border border-[#6B1728]/30"
                                        : t.priority === "high"
                                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                        : t.priority === "medium"
                                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300"
                                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                    }`}
                                  >
                                    {t.priority}
                                  </span>
                                </td>

                                {/* Assignee */}
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                      {t.assignee.avatarInitials}
                                    </div>
                                    <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[120px]">
                                      {t.assignee.name}
                                    </span>
                                  </div>
                                </td>

                                {/* Actions */}
                                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={(e) => handleDeleteTask(t.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 transition-opacity cursor-pointer"
                                    title="Delete task"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={8}
                                className="py-12 text-center text-xs text-zinc-400 dark:text-zinc-500 font-medium"
                              >
                                No open tasks match the current filter.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Closed tasks (X) */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setIsClosedTasksExpanded(!isClosedTasksExpanded)}
                    className="w-full px-4 py-3 bg-zinc-50/60 dark:bg-zinc-900/60 flex items-center justify-between cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isClosedTasksExpanded ? (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                      )}
                      <span className="font-extrabold text-sm text-zinc-600 dark:text-zinc-400">
                        Closed tasks
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {closedTasks.length}
                      </span>
                    </div>

                    <span className="text-[11px] text-zinc-400 font-mono">
                      {isClosedTasksExpanded ? "Click to collapse" : "Click to expand"}
                    </span>
                  </button>

                  {isClosedTasksExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                          {closedTasks.length > 0 ? (
                            closedTasks.map((t) => (
                              <tr
                                key={t.id}
                                className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/60 transition-colors opacity-70"
                              >
                                <td className="py-3 px-4 w-10">
                                  <button
                                    onClick={() => handleToggleTaskStatus(t.id)}
                                    className="w-4 h-4 rounded-md bg-black text-white dark:bg-white dark:text-black flex items-center justify-center cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="line-through text-zinc-400 font-medium">
                                    {t.title}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                    Done
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-zinc-400 text-[11px]">
                                  {t.type}
                                </td>
                                <td className="py-3 px-4 text-zinc-400 text-[11px]">
                                  {t.dueDate}
                                </td>
                                <td className="py-3 px-4 text-zinc-400 text-[10px] font-mono">
                                  {t.priority.toUpperCase()}
                                </td>
                                <td className="py-3 px-4 text-zinc-400 text-[11px]">
                                  {t.assignee.name}
                                </td>
                                <td className="py-3 px-4 text-right w-12">
                                  <button
                                    onClick={() => handleDeleteTask(t.id)}
                                    className="p-1 text-zinc-400 hover:text-red-500 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={8}
                                className="py-8 text-center text-xs text-zinc-400"
                              >
                                No closed tasks.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* KANBAN BOARD VIEW */
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                {[
                  { id: "not_started", title: "To Do", bg: "bg-zinc-400" },
                  { id: "in_progress", title: "In Progress", bg: "bg-blue-500" },
                  { id: "in_review", title: "In Review / Vetting", bg: "bg-purple-500" },
                  { id: "completed", title: "Completed / Filed", bg: "bg-emerald-500" },
                ].map((col) => {
                  const items = tasks.filter((t) => t.status === col.id);

                  return (
                    <div
                      key={col.id}
                      className="rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${col.bg}`} />
                          <h4 className="font-extrabold text-xs text-black dark:text-white uppercase tracking-wider">
                            {col.title}
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {items.length}
                        </span>
                      </div>

                      <div className="space-y-2.5 min-h-[140px]">
                        {items.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTask(t)}
                            className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-2 hover:border-black dark:hover:border-white transition-all cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={`text-xs font-bold leading-snug ${
                                  t.status === "completed"
                                    ? "line-through text-zinc-400"
                                    : "text-black dark:text-white"
                                }`}
                              >
                                {t.title}
                              </span>
                            </div>

                            {t.caseMatter && (
                              <span className="text-[10px] font-mono text-zinc-400 block">
                                {t.caseMatter}
                              </span>
                            )}

                            <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-900 text-[10px]">
                              <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                                {t.type}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-zinc-400">{t.dueDate}</span>
                                <div className="w-5 h-5 rounded-full bg-zinc-800 text-white font-bold text-[9px] flex items-center justify-center">
                                  {t.assignee.avatarInitials}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {items.length === 0 && (
                          <div className="py-8 text-center text-[11px] text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                            No tasks
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setIsAddTaskModalOpen(true);
                        }}
                        className="w-full py-1.5 text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white flex items-center justify-center gap-1 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            VIEW 2: NOTES (CHAMBER NOTES TOOL)
        ===================================================================== */}
        {activeTool === "notes" && (
          <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  Chamber Notes &amp; Legal Memos
                </h3>
                <p className="text-xs text-zinc-500">
                  Precedent bookmarks, case notes, hearing points, and client instructions.
                </p>
              </div>

              <button
                onClick={() => setIsAddNoteModalOpen(true)}
                className="px-4 py-2 rounded-full bg-[#6B1728] hover:bg-[#581220] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Note</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notesList.map((note) => (
                <div
                  key={note.id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs hover:border-black dark:hover:border-white transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a6] border border-[#6B1728]/25">
                        {note.categoryLabel}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {note.updatedAt}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-black dark:text-white leading-snug">
                      {note.title}
                    </h4>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                      {note.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-900 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {note.tags.map((tg, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono text-[10px]"
                        >
                          #{tg}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        setNotesList((prev) => prev.filter((n) => n.id !== note.id))
                      }
                      className="p-1 text-zinc-400 hover:text-red-500 cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL 1: ADD NEW TASK MODAL
      ========================================================================= */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <form
            onSubmit={handleCreateTask}
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  Add Chamber Task
                </h3>
                <p className="text-xs text-zinc-500">
                  Assign deadlines, pleadings, or research deliverables.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTaskModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. File Counter Affidavit before 04:00 PM"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                    Matter / Case No.
                  </label>
                  <input
                    type="text"
                    value={newCaseMatter}
                    onChange={(e) => setNewCaseMatter(e.target.value)}
                    placeholder="e.g. WP(C) 19482/2024"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                    Task Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as TaskType)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
                  >
                    <option value="Court Filing">Court Filing</option>
                    <option value="Hearing Prep">Hearing Prep</option>
                    <option value="Drafting">Drafting</option>
                    <option value="Research">Research</option>
                    <option value="Client Notice">Client Notice</option>
                    <option value="Evidence Collection">Evidence Collection</option>
                    <option value="Fee Recovery">Fee Recovery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                    Due Date / Time
                  </label>
                  <input
                    type="text"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    placeholder="Today, 04:00 PM"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                  Assignee
                </label>
                <input
                  type="text"
                  value={newAssigneeName}
                  onChange={(e) => setNewAssigneeName(e.target.value)}
                  placeholder="Adv. Rajiv Malhotra"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                  Instructions / Notes
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Ensure Annexure P-1 to P-8 are verified before registry closing"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAddTaskModalOpen(false)}
                className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#6B1728] text-white text-xs font-bold cursor-pointer hover:bg-[#581220] transition-colors"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD NEW NOTE MODAL
      ========================================================================= */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <form
            onSubmit={handleCreateNote}
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  Create Chamber Note
                </h3>
                <p className="text-xs text-zinc-500">
                  Save judicial precedents, hearing memos, or strategy notes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddNoteModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Division Bench Precedents on Section 16 Telegraph Act"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                    Category
                  </label>
                  <select
                    value={noteCategory}
                    onChange={(e) =>
                      setNoteCategory(
                        e.target.value as
                          | "hearing_memo"
                          | "precedent_notes"
                          | "client_instructions"
                          | "statute_draft"
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
                  >
                    <option value="hearing_memo">Hearing Memo</option>
                    <option value="precedent_notes">Precedent Research</option>
                    <option value="client_instructions">Client Instructions</option>
                    <option value="statute_draft">Statutory Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    placeholder="High Court, Telegraph, Stay"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-zinc-500 mb-1">
                  Note Content *
                </label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record judgment citations, ratio decidendi, and court bench observations..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAddNoteModalOpen(false)}
                className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#6B1728] text-white text-xs font-bold cursor-pointer hover:bg-[#581220] transition-colors"
              >
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: TASK DETAIL MODAL
      ========================================================================= */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#6B1728]/10 text-[#6B1728] dark:text-[#ff94a6]">
                  {selectedTask.type}
                </span>
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  {selectedTask.title}
                </h3>
                {selectedTask.caseMatter && (
                  <p className="text-xs text-zinc-500 font-mono">
                    Case Matter: {selectedTask.caseMatter}
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-mono text-zinc-400 block">DUE DATE</span>
                <span className="font-bold text-black dark:text-white">
                  {selectedTask.dueDate} {selectedTask.dueTime && `(${selectedTask.dueTime})`}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-mono text-zinc-400 block">PRIORITY</span>
                <span className="font-bold uppercase font-mono text-black dark:text-white">
                  {selectedTask.priority}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-mono text-zinc-400 block">ASSIGNEE</span>
                <span className="font-bold text-black dark:text-white truncate block">
                  {selectedTask.assignee.name}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-mono text-zinc-400 block">STATUS</span>
                <span className="font-bold capitalize text-black dark:text-white">
                  {selectedTask.status.replace("_", " ")}
                </span>
              </div>
            </div>

            {selectedTask.notes && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block">
                  Chamber Instructions
                </span>
                <p>{selectedTask.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => handleDeleteTask(selectedTask.id)}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleToggleTaskStatus(selectedTask.id);
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 rounded-full bg-[#6B1728] text-white text-xs font-bold cursor-pointer hover:bg-[#581220] transition-colors"
                >
                  {selectedTask.status === "completed" ? "Mark Incomplete" : "Mark Completed"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}