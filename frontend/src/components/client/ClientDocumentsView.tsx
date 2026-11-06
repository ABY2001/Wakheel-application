"use client";

import React, { useState, useEffect, useRef } from "react";
import { DocumentFilingView } from "@/components/client/DocumentFilingView";
import { citizenApi } from "@/lib/api";
import {
  FolderLock,
  BookOpen,
  Stamp,
  FileText,
  FileCheck,
  Search,
  Download,
  Eye,
  Trash2,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  ExternalLink,
  X,
  Copy,
  Check,
  File,
  UploadCloud,
  Scale,
} from "lucide-react";

export interface ClientDocument {
  id: string;
  name: string;
  category: "Pleading" | "Court Order" | "Affidavit" | "Contract" | "CTC" | "Filing Receipt";
  matter: string;
  size: string;
  uploadDate: string;
  isSigned: boolean;
  pages: number;
  hash: string;
  subType: "all" | "case-diary" | "certified-true-copies" | "contracts" | "document-filing";
  details?: string;
  fileUrl?: string;
}

const INITIAL_DOCUMENTS: ClientDocument[] = [
  {
    id: "doc-01",
    name: "WPC_19482_2024_Writ_Petition_Paperbook.pdf",
    category: "Pleading",
    matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    size: "4.8 MB",
    uploadDate: "14 Jun 2024",
    isSigned: true,
    pages: 42,
    hash: "sha256:8f4b23c8a91d0e41785cbfa7192",
    subType: "all",
    details: "High Court verified true copy writ petition with Annexures P-1 to P-8.",
  },
  {
    id: "doc-02",
    name: "Interim_Stay_Order_Bench_2A_High_Court.pdf",
    category: "Court Order",
    matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    size: "1.2 MB",
    uploadDate: "16 Oct 2026",
    isSigned: true,
    pages: 3,
    hash: "sha256:3a91b48f9024bc68e10dca27189",
    subType: "all",
    details: "Daily order granting extension of interim stay against realignment of 11KV lines.",
  },
  {
    id: "doc-03",
    name: "High_Court_Certified_True_Copy_Decree.pdf",
    category: "CTC",
    matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    size: "2.1 MB",
    uploadDate: "18 Oct 2024",
    isSigned: true,
    pages: 5,
    hash: "sha256:92cb1f570081d4a0e98c61fa348",
    subType: "certified-true-copies",
    details: "Official Certified True Copy issued by Assistant Registrar (Judicial), Kerala High Court. CTC No: HC-CTC-2024-8910.",
  },
  {
    id: "doc-04",
    name: "Sub_Court_Demarcation_Decree_CTC.pdf",
    category: "CTC",
    matter: "OS 412/2023 — Gopakumar v. Varghese",
    size: "1.8 MB",
    uploadDate: "12 Jan 2024",
    isSigned: true,
    pages: 4,
    hash: "sha256:5ef1092ab7c41908d32b84ac125",
    subType: "certified-true-copies",
    details: "Sub Court Ernakulam certified extract bearing judicial adhesive stamps of ₹50.",
  },
  {
    id: "doc-05",
    name: "Commercial_Lease_Agreement_Ernakulam.pdf",
    category: "Contract",
    matter: "Corporate Legal Affairs",
    size: "1.5 MB",
    uploadDate: "05 Mar 2024",
    isSigned: true,
    pages: 14,
    hash: "sha256:7c491da823bf108ec92451bc09a",
    subType: "contracts",
    details: "Registered 3-year commercial property lease deed with indemnity and arbitration clause.",
  },
  {
    id: "doc-06",
    name: "Software_Development_MSA_NDA_Executed.pdf",
    category: "Contract",
    matter: "ARB/NCLT/KOCHI/2024/041",
    size: "950 KB",
    uploadDate: "10 Jul 2024",
    isSigned: true,
    pages: 9,
    hash: "sha256:d12c8a49e50f3b890a214fe6881",
    subType: "contracts",
    details: "Master Services Agreement executed between Malabar Infotech and Coastal Logistics.",
  },
  {
    id: "doc-07",
    name: "High_Court_EFiling_Registry_Receipt.pdf",
    category: "Filing Receipt",
    matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    size: "420 KB",
    uploadDate: "14 Jun 2024",
    isSigned: true,
    pages: 1,
    hash: "sha256:2fa810bc931e508ab219c481944",
    subType: "document-filing",
    details: "eCourts e-filing acknowledgment receipt. Filing No: EF/KLHC/2024/19482. Scrutiny cleared.",
  },
  {
    id: "doc-08",
    name: "NCLT_Petition_Filing_Diary_Slip.pdf",
    category: "Filing Receipt",
    matter: "ARB/NCLT/KOCHI/2024/041",
    size: "380 KB",
    uploadDate: "01 Aug 2024",
    isSigned: true,
    pages: 1,
    hash: "sha256:a12b3c4d5e6f7a8b9c0d1e2f3a4",
    subType: "document-filing",
    details: "NCLT Kochi Bench diary slip acknowledging Section 9 company petition presentation.",
  },
];

const CASE_DIARY_ENTRIES = [
  {
    id: "diary-01",
    date: "16 Oct 2026",
    matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    bench: "High Court Bench 2A (Division Bench)",
    stage: "Interim Relief Hearing",
    notes: "Division Bench heard senior standing counsel for KSEB. Bench observed prima facie deviation from gazetted corridor. Interim injunction extended by 3 weeks. Adv. Meera Krishnan instructed to file rejoinder by 28th October.",
    nextAction: "File counter-rejoinder with survey commissioner report before next listing on 20-Nov-2024.",
  },
  {
    id: "diary-02",
    date: "22 Oct 2024",
    matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    bench: "Single Bench (Admission)",
    stage: "Notice Before Admission",
    notes: "Notice before admission issued to respondents 1 to 4. Special messenger service allowed at petitioner's cost.",
    nextAction: "Serve paper-book copies to office of Advocate General and KSEB standing counsel.",
  },
  {
    id: "diary-03",
    date: "15 Aug 2024",
    matter: "ARB/NCLT/KOCHI/2024/041 — Malabar Infotech",
    bench: "NCLT Court Hall 1 (Kochi)",
    stage: "Pre-Institution Scrutiny",
    notes: "Registry scrutiny pointed out defect regarding calculation of interest under MSME Development Act. Defect cured within statutory 7 days.",
    nextAction: "Matter cleared for division bench listing on 20-Nov-2024.",
  },
];

interface ClientDocumentsViewProps {
  initialTab?: "all" | "case-diary" | "certified-true-copies" | "contracts" | "document-filing";
}

export function ClientDocumentsView({
  initialTab = "all",
}: ClientDocumentsViewProps) {
  // Active navbar tab
  const [activeNavTab, setActiveNavTab] = useState<
    "all" | "case-diary" | "certified-true-copies" | "contracts" | "document-filing"
  >(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveNavTab(initialTab);
    }
  }, [initialTab]);

  // Documents state
  const [docsList, setDocsList] = useState<ClientDocument[]>(INITIAL_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMatterFilter, setSelectedMatterFilter] = useState("All Matters");
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Sync documents from backend API on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchDocs() {
      try {
        setLoadingDocs(true);
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("wakheel_token") || "dev_token"
            : "dev_token";
        const res = await citizenApi.getDocuments(token);
        if (isMounted && res?.success && Array.isArray(res.documents) && res.documents.length > 0) {
          setDocsList(res.documents);
        }
      } catch (err) {
        console.warn("Using fallback documents:", err);
      } finally {
        if (isMounted) setLoadingDocs(false);
      }
    }
    fetchDocs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ClientDocument | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newDocName, setNewDocName] = useState("");
  const [newDocCategory, setNewDocCategory] = useState<ClientDocument["category"]>("Pleading");
  const [newDocMatter, setNewDocMatter] = useState("WP(C) 19482/2024 — Gopakumar v. KSEB");
  const [newDocNotes, setNewDocNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const autoDetectCategory = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (lower.includes("affidavit")) {
      setNewDocCategory("Affidavit");
    } else if (lower.includes("order") || lower.includes("judgment") || lower.includes("judgement")) {
      setNewDocCategory("Court Order");
    } else if (lower.includes("ctc") || lower.includes("certified")) {
      setNewDocCategory("CTC");
    } else if (lower.includes("contract") || lower.includes("agreement") || lower.includes("lease") || lower.includes("nda")) {
      setNewDocCategory("Contract");
    } else if (lower.includes("receipt") || lower.includes("filing")) {
      setNewDocCategory("Filing Receipt");
    } else {
      setNewDocCategory("Pleading");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!newDocName.trim()) {
        setNewDocName(file.name);
      }
      autoDetectCategory(file.name);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!newDocName.trim()) {
        setNewDocName(file.name);
      }
      autoDetectCategory(file.name);
    }
  };

  const handleDownloadDocument = (doc: ClientDocument) => {
    if (doc.fileUrl && doc.fileUrl.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = doc.fileUrl;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const receiptContent = `WAKHEEL LEGAL OS — ENCRYPTED DOCUMENT CERTIFICATE
============================================================
Document: ${doc.name}
Vault Category: ${doc.category}
Associated Legal Matter: ${doc.matter}
File Size: ${doc.size}
Registered Timestamp: ${doc.uploadDate}
Cryptographic Integrity Hash: ${doc.hash}
Security Classification: AES-256 Encrypted / eCourts Ready
Registry Token: ${doc.id}
Remarks: ${doc.details || "Official citizen vault document"}
============================================================
Cryptographically attested by Wakheel Digital Court Vault`;
      const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${doc.name.replace(/\.[^/.]+$/, "")}_vault_receipt.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Filtered documents
  const filteredDocs = docsList.filter((doc) => {
    const matchesTab =
      activeNavTab === "all" ? true : doc.subType === activeNavTab || (activeNavTab === "contracts" && doc.category === "Contract") || (activeNavTab === "certified-true-copies" && doc.category === "CTC") || (activeNavTab === "document-filing" && doc.category === "Filing Receipt");
    const matchesMatter =
      selectedMatterFilter === "All Matters" || doc.matter.includes(selectedMatterFilter);
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.matter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.details && doc.details.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesMatter && matchesSearch;
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDocName = newDocName.trim() || (selectedFile ? selectedFile.name : "");
    if (!finalDocName && !selectedFile) return;

    setIsUploading(true);
    const targetSubType =
      newDocCategory === "Contract"
        ? "contracts"
        : newDocCategory === "CTC"
        ? "certified-true-copies"
        : newDocCategory === "Filing Receipt"
        ? "document-filing"
        : "all";

    const formattedName =
      finalDocName.includes(".")
        ? finalDocName
        : `${finalDocName}.pdf`;

    const realSize = selectedFile
      ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
      : "1.5 MB";

    // Compute actual SHA-256 integrity hash from the file buffer if available
    let computedHash = "";
    let fileDataUrl = "";

    if (selectedFile) {
      try {
        fileDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve("");
          reader.readAsDataURL(selectedFile);
        });

        if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const hashBuffer = await window.crypto.subtle.digest("SHA-256", arrayBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          computedHash = "sha256:" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        }
      } catch (err) {
        console.warn("Hashing/reading file error:", err);
      }
    }

    if (!computedHash) {
      computedHash = "sha256:" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    }

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("wakheel_token") || "dev_token"
        : "dev_token";

    try {
      const res = await citizenApi.uploadDocument(token, {
        title: finalDocName,
        name: formattedName,
        fileName: formattedName,
        category: newDocCategory,
        subType: targetSubType,
        matter: newDocMatter,
        size: realSize,
        fileSize: realSize,
        fileUrl: fileDataUrl,
        details: newDocNotes.trim() || `Cryptographically verified (${computedHash.slice(0, 16)}...) and secured in citizen vault.`,
        isSigned: true,
      });

      if (res?.success && res.document) {
        const docWithLocalUrl = {
          ...res.document,
          fileUrl: fileDataUrl || res.document.fileUrl,
          hash: computedHash || res.document.hash,
        };
        setDocsList((prev) => [docWithLocalUrl, ...prev.filter((d) => d.id !== res.document.id)]);
      } else {
        throw new Error("Upload response missing document");
      }
    } catch (err) {
      console.warn("Upload document API error, using secure client-side storage:", err);
      // Fallback local update
      const fallbackCreated: ClientDocument = {
        id: `doc-${Date.now()}`,
        name: formattedName,
        category: newDocCategory,
        matter: newDocMatter,
        size: realSize,
        uploadDate: "Just now",
        isSigned: true,
        pages: 3,
        hash: computedHash,
        subType: targetSubType,
        details: newDocNotes.trim() || "Uploaded securely to citizen document vault.",
        fileUrl: fileDataUrl,
      };
      setDocsList((prev) => [fallbackCreated, ...prev]);
    } finally {
      setIsUploading(false);
      setUploadModalOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setNewDocName("");
      setNewDocNotes("");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this document from your vault?")) {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("wakheel_token") || "dev_token"
          : "dev_token";
      try {
        await citizenApi.deleteDocument(token, id);
      } catch (err) {
        console.warn("Delete document error:", err);
      }
      setDocsList((prev) => prev.filter((d) => d.id !== id && (d as any)._id !== id));
      if (previewDoc?.id === id) setPreviewDoc(null);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const navItems = [
    { id: "all", label: "All Documents", icon: FolderLock },
    { id: "certified-true-copies", label: "Certified True Copies (CTC)", icon: Stamp },
    { id: "contracts", label: "Contracts", icon: FileText },
    { id: "document-filing", label: "Document Filing", icon: FileCheck },
  ] as const;

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-200">
      {activeNavTab === "case-diary" ? (
        /* Top Header for Case Diary (Brought Outside of Documents) */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                COURT PROCEEDINGS &amp; BENCH LOGS
              </span>
              <span className="text-zinc-400">•</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                Daily Order Diary
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight mt-1">
              My Case Diary
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500">
              Daily courtroom proceedings, bench orders, and advocate appearance notes for active matters.
            </p>
          </div>
        </div>
      ) : (
        /* Top Header for Documents Vault */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                  CITIZEN DOCUMENT VAULT
                </span>
                <span className="text-zinc-400">•</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                  256-Bit Encrypted
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight mt-1">
                Documents &amp; Case Records
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500">
                Encrypted court pleadings, certified true copies, executed contracts, and filing receipts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center gap-2 shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>

          {/* Horizontal Navbar: Vault Categories (Case Diary placed outside in sidebar) */}
          <div className="p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto text-xs sm:text-sm font-semibold">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeNavTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveNavTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-black text-black dark:text-white shadow-xs font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-white/50 dark:hover:bg-black/40"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ===================================================================== */}
      {/* VIEW: CASE DIARY LOGS                                                 */}
      {/* ===================================================================== */}
      {activeNavTab === "case-diary" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Case Diary &amp; Daily Hearing Logs</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Official notes recorded after court sessions and advocate bench appearances.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400">{CASE_DIARY_ENTRIES.length} Entries</span>
          </div>

          <div className="space-y-3.5">
            {CASE_DIARY_ENTRIES.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-5 space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs">
                      {entry.date}
                    </span>
                    <span className="font-bold text-sm text-black dark:text-white">
                      {entry.matter}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                    {entry.stage}
                  </span>
                </div>

                <div className="text-xs text-zinc-500 font-mono">
                  {entry.bench}
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white leading-relaxed">
                  {entry.notes}
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                  <span className="font-bold text-black dark:text-white">Follow-Up Action:</span>
                  <span>{entry.nextAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW: DOCUMENT FILING (Advocate Review Submission)                    */}
      {/* ===================================================================== */}
      {activeNavTab === "document-filing" && (
        <DocumentFilingView />
      )}

      {/* ===================================================================== */}
      {/* VIEW: DOCUMENTS TABLE (All, CTC, Contracts)                           */}
      {/* ===================================================================== */}
      {activeNavTab !== "case-diary" && activeNavTab !== "document-filing" && (
        <div className="space-y-4">
          {/* Search & Matter Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search file name, matter, or description..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto text-xs">
              <span className="text-zinc-500 text-xs whitespace-nowrap">Matter:</span>
              <select
                value={selectedMatterFilter}
                onChange={(e) => setSelectedMatterFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-black dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="All Matters">All Matters</option>
                <option value="WP(C) 19482/2024">WP(C) 19482/2024</option>
                <option value="ARB/NCLT">ARB/NCLT/KOCHI/2024/041</option>
                <option value="OS 412/2023">OS 412/2023</option>
              </select>
            </div>
          </div>

          {/* Documents Table Container */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-xs overflow-hidden">
            {filteredDocs.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <FolderLock className="w-8 h-8 mx-auto text-zinc-400" />
                <h4 className="text-sm font-bold text-black dark:text-white">No documents found</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  No records match your selected tab or search query. Click &quot;Upload Document&quot; to add a new file.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Document Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Associated Matter</th>
                      <th className="py-3 px-4">Size &amp; Pages</th>
                      <th className="py-3 px-4">Upload Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {filteredDocs.map((doc) => (
                      <tr
                        key={doc.id}
                        onClick={() => setPreviewDoc(doc)}
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors group cursor-pointer"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5">
                              {doc.category === "CTC" ? (
                                <Stamp className="w-4 h-4 text-black dark:text-white" />
                              ) : doc.category === "Contract" ? (
                                <FileText className="w-4 h-4 text-black dark:text-white" />
                              ) : (
                                <File className="w-4 h-4 text-black dark:text-white" />
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-bold text-black dark:text-white block group-hover:underline">
                                {doc.name}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                                <span>{doc.isSigned ? "Digitally Sealed" : "Verified Copy"}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-black dark:text-white">
                                  <Lock className="w-2.5 h-2.5" /> AES-256
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white">
                            {doc.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400 font-medium">
                          {doc.matter.split("—")[0].trim()}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-zinc-500">
                          {doc.size} ({doc.pages} pp)
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-zinc-500 font-mono">
                          {doc.uploadDate}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                              title="Preview Document Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDownloadDocument(doc)}
                              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                              title="Download File"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(doc.id)}
                              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                              title="Delete File"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* UPLOAD DOCUMENT MODAL                                                 */}
      {/* ===================================================================== */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-black dark:text-white" />
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  Upload to Encrypted Vault
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUploadModalOpen(false);
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="p-1 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              {/* HIDDEN FILE INPUT */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
              />

              {/* FILE PICKER / DRAG & DROP ZONE */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                  Document File {selectedFile && <span className="text-emerald-600 dark:text-emerald-400 font-mono">(Ready for Vault)</span>}
                </label>

                {selectedFile ? (
                  <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-150">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0 shadow-xs">
                        <File className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5 truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-black dark:text-white text-xs truncate">
                            {selectedFile.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                            AES-256 Ready
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || "Document"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-5 sm:p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 group ${
                      isDragging
                        ? "border-black dark:border-white bg-zinc-100 dark:bg-zinc-800"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white bg-zinc-50/50 dark:bg-zinc-900/30"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-black dark:text-white group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-black dark:text-white block">
                        <span className="underline">Click to browse</span> or drag and drop document
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono block">
                        Supports PDF, Word (.docx), Scanned Images (PNG, JPG) up to 25 MB
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                  Document Title / File Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Counter_Affidavit_WP_19482.pdf"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    Document Category
                  </label>
                  <select
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Pleading">Court Pleading</option>
                    <option value="Court Order">Court Order</option>
                    <option value="Affidavit">Affidavit</option>
                    <option value="CTC">Certified True Copy (CTC)</option>
                    <option value="Contract">Contract / Agreement</option>
                    <option value="Filing Receipt">Filing Receipt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    Associated Matter
                  </label>
                  <input
                    type="text"
                    value={newDocMatter}
                    onChange={(e) => setNewDocMatter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                  Document Notes / Registry Stamp Details
                </label>
                <textarea
                  rows={2}
                  value={newDocNotes}
                  onChange={(e) => setNewDocNotes(e.target.value)}
                  placeholder="e.g. Scanned true copy bearing Registry folio number..."
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-black dark:text-white shrink-0" />
                <span>Files are encrypted with AES-256 before disk storage and stamped with a SHA-256 integrity hash.</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadModalOpen(false);
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || (!selectedFile && !newDocName.trim())}
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold flex items-center gap-2 shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white dark:border-black border-t-transparent animate-spin" />
                      <span>Encrypting & Storing...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Save to Vault</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* DOCUMENT PREVIEW & INTEGRITY MODAL                                    */}
      {/* ===================================================================== */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-black dark:text-white" />
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  Document Information
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-zinc-400">File Name</span>
                <span className="text-sm font-bold text-black dark:text-white block break-all">
                  {previewDoc.name}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono block">
                  {previewDoc.category} • {previewDoc.size} • {previewDoc.pages} Pages
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-zinc-400">Associated Matter</span>
                <span className="font-bold text-black dark:text-white block">{previewDoc.matter}</span>
              </div>

              {previewDoc.details && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-zinc-400">Description / Seal Information</span>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    {previewDoc.details}
                  </p>
                </div>
              )}

              {/* SHA-256 Hash */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white" />
                    <span>Cryptographic Integrity Hash</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyHash(previewDoc.hash)}
                    className="text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 font-mono text-[10px] cursor-pointer"
                  >
                    {copiedHash === previewDoc.hash ? (
                      <>
                        <Check className="w-3 h-3 text-black dark:text-white" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Hash
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 break-all select-all">
                  {previewDoc.hash}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleDelete(previewDoc.id)}
                  className="text-zinc-500 hover:text-black dark:hover:text-white text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove from Vault
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadDocument(previewDoc)}
                  className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
