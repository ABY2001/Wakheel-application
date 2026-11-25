import express from "express";
import { protect, requireAdmin } from "../middleware/auth.js";
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
  getCourses,
  getCourseById,
  createCourse,
  deleteCourse,
  requestTuitionAccess,
  getTuitionRequests,
  getTuitionStatus,
  reviewTuitionRequest,
  getMockTestPacks,
  createMockTestPack,
  submitMockExamResult,
  getMockExamResults,
  getMockLeaderboard,
  getAdminOverview,
  getAdminUsers,
  createAdminUser,
  updateAdminUserStatus,
  deleteAdminUser,
  deleteMockTestPack,
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

// 8. Masterclass Law Courses & Curricula (/api/academy/courses)
router.route("/courses").get(protect, getCourses).post(protect, createCourse);
router.route("/courses/:id").get(protect, getCourseById).delete(protect, deleteCourse);

// 9. Centralized Tuition Access & Chamber Requests (/api/academy/tuition)
router.route("/tuition/request").post(protect, requestTuitionAccess);
router.route("/tuition/requests").get(protect, getTuitionRequests);
router.route("/tuition/status/:email").get(protect, getTuitionStatus);
router.route("/tuition/requests/:id/review").put(protect, reviewTuitionRequest);

// 10. CBT Mock Test Packs, Scorecards & Leaderboard (/api/academy/mock-exams)
router.route("/mock-exams").get(protect, getMockTestPacks).post(protect, createMockTestPack);
router.route("/mock-exams/:id").delete(protect, requireAdmin, deleteMockTestPack);
router.route("/mock-exams/results").get(protect, getMockExamResults).post(protect, submitMockExamResult);
router.route("/mock-exams/leaderboard").get(protect, getMockLeaderboard);

// 11. Academy Admin Control Module (/api/academy/admin)
router.route("/admin/overview").get(protect, requireAdmin, getAdminOverview);
router.route("/admin/users").get(protect, requireAdmin, getAdminUsers).post(protect, requireAdmin, createAdminUser);
router.route("/admin/users/:id/status").put(protect, requireAdmin, updateAdminUserStatus);
router.route("/admin/users/:id").delete(protect, requireAdmin, deleteAdminUser);

export default router;
