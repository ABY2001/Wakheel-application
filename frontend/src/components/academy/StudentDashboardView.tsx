"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Award,
  Sparkles,
  Clock,
  Search,
  Flame,
  ArrowRight,
  Play,
  User,
  LogOut,
  X,
  Send,
  Star,
  Users,
  Check,
  Tag,
  CreditCard,
  Unlock,
  Video,
  PhoneCall,
  Menu,
  Home,
  Library,
  Tv,
  TrendingUp,
  Calendar,
  Scale,
  Trophy,
  CheckSquare,
  UserCheck,
  Briefcase,
  Layers,
  AlignLeft,
  ChevronRight,
  FileText,
  Building2,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  Bookmark,
  CheckCircle2,
  Volume2,
  Maximize2,
  Minimize2,
  Copy,
  Trash2,
  FileDown,
  HelpCircle,
  Bot,
  Share2,
  RotateCcw,
  BadgeCheck,
  Plus,
  Mic,
  Brain,
  History,
  Gamepad2,
  PenTool,
  MessageSquare,
  BarChart2,
  Target,
  Presentation,
  Upload,
  BookMarked,
  ClipboardList,
  FlaskConical,
  Radio,
  Pause,
  Square,
  BookText,
  FolderGit2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface StudentDashboardProps {
  initialSection?: StudentNavSection;
  onSwitchToTeacher?: () => void;
  onSignOut?: () => void;
}

export type StudentNavSection =
  | "home"
  | "test_series"
  | "learn"
  | "library"
  | "notebook"
  | "upload"
  | "record"
  | "batches" // Live Classes
  | "tuition_mode"
  | "calendar"
  | "exam_cracker"
  | "homework"
  | "tests"
  | "my_courses"
  | "bookshelf"
  | "projects"
  | "three_d_lab"
  | "bookmarks"
  | "tutors"
  | "free_mocks"
  | "ai_tutor"
  | "bare_acts"
  | "analytics"
  | "internships"
  | "schedule";

export function StudentDashboardView({
  initialSection = "home",
  onSwitchToTeacher,
  onSignOut,
}: StudentDashboardProps) {
  // Navigation section
  const [activeSection, setActiveSection] = useState<StudentNavSection>(initialSection);
  const [activeExamFilter, setActiveExamFilter] = useState("For You");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true); // Expanded by default so all 17 items are visible matching EduPye
  const [activeLearnCourseId, setActiveLearnCourseId] = useState<string>("ai_legal_tech");
  const [learnActiveTab, setLearnActiveTab] = useState<"syllabus" | "resources" | "quizzes">("syllabus");

  // ==============================================================
  // EDUPYE 3-PANE "LEARN" SECTION SUB-NAVIGATION & STUDIO STATE
  // ==============================================================
  const [learnSubSection, setLearnSubSection] = useState<
    | "subject"
    | "practice"
    | "test"
    | "quiz"
    | "history"
    | "search"
    | "game"
    | "homework"
    | "assignment"
    | "tuition"
    | "combine_study"
  >("subject");
  const [selectedCurriculumTrack, setSelectedCurriculumTrack] = useState<string>("Bar & Consortium Curriculum");
  const [showManageTrackModal, setShowManageTrackModal] = useState<boolean>(false);
  const [activeCreateModal, setActiveCreateModal] = useState<string | null>(null);
  const [learnPracticeFilter, setLearnPracticeFilter] = useState<string>("All");
  const [learnSearchInput, setLearnSearchInput] = useState<string>("");
  const [gameActiveTab, setGameActiveTab] = useState<"section_sprint" | "ratio_match" | "maxim_scramble">("section_sprint");
  const [gameScore, setGameScore] = useState<number>(180);
  const [gameSprintQuestionIdx, setGameSprintQuestionIdx] = useState<number>(0);
  const [gameAnswerSelected, setGameAnswerSelected] = useState<number | null>(null);
  const [gameStreak, setGameStreak] = useState<number>(3);

  // ==============================================================
  // EDUPYE NEW STUDENT FEATURES STATE (RECORD, NOTEBOOK, UPLOADS, ETC)
  // ==============================================================
  // 1. Audio / Video Recording Studio
  const [recordMode, setRecordMode] = useState<"audio" | "video">("audio");
  const [recordStatus, setRecordStatus] = useState<"idle" | "recording" | "paused">("idle");
  const [recordTimer, setRecordTimer] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [savedRecordings, setSavedRecordings] = useState([
    {
      id: "rec_1",
      title: "Moot Oral Submission: Article 19(1)(a) Free Expression in Cyber Space",
      duration: "04:32",
      date: "Today, 10:15 AM",
      score: "9.2/10 AI Clarity",
      audioUrl: "#",
    },
    {
      id: "rec_2",
      title: "Statutory Analysis: Hadley v Baxendale Remoteness Rule under S.73",
      duration: "03:15",
      date: "Yesterday",
      score: "8.8/10 AI Clarity",
      audioUrl: "#",
    },
  ]);

  // 2. Cornell Revision Notebook
  const [studentNotes, setStudentNotes] = useState([
    {
      id: "note_1",
      title: "Doctrine of Severability & Basic Structure",
      subject: "Constitutional Law",
      cues: ["AK Gopalan v State of Madras", "Kesavananda Bharati (1973)", "Article 13(2) Void Clause"],
      content: "If an unconstitutional provision can be severed without altering the legislature's intent, only that provision is void. Basic structure cannot be destroyed even by constitutional amendment.",
      summary: "Doctrine preserves statutory intent while excising unconstitutional provisions under Article 13.",
      lastEdited: "Today, 11:40 AM",
    },
    {
      id: "note_2",
      title: "Mens Rea & Section 103 BNS 2023 vs Section 300 IPC",
      subject: "Criminal Jurisprudence (BNS)",
      cues: ["BNS 103 Murder", "BNS 105 Culpable Homicide", "5 Exception Clauses"],
      content: "BNS 2023 consolidates homicide provisions while modernizing fine structures and community service options.",
      summary: "Mens rea remains foundational for murder conviction under newly enacted penal codes.",
      lastEdited: "Nov 18, 2026",
    },
  ]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>("note_1");
  const [showAddNoteModal, setShowAddNoteModal] = useState<boolean>(false);
  const [newNoteTitle, setNewNoteTitle] = useState<string>("");
  const [newNoteSubject, setNewNoteSubject] = useState<string>("Constitutional Law");

  // 3. Document Upload Portal
  const [uploadedDocuments, setUploadedDocuments] = useState([
    {
      id: "up_1",
      name: "Bail_Application_BNSS_Sec480_Advithya.pdf",
      category: "Case Brief Submission",
      size: "2.4 MB",
      date: "Today, 11:20 AM",
      status: "Graded",
      score: "48 / 50",
      facultyFeedback: "Excellent framing of statutory parity and clean bail prayer.",
    },
    {
      id: "up_2",
      name: "Kesavananda_Memorial_Draft_v2.pdf",
      category: "Moot Memorial Draft",
      size: "4.1 MB",
      date: "2 days ago",
      status: "Under Review",
      score: "Pending",
      facultyFeedback: "Adv. Sunita Deshmukh is currently adjudicating.",
    },
  ]);
  const [uploadCategory, setUploadCategory] = useState("Case Brief Submission");
  const [uploadSuccessAlert, setUploadSuccessAlert] = useState(false);

  // 4. Homework & Tasks Tracker
  const [homeworkTab, setHomeworkTab] = useState<"pending" | "completed">("pending");
  const [studentHomework, setStudentHomework] = useState([
    {
      id: "hw_1",
      title: "Draft Anticipatory Bail under BNSS Section 482",
      subject: "Criminal Law Practice",
      faculty: "Adv. Sunita Deshmukh",
      dueDate: "Tomorrow, 5:00 PM",
      status: "pending",
      instructions: "Draft a formal 3-page anticipatory bail petition for a client falsely implicated in a commercial dispute.",
    },
    {
      id: "hw_2",
      title: "Comparative Table: Article 32 vs Article 226 Writs",
      subject: "Constitutional Law",
      faculty: "Prof. Dr. Rajesh Varma",
      dueDate: "Nov 24, 2026",
      status: "pending",
      instructions: "Analyze the territorial and subject-matter scope of Supreme Court vs High Court writ jurisdictions.",
    },
    {
      id: "hw_3",
      title: "Solve 20 Principle-Fact MCQs on Contract Breach Damages",
      subject: "Law of Contracts",
      faculty: "Adv. K. R. Nambiar",
      dueDate: "Completed Yesterday",
      status: "completed",
      instructions: "Section 73 Indian Contract Act drills.",
      grade: "19 / 20",
      feedback: "Great grasp on remote loss distinction in Hadley v Baxendale.",
    },
  ]);
  const [submittingHwId, setSubmittingHwId] = useState<string | null>(null);
  const [hwSubmissionText, setHwSubmissionText] = useState("");

  // 5. Exam Cracker High-Yield Drills
  const [crackerIndex, setCrackerIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [streakCount, setStreakCount] = useState(7);
  const flashDrills = [
    {
      doctrine: "Kesavananda Bharati v. State of Kerala (1973)",
      subject: "Constitutional Law",
      principle: "Parliament cannot alter or destroy the Basic Structure of the Constitution under Article 368.",
      keyTakeaway: "Judicial review, rule of law, federalism, and fundamental rights form the core bedrock.",
    },
    {
      doctrine: "Hadley v. Baxendale (1854) / S.73 Contract Act",
      subject: "Contract Law",
      principle: "Damages for breach must naturally arise in usual course, or be in reasonable contemplation of parties.",
      keyTakeaway: "Remote and indirect losses cannot be claimed without special notice.",
    },
    {
      doctrine: "Maneka Gandhi v. Union of India (1978)",
      subject: "Fundamental Rights",
      principle: "Procedure established by law under Art. 21 must be right, just, and fair — not arbitrary.",
      keyTakeaway: "Golden Triangle: Article 14, 19, and 21 are mutually inclusive and reinforcing.",
    },
    {
      doctrine: "BNS Section 103 Concordance",
      subject: "Criminal Jurisprudence",
      principle: "Section 103 BNS 2023 corresponds to Section 302 IPC (Punishment for Murder).",
      keyTakeaway: "Mandatory life imprisonment or death penalty with clarified group hate crime definitions.",
    },
  ];

  // 6. Library State
  const [selectedLibraryCategory, setSelectedLibraryCategory] = useState("All");
  const libraryBooks = [
    {
      id: "lib_1",
      title: "Constitution of India: Bare Act with Concordance 2026",
      author: "Consortium Editorial Board",
      category: "Constitutional Law",
      pages: 412,
      cover: "from-amber-500 to-amber-700",
      badge: "Mandatory Text",
    },
    {
      id: "lib_2",
      title: "Bharatiya Nyaya Sanhita (BNS 2023) Annotated Code",
      author: "Justice R. V. Sharma (Retd.)",
      category: "Criminal Law (BNS)",
      pages: 360,
      cover: "from-blue-600 to-indigo-800",
      badge: "New Penal Code",
    },
    {
      id: "lib_3",
      title: "Law of Contracts & Specific Relief Commentary",
      author: "Sir Dinshaw Mulla / Consortium Edition",
      category: "Civil & Commercial",
      pages: 580,
      cover: "from-emerald-600 to-teal-800",
      badge: "Commercial Law",
    },
    {
      id: "lib_4",
      title: "CLAT 2027 Legal Reasoning 500 Passage Drill",
      author: "Wakheel National Faculty Panel",
      category: "Entrance Preparation",
      pages: 290,
      cover: "from-purple-600 to-violet-800",
      badge: "Top Ranker Pick",
    },
  ];

  // 7. 3D Courtroom Lab
  const [active3dZone, setActive3dZone] = useState<"bench" | "bar" | "podium" | "witness">("bench");

  // 8. Book shelf
  const bookshelfItems = [
    {
      id: "bs_1",
      title: "Principles of Criminal Law (BNS 2023 Edition)",
      progress: "68%",
      currentPage: 142,
      totalPages: 210,
      lastRead: "Today, 9:30 AM",
      accent: "from-blue-600 to-indigo-700",
    },
    {
      id: "bs_2",
      title: "Consortium CLAT Legal Aptitude Master Manual",
      progress: "84%",
      currentPage: 294,
      totalPages: 350,
      lastRead: "Yesterday",
      accent: "from-amber-500 to-amber-700",
    },
    {
      id: "bs_3",
      title: "Manupatra Case Law Digest: Golden Triangle Article 21",
      progress: "42%",
      currentPage: 50,
      totalPages: 120,
      lastRead: "3 days ago",
      accent: "from-emerald-600 to-teal-700",
    },
  ];

  // 9. Projects
  const studentProjects = [
    {
      id: "proj_1",
      title: "National Cyber Defamation Moot Court Memorial",
      status: "In Progress",
      deadline: "Dec 10, 2026",
      team: ["Advithya Sharma (Speaker 1)", "Priya Nair (Speaker 2)", "Rahul George (Researcher)"],
      progress: "75%",
      track: "All-India Moot 2027",
    },
    {
      id: "proj_2",
      title: "Comparative Study on Section 480 BNSS vs Section 437 CrPC",
      status: "Draft Review",
      deadline: "Nov 30, 2026",
      team: ["Advithya Sharma (Lead Author)"],
      progress: "90%",
      track: "Chamber Clerkship Research",
    },
  ];

  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  // Student Profile
  const [studentProfile, setStudentProfile] = useState({
    fullName: "Advithya Sharma",
    email: "advithya.sharma@law.edu",
    targetExam: "CLAT 2027 & KLEE Entrance",
    universityName: "National Law University Aspirant / IGNOU Distance LL.B",
  });
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  // Purchase / Enrollment Modal State
  const [purchaseItem, setPurchaseItem] = useState<{
    type: "test_series" | "batch" | "tutor";
    title: string;
    price: number;
    originalPrice: number;
    features: string[];
    extraNote?: string;
  } | null>(null);
  const [couponApplied, setCouponApplied] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // 1-on-1 Tutor Booking Modal State
  const [selectedTutor, setSelectedTutor] = useState<any | null>(null);
  const [bookingDate, setBookingDate] = useState("Today, 6:00 PM");
  const [bookingTopic, setBookingTopic] = useState("CLAT Legal Reasoning & Principle-Fact Analysis");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Live CBT Mock Simulator State
  const [activeMockTest, setActiveMockTest] = useState<any | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [mockScore, setMockScore] = useState<number | null>(null);

  // AI Doubt Solver State
  const [aiChatMessages, setAiChatMessages] = useState<
    Array<{ sender: "user" | "ai"; text: string; timestamp: string }>
  >([
    {
      sender: "ai",
      text: "Namaste Advithya! I am your Wakheel Legal AI Mentor. Ask me any doubt on CLAT/KLEE entrance mocks, Bare Acts (BNS, CPC, Constitution), or legal maxims.",
      timestamp: "Just now",
    },
  ]);
  const [aiChatInput, setAiChatInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Bare Acts State
  const [selectedBareAct, setSelectedBareAct] = useState<string>("bns");
  const [bareActSearch, setBareActSearch] = useState<string>("");

  // Clerkship / Internship Application State
  const [selectedInternship, setSelectedInternship] = useState<any | null>(null);
  const [internshipApplySuccess, setInternshipApplySuccess] = useState<boolean>(false);
  const [applicantNote, setApplicantNote] = useState<string>(
    "Enrolled student aspiring for appellate advocacy and chamber research."
  );

  // Timetable State
  const [scheduleFilter, setScheduleFilter] = useState<"all" | "today">("all");

  // ==============================================================
  // EDUPYE HYBRID APPLICATION FEATURES STATE
  // ==============================================================
  // 1. Floating AI Copilot Widget
  const [showFloatingAI, setShowFloatingAI] = useState(false); // Collapsed by default so it doesn't block dashboard view
  const [floatingCopilotMode, setFloatingCopilotMode] = useState<"aptitude" | "bns_statutory" | "precedents">("aptitude");
  const [floatingCopilotCopiedIndex, setFloatingCopilotCopiedIndex] = useState<number | null>(null);
  const [floatingQuery, setFloatingQuery] = useState("");
  const [floatingMessages, setFloatingMessages] = useState<
    Array<{
      sender: "user" | "ai";
      text: string;
      time: string;
      mode?: "aptitude" | "bns_statutory" | "precedents";
      statutes?: string[];
      citation?: {
        caseTitle: string;
        citation: string;
        bench?: string;
        ratio: string;
      };
      examTip?: string;
    }>
  >([
    {
      sender: "ai",
      text: "Namaste Advithya! I am your Wakheel EduPye Hybrid Legal Copilot (v2.5).\n\nI specialize in CLAT/KLEE legal aptitude drills, Bharatiya Nyaya Sanhita (BNS 2023) statutory concordance, and landmark Supreme Court & High Court ratio decidendi.",
      time: "Online",
      mode: "aptitude",
      statutes: ["BNS 2023", "BNSS 2023", "Constitution of India", "CLAT NLU Curricula"],
      examTip: "Switch modes above or tap any quick prompt below to practice legal aptitude, cite landmark precedents, or cross-reference criminal law sections.",
    },
  ]);
  const [floatingLoading, setFloatingLoading] = useState(false);

  // 2. Tuition Access Grant State
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantIncomeBracket, setGrantIncomeBracket] = useState("< ₹3.5 Lakhs / year (Eligible for 100% Fee Waiver)");
  const [grantQualifyingScore, setGrantQualifyingScore] = useState("91.2% (Senior Secondary / Graduation)");
  const [grantTargetNLU, setGrantTargetNLU] = useState("NLSIU Bengaluru / NALSAR Hyderabad");
  const [grantStatement, setGrantStatement] = useState(
    "First-generation legal scholar seeking merit-based chamber scholarship to clear CLAT 2027 and pursue public interest advocacy."
  );
  const [grantSuccess, setGrantSuccess] = useState(false);
  const [grantCouponCode, setGrantCouponCode] = useState("");

  // 3. All-India Leaderboard & Badges State
  const [showLeaderboardDrawer, setShowLeaderboardDrawer] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState<"ranks" | "badges">("ranks");

  // 4. Regional Bar & Language Switcher State
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English (Consortium NLU Standard)");

  // 5. Course Learning Portal State (Open Portal >)
  const [selectedCourseForPortal, setSelectedCourseForPortal] = useState<any | null>(null);
  const [portalTab, setPortalTab] = useState<"video" | "notes" | "quiz" | "forum">("video");
  const [portalVideoPlaying, setPortalVideoPlaying] = useState(false);
  const [portalPlaybackSpeed, setPortalPlaybackSpeed] = useState(1);
  const [portalQuizAnswers, setPortalQuizAnswers] = useState<Record<number, number>>({});
  const [portalQuizSubmitted, setPortalQuizSubmitted] = useState(false);

  // 6. Bookmarks & Revision Notebook State
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false);

  const handleSendFloatingAI = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToSend = (customQuery || floatingQuery).trim();
    if (!queryToSend) return;
    setFloatingQuery("");

    setFloatingMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: queryToSend,
        time: "Just now",
        mode: floatingCopilotMode,
      },
    ]);
    setFloatingLoading(true);

    // Try backend copilot query if available
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch("http://localhost:5000/api/copilot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: queryToSend,
          mode: floatingCopilotMode === "aptitude" ? "Exam" : floatingCopilotMode === "precedents" ? "Precedent" : "Statute",
          language: "en",
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.text) {
          setFloatingMessages((prev) => [
            ...prev,
            {
              sender: "ai",
              text: data.text,
              time: "Just now",
              mode: floatingCopilotMode,
              statutes: Array.isArray(data.citations)
                ? data.citations.slice(0, 4).map((c: any) => typeof c === "string" ? c : c.citation || c.act || "Statute")
                : ["BNS 2023", "Statutory Concordance"],
              citation: data.precedents?.[0]
                ? {
                    caseTitle: data.precedents[0].title || data.precedents[0].caseTitle,
                    citation: data.precedents[0].citation,
                    bench: data.precedents[0].coram || data.precedents[0].court,
                    ratio: data.precedents[0].subject || data.precedents[0].ratio,
                  }
                : undefined,
              examTip: data.actionRecommendation || undefined,
            },
          ]);
          setFloatingLoading(false);
          return;
        }
      }
    } catch {
      // Offline fallback
    }

    // High-precision offline legal intelligence
    setTimeout(() => {
      const lower = queryToSend.toLowerCase();
      let reply: {
        sender: "user" | "ai";
        text: string;
        time: string;
        mode?: "aptitude" | "bns_statutory" | "precedents";
        statutes?: string[];
        citation?: {
          caseTitle: string;
          citation: string;
          bench?: string;
          ratio: string;
        };
        examTip?: string;
      };

      if (lower.includes("69") || (lower.includes("bns") && (lower.includes("promise") || lower.includes("deceit")))) {
        reply = {
          sender: "ai",
          text: "Under Section 69 of Bharatiya Nyaya Sanhita (BNS) 2023, deceitful promises to marry, employment inducement, or suppressing identity to engage in sexual intercourse is codified as an independent aggravated statutory offence (punishable with imprisonment up to 10 years and fine).\n\nKey Statutory Evolution: Formerly under IPC 375, courts struggled with the line between rape on false promise of marriage (Section 90 consent vitiation) and mere subsequent breach of promise. Section 69 now formally separates deceitful inducement from Section 63 (rape).",
          time: "Just now",
          mode: "bns_statutory",
          statutes: ["BNS Sec 69", "BNS Sec 63", "IPC Sec 375", "IPC Sec 90"],
          citation: {
            caseTitle: "Pramod Suryabhan Pawar v. State of Maharashtra",
            citation: "(2019) 9 SCC 608",
            bench: "Supreme Court of India (Dr. D.Y. Chandrachud & Indira Banerjee, JJ.)",
            ratio: "Clear distinction between a false promise made in bad faith with no intention to adhere to it at the inception, versus a breach of promise that subsequently fails due to unforeseen circumstances.",
          },
          examTip: "High-yield CLAT/Judiciary topic: Under BNS Sec 69, 'deceitful means' expressly includes false promises of employment, promotion, or marrying after suppressing one's true marital status or identity.",
        };
      } else if (lower.includes("kesavananda") || lower.includes("basic structure") || lower.includes("368")) {
        reply = {
          sender: "ai",
          text: "In Kesavananda Bharati Sripadagalvaru v. State of Kerala (1973), a 13-Judge Constitutional Bench of the Supreme Court delivered the historic 7:6 ruling establishing the 'Basic Structure Doctrine'.\n\nKey Principles:\n1. Parliament's amending power under Article 368 is plenary and extends even to Fundamental Rights (Part III).\n2. However, amending power does NOT include the authority to abrogate or damage the essential structural pillars of the Constitution.\n3. Recognized pillars include Supremacy of Constitution, Secularism, Federalism, Free and Fair Elections, and Separation of Powers.",
          time: "Just now",
          mode: "precedents",
          statutes: ["Article 368", "Article 13(2)", "Part III Fundamental Rights"],
          citation: {
            caseTitle: "Kesavananda Bharati v. State of Kerala",
            citation: "(1973) 4 SCC 225 | AIR 1973 SC 1461",
            bench: "13-Judge Bench (Sikri C.J., Hegde, Mukherjea, Shelat, Grover, Jaganmohan Reddy, Khanna JJ.)",
            ratio: "Article 368 contains an inherent limitation: the basic framework and core identity of the Constitution cannot be amended away by Parliament.",
          },
          examTip: "In Minerva Mills (1980), the Supreme Court reiterated that a limited amending power is itself a basic feature of the Indian Constitution.",
        };
      } else if (lower.includes("32") || lower.includes("226") || lower.includes("writ")) {
        reply = {
          sender: "ai",
          text: "Comparative Jurisprudence: Article 32 vs Article 226 Writs:\n\n• Article 32 (Supreme Court):\n- Guaranteed Fundamental Right under Part III (Dr. Ambedkar: 'Heart and Soul of the Constitution').\n- The SC cannot refuse to entertain a petition if a Fundamental Right violation is shown (Prem Chand Garg).\n- Territorial Jurisdiction: All of India.\n- Subject-matter Scope: Restricted strictly to Part III Fundamental Rights.\n\n• Article 226 (High Courts):\n- Discretionary constitutional power under Part VI (not an FR in itself).\n- Territorial Jurisdiction: Within state boundaries or locus of cause of action.\n- Subject-matter Scope: Broader than Art 32—applicable for Fundamental Rights AND 'for any other purpose' (statutory or common law legal rights).",
          time: "Just now",
          mode: "precedents",
          statutes: ["Article 32", "Article 226", "Article 136"],
          citation: {
            caseTitle: "L. Chandra Kumar v. Union of India",
            citation: "(1997) 3 SCC 261",
            bench: "7-Judge Constitutional Bench",
            ratio: "The power of judicial review under Articles 32 and 226 is an integral and inviolable part of the Basic Structure of the Indian Constitution.",
          },
          examTip: "CLAT Exam Trap: High Court writ powers are broader in subject grounds than the Supreme Court, but narrower in territorial reach.",
        };
      } else if (lower.includes("maneka") || lower.includes("article 21") || lower.includes("due process") || lower.includes("golden triangle")) {
        reply = {
          sender: "ai",
          text: "In Maneka Gandhi v. Union of India (1978), the Supreme Court revolutionized personal liberty jurisprudence by overruling the literalist interpretation in A.K. Gopalan (1950).\n\nKey Constitutional Holdings:\n1. 'Procedure established by law' in Article 21 was judicially elevated to mean 'fair, just, and reasonable procedure'—substantively infusing American Due Process.\n2. Formulated the 'Golden Triangle': Articles 14, 19, and 21 are not mutually exclusive silos. A law depriving personal liberty under Art 21 must survive the non-arbitrariness test of Art 14 and reasonableness test of Art 19.\n3. The right to travel abroad is an integral aspect of 'personal liberty'.",
          time: "Just now",
          mode: "precedents",
          statutes: ["Article 21", "Article 14", "Article 19", "Passports Act 1967 Sec 10(3)(c)"],
          citation: {
            caseTitle: "Maneka Gandhi v. Union of India",
            citation: "(1978) 1 SCC 248 | AIR 1978 SC 597",
            bench: "7-Judge Constitutional Bench",
            ratio: "The law must be right, just, and fair and not arbitrary, fanciful, or oppressive; otherwise it would be no procedure at all and Article 21 would be violated.",
          },
          examTip: "Audi alteram partem (right to fair hearing) is an essential facet of Article 14 non-arbitrariness and Article 21 fairness.",
        };
      } else if (lower.includes("138") || lower.includes("cheque") || lower.includes("ni act")) {
        reply = {
          sender: "ai",
          text: "Section 138 of the Negotiable Instruments Act, 1881 governs criminal prosecution for dishonour of cheques for insufficiency of funds:\n\nMandatory Timelines:\n1. Cheque presented within validity period (3 months).\n2. Bank return memo received.\n3. Statutory demand notice in writing issued within 30 days of receiving return memo.\n4. 15-day statutory cure window provided to drawer to make payment.\n5. Cause of action crystallizes on Day 16; complaint must be filed before Judicial Magistrate within 30 days.",
          time: "Just now",
          mode: "bns_statutory",
          statutes: ["NI Act Sec 138", "NI Act Sec 139", "NI Act Sec 141", "NI Act Sec 142(2)"],
          citation: {
            caseTitle: "Bir Singh v. Mukesh Kumar",
            citation: "(2019) 4 SCC 197",
            bench: "Supreme Court of India",
            ratio: "Even if a signed blank cheque leaf is voluntarily handed over, the statutory presumption under Section 139 operates unless the drawer rebuts the existence of debt with cogent evidence.",
          },
          examTip: "Under Sec 142(2), complaint jurisdiction lies where the payee's bank branch maintains the account if delivered through an account.",
        };
      } else if (lower.includes("482") || lower.includes("bail") || lower.includes("bnss") || lower.includes("anticipatory")) {
        reply = {
          sender: "ai",
          text: "Section 482 of Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023 corresponds to erstwhile Section 438 of CrPC 1973 for Anticipatory Bail.\n\nStatutory Highlights:\n• Jurisdiction: Concurrent between Sessions Court and High Court.\n• Criteria: Nature and gravity of accusation, role attributed to applicant, previous criminal record, and likelihood of applicant fleeing or tampering with witnesses.\n• Conditions: Must make oneself available for interrogation, shall not induce or threaten witnesses, and shall not leave India without court leave.",
          time: "Just now",
          mode: "bns_statutory",
          statutes: ["BNSS Sec 482", "BNSS Sec 480", "BNSS Sec 483"],
          citation: {
            caseTitle: "Sushila Aggarwal v. State (NCT of Delhi)",
            citation: "(2020) 5 SCC 1",
            bench: "5-Judge Constitutional Bench",
            ratio: "Anticipatory bail should not ordinarily be restricted to a fixed duration or until filing of charge sheet; it can continue till conclusion of trial unless special circumstances warrant revocation.",
          },
          examTip: "Under BNSS Sec 482, notice to public prosecutor is mandatory before final hearing if the offense attracts 7+ years imprisonment.",
        };
      } else if (lower.includes("passage") || lower.includes("drill") || lower.includes("aptitude") || lower.includes("clat") || lower.includes("klee")) {
        reply = {
          sender: "ai",
          text: "Here is an interactive Principle-Fact Legal Aptitude Passage Drill for CLAT / KLEE preparation:\n\n**PRINCIPLE**:\nAn agreement made without consideration is void, unless it is in writing and registered under the law for registration of documents, and is made on account of natural love and affection between parties standing in a near relation to each other (Section 25(1), Indian Contract Act, 1872).\n\n**FACTS**:\nRajesh promises in writing to pay ₹30,000 per month to his younger brother Vikram for law school tuition out of natural love and affection. He signs the document on legal paper but DOES NOT register it with the Sub-Registrar. Later, Rajesh discontinues payments. Vikram sues Rajesh for breach of contract.\n\n**LEGAL ANALYSIS**:\nVikram's suit will FAIL. All three statutory requirements under Section 25(1) must coexist: (1) Near relationship, (2) In writing, AND (3) Registered. Since the agreement was not registered, it remains void for lack of consideration.",
          time: "Just now",
          mode: "aptitude",
          statutes: ["Indian Contract Act Sec 25", "Indian Contract Act Sec 10", "Registration Act 1908"],
          citation: {
            caseTitle: "Rajlukhy Dabee v. Bhootnath Mookerjee",
            citation: "(1900) 4 CWN 488",
            bench: "Calcutta High Court",
            ratio: "Near relationship alone does not suffice; registration under the Registration Act is an indispensable statutory prerequisite for Section 25(1) enforceability.",
          },
          examTip: "Exam Rule: Always verify strict compliance with all conjunctive statutory requirements in CLAT passage questions.",
        };
      } else {
        reply = {
          sender: "ai",
          text: `Comprehensive Legal Analysis for "${queryToSend}":\n\nIn Indian jurisprudence, legal reasoning issues are governed by statutory concordance and judicial precedent:\n• Constitutional Scrutiny: State action or subordinate legislation must survive Article 14 non-arbitrariness and Article 21 fairness.\n• Criminal Law Concordance: Verify whether allegations fall under Bharatiya Nyaya Sanhita (BNS 2023) or legacy IPC provisions.\n• Evidentiary Standard: Admissibility of digital evidence requires Section 61 certification under Bharatiya Sakshya Adhiniyam (BSA 2023).`,
          time: "Just now",
          mode: floatingCopilotMode,
          statutes: ["BNS 2023", "BNSS 2023", "BSA 2023", "Constitution of India"],
          citation: {
            caseTitle: "Shayara Bano v. Union of India",
            citation: "(2017) 9 SCC 1",
            bench: "5-Judge Constitutional Bench",
            ratio: "Manifest arbitrariness is an independent constitutional ground under Article 14 to invalidate plenary legislation.",
          },
          examTip: "Cite relevant Constitutional Bench precedents and statutory provisions to substantiate your answer.",
        };
      }

      setFloatingMessages((prev) => [...prev, reply]);
      setFloatingLoading(false);
    }, 600);
  };

  const handleApplyGrant = (e: React.FormEvent) => {
    e.preventDefault();
    const code = "JUSTICE100";
    setGrantCouponCode(code);
    setGrantSuccess(true);
    setCouponApplied(true);
  };

  // Load profile from localStorage
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem("wakheel_academy_user") ||
        localStorage.getItem("wakheel_academy_student");
      if (stored) {
        const parsed = JSON.parse(stored);
        setStudentProfile((prev) => ({
          ...prev,
          fullName: parsed.fullName || prev.fullName,
          email: parsed.email || prev.email,
          targetExam: parsed.targetProgram || prev.targetExam,
          universityName: parsed.institutionName || prev.universityName,
        }));
      }
    } catch {}
  }, []);

  // Exam Filters matching EduPye category row
  const examFilters = [
    "For You",
    "Education",
    "Arts, Design & Media",
    "Languages & Literature",
    "History & Archaeology",
    "IT",
    "CLAT 2027 (NLUs)",
    "Judicial Services",
  ];

  // ==============================================================
  // EDUPYE FEATURED MASTERCLASSES & CURRICULA (IMAGE CARDS)
  // ==============================================================
  const masterclassCourses = [
    {
      id: "ai_legal_tech",
      title: "Artificial Intelligence & Legal Tech Masterclass",
      exam: "CLAT 2027 (NLUs)",
      badge: "AI POWERED",
      badgeColor: "amber",
      unitsCount: "20 Sections",
      dateAdded: "2 Months ago",
      image: "/academy/explore-robot.png",
      description: "Gemini AI Judicial Reasoning, Principle-Fact Passage Analysis, and Algorithmic Case Law Search.",
      instructor: "Adv. Rohan Mehra (NLSIU Bengaluru Alum & Legal Tech Researcher)",
      completedUnits: 13,
      totalUnits: 20,
      videoDuration: "18h 45m",
      currentLesson: "Chapter 4: Algorithmic Bias & Manifest Arbitrariness under Article 14",
      syllabus: [
        { unit: "Unit 1: Foundations of Legal Prompting & Statutory Retrieval", duration: "2h 30m", completed: true },
        { unit: "Unit 2: Automated Principle-Fact Matching for CLAT Passages", duration: "3h 15m", completed: true },
        { unit: "Unit 3: AI Document Discovery & High Court Case Law Analytics", duration: "4h 00m", completed: true },
        { unit: "Unit 4: Ethics of AI in Judicial Decision Making", duration: "3h 45m", completed: false },
        { unit: "Unit 5: Capstone: Drafting a Special Leave Petition with AI Review", duration: "5h 15m", completed: false },
      ],
      quiz: [
        {
          question: "Can an AI-generated draft be submitted in an Indian Court without an enrolled Advocate's verification?",
          options: [
            "Yes, if licensed under the IT Act 2000",
            "No, the Advocates Act 1961 requires exclusive verification and signature by an enrolled advocate",
            "Yes, in District Courts but not High Courts",
            "Only in Commercial Arbitration proceedings",
          ],
          correct: 1,
          explanation: "Under Section 30 of the Advocates Act 1961, only advocates enrolled on a State Bar roll have the exclusive right of audience and filing in Indian courts.",
        },
        {
          question: "Which landmark constitutional test is applied to determine if algorithmic executive action violates Article 14?",
          options: [
            "Doctrine of Severability",
            "Manifest Arbitrariness and Proportionality Test",
            "Doctrine of Eclipse",
            "Doctrine of Pith and Substance",
          ],
          correct: 1,
          explanation: "In Shayara Bano and K.S. Puttaswamy, the Supreme Court established that state action that is manifestly arbitrary or disproportionate violates Article 14.",
        },
      ],
    },
    {
      id: "const_law_writs",
      title: "Constitutional Law: Fundamental Rights & Writs",
      exam: "Distance LL.B (IGNOU)",
      badge: "BARE ACT SYLLABUS",
      badgeColor: "blue",
      unitsCount: "24 Units",
      dateAdded: "2 Months ago",
      image: "/academy/explore-paper.png",
      description: "Constitution of India, Writs Drafting (Habeas Corpus, Mandamus, Quo Warranto), and Landmark Bench Rulings.",
      instructor: "Adv. Sunita Deshmukh (Supreme Court Advocate-on-Record)",
      completedUnits: 18,
      totalUnits: 24,
      videoDuration: "24h 10m",
      currentLesson: "Chapter 8: Doctrine of Basic Structure (Kesavananda Bharati)",
      syllabus: [
        { unit: "Unit 1: Preamble, Federal Structure, and Union Territory Jurisprudence", duration: "3h 00m", completed: true },
        { unit: "Unit 2: Article 12 'State' Definition Post-Sukhdev and Pradeep Biswas", duration: "3h 30m", completed: true },
        { unit: "Unit 3: Article 21 Golden Triangle & Right to Privacy (Puttaswamy)", duration: "4h 30m", completed: true },
        { unit: "Unit 4: Drafting Article 32 & 226 High Court Writ Petitions", duration: "5h 10m", completed: false },
        { unit: "Unit 5: Emergency Provisions & Judicial Review Limits", duration: "4h 00m", completed: false },
      ],
      quiz: [
        {
          question: "Which writ literally translates to 'What is your authority?' and tests illegal public office usurpation?",
          options: ["Mandamus", "Habeas Corpus", "Quo Warranto", "Certiorari"],
          correct: 2,
          explanation: "Quo Warranto is issued against a usurper of a substantive public office of a permanent nature created by statute or Constitution.",
        },
        {
          question: "Under Article 32, can the Supreme Court refuse relief on the sole ground that an alternative statutory remedy exists?",
          options: [
            "Yes, at its discretion",
            "No, Article 32 is itself a guaranteed Fundamental Right and cannot be denied for alternative remedy alone",
            "Only during Financial Emergencies",
            "Yes, if High Court rejected it under Article 226",
          ],
          correct: 1,
          explanation: "Unlike Article 226 where writ jurisdiction is discretionary, Article 32 is guaranteed as a Fundamental Right under Part III.",
        },
      ],
    },
    {
      id: "bns_transition",
      title: "Bharatiya Nyaya Sanhita (BNS 2023) Transition",
      exam: "KLEE 2027 (Kerala)",
      badge: "CRIMINAL REFORMS",
      badgeColor: "emerald",
      unitsCount: "18 Sections",
      dateAdded: "2 Months ago",
      image: "/academy/explore-man.png",
      description: "2024–2026 Criminal Law Transitions from IPC 1860, Offence Number Mappings, and High Court Rulings.",
      instructor: "Prof. K. Narayanan (Ex-Public Prosecutor & National Law Faculty)",
      completedUnits: 12,
      totalUnits: 18,
      videoDuration: "16h 20m",
      currentLesson: "Chapter 5: Section 69 BNS (Deceitful Cohabitation & Breach of Promise)",
      syllabus: [
        { unit: "Unit 1: Overview of IPC 1860 Replacement & BNS Structural Architecture", duration: "2h 45m", completed: true },
        { unit: "Unit 2: Re-codification of Murder & Culpable Homicide (Section 101-105 BNS)", duration: "3h 40m", completed: true },
        { unit: "Unit 3: Mob Lynching & Organized Crime as Distinct Statutory Offences", duration: "3h 15m", completed: true },
        { unit: "Unit 4: Section 69 Sexual Offences on False Promise of Employment/Marriage", duration: "3h 30m", completed: false },
        { unit: "Unit 5: Community Service as a New Sentencing Remedy in Minor Offenses", duration: "3h 10m", completed: false },
      ],
      quiz: [
        {
          question: "Under BNS 2023, which new punishment was introduced for first-time petty offenses under Section 4?",
          options: ["Solitary Confinement", "Community Service", "Public Shaming", "Indefinite Forfeiture"],
          correct: 1,
          explanation: "Section 4 of the Bharatiya Nyaya Sanhita 2023 introduced Community Service as an alternative reformative penal sanction.",
        },
        {
          question: "What is the new BNS section corresponding to traditional IPC Section 420 (Cheating and Dishonestly Inducing Delivery of Property)?",
          options: ["Section 316 BNS", "Section 318 BNS", "Section 103 BNS", "Section 289 BNS"],
          correct: 1,
          explanation: "Section 318(4) of the Bharatiya Nyaya Sanhita 2023 specifically maps to Cheating previously covered under Section 420 IPC.",
        },
      ],
    },
    {
      id: "legal_reasoning_matrix",
      title: "CLAT Legal Reasoning & Principle-Fact Analysis",
      exam: "CLAT 2027 (NLUs)",
      badge: "LOGICAL MATRIX",
      badgeColor: "amber",
      unitsCount: "20 Sections",
      dateAdded: "2 Months ago",
      image: "/academy/explore-robot.png",
      description: "Deconstructing passage-based principle-fact questions with deductive logic and consortium answer keys.",
      instructor: "Adv. Advithya Menon (NLSIU Gold Medalist)",
      completedUnits: 14,
      totalUnits: 20,
      videoDuration: "14h 30m",
      currentLesson: "Chapter 3: Strict Liability vs Absolute Liability Passages",
      syllabus: [
        { unit: "Unit 1: Principle-Fact Deductive Reasoning Framework", duration: "2h 30m", completed: true },
        { unit: "Unit 2: Torts: Volenti Non Fit Injuria & Rylands v Fletcher", duration: "3h 15m", completed: true },
        { unit: "Unit 3: Constitutional Law Principle Drills", duration: "3h 45m", completed: true },
        { unit: "Unit 4: Criminal Law Principles & Exceptions", duration: "2h 50m", completed: false },
        { unit: "Unit 5: Timed Passage Speed Drills", duration: "2h 10m", completed: false },
      ],
      quiz: [
        {
          question: "In CLAT principle-fact questions, if the given principle contradicts existing statute law, what must you do?",
          options: [
            "Apply the actual statutory law",
            "Accept the given principle as absolute truth and apply only that",
            "Mark the question invalid",
            "Choose none of the above",
          ],
          correct: 1,
          explanation: "In CLAT / NLU aptitude exams, the principle stated in the passage must be treated as absolute gospel truth regardless of external law.",
        },
      ],
    },
    {
      id: "contracts_specific_relief",
      title: "Law of Contracts & Specific Relief Compendium",
      exam: "Distance LL.B (IGNOU)",
      badge: "COMMERCIAL LAW",
      badgeColor: "blue",
      unitsCount: "20 Sections",
      dateAdded: "2 Months ago",
      image: "/academy/explore-paper.png",
      description: "Offer, acceptance, promissory estoppel, and injunction jurisprudence under Specific Relief Act 1963.",
      instructor: "Prof. Rajesh Varma (LL.M, Ph.D)",
      completedUnits: 16,
      totalUnits: 20,
      videoDuration: "19h 15m",
      currentLesson: "Chapter 6: Section 20A Infrastructure Injunction Invalidation",
      syllabus: [
        { unit: "Unit 1: Formation, Consideration & Privity of Contract", duration: "3h 30m", completed: true },
        { unit: "Unit 2: Vitiating Factors: Coercion, Fraud & Misrepresentation", duration: "4h 00m", completed: true },
        { unit: "Unit 3: Discharge & S.73 Damages (Hadley v Baxendale)", duration: "4h 15m", completed: true },
        { unit: "Unit 4: Specific Performance Mandate Post-2018 Amendment", duration: "3h 40m", completed: false },
        { unit: "Unit 5: Temporary & Perpetual Injunctions", duration: "3h 50m", completed: false },
      ],
      quiz: [
        {
          question: "Post the 2018 amendment to the Specific Relief Act, granting specific performance of contract is:",
          options: [
            "Purely discretionary for the court",
            "Mandatory subject to limited statutory exceptions",
            "Prohibited for private contracts",
            "Only available before High Courts",
          ],
          correct: 1,
          explanation: "The Specific Relief (Amendment) Act 2018 substituted Section 10 to make specific performance mandatory rather than discretionary.",
        },
      ],
    },
    {
      id: "appellate_advocacy_mooting",
      title: "High Court Appellate Advocacy & Moot Practice",
      exam: "KLEE 2027 (Kerala)",
      badge: "CHAMBER PRACTICE",
      badgeColor: "emerald",
      unitsCount: "20 Sections",
      dateAdded: "2 Months ago",
      image: "/academy/explore-man.png",
      description: "Memorial drafting, oral bench arguments, citation decorum, and trial advocacy simulations.",
      instructor: "Adv. K. R. Nambiar (Senior Advocate, High Court)",
      completedUnits: 12,
      totalUnits: 20,
      videoDuration: "15h 40m",
      currentLesson: "Chapter 5: Rebutting Bench Queries & Time Management",
      syllabus: [
        { unit: "Unit 1: Anatomy of an Appellate Court Memorial", duration: "3h 00m", completed: true },
        { unit: "Unit 2: Marshalling Facts & Crafting Proposition of Law", duration: "3h 30m", completed: true },
        { unit: "Unit 3: Oral Advocacy Decorum & Addressing the Bench", duration: "3h 10m", completed: true },
        { unit: "Unit 4: Handling Hostile Bench Queries with Poise", duration: "3h 00m", completed: false },
        { unit: "Unit 5: Mock High Court Appellate Hearing Simulation", duration: "3h 00m", completed: false },
      ],
      quiz: [
        {
          question: "When cited with an adverse precedent by the bench during oral arguments, the advocate's best strategy is to:",
          options: [
            "Argue the precedent was incorrectly decided without grounds",
            "Distinguish the case on material facts and narrow the ratio decidendi",
            "Ignore the query and move to the next prayer",
            "Request adjournment immediately",
          ],
          correct: 1,
          explanation: "In appellate advocacy, distinguishing the adverse case on material facts is the recognized standard for neutralizing hostile citations.",
        },
      ],
    },
  ];

  // All-India Leaderboard Data
  const leaderboardAspirants = [
    { rank: 1, name: "Aarav Patel", target: "NLSIU Bengaluru", percentile: "99.92%", score: 114.5, tests: 42, streak: 38, avatar: "A" },
    { rank: 2, name: "Meera Nambiar", target: "NALSAR Hyderabad", percentile: "99.85%", score: 112.0, tests: 39, streak: 29, avatar: "M" },
    { rank: 3, name: "Kabir Verma", target: "WBNUJS Kolkata", percentile: "99.64%", score: 109.5, tests: 36, streak: 31, avatar: "K" },
    { rank: 4, name: "Ananya Iyer", target: "NLU Delhi (AILET)", percentile: "99.41%", score: 108.0, tests: 34, streak: 22, avatar: "A" },
    { rank: 5, name: "Tariq Farooqui", target: "NLU Jodhpur", percentile: "99.18%", score: 106.5, tests: 30, streak: 19, avatar: "T" },
    { rank: 6, name: "Rhea Sen", target: "GNLU Gandhinagar", percentile: "98.92%", score: 104.0, tests: 28, streak: 15, avatar: "R" },
    { rank: 7, name: "Devansh Nair", target: "KLEE Govt Law College", percentile: "98.70%", score: 102.5, tests: 27, streak: 18, avatar: "D" },
    { rank: 8, name: "Bhavna Rao", target: "NLU Bhopal (NLIU)", percentile: "98.45%", score: 101.0, tests: 25, streak: 14, avatar: "B" },
    { rank: 9, name: "Vikram Malhotra", target: "MNLU Mumbai", percentile: "98.12%", score: 99.5, tests: 24, streak: 11, avatar: "V" },
    { rank: 10, name: "Pooja Hegde", target: "RMLNLU Lucknow", percentile: "97.80%", score: 98.0, tests: 22, streak: 16, avatar: "P" },
  ];

  // Achievement Badges Data
  const studentBadges = [
    {
      id: "b1",
      title: "Constitutional Maestro",
      level: "Level 3 Master",
      desc: "Scored 90%+ in 5 Constitutional Law Mocks",
      unlocked: true,
      date: "Unlocked Nov 12",
    },
    {
      id: "b2",
      title: "BNS Criminal Code Pioneer",
      level: "Level 2 Scholar",
      desc: "Completed all 18 BNS 2023 transition modules",
      unlocked: true,
      date: "Unlocked Nov 15",
    },
    {
      id: "b3",
      title: "Speed Demon",
      level: "Elite Tier",
      desc: "Solved 120 questions under 105 minutes",
      unlocked: true,
      date: "Unlocked Nov 17",
    },
    {
      id: "b4",
      title: "High Court Chamber Ready",
      level: "Advocate Apprentice",
      desc: "Verified research portfolio for senior chambers",
      unlocked: false,
      date: "In Progress (85%)",
    },
  ];

  // Vernacular Languages
  const supportedLanguages = [
    { code: "EN", name: "English (Consortium NLU Standard)", desc: "National Law School Entrance & All-India Bar Standard", popular: true },
    { code: "HI", name: "Hindi (हिंदी - उत्तर प्रदेश व मध्य प्रदेश न्यायिक सेवा)", desc: "State Judiciary, MP/UP CJ & CLAT Hindi Mode", popular: true },
    { code: "ML", name: "Malayalam (മലയാളം - കേരള നിയമ പ്രവേശന പരീക്ഷ)", desc: "KLEE Kerala Law Entrance & Kerala High Court Practice", popular: true },
    { code: "TA", name: "Tamil (தமிழ் - தமிழ்நாடு டாக்டர் அம்பேத்கர் சட்டப் பல்கலைக்கழகம்)", desc: "TNDALU Chennai & Madras Bar Council Entrance", popular: false },
    { code: "BN", name: "Bengali (বাংলা - পশ্চিমবঙ্গ জুডিশিয়াল সার্ভিস)", desc: "WBNUJS Kolkata & Calcutta High Court Practice", popular: false },
  ];

  // Bookmarked Items for Revision Notebook
  const bookmarkedItems = [
    {
      id: "bm1",
      type: "CBT Mock Question",
      title: "CLAT 2027 Mock 04 • Q.38: Promissory Estoppel against Government",
      meta: "Contract Law • Pass Pro",
      note: "Review Pournami Oil Mills v. State of Kerala for tax incentive estoppel exception.",
      date: "Saved 2 days ago",
    },
    {
      id: "bm2",
      type: "Bare Act Section",
      title: "Section 69 BNS 2023: Sexual intercourse by employing deceitful means",
      meta: "Criminal Law • BNS 2023",
      note: "Distinguish false promise to marry from consensual breach post-engagement.",
      date: "Saved yesterday",
    },
    {
      id: "bm3",
      type: "Landmark Judgment",
      title: "Kesavananda Bharati v. State of Kerala (1973) 4 SCC 225",
      meta: "Constitutional Law • Basic Structure",
      note: "13-judge bench, 7-6 majority holding Parliament cannot alter basic structure.",
      date: "Saved today",
    },
  ];

  // ==============================================================
  // EDUPYE LEARN SECTION DATA (11 SUB-SECTIONS, 6 SUBJECTS, 12 TOOLS)
  // ==============================================================
  const learnSubSectionsList = [
    { id: "subject" as const, label: "Subject", icon: BookOpen },
    { id: "practice" as const, label: "Practice", icon: Target },
    { id: "test" as const, label: "Test", icon: FileText },
    { id: "quiz" as const, label: "Quiz", icon: HelpCircle },
    { id: "history" as const, label: "History", icon: History },
    { id: "search" as const, label: "Search", icon: Search },
    { id: "game" as const, label: "Game", icon: Gamepad2 },
    { id: "homework" as const, label: "Home Work", icon: Layers },
    { id: "assignment" as const, label: "Assignment", icon: CheckSquare },
    { id: "tuition" as const, label: "Tuition", icon: UserCheck },
    { id: "combine_study" as const, label: "Combine Study", icon: Users },
  ];

  const learnSubjects = [
    {
      id: "const_law",
      category: "CONSTITUTIONAL LAW",
      categoryColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      title: "Constitutional Law & Fundamental Rights",
      chapters: 4,
      lessons: 12,
      badge: "Consortium Standard",
      accent: "from-amber-500 to-orange-500",
      courseRefId: "const_law_writs",
      colorTag: "amber",
      metaDesc: "Articles 12-35, basic structure doctrine, Article 32 & 226 writs, landmark SC benches.",
    },
    {
      id: "bns_2023",
      category: "CRIMINAL JURISPRUDENCE",
      categoryColor: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
      title: "Bharatiya Nyaya Sanhita (BNS 2023)",
      chapters: 4,
      lessons: 10,
      badge: "New 2024–2026 Code",
      accent: "from-rose-500 to-red-500",
      courseRefId: "bns_transition",
      colorTag: "rose",
      metaDesc: "Statutory mapping from IPC 1860, community service sentencing, organized crime sections.",
    },
    {
      id: "legal_aptitude",
      category: "LEGAL APTITUDE & REASONING",
      categoryColor: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
      title: "Deductive Legal Aptitude Drills",
      chapters: 4,
      lessons: 14,
      badge: "CLAT Core Pattern",
      accent: "from-indigo-500 to-purple-500",
      courseRefId: "ai_legal_tech",
      colorTag: "indigo",
      metaDesc: "Passage-based inference, ratio decidendi isolation, deductive syllogisms, strict liability.",
    },
    {
      id: "cpc_evidence",
      category: "CIVIL & EVIDENCE LAW",
      categoryColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      title: "Civil Procedure & Law of Evidence",
      chapters: 3,
      lessons: 11,
      badge: "Bar Examination",
      accent: "from-emerald-500 to-teal-500",
      courseRefId: "const_law_writs",
      colorTag: "emerald",
      metaDesc: "Res Judicata (Sec 11 CPC), burden of proof, electronic evidence under BSA 2023.",
    },
    {
      id: "contracts_torts",
      category: "COMMERCIAL & TORTS",
      categoryColor: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
      title: "Law of Contracts & Tortious Liability",
      chapters: 3,
      lessons: 12,
      badge: "1st Year LL.B Core",
      accent: "from-sky-500 to-blue-500",
      courseRefId: "ai_legal_tech",
      colorTag: "sky",
      metaDesc: "Offer, acceptance, breach remedies, negligence, volenti non fit injuria, strict liability.",
    },
    {
      id: "legal_english",
      category: "LEGAL LEXICON & WRITING",
      categoryColor: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
      title: "Latin Maxims & Appellate Drafting",
      chapters: 3,
      lessons: 10,
      badge: "Courtroom Advocacy",
      accent: "from-violet-500 to-fuchsia-500",
      courseRefId: "const_law_writs",
      colorTag: "violet",
      metaDesc: "Nemo judex in causa sua, Audi alteram partem, special leave petitions, writ drafting.",
    },
  ];

  const createToolsList = [
    { id: "chat", label: "Chat", icon: MessageSquare, description: "Wakheel AI Legal Copilot" },
    { id: "chapter", label: "Chapter", icon: BookOpen, description: "AI Curriculum Chapter Builder" },
    { id: "audio", label: "Audio", icon: Mic, description: "Legal Audio Podcasts & Lectures" },
    { id: "video", label: "Video", icon: Video, description: "Interactive Moot & Video Studio" },
    { id: "mind_map", label: "Mind Map", icon: Brain, description: "Case Law & Statutory Visual Tree" },
    { id: "summary", label: "Summary", icon: AlignLeft, description: "SC Ratio & Act Summarizer" },
    { id: "quiz", label: "Quiz", icon: CheckSquare, description: "Adaptive MCQ Drill Generator" },
    { id: "flash_card", label: "Flash Card", icon: Layers, description: "BNS vs IPC & Maxim Flashcards" },
    { id: "timeline", label: "Time Line", icon: Clock, description: "Landmark Precedents Chronology" },
    { id: "analyse", label: "Analyse", icon: BarChart2, description: "Percentile & Weak Area Diagnostic" },
    { id: "notes", label: "Notes", icon: PenTool, description: "Appellate Research Notebook" },
    { id: "bookmark", label: "Book Mark", icon: Bookmark, description: "Saved Bare Acts & Citations" },
  ];

  // Interactive Practice Questions
  const learnPracticeQuestions = [
    {
      id: "pq1",
      subject: "BNS 2023",
      tag: "Criminal Jurisprudence",
      question: "Under Section 69 of Bharatiya Nyaya Sanhita (BNS 2023), which of the following acts is specifically penalized?",
      options: [
        "A. Simple breach of contract in financial transactions",
        "B. Sexual intercourse by employing deceitful means such as false promise of employment or promotion, or marrying without intention",
        "C. Medical negligence in surgical treatment",
        "D. Defamation in online publications",
      ],
      correctIndex: 1,
      ratio: "Section 69 BNS 2023 explicitly codifies deceitful cohabitation on false promise of employment or marriage as a distinct non-bailable offense punishable with up to 10 years imprisonment.",
    },
    {
      id: "pq2",
      subject: "Constitutional Law",
      tag: "Fundamental Rights",
      question: "Which landmark 13-Judge bench Supreme Court ruling established that Parliament's constituent power under Article 368 cannot alter the Basic Structure of the Constitution?",
      options: [
        "A. Golaknath v. State of Punjab (1967)",
        "B. Shankari Prasad v. Union of India (1951)",
        "C. Kesavananda Bharati v. State of Kerala (1973)",
        "D. Minerva Mills v. Union of India (1980)",
      ],
      correctIndex: 2,
      ratio: "In Kesavananda Bharati (1973) 4 SCC 225, by a 7:6 majority, the Supreme Court ruled that while Parliament can amend any part of the Constitution, it cannot destroy its Basic Structure.",
    },
    {
      id: "pq3",
      subject: "Contracts & Torts",
      tag: "Tortious Liability",
      question: "The defense of 'Volenti Non Fit Injuria' is inapplicable in which of the following scenarios?",
      options: [
        "A. A spectator getting hit by a cricket ball inside a stadium",
        "B. A rescue operation where the rescuer willingly enters danger to save an innocent person from an actor's negligence",
        "C. A participant in a boxing match suffering a fractured rib",
        "D. A passenger voluntarily boarding an amusement park roller coaster",
      ],
      correctIndex: 1,
      ratio: "In Rescue Cases (e.g., Haynes v. Harwood), the defense of Volenti Non Fit Injuria is inapplicable because the plaintiff had a moral duty to intervene created by the defendant's wrongdoing.",
    },
  ];

  // Learn Sub-Section Games (Bare Act Section Sprint)
  const gameSprintQuestions = [
    {
      crime: "Murder (Punishment)",
      bnsSec: "Section 103 BNS",
      ipcOld: "Old Sec 302 IPC",
      options: ["Section 103 BNS", "Section 101 BNS", "Section 105 BNS", "Section 111 BNS"],
      correctIdx: 0,
    },
    {
      crime: "Organized Crime & Syndicates",
      bnsSec: "Section 111 BNS",
      ipcOld: "New Offense (previously state MCOCA)",
      options: ["Section 69 BNS", "Section 111 BNS", "Section 304 BNS", "Section 143 BNS"],
      correctIdx: 1,
    },
    {
      crime: "Cheating & Dishonestly Inducing Delivery",
      bnsSec: "Section 318(4) BNS",
      ipcOld: "Old Sec 420 IPC",
      options: ["Section 303 BNS", "Section 316 BNS", "Section 318(4) BNS", "Section 420 BNS"],
      correctIdx: 2,
    },
    {
      crime: "Snatching (Theft with sudden grabbing)",
      bnsSec: "Section 304 BNS",
      ipcOld: "New Distinct Section in 2023",
      options: ["Section 304 BNS", "Section 378 BNS", "Section 392 BNS", "Section 115 BNS"],
      correctIdx: 0,
    },
  ];

  // Homework & Assignments Data
  const homeworkList = [
    {
      id: "hw1",
      title: "Drafting a Regular Bail Petition under BNSS Section 480",
      subject: "Criminal Procedure (BNSS 2023)",
      dueDate: "Tomorrow, 11:59 PM",
      status: "Pending Submission",
      badge: "High Priority",
      faculty: "Adv. Sunita Deshmukh",
    },
    {
      id: "hw2",
      title: "Comparative Analysis: Promissory Estoppel in Government Tenders",
      subject: "Law of Contracts",
      dueDate: "In 3 Days",
      status: "In Progress",
      badge: "Case Brief",
      faculty: "Prof. K. Narayanan",
    },
    {
      id: "hw3",
      title: "Doctrine of Severability: AK Gopalan vs Maneka Gandhi Matrix",
      subject: "Constitutional Law",
      dueDate: "Completed",
      status: "Graded (9.5/10)",
      badge: "Verified",
      faculty: "Adv. Rohan Mehra",
    },
  ];

  // Virtual Peer Study Rooms
  const peerStudyRooms = [
    {
      id: "room1",
      name: "CLAT 2027 NLU Aspirants • Night Revision Room",
      members: 14,
      topic: "Principle-Fact Deductive Drills (Legal Reasoning Passages)",
      activeNow: true,
    },
    {
      id: "room2",
      name: "BNS 2023 vs IPC Concordance Bench Circle",
      members: 8,
      topic: "Offences against Body: Section 100-140 BNS Cross-Walk",
      activeNow: true,
    },
    {
      id: "room3",
      name: "Constitutional Writs & SLP Moot Court Prep",
      members: 6,
      topic: "Article 32 Public Interest Litigation Framing",
      activeNow: false,
    },
  ];

  // ==============================================================
  // 1. TESTBOOK-STYLE TEST SERIES DATA
  // ==============================================================
  const testSeriesPacks = [
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
  ];

  // ==============================================================
  // 2. LIVE BATCHES (BATCH JOINING) DATA
  // ==============================================================
  const liveBatches = [
    {
      id: "batch_clat_rankers",
      title: "CLAT 2027 Super-30 Rankers Foundation Batch",
      faculty: "Adv. Advithya Menon (NLSIU Gold Medalist) & Senior Faculty",
      exam: "CLAT 2027 (NLUs)",
      badge: "ADMISSIONS CLOSING SOON",
      startDate: "Batch Starts: 1st Dec 2026",
      schedule: "Mon - Fri • 6:30 PM - 8:30 PM (Live Interactive)",
      seatsLeft: "12 seats remaining of 50",
      price: 4999,
      originalPrice: 12000,
      discount: "58% OFF",
      features: [
        "250+ Hours Live Interactive Classes with 2-way audio & chat",
        "Complete CLAT Pass Pro Test Series (35 Full Mocks) included free",
        "Weekly 1-on-1 personalized mentor calls & doubt clearing",
        "Hardcopy printed bare act workbooks delivered to your home",
      ],
    },
    {
      id: "batch_klee_fastrack",
      title: "KLEE 2027 Kerala Law Entrance Weekend Crash Batch",
      faculty: "Adv. Vishnu P. (CEE Kerala Rank 1 Mentor)",
      exam: "KLEE 2027 (Kerala)",
      badge: "WEEKEND BATCH",
      startDate: "Batch Starts: 15th Dec 2026",
      schedule: "Saturday & Sunday • 10:00 AM - 1:00 PM",
      seatsLeft: "8 seats remaining",
      price: 2999,
      originalPrice: 6500,
      discount: "54% OFF",
      features: [
        "100 Hours focused weekend live revision & test discussions",
        "Last 10 Years KLEE question papers solved live in class",
        "Full Legal Aptitude syllabus simplified in Malayalam & English",
        "All 25 KLEE full length mock examinations included",
      ],
    },
    {
      id: "batch_distance_llb",
      title: "Distance LL.B & Open University Semester Mentorship Batch",
      faculty: "Prof. K. R. Sharma (Former Faculty of Law, DU)",
      exam: "Distance LL.B (IGNOU)",
      badge: "DISTANCE SPECIFIC",
      startDate: "Batch Starts: Open Enrollment",
      schedule: "Flexible Evening Sessions (Recorded + Weekly Live Q&A)",
      seatsLeft: "Open Admissions",
      price: 1999,
      originalPrice: 4500,
      discount: "55% OFF",
      features: [
        "Subject-by-subject breakdown of Year 1 & Year 2 university syllabi",
        "BNS 2023, Bharatiya Nagarik Suraksha Sanhita, and CPC mastery",
        "Guidance on high-scoring answer formatting for distance scholars",
        "Weekly assignments evaluated by practicing advocates",
      ],
    },
  ];

  // ==============================================================
  // 3. 1-ON-1 TUTOR HIRE (PERSONAL LEGAL MENTORS) DATA
  // ==============================================================
  const tutorsList = [
    {
      id: "tutor_nambiar",
      name: "Adv. K. R. Nambiar",
      title: "Senior Advocate & Bar Council Legal Educator",
      qualification: "High Court of Kerala • 8+ Years Advocacy Experience",
      specialties: ["CLAT Legal Aptitude", "Constitutional Law & Writs", "Courtroom Advocacy"],
      rating: "4.9",
      sessionsCount: "420+ Sessions",
      hourlyRate: 499,
      availableSlot: "Today Available • 6:00 PM & 8:00 PM",
      badge: "SENIOR ADVOCATE",
      avatarBg: "bg-amber-500 text-black",
      bio: "Former government pleader with extensive experience guiding law entrance aspirants and distance LL.B scholars into top legal chambers.",
    },
    {
      id: "tutor_meera",
      name: "Adv. Meera Sen",
      title: "NLSIU Bangalore Alum • AIR 34 CLAT Ranker",
      qualification: "BA LL.B (Hons.), NLSIU • Corporate & IP Counsel",
      specialties: ["Critical Legal Reasoning", "CLAT Exam Strategy", "Contract Law"],
      rating: "5.0",
      sessionsCount: "310+ Sessions",
      hourlyRate: 599,
      availableSlot: "Tomorrow Available • 5:30 PM & 7:00 PM",
      badge: "TOPPER MENTOR",
      avatarBg: "bg-black text-white dark:bg-white dark:text-black",
      bio: "Secured All-India Rank 34 in CLAT. Specializes in transforming average test scores through speed reading and principle-fact breakdown techniques.",
    },
    {
      id: "tutor_rajesh",
      name: "Prof. Rajesh Varma",
      title: "Former Law Faculty & Moot Court Adjudicator",
      qualification: "LL.M, Ph.D in Constitutional Law • 12+ Years Teaching",
      specialties: ["Distance LL.B Syllabus", "BNS 2023 Reforms", "Answer Writing Formats"],
      rating: "4.8",
      sessionsCount: "540+ Sessions",
      hourlyRate: 449,
      availableSlot: "Weekend Slots Available • Flexible Hours",
      badge: "ACADEMIC EXPERT",
      avatarBg: "bg-amber-500 text-black",
      bio: "Dedicated mentor for open university scholars (IGNOU/State Open) navigating examinations, bare act mastery, and thesis submissions.",
    },
  ];

  // Sample Mock Test Data for Free CBT Mock
  const sampleFreeMock = {
    title: "CLAT 2027 Diagnostic Mock 01 (Consortium Pattern)",
    timeMinutes: 120,
    questions: [
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
  };

  // Filtered Test Series
  const filteredTestSeries = testSeriesPacks.filter((pack) => {
    const matchesFilter =
      activeExamFilter === "All Exams" || pack.exam === activeExamFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      pack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pack.conductingBody.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtered Batches
  const filteredBatches = liveBatches.filter((batch) => {
    const matchesFilter =
      activeExamFilter === "All Exams" || batch.exam === activeExamFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      batch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.faculty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Handle Enrollment / Purchase Click
  const handleOpenPurchase = (item: {
    type: "test_series" | "batch" | "tutor";
    title: string;
    price: number;
    originalPrice: number;
    features: string[];
    extraNote?: string;
  }) => {
    setPurchaseItem(item);
    setPurchaseSuccess(false);
    setIsCheckingOut(false);
  };

  const handleConfirmPurchase = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setPurchaseSuccess(true);
      setTimeout(() => {
        setPurchaseItem(null);
      }, 1500);
    }, 900);
  };

  // Handle 1-on-1 Tutor Booking
  const handleOpenTutorBooking = (tutor: any) => {
    setSelectedTutor(tutor);
    setBookingSuccess(false);
  };

  const handleConfirmTutorBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setSelectedTutor(null);
    }, 1500);
  };

  // Mock Test Submission
  const handleSelectMockAnswer = (qIdx: number, optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const calculateMockScore = () => {
    let score = 0;
    sampleFreeMock.questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      if (selected !== undefined) {
        if (selected === q.correct) score += 1;
        else score -= 0.25;
      }
    });
    setMockScore(score);
  };

  // AI Chat Assistant
  const handleSendAiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim() || isAiThinking) return;

    const userMsg = {
      sender: "user" as const,
      text: aiChatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setAiChatMessages((prev) => [...prev, userMsg]);
    setAiChatInput("");
    setIsAiThinking(true);

    setTimeout(() => {
      setIsAiThinking(false);
      let reply =
        "In legal reasoning for CLAT & KLEE, always read the Principle as absolute truth. For contract breach under S.73 ICA, remote losses cannot be claimed without prior notice (Hadley v. Baxendale). Would you like to practice another test question?";
      if (userMsg.text.toLowerCase().includes("tutor") || userMsg.text.toLowerCase().includes("batch")) {
        reply =
          "You can enroll in our CLAT 2027 Super-30 Batch or hire Adv. K. R. Nambiar (Senior Advocate) or Adv. Meera Sen (AIR 34) for 1-on-1 mentoring right from the dashboard tabs above!";
      } else if (userMsg.text.toLowerCase().includes("bns") || userMsg.text.toLowerCase().includes("criminal")) {
        reply =
          "Under BNS 2023, Section 103 defines Murder, and community service has been introduced for petty theft. Check our Distance LL.B test bank for the full section cross-reference.";
      }
      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 700);
  };

  // ==============================================================
  // 4. BARE ACTS & STATUTORY REPOSITORY DATA
  // ==============================================================
  const bareActsList = [
    {
      id: "bns",
      title: "Bharatiya Nyaya Sanhita (BNS 2023)",
      code: "Act 45 of 2023",
      tag: "CRIMINAL LAW REFORM",
      sectionsCount: "358 Sections",
      highlight:
        "Replaced IPC 1860; introduced community service, mob lynching (S.103(2)), organized crime, and snatching (S.304).",
      keyChapters: [
        {
          title: "Offences Affecting the Human Body",
          sec: "Sections 100 - 146",
          desc: "Murder defined under Section 103 with capital punishment or life imprisonment. Section 106(2) provides penal sanctions for hit-and-run fatalities without reporting.",
        },
        {
          title: "Offences Against Property & Snatching",
          sec: "Sections 303 - 334",
          desc: "Section 304 penalizes Snatching as an independent aggravated theft offense. Community service introduced as an alternative punishment for petty theft under ₹5,000.",
        },
        {
          title: "Crimes Against Women & Children",
          sec: "Sections 63 - 99",
          desc: "Gang rape punishable with rigorous imprisonment not less than 20 years or life. Sexual intercourse by deceitful promise of marriage criminalized under Section 69.",
        },
      ],
      pdfUrl: "#",
    },
    {
      id: "constitution",
      title: "Constitution of India (1950)",
      code: "Supreme Lex of India",
      tag: "CONSTITUTIONAL LAW",
      sectionsCount: "395 Articles • 12 Schedules",
      highlight:
        "The bedrock of CLAT & judicial exams: Fundamental Rights (Part III), Judicial Review (Art 32 & 226), and Basic Structure Doctrine.",
      keyChapters: [
        {
          title: "Part III - Fundamental Rights & The Golden Triangle",
          sec: "Articles 12 - 35",
          desc: "Article 14 (Equality), Article 19 (Six Freedoms), and Article 21 (Personal Liberty - Maneka Gandhi principle of just, fair, reasonable procedure established by law).",
        },
        {
          title: "Part V - Union Judiciary & Special Leave Petitions",
          sec: "Articles 124 - 147",
          desc: "Supreme Court as Court of Record (Art 129), Original jurisdiction (Art 131), Appellate jurisdiction (Art 132-134), and discretionary Special Leave under Article 136.",
        },
        {
          title: "Part XX - Constitutional Amendments & Basic Structure",
          sec: "Article 368",
          desc: "Amending power of Parliament subject to Kesavananda Bharati limitation: Basic features (Secularism, Federalism, Rule of Law, Judicial Review) cannot be abrogated.",
        },
      ],
      pdfUrl: "#",
    },
    {
      id: "cpc",
      title: "Code of Civil Procedure (CPC 1908)",
      code: "Act 5 of 1908",
      tag: "CIVIL ADJUDICATION",
      sectionsCount: "158 Sections • 51 Orders",
      highlight:
        "Standard procedural machinery for civil litigation, Res Judicata (S.11), Inherent powers (S.151), and Temporary Injunctions (Order 39).",
      keyChapters: [
        {
          title: "Jurisdiction & Res Judicata",
          sec: "Sections 9 - 11",
          desc: "Section 9 grants jurisdiction to try all civil suits unless barred. Section 11 bars re-litigation of issues directly and substantially in issue.",
        },
        {
          title: "Pleadings, Plaint & Written Statement",
          sec: "Orders VI, VII, VIII",
          desc: "Material facts must be pleaded without stating evidence. Order VII Rule 11 grounds for plaint rejection (no cause of action, barred by statute, undervalued).",
        },
        {
          title: "Temporary Injunctions & Interlocutory Orders",
          sec: "Order XXXIX Rules 1 - 5",
          desc: "The classic threefold test for interim relief: (1) Prima facie case, (2) Balance of convenience, (3) Irreparable injury not compensable by damages.",
        },
      ],
      pdfUrl: "#",
    },
    {
      id: "contract",
      title: "Indian Contract Act (1872)",
      code: "Act 9 of 1872",
      tag: "COMMERCIAL & OBLIGATIONS",
      sectionsCount: "238 Sections",
      highlight:
        "Formation of valid contracts, Void agreements, Frustration of contract (S.56), and Breach of contract damages (S.73 Hadley v. Baxendale rule).",
      keyChapters: [
        {
          title: "Formation, Offer, Acceptance & Consideration",
          sec: "Sections 2 - 30",
          desc: "Valid proposal, unconditional acceptance, lawful consideration under Section 2(d), capacity of parties (Mohori Bibee minor rule), and agreements in restraint of trade.",
        },
        {
          title: "Discharge of Contract & Doctrine of Frustration",
          sec: "Sections 56 - 67",
          desc: "Agreements to do impossible acts are void. Supervening impossibility dissolves contracts under the doctrine of frustration (Satyabrata Ghose v. Mugneeram Bangur).",
        },
        {
          title: "Breach of Contract & Compensation for Loss",
          sec: "Sections 73 - 75",
          desc: "Hadley v. Baxendale rule codified: Damages naturally arising from breach are recoverable; remote or indirect losses require special communication of extraordinary circumstances.",
        },
      ],
      pdfUrl: "#",
    },
  ];

  // ==============================================================
  // 5. ALL-INDIA PERCENTILE & RANK ANALYTICS DATA
  // ==============================================================
  const analyticsData = {
    percentile: 94.8,
    airRank: 412,
    totalAspirants: 72000,
    testsAttempted: 6,
    avgScore: 92.4,
    accuracyRate: 86.4,
    negativeMarkLoss: -3.75,
    subjectBreakdown: [
      { name: "Legal Reasoning", score: 91, avgTime: "1.8 mins/passage", status: "Strength" },
      { name: "English Comprehension", score: 88, avgTime: "1.5 mins/passage", status: "High" },
      { name: "Logical Reasoning", score: 84, avgTime: "2.1 mins/passage", status: "Good" },
      { name: "Current Affairs & Legal GK", score: 78, avgTime: "0.6 mins/question", status: "Needs Revision" },
      { name: "Quantitative Techniques", score: 69, avgTime: "2.4 mins/question", status: "Priority Focus" },
    ],
    recentTestHistory: [
      { testName: "CLAT 2027 Diagnostic CBT Mock 01", score: "94.5 / 120", percentile: "94.8%", rank: "AIR 412", date: "Today" },
      { testName: "KLEE 2027 Comprehensive State Mock 01", score: "154 / 200", percentile: "95.2%", rank: "AIR 142", date: "2 days ago" },
      { testName: "AILET Critical Aptitude Booster Mock", score: "68 / 90", percentile: "92.1%", rank: "AIR 210", date: "4 days ago" },
      { testName: "Distance LL.B Constitutional Law Bank", score: "88 / 100", percentile: "96.4%", rank: "Top 5%", date: "1 week ago" },
    ],
  };

  // ==============================================================
  // 6. CHAMBER CLERKSHIPS & INTERNSHIPS DATA
  // ==============================================================
  const internshipsList = [
    {
      id: "sc_aor",
      title: "Appellate Research & Judicial Clerkship",
      chamber: "Chamber of Senior Adv. K. Raghavan, Supreme Court of India",
      location: "New Delhi (Hybrid)",
      stipend: "₹15,000 / month",
      duration: "3 Months",
      badge: "SUPREME COURT",
      type: "Appellate Litigation",
      deadline: "Closes in 5 Days",
      requirements: [
        "Enrolled in 3rd+ Year of 5-Yr BA LL.B or Final Year 3-Yr LL.B",
        "Proficiency in Supreme Court Special Leave Petitions (SLPs) research",
        "Familiarity with SCC Online and Manupatra citation formats",
      ],
    },
    {
      id: "hc_kerala",
      title: "High Court Appellate Litigation Trainee",
      chamber: "Appellate Chambers of Adv. V. P. Nambiar",
      location: "Kochi, Kerala (On-site)",
      stipend: "₹10,000 / month",
      duration: "2 Months",
      badge: "HIGH COURT",
      type: "Writ & Criminal Appeals",
      deadline: "Closes in 8 Days",
      requirements: [
        "Knowledge of High Court writ procedures under Article 226",
        "Assisting in drafting bail applications under S.483 BNSS",
        "Bilingual drafting competence in English and Malayalam",
      ],
    },
    {
      id: "dlsa_aid",
      title: "Pro Bono Undertrial Legal Aid Fellow",
      chamber: "District Legal Services Authority (DLSA)",
      location: "District Courts (Multiple Locations)",
      stipend: "₹6,000 / month",
      duration: "6 Weeks",
      badge: "LEGAL AID CLINIC",
      type: "Criminal Access to Justice",
      deadline: "Open Admissions",
      requirements: [
        "Passion for grassroots indigent criminal defense and legal aid",
        "Assisting duty counsel in filing statutory bail applications",
        "Field documentation and legal literacy clinics coordination",
      ],
    },
    {
      id: "corp_firm",
      title: "Corporate & M&A Due Diligence Clerk",
      chamber: "Vanguard Corporate & Commercial Law Partners",
      location: "Bengaluru / Mumbai",
      stipend: "₹25,000 / month",
      duration: "6 Months",
      badge: "TIER-1 CORPORATE",
      type: "Corporate & Commercial",
      deadline: "Closes in 12 Days",
      requirements: [
        "Top 15% academic standing in law entrance or university semester",
        "Companies Act 2013 and SEBI takeover regulations coursework",
        "Strong diligence review and contract clause redlining acumen",
      ],
    },
  ];

  // ==============================================================
  // 7. WEEKLY CLASS & MOCK TEST TIMETABLE DATA
  // ==============================================================
  const weeklySchedule = [
    {
      id: "s1",
      day: "Monday",
      time: "6:30 PM - 8:30 PM",
      title: "CLAT 2027: Constitutional Writs & Article 21 Masterclass",
      faculty: "Adv. Advithya Menon (NLSIU Gold Medalist)",
      type: "Live Batch",
      isToday: true,
      roomLink: "#",
      status: "Upcoming Today",
    },
    {
      id: "s2",
      day: "Monday",
      time: "9:00 PM - 9:45 PM",
      title: "1-on-1 Legal Mentorship: Contract Damages Hadley Rule",
      faculty: "Adv. K. R. Nambiar (Senior Advocate)",
      type: "1-on-1 Mentor",
      isToday: true,
      roomLink: "#",
      status: "Booked Slot",
    },
    {
      id: "s3",
      day: "Tuesday",
      time: "7:00 PM - 8:30 PM",
      title: "BNS 2023 vs IPC 1860 Full Section Transition Analysis",
      faculty: "Prof. Dr. Rajesh Varma",
      type: "Live Workshop",
      isToday: false,
      roomLink: "#",
      status: "Tomorrow",
    },
    {
      id: "s4",
      day: "Wednesday",
      time: "6:30 PM - 8:00 PM",
      title: "Logical Reasoning: Syllogisms & Hidden Assumption Traps",
      faculty: "Adv. Meera Sen (AIR 34)",
      type: "Live Batch",
      isToday: false,
      roomLink: "#",
      status: "Scheduled",
    },
    {
      id: "s5",
      day: "Thursday",
      time: "8:00 PM - 9:30 PM",
      title: "Open University Distance LL.B: Civil Procedure Pleadings",
      faculty: "Prof. K. R. Sharma",
      type: "Evening Lecture",
      isToday: false,
      roomLink: "#",
      status: "Scheduled",
    },
    {
      id: "s6",
      day: "Saturday",
      time: "10:00 AM - 12:00 PM",
      title: "All-India CLAT 2027 Full Length CBT Mock Test 02 (120 Mins)",
      faculty: "Wakheel Examination Board",
      type: "All-India Mock",
      isToday: false,
      roomLink: "#",
      status: "CBT Window Open",
    },
    {
      id: "s7",
      day: "Sunday",
      time: "11:00 AM - 1:00 PM",
      title: "Mock Test 02 Video Walkthrough & All-India Rank Reveal",
      faculty: "Full Faculty Panel",
      type: "Live Analysis",
      isToday: false,
      roomLink: "#",
      status: "Scheduled",
    },
  ];

  // Full 17-item EduPye Student Navigation matching live EduPye platform
  const eduPyeStudentNavItems = [
    { id: "home" as StudentNavSection, label: "Home", icon: Home },
    { id: "learn" as StudentNavSection, label: "Learn", icon: BookOpen, badge: "Curricula" },
    { id: "library" as StudentNavSection, label: "Library", icon: Library },
    { id: "notebook" as StudentNavSection, label: "Notebook", icon: BookText },
    { id: "upload" as StudentNavSection, label: "Upload", icon: Upload },
    { id: "record" as StudentNavSection, label: "Record", icon: Mic },
    { id: "batches" as StudentNavSection, label: "Live Classes", icon: Video, badge: "Live" },
    { id: "tuition_mode" as StudentNavSection, label: "Tuition Mode", icon: UserCheck, badge: "Chamber" },
    { id: "calendar" as StudentNavSection, label: "Calendar", icon: Calendar },
    { id: "exam_cracker" as StudentNavSection, label: "Exam Cracker", icon: Sparkles, badge: "Drills" },
    { id: "homework" as StudentNavSection, label: "Homework", icon: ClipboardList, badge: "2 Due" },
    { id: "tests" as StudentNavSection, label: "Tests", icon: CheckSquare },
    { id: "my_courses" as StudentNavSection, label: "My Courses", icon: Layers },
    { id: "bookshelf" as StudentNavSection, label: "Book shelf", icon: BookMarked },
    { id: "projects" as StudentNavSection, label: "Projects", icon: TrendingUp },
    { id: "three_d_lab" as StudentNavSection, label: "3D Lab", icon: FlaskConical },
    { id: "bookmarks" as StudentNavSection, label: "Bookmarks", icon: Bookmark },
  ];

  const isNavActive = (id: string) => {
    if (activeSection === id) return true;
    if (id === "home" && (activeSection === "home" || activeSection === "test_series")) return true;
    if (id === "tests" && (activeSection === "tests" || activeSection === "free_mocks")) return true;
    if (id === "calendar" && (activeSection === "calendar" || activeSection === "schedule")) return true;
    if (id === "library" && (activeSection === "library" || activeSection === "bare_acts")) return true;
    if (id === "tuition_mode" && (activeSection === "tuition_mode" || activeSection === "tutors")) return true;
    return false;
  };

  const handleNavClick = (id: StudentNavSection) => {
    setActiveSection(id);
    if (id === "tests" || id === "free_mocks") {
      setActiveMockTest(sampleFreeMock);
      setSelectedAnswers({});
      setMockScore(null);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex font-sans transition-colors duration-200">
      {/* ============================================================== */}
      {/* 1. LEFT SIDEBAR (DESKTOP) - SPACIOUS & EXPANDABLE / COLLAPSIBLE */}
      {/* ============================================================== */}
      <aside
        className={`hidden md:flex shrink-0 ${
          isSidebarExpanded ? "w-64" : "w-16"
        } bg-white dark:bg-zinc-950 border-0 flex-col justify-between sticky top-0 h-screen z-30 select-none transition-all duration-300 overflow-visible`}
      >
        {isSidebarExpanded ? (
          /* ============================================================== */
          /* EXPANDED SPACIOUS SIDEBAR (DEFAULT)                            */
          /* ============================================================== */
          <div className="flex flex-col h-full min-h-0 w-full">
            {/* Header: Logo + Title + Collapse Button */}
            <div className="p-4 flex items-center justify-between border-0 shrink-0">
              <Link href="/academy" className="flex items-center gap-2.5 group min-w-0" title="EduPye Academy">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black shadow-sm group-hover:bg-black group-hover:text-white transition-colors shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0 truncate">
                  <div className="text-xs font-black tracking-wider text-black dark:text-white truncate">
                    EDUPYE <span className="text-amber-500">ACADEMY</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono truncate">Student Workspace</div>
                </div>
              </Link>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer shrink-0 ml-1"
                title="Collapse to Icon Rail"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation List - Smoothly scrollable with generous padding */}
            <div className="flex-1 overflow-y-auto scrollbar-none px-3 py-2 space-y-1 min-h-0">
              {eduPyeStudentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isNavActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full px-3 py-2 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer group ${
                      isActive
                        ? "bg-amber-500 text-black font-extrabold shadow-sm"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-black" : "text-zinc-500 group-hover:text-amber-500 transition-colors"
                        }`}
                      />
                      <span className="text-xs truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          isActive
                            ? "bg-black/15 text-black"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Stack: Clean ThemeToggle & Exit */}
            <div className="p-3 border-0 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-950">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <span className="text-[11px] text-zinc-500 font-medium">Theme</span>
              </div>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="px-2.5 py-1.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* COMPACT AIRY ICON RAIL (BORDER-0 & FULLY VISIBLE TOOLTIPS)     */
          /* ============================================================== */
          <div className="flex flex-col h-full items-center justify-between py-3 min-h-0 w-full overflow-visible">
            {/* Top: Logo + Expand Button */}
            <div className="flex flex-col items-center gap-2 w-full shrink-0 pb-1 border-0">
              <div className="relative group flex items-center justify-center w-full">
                <Link
                  href="/academy"
                  className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-black text-black hover:text-white flex items-center justify-center font-black transition-all shadow-md cursor-pointer"
                  title="EduPye Academy"
                >
                  <GraduationCap className="w-5 h-5 text-current" />
                </Link>
                <div
                  style={{
                    left: "calc(100% + 12px)",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                  className="absolute px-3 py-1.5 bg-zinc-950 border border-zinc-800 text-white text-xs font-bold rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-[100] flex items-center gap-1.5"
                >
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-950 border-l border-b border-zinc-800 rotate-45" />
                  <span className="relative z-10">EduPye Academy</span>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                className="w-7 h-7 rounded-lg text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
                title="Expand Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Icons - Scrollable with Tooltips */}
            <div className="flex-1 w-full py-1 flex flex-col items-center gap-1 min-h-0 overflow-y-auto scrollbar-none overflow-x-visible">
              {eduPyeStudentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isNavActive(item.id);
                return (
                  <div key={item.id} className="relative group flex items-center justify-center w-full">
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold scale-105"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                      aria-label={item.label}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                    </button>

                    {/* Floating Tooltip */}
                    <div
                      style={{
                        left: "calc(100% + 12px)",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                      className="absolute px-3 py-1.5 bg-zinc-950 border border-zinc-800 text-white text-xs font-bold rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-[100] flex items-center gap-2"
                    >
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-950 border-l border-b border-zinc-800 rotate-45" />
                      <span className="relative z-10">{item.label}</span>
                      {item.badge && (
                        <span className="relative z-10 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500 text-black font-extrabold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions: ThemeToggle & SignOut */}
            <div className="flex flex-col items-center gap-2 pt-1 border-0 w-full px-2 shrink-0">
              <ThemeToggle />
              {onSignOut && (
                <div className="relative group flex items-center justify-center w-full">
                  <button
                    onClick={onSignOut}
                    className="w-8 h-8 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center cursor-pointer transition-colors"
                    title="Log out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                  <div
                    style={{
                      left: "calc(100% + 12px)",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                    className="absolute px-3 py-1.5 bg-zinc-950 border border-zinc-800 text-red-400 text-xs font-bold rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-[100] flex items-center gap-1.5"
                  >
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-950 border-l border-b border-zinc-800 rotate-45" />
                    <span className="relative z-10">Log out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* ============================================================== */}
      {/* MOBILE DRAWER SIDEBAR                                          */}
      {/* ============================================================== */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="relative z-10 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between h-full p-4 space-y-4 shadow-2xl">
            <div className="space-y-4 flex-1 overflow-y-auto scrollbar-none">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-black flex items-center justify-center font-black">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="font-black text-sm text-black dark:text-white">
                    EDUPYE <span className="text-amber-500">ACADEMY</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {eduPyeStudentNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isNavActive(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleNavClick(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? "bg-amber-500 text-black font-extrabold shadow-xs"
                          : "text-zinc-800 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span className="text-xs">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
              {onSwitchToTeacher && (
                <button
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    onSwitchToTeacher();
                  }}
                  className="w-full py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold cursor-pointer"
                >
                  Switch to Faculty Studio
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MAIN CONTENT AREA (RIGHT OF EDUPYE SIDEBAR)                 */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa] dark:bg-black min-h-screen text-black dark:text-white">
        {/* ============================================================== */}
        {/* UNIFIED STICKY TOP NAVBAR (ANNOUNCEMENT STRIP + SUBHEADER)    */}
        {/* ============================================================== */}
        <div className="sticky top-0 z-20 w-full bg-slate-50/90 dark:bg-zinc-950 border-b border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          {/* Row 1: Top Announcement Strip matching EduPye reference */}
          <div className="bg-[#0f172a] text-white px-4 sm:px-6 lg:px-8 py-2 border-b border-zinc-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
              <div className="flex items-center gap-1.5 shrink-0">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span className="font-extrabold text-white tracking-tight">EduPye Centralized Tuition</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 shrink-0">
                Code: STU-008AC5
              </span>
              <button
                onClick={() => setShowGrantModal(true)}
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-amber-500 hover:text-black text-zinc-200 border border-white/20 text-[10px] font-bold transition-all cursor-pointer shrink-0"
                title="Request Tuition Grant & Scholarship Access"
              >
                <Award className="w-3 h-3 text-amber-400" />
                <span>Request Tuition Access</span>
              </button>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleNavClick("tuition_mode")}
                className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[11px] transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>Change to Tuition Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {onSwitchToTeacher && (
                <button
                  onClick={onSwitchToTeacher}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-[11px] transition-all shrink-0 cursor-pointer"
                >
                  <span>Faculty Mode</span>
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Subheader matching EduPye style (Soft Shade-of-White) */}
          <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-4 bg-slate-50/95 dark:bg-zinc-950/95 backdrop-blur-md">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                title="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-black dark:text-white truncate tracking-tight">
                  {(activeSection === "home" || activeSection === "test_series") && "Explore Courses & Materials"}
                  {activeSection === "learn" && "My Learning & Curricula"}
                  {activeSection === "library" && "Digital Law & Curricula Library"}
                  {activeSection === "notebook" && "Cornell Revision Notebook"}
                  {activeSection === "upload" && "Document & Case Brief Upload Portal"}
                  {activeSection === "record" && "Moot Court & Oral Argument Recording Studio"}
                  {activeSection === "batches" && "Live Classes & Interactive Batches"}
                  {activeSection === "tuition_mode" && "EduPye Centralized Tuition Mode"}
                  {activeSection === "calendar" && "Live Timetable & Academic Calendar"}
                  {activeSection === "exam_cracker" && "High-Yield Exam Cracker & Flashcard Drills"}
                  {activeSection === "homework" && "Homework & Assignment Tracker"}
                  {activeSection === "tests" && "CBT Mock Tests & Diagnostic Simulator"}
                  {activeSection === "my_courses" && "Enrolled Courses & Active Modules"}
                  {activeSection === "bookshelf" && "Virtual Legal Book Shelf"}
                  {activeSection === "projects" && "Moot Memorials & Research Projects"}
                  {activeSection === "three_d_lab" && "Interactive 3D Courtroom Lab"}
                  {activeSection === "bookmarks" && "Saved Precedents & Bookmarked Notes"}
                  {activeSection === "bare_acts" && "Bare Acts & Statutory Compendium"}
                  {activeSection === "free_mocks" && "Free Diagnostic CBT Mock Simulator"}
                  {activeSection === "ai_tutor" && "Wakheel Legal AI Doubt Solver"}
                  {activeSection === "tutors" && "1-on-1 Advocate Tutors & Mentors"}
                  {activeSection === "analytics" && "All-India Rank & Percentile Predictor"}
                  {activeSection === "internships" && "Chamber Clerkships & Internships"}
                  {activeSection === "schedule" && "Weekly Live Class & Test Timetable"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Globe Language Switcher (EduPye Style) */}
              <button
                onClick={() => setShowLanguageModal(true)}
                className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold font-mono"
                title={`Current Curricula Language: ${selectedLanguage}`}
              >
                <Globe className="w-4 h-4 text-amber-500" />
                <span className="hidden xl:inline text-[11px]">{selectedLanguage.slice(0, 2).toUpperCase()}</span>
              </button>

              {/* Bookmark Revision Notebook (EduPye Style) */}
              <button
                onClick={() => setShowBookmarksDrawer(true)}
                className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer relative"
                title="Revision Notebook & Bookmarks"
              >
                <Bookmark className="w-4 h-4 text-amber-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
              </button>

              {/* Search Bar matching EduPye */}
              <div className="hidden sm:flex items-center w-52 lg:w-72">
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={activeSection === "learn" ? "Search topics..." : "Search..."}
                    className="w-full pl-9 pr-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Interactive Trophy Leaderboard / Rank pill (EduPye Style) */}
              <button
                onClick={() => setShowLeaderboardDrawer(true)}
                className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                title="View All-India Hall of Fame & Badges"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
              </button>

              <div className="md:hidden">
                <ThemeToggle />
              </div>

              {/* Circular Avatar matching EduPye */}
              <button
                onClick={() => setShowProfileDrawer(true)}
                className="w-9 h-9 rounded-full bg-amber-500 text-black font-extrabold text-xs flex items-center justify-center uppercase cursor-pointer shadow-xs ring-2 ring-amber-500/20 hover:scale-105 transition-all"
                title="Open Profile"
              >
                {studentProfile.fullName.charAt(0)}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Body */}
        <main className={`flex-1 w-full ${activeSection === "learn" ? "p-0 space-y-0" : "px-4 sm:px-6 lg:px-8 py-6 space-y-6"}`}>
          {/* EduPye-style Category Navigation Header for Explore & Other Sections */}
          {activeSection !== "learn" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
                    {(activeSection === "home" || activeSection === "test_series") && "Explore"}
                    {activeSection === "library" && "Digital Library"}
                    {activeSection === "notebook" && "Cornell Notes"}
                    {activeSection === "upload" && "Uploaded Documents"}
                    {activeSection === "record" && "Recording Studio"}
                    {activeSection === "tuition_mode" && "Centralized Tuition Chamber"}
                    {activeSection === "exam_cracker" && "Exam Cracker"}
                    {activeSection === "homework" && "Homework & Tasks"}
                    {activeSection === "tests" && "Mock Tests"}
                    {activeSection === "my_courses" && "My Courses"}
                    {activeSection === "bookshelf" && "Book Shelf"}
                    {activeSection === "projects" && "Projects"}
                    {activeSection === "three_d_lab" && "3D Lab"}
                    {activeSection === "bookmarks" && "Bookmarks"}
                    {activeSection === "bare_acts" && "Bare Acts"}
                    {activeSection === "batches" && "Live Batches"}
                    {activeSection === "free_mocks" && "CBT Simulator"}
                    {activeSection === "ai_tutor" && "AI Doubt Solver"}
                    {activeSection === "tutors" && "Advocate Mentors"}
                    {activeSection === "analytics" && "Rank Analytics"}
                    {activeSection === "internships" && "Chamber Clerkships"}
                    {activeSection === "schedule" && "Weekly Schedule"}
                  </h2>
                </div>

                <button
                  onClick={() => setActiveExamFilter("For You")}
                  className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  View all
                </button>
              </div>

              {/* Category Pills matching EduPye row for Explore */}
              {(activeSection === "home" || activeSection === "test_series") && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {examFilters.map((filter) => {
                    const isActive = activeExamFilter === filter;
                    return (
                      <button
                        key={filter}
                        onClick={() => setActiveExamFilter(filter)}
                        className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          isActive
                            ? "bg-amber-500 text-black font-extrabold shadow-xs"
                            : "bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 hover:text-black dark:hover:text-white font-medium"
                        }`}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 1: EXPLORE & COURSES (EDUPYE SCREENSHOT MATCH)         */}
          {/* ============================================================== */}
          {(activeSection === "test_series" || activeSection === "home") && (
            <div className="space-y-8 animate-in fade-in duration-150">
              {/* ============================================================== */}
              {/* EDUPYE-STYLE FEATURED CURRICULA (3-COL MINIMALIST CARDS)      */}
              {/* ============================================================== */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {masterclassCourses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelectedCourseForPortal(course);
                      setPortalTab("video");
                      setPortalVideoPlaying(false);
                      setPortalQuizAnswers({});
                      setPortalQuizSubmitted(false);
                    }}
                    className="group rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 overflow-hidden shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
                  >
                    {/* Top Media Image Banner */}
                    <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

                      {/* EduPye Sections Pill: [ ≡ 20 Sections ] */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/10 shadow-xs">
                        <AlignLeft className="w-3.5 h-3.5 text-zinc-300" />
                        <span>{course.unitsCount}</span>
                      </div>
                    </div>

                    {/* Card Body - Exactly 2 Clean Lines matching EduPye */}
                    <div className="p-4 sm:p-5 space-y-1">
                      <h3 className="text-base font-bold text-black dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                        {course.dateAdded}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Wakheel Pass Pro All-India Law Entrance CBT Series */}
              <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950 text-white border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-amber-500 text-black font-extrabold text-[10px] uppercase font-mono">
                      WAKHEEL PASS PRO
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">All-India Law Entrance Test Series</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    Unlock 100+ CBT Full Mocks for CLAT 2027, KLEE &amp; AILET
                  </h3>
                  <p className="text-xs text-zinc-300 max-w-2xl">
                    Full length timed mocks with Consortium negative marking (-0.25), all-India rank prediction, and video solutions.
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-zinc-400 line-through">₹2,999</div>
                    <div className="text-xl font-bold text-amber-400 font-mono">₹999 / yr</div>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenPurchase({
                        type: "test_series",
                        title: "Wakheel All-Access Law Pass Pro 2027",
                        price: 999,
                        originalPrice: 2999,
                        features: [
                          "All 35 Full Length CLAT 2027 Mock Tests with negative marking",
                          "25 KLEE Kerala Entrance full length mocks (+3 / -1)",
                          "15 High-difficulty AILET NLU Delhi mock tests",
                          "40 Distance LL.B subject-wise question banks",
                          "All-India Percentile & Rank Predictor",
                        ],
                      })
                    }
                    className="px-6 py-3 rounded-full bg-amber-500 hover:bg-white hover:text-black text-black font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                  >
                    Buy Pass Pro →
                  </button>
                </div>
              </div>

              {/* Section Separator */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h3 className="text-base font-bold text-black dark:text-white tracking-tight">
                    Testbook-Style All-India Entrance Mock Packages
                  </h3>
                </div>
                <span className="text-xs text-zinc-400 font-mono">Timed CBT Mode • Instant All-India Rank</span>
              </div>

              {/* Test Series Cards Grid (Testbook Style) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTestSeries.map((pack) => (
                <div
                  key={pack.id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header Row: Badge & Enrolled */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
                        {pack.badge}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <span className="flex items-center gap-1 font-bold text-black dark:text-white">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {pack.rating}
                        </span>
                        <span className="font-medium">({pack.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Title & Body */}
                    <div>
                      <h3 className="text-base font-extrabold text-black dark:text-white leading-snug">
                        {pack.title}
                      </h3>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1 font-medium">
                        {pack.conductingBody}
                      </p>
                    </div>

                    {/* Tests Highlights & Students */}
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs">
                      <div className="font-bold text-black dark:text-white flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>{pack.testsCount}</span>
                      </div>
                      <div className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 text-[11px] font-medium">
                        <Users className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                        <span>{pack.enrolledCount}</span>
                      </div>
                    </div>

                    {/* Features Checklist */}
                    <ul className="space-y-1 text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                      {pack.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing & Actions Footer */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-black dark:text-white font-mono">
                          ₹{pack.price}
                        </span>
                        <span className="text-xs text-zinc-400 line-through">
                          ₹{pack.originalPrice}
                        </span>
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          {pack.discount}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {pack.hasFreeTest && (
                        <button
                          onClick={() => {
                            setActiveSection("free_mocks");
                            setActiveMockTest(sampleFreeMock);
                            setSelectedAnswers({});
                            setMockScore(null);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-black dark:text-white text-xs font-bold cursor-pointer transition-colors"
                        >
                          Free Mock
                        </button>
                      )}

                      <button
                        onClick={() =>
                          handleOpenPurchase({
                            type: "test_series",
                            title: pack.title,
                            price: pack.price,
                            originalPrice: pack.originalPrice,
                            features: pack.features,
                          })
                        }
                        className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer shadow-xs"
                      >
                        Unlock Test Series
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

                {/* ============================================================== */}
        {/* EDUPYE 3-PANE "LEARN" SECTION ARCHITECTURE                     */}
        {/* Pane 1 (Leftmost): Primary icon rail (rendered by aside)       */}
        {/* Pane 2: Secondary Sub-Navigation Sidebar (w-52)               */}
        {/* Pane 3: Center Main Content Canvas (flex-1)                   */}
        {/* Pane 4: Right Studio Palette Palette (w-64 to w-72)           */}
        {/* ============================================================== */}
        {activeSection === "learn" && (
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-105px)] w-full bg-[#f8fafc] dark:bg-black text-slate-900 dark:text-white animate-in fade-in duration-150">
            {/* PANE 2: SECONDARY SUB-NAVIGATION BAR (w-52) */}
            <div className="w-full lg:w-52 shrink-0 bg-[#eef4fa] dark:bg-zinc-950/90 border-r border-slate-200/80 dark:border-zinc-800/80 p-4 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Sub-header */}
                <div className="px-3 pt-2 pb-1">
                  <h2 className="text-base font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                    Learn
                  </h2>
                </div>

                {/* 11 Sub-sections */}
                <nav className="space-y-1">
                  {learnSubSectionsList.map((item) => {
                    const Icon = item.icon;
                    const isActive = learnSubSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setLearnSubSection(item.id)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs transition-all flex items-center gap-3 cursor-pointer ${
                          isActive
                            ? "bg-white dark:bg-zinc-800 text-sky-600 dark:text-amber-400 font-extrabold shadow-xs"
                            : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-900/40 font-semibold"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-sky-600 dark:text-amber-400" : "text-slate-400 dark:text-zinc-500"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom status badge */}
              <div className="pt-4 px-3 border-t border-slate-200/60 dark:border-zinc-800/60 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                <span className="font-mono">Curriculum</span>
                <span className="font-bold text-sky-600 dark:text-amber-400">v2.5 Sync</span>
              </div>
            </div>

            {/* PANE 3: MAIN CENTER CANVAS (flex-1) */}
            <div className="flex-1 min-w-0 p-5 sm:p-7 lg:p-8 overflow-y-auto">
              {/* SUB-SECTION 1: SUBJECT (Default & EduPye Screenshot Match) */}
              {learnSubSection === "subject" && (
                <div className="space-y-6">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                          Subjects
                        </h1>
                        <span className="px-3 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 text-xs font-bold shadow-2xs">
                          {selectedCurriculumTrack}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
                        Curriculum subjects aligned with your Consortium of NLUs &amp; State Bar standards.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowManageTrackModal(true)}
                      className="self-start sm:self-auto px-4 py-2 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-500 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Manage Track</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>

                  {/* 2x3 Grid of 6 Subject Cards Matching EduPye */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {learnSubjects.map((subj) => {
                      const matchedCourse =
                        masterclassCourses.find((c) => c.id === subj.courseRefId) || masterclassCourses[0];
                      return (
                        <div
                          key={subj.id}
                          onClick={() => {
                            setSelectedCourseForPortal(matchedCourse);
                            setPortalTab("video");
                            setPortalVideoPlaying(true);
                          }}
                          className="rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs hover:shadow-md hover:border-sky-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between group cursor-pointer relative min-h-[175px]"
                        >
                          {/* Top Bar with Category, Title, Lesson count and + button */}
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span
                                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${subj.categoryColor}`}
                                >
                                  {subj.category}
                                </span>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 group-hover:text-sky-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                                  {subj.title}
                                </h3>
                                <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium mt-1">
                                  {subj.chapters} Chapters • {subj.lessons} Lessons
                                </p>
                              </div>

                              {/* Blue Circular [+] Button matching EduPye */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCourseForPortal(matchedCourse);
                                  setPortalTab("video");
                                  setPortalVideoPlaying(true);
                                }}
                                className="w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-600 active:scale-95 text-white flex items-center justify-center font-black shadow-xs transition-transform group-hover:scale-110 shrink-0 cursor-pointer"
                                title="Open Subject Learning Portal"
                              >
                                <Plus className="w-4 h-4 stroke-[3]" />
                              </button>
                            </div>
                          </div>

                          {/* Visual Motif & Meta Description */}
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-xl bg-gradient-to-br ${subj.accent} text-white flex items-center justify-center shadow-xs shrink-0`}
                              >
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-zinc-400">
                                {subj.badge}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                              <span>Enter Module</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Active Lesson Continuation banner */}
                  <div className="p-5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shrink-0">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500 text-black">
                            IN PROGRESS
                          </span>
                          <span className="text-xs text-zinc-400">Last accessed: 25m ago</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          Constitutional Law: Article 32 Writs &amp; Kesavananda Bharati Ratio
                        </h4>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCourseForPortal(masterclassCourses[1]);
                        setPortalTab("video");
                        setPortalVideoPlaying(true);
                      }}
                      className="px-5 py-2 rounded-full bg-amber-500 hover:bg-white text-black font-extrabold text-xs transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      Resume Study
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-SECTION 2: PRACTICE */}
              {learnSubSection === "practice" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Adaptive Practice Drills
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        Targeted MCQs and principle-fact problems with instant ratio decidendi feedback.
                      </p>
                    </div>
                    {/* Practice Topic Filters */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {["All", "BNS 2023", "Constitutional Law", "Contracts & Torts"].map((filt) => (
                        <button
                          key={filt}
                          onClick={() => setLearnPracticeFilter(filt)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            learnPracticeFilter === filt
                              ? "bg-sky-500 text-white shadow-xs"
                              : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700"
                          }`}
                        >
                          {filt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {learnPracticeQuestions
                      .filter((q) => learnPracticeFilter === "All" || q.subject.includes(learnPracticeFilter))
                      .map((q, idx) => (
                        <div
                          key={q.id}
                          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-4 shadow-xs"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-sky-600 dark:text-amber-400 bg-sky-50 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
                              Question {idx + 1} • {q.subject}
                            </span>
                            <span className="text-slate-400 dark:text-zinc-500 font-medium">{q.tag}</span>
                          </div>
                          <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">{q.question}</p>
                          <div className="grid grid-cols-1 gap-2">
                            {q.options.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                onClick={() => setGameAnswerSelected(oIdx)}
                                className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-left text-xs font-medium hover:border-sky-500 dark:hover:border-amber-400 hover:bg-sky-50/50 dark:hover:bg-zinc-800 transition-all cursor-pointer text-slate-700 dark:text-zinc-200"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200/60 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 font-medium">
                            <span className="font-bold text-slate-900 dark:text-white">Ratio Decidendi: </span>
                            {q.ratio}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* SUB-SECTION 3: TEST */}
              {learnSubSection === "test" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Curricular Unit &amp; Mock Tests
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      Standardized timed CBT assessments under Bar &amp; NLU examination conditions.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {testSeriesPacks.slice(0, 4).map((tPack) => (
                      <div
                        key={tPack.id}
                        className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              {tPack.badge}
                            </span>
                            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                              ★ {tPack.rating}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                            {tPack.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{tPack.conductingBody}</p>
                          <div className="text-xs font-mono text-slate-600 dark:text-zinc-300 mt-2 font-medium">
                            {tPack.testsCount}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveSection("free_mocks");
                            setActiveMockTest(sampleFreeMock);
                            setSelectedAnswers({});
                            setMockScore(null);
                          }}
                          className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-98 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Timed CBT Test</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-SECTION 4: QUIZ */}
              {learnSubSection === "quiz" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      5-Minute Rapid Legal Quiz
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      Fast-paced diagnostic questions to cement your statutory recall and latin maxims.
                    </p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-6 shadow-xs">
                    {masterclassCourses[0].quiz.map((q, qIdx) => (
                      <div key={qIdx} className="space-y-3 pb-5 border-b border-slate-100 dark:border-zinc-800">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Q{qIdx + 1}. {q.question}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => {
                                setPortalQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
                              }}
                              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                                portalQuizAnswers[qIdx] === oIdx
                                  ? "bg-amber-500 text-black border-amber-500 font-bold"
                                  : "border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-amber-400"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <button
                        onClick={() => setPortalQuizSubmitted(true)}
                        className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-xs cursor-pointer"
                      >
                        Submit Quiz &amp; Calculate Score
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-SECTION 5: HISTORY */}
              {learnSubSection === "history" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Learning History &amp; Revision Log
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      Track your lecture completion, test attempts, and statutory revisions.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Constitutional Law: Article 32 & 226 Writs Masterclass",
                        duration: "45 mins logged",
                        time: "Today, 3:15 PM",
                        type: "Lecture Video",
                        score: "Completed",
                      },
                      {
                        title: "BNS Section 69 & Deceitful Cohabitation Diagnostic Mock",
                        duration: "20 Questions",
                        time: "Yesterday, 6:40 PM",
                        type: "CBT Mock",
                        score: "92% Accuracy",
                      },
                      {
                        title: "Law of Torts: Volenti Non Fit Injuria Principle-Fact Drill",
                        duration: "15 Questions",
                        time: "2 Days ago",
                        type: "Practice Drill",
                        score: "100% Accuracy",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-4 shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-zinc-800 text-sky-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                            <History className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">
                              {item.type} • {item.duration} • {item.time}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 shrink-0">
                          {item.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-SECTION 6: SEARCH */}
              {learnSubSection === "search" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Curriculum &amp; Statutory Search
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      Search across all enrolled modules, BNS sections, constitutional articles, and case laws.
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={learnSearchInput}
                      onChange={(e) => setLearnSearchInput(e.target.value)}
                      placeholder="Search section number (e.g. 69 BNS), case title (e.g. Kesavananda), or legal maxim..."
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 shadow-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {learnSubjects
                      .filter((s) => s.title.toLowerCase().includes(learnSearchInput.toLowerCase()))
                      .map((s) => (
                        <div
                          key={s.id}
                          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1 shadow-2xs"
                        >
                          <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400">
                            {s.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{s.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">{s.metaDesc}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* SUB-SECTION 7: GAME */}
              {learnSubSection === "game" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Bare Act Section Sprint (Game)
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        Gamified speed challenges: Match BNS section numbers and Latin maxims before the timer runs out!
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 font-mono block">SCORE</span>
                        <span className="text-sm font-black text-amber-500 font-mono">{gameScore} pts</span>
                      </div>
                      <div className="h-6 w-px bg-slate-200 dark:border-zinc-800" />
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 font-mono block">STREAK</span>
                        <span className="text-sm font-black text-emerald-500 font-mono">{gameStreak} 🔥</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Question Card */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-6 shadow-xs">
                    <div className="space-y-2 text-center max-w-md mx-auto">
                      <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        CRIMINAL OFFENSE
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {gameSprintQuestions[gameSprintQuestionIdx].crime}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
                        Reference: {gameSprintQuestions[gameSprintQuestionIdx].ipcOld}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                      {gameSprintQuestions[gameSprintQuestionIdx].options.map((opt, oIdx) => {
                        const isCorrect = oIdx === gameSprintQuestions[gameSprintQuestionIdx].correctIdx;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => {
                              if (isCorrect) {
                                setGameScore((prev) => prev + 50);
                                setGameStreak((prev) => prev + 1);
                              } else {
                                setGameStreak(0);
                              }
                              setGameSprintQuestionIdx((prev) => (prev + 1) % gameSprintQuestions.length);
                            }}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 hover:bg-sky-500 hover:text-white border border-slate-200 dark:border-zinc-700 text-sm font-bold text-slate-800 dark:text-white transition-all cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-SECTION 8: HOMEWORK */}
              {learnSubSection === "homework" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Curricular Home Work &amp; Case Briefs
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      Assigned drafting exercises and case brief submissions.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {homeworkList.map((hw) => (
                      <div
                        key={hw.id}
                        className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-sky-100 dark:bg-zinc-800 text-sky-600 dark:text-amber-400">
                              {hw.badge}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">Due: {hw.dueDate}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{hw.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">
                            {hw.subject} • Faculty: {hw.faculty}
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveCreateModal("notes")}
                          className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs cursor-pointer hover:bg-amber-500 dark:hover:bg-amber-400 transition-colors shrink-0"
                        >
                          Submit Brief
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-SECTION 9: ASSIGNMENT */}
              {learnSubSection === "assignment" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Moot Memorials &amp; Drafting Assignments
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      Formal legal drafting reviews evaluated by High Court advocates.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Moot Court Problem 01: Artificial Intelligence & Defamation Memorial",
                        marks: "48/50 Marks",
                        status: "Evaluated by Senior Advocate",
                        feedback: "Excellent citation of Puttaswamy right to privacy; refine the writ prayer formatting.",
                      },
                      {
                        title: "Criminal Appellate Drafting: Appeal against Conviction under Section 103 BNS",
                        marks: "Pending Evaluation",
                        status: "Submitted on Nov 17",
                        feedback: "Under chamber review.",
                      },
                    ].map((asg, i) => (
                      <div
                        key={i}
                        className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{asg.title}</h4>
                          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40">
                            {asg.marks}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{asg.status}</p>
                        <p className="text-xs text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800">
                          <strong>Faculty Feedback:</strong> {asg.feedback}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-SECTION 10: TUITION */}
              {learnSubSection === "tuition" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        1-on-1 Advocate Tuition &amp; Mentorship
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        Personal legal chambers coaching with High Court and Supreme Court advocates.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSection("tutors")}
                      className="px-4 py-2 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      Browse All Advocate Tutors
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tutorsList.slice(0, 2).map((tutor) => (
                      <div
                        key={tutor.id}
                        className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${tutor.avatarBg}`}
                          >
                            {tutor.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{tutor.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">{tutor.title}</p>
                            <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold block mt-1">
                              {tutor.specialties.join(" • ")}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setPurchaseItem({
                              type: "tutor",
                              title: `1-on-1 Tuition Session with ${tutor.name}`,
                              price: tutor.hourlyRate,
                              originalPrice: tutor.hourlyRate + 400,
                              features: tutor.specialties,
                            });
                          }}
                          className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-98 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                        >
                          Book 1-on-1 Chamber Slot (₹{tutor.hourlyRate}/hr)
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-SECTION 11: COMBINE STUDY */}
              {learnSubSection === "combine_study" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Combine Study &amp; Peer Moot Circles
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      Join active virtual study tables with fellow law aspirants and co-solve complex passages.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {peerStudyRooms.map((room) => (
                      <div
                        key={room.id}
                        className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {room.activeNow ? (
                              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                LIVE ROOM
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[10px] font-mono font-bold">
                                SCHEDULED
                              </span>
                            )}
                            <span className="text-xs text-slate-400 font-mono">
                              {room.members} Aspirants Studying
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{room.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">Current Topic: {room.topic}</p>
                        </div>
                        <button
                          onClick={() => setShowFloatingAI(true)}
                          className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition-all shadow-xs cursor-pointer shrink-0"
                        >
                          Enter Study Room
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PANE 4: RIGHT STUDIO PALETTE (w-64 to w-72) */}
            <div className="w-full lg:w-64 xl:w-72 shrink-0 bg-[#eef4fa] dark:bg-zinc-950/90 border-l border-slate-200/80 dark:border-zinc-800/80 p-4 sm:p-5 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Header: >> Create */}
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-sky-700 dark:text-sky-400 font-black text-base tracking-tight font-mono">
                    &gt;&gt;
                  </span>
                  <h2 className="text-base font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                    Create
                  </h2>
                </div>

                {/* 2-Column Grid of 12 Interactive Tools */}
                <div className="bg-[#e2edf7] dark:bg-zinc-900/90 rounded-3xl p-3 border border-sky-100 dark:border-zinc-800/80">
                  <div className="grid grid-cols-2 gap-2">
                    {createToolsList.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => {
                            if (tool.id === "chat") {
                              setShowFloatingAI(true);
                            } else if (tool.id === "bookmark") {
                              setShowBookmarksDrawer(true);
                            } else if (tool.id === "quiz") {
                              setLearnSubSection("quiz");
                            } else if (tool.id === "analyse") {
                              setActiveSection("analytics");
                            } else {
                              setActiveCreateModal(tool.id);
                            }
                          }}
                          className="bg-white dark:bg-zinc-800/90 hover:bg-sky-50 dark:hover:bg-zinc-700 rounded-2xl p-2.5 flex flex-col items-center justify-center text-center gap-1 shadow-2xs hover:shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                          title={tool.description}
                        >
                          <Icon className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:text-amber-500 transition-colors" />
                          <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-200 truncate w-full">
                            {tool.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Smart Board / Projects Card matching EduPye */}
                <div
                  onClick={() => setActiveCreateModal("smartboard")}
                  className="bg-[#e2edf7] dark:bg-zinc-900/90 rounded-2xl p-3.5 border border-sky-100 dark:border-zinc-800/80 flex items-center justify-between cursor-pointer hover:shadow-xs transition-all group"
                >
                  <div>
                    <div className="text-xs font-black text-slate-800 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
                      Smart Board
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                      /Projects
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 dark:bg-sky-400/10 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Presentation className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Floating Pill Button: EduPye AI HYBRID */}
              <div className="pt-4">
                <button
                  onClick={() => setShowFloatingAI(true)}
                  className="w-full bg-gradient-to-r from-sky-950 via-slate-900 to-black text-white px-4 py-2.5 rounded-full flex items-center justify-between shadow-lg cursor-pointer hover:scale-102 active:scale-98 transition-all border border-sky-500/30 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
                    <span className="text-xs font-black tracking-wide text-white">
                      EduPye AI
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    HYBRID
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 2: LIVE & RECORDED BATCHES (BATCH JOINING)             */}
        {/* ============================================================== */}
        {activeSection === "batches" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-black dark:text-white">
                  Live Online Batches for Law Entrance &amp; LL.B
                </h2>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                  Join structured classroom coaching led by NLU alumni, Bar Council advocates, and senior professors.
                </p>
              </div>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-bold font-mono">
                {filteredBatches.length} Batches Enrolling
              </span>
            </div>

            {/* Batch Cards Grid */}
            <div className="space-y-4">
              {filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
                        {batch.badge}
                      </span>
                      <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-bold">
                        {batch.startDate}
                      </span>
                      <span className="text-xs text-rose-600 dark:text-rose-400 font-bold font-mono">
                        • {batch.seatsLeft}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-black dark:text-white leading-snug">
                        {batch.title}
                      </h3>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium mt-1">
                        Instructor: <strong className="text-black dark:text-white">{batch.faculty}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-800 dark:text-zinc-200 font-mono font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{batch.schedule}</span>
                    </div>

                    {/* Features checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                      {batch.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Batch Enrollment Action */}
                  <div className="shrink-0 lg:text-right border-t lg:border-t-0 lg:border-l border-zinc-100 dark:border-zinc-800 pt-4 lg:pt-0 lg:pl-6 space-y-3">
                    <div>
                      <div className="text-xs text-zinc-400 line-through">₹{batch.originalPrice}</div>
                      <div className="text-2xl font-black text-black dark:text-white font-mono">
                        ₹{batch.price}
                      </div>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        {batch.discount} • Instant Enrollment
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        handleOpenPurchase({
                          type: "batch",
                          title: batch.title,
                          price: batch.price,
                          originalPrice: batch.originalPrice,
                          features: batch.features,
                          extraNote: batch.schedule,
                        })
                      }
                      className="w-full lg:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                    >
                      <span>Join Batch Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 3: 1-ON-1 TUTOR HIRE (HIRE PERSONAL MENTOR)            */}
        {/* ============================================================== */}
        {activeSection === "tutors" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-black dark:text-white">
                  Hire 1-on-1 Law Tutors &amp; Advocate Mentors
                </h2>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                  Book personal 45-minute live mentoring sessions for doubt clearance, CLAT strategy, or Distance LL.B exam guidance.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600">
                ● Verified Bar Advocates Online
              </span>
            </div>

            {/* Tutors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tutorsList.map((tutor) => (
                <div
                  key={tutor.id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header Avatar & Tag */}
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-base shadow-xs ${tutor.avatarBg}`}>
                        {tutor.name.split(" ")[1]?.charAt(0) || "A"}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono font-bold uppercase">
                        {tutor.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-black dark:text-white">
                        {tutor.name}
                      </h3>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                        {tutor.title}
                      </p>
                      <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-mono font-medium block mt-0.5">
                        {tutor.qualification}
                      </span>
                    </div>

                    {/* Stats & Rating */}
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 font-bold text-black dark:text-white">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {tutor.rating}
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-mono font-medium">({tutor.sessionsCount})</span>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed line-clamp-2">
                      {tutor.bio}
                    </p>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tutor.specialties.map((spec: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-200 text-[10px] font-bold"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hourly Rate & Booking CTA */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">Session Fee:</span>
                      <span className="text-base font-black text-black dark:text-white font-mono">
                        ₹{tutor.hourlyRate} <span className="text-xs font-normal text-zinc-600 dark:text-zinc-400">/ 45 mins</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenTutorBooking(tutor)}
                      className="w-full py-2 rounded-xl bg-black hover:bg-amber-500 hover:text-black text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Book 1-on-1 Session</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 4: FREE CBT MOCK TEST SIMULATOR                        */}
        {/* ============================================================== */}
        {activeSection === "free_mocks" && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-black dark:text-white">
                  {sampleFreeMock.title}
                </h2>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                  Consortium pattern with +1 for correct and -0.25 negative marking.
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>118:40 Remaining</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
              {sampleFreeMock.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-black dark:text-zinc-200 leading-relaxed">
                      {q.q}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[idx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectMockAnswer(idx, optIdx)}
                          className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center gap-2.5 cursor-pointer ${
                            isSelected
                              ? "bg-amber-500 text-black font-bold shadow-xs"
                              : "bg-white dark:bg-zinc-900 text-black dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0 font-bold">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {mockScore === null ? (
                <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => setActiveSection("test_series")}
                    className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    Back to Test Series
                  </button>
                  <button
                    onClick={calculateMockScore}
                    className="px-5 py-2 rounded-xl bg-black dark:bg-amber-500 text-white dark:text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Submit Responses &amp; Calculate Score
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-2">
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                    Score: {mockScore > 0 ? `+${mockScore.toFixed(2)}` : mockScore.toFixed(2)}
                  </div>
                  <p className="text-xs text-black dark:text-zinc-300">
                    Your simulated diagnostic percentile is <strong>94.8%</strong>. Unlock the full 35-test series for comprehensive all-India ranking!
                  </p>
                  <button
                    onClick={() => setActiveSection("test_series")}
                    className="px-4 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer"
                  >
                    Explore Full Test Series
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 5: AI DOUBT SOLVER                                     */}
        {/* ============================================================== */}
        {activeSection === "ai_tutor" && (
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 max-w-3xl mx-auto shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-black flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    Wakheel AI Legal Doubt Solver
                  </h3>
                  <span className="text-xs text-zinc-500 font-mono">Instant judicial reasoning &amp; statutory interpretation</span>
                </div>
              </div>
            </div>

            <div className="h-72 overflow-y-auto space-y-3 p-3 rounded-xl bg-zinc-50 dark:bg-black text-xs">
              {aiChatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-amber-500 text-black font-semibold rounded-br-xs"
                        : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-200 rounded-bl-xs shadow-2xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-zinc-400 px-1 mt-0.5 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              ))}
              {isAiThinking && (
                <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-200" />
                  <span>Researching case laws...</span>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendAiMessage}
              className="flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                placeholder="Ask any legal doubt, BNS section, or CLAT passage query..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={isAiThinking || !aiChatInput.trim()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 6: BARE ACTS & STATUTORY REPOSITORY                    */}
        {/* ============================================================== */}
        {activeSection === "bare_acts" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-black dark:text-white">
                  Bare Acts &amp; Statutory Compendium
                </h2>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                  Authoritative legislative texts for BNS 2023, Constitution, CPC, and Contract Act with chapter-by-chapter breakdowns.
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bareActSearch}
                  onChange={(e) => setBareActSearch(e.target.value)}
                  placeholder="Search section number or term..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Act Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {bareActsList.map((act) => {
                const isSelected = selectedBareAct === act.id;
                return (
                  <button
                    key={act.id}
                    onClick={() => setSelectedBareAct(act.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? "bg-amber-500 text-black font-extrabold shadow-sm"
                        : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:border-amber-500"
                    }`}
                  >
                    <Library className="w-3.5 h-3.5" />
                    <span>{act.title.split("(")[0]}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        isSelected ? "bg-black text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {act.sectionsCount.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Act Full View */}
            {(() => {
              const currentAct = bareActsList.find((a) => a.id === selectedBareAct) || bareActsList[0];
              const filteredChapters = currentAct.keyChapters.filter(
                (c) =>
                  !bareActSearch.trim() ||
                  c.title.toLowerCase().includes(bareActSearch.toLowerCase()) ||
                  c.sec.toLowerCase().includes(bareActSearch.toLowerCase()) ||
                  c.desc.toLowerCase().includes(bareActSearch.toLowerCase())
              );

              return (
                <div className="space-y-4">
                  {/* Act Meta Card */}
                  <div className="p-5 rounded-2xl bg-zinc-900 text-white border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-mono font-bold text-[10px] uppercase">
                          {currentAct.tag}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">{currentAct.code}</span>
                      </div>
                      <h3 className="text-lg font-black text-white">{currentAct.title}</h3>
                      <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">{currentAct.highlight}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => alert(`Downloading official annotated syllabus & bare act PDF for ${currentAct.title}...`)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-white text-black font-extrabold text-xs transition-all shadow-sm cursor-pointer flex items-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Bare Act PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Chapters & Key Sections Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredChapters.map((chap, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 transition-all flex flex-col justify-between space-y-3 shadow-xs"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold">
                              {chap.sec}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500 font-bold">Chapter {idx + 1}</span>
                          </div>
                          <h4 className="text-sm font-bold text-black dark:text-white leading-snug">{chap.title}</h4>
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                            {chap.desc}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-500">Exam Frequency: High</span>
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText?.(`${currentAct.title} - ${chap.sec}: ${chap.desc}`);
                              alert("Section summary and citation copied to clipboard!");
                            }}
                            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                          >
                            Copy Citation
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 7: ALL-INDIA PERCENTILE & RANK ANALYTICS               */}
        {/* ============================================================== */}
        {activeSection === "analytics" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-xl font-black text-black dark:text-white">
                All-India Rank &amp; Percentile Predictor
              </h2>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                Live performance metrics based on Consortium of NLUs pattern, historical cutoff percentiles, and negative marking analysis.
              </p>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Current Percentile</span>
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {analyticsData.percentile}%
                </div>
                <span className="text-[10px] text-zinc-400 font-mono block">Top 5.2% of Candidates</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-zinc-500 text-xs">
                  <span>Predicted AIR Rank</span>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-black dark:text-white font-mono">
                  AIR {analyticsData.airRank}
                </div>
                <span className="text-[10px] text-zinc-500 font-mono block">out of 72,000 Aspirants</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-zinc-500 text-xs">
                  <span>Accuracy Rate</span>
                  <CheckSquare className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-black dark:text-white font-mono">
                  {analyticsData.accuracyRate}%
                </div>
                <span className="text-[10px] text-emerald-600 font-mono font-bold block">+4.2% from last mock</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-zinc-500 text-xs">
                  <span>Negative Marks Lost</span>
                  <Clock className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
                  {analyticsData.negativeMarkLoss}
                </div>
                <span className="text-[10px] text-zinc-500 font-mono block">92% avoidance rate</span>
              </div>
            </div>

            {/* Section Breakdown and Scorecards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subject Breakdown */}
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-black dark:text-white">Subject-wise Mastery</h3>
                  <span className="text-xs font-mono text-zinc-500">Passage Speed &amp; Accuracy</span>
                </div>

                <div className="space-y-3">
                  {analyticsData.subjectBreakdown.map((subj, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="font-bold text-black dark:text-white">{subj.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-zinc-500">{subj.avgTime}</span>
                          <span className="font-mono font-black text-black dark:text-white">{subj.score}%</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${subj.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Test Attempts History */}
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-black dark:text-white">Recent Mock Attempts</h3>
                  <span className="text-xs font-mono text-amber-600 font-bold">6 Completed</span>
                </div>

                <div className="space-y-2.5">
                  {analyticsData.recentTestHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-bold text-black dark:text-white truncate">{item.testName}</h4>
                        <div className="text-[11px] text-zinc-500 font-mono">
                          {item.date} • Score: <strong className="text-black dark:text-white">{item.score}</strong>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-amber-600 dark:text-amber-400 font-mono block">
                          {item.percentile}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">{item.rank}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 8: CHAMBER CLERKSHIPS & INTERNSHIPS                    */}
        {/* ============================================================== */}
        {activeSection === "internships" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-black dark:text-white">
                  Chamber Clerkships &amp; Judicial Internships
                </h2>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                  Verified clerkship postings for Supreme Court, High Court chambers, DLSA legal aid clinics, and tier-1 firms.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600">
                ● 4 Verified Openings
              </span>
            </div>

            {/* Clerkship Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {internshipsList.map((internship) => (
                <div
                  key={internship.id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 transition-all flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
                        {internship.badge}
                      </span>
                      <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-bold">
                        {internship.deadline}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-black dark:text-white leading-snug">
                        {internship.title}
                      </h3>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium mt-1">
                        {internship.chamber}
                      </p>
                    </div>

                    {/* Stipend & Location */}
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Stipend:</span>
                        <strong className="text-black dark:text-white">{internship.stipend}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-500 block text-[10px]">Location:</span>
                        <strong className="text-black dark:text-white">{internship.location}</strong>
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase block">Eligibility:</span>
                      <ul className="space-y-1 text-xs text-zinc-800 dark:text-zinc-200">
                        {internship.requirements.map((req, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-500">Duration: {internship.duration}</span>
                    <button
                      onClick={() => {
                        setSelectedInternship(internship);
                        setInternshipApplySuccess(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Apply for Clerkship</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 9: WEEKLY CLASS & MOCK TIMETABLE                       */}
        {/* ============================================================== */}
        {activeSection === "schedule" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-black dark:text-white">
                  Weekly Live Lecture &amp; Mock Timetable
                </h2>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                  Direct links to your live video classrooms, mentor sessions, and scheduled all-India CBT mock test windows.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScheduleFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    scheduleFilter === "all"
                      ? "bg-black text-white dark:bg-white dark:text-black font-extrabold"
                      : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  All Days ({weeklySchedule.length})
                </button>
                <button
                  onClick={() => setScheduleFilter("today")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    scheduleFilter === "today"
                      ? "bg-amber-500 text-black font-extrabold shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  Today&apos;s Slots (2)
                </button>
              </div>
            </div>

            {/* Schedule Items */}
            <div className="space-y-3">
              {weeklySchedule
                .filter((slot) => scheduleFilter === "all" || slot.isToday)
                .map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      slot.isToday
                        ? "bg-amber-500/5 border-amber-500/40 shadow-xs"
                        : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            slot.isToday ? "bg-amber-500 text-black" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {slot.day}
                        </span>
                        <span className="text-xs font-mono font-bold text-black dark:text-white flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          {slot.time}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {slot.type}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-black dark:text-white">{slot.title}</h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Instructor: {slot.faculty}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 hidden sm:block">
                        {slot.status}
                      </span>
                      <button
                        onClick={() => alert(`Launching live lecture video stream for: ${slot.title}`)}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                          slot.isToday
                            ? "bg-amber-500 hover:bg-black hover:text-white text-black shadow-xs"
                            : "bg-black hover:bg-amber-500 hover:text-black dark:bg-white dark:text-black dark:hover:bg-amber-500 text-white"
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Live Room</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: DIGITAL LIBRARY (EDUPYE SCREENSHOT FEATURE)           */}
        {/* ============================================================== */}
        {(activeSection === "library" || activeSection === "bare_acts") && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Library Top Bar: Categories & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {["All", "Constitutional Law", "Criminal Law (BNS)", "Civil & Commercial", "Entrance Preparation"].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedLibraryCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        selectedLibraryCategory === cat
                          ? "bg-amber-500 text-black font-extrabold shadow-xs"
                          : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400"
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
              <div className="text-xs text-zinc-500 font-mono">
                Showing {libraryBooks.filter((b) => selectedLibraryCategory === "All" || b.category === selectedLibraryCategory).length} Volumes Available
              </div>
            </div>

            {/* Book Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {libraryBooks
                .filter((b) => selectedLibraryCategory === "All" || b.category === selectedLibraryCategory)
                .map((book) => (
                  <div
                    key={book.id}
                    className="group rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 p-5 space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Book Cover Gradient Spine */}
                      <div className={`h-48 rounded-2xl bg-gradient-to-br ${book.cover} p-4 flex flex-col justify-between text-white shadow-md relative overflow-hidden group-hover:scale-[1.02] transition-transform`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs">
                            {book.badge}
                          </span>
                          <BookOpen className="w-5 h-5 text-white/80" />
                        </div>
                        <div>
                          <div className="text-sm font-black line-clamp-2 leading-snug drop-shadow-sm">
                            {book.title}
                          </div>
                          <div className="text-[11px] text-white/80 mt-1">{book.author}</div>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                          {book.category}
                        </span>
                        <h4 className="text-sm font-bold text-black dark:text-white line-clamp-1">{book.title}</h4>
                        <p className="text-xs text-zinc-500">{book.pages} Pages • Digital PDF Reader</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                      <button
                        onClick={() => alert(`Opening digital reader for: ${book.title}`)}
                        className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Online</span>
                      </button>
                      <button
                        onClick={() => alert(`Downloading high-resolution PDF for: ${book.title}`)}
                        className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: CORNELL NOTEBOOK (EDUPYE SCREENSHOT FEATURE)          */}
        {/* ============================================================== */}
        {activeSection === "notebook" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">Cornell Law Revision System</h3>
                <p className="text-xs text-zinc-500">Structured legal syntheses: Recall Cues, Legal Formulation, &amp; Ratio Summaries.</p>
              </div>
              <button
                onClick={() => setShowAddNoteModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Cornell Note</span>
              </button>
            </div>

            {/* Split Screen Cornell Sheet */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Note Selector Sidebar */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                  Saved Cornell Notebooks ({studentNotes.length})
                </span>
                <div className="space-y-2">
                  {studentNotes.map((note) => {
                    const isSelected = selectedNoteId === note.id;
                    return (
                      <div
                        key={note.id}
                        onClick={() => setSelectedNoteId(note.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500 text-black dark:text-white shadow-xs"
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
                          <span className="font-bold text-amber-600 dark:text-amber-400">{note.subject}</span>
                          <span>{note.lastEdited}</span>
                        </div>
                        <h4 className="text-sm font-bold text-black dark:text-white leading-snug">{note.title}</h4>
                        <p className="text-xs text-zinc-500 line-clamp-1 mt-1">{note.summary}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Note Canvas (2-Column Cornell Structure) */}
              {(() => {
                const currentNote = studentNotes.find((n) => n.id === selectedNoteId) || studentNotes[0];
                return (
                  <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase">
                          {currentNote.subject}
                        </span>
                        <h3 className="text-xl font-black text-black dark:text-white mt-1">{currentNote.title}</h3>
                      </div>
                      <button
                        onClick={() => alert(`Exporting Cornell sheet for: ${currentNote.title}`)}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <FileDown className="w-3.5 h-3.5 text-amber-500" />
                        <span>Export PDF</span>
                      </button>
                    </div>

                    {/* Cornell 2-Column Split */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Column 1: Recall Cues & Precedents */}
                      <div className="space-y-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                        <span className="text-[11px] font-mono font-extrabold uppercase text-amber-700 dark:text-amber-400 block">
                          Recall Cues &amp; Precedents
                        </span>
                        <ul className="space-y-2">
                          {currentNote.cues.map((cue, idx) => (
                            <li key={idx} className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-start gap-1.5">
                              <span className="text-amber-500">•</span>
                              <span>{cue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Column 2: Legal Formulation & Content */}
                      <div className="md:col-span-2 space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                        <span className="text-[11px] font-mono font-extrabold uppercase text-zinc-600 dark:text-zinc-400 block">
                          Core Legal Formulation &amp; Statutory Analysis
                        </span>
                        <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line font-serif">
                          {currentNote.content}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Summary Box */}
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 space-y-1.5">
                      <span className="text-[11px] font-mono font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 block">
                        Executive Summary &amp; Key Takeaways
                      </span>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 italic font-medium">
                        &quot;{currentNote.summary}&quot;
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: DOCUMENT & BRIEF UPLOAD (EDUPYE SCREENSHOT FEATURE)   */}
        {/* ============================================================== */}
        {activeSection === "upload" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Upload Drag & Drop Zone */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-500 transition-all text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                <Upload className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-black dark:text-white">
                  Upload Case Briefs, Moot Memorials, or Assignment Drafts
                </h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Drag and drop PDF or DOCX files up to 25MB. Instant plagiarism scan &amp; AI faculty concordance.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-black dark:text-white font-medium focus:outline-none"
                >
                  <option value="Case Brief Submission">Case Brief Submission</option>
                  <option value="Moot Memorial Draft">Moot Memorial Draft</option>
                  <option value="Research Paper">Research Paper</option>
                  <option value="Bail Petition Draft">Bail Petition Draft</option>
                </select>
                <button
                  onClick={() => {
                    setUploadedDocuments((prev) => [
                      {
                        id: `up_${Date.now()}`,
                        name: `Constitutional_Memo_${Date.now().toString().slice(-4)}.pdf`,
                        category: uploadCategory,
                        size: "3.2 MB",
                        date: "Just now",
                        status: "Under Review",
                        score: "Pending",
                        facultyFeedback: "Evaluating against consortium rubric.",
                      },
                      ...prev,
                    ]);
                    setUploadSuccessAlert(true);
                    setTimeout(() => setUploadSuccessAlert(false), 3500);
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer shadow-sm"
                >
                  Select &amp; Upload File
                </button>
              </div>

              {uploadSuccessAlert && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in max-w-md mx-auto">
                  ✓ File uploaded successfully! Plagiarism scan clear (100% Originality).
                </div>
              )}
            </div>

            {/* Recent Uploads Table */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-black dark:text-white">Recent Student Submissions</h4>
                <span className="text-xs font-mono text-zinc-500">{uploadedDocuments.length} Submissions</span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {uploadedDocuments.map((doc) => (
                  <div key={doc.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="font-bold text-black dark:text-white text-sm">{doc.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {doc.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 flex items-center gap-3">
                        <span>{doc.date}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span className="text-zinc-600 dark:text-zinc-400 font-medium">Feedback: {doc.facultyFeedback}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${
                          doc.status === "Graded"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {doc.status} ({doc.score})
                      </span>
                      <button
                        onClick={() => alert(`Downloading ${doc.name}`)}
                        className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: RECORDING STUDIO (EDUPYE SCREENSHOT FEATURE)          */}
        {/* ============================================================== */}
        {activeSection === "record" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Record Studio Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">Moot Court Oral Argument Studio</h3>
                <p className="text-xs text-zinc-500">Record your appellate arguments, cross-examinations, and receive instant AI clarity scoring.</p>
              </div>
              <div className="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                <button
                  onClick={() => setRecordMode("audio")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    recordMode === "audio" ? "bg-amber-500 text-black shadow-xs font-extrabold" : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  Audio Waveform
                </button>
                <button
                  onClick={() => setRecordMode("video")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    recordMode === "video" ? "bg-amber-500 text-black shadow-xs font-extrabold" : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  Video Camera
                </button>
              </div>
            </div>

            {/* Recording Console */}
            <div className="p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 text-center space-y-6 relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-mono">
                  <span className={`w-2.5 h-2.5 rounded-full ${recordStatus === "recording" ? "bg-rose-500 animate-ping" : "bg-emerald-500"}`} />
                  <span className="text-zinc-300 uppercase font-bold tracking-wider">
                    {recordStatus === "recording" ? `LIVE RECORDING (${recordTimer}s)` : recordStatus === "paused" ? "PAUSED" : "STUDIO READY"}
                  </span>
                </span>
                <span className="text-xs font-mono text-zinc-400">Gemini 2.5 Speech Engine</span>
              </div>

              {/* Animated Waveform Bars */}
              <div className="h-28 flex items-center justify-center gap-1.5 px-4">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-150 ${
                      recordStatus === "recording"
                        ? "bg-amber-400 animate-pulse"
                        : "bg-zinc-800"
                    }`}
                    style={{
                      height: recordStatus === "recording" ? `${Math.max(16, (Math.sin(i * 0.8 + recordTimer) + 1.2) * 35)}px` : "16px",
                    }}
                  />
                ))}
              </div>

              {/* Real-time AI Transcript preview */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-left space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                  Simulated Real-Time AI Speech-to-Text Transcript:
                </span>
                <p className="text-xs text-zinc-300 font-serif leading-relaxed italic">
                  {recordStatus === "recording"
                    ? liveTranscript || "“May it please the Court, I appear on behalf of the appellant. Under Article 19(1)(a) of the Constitution...”"
                    : "Press 'Start Recording' to begin your oral argument session with real-time transcription."}
                </p>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-4 pt-2">
                {recordStatus === "idle" ? (
                  <button
                    onClick={() => {
                      setRecordStatus("recording");
                      setRecordTimer(1);
                      setLiveTranscript("“May it please Your Lordship, our core submission under Section 103 BNS 2023 hinges on the total absence of mens rea...”");
                    }}
                    className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-lg hover:scale-105"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setRecordStatus(recordStatus === "recording" ? "paused" : "recording")}
                      className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {recordStatus === "recording" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{recordStatus === "recording" ? "Pause" : "Resume"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setSavedRecordings((prev) => [
                          {
                            id: `rec_${Date.now()}`,
                            title: `Oral Argument: BNS Mens Rea Submission (${recordTimer}s)`,
                            duration: `00:${recordTimer < 10 ? "0" + recordTimer : recordTimer}`,
                            date: "Just now",
                            score: "9.4/10 AI Clarity",
                            audioUrl: "#",
                          },
                          ...prev,
                        ]);
                        setRecordStatus("idle");
                        setRecordTimer(0);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      <Square className="w-4 h-4" />
                      <span>Stop &amp; Save Recording</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Saved Recordings Table */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h4 className="text-base font-bold text-black dark:text-white">Saved Moot Recordings &amp; AI Analysis</h4>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {savedRecordings.map((rec) => (
                  <div key={rec.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-black dark:text-white text-sm">{rec.title}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">Duration: {rec.duration} • {rec.date}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        {rec.score}
                      </span>
                      <button
                        onClick={() => alert(`Playing audio preview for ${rec.title}`)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Play</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: TUITION MODE (EDUPYE SCREENSHOT FEATURE)              */}
        {/* ============================================================== */}
        {activeSection === "tuition_mode" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Gold Chamber Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500 to-amber-600 text-black space-y-3 shadow-lg relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-mono font-black uppercase">
                    Centralized Tuition Chamber
                  </span>
                  <h3 className="text-2xl font-black tracking-tight">Active Scholar Chamber Pass</h3>
                  <p className="text-xs font-semibold text-black/80 max-w-xl">
                    Direct access to Senior Advocate Chambers, Constitutional Bench office hours, and personalized legal reasoning tutoring.
                  </p>
                </div>
                <div className="bg-black/10 backdrop-blur-xs p-3 rounded-2xl border border-black/15 text-center shrink-0">
                  <div className="text-[10px] font-mono uppercase font-bold text-black/70">Student Code</div>
                  <div className="text-lg font-black font-mono">STU-008AC5</div>
                </div>
              </div>
            </div>

            {/* Chamber Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Constitutional Bench Chamber",
                  mentor: "Prof. Dr. Rajesh Varma",
                  affiliation: "NLSIU Bengaluru Faculty",
                  status: "Live Now (14 Scholars)",
                  topic: "Basic Structure & Article 368 Judicial Limits",
                  timing: "Open until 2:00 PM",
                },
                {
                  title: "Criminal Trial Advocacy Chamber",
                  mentor: "Adv. Sunita Deshmukh",
                  affiliation: "Senior Advocate, High Court",
                  status: "Starting at 3:00 PM",
                  topic: "BNS Section 69 Deceitful Inducement Concordance",
                  timing: "3:00 PM - 4:30 PM",
                },
                {
                  title: "CLAT & KLEE Aptitude Chamber",
                  mentor: "Adv. Rohan Mehra",
                  affiliation: "All-India CLAT AIR 12 Alum",
                  status: "1-on-1 Slots Open",
                  topic: "Passage Speed & Principle-Fact Traps",
                  timing: "Today, 6:00 PM",
                },
              ].map((room, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        {room.status}
                      </span>
                      <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                    </div>
                    <h4 className="text-base font-bold text-black dark:text-white leading-snug">{room.title}</h4>
                    <p className="text-xs text-zinc-500">{room.mentor} • {room.affiliation}</p>
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-700 dark:text-zinc-300 font-serif">
                      📌 {room.topic}
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Entering chamber: ${room.title}`)}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Enter Chamber Session</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: EXAM CRACKER (EDUPYE SCREENSHOT FEATURE)              */}
        {/* ============================================================== */}
        {activeSection === "exam_cracker" && (
          <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl mx-auto">
            {/* Header with Streaks */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">High-Yield Exam Cracker Drills</h3>
                <p className="text-xs text-zinc-500">Tap cards to flip between legal doctrines and test-day ratios.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/30 text-xs font-mono font-extrabold flex items-center gap-1">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>{streakCount} Day Streak</span>
                </span>
                <span className="text-xs font-mono text-zinc-500">Card {crackerIndex + 1} of {flashDrills.length}</span>
              </div>
            </div>

            {/* Interactive 3D Flip Card */}
            {(() => {
              const currentDrill = flashDrills[crackerIndex];
              return (
                <div
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className="min-h-[300px] sm:min-h-[340px] rounded-3xl bg-white dark:bg-zinc-900 border-2 border-amber-500/30 hover:border-amber-500 p-8 cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-xl relative select-none"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-black uppercase">
                      {currentDrill.subject}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {isFlipped ? "Tap to view Doctrine" : "Tap card to flip ratio"}
                    </span>
                  </div>

                  <div className="py-6 text-center space-y-3">
                    {!isFlipped ? (
                      <>
                        <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Landmark Constitutional Doctrine</span>
                        <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight leading-snug">
                          {currentDrill.doctrine}
                        </h2>
                        <p className="text-xs text-zinc-500">What is the ratio decidendi established in this milestone judgment?</p>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold tracking-wider">
                          Ratio Decidendi &amp; Core Principle
                        </span>
                        <p className="text-base sm:text-lg font-bold text-black dark:text-white font-serif max-w-xl mx-auto leading-relaxed">
                          &quot;{currentDrill.principle}&quot;
                        </p>
                        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 max-w-md mx-auto font-medium">
                          ⚡ Exam Trap: {currentDrill.keyTakeaway}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCrackerIndex((prev) => (prev > 0 ? prev - 1 : flashDrills.length - 1));
                        setIsFlipped(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 font-bold transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setStreakCount((prev) => prev + 1);
                        setCrackerIndex((prev) => (prev < flashDrills.length - 1 ? prev + 1 : 0));
                        setIsFlipped(false);
                      }}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold transition-all shadow-sm"
                    >
                      Mastered! Next →
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: HOMEWORK TRACKER (EDUPYE SCREENSHOT FEATURE)           */}
        {/* ============================================================== */}
        {activeSection === "homework" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Homework Tabs */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHomeworkTab("pending")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  homeworkTab === "pending"
                    ? "bg-amber-500 text-black font-extrabold shadow-xs"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                Pending Tasks ({studentHomework.filter((h) => h.status === "pending").length})
              </button>
              <button
                onClick={() => setHomeworkTab("completed")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  homeworkTab === "completed"
                    ? "bg-amber-500 text-black font-extrabold shadow-xs"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                Completed &amp; Graded ({studentHomework.filter((h) => h.status === "completed").length})
              </button>
            </div>

            {/* Homework Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studentHomework
                .filter((h) => h.status === homeworkTab)
                .map((hw) => (
                  <div
                    key={hw.id}
                    className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase">
                          {hw.subject}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">{hw.dueDate}</span>
                      </div>
                      <h4 className="text-base font-bold text-black dark:text-white">{hw.title}</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 font-serif leading-relaxed">
                        {hw.instructions}
                      </p>
                      <div className="text-[11px] text-zinc-500">Assignee: {hw.faculty}</div>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      {hw.status === "pending" ? (
                        <button
                          onClick={() => {
                            setSubmittingHwId(hw.id);
                            setHwSubmissionText("");
                          }}
                          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold transition-all cursor-pointer text-center"
                        >
                          Submit Assignment Answer
                        </button>
                      ) : (
                        <div className="w-full flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          <span className="font-bold">Grade: {hw.grade}</span>
                          <span className="text-[11px] italic">{hw.feedback}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: TESTS & CBT MOCKS (EDUPYE SCREENSHOT FEATURE)          */}
        {/* ============================================================== */}
        {activeSection === "tests" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-6 rounded-3xl bg-amber-500 text-black flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-mono font-bold uppercase">
                  Consortium CBT Simulation Window
                </span>
                <h3 className="text-xl font-black">All-India CLAT 2027 Full Length Diagnostic Mock</h3>
                <p className="text-xs text-black/80 font-medium">120 Minutes • 120 Questions • Testbook / NLU Standard Negative Marking (-0.25)</p>
              </div>
              <button
                onClick={() => {
                  setActiveMockTest(sampleFreeMock);
                  setSelectedAnswers({});
                  setMockScore(null);
                }}
                className="px-6 py-3 rounded-2xl bg-black hover:bg-zinc-800 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md shrink-0"
              >
                Launch CBT Simulator Now →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testSeriesPacks.map((pack) => (
                <div key={pack.id} className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">{pack.badge}</span>
                    <h4 className="text-base font-bold text-black dark:text-white">{pack.title}</h4>
                    <p className="text-xs text-zinc-500">{pack.testsCount} Total Mocks • Detailed Answer Keys</p>
                  </div>
                  <button
                    onClick={() => setPurchaseItem({
                      type: "test_series",
                      title: pack.title,
                      price: pack.price,
                      originalPrice: pack.originalPrice,
                      features: pack.features,
                    })}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer"
                  >
                    Unlock Test Pack (₹{pack.price})
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: MY ENROLLED COURSES (EDUPYE SCREENSHOT FEATURE)       */}
        {/* ============================================================== */}
        {activeSection === "my_courses" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {masterclassCourses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        {course.badge}
                      </span>
                      <span className="text-zinc-500 font-mono text-[11px]">{course.unitsCount}</span>
                    </div>
                    <h4 className="text-base font-bold text-black dark:text-white leading-snug">{course.title}</h4>
                    <p className="text-xs text-zinc-500 line-clamp-2">{course.description}</p>
                    
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-zinc-500">Progress</span>
                        <span className="font-bold text-amber-500">{Math.round((course.completedUnits / course.totalUnits) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${(course.completedUnits / course.totalUnits) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        setSelectedCourseForPortal(course);
                        setPortalTab("video");
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume Learning Portal</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: BOOK SHELF (EDUPYE SCREENSHOT FEATURE)                */}
        {/* ============================================================== */}
        {activeSection === "bookshelf" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bookshelfItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-3">
                    <div className={`h-40 rounded-2xl bg-gradient-to-br ${item.accent} p-4 text-white flex flex-col justify-between shadow-md`}>
                      <BookMarked className="w-6 h-6 text-white/80" />
                      <div>
                        <div className="text-sm font-black line-clamp-2">{item.title}</div>
                        <div className="text-[10px] text-white/70 font-mono mt-1">Last Read: {item.lastRead}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-black dark:text-white">{item.title}</h4>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">Page {item.currentPage} of {item.totalPages} ({item.progress})</p>
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Resuming reading: ${item.title}`)}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Continue Reading</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: MOOT PROJECTS (EDUPYE SCREENSHOT FEATURE)             */}
        {/* ============================================================== */}
        {activeSection === "projects" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studentProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 uppercase">
                      {proj.track}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">Due: {proj.deadline}</span>
                  </div>
                  <h4 className="text-base font-bold text-black dark:text-white">{proj.title}</h4>
                  
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-zinc-500 block">Team Members:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.team.map((member, mIdx) => (
                        <span key={mIdx} className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-600">{proj.status} ({proj.progress})</span>
                    <button
                      onClick={() => alert(`Opening collaborative project space for: ${proj.title}`)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold transition-all cursor-pointer"
                    >
                      Open Project Room →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: 3D LAB (EDUPYE SCREENSHOT FEATURE)                    */}
        {/* ============================================================== */}
        {activeSection === "three_d_lab" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-black tracking-wider">
                    Virtual Supreme Court &amp; High Court Moot Environment
                  </span>
                  <h3 className="text-xl font-black">Interactive 3D Courtroom Simulation Lab</h3>
                </div>
                <div className="flex items-center gap-2">
                  {(["bench", "bar", "podium", "witness"] as const).map((zone) => (
                    <button
                      key={zone}
                      onClick={() => setActive3dZone(zone)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase font-mono ${
                        active3dZone === zone
                          ? "bg-amber-500 text-black font-extrabold"
                          : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                      }`}
                    >
                      {zone}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Courtroom Perspective Canvas */}
              <div className="h-64 rounded-2xl bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                  <span>CAMERA ANGLE: {active3dZone.toUpperCase()} VIEW</span>
                  <span className="text-emerald-400 font-bold">● 60 FPS RENDER</span>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-2xl">
                    ⚖️
                  </div>
                  <h4 className="text-lg font-black text-white">
                    {active3dZone === "bench" && "Hon'ble Supreme Court Division Bench View"}
                    {active3dZone === "bar" && "Senior Counsel & Junior Advocate Bar Table"}
                    {active3dZone === "podium" && "Appellate Argument Central Lectern"}
                    {active3dZone === "witness" && "Witness Deposition Box & Cross-Examination Angle"}
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    Courtroom Etiquette: Stand upon presiding judge&apos;s entrance, address bench as &apos;Your Lordship / Your Ladyship&apos;, keep submissions within allocated 15-minute moot window.
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => alert(`Launching full 3D interactive simulation for ${active3dZone}!`)}
                    className="px-5 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:bg-white transition-all cursor-pointer shadow-md"
                  >
                    Launch Fullscreen 3D Lab
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: BOOKMARKS (EDUPYE SCREENSHOT FEATURE)                 */}
        {/* ============================================================== */}
        {activeSection === "bookmarks" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-black dark:text-white">Starred Precedents &amp; Legal Citations</h3>
                  <p className="text-xs text-zinc-500">Your personalized revision bookmarks for CLAT, KLEE, and distance law exams.</p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-500">{bookmarkedItems.length} Bookmarks</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {bookmarkedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold uppercase">
                        {item.type}
                      </span>
                      <span>{item.date}</span>
                    </div>
                    <h4 className="font-bold text-black dark:text-white text-sm leading-snug">{item.title}</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800 italic">
                      💡 {item.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      </div>

      {/* ============================================================== */}
      {/* 3. ENROLLMENT / CHECKOUT MODAL                                 */}
      {/* ============================================================== */}
      {purchaseItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setPurchaseItem(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {purchaseSuccess ? (
              <div className="text-center py-6 space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Enrollment Successful!
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  You now have instant access to <strong>{purchaseItem.title}</strong>. Loading your test workspace...
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase">
                    Checkout &amp; Instant Access
                  </span>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    {purchaseItem.title}
                  </h3>
                  {purchaseItem.extraNote && (
                    <p className="text-xs text-zinc-500">{purchaseItem.extraNote}</p>
                  )}
                </div>

                {/* Features */}
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase block">What is included:</span>
                  {purchaseItem.features.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Base Price:</span>
                    <span className="line-through">₹{purchaseItem.originalPrice}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Course Discount:</span>
                    <span>-₹{purchaseItem.originalPrice - purchaseItem.price}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-amber-600 font-bold">
                      <span>Coupon (WAKHEEL10 applied):</span>
                      <span>-₹100</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-black dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span>Total Payable:</span>
                    <span className="font-mono">
                      ₹{couponApplied ? Math.max(0, purchaseItem.price - 100) : purchaseItem.price}
                    </span>
                  </div>
                </div>

                {/* Payment Buttons */}
                <button
                  onClick={handleConfirmPurchase}
                  disabled={isCheckingOut}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isCheckingOut ? "Processing Payment..." : "Pay via UPI / Card & Unlock"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. 1-ON-1 TUTOR BOOKING MODAL                                  */}
      {/* ============================================================== */}
      {selectedTutor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedTutor(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-6 space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  1-on-1 Session Confirmed!
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Your live mentoring session with <strong>{selectedTutor.name}</strong> has been booked for <strong>{bookingDate}</strong>. Meeting link sent to your email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmTutorBooking} className="space-y-4 pt-1">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase">
                    Personal Legal Mentorship
                  </span>
                  <h3 className="text-base font-bold text-black dark:text-white mt-1">
                    Book Session with {selectedTutor.name}
                  </h3>
                  <p className="text-xs text-zinc-500">{selectedTutor.title} • ₹{selectedTutor.hourlyRate} / 45 mins</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Select Available Time Slot
                  </label>
                  <select
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-black dark:text-white outline-none cursor-pointer"
                  >
                    <option value="Today, 6:00 PM">Today, 6:00 PM - 6:45 PM</option>
                    <option value="Today, 8:00 PM">Today, 8:00 PM - 8:45 PM</option>
                    <option value="Tomorrow, 5:30 PM">Tomorrow, 5:30 PM - 6:15 PM</option>
                    <option value="Saturday, 11:00 AM">Saturday, 11:00 AM - 11:45 AM</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Session Focus / Question
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingTopic}
                    onChange={(e) => setBookingTopic(e.target.value)}
                    placeholder="e.g. Contract Breach Hadley rule, CLAT Legal Aptitude"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-black dark:text-white outline-none"
                  />
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Total Session Fee:</span>
                  <span className="text-base font-black text-black dark:text-white font-mono">
                    ₹{selectedTutor.hourlyRate}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  Confirm &amp; Book Session
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. CHAMBER CLERKSHIP APPLICATION MODAL                         */}
      {/* ============================================================== */}
      {selectedInternship && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedInternship(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {internshipApplySuccess ? (
              <div className="text-center py-6 space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Application Dispatched to Chamber!
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Your academic profile, mock test percentile (<strong>94.8%</strong>), and verified resume have been transmitted directly to <strong>{selectedInternship.chamber}</strong>. The chamber clerk will contact you within 48 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setInternshipApplySuccess(true);
                  setTimeout(() => {
                    setSelectedInternship(null);
                  }, 1800);
                }}
                className="space-y-4 pt-1"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase">
                    Clerkship Application
                  </span>
                  <h3 className="text-base font-bold text-black dark:text-white mt-1">
                    {selectedInternship.title}
                  </h3>
                  <p className="text-xs text-zinc-500">{selectedInternship.chamber} • {selectedInternship.stipend}</p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Applicant:</span>
                    <strong className="text-black dark:text-white">{studentProfile.fullName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Predicted Percentile:</span>
                    <strong className="text-amber-600 font-mono">94.8% (AIR 412)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Duration:</span>
                    <strong className="text-black dark:text-white">{selectedInternship.duration}</strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Statement of Interest / Research Focus
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={applicantNote}
                    onChange={(e) => setApplicantNote(e.target.value)}
                    placeholder="Briefly state your moot court experience, research interest, or legal aptitude..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-black dark:text-white outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Submit Verified Application</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Profile Drawer */}
      {showProfileDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowProfileDrawer(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-black font-black text-xl flex items-center justify-center mx-auto shadow-md">
                {studentProfile.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  {studentProfile.fullName}
                </h3>
                <p className="text-xs text-zinc-500 font-mono">{studentProfile.email}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Target Track:</span>
                <span className="font-bold text-black dark:text-white text-right">{studentProfile.targetExam}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Affiliation:</span>
                <span className="font-bold text-black dark:text-white text-right">{studentProfile.universityName}</span>
              </div>
            </div>

            {onSignOut && (
              <button
                onClick={() => {
                  setShowProfileDrawer(false);
                  onSignOut();
                }}
                className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-950 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 cursor-pointer"
              >
                Sign Out of Student Hub
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. EDUPYE FLOATING AI COPILOT WIDGET ([★ Wakheel AI | HYBRID]) */}
      {/* ============================================================== */}
      {/* Backdrop scrim when drawer is open */}
      {showFloatingAI && (
        <div
          onClick={() => setShowFloatingAI(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 transition-opacity animate-in fade-in duration-200"
        />
      )}

      {/* Slide-Over Side Drawer (Option 2) */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[460px] md:w-[500px] z-50 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          showFloatingAI ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-zinc-950 text-white border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-black flex items-center justify-center font-black shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black flex items-center gap-1.5 text-white">
                <span>Wakheel AI Copilot</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold">
                  HYBRID v2.5
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">Judicial Reasoning &amp; BNS Concordance</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setFloatingMessages([
                  {
                    sender: "ai",
                    text: "Chat cleared. What legal problem or entrance topic would you like to explore?",
                    time: "Just now",
                    mode: floatingCopilotMode,
                  },
                ]);
              }}
              title="Clear conversation"
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowFloatingAI(false)}
              title="Close Drawer"
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-1.5 text-xs shrink-0">
          <button
            onClick={() => setFloatingCopilotMode("aptitude")}
            className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all text-center cursor-pointer ${
              floatingCopilotMode === "aptitude"
                ? "bg-amber-500 text-black shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            🎓 Aptitude Drill
          </button>
          <button
            onClick={() => setFloatingCopilotMode("bns_statutory")}
            className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all text-center cursor-pointer ${
              floatingCopilotMode === "bns_statutory"
                ? "bg-amber-500 text-black shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            ⚖️ BNS / Acts
          </button>
          <button
            onClick={() => setFloatingCopilotMode("precedents")}
            className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all text-center cursor-pointer ${
              floatingCopilotMode === "precedents"
                ? "bg-amber-500 text-black shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            🏛️ Precedents
          </button>
        </div>

        {/* Quick Prompt Pills Carousel */}
        <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] shrink-0">
          {[
            { label: "Sec 69 BNS 2023", q: "Summarize Section 69 BNS 2023" },
            { label: "Kesavananda Ratio", q: "Ratio in Kesavananda Bharati" },
            { label: "Art 32 vs 226 Writs", q: "Article 32 vs 226 Writs" },
            { label: "Maneka Gandhi Art 21", q: "Maneka Gandhi due process under Article 21" },
            { label: "Sec 138 NI Act", q: "Explain Section 138 NI Act cheque dishonour" },
            { label: "Bail BNSS 482", q: "Anticipatory bail under Section 482 BNSS" },
            { label: "CLAT Aptitude Drill", q: "Generate CLAT principle-fact passage drill" },
          ].map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSendFloatingAI(undefined, prompt.q)}
              className="px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 whitespace-nowrap cursor-pointer transition-colors font-medium shadow-2xs"
            >
              {prompt.label}
            </button>
          ))}
        </div>

        {/* Chat Messages (Expanded Full-Height Scrollable Stream) */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs scrollbar-thin">
          {floatingMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[90%] p-3.5 rounded-2xl ${
                  msg.sender === "user"
                    ? "bg-amber-500 text-black font-semibold rounded-br-xs shadow-xs"
                    : "bg-zinc-50 dark:bg-zinc-900 text-black dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-bl-xs leading-relaxed space-y-3 shadow-2xs"
                }`}
              >
                {/* Main message text */}
                <div className="text-[12px] leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </div>

                {/* Statutes Pills */}
                {msg.statutes && msg.statutes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.statutes.map((st, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                )}

                {/* Landmark Precedent Card */}
                {msg.citation && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] space-y-1.5">
                    <div className="flex items-center gap-1.5 font-black text-amber-700 dark:text-amber-400">
                      <Scale className="w-4 h-4 shrink-0" />
                      <span>{msg.citation.caseTitle}</span>
                    </div>
                    <div className="font-mono text-[9.5px] text-zinc-500 dark:text-zinc-400">
                      {msg.citation.citation} {msg.citation.bench ? `• ${msg.citation.bench}` : ""}
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 italic pt-0.5 leading-snug">
                      <span className="font-bold not-italic">Ratio Decidendi: </span>
                      {msg.citation.ratio}
                    </p>
                  </div>
                )}

                {/* Exam Tip */}
                {msg.examTip && (
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-[10.5px] text-blue-800 dark:text-blue-300 flex items-start gap-1.5 leading-snug">
                    <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{msg.examTip}</span>
                  </div>
                )}

                {/* Footer with Timestamp & Copy */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-200/50 dark:border-zinc-800/60 text-[9.5px] text-zinc-400 font-mono">
                  <span>{msg.time}</span>
                  {msg.sender === "ai" && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(msg.text);
                        setFloatingCopilotCopiedIndex(idx);
                        setTimeout(() => setFloatingCopilotCopiedIndex(null), 2000);
                      }}
                      className="flex items-center gap-1 hover:text-amber-500 transition-colors cursor-pointer"
                      title="Copy response"
                    >
                      {floatingCopilotCopiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {floatingLoading && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-xs text-zinc-500 font-mono border border-zinc-200 dark:border-zinc-800 animate-pulse">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span>Synthesizing statutory concordance &amp; judicial precedent...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <form
          onSubmit={(e) => handleSendFloatingAI(e)}
          className="p-3 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={floatingQuery}
            onChange={(e) => setFloatingQuery(e.target.value)}
            placeholder={
              floatingCopilotMode === "aptitude"
                ? "Ask a CLAT/KLEE aptitude drill or passage question..."
                : floatingCopilotMode === "bns_statutory"
                ? "Lookup BNS 2023 or IPC section (e.g., Sec 69, Sec 103)..."
                : "Search landmark High Court & Supreme Court ratios..."
            }
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white outline-none focus:border-amber-500 font-medium placeholder:text-zinc-400 transition-colors"
          />
          <button
            type="submit"
            disabled={floatingLoading || !floatingQuery.trim()}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            title="Send legal query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Floating Pill Button matching EduPye ([★ EduPye AI | HYBRID]) */}
      <button
        onClick={() => setShowFloatingAI((prev) => !prev)}
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full bg-gradient-to-r from-sky-950 via-slate-900 to-black text-white border border-sky-400/40 hover:border-sky-300 shadow-2xl hover:shadow-cyan-500/20 flex items-center gap-2.5 cursor-pointer transition-all hover:scale-105 active:scale-95 group backdrop-blur-md"
        title="EduPye AI Hybrid Legal Assistant"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
        </span>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-black tracking-wide text-white">EduPye AI</span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[10px] font-mono font-black uppercase tracking-wider">
          HYBRID
        </span>
      </button>

      {/* ============================================================== */}
      {/* 7. EDUPYE COURSE LEARNING PORTAL MODAL (OPEN PORTAL >)          */}
      {/* ============================================================== */}
      {selectedCourseForPortal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Top Bar */}
            <div className="p-4 bg-zinc-950 text-white border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-mono font-black text-[10px] uppercase shrink-0">
                  {selectedCourseForPortal.badge}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black truncate text-white">
                    {selectedCourseForPortal.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono truncate">
                    {selectedCourseForPortal.instructor} • {selectedCourseForPortal.videoDuration}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCourseForPortal(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="px-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
              <button
                onClick={() => setPortalTab("video")}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  portalTab === "video"
                    ? "border-amber-500 text-black dark:text-white"
                    : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                <Video className="w-3.5 h-3.5 text-amber-500" />
                <span>Classroom Lecture</span>
              </button>
              <button
                onClick={() => setPortalTab("notes")}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  portalTab === "notes"
                    ? "border-amber-500 text-black dark:text-white"
                    : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Bare Act Study Notes</span>
              </button>
              <button
                onClick={() => setPortalTab("quiz")}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  portalTab === "quiz"
                    ? "border-amber-500 text-black dark:text-white"
                    : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                <span>Chapter Practice Quiz</span>
              </button>
              <button
                onClick={() => setPortalTab("forum")}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  portalTab === "forum"
                    ? "border-amber-500 text-black dark:text-white"
                    : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span>Faculty Discussion</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {portalTab === "video" && (
                <div className="space-y-5">
                  {/* Video Player Mockup */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-lg flex flex-col justify-between p-4 group">
                    <img
                      src={selectedCourseForPortal.image}
                      alt={selectedCourseForPortal.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />

                    {/* Top Status */}
                    <div className="relative z-10 flex items-center justify-between text-xs text-white">
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-mono font-bold text-[10px]">
                        LIVE STREAM RECORDING
                      </span>
                      <span className="font-mono text-zinc-400">1080p 60fps • EduPye HD</span>
                    </div>

                    {/* Center Play Button */}
                    <div className="relative z-10 flex items-center justify-center">
                      <button
                        onClick={() => setPortalVideoPlaying((prev) => !prev)}
                        className="w-16 h-16 rounded-full bg-amber-500 hover:bg-white text-black flex items-center justify-center shadow-2xl transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Play className="w-7 h-7 fill-black ml-1 text-black" />
                      </button>
                    </div>

                    {/* Bottom Controls Bar */}
                    <div className="relative z-10 bg-black/70 backdrop-blur-md rounded-xl p-2.5 flex items-center justify-between text-white text-xs gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] text-zinc-300">14:20 / 48:30</span>
                        <div className="w-24 sm:w-48 h-1.5 rounded-full bg-zinc-700 overflow-hidden">
                          <div className="h-full bg-amber-500 w-[30%]" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setPortalPlaybackSpeed((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1))
                          }
                          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 font-mono text-[10px] font-bold cursor-pointer"
                        >
                          {portalPlaybackSpeed}x
                        </button>
                        <Volume2 className="w-4 h-4 text-zinc-400" />
                        <Maximize2 className="w-4 h-4 text-zinc-400 cursor-pointer" />
                      </div>
                    </div>
                  </div>

                  {/* Active Lesson & Syllabus Units Tree */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-black dark:text-white">
                        Curriculum Syllabus ({selectedCourseForPortal.syllabus.length} Units)
                      </h4>
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">
                        {selectedCourseForPortal.completedUnits}/{selectedCourseForPortal.totalUnits} Completed
                      </span>
                    </div>

                    <div className="space-y-2">
                      {selectedCourseForPortal.syllabus.map((syl: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                            syl.completed
                              ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                              : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {syl.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                            )}
                            <span className={`font-semibold truncate ${syl.completed ? "text-zinc-600 dark:text-zinc-300" : "text-black dark:text-white"}`}>
                              {syl.unit}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500 shrink-0">{syl.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {portalTab === "notes" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-black dark:text-white">
                        High-Yield Statutory Compendium &amp; Case Tables
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Curated summaries of amendments, landmark bench ratios, and section mappings.
                      </p>
                    </div>
                    <button
                      onClick={() => alert(`Downloading verified PDF study notes for ${selectedCourseForPortal.title}...`)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs leading-relaxed">
                    <h5 className="font-bold text-sm text-black dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      Key Jurisprudential Tenets • Module Summary
                    </h5>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      <strong>1. Statutory Hierarchy:</strong> In statutory interpretation, the literal rule precedes the golden or mischief rules (Heydon&apos;s Case). Whenever ambiguity arises between state and central enactments, Article 254 mandates presidential assent to preserve repugnant state provisions.
                    </p>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      <strong>2. Criminal Reform Paradigm:</strong> The replacement of IPC 1860 with Bharatiya Nyaya Sanhita (BNS) 2023 shifted the primary penal focus from deterrence under colonial policing to restorative principles, introducing community service for petty property offenses.
                    </p>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      <strong>3. Judicial Review Standard:</strong> Administrative decisions are scrutinized via the proportionality doctrine, replacing the older Wednesbury test for fundamental rights infringements under Articles 14 and 21.
                    </p>
                  </div>
                </div>
              )}

              {portalTab === "quiz" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-black dark:text-white">
                        Diagnostic Chapter Quiz ({selectedCourseForPortal.quiz.length} Questions)
                      </h4>
                      <p className="text-xs text-zinc-500 font-mono">Consortium CLAT Pattern • +1 for correct</p>
                    </div>
                    {portalQuizSubmitted && (
                      <span className="px-3 py-1 rounded-xl bg-amber-500 text-black font-mono font-black text-xs">
                        Score: {Object.entries(portalQuizAnswers).filter(([idx, ans]) => selectedCourseForPortal.quiz[Number(idx)]?.correct === ans).length} / {selectedCourseForPortal.quiz.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {selectedCourseForPortal.quiz.map((q: any, qIdx: number) => {
                      const userAns = portalQuizAnswers[qIdx];
                      return (
                        <div
                          key={qIdx}
                          className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3"
                        >
                          <div className="font-bold text-xs sm:text-sm text-black dark:text-white flex items-start gap-2">
                            <span className="text-amber-500 font-mono font-black">Q{qIdx + 1}.</span>
                            <span>{q.question}</span>
                          </div>

                          <div className="space-y-1.5 pl-6">
                            {q.options.map((opt: string, optIdx: number) => {
                              const isSelected = userAns === optIdx;
                              const isCorrect = q.correct === optIdx;
                              let btnClass = "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-amber-500";
                              if (portalQuizSubmitted) {
                                if (isCorrect) btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold";
                                else if (isSelected) btnClass = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-bold";
                              } else if (isSelected) {
                                btnClass = "border-amber-500 bg-amber-500/10 text-black dark:text-white font-bold";
                              }

                              return (
                                <button
                                  key={optIdx}
                                  disabled={portalQuizSubmitted}
                                  onClick={() =>
                                    setPortalQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
                                  }
                                  className={`w-full p-2.5 rounded-xl border text-xs text-left transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
                                >
                                  <span>{opt}</span>
                                  {portalQuizSubmitted && isCorrect && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {portalQuizSubmitted && (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-zinc-800 dark:text-zinc-200 space-y-1 mt-2">
                              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-[11px] block">
                                Legal Ratio / Explanation:
                              </span>
                              <p className="text-[11px] leading-relaxed">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!portalQuizSubmitted ? (
                    <button
                      onClick={() => setPortalQuizSubmitted(true)}
                      disabled={Object.keys(portalQuizAnswers).length === 0}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      Submit Chapter Quiz &amp; View Analysis
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setPortalQuizSubmitted(false);
                        setPortalQuizAnswers({});
                      }}
                      className="w-full py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Quiz</span>
                    </button>
                  )}
                </div>
              )}

              {portalTab === "forum" && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-xs">
                          M
                        </div>
                        <div>
                          <strong className="text-black dark:text-white block">Meera Nambiar (NALSAR Aspirant)</strong>
                          <span className="text-[10px] text-zinc-500 font-mono">Yesterday at 4:30 PM</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                        Faculty Verified
                      </span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      In the Puttaswamy case, did all 9 judges agree on the standard of review for privacy infringement?
                    </p>
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                      <strong className="text-amber-600 dark:text-amber-400 block font-mono">
                        Adv. Sunita Deshmukh (Faculty Response):
                      </strong>
                      All 9 judges unanimously overruled MP Sharma and Kharak Singh to declare privacy a fundamental right. However, Justice Chandrachud formulated the 3-fold proportionality test (Legality, Legitimate State Aim, and Proportionality) which remains the authoritative standard.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. TUITION ACCESS & CHAMBER GRANT APPLICATION MODAL            */}
      {/* ============================================================== */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setShowGrantModal(false);
                setGrantSuccess(false);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {grantSuccess ? (
              <div className="text-center py-6 space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <BadgeCheck className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Tuition Grant Approved!
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Congratulations Advithya! Based on your academic aggregate and first-generation scholar status, you have been awarded a <strong>100% Full Fee Waiver</strong> on all Entrance Test Series &amp; Bare Act Modules.
                </p>
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 font-mono text-center space-y-1">
                  <span className="text-[10px] text-zinc-500 block">Your Scholarship Promo Code:</span>
                  <span className="text-base font-black text-amber-700 dark:text-amber-400 tracking-wider">
                    {grantCouponCode}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowGrantModal(false);
                    setGrantSuccess(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs uppercase cursor-pointer"
                >
                  Apply &amp; Continue Studying
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyGrant} className="space-y-4 pt-1">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
                    Wakheel Legal Scholars Initiative
                  </span>
                  <h3 className="text-base font-bold text-black dark:text-white mt-1">
                    Request Merit-cum-Means Tuition Access
                  </h3>
                  <p className="text-xs text-zinc-500">
                    100% fee concession for first-generation law aspirants and underprivileged students.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Annual Household Income Bracket
                  </label>
                  <select
                    value={grantIncomeBracket}
                    onChange={(e) => setGrantIncomeBracket(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-black dark:text-white outline-none cursor-pointer"
                  >
                    <option value="< ₹3.5 Lakhs (100% Waiver)">&lt; ₹3.5 Lakhs / year (100% Full Fee Waiver)</option>
                    <option value="₹3.5L - ₹6L (80% Concession)">₹3.5 Lakhs - ₹6 Lakhs (80% Concession)</option>
                    <option value="Rural / First-Gen Candidate">First-Generation Advocate in Family</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Qualifying Academic Aggregate
                  </label>
                  <input
                    type="text"
                    required
                    value={grantQualifyingScore}
                    onChange={(e) => setGrantQualifyingScore(e.target.value)}
                    placeholder="e.g. 91.2% in Class 12 or 78% in Graduation"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-black dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Statement of Purpose / Target Goal
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={grantStatement}
                    onChange={(e) => setGrantStatement(e.target.value)}
                    placeholder="Briefly state your career aspiration in law..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-black dark:text-white outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Submit Grant Application</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. ALL-INDIA LEADERBOARD & BADGES DRAWER (TROPHY ICON)         */}
      {/* ============================================================== */}
      {showLeaderboardDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col">
            <button
              onClick={() => setShowLeaderboardDrawer(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pt-1 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black">
                <Trophy className="w-5 h-5 text-current" />
              </div>
              <div>
                <h3 className="text-base font-black text-black dark:text-white">
                  All-India Hall of Fame &amp; Badges
                </h3>
                <p className="text-xs text-zinc-500 font-mono">Consortium CLAT &amp; KLEE Real-Time Ranks</p>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 shrink-0">
              <button
                onClick={() => setLeaderboardTab("ranks")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  leaderboardTab === "ranks"
                    ? "bg-amber-500 text-black font-extrabold shadow-xs"
                    : "text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                Top Rankers (All-India)
              </button>
              <button
                onClick={() => setLeaderboardTab("badges")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  leaderboardTab === "badges"
                    ? "bg-amber-500 text-black font-extrabold shadow-xs"
                    : "text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                My Badges ({studentBadges.filter((b) => b.unlocked).length}/4)
              </button>
            </div>

            {/* Tab 1: Leaderboard */}
            {leaderboardTab === "ranks" && (
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {/* User's own rank card */}
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-black font-black flex items-center justify-center">
                      #142
                    </div>
                    <div>
                      <strong className="text-black dark:text-white block">{studentProfile.fullName} (You)</strong>
                      <span className="text-[10px] text-zinc-500 font-mono">Score: 89.5 • 12 Mocks</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-amber-700 dark:text-amber-400 font-mono block">
                      94.8%
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Percentile</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {leaderboardAspirants.map((asp) => (
                    <div
                      key={asp.rank}
                      className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-6 text-center font-mono font-black ${
                            asp.rank === 1
                              ? "text-amber-500 font-black text-sm"
                              : asp.rank === 2
                              ? "text-zinc-400 font-bold"
                              : asp.rank === 3
                              ? "text-amber-700 font-bold"
                              : "text-zinc-500 text-[11px]"
                          }`}
                        >
                          #{asp.rank}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {asp.avatar}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-black dark:text-white truncate block">
                            {asp.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono truncate block">
                            {asp.target}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-black text-black dark:text-white block">
                          {asp.percentile}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">{asp.tests} tests</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Badges */}
            {leaderboardTab === "badges" && (
              <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                {studentBadges.map((badge) => {
                  return (
                    <div
                      key={badge.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                        badge.unlocked
                          ? "bg-amber-500/10 border-amber-500/30"
                          : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                            badge.unlocked ? "bg-amber-500 text-black" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <strong className="text-black dark:text-white block">{badge.title}</strong>
                          <span className="text-[10px] text-zinc-500 font-mono block">{badge.desc}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white block mb-1">
                          {badge.level}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-mono">{badge.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 10. VERNACULAR CURRICULA & LANGUAGE SWITCHER (GLOBE ICON)       */}
      {/* ============================================================== */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowLanguageModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pt-1">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Regional Jurisprudence &amp; Language
                </h3>
                <p className="text-xs text-zinc-500">Select entrance curriculum &amp; bilingual mock questions</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {supportedLanguages.map((lang) => {
                const isSelected = selectedLanguage.startsWith(lang.name.split(" ")[0]);
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.name);
                      setShowLanguageModal(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500 text-black dark:text-white shadow-xs"
                        : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 hover:border-amber-500"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-black dark:text-white flex items-center gap-2">
                        <span>{lang.name}</span>
                        {lang.popular && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500 text-black font-extrabold uppercase">
                            Major
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{lang.desc}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 11. REVISION NOTEBOOK & BOOKMARKS DRAWER                       */}
      {/* ============================================================== */}
      {showBookmarksDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col">
            <button
              onClick={() => setShowBookmarksDrawer(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pt-1 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  My Revision Notebook &amp; Bookmarks
                </h3>
                <p className="text-xs text-zinc-500 font-mono">Starred Mock Questions &amp; Bare Act Sections</p>
              </div>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 pt-2">
              {bookmarkedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-bold">
                      {item.type}
                    </span>
                    <span>{item.date}</span>
                  </div>
                  <h4 className="font-bold text-black dark:text-white leading-snug">{item.title}</h4>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    💡 <em>{item.note}</em>
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowBookmarksDrawer(false);
                setActiveSection("free_mocks");
                setActiveMockTest(sampleFreeMock);
                setSelectedAnswers({});
                setMockScore(null);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs shrink-0 flex items-center justify-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Launch 10-Question Revision Test</span>
            </button>
          </div>
        </div>
      )}
      {/* ============================================================== */}
      {/* 11. MANAGE CURRICULUM TRACK MODAL (EDUPYE LEARN SECTION)       */}
      {/* ============================================================== */}
      {showManageTrackModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowManageTrackModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                  CURRICULUM TRACK SWITCHER
                </span>
              </div>
              <h3 className="text-xl font-bold text-black dark:text-white mt-1">
                Manage Curriculum &amp; Examination Track
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                Choose your primary examination syllabus to synchronize your subjects, chapters, and CBT simulator tests.
              </p>
            </div>

            <div className="space-y-2">
              {[
                {
                  id: "Bar & Consortium Curriculum",
                  title: "Bar & Consortium Curriculum (Standard)",
                  desc: "Comprehensive syllabus matching Consortium of 24 NLUs and Bar Council of India LL.B guidelines.",
                  badge: "Default Track",
                },
                {
                  id: "CLAT 2027 (NLUs Track)",
                  title: "CLAT 2027 (NLUs Track)",
                  desc: "Specialized passage-based legal reasoning, inductive logic, and contemporary legal GK.",
                  badge: "High Competition",
                },
                {
                  id: "KLEE 2027 (Kerala Law Entrance)",
                  title: "KLEE 2027 (Kerala Law Entrance)",
                  desc: "Kerala CEE Pattern: Legal Aptitude, Constitutional Law, General Knowledge, and Arithmetic.",
                  badge: "State Entrance",
                },
                {
                  id: "Distance LL.B (IGNOU / State Bar)",
                  title: "Distance LL.B (IGNOU / State Bar)",
                  desc: "Foundational academic modules in Jurisprudence, Family Law, Contracts, and Civil Procedure.",
                  badge: "Degree Syllabus",
                },
                {
                  id: "Bharatiya Nyaya Sanhita (BNS 2023)",
                  title: "Bharatiya Nyaya Sanhita (New Criminal Laws 2023)",
                  desc: "Intensive statutory mapping of BNS 2023, BNSS 2023, and BSA 2023 replacing IPC/CrPC/IEA.",
                  badge: "Law Reforms",
                },
              ].map((trk) => {
                const isSelected = selectedCurriculumTrack === trk.id;
                return (
                  <div
                    key={trk.id}
                    onClick={() => {
                      setSelectedCurriculumTrack(trk.id);
                      setShowManageTrackModal(false);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-black dark:text-white shadow-xs ring-1 ring-sky-500"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{trk.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-400">
                          {trk.badge}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{trk.desc}</p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 12. CREATE STUDIO TOOLS MODALS (EDUPYE >> CREATE PALETTE)     */}
      {/* ============================================================== */}
      {activeCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveCreateModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal: Smart Board / Projects */}
            {activeCreateModal === "smartboard" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold">
                    <Presentation className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white">Smart Board &amp; Project Canvas</h3>
                    <p className="text-xs text-zinc-500">
                      Interactive legal whiteboard for case analysis, statutory flowcharts, and argument mapping.
                    </p>
                  </div>
                </div>
                <div className="aspect-video w-full rounded-2xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-zinc-400">
                      Canvas: Kesavananda Basic Structure Flowchart
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      Ready to Draw
                    </span>
                  </div>
                  <div className="text-center space-y-2 my-auto">
                    <PenTool className="w-8 h-8 text-sky-500 mx-auto" />
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Drag legal nodes, link articles, or annotate landmark rulings with advocate peers.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <span className="text-[11px] text-zinc-400">Tools: Pen • Highlighting • Shapes • Export PDF</span>
                    <button
                      onClick={() => setActiveCreateModal(null)}
                      className="px-4 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-bold cursor-pointer hover:bg-sky-600"
                    >
                      Save to My Projects
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Mind Map */}
            {activeCreateModal === "mind_map" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white">AI Legal Mind Map</h3>
                    <p className="text-xs text-zinc-500">
                      Visual conceptual hierarchy of Constitutional Rights &amp; BNS Concordance.
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="font-mono text-xs font-bold text-sky-600 dark:text-amber-400">
                    PART III: FUNDAMENTAL RIGHTS (ARTICLES 12–35)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                      <strong className="text-slate-900 dark:text-white block">Right to Equality (Art. 14–18)</strong>
                      <span className="text-zinc-500 text-[11px]">Rule of law, non-arbitrariness, reservations.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                      <strong className="text-slate-900 dark:text-white block">Right to Freedom (Art. 19–22)</strong>
                      <span className="text-zinc-500 text-[11px]">6 freedoms, reasonable restrictions, personal liberty.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                      <strong className="text-slate-900 dark:text-white block">Right to Life (Art. 21)</strong>
                      <span className="text-zinc-500 text-[11px]">Privacy (Puttaswamy), dignity, speedy trial.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                      <strong className="text-slate-900 dark:text-white block">Constitutional Remedies (Art. 32)</strong>
                      <span className="text-zinc-500 text-[11px]">Habeas Corpus, Mandamus, Quo Warranto, Certiorari.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Flash Card */}
            {activeCreateModal === "flash_card" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white">Legal Concordance Flashcards</h3>
                    <p className="text-xs text-zinc-500">
                      Master IPC 1860 vs BNS 2023 section shifts and Latin maxim meanings.
                    </p>
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-center space-y-3">
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-black">
                    CARD 1 OF 50 • CRIMINAL CONCORDANCE
                  </span>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                    Section 69 BNS 2023
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-md mx-auto">
                    Sexual intercourse by employing deceitful means (such as false promise of employment or promotion, or marrying without intention).
                  </p>
                  <div className="pt-2">
                    <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                      Old Law: Previously prosecuted under Sec 376 / 417 IPC
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Summary */}
            {activeCreateModal === "summary" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                    <AlignLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white">Ratio Decidendi Summarizer</h3>
                    <p className="text-xs text-zinc-500">
                      Condense 100-page Supreme Court judgments into essential principles and ratio decidendi.
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Sample Output: Kesavananda Bharati v. State of Kerala (1973) 4 SCC 225
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <strong>Ratio:</strong> Article 368 gives Parliament constituent power to amend any provision of the Constitution, including Fundamental Rights, but does not enable Parliament to alter the Basic Structure or essential framework of the Constitution.
                  </p>
                </div>
              </div>
            )}

            {/* Modal: Timeline */}
            {activeCreateModal === "timeline" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white">Constitutional Landmark Timeline</h3>
                    <p className="text-xs text-zinc-500">Chronological evolution of Indian constitutional jurisprudence.</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { year: "1950", case: "A.K. Gopalan v. State of Madras", desc: "Narrow interpretation of Article 21 ('procedure established by law')." },
                    { year: "1973", case: "Kesavananda Bharati v. State of Kerala", desc: "13-judge bench establishes the Basic Structure Doctrine." },
                    { year: "1978", case: "Maneka Gandhi v. Union of India", desc: "Article 21 procedure must be 'just, fair, and reasonable'; Golden Triangle created." },
                    { year: "2017", case: "K.S. Puttaswamy v. Union of India", desc: "9-judge bench declares Right to Privacy as an intrinsic Fundamental Right." },
                  ].map((t, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-start gap-3">
                      <span className="font-mono font-bold text-sky-600 dark:text-amber-400 shrink-0">{t.year}</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white block">{t.case}</strong>
                        <span className="text-zinc-500">{t.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal: Audio */}
            {activeCreateModal === "audio" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white">Legal Audio Lecture &amp; Podcaster</h3>
                    <p className="text-xs text-zinc-500">Listen to high-yield statutory summaries and landmark courtroom briefs on the go.</p>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-zinc-950 text-white space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-amber-400">AUDIO EPISODE 04</span>
                    <span className="text-zinc-400 font-mono">14:20 / 28:00</span>
                  </div>
                  <h4 className="text-sm font-bold">Section 103 BNS Murder &amp; Culpable Homicide Distinction</h4>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-amber-500 w-1/2" />
                  </div>
                  <div className="flex items-center justify-center gap-4 pt-1">
                    <button className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                    <button className="px-2.5 py-1 rounded-lg bg-zinc-800 text-xs font-mono font-bold text-zinc-300">
                      1.5x
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Video, Chapter, Notes generic fallback */}
            {["video", "chapter", "notes"].includes(activeCreateModal) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white capitalize">
                      {activeCreateModal} Studio
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Interactive tool for curriculum synthesis and appellate research.
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
                  <p className="text-slate-700 dark:text-zinc-300">
                    Ready to generate or review your {activeCreateModal} module for {selectedCurriculumTrack}.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCreateModal(null);
                      if (activeCreateModal === "video") {
                        setSelectedCourseForPortal(masterclassCourses[0]);
                        setPortalTab("video");
                        setPortalVideoPlaying(true);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs cursor-pointer hover:bg-sky-600"
                  >
                    Launch in Full Portal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. CORNELL NOTE CREATION MODAL */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowAddNoteModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
                <BookText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">Create New Cornell Law Note</h3>
                <p className="text-xs text-zinc-500">Structured template with recall cues &amp; executive summary</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Note Title / Topic</label>
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="e.g. Doctrine of Pith and Substance under Article 246"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Curriculum Subject</label>
                <select
                  value={newNoteSubject}
                  onChange={(e) => setNewNoteSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white text-xs focus:outline-none"
                >
                  <option value="Constitutional Law">Constitutional Law</option>
                  <option value="Criminal Jurisprudence (BNS)">Criminal Jurisprudence (BNS)</option>
                  <option value="Law of Contracts">Law of Contracts</option>
                  <option value="Civil Procedure & Evidence">Civil Procedure &amp; Evidence</option>
                  <option value="Legal Reasoning (CLAT)">Legal Reasoning (CLAT)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newNoteTitle.trim()) return;
                  const newNote = {
                    id: `note_${Date.now()}`,
                    title: newNoteTitle.trim(),
                    subject: newNoteSubject,
                    cues: ["Core Statutory Provision", "Leading Case Precedent", "Testday Exception"],
                    content: "Preliminary research notes on statutory interpretation and standard tests applied by appellate courts.",
                    summary: "Key takeaway synthesis summarizing legislative objective and judicial application.",
                    lastEdited: "Just now",
                  };
                  setStudentNotes([newNote, ...studentNotes]);
                  setSelectedNoteId(newNote.id);
                  setNewNoteTitle("");
                  setShowAddNoteModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer shadow-sm"
              >
                Create Cornell Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. HOMEWORK SUBMISSION MODAL */}
      {submittingHwId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSubmittingHwId(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">Submit Assignment Answer</h3>
                <p className="text-xs text-zinc-500">Direct evaluation by Faculty Panel</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Your Legal Analysis / Draft Text</label>
                <textarea
                  rows={4}
                  value={hwSubmissionText}
                  onChange={(e) => setHwSubmissionText(e.target.value)}
                  placeholder="Draft your submission or paste legal ratios and statutory arguments here..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white text-xs focus:outline-none resize-none font-serif"
                />
              </div>

              <div className="p-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-zinc-500 cursor-pointer hover:border-amber-500">
                📎 Attach Additional Supporting Brief or PDF (Optional)
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSubmittingHwId(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setStudentHomework((prev) =>
                    prev.map((h) =>
                      h.id === submittingHwId
                        ? {
                            ...h,
                            status: "completed" as const,
                            grade: "Under Faculty Evaluation",
                            feedback: "Submission received. Prof. Dr. Rajesh Varma will provide feedback within 24h.",
                          }
                        : h
                    )
                  );
                  setSubmittingHwId(null);
                  setHomeworkTab("completed");
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer shadow-sm"
              >
                Submit to Faculty
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}