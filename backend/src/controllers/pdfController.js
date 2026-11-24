import {
  generatePleadingsAppraisalPdf,
  generateMootVerdictCertificatePdf,
  generateCornellNotePdf,
} from "../services/pdfService.js";
import {
  AcademySubmission,
  AcademyMootRecord,
  AcademyCornellNote,
} from "../models/academyModels.js";
import { getIsMongoConnected } from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../../data");

const readDiskJson = (filename, defaultVal) => {
  try {
    const fullPath = path.join(DATA_DIR, filename);
    if (fs.existsSync(fullPath)) {
      return JSON.parse(fs.readFileSync(fullPath, "utf-8"));
    }
  } catch {}
  return defaultVal;
};

/**
 * Generate Pleadings / Memorial Appraisal PDF
 * GET /api/pdf/appraisal/:id
 * POST /api/pdf/appraisal
 */
export const downloadAppraisalPdf = async (req, res) => {
  try {
    let submissionData = req.body || {};
    const id = req.params?.id || req.body?.id;

    if (id) {
      if (getIsMongoConnected()) {
        const found = await AcademySubmission.findOne({
          $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
        });
        if (found) submissionData = { ...found.toObject(), ...submissionData };
      } else {
        const diskSubmissions = readDiskJson("dev_academy_submissions.json", []);
        const found = diskSubmissions.find((s) => s.customId === id || s.id === id);
        if (found) submissionData = { ...found, ...submissionData };
      }
    }

    if (!submissionData.assignmentTitle && !submissionData.studentName) {
      submissionData = {
        assignmentTitle: "Drafting Exercise: Criminal Appeal under BNSS § 480",
        studentName: req.user?.fullName || "Advithya Sharma",
        studentEmail: req.user?.email || "scholar@law.edu",
        score: 48,
        maxScore: 50,
        status: "Distinction (Tier-1 Oral Advocacy)",
        evaluatedBy: "Prof. Dr. Rajesh Varma",
        feedback:
          "The drafting demonstrates rigorous statutory parity with recent legal transitions. The distinction drawn between statutory bail conditions and discretionary bench prerogatives was eloquently argued.",
        prayerOrConclusion:
          "Wherefore, it is most respectfully prayed that this Hon'ble Court may be pleased to grant regular bail to the accused applicant.",
      };
    }

    const pdfBuffer = await generatePleadingsAppraisalPdf(submissionData);

    const safeFilename = `Appraisal_${(submissionData.studentName || "Scholar").replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${safeFilename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.end(pdfBuffer);
  } catch (error) {
    console.error("downloadAppraisalPdf error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Generate 3D Moot Court Trial Verdict Certificate PDF
 * GET /api/pdf/moot-certificate/:id
 * POST /api/pdf/moot-certificate
 */
export const downloadMootCertificatePdf = async (req, res) => {
  try {
    let mootData = req.body || {};
    const id = req.params?.id || req.body?.id;

    if (id) {
      if (getIsMongoConnected()) {
        const found = await AcademyMootRecord.findOne({
          $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
        });
        if (found) mootData = { ...found.toObject(), ...mootData };
      } else {
        const diskRecords = readDiskJson("dev_academy_moot_records.json", []);
        const found = diskRecords.find((r) => r.customId === id || r.id === id);
        if (found) mootData = { ...found, ...mootData };
      }
    }

    if (!mootData.caseTitle && !mootData.studentName) {
      mootData = {
        studentName: req.user?.fullName || "Advithya Sharma",
        caseTitle: "State of NCT v. Rohan Oberoi — BNSS § 480 Regular Bail",
        verdict: "Bail Granted with Conditions",
        totalScore: 94,
        maxScore: 100,
        percentage: 94,
        drillStats: { accuracyRate: 100, correctAnswers: 5, totalAttempts: 5 },
        completedDate: new Date().toLocaleDateString("en-IN"),
      };
    }

    const pdfBuffer = await generateMootVerdictCertificatePdf(mootData);

    const safeFilename = `Moot_Certificate_${(mootData.studentName || "Scholar").replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${safeFilename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.end(pdfBuffer);
  } catch (error) {
    console.error("downloadMootCertificatePdf error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Generate Cornell Research Brief PDF
 * GET /api/pdf/cornell-brief/:id
 * POST /api/pdf/cornell-brief
 */
export const downloadCornellBriefPdf = async (req, res) => {
  try {
    let noteData = req.body || {};
    const id = req.params?.id || req.body?.id;

    if (id) {
      if (getIsMongoConnected()) {
        const found = await AcademyCornellNote.findOne({
          $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
        });
        if (found) noteData = { ...found.toObject(), ...noteData };
      } else {
        const diskNotes = readDiskJson("dev_academy_notes.json", []);
        const found = diskNotes.find((n) => n.customId === id || n.id === id);
        if (found) noteData = { ...found, ...noteData };
      }
    }

    if (!noteData.title) {
      noteData = {
        title: "Article 21 & Procedural Due Process in Digital Surveillance",
        subject: "Constitutional Law",
        topic: "Fundamental Rights & State Action",
        author: req.user?.fullName || "Advithya Sharma",
        lastEdited: new Date().toLocaleDateString("en-IN"),
        cues: ["Right to Privacy", "Proportionality Test", "Legitimate State Aim", "Informational Autonomy"],
        statutoryReferences: ["Constitution Art. 21", "DPDP Act 2023 Sec 6", "Telegraph Act 1885 Sec 5(2)"],
        content:
          "In K.S. Puttaswamy (Retd.) v. Union of India (2017) 10 SCC 1, the 9-judge bench unanimously established privacy as an inalienable fundamental right under Article 21. Any state encroachment must satisfy the 4-fold proportionality standard:\n1. Legality (prescribed by law)\n2. Legitimate aim (public interest)\n3. Proportionality (least restrictive means)\n4. Procedural safeguards against abuse.",
        summary:
          "Executive orders lacking legislative authorization or judicial oversight violate Article 21. Interception and digital surveillance require strict proportionality review.",
      };
    }

    const pdfBuffer = await generateCornellNotePdf(noteData);

    const safeFilename = `Cornell_Brief_${(noteData.title || "Note").replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30)}_${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${safeFilename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.end(pdfBuffer);
  } catch (error) {
    console.error("downloadCornellBriefPdf error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
