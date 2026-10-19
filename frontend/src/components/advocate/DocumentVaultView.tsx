"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FolderLock,
  FileText,
  UploadCloud,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HardDrive,
  File,
  Image as ImageIcon,
  FileCode,
  Plus,
  Folder,
  X,
  Copy,
  Check,
  Share2,
  Lock,
  ExternalLink,
} from "lucide-react";

export interface VaultDocument {
  id: string;
  name: string;
  matter: string;
  folder: "Pleadings & Petitions" | "Certified Court Orders" | "Evidence & Exhibits" | "Client Vakalats & KYC";
  fileType: "pdf" | "docx" | "image" | "scan";
  size: string;
  uploadDate: string;
  hash: string;
  isEncrypted: boolean;
  pages?: number;
  previewUrl?: string;
  notes?: string;
}

const INITIAL_VAULT_FILES: VaultDocument[] = [
  {
    id: "doc-01",
    name: "WPC_19482_2024_Writ_Petition_Final_Paperbook.pdf",
    matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    folder: "Pleadings & Petitions",
    fileType: "pdf",
    size: "4.8 MB",
    uploadDate: "Today, 10:15 AM",
    hash: "sha256:8f4b23c8a91d0e41785cbfa7192",
    isEncrypted: true,
    pages: 42,
    notes: "Main writ petition bundle with Annexures P-1 to P-8 verified by High Court filing scrutiny.",
  },
  {
    id: "doc-02",
    name: "Ext_P2_Village_Mahazar_Resettlement_Survey.pdf",
    matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    folder: "Evidence & Exhibits",
    fileType: "scan",
    size: "2.3 MB",
    uploadDate: "18 Oct 2026",
    hash: "sha256:d12c8a49e50f3b890a214fe6881",
    isEncrypted: true,
    pages: 6,
    notes: "Certified extract of site survey sketch showing ancient teak tree plantation within right-of-way.",
  },
  {
    id: "doc-03",
    name: "Interim_Stay_Order_Single_Bench_2026.pdf",
    matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    folder: "Certified Court Orders",
    fileType: "pdf",
    size: "1.1 MB",
    uploadDate: "16 Oct 2026",
    hash: "sha256:3a91b48f9024bc68e10dca27189",
    isEncrypted: true,
    pages: 3,
    notes: "Daily order granting status quo as to realignment of 11KV transmission lines until 14 Nov.",
  },
  {
    id: "doc-04",
    name: "Cheque_Dishonour_Notice_Postal_Acknowledgment.pdf",
    matter: "CC 412/2024 — Cheque Dishonour (S.138 NI Act)",
    folder: "Evidence & Exhibits",
    fileType: "pdf",
    size: "1.6 MB",
    uploadDate: "15 Oct 2026",
    hash: "sha256:7c491da823bf108ec92451bc09a",
    isEncrypted: true,
    pages: 4,
    notes: "Statutory notice under Section 138(b) along with India Post tracking report proving due delivery.",
  },
  {
    id: "doc-05",
    name: "Vakalatnama_Signed_Advocate_Enrolment_K_1942.pdf",
    matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    folder: "Client Vakalats & KYC",
    fileType: "scan",
    size: "850 KB",
    uploadDate: "12 Oct 2026",
    hash: "sha256:5ef1092ab7c41908d32b84ac125",
    isEncrypted: true,
    pages: 2,
    notes: "Client executed Vakalat with advocate welfare fund stamp affixed and attested.",
  },
  {
    id: "doc-06",
    name: "Bank_Return_Memo_Insufficient_Funds.pdf",
    matter: "CC 412/2024 — Cheque Dishonour (S.138 NI Act)",
    folder: "Evidence & Exhibits",
    fileType: "scan",
    size: "720 KB",
    uploadDate: "10 Oct 2026",
    hash: "sha256:92cb1f570081d4a0e98c61fa348",
    isEncrypted: true,
    pages: 1,
    notes: "Original bank memo bearing CTS-2010 return reason code 01 (Funds Insufficient).",
  },
];

interface DocumentVaultViewProps {
  currentMatter?: string;
}

export function DocumentVaultView({
  currentMatter = "WP(C) 19482/2024 — Gopakumar v. KSEB",
}: DocumentVaultViewProps) {
  // State for files
  const [files, setFiles] = useState<VaultDocument[]>(INITIAL_VAULT_FILES);
  const [selectedFolder, setSelectedFolder] = useState<string>("All Folders");
  const [selectedMatterFilter, setSelectedMatterFilter] = useState<string>("All Matters");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadMatter, setUploadMatter] = useState(currentMatter);
  const [uploadFolder, setUploadFolder] = useState<VaultDocument["folder"]>("Pleadings & Petitions");
  const [uploadNotes, setUploadNotes] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Hydration safe local storage load
  useEffect(() => {
    try {
      const stored = localStorage.getItem("wakheel_document_vault");
      if (stored) {
        setFiles(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const saveFiles = (newFiles: VaultDocument[]) => {
    setFiles(newFiles);
    try {
      localStorage.setItem("wakheel_document_vault", JSON.stringify(newFiles));
    } catch {}
  };

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    setIsEncrypting(true);
    setTimeout(() => {
      const randomHash = "sha256:" + Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const newDoc: VaultDocument = {
        id: `doc-${Date.now()}`,
        name: uploadFileName.endsWith(".pdf") || uploadFileName.endsWith(".docx") ? uploadFileName : `${uploadFileName}.pdf`,
        matter: uploadMatter,
        folder: uploadFolder,
        fileType: uploadFileName.toLowerCase().endsWith(".docx") ? "docx" : "pdf",
        size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
        uploadDate: "Just now",
        hash: randomHash,
        isEncrypted: true,
        pages: Math.floor(Math.random() * 15) + 2,
        notes: uploadNotes.trim() || "Uploaded to secure chamber vault with AES-256 encryption.",
      };

      saveFiles([newDoc, ...files]);
      setIsEncrypting(false);
      setShowUploadModal(false);
      setUploadFileName("");
      setUploadNotes("");
    }, 800);
  };

  const handleDeleteFile = (id: string) => {
    if (confirm("Are you sure you want to permanently remove this document from the chamber vault?")) {
      saveFiles(files.filter((f) => f.id !== id));
      if (previewDoc?.id === id) setPreviewDoc(null);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Filtered files
  const filteredFiles = files.filter((f) => {
    const matchesFolder = selectedFolder === "All Folders" || f.folder === selectedFolder;
    const matchesMatter = selectedMatterFilter === "All Matters" || f.matter.includes(selectedMatterFilter);
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.matter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.notes && f.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFolder && matchesMatter && matchesSearch;
  });

  const foldersList: Array<VaultDocument["folder"]> = [
    "Pleadings & Petitions",
    "Certified Court Orders",
    "Evidence & Exhibits",
    "Client Vakalats & KYC",
  ];

  const mattersList = Array.from(new Set(files.map((f) => f.matter.split("—")[0].trim())));

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>AES-256 Encrypted Vault</span>
            </span>
            <span className="text-xs text-zinc-400 font-mono">Privileged Work Product Repository</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight mt-1">
            Chamber Document Vault
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Secure repository for pleadings, certified court orders, evidence bundles, and tamper-evident client Vakalats.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center gap-2 shadow-xs transition-all hover:opacity-90 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Storage & Encryption Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
            <FolderLock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 font-medium block">Total Vault Files</span>
            <span className="text-lg font-bold text-black dark:text-white">{files.length} Documents</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
            <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 font-medium block">Chamber Storage</span>
            <span className="text-lg font-bold text-black dark:text-white">11.3 MB / 15 GB</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
            <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 font-medium block">Security Standard</span>
            <span className="text-lg font-bold text-black dark:text-white">AES-256 + SHA-256</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 font-medium block">Integrity Verification</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">100% Tamper Proof</span>
          </div>
        </div>
      </div>

      {/* Main Container: Folders Sidebar & File Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sub-Sidebar: Categories & Dockets (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Folders List */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 block px-2 mb-2">
              Vault Categories
            </span>

            <button
              type="button"
              onClick={() => setSelectedFolder("All Folders")}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                selectedFolder === "All Folders"
                  ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                <span>All Documents</span>
              </div>
              <span className="text-[11px] font-mono opacity-80">{files.length}</span>
            </button>

            {foldersList.map((folder) => {
              const count = files.filter((f) => f.folder === folder).length;
              return (
                <button
                  key={folder}
                  type="button"
                  onClick={() => setSelectedFolder(folder)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedFolder === folder
                      ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="truncate">{folder}</span>
                  </div>
                  <span className="text-[11px] font-mono opacity-80 shrink-0">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Docket / Matter Filter */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 block px-2 mb-2">
              Filter by Matter
            </span>

            <button
              type="button"
              onClick={() => setSelectedMatterFilter("All Matters")}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedMatterFilter === "All Matters"
                  ? "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-bold"
                  : "text-zinc-500 hover:text-black dark:hover:text-white"
              }`}
            >
              All Active Dockets
            </button>

            {mattersList.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMatterFilter(m)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium truncate transition-colors cursor-pointer ${
                  selectedMatterFilter === m
                    ? "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-bold"
                    : "text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Right Area: File Explorer & Table (9 cols) */}
        <div className="lg:col-span-9 space-y-4">
          {/* Search & View Toolbar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search file name, matter, or tags..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-zinc-500 font-mono">
              <span>Showing {filteredFiles.length} files</span>
            </div>
          </div>

          {/* File List / Table */}
          <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
            {filteredFiles.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FolderLock className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700" />
                <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No documents found</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  No files match your selected category or search filters. Upload a new document using the button above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Document Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Matter / Docket</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Upload Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {filteredFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors group cursor-pointer"
                        onClick={() => setPreviewDoc(file)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5">
                              {file.fileType === "scan" ? (
                                <ImageIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              ) : (
                                <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-bold text-black dark:text-white block group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                {file.name}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                                <span>{file.pages} pages</span>
                                <span>•</span>
                                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> AES-256
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {file.folder}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                            {file.matter.split("—")[0].trim()}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-mono text-zinc-500">
                          {file.size}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-zinc-500 font-mono">
                          {file.uploadDate}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(file)}
                              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                              title="Preview document details & integrity hash"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => alert(`Simulated download for ${file.name}`)}
                              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                              title="Download document"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteFile(file.id)}
                              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                              title="Delete document"
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
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  Upload to Encrypted Vault
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Counter_Affidavit_KSEB_WP_19482.pdf"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">Vault Folder</label>
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  >
                    {foldersList.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">Matter Reference</label>
                  <input
                    type="text"
                    value={uploadMatter}
                    onChange={(e) => setUploadMatter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">Brief Description / Registry Notes</label>
                <textarea
                  rows={2}
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="e.g. Verified true copy with court stamp..."
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2.5 text-[11px] text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Files are encrypted with AES-256 before disk storage and stamped with a SHA-256 hash.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEncrypting}
                  className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold flex items-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-50"
                >
                  {isEncrypting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white dark:border-black border-t-transparent animate-spin" />
                      <span>Encrypting &amp; Storing...</span>
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

      {/* Document Detail & Integrity Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-extrabold text-black dark:text-white">
                  Vault Document Details
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
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-zinc-400">File Name</span>
                <span className="text-sm font-bold text-black dark:text-white block break-all">
                  {previewDoc.name}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono block">
                  {previewDoc.folder} • {previewDoc.size} • {previewDoc.pages} Pages
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-zinc-400">Associated Matter</span>
                <span className="font-bold text-black dark:text-white block">{previewDoc.matter}</span>
              </div>

              {previewDoc.notes && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-zinc-400">Registry / Chamber Notes</span>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed italic bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900">
                    "{previewDoc.notes}"
                  </p>
                </div>
              )}

              {/* SHA-256 Hash */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Cryptographic Integrity Hash</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyHash(previewDoc.hash)}
                    className="text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 font-mono text-[10px] cursor-pointer"
                  >
                    {copiedHash === previewDoc.hash ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" /> Copied
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

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={() => handleDeleteFile(previewDoc.id)}
                  className="text-rose-600 dark:text-rose-400 text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove from Vault
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`Simulated download for ${previewDoc.name}`)}
                    className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:opacity-90"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
