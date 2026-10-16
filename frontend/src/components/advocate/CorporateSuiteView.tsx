"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  ClipboardCheck,
  FileText,
  FolderLock,
  CheckSquare,
  Search,
  Filter,
  Plus,
  ExternalLink,
  Download,
  Clock,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface CorporateSuiteViewProps {
  activeModule?: string;
  onSelectModule?: (mod: string) => void;
}

export function CorporateSuiteView({
  activeModule = "corp-ip-manager",
  onSelectModule,
}: CorporateSuiteViewProps) {
  const [currentTab, setCurrentTab] = useState<string>(activeModule);

  useEffect(() => {
    if (activeModule) {
      setCurrentTab(activeModule);
    }
  }, [activeModule]);

  const tabs = [
    { id: "corp-ip-manager", label: "IP Manager", icon: Shield },
    { id: "corp-compliances", label: "Compliances", icon: ClipboardCheck },
    { id: "corp-contracts", label: "Contracts", icon: FileText },
    { id: "corp-documents", label: "Documents", icon: FolderLock },
    { id: "corp-due-diligence", label: "Due Diligence", icon: CheckSquare },
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
                CORPORATE PRACTICE SUITE
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
                Companies Act, MCA &amp; IP Registry
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mt-1">
              Corporate Governance, IP, Contracts &amp; Due Diligence
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Comprehensive docketing for trademarks, secretarial compliances, commercial contract redlining, board vaults, and M&amp;A due diligence.
            </p>
          </div>
        </div>

        {/* Sub-Tabs: IP Manager | Compliances | Contracts | Documents | Due Diligence */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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

      {/* 1. IP MANAGER */}
      {currentTab === "corp-ip-manager" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: "Active Trademarks Docketed", count: "14 Marks", status: "3 In Examination", sub: "Class 9, 35, 42" },
              { title: "Copyright Applications", count: "6 Filings", status: "Software Source Code", sub: "Copyright Office, New Delhi" },
              { title: "Patent Prior Art Scrutiny", count: "2 Provisional", status: "Complete Spec Due", sub: "IPO Chennai Jurisdiction" },
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
                <span className="text-[11px] font-mono text-zinc-500 uppercase">{stat.title}</span>
                <div className="text-2xl font-bold text-black dark:text-white">{stat.count}</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium pt-1 border-t border-zinc-100 dark:border-zinc-900 flex justify-between">
                  <span>{stat.status}</span>
                  <span className="text-zinc-400 font-mono text-[10px]">{stat.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 gap-2">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">CGPDTM Trademark &amp; IP Registry Dockets</h3>
                <p className="text-xs text-zinc-500">Live docket status tracked via IP India registry.</p>
              </div>
              <button className="px-4 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider cursor-pointer w-fit">
                + New TM-A Application
              </button>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {[
                { mark: "Wakheel Legal OS", appNo: "TM-5928103", class: "Class 42 (Software)", stage: "Mark Advertised in TM Journal No. 2104", status: "Accepted & Advertised", days: "Opposition ends in 28 days" },
                { mark: "Kerala Inworth Chambers", appNo: "TM-6019284", class: "Class 45 (Legal Services)", stage: "Examination Report Issued (Sec 11 Objection)", status: "Reply Pending", days: "Reply due by 12 Nov 2026" },
                { mark: "MasoHRM Suite", appNo: "TM-5821940", class: "Class 9 & 35", stage: "Certificate of Registration Issued", status: "Registered", days: "Valid until Oct 2036" },
              ].map((row, idx) => (
                <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-black dark:text-white text-sm">{row.mark}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold">
                        {row.class}
                      </span>
                    </div>
                    <span className="text-zinc-500 text-[11px] block">{row.appNo} • {row.stage}</span>
                  </div>
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <span className="text-[11px] font-mono text-zinc-400">{row.days}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white shrink-0">
                      {row.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. COMPLIANCES */}
      {currentTab === "corp-compliances" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 gap-2">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">MCA21 &amp; ROC Annual Statutory Calendar</h3>
                <p className="text-xs text-zinc-500">Corporate secretarial deadlines under Companies Act, 2013.</p>
              </div>
              <button className="px-4 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider cursor-pointer w-fit">
                + Schedule Filing
              </button>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {[
                { form: "AOC-4 (XBRL)", company: "Coastal Logistics Private Limited", desc: "Filing of Audited Balance Sheet & P&L Statement with RoC Ernakulam", dueDate: "30 Oct 2026", status: "Ready for DSC" },
                { form: "MGT-7 / 7A", company: "Malabar Infotech Solutions Pvt Ltd", desc: "Annual Return with list of shareholders and board meetings held", dueDate: "29 Nov 2026", status: "Drafting Underway" },
                { form: "DIR-3 KYC Web", company: "All Empaneled Directors (6 Directors)", desc: "Annual Director Identification Number verification", dueDate: "Completed", status: "100% Complied" },
                { form: "DPT-3", company: "Apex Quantum FinServ OPC", desc: "Return of deposits and particulars of transactions not considered as deposit", dueDate: "Filed", status: "Acknowledged" },
              ].map((row, idx) => (
                <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-black dark:text-white text-sm">{row.form}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold">
                        {row.company}
                      </span>
                    </div>
                    <span className="text-zinc-500 text-[11px] block">{row.desc}</span>
                  </div>
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <span className="text-[11px] font-mono text-zinc-400">Due: {row.dueDate}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white shrink-0">
                      {row.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTRACTS */}
      {currentTab === "corp-contracts" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 gap-2">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">Commercial Contracts &amp; Redlining Vault</h3>
                <p className="text-xs text-zinc-500">Commercial agreements, risk scoring, indemnity audit, and electronic execution.</p>
              </div>
              <button className="px-4 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider cursor-pointer w-fit">
                + Upload Contract
              </button>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {[
                { title: "Master Services Agreement (MSA) — CyberCorp Ltd", parties: "Wakheel Chambers & CyberCorp UK", risk: "Low Risk (88 Score)", status: "Active Execution", date: "Renews Oct 2027" },
                { title: "Series-A Share Subscription & Shareholders Agreement", parties: "Apex Quantum & Lead Venture Partners", risk: "Requires Override", status: "Redlining Stage", date: "Updated 2h ago" },
                { title: "Tripartite Escrow & Commercial Lease Agreement", parties: "TechHub Kochi & Commercial Properties Ltd", risk: "Cleared", status: "Executed via E-Sign", date: "Locked in Vault" },
                { title: "Mutual Non-Disclosure Agreement (NDA)", parties: "Kochi Marine BioLabs & Pharma Co", risk: "Standard Template", status: "Counter-Signed", date: "Valid 3 Years" },
              ].map((c, i) => (
                <div key={i} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-bold text-black dark:text-white text-sm block">{c.title}</span>
                    <span className="text-zinc-500 text-[11px] block">{c.parties} • {c.date}</span>
                  </div>
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold">
                      {c.risk}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white shrink-0">
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. DOCUMENTS */}
      {currentTab === "corp-documents" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 gap-2">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">Board Resolutions &amp; Statutory Document Vault</h3>
                <p className="text-xs text-zinc-500">256-bit encrypted repository for certified true copies of resolutions and charter documents.</p>
              </div>
              <button className="px-4 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider cursor-pointer w-fit">
                + New Board Resolution
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {[
                { name: "Memorandum & Articles (MoA/AoA)", items: "3 Certified Versions", date: "Incorporation Charter" },
                { name: "Board Resolutions (Extracts)", items: "42 Passed Resolutions", date: "Signed by Chairperson" },
                { name: "General Powers of Attorney (PoA)", items: "8 Active Powers", date: "Court & RoC Submissions" },
                { name: "Statutory Registers (MGT-1/MBP-1)", items: "Members & Directors Register", date: "Updated 04 Oct 2026" },
              ].map((box, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <FolderLock className="w-5 h-5 text-black dark:text-white" />
                  <h4 className="text-xs font-bold text-black dark:text-white">{box.name}</h4>
                  <span className="text-[11px] text-zinc-500 block">{box.items}</span>
                  <span className="text-[10px] font-mono text-zinc-400 block pt-1 border-t border-zinc-200 dark:border-zinc-800">{box.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. DUE DILIGENCE */}
      {currentTab === "corp-due-diligence" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 gap-2">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">Legal Due Diligence Checklists &amp; VDR</h3>
                <p className="text-xs text-zinc-500">M&amp;A transaction diligence, litigation search, title verification, and regulatory clearance matrices.</p>
              </div>
              <button className="px-4 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider cursor-pointer w-fit">
                + Generate DD Report
              </button>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {[
                { domain: "Corporate Existence & Capital Structure", check: "Verification of Form SH-7, PAS-3 and share register", completed: "100%", status: "No Irregularities" },
                { domain: "Litigation & Dispute Search", check: "High Court of Kerala, NCLT Kochi & District Courts CNR search", completed: "94%", status: "1 Active Caveat Flagged" },
                { domain: "Real Estate Title & Leasehold Scrutiny", check: "30-year encumbrance search with Sub-Registrar Office (SRO)", completed: "100%", status: "Clear Marketable Title" },
                { domain: "Statutory & Environmental Clearances", check: "Kerala State Pollution Control Board & Fire NOC", completed: "85%", status: "Consent to Operate Renewal Pending" },
              ].map((item, idx) => (
                <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-black dark:text-white text-sm">{item.domain}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold">
                        {item.completed} Complete
                      </span>
                    </div>
                    <span className="text-zinc-500 text-[11px] block">{item.check}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white shrink-0 self-start sm:self-center">
                    {item.status}
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
