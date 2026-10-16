"use client";

import React from "react";
import Link from "next/link";
import { Users, Scale, Sparkles, ArrowRight, Building2 } from "lucide-react";

interface RoleSpacesSectionProps {
  onOpenAICopilot?: () => void;
}

export function RoleSpacesSection({ onOpenAICopilot }: RoleSpacesSectionProps) {
  return (
    <section id="solutions" className="py-20 lg:py-28 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-900 dark:text-zinc-100">
              <span>SOLUTIONS BY ROLE • PURPOSE-BUILT WORKSPACES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-white tracking-tight">
              Legal intelligence that meets you where you practice.
            </h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-md font-normal leading-relaxed">
            Whether you are arguing before a High Court Division Bench or managing personal legal matters, Wakheel adapts to your role.
          </p>
        </div>

        {/* 3 Solutions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: For Independent Advocates & Chambers */}
          <div className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-8 hover:border-black dark:hover:border-white transition-all flex flex-col justify-between shadow-xs hover:shadow-md">
            <div>
              <div className="w-12 h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Scale className="w-6 h-6" />
              </div>

              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-semibold block mb-1">
                LITIGATION PRACTICE
              </span>

              <h3 className="text-2xl font-bold text-black dark:text-white mb-3">
                For Advocates &amp; Counsel
              </h3>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal mb-6">
                Map BNS provisions instantly, draft Special Leave Petitions, track High Court causelists, and organize junior research into citation-verified briefs.
              </p>

              <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                  <span>Automated morning eCourts briefing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                  <span>Instant statutory concordance</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                  <span>Bench-specific argument synthesis</span>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-zinc-200 dark:border-zinc-800">
              <Link
                href="/advocate-workspace"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black dark:text-white group-hover:opacity-75 transition-opacity"
              >
                <span>Launch Advocate Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: For In-House & Corporate Teams */}
          <div className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-8 hover:border-black dark:hover:border-white transition-all flex flex-col justify-between shadow-xs hover:shadow-md">
            <div>
              <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>

              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-semibold block mb-1">
                CORPORATE &amp; ENTERPRISE
              </span>

              <h3 className="text-2xl font-bold text-black dark:text-white mb-3">
                For Legal Departments
              </h3>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal mb-6">
                Accelerate contract redlining, identify high-risk indemnities, verify Indian Stamp Act state compliance, and supervise external litigation counsel.
              </p>

              <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                  <span>Commercial contract playbook redlining</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                  <span>State stamp duty verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                  <span>SOC2 &amp; Indian cloud data residency</span>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-zinc-200 dark:border-zinc-800">
              <Link
                href="/get-started"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black dark:text-white group-hover:opacity-75 transition-opacity"
              >
                <span>Request Enterprise Briefing</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 3: For Individuals & Litigants */}
          <div className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-8 hover:border-black dark:hover:border-white transition-all flex flex-col justify-between shadow-xs hover:shadow-md">
            <div>
              <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>

              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-semibold block mb-1">
                LITIGANTS &amp; CITIZENS
              </span>

              <h3 className="text-2xl font-bold text-black dark:text-white mb-3">
                For Citizens &amp; Families
              </h3>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal mb-6">
                Understand legal notices in plain language, upload rental agreements for review, track court dates in real time, and connect with verified advocates.
              </p>

              <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                  <span>Plain-English legal notice breakdown</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                  <span>Private encrypted document vault</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                  <span>Verified advocate consultation</span>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-zinc-200 dark:border-zinc-800">
              <Link
                href="/client-portal"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black dark:text-white group-hover:opacity-75 transition-opacity"
              >
                <span>Enter Citizen Portal</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
