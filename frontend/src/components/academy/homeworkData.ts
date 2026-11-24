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

export const INITIAL_ASSIGNMENTS: HomeworkAssignment[] = [
  {
    id: "hw_bnss_480",
    title: "Regular Bail Petition Drafting under Section 480 of Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)",
    subject: "Criminal Procedure & Constitutional Bail",
    targetBatch: "CLAT 2027 Super-30 & Distance LL.B",
    badge: "DRAFTING MEMORIAL",
    instructions:
      "A college student is arrested on charges under Section 303(2) BNS (Theft). Police claim recovery of stolen laptop from a hostel locker without independent panch witnesses. Draft a comprehensive Regular Bail Petition before the Court of Sessions citing Section 480 BNSS (erstwhile S. 439 CrPC), emphasizing fundamental right to personal liberty under Article 21, triple test satisfaction (no flight risk, no tampering, no witness intimidation), and non-compliance with Section 35 BNSS arrest guidelines (Arnesh Kumar v. State of Bihar).",
    referenceRatio:
      "Arnesh Kumar v. State of Bihar (2014) 8 SCC 273; Satender Kumar Antil v. CBI (2022) 10 SCC 51; P. Chidambaram v. CBI (2020) 13 SCC 337.",
    faculty: "Prof. Dr. Rajesh Varma",
    dueDate: "Nov 25, 2026, 8:00 PM",
    maxScore: 50,
    createdAt: "Nov 18, 2026",
  },
  {
    id: "hw_const_kesavananda",
    title: "Case Brief & Ratio Decidendi Extraction: Kesavananda Bharati v. State of Kerala (1973)",
    subject: "Constitutional Law & Basic Structure",
    targetBatch: "KLEE 2027 & NLU Foundation",
    badge: "CASE BRIEF",
    instructions:
      "Synthesize the majority ruling of the 13-Judge Constitution Bench. Formulate a 4-part legal brief: (1) Background & Challenge to 24th, 25th, and 29th Constitutional Amendments; (2) Judicial Test for 'Constituent Power' under Article 368; (3) Identification of immutable features comprising the Basic Structure; (4) Impact on subsequent jurisprudence (Indira Nehru Gandhi v. Raj Narain, Minerva Mills).",
    referenceRatio:
      "Parliament's amendatory power is wide but not unlimited; the creature of the Constitution cannot destroy the Constitution itself (Kesavananda Bharati, 1973).",
    faculty: "Adv. Sunita Deshmukh",
    dueDate: "Nov 27, 2026, 6:00 PM",
    maxScore: 50,
    createdAt: "Nov 19, 2026",
  },
  {
    id: "hw_contracts_sec73",
    title: "Remoteness of Damages Legal Memorandum under Section 73 Indian Contract Act",
    subject: "Commercial & Contract Law",
    targetBatch: "Bar Examination & 1st Year LL.B",
    badge: "LEGAL MEMO",
    instructions:
      "Client 'Alpha Logistics' delayed delivery of a crucial machine component to 'Beta Textiles' by 4 days due to unseasonal road landslides. Beta Textiles claims damages of ₹25 Lakhs for loss of exceptional government export contracts. Alpha was unaware of this special contract. Author a legal opinion advising Alpha on liability under Section 73, dissecting direct losses vs remote/consequential damages under Hadley v. Baxendale.",
    referenceRatio:
      "Hadley v. Baxendale (1854) 9 Exch 341; Victoria Laundry (Windsor) Ltd v. Newman Industries Ltd (1949) 2 KB 528; Karsandas H. Thacker v. Saran Engineering Co. Ltd (AIR 1965 SC 1981).",
    faculty: "Prof. Dr. Rajesh Varma",
    dueDate: "Nov 29, 2026, 11:59 PM",
    maxScore: 50,
    createdAt: "Nov 20, 2026",
  },
  {
    id: "hw_bns_103_105",
    title: "Comparative Statutory Analysis: Section 103 BNS (Murder) vs Section 105 BNS (Culpable Homicide)",
    subject: "Bharatiya Nyaya Sanhita (BNS 2023)",
    targetBatch: "CLAT 2027 Super-30 Rankers",
    badge: "STATUTORY DOCTRINE",
    instructions:
      "Examine the degree of intention and probability of death separating Section 103 and Section 105 of BNS 2023. Contrast the 5 Exception clauses from erstwhile IPC Section 300 with Section 105 BNS. Analyze State of A.P. v. Rayavarapu Punnayya (1976) scheme of concentric circles and determine how judicial magistrates must frame charges.",
    referenceRatio:
      "Culpable homicide is the genus, murder is the species. All murders are culpable homicide, but not all culpable homicides are murder (Rayavarapu Punnayya, 1976).",
    faculty: "Adv. Rohan Mehra",
    dueDate: "Dec 02, 2026, 5:00 PM",
    maxScore: 50,
    createdAt: "Nov 21, 2026",
  },
];

export const INITIAL_SUBMISSIONS: HomeworkSubmission[] = [
  {
    id: "sub_advithya_1",
    assignmentId: "hw_bnss_480",
    assignmentTitle: "Regular Bail Petition Drafting under Section 480 of Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)",
    studentName: "Advithya Sharma",
    studentEmail: "advithya.sharma@wakheel.edu",
    submittedDate: "Today, 10:45 AM",
    issuesRaised:
      "1. Whether pre-trial custody of a bona fide student under Section 303(2) BNS without independent seizure witnesses violates Section 105 BNSS and Article 21?\n2. Whether the applicant satisfies the triple test for regular bail under Section 480 BNSS?",
    submissionText: `IN THE COURT OF THE SESSIONS JUDGE AT NEW DELHI
BAIL APPLICATION NO. 412 OF 2026
IN THE MATTER OF:
STATE (NCT OF DELHI) ... PROSECUTION
VERSUS
ARJUN MEHTA ... APPLICANT / ACCUSED

FIR NO: 89/2026
UNDER SECTION: 303(2) BHARATIYA NYAYA SANHITA (BNS 2023)
POLICE STATION: CIVIL LINES, DELHI

APPLICATION UNDER SECTION 480 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 FOR GRANT OF REGULAR BAIL

MOST RESPECTFULLY SHEWETH:
1. That the Applicant is a peaceful, law-abiding citizen and a 2nd-year undergraduate law student at University of Delhi with exemplary academic standing and zero criminal antecedents.
2. That on 18.11.2026, the Applicant was arbitrarily arrested by investigating officers alleging recovery of a laptop from a communal hostel recreation cupboard.
3. VIOLATION OF SECTION 35 BNSS & ARNESH KUMAR MANDATE: The offense under Section 303(2) BNS carries a maximum penalty of 3 years imprisonment. Under Section 35(3) BNSS (in pari materia with Section 41A CrPC), notice of appearance was mandatory. The police recorded no objective necessity justifying custodial deprivation.
4. ABSENCE OF INDEPENDENT WITNESSES: The alleged seizure directly violates Section 105 BNSS as neither independent hostel wardens nor neutral public witnesses attested the seizure memo.
5. SATISFACTION OF TRIPLE TEST (Satender Kumar Antil v. CBI, 2022):
   a. No Flight Risk: The Applicant resides permanently with his parents in New Delhi and has surrendered his passport.
   b. No Tampering: The entire alleged case property has already been seized and sealed.
   c. No Witness Intimidation: Complainant and Applicant study in distinct departments with zero interaction.
6. That incarceration of a young student prior to conviction infringes the sacred procedural guarantees enshrined under Article 21 (Maneka Gandhi v. UOI, 1978).`,
    prayerOrConclusion:
      "WHEREFORE, in light of the above facts and circumstances, it is most respectfully prayed that this Hon'ble Court may graciously be pleased to enlarge the Applicant on regular bail under Section 480 BNSS upon furnishing reasonable surety to the satisfaction of this Hon'ble Court.",
    attachmentName: "Bail_Application_Sec480_Advithya.pdf",
    status: "Pending Evaluation",
  },
  {
    id: "sub_priya_2",
    assignmentId: "hw_const_kesavananda",
    assignmentTitle: "Case Brief & Ratio Decidendi Extraction: Kesavananda Bharati v. State of Kerala (1973)",
    studentName: "Priya Nair",
    studentEmail: "priya.nair@wakheel.edu",
    submittedDate: "Yesterday, 2:15 PM",
    issuesRaised:
      "1. Extent of amending power of Parliament under Article 368.\n2. Whether fundamental rights can be abrogated by constitutional amendment.",
    submissionText: `CASE BRIEF: KESAVANANDA BHARATI v. STATE OF KERALA (1973) 4 SCC 225
BENCH: 13-Judge Constitution Bench | RATIO: 7:6 Majority

1. FACTS & BACKGROUND:
The pontiff of Edneer Mutt challenged Kerala Land Reforms Amendment Acts of 1969 and 1971 under Articles 25, 26, 14, 19(1)(f), and 31. During pendency, Parliament passed the 24th, 25th, and 29th Amendments to override the Golak Nath ruling and insulate land reforms in the Ninth Schedule.

2. CARDINAL LEGAL ISSUES:
- Does Article 368 confer sovereign constituent power to alter, repeal, or replace the fundamental identity of the Constitution?
- Can judicial review under Article 32 & 226 be ousted by legislative declarations?

3. RATIO DECIDENDI (MAJORITY OPINION):
a. Golak Nath Overruled: Article 368 contains both the power and the procedure for constitutional amendment. An amendment under Art. 368 is not 'law' within the meaning of Article 13(2).
b. Basic Structure Doctrine: The word 'amendment' postulates that the old Constitution continues in modified form; it does not authorize the erection of a new Constitution. Parliament cannot destroy the essential framework or basic features (Secularism, Rule of Law, Separation of Powers, Judicial Review, and Federalism).
c. Invalidation of Article 31C (Part II): The conclusive declaration clause that prevented judicial scrutiny of laws enacted under Article 39(b) and (c) was declared unconstitutional because it obliterated judicial review.`,
    prayerOrConclusion:
      "CONCLUSION: Kesavananda Bharati established the supremacy of the Constitution over Parliament. The Basic Structure test guarantees that temporary parliamentary majorities cannot dismantle democratic constitutionalism.",
    attachmentName: "Kesavananda_CaseBrief_Priya.pdf",
    status: "Graded",
    score: 48,
    grade: "48 / 50",
    feedback:
      "Masterful synthesis of the 13-judge bench opinions. The distinction drawn between plenary legislative authority and constituent amending limitations is sharply reasoned. Excellent citation of Justice Khanna's pivotal concurring test.",
    rubricBreakdown: {
      statutoryAccuracy: 15,
      casePrecedents: 14,
      draftingAndPrayer: 10,
      legalReasoning: 9,
    },
    evaluatedBy: "Prof. Dr. Rajesh Varma",
    evaluatedDate: "Yesterday, 4:30 PM",
  },
  {
    id: "sub_rahul_3",
    assignmentId: "hw_contracts_sec73",
    assignmentTitle: "Remoteness of Damages Legal Memorandum under Section 73 Indian Contract Act",
    studentName: "Rahul George",
    studentEmail: "rahul.george@wakheel.edu",
    submittedDate: "Nov 21, 2026",
    issuesRaised:
      "1. Whether consequential losses from an undisclosed third-party export tender are recoverable under Section 73.\n2. Application of the Hadley v. Baxendale two-limb remoteness rule.",
    submissionText: `LEGAL MEMORANDUM
TO: ALPHA LOGISTICS MANAGEMENT BOARD
FROM: RAHUL GEORGE (CHAMBER LEGAL COUNSEL)
SUBJECT: DEFENSE MEMORANDUM AGAINST DAMAGES CLAIM BY BETA TEXTILES

STATEMENT OF FACTS:
Alpha Logistics was engaged to transport a weaving turbine from Mumbai to Surat. A 4-day delivery delay occurred due to massive landslides on NH-48. Beta Textiles claims ₹25 Lakhs for loss of an extraordinary government export tender.

LEGAL ANALYSIS:
1. SECTION 73 ICA STATUTORY STANDARD:
Section 73 provides compensation only for losses that 'naturally arose in the usual course of things' or which 'the parties knew when they made the contract to be likely to result from breach'. The explanation explicitly bars compensation for any remote and indirect loss.

2. THE HADLEY v. BAXENDALE RULE:
- First Limb (Ordinary Damages): Losses arising naturally in the usual course of trade. Here, ordinary machine downtime value during 4 days is compensable.
- Second Limb (Special Damages): Exceptional loss of profit from third-party export contracts can only be recovered if special circumstances were communicated to Alpha at the time of contracting (Victoria Laundry, 1949).

3. CONCLUSION:
Alpha Logistics is solely liable for normal commercial delay damages (approx ₹35,000) and completely immune from the ₹25 Lakh export contract loss.`,
    prayerOrConclusion:
      "ADVICE: Issue a formal legal reply offering nominal statutory interest for the 4-day delay while repudiating the remote claim in toto citing Section 73 Explanation.",
    attachmentName: "Contract_Remoteness_Memo_Rahul.pdf",
    status: "Graded",
    score: 44,
    grade: "44 / 50",
    feedback:
      "Very lucid application of the two-limb test in Hadley v. Baxendale. Solid commercial drafting. In future briefs, consider addressing whether the NH-48 landslide constituted a Force Majeure or Section 56 frustration event.",
    rubricBreakdown: {
      statutoryAccuracy: 13,
      casePrecedents: 13,
      draftingAndPrayer: 9,
      legalReasoning: 9,
    },
    evaluatedBy: "Prof. Dr. Rajesh Varma",
    evaluatedDate: "Nov 22, 2026",
  },
];

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
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ASSIGNMENTS;
  } catch {
    return INITIAL_ASSIGNMENTS;
  }
}

export async function syncAssignmentsWithServer(): Promise<HomeworkAssignment[]> {
  if (typeof window === "undefined") return INITIAL_ASSIGNMENTS;
  try {
    const res = await academyApi.getAssignments();
    if (res.success && Array.isArray(res.assignments) && res.assignments.length > 0) {
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
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SUBMISSIONS;
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
