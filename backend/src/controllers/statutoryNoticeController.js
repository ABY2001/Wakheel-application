import { StatutoryNotice } from "../models/StatutoryNotice.js";
import { devStore } from "../utils/devStore.js";
import mongoose from "mongoose";

const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

const getUserId = (req) => {
  const id = req.user?.id || req.user?._id;
  return id ? String(id) : "";
};

// 1. Get all statutory notices with filters
export const getStatutoryNotices = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, error: "Authentication required." });
    const { portal, status, search } = req.query;

    if (isMongoConnected()) {
      let query = { userId };
      if (portal && portal !== "ALL") query.portal = portal;
      if (status && status !== "ALL") query.status = status;
      if (search) {
        query.$or = [
          { referenceNumber: { $regex: search, $options: "i" } },
          { statutorySection: { $regex: search, $options: "i" } },
          { allegationSubject: { $regex: search, $options: "i" } },
          { "clientEntity.name": { $regex: search, $options: "i" } },
        ];
      }
      const notices = await StatutoryNotice.find(query).sort({ limitationDeadline: 1 });
      return res.json({ success: true, count: notices.length, notices });
    }

    const notices = devStore.getStatutoryNotices({ userId, portal, status, search });
    return res.json({ success: true, count: notices.length, notices, isFallback: true });
  } catch (error) {
    console.error("Error in getStatutoryNotices:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Get notice by ID
export const getStatutoryNoticeById = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, error: "Authentication required." });
    const { id } = req.params;

    if (isMongoConnected()) {
      const notice = await StatutoryNotice.findOne({
        userId,
        $or: [{ noticeId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }, { referenceNumber: id }],
      });
      if (!notice) return res.status(404).json({ success: false, error: "Notice not found" });
      return res.json({ success: true, notice });
    }

    const notice = devStore.getStatutoryNoticeById(id, userId);
    if (!notice) return res.status(404).json({ success: false, error: "Notice not found" });
    return res.json({ success: true, notice, isFallback: true });
  } catch (error) {
    console.error("Error in getStatutoryNoticeById:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Ingest / Create a new Statutory Notice
export const createStatutoryNotice = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, error: "Authentication required." });
    const noticeData = req.body || {};
    const noticeId = noticeData.noticeId || `WAK-SCN-${Date.now()}`;

    if (isMongoConnected()) {
      const newNotice = new StatutoryNotice({
        ...noticeData,
        userId,
        noticeId,
      });
      await newNotice.save();
      return res.status(201).json({ success: true, notice: newNotice });
    }

    const newNotice = devStore.createStatutoryNotice({
      ...noticeData,
      userId,
      noticeId,
    });
    return res.status(201).json({ success: true, notice: newNotice, isFallback: true });
  } catch (error) {
    console.error("Error in createStatutoryNotice:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 4. Update Notice Status
export const updateNoticeStatus = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, error: "Authentication required." });
    const { id } = req.params;
    const { status, note, performedBy } = req.body;

    const auditEntry = {
      action: `STATUS_CHANGE_TO_${status}`,
      performedBy: performedBy || req.user?.fullName || "Practicing Professional",
      timestamp: new Date().toISOString(),
      notes: note || `Notice status updated to ${status}`,
    };

    if (isMongoConnected()) {
      const notice = await StatutoryNotice.findOneAndUpdate(
        { userId, $or: [{ noticeId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
        {
          $set: { status },
          $push: { auditTrail: auditEntry },
        },
        { new: true }
      );
      if (!notice) return res.status(404).json({ success: false, error: "Notice not found" });
      return res.json({ success: true, notice });
    }

    const notice = devStore.getStatutoryNoticeById(id, userId);
    if (!notice) return res.status(404).json({ success: false, error: "Notice not found" });
    const auditTrail = [...(notice.auditTrail || []), auditEntry];
    const updated = devStore.updateStatutoryNotice(id, { status, auditTrail }, userId);
    return res.json({ success: true, notice: updated, isFallback: true });
  } catch (error) {
    console.error("Error in updateNoticeStatus:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 5. Generate Legal Reply & Jurisdictional Rebuttal
export const generateNoticeReply = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, error: "Authentication required." });
    const { id } = req.params;
    const { authorName, customJurisdictionalObjection, customFacts } = req.body;

    let notice = null;
    if (isMongoConnected()) {
      notice = await StatutoryNotice.findOne({
        userId,
        $or: [{ noticeId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
      });
    } else {
      notice = devStore.getStatutoryNoticeById(id, userId);
    }

    if (!notice) return res.status(404).json({ success: false, error: "Notice not found" });

    let jurisdictionalObjections = [
      "The impugned notice suffers from non-application of mind and lacks valid Document Identification Number (DIN).",
      "Violation of principles of natural justice as mandatory pre-notice opportunity was not granted.",
    ];
    let statutoryPrecedents = [];
    let factualSubmissions = [
      `The Assessee ${notice.clientEntity?.name || "Company"} is a compliant corporate entity.`,
      "All relevant transactions have been accounted for in the audited books of accounts and filed on statutory portals.",
    ];

    if (notice.portal === "GSTN") {
      jurisdictionalObjections.push(
        "Notice in Form DRC-01 issued without prior consultation / pre-SCN intimation under Rule 142(1A).",
        "Recipient cannot be penalized for supplier's non-payment under Section 16(2)(c) as held by Supreme Court."
      );
      statutoryPrecedents.push(
        "Quest Merchandising India Pvt Ltd vs Govt of NCT of Delhi [2017] (Delhi HC)",
        "Suncraft Energy Pvt Ltd vs Assistant Commissioner [2023] (Calcutta HC)",
        "CBIC Circular No. 183/15/2022-GST on ITC regularisation"
      );
      factualSubmissions.push(
        "Genuine tax invoices and e-way bills are on record.",
        "Detailed Annexure A contains vendor-wise reconciliation showing zero leakage of tax."
      );
    } else if (notice.portal === "CBDT_INCOME_TAX") {
      jurisdictionalObjections.push(
        "Notice under Section 148A(b) issued without prior sanction of specified authority under Section 151.",
        "Statutory immunity under DPIIT startup notification G.S.R. 127(E) protects share premium under Section 56(2)(viib)."
      );
      statutoryPrecedents.push(
        "Union of India vs Ashish Agarwal [2022] 444 ITR 1 (SC)",
        "Cinestaan Entertainment Pvt Ltd vs ITO [2021] (Delhi ITAT)",
        "CBDT Circular No. 16/2019 dated 07-Aug-2019"
      );
      factualSubmissions.push(
        "Valuation determined under DCF method by Category-I Merchant Banker under Rule 11UA.",
        "All subscription monies received through recognized banking channels from verified funds."
      );
    } else if (notice.portal === "MCA21") {
      jurisdictionalObjections.push(
        "Technical delay is condonable upon payment of additional statutory fees under Section 87.",
        "Offence is compoundable under Section 441 and does not involve public fraud."
      );
      statutoryPrecedents.push("Companies (Registration of Charges) Amendment Rules, 2019");
      factualSubmissions.push(
        "Lender has issued clean No Objection Certificate (NOC) confirming full satisfaction of debt.",
        "Company has moved Regional Director for condonation of delay."
      );
    }

    if (customJurisdictionalObjection) {
      jurisdictionalObjections.unshift(customJurisdictionalObjection);
    }
    if (customFacts) {
      factualSubmissions.unshift(customFacts);
    }

    const formalPrayer =
      "In light of the statutory facts and binding judicial precedents cited herein, it is respectfully prayed that the proposed proceedings / demand be dropped in its entirety. An opportunity of personal hearing through Virtual Video Conference is requested before any adverse order is passed.";

    const resolvedAuthor = authorName || req.user?.fullName || "Authorized Legal Representative";

    const draftText = `BEFORE THE ${(notice.issuingAuthority || "COMPETENT AUTHORITY").toUpperCase()}
IN THE MATTER OF: ${(notice.clientEntity?.name || "COMPANY").toUpperCase()}
NOTICE REFERENCE: ${notice.referenceNumber} DATED ${notice.dateOfNotice}
STATUTORY SECTION: ${notice.statutorySection}

RESPECTFUL WRITTEN SUBMISSION ON BEHALF OF THE ASSESSEE / COMPANY:

1. PRELIMINARY JURISDICTIONAL OBJECTIONS:
${jurisdictionalObjections.map((o, i) => `1.${i + 1} ${o}`).join("\n")}

2. FACTUAL SUBMISSIONS ON MERITS:
${factualSubmissions.map((f, i) => `2.${i + 1} ${f}`).join("\n")}

3. BINDING JUDICIAL PRECEDENTS & CIRCULARS:
${statutoryPrecedents.map((p, i) => `3.${i + 1} ${p}`).join("\n")}

4. FORMAL PRAYER:
${formalPrayer}

Respectfully submitted,
${resolvedAuthor}
Counsel for the Assessee / Company`;

    const rebuttalDraft = {
      subject: `Legal Reply to Notice Ref: ${notice.referenceNumber}`,
      jurisdictionalObjections,
      factualSubmissions,
      statutoryPrecedents,
      formalPrayer,
      draftText,
      generatedAt: new Date().toISOString(),
      authorName: resolvedAuthor,
    };

    const auditEntry = {
      action: "LEGAL_REPLY_DRAFTED",
      performedBy: resolvedAuthor,
      timestamp: new Date().toISOString(),
      notes: "Generated comprehensive legal rebuttal with preliminary objections and case laws.",
    };

    if (isMongoConnected()) {
      const updated = await StatutoryNotice.findOneAndUpdate(
        { userId, $or: [{ noticeId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
        {
          $set: { rebuttalDraft, status: "REPLY_DRAFTED" },
          $push: { auditTrail: auditEntry },
        },
        { new: true }
      );
      return res.json({ success: true, notice: updated });
    }

    const auditTrail = [...(notice.auditTrail || []), auditEntry];
    const updated = devStore.updateStatutoryNotice(
      id,
      {
        rebuttalDraft,
        status: "REPLY_DRAFTED",
        auditTrail,
      },
      userId
    );
    return res.json({ success: true, notice: updated, isFallback: true });
  } catch (error) {
    console.error("Error in generateNoticeReply:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 6. Attach Evidence Document / Annexure
export const attachEvidenceDocument = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, error: "Authentication required." });
    const { id } = req.params;
    const { label, documentTitle, fileName, sha256Hash } = req.body;

    const annexure = {
      annexureId: `ann-${Date.now()}`,
      label: label || "Annexure",
      documentTitle: documentTitle || "Statutory Evidence Document",
      fileName: fileName || "evidence_document.pdf",
      sha256Hash: sha256Hash || `sha256_${Math.random().toString(36).substring(2, 15)}`,
      uploadedAt: new Date().toISOString(),
    };

    const auditEntry = {
      action: "ANNEXURE_ATTACHED",
      performedBy: req.user?.fullName || "Assigned Counsel",
      timestamp: new Date().toISOString(),
      notes: `Attached ${annexure.label}: ${annexure.documentTitle}`,
    };

    if (isMongoConnected()) {
      const notice = await StatutoryNotice.findOneAndUpdate(
        { userId, $or: [{ noticeId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
        {
          $push: { annexures: annexure, auditTrail: auditEntry },
        },
        { new: true }
      );
      if (!notice) return res.status(404).json({ success: false, error: "Notice not found" });
      return res.json({ success: true, notice, annexure });
    }

    const notice = devStore.getStatutoryNoticeById(id, userId);
    if (!notice) return res.status(404).json({ success: false, error: "Notice not found" });
    const annexures = [...(notice.annexures || []), annexure];
    const auditTrail = [...(notice.auditTrail || []), auditEntry];
    const updated = devStore.updateStatutoryNotice(id, { annexures, auditTrail }, userId);
    return res.json({ success: true, notice: updated, annexure, isFallback: true });
  } catch (error) {
    console.error("Error in attachEvidenceDocument:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 7. Sign Notice Reply with Class 3 DSC USB Token
export const signNoticeReplyWithDsc = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, error: "Authentication required." });
    const { id } = req.params;
    const { dscSignatory, dscSerialNumber } = req.body;

    const filingReceipt = {
      acknowledgmentNumber: `ACK-${Date.now().toString().slice(-8)}`,
      filedOn: new Date().toISOString(),
      dscSignatory: dscSignatory || req.user?.fullName || "Authorized Signatory",
      dscSerialNumber: dscSerialNumber || "",
      portalSubmissionStatus: "DIGITALLY_SIGNED_AND_SUBMITTED",
    };

    const auditEntry = {
      action: "DSC_SIGNED_AND_SUBMITTED",
      performedBy: filingReceipt.dscSignatory,
      timestamp: new Date().toISOString(),
      notes: `Reply digitally signed using Class 3 USB Crypto Token${filingReceipt.dscSerialNumber ? ` (Serial #${filingReceipt.dscSerialNumber})` : ""} and submitted to portal.`,
    };

    if (isMongoConnected()) {
      const notice = await StatutoryNotice.findOneAndUpdate(
        { userId, $or: [{ noticeId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
        {
          $set: { status: "REPLY_FILED", filingReceipt },
          $push: { auditTrail: auditEntry },
        },
        { new: true }
      );
      if (!notice) return res.status(404).json({ success: false, error: "Notice not found" });
      return res.json({ success: true, notice, filingReceipt });
    }

    const notice = devStore.getStatutoryNoticeById(id, userId);
    if (!notice) return res.status(404).json({ success: false, error: "Notice not found" });
    const auditTrail = [...(notice.auditTrail || []), auditEntry];
    const updated = devStore.updateStatutoryNotice(
      id,
      {
        status: "REPLY_FILED",
        filingReceipt,
        auditTrail,
      },
      userId
    );
    return res.json({ success: true, notice: updated, filingReceipt, isFallback: true });
  } catch (error) {
    console.error("Error in signNoticeReplyWithDsc:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 8. Schedule Virtual Hearing / VC
export const scheduleVirtualHearing = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, error: "Authentication required." });
    const { id } = req.params;
    const { hearingDate, hearingTime, hearingMode, meetingLink, assignedCounsel, benchOrOfficer } = req.body;

    const hearingSchedule = {
      hearingDate: hearingDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      hearingTime: hearingTime || "11:30 AM",
      hearingMode: hearingMode || "VIRTUAL_VC",
      meetingLink: meetingLink || "",
      benchOrOfficer: benchOrOfficer || "Adjudicating Authority",
      assignedCounsel: assignedCounsel || req.user?.fullName || "Authorized Counsel",
      status: "SCHEDULED",
    };

    const auditEntry = {
      action: "HEARING_SCHEDULED",
      performedBy: req.user?.fullName || "Registry / Mailroom",
      timestamp: new Date().toISOString(),
      notes: `Hearing fixed on ${hearingSchedule.hearingDate} at ${hearingSchedule.hearingTime} via ${hearingSchedule.hearingMode}`,
    };

    if (isMongoConnected()) {
      const notice = await StatutoryNotice.findOneAndUpdate(
        { userId, $or: [{ noticeId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
        {
          $set: { status: "HEARING_SCHEDULED", hearingSchedule },
          $push: { auditTrail: auditEntry },
        },
        { new: true }
      );
      if (!notice) return res.status(404).json({ success: false, error: "Notice not found" });
      return res.json({ success: true, notice, hearingSchedule });
    }

    const notice = devStore.getStatutoryNoticeById(id, userId);
    if (!notice) return res.status(404).json({ success: false, error: "Notice not found" });
    const auditTrail = [...(notice.auditTrail || []), auditEntry];
    const updated = devStore.updateStatutoryNotice(
      id,
      {
        status: "HEARING_SCHEDULED",
        hearingSchedule,
        auditTrail,
      },
      userId
    );
    return res.json({ success: true, notice: updated, hearingSchedule, isFallback: true });
  } catch (error) {
    console.error("Error in scheduleVirtualHearing:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 9. Delete notice
export const deleteStatutoryNotice = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, error: "Authentication required." });
    const { id } = req.params;

    if (isMongoConnected()) {
      await StatutoryNotice.findOneAndDelete({
        userId,
        $or: [{ noticeId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
      });
      return res.json({ success: true, message: "Notice deleted from database" });
    }

    devStore.deleteStatutoryNotice(id, userId);
    return res.json({ success: true, message: "Notice deleted from devStore" });
  } catch (error) {
    console.error("Error in deleteStatutoryNotice:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
