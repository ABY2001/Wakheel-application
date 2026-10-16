"use client";

import React, { useState } from "react";
import {
  Shield,
  FileText,
  Building2,
  Cpu,
  UserCheck,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  X,
  ArrowRight,
} from "lucide-react";

export function ElectronicConsentView() {
  const [consentStatus, setConsentStatus] = useState<"pending" | "completed">("pending");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const clauses = [
    {
      num: "01",
      icon: Shield,
      title: "Certificate Verification",
      text: "I authorize the company and its authorized verification partners to verify certificates, qualifications, and other documents submitted by me during the recruitment/onboarding process.",
    },
    {
      num: "02",
      icon: FileText,
      title: "Document Verification",
      text: "I understand that the company may review documents submitted by me to verify their authenticity and consistency with the information provided during the recruitment process.",
    },
    {
      num: "03",
      icon: Building2,
      title: "Company Policies",
      text: "I acknowledge that I have read and agree to comply with the applicable company policies and procedures communicated to me.",
    },
    {
      num: "04",
      icon: Cpu,
      title: "Information Processing",
      text: "I understand that my submitted information and documents may be processed by authorized personnel for recruitment, verification, and onboarding purposes.",
    },
    {
      num: "05",
      icon: UserCheck,
      title: "Candidate Acknowledgement",
      text: "I confirm that the information and documents submitted by me are accurate to the best of my knowledge.",
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setConsentStatus("completed");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      setConsentStatus("completed");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      
      {/* =========================================================================
          TOP BANNER: Electronic Consent & Authorization Header
      ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono font-bold uppercase tracking-wider text-black dark:text-white">
              E-SIGN
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              Candidate Authorization Suite
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white tracking-tight">
            Electronic Consent &amp; Authorization
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Provide your consent to allow LetGetIn and the authorized company to verify your submitted certificates and process your information according to applicable company policies.
          </p>
        </div>

        {/* Right Status Pill */}
        <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
          <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider">
            CONSENT STATUS
          </span>
          {consentStatus === "pending" ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-black dark:text-white shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Pending Consent</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white text-xs font-semibold shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Consent Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MIDDLE CARD: Consent & Authorization Terms (5 Clauses)
      ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-black dark:text-white">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-black dark:text-white">
                Consent &amp; Authorization Terms
              </h2>
              <p className="text-xs text-zinc-500">
                Please carefully review the verification guidelines and authorizations below.
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-bold text-black dark:text-white">
            5 Clauses
          </span>
        </div>

        {/* 2-Column Grid of Clauses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clauses.map((clause) => {
            const Icon = clause.icon;
            return (
              <div
                key={clause.num}
                className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-black dark:text-white group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 font-bold">
                    {clause.num}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-black dark:text-white">
                    {clause.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    &ldquo;{clause.text}&rdquo;
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          BOTTOM CARD: Upload Consent Form
      ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-black dark:text-white" />
            <div>
              <h3 className="text-sm font-bold text-black dark:text-white">
                Upload Consent Form
              </h3>
              <p className="text-xs text-zinc-500">
                Attach your signed or filled PDF consent document.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono font-bold text-zinc-600 dark:text-zinc-400">
            PDF only • Max 10 MB
          </span>
        </div>

        {/* Drag and Drop Zone */}
        {!uploadedFile ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-black dark:border-white bg-zinc-100 dark:bg-zinc-900"
                : "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 hover:border-black dark:hover:border-white"
            }`}
          >
            <input
              type="file"
              id="consent-file-upload"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="consent-file-upload" className="cursor-pointer space-y-3 block">
              <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mx-auto shadow-xs">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-black dark:text-white">
                  Click to upload or drag &amp; drop
                </p>
                <p className="text-xs text-zinc-500">
                  Signed e-Authorization or Bar Council declaration form (PDF up to 10MB)
                </p>
              </div>
            </label>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-black dark:text-white">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Attached &amp; Digitally Logged
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-xs font-bold rounded-full">
                Ready to Submit
              </span>
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setConsentStatus("pending");
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
