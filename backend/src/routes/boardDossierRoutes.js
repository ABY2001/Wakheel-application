import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getBoardDossiers,
  getBoardDossierById,
  generateBoardDossier,
  downloadDossierHtml,
  verifyDossierSignatures,
} from "../controllers/boardDossierController.js";

const router = express.Router();

router.get("/", protect, getBoardDossiers);
router.post("/generate", protect, generateBoardDossier);
router.post("/verify", protect, verifyDossierSignatures);
router.get("/:id", protect, getBoardDossierById);
router.get("/:id/html", downloadDossierHtml);

export default router;
