import express from "express";
import {
  getBoardDossiers,
  getBoardDossierById,
  generateBoardDossier,
  downloadDossierHtml,
  verifyDossierSignatures,
} from "../controllers/boardDossierController.js";

const router = express.Router();

router.get("/", getBoardDossiers);
router.post("/generate", generateBoardDossier);
router.post("/verify", verifyDossierSignatures);
router.get("/:id", getBoardDossierById);
router.get("/:id/html", downloadDossierHtml);

export default router;
