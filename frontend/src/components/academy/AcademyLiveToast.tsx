"use client";

import React from "react";
import {
  FileText,
  CheckCircle2,
  Volume2,
  BookOpen,
  Scale,
  Bell,
  X,
  Radio,
} from "lucide-react";
import { AcademyToastNotification } from "@/hooks/useAcademyWebSocket";

interface AcademyLiveToastProps {
  toast: AcademyToastNotification | null;
  onDismiss: () => void;
  isConnected?: boolean;
}

export function AcademyLiveToast({
  toast,
  onDismiss,
  isConnected = true,
}: AcademyLiveToastProps) {
  if (!toast) return null;

  const renderIcon = () => {
    switch (toast.type) {
      case "assignment":
        return <FileText className="w-5 h-5 text-amber-400" />;
      case "submission":
        return <CheckCircle2 className="w-5 h-5 text-amber-300" />;
      case "graded":
        return <Scale className="w-5 h-5 text-amber-400" />;
      case "lecture":
        return <Volume2 className="w-5 h-5 text-amber-400" />;
      case "book":
        return <BookOpen className="w-5 h-5 text-amber-400" />;
      case "moot":
        return <Scale className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] max-w-md w-[calc(100vw-3rem)] sm:w-full animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="relative p-4 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border-2 border-amber-500/70 shadow-2xl shadow-amber-500/10 text-white flex items-start justify-between gap-3 overflow-hidden">
        {/* Subtle gold accent edge glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 shrink-0 mt-0.5">
            {renderIcon()}
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500 text-black font-extrabold uppercase tracking-wider">
                {toast.badge}
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {toast.timestamp}
              </span>
              {isConnected && (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-400/90 font-mono">
                  <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                  Live Sync
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold text-white tracking-tight truncate">
              {toast.title}
            </h4>

            <p className="text-xs text-zinc-300 leading-relaxed break-words font-medium">
              {toast.message}
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors shrink-0"
          title="Dismiss notification"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default AcademyLiveToast;
