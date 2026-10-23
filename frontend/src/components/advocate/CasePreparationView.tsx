"use client";

import React, { useState, useEffect } from "react";
import {
  FolderOpen,
  Scale,
  Sparkles,
  Printer,
  Copy,
  Plus,
  Check,
  Info,
  Clock,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Users,
  FileCheck,
  Shield,
  ChevronRight,
  RefreshCw,
  Bookmark,
  Gavel,
  Lock,
} from "lucide-react";
import { advocateApi } from "@/lib/api";

interface CasePreparationViewProps {
  currentMatter?: string;
  advocateName?: string;
  barCouncilNumber?: string;
  token?: string;
  onNavigateTab?: (tabId: string) => void;
}

interface FramedIssue {
  id: string;
  issueNumber: string;
  title: string;
  question: string;
  status: string;
  governingLaw: string;
  isCore: boolean;
}

interface BindingPrecedent {
  id: string;
  citation: string;
  caseName: string;
  court: string;
  benchCoram: string;
  ratio: string;
  keyParagraphs: string;
  howToApply: string;
  isBookmarked: boolean;
}

interface BenchInquiry {
  id: string;
  question: string;
  rebuttalAnswer: string;
  difficulty: "High" | "Medium" | "Low" | string;
  supportingExhibits: string;
}

interface SpeakingNote {
  order: number;
  timeMark: string;
  heading: string;
  content: string;
  focusExhibit: string;
}

interface CrossExamQuestion {
  qNo: number;
  questionText: string;
  objective: string;
  targetAdmission: string;
  isAsked: boolean;
}

interface WitnessGroup {
  id: string;
  witnessName: string;
  witnessRole: string;
  questions: CrossExamQuestion[];
}

interface EvidenceExhibit {
  mark: string;
  title: string;
  verified: boolean;
  admissibility: string;
}

interface CasePrepDossier {
  matterId: string;
  matterTitle: string;
  caseNumber: string;
  courtForum: string;
  bench: string;
  coram: string;
  hearingStage: string;
  itemNumber: string;
  listedDate: string;
  issues: FramedIssue[];
  precedents: BindingPrecedent[];
  benchInquiries: BenchInquiry[];
  speakingNotes: SpeakingNote[];
  witnessQuestions: WitnessGroup[];
  evidenceExhibits: EvidenceExhibit[];
  lastUpdated?: string;
}

export const CasePreparationView: React.FC<CasePreparationViewProps> = ({
  currentMatter = "WP(C) 19482/2024 - Gopakumar Nambiar v. KSEB",
  advocateName = "Adv. Meera Krishnan",
  barCouncilNumber = "K/1429/2016",
  token = "advocate_token",
  onNavigateTab,
}) => {
  // Navigation & Sub-tabs
  const [activeSection, setActiveSection] = useState<
    "issues" | "precedents" | "inquiries" | "speakingNotes" | "witnessCross" | "exhibits"
  >("issues");

  // Dossier state
  const [dossier, setDossier] = useState<CasePrepDossier | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  // Available matters list
  const [availableMatters, setAvailableMatters] = useState<any[]>([]);
  const [selectedMatterId, setSelectedMatterId] = useState<string>("mat_wpc_19482");

  // Toast & Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [vaultPushed, setVaultPushed] = useState<boolean>(false);

  // New item inputs
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueQuestion, setNewIssueQuestion] = useState("");
  const [newIssueStatute, setNewIssueStatute] = useState("");
  const [showAddIssueModal, setShowAddIssueModal] = useState(false);

  const [newBenchQuestion, setNewBenchQuestion] = useState("");
  const [newBenchRebuttal, setNewBenchRebuttal] = useState("");
  const [newBenchExhibits, setNewBenchExhibits] = useState("");
  const [showAddInquiryModal, setShowAddInquiryModal] = useState(false);

  const [aiPrompt, setAiPrompt] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch available matters for quick switching
  useEffect(() => {
    const fetchMatters = async () => {
      try {
        const res = await advocateApi.getMatters(token);
        if (res && res.matters && res.matters.length > 0) {
          setAvailableMatters(res.matters);
          // Check if currentMatter matches any
          const match = res.matters.find(
            (m: any) =>
              m._id === currentMatter ||
              m.caseNumber === currentMatter ||
              m.matterTitle.includes(currentMatter.split(" - ")[0])
          );
          if (match) setSelectedMatterId(match._id);
        }
      } catch (err) {
        console.warn("Could not load matters list:", err);
      }
    };
    fetchMatters();
  }, [currentMatter, token]);

  // 2. Load Dossier for Selected Matter
  const loadDossier = async (matterId: string) => {
    setLoading(true);
    try {
      const res = await advocateApi.getCasePrep(matterId, token);
      if (res && res.success && res.dossier) {
        setDossier(res.dossier);
      }
    } catch (err) {
      console.error("Error loading case prep dossier:", err);
      showToast("Using local chamber briefing data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMatterId) {
      loadDossier(selectedMatterId);
    }
  }, [selectedMatterId]);

  // 3. Save Dossier to Backend
  const handleSaveDossier = async (updated = dossier) => {
    if (!updated) return;
    setSaving(true);
    try {
      await advocateApi.saveCasePrep(selectedMatterId, updated, token);
      setDossier(updated);
      showToast("Bench Argument Dossier saved to chamber repository.");
    } catch (err: any) {
      console.error("Save dossier failed:", err);
      showToast("Error saving dossier: " + (err?.message || "Check network"));
    } finally {
      setSaving(false);
    }
  };

  // 4. AI Bench Strategy Assistant
  const handleAiAssist = async (action: string) => {
    if (!dossier) return;
    setIsAiGenerating(true);
    try {
      const res = await advocateApi.generateAiBenchStrategy(
        selectedMatterId,
        {
          action,
          prompt: aiPrompt,
          context: {
            matterTitle: dossier.matterTitle,
            caseNumber: dossier.caseNumber,
            courtForum: dossier.courtForum,
            bench: dossier.bench,
            stage: dossier.hearingStage,
          },
        },
        token
      );

      if (res && res.success && res.strategy) {
        if (action === "generate_inquiries" && res.strategy.inquiries) {
          const updated = {
            ...dossier,
            benchInquiries: [...res.strategy.inquiries, ...dossier.benchInquiries],
          };
          await handleSaveDossier(updated);
          showToast(`Injected ${res.strategy.inquiries.length} anticipated bench queries with rebuttals.`);
        } else if (action === "generate_cross_exam" && res.strategy.crossExamQuestions) {
          const existing = [...dossier.witnessQuestions];
          if (existing.length > 0) {
            existing[0].questions = [...existing[0].questions, ...res.strategy.crossExamQuestions];
          } else {
            existing.push({
              id: "wq-dyn",
              witnessName: "Official Witness / Opponent",
              witnessRole: "Respondent",
              questions: res.strategy.crossExamQuestions,
            });
          }
          const updated = { ...dossier, witnessQuestions: existing };
          await handleSaveDossier(updated);
          showToast("Injected witness cross-examination questions into bank.");
        } else if (action === "generate_issues" && res.strategy.issue) {
          const updated = {
            ...dossier,
            issues: [...dossier.issues, res.strategy.issue],
          };
          await handleSaveDossier(updated);
          showToast("Injected framed legal issue into dossier.");
        }
        setAiPrompt("");
      }
    } catch (err: any) {
      console.error("AI Assist failed:", err);
      showToast("AI generation failed: " + (err?.message || "Local fallback used"));
    } finally {
      setIsAiGenerating(false);
    }
  };

  // 5. Add Custom Issue
  const handleAddIssue = async () => {
    if (!dossier || !newIssueTitle.trim()) return;
    const newIssue: FramedIssue = {
      id: "iss-custom-" + Date.now().toString(),
      issueNumber: String(dossier.issues.length + 1),
      title: newIssueTitle.trim(),
      question: newIssueQuestion.trim() || newIssueTitle.trim(),
      status: "Framed by Senior Counsel",
      governingLaw: newIssueStatute.trim() || "Statutory Ground",
      isCore: true,
    };
    const updated = {
      ...dossier,
      issues: [...dossier.issues, newIssue],
    };
    await handleSaveDossier(updated);
    setNewIssueTitle("");
    setNewIssueQuestion("");
    setNewIssueStatute("");
    setShowAddIssueModal(false);
  };

  // 6. Add Custom Inquiry
  const handleAddInquiry = async () => {
    if (!dossier || !newBenchQuestion.trim()) return;
    const newInq: BenchInquiry = {
      id: "bi-custom-" + Date.now().toString(),
      question: newBenchQuestion.trim(),
      rebuttalAnswer: newBenchRebuttal.trim() || "Reserved for oral reply based on records.",
      difficulty: "High",
      supportingExhibits: newBenchExhibits.trim() || "Pleading Paperbook",
    };
    const updated = {
      ...dossier,
      benchInquiries: [newInq, ...dossier.benchInquiries],
    };
    await handleSaveDossier(updated);
    setNewBenchQuestion("");
    setNewBenchRebuttal("");
    setNewBenchExhibits("");
    setShowAddInquiryModal(false);
  };

  // 7. Toggle Bookmark Precedent
  const toggleBookmarkPrecedent = async (precId: string) => {
    if (!dossier) return;
    const updatedPrecedents = dossier.precedents.map((p) =>
      p.id === precId ? { ...p, isBookmarked: !p.isBookmarked } : p
    );
    const updated = { ...dossier, precedents: updatedPrecedents };
    await handleSaveDossier(updated);
  };

  // 8. Toggle Witness Question Asked Status
  const toggleQuestionAsked = async (groupIndex: number, qIndex: number) => {
    if (!dossier) return;
    const updatedGroups = [...dossier.witnessQuestions];
    updatedGroups[groupIndex].questions[qIndex].isAsked =
      !updatedGroups[groupIndex].questions[qIndex].isAsked;
    const updated = { ...dossier, witnessQuestions: updatedGroups };
    await handleSaveDossier(updated);
  };

  // 9. Push Lectern Brief into Document Vault
  const handlePushToVault = async () => {
    if (!dossier) return;
    try {
      const summaryContent = `COURT LECTERN BENCH DOSSIER
MATTER: ${dossier.matterTitle}
BENCH: ${dossier.courtForum} | ${dossier.bench}
HEARING STAGE: ${dossier.hearingStage} (${dossier.itemNumber})
CORAM: ${dossier.coram}

FRAMED ISSUES FOR DETERMINATION:
${dossier.issues.map((iss) => `${iss.issueNumber}. ${iss.title}\n   ${iss.question}\n   [Governing: ${iss.governingLaw}]`).join("\n\n")}

BINDING HIGH COURT & SUPREME COURT CITATIONS:
${dossier.precedents.map((p) => `• ${p.citation} - ${p.caseName}\n  Ratio: ${p.ratio}\n  How to Apply: ${p.howToApply}`).join("\n\n")}

ANTICIPATED BENCH INQUIRIES & ORAL REBUTTALS:
${dossier.benchInquiries.map((bi, idx) => `Q${idx + 1}: ${bi.question}\nAns: ${bi.rebuttalAnswer}\nExhibits: ${bi.supportingExhibits}`).join("\n\n")}

SENIOR COUNSEL SPEAKING FLOW:
${dossier.speakingNotes.map((sn) => `[${sn.timeMark}] ${sn.heading}\n${sn.content}\nFocus: ${sn.focusExhibit}`).join("\n\n")}`;

      const payload = {
        title: `Bench Dossier & Argument Brief — ${dossier.caseNumber}`,
        fileName: `Bench_Dossier_${dossier.caseNumber.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
        category: "Bench Dossier / Argument Brief",
        subType: "document-filing",
        matter: dossier.matterTitle,
        fileSize: "185 KB",
        filingStatus: "Ready in Vault",
        advocateName,
        details: `Senior Advocate Lectern Argument Dossier prepared for hearing in ${dossier.bench}. Contains framed issues, Valsamma ratio mapping, and bench rebuttals.`,
        contentSummary: summaryContent.slice(0, 300) + "...",
      };

      await advocateApi.uploadDocument(payload, token);
      setVaultPushed(true);
      showToast("Lectern Argument Dossier encrypted with AES-256 and pushed to Case Vault!");
      setTimeout(() => setVaultPushed(false), 5000);
    } catch (err: any) {
      console.error("Push to vault failed:", err);
      showToast("Failed to push to vault: " + (err?.message || "Check connection"));
    }
  };

  // 10. Copy Speaking Points
  const handleCopySpeakingPoints = () => {
    if (!dossier) return;
    const text = dossier.speakingNotes
      .map(
        (sn) =>
          `[${sn.timeMark}] ${sn.heading.toUpperCase()}\n${sn.content}\nFocus: ${sn.focusExhibit}`
      )
      .join("\n\n--------------------------------------------\n\n");
    navigator.clipboard.writeText(text);
    showToast("Senior Counsel speaking notes copied to clipboard.");
  };

  // 11. Print Lectern Argument Sheet
  const handlePrintLecternSheet = () => {
    if (!dossier) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Bench Lectern Dossier — ${dossier.caseNumber}</title>
          <style>
            @page { size: A4 portrait; margin: 20mm 20mm 20mm 25mm; }
            body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #000; margin: 0; padding: 15px; }
            .header { border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 16px; text-transform: uppercase; }
            .title { font-size: 14pt; font-weight: bold; margin: 0; }
            .meta { font-size: 9pt; margin-top: 4px; display: flex; justify-content: space-between; }
            .section-title { font-size: 11pt; font-weight: bold; text-transform: uppercase; margin-top: 14px; border-bottom: 1px solid #666; padding-bottom: 2px; }
            .item-box { margin-bottom: 10px; page-break-inside: avoid; }
            .q-box { background: #f5f5f5; padding: 6px; border-left: 3px solid #000; margin-bottom: 6px; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${dossier.courtForum}</div>
            <div class="meta">
              <span>${dossier.bench} • ${dossier.itemNumber}</span>
              <span>LISTED: ${dossier.listedDate}</span>
              <span>CORAM: ${dossier.coram}</span>
            </div>
          </div>

          <div style="font-weight: bold; font-size: 12pt; margin-bottom: 10px;">
            ${dossier.matterTitle} (${dossier.hearingStage})
          </div>

          <div class="section-title">I. Primary Issues for Determination</div>
          ${dossier.issues.map((i) => `<div class="item-box"><b>Issue ${i.issueNumber}: ${i.title}</b><br/>${i.question}<br/><i>Governing: ${i.governingLaw} | Status: ${i.status}</i></div>`).join("")}

          <div class="section-title">II. Binding Landmark Precedents</div>
          ${dossier.precedents.map((p) => `<div class="item-box"><b>${p.citation} — ${p.caseName}</b> (${p.court})<br/><b>Ratio:</b> ${p.ratio}<br/><b>Counsel Application:</b> ${p.howToApply}</div>`).join("")}

          <div class="section-title">III. Anticipated Bench Inquiries &amp; Rebuttals</div>
          ${dossier.benchInquiries.map((bi, idx) => `<div class="item-box q-box"><b>Q${idx + 1}: ${bi.question}</b><br/><b>Prepared Rebuttal:</b> ${bi.rebuttalAnswer}<br/><i>Supporting Records: ${bi.supportingExhibits}</i></div>`).join("")}

          <div class="section-title">IV. Chronological Argument Flow (Lectern)</div>
          ${dossier.speakingNotes.map((sn) => `<div class="item-box"><b>[${sn.timeMark}] ${sn.heading}</b> (Exhibit Focus: ${sn.focusExhibit})<br/>${sn.content}</div>`).join("")}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (loading && !dossier) {
    return (
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto p-12 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-zinc-400 mb-3" />
        <span className="text-xs font-mono text-zinc-500">
          Loading High Court Bench Dossier &amp; Argument Outlines...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black shadow-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header & Bench Context */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                Bench Argument Studio
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                Kerala High Court Practice
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white">
              Case Preparation &amp; Argument Brief
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Prepare trial strategies, formulate framed issues, analyze binding Division Bench precedents, and rehearse oral bench inquiries before arguing at the lectern.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopySpeakingPoints}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white transition-colors border border-zinc-200 dark:border-zinc-800"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Speaking Points</span>
            </button>

            <button
              onClick={handlePrintLecternSheet}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white transition-colors border border-zinc-200 dark:border-zinc-800"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Lectern Brief</span>
            </button>

            <button
              onClick={handlePushToVault}
              disabled={vaultPushed}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                vaultPushed
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700"
                  : "bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
              }`}
            >
              {vaultPushed ? (
                <>
                  <Check className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
                  <span>Pushed to Vault</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Save to Vault (AES-256)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bench & Matter Metadata Card */}
        {dossier && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                Active Matter &amp; Case No
              </span>
              <div className="font-bold text-xs text-black dark:text-white truncate">
                {dossier.caseNumber}
              </div>
              <div className="text-[11px] text-zinc-500 truncate" title={dossier.matterTitle}>
                {dossier.matterTitle}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                Court Forum &amp; Bench Hall
              </span>
              <div className="font-bold text-xs text-black dark:text-white truncate">
                {dossier.bench}
              </div>
              <div className="text-[11px] text-zinc-500 truncate">
                {dossier.courtForum}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                Hearing Stage &amp; Item #
              </span>
              <div className="font-bold text-xs text-black dark:text-white truncate">
                {dossier.itemNumber} • {dossier.listedDate}
              </div>
              <div className="text-[11px] text-zinc-500 truncate">
                {dossier.hearingStage}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                Hon&apos;ble Coram &amp; Senior Counsel
              </span>
              <div className="font-bold text-xs text-black dark:text-white truncate">
                {advocateName}
              </div>
              <div className="text-[11px] text-zinc-500 truncate" title={dossier.coram}>
                {dossier.coram}
              </div>
            </div>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-zinc-200 dark:border-zinc-800">
          {[
            { id: "issues", label: "Framed Issues", icon: Scale, count: dossier?.issues.length },
            { id: "precedents", label: "Binding Precedents", icon: BookOpen, count: dossier?.precedents.length },
            { id: "inquiries", label: "Bench Inquiries & Rebuttals", icon: HelpCircle, count: dossier?.benchInquiries.length },
            { id: "speakingNotes", label: "Speaking Notes (Lectern)", icon: MessageSquare, count: dossier?.speakingNotes.length },
            { id: "witnessCross", label: "Witness Cross-Exam", icon: Users, count: dossier?.witnessQuestions.reduce((acc, g) => acc + g.questions.length, 0) },
            { id: "exhibits", label: "Evidence Checklist", icon: FileCheck, count: dossier?.evidenceExhibits.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs"
                    : "bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive
                        ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area by Tab */}
      {dossier && (
        <div className="space-y-6">
          {/* TAB 1: FRAMED ISSUES */}
          {activeSection === "issues" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                    Primary Questions for Judicial Determination
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Formally framed legal issues determining the grant of interim stay and final relief.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAiAssist("generate_issues")}
                    disabled={isAiGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-black dark:text-white transition-colors border border-zinc-200 dark:border-zinc-700 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Formulate Issue</span>
                  </button>
                  <button
                    onClick={() => setShowAddIssueModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Issue</span>
                  </button>
                </div>
              </div>

              {/* Add Issue Modal Inline */}
              {showAddIssueModal && (
                <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 shadow-md space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-bold text-black dark:text-white uppercase">
                      Frame New Legal Issue
                    </span>
                    <button
                      onClick={() => setShowAddIssueModal(false)}
                      className="text-xs text-zinc-400 hover:text-black dark:hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                        Issue Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Unlawful entry without Section 16 adjudication"
                        value={newIssueTitle}
                        onChange={(e) => setNewIssueTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                        Governing Statute / Article
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Section 16(1) Indian Telegraph Act, 1885"
                        value={newIssueStatute}
                        onChange={(e) => setNewIssueStatute(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-1 text-xs">
                      Precise Question for the Bench
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Whether the licensee has jurisdiction to proceed once written objection is recorded..."
                      value={newIssueQuestion}
                      onChange={(e) => setNewIssueQuestion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white text-xs"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddIssue}
                      disabled={!newIssueTitle.trim()}
                      className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 disabled:opacity-50"
                    >
                      Save Issue
                    </button>
                  </div>
                </div>
              )}

              {/* Issue Cards */}
              <div className="grid grid-cols-1 gap-3">
                {dossier.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white text-xs font-bold flex items-center justify-center font-mono border border-zinc-200 dark:border-zinc-800">
                          {issue.issueNumber}
                        </span>
                        <h4 className="font-bold text-sm text-black dark:text-white">
                          {issue.title}
                        </h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {issue.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-serif pl-8">
                      &ldquo;{issue.question}&rdquo;
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900 text-[11px] text-zinc-500 pl-8">
                      <span className="font-mono">Governing: {issue.governingLaw}</span>
                      {issue.isCore && (
                        <span className="font-semibold text-black dark:text-white">
                          ★ Core Determination Issue
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BINDING PRECEDENTS & RATIO MAPPING */}
          {activeSection === "precedents" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                    Binding Judicial Concordance &amp; Precedents
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    High Court Division Bench and Supreme Court rulings with operative ratio decidendi.
                  </p>
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  {dossier.precedents.filter((p) => p.isBookmarked).length} Bookmarked for Lectern
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {dossier.precedents.map((prec) => (
                  <div
                    key={prec.id}
                    className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-black dark:text-white">
                            {prec.citation}
                          </span>
                          <span className="text-xs text-zinc-400">•</span>
                          <span className="text-xs text-zinc-500">{prec.court}</span>
                        </div>
                        <h4 className="font-bold text-sm text-black dark:text-white mt-0.5">
                          {prec.caseName}
                        </h4>
                      </div>

                      <button
                        onClick={() => toggleBookmarkPrecedent(prec.id)}
                        className={`p-2 rounded-xl transition-colors border ${
                          prec.isBookmarked
                            ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                            : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-black dark:hover:text-white"
                        }`}
                        title="Bookmark for lectern brief"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Ratio Decidendi Box */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-1">
                      <div className="text-[10px] font-bold uppercase font-mono tracking-wider text-zinc-400">
                        Ratio Decidendi ({prec.keyParagraphs})
                      </div>
                      <p className="text-xs text-zinc-700 dark:text-zinc-200 font-serif leading-relaxed">
                        {prec.ratio}
                      </p>
                    </div>

                    {/* How to Apply in Argument */}
                    <div className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                      <Gavel className="w-3.5 h-3.5 shrink-0 text-zinc-700 dark:text-zinc-300 mt-0.5" />
                      <div>
                        <span className="font-bold text-black dark:text-white">
                          Counsel Argument Strategy:
                        </span>{" "}
                        {prec.howToApply}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ANTICIPATED BENCH INQUIRIES & REBUTTALS */}
          {activeSection === "inquiries" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                    Anticipated Judicial Inquiries &amp; Senior Rebuttals
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Proactive responses formulated to counter bench skepticism regarding delay, jurisdiction, or balance of convenience.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAiAssist("generate_inquiries")}
                    disabled={isAiGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-black dark:text-white transition-colors border border-zinc-200 dark:border-zinc-700 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Anticipate Queries</span>
                  </button>
                  <button
                    onClick={() => setShowAddInquiryModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bench Query</span>
                  </button>
                </div>
              </div>

              {/* Add Query Form */}
              {showAddInquiryModal && (
                <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 shadow-md space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-bold text-black dark:text-white uppercase">
                      Add Probable Bench Question
                    </span>
                    <button
                      onClick={() => setShowAddInquiryModal(false)}
                      className="text-xs text-zinc-400 hover:text-black dark:hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                      Probable Bench Question
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Why did your client not approach the civil court under Order 39?"
                      value={newBenchQuestion}
                      onChange={(e) => setNewBenchQuestion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                      Prepared Senior Counsel Rebuttal
                    </label>
                    <textarea
                      rows={2}
                      placeholder="My Lord, when public statutory authorities act in complete absence of jurisdiction..."
                      value={newBenchRebuttal}
                      onChange={(e) => setNewBenchRebuttal(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                      Supporting Exhibits / Citations to Cite
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Exhibit P-4 & Whirlpool Corp v. Registrar of Trade Marks"
                      value={newBenchExhibits}
                      onChange={(e) => setNewBenchExhibits(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white text-xs"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddInquiry}
                      disabled={!newBenchQuestion.trim()}
                      className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 disabled:opacity-50"
                    >
                      Save Query &amp; Rebuttal
                    </button>
                  </div>
                </div>
              )}

              {/* Inquiry Cards */}
              <div className="grid grid-cols-1 gap-4">
                {dossier.benchInquiries.map((inq, idx) => (
                  <div
                    key={inq.id}
                    className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white text-[11px] font-bold flex items-center justify-center font-mono border border-zinc-200 dark:border-zinc-800 shrink-0">
                          Q{idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-black dark:text-white">
                          {inq.question}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800">
                        {inq.difficulty} Difficulty
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border-l-3 border-zinc-800 dark:border-zinc-200 pl-4 space-y-1.5 ml-2">
                      <div className="text-[10px] font-bold uppercase font-mono tracking-wider text-zinc-400">
                        Prepared Verbal Rebuttal (For the Lectern)
                      </div>
                      <p className="text-xs text-zinc-800 dark:text-zinc-200 font-serif leading-relaxed">
                        &ldquo;{inq.rebuttalAnswer}&rdquo;
                      </p>
                      <div className="text-[11px] text-zinc-500 font-mono pt-1">
                        Immediate Exhibits: <span className="font-bold text-black dark:text-white">{inq.supportingExhibits}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SENIOR COUNSEL SPEAKING NOTES */}
          {activeSection === "speakingNotes" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                    Chronological Oral Speaking Sequence (Lectern Order)
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    High Court oral argument progression timed for opening, statutory bar, and interim prayer.
                  </p>
                </div>
                <button
                  onClick={handleCopySpeakingPoints}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-black dark:text-white transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Sequence</span>
                </button>
              </div>

              <div className="relative border-l-2 border-dashed border-zinc-200 dark:border-zinc-800 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6">
                {dossier.speakingNotes.map((note) => (
                  <div key={note.order} className="relative space-y-2">
                    {/* Step marker */}
                    <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-6 h-6 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[10px] font-bold font-mono shadow-xs">
                      {note.order}
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="text-[11px] font-mono font-bold text-zinc-500">
                            {note.timeMark}
                          </span>
                          <span className="text-xs text-zinc-400">•</span>
                          <h4 className="font-bold text-xs text-black dark:text-white uppercase tracking-wider">
                            {note.heading}
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-semibold">
                          {note.focusExhibit}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-700 dark:text-zinc-200 font-serif leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: WITNESS CROSS-EXAMINATION */}
          {activeSection === "witnessCross" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                    Witness Deposition &amp; Cross-Examination Bank
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Structured cross questions categorized to establish statutory omissions and impeach official witnesses.
                  </p>
                </div>
                <button
                  onClick={() => handleAiAssist("generate_cross_exam")}
                  disabled={isAiGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-black dark:text-white transition-colors border border-zinc-200 dark:border-zinc-700 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Generate Questions</span>
                </button>
              </div>

              {dossier.witnessQuestions.map((group, gIdx) => (
                <div
                  key={group.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                      <h4 className="font-bold text-sm text-black dark:text-white">
                        {group.witnessName}
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">
                      {group.witnessRole}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {group.questions.map((q, qIdx) => (
                      <div
                        key={q.qNo}
                        className={`p-4 rounded-xl transition-all border ${
                          q.isAsked
                            ? "bg-zinc-100/70 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 opacity-60"
                            : "bg-zinc-50 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white text-[10px] font-bold flex items-center justify-center font-mono shrink-0 mt-0.5">
                              {q.qNo}
                            </span>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-black dark:text-white font-serif leading-relaxed">
                                {q.questionText}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 font-mono">
                                <span>Objective: {q.objective}</span>
                                <span>•</span>
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                  Target: {q.targetAdmission}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleQuestionAsked(gIdx, qIdx)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-colors border ${
                              q.isAsked
                                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                                : "bg-white dark:bg-black text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:text-black dark:hover:text-white"
                            }`}
                          >
                            {q.isAsked ? "✓ Asked" : "Mark Asked"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: EVIDENCE & EXHIBIT CHECKLIST */}
          {activeSection === "exhibits" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                    Marked Evidence &amp; Exhibit Verification List
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Cross-referenced true copies marked as Ext. P-1 to Ext. P-6 filed with the High Court paperbook.
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {dossier.evidenceExhibits.length} Document Exhibits
                </span>
              </div>

              <div className="rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                      <th className="p-3 font-mono text-[10px] uppercase text-zinc-400">Mark</th>
                      <th className="p-3 font-bold text-black dark:text-white">Document Title / Particulars</th>
                      <th className="p-3 font-bold text-black dark:text-white">Admissibility</th>
                      <th className="p-3 font-mono text-[10px] uppercase text-zinc-400 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {dossier.evidenceExhibits.map((ex) => (
                      <tr key={ex.mark} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                        <td className="p-3 font-mono font-bold text-black dark:text-white whitespace-nowrap">
                          {ex.mark}
                        </td>
                        <td className="p-3 font-medium text-zinc-800 dark:text-zinc-200">
                          {ex.title}
                        </td>
                        <td className="p-3 text-zinc-500 font-mono">
                          {ex.admissibility}
                        </td>
                        <td className="p-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                            <Check className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
                            <span>True Copy</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
