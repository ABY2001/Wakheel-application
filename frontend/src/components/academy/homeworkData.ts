import { academyApi } from "@/lib/academyApi";

export interface RubricBreakdown {
  statutoryAccuracy: number; // max 15
  casePrecedents: number; // max 15
  draftingAndPrayer: number; // max 10
  legalReasoning: number; // max 10
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  subject: string;
  targetBatch: string;
  instructions: string;
  faculty: string;
  dueDate: string;
  maxScore: number;
  badge: string;
  referenceRatio?: string;
  createdAt: string;
}

export interface HomeworkSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentName: string;
  studentEmail: string;
  submittedDate: string;
  issuesRaised: string;
  submissionText: string;
  prayerOrConclusion: string;
  attachmentName?: string;
  status: "Pending Evaluation" | "Graded" | "Needs Revision";
  grade?: string;
  score?: number;
  feedback?: string;
  rubricBreakdown?: RubricBreakdown;
  evaluatedBy?: string;
  evaluatedDate?: string;
}

export const INITIAL_ASSIGNMENTS: HomeworkAssignment[] = [];

export const INITIAL_SUBMISSIONS: HomeworkSubmission[] = [];

const ASSIGNMENTS_STORAGE_KEY = "wakheel_academy_assignments_v1";
const SUBMISSIONS_STORAGE_KEY = "wakheel_academy_submissions_v1";

export function getStoredAssignments(): HomeworkAssignment[] {
  if (typeof window === "undefined") return INITIAL_ASSIGNMENTS;
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(INITIAL_ASSIGNMENTS));
      return INITIAL_ASSIGNMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ASSIGNMENTS;
  } catch {
    return INITIAL_ASSIGNMENTS;
  }
}

export async function syncAssignmentsWithServer(): Promise<HomeworkAssignment[]> {
  if (typeof window === "undefined") return INITIAL_ASSIGNMENTS;
  try {
    const res = await academyApi.getAssignments();
    if (res.success && Array.isArray(res.assignments)) {
      localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(res.assignments));
      window.dispatchEvent(new Event("storage"));
      return res.assignments;
    }
  } catch (err) {
    console.warn("syncAssignmentsWithServer offline fallback:", err);
  }
  return getStoredAssignments();
}

export async function syncSubmissionsWithServer(): Promise<HomeworkSubmission[]> {
  if (typeof window === "undefined") return INITIAL_SUBMISSIONS;
  try {
    const res = await academyApi.getSubmissions();
    if (res.success && Array.isArray(res.submissions)) {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(res.submissions));
      window.dispatchEvent(new Event("storage"));
      return res.submissions;
    }
  } catch (err) {
    console.warn("syncSubmissionsWithServer offline fallback:", err);
  }
  return getStoredSubmissions();
}

export function saveAssignment(assignment: HomeworkAssignment): HomeworkAssignment[] {
  if (typeof window === "undefined") return [assignment, ...INITIAL_ASSIGNMENTS];
  try {
    const current = getStoredAssignments();
    const updated = [assignment, ...current.filter((a) => a.id !== assignment.id)];
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(updated));
    academyApi.createAssignment(assignment).catch((err) => console.warn("saveAssignment remote sync:", err));
    return updated;
  } catch {
    return [assignment, ...INITIAL_ASSIGNMENTS];
  }
}

export function deleteAssignment(assignmentId: string): HomeworkAssignment[] {
  if (typeof window === "undefined") return INITIAL_ASSIGNMENTS.filter((a) => a.id !== assignmentId);
  try {
    const current = getStoredAssignments();
    const updated = current.filter((a) => a.id !== assignmentId);
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(updated));
    academyApi.deleteAssignment(assignmentId).catch((err) => console.warn("deleteAssignment remote sync:", err));
    return updated;
  } catch {
    return INITIAL_ASSIGNMENTS.filter((a) => a.id !== assignmentId);
  }
}

export function getStoredSubmissions(): HomeworkSubmission[] {
  if (typeof window === "undefined") return INITIAL_SUBMISSIONS;
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SUBMISSIONS;
  } catch {
    return INITIAL_SUBMISSIONS;
  }
}

export function submitHomework(submission: HomeworkSubmission): HomeworkSubmission[] {
  if (typeof window === "undefined") return [submission, ...INITIAL_SUBMISSIONS];
  try {
    const current = getStoredSubmissions();
    const existingIndex = current.findIndex(
      (s) => s.assignmentId === submission.assignmentId && s.studentEmail === submission.studentEmail
    );
    let updated: HomeworkSubmission[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = submission;
    } else {
      updated = [submission, ...current];
    }
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
    academyApi.submitHomework(submission).catch((err) => console.warn("submitHomework remote sync:", err));
    return updated;
  } catch {
    return [submission, ...INITIAL_SUBMISSIONS];
  }
}

export function gradeSubmission(
  submissionId: string,
  score: number,
  maxScore: number,
  feedback: string,
  evaluator: string,
  rubric?: RubricBreakdown,
  status: "Graded" | "Needs Revision" = "Graded"
): HomeworkSubmission[] {
  if (typeof window === "undefined") return INITIAL_SUBMISSIONS;
  try {
    const current = getStoredSubmissions();
    const updated = current.map((sub) => {
      if (sub.id === submissionId) {
        return {
          ...sub,
          score,
          grade: `${score} / ${maxScore}`,
          feedback,
          status,
          evaluatedBy: evaluator,
          evaluatedDate: "Just now",
          rubricBreakdown: rubric || {
            statutoryAccuracy: Math.round(score * 0.3),
            casePrecedents: Math.round(score * 0.3),
            draftingAndPrayer: Math.round(score * 0.2),
            legalReasoning: Math.round(score * 0.2),
          },
        };
      }
      return sub;
    });
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
    academyApi
      .gradeSubmission(submissionId, {
        score,
        maxScore,
        feedback,
        rubricBreakdown: rubric,
        evaluator,
        status,
      })
      .catch((err) => console.warn("gradeSubmission remote sync:", err));
    return updated;
  } catch {
    return INITIAL_SUBMISSIONS;
  }
}

export async function downloadSubmissionFile(sub: HomeworkSubmission) {
  if (typeof window === "undefined") return;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
  try {
    const res = await fetch(`${apiBase}/pdf/appraisal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub),
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Appraisal_${sub.studentName.replace(/\s+/g, "_")}_${sub.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }
  } catch (err) {
    console.warn("downloadSubmissionFile backend PDF fallback:", err);
  }

  const content = `================================================================================
WAKHEEL ACADEMY LEGAL SUBMISSION & FACULTY APPRAISAL
================================================================================
ASSIGNMENT: ${sub.assignmentTitle}
STUDENT:    ${sub.studentName} (${sub.studentEmail})
SUBMITTED:  ${sub.submittedDate}
STATUS:     ${sub.status}
SCORE:      ${sub.grade || "Under Evaluation"}
EVALUATOR:  ${sub.evaluatedBy || "Pending Review"}

--------------------------------------------------------------------------------
ISSUES RAISED & LEGAL CONTEST:
--------------------------------------------------------------------------------
${sub.issuesRaised || "N/A"}

--------------------------------------------------------------------------------
SUBMISSION MEMORANDUM & PLEADINGS:
--------------------------------------------------------------------------------
${sub.submissionText}

--------------------------------------------------------------------------------
PRAYER / RELIEF SOUGHT:
--------------------------------------------------------------------------------
${sub.prayerOrConclusion || "N/A"}

================================================================================
FACULTY EVALUATION & RATIO DECIDENDI FEEDBACK:
================================================================================
${sub.feedback || "Submission currently pending chamber review by evaluating faculty."}

${
  sub.rubricBreakdown
    ? `RUBRIC EVALUATION BREAKDOWN:
- Statutory & Bare Act Accuracy: ${sub.rubricBreakdown.statutoryAccuracy} / 15
- Landmark Case Citations:      ${sub.rubricBreakdown.casePrecedents} / 15
- Drafting Format & Prayer:       ${sub.rubricBreakdown.draftingAndPrayer} / 10
- Deductive Legal Reasoning:      ${sub.rubricBreakdown.legalReasoning} / 10`
    : ""
}
================================================================================
Generated via Wakheel Academy Faculty Studio • National Legal Pedagogy
================================================================================`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sub.studentName.replace(/\s+/g, "_")}_${sub.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
