"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Scale,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  Download,
  History,
  Send,
  HelpCircle,
  FileText,
  AlertTriangle,
  Award,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Layers,
  Printer,
  X,
  User,
  Quote,
} from "lucide-react";
import { advocateApi } from "@/lib/api";

export interface CourtroomVoiceSimulatorViewProps {
  advocateName?: string;
  initialMatterId?: string;
}

interface TurnExchange {
  turnIndex: number;
  benchQuery: string;
  counselArgument: string;
  persuasiveness: number;
  statutoryPrecision: number;
  disposition: string;
  coachCritique: string;
  recommendedCitation: string;
  isInterrupted?: boolean;
  interruptionText?: string;
  timestamp: string;
}

interface SavedSession {
  id: string;
  matterId: string;
  matterTitle: string;
  benchPersona: string;
  date: string;
  durationMinutes: number;
  turnsCount: number;
  finalScore: number;
  dispositionAchieved: string;
  exchanges: TurnExchange[];
  summaryObservations: string[];
}

export function CourtroomVoiceSimulatorView({
  advocateName = "Adv. Meera Krishnan",
  initialMatterId = "mat_wpc_19482",
}: CourtroomVoiceSimulatorViewProps) {
  // Simulator configuration state
  const [selectedPersona, setSelectedPersona] = useState<
    "division_bench_2a" | "single_bench_writs" | "criminal_sessions"
  >("division_bench_2a");
  const [selectedMatter, setSelectedMatter] = useState<string>(initialMatterId);
  const [voiceAudioEnabled, setVoiceAudioEnabled] = useState<boolean>(true);
  const [speechSynthesisAvailable, setSpeechSynthesisAvailable] = useState<boolean>(false);

  // Active rehearsal state
  const [turnIndex, setTurnIndex] = useState<number>(0);
  const [currentBenchQuery, setCurrentBenchQuery] = useState<string>(
    "Counsel, before you delve into the merits of Article 226, kindly satisfy this Court on the availability of an efficacious alternate statutory remedy under the Indian Telegraph Act. Why should this Court entertain a writ petition when statutory proceedings before the District Magistrate have not been exhausted?"
  );
  const [currentCounselInput, setCurrentCounselInput] = useState<string>("");
  const [persuasiveness, setPersuasiveness] = useState<number>(75);
  const [statutoryPrecision, setStatutoryPrecision] = useState<number>(72);
  const [disposition, setDisposition] = useState<string>("Skeptical on Maintainability");
  const [coachCritique, setCoachCritique] = useState<string>(
    "The Bench is testing your threshold maintainability under Article 226. Cite the Whirlpool exceptions (jurisdiction or violation of natural justice) immediately to hold the bench's attention."
  );
  const [recommendedCitation, setRecommendedCitation] = useState<string>(
    "Whirlpool Corporation v. Registrar of Trade Marks (1998) 8 SCC 1"
  );
  const [interruptionAlert, setInterruptionAlert] = useState<string | null>(null);

  // History of dialogue in current session
  const [exchanges, setExchanges] = useState<TurnExchange[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sessionStartTime] = useState<number>(Date.now());

  // Voice recording state via Web Speech API
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Modals
  const [showDossierModal, setShowDossierModal] = useState<boolean>(false);
  const [showPastSessionsModal, setShowPastSessionsModal] = useState<boolean>(false);
  const [pastSessions, setPastSessions] = useState<SavedSession[]>([]);
  const [loadingPastSessions, setLoadingPastSessions] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const bottomDialogueRef = useRef<HTMLDivElement>(null);

  // Persona metadata
  const personas = {
    division_bench_2a: {
      name: "Kerala High Court — Division Bench 2A",
      coram: "Coram: Mustaque & Eapen, JJ.",
      description: "Appellate & Division Bench Writs. Strict scrutiny on administrative laches, Telegraph Act Section 16 procedures, digital land records, and non-est administrative actions.",
      temperament: "Rigorous, questions jurisdictional competence and statutory alternate remedies immediately.",
      primaryDoctrine: "Whirlpool Exceptions & Power Grid Century Textiles Ratio",
    },
    single_bench_writs: {
      name: "High Court Single Bench — Writs & Injunctions",
      coram: "Coram: Justice V. G. Arun",
      description: "Maintainability scrutiny, ad-interim stay parameters, balance of convenience, and prima facie jurisdictional defects in impugned state notices.",
      temperament: "Direct and impatient with repetitive factual reading; demands pinpointed statutory violations.",
      primaryDoctrine: "Article 226 Threshold Maintainability & Irreparable Injury",
    },
    criminal_sessions: {
      name: "Special Criminal & Sessions Court",
      coram: "Coram: Principal Sessions Judge, Ernakulam",
      description: "BNSS Section 482 / legacy 438 CrPC anticipatory bails, Section 138 Negotiable Instruments Act defenses, and custodial interrogation necessity.",
      temperament: "Investigative-minded; interrogates compliance with Arnesh Kumar guidelines and electronic notice proof.",
      primaryDoctrine: "BNSS 482 / 438 CrPC & Section 142 NI Act Strict Timelines",
    },
  };

  // Pre-configured matters
  const matters = [
    {
      id: "mat_wpc_19482",
      title: "WP(C) 19482/2024 — Gopakumar v. KSEB & District Collector",
      court: "High Court of Kerala (Division Bench)",
      coreIssue: "Arbitrary drawing of 66kV transmission overhead line bisecting private homestead without referral to District Magistrate under Section 16(1) of Indian Telegraph Act, 1885.",
      openingBenchPrompt:
        "Counsel, before you delve into the merits of Article 226, kindly satisfy this Court on the availability of an efficacious alternate statutory remedy under the Indian Telegraph Act. Why should this Court entertain a writ petition when statutory proceedings before the District Magistrate have not been exhausted?",
      openingCitation: "Whirlpool Corporation v. Registrar of Trade Marks (1998) 8 SCC 1",
      openingCritique:
        "The Bench is probing threshold maintainability under Article 226. Invoke Whirlpool exceptions immediately: establishing that the licensee acted without jurisdiction by bypassing mandatory Section 16(1) referral.",
    },
    {
      id: "mat_cc_412",
      title: "CC 412/2023 — Apex Logistics v. Royal Traders (Sec 138 NI Act)",
      court: "Judicial First Class Magistrate Court-II, Kochi",
      coreIssue: "Cheque dishonour of ₹14.5 Lakhs. Defense rests on postal return memo endorsement 'Addressee Left Without Instruction' versus deemed service under Section 27 General Clauses Act.",
      openingBenchPrompt:
        "Counsel, look at the statutory demand notice. The postal envelope was returned unserved with endorsement 'Door Locked'. How does your complaint establish deemed service when the recipient never acknowledged receipt?",
      openingCitation: "C.C. Alavi Haji v. Palapetty Muhammed (2007) 6 SCC 555",
      openingCritique:
        "Address the 30-day limitation window and invoke the mandatory statutory presumption under Section 27 General Clauses Act read with the 3-Judge bench ruling in Alavi Haji.",
    },
    {
      id: "mat_ba_8821",
      title: "BA 8821/2024 — Dr. Radhakrishnan v. State of Kerala (BNSS 482)",
      court: "High Court of Kerala (Criminal Jurisdiction)",
      coreIssue: "Anticipatory bail petition under BNSS Section 482 (legacy Section 438 CrPC) in alleged corporate breach of trust FIR. Complainant alleges ₹85 Lakh diversion.",
      openingBenchPrompt:
        "Counsel, the Public Prosecutor submits that recovery of crucial digital ledgers and hardware tokens is pending, requiring custodial interrogation. Why should this Court exercise discretionary extraordinary powers under BNSS 482?",
      openingCitation: "Arnesh Kumar v. State of Bihar (2014) 8 SCC 273",
      openingCritique:
        "Demonstrate voluntary joining of investigation, prior statutory notice under BNSS 35(3), and complete cooperation without custodial necessity.",
    },
  ];

  // Initialize Speech Recognition & Synthesis check on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check speech synthesis
      if ("speechSynthesis" in window) {
        setSpeechSynthesisAvailable(true);
      }

      // Check speech recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechRecognitionSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-IN"; // English (India) legal cadence

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          setCurrentCounselInput((prev) => {
            const combined = (prev + " " + (finalTranscript || interimTranscript)).trim();
            return combined;
          });
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Vocalize bench queries using browser SpeechSynthesis
  const speakBenchQuery = (text: string) => {
    if (!voiceAudioEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // deliberate, judicial pacing
      utterance.pitch = 0.9; // deeper, formal tone
      utterance.lang = "en-IN";
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (!speechRecognitionSupported || !recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. You can type your arguments directly.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  // Switch Matter
  const handleSelectMatter = (matterId: string) => {
    setSelectedMatter(matterId);
    const m = matters.find((item) => item.id === matterId);
    if (m) {
      setTurnIndex(0);
      setExchanges([]);
      setCurrentBenchQuery(m.openingBenchPrompt);
      setRecommendedCitation(m.openingCitation);
      setCoachCritique(m.openingCritique);
      setPersuasiveness(75);
      setStatutoryPrecision(72);
      setDisposition("Skeptical on Maintainability");
      setInterruptionAlert(null);
      setCurrentCounselInput("");
      if (voiceAudioEnabled) {
        speakBenchQuery(m.openingBenchPrompt);
      }
    }
  };

  // Switch Persona
  const handleSelectPersona = (
    persona: "division_bench_2a" | "single_bench_writs" | "criminal_sessions"
  ) => {
    setSelectedPersona(persona);
    setTurnIndex(0);
    setExchanges([]);
    const m = matters.find((item) => item.id === selectedMatter) || matters[0];
    setCurrentBenchQuery(m.openingBenchPrompt);
    setRecommendedCitation(m.openingCitation);
    setCoachCritique(m.openingCritique);
    setInterruptionAlert(null);
    setCurrentCounselInput("");
    if (voiceAudioEnabled) {
      speakBenchQuery(m.openingBenchPrompt);
    }
  };

  // Reset Rehearsal
  const handleResetRehearsal = () => {
    setTurnIndex(0);
    setExchanges([]);
    setCurrentCounselInput("");
    setInterruptionAlert(null);
    const m = matters.find((item) => item.id === selectedMatter) || matters[0];
    setCurrentBenchQuery(m.openingBenchPrompt);
    setRecommendedCitation(m.openingCitation);
    setCoachCritique(m.openingCritique);
    setPersuasiveness(75);
    setStatutoryPrecision(72);
    setDisposition("Skeptical on Maintainability");
    if (voiceAudioEnabled) {
      speakBenchQuery(m.openingBenchPrompt);
    }
  };

  // Submit Counsel Rebuttal Turn
  const handleSubmitRebuttal = async () => {
    if (!currentCounselInput.trim() || isSubmitting) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsSubmitting(true);
    setInterruptionAlert(null);

    const counselArgText = currentCounselInput.trim();

    try {
      // Call backend simulation endpoint with fallback
      let simResult: any = null;
      try {
        simResult = await advocateApi.simulateBenchTurn({
          matterId: selectedMatter,
          benchPersona: selectedPersona,
          argument: counselArgText,
          turnIndex,
        });
      } catch (err) {
        console.warn("Direct API call fallback:", err);
        const res = await fetch("/api/advocate/courtroom/simulate", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("wakheel_token") || "advocate_token"}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            matterId: selectedMatter,
            benchPersona: selectedPersona,
            argument: counselArgText,
            turnIndex,
          }),
        });
        simResult = await res.json();
      }

      if (simResult && simResult.success) {
        const newExchange: TurnExchange = {
          turnIndex: turnIndex + 1,
          benchQuery: currentBenchQuery,
          counselArgument: counselArgText,
          persuasiveness: simResult.persuasiveness || 80,
          statutoryPrecision: simResult.statutoryPrecision || 82,
          disposition: simResult.disposition || "Engaged on Statutory Jurisdiction",
          coachCritique: simResult.coachCritique || "Strong rebuttal addressing jurisdiction.",
          recommendedCitation: simResult.recommendedCitation || "Whirlpool Corp (1998) 8 SCC 1",
          isInterrupted: simResult.isInterrupted || false,
          interruptionText: simResult.interruptionText || "",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setExchanges((prev) => [...prev, newExchange]);
        setTurnIndex(turnIndex + 1);
        setCurrentBenchQuery(simResult.benchQuery || "Counsel, state your concluding prayer.");
        setPersuasiveness(simResult.persuasiveness || 80);
        setStatutoryPrecision(simResult.statutoryPrecision || 82);
        setDisposition(simResult.disposition || "Engaged on Statutory Jurisdiction");
        setCoachCritique(simResult.coachCritique || "Continue to press the statutory bar.");
        setRecommendedCitation(simResult.recommendedCitation || "");
        setCurrentCounselInput("");

        if (simResult.isInterrupted && simResult.interruptionText) {
          setInterruptionAlert(simResult.interruptionText);
        }

        // Vocalize new bench query
        if (voiceAudioEnabled) {
          const speakText = simResult.isInterrupted
            ? `${simResult.interruptionText}. ${simResult.benchQuery}`
            : simResult.benchQuery;
          speakBenchQuery(speakText);
        }

        // Auto-scroll timeline
        setTimeout(() => {
          bottomDialogueRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    } catch (error: any) {
      console.error("Failed to simulate bench turn:", error);
      alert("Failed to reach Courtroom Simulator backend. Please check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save current rehearsal session
  const handleSaveSession = async () => {
    try {
      const activeMatter = matters.find((m) => m.id === selectedMatter);
      const sessionData = {
        matterId: selectedMatter,
        matterTitle: activeMatter?.title || "Courtroom Rehearsal",
        benchPersona: selectedPersona,
        durationMinutes: Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000)),
        turnsCount: exchanges.length,
        finalScore: Math.round((persuasiveness + statutoryPrecision) / 2),
        dispositionAchieved: disposition,
        exchanges,
        summaryObservations: [
          `Bench Coram: ${personas[selectedPersona].name}`,
          `Counsel Persuasiveness achieved: ${persuasiveness}%`,
          `Statutory Precision achieved: ${statutoryPrecision}%`,
          `Final Judicial Disposition: ${disposition}`,
          `Key Precedent Cited: ${recommendedCitation}`,
        ],
      };

      await advocateApi.saveCourtroomSession(sessionData);
      setSaveSuccessMsg("Rehearsal session saved to Chamber Archives.");
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err) {
      console.error("Save session failed:", err);
      alert("Failed to save courtroom rehearsal session.");
    }
  };

  // Open Past Sessions
  const handleOpenPastSessions = async () => {
    setShowPastSessionsModal(true);
    setLoadingPastSessions(true);
    try {
      const res = await advocateApi.getCourtroomSessions();
      if (res && res.success && res.sessions) {
        setPastSessions(res.sessions);
      }
    } catch (err) {
      console.error("Failed to load past sessions:", err);
    } finally {
      setLoadingPastSessions(false);
    }
  };

  // Add suggestion pill to argument
  const handleAppendSuggestion = (phrase: string) => {
    setCurrentCounselInput((prev) => {
      if (!prev) return phrase;
      return `${prev} ${phrase}`;
    });
  };

  const activeMatterObj = matters.find((m) => m.id === selectedMatter) || matters[0];
  const activePersonaObj = personas[selectedPersona];

  // Helper for Disposition Badge styling
  const getDispositionStyle = (disp: string) => {
    if (disp.includes("Granted") || disp.includes("Stay")) {
      return "bg-black text-white dark:bg-white dark:text-black font-bold border-zinc-900 dark:border-zinc-100";
    }
    if (disp.includes("Inclined") || disp.includes("Engaged")) {
      return "bg-zinc-200 text-black dark:bg-zinc-800 dark:text-white border-zinc-300 dark:border-zinc-700";
    }
    return "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800";
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & COURTROOM DAIS OVERVIEW                        */}
      {/* ============================================================== */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white animate-pulse" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">
                AI Oral Hearing Simulator &amp; Bench Coach • Milestone 3
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-black dark:text-white tracking-tight flex items-center gap-2">
              <Scale className="w-6 h-6 shrink-0" />
              Interactive Courtroom Voice Hearing Simulator
            </h2>
            <p className="text-xs text-zinc-500 max-w-3xl">
              Rehearse high-stakes oral arguments against realistic High Court &amp; Sessions Bench personas.
              Features turn-by-turn judicial interruptions, real-time speech recognition, vocalized bench questions, and live rebuttal scoring.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Audio Voiceover Toggle */}
            <button
              onClick={() => {
                const nextVal = !voiceAudioEnabled;
                setVoiceAudioEnabled(nextVal);
                if (!nextVal && typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title={voiceAudioEnabled ? "Bench Voice Synthesis Active" : "Bench Voice Synthesis Muted"}
            >
              {voiceAudioEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Bench Voice: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-zinc-400">Bench Voice: OFF</span>
                </>
              )}
            </button>

            {/* Past Sessions History */}
            <button
              onClick={handleOpenPastSessions}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>Past Sessions</span>
            </button>

            {/* Save Current Session */}
            {exchanges.length > 0 && (
              <button
                onClick={handleSaveSession}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Rehearsal</span>
              </button>
            )}

            {/* Export Argument Dossier */}
            <button
              onClick={() => setShowDossierModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Argument Dossier</span>
            </button>

            {/* Reset */}
            <button
              onClick={handleResetRehearsal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition cursor-pointer"
              title="Reset Rehearsal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-black dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {saveSuccessMsg}
          </div>
        )}

        {/* Configuration Row: Matter Selector & Bench Persona Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
          {/* Matter / Case Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Hearing Matter / Legal Brief
            </label>
            <select
              value={selectedMatter}
              onChange={(e) => handleSelectMatter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white focus:outline-none cursor-pointer"
            >
              {matters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-500 italic truncate">
              {activeMatterObj.coreIssue}
            </p>
          </div>

          {/* Bench Persona Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Presiding Judicial Bench Persona
            </label>
            <select
              value={selectedPersona}
              onChange={(e) => handleSelectPersona(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="division_bench_2a">
                Kerala High Court — Division Bench 2A (Mustaque &amp; Eapen, JJ.)
              </option>
              <option value="single_bench_writs">
                High Court Single Bench — Writs &amp; Injunctions (Maintainability Focus)
              </option>
              <option value="criminal_sessions">
                Special Criminal &amp; Sessions Court (BNSS 482 / 438 CrPC)
              </option>
            </select>
            <p className="text-[11px] text-zinc-500 truncate">
              <span className="font-bold text-zinc-700 dark:text-zinc-300">{activePersonaObj.coram}: </span>
              {activePersonaObj.temperament}
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN COURTROOM REHEARSAL ARENA (DAIS + METRICS DASHBOARD)   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): The Dais & Oral Argument Console */}
        <div className="lg:col-span-8 space-y-6">
          {/* THE BENCH DAIS CONTAINER */}
          <div className="p-6 md:p-7 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
            {/* Bench Header & Current Coram */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-sm shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-black dark:text-white">
                      {activePersonaObj.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300">
                      Court Hall 2
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500">{activePersonaObj.coram}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">
                    Hearing Progression
                  </span>
                  <span className="text-xs font-bold text-black dark:text-white">
                    Turn {turnIndex + 1}
                  </span>
                </div>
              </div>
            </div>

            {/* JUDICIAL INTERRUPTION BANNER (if bench stepped in) */}
            {interruptionAlert && (
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-400 dark:border-zinc-600 space-y-1 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-black dark:text-white">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Hon&apos;ble Bench Interruption / Gavel Note</span>
                </div>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 italic pl-6">
                  &ldquo;{interruptionAlert}&rdquo;
                </p>
              </div>
            )}

            {/* CURRENT BENCH QUERY CARD */}
            <div className="p-5 md:p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Quote className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-bold text-black dark:text-white">
                    Judicial Inquiry from the Bench:
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getDispositionStyle(
                      disposition
                    )}`}
                  >
                    Disposition: {disposition}
                  </span>

                  {voiceAudioEnabled && speechSynthesisAvailable && (
                    <button
                      onClick={() => speakBenchQuery(currentBenchQuery)}
                      className="p-1 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                      title="Replay Bench Voice"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm md:text-[15px] text-zinc-800 dark:text-zinc-200 leading-relaxed font-serif italic pl-2 border-l-2 border-black dark:border-white">
                &ldquo;{currentBenchQuery}&rdquo;
              </p>
            </div>

            {/* ORAL REBUTTAL INPUT CONSOLE */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-black dark:text-white">
                    Submissions of Counsel ({advocateName}):
                  </span>
                  {isListening && (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold animate-pulse">
                      <Mic className="w-3 h-3" />
                      Listening... Speak your submission
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-zinc-400">
                  {currentCounselInput.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              <div className="relative">
                <textarea
                  rows={4}
                  value={currentCounselInput}
                  onChange={(e) => setCurrentCounselInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleSubmitRebuttal();
                    }
                  }}
                  placeholder="State your oral argument clearly to the Bench... Press Ctrl+Enter or click Submit Rebuttal."
                  className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs md:text-sm text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition"
                />

                {/* Microphone Voice Button pinned at bottom-right inside/beside */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-3 bottom-3 p-2.5 rounded-xl border transition cursor-pointer ${
                    isListening
                      ? "bg-black text-white dark:bg-white dark:text-black border-transparent ring-2 ring-zinc-400 animate-pulse"
                      : "bg-white dark:bg-black text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:text-black dark:hover:text-white"
                  }`}
                  title={isListening ? "Stop Voice Dictation" : "Speak Oral Submission via Microphone"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              {/* Quick Legal Phrase Insertion Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase text-zinc-400 mr-1">
                  Insert Authority:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleAppendSuggestion(
                      "My Lords, we rely directly on Whirlpool Corporation v. Registrar of Trade Marks (1998) 8 SCC 1 regarding natural justice exceptions to alternate remedy."
                    )
                  }
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  + Whirlpool (1998) 8 SCC 1
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleAppendSuggestion(
                      "Under Section 16(1) of the Indian Telegraph Act, 1885, licensee cannot enter without obtaining prior permission from the District Magistrate once statutory resistance is voiced."
                    )
                  }
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  + Section 16(1) Telegraph Act
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleAppendSuggestion(
                      "The impugned summary order suffers from patent violation of audi alteram partem without assigning any jurisdictional reason."
                    )
                  }
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  + Audi Alteram Partem
                </button>
              </div>

              {/* Submit Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Rebuttal scored on Persuasiveness, Statutory Citation, and Jurisdictional Logic.</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSubmitRebuttal}
                    disabled={!currentCounselInput.trim() || isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold disabled:opacity-50 hover:opacity-90 transition cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                        <span>Bench Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Rebuttal to Bench</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ARGUMENT TIMELINE & TURN-BY-TURN DIALOGUE HISTORY */}
          <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Live Hearing Transcript &amp; Rebuttal Record ({exchanges.length} Turns)
              </h4>
              <span className="text-[10px] text-zinc-400">Chronological Court Record</span>
            </div>

            {exchanges.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                No past turns recorded in this session. Submit your first oral rebuttal above to initiate dialogue.
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {exchanges.map((ex, idx) => (
                  <div
                    key={`${ex.turnIndex}-${idx}`}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3"
                  >
                    {/* Turn Header */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-black dark:text-white">
                        Turn #{ex.turnIndex} • {ex.timestamp}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white">
                          Persuasiveness: {ex.persuasiveness}%
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white">
                          Precision: {ex.statutoryPrecision}%
                        </span>
                      </div>
                    </div>

                    {/* Bench Question */}
                    <div className="space-y-1 text-xs">
                      <span className="font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5" /> Bench:
                      </span>
                      <p className="text-zinc-700 dark:text-zinc-300 italic pl-3 border-l-2 border-zinc-300 dark:border-zinc-700">
                        &ldquo;{ex.benchQuery}&rdquo;
                      </p>
                    </div>

                    {/* Counsel Rebuttal */}
                    <div className="space-y-1 text-xs">
                      <span className="font-bold text-black dark:text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Counsel ({advocateName}):
                      </span>
                      <p className="text-zinc-800 dark:text-zinc-200 pl-3 border-l-2 border-black dark:border-white">
                        {ex.counselArgument}
                      </p>
                    </div>

                    {/* Coach Feedback Note */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-black dark:text-white">Precedent Coach Critique: </span>
                        {ex.coachCritique}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomDialogueRef} />
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Bench Coach, Scores & Precedents */}
        <div className="lg:col-span-4 space-y-6">
          {/* LIVE REBUTTAL STRENGTH SCORING */}
          <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4" />
                Live Rebuttal Metrics
              </h4>
              <span className="text-[10px] text-zinc-400">Turn #{turnIndex + 1}</span>
            </div>

            {/* Score 1: Persuasiveness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-zinc-600 dark:text-zinc-400">Persuasiveness Rating</span>
                <span className="font-bold text-black dark:text-white">{persuasiveness}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <div
                  className="h-full bg-black dark:bg-white transition-all duration-500"
                  style={{ width: `${persuasiveness}%` }}
                />
              </div>
            </div>

            {/* Score 2: Statutory Precision */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-zinc-600 dark:text-zinc-400">Statutory Precision</span>
                <span className="font-bold text-black dark:text-white">{statutoryPrecision}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <div
                  className="h-full bg-black dark:bg-white transition-all duration-500"
                  style={{ width: `${statutoryPrecision}%` }}
                />
              </div>
            </div>

            {/* Bench Disposition Indicator */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Current Judicial Disposition
              </span>
              <div
                className={`p-2.5 rounded-xl text-xs text-center border font-bold ${getDispositionStyle(
                  disposition
                )}`}
              >
                {disposition}
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed text-center">
                {disposition.includes("Stay")
                  ? "The Bench is inclined to order ad-interim relief in favour of petitioner."
                  : disposition.includes("Engaged")
                  ? "The Bench is actively considering your jurisdictional submissions."
                  : "The Bench requires explicit rebuttal of statutory bars before considering interim relief."}
              </p>
            </div>
          </div>

          {/* PRECEDENT COACH & RATIO ADVISOR */}
          <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Precedent Coach Advice
              </h4>
            </div>

            {/* Coach Critique Card */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Judicial Strategy Recommendation
              </span>
              <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                {coachCritique}
              </p>
            </div>

            {/* Recommended Precedent Citation Card */}
            {recommendedCitation && (
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Mandatory Binding Citation
                </span>
                <p className="text-xs font-serif font-bold text-black dark:text-white">
                  {recommendedCitation}
                </p>
                <button
                  type="button"
                  onClick={() => handleAppendSuggestion(`As settled in ${recommendedCitation}, `)}
                  className="w-full mt-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-[11px] font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                >
                  Insert Citation in Submission
                </button>
              </div>
            )}
          </div>

          {/* BENCH TEMPERAMENT & ROSTER METADATA */}
          <div className="p-6 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Bench Profile &amp; Rules of Practice
            </span>
            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
              <div>
                <span className="font-bold text-black dark:text-white">Bench Doctrine: </span>
                <span>{activePersonaObj.primaryDoctrine}</span>
              </div>
              <div>
                <span className="font-bold text-black dark:text-white">Speech Synthesis: </span>
                <span>
                  {speechSynthesisAvailable
                    ? "Available (Audio vocalization enabled)"
                    : "Not available in this browser"}
                </span>
              </div>
              <div>
                <span className="font-bold text-black dark:text-white">Voice Dictation: </span>
                <span>
                  {speechRecognitionSupported
                    ? "Supported (Web Speech API active)"
                    : "Unsupported (manual typing active)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. ARGUMENT READINESS DOSSIER MODAL                            */}
      {/* ============================================================== */}
      {showDossierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">
                  Pre-Hearing Argument Readiness Dossier
                </span>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Oral Argument Rehearsal Record &amp; Bench Analysis
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Dossier</span>
                </button>
                <button
                  onClick={() => setShowDossierModal(false)}
                  className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto print:p-0">
              {/* Dossier Header Info */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-zinc-400 font-bold block uppercase text-[10px]">
                    Matter Under Hearing
                  </span>
                  <span className="font-bold text-black dark:text-white text-sm">
                    {activeMatterObj.title}
                  </span>
                  <p className="text-zinc-500 text-[11px] mt-1">{activeMatterObj.coreIssue}</p>
                </div>
                <div>
                  <span className="text-zinc-400 font-bold block uppercase text-[10px]">
                    Bench Coram &amp; Counsel
                  </span>
                  <span className="font-bold text-black dark:text-white">
                    {activePersonaObj.name} ({activePersonaObj.coram})
                  </span>
                  <p className="text-zinc-500 text-[11px] mt-1">Appearing Counsel: {advocateName}</p>
                </div>
              </div>

              {/* Summary Scorecard */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                    Persuasiveness Score
                  </span>
                  <span className="text-2xl font-black text-black dark:text-white mt-1 block">
                    {persuasiveness}%
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                    Statutory Precision
                  </span>
                  <span className="text-2xl font-black text-black dark:text-white mt-1 block">
                    {statutoryPrecision}%
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                    Final Judicial Disposition
                  </span>
                  <span className="text-xs font-bold text-black dark:text-white mt-2 block">
                    {disposition}
                  </span>
                </div>
              </div>

              {/* Turn-by-turn Transcript */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                  Complete Turn-By-Turn Argument Transcript
                </h4>
                {exchanges.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">
                    No completed turns in current session. Submit rebuttal turns in simulator to generate dialogue records.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {exchanges.map((ex) => (
                      <div
                        key={ex.turnIndex}
                        className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs"
                      >
                        <div className="font-bold text-black dark:text-white flex items-center justify-between">
                          <span>Turn #{ex.turnIndex} • {ex.timestamp}</span>
                          <span className="text-zinc-400 text-[11px]">
                            Score: {ex.persuasiveness}% Persuasiveness | {ex.statutoryPrecision}% Precision
                          </span>
                        </div>
                        <div className="pl-3 border-l-2 border-zinc-300 dark:border-zinc-700 italic text-zinc-700 dark:text-zinc-300">
                          <span className="font-bold">Bench: </span>&ldquo;{ex.benchQuery}&rdquo;
                        </div>
                        <div className="pl-3 border-l-2 border-black dark:border-white text-black dark:text-white">
                          <span className="font-bold">Counsel: </span>{ex.counselArgument}
                        </div>
                        <div className="text-[11px] text-zinc-500 pt-1">
                          <span className="font-bold">Bench Coach Note: </span>{ex.coachCritique}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. PAST SESSIONS ARCHIVE MODAL                                 */}
      {/* ============================================================== */}
      {showPastSessionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-black dark:text-white">
                  Past Courtroom Rehearsal Sessions
                </h3>
                <p className="text-xs text-zinc-500">Archived oral argument rehearsals</p>
              </div>
              <button
                onClick={() => setShowPastSessionsModal(false)}
                className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {loadingPastSessions ? (
                <div className="py-8 text-center text-xs text-zinc-500">Loading archived sessions...</div>
              ) : pastSessions.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No saved courtroom sessions found in chamber storage.
                </div>
              ) : (
                pastSessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black dark:text-white">
                        {s.matterTitle}
                      </span>
                      <span className="text-[10px] text-zinc-400">{s.date}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                      <span>Coram: {s.benchPersona}</span>
                      <span>•</span>
                      <span>{s.turnsCount} turns</span>
                      <span>•</span>
                      <span className="font-bold text-black dark:text-white">
                        Score: {s.finalScore}%
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Disposition: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{s.dispositionAchieved}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourtroomVoiceSimulatorView;
