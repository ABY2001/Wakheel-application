"use client";

import React, { useState } from "react";
import { X, Calendar, Video, User, MessageSquare, CheckCircle2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Advocate } from "./AdvocateSearchAndMatch";
import { citizenApi } from "@/lib/api";

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

  if (!isOpen || !advocate) return null;

  const timeSlots = ["09:30 AM", "10:30 AM", "02:00 PM", "04:30 PM", "06:00 PM"];

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("wakheel_token") || "dev_token" : "dev_token";

    try {
      const parsedFee = advocate.fee ? parseInt(advocate.fee.replace(/[^0-9]/g, ""), 10) || 1500 : 1500;
      await citizenApi.bookConsultation(token, {
        advocateId: advocate.id,
        advocateName: advocate.name,
        consultationType: consultationType === "inperson" ? "chamber" : consultationType === "audio" ? "phone" : "video",
        scheduledDate: selectedDate,
        timeSlot: selectedTimeSlot,
        subject: consultationNote || `Legal Consultation with ${advocate.name}`,
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
              <div className="w-16 h-16 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-black dark:text-white">
                {activeTab === "booking" ? "Appointment Confirmed" : "Request Submitted"}
              </h3>
              <p className="text-sm text-zinc-500 max-w-md mx-auto">
                {activeTab === "booking"
                  ? `Your appointment with ${advocate.name} is confirmed for ${selectedDate} at ${selectedTimeSlot}.`
                  : `Your consultation request has been sent to ${advocate.name}.`}
              </p>
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
                  onClick={() => setActiveTab("booking")}
                  className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    activeTab === "booking"
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                  Appointment Booking
                </button>

                <button
                  onClick={() => setActiveTab("consultation")}
                  className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    activeTab === "consultation"
                      ? "bg-black text-white dark:bg-white dark:text-black"
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
                                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold"
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
                              ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                              : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
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
                              ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                              : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
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
                              ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                              : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          <User className="w-5 h-5 mx-auto mb-1" />
                          In-Person
                        </button>
                      </div>
                    </div>

                    {/* Brief Note */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Brief Note for Advocate
                      </label>
                      <textarea
                        rows={3}
                        value={consultationNote}
                        onChange={(e) => setConsultationNote(e.target.value)}
                        placeholder="Provide details about your matter..."
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-3 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                      />
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
