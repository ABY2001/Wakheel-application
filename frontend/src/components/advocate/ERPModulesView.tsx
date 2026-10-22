"use client";

import React, { useState, useEffect } from "react";
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
  RefreshCw,
  X,
  FileText,
  Check,
  AlertCircle,
  Shield,
  Scale,
  ChevronRight,
  User,
  Users,
  Briefcase,
  FileCheck,
  Landmark,
  Receipt,
  ExternalLink,
} from "lucide-react";
import {
  advocateApi,
  AdvocateInvoice,
  TrustTransactionItem,
  ChamberExpenseItem,
  AssociateItem,
  ErpOverviewData,
} from "@/lib/api";

interface ERPModulesViewProps {
  activeModule?: string;
  onSelectModule?: (mod: string) => void;
  token?: string;
  advocateName?: string;
}

export function ERPModulesView({
  activeModule = "acmaso",
  onSelectModule,
  token,
  advocateName = "Adv. Meera Krishnan",
}: ERPModulesViewProps) {
  // Normalize initial tab
  const getInitialTab = (mod: string) => {
    if (mod === "billings-earnings") return "acmaso";
    if (["huremaso", "curemaso", "acmaso", "app-store"].includes(mod)) return mod;
    return "acmaso";
  };

  const [currentTab, setCurrentTab] = useState<string>(getInitialTab(activeModule));
  const [acmasoSubTab, setAcmasoSubTab] = useState<"invoices" | "trust" | "expenses" | "gst">("invoices");

  // Data states
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [erpOverview, setErpOverview] = useState<ErpOverviewData | null>(null);
  const [invoices, setInvoices] = useState<AdvocateInvoice[]>([]);
  const [trustTransactions, setTrustTransactions] = useState<TrustTransactionItem[]>([]);
  const [expenses, setExpenses] = useState<ChamberExpenseItem[]>([]);
  const [associates, setAssociates] = useState<AssociateItem[]>([]);

  // Filtering states
  const [invoiceFilter, setInvoiceFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState<boolean>(false);
  const [showTrustModal, setShowTrustModal] = useState<boolean>(false);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [showAssociateModal, setShowAssociateModal] = useState<boolean>(false);

  // Form states
  const [newInvoiceData, setNewInvoiceData] = useState({
    clientName: "",
    matterTitle: "",
    description: "",
    amount: "",
    gstRate: "18",
    dueDate: "",
  });

  const [newTrustData, setNewTrustData] = useState({
    type: "deposit",
    clientName: "",
    matterTitle: "",
    amount: "",
    purpose: "",
    referenceNumber: "",
  });

  const [newExpenseData, setNewExpenseData] = useState({
    matterTitle: "",
    clientName: "",
    category: "Court Fee Stamps & Welfare",
    amount: "",
    description: "",
    paidBy: "Chamber Petty Cash",
    isReimbursable: true,
  });

  const [newAssociateData, setNewAssociateData] = useState({
    fullName: "",
    role: "Litigation Junior (Writs & Civil)",
    enrollmentNumber: "",
    phone: "",
    email: "",
    courtPass: "KHCAA Golden Jubilee Pass",
    activeMattersAssigned: "4",
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync prop changes
  useEffect(() => {
    setCurrentTab(getInitialTab(activeModule));
  }, [activeModule]);

  const handleTabChange = (id: string) => {
    setCurrentTab(id);
    if (onSelectModule) onSelectModule(id);
  };

  // Load all ERP datasets
  const loadErpData = async () => {
    try {
      setRefreshing(true);
      const [overviewRes, invoicesRes, trustRes, expensesRes, associatesRes] = await Promise.all([
        advocateApi.getErpOverview(token),
        advocateApi.getInvoices(token),
        advocateApi.getTrustTransactions(token),
        advocateApi.getExpenses(token),
        advocateApi.getAssociates(token),
      ]);

      if (overviewRes.success) {
        setErpOverview({
          financials: overviewRes.financials,
          counts: overviewRes.counts,
        });
      }
      if (invoicesRes.success && Array.isArray(invoicesRes.invoices)) {
        setInvoices(invoicesRes.invoices);
      }
      if (trustRes.success && Array.isArray(trustRes.transactions)) {
        setTrustTransactions(trustRes.transactions);
      }
      if (expensesRes.success && Array.isArray(expensesRes.expenses)) {
        setExpenses(expensesRes.expenses);
      }
      if (associatesRes.success && Array.isArray(associatesRes.associates)) {
        setAssociates(associatesRes.associates);
      }
    } catch (err) {
      console.error("Error loading chamber ERP data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadErpData();
  }, [token]);

  // Invoice creation submission
  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceData.clientName || !newInvoiceData.amount) return;

    try {
      const subtotal = Number(newInvoiceData.amount) || 0;
      const gstRate = Number(newInvoiceData.gstRate) || 18;
      const gstAmount = Math.round((subtotal * gstRate) / 100);
      const totalAmount = subtotal + gstAmount;

      const payload = {
        clientName: newInvoiceData.clientName,
        matterTitle: newInvoiceData.matterTitle || "Advocate Professional Representation",
        items: [
          {
            description: newInvoiceData.description || "High Court Professional Drafting & Representation",
            category: "Professional Fee",
            sacCode: "9982",
            amount: subtotal,
          },
        ],
        subtotal,
        gstRate,
        gstAmount,
        totalAmount,
        dueDate: newInvoiceData.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      };

      const res = await advocateApi.createInvoice(payload, token);
      if (res.success && res.invoice) {
        setInvoices((prev) => [res.invoice, ...prev]);
        setShowCreateInvoiceModal(false);
        showToast(`Tax invoice for ₹${totalAmount.toLocaleString("en-IN")} generated successfully.`);
        loadErpData();
        setNewInvoiceData({
          clientName: "",
          matterTitle: "",
          description: "",
          amount: "",
          gstRate: "18",
          dueDate: "",
        });
      }
    } catch (err) {
      console.error("Error creating invoice:", err);
      showToast("Failed to create tax invoice.");
    }
  };

  // Mark invoice paid
  const handleMarkInvoicePaid = async (invId: string) => {
    try {
      const res = await advocateApi.updateInvoiceStatus(invId, "paid", "UPI / Direct Bank Transfer", token);
      if (res.success && res.invoice) {
        setInvoices((prev) => prev.map((i) => (i._id === invId ? res.invoice : i)));
        showToast("Invoice marked as Paid.");
        loadErpData();
      }
    } catch (err) {
      console.error("Error updating invoice status:", err);
    }
  };

  // Trust transaction submission
  const handleTrustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrustData.clientName || !newTrustData.amount) return;

    try {
      const res = await advocateApi.addTrustTransaction(
        {
          type: newTrustData.type,
          clientName: newTrustData.clientName,
          matterTitle: newTrustData.matterTitle,
          amount: Number(newTrustData.amount) || 0,
          purpose: newTrustData.purpose || "Client Advance Escrow Deposit",
          referenceNumber: newTrustData.referenceNumber || `UTR/${Date.now().toString().slice(-6)}`,
          verifiedBy: advocateName,
        },
        token
      );

      if (res.success && res.transaction) {
        setTrustTransactions((prev) => [res.transaction, ...prev]);
        setShowTrustModal(false);
        showToast("Trust escrow transaction successfully recorded in segregated ledger.");
        loadErpData();
        setNewTrustData({
          type: "deposit",
          clientName: "",
          matterTitle: "",
          amount: "",
          purpose: "",
          referenceNumber: "",
        });
      }
    } catch (err) {
      console.error("Error adding trust transaction:", err);
      showToast("Failed to record trust escrow transaction.");
    }
  };

  // Expense submission
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseData.amount || !newExpenseData.description) return;

    try {
      const res = await advocateApi.addExpense(
        {
          matterTitle: newExpenseData.matterTitle || "General Chamber Operations",
          clientName: newExpenseData.clientName || "Chamber Overhead",
          category: newExpenseData.category,
          amount: Number(newExpenseData.amount) || 0,
          description: newExpenseData.description,
          paidBy: newExpenseData.paidBy,
          isReimbursable: newExpenseData.isReimbursable,
        },
        token
      );

      if (res.success && res.expense) {
        setExpenses((prev) => [res.expense, ...prev]);
        setShowExpenseModal(false);
        showToast("Chamber disbursement logged successfully.");
        loadErpData();
        setNewExpenseData({
          matterTitle: "",
          clientName: "",
          category: "Court Fee Stamps & Welfare",
          amount: "",
          description: "",
          paidBy: "Chamber Petty Cash",
          isReimbursable: true,
        });
      }
    } catch (err) {
      console.error("Error adding expense:", err);
      showToast("Failed to log disbursement.");
    }
  };

  // Associate submission
  const handleAssociateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssociateData.fullName) return;

    try {
      const res = await advocateApi.addAssociate(
        {
          fullName: newAssociateData.fullName,
          role: newAssociateData.role,
          enrollmentNumber: newAssociateData.enrollmentNumber || "Bar Credentials Verified",
          phone: newAssociateData.phone,
          email: newAssociateData.email,
          courtPass: newAssociateData.courtPass,
          activeMattersAssigned: Number(newAssociateData.activeMattersAssigned) || 1,
        },
        token
      );

      if (res.success && res.associate) {
        setAssociates((prev) => [res.associate, ...prev]);
        setShowAssociateModal(false);
        showToast(`Chamber associate ${res.associate.fullName} registered.`);
        loadErpData();
        setNewAssociateData({
          fullName: "",
          role: "Litigation Junior (Writs & Civil)",
          enrollmentNumber: "",
          phone: "",
          email: "",
          courtPass: "KHCAA Golden Jubilee Pass",
          activeMattersAssigned: "4",
        });
      }
    } catch (err) {
      console.error("Error onboarding associate:", err);
      showToast("Failed to register chamber personnel.");
    }
  };

  const tabs = [
    { id: "acmaso", label: "Acmaso - Accounts & Trust", icon: CreditCard },
    { id: "huremaso", label: "Huremaso - HRM", icon: UserCheck },
    { id: "curemaso", label: "Curemaso - CRM", icon: HeartHandshake },
    { id: "app-store", label: "App Store", icon: Grid },
  ];

  // Financial aggregates
  const totalBilled = erpOverview?.financials?.totalBilled ?? invoices.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  const totalCollected = erpOverview?.financials?.totalCollected ?? invoices.filter((i) => i.status === "paid").reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  const trustBalance = erpOverview?.financials?.trustEscrowBalance ?? 650000;
  const totalExpenses = erpOverview?.financials?.totalExpenses ?? expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalGst = erpOverview?.financials?.totalGstBilled ?? 15840;

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (invoiceFilter === "paid" && inv.status !== "paid") return false;
    if (invoiceFilter === "pending" && inv.status === "paid") return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.invoiceNumber?.toLowerCase().includes(q) ||
      inv.clientName?.toLowerCase().includes(q) ||
      inv.matterTitle?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-black dark:text-white" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-zinc-400 hover:text-black dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">
              Law Practice ERP &amp; Trust Accounting
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
              Chamber OS Suite
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Accounts &amp; Trust Escrow (IOLTA), Huremaso HRM (associates &amp; clerks), Curemaso CRM (retainers), and Court Integrations.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadErpData}
            disabled={refreshing}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
            title="Sync Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Sub-Tabs Nav */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                      : "text-zinc-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW: ACMASO - ACCOUNTS, BILLING & TRUST ESCROW                */}
      {/* ============================================================== */}
      {currentTab === "acmaso" && (
        <div className="space-y-6">
          {/* 4 Financial KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* KPI 1: Billed Revenue */}
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Fee Realization</span>
                <DollarSign className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-black dark:text-white font-mono">
                ₹{totalCollected.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                of ₹{totalBilled.toLocaleString("en-IN")} billed ({invoices.length} bills)
              </p>
            </div>

            {/* KPI 2: Segregated Trust Escrow */}
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Trust Escrow (IOLTA)</span>
                <Landmark className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-black dark:text-white font-mono">
                ₹{trustBalance.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                Segregated client funds (BCI Rule 24)
              </p>
            </div>

            {/* KPI 3: Disbursements & Court Expenses */}
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Disbursements</span>
                <Receipt className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-black dark:text-white font-mono">
                ₹{totalExpenses.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                Court stamps, postage &amp; clerkage
              </p>
            </div>

            {/* KPI 4: GST Compliance */}
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">GST Output (SAC 9982)</span>
                <Shield className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-black dark:text-white font-mono">
                ₹{totalGst.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                18% RCM / Forward charge compliant
              </p>
            </div>
          </div>

          {/* Acmaso Sub-Nav Pills */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center space-x-2 text-xs">
              {[
                { id: "invoices", label: "Fee Invoices & Bills", count: invoices.length },
                { id: "trust", label: "Client Trust Escrow Ledger", count: trustTransactions.length },
                { id: "expenses", label: "Court Disbursements & Stamps", count: expenses.length },
                { id: "gst", label: "GST & RCM Legal Compliance" },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setAcmasoSubTab(sub.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    acmasoSubTab === sub.id
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <span>{sub.label}</span>
                  {sub.count !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {sub.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Action Button based on sub-tab */}
            <div>
              {acmasoSubTab === "invoices" && (
                <button
                  onClick={() => setShowCreateInvoiceModal(true)}
                  className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Create Tax Invoice</span>
                </button>
              )}
              {acmasoSubTab === "trust" && (
                <button
                  onClick={() => setShowTrustModal(true)}
                  className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Record Trust Entry</span>
                </button>
              )}
              {acmasoSubTab === "expenses" && (
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Record Disbursement</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub-view 1: Invoices */}
          {acmasoSubTab === "invoices" && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search invoices by client, invoice number, or matter..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white placeholder:text-zinc-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-1.5 text-xs">
                  {["all", "paid", "pending"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setInvoiceFilter(f)}
                      className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[11px] transition-colors cursor-pointer ${
                        invoiceFilter === f
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Invoices List */}
              <div className="rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                {filteredInvoices.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Receipt className="w-6 h-6 mx-auto text-zinc-400" />
                    <p className="text-xs text-zinc-500">No invoices matched your filter.</p>
                  </div>
                ) : (
                  filteredInvoices.map((inv) => (
                    <div
                      key={inv._id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-black dark:text-white">
                            {inv.invoiceNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                            {inv.status}
                          </span>
                        </div>
                        <p className="font-semibold text-black dark:text-white truncate">
                          {inv.clientName}
                        </p>
                        <p className="text-[11px] text-zinc-500 truncate">
                          {inv.matterTitle}
                        </p>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          Due: {inv.dueDate || "Immediate"} • SAC: 9982 (Legal Services)
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="font-mono font-black text-sm text-black dark:text-white">
                            ₹{(inv.totalAmount || 0).toLocaleString("en-IN")}
                          </p>
                          <span className="text-[10px] text-zinc-400 font-mono block">
                            (Base: ₹{(inv.subtotal || 0).toLocaleString("en-IN")} + GST ₹{(inv.gstAmount || 0).toLocaleString("en-IN")})
                          </span>
                        </div>

                        {inv.status !== "paid" ? (
                          <button
                            onClick={() => handleMarkInvoicePaid(inv._id)}
                            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold text-xs text-black dark:text-white cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
                            Paid via UPI/Bank
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Sub-view 2: Client Trust Escrow Ledger */}
          {acmasoSubTab === "trust" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-start space-x-3 text-xs">
                <Shield className="w-5 h-5 text-black dark:text-white shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-black dark:text-white">
                    Bar Council of India Rule 24 Compliant Trust Accounting
                  </p>
                  <p className="text-zinc-500 text-[11px]">
                    All client advances, court registry security deposits, and commissioner remuneration are segregated into an ethical escrow ledger. Chamber operating funds are strictly prohibited from comingling.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                {trustTransactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                          {tx.type}
                        </span>
                        <span className="font-mono text-zinc-400 text-[11px]">{tx.date}</span>
                        <span className="font-mono text-zinc-400 text-[11px]">• Ref: {tx.referenceNumber}</span>
                      </div>
                      <p className="font-bold text-black dark:text-white">{tx.clientName}</p>
                      <p className="text-[11px] text-zinc-500">{tx.purpose}</p>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        Matter: {tx.matterTitle} • Verified by: {tx.verifiedBy}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`font-mono font-black text-sm ${
                          tx.type === "deposit" ? "text-black dark:text-white" : "text-zinc-500"
                        }`}
                      >
                        {tx.type === "deposit" ? "+" : "-"} ₹{(tx.amount || 0).toLocaleString("en-IN")}
                      </p>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-view 3: Chamber Disbursements */}
          {acmasoSubTab === "expenses" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                {expenses.map((exp) => (
                  <div
                    key={exp._id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-black dark:text-white">{exp.category}</span>
                        <span className="text-zinc-400 font-mono text-[11px]">• {exp.date}</span>
                        {exp.isReimbursable && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                            Client Reimbursable
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-300 text-xs">{exp.description}</p>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        Matter: {exp.matterTitle} • Paid by: {exp.paidBy} • Receipt: {exp.receiptNumber}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-mono font-black text-sm text-black dark:text-white">
                        ₹{(exp.amount || 0).toLocaleString("en-IN")}
                      </p>
                      <span className="text-[10px] text-zinc-500 font-mono uppercase">{exp.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-view 4: GST Compliance */}
          {acmasoSubTab === "gst" && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-black dark:text-white">
                    Indian GST Framework for Legal Services (SAC 9982)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Statutory guidelines governed by Notification No. 13/2017-Central Tax (Rate) as amended.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <span className="font-bold text-black dark:text-white block uppercase tracking-wider text-[11px]">
                      1. Reverse Charge Mechanism (RCM)
                    </span>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                      Legal services provided by an individual advocate, senior advocate, or firm of advocates to any <strong>Business Entity</strong> located in taxable territory with aggregate turnover exceeding statutory threshold (₹20L / ₹40L) are subject to <strong>100% Reverse Charge</strong>. The recipient entity pays the 18% GST directly to the exchequer.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <span className="font-bold text-black dark:text-white block uppercase tracking-wider text-[11px]">
                      2. Exemption for Individual Citizens
                    </span>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                      Services provided by an advocate to any person other than a business entity (e.g. individual citizens in civil, family, property, or consumer matters) or to a business entity with turnover below the threshold are <strong>completely exempt from GST</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Chamber GSTIN Status</span>
                    <span className="font-bold text-black dark:text-white">32AABFK1429K1Z4 (Ernakulam Ward 2)</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">GSTR-3B Period</span>
                    <span className="font-bold text-black dark:text-white">Oct 2026 (Due Nov 20)</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Total GST Billed</span>
                    <span className="font-bold text-black dark:text-white">₹{totalGst.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW: HUREMASO - HUMAN RESOURCE MANAGEMENT                     */}
      {/* ============================================================== */}
      {currentTab === "huremaso" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Chamber Advocates</span>
              <div className="text-xl font-bold text-black dark:text-white font-mono">{associates.length} Personnel</div>
              <span className="text-[10px] text-zinc-500">Enrolled with Bar Council</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Court Registry Passes</span>
              <div className="text-xl font-bold text-black dark:text-white font-mono">100% Active</div>
              <span className="text-[10px] text-zinc-500">High Court complex passes</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Attendance Today</span>
              <div className="text-xl font-bold text-black dark:text-white font-mono">3 on Court Duty</div>
              <span className="text-[10px] text-zinc-500">Court halls &amp; registry</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Stipend &amp; Payroll</span>
              <div className="text-xl font-bold text-black dark:text-white font-mono">Due 31st Oct</div>
              <span className="text-[10px] text-zinc-500">Direct account transfer</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white">
                  Chamber Associates &amp; Registry Personnel Roster
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Senior associates, junior advocates, and court filing clerks.
                </p>
              </div>
              <button
                onClick={() => setShowAssociateModal(true)}
                className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer hover:opacity-90"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Personnel</span>
              </button>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {associates.map((asc) => (
                <div
                  key={asc._id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-black dark:text-white">{asc.fullName}</span>
                      <span className="text-zinc-500 text-[11px]">({asc.role})</span>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-400">
                      Enrollment: {asc.enrollmentNumber} • Phone: {asc.phone} • {asc.email}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      Pass: {asc.courtPass} • Status: {asc.attendanceToday}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                      {asc.activeMattersAssigned} Matters Assigned
                    </span>
                    <button className="px-3 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer">
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW: CUREMASO - CRM & RETAINERS                               */}
      {/* ============================================================== */}
      {currentTab === "curemaso" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Corporate Retainers</span>
              <div className="text-xl font-bold text-black dark:text-white font-mono">4 Accounts</div>
              <span className="text-[10px] text-zinc-500">Annual legal advisory</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Retainer ARR</span>
              <div className="text-xl font-bold text-black dark:text-white font-mono">₹ 54.5 Lakhs</div>
              <span className="text-[10px] text-zinc-500">Recurring contract value</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Conflict Checks</span>
              <div className="text-xl font-bold text-black dark:text-white font-mono">100% Cleared</div>
              <span className="text-[10px] text-zinc-500">Adverse party screen</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500">Client Retention</span>
              <div className="text-xl font-bold text-black dark:text-white font-mono">98.2%</div>
              <span className="text-[10px] text-zinc-500">High Court chamber benchmark</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white">
                  Corporate Retainer Accounts &amp; Representation Scope
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Long-term institutional briefs with monthly advance advisory retainers.
                </p>
              </div>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {[
                {
                  client: "Malabar Infotech Solutions Pvt Ltd",
                  contact: "Rajeev Menon (MD)",
                  scope: "Infopark IT Contracts, Vendor Arbitration & NCLT Disputes",
                  value: "₹ 12,00,000 / yr",
                  status: "Active Retainer",
                },
                {
                  client: "Vanguard Infrastructure Ltd",
                  contact: "K. S. Narayanan (VP Legal)",
                  scope: "NHAI Highway Concessions, Land Acquisition Writs & EPC Claims",
                  value: "₹ 24,00,000 / yr",
                  status: "Active Retainer",
                },
                {
                  client: "Coastal Logistics & Export Terminal LLP",
                  contact: "Capt. Vivek Mohan",
                  scope: "Port Trust Demurrage & Section 138 NI Act Recovery Proceedings",
                  value: "₹ 10,50,000 / yr",
                  status: "Active Retainer",
                },
                {
                  client: "Cochin Spices & Plantations Consortium",
                  contact: "Smt. Jayasree Nair",
                  scope: "Cardamom Board Export Regulations & Revenue Recovery Writs",
                  value: "₹ 8,00,000 / yr",
                  status: "Active Retainer",
                },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-black dark:text-white">{row.client}</span>
                    <span className="text-zinc-500 text-[11px] ml-2 font-mono">({row.contact})</span>
                    <p className="text-zinc-600 dark:text-zinc-300 text-xs">{row.scope}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-mono font-bold text-black dark:text-white">{row.value}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                      {row.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW: APP STORE & THIRD PARTY INTEGRATIONS                     */}
      {/* ============================================================== */}
      {currentTab === "app-store" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-black dark:text-white">Chamber Legal App Store &amp; Integrations</h3>
              <p className="text-xs text-zinc-500">Verified court bridges, digital signature drivers, and legal databases.</p>
            </div>
            <span className="text-xs font-mono text-zinc-500">8 Active • 24 Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "eCourts Live Sync Connector", category: "Court Registry", desc: "Automated daily causelist sync and case status ingestion from Kerala High Court & eCourts.", installed: true },
              { name: "MCA 21 Corporate Filing Bridge", category: "Company Law", desc: "One-click fetch of Director DIN, company Master Data, and statutory filings from ROC.", installed: true },
              { name: "IPIndia Trademark Watch", category: "Intellectual Property", desc: "Monitors trademark journal publications for potential opposition deadlines.", installed: true },
              { name: "DSC Hardware Crypto Token Bridge", category: "Digital Signature", desc: "USB e-Token driver for Class-3 digital signatures on High Court pleadings and paperbooks.", installed: true },
              { name: "GSTIN Tax Intelligence Connector", category: "Taxation", desc: "Verifies corporate client GSTIN and computes Reverse Charge (RCM) eligibility.", installed: true },
              { name: "Indian Kanoon API Bridge", category: "Case Precedents", desc: "Full-text precedent citation search across Supreme Court, High Courts, and Tribunals.", installed: true },
            ].map((app, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs hover:border-black dark:hover:border-white transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-black dark:text-white">{app.name}</h4>
                      <span className="text-[10px] font-mono text-zinc-500">{app.category}</span>
                    </div>
                    {app.installed && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-2">{app.desc}</p>
                </div>
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
                  <button className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer">
                    Configure Bridge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREATE TAX INVOICE                                      */}
      {/* ============================================================== */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">Generate Legal Tax Invoice</h3>
                <p className="text-xs text-zinc-500 mt-0.5">SAC Code 9982 (Legal Representation Services)</p>
              </div>
              <button
                onClick={() => setShowCreateInvoiceModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-zinc-500">Client / Entity Name *</label>
                <input
                  type="text"
                  required
                  value={newInvoiceData.clientName}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, clientName: e.target.value })}
                  placeholder="e.g. Malabar Infotech Solutions or Gopakumar Nambiar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-zinc-500">Court Docket / Matter Reference</label>
                <input
                  type="text"
                  value={newInvoiceData.matterTitle}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, matterTitle: e.target.value })}
                  placeholder="e.g. WP(C) 19482/2024 — High Court of Kerala"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-zinc-500">Service Description</label>
                <input
                  type="text"
                  value={newInvoiceData.description}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, description: e.target.value })}
                  placeholder="e.g. Senior Counsel Court Hall Appearance & Rejoinder Drafting"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-zinc-500">Professional Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newInvoiceData.amount}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, amount: e.target.value })}
                    placeholder="25000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-zinc-500">GST Rate (%)</label>
                  <select
                    value={newInvoiceData.gstRate}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, gstRate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono focus:outline-none"
                  >
                    <option value="18">18% (Standard Legal Services)</option>
                    <option value="0">0% (Exempt Individual / Out of Scope)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-zinc-500">Payment Due Date</label>
                <input
                  type="date"
                  value={newInvoiceData.dueDate}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider cursor-pointer hover:opacity-90"
                >
                  Issue Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: RECORD TRUST ESCROW ENTRY                               */}
      {/* ============================================================== */}
      {showTrustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">Record Trust Escrow Transaction</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Segregated Client Account (BCI Rule 24)</p>
              </div>
              <button
                onClick={() => setShowTrustModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTrustSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-zinc-500">Transaction Type *</label>
                  <select
                    value={newTrustData.type}
                    onChange={(e) => setNewTrustData({ ...newTrustData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  >
                    <option value="deposit">Deposit (Client to Escrow)</option>
                    <option value="disbursement">Disbursement (Escrow to Court / Vendor)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-zinc-500">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newTrustData.amount}
                    onChange={(e) => setNewTrustData({ ...newTrustData, amount: e.target.value })}
                    placeholder="50000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-zinc-500">Client Name *</label>
                <input
                  type="text"
                  required
                  value={newTrustData.clientName}
                  onChange={(e) => setNewTrustData({ ...newTrustData, clientName: e.target.value })}
                  placeholder="e.g. Vanguard Infrastructure Ltd"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-zinc-500">Matter Title</label>
                <input
                  type="text"
                  value={newTrustData.matterTitle}
                  onChange={(e) => setNewTrustData({ ...newTrustData, matterTitle: e.target.value })}
                  placeholder="e.g. WP(C) 4921/2026 — Vanguard Infrastructure v. NHAI"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-zinc-500">Purpose of Escrow Fund *</label>
                <input
                  type="text"
                  required
                  value={newTrustData.purpose}
                  onChange={(e) => setNewTrustData({ ...newTrustData, purpose: e.target.value })}
                  placeholder="e.g. Court Registry Stay Security Deposit or Commissioner Advance"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-zinc-500">NEFT / Cheque / UTR Reference</label>
                <input
                  type="text"
                  value={newTrustData.referenceNumber}
                  onChange={(e) => setNewTrustData({ ...newTrustData, referenceNumber: e.target.value })}
                  placeholder="e.g. RTGS/HDFC/2026/0991"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowTrustModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider cursor-pointer hover:opacity-90"
                >
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: RECORD CHAMBER EXPENSE / DISBURSEMENT                   */}
      {/* ============================================================== */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">Record Chamber Disbursement</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Court stamps, speed post, and case expenses</p>
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-zinc-500">Category *</label>
                  <select
                    value={newExpenseData.category}
                    onChange={(e) => setNewExpenseData({ ...newExpenseData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  >
                    <option value="Court Fee Stamps & Welfare">Court Fee Stamps & Welfare</option>
                    <option value="Process Service & Speed Post">Process Service & Speed Post</option>
                    <option value="Paperbook Binding & Scrutiny">Paperbook Binding & Scrutiny</option>
                    <option value="Legal Research Subscriptions">Legal Research Subscriptions</option>
                    <option value="Chamber Overhead">Chamber Overhead</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-zinc-500">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newExpenseData.amount}
                    onChange={(e) => setNewExpenseData({ ...newExpenseData, amount: e.target.value })}
                    placeholder="2500"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-zinc-500">Expense Description *</label>
                <input
                  type="text"
                  required
                  value={newExpenseData.description}
                  onChange={(e) => setNewExpenseData({ ...newExpenseData, description: e.target.value })}
                  placeholder="e.g. 4 sets Division Bench paperbook binding and index tabs"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-zinc-500">Matter Title</label>
                  <input
                    type="text"
                    value={newExpenseData.matterTitle}
                    onChange={(e) => setNewExpenseData({ ...newExpenseData, matterTitle: e.target.value })}
                    placeholder="e.g. WP(C) 19482/2024"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-zinc-500">Paid By</label>
                  <input
                    type="text"
                    value={newExpenseData.paidBy}
                    onChange={(e) => setNewExpenseData({ ...newExpenseData, paidBy: e.target.value })}
                    placeholder="e.g. Suresh Rawat (Clerk)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <label className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newExpenseData.isReimbursable}
                  onChange={(e) => setNewExpenseData({ ...newExpenseData, isReimbursable: e.target.checked })}
                  className="rounded accent-black dark:accent-white"
                />
                <span className="font-semibold text-black dark:text-white">
                  Reimbursable Out-of-Pocket Expense (Billed to Client)
                </span>
              </label>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider cursor-pointer hover:opacity-90"
                >
                  Log Disbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD ASSOCIATE PERSONNEL (HUREMASO)                      */}
      {/* ============================================================== */}
      {showAssociateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">Register Chamber Personnel</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Associate Advocates, Registry Clerks &amp; Interns</p>
              </div>
              <button
                onClick={() => setShowAssociateModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssociateSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-zinc-500">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newAssociateData.fullName}
                  onChange={(e) => setNewAssociateData({ ...newAssociateData, fullName: e.target.value })}
                  placeholder="e.g. Adv. Anjali Varma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-zinc-500">Chamber Role *</label>
                  <select
                    value={newAssociateData.role}
                    onChange={(e) => setNewAssociateData({ ...newAssociateData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  >
                    <option value="Senior Associate (Civil & Writs)">Senior Associate</option>
                    <option value="Litigation Junior (Writs & Civil)">Litigation Junior</option>
                    <option value="Chief Court Clerk & Registry">Chief Court Clerk</option>
                    <option value="Legal Research Associate">Research Associate</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-zinc-500">Enrollment / Clerk ID</label>
                  <input
                    type="text"
                    value={newAssociateData.enrollmentNumber}
                    onChange={(e) => setNewAssociateData({ ...newAssociateData, enrollmentNumber: e.target.value })}
                    placeholder="e.g. K/004921/2023"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-zinc-500">Phone Number</label>
                  <input
                    type="text"
                    value={newAssociateData.phone}
                    onChange={(e) => setNewAssociateData({ ...newAssociateData, phone: e.target.value })}
                    placeholder="+91 94470 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-zinc-500">Chamber Email</label>
                  <input
                    type="email"
                    value={newAssociateData.email}
                    onChange={(e) => setNewAssociateData({ ...newAssociateData, email: e.target.value })}
                    placeholder="associate@chamber.law"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowAssociateModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider cursor-pointer hover:opacity-90"
                >
                  Register Associate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
