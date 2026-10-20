"use client";

import React, { useState, useRef } from "react";
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
} from "lucide-react";

export interface SubmittedFiling {
  id: string;
  fileName: string;
  category: string;
  matter: string;
  size: string;
  date: string;
  status: "Transmitted to Advocate" | "Under Counsel Review" | "Accepted for Drafting";
  advocateName: string;
}

const DEFAULT_FILINGS: SubmittedFiling[] = [
  {
    id: "filing-01",
    fileName: "Survey_Sketch_Re-survey_Plan_Block_14.pdf",
    category: "Survey Sketch / Site Map",
    matter: "WP(C) 19482/2024 — Gopakumar Nambiar v. KSEB",
    size: "2.4 MB",
    date: "Today, 11:15 AM",
    status: "Transmitted to Advocate",
    advocateName: "Adv. Meera Krishnan",
  },
  {
    id: "filing-02",
    fileName: "Counter_Affidavit_Objections_Rejoinder.docx",
    category: "Pleading Draft / Affidavit Counter",
    matter: "WP(C) 19482/2024 — Gopakumar Nambiar v. KSEB",
    size: "1.1 MB",
    date: "18 Oct 2024",
    status: "Under Counsel Review",
    advocateName: "Adv. Meera Krishnan",
  },
  {
    id: "filing-03",
    fileName: "Bank_Memo_Original_Debit_Advice.pdf",
    category: "Bank Statement / Financial Records",
    matter: "ARB/NCLT/KOCHI/2024/041 — Malabar Infotech",
    size: "820 KB",
    date: "14 Oct 2024",
    status: "Accepted for Drafting",
    advocateName: "Adv. Meera Krishnan",
  },
];

const MATTERS_LIST = [
  "WP(C) 19482/2024 — Gopakumar Nambiar v. KSEB",
  "ARB/NCLT/KOCHI/2024/041 — Malabar Infotech Solutions v. Coastal Logistics Services Ltd",
  "OS 412/2023 — Gopakumar v. Varghese Builders & Developers",
];

const CATEGORIES_LIST = [
  "Survey Sketch / Site Map",
  "Pleading Draft / Affidavit Counter",
  "Bank Statement / Financial Records",
  "Registered Deed / Title Document",
  "Government Order / Revenue Notice",
  "Witness Statement / Deposition",
  "Other Evidence Document",
];

export function DocumentFilingView() {
  const [selectedMatter, setSelectedMatter] = useState(MATTERS_LIST[0]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES_LIST[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filingRemarks, setFilingRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [submittedHistory, setSubmittedHistory] = useState<SubmittedFiling[]>(DEFAULT_FILINGS);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const fileName = selectedFile
        ? selectedFile.name
        : `${selectedCategory.replace(/[\s/]/g, "_")}_Evidence.pdf`;
      const fileSize = selectedFile
        ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
        : "1.8 MB";

      const newFiling: SubmittedFiling = {
        id: `filing-${Date.now()}`,
        fileName,
        category: selectedCategory,
        matter: selectedMatter,
        size: fileSize,
        date: "Just now",
        status: "Transmitted to Advocate",
        advocateName: "Adv. Meera Krishnan",
      };

      setSubmittedHistory([newFiling, ...submittedHistory]);
      setIsSubmitting(false);
      setShowSuccessBanner(true);
      setSelectedFile(null);
      setFilingRemarks("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 800);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle matching user screenshot */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
          Document Submission for Advocate Review
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500">
          Submit evidence and counter-arguments to your assigned legal counsel
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
              Document securely transmitted to Adv. Meera Krishnan for review!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessBanner(false)}
            className="text-zinc-400 hover:text-black dark:hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Submission Form Card (Matching exact screenshot fields & our color palette) */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-6 sm:p-8 space-y-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
          {/* Field 1: Select Matter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
              Select Matter
            </label>
            <select
              value={selectedMatter}
              onChange={(e) => setSelectedMatter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
            >
              {MATTERS_LIST.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Field 2: Document Category */}
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

          {/* Field 3: Drag & Drop File Upload Box (Matching exact screenshot layout) */}
          <div className="space-y-1.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center space-y-2.5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-black dark:text-white group-hover:scale-105 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>

              {selectedFile ? (
                <div className="space-y-1 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <File className="w-4 h-4 text-black dark:text-white" />
                    <span className="font-bold text-black dark:text-white text-xs sm:text-sm">
                      {selectedFile.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 block">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for Transmission
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-xs text-zinc-500 hover:text-black dark:hover:text-white underline mt-1"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-xs sm:text-sm font-bold text-black dark:text-white block">
                    <span className="underline">Click to select files</span> or drag and drop
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono block">
                    PDF, DOCX, JPG, PNG up to 25 MB
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Field 4: Optional Remarks / Instructions for Advocate */}
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

          {/* Submit Button (Strictly in our current design & color palette) */}
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
    </div>
  );
}
