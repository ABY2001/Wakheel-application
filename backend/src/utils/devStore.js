import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../../data");

const ensureFile = (filename, defaultContent = []) => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
  }
  return filePath;
};

const readFile = (filename, defaultContent = []) => {
  const filePath = ensureFile(filename, defaultContent);
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "[]");
  } catch {
    return defaultContent;
  }
};

const writeFile = (filename, data) => {
  const filePath = ensureFile(filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// ============================================================================
// DEFAULT SEED DUMMY DATA FOR CITIZEN PORTAL
// ============================================================================
const DEFAULT_MATTERS = [
  {
    _id: "mat_wpc_19482",
    citizenId: "default_citizen",
    advocateName: "Adv. Meera Krishnan",
    matterTitle: "WP(C) 19482/2024 — Gopakumar v. Kerala State Electricity Board & Anr.",
    matterType: "Writ Petition (Civil)",
    caseNumber: "WP(C) 19482/2024",
    cnrNumber: "KLHC01-019482-2024",
    courtForum: "High Court of Kerala (Ernakulam)",
    courtHall: "Court Hall 2A (Division Bench)",
    status: "active",
    nextHearingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    statutoryActs: ["Indian Telegraph Act, 1885 (Section 10 & 16)", "Electricity Act, 2003", "Article 226 of the Constitution of India"],
    timeline: [
      { date: "18-Oct-2024", title: "Writ Petition (Civil) E-Filing Completed", remarks: "Verified true copy grounds submitted with High Court Registry", stage: "Completed" },
      { date: "22-Oct-2024", title: "Notice Before Admission Issued", remarks: "Division bench directed standing counsel to file counter-affidavit within 10 days", stage: "Completed" },
      { date: "26-Oct-2024", title: "Counter-Affidavit Filed by KSEB Executive Engineer", remarks: "Board contends route was surveyed as per gazette scheme", stage: "Completed" },
      { date: "02-Nov-2024", title: "Interim Stay Hearing Listed", remarks: "Listed as Item #14 in Court Hall 2A before Bench 2A", stage: "Upcoming" },
    ],
    totalFeesBilled: 25000,
    feesPaid: 15000,
  },
  {
    _id: "mat_os_412",
    citizenId: "default_citizen",
    advocateName: "Adv. Rajesh V. Varma",
    matterTitle: "OS 412/2023 — Gopakumar v. Varghese Builders & Developers",
    matterType: "Civil Appeal",
    caseNumber: "OS 412/2023",
    cnrNumber: "KLER02-000412-2023",
    courtForum: "Sub Court, Ernakulam",
    courtHall: "Court Hall 1",
    status: "notice_issued",
    nextHearingDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString(),
    statutoryActs: ["Specific Relief Act, 1963", "Transfer of Property Act, 1882"],
    timeline: [
      { date: "10-Dec-2023", title: "Plaint Filed for Injunction & Title Demarcation", remarks: "Suit registered under Section 38 of Specific Relief Act", stage: "Completed" },
      { date: "15-Jan-2024", title: "Advocate Commissioner Appointed", remarks: "Advocate Commissioner inspected property and prepared site sketch", stage: "Completed" },
      { date: "18-Nov-2024", title: "Defendant Written Statement Hearing", remarks: "Final opportunity granted to respondents", stage: "Upcoming" },
    ],
    totalFeesBilled: 40000,
    feesPaid: 20000,
  },
];

const DEFAULT_GRIEVANCES = [
  {
    _id: "grv_101",
    citizenId: "default_citizen",
    title: "Drawing 110kV Transmission Line Across Rubber Plantation Without Prior Notice",
    description: "KSEB contractors entered agricultural property in Kanjirappally Village and initiated tree clearing for 110kV overhead line without serving mandatory notice under Section 10/16 of Telegraph Act.",
    category: "Property & Land Disputes",
    jurisdictionDistrict: "Ernakulam",
    preferredCourt: "High Court of Kerala (Ernakulam)",
    urgencyLevel: "High (Upcoming Deadline)",
    status: "matter_opened",
    aiTriage: {
      summary: "Violates procedural protections under Indian Telegraph Act 1885 and Kerala High Court ruling in Valsamma v. KSEB. Unilateral entry without District Magistrate order under Section 16 is actionable.",
      applicableActs: [
        "Indian Telegraph Act, 1885 (Section 10 & 16)",
        "Electricity Act, 2003",
        "Kerala Land Reforms Act, 1963",
        "Article 226 of the Constitution of India",
      ],
      suggestedRemedies: [
        "File Urgent Writ Petition (Civil) seeking interim stay on tree felling",
        "Serve legal notice to Executive Engineer, Transmission Division",
        "Apply for District Court determination of land diminution and yield loss compensation",
      ],
      estimatedCourtFee: "₹1,500 - ₹2,500 (High Court Writ Stamp & Process Fees)",
      recommendedSpecialization: "Constitutional Writs & Land Reforms Counsel",
      jurisdictionForum: "High Court of Kerala (Ernakulam)",
      riskScore: "High",
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_CONSULTATIONS = [
  {
    _id: "con_901",
    citizenId: "default_citizen",
    advocateName: "Adv. Meera Krishnan",
    consultationType: "video",
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    timeSlot: "10:30 AM - 11:15 AM",
    durationMinutes: 45,
    meetingLink: "https://meet.wakheel.law/chambers-krishnan-09",
    subject: "Discussion on WP(C) 19482/2024 Counter-Affidavit Rejoinder & Precedent Citations",
    feeAmount: 1500,
    paymentStatus: "paid",
    status: "scheduled",
  },
  {
    _id: "con_902",
    citizenId: "default_citizen",
    advocateName: "Adv. Rajesh V. Varma",
    consultationType: "chamber",
    scheduledDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    timeSlot: "04:00 PM - 04:45 PM",
    durationMinutes: 45,
    meetingLink: "",
    subject: "Initial Strategy Consultation on Sub Court OS 412/2023 Property Demarcation",
    feeAmount: 2500,
    paymentStatus: "paid",
    status: "completed",
  },
];

const DEFAULT_DOCUMENTS = [
  {
    _id: "doc-01",
    id: "doc-01",
    citizenId: "default_citizen",
    title: "WPC 19482/2024 Writ Petition Paperbook",
    name: "WPC_19482_2024_Writ_Petition_Paperbook.pdf",
    fileName: "WPC_19482_2024_Writ_Petition_Paperbook.pdf",
    category: "Pleading",
    subType: "all",
    matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    matterId: "mat_wpc_19482",
    size: "4.8 MB",
    fileSize: "4.8 MB",
    uploadDate: "14 Jun 2024",
    isSigned: true,
    pages: 42,
    sha256Hash: "sha256:8f4b23c8a91d0e41785cbfa7192",
    hash: "sha256:8f4b23c8a91d0e41785cbfa7192",
    details: "High Court verified true copy writ petition with Annexures P-1 to P-8.",
    filingStatus: "Approved & Filed with Court Registry",
    advocateName: "Adv. Meera Krishnan",
  },
  {
    _id: "doc-02",
    id: "doc-02",
    citizenId: "default_citizen",
    title: "Interim Stay Order Bench 2A High Court",
    name: "Interim_Stay_Order_Bench_2A_High_Court.pdf",
    fileName: "Interim_Stay_Order_Bench_2A_High_Court.pdf",
    category: "Court Order",
    subType: "all",
    matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    matterId: "mat_wpc_19482",
    size: "1.2 MB",
    fileSize: "1.2 MB",
    uploadDate: "16 Oct 2026",
    isSigned: true,
    pages: 3,
    sha256Hash: "sha256:3a91b48f9024bc68e10dca27189",
    hash: "sha256:3a91b48f9024bc68e10dca27189",
    details: "Daily order granting extension of interim stay against realignment of 11KV lines.",
    filingStatus: "Approved & Filed with Court Registry",
    advocateName: "Adv. Meera Krishnan",
  },
  {
    _id: "doc-03",
    id: "doc-03",
    citizenId: "default_citizen",
    title: "High Court Certified True Copy Decree",
    name: "High_Court_Certified_True_Copy_Decree.pdf",
    fileName: "High_Court_Certified_True_Copy_Decree.pdf",
    category: "CTC",
    subType: "certified-true-copies",
    matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    matterId: "mat_wpc_19482",
    size: "2.1 MB",
    fileSize: "2.1 MB",
    uploadDate: "18 Oct 2024",
    isSigned: true,
    pages: 5,
    sha256Hash: "sha256:92cb1f570081d4a0e98c61fa348",
    hash: "sha256:92cb1f570081d4a0e98c61fa348",
    details: "Official Certified True Copy issued by Assistant Registrar (Judicial), Kerala High Court. CTC No: HC-CTC-2024-8910.",
    filingStatus: "Approved & Filed with Court Registry",
    advocateName: "Adv. Meera Krishnan",
  },
  {
    _id: "doc-04",
    id: "doc-04",
    citizenId: "default_citizen",
    title: "Sub Court Demarcation Decree CTC",
    name: "Sub_Court_Demarcation_Decree_CTC.pdf",
    fileName: "Sub_Court_Demarcation_Decree_CTC.pdf",
    category: "CTC",
    subType: "certified-true-copies",
    matter: "OS 412/2023 — Gopakumar v. Varghese",
    matterId: "mat-03",
    size: "1.8 MB",
    fileSize: "1.8 MB",
    uploadDate: "12 Jan 2024",
    isSigned: true,
    pages: 4,
    sha256Hash: "sha256:5ef1092ab7c41908d32b84ac125",
    hash: "sha256:5ef1092ab7c41908d32b84ac125",
    details: "Sub Court Ernakulam certified extract bearing judicial adhesive stamps of ₹50.",
    filingStatus: "Approved & Filed with Court Registry",
    advocateName: "Adv. Meera Krishnan",
  },
  {
    _id: "doc-05",
    id: "doc-05",
    citizenId: "default_citizen",
    title: "Commercial Lease Agreement Ernakulam",
    name: "Commercial_Lease_Agreement_Ernakulam.pdf",
    fileName: "Commercial_Lease_Agreement_Ernakulam.pdf",
    category: "Contract",
    subType: "contracts",
    matter: "Corporate Legal Affairs",
    size: "1.5 MB",
    fileSize: "1.5 MB",
    uploadDate: "05 Mar 2024",
    isSigned: true,
    pages: 14,
    sha256Hash: "sha256:7c491da823bf108ec92451bc09a",
    hash: "sha256:7c491da823bf108ec92451bc09a",
    details: "Registered 3-year commercial property lease deed with indemnity and arbitration clause.",
    filingStatus: "Ready in Vault",
    advocateName: "Adv. Meera Krishnan",
  },
  {
    _id: "doc-06",
    id: "doc-06",
    citizenId: "default_citizen",
    title: "Software Development MSA NDA Executed",
    name: "Software_Development_MSA_NDA_Executed.pdf",
    fileName: "Software_Development_MSA_NDA_Executed.pdf",
    category: "Contract",
    subType: "contracts",
    matter: "ARB/NCLT/KOCHI/2024/041",
    matterId: "mat-02",
    size: "950 KB",
    fileSize: "950 KB",
    uploadDate: "10 Jul 2024",
    isSigned: true,
    pages: 9,
    sha256Hash: "sha256:d12c8a49e50f3b890a214fe6881",
    hash: "sha256:d12c8a49e50f3b890a214fe6881",
    details: "Master Services Agreement executed between Malabar Infotech and Coastal Logistics.",
    filingStatus: "Ready in Vault",
    advocateName: "Adv. Meera Krishnan",
  },
  {
    _id: "doc-07",
    id: "doc-07",
    citizenId: "default_citizen",
    title: "High Court EFiling Registry Receipt",
    name: "High_Court_EFiling_Registry_Receipt.pdf",
    fileName: "High_Court_EFiling_Registry_Receipt.pdf",
    category: "Filing Receipt",
    subType: "document-filing",
    matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    matterId: "mat_wpc_19482",
    size: "420 KB",
    fileSize: "420 KB",
    uploadDate: "14 Jun 2024",
    isSigned: true,
    pages: 1,
    sha256Hash: "sha256:2fa810bc931e508ab219c481944",
    hash: "sha256:2fa810bc931e508ab219c481944",
    details: "eCourts e-filing acknowledgment receipt. Filing No: EF/KLHC/2024/19482. Scrutiny cleared.",
    filingStatus: "Approved & Filed with Court Registry",
    advocateName: "Adv. Meera Krishnan",
  },
  {
    _id: "filing-01",
    id: "filing-01",
    citizenId: "default_citizen",
    title: "Survey Sketch Re-survey Plan Block 14",
    name: "Survey_Sketch_Re-survey_Plan_Block_14.pdf",
    fileName: "Survey_Sketch_Re-survey_Plan_Block_14.pdf",
    category: "Survey Sketch / Site Map",
    subType: "document-filing",
    matter: "WP(C) 19482/2024 — Gopakumar Nambiar v. KSEB",
    matterId: "mat_wpc_19482",
    size: "2.4 MB",
    fileSize: "2.4 MB",
    uploadDate: "Today, 11:15 AM",
    date: "Today, 11:15 AM",
    isSigned: true,
    pages: 2,
    sha256Hash: "sha256:4f1a239b8c0d12e457f901ab234",
    hash: "sha256:4f1a239b8c0d12e457f901ab234",
    details: "Authenticated village officer sketch showing registered holding demarcations.",
    filingStatus: "Transmitted to Advocate",
    status: "Transmitted to Advocate",
    advocateName: "Adv. Meera Krishnan",
    advocateId: "adv_1",
    remarks: "Kindly include this as Annexure P-9 to the rejoinder affidavit.",
  },
  {
    _id: "filing-02",
    id: "filing-02",
    citizenId: "default_citizen",
    title: "Counter Affidavit Objections Rejoinder",
    name: "Counter_Affidavit_Objections_Rejoinder.docx",
    fileName: "Counter_Affidavit_Objections_Rejoinder.docx",
    category: "Pleading Draft / Affidavit Counter",
    subType: "document-filing",
    matter: "WP(C) 19482/2024 — Gopakumar Nambiar v. KSEB",
    matterId: "mat_wpc_19482",
    size: "1.1 MB",
    fileSize: "1.1 MB",
    uploadDate: "18 Oct 2024",
    date: "18 Oct 2024",
    isSigned: false,
    pages: 8,
    sha256Hash: "sha256:7bc012398a4d5e6f1a2b3c4d5e6",
    hash: "sha256:7bc012398a4d5e6f1a2b3c4d5e6",
    details: "Draft rejoinder answering allegations raised in KSEB executive engineer counter.",
    filingStatus: "Under Counsel Review",
    status: "Under Counsel Review",
    advocateName: "Adv. Meera Krishnan",
    advocateId: "adv_1",
    remarks: "Drafted rebuttal for senior counsel review.",
  },
  {
    _id: "filing-03",
    id: "filing-03",
    citizenId: "default_citizen",
    title: "Bank Memo Original Debit Advice",
    name: "Bank_Memo_Original_Debit_Advice.pdf",
    fileName: "Bank_Memo_Original_Debit_Advice.pdf",
    category: "Bank Statement / Financial Records",
    subType: "document-filing",
    matter: "ARB/NCLT/KOCHI/2024/041 — Malabar Infotech",
    matterId: "mat-02",
    size: "820 KB",
    fileSize: "820 KB",
    uploadDate: "14 Oct 2024",
    date: "14 Oct 2024",
    isSigned: true,
    pages: 1,
    sha256Hash: "sha256:99a8b7c6d5e4f3a2b1c0d9e8f7a",
    hash: "sha256:99a8b7c6d5e4f3a2b1c0d9e8f7a",
    details: "Bank memo confirming non-clearance of company settlement cheque.",
    filingStatus: "Accepted for Drafting",
    status: "Accepted for Drafting",
    advocateName: "Adv. Meera Krishnan",
    advocateId: "adv_1",
    remarks: "Required for petition under Section 9 of IBC.",
  },
];

const DEFAULT_NOTICES = [
  {
    _id: "not_701",
    id: "not_701",
    citizenId: "default_citizen",
    noticeType: "Cheque Bounce Demand (Sec 138 NI Act)",
    title: "Statutory Demand Notice for Dishonoured Cheque of ₹4,50,000",
    senderName: "Gopakumar Nambiar",
    recipientName: "Coastal Logistics & Infra Ltd",
    recipientAddress: "Plot 12, Port Trust Road, Willingdon Island, Kochi 682003",
    claimAmount: "₹4,50,000",
    statutoryNoticeDays: 15,
    dispatchDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    speedPostTrackingNumber: "EK948102391IN",
    deliveryStatus: "Item Delivered",
    daysRemaining: 6,
    advocateName: "Adv. Meera Krishnan",
    draftContent: `DEMAND NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881

To,
Coastal Logistics & Infra Ltd,
Plot 12, Port Trust Road, Willingdon Island, Kochi 682003.

Under instructions from my client, Sri. Gopakumar Nambiar, residing at Ernakulam, I do hereby serve upon you this statutory notice under proviso (b) of Section 138 of the Negotiable Instruments Act, 1881:

1. That in discharge of your legally enforceable debt towards logistics consultancy and contract supervision, you had issued Cheque No. 492019 dated 25th September 2024 drawn on Federal Bank, Marine Drive Branch for a sum of ₹4,50,000/- (Rupees Four Lakhs Fifty Thousand only).
2. That my client presented the said cheque for encashment through his banker, State Bank of India, but the same was dishonoured and returned unpaid on 04th October 2024 with the memo remarks 'FUNDS INSUFFICIENT'.
3. You are hereby called upon to pay the said sum of ₹4,50,000/- within 15 (fifteen) days from the receipt of this statutory notice, failing which my client shall be constrained to initiate criminal proceedings against you under Section 138 of the Negotiable Instruments Act, 1881 without further reference.

Adv. Meera Krishnan (Roll No: K/001429/2012)
High Court of Kerala, Ernakulam`,
    trackingHistory: [
      { date: "16-Oct-2026", time: "14:18:22", location: "Willingdon Island SO", activity: "Item Delivered [Signed by Security Incharge]" },
      { date: "16-Oct-2026", time: "09:30:15", location: "Willingdon Island SO", activity: "Out for Delivery" },
      { date: "15-Oct-2026", time: "21:40:00", location: "NSH Kochi Hub", activity: "Item Dispatched to Delivery Sub Office" },
      { date: "15-Oct-2026", time: "18:20:10", location: "NSH Kochi Hub", activity: "Item Received at Sorting Hub" },
      { date: "12-Oct-2026", time: "11:24:10", location: "Ernakulam GPO", activity: "Item Booked via Speed Post (Weight: 80g)" },
    ],
  },
  {
    _id: "not_702",
    id: "not_702",
    citizenId: "default_citizen",
    noticeType: "Recovery of Money & Outstanding Invoices",
    title: "Notice for Settlement of Outstanding Commercial Invoices of ₹1,85,000",
    senderName: "Gopakumar Nambiar",
    recipientName: "Malabar Trading Enterprises",
    recipientAddress: "Broadway, Ernakulam, Kerala 682031",
    claimAmount: "₹1,85,000",
    statutoryNoticeDays: 30,
    dispatchDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    speedPostTrackingNumber: "KL094812304IN",
    deliveryStatus: "In Transit",
    daysRemaining: 28,
    advocateName: "Adv. Meera Krishnan",
    draftContent: `LEGAL NOTICE FOR RECOVERY OF OUTSTANDING DUES WITH 18% INTEREST

To,
Malabar Trading Enterprises,
Broadway, Ernakulam, Kerala 682031.

Take notice that my client, Sri. Gopakumar Nambiar, has retained me to demand immediate liquidation of outstanding commercial dues amounting to ₹1,85,000/- under Invoice Nos. INV-2024/08 and INV-2024/11. Despite repeated verbal requests and email reminders, you have deliberately withheld payment.

You are hereby granted 30 (thirty) days to clear the outstanding sum of ₹1,85,000/- along with accrued commercial interest @ 18% per annum, failing which a civil summary suit under Order XXXVII CPC shall be instituted before the Sub Court, Ernakulam entirely at your risk as to costs and consequences.

Adv. Meera Krishnan
Chambers of Krishnan & Associates, Kochi`,
    trackingHistory: [
      { date: "19-Oct-2026", time: "16:45:00", location: "Ernakulam Nodal Hub", activity: "Item In Transit to Broadway SO" },
      { date: "19-Oct-2026", time: "10:15:30", location: "Kochi GPO", activity: "Item Booked via Inland Speed Post" },
    ],
  },
  {
    _id: "not_703",
    id: "not_703",
    citizenId: "default_citizen",
    noticeType: "Section 80 CPC Notice of Suit Against Statutory Authority",
    title: "Statutory Notice under Section 80 CPC to Kerala State Electricity Board",
    senderName: "Gopakumar Nambiar",
    recipientName: "The Secretary, KSEB & Executive Engineer",
    recipientAddress: "Vydyuthi Bhavanam, Pattom, Thiruvananthapuram 695004",
    claimAmount: "Restitution & Injunctive Relief",
    statutoryNoticeDays: 60,
    dispatchDate: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
    speedPostTrackingNumber: "EK810924715IN",
    deliveryStatus: "Item Delivered",
    daysRemaining: 18,
    advocateName: "Adv. Meera Krishnan",
    draftContent: `NOTICE UNDER SECTION 80 OF THE CODE OF CIVIL PROCEDURE, 1908

To,
1. The Secretary, Kerala State Electricity Board, Pattom, Thiruvananthapuram.
2. The Executive Engineer, Electrical Division, Pala, Kottayam District.

Take notice that on the expiry of two months from the date of receipt of this statutory notice under Section 80 CPC, my client, Sri. Gopakumar Nambiar, intends to institute a suit against the Board and its officers in the competent Court of Civil Jurisdiction for mandatory and prohibitory injunction restraining trespass into property in Sy. No. 441/2 of Kanjirappally Village.

Cause of action arose when respondents entered the holding without prior statutory notice under Section 16 of the Indian Telegraph Act, 1885.

Adv. Meera Krishnan, High Court of Kerala`,
    trackingHistory: [
      { date: "10-Sep-2026", time: "11:20:00", location: "Pattom SO, Thiruvananthapuram", activity: "Item Delivered [Signed by Despatch Section KSEB]" },
      { date: "09-Sep-2026", time: "19:00:00", location: "Trivandrum NSH", activity: "Item Received at Sorting Hub" },
      { date: "08-Sep-2026", time: "14:15:00", location: "Ernakulam GPO", activity: "Item Booked via Speed Post" },
    ],
  },
];

const DEFAULT_ADVOCATES = [
  {
    id: "adv_1",
    fullName: "Adv. Meera Krishnan",
    barCouncilNumber: "K/001429/2012",
    experienceYears: 12,
    primaryCourt: "High Court of Kerala (Ernakulam)",
    chamberAddress: "Chamber #412, KHCAA Complex, Marine Drive, Kochi",
    specializations: ["Constitutional Writs", "Land Reforms & Property", "Commercial Arbitration"],
    languages: ["English", "Malayalam"],
    consultationFee: 1500,
    rating: 4.9,
    reviewCount: 38,
    isVerified: true,
    availableToday: true,
  },
  {
    id: "adv_2",
    fullName: "Adv. Rajesh V. Varma",
    barCouncilNumber: "K/000892/2008",
    experienceYears: 16,
    primaryCourt: "High Court of Kerala & NCLT Kochi",
    chamberAddress: "Varma & Associates, MG Road, Ernakulam",
    specializations: ["Corporate & M&A", "Insolvency (IBC)", "Commercial Contracts"],
    languages: ["English", "Malayalam", "Hindi"],
    consultationFee: 2500,
    rating: 4.8,
    reviewCount: 52,
    isVerified: true,
    availableToday: false,
  },
  {
    id: "adv_3",
    fullName: "Adv. Fathima Zahra",
    barCouncilNumber: "K/002105/2017",
    experienceYears: 7,
    primaryCourt: "District & Sessions Court, Kozhikode",
    chamberAddress: "Courts Road, Kozhikode, Kerala",
    specializations: ["Family & Matrimonial", "Criminal Law & Bail", "Consumer Disputes"],
    languages: ["English", "Malayalam"],
    consultationFee: 1000,
    rating: 4.9,
    reviewCount: 29,
    isVerified: true,
    availableToday: true,
  },
  {
    id: "adv_4",
    fullName: "Adv. Ananthapadmanabhan Nair",
    barCouncilNumber: "K/000543/2001",
    experienceYears: 23,
    primaryCourt: "Supreme Court of India & High Court of Kerala",
    chamberAddress: "Law Chambers, Vanchiyoor, Thiruvananthapuram",
    specializations: ["Constitutional Law", "Revenue & Taxation", "Civil Appeals"],
    languages: ["English", "Malayalam", "Tamil"],
    consultationFee: 3500,
    rating: 5.0,
    reviewCount: 74,
    isVerified: true,
    availableToday: false,
  },
];

const DEFAULT_CAUSE_LIST = [
  {
    _id: "cl_101",
    advocateId: "adv_1",
    courtDate: new Date().toISOString(),
    courtName: "High Court of Kerala (Ernakulam)",
    courtHall: "Court Hall 2A",
    bench: "Division Bench (Chief Justice & Justice K. Babu)",
    itemNumber: 14,
    caseNumber: "WP(C) 19482/2024",
    cnrNumber: "KLHC01-019482-2024",
    petitioner: "Gopakumar Nambiar",
    respondent: "Kerala State Electricity Board & Anr.",
    appearanceFor: "Petitioner",
    stage: "Notice Before Admission / Interim Relief",
    status: "listed",
    boardRemarks: "Listed as Item #14 in daily causelist for urgent interim stay hearing",
  },
  {
    _id: "cl_102",
    advocateId: "adv_1",
    courtDate: new Date().toISOString(),
    courtName: "National Company Law Tribunal (NCLT Kochi Bench)",
    courtHall: "Court Hall 1",
    bench: "Judicial Member & Technical Member",
    itemNumber: 8,
    caseNumber: "ARB/NCLT/KOCHI/2024/041",
    cnrNumber: "KLNC01-000041-2024",
    petitioner: "Apex Logistics Ltd",
    respondent: "Marine Exports Pvt Ltd",
    appearanceFor: "Petitioner",
    stage: "Section 9 Arbitration Ad-Interim Application",
    status: "listed",
    boardRemarks: "Final arguments on preservation of maritime assets",
  },
  {
    _id: "cl_103",
    advocateId: "adv_1",
    courtDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    courtName: "Sub Court, Ernakulam",
    courtHall: "Court Hall 4B",
    bench: "Sub Judge I, Ernakulam",
    itemNumber: 22,
    caseNumber: "OS 412/2023",
    cnrNumber: "KLER02-000412-2023",
    petitioner: "Gopakumar Nambiar",
    respondent: "Varghese Builders & Developers",
    appearanceFor: "Petitioner",
    stage: "Advocate Commissioner Report Filing & Scrutiny",
    status: "adjourned",
    boardRemarks: "Respondent sought one week to file counter-affidavit to commission report",
  },
  {
    _id: "cl_104",
    advocateId: "adv_1",
    courtDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    courtName: "High Court of Kerala (Ernakulam)",
    courtHall: "Court Hall 3C",
    bench: "Single Bench (Justice V.G. Arun)",
    itemNumber: 5,
    caseNumber: "CRL.MC 8921/2024",
    cnrNumber: "KLHC01-008921-2024",
    petitioner: "Dr. Sajan Roy",
    respondent: "State of Kerala & Anr.",
    appearanceFor: "Petitioner",
    stage: "Quash Petition under Section 528 BNSS",
    status: "heard",
    boardRemarks: "Arguments concluded; orders reserved for pronouncement on Friday",
  },
];

const DEFAULT_INVOICES = [
  {
    _id: "inv_2026_041",
    invoiceNumber: "INV-2026/KL-041",
    advocateId: "adv_1",
    advocateName: "Adv. Meera Krishnan",
    citizenId: "default_citizen",
    clientName: "Gopakumar Nambiar",
    clientPhone: "+91 94471 28400",
    matterId: "mat_wpc_19482",
    matterTitle: "WP(C) 19482/2024 — High Court Writ Representation & Interim Stay",
    items: [
      { description: "High Court E-Filing & Senior Drafting Fee", amount: 15000 },
      { description: "Court Hall 2A Senior Appearance (Interim Injunction)", amount: 10000 },
    ],
    subtotal: 25000,
    gstRate: 18,
    gstAmount: 4500,
    totalAmount: 29500,
    status: "partially_paid",
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: "UPI",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "inv_2026_019",
    invoiceNumber: "INV-2026/KL-019",
    advocateId: "adv_1",
    advocateName: "Adv. Meera Krishnan",
    citizenId: "client_ananya",
    clientName: "Ananya Deshmukh",
    clientPhone: "+91 98200 44112",
    matterId: "mat_arb_041",
    matterTitle: "Commercial Arbitration Retainer & Section 9 Petition",
    items: [
      { description: "Arbitration Notice Drafting & Chamber Briefing", amount: 20000 },
      { description: "NCLT Urgent Mentioning & Indexing", amount: 12000 },
    ],
    subtotal: 32000,
    gstRate: 18,
    gstAmount: 5760,
    totalAmount: 37760,
    status: "paid",
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: "NEFT/RTGS",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "inv_2026_058",
    invoiceNumber: "INV-2026/KL-058",
    advocateId: "adv_1",
    advocateName: "Adv. Meera Krishnan",
    citizenId: "client_rohit",
    clientName: "Rohit Menon",
    clientPhone: "+91 97455 33201",
    matterId: "mat_rera_102",
    matterTitle: "K-RERA Delay Possession Complaint & Title Verification",
    items: [
      { description: "Legal Scrutiny of Encumbrance & Builder Agreement", amount: 12000 },
      { description: "K-RERA Form M Application Filing", amount: 8000 },
    ],
    subtotal: 20000,
    gstRate: 18,
    gstAmount: 3600,
    totalAmount: 23600,
    status: "unpaid",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: "Portal_Escrow",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_CASE_NOTES = [
  {
    _id: "note_101",
    advocateId: "adv_1",
    matterId: "mat_wpc_19482",
    matterTitle: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    title: "Precedent Note: Valsamma v. KSEB on Telegraph Act Sec 16",
    content: "Crucial High Court of Kerala precedent: Division bench held that licensee cannot enter private plantation without explicit District Magistrate sanction when landowner registers objection under Section 16(1). Emphasize lack of DM order during Friday hearing before Court Hall 2A.",
    category: "precedent_notes",
    isConfidential: true,
    tags: ["Telegraph Act", "Section 16", "Valsamma Precedent", "Division Bench"],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "note_102",
    advocateId: "adv_1",
    matterId: "mat_wpc_19482",
    matterTitle: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    title: "Chamber Conference with Client (Gopakumar) & Land Surveyor",
    content: "Client verified that survey sketches produced by KSEB deviate by 14 meters from the sanctioned alignment plan published in the 2023 Gazette notification. True copy of Village Officer demarcated sketch to be annexed to Reply Affidavit.",
    category: "client_instructions",
    isConfidential: true,
    tags: ["Survey Sketch", "Village Officer", "Gazette Alignment"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "note_103",
    advocateId: "adv_1",
    matterId: "mat_arb_041",
    matterTitle: "Apex Logistics v. Marine Exports Ltd",
    title: "Section 9 Interim Injunction Hearing Memo",
    content: "Prepare arguments on Perkins Eastman doctrine regarding unilateral arbitrator appointment clause in Master Services Agreement Clause 18. Seek immediate injunction restraining encumbrance of warehouse assets.",
    category: "hearing_memo",
    isConfidential: true,
    tags: ["Arbitration", "Perkins Eastman", "Interim Relief"],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_ADVOCATE_PROFILES = [
  {
    _id: "prof_adv_1",
    userId: "adv_1",
    fullName: "Adv. Meera Krishnan",
    email: "meera.krishnan@wakheel.law",
    phone: "+91 98470 12345",
    barCouncilNumber: "K/001429/2012",
    experienceYears: 12,
    primaryCourt: "High Court of Kerala (Ernakulam)",
    secondaryCourts: ["District Court, Ernakulam", "Sub Court, Ernakulam", "NCLT Kochi Bench"],
    chamberAddress: "Chamber #412, KHCAA Golden Jubilee Complex, High Court Road, Marine Drive, Kochi 682031",
    specializations: ["Constitutional Writs", "Land Acquisition & Property", "Commercial Arbitration", "Civil Writs"],
    languages: ["English", "Malayalam", "Hindi"],
    consultationFee: 1500,
    rating: 4.9,
    reviewCount: 38,
    isVerified: true,
    availableToday: true,
    bio: "Practicing Advocate before the High Court of Kerala with 12+ years of expertise in constitutional writ petitions, infrastructure property disputes, and commercial arbitration.",
    upiId: "meera.krishnan@okaxis",
  },
];

// ============================================================================
// DEV STORE REPOSITORY
// ============================================================================
export const devStore = {
  // --- Users ---
  getUsers() {
    return readFile("dev_users.json", []);
  },

  async createUser({ fullName, email, password, role, verifyMethod, ...rest }) {
    const users = this.getUsers();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const normalizedEmail = email.toLowerCase().trim();

    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    const cleanRole = ["advocate", "client", "citizen", "cs", "ca"].includes(role) ? role : "citizen";

    if (existingIndex !== -1) {
      users[existingIndex] = {
        ...users[existingIndex],
        fullName: fullName || users[existingIndex].fullName,
        password: hashedPassword,
        role: cleanRole,
        verifyMethod: verifyMethod || users[existingIndex].verifyMethod || "email",
        ...rest,
      };
      writeFile("dev_users.json", users);
      return users[existingIndex];
    }

    const newUser = {
      _id: "dev_" + Date.now().toString(),
      fullName: fullName || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      password: hashedPassword,
      role: cleanRole,
      verifyMethod: verifyMethod || "email",
      isVerified: false,
      ...rest,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeFile("dev_users.json", users);
    return newUser;
  },

  updateUserRole(email, role) {
    const users = this.getUsers();
    const normalizedEmail = email.toLowerCase().trim();
    const idx = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
    if (idx !== -1 && role) {
      users[idx].role = ["advocate", "client", "citizen", "cs", "ca"].includes(role) ? role : "citizen";
      writeFile("dev_users.json", users);
      return users[idx];
    }
    return null;
  },

  findUserByEmail(email) {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async matchPassword(enteredPassword, hashedPassword) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  },

  // --- Citizen Profiles ---
  getCitizenProfile(userId) {
    const profiles = readFile("dev_citizen_profiles.json", []);
    let profile = profiles.find((p) => p.userId === userId);
    if (!profile) {
      profile = {
        userId,
        fullName: "Gopakumar Nambiar",
        email: "gopakumar@test.com",
        phone: "+91 94471 28400",
        alternatePhone: "+91 484 231456",
        address: {
          street: "Flat 4B, Silver Heights, Panampilly Nagar",
          city: "Kochi",
          district: "Ernakulam",
          state: "Kerala",
          pincode: "682036",
        },
        preferredLanguage: "en",
        emergencyContact: {
          name: "Suresh Nambiar",
          relationship: "Brother",
          phone: "+91 98460 11223",
        },
        kycVerified: true,
        notificationPreferences: {
          whatsapp: true,
          email: true,
          inApp: true,
          courtHearingAlerts: true,
        },
      };
      profiles.push(profile);
      writeFile("dev_citizen_profiles.json", profiles);
    }
    return profile;
  },

  updateCitizenProfile(userId, updates) {
    const profiles = readFile("dev_citizen_profiles.json", []);
    const idx = profiles.findIndex((p) => p.userId === userId);
    if (idx !== -1) {
      profiles[idx] = { ...profiles[idx], ...updates };
      writeFile("dev_citizen_profiles.json", profiles);
      return profiles[idx];
    }
    const newProfile = { userId, ...updates };
    profiles.push(newProfile);
    writeFile("dev_citizen_profiles.json", profiles);
    return newProfile;
  },

  // --- Grievances / Legal Problem Intake ---
  getGrievances(userId) {
    const grvs = readFile("dev_grievances.json", DEFAULT_GRIEVANCES);
    return grvs;
  },

  getGrievanceById(id) {
    const grvs = readFile("dev_grievances.json", DEFAULT_GRIEVANCES);
    return grvs.find((g) => g._id === id) || null;
  },

  addGrievance(data) {
    const grvs = readFile("dev_grievances.json", DEFAULT_GRIEVANCES);
    const newGrv = {
      _id: "grv_" + Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    grvs.unshift(newGrv);
    writeFile("dev_grievances.json", grvs);
    return newGrv;
  },

  matchAdvocateToGrievance(grievanceId, advocateId, citizenId = "default_citizen") {
    const grvs = readFile("dev_grievances.json", DEFAULT_GRIEVANCES);
    const index = grvs.findIndex((g) => g._id === grievanceId);
    if (index === -1) return null;

    const advocates = this.getAdvocates();
    const advocate = advocates.find((a) => a.id === advocateId) || advocates[0];

    grvs[index].assignedAdvocateId = advocate.id;
    grvs[index].assignedAdvocateName = advocate.fullName;
    grvs[index].status = "matter_opened";
    writeFile("dev_grievances.json", grvs);

    // Auto-create an active matter in dev_matters.json so it immediately appears in My Matters
    const matters = readFile("dev_matters.json", DEFAULT_MATTERS);
    const existing = matters.find((m) => m.grievanceId === grievanceId);
    if (!existing) {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const isWrit = grvs[index].category?.includes("Property") || grvs[index].category?.includes("Writ");
      const casePrefix = isWrit ? "WP(C)" : "OS";
      const caseNumber = `${casePrefix} ${randomNum}/${year}`;
      const cnrNumber = `KLHC01-${Math.floor(100000 + Math.random() * 900000)}-${year}`;

      const newMatter = {
        _id: "mat_" + Date.now().toString(),
        citizenId: grvs[index].citizenId || citizenId,
        grievanceId: grvs[index]._id,
        advocateId: advocate.id,
        advocateName: advocate.fullName,
        matterTitle: `${caseNumber} — ${grvs[index].title}`,
        matterType: grvs[index].category || "Civil Litigation",
        caseNumber,
        cnrNumber,
        courtForum: grvs[index].preferredCourt || advocate.primaryCourt || "High Court of Kerala (Ernakulam)",
        courtHall: "Court Hall 2A",
        status: "active",
        nextHearingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        statutoryActs: grvs[index].aiTriage?.applicableActs || ["Specific Relief Act, 1963", "Constitution of India Article 226"],
        timeline: [
          {
            date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            title: "Legal Grievance Triaged & Counsel Engaged",
            remarks: `Initial consultation scheduled with ${advocate.fullName}. Preliminary case grounds drafted.`,
            stage: "Completed",
          },
          {
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            title: "Chamber Conference & Document Scrutiny",
            remarks: "Verification of title deeds, revenue extracts, and drafting of formal pleadings.",
            stage: "Scheduled",
          },
        ],
        totalFeesBilled: advocate.consultationFee ? advocate.consultationFee * 10 : 25000,
        feesPaid: 0,
      };

      matters.unshift(newMatter);
      writeFile("dev_matters.json", matters);
      grvs[index].linkedMatterId = newMatter._id;
      writeFile("dev_grievances.json", grvs);
      return { grievance: grvs[index], matter: newMatter, advocate };
    }

    return { grievance: grvs[index], matter: existing, advocate };
  },

  // --- Matters ---
  getMatters(userId) {
    return readFile("dev_matters.json", DEFAULT_MATTERS);
  },

  getMatterById(id) {
    const matters = readFile("dev_matters.json", DEFAULT_MATTERS);
    return (
      matters.find(
        (m) =>
          m._id === id ||
          (m.caseNumber && m.caseNumber.toLowerCase() === id.toLowerCase()) ||
          (m.cnrNumber && m.cnrNumber.toLowerCase() === id.toLowerCase())
      ) || null
    );
  },

  updateMatter(id, updateData) {
    const matters = readFile("dev_matters.json", DEFAULT_MATTERS);
    const index = matters.findIndex(
      (m) => m._id === id || (m.caseNumber && m.caseNumber.toLowerCase() === id.toLowerCase())
    );
    if (index === -1) return null;
    matters[index] = {
      ...matters[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    writeFile("dev_matters.json", matters);
    return matters[index];
  },

  addMatter(data) {
    const matters = readFile("dev_matters.json", DEFAULT_MATTERS);
    const newMatter = {
      _id: "mat_" + Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    matters.unshift(newMatter);
    writeFile("dev_matters.json", matters);
    return newMatter;
  },

  // --- Consultations ---
  getConsultations(userId) {
    return readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
  },

  addConsultation(data) {
    const cons = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    const newCon = {
      _id: "con_" + Date.now().toString(),
      ...data,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };
    cons.unshift(newCon);
    writeFile("dev_consultations.json", cons);
    return newCon;
  },

  // --- Documents & Vault ---
  getDocuments(userId, filter = {}) {
    const docs = readFile("dev_documents.json", DEFAULT_DOCUMENTS);
    return docs.filter((d) => {
      if (userId && d.citizenId && d.citizenId !== userId && userId !== "default_citizen") {
        return false;
      }
      if (filter.subType && filter.subType !== "all") {
        if (filter.subType === "contracts" && d.category !== "Contract" && d.subType !== "contracts") return false;
        if (filter.subType === "certified-true-copies" && d.category !== "CTC" && d.subType !== "certified-true-copies") return false;
        if (filter.subType === "document-filing" && d.subType !== "document-filing" && d.category !== "Filing Receipt") return false;
        if (filter.subType === "case-diary" && d.subType !== "case-diary") return false;
      }
      if (filter.category && d.category && !d.category.toLowerCase().includes(filter.category.toLowerCase())) {
        return false;
      }
      if (filter.matter && d.matter && !d.matter.toLowerCase().includes(filter.matter.toLowerCase())) {
        return false;
      }
      if (filter.matterId && d.matterId && d.matterId !== filter.matterId) {
        return false;
      }
      return true;
    });
  },

  getDocumentById(id) {
    const docs = readFile("dev_documents.json", DEFAULT_DOCUMENTS);
    return docs.find((d) => d._id === id || d.id === id);
  },

  addDocument(data) {
    const docs = readFile("dev_documents.json", DEFAULT_DOCUMENTS);
    const id = data.id || data._id || "doc_" + Date.now().toString();
    const newDoc = {
      _id: id,
      id,
      name: data.name || data.fileName || "Document.pdf",
      fileName: data.fileName || data.name || "Document.pdf",
      category: data.category || "Evidence & Exhibits",
      subType: data.subType || "all",
      matter: data.matter || "General Legal Vault",
      size: data.size || data.fileSize || "1.2 MB",
      fileSize: data.fileSize || data.size || "1.2 MB",
      uploadDate: data.uploadDate || data.date || "Just now",
      date: data.date || data.uploadDate || "Just now",
      isSigned: data.isSigned !== undefined ? data.isSigned : true,
      pages: data.pages || 1,
      hash: data.hash || data.sha256Hash || `sha256:${Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      sha256Hash: data.sha256Hash || data.hash || `sha256:${Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      details: data.details || data.remarks || "Uploaded to secure vault",
      filingStatus: data.filingStatus || data.status || "Ready in Vault",
      status: data.status || data.filingStatus || "Ready in Vault",
      advocateName: data.advocateName || "Adv. Meera Krishnan",
      advocateId: data.advocateId || "adv_1",
      remarks: data.remarks || "",
      ...data,
      createdAt: new Date().toISOString(),
    };
    docs.unshift(newDoc);
    writeFile("dev_documents.json", docs);
    return newDoc;
  },

  updateDocument(id, updates) {
    const docs = readFile("dev_documents.json", DEFAULT_DOCUMENTS);
    const idx = docs.findIndex((d) => d._id === id || d.id === id);
    if (idx !== -1) {
      docs[idx] = { ...docs[idx], ...updates, updatedAt: new Date().toISOString() };
      writeFile("dev_documents.json", docs);
      return docs[idx];
    }
    return null;
  },

  deleteDocument(id) {
    const docs = readFile("dev_documents.json", DEFAULT_DOCUMENTS);
    const filtered = docs.filter((d) => d._id !== id && d.id !== id);
    if (filtered.length !== docs.length) {
      writeFile("dev_documents.json", filtered);
      return true;
    }
    return false;
  },

  getAdvocateDocuments(advocateId = "adv_1") {
    const docs = readFile("dev_documents.json", DEFAULT_DOCUMENTS);
    return docs.filter(
      (d) =>
        d.advocateId === advocateId ||
        (d.advocateName && d.advocateName.toLowerCase().includes("meera")) ||
        d.subType === "document-filing" ||
        advocateId === "adv_1"
    );
  },

  // --- Legal Notices ---
  getNotices(userId) {
    const notices = readFile("dev_notices.json", DEFAULT_NOTICES);
    return notices.map((n) => {
      const dispatch = n.dispatchDate ? new Date(n.dispatchDate).getTime() : Date.now();
      const elapsedDays = Math.max(0, Math.floor((Date.now() - dispatch) / (1000 * 60 * 60 * 24)));
      const statutory = Number(n.statutoryNoticeDays) || 15;
      const dynamicDaysRemaining = Math.max(0, statutory - elapsedDays);
      return {
        ...n,
        daysRemaining: n.daysRemaining !== undefined ? n.daysRemaining : dynamicDaysRemaining,
      };
    });
  },

  getNoticeById(id) {
    const notices = this.getNotices();
    return notices.find((n) => n._id === id || n.id === id) || null;
  },

  addNotice(data) {
    const notices = readFile("dev_notices.json", DEFAULT_NOTICES);
    const trackingNum =
      data.speedPostTrackingNumber ||
      `EK${Math.floor(100000000 + Math.random() * 900000000)}IN`;
    const now = new Date();
    const dateStr = now
      .toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
    const timeStr = now.toTimeString().split(" ")[0];

    const initialTracking =
      data.trackingHistory && data.trackingHistory.length > 0
        ? data.trackingHistory
        : [
            {
              date: dateStr,
              time: timeStr,
              location: "Kochi Head Post Office",
              activity: `Item Booked via Speed Post (Weight: 65g, Barcode: ${trackingNum})`,
            },
          ];

    const newNotice = {
      _id: "not_" + Date.now().toString(),
      id: "not_" + Date.now().toString(),
      citizenId: data.citizenId || "default_citizen",
      senderName: data.senderName || "Gopakumar Nambiar",
      recipientName: data.recipientName || "Recipient",
      recipientAddress: data.recipientAddress || "Address",
      claimAmount: data.claimAmount || "",
      noticeType: data.noticeType || "Statutory Legal Notice",
      title: data.title || "Legal Notice",
      statutoryNoticeDays: Number(data.statutoryNoticeDays) || 15,
      dispatchDate: data.dispatchDate || now.toISOString(),
      speedPostTrackingNumber: trackingNum,
      deliveryStatus: data.deliveryStatus || "Item Booked",
      daysRemaining: Number(data.statutoryNoticeDays) || 15,
      advocateName: data.advocateName || "Adv. Meera Krishnan",
      draftContent: data.draftContent || "",
      trackingHistory: initialTracking,
      createdAt: now.toISOString(),
      ...data,
    };
    notices.unshift(newNotice);
    writeFile("dev_notices.json", notices);
    return newNotice;
  },

  updateNotice(id, updates) {
    const notices = readFile("dev_notices.json", DEFAULT_NOTICES);
    const idx = notices.findIndex((n) => n._id === id || n.id === id);
    if (idx === -1) return null;
    notices[idx] = { ...notices[idx], ...updates, updatedAt: new Date().toISOString() };
    writeFile("dev_notices.json", notices);
    return notices[idx];
  },

  deleteNotice(id) {
    const notices = readFile("dev_notices.json", DEFAULT_NOTICES);
    const filtered = notices.filter((n) => n._id !== id && n.id !== id);
    writeFile("dev_notices.json", filtered);
    return true;
  },

  // --- Advocates Directory ---
  getAdvocates() {
    const users = this.getUsers();
    const profiles = readFile("dev_advocate_profiles.json", DEFAULT_ADVOCATE_PROFILES);

    // Filter all registered users who have role 'advocate' or accountType 'independent_advocate'
    const advocateUsers = users.filter(
      (u) => u.role === "advocate" || u.accountType === "independent_advocate"
    );

    // Map profiles by userId, email, and _id for fast lookup
    const profileMap = new Map();
    profiles.forEach((p) => {
      if (p.userId) profileMap.set(p.userId.toString(), p);
      if (p.email) profileMap.set(p.email.toLowerCase(), p);
      if (p._id) profileMap.set(p._id.toString(), p);
    });

    const registeredAdvocates = advocateUsers.map((u, index) => {
      const uId = u._id || u.id || `adv_user_${index}`;
      const email = u.email ? u.email.toLowerCase() : "";
      const profile = profileMap.get(uId) || (email ? profileMap.get(email) : null);

      let cleanName = (u.fullName || profile?.fullName || "Advocate").trim();
      if (!cleanName.toLowerCase().startsWith("adv.") && !cleanName.toLowerCase().startsWith("adv ")) {
        cleanName = `Adv. ${cleanName}`;
      }

      // Generate a stable Bar Council ID if not present
      const pseudoHash = Math.abs(
        (email || cleanName).split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
      );
      const defaultBarNo = `K/00${(pseudoHash % 9000) + 1000}/${2010 + (pseudoHash % 14)}`;

      const barCouncilNumber =
        profile?.barCouncilNumber ||
        u.barCouncilId ||
        u.barCouncilNumber ||
        defaultBarNo;

      const experienceYears =
        typeof profile?.experienceYears === "number"
          ? profile.experienceYears
          : 6 + (pseudoHash % 15);

      const primaryCourt =
        profile?.primaryCourt ||
        u.additionalDetails?.practiceCourt ||
        (u.stateBarCouncil ? `${u.stateBarCouncil} & High Court` : "High Court of Kerala (Ernakulam)");

      const chamberAddress =
        profile?.chamberAddress ||
        (u.stateBarCouncil
          ? `Chambers, High Court Road, ${u.stateBarCouncil.replace("Bar Council of ", "")}`
          : "Chamber Suite, High Court Road, Marine Drive, Kochi 682031");

      const location =
        profile?.chamberAddress
          ? profile.chamberAddress.split(",").slice(-2).join(",").trim()
          : "Ernakulam, Kerala";

      const specializations =
        profile?.specializations && profile.specializations.length > 0
          ? profile.specializations
          : ["Civil Litigation", "Constitutional Writs", "Commercial Law"];

      const consultationFee =
        typeof profile?.consultationFee === "number"
          ? profile.consultationFee
          : 1200 + (pseudoHash % 10) * 150;

      return {
        id: uId,
        _id: uId,
        userId: uId,
        fullName: cleanName,
        name: cleanName,
        email: u.email,
        barCouncilNumber,
        experienceYears,
        experience: `${experienceYears}+ Years Experience`,
        primaryCourt,
        chamberAddress,
        location,
        specializations,
        specialties: specializations,
        languages: profile?.languages || ["English", "Malayalam"],
        consultationFee,
        fee: `₹${consultationFee.toLocaleString()} / session`,
        rating: profile?.rating || 4.9,
        reviewCount: profile?.reviewCount || 18 + (pseudoHash % 30),
        reviewsCount: profile?.reviewCount || 18 + (pseudoHash % 30),
        matchScore: profile?.matchScore || 98,
        isVerified: true,
        availableToday: true,
        bio: profile?.bio || `Practicing Advocate before the ${primaryCourt}.`,
        upiId: profile?.upiId || `${(email || "counsel").split("@")[0]}@okaxis`,
      };
    });

    // Merge registeredAdvocates with DEFAULT_ADVOCATES, deduplicating
    const existingIds = new Set(registeredAdvocates.map((a) => a.id));
    const existingEmails = new Set(
      registeredAdvocates.map((a) => a.email?.toLowerCase()).filter(Boolean)
    );
    const existingNames = new Set(
      registeredAdvocates.map((a) => a.name.toLowerCase().replace(/^adv\.\s*/, ""))
    );

    const remainingSeeds = DEFAULT_ADVOCATES.filter((seed) => {
      const normName = (seed.fullName || seed.name || "").toLowerCase().replace(/^adv\.\s*/, "");
      const normEmail = (seed.email || "").toLowerCase();
      if (existingIds.has(seed.id)) return false;
      if (normEmail && existingEmails.has(normEmail)) return false;
      if (normName && existingNames.has(normName)) return false;
      return true;
    });

    const normalizedSeeds = remainingSeeds.map((seed) => ({
      ...seed,
      name: seed.fullName || seed.name,
      specialties: seed.specializations || seed.specialties || ["Civil Law"],
      location: seed.chamberAddress
        ? seed.chamberAddress.split(",").slice(-2).join(",").trim()
        : seed.location || "Ernakulam, Kerala",
      experience:
        typeof seed.experienceYears === "number"
          ? `${seed.experienceYears}+ Years Experience`
          : seed.experience || "10+ Years Experience",
      fee:
        typeof seed.consultationFee === "number"
          ? `₹${seed.consultationFee.toLocaleString()} / session`
          : seed.fee || "₹1,500 / session",
      reviewsCount: seed.reviewCount || seed.reviewsCount || 38,
      matchScore: seed.matchScore || (seed.isVerified ? 98 : 90),
    }));

    // Newly registered / logged in advocates appear at the front
    return [...registeredAdvocates, ...normalizedSeeds];
  },

  // --- Advocate Profile & Chambers ---
  getAdvocateProfile(advocateId = "adv_1") {
    const profiles = readFile("dev_advocate_profiles.json", DEFAULT_ADVOCATE_PROFILES);
    let profile = profiles.find((p) => p.userId === advocateId || p._id === advocateId);
    if (!profile) {
      const users = this.getUsers();
      const user = users.find(
        (u) => u._id === advocateId || u.id === advocateId || u.email === advocateId
      );
      if (user) {
        let cleanName = (user.fullName || "Advocate").trim();
        if (!cleanName.toLowerCase().startsWith("adv.") && !cleanName.toLowerCase().startsWith("adv ")) {
          cleanName = `Adv. ${cleanName}`;
        }
        profile = {
          _id: "prof_" + user._id,
          userId: user._id,
          fullName: cleanName,
          email: user.email,
          phone: user.phone || "+91 98470 12345",
          barCouncilNumber: user.barCouncilId || "K/001429/2024",
          experienceYears: 10,
          primaryCourt: user.additionalDetails?.practiceCourt || "High Court of Kerala (Ernakulam)",
          secondaryCourts: ["District Court, Ernakulam", "Sub Court, Ernakulam"],
          chamberAddress: "Chamber Suite, High Court Road, Marine Drive, Kochi 682031",
          specializations: ["Constitutional Writs", "Land Reforms & Property", "Commercial Arbitration"],
          languages: ["English", "Malayalam"],
          consultationFee: 1500,
          rating: 4.9,
          reviewCount: 38,
          isVerified: true,
          availableToday: true,
          bio: "Practicing Advocate registered with the Bar Council.",
          upiId: `${(user.email || "counsel").split("@")[0]}@okaxis`,
        };
        profiles.push(profile);
        writeFile("dev_advocate_profiles.json", profiles);
      }
    }
    return profile || profiles[0] || DEFAULT_ADVOCATE_PROFILES[0];
  },

  updateAdvocateProfile(advocateId = "adv_1", updates = {}) {
    const profiles = readFile("dev_advocate_profiles.json", DEFAULT_ADVOCATE_PROFILES);
    const idx = profiles.findIndex((p) => p.userId === advocateId || p._id === advocateId);
    if (idx !== -1) {
      profiles[idx] = { ...profiles[idx], ...updates, updatedAt: new Date().toISOString() };
      writeFile("dev_advocate_profiles.json", profiles);
      return profiles[idx];
    }
    const newProf = { _id: "prof_" + advocateId, userId: advocateId, ...updates, updatedAt: new Date().toISOString() };
    profiles.push(newProf);
    writeFile("dev_advocate_profiles.json", profiles);
    return newProf;
  },

  // --- Cause List (Court Board) ---
  getCauseList(advocateId = "adv_1") {
    const causeList = readFile("dev_causelists.json", DEFAULT_CAUSE_LIST);
    if (!advocateId) return causeList;
    return causeList.filter((item) => item.advocateId === advocateId || !item.advocateId);
  },

  addCauseListItem(data) {
    const causeList = readFile("dev_causelists.json", DEFAULT_CAUSE_LIST);
    const newItem = {
      _id: "cl_" + Date.now().toString(),
      status: "listed",
      ...data,
      createdAt: new Date().toISOString(),
    };
    causeList.unshift(newItem);
    writeFile("dev_causelists.json", causeList);
    return newItem;
  },

  updateCauseListItem(id, updates) {
    const causeList = readFile("dev_causelists.json", DEFAULT_CAUSE_LIST);
    const idx = causeList.findIndex((item) => item._id === id);
    if (idx !== -1) {
      causeList[idx] = { ...causeList[idx], ...updates };
      writeFile("dev_causelists.json", causeList);
      return causeList[idx];
    }
    return null;
  },

  // --- Advocate Active Matters Pipeline ---
  getAdvocateMatters(advocateId = "adv_1") {
    const allMatters = readFile("dev_matters.json", DEFAULT_MATTERS);
    // Return matters assigned to this advocate or matters involving Adv. Meera Krishnan
    return allMatters.filter(
      (m) =>
        m.advocateId === advocateId ||
        (m.advocateName && m.advocateName.toLowerCase().includes("meera")) ||
        advocateId === "adv_1" // Default advocate has access to active test matters
    );
  },

  // --- Advocate Consultations & Chamber Bookings ---
  getAdvocateConsultations(advocateId = "adv_1") {
    const allConsultations = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    return allConsultations.filter(
      (c) =>
        c.advocateId === advocateId ||
        (c.advocateName && c.advocateName.toLowerCase().includes("meera")) ||
        advocateId === "adv_1"
    );
  },

  updateConsultationStatus(id, updates) {
    const cons = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    const idx = cons.findIndex((c) => c._id === id);
    if (idx !== -1) {
      cons[idx] = { ...cons[idx], ...updates, updatedAt: new Date().toISOString() };
      writeFile("dev_consultations.json", cons);
      return cons[idx];
    }
    return null;
  },

  // --- Advocate Invoices & Fee Billing ---
  getInvoices(advocateId = "adv_1") {
    const invoices = readFile("dev_invoices.json", DEFAULT_INVOICES);
    if (!advocateId) return invoices;
    return invoices.filter((inv) => inv.advocateId === advocateId || advocateId === "adv_1");
  },

  createInvoice(data) {
    const invoices = readFile("dev_invoices.json", DEFAULT_INVOICES);
    const subtotal = data.items ? data.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) : Number(data.subtotal) || 0;
    const gstRate = data.gstRate !== undefined ? Number(data.gstRate) : 18;
    const gstAmount = Math.round((subtotal * gstRate) / 100);
    const totalAmount = subtotal + gstAmount;

    const newInvoice = {
      _id: "inv_" + Date.now().toString(),
      invoiceNumber: data.invoiceNumber || `INV-${new Date().getFullYear()}/KL-${String(invoices.length + 1).padStart(3, "0")}`,
      advocateId: data.advocateId || "adv_1",
      advocateName: data.advocateName || "Adv. Meera Krishnan",
      citizenId: data.citizenId || "default_citizen",
      clientName: data.clientName || "Client",
      clientPhone: data.clientPhone || "",
      matterId: data.matterId || "",
      matterTitle: data.matterTitle || "General Legal Retainer",
      items: data.items || [{ description: "Legal Consultation & Drafting", amount: subtotal }],
      subtotal,
      gstRate,
      gstAmount,
      totalAmount,
      status: data.status || "unpaid",
      dueDate: data.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: data.paymentMethod || "UPI",
      createdAt: new Date().toISOString(),
    };
    invoices.unshift(newInvoice);
    writeFile("dev_invoices.json", invoices);
    return newInvoice;
  },

  updateInvoice(id, updates) {
    const invoices = readFile("dev_invoices.json", DEFAULT_INVOICES);
    const idx = invoices.findIndex((inv) => inv._id === id);
    if (idx !== -1) {
      invoices[idx] = { ...invoices[idx], ...updates, updatedAt: new Date().toISOString() };
      writeFile("dev_invoices.json", invoices);
      return invoices[idx];
    }
    return null;
  },

  // --- Chamber Notes & Case Briefings ---
  getCaseNotes(advocateId = "adv_1", matterId = "") {
    const notes = readFile("dev_casenotes.json", DEFAULT_CASE_NOTES);
    return notes.filter((n) => {
      const matchAdv = !advocateId || n.advocateId === advocateId || advocateId === "adv_1";
      const matchMatter = !matterId || n.matterId === matterId;
      return matchAdv && matchMatter;
    });
  },

  addCaseNote(data) {
    const notes = readFile("dev_casenotes.json", DEFAULT_CASE_NOTES);
    const newNote = {
      _id: "note_" + Date.now().toString(),
      advocateId: data.advocateId || "adv_1",
      matterId: data.matterId || "",
      matterTitle: data.matterTitle || "General Chamber Memo",
      title: data.title || "Untitled Case Note",
      content: data.content || "",
      category: data.category || "hearing_memo",
      isConfidential: data.isConfidential !== undefined ? data.isConfidential : true,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
    };
    notes.unshift(newNote);
    writeFile("dev_casenotes.json", notes);
    return newNote;
  },

  deleteCaseNote(id) {
    const notes = readFile("dev_casenotes.json", DEFAULT_CASE_NOTES);
    const filtered = notes.filter((n) => n._id !== id);
    writeFile("dev_casenotes.json", filtered);
    return { success: true, deletedId: id };
  },

  // --- Incoming Leads / Grievances for Intake ---
  getIncomingGrievances(advocateId = "adv_1") {
    const grievances = readFile("dev_grievances.json", DEFAULT_GRIEVANCES);
    return grievances;
  },

  acceptGrievance(grievanceId, advocateId = "adv_1") {
    const grievances = readFile("dev_grievances.json", DEFAULT_GRIEVANCES);
    const grvIndex = grievances.findIndex((g) => g._id === grievanceId);
    if (grvIndex === -1) return null;

    grievances[grvIndex].status = "matter_opened";
    grievances[grvIndex].assignedAdvocateId = advocateId;
    grievances[grvIndex].assignedAdvocateName = "Adv. Meera Krishnan";
    writeFile("dev_grievances.json", grievances);

    // Also auto-create a corresponding active matter if it doesn't already exist
    const matters = readFile("dev_matters.json", DEFAULT_MATTERS);
    const existing = matters.find((m) => m.grievanceId === grievanceId);
    if (!existing) {
      const newMatter = {
        _id: "mat_" + Date.now().toString(),
        citizenId: grievances[grvIndex].citizenId || "default_citizen",
        grievanceId,
        advocateId,
        advocateName: "Adv. Meera Krishnan",
        matterTitle: grievances[grvIndex].title,
        matterType: grievances[grvIndex].category || "Civil Litigation",
        caseNumber: `WP(C) ${Math.floor(10000 + Math.random() * 90000)}/2026`,
        cnrNumber: `KLHC01-${Math.floor(100000 + Math.random() * 900000)}-2026`,
        courtForum: grievances[grvIndex].preferredCourt || "High Court of Kerala (Ernakulam)",
        courtHall: "Court Hall 2A",
        status: "active",
        nextHearingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        statutoryActs: grievances[grvIndex].aiTriage?.applicableActs || ["Article 226 of the Constitution of India"],
        timeline: [
          {
            date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            title: "Lead Accepted & Matter Opened",
            remarks: "Chamber conference scheduled with client; drafting vakalatnama and writ grounds",
            stage: "Completed",
          },
        ],
        totalFeesBilled: 25000,
        feesPaid: 0,
        createdAt: new Date().toISOString(),
      };
      matters.unshift(newMatter);
      writeFile("dev_matters.json", matters);
    }

    return grievances[grvIndex];
  },

  // --- Two-Way Realtime Synchronization Engine ---
  getCitizenInvoices(citizenId = "default_citizen") {
    const invoices = readFile("dev_invoices.json", DEFAULT_INVOICES);
    return invoices.filter(
      (inv) => inv.citizenId === citizenId || citizenId === "default_citizen"
    );
  },

  payInvoice(invoiceId, paymentMethod = "UPI") {
    const invoices = readFile("dev_invoices.json", DEFAULT_INVOICES);
    const inv = invoices.find((i) => i._id === invoiceId || i.invoiceNumber === invoiceId);
    if (!inv) return null;

    inv.status = "paid";
    inv.paidAt = new Date().toISOString();
    inv.paymentMethod = paymentMethod;
    writeFile("dev_invoices.json", invoices);

    // Cross-portal sync: increment feesPaid on the matter & add timeline milestone
    const matters = readFile("dev_matters.json", DEFAULT_MATTERS);
    const matter = matters.find((m) => m._id === inv.matterId || m.caseNumber === inv.matterId || m.matterTitle === inv.matterTitle);
    if (matter) {
      matter.feesPaid = (Number(matter.feesPaid) || 0) + (Number(inv.totalAmount) || Number(inv.subtotal) || 0);
      if (!matter.timeline) matter.timeline = [];
      matter.timeline.push({
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        title: `Retainer Bill Settled (${inv.invoiceNumber})`,
        remarks: `Payment of ₹${inv.totalAmount.toLocaleString("en-IN")} confirmed via ${paymentMethod}. Formal GST receipt generated.`,
        stage: "Completed",
      });
      writeFile("dev_matters.json", matters);
    }

    return { invoice: inv, matter };
  },

  addMatterTimelineEvent(matterId, eventData) {
    const matters = readFile("dev_matters.json", DEFAULT_MATTERS);
    const matter = matters.find((m) => m._id === matterId || m.caseNumber === matterId || m.matterTitle.includes(matterId));
    if (!matter) return null;

    if (!matter.timeline) matter.timeline = [];
    const newEvent = {
      date: eventData.date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      title: eventData.title || "Court Proceedings Update",
      remarks: eventData.remarks || "",
      stage: eventData.stage || "Completed",
    };
    matter.timeline.push(newEvent);
    if (eventData.nextHearingDate) {
      matter.nextHearingDate = eventData.nextHearingDate;
    }
    matter.updatedAt = new Date().toISOString();
    writeFile("dev_matters.json", matters);
    return { matter, event: newEvent };
  },

  shareCourtDocument(data) {
    const docs = readFile("dev_documents.json", DEFAULT_DOCUMENTS);
    const newDoc = {
      _id: "doc_" + Date.now().toString(),
      citizenId: data.citizenId || "default_citizen",
      matterId: data.matterId || "",
      title: data.title || "Certified Court Order",
      category: data.category || "Certified Court Order",
      fileName: data.fileName || "Court_Order_Certified.pdf",
      fileSize: data.fileSize || "1.8 MB",
      isSigned: true,
      signedAt: new Date().toISOString(),
      uploadedBy: data.uploadedBy || "Adv. Meera Krishnan",
      createdAt: new Date().toISOString(),
    };
    docs.unshift(newDoc);
    writeFile("dev_documents.json", docs);
    return newDoc;
  },
};
