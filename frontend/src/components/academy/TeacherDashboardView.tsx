"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Clock,
  Search,
  FileText,
  User,
  LogOut,
  X,
  Star,
  Check,
  Video,
  HelpCircle,
  PenTool,
  Upload,
  BarChart3,
  Radio,
  Menu,
  Home,
  Calendar,
  Library,
  Layers,
  CheckSquare,
  UserCheck,
  Users,
  Mic,
  Brain,
  AlignLeft,
  Bookmark,
  ListTodo,
  Plus,
  ChevronRight,
  ChevronDown,
  Presentation,
  Globe,
  Trophy,
  ArrowRight,
  FileCheck,
  TrendingUp,
  Kanban,
  Shield,
  Play,
  RotateCcw,
  Image,
  Share2,
  Copy,
  FolderPlus,
  MessageSquare,
  Filter,
  CheckCircle2,
  ExternalLink,
  Sliders,
  Send,
  PanelLeftOpen,
  PanelLeftClose,
  Folder,
  Download,
  Trash2,
  Eye,
  BookMarked,
  BookText,
  Box,
  Award,
  ClipboardList,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LawBook,
  getStoredBooks,
  saveBook,
  deleteBook,
  downloadBookFile,
} from "./booksData";

interface TeacherDashboardProps {
  onSwitchToStudent?: () => void;
  onSignOut?: () => void;
}

export type TeacherNavSection =
  | "home"
  | "library"
  | "notebook"
  | "upload"
  | "lesson_plan"
  | "batches"
  | "calendar"
  | "doubts_hub"
  | "test"
  | "test_creator"
  | "assessment"
  | "new_folder"
  | "bookshelf"
  | "collaboration"
  | "mentorship"
  | "recorded_classes"
  | "smart_board"
  | "projects"
  | "cohort_analytics"
  | "syllabus_notes";

export function TeacherDashboardView({
  onSwitchToStudent,
  onSignOut,
}: TeacherDashboardProps) {
  // Navigation section - default to 'home' Task Management
  const [activeSection, setActiveSection] = useState<TeacherNavSection>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Desktop sidebar expand/collapse state (expanded by default matching student dashboard in reference)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  // Home Sub-Tabs: Calendars Planers, Task List, Kanban board, Lesson Planers, Projects
  const [homeSubTab, setHomeSubTab] = useState<
    "tasks" | "kanban" | "calendars" | "lesson_planers" | "projects"
  >("tasks");

  // Top Bar Filters: Department, Subject v
  const [selectedDepartment, setSelectedDepartment] = useState("Constitutional & Criminal Law");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  // Teacher Profile
  const [teacherProfile, setTeacherProfile] = useState({
    fullName: "Prof. Dr. Rajesh Varma",
    email: "rajesh.varma@law.edu",
    designation: "Senior Faculty & Moot Court Adjudicator",
    department: "Constitutional Law & Entrance Pedagogy",
    institution: "National Law Faculty & Wakheel Academy",
  });
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  // Task Management State
  const [tasksList, setTasksList] = useState([
    {
      id: "task_1",
      title: "Evaluate CLAT 2027 Mock 04: Legal Reasoning Sectional Submissions",
      status: "In Progress",
      type: "Assessment",
      dueDate: "Tomorrow, 6:00 PM",
      priority: "High",
      assignee: "Prof. Dr. Rajesh Varma",
      completed: false,
    },
    {
      id: "task_2",
      title: "Finalize BNS 2023 vs IPC 1860 Transition Module for Super-30 Cohort",
      status: "Active",
      type: "Curriculum",
      dueDate: "Nov 22, 2026",
      priority: "Urgent",
      assignee: "Adv. Sunita Deshmukh",
      completed: false,
    },
    {
      id: "task_3",
      title: "Review Regular Bail Petitions drafted under BNSS Section 480 by Distance LL.B Scholars",
      status: "Active",
      type: "Draft Review",
      dueDate: "Nov 24, 2026",
      priority: "Medium",
      assignee: "Adv. Rohan Mehra",
      completed: false,
    },
    {
      id: "task_4",
      title: "Author 20 Principle-Fact MCQs on Article 21 Privacy Doctrine (Puttaswamy)",
      status: "Completed",
      type: "CBT Authoring",
      dueDate: "Yesterday",
      priority: "High",
      assignee: "Prof. Dr. Rajesh Varma",
      completed: true,
    },
    {
      id: "task_5",
      title: "Host All-India Live Moot Orientation & Problem Briefing",
      status: "Scheduled",
      type: "Live Class",
      dueDate: "Saturday, 10:00 AM",
      priority: "Urgent",
      assignee: "Adv. K. R. Nambiar",
      completed: false,
    },
  ]);

  // Create Task Modal State
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState("Assessment");
  const [newTaskPriority, setNewTaskPriority] = useState<"Urgent" | "High" | "Medium">("High");
  const [newTaskDueDate, setNewTaskDueDate] = useState("Tomorrow, 6:00 PM");

  // Create Tools Modal State (Right Palette: Chat, Chapter, Audio, Video, Mind Map, etc.)
  const [activeCreateToolModal, setActiveCreateToolModal] = useState<string | null>(null);

  // Live Class Launch Modal State
  const [showLiveClassModal, setShowLiveClassModal] = useState(false);
  const [selectedBatchForClass, setSelectedBatchForClass] = useState("CLAT 2027 Super-30 Rankers");
  const [liveClassTopic, setLiveClassTopic] = useState("Legal Reasoning: S.73 Contract Breach & Remote Damages");
  const [liveClassStarted, setLiveClassStarted] = useState(false);

  // 1-on-1 Mentorship Video Room Modal State
  const [activeSessionRoom, setActiveSessionRoom] = useState<any | null>(null);

  // Question Creator State
  const [newQuestionSubject, setNewQuestionSubject] = useState("Constitutional Law");
  const [newPrinciple, setNewPrinciple] = useState(
    "Under Article 21, the right to personal liberty can only be curtailed by procedure established by just, fair, and reasonable law (Maneka Gandhi v. Union of India, 1978). Arbitrary executive detention without periodic judicial review violates fundamental procedural due process."
  );
  const [newFacts, setNewFacts] = useState(
    "A state magistrate orders the 30-day preventive detention of an investigative journalist reporting on public health contract irregularities, refusing bail or access to counsel under emergency administrative orders."
  );
  const [optionA, setOptionA] = useState("The detention is lawful because magistrates have sovereign discretion during emergencies.");
  const [optionB, setOptionB] = useState("The detention is unconstitutional as denial of legal counsel and lack of fair procedure infringes Article 21.");
  const [optionC, setOptionC] = useState("The detention is valid if the journalist is provided state-selected defense counsel after 14 days.");
  const [optionD, setOptionD] = useState("Article 21 does not apply to investigative press reporting.");
  const [correctOption, setCorrectOption] = useState<number>(1);
  const [rationale, setRationale] = useState(
    "Maneka Gandhi v. UOI established that procedure under Art. 21 must be right, just, and fair. Total denial of legal representation and arbitrary detention violates the core of personal liberty."
  );
  const [isAiGeneratingQuestion, setIsAiGeneratingQuestion] = useState(false);
  const [questionSavedSuccess, setQuestionSavedSuccess] = useState(false);

  // Upload Notes Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSubject, setUploadSubject] = useState("Bharatiya Nyaya Sanhita (BNS 2023)");
  const [uploadTitle, setUploadTitle] = useState("BNS 2023 vs IPC 1860 Full Comparative Table & Transition Guide");

  // Assessment / Submissions State
  const [studentSubmissions, setStudentSubmissions] = useState([
    {
      id: "sub_1",
      studentName: "Advithya Sharma",
      exam: "CLAT 2027 Super-30",
      assignment: "Bail Petition Drafting under BNSS Section 480",
      submittedDate: "Today, 11:20 AM",
      status: "Pending Evaluation",
      score: "—",
      file: "Bail_Application_Sec480_Advithya.pdf",
    },
    {
      id: "sub_2",
      studentName: "Priya Nair",
      exam: "KLEE 2027 Batch",
      assignment: "Case Brief: Kesavananda Bharati v. State of Kerala",
      submittedDate: "Yesterday",
      status: "Graded",
      score: "48 / 50",
      file: "Kesavananda_CaseBrief_Priya.pdf",
    },
    {
      id: "sub_3",
      studentName: "Rahul George",
      exam: "Distance LL.B (IGNOU)",
      assignment: "Indemnity vs Guarantee Comparative Problem",
      submittedDate: "2 Days ago",
      status: "Graded",
      score: "44 / 50",
      file: "Contract_Indemnity_Rahul.pdf",
    },
  ]);

  // Doubts Hub State
  const [doubtsList, setDoubtsList] = useState([
    {
      id: "d1",
      studentName: "Advithya Sharma",
      targetExam: "CLAT 2027",
      subject: "Law of Contracts",
      question:
        "Under Section 73 of the Indian Contract Act, if a supplier delivers study material 3 days late and the student misses their scholarship exam, is the lost scholarship considered an indirect remote loss under the Hadley v. Baxendale rule?",
      status: "unanswered",
      timestamp: "2 hours ago",
      replyText: "",
    },
    {
      id: "d2",
      studentName: "Priya Nair",
      targetExam: "KLEE 2027",
      subject: "Criminal Law (BNS)",
      question:
        "Does Section 103 of Bharatiya Nyaya Sanhita modify the 5 exception clauses for culpable homicide not amounting to murder compared to Section 300 IPC?",
      status: "unanswered",
      timestamp: "5 hours ago",
      replyText: "",
    },
    {
      id: "d3",
      studentName: "Rahul George",
      targetExam: "Distance LL.B",
      subject: "Constitutional Law",
      question:
        "Can a distance law graduate from IGNOU or State Open University directly apply for Bar Council of India enrollment without an in-person attendance certificate?",
      status: "answered",
      timestamp: "1 day ago",
      replyText:
        "Under BCI Legal Education Rules, a law degree must involve recognized clinical legal education and minimum court attendance. Distance scholars typically fulfill this via affiliated recognized legal clinics.",
    },
  ]);

  // Load profile from localStorage
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem("wakheel_academy_user") ||
        localStorage.getItem("wakheel_academy_teacher");
      if (stored) {
        const parsed = JSON.parse(stored);
        setTeacherProfile((prev) => ({
          ...prev,
          fullName: parsed.fullName || prev.fullName,
          email: parsed.email || prev.email,
          department: parsed.department || prev.department,
          institution: parsed.institutionName || prev.institution,
        }));
      }
    } catch {}
  }, []);

  // Batches, Tests, Mentorship, Rankers, Syllabi Data
  const teacherBatches = [
    {
      id: "batch_clat_rankers",
      title: "CLAT 2027 Super-30 Rankers Foundation Batch",
      exam: "CLAT 2027 (NLUs)",
      studentsCount: 38,
      maxStudents: 50,
      schedule: "Mon - Fri • 6:30 PM - 8:30 PM",
      status: "Class Today at 6:30 PM",
      statusColor: "amber",
      syllabusCovered: "68% Completed (Unit 4 of 6)",
      nextTopic: "Contract Law: S.73 Breach & Remote Losses",
      badge: "LIVE CLASS TODAY",
      hoursDelivered: "142 / 250 Hours",
    },
    {
      id: "batch_klee_fastrack",
      title: "KLEE 2027 Kerala Law Entrance Weekend Crash Batch",
      exam: "KLEE 2027 (Kerala)",
      studentsCount: 42,
      maxStudents: 50,
      schedule: "Sat & Sun • 10:00 AM - 1:00 PM",
      status: "Next Class Saturday",
      statusColor: "black",
      syllabusCovered: "45% Completed (Unit 3 of 5)",
      nextTopic: "Legal Aptitude: Constitution Fundamental Rights",
      badge: "WEEKEND FAST-TRACK",
      hoursDelivered: "48 / 100 Hours",
    },
    {
      id: "batch_distance_llb",
      title: "Distance LL.B & Open University Semester Mentorship",
      exam: "Distance LL.B (IGNOU)",
      studentsCount: 104,
      maxStudents: 150,
      schedule: "Evening Flexible + Weekly Live Q&A",
      status: "Q&A Session Tomorrow",
      statusColor: "black",
      syllabusCovered: "82% Completed (Term 1 Review)",
      nextTopic: "BNS 2023 Criminal Transition Paper Discussion",
      badge: "OPEN UNIVERSITY",
      hoursDelivered: "80 / 120 Hours",
    },
  ];

  const mentorshipBookings = [
    {
      id: "b_01",
      studentName: "Advithya Sharma",
      targetExam: "CLAT 2027 Aspirant",
      dateSlot: "Today, 6:00 PM - 6:45 PM",
      topic: "Hadley v. Baxendale Rule & CLAT Principle-Fact Breakdown",
      fee: 499,
      status: "Confirmed",
      isLiveSoon: true,
      notes: "Student is scoring 94.8% percentile, struggles with negative marking in logical reasoning.",
    },
    {
      id: "b_02",
      studentName: "Priya Nair",
      targetExam: "KLEE 5-Year LLB",
      dateSlot: "Tomorrow, 5:30 PM - 6:15 PM",
      topic: "Constitutional Writs under Article 32 & 226 difference",
      fee: 499,
      status: "Confirmed",
      isLiveSoon: false,
      notes: "Targeting Govt Law College Ernakulam.",
    },
  ];

  const syllabusTracks = [
    {
      code: "CONST-101",
      title: "Constitutional Law: Writs, Fundamental Rights & Golden Triangle",
      university: "Bar Council Standard & NLU Foundation",
      unitsCount: 14,
      notesUploaded: 5,
      lastUpdated: "14 Nov 2026",
      topics: [
        "Article 14, 19, 21 Golden Triangle Doctrine",
        "Writ Jurisdictions: Habeas Corpus, Mandamus, Quo Warranto",
        "Basic Structure Doctrine: Kesavananda Bharati & Minerva Mills",
      ],
    },
    {
      code: "CRIM-201",
      title: "Bharatiya Nyaya Sanhita (BNS 2023) Criminal Law Transition",
      university: "New Criminal Laws Curricula 2024-2027",
      unitsCount: 18,
      notesUploaded: 6,
      lastUpdated: "10 Nov 2026",
      topics: [
        "Transition from IPC 1860 to BNS 2023 Sectional Concordance",
        "Section 103 (Murder) vs Section 105 (Culpable Homicide)",
        "Community Service provisions and petty offense reforms",
      ],
    },
  ];

  // AI Question Generator Handler
  const handleGenerateAiQuestion = () => {
    setIsAiGeneratingQuestion(true);
    setTimeout(() => {
      setIsAiGeneratingQuestion(false);
      setNewPrinciple(
        "Under Section 73 of the Indian Contract Act, when a contract has been broken, the party who suffers by such breach is entitled to receive compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach (Hadley v. Baxendale)."
      );
      setNewFacts(
        "A legal courier service delays delivery of candidate admission forms to an NLU by 48 hours due to vehicle breakdown. The NLU refused late submissions, causing the candidate to lose an academic year. The courier was not informed of the strict deadline."
      );
      setOptionA("The candidate can recover the value of the lost academic year because delay is an intentional breach.");
      setOptionB("The candidate cannot claim compensation as this was an exceptional remote loss not communicated to the carrier.");
      setCorrectOption(1);
      setRationale("In Hadley v. Baxendale, remote or indirect damages cannot be claimed unless the special circumstances leading to exceptional damages were made known to the breaching party.");
    }, 600);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionSavedSuccess(true);
    setTimeout(() => {
      setQuestionSavedSuccess(false);
    }, 2000);
  };

  const handleReplyDoubt = (doubtId: string, reply: string) => {
    if (!reply.trim()) return;
    setDoubtsList((prev) =>
      prev.map((d) =>
        d.id === doubtId
          ? { ...d, status: "answered", replyText: reply.trim() }
          : d
      )
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      status: "Active",
      type: newTaskType,
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
      assignee: teacherProfile.fullName,
      completed: false,
    };
    setTasksList([newTask, ...tasksList]);
    setNewTaskTitle("");
    setShowCreateTaskModal(false);
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasksList((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, completed: !t.completed, status: !t.completed ? "Completed" : "In Progress" }
          : t
      )
    );
  };

  // ==============================================================
  // FACULTY BOOK PUBLISHING & UPLOAD STATE (OPTION 3)
  // ==============================================================
  const [booksList, setBooksList] = useState<LawBook[]>([]);
  const [showUploadBookModal, setShowUploadBookModal] = useState(false);
  const [bookUploadSuccess, setBookUploadSuccess] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookAuthor, setNewBookAuthor] = useState("Prof. Dr. Rajesh Varma");
  const [newBookDept, setNewBookDept] = useState("Constitutional Law");
  const [newBookEdition, setNewBookEdition] = useState("2026 Academic Edition");
  const [newBookDesc, setNewBookDesc] = useState("");
  const [newBookChapterTitle, setNewBookChapterTitle] = useState("");
  const [newBookChapterContent, setNewBookChapterContent] = useState("");
  const [selectedBookForPreview, setSelectedBookForPreview] = useState<LawBook | null>(null);

  useEffect(() => {
    setBooksList(getStoredBooks());
  }, []);

  const handlePublishBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;

    const createdBook: LawBook = {
      id: `book_faculty_${Date.now()}`,
      title: newBookTitle.trim(),
      author: newBookAuthor.trim() || teacherProfile.fullName,
      department: newBookDept,
      edition: newBookEdition.trim() || "2026 Academic Edition",
      fileSize: "15.4 MB",
      totalPages: 180,
      format: "PDF",
      coverGradient: "from-amber-600 via-amber-700 to-zinc-950",
      description:
        newBookDesc.trim() ||
        "Faculty authored law manual with comprehensive statutory breakdown, landmark judicial ratios, and model exam problems.",
      uploadedBy: `${newBookAuthor.trim()} (Faculty)`,
      uploadedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      downloadCount: 0,
      chapters: [
        {
          id: `ch_1_${Date.now()}`,
          chapterNumber: 1,
          title: newBookChapterTitle.trim() || "Foundational Doctrines & Statutory Overview",
          pageNumber: 1,
          content:
            newBookChapterContent.trim() ||
            "This volume synthesizes landmark appellate rulings and statutory provisions curated for law scholars and competitive judicial aspirants. Students may reference these principles for appellate briefs and moot court memorials.",
        },
      ],
    };

    const updated = saveBook(createdBook);
    setBooksList(updated);
    setBookUploadSuccess(true);
    setTimeout(() => {
      setBookUploadSuccess(false);
      setShowUploadBookModal(false);
      setNewBookTitle("");
      setNewBookDesc("");
      setNewBookChapterTitle("");
      setNewBookChapterContent("");
    }, 1200);
  };

  const handleDeleteBook = (bookId: string) => {
    const updated = deleteBook(bookId);
    setBooksList(updated);
    if (selectedBookForPreview?.id === bookId) {
      setSelectedBookForPreview(null);
    }
  };

  // Faculty 17-item sidebar navigation list
  const facultySidebarItems: Array<{ id: TeacherNavSection; label: string; icon: any; badge?: string }> = [
    { id: "home", label: "Home", icon: Home },
    { id: "lesson_plan", label: "Learn", icon: BookOpen },
    { id: "library", label: "Library", icon: Library },
    { id: "notebook", label: "Notebook", icon: BookText },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "recorded_classes", label: "Record", icon: Mic },
    { id: "batches", label: "Live Classes", icon: Video, badge: "Live" },
    { id: "mentorship", label: "Tuition Mode", icon: UserCheck },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "assessment", label: "Exam Cracker", icon: Award },
    { id: "test", label: "Homework", icon: ClipboardList },
    { id: "test_creator", label: "Tests", icon: CheckSquare },
    { id: "new_folder", label: "My Courses", icon: Layers },
    { id: "bookshelf", label: "Book shelf", icon: BookMarked },
    { id: "projects", label: "Projects", icon: TrendingUp },
    { id: "smart_board", label: "3D Lab", icon: Box },
    { id: "doubts_hub", label: "Bookmarks", icon: Bookmark },
  ];

  // Right Studio >> Create Tools List (12 tool buttons)
  const facultyCreateTools = [
    { id: "chat", label: "Chat", icon: MessageSquare, description: "AI Faculty Co-Counsel" },
    { id: "chapter", label: "Chapter", icon: BookOpen, description: "AI Lesson & Module Builder" },
    { id: "audio", label: "Audio", icon: Mic, description: "Podcast & Voice Brief Recorder" },
    { id: "video", label: "Video", icon: Video, description: "Interactive Moot Video Studio" },
    { id: "mind_map", label: "Mind Map", icon: Brain, description: "Doctrine & Precedent Tree Builder" },
    { id: "summary", label: "Summary", icon: AlignLeft, description: "Ratio Decidendi Judgment Summarizer" },
    { id: "quiz", label: "Quiz", icon: CheckSquare, description: "AI Question & MCQ Generator" },
    { id: "flash_card", label: "Flash Card", icon: Layers, description: "Statutory Concordance Card Maker" },
    { id: "timeline", label: "Time Line", icon: Clock, description: "Landmark Cases Chronology Builder" },
    { id: "analyse", label: "Analyse", icon: BarChart3, description: "Cohort Performance & Rank Analytics" },
    { id: "notes", label: "Notes", icon: PenTool, description: "Faculty Bench Research Notes" },
    { id: "bookmark", label: "Book Mark", icon: Bookmark, description: "Starred Precedents & Drafts" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/70 dark:bg-black text-black dark:text-white flex font-sans transition-colors duration-200">
      {/* ============================================================== */}
      {/* 1. LEFT SIDEBAR (DESKTOP) - WAKHEEL BLACK, WHITE & YELLOW      */}
      {/* ============================================================== */}
      <aside
        className={`hidden md:flex shrink-0 ${
          isSidebarExpanded ? "w-60" : "w-16"
        } bg-black text-white flex-col justify-between sticky top-0 h-screen z-30 select-none transition-all duration-300 border-r border-zinc-900 shadow-md`}
      >
        {isSidebarExpanded ? (
          <div className="flex flex-col h-full min-h-0 w-full">
            {/* Header: White/Zinc rounded card with WAKHEEL Logo + Collapse Button */}
            <div className="p-3 shrink-0 flex items-center justify-between gap-1">
              <Link
                href="/teacher/home"
                className="flex-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-2xl p-3 flex items-center gap-2.5 shadow-sm transition-all group min-w-0"
                title="Wakheel Faculty Studio"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black shrink-0 shadow-xs">
                  <GraduationCap className="w-5 h-5 text-black" />
                </div>
                <div className="min-w-0 truncate">
                  <div className="text-sm font-black tracking-tight text-white leading-none truncate">
                    WAKHEEL <span className="text-amber-500 font-extrabold">FACULTY</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-medium mt-0.5 truncate">
                    Faculty Studio
                  </div>
                </div>
              </Link>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer shrink-0"
                title="Collapse to Icon Rail"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Items: Styled in Wakheel Black, White & Yellow */}
            <div className="flex-1 overflow-y-auto scrollbar-none px-3 py-1 space-y-1 min-h-0">
              {facultySidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer group ${
                      isActive
                        ? "bg-amber-500 text-black font-extrabold shadow-sm"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-black" : "text-zinc-400 group-hover:text-amber-400 transition-colors"
                        }`}
                      />
                      <span className="text-xs truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isActive
                            ? "bg-black/15 text-black"
                            : "bg-zinc-800 text-amber-400"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions: Student Hub Switcher, ThemeToggle & SignOut */}
            <div className="p-3 border-t border-zinc-900 flex flex-col gap-2 shrink-0 bg-black">
              {onSwitchToStudent ? (
                <button
                  onClick={onSwitchToStudent}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-black" />
                  <span>Student Hub</span>
                </button>
              ) : (
                <Link
                  href="/student/home"
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-black" />
                  <span>Student Hub</span>
                </Link>
              )}
              <div className="flex items-center justify-between pt-1 text-zinc-400">
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <span className="text-[11px] font-medium">Theme</span>
                </div>
                {onSignOut ? (
                  <button
                    onClick={onSignOut}
                    className="px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Exit</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {}}
                    className="px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                    title="Log out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* COMPACT ICON RAIL (when collapsed, in Black & Yellow) */
          <div className="flex flex-col h-full items-center justify-between py-3 min-h-0 w-full overflow-visible">
            {/* Top Logo + Expand Button */}
            <div className="flex flex-col items-center gap-2.5 w-full shrink-0 pb-2 border-b border-zinc-900">
              <Link
                href="/teacher/home"
                className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black shadow-md cursor-pointer hover:scale-105 transition-transform"
                title="Wakheel Faculty Studio"
              >
                <GraduationCap className="w-5 h-5 text-black" />
              </Link>
              <button
                onClick={toggleSidebar}
                className="w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
                title="Expand Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Icons */}
            <div className="flex-1 w-full py-1 flex flex-col items-center gap-1 min-h-0 overflow-y-auto scrollbar-none overflow-x-visible">
              {facultySidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <div key={item.id} className="relative group flex items-center justify-center w-full">
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? "bg-amber-500 text-black shadow-md font-bold scale-105"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-900"
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
                      className="absolute px-3 py-1.5 bg-zinc-950 border border-zinc-800 text-white text-xs font-bold rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-[100] flex items-center gap-1.5"
                    >
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-950 border-l border-b border-zinc-800 rotate-45" />
                      <span className="relative z-10">{item.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Stack in Rail */}
            <div className="flex flex-col items-center gap-2 pt-2 border-t border-zinc-900 w-full px-2 shrink-0">
              {onSwitchToStudent ? (
                <button
                  onClick={onSwitchToStudent}
                  className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center cursor-pointer shadow-xs hover:scale-105 transition-transform"
                  title="Switch to Student Hub"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href="/student/home"
                  className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center cursor-pointer shadow-xs hover:scale-105 transition-transform"
                  title="Switch to Student Hub"
                >
                  <BookOpen className="w-4 h-4" />
                </Link>
              )}
              <ThemeToggle />
            </div>
          </div>
        )}
      </aside>

      {/* ============================================================== */}
      {/* MOBILE DRAWER SIDEBAR - WAKHEEL BLACK & YELLOW                 */}
      {/* ============================================================== */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="relative z-10 w-72 bg-black text-white flex flex-col justify-between h-full p-4 space-y-4 shadow-2xl border-r border-zinc-800">
            <div className="space-y-4 flex-1 overflow-y-auto scrollbar-none">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black">
                    <GraduationCap className="w-5 h-5 text-black" />
                  </div>
                  <span className="font-black text-sm text-white">
                    WAKHEEL <span className="text-amber-500">FACULTY</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {facultySidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? "bg-amber-500 text-black font-extrabold shadow-xs"
                          : "text-zinc-300 hover:bg-zinc-900 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span className="text-xs">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/20 text-black">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-zinc-800 shrink-0">
              {onSwitchToStudent ? (
                <button
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    onSwitchToStudent();
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold cursor-pointer"
                >
                  Switch to Student Hub
                </button>
              ) : (
                <Link
                  href="/student/home"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center justify-center cursor-pointer"
                >
                  Switch to Student Hub
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MAIN DESKTOP BODY: TOP HEADER + CENTER CONTENT + RIGHT PANE */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-50/70 dark:bg-black text-black dark:text-white min-h-screen">
        {/* Top Header Strip with Filters (Wakheel White & Amber System) */}
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 h-16 flex items-center justify-between px-4 sm:px-6 gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Department Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                className="px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-zinc-200/80 dark:border-zinc-800 shadow-2xs transition-colors"
              >
                <span>Department: {selectedDepartment.split(" ")[0]}...</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {showDepartmentDropdown && (
                <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl p-2 border border-zinc-200/80 dark:border-zinc-800 shadow-xl z-50 space-y-1">
                  {["Constitutional & Criminal Law", "Civil & Commercial Jurisprudence", "Legal Reasoning & Mocks"].map((dept) => (
                    <button
                      key={dept}
                      onClick={() => {
                        setSelectedDepartment(dept);
                        setShowDepartmentDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subject Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                className="px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-zinc-200/80 dark:border-zinc-800 shadow-2xs transition-colors"
              >
                <span>Subject: {selectedSubject}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {showSubjectDropdown && (
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl p-2 border border-zinc-200/80 dark:border-zinc-800 shadow-xl z-50 space-y-1">
                  {["All Subjects", "BNS 2023", "Constitutional Law", "Contracts & Torts"].map((subj) => (
                    <button
                      key={subj}
                      onClick={() => {
                        setSelectedSubject(subj);
                        setShowSubjectDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Actions: Globe, Search, Trophy, Avatar */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer" title="Language">
              <Globe className="w-4 h-4 text-amber-500" />
            </button>

            <div className="relative w-44 sm:w-60">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, rosters, statutes..."
                className="w-full pl-8 pr-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
              />
            </div>

            <button className="p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer" title="Rankings">
              <Trophy className="w-4 h-4 text-amber-500" />
            </button>

            <button
              onClick={() => {
                setShowLiveClassModal(true);
                setLiveClassStarted(false);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-xs cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Go Live</span>
            </button>

            <ThemeToggle />

            <button
              onClick={() => setShowProfileDrawer(true)}
              className="w-8 h-8 rounded-full bg-amber-500 text-black font-black text-xs flex items-center justify-center uppercase cursor-pointer shadow-xs transition-colors hover:scale-105"
              title="Faculty Profile"
            >
              {teacherProfile.fullName.charAt(0)}
            </button>
          </div>
        </header>

        {/* ============================================================== */}
        {/* 3. CENTER + RIGHT 2-PANE HORIZONTAL DESKTOP CONTAINER          */}
        {/* ============================================================== */}
        {activeSection === "home" ? (
          <div className="flex-1 flex flex-row min-w-0 overflow-hidden">
            {/* CENTER PANE: TABS + ACTIVE TASK TABLE */}
            <div className="flex-1 min-w-0 p-5 overflow-y-auto space-y-5">
              {/* Top Sub-Tabs Bar: Calendars Planers, Task List, Kanban board, Lesson Planers, Projects */}
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                  {[
                    { id: "calendars", label: "Calendars Planers" },
                    { id: "tasks", label: "Task List" },
                    { id: "kanban", label: "Kanban board" },
                    { id: "lesson_planers", label: "Lesson Planers" },
                    { id: "projects", label: "Projects" },
                  ].map((tab) => {
                    const isActive = homeSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setHomeSubTab(tab.id as any)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          isActive
                            ? "bg-amber-500 text-black font-extrabold shadow-xs scale-102"
                            : "bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Circular [+] Create task button on right */}
                <button
                  onClick={() => setShowCreateTaskModal(true)}
                  className="w-9 h-9 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black flex items-center justify-center font-black shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                  title="Create New Task"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* VIEW: TASK LIST (Active in Wakheel screenshot) */}
              {homeSubTab === "tasks" && (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/70 dark:border-zinc-800 overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-950/70 border-b border-zinc-200/70 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-4 flex items-center gap-1.5">
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Task.active</span>
                          </th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Due date</th>
                          <th className="py-3 px-4">Priority</th>
                          <th className="py-3 px-4">Assignee</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                        {tasksList.map((task) => (
                          <tr
                            key={task.id}
                            className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                              task.completed ? "opacity-60 bg-zinc-50/50 dark:bg-zinc-950/40" : ""
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => toggleTaskCompletion(task.id)}
                                  className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                                />
                                <span className={`font-semibold text-zinc-900 dark:text-zinc-100 ${task.completed ? "line-through text-zinc-400 dark:text-zinc-500" : ""}`}>
                                  {task.title}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                task.status === "Completed"
                                  ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300"
                                  : task.status === "In Progress"
                                  ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                              }`}>
                                {task.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-zinc-700 dark:text-zinc-300">
                              {task.type}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                              {task.dueDate}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                task.priority === "Urgent"
                                  ? "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300"
                                  : task.priority === "High"
                                  ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                              }`}>
                                {task.priority}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black">
                                  {task.assignee.charAt(0)}
                                </div>
                                <span className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[130px]">
                                  {task.assignee}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {/* + Create task inline row */}
                        <tr>
                          <td colSpan={6} className="py-3.5 px-4">
                            <button
                              onClick={() => setShowCreateTaskModal(true)}
                              className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Create task</span>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW: KANBAN BOARD */}
              {homeSubTab === "kanban" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { col: "Backlog", tasks: tasksList.filter((t) => t.status === "Active") },
                    { col: "In Progress", tasks: tasksList.filter((t) => t.status === "In Progress") },
                    { col: "In Review", tasks: tasksList.filter((t) => t.status === "Scheduled") },
                    { col: "Completed", tasks: tasksList.filter((t) => t.status === "Completed") },
                  ].map((column) => (
                    <div key={column.col} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/70 dark:border-zinc-800 p-4 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{column.col}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold">
                          {column.tasks.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {column.tasks.map((task) => (
                          <div key={task.id} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/60 space-y-2">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              {task.type}
                            </span>
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-snug">{task.title}</h4>
                            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                              <span>Due: {task.dueDate}</span>
                              <span className="font-bold text-rose-500">{task.priority}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* VIEW: CALENDARS PLANERS */}
              {homeSubTab === "calendars" && (
                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Weekly Chambers &amp; Moot Timetable</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {teacherBatches.map((b) => (
                      <div key={b.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/60 space-y-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300">
                          {b.schedule}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{b.title}</h4>
                        <p className="text-[11px] text-zinc-500">{b.nextTopic}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW: LESSON PLANERS */}
              {homeSubTab === "lesson_planers" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {syllabusTracks.map((tr) => (
                    <div key={tr.code} className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 space-y-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                      <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">{tr.code} • {tr.unitsCount} Units</span>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{tr.title}</h4>
                      <p className="text-xs text-zinc-500">{tr.topics.join(" • ")}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* VIEW: PROJECTS */}
              {homeSubTab === "projects" && (
                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Active Faculty Legal Projects</h4>
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/60">
                    <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">MOOT COURT MEMO</span>
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-white mt-1">All-India Cyber Defamation Moot Problem 2027</h5>
                    <p className="text-[11px] text-zinc-500">Drafted on Article 19(1)(a) restrictions and AI intermediary liability.</p>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR PANE: >> CREATE (WAKHEEL BLACK, WHITE & YELLOW PALETTE) */}
            <div className="w-64 xl:w-72 shrink-0 bg-white/70 dark:bg-zinc-950/80 border-l border-zinc-200/70 dark:border-zinc-800 p-4 flex flex-col justify-between space-y-4 overflow-y-auto">
              <div className="space-y-3">
                {/* Header: >> Create */}
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-amber-500 font-black text-sm font-mono">&gt;&gt;</span>
                  <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Create</h2>
                </div>

                {/* 2-Column Grid of 12 Interactive Tools */}
                <div className="bg-zinc-100/80 dark:bg-zinc-900/60 rounded-2xl p-2.5 border border-zinc-200/60 dark:border-zinc-800/80">
                  <div className="grid grid-cols-2 gap-2">
                    {facultyCreateTools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => {
                            if (tool.id === "chapter" || tool.id === "notes") {
                              setShowUploadBookModal(true);
                            } else if (tool.id === "quiz") {
                              setActiveSection("test_creator");
                            } else {
                              setActiveCreateToolModal(tool.id);
                            }
                          }}
                          className="bg-white dark:bg-zinc-800 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-zinc-700 rounded-xl p-2.5 flex flex-col items-center justify-center text-center gap-1 shadow-2xs hover:shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer group border border-zinc-200/60 dark:border-zinc-700/40"
                        >
                          <Icon className="w-4 h-4 text-zinc-700 dark:text-zinc-300 group-hover:text-amber-500 transition-colors" />
                          <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200 truncate w-full">
                            {tool.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4 Action Cards: Smart Bord /Projects, Combine Study, Slide, Info Graphics */}
                <div className="space-y-2">
                  {[
                    { id: "smartboard", label: "Smart Bord /Projects", icon: Presentation },
                    { id: "combine_study", label: "Combine Study", icon: Users },
                    { id: "slide", label: "Slide", icon: Layers },
                    { id: "infographics", label: "Info Graphics", icon: BarChart3 },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.id}
                        onClick={() => setActiveCreateToolModal(card.id)}
                        className="bg-white dark:bg-zinc-900 rounded-2xl p-3 border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between cursor-pointer hover:shadow-xs hover:border-amber-400 transition-all group shadow-2xs"
                      >
                        <div className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-500 transition-colors">
                          {card.label}
                        </div>
                        <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Wakheel AI Assistant Pill */}
              <button
                onClick={() => setActiveCreateToolModal("chat")}
                className="w-full bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-full flex items-center justify-between shadow-md cursor-pointer hover:scale-102 transition-all border border-zinc-800 dark:border-zinc-200"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-black">Wakheel AI</span>
                </div>
                <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-black">
                  CO-COUNSEL
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* OTHER SECTIONS: BATCHES, TEST CREATOR, ASSESSMENTS, ETC.       */
          /* ============================================================== */
          <main className="flex-1 w-full p-6 space-y-6 overflow-y-auto">
            {/* SECTION: LIVE CLASSES & BATCHES */}
            {activeSection === "batches" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Assigned Classroom Batches</h2>
                    <p className="text-xs text-zinc-500">Live lecture schedules and roster management for law aspirants.</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowLiveClassModal(true);
                      setLiveClassStarted(false);
                    }}
                    className="px-4 py-2 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>Launch Live Class Now</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {teacherBatches.map((batch) => (
                    <div key={batch.id} className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400">
                          {batch.badge}
                        </span>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{batch.title}</h3>
                        <p className="text-xs text-zinc-500">{batch.schedule}</p>
                        <div className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                          {batch.studentsCount} / {batch.maxStudents} Enrolled
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedBatchForClass(batch.title);
                          setShowLiveClassModal(true);
                        }}
                        className="w-full py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer shadow-xs"
                      >
                        Enter Classroom Studio
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION: EXAM & CBT CREATOR */}
            {activeSection === "test_creator" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white">CBT Exam &amp; Mock Authoring Studio</h2>
                    <p className="text-xs text-zinc-500">Author principle-fact passage questions with instant negative marking (-0.25) setup.</p>
                  </div>
                  <button
                    onClick={handleGenerateAiQuestion}
                    disabled={isAiGeneratingQuestion}
                    className="px-4 py-2 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAiGeneratingQuestion ? "Generating..." : "AI Question Generator"}</span>
                  </button>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3 shadow-xs">
                  <form onSubmit={handleSaveQuestion} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Subject Curriculum</label>
                      <select
                        value={newQuestionSubject}
                        onChange={(e) => setNewQuestionSubject(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs font-semibold"
                      >
                        <option>Constitutional Law</option>
                        <option>Criminal Law (BNS)</option>
                        <option>Law of Contracts &amp; Torts</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Statutory Principle</label>
                      <textarea
                        value={newPrinciple}
                        onChange={(e) => setNewPrinciple(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Factual Scenario</label>
                      <textarea
                        value={newFacts}
                        onChange={(e) => setNewFacts(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-zinc-500">Option A</label>
                        <input
                          type="text"
                          value={optionA}
                          onChange={(e) => setOptionA(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-500">Option B (Correct)</label>
                        <input
                          type="text"
                          value={optionB}
                          onChange={(e) => setOptionB(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-emerald-500 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-xs cursor-pointer"
                      >
                        {questionSavedSuccess ? "Question Published!" : "Publish to Question Bank"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* SECTION: ASSESSMENTS */}
            {activeSection === "assessment" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Student Case Briefs &amp; Submissions</h3>
                <div className="space-y-2">
                  {studentSubmissions.map((sub) => (
                    <div key={sub.id} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between shadow-xs">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{sub.assignment}</h4>
                        <p className="text-[11px] text-zinc-500">Student: {sub.studentName} • Status: {sub.status}</p>
                      </div>
                      <button className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black text-xs font-extrabold transition-all cursor-pointer">Grade</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION: 1-ON-1 TUITION */}
            {activeSection === "mentorship" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">1-on-1 Advocate Mentorship Appointments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mentorshipBookings.map((b) => (
                    <div key={b.id} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold">{b.studentName}</span>
                        <span className="font-mono text-emerald-600 font-bold">{b.status}</span>
                      </div>
                      <p className="text-xs text-zinc-500">{b.topic}</p>
                      <button className="w-full py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black text-xs font-extrabold transition-all cursor-pointer">Open Chamber Link</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION: DOUBTS HUB */}
            {activeSection === "doubts_hub" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Student Doubts (Ask)</h3>
                <div className="space-y-3">
                  {doubtsList.map((d) => (
                    <div key={d.id} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>{d.studentName} • {d.subject}</span>
                        <span>{d.timestamp}</span>
                      </div>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{d.question}</p>
                      {d.status === "answered" ? (
                        <p className="text-xs text-emerald-600">Answer: {d.replyText}</p>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type answer..."
                            className="flex-1 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs border border-zinc-200/80 dark:border-zinc-700"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleReplyDoubt(d.id, (e.target as HTMLInputElement).value);
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousSibling as HTMLInputElement;
                              handleReplyDoubt(d.id, input.value);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black text-xs font-extrabold cursor-pointer transition-all"
                          >
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION: FACULTY BOOK SHELF & PUBLISHING STUDIO (OPTION 3) */}
            {(activeSection === "bookshelf" || activeSection === "upload" || activeSection === "library") && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold uppercase">
                        Courseware Repository
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">•</span>
                      <span className="text-xs text-zinc-500 font-mono">Centralized Student Sync</span>
                    </div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                      Faculty Book Shelf &amp; Courseware Publishing Studio
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Upload and publish textbooks, Bare Act digests, and statutory notes. Books published here immediately sync to students&apos; digital bookshelves for in-app reading and local downloading.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowUploadBookModal(true)}
                    className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center gap-2 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload New Book / Manuscript</span>
                  </button>
                </div>

                {/* 3 Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Total Published Books</span>
                    <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
                      {booksList.length} <span className="text-xs font-normal text-zinc-500">Volumes</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">Accessible across all student cohorts</p>
                  </div>

                  <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Total Student Downloads</span>
                    <div className="text-2xl font-black text-emerald-500 font-mono flex items-center gap-1.5">
                      <Download className="w-5 h-5 text-emerald-500" />
                      <span>{booksList.reduce((acc, b) => acc + b.downloadCount, 0)}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">Offline study copies retrieved</p>
                  </div>

                  <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Active Legal Disciplines</span>
                    <div className="text-2xl font-black text-amber-500 font-mono">
                      4 Curricula
                    </div>
                    <p className="text-[11px] text-zinc-500">BNS, Constitutional, Contracts, CPC</p>
                  </div>
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {booksList.map((book) => (
                    <div
                      key={book.id}
                      className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-5 space-y-4 flex flex-col justify-between shadow-xs hover:border-amber-400 transition-all group"
                    >
                      <div className="space-y-3">
                        {/* Book Spine Cover Card */}
                        <div
                          className={`h-40 rounded-2xl bg-gradient-to-br ${book.coverGradient} p-4 text-white flex flex-col justify-between shadow-md relative overflow-hidden`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-[10px] font-mono font-bold uppercase">
                              {book.department}
                            </span>
                            <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full">
                              {book.format} • {book.fileSize}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-black line-clamp-2 leading-snug">{book.title}</h4>
                            <div className="text-[10px] text-white/80 font-mono mt-1">
                              By {book.author}
                            </div>
                          </div>
                        </div>

                        {/* Metadata Details */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-zinc-900 dark:text-white truncate">{book.title}</span>
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                            {book.description}
                          </p>
                          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                            <span>{book.totalPages} Pages • {book.chapters.length} Chapters</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              <span>{book.downloadCount} dl</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedBookForPreview(book)}
                            className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview Book</span>
                          </button>
                          <button
                            onClick={() => downloadBookFile(book)}
                            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="Download local manuscript"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-400 text-xs transition-all cursor-pointer"
                            title="Unpublish manuscript"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        )}
      </div>

      {/* UPLOAD BOOK / MANUSCRIPT MODAL (OPTION 3) */}
      {showUploadBookModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowUploadBookModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase">
                Faculty Publishing Studio
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Upload &amp; Publish Law Textbook / Bare Act
              </h3>
              <p className="text-xs text-zinc-500">
                Published works are instantaneously synchronized to students&apos; digital bookshelves across all portals.
              </p>
            </div>

            <form onSubmit={handlePublishBook} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Book / Manuscript Title *
                </label>
                <input
                  type="text"
                  required
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="e.g. Constitutional Law of India: Fundamental Rights Digest"
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Author / Faculty Name
                  </label>
                  <input
                    type="text"
                    value={newBookAuthor}
                    onChange={(e) => setNewBookAuthor(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Academic Department
                  </label>
                  <select
                    value={newBookDept}
                    onChange={(e) => setNewBookDept(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                  >
                    <option>Constitutional Law</option>
                    <option>Criminal Law (BNS)</option>
                    <option>Law of Contracts &amp; Torts</option>
                    <option>Civil Procedure &amp; Pleadings</option>
                    <option>CLAT &amp; Entrance Pedagogy</option>
                    <option>Judicial Services Reference</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Description &amp; Syllabus Coverage
                </label>
                <textarea
                  rows={2}
                  value={newBookDesc}
                  onChange={(e) => setNewBookDesc(e.target.value)}
                  placeholder="Summary of syllabus relevance, landmark case coverage, and recommended study cohorts..."
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase block">
                  Chapter 1 Reader Transcript (For In-App Student Reading)
                </span>
                <div>
                  <input
                    type="text"
                    value={newBookChapterTitle}
                    onChange={(e) => setNewBookChapterTitle(e.target.value)}
                    placeholder="Chapter 1 Title: e.g. The Doctrine of Severability &amp; Article 13"
                    className="w-full p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                  />
                </div>
                <div>
                  <textarea
                    rows={4}
                    value={newBookChapterContent}
                    onChange={(e) => setNewBookChapterContent(e.target.value)}
                    placeholder="Provide chapter excerpts, statutory commentary, and landmark ratios that students can read directly in their online reader..."
                    className="w-full p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Drag & Drop simulated file upload */}
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-500 rounded-2xl p-4 text-center space-y-1 transition-colors cursor-pointer bg-zinc-50/50 dark:bg-zinc-950/50">
                <Upload className="w-6 h-6 mx-auto text-amber-500" />
                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Click to select manuscript file (PDF, EPUB, TXT)
                </div>
                <p className="text-[10px] text-zinc-400 font-mono">Maximum file size: 50 MB • Full text indexing supported</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadBookModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {bookUploadSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Published to Student Bookshelf!</span>
                    </>
                  ) : (
                    <span>Publish &amp; Sync to Students</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOK PREVIEW MODAL FOR TEACHER */}
      {selectedBookForPreview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBookForPreview(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-black uppercase">
                Faculty Reading Inspector
              </span>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                {selectedBookForPreview.title}
              </h3>
              <p className="text-xs text-zinc-500">
                Author: {selectedBookForPreview.author} • {selectedBookForPreview.edition} • {selectedBookForPreview.totalPages} Pages
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Description:</div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {selectedBookForPreview.description}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase text-zinc-400">Chapters &amp; Content Transcripts:</h4>
              <div className="space-y-2">
                {selectedBookForPreview.chapters.map((ch) => (
                  <div key={ch.id} className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                    <div className="font-bold text-black dark:text-white flex items-center justify-between">
                      <span>Chapter {ch.chapterNumber}: {ch.title}</span>
                      <span className="text-zinc-400 font-mono text-[10px]">Page {ch.pageNumber}</span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-line leading-relaxed font-serif">
                      {ch.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => downloadBookFile(selectedBookForPreview)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample (.txt)</span>
              </button>
              <button
                onClick={() => setSelectedBookForPreview(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Create Faculty Task</h3>
              <button onClick={() => setShowCreateTaskModal(false)} className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-zinc-500 block mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Grade Kesavananda Case Briefs"
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">Type</label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value)}
                    className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs font-semibold"
                  >
                    <option>Assessment</option>
                    <option>Curriculum</option>
                    <option>Live Class</option>
                    <option>CBT Authoring</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs font-semibold"
                  >
                    <option>Urgent</option>
                    <option>High</option>
                    <option>Medium</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-500 block mb-1">Due Date</label>
                <input
                  type="text"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  placeholder="Tomorrow, 6:00 PM"
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs cursor-pointer transition-all shadow-xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE STUDIO TOOL MODAL */}
      {activeCreateToolModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white capitalize">
                {activeCreateToolModal.replace("_", " ")} Studio Workspace
              </h3>
              <button onClick={() => setActiveCreateToolModal(null)} className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Active tool workspace loaded for <strong>{selectedDepartment}</strong>.
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveCreateToolModal(null)}
                className="px-4 py-2 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black text-xs font-extrabold cursor-pointer transition-all shadow-xs"
              >
                Close Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE CLASS MODAL */}
      {showLiveClassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Broadcast Live Courtroom Lecture</h3>
              </div>
              <button onClick={() => setShowLiveClassModal(false)} className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-zinc-500 block mb-1">Target Batch</label>
                <select
                  value={selectedBatchForClass}
                  onChange={(e) => setSelectedBatchForClass(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs border border-zinc-200/80 dark:border-zinc-700 font-semibold"
                >
                  {teacherBatches.map((b) => (
                    <option key={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-500 block mb-1">Lecture Topic</label>
                <input
                  type="text"
                  value={liveClassTopic}
                  onChange={(e) => setLiveClassTopic(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs border border-zinc-200/80 dark:border-zinc-700"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowLiveClassModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setLiveClassStarted(true);
                    setTimeout(() => setShowLiveClassModal(false), 800);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs cursor-pointer shadow-xs transition-all"
                >
                  {liveClassStarted ? "Broadcasting..." : "Start Broadcast Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* FACULTY PROFILE DRAWER */}
      {showProfileDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowProfileDrawer(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-black font-black text-xl flex items-center justify-center mx-auto shadow-md">
                {teacherProfile.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  {teacherProfile.fullName}
                </h3>
                <p className="text-xs text-zinc-500 font-mono">{teacherProfile.email}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Designation:</span>
                <span className="font-bold text-black dark:text-white text-right">{teacherProfile.designation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Department:</span>
                <span className="font-bold text-black dark:text-white text-right">{teacherProfile.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Institution:</span>
                <span className="font-bold text-black dark:text-white text-right">{teacherProfile.institution}</span>
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
                Sign Out of Faculty Studio
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
