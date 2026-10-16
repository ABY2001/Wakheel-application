"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  User,
  Calendar,
  FileSpreadsheet,
  Settings,
  Grid,
  Plus,
  Shield,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FolderOpen,
  Scale,
  CreditCard,
  Layers,
  Activity,
  CheckCheck,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { advocateApi, AdvocateKpis, CauseListItem, AdvocateInvoice } from "@/lib/api";

interface ERPDashboardViewProps {
  onNavigateTab?: (tabId: string) => void;
  hideTopBanner?: boolean;
  advocateName?: string;
}

export function ERPDashboardView({
  onNavigateTab,
  hideTopBanner = false,
  advocateName = "Adv. Meera Krishnan",
}: ERPDashboardViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "profile" | "reports" | "settings" | "all">("dashboard");
  const [loading, setLoading] = useState<boolean>(true);
  const [kpis, setKpis] = useState<AdvocateKpis | null>(null);
  const [todayHearings, setTodayHearings] = useState<CauseListItem[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<AdvocateInvoice[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const data = await advocateApi.getDashboard();
        if (isMounted && data.success) {
          setKpis(data.kpis);
          setTodayHearings(data.todayHearings || []);
          setRecentInvoices(data.recentInvoices || []);
        }
      } catch (err) {
        console.error("Failed to load advocate dashboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = [
    {
      label: "Modules Active",
      value: kpis ? String(kpis.erpModulesCount) : "46",
      trend: "↑ Chamber OS",
      trendPositive: true,
      icon: Layers,
    },
    {
      label: "Active Matters & Clients",
      value: kpis ? String(kpis.activeMattersCount) : "2",
      trend: "Live",
      trendPositive: true,
      icon: Briefcase,
    },
    {
      label: "Court Hearings",
      value: kpis ? String(kpis.totalHearingsListed) : "4",
      subtext: `${kpis?.todayHearingsCount ?? 2} listed today`,
      icon: Calendar,
    },
    {
      label: "Fee Billings Collected",
      value: kpis ? `₹${kpis.totalRevenueCollected.toLocaleString("en-IN")}` : "₹37,760",
      subtext: `${kpis?.pendingInvoicesCount ?? 2} pending fee bills`,
      icon: CreditCard,
    },
  ];

  const quickAccessTiles = [
    { id: "dashboard", label: "Dashboard", tag: "Core", icon: LayoutDashboard },
    { id: "profile", label: "Profile", tag: "Core", icon: User },
    { id: "calendar", label: "Calendar", tag: "Core", icon: Calendar },
    { id: "reports", label: "Reports", tag: "Core", icon: FileSpreadsheet },
    { id: "settings", label: "Settings", tag: "Core", icon: Settings },
    { id: "research", label: "MIS / Research", tag: "Core", icon: Sparkles },
    { id: "vault", label: "CMG / Vault", tag: "Core", icon: FolderOpen },
    { id: "matters", label: "Matters Pipeline", tag: "Sales", icon: Briefcase },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      
      {/* =========================================================================
          TOP BANNER: Welcome back & Action Bar (Image 2 style)
      ========================================================================= */}
      {!hideTopBanner && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white tracking-tight">
              Welcome back, <span className="underline decoration-1 underline-offset-4">{advocateName}</span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Shield className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>ERP • Full Module Navigation &amp; Chamber OS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab && onNavigateTab("matters")}
              className="px-5 py-2.5 rounded-full bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Matter</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-NAVIGATION TABS (Commented out for now - can be added back later)
      =========================================================================
      <div className="p-2 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab("dashboard")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "dashboard"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
              : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab("profile");
            if (onNavigateTab) onNavigateTab("profile");
          }}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "profile"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
              : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => setActiveSubTab("reports")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "reports"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
              : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Reports</span>
        </button>

        <button
          onClick={() => setActiveSubTab("settings")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "settings"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
              : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => setActiveSubTab("all")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === "all"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
              : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>All Modules</span>
        </button>
      </div>
      ========================================================================= */}

      {/* =========================================================================
          4 STAT METRIC CARDS (Image 2 style)
      ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3"
            >
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
                <Icon className="w-4 h-4 text-black dark:text-white" />
                <span>{card.label}</span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-3xl sm:text-4xl font-bold text-black dark:text-white tracking-tight">
                  {card.value}
                </span>
                {card.trend && (
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
                    {card.trend}
                  </span>
                )}
                {card.subtext && (
                  <span className="text-xs font-medium text-zinc-500">
                    {card.subtext}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          QUICK ACCESS GRID (8 Tiles - Image 2 style)
      ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-black dark:text-white" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
            Quick Access
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickAccessTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={() => onNavigateTab && onNavigateTab(tile.id)}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all text-left space-y-2 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-black dark:text-white group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                    {tile.tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-black dark:text-white">
                    {tile.label}
                  </h3>
                  <span className="text-[10px] text-zinc-500">Launch Module →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TODAY'S CAUSE LIST & COURT BOARD (Live High Court & NCLT feed)
      ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-black dark:text-white" />
            <h3 className="text-sm font-bold text-black dark:text-white">
              Daily Court Board &amp; Causelist Listings
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              High Court of Kerala &amp; Tribunals
            </span>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab("calendar")}
            className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open Full Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayHearings.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500">
            No hearings listed on today's cause list board.
          </div>
        ) : (
          <div className="space-y-3">
            {todayHearings.map((hearing) => (
              <div
                key={hearing._id}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-black dark:text-white">
                      Item #{hearing.itemNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                      {hearing.courtHall}
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                      {hearing.courtName}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-black dark:text-white">
                    {hearing.caseNumber} — {hearing.petitioner} v. {hearing.respondent}
                  </div>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                    <span>Bench: {hearing.bench}</span>
                    <span>•</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Stage: {hearing.stage}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white uppercase tracking-wider">
                    {hearing.status}
                  </span>
                  <button
                    onClick={() => onNavigateTab && onNavigateTab("notes")}
                    className="px-3 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer hover:opacity-85 transition-opacity"
                  >
                    Chamber Memo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          RECENT ACTIVITY STREAM & FEE BILLING (Live Invoices)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-black dark:text-white" />
              <h3 className="text-sm font-bold text-black dark:text-white">
                Chamber Activity Stream
              </h3>
            </div>
            <span className="text-xs text-zinc-500 font-mono">Live</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                  <CheckCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-black dark:text-white font-medium">
                  Listed Item #14 in Court Hall 2A for WP(C) 19482/2024
                </span>
              </div>
              <span className="text-zinc-500 text-[11px] font-mono shrink-0">Today</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-black dark:text-white font-medium">
                  Client Video Consultation with Gopakumar Nambiar confirmed
                </span>
              </div>
              <span className="text-zinc-500 text-[11px] font-mono shrink-0">3d away</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </div>
                <span className="text-black dark:text-white font-medium">
                  Precedent Note on Valsamma v. KSEB compiled for Writ Petition
                </span>
              </div>
              <span className="text-zinc-500 text-[11px] font-mono shrink-0">4d ago</span>
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-black dark:text-white" />
              <h3 className="text-sm font-bold text-black dark:text-white">
                Fee Invoices &amp; Retainers
              </h3>
            </div>
            <span className="text-xs text-zinc-500 font-mono">GST Compliant</span>
          </div>

          <div className="space-y-3">
            {recentInvoices.map((inv) => (
              <div
                key={inv._id}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-black dark:text-white font-mono">
                      {inv.invoiceNumber}
                    </span>
                    <span
                      className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                        inv.status === "paid"
                          ? "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white"
                          : inv.status === "partially_paid"
                          ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700"
                          : "bg-black text-white dark:bg-white dark:text-black"
                      }`}
                    >
                      {inv.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">
                    {inv.clientName} • {inv.matterTitle}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-black dark:text-white font-mono">
                    ₹{inv.totalAmount.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-zinc-400">Via {inv.paymentMethod}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
