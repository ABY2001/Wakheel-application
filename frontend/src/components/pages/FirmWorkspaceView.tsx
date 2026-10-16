"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  LayoutDashboard,
  Calendar,
  FileText,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Briefcase,
  Search,
  Plus,
  PhoneCall,
  Bell,
  Scale,
  Shield,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Download,
  Filter,
  Layers,
  ArrowRight,
  Receipt,
  FolderLock,
  Stamp,
  X,
  Phone,
  BarChart3,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

interface FirmWorkspaceViewProps {
  firmData?: any;
}

export function FirmWorkspaceView({ firmData }: FirmWorkspaceViewProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [newFilingModalOpen, setNewFilingModalOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Active Firm State
  const [firm, setFirm] = useState<any>({
    name: "Apex Law & Corporate Partners LLP",
    founderName: "CS Rajesh Sharma & Adv. Vikram Mehra",
    headquarters: "New Delhi, India",
    registrationCin: "LLPIN-AAR-4192 / D/1942/2012",
    industry: "Corporate Law, Secretarial Governance & Litigation",
    employeeRange: "11 to 50 attorneys & staff",
    companyType: "Limited Liability Partnership (LLP)",
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("wakheel_firm_profile");
      if (stored) {
        setFirm(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Menu Categories for Company Secretary & Corporate Firm
  const menuSections = [
    {
      category: "CORE COMPLIANCE",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          subtitle: "Corporate compliance & executive board",
          icon: LayoutDashboard,
        },
        {
          id: "roc-filings",
          label: "ROC & MCA Filings",
          subtitle: "AOC-4, MGT-7, DIR-3 KYC & e-forms",
          icon: FileCheck,
        },
        {
          id: "compliance-calendar",
          label: "Compliance Calendar",
          subtitle: "Statutory deadlines & ROC timeline",
          icon: Calendar,
        },
        {
          id: "corporate-entities",
          label: "Managed Entities",
          subtitle: "Client companies & LLP register",
          icon: Building2,
        },
      ],
    },
    {
      category: "SECRETARIAL & GOVERNANCE",
      items: [
        {
          id: "board-meetings",
          label: "Board & AGMs",
          subtitle: "Notices, agendas & meeting minutes",
          icon: Users,
        },
        {
          id: "resolutions",
          label: "Resolutions Register",
          subtitle: "Board resolutions & circular approvals",
          icon: Stamp,
        },
        {
          id: "secretarial-audit",
          label: "Secretarial Audit",
          subtitle: "Form MR-3 compliance checklists",
          icon: ShieldCheck,
        },
        {
          id: "statutory-registers",
          label: "Statutory Registers",
          subtitle: "Members, directors & charges (Sec 88)",
          icon: Layers,
        },
      ],
    },
    {
      category: "LEGAL & ADVOCACY GATEWAY",
      items: [
        {
          id: "retainer-advocates",
          label: "Advocate Network",
          subtitle: "Litigation counsel & court appearance",
          icon: Scale,
        },
        {
          id: "contracts",
          label: "Commercial Contracts",
          subtitle: "Shareholder agreements, NDAs & audit",
          icon: FileText,
        },
        {
          id: "vault",
          label: "Document Vault",
          subtitle: "Signed digital forms & board packs",
          icon: FolderLock,
        },
        {
          id: "billing",
          label: "Client Invoices",
          subtitle: "Secretarial retainers & MCA challans",
          icon: Receipt,
        },
      ],
    },
  ];

  const filteredSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.label.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
          section.category.toLowerCase().includes(sidebarSearch.toLowerCase())
      ),
    }))
    .filter((sec) => sec.items.length > 0);

  return (
    <div className="h-screen w-screen flex bg-white dark:bg-black text-black dark:text-white font-sans overflow-hidden transition-colors duration-200">
      
      {/* =========================================================================
          LEFT SIDEBAR (Company Secretary / Firm Management)
      ========================================================================= */}
      <aside
        className={`${
          sidebarOpen ? "w-80" : "w-18"
        } shrink-0 bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 flex flex-col justify-between z-20 shadow-xs`}
      >
        {/* Top Branding Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            {sidebarOpen ? (
              <div className="flex items-center gap-2">
                <BrandLogo size="sm" />
                <span className="px-2 py-0.5 rounded-full border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold font-mono">
                  LAW FIRM
                </span>
              </div>
            ) : (
              <Link href="/" className="flex items-center justify-center mx-auto" title="wakheel">
                <img
                  src="/logo-transparent.png"
                  alt="wakheel"
                  className="h-7 w-auto object-contain"
                />
              </Link>
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Search Filter */}
          {sidebarOpen && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter compliance modules..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-all font-sans"
              />
            </div>
          )}
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-5">
          {filteredSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {sidebarOpen && (
                <span className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1.5">
                  {sec.category}
                </span>
              )}

              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-start gap-3 p-2 rounded-xl text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? "text-white dark:text-black" : "text-zinc-500"}`} />
                    {sidebarOpen && (
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-semibold leading-tight truncate">{item.label}</span>
                        <span className={`text-[10px] leading-tight truncate mt-0.5 ${isActive ? "text-zinc-300 dark:text-zinc-600 font-normal" : "text-zinc-400"}`}>
                          {item.subtitle}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Bottom Profile Card */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center shrink-0">
                CS
              </div>
              {sidebarOpen && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-black dark:text-white truncate">
                    {firm.founderName || "CS Rajesh Sharma"}
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate">
                    Company Secretary • {firm.name}
                  </span>
                </div>
              )}
            </div>
            {sidebarOpen && <ThemeToggle />}
          </div>
        </div>
      </aside>

      {/* =========================================================================
          RIGHT MAIN CANVAS (Firm Executive Center)
      ========================================================================= */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        
        {/* Top Header Bar */}
        <header className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center justify-between shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-black dark:text-white tracking-tight">
                Welcome back, <span className="underline decoration-1 underline-offset-4">{firm.founderName}</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900">
                ICSI Verified
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Shield className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>
                Wakheel Corporate OS • {firm.name} • {firm.registrationCin}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setPhoneModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>ROC Hotline</span>
            </button>

            <button
              onClick={() => setNotificationsOpen(true)}
              className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-black dark:bg-white" />
            </button>

            <button
              onClick={() => setNewFilingModalOpen(true)}
              className="px-4 py-2 rounded-full bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New MCA Filing</span>
            </button>
          </div>
        </header>

        {/* Dynamic Views Content Canvas */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          
          {/* VIEW: Dashboard */}
          {activeTab === "dashboard" && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Executive Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Managed Client Entities", value: "24", subtext: "19 Pvt Ltd • 5 LLPs", icon: Building2 },
                  { label: "Overall Compliance Health", value: "98.2%", subtext: "All statutory registers updated", icon: ShieldCheck },
                  { label: "Upcoming MCA Deadlines", value: "6", subtext: "Next due: DIR-3 KYC in 5 days", icon: Calendar },
                  { label: "Active Retainers", value: "₹4.8L", subtext: "Monthly corporate retainer billing", icon: Receipt },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="text-[11px] font-mono uppercase font-bold">{stat.label}</span>
                        <Icon className="w-4 h-4 text-black dark:text-white" />
                      </div>
                      <div className="text-2xl font-bold text-black dark:text-white">{stat.value}</div>
                      <div className="text-[11px] text-zinc-500">{stat.subtext}</div>
                    </div>
                  );
                })}
              </div>

              {/* Action Banner: Connect to Advocates */}
              <div className="p-6 rounded-3xl bg-black text-white dark:bg-white dark:text-black flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-white dark:text-black" />
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                      WAKHEEL INTEGRATED ADVOCACY BRIDGE
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">
                    Need High Court representation or litigation counsel?
                  </h3>
                  <p className="text-xs opacity-80 max-w-xl">
                    As a Company Secretary, connect your corporate clients directly with verified High Court &amp; Supreme Court advocates for NCLT insolvency, commercial suits, and arbitration.
                  </p>
                </div>
                <Link
                  href="/advocate-workspace"
                  className="px-5 py-2.5 rounded-full bg-white text-black dark:bg-black dark:text-white text-xs font-bold uppercase tracking-wider transition-all hover:opacity-90 shrink-0 self-start sm:self-center"
                >
                  Explore Advocate Chamber →
                </Link>
              </div>

              {/* Two Column Layout: Filings Table & Upcoming Deadlines */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent MCA Filings (2 Cols) */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-black dark:text-white" />
                      <h3 className="text-sm font-bold text-black dark:text-white">Recent MCA21 &amp; ROC Filings</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab("roc-filings")}
                      className="text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-900 text-xs">
                    {[
                      { form: "AOC-4", entity: "CyberCorp Technologies Pvt Ltd", desc: "Financial Statements FY 2025-26", status: "Approved", date: "Today, 11:30 AM" },
                      { form: "MGT-7", entity: "Heritage Real Estate Developers LLP", desc: "Annual Return & Shareholding Pattern", status: "Under Review", date: "Yesterday" },
                      { form: "DIR-3 KYC", entity: "Vikram Malhotra (Director DIN: 08912340)", desc: "Annual Web KYC Verification", status: "Approved", date: "12 Oct 2026" },
                      { form: "PAS-3", entity: "Zenith FinTech India Pvt Ltd", desc: "Return of Allotment (Series A Shares)", status: "Challan Paid", date: "10 Oct 2026" },
                    ].map((row, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between gap-3">
                        <div className="space-y-0.5 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white">
                              {row.form}
                            </span>
                            <span className="font-semibold text-black dark:text-white truncate">{row.entity}</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 truncate">{row.desc}</p>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.status === "Approved"
                              ? "bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800"
                              : "bg-zinc-50 dark:bg-zinc-900 text-zinc-500"
                          }`}>
                            {row.status}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono mt-0.5">{row.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Statutory Deadlines (1 Col) */}
                <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-black dark:text-white" />
                      <h3 className="text-sm font-bold text-black dark:text-white">Statutory Deadlines</h3>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold">OCTOBER 2026</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { due: "30 Oct", label: "AOC-4 Annual Filing", detail: "Due within 30 days of AGM for Pvt Ltds", daysLeft: "16 days left" },
                      { due: "20 Oct", label: "GSTR-3B Monthly Return", detail: "Statutory GST filing for corporate clients", daysLeft: "6 days left" },
                      { due: "28 Nov", label: "MGT-7 Annual Return", detail: "Due within 60 days of AGM", daysLeft: "45 days left" },
                      { due: "15 Dec", label: "Advance Tax Q3 Instalment", detail: "Corporate advance tax remittance", daysLeft: "62 days left" },
                    ].map((d, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-black dark:text-white">{d.label}</span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black">
                            {d.due}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500">{d.detail}</p>
                        <span className="text-[10px] text-zinc-400 font-mono block pt-0.5">{d.daysLeft}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* VIEW: ROC & MCA Filings */}
          {activeTab === "roc-filings" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h2 className="text-xl font-bold text-black dark:text-white">MCA21 &amp; ROC E-Filing Hub</h2>
                  <p className="text-xs text-zinc-500">Track and generate e-forms, annual filings, DIN changes, and charge creations.</p>
                </div>
                <button
                  onClick={() => setNewFilingModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start New E-Form</span>
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { code: "AOC-4", name: "Balance Sheet & P&L", fee: "₹600 fee", deadline: "30 days from AGM" },
                    { code: "MGT-7", name: "Annual Return", fee: "₹600 fee", deadline: "60 days from AGM" },
                    { code: "DIR-3 KYC", name: "Director Annual KYC", fee: "Free (prior to due)", deadline: "Annual 30 Sep" },
                    { code: "PAS-3", name: "Return of Allotment", fee: "₹600 fee", deadline: "30 days of allotment" },
                    { code: "CHG-1", name: "Creation/Modification of Charge", fee: "₹600 fee", deadline: "30 days of creation" },
                    { code: "INC-22", name: "Change of Registered Office", fee: "₹600 fee", deadline: "30 days of shifting" },
                  ].map((form, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black">
                          {form.code}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">{form.fee}</span>
                      </div>
                      <h4 className="text-xs font-bold text-black dark:text-white">{form.name}</h4>
                      <p className="text-[10px] text-zinc-400">Statutory Window: {form.deadline}</p>
                      <button
                        onClick={() => setNewFilingModalOpen(true)}
                        className="w-full mt-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        Prepare E-Form →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Fallback for other tabs */}
          {["compliance-calendar", "corporate-entities", "board-meetings", "resolutions", "secretarial-audit", "statutory-registers", "retainer-advocates", "contracts", "vault", "billing"].includes(activeTab) && (
            <div className="max-w-4xl mx-auto p-12 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mx-auto font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-black dark:text-white capitalize">
                {activeTab.replace(/-/g, " ")} Suite
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Dedicated secretarial management for {firm.name}. Track client entities, generate certified true copies, and manage statutory registers.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* =========================================================================
          MODAL: New MCA Filing
      ========================================================================= */}
      {newFilingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 text-black dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-black dark:text-white" />
                <h3 className="text-sm font-bold text-black dark:text-white">Initiate New MCA21 E-Filing</h3>
              </div>
              <button
                onClick={() => setNewFilingModalOpen(false)}
                className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold block">Target Client Entity</label>
                <select className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                  <option>CyberCorp Technologies Pvt Ltd (CIN: U74999DL2018PTC123456)</option>
                  <option>Heritage Real Estate Developers LLP (LLPIN: AAR-8902)</option>
                  <option>Zenith FinTech India Pvt Ltd (CIN: U67190DL2021PTC389012)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold block">Select E-Form</label>
                <select className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                  <option>Form AOC-4 — Filing financial statements &amp; balance sheet</option>
                  <option>Form MGT-7 — Annual Return of the Company</option>
                  <option>Form DIR-3 KYC — Annual Director Web KYC</option>
                  <option>Form PAS-3 — Return of Allotment</option>
                  <option>Form CHG-1 — Creation or modification of Charge</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold block">Company Secretary Digital Signature (DSC)</label>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold">{firm.founderName} (FCS DSC Active)</span>
                  <ShieldCheck className="w-4 h-4 text-black dark:text-white" />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setNewFilingModalOpen(false)}
                className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("MCA21 E-Form draft generated and ready for digital signing.");
                  setNewFilingModalOpen(false);
                }}
                className="px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer"
              >
                Generate &amp; Pre-Fill Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ROC Hotline
      ========================================================================= */}
      {phoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-black dark:text-white" />
                <h3 className="text-sm font-bold text-black dark:text-white">ROC &amp; MCA Helpdesk Speed Dial</h3>
              </div>
              <button
                onClick={() => setPhoneModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { name: "Registrar of Companies (ROC Delhi)", number: "+91 11 2469 0070", type: "ROC Office" },
                { name: "MCA21 V3 Technical Helpdesk", number: "+91 120 483 2500", type: "Portal Support" },
                { name: "ICSI Helpdesk (Secretarial Standards)", number: "+91 11 4534 1000", type: "ICSI HQ" },
              ].map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-black dark:text-white block">{c.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{c.number} • {c.type}</span>
                  </div>
                  <button className="px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer">
                    Call
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPhoneModalOpen(false)}
                className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: Notifications Dropdown
      ========================================================================= */}
      {notificationsOpen && (
        <div className="fixed top-20 right-18 z-50 w-80 sm:w-96 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 shadow-2xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-black dark:text-white" />
              <h4 className="text-xs font-bold text-black dark:text-white">Corporate Alerts (2)</h4>
            </div>
            <button
              onClick={() => setNotificationsOpen(false)}
              className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-black dark:text-white block">Form AOC-4 Approved</span>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">SRN #F8910482 approved by ROC Delhi with zero penalty.</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-black dark:text-white block">DIR-3 KYC Deadline Approaching</span>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">3 directors pending biometric KYC before 30 October.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
