"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  FileCheck,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Download,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  X,
  FileText,
  BadgeAlert,
  HelpCircle,
  FileBadge,
  Sparkles,
  Printer,
  TrendingUp,
  Receipt,
  UserCheck,
  Coins,
} from "lucide-react";
import { csApi } from "@/lib/api";

export interface CorporateDirector {
  din: string;
  name: string;
  designation: string;
  appointmentDate?: string;
  pan?: string;
  active?: boolean;
}

export interface CorporateEntityItem {
  id: string;
  entityId?: string;
  companyName: string;
  cin: string;
  rocJurisdiction: string;
  entityType: "pvt_ltd" | "public_ltd" | "opc" | "llp" | "section_8";
  incorporationDate: string;
  authorizedCapital: number;
  paidUpCapital: number;
  registeredAddress: string;
  email?: string;
  pan?: string;
  gstin?: string;
  directors: CorporateDirector[];
  financialYearEnd: string;
  complianceHealthScore: number;
  status: "active" | "strike_off" | "amalgamated" | "dormant";
}

export interface RocFilingItem {
  id: string;
  filingId?: string;
  companyName: string;
  cin: string;
  formName: string;
  formDescription: string;
  financialYear: string;
  statutorySection: string;
  dueDate: string;
  filingDate?: string;
  status: "drafted" | "dsc_affixed" | "uploaded_mca" | "approved" | "resubmission" | "rejected" | "overdue";
  srn?: string;
  challanAmount: number;
  lateFeeAmount: number;
  paymentStatus: "unpaid" | "paid" | "exempt";
  signatoryDin?: string;
  signatoryName?: string;
  pcsCertificateNumber?: string;
  attachmentCount?: number;
  notes?: string;
}

export interface StatutoryRegisterItem {
  id: string;
  registerEntryId?: string;
  companyName: string;
  cin: string;
  registerType: "members" | "directors" | "charges" | "loans_investments" | "contracts_interested";
  statutoryForm: string;
  folioOrRefNumber: string;
  primaryHolderName: string;
  identificationNumber?: string;
  entryDate: string;
  particulars: string;
  quantityOrAmount: number;
  distinctiveFrom?: string;
  distinctiveTo?: string;
  certificateNumber?: string;
  status: "active" | "transferred" | "satisfied" | "ceased";
  certifiedBy?: string;
  certifiedAt?: string;
}

interface RocComplianceViewProps {
  firmName?: string;
  csName?: string;
  initialSubTab?: "filings" | "registers" | "secretarial-audit" | "entities";
}

export function RocComplianceView({
  firmName = "Apex Law & Corporate Partners LLP",
  csName = "CS Rajesh Sharma",
  initialSubTab = "filings",
}: RocComplianceViewProps) {
  const [activeTab, setActiveTab] = useState<"filings" | "registers" | "secretarial-audit" | "entities">(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Master Data
  const [entities, setEntities] = useState<CorporateEntityItem[]>([]);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>("CyberCorp Technologies Pvt Ltd");
  const [filings, setFilings] = useState<RocFilingItem[]>([]);
  const [registers, setRegisters] = useState<StatutoryRegisterItem[]>([]);
  const [auditReport, setAuditReport] = useState<any>(null);

  // Filters & Search
  const [filingFormFilter, setFilingFormFilter] = useState<string>("ALL");
  const [filingStatusFilter, setFilingStatusFilter] = useState<string>("ALL");
  const [registerTypeFilter, setRegisterTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [createFilingModalOpen, setCreateFilingModalOpen] = useState(false);
  const [createRegisterModalOpen, setCreateRegisterModalOpen] = useState(false);
  const [createEntityModalOpen, setCreateEntityModalOpen] = useState(false);
  const [auditReportModalOpen, setAuditReportModalOpen] = useState(false);
  const [certifiedRegisterModalOpen, setCertifiedRegisterModalOpen] = useState(false);
  const [selectedRegisterRecord, setSelectedRegisterRecord] = useState<StatutoryRegisterItem | null>(null);

  // Copy Feedback
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Form states - New Filing
  const [newFormName, setNewFormName] = useState("MGT-14");
  const [newFormDescription, setNewFormDescription] = useState("Filing of Board Resolutions with Registrar of Companies under Section 117");
  const [newDueDate, setNewDueDate] = useState("2026-11-30");
  const [newStatutorySection, setNewStatutorySection] = useState("Section 117(1) of Companies Act 2013");
  const [newChallanAmount, setNewChallanAmount] = useState(600);
  const [newSignatoryName, setNewSignatoryName] = useState("Dr. Vikram Malhotra (MD)");

  // Form states - New Register Entry
  const [newRegType, setNewRegType] = useState<StatutoryRegisterItem["registerType"]>("members");
  const [newRegFolio, setNewRegFolio] = useState("FOLIO-003");
  const [newRegHolder, setNewRegHolder] = useState("");
  const [newRegIdNum, setNewRegIdNum] = useState("");
  const [newRegParticulars, setNewRegParticulars] = useState("");
  const [newRegQty, setNewRegQty] = useState(10000);
  const [newRegDistFrom, setNewRegDistFrom] = useState("250001");
  const [newRegDistTo, setNewRegDistTo] = useState("260000");

  // Form states - New Entity
  const [newEntName, setNewEntName] = useState("");
  const [newEntCin, setNewEntCin] = useState("");
  const [newEntRoc, setNewEntRoc] = useState("RoC Delhi & Haryana");
  const [newEntType, setNewEntType] = useState<CorporateEntityItem["entityType"]>("pvt_ltd");
  const [newEntAuthCap, setNewEntAuthCap] = useState(1000000);
  const [newEntPaidCap, setNewEntPaidCap] = useState(500000);
  const [newEntAddress, setNewEntAddress] = useState("");

  // Load backend data on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [entRes, filRes, regRes, audRes] = await Promise.allSettled([
          csApi.getCorporateEntities(),
          csApi.getRocFilings(),
          csApi.getStatutoryRegisters(),
          csApi.getSecretarialAuditReport(selectedCompanyName),
        ]);

        if (isMounted) {
          if (entRes.status === "fulfilled" && entRes.value?.entities?.length) {
            setEntities(entRes.value.entities);
          }
          if (filRes.status === "fulfilled" && filRes.value?.filings?.length) {
            setFilings(filRes.value.filings);
          }
          if (regRes.status === "fulfilled" && regRes.value?.registers?.length) {
            setRegisters(regRes.value.registers);
          }
          if (audRes.status === "fulfilled" && audRes.value?.report) {
            setAuditReport(audRes.value.report);
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote CS compliance records:", err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedCompanyName]);

  // Selected Entity
  const currentEntity = useMemo(() => {
    return (
      entities.find((e) => e.companyName === selectedCompanyName) ||
      entities[0] || null
    );
  }, [entities, selectedCompanyName]);

  // Computed Filings for selected entity
  const filteredFilings = useMemo(() => {
    return filings
      .filter((f) => f.companyName === selectedCompanyName)
      .filter((f) => (filingFormFilter === "ALL" ? true : f.formName === filingFormFilter))
      .filter((f) => (filingStatusFilter === "ALL" ? true : f.status === filingStatusFilter))
      .filter((f) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          f.formName.toLowerCase().includes(q) ||
          f.formDescription.toLowerCase().includes(q) ||
          (f.srn && f.srn.toLowerCase().includes(q)) ||
          f.statutorySection.toLowerCase().includes(q)
        );
      });
  }, [filings, selectedCompanyName, filingFormFilter, filingStatusFilter, searchQuery]);

  // Computed Registers for selected entity
  const filteredRegisters = useMemo(() => {
    return registers
      .filter((r) => r.companyName === selectedCompanyName)
      .filter((r) => (registerTypeFilter === "ALL" ? true : r.registerType === registerTypeFilter))
      .filter((r) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          r.primaryHolderName.toLowerCase().includes(q) ||
          r.folioOrRefNumber.toLowerCase().includes(q) ||
          (r.identificationNumber && r.identificationNumber.toLowerCase().includes(q)) ||
          r.particulars.toLowerCase().includes(q)
        );
      });
  }, [registers, selectedCompanyName, registerTypeFilter, searchQuery]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalEntities = entities.length;
    const pendingFilings = filings.filter((f) => ["drafted", "dsc_affixed", "uploaded_mca"].includes(f.status)).length;
    const approvedSrns = filings.filter((f) => f.status === "approved").length;
    const compliantRegisters = registers.length;
    return { totalEntities, pendingFilings, approvedSrns, compliantRegisters };
  }, [entities, filings, registers]);

  // Handle Create Filing
  const handleCreateFiling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormName.trim() || !newDueDate.trim()) return;

    const newFiling: RocFilingItem = {
      id: `roc-${Date.now()}`,
      companyName: selectedCompanyName,
      cin: currentEntity?.cin || "U72200DL2022PTC394812",
      formName: newFormName.trim(),
      formDescription: newFormDescription.trim(),
      financialYear: "FY 2026-27",
      statutorySection: newStatutorySection.trim(),
      dueDate: newDueDate,
      filingDate: "",
      status: "drafted",
      srn: "",
      challanAmount: Number(newChallanAmount) || 600,
      lateFeeAmount: 0,
      paymentStatus: "unpaid",
      signatoryDin: currentEntity?.directors?.[0]?.din || "08912340",
      signatoryName: newSignatoryName || currentEntity?.directors?.[0]?.name || "Managing Director",
      pcsCertificateNumber: `${csName} (FCS 8492, CP 10294)`,
      attachmentCount: 2,
      notes: "Newly scheduled statutory ROC filing.",
    };

    setFilings((prev) => [newFiling, ...prev]);
    setCreateFilingModalOpen(false);

    try {
      await csApi.createRocFiling(newFiling);
    } catch (err) {
      console.warn("Failed to persist ROC filing to backend:", err);
    }
  };

  // Handle Create Register Entry
  const handleCreateRegisterEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegHolder.trim() || !newRegFolio.trim()) return;

    const formMap: Record<string, string> = {
      members: "MGT-1",
      directors: "Sec 170",
      charges: "CHG-7",
      loans_investments: "MBP-2",
      contracts_interested: "MBP-4",
    };

    const newEntry: StatutoryRegisterItem = {
      id: `reg-${Date.now()}`,
      companyName: selectedCompanyName,
      cin: currentEntity?.cin || "U72200DL2022PTC394812",
      registerType: newRegType,
      statutoryForm: formMap[newRegType] || "MGT-1",
      folioOrRefNumber: newRegFolio.trim(),
      primaryHolderName: newRegHolder.trim(),
      identificationNumber: newRegIdNum.trim(),
      entryDate: new Date().toISOString().split("T")[0],
      particulars: newRegParticulars.trim() || "Statutory register entry recorded under Companies Act 2013.",
      quantityOrAmount: Number(newRegQty) || 0,
      distinctiveFrom: newRegDistFrom.trim(),
      distinctiveTo: newRegDistTo.trim(),
      certificateNumber: `CERT-00${registers.length + 1}`,
      status: "active",
      certifiedBy: `${csName}, FCS 8492`,
      certifiedAt: new Date().toISOString().split("T")[0],
    };

    setRegisters((prev) => [newEntry, ...prev]);
    setCreateRegisterModalOpen(false);

    try {
      await csApi.createRegisterEntry(newEntry);
    } catch (err) {
      console.warn("Failed to persist register entry to backend:", err);
    }
  };

  // Handle Create Entity
  const handleCreateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntName.trim() || !newEntCin.trim()) return;

    const newEnt: CorporateEntityItem = {
      id: `ent-${Date.now()}`,
      companyName: newEntName.trim(),
      cin: newEntCin.trim().toUpperCase(),
      rocJurisdiction: newEntRoc.trim(),
      entityType: newEntType,
      incorporationDate: new Date().toISOString().split("T")[0],
      authorizedCapital: Number(newEntAuthCap) || 1000000,
      paidUpCapital: Number(newEntPaidCap) || 500000,
      registeredAddress: newEntAddress.trim() || "Registered Corporate Office",
      email: `compliance@${newEntName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      directors: [
        {
          din: "08912340",
          name: "Managing Director",
          designation: "Managing Director",
          appointmentDate: new Date().toISOString().split("T")[0],
          active: true,
        },
      ],
      financialYearEnd: "March 31",
      complianceHealthScore: 100,
      status: "active",
    };

    setEntities((prev) => [...prev, newEnt]);
    setSelectedCompanyName(newEnt.companyName);
    setCreateEntityModalOpen(false);

    try {
      await csApi.createCorporateEntity(newEnt);
    } catch (err) {
      console.warn("Failed to persist corporate entity to backend:", err);
    }
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="w-full space-y-6 font-sans">
      {/* =========================================================================
          TOP EXECUTIVE BANNER: ROC & MCA21 STATUTORY COMPLIANCE SUITE
      ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#6B1728]/40 border border-[#6B1728] text-rose-300">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>MCA21 V3 & ROC Statutory Compliance Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ROC e-Filings & Statutory Registers
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Automated MCA21 e-Form tracker (AOC-4, MGT-7, DIR-12, PAS-3, CHG-1), digital signature & SRN lifecycle, 
              Section 88/170/85 statutory registers, and Secretarial Audit Form MR-3.
            </p>

            {/* Managed Entity Quick Selector */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-medium text-zinc-400">Active Entity:</span>
              <div className="relative inline-block">
                <select
                  value={selectedCompanyName}
                  onChange={(e) => setSelectedCompanyName(e.target.value)}
                  aria-label="Select Active Corporate Entity"
                  className="appearance-none bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-white text-xs font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1728] cursor-pointer transition-colors"
                >
                  {entities.map((ent) => (
                    <option key={ent.id} value={ent.companyName}>
                      {ent.companyName} ({ent.cin.slice(0, 10)}...)
                    </option>
                  ))}
                </select>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                <Building2 className="w-3 h-3 text-zinc-400" />
                <span className="font-mono text-[11px]">{currentEntity?.cin || "U72200DL2022PTC394812"}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300 font-semibold">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Health Score: {(currentEntity?.complianceHealthScore ?? 100)}%</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCreateFilingModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-[#6B1728] hover:bg-[#800020] text-white shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New e-Form Filing</span>
            </button>
            <button
              onClick={() => setCreateRegisterModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Add Register Entry</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Managed Entities</p>
            <p className="text-2xl font-black text-white">{stats.totalEntities}</p>
            <p className="text-[11px] text-zinc-500">100% active with RoC</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Pending Filings</p>
            <p className="text-2xl font-black text-amber-400">{stats.pendingFilings}</p>
            <p className="text-[11px] text-amber-500/80">Awaiting DSC or MCA upload</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">SRN Approved</p>
            <p className="text-2xl font-black text-emerald-400">{stats.approvedSrns}</p>
            <p className="text-[11px] text-emerald-500/80">Challan receipts verified</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Statutory Registers</p>
            <p className="text-2xl font-black text-sky-400">{stats.compliantRegisters}</p>
            <p className="text-[11px] text-sky-500/80">Sec 88, 170, 85 authenticated</p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODULE NAVIGATION TABS
      ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("filings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "filings"
                ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-[#6B1728]" />
            <span>MCA21 e-Filings</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 font-mono">
              {filteredFilings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("registers")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "registers"
                ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#6B1728]" />
            <span>Statutory Registers</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 font-mono">
              {filteredRegisters.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("secretarial-audit")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "secretarial-audit"
                ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#6B1728]" />
            <span>Form MR-3 Audit</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
              Clean
            </span>
          </button>

          <button
            onClick={() => setActiveTab("entities")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "entities"
                ? "bg-white dark:bg-black text-black dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#6B1728]" />
            <span>Managed Entities</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 font-mono">
              {entities.length}
            </span>
          </button>
        </div>

        {/* Global Search within active sub-tab */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search forms, SRN, folios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#6B1728]"
          />
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: MCA21 & ROC STATUTORY FILINGS TRACKER
      ========================================================================= */}
      {activeTab === "filings" && (
        <div className="space-y-6">
          {/* Sub-Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500">e-Form:</span>
              {["ALL", "AOC-4", "MGT-7", "DIR-12", "PAS-3", "CHG-1", "DPT-3"].map((form) => (
                <button
                  key={form}
                  onClick={() => setFilingFormFilter(form)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    filingFormFilter === form
                      ? "bg-black dark:bg-white text-white dark:text-black font-bold"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  {form}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500">Status:</span>
              <select
                value={filingStatusFilter}
                onChange={(e) => setFilingStatusFilter(e.target.value)}
                aria-label="Filter by filing status"
                className="text-xs font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-black dark:text-white cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="drafted">Drafted</option>
                <option value="dsc_affixed">DSC Affixed</option>
                <option value="uploaded_mca">Uploaded to MCA</option>
                <option value="approved">Approved</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Filings Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFilings.map((filing) => {
              const isApproved = filing.status === "approved";
              const isUploaded = filing.status === "uploaded_mca";
              const isDscAffixed = filing.status === "dsc_affixed";

              return (
                <div
                  key={filing.id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-[#6B1728]/10 text-[#6B1728] dark:bg-[#6B1728]/30 dark:text-rose-300 font-mono">
                          {filing.formName}
                        </span>
                        <span className="text-xs font-semibold text-zinc-400">{filing.financialYear}</span>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          isApproved
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                            : isUploaded
                            ? "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-800"
                            : isDscAffixed
                            ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-800"
                            : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                        }`}
                      >
                        {isApproved ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : isUploaded ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span>{filing.status.replace(/_/g, " ")}</span>
                      </span>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-bold text-black dark:text-white line-clamp-2">
                        {filing.formDescription}
                      </h3>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">{filing.statutorySection}</p>
                    </div>

                    {/* Metadata block */}
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Statutory Due Date:</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
                          {filing.dueDate}
                        </span>
                      </div>

                      {filing.srn ? (
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Service Request # (SRN):</span>
                          <button
                            onClick={() => handleCopy(filing.srn || "", filing.id)}
                            className="inline-flex items-center gap-1 font-mono font-bold text-[#6B1728] dark:text-rose-300 hover:underline cursor-pointer"
                          >
                            <span>{filing.srn}</span>
                            {copiedText === filing.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3 text-zinc-400" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">MCA Fee / Challan:</span>
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono">
                            ₹{filing.challanAmount} ({filing.paymentStatus})
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Signatory DIN:</span>
                        <span className="font-medium text-zinc-600 dark:text-zinc-400 truncate max-w-[140px]">
                          {filing.signatoryName || filing.signatoryDin || "Managing Director"}
                        </span>
                      </div>
                    </div>

                    {filing.notes && (
                      <p className="text-[11px] text-zinc-500 italic">Note: {filing.notes}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-zinc-400 font-medium">
                      PCS: {filing.pcsCertificateNumber?.split(",")[0] || csName}
                    </span>
                    <button
                      onClick={() => {
                        // Quick toggle status for interactive demo
                        const nextStatus: Record<string, RocFilingItem["status"]> = {
                          drafted: "dsc_affixed",
                          dsc_affixed: "uploaded_mca",
                          uploaded_mca: "approved",
                          approved: "drafted",
                        };
                        const updated = nextStatus[filing.status] || "approved";
                        setFilings((prev) =>
                          prev.map((f) => (f.id === filing.id ? { ...f, status: updated } : f))
                        );
                        csApi.updateRocFiling(filing.id, { status: updated });
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
                    >
                      Cycle Status
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFilings.length === 0 && (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <FileCheck className="w-8 h-8 text-zinc-400 mx-auto" />
              <h4 className="text-sm font-bold text-black dark:text-white">No ROC Filings Found</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No statutory e-forms matched the selected filter criteria for {selectedCompanyName}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: STATUTORY REGISTERS VAULT (SEC 88, 170, 85, 186)
      ========================================================================= */}
      {activeTab === "registers" && (
        <div className="space-y-6">
          {/* Sub-Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500">Statutory Register:</span>
              {[
                { id: "ALL", label: "All Registers" },
                { id: "members", label: "Members (MGT-1)" },
                { id: "directors", label: "Directors & KMP (Sec 170)" },
                { id: "charges", label: "Charges (CHG-7)" },
                { id: "loans_investments", label: "Loans & Investments (MBP-2)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRegisterTypeFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    registerTypeFilter === tab.id
                      ? "bg-black dark:bg-white text-white dark:text-black font-bold"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (filteredRegisters.length > 0) {
                  setSelectedRegisterRecord(filteredRegisters[0]);
                  setCertifiedRegisterModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#6B1728]/10 text-[#6B1728] dark:bg-[#6B1728]/30 dark:text-rose-300 border border-[#6B1728]/30 hover:bg-[#6B1728]/20 transition-all cursor-pointer"
            >
              <FileBadge className="w-3.5 h-3.5" />
              <span>Export Certified Extract</span>
            </button>
          </div>

          {/* Table / Dossier Cards */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
                <thead className="bg-zinc-50 dark:bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-bold">Folio / Ref #</th>
                    <th className="px-4 py-3 font-bold">Holder / Institution</th>
                    <th className="px-4 py-3 font-bold">Statutory Form</th>
                    <th className="px-4 py-3 font-bold">Particulars & Clauses</th>
                    <th className="px-4 py-3 font-bold">Shares / Amount</th>
                    <th className="px-4 py-3 font-bold">Entry Date</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                  {filteredRegisters.map((reg) => (
                    <tr key={reg.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-black dark:text-white whitespace-nowrap">
                        {reg.folioOrRefNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-black dark:text-white">{reg.primaryHolderName}</div>
                        {reg.identificationNumber && (
                          <div className="text-[11px] text-zinc-400 font-mono">{reg.identificationNumber}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#6B1728]/10 text-[#6B1728] dark:bg-[#6B1728]/30 dark:text-rose-300 font-mono">
                          {reg.statutoryForm}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-zinc-600 dark:text-zinc-400">
                        {reg.particulars}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold whitespace-nowrap">
                        {reg.registerType === "members"
                          ? `${reg.quantityOrAmount.toLocaleString()} Shares`
                          : reg.quantityOrAmount > 0
                          ? `₹${reg.quantityOrAmount.toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono whitespace-nowrap text-zinc-500">{reg.entryDate}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedRegisterRecord(reg);
                            setCertifiedRegisterModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
                        >
                          View CTC
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
          VIEW 3: SECRETARIAL AUDIT & FORM MR-3 SUITE (SECTION 204)
      ========================================================================= */}
      {activeTab === "secretarial-audit" && (
        <div className="space-y-6">
          {/* Executive Audit Header Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Section 204 Secretarial Audit Engine: 100% Score</span>
              </div>
              <h2 className="text-xl font-black text-black dark:text-white">
                Secretarial Audit Report (Form MR-3)
              </h2>
              <p className="text-xs text-zinc-500 max-w-xl">
                Independent secretarial audit per Companies Act, 2013, SEBI LODR Regulations, FEMA Guidelines, 
                and ICSI Secretarial Standards (SS-1 & SS-2).
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 pt-1">
                <span>Practising CS: <strong className="text-zinc-800 dark:text-zinc-200">{csName} (FCS 8492)</strong></span>
                <span>•</span>
                <span>Peer Review: <strong className="text-zinc-800 dark:text-zinc-200">PR-1049/2023</strong></span>
                <span>•</span>
                <span>Audited Entity: <strong className="text-zinc-800 dark:text-zinc-200">{selectedCompanyName}</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setAuditReportModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#6B1728] hover:bg-[#800020] text-white shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Generate Form MR-3 Report</span>
              </button>
            </div>
          </div>

          {/* Checklist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(auditReport?.checklist || [
              {
                id: "chk-1",
                act: "Companies Act, 2013",
                section: "Section 149 & 152",
                subject: "Board Composition & Optimum Ratio of Independent Directors",
                status: "compliant",
                remarks: "Board consists of 4 directors including 1 Independent Director and 1 Woman Director.",
              },
              {
                id: "chk-2",
                act: "Companies Act, 2013",
                section: "Section 173(1)",
                subject: "Frequency of Board Meetings & Gap not exceeding 120 days",
                status: "compliant",
                remarks: "4 Board meetings held in the financial year with maximum gap between meetings being 84 days.",
              },
              {
                id: "chk-3",
                act: "Companies Act, 2013",
                section: "Section 118 & SS-1",
                subject: "Maintenance of Statutory Minutes Book & Secretarial Standards Compliance",
                status: "compliant",
                remarks: "Minutes recorded, numbered consecutively, draft circulated within 15 days and signed within 30 days.",
              },
              {
                id: "chk-4",
                act: "Companies Act, 2013",
                section: "Section 137 & 92",
                subject: "Annual Filing of Financial Statements (AOC-4) and Annual Return (MGT-7)",
                status: "compliant",
                remarks: "Form AOC-4 filed with SRN F93821048. MGT-7 DSC affixed and scheduled for filing.",
              },
              {
                id: "chk-5",
                act: "Companies Act, 2013",
                section: "Section 88 & 170",
                subject: "Statutory Registers maintenance at Registered Office",
                status: "compliant",
                remarks: "Registers of Members (MGT-1), Directors (Sec 170), and Charges (CHG-7) updated and authenticated.",
              },
              {
                id: "chk-6",
                act: "Companies Act, 2013",
                section: "Section 77 & 85",
                subject: "Registration & Satisfaction of Charges with Registrar of Companies",
                status: "compliant",
                remarks: "Charge created in favour of HDFC Bank registered within statutory 30-day window via Form CHG-1.",
              },
              {
                id: "chk-7",
                act: "Companies Act, 2013",
                section: "Section 188",
                subject: "Related Party Transactions & Audit Committee / Board Approvals",
                status: "compliant",
                remarks: "All contracts/arrangements entered at arm's length in ordinary course of business per Section 188(1).",
              },
              {
                id: "chk-8",
                act: "Foreign Exchange Management Act, 1999",
                section: "FEMA (Non-debt Instruments) Rules 2019",
                subject: "Foreign Direct Investment (FDI) & Form FC-GPR Reporting on FIRMS Portal",
                status: "compliant",
                remarks: "No offshore equity influx during the period under audit requiring RBI FIRMS filing.",
              },
            ]).map((item: any) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B1728] dark:text-rose-300 font-mono">
                      {item.act} • {item.section}
                    </span>
                    <h4 className="text-xs font-bold text-black dark:text-white">{item.subject}</h4>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Compliant</span>
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed bg-zinc-50 dark:bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                  {item.remarks}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: MANAGED CORPORATE ENTITIES MASTER DIRECTORY
      ========================================================================= */}
      {activeTab === "entities" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-black dark:text-white">
              Corporate Clients & Managed Entities ({entities.length})
            </h3>
            <button
              onClick={() => setCreateEntityModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Corporate Entity</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {entities.map((ent) => (
              <div
                key={ent.id}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-[#6B1728]">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                      {ent.entityType.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-black dark:text-white">{ent.companyName}</h4>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">{ent.cin}</p>
                    <p className="text-xs text-zinc-400">{ent.rocJurisdiction}</p>
                  </div>

                  {/* Capital Breakdown */}
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Authorized Capital:</span>
                      <span className="font-mono font-bold text-black dark:text-white">
                        ₹{(ent.authorizedCapital / 100000).toLocaleString()} Lakhs
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Paid-Up Capital:</span>
                      <span className="font-mono font-bold text-black dark:text-white">
                        ₹{(ent.paidUpCapital / 100000).toLocaleString()} Lakhs
                      </span>
                    </div>
                    {/* Visual Progress */}
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#6B1728] h-full rounded-full"
                        style={{ width: `${Math.min(100, (ent.paidUpCapital / ent.authorizedCapital) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Directors Count */}
                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                    <span>Active Board Members:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {ent.directors?.length || 0} Directors
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedCompanyName(ent.companyName);
                      setActiveTab("filings");
                    }}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer text-center"
                  >
                    Open ROC Filings
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCompanyName(ent.companyName);
                      setActiveTab("registers");
                    }}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-[#6B1728]/10 text-[#6B1728] dark:bg-[#6B1728]/30 dark:text-rose-300 hover:bg-[#6B1728]/20 transition-colors cursor-pointer text-center"
                  >
                    Registers
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: SCHEDULE NEW e-FORM FILING
      ========================================================================= */}
      {createFilingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  Schedule MCA21 e-Form Filing
                </h3>
                <p className="text-xs text-zinc-500 font-mono">{selectedCompanyName}</p>
              </div>
              <button
                onClick={() => setCreateFilingModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFiling} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    e-Form Type
                  </label>
                  <select
                    value={newFormName}
                    onChange={(e) => {
                      setNewFormName(e.target.value);
                      const descMap: Record<string, string> = {
                        "AOC-4": "Filing of Financial Statements & Auditor Report (Sec 137)",
                        "MGT-7": "Annual Return of Company Certified by PCS (Sec 92)",
                        "DIR-12": "Appointment / Resignation of Directors and KMP (Sec 170)",
                        "PAS-3": "Return of Allotment of Securities under Private Placement (Sec 42)",
                        "CHG-1": "Creation or Modification of Hypothecation Charge (Sec 77)",
                        "MGT-14": "Filing of Board & General Meeting Resolutions (Sec 117)",
                        "DPT-3": "Return of Deposits and Exempted Transactions",
                      };
                      if (descMap[e.target.value]) {
                        setNewFormDescription(descMap[e.target.value]);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-[#6B1728]"
                  >
                    <option value="AOC-4">Form AOC-4 (Financials)</option>
                    <option value="MGT-7">Form MGT-7 (Annual Return)</option>
                    <option value="DIR-12">Form DIR-12 (Directors/KMP)</option>
                    <option value="PAS-3">Form PAS-3 (Allotment)</option>
                    <option value="CHG-1">Form CHG-1 (Charge Creation)</option>
                    <option value="MGT-14">Form MGT-14 (Resolutions)</option>
                    <option value="DPT-3">Form DPT-3 (Deposits)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Statutory Due Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-[#6B1728]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Form Subject & Purpose
                </label>
                <input
                  type="text"
                  value={newFormDescription}
                  onChange={(e) => setNewFormDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-[#6B1728]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Statutory Section
                  </label>
                  <input
                    type="text"
                    value={newStatutorySection}
                    onChange={(e) => setNewStatutorySection(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-[#6B1728]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    MCA Challan Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={newChallanAmount}
                    onChange={(e) => setNewChallanAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-[#6B1728]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateFilingModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[#6B1728] hover:bg-[#800020] text-white shadow-md cursor-pointer"
                >
                  Schedule Filing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD STATUTORY REGISTER ENTRY
      ========================================================================= */}
      {createRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  Add Entry to Statutory Register
                </h3>
                <p className="text-xs text-zinc-500 font-mono">{selectedCompanyName}</p>
              </div>
              <button
                onClick={() => setCreateRegisterModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRegisterEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Register Type
                  </label>
                  <select
                    value={newRegType}
                    onChange={(e) => setNewRegType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-[#6B1728]"
                  >
                    <option value="members">Register of Members (MGT-1)</option>
                    <option value="directors">Register of Directors/KMP (Sec 170)</option>
                    <option value="charges">Register of Charges (CHG-7)</option>
                    <option value="loans_investments">Register of Loans/Investments (MBP-2)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Folio / Ref Number
                  </label>
                  <input
                    type="text"
                    value={newRegFolio}
                    onChange={(e) => setNewRegFolio(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#6B1728]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Primary Holder / Institution
                  </label>
                  <input
                    type="text"
                    value={newRegHolder}
                    onChange={(e) => setNewRegHolder(e.target.value)}
                    required
                    placeholder="e.g. Ramesh Chandra / HDFC Bank"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-[#6B1728]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    PAN / DIN / Charge ID
                  </label>
                  <input
                    type="text"
                    value={newRegIdNum}
                    onChange={(e) => setNewRegIdNum(e.target.value)}
                    placeholder="PAN / DIN / Charge ID"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#6B1728]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Particulars & Allotment / Charge Clauses
                </label>
                <textarea
                  value={newRegParticulars}
                  onChange={(e) => setNewRegParticulars(e.target.value)}
                  rows={2}
                  placeholder="Record allotment terms, certificate numbers, or charge properties..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-[#6B1728]"
                />
              </div>

              {newRegType === "members" && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      No. of Shares
                    </label>
                    <input
                      type="number"
                      value={newRegQty}
                      onChange={(e) => setNewRegQty(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Distinctive From
                    </label>
                    <input
                      type="text"
                      value={newRegDistFrom}
                      onChange={(e) => setNewRegDistFrom(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Distinctive To
                    </label>
                    <input
                      type="text"
                      value={newRegDistTo}
                      onChange={(e) => setNewRegDistTo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[#6B1728] hover:bg-[#800020] text-white shadow-md cursor-pointer"
                >
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: CERTIFIED TRUE COPY OF STATUTORY REGISTER EXTRACT
      ========================================================================= */}
      {certifiedRegisterModalOpen && selectedRegisterRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#6B1728] dark:text-rose-300">
                <FileBadge className="w-4 h-4" />
                <span>Statutory Register Certified True Copy (CTC)</span>
              </div>
              <button
                onClick={() => setCertifiedRegisterModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Register Letterhead */}
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-serif space-y-4 text-zinc-800 dark:text-zinc-200">
              <div className="text-center space-y-1 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-base font-extrabold uppercase font-sans tracking-wide text-black dark:text-white">
                  {selectedRegisterRecord.companyName}
                </h3>
                <p className="text-[11px] font-mono text-zinc-500">CIN: {selectedRegisterRecord.cin}</p>
                <p className="text-[11px] text-zinc-500">
                  Registered Office: {currentEntity?.registeredAddress || "Registered Office"}
                </p>
                <div className="pt-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold font-sans bg-black text-white dark:bg-white dark:text-black uppercase">
                    EXTRACT OF STATUTORY REGISTER (FORM {selectedRegisterRecord.statutoryForm})
                  </span>
                </div>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-zinc-500">Folio / Reference No:</span>
                    <p className="font-bold font-mono text-black dark:text-white">
                      {selectedRegisterRecord.folioOrRefNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Holder / Beneficiary:</span>
                    <p className="font-bold text-black dark:text-white">
                      {selectedRegisterRecord.primaryHolderName}
                    </p>
                  </div>
                </div>

                {selectedRegisterRecord.identificationNumber && (
                  <div>
                    <span className="text-zinc-500">Identification Credentials:</span>
                    <p className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                      {selectedRegisterRecord.identificationNumber}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-zinc-500">Particulars of Entry:</span>
                  <p className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 leading-relaxed font-serif">
                    {selectedRegisterRecord.particulars}
                  </p>
                </div>

                {selectedRegisterRecord.quantityOrAmount > 0 && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono font-bold">
                    <span>Quantitative / Monetary Consideration:</span>
                    <span className="text-[#6B1728] dark:text-rose-300">
                      {selectedRegisterRecord.registerType === "members"
                        ? `${selectedRegisterRecord.quantityOrAmount.toLocaleString()} Shares`
                        : `₹${selectedRegisterRecord.quantityOrAmount.toLocaleString()}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Statutory Attestation Stamp */}
              <div className="pt-6 border-t border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 font-sans text-[11px]">
                <div className="space-y-1">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    // CERTIFIED TRUE EXTRACT AS PER SECTION 88/170/85 //
                  </p>
                  <p className="text-zinc-500">
                    Inspected and authenticated from the Statutory Register Book maintained at the Registered Office.
                  </p>
                </div>

                <div className="text-right space-y-0.5">
                  <p className="font-extrabold text-black dark:text-white">{csName}</p>
                  <p className="text-zinc-500">Practising Company Secretary</p>
                  <p className="font-mono text-zinc-400">FCS 8492 | CP 10294</p>
                  <p className="text-zinc-400">{selectedRegisterRecord.entryDate}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Extract</span>
              </button>
              <button
                onClick={() => setCertifiedRegisterModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#6B1728] text-white hover:bg-[#800020] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: FORM MR-3 SECRETARIAL AUDIT REPORT GENERATOR
      ========================================================================= */}
      {auditReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#6B1728] dark:text-rose-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Secretarial Audit Report (Form MR-3) per Section 204</span>
              </div>
              <button
                onClick={() => setAuditReportModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official MR-3 Document Format */}
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-serif text-xs space-y-4 text-zinc-800 dark:text-zinc-200">
              <div className="text-center space-y-1 pb-4 border-b border-zinc-200 dark:border-zinc-800 font-sans">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#6B1728] dark:text-rose-400">
                  Form No. MR-3 [Pursuant to Section 204(1) of the Companies Act, 2013 and Rule 9 of the Companies (Appointment and Remuneration of Managerial Personnel) Rules, 2014]
                </span>
                <h3 className="text-lg font-black uppercase tracking-wide text-black dark:text-white pt-2">
                  SECRETARIAL AUDIT REPORT
                </h3>
                <p className="text-xs font-medium text-zinc-500">FOR THE FINANCIAL YEAR ENDED 31ST MARCH, 2026</p>
                <p className="text-xs font-bold text-black dark:text-white">To the Members of {selectedCompanyName.toUpperCase()}</p>
                <p className="text-[11px] font-mono text-zinc-500">CIN: {currentEntity?.cin || "U72200DL2022PTC394812"}</p>
              </div>

              <div className="space-y-3 leading-relaxed text-xs">
                <p>
                  We have conducted the secretarial audit of the compliance of applicable statutory provisions and the adherence to good corporate practices by <strong>{selectedCompanyName}</strong> (hereinafter called the Company). Secretarial Audit was conducted in a manner that provided us a reasonable basis for evaluating the corporate conducts/statutory compliances and expressing our opinion thereon.
                </p>
                <p>
                  Based on our verification of the Company’s books, papers, minute books, forms and returns filed and other records maintained by the Company and also the information provided by the Company, its officers, agents and authorized representatives during the conduct of secretarial audit, we hereby report that in our opinion, the Company has, during the audit period covering the financial year ended on 31st March, 2026 complied with the statutory provisions listed hereunder:
                </p>

                <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 font-sans text-xs">
                  <div className="font-bold text-black dark:text-white">Audited Acts & Regulations Evaluated:</div>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
                    <li>The Companies Act, 2013 (the Act) and the rules made thereunder;</li>
                    <li>The Securities Contracts (Regulation) Act, 1956 ('SCRA') and the rules made thereunder;</li>
                    <li>The Depositories Act, 1996 and the Regulations and Bye-laws framed thereunder;</li>
                    <li>Foreign Exchange Management Act, 1999 and the rules and regulations made thereunder to the extent of Foreign Direct Investment;</li>
                    <li>Secretarial Standards issued by The Institute of Company Secretaries of India (SS-1 and SS-2).</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-sans font-bold text-xs">
                  AUDITOR'S CLEAN OPINION: During the period under review the Company has complied with the provisions of the Act, Rules, Regulations, Guidelines, Standards, etc. mentioned above without any material qualifications or adverse reservations.
                </div>
              </div>

              {/* Signoff */}
              <div className="pt-6 border-t border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 font-sans text-xs">
                <div className="space-y-1 text-zinc-500">
                  <p>Place: New Delhi</p>
                  <p>Date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  <p className="font-mono text-[11px]">UDIN: S008492G00{Date.now().toString().slice(-6)}</p>
                </div>

                <div className="text-right space-y-0.5">
                  <p className="font-extrabold text-black dark:text-white">For Sharma & Associates</p>
                  <p className="text-zinc-600 dark:text-zinc-400">Company Secretaries</p>
                  <p className="font-bold text-[#6B1728] dark:text-rose-300">{csName}</p>
                  <p className="text-zinc-500 text-[11px]">FCS No. 8492 | C.P. No. 10294</p>
                  <p className="text-zinc-400 text-[11px]">Peer Review Certificate No. 1049/2023</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official MR-3</span>
              </button>
              <button
                onClick={() => setAuditReportModalOpen(false)}
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
