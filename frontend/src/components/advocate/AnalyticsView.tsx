"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface AnalyticsViewProps {
  activeModule?: string;
  onSelectModule?: (mod: string) => void;
}

export function AnalyticsView({
  activeModule = "ai-analytics",
  onSelectModule,
}: AnalyticsViewProps) {
  const [currentTab, setCurrentTab] = useState<string>(activeModule);

  const tabs = [
    { id: "ai-analytics", label: "AI Analytics", icon: BarChart3 },
    { id: "reports", label: "Chamber Reports", icon: FileSpreadsheet },
  ];

  const handleTabChange = (id: string) => {
    setCurrentTab(id);
    if (onSelectModule) onSelectModule(id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
              Practice Intelligence
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
              Judicial Analytics
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mt-1">
            Bench Analytics &amp; Case Reports
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            AI-powered win-rate insights, bench disposition metrics, precedent citation analysis, and audit exports.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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

      {/* VIEW: AI Analytics */}
      {currentTab === "ai-analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Overall Win Rate</span>
              <div className="text-2xl font-bold text-black dark:text-white">88.4%</div>
              <span className="text-[10px] text-zinc-500">142 appellate judgments analyzed</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Avg Disposal Time</span>
              <div className="text-2xl font-bold text-black dark:text-white">4.2 Mos</div>
              <span className="text-[10px] text-zinc-500">Across Delhi High Court benches</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Precedent Citation Power</span>
              <div className="text-2xl font-bold text-black dark:text-white">99.1%</div>
              <span className="text-[10px] text-zinc-500">Zero adverse citations flagged</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Favorable Settlement Ratio</span>
              <div className="text-2xl font-bold text-black dark:text-white">76.0%</div>
              <span className="text-[10px] text-zinc-500">Pre-trial mediation resolution</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold text-black dark:text-white">Bench Disposition by Practice Area</h3>
              <div className="space-y-3 text-xs">
                {[
                  { area: "Constitutional & Writ Petitions (Art. 226)", rate: "92%", count: "48 matters" },
                  { area: "Commercial Arbitration & Section 34 Appeals", rate: "86%", count: "34 matters" },
                  { area: "Criminal Quashing under BNSS Sec 528", rate: "84%", count: "29 matters" },
                  { area: "Insolvency & Bankruptcy Code (NCLAT)", rate: "90%", count: "18 matters" },
                  { area: "Intellectual Property & Trademark Writs", rate: "89%", count: "13 matters" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-black dark:text-white">{item.area}</span>
                      <span className="font-mono font-bold">{item.rate}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                      <div
                        className="h-full bg-black dark:bg-white rounded-full"
                        style={{ width: item.rate }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold text-black dark:text-white">Most Frequented Court Benches (2026)</h3>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                {[
                  { bench: "Court Hall 3 • High Court of Delhi", judge: "Hon'ble Justice Sanghi & Justice Prasad", matters: "24 hearings", disposition: "88% Favorable" },
                  { bench: "Court Hall 14 • Commercial Appellate Bench", judge: "Hon'ble Justice Bakhru", matters: "18 hearings", disposition: "92% Favorable" },
                  { bench: "Court Hall 1 • Chief Justice Bench", judge: "Hon'ble Chief Justice", matters: "12 hearings", disposition: "83% Favorable" },
                  { bench: "NCLAT Principal Bench • New Delhi", judge: "Hon'ble Judicial Member Ashok Bhushan", matters: "9 hearings", disposition: "89% Favorable" },
                ].map((row, idx) => (
                  <div key={idx} className="py-2.5 space-y-1">
                    <div className="flex justify-between font-bold text-black dark:text-white">
                      <span>{row.bench}</span>
                      <span className="font-mono text-[11px]">{row.disposition}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 flex justify-between">
                      <span>{row.judge}</span>
                      <span>{row.matters}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Reports */}
      {currentTab === "reports" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-black dark:text-white">Official Chamber Reports &amp; Exports</h3>
              <p className="text-xs text-zinc-500">Download court-certified logs, financial audits, and matter progression summaries.</p>
            </div>
            <button className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              Generate Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: "Q3 2026 Comprehensive Chamber Audit", desc: "Includes all 142 matter dispositions, court fee disbursements, and associate hours.", date: "Generated 01 Oct 2026", size: "3.4 MB PDF" },
              { title: "Statutory Causelist History & Disposal Rate", desc: "Complete bench appearance record across Supreme Court and Delhi High Court.", date: "Generated 08 Oct 2026", size: "1.8 MB PDF" },
              { title: "GST Reverse Charge & Trust Escrow Statement", desc: "Form 3B reconciliation report for chamber trust accounts and disbursements.", date: "Generated 10 Oct 2026", size: "2.1 MB PDF" },
            ].map((rep, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black dark:text-white">{rep.title}</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">{rep.desc}</p>
                </div>
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="font-mono">{rep.size}</span>
                  <button className="px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold flex items-center gap-1 cursor-pointer">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
