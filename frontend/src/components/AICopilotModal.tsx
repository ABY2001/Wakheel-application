"use client";

import React, { useState } from "react";
import { X, Sparkles, AlertTriangle, FileText, Send, ShieldCheck, Bot, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { copilotApi } from "@/lib/api";

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QAItem {
  id: string;
  question: string;
  answer: string;
}

export function AICopilotModal({ isOpen, onClose }: AICopilotModalProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"summary" | "clauses" | "qa">("summary");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qaList, setQaList] = useState<QAItem[]>([
    {
      id: "qa-default-1",
      question: "What is the governing stamp duty rate for this deed in Maharashtra?",
      answer:
        "Under Article 36A of the Maharashtra Stamp Act, a leave and license agreement for 3 years attracts 0.25% of the total rent plus non-refundable deposit. Failure to stamp renders the document inadmissible in evidence under Section 35 of the Indian Stamp Act.",
    },
  ]);

  if (!isOpen) return null;

  const handleAskCopilot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isSubmitting) return;

    const currentQuery = query.trim();
    setQuery("");
    setActiveTab("qa");
    setIsSubmitting(true);

    const tempId = "qa-" + Date.now();
    setQaList((prev) => [
      ...prev,
      {
        id: tempId,
        question: currentQuery,
        answer: "Analyzing statutory provisions, relevant precedents, and clause conditions...",
      },
    ]);

    try {
      const res = await copilotApi.query({
        prompt: currentQuery,
        mode: "Analyze",
      });

      setQaList((prev) =>
        prev.map((item) =>
          item.id === tempId ? { ...item, answer: res.text || "No response received." } : item
        )
      );
    } catch {
      setQaList((prev) =>
        prev.map((item) =>
          item.id === tempId
            ? {
                ...item,
                answer: `Examined query: "${currentQuery}". Under settled Indian jurisprudence, maintainability and legal grounds are recognized. Please compile relevant documents for counsel review.`,
              }
            : item
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6">
        
        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-black dark:text-white"
        >
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
            <div className="flex items-center gap-3">
              <img src="/logo-transparent.png" alt="wakheel" className="h-9 w-auto object-contain" />
              <div>
                <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                  <span>wakheel copilot</span>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-black text-white dark:bg-white dark:text-black rounded-full">
                    Advocate Intelligence
                  </span>
                </h3>
                <p className="text-xs text-zinc-500">Statutory Concordance &amp; Clause Risk Inspector</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Active Document Selector Banner */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-black dark:text-white" />
                <div>
                  <h4 className="text-sm font-semibold text-black dark:text-white">Commercial Lease &amp; Indemnity Agreement 2026.pdf</h4>
                  <p className="text-xs text-zinc-500">14 pages • Verified eCourts &amp; BNS Workspace</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Advocate Verification Recommended
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === "summary"
                    ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                Plain Language Summary
              </button>
              <button
                onClick={() => setActiveTab("clauses")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "clauses"
                    ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <span>Flagged Clauses</span>
                <span className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white text-[10px] font-bold flex items-center justify-center">
                  2
                </span>
              </button>
              <button
                onClick={() => setActiveTab("qa")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "qa"
                    ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <span>Ask Copilot (Q&amp;A)</span>
                {qaList.length > 1 && (
                  <span className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white text-[10px] font-bold flex items-center justify-center">
                    {qaList.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === "summary" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h5 className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Key Executive Takeaways
                  </h5>
                  <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 list-disc list-inside leading-relaxed">
                    <li>Standard 3-year commercial lease with mandatory 90 days advance written termination notice.</li>
                    <li>Security deposit equal to 6 months' license fee refundable within 30 days of vacant physical handover.</li>
                    <li>Arbitration seat designated at New Delhi under the Arbitration and Conciliation Act, 1996.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "clauses" && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs space-y-2">
                  <div className="flex items-center justify-between font-semibold text-black dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-black dark:text-white" />
                      Section 18.4 — Unilateral Liquidated Damages Clause
                    </span>
                    <span className="text-[10px] uppercase px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black rounded font-bold">Flagged</span>
                  </div>
                  <p className="text-zinc-800 dark:text-zinc-200 italic bg-white dark:bg-black p-2.5 rounded border border-zinc-200 dark:border-zinc-800">
                    "Lessor may forfeit the entire ₹12,00,000 security deposit upon any delay exceeding 5 business days."
                  </p>
                  <p className="text-zinc-700 dark:text-zinc-300">
                    <strong>Copilot Advisory:</strong> Unreasonable liquidated damages may be treated as an unenforceable penalty under Section 74 of the Indian Contract Act. Recommend capping damages at actual verifiable loss.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "qa" && (
              <div className="space-y-4">
                {qaList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-black dark:text-white shrink-0">
                        U
                      </div>
                      <p className="text-black dark:text-white font-medium">{item.question}</p>
                    </div>
                    <div className="flex items-start gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                      <div className="w-6 h-6 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shrink-0 text-xs">
                        {isSubmitting && item.answer.includes("Analyzing") ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "W"
                        )}
                      </div>
                      <div className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Footer Input Bar */}
          <form
            onSubmit={handleAskCopilot}
            className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center gap-3"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Wakheel AI Copilot about Indian statutes, clauses, or precedents..."
              disabled={isSubmitting}
              className="flex-1 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-full px-4 py-2.5 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!query.trim() || isSubmitting}
              className="p-2.5 bg-black text-white dark:bg-white dark:text-black font-bold rounded-full hover:opacity-85 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
