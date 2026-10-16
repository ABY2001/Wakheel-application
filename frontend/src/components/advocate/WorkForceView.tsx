"use client";

import React, { useState } from "react";
import {
  Award,
  Cpu,
  UserPlus,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Bot,
  FileText,
  Play,
  Check,
} from "lucide-react";

interface WorkForceViewProps {
  activeModule?: string;
  onSelectModule?: (mod: string) => void;
}

export function WorkForceView({
  activeModule = "training",
  onSelectModule,
}: WorkForceViewProps) {
  const [currentTab, setCurrentTab] = useState<string>(activeModule);

  const tabs = [
    { id: "training", label: "Training", icon: Award },
    { id: "my-ai-agents", label: "My AI Agents", icon: Cpu },
    { id: "my-ai-twin", label: "My AI Twin", icon: UserPlus },
    { id: "hiring-suite", label: "Hiring Suite", icon: Users },
  ];

  const handleTabChange = (id: string) => {
    setCurrentTab(id);
    if (onSelectModule) onSelectModule(id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
              Work Force Suite
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
              Active Counsel Fleet
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mt-1">
            Chamber Talent &amp; AI Worker Network
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage associate training modules, autonomous judicial agents, digital twins, and recruitment pipelines.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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

      {/* VIEW: Training */}
      {currentTab === "training" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs text-zinc-500 font-medium">Training Modules</span>
              <div className="text-2xl font-bold text-black dark:text-white">12 Modules</div>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">8 completed by juniors this term</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs text-zinc-500 font-medium">Average Evaluation</span>
              <div className="text-2xl font-bold text-black dark:text-white">94.8%</div>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Top score in Supreme Court drafting</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs text-zinc-500 font-medium">Active Trainees</span>
              <div className="text-2xl font-bold text-black dark:text-white">6 Counsel</div>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Enrolled in 2026 Bar roster</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-black dark:text-white">Curriculum &amp; Legal Competencies</h3>
              <button className="px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Add Module
              </button>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {[
                { title: "BNS vs IPC Statutory Concordance & Transition Rules", progress: "100%", status: "Completed", author: "Adv. S. Jenkins" },
                { title: "High Court Appellate Drafting & Writ Petition Formulation", progress: "85%", status: "In Progress", author: "Chamber Senior Roster" },
                { title: "Commercial Cross-Examination & Electronic Evidence Admissibility", progress: "40%", status: "Active Session", author: "Evidence Lab" },
                { title: "Supreme Court Special Leave Petition (SLP) Filing Standards", progress: "10%", status: "Scheduled", author: "Appellate Council" },
              ].map((item, idx) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors">
                  <div className="space-y-1">
                    <span className="font-bold text-black dark:text-white">{item.title}</span>
                    <div className="flex items-center gap-3 text-zinc-500 text-[11px]">
                      <span>Instructor: {item.author}</span>
                      <span>•</span>
                      <span>Progress: {item.progress}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-semibold text-[11px]">
                      {item.status}
                    </span>
                    <button className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer">
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: My AI Agents */}
      {currentTab === "my-ai-agents" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                name: "BNSS Statutory Concordance Agent",
                role: "Autonomous Cross-Section Mapper",
                status: "Online & Monitoring",
                speed: "0.2s lookup",
                desc: "Automatically resolves citations between CrPC and BNSS across petition drafts.",
              },
              {
                name: "Bail Petition Drafting Synthesizer",
                role: "Pleading Generation Specialist",
                status: "Online & Active",
                speed: "42s full draft",
                desc: "Generates formatted Section 482 / 437 BNSS petitions with precedent citations.",
              },
              {
                name: "Causelist Court Tracker Agent",
                role: "High Court Registry Crawler",
                status: "Syncing Daily",
                speed: "Refreshes 06:00 AM",
                desc: "Scrapes cause lists across Delhi, Bombay, and Supreme Court registries.",
              },
              {
                name: "Contract Redlining Auditor",
                role: "Commercial Risk Inspector",
                status: "Standby",
                speed: "Instant audit",
                desc: "Flags non-reciprocal indemnities, jurisdiction shifts, and termination triggers.",
              },
            ].map((agent, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 hover:border-black dark:hover:border-white transition-all shadow-xs">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
                    {agent.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-black dark:text-white">{agent.name}</h4>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">{agent.role}</p>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{agent.desc}</p>
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono">{agent.speed}</span>
                  <button className="px-3 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-85 transition-opacity cursor-pointer">
                    Configure Worker
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: My AI Twin */}
      {currentTab === "my-ai-twin" && (
        <div className="p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xl">
                SJ
              </div>
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">Adv. Sarah Jenkins — AI Digital Twin</h3>
                <p className="text-xs text-zinc-500">Trained on 1,420 chamber pleadings, judgments, and legal notes (2012–2026).</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-xs font-bold text-black dark:text-white border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
              Model Calibration: 99.2%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Drafting Voice</span>
              <p className="text-xs font-bold text-black dark:text-white">Crisp, High Court Statutory, Precedent-First</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Primary Jurisdiction</span>
              <p className="text-xs font-bold text-black dark:text-white">Delhi High Court &amp; Appellate Tribunals</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Active Sync</span>
              <p className="text-xs font-bold text-black dark:text-white">Chamber Vault &amp; Causelist Synced</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">Test Digital Twin Reasoning</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask your digital twin to draft a rejoinder clause or cite a case..."
                defaultValue="Draft a 2-paragraph rejoinder refuting delay in statutory notice under Section 138 NI Act."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
              />
              <button className="px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-85 transition-opacity cursor-pointer">
                Simulate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Hiring Suite */}
      {currentTab === "hiring-suite" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-black dark:text-white">Chamber Recruitment &amp; Associate Pipeline</h3>
              <p className="text-xs text-zinc-500">Screen junior counsel candidates, verify bar council credentials, and track interviews.</p>
            </div>
            <button className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Post Opening
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Rahul Deshmukh", college: "NLSIU Bengaluru (2025)", role: "Appellate Associate", status: "Interview Round 2", score: "96%" },
              { name: "Ananya Iyer", college: "NALSAR Hyderabad (2024)", role: "Commercial Law Clerk", status: "Offer Extended", score: "98%" },
              { name: "Vikramaditya Roy", college: "Faculty of Law, Delhi Univ", role: "Litigation Junior", status: "Screening Review", score: "91%" },
            ].map((cand, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-black dark:text-white">{cand.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    {cand.score} match
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-zinc-600 dark:text-zinc-400">{cand.college}</p>
                  <p className="text-zinc-500 text-[11px]">Applied for: <span className="font-semibold text-black dark:text-white">{cand.role}</span></p>
                </div>
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">{cand.status}</span>
                  <button className="px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer">
                    Review CV
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
