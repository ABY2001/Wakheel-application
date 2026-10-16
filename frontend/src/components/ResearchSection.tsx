"use client";

import React, { useState } from "react";
import { Search, BookOpen, Scale, ExternalLink, Check, Copy, Sparkles, Filter } from "lucide-react";

export function ResearchSection() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const samplePrecedents = [
    {
      title: "Satender Kumar Antil v. Central Bureau of Investigation",
      citation: "(2022) 10 SCC 51",
      bench: "Sanjay Kishan Kaul & M.M. Sundresh, JJ.",
      court: "Supreme Court of India",
      principle: "Guidelines for bail categories; mandates strict adherence to arrest safeguards without routine custodial remand.",
      statuteMap: "Section 41/41A CrPC ➔ Section 35(3) BNSS 2023",
      status: "Governing Law • 0 Overrulings",
    },
    {
      title: "Vidya Drolia and Ors. v. Durga Trading Corporation",
      citation: "(2021) 2 SCC 1",
      bench: "N.V. Ramana, Sanjiv Khanna & Krishna Murari, JJ.",
      court: "Supreme Court of India [3-Judge Bench]",
      principle: "Fourfold test for determining non-arbitrability of disputes; landlord-tenant disputes arbitrable under Transfer of Property Act.",
      statuteMap: "Section 8 & 11 Arbitration & Conciliation Act 1996",
      status: "Constitution Bench Authority",
    },
  ];

  const handleCopyCitation = (citation: string, index: number) => {
    navigator.clipboard?.writeText(citation);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section id="research" className="py-20 lg:py-28 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-900 dark:text-zinc-100">
            <span>RESEARCH ENGINE • INDIAN PRECEDENTS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-white tracking-tight">
            Synthesize 70+ years of Indian case law with zero hallucinations.
          </h2>

          <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
            Search with plain-language facts or complex constitutional arguments. Wakheel extracts authoritative ratio decidendi, maps statutory provisions to the new 2023 sanhitas, and validates citations against official law reporters.
          </p>
        </div>

        {/* Interactive Legal Research Workspace Mockup */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6 sm:p-8 shadow-sm">
          
          {/* Search Query Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pb-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly
                value="Mandatory arrest procedure under BNSS Section 35(3) vs CrPC Section 41A"
                className="w-full pl-12 pr-4 py-3 rounded-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm font-medium text-black dark:text-white focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="px-3 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Supreme Court &amp; High Courts
              </span>
              <button className="px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-85 transition-opacity cursor-pointer shrink-0">
                Search
              </button>
            </div>
          </div>

          {/* Research Results Cards */}
          <div className="mt-6 space-y-4">
            {samplePrecedents.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-black dark:hover:border-white transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                    <h3 className="font-bold text-base sm:text-lg text-black dark:text-white">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white">
                      {item.citation}
                    </span>
                    <button
                      onClick={() => handleCopyCitation(item.citation, idx)}
                      className="p-1 rounded text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                      title="Copy Citation"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-black dark:text-white" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 font-mono mb-2">
                  {item.court} • {item.bench}
                </p>

                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
                  <span className="font-semibold text-black dark:text-white">Ratio Decidendi:</span> {item.principle}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
                  <span className="font-mono text-black dark:text-white font-semibold">
                    {item.statuteMap}
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Research Bottom Highlight Bar */}
          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-black dark:text-white" />
              <span>Includes SCC Online, AIR, SCR neutral citations &amp; vernacular High Court judgment translations</span>
            </div>
            <span className="font-mono text-[11px] text-zinc-500">2,418,912 records indexed</span>
          </div>

        </div>

      </div>
    </section>
  );
}
