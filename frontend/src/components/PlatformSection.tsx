"use client";

import React from "react";
import { Shield, Scale, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export function PlatformSection() {
  const pillars = [
    {
      num: "01",
      pillar: "PROTECT",
      title: "Judicial Knowledge Graph & Citation Verifier",
      desc: "Comprehensive digital intelligence mapped across 70+ years of Supreme Court and High Court judgments. Eliminates citations of overruled cases and guarantees zero hallucinations.",
      features: [
        "SCR, SCC & AIR neutral citation resolution",
        "Subsequent treatment & overruling detection",
        "Constitution Bench ratio extraction",
        "Vernacular judgment summaries across 8 Indian languages",
      ],
      icon: Shield,
    },
    {
      num: "02",
      pillar: "ADVISE",
      title: "Statutory Transition & Pleadings Co-Counsel",
      desc: "Bi-directional concordance between old codes (IPC, CrPC, Evidence Act) and new sanhitas (BNS, BNSS, BSA). Accelerates high-stakes drafting with court-specific petition formatting.",
      features: [
        "Instant IPC ↔ BNS section and penalty concordance",
        "High Court Writ & SLP pleading templates",
        "Statutory savings & cut-off date advisory",
        "Commercial contract arbitration & indemnity redlining",
      ],
      icon: Scale,
    },
    {
      num: "03",
      pillar: "EMPOWER",
      title: "Chamber OS & Encrypted Client Collaboration",
      desc: "Centralized workspace that unites advocates, juniors, and clients. Automates morning eCourts causelist tracking and delivers transparent matter milestones.",
      features: [
        "25 High Courts & District eCourts causelist tracker",
        "Automated WhatsApp & email hearing notifications",
        "Bilingual client matter portal with role-based access",
        "100% Indian data localization with end-to-end encryption",
      ],
      icon: Sparkles,
    },
  ];

  return (
    <section id="platform" className="py-20 lg:py-28 bg-zinc-50 dark:bg-black border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-[0.14em] text-black dark:text-white">
              <span>PLATFORM ARCHITECTURE • THE 3 PILLARS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-white tracking-tight">
              Three pillars engineered for the modern Indian bar.
            </h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-md font-normal leading-relaxed">
            Inspired by our founding emblem: protecting client rights, advising with statutory precision, and empowering chambers with automated workflows.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 hover:border-black dark:hover:border-white transition-all flex flex-col justify-between shadow-xs hover:shadow-md relative"
              >
                <div>
                  {/* Card Top Metadata */}
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="font-mono text-xs font-bold text-black dark:text-white tracking-wider">
                      PILLAR {item.num} // {item.pillar}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-black dark:text-white mb-3 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                    {item.desc}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    {item.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <span className="text-black dark:text-white font-bold shrink-0">―</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 mt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <Link
                    href="/get-started"
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black dark:text-white group-hover:opacity-75 transition-opacity"
                  >
                    <span>Explore Pillar Capabilities</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
