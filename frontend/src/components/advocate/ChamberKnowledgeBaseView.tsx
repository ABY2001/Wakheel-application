"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  FileText,
  Search,
  CheckCircle2,
  Circle,
  Plus,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Bookmark,
  Calendar,
  User,
  Shield,
  Clock,
  Printer,
  Sparkles,
  Scale,
  X,
  Filter,
} from "lucide-react";
import { advocateApi } from "@/lib/api";

interface ChamberKnowledgeBaseViewProps {
  initialSubTab?: "library" | "playbooks" | "kb-articles" | "kb-research" | string;
  advocateName?: string;
  barCouncilNumber?: string;
  token?: string;
}

interface BareActSection {
  sectionNumber: string;
  heading: string;
  fullText: string;
  commentary: string;
  landmarkCitations: string[];
  amendments?: string;
}

interface BareAct {
  id: string;
  title: string;
  shortTitle: string;
  actNumber: string;
  category: string;
  enactmentYear: number;
  lastAmended: string;
  jurisdiction: string;
  overview: string;
  sections: BareActSection[];
}

interface PlaybookChecklistStage {
  stage: string;
  items: string[];
}

interface Playbook {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  forum: string;
  category: string;
  turnaround: string;
  description: string;
  checklist: PlaybookChecklistStage[];
}

interface KbArticle {
  id: string;
  title: string;
  author: string;
  designation: string;
  category: string;
  readTime: string;
  date: string;
  summary: string;
  keyTakeaways: string[];
  fullContent: string;
}

interface ResearchCitation {
  citation: string;
  court: string;
  reporter: string;
  proposition: string;
}

interface ResearchBrief {
  id: string;
  _id?: string;
  title: string;
  matterReference: string;
  category: string;
  author: string;
  createdAt: string;
  summary: string;
  legalPropositions: string[];
  citations: ResearchCitation[];
}

export default function ChamberKnowledgeBaseView({
  initialSubTab = "library",
  advocateName = "Adv. Meera Krishnan",
  barCouncilNumber = "K/1429/2016",
  token,
}: ChamberKnowledgeBaseViewProps) {
  // Active sub-tab state
  const [subTab, setSubTab] = useState<string>(
    ["library", "playbooks", "kb-articles", "kb-research"].includes(initialSubTab)
      ? initialSubTab
      : "library"
  );

  // Sync if initialSubTab changes from parent sidebar navigation
  useEffect(() => {
    if (["library", "playbooks", "kb-articles", "kb-research"].includes(initialSubTab)) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Data states
  const [acts, setActs] = useState<BareAct[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [articles, setArticles] = useState<KbArticle[]>([]);
  const [briefs, setBriefs] = useState<ResearchBrief[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search queries per tab
  const [actSearch, setActSearch] = useState("");
  const [selectedActCategory, setSelectedActCategory] = useState("All");
  const [selectedAct, setSelectedAct] = useState<BareAct | null>(null);
  const [selectedSectionIdx, setSelectedSectionIdx] = useState(0);

  // Playbooks state
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Articles state
  const [selectedArticle, setSelectedArticle] = useState<KbArticle | null>(null);
  const [articleSearch, setArticleSearch] = useState("");

  // Research Briefs state
  const [briefSearch, setBriefSearch] = useState("");
  const [selectedBrief, setSelectedBrief] = useState<ResearchBrief | null>(null);
  const [showAddBriefModal, setShowAddBriefModal] = useState(false);

  // New Brief Form state
  const [newBriefTitle, setNewBriefTitle] = useState("");
  const [newBriefMatter, setNewBriefMatter] = useState("WP(C) 19482/2024 — Gopakumar v. KSEB");
  const [newBriefCategory, setNewBriefCategory] = useState("Constitutional Writs");
  const [newBriefSummary, setNewBriefSummary] = useState("");
  const [newBriefPropositions, setNewBriefPropositions] = useState("");
  const [newBriefCitationCase, setNewBriefCitationCase] = useState("");
  const [newBriefCitationCourt, setNewBriefCitationCourt] = useState("");
  const [newBriefCitationReporter, setNewBriefCitationReporter] = useState("");
  const [newBriefCitationProp, setNewBriefCitationProp] = useState("");
  const [isSubmittingBrief, setIsSubmittingBrief] = useState(false);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [actsRes, playbooksRes, articlesRes, briefsRes] = await Promise.all([
        advocateApi.getBareActs("", token),
        advocateApi.getPlaybooks(token),
        advocateApi.getKbArticles(token),
        advocateApi.getResearchBriefs(token),
      ]);

      if (actsRes?.acts) {
        setActs(actsRes.acts);
        if (actsRes.acts.length > 0 && !selectedAct) {
          setSelectedAct(actsRes.acts[0]);
        }
      }
      if (playbooksRes?.playbooks) {
        setPlaybooks(playbooksRes.playbooks);
        if (playbooksRes.playbooks.length > 0 && !selectedPlaybook) {
          setSelectedPlaybook(playbooksRes.playbooks[0]);
        }
      }
      if (articlesRes?.articles) {
        setArticles(articlesRes.articles);
      }
      if (briefsRes?.briefs) {
        setBriefs(briefsRes.briefs);
        if (briefsRes.briefs.length > 0 && !selectedBrief) {
          setSelectedBrief(briefsRes.briefs[0]);
        }
      }
    } catch (err) {
      console.error("Error loading chamber knowledge base:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Bare Acts
  const filteredActs = useMemo(() => {
    return acts.filter((act) => {
      const matchesCategory =
        selectedActCategory === "All" ||
        (selectedActCategory === "Central" && act.category.includes("Central")) ||
        (selectedActCategory === "Criminal" && (act.category.includes("Criminal") || act.title.includes("Nyaya") || act.title.includes("Suraksha"))) ||
        (selectedActCategory === "Commercial" && act.category.includes("Commercial")) ||
        (selectedActCategory === "Kerala" && (act.category.includes("Kerala") || act.title.includes("Kerala")));

      const matchesSearch =
        !actSearch ||
        act.title.toLowerCase().includes(actSearch.toLowerCase()) ||
        act.shortTitle.toLowerCase().includes(actSearch.toLowerCase()) ||
        act.sections.some(
          (s) =>
            s.sectionNumber.toLowerCase().includes(actSearch.toLowerCase()) ||
            s.heading.toLowerCase().includes(actSearch.toLowerCase()) ||
            s.fullText.toLowerCase().includes(actSearch.toLowerCase())
        );

      return matchesCategory && matchesSearch;
    });
  }, [acts, selectedActCategory, actSearch]);

  // Keep selectedAct in sync if filtered
  useEffect(() => {
    if (filteredActs.length > 0 && (!selectedAct || !filteredActs.find((a) => a.id === selectedAct.id))) {
      setSelectedAct(filteredActs[0]);
      setSelectedSectionIdx(0);
    }
  }, [filteredActs]);

  // Filtered Articles
  const filteredArticles = useMemo(() => {
    if (!articleSearch.trim()) return articles;
    const q = articleSearch.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q)
    );
  }, [articles, articleSearch]);

  // Filtered Briefs
  const filteredBriefs = useMemo(() => {
    if (!briefSearch.trim()) return briefs;
    const q = briefSearch.toLowerCase();
    return briefs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.matterReference.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q) ||
        b.citations.some((c) => c.citation.toLowerCase().includes(q))
    );
  }, [briefs, briefSearch]);

  // Toggle checklist item for playbooks
  const togglePlaybookItem = (key: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Playbook completion percentage
  const currentPlaybookStats = useMemo(() => {
    if (!selectedPlaybook) return { total: 0, completed: 0, percent: 0 };
    let total = 0;
    let completed = 0;
    selectedPlaybook.checklist.forEach((stage, sIdx) => {
      stage.items.forEach((_, iIdx) => {
        total++;
        if (checkedItems[`${selectedPlaybook.id}-${sIdx}-${iIdx}`]) {
          completed++;
        }
      });
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [selectedPlaybook, checkedItems]);

  // Submit New Brief
  const handleCreateBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBriefTitle.trim()) return;

    setIsSubmittingBrief(true);
    try {
      const propositions = newBriefPropositions
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const citations: ResearchCitation[] = [];
      if (newBriefCitationCase.trim()) {
        citations.push({
          citation: newBriefCitationCase.trim(),
          court: newBriefCitationCourt.trim() || "High Court of Kerala",
          reporter: newBriefCitationReporter.trim() || "2024 SCC Online Ker",
          proposition: newBriefCitationProp.trim() || "Precedent proposition for chamber record.",
        });
      }

      const res = await advocateApi.createResearchBrief(
        {
          title: newBriefTitle,
          matterReference: newBriefMatter,
          category: newBriefCategory,
          summary: newBriefSummary,
          legalPropositions: propositions.length > 0 ? propositions : ["Statutory principles verified."],
          citations: citations.length > 0 ? citations : [],
          author: advocateName,
        },
        token
      );

      if (res?.brief) {
        setBriefs((prev) => [res.brief, ...prev]);
        setSelectedBrief(res.brief);
        setShowAddBriefModal(false);
        // Reset form
        setNewBriefTitle("");
        setNewBriefSummary("");
        setNewBriefPropositions("");
        setNewBriefCitationCase("");
        setNewBriefCitationCourt("");
        setNewBriefCitationReporter("");
        setNewBriefCitationProp("");
      }
    } catch (err) {
      console.error("Failed to create research brief:", err);
    } finally {
      setIsSubmittingBrief(false);
    }
  };

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded-md bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
              Chamber Precedent Suite
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Roll: {barCouncilNumber}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight mt-1">
            Chamber Knowledge Base &amp; Bare Act Studio
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Kerala State enactments, central statutes, procedural playbooks, and chamber precedent research
          </p>
        </div>

        {/* Global Action / Sub-Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "library", label: "Bare Acts Studio", icon: Scale },
            { id: "playbooks", label: "Chamber SOPs", icon: BookOpen },
            { id: "kb-articles", label: "Law Articles", icon: FileText },
            { id: "kb-research", label: "Research Briefs", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 1: BARE ACTS STUDIO (library)                          */}
      {/* ============================================================== */}
      {subTab === "library" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search section number (e.g. '16'), heading, or statutory wording..."
                value={actSearch}
                onChange={(e) => setActSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
              />
              {actSearch && (
                <button
                  onClick={() => setActSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: "All", label: "All Acts" },
                { id: "Central", label: "Central Statutes" },
                { id: "Criminal", label: "BNS / BNSS 2023" },
                { id: "Commercial", label: "Arbitration & NI" },
                { id: "Kerala", label: "Kerala State" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedActCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedActCategory === cat.id
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Two-Column Act Reader */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Acts List & Sections Navigator (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                    Statute Enactments ({filteredActs.length})
                  </span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {filteredActs.map((act) => {
                    const isSelected = selectedAct?.id === act.id;
                    return (
                      <button
                        key={act.id}
                        onClick={() => {
                          setSelectedAct(act);
                          setSelectedSectionIdx(0);
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-zinc-100 dark:bg-zinc-900 border-black dark:border-white shadow-xs"
                            : "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-black dark:text-white line-clamp-1">
                            {act.shortTitle}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                            {act.enactmentYear}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                          {act.category}
                        </p>
                      </button>
                    );
                  })}
                  {filteredActs.length === 0 && (
                    <div className="py-8 text-center text-xs text-zinc-500">
                      No matching Bare Acts found.
                    </div>
                  )}
                </div>
              </div>

              {/* Sections Selector for Selected Act */}
              {selectedAct && (
                <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                      Key Annotated Sections ({selectedAct.sections.length})
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                    {selectedAct.sections.map((sec, idx) => {
                      const isSecActive = selectedSectionIdx === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedSectionIdx(idx)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-between ${
                            isSecActive
                              ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold"
                              : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="font-mono mr-1.5">{sec.sectionNumber}:</span>
                            <span className="truncate">{sec.heading}</span>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSecActive ? "opacity-100" : "opacity-40"}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Section Detail & Landmark Jurisprudence Reader (8 Cols) */}
            <div className="lg:col-span-8">
              {selectedAct && selectedAct.sections[selectedSectionIdx] ? (
                (() => {
                  const currentSection = selectedAct.sections[selectedSectionIdx];
                  const citationText = `${selectedAct.title}, ${currentSection.sectionNumber} — ${currentSection.heading}`;

                  return (
                    <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-xs">
                      {/* Act & Section Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                              {selectedAct.actNumber} • Enacted {selectedAct.enactmentYear}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              | {selectedAct.jurisdiction}
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-black dark:text-white mt-1">
                            {currentSection.sectionNumber}: {currentSection.heading}
                          </h2>
                          <p className="text-xs font-semibold text-zinc-500 mt-0.5">
                            {selectedAct.title} ({selectedAct.lastAmended})
                          </p>
                        </div>

                        {/* Copy Section Citation */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleCopy(currentSection.fullText, "sec_text")}
                            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {copiedKey === "sec_text" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
                                <span>Copied Text</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Text</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleCopy(citationText, "sec_cite")}
                            className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            {copiedKey === "sec_cite" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white dark:text-black" />
                                <span>Citation Copied</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5" />
                                <span>Copy Citation</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Statutory Wording Panel */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                            AUTHENTIC STATUTORY WORDING
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            VERBATIM BARE ACT
                          </span>
                        </div>
                        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-line font-serif">
                          {currentSection.fullText}
                        </div>
                      </div>

                      {/* Chamber Commentary & Practice Notes */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Scale className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                            CHAMBER PRACTICE COMMENTARY &amp; BENCH RULINGS
                          </span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                          {currentSection.commentary}
                        </div>
                      </div>

                      {/* Landmark Citations */}
                      {currentSection.landmarkCitations && currentSection.landmarkCitations.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                            LANDMARK BINDING CITATIONS (SUPREME COURT &amp; KERALA HIGH COURT)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {currentSection.landmarkCitations.map((cite, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2"
                              >
                                <div className="text-xs font-bold text-black dark:text-white truncate">
                                  {cite}
                                </div>
                                <button
                                  onClick={() => handleCopy(cite, `cite_${cIdx}`)}
                                  className="text-zinc-400 hover:text-black dark:hover:text-white p-1 rounded-md cursor-pointer transition-colors"
                                  title="Copy Citation"
                                >
                                  {copiedKey === `cite_${cIdx}` ? (
                                    <Check className="w-3 h-3 text-black dark:text-white" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Amendments Note */}
                      {currentSection.amendments && (
                        <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                          <span className="font-mono font-bold text-black dark:text-white shrink-0">
                            Legislative Update:
                          </span>
                          <span>{currentSection.amendments}</span>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                  Select a Bare Act and Section to read authentic text and commentary.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: CHAMBER PLAYBOOKS & SOPs (playbooks)               */}
      {/* ============================================================== */}
      {subTab === "playbooks" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Playbook Selector (4 Cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 block pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  Procedural Playbooks ({playbooks.length})
                </span>

                <div className="space-y-2">
                  {playbooks.map((pb) => {
                    const isSelected = selectedPlaybook?.id === pb.id;
                    return (
                      <button
                        key={pb.id}
                        onClick={() => setSelectedPlaybook(pb)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-zinc-100 dark:bg-zinc-900 border-black dark:border-white shadow-xs"
                            : "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-zinc-500">
                            {pb.code}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {pb.turnaround}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-black dark:text-white mt-1 line-clamp-1">
                          {pb.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[10px] font-medium text-zinc-500">
                            Forum: {pb.forum}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live SOP Completion Card */}
              {selectedPlaybook && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                      Checklist Progress
                    </span>
                    <span className="text-xs font-mono font-bold text-black dark:text-white">
                      {currentPlaybookStats.completed} / {currentPlaybookStats.total} ({currentPlaybookStats.percent}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-black dark:bg-white transition-all duration-300"
                      style={{ width: `${currentPlaybookStats.percent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Items checked here remain tracked across your active session.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Active Playbook & Interactive SOP Checklist (8 Cols) */}
            <div className="lg:col-span-8">
              {selectedPlaybook ? (
                <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-xs">
                  {/* SOP Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
                          {selectedPlaybook.code}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">
                          {selectedPlaybook.forum}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-black dark:text-white mt-1.5">
                        {selectedPlaybook.title}
                      </h2>
                      <p className="text-xs text-zinc-500 mt-1">
                        {selectedPlaybook.description}
                      </p>
                    </div>

                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print SOP</span>
                    </button>
                  </div>

                  {/* Checklist Stages */}
                  <div className="space-y-6">
                    {selectedPlaybook.checklist.map((stage, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-3"
                      >
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                          {stage.stage}
                        </h3>

                        <div className="space-y-2">
                          {stage.items.map((item, iIdx) => {
                            const itemKey = `${selectedPlaybook.id}-${sIdx}-${iIdx}`;
                            const isChecked = !!checkedItems[itemKey];

                            return (
                              <div
                                key={iIdx}
                                onClick={() => togglePlaybookItem(itemKey)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                                  isChecked
                                    ? "bg-white dark:bg-black border-zinc-300 dark:border-zinc-700 opacity-70"
                                    : "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                                }`}
                              >
                                <button
                                  type="button"
                                  className="mt-0.5 text-black dark:text-white shrink-0 cursor-pointer"
                                >
                                  {isChecked ? (
                                    <CheckCircle2 className="w-4 h-4 text-black dark:text-white" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-zinc-400" />
                                  )}
                                </button>
                                <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-snug">
                                  <span className={isChecked ? "line-through text-zinc-400 dark:text-zinc-600" : ""}>
                                    {item}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                  Select a Chamber Playbook to view procedural steps and checklists.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 3: CHAMBER COMMENTARY & ARTICLES (kb-articles)        */}
      {/* ============================================================== */}
      {subTab === "kb-articles" && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search chamber articles by title or keyword..."
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
            />
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span className="uppercase tracking-wider">{art.category}</span>
                    <span>{art.readTime}</span>
                  </div>

                  <h3 className="text-base font-bold text-black dark:text-white hover:underline cursor-pointer" onClick={() => setSelectedArticle(art)}>
                    {art.title}
                  </h3>

                  <p className="text-xs text-zinc-500 line-clamp-3">
                    {art.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:divide-zinc-900 flex items-center justify-between">
                  <div className="text-[11px] text-zinc-500">
                    <span className="font-semibold text-black dark:text-white">{art.author}</span> • {art.date}
                  </div>
                  <button
                    onClick={() => setSelectedArticle(art)}
                    className="px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-bold transition-all cursor-pointer"
                  >
                    Read Analysis
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Full Article Reader Modal */}
          {selectedArticle && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 overflow-y-auto space-y-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                      {selectedArticle.category} • {selectedArticle.readTime}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-black dark:text-white mt-1">
                      {selectedArticle.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-500">
                      <span className="font-bold text-black dark:text-white">{selectedArticle.author}</span>
                      <span>({selectedArticle.designation})</span>
                      <span>• {selectedArticle.date}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Key Takeaways */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white block">
                    Key Practical Takeaways for High Court &amp; Trial Bench
                  </span>
                  <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                    {selectedArticle.keyTakeaways.map((point, pIdx) => (
                      <li key={pIdx} className="leading-relaxed">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Full Markdown Text */}
                <div className="prose prose-zinc dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line font-serif">
                  {selectedArticle.fullContent}
                </div>

                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer"
                  >
                    Close Reader
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 4: PRECEDENT RESEARCH BRIEFS (kb-research)            */}
      {/* ============================================================== */}
      {subTab === "kb-research" && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search precedent briefs by title, matter, or citation..."
                value={briefSearch}
                onChange={(e) => setBriefSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
              />
            </div>

            <button
              onClick={() => setShowAddBriefModal(true)}
              className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Research Brief</span>
            </button>
          </div>

          {/* Briefs Master-Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Briefs List (4 Cols) */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 block pb-1">
                Active Research Briefs ({filteredBriefs.length})
              </span>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredBriefs.map((b) => {
                  const isSelected = selectedBrief?.id === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBrief(b)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-zinc-100 dark:bg-zinc-900 border-black dark:border-white shadow-xs"
                          : "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span className="uppercase tracking-wider truncate mr-2">{b.category}</span>
                        <span>{b.createdAt}</span>
                      </div>
                      <h4 className="text-xs font-bold text-black dark:text-white mt-1 line-clamp-2">
                        {b.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 line-clamp-1 mt-1 font-mono">
                        {b.matterReference}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Brief Details & Cited Authorities (8 Cols) */}
            <div className="lg:col-span-8">
              {selectedBrief ? (
                <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-xs">
                  {/* Brief Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                          {selectedBrief.category} • Created {selectedBrief.createdAt}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-black dark:text-white mt-1">
                        {selectedBrief.title}
                      </h2>
                      <p className="text-xs font-mono text-zinc-500 mt-1">
                        Matter: {selectedBrief.matterReference} | Author: {selectedBrief.author}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopy(
                        `${selectedBrief.title}\n\nMatter: ${selectedBrief.matterReference}\n\nSummary:\n${selectedBrief.summary}\n\nKey Propositions:\n${selectedBrief.legalPropositions.map((p) => `- ${p}`).join("\n")}`,
                        "brief_copy"
                      )}
                      className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                    >
                      {copiedKey === "brief_copy" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-black dark:text-white" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Brief</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                      Executive Legal Summary
                    </span>
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                      {selectedBrief.summary}
                    </div>
                  </div>

                  {/* Legal Propositions */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                      Substantive Legal Propositions
                    </span>
                    <div className="space-y-2">
                      {selectedBrief.legalPropositions.map((prop, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-start gap-3"
                        >
                          <span className="text-xs font-mono font-bold text-zinc-400 mt-0.5">
                            P{pIdx + 1}.
                          </span>
                          <span className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            {prop}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cited Authorities & Citations */}
                  <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                      Cited Precedents &amp; Case Authorities ({selectedBrief.citations.length})
                    </span>

                    <div className="space-y-2">
                      {selectedBrief.citations.map((cite, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-black dark:text-white">
                              {cite.citation}
                            </span>
                            <span className="text-[11px] font-mono text-zinc-500">
                              {cite.reporter} • {cite.court}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                            {cite.proposition}
                          </p>
                        </div>
                      ))}
                      {selectedBrief.citations.length === 0 && (
                        <div className="py-4 text-center text-xs text-zinc-500">
                          No direct citations attached to this brief.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                  Select a research brief to view propositions and judicial authorities.
                </div>
              )}
            </div>
          </div>

          {/* Modal: Create Research Brief */}
          {showAddBriefModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white">
                      Create Chamber Research Brief
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Archive case authorities and legal propositions in the chamber repository
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddBriefModal(false)}
                    className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateBrief} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Brief Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Mandatory S.16 Telegraph Act Compliance for 110kV Line"
                      value={newBriefTitle}
                      onChange={(e) => setNewBriefTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden focus:border-black dark:focus:border-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                        Matter Reference
                      </label>
                      <input
                        type="text"
                        placeholder="WP(C) 19482/2024 or General"
                        value={newBriefMatter}
                        onChange={(e) => setNewBriefMatter(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden focus:border-black dark:focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                        Category
                      </label>
                      <select
                        value={newBriefCategory}
                        onChange={(e) => setNewBriefCategory(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden focus:border-black dark:focus:border-white"
                      >
                        <option value="Constitutional Writs">Constitutional Writs</option>
                        <option value="Commercial Arbitration">Commercial Arbitration</option>
                        <option value="Criminal Jurisprudence">Criminal Jurisprudence</option>
                        <option value="Civil Property & Injunctions">Civil Property &amp; Injunctions</option>
                        <option value="Banking & NI Act">Banking &amp; NI Act</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Executive Summary
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Concise chamber synthesis of the legal position..."
                      value={newBriefSummary}
                      onChange={(e) => setNewBriefSummary(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden focus:border-black dark:focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Legal Propositions (One per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="1. Telegraph authority acquires only user rights, not ownership.&#10;2. Magistrate referral is mandatory upon objection."
                      value={newBriefPropositions}
                      onChange={(e) => setNewBriefPropositions(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-hidden focus:border-black dark:focus:border-white"
                    />
                  </div>

                  {/* Primary Precedent Citation */}
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                      Primary Landmark Citation (Optional)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Case Name (e.g. Valsamma v. KSEB)"
                        value={newBriefCitationCase}
                        onChange={(e) => setNewBriefCitationCase(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Court (e.g. High Court of Kerala)"
                        value={newBriefCitationCourt}
                        onChange={(e) => setNewBriefCitationCourt(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Reporter (e.g. 2012 (2) KLT 368)"
                        value={newBriefCitationReporter}
                        onChange={(e) => setNewBriefCitationReporter(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Proposition held in this judgment..."
                      value={newBriefCitationProp}
                      onChange={(e) => setNewBriefCitationProp(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                    />
                  </div>

                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddBriefModal(false)}
                      className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingBrief}
                      className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingBrief ? "Saving Brief..." : "Save to Knowledge Base"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
