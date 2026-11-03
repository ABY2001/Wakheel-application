export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface DirectorItem {
  din: string;
  name: string;
  designation: string;
  appointmentDate?: string;
  kycStatus: string;
  sec164Clearance: boolean;
  shareholdingPercentage?: number;
}

export interface AuditCommitteeRiskItem {
  category: string;
  riskLevel: "Low" | "Medium" | "High";
  parameter: string;
  statutorySection?: string;
  observation: string;
  mitigationStatus: string;
}

export interface BoardResolutionExtractItem {
  agendaNo: string;
  title: string;
  statutorySection?: string;
  votingResult: string;
  signatoryDin?: string;
}

export interface DualAttestationSignOff {
  csSignatory: {
    name: string;
    membershipNo: string;
    cpNo: string;
    firm: string;
    signatureHash: string;
    signedAt: string;
  };
  caSignatory: {
    name: string;
    membershipNo: string;
    firmRegNo: string;
    firm: string;
    udin: string;
    signatureHash: string;
    signedAt: string;
  };
  jointDeclaration: string;
  qrVerificationUrl: string;
  status: "Draft" | "Signed & Sealed" | "Presented to Board";
}

export interface BoardDossierItem {
  id?: string;
  _id?: string;
  dossierId: string;
  userId?: string;
  clientEntity: {
    entityId?: string;
    name: string;
    cin: string;
    pan: string;
    gstin: string;
    registeredAddress?: string;
    entityType?: string;
    incorporationDate?: string;
    authorizedCapital?: number;
    paidUpCapital?: number;
  };
  financialYear: string;
  assessmentYear: string;
  boardMeetingDate: string;
  meetingType: string;
  governanceStandard: string;
  directorsList: DirectorItem[];
  csGovernanceData: {
    aoc4Status: string;
    aoc4Srn: string;
    mgt7Status: string;
    mgt7Srn?: string;
    boardMeetingsConducted: number;
    ss1ComplianceScore: number;
    secretarialAuditOpinion: string;
    registeredChargesStatus: string;
    activeLitigationsCount: number;
  };
  caAuditData: {
    itrStatus: string;
    itrAckNumber: string;
    gstr9Status: string;
    form3CdTurnover: number;
    gstAnnualTurnover: number;
    mcaFinancialTurnover: number;
    turnoverVariance: number;
    udin: string;
    clause43bDisallowance: number;
    indAs12DeferredTax: string;
    ifcControlRating: string;
  };
  auditCommitteeRisks: AuditCommitteeRiskItem[];
  boardResolutionsExtracts: BoardResolutionExtractItem[];
  dualAttestationSignOff: DualAttestationSignOff;
  dossierDigestSha256: string;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const boardDossierApi = {
  // 1. Get all dossiers with optional entity or FY filtering
  async getBoardDossiers(params?: { entityName?: string; financialYear?: string }, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
      const res = await fetch(`${API_BASE_URL}/board-dossier${query}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      return await res.json();
    } catch (e) {
      console.warn("boardDossierApi.getBoardDossiers fallback:", e);
      return { success: false, dossiers: [] };
    }
  },

  // 2. Get single dossier by ID
  async getBoardDossierById(id: string, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/board-dossier/${id}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      return await res.json();
    } catch (e) {
      console.warn("boardDossierApi.getBoardDossierById fallback:", e);
      return { success: false, dossier: null };
    }
  },

  // 3. Generate New Board & Audit Committee Dossier
  async generateBoardDossier(data: any, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/board-dossier/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.warn("boardDossierApi.generateBoardDossier fallback:", e);
      return { success: false, message: "Network error in generating dossier" };
    }
  },

  // 4. Verify Cryptographic Signatures
  async verifyDossierSignatures(data: { dossierId: string; dossierDigestSha256: string }, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/board-dossier/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.warn("boardDossierApi.verifyDossierSignatures fallback:", e);
      return { success: false, verified: false };
    }
  },

  // 5. Get Direct HTML Print URL
  getDossierHtmlUrl(id: string) {
    return `${API_BASE_URL}/board-dossier/${id}/html`;
  },
};

export default boardDossierApi;
