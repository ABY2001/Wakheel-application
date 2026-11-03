import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getIncomeTaxReturns,
  createIncomeTaxReturn,
  updateIncomeTaxReturn,
  deleteIncomeTaxReturn,
  getGstReturns,
  createGstReturn,
  updateGstReturn,
  deleteGstReturn,
  getTaxAuditReports,
  createTaxAuditReport,
  updateTaxAuditReport,
  deleteTaxAuditReport,
  generateUdin,
  getBalanceSheetRecons,
  createBalanceSheetRecon,
  updateBalanceSheetRecon,
  deleteBalanceSheetRecon,
} from "../controllers/caController.js";

const router = express.Router();

// 1. Income Tax & ITR Filing Studio (ITR-1 through ITR-7, 26AS/AIS)
router.route("/itr").get(protect, getIncomeTaxReturns).post(protect, createIncomeTaxReturn);
router.route("/itr/:id").put(protect, updateIncomeTaxReturn).delete(protect, deleteIncomeTaxReturn);

// 2. GST Compliance Hub (GSTR-1, GSTR-3B, GSTR-9, ITC Matcher)
router.route("/gst").get(protect, getGstReturns).post(protect, createGstReturn);
router.route("/gst/:id").put(protect, updateGstReturn).delete(protect, deleteGstReturn);

// 3. Statutory & Tax Audit Engine (Form 3CD & CARO 2020, ICAI UDIN)
router.route("/audit").get(protect, getTaxAuditReports).post(protect, createTaxAuditReport);
router.route("/audit/:id").put(protect, updateTaxAuditReport).delete(protect, deleteTaxAuditReport);
router.route("/audit/:id/udin").post(protect, generateUdin);

// 4. Financial Statements & Balance Sheet Reconciliation (Ind AS 12, Dual Depreciation)
router.route("/reconciliations").get(protect, getBalanceSheetRecons).post(protect, createBalanceSheetRecon);
router.route("/reconciliations/:id").put(protect, updateBalanceSheetRecon).delete(protect, deleteBalanceSheetRecon);

export default router;
