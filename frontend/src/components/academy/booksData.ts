export interface BookChapter {
  id: string;
  chapterNumber: number;
  title: string;
  pageNumber: number;
  content: string;
}

export interface LawBook {
  id: string;
  title: string;
  author: string;
  department: string;
  edition: string;
  fileSize: string;
  totalPages: number;
  format: "PDF" | "EPUB";
  coverGradient: string;
  description: string;
  uploadedBy: string;
  uploadedDate: string;
  downloadCount: number;
  chapters: BookChapter[];
}

export const INITIAL_BOOKS: LawBook[] = [
  {
    id: "book_bns_2023",
    title: "Principles of Criminal Jurisprudence & The Bharatiya Nyaya Sanhita (BNS 2023)",
    author: "Prof. Rajesh Varma",
    department: "Criminal Law",
    edition: "2026 Academic Edition",
    fileSize: "14.2 MB",
    totalPages: 248,
    format: "PDF",
    coverGradient: "from-amber-600 via-amber-700 to-zinc-950",
    description:
      "A comprehensive textbook analyzing the Bharatiya Nyaya Sanhita (BNS) 2023, comparing reformed sections with erstwhile IPC 1860, with detailed chapters on Section 69 deceitful promises, gender-neutral offences, and community service sentencing.",
    uploadedBy: "Prof. Rajesh Varma (Faculty of Criminal Law)",
    uploadedDate: "Nov 15, 2026",
    downloadCount: 342,
    chapters: [
      {
        id: "ch_bns_1",
        chapterNumber: 1,
        title: "Introduction to BNS 2023 & Abrogation of IPC 1860",
        pageNumber: 1,
        content: `The Bharatiya Nyaya Sanhita, 2023 (BNS) repeals and replaces the Indian Penal Code, 1860. The primary objective is to decolonize criminal jurisprudence and align statutory penal provisions with contemporary constitutional benchmarks.

Key Structural Changes:
1. Reorganization: Offenses are logically grouped; offenses against women and children are placed at the forefront in Chapter V (Sections 63-99).
2. Modern Sentencing Options: Community service has been introduced under Section 4(f) as a rehabilitative penal alternative for first-time petty offenses including minor theft and misconduct by a drunken person.
3. Enhanced Fines: Fines across bodily offenses and economic harms have been updated to reflect contemporary currency values.`,
      },
      {
        id: "ch_bns_2",
        chapterNumber: 2,
        title: "Section 69 — Sexual Intercourse by Deceitful Means vs Breach of Promise",
        pageNumber: 45,
        content: `Section 69 of the Bharatiya Nyaya Sanhita, 2023 penalizes sexual intercourse by employing deceitful means or making a false promise to marry.

Statutory Language:
"Whoever, by deceitful means or making by promise to marry unto a woman without any intention of fulfilling the same, and has sexual intercourse with her, such sexual intercourse not amounting to the offence of rape, shall be punished with imprisonment of either description for a term which may extend to ten years and shall also be liable to fine."

The Explanation provides:
"Deceitful means shall include the false promise of employment or promotion, inducement, or marrying after suppressing one's identity."

Judicial Interpretation:
In Pramod Suryabhoop Pawar v. State of Maharashtra (2019) 9 SCC 608 and Anurag Soni v. State of Chhattisgarh (2019) 10 SCC 660, the Supreme Court established the cardinal test:
- Breach of Promise: The accused genuinely intended to marry at inception, but subsequent familial opposition, social strife, or intervening circumstances caused a breakdown. This does not constitute an offence under S. 69.
- False Promise (Deceit): The accused had no intention whatsoever to marry from the very inception and fabricated the representation solely as a fraudulent catalyst to extract consent. This attracts Section 69.`,
      },
      {
        id: "ch_bns_3",
        chapterNumber: 3,
        title: "General Exceptions & Right of Private Defense (Sections 14-33)",
        pageNumber: 110,
        content: `General exceptions in criminal law absolve an accused of liability when the requisite mens rea is absent or when an overarching justification exists.

1. Act of Child (Section 20): Nothing is an offence which is done by a child under seven years of age (Doli incapax).
2. Right of Private Defence of Body and Property (Sections 34-44):
- Section 38: When the right of private defence of body extends to causing death (reasonable apprehension of death, grievous hurt, rape, or kidnapping).
- The defence is defensive, not punitive; force used must be proportional to the threat faced.`,
      },
      {
        id: "ch_bns_4",
        chapterNumber: 4,
        title: "Homicide & Bodily Offences: Section 103 BNS vs Section 300 IPC",
        pageNumber: 180,
        content: `Section 103 BNS consolidates the offence of murder, prescribing punishment of death or life imprisonment and fine.

Subsection (2) of Section 103 introduces a landmark provision penalizing mob lynching:
"When a group of five or more persons acting in concert commits murder on grounds of race, caste or community, sex, place of birth, language, personal belief or any other similar ground, each member of such group shall be punished with death or with imprisonment for life, and shall also be liable to fine."`,
      },
    ],
  },
  {
    id: "book_consti_2026",
    title: "Constitutional Law of India: Fundamental Rights & The Golden Triangle",
    author: "Adv. Sunita Deshmukh",
    department: "Constitutional Law",
    edition: "5th Revised Edition",
    fileSize: "18.6 MB",
    totalPages: 312,
    format: "PDF",
    coverGradient: "from-amber-600 via-amber-700 to-zinc-900",
    description:
      "Essential treatise for CLAT aspirants and Judicial Services candidates covering Articles 14, 19, and 21, the evolution of substantive due process in Maneka Gandhi, and the four-fold proportionality test in Puttaswamy.",
    uploadedBy: "Adv. Sunita Deshmukh (High Court Counsel)",
    uploadedDate: "Nov 12, 2026",
    downloadCount: 512,
    chapters: [
      {
        id: "ch_consti_1",
        chapterNumber: 1,
        title: "The Golden Triangle: Interplay of Articles 14, 19, and 21",
        pageNumber: 1,
        content: `In the early years of the Republic, A.K. Gopalan v. State of Madras (1950) adopted a siloed approach to fundamental rights, treating each article as an exclusive code.

This formalistic doctrine was conclusively overturned in R.C. Cooper v. Union of India (1970) (Bank Nationalization Case) and Maneka Gandhi v. Union of India (1978).

The Golden Triangle Doctrine:
Articles 14, 19, and 21 are not mutually exclusive; they form an organic trinity. Any state action depriving personal liberty under Article 21 must also satisfy the test of non-arbitrariness under Article 14 and the reasonable restrictions standard under Article 19.

"Procedure established by law" in Article 21 was judicially elevated to mean a procedure that is "just, fair, and reasonable", effectively introducing substantive due process into Indian constitutional jurisprudence.`,
      },
      {
        id: "ch_consti_2",
        chapterNumber: 2,
        title: "Right to Privacy & The Puttaswamy Proportionality Standard",
        pageNumber: 85,
        content: `In Justice K.S. Puttaswamy (Retd.) v. Union of India (2017) 10 SCC 1, a nine-judge Constitution Bench held that privacy is a fundamental right emanating from Article 21 and the freedoms guaranteed by Part III.

The Four-Prong Proportionality Test:
To survive judicial scrutiny, any state encroachment upon privacy must establish:
1. Legality: The invasion must have an express legislative statutory foundation (not mere executive instructions).
2. Legitimate State Aim: The purpose must further a constitutionally permissible public objective.
3. Proportionality (Suitability & Necessity): The measure must be rationally connected to the objective, and there must be no less-intrusive alternative available.
4. Balancing: The state must demonstrate that the public interest achieved outweighs the severity of the rights abridgement.`,
      },
      {
        id: "ch_consti_3",
        chapterNumber: 3,
        title: "Basic Structure Doctrine: Kesavananda Bharati to NJAC",
        pageNumber: 165,
        content: `The Basic Structure Doctrine establishes that Parliament's amending power under Article 368 is constituent but not unlimited. Parliament cannot amend the Constitution so as to alter or destroy its essential identity.

Landmark Milestones:
- Kesavananda Bharati v. State of Kerala (1973) 4 SCC 225: The 13-judge bench established that basic features (supremacy of the constitution, democratic republican form, secularism, separation of powers) are immune from constitutional amendment.
- Indira Nehru Gandhi v. Raj Narain (1975): Free and fair elections and judicial review affirmed as basic structure.
- Minerva Mills v. Union of India (1980): The balance between Fundamental Rights and Directive Principles is a basic feature.
- NJAC Case (2015): The Independence of the Judiciary and judicial primacy in appointments held to be part of the unamendable Basic Structure.`,
      },
      {
        id: "ch_consti_4",
        chapterNumber: 4,
        title: "Appellate & Extraordinary Writ Jurisdictions (Articles 32 & 226)",
        pageNumber: 240,
        content: `Dr. B.R. Ambedkar famously characterized Article 32 as the "heart and soul of the Constitution."

Types of Prerogative Writs:
1. Habeas Corpus: To produce the detained person and examine the legality of detention.
2. Mandamus: Command to a public authority to perform a mandatory statutory duty.
3. Prohibition: Issued by a superior court to prevent an inferior tribunal from exceeding jurisdiction.
4. Certiorari: Quashing orders passed by inferior courts/tribunals without jurisdiction or in violation of natural justice.
5. Quo Warranto: Challenging the title of a person holding a substantive public office without statutory qualification.`,
      },
    ],
  },
  {
    id: "book_clat_manual_2027",
    title: "Consortium CLAT & NLU Comprehensive Legal Aptitude Manual (2027)",
    author: "Adv. Meera Sen (AIR 34, NLSIU)",
    department: "CLAT & Entrance",
    edition: "2027 Exam Edition",
    fileSize: "12.8 MB",
    totalPages: 290,
    format: "PDF",
    coverGradient: "from-emerald-700 via-teal-800 to-slate-950",
    description:
      "Targeted handbook for cracking Consortium passage questions across Legal Reasoning, Contract Law (Section 73), Strict & Absolute Liability, and high-yield examination trap detection.",
    uploadedBy: "Adv. Meera Sen (CLAT Faculty & AIR 34)",
    uploadedDate: "Nov 18, 2026",
    downloadCount: 780,
    chapters: [
      {
        id: "ch_clat_1",
        chapterNumber: 1,
        title: "Mastering Legal Passage Reasoning & Principle-Fact Analysis",
        pageNumber: 1,
        content: `The CLAT examination tests comprehension and analytical legal reasoning rather than prior legal knowledge.

Golden Rules for Principle-Fact Questions:
1. The Principle is Supreme: Never import external personal knowledge or moral assumptions into the problem. Treat the principle provided in the passage as absolute truth.
2. Direct Causation: Check whether the breach of duty was the direct and proximate cause of the injury.
3. Trap of Remote Losses: Distinguish between ordinary damages (arising naturally) and remote or indirect damages which are non-recoverable under Section 73 ICA without express prior notice.`,
      },
      {
        id: "ch_clat_2",
        chapterNumber: 2,
        title: "Contract Law Essentials: Offer, Acceptance & Breach Damages",
        pageNumber: 72,
        content: `The Indian Contract Act, 1872 is grounded in the principle of consensus ad idem (meeting of the minds).

Key Provisions:
- Section 10: What agreements are contracts (free consent, competent parties, lawful consideration, and lawful object).
- Section 2(d): Consideration must move at the desire of the promisor (Durga Prasad v. Baldeo).
- Section 73 & Hadley v. Baxendale: Compensation is payable only for losses that naturally arose in the usual course of things, or which both parties contemplated at the time of making the contract.`,
      },
      {
        id: "ch_clat_3",
        chapterNumber: 3,
        title: "Law of Torts: Strict Liability vs Absolute Liability",
        pageNumber: 145,
        content: `In Rylands v. Fletcher (1868), the House of Lords established Strict Liability:
If a person brings onto their land and collects anything likely to do mischief if it escapes, they must keep it in at their peril, and are prima facie answerable for all the natural consequences of its escape.
Exceptions: Act of God (Vis Major), Consent of Plaintiff (Volenti non fit injuria), Statutory Authority, and Plaintiff's own fault.

The Indian Absolute Liability Doctrine (M.C. Mehta v. Union of India 1987):
Chief Justice P.N. Bhagwati held that an enterprise engaged in a hazardous or inherently dangerous industry owes an absolute and non-delegable duty to the community. No exceptions (such as Act of God or third-party sabotage) can be claimed.`,
      },
      {
        id: "ch_clat_4",
        chapterNumber: 4,
        title: "High-Yield Speed Drills & 120-Minute Time Allocation",
        pageNumber: 220,
        content: `Recommended CLAT 120-Minute Strategy:
- Legal Reasoning (32-35 Qs): 35 Minutes
- Current Affairs & GK (28-32 Qs): 15 Minutes
- English Language (22-26 Qs): 20 Minutes
- Logical Reasoning (22-26 Qs): 25 Minutes
- Quantitative Techniques (10-12 Qs): 20 Minutes
- Buffer / Review: 5 Minutes

Never linger on a single ambiguous question for more than 75 seconds. Mark for review and proceed.`,
      },
    ],
  },
  {
    id: "book_cpc_guide_2026",
    title: "Civil Procedure Code (CPC 1908) & Pleadings Practice Guide",
    author: "Adv. K. R. Nambiar",
    department: "Civil Law & Litigation",
    edition: "4th Practitioner Edition",
    fileSize: "16.5 MB",
    totalPages: 275,
    format: "PDF",
    coverGradient: "from-rose-700 via-pink-800 to-zinc-950",
    description:
      "A practical litigation reference for distance law scholars and aspiring trial advocates, detailing plaint structures, Res Judicata under Section 11, and Order 39 interim injunctions.",
    uploadedBy: "Adv. K. R. Nambiar (Senior Advocate)",
    uploadedDate: "Nov 08, 2026",
    downloadCount: 289,
    chapters: [
      {
        id: "ch_cpc_1",
        chapterNumber: 1,
        title: "Res Judicata & Constructive Res Judicata (Section 11)",
        pageNumber: 1,
        content: `Section 11 of the Code of Civil Procedure, 1908 embodies the Latin maxim "Interest reipublicae ut sit finis litium" (It is in the interest of the State that there should be an end to litigation) and "Nemo debet bis vexari pro una et eadem causa" (No one should be vexed twice for the same cause).

Essential Conditions for Res Judicata:
1. The matter directly and substantially in issue in the subsequent suit must have been directly and substantially in issue in the former suit.
2. The parties in both suits must be the same or litigating under the same title.
3. The former suit must have been heard and finally decided by a court of competent jurisdiction.

Explanation IV: Constructive Res Judicata:
Any matter which might and ought to have been made ground of defence or attack in such former suit shall be deemed to have been a matter directly and substantially in issue in such suit.`,
      },
      {
        id: "ch_cpc_2",
        chapterNumber: 2,
        title: "Temporary Injunctions & Interlocutory Orders (Order 39 Rules 1 & 2)",
        pageNumber: 90,
        content: `An injunction is a judicial process whereby a party is ordered to refrain from doing or to do a particular act.

The Three-Prong Test for Temporary Injunction:
1. Prima Facie Case: The plaintiff must demonstrate a bona fide contention with substantial probability of success.
2. Irreparable Injury: The plaintiff will suffer substantial injury that cannot be adequately compensated by pecuniary damages if the injunction is refused.
3. Balance of Convenience: The comparative mischief or inconvenience caused to the plaintiff by withholding injunction exceeds that caused to the defendant by granting it.`,
      },
      {
        id: "ch_cpc_3",
        chapterNumber: 3,
        title: "Drafting Plaints & Written Statements (Order 6 & Order 7)",
        pageNumber: 175,
        content: `Fundamental Rules of Pleading (Order 6 Rule 2):
1. Plead facts, not law.
2. Plead material facts only.
3. Do not plead the evidence by which facts are to be proved (Facta probanda, not facta probantia).
4. State facts concisely and in chronological order in numbered paragraphs.`,
      },
    ],
  },
];

const STORAGE_KEY = "wakheel_academy_books_catalog";

export function getStoredBooks(): LawBook[] {
  if (typeof window === "undefined") return INITIAL_BOOKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BOOKS;
  } catch {
    return INITIAL_BOOKS;
  }
}

export function saveBook(newBook: LawBook): LawBook[] {
  if (typeof window === "undefined") return [newBook, ...INITIAL_BOOKS];
  try {
    const current = getStoredBooks();
    const updated = [newBook, ...current.filter((b) => b.id !== newBook.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [newBook, ...INITIAL_BOOKS];
  }
}

export function deleteBook(bookId: string): LawBook[] {
  if (typeof window === "undefined") return INITIAL_BOOKS;
  try {
    const current = getStoredBooks();
    const updated = current.filter((b) => b.id !== bookId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return INITIAL_BOOKS;
  }
}

export function incrementDownloadCount(bookId: string): LawBook[] {
  if (typeof window === "undefined") return INITIAL_BOOKS;
  try {
    const current = getStoredBooks();
    const updated = current.map((b) =>
      b.id === bookId ? { ...b, downloadCount: b.downloadCount + 1 } : b
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return INITIAL_BOOKS;
  }
}

export function downloadBookFile(book: LawBook) {
  if (typeof window === "undefined") return;

  const content = `================================================================================
${book.title.toUpperCase()}
================================================================================
Author / Faculty: ${book.author}
Department: ${book.department}
Edition: ${book.edition}
Format: ${book.format} • Total Pages: ${book.totalPages}
Published By: ${book.uploadedBy}
Date: ${book.uploadedDate}

--------------------------------------------------------------------------------
SYLLABUS & OVERVIEW
--------------------------------------------------------------------------------
${book.description}

--------------------------------------------------------------------------------
TABLE OF CONTENTS & CHAPTER TRANSCRIPTS
--------------------------------------------------------------------------------
${book.chapters
  .map(
    (ch) => `
================================================================================
CHAPTER ${ch.chapterNumber}: ${ch.title} (Page ${ch.pageNumber})
================================================================================
${ch.content}
`
  )
  .join("\n")}

--------------------------------------------------------------------------------
Published via Wakheel Legal Academy Courseware Repository
All Rights Reserved • Verified Faculty Manuscript
================================================================================
`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${book.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_Wakheel_Academy.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
