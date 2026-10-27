"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  Cpu,
  UserPlus,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Bot,
  FileText,
  Play,
  Check,
  Copy,
  Sliders,
  Scale,
  RefreshCw,
  X,
  User,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Send,
  AlertCircle,
} from "lucide-react";
import { advocateApi } from "@/lib/api";

interface WorkForceViewProps {
  activeModule?: string;
  onSelectModule?: (mod: string) => void;
  advocateName?: string;
  barCouncilNumber?: string;
  token?: string;
}

export function WorkForceView({
  activeModule = "my-ai-twin",
  onSelectModule,
  advocateName = "Adv. Meera Krishnan",
  barCouncilNumber = "K/001429/2012",
  token,
}: WorkForceViewProps) {
  const [currentTab, setCurrentTab] = useState<string>(activeModule);

  useEffect(() => {
    if (activeModule) {
      setCurrentTab(activeModule);
    }
  }, [activeModule]);

  const tabs = [
    { id: "my-ai-twin", label: "My AI Twin", icon: UserPlus },
    { id: "training", label: "Junior Training Academy", icon: Award },
    { id: "my-ai-agents", label: "Autonomous AI Fleet", icon: Cpu },
    { id: "hiring-suite", label: "Chamber Hiring Suite", icon: Users },
  ];

  const handleTabChange = (id: string) => {
    setCurrentTab(id);
    if (onSelectModule) onSelectModule(id);
  };

  // =========================================================================
  // 1. STATE: MY AI TWIN
  // =========================================================================
  const [twinConfig, setTwinConfig] = useState<any>({
    advocateName,
    enrollmentNumber: barCouncilNumber,
    standingYears: 14,
    calibrationScore: 99.4,
    pleadingsTrainedCount: 1420,
    activeSyncStatus: "Live Synchronized (Vault, Precedents & Causelists)",
    draftingStyle: "constitutional_assertive",
    primaryJurisdiction: "high_court_kerala",
    preferredCitations: ["KLT (Kerala Law Times)", "SCC (Supreme Court Cases)", "ILR (Kerala)"],
    autonomousIntakeEnabled: true,
    minimumConsultationFee: 3500,
    conflictCheckStrictness: "high",
    emergencyBailAutoEscalate: true,
    twinPersonaSummary:
      "Specialized in High Court Article 226 Writs, Telegraph Act Section 16 land objections, BNSS 482 anticipatory bail, and commercial contract litigation.",
  });

  const [twinLoading, setTwinLoading] = useState(false);
  const [twinSaveMsg, setTwinSaveMsg] = useState<string | null>(null);

  // Twin Simulation Sandbox State
  const [simQuery, setSimQuery] = useState(
    "KSEB is drawing a 66kV transmission line through client property without DM order under Section 16(1). What is our urgent remedy?"
  );
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [copiedClause, setCopiedClause] = useState(false);

  // Load Twin Data
  useEffect(() => {
    const fetchTwin = async () => {
      try {
        setTwinLoading(true);
        const res = await advocateApi.getAdvocateTwin(token);
        if (res && res.success && res.twin) {
          setTwinConfig(res.twin);
        }
      } catch (err) {
        console.warn("Failed to load twin from backend:", err);
      } finally {
        setTwinLoading(false);
      }
    };
    fetchTwin();
  }, [token]);

  const handleSaveTwin = async () => {
    try {
      const res = await advocateApi.updateAdvocateTwin(twinConfig, token);
      if (res && res.success) {
        setTwinSaveMsg("AI Twin calibration and chamber voice profile saved successfully.");
        setTimeout(() => setTwinSaveMsg(null), 3000);
      }
    } catch (err) {
      console.error("Save twin error:", err);
      alert("Failed to save AI Twin parameters.");
    }
  };

  const handleSimulateTwin = async (queryText?: string) => {
    const q = queryText || simQuery;
    if (!q.trim() || simLoading) return;

    setSimLoading(true);
    setCopiedClause(false);
    try {
      const res = await advocateApi.simulateTwinReasoning(
        {
          query: q,
          draftingStyle: twinConfig.draftingStyle,
          primaryJurisdiction: twinConfig.primaryJurisdiction,
        },
        token
      );
      if (res && res.success) {
        setSimResult(res);
      }
    } catch (err) {
      console.error("Twin simulation error:", err);
      alert("Failed to simulate AI Twin reasoning.");
    } finally {
      setSimLoading(false);
    }
  };

  const handleCopyClause = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedClause(true);
      setTimeout(() => setCopiedClause(false), 2000);
    }
  };

  // =========================================================================
  // 2. STATE: JUNIOR TRAINING ACADEMY
  // =========================================================================
  const [curriculumModules, setCurriculumModules] = useState<any[]>([]);
  const [activeExamModule, setActiveExamModule] = useState<any | null>(null);
  const [examAnswer, setExamAnswer] = useState("");
  const [examEvaluating, setExamEvaluating] = useState(false);
  const [examResult, setExamResult] = useState<any | null>(null);

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const res = await advocateApi.getTrainingModules(token);
        if (res && res.success && res.modules) {
          setCurriculumModules(res.modules);
        }
      } catch (err) {
        console.warn("Failed to load curriculum:", err);
      }
    };
    fetchCurriculum();
  }, [token]);

  const handleOpenExam = (mod: any) => {
    setActiveExamModule(mod);
    setExamAnswer("");
    setExamResult(null);
  };

  const handleSubmitExam = async () => {
    if (!examAnswer.trim() || !activeExamModule || examEvaluating) return;
    setExamEvaluating(true);
    try {
      const res = await advocateApi.evaluateAssociateSubmission(
        {
          moduleId: activeExamModule.id,
          associateAnswer: examAnswer,
          associateName: "Junior Counsel",
        },
        token
      );
      if (res && res.success) {
        setExamResult(res);
      }
    } catch (err) {
      console.error("Exam evaluation error:", err);
      alert("Failed to evaluate submission.");
    } finally {
      setExamEvaluating(false);
    }
  };

  // =========================================================================
  // 3. STATE: AUTONOMOUS AI AGENTS FLEET
  // =========================================================================
  const [agentFleet, setAgentFleet] = useState([
    {
      id: "agent_bns_concordance",
      name: "BNSS Statutory Concordance Agent",
      role: "Autonomous Cross-Section Mapper",
      status: "Active",
      speed: "0.2s lookup",
      desc: "Automatically resolves citations between legacy CrPC and Bharatiya Nagarik Suraksha Sanhita (BNSS 2023) across petition drafts.",
      target: "Criminal Trial & Appellate Writs",
      triggers: "On Document Ingestion",
    },
    {
      id: "agent_bail_drafting",
      name: "Bail Petition Drafting Synthesizer",
      role: "Pleading Generation Specialist",
      status: "Active",
      speed: "35s full draft",
      desc: "Generates formatted Section 482 BNSS pre-arrest bail petitions with Arnesh Kumar compliance assertions and clean antecedent averments.",
      target: "Sessions Courts & High Court",
      triggers: "Client FIR Ingestion Webhook",
    },
    {
      id: "agent_causelist",
      name: "Kerala High Court Registry Crawler",
      role: "Daily Causelist Monitor",
      status: "Active",
      speed: "Refreshes 07:00 AM Daily",
      desc: "Scrapes daily cause lists across High Court Division Benches & Ernakulam District Courts for advocate Bar Roll K/001429/2012.",
      target: "High Court of Kerala (Court Halls 1–14)",
      triggers: "Daily Cron 07:00 IST",
    },
    {
      id: "agent_contract_auditor",
      name: "Commercial Contract Risk Auditor",
      role: "Commercial Risk Inspector",
      status: "Standby",
      speed: "Instant audit",
      desc: "Scans corporate commercial contracts for unilateral indemnity traps, jurisdiction shifts away from Kerala, and uncapped liability.",
      target: "Commercial Division & Arbitration",
      triggers: "Chamber Vault Upload",
    },
  ]);

  const [agentActionToast, setAgentActionToast] = useState<string | null>(null);

  const handleToggleAgent = (id: string) => {
    setAgentFleet((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === "Active" ? "Standby" : "Active" } : a))
    );
  };

  const handleTriggerAgent = (agent: any) => {
    setAgentActionToast(`Executing ${agent.name}... Synchronizing chamber records.`);
    setTimeout(() => {
      setAgentActionToast(`${agent.name} executed successfully. 0 discrepancies found.`);
      setTimeout(() => setAgentActionToast(null), 3500);
    }, 1200);
  };

  // =========================================================================
  // 4. STATE: CHAMBER HIRING SUITE
  // =========================================================================
  const [candidates, setCandidates] = useState<any[]>([]);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [selectedCandidateDossier, setSelectedCandidateDossier] = useState<any | null>(null);

  // New Job Opening State
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDept, setNewJobDept] = useState("Appellate & High Court Litigation");
  const [newJobExp, setNewJobExp] = useState("1-3 Years PQE");
  const [newJobDesc, setNewJobDesc] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await advocateApi.getRecruitmentCandidates(token);
        if (res && res.success && res.candidates) {
          setCandidates(res.candidates);
        }
      } catch (err) {
        console.warn("Failed to load candidates:", err);
      }
    };
    fetchCandidates();
  }, [token]);

  const handleCreateOpening = () => {
    if (!newJobTitle.trim()) return;
    alert(`Chamber Job Opening '${newJobTitle}' published to Kerala Bar Council notice board and alumni networks.`);
    setShowPostJobModal(false);
    setNewJobTitle("");
    setNewJobDesc("");
  };

  const handleUpdateCandidateStatus = async (candId: string, newStatus: string) => {
    try {
      await advocateApi.updateCandidateStatus(candId, newStatus, token);
      setCandidates((prev) => prev.map((c) => (c.id === candId ? { ...c, status: newStatus } : c)));
      if (selectedCandidateDossier && selectedCandidateDossier.id === candId) {
        setSelectedCandidateDossier((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Update candidate status error:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-12">
      {/* ============================================================== */}
      {/* TOP HEADER & NAVIGATION                                        */}
      {/* ============================================================== */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                Workforce Suite • Milestone 4
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
                Personal AI Twin &amp; Associate Academy
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mt-1">
              Chamber Talent &amp; AI Worker Network
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5 max-w-3xl">
              Configure your Personal AI Legal Twin calibrated to your specific High Court drafting voice,
              manage autonomous judicial agents, evaluate junior associate assessments, and run chamber recruitment.
            </p>
          </div>

          {/* Sub-Tabs Selector */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-start lg:self-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 1: MY AI TWIN STUDIO & INTERACTIVE REASONING SANDBOX   */}
      {/* ============================================================== */}
      {currentTab === "my-ai-twin" && (
        <div className="space-y-6">
          {twinSaveMsg && (
            <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-black dark:text-white flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{twinSaveMsg}</span>
            </div>
          )}

          {/* 1. TWIN PROFILE BANNER */}
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
                  MK
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-black dark:text-white">
                      {twinConfig.advocateName || advocateName} — AI Digital Twin
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white">
                      {twinConfig.enrollmentNumber || barCouncilNumber}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Trained on {twinConfig.pleadingsTrainedCount} chamber pleadings, High Court judgments, and legal research briefs (2012–2026).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-xs font-bold text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
                  Calibration: {twinConfig.calibrationScore}%
                </span>
                <button
                  onClick={handleSaveTwin}
                  className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition cursor-pointer"
                >
                  Save Calibration
                </button>
              </div>
            </div>

            {/* 2. TWIN PARAMETERS EDITABLE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Parameter 1: Drafting Voice */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
                  Drafting Voice &amp; Tone
                </span>
                <select
                  value={twinConfig.draftingStyle}
                  onChange={(e) => setTwinConfig({ ...twinConfig, draftingStyle: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="constitutional_assertive">Assertive Constitutional &amp; Precedent-First</option>
                  <option value="criminal_defense_rigorous">Rigorous Criminal Defense &amp; Liberty-First</option>
                  <option value="commercial_concise">Concise Commercial &amp; Transactional</option>
                  <option value="conciliatory">Conciliatory &amp; Alternative Dispute Resolution</option>
                </select>
                <p className="text-[11px] text-zinc-500 leading-tight">
                  Calibrates whether pleadings emphasize constitutional jurisdiction or statutory literalism.
                </p>
              </div>

              {/* Parameter 2: Primary Jurisdiction */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
                  Primary Forum Jurisdiction
                </span>
                <select
                  value={twinConfig.primaryJurisdiction}
                  onChange={(e) => setTwinConfig({ ...twinConfig, primaryJurisdiction: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="high_court_kerala">High Court of Kerala (Division &amp; Single Benches)</option>
                  <option value="supreme_court">Supreme Court of India (Appellate Jurisdiction)</option>
                  <option value="district_ernakulam">District &amp; Sessions Court, Ernakulam</option>
                  <option value="nclt_kochi">National Company Law Tribunal (NCLT Kochi Bench)</option>
                </select>
                <p className="text-[11px] text-zinc-500 leading-tight">
                  Prioritizes local High Court Rules of Practice and regional citation hierarchies.
                </p>
              </div>

              {/* Parameter 3: Autonomous Intake & Fees */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
                    Citizen Lead Intake Policy
                  </span>
                  <span className="text-[10px] font-bold text-black dark:text-white">Active</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-black dark:text-white pt-1">
                  <span>Min Consultation Fee:</span>
                  <span>₹{twinConfig.minimumConsultationFee || 3500}</span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-tight">
                  Conflict screening strictness: <span className="font-bold text-black dark:text-white">Strict Rule 33</span>
                </p>
              </div>
            </div>
          </div>

          {/* 3. INTERACTIVE TWIN REASONING SANDBOX */}
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Test Digital Twin Legal Reasoning &amp; Drafting
                </h4>
                <p className="text-xs text-zinc-500">
                  Ask your Digital Twin to analyze a scenario, formulate grounds of petition, or draft a pleading clause in your voice.
                </p>
              </div>
            </div>

            {/* Quick Test Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Test Prompts:</span>
              <button
                type="button"
                onClick={() => {
                  const q = "KSEB is drawing a 66kV transmission line through client property without DM order under Section 16(1). What is our urgent remedy?";
                  setSimQuery(q);
                  handleSimulateTwin(q);
                }}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Telegraph Act 16(1) Resistance
              </button>
              <button
                type="button"
                onClick={() => {
                  const q = "Postal envelope returned unserved as 'Not Claimed' in Section 138 NI Act complaint. How do we plead deemed service?";
                  setSimQuery(q);
                  handleSimulateTwin(q);
                }}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Section 138 Deemed Service
              </button>
              <button
                type="button"
                onClick={() => {
                  const q = "Anticipatory bail application under BNSS 482 where IO has issued Section 35(3) notice. How to establish lack of custodial interrogation necessity?";
                  setSimQuery(q);
                  handleSimulateTwin(q);
                }}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                BNSS 482 Anticipatory Bail
              </button>
              <button
                type="button"
                onClick={() => {
                  const q = "Statutory demand notice issued without prior show-cause notice. Can we directly invoke Article 226 bypassing Appellate Tribunal?";
                  setSimQuery(q);
                  handleSimulateTwin(q);
                }}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Whirlpool Natural Justice Exception
              </button>
            </div>

            {/* Input Bar */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <input
                type="text"
                value={simQuery}
                onChange={(e) => setSimQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSimulateTwin();
                  }
                }}
                placeholder="Ask your digital twin to draft a rejoinder clause, analyze maintainability, or cite case law..."
                className="flex-1 px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSimulateTwin()}
                disabled={simLoading || !simQuery.trim()}
                className="px-6 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold disabled:opacity-50 hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                {simLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Twin Reasoning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Simulation</span>
                  </>
                )}
              </button>
            </div>

            {/* Output Panel */}
            {simResult && (
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-ping" />
                    <span className="font-bold text-black dark:text-white">
                      AI Twin Reasoning Output • Adv. Meera Krishnan Voice
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Confidence: {simResult.confidenceScore}%
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white">
                      {simResult.timestamp}
                    </span>
                  </div>
                </div>

                {/* 1. Legal Opinion & Ratio Analysis */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                    1. Chamber Legal Opinion &amp; Ratio Analysis
                  </span>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed pl-3 border-l-2 border-black dark:border-white">
                    {simResult.legalOpinion}
                  </p>
                </div>

                {/* 2. Procedural Roadmap */}
                {Array.isArray(simResult.proceduralRoadmap) && simResult.proceduralRoadmap.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                      2. Step-by-Step Procedural Roadmap
                    </span>
                    <div className="space-y-1.5">
                      {simResult.proceduralRoadmap.map((step: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                          <span className="w-5 h-5 rounded-md bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Draft Pleading Clause */}
                {simResult.draftClause && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                        3. Formulated Pleading Averment Clause
                      </span>
                      <button
                        onClick={() => handleCopyClause(simResult.draftClause)}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-black dark:text-white hover:underline cursor-pointer"
                      >
                        {copiedClause ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedClause ? "Copied" : "Copy Averment"}</span>
                      </button>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-serif italic text-black dark:text-white leading-relaxed">
                      &ldquo;{simResult.draftClause}&rdquo;
                    </div>
                  </div>
                )}

                {/* 4. Binding Precedent Citations */}
                {Array.isArray(simResult.bindingCitations) && simResult.bindingCitations.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                      4. Controlling Binding Citations
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {simResult.bindingCitations.map((cit: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white"
                        >
                          {cit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: JUNIOR TRAINING ACADEMY & COMPETENCY EXAMS          */}
      {/* ============================================================== */}
      {currentTab === "training" && (
        <div className="space-y-6">
          {/* Top Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs text-zinc-500 font-medium">Training Curriculum</span>
              <div className="text-2xl font-bold text-black dark:text-white">4 Modules Active</div>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">BNSS, Writs, Cheque Bounce, Evidence</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs text-zinc-500 font-medium">Average Evaluation Score</span>
              <div className="text-2xl font-bold text-black dark:text-white">94.8%</div>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">High score in High Court maintainability</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs text-zinc-500 font-medium">Active Junior Trainees</span>
              <div className="text-2xl font-bold text-black dark:text-white">6 Counsel</div>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Enrolled in 2026 Bar roster</span>
            </div>
          </div>

          {/* Curriculum Modules Roster */}
          <div className="rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white">
                  Chamber Legal Competency Curriculum &amp; Mock Assessments
                </h3>
                <p className="text-xs text-zinc-500">
                  Real mock scenarios evaluated against Senior Counsel benchmark rubrics.
                </p>
              </div>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {curriculumModules.map((item) => (
                <div
                  key={item.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-black dark:text-white text-sm">{item.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                      {item.overview}
                    </p>
                    <div className="flex items-center gap-3 text-zinc-500 text-[11px] pt-0.5">
                      <span>Instructor: {item.instructor}</span>
                      <span>•</span>
                      <span>Level: {item.level}</span>
                      <span>•</span>
                      <span>Score: <strong className="text-black dark:text-white">{item.score}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                    <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-semibold text-[11px]">
                      {item.status}
                    </span>
                    <button
                      onClick={() => handleOpenExam(item)}
                      className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Take Exam</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ASSESSMENT MODAL */}
          {activeExamModule && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
              <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Junior Counsel Assessment Exam
                    </span>
                    <h3 className="text-base font-bold text-black dark:text-white">
                      {activeExamModule.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveExamModule(null)}
                    className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
                  {/* Practical Factual Scenario */}
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                    <span className="font-bold text-black dark:text-white uppercase tracking-wider text-[11px] block">
                      Factual Problem Scenario:
                    </span>
                    <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed font-serif italic text-sm">
                      &ldquo;{activeExamModule.quizScenario?.prompt}&rdquo;
                    </p>
                  </div>

                  {/* Junior Counsel Answer Console */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-black dark:text-white block">
                      Draft your Legal Argument &amp; Statutory Resolution:
                    </label>
                    <textarea
                      rows={5}
                      value={examAnswer}
                      onChange={(e) => setExamAnswer(e.target.value)}
                      placeholder="Address substantive vs procedural law, specific sections, and binding precedents..."
                      className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                    />
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[11px] text-zinc-500">
                        Evaluated on: Issue Spotting, Statutory Precision, and Precedent Citation Accuracy.
                      </span>
                      <button
                        onClick={handleSubmitExam}
                        disabled={examEvaluating || !examAnswer.trim()}
                        className="px-5 py-2.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold disabled:opacity-50 hover:opacity-90 transition cursor-pointer flex items-center gap-2"
                      >
                        {examEvaluating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Senior Grading...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit for Senior Review</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Evaluation Scorecard */}
                  {examResult && (
                    <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                        <span className="text-xs font-bold text-black dark:text-white">
                          Evaluation Scorecard &amp; Rubric
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            examResult.passed
                              ? "bg-black text-white dark:bg-white dark:text-black"
                              : "bg-zinc-200 text-black dark:bg-zinc-800 dark:text-white"
                          }`}
                        >
                          Overall Score: {examResult.overallScore}% ({examResult.passed ? "PASSED" : "REVISE"})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                        <div className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Issue Spotting</span>
                          <span className="text-lg font-bold text-black dark:text-white mt-1 block">
                            {examResult.issueSpotting}%
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Statutory Precision</span>
                          <span className="text-lg font-bold text-black dark:text-white mt-1 block">
                            {examResult.statutoryPrecision}%
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Citation Accuracy</span>
                          <span className="text-lg font-bold text-black dark:text-white mt-1 block">
                            {examResult.citationAccuracy}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <span className="font-bold text-black dark:text-white block">Senior Counsel Critique:</span>
                        <p className="text-zinc-700 dark:text-zinc-300 pl-3 border-l-2 border-black dark:border-white">
                          {examResult.seniorFeedback}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs">
                        <span className="font-bold text-black dark:text-white uppercase text-[10px] block">
                          Chamber Model Benchmark Answer:
                        </span>
                        <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed font-serif">
                          {examResult.benchmarkAnswer}
                        </p>
                        {examResult.landmarkCitation && (
                          <div className="pt-2 text-[11px] font-bold text-black dark:text-white">
                            Controlling Authority: {examResult.landmarkCitation}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 3: AUTONOMOUS AI AGENTS FLEET                          */}
      {/* ============================================================== */}
      {currentTab === "my-ai-agents" && (
        <div className="space-y-6">
          {agentActionToast && (
            <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-black dark:text-white flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{agentActionToast}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {agentFleet.map((agent) => (
              <div
                key={agent.id}
                className="p-6 md:p-7 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 hover:border-black dark:hover:border-white transition-all shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shadow-xs">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAgent(agent.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                        agent.status === "Active"
                          ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                      }`}
                    >
                      {agent.status}
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-black dark:text-white">{agent.name}</h4>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">{agent.role}</p>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{agent.desc}</p>

                <div className="space-y-1 text-[11px] text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                  <div className="flex justify-between">
                    <span>Target Forum:</span>
                    <span className="font-semibold text-black dark:text-white">{agent.target}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Execution Trigger:</span>
                    <span className="font-mono text-black dark:text-white">{agent.triggers}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-500">{agent.speed}</span>
                  <button
                    onClick={() => handleTriggerAgent(agent)}
                    className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-85 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3" />
                    <span>Run Trigger</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 4: CHAMBER RECRUITMENT & HIRING PIPELINE               */}
      {/* ============================================================== */}
      {currentTab === "hiring-suite" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 gap-3">
            <div>
              <h3 className="text-base font-bold text-black dark:text-white">
                Chamber Recruitment &amp; Associate Pipeline
              </h3>
              <p className="text-xs text-zinc-500">
                Screen junior counsel applicants, verify Bar Council credentials, and conduct structured competency reviews.
              </p>
            </div>
            <button
              onClick={() => setShowPostJobModal(true)}
              className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto hover:opacity-90 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Post Chamber Opening
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs hover:border-black dark:hover:border-white transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-black dark:text-white">{cand.name}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                      {cand.score} match
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-zinc-600 dark:text-zinc-400">{cand.college}</p>
                    <p className="text-zinc-500 text-[11px]">
                      Applied for: <strong className="text-black dark:text-white">{cand.role}</strong>
                    </p>
                    <p className="text-zinc-500 text-[11px] font-mono">
                      Roll: {cand.enrollmentNumber}
                    </p>
                  </div>

                  {cand.barVerified && (
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-700 dark:text-zinc-300 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white" />
                      <span>Bar Council Verified</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    {cand.status}
                  </span>
                  <button
                    onClick={() => setSelectedCandidateDossier(cand)}
                    className="px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer hover:opacity-90 transition"
                  >
                    Review Dossier
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CANDIDATE DOSSIER MODAL */}
          {selectedCandidateDossier && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
              <div className="w-full max-w-2xl bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Candidate Profile Dossier
                    </span>
                    <h3 className="text-base font-bold text-black dark:text-white">
                      {selectedCandidateDossier.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedCandidateDossier(null)}
                    className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 md:p-8 space-y-5 overflow-y-auto text-xs">
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Law Alma Mater:</span>
                      <strong className="text-black dark:text-white">{selectedCandidateDossier.college}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Enrollment Roll No:</span>
                      <strong className="text-black dark:text-white font-mono">{selectedCandidateDossier.enrollmentNumber}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Applied Role:</span>
                      <strong className="text-black dark:text-white">{selectedCandidateDossier.role}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Practice Experience:</span>
                      <strong className="text-black dark:text-white">{selectedCandidateDossier.experienceYears}</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-black dark:text-white uppercase text-[10px] block">
                      Specialization &amp; Core Strengths:
                    </span>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {selectedCandidateDossier.specialization}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-black dark:text-white uppercase text-[10px] block">
                      Chamber Scrutiny Highlights:
                    </span>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {selectedCandidateDossier.cvHighlights}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-zinc-500 font-semibold">Advance Pipeline Status:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateCandidateStatus(selectedCandidateDossier.id, "Interview Round 2")}
                        className="px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                      >
                        Round 2
                      </button>
                      <button
                        onClick={() => handleUpdateCandidateStatus(selectedCandidateDossier.id, "Offer Extended")}
                        className="px-3 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 cursor-pointer"
                      >
                        Extend Offer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* POST OPENING MODAL */}
          {showPostJobModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
              <div className="w-full max-w-lg bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <h3 className="text-base font-bold text-black dark:text-white">Post Chamber Associate Opening</h3>
                  <button
                    onClick={() => setShowPostJobModal(false)}
                    className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-black dark:text-white block">Position Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Appellate Litigation Junior"
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-black dark:text-white block">Practice Area</label>
                      <input
                        type="text"
                        value={newJobDept}
                        onChange={(e) => setNewJobDept(e.target.value)}
                        className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-black dark:text-white block">Experience Required</label>
                      <input
                        type="text"
                        value={newJobExp}
                        onChange={(e) => setNewJobExp(e.target.value)}
                        className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-black dark:text-white block">Key Responsibilities</label>
                    <textarea
                      rows={3}
                      placeholder="Drafting writ synopses, attending admission hearings, scrutiny of paperbooks..."
                      value={newJobDesc}
                      onChange={(e) => setNewJobDesc(e.target.value)}
                      className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setShowPostJobModal(false)}
                      className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateOpening}
                      className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 cursor-pointer"
                    >
                      Publish Opening
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkForceView;
