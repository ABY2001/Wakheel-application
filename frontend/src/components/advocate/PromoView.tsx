"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  FlaskConical,
  Target,
  CheckCircle2,
  Calendar,
  Globe,
  Share2,
  BookOpen,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  Mail,
  Send,
  ExternalLink,
} from "lucide-react";

interface PromoViewProps {
  activeModule?: string;
  onSelectModule?: (mod: string) => void;
}

export function PromoView({
  activeModule = "marketing",
  onSelectModule,
}: PromoViewProps) {
  const [currentTab, setCurrentTab] = useState<string>(activeModule);

  useEffect(() => {
    if (activeModule) {
      setCurrentTab(activeModule);
    }
  }, [activeModule]);

  const tabs = [
    { id: "marketing", label: "Marketing", icon: Megaphone },
    { id: "rd", label: "R&D", icon: FlaskConical },
    { id: "promotions", label: "Promotions", icon: Target },
  ];

  const handleTabChange = (id: string) => {
    setCurrentTab(id);
    if (onSelectModule) onSelectModule(id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                PROMO &amp; CHAMBER GROWTH
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
                Ethical Outreach &amp; Jurisprudence Labs
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mt-1">
              Chamber Promotion, R&amp;D &amp; Thought Leadership
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Bar Council of India Rule 36 compliant credentials, jurisprudential research initiatives, and client circulars.
            </p>
          </div>
        </div>

        {/* Sub-Tabs: Marketing | R&D | Promotions */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. MARKETING TAB */}
      {currentTab === "marketing" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: "Chamber Digital Profile & Bio",
                meta: "BCI Rule 36 Compliant",
                desc: "Official directory profile detailing Bar Council of Kerala enrollment, High Court appearance credentials, and standing.",
                badge: "Verified Listing",
              },
              {
                title: "Practice Areas & Bench Experience",
                meta: "Kerala HC & NCLT Kochi",
                desc: "Structured practice area dossiers covering Constitutional Writs, Commercial Arbitration, and Corporate Insolvency.",
                badge: "3 Core Specializations",
              },
              {
                title: "Client Advisory Publications",
                meta: "Legal Articles & Case Notes",
                desc: "Quarterly scholarly commentary on new statutory transitions (BNS/BNSS) and Division Bench precedents.",
                badge: "12 Published Notes",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold text-black dark:text-white">
                      {card.badge}
                    </span>
                    <Megaphone className="w-4 h-4 text-black dark:text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-black dark:text-white">{card.title}</h3>
                  <p className="text-[11px] font-mono text-zinc-500">{card.meta}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{card.desc}</p>
                </div>
                <button className="w-full py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                  Manage Credentials <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Ethics Compliance Banner */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3 text-xs text-zinc-600 dark:text-zinc-400">
            <CheckCircle2 className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-black dark:text-white uppercase mr-1">BCI ETHICS SAFEGUARD:</span>
              All advocate marketing modules conform strictly to Bar Council of India Rule 36 (Schedule VII), permitting factual disclosure of name, address, telephone numbers, email address, qualifications, and areas of practice without advertisement solicitation.
            </div>
          </div>
        </div>
      )}

      {/* 2. R&D TAB */}
      {currentTab === "rd" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: "Digital Evidence & S.63 BSA Labs",
                topic: "Forensic Hash & Section 63 BSA",
                desc: "Developing algorithmic protocols for validating cryptographic certificate admissibility replacing Section 65B of Indian Evidence Act.",
                status: "Active Lab",
              },
              {
                title: "Kerala High Court Precedent Predictor",
                topic: "Writ Jurisdiction Patterns",
                desc: "Statistical analysis of single-bench vs division-bench interim stay grants in revenue and electricity transmission disputes.",
                status: "91% Ratio Precision",
              },
              {
                title: "BNS-BNSS Procedural Cross-Walk",
                topic: "Criminal Procedure Transition",
                desc: "Comprehensive concordance matrix correlating procedural stages under 1973 CrPC with 2023 BNSS for trial advocates.",
                status: "Published Open-Source",
              },
            ].map((lab, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold text-black dark:text-white">
                      {lab.status}
                    </span>
                    <FlaskConical className="w-4 h-4 text-black dark:text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-black dark:text-white">{lab.title}</h3>
                  <p className="text-[11px] font-mono text-zinc-500">{lab.topic}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{lab.desc}</p>
                </div>
                <button className="w-full py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-xs font-bold transition-all cursor-pointer">
                  Open Research Workspace
                </button>
              </div>
            ))}
          </div>

          {/* Research Whitepapers */}
          <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="text-sm font-bold text-black dark:text-white">Recent Jurisprudential Research Papers</h3>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {[
                { title: "Evolution of Right to Fair Compensation under Kerala Land Reforms Act, 1963", date: "October 2026", author: "Adv. Meera Krishnan & Research Desk" },
                { title: "Interplay between Section 9 of Arbitration Act and Commercial Courts Act 2015", date: "September 2026", author: "Chamber R&D Desk" },
                { title: "Standard of Proof for Corporate Insolvency in Real Estate Companies under IBC", date: "August 2026", author: "In-house Corporate R&D" },
              ].map((paper, i) => (
                <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-black dark:text-white">{paper.title}</span>
                    <span className="text-[11px] font-mono text-zinc-500 block">{paper.author} • {paper.date}</span>
                  </div>
                  <button className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold text-xs cursor-pointer w-fit">
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. PROMOTIONS TAB */}
      {currentTab === "promotions" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: "Client Statutory Alerts & Circulars",
                meta: "Monthly Regulatory Digest",
                desc: "Automated distribution of crucial MCA, GST, and High Court notifications to enrolled retainer clients.",
                cadence: "Monthly Issue",
              },
              {
                title: "Legal Webinars & Chamber CLE Sessions",
                meta: "Continuing Legal Education",
                desc: "Hosting virtual seminars on contract dispute resolution, startup compliances, and POSH awareness for corporate clients.",
                cadence: "Next: 24 Oct 2026",
              },
              {
                title: "Bar Association & Pro Bono Initiatives",
                meta: "Public Interest & Legal Aid",
                desc: "Organizing legal aid clinics and district pro bono workshops in coordination with Kerala State Legal Services Authority (KELSA).",
                cadence: "Bi-Weekly Clinics",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold text-black dark:text-white">
                      {item.cadence}
                    </span>
                    <Target className="w-4 h-4 text-black dark:text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-black dark:text-white">{item.title}</h3>
                  <p className="text-[11px] font-mono text-zinc-500">{item.meta}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
                <button className="w-full py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer">
                  Schedule Circular Dispatch
                </button>
              </div>
            ))}
          </div>

          {/* Active Broadcast Dispatch List */}
          <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-black dark:text-white">Active Dispatch Circulars</h3>
              <button className="px-3 py-1 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer">
                + New Client Circular
              </button>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {[
                { title: "Advisory on Section 43B(h) MSME 45-Day Payment Mandates", recipients: "48 Corporate Clients", status: "Sent (100% Delivered)", date: "12 Oct 2026" },
                { title: "Kerala High Court Causelist Holiday Notification for Pooja Holidays", recipients: "112 Active Briefs", status: "Sent", date: "09 Oct 2026" },
                { title: "Checklist for Annual ROC Compliances (AOC-4 & MGT-7)", recipients: "34 Company Secretaries", status: "Scheduled for 20 Oct", date: "Upcoming" },
              ].map((c, i) => (
                <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-black dark:text-white">{c.title}</span>
                    <span className="text-[11px] font-mono text-zinc-500 block">{c.recipients} • {c.date}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white w-fit">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
