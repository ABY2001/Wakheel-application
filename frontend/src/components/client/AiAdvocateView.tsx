"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Scale,
  Shield,
  FileText,
  Sparkles,
  Paperclip,
  Mic,
  MicOff,
  User,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  AlertCircle,
  BookOpen,
  X,
  Compass,
} from "lucide-react";

export type AdvocateSpecialization =
  | "constitutional"
  | "criminal"
  | "civil-property"
  | "corporate";

export type AdvocateConsultMode =
  | "strategy"
  | "bench-simulator"
  | "pleading-audit";

interface ChatMessage {
  id: string;
  sender: "user" | "advocate";
  text: string;
  timestamp: string;
  citations?: string[];
  benchQueries?: string[];
  actionRecommendation?: string;
}

const SPECIALIZATIONS = [
  {
    id: "constitutional" as AdvocateSpecialization,
    name: "Senior Constitutional & Writ Counsel",
    court: "High Court of Kerala (Ernakulam) & Supreme Court",
    description: "Article 226 Writs, administrative arbitrariness, fundamental rights & statutory stays.",
    icon: Scale,
  },
  {
    id: "criminal" as AdvocateSpecialization,
    name: "Criminal Defense & Bail Strategist",
    court: "Sessions & Special Courts (BNSS / BNS / NDPS)",
    description: "Anticipatory & regular bail, FIR quashing, Section 35 appearance & procedural rights.",
    icon: Shield,
  },
  {
    id: "civil-property" as AdvocateSpecialization,
    name: "Senior Civil & Land Litigator",
    court: "Munsiff, Sub Court & District Civil Registry",
    description: "Title declaration, permanent injunction, boundary disputes & specific performance.",
    icon: FileText,
  },
  {
    id: "corporate" as AdvocateSpecialization,
    name: "Commercial & Corporate Counsel",
    court: "NCLT Kochi Bench & Commercial Arbitration",
    description: "Shareholder disputes, insolvency, breach of contract & statutory notices.",
    icon: BookOpen,
  },
];

const INITIAL_CONVERSATIONS: Record<AdvocateSpecialization, ChatMessage[]> = {
  constitutional: [
    {
      id: "m-c-1",
      sender: "advocate",
      text: "Greetings. I am your Digital Constitutional & Writ Counsel for Kerala High Court practice. How may I advise you regarding administrative decisions, illegal demolition/entry, or statutory stay petitions today?",
      timestamp: "Just now",
      citations: [
        "Constitution of India, Art. 226",
        "Telegraph Act, 1885, Sec. 16",
        "2024 (2) KHC 401 (DB)",
      ],
      actionRecommendation:
        "Ensure all statutory representations to District Collector / District Magistrate are documented before seeking mandamus.",
    },
  ],
  criminal: [
    {
      id: "m-cr-1",
      sender: "advocate",
      text: "Greetings. I am your Digital Criminal Defense Strategist practicing under the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023. Are you facing a police summons, threat of arrest, or seeking to file a regular or anticipatory bail petition?",
      timestamp: "Just now",
      citations: [
        "BNSS, 2023, Sec. 35 (Arrest safeguards)",
        "BNSS, 2023, Sec. 482 (Anticipatory bail)",
        "Satender Kumar Antil v. CBI (2022)",
      ],
      actionRecommendation:
        "Always request a formal written notice under Section 35 BNSS before visiting any police station.",
    },
  ],
  "civil-property": [
    {
      id: "m-cp-1",
      sender: "advocate",
      text: "Welcome. I am your Civil & Land Law Counsel. I assist with property title verification, boundary dispute suits (OS), specific performance of sale agreements, and interim injunction applications.",
      timestamp: "Just now",
      citations: [
        "Transfer of Property Act, 1882, Sec. 54",
        "Specific Relief Act, 1963, Sec. 34 & 38",
        "AIR 1996 SC 2823 (Mutation ruling)",
      ],
      actionRecommendation:
        "Ensure 30-year Nil Encumbrance Certificate (EC) and prior registered link deeds are gathered.",
    },
  ],
  corporate: [
    {
      id: "m-co-1",
      sender: "advocate",
      text: "Greetings. I am your Commercial Litigator and Corporate Counsel. I evaluate contract breaches, statutory demand notices under Section 138 NI Act, and commercial arbitration filings.",
      timestamp: "Just now",
      citations: [
        "Negotiable Instruments Act, 1881, Sec. 138",
        "Commercial Courts Act, 2015, Sec. 12A",
        "2024 INSC 782",
      ],
      actionRecommendation:
        "Verify delivery proof of statutory notice before filing commercial or Section 138 actions.",
    },
  ],
};

export default function AiAdvocateView() {
  const [selectedSpec, setSelectedSpec] =
    useState<AdvocateSpecialization>("constitutional");
  const [consultMode, setConsultMode] =
    useState<AdvocateConsultMode>("strategy");
  const [messages, setMessages] = useState<ChatMessage[]>(
    INITIAL_CONVERSATIONS["constitutional"]
  );
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Switch conversation when specialization changes
  useEffect(() => {
    setMessages(INITIAL_CONVERSATIONS[selectedSpec]);
  }, [selectedSpec]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Voice recording simulation
  const toggleRecording = () => {
    if (isRecording) {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setIsRecording(false);
      setInputText(
        (prev) =>
          (prev ? prev + " " : "") +
          "[Transcribed Audio Note]: The opposite party has initiated work on our boundary without giving any notice or showing the sanctioned permit."
      );
      setRecordingSeconds(0);
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim() && attachedFiles.length === 0) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text: inputText.trim() || "[Attached Documents for Evaluation]",
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      let botResponse: ChatMessage;

      if (consultMode === "bench-simulator") {
        botResponse = {
          id: "bot-" + Date.now(),
          sender: "advocate",
          text: `[Bench Query Simulator Active]\nCounsel, assuming I am presiding over Bench 2A of the Kerala High Court hearing your admission petition:`,
          timestamp: "Just now",
          benchQueries: [
            "1. Counsel, what is your locus standi? Have you produced the registered title deed and village thandaper extract demonstrating absolute possession?",
            "2. Why have you approached this court directly under Article 226 when Section 16(1) of the Indian Telegraph Act provides an effective alternative remedy before the District Magistrate?",
            "3. Is there any delay or laches in approaching this Court? What is the date of knowledge of the impugned survey marker?",
          ],
          citations: [
            "2024 (2) KHC 401 (DB)",
            "Telegraph Act, 1885, Section 16(1)",
            "Whirlpool Corporation v. Registrar of Trade Marks (Alternative remedy exceptions)",
          ],
          actionRecommendation:
            "Answer the Bench by asserting that alternative remedy is bypassed because the authority acted in total violation of natural justice (no notice served).",
        };
      } else if (consultMode === "pleading-audit") {
        botResponse = {
          id: "bot-" + Date.now(),
          sender: "advocate",
          text: `[Pleading Audit Report]\nI have audited the factual proposition: "${currentInput.slice(0, 80)}..." against High Court Practice Rules:`,
          timestamp: "Just now",
          citations: [
            "Rule 32, Kerala High Court Rules (True English Translation)",
            "Kerala Court Fees and Suits Valuation Act, 1959, Schedule II",
            "Limitation Act, 1963, Article 113",
          ],
          benchQueries: [
            "✓ Jurisdiction verified: Subject matter falls within territorial jurisdiction of Ernakulam Principal Bench.",
            "✓ Cause of action accrual: Accrued within the last 30 days — well within 3-year limitation window.",
            "⚠ Caution: Ensure vernacular revenue sketches are accompanied by an advocate-certified English translation.",
          ],
          actionRecommendation:
            "Prepare Index, Synopsis, List of Dates, and marked true copies of all exhibits (P-1 to P-4).",
        };
      } else {
        botResponse = {
          id: "bot-" + Date.now(),
          sender: "advocate",
          text: `Based on the facts submitted, here is my formal counsel strategy:\n\n1. Prima Facie Case: You have strong legal grounds under settled precedents. Under the law, public authorities or private encroachers cannot unilaterally infringe on peaceful enjoyment without following due process.\n\n2. Immediate Legal Recourse: We should issue a formal Counsel's Legal Demand Notice to put the authorities on notice, followed by filing for an Interim Stay Order to preserve status quo.\n\n3. Evidence Strength: Ensure your title deed, tax receipts, and photographic evidence of the ground reality are indexed.`,
          timestamp: "Just now",
          citations: [
            selectedSpec === "constitutional"
              ? "Constitution of India, Art. 226 & Art. 300A"
              : selectedSpec === "criminal"
              ? "Bharatiya Nagarik Suraksha Sanhita, 2023, Sec. 482"
              : selectedSpec === "civil-property"
              ? "Specific Relief Act, 1963, Sec. 38 (Injunction)"
              : "Negotiable Instruments Act, 1881, Sec. 138",
            "Landmark Division Bench Ratio in 2024 (2) KHC 401",
          ],
          actionRecommendation:
            "File interim injunction petition and submit Section 16 objection to District Magistrate today.",
        };
      }

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
      setAttachedFiles([]);
    }, 1200);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names = Array.from(e.target.files).map((f) => f.name);
      setAttachedFiles((prev) => [...prev, ...names]);
    }
  };

  const currentSpecObj =
    SPECIALIZATIONS.find((s) => s.id === selectedSpec) || SPECIALIZATIONS[0];

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white tracking-tight">
                AI Advocate Digital Counsel
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                Live Counsel Mode
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              Autonomous courtroom strategy, bench query preparation, and case merits analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">
            {currentSpecObj.court.split("(")[0]}
          </span>
        </div>
      </div>

      {/* Specialization Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SPECIALIZATIONS.map((spec) => {
          const Icon = spec.icon;
          const isSelected = selectedSpec === spec.id;
          return (
            <button
              key={spec.id}
              onClick={() => setSelectedSpec(spec.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                isSelected
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs"
                  : "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:border-zinc-400"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                        : "bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                      Active
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-xs leading-snug">{spec.name}</h3>
                <p
                  className={`text-[10px] line-clamp-2 ${
                    isSelected ? "text-zinc-200 dark:text-zinc-700" : "text-zinc-500"
                  }`}
                >
                  {spec.description}
                </p>
              </div>

              <span
                className={`text-[9px] font-mono block truncate ${
                  isSelected ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400"
                }`}
              >
                {spec.court}
              </span>
            </button>
          );
        })}
      </div>

      {/* Consultation Mode Selector */}
      <div className="p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-1 text-xs font-bold text-center">
        {[
          { id: "strategy" as AdvocateConsultMode, label: "1. Strategy Consultation" },
          { id: "bench-simulator" as AdvocateConsultMode, label: "2. Bench Query Coach" },
          { id: "pleading-audit" as AdvocateConsultMode, label: "3. Pleading & Limitation Audit" },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setConsultMode(m.id)}
            className={`py-2 px-2 rounded-xl transition-all cursor-pointer ${
              consultMode === m.id
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Interactive Counsel Chamber (Chat & Consultation Log) */}
      <div className="rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex flex-col shadow-xs overflow-hidden">
        {/* Counsel Chamber Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div>
              <span className="font-bold text-xs text-black dark:text-white block">
                {currentSpecObj.name}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Mode: {consultMode.toUpperCase().replace("-", " ")}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMessages(INITIAL_CONVERSATIONS[selectedSpec])}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="Reset consultation session"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px] font-medium">New Session</span>
          </button>
        </div>

        {/* Messages Stream */}
        <div className="p-4 sm:p-6 space-y-4 min-h-[380px] max-h-[520px] overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "advocate" && (
                <div className="w-7 h-7 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs space-y-2.5 ${
                  msg.sender === "user"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </p>

                {/* Bench Queries if any */}
                {msg.benchQueries && msg.benchQueries.length > 0 && (
                  <div className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                    <span className="font-bold text-[10px] font-mono uppercase tracking-wider block text-black dark:text-white">
                      Court Queries to Prepare For:
                    </span>
                    <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                      {msg.benchQueries.map((bq, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="font-bold text-black dark:text-white shrink-0">›</span>
                          <span>{bq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Citations if any */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {msg.citations.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-black/70 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-700 dark:text-zinc-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Strategic Takeaway Action */}
                {msg.actionRecommendation && (
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-start gap-1.5 text-[11px] text-zinc-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-black dark:text-white" />
                    <span>
                      <strong>Counsel Advice:</strong> {msg.actionRecommendation}
                    </span>
                  </div>
                )}

                <span className="text-[9px] font-mono opacity-60 block text-right">
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === "user" && (
                <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 text-black dark:text-white">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-center text-xs text-zinc-400">
              <div className="w-7 h-7 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="w-2 h-2 rounded-full bg-zinc-400 animate-ping" />
                <span>Advocate is formulating legal strategy &amp; Bare Act authorities...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Strategic Prompts */}
        <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 flex flex-wrap gap-1.5 text-xs">
          <span className="text-zinc-400 font-mono text-[10px] self-center">
            Suggested counsel topics:
          </span>
          {[
            "Contesting illegal high-tension power line realignment",
            "Anticipatory bail petition for false Section 420 case",
            "Tenancy eviction defense under Section 11(3)",
            "Premature Section 138 NI Act notice quash grounds",
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(prompt)}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black space-y-2">
          {/* Attached Files Preview */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-1">
              {attachedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px]"
                >
                  <FileText className="w-3 h-3 text-black dark:text-white" />
                  <span className="truncate max-w-[150px]">{file}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              onChange={handleFileAttach}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach documents"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleRecording}
              title={isRecording ? "Stop voice recording" : "Record voice query"}
              className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                isRecording
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white animate-pulse"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {isRecording && (
              <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 animate-pulse">
                Recording ({recordingSeconds}s)...
              </span>
            )}

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              placeholder={`Ask your ${currentSpecObj.name} for legal strategy, court arguments...`}
              className="flex-1 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!inputText.trim() && attachedFiles.length === 0}
              className="px-4 py-2 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 disabled:opacity-40 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Consult</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
