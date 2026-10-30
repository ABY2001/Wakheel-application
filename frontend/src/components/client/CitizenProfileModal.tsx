"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export interface CitizenProfileData {
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
  fullName: "Gopakumar Nambiar",
  fatherOrSpouseName: "Late K. Raghavan Nambiar",
  age: "48",
  dob: "12-05-1976",
  occupation: "Industrialist & Exporter",
  residentialAddress: "TC 14/1922, 'Sreevalsam', Panampilly Nagar",
  district: "Ernakulam (Kochi)",
  state: "Kerala",
  pincode: "682036",
  mobileNumber: "+91 98470 12345",
  email: "gopakumar.nambiar@gmail.com",
  panNumber: "ABCDE1234F",
  aadhaarMasked: "XXXX-XXXX-4812",
  isDigiLockerVerified: true,
  digiLockerVerifiedDate: "18-Jan-2024",
  emergencyContactName: "Devika G. Nambiar",
  emergencyContactRelation: "Spouse",
  emergencyContactPhone: "+91 98471 99881",
  secondaryEmergencyName: "Arun G. Nambiar",
  secondaryEmergencyPhone: "+91 94470 33412",
  enableEmergencySosAlerts: true,
  retainedAdvocateName: "Adv. Meera Krishnan",
  retainedAdvocatePhone: "+91 94471 28930",
  preferredLanguage: "en",
  notificationChannel: "all",
  primaryCourtJurisdiction: "Kerala (High Court of Kerala)",
};

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

  if (!isOpen) return null;

  const handleInputChange = (field: keyof CitizenProfileData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRefreshKyc = () => {
    setRefreshingKyc(true);
    setTimeout(() => {
      setRefreshingKyc(false);
      handleInputChange("isDigiLockerVerified", true);
      handleInputChange("digiLockerVerifiedDate", "Today (30-Oct-2026)");
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const initials = formData.fullName
    ? formData.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "GN";

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
                  {formData.fullName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>DigiLocker KYC Verified</span>
                </span>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex flex-wrap items-center gap-2 font-mono">
                <span>{formData.district}, {formData.state}</span>
                <span>•</span>
                <span>Aadhaar: {formData.aadhaarMasked}</span>
                <span>•</span>
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{formData.occupation}</span>
              </p>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Active Matter: WP(C) 19482/2024 • Retained Counsel: {formData.retainedAdvocateName}
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
            <span>Personal &amp; Identity</span>
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
          {/* TAB 1: PERSONAL & IDENTITY */}
          {activeTab === "identity" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white">
                    Full Legal Name (as per Aadhaar / Passport)
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500">
                    Used for e-filing Vakalatnamas, court summons, and verified affidavits.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white">
                    Father / Spouse Name (for Court Pleadings)
                  </label>
                  <input
                    type="text"
                    value={formData.fatherOrSpouseName}
                    onChange={(e) => handleInputChange("fatherOrSpouseName", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white">
                    Age &amp; Date of Birth
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
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white">
                    Occupation / Profession
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange("occupation", e.target.value)}
                    placeholder="e.g. Industrialist & Exporter"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-black dark:text-white">
                    Permanent Residential Address
                  </label>
                  <input
                    type="text"
                    value={formData.residentialAddress}
                    onChange={(e) => handleInputChange("residentialAddress", e.target.value)}
                    placeholder="House/Door No., Building, Street Name..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white">
                    District &amp; City
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white">
                    Pincode &amp; State
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange("pincode", e.target.value)}
                      placeholder="682036"
                      className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="Kerala"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white">
                    Verified Mobile (WhatsApp OTP Enabled)
                  </label>
                  <input
                    type="text"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black dark:text-white">
                    Permanent Account Number (PAN)
                  </label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => handleInputChange("panNumber", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-mono uppercase rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  />
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
                  <label className="text-xs font-bold text-black dark:text-white">
                    Primary Court Jurisdiction
                  </label>
                  <select
                    value={formData.primaryCourtJurisdiction}
                    onChange={(e) => handleInputChange("primaryCourtJurisdiction", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  >
                    <option>Kerala (High Court of Kerala)</option>
                    <option>Delhi (Delhi High Court)</option>
                    <option>Maharashtra (Bombay High Court)</option>
                    <option>Karnataka (Karnataka High Court)</option>
                    <option>Tamil Nadu (Madras High Court)</option>
                  </select>
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
