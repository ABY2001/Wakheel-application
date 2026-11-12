import mongoose from "mongoose";

const boardDossierSchema = new mongoose.Schema(
  {
    dossierId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
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
      authorizedCapital: { type: Number, default: 0 },
      paidUpCapital: { type: Number, default: 0 },
    },
    financialYear: {
      type: String,
      required: true,
      default: "2025-26",
    },
    assessmentYear: {
      type: String,
      required: true,
      default: "2026-27",
    },
    boardMeetingDate: {
      type: String,
      required: true,
    },
    meetingType: {
      type: String,
      default: "Audit Committee & Quarterly Board of Directors Meeting",
    },
    governanceStandard: {
      type: String,
      default: "Section 177 & Section 134(5) of the Companies Act, 2013 read with ICSI SS-1 & SS-2",
    },
    directorsList: [
      {
        din: { type: String, required: true },
        name: { type: String, required: true },
        designation: { type: String, required: true },
        appointmentDate: { type: String },
        kycStatus: { type: String, default: "Pending" },
        sec164Clearance: { type: Boolean, default: true },
        shareholdingPercentage: { type: Number, default: 0 },
      },
    ],
    csGovernanceData: {
      aoc4Status: { type: String, default: "Pending" },
      aoc4Srn: { type: String, default: "" },
      mgt7Status: { type: String, default: "Pending" },
      mgt7Srn: { type: String, default: "" },
      boardMeetingsConducted: { type: Number, default: 0 },
      ss1ComplianceScore: { type: Number, default: 0 },
      secretarialAuditOpinion: { type: String, default: "" },
      registeredChargesStatus: { type: String, default: "" },
      activeLitigationsCount: { type: Number, default: 0 },
    },
    caAuditData: {
      itrStatus: { type: String, default: "Pending" },
      itrAckNumber: { type: String, default: "" },
      gstr9Status: { type: String, default: "Pending" },
      form3CdTurnover: { type: Number, default: 0 },
      gstAnnualTurnover: { type: Number, default: 0 },
      mcaFinancialTurnover: { type: Number, default: 0 },
      turnoverVariance: { type: Number, default: 0 },
      udin: { type: String, default: "" },
      clause43bDisallowance: { type: Number, default: 0 },
      indAs12DeferredTax: { type: String, default: "" },
      ifcControlRating: { type: String, default: "" },
    },
    auditCommitteeRisks: [
      {
        category: { type: String, required: true },
        riskLevel: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
        parameter: { type: String, required: true },
        statutorySection: { type: String },
        observation: { type: String },
        mitigationStatus: { type: String },
      },
    ],
    boardResolutionsExtracts: [
      {
        agendaNo: { type: String, required: true },
        title: { type: String, required: true },
        statutorySection: { type: String },
        votingResult: { type: String, default: "Passed Unanimously" },
        signatoryDin: { type: String },
      },
    ],
    dualAttestationSignOff: {
      csSignatory: {
        name: { type: String, default: "" },
        membershipNo: { type: String, default: "" },
        cpNo: { type: String, default: "" },
        firm: { type: String, default: "" },
        signatureHash: { type: String },
        signedAt: { type: String },
      },
      caSignatory: {
        name: { type: String, default: "" },
        membershipNo: { type: String, default: "" },
        firmRegNo: { type: String, default: "" },
        firm: { type: String, default: "" },
        udin: { type: String, default: "" },
        signatureHash: { type: String },
        signedAt: { type: String },
      },
      jointDeclaration: { type: String },
      qrVerificationUrl: { type: String },
      status: { type: String, enum: ["Draft", "Signed & Sealed", "Presented to Board"], default: "Draft" },
    },
    dossierDigestSha256: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      default: "3.4.1-FINAL",
    },
  },
  {
    timestamps: true,
  }
);

export const BoardDossier =
  mongoose.models.BoardDossier || mongoose.model("BoardDossier", boardDossierSchema);
export default BoardDossier;
