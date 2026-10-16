"use client";

import React, { useState } from "react";
import {
  Building2,
  Search,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { FirmProfile, DEFAULT_DEMO_FIRM } from "./firmTypes";

interface JoinFirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined: (firm: FirmProfile) => void;
  currentUserFullName?: string;
  currentUserEmail?: string;
}

export function JoinFirmModal({
  isOpen,
  onClose,
  onJoined,
  currentUserFullName = "Adv. Sarah Jenkins",
  currentUserEmail = "advocate@inworth.law",
}: JoinFirmModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [verifiedFirm, setVerifiedFirm] = useState<FirmProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<FirmProfile["userRoleInFirm"]>("Associate");
  const [errorMsg, setErrorMsg] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerify = () => {
    setErrorMsg("");
    const cleaned = inviteCode.trim().toUpperCase();
    if (!cleaned) {
      setErrorMsg("Please enter a valid Firm Invite Code");
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      // Check in user stored firms or default demo firm
      let found: FirmProfile | null = null;
      try {
        const stored = localStorage.getItem("wakheel_user_firms");
        const firms: FirmProfile[] = stored ? JSON.parse(stored) : [];
        found =
          firms.find((f) => f.inviteCode.toUpperCase() === cleaned) ||
          (DEFAULT_DEMO_FIRM.inviteCode.toUpperCase() === cleaned ? DEFAULT_DEMO_FIRM : null);
      } catch {
        if (DEFAULT_DEMO_FIRM.inviteCode.toUpperCase() === cleaned) {
          found = DEFAULT_DEMO_FIRM;
        }
      }

      if (found) {
        setVerifiedFirm(found);
      } else {
        // Fallback simulate finding a verified partner firm
        setVerifiedFirm({
          id: `firm-joined-${Date.now()}`,
          name: "Apex Legal & Partners LLP",
          entityType: "LLP",
          registrationNumber: "LLPIN-APX-8109",
          headquartersCity: "New Delhi",
          jurisdiction: "High Court of Delhi",
          managingPartnerName: "Adv. Vikram Singhania",
          managingPartnerEmail: "vikram@apexlegal.in",
          userRoleInFirm: selectedRole,
          practiceGroups: [
            "Commercial Disputes & Arbitration",
            "Insolvency & Bankruptcy (NCLT)",
          ],
          inviteCode: cleaned,
          billingDefaults: {
            currency: "INR",
            partnerRate: 14000,
            associateRate: 4500,
          },
          members: [],
          createdAt: "2021-03-10",
        });
      }
    }, 400);
  };

  const handleConfirmJoin = () => {
    if (!verifiedFirm) return;

    const firmWithUserRole: FirmProfile = {
      ...verifiedFirm,
      userRoleInFirm: selectedRole,
      members: [
        ...verifiedFirm.members.filter((m) => m.email !== currentUserEmail),
        {
          id: `mem-${Date.now()}`,
          name: currentUserFullName,
          email: currentUserEmail,
          role: selectedRole,
          practiceGroup: verifiedFirm.practiceGroups[0] || "General Litigation",
          joinedAt: new Date().toISOString().split("T")[0],
        },
      ],
    };

    try {
      const stored = localStorage.getItem("wakheel_user_firms");
      const firms: FirmProfile[] = stored ? JSON.parse(stored) : [];
      const updatedFirms = [
        ...firms.filter((f) => f.id !== firmWithUserRole.id),
        firmWithUserRole,
      ];
      localStorage.setItem("wakheel_user_firms", JSON.stringify(updatedFirms));
      localStorage.setItem(
        "wakheel_active_workspace",
        JSON.stringify({ type: "firm", firmId: firmWithUserRole.id })
      );
    } catch {
      // ignore
    }

    onJoined(firmWithUserRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5 text-black dark:text-white font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-black dark:text-white">
                Join a Law Firm
              </h3>
              <p className="text-xs text-zinc-500">
                Connect your account to your law firm&apos;s Wakheel practice roster.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invite Code Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
            Enter Firm Invite Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. SOOD-2026 or APEX-8109"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVerify();
              }}
              className="flex-1 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-mono font-bold uppercase focus:outline-none focus:border-black dark:focus:border-white"
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying}
              className="px-5 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isVerifying ? "Verifying..." : "Verify"}</span>
            </button>
          </div>
          <p className="text-[11px] text-zinc-400">
            Tip: Try demo code <span className="font-mono font-bold text-black dark:text-white">SOOD-2026</span>
          </p>
          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-red-500 pt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Verified Firm Card */}
        {verifiedFirm && (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 animate-in fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                  Firm Found • Verified
                </span>
                <h4 className="text-sm font-bold text-black dark:text-white mt-0.5">
                  {verifiedFirm.name}
                </h4>
                <p className="text-xs text-zinc-500 font-mono">
                  {verifiedFirm.entityType} • {verifiedFirm.jurisdiction}
                </p>
              </div>
              <span className="p-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <label className="text-xs font-bold block">Select Your Role in the Firm:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-bold"
              >
                <option value="Associate">Associate Counsel</option>
                <option value="Senior Associate">Senior Associate</option>
                <option value="Partner">Partner</option>
                <option value="Paralegal">Paralegal / Researcher</option>
              </select>
            </div>
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-bold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!verifiedFirm}
            onClick={handleConfirmJoin}
            className={`px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all ${
              !verifiedFirm
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-200"
            }`}
          >
            <span>Confirm &amp; Join Firm</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
