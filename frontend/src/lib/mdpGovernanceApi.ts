// ============================================================================
// MDP FIRM GOVERNANCE & REGULATORY CODE LOCK API CLIENT
// Multi-Disciplinary Practice: CS, CA & Legal Practice Partitioning Engine
// Four-Eyes Trainee Delegation & Dual Sign-Off Padlock Verification
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface MdpTeamMember {
  memberId: string;
  name: string;
  email: string;
  primaryRole:
    | "managing_partner"
    | "senior_partner"
    | "partner"
    | "senior_associate"
    | "associate"
    | "article_assistant_cs"
    | "article_assistant_ca"
    | "paralegal";
  professionalInstitute: "ICSI" | "ICAI" | "BCI" | "ICSI_STUDENT" | "ICAI_STUDENT" | "OTHER";
  registrationNumber: string;
  certificateOfPractice?: string;
  udinAuthority: boolean;
  dscTokenAttached: boolean;
  signingAuthorityLevel: "STATUTORY_SIGNING_PARTNER" | "TECHNICAL_REVIEWER" | "PREPARATION_ONLY_LOCKED";
  status: "ACTIVE" | "ON_LEAVE" | "DEPUTATION";
  activeTasksCount: number;
}

export interface RegulatoryLockRule {
  ruleId: string;
  statutoryAction: string;
  actionName: string;
  governingAct: string;
  authorizedInstitutes: string[];
  authorizedRoles: string[];
  prohibitedInstitutes: string[];
  prohibitionCitation: string;
  penaltyForBreach: string;
  requiresDualSignOff: boolean;
}

export interface DelegatedTask {
  taskId: string;
  title: string;
  clientName: string;
  module: string;
  assignedTrainee: {
    memberId: string;
    name: string;
    role: string;
  };
  reviewingPartner: {
    memberId: string;
    name: string;
    role: string;
  };
  workpaperReference?: string;
  traineeNotes?: string;
  partnerReviewNotes?: string;
  status: "DRAFTING_BY_TRAINEE" | "SUBMITTED_FOR_REVIEW" | "PARTNER_APPROVED" | "REVISION_REQUESTED";
  fourEyesVerified: boolean;
  statutoryLockPreventedDsc: boolean;
  submittedAt?: string;
  reviewedAt?: string;
}

export interface DualGateParty {
  required: boolean;
  statutoryScope: string;
  signedBy?: string;
  membershipNumber?: string;
  udin?: string;
  signedAt?: string;
  status: "PENDING" | "SIGNED";
}

export interface DualSignOffGate {
  gateId: string;
  title: string;
  transactionType: string;
  clientName: string;
  csGate: DualGateParty;
  caGate: DualGateParty;
  overallStatus: "PENDING_DUAL_SIGNOFF" | "PARTIALLY_SIGNED" | "FULLY_CERTIFIED_RELEASED";
  releaseCertificateHash?: string;
}

export interface MdpFirmProfile {
  firmId: string;
  firmName: string;
  firmStructure: string;
  registrationCinOrLlpin: string;
  caFirmRegNo: string;
  csFirmRegNo: string;
  barCouncilRegistration?: string;
  headquarters: string;
  members: MdpTeamMember[];
  regulatoryRules: RegulatoryLockRule[];
  delegatedTasks: DelegatedTask[];
  dualSignOffGates: DualSignOffGate[];
}

export interface RegulatoryCheckResult {
  success: boolean;
  authorized: boolean;
  statutoryAction: string;
  actionName: string;
  governingAct: string;
  isTraineeLocked: boolean;
  warningMessage: string | null;
  penaltyCitation: string | null;
  penaltyForBreach: string | null;
  requiresDualSignOff: boolean;
}

export const mdpGovernanceApi = {
  async getFirmGovernance(): Promise<{ success: boolean; governance: MdpFirmProfile }> {
    const res = await fetch(`${API_BASE}/mdp-governance`);
    if (!res.ok) {
      throw new Error(`Failed to fetch MDP firm governance: ${res.statusText}`);
    }
    return res.json();
  },

  async checkRegulatoryLock(params: {
    statutoryAction: string;
    memberInstitute: string;
    memberRole: string;
  }): Promise<RegulatoryCheckResult> {
    const res = await fetch(`${API_BASE}/mdp-governance/check-lock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      throw new Error(`Failed to check regulatory lock: ${res.statusText}`);
    }
    return res.json();
  },

  async getDelegatedTasks(): Promise<{ success: boolean; tasks: DelegatedTask[] }> {
    const res = await fetch(`${API_BASE}/mdp-governance/delegated-tasks`);
    if (!res.ok) {
      throw new Error(`Failed to fetch delegated tasks: ${res.statusText}`);
    }
    return res.json();
  },

  async createDelegatedTask(taskData: Partial<DelegatedTask>): Promise<{ success: boolean; task: DelegatedTask }> {
    const res = await fetch(`${API_BASE}/mdp-governance/delegated-tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) {
      throw new Error(`Failed to create delegated task: ${res.statusText}`);
    }
    return res.json();
  },

  async reviewDelegatedTask(
    taskId: string,
    payload: {
      status: "PARTNER_APPROVED" | "REVISION_REQUESTED" | "SUBMITTED_FOR_REVIEW";
      partnerReviewNotes?: string;
      reviewingPartner?: { memberId: string; name: string; role: string };
    }
  ): Promise<{ success: boolean; task: DelegatedTask }> {
    const res = await fetch(`${API_BASE}/mdp-governance/delegated-tasks/${taskId}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Failed to review delegated task: ${res.statusText}`);
    }
    return res.json();
  },

  async getDualSignOffGates(): Promise<{ success: boolean; gates: DualSignOffGate[] }> {
    const res = await fetch(`${API_BASE}/mdp-governance/dual-gates`);
    if (!res.ok) {
      throw new Error(`Failed to fetch dual sign-off gates: ${res.statusText}`);
    }
    return res.json();
  },

  async signDualSignOffGate(
    gateId: string,
    payload: {
      role: "CS" | "CA";
      signatoryName?: string;
      membershipNumber?: string;
      udin?: string;
    }
  ): Promise<{ success: boolean; gate: DualSignOffGate }> {
    const res = await fetch(`${API_BASE}/mdp-governance/dual-gates/${gateId}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Failed to sign dual gate: ${res.statusText}`);
    }
    return res.json();
  },
};
