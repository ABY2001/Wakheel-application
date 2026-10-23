import express from "express";
import {
  translateLegalDocument,
  summarizeJudgment,
  draftPleading,
  getCopilotTemplates,
  refineLegalDraft,
  copilotQuery,
  extractCaseChronology,
  auditChronologyConflicts,
  generateHighCourtSynopsis,
  auditContract,
  redlineClause,
} from "../controllers/copilotController.js";

const router = express.Router();

// 1. Malayalam <-> English High Court Translation Suite
router.post("/translate", translateLegalDocument);

// 2. High Court Precedent & Judgment Summarizer
router.post("/summarize-judgment", summarizeJudgment);

// 3. Automated Statutory Legal Notice & Writ Drafter
router.post("/draft", draftPleading);
router.get("/templates", getCopilotTemplates);
router.post("/refine", refineLegalDraft);

// 4. Live Copilot Query Engine (Chat Canvas)
router.post("/query", copilotQuery);

// 5. Interactive Case Chronology & Fact Timeline Builder (Milestone 4)
router.post("/chronology/extract", extractCaseChronology);
router.post("/chronology/audit-conflicts", auditChronologyConflicts);
router.post("/chronology/generate-synopsis", generateHighCourtSynopsis);

// 6. Contract Intelligence & Risk Audit (Option C)
router.post("/contract/audit", auditContract);
router.post("/contract/redline", redlineClause);

export default router;

