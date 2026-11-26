"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  PenTool,
  Highlighter,
  Eraser,
  Trash2,
  Download,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Layers,
} from "lucide-react";

export interface LessonPlanItem {
  id: string;
  title: string;
  unitNumber: string;
  estimatedHours: string;
  firstSession: string;
  objectives: string;
  classLabel: string;
  createdAt: string;
}

interface FacultySmartBoardProps {
  lessonPlans: LessonPlanItem[];
  onOpenLessonPlanner: () => void;
}

export function FacultySmartBoard({
  lessonPlans,
  onOpenLessonPlanner,
}: FacultySmartBoardProps) {
  const [boardMode, setBoardMode] = useState<"selector" | "standard" | "integrated">("selector");
  const [selectedPlanId, setSelectedPlanId] = useState<string>(lessonPlans[0]?.id || "");
  const [tool, setTool] = useState<"pen" | "highlighter" | "eraser">("pen");
  const [strokeColor, setStrokeColor] = useState<string>("#F59E0B");
  const [lineWidth, setLineWidth] = useState<number>(3);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  const activePlan = lessonPlans.find((p) => p.id === selectedPlanId) || lessonPlans[0] || null;

  useEffect(() => {
    if (boardMode === "selector") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [boardMode]);

  const getCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    isDrawingRef.current = true;
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (tool === "eraser") {
      ctx.strokeStyle = "#09090b";
      ctx.lineWidth = 22;
      ctx.globalAlpha = 1;
    } else if (tool === "highlighter") {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 16;
      ctx.globalAlpha = 0.35;
    } else {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = 1;
    }
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleDownloadBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `wakheel-smartboard-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (boardMode === "selector") {
    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold uppercase">
              Faculty Presentation Studio
            </span>
            <h2 className="text-2xl font-black text-black dark:text-white tracking-tight">
              Interactive Smart Board
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Choose between an independent legal diagramming canvas or a curriculum-synced lecture board.
            </p>
          </div>
          <button
            onClick={onOpenLessonPlanner}
            className="px-4 py-2 rounded-full bg-zinc-900 dark:bg-zinc-800 hover:bg-amber-500 hover:text-black text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Lesson Planner Dashboard</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option 1: Standard Smart Board */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 flex flex-col justify-between shadow-xs hover:border-amber-500/60 transition-all">
            <div className="space-y-3">
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-mono font-bold uppercase">
                Option 1 • Independent Canvas
              </span>
              <h3 className="text-lg font-black text-black dark:text-white">
                Standard Legal Smart Board
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Clean dark-canvas drawing deck for mapping constitutional hierarchies, statutory trees, and live courtroom arguments with PNG export.
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 pt-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Freehand Pen, Highlighter &amp; Eraser</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Wakheel Gold, White &amp; Emerald Inks</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Instant High-Res PNG Export for Scholars</li>
              </ul>
            </div>

            <button
              onClick={() => setBoardMode("standard")}
              className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-amber-500 hover:text-black text-white font-extrabold text-xs transition-all cursor-pointer"
            >
              Launch Standard Smart Board →
            </button>
          </div>

          {/* Option 2: Lesson Plan Integrated Smart Board */}
          <div className="p-6 rounded-3xl bg-zinc-950 text-white border border-amber-500/40 space-y-4 flex flex-col justify-between shadow-lg">
            <div className="space-y-3">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-extrabold uppercase">
                Option 2 • Recommended (Curriculum-Synced)
              </span>
              <h3 className="text-lg font-black text-white">
                Lesson Plan Integrated Smart Board
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Side-by-side lecture stage pairing your live drawing canvas with active chapter objectives, unit milestones, and session notes.
              </p>

              {lessonPlans.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-mono uppercase text-amber-400 block">
                    Select Active Lesson Plan
                  </label>
                  <select
                    value={selectedPlanId || lessonPlans[0]?.id}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {lessonPlans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.unitNumber}: {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
                  No lesson plans authored yet — board will open with a quick objectives sidebar.
                </div>
              )}
            </div>

            <button
              onClick={() => setBoardMode("integrated")}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-white text-black font-extrabold text-xs transition-all cursor-pointer"
            >
              Start Lesson in Smart Board →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Toolbar */}
      <div className="p-3 rounded-2xl bg-zinc-950 text-white border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setBoardMode("selector")}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer"
          >
            ← Modes
          </button>
          <div className="h-4 w-px bg-zinc-800" />
          <button
            onClick={() => setTool("pen")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              tool === "pen" ? "bg-amber-500 text-black" : "bg-zinc-900 text-zinc-300"
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Pen</span>
          </button>
          <button
            onClick={() => setTool("highlighter")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              tool === "highlighter" ? "bg-amber-500 text-black" : "bg-zinc-900 text-zinc-300"
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>Highlight</span>
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              tool === "eraser" ? "bg-amber-500 text-black" : "bg-zinc-900 text-zinc-300"
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser</span>
          </button>

          <div className="flex items-center gap-1.5 pl-2">
            {["#F59E0B", "#FFFFFF", "#10B981", "#F43F5E"].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setStrokeColor(c);
                  if (tool === "eraser") setTool("pen");
                }}
                style={{ backgroundColor: c }}
                className={`w-5 h-5 rounded-full border-2 cursor-pointer ${
                  strokeColor === c && tool !== "eraser" ? "border-amber-300 scale-110" : "border-zinc-700"
                }`}
                title="Ink Color"
              />
            ))}
          </div>

          <input
            type="range"
            min={1}
            max={10}
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-20 accent-amber-500 ml-2"
            title="Stroke Width"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearCanvas}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-rose-600 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
          <button
            onClick={handleDownloadBoard}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-white text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PNG</span>
          </button>
        </div>
      </div>

      {/* Canvas + Optional Lesson Plan Sidebar */}
      <div className={`grid gap-4 ${boardMode === "integrated" ? "grid-cols-1 lg:grid-cols-4" : "grid-cols-1"}`}>
        <div className={`${boardMode === "integrated" ? "lg:col-span-3" : ""} rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-xl`}>
          <canvas
            ref={canvasRef}
            width={1100}
            height={580}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full h-[520px] touch-none cursor-crosshair block"
          />
        </div>

        {boardMode === "integrated" && (
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-mono font-bold uppercase text-amber-500">Lesson Sync</span>
            </div>
            {activePlan ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">{activePlan.unitNumber}</span>
                  <h4 className="text-sm font-black text-black dark:text-white mt-0.5">{activePlan.title}</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{activePlan.classLabel} • {activePlan.estimatedHours}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Session Lead</span>
                  <p className="font-semibold text-black dark:text-white">{activePlan.firstSession || "Opening Lecture"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Objectives</span>
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {activePlan.objectives}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-zinc-500">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <p>No active lesson plan selected. Create a chapter plan in Lesson Planner to see objectives here.</p>
                <button
                  onClick={onOpenLessonPlanner}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs cursor-pointer"
                >
                  Create Lesson Plan
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
