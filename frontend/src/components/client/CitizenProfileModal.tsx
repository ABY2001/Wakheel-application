"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  AlertTriangle,
  Lock,
  FileText,
  CheckCircle2,
  Bell,
  Globe,
  Save,
  Check,
  RefreshCw,
  ExternalLink,
  Smartphone,
  HeartHandshake,
  Scale,
  Info,
} from "lucide-react";

export interface CitizenProfileData {
  username?: string;
  fullName: string;
  fatherOrSpouseName: string;
  age: string;
  dob: string;
  occupation: string;
  residentialAddress: string;
  district: string;
  state: string;
  pincode: string;
  mobileNumber: string;
  email: string;
  panNumber: string;
  aadhaarMasked: string;
  isDigiLockerVerified: boolean;
  digiLockerVerifiedDate: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  secondaryEmergencyName: string;
  secondaryEmergencyPhone: string;
  enableEmergencySosAlerts: boolean;
  retainedAdvocateName: string;
  retainedAdvocatePhone: string;
  preferredLanguage: "en" | "ml" | "hi";
  notificationChannel: "all" | "email_only";
  primaryCourtJurisdiction: string;
}

export const DEFAULT_CITIZEN_PROFILE: CitizenProfileData = {
  username: "",
  fullName: "",
  fatherOrSpouseName: "",
  age: "",
  dob: "",
  occupation: "",
  residentialAddress: "",
  district: "Ernakulam",
  state: "Kerala",
  pincode: "",
  mobileNumber: "",
  email: "",
  panNumber: "",
  aadhaarMasked: "",
  isDigiLockerVerified: false,
  digiLockerVerifiedDate: "",
  emergencyContactName: "",
  emergencyContactRelation: "",
  emergencyContactPhone: "",
  secondaryEmergencyName: "",
  secondaryEmergencyPhone: "",
  enableEmergencySosAlerts: false,
  retainedAdvocateName: "",
  retainedAdvocatePhone: "",
  preferredLanguage: "en",
  notificationChannel: "all",
  primaryCourtJurisdiction: "Kerala (High Court of Kerala)",
};

export const COMPULSORY_PROFILE_FIELDS = [
  {
    key: "fullName",
    label: "Full Legal Name",
    reason: "Mandatory under High Court e-filing rules for Vakalatnama execution, verified affidavits, and official memo of parties.",
    check: (d: CitizenProfileData) => Boolean(d.fullName && d.fullName.trim().length >= 2),
  },
  {
    key: "fatherOrSpouseName",
    label: "Father / Spouse Name",
    reason: "Statutory requirement under CPC Order VI Rule 14 & CrPC for party parentage identification in judicial pleadings.",
    check: (d: CitizenProfileData) => Boolean(d.fatherOrSpouseName && d.fatherOrSpouseName.trim().length >= 2),
  },
  {
    key: "mobileNumber",
    label: "Verified Mobile Number",
    reason: "Required for e-Courts automated hearing alerts, digital summons notifications, and advocate consultation dispatch.",
    check: (d: CitizenProfileData) => {
      const clean = (d.mobileNumber || "").replace(/\D/g, "");
      return clean.length >= 10;
    },
  },
  {
    key: "primaryCourtJurisdiction",
    label: "Primary Court Jurisdiction",
    reason: "Routes your petitions to the competent forum and matches your matter with enrolled Bar Council advocates in that jurisdiction.",
    check: (d: CitizenProfileData) => Boolean(d.primaryCourtJurisdiction && d.primaryCourtJurisdiction.trim().length >= 2),
  },
  {
    key: "residentialAddress",
    label: "Permanent Residential Address",
    reason: "Essential for establishing territorial cause of action, memo of parties service, and court bail verification.",
    check: (d: CitizenProfileData) => Boolean(d.residentialAddress && d.residentialAddress.trim().length >= 5),
  },
  {
    key: "district",
    label: "District & City",
    reason: "Determines District & Sessions Court territorial jurisdiction and local Bar Association advocate assignment.",
    check: (d: CitizenProfileData) => Boolean(d.district && d.district.trim().length >= 2),
  },
  {
    key: "state",
    label: "State / UT",
    reason: "Determines state High Court jurisdiction and applicability of state court fees and local procedural rules.",
    check: (d: CitizenProfileData) => Boolean(d.state && d.state.trim().length >= 2),
  },
  {
    key: "pincode",
    label: "Postal PIN Code",
    reason: "Mandatory for postal and electronic summons delivery under Order V Rule 9 CPC and registry jurisdiction mapping.",
    check: (d: CitizenProfileData) => /^\d{6}$/.test((d.pincode || "").trim()),
  },
] as const;

interface CitizenProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CitizenProfileData;
  onSave: (updatedProfile: CitizenProfileData) => void;
}

export default function CitizenProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: CitizenProfileModalProps) {
  const [formData, setFormData] = useState<CitizenProfileData>(profile || DEFAULT_CITIZEN_PROFILE);
  const [activeTab, setActiveTab] = useState<
    "identity" | "digilocker" | "emergency" | "retainers" | "privacy"
  >("identity");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [refreshingKyc, setRefreshingKyc] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationBanner, setValidationBanner] = useState<string>("");

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        ...profile,
      }));
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof CitizenProfileData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleRefreshKyc = () => {
    setRefreshingKyc(true);
    setTimeout(() => {
      setRefreshingKyc(false);
      handleInputChange("isDigiLockerVerified", true);
      handleInputChange("digiLockerVerifiedDate", "Today (30-Oct-2026)");
    }, 600);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full Legal Name is mandatory for Vakalatnama filing, affidavits, and cause lists.";
    }
    if (!formData.fatherOrSpouseName || formData.fatherOrSpouseName.trim().length < 2) {
      newErrors.fatherOrSpouseName = "Father / Spouse Name is required under CPC Order VI Rule 14 for memo of parties.";
    }
    const cleanMobile = (formData.mobileNumber || "").replace(/\D/g, "");
    if (!cleanMobile || cleanMobile.length < 10) {
      newErrors.mobileNumber = "Valid 10-digit mobile number is required for court SMS alerts and counsel consultation.";
    }
    if (!formData.primaryCourtJurisdiction || formData.primaryCourtJurisdiction.trim().length < 2) {
      newErrors.primaryCourtJurisdiction = "Primary Court Jurisdiction is required to route petitions and match advocates.";
    }
    if (!formData.residentialAddress || formData.residentialAddress.trim().length < 5) {
      newErrors.residentialAddress = "Permanent Residential Address is required for territorial jurisdiction and summons service.";
    }
    if (!formData.district || formData.district.trim().length < 2) {
      newErrors.district = "District & City is required for local court and advocate matching.";
    }
    if (!formData.state || formData.state.trim().length < 2) {
      newErrors.state = "State / UT is required to determine High Court jurisdiction and applicable rules.";
    }
    const cleanPincode = (formData.pincode || "").replace(/\D/g, "");
    if (!cleanPincode || cleanPincode.length !== 6) {
      newErrors.pincode = "Valid 6-digit postal PIN code is required for registry summons dispatch.";
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setValidationBanner(
        `Please complete all ${Object.keys(validationErrors).length} compulsory fields marked with * before saving. These details are legally required for court case intake, Vakalatnama filing, and advocate assignment.`
      );
      setActiveTab("identity");
      return;
    }

    setErrors({});
    setValidationBanner("");
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const completedRequiredCount = COMPULSORY_PROFILE_FIELDS.filter((f) => f.check(formData)).length;
  const totalRequiredCount = COMPULSORY_PROFILE_FIELDS.length;
  const completionPercentage = Math.round((completedRequiredCount / totalRequiredCount) * 100);
  const isProfileComplete = completedRequiredCount === totalRequiredCount;

  const initials = formData.fullName
    ? formData.fullName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : formData.username
    ? formData.username.substring(0, 2).toUpperCase()
    : "CU";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Card */}
        <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800/80 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/60 dark:to-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
          <div className="flex items-start sm:items-center gap-4">
            {/* Citizen Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black text-xl flex items-center justify-center shadow-md">
                {initials}
              </div>
              {formData.isDigiLockerVerified && (
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center"
                  title="DigiLocker Aadhaar e-KYC Verified"
                >
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
                  {formData.fullName || (formData.username ? `@${formData.username}` : "Complete Citizen Profile")}
                </h2>
                {formData.username && formData.fullName && (
                  <span className="font-mono text-xs text-zinc-500 font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                    @{formData.username}
                  </span>
                )}
                {formData.isDigiLockerVerified ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>DigiLocker KYC Verified</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1">
                    <span>KYC Pending</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex flex-wrap items-center gap-2 font-mono">
                {formData.district && <span>{formData.district}, {formData.state}</span>}
                {formData.aadhaarMasked && (
                  <>
                    <span>•</span>
                    <span>Aadhaar: {formData.aadhaarMasked}</span>
                  </>
                )}
                {formData.occupation && (
                  <>
                    <span>•</span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{formData.occupation}</span>
                  </>
                )}
              </p>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                {formData.retainedAdvocateName ? `Retained Counsel: ${formData.retainedAdvocateName}` : "Citizen Legal Services Account"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Profile Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Completeness & Case Intake Readiness Bar */}
        <div className="px-6 sm:px-8 py-3.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-zinc-500" />
              <span>Court Case Intake &amp; Counsel Readiness:</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                isProfileComplete
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
              }`}
            >
              {isProfileComplete ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>100% Ready for Court Filing</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{completedRequiredCount} of {totalRequiredCount} Compulsory Fields Complete ({completionPercentage}%)</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-full sm:w-44 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isProfileComplete ? "bg-emerald-500" : "bg-amber-500"
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="font-mono text-[11px] font-bold text-zinc-500 min-w-[32px] text-right">
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-1.5 px-6 pt-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("identity")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "identity"
                ? "border-black dark:border-white text-black dark:text-white font-bold"
                : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Personal &amp; Court Intake</span>
            {Object.keys(errors).length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500 text-white leading-tight">
                {Object.keys(errors).length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("digilocker")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "digilocker"
                ? "border-black dark:border-white text-black dark:text-white font-bold"
                : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DigiLocker Aadhaar KYC</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("emergency")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "emergency"
                ? "border-black dark:border-white text-black dark:text-white font-bold"
                : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Bail &amp; Arrest Emergency Contacts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("retainers")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "retainers"
                ? "border-black dark:border-white text-black dark:text-white font-bold"
                : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Legal Representation &amp; Counsel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "privacy"
                ? "border-black dark:border-white text-black dark:text-white font-bold"
                : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Preferences &amp; Security</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[65vh]">
          {/* TAB 1: PERSONAL & COURT INTAKE */}
          {activeTab === "identity" && (
            <div className="space-y-6">
              {/* Validation Alert Banner */}
              {validationBanner && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-red-900 dark:text-red-200">
                      Compulsory Court Intake Details Missing
                    </h4>
                    <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                      {validationBanner}
                    </p>
                  </div>
                </div>
              )}

              {/* Informational Guidance Box */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
                <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Fields marked with <span className="text-red-500 font-bold">*</span> and <span className="font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 px-1 py-0.2 rounded text-[10px]">Required</span> are legally compulsory under High Court e-filing rules and CPC Order VI/V to generate court petitions, memo of parties, Vakalatnama representation, and match specialized Bar Council advocates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Legal Name (Compulsory) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>Full Legal Name</span>
                      <span className="text-red-500 font-bold">*</span>
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 px-1.5 py-0.5 rounded ml-1">
                        Required
                      </span>
                    </span>
                    <span className="text-[10px] font-normal text-zinc-500">As per Aadhaar / Official ID</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border ${
                      errors.fullName
                        ? "border-red-500 dark:border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-1 focus:ring-red-500"
                        : "border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    }`}
                  />
                  {errors.fullName ? (
                    <div className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.fullName}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-500 block">
                      Why required: Mandatory under High Court e-filing rules for Vakalatnama filing, verified affidavits, and cause list party listings.
                    </span>
                  )}
                </div>

                {/* Father / Spouse Name (Compulsory) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>Father / Spouse Name</span>
                      <span className="text-red-500 font-bold">*</span>
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 px-1.5 py-0.5 rounded ml-1">
                        Required
                      </span>
                    </span>
                    <span className="text-[10px] font-normal text-zinc-500">Parentage for Court Memo</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fatherOrSpouseName}
                    onChange={(e) => handleInputChange("fatherOrSpouseName", e.target.value)}
                    placeholder="e.g. S. Gopakumar Nambiar"
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border ${
                      errors.fatherOrSpouseName
                        ? "border-red-500 dark:border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-1 focus:ring-red-500"
                        : "border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    }`}
                  />
                  {errors.fatherOrSpouseName ? (
                    <div className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.fatherOrSpouseName}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-500 block">
                      Why required: Statutory requirement under CPC Order VI Rule 14 &amp; CrPC for memo of parties in civil and criminal petitions.
                    </span>
                  )}
                </div>

                {/* Verified Mobile (Compulsory) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>Verified Mobile Number</span>
                      <span className="text-red-500 font-bold">*</span>
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 px-1.5 py-0.5 rounded ml-1">
                        Required
                      </span>
                    </span>
                    <span className="text-[10px] font-normal text-zinc-500">10-Digit Mobile</span>
                  </label>
                  <input
                    type="text"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                    placeholder="e.g. 9847122334"
                    className={`w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border ${
                      errors.mobileNumber
                        ? "border-red-500 dark:border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-1 focus:ring-red-500"
                        : "border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    }`}
                  />
                  {errors.mobileNumber ? (
                    <div className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.mobileNumber}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-500 block">
                      Why required: Required for automated court hearing alerts, e-filing OTPs, digital summons service, and counsel consultations.
                    </span>
                  )}
                </div>

                {/* Primary Court Jurisdiction (Compulsory) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>Primary Court Jurisdiction</span>
                      <span className="text-red-500 font-bold">*</span>
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 px-1.5 py-0.5 rounded ml-1">
                        Required
                      </span>
                    </span>
                    <span className="text-[10px] font-normal text-zinc-500">Judicial Forum</span>
                  </label>
                  <select
                    value={formData.primaryCourtJurisdiction}
                    onChange={(e) => handleInputChange("primaryCourtJurisdiction", e.target.value)}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border ${
                      errors.primaryCourtJurisdiction
                        ? "border-red-500 dark:border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-1 focus:ring-red-500"
                        : "border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    }`}
                  >
                    <option value="Kerala (High Court of Kerala)">Kerala (High Court of Kerala)</option>
                    <option value="Delhi (Delhi High Court)">Delhi (Delhi High Court)</option>
                    <option value="Maharashtra (Bombay High Court)">Maharashtra (Bombay High Court)</option>
                    <option value="Karnataka (Karnataka High Court)">Karnataka (Karnataka High Court)</option>
                    <option value="Tamil Nadu (Madras High Court)">Tamil Nadu (Madras High Court)</option>
                  </select>
                  {errors.primaryCourtJurisdiction ? (
                    <div className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.primaryCourtJurisdiction}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-500 block">
                      Why required: Routes petitions to the competent forum and matches your matter with enrolled Bar Council advocates in that court.
                    </span>
                  )}
                </div>

                {/* Permanent Residential Address (Compulsory) */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-black dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>Permanent Residential Address</span>
                      <span className="text-red-500 font-bold">*</span>
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 px-1.5 py-0.5 rounded ml-1">
                        Required
                      </span>
                    </span>
                    <span className="text-[10px] font-normal text-zinc-500">For Court Summons &amp; Service</span>
                  </label>
                  <input
                    type="text"
                    value={formData.residentialAddress}
                    onChange={(e) => handleInputChange("residentialAddress", e.target.value)}
                    placeholder="House/Door No., Building, Street Name, Locality..."
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border ${
                      errors.residentialAddress
                        ? "border-red-500 dark:border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-1 focus:ring-red-500"
                        : "border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    }`}
                  />
                  {errors.residentialAddress ? (
                    <div className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.residentialAddress}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-500 block">
                      Why required: Mandatory under Order VI Rule 14A CPC to establish territorial jurisdiction, bail verification, and service of summons.
                    </span>
                  )}
                </div>

                {/* District & City (Compulsory) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>District &amp; City</span>
                      <span className="text-red-500 font-bold">*</span>
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 px-1.5 py-0.5 rounded ml-1">
                        Required
                      </span>
                    </span>
                    <span className="text-[10px] font-normal text-zinc-500">District Forum</span>
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                    placeholder="e.g. Ernakulam"
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border ${
                      errors.district
                        ? "border-red-500 dark:border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-1 focus:ring-red-500"
                        : "border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    }`}
                  />
                  {errors.district ? (
                    <div className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.district}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-500 block">
                      Why required: Determines District Court territorial competence and local Bar Association advocate assignment.
                    </span>
                  )}
                </div>

                {/* State / UT & Postal Pincode (Compulsory) */}
                <div className="space-y-1.5">
                  <div className="grid grid-cols-2 gap-2">
                    {/* State */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-black dark:text-white flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <span>State / UT</span>
                          <span className="text-red-500 font-bold">*</span>
                        </span>
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 px-1 py-0.2 rounded">
                          Required
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="e.g. Kerala"
                        className={`w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border ${
                          errors.state
                            ? "border-red-500 dark:border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-1 focus:ring-red-500"
                            : "border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                        }`}
                      />
                    </div>

                    {/* Postal PIN Code */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-black dark:text-white flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <span>PIN Code</span>
                          <span className="text-red-500 font-bold">*</span>
                        </span>
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 px-1 py-0.2 rounded">
                          Required
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="682036"
                        maxLength={6}
                        className={`w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border ${
                          errors.pincode
                            ? "border-red-500 dark:border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-1 focus:ring-red-500"
                            : "border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                        }`}
                      />
                    </div>
                  </div>
                  {errors.state || errors.pincode ? (
                    <div className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.state || errors.pincode}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-500 block">
                      Why required: Determines High Court territorial jurisdiction and postal summons delivery under Order V Rule 9 CPC.
                    </span>
                  )}
                </div>

                {/* Additional Non-Compulsory Information Separator */}
                <div className="md:col-span-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      Additional Profile &amp; KYC Information (Optional)
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Helpful for expedited verification &amp; commercial cases
                    </span>
                  </div>
                </div>

                {/* Username / Handle (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>Username / Handle</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Optional</span>
                    </span>
                    <span className="text-[10px] font-normal text-zinc-500">Portal ID</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">@</span>
                    <input
                      type="text"
                      value={formData.username || ""}
                      onChange={(e) => handleInputChange("username", e.target.value.replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase())}
                      placeholder="e.g. rahul_sharma"
                      className="w-full pl-8 pr-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    Unique handle for portal sign-in, case updates, and lawyer consultations.
                  </span>
                </div>

                {/* Age & Date of Birth (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>Age &amp; Date of Birth</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Optional</span>
                    </span>
                    <span className="text-[10px] font-normal text-zinc-500">Senior Citizen / Minor Benefit</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      placeholder="Age (e.g. 48)"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={formData.dob}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                      placeholder="DD-MM-YYYY"
                      className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    Used for court priority listing (Senior Citizen Act) and legal capacity verification.
                  </span>
                </div>

                {/* Occupation / Profession (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>Occupation / Profession</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Optional</span>
                    </span>
                    <span className="text-[10px] font-normal text-zinc-500">Matter Context</span>
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange("occupation", e.target.value)}
                    placeholder="e.g. Industrialist &amp; Exporter"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500">
                    Assists matching advocates with sector-specific expertise (e.g. commercial, labor).
                  </span>
                </div>

                {/* Permanent Account Number (PAN) (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>Permanent Account Number (PAN)</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Optional</span>
                    </span>
                    <span className="text-[10px] font-normal text-zinc-500">Commercial / Tax</span>
                  </label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => handleInputChange("panNumber", e.target.value.toUpperCase())}
                    placeholder="e.g. ABCDE1234F"
                    className="w-full px-3.5 py-2 text-xs font-mono uppercase rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500">
                    Required for commercial matters, e-court fee refund deposits, and GST invoicing.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIGILOCKER & AADHAAR KYC */}
          {activeTab === "digilocker" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-black dark:text-white">
                        Government DigiLocker e-KYC
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                        VERIFIED
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono block mt-0.5">
                      Linked Aadhaar: {formData.aadhaarMasked} • Certified on {formData.digiLockerVerifiedDate}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRefreshKyc}
                  disabled={refreshingKyc}
                  className="px-4 py-2 rounded-full border border-emerald-600/40 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshingKyc ? "animate-spin" : ""}`} />
                  <span>{refreshingKyc ? "Re-verifying..." : "Refresh DigiLocker"}</span>
                </button>
              </div>

              {/* Court E-Signing Readiness Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase">
                    Vakalatnama E-Sign
                  </span>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enabled</span>
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    Aadhaar OTP electronic signatures valid under Section 5 of IT Act, 2000.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase">
                    Certified True Copies
                  </span>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Auto-Linked</span>
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    Direct sync with Kerala e-District, Land Revenue, &amp; SRO deeds.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase">
                    Court Summons Service
                  </span>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Digital Service Ready</span>
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    Complies with Order V Rule 9(3) CPC electronic summons service.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMERGENCY LEGAL CONTACTS (BAIL / ARREST SOS) */}
          {activeTab === "emergency" && (
            <div className="space-y-6">
              {/* Statutory Notice */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-black dark:text-white block">
                    Statutory Right under Section 35(8) BNSS / S.41D CrPC (D.K. Basu Guidelines)
                  </span>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Under Supreme Court constitutional safeguards, every citizen has the absolute right to have their designated family member and advocate informed immediately upon detention or arrest by police authorities.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white">
                    Primary Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                    placeholder="e.g. Devika G. Nambiar"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white">
                    Relationship
                  </label>
                  <select
                    value={formData.emergencyContactRelation}
                    onChange={(e) => handleInputChange("emergencyContactRelation", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  >
                    <option>Spouse</option>
                    <option>Parent</option>
                    <option>Sibling</option>
                    <option>Son / Daughter</option>
                    <option>Trusted Friend / Legal Guardian</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white">
                    Emergency Contact Phone (WhatsApp Priority)
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                    placeholder="+91 98471 99881"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white">
                    Secondary Backup Contact &amp; Phone
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.secondaryEmergencyName}
                      onChange={(e) => handleInputChange("secondaryEmergencyName", e.target.value)}
                      placeholder="Arun G. Nambiar"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={formData.secondaryEmergencyPhone}
                      onChange={(e) => handleInputChange("secondaryEmergencyPhone", e.target.value)}
                      placeholder="+91 94470 33412"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Automatic SOS Toggle */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-xs text-black dark:text-white block">
                    Automatic Police Station SOS Alert Dispatch
                  </span>
                  <span className="text-xs text-zinc-500">
                    When you tap &quot;Police Station SOS&quot; on the citizen portal, sends immediate SMS &amp; WhatsApp alerts with real-time GPS location to your nominated contacts and retained advocate.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableEmergencySosAlerts}
                  onChange={(e) => handleInputChange("enableEmergencySosAlerts", e.target.checked)}
                  className="w-5 h-5 rounded text-black dark:text-white focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 4: LEGAL REPRESENTATION & RETAINERS */}
          {activeTab === "retainers" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-zinc-400">
                    PRIMARY RETAINED COUNSEL
                  </span>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    {formData.retainedAdvocateName}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    High Court of Kerala • Bar Roll: K/001429/2012
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    Direct Chamber Hotline: {formData.retainedAdvocatePhone}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#6B1728] text-white">
                  Active Retainer
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  Active Briefs &amp; Petitions Under Representation
                </label>
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-black dark:text-white block">
                      W.P.(C) No. 19482 of 2024
                    </span>
                    <span className="text-zinc-500 font-mono">
                      Gopakumar Nambiar v. Kerala State Electricity Board Ltd. &amp; Others
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                    Interim Stay Granted
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PREFERENCES & SECURITY */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white">
                    Notification Channel
                  </label>
                  <select
                    value={formData.notificationChannel}
                    onChange={(e) => handleInputChange("notificationChannel", e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  >
                    <option value="all">WhatsApp + SMS + In-App (Recommended)</option>
                    <option value="email_only">Email &amp; In-App Only</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>Primary Court Jurisdiction</span>
                      <span className="text-red-500 font-bold">*</span>
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 px-1.5 py-0.5 rounded ml-1">
                        Required
                      </span>
                    </span>
                    <span className="text-[10px] font-normal text-zinc-500">Judicial Forum</span>
                  </label>
                  <select
                    value={formData.primaryCourtJurisdiction}
                    onChange={(e) => handleInputChange("primaryCourtJurisdiction", e.target.value)}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border ${
                      errors.primaryCourtJurisdiction
                        ? "border-red-500 dark:border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-1 focus:ring-red-500"
                        : "border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                    }`}
                  >
                    <option value="Kerala (High Court of Kerala)">Kerala (High Court of Kerala)</option>
                    <option value="Delhi (Delhi High Court)">Delhi (Delhi High Court)</option>
                    <option value="Maharashtra (Bombay High Court)">Maharashtra (Bombay High Court)</option>
                    <option value="Karnataka (Karnataka High Court)">Karnataka (Karnataka High Court)</option>
                    <option value="Tamil Nadu (Madras High Court)">Tamil Nadu (Madras High Court)</option>
                  </select>
                  {errors.primaryCourtJurisdiction ? (
                    <div className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.primaryCourtJurisdiction}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-500 block">
                      Routes petitions and advocate matching to this specific High Court forum.
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white">
                    Preferred Communication Language
                  </label>
                  <select
                    value={formData.preferredLanguage}
                    onChange={(e) => handleInputChange("preferredLanguage", e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  >
                    <option value="en">English (Default)</option>
                    <option value="ml">മലയാളം (Malayalam)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white">
                    Data Encryption Standard
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="AES-256 Client-Side End-to-End Encrypted"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-zinc-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-zinc-500 font-mono">
            Identity verified via DigiLocker UIDAI Gateway
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
            >
              Cancel
            </button>
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
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
