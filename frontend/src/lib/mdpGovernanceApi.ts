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

function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("wakheel_token") || localStorage.getItem("token") || "";
}

function getAuthHeaders(includeJson = false): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (includeJson) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

const EMPTY_TASK: DelegatedTask = {
  taskId: "",
  title: "",
  clientName: "",
  module: "ROC_FILING",
  assignedTrainee: { memberId: "", name: "", role: "" },
  reviewingPartner: { memberId: "", name: "", role: "" },
  status: "DRAFTING_BY_TRAINEE",
  fourEyesVerified: false,
  statutoryLockPreventedDsc: true,
};

const EMPTY_GATE: DualSignOffGate = {
  gateId: "",
  title: "",
  transactionType: "",
  clientName: "",
  csGate: { required: true, statutoryScope: "Secretarial & MCA21 Corporate Governance Attestation", status: "PENDING" },
  caGate: { required: true, statutoryScope: "Taxation, 3CD & True/Fair View Financial Attestation", status: "PENDING" },
  overallStatus: "PENDING_DUAL_SIGNOFF",
};

const EMPTY_GOVERNANCE: MdpFirmProfile = {
  firmId: "",
  firmName: "",
  firmStructure: "Multi-Disciplinary Partnership (LLP)",
  registrationCinOrLlpin: "",
  caFirmRegNo: "",
  csFirmRegNo: "",
  headquarters: "",
  members: [],
  regulatoryRules: [],
  delegatedTasks: [],
  dualSignOffGates: [],
};

export const mdpGovernanceApi = {
  async getFirmGovernance(): Promise<{ success: boolean; governance: MdpFirmProfile }> {
    if (!getAuthToken()) {
      return { success: false, governance: EMPTY_GOVERNANCE };
    }
    try {
      const res = await fetch(`${API_BASE}/mdp-governance`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("mdpGovernanceApi.getFirmGovernance fallback:", (e as Error)?.message);
    }
    return { success: false, governance: EMPTY_GOVERNANCE };
  },

  async checkRegulatoryLock(params: {
    statutoryAction: string;
    memberInstitute: string;
    memberRole: string;
  }): Promise<RegulatoryCheckResult> {
    if (getAuthToken()) {
      try {
        const res = await fetch(`${API_BASE}/mdp-governance/check-lock`, {
          method: "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify(params),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn("mdpGovernanceApi.checkRegulatoryLock fallback:", (e as Error)?.message);
      }
    }
    return {
      success: false,
      authorized: false,
      statutoryAction: params.statutoryAction,
      actionName: params.statutoryAction,
      governingAct: "Multi-Disciplinary Professional Practice Rules",
      isTraineeLocked: false,
      warningMessage: "Sign in to verify statutory authorization against firm governance rules.",
      penaltyCitation: null,
      penaltyForBreach: null,
      requiresDualSignOff: false,
    };
  },

  async getDelegatedTasks(): Promise<{ success: boolean; tasks: DelegatedTask[] }> {
    if (!getAuthToken()) {
      return { success: false, tasks: [] };
    }
    try {
      const res = await fetch(`${API_BASE}/mdp-governance/delegated-tasks`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("mdpGovernanceApi.getDelegatedTasks fallback:", (e as Error)?.message);
    }
    return { success: false, tasks: [] };
  },

  async createDelegatedTask(taskData: Partial<DelegatedTask>): Promise<{ success: boolean; task: DelegatedTask }> {
    if (!getAuthToken()) {
      return { success: false, task: EMPTY_TASK };
    }
    try {
      const res = await fetch(`${API_BASE}/mdp-governance/delegated-tasks`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("mdpGovernanceApi.createDelegatedTask fallback:", (e as Error)?.message);
    }
    return { success: false, task: EMPTY_TASK };
  },

  async reviewDelegatedTask(
    taskId: string,
    payload: {
      status: "PARTNER_APPROVED" | "REVISION_REQUESTED" | "SUBMITTED_FOR_REVIEW";
      partnerReviewNotes?: string;
      reviewingPartner?: { memberId: string; name: string; role: string };
    }
  ): Promise<{ success: boolean; task: DelegatedTask }> {
    if (!getAuthToken()) {
      return { success: false, task: EMPTY_TASK };
    }
    try {
      const res = await fetch(`${API_BASE}/mdp-governance/delegated-tasks/${taskId}/review`, {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("mdpGovernanceApi.reviewDelegatedTask fallback:", (e as Error)?.message);
    }
    return { success: false, task: EMPTY_TASK };
  },

  async getDualSignOffGates(): Promise<{ success: boolean; gates: DualSignOffGate[] }> {
    if (!getAuthToken()) {
      return { success: false, gates: [] };
    }
    try {
      const res = await fetch(`${API_BASE}/mdp-governance/dual-gates`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("mdpGovernanceApi.getDualSignOffGates fallback:", (e as Error)?.message);
    }
    return { success: false, gates: [] };
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
    if (!getAuthToken()) {
      return { success: false, gate: EMPTY_GATE };
    }
    try {
      const res = await fetch(`${API_BASE}/mdp-governance/dual-gates/${gateId}/sign`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("mdpGovernanceApi.signDualSignOffGate fallback:", (e as Error)?.message);
    }
    return { success: false, gate: EMPTY_GATE };
  },
};
