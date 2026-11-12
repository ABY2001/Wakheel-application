// ============================================================================
// WAKHEEL STATUTORY E-NOTICE & SCN LEGAL MAILROOM FRONTEND API CLIENT
// Connects to /api/statutory-notices
// ============================================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface IssuingOfficer {
  name?: string;
  designation?: string;
  dinOrEmployeeCode?: string;
  jurisdiction?: string;
}

export interface ClientEntityDetails {
  entityId?: string;
  name: string;
  cin?: string;
  pan?: string;
  gstin?: string;
  registeredAddress?: string;
  authorizedDirector?: string;
  email?: string;
  phone?: string;
}

export interface DemandBreakdown {
  principalTaxOrFee: number;
  interest: number;
  penalty: number;
  totalDisputedAmount: number;
}

export interface NoticeAnnexure {
  annexureId: string;
  label: string;
  documentTitle: string;
  fileName: string;
  sha256Hash: string;
  uploadedAt: string;
}

export interface RebuttalDraft {
  subject?: string;
  jurisdictionalObjections: string[];
  factualSubmissions: string[];
  statutoryPrecedents: string[];
  formalPrayer?: string;
  draftText?: string;
  generatedAt?: string;
  authorName?: string;
}

export interface HearingSchedule {
  hearingDate: string;
  hearingTime: string;
  hearingMode: "VIRTUAL_VC" | "PHYSICAL_APPEARANCE";
  meetingLink?: string;
  benchOrOfficer?: string;
  assignedCounsel?: string;
  status: "SCHEDULED" | "ATTENDED" | "ADJOURNMENT_SOUGHT" | "CONCLUDED";
}

export interface FilingReceipt {
  acknowledgmentNumber: string;
  filedOn: string;
  dscSignatory: string;
  dscSerialNumber: string;
  portalSubmissionStatus: string;
}

export interface AuditTrailEntry {
  action: string;
  performedBy: string;
  timestamp: string;
  notes: string;
}

export interface StatutoryNoticeItem {
  id?: string;
  _id?: string;
  noticeId: string;
  referenceNumber: string;
  portal: "MCA21" | "GSTN" | "CBDT_INCOME_TAX" | "EPFO" | "NCLT";
  issuingAuthority: string;
  issuingOfficer?: IssuingOfficer;
  clientEntity: ClientEntityDetails;
  statutorySection: string;
  noticeType:
    | "SHOW_CAUSE_NOTICE"
    | "INQUIRY_SUMMONS"
    | "SCRUTINY_ASSESSMENT"
    | "REASSESSMENT_148A"
    | "DEMAND_ORDER_DRC07"
    | "DEFECTIVE_RETURN_139_9"
    | "PENALTY_NOTICE_270A";
  allegationSubject: string;
  allegationDetails: string;
  demandBreakdown: DemandBreakdown;
  financialYear: string;
  assessmentYear?: string;
  dateOfNotice: string;
  dateOfService: string;
  limitationDeadline: string;
  statutoryDaysAllowed: number;
  status:
    | "PENDING_RESPONSE"
    | "REPLY_DRAFTED"
    | "REPLY_FILED"
    | "HEARING_SCHEDULED"
    | "ORDER_PASSED"
    | "DISCHARGED_CLOSED";
  riskSeverity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  rebuttalDraft?: RebuttalDraft;
  annexures?: NoticeAnnexure[];
  hearingSchedule?: HearingSchedule;
  filingReceipt?: FilingReceipt;
  auditTrail?: AuditTrailEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface NoticeFilterParams {
  portal?: string;
  status?: string;
  search?: string;
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

export const FALLBACK_STATUTORY_NOTICES: StatutoryNoticeItem[] = [];

const EMPTY_NOTICE: StatutoryNoticeItem = {
  id: "",
  noticeId: "",
  referenceNumber: "",
  portal: "GSTN",
  issuingAuthority: "",
  clientEntity: { name: "" },
  statutorySection: "",
  noticeType: "SHOW_CAUSE_NOTICE",
  allegationSubject: "",
  allegationDetails: "",
  demandBreakdown: {
    principalTaxOrFee: 0,
    interest: 0,
    penalty: 0,
    totalDisputedAmount: 0,
  },
  financialYear: "",
  dateOfNotice: "",
  dateOfService: "",
  limitationDeadline: "",
  statutoryDaysAllowed: 30,
  status: "PENDING_RESPONSE",
  riskSeverity: "MEDIUM",
};

export const statutoryNoticeApi = {
  // 1. Get notices
  async getNotices(params: NoticeFilterParams = {}): Promise<{
    success: boolean;
    count: number;
    notices: StatutoryNoticeItem[];
  }> {
    if (!getAuthToken()) {
      return { success: true, count: 0, notices: [] };
    }
    try {
      const query = new URLSearchParams();
      if (params.portal && params.portal !== "ALL") query.append("portal", params.portal);
      if (params.status && params.status !== "ALL") query.append("status", params.status);
      if (params.search) query.append("search", params.search);

      const res = await fetch(`${API_BASE_URL}/statutory-notices?${query.toString()}`, {
        headers: getAuthHeaders(true),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.notices)) {
          return data;
        }
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.getNotices error:", (e as Error)?.message);
    }

    return { success: false, count: 0, notices: [] };
  },

  // 2. Get notice by ID
  async getNoticeById(id: string): Promise<{ success: boolean; notice: StatutoryNoticeItem }> {
    if (!getAuthToken()) {
      return { success: false, notice: EMPTY_NOTICE };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}`, {
        headers: getAuthHeaders(true),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.getNoticeById error:", (e as Error)?.message);
    }
    return { success: false, notice: EMPTY_NOTICE };
  },

  // 3. Create notice
  async createNotice(data: Partial<StatutoryNoticeItem>): Promise<{ success: boolean; notice: StatutoryNoticeItem }> {
    if (!getAuthToken()) {
      return { success: false, notice: EMPTY_NOTICE };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/statutory-notices`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.createNotice error:", (e as Error)?.message);
    }
    return { success: false, notice: EMPTY_NOTICE };
  },

  // 4. Update status
  async updateStatus(
    id: string,
    data: { status: string; note?: string; performedBy?: string }
  ): Promise<{ success: boolean; notice: StatutoryNoticeItem }> {
    if (!getAuthToken()) {
      return { success: false, notice: EMPTY_NOTICE };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.updateStatus error:", (e as Error)?.message);
    }
    return { success: false, notice: EMPTY_NOTICE };
  },

  // 5. Generate legal reply
  async generateReply(
    id: string,
    params: { authorName?: string; customJurisdictionalObjection?: string; customFacts?: string }
  ): Promise<{ success: boolean; notice: StatutoryNoticeItem }> {
    if (!getAuthToken()) {
      return { success: false, notice: EMPTY_NOTICE };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}/generate-reply`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(params),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.generateReply error:", (e as Error)?.message);
    }
    return { success: false, notice: EMPTY_NOTICE };
  },

  // 6. Attach evidence / annexure
  async attachAnnexure(
    id: string,
    data: { label?: string; documentTitle: string; fileName: string; sha256Hash?: string }
  ): Promise<{ success: boolean; notice: StatutoryNoticeItem; annexure: NoticeAnnexure }> {
    const emptyAnnexure: NoticeAnnexure = {
      annexureId: "",
      label: data.label || "Annexure",
      documentTitle: data.documentTitle,
      fileName: data.fileName,
      sha256Hash: data.sha256Hash || "",
      uploadedAt: "",
    };
    if (!getAuthToken()) {
      return { success: false, notice: EMPTY_NOTICE, annexure: emptyAnnexure };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}/annexures`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.attachAnnexure error:", (e as Error)?.message);
    }
    return { success: false, notice: EMPTY_NOTICE, annexure: emptyAnnexure };
  },

  // 7. Sign reply with DSC Token
  async signWithDsc(
    id: string,
    data: { dscSignatory: string; dscSerialNumber: string; role?: string }
  ): Promise<{ success: boolean; notice: StatutoryNoticeItem; filingReceipt: FilingReceipt }> {
    const emptyReceipt: FilingReceipt = {
      acknowledgmentNumber: "",
      filedOn: "",
      dscSignatory: data.dscSignatory,
      dscSerialNumber: data.dscSerialNumber,
      portalSubmissionStatus: "FAILED",
    };
    if (!getAuthToken()) {
      return { success: false, notice: EMPTY_NOTICE, filingReceipt: emptyReceipt };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}/sign-dsc`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.signWithDsc error:", (e as Error)?.message);
    }
    return { success: false, notice: EMPTY_NOTICE, filingReceipt: emptyReceipt };
  },

  // 8. Schedule virtual hearing
  async scheduleHearing(
    id: string,
    data: {
      hearingDate: string;
      hearingTime: string;
      hearingMode?: "VIRTUAL_VC" | "PHYSICAL_APPEARANCE";
      meetingLink?: string;
      assignedCounsel?: string;
      benchOrOfficer?: string;
    }
  ): Promise<{ success: boolean; notice: StatutoryNoticeItem; hearingSchedule: HearingSchedule }> {
    const emptySchedule: HearingSchedule = {
      hearingDate: data.hearingDate,
      hearingTime: data.hearingTime,
      hearingMode: data.hearingMode || "VIRTUAL_VC",
      meetingLink: data.meetingLink || "",
      benchOrOfficer: data.benchOrOfficer || "",
      assignedCounsel: data.assignedCounsel || "",
      status: "SCHEDULED",
    };
    if (!getAuthToken()) {
      return { success: false, notice: EMPTY_NOTICE, hearingSchedule: emptySchedule };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}/schedule-hearing`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.scheduleHearing error:", (e as Error)?.message);
    }
    return { success: false, notice: EMPTY_NOTICE, hearingSchedule: emptySchedule };
  },

  // 9. Delete notice
  async deleteNotice(id: string): Promise<{ success: boolean; message: string }> {
    if (!getAuthToken()) {
      return { success: false, message: "Authentication required." };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(true),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.deleteNotice error:", (e as Error)?.message);
    }
    return { success: false, message: "Failed to delete notice." };
  },
};

export default statutoryNoticeApi;
