import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
  submitGrievance,
  getGrievances,
  getGrievanceById,
  previewGrievanceTriage,
  matchAdvocateForGrievance,
  getMatters,
  getMatterByCnr,
  getAdvocatesDirectory,
  bookConsultation,
  getConsultations,
  getDocuments,
  uploadDocument,
  getLegalNotices,
  citizenAiChat,
  getCitizenInvoices,
  payCitizenInvoice,
} from "../controllers/citizenController.js";

const router = express.Router();

// 1. Profile & Settings
router.route("/profile").get(protect, getProfile).put(protect, updateProfile);

// 2. Legal Problem Intake & AI Triage ("Find Legal Help")
router.route("/grievances").post(protect, submitGrievance).get(protect, getGrievances);
router.route("/grievances/preview").post(protect, previewGrievanceTriage);
router.route("/grievances/:id").get(protect, getGrievanceById);
router.route("/grievances/:id/match").post(protect, matchAdvocateForGrievance);

// 3. Matters & Case Tracking
router.route("/matters").get(protect, getMatters);
router.route("/matters/:cnr").get(protect, getMatterByCnr);

// 4. Discover Advocates (Public / Protected)
router.route("/advocates").get(getAdvocatesDirectory);

// 5. Consultations & Chamber Bookings
router.route("/consultations").post(protect, bookConsultation).get(protect, getConsultations);

// 6. Document Vault
router.route("/documents").get(protect, getDocuments).post(protect, uploadDocument);

// 7. Statutory Legal Notices
router.route("/notices").get(protect, getLegalNotices);

// 8. Plain-Language Citizen AI Copilot ("Ask AI")
router.route("/ai/chat").post(protect, citizenAiChat);

// 9. Fee Invoices & Payment Settlement (Milestone 2 Two-Way Sync)
router.route("/invoices").get(protect, getCitizenInvoices);
router.route("/invoices/:id/pay").post(protect, payCitizenInvoice);

export default router;
