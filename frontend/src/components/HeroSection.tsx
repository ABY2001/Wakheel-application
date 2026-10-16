"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Scale, Database, FileCheck } from "lucide-react";
import { DocIntelligenceCard } from "./DocIntelligenceCard";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-white dark:bg-black transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Advocate Monochrome Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-900 dark:text-zinc-100 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse" />
              <span>THE ADVOCATE'S WORKSPACE • BLACK &amp; WHITE RIGOR</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black dark:text-white tracking-tight leading-[1.12]">
              Legal clarity in{" "}
              <span className="underline decoration-1 underline-offset-8">
                black &amp; white.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 max-w-xl font-normal leading-relaxed">
              Purpose-built for Indian advocates, chambers, and counsel. Transition seamlessly between IPC and BNS, synthesize 70+ years of Supreme Court precedent, and manage court matters with unyielding precision.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/get-started"
                className="px-6 py-3.5 rounded-full bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold text-sm shadow-md transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>Start Legal Research</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/advocate-workspace"
                className="px-6 py-3.5 rounded-full bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white border border-zinc-300 dark:border-zinc-700 font-semibold text-sm transition-all cursor-pointer shadow-2xs"
              >
                Explore Advocate Workspace
              </Link>
            </div>

            {/* Trust & Indian Compliance Metric Bar */}
            <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-black dark:text-white">2.4M+</p>
                <p className="text-[11px] font-mono tracking-tight text-zinc-500 uppercase mt-0.5">
                  SC &amp; HC Judgments
                </p>
              </div>

              <div>
                <p className="text-xl sm:text-2xl font-bold text-black dark:text-white">100%</p>
                <p className="text-[11px] font-mono tracking-tight text-zinc-500 uppercase mt-0.5">
                  Indian Residency
                </p>
              </div>

              <div>
                <p className="text-xl sm:text-2xl font-bold text-black dark:text-white">0%</p>
                <p className="text-[11px] font-mono tracking-tight text-zinc-500 uppercase mt-0.5">
                  Hallucination SLA
                </p>
              </div>

              <div>
                <p className="text-xl sm:text-2xl font-bold text-black dark:text-white">25</p>
                <p className="text-[11px] font-mono tracking-tight text-zinc-500 uppercase mt-0.5">
                  High Courts Synced
                </p>
              </div>
            </div>

          </div>

          {/* Right Hero Column: Advocate Console */}
          <div className="lg:col-span-5">
            <DocIntelligenceCard />
          </div>

        </div>
      </div>
    </section>
  );
}
