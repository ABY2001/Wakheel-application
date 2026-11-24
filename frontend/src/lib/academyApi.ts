import { LawBook } from "../components/academy/booksData";
import { HomeworkAssignment, HomeworkSubmission } from "../components/academy/homeworkData";
import { LectureAudio } from "../components/academy/lectureAudioData";
import { CornellNote } from "../components/academy/cornellNotesData";
import { MootHistoryRecord } from "../components/academy/courtroomLabData";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const getAuthToken = (): string => {
  if (typeof window === "undefined") return "dev_student";
  return (
    localStorage.getItem("wakheel_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("wakheel_role") === "teacher"
      ? "dev_teacher"
      : "dev_student"
  );
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
};

export default academyApi;
