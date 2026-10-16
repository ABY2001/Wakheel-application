"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  Scale,
  Building2,
  Landmark,
  Briefcase,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandLogo } from "@/components/BrandLogo";
import { authApi, UserRole } from "@/lib/api";

export function WhatsAppOtpLoginView() {
  const router = useRouter();

  // Step 1: "phone" (enter number & role) | Step 2: "otp" (verify 6-digit code)
  const [step, setStep] = useState<"phone" | "otp">("otp");
  const [tier, setTier] = useState<"citizen" | "professional">("citizen");
  const [professionalCategory, setProfessionalCategory] = useState<
    "advocate" | "law_firm" | "cs" | "ca"
  >("advocate");
  const [role, setRole] = useState<UserRole>("client");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("12354 86935");

  // 6-digit OTP array
  const [otp, setOtp] = useState<string[]>(["1", "2", "3", "4", "5", "6"]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // States
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successBanner, setSuccessBanner] = useState(
    "We sent a 6-digit verification code to your WhatsApp."
  );
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);

  // Timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, step]);

  // Handle individual digit typing
  const handleOtpChange = (val: string, index: number) => {
    const clean = val.replace(/[^0-9]/g, "");
    if (!clean && val !== "") return;

    const newOtp = [...otp];
    newOtp[index] = clean ? clean.slice(-1) : "";
    setOtp(newOtp);
    setErrorMessage("");

    // Auto-advance to next box if digit entered
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Backspace and navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Support pasting 6-digit code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasteData[i] || "";
    }
    setOtp(newOtp);

    const nextIdx = Math.min(pasteData.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMessage("Please enter a valid WhatsApp mobile number");
      return;
    }

    setIsSending(true);
    setErrorMessage("");

    try {
      const fullPhone = `${countryCode} ${phone.trim()}`;
      const res = await authApi.sendWhatsAppOtp({ phone: fullPhone, role });
      setSuccessBanner(res.message || `Code sent to ${fullPhone}`);
      setStep("otp");
      setCountdown(45);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send WhatsApp code. Try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join("");
    if (fullCode.length < 6) {
      setErrorMessage("Please enter all 6 digits of the WhatsApp code.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");

    const fullPhone = `${countryCode} ${phone.trim()}`;

    try {
      const res = await authApi.verifyWhatsAppOtp({
        phone: fullPhone,
        otp: fullCode,
        role,
      });

      const userPayload = res.user || {
        id: "wa_" + Date.now(),
        fullName: `Counsel ${phone.slice(-4)}`,
        email: `${phone.replace(/[^0-9]/g, "")}@whatsapp.wakheel.law`,
        role,
      };

      localStorage.setItem("wakheel_token", res.token || "dev_wa_token");
      localStorage.setItem("wakheel_user", JSON.stringify({ ...userPayload, role }));

      setTimeout(() => {
        if (role === "advocate") {
          const onboarded = localStorage.getItem("wakheel_advocate_onboarded");
          if (!onboarded) {
            localStorage.setItem("wakheel_advocate_first_signup", "true");
          }
          router.push("/advocate-workspace");
        } else if (role === "cs" || role === "ca") {
          const hasFirm = localStorage.getItem("wakheel_firm_profile");
          if (hasFirm) {
            router.push("/firm-workspace");
          } else {
            router.push(`/setup-firm?category=${role}`);
          }
        } else {
          router.push("/client-portal");
        }
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid or expired OTP. Please try again.");
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(45);
    setErrorMessage("");
    try {
      const fullPhone = `${countryCode} ${phone.trim()}`;
      await authApi.sendWhatsAppOtp({ phone: fullPhone, role });
      setSuccessBanner(`A new 6-digit code has been sent to ${fullPhone}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to resend code.");
    }
  };

  const formattedDisplayPhone = `${countryCode} ${phone}`;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans bg-white dark:bg-black text-black dark:text-white transition-colors duration-200">
      
      {/* ============================================================== */}
      {/* --- LEFT PANEL: Strict Black & White with subtle burgundy micro-accent --- */}
      {/* ============================================================== */}
      <div className="flex-1 bg-white dark:bg-black p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-r border-zinc-200 dark:border-zinc-800 min-h-screen relative">
        
        {/* Top Nav */}
        <div className="flex items-center justify-between pb-8">
          <div className="inline-flex items-center gap-2.5">
            <BrandLogo size="sm" showSubtitle={false} />
            {/* Very small quantity burgundy badge */}
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6e0b1c]" />
              WhatsApp OTP
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>

        {/* Form Container (max-w-[400px] centered) */}
        <div className="max-w-[400px] w-full mx-auto my-auto py-6">
          
          {/* STEP 2: VERIFY OTP */}
          {step === "otp" ? (
            <div className="space-y-6">
              
              {/* Icon Box with discreet burgundy accent */}
              <div className="relative w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-black dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-800">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                {/* Burgundy micro-accent dot */}
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#6e0b1c] ring-2 ring-white dark:ring-black" />
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
                  Verify your WhatsApp
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                  We sent a 6-digit code to{" "}
                  <span className="font-bold text-black dark:text-white">
                    {formattedDisplayPhone}
                  </span>
                  .
                </p>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-white text-black dark:text-white text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#6e0b1c]" />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}

              {/* OTP Input Form */}
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                
                {/* 6 Digit Input Boxes (Black & White with crisp focus) */}
                <div className="flex items-center justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      onPaste={handlePaste}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black transition-all shadow-xs"
                    />
                  ))}
                </div>

                {/* Primary Action Button (Strict Black & White) */}
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3.5 px-4 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {isVerifying ? (
                    <>
                      <svg
                        className="animate-spin"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                      </svg>
                      <span>Verifying OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; Continue</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Resend & Change Details */}
                <p className="text-xs text-zinc-500 text-center">
                  Didn&apos;t receive the code?{" "}
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-black dark:text-white font-bold underline cursor-pointer"
                    >
                      Resend code
                    </button>
                  ) : (
                    <span className="text-zinc-400">Resend in {countdown}s</span>
                  )}{" "}
                  or{" "}
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-black dark:text-white font-bold underline cursor-pointer"
                  >
                    change details
                  </button>
                </p>

                {/* Role Switcher Pill */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-400 block mb-1.5 font-mono uppercase tracking-wider font-bold">
                    LOGGING IN AS
                  </span>
                  <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 gap-1 text-xs">
                    {(["client", "advocate", "cs"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          role === r
                            ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                            : "text-zinc-500 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        {r === "client" ? "Citizen" : r === "advocate" ? "Advocate" : "CS Firm"}
                      </button>
                    ))}
                  </div>
                </div>

              </form>

            </div>
          ) : (
            
            /* STEP 1: PHONE NUMBER INPUT */
            <div className="space-y-6">
              
              {/* Icon Box with discreet burgundy accent */}
              <div className="relative w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-black dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-800">
                <Phone className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#6e0b1c] ring-2 ring-white dark:ring-black" />
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
                  Sign in with WhatsApp
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                  Enter your mobile number to receive an instant 6-digit WhatsApp authentication code.
                </p>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-white text-black dark:text-white text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#6e0b1c]" />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}

              {/* Role Selector: Citizen vs Professional */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  LOGGING IN AS
                </label>

                {/* Primary Tier: Citizen vs Professional */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setTier("citizen");
                      setRole("client");
                    }}
                    className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      tier === "citizen"
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-md font-extrabold"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span>Citizen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTier("professional");
                      if (professionalCategory === "advocate") setRole("advocate");
                      else if (professionalCategory === "ca") setRole("ca");
                      else setRole("cs");
                    }}
                    className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      tier === "professional"
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-md font-extrabold"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 shrink-0" />
                    <span>Professional</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#800020] ml-0.5" />
                  </button>
                </div>

                {/* Professional Disciplines (Only shown when Professional selected) */}
                {tier === "professional" && (
                  <div className="pt-1.5 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                      SELECT PROFESSIONAL DISCIPLINE
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      {[
                        { id: "advocate", label: "Advocate", icon: Scale, roleVal: "advocate" as UserRole },
                        { id: "law_firm", label: "Law Firm", icon: Building2, roleVal: "cs" as UserRole },
                        { id: "cs", label: "CS Firm", icon: Shield, roleVal: "cs" as UserRole },
                        { id: "ca", label: "CA Practice", icon: Landmark, roleVal: "ca" as UserRole },
                      ].map((item) => {
                        const isSelected = professionalCategory === item.id;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setProfessionalCategory(item.id as any);
                              setRole(item.roleVal);
                            }}
                            className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                              isSelected
                                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                                : "text-zinc-500 hover:text-black dark:hover:text-white"
                            }`}
                          >
                            <Icon className="w-3 h-3 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Phone Form */}
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    WhatsApp Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="w-20 px-3 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold flex items-center justify-center text-black dark:text-white font-mono">
                      {countryCode}
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      className="flex-1 p-3 text-xs sm:text-sm font-semibold rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3.5 px-4 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending WhatsApp Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send WhatsApp Code</span>
                      <span>→</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-zinc-500 text-center">
                  Prefer password login?{" "}
                  <Link
                    href="/login"
                    className="text-black dark:text-white font-bold underline"
                  >
                    Sign in with Email
                  </Link>
                </p>
              </form>

            </div>
          )}

        </div>

        {/* Bottom Help */}
        <div className="text-center pt-6 text-[11px] text-zinc-400">
          By signing in, you agree to Wakheel&apos;s Legal Terms of Service &amp; Privacy Policy.
        </div>

      </div>

      {/* ============================================================== */}
      {/* --- RIGHT PANEL: Obsidian Black Showcase with subtle burgundy touch --- */}
      {/* ============================================================== */}
      <div className="flex-1 bg-black text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-t lg:border-t-0 lg:border-l border-zinc-800">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[480px] mx-auto w-full my-auto space-y-8 z-10 py-8">
          
          {/* Logo Section */}
          <div className="inline-flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
            <img
              src="/logo-transparent.png"
              alt="Wakheel.com Logo"
              className="h-9 w-auto object-contain"
            />
            <div className="flex flex-col text-left">
              <span className="text-xl font-bold tracking-tight text-white leading-none">
                wakheel
              </span>
              <span className="text-[9px] tracking-[0.16em] text-zinc-400 font-bold uppercase mt-1">
                LEGAL OS • BCI &amp; ICSI READY
              </span>
            </div>
          </div>

          {/* Badge with very small burgundy dot */}
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-semibold uppercase tracking-wider text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6e0b1c]" />
              Professional Suite
            </span>
          </div>

          {/* Main Headline (Exact requested text) */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-white">
            Access Advanced Case Research, AI Drafting Assistance, Contract Analysis, and firm management tools.
          </h1>

          {/* Feature List (Black & White with CheckCircle) */}
          <ul className="space-y-3.5 pt-2">
            {[
              "Advanced Case Research",
              "AI Drafting Assistance",
              "Contract Analysis",
              "Law Firm & MCA Secretarial Tools",
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm sm:text-base text-zinc-300 font-medium">
                <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {/* Bottom Security Card */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-white shrink-0" />
              <span>End-to-end 256-bit encrypted authentication</span>
            </div>
            {/* Subtle Burgundy micro-pill */}
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#6e0b1c]/30 text-[#fca5a5] border border-[#6e0b1c]/60 font-bold">
              VERIFIED
            </span>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-xs text-zinc-500 text-center lg:text-left pt-6 border-t border-zinc-900 z-10">
          © 2026 Wakheel Legal Technology Inc. All rights reserved.
        </div>

      </div>

    </div>
  );
}
