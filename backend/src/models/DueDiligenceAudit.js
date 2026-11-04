import mongoose from "mongoose";

const checkpointSchema = new mongoose.Schema(
  {
    checkpointId: { type: String, required: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["secretarial_mca", "direct_tax", "indirect_tax", "labor_regulatory"],
      required: true,
    },
    statutorySection: { type: String, required: true },
    status: {
      type: String,
      enum: ["compliant", "minor_default", "major_default", "not_applicable"],
      default: "compliant",
    },
    points: { type: Number, default: 1 },
    earnedPoints: { type: Number, default: 1 },
    evidenceDocument: { type: String },
    observation: { type: String },
    riskWeight: {
      type: String,
      enum: ["low", "moderate", "high", "critical"],
      default: "low",
    },
    remedialAction: { type: String },
  },
  { _id: false }
);

const penaltyExposureSchema = new mongoose.Schema(
  {
    section: { type: String, required: true },
    law: { type: String, required: true }, // e.g., "Companies Act, 2013", "Income Tax Act, 1961"
    description: { type: String, required: true },
    statutoryMaxPenalty: { type: Number, default: 0 },
    calculatedExposure: { type: Number, default: 0 },
    mitigatedExposure: { type: Number, default: 0 },
    compoundingAvailable: { type: Boolean, default: false },
    remedyRoute: { type: String }, // e.g. "Section 441 Compounding via RD", "Section 271B Reasonable Cause Submission"
  },
  { _id: false }
);

const redFlagSchema = new mongoose.Schema(
  {
    flagId: { type: String, required: true },
    title: { type: String, required: true },
    severity: {
      type: String,
      enum: ["critical_deal_breaker", "high_indemnity", "moderate_remedial", "low_disclosure"],
      default: "moderate_remedial",
    },
    impactDescription: { type: String, required: true },
    statutoryProvision: { type: String },
    closingCondition: {
      type: String,
      enum: ["condition_precedent", "condition_subsequent", "indemnity_escrow", "disclosure_only"],
      default: "condition_precedent",
    },
    mitigationStrategy: { type: String },
  },
  { _id: false }
);

const dueDiligenceAuditSchema = new mongoose.Schema(
  {
    auditId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      default: "cs_1",
    },
    clientEntity: {
      entityId: { type: String },
      name: { type: String, required: true },
      cin: { type: String, required: true },
      pan: { type: String, required: true },
      gstin: { type: String, required: true },
      registeredAddress: { type: String },
      entityType: { type: String, default: "pvt_ltd" },
      incorporationDate: { type: String },
      authorizedCapital: { type: Number, default: 50000000 },
      paidUpCapital: { type: Number, default: 25000000 },
      annualTurnover: { type: Number, default: 485000000 },
      industry: { type: String, default: "Enterprise SaaS & DeepTech" },
    },
    auditScope: {
      type: String,
      default: "Pre-Series B / Strategic M&A Due Diligence & Comprehensive Corporate Health Audit",
    },
    transactionContext: {
      targetType: { type: String, default: "Strategic Acquisition / Private Equity Investment" },
      proposedValuation: { type: Number, default: 2500000000 },
      financialPeriodAudited: { type: String, default: "FY 2023-24, FY 2024-25 & FY 2025-26" },
      reportingStandard: { type: String, default: "Companies Act 2013, ICAI Standards on Auditing & ICSI Secretarial Standards" },
    },
    overallScore: {
      type: Number,
      required: true,
      default: 92,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      enum: ["Grade A+ (Flawless)", "Grade A (Transaction Ready)", "Grade B (Conditional)", "Grade C (High Risk)", "Grade D (Substantial Default)"],
      default: "Grade A (Transaction Ready)",
    },
    riskCategory: {
      type: String,
      enum: ["low_risk", "moderate_risk", "high_risk", "critical_deal_breaker"],
      default: "low_risk",
    },
    checkpoints: [checkpointSchema],
    totalCheckpoints: { type: Number, default: 100 },
    passedCheckpoints: { type: Number, default: 92 },
    failedCheckpoints: { type: Number, default: 8 },
    penaltyExposure: {
      totalCalculatedPenalty: { type: Number, default: 75000 },
      totalMitigatedPenalty: { type: Number, default: 25000 },
      items: [penaltyExposureSchema],
    },
    compoundingRoadmap: {
      hasCompoundableOffenses: { type: Boolean, default: true },
      competentAuthority: {
        type: String,
        enum: ["Regional Director (RD)", "National Company Law Tribunal (NCLT)"],
        default: "Regional Director (RD)",
      },
      thresholdBasis: { type: String, default: "Aggregate maximum fine is under ₹25 Lakhs per Section 441(1)(b)" },
      identifiedDefaults: [
        {
          section: { type: String },
          description: { type: String },
          periodOfDefault: { type: String },
          estimatedCompoundingFee: { type: Number },
        },
      ],
      petitionDraft: {
        formNumber: { type: String, default: "Form GNL-1 (MCA21) / NCLT-1" },
        prayerSummary: { type: String },
        factualGrounds: [{ type: String }],
        legalPrecedents: [{ type: String }],
      },
    },
    redFlags: [redFlagSchema],
    attestation: {
      leadCs: {
        name: { type: String, default: "CS Rajesh Sharma" },
        membershipNo: { type: String, default: "FCS-8921" },
        cpNumber: { type: String, default: "CP-10293" },
        firm: { type: String, default: "Apex Corporate Secretarial & Legal LLP" },
        digitalSigned: { type: Boolean, default: true },
        signatureHash: { type: String },
        signedAt: { type: String },
      },
      leadCa: {
        name: { type: String, default: "CA Ramanathan Iyer" },
        membershipNo: { type: String, default: "401928" },
        firmRegNo: { type: String, default: "018241N" },
        firm: { type: String, default: "Iyer & Co. Chartered Accountants" },
        udin: { type: String, default: "26401928AAAA129481" },
        digitalSigned: { type: Boolean, default: true },
        signatureHash: { type: String },
        signedAt: { type: String },
      },
      qrVerificationUrl: { type: String },
      integrityHash: { type: String },
      attestedAt: { type: String },
      status: { type: String, default: "Attested & Sealed" },
    },
    status: {
      type: String,
      enum: ["draft", "under_audit", "partner_review", "attested", "delivered"],
      default: "attested",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
dueDiligenceAuditSchema.index({ userId: 1, overallScore: -1 });
dueDiligenceAuditSchema.index({ "clientEntity.cin": 1 });
dueDiligenceAuditSchema.index({ "clientEntity.name": 1 });

export const DueDiligenceAudit =
  mongoose.models.DueDiligenceAudit || mongoose.model("DueDiligenceAudit", dueDiligenceAuditSchema);

export default DueDiligenceAudit;
