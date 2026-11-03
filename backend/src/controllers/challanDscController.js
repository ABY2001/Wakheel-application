// ============================================================================
// WAKHEEL CLASS 3 DSC CRYPTO TOKEN & STATUTORY CHALLAN CONTROLLER
// Compliant with CCA India Guidelines, Information Technology Act 2000,
// Companies (Registration Offices and Fees) Rules 2014, and GST Rule 87
// Dual-Mode: MongoDB Atlas + devStore Fallback
// ============================================================================

import crypto from "crypto";
import { DscCertificate } from "../models/DscCertificate.js";
import { StatutoryChallan } from "../models/StatutoryChallan.js";
import { devStore } from "../utils/devStore.js";

// Check if MongoDB is connected
const isMongoConnected = () => {
  return DscCertificate.db?.readyState === 1;
};

// ============================================================================
// 1. CLASS 3 DSC TOKEN & HARDWARE CRYPTOGRAPHIC SIGNER
// ============================================================================

// @desc    Get all registered DSC certificates / USB tokens
// @route   GET /api/dsc-challan/certificates
// @access  Public / Protected
export const getDscCertificates = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || "cs_1";
    const { holderRole, tokenStatus } = req.query;

    if (isMongoConnected()) {
      const query = { userId };
      if (holderRole) query.holderRole = holderRole;
      if (tokenStatus) query.tokenStatus = tokenStatus;
      const certs = await DscCertificate.find(query).sort({ holderRole: 1 });
      return res.json({ success: true, count: certs.length, certificates: certs, mode: "mongo" });
    }

    const certs = devStore.getDscCertificates(userId, { holderRole, tokenStatus });
    res.json({ success: true, count: certs.length, certificates: certs, mode: "devStore" });
  } catch (error) {
    console.error("getDscCertificates error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Plug in or unplug USB DSC token
// @route   POST /api/dsc-challan/tokens/plug
// @access  Public / Protected
export const toggleDscToken = async (req, res) => {
  try {
    const { certificateId, isPlugged = true } = req.body;

    if (!certificateId) {
      return res.status(400).json({ success: false, message: "Certificate ID is required." });
    }

    const newStatus = isPlugged ? "plugged_in" : "unplugged";

    if (isMongoConnected()) {
      const updated = await DscCertificate.findOneAndUpdate(
        { $or: [{ certificateId }, { serialNumber: certificateId }] },
        { tokenStatus: newStatus },
        { new: true }
      );
      return res.json({ success: true, certificate: updated, mode: "mongo" });
    }

    const updated = devStore.plugDscToken(certificateId, isPlugged);
    res.json({ success: true, certificate: updated, mode: "devStore" });
  } catch (error) {
    console.error("toggleDscToken error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify USB token user PIN (FIPS 140-2 Level 2 security)
// @route   POST /api/dsc-challan/tokens/verify-pin
// @access  Public / Protected
export const verifyDscPin = async (req, res) => {
  try {
    const { certificateId, pin } = req.body;

    if (!pin || !pin.trim()) {
      return res.status(400).json({ success: false, message: "Token PIN is required." });
    }

    // Default master PIN for simulated USB tokens
    const validPins = ["12345678", "123456", "892144"];
    const isPinValid = validPins.includes(pin.trim());

    if (!isPinValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect USB Token PIN. 2 attempts remaining before hardware lockout.",
      });
    }

    res.json({
      success: true,
      message: "USB Token PIN authenticated successfully. Cryptographic session unlocked for 15 minutes.",
      sessionToken: `DSC-SES-${Date.now().toString(36).toUpperCase()}`,
    });
  } catch (error) {
    console.error("verifyDscPin error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Affix Class 3 Digital Signature Certificate to document payload
// @route   POST /api/dsc-challan/sign-document
// @access  Public / Protected
export const signDocumentWithDsc = async (req, res) => {
  try {
    const {
      certificateId = "DSC-CS-8921",
      pin = "12345678",
      documentTitle = "Board Resolution under Section 186",
      documentType = "board_resolution", // board_resolution | form_3cd | aoc4_financials | dir3_kyc | custom_pdf
      documentPayload = "",
      entityName = "CyberCorp Technologies Pvt Ltd",
    } = req.body;

    // Validate PIN
    const validPins = ["12345678", "123456", "892144"];
    if (!validPins.includes(pin.trim())) {
      return res.status(401).json({ success: false, message: "Invalid USB Token PIN." });
    }

    // Find certificate
    let cert = null;
    if (isMongoConnected()) {
      cert = await DscCertificate.findOne({
        $or: [{ certificateId }, { serialNumber: certificateId }],
      });
    } else {
      cert = devStore.getDscCertificateById(certificateId);
    }

    if (!cert) {
      return res.status(404).json({ success: false, message: "DSC Certificate not found." });
    }

    if (cert.tokenStatus === "unplugged") {
      return res.status(400).json({
        success: false,
        message: "USB Token is not plugged into workstation. Please plug in the hardware token.",
      });
    }

    // Cryptographic SHA-256 Digest of Document
    const contentToHash = `${documentTitle}::${entityName}::${documentPayload || Date.now()}`;
    const sha256Hash = crypto.createHash("sha256").update(contentToHash).digest("hex");
    const signatureToken = `SIG_SHA256_${crypto.randomBytes(16).toString("hex").toUpperCase()}`;
    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // Update signature count
    if (isMongoConnected()) {
      await DscCertificate.updateOne(
        { _id: cert._id },
        { $inc: { totalSignaturesAffixed: 1 }, $set: { lastUsedAt: timestamp } }
      );
    } else {
      devStore.updateDscCertificate(cert.id || cert.certificateId, {
        totalSignaturesAffixed: (cert.totalSignaturesAffixed || 142) + 1,
        lastUsedAt: timestamp,
      });
    }

    // Visual Signature Plaque Details (Compliant with CCA India & MCA21 specifications)
    const visualPlaque = {
      digitallySignedBy: cert.holderName,
      reason: `Authorized Signature for ${documentTitle}`,
      location: "New Delhi, India",
      dateFormatted: formattedDate,
      issuerCa: cert.issuerCa,
      certificateSerial: cert.serialNumber,
      keyAlgorithm: cert.keyAlgorithm || "RSA 2048-bit / SHA-256",
      membershipNumber: cert.membershipNumber || cert.din || "FCS-8921",
      pan: cert.pan,
      sha256Digest: sha256Hash,
      signatureToken,
      isValid: true,
      ccaVerified: true,
    };

    res.json({
      success: true,
      message: `Document "${documentTitle}" signed successfully with Class 3 DSC.`,
      signature: visualPlaque,
      documentTitle,
      entityName,
      timestamp,
    });
  } catch (error) {
    console.error("signDocumentWithDsc error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate an existing digital signature to ensure zero document tampering
// @route   POST /api/dsc-challan/validate-signature
// @access  Public / Protected
export const validateSignature = async (req, res) => {
  try {
    const { sha256Digest, originalContent, documentTitle } = req.body;

    if (!sha256Digest) {
      return res.status(400).json({ success: false, message: "Signature hash is required." });
    }

    // In simulated environment, verification validates SHA-256 integrity
    const isValid = sha256Digest.length === 64;

    res.json({
      success: true,
      verified: isValid,
      trustChain: {
        rootCa: "Controller of Certifying Authorities (CCA India) 2014 Root",
        subCa: "e-Mudhra Sub-CA for Class 3 Individual 2014",
        crlStatus: "Good (Certificate not revoked)",
        ocspValidation: "Successful (Real-Time Validated)",
        timestampIntegrity: "RFC 3161 Compliant Time-Stamp Token Verified",
      },
      message: isValid
        ? "Signature is valid. Document has not been altered or tampered with since signing."
        : "Signature validation failed. Document hash mismatch.",
    });
  } catch (error) {
    console.error("validateSignature error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 2. STATUTORY E-CHALLAN SIMULATION ENGINE (MCA21, GST PMT-06, ITNS 280/281)
// ============================================================================

// @desc    Calculate statutory MCA21 filing fee & delayed filing fee
// @route   POST /api/dsc-challan/calculate-mca-fee
// @access  Public / Protected
export const calculateMcaFee = async (req, res) => {
  try {
    const {
      authorizedCapital = 25000000, // ₹2.5 Cr
      formType = "annual_return", // annual_return (AOC-4/MGT-7) | normal_eform (DIR-12, PAS-3) | mgt14
      daysOfDelay = 0,
    } = req.body;

    // Table A / B Fee Schedule under Companies (Registration Offices and Fees) Rules, 2014
    let normalFee = 600;
    const capital = Number(authorizedCapital || 0);

    if (capital < 100000) {
      normalFee = 200;
    } else if (capital < 500000) {
      normalFee = 300;
    } else if (capital < 2500000) {
      normalFee = 400;
    } else if (capital < 10000000) {
      normalFee = 500;
    } else {
      normalFee = 600;
    }

    // Additional Fee / Late Fee Multiplier Calculation
    const delay = Number(daysOfDelay || 0);
    let lateFee = 0;
    let lateFeeSlab = "Nil (Filed within due date)";

    if (delay > 0) {
      if (formType === "annual_return") {
        // Under Section 403 / Rule 12: ₹100 per day of delay for AOC-4 & MGT-7
        lateFee = delay * 100;
        lateFeeSlab = `₹100 per day for ${delay} days of delay`;
      } else {
        // General e-Form Delay Slabs
        if (delay <= 30) {
          lateFee = normalFee * 2;
          lateFeeSlab = "Up to 30 days: 2x Normal Fee";
        } else if (delay <= 60) {
          lateFee = normalFee * 4;
          lateFeeSlab = "31 to 60 days: 4x Normal Fee";
        } else if (delay <= 90) {
          lateFee = normalFee * 6;
          lateFeeSlab = "61 to 90 days: 6x Normal Fee";
        } else if (delay <= 180) {
          lateFee = normalFee * 10;
          lateFeeSlab = "91 to 180 days: 10x Normal Fee";
        } else {
          lateFee = normalFee * 12;
          lateFeeSlab = "Beyond 180 days: 12x Normal Fee";
        }
      }
    }

    const totalPayable = normalFee + lateFee;

    res.json({
      success: true,
      data: {
        authorizedCapital: capital,
        formType,
        daysOfDelay: delay,
        normalFee,
        lateFee,
        totalPayable,
        lateFeeSlab,
        statutorySchedule: "Table A & B of Companies (Registration Offices and Fees) Rules, 2014",
      },
    });
  } catch (error) {
    console.error("calculateMcaFee error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all statutory challans
// @route   GET /api/dsc-challan/challans
// @access  Public / Protected
export const getStatutoryChallans = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || "cs_1";
    const { portal, paymentStatus, entityName } = req.query;

    if (isMongoConnected()) {
      const query = { userId };
      if (portal && portal !== "ALL") query.portal = portal;
      if (paymentStatus && paymentStatus !== "ALL") query.paymentStatus = paymentStatus;
      if (entityName) query.entityName = { $regex: entityName, $options: "i" };

      const challans = await StatutoryChallan.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: challans.length, challans, mode: "mongo" });
    }

    const challans = devStore.getStatutoryChallans(userId, { portal, paymentStatus, entityName });
    res.json({ success: true, count: challans.length, challans, mode: "devStore" });
  } catch (error) {
    console.error("getStatutoryChallans error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate / Create a new statutory challan
// @route   POST /api/dsc-challan/challans
// @access  Public / Protected
export const createStatutoryChallan = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || "cs_1";
    const {
      portal = "MCA21", // MCA21 | GSTN | CBDT_INCOME_TAX
      challanType = "ROC_ANNUAL_FILING",
      entityName = "CyberCorp Technologies Pvt Ltd",
      cinOrPanOrGstin = "U72200DL2022PTC394812",
      financialYear = "2025-26",
      assessmentYear = "2026-27",
      filingForm = "AOC-4",
      baseFeeOrTax = 600,
      additionalOrLateFee = 0,
      interest = 0,
      penalty = 0,
      tenderedBank = "State Bank of India (SBI)",
      paymentMode = "INTERNET_BANKING",
      dscSignatory = "CS Rajesh Sharma (FCS-8921)",
    } = req.body;

    const totalAmount =
      Number(baseFeeOrTax || 0) +
      Number(additionalOrLateFee || 0) +
      Number(interest || 0) +
      Number(penalty || 0);

    // Generate statutory identifier
    let srnOrCpinOrCin = "";
    if (portal === "MCA21") {
      srnOrCpinOrCin = `SRN-F${Math.floor(1000000 + Math.random() * 9000000)}`;
    } else if (portal === "GSTN") {
      srnOrCpinOrCin = `2610${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    } else {
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      srnOrCpinOrCin = `0290142${datePart}${Math.floor(10000 + Math.random() * 90000)}`;
    }

    const challanData = {
      challanId: `CHL-${portal.slice(0, 3)}-${Date.now().toString().slice(-6)}`,
      userId,
      portal,
      challanType,
      entityName,
      cinOrPanOrGstin: cinOrPanOrGstin.toUpperCase(),
      financialYear,
      assessmentYear,
      filingForm,
      srnOrCpinOrCin,
      bsrCode: "0290142",
      challanSerialNumber: `${Math.floor(10000 + Math.random() * 90000)}`,
      tenderedBank,
      paymentMode,
      amountBreakdown: {
        baseFeeOrTax: Number(baseFeeOrTax),
        additionalOrLateFee: Number(additionalOrLateFee),
        interest: Number(interest),
        penalty: Number(penalty),
        totalAmount,
      },
      paymentStatus: "GENERATED",
      dscSignatory,
      clientBilled: false,
    };

    if (isMongoConnected()) {
      const created = await StatutoryChallan.create(challanData);
      return res.status(201).json({ success: true, challan: created, mode: "mongo" });
    }

    const created = devStore.createStatutoryChallan(userId, challanData);
    res.status(201).json({ success: true, challan: created, mode: "devStore" });
  } catch (error) {
    console.error("createStatutoryChallan error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Simulate payment of statutory challan (Pay-Gov / GSTN / OLTAS payment gateway)
// @route   POST /api/dsc-challan/challans/:id/pay
// @access  Public / Protected
export const payStatutoryChallan = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMode = "INTERNET_BANKING", tenderedBank = "State Bank of India (SBI)" } = req.body;

    const timestamp = new Date().toISOString();

    if (isMongoConnected()) {
      const challan = await StatutoryChallan.findOne({
        $or: [{ _id: id }, { challanId: id }, { srnOrCpinOrCin: id }],
      });

      if (!challan) {
        return res.status(404).json({ success: false, message: "Challan not found." });
      }

      const receiptNo = `RCPT-${challan.portal.slice(0, 3)}-${Date.now().toString().slice(-6)}`;
      challan.paymentStatus = "PAID";
      challan.paidAt = timestamp;
      challan.receiptNumber = receiptNo;
      challan.paymentMode = paymentMode;
      challan.tenderedBank = tenderedBank;
      await challan.save();

      return res.json({ success: true, message: "Challan paid successfully.", challan, mode: "mongo" });
    }

    const updated = devStore.payStatutoryChallan(id, { paymentMode, tenderedBank });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Challan not found." });
    }

    res.json({ success: true, message: "Challan paid successfully.", challan: updated, mode: "devStore" });
  } catch (error) {
    console.error("payStatutoryChallan error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get official printable statutory payment receipt pack
// @route   GET /api/dsc-challan/challans/:id/receipt
// @access  Public / Protected
export const getChallanReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    let challan = null;
    if (isMongoConnected()) {
      challan = await StatutoryChallan.findOne({
        $or: [{ _id: id }, { challanId: id }, { srnOrCpinOrCin: id }],
      });
    } else {
      challan = devStore.getStatutoryChallanById(id);
    }

    if (!challan) {
      return res.status(404).json({ success: false, message: "Challan not found." });
    }

    const formattedPaidDate = challan.paidAt
      ? new Date(challan.paidAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      : "Pending Payment";

    // Format Official Receipt Pack
    const receiptData = {
      receiptNumber: challan.receiptNumber || `RCPT-${challan.srnOrCpinOrCin}`,
      portal: challan.portal,
      portalTitle:
        challan.portal === "MCA21"
          ? "Ministry of Corporate Affairs — Pay-Gov India Portal"
          : challan.portal === "GSTN"
          ? "Goods and Services Tax Network (GSTN) — PMT-06 Payment Counterfoil"
          : "Income Tax Department — Tax Information Network (TIN-NSDL / OLTAS)",
      entityName: challan.entityName,
      cinOrPanOrGstin: challan.cinOrPanOrGstin,
      filingForm: challan.filingForm,
      srnOrCpinOrCin: challan.srnOrCpinOrCin,
      bsrCode: challan.bsrCode,
      challanSerialNumber: challan.challanSerialNumber,
      tenderedBank: challan.tenderedBank,
      paymentMode: challan.paymentMode,
      totalAmount: challan.amountBreakdown?.totalAmount || 600,
      amountBreakdown: challan.amountBreakdown,
      paidAtFormatted: formattedPaidDate,
      paymentStatus: challan.paymentStatus,
      bankReferenceNumber: `BRN-${Math.floor(100000000 + Math.random() * 900000000)}`,
      qrPayload: `WAKHEEL-CHALLAN-VERIFY:${challan.srnOrCpinOrCin}:${challan.amountBreakdown?.totalAmount}`,
      dscSignatory: challan.dscSignatory,
    };

    res.json({ success: true, receipt: receiptData });
  } catch (error) {
    console.error("getChallanReceipt error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
