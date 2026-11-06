import express from "express";
import {
  extractDocumentOcr,
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
import {
  draftSection186,
  analyzeClause43bMsme,
  draftGstDrc01Reply,
  interactiveCsCaQuery,
} from "../controllers/csCaCopilotController.js";

const router = express.Router();

// 1. Malayalam <-> English High Court Translation Suite & OCR Engine
router.post("/ocr", extractDocumentOcr);
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

// 7. Specialized AI Copilot for CS & CA (Milestone 6)
router.post("/cs/section-186-drafter", draftSection186);
router.post("/ca/clause-43b-msme-analyzer", analyzeClause43bMsme);
router.post("/ca/gst-drc01-replier", draftGstDrc01Reply);
router.post("/cs-ca/interactive-query", interactiveCsCaQuery);

export default router;

