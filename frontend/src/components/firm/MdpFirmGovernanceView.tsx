"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileCheck,
  Building2,
  Award,
  KeyRound,
  FileText,
  Clock,
  ArrowRight,
  UserCheck,
  Eye,
  RefreshCw,
  Plus,
  Send,
  X,
  Sparkles,
  ExternalLink,
  HelpCircle,
  FileBadge,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  mdpGovernanceApi,
  MdpFirmProfile,
  MdpTeamMember,
  RegulatoryLockRule,
  DelegatedTask,
  DualSignOffGate,
  RegulatoryCheckResult,
} from "@/lib/mdpGovernanceApi";
import { useTheme } from "@/context/ThemeContext";

interface MdpFirmGovernanceViewProps {
  currentRole?: string;
  onRoleChange?: (newRole: string) => void;
}

export function MdpFirmGovernanceView({
  currentRole: propRole,
  onRoleChange,
}: MdpFirmGovernanceViewProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // State
  const [governance, setGovernance] = useState<MdpFirmProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"roster" | "rules" | "delegation" | "dualgates">("roster");

  // Active Simulated User
  const [selectedMemberId, setSelectedMemberId] = useState<string>("mbr-cs-rajesh");

  // Rule Test Simulator State
  const [testedAction, setTestedAction] = useState<string>("FORM_3CD_TAX_AUDIT_CERTIFICATION");
  const [checkResult, setCheckResult] = useState<RegulatoryCheckResult | null>(null);
  const [checkingRule, setCheckingRule] = useState(false);

  // Review Task Modal / State
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<DelegatedTask | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // New Delegated Task Modal
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskModule, setNewTaskModule] = useState("ROC_FILING");
  const [newTaskClient, setNewTaskClient] = useState("CyberCorp Technologies Pvt Ltd");
  const [newTaskTraineeId, setNewTaskTraineeId] = useState("mbr-trainee-pooja");
  const [newTaskTraineeNotes, setNewTaskTraineeNotes] = useState("");

  // Signing Gate State
  const [signingGateId, setSigningGateId] = useState<string | null>(null);

  // Fetch Governance Data
  const loadGovernanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mdpGovernanceApi.getFirmGovernance();
      if (res && res.governance) {
        setGovernance(res.governance);
      }
    } catch (err: any) {
      console.error("Failed to load MDP firm governance:", err);
      setError(err.message || "Failed to load MDP governance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGovernanceData();
  }, []);

  // Currently active member details
  const activeMember = useMemo(() => {
    if (!governance || !governance.members) return null;
    return governance.members.find((m) => m.memberId === selectedMemberId) || governance.members[0];
  }, [governance, selectedMemberId]);

  // When simulated member changes, notify parent if needed and re-check active rule
  const handleMemberSelect = (memberId: string) => {
    setSelectedMemberId(memberId);
    const member = governance?.members.find((m) => m.memberId === memberId);
    if (member && onRoleChange) {
      onRoleChange(member.primaryRole);
    }
  };

  // Evaluate rule whenever testedAction or activeMember changes
  useEffect(() => {
    if (!activeMember || !testedAction) return;

    let isMounted = true;
    const runCheck = async () => {
      try {
        setCheckingRule(true);
        const res = await mdpGovernanceApi.checkRegulatoryLock({
          statutoryAction: testedAction,
          memberInstitute: activeMember.professionalInstitute,
          memberRole: activeMember.primaryRole,
        });
        if (isMounted) {
          setCheckResult(res);
        }
      } catch (err) {
        console.error("Regulatory check error:", err);
      } finally {
        if (isMounted) setCheckingRule(false);
      }
    };

    runCheck();
    return () => {
      isMounted = false;
    };
  }, [testedAction, activeMember]);

  // Handle Partner Review of Trainee Task
  const handleReviewSubmit = async (status: "PARTNER_APPROVED" | "REVISION_REQUESTED") => {
    if (!selectedTaskForReview || !activeMember) return;
    try {
      setSubmittingReview(true);
      const res = await mdpGovernanceApi.reviewDelegatedTask(selectedTaskForReview.taskId, {
        status,
        partnerReviewNotes: reviewNotes || (status === "PARTNER_APPROVED" ? "Approved for filing." : "Revisions needed."),
        reviewingPartner: {
          memberId: activeMember.memberId,
          name: activeMember.name,
          role: activeMember.primaryRole,
        },
      });

      if (res && res.task && governance) {
        const updatedTasks = governance.delegatedTasks.map((t) =>
          t.taskId === res.task.taskId ? res.task : t
        );
        setGovernance({ ...governance, delegatedTasks: updatedTasks });
        setSelectedTaskForReview(null);
        setReviewNotes("");
      }
    } catch (err: any) {
      console.error("Failed to review task:", err);
      alert("Error reviewing task: " + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Dual Sign-Off Execution
  const handleSignGate = async (gateId: string, role: "CS" | "CA") => {
    if (!activeMember) return;
    try {
      setSigningGateId(gateId);
      const res = await mdpGovernanceApi.signDualSignOffGate(gateId, {
        role,
        signatoryName: activeMember.name,
        membershipNumber: activeMember.registrationNumber,
        udin: role === "CA" ? `26${Math.floor(10000000 + Math.random() * 90000000)}` : undefined,
      });

      if (res && res.gate && governance) {
        const updatedGates = governance.dualSignOffGates.map((g) =>
          g.gateId === res.gate.gateId ? res.gate : g
        );
        setGovernance({ ...governance, dualSignOffGates: updatedGates });
      }
    } catch (err: any) {
      console.error("Dual sign gate error:", err);
      alert("Error signing gate: " + err.message);
    } finally {
      setSigningGateId(null);
    }
  };

  // Handle Creating a new task for trainee
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activeMember || !governance) return;

    const trainee = governance.members.find((m) => m.memberId === newTaskTraineeId);
    try {
      const res = await mdpGovernanceApi.createDelegatedTask({
        title: newTaskTitle,
        clientName: newTaskClient,
        module: newTaskModule,
        assignedTrainee: trainee
          ? { memberId: trainee.memberId, name: trainee.name, role: trainee.primaryRole }
          : { memberId: "mbr-trainee-pooja", name: "Pooja Hegde", role: "CS Trainee" },
        reviewingPartner: {
          memberId: activeMember.memberId,
          name: activeMember.name,
          role: activeMember.primaryRole,
        },
        traineeNotes: newTaskTraineeNotes,
      });

      if (res && res.task) {
        setGovernance({
          ...governance,
          delegatedTasks: [res.task, ...governance.delegatedTasks],
        });
        setIsNewTaskModalOpen(false);
        setNewTaskTitle("");
        setNewTaskTraineeNotes("");
      }
    } catch (err: any) {
      console.error("Failed to create delegated task:", err);
      alert("Error creating task: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-zinc-500" />
        <span className="text-sm font-mono text-zinc-500">
          Loading MDP Firm Governance, Roster & Regulatory Locks...
        </span>
      </div>
    );
  }

  if (error || !governance) {
    return (
      <div className="p-8 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <div className="font-bold text-sm text-rose-600">Failed to load MDP Firm Governance</div>
        <p className="text-xs text-zinc-500">{error}</p>
        <button
          onClick={loadGovernanceData}
          className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold rounded-xl cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ==================================================================== */}
      {/* TOP BANNER & INTERACTIVE ROLE SWITCHER */}
      {/* ==================================================================== */}
      <div
        className="p-5 rounded-3xl border-2 transition-all shadow-sm space-y-4"
        style={{
          backgroundColor: isDark ? "#09090b" : "#ffffff",
          borderColor: isDark ? "#27272a" : "#e4e4e7",
          color: isDark ? "#ffffff" : "#09090b",
        }}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black tracking-widest uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                ICSI • ICAI • BCI Multi-Disciplinary Practice (MDP)
              </span>
              <span className="text-xs font-mono text-zinc-400">|</span>
              <span className="text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400">
                {governance.registrationCinOrLlpin}
              </span>
            </div>
            <h1 className="text-xl font-black tracking-tight">{governance.firmName}</h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans max-w-2xl">
              Unified governance partition enforcing strict statutory codes of conduct, 4-Eyes trainee delegation,
              and dual CS-CA attestation gates under Section 44AB ITA 1961 & Section 204 CA 2013.
            </p>
          </div>

          {/* Interactive Role Switcher Pill Box */}
          <div
            className="p-3 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto"
            style={{
              backgroundColor: isDark ? "#18181b" : "#f4f4f5",
              borderColor: isDark ? "#27272a" : "#e4e4e7",
            }}
          >
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                <span>Simulated Active User:</span>
              </div>
              <div className="font-mono text-xs font-black">
                {activeMember?.name}{" "}
                <span className="text-zinc-400">({activeMember?.registrationNumber})</span>
              </div>
            </div>

            <select
              value={selectedMemberId}
              onChange={(e) => handleMemberSelect(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer w-full sm:w-auto"
              style={{
                backgroundColor: isDark ? "#09090b" : "#ffffff",
                color: isDark ? "#ffffff" : "#09090b",
                borderColor: isDark ? "#3f3f46" : "#d4d4d8",
              }}
            >
              {governance.members.map((member) => (
                <option key={member.memberId} value={member.memberId}>
                  {member.name} — {member.primaryRole.replace(/_/g, " ").toUpperCase()} ({member.professionalInstitute})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Member Authority Badges Strip */}
        {activeMember && (
          <div
            className="pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
            style={{ borderColor: isDark ? "#27272a" : "#f4f4f5" }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-zinc-500 text-[11px]">Institute Credential:</span>
              <span
                className="px-2 py-0.5 rounded-md font-bold text-[11px]"
                style={
                  activeMember.professionalInstitute === "ICSI"
                    ? { backgroundColor: "#1e1b4b", color: "#c7d2fe" }
                    : activeMember.professionalInstitute === "ICAI"
                    ? { backgroundColor: "#451a03", color: "#fde68a" }
                    : activeMember.professionalInstitute === "BCI"
                    ? { backgroundColor: "#1e3a8a", color: "#bfdbfe" }
                    : { backgroundColor: "#3f3f46", color: "#f4f4f5" }
                }
              >
                {activeMember.professionalInstitute} • {activeMember.registrationNumber}
              </span>

              {activeMember.certificateOfPractice && (
                <span className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px]">
                  CoP: {activeMember.certificateOfPractice}
                </span>
              )}

              {activeMember.udinAuthority && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-[11px]">
                  UDIN Generator Authorized
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-[11px]">DSC Signing Authority:</span>
              <span
                className="px-2.5 py-0.5 rounded-full font-black text-[10px] tracking-wider uppercase border"
                style={
                  activeMember.signingAuthorityLevel === "STATUTORY_SIGNING_PARTNER"
                    ? { backgroundColor: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0" }
                    : activeMember.signingAuthorityLevel === "TECHNICAL_REVIEWER"
                    ? { backgroundColor: "#eff6ff", color: "#1e40af", borderColor: "#bfdbfe" }
                    : { backgroundColor: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" }
                }
              >
                {activeMember.signingAuthorityLevel === "PREPARATION_ONLY_LOCKED"
                  ? "🔒 Locked (Trainee Prep Only)"
                  : activeMember.signingAuthorityLevel === "TECHNICAL_REVIEWER"
                  ? "👁 Technical Reviewer"
                  : "✓ Statutory Signing Partner"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* SUMMARY STATS TILES */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          className="p-4 rounded-2xl border space-y-1"
          style={{
            backgroundColor: isDark ? "#09090b" : "#ffffff",
            borderColor: isDark ? "#27272a" : "#e4e4e7",
          }}
        >
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">MDP Practice Roster</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black font-mono">
            {governance.members?.length || 0}
            <span className="text-xs text-zinc-500 font-sans font-normal ml-1">Attorneys & Partners</span>
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">ICSI (3) • ICAI (3) • BCI (1)</div>
        </div>

        <div
          className="p-4 rounded-2xl border space-y-1"
          style={{
            backgroundColor: isDark ? "#09090b" : "#ffffff",
            borderColor: isDark ? "#27272a" : "#e4e4e7",
          }}
        >
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Regulatory Lock Rules</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black font-mono">
            {governance.regulatoryRules?.length || 0}
            <span className="text-xs text-zinc-500 font-sans font-normal ml-1">Enforced Acts</span>
          </div>
          <div className="text-[10px] text-emerald-500 font-mono">100% Exclusivity Guard Active</div>
        </div>

        <div
          className="p-4 rounded-2xl border space-y-1"
          style={{
            backgroundColor: isDark ? "#09090b" : "#ffffff",
            borderColor: isDark ? "#27272a" : "#e4e4e7",
          }}
        >
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">4-Eyes Trainee Queue</span>
            <Eye className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono">
            {governance.delegatedTasks?.filter((t) => t.status === "SUBMITTED_FOR_REVIEW").length || 0}
            <span className="text-xs text-zinc-500 font-sans font-normal ml-1">Pending Review</span>
          </div>
          <div className="text-[10px] text-amber-500 font-mono">
            {governance.delegatedTasks?.filter((t) => t.status === "PARTNER_APPROVED").length || 0} Approved for DSC
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border space-y-1"
          style={{
            backgroundColor: isDark ? "#09090b" : "#ffffff",
            borderColor: isDark ? "#27272a" : "#e4e4e7",
          }}
        >
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Dual Sign-Off Gates</span>
            <Lock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black font-mono">
            {governance.dualSignOffGates?.length || 0}
            <span className="text-xs text-zinc-500 font-sans font-normal ml-1">High-Stakes Gates</span>
          </div>
          <div className="text-[10px] text-indigo-500 font-mono">
            {governance.dualSignOffGates?.filter((g) => g.overallStatus === "FULLY_CERTIFIED_RELEASED").length || 0} Released Certificates
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TABS NAVIGATION */}
      {/* ==================================================================== */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-3" style={{ borderColor: isDark ? "#27272a" : "#e4e4e7" }}>
        {[
          { id: "roster", label: "Team Roster & Institute Credentials", icon: Users, badge: governance.members?.length },
          { id: "rules", label: "Regulatory Code Lock Matrix", icon: ShieldAlert, badge: governance.regulatoryRules?.length },
          { id: "delegation", label: "Article Trainee Delegation & Four-Eyes Gate", icon: Eye, badge: governance.delegatedTasks?.length },
          { id: "dualgates", label: "Dual Sign-Off Gate Engine", icon: Lock, badge: governance.dualSignOffGates?.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border shadow-xs"
              style={
                isActive
                  ? isDark
                    ? { backgroundColor: "#ffffff", color: "#09090b", borderColor: "#ffffff" }
                    : { backgroundColor: "#09090b", color: "#ffffff", borderColor: "#09090b" }
                  : isDark
                  ? { backgroundColor: "#18181b", color: "#a1a1aa", borderColor: "#27272a" }
                  : { backgroundColor: "#f4f4f5", color: "#27272a", borderColor: "#e4e4e7" }
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                style={
                  isActive
                    ? isDark
                      ? { backgroundColor: "#e4e4e7", color: "#09090b" }
                      : { backgroundColor: "#27272a", color: "#ffffff" }
                    : isDark
                    ? { backgroundColor: "#27272a", color: "#a1a1aa" }
                    : { backgroundColor: "#e4e4e7", color: "#52525b" }
                }
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: TEAM ROSTER & CREDENTIALS */}
      {/* ==================================================================== */}
      {activeTab === "roster" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Multi-Disciplinary Professional Roster (ICSI, ICAI & Bar Council of India)
              </h2>
              <p className="text-xs text-zinc-500 font-sans">
                Statutory partitioning assigns exact authority boundaries, preventing unauthorized cross-signing.
              </p>
            </div>
            <div className="text-xs font-mono text-zinc-400">Click member card to simulate their role</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {governance.members?.map((member) => {
              const isSelected = member.memberId === selectedMemberId;
              const isPartner = member.signingAuthorityLevel === "STATUTORY_SIGNING_PARTNER";
              const isReviewer = member.signingAuthorityLevel === "TECHNICAL_REVIEWER";
              const isTrainee = member.signingAuthorityLevel === "PREPARATION_ONLY_LOCKED";

              return (
                <div
                  key={member.memberId}
                  onClick={() => handleMemberSelect(member.memberId)}
                  className={`p-4 rounded-2xl border-2 transition-all space-y-3 cursor-pointer relative ${
                    isSelected ? "shadow-lg scale-101" : "shadow-xs hover:border-zinc-400"
                  }`}
                  style={{
                    backgroundColor: isDark ? (isSelected ? "#18181b" : "#09090b") : isSelected ? "#f4f4f5" : "#ffffff",
                    borderColor: isSelected
                      ? isDark
                        ? "#a1a1aa"
                        : "#09090b"
                      : isDark
                      ? "#27272a"
                      : "#e4e4e7",
                    color: isDark ? "#ffffff" : "#09090b",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="font-black text-sm flex items-center gap-1.5">
                        <span>{member.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 font-mono truncate">{member.email}</div>
                    </div>
                    <span
                      className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase"
                      style={
                        member.professionalInstitute === "ICSI"
                          ? { backgroundColor: "#1e1b4b", color: "#c7d2fe" }
                          : member.professionalInstitute === "ICAI"
                          ? { backgroundColor: "#451a03", color: "#fde68a" }
                          : member.professionalInstitute === "BCI"
                          ? { backgroundColor: "#1e3a8a", color: "#bfdbfe" }
                          : { backgroundColor: "#27272a", color: "#a1a1aa" }
                      }
                    >
                      {member.professionalInstitute}
                    </span>
                  </div>

                  {/* Credentials Box */}
                  <div
                    className="p-2.5 rounded-xl border text-[11px] font-mono space-y-1"
                    style={{
                      backgroundColor: isDark ? "#09090b" : "#fafafa",
                      borderColor: isDark ? "#27272a" : "#e4e4e7",
                    }}
                  >
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Reg / Roll #:</span>
                      <span className="font-bold">{member.registrationNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">CoP Status:</span>
                      <span className="font-bold">{member.certificateOfPractice || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">UDIN Authority:</span>
                      <span className={member.udinAuthority ? "font-bold text-emerald-500" : "text-zinc-400"}>
                        {member.udinAuthority ? "Granted (ICAI)" : "Restricted"}
                      </span>
                    </div>
                  </div>

                  {/* Authority Level Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg border"
                      style={
                        isPartner
                          ? { backgroundColor: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0" }
                          : isReviewer
                          ? { backgroundColor: "#eff6ff", color: "#1e40af", borderColor: "#bfdbfe" }
                          : { backgroundColor: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" }
                      }
                    >
                      {isTrainee ? "🔒 Trainee Prep Lock" : isReviewer ? "👁 Tech Reviewer" : "✓ Statutory Signer"}
                    </span>

                    <span className="text-xs font-mono text-zinc-500">
                      {member.activeTasksCount} Active Tasks
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: REGULATORY CODE LOCK MATRIX */}
      {/* ==================================================================== */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          {/* Interactive Action Tester */}
          <div
            className="p-5 rounded-3xl border-2 space-y-4"
            style={{
              backgroundColor: isDark ? "#09090b" : "#ffffff",
              borderColor: isDark ? "#27272a" : "#e4e4e7",
              color: isDark ? "#ffffff" : "#09090b",
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Statutory Code Exclusivity Test Simulator</span>
                </h3>
                <p className="text-xs text-zinc-500 font-sans">
                  Select any statutory deliverable to evaluate whether the currently active user (
                  <strong className="text-zinc-900 dark:text-zinc-100">{activeMember?.name}</strong>) is legally authorized to execute it.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-mono font-bold text-zinc-500 shrink-0">Deliverable:</span>
                <select
                  value={testedAction}
                  onChange={(e) => setTestedAction(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer w-full sm:w-auto"
                  style={{
                    backgroundColor: isDark ? "#18181b" : "#f4f4f5",
                    color: isDark ? "#ffffff" : "#09090b",
                    borderColor: isDark ? "#3f3f46" : "#d4d4d8",
                  }}
                >
                  {governance.regulatoryRules?.map((rule) => (
                    <option key={rule.ruleId} value={rule.statutoryAction}>
                      {rule.actionName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Test Evaluation Result Card */}
            {checkingRule ? (
              <div className="p-6 text-center text-xs font-mono text-zinc-500">
                Evaluating statutory boundary across Companies Act, Income Tax Act & Advocates Act...
              </div>
            ) : checkResult ? (
              <div
                className="p-4 rounded-2xl border space-y-3"
                style={
                  checkResult.authorized
                    ? { backgroundColor: "#f0fdf4", borderColor: "#86efac", color: "#14532d" }
                    : { backgroundColor: "#fef2f2", borderColor: "#fca5a5", color: "#7f1d1d" }
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {checkResult.authorized ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Lock className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-black">
                        {checkResult.authorized
                          ? "✓ AUTHORIZED STATUTORY EXECUTION"
                          : checkResult.isTraineeLocked
                          ? "🔒 LOCKED: FOUR-EYES TRAINEE BARRIER"
                          : "🚫 STRICT STATUTORY CODE LOCK ACTIVATED"}
                      </div>
                      <div className="text-xs font-mono">{checkResult.actionName}</div>
                    </div>
                  </div>

                  <span
                    className="text-[10px] font-mono font-black px-2.5 py-1 rounded-full uppercase"
                    style={
                      checkResult.authorized
                        ? { backgroundColor: "#dcfce7", color: "#15803d" }
                        : { backgroundColor: "#fee2e2", color: "#b91c1c" }
                    }
                  >
                    {checkResult.authorized ? "Practice Authorized" : "Regulatory Violation"}
                  </span>
                </div>

                <div className="text-xs font-sans leading-relaxed">
                  {checkResult.authorized ? (
                    <p>
                      <strong>{activeMember?.name}</strong> holds the mandatory statutory qualifications under{" "}
                      <strong>{checkResult.governingAct}</strong> to execute and certify this document with Digital Signature.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="font-semibold">{checkResult.warningMessage}</p>
                      <div className="p-2 rounded-xl bg-white/60 dark:bg-black/40 border border-rose-300 dark:border-rose-900 text-xs font-mono space-y-1">
                        <div className="flex justify-between">
                          <span className="text-rose-700 dark:text-rose-400">Statutory Prohibition:</span>
                          <span className="font-bold text-rose-900 dark:text-rose-200">{checkResult.penaltyCitation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-rose-700 dark:text-rose-400">Statutory Penalty / Liability:</span>
                          <span className="font-bold text-rose-900 dark:text-rose-200">{checkResult.penaltyForBreach}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {checkResult.requiresDualSignOff && (
                  <div className="text-[11px] font-mono font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mandatory Dual CS-CA Joint Attestation Required for this class of filing.</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Master Rule Table */}
          <div
            className="p-5 rounded-3xl border space-y-4"
            style={{
              backgroundColor: isDark ? "#09090b" : "#ffffff",
              borderColor: isDark ? "#27272a" : "#e4e4e7",
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Statutory Exclusivity & Professional Code Rules
              </h3>
              <span className="text-xs font-mono text-zinc-400">8 Rules Enforced</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr
                    className="border-b text-[10px] font-mono uppercase tracking-wider text-zinc-500"
                    style={{ borderColor: isDark ? "#27272a" : "#e4e4e7" }}
                  >
                    <th className="py-2.5 px-3">Statutory Action</th>
                    <th className="py-2.5 px-3">Governing Section</th>
                    <th className="py-2.5 px-3">Authorized Body</th>
                    <th className="py-2.5 px-3">Locked / Prohibited Bodies</th>
                    <th className="py-2.5 px-3">Statutory Penalty for Misfeasance</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: isDark ? "#27272a" : "#e4e4e7" }}>
                  {governance.regulatoryRules?.map((rule) => (
                    <tr
                      key={rule.ruleId}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="py-3 px-3 font-bold font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                          <span>{rule.actionName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-500">{rule.governingAct}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {rule.authorizedInstitutes.join(", ")} Only
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md font-mono font-bold text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          {rule.prohibitedInstitutes.join(", ")} Prohibited
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                        {rule.penaltyForBreach}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: ARTICLE TRAINEE DELEGATION & FOUR-EYES GATE */}
      {/* ==================================================================== */}
      {activeTab === "delegation" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Four-Eyes Principle Queue (Article Assistant Delegation)
              </h2>
              <p className="text-xs text-zinc-500 font-sans">
                Trainees prepare workpapers and audit reconciliations. Direct DSC filing is hardware-locked until a
                Practicing Partner verifies and signs off.
              </p>
            </div>
            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Delegate New Task</span>
            </button>
          </div>

          <div className="space-y-3">
            {governance.delegatedTasks?.map((task) => {
              const isPendingReview = task.status === "SUBMITTED_FOR_REVIEW";
              const isApproved = task.status === "PARTNER_APPROVED";
              const isRevision = task.status === "REVISION_REQUESTED";

              return (
                <div
                  key={task.taskId}
                  className="p-4 rounded-2xl border transition-all space-y-3"
                  style={{
                    backgroundColor: isDark ? "#09090b" : "#ffffff",
                    borderColor: isDark ? "#27272a" : "#e4e4e7",
                    color: isDark ? "#ffffff" : "#09090b",
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-500">{task.taskId}</span>
                        <span className="text-xs text-zinc-400">•</span>
                        <span className="font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                          {task.clientName}
                        </span>
                        <span className="text-xs text-zinc-400">•</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                          {task.module}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm">{task.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border"
                        style={
                          isApproved
                            ? { backgroundColor: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0" }
                            : isPendingReview
                            ? { backgroundColor: "#fffbeb", color: "#b45309", borderColor: "#fde68a" }
                            : isRevision
                            ? { backgroundColor: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" }
                            : { backgroundColor: "#f4f4f5", color: "#52525b", borderColor: "#e4e4e7" }
                        }
                      >
                        {isApproved
                          ? "✓ Partner Approved (DSC Unlocked)"
                          : isPendingReview
                          ? "👁 Pending Partner Review"
                          : isRevision
                          ? "⚠ Revision Requested"
                          : "Drafting by Trainee"}
                      </span>
                    </div>
                  </div>

                  {/* Task Metadata & Four-Eyes Status Bar */}
                  <div
                    className="p-3 rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono"
                    style={{
                      backgroundColor: isDark ? "#18181b" : "#f4f4f5",
                      borderColor: isDark ? "#27272a" : "#e4e4e7",
                    }}
                  >
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Assigned Trainee:</span>
                      <span className="font-bold">
                        {task.assignedTrainee?.name} ({task.assignedTrainee?.role})
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-500 block text-[10px]">Reviewing Partner:</span>
                      <span className="font-bold">{task.reviewingPartner?.name}</span>
                    </div>

                    <div>
                      <span className="text-zinc-500 block text-[10px]">Hardware DSC Lock Status:</span>
                      <span
                        className={
                          task.statutoryLockPreventedDsc
                            ? "font-bold text-rose-500 flex items-center gap-1"
                            : "font-bold text-emerald-500 flex items-center gap-1"
                        }
                      >
                        {task.statutoryLockPreventedDsc ? (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Hardware Locked (Trainee)</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3" />
                            <span>Unlocked for Partner DSC</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Trainee & Partner Notes */}
                  {task.traineeNotes && (
                    <div className="text-xs font-sans text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800">
                      <strong className="text-zinc-900 dark:text-zinc-100 font-mono text-[11px] block">
                        Trainee Workpaper Summary ({task.workpaperReference}):
                      </strong>
                      {task.traineeNotes}
                    </div>
                  )}

                  {task.partnerReviewNotes && (
                    <div className="text-xs font-sans text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <strong className="font-mono text-[11px] block">
                        Partner Verification Notes ({task.reviewedAt ? new Date(task.reviewedAt).toLocaleDateString() : "Reviewed"}):
                      </strong>
                      {task.partnerReviewNotes}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] font-mono text-zinc-400">
                      {task.fourEyesVerified ? "✓ Four-Eyes Verification Passed" : "Four-Eyes Requirement Pending"}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Trainee Submit for review button */}
                      {task.status === "DRAFTING_BY_TRAINEE" && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await mdpGovernanceApi.reviewDelegatedTask(task.taskId, {
                                status: "SUBMITTED_FOR_REVIEW",
                              });
                              if (res && res.task && governance) {
                                setGovernance({
                                  ...governance,
                                  delegatedTasks: governance.delegatedTasks.map((t) =>
                                    t.taskId === res.task.taskId ? res.task : t
                                  ),
                                });
                              }
                            } catch (e: any) {
                              alert(e.message);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          Submit to Partner for Review
                        </button>
                      )}

                      {/* Partner Review Trigger Button */}
                      {(activeMember?.signingAuthorityLevel === "STATUTORY_SIGNING_PARTNER" ||
                        activeMember?.signingAuthorityLevel === "TECHNICAL_REVIEWER") && (
                        <button
                          onClick={() => {
                            setSelectedTaskForReview(task);
                            setReviewNotes(task.partnerReviewNotes || "");
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review Workpaper</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: DUAL SIGN-OFF GATE ENGINE */}
      {/* ==================================================================== */}
      {activeTab === "dualgates" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Statutory Dual Sign-Off Gate Engine
            </h2>
            <p className="text-xs text-zinc-500 font-sans">
              High-stakes multi-disciplinary corporate mandates (M&A Due Diligence, Section 177 Board Dossier) require
              independent, cryptographically verified attestation from both CS and CA partners before certificate
              release.
            </p>
          </div>

          <div className="space-y-6">
            {governance.dualSignOffGates?.map((gate) => {
              const isCsSigned = gate.csGate.status === "SIGNED";
              const isCaSigned = gate.caGate.status === "SIGNED";
              const isFullyReleased = gate.overallStatus === "FULLY_CERTIFIED_RELEASED";

              const canActiveSignCs =
                activeMember?.professionalInstitute === "ICSI" &&
                activeMember?.signingAuthorityLevel === "STATUTORY_SIGNING_PARTNER" &&
                !isCsSigned;

              const canActiveSignCa =
                activeMember?.professionalInstitute === "ICAI" &&
                activeMember?.signingAuthorityLevel === "STATUTORY_SIGNING_PARTNER" &&
                !isCaSigned;

              return (
                <div
                  key={gate.gateId}
                  className="p-5 rounded-3xl border-2 transition-all space-y-5"
                  style={{
                    backgroundColor: isDark ? "#09090b" : "#ffffff",
                    borderColor: isFullyReleased
                      ? isDark
                        ? "#059669"
                        : "#10b981"
                      : isDark
                      ? "#27272a"
                      : "#e4e4e7",
                    color: isDark ? "#ffffff" : "#09090b",
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-500">{gate.gateId}</span>
                        <span className="text-xs text-zinc-400">•</span>
                        <span className="font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                          {gate.clientName}
                        </span>
                      </div>
                      <h3 className="text-base font-black tracking-tight">{gate.title}</h3>
                    </div>

                    <span
                      className="px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider border shadow-xs"
                      style={
                        isFullyReleased
                          ? { backgroundColor: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0" }
                          : { backgroundColor: "#fffbeb", color: "#b45309", borderColor: "#fde68a" }
                      }
                    >
                      {isFullyReleased ? "✓ FULLY CERTIFIED & RELEASED" : "🔒 PENDING DUAL ATTESTATION"}
                    </span>
                  </div>

                  {/* Dual Padlock Gate Visualizer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CS GATE */}
                    <div
                      className="p-4 rounded-2xl border-2 space-y-3"
                      style={{
                        backgroundColor: isDark ? "#18181b" : "#f4f4f5",
                        borderColor: isCsSigned ? "#10b981" : isDark ? "#3f3f46" : "#d4d4d8",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isCsSigned ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Lock className="w-5 h-5 text-zinc-400" />
                          )}
                          <span className="font-black text-xs font-mono tracking-wide uppercase">
                            GATE 1: Practicing CS Attestation
                          </span>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                          style={
                            isCsSigned
                              ? { backgroundColor: "#dcfce7", color: "#166534" }
                              : { backgroundColor: "#e4e4e7", color: "#52525b" }
                          }
                        >
                          {isCsSigned ? "SIGNED" : "PENDING"}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-500 font-sans">{gate.csGate.statutoryScope}</p>

                      <div
                        className="p-2.5 rounded-xl border text-[11px] font-mono space-y-1"
                        style={{
                          backgroundColor: isDark ? "#09090b" : "#ffffff",
                          borderColor: isDark ? "#27272a" : "#e4e4e7",
                        }}
                      >
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Signatory:</span>
                          <span className="font-bold">{gate.csGate.signedBy || "Pending Sign-off"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">ICSI Reg #:</span>
                          <span className="font-bold">{gate.csGate.membershipNumber || "FCS Required"}</span>
                        </div>
                        {gate.csGate.signedAt && (
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Timestamp:</span>
                            <span className="text-emerald-500 font-bold">
                              {new Date(gate.csGate.signedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {canActiveSignCs && (
                        <button
                          onClick={() => handleSignGate(gate.gateId, "CS")}
                          disabled={signingGateId === gate.gateId}
                          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Affix CS Digital Sign-Off (FCS)</span>
                        </button>
                      )}
                    </div>

                    {/* CA GATE */}
                    <div
                      className="p-4 rounded-2xl border-2 space-y-3"
                      style={{
                        backgroundColor: isDark ? "#18181b" : "#f4f4f5",
                        borderColor: isCaSigned ? "#10b981" : isDark ? "#3f3f46" : "#d4d4d8",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isCaSigned ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Lock className="w-5 h-5 text-zinc-400" />
                          )}
                          <span className="font-black text-xs font-mono tracking-wide uppercase">
                            GATE 2: Practicing CA Attestation (UDIN)
                          </span>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                          style={
                            isCaSigned
                              ? { backgroundColor: "#dcfce7", color: "#166534" }
                              : { backgroundColor: "#e4e4e7", color: "#52525b" }
                          }
                        >
                          {isCaSigned ? "SIGNED" : "PENDING"}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-500 font-sans">{gate.caGate.statutoryScope}</p>

                      <div
                        className="p-2.5 rounded-xl border text-[11px] font-mono space-y-1"
                        style={{
                          backgroundColor: isDark ? "#09090b" : "#ffffff",
                          borderColor: isDark ? "#27272a" : "#e4e4e7",
                        }}
                      >
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Signatory:</span>
                          <span className="font-bold">{gate.caGate.signedBy || "Pending Sign-off"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">ICAI Reg #:</span>
                          <span className="font-bold">{gate.caGate.membershipNumber || "FCA Required"}</span>
                        </div>
                        {gate.caGate.udin && (
                          <div className="flex justify-between">
                            <span className="text-zinc-500">UDIN:</span>
                            <span className="text-amber-500 font-mono font-bold">{gate.caGate.udin}</span>
                          </div>
                        )}
                        {gate.caGate.signedAt && (
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Timestamp:</span>
                            <span className="text-emerald-500 font-bold">
                              {new Date(gate.caGate.signedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {canActiveSignCa && (
                        <button
                          onClick={() => handleSignGate(gate.gateId, "CA")}
                          disabled={signingGateId === gate.gateId}
                          className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Affix CA Digital Sign-Off + UDIN</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Release Certificate Fingerprint */}
                  {isFullyReleased && gate.releaseCertificateHash && (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Statutory Attestation Certificate Released</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Tamper-Proof SHA-256</span>
                      </div>
                      <div className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
                        Hash: {gate.releaseCertificateHash}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* REVIEW WORKPAPER MODAL (PARTNER FOUR-EYES) */}
      {/* ==================================================================== */}
      {selectedTaskForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className="w-full max-w-xl rounded-3xl border p-6 space-y-4 shadow-2xl"
            style={{
              backgroundColor: isDark ? "#09090b" : "#ffffff",
              borderColor: isDark ? "#27272a" : "#e4e4e7",
              color: isDark ? "#ffffff" : "#09090b",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-500" />
                <h3 className="text-base font-black">Partner Four-Eyes Technical Review</h3>
              </div>
              <button
                onClick={() => setSelectedTaskForReview(null)}
                className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="font-bold text-sm text-zinc-900 dark:text-white">
                  {selectedTaskForReview.title}
                </div>
                <div className="text-zinc-500 font-mono text-[11px]">
                  Assessee: {selectedTaskForReview.clientName} • Module: {selectedTaskForReview.module}
                </div>
                <div className="text-zinc-500 font-mono text-[11px]">
                  Prepared By: {selectedTaskForReview.assignedTrainee?.name} (
                  {selectedTaskForReview.assignedTrainee?.role})
                </div>
              </div>

              {selectedTaskForReview.traineeNotes && (
                <div>
                  <label className="font-bold block mb-1">Trainee Notes / Workpaper Summary:</label>
                  <p className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {selectedTaskForReview.traineeNotes}
                  </p>
                </div>
              )}

              <div>
                <label className="font-bold block mb-1">Partner Review & Verification Directives:</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="State your technical review remarks, verification checks performed, or specific clauses to revise..."
                  rows={4}
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-sans text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => setSelectedTaskForReview(null)}
                className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewSubmit("REVISION_REQUESTED")}
                disabled={submittingReview}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Request Revision
              </button>
              <button
                onClick={() => handleReviewSubmit("PARTNER_APPROVED")}
                disabled={submittingReview}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Approve & Unlock for DSC</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* NEW DELEGATED TASK MODAL */}
      {/* ==================================================================== */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleCreateTask}
            className="w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl"
            style={{
              backgroundColor: isDark ? "#09090b" : "#ffffff",
              borderColor: isDark ? "#27272a" : "#e4e4e7",
              color: isDark ? "#ffffff" : "#09090b",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-500" />
                <h3 className="text-base font-black">Delegate Workpaper to Article Assistant</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="font-bold block mb-1">Workpaper / Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Form AOC-4 XBRL Financial Statement Mapping"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Client Assessee</label>
                <input
                  type="text"
                  required
                  value={newTaskClient}
                  onChange={(e) => setNewTaskClient(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Practice Module</label>
                  <select
                    value={newTaskModule}
                    onChange={(e) => setNewTaskModule(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium"
                  >
                    <option value="ROC_FILING">ROC MCA21 Filing</option>
                    <option value="TAX_AUDIT_3CD">Tax Audit (3CD)</option>
                    <option value="GST_RECON">GSTR-2B vs 3B Recon</option>
                    <option value="BOARD_SECRETARIAL">Board Secretarial</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Assign to Trainee</label>
                  <select
                    value={newTaskTraineeId}
                    onChange={(e) => setNewTaskTraineeId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium"
                  >
                    {governance.members
                      ?.filter((m) => m.primaryRole.includes("article_assistant") || m.primaryRole === "associate")
                      .map((t) => (
                        <option key={t.memberId} value={t.memberId}>
                          {t.name} ({t.primaryRole.replace(/_/g, " ")})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Preparation Instructions & Scope</label>
                <textarea
                  value={newTaskTraineeNotes}
                  onChange={(e) => setNewTaskTraineeNotes(e.target.value)}
                  placeholder="Detail instructions for the article assistant..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-sans text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-md"
              >
                Delegate Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
