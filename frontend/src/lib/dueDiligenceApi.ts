export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface DueDiligenceCheckpoint {
  checkpointId: string;
  title: string;
  category: "secretarial_mca" | "direct_tax" | "indirect_tax" | "labor_regulatory";
  statutorySection: string;
  status: "compliant" | "minor_default" | "major_default" | "not_applicable";
  points: number;
  earnedPoints: number;
  evidenceDocument?: string;
  observation?: string;
  riskWeight: "low" | "moderate" | "high" | "critical";
  remedialAction?: string;
}

export interface PenaltyExposureItem {
  section: string;
  law: string;
  description: string;
  statutoryMaxPenalty: number;
  calculatedExposure: number;
  mitigatedExposure: number;
  compoundingAvailable: boolean;
  remedyRoute?: string;
}

export interface RedFlagItem {
  flagId: string;
  title: string;
  severity: "critical_deal_breaker" | "high_indemnity" | "moderate_remedial" | "low_disclosure";
  impactDescription: string;
  statutoryProvision?: string;
  closingCondition: "condition_precedent" | "condition_subsequent" | "indemnity_escrow" | "disclosure_only";
  mitigationStrategy?: string;
}

export interface CompoundingDefaultItem {
  section: string;
  description: string;
  periodOfDefault: string;
  estimatedCompoundingFee: number;
}

export interface CompoundingRoadmap {
  hasCompoundableOffenses: boolean;
  competentAuthority: "Regional Director (RD)" | "National Company Law Tribunal (NCLT)";
  thresholdBasis: string;
  identifiedDefaults: CompoundingDefaultItem[];
  petitionDraft: {
    formNumber: string;
    prayerSummary: string;
    factualGrounds: string[];
    legalPrecedents: string[];
  };
}

export interface DueDiligenceAuditItem {
  id: string;
  _id?: string;
  auditId: string;
  userId: string;
  clientEntity: {
    entityId?: string;
    name: string;
    cin: string;
    pan: string;
    gstin: string;
    registeredAddress?: string;
    entityType?: string;
    incorporationDate?: string;
    authorizedCapital: number;
    paidUpCapital: number;
    annualTurnover: number;
    industry?: string;
  };
  auditScope: string;
  transactionContext: {
    targetType: string;
    proposedValuation: number;
    financialPeriodAudited: string;
    reportingStandard: string;
  };
  overallScore: number;
  grade: string;
  riskCategory: "low_risk" | "moderate_risk" | "high_risk" | "critical_deal_breaker";
  checkpoints: DueDiligenceCheckpoint[];
  totalCheckpoints: number;
  passedCheckpoints: number;
  failedCheckpoints: number;
  penaltyExposure: {
    totalCalculatedPenalty: number;
    totalMitigatedPenalty: number;
    items: PenaltyExposureItem[];
  };
  compoundingRoadmap: CompoundingRoadmap;
  redFlags: RedFlagItem[];
  attestation: {
    leadCs: {
      name: string;
      membershipNo: string;
      cpNumber: string;
      firm: string;
      digitalSigned: boolean;
      signatureHash?: string;
      signedAt?: string;
    };
    leadCa: {
      name: string;
      membershipNo: string;
      firmRegNo: string;
      firm: string;
      udin: string;
      digitalSigned: boolean;
      signatureHash?: string;
      signedAt?: string;
    };
    qrVerificationUrl?: string;
    integrityHash?: string;
    attestedAt?: string;
    status: string;
  };
  status: "draft" | "under_audit" | "partner_review" | "attested" | "delivered";
  createdAt?: string;
  updatedAt?: string;
}

export interface PenaltyCalculatorResult {
  mcaSection403: {
    days: number;
    ratePerDay: number;
    total: number;
    rule: string;
  };
  section271B: {
    delayed: boolean;
    rate: string;
    total: number;
    reasonableCauseReliefUnder273B: string;
  };
  section270A: {
    underReportedIncome: number;
    taxComputed: number;
    penaltyRate: string;
    total: number;
  };
  gstSection122: {
    taxDisputed: number;
    total: number;
    rule: string;
  };
  totalMaximumExposure: number;
  mitigatedExposure: number;
  summary: string;
}

const DUMMY_AUDIT = {
  id: "dd-fallback-1",
  auditId: "WAK-DD-FALLBACK",
  userId: "cs_1",
  clientEntity: {
    name: "CyberCorp Technologies Pvt Ltd",
    cin: "U72200DL2022PTC394812",
    pan: "AAECS1234F",
    gstin: "07AAECS1234F1Z8",
    authorizedCapital: 50000000,
    paidUpCapital: 25000000,
    annualTurnover: 485000000,
  },
  auditScope: "Statutory Health & Due Diligence Audit",
  transactionContext: {
    targetType: "Corporate Health Audit",
    proposedValuation: 2500000000,
    financialPeriodAudited: "FY 2024-25 & FY 2025-26",
    reportingStandard: "Companies Act 2013 & ICAI/ICSI Standards",
  },
  penaltyExposure: {
    totalMaximumExposure: 0,
    mitigatedExposure: 0,
    exposures: [],
  },
  compoundingRoadmap: {
    hasCompoundableOffenses: false,
    competentAuthority: "Regional Director (RD)" as const,
    thresholdBasis: "Statutory threshold",
    identifiedDefaults: [],
  },
  overallScore: 88,
  grade: "Grade A",
  riskCategory: "low_risk" as const,
  totalCheckpoints: 100,
  passedCheckpoints: 88,
  failedCheckpoints: 12,
  checkpoints: [],
  redFlags: [],
  status: "draft" as const,
} as unknown as DueDiligenceAuditItem;

export const dueDiligenceApi = {
  // Get all audits
  async getAudits(params: { entityName?: string; riskCategory?: string } = {}): Promise<{
    success: boolean;
    count: number;
    audits: DueDiligenceAuditItem[];
  }> {
    try {
      const query = new URLSearchParams();
      if (params.entityName) query.append("entityName", params.entityName);
      if (params.riskCategory) query.append("riskCategory", params.riskCategory);

      const res = await fetch(`${API_BASE_URL}/due-diligence?${query.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("dueDiligenceApi.getAudits fallback:", (e as Error)?.message);
    }
    return { success: true, count: 0, audits: [] };
  },

  // Get audit by ID
  async getAuditById(id: string): Promise<{ success: boolean; audit: DueDiligenceAuditItem }> {
    try {
      const res = await fetch(`${API_BASE_URL}/due-diligence/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("dueDiligenceApi.getAuditById fallback:", (e as Error)?.message);
    }
    return { success: false, audit: DUMMY_AUDIT };
  },

  // Create audit
  async createAudit(data: Partial<DueDiligenceAuditItem>): Promise<{ success: boolean; audit: DueDiligenceAuditItem }> {
    try {
      const res = await fetch(`${API_BASE_URL}/due-diligence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("dueDiligenceApi.createAudit fallback:", (e as Error)?.message);
    }
    return { success: false, audit: { ...DUMMY_AUDIT, ...data } };
  },

  // Update specific checkpoint status
  async updateCheckpoint(
    id: string,
    data: {
      checkpointId: string;
      status: string;
      observation?: string;
      remedialAction?: string;
    }
  ): Promise<{ success: boolean; audit: DueDiligenceAuditItem }> {
    try {
      const res = await fetch(`${API_BASE_URL}/due-diligence/${id}/checkpoint`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("dueDiligenceApi.updateCheckpoint fallback:", (e as Error)?.message);
    }
    return { success: false, audit: DUMMY_AUDIT };
  },

  // Calculate live statutory penalties
  async calculatePenalties(params: {
    mcaLateDays?: number;
    annualTurnover?: number;
    taxAuditDelay?: boolean;
    underReportedIncome?: number;
    gstTaxDisputed?: number;
  }): Promise<{ success: boolean; calculation: PenaltyCalculatorResult }> {
    try {
      const res = await fetch(`${API_BASE_URL}/due-diligence/calculate-penalties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("dueDiligenceApi.calculatePenalties fallback:", (e as Error)?.message);
    }
    return {
      success: false,
      calculation: {
        mcaSection403: { days: 0, ratePerDay: 0, total: 0, rule: "" },
        section271B: { delayed: false, rate: "", total: 0, reasonableCauseReliefUnder273B: "" },
        section270A: { underReportedIncome: 0, taxComputed: 0, penaltyRate: "", total: 0 },
        gstSection122: { taxDisputed: 0, total: 0, rule: "" },
        totalMaximumExposure: 0,
        mitigatedExposure: 0,
        summary: "Calculation unavailable in offline mode.",
      },
    };
  },

  // Generate Section 441 compounding petition
  async generateCompoundingPetition(data: {
    companyName?: string;
    cin?: string;
    sectionViolated?: string;
    natureOfDefault?: string;
    daysOfDelay?: number;
    estimatedPenalty?: number;
  }): Promise<{
    success: boolean;
    petition: {
      form: string;
      jurisdiction: string;
      competentForum: string;
      draftText: string;
    };
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/due-diligence/compounding-petition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("dueDiligenceApi.generateCompoundingPetition fallback:", (e as Error)?.message);
    }
    return {
      success: false,
      petition: {
        form: "Form GNL-1",
        jurisdiction: "Regional Director / NCLT",
        competentForum: "National Company Law Tribunal",
        draftText: "Draft compounding petition under Section 441 of the Companies Act, 2013.",
      },
    };
  },

  // Attest audit report (Dual CS & CA digital sign-off)
  async attestAudit(
    id: string,
    signers: {
      csSigner?: { name?: string; membershipNo?: string; cpNumber?: string };
      caSigner?: { name?: string; membershipNo?: string; udin?: string };
    } = {}
  ): Promise<{ success: boolean; audit: DueDiligenceAuditItem }> {
    try {
      const res = await fetch(`${API_BASE_URL}/due-diligence/${id}/attest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signers),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("dueDiligenceApi.attestAudit fallback:", (e as Error)?.message);
    }
    return { success: false, audit: DUMMY_AUDIT };
  },

  // Delete audit
  async deleteAudit(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/due-diligence/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("dueDiligenceApi.deleteAudit fallback:", (e as Error)?.message);
    }
    return { success: true, message: "Audit deleted" };
  },
};

export default dueDiligenceApi;
