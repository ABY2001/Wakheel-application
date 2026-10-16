"use client";

import React from "react";
import { Scale, Users, Shield, ArrowRight, Building, BookOpen, Compass } from "lucide-react";
import Link from "next/link";

export function CompanySection() {
  const values = [
    {
      icon: Scale,
      title: "Jurisprudential Fidelity",
      description:
        "Every insight is grounded in primary law: gazettes, verified neutral citations, and binding Division Bench precedents. We reject hallucinations.",
    },
    {
      icon: Users,
      title: "Advocate-Centric Engineering",
      description:
        "We build for the trial advocate's daily reality: urgent morning causelists, late-night rejoinders, and multi-forum litigation management.",
    },
    {
      icon: Compass,
      title: "Modernizing India's Legal Spine",
      description:
        "From District Courts to the Supreme Court of India, our mission is to eliminate archaic procedural friction and empower fearless advocacy.",
    },
  ];

  return (
    <section id="company" className="py-20 lg:py-28 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-900 dark:text-zinc-100 shadow-xs">
              <Building className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>ABOUT WAKHEEL • OUR COMMITMENT</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-white tracking-tight">
              Built by advocates and engineers for the future of Indian law.
            </h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-md font-normal leading-relaxed">
            We are dedicated to building sovereign, precise, and secure artificial intelligence infrastructure for the legal profession across the Republic of India.
          </p>
        </div>

        {/* 3 Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all flex flex-col justify-between shadow-xs group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                    {val.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                    {val.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chamber Principles Banner */}
        <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xs">
          <div className="space-y-2 max-w-xl text-center lg:text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">
              OUR PROMISE TO THE INDIAN BAR
            </span>
            <h3 className="text-2xl font-bold text-black dark:text-white">
              &ldquo;Protect. Advise. Empower.&rdquo;
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Wakheel is committed to upholding the dignity of legal practice in India. We adhere strictly to Bar Council ethics and empower advocates with transparent, verifiable intelligence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/get-started"
              className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity text-center"
            >
              Get Started with Wakheel
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-black dark:text-white border border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white transition-colors text-center"
            >
              Sign In to Chamber
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
