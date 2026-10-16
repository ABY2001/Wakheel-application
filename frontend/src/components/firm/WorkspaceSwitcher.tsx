"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Building2,
  Scale,
  Check,
  Plus,
  ArrowRight,
  ShieldCheck,
  Users,
} from "lucide-react";
import { FirmProfile, ActiveWorkspace } from "./firmTypes";

interface WorkspaceSwitcherProps {
  activeWorkspace: ActiveWorkspace;
  firms: FirmProfile[];
  advocateName?: string;
  onSelectWorkspace: (workspace: ActiveWorkspace) => void;
  onOpenCreateFirm?: () => void;
  onOpenJoinFirm: () => void;
  variant?: "header" | "sidebar";
}

export function WorkspaceSwitcher({
  activeWorkspace,
  firms,
  advocateName = "Adv. Sarah Jenkins",
  onSelectWorkspace,
  onOpenCreateFirm,
  onOpenJoinFirm,
  variant = "header",
}: WorkspaceSwitcherProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeFirm =
    activeWorkspace.type === "firm"
      ? firms.find((f) => f.id === activeWorkspace.firmId) || firms[0]
      : null;

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Switcher Trigger Button */}
      {variant === "header" ? (
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          title="Switch Practice Workspace"
        >
          {activeWorkspace.type === "firm" && activeFirm ? (
            <>
              <div className="w-4 h-4 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                <Building2 className="w-2.5 h-2.5" />
              </div>
              <span className="truncate max-w-[160px] text-black dark:text-white">
                {activeFirm.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {activeFirm.userRoleInFirm}
              </span>
            </>
          ) : (
            <>
              <div className="w-4 h-4 rounded-full bg-zinc-200 text-black dark:bg-zinc-800 dark:text-white flex items-center justify-center shrink-0">
                <Scale className="w-2.5 h-2.5" />
              </div>
              <span className="truncate max-w-[160px] text-black dark:text-white">
                Solo Chamber
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                Advocate
              </span>
            </>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      ) : (
        /* Sidebar Variant */
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
              {activeWorkspace.type === "firm" ? (
                <Building2 className="w-3.5 h-3.5" />
              ) : (
                <Scale className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-black dark:text-white truncate">
                {activeWorkspace.type === "firm" && activeFirm
                  ? activeFirm.name
                  : "Solo Chamber"}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {activeWorkspace.type === "firm" && activeFirm
                  ? `${activeFirm.userRoleInFirm} • ${activeFirm.entityType}`
                  : "Independent Advocate"}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl p-2 z-50 text-black dark:text-white animate-in fade-in slide-in-from-top-1">
          {/* Section: Solo Chamber */}
          <div className="space-y-1 pb-2 border-b border-zinc-100 dark:border-zinc-900">
            <span className="px-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
              Personal Practice
            </span>
            <button
              type="button"
              onClick={() => {
                onSelectWorkspace({ type: "chamber" });
                setDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeWorkspace.type === "chamber"
                  ? "bg-zinc-100 dark:bg-zinc-900 font-bold"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center shrink-0">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs block font-semibold">My Chamber Practice</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {advocateName}
                  </span>
                </div>
              </div>
              {activeWorkspace.type === "chamber" && (
                <Check className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
              )}
            </button>
          </div>

          {/* Section: Law Firms */}
          <div className="py-2 space-y-1 border-b border-zinc-100 dark:border-zinc-900">
            <span className="px-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
              Joined Law Firms ({firms.length})
            </span>
            {firms.length === 0 ? (
              <p className="px-2 py-1 text-[11px] text-zinc-400">
                You haven&apos;t joined any law firms yet.
              </p>
            ) : (
              firms.map((firm) => {
                const isSelected =
                  activeWorkspace.type === "firm" && activeWorkspace.firmId === firm.id;
                return (
                  <button
                    key={firm.id}
                    type="button"
                    onClick={() => {
                      onSelectWorkspace({ type: "firm", firmId: firm.id });
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-zinc-100 dark:bg-zinc-900 font-bold"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0 font-bold text-xs">
                        {firm.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <span className="text-xs block font-semibold truncate">
                          {firm.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono truncate block">
                          {firm.userRoleInFirm} • {firm.headquartersCity}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-black dark:text-white shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Section: Action Buttons */}
          <div className="pt-2 space-y-1">
            {onOpenCreateFirm && (
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenCreateFirm();
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register New Law Firm</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                onOpenJoinFirm();
              }}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Join via Invite Code</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
