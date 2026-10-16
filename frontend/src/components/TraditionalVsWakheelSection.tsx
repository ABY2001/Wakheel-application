"use client";

import React from "react";
import { X, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export function TraditionalVsWakheelSection() {
  const traditionalIssues = [
    {
      title: "Manual Section Cross-Referencing",
      desc: "Chambers lose 15+ hours weekly cross-checking historic IPC / CrPC FIRs against new BNS & BNSS sections, risking fatal drafting defects.",
    },
    {
      title: "Fragmented Court Cause-Lists",
      desc: "Manually checking dozens of eCourts portals and High Court daily causelists at 7:00 AM without automated tracking or pass-over alerts.",
    },
    {
      title: "Unverified Citation Hazards",
      desc: "Generic LLMs fabricate non-existent citations or miss subsequent overruling judgments from Supreme Court Constitution Benches.",
    },
    {
      title: "Disconnected Client Communication",
      desc: "Associates overwhelmed answering repetitive WhatsApp calls regarding next hearing dates, without a transparent client matter portal.",
    },
  ];

  const wakheelAdvantages = [
    {
      title: "Instant Statutory Concordance Engine",
      desc: "Bidirectional IPC ↔ BNS, CrPC ↔ BNSS, and IEA ↔ BSA converter with clause-level concordance, savings clauses, and legislative intent notes.",
    },
    {
      title: "Unified eCourts & SC Live Radar",
      desc: "Automated causelist monitoring across 25 High Courts and District Courts with morning chamber briefings and live bench movement notifications.",
    },
    {
      title: "Zero-Hallucination Citation Verifier",
      desc: "Strictly grounded in 2.4M+ official Supreme Court and High Court judgments (SCR, SCC, AIR) with hyperlinked paragraphs and neutral citations.",
    },
    {
      title: "Bilingual Encrypted Chamber Portal",
      desc: "Seamless, secure matter timeline for clients with plain-language English & regional explanations, freeing counsel to focus on core litigation.",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-zinc-50 dark:bg-black border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-[11px] font-bold uppercase tracking-[0.14em] text-black dark:text-white">
            <span>COMPARATIVE ARCHITECTURE</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-white tracking-tight">
            Rethinking how Indian legal practices operate.
          </h2>

          <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
            The transition to new criminal statutes requires an operating system built with advocate rigor. See why chambers and counsel choose Wakheel.
          </p>
        </div>

        {/* Side-by-Side Black & White Contrast Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Column A: Traditional Practice (Deep Black Card) */}
          <div className="rounded-2xl border border-zinc-800 bg-black p-8 sm:p-10 text-white flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-6 mb-8 border-b border-zinc-800">
                <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase font-semibold">
                  TRADITIONAL INDIAN WORKFLOW
                </span>
                <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] font-mono uppercase">
                  Legacy Practice
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-6">
                Manual, fragmented, and vulnerable to citation defects.
              </h3>

              <div className="space-y-6">
                {traditionalIssues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0 mt-0.5 text-zinc-400">
                      <X className="w-3 h-3" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200">
                        {issue.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {issue.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-zinc-800 text-xs font-mono text-zinc-500">
              Avg. weekly research overhead: 18.5 hours per associate
            </div>
          </div>

          {/* Column B: Wakheel Chamber Platform (Crisp White Card with Sharp Black Contrast) */}
          <div className="rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-zinc-950 p-8 sm:p-10 text-black dark:text-white flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] font-mono tracking-widest text-black dark:text-white uppercase font-bold">
                  THE WAKHEEL PLATFORM
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono uppercase font-semibold">
                  Purpose-Built AI
                </span>
              </div>

              <h3 className="text-2xl font-bold text-black dark:text-white mb-6">
                Automated, verified, and grounded in Indian jurisprudence.
              </h3>

              <div className="space-y-6">
                {wakheelAdvantages.map((adv, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-black dark:text-white">
                        {adv.title}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                        {adv.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-mono text-black dark:text-white font-semibold">
                85% research time reduction
              </span>
              <Link
                href="/get-started"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black dark:text-white hover:opacity-75 transition-opacity"
              >
                <span>Try Wakheel Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
