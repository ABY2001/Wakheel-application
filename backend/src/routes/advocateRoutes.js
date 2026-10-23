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
  getConsultationById,
  updateConsultation,
  recordConsultationAdvice,
  rescheduleConsultation,
  cancelConsultation,
  joinConsultationRoom,
  getIncomingLeads,
  acceptLead,
  addMatterTimelineEvent,
  shareCourtDocument,
  getAdvocateDocuments,
  updateDocumentFilingStatus,
  uploadAdvocateDocument,
  deleteAdvocateDocument,
  getAdvocateMessages,
  getAdvocateThread,
  sendAdvocateMessage,
  markAdvocateMessagesRead,
  getAdvocateUnreadMessageCount,
  getClients,
  getClientDetails,
  addClient,
  updateClient,
  getDictations,
  createDictation,
  deleteDictation,
  convertDictationToCaseNote,
  getErpOverview,
  getTrustTransactions,
  addTrustTransaction,
  getExpenses,
  addExpense,
  getAssociates,
  addAssociate,
  getBenchAnalytics,
  getChamberReports,
  generateChamberReport,
  getCasePrep,
  saveCasePrep,
  generateAiBenchStrategy,
  getAdvocateAgents,
  triggerAdvocateAgent,
  toggleAdvocateAgent,
  convertBnsSection,
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
router.get("/consultations/:id", protect, getConsultationById);
router.put("/consultations/:id", protect, updateConsultation);
router.post("/consultations/:id/advice", protect, recordConsultationAdvice);
router.put("/consultations/:id/reschedule", protect, rescheduleConsultation);
router.put("/consultations/:id/cancel", protect, cancelConsultation);
router.get("/consultations/:id/room", protect, joinConsultationRoom);

// 8. Lead Intake / Citizen Grievances
router.get("/leads", protect, getIncomingLeads);
router.post("/leads/:id/accept", protect, acceptLead);

// 9. Shared Court Orders & Documents
router.post("/documents/share", protect, shareCourtDocument);
router.get("/documents", protect, getAdvocateDocuments);
router.post("/documents", protect, uploadAdvocateDocument);
router.put("/documents/:id/status", protect, updateDocumentFilingStatus);
router.delete("/documents/:id", protect, deleteAdvocateDocument);

// 10. Privileged Chamber Messaging & Two-Way Real-time Sync
router.get("/messages", protect, getAdvocateMessages);
router.get("/messages/unread-count", protect, getAdvocateUnreadMessageCount);
router.get("/messages/thread/:citizenId", protect, getAdvocateThread);
router.post("/messages/send", protect, sendAdvocateMessage);
router.put("/messages/read/:citizenId", protect, markAdvocateMessagesRead);

// 11. Client Representation Roster & 360 Dossiers
router.get("/clients", protect, getClients);
router.get("/clients/:id", protect, getClientDetails);
router.post("/clients", protect, addClient);
router.put("/clients/:id", protect, updateClient);

// 12. Chamber Voice Dictations & Audio Notes
router.get("/dictations", protect, getDictations);
router.post("/dictations", protect, createDictation);
router.delete("/dictations/:id", protect, deleteDictation);
router.post("/dictations/:id/convert-to-case-note", protect, convertDictationToCaseNote);

// 13. Law Practice ERP & Trust/IOLTA Accounting
router.get("/erp/overview", protect, getErpOverview);
router.get("/erp/trust", protect, getTrustTransactions);
router.post("/erp/trust", protect, addTrustTransaction);
router.get("/erp/expenses", protect, getExpenses);
router.post("/erp/expenses", protect, addExpense);
router.get("/erp/associates", protect, getAssociates);
router.post("/erp/associates", protect, addAssociate);

// 14. Bench Analytics & Certified Chamber Reports
router.get("/analytics/bench", protect, getBenchAnalytics);
router.get("/analytics/reports", protect, getChamberReports);
router.post("/analytics/reports/generate", protect, generateChamberReport);

// 15. Case Preparation & Bench Argument Dossier (Option B)
router.get("/case-prep/:matterId", protect, getCasePrep);
router.post("/case-prep/:matterId", protect, saveCasePrep);
router.post("/case-prep/:matterId/ai-assist", protect, generateAiBenchStrategy);

// 16. Autonomous AI Legal Agents & Workflows (Option 4)
router.get("/agents", protect, getAdvocateAgents);
router.post("/agents/:agentId/trigger", protect, triggerAdvocateAgent);
router.post("/agents/:agentId/toggle", protect, toggleAdvocateAgent);
router.post("/agents/bns-convert", protect, convertBnsSection);

export default router;
