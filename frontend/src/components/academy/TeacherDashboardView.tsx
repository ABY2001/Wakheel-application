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
  Pause,
  Square,
  Volume2,
  VolumeX,
  Headphones,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LawBook,
  getStoredBooks,
  syncBooksWithServer,
  saveBook,
  deleteBook,
  downloadBookFile,
} from "./booksData";
import {
  HomeworkAssignment,
  HomeworkSubmission,
  getStoredAssignments,
  syncAssignmentsWithServer,
  syncSubmissionsWithServer,
  saveAssignment,
  deleteAssignment,
  getStoredSubmissions,
  gradeSubmission,
  downloadSubmissionFile,
} from "./homeworkData";
import {
  LectureAudio,
  RecordingTemplate,
  RECORDING_TEMPLATES,
  getStoredLectures,
  syncLecturesWithServer,
  saveLecture,
  deleteLecture,
  downloadLectureAudio,
  generateSyntheticWavDataUri,
} from "./lectureAudioData";
import { useAcademyWebSocket } from "@/hooks/useAcademyWebSocket";
import { AcademyLiveToast } from "./AcademyLiveToast";
import { AcademyLiveChamberModal } from "./AcademyLiveChamberModal";
import { FacultySmartBoard, LessonPlanItem } from "./FacultySmartBoard";
import { FacultyAiCopilot } from "./FacultyAiCopilot";
import academyApi, { LawCourse, TuitionAccessRequest, LiveBatch, FacultyQuestion } from "../../lib/academyApi";

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
  | "audio"
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

  // Home Sub-Tabs: Calendars Planers, Task List, Kanban board, Lesson Planers, Projects, Uploads
  const [homeSubTab, setHomeSubTab] = useState<
    "tasks" | "kanban" | "calendars" | "lesson_planers" | "projects" | "uploads"
  >("tasks");

  // Permanent Faculty Code & Copy Toast
  const facultyCode = "FAC-80200B";
  const [copiedFacultyCode, setCopiedFacultyCode] = useState(false);

  // Lesson Plans State (persisted to localStorage)
  const [lessonPlans, setLessonPlans] = useState<LessonPlanItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const s = localStorage.getItem("wakheel_faculty_lesson_plans");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonUnit, setNewLessonUnit] = useState("Unit 1");
  const [newLessonHours, setNewLessonHours] = useState("4 Hours");
  const [newLessonSession, setNewLessonSession] = useState("");
  const [newLessonObjectives, setNewLessonObjectives] = useState("");

  // Content Uploads & Publishing Hub State
  const [uploadedResources, setUploadedResources] = useState<
    Array<{
      id: string;
      title: string;
      category: string;
      fileName: string;
      fileSize: string;
      status: "published" | "draft";
      downloads: number;
      createdAt: string;
    }>
  >(() => {
    if (typeof window === "undefined") return [];
    try {
      const s = localStorage.getItem("wakheel_faculty_uploads");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [uploadStatusFilter, setUploadStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [uploadCategoryFilter, setUploadCategoryFilter] = useState<string>("All Categories");
  const [showUploadResourceModal, setShowUploadResourceModal] = useState(false);
  const [newResTitle, setNewResTitle] = useState("");
  const [newResCategory, setNewResCategory] = useState("Lecture Slides (PPT)");
  const [newResStatus, setNewResStatus] = useState<"published" | "draft">("published");

  // Class Sections / Dynamic Batches Modal State
  const [showCreateBatchModal, setShowCreateBatchModal] = useState(false);
  const [newBatchTitle, setNewBatchTitle] = useState("");
  const [newBatchExam, setNewBatchExam] = useState("CLAT 2027 (NLUs)");
  const [newBatchSchedule, setNewBatchSchedule] = useState("Mon - Fri • 6:30 PM - 8:30 PM");
  const [newBatchPrice, setNewBatchPrice] = useState("2999");

  // SmartBoard Shortcut Modal / Room Join Code
  const [joinRoomInput, setJoinRoomInput] = useState("");
  const [adhocLectureTitle, setAdhocLectureTitle] = useState("");

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
  const [tasksList, setTasksList] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const s = localStorage.getItem("wakheel_faculty_tasks");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

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
  const [showTeacherLiveChamber, setShowTeacherLiveChamber] = useState(false);

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

  // Faculty Examination Portal State (starts clean, persisted to localStorage)
  const [facultyExams, setFacultyExams] = useState<
    Array<{
      id: string;
      title: string;
      pattern: string;
      durationMinutes: number;
      totalMarks: number;
      negativeMarking: string;
      scheduledDate: string;
      status: "Draft" | "Published" | "Live";
    }>
  >(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("wakheel_academy_faculty_exams_v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState("");
  const [newExamPattern, setNewExamPattern] = useState("CLAT 2027 (NLUs)");
  const [newExamDuration, setNewExamDuration] = useState(120);
  const [newExamMarks, setNewExamMarks] = useState(120);
  const [newExamNegative, setNewExamNegative] = useState("-0.25 per wrong answer");
  const [newExamDate, setNewExamDate] = useState("");

  const persistFacultyExams = (
    next: Array<{
      id: string;
      title: string;
      pattern: string;
      durationMinutes: number;
      totalMarks: number;
      negativeMarking: string;
      scheduledDate: string;
      status: "Draft" | "Published" | "Live";
    }>
  ) => {
    setFacultyExams(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("wakheel_academy_faculty_exams_v1", JSON.stringify(next));
    }
  };

  const [questionsList, setQuestionsList] = useState<FacultyQuestion[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("wakheel_faculty_questions_v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    academyApi.getMockTestPacks().then((res) => {
      if (res.success && Array.isArray(res.packs)) {
        const mapped = res.packs.map((p) => ({
          id: p.id,
          title: p.title,
          pattern: p.exam,
          durationMinutes: p.durationMinutes || 120,
          totalMarks: p.totalMarks || 120,
          negativeMarking: p.negativeMarking || "-0.25 per wrong answer",
          scheduledDate: p.scheduledDate || "Published",
          status: (p.status as "Draft" | "Published" | "Live") || "Published",
        }));
        persistFacultyExams(mapped);
      }
    });
    academyApi.getQuestions().then((res) => {
      if (res.success && Array.isArray(res.questions)) {
        setQuestionsList(res.questions);
      }
    });
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim()) return;
    const duration = Number(newExamDuration) || 120;
    const marks = Number(newExamMarks) || 120;
    const negative = newExamNegative.trim() || "None";
    const scheduled = newExamDate || "Unscheduled";
    const payload = {
      title: newExamTitle.trim(),
      conductingBody: teacherProfile.fullName || "Wakheel Faculty Consortium",
      exam: newExamPattern,
      badge: "FACULTY CBT",
      badgeColor: "amber",
      testsCount: `1 Timed Exam (${marks} Marks • ${duration} mins)`,
      price: 0,
      originalPrice: 0,
      discount: "INCLUDED",
      features: [
        `${duration} Minutes Timed CBT Pattern`,
        `Negative Marking: ${negative}`,
        `Scheduled: ${scheduled}`,
      ],
      hasFreeTest: true,
      freeTestName: newExamTitle.trim(),
      durationMinutes: duration,
      totalMarks: marks,
      negativeMarking: negative,
      scheduledDate: scheduled,
      status: "Published" as const,
      createdBy: teacherProfile.fullName || "Faculty",
    };

    const res = await academyApi.createMockTestPack(payload);
    const created = {
      id: res.pack?.id || `exam_${Date.now()}`,
      title: payload.title,
      pattern: payload.exam,
      durationMinutes: duration,
      totalMarks: marks,
      negativeMarking: negative,
      scheduledDate: scheduled,
      status: "Published" as const,
    };
    persistFacultyExams([created, ...facultyExams]);
    setNewExamTitle("");
    setNewExamDate("");
    setShowCreateExamModal(false);
  };

  const handleToggleExamStatus = (examId: string) => {
    persistFacultyExams(
      facultyExams.map((ex) =>
        ex.id === examId
          ? {
              ...ex,
              status: ex.status === "Draft" ? "Published" : ex.status === "Published" ? "Live" : "Draft",
            }
          : ex
      )
    );
  };

  const handleDeleteExam = (examId: string) => {
    persistFacultyExams(facultyExams.filter((ex) => ex.id !== examId));
    academyApi.deleteMockTestPack(examId).catch((err) => console.warn("deleteExam remote sync:", err));
  };

  // Upload Notes Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSubject, setUploadSubject] = useState("Bharatiya Nyaya Sanhita (BNS 2023)");
  const [uploadTitle, setUploadTitle] = useState("BNS 2023 vs IPC 1860 Full Comparative Table & Transition Guide");

  // ==============================================================
  // OPTION 4: HOMEWORK & CASE BRIEF SUBMISSION STATE
  // ==============================================================
  const [assignmentsList, setAssignmentsList] = useState<HomeworkAssignment[]>([]);
  const [submissionsList, setSubmissionsList] = useState<HomeworkSubmission[]>([]);
  const [assessmentTab, setAssessmentTab] = useState<"submissions" | "assignments">("submissions");
  const [submissionFilter, setSubmissionFilter] = useState<"all" | "pending" | "graded">("all");

  // Create Assignment Modal State
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentSubject, setAssignmentSubject] = useState("Criminal Procedure & Constitutional Bail");
  const [assignmentBatch, setAssignmentBatch] = useState("CLAT 2027 Super-30 & Distance LL.B");
  const [assignmentDueDate, setAssignmentDueDate] = useState("Nov 28, 2026, 8:00 PM");
  const [assignmentMaxScore, setAssignmentMaxScore] = useState(50);
  const [assignmentBadge, setAssignmentBadge] = useState("DRAFTING MEMORIAL");
  const [assignmentInstructions, setAssignmentInstructions] = useState("");
  const [assignmentRatio, setAssignmentRatio] = useState("");
  const [assignmentCreatedSuccess, setAssignmentCreatedSuccess] = useState(false);

  // Grading Studio Modal State
  const [selectedSubmissionForGrading, setSelectedSubmissionForGrading] = useState<HomeworkSubmission | null>(null);
  const [gradingStatutory, setGradingStatutory] = useState<number>(14);
  const [gradingPrecedents, setGradingPrecedents] = useState<number>(13);
  const [gradingDrafting, setGradingDrafting] = useState<number>(9);
  const [gradingReasoning, setGradingReasoning] = useState<number>(9);
  const [gradingFeedback, setGradingFeedback] = useState<string>("");
  const [gradingStatus, setGradingStatus] = useState<"Graded" | "Needs Revision">("Graded");
  const [gradeSuccess, setGradeSuccess] = useState(false);

  // ==============================================================
  // OPTION 6: FACULTY LECTURE RECORDING & AUDIO STUDIO STATE
  // ==============================================================
  const [lecturesList, setLecturesList] = useState<LectureAudio[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioWaveformLevels, setAudioWaveformLevels] = useState<number[]>([15, 28, 45, 60, 35, 20, 55, 75, 65, 42, 28, 50, 68, 85, 52, 32, 70, 88, 42, 22]);
  const [activeAudioPlayingId, setActiveAudioPlayingId] = useState<string | null>(null);
  const [audioPlayInstance, setAudioPlayInstance] = useState<HTMLAudioElement | null>(null);
  const [lectureFilterSubject, setLectureFilterSubject] = useState<string>("All");
  const [lectureSearchQuery, setLectureSearchQuery] = useState<string>("");

  // Publish Recorded Lecture Modal State
  const [showPublishLectureModal, setShowPublishLectureModal] = useState<boolean>(false);
  const [newLectureTitle, setNewLectureTitle] = useState<string>("");
  const [newLectureSubject, setNewLectureSubject] = useState<string>("Criminal Procedure (BNSS 2023)");
  const [newLectureBatch, setNewLectureBatch] = useState<string>("CLAT 2027 Super-30 & Distance LL.B");
  const [newLectureCategory, setNewLectureCategory] = useState<"Faculty Masterclass" | "Oral Argument Drill" | "Rapid Doctrine Revision">("Faculty Masterclass");
  const [newLectureNotes, setNewLectureNotes] = useState<string>("");
  const [newLectureCitations, setNewLectureCitations] = useState<string>("");
  const [recordedAudioUri, setRecordedAudioUri] = useState<string>("");
  const [recordedDurationStr, setRecordedDurationStr] = useState<string>("00:00");
  const [recordedDurationSec, setRecordedDurationSec] = useState<number>(0);
  const [lecturePublishSuccess, setLecturePublishSuccess] = useState<boolean>(false);

  useEffect(() => {
    setAssignmentsList(getStoredAssignments());
    setSubmissionsList(getStoredSubmissions());
    setLecturesList(getStoredLectures());

    syncAssignmentsWithServer().then((data) => {
      if (Array.isArray(data)) setAssignmentsList(data);
    });
    syncSubmissionsWithServer().then((data) => {
      if (Array.isArray(data)) setSubmissionsList(data);
    });
    syncLecturesWithServer().then((data) => {
      if (data && data.length > 0) setLecturesList(data);
    });

    const handleSync = () => {
      setAssignmentsList(getStoredAssignments());
      setSubmissionsList(getStoredSubmissions());
      setLecturesList(getStoredLectures());
    };
    window.addEventListener("storage", handleSync);
    return () => window.removeEventListener("storage", handleSync);
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isRecording && !isRecordingPaused) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
        setAudioWaveformLevels((prev) =>
          prev.map(() => Math.floor(Math.random() * 75) + 15)
        );
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isRecordingPaused]);

  const formatSecondsToMMSS = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsRecordingPaused(false);
    setRecordingSeconds(0);
  };

  const handlePauseResumeRecording = () => {
    setIsRecordingPaused(!isRecordingPaused);
  };

  const handleStopAndPrepareLecture = () => {
    setIsRecording(false);
    setIsRecordingPaused(false);
    const durationSec = Math.max(5, recordingSeconds);
    const durationFormatted = formatSecondsToMMSS(durationSec);
    setRecordedDurationSec(durationSec);
    setRecordedDurationStr(durationFormatted);
    const generatedAudio = generateSyntheticWavDataUri(Math.min(15, durationSec), 460);
    setRecordedAudioUri(generatedAudio);

    if (!newLectureTitle) {
      const defaultTpl = RECORDING_TEMPLATES[0];
      setNewLectureTitle(defaultTpl.title);
      setNewLectureSubject(defaultTpl.subject);
      setNewLectureBatch(defaultTpl.targetBatch);
      setNewLectureCategory(defaultTpl.category);
      setNewLectureNotes(defaultTpl.statutoryNotes);
      setNewLectureCitations(defaultTpl.keyCitations.join(", "));
    }
    setShowPublishLectureModal(true);
  };

  const handleApplyLectureTemplate = (tpl: RecordingTemplate) => {
    setNewLectureTitle(tpl.title);
    setNewLectureSubject(tpl.subject);
    setNewLectureBatch(tpl.targetBatch);
    setNewLectureCategory(tpl.category);
    setNewLectureNotes(tpl.statutoryNotes);
    setNewLectureCitations(tpl.keyCitations.join(", "));
  };

  const handlePublishLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLectureTitle.trim()) return;

    const newLec: LectureAudio = {
      id: `lec_${Date.now()}`,
      title: newLectureTitle.trim(),
      subject: newLectureSubject,
      targetBatch: newLectureBatch,
      facultyName: teacherProfile.fullName,
      duration: recordedDurationStr || "05:00",
      durationSeconds: recordedDurationSec || 300,
      date: "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      audioUrl: recordedAudioUri || generateSyntheticWavDataUri(8, 440),
      statutoryNotes: newLectureNotes.trim() || "Statutory analysis and judicial ratio overview.",
      keyCitations: newLectureCitations.split(",").map((c) => c.trim()).filter(Boolean),
      listensCount: 0,
      category: newLectureCategory,
      isFeatured: true,
    };

    const updated = saveLecture(newLec);
    setLecturesList(updated);
    setLecturePublishSuccess(true);
    setTimeout(() => {
      setLecturePublishSuccess(false);
      setShowPublishLectureModal(false);
      setNewLectureTitle("");
      setNewLectureNotes("");
      setNewLectureCitations("");
      setRecordingSeconds(0);
    }, 1200);
  };

  const handlePlayLecture = (lecture: LectureAudio) => {
    if (activeAudioPlayingId === lecture.id) {
      if (audioPlayInstance) {
        audioPlayInstance.pause();
        setActiveAudioPlayingId(null);
        setAudioPlayInstance(null);
      }
      return;
    }

    if (audioPlayInstance) {
      audioPlayInstance.pause();
    }

    const audio = new Audio(lecture.audioUrl || generateSyntheticWavDataUri(8, 440));
    audio.play();
    setActiveAudioPlayingId(lecture.id);
    setAudioPlayInstance(audio);
    audio.onended = () => {
      setActiveAudioPlayingId(null);
      setAudioPlayInstance(null);
    };
  };

  const handleDeleteLecture = (id: string) => {
    if (activeAudioPlayingId === id && audioPlayInstance) {
      audioPlayInstance.pause();
      setActiveAudioPlayingId(null);
      setAudioPlayInstance(null);
    }
    const updated = deleteLecture(id);
    setLecturesList(updated);
  };

  // Option 4 Handlers:
  const handlePublishAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentTitle.trim() || !assignmentInstructions.trim()) return;

    const newAssignment: HomeworkAssignment = {
      id: `hw_${Date.now()}`,
      title: assignmentTitle.trim(),
      subject: assignmentSubject,
      targetBatch: assignmentBatch,
      instructions: assignmentInstructions.trim(),
      faculty: teacherProfile.fullName,
      dueDate: assignmentDueDate.trim() || "Nov 30, 2026, 6:00 PM",
      maxScore: assignmentMaxScore,
      badge: assignmentBadge,
      referenceRatio: assignmentRatio.trim() || undefined,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    const updated = saveAssignment(newAssignment);
    setAssignmentsList(updated);
    setAssignmentCreatedSuccess(true);
    setTimeout(() => {
      setAssignmentCreatedSuccess(false);
      setShowCreateAssignmentModal(false);
      setAssignmentTitle("");
      setAssignmentInstructions("");
      setAssignmentRatio("");
    }, 1200);
  };

  const handleDeleteAssignment = (id: string) => {
    const updated = deleteAssignment(id);
    setAssignmentsList(updated);
  };

  const handleOpenGradingModal = (sub: HomeworkSubmission) => {
    setSelectedSubmissionForGrading(sub);
    if (sub.rubricBreakdown) {
      setGradingStatutory(sub.rubricBreakdown.statutoryAccuracy);
      setGradingPrecedents(sub.rubricBreakdown.casePrecedents);
      setGradingDrafting(sub.rubricBreakdown.draftingAndPrayer);
      setGradingReasoning(sub.rubricBreakdown.legalReasoning);
    } else {
      setGradingStatutory(14);
      setGradingPrecedents(13);
      setGradingDrafting(9);
      setGradingReasoning(9);
    }
    setGradingFeedback(sub.feedback || "");
    setGradingStatus((sub.status === "Needs Revision" ? "Needs Revision" : "Graded") as any);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionForGrading) return;
    const matchedAssignment = assignmentsList.find(
      (a) => a.id === selectedSubmissionForGrading.assignmentId
    );
    const maxScore = matchedAssignment?.maxScore || 50;
    const totalScore = gradingStatutory + gradingPrecedents + gradingDrafting + gradingReasoning;
    const updated = gradeSubmission(
      selectedSubmissionForGrading.id,
      totalScore,
      maxScore,
      gradingFeedback,
      teacherProfile.fullName,
      {
        statutoryAccuracy: gradingStatutory,
        casePrecedents: gradingPrecedents,
        draftingAndPrayer: gradingDrafting,
        legalReasoning: gradingReasoning,
      },
      gradingStatus
    );
    setSubmissionsList(updated);
    setGradeSuccess(true);
    setTimeout(() => {
      setGradeSuccess(false);
      setSelectedSubmissionForGrading(null);
    }, 1200);
  };

  // Doubts Hub State
  const [doubtsList, setDoubtsList] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const s = localStorage.getItem("wakheel_faculty_doubts");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

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
        if (parsed.fullName) {
          setNewBookAuthor(parsed.fullName);
        }
      }
    } catch {}
  }, []);

  // Dynamic Live Batches / Class Sections (Synced with /api/academy/batches)
  const [teacherBatches, setTeacherBatches] = useState<Array<LiveBatch & { nextTopic?: string; studentsCount?: number; maxStudents?: number }>>(() => {
    if (typeof window === "undefined") return [];
    try {
      const s = localStorage.getItem("wakheel_academy_batches");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let isMounted = true;
    academyApi.getLiveBatches().then((res) => {
      if (isMounted && res.success && Array.isArray(res.batches)) {
        setTeacherBatches(res.batches);
      }
    });
    academyApi.getLessonPlans().then((res) => {
      if (isMounted && res.success && Array.isArray(res.lessonPlans)) {
        setLessonPlans(res.lessonPlans);
      }
    });
    academyApi.getFacultyUploads().then((res) => {
      if (isMounted && res.success && Array.isArray(res.uploads)) {
        setUploadedResources(res.uploads);
      }
    });
    academyApi.getFacultyTasks().then((res) => {
      if (isMounted && res.success && Array.isArray(res.tasks)) {
        setTasksList(res.tasks);
      }
    });
    academyApi.getFacultyDoubts().then((res) => {
      if (isMounted && res.success && Array.isArray(res.doubts)) {
        setDoubtsList(res.doubts);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateLessonPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;
    const item: LessonPlanItem = {
      id: `lp_${Date.now()}`,
      title: newLessonTitle.trim(),
      unitNumber: newLessonUnit.trim() || "Unit 1",
      estimatedHours: newLessonHours.trim() || "4 Hours",
      firstSession: newLessonSession.trim() || "Opening Lecture & Statutory Overview",
      objectives: newLessonObjectives.trim() || "Master core statutory principles and landmark precedents.",
      classLabel: `${selectedDepartment} • ${selectedSubject}`,
      createdAt: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
    };
    const next = [item, ...lessonPlans];
    setLessonPlans(next);
    try {
      localStorage.setItem("wakheel_faculty_lesson_plans", JSON.stringify(next));
    } catch {}
    setShowCreateLessonModal(false);
    setNewLessonTitle("");
    setNewLessonSession("");
    setNewLessonObjectives("");
    academyApi.createLessonPlan(item).catch((err) => console.warn("createLessonPlan remote sync:", err));
  };

  const handleCreateUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim()) return;
    const item = {
      id: `res_${Date.now()}`,
      title: newResTitle.trim(),
      category: newResCategory,
      fileName: `${newResTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")}.pdf`,
      fileSize: "1.8 MB",
      status: newResStatus,
      downloads: 0,
      createdAt: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
    };
    const next = [item, ...uploadedResources];
    setUploadedResources(next);
    try {
      localStorage.setItem("wakheel_faculty_uploads", JSON.stringify(next));
    } catch {}
    setShowUploadResourceModal(false);
    setNewResTitle("");
    academyApi.createFacultyUpload(item).catch((err) => console.warn("createFacultyUpload remote sync:", err));
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchTitle.trim()) return;
    const res = await academyApi.createLiveBatch({
      title: newBatchTitle.trim(),
      faculty: teacherProfile.fullName,
      exam: newBatchExam,
      schedule: newBatchSchedule.trim(),
      price: Number(newBatchPrice) || 2999,
      originalPrice: (Number(newBatchPrice) || 2999) * 2,
      badge: "OPEN ENROLLMENT",
      seatsLeft: "50 seats available",
      features: ["Live Interactive Chamber Classes", "Weekly Doubt & Moot Sessions"],
    });
    if (res.success && res.batch) {
      setTeacherBatches((prev) => [res.batch!, ...prev]);
      setShowCreateBatchModal(false);
      setNewBatchTitle("");
    }
  };

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

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrinciple.trim() || !newFacts.trim()) return;
    const payload: Partial<FacultyQuestion> = {
      subject: newQuestionSubject,
      principle: newPrinciple.trim(),
      facts: newFacts.trim(),
      options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()].filter(Boolean),
      correctOption,
      rationale: rationale.trim(),
      createdBy: teacherProfile.fullName || "Faculty",
    };
    const res = await academyApi.createQuestion(payload);
    const created: FacultyQuestion = res.question || {
      id: `q_${Date.now()}`,
      subject: newQuestionSubject,
      principle: payload.principle!,
      facts: payload.facts!,
      options: payload.options!,
      correctOption,
      rationale: payload.rationale!,
      createdBy: payload.createdBy,
      createdAt: new Date().toISOString(),
    };
    const next = [created, ...questionsList];
    setQuestionsList(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("wakheel_faculty_questions_v1", JSON.stringify(next));
      } catch {}
    }
    setQuestionSavedSuccess(true);
    setTimeout(() => {
      setQuestionSavedSuccess(false);
    }, 2000);
  };

  const handleDeleteQuestion = (id: string) => {
    const next = questionsList.filter((q) => q.id !== id);
    setQuestionsList(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("wakheel_faculty_questions_v1", JSON.stringify(next));
      } catch {}
    }
    academyApi.deleteQuestion(id).catch((err) => console.warn("deleteQuestion remote sync:", err));
  };

  const handleReplyDoubt = (doubtId: string, reply: string) => {
    if (!reply.trim()) return;
    setDoubtsList((prev) => {
      const updated = prev.map((d) =>
        d.id === doubtId
          ? { ...d, status: "answered", replyText: reply.trim() }
          : d
      );
      try {
        localStorage.setItem("wakheel_faculty_doubts", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    academyApi.replyFacultyDoubt(doubtId, reply.trim()).catch((err) => console.warn("replyDoubt remote sync:", err));
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
    const updated = [newTask, ...tasksList];
    setTasksList(updated);
    try {
      localStorage.setItem("wakheel_faculty_tasks", JSON.stringify(updated));
    } catch {}
    setNewTaskTitle("");
    setShowCreateTaskModal(false);
    academyApi.createFacultyTask(newTask).catch((err) => console.warn("createTask remote sync:", err));
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasksList((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId
          ? { ...t, completed: !t.completed, status: !t.completed ? "Completed" : "In Progress" }
          : t
      );
      try {
        localStorage.setItem("wakheel_faculty_tasks", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    academyApi.toggleFacultyTask(taskId).catch((err) => console.warn("toggleTask remote sync:", err));
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
    syncBooksWithServer().then((books) => {
      if (Array.isArray(books)) setBooksList(books);
    });
  }, []);

  // ==============================================================
  // FACULTY MASTERCLASS COURSE AUTHORING STATE
  // ==============================================================
  const [coursesList, setCoursesList] = useState<LawCourse[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const s = localStorage.getItem("wakheel_academy_courses");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [showAuthorCourseModal, setShowAuthorCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseExam, setNewCourseExam] = useState("CLAT 2027 (NLUs)");
  const [newCourseCategory, setNewCourseCategory] = useState("Constitutional Law");
  const [newCourseInstructor, setNewCourseInstructor] = useState("Prof. Dr. Rajesh Varma");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [newCourseUnits, setNewCourseUnits] = useState("10 Sections");
  const [newCourseDuration, setNewCourseDuration] = useState("12h 00m");

  useEffect(() => {
    let isMounted = true;
    async function loadCourses() {
      try {
        const res = await academyApi.getCourses();
        if (isMounted && res.success && Array.isArray(res.courses)) {
          setCoursesList(res.courses);
        }
      } catch (e) {
        console.warn("Failed to load courses in teacher view:", e);
      }
    }
    loadCourses();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAuthorCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    const coursePayload: Partial<LawCourse> = {
      title: newCourseTitle.trim(),
      exam: newCourseExam,
      badge: "FACULTY VERIFIED",
      badgeColor: "amber",
      unitsCount: newCourseUnits,
      description: newCourseDesc.trim() || `${newCourseTitle} structured curriculum masterclass.`,
      instructor: newCourseInstructor.trim(),
      totalUnits: parseInt(newCourseUnits) || 10,
      completedUnits: 0,
      videoDuration: newCourseDuration,
      image: "/academy/explore-paper.png",
      syllabus: [
        { unit: "Unit 1: Foundational Framework & Statutory Overview", duration: "2h 30m", completed: false },
        { unit: "Unit 2: Landmark Precedents & High Court Analysis", duration: "3h 15m", completed: false },
        { unit: "Unit 3: Drafting & Practical Application Drills", duration: "2h 45m", completed: false },
      ],
      quiz: [
        {
          question: `What is the primary statutory foundation of ${newCourseTitle}?`,
          options: ["Indian Contract Act", "Constitution of India", "Bharatiya Nyaya Sanhita", "Advocates Act 1961"],
          correct: 1,
          explanation: "Constitutional and statutory mandates govern primary procedural hierarchy.",
        },
      ],
    };

    const res = await academyApi.createCourse(coursePayload);
    if (res.success && res.course) {
      setCoursesList([res.course, ...coursesList]);
      setShowAuthorCourseModal(false);
      setNewCourseTitle("");
      setNewCourseDesc("");
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to unpublish and delete this masterclass?")) return;
    await academyApi.deleteCourse(id);
    setCoursesList(coursesList.filter((c) => c.id !== id));
  };

  // ==============================================================
  // CENTRALIZED TUITION REQUESTS & ADMISSIONS STATE
  // ==============================================================
  const [tuitionRequestsList, setTuitionRequestsList] = useState<TuitionAccessRequest[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const s = localStorage.getItem("wakheel_faculty_tuition_requests");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [showTuitionRequestsDrawer, setShowTuitionRequestsDrawer] = useState(false);
  const [tuitionFilter, setTuitionFilter] = useState<"pending" | "approved" | "all">("pending");
  const [isReviewingTuitionId, setIsReviewingTuitionId] = useState<string | null>(null);

  // Sync tuition requests from backend on mount
  useEffect(() => {
    let isMounted = true;
    async function loadTuitionRequests() {
      try {
        const res = await academyApi.getTuitionRequests();
        if (isMounted && res.success && Array.isArray(res.requests)) {
          setTuitionRequestsList(res.requests);
        }
      } catch (err) {
        console.warn("Failed to load tuition requests in faculty view:", err);
      }
    }
    loadTuitionRequests();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleApproveTuition = async (id: string) => {
    try {
      setIsReviewingTuitionId(id);
      const res = await academyApi.reviewTuitionRequest(id, {
        status: "approved",
        reviewedBy: teacherProfile.fullName,
        facultyNotes: "Admitted into Specialized Centralized Law Chamber by Faculty Dean.",
      });
      if (res.success) {
        setTuitionRequestsList((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, status: "approved", reviewedAt: new Date().toISOString(), reviewedBy: teacherProfile.fullName }
              : r
          )
        );
      }
    } catch (err) {
      console.error("Tuition approve error:", err);
    } finally {
      setIsReviewingTuitionId(null);
    }
  };

  const handleDeclineTuition = async (id: string) => {
    try {
      setIsReviewingTuitionId(id);
      const res = await academyApi.reviewTuitionRequest(id, {
        status: "rejected",
        reviewedBy: teacherProfile.fullName,
        facultyNotes: "Capacity reached for this cohort.",
      });
      if (res.success) {
        setTuitionRequestsList((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, status: "rejected", reviewedAt: new Date().toISOString(), reviewedBy: teacherProfile.fullName }
              : r
          )
        );
      }
    } catch (err) {
      console.error("Tuition decline error:", err);
    } finally {
      setIsReviewingTuitionId(null);
    }
  };

  // Real-Time Academy WebSocket Gateway & Live Push Notifications
  const {
    isConnected: isAcademyWsConnected,
    liveToast,
    dismissToast,
  } = useAcademyWebSocket({
    role: "faculty",
    userId: teacherProfile.email || "faculty_varma",
    autoSync: true,
    onHomeworkSubmitted: () => {
      setSubmissionsList(getStoredSubmissions());
    },
    onNewAssignment: () => {
      setAssignmentsList(getStoredAssignments());
    },
    onNewLecture: () => {
      setLecturesList(getStoredLectures());
    },
    onNewBook: () => {
      setBooksList(getStoredBooks());
    },
    onEvent: (event) => {
      if (event.type === "ACADEMY_TUITION_REQUESTED") {
        academyApi.getTuitionRequests().then((res) => {
          if (res.success && Array.isArray(res.requests)) {
            setTuitionRequestsList(res.requests);
          }
        });
      }
    },
  });

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

  // Faculty 18-item sidebar navigation list (aligned with reference Faculty Studio)
  const facultySidebarItems: Array<{ id: TeacherNavSection; label: string; icon: any; badge?: string }> = [
    { id: "home", label: "Home", icon: Home },
    { id: "library", label: "Library", icon: Library },
    { id: "notebook", label: "Notebook", icon: BookText },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "lesson_plan", label: "Lesson Plan", icon: BookOpen },
    { id: "batches", label: "Live Classes", icon: Video, badge: "Live" },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "doubts_hub", label: "Ask / Doubts", icon: MessageSquare },
    { id: "assessment", label: "Assignments", icon: ClipboardList },
    { id: "test_creator", label: "Test Studio", icon: CheckSquare },
    { id: "test", label: "Examination", icon: Award },
    { id: "new_folder", label: "My Courses", icon: Layers },
    { id: "bookshelf", label: "Book Shelf", icon: BookMarked },
    { id: "collaboration", label: "Class Sections", icon: Users },
    { id: "recorded_classes", label: "Recorded Classes", icon: Mic },
    { id: "smart_board", label: "Smart Board", icon: Presentation },
    { id: "projects", label: "Projects", icon: TrendingUp },
    { id: "mentorship", label: "Tuition Mode", icon: UserCheck },
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
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 min-h-16 py-2 flex flex-wrap items-center justify-between px-4 sm:px-6 gap-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Department Filter Button */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                className="px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-zinc-200/80 dark:border-zinc-800 shadow-2xs transition-colors whitespace-nowrap"
              >
                <span>Dept: {selectedDepartment.split(" ")[0]}</span>
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
            <div className="relative shrink-0">
              <button
                onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                className="px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-zinc-200/80 dark:border-zinc-800 shadow-2xs transition-colors whitespace-nowrap"
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
          <div className="flex items-center gap-2 shrink-0">
            <button className="hidden sm:inline-flex p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer" title="Language">
              <Globe className="w-4 h-4 text-amber-500" />
            </button>

            <div className="relative w-36 sm:w-44 2xl:w-56">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, rosters..."
                className="w-full pl-8 pr-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
              />
            </div>

            <button className="hidden sm:inline-flex p-2 rounded-full text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer" title="Rankings">
              <Trophy className="w-4 h-4 text-amber-500" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-[11px] font-mono text-zinc-700 dark:text-zinc-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  isAcademyWsConnected ? "bg-amber-400 animate-pulse" : "bg-zinc-500"
                }`}
              />
              <span className="hidden md:inline">
                {isAcademyWsConnected ? "Live Sync" : "Offline"}
              </span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard?.writeText(facultyCode);
                setCopiedFacultyCode(true);
                setTimeout(() => setCopiedFacultyCode(false), 1800);
              }}
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 cursor-pointer hover:bg-amber-500 hover:text-black transition-colors"
              title="Click to copy your permanent Faculty Code"
            >
              <span>{copiedFacultyCode ? "Copied!" : `FAC: ${facultyCode}`}</span>
            </button>

            <button
              onClick={() => setActiveSection("mentorship")}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 dark:bg-zinc-800 hover:bg-amber-500 hover:text-black text-white font-bold text-xs transition-colors cursor-pointer"
              title="Open Centralized Tuition Mode"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Tuition Mode</span>
            </button>

            <button
              onClick={() => setShowTuitionRequestsDrawer(true)}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-colors cursor-pointer"
              title="Review Student Tuition Access Requests"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">Tuition Requests</span>
              {tuitionRequestsList.filter((r) => r.status === "pending").length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-extrabold animate-pulse">
                  {tuitionRequestsList.filter((r) => r.status === "pending").length}
                </span>
              )}
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
                    { id: "uploads", label: "Uploads" },
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
                        {tasksList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <CheckSquare className="w-8 h-8 text-zinc-400" />
                                <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No pending faculty tasks</h5>
                                <p className="text-xs text-zinc-500">Click &apos;+ Create Task&apos; above to plan lessons, assignments, or grading deadlines.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          tasksList.map((task) => (
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
                        ))
                      )}

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
                        {column.tasks.length === 0 ? (
                          <div className="p-4 rounded-2xl border border-dashed border-zinc-200/80 dark:border-zinc-800 text-center text-xs text-zinc-400">
                            No tasks
                          </div>
                        ) : (
                          column.tasks.map((task) => (
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
                          ))
                        )}
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

              {/* VIEW: UPLOADS */}
              {homeSubTab === "uploads" && (
                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Content Uploads &amp; Publishing</h4>
                      <p className="text-xs text-zinc-500">{uploadedResources.length} resources uploaded</p>
                    </div>
                    <button
                      onClick={() => setShowUploadResourceModal(true)}
                      className="px-4 py-2 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer"
                    >
                      + Upload New Resource
                    </button>
                  </div>
                  {uploadedResources.length === 0 ? (
                    <div className="py-10 text-center text-xs text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      No lecture slides or handouts uploaded yet. Click &quot;Upload New Resource&quot; to publish to cohorts.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {uploadedResources.slice(0, 5).map((r) => (
                        <div key={r.id} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold block">{r.title}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{r.category} • {r.fileSize}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${r.status === "published" ? "bg-emerald-500/15 text-emerald-500" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"}`}>
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
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
                        onClick={() => {
                          if (card.id === "smartboard") {
                            setActiveSection("smart_board");
                          } else {
                            setActiveCreateToolModal(card.id);
                          }
                        }}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ad-Hoc Live Lecture Card */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3 shadow-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold uppercase">
                      Ad-Hoc Live Lecture
                    </span>
                    <h3 className="text-sm font-bold text-black dark:text-white">Launch Instant Classroom Stage</h3>
                    <input
                      type="text"
                      value={adhocLectureTitle}
                      onChange={(e) => setAdhocLectureTitle(e.target.value)}
                      placeholder="Lecture Title (Optional) e.g. Writ Jurisdiction Q&A"
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs"
                    />
                    <button
                      onClick={() => {
                        setSelectedBatchForClass(adhocLectureTitle.trim() || "Ad-Hoc Live Law Chamber");
                        setShowTeacherLiveChamber(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer"
                    >
                      Launch Classroom Stage →
                    </button>
                  </div>

                  {/* Enter Existing Room Card */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3 shadow-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-mono font-bold uppercase">
                      Join Existing Chamber
                    </span>
                    <h3 className="text-sm font-bold text-black dark:text-white">Enter Existing Room</h3>
                    <input
                      type="text"
                      value={joinRoomInput}
                      onChange={(e) => setJoinRoomInput(e.target.value)}
                      placeholder="Room Code or Session ID"
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono"
                    />
                    <button
                      onClick={() => {
                        setSelectedBatchForClass(joinRoomInput.trim() || "Chamber Room");
                        setShowTeacherLiveChamber(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-amber-500 hover:text-black text-white font-extrabold text-xs transition-all cursor-pointer"
                    >
                      Enter Live Room
                    </button>
                  </div>
                </div>

                {teacherBatches.length === 0 ? (
                  <div className="py-12 px-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-3">
                    <Video className="w-8 h-8 text-amber-500 mx-auto" />
                    <h4 className="text-sm font-bold text-black dark:text-white">No Assigned Class Sections Yet</h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Create a Class Section or Live Batch to schedule recurring cohort sessions.
                    </p>
                    <button
                      onClick={() => setShowCreateBatchModal(true)}
                      className="px-4 py-2 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer"
                    >
                      + Create Class / Batch
                    </button>
                  </div>
                ) : (
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
                            {batch.seatsLeft || "Active Cohort"}
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
                )}
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

                {/* Published Question Bank */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                      Published CBT Question Bank ({questionsList.length})
                    </h3>
                  </div>
                  {questionsList.length === 0 ? (
                    <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-2">
                      <CheckSquare className="w-8 h-8 text-zinc-400 mx-auto" />
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                        No Questions in Question Bank Yet
                      </h4>
                      <p className="text-xs text-zinc-500 max-w-md mx-auto">
                        Author a principle-fact question above and click Publish to build your examination bank.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {questionsList.map((q) => (
                        <div
                          key={q.id}
                          className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5 shadow-xs flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                                {q.subject}
                              </span>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-400 transition-colors cursor-pointer"
                                title="Delete Question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-zinc-800 dark:text-zinc-200 font-semibold line-clamp-2">
                              <strong>Principle:</strong> {q.principle}
                            </p>
                            <p className="text-xs text-zinc-500 line-clamp-2">
                              <strong>Facts:</strong> {q.facts}
                            </p>
                          </div>
                          {q.options && q.options.length > 0 && (
                            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                              Correct: {q.options[q.correctOption] || q.options[0]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION: EXAMINATION PORTAL */}
            {activeSection === "test" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold uppercase">
                        Examination Portal
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">•</span>
                      <span className="text-xs text-zinc-500 font-mono">Proctored CBT &amp; Mock Scheduling</span>
                    </div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                      Examination &amp; Proctored CBT Studio
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Schedule timed legal examinations, configure negative marking rules, and publish mock test series to student cohorts.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => setActiveSection("test_creator")}
                      className="px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckSquare className="w-4 h-4 text-amber-500" />
                      <span>Open Test Studio</span>
                    </button>
                    <button
                      onClick={() => setShowCreateExamModal(true)}
                      className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Schedule Examination</span>
                    </button>
                  </div>
                </div>

                {/* 4 Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Total Examinations</span>
                    <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
                      {facultyExams.length}
                    </div>
                    <p className="text-[11px] text-zinc-500">Configured by faculty</p>
                  </div>
                  <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Live Now</span>
                    <div className="text-2xl font-black text-emerald-500 font-mono">
                      {facultyExams.filter((ex) => ex.status === "Live").length}
                    </div>
                    <p className="text-[11px] text-zinc-500">Active proctored sessions</p>
                  </div>
                  <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Published</span>
                    <div className="text-2xl font-black text-amber-500 font-mono">
                      {facultyExams.filter((ex) => ex.status === "Published").length}
                    </div>
                    <p className="text-[11px] text-zinc-500">Visible to student batches</p>
                  </div>
                  <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Drafts</span>
                    <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
                      {facultyExams.filter((ex) => ex.status === "Draft").length}
                    </div>
                    <p className="text-[11px] text-zinc-500">Pending publication</p>
                  </div>
                </div>

                {/* Inline Schedule Exam Form */}
                {showCreateExamModal && (
                  <form
                    onSubmit={handleCreateExam}
                    className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-amber-500/40 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                        Schedule New Examination
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowCreateExamModal(false)}
                        className="text-xs font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                          Examination Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={newExamTitle}
                          onChange={(e) => setNewExamTitle(e.target.value)}
                          placeholder="e.g., Constitutional Law Mid-Term CBT"
                          className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                          Target Pattern / Cohort
                        </label>
                        <select
                          value={newExamPattern}
                          onChange={(e) => setNewExamPattern(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs font-semibold"
                        >
                          <option>CLAT 2027 (NLUs)</option>
                          <option>KLEE 2027 (Kerala)</option>
                          <option>AILET (NLU Delhi)</option>
                          <option>AIBE Bar Examination</option>
                          <option>LL.B Semester Examination</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                          Duration (Minutes)
                        </label>
                        <input
                          type="number"
                          min={10}
                          value={newExamDuration}
                          onChange={(e) => setNewExamDuration(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                          Total Marks
                        </label>
                        <input
                          type="number"
                          min={10}
                          value={newExamMarks}
                          onChange={(e) => setNewExamMarks(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                          Negative Marking Rule
                        </label>
                        <input
                          type="text"
                          value={newExamNegative}
                          onChange={(e) => setNewExamNegative(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                          Scheduled Date &amp; Time
                        </label>
                        <input
                          type="text"
                          value={newExamDate}
                          onChange={(e) => setNewExamDate(e.target.value)}
                          placeholder="e.g., Dec 10, 2026, 10:00 AM"
                          className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer"
                      >
                        Publish Examination
                      </button>
                    </div>
                  </form>
                )}

                {/* Examinations Grid or Clean Zero-State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {facultyExams.length === 0 ? (
                    <div className="p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-3 col-span-full">
                      <Award className="w-10 h-10 text-zinc-400 mx-auto" />
                      <h4 className="text-sm font-black text-zinc-900 dark:text-white">
                        No Examinations Scheduled Yet
                      </h4>
                      <p className="text-xs text-zinc-500 max-w-md mx-auto">
                        Create your first timed examination or mock test paper to publish it to your student cohorts.
                      </p>
                      <button
                        onClick={() => setShowCreateExamModal(true)}
                        className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Schedule Examination</span>
                      </button>
                    </div>
                  ) : (
                    facultyExams.map((exam) => (
                      <div
                        key={exam.id}
                        className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                              {exam.pattern}
                            </span>
                            <button
                              onClick={() => handleToggleExamStatus(exam.id)}
                              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full cursor-pointer ${
                                exam.status === "Live"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : exam.status === "Published"
                                  ? "bg-amber-500 text-black"
                                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                              }`}
                              title="Click to cycle status (Draft -> Published -> Live)"
                            >
                              {exam.status}
                            </button>
                          </div>
                          <h4 className="text-sm font-black text-zinc-900 dark:text-white">
                            {exam.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-500">
                            <span>{exam.durationMinutes} mins</span>
                            <span>•</span>
                            <span>{exam.totalMarks} Marks</span>
                            <span>•</span>
                            <span>{exam.negativeMarking}</span>
                          </div>
                          <div className="text-[11px] font-mono text-zinc-400">
                            Scheduled: {exam.scheduledDate}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                          <button
                            onClick={() => setActiveSection("test_creator")}
                            className="text-xs font-bold text-amber-500 hover:underline cursor-pointer"
                          >
                            Author Questions in Test Studio →
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-400 transition-colors cursor-pointer"
                            title="Delete Examination"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SECTION: ASSESSMENTS & HOMEWORK EVALUATION (OPTION 4) */}
            {activeSection === "assessment" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold uppercase">
                        Faculty Adjudication
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">•</span>
                      <span className="text-xs text-zinc-500 font-mono">Real-Time Student Roster Sync</span>
                    </div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                      Case Briefs, Pleadings &amp; Homework Evaluation Studio
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Author curriculum assignments, review student pleadings, and grade using interactive 50-mark rubrics with direct feedback.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => setShowCreateAssignmentModal(true)}
                      className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Author New Assignment</span>
                    </button>
                  </div>
                </div>

                {/* 4 Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Total Submissions</span>
                    <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
                      {submissionsList.length} <span className="text-xs font-normal text-zinc-500">Briefs</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">Submitted by active scholars</p>
                  </div>

                  <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Pending Evaluation</span>
                    <div className="text-2xl font-black text-amber-500 font-mono">
                      {submissionsList.filter((s) => s.status === "Pending Evaluation").length}
                    </div>
                    <p className="text-[11px] text-zinc-500">Awaiting faculty marks</p>
                  </div>

                  <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Graded &amp; Certified</span>
                    <div className="text-2xl font-black text-emerald-500 font-mono">
                      {submissionsList.filter((s) => s.status === "Graded").length}
                    </div>
                    <p className="text-[11px] text-zinc-500">Chambers feedback issued</p>
                  </div>

                  <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Class Average</span>
                    <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
                      {submissionsList.filter((s) => s.score !== undefined).length > 0
                        ? `${Math.round(
                            submissionsList
                              .filter((s) => s.score !== undefined)
                              .reduce((acc, curr) => acc + (curr.score || 0), 0) /
                              submissionsList.filter((s) => s.score !== undefined).length
                          )} / 50`
                        : "—"}
                    </div>
                    <p className="text-[11px] text-emerald-500 font-semibold">Consortium Standard</p>
                  </div>
                </div>

                {/* Submissions vs Published Tabs & Filter Pills */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAssessmentTab("submissions")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        assessmentTab === "submissions"
                          ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black"
                      }`}
                    >
                      Student Submissions ({submissionsList.length})
                    </button>
                    <button
                      onClick={() => setAssessmentTab("assignments")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        assessmentTab === "assignments"
                          ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black"
                      }`}
                    >
                      Published Assignments ({assignmentsList.length})
                    </button>
                  </div>

                  {assessmentTab === "submissions" && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-zinc-400">Filter:</span>
                      <button
                        onClick={() => setSubmissionFilter("all")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          submissionFilter === "all"
                            ? "bg-amber-500 text-black"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setSubmissionFilter("pending")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          submissionFilter === "pending"
                            ? "bg-amber-500 text-black"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        Pending Review
                      </button>
                      <button
                        onClick={() => setSubmissionFilter("graded")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          submissionFilter === "graded"
                            ? "bg-amber-500 text-black"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        Graded
                      </button>
                    </div>
                  )}
                </div>

                {/* Submissions List View */}
                {assessmentTab === "submissions" && (
                  <div className="space-y-3">
                    {submissionsList.filter((s) => {
                      if (submissionFilter === "pending") return s.status === "Pending Evaluation";
                      if (submissionFilter === "graded") return s.status === "Graded";
                      return true;
                    }).length === 0 ? (
                      <div className="p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-3">
                        <FileText className="w-10 h-10 text-zinc-400 mx-auto" />
                        <h4 className="text-sm font-black text-zinc-900 dark:text-white">
                          No Student Submissions Yet
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-md mx-auto">
                          Once scholars submit pleadings or examination briefs for your authored assignments, they will appear here for rubric evaluation.
                        </p>
                        <button
                          onClick={() => setShowCreateAssignmentModal(true)}
                          className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer inline-flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Author New Assignment</span>
                        </button>
                      </div>
                    ) : (
                      submissionsList
                        .filter((s) => {
                          if (submissionFilter === "pending") return s.status === "Pending Evaluation";
                          if (submissionFilter === "graded") return s.status === "Graded";
                          return true;
                        })
                        .map((sub) => (
                        <div
                          key={sub.id}
                          className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                                    sub.status === "Graded"
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse"
                                  }`}
                                >
                                  {sub.status}
                                </span>
                                <span className="text-xs text-zinc-400 font-mono">•</span>
                                <span className="text-xs text-zinc-500 font-mono">Submitted {sub.submittedDate}</span>
                              </div>
                              <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white">
                                {sub.assignmentTitle}
                              </h4>
                              <div className="text-xs text-zinc-500">
                                Student: <strong className="text-zinc-800 dark:text-zinc-200">{sub.studentName}</strong> ({sub.studentEmail})
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {sub.score !== undefined && (
                                <div className="text-right">
                                  <div className="text-xl font-black text-amber-500 font-mono">
                                    {sub.score} / 50
                                  </div>
                                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Grade Awarded</span>
                                </div>
                              )}
                              <button
                                onClick={() => handleOpenGradingModal(sub)}
                                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                                <span>{sub.status === "Graded" ? "Review & Re-grade" : "Evaluate & Grade"}</span>
                              </button>
                            </div>
                          </div>

                          {/* Pleadings Snippet */}
                          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 font-serif leading-relaxed line-clamp-2">
                            {sub.submissionText}
                          </div>

                          {sub.feedback && (
                            <div className="text-xs text-zinc-600 dark:text-zinc-400 italic bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10">
                              <span className="font-bold text-amber-600 dark:text-amber-400 not-italic font-mono text-[10px] mr-1.5 uppercase">
                                Faculty Remark:
                              </span>
                              &ldquo;{sub.feedback}&rdquo;
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Published Assignments List View */}
                {assessmentTab === "assignments" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignmentsList.length === 0 ? (
                      <div className="p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-3 col-span-full">
                        <ClipboardList className="w-10 h-10 text-zinc-400 mx-auto" />
                        <h4 className="text-sm font-black text-zinc-900 dark:text-white">
                          No Assessments or Examinations Published Yet
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-md mx-auto">
                          Author your first legal examination, case brief, or pleading assignment to distribute it to your student batches.
                        </p>
                        <button
                          onClick={() => setShowCreateAssignmentModal(true)}
                          className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer inline-flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Author Assessment</span>
                        </button>
                      </div>
                    ) : (
                      assignmentsList.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase">
                              {assignment.badge}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">Due: {assignment.dueDate}</span>
                          </div>
                          <h4 className="text-sm font-black text-zinc-900 dark:text-white leading-snug">
                            {assignment.title}
                          </h4>
                          <div className="text-xs text-zinc-500 font-mono">
                            {assignment.subject} • {assignment.targetBatch}
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed font-serif">
                            {assignment.instructions}
                          </p>
                          {assignment.referenceRatio && (
                            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono bg-amber-500/5 p-2 rounded-xl border border-amber-500/10">
                              Ratio: {assignment.referenceRatio}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                          <span className="font-mono text-zinc-400">Max Score: {assignment.maxScore} Marks</span>
                          <button
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-400 transition-colors cursor-pointer"
                            title="Delete Assignment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SECTION: 1-ON-1 TUITION */}
            {/* SECTION: CENTRALIZED TUITION MODE & MENTORSHIP CHAMBERS */}
            {activeSection === "mentorship" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold uppercase">
                        Centralized Tuition Mode
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">•</span>
                      <span className="text-xs text-zinc-500 font-mono">1-on-1 &amp; Chamber Access Control</span>
                    </div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                      Tuition Chambers &amp; Scholar Access Requests
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Review student tuition requests, approve chamber admissions, and launch live 1-on-1 WebRTC mentorship chambers.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBatchForClass("1-on-1 Tuition Chamber");
                      setLiveClassTopic("Senior Advocate Mentorship & Doubt Resolution");
                      setShowTeacherLiveChamber(true);
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center gap-2 shrink-0"
                  >
                    <Video className="w-4 h-4" />
                    <span>Launch Open Tuition Chamber</span>
                  </button>
                </div>

                {/* 3 Metrics Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Pending Approvals</span>
                    <div className="text-2xl font-black text-amber-500 font-mono">
                      {tuitionRequestsList.filter((r) => r.status === "pending").length}
                    </div>
                    <p className="text-[11px] text-zinc-500">Awaiting faculty review</p>
                  </div>
                  <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Approved Scholars</span>
                    <div className="text-2xl font-black text-emerald-500 font-mono">
                      {tuitionRequestsList.filter((r) => r.status === "approved").length}
                    </div>
                    <p className="text-[11px] text-zinc-500">Active tuition chamber access</p>
                  </div>
                  <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Total Requests</span>
                    <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
                      {tuitionRequestsList.length}
                    </div>
                    <p className="text-[11px] text-zinc-500">Synced with Student Hub</p>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => setTuitionFilter("pending")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tuitionFilter === "pending"
                        ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Pending ({tuitionRequestsList.filter((r) => r.status === "pending").length})
                  </button>
                  <button
                    onClick={() => setTuitionFilter("approved")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tuitionFilter === "approved"
                        ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Approved ({tuitionRequestsList.filter((r) => r.status === "approved").length})
                  </button>
                  <button
                    onClick={() => setTuitionFilter("all")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tuitionFilter === "all"
                        ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    All ({tuitionRequestsList.length})
                  </button>
                </div>

                {/* Tuition Requests / Scholars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tuitionRequestsList.filter((r) =>
                    tuitionFilter === "all" ? true : r.status === tuitionFilter
                  ).length === 0 ? (
                    <div className="p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-3 col-span-full">
                      <UserCheck className="w-10 h-10 text-zinc-400 mx-auto" />
                      <h4 className="text-sm font-black text-zinc-900 dark:text-white">
                        No {tuitionFilter === "all" ? "" : tuitionFilter} Tuition Requests
                      </h4>
                      <p className="text-xs text-zinc-500 max-w-md mx-auto">
                        When scholars request 1-on-1 Tuition Chamber admission from the Student Hub, their requests will appear here in real time.
                      </p>
                    </div>
                  ) : (
                    tuitionRequestsList
                      .filter((r) => (tuitionFilter === "all" ? true : r.status === tuitionFilter))
                      .map((req) => (
                        <div
                          key={req.id}
                          className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3 shadow-xs flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                  req.status === "approved"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : req.status === "rejected"
                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                }`}
                              >
                                {req.status}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : "Recent"}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-zinc-900 dark:text-white">{req.studentName}</h4>
                              <p className="text-[11px] font-mono text-zinc-500">{req.studentEmail}</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                              {req.targetExam && (
                                <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                                  {req.targetExam}
                                </span>
                              )}
                              {req.studentCode && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                                  {req.studentCode}
                                </span>
                              )}
                            </div>
                            {req.reason && (
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 leading-relaxed">
                                {req.reason}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                            {req.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApproveTuition(req.id)}
                                  disabled={isReviewingTuitionId === req.id}
                                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {isReviewingTuitionId === req.id ? "Updating..." : "Approve Access"}
                                </button>
                                <button
                                  onClick={() => handleDeclineTuition(req.id)}
                                  disabled={isReviewingTuitionId === req.id}
                                  className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-600 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {req.status === "approved" && (
                              <button
                                onClick={() => {
                                  setSelectedBatchForClass(`Tuition: ${req.studentName}`);
                                  setLiveClassTopic(req.targetExam || "1-on-1 Legal Mentorship");
                                  setShowTeacherLiveChamber(true);
                                }}
                                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Launch Live Tuition Chamber</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* SECTION: DOUBTS HUB */}
            {activeSection === "doubts_hub" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Student Doubts (Ask)</h3>
                <div className="space-y-3">
                  {doubtsList.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-2">
                      <MessageSquare className="w-8 h-8 text-zinc-400 mx-auto" />
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No Pending Student Doubts</h4>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                        All scholar queries across your cohorts are up to date. New inquiries will appear here in real time.
                      </p>
                    </div>
                  ) : (
                    doubtsList.map((d) => (
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
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SECTION: FACULTY BOOK SHELF & PUBLISHING STUDIO (OPTION 3) */}
            {(activeSection === "bookshelf" || activeSection === "library") && (
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
                      {new Set(booksList.map((b) => b.department)).size} Curricula
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      {booksList.length > 0
                        ? Array.from(new Set(booksList.map((b) => b.department))).slice(0, 4).join(", ")
                        : "Publish books to populate disciplines"}
                    </p>
                  </div>
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {booksList.length === 0 ? (
                    <div className="p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-3 col-span-full">
                      <BookOpen className="w-10 h-10 text-zinc-400 mx-auto" />
                      <h4 className="text-sm font-black text-zinc-900 dark:text-white">
                        No Books in Shelf Yet
                      </h4>
                      <p className="text-xs text-zinc-500 max-w-md mx-auto">
                        Upload and publish textbooks, Bare Act digests, or statutory notes to make them available in the Student Book Shelf.
                      </p>
                      <button
                        onClick={() => setShowUploadBookModal(true)}
                        className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Publish Book</span>
                      </button>
                    </div>
                  ) : (
                    booksList.map((book) => (
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
                  ))
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* SECTION: FACULTY LECTURE RECORDING & AUDIO STUDIO (OPTION 6)  */}
            {/* ============================================================== */}
            {(activeSection === "recorded_classes" || activeSection === "audio") && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold uppercase">
                        Faculty Voice Chambers
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">•</span>
                      <span className="text-xs text-zinc-500 font-mono">Real-Time Student Broadcast</span>
                    </div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                      Faculty Lecture Recording &amp; Audio Masterclass Studio
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Record oral case briefs, statutory breakdowns, and landmark ratio analyses. Published lectures immediately stream to students&apos; audio players.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const tpl = RECORDING_TEMPLATES[0];
                      handleApplyLectureTemplate(tpl);
                      setRecordedDurationStr("12:30");
                      setRecordedDurationSec(750);
                      setRecordedAudioUri(generateSyntheticWavDataUri(12, 440));
                      setShowPublishLectureModal(true);
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center gap-2 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Quick-Publish Audio Lecture</span>
                  </button>
                </div>

                {/* 4 Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Published Audio Lectures</span>
                    <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
                      {lecturesList.length} <span className="text-xs font-normal text-zinc-500">Masterclasses</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">Available to all student cohorts</p>
                  </div>

                  <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Total Student Streams</span>
                    <div className="text-2xl font-black text-emerald-500 font-mono flex items-center gap-1.5">
                      <Headphones className="w-5 h-5 text-emerald-500" />
                      <span>{lecturesList.reduce((acc, l) => acc + l.listensCount, 0)}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">Cumulative student listens</p>
                  </div>

                  <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Active Legal Disciplines</span>
                    <div className="text-2xl font-black text-amber-500 font-mono">
                      {Array.from(new Set(lecturesList.map((l) => l.subject))).length} Subjects
                    </div>
                    <p className="text-[11px] text-zinc-500">Constitutional, BNSS, Contracts, BNS</p>
                  </div>

                  <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Broadcasting Quality</span>
                    <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
                      PCM WAV
                    </div>
                    <p className="text-[11px] text-emerald-500 font-semibold">Lossless Master Standard</p>
                  </div>
                </div>

                {/* Faculty Microphone Live Recording Deck */}
                <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-xl space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-bold shadow-md">
                        <Mic className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isRecording
                                ? isRecordingPaused
                                  ? "bg-amber-400"
                                  : "bg-rose-500 animate-ping"
                                : "bg-emerald-500"
                            }`}
                          />
                          <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-300">
                            {isRecording
                              ? isRecordingPaused
                                ? "STUDIO PAUSED • STANDBY"
                                : "ON AIR • BROADCASTING LIVE"
                              : "STUDIO READY • MICROPHONE ARMED"}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-0.5">
                          Faculty High-Yield Audio Recorder
                        </h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-black font-mono tracking-wider text-amber-400">
                        {formatSecondsToMMSS(recordingSeconds)}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Elapsed Session Time</span>
                    </div>
                  </div>

                  {/* Animated Waveform Visualizer */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span>Audio Input Waveform Monitor</span>
                      <span>48 kHz Mono • Level: {isRecording && !isRecordingPaused ? "Active Modulation" : "Silent"}</span>
                    </div>

                    <div className="h-20 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center gap-1.5 px-4 overflow-hidden">
                      {audioWaveformLevels.map((level, idx) => (
                        <div
                          key={idx}
                          style={{
                            height: isRecording && !isRecordingPaused ? `${level}%` : "12%",
                            transition: "height 0.2s ease-in-out",
                          }}
                          className={`w-2.5 rounded-full ${
                            isRecording && !isRecordingPaused
                              ? level > 65
                                ? "bg-amber-400"
                                : "bg-amber-500/80"
                              : "bg-zinc-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Recorder Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-3">
                      {!isRecording ? (
                        <button
                          onClick={handleStartRecording}
                          className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-white text-black font-extrabold text-xs transition-all shadow-lg cursor-pointer flex items-center gap-2"
                        >
                          <Radio className="w-4 h-4 text-black animate-pulse" />
                          <span>Start Voice Lecture</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handlePauseResumeRecording}
                            className="px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
                          >
                            {isRecordingPaused ? (
                              <>
                                <Play className="w-4 h-4 text-emerald-400" />
                                <span>Resume</span>
                              </>
                            ) : (
                              <>
                                <Pause className="w-4 h-4 text-amber-400" />
                                <span>Pause</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleStopAndPrepareLecture}
                            className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all shadow-lg cursor-pointer flex items-center gap-2"
                          >
                            <Square className="w-4 h-4 fill-white" />
                            <span>Stop &amp; Review Lecture</span>
                          </button>
                        </>
                      )}
                    </div>

                    {/* Quick Template Hints */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 font-mono">Load Topic Scaffold:</span>
                      {RECORDING_TEMPLATES.slice(0, 3).map((tpl) => (
                        <button
                          key={tpl.id}
                          onClick={() => {
                            handleApplyLectureTemplate(tpl);
                            setRecordedDurationStr("14:00");
                            setRecordedDurationSec(840);
                            setRecordedAudioUri(generateSyntheticWavDataUri(10, 480));
                            setShowPublishLectureModal(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-black text-[11px] font-semibold text-zinc-300 transition-colors cursor-pointer"
                        >
                          {tpl.subject.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Published Audio Lectures Filter & Archive */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                        Published Audio Masterclasses &amp; Case Briefs ({lecturesList.length})
                      </h3>
                      <p className="text-xs text-zinc-500">Live synchronized with the Student Portal Audio Player</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={lectureFilterSubject}
                        onChange={(e) => setLectureFilterSubject(e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="All">All Disciplines</option>
                        <option value="Constitutional Law">Constitutional Law</option>
                        <option value="Criminal Procedure (BNSS 2023)">Criminal Procedure (BNSS 2023)</option>
                        <option value="Law of Contracts">Law of Contracts</option>
                        <option value="Bharatiya Nyaya Sanhita (BNS 2023)">Bharatiya Nyaya Sanhita (BNS 2023)</option>
                      </select>
                    </div>
                  </div>

                  {/* Lectures Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lecturesList
                      .filter(
                        (l) =>
                          lectureFilterSubject === "All" ||
                          l.subject.toLowerCase() === lectureFilterSubject.toLowerCase()
                      )
                      .map((lecture) => {
                        const isThisPlaying = activeAudioPlayingId === lecture.id;
                        return (
                          <div
                            key={lecture.id}
                            className={`p-5 rounded-3xl bg-white dark:bg-zinc-900 border transition-all shadow-xs space-y-4 ${
                              isThisPlaying
                                ? "border-amber-500 ring-2 ring-amber-500/20"
                                : "border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                                    {lecture.category}
                                  </span>
                                  <span className="text-xs text-zinc-400 font-mono">•</span>
                                  <span className="text-xs text-zinc-500 font-mono">{lecture.duration}</span>
                                </div>
                                <h4 className="text-base font-black text-zinc-900 dark:text-white leading-snug">
                                  {lecture.title}
                                </h4>
                                <div className="text-xs text-zinc-500">
                                  {lecture.subject} • <span className="font-semibold text-zinc-700 dark:text-zinc-300">{lecture.targetBatch}</span>
                                </div>
                              </div>

                              {/* Play / Pause Round Button */}
                              <button
                                onClick={() => handlePlayLecture(lecture)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all shadow-md cursor-pointer shrink-0 ${
                                  isThisPlaying
                                    ? "bg-black text-amber-400 dark:bg-white dark:text-black animate-pulse"
                                    : "bg-amber-500 hover:bg-black hover:text-white text-black"
                                }`}
                                title={isThisPlaying ? "Pause Audio" : "Play Audio Lecture"}
                              >
                                {isThisPlaying ? (
                                  <Pause className="w-5 h-5 fill-current" />
                                ) : (
                                  <Play className="w-5 h-5 fill-current ml-0.5" />
                                )}
                              </button>
                            </div>

                            {/* Statutory Notes */}
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-serif">
                              {lecture.statutoryNotes}
                            </p>

                            {/* Citations Tag Badges */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {lecture.keyCitations.map((c, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                >
                                  ⚖ {c}
                                </span>
                              ))}
                            </div>

                            {/* Footer info & Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-400">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                                  <Headphones className="w-3.5 h-3.5" />
                                  <span>{lecture.listensCount} listens</span>
                                </span>
                                <span>•</span>
                                <span>{lecture.date}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => downloadLectureAudio(lecture)}
                                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                                  title="Download WAV File"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLecture(lecture.id)}
                                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-400 transition-colors cursor-pointer"
                                  title="Unpublish Lecture"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* MY COURSES / MASTERCLASS AUTHORING STUDIO                      */}
            {/* ============================================================== */}
            {activeSection === "new_folder" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold uppercase">
                        Faculty Studio
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">Masterclass Courseware</span>
                    </div>
                    <h2 className="text-2xl font-black text-black dark:text-white tracking-tight">
                      Masterclass Authoring Studio
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Author, publish, and manage legal courses, syllabi, and passage drills for student cohorts.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAuthorCourseModal(true)}
                    className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-sm cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Author Masterclass</span>
                  </button>
                </div>

                {/* Courses Grid / Clean Zero-State */}
                {coursesList.length === 0 ? (
                  <div className="py-20 px-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-4 max-w-md mx-auto shadow-xs">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                      <Layers className="w-7 h-7" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-base font-bold text-black dark:text-white">
                        No Masterclasses Published Yet
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                        Create structured curricula, chapter syllabi, and practice drills for your legal aspirants. Published courses instantly sync with the student portal.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => setShowAuthorCourseModal(true)}
                        className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Author First Course</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coursesList.map((course) => (
                      <div
                        key={course.id}
                        className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 uppercase">
                              {course.exam}
                            </span>
                            <span className="text-zinc-500 font-mono text-[11px]">{course.unitsCount}</span>
                          </div>
                          <h4 className="text-base font-bold text-black dark:text-white leading-snug">
                            {course.title}
                          </h4>
                          <p className="text-xs text-zinc-500 line-clamp-2">{course.description}</p>
                          <div className="text-xs text-zinc-400 pt-1">
                            Instructor: <span className="text-zinc-700 dark:text-zinc-300 font-medium">{course.instructor || "Faculty"}</span>
                          </div>
                        </div>

                        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            Live on Student Portal
                          </span>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-400 transition-colors cursor-pointer"
                            title="Unpublish Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* LESSON PLANNER & CURRICULUM INGESTION                          */}
            {/* ============================================================== */}
            {activeSection === "lesson_plan" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold uppercase">
                      Curriculum Architect
                    </span>
                    <h2 className="text-2xl font-black text-black dark:text-white tracking-tight">
                      Lesson Planner &amp; Curriculum Ingestion
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Author chapter schedules, learning objectives, and sync directly to the Interactive Smart Board.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveSection("smart_board")}
                      className="px-4 py-2 rounded-full bg-zinc-900 dark:bg-zinc-800 hover:bg-amber-500 hover:text-black text-white font-bold text-xs cursor-pointer transition-all"
                    >
                      Open Smart Board
                    </button>
                    <button
                      onClick={() => setShowCreateLessonModal(true)}
                      className="px-5 py-2 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Lesson Plan</span>
                    </button>
                  </div>
                </div>

                {lessonPlans.length === 0 ? (
                  <div className="py-16 px-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-4 max-w-md mx-auto">
                    <BookOpen className="w-8 h-8 text-amber-500 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-base font-bold">No Lesson Plans Created Yet</h4>
                      <p className="text-xs text-zinc-500">
                        Create your first unit plan to structure lectures and sync objectives with the Smart Board.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCreateLessonModal(true)}
                      className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs cursor-pointer"
                    >
                      + Create First Lesson Plan
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lessonPlans.map((lp) => (
                      <div key={lp.id} className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold uppercase">
                            {lp.unitNumber} • {lp.estimatedHours}
                          </span>
                          <span className="text-zinc-400">{lp.createdAt}</span>
                        </div>
                        <h4 className="text-base font-bold">{lp.title}</h4>
                        <p className="text-xs text-zinc-500">{lp.objectives}</p>
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                          <span className="text-zinc-400 font-mono truncate">{lp.firstSession}</span>
                          <button
                            onClick={() => setActiveSection("smart_board")}
                            className="text-amber-500 font-bold hover:underline cursor-pointer shrink-0"
                          >
                            Teach on Board →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* CONTENT UPLOADS & PUBLISHING HUB                               */}
            {/* ============================================================== */}
            {activeSection === "upload" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold uppercase">
                      Faculty Content Hub
                    </span>
                    <h2 className="text-2xl font-black text-black dark:text-white tracking-tight mt-1">
                      Content Uploads &amp; Publishing
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Upload lecture slides (PPT/PDF), study handouts, bare act notes, and worksheets.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUploadResourceModal(true)}
                    className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload New Resource</span>
                  </button>
                </div>

                {/* 4 KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Materials", value: uploadedResources.length, sub: "All uploaded files" },
                    { label: "Live to Students", value: uploadedResources.filter((r) => r.status === "published").length, sub: "Published & Accessible" },
                    { label: "Drafts (Private)", value: uploadedResources.filter((r) => r.status === "draft").length, sub: "Visible only to you" },
                    { label: "Student Accesses", value: uploadedResources.reduce((a, b) => a + b.downloads, 0), sub: "Total downloads" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-400">{kpi.label}</span>
                      <div className="text-2xl font-black font-mono text-amber-500">{kpi.value}</div>
                      <p className="text-[11px] text-zinc-500">{kpi.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {(["all", "published", "draft"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setUploadStatusFilter(st)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize cursor-pointer ${
                          uploadStatusFilter === st
                            ? "bg-amber-500 text-black font-extrabold"
                            : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500"
                        }`}
                      >
                        {st} ({st === "all" ? uploadedResources.length : uploadedResources.filter((r) => r.status === st).length})
                      </button>
                    ))}
                  </div>
                  <select
                    value={uploadCategoryFilter}
                    onChange={(e) => setUploadCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                  >
                    <option>All Categories</option>
                    <option>Lecture Slides (PPT)</option>
                    <option>Study Notes &amp; Handouts</option>
                    <option>Textbook &amp; Reading Chapter</option>
                    <option>Worksheet / Problem Set</option>
                    <option>Syllabus &amp; Course Guide</option>
                  </select>
                </div>

                {uploadedResources.length === 0 ? (
                  <div className="py-16 px-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                    <Upload className="w-8 h-8 text-amber-500 mx-auto" />
                    <h4 className="text-sm font-bold">No Resources Uploaded Yet</h4>
                    <p className="text-xs text-zinc-500">Click &quot;Upload New Resource&quot; to share materials with your cohorts.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {uploadedResources
                      .filter((r) => uploadStatusFilter === "all" || r.status === uploadStatusFilter)
                      .filter((r) => uploadCategoryFilter === "All Categories" || r.category === uploadCategoryFilter)
                      .map((r) => (
                        <div key={r.id} className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-amber-500 font-bold uppercase">{r.category}</span>
                            <span className="uppercase">{r.status}</span>
                          </div>
                          <h4 className="text-sm font-bold">{r.title}</h4>
                          <p className="text-[11px] font-mono text-zinc-500">{r.fileName} • {r.fileSize}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* CLASS SECTIONS & ENROLLED COHORT ROSTERS                       */}
            {/* ============================================================== */}
            {activeSection === "collaboration" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold uppercase">
                      Academic Cohorts
                    </span>
                    <h2 className="text-2xl font-black text-black dark:text-white tracking-tight mt-1">
                      My Classes &amp; Sections
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Manage academic groups, live batches, and enrolled student rosters.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateBatchModal(true)}
                    className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Class / Section</span>
                  </button>
                </div>

                {teacherBatches.length === 0 ? (
                  <div className="py-16 px-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-3 max-w-md mx-auto">
                    <Users className="w-8 h-8 text-amber-500 mx-auto" />
                    <h4 className="text-sm font-bold">No Class Sections Created</h4>
                    <p className="text-xs text-zinc-500">Create your first class section or tuition batch to start enrolling scholars.</p>
                    <button
                      onClick={() => setShowCreateBatchModal(true)}
                      className="px-5 py-2 rounded-full bg-amber-500 text-black font-extrabold text-xs cursor-pointer"
                    >
                      Create Class / Section
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teacherBatches.map((b) => (
                      <div key={b.id} className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-[10px] font-mono font-bold uppercase">
                          {b.exam}
                        </span>
                        <h4 className="text-base font-bold">{b.title}</h4>
                        <p className="text-xs text-zinc-500 font-mono">{b.schedule}</p>
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                          <span className="text-zinc-400">{b.seatsLeft}</span>
                          <button
                            onClick={() => {
                              setSelectedBatchForClass(b.title);
                              setShowTeacherLiveChamber(true);
                            }}
                            className="text-amber-500 font-bold hover:underline cursor-pointer"
                          >
                            Launch Room →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* INTERACTIVE SMART BOARD                                        */}
            {/* ============================================================== */}
            {activeSection === "smart_board" && (
              <FacultySmartBoard
                lessonPlans={lessonPlans}
                onOpenLessonPlanner={() => setActiveSection("lesson_plan")}
              />
            )}

            {/* ============================================================== */}
            {/* CALENDAR, PROJECTS & BENCH NOTEBOOK                            */}
            {/* ============================================================== */}
            {(activeSection === "calendar" || activeSection === "projects" || activeSection === "notebook") && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold uppercase">
                      Faculty Studio
                    </span>
                    <h2 className="text-2xl font-black text-black dark:text-white tracking-tight mt-1">
                      {activeSection === "calendar"
                        ? "Calendars & Planners"
                        : activeSection === "projects"
                        ? "Faculty Research & Moot Projects"
                        : "Faculty Bench Notebook"}
                    </h2>
                    <p className="text-xs text-zinc-500">
                      {activeSection === "calendar"
                        ? "Manage your live class schedules, deadlines, and cohort reviews."
                        : activeSection === "projects"
                        ? "Track moot court memorials and group research assignments."
                        : "Draft lesson outlines, case briefs, and bench templates."}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateTaskModal(true)}
                    className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs cursor-pointer self-start sm:self-auto"
                  >
                    + Add Task / Milestone
                  </button>
                </div>

                {tasksList.length === 0 ? (
                  <div className="py-16 px-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-3 max-w-md mx-auto">
                    <Calendar className="w-8 h-8 text-amber-500 mx-auto" />
                    <h4 className="text-sm font-bold">No Scheduled Items Yet</h4>
                    <p className="text-xs text-zinc-500">
                      Add a task, class milestone, or research draft to populate your workspace.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tasksList.map((t) => (
                      <div key={t.id} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-mono text-amber-500 font-bold uppercase">{t.type} • {t.dueDate}</span>
                          <h4 className="font-bold text-sm mt-0.5">{t.title}</h4>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] font-bold">
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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
                    setShowLiveClassModal(false);
                    setShowTeacherLiveChamber(true);
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

      {/* 1. CREATE ASSIGNMENT MODAL (OPTION 4) */}
      {showCreateAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl relative space-y-4 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateAssignmentModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase">
                Curriculum Assignment Authoring
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Author New Legal Drafting Assignment / Case Brief
              </h3>
              <p className="text-xs text-zinc-500">
                Published assignments immediately sync to student homework trackers with legal scaffolding.
              </p>
            </div>

            <form onSubmit={handlePublishAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  placeholder="e.g. Regular Bail Petition Drafting under BNSS 2023 Section 480"
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Curriculum Discipline</label>
                  <select
                    value={assignmentSubject}
                    onChange={(e) => setAssignmentSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-semibold"
                  >
                    <option value="Criminal Procedure & Constitutional Bail">Criminal Procedure & Constitutional Bail</option>
                    <option value="Constitutional Law & Basic Structure">Constitutional Law & Basic Structure</option>
                    <option value="Commercial & Contract Law">Commercial & Contract Law</option>
                    <option value="Bharatiya Nyaya Sanhita (BNS 2023)">Bharatiya Nyaya Sanhita (BNS 2023)</option>
                    <option value="Civil Procedure & Injunctions">Civil Procedure & Injunctions</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Target Cohort</label>
                  <input
                    type="text"
                    value={assignmentBatch}
                    onChange={(e) => setAssignmentBatch(e.target.value)}
                    placeholder="e.g. CLAT 2027 Super-30 & Distance LL.B"
                    className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Submission Deadline</label>
                  <input
                    type="text"
                    value={assignmentDueDate}
                    onChange={(e) => setAssignmentDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Max Score</label>
                  <input
                    type="number"
                    value={assignmentMaxScore}
                    onChange={(e) => setAssignmentMaxScore(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={assignmentBadge}
                    onChange={(e) => setAssignmentBadge(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Problem Scenario &amp; Instructions *</label>
                <textarea
                  rows={4}
                  required
                  value={assignmentInstructions}
                  onChange={(e) => setAssignmentInstructions(e.target.value)}
                  placeholder="Draft the facts, statutory issues to address, and specific legal grounds required..."
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-serif leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Mandatory Precedents / Ratio Guidance</label>
                <input
                  type="text"
                  value={assignmentRatio}
                  onChange={(e) => setAssignmentRatio(e.target.value)}
                  placeholder="e.g. Arnesh Kumar v. Bihar (2014); Satender Kumar Antil (2022)"
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateAssignmentModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignmentCreatedSuccess}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{assignmentCreatedSuccess ? "✓ Published!" : "Publish Assignment"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. FACULTY GRADING STUDIO MODAL (OPTION 4) */}
      {selectedSubmissionForGrading && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl relative space-y-5 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedSubmissionForGrading(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                  Faculty Grading Studio
                </span>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white mt-1">
                  Evaluating: {selectedSubmissionForGrading.assignmentTitle}
                </h3>
                <p className="text-xs text-zinc-500">
                  Student: <strong>{selectedSubmissionForGrading.studentName}</strong> • Submitted {selectedSubmissionForGrading.submittedDate}
                </p>
              </div>

              <div className="text-right">
                <div className="text-3xl font-black font-mono text-amber-500">
                  {gradingStatutory + gradingPrecedents + gradingDrafting + gradingReasoning} <span className="text-sm font-normal text-zinc-400">/ 50</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Composite Rubric Score</span>
              </div>
            </div>

            {/* Split Screen: Student Submission Preview vs Rubric Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Student Pleadings Parchment View (7 cols) */}
              <div className="lg:col-span-7 space-y-4 max-h-[500px] overflow-y-auto pr-2">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                  <span className="text-[11px] font-mono font-extrabold uppercase text-zinc-500 block">
                    Formulated Questions of Law &amp; Issues
                  </span>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 font-serif leading-relaxed">
                    {selectedSubmissionForGrading.issuesRaised}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                  <span className="text-[11px] font-mono font-extrabold uppercase text-zinc-500 block">
                    Student Memorial Pleadings &amp; Legal Grounds
                  </span>
                  <div className="text-xs text-zinc-800 dark:text-zinc-200 font-serif leading-relaxed whitespace-pre-line">
                    {selectedSubmissionForGrading.submissionText}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <span className="text-[11px] font-mono font-extrabold uppercase text-amber-700 dark:text-amber-400 block">
                    Prayer / Concluding Relief
                  </span>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 italic font-serif leading-relaxed">
                    &ldquo;{selectedSubmissionForGrading.prayerOrConclusion}&rdquo;
                  </p>
                </div>

                {selectedSubmissionForGrading.attachmentName && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs">
                    <span className="font-mono text-zinc-600 dark:text-zinc-400">Attached: {selectedSubmissionForGrading.attachmentName}</span>
                    <button
                      type="button"
                      onClick={() => downloadSubmissionFile(selectedSubmissionForGrading)}
                      className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Submission</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Interactive Rubric Sliders (5 cols) */}
              <form onSubmit={handleSaveGrade} className="lg:col-span-5 space-y-4">
                <div className="space-y-3.5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-xs">
                  <span className="text-[11px] font-mono font-black uppercase tracking-wider text-black dark:text-white block">
                    Faculty 4-Part Rubric (Max 50)
                  </span>

                  {/* Slider 1: Statutory Accuracy (15) */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-zinc-700 dark:text-zinc-300">Statutory Accuracy</span>
                      <span className="font-mono text-amber-500">{gradingStatutory} / 15</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      value={gradingStatutory}
                      onChange={(e) => setGradingStatutory(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Slider 2: Case Precedents (15) */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-zinc-700 dark:text-zinc-300">Case Precedents &amp; Citations</span>
                      <span className="font-mono text-amber-500">{gradingPrecedents} / 15</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      value={gradingPrecedents}
                      onChange={(e) => setGradingPrecedents(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Slider 3: Drafting & Prayer (10) */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-zinc-700 dark:text-zinc-300">Drafting Form &amp; Prayer</span>
                      <span className="font-mono text-amber-500">{gradingDrafting} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={gradingDrafting}
                      onChange={(e) => setGradingDrafting(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Slider 4: Legal Reasoning (10) */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-zinc-700 dark:text-zinc-300">Legal Reasoning &amp; Logic</span>
                      <span className="font-mono text-amber-500">{gradingReasoning} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={gradingReasoning}
                      onChange={(e) => setGradingReasoning(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Faculty Commentary */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Faculty Remarks &amp; Chambers Critique
                  </label>
                  <textarea
                    rows={4}
                    value={gradingFeedback}
                    onChange={(e) => setGradingFeedback(e.target.value)}
                    placeholder="Provide specific feedback on student grounds, ratio interpretation, and drafting quality..."
                    className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-serif leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <select
                    value={gradingStatus}
                    onChange={(e) => setGradingStatus(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                  >
                    <option value="Graded">Mark as Graded</option>
                    <option value="Needs Revision">Request Revision</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSubmissionForGrading(null)}
                      className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={gradeSuccess}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs shadow-sm transition-all cursor-pointer"
                    >
                      {gradeSuccess ? "✓ Grade Published!" : "Publish Grade & Feedback"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. PUBLISH RECORDED LECTURE MODAL (OPTION 6) */}
      {showPublishLectureModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl relative space-y-4 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowPublishLectureModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase">
                Broadcasting Masterclass
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Publish Lecture to Student Roster
              </h3>
              <p className="text-xs text-zinc-500">
                Duration: <strong className="text-amber-500 font-mono">{recordedDurationStr}</strong> • Students will receive live streaming access immediately.
              </p>
            </div>

            {/* Quick Templates */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                Model Legal Templates
              </span>
              <div className="grid grid-cols-2 gap-2">
                {RECORDING_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyLectureTemplate(tpl)}
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 text-left transition-colors cursor-pointer bg-zinc-50 dark:bg-zinc-950"
                  >
                    <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{tpl.subject}</div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">{tpl.title}</div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handlePublishLecture} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Lecture Title *</label>
                <input
                  type="text"
                  required
                  value={newLectureTitle}
                  onChange={(e) => setNewLectureTitle(e.target.value)}
                  placeholder="e.g. BNSS Section 480 Regular Bail & S.35 Safeguards"
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Curriculum Discipline</label>
                  <select
                    value={newLectureSubject}
                    onChange={(e) => setNewLectureSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-semibold"
                  >
                    <option value="Constitutional Law">Constitutional Law</option>
                    <option value="Criminal Procedure (BNSS 2023)">Criminal Procedure (BNSS 2023)</option>
                    <option value="Law of Contracts">Law of Contracts</option>
                    <option value="Bharatiya Nyaya Sanhita (BNS 2023)">Bharatiya Nyaya Sanhita (BNS 2023)</option>
                    <option value="Civil Procedure & Pleadings">Civil Procedure & Pleadings</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Target Cohort</label>
                  <input
                    type="text"
                    value={newLectureBatch}
                    onChange={(e) => setNewLectureBatch(e.target.value)}
                    placeholder="e.g. CLAT 2027 Super-30"
                    className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Statutory Notes &amp; Teaching Ratio</label>
                <textarea
                  rows={3}
                  value={newLectureNotes}
                  onChange={(e) => setNewLectureNotes(e.target.value)}
                  placeholder="Summarize key statutory sections, procedural tests, and takeaways..."
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-serif leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Key Citations (comma-separated)</label>
                <input
                  type="text"
                  value={newLectureCitations}
                  onChange={(e) => setNewLectureCitations(e.target.value)}
                  placeholder="e.g. Arnesh Kumar v. Bihar (2014), Satender Antil (2022)"
                  className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPublishLectureModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={lecturePublishSuccess}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Headphones className="w-4 h-4" />
                  <span>{lecturePublishSuccess ? "✓ Published!" : "Publish to Student Roster"}</span>
                </button>
              </div>
            </form>
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

      {/* AUTHOR MASTERCLASS MODAL */}
      {showAuthorCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAuthorCourseModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase">
                Faculty Authoring Deck
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Author New Masterclass</h3>
              <p className="text-xs text-zinc-500">
                Publish a structured legal course with syllabi and case law drills.
              </p>
            </div>

            <form onSubmit={handleAuthorCourse} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Masterclass Title
                </label>
                <input
                  type="text"
                  required
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder="e.g. Constitutional Law: Writs & Basic Structure"
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Target Exam / Cohort
                  </label>
                  <select
                    value={newCourseExam}
                    onChange={(e) => setNewCourseExam(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option>CLAT 2027 (NLUs)</option>
                    <option>Distance LL.B (IGNOU)</option>
                    <option>KLEE 2027 (Kerala)</option>
                    <option>Judicial Services</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Units / Sections
                  </label>
                  <input
                    type="text"
                    value={newCourseUnits}
                    onChange={(e) => setNewCourseUnits(e.target.value)}
                    placeholder="e.g. 15 Sections"
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Lead Instructor
                </label>
                <input
                  type="text"
                  value={newCourseInstructor}
                  onChange={(e) => setNewCourseInstructor(e.target.value)}
                  placeholder="e.g. Prof. Dr. Rajesh Varma"
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Curriculum Overview &amp; Learning Objectives
                </label>
                <textarea
                  rows={3}
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  placeholder="Describe the jurisprudential framework, target legal skills, and statutory depth..."
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuthorCourseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-xs cursor-pointer"
                >
                  Publish Masterclass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CENTRALIZED TUITION REQUESTS REVIEW DRAWER */}
      {showTuitionRequestsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end">
          <div className="w-full max-w-xl h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-hidden">
            <div className="space-y-5 flex-1 overflow-y-auto pr-1">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold uppercase">
                      Dean Admissions Deck
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {tuitionRequestsList.filter((r) => r.status === "pending").length} Pending
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-black dark:text-white">
                    Tuition Admissions &amp; Chamber Passes
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Review and verify student requests for specialized chamber admission and mentoring.
                  </p>
                </div>
                <button
                  onClick={() => setShowTuitionRequestsDrawer(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2">
                {[
                  { id: "pending", label: `Pending Review (${tuitionRequestsList.filter((r) => r.status === "pending").length})` },
                  { id: "approved", label: `Approved Scholars (${tuitionRequestsList.filter((r) => r.status === "approved").length})` },
                  { id: "all", label: `All Requests (${tuitionRequestsList.length})` },
                ].map((tab) => {
                  const isActive = tuitionFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setTuitionFilter(tab.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-amber-500 text-black shadow-xs font-extrabold"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Requests List */}
              {(() => {
                const filtered = tuitionRequestsList.filter((r) => {
                  if (tuitionFilter === "all") return true;
                  return r.status === tuitionFilter;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-20 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-black dark:text-white">
                          No {tuitionFilter === "pending" ? "pending" : ""} tuition requests
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                          {tuitionFilter === "pending"
                            ? "All scholar admissions across your chambers have been reviewed."
                            : "Tuition admission requests will populate here when scholars apply."}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3.5">
                    {filtered.map((req) => (
                      <div
                        key={req.id}
                        className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-black dark:text-white">
                                {req.studentName}
                              </h4>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                {req.studentCode}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500">{req.studentEmail}</p>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              req.status === "approved"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : req.status === "rejected"
                                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse"
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between font-mono text-[11px]">
                            <span className="text-zinc-500">Target Curriculum:</span>
                            <span className="text-amber-500 font-bold">{req.targetExam}</span>
                          </div>
                          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                            &quot;{req.reason}&quot;
                          </p>
                        </div>

                        {req.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              disabled={isReviewingTuitionId === req.id}
                              onClick={() => handleDeclineTuition(req.id)}
                              className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Decline
                            </button>
                            <button
                              disabled={isReviewingTuitionId === req.id}
                              onClick={() => handleApproveTuition(req.id)}
                              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isReviewingTuitionId === req.id ? "Issuing Pass..." : "Approve Admission"}</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-zinc-400">
                            <span>Reviewed by {req.reviewedBy || "Prof. Dr. Rajesh Varma"}</span>
                            <span>{req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : "Reviewed"}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-right">
              <button
                onClick={() => setShowTuitionRequestsDrawer(false)}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer transition-colors"
              >
                Close Admissions Deck
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE LESSON PLAN MODAL */}
      {showCreateLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4">
            <button onClick={() => setShowCreateLessonModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase">Lesson Planner</span>
              <h3 className="text-lg font-bold mt-1">New Chapter Plan</h3>
            </div>
            <form onSubmit={handleCreateLessonPlan} className="space-y-3">
              <input
                type="text"
                required
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                placeholder="Chapter Title * (e.g. Article 32 & Writ Remedies)"
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newLessonUnit}
                  onChange={(e) => setNewLessonUnit(e.target.value)}
                  placeholder="Unit Number"
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
                />
                <input
                  type="text"
                  value={newLessonHours}
                  onChange={(e) => setNewLessonHours(e.target.value)}
                  placeholder="Estimated Hours"
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
                />
              </div>
              <input
                type="text"
                value={newLessonSession}
                onChange={(e) => setNewLessonSession(e.target.value)}
                placeholder="First Session Title"
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
              <textarea
                rows={3}
                value={newLessonObjectives}
                onChange={(e) => setNewLessonObjectives(e.target.value)}
                placeholder="Learning Objectives & Landmark Precedents..."
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs uppercase cursor-pointer">
                Save Lesson Plan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD LEARNING MATERIAL MODAL */}
      {showUploadResourceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4">
            <button onClick={() => setShowUploadResourceModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase">Content Publishing</span>
              <h3 className="text-lg font-bold mt-1">Upload Learning Material &amp; Slides</h3>
            </div>
            <form onSubmit={handleCreateUploadResource} className="space-y-3">
              <input
                type="text"
                required
                value={newResTitle}
                onChange={(e) => setNewResTitle(e.target.value)}
                placeholder="Material Title * (e.g. BNS 2023 Comparison Matrix)"
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
              <select
                value={newResCategory}
                onChange={(e) => setNewResCategory(e.target.value)}
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              >
                <option>Lecture Slides (PPT)</option>
                <option>Study Notes &amp; Handouts</option>
                <option>Textbook &amp; Reading Chapter</option>
                <option>Worksheet / Problem Set</option>
                <option>Syllabus &amp; Course Guide</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                {(["published", "draft"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setNewResStatus(st)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize cursor-pointer ${
                      newResStatus === st ? "bg-amber-500 text-black font-extrabold" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs uppercase cursor-pointer">
                Publish Material
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CLASS SECTION / BATCH MODAL */}
      {showCreateBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4">
            <button onClick={() => setShowCreateBatchModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase">Cohort Builder</span>
              <h3 className="text-lg font-bold mt-1">Create New Class / Section</h3>
            </div>
            <form onSubmit={handleCreateBatch} className="space-y-3">
              <input
                type="text"
                required
                value={newBatchTitle}
                onChange={(e) => setNewBatchTitle(e.target.value)}
                placeholder="Batch / Section Title * (e.g. CLAT 2027 Morning Cohort)"
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
              <select
                value={newBatchExam}
                onChange={(e) => setNewBatchExam(e.target.value)}
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              >
                <option>CLAT 2027 (NLUs)</option>
                <option>Distance LL.B (IGNOU)</option>
                <option>KLEE 2027 (Kerala)</option>
                <option>Judicial Services</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newBatchSchedule}
                  onChange={(e) => setNewBatchSchedule(e.target.value)}
                  placeholder="Schedule"
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
                />
                <input
                  type="number"
                  value={newBatchPrice}
                  onChange={(e) => setNewBatchPrice(e.target.value)}
                  placeholder="Fee (INR)"
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
                />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs uppercase cursor-pointer">
                Create Class Section
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Persistent Bottom-Right Faculty AI Copilot */}
      <FacultyAiCopilot department={selectedDepartment} subject={selectedSubject} />

      {/* Real-time Academy WebSocket Live Push Notifications */}
      <AcademyLiveToast
        toast={liveToast}
        onDismiss={dismissToast}
        isConnected={isAcademyWsConnected}
      />

      {/* Real-time WebRTC Live Class Broadcast Chamber */}
      <AcademyLiveChamberModal
        isOpen={showTeacherLiveChamber}
        onClose={() => {
          setShowTeacherLiveChamber(false);
          setLiveClassStarted(false);
        }}
        roomId={`batch_${selectedBatchForClass.toLowerCase().replace(/[^a-z0-9]/g, "_")}`}
        roomTitle={selectedBatchForClass}
        topic={liveClassTopic}
        mentorName={teacherProfile.fullName || "Prof. Rajesh Varma (Lead Faculty)"}
        userName={teacherProfile.fullName || "Prof. Rajesh Varma"}
        userRole="faculty"
        isBroadcaster={true}
      />
    </div>
  );
}
