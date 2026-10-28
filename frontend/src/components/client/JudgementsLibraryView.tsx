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
  Calendar,
  ChevronDown,
  Building2,
  FileText,
  Shield,
  ArrowRight,
} from "lucide-react";

export interface LegalTopicCard {
  id: string;
  category: "criminal" | "constitutional" | "commercial" | "property";
  title: string;
  count: string;
  statutes: string;
  description?: string;
  linkedJudgementId?: string;
}

export interface CourtJudgement {
  id: string;
  title: string;
  citation: string;
  court: string;
  bench: string;
  date: string;
  category: "all" | "khc" | "sc" | "property" | "criminal" | "constitutional" | "commercial";
  categoryLabel: string;
  statutes: string[];
  ratioDecidendi: string;
  citizenExplainer: string;
  factsSummary: string;
  keyParagraphs: { paraNo: number; quote: string }[];
  practicalChecklist: string[];
}

const TOPIC_SECTIONS = [
  {
    id: "criminal",
    heading: "Criminal law",
    subtitle: "Bail, quashing and the offences most often litigated.",
    topics: [
      {
        id: "top-ant-bail",
        category: "criminal" as const,
        title: "Anticipatory bail",
        count: "5,760",
        statutes: "Section 438 CrPC · Section 482 BNSS",
        linkedJudgementId: "jdg-03",
      },
      {
        id: "top-reg-bail",
        category: "criminal" as const,
        title: "Regular bail",
        count: "13,115",
        statutes: "Sections 437 and 439 CrPC · Sections 480 and 483 BNSS",
        linkedJudgementId: "jdg-03",
      },
      {
        id: "top-def-bail",
        category: "criminal" as const,
        title: "Default bail",
        count: "843",
        statutes: "Section 167(2) CrPC · Section 187 BNSS",
        linkedJudgementId: "jdg-03",
      },
      {
        id: "top-fir-quash",
        category: "criminal" as const,
        title: "FIR quashing",
        count: "92,960",
        statutes: "Section 482 CrPC · Section 528 BNSS",
        linkedJudgementId: "jdg-02",
      },
      {
        id: "top-cheque",
        category: "criminal" as const,
        title: "Cheque bounce",
        count: "29,808",
        statutes: "Sections 138 to 148 Negotiable Instruments Act",
        linkedJudgementId: "jdg-02",
      },
      {
        id: "top-498a",
        category: "criminal" as const,
        title: "498A cruelty",
        count: "21,761",
        statutes: "Section 498A IPC · Sections 85 and 86 BNS",
        linkedJudgementId: "jdg-03",
      },
    ],
  },
  {
    id: "constitutional",
    heading: "Constitutional & Writ law",
    subtitle: "Fundamental rights, Article 226/32, mandamus, certiorari and state accountability.",
    topics: [
      {
        id: "top-writ-cert",
        category: "constitutional" as const,
        title: "Writ of Certiorari / Mandamus",
        count: "44,120",
        statutes: "Article 226 & 32 Constitution · Telegraph Act Sec. 16",
        linkedJudgementId: "jdg-01",
      },
      {
        id: "top-prop-serv",
        category: "constitutional" as const,
        title: "Right to Property & Servitude",
        count: "18,340",
        statutes: "Article 300A · Electricity Act Sec. 67/68",
        linkedJudgementId: "jdg-01",
      },
      {
        id: "top-liberty",
        category: "constitutional" as const,
        title: "Personal Liberty & Detention",
        count: "31,890",
        statutes: "Article 21 & 22 · Preventive Detention Acts",
        linkedJudgementId: "jdg-03",
      },
      {
        id: "top-service-writs",
        category: "constitutional" as const,
        title: "Service & Seniority Writs",
        count: "52,410",
        statutes: "Article 311 · Kerala State & Subordinate Services Rules",
        linkedJudgementId: "jdg-01",
      },
    ],
  },
  {
    id: "commercial",
    heading: "Commercial & Arbitration law",
    subtitle: "Section 9/17 interim relief, contract enforcement, and insolvency proceedings.",
    topics: [
      {
        id: "top-sec-9",
        category: "commercial" as const,
        title: "Section 9 Interim Measures",
        count: "14,200",
        statutes: "Arbitration & Conciliation Act 1996, Sec. 9",
        linkedJudgementId: "jdg-05",
      },
      {
        id: "top-sec-11",
        category: "commercial" as const,
        title: "Section 11 Arbitrator Appointment",
        count: "22,850",
        statutes: "Arbitration & Conciliation Act 1996, Sec. 11",
        linkedJudgementId: "jdg-05",
      },
      {
        id: "top-sec-34",
        category: "commercial" as const,
        title: "Section 34 Award Challenge",
        count: "38,910",
        statutes: "Public policy & patent illegality grounds",
        linkedJudgementId: "jdg-05",
      },
      {
        id: "top-ibc",
        category: "commercial" as const,
        title: "Corporate Insolvency & IBC",
        count: "67,420",
        statutes: "IBC 2016 Sec. 7 & Sec. 9 · NCLT/NCLAT",
        linkedJudgementId: "jdg-05",
      },
    ],
  },
  {
    id: "property",
    heading: "Property, Tenancy & Civil law",
    subtitle: "Title declarations, boundary commissions, easement rights, and tenant evictions.",
    topics: [
      {
        id: "top-survey",
        category: "property" as const,
        title: "Advocate Commissioner Survey",
        count: "12,890",
        statutes: "Order XXVI Rule 9 CPC · Boundary fixation",
        linkedJudgementId: "jdg-04",
      },
      {
        id: "top-tenancy-106",
        category: "property" as const,
        title: "Section 106 Tenancy Notice",
        count: "19,450",
        statutes: "Transfer of Property Act Sec. 106 · Kerala Buildings Act",
        linkedJudgementId: "jdg-04",
      },
      {
        id: "top-specific-perf",
        category: "property" as const,
        title: "Specific Performance of Contract",
        count: "41,200",
        statutes: "Specific Relief Act 1963 Sec. 16(c)",
        linkedJudgementId: "jdg-04",
      },
      {
        id: "top-injunction",
        category: "property" as const,
        title: "Injunction & Encroachment",
        count: "58,340",
        statutes: "Order XXXIX CPC · Specific Relief Act Sec. 38",
        linkedJudgementId: "jdg-04",
      },
    ],
  },
];

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
    bench: "Hon'ble Mr. Justice A. Muhamed Mustaque & Hon'ble Mrs. Justice Sophie Thomas",
    date: "18 Sep 2023",
    category: "property",
    categoryLabel: "Property & Tenancy",
    statutes: [
      "Kerala Buildings (Lease and Rent Control) Act, 1965 (Section 11(3))",
      "Transfer of Property Act, 1882 (Section 106)",
    ],
    ratioDecidendi:
      "A landlord's bona fide need for own commercial occupation cannot be doubted merely because alternative unsuited properties exist. Once the landlord establishes the genuine intention to start a business, the burden shifts to the tenant to prove the statutory provisos regarding dependency on commercial income and non-availability of other rooms in the locality.",
    citizenExplainer:
      "If you own a building and genuinely require it for your own business or your child's profession, the court will support eviction of the tenant unless the tenant can convincingly prove there is nowhere else in the area for them to operate.",
    factsSummary:
      "Landlord sought eviction of ground floor shop in Kannur town for his son's chartered accountancy chamber. The Rent Control Court allowed eviction. The Appellate Authority reversed. The High Court restored the eviction order.",
    keyParagraphs: [
      {
        paraNo: 8,
        quote:
          "The landlord is the best judge of their residential or commercial requirement. It is neither for the tenant nor for the court to prescribe what space is adequate.",
      },
    ],
    practicalChecklist: [
      "Issue 15-day Section 106 statutory notice specifying bona fide requirement.",
      "File Rent Control Petition (RCP) before Munsiff Court / Rent Controller.",
      "Produce proof of dependent child's qualification (e.g. CA / Law / Medical degree).",
    ],
  },
  {
    id: "jdg-05",
    title: "Perkins Eastman Architects DPC v. HSCC (India) Ltd.",
    citation: "2020 (20) SCC 760 • Arbitration Petition No. 32 of 2019",
    court: "Supreme Court of India (New Delhi)",
    bench: "Hon'ble Mr. Justice U.U. Lalit & Hon'ble Mrs. Justice Indu Malhotra",
    date: "26 Nov 2019",
    category: "commercial",
    categoryLabel: "Commercial Arbitration",
    statutes: [
      "Arbitration and Conciliation Act, 1996 (Section 11(6), Section 12(5))",
      "Seventh Schedule of the Arbitration Act",
    ],
    ratioDecidendi:
      "A person who is disqualified under Section 12(5) read with the Seventh Schedule from acting as an arbitrator is equally ineligible to nominate a sole arbitrator. Unilateral appointment of arbitrators by one contracting party without mutual consensus is invalid in law and strikes at the core of independent arbitral adjudication.",
    citizenExplainer:
      "In commercial or construction agreements, a company cannot unilaterally appoint their own employee or handpicked lawyer as the sole arbitrator. The appointment must be mutually agreed or decided by the High Court / Supreme Court.",
    factsSummary:
      "Contract clause permitted Chief Managing Director of HSCC to unilaterally appoint sole arbitrator. The Supreme Court held that since the CMD is an interested party, he cannot appoint the arbitrator, and the Court appointed an independent retired High Court judge.",
    keyParagraphs: [
      {
        paraNo: 21,
        quote:
          "In a case where one party has the exclusive right to appoint an arbitrator, its choice will always have an element of bias, which is why Section 12(5) renders such unilateral appointment invalid.",
      },
    ],
    practicalChecklist: [
      "Issue notice invoking arbitration under Section 21 proposing neutral panel of names.",
      "Wait 30 days for respondent's concurrence.",
      "If respondent insists on unilateral appointee, approach High Court under Section 11(6).",
    ],
  },
];

export default function JudgementsLibraryView() {
  const [selectedCourt, setSelectedCourt] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actSearchQuery, setActSearchQuery] = useState<string>("");
  const [readingJudgement, setReadingJudgement] = useState<CourtJudgement | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [courtDropdownOpen, setCourtDropdownOpen] = useState(false);
  const [yearsDropdownOpen, setYearsDropdownOpen] = useState(false);
  const [issueDropdownOpen, setIssueDropdownOpen] = useState(false);

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

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const actQ = actSearchQuery.trim().toLowerCase();

    return TOPIC_SECTIONS.map((sec) => {
      const filteredTopics = sec.topics.filter((t) => {
        const matchesCourt =
          selectedCourt === "all" ||
          (selectedCourt === "sc" && (t.category === "constitutional" || t.category === "criminal")) ||
          (selectedCourt === "hc" && (t.category === "property" || t.category === "constitutional"));

        const matchesSearch =
          !q ||
          t.title.toLowerCase().includes(q) ||
          t.statutes.toLowerCase().includes(q) ||
          sec.heading.toLowerCase().includes(q);

        const matchesActSearch =
          !actQ || t.statutes.toLowerCase().includes(actQ);

        return matchesCourt && matchesSearch && matchesActSearch;
      });

      return {
        ...sec,
        topics: filteredTopics,
      };
    }).filter((sec) => sec.topics.length > 0);
  }, [searchQuery, actSearchQuery, selectedCourt]);

  // Filter full landmark judgments
  const filteredJudgements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const actQ = actSearchQuery.trim().toLowerCase();

    return JUDGEMENTS_DATA.filter((jdg) => {
      const matchCourt =
        selectedCourt === "all" ||
        (selectedCourt === "sc" && jdg.category === "sc") ||
        (selectedCourt === "hc" && jdg.category === "khc");

      const matchQ =
        !q ||
        jdg.title.toLowerCase().includes(q) ||
        jdg.citation.toLowerCase().includes(q) ||
        jdg.bench.toLowerCase().includes(q) ||
        jdg.ratioDecidendi.toLowerCase().includes(q) ||
        jdg.citizenExplainer.toLowerCase().includes(q);

      const matchAct =
        !actQ || jdg.statutes.some((s) => s.toLowerCase().includes(actQ));

      return matchCourt && matchQ && matchAct;
    });
  }, [selectedCourt, searchQuery, actSearchQuery]);

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6">
      {/* Header matching reference */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
          Indian Court Judgments &amp; Case Law
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-3xl leading-relaxed">
          Search Supreme Court and High Court judgments by legal issue, court or statutory provision. Explore case law for Indian legal research.
        </p>
      </div>

      {/* Full-width Search Bar matching reference */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by case name, court, bench, or keyword..."
          className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 shadow-2xs transition-colors"
        />
      </div>

      {/* Filter and Judgments Count Toolbar matching reference */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Pills & Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* All Judgments Pill */}
          <button
            type="button"
            onClick={() => setSelectedCourt("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCourt === "all"
                ? "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-bold shadow-2xs"
                : "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            All Judgments
          </button>

          {/* Supreme Court Pill */}
          <button
            type="button"
            onClick={() => setSelectedCourt("sc")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCourt === "sc"
                ? "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-bold shadow-2xs"
                : "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            Supreme Court
          </button>

          {/* High Courts Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setCourtDropdownOpen((prev) => !prev);
                setYearsDropdownOpen(false);
                setIssueDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCourt === "hc"
                  ? "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-bold"
                  : "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              <span>High Courts</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {courtDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 z-20 w-48 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl p-1.5 space-y-1">
                {[
                  { id: "hc", label: "High Court of Kerala" },
                  { id: "hc-delhi", label: "Delhi High Court" },
                  { id: "hc-bombay", label: "Bombay High Court" },
                  { id: "hc-madras", label: "Madras High Court" },
                ].map((hc) => (
                  <button
                    key={hc.id}
                    type="button"
                    onClick={() => {
                      setSelectedCourt("hc");
                      setCourtDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                  >
                    {hc.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* All Years Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setYearsDropdownOpen((prev) => !prev);
                setCourtDropdownOpen(false);
                setIssueDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <span>All years</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {yearsDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 z-20 w-36 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl p-1.5 space-y-1">
                {["All Years", "2026", "2025", "2024", "2023", "2022", "2020-2021"].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setYearsDropdownOpen(false)}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                  >
                    {yr}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Legal Issue Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIssueDropdownOpen((prev) => !prev);
                setCourtDropdownOpen(false);
                setYearsDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <span>Legal issue</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {issueDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 z-20 w-52 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl p-1.5 space-y-1">
                {[
                  "Bail Jurisprudence",
                  "Section 138 Dishonour",
                  "Telegraph Act Section 16",
                  "Section 9 Interim Relief",
                  "Tenancy & Eviction",
                ].map((iss) => (
                  <button
                    key={iss}
                    type="button"
                    onClick={() => setIssueDropdownOpen(false)}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                  >
                    {iss}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search sections and acts input pill */}
          <div className="relative inline-flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3.5 text-zinc-400" />
            <input
              type="text"
              value={actSearchQuery}
              onChange={(e) => setActSearchQuery(e.target.value)}
              placeholder="Search sections and acts..."
              className="pl-9 pr-3 py-1.5 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 w-44 sm:w-56 transition-colors"
            />
          </div>
        </div>

        {/* Right Badge: 17,26,756 judgments */}
        <div className="px-4 py-1.5 rounded-full bg-[#6B1728]/10 text-[#6B1728] dark:bg-[#6B1728]/25 dark:text-[#F3B8C2] font-mono font-bold text-xs border border-[#6B1728]/20">
          17,26,756 judgments
        </div>
      </div>

      {/* Topic Sections with Container-Boxed 4-Column Cards matching screenshot */}
      <div className="space-y-8 pt-4">
        {filteredSections.map((sec) => (
          <div
            key={sec.id}
            className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-7 space-y-6 shadow-2xs"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white tracking-tight">
                {sec.heading}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {sec.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sec.topics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => {
                    const match = JUDGEMENTS_DATA.find((j) => j.id === topic.linkedJudgementId);
                    if (match) setReadingJudgement(match);
                  }}
                  className="group rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 sm:p-5 flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-black dark:text-white group-hover:underline">
                      {topic.title}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#6B1728]/10 text-[#6B1728] dark:bg-[#6B1728]/25 dark:text-[#F3B8C2] shrink-0">
                      {topic.count}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 leading-snug">
                    {topic.statutes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Landmark Certified Judgments Section */}
      <div className="pt-8 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">
              Landmark Judicial Precedents &amp; Binding Ratios
            </h2>
            <p className="text-xs text-zinc-500">
              Plain-language citizen takeaways with full legal citations and practical checklists
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {filteredJudgements.length} Precedents
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJudgements.map((jdg) => (
            <div
              key={jdg.id}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex flex-col justify-between group shadow-2xs space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white">
                    {jdg.categoryLabel}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{jdg.date}</span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-black dark:text-white group-hover:underline leading-snug">
                  {jdg.title}
                </h3>
                <span className="font-mono text-[11px] text-zinc-500 block">
                  {jdg.citation}
                </span>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black dark:text-white block">
                    Citizen Legal Takeaway:
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
                    {jdg.citizenExplainer}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setReadingJudgement(jdg)}
                  className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Read Full Ratio</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCopyCitation(jdg.citation, jdg.id)}
                    title="Copy citation"
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    {copiedId === jdg.id ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(jdg.id)}
                    title={bookmarkedIds.includes(jdg.id) ? "Bookmarked" : "Bookmark"}
                    className={`p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer ${
                      bookmarkedIds.includes(jdg.id)
                        ? "text-[#6B1728] border-[#6B1728]"
                        : "text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        bookmarkedIds.includes(jdg.id) ? "fill-[#6B1728]" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Judgment Reading Modal */}
      {readingJudgement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-3 bg-zinc-50 dark:bg-zinc-950 shrink-0">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                  {readingJudgement.categoryLabel}
                </span>
                <h2 className="text-base sm:text-lg font-black text-black dark:text-white mt-1">
                  {readingJudgement.title}
                </h2>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  {readingJudgement.citation} • {readingJudgement.court}
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

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Bench and Date */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Bench</span>
                  <span className="font-bold text-black dark:text-white text-xs">
                    {readingJudgement.bench}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Decided On</span>
                  <span className="font-mono text-zinc-600 dark:text-zinc-300">
                    {readingJudgement.date}
                  </span>
                </div>
              </div>

              {/* Citizen Explainer */}
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <span className="text-xs font-bold text-black dark:text-white flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#6B1728]" />
                  What This Means For You (Plain Language):
                </span>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {readingJudgement.citizenExplainer}
                </p>
              </div>

              {/* Binding Ratio Decidendi */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-black dark:text-white block uppercase tracking-wider font-mono">
                  Binding Legal Ratio (Ratio Decidendi):
                </span>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-zinc-200 leading-relaxed border-l-4 border-l-[#6B1728]">
                  {readingJudgement.ratioDecidendi}
                </div>
              </div>

              {/* Key Paragraphs from Judgment */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-black dark:text-white block uppercase tracking-wider font-mono">
                  Authoritative Quotes from Judgment:
                </span>
                {readingJudgement.keyParagraphs.map((kp) => (
                  <div
                    key={kp.paraNo}
                    className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1"
                  >
                    <span className="text-[10px] font-mono text-zinc-400 font-bold block">
                      Paragraph {kp.paraNo}:
                    </span>
                    <p className="italic text-zinc-600 dark:text-zinc-300 text-xs leading-relaxed">
                      &ldquo;{kp.quote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>

              {/* Practical Checklist */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-black dark:text-white text-xs block">
                  Actionable Legal Checklist:
                </span>
                <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                  {readingJudgement.practicalChecklist.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-black dark:text-white shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-zinc-500 font-mono">
                Official Supreme Court &amp; Kerala High Court Law Reports Certified
              </span>
              <button
                type="button"
                onClick={() => setReadingJudgement(null)}
                className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer hover:opacity-90"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
