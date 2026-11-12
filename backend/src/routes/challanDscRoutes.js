import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getDscCertificates,
  toggleDscToken,
  verifyDscPin,
  signDocumentWithDsc,
  validateSignature,
  calculateMcaFee,
  getStatutoryChallans,
  createStatutoryChallan,
  payStatutoryChallan,
  getChallanReceipt,
} from "../controllers/challanDscController.js";

const router = express.Router();

// 1. Class 3 DSC Crypto Token Management & Digital Signer
router.get("/certificates", protect, getDscCertificates);
router.post("/tokens/plug", protect, toggleDscToken);
router.post("/tokens/verify-pin", protect, verifyDscPin);
router.post("/sign-document", protect, signDocumentWithDsc);
router.post("/validate-signature", protect, validateSignature);

// 2. Statutory E-Challans (MCA21, GST PMT-06, ITNS 280/281)
router.post("/calculate-mca-fee", calculateMcaFee);
router.get("/challans", protect, getStatutoryChallans);
router.post("/challans", protect, createStatutoryChallan);
router.post("/challans/:id/pay", protect, payStatutoryChallan);
router.get("/challans/:id/receipt", protect, getChallanReceipt);

export default router;
