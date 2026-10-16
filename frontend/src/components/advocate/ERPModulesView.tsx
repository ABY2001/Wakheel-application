"use client";

import React, { useState } from "react";
import {
  UserCheck,
  HeartHandshake,
  CreditCard,
  Grid,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Download,
  Building,
  DollarSign,
  TrendingUp,
} from "lucide-react";

interface ERPModulesViewProps {
  activeModule?: string;
  onSelectModule?: (mod: string) => void;
}

export function ERPModulesView({
  activeModule = "curemaso",
  onSelectModule,
}: ERPModulesViewProps) {
  const [currentTab, setCurrentTab] = useState<string>(activeModule);

  const tabs = [
    { id: "huremaso", label: "Huremaso - HRM", icon: UserCheck },
    { id: "curemaso", label: "Curemaso - CRM", icon: HeartHandshake },
    { id: "acmaso", label: "Acmaso - Accounts", icon: CreditCard },
    { id: "app-store", label: "App Store", icon: Grid },
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
              Chamber Enterprise Resource Planning
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
              ERP Suite
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mt-1">
            Chamber Operations &amp; Management Suite
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Huremaso HRM (staff &amp; attendance), Curemaso CRM (client retainers), Acmaso Accounts (billing &amp; GST), and Legal App Store.
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

      {/* VIEW: Huremaso - HRM */}
      {currentTab === "huremaso" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Chamber Associates</span>
              <div className="text-xl font-bold text-black dark:text-white">8 Advocates</div>
              <span className="text-[10px] text-zinc-500">All bar credentials valid</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Clerks &amp; Staff</span>
              <div className="text-xl font-bold text-black dark:text-white">4 Personnel</div>
              <span className="text-[10px] text-zinc-500">Registry filing passes active</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Today&apos;s Attendance</span>
              <div className="text-xl font-bold text-black dark:text-white">100% Present</div>
              <span className="text-[10px] text-zinc-500">Court hall check-in</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Payroll Cycle</span>
              <div className="text-xl font-bold text-black dark:text-white">Due 30th Oct</div>
              <span className="text-[10px] text-zinc-500">Automatic direct deposit</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-black dark:text-white">Associate Rosters &amp; Bar Validations</h3>
              <button className="px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer">
                + Add Personnel
              </button>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {[
                { name: "Adv. Rajiv Malhotra", role: "Principal Associate", enroll: "D/1492/2018", status: "Verified", leaves: "0 pending" },
                { name: "Adv. Preeti Sharma", role: "Litigation Junior", enroll: "D/3411/2021", status: "Verified", leaves: "1 requested" },
                { name: "Suresh Rawat", role: "Chief Court Clerk", enroll: "Registry ID #402", status: "Verified", leaves: "0 pending" },
              ].map((row, idx) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors">
                  <div>
                    <span className="font-bold text-black dark:text-white">{row.name}</span>
                    <span className="text-zinc-500 ml-2">({row.role})</span>
                    <div className="text-zinc-400 text-[11px] font-mono mt-0.5">{row.enroll}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-black dark:text-white">
                      {row.status}
                    </span>
                    <span className="text-zinc-500 text-[11px]">{row.leaves}</span>
                    <button className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer">
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Curemaso - CRM */}
      {currentTab === "curemaso" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Active Retainers</span>
              <div className="text-xl font-bold text-black dark:text-white">42 Clients</div>
              <span className="text-[10px] text-zinc-500">Corporate &amp; High Net-Worth</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Incoming Inquiries</span>
              <div className="text-xl font-bold text-black dark:text-white">14 Leads</div>
              <span className="text-[10px] text-zinc-500">6 awaiting conflict check</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Client Retention</span>
              <div className="text-xl font-bold text-black dark:text-white">96.4%</div>
              <span className="text-[10px] text-zinc-500">Top quartile for chamber</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">KYC Clearance</span>
              <div className="text-xl font-bold text-black dark:text-white">100% Cleared</div>
              <span className="text-[10px] text-zinc-500">AML &amp; PEP screened</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-black dark:text-white">Corporate Client Retainer Accounts</h3>
              <button className="px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer">
                + New Client Onboard
              </button>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {[
                { client: "CyberCorp Technologies Ltd", matter: "Cross-Border IP & Commercial Arbitration", status: "Active Retainer", value: "₹ 18,50,000 / yr" },
                { client: "Apollo Infra Real Estate Group", matter: "RERA Appeals & Land Acquisition Writs", status: "Active Retainer", value: "₹ 24,00,000 / yr" },
                { client: "FinTech Sol India Pvt Ltd", matter: "RBI Compliance & Regulatory Advisory", status: "Active Retainer", value: "₹ 12,00,000 / yr" },
                { client: "Alex Morgan", matter: "Tenancy Dispute & Section 14 Eviction Notice", status: "Individual Lead", value: "₹ 75,000 (Fixed)" },
              ].map((row, idx) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors">
                  <div>
                    <span className="font-bold text-black dark:text-white">{row.client}</span>
                    <p className="text-zinc-500 text-[11px] mt-0.5">{row.matter}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-black dark:text-white">{row.value}</span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-black dark:text-white">
                      {row.status}
                    </span>
                    <button className="px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer">
                      Open CRM
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Acmaso - Accounts */}
      {currentTab === "acmaso" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Billed This Month</span>
              <div className="text-xl font-bold text-black dark:text-white">₹ 14,20,000</div>
              <span className="text-[10px] text-zinc-500">18 invoices issued</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Collected Revenue</span>
              <div className="text-xl font-bold text-black dark:text-white">₹ 11,80,000</div>
              <span className="text-[10px] text-zinc-500">83% collection rate</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Court Trust Escrow</span>
              <div className="text-xl font-bold text-black dark:text-white">₹ 6,50,000</div>
              <span className="text-[10px] text-zinc-500">Segregated client escrow</span>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">GST Input Credit</span>
              <div className="text-xl font-bold text-black dark:text-white">₹ 1,42,800</div>
              <span className="text-[10px] text-zinc-500">18% legal reverse charge</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-black dark:text-white">Recent Tax Invoices &amp; Disbursements</h3>
              <button className="px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer">
                Create Invoice
              </button>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {[
                { inv: "INV-2026-089", client: "CyberCorp Technologies", amount: "₹ 3,50,000", date: "10 Oct 2026", status: "Paid" },
                { inv: "INV-2026-088", client: "Apollo Infra Real Estate", amount: "₹ 5,00,000", date: "08 Oct 2026", status: "Pending" },
                { inv: "INV-2026-087", client: "Alex Morgan", amount: "₹ 75,000", date: "05 Oct 2026", status: "Paid" },
              ].map((inv, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-black dark:text-white">{inv.inv}</span>
                    <span className="text-zinc-500 ml-2">({inv.client})</span>
                    <div className="text-[11px] text-zinc-400 font-mono">{inv.date}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-black dark:text-white">{inv.amount}</span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-black dark:text-white">
                      {inv.status}
                    </span>
                    <button className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer">
                      <Download className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: App Store */}
      {currentTab === "app-store" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-black dark:text-white">Chamber Legal App Store &amp; Integrations</h3>
              <p className="text-xs text-zinc-500">Verified third-party plugins, court API bridges, and government portal drivers.</p>
            </div>
            <span className="text-xs font-mono text-zinc-500">8 Installed • 24 Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "eCourts Live Sync Connector", category: "Court Registries", desc: "Automated case status pull and causelist sync across 1,200 court complexes.", installed: true },
              { name: "MCA 21 Corporate Filing Bridge", category: "Company Law", desc: "One-click fetch of Director DIN, registered charges, and MCA filings.", installed: true },
              { name: "IPIndia Trademark Watch", category: "Intellectual Property", desc: "Monitors published trademarks in Journal for opposition deadlines.", installed: false },
              { name: "DSC Token Hardware Driver", category: "Digital Signature", desc: "USB crypto-token bridge for Class 3 digital court filings.", installed: true },
              { name: "GSTIN Tax Intelligence Connector", category: "Taxation", desc: "Validates vendor invoices and reverse charge legal compliance.", installed: false },
              { name: "Indian Kanoon API Bridge", category: "Case Precedents", desc: "Full-text cross-citation analysis across High Courts and Tribunals.", installed: true },
            ].map((app, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs hover:border-black dark:hover:border-white transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-black dark:text-white">{app.name}</h4>
                    <span className="text-[10px] font-mono text-zinc-500">{app.category}</span>
                  </div>
                  {app.installed && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{app.desc}</p>
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
                  <button className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                    app.installed
                      ? "bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800"
                      : "bg-black text-white dark:bg-white dark:text-black"
                  }`}>
                    {app.installed ? "Configure" : "Install App"}
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
