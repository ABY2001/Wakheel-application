import mongoose from "mongoose";

const TeamMemberSchema = new mongoose.Schema({
  memberId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  primaryRole: {
    type: String,
    enum: [
      "managing_partner",
      "senior_partner",
      "partner",
      "senior_associate",
      "associate",
      "article_assistant_cs",
      "article_assistant_ca",
      "paralegal",
    ],
    required: true,
  },
  professionalInstitute: {
    type: String,
    enum: ["ICSI", "ICAI", "BCI", "ICSI_STUDENT", "ICAI_STUDENT", "OTHER"],
    required: true,
  },
  registrationNumber: { type: String, required: true }, // e.g. FCS-8921 / FCA-054921 / D/1942/2012
  certificateOfPractice: { type: String }, // e.g. CP-10293
  udinAuthority: { type: Boolean, default: false },
  dscTokenAttached: { type: Boolean, default: false },
  signingAuthorityLevel: {
    type: String,
    enum: ["STATUTORY_SIGNING_PARTNER", "TECHNICAL_REVIEWER", "PREPARATION_ONLY_LOCKED"],
    default: "PREPARATION_ONLY_LOCKED",
  },
  status: { type: String, enum: ["ACTIVE", "ON_LEAVE", "DEPUTATION"], default: "ACTIVE" },
  activeTasksCount: { type: Number, default: 0 },
});

const RegulatoryLockRuleSchema = new mongoose.Schema({
  ruleId: { type: String, required: true },
  statutoryAction: { type: String, required: true }, // e.g. "FORM_3CD_TAX_AUDIT_CERTIFICATION"
  actionName: { type: String, required: true },
  governingAct: { type: String, required: true }, // e.g. "Section 44AB, Income Tax Act, 1961"
  authorizedInstitutes: [{ type: String }], // ["ICAI"]
  authorizedRoles: [{ type: String }], // ["partner", "senior_partner"]
  prohibitedInstitutes: [{ type: String }], // ["ICSI", "BCI"]
  prohibitionCitation: { type: String, required: true },
  penaltyForBreach: { type: String, required: true },
  requiresDualSignOff: { type: Boolean, default: false },
});

const DelegatedTaskSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  title: { type: String, required: true },
  clientName: { type: String, required: true },
  module: { type: String, required: true }, // "ROC_FILING", "TAX_AUDIT_3CD", "GSTR_3B", "BOARD_RESOLUTION"
  assignedTrainee: {
    memberId: { type: String },
    name: { type: String },
    role: { type: String },
  },
  reviewingPartner: {
    memberId: { type: String },
    name: { type: String },
    role: { type: String },
  },
  workpaperReference: { type: String },
  traineeNotes: { type: String },
  partnerReviewNotes: { type: String },
  status: {
    type: String,
    enum: ["DRAFTING_BY_TRAINEE", "SUBMITTED_FOR_REVIEW", "PARTNER_APPROVED", "REVISION_REQUESTED"],
    default: "DRAFTING_BY_TRAINEE",
  },
  fourEyesVerified: { type: Boolean, default: false },
  statutoryLockPreventedDsc: { type: Boolean, default: true },
  submittedAt: { type: String },
  reviewedAt: { type: String },
});

const DualSignOffGateSchema = new mongoose.Schema({
  gateId: { type: String, required: true },
  title: { type: String, required: true },
  transactionType: { type: String, required: true }, // "M&A_DUE_DILIGENCE", "SECTION_177_BOARD_DOSSIER"
  clientName: { type: String, required: true },
  csGate: {
    required: { type: Boolean, default: true },
    statutoryScope: { type: String, default: "Secretarial & MCA21 Corporate Governance Attestation" },
    signedBy: { type: String },
    membershipNumber: { type: String },
    signedAt: { type: String },
    status: { type: String, enum: ["PENDING", "SIGNED"], default: "PENDING" },
  },
  caGate: {
    required: { type: Boolean, default: true },
    statutoryScope: { type: String, default: "Taxation, 3CD & True/Fair View Financial Attestation" },
    signedBy: { type: String },
    membershipNumber: { type: String },
    udin: { type: String },
    signedAt: { type: String },
    status: { type: String, enum: ["PENDING", "SIGNED"], default: "PENDING" },
  },
  overallStatus: { type: String, enum: ["PENDING_DUAL_SIGNOFF", "PARTIALLY_SIGNED", "FULLY_CERTIFIED_RELEASED"], default: "PENDING_DUAL_SIGNOFF" },
  releaseCertificateHash: { type: String },
});

const MdpFirmGovernanceSchema = new mongoose.Schema(
  {
    firmId: { type: String, required: true, unique: true },
    firmName: { type: String, required: true },
    firmStructure: { type: String, default: "Multi-Disciplinary Partnership (LLP)" },
    registrationCinOrLlpin: { type: String, required: true },
    caFirmRegNo: { type: String, required: true }, // ICAI FRN
    csFirmRegNo: { type: String, required: true }, // ICSI Practice Code
    barCouncilRegistration: { type: String },
    headquarters: { type: String, required: true },
    members: [TeamMemberSchema],
    regulatoryRules: [RegulatoryLockRuleSchema],
    delegatedTasks: [DelegatedTaskSchema],
    dualSignOffGates: [DualSignOffGateSchema],
  },
  { timestamps: true }
);

export const MdpFirmGovernance = mongoose.model("MdpFirmGovernance", MdpFirmGovernanceSchema);
