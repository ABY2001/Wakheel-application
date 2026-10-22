"use client";

import React, { useState, useEffect } from "react";
import { advocateApi, AdvocateClientItem, AdvocateClientDossier } from "@/lib/api";
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Scale,
  Calendar,
  FileText,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight,
  Briefcase,
  DollarSign,
  FileCheck,
  Edit3,
  MessageSquare,
  Video,
  Clock,
  Download,
  Info,
} from "lucide-react";

interface AdvocateClientsViewProps {
  token?: string;
  advocateName?: string;
  onOpenChat?: (citizenId?: string) => void;
  onOpenConsultation?: (citizenId?: string) => void;
  onOpenMatter?: (matterId: string) => void;
}

export function AdvocateClientsView({
  token,
  advocateName = "Advocate Chamber",
  onOpenChat,
  onOpenConsultation,
  onOpenMatter,
}: AdvocateClientsViewProps) {
  const [clients, setClients] = useState<AdvocateClientItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "matters" | "billed" | "recent">("recent");

  // Dossier modal state
  const [selectedClient, setSelectedClient] = useState<AdvocateClientItem | null>(null);
  const [dossierData, setDossierData] = useState<AdvocateClientDossier["dossier"] | null>(null);
  const [dossierLoading, setDossierLoading] = useState<boolean>(false);
  const [dossierTab, setDossierTab] = useState<"matters" | "consultations" | "invoices" | "documents" | "profile">("matters");

  // Add client modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addLoading, setAddLoading] = useState<boolean>(false);
  const [newClientData, setNewClientData] = useState({
    fullName: "",
    category: "Individual Citizen",
    email: "",
    phone: "",
    location: "Kochi, Kerala",
    address: "",
    panOrGstin: "",
    initialMatterTitle: "",
    vakalatnamaExecuted: true,
    kycVerified: true,
    notes: "",
  });

  // Edit client modal state
  const [editingClient, setEditingClient] = useState<AdvocateClientItem | null>(null);
  const [editLoading, setEditLoading] = useState<boolean>(false);

  // Status toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadClients = async () => {
    try {
      setRefreshing(true);
      const res = await advocateApi.getClients(token);
      if (res.success && Array.isArray(res.clients)) {
        setClients(res.clients);
      }
    } catch (err) {
      console.error("Failed to load clients:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [token]);

  // Open 360 Dossier Modal
  const handleOpenDossier = async (client: AdvocateClientItem) => {
    setSelectedClient(client);
    setDossierTab("matters");
    setDossierLoading(true);
    try {
      const res = await advocateApi.getClientDetails(client._id, token);
      if (res.success && res.dossier) {
        setDossierData(res.dossier);
      } else {
        setDossierData({ matters: [], consultations: [], invoices: [], documents: [] });
      }
    } catch (err) {
      console.error("Failed to load client dossier:", err);
      setDossierData({ matters: [], consultations: [], invoices: [], documents: [] });
    } finally {
      setDossierLoading(false);
    }
  };

  // Add Client Submission
  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientData.fullName.trim()) return;

    try {
      setAddLoading(true);
      const res = await advocateApi.addClient(
        {
          fullName: newClientData.fullName,
          category: newClientData.category,
          email: newClientData.email,
          phone: newClientData.phone,
          location: newClientData.location,
          panOrGstin: newClientData.panOrGstin,
          initialMatterTitle: newClientData.initialMatterTitle,
          vakalatnamaExecuted: newClientData.vakalatnamaExecuted,
          kycVerified: newClientData.kycVerified,
          notes: newClientData.notes,
        },
        token
      );

      if (res.success && res.client) {
        setClients((prev) => [res.client, ...prev]);
        setShowAddModal(false);
        showToast(`Client "${res.client.fullName}" successfully registered in chamber roster.`);
        setNewClientData({
          fullName: "",
          category: "Individual Citizen",
          email: "",
          phone: "",
          location: "Kochi, Kerala",
          address: "",
          panOrGstin: "",
          initialMatterTitle: "",
          vakalatnamaExecuted: true,
          kycVerified: true,
          notes: "",
        });
      }
    } catch (err) {
      console.error("Error creating client:", err);
      showToast("Failed to onboard client. Please check details.");
    } finally {
      setAddLoading(false);
    }
  };

  // Edit Client Submission
  const handleUpdateClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      setEditLoading(true);
      const res = await advocateApi.updateClient(editingClient._id, editingClient, token);
      if (res.success && res.client) {
        setClients((prev) => prev.map((c) => (c._id === editingClient._id ? res.client : c)));
        if (selectedClient?._id === editingClient._id) {
          setSelectedClient(res.client);
        }
        setEditingClient(null);
        showToast("Client record updated successfully.");
      }
    } catch (err) {
      console.error("Error updating client:", err);
      showToast("Failed to update client record.");
    } finally {
      setEditLoading(false);
    }
  };

  // KPI Calculations
  const totalClientsCount = clients.length;
  const activeMattersTotal = clients.reduce((sum, c) => sum + (c.activeMattersCount || 0), 0);
  const kycVerifiedCount = clients.filter((c) => c.kycVerified).length;
  const kycRate = totalClientsCount > 0 ? Math.round((kycVerifiedCount / totalClientsCount) * 100) : 100;
  const totalBilledAggregate = clients.reduce((sum, c) => sum + (c.totalBilled || 0), 0);
  const totalPaidAggregate = clients.reduce((sum, c) => sum + (c.totalPaid || 0), 0);

  // Filter & Search Logic
  const filteredClients = clients
    .filter((c) => {
      // Category filter
      if (categoryFilter === "active" && (!c.activeMattersCount || c.activeMattersCount === 0)) return false;
      if (categoryFilter === "corporate" && !c.category?.toLowerCase().includes("corporate") && !c.category?.toLowerCase().includes("msme")) return false;
      if (categoryFilter === "retainer" && c.status?.toLowerCase() !== "retainer") return false;
      if (categoryFilter === "kyc_pending" && c.kycVerified) return false;
      if (categoryFilter === "vakalat_pending" && c.vakalatnamaExecuted) return false;

      // Text search
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const inName = c.fullName?.toLowerCase().includes(q);
      const inEmail = c.email?.toLowerCase().includes(q);
      const inPhone = c.phone?.toLowerCase().includes(q);
      const inLocation = c.location?.toLowerCase().includes(q);
      const inMatters = c.activeMatters?.some((m) => m.toLowerCase().includes(q));
      return inName || inEmail || inPhone || inLocation || inMatters;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.fullName.localeCompare(b.fullName);
      if (sortBy === "matters") return (b.activeMattersCount || 0) - (a.activeMattersCount || 0);
      if (sortBy === "billed") return (b.totalBilled || 0) - (a.totalBilled || 0);
      return 0; // default recent
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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">
              Citizen &amp; Client Representation Roster
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
              {clients.length} Clients
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Verified client briefs, power of attorney (vakalatnama) records, active court pipelines, and billing balances.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadClients}
            disabled={refreshing}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
            title="Refresh Roster"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Client</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: Total Representation */}
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Clients</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-black dark:text-white">{totalClientsCount}</p>
          <p className="text-[10px] text-zinc-500 font-mono">
            {clients.filter((c) => c.category?.toLowerCase().includes("corporate")).length} Corporate •{" "}
            {clients.filter((c) => !c.category?.toLowerCase().includes("corporate")).length} Individual
          </p>
        </div>

        {/* KPI 2: Active Court Briefs */}
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Briefs</span>
            <Scale className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-black dark:text-white">{activeMattersTotal}</p>
          <p className="text-[10px] text-zinc-500 font-mono">Kerala High Court &amp; Subordinate</p>
        </div>

        {/* KPI 3: KYC Verified */}
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">KYC Compliance</span>
            <Shield className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-black dark:text-white">{kycRate}%</p>
          <p className="text-[10px] text-zinc-500 font-mono">
            {kycVerifiedCount} of {totalClientsCount} verified
          </p>
        </div>

        {/* KPI 4: Financial Balance */}
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Fee Realization</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-black dark:text-white">
            ₹{totalPaidAggregate.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-zinc-500 font-mono">
            of ₹{totalBilledAggregate.toLocaleString("en-IN")} billed
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, phone, email, matter, or city..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          {[
            { id: "all", label: "All Clients" },
            { id: "active", label: "Active Briefs" },
            { id: "corporate", label: "Corporate / MSME" },
            { id: "retainer", label: "Retainers" },
            { id: "kyc_pending", label: "KYC Pending" },
            { id: "vakalat_pending", label: "Vakalat Pending" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === tab.id
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-zinc-500 whitespace-nowrap hidden sm:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="recent">Recently Added</option>
            <option value="name">Client Name (A-Z)</option>
            <option value="matters">Most Active Matters</option>
            <option value="billed">Highest Billed</option>
          </select>
        </div>
      </div>

      {/* Clients Cards Grid */}
      {loading ? (
        <div className="p-12 text-center border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-black space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400" />
          <p className="text-xs text-zinc-500">Loading client representation roster...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-black space-y-3">
          <Users className="w-8 h-8 mx-auto text-zinc-400" />
          <h3 className="text-sm font-bold text-black dark:text-white">No Clients Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery
              ? `No representation records matched your search "${searchQuery}".`
              : "No clients currently match the selected filter category."}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setCategoryFilter("all");
            }}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClients.map((client) => {
            const isCorporate = client.category?.toLowerCase().includes("corporate") || client.category?.toLowerCase().includes("msme");
            const balanceDue = (client.totalBilled || 0) - (client.totalPaid || 0);

            return (
              <div
                key={client._id}
                className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3.5 shadow-xs hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex flex-col justify-between"
              >
                {/* Header row */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-bold text-xs text-black dark:text-white shrink-0">
                        {isCorporate ? (
                          <Building className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                        ) : (
                          <User className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-black dark:text-white truncate">
                            {client.fullName}
                          </h3>
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate flex items-center space-x-1.5 mt-0.5">
                          <span>{client.category}</span>
                          <span>•</span>
                          <span>{client.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                        {client.status || "Active Brief"}
                      </span>
                    </div>
                  </div>

                  {/* Verification badges & Contact details */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 border-t border-b border-zinc-100 dark:border-zinc-900 py-2.5">
                    <div className="flex items-center space-x-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate font-mono">{client.phone || "No phone"}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{client.email || "No email"}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Shield className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{client.kycVerified ? "KYC Verified" : "KYC Pending"}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{client.vakalatnamaExecuted ? "Vakalatnama Executed" : "Vakalat Pending"}</span>
                    </div>
                  </div>

                  {/* Primary Brief / Matter */}
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Active Briefs ({client.activeMattersCount || 0})
                    </span>
                    {client.activeMatters && client.activeMatters.length > 0 ? (
                      <p className="text-xs font-semibold text-black dark:text-white line-clamp-1">
                        {client.activeMatters[0]}
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">No dockets filed yet</p>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Next Hearing, Financials & Actions */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between text-xs border-t border-zinc-100 dark:border-zinc-900 pt-2 font-mono">
                    <span className="text-zinc-500 text-[11px] truncate max-w-[55%]">
                      {client.nextHearing || "Next listing pending"}
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400 text-[11px]">
                      Billed: ₹{(client.totalBilled || 0).toLocaleString("en-IN")}{" "}
                      {balanceDue > 0 && <span className="font-bold text-black dark:text-white">(Due: ₹{balanceDue.toLocaleString("en-IN")})</span>}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => handleOpenDossier(client)}
                      className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>360° Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          if (onOpenChat) onOpenChat(client.citizenId);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-black dark:text-white flex items-center space-x-1 cursor-pointer transition-colors"
                        title="Open Privileged Chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Message</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onOpenConsultation) onOpenConsultation(client.citizenId);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-black dark:text-white flex items-center space-x-1 cursor-pointer transition-colors"
                        title="Book Chamber Session"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Session</span>
                      </button>

                      <button
                        onClick={() => setEditingClient({ ...client })}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer transition-colors"
                        title="Edit Client Information"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* 360° CLIENT DOSSIER MODAL                                      */}
      {/* ============================================================== */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between bg-zinc-50 dark:bg-zinc-950">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-sm shrink-0">
                  {selectedClient.category?.toLowerCase().includes("corporate") ? (
                    <Building className="w-6 h-6" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h2 className="text-lg font-bold text-black dark:text-white">
                      {selectedClient.fullName}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                      {selectedClient.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{selectedClient.location}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1 font-mono">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{selectedClient.phone}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{selectedClient.email}</span>
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedClient(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Tabs */}
            <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 px-6 gap-2 bg-white dark:bg-black overflow-x-auto">
              {[
                { id: "matters", label: "Matters & Briefs", count: dossierData?.matters?.length },
                { id: "consultations", label: "Chamber Sessions", count: dossierData?.consultations?.length },
                { id: "invoices", label: "Fee Invoices", count: dossierData?.invoices?.length },
                { id: "documents", label: "Vault Documents", count: dossierData?.documents?.length },
                { id: "profile", label: "Client Profile & Vakalat" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDossierTab(t.id as any)}
                  className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    dossierTab === t.id
                      ? "border-black text-black dark:border-white dark:text-white"
                      : "border-transparent text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <span>{t.label}</span>
                  {t.count !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {dossierLoading ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400" />
                  <p className="text-xs text-zinc-500">Retrieving aggregated client representation dossier...</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: Matters & Dockets */}
                  {dossierTab === "matters" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          Active Legal Proceedings &amp; Dockets
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                          {dossierData?.matters?.length || 0} briefs recorded
                        </span>
                      </div>

                      {dossierData?.matters && dossierData.matters.length > 0 ? (
                        <div className="space-y-3">
                          {dossierData.matters.map((m: any, idx: number) => (
                            <div
                              key={m._id || idx}
                              className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="text-sm font-bold text-black dark:text-white">
                                    {m.matterTitle || m.caseTitle || m.title || "Untitled Matter"}
                                  </h4>
                                  <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                                    CNR: {m.cnrNumber || "Unassigned"} • Court: {m.courtForum || m.court || "High Court of Kerala"}
                                  </p>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                                  {m.status || "Admitted"}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1 text-zinc-600 dark:text-zinc-400 font-mono">
                                <div>
                                  <span className="text-zinc-400 block text-[10px] uppercase">Stage</span>
                                  <span>{m.stage || "Active Proceedings"}</span>
                                </div>
                                <div>
                                  <span className="text-zinc-400 block text-[10px] uppercase">Next Hearing</span>
                                  <span>{m.nextHearingDate ? new Date(m.nextHearingDate).toLocaleDateString() : "Listing Pending"}</span>
                                </div>
                                <div>
                                  <span className="text-zinc-400 block text-[10px] uppercase">Court Hall</span>
                                  <span>{m.courtHall || "Registry Scrutiny"}</span>
                                </div>
                              </div>

                              {m.timeline && m.timeline.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                                    Latest Timeline Event
                                  </span>
                                  <div className="p-2 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-start space-x-2">
                                    <Clock className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                                    <div>
                                      <p className="font-semibold text-black dark:text-white text-[11px]">
                                        {m.timeline[m.timeline.length - 1].title} ({m.timeline[m.timeline.length - 1].date})
                                      </p>
                                      <p className="text-[10px] text-zinc-500 mt-0.5">
                                        {m.timeline[m.timeline.length - 1].remarks}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                          <Scale className="w-6 h-6 mx-auto text-zinc-400 mb-2" />
                          <p className="text-xs text-zinc-500">No active court dockets linked to this client yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: Consultations */}
                  {dossierTab === "consultations" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          Chamber Consultation Sessions
                        </span>
                        <button
                          onClick={() => {
                            setSelectedClient(null);
                            if (onOpenConsultation) onOpenConsultation(selectedClient.citizenId);
                          }}
                          className="text-xs font-bold underline cursor-pointer"
                        >
                          + Schedule New Session
                        </button>
                      </div>

                      {dossierData?.consultations && dossierData.consultations.length > 0 ? (
                        <div className="space-y-3">
                          {dossierData.consultations.map((c: any, idx: number) => (
                            <div
                              key={c._id || idx}
                              className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-black dark:text-white">
                                  {c.subject || c.legalDomain || "Chamber Consultation"}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
                                  {c.status}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500">{c.clientNotes || "No preliminary brief submitted."}</p>
                              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
                                <span>
                                  Date: {c.scheduledDate} • Slot: {c.timeSlot}
                                </span>
                                <span>Fee: ₹{(c.fee || 2500).toLocaleString("en-IN")}</span>
                              </div>
                              {c.adviceNotes && (
                                <div className="p-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs">
                                  <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">Recorded Legal Advice</span>
                                  <p className="text-zinc-700 dark:text-zinc-300">{c.adviceNotes}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                          <Video className="w-6 h-6 mx-auto text-zinc-400 mb-2" />
                          <p className="text-xs text-zinc-500">No previous chamber consultations found.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: Invoices & Fees */}
                  {dossierTab === "invoices" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          Professional Fee Invoices &amp; Receipts
                        </span>
                        <span className="text-xs font-mono font-bold">
                          Billed: ₹{(selectedClient.totalBilled || 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {dossierData?.invoices && dossierData.invoices.length > 0 ? (
                        <div className="space-y-3">
                          {dossierData.invoices.map((inv: any, idx: number) => (
                            <div
                              key={inv._id || idx}
                              className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-mono font-bold text-black dark:text-white">
                                    {inv.invoiceNumber || `INV-${idx + 1}`}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
                                    {inv.status}
                                  </span>
                                </div>
                                <p className="text-xs font-semibold text-black dark:text-white">
                                  {inv.matterTitle || inv.description || "Advocate Retainer Brief"}
                                </p>
                                <p className="text-[10px] font-mono text-zinc-400">
                                  Issued: {inv.issueDate || "Recent"} • Due: {inv.dueDate || "N/A"}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-sm font-black text-black dark:text-white font-mono">
                                  ₹{(inv.amount || 0).toLocaleString("en-IN")}
                                </p>
                                <span className="text-[10px] text-zinc-500 uppercase font-mono">
                                  {inv.paymentMethod || "UPI / Direct NEFT"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                          <DollarSign className="w-6 h-6 mx-auto text-zinc-400 mb-2" />
                          <p className="text-xs text-zinc-500">No invoices generated for this client yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: Vault Documents */}
                  {dossierTab === "documents" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          Privileged Document Vault
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                          {dossierData?.documents?.length || 0} court filings &amp; drafts
                        </span>
                      </div>

                      {dossierData?.documents && dossierData.documents.length > 0 ? (
                        <div className="space-y-3">
                          {dossierData.documents.map((doc: any, idx: number) => (
                            <div
                              key={doc._id || idx}
                              className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-black dark:text-white truncate">
                                    {doc.title || doc.name || doc.fileName || "Legal Document"}
                                  </h4>
                                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                    {doc.category || "Filing"} • {doc.size || doc.fileSize || "1.2 MB"} • {doc.filingStatus || "Ready"}
                                  </p>
                                </div>
                              </div>

                              <span className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 bg-white dark:bg-black">
                                {doc.isSigned ? "Digitally Signed" : "Draft Pleading"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                          <FileText className="w-6 h-6 mx-auto text-zinc-400 mb-2" />
                          <p className="text-xs text-zinc-500">No documents uploaded in client vault.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 5: Profile & Vakalat Information */}
                  {dossierTab === "profile" && (
                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                            Representation Credentials
                          </span>
                          <div className="space-y-1.5 font-mono">
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Category:</span>
                              <span className="font-bold text-black dark:text-white">{selectedClient.category}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Vakalat Status:</span>
                              <span className="font-bold text-black dark:text-white">
                                {selectedClient.vakalatnamaExecuted ? "Executed & Filed" : "Pending Signature"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">KYC Status:</span>
                              <span className="font-bold text-black dark:text-white">
                                {selectedClient.kycVerified ? "Identity Verified" : "Pending Verification"}
                              </span>
                            </div>
                            {selectedClient.panOrGstin && (
                              <div className="flex justify-between">
                                <span className="text-zinc-500">PAN / GSTIN:</span>
                                <span className="font-bold text-black dark:text-white">{selectedClient.panOrGstin}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                            Contact &amp; Domicile
                          </span>
                          <div className="space-y-1.5">
                            <div className="flex justify-between font-mono">
                              <span className="text-zinc-500">Phone:</span>
                              <span className="text-black dark:text-white">{selectedClient.phone}</span>
                            </div>
                            <div className="flex justify-between font-mono">
                              <span className="text-zinc-500">Email:</span>
                              <span className="text-black dark:text-white">{selectedClient.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Location:</span>
                              <span className="text-black dark:text-white">{selectedClient.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Internal Chamber Notes */}
                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                          Chamber Confidential Notes
                        </span>
                        <p className="text-zinc-600 dark:text-zinc-300 italic">
                          {selectedClient.notes || "No internal chamber remarks recorded for this client."}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedClient(null);
                    if (onOpenChat) onOpenChat(selectedClient.citizenId);
                  }}
                  className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chamber Chat</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedClient(null);
                    if (onOpenConsultation) onOpenConsultation(selectedClient.citizenId);
                  }}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                >
                  <Video className="w-3.5 h-3.5 inline mr-1" />
                  <span>Book Consultation</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold text-xs cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD NEW CLIENT MODAL                                           */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Onboard New Client to Chamber Roster
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Register citizen or corporate entity for legal representation and vakalatnama filing.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddClientSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Client / Entity Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newClientData.fullName}
                  onChange={(e) => setNewClientData({ ...newClientData, fullName: e.target.value })}
                  placeholder="e.g. Smt. Lakshmi Warrier or Horizon Logistics LLP"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Representation Category
                  </label>
                  <select
                    value={newClientData.category}
                    onChange={(e) => setNewClientData({ ...newClientData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  >
                    <option value="Individual Citizen">Individual Citizen</option>
                    <option value="Corporate Enterprise">Corporate Enterprise</option>
                    <option value="MSME">MSME</option>
                    <option value="Retainer Client">Retainer Client</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    City / Domicile
                  </label>
                  <input
                    type="text"
                    value={newClientData.location}
                    onChange={(e) => setNewClientData({ ...newClientData, location: e.target.value })}
                    placeholder="e.g. Kochi, Kerala"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={newClientData.phone}
                    onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                    placeholder="+91 94470 00000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newClientData.email}
                    onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                    placeholder="client@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Initial Matter Title / Brief Overview
                </label>
                <input
                  type="text"
                  value={newClientData.initialMatterTitle}
                  onChange={(e) => setNewClientData({ ...newClientData, initialMatterTitle: e.target.value })}
                  placeholder="e.g. WP(C) Writ Petition against Land Acquisition Notice"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newClientData.vakalatnamaExecuted}
                    onChange={(e) => setNewClientData({ ...newClientData, vakalatnamaExecuted: e.target.checked })}
                    className="rounded accent-black dark:accent-white"
                  />
                  <span className="text-xs font-semibold text-black dark:text-white">Vakalatnama Executed</span>
                </label>

                <label className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newClientData.kycVerified}
                    onChange={(e) => setNewClientData({ ...newClientData, kycVerified: e.target.checked })}
                    className="rounded accent-black dark:accent-white"
                  />
                  <span className="text-xs font-semibold text-black dark:text-white">KYC Verified</span>
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Confidential Chamber Notes
                </label>
                <textarea
                  rows={2}
                  value={newClientData.notes}
                  onChange={(e) => setNewClientData({ ...newClientData, notes: e.target.value })}
                  placeholder="Internal notes on fee arrangement, urgency, or next steps..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider cursor-pointer hover:opacity-90 disabled:opacity-50"
                >
                  {addLoading ? "Onboarding..." : "Register Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT CLIENT MODAL                                              */}
      {/* ============================================================== */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-black dark:text-white">
                Edit Client: {editingClient.fullName}
              </h3>
              <button
                onClick={() => setEditingClient(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateClientSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingClient.fullName}
                  onChange={(e) => setEditingClient({ ...editingClient, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Phone</label>
                  <input
                    type="text"
                    value={editingClient.phone}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={editingClient.email}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    value={editingClient.location}
                    onChange={(e) => setEditingClient({ ...editingClient, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</label>
                  <select
                    value={editingClient.status}
                    onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                  >
                    <option value="Active Matter">Active Matter</option>
                    <option value="Pre Filing">Pre Filing</option>
                    <option value="Retainer">Retainer</option>
                    <option value="Disposed">Disposed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingClient.vakalatnamaExecuted}
                    onChange={(e) => setEditingClient({ ...editingClient, vakalatnamaExecuted: e.target.checked })}
                    className="rounded accent-black dark:accent-white"
                  />
                  <span className="text-xs font-semibold text-black dark:text-white">Vakalat Executed</span>
                </label>

                <label className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingClient.kycVerified}
                    onChange={(e) => setEditingClient({ ...editingClient, kycVerified: e.target.checked })}
                    className="rounded accent-black dark:accent-white"
                  />
                  <span className="text-xs font-semibold text-black dark:text-white">KYC Verified</span>
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Chamber Notes
                </label>
                <textarea
                  rows={2}
                  value={editingClient.notes || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider cursor-pointer hover:opacity-90 disabled:opacity-50"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
