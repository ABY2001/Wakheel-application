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
        kycStatus: { type: String, default: "DIR-3 KYC Completed" },
        sec164Clearance: { type: Boolean, default: true },
        shareholdingPercentage: { type: Number, default: 0 },
      },
    ],
    csGovernanceData: {
      aoc4Status: { type: String, default: "Approved" },
      aoc4Srn: { type: String, default: "AA8910245" },
      mgt7Status: { type: String, default: "Filed & Reconciled" },
      mgt7Srn: { type: String, default: "M8819201" },
      boardMeetingsConducted: { type: Number, default: 4 },
      ss1ComplianceScore: { type: Number, default: 99.2 },
      secretarialAuditOpinion: { type: String, default: "Clean / Unqualified (MR-3)" },
      registeredChargesStatus: { type: String, default: "Zero Default / CHG-4 Satisfied" },
      activeLitigationsCount: { type: Number, default: 0 },
    },
    caAuditData: {
      itrStatus: { type: String, default: "ITR-6 Filed & Verified" },
      itrAckNumber: { type: String, default: "9812401823" },
      gstr9Status: { type: String, default: "Annual Return Reconciled" },
      form3CdTurnover: { type: Number, default: 48500000 },
      gstAnnualTurnover: { type: Number, default: 48500000 },
      mcaFinancialTurnover: { type: Number, default: 48500000 },
      turnoverVariance: { type: Number, default: 0 },
      udin: { type: String, default: "26401928AAAA129481" },
      clause43bDisallowance: { type: Number, default: 0 },
      indAs12DeferredTax: { type: String, default: "Reconciled (Net DTA ₹37,755)" },
      ifcControlRating: { type: String, default: "Operating Effectively" },
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
        name: { type: String, default: "CS Rajesh Sharma" },
        membershipNo: { type: String, default: "FCS-9182" },
        cpNo: { type: String, default: "10482" },
        firm: { type: String, default: "Apex Law & Secretarial Partners LLP" },
        signatureHash: { type: String },
        signedAt: { type: String },
      },
      caSignatory: {
        name: { type: String, default: "CA Ramanathan Iyer" },
        membershipNo: { type: String, default: "401928" },
        firmRegNo: { type: String, default: "018241N" },
        firm: { type: String, default: "Iyer & Co. Chartered Accountants" },
        udin: { type: String, default: "26401928AAAA129481" },
        signatureHash: { type: String },
        signedAt: { type: String },
      },
      jointDeclaration: { type: String },
      qrVerificationUrl: { type: String },
      status: { type: String, enum: ["Draft", "Signed & Sealed", "Presented to Board"], default: "Signed & Sealed" },
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
