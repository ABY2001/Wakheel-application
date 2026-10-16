import express from "express";
import {
  translateLegalDocument,
  summarizeJudgment,
  draftPleading,
  getCopilotTemplates,
  copilotQuery,
} from "../controllers/copilotController.js";

const router = express.Router();

// 1. Malayalam <-> English High Court Translation Suite
router.post("/translate", translateLegalDocument);

// 2. High Court Precedent & Judgment Summarizer
router.post("/summarize-judgment", summarizeJudgment);

// 3. Automated Statutory Legal Notice & Writ Drafter
router.post("/draft", draftPleading);
router.get("/templates", getCopilotTemplates);

// 4. Live Copilot Query Engine (Chat Canvas)
router.post("/query", copilotQuery);

export default router;
