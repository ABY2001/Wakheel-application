import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getDueDiligenceAudits,
  getDueDiligenceAuditById,
  createDueDiligenceAudit,
  updateAuditCheckpoint,
  calculateStatutoryPenalties,
  generateCompoundingPetition,
  attestAuditReport,
  deleteDueDiligenceAudit,
} from "../controllers/dueDiligenceController.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getDueDiligenceAudits)
  .post(createDueDiligenceAudit);

router.post("/calculate-penalties", calculateStatutoryPenalties);
router.post("/compounding-petition", generateCompoundingPetition);

router.route("/:id")
  .get(getDueDiligenceAuditById)
  .delete(deleteDueDiligenceAudit);

router.patch("/:id/checkpoint", updateAuditCheckpoint);
router.post("/:id/attest", attestAuditReport);

export default router;
