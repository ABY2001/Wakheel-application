"use client";

import React, { useState, useMemo } from "react";
import {
  Scale,
  Search,
  Bookmark,
  Share2,
  Copy,
  Check,
  Eye,
  X,
  BookOpen,
  ArrowUpRight,
  Shield,
  FileText,
  Calendar,
  Award,
} from "lucide-react";

export interface CourtJudgement {
  id: string;
  title: string;
  citation: string;
  court: string;
  bench: string;
  date: string;
  category: "all" | "khc" | "sc" | "property" | "criminal" | "constitutional";
  categoryLabel: string;
  statutes: string[];
  ratioDecidendi: string;
  citizenExplainer: string;
  factsSummary: string;
  keyParagraphs: { paraNo: number; quote: string }[];
  practicalChecklist: string[];
}

const JUDGEMENTS_DATA: CourtJudgement[] = [
  {
    id: "jdg-01",
    title: "Gopakumar Nambiar v. Kerala State Electricity Board & Anr.",
    citation: "2024 (2) KHC 401 (DB) • WP(C) No. 19482 of 2024",
    court: "High Court of Kerala (Ernakulam Bench)",
    bench: "Hon'ble Mr. Justice P.B. Suresh Kumar & Hon'ble Mr. Justice C. Pratheep Kumar",
    date: "14 Jun 2024",
    category: "khc",
    categoryLabel: "Kerala High Court",
    statutes: [
      "Indian Telegraph Act, 1885 (Section 10, Section 16)",
      "Electricity Act, 2003 (Section 67, Section 68)",
      "Article 300A of Constitution of India",
    ],
    ratioDecidendi:
      "A licensee utility cannot unilaterally enter upon private agricultural land or deviate from approved alignment maps without giving reasonable prior written notice to the occupier. Where a landowner files bona fide objections regarding tree damage or feasibility of boundary alignment, the licensee is statutorily bound to refer the dispute to the District Magistrate under Section 16(1) before erecting transmission towers or drawing conductors.",
    citizenExplainer:
      "If electricity officials or contractors arrive to place high-tension poles across your compound without notice, you have the legal right to stop work, demand the sanctioned route sketch, and submit an objection. The board cannot proceed until the District Collector / Magistrate gives you a formal hearing.",
    factsSummary:
      "The petitioner owned rubber and spice plantations in Aluva Taluk. The KSEB suddenly altered an approved 11KV line corridor to cut directly across the petitioner's residential compound rather than the public road puramboke, without serving statutory notice under Section 16.",
    keyParagraphs: [
      {
        paraNo: 14,
        quote:
          "The power conferred on the telegraph authority under Section 10 is conditioned by natural justice. An occupier cannot be treated as a silent spectator when their immovable property is subject to permanent servitude.",
      },
      {
        paraNo: 19,
        quote:
          "Whenever an objection is raised under Section 16(1), the utility has no jurisdiction to decide its own authority; it must submit the matter to the District Magistrate who shall adjudicate after hearing both parties.",
      },
    ],
    practicalChecklist: [
      "Obtain certified survey sketch from local electrical division office.",
      "Submit written objection to Executive Engineer citing Section 16 of Telegraph Act within 14 days.",
      "Lodge a petition before the District Magistrate / Collectorate requesting hearing prior to commencement.",
    ],
  },
  {
    id: "jdg-02",
    title: "Yogendra Pratap Singh v. Savitri Pandey & Anr.",
    citation: "2024 INSC 782 • Criminal Appeal No. 2140 of 2024",
    court: "Supreme Court of India (New Delhi)",
    bench: "Hon'ble Mr. Justice B.R. Gavai & Hon'ble Mr. Justice Sandeep Mehta",
    date: "22 Oct 2026",
    category: "sc",
    categoryLabel: "Supreme Court",
    statutes: [
      "Negotiable Instruments Act, 1881 (Section 138, Section 142)",
      "Bharatiya Nagarik Suraksha Sanhita, 2023",
    ],
    ratioDecidendi:
      "A criminal complaint under Section 138 of the Negotiable Instruments Act filed before the expiry of the mandatory 15-day statutory period from receipt of notice is premature, illegal, and non-maintainable. The cause of action arises only on the 16th day upon the drawer's failure to make payment. A complaint presented early cannot be validated by subsequent expiry of time.",
    citizenExplainer:
      "When someone's cheque bounces, you must send a legal notice and give them exactly 15 full days to pay after they receive it. If you file the case in court even one day before day 16, the entire criminal case will be dismissed as invalid.",
    factsSummary:
      "The complainant filed a cheque bounce complaint on the 14th day of notice delivery. The Trial Magistrate took cognizance. The High Court refused to quash the proceeding. The Supreme Court reversed and quashed the complaint, clarifying that the 15-day period is strict and jurisdictional.",
    keyParagraphs: [
      {
        paraNo: 9,
        quote:
          "Penal statutes creating strict liability require punctilious compliance with procedural pre-conditions. No offence under Section 138 is committed until the 15-day statutory window granted to the drawer has completely elapsed.",
      },
      {
        paraNo: 12,
        quote:
          "A court is precluded from taking cognizance under Section 142 if the complaint is presented before the cause of action has accrued.",
      },
    ],
    practicalChecklist: [
      "Download India Post delivery tracking certificate with precise date of delivery.",
      "Count 15 clear days excluding date of delivery.",
      "File complaint before Judicial First Class Magistrate between Day 16 and Day 45.",
    ],
  },
  {
    id: "jdg-03",
    title: "Satender Kumar Antil v. Central Bureau of Investigation",
    citation: "2022 (10) SCC 51 • (2024) 4 KHC 210",
    court: "Supreme Court of India (New Delhi)",
    bench: "Hon'ble Mr. Justice S.K. Kaul & Hon'ble Mr. Justice M.M. Sundresh",
    date: "11 Jul 2022",
    category: "criminal",
    categoryLabel: "Criminal & BNSS/BNS",
    statutes: [
      "Bharatiya Nagarik Suraksha Sanhita, 2023 (Section 35, 482)",
      "Code of Criminal Procedure, 1973 (Section 41, 41A, 437)",
      "Article 21 of Constitution of India",
    ],
    ratioDecidendi:
      "Arrest is not mandatory for offences punishable with up to 7 years imprisonment unless specific statutory necessity is recorded in writing. Bail is the rule and jail is the exception. Investigating agencies must strictly issue Section 35 BNSS (41A CrPC) appearance notices before resorting to custodial detention.",
    citizenExplainer:
      "For minor or non-heinous allegations where the penalty is below 7 years, police cannot arrest you automatically. They must give you an appearance notice. If you cooperate with questioning, you cannot be sent to jail without recorded magistrate justification.",
    factsSummary:
      "The Supreme Court formulated comprehensive pan-India guidelines categorizing offences into four categories (A, B, C, D) to curtail arbitrary arrests and ensure expeditious bail disposal by Magistrate and Sessions Courts.",
    keyParagraphs: [
      {
        paraNo: 23,
        quote:
          "The existence of the power to arrest is one thing, the justification for the exercise of it is quite another. Personal liberty under Article 21 cannot be sacrificed to routine police whim.",
      },
    ],
    practicalChecklist: [
      "Demand written notice under Section 35 BNSS if summoned by investigating officer.",
      "Submit written response acknowledging attendance and cooperating with inquiries.",
      "Move Section 482 BNSS anticipatory bail if arrest is threatened without grounds.",
    ],
  },
  {
    id: "jdg-04",
    title: "Kunhambu v. Mohanan & Ors.",
    citation: "2023 (4) KLT 112 • RCRev No. 89 of 2023",
    court: "High Court of Kerala (Ernakulam Bench)",
    bench: "Hon'ble Mr. Justice A. Muhamed Mustque & Hon'ble Mrs. Justice Shoba Annamma Eapen",
    date: "18 Aug 2023",
    category: "property",
    categoryLabel: "Property & Land",
    statutes: [
      "Kerala Buildings (Lease and Rent Control) Act, 1965 (Section 11(3))",
      "Transfer of Property Act, 1882 (Section 106)",
    ],
    ratioDecidendi:
      "The bona fide need of a landlord to occupy their own premises under Section 11(3) is presumed to be genuine unless the tenant establishes mala fides with positive proof. The landlord is the sole arbiter of their residential and commercial requirements; the tenant cannot dictate how the landlord should adjust.",
    citizenExplainer:
      "If a property owner genuinely needs their rented shop or house for their own family or business, the court will favor the landlord's eviction petition unless the tenant proves the owner has another vacant building readily available in the same locality.",
    factsSummary:
      "Landlord filed rent control petition seeking vacant possession of ground floor commercial shop to establish a pharmacy for his dependent son. Tenant resisted claiming other rooms were owned by the landlord. The High Court upheld the eviction order.",
    keyParagraphs: [
      {
        paraNo: 8,
        quote:
          "It is not the province of the tenant to direct the landlord in what manner he should manage his properties or satisfy his reasonable requirements.",
      },
    ],
    practicalChecklist: [
      "Establish bona fide personal requirement with supporting business or family dependency records.",
      "Verify absence of other vacant buildings within the local panchayat/municipality.",
      "Issue Section 106 T.P. Act notice prior to instituting Rent Control Petition.",
    ],
  },
  {
    id: "jdg-05",
    title: "Sawarni (Smt.) v. Smt. Inder Kaur & Ors.",
    citation: "AIR 1996 SC 2823 • Followed in 2024 (1) KHC 550",
    court: "Supreme Court of India (New Delhi)",
    bench: "Hon'ble Mr. Justice K. Ramaswamy & Hon'ble Mr. Justice G.B. Pattanaik",
    date: "16 Sep 1996",
    category: "property",
    categoryLabel: "Property & Land",
    statutes: [
      "Kerala Land Tax Act, 1961",
      "Transfer of Property Act, 1882 (Section 54)",
      "Specific Relief Act, 1963",
    ],
    ratioDecidendi:
      "Mutation of a property in revenue records neither creates nor extinguishes title, nor has it any presumptive value on title. It is solely an administrative entry for the fiscal purpose of collecting land revenue and does not prejudice the rights of true owners under registered title deeds.",
    citizenExplainer:
      "Having your name in the village revenue thandaper or paying land tax does not make you the legal owner if another person holds a valid registered sale deed. Similarly, someone cannot steal your land simply by fraudulently getting their name on the village tax receipt.",
    factsSummary:
      "Dispute between legal heirs where revenue mutation was obtained by respondent in revenue registers. The appellant challenged on the strength of a registered sale deed. The Supreme Court firmly ruled revenue mutation is not evidence of title.",
    keyParagraphs: [
      {
        paraNo: 7,
        quote:
          "Mutation of name in the revenue records does not create any title nor does it have the effect of extinguishing the title of the true owner. Such entries are relevant only for fiscal purposes of collecting land revenue.",
      },
    ],
    practicalChecklist: [
      "Never rely exclusively on land tax receipts when purchasing immovable property.",
      "Conduct title tracing of prior title deeds for 30 years and inspect Nil Encumbrance Certificate.",
      "Challenge fraudulent mutations before Tahsildar / Revenue Divisional Officer (RDO).",
    ],
  },
  {
    id: "jdg-06",
    title: "Shreya Singhal v. Union of India",
    citation: "(2015) 5 SCC 1 • 2015 AIR SCW 2432",
    court: "Supreme Court of India (New Delhi)",
    bench: "Hon'ble Mr. Justice J. Chelameswar & Hon'ble Mr. Justice R.F. Nariman",
    date: "24 Mar 2015",
    category: "constitutional",
    categoryLabel: "Constitutional & Civil Rights",
    statutes: [
      "Information Technology Act, 2000 (Section 66A, Section 79)",
      "Article 19(1)(a) & Article 19(2) of Constitution of India",
    ],
    ratioDecidendi:
      "Section 66A of the Information Technology Act was declared unconstitutional in its entirety as it cast an overbroad, vague chill upon the fundamental right to freedom of speech and expression. Intermediate internet platforms are only required to take down content upon a court order or government notification.",
    citizenExplainer:
      "Police cannot arrest citizens under the struck-down Section 66A for social media posts, comments, or critical online speech. Any FIR registered under Section 66A is void ab initio and liable to immediate quashing.",
    factsSummary:
      "Petitioners challenged Section 66A following widespread wrongful arrests across India for peaceful online commentary. The Supreme Court struck down the provision in a landmark defence of democratic discourse.",
    keyParagraphs: [
      {
        paraNo: 82,
        quote:
          "The clear and present danger test and the incitement to violence test must be met before speech can be criminalized. Discussion and advocacy are protected; mere incitement alone can be restrained.",
      },
    ],
    practicalChecklist: [
      "Check if any police notice mentions Section 66A of IT Act; if so, cite Shreya Singhal to have it withdrawn.",
      "File WP(C) before High Court under Article 226 for quashing any FIR continuing under Section 66A.",
    ],
  },
];

const CATEGORIES = [
  { id: "all", label: "All Judgements" },
  { id: "khc", label: "Kerala High Court" },
  { id: "sc", label: "Supreme Court" },
  { id: "property", label: "Property & Land" },
  { id: "criminal", label: "Criminal & BNSS/BNS" },
  { id: "constitutional", label: "Constitutional & Rights" },
];

export default function JudgementsLibraryView() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [readingJudgement, setReadingJudgement] = useState<CourtJudgement | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredJudgements = useMemo(() => {
    return JUDGEMENTS_DATA.filter((jdg) => {
      const matchCat =
        selectedCategory === "all" || jdg.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        jdg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jdg.citation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jdg.bench.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jdg.ratioDecidendi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jdg.citizenExplainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jdg.statutes.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCopyCitation = (citation: string, id: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white tracking-tight">
              Landmark Judgements &amp; Precedents
            </h1>
            <p className="text-xs text-zinc-500 font-medium">
              Binding ratios, full citations, and plain-language citizen legal explainers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
            {JUDGEMENTS_DATA.length} Landmark Precedents
          </span>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search judgements by citation, case name, judge, statute (e.g., KHC, Telegraph Act, Section 138, Bail)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-zinc-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Judgements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJudgements.map((jdg) => (
          <div
            key={jdg.id}
            className="p-5 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all flex flex-col justify-between group shadow-2xs space-y-4"
          >
            <div className="space-y-3">
              {/* Top metadata */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                  {jdg.categoryLabel}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{jdg.date}</span>
                </div>
              </div>

              {/* Title & Citation */}
              <div>
                <h3 className="font-bold text-sm text-black dark:text-white group-hover:underline leading-snug">
                  {jdg.title}
                </h3>
                <span className="font-mono text-[11px] text-zinc-500 block mt-1">
                  {jdg.citation}
                </span>
              </div>

              {/* Citizen Explainer Highlight Card */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black dark:text-white block">
                  Citizen Legal Takeaway:
                </span>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
                  {jdg.citizenExplainer}
                </p>
              </div>

              {/* Ratio Decidendi */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                  Binding Ratio Decidendi:
                </span>
                <p className="text-zinc-700 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                  {jdg.ratioDecidendi}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setReadingJudgement(jdg)}
                className="py-2 px-3.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Read Full Precedent</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCopyCitation(jdg.citation, jdg.id)}
                  title="Copy Citation"
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  {copiedId === jdg.id ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => toggleBookmark(jdg.id)}
                  title="Bookmark"
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    bookmarkedIds.includes(jdg.id)
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                      : "border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJudgements.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
          No judgements match your search query. Try searching for &quot;High Court&quot;, &quot;Telegraph&quot;, or &quot;Cheque&quot;.
        </div>
      )}

      {/* Reading Modal */}
      {readingJudgement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-3 bg-zinc-50 dark:bg-zinc-950 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                    {readingJudgement.categoryLabel}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {readingJudgement.date}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-black dark:text-white">
                  {readingJudgement.title}
                </h2>
                <p className="text-xs text-zinc-500 font-mono">
                  {readingJudgement.citation} • {readingJudgement.court}
                </p>
                <p className="text-[11px] text-zinc-400">
                  Bench: {readingJudgement.bench}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setReadingJudgement(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Statutes Referred */}
              <div className="space-y-1.5">
                <span className="font-bold text-black dark:text-white text-xs block">
                  Statutes &amp; Constitutional Provisions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {readingJudgement.statutes.map((st, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-[10px] text-black dark:text-white"
                    >
                      {st}
                    </span>
                  ))}
                </div>
              </div>

              {/* Citizen Plain Language Explainer */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-black dark:text-white" />
                  <span className="font-black text-black dark:text-white text-xs uppercase tracking-wider">
                    What This Ruling Means for Citizens:
                  </span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {readingJudgement.citizenExplainer}
                </p>
              </div>

              {/* Core Ratio Decidendi */}
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black dark:text-white block">
                  Authoritative Ratio Decidendi (Binding Principle of Law):
                </span>
                <p className="text-xs font-serif text-black dark:text-zinc-100 leading-relaxed italic">
                  &ldquo;{readingJudgement.ratioDecidendi}&rdquo;
                </p>
              </div>

              {/* Facts Summary */}
              <div className="space-y-2">
                <span className="font-bold text-black dark:text-white text-xs block">
                  Case Background &amp; Material Facts:
                </span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {readingJudgement.factsSummary}
                </p>
              </div>

              {/* Key Judgement Quotes */}
              <div className="space-y-3">
                <span className="font-bold text-black dark:text-white text-xs block">
                  Extracted Judicial Paragraphs:
                </span>
                {readingJudgement.keyParagraphs.map((kp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black space-y-1.5"
                  >
                    <span className="text-[10px] font-mono font-bold text-zinc-400 block">
                      Paragraph [{kp.paraNo}]
                    </span>
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed italic">
                      &ldquo;{kp.quote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>

              {/* Practical Action Checklist */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2 bg-zinc-50 dark:bg-zinc-950">
                <span className="font-bold text-black dark:text-white text-xs block">
                  Procedural Action Checklist for Litigants:
                </span>
                <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400">
                  {readingJudgement.practicalChecklist.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-black dark:text-white shrink-0">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleCopyCitation(readingJudgement.citation, readingJudgement.id)}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black font-bold text-xs text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === readingJudgement.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedId === readingJudgement.id ? "Citation Copied" : "Copy Official Citation"}</span>
              </button>

              <button
                type="button"
                onClick={() => setReadingJudgement(null)}
                className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer hover:opacity-90"
              >
                Close Precedent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
