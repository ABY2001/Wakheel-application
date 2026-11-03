import express from "express";
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
router.get("/certificates", getDscCertificates);
router.post("/tokens/plug", toggleDscToken);
router.post("/tokens/verify-pin", verifyDscPin);
router.post("/sign-document", signDocumentWithDsc);
router.post("/validate-signature", validateSignature);

// 2. Statutory E-Challans (MCA21, GST PMT-06, ITNS 280/281)
router.post("/calculate-mca-fee", calculateMcaFee);
router.get("/challans", getStatutoryChallans);
router.post("/challans", createStatutoryChallan);
router.post("/challans/:id/pay", payStatutoryChallan);
router.get("/challans/:id/receipt", getChallanReceipt);

export default router;
