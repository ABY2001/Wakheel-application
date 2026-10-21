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
  getMatterById,
  getMatterByCnr,
  trackCaseByCnr,
  createMatter,
  addMatterTimelineMilestone,
  getAdvocatesDirectory,
  bookConsultation,
  getConsultations,
  getDocuments,
  uploadDocument,
  fileDocument,
  getFilings,
  deleteDocument,
  verifyDocumentHash,
  getLegalNotices,
  getNoticeById,
  createLegalNotice,
  trackNoticeSpeedPost,
  generateNoticeDraft,
  deleteLegalNotice,
  citizenAiChat,
  getCitizenInvoices,
  getInvoiceById,
  payCitizenInvoice,
  createInvoiceRequest,
  getCitizenMessages,
  sendCitizenMessage,
  markMessageRead,
  getUnreadMessageCount,
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
router.route("/matters").get(protect, getMatters).post(protect, createMatter);
router.route("/matters/track/:cnr").get(protect, trackCaseByCnr);
router.route("/matters/track").post(protect, trackCaseByCnr);
router.route("/matters/detail/:id").get(protect, getMatterById);
router.route("/matters/:id/timeline").post(protect, addMatterTimelineMilestone);
router.route("/matters/:cnr").get(protect, getMatterByCnr);

// 4. Discover Advocates (Public / Protected)
router.route("/advocates").get(getAdvocatesDirectory);

// 5. Consultations & Chamber Bookings
router.route("/consultations").post(protect, bookConsultation).get(protect, getConsultations);

// 6. Document Vault & Court Document Filing
router.route("/documents").get(protect, getDocuments).post(protect, uploadDocument);
router.route("/documents/file").post(protect, fileDocument);
router.route("/documents/filings").get(protect, getFilings);
router.route("/documents/:id").delete(protect, deleteDocument);
router.route("/documents/:id/verify").get(protect, verifyDocumentHash);

// 7. Statutory Legal Notices & Speed Post Tracking
router.route("/notices").get(protect, getLegalNotices).post(protect, createLegalNotice);
router.route("/notices/generate-draft").post(protect, generateNoticeDraft);
router.route("/notices/:id").get(protect, getNoticeById).delete(protect, deleteLegalNotice);
router.route("/notices/:id/track").get(protect, trackNoticeSpeedPost);

// 8. Plain-Language Citizen AI Copilot ("Ask AI")
router.route("/ai/chat").post(protect, citizenAiChat);

// 9. Fee Invoices & Payment Settlement (Milestone 2 Two-Way Sync)
router.route("/invoices").get(protect, getCitizenInvoices).post(protect, createInvoiceRequest);
router.route("/invoices/:id").get(protect, getInvoiceById);
router.route("/invoices/:id/pay").post(protect, payCitizenInvoice);

// 10. Secure Client-Advocate Privileged Messaging & Inbox
router.route("/messages").get(protect, getCitizenMessages).post(protect, sendCitizenMessage);
router.route("/messages/unread-count").get(protect, getUnreadMessageCount);
router.route("/messages/:id/read").put(protect, markMessageRead);

export default router;
