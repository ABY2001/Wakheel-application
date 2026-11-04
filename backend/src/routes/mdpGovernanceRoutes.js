import express from "express";
import { mdpGovernanceController } from "../controllers/mdpGovernanceController.js";

const router = express.Router();

// Firm Governance Profile (Roster, Institute Credentials, Summary)
router.get("/", mdpGovernanceController.getFirmGovernance);

// Regulatory Code Lock Evaluation
router.post("/check-lock", mdpGovernanceController.checkActionAuthorization);

// Four-Eyes Trainee Delegation Queue
router.get("/delegated-tasks", mdpGovernanceController.getDelegatedTasks);
router.post("/delegated-tasks", mdpGovernanceController.createDelegatedTask);
router.patch("/delegated-tasks/:taskId/review", mdpGovernanceController.reviewDelegatedTask);

// Dual Sign-Off Gate Engine
router.get("/dual-gates", mdpGovernanceController.getDualSignOffGates);
router.post("/dual-gates/:gateId/sign", mdpGovernanceController.signDualSignOffGate);

export default router;
