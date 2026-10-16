"use client";

import React, { useState } from "react";
import { Scale, ShieldCheck, CheckCircle2, Building2, BookOpen } from "lucide-react";

export interface AdvocateRegistrationData {
  fullName: string;
  email: string;
  phone: string;
  languages: string[];
  barCouncilState: string;
  enrollmentNumber: string;
  enrollmentYear: string;
  practiceAreas: string[];
  jurisdictions: string[];
  enrolledCourts: string[];
  experienceYears: string;
  consultationFee: string;
  verificationStatus: "verified" | "pending" | "under_review";
}

export function AdvocateRegistrationWizard() {
  const [formData, setFormData] = useState<AdvocateRegistrationData>({
    fullName: "Adv. Sarah Jenkins",
    email: "sarah.jenkins@wakheel.law",
    phone: "+91 98470 12345",
    languages: ["English", "Malayalam", "Hindi"],
    barCouncilState: "Bar Council of Kerala",
    enrollmentNumber: "K/1420/2012",
    enrollmentYear: "2012",
    practiceAreas: ["Property & Tenancy", "Commercial Contracts", "Civil Litigation"],
    jurisdictions: ["High Court of Kerala", "District & Sessions Court Ernakulam"],
    enrolledCourts: ["High Court of Kerala", "RERA Tribunal", "NCLT Kochi Bench"],
    experienceYears: "12 Years",
    consultationFee: "₹2,500 / session",
    verificationStatus: "verified",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const availablePracticeAreas = [
    "Property & Tenancy",
    "Commercial Contracts",
    "Civil Litigation",
    "Family & Matrimonial",
    "Criminal Defense",
    "Constitutional Law",
    "Consumer Protection",
    "Corporate & Intellectual Property",
  ];

  const availableCourts = [
    "High Court of Kerala",
    "District & Sessions Court",
    "RERA Tribunal",
    "NCLT / NCLAT Bench",
    "Family Court",
    "Consumer Disputes Redressal Commission",
    "Supreme Court of India",
  ];

  const availableLanguages = ["English", "Malayalam", "Hindi", "Tamil", "Kannada", "Telugu"];

  const toggleArrayItem = (key: keyof AdvocateRegistrationData, item: string) => {
    const list = (formData[key] as string[]) || [];
    if (list.includes(item)) {
      setFormData({ ...formData, [key]: list.filter((i) => i !== item) });
    } else {
      setFormData({ ...formData, [key]: [...list, item] });
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsEditing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Profile Verification Overview Card */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-6 sm:p-8 space-y-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs">
              <Scale className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-black dark:text-white">{formData.fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-black dark:text-white flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Bar Verified
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {formData.barCouncilState} • Enrollment No: <strong className="text-black dark:text-white font-mono">{formData.enrollmentNumber}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-black dark:text-white font-bold text-xs rounded-full transition-all cursor-pointer"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-white rounded-xl text-xs text-black dark:text-white font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Advocate Bar details and practice profile updated successfully!
          </div>
        )}

        {/* Detailed Profile Information Grid */}
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-700 dark:text-zinc-300">
            {/* Left Column: Bar Council & License Details */}
            <div className="space-y-4 p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Bar Council &amp; License
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500">Bar Council State:</span>
                  <span className="font-semibold text-black dark:text-white">{formData.barCouncilState}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500">Enrollment Number:</span>
                  <span className="font-bold text-black dark:text-white font-mono">{formData.enrollmentNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500">Year of Enrollment:</span>
                  <span className="font-semibold text-black dark:text-white">{formData.enrollmentYear}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Experience:</span>
                  <span className="font-semibold text-black dark:text-white">{formData.experienceYears}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Practice Areas & Enrolled Courts */}
            <div className="space-y-4 p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Practice Areas &amp; Courts
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-zinc-500 block mb-1">Practice Areas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.practiceAreas.map((area, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-md font-semibold text-black dark:text-white">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-zinc-500 block mb-1">Enrolled Courts:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.enrolledCourts.map((court, i) => (
                      <span key={i} className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-md font-bold text-black dark:text-white">
                        {court}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-zinc-500 block mb-1">Languages:</span>
                  <span className="font-semibold text-black dark:text-white">{formData.languages.join(", ")}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Editable Form */
          <form onSubmit={handleSaveProfile} className="space-y-6 pt-2">
            <h3 className="text-lg font-bold text-black dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-3">
              Advocate Registration &amp; Details
            </h3>

            {/* Step 1: Bar Council Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">1. Bar Council Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400 font-semibold">Bar Council State</label>
                  <input
                    type="text"
                    value={formData.barCouncilState}
                    onChange={(e) => setFormData({ ...formData, barCouncilState: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400 font-semibold">Enrollment Number</label>
                  <input
                    type="text"
                    value={formData.enrollmentNumber}
                    onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400 font-semibold">Year of Enrollment</label>
                  <input
                    type="text"
                    value={formData.enrollmentYear}
                    onChange={(e) => setFormData({ ...formData, enrollmentYear: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Practice Areas Selector */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">2. Practice Areas</h4>
              <div className="flex flex-wrap gap-2">
                {availablePracticeAreas.map((area) => {
                  const selected = formData.practiceAreas.includes(area);
                  return (
                    <button
                      type="button"
                      key={area}
                      onClick={() => toggleArrayItem("practiceAreas", area)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        selected
                          ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                          : "bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-black dark:hover:border-white"
                      }`}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Courts */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">3. Enrolled Courts</h4>
              <div className="flex flex-wrap gap-2">
                {availableCourts.map((court) => {
                  const selected = formData.enrolledCourts.includes(court);
                  return (
                    <button
                      type="button"
                      key={court}
                      onClick={() => toggleArrayItem("enrolledCourts", court)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        selected
                          ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                          : "bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-black dark:hover:border-white"
                      }`}
                    >
                      {court}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save CTA */}
            <button
              type="submit"
              className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer"
            >
              Save Profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
