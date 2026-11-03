// ============================================================================
// WAKHEEL SPECIALIZED AI COPILOT CLIENT FOR CS & CA
// Endpoints for Section 186 Drafter, Clause 43B(h) MSME Engine, GST DRC-01 Replier, and Statutory Assistant
// ============================================================================

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface Section186Params {
  entityName?: string;
  cin?: string;
  paidUpCapital?: number;
  freeReserves?: number;
  securitiesPremium?: number;
  existingLoans?: number;
  existingInvestments?: number;
  existingGuarantees?: number;
  existingSecurities?: number;
  proposedAmount?: number;
  targetEntityName?: string;
  targetCin?: string;
  transactionType?: "inter_corporate_loan" | "investment_shares" | "corporate_guarantee" | "security";
  interestRate?: number;
  tenureMonths?: number;
  purpose?: string;
  hasPfiDefault?: boolean;
  signatoryName?: string;
  signatoryMembership?: string;
}

export interface MsmeInvoiceItem {
  id?: string;
  invoiceNumber: string;
  supplierName: string;
  supplierUdyam?: string;
  enterpriseType: "micro" | "small" | "medium" | "trader";
  invoiceDate: string;
  amount: number;
  agreedCreditPeriodDays?: number;
  paymentDate?: string | null;
  notes?: string;
}

export interface Clause43bParams {
  clientName?: string;
  pan?: string;
  assessmentYear?: string;
  financialYear?: string;
  invoices?: MsmeInvoiceItem[];
}

export interface GstDrc01Params {
  clientName?: string;
  gstin?: string;
  noticeNumber?: string;
  noticeDate?: string;
  financialYear?: string;
  section?: "73" | "74" | "74A";
  allegationType?: "itc_2a_vs_3b_mismatch" | "supplier_cancellation_retrospective" | "section_16_4_time_bar" | "blocked_credit_17_5";
  demandTax?: number;
  demandInterest?: number;
  demandPenalty?: number;
  officerDesignation?: string;
  additionalFacts?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
}

export interface StatutoryQueryParams {
  prompt: string;
  category?: "cs_corporate_law" | "ca_income_tax" | "ca_gst" | "general";
  practiceMode?: "cs" | "ca" | "unified";
  matterContext?: any;
}

export const csCaCopilotApi = {
  // 1. Section 186 Inter-Corporate Loans & Guarantees Drafter (CS)
  async draftSection186(params: Section186Params, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/copilot/cs/section-186-drafter`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      return await res.json();
    } catch (e) {
      console.warn("csCaCopilotApi.draftSection186 error:", e);
      return { success: false, message: "Network error connecting to Section 186 engine" };
    }
  },

  // 2. Section 43B(h) MSME Disallowance & Penal Interest Analyzer (CA)
  async analyzeClause43bMsme(params: Clause43bParams, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/copilot/ca/clause-43b-msme-analyzer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      return await res.json();
    } catch (e) {
      console.warn("csCaCopilotApi.analyzeClause43bMsme error:", e);
      return { success: false, message: "Network error connecting to MSME engine" };
    }
  },

  // 3. GST DRC-01 SCN Notice Replier (CA & CS)
  async draftGstDrc01Reply(params: GstDrc01Params, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/copilot/ca/gst-drc01-replier`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      return await res.json();
    } catch (e) {
      console.warn("csCaCopilotApi.draftGstDrc01Reply error:", e);
      return { success: false, message: "Network error connecting to GST reply engine" };
    }
  },

  // 4. Interactive Statutory Assistant Query (CS & CA)
  async queryStatutoryAssistant(params: StatutoryQueryParams, token?: string) {
    try {
      const t = token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || "dev_token";
      const res = await fetch(`${API_BASE_URL}/copilot/cs-ca/interactive-query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      return await res.json();
    } catch (e) {
      console.warn("csCaCopilotApi.queryStatutoryAssistant error:", e);
      return { success: false, message: "Network error connecting to Statutory Assistant" };
    }
  },
};
