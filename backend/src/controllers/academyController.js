import {
  AcademyBook,
  AcademyAssignment,
  AcademySubmission,
  AcademyLectureAudio,
  AcademyCornellNote,
  AcademyMootRecord,
  AcademyMockExamResult,
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
let inMemoryBooks = readDiskJson("dev_academy_books.json", [...INITIAL_ACADEMY_BOOKS]);
let inMemoryAssignments = readDiskJson("dev_academy_assignments.json", [...INITIAL_ACADEMY_ASSIGNMENTS]);
let inMemorySubmissions = readDiskJson("dev_academy_submissions.json", []);
let inMemoryLectures = readDiskJson("dev_academy_lectures.json", [...INITIAL_ACADEMY_LECTURES]);
let inMemoryNotes = readDiskJson("dev_academy_notes.json", []);
let inMemoryMootRecords = readDiskJson("dev_academy_moot_records.json", []);
let inMemoryCourses = readDiskJson("dev_academy_courses.json", []);

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
