// ============================================================================
// WAKHEEL STATUTORY E-NOTICE & SCN LEGAL MAILROOM FRONTEND API CLIENT
// Connects to /api/statutory-notices (MongoDB Atlas & DevStore fallback)
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

export const statutoryNoticeApi = {
  // 1. Get notices
  async getNotices(params: NoticeFilterParams = {}): Promise<{
    success: boolean;
    count: number;
    notices: StatutoryNoticeItem[];
  }> {
    const query = new URLSearchParams();
    if (params.portal && params.portal !== "ALL") query.append("portal", params.portal);
    if (params.status && params.status !== "ALL") query.append("status", params.status);
    if (params.search) query.append("search", params.search);

    const res = await fetch(`${API_BASE_URL}/statutory-notices?${query.toString()}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  },

  // 2. Get notice by ID
  async getNoticeById(id: string): Promise<{ success: boolean; notice: StatutoryNoticeItem }> {
    const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  },

  // 3. Create notice
  async createNotice(data: Partial<StatutoryNoticeItem>): Promise<{ success: boolean; notice: StatutoryNoticeItem }> {
    const res = await fetch(`${API_BASE_URL}/statutory-notices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  },

  // 4. Update status
  async updateStatus(
    id: string,
    data: { status: string; note?: string; performedBy?: string }
  ): Promise<{ success: boolean; notice: StatutoryNoticeItem }> {
    const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  },

  // 5. Generate legal reply
  async generateReply(
    id: string,
    params: { authorName?: string; customJurisdictionalObjection?: string; customFacts?: string }
  ): Promise<{ success: boolean; notice: StatutoryNoticeItem }> {
    const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}/generate-reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  },

  // 6. Attach evidence / annexure
  async attachAnnexure(
    id: string,
    data: { label?: string; documentTitle: string; fileName: string; sha256Hash?: string }
  ): Promise<{ success: boolean; notice: StatutoryNoticeItem; annexure: NoticeAnnexure }> {
    const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}/annexures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  },

  // 7. Sign reply with DSC Token
  async signWithDsc(
    id: string,
    data: { dscSignatory: string; dscSerialNumber: string; role?: string }
  ): Promise<{ success: boolean; notice: StatutoryNoticeItem; filingReceipt: FilingReceipt }> {
    const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}/sign-dsc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
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
    const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}/schedule-hearing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  },

  // 9. Delete notice
  async deleteNotice(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  },
};
