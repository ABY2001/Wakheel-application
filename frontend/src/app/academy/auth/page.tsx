"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  Mail,
  Lock,
  User,
  Building2,
  Award,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Check,
  AlertCircle,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GoogleIcon } from "@/components/GoogleIcon";

function AcademyAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "teacher" ? "teacher" : "student";
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  const [role, setRole] = useState<"student" | "teacher">(initialRole);
  const [authMode, setAuthMode] = useState<"signin" | "signup">(initialMode);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Student specific
  const [targetProgram, setTargetProgram] = useState("CLAT 2027 (Common Law Admission Test)");

  // Teacher specific
  const [department, setDepartment] = useState("Constitutional & Administrative Law");
  const [institutionName, setInstitutionName] = useState("National Law University / Faculty of Law");

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "teacher" || roleParam === "student") {
      setRole(roleParam);
    }
  }, [searchParams]);

  const switchRole = (newRole: "student" | "teacher") => {
    setRole(newRole);
    setErrorMessage("");
    router.replace(`/academy/auth?role=${newRole}&mode=${authMode}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (authMode === "signup" && password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const userPayload = {
        id: "academy_" + Date.now(),
        fullName: fullName.trim() || (role === "teacher" ? "Prof. Faculty Scholar" : "Law Scholar"),
        email: email.trim(),
        role: role,
        targetProgram: role === "student" ? targetProgram : undefined,
        department: role === "teacher" ? department : undefined,
        institutionName: role === "teacher" ? institutionName : undefined,
        enrolledAt: new Date().toISOString(),
      };

      localStorage.setItem("wakheel_academy_user", JSON.stringify(userPayload));
      localStorage.setItem("wakheel_academy_token", "academy_token_" + Date.now());
      localStorage.setItem("wakheel_academy_role", role);

      setSuccessMessage(
        authMode === "signup"
          ? `Account created! Launching ${role === "teacher" ? "Faculty Studio" : "Student Hub"}...`
          : `Signed in! Entering ${role === "teacher" ? "Faculty Studio" : "Student Hub"}...`
      );

      setTimeout(() => {
        router.push(role === "student" ? "/student/home" : "/teacher/home");
      }, 700);
    }, 600);
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    setErrorMessage("");

    setTimeout(() => {
      setIsGoogleLoading(false);
      const mockName = role === "teacher" ? "Prof. Google Scholar" : "Google Law Student";
      const userPayload = {
        id: "google_academy_" + Date.now(),
        fullName: mockName,
        email: `academy.${role}@gmail.com`,
        role: role,
        targetProgram: role === "student" ? targetProgram : undefined,
        department: role === "teacher" ? department : undefined,
        institutionName: role === "teacher" ? institutionName : undefined,
        enrolledAt: new Date().toISOString(),
      };

      localStorage.setItem("wakheel_academy_user", JSON.stringify(userPayload));
      localStorage.setItem("wakheel_academy_token", "academy_google_token_" + Date.now());
      localStorage.setItem("wakheel_academy_role", role);

      router.push(role === "student" ? "/student/home" : "/teacher/home");
    }, 700);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-black text-black dark:text-white transition-colors duration-200">
      {/* ============================================================== */}
      {/* LEFT COLUMN: AUTHENTICATION FORM (50%)                         */}
      {/* ============================================================== */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 max-w-xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex items-center justify-between w-full mb-8">
          <Link href="/login" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold shadow-sm group-hover:scale-105 transition-transform bg-amber-500 text-black"
            >
              {role === "teacher" ? (
                <BookOpen className="w-5 h-5 text-black" />
              ) : (
                <GraduationCap className="w-5 h-5 text-black" />
              )}
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                WAKHEEL <span className="text-amber-500">ACADEMY</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase block -mt-1 font-mono">
                {role === "student" ? "Student Portal" : "Faculty Studio"}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>

        {/* Main Auth Container */}
        <div className="w-full space-y-6 my-auto py-4">
          {/* Header Title with Role Badge */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                {role === "student" ? (
                  <GraduationCap className="w-3.5 h-3.5" />
                ) : (
                  <BookOpen className="w-3.5 h-3.5" />
                )}
                <span>{role === "student" ? "Law Student Portal" : "Faculty Studio"}</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {authMode === "signin"
                  ? role === "student"
                    ? "Welcome Back, Law Scholar"
                    : "Welcome Back, Professor"
                  : role === "student"
                  ? "Enroll as a Law Student"
                  : "Register as Law Faculty"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                {role === "student"
                  ? "Access CLAT & KLEE timed CBT mocks, distance law syllabi, and Gemini AI tutor."
                  : "Access law semester curriculum builders, moot court bench studios, and AI exam authoring."}
              </p>
            </div>
          </div>

          {/* Mode Selector (Sign In vs Create Account) */}
          <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-2 gap-1 text-center">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setErrorMessage("");
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                authMode === "signin"
                  ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-black dark:hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setErrorMessage("");
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                authMode === "signup"
                  ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-black dark:hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google Quick Button */}
          <button
            type="button"
            disabled={isGoogleLoading || isSubmitting}
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-60"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>
              {isGoogleLoading
                ? "Connecting Google Account..."
                : `${authMode === "signin" ? "Sign In" : "Sign Up"} with Google (${role === "teacher" ? "Faculty" : "Student"})`}
            </span>
          </button>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
            <span className="bg-white dark:bg-black px-3 text-[11px] font-semibold text-zinc-400 shrink-0">
              or continue with email
            </span>
            <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
          </div>

          {/* Main Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Sign Up only) */}
            {authMode === "signup" && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {role === "teacher" ? "Full Name & Academic Title" : "Full Legal / Student Name"}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={role === "teacher" ? "e.g. Prof. Advithya Menon, Ph.D" : "e.g. Advithya Sharma"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                {role === "teacher" ? "Faculty / Institutional Email Address" : "Student Email Address"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "teacher" ? "professor@law.university.edu" : "scholar@law.edu or personal@gmail.com"}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>
            </div>

            {/* Role-Specific Fields on Sign Up */}
            {authMode === "signup" && role === "student" && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Target Law Program / Examination
                </label>
                <select
                  value={targetProgram}
                  onChange={(e) => setTargetProgram(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="CLAT 2027 (Common Law Admission Test)">CLAT 2027 (Consortium of 24 NLUs)</option>
                  <option value="KLEE 2027 (Kerala Law Entrance Exam)">KLEE 2027 (CEE Kerala 3-Yr &amp; 5-Yr LLB)</option>
                  <option value="AILET 2027 (All India Law Entrance Test)">AILET 2027 (NLU Delhi)</option>
                  <option value="IGNOU School of Law (Distance LLB & Diplomas)">IGNOU School of Law (Distance LLB)</option>
                  <option value="State Open University Distance Law Program">State Open University Distance LLB</option>
                  <option value="3-Yr / 5-Yr Regular LLB Undergraduate">Regular Law College LL.B Undergraduate</option>
                </select>
              </div>
            )}

            {authMode === "signup" && role === "teacher" && (
              <>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Faculty Department / Specialization
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Constitutional & Administrative Law">Constitutional &amp; Administrative Law</option>
                    <option value="Criminal Law & Bharatiya Nyaya Sanhita (BNS)">Criminal Law &amp; Bharatiya Nyaya Sanhita (BNS)</option>
                    <option value="Civil Procedure Code & Trial Practice">Civil Procedure Code &amp; Trial Practice</option>
                    <option value="Law of Contracts & Corporate Commercial Law">Law of Contracts &amp; Commercial Law</option>
                    <option value="Entrance Coaching & Moot Court Directorship">Entrance Coaching &amp; Moot Court Directorship</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Affiliated Law School / University
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder="e.g. Government Law College / National Law University"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>
            </div>

            {/* Confirm Password (Sign Up only) */}
            {authMode === "signup" && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-2 bg-amber-500 hover:bg-black hover:text-white text-black border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>
                    {authMode === "signin"
                      ? `Sign In as Law ${role === "teacher" ? "Faculty" : "Student"} →`
                      : `Create ${role === "teacher" ? "Faculty" : "Student"} Account & Launch →`}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Switch Prompt */}
          <div className="text-center text-xs text-slate-500 dark:text-zinc-400 pt-2">
            {role === "student" ? (
              <span>
                Looking for faculty tools instead?{" "}
                <button
                  type="button"
                  onClick={() => switchRole("teacher")}
                  className="font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Switch to Faculty Studio →
                </button>
              </span>
            ) : (
              <span>
                Looking for student learning instead?{" "}
                <button
                  type="button"
                  onClick={() => switchRole("student")}
                  className="font-bold text-amber-500 hover:underline cursor-pointer"
                >
                  Switch to Student Hub →
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-zinc-500 text-center sm:text-left pt-6">
          © 2026 Wakheel Academy. All rights reserved.
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT COLUMN: SHOWCASE HERO FOR SELECTED ROLE (50%)            */}
      {/* ============================================================== */}
      <div className="hidden lg:flex bg-black text-white p-10 sm:p-12 lg:p-14 xl:p-16 flex-col justify-between relative overflow-hidden border-l border-zinc-800 w-full">
        {/* Decorative Glow */}
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none transition-colors duration-500"
        />

        {/* Top Role Badge */}
        <div className="relative z-10">
          <span
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider font-mono"
          >
            {role === "teacher" ? <BookOpen className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
            <span>{role === "teacher" ? "Faculty Workspace Preview" : "Student Hub Preview"}</span>
          </span>
        </div>

        {/* Middle Showcase Content */}
        <div className="relative z-10 space-y-7 max-w-xl w-full my-auto py-8">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl xl:text-[42px] font-black leading-tight tracking-tight text-white">
              {role === "teacher"
                ? "Pedagogical mastery for legal educators."
                : "Master entrance exams and court craft."}
            </h2>

            <p className="text-sm lg:text-base text-zinc-400 leading-relaxed">
              {role === "teacher"
                ? "Complete academic suite for professors and coaching directors: lesson planners, moot court proposition authoring, and student performance tracking."
                : "All-in-one portal for CLAT & KLEE entrance candidates, IGNOU distance law scholars, and LL.B undergraduates across India."}
            </p>
          </div>

          {/* Dynamic Feature Checklist based on Role */}
          <div className="space-y-4 pt-2">
            {role === "student" ? (
              <>
                <div className="flex items-start gap-3.5 text-xs lg:text-sm font-semibold text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>All-India CBT Exam Simulators:</strong> CLAT 2027 (+1/-0.25) &amp; KLEE 2027 (+3/-1) with instant scorecards.</span>
                </div>

                <div className="flex items-start gap-3.5 text-xs lg:text-sm font-semibold text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Open University Curricula:</strong> Free updated Bare Acts (BNS 2023, CPC 1908, Constitution) &amp; syllabus notes.</span>
                </div>

                <div className="flex items-start gap-3.5 text-xs lg:text-sm font-semibold text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Gemini AI Legal Reasoning Tutor:</strong> Real-time Principle + Fact problem generator with judicial rationale.</span>
                </div>

                <div className="flex items-start gap-3.5 text-xs lg:text-sm font-semibold text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Chamber Clerkship Pipeline:</strong> Apply directly for summer internships with Bar Council verified advocates.</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3.5 text-xs lg:text-sm font-semibold text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>14-Week Law Semester Curriculum:</strong> Weekly lesson breakdowns, teaching units, and Bare Act distribution.</span>
                </div>

                <div className="flex items-start gap-3.5 text-xs lg:text-sm font-semibold text-blue-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300"><strong>Moot Court Problem Creator:</strong> Draft appellate case propositions with BCI memorial evaluation rubrics.</span>
                </div>

                <div className="flex items-start gap-3.5 text-xs lg:text-sm font-semibold text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>AI-Assisted Question Authoring:</strong> Synthesize entrance questions and publish directly to the student mock exam pool.</span>
                </div>

                <div className="flex items-start gap-3.5 text-xs lg:text-sm font-semibold text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>Cohort Analytics &amp; Scoreboards:</strong> Monitor student batch velocity, average marks, and upcoming milestones.</span>
                </div>
              </>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center">
              <span className={`text-xl font-black font-mono block ${role === "teacher" ? "text-blue-400" : "text-amber-400"}`}>
                {role === "teacher" ? "14-Wk" : "120+"}
              </span>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                {role === "teacher" ? "Syllabus Track" : "Mock CBTs"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center">
              <span className="text-xl font-black text-emerald-400 font-mono block">100%</span>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Free Bare Acts</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center">
              <span className="text-xl font-black text-purple-400 font-mono block">24/7</span>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">AI Legal Tutor</span>
            </div>
          </div>
        </div>

        {/* Bottom Card Footer */}
        <div className="relative z-10 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
          <span>Wakheel Academy v1.0 • Separate DB</span>
          <span className={`font-bold font-mono ${role === "teacher" ? "text-blue-400" : "text-amber-400"}`}>
            {role === "teacher" ? "Faculty Workspace" : "Student Hub"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AcademyAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6 text-xs text-zinc-400">
          Loading Wakheel Academy Authentication...
        </div>
      }
    >
      <AcademyAuthForm />
    </Suspense>
  );
}
