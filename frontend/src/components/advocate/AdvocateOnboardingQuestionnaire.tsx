"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

export interface AdvocateOnboardingData {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  organisationName: string;
  mobileNumber: string;
  roleDescription: string;
  customRoleDescription?: string;
  workplaceType: string;
  customWorkplaceType?: string;
  practiceAreas: string[];
  primaryUseCases: string[];
  barCouncilEnrollmentNumber?: string;
  completedAt?: string;
}

interface AdvocateOnboardingQuestionnaireProps {
  initialData?: Partial<AdvocateOnboardingData>;
  onComplete: (data: AdvocateOnboardingData) => void;
  onSkip?: () => void;
}

const ROLE_OPTIONS = [
  {
    id: "Litigator / Advocate",
    title: "Litigator / Advocate",
    subtitle: "Courts, tribunals, pleadings",
  },
  {
    id: "Corporate lawyer",
    title: "Corporate lawyer",
    subtitle: "Transactions, contracts, advisory",
  },
  {
    id: "In-house counsel",
    title: "In-house counsel",
    subtitle: "Legal team inside a company",
  },
  {
    id: "Compliance / CS / CA",
    title: "Compliance / CS / CA",
    subtitle: "Filings, registers, regulatory",
  },
  {
    id: "Paralegal / Legal ops",
    title: "Paralegal / Legal ops",
    subtitle: "Research, documents, matter admin",
  },
  {
    id: "Law student / Researcher",
    title: "Law student / Researcher",
    subtitle: "Study, moots, academic work",
  },
  {
    id: "Judge / Judicial officer",
    title: "Judge / Judicial officer",
    subtitle: "Bench, tribunal member, registry",
  },
  {
    id: "Other",
    title: "Other",
    subtitle: "Tell us in a few words",
  },
];

const WORKPLACE_OPTIONS = [
  {
    id: "Solo practice",
    title: "Solo practice",
    subtitle: "Just me",
  },
  {
    id: "Law firm, 2 to 10",
    title: "Law firm, 2 to 10",
    subtitle: "Small firm or chambers",
  },
  {
    id: "Law firm, 11 to 50",
    title: "Law firm, 11 to 50",
    subtitle: "Mid-size firm",
  },
  {
    id: "Law firm, 50+",
    title: "Law firm, 50+",
    subtitle: "Large or full-service firm",
  },
  {
    id: "Company, in-house",
    title: "Company, in-house",
    subtitle: "Legal or compliance team",
  },
  {
    id: "Government / PSU / Regulator",
    title: "Government / PSU / Regulator",
    subtitle: "Public sector",
  },
  {
    id: "University / Academic",
    title: "University / Academic",
    subtitle: "Faculty, institute, research centre",
  },
  {
    id: "Other",
    title: "Other",
    subtitle: "Tell us in a few words",
  },
];

const PRACTICE_AREA_OPTIONS = [
  "Civil litigation",
  "Criminal",
  "Arbitration",
  "Corporate / M&A",
  "Banking & Finance",
  "Insolvency (IBC)",
  "Direct tax",
  "GST & Indirect tax",
  "Intellectual property",
  "Real estate",
  "Labour & Employment",
  "Family",
  "Competition",
  "Securities (SEBI)",
  "Data privacy",
  "Environment",
  "Constitutional",
  "Consumer",
];

const PRIMARY_USE_CASE_OPTIONS = [
  {
    id: "Legal research",
    title: "Legal research",
    description: "Judgments, statutes, answers with citations",
    tags: "Research · Ask · Briefing",
  },
  {
    id: "Drafting",
    title: "Drafting",
    description: "Pleadings, notices, opinions, templates",
    tags: "Draft · Fill in the Blanks · MS Word",
  },
  {
    id: "Reviewing documents",
    title: "Reviewing documents",
    description: "Read, compare and pull facts out of files",
    tags: "Interact · Extract to Table · Translate",
  },
  {
    id: "Contracts",
    title: "Contracts",
    description: "Redlines, approvals, e-sign, renewals",
    tags: "Contracts",
  },
  {
    id: "Court cases and hearings",
    title: "Court cases and hearings",
    description: "Cause lists, orders, next dates",
    tags: "Case Tracking · Calendar",
  },
  {
    id: "Compliance",
    title: "Compliance",
    description: "Obligation registers and due dates",
    tags: "Compliance",
  },
];

const EXTRA_USE_CASE_OPTIONS = [
  {
    id: "Vault & E-Sign",
    title: "Vault & E-Sign",
    description: "Encrypted client vault and 5-clause electronic consent",
    tags: "Vault · E-Sign · Office Suite",
  },
  {
    id: "Chamber ERP & Billing",
    title: "Chamber ERP & Billing",
    description: "HRM, CRM retainers, GST invoicing, and trust accounts",
    tags: "Huremaso · Curemaso · Acmaso",
  },
  {
    id: "AI Workforce & Collab",
    title: "AI Workforce & Collab",
    description: "Autonomous judicial agents, AI twin, and associate hub",
    tags: "My AI Agents · My AI Twin · Collask",
  },
];

export function AdvocateOnboardingQuestionnaire({
  initialData,
  onComplete,
  onSkip,
}: AdvocateOnboardingQuestionnaireProps) {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;
  const totalBarSegments = 9;

  // Step 1 State
  const [firstName, setFirstName] = useState(initialData?.firstName || "Trustworth");
  const [lastName, setLastName] = useState(initialData?.lastName || "International");
  const [email, setEmail] = useState(
    initialData?.email || "trustworthinternational@gmail.com"
  );
  const [country, setCountry] = useState(initialData?.country || "India");
  const [organisationName, setOrganisationName] = useState(
    initialData?.organisationName || "inworth"
  );
  const [mobileNumber, setMobileNumber] = useState(
    initialData?.mobileNumber || "+919000971900"
  );
  const [editingMobile, setEditingMobile] = useState(false);
  const [showMobileReason, setShowMobileReason] = useState(false);

  // Step 2 State
  const [roleDescription, setRoleDescription] = useState(
    initialData?.roleDescription || "Litigator / Advocate"
  );
  const [customRoleDescription, setCustomRoleDescription] = useState(
    initialData?.customRoleDescription || ""
  );

  // Step 3 State
  const [workplaceType, setWorkplaceType] = useState(
    initialData?.workplaceType || "Law firm, 2 to 10"
  );
  const [customWorkplaceType, setCustomWorkplaceType] = useState(
    initialData?.customWorkplaceType || ""
  );

  // Step 4 State (Pick up to 5)
  const [practiceAreas, setPracticeAreas] = useState<string[]>(
    initialData?.practiceAreas || []
  );

  // Step 5 State (Pick any that apply)
  const [primaryUseCases, setPrimaryUseCases] = useState<string[]>(
    initialData?.primaryUseCases || ["Legal research", "Drafting", "Court cases and hearings"]
  );
  const [showMoreUseCases, setShowMoreUseCases] = useState(false);

  // Hydrate from localStorage user if present
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("wakheel_advocate_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile) as Partial<AdvocateOnboardingData>;
        if (parsed.firstName) setFirstName(parsed.firstName);
        if (parsed.lastName) setLastName(parsed.lastName);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.country) setCountry(parsed.country);
        if (parsed.organisationName) setOrganisationName(parsed.organisationName);
        if (parsed.mobileNumber) setMobileNumber(parsed.mobileNumber);
        if (parsed.roleDescription) setRoleDescription(parsed.roleDescription);
        if (parsed.workplaceType) setWorkplaceType(parsed.workplaceType);
        if (parsed.practiceAreas) setPracticeAreas(parsed.practiceAreas);
        if (parsed.primaryUseCases) setPrimaryUseCases(parsed.primaryUseCases);
      } else {
        const savedUser = localStorage.getItem("wakheel_user");
        if (savedUser) {
          const userObj = JSON.parse(savedUser);
          if (userObj.email) setEmail(userObj.email);
          if (userObj.fullName) {
            const parts = String(userObj.fullName).trim().split(" ");
            if (parts.length > 0 && parts[0]) setFirstName(parts[0]);
            if (parts.length > 1) setLastName(parts.slice(1).join(" "));
          }
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const togglePracticeArea = (area: string) => {
    if (practiceAreas.includes(area)) {
      setPracticeAreas(practiceAreas.filter((a) => a !== area));
    } else {
      if (practiceAreas.length < 5) {
        setPracticeAreas([...practiceAreas, area]);
      }
    }
  };

  const toggleUseCase = (id: string) => {
    if (primaryUseCases.includes(id)) {
      setPrimaryUseCases(primaryUseCases.filter((u) => u !== id));
    } else {
      setPrimaryUseCases([...primaryUseCases, id]);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const finalData: AdvocateOnboardingData = {
        firstName: firstName.trim() || "Advocate",
        lastName: lastName.trim(),
        email: email.trim(),
        country,
        organisationName: organisationName.trim() || "inworth",
        mobileNumber: mobileNumber.trim() || "+919000971900",
        roleDescription,
        customRoleDescription: roleDescription === "Other" ? customRoleDescription : undefined,
        workplaceType,
        customWorkplaceType: workplaceType === "Other" ? customWorkplaceType : undefined,
        practiceAreas,
        primaryUseCases,
        completedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem("wakheel_advocate_profile", JSON.stringify(finalData));
        localStorage.setItem("wakheel_advocate_onboarded", "true");
      } catch {
        // Ignore storage errors
      }

      onComplete(finalData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const displayedUseCases = showMoreUseCases
    ? [...PRIMARY_USE_CASE_OPTIONS, ...EXTRA_USE_CASE_OPTIONS]
    : PRIMARY_USE_CASE_OPTIONS;

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black text-black dark:text-white font-sans flex flex-col transition-colors duration-200">
      {/* =========================================================================
          TOP PROGRESS BAR HEADER (Matches 9-segment progress bar in reference)
      ========================================================================= */}
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between bg-white dark:bg-black sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" />
        </div>

        {/* Center 9-Segment Progress Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {Array.from({ length: totalBarSegments }).map((_, idx) => {
            // Map 5 steps smoothly across the segments (Step 1 = 1 bar, Step 2 = 2 bars, Step 3 = 3 bars, Step 4 = 4 bars, Step 5 = 5 bars)
            const isFilled = idx < step;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (idx < totalSteps) {
                    setStep(idx + 1);
                  }
                }}
                disabled={idx >= totalSteps}
                className={`h-1 w-7 sm:w-11 rounded-full transition-all duration-300 ${
                  isFilled
                    ? "bg-black dark:bg-white cursor-pointer"
                    : "bg-zinc-200 dark:bg-zinc-800"
                } ${idx < totalSteps ? "hover:opacity-80 cursor-pointer" : "cursor-default"}`}
                title={idx < totalSteps ? `Step ${idx + 1}` : undefined}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              Skip setup
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* =========================================================================
          MAIN QUESTIONNAIRE BODY
      ========================================================================= */}
      <main className="flex-1 flex flex-col justify-center max-w-3xl w-full mx-auto px-6 py-12 sm:py-16">
        {/* Back Button (Shown on Steps 2 to 5) */}
        {step > 1 && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
        )}

        {/* =====================================================================
            STEP 1: Tell us a bit about you.
        ===================================================================== */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-black dark:text-white block tracking-wide">
                About you
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white tracking-tight">
                Tell us a bit about you.
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Signed in as{" "}
                <strong className="text-black dark:text-white font-semibold">
                  {email}
                </strong>
                . Teammates see your name on shared work.
              </p>
            </div>

            {/* 2x2 Input Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
              {/* First name */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              {/* Last name */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Country
                </label>
                <div className="relative">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full appearance-none px-4 py-3 pr-10 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer"
                  >
                    <option value="India">India</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Australia">Australia</option>
                    <option value="Canada">Canada</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Organisation name */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Organisation name
                </label>
                <input
                  type="text"
                  value={organisationName}
                  onChange={(e) => setOrganisationName(e.target.value)}
                  placeholder="Your firm or chamber name"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-normal">
                  Your firm or company. Use your own name if you practise alone.
                </p>
              </div>
            </div>

            {/* Mobile number section */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-medium text-black dark:text-white">
                  Mobile number
                </label>
                <button
                  type="button"
                  onClick={() => setShowMobileReason(!showMobileReason)}
                  className="text-xs font-semibold text-black dark:text-white underline underline-offset-4 hover:opacity-75 cursor-pointer"
                >
                  Why do we need this?
                </button>
              </div>

              {showMobileReason && (
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                  We use your verified WhatsApp number to send real-time High Court &amp; Supreme Court causelist alerts, urgent filing OTPs, and client matter updates.
                </div>
              )}

              {!editingMobile ? (
                <div className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                    <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      Verified on WhatsApp ·{" "}
                      <strong className="text-black dark:text-white font-bold">
                        {mobileNumber}
                      </strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingMobile(true)}
                    className="text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+919000971900"
                    className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingMobile(false)}
                    className="px-4 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-sm flex items-center gap-3 transition-all cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 2: What best describes you?
        ===================================================================== */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-black dark:text-white block tracking-wide">
                About your work
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white tracking-tight">
                What best describes you?
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">
                Wakheel uses this to pitch its answers at the right level and to suggest the right tools first.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {ROLE_OPTIONS.map((option) => {
                const isSelected = roleDescription === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setRoleDescription(option.id)}
                    className={`p-5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-start space-y-1.5 ${
                      isSelected
                        ? "border-black dark:border-white ring-2 ring-black dark:ring-white bg-zinc-50 dark:bg-zinc-900"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-600"
                    }`}
                  >
                    <span className="text-sm font-bold text-black dark:text-white">
                      {option.title}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                      {option.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {roleDescription === "Other" && (
              <div className="max-w-md space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Please specify your role
                </label>
                <input
                  type="text"
                  value={customRoleDescription}
                  onChange={(e) => setCustomRoleDescription(e.target.value)}
                  placeholder="e.g., Arbitration Counsel, Legal Consultant..."
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-sm flex items-center gap-3 transition-all cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 3: Where do you work?
        ===================================================================== */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-black dark:text-white block tracking-wide">
                About your work
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white tracking-tight">
                Where do you work?
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                This describes{" "}
                <strong className="text-black dark:text-white font-semibold">
                  {organisationName || "inworth"}
                </strong>
                . Owners and admins can change it later in Settings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {WORKPLACE_OPTIONS.map((option) => {
                const isSelected = workplaceType === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setWorkplaceType(option.id)}
                    className={`p-5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-start space-y-1.5 ${
                      isSelected
                        ? "border-black dark:border-white ring-2 ring-black dark:ring-white bg-zinc-50 dark:bg-zinc-900"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-600"
                    }`}
                  >
                    <span className="text-sm font-bold text-black dark:text-white">
                      {option.title}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                      {option.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {workplaceType === "Other" && (
              <div className="max-w-md space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Tell us about your workplace
                </label>
                <input
                  type="text"
                  value={customWorkplaceType}
                  onChange={(e) => setCustomWorkplaceType(e.target.value)}
                  placeholder="e.g., Independent Legal Aid Clinic, Tribunal..."
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-sm flex items-center gap-3 transition-all cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 4: What are your practice areas?
        ===================================================================== */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-black dark:text-white block tracking-wide">
                About your work
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white tracking-tight">
                What are your practice areas?
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Pick up to 5. We use these to rank research results and the Latest feed.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {PRACTICE_AREA_OPTIONS.map((area) => {
                const isSelected = practiceAreas.includes(area);
                const isDisabled = !isSelected && practiceAreas.length >= 5;
                return (
                  <button
                    key={area}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => togglePracticeArea(area)}
                    className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold shadow-2xs"
                        : isDisabled
                        ? "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
                        : "bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-black dark:text-white hover:border-black dark:hover:border-white"
                    }`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {practiceAreas.length} of 5 selected
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-sm flex items-center gap-3 transition-all cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 5: What will you use Wakheel for most?
        ===================================================================== */}
        {step === 5 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-black dark:text-white block tracking-wide">
                About your work
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white tracking-tight">
                What will you use Wakheel for most?
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">
                Pick any that apply. The matching apps go first on your Home screen. Every other app stays one click away in the launcher.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {displayedUseCases.map((item) => {
                const isSelected = primaryUseCases.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleUseCase(item.id)}
                    className={`p-5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[150px] ${
                      isSelected
                        ? "border-black dark:border-white ring-2 ring-black dark:ring-white bg-zinc-50 dark:bg-zinc-900"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-black dark:text-white">
                          {item.title}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                      {item.tags}
                    </div>
                  </button>
                );
              })}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowMoreUseCases(!showMoreUseCases)}
                className="text-xs sm:text-sm font-semibold text-black dark:text-white hover:underline underline-offset-4 cursor-pointer"
              >
                {showMoreUseCases ? "Show less" : "Show more"}
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-sm flex items-center gap-3 transition-all cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
