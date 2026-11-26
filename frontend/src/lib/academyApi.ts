import { LawBook } from "../components/academy/booksData";
import { HomeworkAssignment, HomeworkSubmission } from "../components/academy/homeworkData";
import { LectureAudio } from "../components/academy/lectureAudioData";
import { CornellNote } from "../components/academy/cornellNotesData";
import { MootHistoryRecord } from "../components/academy/courtroomLabData";

export interface CourseSyllabusUnit {
  unit: string;
  duration: string;
  completed?: boolean;
}

export interface CourseQuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface LawCourse {
  id: string;
  title: string;
  exam: string;
  badge?: string;
  badgeColor?: string;
  unitsCount?: string;
  dateAdded?: string;
  image?: string;
  description: string;
  instructor?: string;
  completedUnits?: number;
  totalUnits?: number;
  videoDuration?: string;
  currentLesson?: string;
  syllabus?: CourseSyllabusUnit[];
  quiz?: CourseQuizQuestion[];
  isEnrolled?: boolean;
}

export interface TuitionAccessRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  studentCode: string;
  targetExam: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  facultyNotes?: string;
}

export interface MockTestPack {
  id: string;
  title: string;
  conductingBody: string;
  exam: string;
  badge: string;
  badgeColor?: string;
  testsCount: string;
  enrolledCount?: string;
  rating?: string;
  reviewsCount?: string;
  price: number;
  originalPrice: number;
  discount?: string;
  features: string[];
  hasFreeTest?: boolean;
  freeTestName?: string;
}

export interface MockExamResult {
  id?: string;
  studentName: string;
  studentEmail?: string;
  examId: string;
  examTitle: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  accuracy: number;
  timeSpentSeconds: number;
  allIndiaRank?: string | number | null;
  percentile?: number | null;
  subjectBreakdown?: Record<string, { score: number; attempted: number; correct: number }>;
  completedDate?: string;
}

export interface MockLeaderboardEntry {
  rank: number;
  name: string;
  email?: string;
  target: string;
  percentile: string;
  score: number;
  tests: number;
  avatar: string;
}

export interface AcademyAdminUser {
  id: string;
  fullName: string;
  email: string;
  role: "student" | "teacher" | "faculty";
  department?: string;
  targetProgram?: string;
  institutionName?: string;
  status: "active" | "suspended";
  createdAt?: string;
}

export interface AcademyAdminOverview {
  totalCourses: number;
  totalBooks: number;
  totalAssignments: number;
  totalSubmissions: number;
  totalLectures: number;
  totalNotes: number;
  totalMockPacks: number;
  totalMockResults: number;
  pendingTuition: number;
  approvedTuition: number;
  totalTeachers: number;
  totalStudents: number;
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const getAuthToken = (): string => {
  if (typeof window === "undefined") return "dev_student";
  const storedToken =
    localStorage.getItem("wakheel_academy_token") ||
    localStorage.getItem("wakheel_token") ||
    localStorage.getItem("token");
  if (storedToken && storedToken.startsWith("eyJ")) {
    return storedToken;
  }
  const academyRole = localStorage.getItem("wakheel_academy_role") || localStorage.getItem("wakheel_role");
  if (academyRole === "admin") return "dev_admin";
  if (academyRole === "teacher" || academyRole === "faculty") return "dev_teacher";
  return "dev_student";
};

export const academyApi = {
  // ==========================================================================
  // 1. DIGITAL LAW BOOKS
  // ==========================================================================
  async getBooks(params?: { department?: string; format?: string; search?: string }): Promise<{
    success: boolean;
    books: LawBook[];
    mode?: string;
  }> {
    try {
      const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
      const res = await fetch(`${API_BASE_URL}/academy/books${query}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.getBooks offline/fallback:", e);
      return { success: false, books: [] };
    }
  },

  async getBookById(id: string): Promise<{ success: boolean; book?: LawBook }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/books/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.getBookById offline/fallback:", e);
      return { success: false };
    }
  },

  async createBook(data: Partial<LawBook>): Promise<{ success: boolean; book?: LawBook }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/books`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.createBook offline/fallback:", e);
      return { success: false };
    }
  },

  async incrementBookDownload(id: string): Promise<{ success: boolean; count?: number }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/books/${id}/download`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.incrementBookDownload offline/fallback:", e);
      return { success: false };
    }
  },

  async deleteBook(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/books/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.deleteBook offline/fallback:", e);
      return { success: false };
    }
  },

  // ==========================================================================
  // 2. HOMEWORK ASSIGNMENTS
  // ==========================================================================
  async getAssignments(params?: { targetBatch?: string; subject?: string; search?: string }): Promise<{
    success: boolean;
    assignments: HomeworkAssignment[];
    mode?: string;
  }> {
    try {
      const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
      const res = await fetch(`${API_BASE_URL}/academy/assignments${query}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.getAssignments offline/fallback:", e);
      return { success: false, assignments: [] };
    }
  },

  async createAssignment(data: Partial<HomeworkAssignment>): Promise<{
    success: boolean;
    assignment?: HomeworkAssignment;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/assignments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.createAssignment offline/fallback:", e);
      return { success: false };
    }
  },

  async deleteAssignment(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/assignments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.deleteAssignment offline/fallback:", e);
      return { success: false };
    }
  },

  // ==========================================================================
  // 3. HOMEWORK SUBMISSIONS & GRADING STUDIO
  // ==========================================================================
  async getSubmissions(params?: {
    assignmentId?: string;
    studentEmail?: string;
    status?: string;
  }): Promise<{
    success: boolean;
    submissions: HomeworkSubmission[];
    mode?: string;
  }> {
    try {
      const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
      const res = await fetch(`${API_BASE_URL}/academy/submissions${query}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.getSubmissions offline/fallback:", e);
      return { success: false, submissions: [] };
    }
  },

  async submitHomework(data: Partial<HomeworkSubmission>): Promise<{
    success: boolean;
    submission?: HomeworkSubmission;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/submissions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.submitHomework offline/fallback:", e);
      return { success: false };
    }
  },

  async gradeSubmission(
    id: string,
    gradeData: {
      score: number;
      maxScore?: number;
      feedback?: string;
      rubricBreakdown?: any;
      evaluator?: string;
      status?: "Graded" | "Needs Revision";
    }
  ): Promise<{ success: boolean; submission?: HomeworkSubmission }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/submissions/${id}/grade`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gradeData),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.gradeSubmission offline/fallback:", e);
      return { success: false };
    }
  },

  // ==========================================================================
  // 4. FACULTY LECTURE AUDIO STUDIO
  // ==========================================================================
  async getLectures(params?: { category?: string; subject?: string; search?: string }): Promise<{
    success: boolean;
    lectures: LectureAudio[];
    mode?: string;
  }> {
    try {
      const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
      const res = await fetch(`${API_BASE_URL}/academy/lectures${query}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.getLectures offline/fallback:", e);
      return { success: false, lectures: [] };
    }
  },

  async createLecture(data: Partial<LectureAudio>): Promise<{
    success: boolean;
    lecture?: LectureAudio;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/lectures`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.createLecture offline/fallback:", e);
      return { success: false };
    }
  },

  async incrementLectureListens(id: string): Promise<{ success: boolean; count?: number }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/lectures/${id}/listen`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.incrementLectureListens offline/fallback:", e);
      return { success: false };
    }
  },

  async deleteLecture(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/lectures/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.deleteLecture offline/fallback:", e);
      return { success: false };
    }
  },

  // ==========================================================================
  // 5. CORNELL LEGAL NOTEBOOKS
  // ==========================================================================
  async getNotes(params?: { subject?: string; isBookmarked?: boolean; search?: string }): Promise<{
    success: boolean;
    notes: CornellNote[];
    mode?: string;
  }> {
    try {
      const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
      const res = await fetch(`${API_BASE_URL}/academy/notes${query}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.getNotes offline/fallback:", e);
      return { success: false, notes: [] };
    }
  },

  async saveNote(data: Partial<CornellNote>): Promise<{ success: boolean; note?: CornellNote }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/notes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.saveNote offline/fallback:", e);
      return { success: false };
    }
  },

  async deleteNote(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.deleteNote offline/fallback:", e);
      return { success: false };
    }
  },

  async toggleBookmarkNote(id: string): Promise<{ success: boolean; isBookmarked?: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/notes/${id}/bookmark`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.toggleBookmarkNote offline/fallback:", e);
      return { success: false };
    }
  },

  // ==========================================================================
  // 6. 3D COURTROOM LAB & MOOT SIMULATION
  // ==========================================================================
  async getMootRecords(): Promise<{
    success: boolean;
    records: MootHistoryRecord[];
    mode?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/courtroom/moot`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.getMootRecords offline/fallback:", e);
      return { success: false, records: [] };
    }
  },

  async saveMootRecord(data: Partial<MootHistoryRecord>): Promise<{
    success: boolean;
    record?: MootHistoryRecord;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/courtroom/moot`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.saveMootRecord offline/fallback:", e);
      return { success: false };
    }
  },

  // ==========================================================================
  // 7. ACADEMY STATS
  // ==========================================================================
  async getAcademyStats(): Promise<{
    success: boolean;
    stats?: {
      totalBooks: number;
      totalAssignments: number;
      totalSubmissions: number;
      pendingSubmissions: number;
      gradedSubmissions: number;
      totalLectures: number;
    };
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/stats`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.getAcademyStats offline/fallback:", e);
      return { success: false };
    }
  },

  // ==========================================================================
  // 8. FILE & MEDIA UPLOAD SERVICE
  // ==========================================================================
  async uploadFile(
    file: File | Blob,
    filename: string,
    category: "documents" | "audio" | "exhibits" | "books" | "general" = "general"
  ): Promise<{
    success: boolean;
    file?: {
      originalName: string;
      storedName: string;
      category: string;
      mimetype: string;
      sizeFormatted: string;
      fileUrl: string;
      relativeUrl: string;
    };
    message?: string;
  }> {
    try {
      const formData = new FormData();
      formData.append("file", file, filename);
      formData.append("category", category);

      const res = await fetch(`${API_BASE_URL}/upload/single`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e: any) {
      console.warn("academyApi.uploadFile error:", e);
      return { success: false, message: e.message };
    }
  },

  async uploadBase64(
    base64Data: string,
    filename: string,
    category: "documents" | "audio" | "exhibits" | "books" | "general" = "general"
  ): Promise<{
    success: boolean;
    file?: {
      originalName: string;
      storedName: string;
      category: string;
      fileUrl: string;
      relativeUrl: string;
      sizeFormatted: string;
    };
    message?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/upload/base64`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ base64Data, filename, category }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e: any) {
      console.warn("academyApi.uploadBase64 error:", e);
      return { success: false, message: e.message };
    }
  },

  // ==========================================================================
  // 10. MASTERCLASS LAW COURSES
  // ==========================================================================
  async getCourses(params?: { exam?: string; search?: string }): Promise<{
    success: boolean;
    courses: LawCourse[];
    count?: number;
  }> {
    try {
      const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
      const res = await fetch(`${API_BASE_URL}/academy/courses${query}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.getCourses offline/fallback:", e);
      if (typeof window !== "undefined") {
        try {
          const s = localStorage.getItem("wakheel_academy_courses");
          if (s) {
            return { success: true, courses: JSON.parse(s) };
          }
        } catch {}
      }
      return { success: false, courses: [] };
    }
  },

  async getCourseById(id: string): Promise<{ success: boolean; course?: LawCourse }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/courses/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.getCourseById offline/fallback:", e);
      return { success: false };
    }
  },

  async createCourse(data: Partial<LawCourse>): Promise<{ success: boolean; course?: LawCourse }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/courses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      if (typeof window !== "undefined" && json.course) {
        try {
          const s = localStorage.getItem("wakheel_academy_courses");
          const list = s ? JSON.parse(s) : [];
          localStorage.setItem("wakheel_academy_courses", JSON.stringify([json.course, ...list]));
        } catch {}
      }
      return json;
    } catch (e) {
      console.warn("academyApi.createCourse offline/fallback:", e);
      if (typeof window !== "undefined") {
        try {
          const s = localStorage.getItem("wakheel_academy_courses");
          const list = s ? JSON.parse(s) : [];
          const newC: LawCourse = {
            id: data.id || `course_${Date.now()}`,
            title: data.title || "Untitled Masterclass",
            exam: data.exam || "CLAT 2027 (NLUs)",
            unitsCount: data.unitsCount || "10 Sections",
            description: data.description || "",
            instructor: data.instructor || "Faculty Advocate",
            image: data.image || "/academy/explore-paper.png",
            ...data,
          } as LawCourse;
          const updated = [newC, ...list];
          localStorage.setItem("wakheel_academy_courses", JSON.stringify(updated));
          return { success: true, course: newC };
        } catch {}
      }
      return { success: false };
    }
  },

  async deleteCourse(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      if (typeof window !== "undefined") {
        try {
          const s = localStorage.getItem("wakheel_academy_courses");
          if (s) {
            const list = JSON.parse(s).filter((c: any) => c.id !== id);
            localStorage.setItem("wakheel_academy_courses", JSON.stringify(list));
          }
        } catch {}
      }
      return await res.json();
    } catch (e) {
      console.warn("academyApi.deleteCourse offline/fallback:", e);
      if (typeof window !== "undefined") {
        try {
          const s = localStorage.getItem("wakheel_academy_courses");
          if (s) {
            const list = JSON.parse(s).filter((c: any) => c.id !== id);
            localStorage.setItem("wakheel_academy_courses", JSON.stringify(list));
          }
        } catch {}
      }
      return { success: true };
    }
  },

  // ==========================================================================
  // 11. CENTRALIZED TUITION ACCESS REQUESTS
  // ==========================================================================
  async requestTuitionAccess(data: {
    studentName?: string;
    studentEmail?: string;
    studentCode?: string;
    targetExam?: string;
    reason?: string;
  }): Promise<{
    success: boolean;
    request?: TuitionAccessRequest;
    message?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/tuition/request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      if (typeof window !== "undefined" && json.request) {
        try {
          localStorage.setItem("wakheel_tuition_request", JSON.stringify(json.request));
          localStorage.setItem("wakheel_tuition_status", json.request.status);
        } catch {}
      }
      return json;
    } catch (e: any) {
      console.warn("academyApi.requestTuitionAccess offline/fallback:", e);
      if (typeof window !== "undefined") {
        const fallbackReq: TuitionAccessRequest = {
          id: `tuition_req_${Date.now()}`,
          studentName: data.studentName || "Wakheel Law Scholar",
          studentEmail: data.studentEmail || "scholar@wakheel.law",
          studentCode: data.studentCode || "STU-4KMAC5",
          targetExam: data.targetExam || "CLAT 2027 (NLUs)",
          reason: data.reason || "Intensive chamber coaching and mock courtroom mentorship",
          status: "pending",
          requestedAt: new Date().toISOString(),
        };
        try {
          localStorage.setItem("wakheel_tuition_request", JSON.stringify(fallbackReq));
          localStorage.setItem("wakheel_tuition_status", "pending");
          const s = localStorage.getItem("wakheel_faculty_tuition_requests");
          const list = s ? JSON.parse(s) : [];
          localStorage.setItem("wakheel_faculty_tuition_requests", JSON.stringify([fallbackReq, ...list]));
        } catch {}
        return { success: true, request: fallbackReq };
      }
      return { success: false, message: e.message };
    }
  },

  async getTuitionRequests(params?: { status?: string; search?: string }): Promise<{
    success: boolean;
    requests: TuitionAccessRequest[];
    count?: number;
  }> {
    try {
      const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
      const res = await fetch(`${API_BASE_URL}/academy/tuition/requests${query}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.getTuitionRequests offline/fallback:", e);
      if (typeof window !== "undefined") {
        try {
          const s = localStorage.getItem("wakheel_faculty_tuition_requests");
          if (s) {
            let list = JSON.parse(s);
            if (params?.status && params.status !== "all") {
              list = list.filter((r: any) => r.status === params.status);
            }
            return { success: true, requests: list, count: list.length };
          }
        } catch {}
      }
      return { success: false, requests: [] };
    }
  },

  async getTuitionStatus(email: string): Promise<{
    success: boolean;
    isApproved: boolean;
    status: string;
    request?: TuitionAccessRequest | null;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/tuition/status/${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.getTuitionStatus offline/fallback:", e);
      if (typeof window !== "undefined") {
        try {
          const savedStatus = localStorage.getItem("wakheel_tuition_status") || "none";
          const savedReq = localStorage.getItem("wakheel_tuition_request");
          return {
            success: true,
            isApproved: savedStatus === "approved",
            status: savedStatus,
            request: savedReq ? JSON.parse(savedReq) : null,
          };
        } catch {}
      }
      return { success: false, isApproved: false, status: "none", request: null };
    }
  },

  async reviewTuitionRequest(
    id: string,
    data: { status: "approved" | "rejected"; reviewedBy?: string; facultyNotes?: string }
  ): Promise<{
    success: boolean;
    request?: TuitionAccessRequest;
    message?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/tuition/requests/${id}/review`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      if (typeof window !== "undefined") {
        try {
          const s = localStorage.getItem("wakheel_faculty_tuition_requests");
          if (s) {
            const list = JSON.parse(s).map((r: any) =>
              r.id === id ? { ...r, status: data.status, reviewedAt: new Date().toISOString() } : r
            );
            localStorage.setItem("wakheel_faculty_tuition_requests", JSON.stringify(list));
          }
          if (data.status === "approved") {
            localStorage.setItem("wakheel_tuition_status", "approved");
          }
        } catch {}
      }
      return json;
    } catch (e: any) {
      console.warn("academyApi.reviewTuitionRequest offline/fallback:", e);
      if (typeof window !== "undefined") {
        try {
          const s = localStorage.getItem("wakheel_faculty_tuition_requests");
          if (s) {
            const list = JSON.parse(s).map((r: any) =>
              r.id === id ? { ...r, status: data.status, reviewedAt: new Date().toISOString() } : r
            );
            localStorage.setItem("wakheel_faculty_tuition_requests", JSON.stringify(list));
          }
          if (data.status === "approved") {
            localStorage.setItem("wakheel_tuition_status", "approved");
          }
          return { success: true };
        } catch {}
      }
      return { success: false, message: e.message };
    }
  },

  // ==========================================================================
  // 12. CBT MOCK TEST PACKS, DIAGNOSTIC SCORECARDS & LEADERBOARD
  // ==========================================================================
  async getMockTestPacks(params?: { exam?: string; search?: string }): Promise<{
    success: boolean;
    packs: MockTestPack[];
    count?: number;
  }> {
    try {
      const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
      const res = await fetch(`${API_BASE_URL}/academy/mock-exams${query}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      if (typeof window !== "undefined" && Array.isArray(json.packs)) {
        try {
          localStorage.setItem("wakheel_mock_test_packs", JSON.stringify(json.packs));
        } catch {}
      }
      return json;
    } catch (e) {
      console.warn("academyApi.getMockTestPacks offline/fallback:", e);
      if (typeof window !== "undefined") {
        try {
          const s = localStorage.getItem("wakheel_mock_test_packs");
          if (s) {
            const packs = JSON.parse(s);
            return { success: true, packs, count: packs.length };
          }
        } catch {}
      }
      return { success: false, packs: [] };
    }
  },

  async createMockTestPack(data: Partial<MockTestPack>): Promise<{
    success: boolean;
    pack?: MockTestPack;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/mock-exams`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.createMockTestPack offline/fallback:", e);
      return { success: false };
    }
  },

  async submitMockExamResult(data: MockExamResult): Promise<{
    success: boolean;
    result?: MockExamResult;
  }> {
    const fallbackResult: MockExamResult = {
      ...data,
      id: data.id || `mock_res_${Date.now()}`,
      completedDate:
        data.completedDate ||
        new Date().toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    };
    if (typeof window !== "undefined") {
      try {
        const s = localStorage.getItem("wakheel_mock_exam_results");
        const list = s ? JSON.parse(s) : [];
        localStorage.setItem("wakheel_mock_exam_results", JSON.stringify([fallbackResult, ...list].slice(0, 50)));
      } catch {}
    }
    try {
      const res = await fetch(`${API_BASE_URL}/academy/mock-exams/results`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.submitMockExamResult offline/fallback:", e);
      return { success: true, result: fallbackResult };
    }
  },

  async getMockExamResults(studentEmail?: string): Promise<{
    success: boolean;
    results: MockExamResult[];
    count?: number;
  }> {
    try {
      const query = studentEmail ? `?studentEmail=${encodeURIComponent(studentEmail)}` : "";
      const res = await fetch(`${API_BASE_URL}/academy/mock-exams/results${query}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      if (typeof window !== "undefined" && Array.isArray(json.results)) {
        try {
          localStorage.setItem("wakheel_mock_exam_results", JSON.stringify(json.results));
        } catch {}
      }
      return json;
    } catch (e) {
      console.warn("academyApi.getMockExamResults offline/fallback:", e);
      if (typeof window !== "undefined") {
        try {
          const s = localStorage.getItem("wakheel_mock_exam_results");
          if (s) {
            const results = JSON.parse(s);
            return { success: true, results, count: results.length };
          }
        } catch {}
      }
      return { success: false, results: [] };
    }
  },

  async getMockLeaderboard(): Promise<{
    success: boolean;
    leaderboard: MockLeaderboardEntry[];
    count?: number;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/mock-exams/leaderboard`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.getMockLeaderboard offline/fallback:", e);
      return { success: false, leaderboard: [] };
    }
  },

  // ==========================================================================
  // 13. ACADEMY ADMIN AUTH & CONTROL MODULE
  // ==========================================================================
  async adminLogin(email: string, password: string): Promise<{
    success: boolean;
    token?: string;
    user?: { id: string; fullName: string; email: string; role: string };
    message?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || "Invalid admin credentials." };
      }
      return data;
    } catch (e: any) {
      // Offline fallback validation matching default admin credentials
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail === "admin@wakheel.law" && password.trim() === "WakheelAdmin@2026") {
        return {
          success: true,
          token: "dev_admin",
          user: {
            id: "academy_admin_root",
            fullName: "Wakheel Academy Dean / Admin",
            email: cleanEmail,
            role: "admin",
          },
        };
      }
      return { success: false, message: "Backend unreachable and credentials did not match offline admin key." };
    }
  },

  async getAdminOverview(): Promise<{
    success: boolean;
    overview?: AcademyAdminOverview;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/admin/overview`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.getAdminOverview offline/fallback:", e);
      return { success: false };
    }
  },

  async getAdminUsers(params?: { role?: string; search?: string }): Promise<{
    success: boolean;
    users: AcademyAdminUser[];
    count?: number;
  }> {
    try {
      const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
      const res = await fetch(`${API_BASE_URL}/academy/admin/users${query}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      if (typeof window !== "undefined" && Array.isArray(json.users)) {
        try {
          localStorage.setItem("wakheel_admin_users", JSON.stringify(json.users));
        } catch {}
      }
      return json;
    } catch (e) {
      console.warn("academyApi.getAdminUsers offline/fallback:", e);
      if (typeof window !== "undefined") {
        try {
          const s = localStorage.getItem("wakheel_admin_users");
          if (s) {
            const users = JSON.parse(s);
            return { success: true, users, count: users.length };
          }
        } catch {}
      }
      return { success: false, users: [] };
    }
  },

  async createAdminUser(data: {
    fullName: string;
    email: string;
    role: "student" | "teacher";
    department?: string;
    targetProgram?: string;
    institutionName?: string;
  }): Promise<{ success: boolean; user?: AcademyAdminUser; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/admin/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, message: json.message };
      return json;
    } catch (e: any) {
      console.warn("academyApi.createAdminUser offline/fallback:", e);
      return { success: false, message: e.message };
    }
  },

  async updateAdminUserStatus(
    id: string,
    data: { status?: "active" | "suspended"; role?: "student" | "teacher" }
  ): Promise<{ success: boolean; user?: AcademyAdminUser }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/admin/users/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.updateAdminUserStatus offline/fallback:", e);
      return { success: false };
    }
  },

  async deleteAdminUser(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.deleteAdminUser offline/fallback:", e);
      return { success: false };
    }
  },

  async deleteMockTestPack(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/academy/mock-exams/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("academyApi.deleteMockTestPack offline/fallback:", e);
      return { success: false };
    }
  },

  async academyLogin(data: {
    email: string;
    password: string;
    role?: "student" | "teacher";
  }): Promise<{
    success: boolean;
    token?: string;
    user?: {
      id: string;
      fullName: string;
      email: string;
      role: string;
      targetProgram?: string;
      department?: string;
      institutionName?: string;
    };
    message?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, message: json.message || "Invalid credentials." };
      }
      return json;
    } catch {
      // Offline fallback if backend server is not running
      const fallbackRole = data.role || "student";
      return {
        success: true,
        token: fallbackRole === "teacher" ? "dev_teacher" : "dev_student",
        user: {
          id: "academy_offline_" + Date.now(),
          fullName: data.email.split("@")[0],
          email: data.email.trim(),
          role: fallbackRole,
        },
      };
    }
  },

  async academyRegister(data: {
    fullName: string;
    email: string;
    password: string;
    role: "student" | "teacher";
    targetProgram?: string;
    department?: string;
    institutionName?: string;
  }): Promise<{
    success: boolean;
    token?: string;
    user?: {
      id: string;
      fullName: string;
      email: string;
      role: string;
      targetProgram?: string;
      department?: string;
      institutionName?: string;
    };
    message?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          accountType: data.role,
          verifyMethod: "email",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, message: json.message || "Registration failed." };
      }
      return json;
    } catch {
      // Offline fallback if backend server is not running
      return {
        success: true,
        token: data.role === "teacher" ? "dev_teacher" : "dev_student",
        user: {
          id: "academy_offline_" + Date.now(),
          fullName: data.fullName.trim(),
          email: data.email.trim(),
          role: data.role,
          targetProgram: data.targetProgram,
          department: data.department,
          institutionName: data.institutionName,
        },
      };
    }
  },
};

export default academyApi;
