import {
  AcademyBook,
  AcademyAssignment,
  AcademySubmission,
  AcademyLectureAudio,
  AcademyCornellNote,
  AcademyMootRecord,
  AcademyMockExamResult,
  AcademyTuitionRequest,
} from "../models/academyModels.js";
import { getIsMongoConnected } from "../config/db.js";
import {
  INITIAL_ACADEMY_BOOKS,
  INITIAL_ACADEMY_ASSIGNMENTS,
  INITIAL_ACADEMY_LECTURES,
} from "../utils/seedAcademyData.js";
import { broadcastAcademyEvent } from "../socket.js";

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
      const data = fs.readFileSync(fullPath, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn(`[Academy] Failed to read ${filename}:`, e.message);
  }
  return defaultVal;
};

const writeDiskJson = (filename, data) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const fullPath = path.join(DATA_DIR, filename);
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.warn(`[Academy] Failed to write ${filename}:`, e.message);
  }
};

// Persistent fallback caches for development resilience
let inMemoryBooks = readDiskJson("dev_academy_books.json", []);
let inMemoryAssignments = readDiskJson("dev_academy_assignments.json", []);
let inMemorySubmissions = readDiskJson("dev_academy_submissions.json", []);
let inMemoryLectures = readDiskJson("dev_academy_lectures.json", [...INITIAL_ACADEMY_LECTURES]);
let inMemoryNotes = readDiskJson("dev_academy_notes.json", []);
let inMemoryMootRecords = readDiskJson("dev_academy_moot_records.json", []);
let inMemoryCourses = readDiskJson("dev_academy_courses.json", []);
let inMemoryTuitionRequests = readDiskJson("dev_academy_tuition_requests.json", []);
let inMemoryMockTests = readDiskJson("dev_academy_mock_tests.json", [
  {
    id: "clat_pro_pass",
    title: "CLAT 2027 All-India Pass Pro Test Series",
    conductingBody: "Consortium of 24 National Law Universities Pattern",
    exam: "CLAT 2027 (NLUs)",
    badge: "MOST POPULAR",
    badgeColor: "amber",
    testsCount: "35 Full Mocks + 120 Chapter Tests + 10 PYQs",
    enrolledCount: "18.4k Students Enrolled",
    rating: "4.9",
    reviewsCount: "1,840",
    price: 999,
    originalPrice: 2999,
    discount: "66% OFF",
    features: [
      "120-Question Full Length Timed CBT Mocks with Negative Marking (-0.25)",
      "All-India Rank & Percentile Predictor based on 18,000+ candidates",
      "Section-by-section judicial ratio & legal reasoning video solutions",
      "Includes 10 Previous Years Solved Papers (2015-2026)",
    ],
    hasFreeTest: true,
    freeTestName: "Free Diagnostic Full Mock 01",
  },
  {
    id: "klee_toppers_pack",
    title: "KLEE 2027 3-Yr & 5-Yr Comprehensive Test Pack",
    conductingBody: "Commissioner for Entrance Examinations (CEE), Kerala",
    exam: "KLEE 2027 (Kerala)",
    badge: "STATE TOPPER'S CHOICE",
    badgeColor: "black",
    testsCount: "25 Full Length Mocks + 80 Sectional Tests",
    enrolledCount: "9.2k Students Enrolled",
    rating: "4.8",
    reviewsCount: "920",
    price: 699,
    originalPrice: 1999,
    discount: "65% OFF",
    features: [
      "CEE Kerala pattern (+3 for correct, -1 for negative marking)",
      "Legal Aptitude, General English, GK, and Mental Ability test banks",
      "Full syllabus coverage for Govt & Private Law Colleges in Kerala",
      "Instant scorecards & performance analysis",
    ],
    hasFreeTest: true,
    freeTestName: "Free KLEE State Mock 01",
  },
  {
    id: "ailet_master_series",
    title: "AILET 2027 Dedicated BA LL.B Mock Series",
    conductingBody: "National Law University, Delhi Dedicated Pattern",
    exam: "AILET (NLU Delhi)",
    badge: "HIGH DIFFICULTY",
    badgeColor: "amber",
    testsCount: "15 High-Difficulty Mocks + Critical Reasoning Packs",
    enrolledCount: "6.5k Students Enrolled",
    rating: "4.9",
    reviewsCount: "610",
    price: 799,
    originalPrice: 2200,
    discount: "63% OFF",
    features: [
      "High-density analytical reading passages & legal reasoning",
      "Advanced logical puzzles & syllogisms for NLU Delhi",
      "Sectional speed booster tests with detailed analytics",
    ],
    hasFreeTest: false,
  },
  {
    id: "distance_llb_pack",
    title: "Distance LL.B & Open University Semester Test Bank",
    conductingBody: "IGNOU & State Open Universities Curricula",
    exam: "Distance LL.B (IGNOU)",
    badge: "DISTANCE SCHOLARS",
    badgeColor: "black",
    testsCount: "40 Subject Question Banks + Model Answer Guides",
    enrolledCount: "7.8k Students Enrolled",
    rating: "4.8",
    reviewsCount: "740",
    price: 499,
    originalPrice: 1499,
    discount: "66% OFF",
    features: [
      "Bharatiya Nyaya Sanhita (BNS 2023) & IPC transition question banks",
      "Constitution of India (Writs, Fundamental Rights, Golden Triangle)",
      "Model 20-mark answer writing templates for term-end examinations",
    ],
    hasFreeTest: true,
    freeTestName: "Free Constitutional Law Test",
  },
]);
let inMemoryMockResults = readDiskJson("dev_academy_mock_results.json", []);
let inMemoryAcademyUsers = readDiskJson("dev_academy_users.json", []);
let inMemoryBatches = readDiskJson("dev_academy_batches.json", []);

const getUserId = (req) => {
  return String(req.user?._id || req.user?.id || "");
};

const getUserEmail = (req) => {
  return String(req.user?.email || "").toLowerCase();
};

const getUserRole = (req) => {
  return String(req.user?.role || "student");
};

// ============================================================================
// 1. DIGITAL LAW BOOKS & REPOSITORY (/api/academy/books)
// ============================================================================

export const getBooks = async (req, res) => {
  try {
    const { department, search, format } = req.query;

    if (!getIsMongoConnected()) {
      let filtered = [...inMemoryBooks];
      if (department && department !== "All") {
        filtered = filtered.filter((b) => b.department === department);
      }
      if (format && format !== "All") {
        filtered = filtered.filter((b) => b.format === format);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            b.description.toLowerCase().includes(q)
        );
      }
      return res.json({
        success: true,
        books: filtered.map((b) => ({ ...b, id: b.customId || b.id })),
        mode: "in_memory_fallback",
      });
    }

    const query = { isPublished: true };
    if (department && department !== "All") {
      query.department = department;
    }
    if (format && format !== "All") {
      query.format = format;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const books = await AcademyBook.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      books: books.map((b) => {
        const obj = b.toObject();
        return { ...obj, id: obj.customId || obj._id.toString() };
      }),
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getBooks error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!getIsMongoConnected()) {
      const book = inMemoryBooks.find((b) => b.customId === id || b.id === id);
      if (!book) return res.status(404).json({ success: false, message: "Book not found" });
      return res.json({ success: true, book: { ...book, id: book.customId || book.id } });
    }

    const book = await AcademyBook.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    const obj = book.toObject();
    res.json({
      success: true,
      book: { ...obj, id: obj.customId || obj._id.toString() },
    });
  } catch (error) {
    console.error("getBookById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      department,
      edition,
      fileSize,
      totalPages,
      format,
      coverGradient,
      description,
      uploadedBy,
      chapters,
      fileUrl,
    } = req.body;

    const customId = "book_" + Date.now();
    const newBookData = {
      customId,
      title,
      author: author || req.user?.fullName || "Wakheel Faculty",
      department: department || "General Jurisprudence",
      edition: edition || "2026 Academic Edition",
      fileSize: fileSize || "12.0 MB",
      totalPages: Number(totalPages) || (chapters?.length ? chapters.length * 20 : 100),
      format: format || "PDF",
      coverGradient: coverGradient || "from-amber-600 via-amber-700 to-zinc-950",
      description: description || "",
      uploadedBy: uploadedBy || req.user?.fullName || "Prof. Dr. Rajesh Varma",
      uploadedById: req.user?._id || null,
      uploadedDate: new Date().toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      downloadCount: 0,
      chapters: chapters || [],
      fileUrl: fileUrl || "",
    };

    broadcastAcademyEvent("ACADEMY_NEW_BOOK", newBookData, {
      title: newBookData.title,
      author: newBookData.author,
    });

    if (!getIsMongoConnected()) {
      inMemoryBooks.unshift(newBookData);
      writeDiskJson("dev_academy_books.json", inMemoryBooks);
      return res.status(201).json({
        success: true,
        book: { ...newBookData, id: customId },
        mode: "in_memory_fallback",
      });
    }

    const book = await AcademyBook.create(newBookData);
    const obj = book.toObject();
    res.status(201).json({
      success: true,
      book: { ...obj, id: obj.customId || obj._id.toString() },
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("createBook error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const incrementBookDownload = async (req, res) => {
  try {
    const { id } = req.params;

    if (!getIsMongoConnected()) {
      const idx = inMemoryBooks.findIndex((b) => b.customId === id || b.id === id);
      if (idx >= 0) inMemoryBooks[idx].downloadCount = (inMemoryBooks[idx].downloadCount || 0) + 1;
      writeDiskJson("dev_academy_books.json", inMemoryBooks);
      return res.json({ success: true, count: idx >= 0 ? inMemoryBooks[idx].downloadCount : 1 });
    }

    const book = await AcademyBook.findOneAndUpdate(
      { $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    res.json({ success: true, count: book ? book.downloadCount : 0 });
  } catch (error) {
    console.error("incrementBookDownload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!getIsMongoConnected()) {
      inMemoryBooks = inMemoryBooks.filter((b) => b.customId !== id && b.id !== id);
      writeDiskJson("dev_academy_books.json", inMemoryBooks);
      return res.json({ success: true, message: "Book deleted" });
    }

    await AcademyBook.findOneAndDelete({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    res.json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    console.error("deleteBook error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 2. HOMEWORK ASSIGNMENTS (/api/academy/assignments)
// ============================================================================

export const getAssignments = async (req, res) => {
  try {
    const { targetBatch, subject, search } = req.query;

    if (!getIsMongoConnected()) {
      let filtered = [...inMemoryAssignments];
      if (targetBatch && targetBatch !== "All") {
        filtered = filtered.filter((a) => a.targetBatch === targetBatch);
      }
      if (subject && subject !== "All") {
        filtered = filtered.filter((a) => a.subject === subject);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (a) => a.title.toLowerCase().includes(q) || a.instructions.toLowerCase().includes(q)
        );
      }
      return res.json({
        success: true,
        assignments: filtered.map((a) => ({ ...a, id: a.customId || a.id })),
        mode: "in_memory_fallback",
      });
    }

    const query = { isPublished: true };
    if (targetBatch && targetBatch !== "All") query.targetBatch = targetBatch;
    if (subject && subject !== "All") query.subject = subject;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { instructions: { $regex: search, $options: "i" } },
      ];
    }

    const assignments = await AcademyAssignment.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      assignments: assignments.map((a) => {
        const obj = a.toObject();
        return { ...obj, id: obj.customId || obj._id.toString() };
      }),
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getAssignments error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAssignment = async (req, res) => {
  try {
    const {
      title,
      subject,
      targetBatch,
      badge,
      instructions,
      faculty,
      dueDate,
      maxScore,
      referenceRatio,
    } = req.body;

    const customId = "hw_" + Date.now();
    const newAssignmentData = {
      customId,
      title,
      subject,
      targetBatch,
      badge: badge || "DRAFTING MEMORIAL",
      instructions,
      faculty: faculty || req.user?.fullName || "Prof. Dr. Rajesh Varma",
      facultyId: req.user?._id || null,
      dueDate,
      maxScore: Number(maxScore) || 50,
      referenceRatio: referenceRatio || "",
    };

    broadcastAcademyEvent("ACADEMY_NEW_ASSIGNMENT", newAssignmentData, {
      title: newAssignmentData.title,
      faculty: newAssignmentData.faculty,
      targetBatch: newAssignmentData.targetBatch,
    });

    if (!getIsMongoConnected()) {
      inMemoryAssignments.unshift(newAssignmentData);
      writeDiskJson("dev_academy_assignments.json", inMemoryAssignments);
      return res.status(201).json({
        success: true,
        assignment: { ...newAssignmentData, id: customId },
        mode: "in_memory_fallback",
      });
    }

    const assignment = await AcademyAssignment.create(newAssignmentData);
    const obj = assignment.toObject();
    res.status(201).json({
      success: true,
      assignment: { ...obj, id: obj.customId || obj._id.toString() },
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("createAssignment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!getIsMongoConnected()) {
      inMemoryAssignments = inMemoryAssignments.filter((a) => a.customId !== id && a.id !== id);
      writeDiskJson("dev_academy_assignments.json", inMemoryAssignments);
      return res.json({ success: true, message: "Assignment deleted" });
    }

    await AcademyAssignment.findOneAndDelete({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    res.json({ success: true, message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("deleteAssignment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 3. HOMEWORK SUBMISSIONS & RUBRIC GRADING STUDIO (/api/academy/submissions)
// ============================================================================

export const getSubmissions = async (req, res) => {
  try {
    const { assignmentId, studentEmail, status } = req.query;

    if (!getIsMongoConnected()) {
      let filtered = [...inMemorySubmissions];
      if (assignmentId) filtered = filtered.filter((s) => s.assignmentId === assignmentId);
      if (studentEmail) filtered = filtered.filter((s) => s.studentEmail.toLowerCase() === studentEmail.toLowerCase());
      if (status && status !== "All") filtered = filtered.filter((s) => s.status === status);
      return res.json({
        success: true,
        submissions: filtered.map((s) => ({ ...s, id: s.customId || s.id })),
        mode: "in_memory_fallback",
      });
    }

    const query = {};
    if (assignmentId) query.assignmentId = assignmentId;
    if (studentEmail) query.studentEmail = studentEmail.toLowerCase();
    if (status && status !== "All") query.status = status;

    const submissions = await AcademySubmission.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      submissions: submissions.map((s) => {
        const obj = s.toObject();
        return { ...obj, id: obj.customId || obj._id.toString() };
      }),
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getSubmissions error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitHomework = async (req, res) => {
  try {
    const {
      assignmentId,
      assignmentTitle,
      studentName,
      studentEmail,
      issuesRaised,
      submissionText,
      prayerOrConclusion,
      attachmentName,
      attachmentUrl,
    } = req.body;

    const email = (studentEmail || getUserEmail(req) || "scholar@law.edu").toLowerCase();
    const name = studentName || req.user?.fullName || "Law Scholar";
    const customId = "sub_" + Date.now();

    const submissionPayload = {
      assignmentId,
      assignmentTitle,
      studentId: req.user?._id || null,
      studentName: name,
      studentEmail: email,
      submittedDate: new Date().toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      issuesRaised: issuesRaised || "",
      submissionText,
      prayerOrConclusion: prayerOrConclusion || "",
      attachmentName: attachmentName || "",
      attachmentUrl: attachmentUrl || "",
      status: "Pending Evaluation",
      score: null,
      grade: "",
      feedback: "",
    };

    broadcastAcademyEvent("ACADEMY_HOMEWORK_SUBMITTED", submissionPayload, {
      studentName: submissionPayload.studentName,
      assignmentTitle: submissionPayload.assignmentTitle,
    });

    if (!getIsMongoConnected()) {
      const existingIdx = inMemorySubmissions.findIndex(
        (s) => s.assignmentId === assignmentId && s.studentEmail.toLowerCase() === email
      );
      if (existingIdx >= 0) {
        inMemorySubmissions[existingIdx] = { ...inMemorySubmissions[existingIdx], ...submissionPayload };
      } else {
        inMemorySubmissions.unshift({ ...submissionPayload, customId, id: customId });
      }
      writeDiskJson("dev_academy_submissions.json", inMemorySubmissions);
      return res.status(201).json({
        success: true,
        submission: { ...submissionPayload, id: customId },
        mode: "in_memory_fallback",
      });
    }

    const updated = await AcademySubmission.findOneAndUpdate(
      { assignmentId, studentEmail: email },
      { $set: submissionPayload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const obj = updated.toObject();
    res.status(201).json({
      success: true,
      submission: { ...obj, id: obj.customId || obj._id.toString() },
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("submitHomework error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      score,
      maxScore = 50,
      feedback,
      rubricBreakdown,
      evaluator,
      status = "Graded",
    } = req.body;

    const evaluatedBy = evaluator || req.user?.fullName || "Prof. Dr. Rajesh Varma";
    const evaluatedDate = new Date().toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const grade = `${score} / ${maxScore}`;

    if (!getIsMongoConnected()) {
      const idx = inMemorySubmissions.findIndex((s) => s.customId === id || s.id === id);
      if (idx >= 0) {
        inMemorySubmissions[idx] = {
          ...inMemorySubmissions[idx],
          score,
          grade,
          feedback,
          status,
          rubricBreakdown,
          evaluatedBy,
          evaluatedDate,
        };
        broadcastAcademyEvent("ACADEMY_SUBMISSION_GRADED", inMemorySubmissions[idx], {
          score,
          grade,
          feedback,
          evaluatedBy,
          studentEmail: inMemorySubmissions[idx]?.studentEmail,
        });
        writeDiskJson("dev_academy_submissions.json", inMemorySubmissions);
      }
      return res.json({
        success: true,
        submission: idx >= 0 ? inMemorySubmissions[idx] : null,
        mode: "in_memory_fallback",
      });
    }

    const updated = await AcademySubmission.findOneAndUpdate(
      { $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      {
        $set: {
          score,
          grade,
          feedback,
          status,
          rubricBreakdown: rubricBreakdown || {},
          evaluatedBy,
          evaluatedById: req.user?._id || null,
          evaluatedDate,
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    const obj = updated.toObject();
    broadcastAcademyEvent("ACADEMY_SUBMISSION_GRADED", obj, {
      score,
      grade,
      feedback,
      evaluatedBy,
      studentEmail: obj?.studentEmail,
    });
    res.json({
      success: true,
      submission: { ...obj, id: obj.customId || obj._id.toString() },
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("gradeSubmission error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 4. FACULTY LECTURE AUDIO STUDIO (/api/academy/lectures)
// ============================================================================

export const getLectures = async (req, res) => {
  try {
    const { category, subject, search } = req.query;

    if (!getIsMongoConnected()) {
      let filtered = [...inMemoryLectures];
      if (category && category !== "All") filtered = filtered.filter((l) => l.category === category);
      if (subject && subject !== "All") filtered = filtered.filter((l) => l.subject === subject);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (l) => l.title.toLowerCase().includes(q) || l.statutoryNotes.toLowerCase().includes(q)
        );
      }
      return res.json({
        success: true,
        lectures: filtered.map((l) => ({ ...l, id: l.customId || l.id })),
        mode: "in_memory_fallback",
      });
    }

    const query = { isPublished: true };
    if (category && category !== "All") query.category = category;
    if (subject && subject !== "All") query.subject = subject;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { statutoryNotes: { $regex: search, $options: "i" } },
      ];
    }

    const lectures = await AcademyLectureAudio.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      lectures: lectures.map((l) => {
        const obj = l.toObject();
        return { ...obj, id: obj.customId || obj._id.toString() };
      }),
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getLectures error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLecture = async (req, res) => {
  try {
    const {
      title,
      subject,
      targetBatch,
      facultyName,
      duration,
      durationSeconds,
      audioUrl,
      statutoryNotes,
      keyCitations,
      category,
    } = req.body;

    const customId = "lec_" + Date.now();
    const newLectureData = {
      customId,
      title,
      subject,
      targetBatch: targetBatch || "All Batches",
      facultyName: facultyName || req.user?.fullName || "Prof. Dr. Rajesh Varma",
      facultyId: req.user?._id || null,
      duration: duration || "15:00",
      durationSeconds: Number(durationSeconds) || 900,
      date: new Date().toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      audioUrl: audioUrl || "",
      statutoryNotes: statutoryNotes || "",
      keyCitations: Array.isArray(keyCitations) ? keyCitations : [],
      category: category || "Faculty Masterclass",
      listensCount: 0,
      isFeatured: false,
    };

    broadcastAcademyEvent("ACADEMY_NEW_LECTURE", newLectureData, {
      title: newLectureData.title,
      facultyName: newLectureData.facultyName,
      subject: newLectureData.subject,
    });

    if (!getIsMongoConnected()) {
      inMemoryLectures.unshift(newLectureData);
      writeDiskJson("dev_academy_lectures.json", inMemoryLectures);
      return res.status(201).json({
        success: true,
        lecture: { ...newLectureData, id: customId },
        mode: "in_memory_fallback",
      });
    }

    const lecture = await AcademyLectureAudio.create(newLectureData);
    const obj = lecture.toObject();
    res.status(201).json({
      success: true,
      lecture: { ...obj, id: obj.customId || obj._id.toString() },
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("createLecture error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const incrementLectureListens = async (req, res) => {
  try {
    const { id } = req.params;

    if (!getIsMongoConnected()) {
      const idx = inMemoryLectures.findIndex((l) => l.customId === id || l.id === id);
      if (idx >= 0) inMemoryLectures[idx].listensCount = (inMemoryLectures[idx].listensCount || 0) + 1;
      writeDiskJson("dev_academy_lectures.json", inMemoryLectures);
      return res.json({ success: true, count: idx >= 0 ? inMemoryLectures[idx].listensCount : 1 });
    }

    const lecture = await AcademyLectureAudio.findOneAndUpdate(
      { $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $inc: { listensCount: 1 } },
      { new: true }
    );

    res.json({ success: true, count: lecture ? lecture.listensCount : 0 });
  } catch (error) {
    console.error("incrementLectureListens error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLecture = async (req, res) => {
  try {
    const { id } = req.params;

    if (!getIsMongoConnected()) {
      inMemoryLectures = inMemoryLectures.filter((l) => l.customId !== id && l.id !== id);
      writeDiskJson("dev_academy_lectures.json", inMemoryLectures);
      return res.json({ success: true, message: "Lecture deleted" });
    }

    await AcademyLectureAudio.findOneAndDelete({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    res.json({ success: true, message: "Lecture deleted successfully" });
  } catch (error) {
    console.error("deleteLecture error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 5. CORNELL LEGAL NOTEBOOKS (/api/academy/notes)
// ============================================================================

export const getNotes = async (req, res) => {
  try {
    const { subject, isBookmarked, search } = req.query;
    const userId = getUserId(req);

    if (!getIsMongoConnected()) {
      let filtered = [...inMemoryNotes];
      if (subject && subject !== "All") filtered = filtered.filter((n) => n.subject === subject);
      if (isBookmarked === "true") filtered = filtered.filter((n) => n.isBookmarked);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
        );
      }
      return res.json({
        success: true,
        notes: filtered.map((n) => ({ ...n, id: n.customId || n.id })),
        mode: "in_memory_fallback",
      });
    }

    const query = {};
    if (userId) query.$or = [{ userId }, { isFacultyShared: true }];
    if (subject && subject !== "All") query.subject = subject;
    if (isBookmarked === "true") query.isBookmarked = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
      ];
    }

    const notes = await AcademyCornellNote.find(query).sort({ updatedAt: -1 });
    res.json({
      success: true,
      notes: notes.map((n) => {
        const obj = n.toObject();
        return { ...obj, id: obj.customId || obj._id.toString() };
      }),
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getNotes error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveNote = async (req, res) => {
  try {
    const {
      id,
      title,
      subject,
      topic,
      cues,
      content,
      summary,
      statutoryReferences,
      landmarkCases,
      tags,
      isBookmarked,
    } = req.body;

    const customId = id || "note_" + Date.now();
    const noteData = {
      customId,
      userId: req.user?._id || null,
      author: req.user?.fullName || "Law Scholar",
      title: title || "Untitled Legal Note",
      subject: subject || "Constitutional Law",
      topic: topic || "",
      cues: Array.isArray(cues) ? cues : [],
      content: content || "",
      summary: summary || "",
      statutoryReferences: Array.isArray(statutoryReferences) ? statutoryReferences : [],
      landmarkCases: Array.isArray(landmarkCases) ? landmarkCases : [],
      tags: Array.isArray(tags) ? tags : [],
      isBookmarked: Boolean(isBookmarked),
      lastEdited: new Date().toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    if (!getIsMongoConnected()) {
      const idx = inMemoryNotes.findIndex((n) => n.customId === customId || n.id === customId);
      if (idx >= 0) {
        inMemoryNotes[idx] = { ...inMemoryNotes[idx], ...noteData };
      } else {
        inMemoryNotes.unshift({ ...noteData, id: customId });
      }
      writeDiskJson("dev_academy_notes.json", inMemoryNotes);
      return res.status(201).json({
        success: true,
        note: { ...noteData, id: customId },
        mode: "in_memory_fallback",
      });
    }

    const note = await AcademyCornellNote.findOneAndUpdate(
      { customId },
      { $set: noteData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const obj = note.toObject();
    res.status(201).json({
      success: true,
      note: { ...obj, id: obj.customId || obj._id.toString() },
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("saveNote error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!getIsMongoConnected()) {
      inMemoryNotes = inMemoryNotes.filter((n) => n.customId !== id && n.id !== id);
      writeDiskJson("dev_academy_notes.json", inMemoryNotes);
      return res.json({ success: true, message: "Note deleted" });
    }

    await AcademyCornellNote.findOneAndDelete({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    res.json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    console.error("deleteNote error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleBookmarkNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!getIsMongoConnected()) {
      const idx = inMemoryNotes.findIndex((n) => n.customId === id || n.id === id);
      if (idx >= 0) inMemoryNotes[idx].isBookmarked = !inMemoryNotes[idx].isBookmarked;
      writeDiskJson("dev_academy_notes.json", inMemoryNotes);
      return res.json({ success: true, isBookmarked: idx >= 0 ? inMemoryNotes[idx].isBookmarked : false });
    }

    const note = await AcademyCornellNote.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    note.isBookmarked = !note.isBookmarked;
    await note.save();

    res.json({ success: true, isBookmarked: note.isBookmarked });
  } catch (error) {
    console.error("toggleBookmarkNote error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 6. 3D COURTROOM LAB & MOOT SIMULATION (/api/academy/courtroom)
// ============================================================================

export const getMootRecords = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!getIsMongoConnected()) {
      return res.json({
        success: true,
        records: inMemoryMootRecords,
        mode: "in_memory_fallback",
      });
    }

    const query = userId ? { userId } : {};
    const records = await AcademyMootRecord.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      records: records.map((r) => {
        const obj = r.toObject();
        return { ...obj, id: obj.customId || obj._id.toString() };
      }),
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getMootRecords error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveMootRecord = async (req, res) => {
  try {
    const { caseId, caseTitle, totalScore, maxScore, percentage, verdict, drillStats } = req.body;
    const customId = "moot_rec_" + Date.now();

    const recordData = {
      customId,
      userId: req.user?._id || null,
      studentName: req.user?.fullName || "Law Scholar",
      studentEmail: getUserEmail(req) || "scholar@law.edu",
      caseId,
      caseTitle,
      totalScore: Number(totalScore),
      maxScore: Number(maxScore),
      percentage: Number(percentage),
      verdict,
      drillStats: drillStats || { totalAttempts: 0, correctAnswers: 0, accuracyRate: 0 },
      completedDate: new Date().toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    broadcastAcademyEvent("ACADEMY_MOOT_TRIAL_COMPLETED", recordData, {
      studentName: recordData.studentName,
      caseTitle: recordData.caseTitle,
      verdict: recordData.verdict,
      score: `${recordData.totalScore}/${recordData.maxScore}`,
    });

    if (!getIsMongoConnected()) {
      inMemoryMootRecords.unshift(recordData);
      writeDiskJson("dev_academy_moot_records.json", inMemoryMootRecords);
      return res.status(201).json({
        success: true,
        record: { ...recordData, id: customId },
        mode: "in_memory_fallback",
      });
    }

    const record = await AcademyMootRecord.create(recordData);
    const obj = record.toObject();
    res.status(201).json({
      success: true,
      record: { ...obj, id: obj.customId || obj._id.toString() },
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("saveMootRecord error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 7. ACADEMY STATS & DASHBOARD METRICS (/api/academy/stats)
// ============================================================================

export const getAcademyStats = async (req, res) => {
  try {
    if (!getIsMongoConnected()) {
      return res.json({
        success: true,
        stats: {
          totalBooks: inMemoryBooks.length,
          totalAssignments: inMemoryAssignments.length,
          totalSubmissions: inMemorySubmissions.length,
          pendingSubmissions: inMemorySubmissions.filter((s) => s.status === "Pending Evaluation").length,
          gradedSubmissions: inMemorySubmissions.filter((s) => s.status === "Graded").length,
          totalLectures: inMemoryLectures.length,
        },
        mode: "in_memory_fallback",
      });
    }

    const [
      totalBooks,
      totalAssignments,
      totalSubmissions,
      pendingSubmissions,
      gradedSubmissions,
      totalLectures,
    ] = await Promise.all([
      AcademyBook.countDocuments(),
      AcademyAssignment.countDocuments(),
      AcademySubmission.countDocuments(),
      AcademySubmission.countDocuments({ status: "Pending Evaluation" }),
      AcademySubmission.countDocuments({ status: "Graded" }),
      AcademyLectureAudio.countDocuments(),
    ]);

    res.json({
      success: true,
      stats: {
        totalBooks,
        totalAssignments,
        totalSubmissions,
        pendingSubmissions,
        gradedSubmissions,
        totalLectures,
      },
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getAcademyStats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 8. MASTERCLASS LAW COURSES & CURRICULA (/api/academy/courses)
// ============================================================================

export const getCourses = async (req, res) => {
  try {
    const { exam, search } = req.query;
    let filtered = [...inMemoryCourses];
    if (exam && exam !== "For You" && exam !== "All") {
      filtered = filtered.filter((c) => c.exam === exam);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.instructor?.toLowerCase().includes(q)
      );
    }
    return res.json({
      success: true,
      courses: filtered,
      count: filtered.length,
    });
  } catch (error) {
    console.error("getCourses error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = inMemoryCourses.find((c) => c.id === id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, course });
  } catch (error) {
    console.error("getCourseById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const courseData = req.body;
    const id = courseData.id || `course_${Date.now()}`;
    const newCourse = {
      ...courseData,
      id,
      unitsCount: courseData.unitsCount || `${(courseData.syllabus || []).length || 1} Sections`,
      completedUnits: courseData.completedUnits || 0,
      totalUnits: courseData.totalUnits || (courseData.syllabus || []).length || 1,
      dateAdded: courseData.dateAdded || "Just now",
      image: courseData.image || "/academy/explore-paper.png",
      syllabus: courseData.syllabus || [],
      quiz: courseData.quiz || [],
    };
    inMemoryCourses.unshift(newCourse);
    writeDiskJson("dev_academy_courses.json", inMemoryCourses);
    broadcastAcademyEvent("ACADEMY_COURSE_CREATED", newCourse);
    res.status(201).json({ success: true, course: newCourse });
  } catch (error) {
    console.error("createCourse error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    inMemoryCourses = inMemoryCourses.filter((c) => c.id !== id);
    writeDiskJson("dev_academy_courses.json", inMemoryCourses);
    broadcastAcademyEvent("ACADEMY_COURSE_DELETED", { id });
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("deleteCourse error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 9. CENTRALIZED TUITION ACCESS & CHAMBER REQUESTS (/api/academy/tuition)
// ============================================================================

export const requestTuitionAccess = async (req, res) => {
  try {
    const { studentName, studentEmail, studentCode, targetExam, reason } = req.body;
    const email = (studentEmail || getUserEmail(req) || "scholar@wakheel.law").toLowerCase();
    const name = studentName || req.user?.name || "Wakheel Law Scholar";
    const code = studentCode || "STU-4KMAC5";
    const exam = targetExam || "CLAT 2027 (NLUs)";
    const reqReason = reason || "Intensive Bar and Judicial Services chamber coaching";
    const customId = `tuition_req_${Date.now()}`;

    const requestData = {
      customId,
      studentName: name,
      studentEmail: email,
      studentCode: code,
      targetExam: exam,
      reason: reqReason,
      status: "pending",
      requestedAt: new Date().toISOString(),
      reviewedBy: "Prof. Dr. Rajesh Varma",
      facultyNotes: "",
    };

    broadcastAcademyEvent("ACADEMY_TUITION_REQUESTED", requestData, {
      studentName: name,
      studentCode: code,
      targetExam: exam,
    });

    if (!getIsMongoConnected()) {
      // Remove any existing pending request for same student to avoid duplicates
      inMemoryTuitionRequests = inMemoryTuitionRequests.filter(
        (r) => !(r.studentEmail === email && r.status === "pending")
      );
      inMemoryTuitionRequests.unshift(requestData);
      writeDiskJson("dev_academy_tuition_requests.json", inMemoryTuitionRequests);
      return res.status(201).json({
        success: true,
        request: { ...requestData, id: customId },
        mode: "in_memory_fallback",
      });
    }

    // In Mongo mode
    await AcademyTuitionRequest.deleteMany({ studentEmail: email, status: "pending" });
    const record = await AcademyTuitionRequest.create({
      ...requestData,
      userId: req.user?._id || undefined,
    });
    const obj = record.toObject();
    res.status(201).json({
      success: true,
      request: { ...obj, id: obj.customId || obj._id.toString() },
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("requestTuitionAccess error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTuitionRequests = async (req, res) => {
  try {
    const { status, search } = req.query;

    if (!getIsMongoConnected()) {
      let filtered = [...inMemoryTuitionRequests];
      if (status && status !== "all") {
        filtered = filtered.filter((r) => r.status === status);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.studentName?.toLowerCase().includes(q) ||
            r.studentEmail?.toLowerCase().includes(q) ||
            r.studentCode?.toLowerCase().includes(q) ||
            r.targetExam?.toLowerCase().includes(q)
        );
      }
      return res.json({
        success: true,
        requests: filtered.map((r) => ({ ...r, id: r.customId || r.id })),
        count: filtered.length,
        mode: "in_memory_fallback",
      });
    }

    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { studentName: regex },
        { studentEmail: regex },
        { studentCode: regex },
        { targetExam: regex },
      ];
    }

    const records = await AcademyTuitionRequest.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      requests: records.map((r) => {
        const obj = r.toObject();
        return { ...obj, id: obj.customId || obj._id.toString() };
      }),
      count: records.length,
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getTuitionRequests error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTuitionStatus = async (req, res) => {
  try {
    const email = (req.params.email || getUserEmail(req) || "").toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    if (!getIsMongoConnected()) {
      const match = inMemoryTuitionRequests.find((r) => r.studentEmail === email);
      return res.json({
        success: true,
        isApproved: match?.status === "approved",
        status: match?.status || "none",
        request: match ? { ...match, id: match.customId || match.id } : null,
        mode: "in_memory_fallback",
      });
    }

    const record = await AcademyTuitionRequest.findOne({ studentEmail: email }).sort({ createdAt: -1 });
    if (!record) {
      return res.json({
        success: true,
        isApproved: false,
        status: "none",
        request: null,
        mode: "mongo_db",
      });
    }

    const obj = record.toObject();
    res.json({
      success: true,
      isApproved: obj.status === "approved",
      status: obj.status,
      request: { ...obj, id: obj.customId || obj._id.toString() },
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getTuitionStatus error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewTuitionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewedBy, facultyNotes } = req.body; // status: "approved" | "rejected"
    const reviewer = reviewedBy || req.user?.name || "Prof. Dr. Rajesh Varma";
    const reviewedAt = new Date().toISOString();

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    if (!getIsMongoConnected()) {
      const idx = inMemoryTuitionRequests.findIndex((r) => r.customId === id || r.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: "Tuition request not found" });
      }

      inMemoryTuitionRequests[idx].status = status;
      inMemoryTuitionRequests[idx].reviewedAt = reviewedAt;
      inMemoryTuitionRequests[idx].reviewedBy = reviewer;
      if (facultyNotes !== undefined) inMemoryTuitionRequests[idx].facultyNotes = facultyNotes;

      const updated = inMemoryTuitionRequests[idx];
      writeDiskJson("dev_academy_tuition_requests.json", inMemoryTuitionRequests);

      broadcastAcademyEvent(
        status === "approved" ? "ACADEMY_TUITION_APPROVED" : "ACADEMY_TUITION_REJECTED",
        updated,
        {
          studentName: updated.studentName,
          studentEmail: updated.studentEmail,
          status,
        }
      );

      return res.json({
        success: true,
        request: { ...updated, id: updated.customId || updated.id },
        mode: "in_memory_fallback",
      });
    }

    const record = await AcademyTuitionRequest.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!record) {
      return res.status(404).json({ success: false, message: "Tuition request not found" });
    }

    record.status = status;
    record.reviewedAt = reviewedAt;
    record.reviewedBy = reviewer;
    if (facultyNotes !== undefined) record.facultyNotes = facultyNotes;
    await record.save();

    const obj = record.toObject();
    const updated = { ...obj, id: obj.customId || obj._id.toString() };

    broadcastAcademyEvent(
      status === "approved" ? "ACADEMY_TUITION_APPROVED" : "ACADEMY_TUITION_REJECTED",
      updated,
      {
        studentName: updated.studentName,
        studentEmail: updated.studentEmail,
        status,
      }
    );

    res.json({
      success: true,
      request: updated,
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("reviewTuitionRequest error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 10. CBT MOCK TEST PACKS, DIAGNOSTIC SCORECARDS & LEADERBOARD (/api/academy/mock-exams)
// ============================================================================

export const getMockTestPacks = async (req, res) => {
  try {
    const { exam, search } = req.query;
    let filtered = [...inMemoryMockTests];
    if (exam && exam !== "For You" && exam !== "All") {
      filtered = filtered.filter((p) => p.exam === exam);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.conductingBody?.toLowerCase().includes(q) ||
          p.exam?.toLowerCase().includes(q)
      );
    }
    res.json({
      success: true,
      packs: filtered,
      count: filtered.length,
    });
  } catch (error) {
    console.error("getMockTestPacks error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMockTestPack = async (req, res) => {
  try {
    const data = req.body;
    const id = data.id || `mock_pack_${Date.now()}`;
    const newPack = {
      id,
      title: data.title || "Custom Law Entrance Mock Series",
      conductingBody: data.conductingBody || "Wakheel Consortium Standard",
      exam: data.exam || "CLAT 2027 (NLUs)",
      badge: data.badge || "NEW SERIES",
      badgeColor: data.badgeColor || "amber",
      testsCount: data.testsCount || "10 Full Mocks",
      enrolledCount: data.enrolledCount || "New Cohort",
      rating: data.rating || "5.0",
      reviewsCount: data.reviewsCount || "0",
      price: Number(data.price) || 499,
      originalPrice: Number(data.originalPrice) || 1499,
      discount: data.discount || "66% OFF",
      features: Array.isArray(data.features) ? data.features : ["Full Length Timed CBT Mock"],
      hasFreeTest: data.hasFreeTest ?? true,
      freeTestName: data.freeTestName || "Free Diagnostic Mock",
    };
    inMemoryMockTests.unshift(newPack);
    writeDiskJson("dev_academy_mock_tests.json", inMemoryMockTests);
    broadcastAcademyEvent("ACADEMY_MOCK_PACK_CREATED", newPack);
    res.status(201).json({ success: true, pack: newPack });
  } catch (error) {
    console.error("createMockTestPack error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitMockExamResult = async (req, res) => {
  try {
    const {
      studentName,
      studentEmail,
      examId,
      examTitle,
      totalScore,
      maxScore,
      percentage,
      accuracy,
      timeSpentSeconds,
      allIndiaRank,
      percentile,
      subjectBreakdown,
    } = req.body;

    const email = (studentEmail || getUserEmail(req) || "scholar@wakheel.law").toLowerCase();
    const name = studentName || req.user?.name || "Candidate";
    const customId = `mock_res_${Date.now()}`;
    const completedDate = new Date().toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const resultData = {
      customId,
      studentName: name,
      studentEmail: email,
      examId: examId || "mock_clat_01",
      examTitle: examTitle || "CLAT 2027 Full Length All-India Diagnostic Mock",
      totalScore: Number(totalScore ?? 0),
      maxScore: Number(maxScore ?? 14),
      percentage: Number(percentage ?? 0),
      accuracy: Number(accuracy ?? 0),
      timeSpentSeconds: Number(timeSpentSeconds ?? 0),
      allIndiaRank: allIndiaRank ?? null,
      percentile: percentile !== undefined && percentile !== null ? Number(percentile) : null,
      subjectBreakdown: subjectBreakdown || {},
      completedDate,
      submittedAt: new Date().toISOString(),
    };

    broadcastAcademyEvent("ACADEMY_MOCK_RESULT_SUBMITTED", resultData, {
      studentName: name,
      examTitle: resultData.examTitle,
      score: `${resultData.totalScore}/${resultData.maxScore}`,
      percentile: resultData.percentile,
    });

    if (!getIsMongoConnected()) {
      inMemoryMockResults.unshift(resultData);
      writeDiskJson("dev_academy_mock_results.json", inMemoryMockResults);
      return res.status(201).json({
        success: true,
        result: { ...resultData, id: customId },
        mode: "in_memory_fallback",
      });
    }

    const record = await AcademyMockExamResult.create({
      ...resultData,
      userId: req.user?._id || undefined,
    });
    const obj = record.toObject();
    res.status(201).json({
      success: true,
      result: { ...obj, id: customId || obj._id.toString() },
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("submitMockExamResult error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMockExamResults = async (req, res) => {
  try {
    const { studentEmail, examId } = req.query;
    const email = studentEmail ? String(studentEmail).toLowerCase() : null;

    if (!getIsMongoConnected()) {
      let filtered = [...inMemoryMockResults];
      if (email) filtered = filtered.filter((r) => r.studentEmail === email);
      if (examId) filtered = filtered.filter((r) => r.examId === examId);
      return res.json({
        success: true,
        results: filtered.map((r) => ({ ...r, id: r.customId || r.id })),
        count: filtered.length,
        mode: "in_memory_fallback",
      });
    }

    const query = {};
    if (email) query.studentEmail = email;
    if (examId) query.examId = examId;
    const records = await AcademyMockExamResult.find(query).sort({ createdAt: -1 }).limit(50);
    res.json({
      success: true,
      results: records.map((r) => {
        const obj = r.toObject();
        return { ...obj, id: obj._id.toString() };
      }),
      count: records.length,
      mode: "mongo_db",
    });
  } catch (error) {
    console.error("getMockExamResults error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMockLeaderboard = async (req, res) => {
  try {
    let source = [];
    if (!getIsMongoConnected()) {
      source = [...inMemoryMockResults];
    } else {
      const records = await AcademyMockExamResult.find().sort({ totalScore: -1 }).limit(100);
      source = records.map((r) => r.toObject());
    }

    const byEmail = new Map();
    source.forEach((r) => {
      const key = (r.studentEmail || r.studentName || "candidate").toLowerCase();
      const existing = byEmail.get(key);
      if (!existing) {
        byEmail.set(key, {
          name: r.studentName || "Candidate",
          email: r.studentEmail || "",
          target: "NLU Aspirant",
          bestScore: Number(r.totalScore || 0),
          percentile: r.percentile ? `${Number(r.percentile).toFixed(1)}%` : "95.0%",
          tests: 1,
          avatar: (r.studentName || "C").charAt(0).toUpperCase(),
        });
      } else {
        existing.tests += 1;
        if (Number(r.totalScore || 0) > existing.bestScore) {
          existing.bestScore = Number(r.totalScore || 0);
          if (r.percentile) existing.percentile = `${Number(r.percentile).toFixed(1)}%`;
        }
      }
    });

    const leaderboard = Array.from(byEmail.values())
      .sort((a, b) => b.bestScore - a.bestScore)
      .map((entry, idx) => ({
        rank: idx + 1,
        ...entry,
        score: entry.bestScore,
      }));

    res.json({
      success: true,
      leaderboard,
      count: leaderboard.length,
    });
  } catch (error) {
    console.error("getMockLeaderboard error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 11. ACADEMY ADMIN CONTROL MODULE (/api/academy/admin)
// ============================================================================

export const getAdminOverview = async (req, res) => {
  try {
    const teachersCount = inMemoryAcademyUsers.filter(
      (u) => u.role === "teacher" || u.role === "faculty"
    ).length;
    const studentsCount = inMemoryAcademyUsers.filter((u) => u.role === "student").length;

    res.json({
      success: true,
      overview: {
        totalCourses: inMemoryCourses.length,
        totalBooks: inMemoryBooks.length,
        totalAssignments: inMemoryAssignments.length,
        totalSubmissions: inMemorySubmissions.length,
        totalLectures: inMemoryLectures.length,
        totalNotes: inMemoryNotes.length,
        totalMockPacks: inMemoryMockTests.length,
        totalMockResults: inMemoryMockResults.length,
        pendingTuition: inMemoryTuitionRequests.filter((r) => r.status === "pending").length,
        approvedTuition: inMemoryTuitionRequests.filter((r) => r.status === "approved").length,
        totalTeachers: teachersCount,
        totalStudents: studentsCount,
      },
    });
  } catch (error) {
    console.error("getAdminOverview error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let list = [...inMemoryAcademyUsers];
    if (role && role !== "all") {
      list = list.filter((u) =>
        role === "teacher" ? u.role === "teacher" || u.role === "faculty" : u.role === role
      );
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.department?.toLowerCase().includes(q) ||
          u.targetProgram?.toLowerCase().includes(q)
      );
    }
    res.json({
      success: true,
      users: list,
      count: list.length,
    });
  } catch (error) {
    console.error("getAdminUsers error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminUser = async (req, res) => {
  try {
    const { fullName, email, role, department, targetProgram, institutionName } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ success: false, message: "Full name and email are required." });
    }
    const cleanRole = role === "teacher" || role === "faculty" ? "teacher" : "student";
    const normalizedEmail = email.toLowerCase().trim();
    const exists = inMemoryAcademyUsers.find((u) => u.email === normalizedEmail);
    if (exists) {
      return res.status(400).json({ success: false, message: "A user with this email already exists." });
    }

    const newUser = {
      id: `acad_usr_${Date.now()}`,
      fullName: fullName.trim(),
      email: normalizedEmail,
      role: cleanRole,
      department: cleanRole === "teacher" ? department || "Constitutional Law" : undefined,
      targetProgram: cleanRole === "student" ? targetProgram || "CLAT 2027 (NLUs)" : undefined,
      institutionName: institutionName || "Wakheel Law Academy",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    inMemoryAcademyUsers.unshift(newUser);
    writeDiskJson("dev_academy_users.json", inMemoryAcademyUsers);
    broadcastAcademyEvent("ACADEMY_USER_CREATED", newUser);

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error("createAdminUser error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;
    const idx = inMemoryAcademyUsers.findIndex((u) => u.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (status && ["active", "suspended"].includes(status)) {
      inMemoryAcademyUsers[idx].status = status;
    }
    if (role && ["student", "teacher"].includes(role)) {
      inMemoryAcademyUsers[idx].role = role;
    }

    writeDiskJson("dev_academy_users.json", inMemoryAcademyUsers);
    res.json({ success: true, user: inMemoryAcademyUsers[idx] });
  } catch (error) {
    console.error("updateAdminUserStatus error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    inMemoryAcademyUsers = inMemoryAcademyUsers.filter((u) => u.id !== id);
    writeDiskJson("dev_academy_users.json", inMemoryAcademyUsers);
    res.json({ success: true, message: "User removed successfully" });
  } catch (error) {
    console.error("deleteAdminUser error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMockTestPack = async (req, res) => {
  try {
    const { id } = req.params;
    inMemoryMockTests = inMemoryMockTests.filter((p) => p.id !== id);
    writeDiskJson("dev_academy_mock_tests.json", inMemoryMockTests);
    res.json({ success: true, message: "Mock test pack deleted" });
  } catch (error) {
    console.error("deleteMockTestPack error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncAcademyDirectoryUser = ({
  id,
  fullName,
  email,
  role,
  department,
  targetProgram,
  institutionName,
}) => {
  if (!email || !["student", "teacher", "faculty"].includes(role)) return null;
  const cleanRole = role === "faculty" ? "teacher" : role;
  const normalizedEmail = email.toLowerCase().trim();
  const idx = inMemoryAcademyUsers.findIndex((u) => u.email === normalizedEmail);
  if (idx >= 0) {
    inMemoryAcademyUsers[idx] = {
      ...inMemoryAcademyUsers[idx],
      fullName: fullName || inMemoryAcademyUsers[idx].fullName,
      role: cleanRole,
      department: cleanRole === "teacher" ? department || inMemoryAcademyUsers[idx].department : undefined,
      targetProgram: cleanRole === "student" ? targetProgram || inMemoryAcademyUsers[idx].targetProgram : undefined,
      institutionName: institutionName || inMemoryAcademyUsers[idx].institutionName,
    };
    writeDiskJson("dev_academy_users.json", inMemoryAcademyUsers);
    return inMemoryAcademyUsers[idx];
  }

  const created = {
    id: id ? String(id) : `acad_usr_${Date.now()}`,
    fullName: fullName || normalizedEmail.split("@")[0],
    email: normalizedEmail,
    role: cleanRole,
    department: cleanRole === "teacher" ? department || "Constitutional Law" : undefined,
    targetProgram: cleanRole === "student" ? targetProgram || "CLAT 2027 (NLUs)" : undefined,
    institutionName: institutionName || "Wakheel Law Academy",
    status: "active",
    createdAt: new Date().toISOString(),
  };
  inMemoryAcademyUsers.unshift(created);
  writeDiskJson("dev_academy_users.json", inMemoryAcademyUsers);
  return created;
};

export const isAcademyUserSuspended = (email) => {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  const found = inMemoryAcademyUsers.find((u) => u.email === normalizedEmail);
  return found?.status === "suspended";
};

// ============================================================================
// 12. LIVE COHORT BATCHES (/api/academy/batches)
// ============================================================================

export const getLiveBatches = async (req, res) => {
  try {
    const { exam, search } = req.query;
    let filtered = [...inMemoryBatches];
    if (exam && exam !== "For You" && exam !== "All") {
      filtered = filtered.filter((b) => b.exam === exam);
    }
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.faculty?.toLowerCase().includes(q) ||
          b.exam?.toLowerCase().includes(q)
      );
    }
    res.json({ success: true, batches: filtered, count: filtered.length });
  } catch (error) {
    console.error("getLiveBatches error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLiveBatch = async (req, res) => {
  try {
    const data = req.body;
    const newBatch = {
      id: data.id || `batch_${Date.now()}`,
      title: data.title || "Law Entrance Live Cohort",
      faculty: data.faculty || req.user?.name || "Faculty Mentor",
      exam: data.exam || "CLAT 2027 (NLUs)",
      badge: data.badge || "OPEN ENROLLMENT",
      startDate: data.startDate || "Starts Soon",
      schedule: data.schedule || "Mon - Fri • 6:30 PM - 8:30 PM",
      seatsLeft: data.seatsLeft || "Limited Seats",
      price: Number(data.price) || 2999,
      originalPrice: Number(data.originalPrice) || 5999,
      discount: data.discount || "50% OFF",
      features: Array.isArray(data.features) ? data.features : ["Live Interactive Chamber Classes"],
    };
    inMemoryBatches.unshift(newBatch);
    writeDiskJson("dev_academy_batches.json", inMemoryBatches);
    broadcastAcademyEvent("ACADEMY_BATCH_CREATED", newBatch);
    res.status(201).json({ success: true, batch: newBatch });
  } catch (error) {
    console.error("createLiveBatch error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLiveBatch = async (req, res) => {
  try {
    const { id } = req.params;
    inMemoryBatches = inMemoryBatches.filter((b) => b.id !== id);
    writeDiskJson("dev_academy_batches.json", inMemoryBatches);
    res.json({ success: true, message: "Batch deleted" });
  } catch (error) {
    console.error("deleteLiveBatch error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
