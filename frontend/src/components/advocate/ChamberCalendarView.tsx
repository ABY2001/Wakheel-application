"use client";

import React, { useState, useMemo, useEffect } from "react";
import { advocateApi, citizenApi } from "@/lib/api";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  Clock,
  Inbox,
  Scale,
  Video,
  FileText,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  Trash2,
  ExternalLink,
  MapPin,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";

export type CalendarViewMode = "month" | "week" | "4day";

export interface CalendarEvent {
  id: string;
  title: string;
  category: "hearing" | "consultation" | "deadline" | "meeting" | "task";
  date: string; // "YYYY-MM-DD" e.g. "2026-10-30"
  time: string; // e.g. "10:30 AM"
  duration: string; // e.g. "45m" or "1h 30m"
  caseNumber?: string;
  forum?: string;
  clientName?: string;
  notes?: string;
  status: "confirmed" | "urgent" | "completed" | "tentative";
}

export interface BacklogTask {
  id: string;
  title: string;
  category: "drafting" | "evidence" | "client" | "research" | "filing";
  priority: "urgent" | "high" | "normal";
  estimatedTime?: string;
  caseRef?: string;
}

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: "evt-1",
    title: "WP(C) 19482/2024 — Hearing on Stay Extension",
    category: "hearing",
    date: "2026-10-30",
    time: "10:15 AM",
    duration: "45m",
    caseNumber: "WP(C) 19482/2024",
    forum: "High Court of Kerala • Court Hall 3A (Item #14)",
    clientName: "Gopakumar Nambiar",
    notes: "Division bench hearing on status quo regarding overhead line realignment.",
    status: "urgent",
  },
  {
    id: "evt-2",
    title: "Client Video Consultation: Land Dispute Injunction",
    category: "consultation",
    date: "2026-10-30",
    time: "02:30 PM",
    duration: "30m",
    caseNumber: "OP 412/2026",
    forum: "Virtual Consultation Room #4",
    clientName: "Devika Menon",
    notes: "Review title deed chain from Kanayannur SRO prior to civil suit filing.",
    status: "confirmed",
  },
  {
    id: "evt-3",
    title: "Registry Defect Scrutiny Cure Deadline",
    category: "deadline",
    date: "2026-10-29",
    time: "04:00 PM",
    duration: "1h",
    caseNumber: "Bail Appl. 4182/2026",
    forum: "Principal Registry • Filing Counter 2",
    clientName: "Arjun V. Nair",
    notes: "Re-present bail memo with certified FIR copy and medical certs.",
    status: "completed",
  },
  {
    id: "evt-4",
    title: "Section 138 NI Act Cross-Examination",
    category: "hearing",
    date: "2026-10-31",
    time: "11:00 AM",
    duration: "1h 15m",
    caseNumber: "CC 892/2025",
    forum: "JFCM-II, Ernakulam",
    clientName: "Highland Spices & Exports",
    notes: "Cross examination of CW1 on bank memo ledger entries.",
    status: "confirmed",
  },
  {
    id: "evt-5",
    title: "Corporate Arbitration Chamber Session",
    category: "meeting",
    date: "2026-10-27",
    time: "03:30 PM",
    duration: "2h",
    caseNumber: "ARB/2026/08",
    forum: "Chambers 412, Marine Drive",
    clientName: "Oceanic Cold Chain Logistics",
    notes: "Finalize statement of defense and counter-claim calculations.",
    status: "completed",
  },
];

const INITIAL_BACKLOG: BacklogTask[] = [
  {
    id: "bk-1",
    title: "Draft Rejoinder Affidavit in WP 19482/2024",
    category: "drafting",
    priority: "urgent",
    estimatedTime: "1h 30m",
    caseRef: "WP(C) 19482/2024",
  },
  {
    id: "bk-2",
    title: "Verify Welfare Stamps (₹25 + ₹2) on newly signed Vakalatnamas",
    category: "filing",
    priority: "high",
    estimatedTime: "20m",
    caseRef: "General Chamber",
  },
  {
    id: "bk-3",
    title: "Research Supreme Court precedent on S.482 BNSS retrospective scope",
    category: "research",
    priority: "normal",
    estimatedTime: "45m",
    caseRef: "Bail Appl. 4182/2026",
  },
  {
    id: "bk-4",
    title: "Telephone client Sri. Gopakumar regarding additional electricity bills",
    category: "client",
    priority: "high",
    estimatedTime: "15m",
    caseRef: "WP(C) 19482/2024",
  },
];

interface ChamberCalendarViewProps {
  advocateName?: string;
  isClientView?: boolean;
}

export default function ChamberCalendarView({
  advocateName = "Adv. Meera Krishnan",
  isClientView = false,
}: ChamberCalendarViewProps) {
  // Calendar View Settings
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [waitingListOpen, setWaitingListOpen] = useState<boolean>(true);

  // Events & Backlog State
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [backlog, setBacklog] = useState<BacklogTask[]>(INITIAL_BACKLOG);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Fetch initial data from backend with fallback to initial state
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        if (isClientView) {
          const [evRes, bkRes] = await Promise.allSettled([
            citizenApi.getCitizenCalendarEvents(),
            citizenApi.getCitizenCalendarBacklog(),
          ]);
          if (!isMounted) return;
          if (evRes.status === "fulfilled" && evRes.value?.success && Array.isArray(evRes.value.events) && evRes.value.events.length > 0) {
            setEvents(evRes.value.events);
          }
          if (bkRes.status === "fulfilled" && bkRes.value?.success && Array.isArray(bkRes.value.backlog) && bkRes.value.backlog.length > 0) {
            setBacklog(bkRes.value.backlog);
          }
        } else {
          const [evRes, bkRes] = await Promise.allSettled([
            advocateApi.getCalendarEvents(),
            advocateApi.getCalendarBacklog(),
          ]);
          if (!isMounted) return;
          if (evRes.status === "fulfilled" && evRes.value?.success && Array.isArray(evRes.value.events) && evRes.value.events.length > 0) {
            setEvents(evRes.value.events);
          }
          if (bkRes.status === "fulfilled" && bkRes.value?.success && Array.isArray(bkRes.value.backlog) && bkRes.value.backlog.length > 0) {
            setBacklog(bkRes.value.backlog);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch calendar data, retaining local state:", err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [isClientView]);

  // Modal / Add Form State
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [addBacklogModalOpen, setAddBacklogModalOpen] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventCategory, setNewEventCategory] = useState<CalendarEvent["category"]>("hearing");
  const [newEventDate, setNewEventDate] = useState("2026-10-30");
  const [newEventTime, setNewEventTime] = useState("10:00 AM");
  const [newEventForum, setNewEventForum] = useState("High Court of Kerala");
  const [newEventCase, setNewEventCase] = useState("");
  const [newBacklogTitle, setNewBacklogTitle] = useState("");
  const [newBacklogCategory, setNewBacklogCategory] = useState<BacklogTask["category"]>("drafting");

  // Reference Date: Fixed around 30 Oct 2026 (matching reference demo)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date(2026, 9, 26)); // Mon 26 Oct 2026

  // Generate Days for Current View
  const days = useMemo(() => {
    const list: { date: Date; dateStr: string; dayNum: number; dayName: string; isToday: boolean }[] = [];
    const count = viewMode === "4day" ? 4 : viewMode === "week" ? 7 : 7;
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < count; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      const isToday = d.getDate() === 30 && d.getMonth() === 9 && d.getFullYear() === 2026;

      list.push({
        date: d,
        dateStr,
        dayNum: d.getDate(),
        dayName: dayNames[d.getDay()],
        isToday,
      });
    }
    return list;
  }, [currentWeekStart, viewMode]);

  // Navigate Date
  const handleNavigate = (direction: "prev" | "next" | "today") => {
    if (direction === "today") {
      setCurrentWeekStart(new Date(2026, 9, 26));
      return;
    }
    const delta = viewMode === "4day" ? 4 : 7;
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + (direction === "next" ? delta : -delta));
    setCurrentWeekStart(newDate);
  };

  // Add Event Handler
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: newEventTitle.trim(),
      category: newEventCategory,
      date: newEventDate,
      time: newEventTime,
      duration: "45m",
      caseNumber: newEventCase.trim() || undefined,
      forum: newEventForum.trim() || undefined,
      status: "confirmed",
    };

    setEvents((prev) => [newEvt, ...prev]);
    setNewEventTitle("");
    setNewEventCase("");
    setAddModalOpen(false);

    try {
      if (isClientView) {
        await citizenApi.createCitizenCalendarEvent(newEvt);
      } else {
        await advocateApi.createCalendarEvent(newEvt);
      }
    } catch (err) {
      console.warn("Failed to persist calendar event:", err);
    }
  };

  // Add Backlog Item Handler
  const handleCreateBacklog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBacklogTitle.trim()) return;

    const newTask: BacklogTask = {
      id: `bk-${Date.now()}`,
      title: newBacklogTitle.trim(),
      category: newBacklogCategory,
      priority: "high",
      estimatedTime: "30m",
    };

    setBacklog((prev) => [newTask, ...prev]);
    setNewBacklogTitle("");
    setAddBacklogModalOpen(false);

    try {
      if (!isClientView) {
        await advocateApi.createCalendarBacklogItem(newTask);
      }
    } catch (err) {
      console.warn("Failed to persist backlog item:", err);
    }
  };

  // Schedule a task from backlog to a day
  const handleScheduleBacklogTask = async (task: BacklogTask, targetDateStr: string) => {
    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: task.title,
      category: "task",
      date: targetDateStr,
      time: "02:00 PM",
      duration: task.estimatedTime || "30m",
      caseNumber: task.caseRef,
      status: "confirmed",
    };

    setEvents((prev) => [...prev, newEvt]);
    setBacklog((prev) => prev.filter((t) => t.id !== task.id));

    try {
      if (isClientView) {
        await citizenApi.createCitizenCalendarEvent(newEvt);
      } else {
        await advocateApi.createCalendarEvent(newEvt);
        await advocateApi.deleteCalendarBacklogItem(task.id);
      }
    } catch (err) {
      console.warn("Failed to persist scheduled backlog task:", err);
    }
  };

  const getEventsForDate = (dateStr: string) => {
    return events.filter((e) => e.date === dateStr);
  };

  return (
    <div className="w-full flex flex-col h-full bg-white dark:bg-black overflow-hidden font-sans select-none">
      {/* =========================================================================
          TOP ACTION BAR (Matching LetGetIn Sub-header)
      ========================================================================= */}
      <div className="p-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          {/* "+ Add new" Pill Button (Styled with our signature Burgundy accent) */}
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="px-5 py-2 rounded-full bg-[#6B1728] hover:bg-[#541220] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add new</span>
          </button>

          {/* "Today v" Dropdown selector */}
          <button
            type="button"
            onClick={() => handleNavigate("today")}
            className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Today</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {!waitingListOpen && (
            <button
              type="button"
              onClick={() => setWaitingListOpen(true)}
              className="px-3.5 py-1.5 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <Inbox className="w-3.5 h-3.5 text-[#6B1728]" />
              <span>Show Backlog ({backlog.length})</span>
            </button>
          )}
        </div>

        {/* Advocate Practice Indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-500">
          <Scale className="w-3.5 h-3.5 text-[#6B1728]" />
          <span>{advocateName} • High Court Fixtures &amp; Deadlines</span>
        </div>
      </div>

      {/* =========================================================================
          MAIN CALENDAR BODY (Waiting List Drawer + Day Columns Grid)
      ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* =====================================================================
            LEFT PANEL: WAITING LIST / BACKLOG DRAWER
        ===================================================================== */}
        {waitingListOpen && (
          <aside className="w-72 sm:w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shrink-0 animate-in slide-in-from-left-3 duration-200">
            {/* Waiting List Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-[#6B1728]" />
                <span className="font-bold text-xs text-black dark:text-white">Waiting List</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {backlog.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setWaitingListOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                title="Hide Waiting List"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* "+ Add Task to Backlog" Pill Button */}
            <div className="p-3.5">
              <button
                type="button"
                onClick={() => setAddBacklogModalOpen(true)}
                className="w-full py-2.5 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#6B1728]" />
                <span>Add Task to Backlog</span>
              </button>
            </div>

            {/* Backlog Items List */}
            <div className="p-3 pt-0 overflow-y-auto flex-1 space-y-2.5">
              {backlog.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-black dark:text-white leading-snug">
                      {task.title}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        const taskId = task.id;
                        setBacklog((prev) => prev.filter((t) => t.id !== taskId));
                        try {
                          if (!isClientView) {
                            await advocateApi.deleteCalendarBacklogItem(taskId);
                          }
                        } catch (err) {
                          console.warn("Failed to delete backlog item:", err);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 transition cursor-pointer"
                      title="Remove from Backlog"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span className="uppercase px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                      {task.category}
                    </span>
                    {task.estimatedTime && <span>{task.estimatedTime}</span>}
                  </div>

                  {/* Quick Schedule Button */}
                  <div className="pt-1 flex items-center justify-between border-t border-zinc-200/60 dark:border-zinc-800/60 text-[10px]">
                    <span className="text-zinc-400 truncate max-w-[120px]">{task.caseRef || "Unlinked"}</span>
                    <button
                      type="button"
                      onClick={() => handleScheduleBacklogTask(task, "2026-10-30")}
                      className="text-[#6B1728] dark:text-[#f8b4c0] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Schedule 30th</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {backlog.length === 0 && (
                <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-2 text-zinc-400">
                  <Inbox className="w-6 h-6 mx-auto stroke-1" />
                  <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Backlog is empty
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Add unscheduled research, drafting or filing tasks here.
                  </p>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* =====================================================================
            RIGHT PANEL: MAIN CALENDAR SCHEDULE GRID
        ===================================================================== */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-black">
          {/* Calendar View Header: Month & Year + < > + Today + View Switcher */}
          <div className="p-4 px-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 shrink-0 bg-white dark:bg-zinc-950">
            {/* Left: Month Year & Chevrons */}
            <div className="flex items-center gap-3">
              <h2 className="text-base sm:text-lg font-bold text-black dark:text-white tracking-tight">
                October 2026
              </h2>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleNavigate("prev")}
                  className="p-1 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                  title="Previous Period"
                >
                  <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate("next")}
                  className="p-1 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                  title="Next Period"
                >
                  <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleNavigate("today")}
                className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
              >
                Today
              </button>
            </div>

            {/* Right: View Mode Switcher (Month | Week (7D) | 4-Day) */}
            <div className="inline-flex items-center p-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("month")}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === "month"
                    ? "bg-[#6B1728] text-white font-bold shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => setViewMode("week")}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === "week"
                    ? "bg-[#6B1728] text-white font-bold shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Week (7D)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("4day")}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === "4day"
                    ? "bg-[#6B1728] text-white font-bold shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                4-Day
              </button>
            </div>
          </div>

          {/* Day Columns Container */}
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <div className="grid grid-flow-col auto-cols-[minmax(210px,1fr)] min-w-full h-full divide-x divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-black">
              {days.map((day) => {
                const dayEvents = getEventsForDate(day.dateStr);

                return (
                  <div
                    key={day.dateStr}
                    className={`flex flex-col min-h-[550px] p-3 space-y-3 ${
                      day.isToday ? "bg-zinc-50/50 dark:bg-zinc-950/40" : ""
                    }`}
                  >
                    {/* Day Column Header: e.g. "30 Fri" */}
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`text-base font-black ${
                            day.isToday ? "text-[#6B1728] dark:text-[#f8b4c0]" : "text-black dark:text-white"
                          }`}
                        >
                          {day.dayNum}
                        </span>
                        <span className="text-xs font-semibold text-zinc-500">{day.dayName}</span>
                      </div>

                      {day.isToday && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6B1728] text-white">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Top Day Summary Card: "No tasks or events" (matching reference layout) */}
                    <div className="p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center text-center min-h-[78px] space-y-2">
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {dayEvents.length > 0
                          ? `${dayEvents.length} scheduled item${dayEvents.length > 1 ? "s" : ""}`
                          : "No tasks or events"}
                      </span>

                      {/* Quick Round Icon Buttons: (Check) and (Calendar) */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNewEventDate(day.dateStr);
                            setNewEventCategory("task");
                            setAddModalOpen(true);
                          }}
                          className="w-6 h-6 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                          title="Add task for this day"
                        >
                          <Check className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setNewEventDate(day.dateStr);
                            setNewEventCategory("hearing");
                            setAddModalOpen(true);
                          }}
                          className="w-6 h-6 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-500 hover:text-[#6B1728] dark:hover:text-[#f8b4c0] flex items-center justify-center transition cursor-pointer"
                          title="Add court hearing or event"
                        >
                          <CalendarIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Day Schedule Event Cards */}
                    <div className="flex-1 space-y-2 overflow-y-auto">
                      {dayEvents.map((evt) => {
                        const isHearing = evt.category === "hearing";
                        const isConsultation = evt.category === "consultation";
                        const isDeadline = evt.category === "deadline";

                        return (
                          <div
                            key={evt.id}
                            onClick={() => setSelectedEvent(evt)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 shadow-2xs ${
                              isHearing
                                ? "bg-white dark:bg-zinc-900 border-[#6B1728]/40 dark:border-[#6B1728]/60 hover:border-[#6B1728]"
                                : isConsultation
                                ? "bg-white dark:bg-zinc-900 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400"
                                : isDeadline
                                ? "bg-white dark:bg-zinc-900 border-amber-200 dark:border-amber-800 hover:border-amber-400"
                                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <span className="text-[11px] font-bold text-black dark:text-white leading-snug line-clamp-2">
                                {evt.title}
                              </span>
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 mt-1 ${
                                  evt.status === "urgent"
                                    ? "bg-red-500 animate-ping"
                                    : evt.status === "completed"
                                    ? "bg-emerald-500"
                                    : "bg-[#6B1728]"
                                }`}
                              />
                            </div>

                            {evt.forum && (
                              <p className="text-[10px] text-zinc-500 truncate flex items-center gap-1 font-mono">
                                <MapPin className="w-2.5 h-2.5 text-[#6B1728] shrink-0" />
                                <span>{evt.forum}</span>
                              </p>
                            )}

                            {/* Time & Duration Badge */}
                            <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px] font-mono text-zinc-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-zinc-400" />
                                <span>{evt.time}</span>
                              </div>
                              <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                {evt.duration}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL: ADD NEW COURT HEARING / CONSULTATION / TASK
      ========================================================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#6B1728]" />
                <h3 className="text-base font-bold text-black dark:text-white">
                  Add Calendar Item
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Item Title</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. WP(C) 19482/2024 Interim Motion / Client Conference"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-black dark:text-white block">Category</label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  >
                    <option value="hearing">Court Hearing</option>
                    <option value="consultation">Client Consultation</option>
                    <option value="deadline">Filing Deadline</option>
                    <option value="meeting">Chamber Meeting</option>
                    <option value="task">Chamber Task</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-black dark:text-white block">Date</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-black dark:text-white block">Time</label>
                  <input
                    type="text"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    placeholder="10:30 AM"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-black dark:text-white block">Case / Docket Ref</label>
                  <input
                    type="text"
                    value={newEventCase}
                    onChange={(e) => setNewEventCase(e.target.value)}
                    placeholder="e.g. WP(C) 19482/2024"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Court Forum / Location</label>
                <input
                  type="text"
                  value={newEventForum}
                  onChange={(e) => setNewEventForum(e.target.value)}
                  placeholder="e.g. High Court of Kerala, Court Hall 3A"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#6B1728] hover:bg-[#541220] text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD TASK TO BACKLOG
      ========================================================================= */}
      {addBacklogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-[#6B1728]" />
                <h3 className="text-base font-bold text-black dark:text-white">
                  Add Task to Waiting List
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddBacklogModalOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBacklog} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Task Description</label>
                <input
                  type="text"
                  required
                  value={newBacklogTitle}
                  onChange={(e) => setNewBacklogTitle(e.target.value)}
                  placeholder="e.g. Obtain 30-year non-encumbrance certificate"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black dark:text-white block">Category</label>
                <select
                  value={newBacklogCategory}
                  onChange={(e) => setNewBacklogCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                >
                  <option value="drafting">Drafting Pleading</option>
                  <option value="evidence">Evidence &amp; Records</option>
                  <option value="client">Client Communication</option>
                  <option value="research">Legal Precedent Research</option>
                  <option value="filing">Registry Filing</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAddBacklogModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#6B1728] hover:bg-[#541220] text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  Save to Backlog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EVENT DETAILS VIEWER & ACTION DRAWER
      ========================================================================= */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[#6B1728] dark:text-[#f8b4c0]">
                  {selectedEvent.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-black dark:text-white mt-1.5">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">Date &amp; Time</span>
                  <span className="font-bold text-black dark:text-white">
                    {selectedEvent.date} • {selectedEvent.time}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">Duration</span>
                  <span className="font-mono text-zinc-600 dark:text-zinc-300">
                    {selectedEvent.duration}
                  </span>
                </div>
              </div>

              {selectedEvent.forum && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">Court / Forum</span>
                  <p className="font-medium text-black dark:text-white">{selectedEvent.forum}</p>
                </div>
              )}

              {selectedEvent.clientName && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">Client Representation</span>
                  <p className="font-medium text-black dark:text-white">{selectedEvent.clientName}</p>
                </div>
              )}

              {selectedEvent.notes && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">Chamber Notes</span>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{selectedEvent.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={async () => {
                  const evId = selectedEvent.id;
                  setEvents((prev) => prev.filter((e) => e.id !== evId));
                  setSelectedEvent(null);
                  try {
                    if (!isClientView) {
                      await advocateApi.deleteCalendarEvent(evId);
                    }
                  } catch (err) {
                    console.warn("Failed to delete event:", err);
                  }
                }}
                className="text-xs text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const evId = selectedEvent.id;
                    setEvents((prev) =>
                      prev.map((e) => (e.id === evId ? { ...e, status: "completed" } : e))
                    );
                    setSelectedEvent(null);
                    try {
                      if (!isClientView) {
                        await advocateApi.updateCalendarEvent(evId, { status: "completed" });
                      }
                    } catch (err) {
                      console.warn("Failed to update event:", err);
                    }
                  }}
                  className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
