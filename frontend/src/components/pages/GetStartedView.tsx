"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Lock,
  User,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  Landmark,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandLogo } from "@/components/BrandLogo";
import { authApi, UserRole, AccountCategory } from "@/lib/api";

interface GetStartedViewProps {
  initialAuthMode?: "signup" | "signin";
}

export function GetStartedView({ initialAuthMode = "signup" }: GetStartedViewProps) {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"signup" | "signin">(initialAuthMode);

  // Top-Level User Tier: Citizen vs Professional
  const [tier, setTier] = useState<"citizen" | "professional">("citizen");

  // Professional Sub-Category matching user spec document bubbles:
  // 1. Independent Advocate
  // 2. Law Firm / Organization
  // 3. Company Secretary (CS) / Compliance Officer
  // 4. Chartered Accountant (CA)
  const [selectedBubble, setSelectedBubble] = useState<
    "independent_advocate" | "law_firm" | "cs" | "ca"
  >("independent_advocate");

  // Multi-step for Professional Signup:
  // Step 1: Base Credentials -> Step 2: Bubble Selection -> Step 3: Verification & Setup (Dynamic UX)
  const [profStep, setProfStep] = useState<1 | 2 | 3>(1);

  // Base Form Credentials
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 3: Dynamic UX Verification Fields based on selected bubble
  // 1. If Independent Advocate:
  const [barCouncilId, setBarCouncilId] = useState("");
  const [stateBarCouncil, setStateBarCouncil] = useState("Bar Council of Delhi");
  const [practiceCourt, setPracticeCourt] = useState("High Court & District Courts");

  // 2. If Law Firm:
  const [firmName, setFirmName] = useState("");
  const [teamSize, setTeamSize] = useState("6-20 Attorneys & Staff");
  const [firmRegistration, setFirmRegistration] = useState("");
  const [firmHq, setFirmHq] = useState("New Delhi, India");

  // 3. If Company Secretary:
  const [icsiNumber, setIcsiNumber] = useState("");
  const [icsiChapter, setIcsiChapter] = useState("NIRC (Northern India Regional Council)");
  const [csPracticeType, setCsPracticeType] = useState("Practicing Company Secretary (PCS)");

  // 4. If Chartered Accountant:
  const [icaiNumber, setIcaiNumber] = useState("");
  const [icaiCouncil, setIcaiCouncil] = useState("SIRC (Southern India Regional Council)");
  const [caPracticeType, setCaPracticeType] = useState("Statutory Audit & Tax Practice (ICAI)");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ==============================================================
  // 1. CITIZEN SIGNUP (Strictly Name, Email & Password ONLY - Zero legal questions)
  // ==============================================================
  const handleCitizenSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authApi.register({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        role: "client",
        accountType: "citizen",
      });

      const userPayload = res.user || {
        id: "citizen_" + Date.now(),
        fullName: fullName.trim(),
        email: email.trim(),
        role: "client",
        accountType: "citizen",
      };

      localStorage.setItem("wakheel_token", res.token || "dev_citizen_token");
      localStorage.setItem(
        "wakheel_user",
        JSON.stringify({ ...userPayload, role: "client", accountType: "citizen" })
      );

      setTimeout(() => {
        setIsSubmitting(false);
        router.push("/client-portal");
      }, 500);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || "Registration failed. Please try again.");
    }
  };

  // ==============================================================
  // 2. PROFESSIONAL SIGNUP STEP 1: Validate Base Credentials
  // ==============================================================
  const handleProfStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name or legal identifier.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setProfStep(2);
  };

  // ==============================================================
  // 3. PROFESSIONAL SIGNUP STEP 2: Bubble Selected -> Advance to Step 3
  // ==============================================================
  const handleProfStep2 = () => {
    setErrorMessage("");
    setProfStep(3);
  };

  // ==============================================================
  // 4. PROFESSIONAL SIGNUP STEP 3: Dynamic Verification & Final Submit
  // ==============================================================
  const handleProfStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate based on the bubble selected in Step 2
    if (selectedBubble === "independent_advocate" && !barCouncilId.trim()) {
      setErrorMessage("Please enter your Bar Council ID / License Number for verification.");
      return;
    }
    if (selectedBubble === "law_firm") {
      if (!firmName.trim()) {
        setErrorMessage("Please enter your Company / Firm Name.");
        return;
      }
      if (!firmRegistration.trim()) {
        setErrorMessage("Please enter your Bar / Registration / LLPIN details.");
        return;
      }
    }
    if (selectedBubble === "cs" && !icsiNumber.trim()) {
      setErrorMessage("Please enter your ICSI Membership Number (ACS/FCS).");
      return;
    }
    if (selectedBubble === "ca" && !icaiNumber.trim()) {
      setErrorMessage("Please enter your ICAI Membership / FRN Number.");
      return;
    }

    setIsSubmitting(true);

    try {
      let derivedRole: UserRole = "advocate";
      let derivedAccountType: AccountCategory = "independent_advocate";

      if (selectedBubble === "independent_advocate") {
        derivedRole = "advocate";
        derivedAccountType = "independent_advocate";
      } else if (selectedBubble === "law_firm") {
        derivedRole = "cs";
        derivedAccountType = "law_firm";
      } else if (selectedBubble === "cs") {
        derivedRole = "cs";
        derivedAccountType = "cs";
      } else if (selectedBubble === "ca") {
        derivedRole = "ca";
        derivedAccountType = "ca";
      }

      const res = await authApi.register({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        role: derivedRole,
        accountType: derivedAccountType,
        barCouncilId: barCouncilId.trim(),
        firmName: firmName.trim(),
        teamSize,
        firmRegistration: firmRegistration.trim(),
        icsiNumber: icsiNumber.trim(),
        icaiNumber: icaiNumber.trim(),
        stateBarCouncil,
        icsiChapter,
        additionalDetails: {
          practiceCourt,
          firmHq,
          csPracticeType,
          caPracticeType,
          icaiCouncil,
        },
      });

      const userPayload = res.user || {
        id: "prof_" + Date.now(),
        fullName: fullName.trim(),
        email: email.trim(),
        role: derivedRole,
        accountType: derivedAccountType,
        barCouncilId: barCouncilId.trim(),
        firmName: firmName.trim(),
        firmRegistration: firmRegistration.trim(),
        icsiNumber: icsiNumber.trim(),
        icaiNumber: icaiNumber.trim(),
      };

      localStorage.setItem("wakheel_token", res.token || "dev_prof_token");
      localStorage.setItem(
        "wakheel_user",
        JSON.stringify({ ...userPayload, role: derivedRole, accountType: derivedAccountType })
      );

      if (derivedRole === "advocate") {
        localStorage.setItem("wakheel_advocate_first_signup", "true");
        localStorage.setItem("wakheel_advocate_bar_id", barCouncilId.trim());
        localStorage.removeItem("wakheel_advocate_onboarded");
        localStorage.removeItem("wakheel_advocate_profile");

        try {
          const registered = JSON.parse(localStorage.getItem("wakheel_registered_advocates") || "[]");
          const cleanAdvName = fullName.trim().toLowerCase().startsWith("adv.") ? fullName.trim() : `Adv. ${fullName.trim()}`;
          const newAdvItem = {
            id: userPayload.id || `adv_${Date.now()}`,
            name: cleanAdvName,
            title: `Advocate • ${practiceCourt || "High Court of Kerala (Ernakulam)"}`,
            location: stateBarCouncil ? `${stateBarCouncil.replace("Bar Council of ", "")}, Kerala` : "Ernakulam, Kerala",
            experience: "8+ Years Experience",
            rating: 5.0,
            reviewsCount: 1,
            matchScore: 99,
            specialties: ["Civil Litigation", "Constitutional Writs", "Commercial Law"],
            fee: "₹1,500 / session",
            email: email.trim(),
            barCouncilNumber: barCouncilId.trim(),
            isCurrentUser: true,
          };
          const updatedList = [newAdvItem, ...registered.filter((a: any) => a.email !== email.trim())];
          localStorage.setItem("wakheel_registered_advocates", JSON.stringify(updatedList));
        } catch {
          // ignore storage errors
        }

        setTimeout(() => {
          setIsSubmitting(false);
          router.push("/advocate-workspace");
        }, 500);
      } else {
        const firmProfile = {
          id: "firm_" + Date.now(),
          name:
            firmName.trim() ||
            (derivedRole === "ca"
              ? `${fullName.trim()} & Co. Chartered Accountants`
              : derivedAccountType === "law_firm"
              ? `${fullName.trim()} & Partners Law LLP`
              : `${fullName.trim()} & Associates CS Practice`),
          employeeRange: teamSize,
          registrationCin:
            firmRegistration.trim() ||
            icsiNumber.trim() ||
            icaiNumber.trim() ||
            "REG-" + Date.now(),
          headquarters: firmHq.trim() || "New Delhi, India",
          founderName: fullName.trim(),
          contactEmail: email.trim(),
          industry:
            derivedRole === "ca"
              ? "Statutory Audit, Tax & Financial Advisory"
              : derivedAccountType === "law_firm"
              ? "Corporate Law & Litigation Practice"
              : "Corporate Governance & Secretarial Practice",
          companyType:
            derivedRole === "ca"
              ? "Partnership Firm (ICAI Registered)"
              : "Limited Liability Partnership (LLP)",
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem("wakheel_firm_profile", JSON.stringify(firmProfile));
        localStorage.setItem(
          "wakheel_active_workspace",
          JSON.stringify({ type: "firm", firmId: firmProfile.id })
        );

        setTimeout(() => {
          setIsSubmitting(false);
          router.push("/firm-workspace");
        }, 500);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || "Registration failed. Please check credentials.");
    }
  };

  // ==============================================================
  // 5. SIGN IN (Citizen or Professional)
  // ==============================================================
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      let loginRole: UserRole = "client";

      if (tier === "citizen") {
        loginRole = "client";
      } else {
        if (selectedBubble === "independent_advocate") loginRole = "advocate";
        else if (selectedBubble === "ca") loginRole = "ca";
        else loginRole = "cs";
      }

      const res = await authApi.login({
        email: email.trim(),
        password: password.trim(),
        role: loginRole,
      });

      const userPayload = res.user || {
        id: "user_" + Date.now(),
        fullName: email.split("@")[0],
        email: email.trim(),
        role: loginRole,
      };

      localStorage.setItem("wakheel_token", res.token || "dev_token");
      localStorage.setItem("wakheel_user", JSON.stringify({ ...userPayload, role: loginRole }));

      setTimeout(() => {
        setIsSubmitting(false);
        if (loginRole === "client") {
          router.push("/client-portal");
        } else if (loginRole === "advocate") {
          localStorage.removeItem("wakheel_advocate_first_signup");
          try {
            const registered = JSON.parse(localStorage.getItem("wakheel_registered_advocates") || "[]");
            const rawProf = localStorage.getItem("wakheel_advocate_profile");
            const prof = rawProf ? JSON.parse(rawProf) : null;
            let cleanAdvName = (userPayload.fullName || email.split("@")[0]).trim();
            if (!cleanAdvName.toLowerCase().startsWith("adv.") && !cleanAdvName.toLowerCase().startsWith("adv ")) {
              cleanAdvName = `Adv. ${cleanAdvName}`;
            }
            const loggedInAdvItem = {
              id: userPayload.id || `adv_${Date.now()}`,
              name: cleanAdvName,
              title: "Advocate • High Court of Kerala (Ernakulam)",
              location: "Ernakulam, Kerala",
              experience: prof?.experienceYears ? `${prof.experienceYears}+ Years Experience` : "10+ Years Experience",
              rating: 5.0,
              reviewsCount: 1,
              matchScore: 99,
              specialties: prof?.practiceAreas || ["Civil Litigation", "Constitutional Writs", "Commercial Law"],
              fee: "₹1,500 / session",
              email: email.trim(),
              barCouncilNumber: (userPayload as any).barCouncilId || prof?.barCouncilNumber || "K/001429/2024",
              isCurrentUser: true,
            };
            const updatedList = [loggedInAdvItem, ...registered.filter((a: any) => a.email !== email.trim())];
            localStorage.setItem("wakheel_registered_advocates", JSON.stringify(updatedList));
          } catch {
            // ignore
          }
          router.push("/advocate-workspace");
        } else {
          const hasFirm = localStorage.getItem("wakheel_firm_profile");
          if (hasFirm) {
            router.push("/firm-workspace");
          } else {
            router.push(`/setup-firm?category=${selectedBubble}`);
          }
        }
      }, 500);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || "Invalid credentials. Please verify your email and password.");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-black text-black dark:text-white transition-colors duration-200">
      
      {/* Left Column — Form Content */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-2xl mx-auto w-full">
        
        {/* Top Header */}
        <div className="flex items-center justify-between w-full mb-8">
          <BrandLogo size="md" />

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Form Body */}
        <div className="my-auto space-y-6 w-full">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white tracking-tight">
              {authMode === "signup"
                ? "Join the Wakheel Legal OS"
                : "Welcome back to Wakheel"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              {authMode === "signup"
                ? "Unified compliance, litigation intelligence, and professional workspace."
                : "Enter your credentials to access your legal chamber or client portal."}
            </p>
          </div>

          {/* Mode Switcher Tabs: Create Account vs Sign In */}
          <div className="p-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid grid-cols-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setProfStep(1);
                setErrorMessage("");
              }}
              className={`py-2 rounded-full transition-all cursor-pointer ${
                authMode === "signup"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setErrorMessage("");
              }}
              className={`py-2 rounded-full transition-all cursor-pointer ${
                authMode === "signin"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Sign In
            </button>
          </div>

          {/* ============================================================== */}
          {/* PRIMARY SELECTOR: CITIZEN VS PROFESSIONAL                      */}
          {/* ============================================================== */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
              {authMode === "signup" ? "ACCOUNT TIER" : "LOGGING IN AS"}
            </label>

            {/* Two Primary Options: Citizen vs Professional */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setTier("citizen");
                  setErrorMessage("");
                }}
                className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  tier === "citizen"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-md font-extrabold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Citizen</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTier("professional");
                  setErrorMessage("");
                }}
                className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  tier === "professional"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-md font-extrabold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>Professional</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#800020] ml-0.5" />
              </button>
            </div>

            {/* In SIGN IN mode: When Professional is selected, show category pills */}
            {authMode === "signin" && tier === "professional" && (
              <div className="pt-2 space-y-1.5 animate-in fade-in duration-200">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                  SELECT PROFESSIONAL CATEGORY
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  {[
                    { id: "independent_advocate", label: "Advocate", icon: Scale },
                    { id: "law_firm", label: "Law Firm", icon: Building2 },
                    { id: "cs", label: "CS Firm", icon: ShieldCheck },
                    { id: "ca", label: "CA Practice", icon: Landmark },
                  ].map((cat) => {
                    const isSelected = selectedBubble === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedBubble(cat.id as any)}
                        className={`py-2 px-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                            : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-white text-black dark:text-white text-xs flex items-start gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* CASE 1: CITIZEN FLOW (REGULAR SIGNUP/SIGNIN - ZERO LEGAL ASKS) */}
          {/* ============================================================== */}
          {tier === "citizen" && (
            <div>
              {authMode === "signup" ? (
                /* CITIZEN REGULAR SIGNUP FORM */
                <form onSubmit={handleCitizenSignup} className="space-y-4">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
                    <span className="font-bold text-black dark:text-white">Citizen Account:</span> Fast, regular sign up with email and password to track cases, book consultations, and review documents.
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 6 chars"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
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
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
                  >
                    <span>{isSubmitting ? "Creating Citizen Account..." : "Create Citizen Account →"}</span>
                  </button>

                  {/* WhatsApp Quick OTP Alternative */}
                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                    <span className="bg-white dark:bg-black px-2 text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                      OR
                    </span>
                  </div>

                  <Link
                    href="/otp-login"
                    className="w-full py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#800020]" />
                    <Phone className="w-3.5 h-3.5 text-black dark:text-white group-hover:scale-110 transition-transform" />
                    <span>Sign Up with WhatsApp OTP</span>
                    <span className="text-zinc-400">→</span>
                  </Link>
                </form>
              ) : (
                /* CITIZEN REGULAR SIGN IN FORM */
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Citizen Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
                  >
                    <span>{isSubmitting ? "Signing In..." : "Sign In as Citizen"}</span>
                  </button>

                  {/* WhatsApp Quick OTP Alternative */}
                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                    <span className="bg-white dark:bg-black px-2 text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                      OR
                    </span>
                  </div>

                  <Link
                    href="/otp-login"
                    className="w-full py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#800020]" />
                    <Phone className="w-3.5 h-3.5 text-black dark:text-white group-hover:scale-110 transition-transform" />
                    <span>Log in with WhatsApp OTP</span>
                    <span className="text-zinc-400">→</span>
                  </Link>
                </form>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* CASE 2: PROFESSIONAL FLOW (EXACT STEPPED UX MATCHING USER SPEC) */}
          {/* ============================================================== */}
          {tier === "professional" && (
            <div>
              {authMode === "signup" ? (
                /* PROFESSIONAL 3-STEP SIGNUP WIZARD */
                <div className="space-y-5">
                  
                  {/* Stepper Header Indicator */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs">
                    {[
                      { num: 1, label: "1. Credentials" },
                      { num: 2, label: "2. Category Bubbles" },
                      { num: 3, label: "3. Verification (Dynamic UX)" },
                    ].map((step) => (
                      <div key={step.num} className="flex items-center gap-1.5">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            profStep === step.num
                              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                              : profStep > step.num
                              ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black"
                              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          {profStep > step.num ? "✓" : step.num}
                        </div>
                        <span
                          className={`truncate hidden sm:inline ${
                            profStep === step.num
                              ? "font-bold text-black dark:text-white"
                              : "text-zinc-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* ============================================================== */}
                  {/* STEP 1: PROFESSIONAL ACCOUNT CREDENTIALS                       */}
                  {/* ============================================================== */}
                  {profStep === 1 && (
                    <form onSubmit={handleProfStep1} className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                          STEP 1: PROFESSIONAL CREDENTIALS
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-black dark:text-white">
                          Create your professional login credentials
                        </h3>
                      </div>

                      {/* Full Name */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Full Name / Legal Identifier
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Adv. Vikram Mehra / CS Rajesh Sharma / CA Suresh Singhania"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                          />
                        </div>
                      </div>

                      {/* Professional Email */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Professional / Chamber Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="counsel@wakheel.law or partners@apexlaw.in"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                          />
                        </div>
                      </div>

                      {/* Password & Confirm */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Create Password
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="password"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Min. 6 chars"
                              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
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
                              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Next Step Button */}
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <span>Continue to Category Selection</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  {/* ============================================================== */}
                  {/* STEP 2: CATEGORY BUBBLES MATCHING USER SPEC DOCUMENT EXACTLY   */}
                  {/* ============================================================== */}
                  {profStep === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                          STEP 2: SELECT PROFESSIONAL CATEGORY
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-black dark:text-white">
                          How will you be using Wakheel?
                        </h3>
                        <p className="text-xs text-zinc-500">
                          Select your professional category below. In the next step, our platform dynamically changes the verification &amp; setup screen.
                        </p>
                      </div>

                      {/* The 4 Category Bubbles matching the uploaded screenshot */}
                      <div className="space-y-3">
                        {[
                          {
                            id: "independent_advocate",
                            title: "Independent Advocate",
                            subtitle: "(Individual lawyers, consultants)",
                            badge: "Litigation & Advisory",
                            icon: Scale,
                          },
                          {
                            id: "law_firm",
                            title: "Law Firm / Organization",
                            subtitle: "(Multi-user accounts, shared billing, corporate legal depts)",
                            badge: "Enterprise & Partners",
                            icon: Building2,
                          },
                          {
                            id: "cs",
                            title: "Company Secretary (CS) / Compliance Officer",
                            subtitle: "(Corporate governance, secretarial standards)",
                            badge: "MCA21 & ROC Audits",
                            icon: ShieldCheck,
                          },
                          {
                            id: "ca",
                            title: "Chartered Accountant (CA)",
                            subtitle: "(Statutory audits, tax filing, financial certifications)",
                            badge: "ICAI Registered",
                            icon: Landmark,
                          },
                        ].map((bubble) => {
                          const isSelected = selectedBubble === bubble.id;
                          const Icon = bubble.icon;

                          return (
                            <div
                              key={bubble.id}
                              onClick={() => setSelectedBubble(bubble.id as any)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                                isSelected
                                  ? "bg-zinc-50 dark:bg-zinc-900 border-black dark:border-white shadow-md ring-1 ring-black dark:ring-white"
                                  : "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                              }`}
                            >
                              {/* Radio Indicator */}
                              <div className="mt-0.5">
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                    isSelected
                                      ? "border-black dark:border-white bg-black dark:bg-white"
                                      : "border-zinc-400 dark:border-zinc-600"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />
                                  )}
                                </div>
                              </div>

                              {/* Bubble Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-black dark:text-white shrink-0" />
                                    <span className="font-bold text-xs sm:text-sm text-black dark:text-white">
                                      {bubble.title}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold shrink-0">
                                    {bubble.badge}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-500 italic mt-0.5 leading-snug">
                                  {bubble.subtitle}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setProfStep(1)}
                          className="w-1/3 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-bold text-xs uppercase cursor-pointer"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={handleProfStep2}
                          className="flex-1 py-3.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Continue to Verification</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ============================================================== */}
                  {/* STEP 3: VERIFICATION & SETUP (DYNAMIC UX) MATCHING USER SPEC   */}
                  {/* ============================================================== */}
                  {profStep === 3 && (
                    <form onSubmit={handleProfStep3Submit} className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                          STEP 3: VERIFICATION &amp; SETUP (DYNAMIC UX)
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-black dark:text-white">
                          {selectedBubble === "independent_advocate" && "Bar Council ID / License Verification"}
                          {selectedBubble === "law_firm" && "Company / Law Firm & Team Details"}
                          {selectedBubble === "cs" && "Company Secretary (ICSI) Verification"}
                          {selectedBubble === "ca" && "Chartered Accountant (ICAI) Verification"}
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          Based on the bubble you selected in Step 2, the AI platform dynamically changes the final onboarding screen:
                        </p>
                      </div>

                      {/* DYNAMIC FORM 1: If Independent Advocate */}
                      {selectedBubble === "independent_advocate" && (
                        <div className="space-y-3.5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                              Bar Council ID / License Number for instant or manual verification <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={barCouncilId}
                              onChange={(e) => setBarCouncilId(e.target.value)}
                              placeholder="e.g. D/1492/2018 or MAH/5821/2015"
                              className="w-full p-3 text-xs font-mono font-bold rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
                            />
                            <span className="text-[10px] text-zinc-500 block">
                              Required for causelist sync and State Bar Council verification.
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                State Bar Council
                              </label>
                              <select
                                value={stateBarCouncil}
                                onChange={(e) => setStateBarCouncil(e.target.value)}
                                className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 font-semibold cursor-pointer text-black dark:text-white"
                              >
                                <option value="Bar Council of Delhi">Bar Council of Delhi</option>
                                <option value="Bar Council of Maharashtra & Goa">Bar Council of Maharashtra &amp; Goa</option>
                                <option value="Bar Council of Karnataka">Bar Council of Karnataka</option>
                                <option value="Bar Council of Tamil Nadu">Bar Council of Tamil Nadu</option>
                                <option value="Bar Council of Uttar Pradesh">Bar Council of Uttar Pradesh</option>
                                <option value="Other State Bar Council">Other State Bar Council</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Primary Practice Court
                              </label>
                              <select
                                value={practiceCourt}
                                onChange={(e) => setPracticeCourt(e.target.value)}
                                className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 font-semibold cursor-pointer text-black dark:text-white"
                              >
                                <option value="Supreme Court of India">Supreme Court of India</option>
                                <option value="High Court & District Courts">High Court &amp; District Courts</option>
                                <option value="District & Sessions Court">District &amp; Sessions Court</option>
                                <option value="NCLT / NCLAT Tribunals">NCLT / NCLAT Tribunals</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* DYNAMIC FORM 2: If Law Firm */}
                      {selectedBubble === "law_firm" && (
                        <div className="space-y-3.5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                              Company / Law Firm Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={firmName}
                              onChange={(e) => setFirmName(e.target.value)}
                              placeholder="e.g. Apex Law Partners LLP"
                              className="w-full p-3 text-xs font-semibold rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Size of the Team <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={teamSize}
                                onChange={(e) => setTeamSize(e.target.value)}
                                className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 font-semibold cursor-pointer text-black dark:text-white"
                              >
                                <option value="1 to 5 Attorneys (Solo / Boutique)">1 to 5 Attorneys (Boutique)</option>
                                <option value="6-20 Attorneys & Staff">6-20 Attorneys &amp; Staff</option>
                                <option value="21-50 Attorneys">21-50 Attorneys</option>
                                <option value="50+ Attorneys (Enterprise)">50+ Attorneys (Enterprise)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Bar / Registration Details <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={firmRegistration}
                                onChange={(e) => setFirmRegistration(e.target.value)}
                                placeholder="e.g. LLPIN-AAR-4192 / Reg. 2018"
                                className="w-full p-2.5 text-xs font-mono font-bold rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:outline-none text-black dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                              Headquarters / Main Office
                            </label>
                            <input
                              type="text"
                              value={firmHq}
                              onChange={(e) => setFirmHq(e.target.value)}
                              placeholder="e.g. New Delhi, DL, India"
                              className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                            />
                          </div>
                        </div>
                      )}

                      {/* DYNAMIC FORM 3: If Company Secretary */}
                      {selectedBubble === "cs" && (
                        <div className="space-y-3.5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                              ICSI Membership Number (ACS / FCS) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={icsiNumber}
                              onChange={(e) => setIcsiNumber(e.target.value)}
                              placeholder="e.g. FCS-9104 or ACS-38412"
                              className="w-full p-3 text-xs font-mono font-bold rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
                            />
                            <span className="text-[10px] text-zinc-500 block">
                              Ensures compliance access to MCA21 &amp; ROC secretarial audit modules.
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Regional Council Chapter
                              </label>
                              <select
                                value={icsiChapter}
                                onChange={(e) => setIcsiChapter(e.target.value)}
                                className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 font-semibold cursor-pointer text-black dark:text-white"
                              >
                                <option value="NIRC (Northern India Regional Council)">NIRC (Northern India)</option>
                                <option value="WIRC (Western India Regional Council)">WIRC (Western India)</option>
                                <option value="SIRC (Southern India Regional Council)">SIRC (Southern India)</option>
                                <option value="EIRC (Eastern India Regional Council)">EIRC (Eastern India)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Secretarial Practice Status
                              </label>
                              <select
                                value={csPracticeType}
                                onChange={(e) => setCsPracticeType(e.target.value)}
                                className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 font-semibold cursor-pointer text-black dark:text-white"
                              >
                                <option value="Practicing Company Secretary (PCS)">Practicing CS (PCS)</option>
                                <option value="In-House Corporate Compliance Officer">In-House Compliance Officer</option>
                                <option value="Corporate Secretarial Firm Partner">CS Firm Partner</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* DYNAMIC FORM 4: If Chartered Accountant */}
                      {selectedBubble === "ca" && (
                        <div className="space-y-3.5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                              ICAI Membership / Firm Reg. No. (FRN) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={icaiNumber}
                              onChange={(e) => setIcaiNumber(e.target.value)}
                              placeholder="e.g. FRN-014920N or ACA-518290"
                              className="w-full p-3 text-xs font-mono font-bold rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
                            />
                            <span className="text-[10px] text-zinc-500 block">
                              Ensures compliance access for statutory audits, tax certifications &amp; balance sheet attestations.
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Regional ICAI Council
                              </label>
                              <select
                                value={icaiCouncil}
                                onChange={(e) => setIcaiCouncil(e.target.value)}
                                className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 font-semibold cursor-pointer text-black dark:text-white"
                              >
                                <option value="SIRC (Southern India Regional Council)">SIRC (Southern India)</option>
                                <option value="WIRC (Western India Regional Council)">WIRC (Western India)</option>
                                <option value="NIRC (Northern India Regional Council)">NIRC (Northern India)</option>
                                <option value="CIRC (Central India Regional Council)">CIRC (Central India)</option>
                                <option value="EIRC (Eastern India Regional Council)">EIRC (Eastern India)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Audit &amp; Tax Practice Discipline
                              </label>
                              <select
                                value={caPracticeType}
                                onChange={(e) => setCaPracticeType(e.target.value)}
                                className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 font-semibold cursor-pointer text-black dark:text-white"
                              >
                                <option value="Statutory Audit & Tax Practice (ICAI)">Statutory Audit &amp; Tax</option>
                                <option value="Direct & Indirect Tax / GST Advisory">GST &amp; Tax Litigation</option>
                                <option value="Forensic Audit & Financial Advisory">Forensic Audit &amp; Valuation</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Prominent Link to Full Practice Setup with AI Autofill (User Screenshot) */}
                      <div className="p-3.5 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          <Sparkles className="w-4 h-4 text-black dark:text-white shrink-0" />
                          <div>
                            <span className="font-bold text-black dark:text-white block">
                              Need Detailed Practice Setup?
                            </span>
                            <span className="text-[11px] text-zinc-500">
                              Autofill practice website, retainers bracket, bio &amp; leadership.
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/setup-firm?category=${selectedBubble}`}
                          className="py-1.5 px-3 rounded-lg bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shrink-0 flex items-center gap-1"
                        >
                          <span>Open Form</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setProfStep(2)}
                          className="w-1/3 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-bold text-xs uppercase cursor-pointer"
                        >
                          ← Back
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 py-3.5 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          <span>{isSubmitting ? "Launching Workspace..." : "Complete Verification & Launch →"}</span>
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              ) : (
                /* PROFESSIONAL SIGN IN FORM */
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {selectedBubble === "independent_advocate"
                        ? "Advocate Email Address"
                        : selectedBubble === "law_firm"
                        ? "Law Firm Email Address"
                        : selectedBubble === "cs"
                        ? "Company Secretary Email"
                        : "Chartered Accountant Email"}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@inworth.law"
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
                  >
                    <span>
                      {isSubmitting
                        ? "Signing In..."
                        : `Sign In as ${
                            selectedBubble === "independent_advocate"
                              ? "Advocate"
                              : selectedBubble === "law_firm"
                              ? "Law Firm"
                              : selectedBubble === "cs"
                              ? "Company Secretary"
                              : "Chartered Accountant"
                          }`}
                    </span>
                  </button>

                  {/* WhatsApp Quick OTP Alternative */}
                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                    <span className="bg-white dark:bg-black px-2 text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                      OR
                    </span>
                  </div>

                  <Link
                    href="/otp-login"
                    className="w-full py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#800020]" />
                    <Phone className="w-3.5 h-3.5 text-black dark:text-white group-hover:scale-110 transition-transform" />
                    <span>Log in with WhatsApp OTP</span>
                    <span className="text-zinc-400">→</span>
                  </Link>
                </form>
              )}
            </div>
          )}

          {/* Test Accounts Shortcut */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
            <span className="font-bold text-black dark:text-white block mb-0.5">
              Quick Dev Test Credentials:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
              <div>
                <span className="font-semibold text-black dark:text-white">Citizen:</span>{" "}
                <code className="font-mono text-zinc-700 dark:text-zinc-300">citizen@inworth.law</code>
              </div>
              <div>
                <span className="font-semibold text-black dark:text-white">Advocate:</span>{" "}
                <code className="font-mono text-zinc-700 dark:text-zinc-300">advocate@wakheel.com</code>
              </div>
              <div>
                <span className="font-semibold text-black dark:text-white">CS Firm:</span>{" "}
                <code className="font-mono text-zinc-700 dark:text-zinc-300">cs@inworth.law</code>
              </div>
              <div>
                <span className="font-semibold text-black dark:text-white">CA Practice:</span>{" "}
                <code className="font-mono text-zinc-700 dark:text-zinc-300">ca@inworth.law</code>
              </div>
            </div>
            <div className="text-[10px] text-zinc-400 pt-0.5">
              Default password: <code className="font-mono text-black dark:text-white font-bold">password123</code>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-zinc-500 text-center sm:text-left pt-6">
          © 2026 Wakheel Legal Technology Inc. All rights reserved.
        </div>
      </div>

      {/* Right Column — Showcase Hero */}
      <div className="hidden lg:flex lg:col-span-5 bg-black text-white p-12 flex-col justify-between relative overflow-hidden border-l border-zinc-800">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Tag */}
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#800020]" />
            <Sparkles className="w-3.5 h-3.5 text-white" />
            Legal Operating System
          </span>
        </div>

        {/* Middle Showcase Content */}
        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-white">
            Precision legal clarity in black &amp; white.
          </h2>

          <p className="text-sm text-zinc-400 leading-relaxed">
            Instant simple access for Citizens, with specialized verified workspaces for Independent Advocates, Law Firms, Company Secretaries, and Chartered Accountants.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
              <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
              <span>Frictionless Citizen Signup (Email &amp; Password)</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
              <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
              <span>4 Professional Categories (Advocate, Law Firm, CS, CA)</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
              <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
              <span>Dynamic UX Verification &amp; Setup per Category</span>
            </div>
          </div>
        </div>

        {/* Bottom Card Footer */}
        <div className="relative z-10 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
          <span>Wakheel Legal AI v2.4</span>
          <span className="text-white font-bold font-mono">100% Encrypted</span>
        </div>

      </div>

    </div>
  );
}
