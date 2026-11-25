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
  Flag,
  ChevronLeft,
  XCircle,
  AlertTriangle,
  Eye,
  BarChart3,
  Edit3,
  Save,
  Printer,
  ExternalLink,
  Feather,
  SearchX,
  ListFilter,
  Headphones,
  VolumeX,
  Gavel,
  ShieldAlert,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LawBook,
  getStoredBooks,
  syncBooksWithServer,
  incrementDownloadCount,
  downloadBookFile,
} from "./booksData";
import {
  HomeworkAssignment,
  HomeworkSubmission,
  getStoredAssignments,
  getStoredSubmissions,
  syncAssignmentsWithServer,
  syncSubmissionsWithServer,
  submitHomework,
  downloadSubmissionFile,
} from "./homeworkData";
import {
  CornellNote,
  CornellTemplate,
  CORNELL_TEMPLATES,
  getStoredCornellNotes,
  syncNotesWithServer,
  saveCornellNote,
  deleteCornellNote,
  toggleBookmarkCornellNote,
  exportCornellNoteAsTxt,
  exportCornellNoteAsHtml,
} from "./cornellNotesData";
import {
  LectureAudio,
  getStoredLectures,
  syncLecturesWithServer,
  incrementListenCount,
  downloadLectureAudio,
  generateSyntheticWavDataUri,
} from "./lectureAudioData";
import {
  CourtroomZoneInfo,
  COURTROOM_ZONES,
  ObjectionDrillItem,
  OBJECTION_DRILLS,
  MootCourtCase,
  MOOT_CASES,
  playGavelSound,
  getMootHistory,
  syncMootHistoryWithServer,
  saveMootRecord,
  getDrillStats,
  updateDrillStats,
  MootHistoryRecord,
  DrillScoreStats,
} from "./courtroomLabData";
import { useAcademyWebSocket } from "@/hooks/useAcademyWebSocket";
import { AcademyLiveToast } from "./AcademyLiveToast";
import { AcademyLiveChamberModal } from "./AcademyLiveChamberModal";
import academyApi, { LawCourse } from "../../lib/academyApi";

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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true); // Expanded by default so all 17 items are visible matching Wakheel
  const [activeLearnCourseId, setActiveLearnCourseId] = useState<string>("ai_legal_tech");
  const [learnActiveTab, setLearnActiveTab] = useState<"syllabus" | "resources" | "quizzes">("syllabus");

  // ==============================================================
  // Wakheel 3-PANE "LEARN" SECTION SUB-NAVIGATION & STUDIO STATE
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
  // Wakheel NEW STUDENT FEATURES STATE (RECORD, NOTEBOOK, UPLOADS, ETC)
  // ==============================================================
  // 1. Audio / Video Recording Studio & Faculty Audio Player (Option 6)
  const [recordMode, setRecordMode] = useState<"audio" | "video">("audio");
  const [audioStudioTab, setAudioStudioTab] = useState<"lectures" | "moot_practice">("lectures");
  const [facultyLectures, setFacultyLectures] = useState<LectureAudio[]>([]);
  const [activePlayingLecture, setActivePlayingLecture] = useState<LectureAudio | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioPlaybackSpeed, setAudioPlaybackSpeed] = useState<number>(1);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioTotalDuration, setAudioTotalDuration] = useState<number>(0);
  const [audioSearchFilter, setAudioSearchFilter] = useState<string>("");
  const [audioSubjectFilter, setAudioSubjectFilter] = useState<string>("All");
  const [studentAudioInstance, setStudentAudioInstance] = useState<HTMLAudioElement | null>(null);

  // Student Moot Court Oral Argument Recording State
  const [studentIsRecording, setStudentIsRecording] = useState<boolean>(false);
  const [studentIsPaused, setStudentIsPaused] = useState<boolean>(false);
  const [studentRecordSeconds, setStudentRecordSeconds] = useState<number>(0);
  const [studentWaveformLevels, setStudentWaveformLevels] = useState<number[]>([15, 28, 45, 60, 35, 20, 55, 75, 65, 42, 28, 50, 68, 85, 52, 32, 70, 88, 42, 22]);
  const [studentMootTopic, setStudentMootTopic] = useState<string>("Oral Submission: Article 19(1)(a) Free Expression in Cyber Space");
  const [studentMootDept, setStudentMootDept] = useState<string>("Constitutional Law");
  const [studentSavedRecordings, setStudentSavedRecordings] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const s = localStorage.getItem("wakheel_student_recordings");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [recordingSavedNotice, setRecordingSavedNotice] = useState<boolean>(false);

  // 2. Cornell Revision Notebook & Case Brief Studio (Option 5)
  const [studentNotes, setStudentNotes] = useState<CornellNote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");
  const [notesSearchQuery, setNotesSearchQuery] = useState<string>("");
  const [notesSubjectFilter, setNotesSubjectFilter] = useState<string>("All");
  const [notesFilterTab, setNotesFilterTab] = useState<"all" | "bookmarked" | "faculty">("all");
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const [activeEditNote, setActiveEditNote] = useState<CornellNote | null>(null);
  const [saveStatusNotice, setSaveStatusNotice] = useState<string>("");
  const [newCueTag, setNewCueTag] = useState<string>("");
  const [newStatuteTag, setNewStatuteTag] = useState<string>("");
  const [newCaseTag, setNewCaseTag] = useState<string>("");

  // New Cornell Note Modal state
  const [showAddNoteModal, setShowAddNoteModal] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tpl_case_brief");
  const [newNoteTitle, setNewNoteTitle] = useState<string>("");
  const [newNoteSubject, setNewNoteSubject] = useState<string>("Constitutional Law");
  const [newNoteTopic, setNewNoteTopic] = useState<string>("");
  const [newNoteCues, setNewNoteCues] = useState<string[]>([]);
  const [newNoteContent, setNewNoteContent] = useState<string>("");
  const [newNoteSummary, setNewNoteSummary] = useState<string>("");
  const [newNoteStatutes, setNewNoteStatutes] = useState<string[]>([]);
  const [newNoteCases, setNewNoteCases] = useState<string[]>([]);
  const [modalCueInput, setModalCueInput] = useState<string>("");
  const [modalStatuteInput, setModalStatuteInput] = useState<string>("");
  const [modalCaseInput, setModalCaseInput] = useState<string>("");

  // 3. Document Upload Portal
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const s = localStorage.getItem("wakheel_student_uploads");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [uploadCategory, setUploadCategory] = useState("Case Brief Submission");
  const [uploadSuccessAlert, setUploadSuccessAlert] = useState(false);

  // ==============================================================
  // 4. HOMEWORK & CASE BRIEF SUBMISSION TRACKER (OPTION 4)
  // ==============================================================
  const [homeworkTab, setHomeworkTab] = useState<"pending" | "completed">("pending");
  const [assignmentsList, setAssignmentsList] = useState<HomeworkAssignment[]>([]);
  const [submissionsList, setSubmissionsList] = useState<HomeworkSubmission[]>([]);
  const [activeAssignmentForSubmission, setActiveAssignmentForSubmission] = useState<HomeworkAssignment | null>(null);
  const [selectedSubmissionForViewing, setSelectedSubmissionForViewing] = useState<HomeworkSubmission | null>(null);
  const [subIssues, setSubIssues] = useState("");
  const [subPleadings, setSubPleadings] = useState("");
  const [subPrayer, setSubPrayer] = useState("");
  const [subAttachmentName, setSubAttachmentName] = useState("");
  const [subSuccess, setSubSuccess] = useState(false);

  useEffect(() => {
    setAssignmentsList(getStoredAssignments());
    setSubmissionsList(getStoredSubmissions());
    const initialNotes = getStoredCornellNotes();
    setStudentNotes(initialNotes);
    if (initialNotes.length > 0) {
      setSelectedNoteId(initialNotes[0].id);
      setActiveEditNote({ ...initialNotes[0] });
    }
    const initialLecs = getStoredLectures();
    setFacultyLectures(initialLecs);
    if (initialLecs.length > 0) {
      setActivePlayingLecture(initialLecs[0]);
    }

    // Background server synchronization
    syncAssignmentsWithServer().then((data) => {
      if (data && data.length > 0) setAssignmentsList(data);
    });
    syncSubmissionsWithServer().then((data) => {
      if (data && data.length > 0) setSubmissionsList(data);
    });
    syncNotesWithServer().then((data) => {
      if (data && data.length > 0) setStudentNotes(data);
    });
    syncLecturesWithServer().then((data) => {
      if (data && data.length > 0) setFacultyLectures(data);
    });

    const handleSync = () => {
      setAssignmentsList(getStoredAssignments());
      setSubmissionsList(getStoredSubmissions());
      const refreshedNotes = getStoredCornellNotes();
      setStudentNotes(refreshedNotes);
      setFacultyLectures(getStoredLectures());
    };
    window.addEventListener("storage", handleSync);
    return () => window.removeEventListener("storage", handleSync);
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (studentIsRecording && !studentIsPaused) {
      interval = setInterval(() => {
        setStudentRecordSeconds((prev) => prev + 1);
        setStudentWaveformLevels((prev) =>
          prev.map(() => Math.floor(Math.random() * 75) + 15)
        );
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [studentIsRecording, studentIsPaused]);

  // Audio Player Handlers (Option 6)
  const handleTogglePlayStudentLecture = (lecture: LectureAudio) => {
    if (activePlayingLecture?.id === lecture.id && isPlayingAudio) {
      if (studentAudioInstance) {
        studentAudioInstance.pause();
      }
      setIsPlayingAudio(false);
      return;
    }

    if (studentAudioInstance) {
      studentAudioInstance.pause();
    }

    const audio = new Audio(lecture.audioUrl || generateSyntheticWavDataUri(10, 440));
    audio.playbackRate = audioPlaybackSpeed;
    audio.play();
    setActivePlayingLecture(lecture);
    setIsPlayingAudio(true);
    setStudentAudioInstance(audio);

    // Increment listen count
    const updated = incrementListenCount(lecture.id);
    setFacultyLectures(updated);

    audio.ontimeupdate = () => {
      setAudioCurrentTime(audio.currentTime);
      setAudioTotalDuration(audio.duration || lecture.durationSeconds);
    };

    audio.onended = () => {
      setIsPlayingAudio(false);
      setAudioCurrentTime(0);
    };
  };

  const handleSeekAudio = (newTime: number) => {
    if (studentAudioInstance) {
      studentAudioInstance.currentTime = newTime;
      setAudioCurrentTime(newTime);
    }
  };

  const handleChangePlaybackSpeed = (speed: number) => {
    setAudioPlaybackSpeed(speed);
    if (studentAudioInstance) {
      studentAudioInstance.playbackRate = speed;
    }
  };

  const handleSaveStudentOralRecording = () => {
    setStudentIsRecording(false);
    setStudentIsPaused(false);
    const durationMins = Math.floor(studentRecordSeconds / 60);
    const durationSecs = studentRecordSeconds % 60;
    const durStr = `${durationMins.toString().padStart(2, "0")}:${durationSecs.toString().padStart(2, "0")}`;
    const newMoot = {
      id: `moot_${Date.now()}`,
      title: studentMootTopic.trim() || "Oral Defense Practice Argument",
      subject: studentMootDept,
      duration: durStr || "02:15",
      date: "Just now",
      score: "9.4/10 AI Oral Articulation",
      audioUrl: generateSyntheticWavDataUri(Math.min(10, Math.max(4, studentRecordSeconds)), 460),
    };
    const updatedRecordings = [newMoot, ...studentSavedRecordings];
    setStudentSavedRecordings(updatedRecordings);
    try {
      localStorage.setItem("wakheel_student_recordings", JSON.stringify(updatedRecordings));
    } catch {}
    setRecordingSavedNotice(true);
    setTimeout(() => {
      setRecordingSavedNotice(false);
      setStudentRecordSeconds(0);
    }, 2000);
  };

  // Cornell Notebook Handlers (Option 5)
  const handleSelectNote = (note: CornellNote) => {
    setSelectedNoteId(note.id);
    setActiveEditNote({ ...note });
    setIsEditingNote(false);
    setNewCueTag("");
    setNewStatuteTag("");
    setNewCaseTag("");
    setSaveStatusNotice("");
  };

  const handleSaveActiveNote = () => {
    if (!activeEditNote) return;
    const updated = saveCornellNote(activeEditNote);
    setStudentNotes(updated);
    setSaveStatusNotice("✓ Saved to Chambers Archive");
    setTimeout(() => setSaveStatusNotice(""), 3000);
  };

  const handleDeleteActiveNote = (id: string) => {
    if (typeof window !== "undefined" && !window.confirm("Are you sure you want to permanently delete this Cornell Note from your research archives?")) {
      return;
    }
    const updated = deleteCornellNote(id);
    setStudentNotes(updated);
    if (updated.length > 0) {
      setSelectedNoteId(updated[0].id);
      setActiveEditNote({ ...updated[0] });
    } else {
      setSelectedNoteId("");
      setActiveEditNote(null);
    }
    setIsEditingNote(false);
  };

  const handleToggleCornellBookmark = (id: string) => {
    const updated = toggleBookmarkCornellNote(id);
    setStudentNotes(updated);
    if (activeEditNote && activeEditNote.id === id) {
      setActiveEditNote({ ...activeEditNote, isBookmarked: !activeEditNote.isBookmarked });
    }
  };

  const handleAddCueTagToActive = () => {
    if (!activeEditNote || !newCueTag.trim()) return;
    const updatedCues = [...activeEditNote.cues, newCueTag.trim()];
    const updatedNote = { ...activeEditNote, cues: updatedCues };
    setActiveEditNote(updatedNote);
    saveCornellNote(updatedNote);
    setStudentNotes(getStoredCornellNotes());
    setNewCueTag("");
  };

  const handleRemoveCueTagFromActive = (index: number) => {
    if (!activeEditNote) return;
    const updatedCues = activeEditNote.cues.filter((_, i) => i !== index);
    const updatedNote = { ...activeEditNote, cues: updatedCues };
    setActiveEditNote(updatedNote);
    saveCornellNote(updatedNote);
    setStudentNotes(getStoredCornellNotes());
  };

  const handleAddStatuteToActive = () => {
    if (!activeEditNote || !newStatuteTag.trim()) return;
    const updatedStatutes = [...activeEditNote.statutoryReferences, newStatuteTag.trim()];
    const updatedNote = { ...activeEditNote, statutoryReferences: updatedStatutes };
    setActiveEditNote(updatedNote);
    saveCornellNote(updatedNote);
    setStudentNotes(getStoredCornellNotes());
    setNewStatuteTag("");
  };

  const handleRemoveStatuteFromActive = (index: number) => {
    if (!activeEditNote) return;
    const updatedStatutes = activeEditNote.statutoryReferences.filter((_, i) => i !== index);
    const updatedNote = { ...activeEditNote, statutoryReferences: updatedStatutes };
    setActiveEditNote(updatedNote);
    saveCornellNote(updatedNote);
    setStudentNotes(getStoredCornellNotes());
  };

  const handleAddCaseToActive = () => {
    if (!activeEditNote || !newCaseTag.trim()) return;
    const updatedCases = [...activeEditNote.landmarkCases, newCaseTag.trim()];
    const updatedNote = { ...activeEditNote, landmarkCases: updatedCases };
    setActiveEditNote(updatedNote);
    saveCornellNote(updatedNote);
    setStudentNotes(getStoredCornellNotes());
    setNewCaseTag("");
  };

  const handleRemoveCaseFromActive = (index: number) => {
    if (!activeEditNote) return;
    const updatedCases = activeEditNote.landmarkCases.filter((_, i) => i !== index);
    const updatedNote = { ...activeEditNote, landmarkCases: updatedCases };
    setActiveEditNote(updatedNote);
    saveCornellNote(updatedNote);
    setStudentNotes(getStoredCornellNotes());
  };

  const handleApplyTemplateToNewModal = (template: CornellTemplate) => {
    setSelectedTemplateId(template.id);
    setNewNoteTitle(template.sampleTitle);
    setNewNoteSubject(template.subject);
    setNewNoteTopic(template.name);
    setNewNoteCues([...template.initialCues]);
    setNewNoteContent(template.initialContent);
    setNewNoteSummary(template.initialSummary);
    setNewNoteStatutes([...template.initialStatutes]);
    setNewNoteCases([...template.initialCases]);
  };

  const handleOpenAddNoteModal = () => {
    const firstTpl = CORNELL_TEMPLATES[0];
    handleApplyTemplateToNewModal(firstTpl);
    setShowAddNoteModal(true);
  };

  const handleCreateCornellNoteFromModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    const newNote: CornellNote = {
      id: `note_${Date.now()}`,
      title: newNoteTitle.trim(),
      subject: newNoteSubject,
      topic: newNoteTopic.trim() || "Core Appellate Jurisprudence",
      cues: newNoteCues.length > 0 ? newNoteCues : ["Statutory Anchor", "Ratio Decidendi", "Exceptions"],
      content: newNoteContent.trim() || "Author legal analysis, statutory formulation, and appellate facts here...",
      summary: newNoteSummary.trim() || "Executive ratio decidendi synthesizing statutory interpretation.",
      statutoryReferences: newNoteStatutes,
      landmarkCases: newNoteCases,
      isBookmarked: false,
      isFacultyShared: false,
      author: `${studentProfile.fullName} (Student)`,
      lastEdited: "Just now",
      tags: ["Student Research"],
    };

    const updated = saveCornellNote(newNote);
    setStudentNotes(updated);
    setSelectedNoteId(newNote.id);
    setActiveEditNote({ ...newNote });
    setIsEditingNote(false);
    setShowAddNoteModal(false);
  };

  const handleStudentSubmitHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignmentForSubmission || !subPleadings.trim()) return;

    const newSubmission: HomeworkSubmission = {
      id: `sub_${Date.now()}`,
      assignmentId: activeAssignmentForSubmission.id,
      assignmentTitle: activeAssignmentForSubmission.title,
      studentName: studentProfile.fullName,
      studentEmail: studentProfile.email,
      submittedDate: "Today, " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      issuesRaised: subIssues.trim() || "1. Procedural due process and statutory compliance under relevant legal provisions.",
      submissionText: subPleadings.trim(),
      prayerOrConclusion: subPrayer.trim() || "Wherefore, in the interest of justice, it is most respectfully prayed that appropriate relief be granted.",
      attachmentName: subAttachmentName || undefined,
      status: "Pending Evaluation",
    };

    const updated = submitHomework(newSubmission);
    setSubmissionsList(updated);
    setSubSuccess(true);
    setTimeout(() => {
      setSubSuccess(false);
      setActiveAssignmentForSubmission(null);
      setSubIssues("");
      setSubPleadings("");
      setSubPrayer("");
      setSubAttachmentName("");
      setHomeworkTab("completed");
    }, 1200);
  };

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
      cover: "from-zinc-900 via-amber-600/30 to-black",
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

  // 7. Option 7: 3D Courtroom Simulation Lab & Moot Studio State
  const [courtroomSubTab, setCourtroomSubTab] = useState<"spatial_3d" | "moot_sim" | "objection_drill" | "protocol">("spatial_3d");
  const [active3dZone, setActive3dZone] = useState<"bench" | "petitioner" | "respondent" | "witness" | "steno" | "gallery">("bench");
  const [selectedHotspot, setSelectedHotspot] = useState<{ title: string; description: string; citation: string } | null>(null);
  const [cameraPerspectiveMode, setCameraPerspectiveMode] = useState<"isometric" | "fpv">("isometric");

  // Moot Simulation State
  const [activeMootCase, setActiveMootCase] = useState<MootCourtCase>(MOOT_CASES[0]);
  const [isMootSessionActive, setIsMootSessionActive] = useState<boolean>(false);
  const [mootCurrentStepIdx, setMootCurrentStepIdx] = useState<number>(0);
  const [mootScore, setMootScore] = useState<number>(0);
  const [mootElapsedSeconds, setMootElapsedSeconds] = useState<number>(0);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [mootStepFeedback, setMootStepFeedback] = useState<{
    quality: string;
    scoreDelta: number;
    judgeResponse: string;
    feedback: string;
  } | null>(null);
  const [mootCompleted, setMootCompleted] = useState<boolean>(false);
  const [mootHistoryList, setMootHistoryList] = useState<MootHistoryRecord[]>([]);

  // Objection Reflex Drill State
  const [drillIndex, setDrillIndex] = useState<number>(0);
  const [drillSelectedOptionIdx, setDrillSelectedOptionIdx] = useState<number | null>(null);
  const [drillAnswered, setDrillAnswered] = useState<boolean>(false);
  const [drillStreak, setDrillStreak] = useState<number>(0);
  const [drillStats, setDrillStats] = useState<DrillScoreStats>({ totalAttempts: 12, correctAnswers: 10, accuracyRate: 83, lastUpdated: "Nov 23, 2026" });
  const [drillCountdown, setDrillCountdown] = useState<number>(10);

  // Moot & Drill storage load
  useEffect(() => {
    setMootHistoryList(getMootHistory());
    setDrillStats(getDrillStats());
    syncMootHistoryWithServer().then((records) => {
      if (records && records.length > 0) setMootHistoryList(records);
    });
  }, []);

  // Moot session elapsed timer
  useEffect(() => {
    let timer: any = null;
    if (isMootSessionActive && !mootCompleted) {
      timer = setInterval(() => {
        setMootElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isMootSessionActive, mootCompleted]);

  // Drill countdown timer
  useEffect(() => {
    let timer: any = null;
    if (courtroomSubTab === "objection_drill" && !drillAnswered && drillCountdown > 0) {
      timer = setInterval(() => {
        setDrillCountdown((prev) => {
          if (prev <= 1) {
            setDrillAnswered(true);
            setDrillStreak(0);
            updateDrillStats(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [courtroomSubTab, drillAnswered, drillCountdown]);

  const handleStartMootSession = (mootCase: MootCourtCase) => {
    setActiveMootCase(mootCase);
    setIsMootSessionActive(true);
    setMootCurrentStepIdx(0);
    setMootScore(0);
    setMootElapsedSeconds(0);
    setSelectedChoiceIdx(null);
    setMootStepFeedback(null);
    setMootCompleted(false);
    playGavelSound();
  };

  const handleSelectMootChoice = (choiceIdx: number) => {
    if (selectedChoiceIdx !== null) return;
    const choice = activeMootCase.steps[mootCurrentStepIdx].choices[choiceIdx];
    setSelectedChoiceIdx(choiceIdx);
    setMootScore((prev) => prev + choice.scoreDelta);
    setMootStepFeedback(choice);
    if (choice.quality === "Flawed") {
      playGavelSound();
    }
  };

  const handleNextMootStep = () => {
    if (mootCurrentStepIdx + 1 < activeMootCase.steps.length) {
      setMootCurrentStepIdx((prev) => prev + 1);
      setSelectedChoiceIdx(null);
      setMootStepFeedback(null);
    } else {
      setMootCompleted(true);
      const totalPossible = activeMootCase.steps.length * 25;
      const pct = Math.round((mootScore / Math.max(1, totalPossible)) * 100);
      let verdict: "Bench Unanimously Concurs" | "Split 2:1 In Favor" | "Dismissed with Reprimand" =
        pct >= 70 ? "Bench Unanimously Concurs" : pct >= 45 ? "Split 2:1 In Favor" : "Dismissed with Reprimand";
      
      const record: MootHistoryRecord = {
        id: "moot_rec_" + Date.now(),
        caseId: activeMootCase.id,
        caseTitle: activeMootCase.shortTitle,
        totalScore: mootScore,
        maxScore: totalPossible,
        percentage: pct,
        verdict,
        completedDate: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      };
      const updated = saveMootRecord(record);
      setMootHistoryList(updated);
      playGavelSound();
    }
  };

  const handleAnswerDrill = (optionIdx: number) => {
    if (drillAnswered) return;
    setDrillSelectedOptionIdx(optionIdx);
    setDrillAnswered(true);
    const currentDrill = OBJECTION_DRILLS[drillIndex % OBJECTION_DRILLS.length];
    const isCorrect = currentDrill.options[optionIdx].isCorrect;
    playGavelSound();
    if (isCorrect) {
      setDrillStreak((prev) => prev + 1);
    } else {
      setDrillStreak(0);
    }
    const updatedStats = updateDrillStats(isCorrect);
    setDrillStats(updatedStats);
  };

  const handleNextDrill = () => {
    setDrillIndex((prev) => (prev + 1) % OBJECTION_DRILLS.length);
    setDrillSelectedOptionIdx(null);
    setDrillAnswered(false);
    setDrillCountdown(10);
  };

  // 8. Book shelf & Digital Law Reader (Option 3: Faculty Uploads & Student Reading Hub)
  const [booksList, setBooksList] = useState<LawBook[]>([]);
  const [selectedBookForReading, setSelectedBookForReading] = useState<LawBook | null>(null);
  const [readerActiveChapterIdx, setReaderActiveChapterIdx] = useState(0);
  const [readerTheme, setReaderTheme] = useState<"light" | "dark" | "sepia">("light");
  const [readerFontSize, setReaderFontSize] = useState<"sm" | "base" | "lg">("base");
  const [readerSearchTerm, setReaderSearchTerm] = useState("");
  const [bookShelfFilter, setBookShelfFilter] = useState("All");
  const [bookShelfSearch, setBookShelfSearch] = useState("");
  const [downloadedBookIds, setDownloadedBookIds] = useState<Record<string, boolean>>({});
  const [bookmarkedPages, setBookmarkedPages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setBooksList(getStoredBooks());
    syncBooksWithServer().then((books) => {
      if (books && books.length > 0) setBooksList(books);
    });
  }, []);

  const handleStudentDownloadBook = (book: LawBook) => {
    downloadBookFile(book);
    const updated = incrementDownloadCount(book.id);
    setBooksList(updated);
    setDownloadedBookIds((prev) => ({ ...prev, [book.id]: true }));
  };

  const handleOpenBookReader = (book: LawBook, chapterIdx = 0) => {
    setSelectedBookForReading(book);
    setReaderActiveChapterIdx(chapterIdx);
    setReaderSearchTerm("");
  };

  const handleToggleBookmark = (bookId: string, chapterIdx: number) => {
    const key = `${bookId}_ch_${chapterIdx}`;
    setBookmarkedPages((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const bookshelfItems = booksList.map((b) => ({
    id: b.id,
    title: b.title,
    progress: "65%",
    currentPage: 48,
    totalPages: b.totalPages,
    lastRead: "Recent",
    accent: b.coverGradient,
  }));

  // 9. Projects
  const [studentProjects, setStudentProjects] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const s = localStorage.getItem("wakheel_student_projects");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

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

  // Real-Time Academy WebSocket Gateway & Live Push Notifications
  const {
    isConnected: isAcademyWsConnected,
    liveToast,
    dismissToast,
  } = useAcademyWebSocket({
    role: "student",
    userId: studentProfile.email || "scholar_ashok",
    autoSync: true,
    onNewAssignment: () => {
      setAssignmentsList(getStoredAssignments());
    },
    onSubmissionGraded: () => {
      setSubmissionsList(getStoredSubmissions());
    },
    onNewLecture: () => {
      setFacultyLectures(getStoredLectures());
    },
    onNewBook: () => {
      setBooksList(getStoredBooks());
    },
  });

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

  // Live CBT Mock Simulator State (Option 2: 120-Min Consortium CBT Mock Engine)
  const [activeMockTest, setActiveMockTest] = useState<any | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [mockScore, setMockScore] = useState<number | null>(null);
  const [cbtActive, setCbtActive] = useState<boolean>(false);
  const [cbtActiveSectionTab, setCbtActiveSectionTab] = useState<"legal" | "gk" | "english" | "logical" | "quant">("legal");
  const [cbtCurrentQuestionIndex, setCbtCurrentQuestionIndex] = useState(0);
  const [cbtSelectedAnswers, setCbtSelectedAnswers] = useState<Record<number, number>>({});
  const [cbtMarkedForReview, setCbtMarkedForReview] = useState<Record<number, boolean>>({});
  const [cbtVisitedQuestions, setCbtVisitedQuestions] = useState<Record<number, boolean>>({ 0: true });
  const [cbtTimeRemaining, setCbtTimeRemaining] = useState(7200); // 120 mins (7200 seconds)
  const [cbtIsTimerRunning, setCbtIsTimerRunning] = useState(true);
  const [cbtIsSubmitted, setCbtIsSubmitted] = useState(false);
  const [cbtShowConfirmModal, setCbtShowConfirmModal] = useState(false);
  const [cbtPassageFontSize, setCbtPassageFontSize] = useState<"sm" | "base" | "lg">("sm");
  const [cbtReviewFilter, setCbtReviewFilter] = useState<"all" | "correct" | "incorrect" | "unattempted" | "marked">("all");
  const [showCbtGuidelinesModal, setShowCbtGuidelinesModal] = useState(false);

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
  // Wakheel HYBRID APPLICATION FEATURES STATE
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
      text: "Namaste Advithya! I am your Wakheel Legal Copilot (v2.5).\n\nI specialize in CLAT/KLEE legal aptitude drills, Bharatiya Nyaya Sanhita (BNS 2023) statutory concordance, and landmark Supreme Court & High Court ratio decidendi.",
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

  // 7. Real-Time WebRTC Live Tuition Chamber Modal State
  const [liveChamberModal, setLiveChamberModal] = useState<{
    isOpen: boolean;
    roomId: string;
    roomTitle: string;
    topic: string;
    mentorName: string;
  }>({
    isOpen: false,
    roomId: "tuition_chamber_alpha",
    roomTitle: "Constitutional Bench Chamber",
    topic: "Basic Structure & Article 368 Judicial Limits",
    mentorName: "Prof. Dr. Rajesh Varma",
  });

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

  // Exam Filters matching Wakheel category row
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
  // DYNAMIC MASTERCLASS COURSES & CURRICULA (API & LocalStorage)
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
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(false);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const s = localStorage.getItem("wakheel_enrolled_courses");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // Sync courses from backend API on mount
  useEffect(() => {
    let isMounted = true;
    async function loadAcademyCourses() {
      try {
        setIsLoadingCourses(true);
        const res = await academyApi.getCourses();
        if (isMounted && res.success && Array.isArray(res.courses)) {
          setCoursesList(res.courses);
          try {
            localStorage.setItem("wakheel_academy_courses", JSON.stringify(res.courses));
          } catch {}
        }
      } catch (err) {
        console.warn("Failed to load courses from API:", err);
      } finally {
        if (isMounted) setIsLoadingCourses(false);
      }
    }
    loadAcademyCourses();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleEnrollCourse = (courseId: string) => {
    const next = enrolledCourseIds.includes(courseId)
      ? enrolledCourseIds.filter((id) => id !== courseId)
      : [...enrolledCourseIds, courseId];
    setEnrolledCourseIds(next);
    try {
      localStorage.setItem("wakheel_enrolled_courses", JSON.stringify(next));
    } catch {}
  };

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
  const [bookmarkedItems, setBookmarkedItems] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const s = localStorage.getItem("wakheel_student_bookmarks");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // ==============================================================
  // Wakheel LEARN SECTION DATA (11 SUB-SECTIONS, 6 SUBJECTS, 12 TOOLS)
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
      categoryColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      title: "Deductive Legal Aptitude Drills",
      chapters: 4,
      lessons: 14,
      badge: "CLAT Core Pattern",
      accent: "from-amber-600 to-zinc-900",
      courseRefId: "ai_legal_tech",
      colorTag: "amber",
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
      categoryColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      title: "Law of Contracts & Tortious Liability",
      chapters: 3,
      lessons: 12,
      badge: "1st Year LL.B Core",
      accent: "from-amber-500 to-amber-700",
      courseRefId: "ai_legal_tech",
      colorTag: "amber",
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

  // ==============================================================
  // OPTION 2: 120-MINUTE CONSORTIUM CLAT CBT MOCK EXAM DATASET
  // ==============================================================
  const cbtSections = [
    { id: "legal" as const, label: "Legal Reasoning", count: 5, targetTime: "35 mins", color: "amber" },
    { id: "gk" as const, label: "Current Affairs & GK", count: 3, targetTime: "15 mins", color: "amber" },
    { id: "english" as const, label: "English Language", count: 2, targetTime: "20 mins", color: "emerald" },
    { id: "logical" as const, label: "Logical Reasoning", count: 2, targetTime: "25 mins", color: "purple" },
    { id: "quant" as const, label: "Quantitative Techniques", count: 2, targetTime: "25 mins", color: "rose" },
  ];

  interface CbtQuestionItem {
    id: number;
    section: "legal" | "gk" | "english" | "logical" | "quant";
    sectionTitle: string;
    passageId: string;
    passageTitle: string;
    passageText: string;
    passageCitation: string;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
    legalRatio: string;
  }

  const cbtQuestions: CbtQuestionItem[] = [
    {
      id: 0,
      section: "legal",
      sectionTitle: "Legal Reasoning",
      passageId: "legal_p1",
      passageTitle: "Passage 1: Bharatiya Nyaya Sanhita (BNS) 2023, Section 69 — Deceitful Means vs Breach of Promise",
      passageCitation: "BNS 2023 § 69; Pramod Suryabhoop Pawar v. State of Maharashtra (2019) 9 SCC 608",
      passageText: "Section 69 of the Bharatiya Nyaya Sanhita, 2023 penalizes sexual intercourse by employing deceitful means or making a false promise to marry, punishable with imprisonment up to ten years. The provision statutorily distinguishes between a breach of promise (which arises when a person genuinely intends to marry at the inception of the relationship but subsequently fails or is unable to fulfill the promise due to unforeseen circumstances or familial opposition) and a false promise to marry made with mala fide intention from the very beginning to obtain sexual consent. The Explanation to Section 69 clarifies that 'deceitful means' includes the false promise of employment or promotion, inducement, or marrying after suppressing one's true identity. The Supreme Court in various precedents has affirmed that to constitute an offence under such provisions, the false promise must have been the direct catalyst and decisive reason for obtaining consent, and the perpetrator must have had no intention of marrying the victim at the time the representation was made.",
      question: "A and B met in law school in 2022 and mutually agreed to marry. A introduced B to his parents, who initially approved. In 2024, after two years of a consensual intimate relationship, A's parents discovered caste incompatibility and threatened self-harm, causing A to call off the marriage. B lodges an FIR under Section 69 BNS alleging deceitful inducement. Determine A's criminal liability.",
      options: [
        "A is guilty under Section 69 BNS because failure to marry after entering an intimate relationship is an absolute statutory offence.",
        "A is not guilty under Section 69 BNS because A had a genuine intention to marry at the inception; subsequent inability to fulfill the promise due to parental opposition constitutes a breach of promise, not fraudulent inducement.",
        "A is guilty because caste considerations are unconstitutional under Article 15 and cannot serve as an excuse in criminal law.",
        "A is liable for civil breach of contract only under Section 73 of the Indian Contract Act."
      ],
      correct: 1,
      explanation: "Under established Supreme Court jurisprudence (Pramod Suryabhoop Pawar and the statutory Explanation to Section 69 BNS), there is a sharp demarcation between a false promise made with dishonest intent from inception (deceit) and a subsequent inability to marry due to intervening circumstances (breach of promise). Since A harbored genuine intent when the relationship commenced, Section 69 is not attracted.",
      legalRatio: "Deceitful promise requires fraudulent intent ab initio; subsequent breach due to supervening factors does not constitute an offence under S. 69 BNS."
    },
    {
      id: 1,
      section: "legal",
      sectionTitle: "Legal Reasoning",
      passageId: "legal_p1",
      passageTitle: "Passage 1: Bharatiya Nyaya Sanhita (BNS) 2023, Section 69 — Deceitful Means vs Breach of Promise",
      passageCitation: "BNS 2023 § 69; Anurag Soni v. State of Chhattisgarh (2019) 10 SCC 660",
      passageText: "Section 69 of the Bharatiya Nyaya Sanhita, 2023 penalizes sexual intercourse by employing deceitful means or making a false promise to marry, punishable with imprisonment up to ten years. The provision statutorily distinguishes between a breach of promise (which arises when a person genuinely intends to marry at the inception of the relationship but subsequently fails or is unable to fulfill the promise due to unforeseen circumstances or familial opposition) and a false promise to marry made with mala fide intention from the very beginning to obtain sexual consent. The Explanation to Section 69 clarifies that 'deceitful means' includes the false promise of employment or promotion, inducement, or marrying after suppressing one's true identity. The Supreme Court in various precedents has affirmed that to constitute an offence under such provisions, the false promise must have been the direct catalyst and decisive reason for obtaining consent, and the perpetrator must have had no intention of marrying the victim at the time the representation was made.",
      question: "Rahul, a married corporate executive, suppressed his existing subsisting marriage and promised to marry Priya, a junior associate. Relying upon his assurance and bachelor representation, Priya consented to sexual intercourse. When Priya discovered his marriage certificate, Rahul argued that he genuinely intended to obtain a mutual-consent divorce in the future. Is Rahul liable under Section 69 BNS?",
      options: [
        "No, because Priya failed to exercise reasonable due diligence regarding Rahul's civil marital status before consenting.",
        "Yes, because Rahul suppressed his existing marriage, which squarely falls under 'deceitful means' (suppressing true identity/marital status) under the Explanation to Section 69 BNS.",
        "No, because Section 69 applies exclusively to unmarried men who refuse to solemnize marriage.",
        "No, because adult consensual relationships outside marriage are protected under personal autonomy."
      ],
      correct: 1,
      explanation: "The Explanation to Section 69 BNS explicitly defines 'deceitful means' to include inducement by suppressing one's true identity or marital status. Promising marriage while concealing a legal impediment to marry (an undissolved existing marriage) proves dishonest intent at inception.",
      legalRatio: "Concealment of an existing valid marriage vitiates consent ab initio under the Explanation to Section 69 BNS."
    },
    {
      id: 2,
      section: "legal",
      sectionTitle: "Legal Reasoning",
      passageId: "legal_p2",
      passageTitle: "Passage 2: Constitutional Law & Proportionality Test (Article 21 & Privacy)",
      passageCitation: "Justice K.S. Puttaswamy (Retd.) v. Union of India (2017) 10 SCC 1",
      passageText: "In the landmark nine-judge Constitution Bench decision in Justice K.S. Puttaswamy (Retd.) v. Union of India (2017), the Supreme Court unequivocally recognized the right to privacy as an intrinsic part of the right to life and personal liberty under Article 21. Any state encroachment upon personal privacy must satisfy the rigorous four-fold proportionality test: (1) Legality: The measure must have an express legislative basis (a valid law, not merely an executive order); (2) Legitimate State Aim: The objective must serve a legitimate public interest recognized by the Constitution; (3) Proportionality (Suitability & Necessity): The measure must be rationally connected to the objective, and there must be no less-intrusive alternative available; and (4) Balancing: The impact of the encroachment must not have a disproportionate negative bearing on the individual's fundamental rights.",
      question: "The State Transport Commissioner issues an executive circular mandating that all private shared taxis must install continuous internal 360-degree biometric facial scanners transmitting live footage to a police dashboard, without any supporting legislative Act. Which prong of the Puttaswamy proportionality test is immediately violated?",
      options: [
        "Legitimate State Aim, because passenger safety is not an acknowledged public interest.",
        "Legality, because intrusive state surveillance cannot be instituted via an administrative or executive circular without express statutory enactment by Parliament or the State Legislature.",
        "Balancing, because biometric scanning is inherently less intrusive than luggage search.",
        "None, because commercial taxi passengers waive all constitutional expectations of privacy."
      ],
      correct: 1,
      explanation: "The first condition of the Puttaswamy proportionality doctrine is Legality—any state encroachment upon Article 21 privacy must emanate from an enacted statutory law passed by a competent legislature, not a mere executive fiat or departmental circular.",
      legalRatio: "Executive circulars cannot abridge Article 21 fundamental privacy rights without statutory backing."
    },
    {
      id: 3,
      section: "legal",
      sectionTitle: "Legal Reasoning",
      passageId: "legal_p2",
      passageTitle: "Passage 2: Constitutional Law & Proportionality Test (Article 21 & Privacy)",
      passageCitation: "Justice K.S. Puttaswamy (Retd.) v. Union of India (2017) 10 SCC 1; Anuradha Bhasin v. UOI (2020)",
      passageText: "In the landmark nine-judge Constitution Bench decision in Justice K.S. Puttaswamy (Retd.) v. Union of India (2017), the Supreme Court unequivocally recognized the right to privacy as an intrinsic part of the right to life and personal liberty under Article 21. Any state encroachment upon personal privacy must satisfy the rigorous four-fold proportionality test: (1) Legality: The measure must have an express legislative basis (a valid law, not merely an executive order); (2) Legitimate State Aim: The objective must serve a legitimate public interest recognized by the Constitution; (3) Proportionality (Suitability & Necessity): The measure must be rationally connected to the objective, and there must be no less-intrusive alternative available; and (4) Balancing: The impact of the encroachment must not have a disproportionate negative bearing on the individual's fundamental rights.",
      question: "Under the Digital Personal Data Protection (DPDP) Act, 2023, Section 17 grants wide exemptions to State agencies from data principal consent on grounds of 'national security'. If challenged before the Supreme Court, what must the Government demonstrate for the provision to survive constitutional scrutiny?",
      options: [
        "That parliamentary statutes carrying national security tags enjoy absolute blanket immunity from judicial review.",
        "That the exemption serves a legitimate state aim and is accompanied by procedural safeguards, judicial oversight, and narrow necessity to prevent arbitrary overreach under the Puttaswamy test.",
        "That data privacy is a statutory privilege rather than a fundamental constitutional right.",
        "That international trade treaties supersede Part III fundamental rights."
      ],
      correct: 1,
      explanation: "While national security is recognized as a legitimate state aim, Puttaswamy mandates that any statutory encroachment must incorporate procedural safeguards, narrow tailoring, and institutional oversight to satisfy the proportionality standard.",
      legalRatio: "National security exemptions must satisfy proportionality, necessity, and adequate procedural safeguards."
    },
    {
      id: 4,
      section: "legal",
      sectionTitle: "Legal Reasoning",
      passageId: "legal_p3",
      passageTitle: "Passage 3: Law of Contracts — Remoteness of Damages under Section 73",
      passageCitation: "Indian Contract Act, 1872 § 73; Hadley v. Baxendale (1854) 9 Exch 341",
      passageText: "Under Section 73 of the Indian Contract Act, 1872, when a contract has been broken, the party who suffers by such breach is entitled to receive compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach. The section explicitly lays down that compensation is not to be given for any remote and indirect loss or damage sustained by reason of the breach. This statutory codification mirrors the classic English common law doctrine laid down in Hadley v. Baxendale: damages are divided into ordinary damages (arising naturally) and special damages (recoverable only if special circumstances were communicated to the defendant at the time of contract formation).",
      question: "A courier agency accepts a parcel containing an advocate's original High Court chamber enrollment certificate for delivery within 24 hours. Due to the courier driver's negligence, delivery is delayed by 3 days. Consequently, the advocate misses the deadline to file a nomination for a ₹25,00,000 Bar Council arbitration panel appointment. The courier was never informed about the arbitration panel nomination. Can the advocate recover the ₹25,00,000 lost earnings under Section 73?",
      options: [
        "Yes, because breach of contract entitles the injured party to full indemnity for all consequential commercial injuries.",
        "No, because the loss of the ₹25,00,000 arbitration panel appointment was a special/remote loss that was not communicated to the courier at the time the contract was concluded.",
        "Yes, because advocates enjoy special professional protection under the Advocates Act, 1961.",
        "No, because courier services are completely exempt from liability under postal statutory conventions."
      ],
      correct: 1,
      explanation: "Under Section 73 and Hadley v. Baxendale, extraordinary profits or lost commercial opportunities constitute special damages. They are not recoverable unless the defendant was expressly put on notice of the special circumstances at the time the contract was made.",
      legalRatio: "Remote and indirect losses are irrecoverable under Section 73 unless communicated at the time of agreement."
    },
    {
      id: 5,
      section: "gk",
      sectionTitle: "Current Affairs & GK",
      passageId: "gk_p1",
      passageTitle: "Passage 4: Constitutional Jurisprudence — Supreme Court Collegium System",
      passageCitation: "Special Reference No. 1 of 1998 (Third Judges Case) (1998) 7 SCC 739",
      passageText: "The Collegium system for judicial appointments to the Supreme Court and High Courts evolved through a series of judicial pronouncements known as the Three Judges Cases: S.P. Gupta (First Judges Case, 1981), Supreme Court Advocates-on-Record Association (Second Judges Case, 1993), and the Special Reference 1 of 1998 (Third Judges Case). In the Third Judges Case, the Supreme Court laid down that the Chief Justice of India (CJI) must consult a collegium of the four senior-most puisne judges of the Supreme Court before recommending appointments to the apex court. For High Court appointments, the Supreme Court Collegium consists of the CJI and the two senior-most judges. While the Executive can seek reconsideration of a recommendation, if the Collegium reiterates the name unanimously, the appointment must be notified under established constitutional convention.",
      question: "What is the mandatory composition of the Supreme Court Collegium for recommending appointments of judges to the Supreme Court of India under the Third Judges Case (1998)?",
      options: [
        "The Chief Justice of India and the two senior-most judges of the Supreme Court.",
        "The Chief Justice of India and the four senior-most judges of the Supreme Court.",
        "The Chief Justice of India, the Union Minister of Law and Justice, and the Attorney General for India.",
        "A constitutional commission headed by the Prime Minister and the Leader of Opposition in Lok Sabha."
      ],
      correct: 1,
      explanation: "In the Third Judges Case (1998), the Supreme Court clarified that for elevations to the Supreme Court, the Collegium comprises the CJI and the four senior-most puisne judges. For High Court elevations, it is CJI + two senior-most judges.",
      legalRatio: "CJI + 4 senior-most judges constitute the apex court collegium for Supreme Court elevations."
    },
    {
      id: 6,
      section: "gk",
      sectionTitle: "Current Affairs & GK",
      passageId: "gk_p1",
      passageTitle: "Passage 4: Constitutional Jurisprudence — Supreme Court Collegium System",
      passageCitation: "Supreme Court Advocates-on-Record Association v. UOI (NJAC Case) (2015) 5 SCC 1",
      passageText: "The Collegium system for judicial appointments to the Supreme Court and High Courts evolved through a series of judicial pronouncements known as the Three Judges Cases: S.P. Gupta (First Judges Case, 1981), Supreme Court Advocates-on-Record Association (Second Judges Case, 1993), and the Special Reference 1 of 1998 (Third Judges Case). In the Third Judges Case, the Supreme Court laid down that the Chief Justice of India (CJI) must consult a collegium of the four senior-most puisne judges of the Supreme Court before recommending appointments to the apex court. For High Court appointments, the Supreme Court Collegium consists of the CJI and the two senior-most judges. While the Executive can seek reconsideration of a recommendation, if the Collegium reiterates the name unanimously, the appointment must be notified under established constitutional convention.",
      question: "In 2015, the Supreme Court struck down the 99th Constitutional Amendment Act and the National Judicial Appointments Commission (NJAC) Act. What was the central constitutional ratio of the majority judgment?",
      options: [
        "The amendment failed to receive the assent of the required number of State Legislatures under Article 368.",
        "Judicial primacy in the appointment of judges is an essential facet of the Independence of the Judiciary, which constitutes an unamendable part of the Basic Structure of the Constitution.",
        "The Law Minister cannot be an ex-officio member of any statutory body.",
        "Judges can only be selected through a public competitive examination conducted by the UPSC."
      ],
      correct: 1,
      explanation: "A five-judge Constitution Bench held that the primacy of the judiciary in appointments is indispensable to ensure judicial independence, which is an inviolable facet of the Basic Structure doctrine formulated in Kesavananda Bharati.",
      legalRatio: "Independence of the judiciary and judicial primacy in appointments are part of the Basic Structure."
    },
    {
      id: 7,
      section: "gk",
      sectionTitle: "Current Affairs & GK",
      passageId: "gk_p2",
      passageTitle: "Passage 5: International Law & Maritime Sovereignty",
      passageCitation: "United Nations Convention on the Law of the Sea (UNCLOS), 1982",
      passageText: "The United Nations Convention on the Law of the Sea (UNCLOS), 1982, codifies ocean sovereignty and maritime rights across defined zones measured from baseline: Territorial Sea (up to 12 nautical miles, where the coastal state exercises sovereignty subject to innocent passage), Contiguous Zone (up to 24 nautical miles, for customs, fiscal, immigration, and sanitary enforcement), and Exclusive Economic Zone (EEZ, extending up to 200 nautical miles, where coastal states have sovereign rights over marine resources and continental shelf exploration). In international straits used for international navigation, the regime of transit passage applies, which cannot be suspended even during peacetime disputes.",
      question: "Under UNCLOS 1982, what is the maximum breadth of the Exclusive Economic Zone (EEZ) measured from the territorial sea baseline, and what rights does the coastal state possess within it?",
      options: [
        "200 nautical miles; sovereign rights for exploring, exploiting, conserving, and managing natural living and non-living resources.",
        "12 nautical miles; absolute territorial sovereignty identical to land territory.",
        "50 nautical miles; exclusive military patrol rights with total prohibition of foreign commercial merchant vessels.",
        "350 nautical miles; full legislative jurisdiction over foreign flag vessels on all matters."
      ],
      correct: 0,
      explanation: "Under Part V of UNCLOS (Article 57 & 56), the EEZ extends up to 200 nautical miles from the baseline, within which coastal states hold sovereign rights over natural resources (fisheries, seabed minerals) while foreign states retain navigation and overflight freedoms.",
      legalRatio: "EEZ extends to 200 nm granting sovereign rights over resources without extinguishing navigation freedoms."
    },
    {
      id: 8,
      section: "english",
      sectionTitle: "English Language",
      passageId: "english_p1",
      passageTitle: "Passage 6: Judicial Review vs. Judicial Overreach in Democratic Governance",
      passageCitation: "Comparative Constitutional Jurisprudence (Oxford University Press, 2024)",
      passageText: "The legitimacy of judicial review lies in the counter-majoritarian role assigned to the constitutional judiciary: to safeguard fundamental rights against transient political majorities and enforce constitutional limits upon legislative and executive power. However, a precarious boundary separates legitimate judicial activism from judicial overreach. When courts venture into polycentric socio-economic policymaking—such as directing the interlinking of rivers, fixing fuel prices, or framing taxation roadmaps—they suffer from institutional incapacity. Judges are trained in adjudicating bilateral disputes based on codified evidence; they lack the consultative machinery, fiscal resources, and electoral accountability required for managing complex socio-economic trade-offs. The institutional capital of the judiciary is not inexhaustible; squandering it on administrative micromanagement inevitably erodes public reverence for judicial decrees when state compliance proves unviable.",
      question: "According to the passage, why is the judiciary institutionally ill-equipped to handle polycentric socio-economic policymaking?",
      options: [
        "Judges are predominantly appointed from corporate legal backgrounds without civil service exposure.",
        "Courts lack the consultative machinery, fiscal resources, and electoral accountability required for balancing complex socio-economic trade-offs.",
        "The Constitution expressly restricts writ jurisdiction under Article 32 to criminal habeas corpus matters.",
        "State compliance is guaranteed only when policies are authored by elected legislative committees."
      ],
      correct: 1,
      explanation: "The author explicitly identifies that courts lack consultative machinery, fiscal resources, and electoral accountability necessary to balance polycentric socio-economic trade-offs.",
      legalRatio: "Institutional incapacity arises from lack of consultative machinery, budget controls, and electoral accountability."
    },
    {
      id: 9,
      section: "english",
      sectionTitle: "English Language",
      passageId: "english_p1",
      passageTitle: "Passage 6: Judicial Review vs. Judicial Overreach in Democratic Governance",
      passageCitation: "Comparative Constitutional Jurisprudence (Oxford University Press, 2024)",
      passageText: "The legitimacy of judicial review lies in the counter-majoritarian role assigned to the constitutional judiciary: to safeguard fundamental rights against transient political majorities and enforce constitutional limits upon legislative and executive power. However, a precarious boundary separates legitimate judicial activism from judicial overreach. When courts venture into polycentric socio-economic policymaking—such as directing the interlinking of rivers, fixing fuel prices, or framing taxation roadmaps—they suffer from institutional incapacity. Judges are trained in adjudicating bilateral disputes based on codified evidence; they lack the consultative machinery, fiscal resources, and electoral accountability required for managing complex socio-economic trade-offs. The institutional capital of the judiciary is not inexhaustible; squandering it on administrative micromanagement inevitably erodes public reverence for judicial decrees when state compliance proves unviable.",
      question: "What is the primary warning articulated by the author regarding excessive judicial intervention into administrative domains?",
      options: [
        "It provokes Parliament to immediately curtail appellate judicial salaries.",
        "It squanders the judiciary's finite institutional capital and erodes public reverence when decrees cannot realistically be enforced by the state.",
        "It forces commercial enterprises to register foreign arbitrations outside India.",
        "It eliminates the doctrine of precedent in lower district courts."
      ],
      correct: 1,
      explanation: "The concluding sentence emphasizes: 'The institutional capital of the judiciary is not inexhaustible; squandering it on administrative micromanagement inevitably erodes public reverence for judicial decrees when state compliance proves unviable.'",
      legalRatio: "Squandering institutional capital on administrative micromanagement erodes judicial authority."
    },
    {
      id: 10,
      section: "logical",
      sectionTitle: "Logical Reasoning",
      passageId: "logical_p1",
      passageTitle: "Passage 7: Legal Epistemology & Deductive Reasoning",
      passageCitation: "Principles of Evidence & Formal Logic in Trial Advocacy",
      passageText: "In Anglo-Indian jurisprudence, legal adjudication rests upon distinct standards of proof. In criminal trials, the prosecution must establish the guilt of the accused 'beyond reasonable doubt'—if two reasonable views are plausible based on the evidentiary record, the view favoring innocence must prevail. In civil disputes, claims are adjudicated on the 'preponderance of probabilities'—the party demonstrating that their narrative is more likely true than not succeeds. A common fallacy in legal rhetoric is the 'appeal to ignorance' (argumentum ad ignorantiam)—asserting that a claim must be true simply because it has not been conclusively disproven. In criminal jurisprudence, the failure of the defense to prove an alternative alibi cannot relieve the prosecution of its cardinal burden to establish the commission of the offence beyond reasonable doubt.",
      question: "Consider the following syllogism: Premise 1: All offences under Section 302 IPC/BNS carry either life imprisonment or the death penalty. Premise 2: Offence X does not carry life imprisonment or the death penalty. Conclusion: Therefore, Offence X is not an offence under Section 302. What is the logical validity of this conclusion?",
      options: [
        "Invalid, because some criminal offences carry compoundable statutory fines.",
        "Valid; it follows deductive Modus Tollens (If P then Q; Not Q; therefore Not P).",
        "Invalid, because it commits the formal fallacy of affirming the consequent.",
        "Uncertain, because statutory interpretations vary across High Court benches."
      ],
      correct: 1,
      explanation: "This is a classic valid deductive argument conforming to Modus Tollens: If P (Offence is 302), then Q (Carries life/death). Not Q (Does not carry life/death). Therefore, Not P (Not an offence under 302).",
      legalRatio: "Modus Tollens is a deductively valid rule of inference in statutory characterization."
    },
    {
      id: 11,
      section: "logical",
      sectionTitle: "Logical Reasoning",
      passageId: "logical_p1",
      passageTitle: "Passage 7: Legal Epistemology & Deductive Reasoning",
      passageCitation: "Principles of Evidence & Formal Logic in Trial Advocacy",
      passageText: "In Anglo-Indian jurisprudence, legal adjudication rests upon distinct standards of proof. In criminal trials, the prosecution must establish the guilt of the accused 'beyond reasonable doubt'—if two reasonable views are plausible based on the evidentiary record, the view favoring innocence must prevail. In civil disputes, claims are adjudicated on the 'preponderance of probabilities'—the party demonstrating that their narrative is more likely true than not succeeds. A common fallacy in legal rhetoric is the 'appeal to ignorance' (argumentum ad ignorantiam)—asserting that a claim must be true simply because it has not been conclusively disproven. In criminal jurisprudence, the failure of the defense to prove an alternative alibi cannot relieve the prosecution of its cardinal burden to establish the commission of the offence beyond reasonable doubt.",
      question: "A public prosecutor argues: 'The accused has failed to produce any witness or receipt demonstrating his whereabouts between 10:00 PM and midnight on the night of the burglary. Since he cannot disprove his presence at the scene, the court must conclude he committed the crime.' Based on the passage, which fallacy and legal flaw characterizes this submission?",
      options: [
        "Post hoc ergo propter hoc (faulty causal attribution).",
        "Argumentum ad ignorantiam (appeal to ignorance), which impermissibly attempts to invert the burden of proof from the prosecution onto the accused.",
        "Hasty Generalization based on insufficient empirical sample size.",
        "Ad Hominem abusive attack against defense counsel."
      ],
      correct: 1,
      explanation: "The prosecutor asserts guilt simply because innocence or an alibi was not affirmatively demonstrated. The passage explicitly highlights that this is an argumentum ad ignorantiam that cannot relieve the prosecution of proving guilt beyond reasonable doubt.",
      legalRatio: "Failure of alibi does not relieve prosecution of proving guilt beyond reasonable doubt."
    },
    {
      id: 12,
      section: "quant",
      sectionTitle: "Quantitative Techniques",
      passageId: "quant_p1",
      passageTitle: "Passage 8: Quantitative Data Interpretation — Indian Court Pendency & Sanctioned Strengths",
      passageCitation: "National Judicial Data Grid (NJDG) Annual Statistics 2025",
      passageText: "According to the National Judicial Data Grid (NJDG) data for 2025: Total sanctioned judge strength across the 25 High Courts is 1,114 judges. The working strength is 780 judges, leaving 334 vacancies. Across all High Courts, 60.00 Lakh cases are pending. In a representative High Court with 1,20,000 total pending cases: 60% are civil cases and 40% are criminal cases. During the year 2025, this High Court instituted 40,000 new civil cases and 25,000 new criminal cases. During the same year, the court disposed of 36,000 civil cases and 20,000 criminal cases.",
      question: "What is the vacancy percentage among High Court judges across India based on the sanctioned strength of 1,114 and 334 vacancies? (Round to one decimal place).",
      options: [
        "24.5%",
        "30.0%",
        "35.2%",
        "41.8%"
      ],
      correct: 1,
      explanation: "Vacancy percentage = (334 / 1114) * 100 = 29.982% which rounds to 30.0%.",
      legalRatio: "Vacancy % = (Vacancies / Sanctioned Strength) * 100."
    },
    {
      id: 13,
      section: "quant",
      sectionTitle: "Quantitative Techniques",
      passageId: "quant_p1",
      passageTitle: "Passage 8: Quantitative Data Interpretation — Indian Court Pendency & Sanctioned Strengths",
      passageCitation: "National Judicial Data Grid (NJDG) Annual Statistics 2025",
      passageText: "According to the National Judicial Data Grid (NJDG) data for 2025: Total sanctioned judge strength across the 25 High Courts is 1,114 judges. The working strength is 780 judges, leaving 334 vacancies. Across all High Courts, 60.00 Lakh cases are pending. In a representative High Court with 1,20,000 total pending cases: 60% are civil cases and 40% are criminal cases. During the year 2025, this High Court instituted 40,000 new civil cases and 25,000 new criminal cases. During the same year, the court disposed of 36,000 civil cases and 20,000 criminal cases.",
      question: "In the representative High Court, what was the net change in total pending cases (civil + criminal combined) over the course of 2025? (Net change = Total New Instituted minus Total Disposed).",
      options: [
        "Net reduction of 9,000 cases.",
        "Net increase of 9,000 cases (65,000 instituted - 56,000 disposed).",
        "Net increase of 14,000 cases.",
        "Zero change (disposal matched institution exactly)."
      ],
      correct: 1,
      explanation: "Total instituted = 40,000 (civil) + 25,000 (criminal) = 65,000. Total disposed = 36,000 (civil) + 20,000 (criminal) = 56,000. Net change = 65,000 - 56,000 = +9,000 cases increase in backlog.",
      legalRatio: "Case Backlog Delta = Total Cases Instituted - Total Cases Disposed."
    }
  ];

  // Backward compatibility alias for legacy mock buttons
  const sampleFreeMock = {
    title: "Consortium CLAT 2027 Full Length All-India Diagnostic CBT Mock",
    timeMinutes: 120,
    questions: cbtQuestions.map((q) => ({
      q: q.question,
      options: q.options,
      correct: q.correct,
    })),
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

  // ==============================================================
  // CBT ENGINE TIMER & ACTION HANDLERS
  // ==============================================================
  useEffect(() => {
    if (cbtIsSubmitted || !cbtIsTimerRunning || !cbtActive) return;
    const timer = setInterval(() => {
      setCbtTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCbtIsSubmitted(true);
          setCbtShowConfirmModal(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cbtIsSubmitted, cbtIsTimerRunning, cbtActive]);

  const formatCbtTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectCbtAnswer = (qIndex: number, optIndex: number) => {
    setCbtSelectedAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
    setCbtVisitedQuestions((prev) => ({ ...prev, [qIndex]: true }));
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleClearCbtAnswer = (qIndex: number) => {
    setCbtSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qIndex];
      return copy;
    });
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qIndex];
      return copy;
    });
  };

  const handleToggleMarkForReview = (qIndex: number) => {
    setCbtMarkedForReview((prev) => ({ ...prev, [qIndex]: !prev[qIndex] }));
    setCbtVisitedQuestions((prev) => ({ ...prev, [qIndex]: true }));
  };

  const handleCbtJumpToQuestion = (qIndex: number) => {
    setCbtCurrentQuestionIndex(qIndex);
    setCbtVisitedQuestions((prev) => ({ ...prev, [qIndex]: true }));
    const targetSection = cbtQuestions[qIndex]?.section;
    if (targetSection) {
      setCbtActiveSectionTab(targetSection);
    }
  };

  const handleCbtSaveAndNext = () => {
    setCbtVisitedQuestions((prev) => ({ ...prev, [cbtCurrentQuestionIndex]: true }));
    if (cbtCurrentQuestionIndex < cbtQuestions.length - 1) {
      const nextIndex = cbtCurrentQuestionIndex + 1;
      setCbtCurrentQuestionIndex(nextIndex);
      const nextSection = cbtQuestions[nextIndex]?.section;
      if (nextSection) {
        setCbtActiveSectionTab(nextSection);
      }
    }
  };

  const handleCbtMarkForReviewAndNext = () => {
    setCbtMarkedForReview((prev) => ({ ...prev, [cbtCurrentQuestionIndex]: true }));
    setCbtVisitedQuestions((prev) => ({ ...prev, [cbtCurrentQuestionIndex]: true }));
    if (cbtCurrentQuestionIndex < cbtQuestions.length - 1) {
      const nextIndex = cbtCurrentQuestionIndex + 1;
      setCbtCurrentQuestionIndex(nextIndex);
      const nextSection = cbtQuestions[nextIndex]?.section;
      if (nextSection) {
        setCbtActiveSectionTab(nextSection);
      }
    }
  };

  const handleCbtPrevious = () => {
    if (cbtCurrentQuestionIndex > 0) {
      const prevIndex = cbtCurrentQuestionIndex - 1;
      setCbtCurrentQuestionIndex(prevIndex);
      const prevSection = cbtQuestions[prevIndex]?.section;
      if (prevSection) {
        setCbtActiveSectionTab(prevSection);
      }
    }
  };

  const handleStartCbtExam = () => {
    setCbtActive(true);
    setCbtIsSubmitted(false);
    setCbtSelectedAnswers({});
    setCbtMarkedForReview({});
    setCbtVisitedQuestions({ 0: true });
    setCbtCurrentQuestionIndex(0);
    setCbtTimeRemaining(7200);
    setCbtIsTimerRunning(true);
    setCbtActiveSectionTab("legal");
    setMockScore(null);
  };

  const handleRetakeCbtExam = () => {
    handleStartCbtExam();
  };

  const handleSubmitCbtExam = () => {
    setCbtIsSubmitted(true);
    setCbtShowConfirmModal(false);
    let legacyScore = 0;
    cbtQuestions.forEach((q, idx) => {
      const selected = cbtSelectedAnswers[idx];
      if (selected !== undefined) {
        if (selected === q.correct) legacyScore += 1;
        else legacyScore -= 0.25;
      }
    });
    setMockScore(legacyScore);
  };

  // Aliases for legacy callbacks
  const handleSelectMockAnswer = handleSelectCbtAnswer;
  const calculateMockScore = handleSubmitCbtExam;

  // Palette summary counts
  const cbtAnsweredCount = Object.keys(cbtSelectedAnswers).length;
  const cbtMarkedCount = Object.keys(cbtMarkedForReview).filter(
    (k) => cbtMarkedForReview[Number(k)] && cbtSelectedAnswers[Number(k)] === undefined
  ).length;
  const cbtAnsweredAndMarkedCount = Object.keys(cbtMarkedForReview).filter(
    (k) => cbtMarkedForReview[Number(k)] && cbtSelectedAnswers[Number(k)] !== undefined
  ).length;
  const cbtVisitedUnansweredCount = Object.keys(cbtVisitedQuestions).filter(
    (k) => cbtSelectedAnswers[Number(k)] === undefined && !cbtMarkedForReview[Number(k)]
  ).length;
  const cbtNotVisitedCount = cbtQuestions.length - Object.keys(cbtVisitedQuestions).length;

  // Comprehensive diagnostic scorecard computations
  const cbtExamResults = (() => {
    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const sectionBreakdown: Record<
      string,
      { total: number; attempted: number; correct: number; incorrect: number; unattempted: number; score: number }
    > = {
      legal: { total: 0, attempted: 0, correct: 0, incorrect: 0, unattempted: 0, score: 0 },
      gk: { total: 0, attempted: 0, correct: 0, incorrect: 0, unattempted: 0, score: 0 },
      english: { total: 0, attempted: 0, correct: 0, incorrect: 0, unattempted: 0, score: 0 },
      logical: { total: 0, attempted: 0, correct: 0, incorrect: 0, unattempted: 0, score: 0 },
      quant: { total: 0, attempted: 0, correct: 0, incorrect: 0, unattempted: 0, score: 0 },
    };

    cbtQuestions.forEach((q, idx) => {
      const sec = q.section;
      sectionBreakdown[sec].total += 1;
      const ans = cbtSelectedAnswers[idx];
      if (ans === undefined) {
        unattemptedCount += 1;
        sectionBreakdown[sec].unattempted += 1;
      } else if (ans === q.correct) {
        correctCount += 1;
        totalScore += 1;
        sectionBreakdown[sec].attempted += 1;
        sectionBreakdown[sec].correct += 1;
        sectionBreakdown[sec].score += 1;
      } else {
        incorrectCount += 1;
        totalScore -= 0.25;
        sectionBreakdown[sec].attempted += 1;
        sectionBreakdown[sec].incorrect += 1;
        sectionBreakdown[sec].score -= 0.25;
      }
    });

    const attemptedCount = correctCount + incorrectCount;
    const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;

    let predictedAir = "AIR 3,500+";
    let targetCollege = "State Law Universities & Private NLUs Tier";
    if (totalScore >= 12) {
      predictedAir = "AIR 1 – 45 (Top 0.1%)";
      targetCollege = "NLSIU Bengaluru (National Law School) Call";
    } else if (totalScore >= 9.5) {
      predictedAir = "AIR 46 – 180 (Top 1%)";
      targetCollege = "NALSAR Hyderabad / WBNUJS Kolkata Call";
    } else if (totalScore >= 7) {
      predictedAir = "AIR 181 – 650 (Top 3%)";
      targetCollege = "NLU Jodhpur / GNLU Gandhinagar Call";
    } else if (totalScore >= 4) {
      predictedAir = "AIR 651 – 2,200 (Top 10%)";
      targetCollege = "HNLU Raipur / RMLNLU Lucknow Call";
    }

    const percentile = Math.min(99.8, Math.max(35.0, ((Math.max(0, totalScore) + 3) / 17) * 100)).toFixed(1);

    return {
      totalScore: Number(totalScore.toFixed(2)),
      rawScore: totalScore,
      correctCount,
      incorrectCount,
      unattemptedCount,
      attemptedCount,
      accuracy: accuracy.toFixed(1),
      predictedAir,
      targetCollege,
      percentile,
      sectionBreakdown,
    };
  })();

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

  // Full 17-item Student Navigation
  const studentNavItems = [
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
    if (id === "free_mocks") {
      setCbtActive(true);
      setCbtIsSubmitted(false);
      setActiveMockTest(sampleFreeMock);
    } else if (id === "tests") {
      setActiveMockTest(sampleFreeMock);
    }
  };

  const renderCbtMockSimulator = () => {
    const currentQ = cbtQuestions[cbtCurrentQuestionIndex] || cbtQuestions[0];
    const fontSizeClass =
      cbtPassageFontSize === "lg"
        ? "text-base leading-relaxed"
        : cbtPassageFontSize === "base"
        ? "text-sm leading-relaxed"
        : "text-xs sm:text-[13px] leading-relaxed";

    const getQuestionStatus = (idx: number) => {
      const isAnswered = cbtSelectedAnswers[idx] !== undefined;
      const isMarked = !!cbtMarkedForReview[idx];
      const isVisited = !!cbtVisitedQuestions[idx];
      if (isAnswered && isMarked) return "answered_marked";
      if (isAnswered) return "answered";
      if (isMarked) return "marked";
      if (isVisited) return "not_answered";
      return "not_visited";
    };

    const filteredReviewQuestions = cbtQuestions.filter((q) => {
      const ans = cbtSelectedAnswers[q.id];
      const isMarked = !!cbtMarkedForReview[q.id];
      if (cbtReviewFilter === "all") return true;
      if (cbtReviewFilter === "correct") return ans === q.correct;
      if (cbtReviewFilter === "incorrect") return ans !== undefined && ans !== q.correct;
      if (cbtReviewFilter === "unattempted") return ans === undefined;
      if (cbtReviewFilter === "marked") return isMarked;
      return true;
    });

    if (cbtIsSubmitted) {
      // Diagnostic Scorecard View
      return (
        <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto pb-12">
          {/* Top Scorecard Hero Banner */}
          <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-zinc-950 text-white border border-amber-500/30 shadow-2xl">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-[10px] font-mono font-extrabold uppercase tracking-wider">
                    Consortium CBT Diagnostic Scorecard
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                    Official Negative Marking (-0.25)
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  CLAT 2027 Full Length All-India Diagnostic Mock
                </h2>
                <p className="text-xs text-zinc-400 max-w-xl">
                  Evaluated against National Law University (NLU) Consortium standards. Includes section-wise percentiles, AIR rank projection, and detailed statutory ratios.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleRetakeCbtExam}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Mock Exam</span>
                </button>
                <button
                  onClick={() => {
                    setCbtActive(false);
                    setActiveSection("tests");
                  }}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-xs transition-all cursor-pointer"
                >
                  Back to Test Packs
                </button>
              </div>
            </div>

            {/* Scorecard KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-800">
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Net Total Score</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {cbtExamResults.totalScore > 0 ? `+${cbtExamResults.totalScore.toFixed(2)}` : cbtExamResults.totalScore.toFixed(2)}
                  <span className="text-xs text-zinc-500 font-normal"> / 14.00</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  {cbtExamResults.correctCount} Correct • {cbtExamResults.incorrectCount} Wrong
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Predicted All-India Rank</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono flex items-center gap-1.5">
                  <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{cbtExamResults.predictedAir}</span>
                </div>
                <div className="text-[11px] text-zinc-400">Simulated among 42,000+ test-takers</div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Accuracy &amp; Percentile</span>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {cbtExamResults.percentile}
                  <span className="text-xs text-zinc-500 font-normal"> %ile</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-medium">
                  {cbtExamResults.accuracy}% Accuracy Rate
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Target NLU Projection</span>
                <div className="text-sm font-bold text-amber-300 leading-snug pt-0.5">
                  {cbtExamResults.targetCollege}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">Based on 2025 First List Cutoffs</div>
              </div>
            </div>
          </div>

          {/* Section-Wise Diagnostic Breakdown Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-500" />
                  <span>Section-Wise Performance Matrix</span>
                </h3>
                <p className="text-xs text-zinc-500">Breakdown of attempted questions, accuracy, and net marks per syllabus domain.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-mono uppercase text-[10px] border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-3">Section</th>
                    <th className="p-3 text-center">Total Qs</th>
                    <th className="p-3 text-center">Attempted</th>
                    <th className="p-3 text-center text-emerald-600">Correct (+1)</th>
                    <th className="p-3 text-center text-rose-500">Incorrect (-0.25)</th>
                    <th className="p-3 text-center">Unattempted</th>
                    <th className="p-3 text-center font-bold">Net Marks</th>
                    <th className="p-3 text-right">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                  {cbtSections.map((sec) => {
                    const data = cbtExamResults.sectionBreakdown[sec.id] || {
                      total: sec.count,
                      attempted: 0,
                      correct: 0,
                      incorrect: 0,
                      unattempted: sec.count,
                      score: 0,
                    };
                    const secAcc = data.attempted > 0 ? ((data.correct / data.attempted) * 100).toFixed(0) : "—";
                    return (
                      <tr key={sec.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                        <td className="p-3 font-bold text-black dark:text-white flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            sec.id === "legal" ? "bg-amber-500" :
                            sec.id === "gk" ? "bg-amber-600" :
                            sec.id === "english" ? "bg-emerald-500" :
                            sec.id === "logical" ? "bg-purple-500" : "bg-rose-500"
                          }`} />
                          <span>{sec.label}</span>
                        </td>
                        <td className="p-3 text-center font-mono">{data.total}</td>
                        <td className="p-3 text-center font-mono">{data.attempted}</td>
                        <td className="p-3 text-center font-mono text-emerald-600 font-bold">{data.correct}</td>
                        <td className="p-3 text-center font-mono text-rose-500 font-bold">{data.incorrect}</td>
                        <td className="p-3 text-center font-mono text-zinc-400">{data.unattempted}</td>
                        <td className="p-3 text-center font-mono font-bold text-black dark:text-white">
                          {data.score > 0 ? `+${data.score.toFixed(2)}` : data.score.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-zinc-700 dark:text-zinc-300">
                          {secAcc !== "—" ? `${secAcc}%` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Solution & Explanation Review Keys */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-amber-500" />
                  <span>Question-by-Question Solution Keys &amp; Judicial Rationale</span>
                </h3>
                <p className="text-xs text-zinc-500">Every question with candidate choice, correct ratio decidendi, and statutory references.</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs">
                {(
                  [
                    { id: "all", label: `All (${cbtQuestions.length})` },
                    { id: "correct", label: `Correct (${cbtExamResults.correctCount})` },
                    { id: "incorrect", label: `Incorrect (${cbtExamResults.incorrectCount})` },
                    { id: "unattempted", label: `Unattempted (${cbtExamResults.unattemptedCount})` },
                    { id: "marked", label: "Marked" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCbtReviewFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      cbtReviewFilter === tab.id
                        ? "bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredReviewQuestions.map((q) => {
                const userAns = cbtSelectedAnswers[q.id];
                const isCorrect = userAns === q.correct;
                const isUnattempted = userAns === undefined;
                const isMarked = !!cbtMarkedForReview[q.id];

                return (
                  <div
                    key={q.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs"
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                          {q.id + 1}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono font-bold text-[10px] uppercase">
                          {q.sectionTitle}
                        </span>
                        {isMarked && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[10px] font-mono font-bold flex items-center gap-1">
                            <Flag className="w-3 h-3 fill-current" />
                            <span>Marked for Review</span>
                          </span>
                        )}
                      </div>

                      <div>
                        {isCorrect ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono font-extrabold text-[11px] flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>+1.00 Mark (Correct)</span>
                          </span>
                        ) : isUnattempted ? (
                          <span className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono font-bold text-[11px]">
                            0.00 Marks (Unattempted)
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-mono font-extrabold text-[11px] flex items-center gap-1">
                            <X className="w-3.5 h-3.5" />
                            <span>-0.25 Mark (Negative Penalty)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Passage Reference snippet */}
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span className="font-bold">{q.passageTitle}</span>
                        <span>{q.passageCitation}</span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2 italic">
                        &quot;{q.passageText}&quot;
                      </p>
                    </div>

                    {/* Question Statement */}
                    <p className="text-xs sm:text-sm font-semibold text-black dark:text-zinc-100 leading-relaxed">
                      {q.question}
                    </p>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isOfficialCorrect = optIdx === q.correct;
                        const isUserChoice = optIdx === userAns;

                        let styleClass = "bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300";
                        if (isOfficialCorrect) {
                          styleClass = "bg-emerald-500/10 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold";
                        } else if (isUserChoice && !isCorrect) {
                          styleClass = "bg-rose-500/10 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-800 dark:text-rose-200 font-bold";
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-2xl text-xs flex items-start gap-3 transition-colors ${styleClass}`}
                          >
                            <span className="w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] shrink-0 border border-current mt-0.5">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1 leading-snug">{opt}</span>
                            {isOfficialCorrect && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-mono text-[10px] font-bold shrink-0">
                                Correct Answer
                              </span>
                            )}
                            {isUserChoice && !isOfficialCorrect && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold shrink-0">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Judicial Explanation & Statutory Ratio */}
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Judicial Rationale &amp; Statutory Analysis:</span>
                      </div>
                      <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed">
                        {q.explanation}
                      </p>
                      <div className="pt-1 text-[11px] font-mono text-amber-700 dark:text-amber-400">
                        ⚖️ <strong>Core Legal Ratio:</strong> {q.legalRatio}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Exam Active / Taking Mode
    return (
      <div className="space-y-4 animate-in fade-in duration-200 max-w-7xl mx-auto pb-8">
        {/* Exam Navigation & Timer Header */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold uppercase">
                Consortium CBT Live Simulator
              </span>
              <span className="text-zinc-400 font-mono text-xs hidden sm:inline">•</span>
              <span className="text-xs text-zinc-500 font-mono hidden sm:inline">120 Mins Standard Format</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-black dark:text-white">
              All-India CLAT 2027 Full Length Diagnostic Mock
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border font-mono font-bold text-xs transition-colors ${
                cbtTimeRemaining < 600
                  ? "bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 animate-pulse"
                  : cbtTimeRemaining < 1800
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400"
                  : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-black dark:text-white"
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>{formatCbtTime(cbtTimeRemaining)}</span>
              <button
                onClick={() => setCbtIsTimerRunning((prev) => !prev)}
                title={cbtIsTimerRunning ? "Pause timer" : "Resume timer"}
                className="ml-1 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                {cbtIsTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>

            {/* Scheme button */}
            <button
              onClick={() => setShowCbtGuidelinesModal(true)}
              className="px-3 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scheme (+1 / -0.25)</span>
            </button>

            {/* Submit Test Button */}
            <button
              onClick={() => setCbtShowConfirmModal(true)}
              className="px-5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Submit Test
            </button>
          </div>
        </div>

        {/* Section Tabs Ribbon */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {cbtSections.map((sec) => {
            const isActive = cbtActiveSectionTab === sec.id;
            const secQuestions = cbtQuestions.filter((q) => q.section === sec.id);
            const answeredInSec = secQuestions.filter((q) => cbtSelectedAnswers[q.id] !== undefined).length;

            return (
              <button
                key={sec.id}
                onClick={() => {
                  setCbtActiveSectionTab(sec.id);
                  const firstQ = cbtQuestions.find((q) => q.section === sec.id);
                  if (firstQ) {
                    setCbtCurrentQuestionIndex(firstQ.id);
                    setCbtVisitedQuestions((prev) => ({ ...prev, [firstQ.id]: true }));
                  }
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-md scale-102"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <span>{sec.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive
                    ? "bg-amber-500 text-black font-extrabold"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                }`}>
                  {answeredInSec}/{sec.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Split Layout: Passage on Left, Question & Palette on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Pane: Reading Passage & Case Scenario (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 min-h-[480px]">
            {/* Passage Header with Font Size Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider">
                  Reading Passage &amp; Legal Context
                </span>
                <h4 className="text-sm font-bold text-black dark:text-white">
                  {currentQ.passageTitle}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400 font-mono">Font:</span>
                <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-bold font-mono">
                  <button
                    onClick={() => setCbtPassageFontSize("sm")}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      cbtPassageFontSize === "sm" ? "bg-white dark:bg-zinc-900 text-black dark:text-white shadow-2xs" : "text-zinc-500"
                    }`}
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setCbtPassageFontSize("base")}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      cbtPassageFontSize === "base" ? "bg-white dark:bg-zinc-900 text-black dark:text-white shadow-2xs" : "text-zinc-500"
                    }`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setCbtPassageFontSize("lg")}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      cbtPassageFontSize === "lg" ? "bg-white dark:bg-zinc-900 text-black dark:text-white shadow-2xs" : "text-zinc-500"
                    }`}
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>

            {/* Citation Banner */}
            <div className="px-3.5 py-2 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
              <span>Jurisprudential Reference:</span>
              <span className="font-bold text-zinc-700 dark:text-zinc-300">{currentQ.passageCitation}</span>
            </div>

            {/* Passage Body */}
            <div className={`text-zinc-800 dark:text-zinc-200 tracking-normal ${fontSizeClass} space-y-3 font-serif sm:font-sans p-1 overflow-y-auto max-h-[380px]`}>
              <p className="leading-relaxed whitespace-pre-line">
                {currentQ.passageText}
              </p>
            </div>
          </div>

          {/* Right Pane: Question, Options & Action Bar (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black font-mono font-bold text-xs flex items-center justify-center">
                    {currentQ.id + 1}
                  </span>
                  <span className="text-xs font-bold text-black dark:text-white">
                    Question {currentQ.id + 1} of {cbtQuestions.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    +1.00 / -0.25
                  </span>
                  {cbtMarkedForReview[currentQ.id] && (
                    <span className="p-1 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400">
                      <Flag className="w-3.5 h-3.5 fill-current" />
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <p className="text-xs sm:text-sm font-semibold text-black dark:text-zinc-100 leading-relaxed">
                {currentQ.question}
              </p>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = cbtSelectedAnswers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectCbtAnswer(currentQ.id, optIdx)}
                      className={`w-full p-3 rounded-2xl text-left text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-amber-500 text-black font-bold shadow-md ring-2 ring-amber-500"
                          : "bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-black text-white"
                            : "border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Toolbar */}
              <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleMarkForReview(currentQ.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      cbtMarkedForReview[currentQ.id]
                        ? "bg-purple-600 text-white"
                        : "bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20"
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5 fill-current" />
                    <span>{cbtMarkedForReview[currentQ.id] ? "Marked" : "Mark Review"}</span>
                  </button>

                  <button
                    onClick={() => handleClearCbtAnswer(currentQ.id)}
                    disabled={cbtSelectedAnswers[currentQ.id] === undefined}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-zinc-500 cursor-pointer"
                  >
                    Clear Response
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handleCbtPrevious}
                    disabled={cbtCurrentQuestionIndex === 0}
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={handleCbtSaveAndNext}
                    className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-extrabold text-xs transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <span>{cbtCurrentQuestionIndex === cbtQuestions.length - 1 ? "Review All" : "Save & Next"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Question Palette Widget */}
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider font-mono">
                  Question Palette ({cbtQuestions.length} Questions)
                </h4>
                <span className="text-[10px] font-mono text-zinc-400">Click to jump</span>
              </div>

              {/* Status Legend Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-zinc-600 dark:text-zinc-400">Answered ({cbtAnsweredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-zinc-600 dark:text-zinc-400">Unanswered ({cbtVisitedUnansweredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0" />
                  <span className="text-zinc-600 dark:text-zinc-400">Not Visited ({cbtNotVisitedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-600 shrink-0" />
                  <span className="text-zinc-600 dark:text-zinc-400">Marked ({cbtMarkedCount})</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <span className="w-3 h-3 rounded-full bg-purple-600 relative shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5" />
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400">Ans &amp; Marked ({cbtAnsweredAndMarkedCount})</span>
                </div>
              </div>

              {/* Question Buttons Grid */}
              <div className="grid grid-cols-7 gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {cbtQuestions.map((q) => {
                  const status = getQuestionStatus(q.id);
                  const isCurrent = q.id === cbtCurrentQuestionIndex;

                  let bgClass = "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300";
                  if (status === "answered") {
                    bgClass = "bg-emerald-500 text-white font-bold";
                  } else if (status === "answered_marked") {
                    bgClass = "bg-purple-600 text-white font-bold";
                  } else if (status === "marked") {
                    bgClass = "bg-purple-600 text-white font-bold";
                  } else if (status === "not_answered") {
                    bgClass = "bg-rose-500 text-white font-bold";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleCbtJumpToQuestion(q.id)}
                      className={`h-8 rounded-xl font-mono text-xs flex items-center justify-center transition-all cursor-pointer relative ${bgClass} ${
                        isCurrent
                          ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-black scale-105 z-10"
                          : "hover:opacity-85"
                      }`}
                    >
                      <span>{q.id + 1}</span>
                      {status === "answered_marked" && (
                        <span className="w-2 h-2 rounded-full bg-emerald-300 absolute top-0.5 right-0.5 border border-purple-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Guidelines / Marking Scheme Modal */}
        {showCbtGuidelinesModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150">
              <button
                onClick={() => setShowCbtGuidelinesModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase">
                  Consortium Regulations
                </span>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  CLAT 2027 CBT Guidelines &amp; Evaluation Scheme
                </h3>
              </div>

              <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <div className="font-bold text-black dark:text-white">Marking Pattern:</div>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong className="text-emerald-600">+1.00 Mark</strong> for every correct response.</li>
                    <li><strong className="text-rose-500">-0.25 Mark</strong> negative penalty deduction for every wrong response.</li>
                    <li><strong>0.00 Marks</strong> for unattempted or left questions.</li>
                  </ul>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <div className="font-bold text-black dark:text-white">Question Palette Status Colors:</div>
                  <ul className="space-y-1 font-mono text-[11px]">
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span>Green: Answered &amp; Saved</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500" />
                      <span>Red: Visited but Unanswered</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-purple-600" />
                      <span>Purple: Marked for Review</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                      <span>Gray: Not Visited Yet</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowCbtGuidelinesModal(false)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer"
              >
                Close &amp; Resume Test
              </button>
            </div>
          </div>
        )}

        {/* Submit Confirmation Modal */}
        {cbtShowConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-black uppercase">
                  Final Submission Check
                </span>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Ready to Submit Exam?
                </h3>
                <p className="text-xs text-zinc-500">
                  Review your completion status before calculating your All-India diagnostic percentile.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                <div>
                  <span className="text-zinc-400">Total Questions:</span>
                  <div className="font-bold text-black dark:text-white text-sm">{cbtQuestions.length}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Answered:</span>
                  <div className="font-bold text-emerald-500 text-sm">{cbtAnsweredCount}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Marked for Review:</span>
                  <div className="font-bold text-purple-500 text-sm">{cbtMarkedCount + cbtAnsweredAndMarkedCount}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Unanswered / Left:</span>
                  <div className="font-bold text-rose-500 text-sm">{cbtVisitedUnansweredCount + cbtNotVisitedCount}</div>
                </div>
              </div>

              <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                ⏱️ <strong>Time Remaining:</strong> {formatCbtTime(cbtTimeRemaining)}. Once submitted, responses are evaluated against official answer keys and cannot be altered.
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCbtShowConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  Return to Test
                </button>
                <button
                  onClick={handleSubmitCbtExam}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer shadow-md text-center"
                >
                  Yes, Submit Exam
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex font-sans transition-colors duration-200">
      {/* ============================================================== */}
      {/* 1. LEFT SIDEBAR (DESKTOP) - SPACIOUS & EXPANDABLE / COLLAPSIBLE */}
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
                href="/academy"
                className="flex-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-2xl p-3 flex items-center gap-2.5 shadow-sm transition-all group min-w-0"
                title="Wakheel Academy"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black shrink-0 shadow-xs">
                  <GraduationCap className="w-5 h-5 text-black" />
                </div>
                <div className="min-w-0 truncate">
                  <div className="text-sm font-black tracking-tight text-white leading-none truncate">
                    WAKHEEL <span className="text-amber-500 font-extrabold">ACADEMY</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-medium mt-0.5 truncate">
                    Student Hub
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

            {/* Navigation List - Smoothly scrollable with authentic Wakheel Black & Yellow styling */}
            <div className="flex-1 overflow-y-auto scrollbar-none px-3 py-1 space-y-1 min-h-0">
              {studentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isNavActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
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

            {/* Bottom Stack: Clean Faculty Switcher, ThemeToggle & Exit */}
            <div className="p-3 border-t border-zinc-900 flex flex-col gap-2 shrink-0 bg-black">
              {onSwitchToTeacher && (
                <button
                  onClick={onSwitchToTeacher}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-black" />
                  <span>Faculty Studio</span>
                </button>
              )}
              <div className="flex items-center justify-between pt-1 text-zinc-400">
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <span className="text-[11px] font-medium">Theme</span>
                </div>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
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
            {/* Top: Logo + Expand Button */}
            <div className="flex flex-col items-center gap-2 w-full shrink-0 pb-2 border-b border-zinc-900">
              <Link
                href="/academy"
                className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black shadow-md cursor-pointer hover:scale-105 transition-transform"
                title="Wakheel Academy"
              >
                <GraduationCap className="w-5 h-5 text-black" />
              </Link>
              <button
                onClick={toggleSidebar}
                className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
                title="Expand Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Icons - Scrollable with Tooltips */}
            <div className="flex-1 w-full py-1 flex flex-col items-center gap-1 min-h-0 overflow-y-auto scrollbar-none overflow-x-visible">
              {studentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isNavActive(item.id);
                return (
                  <div key={item.id} className="relative group flex items-center justify-center w-full">
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
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
                      className="absolute px-3 py-1.5 bg-zinc-950 border border-zinc-800 text-white text-xs font-bold rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-[100] flex items-center gap-2"
                    >
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-950 border-l border-b border-zinc-800 rotate-45" />
                      <span className="relative z-10">{item.label}</span>
                      {item.badge && (
                        <span className="relative z-10 text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions: ThemeToggle & SignOut */}
            <div className="flex flex-col items-center gap-2 pt-2 border-t border-zinc-900 w-full px-2 shrink-0">
              <ThemeToggle />
              {onSignOut && (
                <div className="relative group flex items-center justify-center w-full">
                  <button
                    onClick={onSignOut}
                    className="w-8 h-8 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 flex items-center justify-center cursor-pointer transition-colors"
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
                    WAKHEEL <span className="text-amber-500">ACADEMY</span>
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
                {studentNavItems.map((item) => {
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
                          : "text-zinc-300 hover:bg-zinc-900 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span className="text-xs">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-black font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-zinc-800 shrink-0">
              {onSwitchToTeacher && (
                <button
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    onSwitchToTeacher();
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold cursor-pointer"
                >
                  Switch to Faculty Studio
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MAIN CONTENT AREA (RIGHT OF Wakheel SIDEBAR)                 */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa] dark:bg-black min-h-screen text-black dark:text-white">
        {/* ============================================================== */}
        {/* UNIFIED STICKY TOP NAVBAR (ANNOUNCEMENT STRIP + SUBHEADER)    */}
        {/* ============================================================== */}
        <div className="sticky top-0 z-20 w-full bg-slate-50/90 dark:bg-zinc-950 border-b border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          {/* Row 1: Top Announcement Strip matching Wakheel reference */}
          <div className="bg-[#0f172a] text-white px-4 sm:px-6 lg:px-8 py-2 border-b border-zinc-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
              <div className="flex items-center gap-1.5 shrink-0">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span className="font-extrabold text-white tracking-tight">Wakheel Centralized Tuition</span>
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
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAcademyWsConnected ? "bg-amber-400 animate-pulse" : "bg-zinc-600"
                  }`}
                />
                <span className="hidden md:inline">
                  {isAcademyWsConnected ? "Live Sync" : "Offline"}
                </span>
              </div>
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

          {/* Row 2: Subheader matching Wakheel style (Soft Shade-of-White) */}
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
                  {activeSection === "tuition_mode" && "Wakheel Centralized Tuition Mode"}
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
              {/* Globe Language Switcher (Wakheel Style) */}
              <button
                onClick={() => setShowLanguageModal(true)}
                className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold font-mono"
                title={`Current Curricula Language: ${selectedLanguage}`}
              >
                <Globe className="w-4 h-4 text-amber-500" />
                <span className="hidden xl:inline text-[11px]">{selectedLanguage.slice(0, 2).toUpperCase()}</span>
              </button>

              {/* Bookmark Revision Notebook (Wakheel Style) */}
              <button
                onClick={() => setShowBookmarksDrawer(true)}
                className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer relative"
                title="Revision Notebook & Bookmarks"
              >
                <Bookmark className="w-4 h-4 text-amber-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
              </button>

              {/* Search Bar matching Wakheel */}
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

              {/* Interactive Trophy Leaderboard / Rank pill (Wakheel Style) */}
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

              {/* Circular Avatar matching Wakheel */}
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
          {/* Wakheel-style Category Navigation Header for Explore & Other Sections */}
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

              {/* Category Pills matching Wakheel row for Explore */}
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
          {/* SECTION 1: EXPLORE & COURSES (Wakheel SCREENSHOT MATCH)         */}
          {/* ============================================================== */}
          {(activeSection === "test_series" || activeSection === "home") && (
            <div className="space-y-8 animate-in fade-in duration-150">
              {/* ============================================================== */}
              {/* Wakheel DYNAMIC FEATURED CURRICULA / CLEAN ZERO-STATE          */}
              {/* ============================================================== */}
              {(() => {
                const filteredExploreCourses = coursesList.filter((course) => {
                  if (activeExamFilter && activeExamFilter !== "For You" && activeExamFilter !== "All") {
                    return course.exam === activeExamFilter;
                  }
                  return true;
                });

                if (filteredExploreCourses.length === 0) {
                  return (
                    <div className="py-20 px-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-4 max-w-md mx-auto shadow-xs">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                        <GraduationCap className="w-7 h-7" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-base font-bold text-black dark:text-white">
                          No courses available
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                          No masterclasses found for {activeExamFilter === "For You" ? "your current track" : activeExamFilter}. Courses authored and published by faculty will appear here.
                        </p>
                      </div>
                      {activeExamFilter !== "For You" && (
                        <div className="pt-2">
                          <button
                            onClick={() => setActiveExamFilter("For You")}
                            className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
                          >
                            View all tracks
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExploreCourses.map((course) => (
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
                            src={course.image || "/academy/explore-paper.png"}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

                          {/* Wakheel Sections Pill: [ ≡ 20 Sections ] */}
                          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/10 shadow-xs">
                            <AlignLeft className="w-3.5 h-3.5 text-zinc-300" />
                            <span>{course.unitsCount || `${course.syllabus?.length || 0} Sections`}</span>
                          </div>
                        </div>

                        {/* Card Body - Exactly 2 Clean Lines matching Wakheel */}
                        <div className="p-4 sm:p-5 space-y-1">
                          <h3 className="text-base font-bold text-black dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                            {course.dateAdded || course.instructor || "Active Masterclass"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
        )}

                {/* ============================================================== */}
        {/* Wakheel 3-PANE "LEARN" SECTION ARCHITECTURE                     */}
        {/* Pane 1 (Leftmost): Primary icon rail (rendered by aside)       */}
        {/* Pane 2: Secondary Sub-Navigation Sidebar (w-52)               */}
        {/* Pane 3: Center Main Content Canvas (flex-1)                   */}
        {/* Pane 4: Right Studio Palette Palette (w-64 to w-72)           */}
        {/* ============================================================== */}
        {activeSection === "learn" && (
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-105px)] w-full bg-zinc-50/70 dark:bg-black text-zinc-900 dark:text-white animate-in fade-in duration-150">
            {/* PANE 2: SECONDARY SUB-NAVIGATION BAR (w-52) */}
            <div className="w-full lg:w-52 shrink-0 bg-white dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-800/80 p-4 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Sub-header */}
                <div className="px-3 pt-2 pb-1">
                  <h2 className="text-base font-black text-black dark:text-white tracking-tight">
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
                        className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs transition-all flex items-center gap-3 cursor-pointer group ${
                          isActive
                            ? "bg-amber-500 text-black font-extrabold shadow-xs"
                            : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-black" : "text-zinc-400 group-hover:text-amber-500 transition-colors"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom status badge */}
              <div className="pt-4 px-3 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                <span className="font-mono">Curriculum</span>
                <span className="font-bold text-amber-500">v2.5 Sync</span>
              </div>
            </div>

            {/* PANE 3: MAIN CENTER CANVAS (flex-1) */}
            <div className="flex-1 min-w-0 p-5 sm:p-7 lg:p-8 overflow-y-auto">
              {/* SUB-SECTION 1: SUBJECT */}
              {learnSubSection === "subject" && (
                <div className="space-y-6">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
                          Subjects
                        </h1>
                        <span className="px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold shadow-2xs">
                          {selectedCurriculumTrack}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                        Curriculum subjects aligned with your Consortium of NLUs &amp; State Bar standards.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowManageTrackModal(true)}
                      className="self-start sm:self-auto px-4 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Manage Track</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  </div>

                  {/* 2x3 Grid of 6 Subject Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {learnSubjects.map((subj) => {
                      const matchedCourse =
                        coursesList.find((c) => c.id === subj.courseRefId) || coursesList[0] || null;
                      return (
                        <div
                          key={subj.id}
                          onClick={() => {
                            if (matchedCourse) {
                              setSelectedCourseForPortal(matchedCourse);
                              setPortalTab("video");
                              setPortalVideoPlaying(true);
                            } else {
                              alert(`Curriculum masterclass for ${subj.title} will unlock once published by faculty.`);
                            }
                          }}
                          className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs hover:shadow-md hover:border-amber-400/50 dark:hover:border-zinc-700 transition-all flex flex-col justify-between group cursor-pointer relative min-h-[175px]"
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
                                <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1.5 group-hover:text-amber-500 transition-colors leading-snug">
                                  {subj.title}
                                </h3>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-1">
                                  {subj.chapters} Chapters • {subj.lessons} Lessons
                                </p>
                              </div>

                              {/* Circular [+] Button in Amber/Yellow */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCourseForPortal(matchedCourse);
                                  setPortalTab("video");
                                  setPortalVideoPlaying(true);
                                }}
                                className="w-8 h-8 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black flex items-center justify-center font-black shadow-xs transition-transform group-hover:scale-110 shrink-0 cursor-pointer"
                                title="Open Subject Learning Portal"
                              >
                                <Plus className="w-4 h-4 stroke-[3]" />
                              </button>
                            </div>
                          </div>

                          {/* Visual Motif & Meta Description */}
                          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-xl bg-gradient-to-br ${subj.accent} text-white flex items-center justify-center shadow-xs shrink-0`}
                              >
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <span className="text-[11px] font-mono font-semibold text-zinc-500 dark:text-zinc-400">
                                {subj.badge}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-xs font-bold text-amber-500 group-hover:translate-x-1 transition-transform">
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
                        if (coursesList.length > 0) {
                          setSelectedCourseForPortal(coursesList[0]);
                          setPortalTab("video");
                          setPortalVideoPlaying(true);
                        } else {
                          setActiveSection("home");
                        }
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
                              ? "bg-amber-500 text-black font-extrabold shadow-xs"
                              : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
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
                          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-xs"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md">
                              Question {idx + 1} • {q.subject}
                            </span>
                            <span className="text-zinc-400 dark:text-zinc-500 font-medium">{q.tag}</span>
                          </div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{q.question}</p>
                          <div className="grid grid-cols-1 gap-2">
                            {q.options.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                onClick={() => setGameAnswerSelected(oIdx)}
                                className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-left text-xs font-medium hover:border-amber-500 dark:hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-zinc-800 transition-all cursor-pointer text-zinc-700 dark:text-zinc-200"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200/60 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                            <span className="font-bold text-zinc-900 dark:text-white">Ratio Decidendi: </span>
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
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                      Curricular Unit &amp; Mock Tests
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Standardized timed CBT assessments under Bar &amp; NLU examination conditions.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {testSeriesPacks.slice(0, 4).map((tPack) => (
                      <div
                        key={tPack.id}
                        className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              {tPack.badge}
                            </span>
                            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                              ★ {tPack.rating}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-2">
                            {tPack.title}
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{tPack.conductingBody}</p>
                          <div className="text-xs font-mono text-zinc-600 dark:text-zinc-300 mt-2 font-medium">
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
                          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
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
                    {coursesList[0]?.quiz && coursesList[0].quiz.length > 0 ? (
                      <>
                        {coursesList[0].quiz.map((q, qIdx) => (
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
                      </>
                    ) : (
                      <div className="py-8 text-center text-xs text-zinc-500">
                        No active quiz questions authored yet. Questions will appear when published by faculty.
                      </div>
                    )}
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
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-zinc-800 text-amber-500 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
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
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 shadow-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {learnSubjects
                      .filter((s) => s.title.toLowerCase().includes(learnSearchInput.toLowerCase()))
                      .map((s) => (
                        <div
                          key={s.id}
                          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-2xs"
                        >
                          <span className="text-[10px] font-mono font-bold text-amber-500">
                            {s.category}
                          </span>
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{s.title}</h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{s.metaDesc}</p>
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
                      <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                        Bare Act Section Sprint (Game)
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        Gamified speed challenges: Match BNS section numbers and Latin maxims before the timer runs out!
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 px-4 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                      <div className="text-center">
                        <span className="text-[10px] text-zinc-400 font-mono block">SCORE</span>
                        <span className="text-sm font-black text-amber-500 font-mono">{gameScore} pts</span>
                      </div>
                      <div className="h-6 w-px bg-zinc-200 dark:border-zinc-800" />
                      <div className="text-center">
                        <span className="text-[10px] text-zinc-400 font-mono block">STREAK</span>
                        <span className="text-sm font-black text-emerald-500 font-mono">{gameStreak} 🔥</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Question Card */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-6 shadow-xs">
                    <div className="space-y-2 text-center max-w-md mx-auto">
                      <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        CRIMINAL OFFENSE
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                        {gameSprintQuestions[gameSprintQuestionIdx].crime}
                      </h3>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
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
                            className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 hover:bg-amber-500 hover:text-black border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-800 dark:text-white transition-all cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
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
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 dark:bg-zinc-800 text-amber-600 dark:text-amber-400">
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
                          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-xs cursor-pointer"
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
                          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-xs cursor-pointer shrink-0"
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
            <div className="w-full lg:w-64 xl:w-72 shrink-0 bg-white dark:bg-zinc-950 border-l border-zinc-200/80 dark:border-zinc-850 p-4 sm:p-5 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Header: >> Create */}
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-amber-500 font-black text-base tracking-tight font-mono">
                    &gt;&gt;
                  </span>
                  <h2 className="text-base font-black text-black dark:text-white tracking-tight">
                    Create
                  </h2>
                </div>

                {/* 2-Column Grid of 12 Interactive Tools */}
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-3 border border-zinc-200/80 dark:border-zinc-800">
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
                          className="bg-white dark:bg-zinc-800/90 hover:bg-amber-50 dark:hover:bg-zinc-700 hover:border-amber-400/50 rounded-2xl p-2.5 flex flex-col items-center justify-center text-center gap-1 shadow-2xs hover:shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                          title={tool.description}
                        >
                          <Icon className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover:text-amber-500 transition-colors" />
                          <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate w-full">
                            {tool.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Smart Board / Projects Card */}
                <div
                  onClick={() => setActiveCreateModal("smartboard")}
                  className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-3.5 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between cursor-pointer hover:shadow-xs transition-all group"
                >
                  <div>
                    <div className="text-xs font-black text-black dark:text-white group-hover:text-amber-500 transition-colors leading-tight">
                      Smart Board
                    </div>
                    <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                      /Projects
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Presentation className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Floating Pill Button: Wakheel AI */}
              <div className="pt-4">
                <button
                  onClick={() => setShowFloatingAI(true)}
                  className="w-full bg-zinc-950 hover:bg-black text-white px-4 py-2.5 rounded-full flex items-center justify-between shadow-lg cursor-pointer hover:scale-102 active:scale-98 transition-all border border-zinc-800 hover:border-amber-500/50 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-sm shadow-amber-500" />
                    <span className="text-xs font-black tracking-wide text-white">
                      Wakheel AI
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-black">
                    CO-COUNSEL
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
        {activeSection === "free_mocks" && renderCbtMockSimulator()}

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
        {/* SECTION: DIGITAL LIBRARY (Wakheel SCREENSHOT FEATURE)           */}
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
        {/* SECTION: CORNELL NOTEBOOK (Wakheel SCREENSHOT FEATURE)          */}
        {/* ============================================================== */}
        {activeSection === "notebook" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Total Cornell Sheets</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-black dark:text-white">{studentNotes.length}</span>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Archived</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Bookmarked Precedents</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-amber-500">{studentNotes.filter((n) => n.isBookmarked).length}</span>
                  <span className="text-[11px] font-bold text-zinc-400">Starred</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Faculty Master Syntheses</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-black dark:text-white">{studentNotes.filter((n) => n.isFacultyShared).length}</span>
                  <span className="text-[11px] font-bold text-zinc-400">Certified</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Curriculum Coverage</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-black dark:text-white">
                    {Array.from(new Set(studentNotes.map((n) => n.subject))).length}
                  </span>
                  <span className="text-[11px] font-bold text-zinc-400">Subjects</span>
                </div>
              </div>
            </div>

            {/* Header & Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Harvard-Cornell Appellate Standard
                  </span>
                  <span className="text-xs text-zinc-400">• Cross-Session Synced</span>
                </div>
                <h3 className="text-xl font-black text-black dark:text-white mt-1">Interactive Cornell Law Notebook &amp; Case Brief Studio</h3>
                <p className="text-xs text-zinc-500">Cues, statutory mechanics, doctrine synthesis, and instant export.</p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleOpenAddNoteModal}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white dark:hover:bg-amber-400 dark:hover:text-black text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Cornell Note</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={notesSearchQuery}
                  onChange={(e) => setNotesSearchQuery(e.target.value)}
                  placeholder="Search by topic, statutory section, landmark case, or cue keyword..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-amber-500 transition-colors"
                />
                {notesSearchQuery && (
                  <button
                    onClick={() => setNotesSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Subject Filter */}
              <select
                value={notesSubjectFilter}
                onChange={(e) => setNotesSubjectFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="All">All Curriculum Subjects</option>
                <option value="Constitutional Law">Constitutional Law</option>
                <option value="Criminal Jurisprudence (BNS & BNSS)">Criminal Jurisprudence (BNS & BNSS)</option>
                <option value="Law of Contracts">Law of Contracts</option>
                <option value="Law of Torts & Environment">Law of Torts & Environment</option>
              </select>

              {/* View Tabs */}
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setNotesFilterTab("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    notesFilterTab === "all"
                      ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                      : "text-zinc-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  All ({studentNotes.length})
                </button>
                <button
                  onClick={() => setNotesFilterTab("bookmarked")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    notesFilterTab === "bookmarked"
                      ? "bg-amber-500 text-black font-extrabold shadow-xs"
                      : "text-zinc-500 hover:text-amber-500"
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Starred ({studentNotes.filter((n) => n.isBookmarked).length})</span>
                </button>
                <button
                  onClick={() => setNotesFilterTab("faculty")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    notesFilterTab === "faculty"
                      ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                      : "text-zinc-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  Faculty Master ({studentNotes.filter((n) => n.isFacultyShared).length})
                </button>
              </div>
            </div>

            {/* Split Screen Cornell Workspace */}
            {(() => {
              const filteredNotes = studentNotes.filter((note) => {
                const q = notesSearchQuery.toLowerCase();
                const matchesSearch =
                  !q ||
                  note.title.toLowerCase().includes(q) ||
                  note.subject.toLowerCase().includes(q) ||
                  (note.topic && note.topic.toLowerCase().includes(q)) ||
                  note.cues.some((c) => c.toLowerCase().includes(q)) ||
                  note.content.toLowerCase().includes(q) ||
                  note.summary.toLowerCase().includes(q);

                const matchesSubject = notesSubjectFilter === "All" || note.subject === notesSubjectFilter;

                const matchesTab =
                  notesFilterTab === "all" ||
                  (notesFilterTab === "bookmarked" && note.isBookmarked) ||
                  (notesFilterTab === "faculty" && note.isFacultyShared);

                return matchesSearch && matchesSubject && matchesTab;
              });

              const activeNote =
                studentNotes.find((n) => n.id === selectedNoteId) || filteredNotes[0] || studentNotes[0];

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Note Index Selector (4 cols) */}
                  <div className="lg:col-span-4 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider px-1">
                      <span>Index ({filteredNotes.length})</span>
                      <span>Chronological</span>
                    </div>

                    <div className="space-y-2.5 max-h-[820px] overflow-y-auto pr-1">
                      {filteredNotes.length === 0 ? (
                        <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
                          <SearchX className="w-8 h-8 text-zinc-400 mx-auto" />
                          <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">No matching Cornell notes found</p>
                          <button
                            onClick={() => {
                              setNotesSearchQuery("");
                              setNotesSubjectFilter("All");
                              setNotesFilterTab("all");
                            }}
                            className="text-xs text-amber-600 dark:text-amber-400 font-bold underline cursor-pointer"
                          >
                            Reset filters
                          </button>
                        </div>
                      ) : (
                        filteredNotes.map((note) => {
                          const isSelected = activeNote && activeNote.id === note.id;
                          return (
                            <div
                              key={note.id}
                              onClick={() => handleSelectNote(note)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                                isSelected
                                  ? "bg-amber-500/10 border-amber-500 text-black dark:text-white shadow-xs"
                                  : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                                <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tight">
                                  {note.subject}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleCornellBookmark(note.id);
                                    }}
                                    className="p-1 text-zinc-400 hover:text-amber-500 cursor-pointer"
                                    title={note.isBookmarked ? "Remove Bookmark" : "Bookmark Note"}
                                  >
                                    <Star
                                      className={`w-3.5 h-3.5 ${
                                        note.isBookmarked ? "fill-amber-500 text-amber-500" : ""
                                      }`}
                                    />
                                  </button>
                                  <span className="text-zinc-400">{note.lastEdited}</span>
                                </div>
                              </div>

                              <h4 className="text-sm font-bold text-black dark:text-white leading-snug line-clamp-2">
                                {note.title}
                              </h4>

                              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1.5 font-serif italic">
                                &ldquo;{note.summary}&rdquo;
                              </p>

                              {/* Cues Pill Preview */}
                              <div className="flex flex-wrap gap-1 mt-2.5">
                                {note.cues.slice(0, 2).map((cue, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[9.5px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                  >
                                    {cue}
                                  </span>
                                ))}
                                {note.cues.length > 2 && (
                                  <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                                    +{note.cues.length - 2}
                                  </span>
                                )}
                                {note.isFacultyShared && (
                                  <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-amber-500 text-black ml-auto">
                                    FACULTY CERTIFIED
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Column: Active Cornell Law Revision Sheet (8 cols) */}
                  <div className="lg:col-span-8 space-y-6">
                    {activeNote ? (
                      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-7 space-y-6 shadow-sm">
                        {/* Note Canvas Header Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                                {activeNote.subject}
                              </span>
                              {activeNote.topic && (
                                <span className="text-[10px] font-mono text-zinc-500">
                                  • {activeNote.topic}
                                </span>
                              )}
                              {activeNote.isFacultyShared && (
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-400">
                                  Faculty Model Brief
                                </span>
                              )}
                              {saveStatusNotice && (
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse">
                                  {saveStatusNotice}
                                </span>
                              )}
                            </div>

                            {isEditingNote && activeEditNote ? (
                              <input
                                type="text"
                                value={activeEditNote.title}
                                onChange={(e) =>
                                  setActiveEditNote({ ...activeEditNote, title: e.target.value })
                                }
                                className="w-full text-xl font-black text-black dark:text-white bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 mt-1"
                              />
                            ) : (
                              <h3 className="text-xl sm:text-2xl font-black text-black dark:text-white leading-tight">
                                {activeNote.title}
                              </h3>
                            )}

                            <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-3 pt-0.5">
                              <span>Author: {activeNote.author}</span>
                              <span>•</span>
                              <span>Revised: {activeNote.lastEdited}</span>
                            </div>
                          </div>

                          {/* Action Toolbar */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Star Bookmark */}
                            <button
                              onClick={() => handleToggleCornellBookmark(activeNote.id)}
                              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                activeNote.isBookmarked
                                  ? "bg-amber-500/10 border-amber-500 text-amber-500"
                                  : "border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-black dark:hover:text-white"
                              }`}
                              title={activeNote.isBookmarked ? "Starred" : "Bookmark this Note"}
                            >
                              <Star className={`w-4 h-4 ${activeNote.isBookmarked ? "fill-amber-500" : ""}`} />
                            </button>

                            {/* Edit / Preview Toggle */}
                            <button
                              onClick={() => {
                                if (isEditingNote) {
                                  handleSaveActiveNote();
                                  setIsEditingNote(false);
                                } else {
                                  setActiveEditNote({ ...activeNote });
                                  setIsEditingNote(true);
                                }
                              }}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                isEditingNote
                                  ? "bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold shadow-sm"
                                  : "border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              }`}
                            >
                              {isEditingNote ? (
                                <>
                                  <Save className="w-3.5 h-3.5" />
                                  <span>Save Changes</span>
                                </>
                              ) : (
                                <>
                                  <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Edit Note</span>
                                </>
                              )}
                            </button>

                            {/* Export HTML / Print */}
                            <button
                              onClick={() => exportCornellNoteAsHtml(isEditingNote && activeEditNote ? activeEditNote : activeNote)}
                              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="Print / Export Harvard-Cornell Sheet (PDF)"
                            >
                              <Printer className="w-4 h-4 text-amber-500" />
                            </button>

                            {/* Download TXT */}
                            <button
                              onClick={() => exportCornellNoteAsTxt(isEditingNote && activeEditNote ? activeEditNote : activeNote)}
                              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="Download Text File (.txt)"
                            >
                              <FileDown className="w-4 h-4 text-zinc-500" />
                            </button>

                            {/* Delete Note */}
                            <button
                              onClick={() => handleDeleteActiveNote(activeNote.id)}
                              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-rose-500 hover:border-rose-300 transition-colors cursor-pointer"
                              title="Delete Note"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Cornell Split-Screen 2-Column Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                          {/* Left Column: Recall Cues, Statutes, Precedents (5 cols) */}
                          <div className="md:col-span-5 space-y-5 p-4 sm:p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                            {/* Recall Cues */}
                            <div className="space-y-2.5">
                              <span className="text-[11px] font-mono font-extrabold uppercase text-amber-700 dark:text-amber-400 flex items-center justify-between">
                                <span>Recall Cues &amp; Questions</span>
                                <span className="text-[10px] font-normal text-zinc-400">({(isEditingNote && activeEditNote ? activeEditNote.cues : activeNote.cues).length})</span>
                              </span>

                              <ul className="space-y-1.5">
                                {(isEditingNote && activeEditNote ? activeEditNote.cues : activeNote.cues).map((cue, idx) => (
                                  <li
                                    key={idx}
                                    className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between gap-1.5 p-1.5 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-amber-500/10"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-amber-500">•</span>
                                      <span>{cue}</span>
                                    </div>
                                    {isEditingNote && (
                                      <button
                                        onClick={() => handleRemoveCueTagFromActive(idx)}
                                        className="text-zinc-400 hover:text-rose-500 text-xs px-1 cursor-pointer"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </li>
                                ))}
                              </ul>

                              {isEditingNote && (
                                <div className="flex items-center gap-1.5 pt-1">
                                  <input
                                    type="text"
                                    value={newCueTag}
                                    onChange={(e) => setNewCueTag(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddCueTagToActive();
                                      }
                                    }}
                                    placeholder="Add recall cue + Enter..."
                                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none focus:border-amber-500"
                                  />
                                  <button
                                    onClick={handleAddCueTagToActive}
                                    className="px-2 py-1.5 rounded-lg bg-amber-500 text-black font-extrabold text-xs cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Statutes & Enactments */}
                            <div className="space-y-2 pt-2 border-t border-amber-500/15">
                              <span className="text-[11px] font-mono font-extrabold uppercase text-zinc-700 dark:text-zinc-300 block">
                                Statutory Anchors &amp; Sections
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {(isEditingNote && activeEditNote
                                  ? activeEditNote.statutoryReferences
                                  : activeNote.statutoryReferences
                                ).map((statute, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1"
                                  >
                                    <span>{statute}</span>
                                    {isEditingNote && (
                                      <button
                                        onClick={() => handleRemoveStatuteFromActive(idx)}
                                        className="text-zinc-400 hover:text-rose-500 cursor-pointer"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </span>
                                ))}
                              </div>

                              {isEditingNote && (
                                <div className="flex items-center gap-1.5 pt-1">
                                  <input
                                    type="text"
                                    value={newStatuteTag}
                                    onChange={(e) => setNewStatuteTag(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddStatuteToActive();
                                      }
                                    }}
                                    placeholder="Add section (e.g. S.480 BNSS)..."
                                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none focus:border-amber-500"
                                  />
                                  <button
                                    onClick={handleAddStatuteToActive}
                                    className="px-2 py-1.5 rounded-lg bg-amber-500 text-black font-extrabold text-xs cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Landmark Precedents */}
                            <div className="space-y-2 pt-2 border-t border-amber-500/15">
                              <span className="text-[11px] font-mono font-extrabold uppercase text-zinc-700 dark:text-zinc-300 block">
                                Landmark Precedents &amp; Citations
                              </span>
                              <div className="space-y-1.5">
                                {(isEditingNote && activeEditNote
                                  ? activeEditNote.landmarkCases
                                  : activeNote.landmarkCases
                                ).map((c, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between gap-1 p-1 rounded bg-white/50 dark:bg-zinc-900/50"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <Scale className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                      <span>{c}</span>
                                    </div>
                                    {isEditingNote && (
                                      <button
                                        onClick={() => handleRemoveCaseFromActive(idx)}
                                        className="text-zinc-400 hover:text-rose-500 text-xs px-1 cursor-pointer"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {isEditingNote && (
                                <div className="flex items-center gap-1.5 pt-1">
                                  <input
                                    type="text"
                                    value={newCaseTag}
                                    onChange={(e) => setNewCaseTag(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddCaseToActive();
                                      }
                                    }}
                                    placeholder="Add case citation + Enter..."
                                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none focus:border-amber-500"
                                  />
                                  <button
                                    onClick={handleAddCaseToActive}
                                    className="px-2 py-1.5 rounded-lg bg-amber-500 text-black font-extrabold text-xs cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Column: Core Legal Formulation & Content (7 cols) */}
                          <div className="md:col-span-7 space-y-3 p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                                <span className="text-[11px] font-mono font-extrabold uppercase text-zinc-600 dark:text-zinc-400">
                                  Core Legal Formulation &amp; Statutory Analysis
                                </span>
                                {isEditingNote && (
                                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                                    LIVE EDIT MODE
                                  </span>
                                )}
                              </div>

                              {isEditingNote && activeEditNote ? (
                                <div className="space-y-2">
                                  {/* Quick Insertion Toolbar */}
                                  <div className="flex flex-wrap gap-1.5 pb-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const snippet = "\n\n### ⚖ RATIO DECIDENDI:\n";
                                        setActiveEditNote({
                                          ...activeEditNote,
                                          content: activeEditNote.content + snippet,
                                        });
                                      }}
                                      className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-amber-500 hover:text-black cursor-pointer"
                                    >
                                      + Ratio Decidendi
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const snippet = "\n\n📌 QUESTION OF LAW:\n- ";
                                        setActiveEditNote({
                                          ...activeEditNote,
                                          content: activeEditNote.content + snippet,
                                        });
                                      }}
                                      className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-amber-500 hover:text-black cursor-pointer"
                                    >
                                      + Question of Law
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const snippet = "\n\n📜 STATUTORY PROVISION & TESTS:\n";
                                        setActiveEditNote({
                                          ...activeEditNote,
                                          content: activeEditNote.content + snippet,
                                        });
                                      }}
                                      className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-amber-500 hover:text-black cursor-pointer"
                                    >
                                      + Statutory Tests
                                    </button>
                                  </div>

                                  <textarea
                                    rows={16}
                                    value={activeEditNote.content}
                                    onChange={(e) =>
                                      setActiveEditNote({ ...activeEditNote, content: e.target.value })
                                    }
                                    className="w-full p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-serif leading-relaxed text-black dark:text-white focus:outline-none focus:border-amber-500"
                                    placeholder="Write legal analysis, doctrinal breakdown, and tests..."
                                  />
                                </div>
                              ) : (
                                <div className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line font-serif py-1">
                                  {activeNote.content}
                                </div>
                              )}
                            </div>

                            {/* Word count & Save footer */}
                            {isEditingNote && activeEditNote && (
                              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                                <span>
                                  {activeEditNote.content.split(/\s+/).filter(Boolean).length} words • {activeEditNote.content.length} characters
                                </span>
                                <button
                                  type="button"
                                  onClick={handleSaveActiveNote}
                                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black font-extrabold hover:bg-black hover:text-white dark:hover:bg-amber-400 dark:hover:text-black transition-colors cursor-pointer"
                                >
                                  Save Progress
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Row: Cornell 3rd Zone (Executive Summary & Ratio) */}
                        <div className="p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-amber-500/30 space-y-2 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                          <div className="flex items-center justify-between pl-2">
                            <span className="text-[11px] font-mono font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>Executive Summary &amp; Ratio Decidendi (Cornell Bottom Quadrant)</span>
                            </span>
                            {isEditingNote && (
                              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                                Editable
                              </span>
                            )}
                          </div>

                          {isEditingNote && activeEditNote ? (
                            <textarea
                              rows={3}
                              value={activeEditNote.summary}
                              onChange={(e) =>
                                setActiveEditNote({ ...activeEditNote, summary: e.target.value })
                              }
                              className="w-full p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-serif italic text-black dark:text-white focus:outline-none focus:border-amber-500 ml-2"
                              placeholder="Write a concise executive takeaway summarizing the core ratio decidendi..."
                            />
                          ) : (
                            <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 italic font-medium pl-2 leading-relaxed font-serif">
                              &ldquo;{activeNote.summary}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                        <BookText className="w-12 h-12 text-zinc-400 mx-auto" />
                        <h4 className="text-base font-bold text-black dark:text-white">Select a Cornell Note to view</h4>
                        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                          Choose an existing note from the left index or click &apos;New Cornell Note&apos; to author a new legal synthesis.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: DOCUMENT & BRIEF UPLOAD (Wakheel SCREENSHOT FEATURE)   */}
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
                    const newDoc = {
                      id: `up_${Date.now()}`,
                      name: `Constitutional_Memo_${Date.now().toString().slice(-4)}.pdf`,
                      category: uploadCategory,
                      size: "3.2 MB",
                      date: "Just now",
                      status: "Under Review",
                      score: "Pending",
                      facultyFeedback: "Evaluating against consortium rubric.",
                    };
                    const updated = [newDoc, ...uploadedDocuments];
                    setUploadedDocuments(updated);
                    try {
                      localStorage.setItem("wakheel_student_uploads", JSON.stringify(updated));
                    } catch {}
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
                {uploadedDocuments.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-sm font-bold text-black dark:text-white">No documents uploaded yet</h5>
                      <p className="text-xs text-zinc-500 max-w-sm">
                        Upload your legal case briefs, court petitions, or study notes above to have them indexed and graded.
                      </p>
                    </div>
                  </div>
                ) : (
                  uploadedDocuments.map((doc) => (
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
                ))
              )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: RECORDING & AUDIO MASTERCLASS STUDIO (OPTION 6)       */}
        {/* ============================================================== */}
        {activeSection === "record" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Studio Header & Tab Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Faculty Audio Chambers
                  </span>
                  <span className="text-xs text-zinc-400">• Cross-Platform Synchronized</span>
                </div>
                <h3 className="text-xl font-black text-black dark:text-white mt-1">
                  Faculty Audio Masterclasses &amp; Moot Court Recording Studio
                </h3>
                <p className="text-xs text-zinc-500">
                  Listen to live-synced faculty legal podcasts with ratio analysis, or practice your moot oral submissions.
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 shrink-0">
                <button
                  onClick={() => setAudioStudioTab("lectures")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    audioStudioTab === "lectures"
                      ? "bg-amber-500 text-black font-extrabold shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Faculty Masterclasses ({facultyLectures.length})</span>
                </button>
                <button
                  onClick={() => setAudioStudioTab("moot_practice")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    audioStudioTab === "moot_practice"
                      ? "bg-amber-500 text-black font-extrabold shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Student Oral Moot Recorder</span>
                </button>
              </div>
            </div>

            {/* TAB 1: FACULTY AUDIO MASTERCLASSES & PODCASTS */}
            {audioStudioTab === "lectures" && (
              <div className="space-y-6">
                {/* 4 Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Available Lectures</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-black dark:text-white">{facultyLectures.length}</span>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Published</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Active Cohort Streams</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-emerald-500">
                        {facultyLectures.reduce((acc, l) => acc + l.listensCount, 0)}
                      </span>
                      <span className="text-[11px] font-bold text-zinc-400">Listens</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Legal Curricula</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-black dark:text-white">
                        {Array.from(new Set(facultyLectures.map((l) => l.subject))).length}
                      </span>
                      <span className="text-[11px] font-bold text-zinc-400">Disciplines</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Playback Standard</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-amber-500">Lossless</span>
                      <span className="text-[11px] font-bold text-zinc-400">48kHz PCM</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Master Audio Player Console */}
                {activePlayingLecture ? (
                  <div className="p-6 sm:p-7 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-xl space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-black uppercase">
                            {activePlayingLecture.category}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono">•</span>
                          <span className="text-xs text-zinc-400 font-mono">{activePlayingLecture.subject}</span>
                          {isPlayingAudio && (
                            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                              <Radio className="w-3 h-3 text-emerald-400" />
                              <span>STREAMING LIVE</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                          {activePlayingLecture.title}
                        </h3>

                        <div className="text-xs text-zinc-400 font-mono flex items-center gap-3">
                          <span>Faculty: <strong className="text-amber-400">{activePlayingLecture.facultyName}</strong></span>
                          <span>•</span>
                          <span>Target: {activePlayingLecture.targetBatch}</span>
                        </div>
                      </div>

                      {/* Download Audio */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => downloadLectureAudio(activePlayingLecture)}
                          className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-bold text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Download Audio File"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download WAV</span>
                        </button>
                      </div>
                    </div>

                    {/* Equalizer Visualizer & Player Controls */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* Left: Play/Pause & Equalizer (7 cols) */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="flex items-center gap-4">
                          {/* Big Play / Pause Button */}
                          <button
                            onClick={() => handleTogglePlayStudentLecture(activePlayingLecture)}
                            className="w-14 h-14 rounded-2xl bg-amber-500 hover:bg-white text-black flex items-center justify-center font-bold shadow-lg transition-transform hover:scale-105 cursor-pointer shrink-0"
                          >
                            {isPlayingAudio ? (
                              <Pause className="w-6 h-6 fill-current" />
                            ) : (
                              <Play className="w-6 h-6 fill-current ml-0.5" />
                            )}
                          </button>

                          {/* Dynamic Equalizer Bars */}
                          <div className="flex-1 h-12 bg-zinc-900/80 rounded-xl border border-zinc-800/80 flex items-center justify-center gap-1 px-3 overflow-hidden">
                            {Array.from({ length: 24 }).map((_, i) => (
                              <div
                                key={i}
                                style={{
                                  height: isPlayingAudio
                                    ? `${Math.max(15, Math.floor(Math.sin(i * 0.7 + audioCurrentTime * 3) * 35 + 45))}%`
                                    : "15%",
                                  transition: "height 0.15s ease-in-out",
                                }}
                                className={`w-1.5 rounded-full ${
                                  isPlayingAudio ? "bg-amber-400" : "bg-zinc-700"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Seek Slider & Timestamps */}
                        <div className="space-y-1">
                          <input
                            type="range"
                            min="0"
                            max={audioTotalDuration || activePlayingLecture.durationSeconds || 100}
                            value={audioCurrentTime}
                            onChange={(e) => handleSeekAudio(Number(e.target.value))}
                            className="w-full accent-amber-500 cursor-pointer"
                          />
                          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                            <span>
                              {Math.floor(audioCurrentTime / 60)
                                .toString()
                                .padStart(2, "0")}
                              :
                              {Math.floor(audioCurrentTime % 60)
                                .toString()
                                .padStart(2, "0")}
                            </span>
                            <span>{activePlayingLecture.duration}</span>
                          </div>
                        </div>

                        {/* Speed Controls */}
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[11px] font-mono text-zinc-400">Playback Speed:</span>
                          {[1, 1.25, 1.5, 2].map((spd) => (
                            <button
                              key={spd}
                              onClick={() => handleChangePlaybackSpeed(spd)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                                audioPlaybackSpeed === spd
                                  ? "bg-amber-500 text-black font-extrabold"
                                  : "bg-zinc-900 text-zinc-400 hover:text-white"
                              }`}
                            >
                              {spd}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Right: Synchronized Statutory Notes & Ratios (5 cols) */}
                      <div className="lg:col-span-5 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                        <span className="text-[10px] font-mono font-extrabold uppercase text-amber-400 block tracking-wider">
                          ⚖ Synchronized Judicial Ratio &amp; Notes
                        </span>
                        <p className="text-xs text-zinc-300 font-serif leading-relaxed line-clamp-4">
                          {activePlayingLecture.statutoryNotes}
                        </p>
                        <div className="space-y-1 pt-1 border-t border-zinc-800">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">Key Precedent Citations:</span>
                          <div className="flex flex-wrap gap-1">
                            {activePlayingLecture.keyCitations.map((c, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-amber-300 border border-amber-500/20"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
                    <Headphones className="w-10 h-10 text-zinc-400 mx-auto" />
                    <h4 className="text-sm font-bold text-black dark:text-white">Select a Lecture to Begin Listening</h4>
                    <p className="text-xs text-zinc-500">Pick any masterclass from the repository below.</p>
                  </div>
                )}

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={audioSearchFilter}
                      onChange={(e) => setAudioSearchFilter(e.target.value)}
                      placeholder="Search audio lectures by topic, faculty, or citation..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <select
                    value={audioSubjectFilter}
                    onChange={(e) => setAudioSubjectFilter(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-black dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="All">All Disciplines</option>
                    <option value="Constitutional Law">Constitutional Law</option>
                    <option value="Criminal Procedure (BNSS 2023)">Criminal Procedure (BNSS 2023)</option>
                    <option value="Law of Contracts">Law of Contracts</option>
                    <option value="Bharatiya Nyaya Sanhita (BNS 2023)">Bharatiya Nyaya Sanhita (BNS 2023)</option>
                  </select>
                </div>

                {/* Lectures Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {facultyLectures
                    .filter((l) => {
                      const q = audioSearchFilter.toLowerCase();
                      const matchesSearch =
                        !q ||
                        l.title.toLowerCase().includes(q) ||
                        l.facultyName.toLowerCase().includes(q) ||
                        l.statutoryNotes.toLowerCase().includes(q) ||
                        l.keyCitations.some((c) => c.toLowerCase().includes(q));
                      const matchesSub =
                        audioSubjectFilter === "All" ||
                        l.subject.toLowerCase() === audioSubjectFilter.toLowerCase();
                      return matchesSearch && matchesSub;
                    })
                    .map((lecture) => {
                      const isCurrentlyPlaying = activePlayingLecture?.id === lecture.id && isPlayingAudio;
                      return (
                        <div
                          key={lecture.id}
                          className={`p-5 rounded-3xl bg-white dark:bg-zinc-900 border transition-all shadow-xs space-y-3.5 ${
                            activePlayingLecture?.id === lecture.id
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
                              <h4 className="text-base font-black text-black dark:text-white leading-snug">
                                {lecture.title}
                              </h4>
                              <div className="text-xs text-zinc-500">
                                By <strong className="text-zinc-800 dark:text-zinc-200">{lecture.facultyName}</strong> • {lecture.targetBatch}
                              </div>
                            </div>

                            <button
                              onClick={() => handleTogglePlayStudentLecture(lecture)}
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold transition-all shadow-md cursor-pointer shrink-0 ${
                                isCurrentlyPlaying
                                  ? "bg-black text-amber-400 dark:bg-white dark:text-black animate-pulse"
                                  : "bg-amber-500 hover:bg-black hover:text-white text-black"
                              }`}
                            >
                              {isCurrentlyPlaying ? (
                                <Pause className="w-5 h-5 fill-current" />
                              ) : (
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                              )}
                            </button>
                          </div>

                          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-serif">
                            {lecture.statutoryNotes}
                          </p>

                          <div className="flex flex-wrap gap-1">
                            {lecture.keyCitations.map((c, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                              >
                                ⚖ {c}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-400">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                              <Headphones className="w-3.5 h-3.5" />
                              <span>{lecture.listensCount} listens</span>
                            </span>
                            <button
                              onClick={() => downloadLectureAudio(lecture)}
                              className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                            >
                              <Download className="w-3 h-3" />
                              <span>Save Offline</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* TAB 2: STUDENT ORAL MOOT ARGUMENT RECORDER */}
            {audioStudioTab === "moot_practice" && (
              <div className="space-y-6">
                {/* Recording Console */}
                <div className="p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 text-center space-y-6 relative overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-mono">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          studentIsRecording
                            ? studentIsPaused
                              ? "bg-amber-400"
                              : "bg-rose-500 animate-ping"
                            : "bg-emerald-500"
                        }`}
                      />
                      <span className="text-zinc-300 uppercase font-bold tracking-wider">
                        {studentIsRecording
                          ? studentIsPaused
                            ? "PAUSED"
                            : `LIVE RECORDING (${studentRecordSeconds}s)`
                          : "STUDIO READY • MIC ARMED"}
                      </span>
                    </span>
                    <span className="text-xs font-mono text-zinc-400">Gemini 2.5 Speech Engine</span>
                  </div>

                  {/* Animated Waveform Bars */}
                  <div className="h-28 flex items-center justify-center gap-1.5 px-4">
                    {studentWaveformLevels.map((lvl, i) => (
                      <div
                        key={i}
                        className={`w-2 rounded-full transition-all duration-150 ${
                          studentIsRecording && !studentIsPaused
                            ? "bg-amber-400 animate-pulse"
                            : "bg-zinc-800"
                        }`}
                        style={{
                          height: studentIsRecording && !studentIsPaused ? `${lvl}%` : "15%",
                        }}
                      />
                    ))}
                  </div>

                  {/* Topic and Dept Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
                    <div>
                      <label className="text-[11px] font-mono font-bold text-zinc-400 block mb-1">Argument Topic</label>
                      <input
                        type="text"
                        value={studentMootTopic}
                        onChange={(e) => setStudentMootTopic(e.target.value)}
                        placeholder="e.g. Oral Submission: Article 19(1)(a)"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono font-bold text-zinc-400 block mb-1">Discipline</label>
                      <select
                        value={studentMootDept}
                        onChange={(e) => setStudentMootDept(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="Constitutional Law">Constitutional Law</option>
                        <option value="Criminal Jurisprudence (BNS)">Criminal Jurisprudence (BNS)</option>
                        <option value="Law of Contracts">Law of Contracts</option>
                        <option value="Law of Torts">Law of Torts</option>
                      </select>
                    </div>
                  </div>

                  {/* Real-time AI Transcript preview */}
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-left space-y-1 max-w-xl mx-auto">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                      Simulated Real-Time AI Speech-to-Text Transcript:
                    </span>
                    <p className="text-xs text-zinc-300 font-serif leading-relaxed italic">
                      {studentIsRecording
                        ? "“May it please Your Lordship, I appear on behalf of the appellant. Under Article 19(1)(a) of the Constitution, reasonable restrictions under Article 19(2) must satisfy the strict proportionality test...”"
                        : "Press 'Start Recording' to begin your oral argument session with real-time transcription."}
                    </p>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-center gap-4 pt-2">
                    {!studentIsRecording ? (
                      <button
                        onClick={() => {
                          setStudentIsRecording(true);
                          setStudentIsPaused(false);
                          setStudentRecordSeconds(1);
                        }}
                        className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-lg hover:scale-105"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Start Oral Argument</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setStudentIsPaused(!studentIsPaused)}
                          className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          {studentIsPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                          <span>{studentIsPaused ? "Resume" : "Pause"}</span>
                        </button>
                        <button
                          onClick={handleSaveStudentOralRecording}
                          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                        >
                          <Square className="w-4 h-4" />
                          <span>Stop &amp; Save Oral Brief</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Saved Recordings Table */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-black dark:text-white">
                      Saved Moot Recordings &amp; AI Analysis ({studentSavedRecordings.length})
                    </h4>
                    {recordingSavedNotice && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
                        ✓ Saved to Archives!
                      </span>
                    )}
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {studentSavedRecordings.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                          <Mic className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-sm font-bold text-black dark:text-white">No oral arguments in archive</h5>
                          <p className="text-xs text-zinc-500 max-w-sm">
                            Record your oral submission or moot plea above to generate an audio recording and real-time AI legal appraisal.
                          </p>
                        </div>
                      </div>
                    ) : (
                      studentSavedRecordings.map((rec) => (
                      <div key={rec.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-black dark:text-white text-sm">{rec.title}</div>
                          <div className="text-[11px] text-zinc-500 font-mono">
                            {rec.subject} • Duration: {rec.duration} • {rec.date}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            {rec.score}
                          </span>
                          <button
                            onClick={() => {
                              const audio = new Audio(rec.audioUrl);
                              audio.play();
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Play</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: TUITION MODE (Wakheel SCREENSHOT FEATURE)              */}
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
                    onClick={() =>
                      setLiveChamberModal({
                        isOpen: true,
                        roomId: `chamber_${idx + 1}`,
                        roomTitle: room.title,
                        topic: room.topic,
                        mentorName: room.mentor,
                      })
                    }
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
        {/* SECTION: EXAM CRACKER (Wakheel SCREENSHOT FEATURE)              */}
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

            {/* High-Yield Mock Drill CTA */}
            <div className="p-5 rounded-3xl bg-zinc-950 text-white border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase">
                  Timed CBT Simulation
                </span>
                <h4 className="text-sm font-bold">Ready to apply these constitutional ratios in a live 120-minute mock?</h4>
                <p className="text-xs text-zinc-400">Consortium CLAT format with negative marking (-0.25) and instant diagnostic scorecard.</p>
              </div>
              <button
                onClick={() => {
                  handleStartCbtExam();
                  setActiveSection("tests");
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all cursor-pointer shrink-0"
              >
                Launch Live CBT Mock →
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: HOMEWORK TRACKER (OPTION 4 DYNAMIC WORKFLOW)          */}
        {/* ============================================================== */}
        {activeSection === "homework" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Pending Tasks</span>
                <span className="text-xl font-black text-amber-500 font-mono">
                  {assignmentsList.filter((a) => !submissionsList.some((s) => s.assignmentId === a.id)).length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Submitted &amp; In Review</span>
                <span className="text-xl font-black text-black dark:text-white font-mono">
                  {submissionsList.filter((s) => s.status === "Pending Evaluation").length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-2xs">
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold block">
                  Graded Briefs
                </span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {submissionsList.filter((s) => s.status === "Graded").length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Coursework Tasks</span>
                <span className="text-xl font-black text-black dark:text-white font-mono">
                  {assignmentsList.length}
                </span>
              </div>
            </div>

            {/* Homework Tabs */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHomeworkTab("pending")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  homeworkTab === "pending"
                    ? "bg-amber-500 text-black font-extrabold shadow-xs"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Pending Tasks</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/15 text-black font-mono">
                  {assignmentsList.filter((a) => !submissionsList.some((s) => s.assignmentId === a.id)).length}
                </span>
              </button>
              <button
                onClick={() => setHomeworkTab("completed")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  homeworkTab === "completed"
                    ? "bg-amber-500 text-black font-extrabold shadow-xs"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Submitted &amp; Graded</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/15 text-black font-mono">
                  {submissionsList.length}
                </span>
              </button>
            </div>

            {/* TAB 1: PENDING ASSIGNMENTS */}
            {homeworkTab === "pending" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assignmentsList
                  .filter((a) => !submissionsList.some((s) => s.assignmentId === a.id))
                  .map((hw) => (
                    <div
                      key={hw.id}
                      className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase">
                            {hw.badge || hw.subject}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">Due: {hw.dueDate}</span>
                        </div>
                        <h4 className="text-base font-bold text-black dark:text-white leading-snug">
                          {hw.title}
                        </h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-serif leading-relaxed">
                          {hw.instructions}
                        </p>
                        {hw.referenceRatio && (
                          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-500 font-mono">
                            <strong className="text-zinc-700 dark:text-zinc-300">Reference: </strong>
                            {hw.referenceRatio}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-1">
                          <span>Faculty: {hw.faculty}</span>
                          <span>Max Marks: {hw.maxScore}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                        <button
                          onClick={() => {
                            setActiveAssignmentForSubmission(hw);
                            setSubIssues("");
                            setSubPleadings("");
                            setSubPrayer("");
                            setSubAttachmentName("");
                          }}
                          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Draft &amp; Submit Brief</span>
                        </button>
                      </div>
                    </div>
                  ))}

                {assignmentsList.filter((a) => !submissionsList.some((s) => s.assignmentId === a.id)).length === 0 && (
                  <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                    <h3 className="text-lg font-bold text-black dark:text-white">All Caught Up!</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      You have submitted all active coursework assignments. Check the "Submitted &amp; Graded" tab to review faculty evaluations and scores.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: COMPLETED & GRADED SUBMISSIONS */}
            {homeworkTab === "completed" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {submissionsList.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        {sub.status === "Pending Evaluation" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold border border-amber-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            Pending Faculty Evaluation
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Score: {sub.grade || `${sub.score}/50`}
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-zinc-400">{sub.submittedDate}</span>
                      </div>

                      <h4 className="text-base font-bold text-black dark:text-white leading-snug">
                        {sub.assignmentTitle}
                      </h4>

                      {sub.issuesRaised && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-serif line-clamp-2">
                          <strong className="text-black dark:text-white font-sans text-[11px]">Issue: </strong>
                          {sub.issuesRaised}
                        </p>
                      )}

                      {sub.feedback && (
                        <div className="p-3 rounded-2xl bg-amber-500/5 dark:bg-zinc-950 border border-amber-500/20 text-xs">
                          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase block mb-1">
                            Faculty Appraisal Remarks:
                          </span>
                          <p className="text-zinc-700 dark:text-zinc-300 italic font-serif leading-relaxed line-clamp-2">
                            "{sub.feedback}"
                          </p>
                          {sub.evaluatedBy && (
                            <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
                              Evaluator: {sub.evaluatedBy}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs gap-2">
                      <button
                        onClick={() => downloadSubmissionFile(sub)}
                        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-amber-500 text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        title="Download Submission File (.txt)"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSelectedSubmissionForViewing(sub)}
                        className="flex-1 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-black text-black dark:text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Submission &amp; Faculty Feedback</span>
                      </button>
                    </div>
                  </div>
                ))}

                {submissionsList.length === 0 && (
                  <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <ClipboardList className="w-12 h-12 text-zinc-400 mx-auto" />
                    <h3 className="text-lg font-bold text-black dark:text-white">No Submissions Recorded</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      You haven't submitted any briefs yet. Head to "Pending Tasks" to draft and submit your first legal problem!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: TESTS & CBT MOCKS (Wakheel SCREENSHOT FEATURE)          */}
        {/* ============================================================== */}
        {activeSection === "tests" && (
          cbtActive || cbtIsSubmitted ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => {
                    setCbtActive(false);
                    setCbtIsSubmitted(false);
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Exit Simulator &amp; View Test Packs</span>
                </button>
              </div>
              {renderCbtMockSimulator()}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-6 rounded-3xl bg-amber-500 text-black flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-mono font-bold uppercase">
                    Consortium CBT Simulation Window
                  </span>
                  <h3 className="text-xl font-black">All-India CLAT 2027 Full Length Diagnostic Mock</h3>
                  <p className="text-xs text-black/80 font-medium">120 Minutes • 14 Comprehensive Questions • Consortium Standard Negative Marking (-0.25)</p>
                </div>
                <button
                  onClick={handleStartCbtExam}
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
          )
        )}

        {/* ============================================================== */}
        {/* SECTION: MY ENROLLED COURSES                                    */}
        {/* ============================================================== */}
        {activeSection === "my_courses" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {(() => {
              const enrolledCourses = coursesList.filter(
                (c) => enrolledCourseIds.includes(c.id) || c.isEnrolled
              );

              if (enrolledCourses.length === 0) {
                return (
                  <div className="py-20 px-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-4 max-w-md mx-auto shadow-xs">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-base font-bold text-black dark:text-white">
                        No enrolled courses
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                        You have not enrolled in any masterclasses yet. Explore available courses or request tuition access from your faculty.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => setActiveSection("home")}
                        className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
                      >
                        <span>Explore Courses</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((course) => (
                    <div
                      key={course.id}
                      className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            {course.badge || "ENROLLED"}
                          </span>
                          <span className="text-zinc-500 font-mono text-[11px]">{course.unitsCount}</span>
                        </div>
                        <h4 className="text-base font-bold text-black dark:text-white leading-snug">{course.title}</h4>
                        <p className="text-xs text-zinc-500 line-clamp-2">{course.description}</p>
                        
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-zinc-500">Progress</span>
                            <span className="font-bold text-amber-500">
                              {course.totalUnits ? Math.round(((course.completedUnits || 0) / course.totalUnits) * 100) : 0}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{
                                width: `${course.totalUnits ? Math.round(((course.completedUnits || 0) / course.totalUnits) * 100) : 0}%`,
                              }}
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
              );
            })()}
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: BOOK SHELF (OPTION 3: FACULTY UPLOADS & STUDENT HUB)  */}
        {/* ============================================================== */}
        {activeSection === "bookshelf" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header with Search and Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold uppercase">
                    Centralized Courseware
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">•</span>
                  <span className="text-xs text-zinc-500 font-mono">Faculty Published Library</span>
                </div>
                <h3 className="text-xl font-black text-black dark:text-white">
                  Virtual Legal Book Shelf &amp; Reading Hub
                </h3>
                <p className="text-xs text-zinc-500">
                  Access textbooks, Bare Act commentaries, and course readers uploaded by your law faculty. Read directly online or download for offline exam prep.
                </p>
              </div>

              {/* Real-time Search Box */}
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bookShelfSearch}
                  onChange={(e) => setBookShelfSearch(e.target.value)}
                  placeholder="Search books, author, statutes..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Department Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {(
                [
                  { id: "All", label: `All Books (${booksList.length})` },
                  { id: "Constitutional Law", label: "Constitutional Law" },
                  { id: "Criminal Law", label: "Criminal Law (BNS)" },
                  { id: "CLAT & Entrance", label: "CLAT & Entrance" },
                  { id: "Civil Law & Litigation", label: "Civil Procedure" },
                  { id: "Downloaded", label: `My Downloaded (${Object.keys(downloadedBookIds).length})` },
                ] as const
              ).map((tab) => {
                const isActive = bookShelfFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setBookShelfFilter(tab.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-md scale-102"
                        : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Books Grid */}
            {(() => {
              const filtered = booksList.filter((b) => {
                const matchesDept =
                  bookShelfFilter === "All" ||
                  (bookShelfFilter === "Downloaded" && downloadedBookIds[b.id]) ||
                  b.department.toLowerCase().includes(bookShelfFilter.toLowerCase());
                const matchesSearch =
                  !bookShelfSearch.trim() ||
                  b.title.toLowerCase().includes(bookShelfSearch.toLowerCase()) ||
                  b.author.toLowerCase().includes(bookShelfSearch.toLowerCase()) ||
                  b.description.toLowerCase().includes(bookShelfSearch.toLowerCase());
                return matchesDept && matchesSearch;
              });

              if (filtered.length === 0) {
                return (
                  <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <BookOpen className="w-8 h-8 text-zinc-400 mx-auto" />
                    <h4 className="text-sm font-bold text-black dark:text-white">No books match your criteria</h4>
                    <p className="text-xs text-zinc-500">Try adjusting your search query or department filter tab.</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((book) => {
                    const isDownloaded = downloadedBookIds[book.id];
                    return (
                      <div
                        key={book.id}
                        className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 flex flex-col justify-between shadow-sm hover:border-amber-400 dark:hover:border-amber-500/60 transition-all group"
                      >
                        <div className="space-y-3.5">
                          {/* Styled Spine Cover */}
                          <div
                            className={`h-44 rounded-2xl bg-gradient-to-br ${book.coverGradient} p-4 text-white flex flex-col justify-between shadow-md relative overflow-hidden`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-[10px] font-mono font-bold uppercase">
                                {book.department}
                              </span>
                              <span className="text-[10px] font-mono bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
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

                          {/* Info */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-black dark:text-white line-clamp-1">{book.title}</span>
                            </div>
                            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                              {book.description}
                            </p>
                            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                              <span>{book.totalPages} Pages • {book.chapters.length} Chapters</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                <span>{book.downloadCount} downloads</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions: Read & Download */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleOpenBookReader(book)}
                            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Read Book</span>
                          </button>
                          <button
                            onClick={() => handleStudentDownloadBook(book)}
                            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isDownloaded
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            }`}
                            title="Download offline manuscript"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{isDownloaded ? "Saved" : "Download"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* FULLSCREEN IN-APP LEGAL BOOK READER MODAL */}
        {selectedBookForReading && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in zoom-in-95 duration-150">
            <div className={`w-full max-w-5xl h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-colors ${
              readerTheme === "dark"
                ? "bg-zinc-950 text-zinc-100 border-zinc-800"
                : readerTheme === "sepia"
                ? "bg-[#fbf0d9] text-[#433422] border-[#e4d4b3]"
                : "bg-white text-zinc-900 border-zinc-200"
            }`}>
              {/* Reader Header Toolbar */}
              <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                readerTheme === "dark" ? "border-zinc-800 bg-zinc-900/60" : readerTheme === "sepia" ? "border-[#e4d4b3] bg-[#f4e4c3]/60" : "border-zinc-200 bg-zinc-50"
              }`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black truncate">{selectedBookForReading.title}</h3>
                    <p className="text-[11px] text-zinc-500 truncate font-mono">
                      By {selectedBookForReading.author} • {selectedBookForReading.edition}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Theme Switcher */}
                  <div className="flex items-center rounded-xl bg-black/5 dark:bg-white/10 p-0.5 text-xs font-bold font-mono">
                    <button
                      onClick={() => setReaderTheme("light")}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        readerTheme === "light" ? "bg-white text-black shadow-xs" : "opacity-60"
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setReaderTheme("sepia")}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        readerTheme === "sepia" ? "bg-[#e8d5b5] text-amber-950 font-bold shadow-xs" : "opacity-60"
                      }`}
                    >
                      Sepia
                    </button>
                    <button
                      onClick={() => setReaderTheme("dark")}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        readerTheme === "dark" ? "bg-zinc-800 text-white shadow-xs" : "opacity-60"
                      }`}
                    >
                      Dark
                    </button>
                  </div>

                  {/* Font Sizer */}
                  <div className="flex items-center rounded-xl bg-black/5 dark:bg-white/10 p-0.5 text-xs font-bold font-mono">
                    <button
                      onClick={() => setReaderFontSize("sm")}
                      className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        readerFontSize === "sm" ? "bg-white dark:bg-zinc-800 shadow-2xs" : "opacity-60"
                      }`}
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setReaderFontSize("base")}
                      className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        readerFontSize === "base" ? "bg-white dark:bg-zinc-800 shadow-2xs" : "opacity-60"
                      }`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => setReaderFontSize("lg")}
                      className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        readerFontSize === "lg" ? "bg-white dark:bg-zinc-800 shadow-2xs" : "opacity-60"
                      }`}
                    >
                      A+
                    </button>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => handleToggleBookmark(selectedBookForReading.id, readerActiveChapterIdx)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      bookmarkedPages[`${selectedBookForReading.id}_ch_${readerActiveChapterIdx}`]
                        ? "bg-amber-500 text-black border-amber-500"
                        : "border-zinc-300 dark:border-zinc-700 hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                    title="Bookmark this chapter"
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>

                  {/* Download Copy Button */}
                  <button
                    onClick={() => handleStudentDownloadBook(selectedBookForReading)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Download manuscript file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </button>

                  {/* Close Reader */}
                  <button
                    onClick={() => setSelectedBookForReading(null)}
                    className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer ml-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Reader Split Body: Sidebar Table of Contents + Chapter Viewer */}
              <div className="flex-1 flex overflow-hidden">
                {/* Table of Contents Sidebar */}
                <div className={`w-64 sm:w-72 border-r p-4 overflow-y-auto space-y-2 shrink-0 hidden md:block ${
                  readerTheme === "dark" ? "border-zinc-800 bg-zinc-900/40" : readerTheme === "sepia" ? "border-[#e4d4b3] bg-[#f4e4c3]/30" : "border-zinc-200 bg-zinc-50/50"
                }`}>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Table of Contents ({selectedBookForReading.chapters.length} Chapters)
                  </div>
                  <div className="space-y-1">
                    {selectedBookForReading.chapters.map((ch, idx) => {
                      const isActive = readerActiveChapterIdx === idx;
                      const isBookmarked = bookmarkedPages[`${selectedBookForReading.id}_ch_${idx}`];
                      return (
                        <button
                          key={ch.id}
                          onClick={() => setReaderActiveChapterIdx(idx)}
                          className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-start justify-between gap-2 cursor-pointer ${
                            isActive
                              ? "bg-amber-500 text-black font-extrabold shadow-sm"
                              : "hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100"
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="text-[10px] font-mono block opacity-75">Chapter {ch.chapterNumber}</span>
                            <span className="line-clamp-2 leading-snug">{ch.title}</span>
                          </div>
                          {isBookmarked && (
                            <Bookmark className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-black fill-current" : "text-amber-500 fill-current"}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chapter Content Viewport */}
                {(() => {
                  const currentCh = selectedBookForReading.chapters[readerActiveChapterIdx] || selectedBookForReading.chapters[0];
                  const fontSizeClass =
                    readerFontSize === "lg"
                      ? "text-lg leading-loose"
                      : readerFontSize === "base"
                      ? "text-base leading-relaxed"
                      : "text-sm leading-relaxed";

                  return (
                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      {/* Chapter Text Viewport */}
                      <div className="flex-1 p-6 sm:p-10 overflow-y-auto space-y-6">
                        <div className="max-w-3xl mx-auto space-y-4">
                          <div className="space-y-1 border-b pb-4 border-current/15">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              Chapter {currentCh.chapterNumber} • Page {currentCh.pageNumber}
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight font-serif">
                              {currentCh.title}
                            </h2>
                          </div>

                          <div className={`whitespace-pre-line font-serif ${fontSizeClass} opacity-90`}>
                            {currentCh.content}
                          </div>
                        </div>
                      </div>

                      {/* Reading Navigation Footer */}
                      <div className={`p-4 border-t flex items-center justify-between gap-4 ${
                        readerTheme === "dark" ? "border-zinc-800 bg-zinc-900/60" : readerTheme === "sepia" ? "border-[#e4d4b3] bg-[#f4e4c3]/60" : "border-zinc-200 bg-zinc-50"
                      }`}>
                        <button
                          disabled={readerActiveChapterIdx === 0}
                          onClick={() => setReaderActiveChapterIdx((prev) => Math.max(0, prev - 1))}
                          className="px-4 py-2 rounded-xl border border-current/20 disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
                        >
                          ← Previous Chapter
                        </button>

                        <div className="text-xs font-mono opacity-70">
                          Chapter {readerActiveChapterIdx + 1} of {selectedBookForReading.chapters.length} ({Math.round(((readerActiveChapterIdx + 1) / selectedBookForReading.chapters.length) * 100)}%)
                        </div>

                        <button
                          disabled={readerActiveChapterIdx === selectedBookForReading.chapters.length - 1}
                          onClick={() => setReaderActiveChapterIdx((prev) => Math.min(selectedBookForReading.chapters.length - 1, prev + 1))}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all disabled:opacity-30 cursor-pointer"
                        >
                          Next Chapter →
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: MOOT PROJECTS (Wakheel SCREENSHOT FEATURE)             */}
        {/* ============================================================== */}
        {activeSection === "projects" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {studentProjects.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-sm font-bold text-black dark:text-white">No active research projects</h5>
                  <p className="text-xs text-zinc-500 max-w-sm">
                    Initiate a collaborative moot memorial, law review paper, or statutory research project with fellow scholars.
                  </p>
                </div>
              </div>
            ) : (
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
                        {proj.team?.map((member: string, mIdx: number) => (
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
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: 3D COURTROOM LAB & MOOT SIMULATION (OPTION 7)          */}
        {/* ============================================================== */}
        {activeSection === "three_d_lab" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header Deck */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                      Virtual Supreme Court &amp; High Court Chambers
                    </span>
                    <span className="text-zinc-600 font-mono">•</span>
                    <span className="text-xs text-zinc-400 font-mono">Advocacy &amp; Moot Lab</span>
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1.5 flex items-center gap-2">
                    <Scale className="w-6 h-6 text-amber-400" />
                    Interactive 3D Courtroom Simulation Lab
                  </h2>
                  <p className="text-xs text-zinc-400 max-w-2xl mt-1">
                    Master courtroom decorum under the Advocates Act 1961, explore 3D spatial perspectives of the Supreme Court bench, practice rapid procedural objections (BSA 2023 &amp; CPC), and argue landmark constitutional moot cases.
                  </p>
                </div>

                {/* Right controls: Gavel Strike Button */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => playGavelSound()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all cursor-pointer shadow-lg active:scale-95"
                    title="Synthesize authentic double-tap wooden gavel sound effect"
                  >
                    <Gavel className="w-4 h-4" />
                    <span>Strike Gavel</span>
                  </button>
                </div>
              </div>

              {/* Sub-tab Navigation */}
              <div className="flex items-center gap-2 pt-6 mt-6 border-t border-zinc-800/80 overflow-x-auto no-scrollbar">
                {[
                  { id: "spatial_3d", label: "3D Spatial Courtroom", icon: Eye, badge: "Interactive 3D" },
                  { id: "moot_sim", label: "Moot Bench Trial Simulator", icon: Scale, badge: "Moot Exam" },
                  { id: "objection_drill", label: "BSA & CPC Objection Reflex Drill", icon: ShieldAlert, badge: `${drillStreak} Streak` },
                  { id: "protocol", label: "Advocacy Decorum & Bar Codex", icon: Award, badge: "BCI Rules" },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = courtroomSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCourtroomSubTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? "bg-amber-500 text-black font-extrabold shadow-md"
                          : "bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                          isActive
                            ? "bg-black text-amber-400 font-bold"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ============================================================== */}
            {/* SUB-TAB 1: 3D SPATIAL COURTROOM & PERSPECTIVE STUDIO           */}
            {/* ============================================================== */}
            {courtroomSubTab === "spatial_3d" && (
              <div className="space-y-6">
                {/* Zone Switcher Controls */}
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-zinc-500 font-mono uppercase mr-1">Zone:</span>
                    {[
                      { id: "bench", label: "Division Bench", icon: "🏛️" },
                      { id: "petitioner", label: "Petitioner Lectern", icon: "🎙️" },
                      { id: "respondent", label: "Respondent Bar", icon: "⚖️" },
                      { id: "witness", label: "Witness Katghara", icon: "🪵" },
                      { id: "steno", label: "Court Master / Steno", icon: "📜" },
                      { id: "gallery", label: "Public Gallery", icon: "👥" },
                    ].map((z) => (
                      <button
                        key={z.id}
                        onClick={() => {
                          setActive3dZone(z.id as any);
                          setSelectedHotspot(null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          active3dZone === z.id
                            ? "bg-amber-500 text-black font-extrabold shadow-sm"
                            : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800"
                        }`}
                      >
                        <span>{z.icon}</span>
                        <span>{z.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCameraPerspectiveMode(cameraPerspectiveMode === "isometric" ? "fpv" : "isometric")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-zinc-900 text-amber-400 border border-zinc-800 hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{cameraPerspectiveMode === "isometric" ? "Switch to 1st Person POV" : "Switch to 3D Isometric"}</span>
                    </button>
                  </div>
                </div>

                {/* 3D Visual Courtroom Canvas */}
                <div className="relative rounded-3xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-black border border-zinc-800 p-6 md:p-8 min-h-[420px] flex flex-col justify-between overflow-hidden shadow-2xl">
                  {/* Top Canvas Bar */}
                  <div className="flex items-center justify-between text-xs font-mono z-10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-zinc-400 uppercase">
                        PERSPECTIVE: <strong className="text-white">{COURTROOM_ZONES[active3dZone]?.name}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-amber-400 text-[10px] font-mono font-bold">
                        {cameraPerspectiveMode === "isometric" ? "3D ISOMETRIC ARENA" : "FIRST-PERSON FIELD OF VIEW"}
                      </span>
                    </div>
                  </div>

                  {/* Visual 3D Spatial Representation */}
                  <div className="my-auto py-8 flex flex-col items-center justify-center relative z-10">
                    {cameraPerspectiveMode === "isometric" ? (
                      /* ISOMETRIC SVG COURTROOM MAP */
                      <div className="w-full max-w-2xl relative">
                        <svg viewBox="0 0 800 420" className="w-full h-auto drop-shadow-2xl">
                          <defs>
                            <linearGradient id="carpetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#18181b" />
                              <stop offset="100%" stopColor="#09090b" />
                            </linearGradient>
                            <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#78350f" />
                              <stop offset="50%" stopColor="#92400e" />
                              <stop offset="100%" stopColor="#451a03" />
                            </linearGradient>
                            <linearGradient id="goldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#f59e0b" />
                              <stop offset="100%" stopColor="#d97706" />
                            </linearGradient>
                          </defs>

                          {/* Courtroom Isometric Floor Slab */}
                          <polygon points="400,30 760,190 400,390 40,190" fill="url(#carpetGrad)" stroke="#27272a" strokeWidth="2" />
                          <line x1="400" y1="30" x2="400" y2="390" stroke="#3f3f46" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

                          {/* 1. Elevated Judicial Bench (Dais) at Top */}
                          <g
                            onClick={() => { setActive3dZone("bench"); setSelectedHotspot(null); }}
                            className="cursor-pointer transition-transform hover:scale-105"
                          >
                            <polygon points="280,75 520,75 560,120 240,120" fill="url(#woodGrad)" stroke="#f59e0b" strokeWidth={active3dZone === "bench" ? "3" : "1"} />
                            <polygon points="280,75 520,75 520,60 280,60" fill="#451a03" />
                            {/* Three Judicial Highback Chairs */}
                            <rect x="330" y="40" width="30" height="25" rx="3" fill="#18181b" stroke="#f59e0b" strokeWidth="1" />
                            <rect x="385" y="35" width="30" height="30" rx="3" fill="#18181b" stroke="#f59e0b" strokeWidth="1.5" />
                            <rect x="440" y="40" width="30" height="25" rx="3" fill="#18181b" stroke="#f59e0b" strokeWidth="1" />
                            {/* Gavel & Ashoka Pillar Icon */}
                            <circle cx="400" cy="95" r="8" fill="#f59e0b" />
                            <text x="400" y="99" textAnchor="middle" fill="#000" fontSize="9" fontWeight="bold">⚖</text>
                            <text x="400" y="113" textAnchor="middle" fill="#fef08a" fontSize="8" fontWeight="bold" fontFamily="monospace">HON'BLE BENCH</text>
                          </g>

                          {/* 2. Court Master & Steno Desk */}
                          <g
                            onClick={() => { setActive3dZone("steno"); setSelectedHotspot(null); }}
                            className="cursor-pointer transition-transform hover:scale-105"
                          >
                            <polygon points="340,140 460,140 480,165 320,165" fill="#27272a" stroke={active3dZone === "steno" ? "#f59e0b" : "#52525b"} strokeWidth="1.5" />
                            <text x="400" y="156" textAnchor="middle" fill="#a1a1aa" fontSize="7" fontFamily="monospace">COURT MASTER / STENO</text>
                          </g>

                          {/* 3. Witness Katghara (Left) */}
                          <g
                            onClick={() => { setActive3dZone("witness"); setSelectedHotspot(null); }}
                            className="cursor-pointer transition-transform hover:scale-105"
                          >
                            <polygon points="120,170 200,170 220,210 140,210" fill="#3f3f46" stroke={active3dZone === "witness" ? "#f59e0b" : "#71717a"} strokeWidth="1.5" />
                            {/* Railing balusters */}
                            <line x1="145" y1="170" x2="145" y2="155" stroke="#f59e0b" strokeWidth="2" />
                            <line x1="170" y1="170" x2="170" y2="155" stroke="#f59e0b" strokeWidth="2" />
                            <line x1="195" y1="170" x2="195" y2="155" stroke="#f59e0b" strokeWidth="2" />
                            <line x1="135" y1="155" x2="205" y2="155" stroke="#f59e0b" strokeWidth="2" />
                            <text x="170" y="195" textAnchor="middle" fill="#fef08a" fontSize="7" fontWeight="bold" fontFamily="monospace">KATGHARA (WITNESS)</text>
                          </g>

                          {/* 4. Petitioner / Appellant Lectern (Center Left) */}
                          <g
                            onClick={() => { setActive3dZone("petitioner"); setSelectedHotspot(null); }}
                            className="cursor-pointer transition-transform hover:scale-105"
                          >
                            {/* Bar Table */}
                            <polygon points="210,210 320,210 340,245 230,245" fill="url(#woodGrad)" stroke={active3dZone === "petitioner" ? "#f59e0b" : "#52525b"} strokeWidth="1.5" />
                            {/* Center Lectern */}
                            <rect x="255" y="195" width="22" height="20" rx="2" fill="#18181b" stroke="#f59e0b" strokeWidth="1.5" />
                            <circle cx="266" cy="190" r="3" fill="#f59e0b" />
                            <text x="275" y="235" textAnchor="middle" fill="#fef08a" fontSize="7" fontWeight="bold" fontFamily="monospace">PETITIONER PODIUM</text>
                          </g>

                          {/* 5. Respondent Defense Bar (Center Right) */}
                          <g
                            onClick={() => { setActive3dZone("respondent"); setSelectedHotspot(null); }}
                            className="cursor-pointer transition-transform hover:scale-105"
                          >
                            {/* Bar Table */}
                            <polygon points="480,210 590,210 600,245 490,245" fill="url(#woodGrad)" stroke={active3dZone === "respondent" ? "#f59e0b" : "#52525b"} strokeWidth="1.5" />
                            <rect x="525" y="195" width="22" height="20" rx="2" fill="#18181b" stroke="#f59e0b" strokeWidth="1.5" />
                            <circle cx="536" cy="190" r="3" fill="#f59e0b" />
                            <text x="545" y="235" textAnchor="middle" fill="#fef08a" fontSize="7" fontWeight="bold" fontFamily="monospace">RESPONDENT BAR</text>
                          </g>

                          {/* 6. Public & Student Gallery at Bottom */}
                          <g
                            onClick={() => { setActive3dZone("gallery"); setSelectedHotspot(null); }}
                            className="cursor-pointer transition-transform hover:scale-105"
                          >
                            <polygon points="260,310 540,310 560,350 240,350" fill="#27272a" stroke={active3dZone === "gallery" ? "#f59e0b" : "#3f3f46"} strokeWidth="1.5" />
                            <text x="400" y="335" textAnchor="middle" fill="#a1a1aa" fontSize="8" fontFamily="monospace">PUBLIC &amp; BAR GALLERY</text>
                          </g>
                        </svg>
                      </div>
                    ) : (
                      /* FIRST PERSON POV PERSPECTIVE VIEW */
                      <div className="w-full max-w-xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-4xl shadow-2xl">
                          {active3dZone === "bench" && "🏛️"}
                          {active3dZone === "petitioner" && "🎙️"}
                          {active3dZone === "respondent" && "⚖️"}
                          {active3dZone === "witness" && "🪵"}
                          {active3dZone === "steno" && "📜"}
                          {active3dZone === "gallery" && "👥"}
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-amber-400 uppercase font-black tracking-widest">
                            FIRST-PERSON CAMERA PERSPECTIVE
                          </span>
                          <h3 className="text-xl font-black text-white mt-1">
                            {COURTROOM_ZONES[active3dZone]?.name}
                          </h3>
                          <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
                            {COURTROOM_ZONES[active3dZone]?.cameraPerspective}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-left space-y-2 max-w-md mx-auto">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Constitutional Statutory Mandate:</span>
                          <p className="text-xs text-amber-300 font-mono font-semibold">
                            {COURTROOM_ZONES[active3dZone]?.statutoryBasis}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Perspective Status Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-zinc-400 pt-4 border-t border-zinc-800/80 z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">ACTIVE SECTOR:</span>
                      <span className="text-white font-bold">{COURTROOM_ZONES[active3dZone]?.hindiName}</span>
                    </div>
                    <div className="text-zinc-500 text-[11px]">
                      Click any zone button or isometric map element to inspect procedural decorum rules.
                    </div>
                  </div>
                </div>

                {/* Deep Zone Procedural Codex Card */}
                {COURTROOM_ZONES[active3dZone] && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
                    {/* Left 2 Cols: Decorum Rules & Authority */}
                    <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                        <div>
                          <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase font-bold">
                            {COURTROOM_ZONES[active3dZone].courtType}
                          </span>
                          <h3 className="text-lg font-black text-black dark:text-white">
                            Courtroom Decorum &amp; Conduct Rules
                          </h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 text-xs font-mono font-bold">
                          {COURTROOM_ZONES[active3dZone].hindiName}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {COURTROOM_ZONES[active3dZone].decorumRules.map((rule, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80">
                            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                              {rule}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                        <strong className="font-mono">Governing Statutory Authority: </strong>
                        <span>{COURTROOM_ZONES[active3dZone].statutoryBasis}</span>
                      </div>
                    </div>

                    {/* Right Col: Hotspots with Judicial Citations */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">
                          Interactive Spatial Hotspots
                        </span>
                        <h4 className="text-sm font-black text-black dark:text-white">
                          Focal Points &amp; Citations
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {COURTROOM_ZONES[active3dZone].hotspots.map((hs, hIdx) => (
                          <div
                            key={hIdx}
                            onClick={() => setSelectedHotspot(hs)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              selectedHotspot?.title === hs.title
                                ? "bg-amber-500/15 border-amber-500 shadow-sm"
                                : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-black dark:text-white">{hs.title}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
                              {hs.description}
                            </p>
                            <div className="mt-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/80 flex items-center gap-1.5 text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                              <span>📜</span>
                              <span className="truncate">{hs.citation}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* SUB-TAB 2: MOOT BENCH TRIAL SIMULATOR                          */}
            {/* ============================================================== */}
            {courtroomSubTab === "moot_sim" && (
              <div className="space-y-6">
                {!isMootSessionActive ? (
                  /* CASE SELECTION VIEW */
                  <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
                      <div>
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase font-black tracking-wider">
                          All-India National Moot Court Simulation
                        </span>
                        <h3 className="text-lg font-black text-black dark:text-white">
                          Select a Moot Court Case Proposition
                        </h3>
                        <p className="text-xs text-zinc-500">
                          Step up to the central argument lectern, manage the 15-minute bench timer, tackle tough judicial questions, and reserve rebuttal time.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {MOOT_CASES.map((c) => (
                          <div
                            key={c.id}
                            className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 hover:border-amber-500 transition-all shadow-sm"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold">
                                  {c.benchStrength}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-500">{c.timeLimitMin} Mins Allocated</span>
                              </div>
                              <h4 className="text-base font-black text-black dark:text-white">
                                {c.title}
                              </h4>
                              <p className="text-xs text-zinc-500 font-mono">
                                {c.forum}
                              </p>
                              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                {c.factsSummary}
                              </p>

                              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
                                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">Constitutional Issues:</span>
                                {c.memorialPointers.map((p, pIdx) => (
                                  <div key={pIdx} className="flex items-start gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                                    <span className="text-amber-500">•</span>
                                    <span>{p}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={() => handleStartMootSession(c)}
                              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                            >
                              <Scale className="w-4 h-4" />
                              <span>Enter Courtroom &amp; Launch Simulation</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Moot Simulation History */}
                    {mootHistoryList.length > 0 && (
                      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-black dark:text-white flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            Past Moot Trial Scorecards ({mootHistoryList.length})
                          </h4>
                        </div>

                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                          {mootHistoryList.map((rec) => (
                            <div key={rec.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <div>
                                <span className="font-bold text-black dark:text-white">{rec.caseTitle}</span>
                                <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                                  {rec.verdict} • {rec.completedDate}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-black text-amber-500 text-sm">
                                  {rec.totalScore} / {rec.maxScore} ({rec.percentage}%)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : !mootCompleted ? (
                  /* LIVE MOOT SESSION ARENA */
                  <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Top Status & Moot Timer Bar */}
                    <div className="p-4 rounded-2xl bg-zinc-950 text-white border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-mono font-black uppercase">
                            Round {mootCurrentStepIdx + 1} of {activeMootCase.steps.length}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono">{activeMootCase.shortTitle}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1">
                          {activeMootCase.steps[mootCurrentStepIdx]?.phaseTitle}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Moot Countdown Digital Clock */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
                          <span className={`w-2.5 h-2.5 rounded-full ${mootElapsedSeconds < 600 ? "bg-emerald-400" : mootElapsedSeconds < 840 ? "bg-amber-400 animate-pulse" : "bg-red-500 animate-ping"}`} />
                          <span className="text-xs font-mono font-bold text-zinc-300">
                            Time: {Math.floor(mootElapsedSeconds / 60).toString().padStart(2, "0")}:{(mootElapsedSeconds % 60).toString().padStart(2, "0")} / 15:00
                          </span>
                        </div>

                        {/* Current Score */}
                        <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                          Bench Score: {mootScore}
                        </div>

                        <button
                          onClick={() => setIsMootSessionActive(false)}
                          className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition-all cursor-pointer"
                        >
                          Exit Chamber
                        </button>
                      </div>
                    </div>

                    {/* Presiding Judicial Query Box */}
                    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-zinc-950 to-zinc-900 text-white border border-zinc-800 space-y-4 shadow-2xl relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-lg">
                            ⚖️
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-amber-400 uppercase font-black">
                              Presiding Division Bench
                            </span>
                            <h4 className="text-sm font-black text-white">
                              {activeMootCase.steps[mootCurrentStepIdx]?.judgeName}
                            </h4>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-mono uppercase font-bold">
                          Demeanor: {activeMootCase.steps[mootCurrentStepIdx]?.judgeDemeanor}
                        </span>
                      </div>

                      {/* The Bench Query */}
                      <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800">
                        <p className="text-sm md:text-base font-serif italic text-amber-100 leading-relaxed">
                          &ldquo;{activeMootCase.steps[mootCurrentStepIdx]?.benchQuery}&rdquo;
                        </p>
                      </div>

                      {/* Oral Argument Submission Options */}
                      <div className="space-y-3 pt-2">
                        <span className="text-[11px] font-mono text-zinc-400 uppercase font-bold">
                          Deliver Counsel&apos;s Oral Response:
                        </span>

                        {activeMootCase.steps[mootCurrentStepIdx]?.choices.map((choice, cIdx) => (
                          <button
                            key={cIdx}
                            disabled={selectedChoiceIdx !== null}
                            onClick={() => handleSelectMootChoice(cIdx)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                              selectedChoiceIdx === cIdx
                                ? choice.quality === "Distinguished"
                                  ? "bg-amber-500/15 border-amber-500 text-white shadow-md"
                                  : choice.quality === "Acceptable"
                                  ? "bg-zinc-800 border-zinc-600 text-white"
                                  : "bg-red-950/40 border-red-500 text-red-200"
                                : selectedChoiceIdx !== null
                                ? "opacity-50 bg-zinc-900 border-zinc-800 text-zinc-500"
                                : "bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800 text-zinc-200 hover:border-amber-500/50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {String.fromCharCode(65 + cIdx)}
                              </span>
                              <p className="text-xs leading-relaxed font-medium">
                                {choice.text}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Post-Choice Bench Response & Feedback */}
                      {mootStepFeedback && (
                        <div className="p-5 rounded-2xl bg-zinc-900 border border-amber-500/30 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase ${
                              mootStepFeedback.quality === "Distinguished"
                                ? "bg-amber-500 text-black"
                                : mootStepFeedback.quality === "Acceptable"
                                ? "bg-zinc-700 text-white"
                                : "bg-red-500 text-white"
                            }`}>
                              {mootStepFeedback.quality} Argument (+{mootStepFeedback.scoreDelta} Pts)
                            </span>
                            <span className="text-xs font-mono text-zinc-400">Oral Advocacy Evaluation</span>
                          </div>

                          <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
                            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block mb-1">Judge&apos;s Immediate Observation:</span>
                            <p className="text-xs font-serif italic text-zinc-200">
                              &ldquo;{mootStepFeedback.judgeResponse}&rdquo;
                            </p>
                          </div>

                          <p className="text-xs text-zinc-400">
                            <strong className="text-white">Pedagogical Rationale: </strong>
                            {mootStepFeedback.feedback}
                          </p>

                          <div className="flex justify-end pt-2">
                            <button
                              onClick={handleNextMootStep}
                              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all cursor-pointer shadow-md flex items-center gap-2"
                            >
                              <span>Proceed to {mootCurrentStepIdx + 1 < activeMootCase.steps.length ? "Next Judicial Interrogation" : "Final Bench Verdict"}</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* FINAL MOOT VERDICT CERTIFICATE */
                  <div className="p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 space-y-6 text-center max-w-2xl mx-auto shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-4xl shadow-xl">
                      🏆
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-black tracking-widest">
                        Official Moot Adjudication Scorecard
                      </span>
                      <h3 className="text-2xl font-black text-white mt-1">
                        {activeMootCase.shortTitle}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        Adjudicated before the {activeMootCase.forum}
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                      <div className="text-4xl font-mono font-black text-amber-400">
                        {mootScore} / {activeMootCase.steps.length * 25}
                      </div>
                      <div className="text-sm font-bold text-white">
                        {mootScore >= 70
                          ? "Bench Unanimously Concurs - Relief Granted!"
                          : mootScore >= 45
                          ? "Split 2:1 Decision in Favor of Counsel"
                          : "Petition Dismissed with Procedural Reprimand"}
                      </div>
                      <p className="text-xs text-zinc-400">
                        Total Argument Elapsed: {Math.floor(mootElapsedSeconds / 60)}m {mootElapsedSeconds % 60}s
                      </p>
                    </div>

                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleStartMootSession(activeMootCase)}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all cursor-pointer shadow-md"
                      >
                        Retake Simulation
                      </button>
                      <button
                        onClick={() => setIsMootSessionActive(false)}
                        className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-bold text-xs transition-all cursor-pointer"
                      >
                        Back to Case Propositions
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* SUB-TAB 3: BSA & CPC OBJECTION REFLEX DRILL                     */}
            {/* ============================================================== */}
            {courtroomSubTab === "objection_drill" && (
              <div className="space-y-6">
                {/* Metrics Deck */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Current Streak</span>
                      <div className="text-xl font-black text-black dark:text-white mt-0.5">
                        🔥 {drillStreak} Correct
                      </div>
                    </div>
                    <span className="text-xs font-mono text-amber-500 font-bold">Reflex Speed</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Countdown Clock</span>
                      <div className="text-xl font-black text-amber-500 font-mono mt-0.5">
                        ⏱️ {drillCountdown}s Left
                      </div>
                    </div>
                    <div className="w-16 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-1000"
                        style={{ width: `${(drillCountdown / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Overall Accuracy</span>
                      <div className="text-xl font-black text-black dark:text-white mt-0.5">
                        {drillStats.accuracyRate}% ({drillStats.correctAnswers}/{drillStats.totalAttempts})
                      </div>
                    </div>
                    <span className="text-xs font-mono text-zinc-500">BSA + CPC</span>
                  </div>
                </div>

                {/* Drill Scenario Question Card */}
                {(() => {
                  const currentDrill = OBJECTION_DRILLS[drillIndex % OBJECTION_DRILLS.length];
                  return (
                    <div className="p-6 md:p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 space-y-6 shadow-2xl">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
                            Scenario {drillIndex + 1} of {OBJECTION_DRILLS.length}
                          </span>
                          <span className="text-xs text-zinc-500 font-mono">•</span>
                          <span className="text-xs text-zinc-400 font-mono">{currentDrill.context}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-zinc-400">
                          Speaker: <strong className="text-white">{currentDrill.speakingParty}</strong>
                        </span>
                      </div>

                      {/* Courtroom Statement */}
                      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block mb-1">
                          Statement Made on Court Record:
                        </span>
                        <p className="text-base md:text-lg font-serif italic text-amber-100 leading-relaxed">
                          &ldquo;{currentDrill.scenario}&rdquo;
                        </p>
                      </div>

                      {/* 4 Procedural Objection Options */}
                      <div className="space-y-3">
                        <span className="text-[11px] font-mono text-zinc-400 uppercase font-bold">
                          Choose Proper Procedural Objection:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {currentDrill.options.map((opt, oIdx) => {
                            const isSelected = drillSelectedOptionIdx === oIdx;
                            return (
                              <button
                                key={oIdx}
                                disabled={drillAnswered}
                                onClick={() => handleAnswerDrill(oIdx)}
                                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                                  drillAnswered
                                    ? opt.isCorrect
                                      ? "bg-amber-500/20 border-amber-500 text-white font-bold"
                                      : isSelected
                                      ? "bg-red-950/40 border-red-500 text-red-200"
                                      : "bg-zinc-900 border-zinc-800 text-zinc-600"
                                    : "bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-200 hover:border-amber-500/50"
                                }`}
                              >
                                <div className="flex items-start gap-2.5">
                                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <div>
                                    <p className="text-xs font-medium leading-relaxed">
                                      {opt.label}
                                    </p>
                                    <span className="text-[10px] font-mono text-zinc-500 block mt-1">
                                      {opt.statutoryBasis}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Post Answer Feedback & Judge Ruling */}
                      {drillAnswered && (
                        <div className="p-5 rounded-2xl bg-zinc-900 border border-amber-500/30 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase ${
                              currentDrill.verdict === "SUSTAINED"
                                ? "bg-amber-500 text-black"
                                : "bg-zinc-800 text-amber-400 border border-amber-400/40"
                            }`}>
                              OBJECTION {currentDrill.verdict}!
                            </span>
                            <span className="text-xs font-mono text-zinc-400">Judicial Ruling</span>
                          </div>

                          <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
                            <p className="text-xs font-serif italic text-zinc-200">
                              &ldquo;{currentDrill.judgeRuling}&rdquo;
                            </p>
                          </div>

                          <p className="text-xs text-zinc-400">
                            <strong className="text-white">Statutory Standard: </strong>
                            {currentDrill.pedagogicalNote}
                          </p>

                          <div className="flex justify-end pt-2">
                            <button
                              onClick={handleNextDrill}
                              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all cursor-pointer shadow-md flex items-center gap-2"
                            >
                              <span>Next Procedural Scenario</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ============================================================== */}
            {/* SUB-TAB 4: ADVOCACY DECORUM & BAR CODEX                        */}
            {/* ============================================================== */}
            {courtroomSubTab === "protocol" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Dress Code under Advocates Act 1961 */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👔</span>
                    <h3 className="text-base font-black text-black dark:text-white">
                      Advocates Act 1961: Dress Code Standard
                    </h3>
                  </div>
                  <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      <strong>Male Advocates:</strong> Black open-collar buttoned-up coat, chapkan, achkan, or black sherwani with white bands and Advocate&apos;s Gown. Alternatively, black coat with white collar shirt and white bands.
                    </p>
                    <p>
                      <strong>Female Advocates:</strong> Black full-sleeve jacket, blouse with high neck collar and white bands, or white saree with black coat.
                    </p>
                    <p className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 font-mono text-[11px]">
                      BCI Rule 30 Summer Exemption: Wearing of black gown is optional in High Courts and Subordinate Courts between April 15 and September 15.
                    </p>
                  </div>
                </div>

                {/* 2. Modes of Judicial Address */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🗣️</span>
                    <h3 className="text-base font-black text-black dark:text-white">
                      Modes of Address in Indian Courts
                    </h3>
                  </div>
                  <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      <strong>Supreme Court &amp; High Courts:</strong> Addressed as &apos;Your Lordship&apos;, &apos;Your Ladyship&apos;, or &apos;This Hon&apos;ble Court&apos;. (BCI Resolution 2006 permits &apos;Sir&apos; or &apos;Hon&apos;ble Court&apos;).
                    </p>
                    <p>
                      <strong>Subordinate Judiciary (Sessions &amp; Magistrate Courts):</strong> Addressed as &apos;Learned Judge&apos;, &apos;Sir&apos;, or equivalent respectful term in vernacular.
                    </p>
                    <p className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px]">
                      Always rise from your seat when speaking to the Bench; never address judges while seated.
                    </p>
                  </div>
                </div>

                {/* 3. 15-Minute Moot Time Allocation */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⏱️</span>
                    <h3 className="text-base font-black text-black dark:text-white">
                      15-Minute Moot Time Breakdown Formula
                    </h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <span className="font-bold text-black dark:text-white">Minutes 00:00 - 02:00:</span>
                      <span className="font-mono text-amber-500">Opening &amp; Statement of Jurisdiction</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <span className="font-bold text-black dark:text-white">Minutes 02:00 - 10:00:</span>
                      <span className="font-mono text-amber-500">Core Substantive Arguments on Merits</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <span className="font-bold text-black dark:text-white">Minutes 10:00 - 13:00:</span>
                      <span className="font-mono text-amber-500">Addressing Bench Queries &amp; Distinguishing Precedents</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <span className="font-bold text-black dark:text-white">Minutes 13:00 - 15:00:</span>
                      <span className="font-mono text-amber-500">Formulating Prayer &amp; Reserving Rebuttal</span>
                    </div>
                  </div>
                </div>

                {/* 4. Compendium & Precedent Citation Standard */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📚</span>
                    <h3 className="text-base font-black text-black dark:text-white">
                      Compendium of Authorities Standard
                    </h3>
                  </div>
                  <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      <strong>Index Volume:</strong> Every compendium must contain an alphabetical index of authorities citing the exact page and paragraph relied upon.
                    </p>
                    <p>
                      <strong>Oral Citation Format:</strong> When citing in court, announce: &ldquo;Counsel refers to paragraph 24 in Volume 2 at page 45 of the Compendium, reported in <em>(2023) 4 SCC 1</em>.&rdquo;
                    </p>
                    <p className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 font-mono text-[11px]">
                      Wait for Their Lordships to open the relevant page before reading any statutory extract or ratio.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION: BOOKMARKS (Wakheel SCREENSHOT FEATURE)                 */}
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
                {bookmarkedItems.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 col-span-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                      <Bookmark className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-sm font-bold text-black dark:text-white">No bookmarked precedents yet</h5>
                      <p className="text-xs text-zinc-500 max-w-sm">
                        Star landmark judgments, Cornell notes, or statutory sections across the platform to pin them here for rapid revision.
                      </p>
                    </div>
                  </div>
                ) : (
                  bookmarkedItems.map((item) => (
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
                ))
              )}
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
      {/* 6. Wakheel FLOATING AI COPILOT WIDGET ([★ Wakheel AI | HYBRID]) */}
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
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold">
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
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[10.5px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5 leading-snug">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
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

      {/* Floating Pill Button ([★ Wakheel AI | CO-COUNSEL]) */}
      <button
        onClick={() => setShowFloatingAI((prev) => !prev)}
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full bg-zinc-950 text-white border border-zinc-800 hover:border-amber-500/50 shadow-2xl flex items-center gap-2.5 cursor-pointer transition-all hover:scale-105 active:scale-95 group backdrop-blur-md"
        title="Wakheel AI Legal Copilot"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
        </span>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-black tracking-wide text-white">Wakheel AI</span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-mono font-black uppercase tracking-wider">
          CO-COUNSEL
        </span>
      </button>

      {/* ============================================================== */}
      {/* 7. Wakheel COURSE LEARNING PORTAL MODAL (OPEN PORTAL >)          */}
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
                      <span className="font-mono text-zinc-400">1080p 60fps • Wakheel HD</span>
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
                        Curriculum Syllabus ({selectedCourseForPortal.syllabus?.length || 0} Units)
                      </h4>
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">
                        {selectedCourseForPortal.completedUnits || 0}/{selectedCourseForPortal.totalUnits || selectedCourseForPortal.syllabus?.length || 0} Completed
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(selectedCourseForPortal.syllabus || []).map((syl: any, idx: number) => (
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
                        Diagnostic Chapter Quiz ({selectedCourseForPortal.quiz?.length || 0} Questions)
                      </h4>
                      <p className="text-xs text-zinc-500 font-mono">Consortium CLAT Pattern • +1 for correct</p>
                    </div>
                    {portalQuizSubmitted && (
                      <span className="px-3 py-1 rounded-xl bg-amber-500 text-black font-mono font-black text-xs">
                        Score: {Object.entries(portalQuizAnswers).filter(([idx, ans]) => selectedCourseForPortal.quiz?.[Number(idx)]?.correct === ans).length} / {selectedCourseForPortal.quiz?.length || 0}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {(selectedCourseForPortal.quiz || []).map((q: any, qIdx: number) => {
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
      {/* 11. MANAGE CURRICULUM TRACK MODAL (Wakheel LEARN SECTION)       */}
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
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
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
                        ? "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 text-black dark:text-white shadow-xs ring-1 ring-amber-500"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">{trk.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-400">
                          {trk.badge}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{trk.desc}</p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-amber-500 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 12. CREATE STUDIO TOOLS MODALS (Wakheel >> CREATE PALETTE)     */}
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
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
                    <Presentation className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white">Smart Board &amp; Project Canvas</h3>
                    <p className="text-xs text-zinc-500">
                      Interactive legal whiteboard for case analysis, statutory flowcharts, and argument mapping.
                    </p>
                  </div>
                </div>
                <div className="aspect-video w-full rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">
                      Canvas: Kesavananda Basic Structure Flowchart
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                      Ready to Draw
                    </span>
                  </div>
                  <div className="text-center space-y-2 my-auto">
                    <PenTool className="w-8 h-8 text-amber-500 mx-auto" />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Drag legal nodes, link articles, or annotate landmark rulings with advocate peers.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-[11px] text-zinc-400">Tools: Pen • Highlighting • Shapes • Export PDF</span>
                    <button
                      onClick={() => setActiveCreateModal(null)}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs cursor-pointer transition-colors"
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
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white">AI Legal Mind Map</h3>
                    <p className="text-xs text-zinc-500">
                      Visual conceptual hierarchy of Constitutional Rights &amp; BNS Concordance.
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="font-mono text-xs font-bold text-amber-500">
                    PART III: FUNDAMENTAL RIGHTS (ARTICLES 12–35)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <strong className="text-zinc-900 dark:text-white block">Right to Equality (Art. 14–18)</strong>
                      <span className="text-zinc-500 text-[11px]">Rule of law, non-arbitrariness, reservations.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <strong className="text-zinc-900 dark:text-white block">Right to Freedom (Art. 19–22)</strong>
                      <span className="text-zinc-500 text-[11px]">6 freedoms, reasonable restrictions, personal liberty.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <strong className="text-zinc-900 dark:text-white block">Right to Life (Art. 21)</strong>
                      <span className="text-zinc-500 text-[11px]">Privacy (Puttaswamy), dignity, speedy trial.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <strong className="text-zinc-900 dark:text-white block">Constitutional Remedies (Art. 32)</strong>
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
                  {/* Timeline Items */}
                  {[
                    { year: "1950", case: "A.K. Gopalan v. State of Madras", desc: "Narrow interpretation of Article 21 ('procedure established by law')." },
                    { year: "1973", case: "Kesavananda Bharati v. State of Kerala", desc: "13-judge bench establishes the Basic Structure Doctrine." },
                    { year: "1978", case: "Maneka Gandhi v. Union of India", desc: "Article 21 procedure must be 'just, fair, and reasonable'; Golden Triangle created." },
                    { year: "2017", case: "K.S. Puttaswamy v. Union of India", desc: "9-judge bench declares Right to Privacy as an intrinsic Fundamental Right." },
                  ].map((t, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
                      <span className="font-mono font-bold text-amber-500 shrink-0">{t.year}</span>
                      <div>
                        <strong className="text-zinc-900 dark:text-white block">{t.case}</strong>
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
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
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
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
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
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                  <p className="text-zinc-700 dark:text-zinc-300">
                    Ready to generate or review your {activeCreateModal} module for {selectedCurriculumTrack}.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCreateModal(null);
                      if (activeCreateModal === "video") {
                        if (coursesList.length > 0) {
                          setSelectedCourseForPortal(coursesList[0]);
                          setPortalTab("video");
                          setPortalVideoPlaying(true);
                        } else {
                          setActiveSection("home");
                        }
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs cursor-pointer transition-colors"
                  >
                    Launch in Full Portal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. CORNELL NOTE CREATION MODAL (OPTION 5) */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl relative space-y-6 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowAddNoteModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-bold shadow-sm">
                <BookText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-black dark:text-white">Author New Cornell Law Note</h3>
                <p className="text-xs text-zinc-500">
                  Select a high-yield legal scaffold or author your custom appellate brief.
                </p>
              </div>
            </div>

            {/* Template Selector Cards */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                Quick Model Legal Templates
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CORNELL_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => handleApplyTemplateToNewModal(tpl)}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500 text-black dark:text-white shadow-2xs"
                          : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="font-bold text-amber-600 dark:text-amber-400">{tpl.subject}</span>
                        {isSelected && <span className="font-bold text-amber-500">✓ Selected</span>}
                      </div>
                      <h4 className="text-xs font-bold text-black dark:text-white">{tpl.name}</h4>
                      <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{tpl.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleCreateCornellNoteFromModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Note Title / Benchmark Topic *
                  </label>
                  <input
                    type="text"
                    required
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="e.g. Section 480 BNSS Bail Mechanics & Triple Test"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Curriculum Subject *
                  </label>
                  <select
                    value={newNoteSubject}
                    onChange={(e) => setNewNoteSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
                  >
                    <option value="Constitutional Law">Constitutional Law</option>
                    <option value="Criminal Jurisprudence (BNS & BNSS)">Criminal Jurisprudence (BNS & BNSS)</option>
                    <option value="Law of Contracts">Law of Contracts</option>
                    <option value="Law of Torts & Environment">Law of Torts & Environment</option>
                    <option value="Civil Procedure & Evidence">Civil Procedure & Evidence</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Topic Code / Sub-Module
                </label>
                <input
                  type="text"
                  value={newNoteTopic}
                  onChange={(e) => setNewNoteTopic(e.target.value)}
                  placeholder="e.g. Fundamental Rights & Article 13(2)"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Recall Cues Tag Manager */}
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Recall Cues &amp; Questions of Law
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {newNoteCues.map((cue, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1"
                    >
                      <span>{cue}</span>
                      <button
                        type="button"
                        onClick={() => setNewNoteCues(newNoteCues.filter((_, i) => i !== idx))}
                        className="text-zinc-400 hover:text-rose-500 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={modalCueInput}
                    onChange={(e) => setModalCueInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (modalCueInput.trim()) {
                          setNewNoteCues([...newNoteCues, modalCueInput.trim()]);
                          setModalCueInput("");
                        }
                      }
                    }}
                    placeholder="Type cue keyword and press Enter..."
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (modalCueInput.trim()) {
                        setNewNoteCues([...newNoteCues, modalCueInput.trim()]);
                        setModalCueInput("");
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-black font-bold text-xs cursor-pointer"
                  >
                    + Add Cue
                  </button>
                </div>
              </div>

              {/* Core Content */}
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Core Legal Formulation &amp; Statutory Analysis *
                </label>
                <textarea
                  rows={8}
                  required
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Detail the case facts, legal issues, reasoning of judges, statutory construction..."
                  className="w-full p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-serif leading-relaxed focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Executive Summary &amp; Ratio Decidendi (Bottom Cornell Quadrant) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newNoteSummary}
                  onChange={(e) => setNewNoteSummary(e.target.value)}
                  placeholder="In 1-2 sentences, synthesize the core ruling or rule of law..."
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-serif italic focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              {/* Statutes & Precedents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Statutory Sections (e.g. Art. 368, S.73 ICA)
                  </label>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {newNoteStatutes.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => setNewNoteStatutes(newNoteStatutes.filter((_, i) => i !== idx))}
                          className="text-zinc-400 hover:text-rose-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={modalStatuteInput}
                      onChange={(e) => setModalStatuteInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (modalStatuteInput.trim()) {
                            setNewNoteStatutes([...newNoteStatutes, modalStatuteInput.trim()]);
                            setModalStatuteInput("");
                          }
                        }
                      }}
                      placeholder="Add section..."
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (modalStatuteInput.trim()) {
                          setNewNoteStatutes([...newNoteStatutes, modalStatuteInput.trim()]);
                          setModalStatuteInput("");
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Landmark Precedents / Citations
                  </label>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {newNoteCases.map((cs, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1"
                      >
                        <span>{cs}</span>
                        <button
                          type="button"
                          onClick={() => setNewNoteCases(newNoteCases.filter((_, i) => i !== idx))}
                          className="text-zinc-400 hover:text-rose-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={modalCaseInput}
                      onChange={(e) => setModalCaseInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (modalCaseInput.trim()) {
                            setNewNoteCases([...newNoteCases, modalCaseInput.trim()]);
                            setModalCaseInput("");
                          }
                        }
                      }}
                      placeholder="Add case citation..."
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (modalCaseInput.trim()) {
                          setNewNoteCases([...newNoteCases, modalCaseInput.trim()]);
                          setModalCaseInput("");
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white dark:hover:bg-amber-400 dark:hover:text-black text-black font-extrabold text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <BookText className="w-4 h-4" />
                  <span>Save &amp; Open in Cornell Studio</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 10. CASE BRIEF SUBMISSION MODAL (OPTION 4)                     */}
      {/* ============================================================== */}
      {activeAssignmentForSubmission && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl relative space-y-5 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setActiveAssignmentForSubmission(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-black uppercase">
                  {activeAssignmentForSubmission.badge || "STUDENT MEMORIAL"}
                </span>
                <span className="text-xs text-zinc-400 font-mono">Faculty: {activeAssignmentForSubmission.faculty}</span>
              </div>
              <h3 className="text-xl font-black text-black dark:text-white">
                {activeAssignmentForSubmission.title}
              </h3>
              <p className="text-xs text-zinc-500">
                Subject: {activeAssignmentForSubmission.subject} • Max Marks: {activeAssignmentForSubmission.maxScore} • Due: {activeAssignmentForSubmission.dueDate}
              </p>
            </div>

            {/* Problem Instructions Banner */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-600 dark:text-amber-400 block">
                Factual Scenario &amp; Drafting Instructions:
              </span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 font-serif leading-relaxed">
                {activeAssignmentForSubmission.instructions}
              </p>
              {activeAssignmentForSubmission.referenceRatio && (
                <div className="text-[11px] font-mono text-zinc-500 pt-1 border-t border-zinc-200/50 dark:border-zinc-800/60">
                  <strong className="text-zinc-700 dark:text-zinc-300">Guiding Judicial Precedents: </strong>
                  {activeAssignmentForSubmission.referenceRatio}
                </div>
              )}
            </div>

            {/* Quick Scaffold Pre-fill Template Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <span className="font-mono text-zinc-400 shrink-0 font-bold">Model Templates:</span>
              <button
                type="button"
                onClick={() => {
                  setSubIssues("1. Whether arrest without Section 35 BNSS compliance and without independent panchas infringes Article 21?\n2. Whether applicant satisfies triple test for regular bail?");
                  setSubPleadings(
                    "IN THE COURT OF THE SESSIONS JUDGE AT NEW DELHI\nBAIL PETITION NO. ___ OF 2026\nIN THE MATTER OF: STATE v. ARJUN MEHTA\n\nMOST RESPECTFULLY SHEWETH:\n1. That the Applicant is a bona fide law student with clean criminal antecedents.\n2. That Section 303(2) BNS provides punishment up to 3 years. Under Section 35(3) BNSS and Arnesh Kumar v. State of Bihar (2014), notice of appearance was mandatory.\n3. That the seizure memo fails to satisfy Section 105 BNSS due to complete absence of independent public witnesses.\n4. That the Applicant satisfies the triple test in Satender Kumar Antil (2022) with permanent residence and surrendered travel documents."
                  );
                  setSubPrayer("WHEREFORE, it is respectfully prayed that this Hon'ble Court may be pleased to enlarge the Applicant on regular bail under Section 480 BNSS upon reasonable surety.");
                  setSubAttachmentName("Bail_Petition_Draft_Applicant.pdf");
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-700 dark:text-zinc-300 transition-colors font-medium cursor-pointer shrink-0"
              >
                Pre-fill BNSS Bail Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubIssues("1. Scope of constituent power under Article 368.\n2. Invalidation of Article 31C conclusive declaration clause.");
                  setSubPleadings(
                    "CASE BRIEF: KESAVANANDA BHARATI v. STATE OF KERALA (1973) 4 SCC 225\n\n1. FACTS & ISSUES: Challenge to 24th, 25th, and 29th Amendments.\n2. RATIO DECIDENDI: The power to amend does not encompass power to destroy the essential framework or basic features of the Constitution.\n3. BASIC FEATURES: Rule of law, democracy, judicial review, secularism, and separation of powers."
                  );
                  setSubPrayer("CONCLUSION: Parliament's amending authority cannot override constitutional supremacy.");
                  setSubAttachmentName("Kesavananda_Analysis_Memo.pdf");
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-700 dark:text-zinc-300 transition-colors font-medium cursor-pointer shrink-0"
              >
                Pre-fill Case Brief
              </button>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleStudentSubmitHomework} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Issues Raised &amp; Legal Grounds
                </label>
                <input
                  type="text"
                  value={subIssues}
                  onChange={(e) => setSubIssues(e.target.value)}
                  placeholder="e.g. 1. Arbitrary arrest under S.35 BNSS; 2. Satisfaction of triple test under Article 21"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white text-xs font-serif focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Pleadings, Written Arguments &amp; Statutory Reasoning
                </label>
                <textarea
                  rows={8}
                  value={subPleadings}
                  onChange={(e) => setSubPleadings(e.target.value)}
                  placeholder="Draft your detailed legal argument, cite relevant sections (BNS/BNSS/BSA), and synthesize ratio decidendi from landmark Supreme Court rulings..."
                  className="w-full p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white text-xs font-serif leading-relaxed focus:outline-none focus:border-amber-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Concluding Prayer / Relief Sought
                </label>
                <input
                  type="text"
                  value={subPrayer}
                  onChange={(e) => setSubPrayer(e.target.value)}
                  placeholder="e.g. Wherefore, in the interest of justice, it is most respectfully prayed that this Hon'ble Court..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white text-xs font-serif focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Simulated File Attachment */}
              <div
                onClick={() => setSubAttachmentName(`${activeAssignmentForSubmission.title.slice(0, 20).replace(/\s+/g, "_")}_Draft.pdf`)}
                className="p-3 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-500 text-center text-zinc-500 cursor-pointer transition-colors"
              >
                {subAttachmentName ? (
                  <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">
                    📎 Attached: {subAttachmentName} (Click to re-select)
                  </span>
                ) : (
                  <span>📎 Click to attach supporting brief or memorial file (.PDF, .DOCX)</span>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveAssignmentForSubmission(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {subSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Submitted for Chamber Review!</span>
                    </>
                  ) : (
                    <span>Submit Brief to Faculty</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 11. STUDENT APPRAISAL & FACULTY FEEDBACK MODAL (OPTION 4)      */}
      {/* ============================================================== */}
      {selectedSubmissionForViewing && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl relative space-y-5 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedSubmissionForViewing(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-black uppercase">
                    Chamber Appraisal
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">Submitted: {selectedSubmissionForViewing.submittedDate}</span>
                </div>
                <h3 className="text-lg font-black text-black dark:text-white mt-1">
                  {selectedSubmissionForViewing.assignmentTitle}
                </h3>
              </div>

              {selectedSubmissionForViewing.status === "Graded" ? (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  <Award className="w-6 h-6" />
                  <div>
                    <span className="text-[10px] font-mono uppercase block font-bold">Chamber Score</span>
                    <span className="text-xl font-black font-mono">
                      {selectedSubmissionForViewing.grade || `${selectedSubmissionForViewing.score}/50`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-xs font-bold">Under Faculty Review</span>
                </div>
              )}
            </div>

            {/* Faculty Feedback Commentary Banner (if graded) */}
            {selectedSubmissionForViewing.feedback && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 uppercase text-[10px] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    Faculty Evaluator Commentary
                  </span>
                  {selectedSubmissionForViewing.evaluatedBy && (
                    <span className="font-mono text-zinc-500 text-[11px]">
                      By: {selectedSubmissionForViewing.evaluatedBy} • {selectedSubmissionForViewing.evaluatedDate}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 font-serif leading-relaxed italic">
                  "{selectedSubmissionForViewing.feedback}"
                </p>
              </div>
            )}

            {/* Rubric Breakdown (if available) */}
            {selectedSubmissionForViewing.rubricBreakdown && (
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">
                  Evaluation Rubric Breakdown
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block">Statutory Accuracy</span>
                    <span className="font-mono font-bold text-black dark:text-white">
                      {selectedSubmissionForViewing.rubricBreakdown.statutoryAccuracy} / 15
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block">Case Precedents</span>
                    <span className="font-mono font-bold text-black dark:text-white">
                      {selectedSubmissionForViewing.rubricBreakdown.casePrecedents} / 15
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block">Drafting &amp; Prayer</span>
                    <span className="font-mono font-bold text-black dark:text-white">
                      {selectedSubmissionForViewing.rubricBreakdown.draftingAndPrayer} / 10
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block">Legal Reasoning</span>
                    <span className="font-mono font-bold text-black dark:text-white">
                      {selectedSubmissionForViewing.rubricBreakdown.legalReasoning} / 10
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submitted Work Transcript */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">
                Your Submitted Brief &amp; Arguments:
              </span>
              <div className="font-serif text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto pr-1">
                {selectedSubmissionForViewing.submissionText}
              </div>
              {selectedSubmissionForViewing.prayerOrConclusion && (
                <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/60 text-xs font-serif">
                  <strong className="text-black dark:text-white block font-sans text-[10px] uppercase font-bold mb-0.5">
                    Prayer:
                  </strong>
                  {selectedSubmissionForViewing.prayerOrConclusion}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => downloadSubmissionFile(selectedSubmissionForViewing)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Appraisal File (.txt)</span>
              </button>
              <button
                onClick={() => setSelectedSubmissionForViewing(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Academy WebSocket Live Push Notifications */}
      <AcademyLiveToast
        toast={liveToast}
        onDismiss={dismissToast}
        isConnected={isAcademyWsConnected}
      />

      {/* Real-time WebRTC Live Tuition Chamber */}
      <AcademyLiveChamberModal
        isOpen={liveChamberModal.isOpen}
        onClose={() =>
          setLiveChamberModal((prev) => ({ ...prev, isOpen: false }))
        }
        roomId={liveChamberModal.roomId}
        roomTitle={liveChamberModal.roomTitle}
        topic={liveChamberModal.topic}
        mentorName={liveChamberModal.mentorName}
        userName={studentProfile.fullName || "Adv. Scholar"}
        userRole="student"
        isBroadcaster={false}
      />

    </div>
  );
}
