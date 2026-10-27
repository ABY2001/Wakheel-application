"use client";

import React, { useState, useMemo } from "react";
import {
  Newspaper,
  Scale,
  Search,
  Bookmark,
  Share2,
  Clock,
  ArrowUpRight,
  FileText,
  CheckCircle2,
  X,
  Tag,
  Check,
  ChevronRight,
  ExternalLink,
  BookOpen,
} from "lucide-react";

export interface LegalArticle {
  id: string;
  title: string;
  category: "khc" | "sc" | "property" | "consumer" | "bns";
  categoryLabel: string;
  citation: string;
  court: string;
  date: string;
  readTime: string;
  summary: string;
  ratioDecidendi: string;
  citizenTakeaway: string;
  bench?: string;
  actsReferred: string[];
  fullContent: string[];
  actionChecklist: string[];
}

const ARTICLES_DATA: LegalArticle[] = [
  {
    id: "art-1",
    title: "Prior Notice & Fair Hearing Mandatory Before Laying High-Tension Transmission Lines on Private Land",
    category: "khc",
    categoryLabel: "Kerala High Court",
    citation: "2024 (2) KHC 401 (DB) • WP(C) No. 19482 of 2024",
    court: "High Court of Kerala (Ernakulam Bench)",
    date: "25 Oct 2026",
    readTime: "4 min read",
    summary:
      "A Division Bench of the Kerala High Court has ruled that public utilities cannot enter agricultural lands or alter approved transmission corridors without serving written notice to landowners and resolving tree-felling compensation objections under Section 16 of the Telegraph Act.",
    ratioDecidendi:
      "The licensee's power to draw electricity conductors across private land under Section 10 of the Indian Telegraph Act, 1885 is not arbitrary. Where an occupier raises bona fide objection or requests realignment through an alternative route, the licensee must refer the matter to the District Magistrate before commencing erection.",
    citizenTakeaway:
      "If transmission line poles or overhead lines are proposed across your cultivated plot without notice, you have the right to request the sanctioned route map, submit a written objection to the Executive Engineer, and petition the District Magistrate for realignment.",
    bench: "Hon'ble Mr. Justice P.B. Suresh Kumar & Hon'ble Mr. Justice C. Pratheep Kumar",
    actsReferred: [
      "Indian Telegraph Act, 1885 (Section 10, 16)",
      "Electricity Act, 2003 (Section 67, 68)",
      "Article 300A of Constitution of India",
    ],
    fullContent: [
      "The Division Bench delivered this authoritative ruling while allowing a batch of writ petitions challenging high-tension overhead line alignment passing through private rubber and spice plantations in Central Kerala.",
      "The court observed that while infrastructure projects serve the broader public interest, landowners' constitutional rights under Article 300A cannot be brushed aside without adhering to natural justice.",
      "The court directed that in all future installations, the licensee must serve at least 15 days prior written notice specifying the exact coordinates, compensation parameters for yielding trees, and grievance redressal channels before moving machinery onto private holdings.",
    ],
    actionChecklist: [
      "Request certified copy of the route survey map from the local Electricity Division.",
      "Submit written representation within 14 days suggesting feasible alternative alignment along boundary lines.",
      "If unaddressed, approach the District Magistrate / District Collector under Section 16(1) of Indian Telegraph Act.",
    ],
  },
  {
    id: "art-2",
    title: "Supreme Court: Mandatory 15-Day Statutory Notice is an Inflexible Prerequisite for S.138 Cheque Cases",
    category: "sc",
    categoryLabel: "Supreme Court",
    citation: "2024 INSC 782 • Criminal Appeal No. 2140 of 2024",
    court: "Supreme Court of India (New Delhi)",
    date: "22 Oct 2026",
    readTime: "5 min read",
    summary:
      "The Supreme Court reaffirmed that no criminal complaint under Section 138 of the Negotiable Instruments Act can be maintained if filed prior to the expiry of 15 full days from the recipient's receipt of the statutory demand notice.",
    ratioDecidendi:
      "Section 138(c) of the NI Act provides a statutory grace period of 15 days for the drawer to make payment after notice delivery. The cause of action arises only on the 16th day. A complaint filed on or before the 15th day is fundamentally premature and cannot be cured by subsequent delay.",
    citizenTakeaway:
      "Always verify postal speed post tracking delivery dates before filing a Section 138 case. Counting starts from the date of confirmed delivery, and the complaint must be presented within 30 days from day 16.",
    bench: "Hon'ble Mr. Justice B.R. Gavai & Hon'ble Mr. Justice Sandeep Mehta",
    actsReferred: [
      "Negotiable Instruments Act, 1881 (Section 138, 142)",
      "Code of Criminal Procedure, 1973 (Section 190, 200)",
    ],
    fullContent: [
      "The Supreme Court set aside an order of the High Court which had refused to quash a cheque dishonour complaint filed on the 14th day of notice service.",
      "The Apex Court reiterated that penal provisions creating strict liability must be strictly construed. Since criminal sanction attaches upon dishonour coupled with failure to pay within 15 days, no offence is completed until the last minute of the 15th day expires.",
    ],
    actionChecklist: [
      "Send statutory demand notice via Registered Post / Speed Post with Acknowledgment Due within 30 days of bank return memo.",
      "Download official India Post Delivery Confirmation report reflecting exact delivery timestamp.",
      "Calculate 15 clear days from the delivery date before submitting criminal complaint before the Judicial First Class Magistrate.",
    ],
  },
  {
    id: "art-3",
    title: "New Criminal Laws (BNS, BNSS & BSA): Citizen's Comprehensive Guide to Zero FIR and Digital Summons",
    category: "bns",
    categoryLabel: "Criminal Law & BNS",
    citation: "Statutory Directive • BNSS 2023 Sec 173(1) & BSA Sec 63",
    court: "Ministry of Law & Justice / All India Enforcement",
    date: "18 Oct 2026",
    readTime: "6 min read",
    summary:
      "With the operationalization of the Bharatiya Nyaya Sanhita (BNS) and Bharatiya Nagarik Suraksha Sanhita (BNSS), citizens possess enforceable rights to file Zero FIRs at any police station and receive verified digital copies of case diary records.",
    ratioDecidendi:
      "Under Section 173(1) BNSS, every police station officer is legally bound to record first information of a cognizable offence irrespective of jurisdictional bounds, assign a Zero FIR number, and transmit the case file electronically to the jurisdictional station within 24 hours.",
    citizenTakeaway:
      "If you are a victim of theft, assault, or cyber fraud away from your residence, any police station must register your FIR without directing you to another station. You are entitled to a free digital copy immediately.",
    bench: "Statutory Law Guidelines",
    actsReferred: [
      "Bharatiya Nyaya Sanhita, 2023 (BNS)",
      "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
      "Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
    ],
    fullContent: [
      "The new criminal procedure framework explicitly recognizes electronic reporting and mandates mandatory audio-video recording during search, seizure, and scene mahazar preparation.",
      "Preliminary inquiry is restricted to a maximum of 14 days for offences punishable between 3 to 7 years imprisonment before FIR registration, preventing prolonged arbitrary delays.",
    ],
    actionChecklist: [
      "Demand an official Zero FIR receipt if registering an incident outside the local jurisdiction.",
      "Request a signed e-FIR printout or SMS/WhatsApp confirmation link with the station diary number.",
      "Ensure forensic search and seizure of mobile devices or evidence is carried out with videography as required under Section 105 BNSS.",
    ],
  },
  {
    id: "art-4",
    title: "K-RERA Ruling: Real Estate Promoters Liable for Monthly Delay Interest If Occupancy Certificate Exceeds 60 Days",
    category: "property",
    categoryLabel: "Property & Real Estate",
    citation: "Order No. K-RERA/AD/2026/089 • Kerala RERA Appellate Bench",
    court: "Kerala Real Estate Regulatory Authority (Thiruvananthapuram)",
    date: "15 Oct 2026",
    readTime: "3 min read",
    summary:
      "In a decisive order protecting apartment buyers in Kochi and Kozhikode, K-RERA has ruled that developers cannot force handover of unfinished flats without an Occupancy Certificate and must pay monthly interest for every delayed month.",
    ratioDecidendi:
      "Section 18 of the Real Estate (Regulation and Development) Act, 2016 obligates promoters to pay interest at SBI MCLR + 2% per annum on the total amount received from the allottee for every month of delay until the grant of the statutory Occupancy Certificate by the municipality.",
    citizenTakeaway:
      "Homebuyers are not obligated to take possession or pay remaining maintenance instalments until the builder produces a genuine municipal Occupancy Certificate. Delay interest can be claimed through online RERA petition.",
    bench: "Hon'ble Chairman P.H. Kurian & Member Legal",
    actsReferred: [
      "Real Estate (Regulation and Development) Act, 2016 (Section 18, 19)",
      "Kerala Municipality Building Rules, 2019",
    ],
    fullContent: [
      "The authority dismissed builder arguments that shortage of sand or delayed municipal water connections constituted force majeure.",
      "The ruling mandates that all builders registered under K-RERA must upload quarterly project progress photographs and municipal clearance statuses to the public portal.",
    ],
    actionChecklist: [
      "Verify builder's registered project status on rera.kerala.gov.in.",
      "Inspect the sanctioned plan and municipal Occupancy Certificate before taking possession keys.",
      "File online Form M before the Adjudicating Officer if possession exceeds the agreement deadline.",
    ],
  },
  {
    id: "art-5",
    title: "Supreme Court: Daughters Have Equal Coparcenary Rights by Birth, Father's Date of Death Immaterial",
    category: "sc",
    categoryLabel: "Supreme Court",
    citation: "2020 (9) SCC 1 • Vineeta Sharma v. Rakesh Sharma Affirmation",
    court: "Supreme Court of India (3-Judge Bench)",
    date: "10 Oct 2026",
    readTime: "5 min read",
    summary:
      "Revisiting key partition litigation principles, the Supreme Court confirmed that daughters born before or after the 2005 amendment have identical coparcenary rights to sons in ancestral properties.",
    ratioDecidendi:
      "The coparcenary right conferred upon a daughter by Section 6 of the Hindu Succession Act, 1956 is by birth and not by succession. The survival of the father on the date of commencement of the 2005 Amendment Act is not a requisite condition.",
    citizenTakeaway:
      "Daughters have equal ancestral property shares. Any family partition or settlement executed without the consent of married or unmarried daughters after 20 December 2004 can be challenged in a civil partition suit.",
    bench: "Hon'ble Mr. Justice Arun Mishra, Hon'ble Mr. Justice S. Abdul Nazeer & Hon'ble Mr. Justice M.R. Shah",
    actsReferred: [
      "Hindu Succession Act, 1956 (Section 6)",
      "Hindu Succession (Amendment) Act, 2005",
      "Code of Civil Procedure, 1908 (Order XX Rule 18)",
    ],
    fullContent: [
      "The Supreme Court clarified that partition is a declared state of law. A preliminary decree does not bring about final partition until a final decree is drawn by metes and bounds.",
      "Consequently, daughters can claim their equal share in pending partition suits even if the suit was instituted decades prior to the 2005 legislative enactment.",
    ],
    actionChecklist: [
      "Obtain certified copies of ancestral property title deeds, Encumbrance Certificates (EC), and prior family partition deeds.",
      "Issue legal demand notice to other coparceners seeking amicable partition by metes and bounds.",
      "Institute a regular civil suit for partition before the competent Subordinate Judge / Munsiff Court.",
    ],
  },
  {
    id: "art-6",
    title: "Consumer Protection Act 2019: E-Commerce Portals Held Jointly Liable for Defective Goods & Dark Patterns",
    category: "consumer",
    categoryLabel: "Consumer Rights",
    citation: "Appeal No. 112/2026 • National Consumer Disputes Redressal Commission",
    court: "National Consumer Disputes Redressal Commission (New Delhi)",
    date: "04 Oct 2026",
    readTime: "4 min read",
    summary:
      "NCDRC has held that e-commerce platforms cannot escape product liability claims under the guise of being passive intermediaries if they curate listings, handle payment gateways, or employ deceptive interface designs.",
    ratioDecidendi:
      "Under Section 84 & 86 of the Consumer Protection Act 2019, an electronic commerce platform is liable for product defect or unfair trade practice where it exercises influence over inventory, delivery schedules, or warranties.",
    citizenTakeaway:
      "Citizens experiencing refusal of refunds for damaged electronic goods or unauthorized subscriptions can file online consumer cases via the e-Daakhil portal without physical court attendance.",
    bench: "Hon'ble Presiding Member & Technical Member",
    actsReferred: [
      "Consumer Protection Act, 2019 (Section 2(47), 84, 86)",
      "Consumer Protection (E-Commerce) Rules, 2020",
    ],
    fullContent: [
      "The Commission penalised an online marketplace for failing to refund a consumer whose purchased solar inverter failed within the manufacturer warranty period.",
      "The judgment establishes that marketplaces must maintain verified seller records and provide full grievance officer contacts on every invoice.",
    ],
    actionChecklist: [
      "Preserve order invoices, delivery slips, unboxing videos, and chat transcripts with customer support.",
      "Issue a 7-day formal consumer grievance notice via email to the platform's designated Grievance Officer.",
      "File a complaint on the official National Consumer Helpline (1915) or e-Daakhil portal (edaakhil.nic.in).",
    ],
  },
];

export function NewsAndArticlesView() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArticle, setActiveArticle] = useState<LegalArticle | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(["art-1", "art-3"]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyCitation = (article: LegalArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${article.title}\nCitation: ${article.citation}\nCourt: ${article.court}\nRatio: ${article.ratioDecidendi}`);
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredArticles = useMemo(() => {
    return ARTICLES_DATA.filter((item) => {
      const matchesCat =
        selectedCategory === "all"
          ? true
          : selectedCategory === "bookmarked"
          ? bookmarkedIds.includes(item.id)
          : item.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.citation.toLowerCase().includes(q) ||
        item.court.toLowerCase().includes(q) ||
        item.ratioDecidendi.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery, bookmarkedIds]);

  const featuredArticle = ARTICLES_DATA[0];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shadow-xs">
              <Newspaper className="w-4 h-4" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
              News and Articles
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500">
            Landmark Kerala High Court &amp; Supreme Court rulings, plain-language citizen guides, and statutory updates
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rulings, acts, citations..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white text-xs cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Featured Landmark Ruling Hero Banner */}
      {selectedCategory === "all" && !searchQuery && (
        <div
          onClick={() => setActiveArticle(featuredArticle)}
          className="p-6 sm:p-8 rounded-3xl bg-black text-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-all relative overflow-hidden group"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-800 text-zinc-200 border border-zinc-700">
                FEATURED LANDMARK RULING
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {featuredArticle.date} • {featuredArticle.readTime}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => toggleBookmark(featuredArticle.id, e)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
                title={bookmarkedIds.includes(featuredArticle.id) ? "Remove Bookmark" : "Bookmark Article"}
              >
                <Bookmark
                  className={`w-4 h-4 ${bookmarkedIds.includes(featuredArticle.id) ? "fill-white text-white" : ""}`}
                />
              </button>
              <button
                type="button"
                onClick={(e) => handleCopyCitation(featuredArticle, e)}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedId === featuredArticle.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedId === featuredArticle.id ? "Copied" : "Cite"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 max-w-4xl">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:underline underline-offset-4 decoration-zinc-500">
              {featuredArticle.title}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {featuredArticle.summary}
            </p>
          </div>

          {/* Legal Ratio Callout Box */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              <Scale className="w-3.5 h-3.5 text-zinc-300" />
              <span>Core Ratio Decidendi</span>
            </div>
            <p className="text-xs text-zinc-200 font-serif italic leading-relaxed">
              "{featuredArticle.ratioDecidendi}"
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {featuredArticle.actsReferred.map((act, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400"
                >
                  {act}
                </span>
              ))}
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
              <span>Read Full Breakdown</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar text-xs font-semibold">
        {[
          { id: "all", label: "All Articles" },
          { id: "khc", label: "Kerala High Court" },
          { id: "sc", label: "Supreme Court" },
          { id: "property", label: "Property & Revenue" },
          { id: "consumer", label: "Consumer Rights" },
          { id: "bns", label: "Criminal & BNS" },
          { id: "bookmarked", label: `Saved (${bookmarkedIds.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === tab.id
                ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.map((article) => {
          const isSaved = bookmarkedIds.includes(article.id);
          const isCopied = copiedId === article.id;

          return (
            <div
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4 cursor-pointer hover:border-black dark:hover:border-white transition-all group"
            >
              <div className="space-y-3">
                {/* Card Top Pill & Action Icons */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                    {article.categoryLabel}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(article.id, e)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                      title={isSaved ? "Remove Bookmark" : "Save Article"}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-black dark:fill-white text-black dark:text-white" : ""}`} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleCopyCitation(article, e)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                      title="Copy Citation"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Title & Metadata */}
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-black dark:text-white leading-snug group-hover:underline decoration-zinc-400">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>

                {/* Plain-Language Summary */}
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                  {article.summary}
                </p>

                {/* Citation Pill */}
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 truncate">
                  <span className="font-bold text-black dark:text-white mr-1.5">Docket:</span>
                  {article.citation}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-zinc-500">
                  {article.actsReferred[0] || "Court Directive"}
                </span>
                <span className="font-bold text-black dark:text-white inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Read Article</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredArticles.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2">
          <BookOpen className="w-8 h-8 mx-auto text-zinc-400" />
          <h4 className="text-sm font-bold text-black dark:text-white">No articles found</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search keywords or select "All Articles" to browse the full legal knowledge base.
          </p>
        </div>
      )}

      {/* Article Detail Reading Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header Bar */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-black">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
                  {activeArticle.categoryLabel}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {activeArticle.date} • {activeArticle.readTime}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => toggleBookmark(activeArticle.id, e)}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                  title="Bookmark"
                >
                  <Bookmark className={`w-4 h-4 ${bookmarkedIds.includes(activeArticle.id) ? "fill-black dark:fill-white text-black dark:text-white" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleCopyCitation(activeArticle, e)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-black dark:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === activeArticle.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedId === activeArticle.id ? "Copied" : "Cite"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveArticle(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-black dark:text-white tracking-tight leading-snug">
                  {activeArticle.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                  <span className="font-mono font-bold text-black dark:text-white">
                    {activeArticle.citation}
                  </span>
                  <span>•</span>
                  <span>{activeArticle.court}</span>
                  {activeArticle.bench && (
                    <>
                      <span>•</span>
                      <span>Bench: {activeArticle.bench}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Core Ratio Decidendi */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                  <Scale className="w-4 h-4" />
                  <span>Binding Ratio Decidendi (Key Legal Principle)</span>
                </div>
                <p className="text-xs sm:text-sm font-serif italic text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  "{activeArticle.ratioDecidendi}"
                </p>
              </div>

              {/* Citizen Plain-Language Takeaway */}
              <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-black dark:text-white" />
                  <span>What This Means For You (Citizen Takeaway)</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {activeArticle.citizenTakeaway}
                </p>
              </div>

              {/* Full Article Content */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Detailed Case Background &amp; Analysis
                </h4>
                {activeArticle.fullContent.map((para, pIdx) => (
                  <p key={pIdx} className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {/* Action Checklist for Citizens */}
              {activeArticle.actionChecklist && activeArticle.actionChecklist.length > 0 && (
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>Recommended Citizen Action Checklist</span>
                  </h4>
                  <div className="space-y-2">
                    {activeArticle.actionChecklist.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                        <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span className="leading-snug">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statutory Acts Referred */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Statutory Provisions &amp; Rules Cited
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeArticle.actsReferred.map((act, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
                    >
                      {act}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-xs shrink-0">
              <span className="text-zinc-500 font-mono text-[11px]">
                Wakheel Legal Intelligence Digest • Kerala High Court Certified
              </span>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer hover:opacity-90"
              >
                Close Article
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
