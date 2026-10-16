"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Globe,
  Mail,
  User,
  Calendar,
  DollarSign,
  ShieldCheck,
  Scale,
  Landmark,
  Briefcase,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

export type ProfessionalCategory =
  | "Advocate"
  | "Law Firm"
  | "CS (Company Secretary)"
  | "CA (Chartered Accountant)";

export function SetupCompanyView() {
  const router = useRouter();

  // 4 Professional Categories matching user requirement
  const [orgType, setOrgType] = useState<ProfessionalCategory>("Advocate");

  // Autofill with AI state
  const [aiUrl, setAiUrl] = useState("https://inworth.law");
  const [isAutofilling, setIsAutofilling] = useState(false);

  // Form Fields matching screenshot
  const [companyName, setCompanyName] = useState("");
  const [headquarters, setHeadquarters] = useState("");
  const [industry, setIndustry] = useState("");
  const [companyType, setCompanyType] = useState("Sole Proprietorship / Independent Counsel");
  const [employeeRange, setEmployeeRange] = useState("Solo Practice (1 Principal)");
  const [founderName, setFounderName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [foundedYear, setFoundedYear] = useState("2018");
  const [revenueValuation, setRevenueValuation] = useState("₹15M - ₹40M");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [registrationCin, setRegistrationCin] = useState("");
  const [description, setDescription] = useState("");
  const [whyJoinUs, setWhyJoinUs] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read URL query parameter if passed (e.g. /setup-firm?category=ca or advocate or cs or law_firm)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get("category") || params.get("type");
      if (catParam) {
        const lower = catParam.toLowerCase();
        if (lower.includes("advocate")) {
          setOrgType("Advocate");
          applyCategoryDefaults("Advocate");
        } else if (lower.includes("firm") || lower.includes("law")) {
          setOrgType("Law Firm");
          applyCategoryDefaults("Law Firm");
        } else if (lower.includes("cs") || lower.includes("secretary")) {
          setOrgType("CS (Company Secretary)");
          applyCategoryDefaults("CS (Company Secretary)");
        } else if (lower.includes("ca") || lower.includes("accountant")) {
          setOrgType("CA (Chartered Accountant)");
          applyCategoryDefaults("CA (Chartered Accountant)");
        }
      }
    }
  }, []);

  // Update defaults when switching categories
  const applyCategoryDefaults = (category: ProfessionalCategory) => {
    if (category === "Advocate") {
      setCompanyType("Sole Proprietorship / Independent Counsel");
      setEmployeeRange("Solo Practice (1 Principal)");
      setAiUrl("https://krishnanlaw.in");
      setRevenueValuation("₹15M - ₹35M");
    } else if (category === "Law Firm") {
      setCompanyType("Limited Liability Partnership (LLP)");
      setEmployeeRange("11 to 50 attorneys & staff");
      setAiUrl("https://apexlaw.in");
      setRevenueValuation("₹35M - ₹80M");
    } else if (category === "CS (Company Secretary)") {
      setCompanyType("Practicing Company Secretary Firm (PCS)");
      setEmployeeRange("6 to 20 associates");
      setAiUrl("https://mehtacs.in");
      setRevenueValuation("₹20M - ₹50M");
    } else if (category === "CA (Chartered Accountant)") {
      setCompanyType("Partnership Firm (ICAI Registered)");
      setEmployeeRange("11 to 50 audit & tax staff");
      setAiUrl("https://singhaniaca.in");
      setRevenueValuation("₹25M - ₹60M");
    }
  };

  const handleCategoryChange = (category: ProfessionalCategory) => {
    setOrgType(category);
    applyCategoryDefaults(category);
  };

  // Smart Autofill simulation tailored to the selected professional category
  const handleAutofillWithAi = () => {
    setIsAutofilling(true);
    setTimeout(() => {
      if (orgType === "Advocate") {
        setCompanyName("Adv. Meera Krishnan Chambers");
        setHeadquarters("High Court of Delhi & Supreme Court, New Delhi, India");
        setIndustry("Criminal Defense, Constitutional Writs, Commercial Litigation & Arbitration");
        setCompanyType("Sole Proprietorship / Independent Counsel");
        setEmployeeRange("Solo Practice (1 Principal)");
        setFounderName("Adv. Meera Krishnan");
        setContactEmail("chambers@krishnanlaw.in");
        setFoundedYear("2017");
        setRevenueValuation("₹15M - ₹35M");
        setWebsiteUrl(aiUrl || "https://krishnanlaw.in");
        setRegistrationCin("D/1842/2017 (Bar Council of Delhi)");
        setDescription(
          "Independent chamber counsel specializing in commercial dispute resolution, writ litigation before the High Court of Delhi, and appellate proceedings in the Supreme Court of India."
        );
        setWhyJoinUs(
          "Hands-on courtroom advocacy, rigorous causelist intelligence, and comprehensive judicial brief drafting backed by AI research tools."
        );
      } else if (orgType === "Law Firm") {
        setCompanyName("Apex Law & Corporate Partners LLP");
        setHeadquarters("Connaught Place, New Delhi, DL, India");
        setIndustry("Corporate Law, Mergers & Acquisitions, Banking & Commercial Arbitration");
        setCompanyType("Limited Liability Partnership (LLP)");
        setEmployeeRange("11 to 50 attorneys & staff");
        setFounderName("Adv. Vikram Mehra & Partners");
        setContactEmail("partners@apexlaw.in");
        setFoundedYear("2018");
        setRevenueValuation("₹35M - ₹80M");
        setWebsiteUrl(aiUrl || "https://apexlaw.in");
        setRegistrationCin("LLPIN-AAR-4192 / D/1942/2012");
        setDescription(
          "Apex Law & Corporate Partners LLP is a premier full-service legal firm advising corporate enterprises on M&A, cross-border investments, dispute resolution, and contractual governance."
        );
        setWhyJoinUs(
          "Integrated litigation and corporate advisory practice with multi-counsel collaboration, centralized billing, and shared case intelligence."
        );
      } else if (orgType === "CS (Company Secretary)") {
        setCompanyName("Mehta & Associates Corporate Secretarial Practice");
        setHeadquarters("Bandra Kurla Complex (BKC), Mumbai, MH, India");
        setIndustry("Corporate Governance, MCA21 e-Filings, ROC Compliance & Secretarial Audit");
        setCompanyType("Practicing Company Secretary Firm (PCS)");
        setEmployeeRange("6 to 20 associates");
        setFounderName("CS Rajesh Sharma (FCS)");
        setContactEmail("compliance@mehtacs.in");
        setFoundedYear("2016");
        setRevenueValuation("₹20M - ₹50M");
        setWebsiteUrl(aiUrl || "https://mehtacs.in");
        setRegistrationCin("FCS-9481 / CP-10294 (ICSI)");
        setDescription(
          "Practicing Company Secretarial firm managing end-to-end statutory compliance, Form MR-3 secretarial audits, Board meeting minutes, and annual ROC filings for public and private companies."
        );
        setWhyJoinUs(
          "Streamlined secretarial workflow automation, direct MCA21 portal sync, and structured compliance registers for high-growth enterprise boards."
        );
      } else if (orgType === "CA (Chartered Accountant)") {
        setCompanyName("S. K. Singhania & Co. Chartered Accountants");
        setHeadquarters("MG Road, Bengaluru, KA, India");
        setIndustry("Statutory Audit, Direct & Indirect Taxation, GST, Forensic Audit & Valuation");
        setCompanyType("Partnership Firm (ICAI Registered)");
        setEmployeeRange("11 to 50 audit & tax staff");
        setFounderName("CA Suresh Singhania (FCA)");
        setContactEmail("tax@singhaniaca.in");
        setFoundedYear("2015");
        setRevenueValuation("₹25M - ₹60M");
        setWebsiteUrl(aiUrl || "https://singhaniaca.in");
        setRegistrationCin("FRN-014920N / ACA-518290 (ICAI)");
        setDescription(
          "Established Chartered Accountancy firm providing comprehensive statutory audits, corporate tax planning, GST litigation representation, forensic auditing, and MCA financial statement certifications."
        );
        setWhyJoinUs(
          "Advanced audit management platform with automated audit trails, digitized balance sheet certifications, and timely statutory filing alerts."
        );
      }
      setIsAutofilling(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const profileData = {
      id: "org_" + Date.now(),
      name: companyName.trim() || `${orgType} Professional Practice`,
      orgType,
      headquarters: headquarters.trim() || "New Delhi, India",
      industry: industry.trim() || `${orgType} Professional Practice Areas`,
      companyType,
      employeeRange,
      founderName: founderName.trim() || "Lead Practitioner",
      contactEmail: contactEmail.trim() || "contact@practice.law",
      foundedYear,
      revenueValuation,
      websiteUrl: websiteUrl.trim() || aiUrl,
      registrationCin: registrationCin.trim() || "REG-" + Date.now(),
      description,
      whyJoinUs,
      createdAt: new Date().toISOString(),
    };

    try {
      if (orgType === "Advocate") {
        localStorage.setItem("wakheel_advocate_profile", JSON.stringify(profileData));
        localStorage.setItem("wakheel_advocate_onboarded", "true");
        localStorage.setItem("wakheel_advocate_bar_id", registrationCin.trim());
        localStorage.removeItem("wakheel_advocate_first_signup");

        const savedUser = localStorage.getItem("wakheel_user");
        if (savedUser) {
          const u = JSON.parse(savedUser);
          u.role = "advocate";
          u.accountType = "independent_advocate";
          u.fullName = founderName.trim() || u.fullName;
          u.email = contactEmail.trim() || u.email;
          u.barCouncilId = registrationCin.trim();
          localStorage.setItem("wakheel_user", JSON.stringify(u));
        } else {
          localStorage.setItem(
            "wakheel_user",
            JSON.stringify({
              id: "adv_" + Date.now(),
              fullName: founderName.trim() || "Adv. Practitioner",
              email: contactEmail.trim() || "advocate@inworth.law",
              role: "advocate",
              accountType: "independent_advocate",
              barCouncilId: registrationCin.trim(),
            })
          );
        }

        setTimeout(() => {
          setIsSubmitting(false);
          router.push("/advocate-workspace");
        }, 500);
      } else {
        // Law Firm, CS, or CA -> Firm Workspace
        const derivedRole = orgType === "CA (Chartered Accountant)" ? "ca" : "cs";
        const derivedAccountType =
          orgType === "Law Firm"
            ? "law_firm"
            : orgType === "CS (Company Secretary)"
            ? "cs"
            : "ca";

        localStorage.setItem("wakheel_firm_profile", JSON.stringify(profileData));
        localStorage.setItem(
          "wakheel_active_workspace",
          JSON.stringify({ type: "firm", firmId: profileData.id })
        );

        const savedUser = localStorage.getItem("wakheel_user");
        if (savedUser) {
          const u = JSON.parse(savedUser);
          u.role = derivedRole;
          u.accountType = derivedAccountType;
          u.firm = profileData;
          u.fullName = founderName.trim() || u.fullName;
          u.email = contactEmail.trim() || u.email;
          localStorage.setItem("wakheel_user", JSON.stringify(u));
        } else {
          localStorage.setItem(
            "wakheel_user",
            JSON.stringify({
              id: derivedRole + "_" + Date.now(),
              fullName: founderName.trim() || "Lead Partner",
              email: contactEmail.trim() || "partner@inworth.law",
              role: derivedRole,
              accountType: derivedAccountType,
              firm: profileData,
            })
          );
        }

        setTimeout(() => {
          setIsSubmitting(false);
          router.push("/firm-workspace");
        }, 500);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  // Category-specific statutory registration label & placeholder
  const getRegistrationLabel = () => {
    switch (orgType) {
      case "Advocate":
        return "Bar Council Enrollment Number (e.g. D/1842/2017)";
      case "Law Firm":
        return "LLPIN / CIN / Bar Registration Number (e.g. LLPIN-AAR-4192)";
      case "CS (Company Secretary)":
        return "ICSI Membership No. (ACS/FCS) & COP (e.g. FCS-9481)";
      case "CA (Chartered Accountant)":
        return "ICAI Membership No. & Firm Reg. (FRN) (e.g. FRN-014920N)";
    }
  };

  const getRegistrationPlaceholder = () => {
    switch (orgType) {
      case "Advocate":
        return "e.g. D/1842/2017 or MAH/4102/2015";
      case "Law Firm":
        return "e.g. LLPIN-AAR-4192 / D/1942/2012";
      case "CS (Company Secretary)":
        return "e.g. FCS-9481 / CP-10294";
      case "CA (Chartered Accountant)":
        return "e.g. FRN-014920N / ACA-518290";
    }
  };

  const getCompanyNameLabel = () => {
    switch (orgType) {
      case "Advocate":
        return "Chamber / Practice Name";
      case "Law Firm":
        return "Law Firm Name";
      case "CS (Company Secretary)":
        return "CS Practice / Advisory Firm Name";
      case "CA (Chartered Accountant)":
        return "Chartered Accountancy Firm Name";
    }
  };

  const getCompanyNamePlaceholder = () => {
    switch (orgType) {
      case "Advocate":
        return "e.g. Adv. Meera Krishnan Chambers";
      case "Law Firm":
        return "e.g. Apex Law & Corporate Partners LLP";
      case "CS (Company Secretary)":
        return "e.g. Mehta & Associates Corporate Secretarial Practice";
      case "CA (Chartered Accountant)":
        return "e.g. S. K. Singhania & Co. Chartered Accountants";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white font-sans py-8 sm:py-12 px-4 transition-colors duration-200">
      
      {/* Top Header Bar */}
      <div className="max-w-2xl mx-auto flex items-center justify-between pb-6 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        <BrandLogo size="md" />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>

      {/* Main Container Card (Exact Centered Layout matching user screenshot) */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 shadow-xl space-y-6">
        
        {/* Title Header matching screenshot */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
            Set up your Company
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Tell us about your organization or practice to configure your professional workspace.
          </p>
        </div>

        {/* Top ORGANIZATION TYPE / 4 PROFESSIONAL CATEGORIES SELECTOR matching screenshot */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase block text-center sm:text-left">
            ORGANIZATION TYPE
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            {[
              { id: "Advocate", label: "Advocate", icon: Scale },
              { id: "Law Firm", label: "Law Firm", icon: Building2 },
              { id: "CS (Company Secretary)", label: "CS", fullLabel: "CS (Company Sec.)", icon: ShieldCheck },
              { id: "CA (Chartered Accountant)", label: "CA", fullLabel: "CA (Chartered Acc.)", icon: Landmark },
            ].map((cat) => {
              const isSelected = orgType === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id as ProfessionalCategory)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                    isSelected
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{cat.fullLabel || cat.label}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#800020] ml-0.5 hidden sm:inline-block" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* AUTOFILL WITH AI Card matching screenshot */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-black dark:text-white">
            <Sparkles className="w-4 h-4 text-black dark:text-white" />
            <span className="font-mono tracking-wider">AUTOFILL WITH AI</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#800020]" />
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Paste your company&apos;s website or about page URL and we&apos;ll suggest values for the fields below. You can review and edit everything before saving.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Globe className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={aiUrl}
                onChange={(e) => setAiUrl(e.target.value)}
                placeholder="https://inworth.law"
                className="w-full pl-8 pr-20 py-2.5 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white font-mono"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                Suggesting
              </span>
            </div>

            <button
              type="button"
              onClick={handleAutofillWithAi}
              disabled={isAutofilling}
              className="py-2.5 px-4 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAutofilling ? "Autofilling..." : "Autofill with AI"}</span>
            </button>
          </div>
        </div>

        {/* Form Fields matching the two-column grid in user screenshot */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Company name (Full width) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              {getCompanyNameLabel()}
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={getCompanyNamePlaceholder()}
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
            />
          </div>

          {/* Row 2: Headquarters | Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Headquarters
              </label>
              <input
                type="text"
                required
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value)}
                placeholder="e.g. San Francisco, CA, USA / New Delhi, India"
                className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold focus:outline-none text-black dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Industry / Specialization
              </label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Corporate Law, Audit, Tax, Litigation"
                className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold focus:outline-none text-black dark:text-white"
              />
            </div>
          </div>

          {/* Row 3: Type of company | Number of employees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Type of company
              </label>
              <select
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold focus:outline-none cursor-pointer text-black dark:text-white"
              >
                <option value="Sole Proprietorship / Independent Counsel">Sole Proprietorship / Independent Counsel</option>
                <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                <option value="Partnership Firm (Indian Partnership Act, 1932)">Partnership Firm (1932 Act)</option>
                <option value="Partnership Firm (ICAI Registered)">Partnership Firm (ICAI Registered)</option>
                <option value="Practicing Company Secretary Firm (PCS)">Practicing Company Secretary Firm (PCS)</option>
                <option value="Corporate Legal & Advisory Private Limited">Corporate Legal &amp; Advisory Pvt Ltd</option>
                <option value="Chambers Association / Joint Practice">Chambers Association / Joint Practice</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Number of employees
              </label>
              <select
                value={employeeRange}
                onChange={(e) => setEmployeeRange(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold focus:outline-none cursor-pointer text-black dark:text-white"
              >
                <option value="Solo Practice (1 Principal)">Solo Practice (1 Principal)</option>
                <option value="2 to 10 Associates & Staff">2 to 10 Associates &amp; Staff</option>
                <option value="6 to 20 associates">6 to 20 Associates &amp; Staff</option>
                <option value="11 to 50 attorneys & staff">11 to 50 Attorneys &amp; Staff</option>
                <option value="11 to 50 audit & tax staff">11 to 50 Audit &amp; Tax Staff</option>
                <option value="51 to 100 Associates">51 to 100 Associates</option>
                <option value="100+ Enterprise Team">100+ Enterprise Team</option>
              </select>
            </div>
          </div>

          {/* Row 4: CIRCLED IN BLUE IN USER SCREENSHOT! CEO / Founder & Contact email */}
          <div className="p-3.5 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/80 border-2 border-black dark:border-white shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-black dark:text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#800020]" />
                PRIMARY LEAD PRACTITIONER &amp; CONTACT
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black font-semibold">
                Required
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-black dark:text-white block">
                  CEO / Founder
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={founderName}
                    onChange={(e) => setFounderName(e.target.value)}
                    placeholder="Full name"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 text-xs font-semibold focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-black dark:text-white block">
                  Contact email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 text-xs font-semibold focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 5: Founded | Annual Revenue / Retainer Valuation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Founded
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(e.target.value)}
                  placeholder="e.g. 2018"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold focus:outline-none text-black dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Annual Revenue / Retainer Range
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={revenueValuation}
                  onChange={(e) => setRevenueValuation(e.target.value)}
                  placeholder="e.g. ₹10M - ₹50M"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold focus:outline-none text-black dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Row 6: Company Website URL (with auto-suggest) | Statutory Registration / CIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Company Website URL (with auto-suggest)
              </label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-8 pr-20 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none font-mono"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  Suggesting
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block truncate">
                {getRegistrationLabel()}
              </label>
              <input
                type="text"
                required
                value={registrationCin}
                onChange={(e) => setRegistrationCin(e.target.value)}
                placeholder={getRegistrationPlaceholder()}
                className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold focus:outline-none font-mono text-black dark:text-white"
              />
            </div>
          </div>

          {/* Row 7: About the Company Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              About the Company Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A comprehensive description of your company, chamber, or advisory practice..."
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs focus:outline-none text-black dark:text-white"
            />
          </div>

          {/* Row 8: Why Join Us */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              Why Join Us
            </label>
            <textarea
              rows={3}
              value={whyJoinUs}
              onChange={(e) => setWhyJoinUs(e.target.value)}
              placeholder="Highlight your company culture, mission, benefits, and why great talent and clients should join you..."
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs focus:outline-none text-black dark:text-white"
            />
          </div>

          {/* Primary Action Button: Continue to Dashboard matching screenshot */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
            >
              <span>{isSubmitting ? "Setting up Workspace..." : "Continue to Dashboard"}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
