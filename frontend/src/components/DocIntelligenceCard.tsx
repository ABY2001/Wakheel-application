"use client";

import React, { useState } from "react";
import { ShieldCheck, Sparkles, CheckCircle2, Scale, FileText, ArrowRight, Layers } from "lucide-react";

export function DocIntelligenceCard() {
  const [activeTab, setActiveTab] = useState<"bns" | "precedent" | "contract">("bns");

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Subtle Black/White Shadow Elevation */}
      <div className="absolute -inset-1.5 rounded-3xl bg-zinc-200/50 dark:bg-zinc-800/30 blur-xl opacity-70 pointer-events-none" />

      {/* Main Advocate Console Card */}
      <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xl transition-all duration-200">
        
        {/* Top Header & Tab Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />
            <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-black dark:text-white">
              Advocate Intelligence Console
            </span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px]">
            <button
              onClick={() => setActiveTab("bns")}
              className={`px-3 py-1 rounded font-semibold transition-all cursor-pointer ${
                activeTab === "bns"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              IPC ↔ BNS
            </button>
            <button
              onClick={() => setActiveTab("precedent")}
              className={`px-3 py-1 rounded font-semibold transition-all cursor-pointer ${
                activeTab === "precedent"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Precedents
            </button>
            <button
              onClick={() => setActiveTab("contract")}
              className={`px-3 py-1 rounded font-semibold transition-all cursor-pointer ${
                activeTab === "contract"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Redline
            </button>
          </div>
        </div>

        {/* Tab 1: IPC ↔ BNS Concordance Engine */}
        {activeTab === "bns" && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-mono text-zinc-700 dark:text-zinc-300">QUERY: S. 420 IPC ➔ BNS TRANSITION</span>
              <span className="inline-flex items-center gap-1 text-black dark:text-white font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Concordance Verified
              </span>
            </div>

            {/* Split Comparison Cards in Monochrome */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 mb-1">
                  <span>HISTORIC CODE</span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">IPC 1860</span>
                </div>
                <h4 className="font-bold text-black dark:text-white text-sm mb-1">
                  Section 420 — Cheating
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                  Dishonestly inducing delivery of property. Imprisonment up to 7 years + fine.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700">
                <div className="flex items-center justify-between font-mono text-[10px] text-black dark:text-white mb-1 font-bold">
                  <span>NEW STATUTORY CODE</span>
                  <span className="px-1.5 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black">BNS 2023</span>
                </div>
                <h4 className="font-bold text-black dark:text-white text-sm mb-1">
                  Section 318(4) — Cheating
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                  Restructured under Chapter XVII; cross-referenced with digital evidence under BSA §61.
                </p>
              </div>
            </div>

            {/* Advocate Judicial Note */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-2 mb-1.5 text-black dark:text-white font-semibold text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
                <span>Advocate Transitional Advisory</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                Offenses committed prior to July 1, 2024 remain governed by IPC under §358 BNS general repeal savings. All FIRs registered post-cut-off must cite Section 318(4).
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Supreme Court Precedent Synthesizer */}
        {activeTab === "precedent" && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-mono text-zinc-700 dark:text-zinc-300">MATTER: Anticipatory Bail Precedents</span>
              <span className="text-black dark:text-white font-semibold text-[11px]">AIR / SCC Indexed</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-black dark:text-white text-sm">
                  Sushila Aggarwal v. State (NCT of Delhi)
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                  (2020) 5 SCC 1 [Constitution Bench]
                </span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                Anticipatory bail should not normally be limited to a fixed time period. Validated against Section 482 of the Bharatiya Nagarik Suraksha Sanhita (BNSS).
              </p>
              <div className="flex items-center gap-2 pt-1 border-t border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500">
                <span>Overruling check: Valid</span>
                <span>•</span>
                <span>Cited by 142 High Court Rulings</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 text-[11px]">
                <Scale className="w-4 h-4 text-black dark:text-white" />
                <span>Ready to insert into High Court Bail Application draft</span>
              </div>
              <span className="font-bold text-black dark:text-white text-[11px] cursor-pointer hover:underline">Insert →</span>
            </div>
          </div>
        )}

        {/* Tab 3: Contract Redline & Risk Triage */}
        {activeTab === "contract" && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-mono text-zinc-700 dark:text-zinc-300">DOC: Master Services Agreement v3</span>
              <span className="text-black dark:text-white font-semibold text-[11px]">1 High-Risk Flag</span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-black dark:text-white uppercase">
                  Clause 14.2 — Unilateral Arbitrator Appointment
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-black text-white dark:bg-white dark:text-black font-bold">
                  Void Ab Initio
                </span>
              </div>
              <p className="text-zinc-800 dark:text-zinc-200 text-xs leading-relaxed">
                "Company reserves exclusive right to appoint the Sole Arbitrator." Violates 7th Schedule &amp; Perkins Eastman SC jurisprudence.
              </p>
              <p className="text-[11px] text-zinc-900 dark:text-zinc-100 font-semibold">
                Suggested Redline: "Sole Arbitrator shall be mutually nominated by both parties, failing which DIAC rules shall apply."
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 pt-1">
              <span>Stamp Duty: NCT of Delhi</span>
              <span className="font-mono text-black dark:text-white font-bold">Compliant with Indian Stamp Act</span>
            </div>
          </div>
        )}

        {/* Console Bottom Status Bar */}
        <div className="mt-5 pt-3.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white" />
            <span>Encrypted eCourts Knowledge Link</span>
          </div>
          <span className="font-mono text-zinc-700 dark:text-zinc-300">Latency: 142ms</span>
        </div>

      </div>
    </div>
  );
}
