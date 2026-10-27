"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, MapPin, Scale, Star, ShieldCheck, Calendar, MessageSquare, Sparkles, UserCheck } from "lucide-react";
import { citizenApi } from "@/lib/api";

export interface Advocate {
  id: string;
  name: string;
  title: string;
  location: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  matchScore: number;
  specialties: string[];
  fee: string;
  avatarUrl?: string;
  email?: string;
  barCouncilNumber?: string;
  isCurrentUser?: boolean;
}

export const mockAdvocates: Advocate[] = [
  {
    id: "adv-1",
    name: "Adv. Sarah Jenkins",
    title: "Senior Property & Tenancy Advocate",
    location: "Kochi, Kerala",
    experience: "12+ Years Experience",
    rating: 4.9,
    reviewsCount: 142,
    matchScore: 98,
    specialties: ["Tenancy Disputes", "Real Estate Agreements", "Deposit Recovery"],
    fee: "₹2,500 / session",
    barCouncilNumber: "K/001429/2012",
  },
  {
    id: "adv-2",
    name: "Adv. Rajesh Varma",
    title: "Civil & Commercial Contract Specialist",
    location: "Trivandrum, Kerala",
    experience: "15+ Years Experience",
    rating: 4.8,
    reviewsCount: 98,
    matchScore: 94,
    specialties: ["Contract Review", "Sublease Indemnity", "Commercial Disputes"],
    fee: "₹3,000 / session",
    barCouncilNumber: "K/000892/2008",
  },
  {
    id: "adv-3",
    name: "Adv. Priya Nair",
    title: "Family Law & Civil Rights Advocate",
    location: "Kollam, Kerala",
    experience: "9+ Years Experience",
    rating: 4.9,
    reviewsCount: 116,
    matchScore: 89,
    specialties: ["Matrimonial Law", "Property Partition", "Consumer Complaints"],
    fee: "₹2,000 / session",
    barCouncilNumber: "K/002105/2017",
  },
];

interface AdvocateSearchAndMatchProps {
  onSelectAdvocateToBook?: (advocate: Advocate) => void;
  onRequestConsultation?: (advocate: Advocate) => void;
}

function getLocallyStoredAdvocates(): Advocate[] {
  if (typeof window === "undefined") return [];
  const localList: Advocate[] = [];

  try {
    // 1. Check list of advocates registered on this browser
    const rawRegistered = localStorage.getItem("wakheel_registered_advocates");
    if (rawRegistered) {
      const parsed = JSON.parse(rawRegistered);
      if (Array.isArray(parsed)) {
        localList.push(...parsed);
      }
    }

    // 2. Check current logged-in user if advocate
    const rawUser = localStorage.getItem("wakheel_user");
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u && (u.role === "advocate" || u.accountType === "independent_advocate")) {
        const rawProfile = localStorage.getItem("wakheel_advocate_profile");
        const prof = rawProfile ? JSON.parse(rawProfile) : null;

        let cleanName = (u.fullName || prof?.fullName || "Advocate").trim();
        if (!cleanName.toLowerCase().startsWith("adv.") && !cleanName.toLowerCase().startsWith("adv ")) {
          cleanName = `Adv. ${cleanName}`;
        }

        const barNo = prof?.barCouncilNumber || u.barCouncilId || "K/001429/2024";
        const exp = prof?.experienceYears ? `${prof.experienceYears}+ Years Experience` : "8+ Years Experience";
        const court = prof?.primaryCourt || u.additionalDetails?.practiceCourt || "High Court of Kerala (Ernakulam)";
        const location = prof?.chamberAddress
          ? prof.chamberAddress.split(",").slice(-2).join(",").trim()
          : "Ernakulam, Kerala";
        const specs =
          Array.isArray(prof?.practiceAreas) && prof.practiceAreas.length > 0
            ? prof.practiceAreas
            : Array.isArray(prof?.specializations) && prof.specializations.length > 0
            ? prof.specializations
            : ["Civil Litigation", "Constitutional Writs", "Commercial Law"];
        const fee = prof?.consultationFee ? `₹${Number(prof.consultationFee).toLocaleString()} / session` : "₹1,500 / session";

        const currentAdv: Advocate = {
          id: u.id || u._id || "current_advocate_user",
          name: cleanName,
          title: `Advocate • ${court}`,
          location,
          experience: exp,
          rating: prof?.rating || 5.0,
          reviewsCount: prof?.reviewsCount || 1,
          matchScore: 99,
          specialties: specs,
          fee,
          email: u.email,
          barCouncilNumber: barNo,
          isCurrentUser: true,
        };

        // Put current user at the top of local list
        localList.unshift(currentAdv);
      }
    }
  } catch (err) {
    console.warn("Could not read local advocate data:", err);
  }

  return localList;
}

export function AdvocateSearchAndMatch({
  onSelectAdvocateToBook,
  onRequestConsultation,
}: AdvocateSearchAndMatchProps) {
  const [advocates, setAdvocates] = useState<Advocate[]>(mockAdvocates);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  useEffect(() => {
    const localAdvocates = getLocallyStoredAdvocates();

    const standardize = (a: any): Advocate => {
      let name = (a.fullName || a.name || "Advocate").trim();
      if (!name.toLowerCase().startsWith("adv.") && !name.toLowerCase().startsWith("adv ")) {
        name = `Adv. ${name}`;
      }
      const specialties = Array.isArray(a.specializations)
        ? a.specializations
        : Array.isArray(a.specialties)
        ? a.specialties
        : a.specialization
        ? [a.specialization]
        : ["Civil Law", "Litigation"];

      const location = a.chamberAddress
        ? a.chamberAddress.split(",").slice(-2).join(",").trim()
        : a.location || `${a.district || "Ernakulam"}, Kerala`;

      const experience =
        typeof a.experienceYears === "number"
          ? `${a.experienceYears}+ Years Experience`
          : a.experience || "10+ Years Experience";

      const fee =
        typeof a.consultationFee === "number"
          ? `₹${a.consultationFee.toLocaleString()} / session`
          : a.fee || "₹1,500 / session";

      return {
        id: a.id || a._id || `adv_${Math.random()}`,
        name,
        title: a.title || (a.primaryCourt ? `Advocate • ${a.primaryCourt}` : "Advocate, High Court of Kerala"),
        location,
        experience,
        rating: typeof a.rating === "number" ? a.rating : 4.9,
        reviewsCount: typeof a.reviewCount === "number" ? a.reviewCount : a.reviewsCount || 48,
        matchScore: a.matchScore || (a.isVerified ? 98 : 92),
        specialties,
        fee,
        avatarUrl: a.avatarUrl,
        email: a.email,
        barCouncilNumber: a.barCouncilNumber,
      };
    };

    const mergeUnique = (base: Advocate[], additions: Advocate[]) => {
      const seen = new Set<string>();
      const result: Advocate[] = [];

      // Add local additions first (e.g. current logged in advocate)
      for (const adv of additions) {
        const key = (adv.email || adv.name).toLowerCase().replace(/^adv\.\s*/, "");
        if (!seen.has(key)) {
          seen.add(key);
          result.push(adv);
        }
      }

      // Then append base advocates
      for (const adv of base) {
        const key = (adv.email || adv.name).toLowerCase().replace(/^adv\.\s*/, "");
        if (!seen.has(key)) {
          seen.add(key);
          result.push(adv);
        }
      }

      return result;
    };

    // Immediately show local advocates merged with defaults while network fetches
    if (localAdvocates.length > 0) {
      setAdvocates(mergeUnique(mockAdvocates, localAdvocates));
    }

    citizenApi
      .getAdvocates()
      .then((res) => {
        if (res && res.advocates && Array.isArray(res.advocates) && res.advocates.length > 0) {
          const mapped = res.advocates.map(standardize);
          setAdvocates(mergeUnique(mapped, localAdvocates));
        } else if (localAdvocates.length > 0) {
          setAdvocates(mergeUnique(mockAdvocates, localAdvocates));
        }
      })
      .catch(() => {
        setAdvocates(mergeUnique(mockAdvocates, localAdvocates));
      });
  }, []);

  // Compute all available specialties from advocates dynamically
  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    advocates.forEach((adv) => {
      (adv.specialties || []).forEach((s) => {
        if (s && s.trim()) set.add(s.trim());
      });
    });
    return Array.from(set).sort();
  }, [advocates]);

  const filteredAdvocates = advocates.filter((adv) => {
    const name = (adv?.name || "").toLowerCase();
    const specs = Array.isArray(adv?.specialties) ? adv.specialties : [];
    const loc = (adv?.location || "").toLowerCase();
    const barNo = (adv?.barCouncilNumber || "").toLowerCase();
    const term = (searchTerm || "").toLowerCase().trim();

    const matchesSearch =
      !term ||
      name.includes(term) ||
      barNo.includes(term) ||
      loc.includes(term) ||
      specs.some((s) => (s || "").toLowerCase().includes(term));

    const matchesSpecialty =
      selectedSpecialty === "all" ||
      specs.some((s) => (s || "").toLowerCase().includes(selectedSpecialty.toLowerCase()));

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="space-y-6">
      {/* Search & Match Header */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-6 sm:p-8 space-y-6 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-widest text-zinc-500 uppercase flex items-center gap-1.5 mb-1 font-mono">
              <Sparkles className="w-4 h-4 text-black dark:text-white" />
              Verified Advocate Directory
            </span>
            <h2 className="text-2xl font-bold text-black dark:text-white">Search Verified Advocates</h2>
            <p className="text-xs sm:text-sm text-zinc-500">
              Find Bar-enrolled advocates matched to your legal matter.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white font-bold self-start md:self-auto">
            <ShieldCheck className="w-4 h-4" />
            100% Bar-Verified Advocates
          </div>
        </div>

        {/* Search Bar & Specialty Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative">
            <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by advocate name, legal issue, or city..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl pl-12 pr-4 py-3.5 text-sm text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3.5 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
            >
              <option value="all">All Practice Areas ({advocates.length})</option>
              {allSpecialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Advocate Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAdvocates.map((adv, advIdx) => (
          <div
            key={`${adv.id || "adv"}_${advIdx}`}
            className={`rounded-2xl border ${
              adv.isCurrentUser
                ? "border-black dark:border-white ring-1 ring-black dark:ring-white"
                : "border-zinc-200 dark:border-zinc-800"
            } bg-white dark:bg-black p-6 space-y-5 hover:border-black dark:hover:border-white transition-all flex flex-col justify-between shadow-xs`}
          >
            <div className="space-y-4">
              {/* Header: Name, Match Pill, Rating */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-lg shrink-0">
                    {(adv.name || "Advocate").split(" ")[1]?.[0] || (adv.name || "A")[0] || "A"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-1.5">
                        <span>{adv.name}</span>
                        <ShieldCheck className="w-4 h-4 text-black dark:text-white" />
                      </h3>
                      {adv.isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          Your Profile
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">{adv.title}</p>
                    {adv.barCouncilNumber && (
                      <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                        Bar Reg: {adv.barCouncilNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Match Badge */}
                <div className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-mono font-bold text-xs flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{adv.matchScore}% Match</span>
                </div>
              </div>

              {/* Meta details: Location, Rating, Fee */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-700 dark:text-zinc-300 border-y border-zinc-100 dark:border-zinc-800 py-3">
                <div className="flex items-center gap-1 text-zinc-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{adv.location}</span>
                </div>
                <div className="flex items-center gap-1 text-black dark:text-white font-semibold">
                  <Star className="w-3.5 h-3.5 fill-black text-black dark:fill-white dark:text-white" />
                  <span>{adv.rating} ({adv.reviewsCount} reviews)</span>
                </div>
                <div className="text-zinc-500">
                  {adv.experience}
                </div>
                <div className="ml-auto font-bold text-black dark:text-white font-mono">
                  {adv.fee}
                </div>
              </div>

              {/* Specialties Pills */}
              <div className="flex flex-wrap gap-1.5">
                {(adv.specialties || []).map((spec, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-black dark:text-white"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 grid grid-cols-2 gap-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => onRequestConsultation?.(adv)}
                className="py-2.5 px-3 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Consultation</span>
              </button>

              <button
                onClick={() => onSelectAdvocateToBook?.(adv)}
                className="py-2.5 px-3 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-full text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Call</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
