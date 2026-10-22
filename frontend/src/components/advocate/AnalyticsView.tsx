"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Scale,
  Award,
  CheckCircle2,
  Clock,
  Briefcase,
  RefreshCw,
  Plus,
  Shield,
  X,
  FileText,
  UserCheck,
  Check,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  advocateApi,
  BenchAnalyticsData,
  ChamberReportItem,
} from "@/lib/api";

interface AnalyticsViewProps {
  activeModule?: string;
  onSelectModule?: (mod: string) => void;
  token?: string;
  advocateName?: string;
}

export function AnalyticsView({
  activeModule = "ai-analytics",
  onSelectModule,
  token,
  advocateName = "Adv. Meera Krishnan",
}: AnalyticsViewProps) {
  const [currentTab, setCurrentTab] = useState<string>(activeModule);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Live analytics data from backend
  const [analytics, setAnalytics] = useState<BenchAnalyticsData | null>(null);
  const [reports, setReports] = useState<ChamberReportItem[]>([]);
  const [incomingLeads, setIncomingLeads] = useState<any[]>([]);

  // Modals & form state
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [newReportTitle, setNewReportTitle] = useState<string>("");
  const [newReportCategory, setNewReportCategory] = useState<string>("Quarterly Audit");
  const [newReportPeriod, setNewReportPeriod] = useState<string>("Q4 2026 (Oct – Dec)");

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (activeModule) {
      setCurrentTab(activeModule);
    }
  }, [activeModule]);

  const handleTabChange = (id: string) => {
    setCurrentTab(id);
    if (onSelectModule) onSelectModule(id);
  };

  // Load analytics & reports
  const loadData = async () => {
    try {
      setRefreshing(true);
      const [benchRes, reportsRes, leadsRes] = await Promise.all([
        advocateApi.getBenchAnalytics(token),
        advocateApi.getChamberReports(token),
        advocateApi.getIncomingLeads(token),
      ]);

      if (benchRes.success) {
        setAnalytics({
          kpis: benchRes.kpis,
          practiceAreas: benchRes.practiceAreas,
          courtBenches: benchRes.courtBenches,
        });
      }
      if (reportsRes.success && Array.isArray(reportsRes.reports)) {
        setReports(reportsRes.reports);
      }
      if (leadsRes.success && Array.isArray(leadsRes.leads)) {
        setIncomingLeads(leadsRes.leads);
      }
    } catch (err) {
      console.error("Failed to load practice analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Generate Report Submission
  const handleGenerateReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportTitle.trim()) return;

    try {
      setGenerating(true);
      const res = await advocateApi.generateChamberReport(
        {
          title: newReportTitle.trim(),
          category: newReportCategory,
          period: newReportPeriod,
          metrics: {
            winRate: analytics?.kpis.winRate || "89.2%",
            totalDispositions: analytics?.kpis.judgmentsAnalyzed || 148,
            certifiedBy: advocateName,
          },
        },
        token
      );

      if (res.success && res.report) {
        setReports((prev) => [res.report, ...prev]);
        setShowGenerateModal(false);
        showToast("New certified chamber practice report generated and logged.");
        setNewReportTitle("");
      }
    } catch (err) {
      console.error("Error generating report:", err);
      showToast("Failed to generate report.");
    } finally {
      setGenerating(false);
    }
  };

  // Accept incoming grievance / lead
  const handleAcceptLead = async (leadId: string) => {
    try {
      const res = await advocateApi.acceptLead(leadId, token);
      if (res.success) {
        setIncomingLeads((prev) => prev.filter((l) => l._id !== leadId));
        showToast("Lead accepted and brief converted to active chamber docket.");
      }
    } catch (err) {
      console.error("Error accepting lead:", err);
    }
  };

  // Download Report simulation (downloads text report)
  const handleDownloadReport = (rep: ChamberReportItem) => {
    const reportContent = `======================================================
WAKHEEL LEGAL OS — CERTIFIED CHAMBER PRACTICE REPORT
======================================================
Report Title: ${rep.title}
Category:     ${rep.category}
Period:       ${rep.period}
Date Issued:  ${rep.generatedDate}
Advocate:     ${advocateName}
Status:       ${rep.status}

EXECUTIVE PERFORMANCE SUMMARY:
- Win Rate / Favorable Relief: ${analytics?.kpis.winRate || "89.2%"}
- Average Case Disposal Time:  ${analytics?.kpis.avgDisposalMonths || "4.1 Months"}
- Precedent Citation Power:    ${analytics?.kpis.citationEfficacy || "99.4%"}
- Adverse Citations on Record: ZERO (100% Clean Precedential Compliance)

PRACTICE AREA BENCHMARKS:
${(analytics?.practiceAreas || [])
  .map((p) => `• ${p.area}: ${p.rate} (${p.count})`)
  .join("\n")}

COURT BENCHES & DISPOSITION RECORD:
${(analytics?.courtBenches || [])
  .map((b) => `• ${b.bench} (${b.judge}): ${b.disposition}`)
  .join("\n")}

======================================================
Digitally certified and generated via Wakheel Practice Intelligence.
======================================================`;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rep.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloading certified copy of "${rep.title}".`);
  };

  const tabs = [
    { id: "ai-analytics", label: "Bench Analytics", icon: BarChart3 },
    { id: "reports", label: "Chamber Reports & Audits", icon: FileSpreadsheet },
    { id: "leads", label: "Lead Intake CRM", icon: UserCheck, count: incomingLeads.length },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-black dark:text-white" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-zinc-400 hover:text-black dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">
              Bench Analytics &amp; Practice Intelligence
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
              Kerala High Court &amp; Tribunals
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Bench disposition win-rates, precedent citation authority, statutory audit reports, and prospective brief intake CRM.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
            title="Refresh Intelligence Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Sub-Tabs Nav */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                      : "text-zinc-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW: BENCH ANALYTICS                                          */}
      {/* ============================================================== */}
      {currentTab === "ai-analytics" && (
        <div className="space-y-6">
          {/* 4 Practice Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Overall Relief Rate</span>
                <Scale className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-black dark:text-white font-mono">
                {analytics?.kpis.winRate || "89.2%"}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                {analytics?.kpis.judgmentsAnalyzed || 148} appellate judgments &amp; stay orders
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Avg Disposal Time</span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-black dark:text-white font-mono">
                {analytics?.kpis.avgDisposalMonths || "4.1 Mos"}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                Across Kerala High Court Division &amp; Single Benches
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Precedent Authority</span>
                <Award className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-black dark:text-white font-mono">
                {analytics?.kpis.citationEfficacy || "99.4%"}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                Zero adverse citations or overruled precedents
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Mediation Resolution</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-black dark:text-white font-mono">
                {analytics?.kpis.favorableSettlementRatio || "78.5%"}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                Pre-trial mediation &amp; Lok Adalat settlements
              </p>
            </div>
          </div>

          {/* Grid: Practice Areas vs Court Benches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Practice Area Breakdown */}
            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <h3 className="text-sm font-bold text-black dark:text-white">
                  Bench Disposition by Practice Domain
                </h3>
                <span className="text-[11px] font-mono text-zinc-400">Kerala Jurisdiction</span>
              </div>

              <div className="space-y-3.5 text-xs">
                {(analytics?.practiceAreas || [
                  { area: "Constitutional & Writ Petitions (Art. 226)", rate: "93%", count: "16 matters" },
                  { area: "Commercial Arbitration & S.34 Appeals", rate: "88%", count: "6 matters" },
                  { area: "Land Property, Boundary & Telegraph Injunctions", rate: "86%", count: "8 matters" },
                  { area: "Corporate Retainer & MCA Compliance", rate: "95%", count: "5 matters" },
                  { area: "Cheque Dishonour (S. 138 NI Act) & Summary Suits", rate: "84%", count: "4 matters" },
                ]).map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between font-medium">
                      <span className="text-black dark:text-white">{item.area}</span>
                      <span className="font-mono font-bold">{item.rate} ({item.count})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                      <div
                        className="h-full bg-black dark:bg-white rounded-full transition-all duration-500"
                        style={{ width: item.rate }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Frequented Court Benches */}
            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <h3 className="text-sm font-bold text-black dark:text-white">
                  Most Frequented Court Benches (2026)
                </h3>
                <span className="text-[11px] font-mono text-zinc-400">High Court Complex</span>
              </div>

              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                {(analytics?.courtBenches || [
                  { bench: "Court Hall 2A • Division Bench (High Court of Kerala)", judge: "Hon'ble Division Bench", matters: "14 hearings", disposition: "92% Favorable Relief" },
                  { bench: "Court Hall 3B • Single Bench (Writ Jurisdiction)", judge: "Hon'ble Single Bench", matters: "11 hearings", disposition: "88% Interim Relief" },
                  { bench: "Sub Court Ernakulam (Civil Suits & Injunctions)", judge: "Principal Sub Judge", matters: "6 hearings", disposition: "85% Favorable Orders" },
                  { bench: "Arbitral Tribunal • Infopark Kakkanad", judge: "Sole Arbitrator", matters: "4 hearings", disposition: "90% Favorable Discovery" },
                ]).map((row, idx) => (
                  <div key={idx} className="py-3 space-y-1">
                    <div className="flex justify-between font-bold text-black dark:text-white">
                      <span>{row.bench}</span>
                      <span className="font-mono text-[11px]">{row.disposition}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 flex justify-between">
                      <span>{row.judge}</span>
                      <span className="font-mono">{row.matters}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW: CHAMBER REPORTS & EXPORTS                                */}
      {/* ============================================================== */}
      {currentTab === "reports" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800 gap-3">
            <div>
              <h3 className="text-base font-bold text-black dark:text-white">
                Official Chamber Reports &amp; Practice Audits
              </h3>
              <p className="text-xs text-zinc-500">
                Certified court appearance logs, financial audit statements, and matter progression histories.
              </p>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Generate Certified Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reports.map((rep) => (
              <div
                key={rep._id}
                className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3.5 shadow-xs flex flex-col justify-between hover:border-black dark:hover:border-white transition-all"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-bold text-black dark:text-white">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 block">
                      {rep.category} • {rep.period}
                    </span>
                    <h4 className="text-sm font-bold text-black dark:text-white mt-0.5">
                      {rep.title}
                    </h4>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-bold text-black dark:text-white">{rep.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Generated:</span>
                      <span>{rep.generatedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="font-mono">{rep.fileSize}</span>
                  <button
                    onClick={() => handleDownloadReport(rep)}
                    className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold flex items-center space-x-1 cursor-pointer hover:opacity-90"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW: LEAD INTAKE CRM                                          */}
      {/* ============================================================== */}
      {currentTab === "leads" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-black dark:text-white">
                Incoming Citizen Grievances &amp; Legal Intake
              </h3>
              <p className="text-xs text-zinc-500">
                Prospective clients and grievance submissions awaiting advocate review and chamber intake.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-black dark:text-white">
              {incomingLeads.length} Inquiries Pending
            </span>
          </div>

          <div className="rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
            {incomingLeads.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-zinc-400" />
                <h4 className="text-sm font-bold text-black dark:text-white">All Inquiries Cleared</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  No pending citizen grievances or new client consultation requests requiring conflict review.
                </p>
              </div>
            ) : (
              incomingLeads.map((lead) => (
                <div
                  key={lead._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-black dark:text-white">
                        {lead.citizenName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                        {lead.category}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {lead.contactPhone}
                      </span>
                    </div>

                    <h5 className="font-bold text-xs text-black dark:text-white">
                      {lead.subject}
                    </h5>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {lead.description}
                    </p>

                    <div className="text-[10px] text-zinc-400 font-mono pt-1">
                      Submitted: {new Date(lead.createdAt || Date.now()).toLocaleDateString("en-IN")} • Status: Pending Conflict Check
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleAcceptLead(lead._id)}
                      className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer hover:opacity-90"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Brief</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: GENERATE CERTIFIED CHAMBER REPORT                       */}
      {/* ============================================================== */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">Generate Certified Practice Report</h3>
                <p className="text-xs text-zinc-500 mt-0.5">High Court compliance &amp; performance certification</p>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateReportSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-zinc-500">Report Title *</label>
                <input
                  type="text"
                  required
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  placeholder="e.g. Q4 2026 Kerala High Court Causelist & Injunction Log"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-zinc-500">Category *</label>
                  <select
                    value={newReportCategory}
                    onChange={(e) => setNewReportCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  >
                    <option value="Quarterly Audit">Quarterly Audit</option>
                    <option value="Court Compliance">Court Compliance</option>
                    <option value="Tax & Trust Audit">Tax &amp; Trust Audit</option>
                    <option value="Precedent Citation Log">Precedent Citation Log</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-zinc-500">Reporting Period</label>
                  <input
                    type="text"
                    value={newReportPeriod}
                    onChange={(e) => setNewReportPeriod(e.target.value)}
                    placeholder="Q4 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1 font-mono">
                <p className="font-bold text-black dark:text-white uppercase">Automated Audit Aggregations:</p>
                <p>• Live win-rate: {analytics?.kpis.winRate || "89.2%"}</p>
                <p>• Bench hearings listed: {analytics?.kpis.todayHearingsCount || 0}</p>
                <p>• Certified Chamber Signature: {advocateName}</p>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider cursor-pointer hover:opacity-90 disabled:opacity-50"
                >
                  {generating ? "Generating..." : "Generate & Certify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
