"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  FileText,
  Briefcase,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Play,
  Check,
  Search,
  Users,
  Layers,
  Lock,
  Mail,
  User,
  X,
  PenTool,
  Plus,
  Scale,
  ShieldCheck,
  Target,
  BarChart3,
  Bookmark,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StudentDashboardView } from "@/components/academy/StudentDashboardView";
import { TeacherDashboardView } from "@/components/academy/TeacherDashboardView";

// ==============================================================
// TYPES (STUDENT & TEACHER ONLY)
// ==============================================================
export type AcademyJourneyRole = "student" | "teacher";

export type StudentTrack =
  | "entrance"
  | "open_university"
  | "ai_tutor"
  | "internships";

export type TeacherTrack =
  | "curriculum"
  | "moot_court"
  | "test_creator"
  | "cohorts";

interface UserProfile {
  id?: string;
  fullName?: string;
  email?: string;
  role?: string;
  targetExam?: string;
  universityName?: string;
}

export default function AcademyPage() {
  const router = useRouter();
  // Current view: "journey_selection" vs "active_workspace"
  const [viewMode, setViewMode] = useState<"journey_selection" | "active_workspace">("journey_selection");
  const [selectedRole, setSelectedRole] = useState<AcademyJourneyRole>("student");
  
  // Tabs for Student & Teacher
  const [studentTab, setStudentTab] = useState<StudentTrack>("entrance");
  const [teacherTab, setTeacherTab] = useState<TeacherTrack>("curriculum");

  // Sign In Modal State
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  // Profile
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "Advithya Sharma",
    email: "advithya.sharma@law.edu",
    targetExam: "CLAT 2027 (Common Law Admission Test)",
    universityName: "National Law University Aspirant / IGNOU Law Scholar",
  });

  // Mock Test Simulator State (Student)
  const [activeMockTest, setActiveMockTest] = useState<any | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [mockScore, setMockScore] = useState<number | null>(null);

  // AI Legal Reasoning Generator State (Student)
  const [aiSubject, setAiSubject] = useState<string>("Constitutional Law");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedQuestion, setAiGeneratedQuestion] = useState<any | null>({
    principle:
      "Under Article 21 of the Constitution of India, the right to life encompasses the right to live with human dignity and clean environment. No state agency can deprive a citizen of their livelihood without following a procedure established by just, fair, and reasonable law (Maneka Gandhi v. UOI).",
    facts:
      "A municipal authority demolished street vendor shacks at 3:00 AM without serving prior notice or offering an alternative vending zone, citing beautification for a high-profile judicial summit.",
    question: "Is the demolition action legally tenable under constitutional safeguards?",
    options: [
      "Yes, municipal authorities have absolute administrative power over public roads.",
      "No, arbitrary deprivation of livelihood without notice or hearing violates Article 14 and Article 21.",
      "Yes, beautification for state summits constitutes an overriding sovereign emergency.",
      "No, street vendors enjoy absolute fundamental right to occupy public highways permanently.",
    ],
    correctIndex: 1,
    rationale:
      "In Olga Tellis v. BMC, the Supreme Court held that the right to life includes the right to livelihood. Eviction without notice or reasonable rehabilitation violates Article 21.",
  });
  const [aiAnswerSelected, setAiAnswerSelected] = useState<number | null>(null);

  // Faculty Test Creator State (Teacher)
  const [facultyQuestionSubject, setFacultyQuestionSubject] = useState("Criminal Law (BNS)");
  const [facultyPrinciple, setFacultyPrinciple] = useState("");
  const [facultyFact, setFacultyFact] = useState("");
  const [facultyQuestionText, setFacultyQuestionText] = useState("");
  const [facultySavedSuccess, setFacultySavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("wakheel_academy_user") || localStorage.getItem("wakheel_academy_student");
      const storedRole = localStorage.getItem("wakheel_academy_role");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setProfile((prev) => ({ ...prev, ...parsed }));
        if (parsed.role === "teacher") {
          router.push("/teacher/home");
        } else if (parsed.role === "student") {
          router.push("/student/home");
        }
      } else if (storedRole === "teacher") {
        router.push("/teacher/home");
      } else if (storedRole === "student") {
        router.push("/student/home");
      }
    } catch {}
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("wakheel_academy_user");
    localStorage.removeItem("wakheel_academy_student");
    localStorage.removeItem("wakheel_academy_token");
    localStorage.removeItem("wakheel_academy_role");
    setViewMode("journey_selection");
  };

  // ==============================================================
  // LAW ENTRANCE EXAM DATA (FOR STUDENTS)
  // ==============================================================
  const ENTRANCE_EXAMS = [
    {
      id: "clat_2027",
      name: "CLAT 2027 All-India Full Mock 01",
      code: "CLAT-UG",
      conductingBody: "Consortium of 24 National Law Universities",
      questionsCount: 120,
      durationMinutes: 120,
      category: "5-Year Integrated LLB Entrance",
      markingScheme: "+1 for correct, -0.25 for incorrect",
      subjects: ["Legal Reasoning", "Current Affairs & GK", "English", "Logical Reasoning", "Quantitative"],
      sampleQuestions: [
        {
          q: "Under Section 73 of the Indian Contract Act, compensation is payable for loss or damage that naturally arose in the usual course of things from a breach. Remote or indirect losses cannot be claimed unless specially agreed upon. If a printer delivers law exam papers 2 days late without being informed of the strict exam deadline, can the university claim damages for rescheduling the entire national exam?",
          options: [
            "Yes, because delay constitutes breach of contract.",
            "No, because the exceptional severity of rescheduling the national exam was a remote loss not communicated to the printer (Hadley v. Baxendale rule).",
            "Yes, because state universities have statutory immunity from commercial loss rules.",
            "No, because liquidated damages must be specified in stamp paper.",
          ],
          correct: 1,
        },
        {
          q: "A police officer detains an accused person without informing their nominated family member or advocate within 12 hours of arrest, citing confidential investigation. Does this violate statutory safeguards under Section 35(8) BNSS / S.41D CrPC?",
          options: [
            "No, investigating agencies have full discretion during initial 24 hours.",
            "Yes, the right to have a relative or advocate informed is an absolute constitutional and statutory safeguard under D.K. Basu guidelines.",
            "No, provided the accused is produced before a Magistrate within 48 hours.",
            "Yes, but only if the accused is a woman or juvenile.",
          ],
          correct: 1,
        },
      ],
    },
    {
      id: "klee_2027",
      name: "KLEE 2027 Kerala State Law Entrance Mock 01",
      code: "KLEE-LLB",
      conductingBody: "Commissioner for Entrance Examinations (CEE), Kerala",
      questionsCount: 200,
      durationMinutes: 120,
      category: "3-Yr & 5-Yr LLB Entrance (Govt & Private Law Colleges, Kerala)",
      markingScheme: "+3 for correct, -1 for incorrect",
      subjects: ["Aptitude for Legal Studies", "General English", "General Knowledge", "Mental Ability"],
      sampleQuestions: [
        {
          q: "Which constitutional amendment introduced Article 21A, ensuring free and compulsory education as a Fundamental Right?",
          options: [
            "42nd Constitutional Amendment Act, 1976",
            "44th Constitutional Amendment Act, 1978",
            "86th Constitutional Amendment Act, 2002",
            "91st Constitutional Amendment Act, 2003",
          ],
          correct: 2,
        },
        {
          q: "Under the Law of Torts, what does the maxim 'Volenti Non Fit Injuria' signify?",
          options: [
            "No wrong is done to one who consents willingly with knowledge of risk.",
            "An act of God exempts all tortious liability.",
            "The employer is strictly liable for acts of independent contractors.",
            "Ignorance of law is no excuse in civil trespass.",
          ],
          correct: 0,
        },
      ],
    },
    {
      id: "ailet_2027",
      name: "AILET 2027 All India Law Entrance Mock",
      code: "AILET-NLU",
      conductingBody: "National Law University, Delhi",
      questionsCount: 150,
      durationMinutes: 120,
      category: "NLU Delhi Dedicated BA LLB",
      markingScheme: "+1 for correct, -0.25 for incorrect",
      subjects: ["English Language", "Current Affairs", "Logical Reasoning"],
      sampleQuestions: [
        {
          q: "According to the Supreme Court ruling in K.S. Puttaswamy (2017), the right to privacy is protected as an intrinsic part of which Article?",
          options: ["Article 14", "Article 19", "Article 21", "Article 32"],
          correct: 2,
        },
      ],
    },
  ];

  // ==============================================================
  // OPEN UNIVERSITY SYLLABI & BARE ACTS
  // ==============================================================
  const OPEN_UNIV_MODULES = [
    {
      code: "LAW-OU-101",
      title: "Constitutional Law of India (Parts I, III, IV & Writs)",
      university: "IGNOU & State Open Universities",
      semester: "Year 1 / Module 1",
      unitsCount: 12,
      topics: [
        "Preamble & Basic Structure Doctrine (Kesavananda Bharati)",
        "Fundamental Rights (Arts. 14, 19, 21 Golden Triangle)",
        "Writ Jurisdictions (Habeas Corpus, Mandamus, Certiorari under Arts. 32 & 226)",
        "Directive Principles & Fundamental Duties",
      ],
      bareAct: "Constitution of India, 1950",
      status: "Available for Download & Online Study",
    },
    {
      code: "LAW-OU-102",
      title: "Criminal Law: Bharatiya Nyaya Sanhita (BNS) & IPC Transitions",
      university: "Distance LLB / PG Diploma in Criminal Justice",
      semester: "Year 1 / Module 2",
      unitsCount: 14,
      topics: [
        "General Exceptions & Mens Rea",
        "Offenses Affecting the Human Body (Homicide, Grievous Hurt)",
        "Offenses Against Property (Theft, Extortion, Cheating)",
        "New Provisions on Organized Crime & Terrorism in BNS",
      ],
      bareAct: "Bharatiya Nyaya Sanhita, 2023 / IPC 1860",
      status: "Updated with 2024–2026 Criminal Law Reforms",
    },
    {
      code: "LAW-OU-103",
      title: "Civil Procedure Code (CPC) & Law of Pleadings",
      university: "IGNOU Diploma in Paralegal Practice & Open LLB",
      semester: "Year 2 / Module 3",
      unitsCount: 16,
      topics: [
        "Res Judicata & Territorial Jurisdiction (Sections 9–20 CPC)",
        "Pleadings & Plaint Drafting (Order VI & VII)",
        "Written Statement & Counterclaims (Order VIII)",
        "Temporary Injunctions & Interlocutory Orders (Order XXXIX)",
      ],
      bareAct: "Code of Civil Procedure, 1908",
      status: "Includes Verified Model Court Drafts",
    },
    {
      code: "LAW-OU-104",
      title: "Law of Contracts & Specific Relief Act",
      university: "All Open Universities (Distance Commercial Law)",
      semester: "Year 1 / Module 4",
      unitsCount: 10,
      topics: [
        "Offer, Acceptance & Consideration (Section 2 & 10)",
        "Void & Voidable Agreements (Coercion, Undue Influence, Fraud)",
        "Discharge & Breach of Contract (Sections 73–75)",
        "Specific Performance & Permanent Injunctions (SRA 1963)",
      ],
      bareAct: "Indian Contract Act, 1872 & SRA 1963",
      status: "With Benchmark Case Summaries",
    },
  ];

  // ==============================================================
  // TEACHER WORKSPACE DATA
  // ==============================================================
  const MOOT_COURT_PROBLEMS = [
    {
      id: "moot_01",
      title: "National Constitutional Law Moot 2027",
      theme: "Artificial Intelligence Surveillance vs Fundamental Right to Privacy (Art. 21)",
      caseBench: "Supreme Court of India (5-Judge Constitution Bench)",
      rules: "BCI Model Moot Court Rules 2024",
      downloads: "Proposition PDF • Memorial Evaluation Sheet",
      activeTeams: 18,
    },
    {
      id: "moot_02",
      title: "All-India Criminal Law Trial Advocacy Moot",
      theme: "Forensic Admissibility of Cloud Records under Section 63 Bharatiya Sakshya Adhiniyam (BSA)",
      caseBench: "High Court of Judicature at Delhi",
      rules: "BNS / BNSS / BSA Practice Guidelines",
      downloads: "Fact Pattern • Witness Statements & Charge Sheet",
      activeTeams: 12,
    },
  ];

  const TEACHER_COHORTS = [
    {
      id: "cohort_01",
      name: "CLAT 2027 All-India Morning Cohort",
      enrolledCount: 64,
      avgScore: "78.4 / 120",
      topSubject: "Legal Reasoning",
      nextMock: "Mock 02 — Saturday 10:00 AM",
    },
    {
      id: "cohort_02",
      name: "IGNOU Distance LLB — 1st Year Law of Writs Cohort",
      enrolledCount: 42,
      avgScore: "82% Syllabus Completion",
      topSubject: "Constitutional Articles 32 & 226",
      nextMock: "Assignment 03 Review — Sunday 4:00 PM",
    },
  ];

  // Chamber Internships (Student)
  const CHAMBER_INTERNSHIPS = [
    {
      id: "intern_01",
      advocateName: "Adv. Rajesh Menon",
      chamber: "Senior Standing Counsel, High Court of Kerala",
      location: "Ernakulam / Kochi & Hybrid",
      duration: "4 Weeks (Summer Cohort 2027)",
      stipend: "₹10,000 / month + Court Pass",
      criteria: "Open to CLAT/KLEE Qualifiers & Distance LLB Year 1–3",
      focusArea: "Constitutional Writs, Commercial Arbitration & Land Acquisition",
    },
    {
      id: "intern_02",
      advocateName: "Adv. Priyadarshini Rao & Associates",
      chamber: "Supreme Court & Delhi High Court Chambers",
      location: "New Delhi & Virtual Research",
      duration: "6 Weeks",
      stipend: "₹15,000 / month + Certificate",
      criteria: "Special Consideration for IGNOU / State Distance Law Scholars",
      focusArea: "Criminal Appeals under BNS, Corporate Insolvency (IBC), SLPs",
    },
  ];

  // Actions
  const handleSelectRole = (role: AcademyJourneyRole) => {
    setSelectedRole(role);
    localStorage.setItem("wakheel_academy_role", role);
    if (role === "student") {
      router.push("/student/home");
    } else {
      router.push("/teacher/home");
    }
  };

  const handleStartMockTest = (test: any) => {
    setActiveMockTest(test);
    setSelectedAnswers({});
    setMockScore(null);
  };

  const handleSelectMockAnswer = (qIndex: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex,
    }));
  };

  const handleSubmitMockTest = () => {
    if (!activeMockTest) return;
    let score = 0;
    activeMockTest.sampleQuestions.forEach((q: any, i: number) => {
      if (selectedAnswers[i] === q.correct) {
        score += activeMockTest.id === "klee_2027" ? 3 : 1;
      } else if (selectedAnswers[i] !== undefined) {
        score -= activeMockTest.id === "klee_2027" ? 1 : 0.25;
      }
    });
    setMockScore(score);
  };

  const handleGenerateAiQuestion = () => {
    setAiGenerating(true);
    setAiAnswerSelected(null);
    setTimeout(() => {
      setAiGenerating(false);
      if (aiSubject === "Constitutional Law") {
        setAiGeneratedQuestion({
          principle:
            "Article 19(1)(a) protects freedom of speech and expression subject to reasonable restrictions under Article 19(2) in the interests of public order, decency, or morality. Blanket pre-censorship of political speech without demonstrable imminent danger is unconstitutional.",
          facts:
            "A state police chief issues a general executive directive prohibiting citizens from criticizing newly published highway toll hikes on social media platforms, citing potential breach of peace.",
          question: "Is the executive directive constitutional under Indian jurisprudence?",
          options: [
            "Yes, public order concerns give executive authorities unfettered discretion.",
            "No, peaceful criticism of administrative policies is protected under Art. 19(1)(a) and does not constitute imminent incitement to violence (Shreya Singhal v. UOI).",
            "Yes, highway management falls under sovereign immunity.",
            "No, but only if the social media posts are endorsed by an accredited journalist.",
          ],
          correctIndex: 1,
          rationale:
            "In Shreya Singhal (2015), the Supreme Court struck down Section 66A IT Act, affirming that mere discussion or advocacy of an unpopular cause cannot be restricted under public order.",
        });
      } else {
        setAiGeneratedQuestion({
          principle:
            "Private defense under Section 34 BNS / S.96 IPC justifies causing harm to an assailant only to the extent reasonably necessary to avert imminent bodily danger. The right of self-defense cannot be turned into an act of retaliation after the danger has ceased.",
          facts:
            "A thief broke into Ajay's garage at night and stole a bicycle. When the thief was running away 200 meters down the street, Ajay chased him with a licensed revolver and shot him in the leg.",
          question: "Can Ajay successfully claim the right of private defense?",
          options: [
            "Yes, private defense of property permits shooting fleeing trespassers.",
            "No, because the imminent danger to property and person had already ended when the thief retreated (excess of right).",
            "Yes, because burglary at night grants absolute justification to shoot.",
            "No, private defense never applies if the firearm is licensed.",
          ],
          correctIndex: 1,
          rationale:
            "The right of private defense continues only as long as apprehension of danger to person or property continues. Once the assailant is in flight, shooting constitutes retaliation rather than defense.",
        });
      }
    }, 600);
  };

  const handleFacultySaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setFacultySavedSuccess(true);
    setTimeout(() => {
      setFacultySavedSuccess(false);
      setFacultyPrinciple("");
      setFacultyFact("");
      setFacultyQuestionText("");
    }, 2000);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      setAuthSuccess(true);
      setTimeout(() => {
        setShowSignInModal(false);
        setViewMode("active_workspace");
      }, 700);
    }, 600);
  };

  if (viewMode === "active_workspace" && selectedRole === "student") {
    return (
      <StudentDashboardView
        onSwitchToTeacher={() => setSelectedRole("teacher")}
        onSignOut={handleSignOut}
      />
    );
  }

  if (viewMode === "active_workspace" && selectedRole === "teacher") {
    return (
      <TeacherDashboardView
        onSwitchToStudent={() => setSelectedRole("student")}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black text-[#111827] dark:text-white flex flex-col font-sans transition-colors duration-200">
      {/* ============================================================== */}
      {/* TOP HEADER                                                     */}
      {/* ============================================================== */}
      <header className="w-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo on Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode("journey_selection")}
              className="flex items-center gap-2.5 cursor-pointer group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-black font-extrabold shadow-sm group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-black" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  WAKHEEL <span className="text-amber-500">ACADEMY</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase block -mt-1 font-mono">
                  Student &amp; Faculty Platform
                </span>
              </div>
            </button>
          </div>

          {/* Right Header Navigation */}
          <div className="flex items-center gap-3">
            {viewMode === "active_workspace" ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole(selectedRole === "student" ? "teacher" : "student")}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 cursor-pointer transition-all flex items-center gap-1.5"
                >
                  {selectedRole === "student" ? <BookOpen className="w-3.5 h-3.5 text-blue-500" /> : <GraduationCap className="w-3.5 h-3.5 text-amber-500" />}
                  <span>Switch to {selectedRole === "student" ? "Teacher View" : "Student View"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("journey_selection")}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Roles</span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-950 bg-red-50 dark:bg-red-950/30 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 cursor-pointer transition-all"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/academy/auth"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-white hover:text-black text-black text-xs font-bold transition-all shadow-sm border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                >
                  Sign In / Register
                </Link>
              </div>
            )}

            <Link
              href="/login"
              className="hidden md:inline-flex text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              Wakheel Litigation →
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* SIGN IN MODAL                                                  */}
      {/* ============================================================== */}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowSignInModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Sign In to Wakheel Academy
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Access your law entrance mocks, coursework, and faculty workspace.
              </p>
            </div>

            {authSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs text-center font-bold flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>Signed in successfully! Launching your workspace...</span>
              </div>
            ) : (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="student@law.edu or faculty@law.edu"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {authLoading ? "Authenticating..." : "Sign In & Enter Academy"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCREEN 1: REDESIGNED STUDENT & TEACHER SELECTION               */}
      {/* ============================================================== */}
      {viewMode === "journey_selection" && (
        <main className="flex-1 flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full animate-in fade-in duration-200">
          {/* Hero Heading */}
          <div className="w-full text-center space-y-4 mb-14">
            <div className="inline-flex items-center justify-center">
              <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest font-mono">
                WAKHEEL ACADEMY • SELECT YOUR ROLE
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Where Future Advocates Learn.<br className="hidden sm:inline" />
              Where Law Faculty Teach.
            </h1>

            <p className="text-sm sm:text-base font-medium text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              An independent legal education platform built for law students, entrance exam aspirants, and faculty educators.
            </p>
          </div>

          {/* TWO REDESIGNED SPLIT HERO CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
            {/* CARD 1: STUDENT */}
            <div
              onClick={() => handleSelectRole("student")}
              className="p-8 sm:p-9 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 hover:border-white/80 dark:hover:border-white/80 hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden text-left"
            >
              <div className="space-y-6">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 group-hover:border-white/40 group-hover:text-black dark:group-hover:text-white transition-colors">
                    ACADEMIC &amp; EXAM PREP
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">
                    Student Hub
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
                    Designed for CLAT &amp; KLEE aspirants, LL.B undergraduates, and IGNOU/State open university distance law scholars.
                  </p>
                </div>

                {/* Features checklist */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>CLAT 2027 &amp; KLEE CBT Simulators</strong> with negative marking</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Open University Syllabi &amp; Bare Acts</strong> (BNS, CPC, Constitution)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Gemini AI Legal Reasoning Tutor</strong> with judicial rationale</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Advocate Chamber Internships</strong> with Bar Council mentors</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <button
                  type="button"
                  className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 group-hover:bg-white group-hover:text-black text-black text-xs font-extrabold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 border border-transparent group-hover:border-zinc-300 dark:group-hover:border-zinc-700"
                >
                  <span>Launch Student Hub</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* CARD 2: TEACHER */}
            <div
              onClick={() => handleSelectRole("teacher")}
              className="p-8 sm:p-9 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 hover:border-white/80 dark:hover:border-white/80 hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden text-left"
            >
              <div className="space-y-6">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500 transition-all">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    FACULTY &amp; PEDAGOGY
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    Faculty Studio
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
                    Specialized pedagogical workspace for law professors, entrance exam mentors, and moot court adjudicators.
                  </p>
                </div>

                {/* Features checklist */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>14-Week Law Semester Curriculum</strong> &amp; weekly lesson planner</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Moot Court Problem Creator</strong> &amp; BCI memorial scoring rubrics</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Exam Authoring Studio</strong> with AI legal problem synthesizer</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Student Cohort Analytics</strong>, scoreboards &amp; velocity tracking</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <button
                  type="button"
                  className="w-full py-3.5 px-5 rounded-2xl bg-black group-hover:bg-amber-500 group-hover:text-black text-white dark:bg-zinc-800 dark:group-hover:bg-amber-500 dark:group-hover:text-black text-xs font-extrabold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Launch Faculty Studio</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Trust Ribbon */}
          <div className="w-full max-w-4xl mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
              <span className="text-xl font-black text-amber-500 font-mono block">3 Full CBTs</span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">CLAT, KLEE &amp; AILET</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
              <span className="text-xl font-black text-blue-500 font-mono block">100% Free</span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">Updated Bare Acts &amp; Notes</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
              <span className="text-xl font-black text-emerald-500 font-mono block">Gemini AI</span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">Principle-Fact Simulator</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
              <span className="text-xl font-black text-purple-500 font-mono block">Bar Council</span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">Chamber Clerkship Direct</span>
            </div>
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* SCREEN 2: ACTIVE WORKSPACE (STUDENT OR TEACHER)                */}
      {/* ============================================================== */}
      {viewMode === "active_workspace" && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150">
          {/* Top Banner with Role Pill */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-zinc-900 to-black text-white border border-zinc-800 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Active View: {selectedRole.toUpperCase()}</span>
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {selectedRole === "student"
                      ? `Enrolled: ${profile.targetExam || "CLAT 2027 & Open University Law"}`
                      : "Faculty Lead • Law Curriculum & Moot Pedagogy"}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {selectedRole === "student"
                    ? "Law Student & Entrance Aspirant Workspace"
                    : "Law Faculty & Educator Studio"}
                </h1>

                <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                  {selectedRole === "student"
                    ? "Take full-length AI mock tests for CLAT, KLEE, and AILET, study Open University distance modules with updated bare acts, and secure direct internships with verified Bar Council advocates."
                    : "Plan law syllabi, author timed entrance mock questions with AI assistance, coordinate moot court competitions, and monitor student cohort performances."}
                </p>
              </div>

              {/* Quick Actions & Role Switcher */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedRole(selectedRole === "student" ? "teacher" : "student")}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {selectedRole === "student" ? <BookOpen className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                  <span>Switch to {selectedRole === "student" ? "Teacher View" : "Student View"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("journey_selection")}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Roles</span>
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* ROLE WORKSPACE A: STUDENT WORKSPACE                            */}
          {/* ============================================================== */}
          {selectedRole === "student" && (
            <div className="space-y-6">
              {/* Navigation Tabs for Student */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setStudentTab("entrance")}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    studentTab === "entrance"
                      ? "bg-amber-500 text-black shadow-md"
                      : "text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Law Entrance Exam Series (CLAT &amp; KLEE)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudentTab("open_university")}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    studentTab === "open_university"
                      ? "bg-amber-500 text-black shadow-md"
                      : "text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open University Distance Syllabi &amp; Bare Acts</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudentTab("ai_tutor")}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    studentTab === "ai_tutor"
                      ? "bg-amber-500 text-black shadow-md"
                      : "text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Gemini AI Legal Reasoning Tutor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudentTab("internships")}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    studentTab === "internships"
                      ? "bg-amber-500 text-black shadow-md"
                      : "text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Advocate Chamber Internships</span>
                </button>
              </div>

              {/* TAB 1: LAW ENTRANCE TEST SERIES */}
              {studentTab === "entrance" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        All-India Law Entrance Mock Examinations
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Timed computer-based test series modeled on official Consortium of NLUs and CEE Kerala patterns.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-mono">
                        3 Full Mocks Ready
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {ENTRANCE_EXAMS.map((exam) => (
                      <div
                        key={exam.id}
                        className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 flex flex-col justify-between gap-5 hover:shadow-lg transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              {exam.code}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{exam.durationMinutes} Mins</span>
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                            {exam.name}
                          </h4>

                          <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">
                            {exam.conductingBody}
                          </p>

                          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                            <div className="flex items-center justify-between text-[11px]">
                              <span>Questions:</span>
                              <span className="font-bold text-slate-900 dark:text-white font-mono">{exam.questionsCount}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span>Marking Scheme:</span>
                              <span className="font-semibold text-slate-900 dark:text-white">{exam.markingScheme}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {exam.subjects.map((sub) => (
                              <span
                                key={sub}
                                className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleStartMockTest(exam)}
                          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Launch Interactive Test Simulator</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* ACTIVE MOCK TEST MODAL / INTERFACE */}
                  {activeMockTest && (
                    <div className="p-6 sm:p-8 rounded-3xl border-2 border-amber-500/50 bg-white dark:bg-zinc-900 shadow-2xl space-y-6 animate-in fade-in duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800 gap-3">
                        <div>
                          <span className="text-[10px] font-bold font-mono text-amber-600 uppercase">
                            Active CBT Examination Environment
                          </span>
                          <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                            {activeMockTest.name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 font-mono text-xs font-bold flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>118:42 REMAINING</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveMockTest(null)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800"
                          >
                            Exit Test
                          </button>
                        </div>
                      </div>

                      {/* Sample Questions */}
                      <div className="space-y-6">
                        {activeMockTest.sampleQuestions.map((qItem: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 space-y-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                                Q{idx + 1}
                              </span>
                              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-relaxed flex-1">
                                {qItem.q}
                              </p>
                            </div>

                            <div className="space-y-2 pl-0 sm:pl-10">
                              {qItem.options.map((optionText: string, optIdx: number) => {
                                const isSelected = selectedAnswers[idx] === optIdx;
                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => handleSelectMockAnswer(idx, optIdx)}
                                    className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition cursor-pointer flex items-center gap-3 ${
                                      isSelected
                                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold"
                                        : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                                    }`}
                                  >
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                      isSelected
                                        ? "bg-amber-500 text-black font-bold"
                                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                                    }`}>
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span>{optionText}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Submission and Result */}
                      <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-200 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={handleSubmitMockTest}
                          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
                        >
                          Submit Mock Exam &amp; Calculate Final Score
                        </button>

                        {mockScore !== null && (
                          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                                Calculated Raw Score: {mockScore > 0 ? `+${mockScore}` : mockScore} Marks
                              </span>
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                                Evaluated using official {activeMockTest.markingScheme}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: OPEN UNIVERSITY SYLLABI & BARE ACTS */}
              {studentTab === "open_university" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Open University Distance Law Curriculum &amp; Bare Acts
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Standardized curriculum tracks for IGNOU School of Law, State Open Universities, and Distance LLB candidates.
                      </p>
                    </div>

                    <div className="px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold font-mono">
                      100% Free Open Legal Education
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {OPEN_UNIV_MODULES.map((mod) => (
                      <div
                        key={mod.code}
                        className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            {mod.code}
                          </span>
                          <span className="text-xs font-mono text-slate-400">{mod.semester}</span>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">{mod.title}</h4>
                          <span className="text-xs text-slate-500 dark:text-zinc-400 block mt-0.5">{mod.university}</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
                            Core Syllabus Units &amp; Case Laws
                          </span>
                          <ul className="text-xs space-y-1 text-slate-700 dark:text-zinc-300 list-disc pl-4">
                            {mod.topics.map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                            <FileText className="w-3.5 h-3.5" />
                            <span>Bare Act: {mod.bareAct}</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: GEMINI AI LEGAL REASONING TUTOR */}
              {studentTab === "ai_tutor" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <span>Gemini Legal Reasoning Simulator</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Dynamic Legal Principle &amp; Fact-Pattern problem generator for entrance examinations and courtroom reasoning.
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Target Area:</span>
                        <select
                          value={aiSubject}
                          onChange={(e) => setAiSubject(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold cursor-pointer outline-none"
                        >
                          <option value="Constitutional Law">Constitutional Law (Fundamental Rights &amp; Writs)</option>
                          <option value="Criminal Law (BNS/IPC)">Criminal Law (BNS General Exceptions &amp; Offenses)</option>
                          <option value="Law of Torts">Law of Torts (Negligence &amp; Defamation)</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        disabled={aiGenerating}
                        onClick={handleGenerateAiQuestion}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{aiGenerating ? "Synthesizing Legal Scenario..." : "Generate New AI Problem"}</span>
                      </button>
                    </div>

                    {aiGeneratedQuestion && (
                      <div className="space-y-5 p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700/60">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 font-mono">
                            Legal Principle
                          </span>
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                            {aiGeneratedQuestion.principle}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 font-mono">
                            Factual Matrix
                          </span>
                          <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                            {aiGeneratedQuestion.facts}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">
                            Question: {aiGeneratedQuestion.question}
                          </span>

                          <div className="space-y-2">
                            {aiGeneratedQuestion.options.map((opt: string, i: number) => {
                              const isSelected = aiAnswerSelected === i;
                              const isCorrect = i === aiGeneratedQuestion.correctIndex;
                              const showFeedback = aiAnswerSelected !== null;

                              let btnStyle = "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200";
                              if (showFeedback) {
                                if (isCorrect) {
                                  btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold";
                                } else if (isSelected) {
                                  btnStyle = "border-red-500 bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-red-200 font-bold";
                                }
                              }

                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setAiAnswerSelected(i)}
                                  className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${btnStyle}`}
                                >
                                  <span>{opt}</span>
                                  {showFeedback && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                                </button>
                              );
                            })}
                          </div>

                          {aiAnswerSelected !== null && (
                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-1 mt-3">
                              <span className="font-bold text-amber-900 dark:text-amber-200 block">
                                Judicial Rationale &amp; Precedent:
                              </span>
                              <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                                {aiGeneratedQuestion.rationale}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: ADVOCATE CHAMBER INTERNSHIPS */}
              {studentTab === "internships" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Advocate Chamber Clerkship &amp; Summer Internships
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Direct verified internship openings with Bar Council enrolled advocates across High Courts and Supreme Court of India.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {CHAMBER_INTERNSHIPS.map((intern) => (
                      <div
                        key={intern.id}
                        className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                              {intern.duration}
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {intern.stipend}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 dark:text-white">{intern.advocateName}</h4>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">{intern.chamber} • {intern.location}</p>

                          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 text-xs space-y-1">
                            <span className="font-bold text-slate-700 dark:text-zinc-300 block">Eligibility:</span>
                            <p className="text-slate-600 dark:text-zinc-400">{intern.criteria}</p>
                            <span className="font-bold text-slate-700 dark:text-zinc-300 block pt-1">Practice Areas:</span>
                            <p className="text-slate-600 dark:text-zinc-400">{intern.focusArea}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => alert(`Your student dossier and CLAT/Open University credentials have been forwarded to ${intern.advocateName}'s chamber!`)}
                          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>Apply for Chamber Internship</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* ROLE WORKSPACE B: TEACHER WORKSPACE                            */}
          {/* ============================================================== */}
          {selectedRole === "teacher" && (
            <div className="space-y-6">
              {/* Navigation Tabs for Teacher */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setTeacherTab("curriculum")}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    teacherTab === "curriculum"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Syllabus &amp; Bare Act Builder</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTeacherTab("moot_court")}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    teacherTab === "moot_court"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Moot Court &amp; Trial Studio</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTeacherTab("test_creator")}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    teacherTab === "test_creator"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <PenTool className="w-4 h-4" />
                  <span>Exam Authoring &amp; AI Question Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTeacherTab("cohorts")}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    teacherTab === "cohorts"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Student Cohorts &amp; Mock Analytics</span>
                </button>
              </div>

              {/* TEACHER TAB 1: CURRICULUM */}
              {teacherTab === "curriculum" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Law Curriculum &amp; Bare Act Lesson Planner
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Create standardized course plans and syllabus tracks for open university and law college students.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert("New curriculum track created!")}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Syllabus Track</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {OPEN_UNIV_MODULES.map((mod) => (
                      <div
                        key={mod.code}
                        className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                            {mod.code}
                          </span>
                          <span className="text-xs font-mono text-slate-400">{mod.unitsCount} Teaching Units</span>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">{mod.title}</h4>
                          <span className="text-xs text-slate-500 dark:text-zinc-400 block mt-0.5">Faculty Lead • {mod.university}</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
                            Lesson Breakdown &amp; Lecture Notes
                          </span>
                          <ul className="text-xs space-y-1 text-slate-700 dark:text-zinc-300 list-disc pl-4">
                            {mod.topics.map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600 dark:text-zinc-400">
                            Bare Act: {mod.bareAct}
                          </span>
                          <button
                            type="button"
                            onClick={() => alert(`Opening curriculum editor for ${mod.code}`)}
                            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                          >
                            Edit Curriculum →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TEACHER TAB 2: MOOT COURT STUDIO */}
              {teacherTab === "moot_court" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Moot Court Problem Creator &amp; Evaluation Bench
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Design appellate propositions, scoring rubrics, and judge student team memorials.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert("New moot court proposition created!")}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Draft New Proposition</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {MOOT_COURT_PROBLEMS.map((moot) => (
                      <div
                        key={moot.id}
                        className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                              {moot.caseBench}
                            </span>
                            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                              {moot.activeTeams} Participating Teams
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 dark:text-white">{moot.title}</h4>
                          <p className="text-xs text-slate-600 dark:text-zinc-300">{moot.theme}</p>

                          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 text-xs space-y-1">
                            <span className="font-bold text-slate-700 dark:text-zinc-300 block">Assessment Framework:</span>
                            <p className="text-slate-600 dark:text-zinc-400">{moot.rules}</p>
                            <span className="font-bold text-slate-700 dark:text-zinc-300 block pt-1">Resources:</span>
                            <p className="text-slate-600 dark:text-zinc-400">{moot.downloads}</p>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => alert(`Viewing memorials for ${moot.title}`)}
                            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold transition"
                          >
                            Grade Memorials
                          </button>
                          <button
                            type="button"
                            onClick={() => alert(`Opening live courtroom timer for ${moot.title}`)}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold"
                          >
                            Court Timer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TEACHER TAB 3: TEST CREATOR & QUESTION BANK */}
              {teacherTab === "test_creator" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Exam Authoring &amp; AI Legal Question Studio
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Draft CLAT / KLEE standard principle-fact questions or generate them with Gemini AI to publish to student mock series.
                    </p>
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-5">
                    {facultySavedSuccess && (
                      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Question published successfully to the Student Mock Examination pool!</span>
                      </div>
                    )}

                    <form onSubmit={handleFacultySaveQuestion} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                            Subject / Exam Target
                          </label>
                          <select
                            value={facultyQuestionSubject}
                            onChange={(e) => setFacultyQuestionSubject(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black text-xs font-medium outline-none focus:border-blue-500"
                          >
                            <option value="Criminal Law (BNS)">Criminal Law: Bharatiya Nyaya Sanhita (BNS)</option>
                            <option value="Constitutional Law">Constitutional Law &amp; Fundamental Writs</option>
                            <option value="Law of Contracts">Contract Law &amp; Specific Relief Act</option>
                            <option value="Civil Procedure Code">Civil Procedure Code (Order VI, VII, VIII)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                            Question Weightage
                          </label>
                          <input
                            type="text"
                            defaultValue="+1 correct / -0.25 negative (Standard CLAT)"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black text-xs font-medium outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Legal Principle / Bare Act Section
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={facultyPrinciple}
                          onChange={(e) => setFacultyPrinciple(e.target.value)}
                          placeholder="e.g. Under Section 10 of Indian Contract Act, all agreements are contracts if made by free consent of parties competent to contract..."
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black text-xs outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Factual Matrix / Case Scenario
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={facultyFact}
                          onChange={(e) => setFacultyFact(e.target.value)}
                          placeholder="Describe the factual dispute between parties..."
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black text-xs outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Question Prompt &amp; Options
                        </label>
                        <input
                          type="text"
                          required
                          value={facultyQuestionText}
                          onChange={(e) => setFacultyQuestionText(e.target.value)}
                          placeholder="Is the agreement enforceable in the Court of Law?"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black text-xs outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setFacultyPrinciple("Section 73 Indian Contract Act: Compensation for breach is confined to natural consequences.");
                            setFacultyFact("A supplier fails to deliver court robes on time, leading to advocate missing an un-adjournable hearing.");
                            setFacultyQuestionText("Can the advocate recover punitive damages without prior notification?");
                          }}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800"
                        >
                          Auto-Fill Sample
                        </button>

                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-md"
                        >
                          Publish to Student Mock Pool
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TEACHER TAB 4: COHORTS & ANALYTICS */}
              {teacherTab === "cohorts" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Student Cohorts &amp; Mock Test Performance
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Monitor active student batches, average scores, and syllabus completion velocity.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert("New student cohort invite link generated!")}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Invite Students to Cohort</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {TEACHER_COHORTS.map((c) => (
                      <div
                        key={c.id}
                        className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                            {c.enrolledCount} Active Scholars
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            Avg: {c.avgScore}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">{c.name}</h4>
                          <span className="text-xs text-slate-500 dark:text-zinc-400 block mt-0.5">Top Area: {c.topSubject}</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 text-xs">
                          <span className="font-bold text-slate-700 dark:text-zinc-300 block">Upcoming Milestone:</span>
                          <p className="text-slate-600 dark:text-zinc-400 mt-0.5">{c.nextMock}</p>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => alert(`Exporting analytics for ${c.name}`)}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View Full Scoreboard →
                          </button>
                          <span className="text-[10px] text-slate-400 font-mono">Live Sync Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* ============================================================== */}
      {/* FOOTER                                                         */}
      {/* ============================================================== */}
      <footer className="w-full bg-white dark:bg-zinc-950 border-t border-slate-200/80 dark:border-zinc-800 py-6 px-6 text-center text-xs text-slate-500 dark:text-zinc-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 Wakheel Academy. All rights reserved.</span>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Wakheel Main Platform
            </Link>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Litigation Login
            </Link>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <button
              onClick={() => setViewMode("journey_selection")}
              className="text-amber-500 font-bold hover:underline cursor-pointer"
            >
              Select Role
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
