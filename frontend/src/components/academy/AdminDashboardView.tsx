"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  Award,
  Trophy,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  LogOut,
  ExternalLink,
  RefreshCw,
  X,
  UserCheck,
  UserX,
  LayoutDashboard,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import academyApi, {
  AcademyAdminOverview,
  AcademyAdminUser,
  LawCourse,
  MockTestPack,
  TuitionAccessRequest,
} from "@/lib/academyApi";
import { LawBook } from "./booksData";
import { useAcademyWebSocket } from "@/hooks/useAcademyWebSocket";

type AdminSection =
  | "overview"
  | "teachers"
  | "students"
  | "tuition"
  | "courses"
  | "content";

export function AdminDashboardView() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Core Data States
  const [overview, setOverview] = useState<AcademyAdminOverview | null>(null);
  const [usersList, setUsersList] = useState<AcademyAdminUser[]>([]);
  const [tuitionRequests, setTuitionRequests] = useState<TuitionAccessRequest[]>([]);
  const [coursesList, setCoursesList] = useState<LawCourse[]>([]);
  const [booksList, setBooksList] = useState<LawBook[]>([]);
  const [mockPacks, setMockPacks] = useState<MockTestPack[]>([]);

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserRole, setNewUserRole] = useState<"teacher" | "student">("teacher");
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserDeptOrExam, setNewUserDeptOrExam] = useState("Constitutional Law");

  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseExam, setNewCourseExam] = useState("CLAT 2027 (NLUs)");
  const [newCourseInstructor, setNewCourseInstructor] = useState("Prof. Dr. Rajesh Varma");
  const [newCourseUnits, setNewCourseUnits] = useState("12 Sections");
  const [newCourseDesc, setNewCourseDesc] = useState("");

  const [showAddMockModal, setShowAddMockModal] = useState(false);
  const [newMockTitle, setNewMockTitle] = useState("");
  const [newMockExam, setNewMockExam] = useState("CLAT 2027 (NLUs)");
  const [newMockTestsCount, setNewMockTestsCount] = useState("15 Full Mocks");
  const [newMockPrice, setNewMockPrice] = useState("499");

  const { isConnected: isWsConnected } = useAcademyWebSocket({
    role: "admin",
    userId: "academy_admin_root",
    autoSync: true,
    onEvent: () => {
      loadAllAdminData();
    },
  });

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [ovRes, usrRes, tuitRes, crsRes, bkRes, mkRes] = await Promise.all([
        academyApi.getAdminOverview(),
        academyApi.getAdminUsers(),
        academyApi.getTuitionRequests(),
        academyApi.getCourses(),
        academyApi.getBooks(),
        academyApi.getMockTestPacks(),
      ]);

      if (ovRes.success && ovRes.overview) setOverview(ovRes.overview);
      if (usrRes.success) setUsersList(usrRes.users);
      if (tuitRes.success) setTuitionRequests(tuitRes.requests);
      if (crsRes.success) setCoursesList(crsRes.courses);
      if (bkRes.success) setBooksList(bkRes.books);
      if (mkRes.success) setMockPacks(mkRes.packs);
    } catch (e) {
      console.warn("Admin load error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("wakheel_academy_role");
      if (role !== "admin") {
        router.replace("/academy/admin/login");
        return;
      }
    }
    loadAllAdminData();
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("wakheel_academy_role");
    localStorage.removeItem("wakheel_academy_token");
    localStorage.removeItem("wakheel_academy_user");
    router.push("/academy/admin/login");
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    const res = await academyApi.createAdminUser({
      fullName: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      department: newUserRole === "teacher" ? newUserDeptOrExam : undefined,
      targetProgram: newUserRole === "student" ? newUserDeptOrExam : undefined,
    });
    if (res.success && res.user) {
      setUsersList((prev) => [res.user!, ...prev]);
      setShowAddUserModal(false);
      setNewUserName("");
      setNewUserEmail("");
      loadAllAdminData();
    } else if (res.message) {
      alert(res.message);
    }
  };

  const handleToggleUserStatus = async (user: AcademyAdminUser) => {
    const nextStatus = user.status === "active" ? "suspended" : "active";
    const res = await academyApi.updateAdminUserStatus(user.id, { status: nextStatus });
    if (res.success) {
      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Remove this user from the Academy directory?")) return;
    const res = await academyApi.deleteAdminUser(id);
    if (res.success) {
      setUsersList((prev) => prev.filter((u) => u.id !== id));
      loadAllAdminData();
    }
  };

  const handleReviewTuition = async (id: string, status: "approved" | "rejected") => {
    const res = await academyApi.reviewTuitionRequest(id, {
      status,
      reviewedBy: "Wakheel Academy Admin",
    });
    if (res.success) {
      setTuitionRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status, reviewedBy: "Wakheel Academy Admin" } : r))
      );
      loadAllAdminData();
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;
    const res = await academyApi.createCourse({
      title: newCourseTitle.trim(),
      exam: newCourseExam,
      instructor: newCourseInstructor.trim(),
      unitsCount: newCourseUnits.trim(),
      description: newCourseDesc.trim() || `${newCourseTitle} — Admin Verified Masterclass`,
      badge: "ADMIN VERIFIED",
      totalUnits: parseInt(newCourseUnits) || 12,
      completedUnits: 0,
      image: "/academy/explore-paper.png",
    });
    if (res.success && res.course) {
      setCoursesList((prev) => [res.course!, ...prev]);
      setShowAddCourseModal(false);
      setNewCourseTitle("");
      setNewCourseDesc("");
      loadAllAdminData();
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Delete this masterclass course?")) return;
    await academyApi.deleteCourse(id);
    setCoursesList((prev) => prev.filter((c) => c.id !== id));
    loadAllAdminData();
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm("Delete this book from the repository?")) return;
    await academyApi.deleteBook(id);
    setBooksList((prev) => prev.filter((b) => b.id !== id));
    loadAllAdminData();
  };

  const handleCreateMockPack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMockTitle.trim()) return;
    const res = await academyApi.createMockTestPack({
      title: newMockTitle.trim(),
      exam: newMockExam,
      testsCount: newMockTestsCount.trim(),
      price: Number(newMockPrice) || 499,
      originalPrice: (Number(newMockPrice) || 499) * 3,
      badge: "ADMIN PUBLISHED",
      features: ["Full Length Timed CBT Mock", "Consortium Negative Marking (-0.25)"],
    });
    if (res.success && res.pack) {
      setMockPacks((prev) => [res.pack!, ...prev]);
      setShowAddMockModal(false);
      setNewMockTitle("");
      loadAllAdminData();
    }
  };

  const handleDeleteMockPack = async (id: string) => {
    if (!confirm("Delete this CBT mock test pack?")) return;
    await academyApi.deleteMockTestPack(id);
    setMockPacks((prev) => prev.filter((p) => p.id !== id));
    loadAllAdminData();
  };

  const teachers = usersList.filter((u) => u.role === "teacher" || u.role === "faculty");
  const students = usersList.filter((u) => u.role === "student");

  const navItems: Array<{ id: AdminSection; label: string; icon: any; count?: number }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "teachers", label: "Teachers & Faculty", icon: UserCheck, count: teachers.length },
    { id: "students", label: "Students & Scholars", icon: Users, count: students.length },
    {
      id: "tuition",
      label: "Tuition Admissions",
      icon: Award,
      count: tuitionRequests.filter((r) => r.status === "pending").length,
    },
    { id: "courses", label: "Courses & Syllabi", icon: Layers, count: coursesList.length },
    { id: "content", label: "Books & CBT Mocks", icon: BookOpen, count: booksList.length + mockPacks.length },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white flex flex-col lg:flex-row">
      {/* Left Admin Sidebar */}
      <aside className="w-full lg:w-64 shrink-0 bg-zinc-950 text-white border-b lg:border-b-0 lg:border-r border-zinc-800 p-4 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-sm tracking-tight block">WAKHEEL ADMIN</span>
                <span className="text-[10px] font-mono text-amber-400 uppercase">Control Center</span>
              </div>
            </div>
          </div>

          <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? "bg-amber-500 text-black shadow-sm font-extrabold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        isActive ? "bg-black/15 text-black" : "bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block space-y-2 pt-4 border-t border-zinc-800">
          <Link
            href="/teacher/home"
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-between transition-colors"
          >
            <span>Open Faculty Studio</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </Link>
          <Link
            href="/student/home"
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-between transition-colors"
          >
            <span>Open Student Hub</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 px-4 sm:px-8 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teachers, scholars, courses, books..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono">
              <span className={`w-2 h-2 rounded-full ${isWsConnected ? "bg-amber-400 animate-pulse" : "bg-zinc-500"}`} />
              <span>{isWsConnected ? "Live Sync" : "Local Sync"}</span>
            </div>

            <button
              onClick={loadAllAdminData}
              className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 text-zinc-600 dark:text-zinc-300 cursor-pointer transition-colors"
              title="Refresh Admin Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <ThemeToggle />

            <button
              onClick={handleSignOut}
              className="lg:hidden p-2 rounded-full bg-rose-500/10 text-rose-500 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* SECTION 1: OVERVIEW */}
          {activeSection === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold uppercase">
                    Unified Governance
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                    Academy Command Overview
                  </h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Manage teachers, scholars, courses, books, tuition approvals, and CBT mock series from one panel.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setNewUserRole("teacher");
                      setShowAddUserModal(true);
                    }}
                    className="px-4 py-2 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Teacher / Student</span>
                  </button>
                  <button
                    onClick={() => setShowAddCourseModal(true)}
                    className="px-4 py-2 rounded-full bg-zinc-900 dark:bg-zinc-800 hover:bg-amber-500 hover:text-black text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Publish Course</span>
                  </button>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Faculty & Teachers", value: overview?.totalTeachers ?? teachers.length, icon: UserCheck, tab: "teachers" as AdminSection },
                  { label: "Students & Scholars", value: overview?.totalStudents ?? students.length, icon: Users, tab: "students" as AdminSection },
                  { label: "Published Courses", value: overview?.totalCourses ?? coursesList.length, icon: Layers, tab: "courses" as AdminSection },
                  { label: "Pending Tuition", value: overview?.pendingTuition ?? tuitionRequests.filter((r) => r.status === "pending").length, icon: Award, tab: "tuition" as AdminSection },
                  { label: "Digital Law Books", value: overview?.totalBooks ?? booksList.length, icon: BookOpen, tab: "content" as AdminSection },
                  { label: "CBT Mock Packs", value: overview?.totalMockPacks ?? mockPacks.length, icon: Trophy, tab: "content" as AdminSection },
                  { label: "Mock Submissions", value: overview?.totalMockResults ?? 0, icon: CheckCircle2, tab: "overview" as AdminSection },
                  { label: "Approved Scholars", value: overview?.approvedTuition ?? tuitionRequests.filter((r) => r.status === "approved").length, icon: GraduationCap, tab: "tuition" as AdminSection },
                ].map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={kpi.label}
                      onClick={() => setActiveSection(kpi.tab)}
                      className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/60 transition-all cursor-pointer space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-zinc-500">{kpi.label}</span>
                        <Icon className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="text-2xl font-black font-mono">{kpi.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2 & 3: TEACHERS OR STUDENTS */}
          {(activeSection === "teachers" || activeSection === "students") && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">
                    {activeSection === "teachers" ? "Teachers & Faculty Directory" : "Students & Scholars Directory"}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Onboard, suspend, activate, or remove {activeSection === "teachers" ? "faculty members" : "student scholars"}.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setNewUserRole(activeSection === "teachers" ? "teacher" : "student");
                    setNewUserDeptOrExam(activeSection === "teachers" ? "Constitutional Law" : "CLAT 2027 (NLUs)");
                    setShowAddUserModal(true);
                  }}
                  className="px-4 py-2.5 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>{activeSection === "teachers" ? "Onboard Faculty" : "Add Scholar"}</span>
                </button>
              </div>

              {(() => {
                const base = activeSection === "teachers" ? teachers : students;
                const filtered = base.filter(
                  (u) =>
                    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filtered.length === 0) {
                  return (
                    <div className="py-16 px-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                      <Users className="w-8 h-8 text-amber-500 mx-auto" />
                      <h4 className="text-sm font-bold">
                        No {activeSection === "teachers" ? "faculty members" : "students"} registered yet
                      </h4>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                        Add {activeSection === "teachers" ? "a faculty member" : "a scholar"} to manage their access and workspace permissions.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((u) => (
                      <div
                        key={u.id}
                        className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                                u.status === "active"
                                  ? "bg-emerald-500/15 text-emerald-500"
                                  : "bg-rose-500/15 text-rose-500"
                              }`}
                            >
                              {u.status}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase">{u.role}</span>
                          </div>
                          <h4 className="text-base font-bold">{u.fullName}</h4>
                          <p className="text-xs text-zinc-500 font-mono truncate">{u.email}</p>
                          <p className="text-xs text-amber-500 font-medium">
                            {u.department || u.targetProgram || u.institutionName}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-black text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            {u.status === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            <span>{u.status === "active" ? "Suspend" : "Activate"}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-400 transition-colors cursor-pointer"
                            title="Remove User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* SECTION 4: TUITION ADMISSIONS */}
          {activeSection === "tuition" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Centralized Tuition Admissions</h2>
                <p className="text-xs text-zinc-500">
                  Approve or decline student requests for chamber tuition access.
                </p>
              </div>

              {tuitionRequests.length === 0 ? (
                <div className="py-16 px-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
                  <Award className="w-8 h-8 text-amber-500 mx-auto" />
                  <h4 className="text-sm font-bold">No Tuition Requests</h4>
                  <p className="text-xs text-zinc-500">Student requests submitted from the Student Hub will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tuitionRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold">{req.studentName}</h4>
                          <p className="text-xs text-zinc-500 font-mono">
                            {req.studentCode} • {req.studentEmail}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            req.status === "approved"
                              ? "bg-emerald-500/15 text-emerald-500"
                              : req.status === "rejected"
                              ? "bg-rose-500/15 text-rose-500"
                              : "bg-amber-500/15 text-amber-500"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 italic">&quot;{req.reason}&quot;</p>
                      {req.status === "pending" && (
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleReviewTuition(req.id, "rejected")}
                            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold cursor-pointer flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                          <button
                            onClick={() => handleReviewTuition(req.id, "approved")}
                            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black text-xs font-extrabold cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 5: COURSES & SYLLABI */}
          {activeSection === "courses" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Masterclasses &amp; Courses</h2>
                  <p className="text-xs text-zinc-500">
                    Publish, audit, or unpublish courses across Student Hub and Faculty Studio.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCourseModal(true)}
                  className="px-4 py-2.5 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Course</span>
                </button>
              </div>

              {coursesList.length === 0 ? (
                <div className="py-16 px-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
                  <Layers className="w-8 h-8 text-amber-500 mx-auto" />
                  <h4 className="text-sm font-bold">No Courses Published</h4>
                  <p className="text-xs text-zinc-500">Publish a masterclass to make it available across the Academy.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coursesList
                    .filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((course) => (
                      <div
                        key={course.id}
                        className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 font-bold uppercase">
                              {course.exam}
                            </span>
                            <span className="text-zinc-500">{course.unitsCount}</span>
                          </div>
                          <h4 className="text-base font-bold">{course.title}</h4>
                          <p className="text-xs text-zinc-500 line-clamp-2">{course.description}</p>
                          <p className="text-[11px] text-zinc-400">Instructor: {course.instructor || "Faculty"}</p>
                        </div>
                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-rose-500 hover:text-white text-xs font-bold text-zinc-500 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 6: BOOKS & CBT MOCKS */}
          {activeSection === "content" && (
            <div className="space-y-8 animate-in fade-in duration-150">
              {/* CBT Mock Test Packs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black tracking-tight">CBT Mock Test Series ({mockPacks.length})</h2>
                    <p className="text-xs text-zinc-500">Manage entrance exam mock test packages.</p>
                  </div>
                  <button
                    onClick={() => setShowAddMockModal(true)}
                    className="px-4 py-2 rounded-full bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Mock Pack</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockPacks.map((pack) => (
                    <div
                      key={pack.id}
                      className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">{pack.exam}</span>
                        <h4 className="text-sm font-bold truncate">{pack.title}</h4>
                        <p className="text-xs text-zinc-500 font-mono">
                          {pack.testsCount} • ₹{pack.price}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteMockPack(pack.id)}
                        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-400 transition-colors cursor-pointer shrink-0"
                        title="Delete Mock Pack"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Law Books */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight">Digital Law Books ({booksList.length})</h2>
                  <p className="text-xs text-zinc-500">Audit and moderate books in the Academy Repository.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {booksList
                    .filter((b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((book) => (
                      <div
                        key={book.id}
                        className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] font-mono text-amber-500 font-bold uppercase">{book.department}</span>
                          <h4 className="text-sm font-bold truncate">{book.title}</h4>
                          <p className="text-xs text-zinc-500 truncate">{book.author}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-400 transition-colors cursor-pointer shrink-0"
                          title="Delete Book"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ADD TEACHER OR STUDENT */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase">
                User Provisioning
              </span>
              <h3 className="text-lg font-bold mt-1">Onboard Teacher or Student</h3>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {(["teacher", "student"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setNewUserRole(r)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize cursor-pointer ${
                      newUserRole === r
                        ? "bg-amber-500 text-black font-extrabold"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Full Name (e.g. Prof. Meera Nair)"
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
              <input
                type="email"
                required
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Email address"
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
              <input
                type="text"
                value={newUserDeptOrExam}
                onChange={(e) => setNewUserDeptOrExam(e.target.value)}
                placeholder={newUserRole === "teacher" ? "Department" : "Target Exam"}
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs uppercase cursor-pointer transition-colors"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PUBLISH COURSE */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowAddCourseModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase">
                Course Governance
              </span>
              <h3 className="text-lg font-bold mt-1">Publish Masterclass Course</h3>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-3">
              <input
                type="text"
                required
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                placeholder="Course Title"
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
              <select
                value={newCourseExam}
                onChange={(e) => setNewCourseExam(e.target.value)}
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              >
                <option>CLAT 2027 (NLUs)</option>
                <option>Distance LL.B (IGNOU)</option>
                <option>KLEE 2027 (Kerala)</option>
                <option>Judicial Services</option>
              </select>
              <input
                type="text"
                value={newCourseInstructor}
                onChange={(e) => setNewCourseInstructor(e.target.value)}
                placeholder="Instructor Name"
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
              <input
                type="text"
                value={newCourseUnits}
                onChange={(e) => setNewCourseUnits(e.target.value)}
                placeholder="Sections Count (e.g. 12 Sections)"
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
              <textarea
                rows={2}
                value={newCourseDesc}
                onChange={(e) => setNewCourseDesc(e.target.value)}
                placeholder="Curriculum description..."
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs uppercase cursor-pointer transition-colors"
              >
                Publish Course
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CBT MOCK PACK */}
      {showAddMockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowAddMockModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase">
                CBT Authoring
              </span>
              <h3 className="text-lg font-bold mt-1">Create CBT Mock Series</h3>
            </div>
            <form onSubmit={handleCreateMockPack} className="space-y-3">
              <input
                type="text"
                required
                value={newMockTitle}
                onChange={(e) => setNewMockTitle(e.target.value)}
                placeholder="Mock Series Title"
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
              <input
                type="text"
                value={newMockExam}
                onChange={(e) => setNewMockExam(e.target.value)}
                placeholder="Target Exam"
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newMockTestsCount}
                  onChange={(e) => setNewMockTestsCount(e.target.value)}
                  placeholder="15 Full Mocks"
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
                />
                <input
                  type="number"
                  value={newMockPrice}
                  onChange={(e) => setNewMockPrice(e.target.value)}
                  placeholder="Price (INR)"
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-black hover:text-white text-black font-extrabold text-xs uppercase cursor-pointer transition-colors"
              >
                Publish Mock Series
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardView;
