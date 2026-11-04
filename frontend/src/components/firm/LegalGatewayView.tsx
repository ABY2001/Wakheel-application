"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Scale,
  FileText,
  FolderLock,
  Receipt,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Plus,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Download,
  Printer,
  ShieldCheck,
  FileCheck,
  X,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  Briefcase,
  KeyRound,
  FileBadge,
  BadgePercent,
  Coins,
} from "lucide-react";
import { csApi } from "@/lib/api";

export interface CorporateContractItem {
  id: string;
  contractId?: string;
  companyName: string;
  title: string;
  contractType: "sha_ssa" | "nda" | "founders_agreement" | "director_service" | "commercial_lease" | "vendor_msa" | "ip_assignment";
  parties: string[];
  effectiveDate: string;
  expiryDate?: string;
  contractValue: number;
  stampDutyPaid: number;
  eStampCertificateNumber?: string;
  governingLaw: string;
  keyClauses: string[];
  status: "drafted" | "under_negotiation" | "executed" | "stamped_registered" | "expired";
  notes?: string;
}

export interface RetainerAdvocateItem {
  id: string;
  advocateId?: string;
  fullName: string;
  barEnrollmentNumber: string;
  primaryJurisdiction: string;
  specialization: string;
  email: string;
  phone: string;
  retainerFee: number;
  appearanceRatePerHearing: number;
  activeBriefsCount: number;
  status: "active_retainer" | "empanelled" | "inactive";
}

export interface CorporateVaultItemType {
  id: string;
  vaultId?: string;
  companyName: string;
  docType: "moa_aoa" | "certificate_of_incorporation" | "dsc_token" | "pan_tan" | "trademark_cert" | "gst_reg";
  title: string;
  fileSize: string;
  uploadedAt: string;
  validUntil: string;
  holderName: string;
  issuingAuthority: string;
  status: "valid" | "expiring_soon" | "expired";
}

export interface SecretarialInvoiceItem {
  id: string;
  invoiceId?: string;
  invoiceNumber: string;
  clientCompanyName: string;
  clientGstin: string;
  sacCode: string;
  billingType: "monthly_retainer" | "annual_roc_package" | "event_filing" | "nclt_appearance";
  items: { description: string; amount: number }[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  dueDate: string;
  status: "draft" | "issued" | "paid" | "overdue";
}

interface LegalGatewayViewProps {
  firmName?: string;
  csName?: string;
  initialSubTab?: "contracts" | "retainer-advocates" | "vault" | "billing";
}

export function LegalGatewayView({
  firmName = "Apex Law & Corporate Partners LLP",
  csName = "CS Rajesh Sharma",
  initialSubTab = "contracts",
}: LegalGatewayViewProps) {
  const [activeTab, setActiveTab] = useState<"contracts" | "retainer-advocates" | "vault" | "billing">(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Data Collections
  const [selectedCompanyName, setSelectedCompanyName] = useState("CyberCorp Technologies Pvt Ltd");
  const [contracts, setContracts] = useState<CorporateContractItem[]>([]);
  const [advocates, setAdvocates] = useState<RetainerAdvocateItem[]>([]);
  const [vaultItems, setVaultItems] = useState<CorporateVaultItemType[]>([]);
  const [invoices, setInvoices] = useState<SecretarialInvoiceItem[]>([]);

  // Filters & Search
  const [contractTypeFilter, setContractTypeFilter] = useState("ALL");
  const [advocateFilter, setAdvocateFilter] = useState("ALL");
  const [vaultDocFilter, setVaultDocFilter] = useState("ALL");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [createContractModalOpen, setCreateContractModalOpen] = useState(false);
  const [createAdvocateModalOpen, setCreateAdvocateModalOpen] = useState(false);
  const [createVaultModalOpen, setCreateVaultModalOpen] = useState(false);
  const [createInvoiceModalOpen, setCreateInvoiceModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<SecretarialInvoiceItem | null>(null);
  const [selectedAdvocateForBrief, setSelectedAdvocateForBrief] = useState<RetainerAdvocateItem | null>(null);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Contract Form
  const [newContTitle, setNewContTitle] = useState("");
  const [newContType, setNewContType] = useState<CorporateContractItem["contractType"]>("sha_ssa");
  const [newContParties, setNewContParties] = useState("CyberCorp Technologies Pvt Ltd, Investor Name");
  const [newContValue, setNewContValue] = useState(25000000);
  const [newContDuty, setNewContDuty] = useState(2500);

  // New Advocate Form
  const [newAdvName, setNewAdvName] = useState("");
  const [newAdvBar, setNewAdvBar] = useState("D/1234/2015");
  const [newAdvJurisdiction, setNewAdvJurisdiction] = useState("NCLT New Delhi & High Court");
  const [newAdvSpec, setNewAdvSpec] = useState("Corporate Insolvency & M&A");
  const [newAdvRetainer, setNewAdvRetainer] = useState(50000);

  // New Vault Item Form
  const [newVltTitle, setNewVltTitle] = useState("");
  const [newVltDocType, setNewVltDocType] = useState<CorporateVaultItemType["docType"]>("moa_aoa");
  const [newVltHolder, setNewVltHolder] = useState("Managing Director");

  // New Invoice Form
  const [newInvClient, setNewInvClient] = useState("CyberCorp Technologies Pvt Ltd");
  const [newInvDesc, setNewInvDesc] = useState("Secretarial Retainer & Board Governance");
  const [newInvSubtotal, setNewInvSubtotal] = useState(50000);

  // Load from backend on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [cRes, aRes, vRes, iRes] = await Promise.allSettled([
          csApi.getCorporateContracts(),
          csApi.getRetainerAdvocates(),
          csApi.getCorporateVaultItems(),
          csApi.getSecretarialInvoices(),
        ]);
        if (isMounted) {
          if (cRes.status === "fulfilled" && cRes.value?.contracts?.length) setContracts(cRes.value.contracts);
          if (aRes.status === "fulfilled" && aRes.value?.advocates?.length) setAdvocates(aRes.value.advocates);
          if (vRes.status === "fulfilled" && vRes.value?.items?.length) setVaultItems(vRes.value.items);
          if (iRes.status === "fulfilled" && iRes.value?.invoices?.length) setInvoices(iRes.value.invoices);
        }
      } catch (err) {
        console.warn("Could not load legal gateway data:", err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered Contracts
  const filteredContracts = useMemo(() => {
    return contracts
      .filter((c) => (contractTypeFilter === "ALL" ? true : c.contractType === contractTypeFilter))
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.parties.some((p) => p.toLowerCase().includes(q)) ||
          (c.eStampCertificateNumber && c.eStampCertificateNumber.toLowerCase().includes(q))
        );
      });
  }, [contracts, contractTypeFilter, searchQuery]);

  // Filtered Advocates
  const filteredAdvocates = useMemo(() => {
    return advocates
      .filter((a) => (advocateFilter === "ALL" ? true : a.status === advocateFilter))
      .filter((a) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          a.fullName.toLowerCase().includes(q) ||
          a.barEnrollmentNumber.toLowerCase().includes(q) ||
          a.specialization.toLowerCase().includes(q) ||
          a.primaryJurisdiction.toLowerCase().includes(q)
        );
      });
  }, [advocates, advocateFilter, searchQuery]);

  // Filtered Vault
  const filteredVault = useMemo(() => {
    return vaultItems
      .filter((v) => (vaultDocFilter === "ALL" ? true : v.docType === vaultDocFilter))
      .filter((v) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          v.title.toLowerCase().includes(q) ||
          v.holderName.toLowerCase().includes(q) ||
          v.issuingAuthority.toLowerCase().includes(q)
        );
      });
  }, [vaultItems, vaultDocFilter, searchQuery]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((i) => (invoiceStatusFilter === "ALL" ? true : i.status === invoiceStatusFilter))
      .filter((i) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.clientCompanyName.toLowerCase().includes(q) ||
          i.items.some((it) => it.description.toLowerCase().includes(q))
        );
      });
  }, [invoices, invoiceStatusFilter, searchQuery]);

  // Handlers
  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContTitle.trim()) return;

    const newC: CorporateContractItem = {
      id: `cont-${Date.now()}`,
      companyName: selectedCompanyName,
      title: newContTitle.trim(),
      contractType: newContType,
      parties: newContParties.split(",").map((p) => p.trim()),
      effectiveDate: new Date().toISOString().split("T")[0],
      expiryDate: "2029-12-31",
      contractValue: Number(newContValue) || 0,
      stampDutyPaid: Number(newContDuty) || 500,
      eStampCertificateNumber: `IN-DL${Date.now().toString().slice(-14)}P`,
      governingLaw: "Laws of India (New Delhi Seat)",
      keyClauses: ["Confidentiality & Trade Secrets", "Indemnity & Limitation of Liability", "Arbitration Clause"],
      status: "executed",
    };

    setContracts((prev) => [newC, ...prev]);
    setCreateContractModalOpen(false);

    try {
      await csApi.createCorporateContract(newC);
    } catch (err) {
      console.warn("Failed to persist contract:", err);
    }
  };

  const handleCreateAdvocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdvName.trim()) return;

    const newA: RetainerAdvocateItem = {
      id: `adv-ret-${Date.now()}`,
      fullName: newAdvName.trim(),
      barEnrollmentNumber: newAdvBar.trim(),
      primaryJurisdiction: newAdvJurisdiction.trim(),
      specialization: newAdvSpec.trim(),
      email: `${newAdvName.toLowerCase().replace(/[^a-z]/g, "")}@bar.in`,
      phone: "+91 98110 00000",
      retainerFee: Number(newAdvRetainer) || 50000,
      appearanceRatePerHearing: Math.round(Number(newAdvRetainer) * 0.5),
      activeBriefsCount: 1,
      status: "active_retainer",
    };

    setAdvocates((prev) => [newA, ...prev]);
    setCreateAdvocateModalOpen(false);

    try {
      await csApi.createRetainerAdvocate(newA);
    } catch (err) {
      console.warn("Failed to persist advocate:", err);
    }
  };

  const handleCreateVaultItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVltTitle.trim()) return;

    const newV: CorporateVaultItemType = {
      id: `vlt-${Date.now()}`,
      companyName: selectedCompanyName,
      docType: newVltDocType,
      title: newVltTitle.trim(),
      fileSize: "1.5 MB",
      uploadedAt: new Date().toISOString().split("T")[0],
      validUntil: "Permanent",
      holderName: newVltHolder.trim(),
      issuingAuthority: "Ministry of Corporate Affairs / e-Mudhra",
      status: "valid",
    };

    setVaultItems((prev) => [newV, ...prev]);
    setCreateVaultModalOpen(false);

    try {
      await csApi.createCorporateVaultItem(newV);
    } catch (err) {
      console.warn("Failed to persist vault item:", err);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = Number(newInvSubtotal) || 50000;
    const gstAmount = Math.round((subtotal * 18) / 100);
    const totalAmount = subtotal + gstAmount;

    const newI: SecretarialInvoiceItem = {
      id: `inv-cs-${Date.now()}`,
      invoiceNumber: `INV-CS-2026-0${invoices.length + 85}`,
      clientCompanyName: newInvClient.trim(),
      clientGstin: "07AAECS1234F1Z8",
      sacCode: "9982",
      billingType: "monthly_retainer",
      items: [{ description: newInvDesc.trim(), amount: subtotal }],
      subtotal,
      gstRate: 18,
      gstAmount,
      totalAmount,
      dueDate: "2026-11-30",
      status: "issued",
    };

    setInvoices((prev) => [newI, ...prev]);
    setCreateInvoiceModalOpen(false);

    try {
      await csApi.createSecretarialInvoice(newI);
    } catch (err) {
      console.warn("Failed to persist invoice:", err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full space-y-6 font-sans">
      {/* =========================================================================
          TOP EXECUTIVE BANNER: LEGAL GATEWAY & ADVOCACY NETWORK
      ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#6B1728]/40 border border-[#6B1728] text-rose-300">
              <Scale className="w-3.5 h-3.5 text-rose-400" />
              <span>Legal & Corporate Advocacy Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Contracts, Retainer Counsel & Statutory Vault
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Institutional repository for Shareholder Agreements (SHA/SSA), NCLT litigation advocate network, 
              cryptographic USB DSC tokens, and GST-compliant secretarial fee billing.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-medium text-zinc-400">Client Entity:</span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-semibold text-white">
                <Building2 className="w-3.5 h-3.5 text-[#6B1728]" />
                <span>{selectedCompanyName}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-wrap items-center gap-3">
            {activeTab === "contracts" && (
              <button
                onClick={() => setCreateContractModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-[#6B1728] hover:bg-[#800020] text-white shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Draft New Agreement</span>
              </button>
            )}
            {activeTab === "retainer-advocates" && (
              <button
                onClick={() => setCreateAdvocateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-[#6B1728] hover:bg-[#800020] text-white shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Empanel Advocate</span>
              </button>
            )}
            {activeTab === "vault" && (
              <button
                onClick={() => setCreateVaultModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-[#6B1728] hover:bg-[#800020] text-white shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Deposit Document</span>
              </button>
            )}
            {activeTab === "billing" && (
              <button
                onClick={() => setCreateInvoiceModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-[#6B1728] hover:bg-[#800020] text-white shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Fee Note</span>
              </button>
            )}
          </div>
        </div>

        {/* Executive Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Executed Contracts</p>
            <p className="text-2xl font-black text-white">{contracts.length}</p>
            <p className="text-[11px] text-zinc-500">e-Stamped & authenticated</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Retainer Counsel</p>
            <p className="text-2xl font-black text-emerald-400">{advocates.length}</p>
            <p className="text-[11px] text-emerald-500/80">Senior Advocates on call</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Statutory Charters</p>
            <p className="text-2xl font-black text-sky-400">{vaultItems.length}</p>
            <p className="text-[11px] text-sky-500/80">MOA/AOA & Active DSCs</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Billed This Quarter</p>
            <p className="text-2xl font-black text-amber-400">
              ₹{(invoices.reduce((acc, i) => acc + i.totalAmount, 0) / 1000).toFixed(0)}k
            </p>
            <p className="text-[11px] text-amber-500/80">SAC 9982 GST Compliant</p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODULE NAVIGATION TABS
      ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("contracts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "contracts"
                ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#6B1728]" />
            <span>Commercial Contracts</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 font-mono">
              {filteredContracts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("retainer-advocates")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "retainer-advocates"
                ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-[#6B1728]" />
            <span>Advocate Network</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 font-mono">
              {filteredAdvocates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("vault")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "vault"
                ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <FolderLock className="w-3.5 h-3.5 text-[#6B1728]" />
            <span>Statutory Vault & DSC</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 font-mono">
              {filteredVault.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("billing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "billing"
                ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-[#6B1728]" />
            <span>Fee Notes & Billing</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 font-mono">
              {filteredInvoices.length}
            </span>
          </button>
        </div>

        {/* Global Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents, counsel, invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#6B1728]"
          />
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: COMMERCIAL CONTRACTS & SHAREHOLDER AGREEMENTS
      ========================================================================= */}
      {activeTab === "contracts" && (
        <div className="space-y-6">
          {/* Sub-Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500">Contract Class:</span>
            {[
              { id: "ALL", label: "All Types" },
              { id: "sha_ssa", label: "Shareholder (SHA/SSA)" },
              { id: "nda", label: "NDA & Confidentiality" },
              { id: "director_service", label: "Director Service (Sec 197)" },
              { id: "commercial_lease", label: "Commercial Lease" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setContractTypeFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  contractTypeFilter === tab.id
                    ? "bg-black dark:bg-white text-white dark:text-black font-bold"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredContracts.map((cont) => (
              <div
                key={cont.id}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#6B1728]/10 text-[#6B1728] dark:bg-[#6B1728]/30 dark:text-rose-300 font-mono">
                      {cont.contractType.replace(/_/g, " ")}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 capitalize">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{cont.status.replace(/_/g, " ")}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-black dark:text-white leading-snug">
                      {cont.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Parties: <strong className="text-zinc-700 dark:text-zinc-300">{cont.parties.join(" • ")}</strong>
                    </p>
                  </div>

                  {/* Metadata pill box */}
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 text-xs space-y-1.5 font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Contract Consideration:</span>
                      <span className="font-mono font-bold text-black dark:text-white">
                        {cont.contractValue > 0 ? `₹${(cont.contractValue / 100000).toLocaleString()} Lakhs` : "Mutual Covenants"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Effective Date:</span>
                      <span className="font-mono text-zinc-700 dark:text-zinc-300">{cont.effectiveDate}</span>
                    </div>
                    {cont.eStampCertificateNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">e-Stamp Duty Cert:</span>
                        <button
                          onClick={() => copyToClipboard(cont.eStampCertificateNumber || "", cont.id)}
                          className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#6B1728] dark:text-rose-300 hover:underline cursor-pointer"
                        >
                          <span>{cont.eStampCertificateNumber}</span>
                          {copiedId === cont.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-zinc-400" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Key Clauses Badges */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Statutory Covenants:</p>
                    <div className="space-y-1">
                      {cont.keyClauses.map((clause, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{clause}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                  <span className="truncate max-w-[240px]">{cont.governingLaw}</span>
                  <span className="font-medium text-[#6B1728] dark:text-rose-400">
                    Stamp: ₹{cont.stampDutyPaid.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: RETAINER ADVOCATES & LITIGATION GATEWAY
      ========================================================================= */}
      {activeTab === "retainer-advocates" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500">Status:</span>
              {["ALL", "active_retainer", "empanelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => setAdvocateFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    advocateFilter === st
                      ? "bg-black dark:bg-white text-white dark:text-black font-bold"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  {st === "ALL" ? "All Counsel" : st.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAdvocates.map((adv) => (
              <div
                key={adv.id}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#6B1728]/10 text-[#6B1728] dark:bg-[#6B1728]/30 dark:text-rose-300 flex items-center justify-center font-bold">
                      <Scale className="w-5 h-5" />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 capitalize">
                      {adv.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-black dark:text-white leading-snug">
                      {adv.fullName}
                    </h3>
                    <p className="text-xs font-mono text-[#6B1728] dark:text-rose-300 mt-0.5">
                      Enrolment: {adv.barEnrollmentNumber}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 text-xs space-y-1.5 font-sans">
                    <div className="text-zinc-500">Primary Forum:</div>
                    <div className="font-bold text-black dark:text-white">{adv.primaryJurisdiction}</div>
                    <div className="text-zinc-500 pt-1">Core Domain:</div>
                    <div className="text-zinc-700 dark:text-zinc-300 text-[11px] font-medium leading-relaxed">
                      {adv.specialization}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/60">
                      <span className="text-[10px] text-zinc-500 block">Monthly Retainer:</span>
                      <span className="font-bold text-black dark:text-white">₹{adv.retainerFee.toLocaleString()}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/60">
                      <span className="text-[10px] text-zinc-500 block">Hearing Fee:</span>
                      <span className="font-bold text-black dark:text-white">₹{adv.appearanceRatePerHearing.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedAdvocateForBrief(adv)}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-[#6B1728] hover:bg-[#800020] text-white transition-colors cursor-pointer text-center"
                  >
                    Brief Counsel (NCLT)
                  </button>
                  <a
                    href={`mailto:${adv.email}`}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300"
                    title="Send Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                  <a
                    href={`tel:${adv.phone}`}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300"
                    title="Call Counsel"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: STATUTORY VAULT & DSC CRYPTOGRAPHIC TOKEN MANAGER
      ========================================================================= */}
      {activeTab === "vault" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500">Document Type:</span>
            {[
              { id: "ALL", label: "All Items" },
              { id: "moa_aoa", label: "MOA & AOA Charters" },
              { id: "certificate_of_incorporation", label: "Incorporation Cert (CIN)" },
              { id: "dsc_token", label: "Class 3 DSC Tokens" },
              { id: "trademark_cert", label: "Trademarks & IP" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setVaultDocFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  vaultDocFilter === tab.id
                    ? "bg-black dark:bg-white text-white dark:text-black font-bold"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVault.map((item) => {
              const isDsc = item.docType === "dsc_token";
              const isExpiring = item.status === "expiring_soon";

              return (
                <div
                  key={item.id}
                  className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-[#6B1728] flex items-center justify-center font-bold">
                        {isDsc ? <KeyRound className="w-5 h-5 text-amber-500" /> : <FolderLock className="w-5 h-5" />}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isExpiring
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                            : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                        }`}
                      >
                        {isExpiring ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        <span>{isExpiring ? "Renewal Required Soon" : "Valid & Active"}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-black dark:text-white leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Holder: <strong className="text-zinc-700 dark:text-zinc-300">{item.holderName}</strong>
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 text-xs space-y-1.5 font-sans">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Issuing Authority:</span>
                        <span className="font-semibold text-black dark:text-white">{item.issuingAuthority}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Validity Expiry:</span>
                        <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{item.validUntil}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Stored Format:</span>
                        <span className="font-mono text-zinc-500">{item.fileSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-mono">Uploaded: {item.uploadedAt}</span>
                    <button
                      onClick={() => alert(`Verified digital charter signature on ${item.title}. Authenticated with CS Peer Review.`)}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
                    >
                      Verify Signature
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: SECRETARIAL FEE NOTES & RETAINER INVOICING (SAC 9982)
      ========================================================================= */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500">Payment Status:</span>
              {["ALL", "issued", "paid", "overdue"].map((st) => (
                <button
                  key={st}
                  onClick={() => setInvoiceStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    invoiceStatusFilter === st
                      ? "bg-black dark:bg-white text-white dark:text-black font-bold"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  {st === "ALL" ? "All Fee Notes" : st.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
                <thead className="bg-zinc-50 dark:bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-bold">Invoice #</th>
                    <th className="px-4 py-3 font-bold">Client Company</th>
                    <th className="px-4 py-3 font-bold">SAC Code & Type</th>
                    <th className="px-4 py-3 font-bold">Description</th>
                    <th className="px-4 py-3 font-bold">Subtotal</th>
                    <th className="px-4 py-3 font-bold">18% GST</th>
                    <th className="px-4 py-3 font-bold">Total (INR)</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-black dark:text-white whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 font-bold text-black dark:text-white whitespace-nowrap">
                        {inv.clientCompanyName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#6B1728]/10 text-[#6B1728] dark:bg-[#6B1728]/30 dark:text-rose-300 font-mono">
                          SAC {inv.sacCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-zinc-600 dark:text-zinc-400">
                        {inv.items[0]?.description || "Secretarial Services"}
                      </td>
                      <td className="px-4 py-3 font-mono">₹{inv.subtotal.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-zinc-500">₹{inv.gstAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono font-bold text-black dark:text-white">
                        ₹{inv.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            inv.status === "paid"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                              : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedInvoiceForPrint(inv)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-[#6B1728]/10 text-[#6B1728] dark:bg-[#6B1728]/30 dark:text-rose-300 hover:bg-[#6B1728]/20 transition-all cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: BRIEF COUNSEL (NCLT LITIGATION)
      ========================================================================= */}
      {selectedAdvocateForBrief && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  Litigation Briefing Memo: {selectedAdvocateForBrief.fullName}
                </h3>
                <p className="text-xs text-zinc-500 font-mono">Forum: {selectedAdvocateForBrief.primaryJurisdiction}</p>
              </div>
              <button
                onClick={() => setSelectedAdvocateForBrief(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Instructing Firm:</span>
                  <span className="font-bold text-black dark:text-white">{firmName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Corporate Client:</span>
                  <span className="font-bold text-[#6B1728] dark:text-rose-300">{selectedCompanyName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Retainer Hearing Rate:</span>
                  <span className="font-mono font-bold text-black dark:text-white">
                    ₹{selectedAdvocateForBrief.appearanceRatePerHearing.toLocaleString()} / hearing
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Briefing Subject & Relief Sought
                </label>
                <input
                  type="text"
                  defaultValue="NCLT Section 241-242 Oppression & Mismanagement Defense Brief"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Enclosed Board Documents & Statutory Extracts
                </label>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Certified True Copy of Board Resolution RES-01/BM-04</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Register of Members (Form MGT-1) extract certified by CS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Signed Memorandum & Articles of Association (MOA/AOA)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedAdvocateForBrief(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Counsel Briefing Dossier dispatched electronically to ${selectedAdvocateForBrief.email}`);
                  setSelectedAdvocateForBrief(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#6B1728] hover:bg-[#800020] text-white shadow-md cursor-pointer"
              >
                Dispatch Brief
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VIEW & PRINT GST TAX INVOICE (SAC 9982)
      ========================================================================= */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#6B1728] dark:text-rose-300">
                <Receipt className="w-4 h-4" />
                <span>GST Tax Invoice (SAC Code 9982)</span>
              </div>
              <button
                onClick={() => setSelectedInvoiceForPrint(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Invoice Sheet */}
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-sans space-y-5 text-zinc-800 dark:text-zinc-200">
              <div className="flex justify-between items-start border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-black dark:text-white uppercase">{firmName}</h3>
                  <p className="text-zinc-500">Practising Company Secretaries & Corporate Legal Advisors</p>
                  <p className="text-zinc-500 font-mono text-[11px]">GSTIN: 07AAAFW1234F1Z9 • SAC: 9982</p>
                  <p className="text-zinc-500 text-[11px]">Connaught Place, New Delhi, DL 110001</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black font-mono text-[#6B1728] dark:text-rose-300">
                    {selectedInvoiceForPrint.invoiceNumber}
                  </span>
                  <p className="text-zinc-500 text-[11px] font-mono">Date: {new Date().toISOString().split("T")[0]}</p>
                  <p className="text-zinc-500 text-[11px] font-mono">Due Date: {selectedInvoiceForPrint.dueDate}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Billed To Client:</span>
                <p className="font-extrabold text-sm text-black dark:text-white">
                  {selectedInvoiceForPrint.clientCompanyName}
                </p>
                <p className="text-zinc-500 font-mono text-[11px]">GSTIN: {selectedInvoiceForPrint.clientGstin}</p>
              </div>

              {/* Items Table */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-[11px] uppercase font-bold text-zinc-500">
                    <tr>
                      <th className="px-4 py-2">Service Description</th>
                      <th className="px-4 py-2">SAC</th>
                      <th className="px-4 py-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {selectedInvoiceForPrint.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 font-medium">{item.description}</td>
                        <td className="px-4 py-2 font-mono text-zinc-500">9982</td>
                        <td className="px-4 py-2 text-right font-mono font-bold">₹{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax Calculations */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Subtotal:</span>
                  <span className="font-bold">₹{selectedInvoiceForPrint.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">CGST (9%):</span>
                  <span>₹{(selectedInvoiceForPrint.gstAmount / 2).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">SGST (9%):</span>
                  <span>₹{(selectedInvoiceForPrint.gstAmount / 2).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-sm font-black text-black dark:text-white">
                  <span>Grand Total (INR):</span>
                  <span className="text-[#6B1728] dark:text-rose-300">
                    ₹{selectedInvoiceForPrint.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Bank Remittance Details */}
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                <p className="font-bold text-black dark:text-white">Bank Remittance Instructions:</p>
                <p>Bank: HDFC Bank Ltd • Branch: Connaught Place, New Delhi</p>
                <p>A/C Name: {firmName} • A/C No: 50200084920194 • IFSC: HDFC0000024</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Tax Invoice</span>
              </button>
              <button
                onClick={() => setSelectedInvoiceForPrint(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#6B1728] text-white hover:bg-[#800020] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
