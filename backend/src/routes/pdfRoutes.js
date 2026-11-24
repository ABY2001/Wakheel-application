import express from "express";
import {
  downloadAppraisalPdf,
  downloadMootCertificatePdf,
  downloadCornellBriefPdf,
} from "../controllers/pdfController.js";

const router = express.Router();

// 1. Pleadings & Memorial Appraisal PDF
router.get("/appraisal", downloadAppraisalPdf);
router.get("/appraisal/:id", downloadAppraisalPdf);
router.post("/appraisal", downloadAppraisalPdf);

// 2. 3D Courtroom Moot Trial Verdict Certificate PDF
router.get("/moot-certificate", downloadMootCertificatePdf);
router.get("/moot-certificate/:id", downloadMootCertificatePdf);
router.post("/moot-certificate", downloadMootCertificatePdf);

// 3. Cornell Legal Research Case Brief PDF
router.get("/cornell-brief", downloadCornellBriefPdf);
router.get("/cornell-brief/:id", downloadCornellBriefPdf);
router.post("/cornell-brief", downloadCornellBriefPdf);

export default router;
