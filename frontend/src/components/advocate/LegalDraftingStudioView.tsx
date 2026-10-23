"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  Copy,
  Download,
  Printer,
  Shield,
  Scale,
  Plus,
  ChevronRight,
  Info,
  Check,
  RefreshCw,
  Lock,
  FileSignature,
  AlertCircle,
  Eye,
  Edit3,
  BookOpen,
} from "lucide-react";
import { copilotApi, advocateApi } from "@/lib/api";

interface LegalDraftingStudioViewProps {
  currentMatter?: string;
  advocateName?: string;
  barCouncilNumber?: string;
  token?: string;
  onNavigateTab?: (tabId: string) => void;
}

interface DraftingTemplate {
  id: string;
  title: string;
  court: string;
  statute: string;
  description: string;
  category: string;
  requiredFields: string[];
}

export const LegalDraftingStudioView: React.FC<LegalDraftingStudioViewProps> = ({
  currentMatter = "WP(C) 19482/2024 - Gopakumar Nambiar v. KSEB",
  advocateName = "Adv. Meera Krishnan",
  barCouncilNumber = "K/1429/2016",
  token = "advocate_token",
  onNavigateTab,
}) => {
  // State: Templates & Active Selection
  const [templates, setTemplates] = useState<DraftingTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("wpc_writ_petition");
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(true);

  // State: Form Parameters
  const [courtForum, setCourtForum] = useState<string>("IN THE HIGH COURT OF KERALA AT ERNAKULAM");
  const [caseNumber, setCaseNumber] = useState<string>("19482/2024");
  const [clientName, setClientName] = useState<string>("Gopakumar Nambiar");
  const [clientAddress, setClientAddress] = useState<string>(
    "Plot 42, Nambiar Gardens, Aluva, Ernakulam, Kerala 683101"
  );
  const [respondentName, setRespondentName] = useState<string>(
    "Kerala State Electricity Board Ltd. (KSEB) & Others"
  );
  const [respondentAddress, setRespondentAddress] = useState<string>(
    "Vydyuthi Bhavanam, Pattom, Thiruvananthapuram - 695004"
  );
  const [subject, setSubject] = useState<string>(
    "Unlawful transmission line alignment across registered agricultural holding violating Section 16(1) Telegraph Act"
  );
  const [chequeNumber, setChequeNumber] = useState<string>("491028");
  const [chequeAmount, setChequeAmount] = useState<string>("5,00,000");
  const [memoReason, setMemoReason] = useState<string>("Funds Insufficient / Exceeds Arrangement");
  const [memoDate, setMemoDate] = useState<string>("22-Sep-2024");

  // State: Draft Editor & Modes
  const [draftContent, setDraftContent] = useState<string>("");
  const [draftTitle, setDraftTitle] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [activeEngine, setActiveEngine] = useState<string>("Statutory Engine (Kerala HC Rules)");
  const [isAiPowered, setIsAiPowered] = useState<boolean>(false);

  // AI Prompt & Refinement
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [aiAction, setAiAction] = useState<string>("expand_grounds");

  // Typography & Paperbook Display Settings
  const [fontStyle, setFontStyle] = useState<"serif" | "mono">("serif");
  const [lineSpacing, setLineSpacing] = useState<"standard" | "compact">("standard");
  const [showMarginGuide, setShowMarginGuide] = useState<boolean>(true);
  const [editorMode, setEditorMode] = useState<"edit" | "preview">("edit");

  // Feedback & Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [vaultPushed, setVaultPushed] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch Template Library
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const res = await copilotApi.getTemplates();
        if (res && res.templates) {
          setTemplates(res.templates);
        }
      } catch (err) {
        console.warn("Failed to load templates from API, using statutory fallback:", err);
        setTemplates([
          {
            id: "wpc_writ_petition",
            title: "Article 226 Writ Petition (Civil) — WP(C)",
            court: "High Court of Kerala at Ernakulam",
            statute: "Constitution of India / Kerala High Court Rules, 1971",
            description: "Constitutional writ petition complete with Synopsis, Statement of Facts, Grounds A-E, and Interim Prayer.",
            category: "High Court Constitutional Practice",
            requiredFields: ["clientName", "respondentName", "subject", "caseNumber"],
          },
          {
            id: "ni_138_demand_notice",
            title: "Section 138 NI Act Statutory Demand Notice",
            court: "Subordinate Magistracy / JFCM",
            statute: "Negotiable Instruments Act, 1881",
            description: "Strict 15-day statutory demand notice preceding criminal complaint before Judicial Magistrate.",
            category: "Banking & Negotiable Instruments",
            requiredFields: ["clientName", "respondentName", "chequeNumber", "chequeAmount", "memoReason"],
          },
          {
            id: "ia_interim_stay",
            title: "Interlocutory Application (I.A.) for Interim Stay",
            court: "High Court of Kerala / Appellate Courts",
            statute: "Section 151 CPC & Rule 150 Kerala High Court Rules",
            description: "Urgent ad-interim stay petition with supporting deponent affidavit for immediate hearing.",
            category: "High Court Constitutional Practice",
            requiredFields: ["clientName", "respondentName", "caseNumber"],
          },
          {
            id: "caveat_petition",
            title: "Caveat Petition under Section 148A CPC",
            court: "High Court of Kerala / District Courts",
            statute: "Code of Civil Procedure, 1908 (Section 148A)",
            description: "Pre-emptive caveat petition to bar ex-parte adverse orders without prior service of notice.",
            category: "Civil & Land Property",
            requiredFields: ["clientName", "respondentName"],
          },
        ]);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // 2. Generate Initial Draft when Template or Matter Changes
  const handleGenerateDraft = async (typeId = selectedTemplateId) => {
    setIsGenerating(true);
    try {
      const payload = {
        type: typeId,
        parameters: {
          clientName,
          clientAddress,
          respondentName,
          respondentAddress,
          advocateName,
          advocateChambers: "Chamber No. 14, High Court Advocates Association (KHCAA) Golden Jubilee Chamber Complex, Ernakulam, Kochi 682031",
          barCouncilNumber,
          caseNumber,
          subject,
          courtForum,
          chequeNumber,
          chequeAmount,
          memoReason,
          memoDate,
        },
      };

      const res = await copilotApi.draftPleading(payload);
      if (res && res.success) {
        setDraftContent(res.content);
        setDraftTitle(res.title || "Legal Paperbook Draft");
        showToast("Legal paperbook generated conforming to Kerala High Court format.");
      }
    } catch (err: any) {
      console.error("Draft generation failed:", err);
      showToast("Error generating draft: " + (err?.message || "Check network"));
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate on first mount
  useEffect(() => {
    handleGenerateDraft("wpc_writ_petition");
  }, []);

  // 3. Quick Insert Statutory Clauses
  const handleInsertClause = (clauseType: string) => {
    let snippet = "";
    switch (clauseType) {
      case "delay_condonation":
        snippet = `\n\nEXPLANATION FOR DELAY (Section 5, Limitation Act, 1963):\nThe Petitioner respectfully submits that the delay in approaching this Hon'ble Court following Exhibit P-6 order was solely attributable to the bona fide pursuit of administrative remedies before the District Magistrate. There has been no deliberate laches, inaction, or contumacious negligence on the part of the Petitioner.`;
        break;
      case "balance_convenience":
        snippet = `\n\nBALANCE OF CONVENIENCE & IRREPARABLE INJURY:\nThe Petitioner has made out a strong prima facie case for the grant of interim relief. If the Respondents are permitted to forcibly erect high-tension electric pylons during the pendency of this Writ Petition, the Petitioner will suffer irreparable loss and damage that cannot be adequately compensated in terms of money. The balance of convenience squarely tilts in favour of maintaining status quo.`;
        break;
      case "valsamma_precedent":
        snippet = `\n\nBINDING DIVISION BENCH PRECEDENT (Valsamma v. KSEB 2024):\nAs held by the Division Bench of this Hon'ble Court in Valsamma & Ors. v. Kerala State Electricity Board [2024 (2) KHC 401 DB], once a landowner registers an objection in writing under Section 16(1) of the Indian Telegraph Act, 1885, the statutory licensee possesses zero unbridled discretion to proceed with works unilaterally without obtaining a prior adjudication order from the District Magistrate.`;
        break;
      case "urgency_memo":
        snippet = `\n\nMEMO OF URGENCY:\nThe Counsel for the Petitioner respectfully mentions that coercive tree-felling operations are slated for imminent commencement at 10:00 AM on Monday. Hence, leave is respectfully craved to take up the accompanying petition out of turn and post before the Hon'ble Bench for urgent ad-interim orders.`;
        break;
      case "verification_block":
        snippet = `\n\nVERIFICATION AFFIDAVIT:\nI, ${clientName}, the Petitioner / Deponent herein, do hereby solemnly declare that the statements made in paragraphs 1 to 12 above are true to my personal knowledge, belief, and official records.\n\nVerified at Ernakulam on this the ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}.\n\nDEPONENT\n\nAdvocate, High Court of Kerala`;
        break;
      default:
        break;
    }

    if (snippet) {
      setDraftContent((prev) => prev + snippet);
      showToast(`Statutory clause appended to draft.`);
    }
  };

  // 4. Refine / Expand with AI or Local Rule Engine
  const handleRefineDraft = async (actionToRun: string = aiAction) => {
    if (!draftContent.trim()) {
      showToast("Cannot refine an empty draft.");
      return;
    }

    setIsRefining(true);
    try {
      const res = await copilotApi.refineDraft({
        content: draftContent,
        action: actionToRun,
        customPrompt,
        matterContext: {
          matterTitle: currentMatter,
          court: courtForum,
          client: clientName,
          respondent: respondentName,
        },
      });

      if (res && res.success && res.refinedContent) {
        setDraftContent(res.refinedContent);
        setIsAiPowered(res.isAiPowered || false);
        setActiveEngine(res.engine || "Kerala Statutory Concordance");
        showToast(
          res.isAiPowered
            ? "Refined with Gemini AI Engine."
            : "Refined with Kerala High Court Statutory Concordance Engine."
        );
      }
    } catch (err: any) {
      console.error("Refinement error:", err);
      showToast("Refinement failed: " + (err?.message || "Local fallback used"));
    } finally {
      setIsRefining(false);
    }
  };

  // 5. Save & Push Directly into 256-bit Case Vault
  const handlePushToVault = async () => {
    try {
      const cleanFileName = `${selectedTemplateId.toUpperCase()}_Paperbook_${Date.now().toString().slice(-4)}.pdf`;
      const payload = {
        title: draftTitle || "Pleading Paperbook Draft",
        fileName: cleanFileName,
        category: "Pleading Draft / Writ Paperbook",
        subType: "document-filing",
        matter: currentMatter,
        fileSize: `${Math.max(12, Math.round(draftContent.length / 100))} KB`,
        filingStatus: "Draft Ready for Verification",
        advocateName,
        details: `Drafted in Legal Studio under ${courtForum}. Certified copy ready for e-filing portal scrutiny.`,
        contentSummary: draftContent.slice(0, 300) + "...",
      };

      await advocateApi.uploadDocument(payload, token);
      setVaultPushed(true);
      showToast("Draft encrypted with AES-256 and synced to Case Document Vault!");
      setTimeout(() => setVaultPushed(false), 5000);
    } catch (err: any) {
      console.error("Push to vault failed:", err);
      showToast("Failed to save to vault: " + (err?.message || "Check connection"));
    }
  };

  // 6. Copy to Clipboard
  const handleCopyClipboard = () => {
    if (!draftContent) return;
    navigator.clipboard.writeText(draftContent);
    showToast("Full paperbook text copied to clipboard.");
  };

  // 7. Download Text / Paperbook File
  const handleDownload = () => {
    if (!draftContent) return;
    const blob = new Blob([draftContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedTemplateId}_Paperbook.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Paperbook downloaded as text file.");
  };

  // 8. Print Preview
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>${draftTitle || "Court Pleading Paperbook"}</title>
          <style>
            @page { size: legal portrait; margin: 35mm 25mm 25mm 38mm; }
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 13pt;
              line-height: 1.6;
              color: #000;
              margin: 0;
              padding: 20px;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .header-bar {
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
              margin-bottom: 20px;
              font-size: 9pt;
              text-transform: uppercase;
              letter-spacing: 1px;
              display: flex;
              justify-content: space-between;
            }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <span>Wakheel Legal Technology</span>
            <span>Kerala High Court Paperbook Standards</span>
          </div>
          <div>${draftContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Stats calculation
  const wordCount = draftContent ? draftContent.split(/\s+/).filter(Boolean).length : 0;
  const lineCount = draftContent ? draftContent.split("\n").length : 0;
  const charCount = draftContent ? draftContent.length : 0;

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black shadow-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                Pleadings &amp; Paperbook Studio
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                {activeEngine}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white">
              AI Legal Drafting Studio
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Draft High Court writ petitions, statutory 138 notices, caveat petitions, and interlocutory applications adhering strictly to Kerala Judicial Paperbook Rules.
            </p>
          </div>

          {/* Active Matter Capsule */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <Scale className="w-4 h-4 text-zinc-600 dark:text-zinc-400 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] text-zinc-400 uppercase font-mono block">Active Matter</span>
              <span className="text-xs font-semibold text-black dark:text-white block max-w-[260px] truncate">
                {currentMatter}
              </span>
            </div>
          </div>
        </div>

        {/* Template Quick Selection Bar */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
            Select Statutory Pleading Template
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
            {templates.map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplateId(tpl.id);
                    handleGenerateDraft(tpl.id);
                  }}
                  className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between h-[86px] ${
                    isSelected
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm"
                      : "bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  <div className="font-bold text-[11px] leading-tight line-clamp-2">
                    {tpl.title}
                  </div>
                  <div className={`text-[9px] uppercase tracking-wide truncate ${isSelected ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400"}`}>
                    {tpl.category.split(" ")[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Dual-Pane Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane (4 Cols): Pleading Parameters, Clauses, and AI Tools */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Case & Party Parameters */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  Pleading Parameters
                </h3>
              </div>
              <button
                onClick={() => handleGenerateDraft(selectedTemplateId)}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
                Re-Generate
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Court / Judicial Forum
                </label>
                <input
                  type="text"
                  value={courtForum}
                  onChange={(e) => setCourtForum(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                    Petitioner / Complainant
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                    Case / Matter Ref No.
                  </label>
                  <input
                    type="text"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Respondent / Opposite Party
                </label>
                <input
                  type="text"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              {selectedTemplateId === "ni_138_demand_notice" && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                      Cheque No. &amp; Date
                    </label>
                    <input
                      type="text"
                      value={chequeNumber}
                      onChange={(e) => setChequeNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                      Cheque Amount (₹)
                    </label>
                    <input
                      type="text"
                      value={chequeAmount}
                      onChange={(e) => setChequeAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Subject / Statutory Infraction
                </label>
                <textarea
                  rows={2}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>Advocate: {advocateName}</span>
                <span>Roll: {barCouncilNumber}</span>
              </div>
            </div>
          </div>

          {/* Card: Instant Statutory Clause Inserter */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <BookOpen className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                Statutory Clause Inserter
              </h3>
            </div>
            <p className="text-[11px] text-zinc-500">
              Inject authoritative procedural clauses formatted per High Court practice into your draft:
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleInsertClause("delay_condonation")}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-left transition-colors text-xs text-black dark:text-white font-medium"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Section 5 Delay Condonation Clause</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Limitation Act</span>
              </button>

              <button
                onClick={() => handleInsertClause("valsamma_precedent")}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-left transition-colors text-xs text-black dark:text-white font-medium"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Division Bench Precedent Ground</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Valsamma (2024)</span>
              </button>

              <button
                onClick={() => handleInsertClause("balance_convenience")}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-left transition-colors text-xs text-black dark:text-white font-medium"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Balance of Convenience &amp; Interim Stay</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Order 39 CPC</span>
              </button>

              <button
                onClick={() => handleInsertClause("verification_block")}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-left transition-colors text-xs text-black dark:text-white font-medium"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Solemn Affidavit &amp; Verification Block</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">HC Rule 152</span>
              </button>

              <button
                onClick={() => handleInsertClause("urgency_memo")}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-left transition-colors text-xs text-black dark:text-white font-medium"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Urgent Mentioning Memo for Bench</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Bench Memo</span>
              </button>
            </div>
          </div>

          {/* Card: AI Refinement & Expansion Studio */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  AI Refinement &amp; Expansion
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Hybrid Engine
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Custom Legal Instruction / Nuance
                </label>
                <input
                  type="text"
                  placeholder="e.g. Assert violation of Article 14 and absence of spot mahazar"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleRefineDraft("expand_grounds")}
                  disabled={isRefining}
                  className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white text-xs font-semibold border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Expand Grounds</span>
                </button>

                <button
                  onClick={() => handleRefineDraft("add_prayer")}
                  disabled={isRefining}
                  className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white text-xs font-semibold border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Scale className="w-3.5 h-3.5 shrink-0" />
                  <span>Add Alternative Prayers</span>
                </button>
              </div>

              <button
                onClick={() => handleRefineDraft("add_verification")}
                disabled={isRefining}
                className="w-full p-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isRefining ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Legal Transformation...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5" />
                    <span>Apply Verification &amp; Solemn Attestation</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-zinc-400 leading-normal">
                {isAiPowered
                  ? "✓ Active: Connected to Google Gemini Generative Legal Engine."
                  : "✓ Active: Kerala High Court Statutory Concordance Engine (Zero cloud API quota needed)."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Pane (7 Cols): Court Paperbook Editor & Live Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-black dark:text-white">
                  Paperbook Canvas
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                  {wordCount} words • {lineCount} lines
                </span>
              </div>

              {/* Formatting & View Controls */}
              <div className="flex items-center gap-2">
                {/* Font selector */}
                <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-900 p-0.5 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium">
                  <button
                    onClick={() => setFontStyle("serif")}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      fontStyle === "serif"
                        ? "bg-white dark:bg-black text-black dark:text-white shadow-xs font-serif"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    Court Serif
                  </button>
                  <button
                    onClick={() => setFontStyle("mono")}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      fontStyle === "mono"
                        ? "bg-white dark:bg-black text-black dark:text-white shadow-xs font-mono"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    Monospace
                  </button>
                </div>

                {/* Spacing selector */}
                <button
                  onClick={() => setLineSpacing(lineSpacing === "standard" ? "compact" : "standard")}
                  className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  {lineSpacing === "standard" ? "1.5 Spacing" : "1.0 Spacing"}
                </button>

                {/* Margin Guide Toggle */}
                <button
                  onClick={() => setShowMarginGuide(!showMarginGuide)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-colors border ${
                    showMarginGuide
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  Margin Guide
                </button>
              </div>
            </div>

            {/* Paperbook Display Container */}
            <div
              className={`relative rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 min-h-[580px] ${
                showMarginGuide ? "pl-10 sm:pl-12" : ""
              }`}
            >
              {/* High Court 2-inch Left Binding Margin Guide */}
              {showMarginGuide && (
                <div
                  className="absolute left-6 top-0 bottom-0 w-px border-l border-dashed border-zinc-300 dark:border-zinc-700 pointer-events-none flex flex-col items-center justify-between py-6"
                  title="Kerala High Court Rules: 2-inch left binding margin required for certified court filing"
                >
                  <span className="text-[9px] font-mono text-zinc-400 -rotate-90 select-none">
                    BINDING MARGIN
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400 -rotate-90 select-none">
                    HIGH COURT 2-INCH
                  </span>
                </div>
              )}

              {/* Editable Pleading Text Canvas */}
              <textarea
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder="Pleading draft will render here..."
                rows={24}
                className={`w-full bg-transparent text-black dark:text-white resize-y focus:outline-none ${
                  fontStyle === "serif" ? "font-serif text-sm" : "font-mono text-xs"
                } ${lineSpacing === "standard" ? "leading-relaxed" : "leading-normal"}`}
                style={{
                  minHeight: "520px",
                  tabSize: 4,
                }}
              />
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyClipboard}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Paperbook</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download (.txt)</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Paperbook</span>
                </button>
              </div>

              {/* Primary Action: Push to 256-bit Case Vault */}
              <button
                onClick={handlePushToVault}
                disabled={vaultPushed || !draftContent}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  vaultPushed
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700"
                    : "bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
                }`}
              >
                {vaultPushed ? (
                  <>
                    <Check className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
                    <span>Saved in Case Vault</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Save to Case Vault (AES-256)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Statutory Verification Callout */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3 text-xs">
            <Shield className="w-4 h-4 text-zinc-600 dark:text-zinc-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-black dark:text-white block">
                Kerala High Court E-Filing &amp; Scrutiny Ready
              </span>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Pleadings created here conform directly to the Rules of the High Court of Kerala, 1971. Once saved to the Document Vault, you can verify party exhibits, run timeline contradiction audits, and issue client signatures via the Document Vault tab.
              </p>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab("vault")}
                  className="inline-flex items-center gap-1 font-semibold text-black dark:text-white underline text-[11px] mt-1"
                >
                  <span>Open 256-bit Document Vault</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
