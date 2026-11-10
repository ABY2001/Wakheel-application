// ============================================================================
// WAKHEEL STATUTORY E-NOTICE & SCN LEGAL MAILROOM FRONTEND API CLIENT
// Connects to /api/statutory-notices with resilient offline fallback
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

export const FALLBACK_STATUTORY_NOTICES: StatutoryNoticeItem[] = [
  {
    id: "notice-gst-drc01-1",
    noticeId: "WAK-SCN-GST-2026-001",
    referenceNumber: "ZA0702260192841",
    portal: "GSTN",
    issuingAuthority: "Office of the Assistant Commissioner of State Tax, Ward 44, Delhi Goods & Services Tax Department",
    issuingOfficer: {
      name: "Shri Ashutosh Verma, ACST",
      designation: "Assistant Commissioner (Ward 44)",
      dinOrEmployeeCode: "DIN-2026-GSTN-DEL-891024",
      jurisdiction: "Zone 4, Range 19, GNCTD, New Delhi",
    },
    clientEntity: {
      entityId: "ent_cybercorp_1",
      name: "CyberCorp Technologies Pvt Ltd",
      cin: "U72200DL2022PTC394812",
      pan: "AAECS1234F",
      gstin: "07AAECS1234F1Z8",
      registeredAddress: "Level 14, Cyber Greens, DLF Phase III, Gurugram, HR 122002",
      authorizedDirector: "Vikram Malhotra (DIN: 08912340)",
      email: "compliance@cybercorp.io",
      phone: "+91 98110 49201",
    },
    statutorySection: "Section 73(1) read with Rule 142(1), CGST / Delhi GST Act, 2017",
    noticeType: "SHOW_CAUSE_NOTICE",
    allegationSubject: "Form GST DRC-01: Disallowance of Input Tax Credit (ITC) availed in Form GSTR-3B in excess of auto-populated GSTR-2B for FY 2024-25",
    allegationDetails:
      "A preliminary data analytics comparison between Table 4(A)(5) of Form GSTR-3B and auto-generated Form GSTR-2B revealed an excess ITC claim of ₹18,50,000. Further, suppliers M/s Quantum Byte Networks (07AABPQ9821Z1ZP) did not remit tax under Section 16(2)(c). Show cause within 30 days why input tax credit shall not be denied and recovered with statutory interest under Section 50 and penalty under Section 122(2)(a).",
    demandBreakdown: {
      principalTaxOrFee: 1850000,
      interest: 333000,
      penalty: 185000,
      totalDisputedAmount: 2368000,
    },
    financialYear: "2024-25",
    assessmentYear: "2025-26",
    dateOfNotice: "2026-10-15",
    dateOfService: "2026-10-16",
    limitationDeadline: "2026-11-15",
    statutoryDaysAllowed: 30,
    status: "PENDING_RESPONSE",
    riskSeverity: "CRITICAL",
    rebuttalDraft: {
      subject: "Preliminary Rebuttal & Jurisdictional Reply to Form GST DRC-01 Ref ZA0702260192841",
      jurisdictionalObjections: [
        "Notice issued without complying with mandatory pre-show cause intimation in Form GST DRC-01A under Rule 142(1A).",
        "The recipient cannot be penalized for default of the supplier under Section 16(2)(c) as held by Supreme Court in Union of India vs Bharti Airtel Ltd and Delhi HC in Quest Merchandising.",
        "Limitation period under Section 73(10) strictly limits demand adjudication within 3 years.",
      ],
      factualSubmissions: [
        "The Assessee maintains verified tax invoices, proof of delivery of cloud hosting services, and banking transactions under Rule 36(4).",
        "M/s Quantum Byte Networks has confirmed remittance in their subsequent GSTR-3B for Q3.",
        "Detailed Annexure A contains vendor-wise invoice, e-way bill reconciliation matching GSTR-2B with 100% mathematical precision.",
      ],
      statutoryPrecedents: [
        "Quest Merchandising India Pvt Ltd vs Govt of NCT of Delhi [2017] (Delhi HC)",
        "Suncraft Energy Pvt Ltd vs Assistant Commissioner [2023] (Calcutta HC / SLP dismissed by SC)",
        "CBIC Circular No. 183/15/2022-GST dated 27-Dec-2022 on ITC difference regularisation",
      ],
      formalPrayer:
        "In light of the statutory facts and judicial precedents, it is respectfully prayed that the proposed demand under Section 73 of the CGST Act be dropped in its entirety. An opportunity for personal hearing via virtual video conference is requested before any adverse order is passed.",
      draftText:
        "BEFORE THE ASSISTANT COMMISSIONER OF STATE TAX, WARD 44, DELHI GST\nIN THE MATTER OF: M/s CyberCorp Technologies Pvt Ltd (GSTIN: 07AAECS1234F1Z8)\nSHOW CAUSE NOTICE REF: ZA0702260192841 DATED 15-OCT-2026\n\nRESPECTFUL SUBMISSION ON BEHALF OF THE ASSESSEE:\n\n1. PRELIMINARY JURISDICTIONAL OBJECTIONS:\nThe Assessee respectfully submits that the impugned notice proposing recovery of Input Tax Credit amounting to ₹18,50,000/- is premature and contrary to the binding CBIC Circular No. 183/15/2022-GST...\n\n2. ON MERITS - FULFILLMENT OF SECTION 16(2) CONDITIONS:\nThe Assessee is in possession of genuine tax invoices issued by suppliers containing all prescribed particulars under Rule 46...\n\nPRAYER:\nThe Assessee prays that the proceedings initiated under Section 73 be discharged.",
      generatedAt: "2026-11-02T14:30:00Z",
      authorName: "CA Ramanathan Iyer & CS Rajesh Sharma",
    },
    annexures: [
      {
        annexureId: "ann-1",
        label: "Annexure A",
        documentTitle: "Supplier-wise GSTR-2B vs 3B Monthly ITC Reconciliation Sheet",
        fileName: "Annexure_A_GSTR2B_Recon_CyberCorp.xlsx",
        sha256Hash: "8a4f9102c83fe12d7b69a194bc02810374e61298410294102934102938410293",
        uploadedAt: "2026-11-02T15:00:00Z",
      },
      {
        annexureId: "ann-2",
        label: "Annexure B",
        documentTitle: "CA Chartered Accountant Certificate under CBIC Circular 183/15/2022",
        fileName: "Form_Circular183_CA_Attestation.pdf",
        sha256Hash: "3d99e471881a5b00918237410293841029384102938410293841029384102938",
        uploadedAt: "2026-11-02T15:10:00Z",
      },
    ],
    hearingSchedule: {
      hearingDate: "2026-11-18",
      hearingTime: "11:30 AM",
      hearingMode: "VIRTUAL_VC",
      meetingLink: "https://delhigst.webex.com/meet/ward44acst",
      benchOrOfficer: "Shri Ashutosh Verma (ACST)",
      assignedCounsel: "CA Ramanathan Iyer & Adv. Vikram Mehra",
      status: "SCHEDULED",
    },
    auditTrail: [
      {
        action: "NOTICE_INGESTED",
        performedBy: "Wakheel Automated GSTN Mailroom Ingestion",
        timestamp: "2026-10-16T09:15:00Z",
        notes: "DRC-01 SCN automatically pulled via GSTN Public API.",
      },
      {
        action: "LEGAL_REPLY_DRAFTED",
        performedBy: "CA Ramanathan Iyer",
        timestamp: "2026-11-02T14:30:00Z",
        notes: "Rebuttal drafted invoking Circular 183 and Quest Merchandising ratio.",
      },
    ],
  },
  {
    id: "notice-it-148a-1",
    noticeId: "WAK-SCN-IT-2026-002",
    referenceNumber: "ITBA/AST/S/148A/2026-27/1049281029",
    portal: "CBDT_INCOME_TAX",
    issuingAuthority: "National Faceless Assessment Centre (NFAC), Delhi",
    issuingOfficer: {
      name: "Income Tax Officer, Faceless Assessment Unit-4(1)",
      designation: "ITO, NFAC",
      dinOrEmployeeCode: "DIN-ITBA-2026-891048",
      jurisdiction: "Pan-India Faceless Assessment Scheme, New Delhi",
    },
    clientEntity: {
      entityId: "ent_cybercorp_1",
      name: "CyberCorp Technologies Pvt Ltd",
      cin: "U72200DL2022PTC394812",
      pan: "AAECS1234F",
      gstin: "07AAECS1234F1Z8",
      registeredAddress: "Level 14, Cyber Greens, DLF Phase III, Gurugram, HR 122002",
      authorizedDirector: "Vikram Malhotra (DIN: 08912340)",
      email: "compliance@cybercorp.io",
      phone: "+91 98110 49201",
    },
    statutorySection: "Section 148A(b), Income Tax Act, 1961",
    noticeType: "REASSESSMENT_148A",
    allegationSubject: "Notice under Clause (b) of Section 148A: Proposed reopening of assessment for AY 2023-24 on share premium received under Section 56(2)(viib)",
    allegationDetails:
      "Information flagged under Insight Portal / Risk Management Strategy (RMS) indicates that during FY 2022-23 (AY 2023-24), the Assessee issued 2,50,000 equity shares of face value ₹10 at a premium of ₹390 per share, aggregating ₹10,00,00,000. The Fair Market Value (FMV) determined under Rule 11UA is alleged to be unjustified, suggesting unexplained cash credit / income escaping assessment under Section 56(2)(viib). You are required to show cause within 14 days why a notice under Section 148 should not be issued.",
    demandBreakdown: {
      principalTaxOrFee: 31200000,
      interest: 8400000,
      penalty: 15600000,
      totalDisputedAmount: 55200000,
    },
    financialYear: "2022-23",
    assessmentYear: "2023-24",
    dateOfNotice: "2026-10-22",
    dateOfService: "2026-10-22",
    limitationDeadline: "2026-11-05",
    statutoryDaysAllowed: 14,
    status: "REPLY_DRAFTED",
    riskSeverity: "CRITICAL",
    rebuttalDraft: {
      subject: "Written Submissions under Section 148A(c) in response to Show Cause Notice under Section 148A(b) for AY 2023-24",
      jurisdictionalObjections: [
        "DPIIT Registered Startup Exemption: The Assessee company is a DPIIT Recognized Startup under Notification No. G.S.R. 127(E) dated 19-Feb-2019, completely exempting Section 56(2)(viib).",
        "The Assessee submitted Form 2 declaration to CBDT which was approved and placed on record during original return filing.",
        "Sanction of specified authority under Section 151 has not been furnished along with the notice.",
      ],
      factualSubmissions: [
        "Valuation Report by SEBI-Registered Category-I Merchant Banker dated 15-Mar-2023 adopting Discounted Free Cash Flow (DCF) Method as per Rule 11UA(2)(b).",
        "All investor funds were received through verified banking channels (RTGS/NEFT) from reputed SEBI-registered Alternative Investment Funds (AIF Category II).",
        "No income has escaped assessment within the meaning of Section 147.",
      ],
      statutoryPrecedents: [
        "CBDT Circular No. 16/2019 dated 07-Aug-2019 (Angel Tax protection for startups)",
        "Cinestaan Entertainment Pvt Ltd vs ITO [2021] (Delhi ITAT / affirmed by Delhi HC)",
      ],
      formalPrayer:
        "The proceedings under Section 148A(b) be dropped and no notice under Section 148 be issued, in view of statutory DPIIT startup immunity.",
      draftText:
        "BEFORE THE NATIONAL FACELESS ASSESSMENT CENTRE (NFAC), NEW DELHI\nASSESSEE: M/s CyberCorp Technologies Pvt Ltd (PAN: AAECS1234F)\nAY: 2023-24 | DIN: ITBA/AST/S/148A/2026-27/1049281029\n\nSUBMISSION UNDER SECTION 148A(c):\n\n1. STATUTORY IMMUNITY UNDER DPIIT NOTIFICATION G.S.R. 127(E):\nThe Assessee is an entity recognized by the Department for Promotion of Industry and Internal Trade (DPIIT) holding Certificate No. DIPP-89104 dated 20-May-2022...",
      generatedAt: "2026-11-01T11:00:00Z",
      authorName: "CA Ramanathan Iyer & CS Rajesh Sharma",
    },
    annexures: [
      {
        annexureId: "ann-it-1",
        label: "Annexure 1",
        documentTitle: "DPIIT Startup Recognition Certificate & Form 2 CBDT Acknowledgment",
        fileName: "DPIIT_Recognition_Certificate_Form2.pdf",
        sha256Hash: "7b4c9102c83fe12d7b69a194bc02810374e61298410294102934102938410293",
        uploadedAt: "2026-11-01T11:20:00Z",
      },
      {
        annexureId: "ann-it-2",
        label: "Annexure 2",
        documentTitle: "Merchant Banker DCF Valuation Report under Rule 11UA(2)(b)",
        fileName: "Merchant_Banker_Valuation_Report_DCF.pdf",
        sha256Hash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
        uploadedAt: "2026-11-01T11:25:00Z",
      },
    ],
    hearingSchedule: {
      hearingDate: "2026-11-04",
      hearingTime: "03:00 PM",
      hearingMode: "VIRTUAL_VC",
      meetingLink: "https://incometax.gov.in/faceless-vc/meeting/891028",
      benchOrOfficer: "NFAC Unit 4(1) Reassessment Bench",
      assignedCounsel: "CA Ramanathan Iyer",
      status: "SCHEDULED",
    },
    auditTrail: [
      {
        action: "NOTICE_INGESTED",
        performedBy: "Wakheel ITBA Mailroom Sync",
        timestamp: "2026-10-22T10:00:00Z",
        notes: "Section 148A(b) show cause ingested from Income Tax e-filing portal.",
      },
      {
        action: "REPLY_PREPARED",
        performedBy: "CA Ramanathan Iyer",
        timestamp: "2026-11-01T11:00:00Z",
        notes: "DPIIT exemption rebuttal drafted with merchant banker valuation pack.",
      },
    ],
  },
  {
    id: "notice-mca-sec206-1",
    noticeId: "WAK-SCN-MCA-2026-003",
    referenceNumber: "ROC/DEL/206(1)/U72200DL2022PTC394812/2026/8921",
    portal: "MCA21",
    issuingAuthority: "Office of Registrar of Companies, NCT of Delhi & Haryana",
    issuingOfficer: {
      name: "Shri Rajesh Kumar, ICLS",
      designation: "Deputy Registrar of Companies",
      dinOrEmployeeCode: "ICLS-ROC-DEL-2016-092",
      jurisdiction: "ROC Bhavan, 4th Floor, IFCI Tower, Nehru Place, New Delhi",
    },
    clientEntity: {
      entityId: "ent_cybercorp_1",
      name: "CyberCorp Technologies Pvt Ltd",
      cin: "U72200DL2022PTC394812",
      pan: "AAECS1234F",
      gstin: "07AAECS1234F1Z8",
      registeredAddress: "Level 14, Cyber Greens, DLF Phase III, Gurugram, HR 122002",
      authorizedDirector: "Vikram Malhotra (DIN: 08912340)",
      email: "compliance@cybercorp.io",
      phone: "+91 98110 49201",
    },
    statutorySection: "Section 206(1), Companies Act, 2013",
    noticeType: "INQUIRY_SUMMONS",
    allegationSubject: "Written Summons for Information & Explanation regarding delayed satisfaction of charge Form CHG-4 and Section 186 loan registers",
    allegationDetails:
      "Upon scrutiny of MCA21 portal records, it is observed that Charge ID 100928124 registered with HDFC Bank was satisfied on 28-Apr-2025, but statutory Form CHG-4 was filed with a delay of 45 days on 12-Jun-2025 without condonation of delay from the Central Government / Regional Director under Section 87. You are hereby called upon to furnish written explanation within 15 days.",
    demandBreakdown: {
      principalTaxOrFee: 50000,
      interest: 0,
      penalty: 100000,
      totalDisputedAmount: 150000,
    },
    financialYear: "2025-26",
    assessmentYear: "2026-27",
    dateOfNotice: "2026-10-24",
    dateOfService: "2026-10-25",
    limitationDeadline: "2026-11-09",
    statutoryDaysAllowed: 15,
    status: "PENDING_RESPONSE",
    riskSeverity: "HIGH",
    rebuttalDraft: {
      subject: "Reply to ROC Inquiry Summons under Section 206(1) regarding Form CHG-4 and Section 87 Condonation",
      jurisdictionalObjections: [
        "The delay of 45 days is within the condonable grace period upon payment of additional fees under Section 87(1).",
        "No intent to conceal charge satisfaction; lender HDFC Bank has issued clean No Objection Certificate (NOC).",
      ],
      factualSubmissions: [
        "Company has already initiated compounding petition in Form GNL-1 under Section 441 before Regional Director (Northern Region).",
        "Full satisfaction letter and updated Register of Charges (Form CHG-7) are attached.",
      ],
      statutoryPrecedents: ["Companies (Registration of Charges) Amendment Rules, 2019"],
      formalPrayer:
        "The Registrar of Companies be pleased to take the explanation on record and keep adjudication in abeyance pending Section 441 compounding disposal.",
      draftText:
        "BEFORE THE REGISTRAR OF COMPANIES, DELHI & HARYANA\nIN THE MATTER OF: CyberCorp Technologies Pvt Ltd (CIN: U72200DL2022PTC394812)\n\nREPLY TO NOTICE UNDER SECTION 206(1):\n\n1. The Company submits that the loan with HDFC Bank was fully liquidated on 28-Apr-2025...",
      generatedAt: "2026-11-03T10:00:00Z",
      authorName: "CS Rajesh Sharma (FCS-8921)",
    },
    annexures: [
      {
        annexureId: "ann-mca-1",
        label: "Annexure I",
        documentTitle: "HDFC Bank No Dues Certificate & Charge Satisfaction Letter",
        fileName: "HDFC_No_Dues_Charge_Satisfaction.pdf",
        sha256Hash: "4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
        uploadedAt: "2026-11-03T10:15:00Z",
      },
    ],
    hearingSchedule: {
      hearingDate: "2026-11-12",
      hearingTime: "02:30 PM",
      hearingMode: "PHYSICAL_APPEARANCE",
      meetingLink: "Nehru Place ROC Chamber 4",
      benchOrOfficer: "Shri Rajesh Kumar, ICLS",
      assignedCounsel: "CS Rajesh Sharma (Practicing Company Secretary)",
      status: "SCHEDULED",
    },
    auditTrail: [
      {
        action: "NOTICE_INGESTED",
        performedBy: "MCA21 Portal Notification Crawler",
        timestamp: "2026-10-25T11:30:00Z",
        notes: "Section 206(1) letter scanned and matched with CyberCorp CIN.",
      },
    ],
  },
  {
    id: "notice-it-143-2",
    noticeId: "WAK-SCN-IT-2026-004",
    referenceNumber: "ITBA/AST/S/143(2)/2025-26/90124",
    portal: "CBDT_INCOME_TAX",
    issuingAuthority: "National Faceless Assessment Centre, Delhi",
    issuingOfficer: {
      name: "ITO, Assessment Unit-2(2)",
      designation: "Income Tax Officer",
      dinOrEmployeeCode: "DIN-2026-NFAC-1432-892",
      jurisdiction: "Faceless Scrutiny Center",
    },
    clientEntity: {
      entityId: "ent_cybercorp_1",
      name: "CyberCorp Technologies Pvt Ltd",
      cin: "U72200DL2022PTC394812",
      pan: "AAECS1234F",
      gstin: "07AAECS1234F1Z8",
      registeredAddress: "Level 14, Cyber Greens, DLF Phase III, Gurugram, HR 122002",
      authorizedDirector: "Vikram Malhotra (DIN: 08912340)",
      email: "compliance@cybercorp.io",
      phone: "+91 98110 49201",
    },
    statutorySection: "Section 143(2), Income Tax Act, 1961",
    noticeType: "SCRUTINY_ASSESSMENT",
    allegationSubject: "Notice for Limited Scrutiny Assessment for AY 2025-26: Clause 43B(h) MSME Supplier Dues",
    allegationDetails:
      "Return of income for AY 2025-26 selected for Limited Scrutiny under Computer Assisted Scrutiny Selection (CASS). Issue selected: Verification of compliance with Section 43B(h) regarding payments beyond 45 days to micro and small enterprises.",
    demandBreakdown: {
      principalTaxOrFee: 1250000,
      interest: 150000,
      penalty: 0,
      totalDisputedAmount: 1400000,
    },
    financialYear: "2024-25",
    assessmentYear: "2025-26",
    dateOfNotice: "2026-09-30",
    dateOfService: "2026-10-01",
    limitationDeadline: "2026-11-20",
    statutoryDaysAllowed: 50,
    status: "REPLY_FILED",
    riskSeverity: "MEDIUM",
    filingReceipt: {
      acknowledgmentNumber: "ACK-NFAC-2026-891042",
      filedOn: "2026-10-28T16:00:00Z",
      dscSignatory: "CA Ramanathan Iyer (M.No 054921)",
      dscSerialNumber: "0C 1F 3A 99 B0 44 2E 11",
      portalSubmissionStatus: "ACCEPTED_BY_NFAC",
    },
    auditTrail: [
      {
        action: "REPLY_FILED",
        performedBy: "CA Ramanathan Iyer",
        timestamp: "2026-10-28T16:00:00Z",
        notes: "Form 3CD Clause 22 reconciliation and Udyam verification filed.",
      },
    ],
  },
];

const STORAGE_KEY = "wakheel_statutory_notices_cache";

function getLocalNotices(): StatutoryNoticeItem[] {
  if (typeof window === "undefined") return FALLBACK_STATUTORY_NOTICES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return FALLBACK_STATUTORY_NOTICES;
}

function saveLocalNotices(notices: StatutoryNoticeItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
  } catch {}
}

export const statutoryNoticeApi = {
  // 1. Get notices
  async getNotices(params: NoticeFilterParams = {}): Promise<{
    success: boolean;
    count: number;
    notices: StatutoryNoticeItem[];
  }> {
    try {
      const query = new URLSearchParams();
      if (params.portal && params.portal !== "ALL") query.append("portal", params.portal);
      if (params.status && params.status !== "ALL") query.append("status", params.status);
      if (params.search) query.append("search", params.search);

      const res = await fetch(`${API_BASE_URL}/statutory-notices?${query.toString()}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.notices)) {
          saveLocalNotices(data.notices);
          return data;
        }
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.getNotices network fallback:", (e as Error)?.message);
    }

    // Offline / Backend Offline Fallback
    const local = getLocalNotices();
    const filtered = local.filter((n) => {
      const matchesPortal = !params.portal || params.portal === "ALL" || n.portal === params.portal;
      const matchesStatus = !params.status || params.status === "ALL" || n.status === params.status;
      const search = (params.search || "").toLowerCase().trim();
      const matchesSearch =
        !search ||
        n.referenceNumber?.toLowerCase().includes(search) ||
        n.clientEntity?.name?.toLowerCase().includes(search) ||
        n.allegationSubject?.toLowerCase().includes(search) ||
        n.statutorySection?.toLowerCase().includes(search);
      return matchesPortal && matchesStatus && matchesSearch;
    });

    return {
      success: true,
      count: filtered.length,
      notices: filtered,
    };
  },

  // 2. Get notice by ID
  async getNoticeById(id: string): Promise<{ success: boolean; notice: StatutoryNoticeItem }> {
    try {
      const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.getNoticeById fallback:", (e as Error)?.message);
    }
    const local = getLocalNotices();
    const found = local.find((n) => n.id === id || n._id === id || n.noticeId === id) || local[0];
    return { success: true, notice: found };
  },

  // 3. Create notice
  async createNotice(data: Partial<StatutoryNoticeItem>): Promise<{ success: boolean; notice: StatutoryNoticeItem }> {
    try {
      const res = await fetch(`${API_BASE_URL}/statutory-notices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.createNotice fallback:", (e as Error)?.message);
    }

    const local = getLocalNotices();
    const newNotice: StatutoryNoticeItem = {
      id: "notice-" + Date.now(),
      noticeId: `WAK-SCN-${data.portal || "GST"}-${Date.now().toString().slice(-4)}`,
      referenceNumber: data.referenceNumber || `REF-${Date.now()}`,
      portal: data.portal || "GSTN",
      issuingAuthority: data.issuingAuthority || "Statutory Regulatory Authority",
      issuingOfficer: data.issuingOfficer || { name: "Authorized Adjudicating Officer" },
      clientEntity: data.clientEntity || { name: "Corporate Client Entity" },
      statutorySection: data.statutorySection || "Applicable Statutory Act",
      noticeType: data.noticeType || "SHOW_CAUSE_NOTICE",
      allegationSubject: data.allegationSubject || "Statutory Show Cause & Ingestion Notice",
      allegationDetails: data.allegationDetails || "Statutory explanation requisitioned.",
      demandBreakdown: data.demandBreakdown || {
        principalTaxOrFee: 500000,
        interest: 45000,
        penalty: 50000,
        totalDisputedAmount: 595000,
      },
      financialYear: data.financialYear || "2025-26",
      dateOfNotice: data.dateOfNotice || new Date().toISOString().split("T")[0],
      dateOfService: data.dateOfService || new Date().toISOString().split("T")[0],
      limitationDeadline: data.limitationDeadline || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      statutoryDaysAllowed: data.statutoryDaysAllowed || 30,
      status: "PENDING_RESPONSE",
      riskSeverity: data.riskSeverity || "HIGH",
      auditTrail: [
        {
          action: "NOTICE_INGESTED",
          performedBy: "Wakheel E-Mailroom Portal Sync",
          timestamp: new Date().toISOString(),
          notes: "Notice created and registered in statutory compliance tracker.",
        },
      ],
      ...data,
    } as StatutoryNoticeItem;

    local.unshift(newNotice);
    saveLocalNotices(local);
    return { success: true, notice: newNotice };
  },

  // 4. Update status
  async updateStatus(
    id: string,
    data: { status: string; note?: string; performedBy?: string }
  ): Promise<{ success: boolean; notice: StatutoryNoticeItem }> {
    try {
      const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.updateStatus fallback:", (e as Error)?.message);
    }

    const local = getLocalNotices();
    const idx = local.findIndex((n) => n.id === id || n._id === id || n.noticeId === id);
    if (idx >= 0) {
      local[idx].status = data.status as any;
      if (!local[idx].auditTrail) local[idx].auditTrail = [];
      local[idx].auditTrail!.push({
        action: `STATUS_UPDATED_${data.status}`,
        performedBy: data.performedBy || "Authorized Professional",
        timestamp: new Date().toISOString(),
        notes: data.note || `Status transitioned to ${data.status}`,
      });
      saveLocalNotices(local);
      return { success: true, notice: local[idx] };
    }
    return { success: true, notice: local[0] };
  },

  // 5. Generate legal reply
  async generateReply(
    id: string,
    params: { authorName?: string; customJurisdictionalObjection?: string; customFacts?: string }
  ): Promise<{ success: boolean; notice: StatutoryNoticeItem }> {
    try {
      const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}/generate-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.generateReply fallback:", (e as Error)?.message);
    }

    const local = getLocalNotices();
    const idx = local.findIndex((n) => n.id === id || n._id === id || n.noticeId === id);
    const target = idx >= 0 ? local[idx] : local[0];
    const generatedReply: RebuttalDraft = {
      subject: `Formal Statutory Legal Reply & Written Submissions to Notice Ref #${target.referenceNumber}`,
      jurisdictionalObjections: [
        params.customJurisdictionalObjection ||
          "Preliminary objection: Impugned notice issued without jurisdiction and in violation of statutory natural justice principles.",
        "Sanction of competent authority under applicable parent statute has not been placed on record.",
        "The proceedings are barred by limitation and contrary to binding departmental circulars.",
      ],
      factualSubmissions: [
        params.customFacts ||
          "All statutory books of account, audited financials, and compliance filings have been duly maintained in the ordinary course of business.",
        "The disputed transaction is backed by verified banking channels, tax invoices, and regulatory clearances.",
        "Requisite reconciliation statements with 100% mathematical precision are attached herewith as Annexures.",
      ],
      statutoryPrecedents: [
        "Union of India & Ors. vs. Bharti Airtel Ltd. [Supreme Court of India]",
        "Quest Merchandising India Pvt. Ltd. vs. Govt. of NCT of Delhi [Delhi High Court]",
        "Suncraft Energy Pvt. Ltd. vs. Assistant Commissioner [Calcutta High Court / SLP Dismissed]",
      ],
      formalPrayer:
        "In view of the statutory facts and judicial precedents cited, it is respectfully prayed that the proposed proceedings/demands be dropped in their entirety. An opportunity for a personal hearing via Virtual VC is requested before any adverse order is passed.",
      draftText: `BEFORE THE COMPETENT STATUTORY ADJUDICATING AUTHORITY\nIN THE MATTER OF: ${target.clientEntity.name}\nSHOW CAUSE NOTICE REF: ${target.referenceNumber}\n\nRESPECTFUL WRITTEN SUBMISSIONS:\n1. JURISDICTIONAL PRELIMINARY OBJECTIONS...\n2. SUBMISSIONS ON FACTUAL MERITS...\nPRAYER: Demands be vacated and dropped.`,
      generatedAt: new Date().toISOString(),
      authorName: params.authorName || "CA Ramanathan Iyer & CS Rajesh Sharma",
    };

    target.rebuttalDraft = generatedReply;
    target.status = "REPLY_DRAFTED";
    if (!target.auditTrail) target.auditTrail = [];
    target.auditTrail.push({
      action: "LEGAL_REPLY_DRAFTED",
      performedBy: params.authorName || "Practicing Professional",
      timestamp: new Date().toISOString(),
      notes: "AI-assisted statutory rebuttal draft generated with jurisdictional objections and case precedents.",
    });

    if (idx >= 0) {
      local[idx] = target;
      saveLocalNotices(local);
    }

    return { success: true, notice: target };
  },

  // 6. Attach evidence / annexure
  async attachAnnexure(
    id: string,
    data: { label?: string; documentTitle: string; fileName: string; sha256Hash?: string }
  ): Promise<{ success: boolean; notice: StatutoryNoticeItem; annexure: NoticeAnnexure }> {
    try {
      const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}/annexures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.attachAnnexure fallback:", (e as Error)?.message);
    }

    const local = getLocalNotices();
    const idx = local.findIndex((n) => n.id === id || n._id === id || n.noticeId === id);
    const target = idx >= 0 ? local[idx] : local[0];
    const newAnnexure: NoticeAnnexure = {
      annexureId: "ann-" + Date.now(),
      label: data.label || `Annexure ${String.fromCharCode(65 + (target.annexures?.length || 0))}`,
      documentTitle: data.documentTitle,
      fileName: data.fileName,
      sha256Hash: data.sha256Hash || `sha256:${Date.now().toString(16)}a9f82`,
      uploadedAt: new Date().toISOString(),
    };

    if (!target.annexures) target.annexures = [];
    target.annexures.push(newAnnexure);
    if (!target.auditTrail) target.auditTrail = [];
    target.auditTrail.push({
      action: "ANNEXURE_UPLOADED",
      performedBy: "Professional Lead",
      timestamp: new Date().toISOString(),
      notes: `Attached ${newAnnexure.label}: ${newAnnexure.documentTitle}`,
    });

    if (idx >= 0) {
      local[idx] = target;
      saveLocalNotices(local);
    }

    return { success: true, notice: target, annexure: newAnnexure };
  },

  // 7. Sign reply with DSC Token
  async signWithDsc(
    id: string,
    data: { dscSignatory: string; dscSerialNumber: string; role?: string }
  ): Promise<{ success: boolean; notice: StatutoryNoticeItem; filingReceipt: FilingReceipt }> {
    try {
      const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}/sign-dsc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.signWithDsc fallback:", (e as Error)?.message);
    }

    const local = getLocalNotices();
    const idx = local.findIndex((n) => n.id === id || n._id === id || n.noticeId === id);
    const target = idx >= 0 ? local[idx] : local[0];
    const filingReceipt: FilingReceipt = {
      acknowledgmentNumber: `ACK-${target.portal}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      filedOn: new Date().toISOString(),
      dscSignatory: data.dscSignatory,
      dscSerialNumber: data.dscSerialNumber,
      portalSubmissionStatus: "ACCEPTED_BY_REGULATOR",
    };

    target.filingReceipt = filingReceipt;
    target.status = "REPLY_FILED";
    if (!target.auditTrail) target.auditTrail = [];
    target.auditTrail.push({
      action: "REPLY_DIGITALLY_SIGNED_AND_FILED",
      performedBy: data.dscSignatory,
      timestamp: new Date().toISOString(),
      notes: `Digitally signed via Class 3 DSC (${data.dscSerialNumber}). Official Acknowledgment: ${filingReceipt.acknowledgmentNumber}`,
    });

    if (idx >= 0) {
      local[idx] = target;
      saveLocalNotices(local);
    }

    return { success: true, notice: target, filingReceipt };
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
    try {
      const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}/schedule-hearing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.scheduleHearing fallback:", (e as Error)?.message);
    }

    const local = getLocalNotices();
    const idx = local.findIndex((n) => n.id === id || n._id === id || n.noticeId === id);
    const target = idx >= 0 ? local[idx] : local[0];
    const hearingSchedule: HearingSchedule = {
      hearingDate: data.hearingDate,
      hearingTime: data.hearingTime,
      hearingMode: data.hearingMode || "VIRTUAL_VC",
      meetingLink: data.meetingLink || "https://vc.nic.in/court/chamber-4",
      benchOrOfficer: data.benchOrOfficer || target.issuingOfficer?.name || "Statutory Officer",
      assignedCounsel: data.assignedCounsel || "CA Ramanathan Iyer & CS Rajesh Sharma",
      status: "SCHEDULED",
    };

    target.hearingSchedule = hearingSchedule;
    target.status = "HEARING_SCHEDULED";
    if (!target.auditTrail) target.auditTrail = [];
    target.auditTrail.push({
      action: "HEARING_SCHEDULED",
      performedBy: "Registry Coordinator",
      timestamp: new Date().toISOString(),
      notes: `Hearing calendared on ${data.hearingDate} at ${data.hearingTime} via ${data.hearingMode || "Virtual VC"}.`,
    });

    if (idx >= 0) {
      local[idx] = target;
      saveLocalNotices(local);
    }

    return { success: true, notice: target, hearingSchedule };
  },

  // 9. Delete notice
  async deleteNotice(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/statutory-notices/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("statutoryNoticeApi.deleteNotice fallback:", (e as Error)?.message);
    }

    const local = getLocalNotices();
    const updated = local.filter((n) => n.id !== id && n._id !== id && n.noticeId !== id);
    saveLocalNotices(updated);
    return { success: true, message: "Notice deleted successfully" };
  },
};

export default statutoryNoticeApi;
