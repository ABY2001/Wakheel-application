import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getBooks,
  getBookById,
  createBook,
  incrementBookDownload,
  deleteBook,
  getAssignments,
  createAssignment,
  deleteAssignment,
  getSubmissions,
  submitHomework,
  gradeSubmission,
  getLectures,
  createLecture,
  incrementLectureListens,
  deleteLecture,
  getNotes,
  saveNote,
  deleteNote,
  toggleBookmarkNote,
  getMootRecords,
  saveMootRecord,
  getAcademyStats,
} from "../controllers/academyController.js";

const router = express.Router();

// 1. Digital Law Books & Reader Hub (/api/academy/books)
router.route("/books").get(protect, getBooks).post(protect, createBook);
router.route("/books/:id").get(protect, getBookById).delete(protect, deleteBook);
router.route("/books/:id/download").post(protect, incrementBookDownload);

// 2. Homework Assignments (/api/academy/assignments)
router.route("/assignments").get(protect, getAssignments).post(protect, createAssignment);
router.route("/assignments/:id").delete(protect, deleteAssignment);

// 3. Homework Submissions & Rubric Grading (/api/academy/submissions)
router.route("/submissions").get(protect, getSubmissions).post(protect, submitHomework);
router.route("/submissions/:id/grade").put(protect, gradeSubmission);

// 4. Faculty Lecture Audio Studio (/api/academy/lectures)
router.route("/lectures").get(protect, getLectures).post(protect, createLecture);
router.route("/lectures/:id").delete(protect, deleteLecture);
router.route("/lectures/:id/listen").post(protect, incrementLectureListens);

// 5. Cornell Legal Notebooks (/api/academy/notes)
router.route("/notes").get(protect, getNotes).post(protect, saveNote);
router.route("/notes/:id").delete(protect, deleteNote);
router.route("/notes/:id/bookmark").post(protect, toggleBookmarkNote);

// 6. 3D Courtroom Lab & Moot Simulation (/api/academy/courtroom)
router.route("/courtroom/moot").get(protect, getMootRecords).post(protect, saveMootRecord);

// 7. Academy Top-Level Stats (/api/academy/stats)
router.route("/stats").get(protect, getAcademyStats);

export default router;
