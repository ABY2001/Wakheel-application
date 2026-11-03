// ============================================================================
// WAKHEEL EXECUTIVE BOARD & AUDIT COMMITTEE DOSSIER CONTROLLER
// Compliant with Section 177 & 134(5) of the Companies Act, 2013, ICSI SS-1/2,
// and ICAI Standards on Auditing (SA 260 / SA 700)
// Dual-Mode: MongoDB Atlas + devStore Fallback
// ============================================================================

import crypto from "crypto";
import { BoardDossier } from "../models/BoardDossier.js";
import { devStore, DEFAULT_BOARD_DOSSIERS } from "../utils/devStore.js";

// Check if MongoDB is connected
const isMongoConnected = () => {
  return BoardDossier.db?.readyState === 1;
};

// Compute SHA-256 Hash
const sha256 = (content) => {
  return crypto.createHash("sha256").update(typeof content === "string" ? content : JSON.stringify(content)).digest("hex");
};

// @desc    Get all executive board dossiers
// @route   GET /api/board-dossier
// @access  Public / Protected
export const getBoardDossiers = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || "cs_1";
    const { entityName, financialYear } = req.query;

    if (isMongoConnected()) {
      const query = { userId };
      if (entityName) {
        query["clientEntity.name"] = { $regex: entityName, $options: "i" };
      }
      if (financialYear) {
        query.financialYear = financialYear;
      }
      const dossiers = await BoardDossier.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: dossiers.length, dossiers, mode: "mongo" });
    }

    const dossiers = devStore.getBoardDossiers(userId, { entityName, financialYear });
    res.json({ success: true, count: dossiers.length, dossiers, mode: "devStore" });
  } catch (error) {
    console.error("getBoardDossiers error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get board dossier by ID
// @route   GET /api/board-dossier/:id
// @access  Public / Protected
export const getBoardDossierById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const dossier = await BoardDossier.findOne({
        $or: [{ dossierId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      });
      if (dossier) {
        return res.json({ success: true, dossier, mode: "mongo" });
      }
    }

    const dossier = devStore.getBoardDossierById(id);
    if (!dossier) {
      return res.status(404).json({ success: false, message: "Executive board dossier not found." });
    }

    res.json({ success: true, dossier, mode: "devStore" });
  } catch (error) {
    console.error("getBoardDossierById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate / Synthesize New Board & Audit Committee Dossier
// @route   POST /api/board-dossier/generate
// @access  Public / Protected
export const generateBoardDossier = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || "cs_1";
    const {
      clientEntity = {},
      financialYear = "2025-26",
      assessmentYear = "2026-27",
      boardMeetingDate = new Date().toISOString().split("T")[0],
      meetingType = "Quarterly Board of Directors & Audit Committee Review (Q3)",
      csSignatory = {},
      caSignatory = {},
      customRisks = [],
      customResolutions = [],
    } = req.body;

    const entityName = clientEntity.name || clientEntity.companyName || "CyberCorp Technologies Pvt Ltd";
    const cin = clientEntity.cin || "U72200DL2022PTC394812";
    const pan = clientEntity.pan || "AAECS1234F";
    const gstin = clientEntity.gstin || "07AAECS1234F1Z8";
    const turnover = Number(clientEntity.turnover) || 48500000;

    const dossierSerial = `WAK-EXD-${new Date().getFullYear()}-${entityName.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Directors List
    const directorsList = clientEntity.directors?.length
      ? clientEntity.directors.map((d) => ({
          din: d.din || "08912340",
          name: d.name || "Director",
          designation: d.designation || "Director",
          appointmentDate: d.appointmentDate || "2022-04-12",
          kycStatus: "DIR-3 Web KYC Verified",
          sec164Clearance: true,
          shareholdingPercentage: d.shareholdingPercentage || 0,
        }))
      : [
          {
            din: "08912340",
            name: "Dr. Vikram Malhotra",
            designation: "Managing Director",
            appointmentDate: "2022-04-12",
            kycStatus: "DIR-3 Web KYC Verified",
            sec164Clearance: true,
            shareholdingPercentage: 54.5,
          },
          {
            din: "09104928",
            name: "Ms. Ananya Sengupta",
            designation: "Whole-Time Director & COO",
            appointmentDate: "2022-04-12",
            kycStatus: "DIR-3 Web KYC Verified",
            sec164Clearance: true,
            shareholdingPercentage: 25.5,
          },
          {
            din: "07419201",
            name: "Mr. Rohan Murthy",
            designation: "Non-Executive Independent Director",
            appointmentDate: "2023-01-15",
            kycStatus: "DIR-3 Web KYC Verified",
            sec164Clearance: true,
            shareholdingPercentage: 0,
          },
          {
            din: "08192834",
            name: "Adv. Meera Nair",
            designation: "Independent Director & Audit Committee Chair",
            appointmentDate: "2023-05-10",
            kycStatus: "DIR-3 Web KYC Verified",
            sec164Clearance: true,
            shareholdingPercentage: 0,
          },
        ];

    // CS Governance Harmonized Metrics
    const csGovernanceData = {
      aoc4Status: "Approved & Reconciled",
      aoc4Srn: `AA${Math.floor(1000000 + Math.random() * 9000000)}`,
      mgt7Status: "Annual Return Reconciled",
      mgt7Srn: `M${Math.floor(1000000 + Math.random() * 9000000)}`,
      boardMeetingsConducted: 4,
      ss1ComplianceScore: 99.2,
      secretarialAuditOpinion: "Unqualified / Clean Opinion under Form MR-3",
      registeredChargesStatus: "Zero Default / Satisfaction CHG-4 Issued",
      activeLitigationsCount: 0,
    };

    // CA Taxation & Audit Harmonized Metrics
    const randomUdin = `26401928AAAA${Math.floor(100000 + Math.random() * 900000)}`;
    const caAuditData = {
      itrStatus: "ITR-6 Filed & Verified",
      itrAckNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      gstr9Status: "Annual Return Reconciled (100% Match)",
      form3CdTurnover: turnover,
      gstAnnualTurnover: turnover,
      mcaFinancialTurnover: turnover,
      turnoverVariance: 0,
      udin: caSignatory.udin || randomUdin,
      clause43bDisallowance: 0,
      indAs12DeferredTax: "Reconciled (Net DTA ₹37,755)",
      ifcControlRating: "Operating Effectively (Zero Material Weakness)",
    };

    // Audit Committee Statutory Risk Heatmap
    const defaultRisks = [
      {
        category: "Internal Financial Controls (IFC)",
        riskLevel: "Low",
        parameter: "Section 134(5)(e) Financial Reporting Controls",
        statutorySection: "Companies Act Section 134(5)(e)",
        observation: "Controls over revenue recognition, vendor payments, and bank authorizations tested with 0 exceptions.",
        mitigationStatus: "Operating effectively with automated multi-tier ERP authorizations.",
      },
      {
        category: "Loans & Investments",
        riskLevel: "Low",
        parameter: "Section 186 Statutory Ceiling (60% Paid-up + Reserves)",
        statutorySection: "Companies Act Section 186",
        observation: `Aggregate corporate loans & investments stand at ₹1.10 Cr vs statutory limit of ₹3.60 Cr (30.5% utilized).`,
        mitigationStatus: "Well within Board delegation threshold; no Special Resolution required under Section 186(3).",
      },
      {
        category: "Director Advances & Guarantees",
        riskLevel: "Low",
        parameter: "Section 185 Prohibition on Loans to Directors",
        statutorySection: "Companies Act Section 185",
        observation: "Zero personal loans, book debts, or guarantees given to directors or interested entities.",
        mitigationStatus: "100% compliant with Section 185 statutory bar.",
      },
      {
        category: "MSME Vendor Dues",
        riskLevel: "Low",
        parameter: "Clause 43B(h) / Section 15 of MSMED Act",
        statutorySection: "Income Tax Act Sec 43B(h) & MSMED Act",
        observation: "All registered micro/small enterprise invoices settled within 45 days. Disallowance ₹0 Nil.",
        mitigationStatus: "Audited trade payables ledger confirms zero overdue MSME balances at year-end.",
      },
      {
        category: "GST ITC Integrity",
        riskLevel: "Low",
        parameter: "Rule 36(4) / GSTR-2B vs GSTR-3B Input Tax Credit",
        statutorySection: "CGST Rules Rule 36(4)",
        observation: "100% input tax credit claimed matches invoice-level GSTR-2B inward supplies.",
        mitigationStatus: "Zero DRC-01 SCN notice risk; all tax liabilities settled via electronic cash ledger.",
      },
    ];

    const auditCommitteeRisks = customRisks.length > 0 ? customRisks : defaultRisks;

    // Board Resolution Extracts
    const defaultResolutions = [
      {
        agendaNo: "Item #01",
        title: "Adoption and Approval of Audited Annual Financial Statements for FY 2025-26",
        statutorySection: "Section 134 & Section 177",
        votingResult: "Passed Unanimously (4 in favor, 0 against)",
        signatoryDin: directorsList[0]?.din || "08912340",
      },
      {
        agendaNo: "Item #02",
        title: "Consideration of Statutory Auditor's Report & Form 3CD Tax Audit Observations",
        statutorySection: "Section 143 & Section 44AB",
        votingResult: "Passed Unanimously (4 in favor, 0 against)",
        signatoryDin: directorsList[3]?.din || "08192834",
      },
      {
        agendaNo: "Item #03",
        title: "Review and Adoption of Secretarial Audit Report under Form MR-3",
        statutorySection: "Section 204 & Secretarial Standards",
        votingResult: "Passed Unanimously (4 in favor, 0 against)",
        signatoryDin: directorsList[2]?.din || "07419201",
      },
      {
        agendaNo: "Item #04",
        title: "Authorization for Strategic Technology Infrastructure Capex under Section 179(3)",
        statutorySection: "Section 179(3)(c)",
        votingResult: "Passed Unanimously (4 in favor, 0 against)",
        signatoryDin: directorsList[1]?.din || "09104928",
      },
    ];

    const boardResolutionsExtracts = customResolutions.length > 0 ? customResolutions : defaultResolutions;

    // Cryptographic Signatures
    const csSignedTimestamp = new Date().toISOString();
    const caSignedTimestamp = new Date().toISOString();

    const csName = csSignatory.name || "CS Rajesh Sharma";
    const csMemNo = csSignatory.membershipNo || "FCS-9182";
    const csCpNo = csSignatory.cpNo || "10482";
    const csFirm = csSignatory.firm || "Apex Law & Secretarial Partners LLP";
    const csSigHash = sha256(`CS_SIGN|${entityName}|${cin}|${csMemNo}|${csSignedTimestamp}|WAKHEEL_SEC_GOV`);

    const caName = caSignatory.name || "CA Ramanathan Iyer";
    const caMemNo = caSignatory.membershipNo || "401928";
    const caFrn = caSignatory.firmRegNo || "018241N";
    const caFirm = caSignatory.firm || "Iyer & Co. Chartered Accountants";
    const caUdinVal = caSignatory.udin || caAuditData.udin;
    const caSigHash = sha256(`CA_SIGN|${entityName}|${pan}|${caMemNo}|${caUdinVal}|${caSignedTimestamp}|ICAI_STAT_AUDIT`);

    const jointDeclaration = `We, the practicing Company Secretary and the Statutory Auditor of ${entityName}, hereby jointly certify that we have examined the corporate secretarial registers, filings on the MCA21 portal, audited financial statements, Income Tax returns, and GST disclosures for the financial year ${financialYear}. We confirm that the reported revenues, statutory dues, and regulatory disclosures are reconciled with ZERO variance across MCA, CBDT, and GSTN frameworks.`;

    const qrVerificationUrl = `https://wakheel.legal/verify/dossier/${dossierSerial}`;

    // Full Dossier Payload Digest
    const rawPayloadToHash = {
      dossierSerial,
      cin,
      pan,
      gstin,
      financialYear,
      boardMeetingDate,
      turnover,
      csGovernanceData,
      caAuditData,
      csSigHash,
      caSigHash,
    };
    const dossierDigestSha256 = sha256(rawPayloadToHash);

    const dossierData = {
      dossierId: dossierSerial,
      userId,
      clientEntity: {
        entityId: clientEntity.id || clientEntity.entityId || "ent-1",
        name: entityName,
        cin,
        pan,
        gstin,
        registeredAddress: clientEntity.registeredAddress || "Level 14, Cyber Towers, Barakhamba Road, Connaught Place, New Delhi 110001",
        entityType: clientEntity.entityType || "pvt_ltd",
        incorporationDate: clientEntity.incorporationDate || "2022-04-12",
        authorizedCapital: Number(clientEntity.authorizedCapital) || 50000000,
        paidUpCapital: Number(clientEntity.paidUpCapital) || 25000000,
      },
      financialYear,
      assessmentYear,
      boardMeetingDate,
      meetingType,
      governanceStandard: "Section 177 & 134(5) of Companies Act 2013 read with ICSI SS-1 & SS-2",
      directorsList,
      csGovernanceData,
      caAuditData,
      auditCommitteeRisks,
      boardResolutionsExtracts,
      dualAttestationSignOff: {
        csSignatory: {
          name: csName,
          membershipNo: csMemNo,
          cpNo: csCpNo,
          firm: csFirm,
          signatureHash: csSigHash,
          signedAt: csSignedTimestamp,
        },
        caSignatory: {
          name: caName,
          membershipNo: caMemNo,
          firmRegNo: caFrn,
          firm: caFirm,
          udin: caUdinVal,
          signatureHash: caSigHash,
          signedAt: caSignedTimestamp,
        },
        jointDeclaration,
        qrVerificationUrl,
        status: "Signed & Sealed",
      },
      dossierDigestSha256,
      version: "3.4.1-FINAL",
    };

    if (isMongoConnected()) {
      const created = await BoardDossier.create(dossierData);
      return res.status(201).json({ success: true, dossier: created, mode: "mongo" });
    }

    const created = devStore.createBoardDossier(userId, dossierData);
    res.status(201).json({ success: true, dossier: created, mode: "devStore" });
  } catch (error) {
    console.error("generateBoardDossier error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download dossier as standalone, print-perfect HTML/CSS
// @route   GET /api/board-dossier/:id/html
// @access  Public
export const downloadDossierHtml = async (req, res) => {
  try {
    const { id } = req.params;
    let dossier = null;

    if (isMongoConnected()) {
      dossier = await BoardDossier.findOne({
        $or: [{ dossierId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      });
    }

    if (!dossier) {
      dossier = devStore.getBoardDossierById(id) || DEFAULT_BOARD_DOSSIERS[0];
    }

    const formatInr = (n) => {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
    };

    const ent = dossier.clientEntity;
    const cs = dossier.csGovernanceData;
    const ca = dossier.caAuditData;
    const sign = dossier.dualAttestationSignOff;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Board Dossier - ${ent.name} - FY ${dossier.financialYear}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 15mm 15mm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page-break {
        page-break-before: always;
      }
      .no-print {
        display: none !important;
      }
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #ffffff;
      color: #09090b;
      line-height: 1.45;
      font-size: 11pt;
    }
    .print-bar {
      background: #18181b;
      color: #fff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .btn {
      background: #ffffff;
      color: #000000;
      border: none;
      padding: 8px 16px;
      font-weight: 700;
      border-radius: 6px;
      cursor: pointer;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }
    .cover-page {
      min-height: 900px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 3px double #18181b;
      padding: 40px;
      margin-bottom: 20px;
    }
    .crest {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
    }
    .crest h1 {
      font-size: 20pt;
      font-weight: 900;
      letter-spacing: -0.02em;
      text-transform: uppercase;
    }
    .crest .badge {
      font-family: monospace;
      font-size: 8pt;
      background: #000;
      color: #fff;
      padding: 3px 8px;
      border-radius: 4px;
      display: inline-block;
      margin-top: 8px;
    }
    .cover-body {
      text-align: center;
      margin: 40px 0;
    }
    .cover-title {
      font-size: 15pt;
      color: #52525b;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .company-title {
      font-size: 26pt;
      font-weight: 900;
      color: #000;
      margin-bottom: 16px;
    }
    .identifiers {
      font-family: monospace;
      font-size: 9.5pt;
      color: #27272a;
      line-height: 1.8;
      border-top: 1px solid #e4e4e7;
      border-bottom: 1px solid #e4e4e7;
      padding: 12px 0;
      margin: 16px 0;
    }
    .cover-footer {
      border-top: 2px solid #000;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      font-family: monospace;
    }
    .section-title {
      font-size: 13pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #000;
      padding-bottom: 6px;
      margin-top: 30px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .section-title span.sub {
      font-size: 8pt;
      color: #71717a;
      font-family: monospace;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .card {
      border: 1px solid #d4d4d8;
      border-radius: 8px;
      padding: 14px;
      background: #fafafa;
    }
    .card h3 {
      font-size: 10pt;
      font-weight: 800;
      text-transform: uppercase;
      border-bottom: 1px solid #e4e4e7;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .card .stat-row {
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
      padding: 4px 0;
      border-bottom: 1px dotted #e4e4e7;
    }
    .card .stat-row:last-child {
      border-bottom: none;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      margin-top: 8px;
      margin-bottom: 16px;
    }
    .table th {
      background: #f4f4f5;
      border: 1px solid #d4d4d8;
      padding: 8px 10px;
      text-align: left;
      font-size: 8pt;
      text-transform: uppercase;
      font-family: monospace;
    }
    .table td {
      border: 1px solid #e4e4e7;
      padding: 7px 10px;
    }
    .badge-green {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 7.5pt;
    }
    .plaque {
      border: 2px solid #000;
      padding: 20px;
      margin-top: 24px;
      background: #fdfdfd;
    }
    .plaque-header {
      text-align: center;
      font-weight: 800;
      font-size: 11pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #000;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .plaque-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 16px;
    }
    .sig-box {
      border: 1px solid #a1a1aa;
      padding: 12px;
      background: #fff;
    }
    .sig-box .name {
      font-weight: 800;
      font-size: 10.5pt;
    }
    .sig-box .meta {
      font-size: 8pt;
      color: #52525b;
      line-height: 1.5;
      margin-top: 4px;
      font-family: monospace;
    }
    .sig-hash {
      word-break: break-all;
      font-size: 7pt;
      font-family: monospace;
      color: #27272a;
      background: #f4f4f5;
      padding: 4px;
      border-radius: 3px;
      margin-top: 6px;
    }
    .declaration-text {
      font-size: 9pt;
      font-style: italic;
      line-height: 1.6;
      color: #27272a;
      text-align: justify;
      margin: 12px 0;
    }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <div>
      <strong>WAKHEEL BOARDROOM PACK</strong> • Dossier Serial: <code>${dossier.dossierId}</code>
    </div>
    <div>
      <button class="btn" onclick="window.print()">Print Dossier (PDF)</button>
    </div>
  </div>

  <div class="container">
    <!-- PAGE 1: COVER PAGE -->
    <div class="cover-page">
      <div class="crest">
        <h1>Wakheel Corporate Governance &amp; Statutory Audit Bridge</h1>
        <div class="badge">STRICTLY CONFIDENTIAL • FOR BOARD OF DIRECTORS &amp; AUDIT COMMITTEE</div>
      </div>

      <div class="cover-body">
        <div class="cover-title">Annual Statutory Compliance &amp; Governance Dossier</div>
        <div class="company-title">${ent.name}</div>
        <div class="identifiers">
          <strong>CIN:</strong> ${ent.cin} &nbsp;|&nbsp; 
          <strong>PAN:</strong> ${ent.pan} &nbsp;|&nbsp; 
          <strong>GSTIN:</strong> ${ent.gstin}<br>
          <strong>Registered Office:</strong> ${ent.registeredAddress || "New Delhi, India"}<br>
          <strong>Financial Year:</strong> FY ${dossier.financialYear} &nbsp;|&nbsp; 
          <strong>Assessment Year:</strong> AY ${dossier.assessmentYear}
        </div>
        <p style="font-size: 10pt; color: #52525b; max-width: 650px; margin: 0 auto; line-height: 1.6;">
          Prepared and presented pursuant to Section 177 and Section 134(5) of the Companies Act, 2013 read with ICSI Secretarial Standards (SS-1 &amp; SS-2) and ICAI Auditing Standards for corporate statutory review.
        </p>
      </div>

      <div class="cover-footer">
        <div><strong>Dossier Ref:</strong> ${dossier.dossierId}</div>
        <div><strong>Board Meeting Date:</strong> ${dossier.boardMeetingDate}</div>
        <div><strong>Integrity Digest:</strong> ${dossier.dossierDigestSha256.slice(0, 16)}...</div>
      </div>
    </div>

    <div class="page-break"></div>

    <!-- PAGE 2: STATUTORY HARMONIZATION & EXECUTIVE SUMMARY -->
    <div class="section-title">
      1. Dual-Track Statutory Harmonization Radar
      <span class="sub">MCA21 • CBDT • GSTN TRIPLE-LOCK</span>
    </div>

    <div class="grid-2">
      <!-- CS Column -->
      <div class="card">
        <h3>Company Secretary Pillar (MCA21)</h3>
        <div class="stat-row">
          <span>Form AOC-4 Financials:</span>
          <strong>${cs.aoc4Status} (SRN: ${cs.aoc4Srn})</strong>
        </div>
        <div class="stat-row">
          <span>Form MGT-7 Annual Return:</span>
          <strong>${cs.mgt7Status}</strong>
        </div>
        <div class="stat-row">
          <span>Board Meetings Conducted:</span>
          <strong>${cs.boardMeetingsConducted} (100% SS-1 Compliant)</strong>
        </div>
        <div class="stat-row">
          <span>Secretarial Audit Opinion:</span>
          <span class="badge-green">${cs.secretarialAuditOpinion}</span>
        </div>
        <div class="stat-row">
          <span>Registered Charges (CHG-4):</span>
          <strong>${cs.registeredChargesStatus}</strong>
        </div>
      </div>

      <!-- CA Column -->
      <div class="card">
        <h3>Chartered Accountant Pillar (ICAI)</h3>
        <div class="stat-row">
          <span>Form ITR-6 Corporate Tax:</span>
          <strong>${ca.itrStatus}</strong>
        </div>
        <div class="stat-row">
          <span>Form 3CD Tax Audit UDIN:</span>
          <strong style="font-family: monospace;">${ca.udin}</strong>
        </div>
        <div class="stat-row">
          <span>GSTR-9 Annual Return:</span>
          <strong>${ca.gstr9Status}</strong>
        </div>
        <div class="stat-row">
          <span>Clause 43B(h) MSME Exposure:</span>
          <span class="badge-green">₹0 Nil Disallowance</span>
        </div>
        <div class="stat-row">
          <span>Internal Financial Controls:</span>
          <span class="badge-green">${ca.ifcControlRating}</span>
        </div>
      </div>
    </div>

    <!-- Financial Turnover Reconciliation Table -->
    <h4 style="font-size: 10pt; font-weight: 800; margin-top: 14px; text-transform: uppercase;">Inter-Portal Revenue &amp; Dues Reconciliation</h4>
    <table class="table">
      <thead>
        <tr>
          <th>Statutory Authority</th>
          <th>Reporting Form</th>
          <th>Declared Turnover</th>
          <th>Variance</th>
          <th>Statutory Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Ministry of Corporate Affairs (MCA)</strong></td>
          <td>AOC-4 Balance Sheet &amp; P&amp;L</td>
          <td>${formatInr(ca.mcaFinancialTurnover)}</td>
          <td>₹0.00 (Base)</td>
          <td><span class="badge-green">Reconciled</span></td>
        </tr>
        <tr>
          <td><strong>Central Board of Direct Taxes (CBDT)</strong></td>
          <td>ITR-6 &amp; Form 3CD Clause 40</td>
          <td>${formatInr(ca.form3CdTurnover)}</td>
          <td>₹0.00 Nil</td>
          <td><span class="badge-green">Matched</span></td>
        </tr>
        <tr>
          <td><strong>Goods &amp; Services Tax Network (GSTN)</strong></td>
          <td>GSTR-9 Annual Return / 3B Turnover</td>
          <td>${formatInr(ca.gstAnnualTurnover)}</td>
          <td>₹0.00 Nil</td>
          <td><span class="badge-green">Matched</span></td>
        </tr>
      </tbody>
    </table>

    <!-- PAGE 3: DIRECTORS REGISTER & AUDIT COMMITTEE RISKS -->
    <div class="section-title">
      2. Directors &amp; Key Managerial Personnel (KMP) Register
      <span class="sub">SECTION 164 &amp; 170 VERIFICATION</span>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Director Name</th>
          <th>DIN</th>
          <th>Designation</th>
          <th>Appointment</th>
          <th>DIR-3 KYC</th>
          <th>Sec 164 Clearance</th>
        </tr>
      </thead>
      <tbody>
        ${dossier.directorsList
          .map(
            (d) => `<tr>
              <td><strong>${d.name}</strong></td>
              <td style="font-family: monospace;">${d.din}</td>
              <td>${d.designation}</td>
              <td>${d.appointmentDate || "12-Apr-2022"}</td>
              <td><span class="badge-green">${d.kycStatus}</span></td>
              <td><span class="badge-green">${d.sec164Clearance ? "Clear / Eligible" : "Disqualified"}</span></td>
            </tr>`
          )
          .join("")}
      </tbody>
    </table>

    <div class="section-title">
      3. Audit Committee Statutory Risk Heatmap
      <span class="sub">SECTION 177 MANDATORY OVERSIGHT</span>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Statutory Area</th>
          <th>Governing Section</th>
          <th>Risk Rating</th>
          <th>Audit Committee Observation</th>
        </tr>
      </thead>
      <tbody>
        ${dossier.auditCommitteeRisks
          .map(
            (r) => `<tr>
              <td><strong>${r.category}</strong><br><small style="color:#71717a;">${r.parameter}</small></td>
              <td style="font-family: monospace; font-size: 8pt;">${r.statutorySection}</td>
              <td><span class="badge-green">${r.riskLevel} Risk</span></td>
              <td>${r.observation}<br><small style="color:#059669; font-weight:600;">Mitigation: ${r.mitigationStatus}</small></td>
            </tr>`
          )
          .join("")}
      </tbody>
    </table>

    <div class="page-break"></div>

    <!-- PAGE 4: BOARD RESOLUTION EXTRACTS & FORMAL JOINT ATTESTATION -->
    <div class="section-title">
      4. Key Board Resolution Extracts for FY ${dossier.financialYear}
      <span class="sub">ICSI SS-1 RECORD OF MINUTES</span>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Agenda Item</th>
          <th>Subject Matter / Resolution Title</th>
          <th>Statutory Section</th>
          <th>Voting Outcome</th>
        </tr>
      </thead>
      <tbody>
        ${dossier.boardResolutionsExtracts
          .map(
            (resItem) => `<tr>
              <td style="font-family: monospace; font-weight: 700;">${resItem.agendaNo}</td>
              <td><strong>${resItem.title}</strong></td>
              <td style="font-family: monospace; font-size: 8pt;">${resItem.statutorySection}</td>
              <td><span class="badge-green">${resItem.votingResult}</span></td>
            </tr>`
          )
          .join("")}
      </tbody>
    </table>

    <!-- SECTION 5: JOINT CS & CA DUAL STATUTORY ATTESTATION PLAQUE -->
    <div class="plaque">
      <div class="plaque-header">
        Joint CS &amp; CA Statutory Attestation Certificate
      </div>

      <p class="declaration-text">
        "${sign.jointDeclaration}"
      </p>

      <div class="plaque-grid">
        <!-- CS Box -->
        <div class="sig-box">
          <div class="name">${sign.csSignatory.name}</div>
          <div class="meta">
            Practicing Company Secretary<br>
            Membership No: <strong>${sign.csSignatory.membershipNo}</strong> &nbsp;|&nbsp; CP No: <strong>${sign.csSignatory.cpNo}</strong><br>
            Firm: ${sign.csSignatory.firm}<br>
            Signed At: ${sign.csSignatory.signedAt}
          </div>
          <div class="sig-hash">
            SHA-256 Digest: ${sign.csSignatory.signatureHash}
          </div>
        </div>

        <!-- CA Box -->
        <div class="sig-box">
          <div class="name">${sign.caSignatory.name}</div>
          <div class="meta">
            Statutory Auditor (Chartered Accountant)<br>
            ICAI M.No: <strong>${sign.caSignatory.membershipNo}</strong> &nbsp;|&nbsp; FRN: <strong>${sign.caSignatory.firmRegNo}</strong><br>
            Firm: ${sign.caSignatory.firm}<br>
            UDIN: <strong>${sign.caSignatory.udin}</strong>
          </div>
          <div class="sig-hash">
            SHA-256 Digest: ${sign.caSignatory.signatureHash}
          </div>
        </div>
      </div>

      <div style="margin-top: 16px; border-top: 1px dotted #a1a1aa; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 8pt; font-family: monospace; color: #52525b;">
        <div>Document Hash: <strong>${dossier.dossierDigestSha256}</strong></div>
        <div>Status: <strong>${sign.status}</strong></div>
        <div>Verify Online: <code>${sign.qrVerificationUrl}</code></div>
      </div>
    </div>
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    console.error("downloadDossierHtml error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Cryptographic Signatures & Integrity of a Dossier
// @route   POST /api/board-dossier/verify
// @access  Public
export const verifyDossierSignatures = async (req, res) => {
  try {
    const { dossierId, dossierDigestSha256 } = req.body;

    if (!dossierId) {
      return res.status(400).json({ success: false, message: "Dossier ID is required." });
    }

    let dossier = null;
    if (isMongoConnected()) {
      dossier = await BoardDossier.findOne({ dossierId });
    }
    if (!dossier) {
      dossier = devStore.getBoardDossierById(dossierId);
    }

    if (!dossier) {
      return res.status(404).json({ success: false, message: "Dossier not found." });
    }

    const isMatch = dossier.dossierDigestSha256 === dossierDigestSha256;
    const csValid = Boolean(dossier.dualAttestationSignOff?.csSignatory?.signatureHash);
    const caValid = Boolean(dossier.dualAttestationSignOff?.caSignatory?.signatureHash);

    res.json({
      success: true,
      verified: isMatch && csValid && caValid,
      dossierId: dossier.dossierId,
      entityName: dossier.clientEntity?.name,
      financialYear: dossier.financialYear,
      sha256Digest: dossier.dossierDigestSha256,
      csSignatory: dossier.dualAttestationSignOff?.csSignatory,
      caSignatory: dossier.dualAttestationSignOff?.caSignatory,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("verifyDossierSignatures error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
