"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Sparkles,
  Download,
  Copy,
  Printer,
  Plus,
  Trash2,
  Edit3,
  ArrowUpDown,
  Search,
  Filter,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Info,
  Check,
  FileCheck,
  FilePlus,
  BookOpen,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { copilotApi } from "@/lib/api";

export interface ChronologyEvent {
  id: string;
  slNo: number;
  date: string;
  particulars: string;
  exhibit: string;
  documentTitle: string;
  pageRange: string;
  category: string;
  significance: string;
  status: "favourable" | "adverse" | "procedural" | "neutral";
}

export interface CaseMetadata {
  courtForum: string;
  caseNumber: string;
  causeTitle: string;
  matterType: string;
  benchType: string;
}

export interface CaseChronologyBuilderProps {
  advocateName?: string;
  barCouncilNumber?: string;
  currentMatterTitle?: string;
}

export const CaseChronologyBuilder: React.FC<CaseChronologyBuilderProps> = ({
  advocateName = "Adv. Meera Krishnan",
  barCouncilNumber = "K/1429/2016",
  currentMatterTitle = "WP(C) 19482/2024 — Gopakumar v. KSEB",
}) => {
  // Active Dossier Bundle
  const [selectedBundle, setSelectedBundle] = useState<"kerala_land_kseb" | "s138_ni_act" | "custom">("kerala_land_kseb");
  const [customDocuments, setCustomDocuments] = useState<Array<{ name: string; size: string; type: string }>>([
    { name: "Deed_1842_2018_SRO_Paravur.pdf", size: "3.4 MB", type: "Sale Deed" },
    { name: "Possession_Cert_Revenue_Receipt.pdf", size: "1.1 MB", type: "Land Revenue" },
    { name: "KSEB_Route_Notice_June2023.pdf", size: "840 KB", type: "Statutory Notice" },
    { name: "Section_16_Telegraph_Objection.pdf", size: "1.8 MB", type: "Objection Letter" },
    { name: "Joint_Police_Village_Mahazar_Jan2024.pdf", size: "2.6 MB", type: "Scene Mahazar" },
    { name: "Impugned_Rejection_Order_AEE.pdf", size: "620 KB", type: "Impugned Order" },
  ]);

  // View Mode: 'table' | 'timeline' | 'synopsis' | 'contradictions'
  const [activeView, setActiveView] = useState<"table" | "timeline" | "synopsis" | "contradictions">("table");

  // Chronology State
  const [caseMetadata, setCaseMetadata] = useState<CaseMetadata>({
    courtForum: "IN THE HIGH COURT OF KERALA AT ERNAKULAM",
    caseNumber: "W.P.(C) No. 19482 OF 2024",
    causeTitle: "Gopakumar Nambiar (Petitioner) vs. Kerala State Electricity Board & Others (Respondents)",
    matterType: "Writ Petition (Civil) under Article 226 of the Constitution of India",
    benchType: "Special Original Jurisdiction / Division Bench",
  });

  const [events, setEvents] = useState<ChronologyEvent[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStage, setExtractionStage] = useState(0);

  // Contradiction and Audit State
  const [auditData, setAuditData] = useState<{
    contradictions: any[];
    limitationAlerts: any[];
    proceduralDefects: any[];
    curativePleadingClause: string;
  }>({
    contradictions: [],
    limitationAlerts: [],
    proceduralDefects: [],
    curativePleadingClause: "",
  });

  // Table Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // In-Place Event Editing State
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ChronologyEvent>>({});

  // Add New Event Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEventData, setNewEventData] = useState<Partial<ChronologyEvent>>({
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
    particulars: "",
    exhibit: "Exhibit P-",
    documentTitle: "",
    pageRange: "",
    category: "Factual Milestone",
    status: "favourable",
  });

  // Synopsis Text State
  const [synopsisText, setSynopsisText] = useState("");
  const [isGeneratingSynopsis, setIsGeneratingSynopsis] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // File input ref for document upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initial Load: Extract chronology on mount or when bundle changes
  useEffect(() => {
    handleRunExtraction(selectedBundle);
  }, [selectedBundle]);

  const handleRunExtraction = async (bundle: "kerala_land_kseb" | "s138_ni_act" | "custom") => {
    setIsExtracting(true);
    setExtractionStage(1);

    const stepInterval = setInterval(() => {
      setExtractionStage((prev) => (prev < 4 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await copilotApi.extractChronology({
        bundleType: bundle,
        documents: customDocuments,
      });

      if (res && res.success) {
        setEvents(res.events || []);
        if (res.caseMetadata) {
          setCaseMetadata(res.caseMetadata);
        }

        // Run contradiction audit concurrently
        const auditRes = await copilotApi.auditChronologyConflicts({
          events: res.events || [],
          bundleType: bundle,
        });

        if (auditRes && auditRes.success) {
          setAuditData({
            contradictions: auditRes.contradictions || [],
            limitationAlerts: auditRes.limitationAlerts || [],
            proceduralDefects: auditRes.proceduralDefects || [],
            curativePleadingClause: auditRes.curativePleadingClause || "",
          });
        }
      }
    } catch (err) {
      console.error("Chronology extraction error:", err);
    } finally {
      clearInterval(stepInterval);
      setExtractionStage(4);
      setTimeout(() => {
        setIsExtracting(false);
      }, 300);
    }
  };

  // Generate High Court Pleading Synopsis
  const handleGenerateSynopsis = async () => {
    setIsGeneratingSynopsis(true);
    try {
      const res = await copilotApi.generateHighCourtSynopsis({
        caseMetadata,
        events,
        advocateName,
        barCouncilNumber,
      });
      if (res && res.success) {
        setSynopsisText(res.textSynopsis);
      }
    } catch (err) {
      console.error("Synopsis generation error:", err);
    } finally {
      setIsGeneratingSynopsis(false);
    }
  };

  // Add Custom Event
  const handleAddEvent = () => {
    if (!newEventData.particulars?.trim()) return;

    const newEvent: ChronologyEvent = {
      id: `ev-${Date.now()}`,
      slNo: events.length + 1,
      date: newEventData.date || "01.01.2024",
      particulars: newEventData.particulars.trim(),
      exhibit: newEventData.exhibit?.trim() || "—",
      documentTitle: newEventData.documentTitle?.trim() || "Document on Record",
      pageRange: newEventData.pageRange?.trim() || "—",
      category: newEventData.category || "Factual Event",
      significance: "User inserted procedural pleading fact.",
      status: (newEventData.status as any) || "favourable",
    };

    setEvents((prev) => [...prev, newEvent]);
    setIsAddModalOpen(false);
    setNewEventData({
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
      particulars: "",
      exhibit: "Exhibit P-",
      documentTitle: "",
      pageRange: "",
      category: "Factual Milestone",
      status: "favourable",
    });
  };

  // Save Inline Edit
  const handleSaveInlineEdit = (id: string) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, ...editFormData } : ev))
    );
    setEditingEventId(null);
    setEditFormData({});
  };

  // Delete Event
  const handleDeleteEvent = (id: string) => {
    const filtered = events.filter((ev) => ev.id !== id);
    const reindexed = filtered.map((ev, idx) => ({ ...ev, slNo: idx + 1 }));
    setEvents(reindexed);
  };

  // Move Event Up/Down
  const handleMoveEvent = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= events.length) return;

    const updated = [...events];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reindexed = updated.map((ev, idx) => ({ ...ev, slNo: idx + 1 }));
    setEvents(reindexed);
  };

  // Copy Synopsis to Clipboard
  const handleCopySynopsis = () => {
    const content = synopsisText || generateFallbackTextSynopsis();
    navigator.clipboard.writeText(content);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  // Download as Word Document (.doc format compatible with Word / LibreOffice)
  const handleDownloadWordDoc = () => {
    const textContent = synopsisText || generateFallbackTextSynopsis();
    const htmlWord = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Chronology of Events - ${caseMetadata.caseNumber}</title>
        <style>
          body { font-family: 'Bookman Old Style', 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 1in; }
          h2, h3 { text-align: center; text-transform: uppercase; font-weight: bold; margin: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 18pt; margin-bottom: 18pt; }
          th, td { border: 1pt solid black; padding: 6pt 8pt; vertical-align: top; font-size: 11pt; }
          th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>${caseMetadata.courtForum}</h2>
        <h3>(${caseMetadata.benchType})</h3>
        <p style="text-align: center; font-weight: bold; margin-top: 8pt;">${caseMetadata.caseNumber}</p>
        <p style="text-align: center; font-style: italic;">IN THE MATTER OF:<br/>${caseMetadata.causeTitle}</p>
        <hr/>
        <h3 style="margin-top: 14pt; margin-bottom: 14pt;">SYNOPSIS AND CHRONOLOGY OF EVENTS</h3>
        <p><strong>Brief Synopsis:</strong> This ${caseMetadata.matterType} is instituted by the Petitioner to safeguard statutory and fundamental rights under the Constitution of India and relevant Central statutes.</p>
        
        <table>
          <thead>
            <tr>
              <th style="width: 8%;">Sl. No.</th>
              <th style="width: 15%;">Date</th>
              <th style="width: 55%;">Particulars of Events / Facts</th>
              <th style="width: 12%;">Exhibit</th>
              <th style="width: 10%;">Page No.</th>
            </tr>
          </thead>
          <tbody>
            ${events
              .map(
                (ev) => `
              <tr>
                <td style="text-align: center;">${ev.slNo}</td>
                <td style="text-align: center; font-weight: bold;">${ev.date}</td>
                <td>${ev.particulars}</td>
                <td style="text-align: center;">${ev.exhibit || "—"}</td>
                <td style="text-align: center;">${ev.pageRange || "—"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <p>Dated this the ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })} at Ernakulam.</p>
        <br/><br/>
        <p style="text-align: right;">
          <strong>Counsel for the Petitioner</strong><br/>
          ${advocateName}<br/>
          Roll No.: ${barCouncilNumber}<br/>
          High Court Chamber Block, Ernakulam
        </p>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", htmlWord], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Chronology_Synopsis_${caseMetadata.caseNumber.replace(/[^a-zA-Z0-9]/g, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateFallbackTextSynopsis = () => {
    let out = `${caseMetadata.courtForum}\n(${caseMetadata.benchType})\n\n${caseMetadata.caseNumber}\n\n`;
    out += `IN THE MATTER OF:\n${caseMetadata.causeTitle}\n\n`;
    out += `----------------------------------------------------------------------------------------\n`;
    out += `                        SYNOPSIS AND CHRONOLOGY OF EVENTS\n`;
    out += `----------------------------------------------------------------------------------------\n\n`;
    out += `Sl. No. | Date       | Particulars of Events                              | Exhibit | Page\n`;
    out += `----------------------------------------------------------------------------------------\n`;
    events.forEach((ev) => {
      out += `${String(ev.slNo).padEnd(7)} | ${ev.date.padEnd(10)} | ${ev.particulars.slice(0, 48).padEnd(50)} | ${(ev.exhibit || "—").padEnd(7)} | ${ev.pageRange || "—"}\n`;
    });
    out += `----------------------------------------------------------------------------------------\n`;
    out += `\nDated this the ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })} at Ernakulam.\n\n`;
    out += `Counsel for the Petitioner:\n${advocateName} (Roll No. ${barCouncilNumber})\n`;
    return out;
  };

  // Filtered Events
  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.particulars.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.date.includes(searchQuery) ||
      ev.exhibit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.documentTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || ev.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP BANNER & METADATA BAR
      ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-black text-white dark:bg-white dark:text-black">
                <Clock className="w-3.5 h-3.5" />
                <span>Rule 32 High Court Paper-Book</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                Temporal Fact Ingestion &amp; Limitation Clock
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
              Case Chronology &amp; Fact Timeline Builder
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-3xl leading-relaxed">
              Ingests multi-document case bundles, normalizes dates across Malayalam revenue records, audits limitation
              windows, and generates certified High Court Paper-Book synopses.
            </p>
          </div>

          {/* Action: Run Extraction Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleRunExtraction(selectedBundle)}
              disabled={isExtracting}
              className="px-5 py-2.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 transition-all cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isExtracting ? "animate-spin" : ""}`} />
              <span>{isExtracting ? "Analyzing Dossier..." : "Re-Extract Chronology"}</span>
            </button>
          </div>
        </div>

        {/* Case Dossier Bundle Switcher */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-black dark:text-white flex items-center gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5" />
              Select Matter Dossier:
            </span>
            <div className="inline-flex rounded-xl border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-100 dark:bg-zinc-900 font-semibold">
              <button
                type="button"
                onClick={() => setSelectedBundle("kerala_land_kseb")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedBundle === "kerala_land_kseb"
                    ? "bg-white dark:bg-black text-black dark:text-white font-bold shadow-xs"
                    : "text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                WP(C) 19482/2024 (Land &amp; KSEB Line)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBundle("s138_ni_act")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedBundle === "s138_ni_act"
                    ? "bg-white dark:bg-black text-black dark:text-white font-bold shadow-xs"
                    : "text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                CC 412/2024 (S.138 Cheque Dishonour)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBundle("custom")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedBundle === "custom"
                    ? "bg-white dark:bg-black text-black dark:text-white font-bold shadow-xs"
                    : "text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                + Custom Case Bundle
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-zinc-500 font-mono text-[11px]">
            <span>{customDocuments.length} Documents Ingested</span>
            <span>•</span>
            <span>{events.length} Facts Mapped</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Rule 32 Compliant</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MULTI-STAGE EXTRACTION PIPELINE ANIMATION (When Running)
      ========================================================================= */}
      {isExtracting && (
        <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-black dark:text-white">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-black dark:text-white" />
              <span>AI Temporal Fact Extraction Pipeline Active</span>
            </span>
            <span className="font-mono text-zinc-400">Step {extractionStage} of 4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                extractionStage >= 1
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold"
                  : "bg-white dark:bg-black text-zinc-400 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">1. Ingest Optical Text</span>
            </div>
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                extractionStage >= 2
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold"
                  : "bg-white dark:bg-black text-zinc-400 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">2. Normalize Dates</span>
            </div>
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                extractionStage >= 3
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold"
                  : "bg-white dark:bg-black text-zinc-400 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">3. Audit Limitation</span>
            </div>
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                extractionStage >= 4
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold"
                  : "bg-white dark:bg-black text-zinc-400 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">4. Build Paper-Book</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          AUDIT & CONTRADICTION SUMMARY NOTICES
      ========================================================================= */}
      {auditData.contradictions.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                AI Temporal Audit: {auditData.contradictions.length} Potential Contradiction(s) Flagged
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
              Judicial Defect Prevention Alert
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {auditData.contradictions.map((c: any, cIdx: number) => (
              <div
                key={cIdx}
                className="p-3.5 rounded-2xl bg-white dark:bg-black border border-amber-500/20 space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black dark:text-white text-xs">{c.title}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                    {c.severity} severity
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{c.detail}</p>
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-[10px] text-zinc-700 dark:text-zinc-300 space-y-0.5">
                  <span className="font-bold block text-black dark:text-white uppercase tracking-wider text-[9px]">
                    Reconciliation Averment:
                  </span>
                  <p className="font-serif italic">"{c.reconciliation}"</p>
                </div>
              </div>
            ))}
          </div>

          {auditData.curativePleadingClause && (
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-amber-500/15">
              <span className="text-[11px] text-amber-900 dark:text-amber-300 font-medium">
                Tip: Insert curative paragraph into the Synopsis Grounds to prevent maintainability dismissal.
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(auditData.curativePleadingClause);
                  alert("Curative pleading clause copied to clipboard!");
                }}
                className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] cursor-pointer shrink-0"
              >
                Copy Curative Ground
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW MODE TOGGLES & ACTIONS BAR
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        {/* View Mode Pills */}
        <div className="inline-flex rounded-2xl border border-zinc-200 dark:border-zinc-800 p-1 bg-zinc-100 dark:bg-zinc-900 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => setActiveView("table")}
            className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeView === "table"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            Pleading Table ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView("timeline")}
            className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeView === "timeline"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            Visual Roadmap
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView("synopsis");
              if (!synopsisText) handleGenerateSynopsis();
            }}
            className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeView === "synopsis"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            High Court Synopsis
          </button>
        </div>

        {/* Action Controls: Add Event & Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadWordDoc}
            className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .DOC (Word)</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: HIGH COURT PLEADING TABLE (Tabular Paper-Book Format)
      ========================================================================= */}
      {activeView === "table" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          {/* Table Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-900 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dates, exhibits, facts, or survey numbers..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-hidden text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-500 font-mono text-[11px]">Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white cursor-pointer focus:outline-hidden"
              >
                <option value="all">All Events ({events.length})</option>
                <option value="favourable">Favourable</option>
                <option value="adverse">Adverse / Impugned</option>
                <option value="procedural">Procedural</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-12 text-center">Sl.</th>
                  <th className="py-2.5 px-3 w-28">Date</th>
                  <th className="py-2.5 px-3 min-w-[280px]">Particulars of Events &amp; Factual Record</th>
                  <th className="py-2.5 px-3 w-28 text-center">Exhibit</th>
                  <th className="py-2.5 px-3 w-24 text-center">Page No.</th>
                  <th className="py-2.5 px-3 w-24 text-center">Nature</th>
                  <th className="py-2.5 px-3 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {filteredEvents.map((ev, index) => {
                  const isEditing = editingEventId === ev.id;

                  return (
                    <tr
                      key={ev.id}
                      className="group hover:bg-zinc-50 dark:hover:bg-zinc-950/60 transition-colors"
                    >
                      {/* Sl. No. */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-zinc-400">
                        {ev.slNo}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 font-semibold text-black dark:text-white whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.date ?? ev.date}
                            onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                            className="w-24 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-mono font-bold"
                          />
                        ) : (
                          <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            {ev.date}
                          </span>
                        )}
                      </td>

                      {/* Particulars */}
                      <td className="py-3 px-3 leading-relaxed text-zinc-800 dark:text-zinc-200">
                        {isEditing ? (
                          <textarea
                            rows={3}
                            value={editFormData.particulars ?? ev.particulars}
                            onChange={(e) => setEditFormData({ ...editFormData, particulars: e.target.value })}
                            className="w-full px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs leading-relaxed"
                          />
                        ) : (
                          <div className="space-y-1">
                            <p className="text-xs">{ev.particulars}</p>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                              <span className="font-medium">{ev.documentTitle}</span>
                              <span>•</span>
                              <span className="italic">{ev.significance}</span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Exhibit */}
                      <td className="py-3 px-3 text-center">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.exhibit ?? ev.exhibit}
                            onChange={(e) => setEditFormData({ ...editFormData, exhibit: e.target.value })}
                            className="w-20 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs text-center font-bold"
                          />
                        ) : (
                          <span className="font-bold text-black dark:text-white font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            {ev.exhibit || "—"}
                          </span>
                        )}
                      </td>

                      {/* Page Range */}
                      <td className="py-3 px-3 text-center font-mono text-[11px] text-zinc-500">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.pageRange ?? ev.pageRange}
                            onChange={(e) => setEditFormData({ ...editFormData, pageRange: e.target.value })}
                            className="w-16 px-1.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs text-center"
                          />
                        ) : (
                          <span>{ev.pageRange || "—"}</span>
                        )}
                      </td>

                      {/* Nature / Status Badge */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                            ev.status === "favourable"
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                              : ev.status === "adverse"
                              ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          {ev.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleSaveInlineEdit(ev.id)}
                              className="p-1 rounded bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold cursor-pointer"
                              title="Save"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingEventId(null)}
                              className="p-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] cursor-pointer"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleMoveEvent(index, "up")}
                              disabled={index === 0}
                              className="p-1 rounded text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveEvent(index, "down")}
                              disabled={index === events.length - 1}
                              className="p-1 rounded text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEventId(ev.id);
                                setEditFormData(ev);
                              }}
                              className="p-1 rounded text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                              title="Edit Row"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="p-1 rounded text-zinc-400 hover:text-rose-600 cursor-pointer"
                              title="Delete Row"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-zinc-400">
            <span>
              Showing {filteredEvents.length} of {events.length} chronological facts formatted for High Court Registry.
            </span>
            <span className="font-mono">
              Certified by: {advocateName} ({barCouncilNumber})
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: VISUAL CHRONOLOGY ROADMAP (Milestone Swimlane)
      ========================================================================= */}
      {activeView === "timeline" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
            <div>
              <h3 className="font-bold text-black dark:text-white text-base">Visual Case Chronology &amp; Limitation Clock</h3>
              <p className="text-xs text-zinc-500">Interactive chronological progression mapping key legal causes of action and notices.</p>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">
              {events.length} Milestones Plotted
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
            {events.map((ev, idx) => (
              <div key={ev.id} className="relative group">
                {/* Node Marker */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 bg-white dark:bg-black flex items-center justify-center font-bold text-[10px] transition-transform group-hover:scale-110 ${
                    ev.status === "favourable"
                      ? "border-emerald-500 text-emerald-600"
                      : ev.status === "adverse"
                      ? "border-rose-500 text-rose-600"
                      : "border-zinc-400 text-zinc-500"
                  }`}
                >
                  {ev.slNo}
                </div>

                {/* Milestone Content Card */}
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs shadow-2xs">
                        {ev.date}
                      </span>
                      <span className="font-bold text-black dark:text-white text-xs">{ev.category}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {ev.exhibit && ev.exhibit !== "—" && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-[11px] font-mono font-bold text-black dark:text-white">
                          {ev.exhibit} ({ev.pageRange || "Pleading"})
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          ev.status === "favourable"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                            : ev.status === "adverse"
                            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {ev.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-serif">
                    {ev.particulars}
                  </p>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-medium text-[11px] text-zinc-600 dark:text-zinc-400">
                      Doc: {ev.documentTitle}
                    </span>
                    <span className="text-[10px] font-mono italic">{ev.significance}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: HIGH COURT PAPER-BOOK SYNOPSIS PREVIEW & EXPORT
      ========================================================================= */}
      {activeView === "synopsis" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-900">
            <div>
              <h3 className="font-bold text-black dark:text-white text-base">Kerala High Court Paper-Book Synopsis</h3>
              <p className="text-xs text-zinc-500">
                Official filing front-matter conforming to High Court of Kerala Rules, 1971.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySynopsis}
                className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-black dark:text-white flex items-center gap-1.5 cursor-pointer"
              >
                {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNotice ? "Copied!" : "Copy Text"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadWordDoc}
                className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .DOC</span>
              </button>
            </div>
          </div>

          {/* Formatted Pleading Paper-Book Display */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 font-serif text-xs sm:text-sm text-black dark:text-white leading-relaxed space-y-6 shadow-inner">
            <div className="text-center space-y-1 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <h4 className="font-bold uppercase tracking-wider text-sm sm:text-base">
                {caseMetadata.courtForum}
              </h4>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">({caseMetadata.benchType})</p>
              <p className="font-bold text-xs pt-1">{caseMetadata.caseNumber}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">In the Matter of:</span>
              <p className="font-bold text-xs sm:text-sm leading-relaxed">{caseMetadata.causeTitle}</p>
            </div>

            <div className="text-center py-2">
              <span className="font-bold text-xs sm:text-sm uppercase tracking-widest border-b-2 border-black dark:border-white pb-0.5">
                SYNOPSIS AND CHRONOLOGY OF EVENTS
              </span>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-xs uppercase tracking-wide">Brief Synopsis:</p>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                This {caseMetadata.matterType} is preferred by the Petitioner assailing the arbitrary actions of the
                Respondents in attempting to forcibly enter and erect high-tension line infrastructure across the
                Petitioner's homestead without statutory sanction. The Respondents have acted ultra vires Section 16(1)
                of the Indian Telegraph Act, 1885 and contrary to binding principles enunciated by this Hon'ble Court.
              </p>
            </div>

            {/* Synopsis Table */}
            <div className="space-y-2">
              <p className="font-bold text-xs uppercase tracking-wide">Chronology of Events:</p>
              <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <table className="w-full text-left text-xs font-serif">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 font-bold">
                      <th className="py-2 px-3 w-12 text-center">Sl.</th>
                      <th className="py-2 px-3 w-28 text-center">Date</th>
                      <th className="py-2 px-3">Particulars of Events</th>
                      <th className="py-2 px-3 w-24 text-center">Exhibit</th>
                      <th className="py-2 px-3 w-20 text-center">Page No.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {events.map((ev) => (
                      <tr key={ev.id}>
                        <td className="py-2 px-3 text-center font-mono">{ev.slNo}</td>
                        <td className="py-2 px-3 text-center font-bold font-mono">{ev.date}</td>
                        <td className="py-2 px-3 leading-relaxed">{ev.particulars}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold">{ev.exhibit || "—"}</td>
                        <td className="py-2 px-3 text-center font-mono">{ev.pageRange || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-xs">
              <div>
                <p>Dated this the {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })} at Ernakulam.</p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="font-bold text-black dark:text-white uppercase tracking-wider text-[11px]">
                  Counsel for the Petitioner
                </p>
                <p className="font-bold">{advocateName}</p>
                <p className="text-zinc-500 font-mono text-[10px]">Roll No.: {barCouncilNumber}</p>
                <p className="text-zinc-500 text-[10px]">High Court Chamber Block, Ernakulam</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD MANUAL EVENT
      ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
              <h3 className="font-bold text-black dark:text-white text-base">Add Chronological Event</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500 uppercase text-[10px]">Date (DD.MM.YYYY)</label>
                  <input
                    type="text"
                    value={newEventData.date}
                    onChange={(e) => setNewEventData({ ...newEventData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500 uppercase text-[10px]">Exhibit No.</label>
                  <input
                    type="text"
                    value={newEventData.exhibit}
                    onChange={(e) => setNewEventData({ ...newEventData, exhibit: e.target.value })}
                    placeholder="Exhibit P-7"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-500 uppercase text-[10px]">
                  Particulars of Event (Pleading Style)
                </label>
                <textarea
                  rows={3}
                  value={newEventData.particulars}
                  onChange={(e) => setNewEventData({ ...newEventData, particulars: e.target.value })}
                  placeholder="Petitioner submitted written rejoinder before Assistant Executive Engineer pointing out..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white leading-relaxed resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500 uppercase text-[10px]">Document Title</label>
                  <input
                    type="text"
                    value={newEventData.documentTitle}
                    onChange={(e) => setNewEventData({ ...newEventData, documentTitle: e.target.value })}
                    placeholder="e.g. Registered Acknowledgment Due Card"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500 uppercase text-[10px]">Paper-Book Page Range</label>
                  <input
                    type="text"
                    value={newEventData.pageRange}
                    onChange={(e) => setNewEventData({ ...newEventData, pageRange: e.target.value })}
                    placeholder="e.g. 38 - 41"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500 uppercase text-[10px]">Category</label>
                  <input
                    type="text"
                    value={newEventData.category}
                    onChange={(e) => setNewEventData({ ...newEventData, category: e.target.value })}
                    placeholder="e.g. Statutory Objection"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500 uppercase text-[10px]">Impact Nature</label>
                  <select
                    value={newEventData.status}
                    onChange={(e) => setNewEventData({ ...newEventData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white cursor-pointer"
                  >
                    <option value="favourable">Favourable</option>
                    <option value="adverse">Adverse / Impugned</option>
                    <option value="procedural">Procedural</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddEvent}
                disabled={!newEventData.particulars?.trim()}
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold disabled:opacity-50 cursor-pointer shadow-xs"
              >
                Add to Chronology
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
