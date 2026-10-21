import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getDashboardKpis,
  getProfile,
  updateProfile,
  getCauseList,
  addCauseListItem,
  updateCauseListItem,
  getMatters,
  getMatterDetails,
  trackCaseByCnr,
  createMatter,
  getInvoices,
  createInvoice,
  updateInvoiceStatus,
  getCaseNotes,
  createCaseNote,
  deleteCaseNote,
  getConsultations,
  updateConsultation,
  getIncomingLeads,
  acceptLead,
  addMatterTimelineEvent,
  shareCourtDocument,
  getAdvocateDocuments,
  updateDocumentFilingStatus,
} from "../controllers/advocateController.js";

const router = express.Router();

// 1. Dashboard & Analytics
router.get("/dashboard", protect, getDashboardKpis);

// 2. Profile & Chamber Configuration
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// 3. Daily Cause List (Court Board)
router.get("/causelist", protect, getCauseList);
router.post("/causelist", protect, addCauseListItem);
router.put("/causelist/:id", protect, updateCauseListItem);

// 4. Matters Pipeline & Case Proceedings
router.get("/matters", protect, getMatters);
router.post("/matters", protect, createMatter);
router.get("/matters/track/:cnr", protect, trackCaseByCnr);
router.post("/matters/track", protect, trackCaseByCnr);
router.get("/matters/:id", protect, getMatterDetails);
router.post("/matters/:id/timeline", protect, addMatterTimelineEvent);

// 5. Invoices & Billing
router.get("/invoices", protect, getInvoices);
router.post("/invoices", protect, createInvoice);
router.put("/invoices/:id", protect, updateInvoiceStatus);

// 6. Chamber Notes & Precedents
router.get("/notes", protect, getCaseNotes);
router.post("/notes", protect, createCaseNote);
router.delete("/notes/:id", protect, deleteCaseNote);

// 7. Consultations & Client Appointments
router.get("/consultations", protect, getConsultations);
router.put("/consultations/:id", protect, updateConsultation);

// 8. Lead Intake / Citizen Grievances
router.get("/leads", protect, getIncomingLeads);
router.post("/leads/:id/accept", protect, acceptLead);

// 9. Shared Court Orders & Documents
router.post("/documents/share", protect, shareCourtDocument);
router.get("/documents", protect, getAdvocateDocuments);
router.put("/documents/:id/status", protect, updateDocumentFilingStatus);

export default router;
