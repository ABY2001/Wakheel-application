"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  Scale,
  Building2,
  CreditCard,
  KeyRound,
  Users,
  Check,
  Save,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  FileText,
  Sparkles,
  ExternalLink,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Sliders,
} from "lucide-react";

export interface AdvocateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  mobileNumber: string;
  organisationName: string;
  roleDescription: string;
  barCouncilEnrollmentNumber: string;
  stateBarCouncil: string;
  enrollmentYear: string;
  barAssociationId: string;
  seniorityLevel: string;
  practiceCourts: string[];
  practiceAreas: string[];
  chamberAddress: string;
  officeAddress: string;
  clerkName: string;
  clerkPhone: string;
  videoConsultationFee: string;
  chamberConsultationFee: string;
  courtAppearanceFee: string;
  minimumRetainerEscrow: string;
  escrowBankName: string;
  escrowAccountNumber: string;
  escrowIfsc: string;
  dscProvider: string;
  dscSerialNo: string;
  dscExpiryDate: string;
  eFilingHighCourtId: string;
  eFilingSupremeCourtId: string;
  dscStatus: "active" | "expiring_soon" | "expired";
  availableForCitizenMatch: boolean;
  showFeesTransparently: boolean;
  emergencyBailCalls: boolean;
  bio: string;
  languages: string[];
}

export const DEFAULT_ADVOCATE_PROFILE: AdvocateProfileData = {
  firstName: "Meera",
  lastName: "Krishnan",
  email: "adv.meera.krishnan@keralabar.org",
  country: "India",
  mobileNumber: "+91 94471 28930",
  organisationName: "Krishnan & Partners Chambers",
  roleDescription: "Senior Litigation Counsel",
  barCouncilEnrollmentNumber: "K/001429/2012",
  stateBarCouncil: "Bar Council of Kerala",
  enrollmentYear: "2012",
  barAssociationId: "KHCAA/2012/5891",
  seniorityLevel: "14 Years Practice (Senior Counsel)",
  practiceCourts: [
    "High Court of Kerala at Ernakulam",
    "Supreme Court of India (Counsel)",
    "District & Sessions Court, Ernakulam",
    "National Company Law Tribunal (NCLT) Kochi Bench",
  ],
  practiceAreas: [
    "Constitutional Law & Writs (Art. 226)",
    "Criminal Defense & Trial Practice (BNSS, BNS)",
    "Commercial Arbitration & Dispute Resolution",
    "Real Estate, Land Acquisition & Revenue",
    "Corporate & Insolvency (IBC)",
  ],
  chamberAddress: "Chamber No. 412, High Court Lawyers Chamber Complex, Marine Drive, Kochi, Kerala - 682031",
  officeAddress: "TC 18/402, 'Sreepadam', Panampilly Nagar, Kochi, Kerala - 682036",
  clerkName: "K. R. Mohanan (Registered Advocate Clerk #409)",
  clerkPhone: "+91 98460 55123",
  videoConsultationFee: "2,500",
  chamberConsultationFee: "3,500",
  courtAppearanceFee: "25,000",
  minimumRetainerEscrow: "50,000",
  escrowBankName: "State Bank of India (High Court Branch)",
  escrowAccountNumber: "38920194821",
  escrowIfsc: "SBIN0008677",
  dscProvider: "eMudhra Class 3 (Combo Sign & Encrypt)",
  dscSerialNo: "EMU-2024-KL-918237",
  dscExpiryDate: "14-12-2026",
  eFilingHighCourtId: "KL-ADV-1429-HC",
  eFilingSupremeCourtId: "SC-ADV-9812-IN",
  dscStatus: "active",
  availableForCitizenMatch: true,
  showFeesTransparently: true,
  emergencyBailCalls: true,
  bio: "Senior practicing counsel at the High Court of Kerala specializing in Constitutional litigation, regulatory challenges against statutory authorities, commercial arbitration, and criminal appellate defense under the newly enacted Bharatiya Nagarik Suraksha Sanhita (BNSS).",
  languages: ["English", "Malayalam", "Hindi"],
};

const ALL_COURTS = [
  "High Court of Kerala at Ernakulam",
  "Supreme Court of India (Counsel)",
  "District & Sessions Court, Ernakulam",
  "National Company Law Tribunal (NCLT) Kochi Bench",
  "Debt Recovery Tribunal (DRT) Ernakulam",
  "Family Court & Motor Accidents Claims Tribunal (MACT)",
  "Central Administrative Tribunal (CAT) Ernakulam",
  "Kerala State Consumer Disputes Redressal Commission (KSCDRC)",
];

const ALL_DOMAINS = [
  "Constitutional Law & Writs (Art. 226)",
  "Criminal Defense & Trial Practice (BNSS, BNS)",
  "Commercial Arbitration & Dispute Resolution",
  "Real Estate, Land Acquisition & Revenue",
  "Corporate & Insolvency (IBC)",
  "Matrimonial & Family Law",
  "Banking & SARFAESI Enforcement",
  "Taxation & GST Litigation",
  "Cyber Law & IT Act Compliance",
];

interface AdvocateProfileModalProps {
  isOpen: boolean;
  onClose?: () => void;
  profile: AdvocateProfileData;
  onSave: (updatedProfile: AdvocateProfileData) => void;
  isInline?: boolean;
}

export default function AdvocateProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
  isInline = false,
}: AdvocateProfileModalProps) {
  const [formData, setFormData] = useState<AdvocateProfileData>(profile || DEFAULT_ADVOCATE_PROFILE);
  const [activeTab, setActiveTab] = useState<
    "credentials" | "courts" | "chamber" | "billing" | "dsc" | "discovery"
  >("credentials");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof AdvocateProfileData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleCourt = (court: string) => {
    setFormData((prev) => {
      const exists = prev.practiceCourts.includes(court);
      return {
        ...prev,
        practiceCourts: exists
          ? prev.practiceCourts.filter((c) => c !== court)
          : [...prev.practiceCourts, court],
      };
    });
  };

  const toggleDomain = (domain: string) => {
    setFormData((prev) => {
      const exists = prev.practiceAreas.includes(domain);
      return {
        ...prev,
        practiceAreas: exists
          ? prev.practiceAreas.filter((d) => d !== domain)
          : [...prev.practiceAreas, domain],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (!isInline && onClose) {
        onClose();
      }
    }, 1500);
  };

  const content = (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800/80 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/60 dark:to-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="flex items-start sm:items-center gap-4">
          {/* Avatar with Initials */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black text-xl flex items-center justify-center shadow-md">
              {formData.firstName?.[0] || "M"}
              {formData.lastName?.[0] || "K"}
            </div>
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center"
              title="Verified Bar Council Enrollment"
            >
              <Check className="w-3 h-3 text-white stroke-[3]" />
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
                Adv. {formData.firstName} {formData.lastName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>BCI Verified</span>
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex flex-wrap items-center gap-2 font-mono">
              <span>{formData.barCouncilEnrollmentNumber}</span>
              <span>•</span>
              <span>{formData.stateBarCouncil}</span>
              <span>•</span>
              <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{formData.seniorityLevel}</span>
            </p>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              {formData.organisationName} • {formData.chamberAddress.split(",")[0]}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Profile Saved &amp; Synced</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Chamber Profile</span>
              </>
            )}
          </button>

          {!isInline && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs Toolbar */}
      <div className="flex items-center gap-1.5 px-6 pt-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("credentials")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "credentials"
              ? "border-black dark:border-white text-black dark:text-white font-bold"
              : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Bar Credentials</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("courts")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "courts"
              ? "border-black dark:border-white text-black dark:text-white font-bold"
              : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Courts &amp; Domains</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("chamber")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "chamber"
              ? "border-black dark:border-white text-black dark:text-white font-bold"
              : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Chamber &amp; Staff</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "billing"
              ? "border-black dark:border-white text-black dark:text-white font-bold"
              : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Fee &amp; Trust Escrow</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dsc")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "dsc"
              ? "border-black dark:border-white text-black dark:text-white font-bold"
              : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>DSC &amp; E-Filing 3.0</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("discovery")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "discovery"
              ? "border-black dark:border-white text-black dark:text-white font-bold"
              : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Public Directory &amp; Match</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6 sm:p-8 overflow-y-auto max-h-[65vh]">
        {/* TAB 1: BAR COUNCIL & CREDENTIALS */}
        {activeTab === "credentials" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  Bar Council Enrollment Number (Roll No.)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.barCouncilEnrollmentNumber}
                    onChange={(e) => handleInputChange("barCouncilEnrollmentNumber", e.target.value)}
                    placeholder="e.g. K/001429/2012"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[10px] text-zinc-500">
                  Must match the certified State Bar Council roll for High Court e-filing verification.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  State Bar Council Jurisdiction
                </label>
                <select
                  value={formData.stateBarCouncil}
                  onChange={(e) => handleInputChange("stateBarCouncil", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                >
                  <option>Bar Council of Kerala</option>
                  <option>Bar Council of Delhi</option>
                  <option>Bar Council of Maharashtra &amp; Goa</option>
                  <option>Bar Council of Tamil Nadu &amp; Puducherry</option>
                  <option>Bar Council of Karnataka</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  Year of Enrollment &amp; Seniority
                </label>
                <input
                  type="text"
                  value={formData.seniorityLevel}
                  onChange={(e) => handleInputChange("seniorityLevel", e.target.value)}
                  placeholder="e.g. 14 Years Practice (Senior Counsel)"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  High Court Bar Association Membership ID
                </label>
                <input
                  type="text"
                  value={formData.barAssociationId}
                  onChange={(e) => handleInputChange("barAssociationId", e.target.value)}
                  placeholder="e.g. KHCAA/2012/5891"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Professional Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black dark:text-white">
                Chamber Bio &amp; Professional Statement
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="State your litigation experience, chamber background, and judicial expertise..."
                className="w-full p-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none leading-relaxed"
              />
            </div>

            {/* BCI Regulatory Compliance Box */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-black dark:text-white block">
                  BCI Certificate of Practice (COP) Status: Active
                </span>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Advocate credentials are cross-referenced with Bar Council of Kerala Roll K/001429/2012. All Vakalatnamas stamped digitally with ₹25 Advocate Welfare Fund and ₹2 Clerks Welfare stamps conform to statutory mandates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COURTS & SPECIALIZATIONS */}
        {activeTab === "courts" && (
          <div className="space-y-6">
            {/* Practice Courts */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-black dark:text-white">
                  Active Practice Courts &amp; Judicial Benches
                </label>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {formData.practiceCourts.length} selected
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Select forums where your chamber regularly files appearances, petitions, and caveats.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {ALL_COURTS.map((court) => {
                  const isSelected = formData.practiceCourts.includes(court);
                  return (
                    <button
                      key={court}
                      type="button"
                      onClick={() => toggleCourt(court)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{court}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specialization Domains */}
            <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-black dark:text-white">
                  Core Specialization Domains &amp; Practice Areas
                </label>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {formData.practiceAreas.length} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {ALL_DOMAINS.map((domain) => {
                  const isSelected = formData.practiceAreas.includes(domain);
                  return (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => toggleDomain(domain)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#6B1728] text-white font-semibold shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{domain}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CHAMBER & OFFICE STAFF */}
        {activeTab === "chamber" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  Chamber Address (Court Complex)
                </label>
                <textarea
                  rows={2}
                  value={formData.chamberAddress}
                  onChange={(e) => handleInputChange("chamberAddress", e.target.value)}
                  placeholder="e.g. Chamber No. 412, High Court Lawyers Chamber Complex..."
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  Chamber / Office Branch Address
                </label>
                <textarea
                  rows={2}
                  value={formData.officeAddress}
                  onChange={(e) => handleInputChange("officeAddress", e.target.value)}
                  placeholder="e.g. TC 18/402, Panampilly Nagar, Kochi..."
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  Registered Advocate Clerk Name
                </label>
                <input
                  type="text"
                  value={formData.clerkName}
                  onChange={(e) => handleInputChange("clerkName", e.target.value)}
                  placeholder="e.g. K. R. Mohanan (Registered Clerk #409)"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
                <span className="text-[10px] text-zinc-500">
                  Authorized for physical registry scrutiny defect clearing and causelist collection.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  Clerk Direct Phone
                </label>
                <input
                  type="text"
                  value={formData.clerkPhone}
                  onChange={(e) => handleInputChange("clerkPhone", e.target.value)}
                  placeholder="+91 98460 55123"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  Official Chamber Phone / WhatsApp Hotline
                </label>
                <input
                  type="text"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                  placeholder="+91 94471 28930"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  Official Legal Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="adv.meera.krishnan@keralabar.org"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FEE & TRUST ESCROW */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <span className="text-[11px] font-bold text-zinc-500 uppercase">
                  30-Min Video Consultation
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-zinc-500">₹</span>
                  <input
                    type="text"
                    value={formData.videoConsultationFee}
                    onChange={(e) => handleInputChange("videoConsultationFee", e.target.value)}
                    className="w-full font-mono font-bold text-base bg-transparent text-black dark:text-white focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-zinc-400">Pre-booked via Citizen Match</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <span className="text-[11px] font-bold text-zinc-500 uppercase">
                  In-Chamber Conference
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-zinc-500">₹</span>
                  <input
                    type="text"
                    value={formData.chamberConsultationFee}
                    onChange={(e) => handleInputChange("chamberConsultationFee", e.target.value)}
                    className="w-full font-mono font-bold text-base bg-transparent text-black dark:text-white focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-zinc-400">Per 45-minute chamber session</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <span className="text-[11px] font-bold text-zinc-500 uppercase">
                  High Court Hearing Appearance
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-zinc-500">₹</span>
                  <input
                    type="text"
                    value={formData.courtAppearanceFee}
                    onChange={(e) => handleInputChange("courtAppearanceFee", e.target.value)}
                    className="w-full font-mono font-bold text-base bg-transparent text-black dark:text-white focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-zinc-400">Standard motion / final hearing</span>
              </div>
            </div>

            {/* BCI Rule 24 Compliant Trust Escrow Account */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-black dark:text-white">
                    BCI Rule 24 Dedicated Client Trust Escrow Account
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                  Audited &amp; Segregated
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-500">Designated Bank</label>
                  <input
                    type="text"
                    value={formData.escrowBankName}
                    onChange={(e) => handleInputChange("escrowBankName", e.target.value)}
                    className="w-full p-2 text-xs rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-500">Escrow Account Number</label>
                  <input
                    type="text"
                    value={formData.escrowAccountNumber}
                    onChange={(e) => handleInputChange("escrowAccountNumber", e.target.value)}
                    className="w-full p-2 text-xs font-mono rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-500">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.escrowIfsc}
                    onChange={(e) => handleInputChange("escrowIfsc", e.target.value)}
                    className="w-full p-2 text-xs font-mono rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DIGITAL SIGNATURE & E-FILING 3.0 */}
        {activeTab === "dsc" && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-black dark:text-white block">
                    Class-3 Cryptographic Hardware Token (USB)
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {formData.dscProvider} • Serial: {formData.dscSerialNo}
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Token Active</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  High Court e-Filing 3.0 Portal Username
                </label>
                <input
                  type="text"
                  value={formData.eFilingHighCourtId}
                  onChange={(e) => handleInputChange("eFilingHighCourtId", e.target.value)}
                  placeholder="e.g. KL-ADV-1429-HC"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  Supreme Court of India e-Filing User ID
                </label>
                <input
                  type="text"
                  value={formData.eFilingSupremeCourtId}
                  onChange={(e) => handleInputChange("eFilingSupremeCourtId", e.target.value)}
                  placeholder="e.g. SC-ADV-9812-IN"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  DSC Certificate Expiry Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.dscExpiryDate}
                    onChange={(e) => handleInputChange("dscExpiryDate", e.target.value)}
                    placeholder="14-12-2026"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
                  <Calendar className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  Aadhaar eSign / Mobile OTP Provider
                </label>
                <input
                  type="text"
                  value="CDAC e-Hastakshar / NSDL eSign Enabled"
                  readOnly
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-zinc-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PUBLIC DIRECTORY & CITIZEN MATCH */}
        {activeTab === "discovery" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-xs text-black dark:text-white block">
                    Available for Citizen Match &amp; Direct Briefs
                  </span>
                  <span className="text-xs text-zinc-500">
                    Allows verified citizens in Kerala seeking legal assistance in your practice areas to book consultation slots.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.availableForCitizenMatch}
                  onChange={(e) => handleInputChange("availableForCitizenMatch", e.target.checked)}
                  className="w-5 h-5 rounded text-black dark:text-white focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-xs text-black dark:text-white block">
                    Display Consultation Fees Transparently
                  </span>
                  <span className="text-xs text-zinc-500">
                    Shows ₹{formData.videoConsultationFee} / ₹{formData.chamberConsultationFee} to citizens prior to consultation checkout.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showFeesTransparently}
                  onChange={(e) => handleInputChange("showFeesTransparently", e.target.checked)}
                  className="w-5 h-5 rounded text-black dark:text-white focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-xs text-black dark:text-white block">
                    Emergency Police Station &amp; Bail Call Forwarding
                  </span>
                  <span className="text-xs text-zinc-500">
                    Receive urgent night calls / WhatsApp alerts when existing clients trigger their Emergency Bail SOS.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.emergencyBailCalls}
                  onChange={(e) => handleInputChange("emergencyBailCalls", e.target.checked)}
                  className="w-5 h-5 rounded text-black dark:text-white focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            {/* BCI Rule 36 Disclaimer */}
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed italic p-2 border-t border-zinc-100 dark:border-zinc-800">
              * Note: Conforms to Rule 36 of Bar Council of India Standards of Professional Conduct. The information furnished herein is for bonafide client onboarding and conflict clearance purposes only and does not constitute advertisement or solicitation of professional work.
            </p>
          </div>
        )}
      </div>

      {/* Footer Save Bar */}
      <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-3 shrink-0">
        <span className="text-xs text-zinc-500 font-mono">
          Last updated: Today • Certified by {formData.barCouncilEnrollmentNumber}
        </span>
        <div className="flex items-center gap-2">
          {!isInline && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (isInline) {
    return <div className="w-full max-w-5xl mx-auto">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-200">
        {content}
      </div>
    </div>
  );
}
