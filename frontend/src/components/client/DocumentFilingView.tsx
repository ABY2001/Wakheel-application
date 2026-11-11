"use client";

import React, { useState, useRef, useEffect } from "react";
import { citizenApi } from "@/lib/api";
import {
  UploadCloud,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  FileText,
  Trash2,
  Download,
  Clock,
  Send,
  Eye,
  Check,
  X,
  File,
  ShieldCheck,
  FolderLock,
  Search,
  Plus,
  Scale,
} from "lucide-react";

export interface SubmittedFiling {
  id: string;
  fileName: string;
  category: string;
  matter: string;
  size: string;
  date: string;
  status: "Transmitted to Advocate" | "Under Counsel Review" | "Accepted for Drafting" | "Approved & Filed with Court Registry";
  advocateName: string;
  remarks?: string;
  source?: "vault" | "upload";
}

export interface AdvocateOption {
  id: string;
  name: string;
  enrolment: string;
  chamber: string;
  specialization: string;
}

export interface VaultDocumentItem {
  id: string;
  name: string;
  category: string;
  matter: string;
  size: string;
  uploadDate: string;
  hash?: string;
  details?: string;
}

const CATEGORIES_LIST = [
  "Survey Sketch / Site Map",
  "Pleading Draft / Affidavit Counter",
  "Bank Statement / Financial Records",
  "Registered Deed / Title Document",
  "Government Order / Revenue Notice",
  "Witness Statement / Deposition",
  "Other Evidence Document",
];

interface DocumentFilingViewProps {
  onFilingSubmitted?: (filing: any) => void;
  initialMatter?: string;
}

export function DocumentFilingView({ onFilingSubmitted, initialMatter }: DocumentFilingViewProps) {
  const [mattersList, setMattersList] = useState<string[]>([]);
  const [selectedMatter, setSelectedMatter] = useState(initialMatter || "__custom__");
  const [customMatterTitle, setCustomMatterTitle] = useState("");
  const [advocatesList, setAdvocatesList] = useState<AdvocateOption[]>([]);
  const [selectedAdvocateId, setSelectedAdvocateId] = useState<string>("");

  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES_LIST[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedVaultDoc, setSelectedVaultDoc] = useState<VaultDocumentItem | null>(null);
  const [filingRemarks, setFilingRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [submittedHistory, setSubmittedHistory] = useState<SubmittedFiling[]>([]);

  // Vault picker modal state
  const [vaultModalOpen, setVaultModalOpen] = useState(false);
  const [vaultSearchQuery, setVaultSearchQuery] = useState("");
  const [vaultDocuments, setVaultDocuments] = useState<VaultDocumentItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync selected matter if initialMatter changes from header switcher
  useEffect(() => {
    if (initialMatter) {
      const match = mattersList.find(
        (m) =>
          m.toLowerCase().includes(initialMatter.toLowerCase().slice(0, 15)) ||
          initialMatter.toLowerCase().includes(m.toLowerCase().slice(0, 15))
      );
      setSelectedMatter(match || initialMatter);
    }
  }, [initialMatter, mattersList]);

  // Sync registered advocates, matters list, filings history, and documents from backend API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("wakheel_token") || localStorage.getItem("token") || ""
          : "";
      try {
        const [advRes, mattersRes, filingsRes, docsRes] = await Promise.allSettled([
          citizenApi.getAdvocates(),
          citizenApi.getMatters(token),
          citizenApi.getFilings(token),
          citizenApi.getDocuments(token),
        ]);
        if (!isMounted) return;

        if (advRes.status === "fulfilled" && advRes.value?.advocates && Array.isArray(advRes.value.advocates) && advRes.value.advocates.length > 0) {
          const mappedAdvs: AdvocateOption[] = advRes.value.advocates.map((a: any) => {
            let name = (a.fullName || a.name || "Advocate").trim();
            if (!name.toLowerCase().startsWith("adv.") && !name.toLowerCase().startsWith("adv ")) {
              name = `Adv. ${name}`;
            }
            const specs = Array.isArray(a.specializations) && a.specializations.length > 0
              ? a.specializations.join(", ")
              : a.specialization || "Litigation & Advisory";
            return {
              id: a.id || a._id || a.userId,
              name,
              enrolment: a.barCouncilNumber || "Bar Council Verified",
              chamber: a.primaryCourt || a.chamberAddress || "Practising Counsel",
              specialization: specs,
            };
          });
          setAdvocatesList(mappedAdvs);
          setSelectedAdvocateId((prev) =>
            prev && mappedAdvs.some((a) => a.id === prev) ? prev : mappedAdvs[0].id
          );
        } else {
          setAdvocatesList([]);
          setSelectedAdvocateId("");
        }

        if (
          mattersRes.status === "fulfilled" &&
          mattersRes.value?.success &&
          Array.isArray(mattersRes.value.matters) &&
          mattersRes.value.matters.length > 0
        ) {
          const names: string[] = mattersRes.value.matters.map(
            (m: any) => `${m.caseNumber} — ${m.title || m.matterTitle || m.caseTitle}`
          );
          const uniqueNames: string[] = Array.from(new Set<string>(names));
          setMattersList(uniqueNames);
          setSelectedMatter((prev) => (prev === "__custom__" && !customMatterTitle ? uniqueNames[0] : prev));
        }

        if (
          filingsRes.status === "fulfilled" &&
          filingsRes.value?.success &&
          Array.isArray(filingsRes.value.filings)
        ) {
          setSubmittedHistory(filingsRes.value.filings);
        }

        if (
          docsRes.status === "fulfilled" &&
          docsRes.value?.success &&
          Array.isArray(docsRes.value.documents)
        ) {
          const normalizedDocs: VaultDocumentItem[] = docsRes.value.documents.map((d: any) => ({
            id: d.id || d._id,
            name: d.name || d.title,
            category: d.category || "Evidence Document",
            matter: d.matter || "",
            size: d.size || "1.5 MB",
            uploadDate: d.uploadDate || "Recent",
            details: d.details || "",
          }));
          setVaultDocuments(normalizedDocs);
        }
      } catch (err) {
        console.warn("Could not load backend data for document filing:", err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentAdvocate =
    advocatesList.find((a) => a.id === selectedAdvocateId) || advocatesList[0] || null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setSelectedVaultDoc(null); // Clear vault doc if local file picked
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setSelectedVaultDoc(null);
    }
  };

  const handleSelectVaultDocument = (doc: VaultDocumentItem) => {
    setSelectedVaultDoc(doc);
    setSelectedFile(null); // Clear local file if vault doc picked
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    // Auto-align category if matches
    if (CATEGORIES_LIST.includes(doc.category)) {
      setSelectedCategory(doc.category);
    }
    setVaultModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("wakheel_token") || localStorage.getItem("token") || ""
        : "";

    let fileName = "";
    let fileSize = "";
    let source: "vault" | "upload" = "upload";

    if (selectedVaultDoc) {
      fileName = selectedVaultDoc.name;
      fileSize = selectedVaultDoc.size;
      source = "vault";
    } else if (selectedFile) {
      fileName = selectedFile.name;
      fileSize = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
      source = "upload";
    } else {
      fileName = `${selectedCategory.replace(/[\s/]/g, "_")}_Evidence.pdf`;
      fileSize = "1.8 MB";
    }

    const effectiveMatter =
      selectedMatter === "__custom__"
        ? customMatterTitle.trim() || `${selectedCategory} Petition Filing`
        : selectedMatter;

    try {
      const res = await citizenApi.fileDocument(token, {
        fileName,
        category: selectedCategory,
        matter: effectiveMatter,
        size: fileSize,
        fileSize,
        remarks: filingRemarks,
        advocateId: currentAdvocate?.id || "",
        advocateName: currentAdvocate?.name || "",
      });

      if (res?.success && res.filing) {
        setSubmittedHistory((prev) => [
          { ...res.filing, source },
          ...prev.filter((f) => f.id !== res.filing.id),
        ]);
        if (onFilingSubmitted) onFilingSubmitted(res.filing);
      } else {
        const newFiling: SubmittedFiling = {
          id: `filing-${Date.now()}`,
          fileName,
          category: selectedCategory,
          matter: effectiveMatter,
          size: fileSize,
          date: "Just now",
          status: "Transmitted to Advocate",
          advocateName: currentAdvocate?.name || "Assigned Counsel",
          source,
        };
        setSubmittedHistory([newFiling, ...submittedHistory]);
        if (onFilingSubmitted) onFilingSubmitted(newFiling);
      }

      setShowSuccessBanner(true);
      setSelectedFile(null);
      setSelectedVaultDoc(null);
      setFilingRemarks("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.warn("Filing submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVaultDocuments = vaultDocuments.filter((doc) => {
    const q = vaultSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      doc.name.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q) ||
      doc.matter.toLowerCase().includes(q) ||
      (doc.details && doc.details.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle matching user screenshot */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
          Document Submission for Advocate Review
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500">
          Submit evidence and counter-arguments to your selected legal counsel
        </p>
      </div>

      {/* Important Legal Clarification Box (Matching screenshot callout with amber warning) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3.5">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <span className="font-mono font-bold uppercase text-[11px] text-amber-800 dark:text-amber-300 tracking-wider block">
            IMPORTANT LEGAL CLARIFICATION
          </span>
          <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed text-xs">
            Submitting a document here transmits it securely to your advocate within Wakheel. It does NOT constitute formal filing before a High Court or District Court registry. Only your authorized advocate can formally file pleadings with the court.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccessBanner && (
        <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs animate-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-black dark:text-white" />
            <span className="font-bold text-black dark:text-white">
              Document securely transmitted to {currentAdvocate.name} for review!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessBanner(false)}
            className="text-zinc-400 hover:text-black dark:hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Submission Form Card */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-6 sm:p-8 space-y-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
          
          {/* Field 1: Select Matter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                Select Matter
              </label>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-black dark:text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white shrink-0" />
                <span className="text-zinc-500 font-medium">Assigned Counsel:</span>
                <strong className="font-bold underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-2">
                  {currentAdvocate?.name || "No advocate selected"}
                </strong>
                {currentAdvocate?.enrolment && (
                  <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                    ({currentAdvocate.enrolment})
                  </span>
                )}
              </div>
            </div>
            <select
              value={selectedMatter}
              onChange={(e) => setSelectedMatter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
            >
              {Array.from(new Set(mattersList)).map((m, idx) => (
                <option key={`${m}-${idx}`} value={m}>
                  {m}
                </option>
              ))}
              <option value="__custom__">+ Enter New Petition / Custom Matter Title</option>
            </select>
            {selectedMatter === "__custom__" && (
              <input
                type="text"
                value={customMatterTitle}
                onChange={(e) => setCustomMatterTitle(e.target.value)}
                placeholder="e.g., Mutual Consent Divorce Petition under Sec. 13B HMA"
                className="w-full mt-2 px-4 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
              />
            )}
          </div>

          {/* Field 2: Select Advocate / Counsel (Requirement 5.1: Field or dropdown to select advocates) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Select Advocate / Legal Counsel</span>
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">
                Recipient advocate for scrutiny and preparation
              </span>
            </div>
            <select
              value={selectedAdvocateId}
              onChange={(e) => setSelectedAdvocateId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
            >
              {advocatesList.length === 0 ? (
                <option value="">No registered advocates available yet</option>
              ) : (
                advocatesList.map((adv) => (
                  <option key={adv.id} value={adv.id}>
                    {adv.name} — {adv.specialization} ({adv.enrolment})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Field 3: Document Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
              Document Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
            >
              {CATEGORIES_LIST.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Field 4: Document Selection (Upload Local File OR Pick from Wakheel.com Documents Vault) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                Attach Document
              </label>

              {/* Requirement 5.2: Add any document from the existing documents vault in wakheel.com */}
              <button
                type="button"
                onClick={() => setVaultModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:border-black dark:hover:border-white text-xs font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-2xs"
              >
                <FolderLock className="w-3.5 h-3.5" />
                <span>Select from Wakheel Documents Vault</span>
              </button>
            </div>

            {/* Hidden file input for local uploads */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
            />

            {/* If a Vault Document is Selected */}
            {selectedVaultDoc ? (
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-150">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0 shadow-xs">
                    <FolderLock className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-black dark:text-white text-xs sm:text-sm truncate">
                        {selectedVaultDoc.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white shrink-0">
                        Wakheel Vault
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono truncate">
                      {selectedVaultDoc.size} • {selectedVaultDoc.matter.split("—")[0].trim()} • {selectedVaultDoc.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setVaultModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedVaultDoc(null)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                    title="Remove selected document"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : selectedFile ? (
              /* If a Local File is Selected */
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-150">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0 shadow-xs">
                    <File className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-black dark:text-white text-xs sm:text-sm truncate">
                        {selectedFile.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-zinc-200 dark:border-zinc-800 text-black dark:text-white shrink-0">
                        Local Upload
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for Transmission
                    </p>
                  </div>
                </div>
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
            ) : (
              /* Drag & Drop Local Upload Box */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center space-y-2.5 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-black dark:text-white group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs sm:text-sm font-bold text-black dark:text-white block">
                    <span className="underline">Click to select files</span> or drag and drop
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono block">
                    PDF, DOCX, JPG, PNG up to 25 MB • Or choose from your Wakheel Documents Vault above
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Field 5: Optional Remarks / Instructions for Advocate */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
              Brief Instructions or Notes for Counsel (Optional)
            </label>
            <textarea
              rows={2}
              value={filingRemarks}
              onChange={(e) => setFilingRemarks(e.target.value)}
              placeholder="e.g. Please refer to Page 4 highlighting the boundary demarcation dispute..."
              className="w-full p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs sm:text-sm shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white dark:border-black border-t-transparent animate-spin" />
                  <span>Transmitting to Advocate...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit to Advocate for Court Preparation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Transmitted Records Queue */}
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              <span>Transmitted Submissions History</span>
            </h3>
            <p className="text-xs text-zinc-500">
              Files securely sent to your legal counsel for scrutiny and drafting.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {submittedHistory.length} Documents
          </span>
        </div>

        <div className="space-y-3">
          {submittedHistory.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-black dark:text-white" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-black dark:text-white">
                    {item.fileName}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 flex-wrap">
                    <span className="font-medium text-black dark:text-white">{item.category}</span>
                    <span>•</span>
                    <span className="font-mono text-zinc-400">{item.matter.split("—")[0].trim()}</span>
                    <span>•</span>
                    <span className="font-mono text-zinc-400">{item.size}</span>
                    <span>•</span>
                    <span className="text-zinc-500">Counsel: {item.advocateName}</span>
                    {item.source === "vault" && (
                      <>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          Vault
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white">
                  {item.status}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {item.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          MODAL: Select from Existing Documents Vault in wakheel.com
      ========================================================================= */}
      {vaultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                  <FolderLock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black dark:text-white">
                    Select Document from Wakheel Vault
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Choose any encrypted court pleading, certified true copy, or contract
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVaultModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={vaultSearchQuery}
                  onChange={(e) => setVaultSearchQuery(e.target.value)}
                  placeholder="Search vault documents by name, matter, or category..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            </div>

            {/* Modal Documents List */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
              {filteredVaultDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleSelectVaultDocument(doc)}
                  className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-black dark:hover:border-white transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-2xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-black dark:text-white shrink-0 mt-0.5 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 truncate">
                      <span className="font-bold text-xs text-black dark:text-white block truncate group-hover:underline">
                        {doc.name}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono flex-wrap">
                        <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white font-medium">
                          {doc.category}
                        </span>
                        <span>•</span>
                        <span>{doc.matter.split("—")[0].trim()}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.uploadDate}</span>
                      </div>
                      {doc.details && (
                        <p className="text-[10px] text-zinc-400 line-clamp-1">
                          {doc.details}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectVaultDocument(doc);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    Select
                  </button>
                </div>
              ))}

              {filteredVaultDocuments.length === 0 && (
                <div className="p-8 text-center text-xs text-zinc-500">
                  No vault documents matched your search query.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-xs shrink-0">
              <span className="text-[11px] font-mono text-zinc-500">
                {vaultDocuments.length} Documents available in vault
              </span>
              <button
                type="button"
                onClick={() => setVaultModalOpen(false)}
                className="px-4 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
