import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getBoardMeetings,
  createBoardMeeting,
  updateBoardMeeting,
  deleteBoardMeeting,
  getBoardResolutions,
  createBoardResolution,
  updateBoardResolution,
  deleteBoardResolution,
  generateCtcResolution,
  getCorporateEntities,
  createCorporateEntity,
  updateCorporateEntity,
  deleteCorporateEntity,
  getRocFilings,
  createRocFiling,
  updateRocFiling,
  deleteRocFiling,
  getStatutoryRegisters,
  createRegisterEntry,
  updateRegisterEntry,
  deleteRegisterEntry,
  getSecretarialAuditReport,
  getCorporateContracts,
  createCorporateContract,
  updateCorporateContract,
  deleteCorporateContract,
  getRetainerAdvocates,
  createRetainerAdvocate,
  updateRetainerAdvocate,
  deleteRetainerAdvocate,
  getCorporateVaultItems,
  createCorporateVaultItem,
  updateCorporateVaultItem,
  deleteCorporateVaultItem,
  getSecretarialInvoices,
  createSecretarialInvoice,
  updateSecretarialInvoice,
  deleteSecretarialInvoice,
} from "../controllers/csController.js";

const router = express.Router();

// Board & General Meetings (SS-1 & SS-2)
router.route("/meetings").get(protect, getBoardMeetings).post(protect, createBoardMeeting);
router.route("/meetings/:id").put(protect, updateBoardMeeting).delete(protect, deleteBoardMeeting);

// Statutory Resolutions & Certified True Copy (CTC)
router.route("/resolutions").get(protect, getBoardResolutions).post(protect, createBoardResolution);
router.route("/resolutions/:id").put(protect, updateBoardResolution).delete(protect, deleteBoardResolution);
router.route("/resolutions/:id/ctc").post(protect, generateCtcResolution);

// Managed Corporate Entities
router.route("/entities").get(protect, getCorporateEntities).post(protect, createCorporateEntity);
router.route("/entities/:id").put(protect, updateCorporateEntity).delete(protect, deleteCorporateEntity);

// MCA21 & ROC Statutory Filings Tracker
router.route("/filings").get(protect, getRocFilings).post(protect, createRocFiling);
router.route("/filings/:id").put(protect, updateRocFiling).delete(protect, deleteRocFiling);

// Statutory Registers (Section 88, 170, 85, 186)
router.route("/registers").get(protect, getStatutoryRegisters).post(protect, createRegisterEntry);
router.route("/registers/:id").put(protect, updateRegisterEntry).delete(protect, deleteRegisterEntry);

// Secretarial Audit & MR-3 Compliance Engine
router.route("/audit").get(protect, getSecretarialAuditReport);

// Commercial Contracts & Shareholders' Agreements (SHA/SSA)
router.route("/contracts").get(protect, getCorporateContracts).post(protect, createCorporateContract);
router.route("/contracts/:id").put(protect, updateCorporateContract).delete(protect, deleteCorporateContract);

// Retainer Advocates & Litigation Counsel Network
router.route("/advocates").get(protect, getRetainerAdvocates).post(protect, createRetainerAdvocate);
router.route("/advocates/:id").put(protect, updateRetainerAdvocate).delete(protect, deleteRetainerAdvocate);

// Corporate Statutory Vault & DSC Tokens
router.route("/vault").get(protect, getCorporateVaultItems).post(protect, createCorporateVaultItem);
router.route("/vault/:id").put(protect, updateCorporateVaultItem).delete(protect, deleteCorporateVaultItem);

// Secretarial Fee Notes & Invoices
router.route("/invoices").get(protect, getSecretarialInvoices).post(protect, createSecretarialInvoice);
router.route("/invoices/:id").put(protect, updateSecretarialInvoice).delete(protect, deleteSecretarialInvoice);

export default router;
