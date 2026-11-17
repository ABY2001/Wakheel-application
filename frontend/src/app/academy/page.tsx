"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Award,
  BookOpen,
  Scale,
  Sparkles,
  CheckCircle2,
  Clock,
  FileText,
  Briefcase,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
  Check,
  AlertCircle,
  Play,
  RotateCcw,
  User,
  ShieldCheck,
  Building2,
  Calendar,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandLogo } from "@/components/BrandLogo";

interface StudentProfile {
  id?: string;
  fullName?: string;
  email?: string;
  username?: string;
  role?: string;
  academyGoal?: "entrance_coaching" | "open_university" | "llb_student" | "faculty";
  targetExam?: string;
  universityName?: string;
}

export default function AcademyPage() {
  const [student, setStudent] = useState<StudentProfile>({
    fullName: "Advithya Sharma",
    email: "advithya.sharma@law.edu",
    academyGoal: "entrance_coaching",
    targetExam: "CLAT 2027 (Common Law Admission Test)",
    universityName: "National Law University Aspirant",
  });

  const [activeTab, setActiveTab] = useState<
    "entrance" | "open_university" | "ai_tutor" | "internships"
  >("entrance");

  // Mock Test Simulator State
  const [activeMockTest, setActiveMockTest] = useState<any | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [mockScore, setMockScore] = useState<number | null>(null);

  // AI Legal Reasoning Generator State
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

  useEffect(() => {
    try {
      const storedStudent = localStorage.getItem("wakheel_academy_student");
      const storedUser = localStorage.getItem("wakheel_user");
      if (storedStudent) {
        setStudent((prev) => ({ ...prev, ...JSON.parse(storedStudent) }));
      } else if (storedUser) {
        const u = JSON.parse(storedUser);
        setStudent((prev) => ({
          ...prev,
          fullName: u.fullName || u.name || "Law Scholar",
          email: u.email || "",
          academyGoal: u.academyGoal || "entrance_coaching",
        }));
      }
    } catch {}
  }, []);

  // Entrance Exam Data
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

  // Open University Curriculum Tracks
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

  // Advocates Offering Internships & Mentorship
  const MENTOR_ADVOCATES = [
    {
      name: "Adv. Gopakumar Nambiar",
      barCouncil: "K/001429/2012",
      court: "High Court of Kerala (Ernakulam)",
      chambers: "Nambiar Law Chambers, Marine Drive, Kochi",
      practiceAreas: ["Constitutional Writs", "Public Law", "Civil Appeals"],
      internshipSlot: "Open for 2 Open Univ / Law Entrance Interns (Jan–Mar 2027)",
      stipend: "Performance-Based + Court Filing Exposure",
    },
    {
      name: "Adv. Devika R. Pillai",
      barCouncil: "K/002381/2016",
      court: "High Court of Kerala & NCLT Kochi Bench",
      chambers: "Pillai & Associates, Banerjee Road, Ernakulam",
      practiceAreas: ["Commercial Arbitration", "Corporate & IPR"],
      internshipSlot: "Virtual Research Clerkship for Distance Law Scholars",
      stipend: "Virtual Certificate + Practical Drafting Mentorship",
    },
    {
      name: "Adv. Suresh Kumar Menon",
      barCouncil: "K/000984/2008",
      court: "High Court of Kerala & District Courts",
      chambers: "Menon Criminal Defense Chamber, Vanchi Square",
      practiceAreas: ["Bail & Criminal Trial", "BNSS/CrPC Procedure"],
      internshipSlot: "Bail Petition Drafting & Court Trial Observation",
      stipend: "Full Chamber Access & Cause List Briefing",
    },
  ];

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
      } else if (aiSubject === "Criminal Law (BNS/IPC)") {
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
      } else {
        setAiGeneratedQuestion({
          principle:
            "Under the law of Torts, Res Ipsa Loquitur (the thing speaks for itself) applies when an accident occurs that ordinarily does not happen without negligence, and the instrumentality was under the exclusive management of the defendant.",
          facts:
            "A pedestrian walking under an elevated hospital building is injured when a surgical scissor falls from an open upper-floor operating theater window onto their shoulder.",
          question: "Does the pedestrian have to prove specific surgical negligence?",
          options: [
            "Yes, the plaintiff must always produce eyewitness medical testimony.",
            "No, the doctrine of Res Ipsa Loquitur shifts the burden to the hospital to demonstrate absence of negligence.",
            "Yes, sovereign medical immunity protects hospitals from tort liability.",
            "No, the municipal corporation alone is strictly liable for roadside falling objects.",
          ],
          correctIndex: 1,
          rationale:
            "Surgical instruments do not fall out of windows in the ordinary course of prudent management. Res Ipsa Loquitur applies directly.",
        });
      }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <BrandLogo className="w-7 h-7" />
              <span className="font-extrabold text-base tracking-tight text-black dark:text-white">
                wakheel
              </span>
            </Link>

            <span className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />

            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold font-mono">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>ACADEMY</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hidden sm:block"
            >
              Sign In with Another Role
            </Link>

            <Link
              href="/client-portal"
              className="px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Citizen Portal</span>
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Student Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-black text-white border border-zinc-800 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Law Student &amp; Entrance Aspirant Workspace</span>
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  Active Enrollment: {student.targetExam || student.universityName || "CLAT & Open University Law"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Welcome, {student.fullName || "Law Scholar"}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                Your integrated legal learning platform. Take full-length AI mock tests for <strong>CLAT</strong>, <strong>KLEE</strong>, and <strong>AILET</strong>, track <strong>Open University (IGNOU / State)</strong> distance syllabi with bare acts, and secure direct internships with verified Bar Council advocates.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono block">120+</span>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Mock Exams</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono block">100%</span>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Bare Acts Free</span>
              </div>
            </div>
          </div>

          {/* Standalone Backend Bridge Banner */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>
                Dedicated Academy Backend running on <code className="bg-zinc-800 px-1.5 py-0.5 rounded font-mono text-amber-300">http://localhost:5001</code> with standalone database isolation.
              </span>
            </div>
            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:bg-zinc-200 transition flex items-center gap-1.5 w-fit shrink-0"
            >
              <span>Open EduPye Standalone UI</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("entrance")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "entrance"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Law Entrance Test Series (CLAT &amp; KLEE)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("open_university")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "open_university"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>Open University Legal Curriculum (IGNOU / State)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai_tutor")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "ai_tutor"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Gemini AI Legal Reasoning Tutor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("internships")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "internships"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Briefcase className="w-4 h-4 text-blue-500" />
            <span>Advocate Chamber Internships</span>
          </button>
        </div>

        {/* TAB 1: LAW ENTRANCE TEST SERIES */}
        {activeTab === "entrance" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  All-India Law Entrance Mock Examinations
                </h3>
                <p className="text-xs text-zinc-500">
                  Timed test series modeled on official Consortium of NLUs and CEE Kerala patterns.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-mono">
                  3 Full Mocks Ready
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {ENTRANCE_EXAMS.map((exam) => (
                <div
                  key={exam.id}
                  className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 flex flex-col justify-between gap-5 hover:shadow-lg transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        {exam.code}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{exam.durationMinutes} Mins</span>
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-black dark:text-white leading-snug">
                      {exam.name}
                    </h4>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {exam.conductingBody}
                    </p>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Questions:</span>
                        <span className="font-bold text-black dark:text-white font-mono">{exam.questionsCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Marking Scheme:</span>
                        <span className="font-semibold text-black dark:text-white">{exam.markingScheme}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {exam.subjects.map((sub) => (
                        <span
                          key={sub}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartMockTest(exam)}
                    className="w-full py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch Interactive Test Simulator</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Interactive Mock Test Simulator Modal */}
            {activeMockTest && (
              <div className="p-6 sm:p-8 rounded-3xl border-2 border-amber-500/40 bg-zinc-50 dark:bg-zinc-950 space-y-6 animate-in fade-in duration-300">
                <div className="flex items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] font-bold font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                      SIMULATOR MODE • {activeMockTest.code}
                    </span>
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      {activeMockTest.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveMockTest(null)}
                    className="px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Close Simulator
                  </button>
                </div>

                <div className="space-y-6">
                  {activeMockTest.sampleQuestions.map((qObj: any, qIdx: number) => (
                    <div
                      key={qIdx}
                      className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-mono text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                          Question {qIdx + 1} of {activeMockTest.sampleQuestions.length}
                        </span>
                        {mockScore !== null && (
                          <span
                            className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                              selectedAnswers[qIdx] === qObj.correct
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                            }`}
                          >
                            {selectedAnswers[qIdx] === qObj.correct
                              ? "Correct"
                              : "Incorrect (Key: Option " + (qObj.correct + 1) + ")"}
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm font-medium text-black dark:text-white leading-relaxed">
                        {qObj.q}
                      </p>

                      <div className="space-y-2">
                        {qObj.options.map((opt: string, optIdx: number) => {
                          const isSelected = selectedAnswers[qIdx] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectMockAnswer(qIdx, optIdx)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? "border-black dark:border-white bg-zinc-100 dark:bg-zinc-800 font-bold text-black dark:text-white ring-1 ring-black dark:ring-white"
                                  : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300"
                              }`}
                            >
                              <span>
                                <span className="font-mono mr-2 font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                                {opt}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500 font-mono">
                    {Object.keys(selectedAnswers).length} of {activeMockTest.sampleQuestions.length} Answered
                  </span>

                  <div className="flex items-center gap-3">
                    {mockScore !== null && (
                      <span className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                        Score: {mockScore > 0 ? `+${mockScore}` : mockScore} Marks
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleSubmitMockTest}
                      className="px-6 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 transition cursor-pointer shadow-sm"
                    >
                      {mockScore !== null ? "Re-evaluate Score" : "Submit & Calculate Score"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OPEN UNIVERSITY LEGAL CURRICULUM */}
        {activeTab === "open_university" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Open University Distance Law Curriculum Hub
                </h3>
                <p className="text-xs text-zinc-500">
                  Structured syllabus trackers, chapter summaries, and bare acts for IGNOU &amp; State Open University distance law programs.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Official UGC / BCI Compliant Modules
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {OPEN_UNIV_MODULES.map((mod) => (
                <div
                  key={mod.code}
                  className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-4 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {mod.code}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {mod.semester}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-black dark:text-white">
                      {mod.title}
                    </h4>
                    <p className="text-xs text-zinc-500">{mod.university}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                      CORE SYLLABUS TOPICS
                    </span>
                    <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {mod.topics.map((t, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-zinc-500">
                      Bare Act: <strong className="text-black dark:text-white">{mod.bareAct}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => alert(`Opening ${mod.title} study reader and notes!`)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-black dark:text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Study Module</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: GEMINI AI LEGAL REASONING TUTOR */}
        {activeTab === "ai_tutor" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Gemini AI Legal Reasoning Question Generator &amp; Tutor
                </h3>
                <p className="text-xs text-zinc-500">
                  Powered by Gemini 2.5 Flash. Generates principle-and-fact caselets to master legal reasoning and precedent application.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-black dark:text-white"
                >
                  <option value="Constitutional Law">Constitutional Law</option>
                  <option value="Criminal Law (BNS/IPC)">Criminal Law (BNS/IPC)</option>
                  <option value="Law of Torts">Law of Torts</option>
                  <option value="Contract Law">Contract Law</option>
                </select>

                <button
                  type="button"
                  disabled={aiGenerating}
                  onClick={handleGenerateAiQuestion}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${aiGenerating ? "animate-spin" : ""}`} />
                  <span>{aiGenerating ? "Synthesizing Caselet..." : "Generate New Caselet"}</span>
                </button>
              </div>
            </div>

            {aiGeneratedQuestion && (
              <div className="p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-purple-50/20 dark:bg-purple-950/20 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 font-mono">
                    SUBJECT: {aiSubject.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    CLAT / KLEE Legal Aptitude Format
                  </span>
                </div>

                {/* Principle Box */}
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 font-mono">
                    LEGAL PRINCIPLE
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-serif">
                    &ldquo;{aiGeneratedQuestion.principle}&rdquo;
                  </p>
                </div>

                {/* Fact Situation */}
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
                    FACTUAL SITUATION
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                    {aiGeneratedQuestion.facts}
                  </p>
                </div>

                {/* Question */}
                <h4 className="text-sm font-bold text-black dark:text-white pt-2">
                  {aiGeneratedQuestion.question}
                </h4>

                {/* Options */}
                <div className="space-y-2">
                  {aiGeneratedQuestion.options.map((opt: string, i: number) => {
                    const isSelected = aiAnswerSelected === i;
                    const isCorrect = i === aiGeneratedQuestion.correctIndex;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAiAnswerSelected(i)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? isCorrect
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-bold ring-1 ring-emerald-500"
                              : "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-100 font-bold ring-1 ring-red-500"
                            : "border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 bg-white/60 dark:bg-zinc-900/60"
                        }`}
                      >
                        <span>
                          <span className="font-mono mr-2 font-bold">{String.fromCharCode(65 + i)}.</span>
                          {opt}
                        </span>
                        {isSelected && (
                          <span className="font-mono font-bold text-[11px] ml-2 shrink-0">
                            {isCorrect ? "✓ Correct Answer" : "✗ Incorrect"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* AI Rationale Reveal */}
                {aiAnswerSelected !== null && (
                  <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1 animate-in fade-in duration-200">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono block">
                      LEGAL PRECEDENT &amp; RATIONALE
                    </span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {aiGeneratedQuestion.rationale}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ADVOCATE CHAMBER INTERNSHIPS & MENTORSHIP */}
        {activeTab === "internships" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Direct Advocate Chamber Internships &amp; Mentorship
                </h3>
                <p className="text-xs text-zinc-500">
                  Bridging law entrance scholars and open university distance students directly with verified High Court advocates on Wakheel.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                Advocates Act Compliant Clerkships
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {MENTOR_ADVOCATES.map((adv, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 flex flex-col justify-between gap-5 hover:shadow-lg transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center shrink-0">
                        {adv.name.replace("Adv.", "").trim().slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-black dark:text-white">
                          {adv.name}
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Bar Roll: {adv.barCouncil}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-zinc-500">
                      <p className="font-medium text-black dark:text-white">{adv.court}</p>
                      <p className="text-[11px]">{adv.chambers}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase font-mono block">
                        CLERKSHIP OFFERING
                      </span>
                      <p className="text-xs font-semibold text-black dark:text-white">
                        {adv.internshipSlot}
                      </p>
                      <span className="text-[10px] text-zinc-400 block pt-1">
                        {adv.stipend}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {adv.practiceAreas.map((pa) => (
                        <span
                          key={pa}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        >
                          {pa}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        `Your student application for ${adv.internshipSlot} has been submitted to ${adv.name}'s chamber registry!`
                      )
                    }
                    className="w-full py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Apply for Clerkship / Mentorship</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 bg-white dark:bg-zinc-950 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span>© 2026 Wakheel Academy • A Division of Inworth Legal Technologies</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-black dark:hover:text-white">
              Back to Wakheel Portal
            </Link>
            <span>•</span>
            <span className="font-mono text-zinc-400">EduPye Academic Core Integration</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
