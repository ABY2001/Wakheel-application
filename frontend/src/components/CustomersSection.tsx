"use client";

import React from "react";
import { CheckCircle2, Star, Quote, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function CustomersSection() {
  const metrics = [
    { value: "99.4%", label: "Statutory Accuracy", detail: "Verified across BNS, BNSS, BSA" },
    { value: "4.5 hrs", label: "Saved Per Matter", detail: "Faster drafting and bail research" },
    { value: "25+", label: "High Courts Covered", detail: "Real-time bench & causelist tracking" },
    { value: "100%", label: "Primary Source Citations", detail: "SCR, SCC & AIR neutral reporters" },
  ];

  const testimonials = [
    {
      quote:
        "The BNS ↔ IPC transition concordancer alone has saved our chamber dozens of research hours every single week. When preparing bail applications before the High Court, the speed and accuracy are unmatched.",
      author: "Adv. Rajesh M. Sharma",
      title: "Senior Litigation Counsel",
      location: "High Court of Delhi • 24 Years Experience",
    },
    {
      quote:
        "Wakheel's clause risk inspector flagged a multi-crore indemnity loophole before commercial closing. For any corporate legal department in India, it provides indispensable statutory rigor.",
      author: "Divya Nambiar",
      title: "General Counsel",
      location: "Apex Infrastructure Group",
    },
    {
      quote:
        "Instant, verified precedent retrieval with SCR and SCC citations. It feels like having three brilliant junior advocates working through the night to prepare every motion.",
      author: "Adv. Vikramjit Singh",
      title: "Founding Partner",
      location: "Singh & Associates Chambers • Supreme Court Bar",
    },
  ];

  return (
    <section id="customers" className="py-20 lg:py-28 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-900 dark:text-zinc-100 shadow-xs">
              <span>CUSTOMER VALIDATION • COUNSEL ACCREDITATION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-white tracking-tight">
              Trusted by India&apos;s leading advocates and enterprises.
            </h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-md font-normal leading-relaxed">
            From trial chambers to enterprise legal departments, legal practitioners rely on Wakheel to prepare winning arguments and bulletproof documentation.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-14">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-xs"
            >
              <span className="text-3xl sm:text-4xl font-bold text-black dark:text-white tracking-tight mb-2">
                {m.value}
              </span>
              <div>
                <h4 className="text-sm font-bold text-black dark:text-white">
                  {m.label}
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {m.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-xs hover:border-black dark:hover:border-white transition-all group"
            >
              <div className="space-y-4">
                <Quote className="w-6 h-6 text-zinc-400 dark:text-zinc-600 group-hover:text-black dark:group-hover:text-white transition-colors" />
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-900">
                <h4 className="text-sm font-bold text-black dark:text-white">
                  {t.author}
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                  {t.title}
                </p>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  {t.location}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-12 p-8 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold">
              Join 2,400+ Advocates Practicing With Wakheel
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-600">
              Begin your 14-day chamber trial. No credit card required.
            </p>
          </div>
          <Link
            href="/get-started"
            className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-black dark:bg-black dark:text-white hover:opacity-90 transition-opacity shrink-0 flex items-center gap-2"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
