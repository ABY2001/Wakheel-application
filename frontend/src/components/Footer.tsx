"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 text-xs py-14 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-zinc-200 dark:border-zinc-800">
          
          {/* Brand Column (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <BrandLogo size="md" />

            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
              India's AI co-counsel intelligence platform. Purpose-built for trial advocates, senior counsel, corporate legal teams, and citizens navigating Indian jurisprudence.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-800 dark:text-zinc-200">
              <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>100% Indian Data Residency • ISO 27001</span>
            </div>
          </div>

          {/* Col 2: Research */}
          <div className="space-y-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-black dark:text-white font-bold block">
              RESEARCH
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#research" className="hover:text-black dark:hover:text-white transition-colors">
                  Precedent Synthesizer
                </Link>
              </li>
              <li>
                <Link href="/#research" className="hover:text-black dark:hover:text-white transition-colors">
                  BNS ↔ IPC Concordance
                </Link>
              </li>
              <li>
                <Link href="/#research" className="hover:text-black dark:hover:text-white transition-colors">
                  Supreme Court Bench Radar
                </Link>
              </li>
              <li>
                <Link href="/#research" className="hover:text-black dark:hover:text-white transition-colors">
                  Neutral Citations (SCR/SCC)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform */}
          <div className="space-y-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-black dark:text-white font-bold block">
              PLATFORM
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#platform" className="hover:text-black dark:hover:text-white transition-colors">
                  Pillar I: Judicial Graph
                </Link>
              </li>
              <li>
                <Link href="/#platform" className="hover:text-black dark:hover:text-white transition-colors">
                  Pillar II: Pleadings Co-Counsel
                </Link>
              </li>
              <li>
                <Link href="/#platform" className="hover:text-black dark:hover:text-white transition-colors">
                  Pillar III: Chamber OS
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-black dark:hover:text-white transition-colors">
                  Pricing &amp; Subscriptions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Solutions & Company */}
          <div className="space-y-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-black dark:text-white font-bold block">
              SOLUTIONS &amp; COMPANY
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#solutions" className="hover:text-black dark:hover:text-white transition-colors">
                  Solutions by Role
                </Link>
              </li>
              <li>
                <Link href="/#customers" className="hover:text-black dark:hover:text-white transition-colors">
                  Customer Stories
                </Link>
              </li>
              <li>
                <Link href="/#security" className="hover:text-black dark:hover:text-white transition-colors">
                  Sovereign Security
                </Link>
              </li>
              <li>
                <Link href="/#company" className="hover:text-black dark:hover:text-white transition-colors">
                  About Company
                </Link>
              </li>
              <li>
                <Link href="/advocate-workspace" className="hover:text-black dark:hover:text-white transition-colors font-medium">
                  Advocate Workspace →
                </Link>
              </li>
              <li>
                <Link href="/client-portal" className="hover:text-black dark:hover:text-white transition-colors font-medium">
                  Client Portal →
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bar Council Compliance Disclaimer Notice */}
        <div className="py-6 border-b border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 leading-relaxed">
          <p>
            <strong>Regulatory &amp; Ethics Notice:</strong> Wakheel is an enterprise legal technology platform designed to assist advocates, legal departments, and litigants with legal research, document synthesis, and workflow automation. In compliance with the Bar Council of India Rules (Rule 36, Section IV, Chapter II, Part VI), Wakheel does not solicit work, advertise legal services, or provide independent legal representation. Users must verify all generated citations and opinions with a practicing advocate.
          </p>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <span>© 2026 Wakheel Legal Technologies Inc. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <span className="hover:text-black dark:hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-black dark:hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-black dark:hover:text-white cursor-pointer">Security Whitepaper</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
