"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Scale,
  Calculator,
  Percent,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  Sparkles,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Lock,
  Stamp,
  Award,
  Clock,
  Layers,
  Building2,
  FileBadge,
  TrendingUp,
  Receipt,
  AlertCircle,
  Gavel,
  BookOpen,
} from "lucide-react";
import {
  dueDiligenceApi,
  DueDiligenceAuditItem,
  DueDiligenceCheckpoint,
  PenaltyCalculatorResult,
} from "@/lib/dueDiligenceApi";
import { useTheme } from "@/context/ThemeContext";

interface StatutoryDueDiligenceViewProps {
  firmName?: string;
  csName?: string;
  caName?: string;
  initialAuditId?: string;
  defaultClient?: {
    name: string;
    cin: string;
    pan: string;
    gstin: string;
    turnover?: number;
    authorizedCapital?: number;
    paidUpCapital?: number;
  };
}

export function StatutoryDueDiligenceView({
  firmName = "Apex Corporate Secretarial & Tax Advisory LLP",
  csName = "CS Rajesh Sharma (FCS-8921, CP-10293)",
  caName = "CA Ramanathan Iyer (M.No 054921, FRN-018241N)",
  initialAuditId,
  defaultClient = {
    name: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    pan: "AAECS1234F",
    gstin: "07AAECS1234F1Z8",
    turnover: 485000000,
    authorizedCapital: 50000000,
    paidUpCapital: 25000000,
  },
}: StatutoryDueDiligenceViewProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(false);
  const [audits, setAudits] = useState<DueDiligenceAuditItem[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<DueDiligenceAuditItem | null>(null);

  // Pillar Tab Navigation
  const [activePillar, setActivePillar] = useState<
    "all" | "secretarial_mca" | "direct_tax" | "indirect_tax" | "labor_regulatory" | "penalties" | "compounding" | "red_flags"
  >("all");

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "compliant" | "minor_default" | "major_default">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals & Sliders
  const [penaltyModalOpen, setPenaltyModalOpen] = useState(false);
  const [compoundingModalOpen, setCompoundingModalOpen] = useState(false);
  const [certificatePrintModalOpen, setCertificatePrintModalOpen] = useState(false);

  // Penalty Calculator State
  const [calcParams, setCalcParams] = useState({
    mcaLateDays: 45,
    annualTurnover: 485000000,
    taxAuditDelay: false,
    underReportedIncome: 0,
    gstTaxDisputed: 0,
  });
  const [calcResult, setCalcResult] = useState<PenaltyCalculatorResult | null>(null);
  const [calculatingPenalty, setCalculatingPenalty] = useState(false);

  // Compounding Petition State
  const [petitionDraft, setPetitionDraft] = useState<string>("");
  const [generatingPetition, setGeneratingPetition] = useState(false);

  // Load Audits
  const loadAudits = async () => {
    setLoading(true);
    try {
      const res = await dueDiligenceApi.getAudits();
      if (res.success && res.audits.length > 0) {
        setAudits(res.audits);
        const match = initialAuditId
          ? res.audits.find((a) => a.id === initialAuditId || a.auditId === initialAuditId)
          : res.audits[0];
        setSelectedAudit(match || res.audits[0]);
      }
    } catch (err) {
      console.error("Error loading audits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, [initialAuditId]);

  // Handle Copy
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Format Currency
  const formatInr = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filtered Checkpoints
  const filteredCheckpoints = useMemo(() => {
    if (!selectedAudit || !selectedAudit.checkpoints) return [];
    return selectedAudit.checkpoints.filter((cp) => {
      // Category match
      if (activePillar !== "all" && activePillar !== "penalties" && activePillar !== "compounding" && activePillar !== "red_flags") {
        if (cp.category !== activePillar) return false;
      }
      // Status match
      if (statusFilter !== "all" && cp.status !== statusFilter) return false;
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = cp.title.toLowerCase().includes(query);
        const inSec = cp.statutorySection.toLowerCase().includes(query);
        const inObs = (cp.observation || "").toLowerCase().includes(query);
        const inId = cp.checkpointId.toLowerCase().includes(query);
        if (!inTitle && !inSec && !inObs && !inId) return false;
      }
      return true;
    });
  }, [selectedAudit, activePillar, statusFilter, searchQuery]);

  // Checkpoint Status Toggle / Remediation
  const handleToggleCheckpointStatus = async (checkpoint: DueDiligenceCheckpoint) => {
    if (!selectedAudit) return;
    const nextStatus = checkpoint.status === "compliant" ? "minor_default" : "compliant";
    try {
      const res = await dueDiligenceApi.updateCheckpoint(selectedAudit.auditId, {
        checkpointId: checkpoint.checkpointId,
        status: nextStatus,
        observation:
          nextStatus === "compliant"
            ? "Regularized & verified compliant during audit cycle."
            : checkpoint.observation,
      });
      if (res.success && res.audit) {
        setSelectedAudit(res.audit);
        setAudits((prev) => prev.map((a) => (a.auditId === res.audit.auditId ? res.audit : a)));
      }
    } catch (err) {
      console.error("Error updating checkpoint:", err);
    }
  };

  // Trigger Penalty Calculator
  const handleRunPenaltyCalculation = async () => {
    setCalculatingPenalty(true);
    try {
      const res = await dueDiligenceApi.calculatePenalties(calcParams);
      if (res.success && res.calculation) {
        setCalcResult(res.calculation);
      }
    } catch (err) {
      console.error("Error running penalty calculation:", err);
    } finally {
      setCalculatingPenalty(false);
    }
  };

  // Trigger Compounding Petition Generator
  const handleGeneratePetition = async () => {
    if (!selectedAudit) return;
    setGeneratingPetition(true);
    try {
      const res = await dueDiligenceApi.generateCompoundingPetition({
        companyName: selectedAudit.clientEntity.name,
        cin: selectedAudit.clientEntity.cin,
        sectionViolated: "Section 82 / Section 118(10)",
        natureOfDefault: "Technical delay in filing satisfaction of charge Form CHG-4 and SS-1 notice record",
        daysOfDelay: 45,
        estimatedPenalty: 25000,
      });
      if (res.success && res.petition) {
        setPetitionDraft(res.petition.draftText);
      }
    } catch (err) {
      console.error("Error generating petition:", err);
    } finally {
      setGeneratingPetition(false);
    }
  };

  // Handle Attestation
  const handleAttestAudit = async () => {
    if (!selectedAudit) return;
    try {
      const res = await dueDiligenceApi.attestAudit(selectedAudit.auditId, {
        csSigner: { name: "CS Rajesh Sharma", membershipNo: "FCS-8921", cpNumber: "CP-10293" },
        caSigner: { name: "CA Ramanathan Iyer", membershipNo: "401928", udin: "26401928DDAUDIT8921" },
      });
      if (res.success && res.audit) {
        setSelectedAudit(res.audit);
        setAudits((prev) => prev.map((a) => (a.auditId === res.audit.auditId ? res.audit : a)));
      }
    } catch (err) {
      console.error("Error attesting audit:", err);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* =========================================================================
          TOP BANNER: STATUTORY DUE DILIGENCE EXECUTIVE COMMAND CENTER
      ========================================================================= */}
      <div
        className="p-6 sm:p-7 rounded-3xl border-2 relative overflow-hidden shadow-sm"
        style={
          isDark
            ? { backgroundColor: "#09090b", borderColor: "#27272a", color: "#ffffff" }
            : { backgroundColor: "#ffffff", borderColor: "#e4e4e7", color: "#09090b" }
        }
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-[11px] font-mono font-black tracking-widest uppercase shadow-xs border"
                style={
                  isDark
                    ? { backgroundColor: "#ffffff", color: "#09090b", borderColor: "#ffffff" }
                    : { backgroundColor: "#09090b", color: "#ffffff", borderColor: "#09090b" }
                }
              >
                M&amp;A STATUTORY DUE DILIGENCE
              </span>
              <span
                className="px-3 py-1 rounded-full border text-[11px] font-mono font-bold flex items-center gap-1.5"
                style={
                  isDark
                    ? { backgroundColor: "#052e16", color: "#a7f3d0", borderColor: "#166534" }
                    : { backgroundColor: "#d1fae5", color: "#065f46", borderColor: "#6ee7b7" }
                }
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                100-Point Secretarial &amp; Tax Audit Matrix
              </span>
              <span
                className="px-3 py-1 rounded-full border text-[11px] font-mono font-bold"
                style={
                  isDark
                    ? { backgroundColor: "#1e1b4b", color: "#c7d2fe", borderColor: "#3730a3" }
                    : { backgroundColor: "#e0e7ff", color: "#3730a3", borderColor: "#a5b4fc" }
                }
              >
                Section 441 Compounding Engine
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2
                className="text-2xl sm:text-3xl font-black tracking-tight"
                style={{ color: isDark ? "#ffffff" : "#09090b" }}
              >
                {selectedAudit?.clientEntity.name || defaultClient.name}
              </h2>
              <span
                className="px-3 py-1 rounded-full text-xs font-mono font-extrabold border uppercase shadow-xs"
                style={
                  isDark
                    ? { backgroundColor: "#27272a", color: "#f4f4f5", borderColor: "#3f3f46" }
                    : { backgroundColor: "#f4f4f5", color: "#09090b", borderColor: "#d4d4d8" }
                }
              >
                {selectedAudit?.clientEntity.entityType?.replace("_", " ") || "PVT LTD"}
              </span>
            </div>

            <p
              className="text-xs sm:text-sm max-w-3xl leading-relaxed font-normal"
              style={{ color: isDark ? "#d4d4d8" : "#3f3f46" }}
            >
              Exhaustive statutory health scorecard benchmarking corporate charters, MCA21 statutory registers, board/general meetings (SS-1/SS-2), direct tax 3CD disallowances, 3-way revenue reconciliations, and labor code liabilities for acquisition readiness.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono pt-1">
              <span className="font-bold" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                CIN: <span style={{ color: isDark ? "#ffffff" : "#09090b" }}>{selectedAudit?.clientEntity.cin || defaultClient.cin}</span>
              </span>
              <span>•</span>
              <span className="font-bold" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                PAN: <span style={{ color: isDark ? "#ffffff" : "#09090b" }}>{selectedAudit?.clientEntity.pan || defaultClient.pan}</span>
              </span>
              <span>•</span>
              <span className="font-bold" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                AUDITED TURNOVER: <span style={{ color: isDark ? "#38bdf8" : "#0284c7" }}>{formatInr(selectedAudit?.clientEntity.annualTurnover || defaultClient.turnover || 485000000)}</span>
              </span>
            </div>
          </div>

          {/* Right Action Bar & Score Plaque */}
          <div className="flex flex-col sm:items-end gap-3.5">
            {/* Score Plaque */}
            <div
              className="p-4 rounded-2xl border flex items-center gap-4 shadow-sm"
              style={
                isDark
                  ? { backgroundColor: "#18181b", borderColor: "#27272a" }
                  : { backgroundColor: "#f4f4f5", borderColor: "#e4e4e7" }
              }
            >
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono font-bold block" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                  STATUTORY COMPLIANCE SCORE
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {selectedAudit?.overallScore || 92}/100
                </span>
                <span className="text-xs font-bold block" style={{ color: isDark ? "#d4d4d8" : "#3f3f46" }}>
                  {selectedAudit?.grade || "Grade A (Transaction Ready)"}
                </span>
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border-2"
                style={
                  (selectedAudit?.overallScore || 92) >= 85
                    ? { backgroundColor: "#d1fae5", color: "#065f46", borderColor: "#10b981" }
                    : { backgroundColor: "#fef3c7", color: "#92400e", borderColor: "#f59e0b" }
                }
              >
                {(selectedAudit?.overallScore || 92) >= 85 ? "A" : "B"}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setPenaltyModalOpen(true)}
                className="px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                style={
                  isDark
                    ? { backgroundColor: "#27272a", color: "#f4f4f5", borderColor: "#3f3f46" }
                    : { backgroundColor: "#f4f4f5", color: "#18181b", borderColor: "#d4d4d8" }
                }
                title="Simulate Statutory Exposure under Section 403 / 271B"
              >
                <Calculator className="w-3.5 h-3.5 text-amber-500" />
                <span>Penalty Calculator</span>
              </button>

              <button
                onClick={() => {
                  handleGeneratePetition();
                  setCompoundingModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                style={
                  isDark
                    ? { backgroundColor: "#27272a", color: "#f4f4f5", borderColor: "#3f3f46" }
                    : { backgroundColor: "#f4f4f5", color: "#18181b", borderColor: "#d4d4d8" }
                }
                title="Draft Section 441 Regional Director Compounding Petition"
              >
                <Gavel className="w-3.5 h-3.5 text-indigo-500" />
                <span>Sec 441 Compounding</span>
              </button>

              <button
                onClick={() => setCertificatePrintModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer border"
                style={
                  isDark
                    ? { backgroundColor: "#ffffff", color: "#09090b", borderColor: "#ffffff" }
                    : { backgroundColor: "#09090b", color: "#ffffff", borderColor: "#09090b" }
                }
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print M&amp;A Certificate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Audit Metrics Banner */}
        {selectedAudit && (
          <div
            className="p-4 rounded-2xl border grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs mt-5 font-mono"
            style={
              isDark
                ? { backgroundColor: "#18181b", borderColor: "#27272a" }
                : { backgroundColor: "#f4f4f5", borderColor: "#e4e4e7" }
            }
          >
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                AUDITED CHECKPOINTS
              </span>
              <span className="font-black text-sm" style={{ color: isDark ? "#ffffff" : "#09090b" }}>
                {selectedAudit.passedCheckpoints} / {selectedAudit.totalCheckpoints} Passed
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                DEFECTS / CURE LIST
              </span>
              <span className="font-black text-sm text-amber-600 dark:text-amber-400">
                {selectedAudit.failedCheckpoints} Regularizable Defaults
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                FINANCIAL EXPOSURE
              </span>
              <span className="font-black text-sm text-red-600 dark:text-red-400">
                {formatInr(selectedAudit.penaltyExposure?.totalCalculatedPenalty || 75000)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                MITIGATED EXPOSURE
              </span>
              <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                {formatInr(selectedAudit.penaltyExposure?.totalMitigatedPenalty || 25000)} (66% Saved)
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                COMPOUNDING FORUM
              </span>
              <span className="font-black text-sm" style={{ color: isDark ? "#ffffff" : "#09090b" }}>
                {selectedAudit.compoundingRoadmap?.competentAuthority || "Regional Director (RD)"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                DEAL READINESS
              </span>
              <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Clear For Signing
              </span>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          PILLAR TABS NAVIGATION (4 Pillars + Studio Modals)
      ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            {
              id: "all",
              label: "All 100 Checkpoints",
              icon: BookOpen,
              count: selectedAudit?.totalCheckpoints || 100,
            },
            {
              id: "secretarial_mca",
              label: "Secretarial & MCA (CS)",
              icon: Building2,
              count: 30,
            },
            {
              id: "direct_tax",
              label: "Direct Tax & 3CD (CA)",
              icon: Calculator,
              count: 25,
            },
            {
              id: "indirect_tax",
              label: "GSTN Harmonization",
              icon: Scale,
              count: 25,
            },
            {
              id: "labor_regulatory",
              label: "Labor, POSH & Dues",
              icon: Layers,
              count: 20,
            },
            {
              id: "red_flags",
              label: "M&A Red Flags (CP/CS)",
              icon: AlertTriangle,
              count: selectedAudit?.redFlags?.length || 3,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activePillar === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePillar(tab.id as any)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border"
                style={
                  isActive
                    ? isDark
                      ? { backgroundColor: "#ffffff", color: "#09090b", borderColor: "#ffffff" }
                      : { backgroundColor: "#09090b", color: "#ffffff", borderColor: "#09090b" }
                    : isDark
                    ? { backgroundColor: "#18181b", color: "#a1a1aa", borderColor: "#27272a" }
                    : { backgroundColor: "#ffffff", color: "#52525b", borderColor: "#e4e4e7" }
                }
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                <span
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                  style={
                    isActive
                      ? isDark
                        ? { backgroundColor: "#e4e4e7", color: "#09090b" }
                        : { backgroundColor: "#27272a", color: "#ffffff" }
                      : isDark
                      ? { backgroundColor: "#27272a", color: "#a1a1aa" }
                      : { backgroundColor: "#f4f4f5", color: "#71717a" }
                  }
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 100 checkpoints / sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-red-600 transition-all font-sans font-medium"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="compliant">Compliant (Passed)</option>
            <option value="minor_default">Minor Defaults (Cure)</option>
            <option value="major_default">Major Defaults</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          VIEW: RED FLAGS & M&A TRANSACTION CONDITIONS MATRIX
      ========================================================================= */}
      {activePillar === "red_flags" && (
        <div className="space-y-4">
          <div
            className="p-5 rounded-2xl border flex items-center justify-between"
            style={
              isDark
                ? { backgroundColor: "#18181b", borderColor: "#27272a" }
                : { backgroundColor: "#f4f4f5", borderColor: "#e4e4e7" }
            }
          >
            <div>
              <h3 className="font-black text-sm" style={{ color: isDark ? "#ffffff" : "#09090b" }}>
                M&amp;A Deal-Breaker &amp; Condition Precedent (CP) Matrix
              </h3>
              <p className="text-xs" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
                Identified regulatory vulnerabilities categorized into closing conditions and indemnity escrow provisions.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
              3 Key Transaction Action Items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedAudit?.redFlags.map((flag) => (
              <div
                key={flag.flagId}
                className="p-5 rounded-2xl border space-y-3 relative shadow-xs"
                style={
                  isDark
                    ? { backgroundColor: "#09090b", borderColor: "#27272a", color: "#ffffff" }
                    : { backgroundColor: "#ffffff", borderColor: "#e4e4e7", color: "#09090b" }
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase"
                    style={
                      flag.severity === "critical_deal_breaker"
                        ? { backgroundColor: "#fee2e2", color: "#991b1b" }
                        : flag.severity === "high_indemnity"
                        ? { backgroundColor: "#ffedd5", color: "#9a3412" }
                        : { backgroundColor: "#fef3c7", color: "#92400e" }
                    }
                  >
                    {flag.severity.replace("_", " ")}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                    {flag.closingCondition.replace("_", " ")}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm leading-snug">{flag.title}</h4>
                  <div className="text-[11px] font-mono font-bold" style={{ color: isDark ? "#38bdf8" : "#0284c7" }}>
                    {flag.statutoryProvision}
                  </div>
                </div>

                <p className="text-xs leading-relaxed" style={{ color: isDark ? "#d4d4d8" : "#52525b" }}>
                  {flag.impactDescription}
                </p>

                <div
                  className="p-3 rounded-xl border text-xs space-y-1"
                  style={
                    isDark
                      ? { backgroundColor: "#18181b", borderColor: "#27272a" }
                      : { backgroundColor: "#f4f4f5", borderColor: "#e4e4e7" }
                  }
                >
                  <span className="text-[10px] font-mono font-bold uppercase block text-emerald-600 dark:text-emerald-400">
                    Recommended Mitigation Strategy:
                  </span>
                  <p className="leading-snug">{flag.mitigationStrategy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          CHECKPOINTS TABLE / AUDIT LIST (100 Checks)
      ========================================================================= */}
      {activePillar !== "red_flags" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
              Displaying {filteredCheckpoints.length} Statutory Checkpoints:
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              Click status pill to toggle remediation status
            </span>
          </div>

          <div className="space-y-2.5">
            {filteredCheckpoints.map((cp) => (
              <div
                key={cp.checkpointId}
                className="p-4 rounded-2xl border transition-all space-y-2 shadow-xs"
                style={
                  isDark
                    ? { backgroundColor: "#09090b", borderColor: "#27272a", color: "#ffffff" }
                    : { backgroundColor: "#ffffff", borderColor: "#e4e4e7", color: "#09090b" }
                }
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-black"
                      style={
                        isDark
                          ? { backgroundColor: "#27272a", color: "#ffffff" }
                          : { backgroundColor: "#f4f4f5", color: "#09090b" }
                      }
                    >
                      {cp.checkpointId}
                    </span>
                    <h4 className="font-extrabold text-sm tracking-tight">{cp.title}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold" style={{ color: isDark ? "#38bdf8" : "#0284c7" }}>
                      {cp.statutorySection}
                    </span>
                    <button
                      onClick={() => handleToggleCheckpointStatus(cp)}
                      className="px-3 py-1 rounded-full text-xs font-mono font-black uppercase cursor-pointer border transition-all flex items-center gap-1 shadow-xs"
                      style={
                        cp.status === "compliant"
                          ? { backgroundColor: "#d1fae5", color: "#065f46", borderColor: "#6ee7b7" }
                          : cp.status === "minor_default"
                          ? { backgroundColor: "#fef3c7", color: "#92400e", borderColor: "#fcd34d" }
                          : { backgroundColor: "#fee2e2", color: "#991b1b", borderColor: "#fca5a5" }
                      }
                      title="Click to toggle compliance status"
                    >
                      {cp.status === "compliant" ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Compliant</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{cp.status.replace("_", " ")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Observation & Remediation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div
                    className="p-2.5 rounded-xl border space-y-0.5"
                    style={
                      isDark
                        ? { backgroundColor: "#18181b", borderColor: "#27272a" }
                        : { backgroundColor: "#f4f4f5", borderColor: "#e4e4e7" }
                    }
                  >
                    <span className="text-[10px] font-mono font-bold uppercase block" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                      Audit Observation &amp; Evidence:
                    </span>
                    <p className="leading-relaxed" style={{ color: isDark ? "#ffffff" : "#09090b" }}>
                      {cp.observation}
                    </p>
                    {cp.evidenceDocument && (
                      <span className="text-[10px] font-mono font-bold block pt-1" style={{ color: isDark ? "#38bdf8" : "#0284c7" }}>
                        Doc: {cp.evidenceDocument}
                      </span>
                    )}
                  </div>

                  <div
                    className="p-2.5 rounded-xl border space-y-0.5"
                    style={
                      isDark
                        ? { backgroundColor: "#18181b", borderColor: "#27272a" }
                        : { backgroundColor: "#f4f4f5", borderColor: "#e4e4e7" }
                    }
                  >
                    <span className="text-[10px] font-mono font-bold uppercase block text-emerald-600 dark:text-emerald-400">
                      Recommended Remedial Action:
                    </span>
                    <p className="leading-relaxed" style={{ color: isDark ? "#d4d4d8" : "#52525b" }}>
                      {cp.remedialAction || "None required. Statutory compliance verified."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: STATUTORY PENALTY EXPOSURE CALCULATOR
      ========================================================================= */}
      {penaltyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in">
          <div
            className="w-full max-w-3xl rounded-3xl border p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto"
            style={
              isDark
                ? { backgroundColor: "#09090b", borderColor: "#27272a", color: "#ffffff" }
                : { backgroundColor: "#ffffff", borderColor: "#e4e4e7", color: "#09090b" }
            }
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Calculator className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-black">Statutory Financial Penalty &amp; Exposure Calculator</h3>
                  <p className="text-xs font-mono" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                    Section 403 MCA21 • Section 271B IT Act • Section 270A • Section 122 CGST
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPenaltyModalOpen(false)}
                className="p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Inputs Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="font-bold block">MCA21 Filing Delay (Days):</label>
                <input
                  type="number"
                  value={calcParams.mcaLateDays}
                  onChange={(e) => setCalcParams({ ...calcParams, mcaLateDays: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 font-bold"
                />
                <span className="text-[10px] text-zinc-500">₹100/day under Section 403</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold block">Annual Gross Turnover (₹):</label>
                <input
                  type="number"
                  value={calcParams.annualTurnover}
                  onChange={(e) => setCalcParams({ ...calcParams, annualTurnover: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 font-bold"
                />
                <span className="text-[10px] text-zinc-500">Section 271B applies 0.5% cap at ₹1,50,000</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold block">Tax Audit Delay Default?</label>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setCalcParams({ ...calcParams, taxAuditDelay: true })}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                      calcParams.taxAuditDelay ? "bg-red-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"
                    }`}
                  >
                    Yes (Delayed)
                  </button>
                  <button
                    onClick={() => setCalcParams({ ...calcParams, taxAuditDelay: false })}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                      !calcParams.taxAuditDelay ? "bg-emerald-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"
                    }`}
                  >
                    No (On Time)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold block">Under-Reported Taxable Income (₹):</label>
                <input
                  type="number"
                  value={calcParams.underReportedIncome}
                  onChange={(e) => setCalcParams({ ...calcParams, underReportedIncome: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 font-bold"
                />
                <span className="text-[10px] text-zinc-500">Section 270A applies 50% penalty on tax</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleRunPenaltyCalculation}
                disabled={calculatingPenalty}
                className="px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs cursor-pointer flex items-center gap-2 shadow-md"
              >
                <Calculator className="w-4 h-4" />
                <span>{calculatingPenalty ? "Computing..." : "Calculate Statutory Liability"}</span>
              </button>
            </div>

            {/* Results Display */}
            {calcResult && (
              <div
                className="p-5 rounded-2xl border space-y-3 font-mono text-xs"
                style={
                  isDark
                    ? { backgroundColor: "#18181b", borderColor: "#27272a" }
                    : { backgroundColor: "#f4f4f5", borderColor: "#e4e4e7" }
                }
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">MCA Section 403 Additional Fees:</span>
                    <span className="font-black text-sm">{formatInr(calcResult.mcaSection403.total)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Income Tax Section 271B:</span>
                    <span className="font-black text-sm">{formatInr(calcResult.section271B.total)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Section 270A Under-Reporting:</span>
                    <span className="font-black text-sm">{formatInr(calcResult.section270A.total)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Maximum Exposure:</span>
                    <span className="font-black text-sm text-red-600 dark:text-red-400">
                      {formatInr(calcResult.totalMaximumExposure)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <span className="font-bold">Proactive Mitigated Exposure (via Sec 273B &amp; Sec 441):</span>
                  <span className="font-black text-base text-emerald-600 dark:text-emerald-400">
                    {formatInr(calcResult.mitigatedExposure)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: SECTION 441 REGIONAL DIRECTOR COMPOUNDING PETITION DRAFTER
      ========================================================================= */}
      {compoundingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in">
          <div
            className="w-full max-w-4xl rounded-3xl border p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto"
            style={
              isDark
                ? { backgroundColor: "#09090b", borderColor: "#27272a", color: "#ffffff" }
                : { backgroundColor: "#ffffff", borderColor: "#e4e4e7", color: "#09090b" }
            }
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Gavel className="w-5 h-5 text-indigo-500" />
                <div>
                  <h3 className="text-base font-black">Section 441 Regional Director Compounding Petition Studio</h3>
                  <p className="text-xs font-mono" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                    Automatic Jurisdiction Router (RD ≤ ₹25 Lakhs) &amp; Precedent Drafting Engine
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCompoundingModalOpen(false)}
                className="p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div
              className="p-4 rounded-2xl border text-xs font-mono space-y-2"
              style={
                isDark
                  ? { backgroundColor: "#18181b", borderColor: "#27272a" }
                  : { backgroundColor: "#f4f4f5", borderColor: "#e4e4e7" }
              }
            >
              <div className="flex justify-between items-center">
                <span className="font-bold">Statutory Forum Jurisdiction:</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-800">
                  Regional Director (RD), Northern Region, New Delhi
                </span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
                Aggregate potential penalty is under ₹25 Lakhs per Section 441(1)(b). No referral to National Company Law Tribunal (NCLT) bench required, allowing 60-day rapid closure.
              </p>
            </div>

            {/* Petition Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold">Generated Form GNL-1 Compounding Application:</span>
                <button
                  onClick={() => handleCopy(petitionDraft, "copy-petition")}
                  className="hover:text-red-600 cursor-pointer flex items-center gap-1 font-bold"
                >
                  {copiedId === "copy-petition" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === "copy-petition" ? "Copied!" : "Copy Petition Text"}</span>
                </button>
              </div>
              <textarea
                rows={16}
                value={petitionDraft}
                onChange={(e) => setPetitionDraft(e.target.value)}
                className="w-full p-4 rounded-2xl border font-mono text-xs leading-relaxed bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCompoundingModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-extrabold cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print Formal Petition</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: EXECUTIVE M&A DUE DILIGENCE AUDIT CERTIFICATE (Printable)
      ========================================================================= */}
      {certificatePrintModalOpen && selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in">
          <div
            className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border p-6 sm:p-8 space-y-6 shadow-2xl"
            style={
              isDark
                ? { backgroundColor: "#09090b", borderColor: "#27272a", color: "#ffffff" }
                : { backgroundColor: "#ffffff", borderColor: "#e4e4e7", color: "#09090b" }
            }
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <FileBadge className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="text-base font-black">Executive Statutory Due Diligence Audit Certificate</h3>
                  <p className="text-xs font-mono" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                    Prepared for Board of Directors, Private Equity Investors &amp; Acquisition Counsel
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCertificatePrintModalOpen(false)}
                className="p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Certificate Printable Surface */}
            <div
              className="p-8 rounded-2xl border-2 space-y-6 font-serif"
              style={
                isDark
                  ? { backgroundColor: "#18181b", borderColor: "#27272a" }
                  : { backgroundColor: "#ffffff", borderColor: "#18181b" }
              }
            >
              <div className="text-center space-y-1.5 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold block">
                  CONFIDENTIAL EXECUTIVE STATUTORY COMPLIANCE REPORT
                </span>
                <h2 className="text-2xl font-black">{selectedAudit.clientEntity.name}</h2>
                <div className="text-xs font-mono text-zinc-500">
                  CIN: {selectedAudit.clientEntity.cin} • PAN: {selectedAudit.clientEntity.pan} • GSTIN: {selectedAudit.clientEntity.gstin}
                </div>
                <div className="text-sm font-bold text-emerald-600 pt-1">
                  Overall Health Score: {selectedAudit.overallScore}/100 ({selectedAudit.grade})
                </div>
              </div>

              <div className="text-xs leading-relaxed space-y-3 font-sans">
                <p>
                  We, the undersigned Practicing Company Secretary and Chartered Accountant, have conducted a comprehensive 100-point Statutory Due Diligence Audit of <strong>{selectedAudit.clientEntity.name}</strong> covering Secretarial Charters, MCA21 Portals, CBDT Direct Tax Assessments, GSTN Reconciliations, and Labor Law standards for the period ending FY 2025-26.
                </p>
                <p>
                  Based on our examination of statutory registers, electronic returns, and bank acknowledgments, we certify that the company has maintained substantial statutory compliance with zero material undisclosed liabilities, no pending winding up or Section 206 inspections, and all identified venial defaults are compoundable before the Regional Director Northern Region under Section 441.
                </p>
              </div>

              {/* Dual Attestation Plaque */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 font-mono text-xs">
                <div
                  className="p-4 rounded-xl border space-y-1.5"
                  style={
                    isDark
                      ? { backgroundColor: "#27272a", borderColor: "#3f3f46" }
                      : { backgroundColor: "#f4f4f5", borderColor: "#e4e4e7" }
                  }
                >
                  <span className="font-bold text-xs block text-black dark:text-white">
                    COMPANY SECRETARY ATTESTATION
                  </span>
                  <div>{selectedAudit.attestation.leadCs.name}</div>
                  <div className="text-[11px] text-zinc-500">{selectedAudit.attestation.leadCs.membershipNo} • {selectedAudit.attestation.leadCs.cpNumber}</div>
                  <div className="text-[10px] text-emerald-600 font-bold">✓ Class 3 FCS DSC Authenticated</div>
                </div>

                <div
                  className="p-4 rounded-xl border space-y-1.5"
                  style={
                    isDark
                      ? { backgroundColor: "#27272a", borderColor: "#3f3f46" }
                      : { backgroundColor: "#f4f4f5", borderColor: "#e4e4e7" }
                  }
                >
                  <span className="font-bold text-xs block text-black dark:text-white">
                    CHARTERED ACCOUNTANT ATTESTATION
                  </span>
                  <div>{selectedAudit.attestation.leadCa.name}</div>
                  <div className="text-[11px] text-zinc-500">M.No: {selectedAudit.attestation.leadCa.membershipNo} • FRN: {selectedAudit.attestation.leadCa.firmRegNo}</div>
                  <div className="text-[10px] text-red-600 font-bold">ICAI UDIN: {selectedAudit.attestation.leadCa.udin}</div>
                </div>
              </div>

              <div className="text-[10px] font-mono text-zinc-500 flex justify-between pt-2">
                <span>Cryptographic Digest: {selectedAudit.attestation.integrityHash?.substring(0, 32)}...</span>
                <span>Date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCertificatePrintModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-extrabold cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatutoryDueDiligenceView;
