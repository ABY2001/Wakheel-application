"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck,
  AlertTriangle,
  Scale,
  Sparkles,
  Printer,
  Copy,
  Check,
  Info,
  Shield,
  Lock,
  ArrowRight,
  RefreshCw,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Edit3,
} from "lucide-react";
import { copilotApi, advocateApi } from "@/lib/api";

interface ContractIntelligenceViewProps {
  currentMatter?: string;
  advocateName?: string;
  barCouncilNumber?: string;
  token?: string;
  onNavigateTab?: (tabId: string) => void;
}

interface AuditedClause {
  id: string;
  clauseNumber: string;
  clauseName: string;
  category: string;
  originalText: string;
  riskLevel: string;
  riskScore: number;
  status: string;
  statuteRef: string;
  landmarkPrecedent: string;
  legalExplanation: string;
  counselRedline: string;
  actionRequired: string;
}

interface AuditReport {
  contractTitle: string;
  parties: string;
  overallRiskScore: number;
  riskLevel: string;
  totalClausesAudited: number;
  criticalRedFlags: number;
  highRisks: number;
  mediumWarnings: number;
  clauses: AuditedClause[];
  statutesCovered: string[];
  executiveSummary: string;
}

export const ContractIntelligenceView: React.FC<ContractIntelligenceViewProps> = ({
  currentMatter = "ARB/NCLT/KOCHI/2024/041 - Malabar Infotech Solutions",
  advocateName = "Adv. Meera Krishnan",
  barCouncilNumber = "K/1429/2016",
  token = "advocate_token",
  onNavigateTab,
}) => {
  // State: Selected template & contract text
  const [selectedAgreementType, setSelectedAgreementType] = useState<string>("commercial_msa");
  const [contractText, setContractText] = useState<string>("");
  const [filterSeverity, setFilterSeverity] = useState<"all" | "critical" | "high_medium">("all");

  // State: Audit result & loading
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [appliedRedlines, setAppliedRedlines] = useState<Record<string, boolean>>({});

  // State: AI Negotiator / Redline Assistant
  const [selectedClauseForAi, setSelectedClauseForAi] = useState<AuditedClause | null>(null);
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>("");
  const [isRedliningAi, setIsRedliningAi] = useState<boolean>(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [vaultPushed, setVaultPushed] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Initial Contract Audit
  const runContractAudit = async (type = selectedAgreementType, customText = contractText) => {
    setIsAuditing(true);
    try {
      const res = await copilotApi.auditContract({
        contractType: type,
        contractText: customText,
      });

      if (res && res.success) {
        setAuditReport(res);
        if (!customText) {
          // Re-populate with sample text if empty
          if (type === "commercial_msa") {
            setContractText(
              `MASTER SERVICES AGREEMENT\n\nExecuted at Ernakulam.\n\nCLAUSE 8. LIMITATION OF LIABILITY & INDEMNIFICATION\n8.1 The Vendor agrees to unconditionally defend, indemnify, and hold harmless the Client against any and all claims, actions, damages, liabilities, losses, and penalties arising from breach of this Agreement without any financial ceiling or limitation of amount.\n\nCLAUSE 12. NON-COMPETE & POST-TERMINATION RESTRAINT\n12.1 The Vendor covenants that for a period of twenty-four (24) months following termination, the Vendor shall not directly or indirectly provide identical software consulting services anywhere within India.\n\nCLAUSE 15. TERMINATION FOR CONVENIENCE\n15.1 The Client reserves the unilateral right to terminate this Agreement at any time with immediate effect without cause. The Vendor shall have no right of termination for convenience.\n\nCLAUSE 18. DISPUTE RESOLUTION & ARBITRATION\n18.1 All disputes shall be referred to the sole arbitration of an arbitrator appointed unilaterally and exclusively by the Managing Director of the Client.\n\nCLAUSE 21. TRUNCATION OF LEGAL CLAIMS\n21.1 Any claim or dispute must be formally instituted before court or arbitrator within six (6) months of occurrence, failing which all claims shall be permanently waived and barred.\n\nCLAUSE 24. DELAY & LIQUIDATED DAMAGES\n24.1 In the event of service delay, the Vendor shall pay liquidated damages of ₹1,00,000/- per day irrespective of actual loss.`
            );
          } else {
            setContractText(
              `COMMERCIAL LEASE DEED\n\nMarine Drive Complex, Ernakulam.\n\nCLAUSE 6. SECURITY DEPOSIT FORFEITURE\n6.1 In the event of the Lessee vacating prior to 36 months, the entire security deposit of ₹25,00,000/- shall stand forfeited without proof of actual loss.\n\nCLAUSE 11. UNILATERAL RENT ESCALATION\n11.1 The Lessor reserves the absolute right to increase rent by up to 20% at its sole discretion upon 7 days notice.\n\nCLAUSE 14. ARBITRATION\n14.1 Any dispute shall be arbitrated by a sole arbitrator nominated exclusively by the Lessor's Advisory Board.`
            );
          }
        }
        showToast("Contract Risk Audit completed with statutory concordance.");
      }
    } catch (err: any) {
      console.error("Contract audit failed:", err);
      showToast("Audit failed: " + (err?.message || "Check network"));
    } finally {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    runContractAudit("commercial_msa");
  }, []);

  // 2. Apply Counsel Redline to Contract Text
  const handleApplyRedline = (clause: AuditedClause) => {
    if (!contractText) return;

    let updated = contractText;
    if (updated.includes(clause.originalText)) {
      updated = updated.replace(
        clause.originalText,
        `[COUNSEL REDLINE - ${clause.statuteRef.split(",")[0]}]:\n${clause.counselRedline}`
      );
      setContractText(updated);
      setAppliedRedlines((prev) => ({ ...prev, [clause.id]: true }));
      showToast(`Applied statutory redline to ${clause.clauseNumber}.`);
    } else {
      // Append if exact phrase wasn't found
      setContractText((prev) => `${prev}\n\n[COUNSEL AMENDMENT - ${clause.clauseNumber}]:\n${clause.counselRedline}`);
      setAppliedRedlines((prev) => ({ ...prev, [clause.id]: true }));
      showToast(`Appended amendment for ${clause.clauseNumber}.`);
    }
  };

  // 3. AI Negotiator Redline
  const handleAiNegotiateClause = async () => {
    if (!selectedClauseForAi) {
      showToast("Select a clause from the left pane to redline.");
      return;
    }

    setIsRedliningAi(true);
    try {
      const res = await copilotApi.redlineClause({
        clauseNumber: selectedClauseForAi.clauseNumber,
        clauseText: selectedClauseForAi.originalText,
        defectType: selectedClauseForAi.category,
        counselGoal: aiCustomPrompt || "Draft mutual, balanced, and compliant clause",
      });

      if (res && res.success && res.redlinedVersion) {
        // Update clause counselRedline
        if (auditReport) {
          const updatedClauses = auditReport.clauses.map((c) =>
            c.id === selectedClauseForAi.id
              ? { ...c, counselRedline: res.redlinedVersion }
              : c
          );
          setAuditReport({ ...auditReport, clauses: updatedClauses });
        }
        showToast("Generated negotiated clause variation via Corporate Legal Engine.");
        setAiCustomPrompt("");
      }
    } catch (err: any) {
      console.error("AI Redline failed:", err);
      showToast("AI Redline failed: " + (err?.message || "Check connection"));
    } finally {
      setIsRedliningAi(false);
    }
  };

  // 4. Save Certified Audit Report to 256-bit Document Vault
  const handlePushToVault = async () => {
    if (!auditReport) return;
    try {
      const payload = {
        title: `Certified Contract Risk Audit — ${auditReport.contractTitle}`,
        fileName: `Contract_Audit_Report_${Date.now().toString().slice(-4)}.pdf`,
        category: "Contract Intelligence / Risk Audit",
        subType: "document-filing",
        matter: currentMatter,
        fileSize: "240 KB",
        filingStatus: "Audited & Certified",
        advocateName,
        details: `Overall Risk Score ${auditReport.overallRiskScore}/100. Identified ${auditReport.criticalRedFlags} void ab initio clauses under Perkins Eastman (Arbitration S.12(5)), Section 27 (Non-Compete), and Section 28 (Limitation Bar).`,
        contentSummary: auditReport.executiveSummary,
      };

      await advocateApi.uploadDocument(payload, token);
      setVaultPushed(true);
      showToast("Certified Risk Audit report encrypted with AES-256 and pushed to Case Vault!");
      setTimeout(() => setVaultPushed(false), 5000);
    } catch (err: any) {
      console.error("Push to vault failed:", err);
      showToast("Failed to push to vault: " + (err?.message || "Check connection"));
    }
  };

  // 5. Print Risk Audit Report
  const handlePrintAudit = () => {
    if (!auditReport) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Certified Contract Risk Audit — ${auditReport.contractTitle}</title>
          <style>
            @page { size: A4 portrait; margin: 20mm; }
            body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #000; padding: 15px; }
            .header { border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 16px; }
            .title { font-size: 14pt; font-weight: bold; }
            .meta { font-size: 9pt; text-transform: uppercase; margin-top: 4px; }
            .score-box { background: #f4f4f5; border: 1px solid #d4d4d8; padding: 10px; margin: 12px 0; font-weight: bold; }
            .clause-box { margin-bottom: 14px; page-break-inside: avoid; border-bottom: 1px solid #e4e4e7; padding-bottom: 10px; }
            .redline { background: #fafafa; border-left: 3px solid #000; padding: 6px 10px; margin-top: 6px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">CHAMBER RISK AUDIT &amp; CONTRACT INTELLIGENCE REPORT</div>
            <div class="meta">WAKHEEL LEGAL TECHNOLOGY • ADV. MEERA KRISHNAN (ROLL NO: ${barCouncilNumber})</div>
          </div>
          <p><b>Agreement Under Audit:</b> ${auditReport.contractTitle}</p>
          <p><b>Parties:</b> ${auditReport.parties}</p>
          <div class="score-box">
            OVERALL RISK RATING: ${auditReport.overallRiskScore} / 100 (${auditReport.riskLevel})<br/>
            ${auditReport.criticalRedFlags} CRITICAL VOID TERMS • ${auditReport.highRisks} HIGH RISKS • ${auditReport.mediumWarnings} WARNINGS
          </div>
          <p><b>Executive Counsel Finding:</b> ${auditReport.executiveSummary}</p>
          <hr style="border: 0; border-top: 1px solid #000; margin: 15px 0;"/>
          <h3>CLAUSE-BY-CLAUSE STATUTORY AUDIT &amp; REDLINES</h3>
          ${auditReport.clauses
            .map(
              (c) => `
            <div class="clause-box">
              <b>${c.clauseNumber}: ${c.clauseName}</b> [${c.riskLevel}]<br/>
              <b>Statutory Ground:</b> ${c.statuteRef} (Precedent: ${c.landmarkPrecedent})<br/>
              <b>Original Problematic Term:</b> &ldquo;${c.originalText}&rdquo;<br/>
              <b>Legal Flaw:</b> ${c.legalExplanation}<br/>
              <div class="redline"><b>Counsel Redline:</b> ${c.counselRedline}</div>
            </div>
          `
            )
            .join("")}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Filter clauses by severity
  const displayedClauses =
    auditReport?.clauses.filter((c) => {
      if (filterSeverity === "critical") return c.riskLevel.includes("Critical");
      if (filterSeverity === "high_medium") return !c.riskLevel.includes("Critical");
      return true;
    }) || [];

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black shadow-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Control Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                Commercial Audit Studio
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                Indian Contract Act &amp; Arbitration Concordance
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white">
              Contract Intelligence &amp; Risk Audit
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Clause-by-clause commercial contract redlining. Flags unilateral arbitrator appointment clauses void under Perkins Eastman, Section 27 non-competes, and uncapped indemnities.
            </p>
          </div>

          {/* Action Suite */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => runContractAudit(selectedAgreementType, contractText)}
              disabled={isAuditing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white transition-colors border border-zinc-200 dark:border-zinc-800 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? "animate-spin" : ""}`} />
              <span>Re-Audit Contract</span>
            </button>

            <button
              onClick={handlePrintAudit}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white transition-colors border border-zinc-200 dark:border-zinc-800"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Audit Report</span>
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
                  <span>Save Audit to Vault (AES-256)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Agreement Selector Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 shrink-0 mr-2">
            Agreement:
          </span>
          <button
            onClick={() => {
              setSelectedAgreementType("commercial_msa");
              runContractAudit("commercial_msa", "");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 border ${
              selectedAgreementType === "commercial_msa"
                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
            }`}
          >
            Master Services Agreement (MSA)
          </button>
          <button
            onClick={() => {
              setSelectedAgreementType("commercial_lease");
              runContractAudit("commercial_lease", "");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 border ${
              selectedAgreementType === "commercial_lease"
                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
            }`}
          >
            Commercial Lease Deed (Marine Drive)
          </button>
        </div>
      </div>

      {/* Top Risk Health Score & KPI Metrics */}
      {auditReport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Risk Score Circle Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                Contract Risk Rating
              </span>
              <div className="text-2xl font-bold font-mono text-black dark:text-white">
                {auditReport.overallRiskScore} <span className="text-xs font-normal text-zinc-400">/ 100</span>
              </div>
              <span className="inline-block text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800">
                {auditReport.riskLevel}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
              <Scale className="w-6 h-6 text-black dark:text-white" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">
              Critical Red Flags (Void)
            </span>
            <div className="text-2xl font-bold font-mono text-black dark:text-white">
              {auditReport.criticalRedFlags} <span className="text-xs font-normal text-zinc-400">Clauses</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Void Ab Initio under S.12(5) Arb Act &amp; S.27/28 Contract Act
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">
              High Liability Exposure
            </span>
            <div className="text-2xl font-bold font-mono text-black dark:text-white">
              {auditReport.highRisks} <span className="text-xs font-normal text-zinc-400">Clauses</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Uncapped indemnities &amp; remote consequential losses
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">
              Medium Warnings
            </span>
            <div className="text-2xl font-bold font-mono text-black dark:text-white">
              {auditReport.mediumWarnings} <span className="text-xs font-normal text-zinc-400">Clauses</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Penal damages &amp; asymmetric termination rights
            </p>
          </div>
        </div>
      )}

      {/* Executive Summary Callout */}
      {auditReport && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3 text-xs">
          <Shield className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-black dark:text-white block">
              Senior Counsel Commercial Risk Finding
            </span>
            <p className="text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed">
              {auditReport.executiveSummary}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono text-zinc-500">
              <span>Audited against:</span>
              {auditReport.statutesCovered.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Dual-Pane Studio: Clauses & Redlines (Left) + Agreement Canvas (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane (7 Cols): Clause-by-Clause Audits & Redline Actions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                Clause Risk Breakdown ({displayedClauses.length})
              </h3>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px]">
              <button
                onClick={() => setFilterSeverity("all")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  filterSeverity === "all"
                    ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                    : "text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterSeverity("critical")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  filterSeverity === "critical"
                    ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                    : "text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                Critical Void
              </button>
              <button
                onClick={() => setFilterSeverity("high_medium")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  filterSeverity === "high_medium"
                    ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                    : "text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                Liability &amp; Exit
              </button>
            </div>
          </div>

          {/* Clause Audit Cards */}
          <div className="space-y-4">
            {displayedClauses.map((clause) => {
              const isApplied = appliedRedlines[clause.id];
              const isSelected = selectedClauseForAi?.id === clause.id;

              return (
                <div
                  key={clause.id}
                  onClick={() => setSelectedClauseForAi(clause)}
                  className={`p-5 sm:p-6 rounded-2xl bg-white dark:bg-black transition-all border cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-black dark:ring-white border-transparent"
                      : "border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-400 dark:hover:border-zinc-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-900">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-black dark:text-white">
                          {clause.clauseNumber}
                        </span>
                        <span className="text-zinc-400">•</span>
                        <h4 className="font-bold text-xs text-black dark:text-white uppercase tracking-wider">
                          {clause.clauseName}
                        </h4>
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        {clause.statuteRef}
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white shrink-0">
                      {clause.riskLevel}
                    </span>
                  </div>

                  {/* Problematic Original Text */}
                  <div className="space-y-1.5 pt-3">
                    <span className="text-[10px] uppercase font-mono text-zinc-400 block font-bold">
                      Original Problematic Term
                    </span>
                    <p className="text-xs font-serif text-zinc-600 dark:text-zinc-300 italic bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      &ldquo;{clause.originalText}&rdquo;
                    </p>
                  </div>

                  {/* Legal Explanation & Precedent */}
                  <div className="space-y-1 pt-2">
                    <span className="text-[10px] uppercase font-mono text-zinc-400 block font-bold">
                      Statutory Defect &amp; Precedent
                    </span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-200 leading-relaxed">
                      {clause.legalExplanation}
                    </p>
                    <div className="text-[11px] font-mono text-zinc-500 pt-0.5">
                      Binding Citation: <span className="text-black dark:text-white font-semibold">{clause.landmarkPrecedent}</span>
                    </div>
                  </div>

                  {/* Counsel Recommended Redline */}
                  <div className="space-y-1.5 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono text-zinc-400 block font-bold">
                        Counsel Recommended Redline (Drop-in Replacement)
                      </span>
                      {isApplied && (
                        <span className="text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Applied to Draft
                        </span>
                      )}
                    </div>
                    <div className="p-3.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border-l-3 border-black dark:border-white text-xs font-serif text-black dark:text-white leading-relaxed">
                      {clause.counselRedline}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-900">
                    <span className="text-[11px] text-zinc-400 font-mono">
                      Action: {clause.actionRequired}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyRedline(clause);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isApplied
                          ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                          : "bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isApplied ? "Re-Apply Redline" : "Apply Redline to Contract"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane (5 Cols): Live Agreement Canvas & AI Negotiator */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI Negotiator Assistant Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  AI Clause Negotiator
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Hybrid Engine
              </span>
            </div>

            <p className="text-[11px] text-zinc-500">
              {selectedClauseForAi
                ? `Active Target: ${selectedClauseForAi.clauseNumber} (${selectedClauseForAi.clauseName})`
                : "Select any clause card on the left to negotiate alternative wording."}
            </p>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="e.g. Cap indemnity to 12 months fees and add mutual carve-outs"
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />

              <button
                onClick={handleAiNegotiateClause}
                disabled={isRedliningAi || !selectedClauseForAi}
                className="w-full p-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {isRedliningAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Redlining via Corporate Legal Engine...</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-3.5 h-3.5" />
                    <span>Generate Negotiated Replacement Clause</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Contract Editor / Redline Canvas */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  Contract Draft Canvas
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                {Object.keys(appliedRedlines).length} Redlines Applied
              </span>
            </div>

            <textarea
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              rows={22}
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono text-xs leading-relaxed focus:outline-none resize-y"
              style={{ minHeight: "480px" }}
            />

            <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(contractText);
                  showToast("Contract draft copied to clipboard.");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Draft</span>
              </button>

              <button
                onClick={() => {
                  const blob = new Blob([contractText], { type: "text/plain;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${selectedAgreementType}_Redlined.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  showToast("Downloaded redlined agreement file.");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white transition-colors"
              >
                <span>Download (.txt)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
