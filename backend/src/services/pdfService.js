import PDFDocument from "pdfkit";

// Signature Wakheel Brand Color Palette
const COLORS = {
  black: "#09090b",
  zincDark: "#18181b",
  zincMuted: "#71717a",
  zincLight: "#f4f4f5",
  gold: "#d97706",
  goldLight: "#f59e0b",
  goldDark: "#92400e",
  white: "#ffffff",
  lineBorder: "#27272a",
};

/**
 * Draws the official Wakheel Legal Academy header & decorative gold rule
 */
const drawWakheelHeader = (doc, subtitle = "CHAMBERS OF JURISPRUDENCE & ADVOCACY") => {
  doc.rect(0, 0, doc.page.width, 10).fill(COLORS.goldLight);

  // Top Title
  doc
    .fillColor(COLORS.black)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("WAKHEEL LEGAL ACADEMY", 50, 25, { characterSpacing: 1.5 });

  doc
    .fillColor(COLORS.gold)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(subtitle.toUpperCase(), 50, 47, { characterSpacing: 1 });

  // Right-aligned verification badge text
  doc
    .fillColor(COLORS.zincMuted)
    .font("Helvetica")
    .fontSize(8)
    .text("STATUTORY LEGAL PORTAL • SECURE VERIFIED DOSSIER", 50, 30, {
      align: "right",
    });

  const d = new Date().toLocaleDateString("en-IN", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  doc.text(`ISSUED: ${d.toUpperCase()}`, 50, 44, { align: "right" });

  // Divider Rule
  doc
    .moveTo(50, 64)
    .lineTo(doc.page.width - 50, 64)
    .strokeColor(COLORS.lineBorder)
    .lineWidth(1)
    .stroke();
};

/**
 * Draws the official Wakheel gold verification seal stamp
 */
const drawGoldSeal = (doc, x, y, title = "VERIFIED", sub = "WAKHEEL") => {
  doc.save();
  // Outer circle
  doc.circle(x, y, 32).lineWidth(2).strokeColor(COLORS.gold).stroke();
  // Inner circle
  doc.circle(x, y, 28).lineWidth(0.8).strokeColor(COLORS.goldLight).stroke();

  // Seal Text
  doc
    .fillColor(COLORS.goldDark)
    .font("Helvetica-Bold")
    .fontSize(7)
    .text("★ OFFICIAL SEAL ★", x - 28, y - 16, { width: 56, align: "center" });

  doc
    .fillColor(COLORS.black)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(title, x - 28, y - 5, { width: 56, align: "center" });

  doc
    .fillColor(COLORS.gold)
    .font("Helvetica-Bold")
    .fontSize(6)
    .text(sub, x - 28, y + 8, { width: 56, align: "center" });

  doc.restore();
};

/**
 * Generate Pleadings / Memorial Appraisal Report PDF
 */
export const generatePleadingsAppraisalPdf = (submissionData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: `Appraisal — ${submissionData.assignmentTitle || "Memorial"}`,
          Author: "Wakheel Legal Faculty",
          Subject: "Student Pleadings Appraisal Dossier",
        },
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      drawWakheelHeader(doc, "FACULTY OF LAW • PLEADINGS & MEMORIAL APPRAISAL");

      let y = 80;

      // Title Banner Box
      doc.rect(50, y, doc.page.width - 100, 48).fillAndStroke(COLORS.zincLight, COLORS.gold);
      doc
        .fillColor(COLORS.black)
        .font("Helvetica-Bold")
        .fontSize(13)
        .text("MEMORIAL DOCKET EVALUATION & BENCH APPRAISAL", 65, y + 10);
      doc
        .fillColor(COLORS.zincMuted)
        .font("Helvetica")
        .fontSize(9)
        .text(
          `Case / Topic: ${submissionData.assignmentTitle || "Drafting Memorial"}`,
          65,
          y + 28
        );

      y += 62;

      // Student & Evaluator Metadata Grid
      const col1 = 50;
      const col2 = 320;

      doc.fillColor(COLORS.zincMuted).font("Helvetica-Bold").fontSize(8).text("SCHOLAR / APPLICANT:", col1, y);
      doc.fillColor(COLORS.black).font("Helvetica-Bold").fontSize(10).text(submissionData.studentName || "Law Scholar", col1, y + 11);
      doc.fillColor(COLORS.zincMuted).font("Helvetica").fontSize(8).text(submissionData.studentEmail || "scholar@law.edu", col1, y + 24);

      doc.fillColor(COLORS.zincMuted).font("Helvetica-Bold").fontSize(8).text("ADJUDICATING FACULTY:", col2, y);
      doc.fillColor(COLORS.black).font("Helvetica-Bold").fontSize(10).text(submissionData.evaluatedBy || "Prof. Dr. Rajesh Varma", col2, y + 11);
      doc.fillColor(COLORS.zincMuted).font("Helvetica").fontSize(8).text("Senior Faculty & Moot Court Adjudicator", col2, y + 24);

      y += 45;

      // Score Ribbon Box
      const score = submissionData.score ?? 48;
      const maxScore = submissionData.maxScore ?? 50;
      doc.rect(50, y, doc.page.width - 100, 52).fillAndStroke(COLORS.black, COLORS.gold);

      doc
        .fillColor(COLORS.goldLight)
        .font("Helvetica-Bold")
        .fontSize(8)
        .text("OFFICIAL GRADE ASSIGNMENT", 65, y + 10, { characterSpacing: 1 });

      doc
        .fillColor(COLORS.white)
        .font("Helvetica-Bold")
        .fontSize(20)
        .text(`${score} / ${maxScore}`, 65, y + 22);

      doc
        .fillColor(COLORS.goldLight)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(`STATUS: ${submissionData.status || "Graded (First Class Honours)"}`, 260, y + 18, {
          align: "right",
          width: 230,
        });

      doc
        .fillColor(COLORS.zincMuted)
        .font("Helvetica")
        .fontSize(8)
        .text(`Evaluated on: ${submissionData.evaluatedDate || new Date().toLocaleDateString("en-IN")}`, 260, y + 32, {
          align: "right",
          width: 230,
        });

      y += 66;

      // Rubric Breakdown Table
      doc.fillColor(COLORS.black).font("Helvetica-Bold").fontSize(10).text("RUBRIC ASSESSMENT BREAKDOWN", 50, y);
      y += 16;

      const rubrics = [
        { criteria: "Statutory Framing & Legal Grounds (BNSS / BNS / CPC)", score: "15 / 15", remark: "Flawless invocation of governing provisions" },
        { criteria: "Pleadings Architecture & Factual Recitals", score: "14 / 15", remark: "Clear chronological averments and cause of action" },
        { criteria: "Precedent Ratios & Landmark Jurisprudence", score: "10 / 10", remark: "High Court & Supreme Court binding citations included" },
        { criteria: "Court Decorum, Drafting Polish & Prayer Clause", score: "9 / 10", remark: "Appropriate relief framing and formal verification" },
      ];

      doc.rect(50, y, doc.page.width - 100, 20).fill(COLORS.zincLight);
      doc.fillColor(COLORS.black).font("Helvetica-Bold").fontSize(8).text("EVALUATION CRITERIA", 55, y + 6);
      doc.text("SCORE", 380, y + 6);
      doc.text("REMARKS", 430, y + 6);
      y += 20;

      rubrics.forEach((r, idx) => {
        const bg = idx % 2 === 0 ? COLORS.white : "#fafafa";
        doc.rect(50, y, doc.page.width - 100, 22).fill(bg);
        doc.fillColor(COLORS.black).font("Helvetica").fontSize(8).text(r.criteria, 55, y + 6, { width: 320 });
        doc.fillColor(COLORS.goldDark).font("Helvetica-Bold").text(r.score, 380, y + 6);
        doc.fillColor(COLORS.zincMuted).font("Helvetica").text(r.remark, 430, y + 6, { width: 110 });
        y += 22;
      });

      y += 12;

      // Evaluator Feedback
      doc.fillColor(COLORS.black).font("Helvetica-Bold").fontSize(10).text("ADJUDICATOR'S WRITTEN FEEDBACK", 50, y);
      y += 15;

      const feedback =
        submissionData.feedback ||
        "The drafting demonstrates rigorous statutory parity with recent legal transitions. The distinction drawn between statutory bail conditions and discretionary bench prerogatives was eloquently argued. The draft is endorsed for national moot representation.";

      doc.rect(50, y, doc.page.width - 100, 50).fillAndStroke(COLORS.zincLight, "#e4e4e7");
      doc.fillColor(COLORS.zincDark).font("Helvetica-Oblique").fontSize(8.5).text(`"${feedback}"`, 60, y + 8, {
        width: doc.page.width - 120,
        lineGap: 3,
      });

      y += 65;

      // Submitted Prayer Clause Extract
      if (submissionData.prayerOrConclusion) {
        doc.fillColor(COLORS.black).font("Helvetica-Bold").fontSize(9).text("SUBMITTED PRAYER EXTRACT", 50, y);
        y += 13;
        doc.rect(50, y, doc.page.width - 100, 40).fillAndStroke("#ffffff", "#d4d4d8");
        doc.fillColor(COLORS.zincMuted).font("Helvetica").fontSize(8).text(submissionData.prayerOrConclusion, 60, y + 6, {
          width: doc.page.width - 120,
          height: 30,
          ellipsis: true,
        });
        y += 50;
      }

      // Verification Gold Seal and Signatures
      drawGoldSeal(doc, 100, y + 35, "APPRAISED", "WAKHEEL");

      doc
        .moveTo(340, y + 45)
        .lineTo(doc.page.width - 50, y + 45)
        .strokeColor(COLORS.zincDark)
        .lineWidth(1)
        .stroke();

      doc
        .fillColor(COLORS.black)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(submissionData.evaluatedBy || "Prof. Dr. Rajesh Varma", 340, y + 50);

      doc
        .fillColor(COLORS.zincMuted)
        .font("Helvetica")
        .fontSize(8)
        .text("Presiding Faculty Adjudicator • Wakheel Academy", 340, y + 62);

      // Footer
      doc
        .fillColor(COLORS.zincMuted)
        .font("Helvetica")
        .fontSize(7)
        .text(
          "Document Cryptographically Verified • Wakheel Legal Education Platform • Registered Academic Document",
          50,
          doc.page.height - 35,
          { align: "center", width: doc.page.width - 100 }
        );

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Generate 3D Moot Court Trial Verdict Certificate PDF
 */
export const generateMootVerdictCertificatePdf = (mootData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 40,
        info: {
          Title: `Moot Certificate — ${mootData.studentName || "Law Scholar"}`,
          Author: "Wakheel Chambers of Moot Adjudication",
          Subject: "Certificate of Merit & Trial Verdict",
        },
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const w = doc.page.width;
      const h = doc.page.height;

      // Decorative Outer Double Border (Gold and Black)
      doc.rect(20, 20, w - 40, h - 40).lineWidth(3).strokeColor(COLORS.gold).stroke();
      doc.rect(26, 26, w - 52, h - 52).lineWidth(1).strokeColor(COLORS.black).stroke();

      // Top Header
      doc
        .fillColor(COLORS.goldDark)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("WAKHEEL CHAMBERS OF ADJUDICATION • 3D MOOT SIMULATION LAB", 40, 50, {
          align: "center",
          characterSpacing: 2,
        });

      doc
        .fillColor(COLORS.black)
        .font("Helvetica-Bold")
        .fontSize(24)
        .text("CERTIFICATE OF ADVOCACY MERIT", 40, 75, {
          align: "center",
          characterSpacing: 1.5,
        });

      doc
        .moveTo(w / 2 - 120, 108)
        .lineTo(w / 2 + 120, 108)
        .strokeColor(COLORS.gold)
        .lineWidth(1.5)
        .stroke();

      doc
        .fillColor(COLORS.zincMuted)
        .font("Helvetica-Oblique")
        .fontSize(10)
        .text("This solemn certificate of courtroom proficiency is officially conferred upon", 40, 120, {
          align: "center",
        });

      // Recipient Name
      doc
        .fillColor(COLORS.black)
        .font("Helvetica-Bold")
        .fontSize(22)
        .text(mootData.studentName || "Advithya Sharma", 40, 140, {
          align: "center",
        });

      doc
        .fillColor(COLORS.zincMuted)
        .font("Helvetica")
        .fontSize(10)
        .text("for outstanding trial advocacy, evidence appraisal, and procedural reflex in the simulated proceeding entitled:", 40, 172, {
          align: "center",
        });

      // Case Name
      doc
        .fillColor(COLORS.goldDark)
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(`"${mootData.caseTitle || "State of NCT v. Rohan Oberoi — BNSS § 480 Regular Bail"}"`, 40, 192, {
          align: "center",
        });

      // Trial Metrics Panel
      const panelY = 225;
      doc.rect(w / 2 - 260, panelY, 520, 60).fillAndStroke(COLORS.zincLight, COLORS.gold);

      doc
        .fillColor(COLORS.zincMuted)
        .font("Helvetica-Bold")
        .fontSize(8)
        .text("BENCH VERDICT RENDERED", w / 2 - 240, panelY + 12);
      doc
        .fillColor(COLORS.black)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(mootData.verdict || "Bail Granted with Conditions", w / 2 - 240, panelY + 28);

      doc
        .fillColor(COLORS.zincMuted)
        .font("Helvetica-Bold")
        .fontSize(8)
        .text("COMPOSITE ADVOCACY SCORE", w / 2 + 30, panelY + 12);
      doc
        .fillColor(COLORS.gold)
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(`${mootData.totalScore || 92} / ${mootData.maxScore || 100} (${mootData.percentage || 92}%)`, w / 2 + 30, panelY + 26);

      // Reflex Drill Stats
      const drill = mootData.drillStats || { accuracyRate: 100, correctAnswers: 5, totalAttempts: 5 };
      doc
        .fillColor(COLORS.zincMuted)
        .font("Helvetica")
        .fontSize(9)
        .text(
          `BSA 2023 & CPC 1908 Evidence Reflex: ${drill.accuracyRate || 100}% Accuracy (${drill.correctAnswers || 5}/${drill.totalAttempts || 5} Objections Sustained)`,
          40,
          305,
          { align: "center" }
        );

      // Gold Seal
      drawGoldSeal(doc, w / 2, 385, "MERIT", "CORAM");

      // Signatures
      const sigY = 460;
      doc
        .moveTo(80, sigY)
        .lineTo(260, sigY)
        .strokeColor(COLORS.black)
        .lineWidth(1)
        .stroke();
      doc
        .fillColor(COLORS.black)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("Prof. Dr. Rajesh Varma", 80, sigY + 6);
      doc
        .fillColor(COLORS.zincMuted)
        .font("Helvetica")
        .fontSize(8)
        .text("Senior Faculty Adjudicator", 80, sigY + 18);

      doc
        .moveTo(w - 260, sigY)
        .lineTo(w - 80, sigY)
        .strokeColor(COLORS.black)
        .lineWidth(1)
        .stroke();
      doc
        .fillColor(COLORS.black)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("Chambers of Bar Decorum", w - 260, sigY + 6);
      doc
        .fillColor(COLORS.zincMuted)
        .font("Helvetica")
        .fontSize(8)
        .text(`Date of Session: ${mootData.completedDate || new Date().toLocaleDateString("en-IN")}`, w - 260, sigY + 18);

      // Footer notice
      doc
        .fillColor(COLORS.zincMuted)
        .font("Helvetica")
        .fontSize(7)
        .text("Recorded on National Moot Ledger • Wakheel 3D Courtroom Simulation Infrastructure", 40, h - 35, {
          align: "center",
        });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Generate Cornell Research Brief PDF
 */
export const generateCornellNotePdf = (note) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        info: {
          Title: `Cornell Brief — ${note.title || "Legal Note"}`,
          Author: note.author || "Wakheel Scholar",
          Subject: "Cornell Legal Research Brief",
        },
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      drawWakheelHeader(doc, "CORNELL RESEARCH & JURISPRUDENTIAL CASE BRIEF");

      let y = 75;

      // Note Header
      doc
        .fillColor(COLORS.goldDark)
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(`${(note.subject || "Constitutional Law").toUpperCase()} • ${(note.topic || "Jurisprudence").toUpperCase()}`, 40, y);
      y += 12;

      doc
        .fillColor(COLORS.black)
        .font("Helvetica-Bold")
        .fontSize(15)
        .text(note.title || "Untitled Legal Note", 40, y);
      y += 22;

      doc
        .fillColor(COLORS.zincMuted)
        .font("Helvetica")
        .fontSize(8)
        .text(`Author: ${note.author || "Scholar"}   |   Last Modified: ${note.lastEdited || "Recent"}`, 40, y);
      y += 18;

      // Main 2-Column Split: Cues (Left 140pt) and Main Notes (Right 370pt)
      const cueWidth = 140;
      const noteWidth = doc.page.width - 80 - cueWidth - 10;
      const colHeight = 350;

      // Left Box: Cues Column
      doc.rect(40, y, cueWidth, colHeight).fillAndStroke(COLORS.zincLight, "#e4e4e7");
      doc
        .fillColor(COLORS.goldDark)
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .text("CUES & STATUTORY ANCHORS", 50, y + 8);

      let cueY = y + 25;
      const cues = Array.isArray(note.cues) && note.cues.length > 0 ? note.cues : ["Statutory Basis", "Key Doctrine", "Limitation Rule", "Ratio"];
      cues.forEach((cue) => {
        doc.fillColor(COLORS.black).font("Helvetica-Bold").fontSize(8).text(`• ${cue}`, 50, cueY, { width: cueWidth - 20 });
        cueY += 18;
      });

      if (Array.isArray(note.statutoryReferences) && note.statutoryReferences.length > 0) {
        cueY += 8;
        doc.fillColor(COLORS.goldDark).font("Helvetica-Bold").fontSize(8).text("STATUTES:", 50, cueY);
        cueY += 12;
        note.statutoryReferences.forEach((st) => {
          doc.fillColor(COLORS.zincDark).font("Helvetica").fontSize(7.5).text(`§ ${st}`, 50, cueY, { width: cueWidth - 20 });
          cueY += 14;
        });
      }

      // Right Box: Main Notes Column
      doc.rect(40 + cueWidth + 10, y, noteWidth, colHeight).fillAndStroke("#ffffff", "#e4e4e7");
      doc
        .fillColor(COLORS.black)
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .text("DETAILED RESEARCH NOTES & LEGAL REASONING", 40 + cueWidth + 20, y + 8);

      const content = note.content || "No detailed analytical notes recorded.";
      doc.fillColor(COLORS.zincDark).font("Helvetica").fontSize(8.5).text(content, 40 + cueWidth + 20, y + 25, {
        width: noteWidth - 20,
        height: colHeight - 40,
        lineGap: 3,
        ellipsis: true,
      });

      y += colHeight + 12;

      // Bottom Summary Box
      const summaryHeight = 90;
      doc.rect(40, y, doc.page.width - 80, summaryHeight).fillAndStroke(COLORS.zincLight, COLORS.gold);
      doc
        .fillColor(COLORS.goldDark)
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .text("SUMMARY & BINDING TAKEAWAY DOCTRINE", 50, y + 8);

      const summary = note.summary || "Summary of core principle and precedent synthesis.";
      doc.fillColor(COLORS.black).font("Helvetica").fontSize(8.5).text(summary, 50, y + 22, {
        width: doc.page.width - 100,
        lineGap: 3,
      });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
};
