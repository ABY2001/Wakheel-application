"use client";

import React, { useState } from "react";
import { Sparkles, X, Send, Scale } from "lucide-react";
import { API_BASE_URL } from "@/lib/academyApi";

interface CopilotMsg {
  sender: "faculty" | "ai";
  text: string;
  timestamp: string;
}

interface FacultyAiCopilotProps {
  department: string;
  subject: string;
}

export function FacultyAiCopilot({ department, subject }: FacultyAiCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<CopilotMsg[]>([
    {
      sender: "ai",
      text: "Namaste Professor! I am your Wakheel Faculty Co-Counsel. Ask me for classroom analogies, landmark Supreme Court ratios, formative cold-call questions, or 5-minute moot drills.",
      timestamp: "Ready",
    },
  ]);

  const sendPrompt = async (promptText: string) => {
    const clean = promptText.trim();
    if (!clean || isThinking) return;

    const userMsg: CopilotMsg = {
      sender: "faculty",
      text: clean,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const token =
        (typeof window !== "undefined" &&
          (localStorage.getItem("wakheel_academy_token") || localStorage.getItem("wakheel_token"))) ||
        "dev_teacher";
      const res = await fetch(`${API_BASE_URL}/copilot/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `[Faculty Pedagogy • ${department} • ${subject}] ${clean}`,
          context: "Wakheel Law Academy Faculty Studio",
        }),
      });
      const json = await res.json();
      const replyText =
        json?.answer ||
        json?.response ||
        json?.data?.answer ||
        `For ${subject} (${department}): Start with the statutory text, contrast the pre-2023 and post-2023 positions, and pose a 2-minute hypothetical bench query to test ratio isolation.`;

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `[Offline Faculty Guide — ${subject}] Frame your lecture around: (1) Statutory Provision & Elements, (2) Controlling Precedent (Ratio Decidendi), (3) Common Student Misconception, and (4) 3-Minute Principle-Fact Cold Call.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const quickChips = [
    { label: "Analogy", prompt: "Give me a memorable courtroom analogy to explain this doctrine to first-year LL.B students." },
    { label: "Misconceptions", prompt: "What are the top 3 student misconceptions in this subject and how do I correct them?" },
    { label: "Formative Check", prompt: "Generate 2 rapid cold-call diagnostic questions with brief model answers." },
    { label: "5-Min Moot Drill", prompt: "Design a 5-minute mini oral advocacy problem for my live cohort." },
  ];

  return (
    <>
      {/* Persistent Bottom-Right Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 px-4 py-2.5 rounded-full bg-zinc-950 hover:bg-black text-white border border-amber-500/50 shadow-2xl flex items-center gap-2.5 cursor-pointer transition-all hover:scale-105"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-extrabold tracking-tight">Faculty AI</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-black uppercase">
            Clear Doubts
          </span>
        </button>
      )}

      {/* Slide-Over Copilot Drawer */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] max-w-md h-[540px] rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          <div className="p-4 bg-zinc-950 text-white border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black">Faculty AI Co-Counsel</h4>
                <p className="text-[10px] font-mono text-amber-400">
                  Online • Pedagogy &amp; Statutory Doubts
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {quickChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => sendPrompt(chip.prompt)}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap cursor-pointer transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === "faculty" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    m.sender === "faculty"
                      ? "bg-amber-500 text-black font-semibold rounded-br-xs"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-bl-xs"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] font-mono text-zinc-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}
            {isThinking && (
              <div className="text-xs font-mono text-amber-500 animate-pulse">
                Synthesizing pedagogical &amp; statutory brief...
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendPrompt(input);
            }}
            className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 bg-white dark:bg-zinc-950"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for analogies, case citations, or drills..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={isThinking}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black cursor-pointer transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
