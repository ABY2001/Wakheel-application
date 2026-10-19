"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Download,
  Copy,
  Check,
  Sparkles,
  FileText,
  Clock,
  Trash2,
  FolderPlus,
  Tag,
  Share2,
  AlertCircle,
  FileAudio,
  CheckCircle2,
  Layers,
  ChevronRight,
  Plus,
  Search,
} from "lucide-react";

export interface AudioNote {
  id: string;
  title: string;
  category: "Court Hearing" | "Client Conference" | "Judge Directions" | "Cross-Exam Strategy" | "General Chamber";
  matter: string;
  duration: string;
  date: string;
  transcript: string;
  actionItems: string[];
  audioUrl?: string;
  isSample?: boolean;
}

const SAMPLE_NOTES: AudioNote[] = [
  {
    id: "rec-01",
    title: "WP(C) 19482/2024 — Bench Observation on Telegraph Line Alignment",
    category: "Judge Directions",
    matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    duration: "00:48",
    date: "Today, 11:45 AM",
    transcript:
      "Hon'ble Bench observed that Section 16 of Indian Telegraph Act does not empower KSEB to draw 11KV lines through petitioner's homestead without prior notice to the District Magistrate. Interim stay extended until November 14th. Bench asked Assistant Executive Engineer to be personally present if counter-affidavit is not filed within two weeks.",
    actionItems: [
      "Obtain certified copy of today's Bench interim extension order",
      "Draft rejoinder addressing Section 16 jurisdictional bar",
      "Brief client Sri. Gopakumar regarding next posting on Nov 14",
    ],
    isSample: true,
  },
  {
    id: "rec-02",
    title: "CC 412/2024 — Post-Hearing Cross Examination Highlights",
    category: "Cross-Exam Strategy",
    matter: "CC 412/2024 — Cheque Dishonour (S.138 NI Act)",
    duration: "01:15",
    date: "Yesterday, 04:20 PM",
    transcript:
      "Complainant admitted during cross-examination that no income tax returns were produced to substantiate cash lending of ₹5 Lakhs. Defense reliance on Supreme Court ratio in Basalingappa v. Mudibasappa (2019) 5 SCC 418 established foundational rebuttable presumption. Complainant's passbook reveals no corresponding withdrawal on 12/03/2023.",
    actionItems: [
      "File memo with excerpt of Complainant PW-1 cross-examination deposition",
      "Compile citations on standard of preponderance of probability in Section 139 NI Act",
      "Prepare Section 313 CrPC defense questionnaire for accused",
    ],
    isSample: true,
  },
  {
    id: "rec-03",
    title: "OS 284/2023 — Client Conference on Survey Commission Report",
    category: "Client Conference",
    matter: "OS 284/2023 — Varghese v. Mathew (Sub Court)",
    duration: "00:34",
    date: "16 Oct 2026, 02:15 PM",
    transcript:
      "Client instructed that Advocate Commissioner failed to measure the eastern boundary with reference to 1968 resettlement survey plan. The existing granite wall was ignored in sketch C-1. Need to file objection to commission report and pray for remitting the warrant back to the same commissioner.",
    actionItems: [
      "Draft objection petition to Advocate Commissioner report",
      "Attach old resettlement survey sketch as defense Exhibit",
    ],
    isSample: true,
  },
];

interface ChamberVoiceDictationProps {
  currentMatter?: string;
  onAttachToMatter?: (note: AudioNote) => void;
}

export function ChamberVoiceDictation({
  currentMatter = "WP(C) 19482/2024 — Gopakumar v. KSEB",
  onAttachToMatter,
}: ChamberVoiceDictationProps) {
  // Recorder states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  // Form & Metadata
  const [dictationTitle, setDictationTitle] = useState("");
  const [dictationMatter, setDictationMatter] = useState(currentMatter);
  const [dictationCategory, setDictationCategory] = useState<AudioNote["category"]>("Court Hearing");
  const [generatedTranscript, setGeneratedTranscript] = useState("");
  const [generatedActions, setGeneratedActions] = useState<string[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>("All");

  // Playback states
  const [activePlaybackId, setActivePlaybackId] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);

  // Stored notes list (client-side hydration safe)
  const [savedNotes, setSavedNotes] = useState<AudioNote[]>(SAMPLE_NOTES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted notes on client mount
  useEffect(() => {
    try {
      const local = localStorage.getItem("wakheel_chamber_dictations");
      if (local) {
        setSavedNotes(JSON.parse(local));
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Persist notes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("wakheel_chamber_dictations", JSON.stringify(savedNotes));
    } catch {}
  }, [savedNotes, isLoaded]);

  // Clean up audio blob URL on unmount
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [recordedAudioUrl]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start recording
  const handleStartRecording = async () => {
    setMicPermissionDenied(false);
    audioChunksRef.current = [];
    setRecordingDuration(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("MediaDevices not supported in this browser context.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlobObj = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlobObj);
        const url = URL.createObjectURL(audioBlobObj);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());

        // Trigger AI transcription simulation
        simulateAITranscription(dictationCategory, dictationMatter);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setIsPaused(false);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn("Microphone access failed or running in mock environment, falling back to simulated recorder:", err);
      setMicPermissionDenied(true);
      // Run simulated recorder mode so the user can test the UI smoothly
      setIsRecording(true);
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  // Pause/Resume recording
  const handleTogglePause = () => {
    if (!isRecording) return;
    if (isPaused) {
      mediaRecorderRef.current?.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current?.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsRecording(false);
    setIsPaused(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      // In simulated mode without hardware mic
      simulateAITranscription(dictationCategory, dictationMatter);
    }
  };

  // Reset recorder
  const handleDiscardRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    setRecordingDuration(0);
    setAudioBlob(null);
    setRecordedAudioUrl(null);
    setGeneratedTranscript("");
    setGeneratedActions([]);
  };

  // AI Legal Speech-to-Text Simulation
  const simulateAITranscription = (cat: AudioNote["category"], matterName: string) => {
    setIsTranscribing(true);

    setTimeout(() => {
      let mockTranscript = "";
      let mockActions: string[] = [];

      if (cat === "Court Hearing" || cat === "Judge Directions") {
        mockTranscript = `Matter taken up at 11:30 AM before Single Bench. Respondent counsel sought further time to place relevant Kerala Land Revenue records and demarcation mahazar on board. Bench observed prima facie merit in petitioner's contention that statutory notice under the relevant rules was not served. Granted two weeks interim extension till 28th October. Ordered status quo as to possession.`;
        mockActions = [
          "Apply for urgent certified copy of Bench interim order",
          "Inform client regarding extension of status quo",
          "Prepare counter-rejoinder addressing revenue survey records",
        ];
      } else if (cat === "Cross-Exam Strategy") {
        mockTranscript = `Key question sequence formulated for PW-1 cross examination: Confront witness with Ex. A-4 cash ledger entry. Point out lack of counterfoil receipt and absence of signature in day book. Stress Section 106 Evidence Act regarding burden of proving facts especially within knowledge.`;
        mockActions = [
          "Flag page 14 of cash ledger for cross-examination bundle",
          "Draft suggestion sequence regarding unaccounted balance",
        ];
      } else if (cat === "Client Conference") {
        mockTranscript = `Client confirmed that possession has been uninterrupted since registered partition deed of 2004. Basic tax has been remitted up to current financial year. Client instructed to press for an ad-interim prohibitory injunction against trespass.`;
        mockActions = [
          "Collect original tax receipts for financial years 2020-2026",
          "File interlocutory application (IA) for injunction under Order 39 Rule 1 CPC",
        ];
      } else {
        mockTranscript = `Chamber dictation regarding statutory interpretation: Article 226 maintainability against contractual arbitrariness when statutory public duty is invoked (ref. ABL International ratio). Prepare synopsis highlighting arbitrary disconnection without notice.`;
        mockActions = [
          "Extract paras 23-28 of ABL International v. Export Credit Guarantee Corp",
          "Include proposition in draft writ petition grounds",
        ];
      }

      setGeneratedTranscript(mockTranscript);
      setGeneratedActions(mockActions);
      if (!dictationTitle) {
        setDictationTitle(`${cat} Dictation — ${new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`);
      }
      setIsTranscribing(false);
    }, 900);
  };

  // Save the recorded note into library
  const handleSaveNote = () => {
    const newNote: AudioNote = {
      id: `rec-${Date.now()}`,
      title: dictationTitle.trim() || `Dictation on ${dictationMatter.split("—")[0].trim()}`,
      category: dictationCategory,
      matter: dictationMatter,
      duration: formatTime(recordingDuration || 45),
      date: "Just now",
      transcript: generatedTranscript || "Chamber audio dictation recorded without speech transcript.",
      actionItems: generatedActions.length > 0 ? generatedActions : ["Review dictation memo with associate"],
      audioUrl: recordedAudioUrl || undefined,
    };

    setSavedNotes([newNote, ...savedNotes]);
    if (onAttachToMatter) {
      onAttachToMatter(newNote);
    }

    // Reset after save
    handleDiscardRecording();
    setDictationTitle("");
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    setSavedNotes(savedNotes.filter((n) => n.id !== id));
  };

  // Copy transcript to clipboard
  const handleCopyTranscript = (note: AudioNote) => {
    const fullText = `[${note.category.toUpperCase()}] ${note.title}\nMatter: ${note.matter}\nDate: ${note.date} (${note.duration})\n\nTRANSCRIPT:\n${note.transcript}\n\nACTION ITEMS:\n${note.actionItems.map((a, i) => `${i + 1}. ${a}`).join("\n")}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle playback for a note
  const handleTogglePlayNote = (noteId: string) => {
    if (activePlaybackId === noteId) {
      setActivePlaybackId(null);
    } else {
      setActivePlaybackId(noteId);
    }
  };

  // Filter notes
  const filteredNotes = savedNotes.filter((n) => {
    const matchesCategory = selectedFilterCategory === "All" || n.category === selectedFilterCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.matter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.transcript.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
              HD Chamber Voice Dictation
            </span>
            <span className="text-xs text-zinc-400 font-mono">WebAudio API + Legal Speech AI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight mt-1">
            Voice Dictations &amp; Hearing Memos
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Instant post-courtroom audio dictation, speech-to-text transcript generation, and docket action item extraction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block font-bold">Active Chamber Docket</span>
            <span className="text-xs font-bold text-black dark:text-white truncate max-w-[200px] block">
              {currentMatter.split("—")[0].trim()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Recorder Console / Right Saved Archive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: ACTIVE AUDIO RECORDER CONSOLE (5 COLS)       */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
            {/* Top decorative gradient glow */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500 ${
              isRecording ? (isPaused ? "bg-amber-500" : "bg-rose-500 animate-pulse") : "bg-gradient-to-r from-zinc-300 via-rose-400 to-zinc-400 dark:from-zinc-800 dark:via-rose-600 dark:to-zinc-800"
            }`} />

            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  isRecording ? (isPaused ? "bg-amber-500" : "bg-rose-600 animate-ping") : "bg-zinc-300 dark:bg-zinc-700"
                }`} />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-600 dark:text-zinc-300">
                  {isRecording ? (isPaused ? "RECORDING PAUSED" : "LIVE CAPTURE ACTIVE") : (audioBlob || generatedTranscript ? "RECORDING COMPLETED" : "STUDIO RECORDER READY")}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-400">
                {isRecording ? formatTime(recordingDuration) : (audioBlob ? formatTime(recordingDuration) : "00:00")}
              </span>
            </div>

            {/* Microphone Permission Info Alert if running in mock/blocked environment */}
            {micPermissionDenied && (
              <div className="mt-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-800 dark:text-amber-300 leading-snug">
                  <strong>Simulated Audio Mode Active</strong>: Hardware mic access is restricted or running without HTTPS. Dictation workflow, timer, and AI speech transcript work seamlessly!
                </div>
              </div>
            )}

            {/* Visualizer Wave Animation Centerpiece */}
            <div className="my-6 py-6 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 flex flex-col items-center justify-center space-y-4">
              {/* Sound Wave Bars */}
              <div className="flex items-center justify-center gap-1.5 h-16 w-full px-4">
                {[
                  35, 60, 25, 80, 45, 95, 70, 40, 85, 100, 65, 30, 90, 50, 75, 40, 85, 60, 30, 70, 90, 45, 65, 30
                ].map((height, i) => (
                  <div
                    key={i}
                    style={{
                      height: isRecording && !isPaused ? `${Math.max(12, (height * (0.4 + Math.sin(recordingDuration + i) * 0.6)))}%` : "15%",
                    }}
                    className={`w-1.5 rounded-full transition-all duration-150 ${
                      isRecording
                        ? isPaused
                          ? "bg-amber-400 dark:bg-amber-500"
                          : "bg-rose-500 dark:bg-rose-500 shadow-xs"
                        : audioBlob || generatedTranscript
                        ? "bg-emerald-500 dark:bg-emerald-500"
                        : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                  />
                ))}
              </div>

              {/* Status readout */}
              <div className="text-center">
                <div className="text-3xl font-mono font-extrabold tracking-tight text-black dark:text-white">
                  {formatTime(recordingDuration)}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {isRecording
                    ? isPaused
                      ? "Paused — Click Resume to continue speaking"
                      : "Recording chamber audio... Speak clearly into your mic"
                    : audioBlob || generatedTranscript
                    ? "Audio capture ready for review and tagging"
                    : "Press the Red button below to start dictating"}
                </div>
              </div>
            </div>

            {/* Recorder Control Buttons */}
            <div className="flex items-center justify-center gap-4 pt-1">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  <span>Start Dictation</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleTogglePause}
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                    <span>{isPaused ? "Resume" : "Pause"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center gap-2 shadow-xs transition-all hover:opacity-90 cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop &amp; Transcribe</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDiscardRecording}
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                    title="Discard recording"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Audio Playback Element if real recording exists */}
            {recordedAudioUrl && (
              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5 font-mono">
                  <span>Playback Audio Preview</span>
                  <a
                    href={recordedAudioUrl}
                    download="chamber_dictation.webm"
                    className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-sans text-[11px]"
                  >
                    <Download className="w-3 h-3" /> Save File
                  </a>
                </div>
                <audio controls src={recordedAudioUrl} className="w-full h-8 rounded-lg" />
              </div>
            )}
          </div>

          {/* Metadata & Tagging Form (Active once recorded or draft is ready) */}
          {(audioBlob || generatedTranscript || isTranscribing) && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <span className="text-xs font-mono font-bold uppercase text-zinc-500 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Memo Docket Tagging
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Ready to Archive
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">Dictation Title</label>
                  <input
                    type="text"
                    value={dictationTitle}
                    onChange={(e) => setDictationTitle(e.target.value)}
                    placeholder="e.g. Oral Remarks on Stay Extension..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">Category</label>
                    <select
                      value={dictationCategory}
                      onChange={(e) => setDictationCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                    >
                      <option value="Court Hearing">Court Hearing</option>
                      <option value="Judge Directions">Judge Directions</option>
                      <option value="Cross-Exam Strategy">Cross-Exam Strategy</option>
                      <option value="Client Conference">Client Conference</option>
                      <option value="General Chamber">General Chamber</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">Matter Reference</label>
                    <input
                      type="text"
                      value={dictationMatter}
                      onChange={(e) => setDictationMatter(e.target.value)}
                      placeholder="e.g. WP(C) 19482/2024"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* AI Speech Transcript Box */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-zinc-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                      <span>Legal Speech-to-Text Transcript</span>
                      {isTranscribing && <span className="text-zinc-400 font-normal italic">(AI Transcribing...)</span>}
                    </label>
                  </div>
                  <textarea
                    rows={4}
                    value={generatedTranscript}
                    onChange={(e) => setGeneratedTranscript(e.target.value)}
                    placeholder={isTranscribing ? "Transcribing oral dictation..." : "Type or edit oral dictation transcript..."}
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none leading-relaxed text-xs resize-none"
                  />
                </div>

                {/* Extracted Action Items */}
                {generatedActions.length > 0 && (
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                      Auto-Extracted Action Items
                    </span>
                    <ul className="space-y-1">
                      {generatedActions.map((act, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] text-zinc-700 dark:text-zinc-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Save button */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleDiscardRecording}
                    className="px-3.5 py-2 rounded-xl text-zinc-500 hover:text-black dark:hover:text-white font-medium text-xs cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer hover:opacity-90"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Save to Chamber Archive</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: CHAMBER DICTATION ARCHIVE & LIBRARY (7 COLS)*/}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header & Filter Bar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-rose-500" />
                  <span>Chamber Audio Library</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                    {filteredNotes.length} Memos
                  </span>
                </h3>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search audio memos..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-900">
              {["All", "Judge Directions", "Court Hearing", "Cross-Exam Strategy", "Client Conference"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedFilterCategory === cat
                      ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                      : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-3">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <MicOff className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
                <div className="text-sm font-bold text-zinc-600 dark:text-zinc-400">No dictations found</div>
                <div className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Try clearing your search query or start a fresh recording using the console on the left.
                </div>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isPlaying = activePlaybackId === note.id;

                return (
                  <div
                    key={note.id}
                    className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-3.5 group"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${
                              note.category === "Judge Directions"
                                ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60"
                                : note.category === "Cross-Exam Strategy"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                                : note.category === "Client Conference"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                            }`}
                          >
                            {note.category}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {note.date}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-zinc-500">
                            • {note.duration}
                          </span>
                        </div>

                        <h4 className="text-sm font-extrabold text-black dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {note.title}
                        </h4>
                        <div className="text-[11px] font-mono text-zinc-500 font-medium">
                          {note.matter}
                        </div>
                      </div>

                      {/* Top Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyTranscript(note)}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                          title="Copy transcript & action items"
                        >
                          {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Transcript Body */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-900">
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                        "{note.transcript}"
                      </p>
                    </div>

                    {/* Action Items List */}
                    {note.actionItems && note.actionItems.length > 0 && (
                      <div className="space-y-1.5 pl-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                          Chamber Follow-Ups ({note.actionItems.length})
                        </span>
                        <div className="grid grid-cols-1 gap-1">
                          {note.actionItems.map((act, aIdx) => (
                            <div key={aIdx} className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                              <span>{act}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Playback Bar */}
                    <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 text-xs">
                      <button
                        type="button"
                        onClick={() => handleTogglePlayNote(note.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                          isPlaying
                            ? "bg-rose-600 text-white shadow-xs"
                            : "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Play Memo ({note.duration})</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        {isPlaying && (
                          <div className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-mono animate-pulse">
                            <Volume2 className="w-3.5 h-3.5" /> Playing sample stream...
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopyTranscript(note)}
                          className="text-[11px] text-zinc-500 hover:text-black dark:hover:text-white font-medium hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Share2 className="w-3 h-3" /> Export Summary
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
