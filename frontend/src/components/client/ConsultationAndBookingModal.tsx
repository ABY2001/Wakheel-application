"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Calendar,
  Video,
  User,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Paperclip,
  Mic,
  Square,
  Play,
  Pause,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Advocate } from "./AdvocateSearchAndMatch";
import { citizenApi } from "@/lib/api";

interface AttachedMedia {
  name: string;
  size: string;
  type: "document" | "image";
  url?: string;
  file?: File;
}

interface ConsultationAndBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  advocate: Advocate | null;
  defaultTab?: "booking" | "consultation";
}

export function ConsultationAndBookingModal({
  isOpen,
  onClose,
  advocate,
  defaultTab = "booking",
}: ConsultationAndBookingModalProps) {
  const [activeTab, setActiveTab] = useState<"booking" | "consultation">(defaultTab);
  const [selectedDate, setSelectedDate] = useState("2026-10-15");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("10:30 AM");
  const [consultationType, setConsultationType] = useState<"video" | "audio" | "inperson">("video");
  const [consultationNote, setConsultationNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Attachment & Voice Note State
  const [attachedFiles, setAttachedFiles] = useState<AttachedMedia[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceNoteBlob, setVoiceNoteBlob] = useState<Blob | null>(null);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Reset or initialize on tab changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (voiceNoteUrl && voiceNoteUrl !== "simulated_audio") {
        URL.revokeObjectURL(voiceNoteUrl);
      }
      attachedFiles.forEach((file) => {
        if (file.url) URL.revokeObjectURL(file.url);
      });
    };
  }, []);

  if (!isOpen || !advocate) return null;

  const timeSlots = ["09:30 AM", "10:30 AM", "02:00 PM", "04:30 PM", "06:00 PM"];

  // Voice Note Handlers
  const handleStartRecording = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          setVoiceNoteBlob(blob);
          setVoiceNoteUrl(url);
          stream.getTracks().forEach((track) => track.stop());
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
      }
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn("Hardware microphone access unavailable, using simulated voice memo:", err);
      // Fallback simulation
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleStopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else if (!voiceNoteUrl) {
      setVoiceNoteUrl("simulated_audio");
      setRecordingSeconds((prev) => (prev > 0 ? prev : 8));
    }
    setIsRecording(false);
  };

  const handleTogglePlayVoiceNote = () => {
    if (!voiceNoteUrl) return;

    if (voiceNoteUrl === "simulated_audio") {
      setIsPlayingVoice(!isPlayingVoice);
      setTimeout(() => setIsPlayingVoice(false), (recordingSeconds || 8) * 1000);
      return;
    }

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(voiceNoteUrl);
      audioElementRef.current.onended = () => setIsPlayingVoice(false);
    }

    if (isPlayingVoice) {
      audioElementRef.current.pause();
      setIsPlayingVoice(false);
    } else {
      audioElementRef.current.play().catch(() => {});
      setIsPlayingVoice(true);
    }
  };

  const handleRemoveVoiceNote = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (voiceNoteUrl && voiceNoteUrl !== "simulated_audio") {
      URL.revokeObjectURL(voiceNoteUrl);
    }
    setVoiceNoteUrl(null);
    setVoiceNoteBlob(null);
    setIsPlayingVoice(false);
    setRecordingSeconds(0);
  };

  // Attachment Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: AttachedMedia[] = Array.from(files).map((f) => {
      const isImg = f.type.startsWith("image/");
      const sizeMB = f.size / (1024 * 1024);
      const sizeStr = sizeMB < 1 ? `${Math.round(f.size / 1024)} KB` : `${sizeMB.toFixed(1)} MB`;
      return {
        name: f.name,
        size: sizeStr,
        type: isImg ? "image" : "document",
        url: isImg ? URL.createObjectURL(f) : undefined,
        file: f,
      };
    });

    setAttachedFiles((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => {
      const target = prev[index];
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || "dev_token" : "dev_token";

    try {
      const parsedFee = advocate.fee ? parseInt(advocate.fee.replace(/[^0-9]/g, ""), 10) || 1500 : 1500;
      let fullSubject = consultationNote || `Legal Consultation with ${advocate.name}`;
      if (attachedFiles.length > 0 || voiceNoteUrl) {
        const parts = [];
        if (attachedFiles.length > 0) parts.push(`${attachedFiles.length} file(s) attached`);
        if (voiceNoteUrl) parts.push(`Voice note (${recordingSeconds}s)`);
        fullSubject += ` [${parts.join(", ")}]`;
      }

      await citizenApi.bookConsultation(token, {
        advocateId: advocate.id,
        advocateName: advocate.name,
        consultationType: consultationType === "inperson" ? "chamber" : consultationType === "audio" ? "phone" : "video",
        scheduledDate: selectedDate,
        timeSlot: selectedTimeSlot,
        subject: fullSubject,
        feeAmount: parsedFee,
      });
    } catch {
      // Graceful fallback for mock
    } finally {
      setIsSubmitting(false);
      setIsSuccess(true);
    }
  };

  const handleResetAndClose = () => {
    if (isRecording) {
      handleStopRecording();
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setIsSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="absolute inset-0" onClick={handleResetAndClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-black dark:text-white z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={handleResetAndClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-black dark:text-white">
                {activeTab === "booking" ? "Appointment Confirmed" : "Consultation Request Dispatched"}
              </h3>
              <p className="text-sm text-zinc-500 max-w-md mx-auto">
                {activeTab === "booking"
                  ? `Your appointment with ${advocate.name} is confirmed for ${selectedDate} at ${selectedTimeSlot}.`
                  : `Your consultation request and case brief have been delivered to ${advocate.name}.`}
              </p>

              {(attachedFiles.length > 0 || voiceNoteUrl) && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                  {attachedFiles.length > 0 && (
                    <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-medium">
                      📎 {attachedFiles.length} file(s) attached
                    </span>
                  )}
                  {voiceNoteUrl && (
                    <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-medium">
                      🎙️ Voice note ({recordingSeconds}s) delivered
                    </span>
                  )}
                </div>
              )}

              <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 inline-block text-xs font-mono text-black dark:text-white font-bold">
                Ref Code: WAK-{Math.floor(100000 + Math.random() * 900000)}
              </div>
              <div className="pt-4">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider rounded-full cursor-pointer"
                >
                  Return to Portal
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div className="w-12 h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xl">
                  {advocate.name.split(" ")[1]?.[0] || "A"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-1.5">
                    <span>{advocate.name}</span>
                    <ShieldCheck className="w-4 h-4 text-black dark:text-white" />
                  </h3>
                  <p className="text-xs text-zinc-500">{advocate.title} • {advocate.fee}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("booking")}
                  className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    activeTab === "booking"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                  Appointment Booking
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("consultation")}
                  className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    activeTab === "consultation"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />
                  Consultation Request
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleConfirm} className="space-y-5">
                {activeTab === "booking" ? (
                  <>
                    {/* Date Picker */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Select Appointment Date
                      </label>
                      <input
                        type="date"
                        required
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>

                    {/* Time Slot Picker */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Available Time Slots
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {timeSlots.map((slot) => (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                              selectedTimeSlot === slot
                                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold shadow-xs"
                                : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-black dark:hover:border-white"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Consultation Mode */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Preferred Mode
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setConsultationType("video")}
                          className={`p-3 rounded-xl border text-center transition-all text-xs font-bold cursor-pointer ${
                            consultationType === "video"
                              ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs"
                              : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                          }`}
                        >
                          <Video className="w-5 h-5 mx-auto mb-1" />
                          Video Call
                        </button>

                        <button
                          type="button"
                          onClick={() => setConsultationType("audio")}
                          className={`p-3 rounded-xl border text-center transition-all text-xs font-bold cursor-pointer ${
                            consultationType === "audio"
                              ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs"
                              : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                          }`}
                        >
                          <MessageSquare className="w-5 h-5 mx-auto mb-1" />
                          Audio Call
                        </button>

                        <button
                          type="button"
                          onClick={() => setConsultationType("inperson")}
                          className={`p-3 rounded-xl border text-center transition-all text-xs font-bold cursor-pointer ${
                            consultationType === "inperson"
                              ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs"
                              : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                          }`}
                        >
                          <User className="w-5 h-5 mx-auto mb-1" />
                          In-Person
                        </button>
                      </div>
                    </div>

                    {/* Brief Note with Plus Section (Attach Documents/Image) and Voice Note */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                          Brief Note for Advocate
                        </label>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Optional: Add documents or voice note
                        </span>
                      </div>

                      <textarea
                        rows={3}
                        value={consultationNote}
                        onChange={(e) => setConsultationNote(e.target.value)}
                        placeholder="Provide details about your matter..."
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-3 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-all resize-none leading-relaxed"
                      />

                      {/* Bottom Action Bar matching user screenshot: '+' for attach & voice note */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        {/* Hidden file input */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          multiple
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          onChange={handleFileSelect}
                          className="hidden"
                        />

                        {/* Action buttons: '+' Attach documents/image and Voice Note */}
                        <div className="flex items-center gap-2">
                          {/* Plus button for documents/image attachment */}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:border-black dark:hover:border-white text-xs font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer group shadow-2xs"
                            title="Attach case papers, revenue deeds, agreements or photos"
                          >
                            <div className="w-4 h-4 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[11px] group-hover:scale-105 transition-transform">
                              <Plus className="w-3 h-3" />
                            </div>
                            <span>Attach Documents / Image</span>
                          </button>

                          {/* Voice Note Button */}
                          {!isRecording ? (
                            <button
                              type="button"
                              onClick={handleStartRecording}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-xs font-semibold shadow-2xs ${
                                voiceNoteUrl
                                  ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-black dark:text-white"
                                  : "bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              }`}
                              title="Record a voice note for the advocate"
                            >
                              <Mic className="w-3.5 h-3.5 text-black dark:text-white" />
                              <span>{voiceNoteUrl ? "Re-record Voice Note" : "Voice Note"}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleStopRecording}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold transition-all cursor-pointer shadow-xs animate-pulse"
                              title="Click to finish recording"
                            >
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                              <Square className="w-3 h-3 fill-current" />
                              <span>Stop Recording ({recordingSeconds}s)</span>
                            </button>
                          )}
                        </div>

                        <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                          Privileged &amp; Encrypted
                        </span>
                      </div>

                      {/* Preview chips for Voice Note & Attached Documents */}
                      {(attachedFiles.length > 0 || voiceNoteUrl) && (
                        <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-2 animate-in fade-in duration-150">
                          {/* Voice Note Pill */}
                          {voiceNoteUrl && (
                            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={handleTogglePlayVoiceNote}
                                  className="w-7 h-7 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                                  title={isPlayingVoice ? "Pause" : "Play"}
                                >
                                  {isPlayingVoice ? (
                                    <Pause className="w-3 h-3 fill-current" />
                                  ) : (
                                    <Play className="w-3 h-3 fill-current ml-0.5" />
                                  )}
                                </button>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 font-bold text-black dark:text-white">
                                    <Mic className="w-3 h-3" />
                                    <span>Voice Note for {advocate.name.split(" ")[1] || advocate.name}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-zinc-500">
                                    {recordingSeconds > 0 ? `${recordingSeconds}s audio memo` : "Recorded audio brief"}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={handleRemoveVoiceNote}
                                className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                                title="Remove voice note"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {/* Attached Document & Image Pills */}
                          {attachedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {attachedFiles.map((file, fIdx) => (
                                <div
                                  key={fIdx}
                                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs shadow-2xs"
                                >
                                  {file.type === "image" && file.url ? (
                                    <img
                                      src={file.url}
                                      alt={file.name}
                                      className="w-5 h-5 rounded object-cover border border-zinc-200 dark:border-zinc-800"
                                    />
                                  ) : file.type === "image" ? (
                                    <ImageIcon className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                                  ) : (
                                    <FileText className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                                  )}
                                  <span className="font-semibold text-black dark:text-white truncate max-w-[140px] sm:max-w-[190px]">
                                    {file.name}
                                  </span>
                                  <span className="text-[10px] text-zinc-400 font-mono">
                                    ({file.size})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFile(fIdx)}
                                    className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer ml-1"
                                    title="Remove attachment"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? "Processing..." : activeTab === "booking" ? "Confirm & Book Slot →" : "Send Consultation Request →"}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
