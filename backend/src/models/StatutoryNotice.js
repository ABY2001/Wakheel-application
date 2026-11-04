import mongoose from "mongoose";

const StatutoryNoticeSchema = new mongoose.Schema(
  {
    noticeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    referenceNumber: {
      type: String,
      required: true,
      index: true,
    },
    portal: {
      type: String,
      enum: ["MCA21", "GSTN", "CBDT_INCOME_TAX", "EPFO", "NCLT"],
      required: true,
      index: true,
    },
    issuingAuthority: {
      type: String,
      required: true,
    },
    issuingOfficer: {
      name: { type: String },
      designation: { type: String },
      dinOrEmployeeCode: { type: String },
      jurisdiction: { type: String },
    },
    clientEntity: {
      entityId: { type: String, default: "ent_cybercorp_1" },
      name: { type: String, required: true },
      cin: { type: String },
      pan: { type: String },
      gstin: { type: String },
      registeredAddress: { type: String },
      authorizedDirector: { type: String },
      email: { type: String },
      phone: { type: String },
    },
    statutorySection: {
      type: String,
      required: true,
    },
    noticeType: {
      type: String,
      enum: [
        "SHOW_CAUSE_NOTICE",
        "INQUIRY_SUMMONS",
        "SCRUTINY_ASSESSMENT",
        "REASSESSMENT_148A",
        "DEMAND_ORDER_DRC07",
        "DEFECTIVE_RETURN_139_9",
        "PENALTY_NOTICE_270A",
      ],
      required: true,
    },
    allegationSubject: {
      type: String,
      required: true,
    },
    allegationDetails: {
      type: String,
      required: true,
    },
    demandBreakdown: {
      principalTaxOrFee: { type: Number, default: 0 },
      interest: { type: Number, default: 0 },
      penalty: { type: Number, default: 0 },
      totalDisputedAmount: { type: Number, default: 0 },
    },
    financialYear: {
      type: String,
      required: true,
    },
    assessmentYear: {
      type: String,
    },
    dateOfNotice: {
      type: String,
      required: true,
    },
    dateOfService: {
      type: String,
      required: true,
    },
    limitationDeadline: {
      type: String,
      required: true,
      index: true,
    },
    statutoryDaysAllowed: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: [
        "PENDING_RESPONSE",
        "REPLY_DRAFTED",
        "REPLY_FILED",
        "HEARING_SCHEDULED",
        "ORDER_PASSED",
        "DISCHARGED_CLOSED",
      ],
      default: "PENDING_RESPONSE",
      index: true,
    },
    riskSeverity: {
      type: String,
      enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      default: "HIGH",
    },
    rebuttalDraft: {
      subject: { type: String },
      jurisdictionalObjections: [{ type: String }],
      factualSubmissions: [{ type: String }],
      statutoryPrecedents: [{ type: String }],
      formalPrayer: { type: String },
      draftText: { type: String },
      generatedAt: { type: String },
      authorName: { type: String },
    },
    annexures: [
      {
        annexureId: { type: String },
        label: { type: String },
        documentTitle: { type: String },
        fileName: { type: String },
        sha256Hash: { type: String },
        uploadedAt: { type: String },
      },
    ],
    hearingSchedule: {
      hearingDate: { type: String },
      hearingTime: { type: String },
      hearingMode: { type: String, enum: ["VIRTUAL_VC", "PHYSICAL_APPEARANCE"], default: "VIRTUAL_VC" },
      meetingLink: { type: String },
      benchOrOfficer: { type: String },
      assignedCounsel: { type: String },
      status: { type: String, enum: ["SCHEDULED", "ATTENDED", "ADJOURNMENT_SOUGHT", "CONCLUDED"] },
    },
    filingReceipt: {
      acknowledgmentNumber: { type: String },
      filedOn: { type: String },
      dscSignatory: { type: String },
      dscSerialNumber: { type: String },
      portalSubmissionStatus: { type: String },
    },
    auditTrail: [
      {
        action: { type: String },
        performedBy: { type: String },
        timestamp: { type: String },
        notes: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const StatutoryNotice = mongoose.model("StatutoryNotice", StatutoryNoticeSchema);
