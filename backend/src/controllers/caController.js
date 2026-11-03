import { IncomeTaxReturn } from "../models/IncomeTaxReturn.js";
import { GstReturn } from "../models/GstReturn.js";
import { TaxAudit3CD } from "../models/TaxAudit3CD.js";
import { BalanceSheetRecon } from "../models/BalanceSheetRecon.js";
import { getIsMongoConnected } from "../config/db.js";
import { devStore } from "../utils/devStore.js";

const shouldUseDevStore = () => {
  return process.env.USE_DUMMY_DATA === "true" || !getIsMongoConnected();
};

const getUserId = (req) => {
  return req.user?._id || req.user?.id || "ca_1";
};

// ============================================================================
// 1. INCOME TAX & ITR FILING CONTROLLERS
// ============================================================================

export const getIncomeTaxReturns = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { clientName, assessmentYear, itrForm, status } = req.query;

    if (shouldUseDevStore()) {
      const returns = devStore.getIncomeTaxReturns(userId, { clientName, assessmentYear, itrForm, status });
      return res.json({ success: true, returns, mode: "dummy_data" });
    }

    const query = {
      $or: [{ userId }, { userId: "ca_1" }, { userId: "default_firm" }],
    };
    if (clientName) query.clientName = clientName;
    if (assessmentYear) query.assessmentYear = assessmentYear;
    if (itrForm && itrForm !== "ALL") query.itrForm = itrForm;
    if (status && status !== "ALL") query.status = status;

    const returns = await IncomeTaxReturn.find(query).sort({ filingDueDate: 1 });

    res.json({
      success: true,
      returns: returns.map((r) => ({ ...r.toObject(), id: r.itrId || r._id.toString() })),
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getIncomeTaxReturns error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createIncomeTaxReturn = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (shouldUseDevStore()) {
      const returnDoc = devStore.createIncomeTaxReturn(userId, req.body);
      return res.status(201).json({ success: true, returnDoc });
    }

    const gross = Number(req.body.grossTotalIncome) || 0;
    const deductions = Number(req.body.deductionsChapterVIA) || 0;
    const taxable = Math.max(0, gross - deductions);
    const taxPayable = Number(req.body.taxPayable) || Math.round(taxable * 0.2517);
    const tds = Number(req.body.tdsTcsCredit) || 0;
    const adv = Number(req.body.advanceTaxPaid) || 0;
    const refund = Math.max(0, tds + adv - taxPayable);

    const returnDoc = await IncomeTaxReturn.create({
      ...req.body,
      itrId: req.body.id || `itr-${Date.now()}`,
      grossTotalIncome: gross,
      deductionsChapterVIA: deductions,
      taxableIncome: taxable,
      taxPayable,
      tdsTcsCredit: tds,
      advanceTaxPaid: adv,
      refundDueOrPayable: refund,
      userId,
    });

    res.status(201).json({
      success: true,
      returnDoc: { ...returnDoc.toObject(), id: returnDoc.itrId || returnDoc._id.toString() },
    });
  } catch (error) {
    console.error("createIncomeTaxReturn error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateIncomeTaxReturn = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      const returnDoc = devStore.updateIncomeTaxReturn(req.params.id, req.body);
      if (!returnDoc) return res.status(404).json({ success: false, message: "ITR not found" });
      return res.json({ success: true, returnDoc });
    }

    const returnDoc = await IncomeTaxReturn.findOneAndUpdate(
      { $or: [{ itrId: req.params.id }, { _id: req.params.id }] },
      { $set: req.body },
      { new: true }
    );
    if (!returnDoc) return res.status(404).json({ success: false, message: "ITR not found" });

    res.json({
      success: true,
      returnDoc: { ...returnDoc.toObject(), id: returnDoc.itrId || returnDoc._id.toString() },
    });
  } catch (error) {
    console.error("updateIncomeTaxReturn error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteIncomeTaxReturn = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      devStore.deleteIncomeTaxReturn(req.params.id);
      return res.json({ success: true, message: "ITR deleted successfully" });
    }

    await IncomeTaxReturn.findOneAndDelete({
      $or: [{ itrId: req.params.id }, { _id: req.params.id }],
    });
    res.json({ success: true, message: "ITR deleted successfully" });
  } catch (error) {
    console.error("deleteIncomeTaxReturn error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 2. GST COMPLIANCE (GSTR-1, GSTR-3B, GSTR-9) CONTROLLERS
// ============================================================================

export const getGstReturns = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { clientName, returnType, status } = req.query;

    if (shouldUseDevStore()) {
      const returns = devStore.getGstReturns(userId, { clientName, returnType, status });
      return res.json({ success: true, returns, mode: "dummy_data" });
    }

    const query = {
      $or: [{ userId }, { userId: "ca_1" }, { userId: "default_firm" }],
    };
    if (clientName) query.clientName = clientName;
    if (returnType && returnType !== "ALL") query.returnType = returnType;
    if (status && status !== "ALL") query.status = status;

    const returns = await GstReturn.find(query).sort({ dueDate: 1 });

    res.json({
      success: true,
      returns: returns.map((g) => ({ ...g.toObject(), id: g.gstReturnId || g._id.toString() })),
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getGstReturns error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGstReturn = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (shouldUseDevStore()) {
      const returnDoc = devStore.createGstReturn(userId, req.body);
      return res.status(201).json({ success: true, returnDoc });
    }

    const turnover = Number(req.body.taxableTurnover) || 0;
    const igst = Number(req.body.igstAmount) || Math.round(turnover * 0.09);
    const cgst = Number(req.body.cgstAmount) || Math.round(turnover * 0.045);
    const sgst = Number(req.body.sgstAmount) || Math.round(turnover * 0.045);
    const liability = igst + cgst + sgst;
    const itcClaimed = Number(req.body.itcClaimed) || 0;
    const itc2B = Number(req.body.itcAvailable2B) || itcClaimed;

    const returnDoc = await GstReturn.create({
      ...req.body,
      gstReturnId: req.body.id || `gst-${Date.now()}`,
      taxableTurnover: turnover,
      igstAmount: igst,
      cgstAmount: cgst,
      sgstAmount: sgst,
      totalTaxLiability: liability,
      itcClaimed,
      itcAvailable2B: itc2B,
      itcDifference: itcClaimed - itc2B,
      userId,
    });

    res.status(201).json({
      success: true,
      returnDoc: { ...returnDoc.toObject(), id: returnDoc.gstReturnId || returnDoc._id.toString() },
    });
  } catch (error) {
    console.error("createGstReturn error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGstReturn = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      const returnDoc = devStore.updateGstReturn(req.params.id, req.body);
      if (!returnDoc) return res.status(404).json({ success: false, message: "GST Return not found" });
      return res.json({ success: true, returnDoc });
    }

    const returnDoc = await GstReturn.findOneAndUpdate(
      { $or: [{ gstReturnId: req.params.id }, { _id: req.params.id }] },
      { $set: req.body },
      { new: true }
    );
    if (!returnDoc) return res.status(404).json({ success: false, message: "GST Return not found" });

    res.json({
      success: true,
      returnDoc: { ...returnDoc.toObject(), id: returnDoc.gstReturnId || returnDoc._id.toString() },
    });
  } catch (error) {
    console.error("updateGstReturn error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGstReturn = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      devStore.deleteGstReturn(req.params.id);
      return res.json({ success: true, message: "GST Return deleted successfully" });
    }

    await GstReturn.findOneAndDelete({
      $or: [{ gstReturnId: req.params.id }, { _id: req.params.id }],
    });
    res.json({ success: true, message: "GST Return deleted successfully" });
  } catch (error) {
    console.error("deleteGstReturn error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 3. STATUTORY & TAX AUDIT FORM 3CD / UDIN CONTROLLERS
// ============================================================================

export const getTaxAuditReports = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { clientName, auditType } = req.query;

    if (shouldUseDevStore()) {
      const reports = devStore.getTaxAuditReports(userId, { clientName, auditType });
      return res.json({ success: true, reports, mode: "dummy_data" });
    }

    const query = {
      $or: [{ userId }, { userId: "ca_1" }, { userId: "default_firm" }],
    };
    if (clientName) query.clientName = clientName;
    if (auditType && auditType !== "ALL") query.auditType = auditType;

    const reports = await TaxAudit3CD.find(query).sort({ updatedAt: -1 });

    res.json({
      success: true,
      reports: reports.map((a) => ({ ...a.toObject(), id: a.auditId || a._id.toString() })),
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getTaxAuditReports error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTaxAuditReport = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (shouldUseDevStore()) {
      const report = devStore.createTaxAuditReport(userId, req.body);
      return res.status(201).json({ success: true, report });
    }

    const d43b = Number(req.body.disallowanceSec43B) || 0;
    const d40a3 = Number(req.body.disallowanceSec40A3) || 0;
    const d40aia = Number(req.body.disallowanceSec40aia) || 0;

    const report = await TaxAudit3CD.create({
      ...req.body,
      auditId: req.body.id || `aud-3cd-${Date.now()}`,
      disallowanceSec43B: d43b,
      disallowanceSec40A3: d40a3,
      disallowanceSec40aia: d40aia,
      totalDisallowances: d43b + d40a3 + d40aia,
      udin: req.body.udin || `26054921AAAAAA${Math.floor(1000 + Math.random() * 9000)}`,
      userId,
    });

    res.status(201).json({
      success: true,
      report: { ...report.toObject(), id: report.auditId || report._id.toString() },
    });
  } catch (error) {
    console.error("createTaxAuditReport error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTaxAuditReport = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      const report = devStore.updateTaxAuditReport(req.params.id, req.body);
      if (!report) return res.status(404).json({ success: false, message: "Audit Report not found" });
      return res.json({ success: true, report });
    }

    const report = await TaxAudit3CD.findOneAndUpdate(
      { $or: [{ auditId: req.params.id }, { _id: req.params.id }] },
      { $set: req.body },
      { new: true }
    );
    if (!report) return res.status(404).json({ success: false, message: "Audit Report not found" });

    res.json({
      success: true,
      report: { ...report.toObject(), id: report.auditId || report._id.toString() },
    });
  } catch (error) {
    console.error("updateTaxAuditReport error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTaxAuditReport = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      devStore.deleteTaxAuditReport(req.params.id);
      return res.json({ success: true, message: "Audit report deleted successfully" });
    }

    await TaxAudit3CD.findOneAndDelete({
      $or: [{ auditId: req.params.id }, { _id: req.params.id }],
    });
    res.json({ success: true, message: "Audit report deleted successfully" });
  } catch (error) {
    console.error("deleteTaxAuditReport error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateUdin = async (req, res) => {
  try {
    const { partnerName, membershipNo } = req.body;
    if (shouldUseDevStore()) {
      const report = devStore.generateUdin(req.params.id, partnerName, membershipNo);
      if (!report) return res.status(404).json({ success: false, message: "Audit report not found" });
      return res.json({ success: true, message: "Unique Document Identification Number (UDIN) generated per ICAI guidelines", report });
    }

    const year = new Date().getFullYear().toString().slice(-2);
    const mem = (membershipNo || "054921").padStart(6, "0");
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const generatedUdin = `${year}${mem}${randomSuffix}`.slice(0, 18);

    const report = await TaxAudit3CD.findOneAndUpdate(
      { $or: [{ auditId: req.params.id }, { _id: req.params.id }] },
      {
        $set: {
          udin: generatedUdin,
          status: "signed_uploaded",
          caPartnerName: partnerName || "CA Rajesh Singhania (FCA)",
          caMembershipNumber: membershipNo || "054921",
        },
      },
      { new: true }
    );
    if (!report) return res.status(404).json({ success: false, message: "Audit report not found" });

    res.json({
      success: true,
      message: "Unique Document Identification Number (UDIN) generated per ICAI guidelines",
      report: { ...report.toObject(), id: report.auditId || report._id.toString() },
    });
  } catch (error) {
    console.error("generateUdin error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 4. FINANCIAL STATEMENTS & BALANCE SHEET RECONCILIATION
// ============================================================================

export const getBalanceSheetRecons = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { clientName, financialYear } = req.query;

    if (shouldUseDevStore()) {
      const recons = devStore.getBalanceSheetRecons(userId, { clientName, financialYear });
      return res.json({ success: true, recons, mode: "dummy_data" });
    }

    const query = {
      $or: [{ userId }, { userId: "ca_1" }, { userId: "default_firm" }],
    };
    if (clientName) query.clientName = clientName;
    if (financialYear) query.financialYear = financialYear;

    const recons = await BalanceSheetRecon.find(query).sort({ updatedAt: -1 });

    res.json({
      success: true,
      recons: recons.map((b) => ({ ...b.toObject(), id: b.reconId || b._id.toString() })),
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getBalanceSheetRecons error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBalanceSheetRecon = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (shouldUseDevStore()) {
      const recon = devStore.createBalanceSheetRecon(userId, req.body);
      return res.status(201).json({ success: true, recon });
    }

    const bookDep = Number(req.body.bookDepreciationScheduleII) || 2800000;
    const taxDep = Number(req.body.taxDepreciationRule5) || 3450000;
    const diff = taxDep - bookDep;
    const dtl = Math.round(diff * -0.2517);

    const recon = await BalanceSheetRecon.create({
      ...req.body,
      reconId: req.body.id || `bs-${Date.now()}`,
      bookDepreciationScheduleII: bookDep,
      taxDepreciationRule5: taxDep,
      depreciationDifference: diff,
      deferredTaxAssetLiability: dtl,
      userId,
    });

    res.status(201).json({
      success: true,
      recon: { ...recon.toObject(), id: recon.reconId || recon._id.toString() },
    });
  } catch (error) {
    console.error("createBalanceSheetRecon error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBalanceSheetRecon = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      const recon = devStore.updateBalanceSheetRecon(req.params.id, req.body);
      if (!recon) return res.status(404).json({ success: false, message: "Reconciliation not found" });
      return res.json({ success: true, recon });
    }

    const recon = await BalanceSheetRecon.findOneAndUpdate(
      { $or: [{ reconId: req.params.id }, { _id: req.params.id }] },
      { $set: req.body },
      { new: true }
    );
    if (!recon) return res.status(404).json({ success: false, message: "Reconciliation not found" });

    res.json({
      success: true,
      recon: { ...recon.toObject(), id: recon.reconId || recon._id.toString() },
    });
  } catch (error) {
    console.error("updateBalanceSheetRecon error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBalanceSheetRecon = async (req, res) => {
  try {
    if (shouldUseDevStore()) {
      devStore.deleteBalanceSheetRecon(req.params.id);
      return res.json({ success: true, message: "Reconciliation deleted successfully" });
    }

    await BalanceSheetRecon.findOneAndDelete({
      $or: [{ reconId: req.params.id }, { _id: req.params.id }],
    });
    res.json({ success: true, message: "Reconciliation deleted successfully" });
  } catch (error) {
    console.error("deleteBalanceSheetRecon error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
