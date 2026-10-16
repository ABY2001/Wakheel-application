"use client";

import React from "react";
import { ShieldCheck, Lock, Database, FileKey2, CheckCircle2, Server, EyeOff, FileText } from "lucide-react";
import Link from "next/link";

export function SecuritySection() {
  const securityPillars = [
    {
      icon: EyeOff,
      title: "Zero Model Training Retention",
      description:
        "Your case files, legal opinions, and client queries are never used to train public or foundation models. Your chamber's intellectual property remains strictly yours.",
    },
    {
      icon: Database,
      title: "100% Sovereign Indian Data Residency",
      description:
        "All data rests in MeitY-empaneled Tier-4 facilities situated entirely within the territory of India (Mumbai & Hyderabad), ensuring complete sovereign jurisdiction.",
    },
    {
      icon: Lock,
      title: "AES-256 & TLS 1.3 Cryptography",
      description:
        "End-to-end encryption at rest and in transit. Chamber workspace vaults utilize isolated customer-managed encryption keys (CMEK) with hardware security modules.",
    },
    {
      icon: FileKey2,
      title: "Advocate-Client Privilege Shield",
      description:
        "Architected in alignment with the Indian Evidence Act & Bharatiya Sakshya Adhiniyam 2023 to protect privileged communications and trial strategy.",
    },
  ];

  const standards = [
    "Digital Personal Data Protection (DPDP) Act 2023 Compliant",
    "ISO/IEC 27001:2022 Certified Cloud Architecture",
    "SOC 2 Type II Audited Infrastructure",
    "MeitY-Empaneled Sovereign Indian Datacenters",
    "Strict Role-Based Access Control (RBAC) & Audit Trails",
    "Ephemeral Sandboxed Document Processing",
  ];

  return (
    <section id="security" className="py-20 lg:py-28 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-900 dark:text-zinc-100">
              <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>SECURITY ARCHITECTURE • LEGAL CONFIDENTIALITY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-white tracking-tight">
              Sovereign security built for the sanctity of advocate privilege.
            </h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-md font-normal leading-relaxed">
            Legal practice demands uncompromising confidentiality. Wakheel protects your chamber&apos;s matters with institutional-grade cryptography and zero retention.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {securityPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all flex flex-col justify-between shadow-xs group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compliance Badges Box */}
        <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 mb-6 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white">
                Statutory &amp; Regulatory Conformance
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Verified against Indian cyber statutes and enterprise security benchmarks
              </p>
            </div>
            <Link
              href="/get-started"
              className="text-xs font-bold uppercase tracking-wider text-black dark:text-white hover:underline underline-offset-4"
            >
              Request Security Whitepaper →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {standards.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-black dark:text-white shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
