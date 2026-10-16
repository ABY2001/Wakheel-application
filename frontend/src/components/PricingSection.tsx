"use client";

import React, { useState } from "react";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  const plans = [
    {
      name: "Litigant Explorer",
      badge: "INDIVIDUALS & CLIENTS",
      price: "₹0",
      period: "forever",
      desc: "Essential legal document review and matter tracking for citizens and litigants.",
      features: [
        "Plain-language legal notice analysis",
        "Rental & basic contract review",
        "Encrypted client portal storage (1 GB)",
        "Direct advocate inquiry channel",
        "Community legal guides & FAQs",
      ],
      cta: "Get Started Free",
      href: "/get-started",
      highlight: false,
    },
    {
      name: "Advocate Pro",
      badge: "FOR LITIGATION CHAMBERS",
      popularTag: "RECOMMENDED FOR CHAMBERS",
      price: billingCycle === "annual" ? "₹2,499" : "₹2,999",
      period: "per seat / month",
      desc: "Complete intelligence suite for independent advocates and active trial counsel.",
      features: [
        "Full IPC ↔ BNS & BNSS transition engine",
        "2.4M+ Supreme Court & HC judgments indexed",
        "Zero-hallucination citation verification (SCC/AIR)",
        "Automated daily eCourts causelist tracker (150 matters)",
        "High Court Writ & SLP pleading drafts",
        "Morning WhatsApp hearing schedule alerts",
        "Priority Indian cloud encryption",
      ],
      cta: "Start 14-Day Free Trial",
      href: "/get-started",
      highlight: true,
    },
    {
      name: "Chambers & Enterprise",
      badge: "FIRMS & LEGAL DEPARTMENTS",
      price: billingCycle === "annual" ? "₹7,999" : "₹8,999",
      period: "starting base / month",
      desc: "Custom multi-seat deployment for law firms, senior advocates, and corporate counsel.",
      features: [
        "Unlimited advocates & junior associate seats",
        "Unlimited active eCourts case causelist sync",
        "Custom chamber precedent & archive training",
        "Commercial contract playbook redlining",
        "State stamp duty & FEMA regulatory checks",
        "Dedicated account manager & SLA support",
        "Custom API & billing management hooks",
      ],
      cta: "Request Enterprise Demo",
      href: "/get-started",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-zinc-50 dark:bg-black border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-[0.14em] text-black dark:text-white">
            <span>TRANSPARENT PRICING • ZERO LOCK-IN</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-white tracking-tight">
            Predictable investment for high-performing Indian counsel.
          </h2>

          <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
            All plans include 100% Indian data residency, strict confidentiality compliance, and zero AI training on your confidential briefs.
          </p>

          {/* Billing Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="p-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 inline-flex items-center text-xs">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                  billingCycle === "annual"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Annual <span className="text-[10px] opacity-80 ml-1 font-mono font-bold">(Save 20%)</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-8 sm:p-10 transition-all flex flex-col justify-between relative ${
                p.highlight
                  ? "bg-black text-white border-2 border-black dark:border-white shadow-2xl scale-[1.02]"
                  : "bg-white dark:bg-zinc-950 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md"
              }`}
            >
              {p.popularTag && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-white text-black text-[10px] font-bold tracking-widest uppercase shadow-md border border-zinc-200">
                  {p.popularTag}
                </div>
              )}

              <div>
                <span className={`font-mono text-[10px] uppercase tracking-widest font-bold block mb-1 ${p.highlight ? "text-zinc-400" : "text-zinc-500"}`}>
                  {p.badge}
                </span>

                <h3 className={`text-2xl font-bold mb-3 ${p.highlight ? "text-white" : "text-black dark:text-white"}`}>
                  {p.name}
                </h3>

                <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${p.highlight ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-400"}`}>
                  {p.desc}
                </p>

                {/* Price Display */}
                <div className="pb-6 mb-6 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-4xl font-bold tracking-tight ${p.highlight ? "text-white" : "text-black dark:text-white"}`}>
                      {p.price}
                    </span>
                    <span className={`text-xs font-mono ${p.highlight ? "text-zinc-400" : "text-zinc-500"}`}>
                      {p.period}
                    </span>
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-3">
                  <span className={`text-[11px] font-mono tracking-wider uppercase font-semibold block ${p.highlight ? "text-zinc-400" : "text-zinc-500"}`}>
                    INCLUDED CAPABILITIES:
                  </span>
                  {p.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${p.highlight ? "text-white" : "text-black dark:text-white"}`} />
                      <span className={p.highlight ? "text-zinc-200" : "text-zinc-700 dark:text-zinc-300"}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card CTA */}
              <div className="pt-8 mt-8 border-t border-zinc-200 dark:border-zinc-800">
                <Link
                  href={p.href}
                  className={`w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    p.highlight
                      ? "bg-white text-black hover:bg-zinc-200 shadow-md font-bold"
                      : "bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  }`}
                >
                  <span>{p.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Security Trust Notice */}
        <div className="mt-16 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-black dark:text-white" />
            <span>
              <strong>Confidentiality First:</strong> Zero client briefs are used to train public models. Hosted in ISO 27001 &amp; MeitY-empaneled Indian data centers.
            </span>
          </div>
          <span className="font-mono text-black dark:text-white font-semibold shrink-0">
            BCI Ethics Code Compliant
          </span>
        </div>

      </div>
    </section>
  );
}
