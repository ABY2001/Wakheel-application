// ============================================================================
// WAKHEEL STATUTORY DUE DILIGENCE & M&A COMPLIANCE SCORECARD CONTROLLER
// 100-Point Audit Engine, Statutory Penalty Calculator & Section 441 Compounding
// Dual-Mode Architecture: MongoDB Atlas + devStore Fallback
// ============================================================================

import crypto from "crypto";
import { DueDiligenceAudit } from "../models/DueDiligenceAudit.js";
import { devStore, DEFAULT_DUE_DILIGENCE_AUDITS } from "../utils/devStore.js";

// Check if MongoDB is active
const isMongoConnected = () => {
  return DueDiligenceAudit.db?.readyState === 1;
};

// Compute SHA-256 Hash
const sha256 = (content) => {
  return crypto
    .createHash("sha256")
    .update(typeof content === "string" ? content : JSON.stringify(content))
    .digest("hex");
};

// Helper: Calculate Score, Grade & Risk Category from Checkpoints
const evaluateScoreAndGrade = (checkpoints = []) => {
  const total = checkpoints.length || 100;
  const passed = checkpoints.filter((c) => c.status === "compliant" || c.status === "not_applicable").length;
  const failed = total - passed;
  const score = Math.round((passed / total) * 100);

  let grade = "Grade A (Transaction Ready)";
  let riskCategory = "low_risk";

  if (score >= 95) {
    grade = "Grade A+ (Flawless)";
    riskCategory = "low_risk";
  } else if (score >= 85) {
    grade = "Grade A (Transaction Ready)";
    riskCategory = "low_risk";
  } else if (score >= 70) {
    grade = "Grade B (Conditional)";
    riskCategory = "moderate_risk";
  } else if (score >= 50) {
    grade = "Grade C (High Risk)";
    riskCategory = "high_risk";
  } else {
    grade = "Grade D (Substantial Default)";
    riskCategory = "critical_deal_breaker";
  }

  return { score, grade, riskCategory, passed, failed, total };
};

const getUserId = (req) => {
  const id = req.user?.id || req.user?._id;
  return id ? String(id) : "";
};

const getBlankCheckpointTemplate = () => {
  const template = DEFAULT_DUE_DILIGENCE_AUDITS?.[0]?.checkpoints || [];
  return template.map((c) => ({
    checkpointId: c.checkpointId,
    title: c.title,
    category: c.category,
    statutorySection: c.statutorySection,
    status: "not_applicable",
    points: c.points || 1,
    earnedPoints: 0,
    evidenceDocument: "",
    observation: "",
    riskWeight: c.riskWeight || "low",
    remedialAction: "",
  }));
};

// @desc    Get all due diligence audits
// @route   GET /api/due-diligence
// @access  Protected
export const getDueDiligenceAudits = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required." });
    const { entityName, riskCategory } = req.query;

    if (isMongoConnected()) {
      const query = { userId };
      if (entityName) {
        query["clientEntity.name"] = { $regex: entityName, $options: "i" };
      }
      if (riskCategory) {
        query.riskCategory = riskCategory;
      }
      const audits = await DueDiligenceAudit.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: audits.length, audits, mode: "mongo" });
    }

    const audits = devStore.getDueDiligenceAudits(userId, { entityName, riskCategory });
    res.json({ success: true, count: audits.length, audits, mode: "devStore" });
  } catch (error) {
    console.error("getDueDiligenceAudits error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get due diligence audit by ID
// @route   GET /api/due-diligence/:id
// @access  Protected
export const getDueDiligenceAuditById = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required." });
    const { id } = req.params;

    if (isMongoConnected()) {
      const audit = await DueDiligenceAudit.findOne({
        userId,
        $or: [{ auditId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      });
      if (!audit) {
        return res.status(404).json({ success: false, message: "Due diligence audit not found" });
      }
      return res.json({ success: true, audit, mode: "mongo" });
    }

    const audit = devStore.getDueDiligenceAuditById(id, userId);
    if (!audit) {
      return res.status(404).json({ success: false, message: "Due diligence audit not found" });
    }
    res.json({ success: true, audit, mode: "devStore" });
  } catch (error) {
    console.error("getDueDiligenceAuditById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new due diligence audit
// @route   POST /api/due-diligence
// @access  Protected
export const createDueDiligenceAudit = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required." });
    const auditData = req.body || {};

    const checkpoints =
      Array.isArray(auditData.checkpoints) && auditData.checkpoints.length > 0
        ? auditData.checkpoints
        : getBlankCheckpointTemplate();
    const evaluation = evaluateScoreAndGrade(checkpoints);

    const auditId =
      auditData.auditId ||
      `WAK-DD-${new Date().getFullYear()}-${(auditData.clientEntity?.name || "CO")
        .substring(0, 2)
        .toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const digest = sha256({
      auditId,
      entity: auditData.clientEntity?.cin || "",
      score: evaluation.score,
      date: new Date().toISOString(),
    });

    const fullPayload = {
      ...auditData,
      auditId,
      userId,
      checkpoints,
      overallScore: evaluation.score,
      grade: evaluation.grade,
      riskCategory: evaluation.riskCategory,
      totalCheckpoints: evaluation.total,
      passedCheckpoints: evaluation.passed,
      failedCheckpoints: evaluation.failed,
      attestation: {
        ...(auditData.attestation || {}),
        integrityHash: digest,
        qrVerificationUrl: `https://wakheel.legal/verify/due-diligence/${auditId}`,
        attestedAt: auditData.attestation ? new Date().toISOString() : undefined,
      },
    };

    if (isMongoConnected()) {
      const created = await DueDiligenceAudit.create(fullPayload);
      return res.status(201).json({ success: true, audit: created, mode: "mongo" });
    }

    const created = devStore.createDueDiligenceAudit(userId, fullPayload);
    res.status(201).json({ success: true, audit: created, mode: "devStore" });
  } catch (error) {
    console.error("createDueDiligenceAudit error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update checkpoint status (curative action / finding update)
// @route   PATCH /api/due-diligence/:id/checkpoint
// @access  Protected
export const updateAuditCheckpoint = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required." });
    const { id } = req.params;
    const { checkpointId, status, observation, remedialAction } = req.body;

    let audit;
    if (isMongoConnected()) {
      audit = await DueDiligenceAudit.findOne({
        userId,
        $or: [{ auditId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      });
    } else {
      audit = devStore.getDueDiligenceAuditById(id, userId);
    }

    if (!audit) {
      return res.status(404).json({ success: false, message: "Audit not found" });
    }

    const updatedCheckpoints = (audit.checkpoints || []).map((cp) => {
      if (cp.checkpointId === checkpointId) {
        return {
          ...cp,
          status: status || cp.status,
          earnedPoints: status === "compliant" || status === "not_applicable" ? 1 : 0,
          observation: observation !== undefined ? observation : cp.observation,
          remedialAction: remedialAction !== undefined ? remedialAction : cp.remedialAction,
        };
      }
      return cp;
    });

    const evalResult = evaluateScoreAndGrade(updatedCheckpoints);

    const updatePayload = {
      checkpoints: updatedCheckpoints,
      overallScore: evalResult.score,
      grade: evalResult.grade,
      riskCategory: evalResult.riskCategory,
      passedCheckpoints: evalResult.passed,
      failedCheckpoints: evalResult.failed,
      updatedAt: new Date().toISOString(),
    };

    if (isMongoConnected()) {
      const updated = await DueDiligenceAudit.findOneAndUpdate(
        { _id: audit._id, userId },
        updatePayload,
        { new: true }
      );
      return res.json({ success: true, audit: updated, mode: "mongo" });
    }

    const updated = devStore.updateDueDiligenceAudit(id, updatePayload, userId);
    res.json({ success: true, audit: updated, mode: "devStore" });
  } catch (error) {
    console.error("updateAuditCheckpoint error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Statutory Financial Penalty Calculator (Sec 403, Sec 271B, Sec 270A, Sec 122)
// @route   POST /api/due-diligence/calculate-penalties
// @access  Protected
export const calculateStatutoryPenalties = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required." });
    const {
      mcaLateDays = 0,
      annualTurnover = 0,
      taxAuditDelay = false,
      underReportedIncome = 0,
      gstTaxDisputed = 0,
      corporateTaxRate = 0.2517,
    } = req.body;

    const mcaSection403 = mcaLateDays * 100;

    let section271B = 0;
    if (taxAuditDelay) {
      section271B = Math.min(annualTurnover * 0.005, 150000);
    }

    const taxOnUnderReported = underReportedIncome * corporateTaxRate;
    const section270A = taxOnUnderReported * 0.5;

    let gstSection122 = 0;
    if (gstTaxDisputed > 0) {
      gstSection122 = Math.max(gstTaxDisputed * 0.1, 10000);
    }

    const totalMaximumExposure = mcaSection403 + section271B + section270A + gstSection122;
    const mitigatedExposure = Math.round(mcaSection403 * 0.5 + (taxAuditDelay ? 25000 : 0) + section270A * 0.2);

    res.json({
      success: true,
      calculation: {
        mcaSection403: {
          days: mcaLateDays,
          ratePerDay: 100,
          total: mcaSection403,
          rule: "Section 403 read with Companies (Registration Offices and Fees) Rules, 2014",
        },
        section271B: {
          delayed: taxAuditDelay,
          rate: "0.5% of gross turnover capped at ₹1,50,000",
          total: section271B,
          reasonableCauseReliefUnder273B: taxAuditDelay ? "Can be waived upon showing reasonable cause" : "N/A",
        },
        section270A: {
          underReportedIncome,
          taxComputed: taxOnUnderReported,
          penaltyRate: "50% of tax",
          total: section270A,
        },
        gstSection122: {
          taxDisputed: gstTaxDisputed,
          total: gstSection122,
          rule: "Section 122(1) CGST Act (10% or ₹10,000)",
        },
        totalMaximumExposure,
        mitigatedExposure,
        summary: `Total maximum statutory exposure is ₹${totalMaximumExposure.toLocaleString("en-IN")}, reducible to ₹${mitigatedExposure.toLocaleString("en-IN")} through proactive compounding and Section 273B reasonable cause filings.`,
      },
    });
  } catch (error) {
    console.error("calculateStatutoryPenalties error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate Section 441 Compounding Petition Draft
// @route   POST /api/due-diligence/compounding-petition
// @access  Protected
export const generateCompoundingPetition = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required." });
    const {
      companyName = "",
      cin = "",
      sectionViolated = "Section 82 / Section 137",
      natureOfDefault = "Technical delay in filing statutory form under Companies Act, 2013",
      daysOfDelay = 0,
      estimatedPenalty = 0,
      jurisdiction = "Regional Director (RD)",
      registeredOffice = "",
      signatoryName = "",
    } = req.body;

    if (!companyName.trim()) {
      return res.status(400).json({ success: false, message: "Company name is required to draft a compounding petition." });
    }

    const practitionerLabel = signatoryName || req.user?.fullName || "Practicing Company Secretary";
    const cinLabel = cin || "[CIN Pending]";
    const regOfficeLine = registeredOffice
      ? `HAVING ITS REGISTERED OFFICE AT ${registeredOffice.toUpperCase()}`
      : "HAVING ITS REGISTERED OFFICE IN INDIA";

    const petitionText = `
BEFORE THE HON'BLE ${jurisdiction.toUpperCase()}
MINISTRY OF CORPORATE AFFAIRS

IN THE MATTER OF SECTION 441 OF THE COMPANIES ACT, 2013
AND
IN THE MATTER OF ${companyName.toUpperCase()} (CIN: ${cinLabel})
${regOfficeLine}

COMPANY APPLICATION NO. ________ / ${new Date().getFullYear()}

MEMORANDUM OF APPLICATION UNDER SECTION 441 FOR COMPOUNDING OF OFFENCE
UNDER ${sectionViolated.toUpperCase()} OF THE COMPANIES ACT, 2013

MOST RESPECTFULLY SHOWETH:

1. PARTICULARS OF THE APPLICANT COMPANY:
The Applicant (${companyName}, CIN: ${cinLabel}) is a company incorporated under the Companies Act, 2013.

2. NATURE AND FACTS OF THE DEFAULT:
${natureOfDefault} (Delay recorded: ${daysOfDelay} days under ${sectionViolated}). The delay was inadvertent and without any mala fide intent.

3. ABSENCE OF HARM TO PUBLIC INTEREST OR REVENUE:
No loss has been caused to the Central Government, creditors, shareholders, or public interest.

4. JURISDICTION OF THE AUTHORITY:
Under Section 441(1) of the Companies Act, 2013, this Hon'ble Authority has jurisdiction to compound the subject technical offence.

5. PRAYER:
In light of the settled principles laid down in Hindustan Steel Ltd v. State of Orissa (1970 1 SCR 753), the Applicant respectfully prays that:
(a) The technical default under ${sectionViolated} be compounded upon payment of a nominal compounding fee;
(b) Such further or other orders be passed as may be deemed just and proper.

VERIFICATION:
Verified on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} that the contents of this application are true and correct.

FOR ${companyName.toUpperCase()}

_______________________            _______________________
Authorized Director                 ${practitionerLabel}
`.trim();

    res.json({
      success: true,
      petition: {
        form: "Form GNL-1 (MCA21) / Section 441 Compounding Application",
        jurisdiction,
        competentForum:
          estimatedPenalty <= 2500000
            ? "Regional Director (RD) per Section 441(1)(b)"
            : "National Company Law Tribunal (NCLT) per Section 441(1)(a)",
        draftText: petitionText,
      },
    });
  } catch (error) {
    console.error("generateCompoundingPetition error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Joint Attestation Seal by CS & CA (Dual Digital Attestation)
// @route   POST /api/due-diligence/:id/attest
// @access  Protected
export const attestAuditReport = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required." });
    const { id } = req.params;
    const { csSigner, caSigner } = req.body;

    let audit;
    if (isMongoConnected()) {
      audit = await DueDiligenceAudit.findOne({
        userId,
        $or: [{ auditId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      });
    } else {
      audit = devStore.getDueDiligenceAuditById(id, userId);
    }

    if (!audit) {
      return res.status(404).json({ success: false, message: "Audit not found" });
    }

    const timestamp = new Date().toISOString();
    const digest = sha256({
      auditId: audit.auditId,
      entity: audit.clientEntity?.cin || "",
      score: audit.overallScore,
      cs: csSigner?.membershipNo || "",
      ca: caSigner?.udin || "",
      attestedAt: timestamp,
    });

    const defaultLead = req.user?.fullName || "";
    const defaultFirm = req.user?.firmName || "";

    const attestationPayload = {
      attestation: {
        leadCs: {
          name: csSigner?.name || defaultLead,
          membershipNo: csSigner?.membershipNo || "",
          cpNumber: csSigner?.cpNumber || "",
          firm: csSigner?.firm || defaultFirm,
          digitalSigned: Boolean(csSigner?.name || defaultLead),
          signatureHash: sha256(`CS_${csSigner?.membershipNo || userId}_${timestamp}`),
          signedAt: timestamp,
        },
        leadCa: {
          name: caSigner?.name || "",
          membershipNo: caSigner?.membershipNo || "",
          firmRegNo: caSigner?.firmRegNo || "",
          firm: caSigner?.firm || defaultFirm,
          udin: caSigner?.udin || "",
          digitalSigned: Boolean(caSigner?.name),
          signatureHash: sha256(`CA_${caSigner?.membershipNo || userId}_${timestamp}`),
          signedAt: timestamp,
        },
        qrVerificationUrl: `https://wakheel.legal/verify/due-diligence/${audit.auditId}`,
        integrityHash: digest,
        attestedAt: timestamp,
        status: "Attested & Sealed (Transaction Ready)",
      },
      status: "attested",
      updatedAt: timestamp,
    };

    if (isMongoConnected()) {
      const updated = await DueDiligenceAudit.findOneAndUpdate(
        { _id: audit._id, userId },
        attestationPayload,
        { new: true }
      );
      return res.json({ success: true, audit: updated, mode: "mongo" });
    }

    const updated = devStore.updateDueDiligenceAudit(id, attestationPayload, userId);
    res.json({ success: true, audit: updated, mode: "devStore" });
  } catch (error) {
    console.error("attestAuditReport error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete audit by ID
// @route   DELETE /api/due-diligence/:id
// @access  Protected
export const deleteDueDiligenceAudit = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required." });
    const { id } = req.params;

    if (isMongoConnected()) {
      await DueDiligenceAudit.findOneAndDelete({
        userId,
        $or: [{ auditId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      });
      return res.json({ success: true, message: "Audit deleted successfully", mode: "mongo" });
    }

    devStore.deleteDueDiligenceAudit(id, userId);
    res.json({ success: true, message: "Audit deleted successfully", mode: "devStore" });
  } catch (error) {
    console.error("deleteDueDiligenceAudit error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
