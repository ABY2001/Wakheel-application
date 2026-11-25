"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import academyApi from "@/lib/academyApi";

export default function AcademyAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter your administrator email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await academyApi.adminLogin(email, password);
      if (res.success && res.user && res.token) {
        localStorage.setItem("wakheel_academy_user", JSON.stringify(res.user));
        localStorage.setItem("wakheel_academy_token", res.token);
        localStorage.setItem("wakheel_academy_role", "admin");
        setSuccessMessage("Admin credentials verified. Launching Dean Control Center...");
        setTimeout(() => {
          router.push("/academy/admin");
        }, 500);
      } else {
        setErrorMessage(res.message || "Invalid administrator credentials.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Authentication error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="h-16 px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between">
        <Link
          href="/academy/auth"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Academy Auth</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
            Dean &amp; Admin Gate
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-black dark:bg-amber-500 text-amber-400 dark:text-black flex items-center justify-center mx-auto shadow-md border border-amber-500/30">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-extrabold uppercase tracking-wider">
              Wakheel Academy Governance
            </span>
            <h1 className="text-2xl font-black tracking-tight text-black dark:text-white">
              Admin Control Login
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Centralized management for Faculty, Scholars, Courses, Books &amp; Tuition Admissions.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@wakheel.law"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? "Verifying Credentials..." : "Enter Admin Control Center"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 text-center space-y-1">
            <p className="text-[11px] text-zinc-500 font-mono">
              Restricted to authorized Wakheel Academy Deans &amp; Administrators.
            </p>
            <p className="text-[10px] text-zinc-400 font-mono">
              Default Dev Admin: <span className="text-amber-500">admin@wakheel.law</span> / <span className="text-amber-500">WakheelAdmin@2026</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
