import { AcademyBook } from "../models/AcademyBook.js";
import { AcademyAssignment } from "../models/AcademyAssignment.js";
import { AcademySubmission } from "../models/AcademySubmission.js";
import { AcademyLectureAudio } from "../models/AcademyLectureAudio.js";
import { AcademyCornellNote } from "../models/AcademyCornellNote.js";

export const INITIAL_ACADEMY_BOOKS = [
  {
    customId: "book_bns_2023",
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
    downloadCount: 342,
    chapters: [
      {
        chapterNumber: 1,
        title: "Introduction to BNS 2023 & Abrogation of IPC 1860",
        pageNumber: 1,
        content: "The Bharatiya Nyaya Sanhita, 2023 (BNS) repeals and replaces the Indian Penal Code, 1860. The primary objective is to decolonize criminal jurisprudence and align statutory penal provisions with contemporary constitutional benchmarks.",
      },
      {
        chapterNumber: 2,
        title: "General Exceptions & Right of Private Defence",
        pageNumber: 42,
        content: "Sections 14 through 44 BNS codify General Exceptions. Section 34 BNS preserves the fundamental doctrine of Private Defence of Person and Property, subject to the test of proportionality.",
      },
    ],
  },
  {
    customId: "book_bnss_procedure",
    title: "Bharatiya Nagarik Suraksha Sanhita (BNSS 2023): Procedural Trial Manual",
    author: "Adv. Sunita Deshmukh",
    department: "Procedural Law",
    edition: "3rd Edition (2026)",
    fileSize: "18.6 MB",
    totalPages: 310,
    format: "PDF",
    coverGradient: "from-zinc-900 via-zinc-800 to-black",
    description:
      "Authoritative practical commentary on trial proceedings, forensic digital evidence mandates under Section 105, audio-video recording of search and seizure, and regular vs anticipatory bail reforms under Sections 480 and 482 BNSS.",
    uploadedBy: "Adv. Sunita Deshmukh (Visiting Lecturer & Senior Counsel)",
    downloadCount: 519,
    chapters: [
      {
        chapterNumber: 1,
        title: "Arrest Safeguards & Section 35 Guidelines",
        pageNumber: 1,
        content: "Section 35 BNSS mandates notice of appearance prior to arrest for offenses punishable with imprisonment up to 7 years, embedding Arnesh Kumar principles into statutory law.",
      },
    ],
  },
  {
    customId: "book_const_benchmarks",
    title: "Constitutional Benchmarks & Comparative Jurisprudence",
    author: "Prof. Dr. Rajesh Varma",
    department: "Constitutional Law",
    edition: "2026 Reference Edition",
    fileSize: "22.1 MB",
    totalPages: 412,
    format: "PDF",
    coverGradient: "from-amber-700 via-zinc-900 to-black",
    description:
      "Detailed analysis of landmark Constitution Bench rulings: Kesavananda Bharati, Maneka Gandhi, Puttaswamy Privacy Bench, and the evolving doctrine of proportionality in administrative state action.",
    uploadedBy: "Prof. Dr. Rajesh Varma (Senior Faculty)",
    downloadCount: 684,
    chapters: [
      {
        chapterNumber: 1,
        title: "Basic Structure Doctrine & Judicial Review",
        pageNumber: 1,
        content: "Judicial review under Articles 32 and 226 form an inviolable part of the Basic Structure. Parliament's amending power under Article 368 cannot abrogate the constitutional identity of the Republic.",
      },
    ],
  },
];

export const INITIAL_ACADEMY_ASSIGNMENTS = [
  {
    customId: "hw_bnss_480",
    title: "Regular Bail Petition Drafting under Section 480 of Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)",
    subject: "Criminal Procedure & Constitutional Bail",
    targetBatch: "CLAT 2027 Super-30 & Distance LL.B",
    badge: "DRAFTING MEMORIAL",
    instructions:
      "Draft a comprehensive Regular Bail Petition before the Court of Sessions citing Section 480 BNSS (erstwhile S. 439 CrPC), emphasizing fundamental right to personal liberty under Article 21, triple test satisfaction (no flight risk, no tampering, no witness intimidation), and non-compliance with Section 35 BNSS arrest guidelines (Arnesh Kumar v. State of Bihar).",
    faculty: "Prof. Dr. Rajesh Varma",
    dueDate: "Nov 26, 2026 • 11:59 PM",
    maxScore: 50,
    referenceRatio:
      "Bail is the rule, jail is the exception. Personal liberty under Article 21 can only be curtailed by a procedure that is right, just, and fair (Satender Kumar Antil v. CBI, 2022).",
  },
  {
    customId: "hw_ica_73",
    title: "Legal Advisory Memorandum: Remoteness of Damages under Section 73 Indian Contract Act 1872",
    subject: "Law of Contracts & Commercial Remedies",
    targetBatch: "Distance LL.B & Judicial Service Foundation",
    badge: "ADVISORY BRIEF",
    instructions:
      "Client is a logistics freight carrier sued for ₹25 Lakhs for delayed delivery of industrial machinery that caused an undisclosed export tender to lapse. Formulate a defense memorandum evaluating the two limbs of Hadley v. Baxendale codified in Section 73 ICA.",
    faculty: "Adv. Sunita Deshmukh",
    dueDate: "Nov 28, 2026 • 6:00 PM",
    maxScore: 50,
    referenceRatio:
      "Damages recoverable under Section 73 are confined to losses naturally arising in the usual course, or those within the contemplation of both parties at contract formation. Indirect and remote losses are statutorily barred.",
  },
];

export const INITIAL_ACADEMY_LECTURES = [
  {
    customId: "lec_bnss_bail",
    title: "Bail Jurisprudence under BNSS §480 vs CrPC §439: The Triple Test & Liberty Doctrine",
    subject: "Criminal Procedure (BNSS 2023)",
    targetBatch: "CLAT 2027 Super-30 & Distance LL.B",
    facultyName: "Prof. Dr. Rajesh Varma",
    duration: "18:42",
    durationSeconds: 1122,
    category: "Faculty Masterclass",
    statutoryNotes:
      "Detailed doctrinal comparison between Section 480 BNSS and Section 439 CrPC. Reconciling Section 35 mandatory arrest notices with custodial requirements.",
    keyCitations: [
      "Satender Kumar Antil v. CBI (2022) 10 SCC 51",
      "Arnesh Kumar v. State of Bihar (2014) 8 SCC 273",
      "Sanjay Chandra v. CBI (2012) 1 SCC 40",
    ],
    listensCount: 284,
    isFeatured: true,
  },
  {
    customId: "lec_basic_structure",
    title: "Constitutional Bench Jurisprudence: The Basic Structure Doctrine (Kesavananda Bharati)",
    subject: "Constitutional Law",
    targetBatch: "KLEE 2027 & NLU Foundation",
    facultyName: "Prof. Dr. Rajesh Varma",
    duration: "24:15",
    durationSeconds: 1455,
    category: "Faculty Masterclass",
    statutoryNotes:
      "Analytical breakdown of the 13-Judge Constitution Bench ruling. The boundary between legislative power and constituent power under Article 368.",
    keyCitations: [
      "Kesavananda Bharati v. State of Kerala (1973) 4 SCC 225",
      "Minerva Mills Ltd. v. Union of India (1980) 3 SCC 625",
      "Indira Nehru Gandhi v. Raj Narain (1975) Supp SCC 1",
    ],
    listensCount: 412,
    isFeatured: true,
  },
];

/**
 * Seeds initial Academy documents if collections are empty
 */
export async function seedAcademyFixtures() {
  // Intentionally left as a no-op so Academy starts clean without hardcoded seed cards.
}
