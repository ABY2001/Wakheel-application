"use client";

import React, { useState } from "react";
import {
  Building2,
  Scale,
  Users,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FirmProfile, FirmMember } from "./firmTypes";

interface FirmOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (firm: FirmProfile) => void;
  currentUserFullName?: string;
  currentUserEmail?: string;
}

const AVAILABLE_PRACTICE_GROUPS = [
  "Commercial Disputes & Arbitration",
  "Corporate & M&A / Advisory",
  "Insolvency & Bankruptcy (NCLT / IBC)",
  "Intellectual Property, Trademarks & Patents",
  "Criminal Defense & BNS / BNSS Trials",
  "Constitutional Law & Writ Petitions",
  "Real Estate, Title Search & Conveyance",
  "Taxation, GST & Customs Regulatory",
  "Banking, Finance & Debt Recovery (DRT)",
  "Labor & Employment Laws",
];

const ENTITY_TYPES: Array<FirmProfile["entityType"]> = [
  "LLP",
  "Partnership",
  "Chambers Group",
  "Private Legal Corp",
];

export function FirmOnboardingModal({
  isOpen,
  onClose,
  onComplete,
  currentUserFullName = "Adv. Sarah Jenkins",
  currentUserEmail = "advocate@inworth.law",
}: FirmOnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [firmName, setFirmName] = useState("");
  const [entityType, setEntityType] = useState<FirmProfile["entityType"]>("LLP");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [headquartersCity, setHeadquartersCity] = useState("New Delhi");
  const [jurisdiction, setJurisdiction] = useState("High Court of Delhi & Supreme Court");

  // Practice Groups
  const [practiceGroups, setPracticeGroups] = useState<string[]>([
    "Commercial Disputes & Arbitration",
    "Corporate & M&A / Advisory",
  ]);

  // Invites
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<FirmMember["role"]>("Partner");
  const [invitePracticeGroup, setInvitePracticeGroup] = useState(
    "Commercial Disputes & Arbitration"
  );
  const [invitedMembers, setInvitedMembers] = useState<Array<Omit<FirmMember, "id" | "joinedAt">>>([]);

  // Billing
  const [currency, setCurrency] = useState("INR");
  const [partnerRate, setPartnerRate] = useState(15000);
  const [associateRate, setAssociateRate] = useState(5000);
  const [gstNumber, setGstNumber] = useState("");

  const [copiedCode, setCopiedCode] = useState(false);
  const [generatedInviteCode] = useState(() => {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const randLetters = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
    const randNum = Math.floor(1000 + Math.random() * 9000);
    return `${randLetters}-${randNum}`;
  });

  if (!isOpen) return null;

  const togglePracticeGroup = (group: string) => {
    setPracticeGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const handleAddInvite = () => {
    if (!inviteEmail.trim() || !inviteName.trim()) return;
    setInvitedMembers((prev) => [
      ...prev,
      {
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
        practiceGroup: invitePracticeGroup,
      },
    ]);
    setInviteName("");
    setInviteEmail("");
  };

  const handleRemoveInvite = (idx: number) => {
    setInvitedMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCopyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(generatedInviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSubmit = () => {
    const firmId = `firm-${Date.now()}`;
    const newMembers: FirmMember[] = [
      {
        id: `mem-${Date.now()}-mp`,
        name: currentUserFullName,
        email: currentUserEmail,
        role: "Managing Partner",
        practiceGroup: practiceGroups[0] || "General Practice",
        joinedAt: new Date().toISOString().split("T")[0],
      },
      ...invitedMembers.map((inv, idx) => ({
        id: `mem-${Date.now()}-${idx}`,
        name: inv.name,
        email: inv.email,
        role: inv.role,
        practiceGroup: inv.practiceGroup,
        joinedAt: new Date().toISOString().split("T")[0],
      })),
    ];

    const newFirm: FirmProfile = {
      id: firmId,
      name: firmName.trim() || "Chambers & Partners LLP",
      entityType,
      registrationNumber: registrationNumber.trim() || "LLPIN-REG-2026",
      headquartersCity,
      jurisdiction,
      managingPartnerName: currentUserFullName,
      managingPartnerEmail: currentUserEmail,
      userRoleInFirm: "Managing Partner",
      practiceGroups,
      inviteCode: generatedInviteCode,
      billingDefaults: {
        currency,
        partnerRate,
        associateRate,
        gstNumber: gstNumber.trim() || undefined,
      },
      members: newMembers,
      createdAt: new Date().toISOString().split("T")[0],
    };

    try {
      const stored = localStorage.getItem("wakheel_user_firms");
      const firms: FirmProfile[] = stored ? JSON.parse(stored) : [];
      firms.push(newFirm);
      localStorage.setItem("wakheel_user_firms", JSON.stringify(firms));
      localStorage.setItem(
        "wakheel_active_workspace",
        JSON.stringify({ type: "firm", firmId: newFirm.id })
      );
    } catch {
      // ignore storage error
    }

    onComplete(newFirm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto text-black dark:text-white font-sans">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-black dark:text-white">
                Register &amp; Onboard Law Firm
              </h2>
              <p className="text-xs text-zinc-500">
                Setup your multi-advocate firm, practice departments, and team seats.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between gap-2 px-1">
          {[
            { stepNum: 1, label: "Identity", icon: Building2 },
            { stepNum: 2, label: "Practice Groups", icon: Scale },
            { stepNum: 3, label: "Team & Seats", icon: Users },
            { stepNum: 4, label: "Billing & Review", icon: CreditCard },
          ].map((item) => {
            const Icon = item.icon;
            const isCompleted = step > item.stepNum;
            const isCurrent = step === item.stepNum;
            return (
              <button
                key={item.stepNum}
                onClick={() => {
                  if (item.stepNum < step) setStep(item.stepNum as any);
                }}
                disabled={item.stepNum > step}
                className={`flex-1 flex items-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left ${
                  isCurrent
                    ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : isCompleted
                    ? "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white cursor-pointer"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-400 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="shrink-0">
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <div className="truncate">
                  <span className="text-[10px] uppercase font-mono block opacity-70">
                    Step {item.stepNum}
                  </span>
                  <span className="truncate block">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            STEP 1: Firm Legal Identity
        ========================================================================= */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                Firm Legal Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Sood & Partners LLP, Chambers of Adv. Rajesh Gupta"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-semibold focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  Entity Legal Form
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value as any)}
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold"
                >
                  {ENTITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === "LLP" ? "Limited Liability Partnership (LLP)" : t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  Registration / LLPIN Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. LLPIN-AAR-4192 / State Bar Reg"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  Headquarters City
                </label>
                <input
                  type="text"
                  placeholder="e.g. New Delhi, Mumbai, Bengaluru"
                  value={headquartersCity}
                  onChange={(e) => setHeadquartersCity(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  Primary Jurisdiction / Bench
                </label>
                <input
                  type="text"
                  placeholder="e.g. High Court of Delhi & Supreme Court"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Managing Partner Identification */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center">
                  MP
                </div>
                <div>
                  <span className="text-xs font-bold block">{currentUserFullName}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Managing Partner • Creator &amp; Administrator
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Signatory
              </span>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: Practice Groups & Departments
        ========================================================================= */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h3 className="text-sm font-bold text-black dark:text-white">
                Select Active Practice Groups
              </h3>
              <p className="text-xs text-zinc-500">
                These departments will organize matter pipelines, causelist allocations, and team rosters.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_PRACTICE_GROUPS.map((group) => {
                const isSelected = practiceGroups.includes(group);
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => togglePracticeGroup(group)}
                    className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md mt-0.5 border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-white text-black dark:bg-black dark:text-white border-transparent"
                          : "border-zinc-400"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 font-bold" />}
                    </div>
                    <span className="text-xs leading-snug">{group}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: Team Roster & Invite Seats
        ========================================================================= */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in">
            {/* Firm Invite Code Box */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                  Firm Direct Join Code
                </span>
                <span className="text-lg font-mono font-bold tracking-widest text-black dark:text-white">
                  {generatedInviteCode}
                </span>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Share this code with partners and associates to let them join this firm instantly.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors shrink-0"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>

            {/* Invite Form */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 bg-white dark:bg-black">
              <span className="text-xs font-bold block">Invite Counsel / Team Member</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <input
                  type="text"
                  placeholder="Full name (e.g. Adv. Rajiv)"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="sm:col-span-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Colleague email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="sm:col-span-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs focus:outline-none"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="sm:col-span-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold"
                >
                  <option value="Partner">Partner</option>
                  <option value="Senior Associate">Senior Associate</option>
                  <option value="Associate">Associate</option>
                  <option value="Paralegal">Paralegal</option>
                  <option value="Court Clerk">Court Clerk</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddInvite}
                  className="sm:col-span-1 py-2.5 px-4 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Seat</span>
                </button>
              </div>
            </div>

            {/* Invited Members List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">
                Team Roster ({invitedMembers.length + 1} Seats)
              </span>

              {/* Managing Partner Seat */}
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold">{currentUserFullName}</span>
                  <span className="text-zinc-400 font-mono text-[10px]">({currentUserEmail})</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black text-white dark:bg-white dark:text-black">
                  Managing Partner
                </span>
              </div>

              {/* Invited colleagues */}
              {invitedMembers.map((inv, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold">{inv.name}</span>
                    <span className="text-zinc-400 font-mono text-[10px]">({inv.email})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      {inv.role}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInvite(idx)}
                      className="p-1 rounded text-zinc-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 4: Billing Defaults & Final Review
        ========================================================================= */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  Billing Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold"
                >
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="GBP">£ GBP (British Pound)</option>
                  <option value="AED">AED (UAE Dirham)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  Partner Rate (hr)
                </label>
                <input
                  type="number"
                  value={partnerRate}
                  onChange={(e) => setPartnerRate(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  Associate Rate (hr)
                </label>
                <input
                  type="number"
                  value={associateRate}
                  onChange={(e) => setAssociateRate(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* Dossier Preview Card */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h4 className="text-base font-bold text-black dark:text-white">
                    {firmName || "Chambers & Partners LLP"}
                  </h4>
                  <p className="text-xs text-zinc-500 font-mono">
                    {entityType} • {registrationNumber || "Unregistered"} • {headquartersCity}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-black text-white dark:bg-white dark:text-black">
                  Ready to Launch
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 font-mono block">Managing Partner</span>
                  <span className="font-bold">{currentUserFullName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-mono block">Practice Groups</span>
                  <span className="font-bold">{practiceGroups.length} Groups</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-mono block">Active Seats</span>
                  <span className="font-bold">{invitedMembers.length + 1} Lawyers</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-mono block">Invite Code</span>
                  <span className="font-mono font-bold">{generatedInviteCode}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((s) => (s > 1 ? ((s - 1) as any) : s))}
            className={`px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-bold flex items-center gap-1.5 transition-all ${
              step === 1 ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {step < 4 ? (
            <button
              type="button"
              disabled={step === 1 && !firmName.trim()}
              onClick={() => setStep((s) => (s < 4 ? ((s + 1) as any) : s))}
              className={`px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all ${
                step === 1 && !firmName.trim()
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-200"
              }`}
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Activate Firm Workspace</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
