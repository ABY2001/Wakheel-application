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
    advocateId: "adv_1",
    advocateName: "Adv. Meera Krishnan",
    barCouncilNumber: "K/001429/2012",
    consultationType: "video",
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    timeSlot: "10:30 AM - 11:15 AM",
    durationMinutes: 45,
    meetingLink: "https://meet.wakheel.law/chambers-krishnan-09",
    chamberAddress: "Chamber #412, KHCAA Golden Jubilee Complex, High Court Road, Marine Drive, Kochi 682031",
    subject: "WP(C) 19482/2024 — High Court Rejoinder & Precedent Citations",
    clientNotes: "Discussing KSEB counter-affidavit allegations regarding Telegraph Act Section 16 compliance.",
    adviceNotes: "",
    feeAmount: 1500,
    paymentStatus: "paid",
    status: "scheduled",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "con_903",
    citizenId: "default_citizen",
    advocateId: "adv_1",
    advocateName: "Adv. Meera Krishnan",
    barCouncilNumber: "K/001429/2012",
    consultationType: "video",
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    timeSlot: "02:30 PM - 03:15 PM",
    durationMinutes: 45,
    meetingLink: "https://meet.wakheel.law/chambers-krishnan-14",
    chamberAddress: "Chamber #412, KHCAA Golden Jubilee Complex, High Court Road, Marine Drive, Kochi 682031",
    subject: "Section 138 NI Act — Statutory Demand Notice Expiry & JFCM Criminal Complaint",
    clientNotes: "Speed Post delivered on 16th October. Need to draft Section 138 complaint before Judicial First Class Magistrate Court.",
    adviceNotes: "",
    feeAmount: 1500,
    paymentStatus: "paid",
    status: "scheduled",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "con_904",
    citizenId: "default_citizen",
    advocateId: "adv_1",
    advocateName: "Adv. Meera Krishnan",
    barCouncilNumber: "K/001429/2012",
    consultationType: "chamber",
    scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    timeSlot: "11:00 AM - 12:00 PM",
    durationMinutes: 60,
    meetingLink: "",
    chamberAddress: "Chamber #412, KHCAA Golden Jubilee Complex, High Court Road, Marine Drive, Kochi 682031",
    subject: "Division Bench Hearing Strategy & ADM Objection Lodgement",
    clientNotes: "Brought survey plan sketches and revenue tax receipts.",
    adviceNotes: "Status quo order granted by Division Bench. Injunction restrains KSEB from felling timber or entering property pending fresh notice and summary enquiry by District Magistrate under Section 16(1) of Indian Telegraph Act.",
    feeAmount: 2000,
    paymentStatus: "paid",
    status: "completed",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "con_902",
    citizenId: "default_citizen",
    advocateId: "adv_2",
    advocateName: "Adv. Rajesh V. Varma",
    barCouncilNumber: "K/000842/2008",
    consultationType: "chamber",
    scheduledDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    timeSlot: "04:00 PM - 04:45 PM",
    durationMinutes: 45,
    meetingLink: "",
    chamberAddress: "Chamber #18, District Court Complex, Ernakulam 682011",
    subject: "Sub Court OS 412/2023 — Property Demarcation & Boundary Injunction",
    clientNotes: "Initial strategy conference on commission inspection mahazar.",
    adviceNotes: "Commission application under Order XXVI Rule 9 CPC moved with urgent memo. Taluk surveyor assistance requested.",
    feeAmount: 2500,
    paymentStatus: "paid",
    status: "completed",
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
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
    approxTime: "10:45 AM",
    courtName: "High Court of Kerala (Ernakulam)",
    courtComplex: "High Court Complex, Marine Drive, Kochi",
    courtHall: "Court Hall 2A",
    bench: "Division Bench 2A (Coram: Mustaque & Eapen, JJ.)",
    itemNumber: 14,
    caseNumber: "WP(C) 19482/2024",
    cnrNumber: "KLHC01-019482-2024",
    petitioner: "Gopakumar Nambiar",
    clientPhone: "+91 94471 28930",
    respondent: "Kerala State Electricity Board & Anr.",
    appearanceFor: "Petitioner",
    stage: "Notice Before Admission / Ad-Interim Stay",
    status: "listed",
    callingStatus: "Calling (Item #11 on dais)",
    boardRemarks: "Listed for urgent interim stay against 66kV transmission route without Section 16(1) Telegraph Act referral",
  },
  {
    _id: "cl_102",
    advocateId: "adv_1",
    courtDate: new Date().toISOString(),
    approxTime: "11:00 AM",
    courtName: "National Company Law Tribunal (NCLT Kochi Bench)",
    courtComplex: "NCLT Complex, Kakkanad, Kochi (14 km from High Court)",
    courtHall: "Court Hall 1",
    bench: "Judicial Member & Technical Member",
    itemNumber: 8,
    caseNumber: "ARB/NCLT/KOCHI/2024/041",
    cnrNumber: "KLNC01-000041-2024",
    petitioner: "Apex Logistics Ltd",
    clientPhone: "+91 98460 44120",
    respondent: "Marine Exports Pvt Ltd",
    appearanceFor: "Petitioner",
    stage: "Section 9 Commercial Injunction Application",
    status: "listed",
    callingStatus: "Listed for 11:00 AM Call",
    boardRemarks: "Final arguments on preservation of maritime assets & appointment of receiver",
  },
  {
    _id: "cl_103",
    advocateId: "adv_1",
    courtDate: new Date().toISOString(),
    approxTime: "11:30 AM",
    courtName: "Judicial First Class Magistrate Court-II, Kochi",
    courtComplex: "Kochi District Court Complex, Ernakulam",
    courtHall: "Court Hall 1",
    bench: "Judicial First Class Magistrate-II",
    itemNumber: 19,
    caseNumber: "CC 412/2023",
    cnrNumber: "KLER02-000412-2023",
    petitioner: "Apex Logistics Ltd",
    clientPhone: "+91 98460 44120",
    respondent: "Royal Traders",
    appearanceFor: "Complainant",
    stage: "Section 138 NI Act Accused Appearance & Deemed Service Verification",
    status: "listed",
    callingStatus: "Pending in 1st Call",
    boardRemarks: "Returned notice with postal endorsement 'Door Locked' under scrutiny",
  },
  {
    _id: "cl_104",
    advocateId: "adv_1",
    courtDate: new Date().toISOString(),
    approxTime: "12:15 PM",
    courtName: "High Court of Kerala (Ernakulam)",
    courtComplex: "High Court Complex, Marine Drive, Kochi",
    courtHall: "Court Hall 4C",
    bench: "Single Bench (Justice V.G. Arun)",
    itemNumber: 31,
    caseNumber: "WP(C) 28104/2024",
    cnrNumber: "KLHC01-028104-2024",
    petitioner: "Dr. Sajan Roy",
    clientPhone: "+91 94470 55182",
    respondent: "State of Kerala & Medical Council",
    appearanceFor: "Petitioner",
    stage: "Writ Petition Ad-Interim Directions",
    status: "listed",
    callingStatus: "Scheduled for 12:15 PM",
    boardRemarks: "Quashing of arbitrary administrative rejection order without personal hearing",
  },
  {
    _id: "cl_105",
    advocateId: "adv_1",
    courtDate: new Date().toISOString(),
    approxTime: "02:30 PM",
    courtName: "Principal Sessions Court, Ernakulam",
    courtComplex: "Sessions Court Complex, Ernakulam",
    courtHall: "Sessions Hall 2",
    bench: "Principal Sessions Judge",
    itemNumber: 6,
    caseNumber: "BA 8821/2024",
    cnrNumber: "KLER01-008821-2024",
    petitioner: "Dr. Radhakrishnan Menon",
    clientPhone: "+91 94462 11902",
    respondent: "State of Kerala (SHO Infopark PS)",
    appearanceFor: "Petitioner",
    stage: "Anticipatory Bail under BNSS Section 482",
    status: "listed",
    callingStatus: "Post-Lunch Session",
    boardRemarks: "Pre-arrest protection in corporate breach of trust FIR; notice u/s 35(3) BNSS complied",
  },
];

const DEFAULT_INVOICES = [
  {
    _id: "inv_2026_041",
    invoiceNumber: "INV-2026/KL-041",
    advocateId: "adv_1",
    advocateName: "Adv. Meera Krishnan",
    barCouncilNumber: "K/001429/2012",
    chamberAddress: "Chamber 12, Ernakulam Law Chambers, High Court Road, Kochi 682031",
    citizenId: "default_citizen",
    clientName: "Gopakumar Nambiar",
    clientPhone: "+91 94471 28400",
    clientAddress: "Nambiar Nilayam, Panampilly Nagar, Ernakulam, Kerala 682036",
    matterId: "mat_wpc_19482",
    matterTitle: "WP(C) 19482/2024 — High Court Writ Representation & Interim Stay",
    items: [
      { description: "High Court E-Filing & Senior Drafting Fee", category: "Professional Fee", sacCode: "9982", amount: 15000 },
      { description: "Court Hall 2A Senior Appearance (Interim Injunction Hearing)", category: "Appearance Fee", sacCode: "9982", amount: 10000 },
      { description: "High Court Paper Book Binding, Indexing & True Copy Attestations", category: "Stationery & Process", sacCode: "9982", amount: 2500 },
      { description: "Kerala Advocates' Clerks Welfare Fund Stamp & Advocate Welfare Fund", category: "Clerkage & Stamps", sacCode: "9982", amount: 1500 },
    ],
    subtotal: 29000,
    gstRate: 18,
    gstAmount: 5220,
    cgstAmount: 2610,
    sgstAmount: 2610,
    totalAmount: 34220,
    status: "unpaid",
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: "UPI",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "inv_2026_072",
    invoiceNumber: "INV-2026/KL-072",
    advocateId: "adv_1",
    advocateName: "Adv. Meera Krishnan",
    barCouncilNumber: "K/001429/2012",
    chamberAddress: "Chamber 12, Ernakulam Law Chambers, High Court Road, Kochi 682031",
    citizenId: "default_citizen",
    clientName: "Gopakumar Nambiar",
    clientPhone: "+91 94471 28400",
    clientAddress: "Nambiar Nilayam, Panampilly Nagar, Ernakulam, Kerala 682036",
    matterId: "mat_os_412",
    matterTitle: "OS 412/2024 — Title Injunction & Commission Inspection (Munsiff Court, Pala)",
    items: [
      { description: "Plaint Preparation & Order XXVI Rule 9 Commission Application", category: "Professional Fee", sacCode: "9982", amount: 8000 },
      { description: "Taluk Surveyor & Advocate Commissioner Mahazar Assistance", category: "Commission & Process", sacCode: "9982", amount: 6000 },
      { description: "Kerala Court Fees & Suits Valuation Act Ad-valorem Stamps", category: "Court Fees", sacCode: "9982", amount: 3500 },
    ],
    subtotal: 17500,
    gstRate: 18,
    gstAmount: 3150,
    cgstAmount: 1575,
    sgstAmount: 1575,
    totalAmount: 20650,
    status: "unpaid",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: "Portal_Escrow",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "inv_2026_011",
    invoiceNumber: "INV-2026/KL-011",
    advocateId: "adv_1",
    advocateName: "Adv. Meera Krishnan",
    barCouncilNumber: "K/001429/2012",
    chamberAddress: "Chamber 12, Ernakulam Law Chambers, High Court Road, Kochi 682031",
    citizenId: "default_citizen",
    clientName: "Gopakumar Nambiar",
    clientPhone: "+91 94471 28400",
    clientAddress: "Nambiar Nilayam, Panampilly Nagar, Ernakulam, Kerala 682036",
    matterId: "mat_not_701",
    matterTitle: "Pre-Litigation Legal Notice under Section 138 NI Act & Scrutiny",
    items: [
      { description: "Chamber Legal Consultation & Limitation Scrutiny", category: "Consultation", sacCode: "9982", amount: 5000 },
      { description: "Section 138 Statutory Notice Drafting & India Post Speed Post Dispatch", category: "Drafting & Dispatch", sacCode: "9982", amount: 4500 },
    ],
    subtotal: 9500,
    gstRate: 18,
    gstAmount: 1710,
    cgstAmount: 855,
    sgstAmount: 855,
    totalAmount: 11210,
    status: "paid",
    dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: "UPI",
    transactionId: "UPI/2026/894102914",
    receiptNumber: "REC-2026/KL-011",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "inv_2026_004",
    invoiceNumber: "INV-2026/KL-004",
    advocateId: "adv_1",
    advocateName: "Adv. Meera Krishnan",
    barCouncilNumber: "K/001429/2012",
    chamberAddress: "Chamber 12, Ernakulam Law Chambers, High Court Road, Kochi 682031",
    citizenId: "default_citizen",
    clientName: "Gopakumar Nambiar",
    clientPhone: "+91 94471 28400",
    clientAddress: "Nambiar Nilayam, Panampilly Nagar, Ernakulam, Kerala 682036",
    matterId: "mat_wpc_19482",
    matterTitle: "WP(C) 19482/2024 — Initial Legal Retainer & Caveat Registry Search",
    items: [
      { description: "Initial Chamber Retainer & High Court Caveat Registry Search", category: "Retainer Fee", sacCode: "9982", amount: 18000 },
      { description: "High Court Legal Benefit Fund & Vakalat Stamp Duty", category: "Stamps & Welfare", sacCode: "9982", amount: 2000 },
    ],
    subtotal: 20000,
    gstRate: 18,
    gstAmount: 3600,
    cgstAmount: 1800,
    sgstAmount: 1800,
    totalAmount: 23600,
    status: "paid",
    dueDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: "NEFT/RTGS",
    transactionId: "NEFT-SBI9481029841",
    receiptNumber: "REC-2026/KL-004",
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
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

const DEFAULT_MESSAGES = [
  {
    _id: "msg_201",
    id: "msg_201",
    senderId: "adv_1",
    senderRole: "advocate",
    senderName: "Adv. Meera Krishnan",
    recipientId: "default_citizen",
    recipientRole: "citizen",
    recipientName: "Gopakumar Nambiar",
    matterId: "mat_wpc_19482",
    matterTitle: "WP(C) 19482/2024 — High Court Writ Representation & Interim Stay",
    content: "Good afternoon Sri. Gopakumar. The Division Bench of the High Court of Kerala has taken up WP(C) 19482/2024 today before Court Hall 2A. We argued the interim stay application, and the Hon'ble Court has directed the respondents (KSEB) to maintain status quo regarding tree felling and tower alignment until their counter-affidavit is placed on record.",
    attachments: [
      {
        fileName: "High_Court_Daily_Order_Interim_Stay.pdf",
        fileUrl: "/docs/High_Court_Daily_Order_Interim_Stay.pdf",
        fileType: "application/pdf",
        fileSize: "1.4 MB",
      },
    ],
    isRead: true,
    readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isPrivileged: true,
    category: "hearing_update",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "msg_202",
    id: "msg_202",
    senderId: "default_citizen",
    senderRole: "citizen",
    senderName: "Gopakumar Nambiar",
    recipientId: "adv_1",
    recipientRole: "advocate",
    recipientName: "Adv. Meera Krishnan",
    matterId: "mat_wpc_19482",
    matterTitle: "WP(C) 19482/2024 — High Court Writ Representation & Interim Stay",
    content: "Thank you Adv. Meera! That is a huge relief. Do I need to submit the original Village Officer demarcation sketch before the next posting date?",
    attachments: [],
    isRead: true,
    readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isPrivileged: true,
    category: "general",
    createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "msg_203",
    id: "msg_203",
    senderId: "adv_1",
    senderRole: "advocate",
    senderName: "Adv. Meera Krishnan",
    recipientId: "default_citizen",
    recipientRole: "citizen",
    recipientName: "Gopakumar Nambiar",
    matterId: "mat_wpc_19482",
    matterTitle: "WP(C) 19482/2024 — High Court Writ Representation & Interim Stay",
    content: "Yes, please upload the certified copy of the Village demarcation sketch to your document vault so we can examine the alignment coordinates and annex it to our reply affidavit before Friday.",
    attachments: [],
    isRead: true,
    readAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    isPrivileged: true,
    category: "document_request",
    createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "msg_204",
    id: "msg_204",
    senderId: "adv_1",
    senderRole: "advocate",
    senderName: "Adv. Meera Krishnan",
    recipientId: "default_citizen",
    recipientRole: "citizen",
    recipientName: "Gopakumar Nambiar",
    matterId: "mat_os_412",
    matterTitle: "OS 412/2024 — Title Injunction & Commission Inspection (Munsiff Court, Pala)",
    content: "Regarding the commission inspection in OS 412/2024, the Advocate Commissioner has scheduled the local spot inspection for this Saturday at 10:30 AM. Kindly ensure you or your authorized representative is present at the property with your prior registered title deeds and tax receipts.",
    attachments: [],
    isRead: false,
    isPrivileged: true,
    category: "urgent",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "msg_205",
    id: "msg_205",
    senderId: "default_citizen",
    senderRole: "citizen",
    senderName: "Gopakumar Nambiar",
    recipientId: "adv_1",
    recipientRole: "advocate",
    recipientName: "Adv. Meera Krishnan",
    matterId: "mat_not_701",
    matterTitle: "Cheque Dishonour Statutory Demand Notice (Sec 138 NI Act)",
    content: "Advocate, India Post Speed Post tracking report shows the statutory demand notice was successfully delivered to Coastal Logistics on 16th October. The 15-day cure countdown is actively tracking in our portal.",
    attachments: [],
    isRead: true,
    readAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isPrivileged: true,
    category: "general",
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_CLIENTS = [
  {
    _id: "cli_101",
    id: "cli_101",
    citizenId: "default_citizen",
    advocateId: "adv_1",
    fullName: "Gopakumar Nambiar",
    category: "Individual Citizen",
    email: "gopakumar.law@gmail.com",
    phone: "+91 94471 28400",
    alternatePhone: "+91 98460 31200",
    address: {
      street: "Nambiar Nilayam, Panampilly Nagar",
      city: "Kochi",
      district: "Ernakulam",
      state: "Kerala",
      pincode: "682036",
    },
    location: "Kochi, Kerala",
    kycVerified: true,
    vakalatnamaExecuted: true,
    status: "Active Matter",
    activeMatters: [
      "WP(C) 19482/2024 — Gopakumar v. KSEB & Anr.",
      "Sec. 138 NI Act — Statutory Notice v. Coastal Logistics",
    ],
    activeMattersCount: 2,
    totalBilled: 35000,
    totalPaid: 25000,
    nextHearing: "18 Oct 2026 • Court Hall 2A (High Court)",
    notes: "Main agricultural land transmission line dispute. Very responsive on WhatsApp and speed post notices.",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "cli_102",
    id: "cli_102",
    citizenId: "client_malabar",
    advocateId: "adv_1",
    fullName: "Malabar Infotech Solutions Pvt Ltd",
    category: "Corporate Enterprise",
    contactPerson: "Rajeev Menon (Managing Director)",
    email: "legal@malabarinfotech.in",
    phone: "+91 484 298100",
    alternatePhone: "+91 94470 55100",
    address: {
      street: "Module 4B, Phase II, Infopark Kakkanad",
      city: "Kochi",
      district: "Ernakulam",
      state: "Kerala",
      pincode: "682042",
    },
    location: "Infopark Kochi, Kerala",
    kycVerified: true,
    vakalatnamaExecuted: true,
    status: "Active Matter",
    activeMatters: [
      "ARB/NCLT/KOCHI/2024/041 — Commercial Arbitration Claim",
    ],
    activeMattersCount: 1,
    totalBilled: 120000,
    totalPaid: 120000,
    nextHearing: "24 Oct 2026 • Arbitral Tribunal Chamber",
    notes: "Corporate retainer account. Software development contractual dispute with vendor.",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "cli_103",
    id: "cli_103",
    citizenId: "client_deepa",
    advocateId: "adv_1",
    fullName: "Deepa V. Kurup",
    category: "Individual Citizen",
    email: "deepa.kurup@outlook.com",
    phone: "+91 98470 11234",
    address: {
      street: "Kurup House, Bank Junction",
      city: "Aluva",
      district: "Ernakulam",
      state: "Kerala",
      pincode: "683101",
    },
    location: "Aluva, Kerala",
    kycVerified: true,
    vakalatnamaExecuted: true,
    status: "Pre Filing",
    activeMatters: [
      "Sub Court OS 412/2023 — Property Demarcation & Boundary Injunction",
    ],
    activeMattersCount: 1,
    totalBilled: 18000,
    totalPaid: 15000,
    nextHearing: "28 Oct 2026 • Sub Court Ernakulam",
    notes: "Boundary dispute with neighboring plot. Commission mahazar inspection scheduled.",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "cli_104",
    id: "cli_104",
    citizenId: "client_vanguard",
    advocateId: "adv_1",
    fullName: "Vanguard Infrastructure Ltd",
    category: "Corporate Enterprise",
    contactPerson: "K. S. Narayanan (VP Legal)",
    email: "contracts@vanguardinfra.com",
    phone: "+91 484 410290",
    address: {
      street: "Chamber #8, Marine Drive Commercial Center",
      city: "Kochi",
      district: "Ernakulam",
      state: "Kerala",
      pincode: "682011",
    },
    location: "Marine Drive, Kochi",
    kycVerified: true,
    vakalatnamaExecuted: false,
    status: "Retainer",
    activeMatters: [
      "WP(C) 4921/2026 — Vanguard Infrastructure v. NHAI & Ors.",
    ],
    activeMattersCount: 1,
    totalBilled: 85000,
    totalPaid: 50000,
    nextHearing: "12 Nov 2026 • High Court of Kerala",
    notes: "Highway concessionaire alignment dispute. Special Leave Petition grounds under preparation.",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_DICTATIONS = [
  {
    _id: "dict_101",
    id: "dict_101",
    advocateId: "adv_1",
    title: "WP(C) 19482/2024 — Bench Observation on Telegraph Line Alignment",
    category: "Judge Directions",
    matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    matterId: "mat_wpc_19482",
    duration: "00:48",
    date: "18 Oct 2026, 11:45 AM",
    transcript:
      "Hon'ble Bench observed that Section 16 of Indian Telegraph Act does not empower KSEB to draw 11KV lines through petitioner's homestead without prior notice to the District Magistrate. Interim stay extended until November 14th. Bench asked Assistant Executive Engineer to be personally present if counter-affidavit is not filed within two weeks.",
    actionItems: [
      "Obtain certified copy of today's Bench interim extension order",
      "Draft rejoinder addressing Section 16 jurisdictional bar",
      "Brief client Sri. Gopakumar regarding next posting on Nov 14",
    ],
    status: "archived",
    audioUrl: "",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "dict_102",
    id: "dict_102",
    advocateId: "adv_1",
    title: "CC 412/2024 — Post-Hearing Cross Examination Highlights",
    category: "Cross-Exam Strategy",
    matter: "CC 412/2024 — Cheque Dishonour (S.138 NI Act)",
    matterId: "mat_cc_412",
    duration: "01:15",
    date: "19 Oct 2026, 04:20 PM",
    transcript:
      "Complainant admitted during cross-examination that no income tax returns were produced to substantiate cash lending of ₹5 Lakhs. Defense reliance on Supreme Court ratio in Basalingappa v. Mudibasappa (2019) 5 SCC 418 established foundational rebuttable presumption. Complainant's passbook reveals no corresponding withdrawal on 12/03/2023.",
    actionItems: [
      "File memo with excerpt of Complainant PW-1 cross-examination deposition",
      "Compile citations on standard of preponderance of probability in Section 139 NI Act",
      "Prepare Section 313 CrPC defense questionnaire for accused",
    ],
    status: "archived",
    audioUrl: "",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "dict_103",
    id: "dict_103",
    advocateId: "adv_1",
    title: "OS 284/2023 — Client Conference on Survey Commission Report",
    category: "Client Conference",
    matter: "OS 284/2023 — Varghese v. Mathew (Sub Court)",
    matterId: "mat_os_284",
    duration: "00:34",
    date: "20 Oct 2026, 02:15 PM",
    transcript:
      "Client instructed that Advocate Commissioner failed to measure the eastern boundary with reference to 1968 resettlement survey plan. The existing granite wall was ignored in sketch C-1. Need to file objection to commission report and pray for remitting the warrant back to the same commissioner.",
    actionItems: [
      "Draft objection petition to Advocate Commissioner report",
      "Attach old resettlement survey sketch as defense Exhibit",
    ],
    status: "archived",
    audioUrl: "",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "dict_104",
    id: "dict_104",
    advocateId: "adv_1",
    title: "ARB/NCLT/2024 — Arbitral Tribunal Order 11 Scope of Discovery",
    category: "Court Hearing",
    matter: "ARB/NCLT/KOCHI/2024/041 — Malabar Infotech",
    matterId: "mat_arb_041",
    duration: "01:02",
    date: "21 Oct 2026, 05:30 PM",
    transcript:
      "Sole Arbitrator allowed claimant's application under Section 27 of Arbitration and Conciliation Act for production of server audit trails. Respondent directed to supply digital logs within 10 days. Procedural hearing fixed for framing additional issues on 3rd November.",
    actionItems: [
      "Send official demand letter to vendor for production of AWS audit trails",
      "Draft proposed issues on breach of SLA for Nov 3 hearing",
      "Update MD Rajeev Menon on arbitrator ruling",
    ],
    status: "archived",
    audioUrl: "",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_TRUST_TRANSACTIONS = [
  {
    _id: "tru_101",
    id: "tru_101",
    advocateId: "adv_1",
    type: "deposit",
    clientName: "Malabar Infotech Solutions Pvt Ltd",
    citizenId: "client_malabar",
    matterTitle: "ARB/NCLT/KOCHI/2024/041 — Commercial Arbitration Claim",
    matterId: "mat_arb_041",
    amount: 350000,
    purpose: "Arbitrator Hearing Fee & Stenographer Advance Deposit",
    referenceNumber: "NEFT/KLB2026/091244",
    verifiedBy: "Adv. Meera Krishnan",
    date: "14 Oct 2026",
    status: "cleared",
    createdAt: "2026-10-14T05:15:00.000Z",
  },
  {
    _id: "tru_102",
    id: "tru_102",
    advocateId: "adv_1",
    type: "deposit",
    clientName: "Gopakumar Nambiar",
    citizenId: "default_citizen",
    matterTitle: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    matterId: "mat_wpc_19482",
    amount: 150000,
    purpose: "Advocate Commissioner Remuneration & Re-survey Deposit",
    referenceNumber: "UPI/SBIN/88129014",
    verifiedBy: "Adv. Meera Krishnan",
    date: "18 Oct 2026",
    status: "cleared",
    createdAt: "2026-10-18T06:30:00.000Z",
  },
  {
    _id: "tru_103",
    id: "tru_103",
    advocateId: "adv_1",
    type: "disbursement",
    clientName: "Gopakumar Nambiar",
    citizenId: "default_citizen",
    matterTitle: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    matterId: "mat_wpc_19482",
    amount: 50000,
    purpose: "Disbursement to Advocate Commissioner (High Court Warrant #82)",
    referenceNumber: "CHQ/771920/AXIS",
    verifiedBy: "Adv. Meera Krishnan",
    date: "20 Oct 2026",
    status: "cleared",
    createdAt: "2026-10-20T04:15:00.000Z",
  },
  {
    _id: "tru_104",
    id: "tru_104",
    advocateId: "adv_1",
    type: "deposit",
    clientName: "Vanguard Infrastructure Ltd",
    citizenId: "client_vanguard",
    matterTitle: "WP(C) 4921/2026 — Vanguard Infrastructure v. NHAI",
    matterId: "mat_1792557595989",
    amount: 200000,
    purpose: "Court Registry Security Deposit (Conditional Stay)",
    referenceNumber: "RTGS/HDFC/2026/0991",
    verifiedBy: "Adv. Meera Krishnan",
    date: "21 Oct 2026",
    status: "cleared",
    createdAt: "2026-10-21T09:00:00.000Z",
  },
];

const DEFAULT_EXPENSES = [
  {
    _id: "exp_101",
    id: "exp_101",
    advocateId: "adv_1",
    matterTitle: "WP(C) 19482/2024 — Gopakumar v. KSEB",
    matterId: "mat_wpc_19482",
    clientName: "Gopakumar Nambiar",
    category: "Court Fee Stamps & Welfare",
    amount: 2850,
    description: "Kerala High Court e-filing judicial stamp duty and welfare fund tickets",
    paidBy: "Suresh Rawat (Clerk)",
    date: "16 Oct 2026",
    receiptNumber: "KLHC-EF-2026-9812",
    isReimbursable: true,
    status: "approved",
    createdAt: "2026-10-16T08:00:00.000Z",
  },
  {
    _id: "exp_102",
    id: "exp_102",
    advocateId: "adv_1",
    matterTitle: "ARB/NCLT/KOCHI/2024/041 — Malabar Infotech",
    matterId: "mat_arb_041",
    clientName: "Malabar Infotech Solutions Pvt Ltd",
    category: "Process Service & Speed Post",
    amount: 1420,
    description: "Speed post statutory notice with AD to 4 respondent directors",
    paidBy: "Chamber Petty Cash",
    date: "18 Oct 2026",
    receiptNumber: "SP-EKM-4412",
    isReimbursable: true,
    status: "approved",
    createdAt: "2026-10-18T10:15:00.000Z",
  },
  {
    _id: "exp_103",
    id: "exp_103",
    advocateId: "adv_1",
    matterTitle: "General Chamber Operations",
    matterId: "chamber_gen",
    clientName: "Chamber Overhead",
    category: "Legal Research Subscriptions",
    amount: 8500,
    description: "SCC Online & Manupatra Kerala High Court monthly research seats",
    paidBy: "Adv. Meera Krishnan",
    date: "19 Oct 2026",
    receiptNumber: "INV-SCCO-8812",
    isReimbursable: false,
    status: "paid",
    createdAt: "2026-10-19T06:00:00.000Z",
  },
  {
    _id: "exp_104",
    id: "exp_104",
    advocateId: "adv_1",
    matterTitle: "WP(C) 4921/2026 — Vanguard Infrastructure v. NHAI",
    matterId: "mat_1792557595989",
    clientName: "Vanguard Infrastructure Ltd",
    category: "Paperbook Binding & Scrutiny",
    amount: 3200,
    description: "4 sets Division Bench paperbook binding, index tab sheets, and registry attestations",
    paidBy: "Suresh Rawat (Clerk)",
    date: "21 Oct 2026",
    receiptNumber: "CH-PB-2026-401",
    isReimbursable: true,
    status: "approved",
    createdAt: "2026-10-21T11:45:00.000Z",
  },
];

const DEFAULT_ASSOCIATES = [
  {
    _id: "asc_101",
    id: "asc_101",
    advocateId: "adv_1",
    fullName: "Adv. Rahul Nair",
    role: "Senior Associate (Civil & Writs)",
    enrollmentNumber: "K/002140/2017",
    phone: "+91 94472 88120",
    email: "rahul.nair@chamber.law",
    status: "Active",
    courtPass: "KHCAA Golden Jubilee Pass #104",
    activeMattersAssigned: 8,
    attendanceToday: "Present — Court Hall 2A",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    _id: "asc_102",
    id: "asc_102",
    advocateId: "adv_1",
    fullName: "Adv. Preeti Sharma",
    role: "Litigation Junior (Arbitration & Corporate)",
    enrollmentNumber: "K/003891/2021",
    phone: "+91 98471 44520",
    email: "preeti.sharma@chamber.law",
    status: "Active",
    courtPass: "KHCAA Pass #312",
    activeMattersAssigned: 5,
    attendanceToday: "Present — Arbitral Tribunal",
    createdAt: "2026-07-15T00:00:00.000Z",
  },
  {
    _id: "asc_103",
    id: "asc_103",
    advocateId: "adv_1",
    fullName: "Suresh Rawat",
    role: "Chief Court Clerk & Registry In-charge",
    enrollmentNumber: "HC Clerk Badge #402",
    phone: "+91 94470 22390",
    email: "suresh.clerk@chamber.law",
    status: "Active",
    courtPass: "Registry Filing Pass #402",
    activeMattersAssigned: 14,
    attendanceToday: "Present — Filing Scrutiny Section",
    createdAt: "2026-05-10T00:00:00.000Z",
  },
];

const DEFAULT_CHAMBER_REPORTS = [
  {
    _id: "rep_2026_q3",
    id: "rep_2026_q3",
    title: "Q3 2026 High Court Chamber Audit & Performance Ledger",
    category: "Quarterly Audit",
    period: "Jul – Sep 2026",
    generatedDate: "01 Oct 2026",
    metrics: {
      totalBriefs: 24,
      admittedRate: "91.6%",
      interimReliefObtained: 18,
      disposedFavorable: 14,
      revenueCollected: 385000,
      trustEscrowBalance: 650000,
    },
    fileSize: "2.8 MB PDF",
    status: "Certified",
  },
  {
    _id: "rep_2026_causelist",
    id: "rep_2026_causelist",
    title: "Kerala High Court Cause List & Bench Appearance Compliance",
    category: "Court Compliance",
    period: "Sep – Oct 2026",
    generatedDate: "12 Oct 2026",
    metrics: {
      totalHearingsListed: 38,
      benchAppearances: 36,
      adjournmentsSought: 2,
      zeroDefaultRate: "100%",
    },
    fileSize: "1.4 MB PDF",
    status: "Certified",
  },
  {
    _id: "rep_2026_trust",
    id: "rep_2026_trust",
    title: "Bar Council Rule 24 Trust Escrow & GST Reverse Charge Statement",
    category: "Tax & Trust Audit",
    period: "Q2 – Q3 2026",
    generatedDate: "18 Oct 2026",
    metrics: {
      trustDeposits: 700000,
      trustDisbursements: 50000,
      netEscrowBalance: 650000,
      gstRcmCompliance: "100% Reconciled",
    },
    fileSize: "1.9 MB PDF",
    status: "Certified",
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
    const list = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    return list.filter(
      (c) => !userId || c.citizenId === userId || userId === "default_citizen"
    );
  },

  getConsultationById(id) {
    const list = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    return list.find((c) => c._id === id || c.id === id) || null;
  },

  addConsultation(data) {
    const cons = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    const roomCode = Math.floor(1000 + Math.random() * 9000);
    const newCon = {
      _id: "con_" + Date.now().toString(),
      id: "con_" + Date.now().toString(),
      citizenId: data.citizenId || "default_citizen",
      advocateId: data.advocateId || "adv_1",
      advocateName: data.advocateName || "Adv. Meera Krishnan",
      barCouncilNumber: data.barCouncilNumber || "K/001429/2012",
      consultationType: data.consultationType || "video",
      scheduledDate: data.scheduledDate || new Date().toISOString(),
      timeSlot: data.timeSlot || "10:30 AM - 11:15 AM",
      durationMinutes: Number(data.durationMinutes) || 45,
      meetingLink: data.consultationType === "video" ? `https://meet.wakheel.law/chambers-room-${roomCode}` : "",
      chamberAddress: data.chamberAddress || "Chamber #412, KHCAA Golden Jubilee Complex, High Court Road, Kochi 682031",
      subject: data.subject || "Legal Consultation & Strategy Session",
      clientNotes: data.clientNotes || "",
      adviceNotes: "",
      feeAmount: Number(data.feeAmount) || 1500,
      paymentStatus: "paid",
      status: "scheduled",
      createdAt: new Date().toISOString(),
      ...data,
    };
    cons.unshift(newCon);
    writeFile("dev_consultations.json", cons);
    return newCon;
  },

  rescheduleConsultation(id, newDate, newTimeSlot, reason = "") {
    const cons = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    const idx = cons.findIndex((c) => c._id === id || c.id === id);
    if (idx === -1) return null;
    cons[idx].scheduledDate = new Date(newDate).toISOString();
    if (newTimeSlot) cons[idx].timeSlot = newTimeSlot;
    cons[idx].status = "rescheduled";
    cons[idx].rescheduleReason = reason;
    cons[idx].updatedAt = new Date().toISOString();
    writeFile("dev_consultations.json", cons);
    return cons[idx];
  },

  cancelConsultation(id, reason = "") {
    const cons = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    const idx = cons.findIndex((c) => c._id === id || c.id === id);
    if (idx === -1) return null;
    cons[idx].status = "cancelled";
    cons[idx].cancellationReason = reason;
    cons[idx].updatedAt = new Date().toISOString();
    writeFile("dev_consultations.json", cons);
    return cons[idx];
  },

  addConsultationNote(id, note) {
    const cons = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    const idx = cons.findIndex((c) => c._id === id || c.id === id);
    if (idx === -1) return null;
    cons[idx].clientNotes = (cons[idx].clientNotes ? cons[idx].clientNotes + "\n" : "") + note;
    cons[idx].updatedAt = new Date().toISOString();
    writeFile("dev_consultations.json", cons);
    return cons[idx];
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
    const idx = cons.findIndex((c) => c._id === id || c.id === id);
    if (idx !== -1) {
      cons[idx] = { ...cons[idx], ...updates, updatedAt: new Date().toISOString() };
      writeFile("dev_consultations.json", cons);
      return cons[idx];
    }
    return null;
  },

  recordConsultationAdvice(id, adviceNotes, extraUpdates = {}) {
    const cons = readFile("dev_consultations.json", DEFAULT_CONSULTATIONS);
    const idx = cons.findIndex((c) => c._id === id || c.id === id);
    if (idx !== -1) {
      cons[idx].adviceNotes = adviceNotes;
      cons[idx].status = "completed";
      cons[idx].completedAt = new Date().toISOString();
      cons[idx].updatedAt = new Date().toISOString();
      Object.assign(cons[idx], extraUpdates);
      writeFile("dev_consultations.json", cons);
      return cons[idx];
    }
    return null;
  },

  // --- Advocate Invoices & Fee Billing ---
  getInvoices(advocateId = "adv_1") {
    const invoices = readFile("dev_invoices.json", DEFAULT_INVOICES);
    if (!advocateId || advocateId === "adv_1" || advocateId === "default_citizen") return invoices;
    return invoices.filter((inv) => !inv.advocateId || inv.advocateId === advocateId || inv.advocateId === "adv_1");
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

  getInvoiceById(invoiceId) {
    const invoices = readFile("dev_invoices.json", DEFAULT_INVOICES);
    return invoices.find((i) => i._id === invoiceId || i.invoiceNumber === invoiceId) || null;
  },

  createInvoice(data) {
    const invoices = readFile("dev_invoices.json", DEFAULT_INVOICES);
    const now = new Date();
    const count = invoices.length + 1;
    const invNum = data.invoiceNumber || `INV-${now.getFullYear()}/KL-${String(count).padStart(3, "0")}`;
    const subtotal = Number(data.subtotal) || (data.items ? data.items.reduce((s, it) => s + (Number(it.amount) || 0), 0) : 0);
    const gstRate = Number(data.gstRate) || 18;
    const gstAmount = Math.round(subtotal * (gstRate / 100));
    const totalAmount = subtotal + gstAmount;

    const newInvoice = {
      _id: "inv_" + Date.now().toString(),
      invoiceNumber: invNum,
      advocateId: data.advocateId || "adv_1",
      advocateName: data.advocateName || "Adv. Meera Krishnan",
      barCouncilNumber: data.barCouncilNumber || "K/001429/2012",
      chamberAddress: data.chamberAddress || "Chamber 12, Ernakulam Law Chambers, High Court Road, Kochi 682031",
      citizenId: data.citizenId || "default_citizen",
      clientName: data.clientName || "Gopakumar Nambiar",
      clientPhone: data.clientPhone || "+91 94471 28400",
      clientAddress: data.clientAddress || "Panampilly Nagar, Ernakulam, Kerala 682036",
      matterId: data.matterId || "",
      matterTitle: data.matterTitle || "Legal Representation & Retainer",
      items: data.items || [{ description: "Legal Retainer Consultation", amount: subtotal, category: "Professional Fee", sacCode: "9982" }],
      subtotal,
      gstRate,
      gstAmount,
      cgstAmount: Math.round(gstAmount / 2),
      sgstAmount: Math.round(gstAmount / 2),
      totalAmount,
      status: data.status || "unpaid",
      dueDate: data.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: data.paymentMethod || "UPI",
      createdAt: now.toISOString(),
      ...data,
    };
    invoices.unshift(newInvoice);
    writeFile("dev_invoices.json", invoices);
    return newInvoice;
  },

  payInvoice(invoiceId, paymentMethod = "UPI", transactionId = "") {
    const invoices = readFile("dev_invoices.json", DEFAULT_INVOICES);
    const inv = invoices.find((i) => i._id === invoiceId || i.invoiceNumber === invoiceId);
    if (!inv) return null;

    const now = new Date();
    inv.status = "paid";
    inv.paidAt = now.toISOString();
    inv.paymentMethod = paymentMethod;
    inv.transactionId =
      transactionId ||
      `${paymentMethod.toUpperCase().replace(/[^A-Z]/g, "") || "TXN"}/${now.getFullYear()}/${Math.floor(
        10000000 + Math.random() * 90000000
      )}`;
    inv.receiptNumber =
      inv.receiptNumber ||
      `REC-${now.getFullYear()}/${inv.invoiceNumber.replace(/[^0-9]/g, "").slice(-3) || "001"}`;
    writeFile("dev_invoices.json", invoices);

    // Cross-portal sync: increment feesPaid on the matter & add timeline milestone
    const matters = readFile("dev_matters.json", DEFAULT_MATTERS);
    const matter = matters.find(
      (m) =>
        m._id === inv.matterId ||
        m.id === inv.matterId ||
        m.caseNumber === inv.matterId ||
        (inv.matterTitle && m.matterTitle && m.matterTitle.includes(inv.matterTitle.slice(0, 15)))
    );
    if (matter) {
      matter.feesPaid =
        (Number(matter.feesPaid) || 0) + (Number(inv.totalAmount) || Number(inv.subtotal) || 0);
      if (!matter.timeline) matter.timeline = [];
      matter.timeline.unshift({
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        title: `Retainer Bill Settled (${inv.invoiceNumber})`,
        remarks: `Payment of ₹${Number(inv.totalAmount).toLocaleString(
          "en-IN"
        )} confirmed via ${paymentMethod} (Txn: ${inv.transactionId}). Formal GST receipt ${
          inv.receiptNumber
        } issued.`,
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
    const docId = data.id || data._id || "doc_" + Date.now().toString();
    const hash = data.hash || data.sha256Hash || `sha256:${Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    const newDoc = {
      _id: docId,
      id: docId,
      citizenId: data.citizenId || "default_citizen",
      matterId: data.matterId || "mat_wpc_19482",
      matter: data.matter || "WP(C) 19482/2024 — Gopakumar v. KSEB",
      title: data.title || "Certified Court Order",
      name: data.fileName || data.title || "Certified_Court_Order.pdf",
      fileName: data.fileName || data.title || "Certified_Court_Order.pdf",
      category: data.category || "Certified Court Orders",
      folder: "Certified Court Orders",
      subType: data.subType || "certified-true-copies",
      size: data.fileSize || data.size || "1.8 MB",
      fileSize: data.fileSize || data.size || "1.8 MB",
      isSigned: true,
      signedAt: new Date().toISOString(),
      uploadDate: "Today, Just now",
      date: "Just now",
      pages: data.pages || 4,
      hash,
      sha256Hash: hash,
      uploadedBy: data.uploadedBy || "Adv. Meera Krishnan",
      advocateName: data.uploadedBy || "Adv. Meera Krishnan",
      advocateId: data.advocateId || "adv_1",
      filingStatus: data.filingStatus || "Counsel Certified & Served",
      status: data.filingStatus || "Counsel Certified & Served",
      notes: data.notes || data.details || "Certified court order attested and shared to client docket with digital chamber seal.",
      details: data.notes || data.details || "Certified court order attested and shared to client docket with digital chamber seal.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    docs.unshift(newDoc);
    writeFile("dev_documents.json", docs);
    return newDoc;
  },

  // --- Secure Client-Advocate Messaging ---
  getMessages(userId = "default_citizen", matterId = "") {
    const messages = readFile("dev_messages.json", DEFAULT_MESSAGES);
    return messages.filter((m) => {
      const matchUser =
        !userId ||
        m.senderId === userId ||
        m.recipientId === userId ||
        userId === "default_citizen";
      const matchMatter = !matterId || m.matterId === matterId;
      return matchUser && matchMatter;
    });
  },

  sendMessage(data) {
    const messages = readFile("dev_messages.json", DEFAULT_MESSAGES);
    const now = new Date();
    const newMsg = {
      _id: "msg_" + Date.now().toString(),
      id: "msg_" + Date.now().toString(),
      senderId: data.senderId || "default_citizen",
      senderRole: data.senderRole || "citizen",
      senderName: data.senderName || "Gopakumar Nambiar",
      recipientId: data.recipientId || "adv_1",
      recipientRole: data.recipientRole || "advocate",
      recipientName: data.recipientName || "Adv. Meera Krishnan",
      matterId: data.matterId || "",
      matterTitle: data.matterTitle || "General Legal Counsel",
      content: data.content,
      attachments: data.attachments || [],
      isRead: false,
      isPrivileged: data.isPrivileged !== undefined ? data.isPrivileged : true,
      category: data.category || "general",
      createdAt: now.toISOString(),
    };
    messages.push(newMsg);
    writeFile("dev_messages.json", messages);
    return newMsg;
  },

  markMessageAsRead(messageId) {
    const messages = readFile("dev_messages.json", DEFAULT_MESSAGES);
    const msg = messages.find((m) => m._id === messageId || m.id === messageId);
    if (!msg) return null;
    msg.isRead = true;
    msg.readAt = new Date().toISOString();
    writeFile("dev_messages.json", messages);
    return msg;
  },

  getUnreadMessageCount(userId = "default_citizen") {
    const messages = this.getMessages(userId);
    return messages.filter((m) => m.recipientId === userId && !m.isRead).length;
  },

  // --- Advocate Messaging & Threads ---
  getAdvocateMessages(advocateId = "adv_1") {
    const messages = readFile("dev_messages.json", DEFAULT_MESSAGES);
    return messages.filter(
      (m) =>
        m.senderId === advocateId ||
        m.recipientId === advocateId ||
        m.recipientRole === "advocate" ||
        advocateId === "adv_1"
    );
  },

  getAdvocateThreads(advocateId = "adv_1") {
    const messages = this.getAdvocateMessages(advocateId);
    const threadsMap = new Map();

    messages.forEach((msg) => {
      const isOutbound = msg.senderId === advocateId || msg.senderRole === "advocate";
      const citizenId = isOutbound ? msg.recipientId : msg.senderId;
      const citizenName = isOutbound ? msg.recipientName : msg.senderName;

      if (!threadsMap.has(citizenId)) {
        threadsMap.set(citizenId, {
          citizenId,
          citizenName: citizenName || "Citizen Client",
          matterId: msg.matterId || "",
          matterTitle: msg.matterTitle || "Chamber Representation",
          messages: [],
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      const thread = threadsMap.get(citizenId);
      thread.messages.push(msg);
      if (new Date(msg.createdAt) >= new Date(thread.lastMessage.createdAt)) {
        thread.lastMessage = msg;
        if (msg.matterTitle) thread.matterTitle = msg.matterTitle;
      }
      if (!msg.isRead && !isOutbound) {
        thread.unreadCount += 1;
      }
    });

    return Array.from(threadsMap.values()).sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  },

  getAdvocateThread(advocateId = "adv_1", citizenId = "default_citizen") {
    const messages = this.getAdvocateMessages(advocateId);
    return messages.filter(
      (m) =>
        (m.senderId === citizenId && (m.recipientId === advocateId || m.recipientRole === "advocate")) ||
        (m.recipientId === citizenId && (m.senderId === advocateId || m.senderRole === "advocate")) ||
        (citizenId === "default_citizen" && (m.senderId === "default_citizen" || m.recipientId === "default_citizen"))
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  sendAdvocateMessage(data) {
    const messages = readFile("dev_messages.json", DEFAULT_MESSAGES);
    const now = new Date();
    const newMsg = {
      _id: "msg_" + Date.now().toString(),
      id: "msg_" + Date.now().toString(),
      senderId: data.senderId || "adv_1",
      senderRole: "advocate",
      senderName: data.senderName || "Adv. Meera Krishnan",
      recipientId: data.recipientId || "default_citizen",
      recipientRole: "citizen",
      recipientName: data.recipientName || "Gopakumar Nambiar",
      matterId: data.matterId || "mat_wpc_19482",
      matterTitle: data.matterTitle || "WP(C) 19482/2024 — High Court Writ Representation & Interim Stay",
      content: data.content,
      attachments: data.attachments || [],
      isRead: false,
      isPrivileged: true,
      category: data.category || "general",
      createdAt: now.toISOString(),
    };
    messages.push(newMsg);
    writeFile("dev_messages.json", messages);
    return newMsg;
  },

  markAdvocateThreadRead(advocateId = "adv_1", citizenId = "default_citizen") {
    const messages = readFile("dev_messages.json", DEFAULT_MESSAGES);
    let updatedCount = 0;
    messages.forEach((m) => {
      const isIncoming = m.senderId === citizenId || (citizenId === "default_citizen" && m.senderRole === "citizen");
      if (isIncoming && !m.isRead) {
        m.isRead = true;
        m.readAt = new Date().toISOString();
        updatedCount++;
      }
    });
    if (updatedCount > 0) {
      writeFile("dev_messages.json", messages);
    }
    return updatedCount;
  },

  getAdvocateUnreadCount(advocateId = "adv_1") {
    const messages = this.getAdvocateMessages(advocateId);
    return messages.filter((m) => m.recipientRole === "advocate" && !m.isRead).length;
  },

  // --- Advocate Clients & Representation Roster ---
  getClients(advocateId = "adv_1") {
    const clients = readFile("dev_clients.json", DEFAULT_CLIENTS);
    if (!clients || clients.length === 0) {
      writeFile("dev_clients.json", DEFAULT_CLIENTS);
      return DEFAULT_CLIENTS;
    }
    return clients;
  },

  getClientById(id) {
    const clients = readFile("dev_clients.json", DEFAULT_CLIENTS);
    return clients.find((c) => c._id === id || c.id === id || c.citizenId === id) || null;
  },

  addClient(data) {
    const clients = readFile("dev_clients.json", DEFAULT_CLIENTS);
    const newClient = {
      _id: "cli_" + Date.now().toString(),
      id: "cli_" + Date.now().toString(),
      citizenId: data.citizenId || "cit_" + Date.now().toString(),
      advocateId: data.advocateId || "adv_1",
      fullName: data.fullName,
      category: data.category || "Individual Citizen",
      contactPerson: data.contactPerson || "",
      email: data.email || "",
      phone: data.phone || "",
      alternatePhone: data.alternatePhone || "",
      address: data.address || {
        city: data.city || "Kochi",
        state: "Kerala",
        district: "Ernakulam",
      },
      location: data.location || `${data.city || "Kochi"}, Kerala`,
      kycVerified: data.kycVerified !== undefined ? data.kycVerified : true,
      vakalatnamaExecuted: data.vakalatnamaExecuted !== undefined ? data.vakalatnamaExecuted : false,
      status: data.status || "Active Matter",
      activeMatters: data.initialMatter ? [data.initialMatter] : [],
      activeMattersCount: data.initialMatter ? 1 : 0,
      totalBilled: Number(data.totalBilled) || 0,
      totalPaid: Number(data.totalPaid) || 0,
      nextHearing: data.nextHearing || "Initial Chamber Conference",
      notes: data.notes || "",
      createdAt: new Date().toISOString(),
      ...data,
    };
    clients.unshift(newClient);
    writeFile("dev_clients.json", clients);
    return newClient;
  },

  updateClient(id, updates) {
    const clients = readFile("dev_clients.json", DEFAULT_CLIENTS);
    const idx = clients.findIndex((c) => c._id === id || c.id === id || c.citizenId === id);
    if (idx !== -1) {
      clients[idx] = { ...clients[idx], ...updates, updatedAt: new Date().toISOString() };
      writeFile("dev_clients.json", clients);
      return clients[idx];
    }
    return null;
  },

  // --- Chamber Voice Dictations & Audio Notes ---
  getDictations(advocateId = "adv_1") {
    const dictations = readFile("dev_dictations.json", DEFAULT_DICTATIONS);
    if (!dictations || dictations.length === 0) {
      writeFile("dev_dictations.json", DEFAULT_DICTATIONS);
      return DEFAULT_DICTATIONS;
    }
    return dictations;
  },

  getDictationById(id) {
    const dictations = readFile("dev_dictations.json", DEFAULT_DICTATIONS);
    return dictations.find((d) => d._id === id || d.id === id) || null;
  },

  createDictation(data) {
    const dictations = readFile("dev_dictations.json", DEFAULT_DICTATIONS);
    const newDictation = {
      _id: "dict_" + Date.now().toString(),
      id: "dict_" + Date.now().toString(),
      advocateId: data.advocateId || "adv_1",
      title: data.title || `Chamber Dictation — ${new Date().toLocaleDateString("en-IN")}`,
      category: data.category || "General Chamber",
      matter: data.matter || "General Practice",
      matterId: data.matterId || "",
      duration: data.duration || "00:45",
      date: data.date || "Just now",
      transcript: data.transcript || "",
      actionItems: Array.isArray(data.actionItems) ? data.actionItems : [],
      audioUrl: data.audioUrl || "",
      status: "archived",
      createdAt: new Date().toISOString(),
      ...data,
    };
    dictations.unshift(newDictation);
    writeFile("dev_dictations.json", dictations);
    return newDictation;
  },

  deleteDictation(id) {
    const dictations = readFile("dev_dictations.json", DEFAULT_DICTATIONS);
    const filtered = dictations.filter((d) => d._id !== id && d.id !== id);
    writeFile("dev_dictations.json", filtered);
    return filtered.length < dictations.length;
  },

  convertDictationToCaseNote(id, advocateId = "adv_1") {
    const dictations = readFile("dev_dictations.json", DEFAULT_DICTATIONS);
    const dict = dictations.find((d) => d._id === id || d.id === id);
    if (!dict) return null;

    const actionList = (dict.actionItems || []).map((a, i) => `${i + 1}. ${a}`).join("\n");
    const noteContent = `${dict.transcript}\n\nKey Action Items:\n${actionList}`;

    const newNote = this.addCaseNote({
      advocateId,
      matterId: dict.matterId || "general",
      matterTitle: dict.matter || "General Chamber Practice",
      title: `[Audio Dictation] ${dict.title}`,
      content: noteContent,
      category: dict.category === "Cross-Exam Strategy" ? "precedent_notes" : "client_instructions",
      isConfidential: true,
      tags: ["Voice Dictation", dict.category, "Chamber Memo"],
    });

    return newNote;
  },

  // --- ERP: Trust / IOLTA Escrow Accounting ---
  getTrustTransactions(advocateId = "adv_1") {
    const transactions = readFile("dev_trust.json", DEFAULT_TRUST_TRANSACTIONS);
    if (!transactions || transactions.length === 0) {
      writeFile("dev_trust.json", DEFAULT_TRUST_TRANSACTIONS);
      return DEFAULT_TRUST_TRANSACTIONS;
    }
    return transactions;
  },

  addTrustTransaction(data) {
    const transactions = readFile("dev_trust.json", DEFAULT_TRUST_TRANSACTIONS);
    const newTx = {
      _id: "tru_" + Date.now().toString(),
      id: "tru_" + Date.now().toString(),
      advocateId: data.advocateId || "adv_1",
      type: data.type || "deposit",
      clientName: data.clientName || "Client Deposit",
      citizenId: data.citizenId || "default_citizen",
      matterTitle: data.matterTitle || "General Client Escrow",
      matterId: data.matterId || "",
      amount: Number(data.amount) || 0,
      purpose: data.purpose || "Advance Retainer Escrow",
      referenceNumber: data.referenceNumber || `TXN/${Date.now()}`,
      verifiedBy: data.verifiedBy || "Adv. Meera Krishnan",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      status: "cleared",
      createdAt: new Date().toISOString(),
      ...data,
    };
    transactions.unshift(newTx);
    writeFile("dev_trust.json", transactions);
    return newTx;
  },

  // --- ERP: Chamber Disbursements & Expenses ---
  getExpenses(advocateId = "adv_1") {
    const expenses = readFile("dev_expenses.json", DEFAULT_EXPENSES);
    if (!expenses || expenses.length === 0) {
      writeFile("dev_expenses.json", DEFAULT_EXPENSES);
      return DEFAULT_EXPENSES;
    }
    return expenses;
  },

  addExpense(data) {
    const expenses = readFile("dev_expenses.json", DEFAULT_EXPENSES);
    const newExp = {
      _id: "exp_" + Date.now().toString(),
      id: "exp_" + Date.now().toString(),
      advocateId: data.advocateId || "adv_1",
      matterTitle: data.matterTitle || "Chamber Operations",
      matterId: data.matterId || "general",
      clientName: data.clientName || "Chamber Expense",
      category: data.category || "Court Fee Stamps & Welfare",
      amount: Number(data.amount) || 0,
      description: data.description || "Chamber operating disbursement",
      paidBy: data.paidBy || "Chamber Petty Cash",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      receiptNumber: data.receiptNumber || `RCP/${Date.now().toString().slice(-4)}`,
      isReimbursable: data.isReimbursable !== undefined ? data.isReimbursable : true,
      status: "approved",
      createdAt: new Date().toISOString(),
      ...data,
    };
    expenses.unshift(newExp);
    writeFile("dev_expenses.json", expenses);
    return newExp;
  },

  // --- ERP: Human Resource Management (Huremaso) ---
  getAssociates(advocateId = "adv_1") {
    const associates = readFile("dev_associates.json", DEFAULT_ASSOCIATES);
    if (!associates || associates.length === 0) {
      writeFile("dev_associates.json", DEFAULT_ASSOCIATES);
      return DEFAULT_ASSOCIATES;
    }
    return associates;
  },

  addAssociate(data) {
    const associates = readFile("dev_associates.json", DEFAULT_ASSOCIATES);
    const newAsc = {
      _id: "asc_" + Date.now().toString(),
      id: "asc_" + Date.now().toString(),
      advocateId: data.advocateId || "adv_1",
      fullName: data.fullName,
      role: data.role || "Litigation Junior",
      enrollmentNumber: data.enrollmentNumber || "Bar Enrollment Pending",
      phone: data.phone || "",
      email: data.email || "",
      status: "Active",
      courtPass: data.courtPass || "KHCAA Temporary Pass",
      activeMattersAssigned: Number(data.activeMattersAssigned) || 0,
      attendanceToday: "Present — Chamber Desk",
      createdAt: new Date().toISOString(),
      ...data,
    };
    associates.unshift(newAsc);
    writeFile("dev_associates.json", associates);
    return newAsc;
  },

  // --- ERP: Overview & Financial Ledger Summary ---
  getErpOverview(advocateId = "adv_1") {
    const invoices = this.getInvoices(advocateId);
    const trust = this.getTrustTransactions(advocateId);
    const expenses = this.getExpenses(advocateId);
    const associates = this.getAssociates(advocateId);
    const clients = this.getClients(advocateId);

    const totalBilled = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    const totalCollected = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    const totalPending = totalBilled - totalCollected;

    const totalTrustDeposits = trust
      .filter((t) => t.type === "deposit")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalTrustDisbursements = trust
      .filter((t) => t.type === "disbursement")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const trustEscrowBalance = totalTrustDeposits - totalTrustDisbursements;

    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const reimbursableExpenses = expenses
      .filter((e) => e.isReimbursable)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const totalGstBilled = invoices.reduce((sum, inv) => sum + (Number(inv.gstAmount) || 0), 0);

    return {
      financials: {
        totalBilled,
        totalCollected,
        totalPending,
        trustEscrowBalance,
        totalTrustDeposits,
        totalTrustDisbursements,
        totalExpenses,
        reimbursableExpenses,
        totalGstBilled,
        gstRcmEligibleCount: invoices.filter((i) => i.clientName?.toLowerCase().includes("ltd") || i.clientName?.toLowerCase().includes("llp")).length,
      },
      counts: {
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter((i) => i.status === "paid").length,
        pendingInvoices: invoices.filter((i) => i.status !== "paid").length,
        trustTransactions: trust.length,
        expensesCount: expenses.length,
        associatesCount: associates.length,
        retainersCount: clients.filter((c) => c.status === "Retainer" || c.category?.toLowerCase().includes("corporate")).length,
      },
    };
  },

  // --- Bench Analytics & Chamber Reports ---
  getBenchAnalytics(advocateId = "adv_1") {
    const matters = this.getMatters(advocateId);
    const causelist = this.getCauseList(advocateId);
    const invoices = this.getInvoices(advocateId);

    return {
      kpis: {
        winRate: "89.2%",
        judgmentsAnalyzed: 148,
        avgDisposalMonths: "4.1 Mos",
        citationEfficacy: "99.4%",
        favorableSettlementRatio: "78.5%",
        activeMattersCount: matters.length,
        todayHearingsCount: causelist.length,
      },
      practiceAreas: [
        { area: "Constitutional & Writ Petitions (Art. 226)", rate: "93%", count: `${matters.length + 8} matters` },
        { area: "Commercial Arbitration & S.34 Appeals", rate: "88%", count: "6 matters" },
        { area: "Land Property, Boundary & Telegraph Injunctions", rate: "86%", count: "8 matters" },
        { area: "Corporate Retainer & MCA Compliance", rate: "95%", count: "5 matters" },
        { area: "Cheque Dishonour (S. 138 NI Act) & Summary Suits", rate: "84%", count: "4 matters" },
      ],
      courtBenches: [
        {
          bench: "Court Hall 2A • Division Bench (High Court of Kerala)",
          judge: "Hon'ble Division Bench",
          matters: "14 hearings",
          disposition: "92% Favorable Relief",
        },
        {
          bench: "Court Hall 3B • Single Bench (Writ Jurisdiction)",
          judge: "Hon'ble Single Bench",
          matters: "11 hearings",
          disposition: "88% Interim Relief",
        },
        {
          bench: "Sub Court Ernakulam (Civil Suits & Injunctions)",
          judge: "Principal Sub Judge",
          matters: "6 hearings",
          disposition: "85% Favorable Orders",
        },
        {
          bench: "Arbitral Tribunal • Infopark Kakkanad",
          judge: "Sole Arbitrator",
          matters: "4 hearings",
          disposition: "90% Favorable Discovery",
        },
      ],
    };
  },

  getChamberReports(advocateId = "adv_1") {
    const reports = readFile("dev_reports.json", DEFAULT_CHAMBER_REPORTS);
    if (!reports || reports.length === 0) {
      writeFile("dev_reports.json", DEFAULT_CHAMBER_REPORTS);
      return DEFAULT_CHAMBER_REPORTS;
    }
    return reports;
  },

  generateChamberReport(data) {
    const reports = readFile("dev_reports.json", DEFAULT_CHAMBER_REPORTS);
    const newReport = {
      _id: "rep_" + Date.now().toString(),
      id: "rep_" + Date.now().toString(),
      title: data.title || `Comprehensive Chamber Practice Audit — ${new Date().toLocaleDateString("en-IN")}`,
      category: data.category || "General Audit",
      period: data.period || "Current Quarter 2026",
      generatedDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      metrics: data.metrics || {
        totalBriefs: 18,
        admittedRate: "92.0%",
        interimReliefObtained: 14,
        disposedFavorable: 11,
      },
      fileSize: "2.2 MB PDF",
      status: "Certified",
      createdAt: new Date().toISOString(),
      ...data,
    };
    reports.unshift(newReport);
    writeFile("dev_reports.json", reports);
    return newReport;
  },

  // --- Case Preparation & Bench Argument Dossiers ---
  getCasePrepDossier(matterId = "mat_wpc_19482") {
    const store = readFile("dev_case_prep.json", {});
    if (store[matterId]) {
      return store[matterId];
    }

    // Default High Court Benchmark Dossier for WP(C) 19482/2024
    if (matterId === "mat_wpc_19482" || matterId.includes("19482") || matterId.toLowerCase().includes("gopakumar")) {
      const defaultDossier = {
        matterId: "mat_wpc_19482",
        matterTitle: "WP(C) 19482/2024 — Gopakumar v. Kerala State Electricity Board & Anr.",
        caseNumber: "WP(C) 19482/2024",
        courtForum: "High Court of Kerala (Ernakulam)",
        bench: "Court Hall 2A (Division Bench)",
        coram: "Hon'ble Mr. Justice A. Muhamed Mustaque & Hon'ble Mrs. Justice Shoba Annamma Eapen",
        hearingStage: "Urgent Motion for Ad-Interim Injunction & Direction",
        itemNumber: "Item #14",
        listedDate: "02-Nov-2024",
        issues: [
          {
            id: "iss-1",
            issueNumber: "I",
            title: "Jurisdictional Bar under Section 16(1) Telegraph Act",
            question: "Whether the licensee (KSEB) has unilateral statutory jurisdiction to proceed with stringing overhead lines across petitioner's yielding land once written objection under Section 16(1) has been registered, without referral to the District Magistrate?",
            status: "Strong Favourable (Governed by Valsamma DB 2024)",
            governingLaw: "Indian Telegraph Act, 1885 (Section 10 & 16(1))",
            isCore: true,
          },
          {
            id: "iss-2",
            issueNumber: "II",
            title: "Breach of Natural Justice & Article 14/300A",
            question: "Whether Exhibit P-6 alignment notice passed behind the petitioner's back without spot inspection or personal hearing violates Audi Alteram Partem and proprietary protections under Article 300A?",
            status: "Strong Favourable",
            governingLaw: "Constitution of India (Articles 14 & 300A)",
            isCore: true,
          },
          {
            id: "iss-3",
            issueNumber: "III",
            title: "Statutory Duty to Minimize Damage (Section 10(d))",
            question: "Whether the respondents are bound to divert the alignment along the unobstructed public PWD road margin which runs 40 meters away, thereby causing 'least possible damage'?",
            status: "Disputed (KSEB Counter Filed)",
            governingLaw: "Indian Telegraph Act, 1885 (Section 10(d))",
            isCore: false,
          },
        ],
        precedents: [
          {
            id: "prec-1",
            citation: "2024 (2) KHC 401 (DB)",
            caseName: "Valsamma & Ors. v. Kerala State Electricity Board & Anr.",
            court: "High Court of Kerala (Division Bench)",
            benchCoram: "Mustaque & Eapen, JJ.",
            ratio: "Licensee has no unbridled discretion to cut trees or draw lines through private land once an objection is raised. Referral to the District Magistrate under Section 16(1) is mandatory prior to commencement of works.",
            keyParagraphs: "Paras 14, 18 & 22",
            howToApply: "Directly binding on Single Bench and Division Bench. Hand up certified true copy when countering Standing Counsel's contention on emergent grid needs.",
            isBookmarked: true,
          },
          {
            id: "prec-2",
            citation: "(2017) 5 SCC 143",
            caseName: "Power Grid Corporation of India Ltd. v. Century Textiles & Industries Ltd.",
            court: "Supreme Court of India (3-Judge Bench)",
            benchCoram: "A.K. Sikri & R.K. Agrawal, JJ.",
            ratio: "Powers under Section 10 are subject to landowner's right to resist, which immediately triggers the adjudicatory jurisdiction of the District Magistrate under Section 16.",
            keyParagraphs: "Para 26",
            howToApply: "Cite to show Supreme Court concord with Kerala High Court doctrine.",
            isBookmarked: true,
          },
          {
            id: "prec-3",
            citation: "1970 KLT 872 (FB)",
            caseName: "Bharat Plywood and Timber Products v. KSEB",
            court: "High Court of Kerala (Full Bench)",
            benchCoram: "Raman Nayar, C.J.",
            ratio: "Section 10(d) imposes an affirmative duty on electricity authorities to do the least possible damage to private lands.",
            keyParagraphs: "Paras 6 & 8",
            howToApply: "Use to argue for PWD road margin diversion.",
            isBookmarked: false,
          },
        ],
        benchInquiries: [
          {
            id: "bi-1",
            question: "Counsel, why did your client wait 7 months between Exhibit P-6 order and filing this Article 226 petition?",
            rebuttalAnswer: "My Lord, the petitioner was diligently pursuing statutory representation Exhibit P-4 before the District Magistrate as commanded by Section 16(1). The delay is bona fide pursuit of administrative remedies, not contumacious laches. Moreover, physical entry was only threatened on 14-Aug-2024.",
            difficulty: "High",
            supportingExhibits: "Exhibit P-4 (Speed Post A/D) & Exhibit P-7 (Collectorate Diary Receipt)",
          },
          {
            id: "bi-2",
            question: "Is the line stringing already completed or are foundation towers erected?",
            rebuttalAnswer: "No, My Lord. Only wooden surveyor pegs were driven on 14-Aug-2024. No conductor stringing has occurred. An ad-interim stay preserves the absolute status quo with zero disruption to the statewide transmission network.",
            difficulty: "Medium",
            supportingExhibits: "Exhibit P-3 (Spot Mahazar & Photos)",
          },
          {
            id: "bi-3",
            question: "Can an individual landowner stall a public infrastructure transmission project of state importance?",
            rebuttalAnswer: "My Lord, the petitioner is not stalling the grid. We are praying for route alignment along the unobstructed PWD road margin 40 meters west, or that the District Magistrate conduct the statutory hearing under Section 16(1) as required by the Division Bench in Valsamma.",
            difficulty: "High",
            supportingExhibits: "Exhibit P-5 (Re-survey Sketch & Alignment Comparison Map)",
          },
        ],
        speakingNotes: [
          {
            order: 1,
            timeMark: "00:00 - 01:30",
            heading: "Opening & Impugned Memo",
            content: "May it please your Lordships: This Writ Petition challenges Exhibit P-6 unilateral alignment notice dated 04-03-2024. Petitioner is an agricultural smallholder in Aluva holding 28.5 Cents of registered rubber and fruit groves vide Exhibit P-1 title deed.",
            focusExhibit: "Exhibit P-1 & P-6",
          },
          {
            order: 2,
            timeMark: "01:30 - 03:30",
            heading: "Statutory Violation of Section 16(1)",
            content: "On 14-Aug-2024, respondents entered the property without prior statutory notice. Petitioner immediately registered written objection Exhibit P-4. Section 16(1) of the Indian Telegraph Act is peremptory: the moment resistance is offered, licensee's executive power ceases until the District Magistrate orders entry.",
            focusExhibit: "Exhibit P-4",
          },
          {
            order: 3,
            timeMark: "03:30 - 06:00",
            heading: "Binding Division Bench Doctrine",
            content: "Handing up Valsamma v. KSEB [2024 (2) KHC 401 DB]. At Paragraph 18, their Lordships held that the licensee cannot sit in judgment of its own cause. Entry without Collector's order is illegal trespass.",
            focusExhibit: "2024 (2) KHC 401 DB (Para 18)",
          },
          {
            order: 4,
            timeMark: "06:00 - 07:30",
            heading: "Interim Ad-Interim Relief Prayer",
            content: "Praying for an interim order restraining tree felling and conductor stringing until Respondent No. 3 District Magistrate conducts hearing and renders formal decision on Exhibit P-4 objection.",
            focusExhibit: "Interim Stay I.A.",
          },
        ],
        witnessQuestions: [
          {
            id: "wq-1",
            witnessName: "DW-1 (Executive Engineer, KSEB Transmission Division)",
            witnessRole: "Respondent Official Witness",
            questions: [
              {
                qNo: 1,
                questionText: "Did your office receive Exhibit P-4 written objection sent by the Petitioner on 22-Aug-2024?",
                objective: "Establish formal notice and concession of receipt",
                targetAdmission: "Must admit receipt via Speed Post A/D",
                isAsked: false,
              },
              {
                qNo: 2,
                questionText: "Before ordering the contractors to enter the property, did your department obtain an authorization order under Section 16(1) from the District Magistrate, Ernakulam?",
                objective: "Establish complete lack of statutory jurisdiction and violation of Valsamma ruling",
                targetAdmission: "No DM order was obtained",
                isAsked: false,
              },
              {
                qNo: 3,
                questionText: "Is it not a fact that a 12-meter wide public PWD road runs parallel to the western boundary of the petitioner's property?",
                objective: "Prove feasible alternative alignment causing zero damage under Section 10(d)",
                targetAdmission: "Admits existence of public road margin",
                isAsked: false,
              },
            ],
          },
        ],
        evidenceExhibits: [
          { mark: "Ext. P-1", title: "Registered Title Deed No. 1842/2018 (SRO Aluva)", verified: true, admissibility: "Admitted" },
          { mark: "Ext. P-2", title: "Basic Land Tax Remittance Receipt (FY 2024-25)", verified: true, admissibility: "Admitted" },
          { mark: "Ext. P-3", title: "Scene Mahazar & Tree Census prepared by Village Officer", verified: true, admissibility: "Verified by Court Commissioner" },
          { mark: "Ext. P-4", title: "Written Statutory Objection under Section 16(1) with Speed Post Receipt", verified: true, admissibility: "Admitted" },
          { mark: "Ext. P-5", title: "Comparative Alignment Map showing Public Road Corridor", verified: true, admissibility: "Expert Surveyor Map" },
          { mark: "Ext. P-6", title: "Impugned Order / Route Marking Notice No. TD/ALV/104", verified: true, admissibility: "Under Challenge" },
        ],
        lastUpdated: new Date().toISOString(),
      };
      store[matterId] = defaultDossier;
      writeFile("dev_case_prep.json", store);
      return defaultDossier;
    }

    // Dynamic Initial Dossier for other matters
    const matters = readFile("dev_matters.json", DEFAULT_MATTERS);
    const m = matters.find((item) => item._id === matterId || item.caseNumber === matterId) || {};

    const initializedDossier = {
      matterId,
      matterTitle: m.matterTitle || "Pleading Matter",
      caseNumber: m.caseNumber || "Case Pending",
      courtForum: m.courtForum || "High Court of Kerala (Ernakulam)",
      bench: m.courtHall || "Court Hall 1",
      coram: "Hon'ble Presiding Judge",
      hearingStage: "Hearing on Admission / Preliminary Objections",
      itemNumber: "Item #12",
      listedDate: m.nextHearingDate ? new Date(m.nextHearingDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Next Cause List",
      issues: [
        {
          id: "iss-dyn-1",
          issueNumber: "I",
          title: "Maintainability & Prima Facie Cause of Action",
          question: `Whether the matter discloses a justiciable cause of action under ${m.statutoryActs?.[0] || "applicable statutes"}?`,
          status: "Strong Favourable",
          governingLaw: m.statutoryActs?.[0] || "Statutory Law",
          isCore: true,
        },
      ],
      precedents: [
        {
          id: "prec-dyn-1",
          citation: "2024 (2) KHC 401",
          caseName: "Valsamma & Ors. v. KSEB",
          court: "High Court of Kerala",
          benchCoram: "Division Bench",
          ratio: "Statutory powers must be exercised strictly within prescribed statutory procedural parameters.",
          keyParagraphs: "Para 14",
          howToApply: "Cite in opening arguments.",
          isBookmarked: true,
        },
      ],
      benchInquiries: [
        {
          id: "bi-dyn-1",
          question: "Counsel, what is the precise ad-interim relief sought today?",
          rebuttalAnswer: "My Lord, maintaining status quo pending receipt of respondent records.",
          difficulty: "Medium",
          supportingExhibits: "Pleading Affidavit",
        },
      ],
      speakingNotes: [
        {
          order: 1,
          timeMark: "00:00 - 02:00",
          heading: "Brief Factual Background",
          content: `May it please your Honour: Outlining the sequence of events leading to this petition under ${m.statutoryActs?.[0] || "the Act"}.`,
          focusExhibit: "Exhibit P-1",
        },
      ],
      witnessQuestions: [],
      evidenceExhibits: [
        { mark: "Ext. 1", title: "Primary Impugned Document / Deed", verified: true, admissibility: "Admitted" },
      ],
      lastUpdated: new Date().toISOString(),
    };

    store[matterId] = initializedDossier;
    writeFile("dev_case_prep.json", store);
    return initializedDossier;
  },

  saveCasePrepDossier(matterId, dossierData) {
    const store = readFile("dev_case_prep.json", {});
    store[matterId] = {
      ...dossierData,
      matterId,
      lastUpdated: new Date().toISOString(),
    };
    writeFile("dev_case_prep.json", store);
    return store[matterId];
  },

  // --- Autonomous AI Legal Agents & Workflows (Option 4) ---
  getAgents() {
    const agents = readFile("dev_agents.json", DEFAULT_AGENTS);
    if (!agents || agents.length === 0) {
      writeFile("dev_agents.json", DEFAULT_AGENTS);
      return DEFAULT_AGENTS;
    }
    return agents;
  },

  toggleAgentStatus(agentId) {
    const agents = this.getAgents();
    const idx = agents.findIndex((a) => a.id === agentId);
    if (idx !== -1) {
      agents[idx].status = agents[idx].status === "active" ? "paused" : "active";
      writeFile("dev_agents.json", agents);
      return agents[idx];
    }
    return null;
  },

  triggerAgent(agentId, params = {}) {
    const agents = this.getAgents();
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return null;

    const now = new Date();
    const nowTimeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " IST";
    let newLogs = [];
    let executionResult = {};

    if (agentId === "agent_causelist") {
      newLogs = [
        { timestamp: nowTimeStr, level: "info", message: "Connecting to eCourts High Court of Kerala API Gateway..." },
        { timestamp: nowTimeStr, level: "info", message: `Executing query for Advocate Roll No: ${agent.config?.barRollNumber || "K/1429/2016"}` },
        { timestamp: nowTimeStr, level: "info", message: "Parsing Court Hall 2A (Division Bench) & Court Hall 1 (Sub Court) daily rosters..." },
        { timestamp: nowTimeStr, level: "success", message: "Discovered 2 Active Items: Item #14 in Court Hall 2A (WP(C) 19482/2024) and Item #22 in Sub Court (OS 412/2023)." },
        { timestamp: nowTimeStr, level: "success", message: "Causelist synchronized with chamber calendar & WhatsApp alerts dispatched." },
      ];
      executionResult = {
        itemsDiscovered: 2,
        courtHall: "Court Hall 2A & Hall 1",
        bench: "Division Bench / Special Original",
        syncedToDashboard: true,
      };
    } else if (agentId === "agent_caveat") {
      newLogs = [
        { timestamp: nowTimeStr, level: "info", message: "Polling e-Filing Registry: Caveat Petitions under Section 148A CPC..." },
        { timestamp: nowTimeStr, level: "info", message: "Cross-matching against chamber active client roster (8 clients)..." },
        { timestamp: nowTimeStr, level: "success", message: "Verification completed: 0 adverse caveats registered in last 24 hours against active clients." },
        { timestamp: nowTimeStr, level: "info", message: "Caveat Watchlist status: Green / All clients cleared." },
      ];
      executionResult = {
        clientsScanned: 8,
        adverseCaveatsFound: 0,
        registryCleared: true,
      };
    } else if (agentId === "agent_bns_concordance") {
      newLogs = [
        { timestamp: nowTimeStr, level: "info", message: `Running BNS-BNSS Statutory Concordance Engine on query: "${params.query || "IPC 420 / CrPC 438"}"` },
        { timestamp: nowTimeStr, level: "info", message: "Cross-referencing Bharatiya Nyaya Sanhita 2023 & BNSS 2023 concordances..." },
        { timestamp: nowTimeStr, level: "success", message: "IPC Section 420 (Cheating) successfully mapped to BNS Section 318(4). Punishment: 7 Years + Fine." },
        { timestamp: nowTimeStr, level: "success", message: "CrPC Section 438 (Anticipatory Bail) mapped to BNSS Section 482. Procedural mandate verified." },
      ];
      executionResult = {
        ipcSection: "IPC 420",
        bnsSection: "BNS 318(4)",
        bnsTitle: "Cheating and dishonestly inducing delivery of property",
        punishment: "Imprisonment extending to 7 years and fine",
        bnssProcedure: "Section 482 (Anticipatory Bail)",
      };
    } else {
      newLogs = [
        { timestamp: nowTimeStr, level: "info", message: "Executing Client Intake Triage & Conflict Check..." },
        { timestamp: nowTimeStr, level: "info", message: "Scanning Chamber Representation History (Bar Council Rule 33)..." },
        { timestamp: nowTimeStr, level: "success", message: "Conflict Check: No prior representation of respondent found." },
        { timestamp: nowTimeStr, level: "success", message: "Jurisdiction & forum routing completed: High Court of Kerala (WP(C))." },
      ];
      executionResult = {
        conflictClear: true,
        recommendedCourt: "High Court of Kerala (Ernakulam)",
        estimatedStamp: "₹2,500",
      };
    }

    agent.lastRunAt = now.toISOString();
    agent.lastStatus = "success";
    agent.recentLogs = [...newLogs, ...(agent.recentLogs || [])].slice(0, 15);
    if (!agent.metrics) agent.metrics = { totalRuns: 1, successRate: "100%", itemsDiscovered: 1 };
    agent.metrics.totalRuns = (agent.metrics.totalRuns || 0) + 1;

    writeFile("dev_agents.json", agents);
    return { agent, logs: newLogs, executionResult };
  },

  convertBnsSection(query = "420") {
    const q = String(query).trim().toLowerCase();
    const map = {
      "420": {
        ipc: "IPC Section 420",
        ipcTitle: "Cheating and dishonestly inducing delivery of property",
        bns: "BNS Section 318(4)",
        bnsTitle: "Cheating and dishonestly inducing delivery of property",
        punishment: "Imprisonment of either description for a term which may extend to 7 years, and shall also be liable to fine.",
        substantiveChange: "Cognizable and non-bailable; triable by Magistrate of First Class. Language aligned with modern electronic property transactions.",
        correspondingBnss: "Section 173 (Registration of FIR) & Section 480/483 (Bail)",
      },
      "302": {
        ipc: "IPC Section 302",
        ipcTitle: "Punishment for Murder",
        bns: "BNS Section 103(1)",
        bnsTitle: "Punishment for Murder",
        punishment: "Death or imprisonment for life, and shall also be liable to fine.",
        substantiveChange: "Includes sub-section 103(2) penalizing mob lynching by 5 or more persons based on race, caste, or community with death or life imprisonment.",
        correspondingBnss: "Section 193 (Charge-sheet) & Section 483 (High Court Bail)",
      },
      "379": {
        ipc: "IPC Section 379",
        ipcTitle: "Punishment for Theft",
        bns: "BNS Section 303(2)",
        bnsTitle: "Punishment for Theft",
        punishment: "Imprisonment of either description for a term which may extend to 3 years, or with fine, or with both.",
        substantiveChange: "First-time offenders where stolen value is under ₹5,000 may be awarded Community Service upon return of property under proviso to Section 303(2).",
        correspondingBnss: "Section 173 / Section 480",
      },
      "406": {
        ipc: "IPC Section 406",
        ipcTitle: "Punishment for Criminal Breach of Trust",
        bns: "BNS Section 316(2)",
        bnsTitle: "Punishment for Criminal Breach of Trust",
        punishment: "Imprisonment of either description for a term which may extend to 5 years, or with fine, or with both.",
        substantiveChange: "Increased maximum imprisonment from 3 years under IPC to 5 years under BNS 316(2).",
        correspondingBnss: "Section 480 / Section 482",
      },
      "498a": {
        ipc: "IPC Section 498A",
        ipcTitle: "Husband or relative of husband of a woman subjecting her to cruelty",
        bns: "BNS Section 85",
        bnsTitle: "Husband or relative of husband subjecting woman to cruelty",
        punishment: "Imprisonment for a term which may extend to 3 years and shall also be liable to fine.",
        substantiveChange: "Substantive definition of cruelty maintained; placed under Chapter V (Offences Against Women and Children).",
        correspondingBnss: "Section 482 (Anticipatory Bail before High Court)",
      },
      "438": {
        ipc: "CrPC Section 438",
        ipcTitle: "Direction for grant of bail to person apprehending arrest (Anticipatory Bail)",
        bns: "BNSS Section 482",
        bnsTitle: "Direction for grant of bail to person apprehending arrest",
        punishment: "Procedural Bail Mandate",
        substantiveChange: "High Court and Court of Session retain concurrent jurisdiction. Statutory notice to Public Prosecutor and mandatory presence conditions preserved.",
        correspondingBnss: "Section 482 BNSS 2023",
      },
    };

    const cleanNum = q.replace(/[^0-9a-z]/g, "");
    return map[cleanNum] || map["420"];
  },

  // --- Chamber Knowledge Base & Bare Act Studio (Milestone 1) ---
  getBareActs(query = "") {
    const acts = readFile("dev_bare_acts.json", DEFAULT_BARE_ACTS);
    if (!query || !query.trim()) return acts;
    const q = query.toLowerCase();
    return acts.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.shortTitle.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.sections.some((s) => s.sectionNumber.toLowerCase().includes(q) || s.heading.toLowerCase().includes(q))
    );
  },

  getBareActDetails(actId) {
    const acts = readFile("dev_bare_acts.json", DEFAULT_BARE_ACTS);
    return acts.find((a) => a.id === actId) || acts[0];
  },

  getPlaybooks() {
    return readFile("dev_playbooks.json", DEFAULT_PLAYBOOKS);
  },

  getKbArticles() {
    return readFile("dev_kb_articles.json", DEFAULT_KB_ARTICLES);
  },

  getResearchBriefs(advocateId = "adv_1") {
    return readFile("dev_research_briefs.json", DEFAULT_RESEARCH_BRIEFS);
  },

  createResearchBrief(data) {
    const briefs = readFile("dev_research_briefs.json", DEFAULT_RESEARCH_BRIEFS);
    const newBrief = {
      _id: "brief_" + Date.now().toString(),
      id: "brief_" + Date.now().toString(),
      title: data.title || "Untitled Research Brief",
      matterReference: data.matterReference || "General Chamber Research",
      category: data.category || "Constitutional Law",
      legalPropositions: data.legalPropositions || [],
      citations: data.citations || [],
      author: data.author || "Adv. Meera Krishnan",
      summary: data.summary || "",
      createdAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      ...data,
    };
    briefs.unshift(newBrief);
    writeFile("dev_research_briefs.json", briefs);
    return newBrief;
  },

  // --- Multi-Party Case Collaboration Room (Milestone 2) ---
  getCollabRooms(advocateId = "adv_1") {
    return readFile("dev_collab_rooms.json", DEFAULT_COLLAB_ROOMS);
  },

  getCollabRoomById(roomId) {
    const rooms = readFile("dev_collab_rooms.json", DEFAULT_COLLAB_ROOMS);
    return rooms.find((r) => r.id === roomId) || rooms[0];
  },

  createCollabRoom(data) {
    const rooms = readFile("dev_collab_rooms.json", DEFAULT_COLLAB_ROOMS);
    const newRoom = {
      id: data.id || "room_" + Date.now().toString(),
      subject: data.subject || "Chamber Case Collaboration Session",
      matterId: data.matterId || "mat_wpc_19482",
      matterTitle: data.matterTitle || "WP(C) 19482/2024 — Gopakumar v. KSEB & Anr.",
      status: "ready",
      scheduledFor: data.scheduledFor || "Immediate Session",
      pinnedExhibit: data.pinnedExhibit || {
        id: "exh_survey_p1",
        title: "Annexure P-1: Survey Sketch Re-survey Plan Block 14",
        pages: 4,
        currentPage: 1,
        type: "pdf",
        matter: data.matterTitle || "WP(C) 19482/2024",
      },
      participants: data.participants || [
        {
          id: "adv_1",
          name: "Adv. Meera Krishnan",
          role: "Lead Advocate (Host)",
          enrollment: "K/1429/2016",
          isOnline: true,
          isMuted: false,
          isVideoOn: true,
        },
      ],
      notes: "",
      createdAt: new Date().toISOString(),
      ...data,
    };
    rooms.unshift(newRoom);
    writeFile("dev_collab_rooms.json", rooms);
    return newRoom;
  },

  saveCollabNotes(roomId, notes, advocateId = "adv_1") {
    const rooms = readFile("dev_collab_rooms.json", DEFAULT_COLLAB_ROOMS);
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      room.notes = notes;
      writeFile("dev_collab_rooms.json", rooms);

      // Also automatically create or update a case note for the associated matter
      if (room.matterId) {
        devStore.addCaseNote({
          advocateId,
          matterId: room.matterId,
          title: `Collaboration Room Notes: ${room.subject}`,
          content: notes,
          category: "hearing_memo",
          isConfidential: true,
        });
      }
      return room;
    }
    return null;
  },

  // --- Courtroom Oral Argument AI Simulator & Bench Query Coach (Milestone 3) ---
  simulateBenchTurn(data) {
    const {
      matterId = "mat_wpc_19482",
      benchPersona = "division_bench_2a",
      argument = "",
      turnIndex = 0,
    } = data;

    const lowerArg = argument.toLowerCase();

    // Check for legal keywords in argument
    const hasValsamma = lowerArg.includes("valsamma");
    const hasSection16 = lowerArg.includes("16") || lowerArg.includes("section 16");
    const hasWhirlpool = lowerArg.includes("whirlpool");
    const hasNaturalJustice = lowerArg.includes("natural justice") || lowerArg.includes("audi alteram");
    const hasArbitrary = lowerArg.includes("arbitrary") || lowerArg.includes("article 14");
    const hasPrecedent = lowerArg.includes("scc") || lowerArg.includes("klt") || lowerArg.includes("air");
    const hasJurisdiction = lowerArg.includes("jurisdiction") || lowerArg.includes("maintainable");
    const hasInjunction = lowerArg.includes("injunction") || lowerArg.includes("stay") || lowerArg.includes("status quo");

    // Calculate dynamic scores based on legal quality
    let persuasiveness = 74;
    let statutoryPrecision = 72;
    let disposition = "Skeptical on Maintainability";
    let nextQuery = "";
    let recommendedCitation = "Whirlpool Corporation v. Registrar of Trade Marks (1998) 8 SCC 1";
    let coachCritique = "Good opening demeanor. However, address the statutory remedy under Section 16(3) before pressing for Article 226.";

    if (benchPersona === "division_bench_2a") {
      // Mustaque & Eapen, JJ. - Kerala High Court Division Bench 2A
      if (turnIndex === 0) {
        if (hasWhirlpool || hasJurisdiction || hasNaturalJustice) {
          persuasiveness = 88;
          statutoryPrecision = 90;
          disposition = "Engaged on Statutory Jurisdiction";
          nextQuery =
            "Counsel, we take note of Whirlpool. But look at paragraph 8 of the KSEB counter affidavit. They claim the transmission line falls under an already notified gazette corridor under Section 164. What is your specific factual answer to the gazette alignment?";
          recommendedCitation = "Power Grid Corp of India v. Century Textiles Ltd (2017) 5 SCC 143";
          coachCritique =
            "Strong rebuttal establishing lack of jurisdiction. Now pivot directly to the absence of landowner notice prior to the gazette notification.";
        } else {
          persuasiveness = 75;
          statutoryPrecision = 72;
          disposition = "Skeptical on Alternative Remedy";
          nextQuery =
            "Counsel, before we examine the merits of your tree-felling grievance, why should this Division Bench exercise extraordinary prerogative writ jurisdiction when Section 16(3) of the Telegraph Act provides an efficacious statutory forum before the District Court?";
          recommendedCitation = "Whirlpool Corporation v. Registrar of Trade Marks (1998) 8 SCC 1";
          coachCritique =
            "You must invoke the three exceptions in Whirlpool Corporation (breach of natural justice, total lack of jurisdiction, or violation of fundamental rights) to bypass the alternate remedy bar.";
        }
      } else if (turnIndex === 1) {
        if (hasValsamma || hasSection16) {
          persuasiveness = 94;
          statutoryPrecision = 96;
          disposition = "Inclined to Grant Interim Order";
          nextQuery =
            "Very well, Counsel. Valsamma is a Full Bench decision binding on us. If resistance was formally lodged and the licensee did not approach the District Magistrate, the entry appears prima facie without authority of law. What interim directions are you seeking pending counter from the Board?";
          recommendedCitation = "Valsamma v. KSEB 2012 (2) KLT 368 (Full Bench)";
          coachCritique =
            "Outstanding invocation of the Valsamma Full Bench ratio! You have persuaded the Bench that the board cannot enter private land upon objection without a District Magistrate order under Section 16(1). Frame your interim prayer concisely.";
        } else {
          persuasiveness = 78;
          statutoryPrecision = 80;
          disposition = "Pressing for Precedent Authority";
          nextQuery =
            "You argue that the utility cannot enter upon resistance, but which binding precedent of this Court establishes that the authority MUST refer the matter to the District Magistrate rather than proceeding unilaterally?";
          recommendedCitation = "Valsamma v. KSEB 2012 (2) KLT 368 (Full Bench)";
          coachCritique =
            "Immediately cite Valsamma v. KSEB 2012 (2) KLT 368 (FB). That judgment directly settles that unilateral entry upon landowner objection is an actionable trespass.";
        }
      } else {
        if (hasInjunction || hasArbitrary || hasValsamma) {
          persuasiveness = 96;
          statutoryPrecision = 98;
          disposition = "Interim Stay Granted";
          nextQuery =
            "We have heard the Counsel. In view of the law laid down in Valsamma and absence of an order under Section 16(1), there shall be an interim stay of all felling activities in Sy. No. 142/3 for a period of four weeks. Standing counsel to file detailed counter.";
          recommendedCitation = "Executive Engineer, KSEB v. Doddakka (2015) 15 SCC 738";
          coachCritique =
            "Full oral argument victory! Bench disposition converted from skeptical to an interim stay of execution.";
        } else {
          persuasiveness = 85;
          statutoryPrecision = 84;
          disposition = "Notice Before Admission Issued";
          nextQuery =
            "We will issue Notice Before Admission to respondents 1 to 3 returnable in two weeks. Status quo to be maintained in the interregnum.";
          recommendedCitation = "Century Textiles & Industries Ltd (2017) 5 SCC 143";
          coachCritique =
            "Favorable result achieved. For next rehearsal, emphasize the precise survey number to secure an absolute stay rather than mere status quo.";
        }
      }
    } else {
      // Single Bench / General Criminal / Commercial Bench
      if (hasPrecedent || hasSection16 || hasWhirlpool) {
        persuasiveness = 91;
        statutoryPrecision = 92;
        disposition = "Persuaded on Merits";
        nextQuery =
          "Counsel, your precedent formulation is coherent. How do you respond to the question of delay and laches in approaching this Court?";
        recommendedCitation = "State of M.P. v. Bhailal Bhai AIR 1964 SC 1006";
        coachCritique = "Well argued on substantive grounds. Rebut the laches query by showing immediate cause of action.";
      } else {
        persuasiveness = 76;
        statutoryPrecision = 74;
        disposition = "Seeking Clarification";
        nextQuery =
          "Counsel, substantiate your oral submission with specific statutory provisions and judicial ratios. Which Section is violated?";
        recommendedCitation = "Arnesh Kumar v. State of Bihar (2014) 8 SCC 273";
        coachCritique = "Anchor your argument in statutory subsections rather than broad assertions.";
      }
    }

    return {
      success: true,
      turnIndex: turnIndex + 1,
      benchPersona,
      matterId,
      benchQuery: nextQuery,
      persuasiveness,
      statutoryPrecision,
      disposition,
      recommendedCitation,
      coachCritique,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
  },

  getCourtroomSessions(advocateId = "adv_1") {
    return readFile("dev_courtroom_sessions.json", DEFAULT_COURTROOM_SESSIONS);
  },

  saveCourtroomSession(data) {
    const sessions = readFile("dev_courtroom_sessions.json", DEFAULT_COURTROOM_SESSIONS);
    const newSession = {
      id: "session_" + Date.now().toString(),
      advocateId: data.advocateId || "adv_1",
      matterId: data.matterId || "mat_wpc_19482",
      matterTitle: data.matterTitle || "WP(C) 19482/2024",
      benchPersona: data.benchPersona || "division_bench_2a",
      benchName: data.benchName || "Kerala High Court Division Bench 2A",
      finalScore: data.finalScore || 92,
      statutoryPrecision: data.statutoryPrecision || 94,
      disposition: data.disposition || "Interim Stay Granted",
      turns: data.turns || [],
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      duration: data.duration || "06:42",
      ...data,
    };
    sessions.unshift(newSession);
    writeFile("dev_courtroom_sessions.json", sessions);
    return newSession;
  },

  // --- Personal AI Legal Twin & Autonomous Associate Workforce Studio (Milestone 4) ---
  getAdvocateTwin(advocateId = "adv_1") {
    const twins = readFile("dev_ai_twins.json", { [advocateId]: DEFAULT_AI_TWIN });
    return twins[advocateId] || { ...DEFAULT_AI_TWIN, advocateId };
  },

  updateAdvocateTwin(advocateId = "adv_1", updateData = {}) {
    const twins = readFile("dev_ai_twins.json", { [advocateId]: DEFAULT_AI_TWIN });
    const current = twins[advocateId] || { ...DEFAULT_AI_TWIN, advocateId };
    const updated = {
      ...current,
      ...updateData,
      lastCalibratedAt: new Date().toISOString(),
    };
    twins[advocateId] = updated;
    writeFile("dev_ai_twins.json", twins);
    return updated;
  },

  simulateTwinReasoning(data = {}) {
    const {
      advocateId = "adv_1",
      query = "",
      draftingStyle = "constitutional_assertive",
      primaryJurisdiction = "high_court_kerala",
    } = data;

    const lower = (query || "").toLowerCase();
    let legalOpinion = "";
    let proceduralRoadmap = [];
    let draftClause = "";
    let bindingCitations = [];
    let confidenceScore = 98.6;

    if (
      lower.includes("telegraph") ||
      lower.includes("kseb") ||
      lower.includes("line") ||
      lower.includes("tree") ||
      lower.includes("tower") ||
      lower.includes("16")
    ) {
      legalOpinion =
        "Under Section 10(d) of the Indian Telegraph Act, 1885, the transmission licensee acquires only a user right and is statutorily obligated to cause minimal damage. The moment the property owner offers resistance or files written objections, Section 16(1) mandates that the licensee must approach the District Magistrate for prior permission. Unilateral entry without a District Magistrate order is ultra vires and constitutes actionable trespass amenable to extraordinary writ jurisdiction under Article 226.";
      proceduralRoadmap = [
        "Issue immediate written objection notice under Section 16(1) to Assistant Executive Engineer, KSEB.",
        "Serve caveat petition or representation before the District Magistrate / District Collector, Ernakulam.",
        "File Writ Petition (Civil) under Article 226 before High Court of Kerala seeking mandamus directing referral under Section 16(1) and ad-interim injunction restraining line drawing.",
      ];
      draftClause =
        "It is most respectfully submitted that Respondent No. 2 acted wholly without jurisdiction in entering upon the Petitioner's residential plot without petitioning the District Magistrate under Section 16(1) of the Indian Telegraph Act, 1885, contrary to the binding Full Bench dictum in Valsamma v. KSEB 2012 (2) KLT 368.";
      bindingCitations = [
        "Valsamma v. KSEB 2012 (2) KLT 368 (Full Bench)",
        "Power Grid Corporation of India v. Century Textiles & Industries Ltd. (2017) 5 SCC 143",
        "Executive Engineer, KSEB v. Doddakka (2015) 15 SCC 738",
      ];
    } else if (
      lower.includes("138") ||
      lower.includes("cheque") ||
      lower.includes("negotiable") ||
      lower.includes("notice") ||
      lower.includes("alavi") ||
      lower.includes("demand")
    ) {
      legalOpinion =
        "Under Chapter XVII of the Negotiable Instruments Act, 1881, the cause of action is strictly governed by statutory timelines. Statutory demand notice must be dispatched within 30 days of receiving the bank memo. Where notice is returned unserved with endorsement 'Door Locked' or 'Not Claimed', the three-judge bench decision in C.C. Alavi Haji establishes deemed service under Section 27 of the General Clauses Act. The drawer has 15 days from deemed receipt to pay; failure creates a crystalline cause of action to file the complaint within the subsequent 30 days.";
      proceduralRoadmap = [
        "Procure official Postal Tracking Delivery / Return Certificate from Department of Posts.",
        "Compute 15-day statutory cure window starting from the date of postal delivery or return endorsement.",
        "Draft and institute Criminal Complaint under Section 138 read with Section 142(1)(b) before Judicial First Class Magistrate having territorial jurisdiction over payee bank branch.",
      ];
      draftClause =
        "The Complainant submits that the Statutory Demand Notice was dispatched via Registered Post with Acknowledgment Due to the correct residential address of the Accused. The returned postal envelope with endorsement 'Not Claimed' constitutes deemed service in law under Section 27 of the General Clauses Act as authoritatively settled in C.C. Alavi Haji v. Palapetty Muhammed (2007) 6 SCC 555.";
      bindingCitations = [
        "C.C. Alavi Haji v. Palapetty Muhammed (2007) 6 SCC 555",
        "K. Bhaskaran v. Sankaran Vaidhyan Balan (1999) 7 SCC 510",
        "Dashrath Rupsingh Rathod v. State of Maharashtra (2014) 9 SCC 129",
      ];
    } else if (
      lower.includes("bail") ||
      lower.includes("bnss") ||
      lower.includes("arrest") ||
      lower.includes("482") ||
      lower.includes("fir") ||
      lower.includes("custodial")
    ) {
      legalOpinion =
        "Under Section 482 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 (corresponding to legacy Section 438 CrPC), anticipatory bail is an extraordinary judicial discretion to protect personal liberty against unwarranted incarceration. Since the offence does not mandate life imprisonment and the accused has deep roots in the community, custodial interrogation is unnecessary if the applicant undertakes to cooperate with the investigating officer under Section 35(3) BNSS.";
      proceduralRoadmap = [
        "Verify issuance of Section 35(3) BNSS Notice of Appearance by Investigating Officer.",
        "Compile documentary proof demonstrating clean antecedents, proof of permanent residence, and willingness to join probe.",
        "File Pre-Arrest Bail Application under Section 482 BNSS before the High Court or Sessions Court with prayer for interim protection against coercive steps.",
      ];
      draftClause =
        "The Applicant respectfully submits that the allegations in the FIR are purely civil in texture and lack the foundational ingredients of criminal breach of trust. The Applicant undertakes to cooperate fully with the investigation, surrender passport, and abide by any condition imposed under Section 482(2) BNSS.";
      bindingCitations = [
        "Arnesh Kumar v. State of Bihar (2014) 8 SCC 273",
        "Sushila Aggarwal v. State (NCT of Delhi) (2020) 5 SCC 1",
        "Satender Kumar Antil v. CBI (2022) 10 SCC 51",
      ];
    } else {
      legalOpinion =
        "Reviewing this legal proposition under High Court of Kerala practice standards: Where administrative action is arbitrary, discriminatory, or violative of natural justice (audi alteram partem), the threshold bar of alternate statutory remedies is superseded pursuant to the Whirlpool doctrine. The chamber formulation requires asserting jurisdictional incompetence and procedural non-compliance in the primary synopsis.";
      proceduralRoadmap = [
        "Conduct thorough statutory scrutiny of impugned order or administrative communication.",
        "Formulate core questions of law emphasizing jurisdictional error or violation of Article 14.",
        "Institute appropriate writ or civil proceedings with prayer for status quo ante.",
      ];
      draftClause =
        "It is respectfully submitted that the impugned action violates the salutary principles of natural justice and is tainted with total non-application of mind, warranting the extraordinary exercise of this Hon'ble Court's plenary powers under Article 226 of the Constitution of India.";
      bindingCitations = [
        "Whirlpool Corporation v. Registrar of Trade Marks (1998) 8 SCC 1",
        "Maneka Gandhi v. Union of India (1978) 1 SCC 248",
        "State of M.P. v. Bhailal Bhai AIR 1964 SC 1006",
      ];
    }

    const simRecord = {
      id: "sim_" + Date.now().toString(),
      query,
      legalOpinion,
      proceduralRoadmap,
      draftClause,
      bindingCitations,
      confidenceScore,
      draftingStyle,
      primaryJurisdiction,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };

    const twins = readFile("dev_ai_twins.json", { [advocateId]: DEFAULT_AI_TWIN });
    const current = twins[advocateId] || { ...DEFAULT_AI_TWIN, advocateId };
    current.recentSimulations = [simRecord, ...(current.recentSimulations || []).slice(0, 9)];
    twins[advocateId] = current;
    writeFile("dev_ai_twins.json", twins);

    return {
      success: true,
      ...simRecord,
    };
  },

  getTrainingModules() {
    return readFile("dev_training_modules.json", DEFAULT_TRAINING_MODULES);
  },

  evaluateAssociateSubmission(data = {}) {
    const { moduleId, associateAnswer = "", associateName = "Junior Counsel" } = data;
    const modules = readFile("dev_training_modules.json", DEFAULT_TRAINING_MODULES);
    const mod = modules.find((m) => m.id === moduleId) || modules[0];

    const lowerAns = (associateAnswer || "").toLowerCase();
    let issueSpotting = 70;
    let statutoryPrecision = 72;
    let citationAccuracy = 68;

    if (mod.quizScenario && Array.isArray(mod.quizScenario.keyIssues)) {
      mod.quizScenario.keyIssues.forEach((issue) => {
        const words = issue.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        const match = words.some((w) => lowerAns.includes(w));
        if (match) {
          issueSpotting += 8;
          statutoryPrecision += 7;
        }
      });

      if (
        lowerAns.includes("scc") ||
        lowerAns.includes("klt") ||
        lowerAns.includes("air") ||
        lowerAns.includes("2024") ||
        lowerAns.includes("1998") ||
        lowerAns.includes("2007")
      ) {
        citationAccuracy += 22;
      }
    }

    issueSpotting = Math.min(98, issueSpotting);
    statutoryPrecision = Math.min(99, statutoryPrecision);
    citationAccuracy = Math.min(96, citationAccuracy);

    const overallScore = Math.round((issueSpotting + statutoryPrecision + citationAccuracy) / 3);
    const passed = overallScore >= 75;

    let seniorFeedback = passed
      ? "Commendable legal precision. The analysis properly distinguishes substantive vs procedural statutory application and cites the controlling High Court/Supreme Court ratio."
      : "The argument needs stronger grounding in exact statutory sections and landmark ratios. Revisit the module curriculum before drafting live pleadings.";

    const result = {
      success: true,
      moduleId,
      associateName,
      overallScore,
      passed,
      issueSpotting,
      statutoryPrecision,
      citationAccuracy,
      seniorFeedback,
      benchmarkAnswer: mod.quizScenario?.benchmarkAnswer || "",
      landmarkCitation: mod.quizScenario?.landmarkCitation || "",
      evaluatedAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };

    return result;
  },

  getRecruitmentCandidates() {
    return readFile("dev_candidates.json", DEFAULT_CANDIDATES);
  },

  addRecruitmentCandidate(data = {}) {
    const candidates = readFile("dev_candidates.json", DEFAULT_CANDIDATES);
    const newCand = {
      id: "cand_" + Date.now().toString(),
      name: data.name || "Candidate",
      college: data.college || "Government Law College, Ernakulam",
      role: data.role || "Litigation Associate",
      enrollmentNumber: data.enrollmentNumber || `K/${Math.floor(1000 + Math.random() * 9000)}/2024`,
      status: "Screening Review",
      score: "92%",
      experienceYears: data.experienceYears || "1-2 Years",
      appliedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      ...data,
    };
    candidates.unshift(newCand);
    writeFile("dev_candidates.json", candidates);
    return newCand;
  },

  updateCandidateStatus(id, status) {
    const candidates = readFile("dev_candidates.json", DEFAULT_CANDIDATES);
    const cand = candidates.find((c) => c.id === id);
    if (cand) {
      cand.status = status;
      writeFile("dev_candidates.json", candidates);
    }
    return cand;
  },

  // --- Smart Court Causelist Aggregator, Conflict Radar & Client Dispatcher (Milestone 5) ---
  getCauselistRadar(advocateId = "adv_1") {
    let causelist = readFile("dev_causelists.json", DEFAULT_CAUSE_LIST);
    if (!causelist || causelist.length === 0) {
      causelist = DEFAULT_CAUSE_LIST;
      writeFile("dev_causelists.json", causelist);
    }

    const todayItems = causelist.filter(
      (item) => item.advocateId === advocateId || !item.advocateId
    );

    // Detect Conflicts
    const conflicts = [];
    for (let i = 0; i < todayItems.length; i++) {
      for (let j = i + 1; j < todayItems.length; j++) {
        const a = todayItems[i];
        const b = todayItems[j];

        const differentHall = a.courtHall !== b.courtHall;
        const differentComplex = a.courtName !== b.courtName;

        if (differentHall || differentComplex) {
          conflicts.push({
            id: `conf_${a._id}_${b._id}`,
            severity: differentComplex ? "critical" : "warning",
            severityLabel: differentComplex ? "Critical Multi-Venue Conflict" : "High Court Bench Hall Conflict",
            distanceWarning: differentComplex
              ? "Different Court Complexes (~14 km transit required between Marine Drive & Kakkanad)"
              : "Different Court Halls within High Court",
            timeA: a.approxTime || "10:45 AM",
            timeB: b.approxTime || "11:00 AM",
            itemA: {
              id: a._id,
              caseNumber: a.caseNumber,
              courtHall: a.courtHall,
              courtName: a.courtName,
              itemNumber: a.itemNumber,
              bench: a.bench,
            },
            itemB: {
              id: b._id,
              caseNumber: b.caseNumber,
              courtHall: b.courtHall,
              courtName: b.courtName,
              itemNumber: b.itemNumber,
              bench: b.bench,
            },
            recommendation: differentComplex
              ? `Senior Counsel Adv. Meera Krishnan cannot physically appear in both Court Hall 2A (High Court) and NCLT Court Hall 1 (Kakkanad) at 10:45–11:00 AM. Recommend delegating ${b.caseNumber} to chamber associate Adv. Rahul Deshmukh or submitting an urgent High Court passover memo.`
              : `Concurrent listing across Court Halls. Submit passover slip in ${b.courtHall} to hold matter for 2nd Call.`,
          });
        }
      }
    }

    return {
      success: true,
      todayDate: new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      advocateRoll: "K/001429/2012",
      advocateName: "Adv. Meera Krishnan",
      totalHearings: todayItems.length,
      conflictsCount: conflicts.length,
      items: todayItems,
      conflicts,
    };
  },

  generatePassoverSlip(data) {
    const {
      itemId,
      caseNumber,
      courtHall,
      itemNumber,
      bench,
      reason,
      passoverUntil = "12:00 PM / 2nd Call",
      seniorCounselName = "Adv. Meera Krishnan",
    } = data;
    const causelist = readFile("dev_causelists.json", DEFAULT_CAUSE_LIST);
    const item = causelist.find((c) => c._id === itemId || c.caseNumber === caseNumber);

    const passoverSlip = {
      slipNumber: `PS-${Date.now().toString().slice(-6)}`,
      courtHall: courtHall || item?.courtHall || "Court Hall 1",
      bench: bench || item?.bench || "Division Bench",
      itemNumber: itemNumber || item?.itemNumber || 14,
      caseNumber: caseNumber || item?.caseNumber || "WP(C) 19482/2024",
      parties: `${item?.petitioner || "Petitioner"} vs ${item?.respondent || "Respondents"}`,
      seniorCounselName,
      enrollmentNumber: "K/001429/2012",
      reason:
        reason ||
        "Senior Counsel is currently on legs before Hon'ble Division Bench 2A in WP(C) 19482/2024.",
      requestedTime: passoverUntil,
      dispatchedTo: "Court Master & Bench Scrutiny Officer",
      generatedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    if (item) {
      item.status = "passover_requested";
      item.passoverSlip = passoverSlip;
      writeFile("dev_causelists.json", causelist);
    }

    return {
      success: true,
      message: "Passover memo drafted and registered for bench presentation.",
      passoverSlip,
      item,
    };
  },

  reassignCauselistItem(data) {
    const { itemId, associateId, associateName = "Adv. Rahul Deshmukh", briefNotes = "" } = data;
    const causelist = readFile("dev_causelists.json", DEFAULT_CAUSE_LIST);
    const item = causelist.find((c) => c._id === itemId);

    if (item) {
      item.status = "associate_assigned";
      item.assignedAssociate = {
        id: associateId || "cand_1",
        name: associateName,
        enrollmentNumber: "K/003412/2024",
        assignedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        briefNotes:
          briefNotes ||
          "Instructed to seek 3-week adjournment for rejoinder; maintain ad-interim status quo.",
      };
      writeFile("dev_causelists.json", causelist);
    }

    return {
      success: true,
      message: `Representation successfully delegated to ${associateName}.`,
      item,
    };
  },

  dispatchClientHearingUpdate(data) {
    const {
      itemId,
      matterId,
      caseNumber = "WP(C) 19482/2024",
      clientName = "Gopakumar Nambiar",
      clientPhone = "+91 94471 28930",
      courtOutcome = "Ad-Interim Stay Granted (4 Weeks)",
      nextHearingDate = "18.11.2024",
      benchRemarks = "Interim stay granted restraining line drawing under Section 10(d) Telegraph Act. Status quo ordered.",
      seniorCounselName = "Adv. Meera Krishnan",
    } = data;

    const causelist = readFile("dev_causelists.json", DEFAULT_CAUSE_LIST);
    const item = causelist.find((c) => c._id === itemId || c.caseNumber === caseNumber);

    if (item) {
      item.status = courtOutcome.includes("Stay") ? "stay_granted" : "adjourned";
      item.lastOutcome = courtOutcome;
      item.nextHearingDate = nextHearingDate;
      item.benchRemarks = benchRemarks;
      writeFile("dev_causelists.json", causelist);
    }

    const englishMessage = `Namaskaram ${clientName}, your matter ${caseNumber} was heard before the Hon'ble Court today. Outcome: ${courtOutcome}. ${benchRemarks} Next listing date: ${nextHearingDate}. Warm regards, ${seniorCounselName}.`;
    const malayalamMessage = `നമസ്കാരം ${clientName}, താങ്കളുടെ കേസ് ${caseNumber} ഇന്ന് ബഹുമാനപ്പെട്ട കോടതി പരിഗണിച്ചു. വിധി/ഉത്തരവ്: ${courtOutcome}. ${benchRemarks} അടുത്ത വാദം കേൾക്കുന്ന തീയതി: ${nextHearingDate}. സ്നേഹാദരങ്ങളോടെ, ${seniorCounselName}.`;

    const dispatchRecord = {
      dispatchId: `DISP-${Date.now().toString().slice(-6)}`,
      caseNumber,
      clientName,
      clientPhone,
      courtOutcome,
      nextHearingDate,
      englishMessage,
      malayalamMessage,
      channels: ["WhatsApp Business API (Verified)", "SMS Gateway (CP-WAKHEEL)"],
      deliveredAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      status: "Delivered",
    };

    return {
      success: true,
      message: `Hearing outcome dispatched to ${clientName} via WhatsApp & SMS.`,
      dispatchRecord,
      item,
    };
  },

  // ==========================================================================
  // --- Calendar Fixtures & Backlog Suite ---
  // ==========================================================================
  getCalendarEvents(userId) {
    return readFile("dev_calendar_fixtures.json", DEFAULT_CALENDAR_FIXTURES);
  },

  addCalendarEvent(userId, data = {}) {
    const events = this.getCalendarEvents(userId);
    const newEvent = {
      id: `evt-${Date.now()}`,
      userId,
      title: data.title || "Scheduled Court Event",
      category: data.category || "hearing",
      date: data.date || new Date().toISOString().split("T")[0],
      time: data.time || "10:30 AM",
      duration: data.duration || "45m",
      caseNumber: data.caseNumber || "WP(C) 19482/2024",
      forum: data.forum || "High Court of Kerala",
      clientName: data.clientName || "Gopakumar Nambiar",
      notes: data.notes || "",
      status: data.status || "confirmed",
      createdAt: new Date().toISOString(),
    };
    events.push(newEvent);
    writeFile("dev_calendar_fixtures.json", events);
    return newEvent;
  },

  updateCalendarEvent(id, updates = {}) {
    const events = readFile("dev_calendar_fixtures.json", DEFAULT_CALENDAR_FIXTURES);
    const index = events.findIndex((e) => e.id === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...updates, updatedAt: new Date().toISOString() };
      writeFile("dev_calendar_fixtures.json", events);
      return events[index];
    }
    return null;
  },

  deleteCalendarEvent(id) {
    let events = readFile("dev_calendar_fixtures.json", DEFAULT_CALENDAR_FIXTURES);
    events = events.filter((e) => e.id !== id);
    writeFile("dev_calendar_fixtures.json", events);
    return true;
  },

  getCalendarBacklog(userId) {
    return readFile("dev_calendar_backlog.json", DEFAULT_CALENDAR_BACKLOG);
  },

  addCalendarBacklogItem(userId, data = {}) {
    const backlog = this.getCalendarBacklog(userId);
    const newItem = {
      id: `task-bk-${Date.now()}`,
      userId,
      title: data.title || "Backlog Task",
      category: data.category || "drafting",
      priority: data.priority || "normal",
      estimatedTime: data.estimatedTime || "1h",
      caseRef: data.caseRef || "General Chamber",
      createdAt: new Date().toISOString(),
    };
    backlog.unshift(newItem);
    writeFile("dev_calendar_backlog.json", backlog);
    return newItem;
  },

  updateCalendarBacklogItem(id, updates = {}) {
    const backlog = readFile("dev_calendar_backlog.json", DEFAULT_CALENDAR_BACKLOG);
    const index = backlog.findIndex((b) => b.id === id);
    if (index !== -1) {
      backlog[index] = { ...backlog[index], ...updates, updatedAt: new Date().toISOString() };
      writeFile("dev_calendar_backlog.json", backlog);
      return backlog[index];
    }
    return null;
  },

  deleteCalendarBacklogItem(id) {
    let backlog = readFile("dev_calendar_backlog.json", DEFAULT_CALENDAR_BACKLOG);
    backlog = backlog.filter((b) => b.id !== id);
    writeFile("dev_calendar_backlog.json", backlog);
    return true;
  },

  // ==========================================================================
  // --- Professional Network & Legal Pipeline Suite ---
  // ==========================================================================
  getNetworkContacts(userId) {
    return readFile("dev_network_contacts.json", DEFAULT_NETWORK_CONTACTS);
  },

  addNetworkContact(userId, data = {}) {
    const contacts = this.getNetworkContacts(userId);
    const newContact = {
      id: `c-${Date.now()}`,
      userId,
      name: data.name || "Adv. New Counsel",
      degree: data.degree || "1st",
      role: data.role || "Legal Counsel",
      chamber: data.chamber || "Chambers of Law",
      bench: data.bench || "High Court of Kerala",
      location: data.location || "Kochi, Kerala",
      stage: data.stage || "discover",
      practiceArea: data.practiceArea || "Constitutional Law",
      source: data.source || "Network Recommendation",
      mutualsCount: data.mutualsCount || Math.floor(Math.random() * 20) + 3,
      statusQuote: data.statusQuote || "Relationship initiated via Bar Council portal",
      lastActive: "Just now",
      isOnline: true,
      barEnrollment: data.barEnrollment || `BCI/${Math.floor(Math.random() * 8000) + 1000}/2023`,
      phone: data.phone || "+91 98000 00000",
      email: data.email || "counsel@barcouncil.org",
      briefsCount: data.briefsCount || 0,
      createdAt: new Date().toISOString(),
    };
    contacts.unshift(newContact);
    writeFile("dev_network_contacts.json", contacts);
    return newContact;
  },

  updateNetworkContactStage(id, stage) {
    const contacts = readFile("dev_network_contacts.json", DEFAULT_NETWORK_CONTACTS);
    const index = contacts.findIndex((c) => c.id === id);
    if (index !== -1) {
      contacts[index].stage = stage;
      contacts[index].updatedAt = new Date().toISOString();
      writeFile("dev_network_contacts.json", contacts);
      return contacts[index];
    }
    return null;
  },

  deleteNetworkContact(id) {
    let contacts = readFile("dev_network_contacts.json", DEFAULT_NETWORK_CONTACTS);
    contacts = contacts.filter((c) => c.id !== id);
    writeFile("dev_network_contacts.json", contacts);
    return true;
  },

  getNetworkActivities(userId) {
    return readFile("dev_network_activities.json", DEFAULT_NETWORK_ACTIVITIES);
  },

  addNetworkActivity(userId, data = {}) {
    const activities = this.getNetworkActivities(userId);
    const newAct = {
      id: `act-${Date.now()}`,
      userId,
      type: data.type || "connected",
      advocateName: data.advocateName || "Advocate Colleague",
      description: data.description || "updated collaboration status.",
      timestamp: "Just now",
      createdAt: new Date().toISOString(),
    };
    activities.unshift(newAct);
    writeFile("dev_network_activities.json", activities);
    return newAct;
  },

  getNetworkFollowups(userId) {
    return readFile("dev_network_followups.json", DEFAULT_NETWORK_FOLLOWUPS);
  },

  addNetworkFollowup(userId, data = {}) {
    const followups = this.getNetworkFollowups(userId);
    const newFu = {
      id: `fu-${Date.now()}`,
      userId,
      advocateName: data.advocateName || "Advocate Colleague",
      task: data.task || "Follow up on matter",
      dueText: data.dueText || "Due Tomorrow",
      dueUrgent: Boolean(data.dueUrgent),
      createdAt: new Date().toISOString(),
    };
    followups.unshift(newFu);
    writeFile("dev_network_followups.json", followups);
    return newFu;
  },

  getNetworkRecommendations(userId) {
    return readFile("dev_network_recommendations.json", DEFAULT_NETWORK_RECOMMENDATIONS);
  },

  toggleNetworkRecommendation(id) {
    const recs = readFile("dev_network_recommendations.json", DEFAULT_NETWORK_RECOMMENDATIONS);
    const index = recs.findIndex((r) => r.id === id);
    if (index !== -1) {
      recs[index].status = recs[index].status === "connect" ? "pending" : "connect";
      writeFile("dev_network_recommendations.json", recs);
      return recs[index];
    }
    return null;
  },

  // ==========================================================================
  // --- Task Mite Tasks & Chamber Notes Suite ---
  // ==========================================================================
  getTaskMiteTasks(userId) {
    return readFile("dev_taskmite_tasks.json", DEFAULT_TASKMITE_TASKS);
  },

  addTaskMiteTask(userId, data = {}) {
    const tasks = this.getTaskMiteTasks(userId);
    const newTask = {
      id: `task-${Date.now()}`,
      userId,
      title: data.title || "New Chamber Task",
      caseMatter: data.caseMatter || undefined,
      status: data.status || "not_started",
      type: data.type || "Court Filing",
      dueDate: data.dueDate || "Today",
      dueTime: data.dueTime,
      isDueUrgent: Boolean(data.isDueUrgent),
      priority: data.priority || "urgent",
      assignee: data.assignee || {
        name: "Adv. Rajiv Malhotra",
        role: "Associate",
        avatarInitials: "RM",
      },
      notes: data.notes || undefined,
      createdAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    writeFile("dev_taskmite_tasks.json", tasks);
    return newTask;
  },

  updateTaskMiteTask(id, updates = {}) {
    const tasks = readFile("dev_taskmite_tasks.json", DEFAULT_TASKMITE_TASKS);
    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
      writeFile("dev_taskmite_tasks.json", tasks);
      return tasks[index];
    }
    return null;
  },

  deleteTaskMiteTask(id) {
    let tasks = readFile("dev_taskmite_tasks.json", DEFAULT_TASKMITE_TASKS);
    tasks = tasks.filter((t) => t.id !== id);
    writeFile("dev_taskmite_tasks.json", tasks);
    return true;
  },

  getTaskMiteNotes(userId) {
    return readFile("dev_taskmite_notes.json", DEFAULT_TASKMITE_NOTES);
  },

  addTaskMiteNote(userId, data = {}) {
    const notes = this.getTaskMiteNotes(userId);
    const newNote = {
      id: `note-${Date.now()}`,
      userId,
      title: data.title || "Untitled Chamber Memo",
      category: data.category || "hearing_memo",
      categoryLabel: data.categoryLabel || "Hearing Memo",
      content: data.content || "",
      tags: Array.isArray(data.tags) ? data.tags : ["Chamber"],
      updatedAt: "Just now",
      isPinned: Boolean(data.isPinned),
      createdAt: new Date().toISOString(),
    };
    notes.unshift(newNote);
    writeFile("dev_taskmite_notes.json", notes);
    return newNote;
  },

  deleteTaskMiteNote(id) {
    let notes = readFile("dev_taskmite_notes.json", DEFAULT_TASKMITE_NOTES);
    notes = notes.filter((n) => n.id !== id);
    writeFile("dev_taskmite_notes.json", notes);
    return true;
  },

  // ==========================================================================
  // --- Profiles (BCI Credentials & DigiLocker KYC) ---
  // ==========================================================================
  getBciCredentials(userId) {
    return readFile("dev_bci_credentials.json", DEFAULT_BCI_CREDENTIALS);
  },

  updateBciCredentials(userId, data = {}) {
    let current = this.getBciCredentials(userId);
    current = { ...current, ...data, updatedAt: new Date().toISOString() };
    writeFile("dev_bci_credentials.json", current);
    return current;
  },

  getDigiLockerKyc(userId) {
    return readFile("dev_digilocker_kyc.json", DEFAULT_DIGILOCKER_KYC);
  },

  updateDigiLockerKyc(userId, data = {}) {
    let current = this.getDigiLockerKyc(userId);
    current = { ...current, ...data, updatedAt: new Date().toISOString() };
    writeFile("dev_digilocker_kyc.json", current);
    return current;
  },
};

const DEFAULT_AGENTS = [
  {
    id: "agent_causelist",
    name: "Kerala High Court Causelist Scraper",
    description: "Queries eCourts Kerala Judicial Gateway daily at 07:00 IST for advocate Bar Council Roll No. K/1429/2016. Scrapes Court Hall, Item No, and Bench stage.",
    triggerType: "Scheduled (Cron: 0 7 * * 1-5)",
    scheduleText: "Daily at 07:00 IST (Mon-Fri)",
    target: "High Court of Kerala (Ernakulam) & Subordinate Courts",
    status: "active",
    lastRunAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    lastStatus: "success",
    itemsProcessed: 2,
    metrics: { totalRuns: 142, successRate: "99.2%", itemsDiscovered: 48 },
    recentLogs: [
      { timestamp: "07:00:02 IST", level: "info", message: "Connecting to eCourts Kerala High Court API Gateway..." },
      { timestamp: "07:00:05 IST", level: "info", message: "Authenticating Advocate Roll: K/1429/2016 (Adv. Meera Krishnan)" },
      { timestamp: "07:00:08 IST", level: "info", message: "Parsing Daily Cause List for Division Bench 2A (Coram: Mustaque & Eapen, JJ.)" },
      { timestamp: "07:00:11 IST", level: "success", message: "Item #14 Discovered: WP(C) 19482/2024 (Gopakumar v. KSEB) - Listed for Interim Stay" },
      { timestamp: "07:00:14 IST", level: "success", message: "Chamber Cause List updated and synced to ERP dashboard." },
    ],
    config: {
      barRollNumber: "K/1429/2016",
      autoSyncCalendar: true,
      alertUrgentItemThreshold: 20,
    },
  },
  {
    id: "agent_caveat",
    name: "High Court Caveat Monitoring Agent",
    description: "Monitors the High Court of Kerala Section 148A CPC Caveat Registry for preemptive caveats filed against active chamber clients.",
    triggerType: "Registry Polling (Hourly)",
    scheduleText: "Every 60 Minutes",
    target: "High Court Caveat Registry & Sub Court Ernakulam",
    status: "active",
    lastRunAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    lastStatus: "success",
    itemsProcessed: 1,
    metrics: { totalRuns: 420, successRate: "100%", itemsDiscovered: 3 },
    recentLogs: [
      { timestamp: "10:15:00 IST", level: "info", message: "Polling e-Filing Registry: Caveat Petitions under Section 148A CPC..." },
      { timestamp: "10:15:03 IST", level: "info", message: "Cross-matching with active client roster (8 Active Litigants)..." },
      { timestamp: "10:15:06 IST", level: "success", message: "Caveat verified: No new adverse caveat lodged against Gopakumar Nambiar in last 24h." },
      { timestamp: "10:15:08 IST", level: "info", message: "Next scheduled check at 11:15 IST." },
    ],
    config: {
      watchActiveClientsOnly: true,
      expiryAlertDays: 14,
    },
  },
  {
    id: "agent_bns_concordance",
    name: "BNS-BNSS Statutory Concordance Agent",
    description: "Parses FIRs, criminal complaints, and chargesheets to cross-reference Indian Penal Code (IPC) and CrPC sections with the Bharatiya Nyaya Sanhita (BNS) 2023.",
    triggerType: "Document Ingestion / On-Demand",
    scheduleText: "Real-time Event Triggered",
    target: "Criminal Law / Trial Chamber",
    status: "active",
    lastRunAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    lastStatus: "success",
    itemsProcessed: 6,
    metrics: { totalRuns: 89, successRate: "100%", itemsDiscovered: 89 },
    recentLogs: [
      { timestamp: "Yesterday 23:10 IST", level: "info", message: "Pleading ingested: Anticipatory Bail Application (BNSS Section 482)" },
      { timestamp: "Yesterday 23:10 IST", level: "info", message: "Cross-checked legacy Section 438 CrPC with Section 482 BNSS 2023: Concordant." },
      { timestamp: "Yesterday 23:11 IST", level: "success", message: "Verification completed with zero statutory conflict." },
    ],
    config: {
      flagPunishmentChanges: true,
      highlightCommunityService: true,
    },
  },
  {
    id: "agent_lead_triage",
    name: "Client Lead Intake & Conflict Check Triage Agent",
    description: "Evaluates citizen legal inquiries, performs automatic Bar Council Rule 33 conflict-of-interest screening against existing clients, and calculates forum jurisdiction.",
    triggerType: "Citizen Submission Webhook",
    scheduleText: "Instantaneous Webhook",
    target: "Intake Pipeline",
    status: "active",
    lastRunAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    lastStatus: "success",
    itemsProcessed: 1,
    metrics: { totalRuns: 64, successRate: "98.4%", itemsDiscovered: 12 },
    recentLogs: [
      { timestamp: "05:30:12 IST", level: "info", message: "New Citizen Grievance received: 'Transmission line across rubber plantation'" },
      { timestamp: "05:30:13 IST", level: "info", message: "Executing automated Conflict Check: Respondent KSEB vs Chamber Roster..." },
      { timestamp: "05:30:14 IST", level: "success", message: "Conflict Check Clear: Advocate has not represented KSEB in past 3 years." },
      { timestamp: "05:30:15 IST", level: "success", message: "Forum jurisdiction scored: High Court of Kerala (WP(C)) [Confidence: 94%]." },
    ],
    config: {
      strictConflictCheck: true,
      autoNotifyAdvocate: true,
    },
  },
];

// ============================================================================
// DEFAULT SEED DATA FOR AI DIGITAL TWIN & WORKFORCE ACADEMY (Milestone 4)
// ============================================================================
export const DEFAULT_AI_TWIN = {
  advocateId: "adv_1",
  advocateName: "Adv. Meera Krishnan",
  enrollmentNumber: "K/001429/2012",
  barCouncil: "Bar Council of Kerala (Ernakulam)",
  standingYears: 14,
  calibrationScore: 99.4,
  pleadingsTrainedCount: 1420,
  activeSyncStatus: "Live Synchronized (Vault, Precedents & Causelists)",
  draftingStyle: "constitutional_assertive",
  draftingStyleLabel: "Assertive Constitutional & Precedent-First",
  primaryJurisdiction: "high_court_kerala",
  primaryJurisdictionLabel: "High Court of Kerala (Division & Single Benches)",
  preferredCitations: ["KLT (Kerala Law Times)", "SCC (Supreme Court Cases)", "ILR (Kerala)"],
  benchTemperamentPreference: "Rigorous statutory textualism with strong reliance on Whirlpool natural justice exceptions",
  autonomousIntakeEnabled: true,
  minimumConsultationFee: 3500,
  conflictCheckStrictness: "high",
  emergencyBailAutoEscalate: true,
  twinPersonaSummary: "Specialized in High Court Article 226 Writs, Telegraph Act Section 16 land objections, BNSS 482 anticipatory bail, and commercial contract litigation.",
  recentSimulations: [
    {
      id: "sim_1",
      query: "KSEB entry without DM referral under Section 16(1)",
      legalOpinion: "Under Section 10(d) and 16(1) of the Indian Telegraph Act, 1885, entry without District Magistrate sanction once resistance is offered is ex-facie void as settled in Valsamma v. KSEB 2012 (2) KLT 368.",
      proceduralRoadmap: [
        "Issue statutory objection notice to AEE KSEB",
        "Lodge caveat before District Magistrate, Ernakulam",
        "Move High Court for ad-interim stay under Article 226",
      ],
      draftClause: "The unilateral entry by Respondent No. 2 without referral to the District Magistrate is non-est in the eyes of law.",
      bindingCitations: ["Valsamma v. KSEB 2012 (2) KLT 368 (Full Bench)"],
      confidenceScore: 99.1,
      draftingStyle: "constitutional_assertive",
      primaryJurisdiction: "high_court_kerala",
      timestamp: "Yesterday, 14:20 IST",
    },
  ],
};

export const DEFAULT_TRAINING_MODULES = [
  {
    id: "mod_bns_ipc",
    title: "BNS vs IPC & BNSS vs CrPC Statutory Concordance",
    category: "Criminal Law & Procedure",
    instructor: "Adv. Meera Krishnan",
    level: "Senior Associate Level",
    estimatedMinutes: 45,
    progress: 100,
    status: "Completed",
    score: "96%",
    overview: "Mastering cross-statutory concordance, transitioning pending FIRs under IPC to trial under BNSS 2023, and anticipatory bail under BNSS Section 482.",
    quizScenario: {
      prompt: "An FIR was registered on 15 June 2024 under Section 420 IPC. The police file a supplementary chargesheet on 10 August 2024 invoking BNS provisions. Accused seeks pre-arrest protection. What procedural provisions govern the bail application?",
      keyIssues: ["BNSS Section 531(2)(a) repeal and savings clause", "Substantive offences governed by legacy IPC at date of commission", "Procedural bail application governed by BNSS Section 482"],
      benchmarkAnswer: "Under Section 531(2)(a) of BNSS 2023, pending investigations and offences committed prior to 1 July 2024 are substantively governed by IPC. However, procedural applications for pre-arrest bail instituted subsequent to 1 July 2024 must be filed under Section 482 of BNSS (legacy Section 438 CrPC), as held by Kerala High Court in Abdul Khader v. State of Kerala (2024).",
      landmarkCitation: "Abdul Khader v. State of Kerala 2024 (4) KLT 112",
    },
  },
  {
    id: "mod_wpc_maintainability",
    title: "Article 226 High Court Writ Maintainability & Whirlpool Exceptions",
    category: "Constitutional & Administrative Law",
    instructor: "Chamber Senior Roster",
    level: "Appellate Junior Level",
    estimatedMinutes: 60,
    progress: 85,
    status: "In Progress",
    score: "92%",
    overview: "Overcoming alternate statutory remedy objections, pleading ex-facie lack of jurisdiction, and demonstrating grave violation of natural justice (audi alteram partem).",
    quizScenario: {
      prompt: "A statutory authority issues an impugned demand notice without serving a prior show-cause notice or affording personal hearing. The relevant statute provides an appeal before an Appellate Tribunal. Can a Writ Petition under Article 226 be maintained directly?",
      keyIssues: ["Whirlpool Corporation 4 exceptions", "Breach of fundamental natural justice rules", "Alternative remedy is a rule of discretion, not an absolute jurisdictional bar"],
      benchmarkAnswer: "Yes. While existence of an alternate statutory remedy is generally a bar, the 3-Judge bench of the Supreme Court in Whirlpool Corporation v. Registrar of Trade Marks (1998) 8 SCC 1 carved four categorical exceptions: (i) violation of fundamental rights, (ii) breach of natural justice, (iii) proceedings wholly without jurisdiction, and (iv) challenge to vires of legislation. Total omission of prior show-cause notice satisfies exception (ii) and allows direct Article 226 invocation.",
      landmarkCitation: "Whirlpool Corporation v. Registrar of Trade Marks (1998) 8 SCC 1",
    },
  },
  {
    id: "mod_sec138_ni",
    title: "Negotiable Instruments Act (Sec 138-142) Notice Defenses & Limitation",
    category: "Commercial & Banking Litigation",
    instructor: "Evidence Lab",
    level: "Litigation Junior Level",
    estimatedMinutes: 40,
    progress: 40,
    status: "Active Session",
    score: "88%",
    overview: "Calculating 30-day statutory notice timelines, interpreting postal endorsements (unclaimed/refused), and drafting complaints strictly compliant with Section 142(1)(b).",
    quizScenario: {
      prompt: "A demand notice dispatched via registered post is returned with endorsement 'Door Locked / Addressee Absent'. Complainant waits 45 days before filing complaint. Is complaint maintainable or barred by limitation?",
      keyIssues: ["Deemed service under Section 27 General Clauses Act", "Cause of action crystallization after 15 days of deemed service", "30-day limitation window under Section 142(1)(b)"],
      benchmarkAnswer: "Under C.C. Alavi Haji (2007) 6 SCC 555, postal endorsement of 'Door Locked' triggers statutory presumption of deemed service under Section 27 General Clauses Act on the date of return. The drawer is granted 15 days from deemed receipt to make payment. On the 16th day, cause of action arises, and the complaint must be instituted within 30 days. Waiting 45 days after the 15-day window bars the complaint unless condonation of delay is sought under proviso to Section 142(1)(b).",
      landmarkCitation: "C.C. Alavi Haji v. Palapetty Muhammed (2007) 6 SCC 555",
    },
  },
  {
    id: "mod_bsa_electronic_evidence",
    title: "Electronic Evidence Certification under BSA Section 63 (Legacy 65B)",
    category: "Trial Practice & Evidence",
    instructor: "Appellate Council",
    level: "Senior Associate Level",
    estimatedMinutes: 50,
    progress: 10,
    status: "Scheduled",
    score: "—",
    overview: "Drafting certificates under Section 63 of Bharatiya Sakshya Adhiniyam, 2023 for WhatsApp chats, CDR logs, CCTV footage, and digital ledger hashes.",
    quizScenario: {
      prompt: "In a corporate breach of trust trial, complainant tenders printouts of encrypted WhatsApp conversations without an accompanying Section 63 BSA certificate. Defense objects to admissibility. How should the Court rule?",
      keyIssues: ["Mandatory nature of electronic certificate", "Section 63 BSA 2023 mirrors Section 65B Evidence Act", "Arjun Panditrao Khotkar binding precedent"],
      benchmarkAnswer: "The Court must sustain the defense objection. As established by the Supreme Court in Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal (2020) 7 SCC 1, compliance with the statutory certificate requirement (now codified in Section 63 of Bharatiya Sakshya Adhiniyam 2023) is a mandatory condition precedent for the admissibility of electronic records in secondary evidence form.",
      landmarkCitation: "Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal (2020) 7 SCC 1",
    },
  },
];

export const DEFAULT_CANDIDATES = [
  {
    id: "cand_1",
    name: "Adv. Rahul Deshmukh",
    college: "NLSIU Bengaluru (Batch of 2024)",
    role: "Appellate & Writ Associate",
    enrollmentNumber: "K/003412/2024",
    status: "Interview Round 2",
    score: "96%",
    experienceYears: "2 Years Appellate",
    appliedDate: "20 Oct 2024",
    specialization: "Constitutional Law, Writ Petitions & Judicial Review",
    barVerified: true,
    cvHighlights: "Former Law Clerk at High Court of Kerala; drafted 40+ writ petitions.",
  },
  {
    id: "cand_2",
    name: "Adv. Ananya Iyer",
    college: "NALSAR Hyderabad (Batch of 2023)",
    role: "Commercial Law Clerk",
    enrollmentNumber: "K/002189/2023",
    status: "Offer Extended",
    score: "98%",
    experienceYears: "3 Years Corporate/Dispute",
    appliedDate: "18 Oct 2024",
    specialization: "Arbitration Act, Commercial Division Suits & NI Act 138",
    barVerified: true,
    cvHighlights: "Handled Section 11 & Section 34 Arbitration petitions before Commercial Court.",
  },
  {
    id: "cand_3",
    name: "Adv. Vikramaditya Roy",
    college: "Government Law College, Ernakulam (2024)",
    role: "Criminal Trial Junior",
    enrollmentNumber: "K/004521/2024",
    status: "Screening Review",
    score: "91%",
    experienceYears: "1 Year Criminal Chamber",
    appliedDate: "24 Oct 2024",
    specialization: "BNSS 2023 Bail Practice, Sessions Trials & Cross-Examination",
    barVerified: true,
    cvHighlights: "First Class with Distinction in Evidence Law & Criminal Procedure.",
  },
];

// ============================================================================
// DEFAULT SEED DATA FOR CHAMBER KNOWLEDGE BASE & BARE ACT STUDIO (Milestone 1)
// ============================================================================
export const DEFAULT_BARE_ACTS = [
  {
    id: "act_telegraph_1885",
    title: "Indian Telegraph Act, 1885",
    shortTitle: "Telegraph Act, 1885",
    actNumber: "Act No. 13 of 1885",
    category: "Central Statutory Act / Infrastructure & Utilities",
    enactmentYear: 1885,
    lastAmended: "2016 (Tribunal Reforms Alignment)",
    jurisdiction: "Supreme Court of India & High Court of Kerala",
    overview:
      "Statute providing powers to telegraph authorities and electricity transmission utilities (under Section 164 of the Electricity Act 2003) to place transmission towers, overhead lines, and cables across private lands, while prescribing statutory dispute resolution before District Magistrates and compensation assessment before District Courts.",
    sections: [
      {
        sectionNumber: "Section 10",
        heading: "Power for telegraph authority to place and maintain telegraph lines and posts",
        fullText:
          "The telegraph authority may, from time to time, place and maintain a telegraph line under, over, along, or across, and posts in or upon, any immovable property: Provided that— (a) the telegraph authority shall not exercise the powers conferred by this section except for the purposes of a telegraph established or maintained by the Central Government, or to be so established or maintained; (b) the Central Government shall not acquire any right other than that of user only in the property under, over, along, across in or upon which the telegraph authority places any telegraph line or post; (c) except as hereinafter provided, the telegraph authority shall not exercise those powers in respect of any property vested in or under the control or management of any local authority, without the permission of that authority; and (d) in the exercise of the powers conferred by this section, the telegraph authority shall do as little damage as possible, and, when the exercise of those powers has caused damage to any property, shall pay full compensation to all persons interested for any damage sustained by them by reason of the exercise of those powers.",
        commentary:
          "High Court of Kerala settled law establishes that the utility acquires only a right of user and NOT title or ownership. Minimum damage is an express statutory condition precedent. Landowners cannot be arbitrarily dispossessed without valuation.",
        landmarkCitations: [
          "Valsamma v. KSEB 2012 (2) KLT 368",
          "Executive Engineer, KSEB v. Doddakka (2015) 15 SCC 738",
        ],
        amendments: "Preserved under Section 164 of the Electricity Act, 2003 for transmission licensees.",
      },
      {
        sectionNumber: "Section 16",
        heading: "Exercise of powers confers upon telegraph authority, and disputes as to compensation",
        fullText:
          "(1) If the exercise of the powers mentioned in section 10 in respect of property referred to in clause (d) of that section is resisted or obstructed, the District Magistrate may, in his discretion, order that the telegraph authority shall be permitted to exercise them.\n(2) If, after the making of an order under sub-section (1), any person resists the exercise of those powers, or, having control over the property, does not give all facilities for their being exercised, he shall be deemed to have committed an offence under section 188 of the Indian Penal Code (or corresponding section of BNS 2023).\n(3) If any dispute arises concerning the sufficiency of the compensation to be paid under section 10, clause (d), it shall, on application for that purpose by either of the disputing parties to the District Judge within whose jurisdiction the property is situate, be determined by him.",
        commentary:
          "The utility has NO jurisdiction to unilaterally adjudicate resistance. Upon the slightest objection by a landowner or occupier, the transmission licensee MUST pause works and petition the District Magistrate under Section 16(1). Entering without a Section 16 order is actionable trespass and amenable to Article 226 Writ Petition.",
        landmarkCitations: [
          "Valsamma v. KSEB 2012 (2) KLT 368 (Full Bench)",
          "Power Grid Corporation of India v. Century Textiles & Industries Ltd. (2017) 5 SCC 143",
        ],
        amendments: "Remains core statutory shield for agricultural and plantation properties in Kerala.",
      },
      {
        sectionNumber: "Section 17",
        heading: "Removal or alteration of telegraph line or post on request of owner or occupier",
        fullText:
          "(1) When, under the foregoing provisions of this Act, a telegraph line or post has been placed by the telegraph authority under, over, along, across, in or upon any property, and any person entitled to do so desires to deal with that property in such a manner as to render it necessary or convenient that the telegraph line or post should be removed to another part thereof or to a higher or lower level or altered in form, he may require the telegraph authority to remove or alter the line or post accordingly.\n(2) If compensation has been paid under section 10, clause (d), he shall, when making the requisition, tender to the telegraph authority the amount requisite to defray the expenses of the removal or alteration.",
        commentary:
          "Empowers property owners who subsequently construct buildings or develop plots to requisition line realignment. The High Court has directed KSEB to furnish cost estimates and accommodate feasible alternate routes without undue delay.",
        landmarkCitations: ["KSEB v. Sudhakaran 2008 (4) KLT 302"],
        amendments: "Subject to Central Electricity Authority (CEA) safety clearances.",
      },
    ],
  },
  {
    id: "act_ni_1881",
    title: "Negotiable Instruments Act, 1881",
    shortTitle: "NI Act, 1881",
    actNumber: "Act No. 26 of 1881",
    category: "Banking & Commercial Law",
    enactmentYear: 1881,
    lastAmended: "2018 (Section 143A & 148 Insertions)",
    jurisdiction: "Judicial Magistrate First Class / High Court / Supreme Court",
    overview:
      "Regulates negotiable instruments including promissory notes, cheques, and bills of exchange. Chapter XVII provides penal remedies for dishonour of cheques for insufficiency of funds or exceeding arrangements, ensuring commercial credibility.",
    sections: [
      {
        sectionNumber: "Section 138",
        heading: "Dishonour of cheque for insufficiency, etc., of funds in the account",
        fullText:
          "Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money to another person from out of that account for the discharge, in whole or in part, of any debt or other liability, is returned by the bank unpaid, either because of the amount of money standing to the credit of that account is insufficient to honour the cheque or that it exceeds the amount arranged to be paid from that account by an agreement made with that bank, such person shall be deemed to have committed an offence and shall, without prejudice to any other provision of this Act, be punished with imprisonment for a term which may be extended to two years, or with fine which may extend to twice the amount of the cheque, or with both.",
        commentary:
          "Strict statutory conditions precedent: (1) Cheque presented within validity (3 months); (2) Bank memo received; (3) Statutory demand notice dispatched within 30 days of memo; (4) Drawer fails to pay within 15 days of notice receipt. Cause of action crystallizes on the 16th day.",
        landmarkCitations: [
          "MSR Leathers v. S. Palaniappan (2013) 1 SCC 177",
          "Rangappa v. Sri Mohan (2010) 11 SCC 441",
          "K. Bhaskaran v. Sankaran Vaidhyan Balan (1999) 7 SCC 510",
        ],
        amendments: "Amended in 2002 to enhance imprisonment to 2 years.",
      },
      {
        sectionNumber: "Section 139",
        heading: "Presumption in favour of holder",
        fullText:
          "It shall be presumed, unless the contrary is proved, that the holder of a cheque received the cheque of the nature referred to in section 138 for the discharge, in whole or in part, of any debt or other liability.",
        commentary:
          "Constitutes a reverse burden of proof. The initial presumption operates against the accused upon admission of signature. The accused may rebut only through a preponderance of probabilities, not mere denials.",
        landmarkCitations: [
          "Bir Singh v. Mukesh Kumar (2019) 4 SCC 197",
          "Kalamani Tex v. P. Balasubramanian (2021) 5 SCC 283",
        ],
        amendments: "Reaffirmed by 3-judge Bench in Rangappa (2010).",
      },
      {
        sectionNumber: "Section 141",
        heading: "Offences by companies",
        fullText:
          "(1) If the person committing an offence under section 138 is a company, every person who; at the time the offence was committed, was in charge of, and was responsible to the company for the conduct of the business of the company, as well as the company, shall be deemed to be guilty of the offence and shall be liable to be proceeded against and punished accordingly.",
        commentary:
          "Mandatory requirement of specific pleading: The complaint must explicitly aver the role played by the individual director or signatory at the time the offence was committed. Managing Directors and signatories are liable by virtue of office.",
        landmarkCitations: [
          "SMS Pharmaceuticals Ltd. v. Neeta Bhalla (2005) 8 SCC 89",
          "Sunita Palita v. Panchami Stone Quarry (2022) 10 SCC 152",
        ],
        amendments: "Extended to Limited Liability Partnerships (LLPs).",
      },
      {
        sectionNumber: "Section 143A",
        heading: "Power to direct interim compensation",
        fullText:
          "(1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973, the Court trying an offence under section 138 may order the drawer of the cheque to pay interim compensation to the complainant— (a) in a summary trial or a summons case, where he pleads not guilty to the accusation made in the complaint; and (b) in any other case, upon framing of charge.\n(2) The interim compensation under sub-section (1) shall not exceed twenty per cent of the amount of the cheque.\n(3) The interim compensation shall be paid within sixty days from the date of the order.",
        commentary:
          "Substantive amendment introduced in 2018. Supreme Court in G.J. Raja v. Tejraj Sharma held Section 143A is prospective in nature. The award is discretionary and court must record reasons before imposing the maximum 20% cap.",
        landmarkCitations: [
          "G.J. Raja v. Tejraj Sharma (2019) 19 SCC 469",
          "Rakesh Ranjan Shrivastava v. State of Jharkhand (2024) 4 SCC 419",
        ],
        amendments: "Inserted by Act 20 of 2018, w.e.f. 01-09-2018.",
      },
    ],
  },
  {
    id: "act_bns_2023",
    title: "Bharatiya Nyaya Sanhita, 2023",
    shortTitle: "BNS, 2023",
    actNumber: "Act No. 45 of 2023",
    category: "Criminal Law / Substantive Penal Code",
    enactmentYear: 2023,
    lastAmended: "2024 (Enforced 1 July 2024)",
    jurisdiction: "All India Sessions & Magistrate Courts",
    overview:
      "Modernized penal code repealing the Indian Penal Code 1860. Restructures offences against property, economic crimes, bodily injuries, and introduces community service for specified petty offences.",
    sections: [
      {
        sectionNumber: "Section 318",
        heading: "Cheating",
        fullText:
          "(1) Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property to any person, or to consent that any person shall retain any property, or intentionally induces the person so deceived to do or omit to do anything which he would not do or omit if he were not so deceived, is said to 'cheat'.\n(2) Whoever cheats shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.\n(3) Whoever cheats and thereby dishonestly induces the person deceived to deliver any property, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
        commentary:
          "Direct replacement for legacy Sections 415, 417, and 420 of the IPC. Sub-section (4) consolidates legacy Section 420 IPC (cheating and dishonestly inducing delivery of property). Retains the strict requirement of dishonest intention existing from the inception of the transaction.",
        landmarkCitations: [
          "Concordance with Hridaya Ranjan Prasad Verma v. State of Bihar (2000) 4 SCC 168",
          "Prof. R.K. Vijayasarathy v. Sudha Seetharam (2019) 16 SCC 739",
        ],
        amendments: "Effective from 1 July 2024 across all new FIRs.",
      },
      {
        sectionNumber: "Section 316",
        heading: "Criminal breach of trust",
        fullText:
          "(1) Whoever, being in any manner entrusted with property, or with any dominion over property, dishonestly misappropriates or converts to his own use that property, or dishonestly uses or disposes of that property in violation of any direction of law prescribing the mode in which such trust is to be discharged, commits 'criminal breach of trust'.",
        commentary:
          "Consolidates legacy Sections 405 and 406 of the IPC. Retains the essential dual ingredients: entrustment of property and subsequent dishonest conversion. In commercial disputes, pure accounts discrepancy cannot sustain a Section 316 prosecution.",
        landmarkCitations: ["S.W. Palanitkar v. State of Bihar (2002) 1 SCC 241"],
        amendments: "Effective 1 July 2024.",
      },
    ],
  },
  {
    id: "act_bnss_2023",
    title: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    shortTitle: "BNSS, 2023",
    actNumber: "Act No. 46 of 2023",
    category: "Criminal Procedure & Police Powers",
    enactmentYear: 2023,
    lastAmended: "2024 (Enforced 1 July 2024)",
    jurisdiction: "High Court of Kerala, Sessions & Magistrate Courts",
    overview:
      "Procedural code repealing the Code of Criminal Procedure, 1973 (CrPC). Codifies electronic summons, audio-video recording of search and seizure, forensic mandates, and preserves inherent high court powers.",
    sections: [
      {
        sectionNumber: "Section 482",
        heading: "Direction for grant of bail to person apprehending arrest (Anticipatory Bail)",
        fullText:
          "(1) When any person has reason to believe that he may be arrested on an accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section; and that Court may, if it thinks fit, direct that in the event of such arrest, he shall be released on bail.\n(2) When the High Court or the Court of Session makes a direction under sub-section (1), it may include such conditions in such directions in the light of the facts of the particular case, as it may think fit.",
        commentary:
          "Corresponds directly to legacy Section 438 of the CrPC. Concurrent jurisdiction of Court of Session and High Court preserved. The Kerala High Court practice requires applicant to approach Court of Session first unless exceptional urgency or district-wide jurisdiction is demonstrated.",
        landmarkCitations: [
          "Sushila Aggarwal v. State (NCT of Delhi) (2020) 5 SCC 1 (Constitutional Bench)",
          "Gurbaksh Singh Sibbia v. State of Punjab (1980) 2 SCC 565",
        ],
        amendments: "Effective 1 July 2024. Replaces Section 438 CrPC.",
      },
      {
        sectionNumber: "Section 528",
        heading: "Saving of inherent powers of High Court",
        fullText:
          "Nothing in this Sanhita shall be deemed to limit or affect the inherent powers of the High Court to make such orders as may be necessary to give effect to any order under this Sanhita, or to prevent abuse of the process of any Court or otherwise to secure the ends of justice.",
        commentary:
          "Direct concordance with legacy Section 482 CrPC. High Court retains plenary inherent jurisdiction to quash FIRs, complaint cases, and chargesheets where allegations do not disclose any cognizable offence or where proceedings are initiated with malafides.",
        landmarkCitations: [
          "State of Haryana v. Bhajan Lal 1992 Supp (1) SCC 335",
          "Neeharika Infrastructure Pvt Ltd v. State of Maharashtra (2021) 19 SCC 401",
        ],
        amendments: "Effective 1 July 2024.",
      },
    ],
  },
  {
    id: "act_arb_1996",
    title: "Arbitration and Conciliation Act, 1996",
    shortTitle: "Arbitration Act, 1996",
    actNumber: "Act No. 26 of 1996",
    category: "Commercial Arbitration & Dispute Resolution",
    enactmentYear: 1996,
    lastAmended: "2019 (Arbitration Council of India Alignment)",
    jurisdiction: "High Court of Kerala (Commercial Division) & District Courts",
    overview:
      "Comprehensive law relating to domestic arbitration, international commercial arbitration, and enforcement of arbitral awards. Provides speedy resolution mechanisms and curtails judicial intervention.",
    sections: [
      {
        sectionNumber: "Section 9",
        heading: "Interim measures, etc., by Court",
        fullText:
          "A party may, before or during arbitral proceedings or at any time after the making of the arbitral award but before it is enforced in accordance with section 36, apply to a Court: (i) for the appointment of a guardian for a minor or person of unsound mind; or (ii) for an interim measure of protection in respect of: (a) preservation, interim custody or sale of any goods which are the subject-matter of the arbitration agreement; (b) securing the amount in dispute in the arbitration; (c) the detention, preservation or inspection of any property or thing...",
        commentary:
          "Section 9 petitions may be moved prior to arbitral tribunal constitution. Once arbitral proceedings commence, Section 9(2) mandates that arbitration must commence within 90 days of an interim order.",
        landmarkCitations: [
          "Essar House Private Limited v. Arcellor Mittal Nippon Steel India Ltd (2022) SCC OnLine SC 1219",
          "Firm Ashok Traders v. Gurumukh Das Saluja (2004) 3 SCC 155",
        ],
        amendments: "Amended by Act 3 of 2016 to impose 90-day tribunal initiation timeline.",
      },
      {
        sectionNumber: "Section 12(5)",
        heading: "Grounds for challenge & Seventh Schedule ineligibility",
        fullText:
          "Notwithstanding any prior agreement to the contrary, any person whose relationship, with the parties or counsel or the subject-matter of the dispute, falls under any of the categories specified in the Seventh Schedule shall be ineligible to be appointed as an arbitrator: Provided that parties may, subsequent to disputes having arisen between them, waive the applicability of this sub-section by an express agreement in writing.",
        commentary:
          "The Perkins Eastman doctrine establishes that an interested party who is ineligible to act as an arbitrator cannot nominate or unilaterally appoint an arbitrator. Standard PSU/governmental clauses appointing managing directors or their nominees are void ab initio.",
        landmarkCitations: [
          "Perkins Eastman Architects DPC v. HSCC (India) Ltd (2020) 20 SCC 760",
          "TRF Limited v. Energo Engineering Projects Ltd (2017) 8 SCC 377",
          "Bharat Broadband Network Ltd v. United Telecoms Ltd (2019) 5 SCC 755",
        ],
        amendments: "Inserted by Act 3 of 2016 w.e.f. 23-10-2015.",
      },
    ],
  },
  {
    id: "act_klr_1963",
    title: "Kerala Land Reforms Act, 1963",
    shortTitle: "KLR Act, 1963",
    actNumber: "Act 1 of 1964",
    category: "Kerala State Enactment / Agrarian Law",
    enactmentYear: 1963,
    lastAmended: "2015 (Ceiling Revision & Plantation Definitions)",
    jurisdiction: "Land Tribunals, Taluk Land Boards & High Court of Kerala",
    overview:
      "Pivotal Kerala statute conferring proprietary rights upon cultivating tenants, eliminating intermediary tenures, establishing ceiling limits on land holdings, and setting statutory exemptions for commercial plantations.",
    sections: [
      {
        sectionNumber: "Section 72",
        heading: "Vesting in Government of landlord's rights in respect of holdings held by cultivating tenants",
        fullText:
          "(1) On a date to be notified by the Government in this behalf, all right, title and interest of the landowners and intermediaries in respect of holdings held by cultivating tenants entitled to fixity of tenure under section 13 shall, subject to the provisions of this section, vest in the Government free from all encumbrances.",
        commentary:
          "Statutory abolition of landlordism in Kerala. Cultivating tenants obtain absolute title upon issuance of Purchase Certificate (KLR Form 24) by the Land Tribunal. Purchase certificate is conclusive proof of title against subsequent challenge.",
        landmarkCitations: [
          "Govinda Pillai v. Land Tribunal 1978 KLT 234",
          "Sreedharan v. State of Kerala 1999 (2) KLT 456",
        ],
        amendments: "Vesting date notified as 1 January 1970.",
      },
      {
        sectionNumber: "Section 81",
        heading: "Exemptions from ceiling area",
        fullText:
          "(1) The provisions of this Chapter shall not apply to— (a) lands owned or held by the Government of India or the Government of any State; (e) plantations of tea, coffee, cocoa, rubber, cardamom or cinnamon exceeding such limit as may be prescribed.",
        commentary:
          "Crucial exemption protecting Kerala rubber and tea estates from land ceiling fragmentation. If plantation land is fragmented or used for non-plantation purposes, the exemption may be scrutinized under Section 85.",
        landmarkCitations: [
          "State of Kerala v. Moosa 1994 (2) KLT 318",
          "Harrison Malayalam Ltd. v. State of Kerala 2018 (2) KLT 369",
        ],
        amendments: "Clarification on ancillary factory and labor quarters inclusion.",
      },
    ],
  },
];

export const DEFAULT_PLAYBOOKS = [
  {
    id: "sop_writ_wp_c",
    code: "SOP-KLHC-WPC-01",
    title: "High Court of Kerala Writ Petition (Civil) Article 226 SOP",
    shortTitle: "Article 226 WP(C) Filing Playbook",
    forum: "High Court of Kerala (Ernakulam)",
    category: "Constitutional Writs",
    turnaround: "24-48 Hours",
    description:
      "Chamber standard operating procedure for drafting, vetting, formatting, e-filing, scrutiny clearance, and urgent bench mentioning for Writ Petitions before the High Court of Kerala.",
    checklist: [
      {
        stage: "Stage 1: Pre-Filing Due Diligence & Statutory Audit",
        items: [
          "Exhaustion of Alternative Remedies: Verify whether statutory appeal, revision, or Magistrate application under Section 16 Telegraph Act was pursued or if patent arbitrariness warrants direct Article 226 intervention.",
          "High Court Caveat Registry Search: Query eCourts Caveat Registry under Section 148A CPC for respondent state authorities or opposite parties to ensure caveator notice is served.",
          "Statutory Representation Proof: Verify that a formal representation or notice was served on the official respondent with registered postal proof or acknowledgement receipt.",
        ],
      },
      {
        stage: "Stage 2: Pleadings Drafting & Formatting Compliance",
        items: [
          "Rule 146 Margin Compliance: Ensure strict 2.0-inch (5 cm) left margin, 1.2-inch right, top, and bottom margins on legal size paper (8.5 x 14 in).",
          "Pleading Hierarchy: Synopsis & List of Dates -> Index of Pleadings -> Memo of Writ Petition (Civil) -> Verification Affidavit -> Exhibits Annexure P-1 to P-n.",
          "Affidavit True Copy Attestation: Each exhibit copy must bear the mandatory stamp 'True Copy / Advocate' along with Advocate Roll No. and signature.",
        ],
      },
      {
        stage: "Stage 3: e-Filing & Court Registry Scrutiny",
        items: [
          "eCourts EF Portal Ingestion: Upload unified PDF bundle with embedded OCR text layer and digital sign verification.",
          "Writ Stamp & Court Fee: Affix ₹100 High Court Writ Stamp, ₹25 Advocate Welfare Fund stamp, and requisite process memo fees.",
          "Registry Defect Rectification: Monitor filing status for scrutiny notes (Filing No. EF/KLHC/...). Clear objections within 48 hours to prevent registry laches.",
        ],
      },
      {
        stage: "Stage 4: Bench Listing & Motion Mentioning",
        items: [
          "Service on Standing Counsel: Deliver advanced copy with acknowledgement to the designated Standing Counsel (e.g., KSEB, Corporation, Government Pleader).",
          "Urgent Listing Memo: File Urgent Memo before the Registrar (Judicial) specifying the irreparable harm or date of impending execution.",
          "Bench Appearance Brief: Hand over Bench Argument Dossier with highlighted copies of landmark rulings to Senior Counsel.",
        ],
      },
    ],
  },
  {
    id: "sop_sec_138_ni",
    code: "SOP-NI138-TRIAL-02",
    title: "Section 138 Negotiable Instruments Act — Trial SOP",
    shortTitle: "Cheque Dishonour End-to-End SOP",
    forum: "Judicial First Class Magistrate (JFCM) Court",
    category: "Criminal & Banking",
    turnaround: "15-45 Days",
    description:
      "Chamber protocol covering the complete timeline from bank memo receipt, 30-day statutory demand notice, postal presumption tracking, cure countdown, to Section 142 complaint institution and Section 143A interim compensation.",
    checklist: [
      {
        stage: "Stage 1: Cheque Return Audit & Timeline Calculation",
        items: [
          "Memo Scrutiny: Verify return memo reason code ('Funds Insufficient', 'Account Closed', 'Exceeds Arrangement', 'Refer to Drawer').",
          "Presentation Validity: Ensure cheque was presented within 3 months of issuance date.",
          "30-Day Notice Deadline: Calculate the strict 30-day statutory limit from the date of intimation/return memo receipt.",
        ],
      },
      {
        stage: "Stage 2: Statutory Demand Notice Dispatch",
        items: [
          "Demand Specificity: Make an unequivocal demand for the exact cheque amount; avoid clubbing unliquidated damages or interest in the principal demand.",
          "Speed Post with Delivery Tracking: Dispatch notice via India Post Speed Post / Registered Post with A/D to all known residential and business addresses.",
          "Section 27 General Clauses Presumption: Download and preserve the certified India Post tracking report reflecting 'Item Delivered' or 'Refused / Unclaimed'.",
        ],
      },
      {
        stage: "Stage 3: 15-Day Cure Window & Cause of Action",
        items: [
          "Cure Period Monitoring: Track the mandatory 15 days from the date of confirmed delivery. The drawer has until the 15th day midnight to pay.",
          "Cause of Action Crystallization: The offence is committed on the 16th day following notice receipt. The complaint must be filed within 30 days of the 16th day.",
        ],
      },
      {
        stage: "Stage 4: Section 142 Complaint Institution",
        items: [
          "Jurisdiction Verification under S.142(2): Determine competent JFCM court based on the branch where the payee maintains his bank account.",
          "Section 145(1) Affidavit in Lieu of Sworn Statement: Accompany complaint with complainant's sworn evidence affidavit to dispense with physical presence.",
          "Section 143A Application: Move interim application praying for 20% interim compensation deposit upon appearance of the accused.",
        ],
      },
    ],
  },
  {
    id: "sop_anticipatory_bail",
    code: "SOP-BNSS482-BAIL-03",
    title: "Section 482 BNSS 2023 Anticipatory Bail SOP",
    shortTitle: "Pre-Arrest Protection Protocol",
    forum: "Court of Session / High Court of Kerala",
    category: "Criminal Procedure",
    turnaround: "24-72 Hours",
    description:
      "Protocol for securing anticipatory bail under Section 482 BNSS 2023 (formerly Section 438 CrPC), reviewing police summons under Section 35 BNSS, establishing clean antecedents, and obtaining interim protection.",
    checklist: [
      {
        stage: "Stage 1: Offence Cognizance & Notice Audit",
        items: [
          "FIR & Complaint Scrutiny: Obtain certified copy or eCourts web copy of the FIR; analyze penal sections charged under BNS 2023.",
          "Section 35 BNSS Notice Verification: Check if police served mandatory notice to appear under Section 35 BNSS (legacy 41A CrPC); document compliance or arbitrary arrest threats.",
          "Bailable vs Non-Bailable Classification: Confirm that at least one offence invoked is non-bailable under the First Schedule of BNSS.",
        ],
      },
      {
        stage: "Stage 2: Grounds Drafting & Personal Liberty Factors",
        items: [
          "Establish Bona Fides & Clean Antecedents: Formulate clear averments that applicant has no prior criminal records, is a permanent resident, and is not a flight risk.",
          "Absence of Custodial Interrogation Need: Establish that the case hinges on documentary or digital evidence already available, rendering custodial torture or custody unnecessary.",
          "Readiness to Cooperate: Include unconditional undertaking to appear before the Investigating Officer as and when summoned.",
        ],
      },
      {
        stage: "Stage 3: Public Prosecutor Service & Interim Order",
        items: [
          "Advance Service: Serve physical copy of bail application upon the Office of the Director General of Prosecution / Public Prosecutor.",
          "Interim Protection Motion: In high-urgency matters, move for interim direction that applicant shall not be arrested pending receipt of Case Diary (CD).",
          "Surety Readiness: Prepare two local solvent sureties with Aadhaar, tax receipts, or solvency certificates for immediate bail bond execution upon grant.",
        ],
      },
    ],
  },
  {
    id: "sop_caveat_cpc",
    code: "SOP-CPC148A-CAV-04",
    title: "Preemptive Caveat Petition under Section 148A CPC",
    shortTitle: "Caveat Lodgement & Monitoring SOP",
    forum: "High Court of Kerala & Subordinate District Courts",
    category: "Civil Procedure",
    turnaround: "Same-Day Execution",
    description:
      "Chamber workflow for preparing and lodging caveats under Section 148A CPC to guarantee advance notice before any ex-parte interim injunction or stay order can be granted against the client.",
    checklist: [
      {
        stage: "Stage 1: Risk Assessment & Adverse Party Identification",
        items: [
          "Apprehended Proceedings: Identify the anticipated suit, appeal, or writ petition likely to be filed by the opposing party.",
          "Exact Party Particulars: Extract verified names, official addresses, and designations of both caveator and proposed applicants.",
        ],
      },
      {
        stage: "Stage 2: Caveat Drafting & Formalities",
        items: [
          "High Court Form No. 19 / Civil Rules of Practice: Draft caveat petition reciting that caveator has right to appear on any application for interim relief.",
          "Supporting Affidavit: Execute solemn affidavit affirmed by caveator or power of attorney holder.",
        ],
      },
      {
        stage: "Stage 3: Service & Registry Registration",
        items: [
          "Pre-Filing Postal Service: Despatch caveat petition by Registered Post A/D to the proposed applicant; preserve postal booking receipts.",
          "Registry Lodgement: File caveat petition with registry receipt proof; obtain Caveat Registration Number.",
          "90-Day Renewal Calendar: Tag caveat expiry in ERP calendar (valid for 90 days from filing under Section 148A(5)).",
        ],
      },
    ],
  },
];

export const DEFAULT_KB_ARTICLES = [
  {
    id: "art_valsamma_telegraph",
    title: "Valsamma v. KSEB & Beyond: Navigating Section 16 Telegraph Act Injunctions in Kerala",
    author: "Adv. Meera Krishnan",
    designation: "Senior Chamber Counsel",
    category: "Constitutional Writs & Utilities",
    readTime: "8 min read",
    date: "14 Oct 2024",
    summary:
      "A comprehensive review of the Full Bench doctrine in Valsamma v. KSEB (2012) regarding the mandatory requirement for electricity authorities to obtain an order from the District Magistrate upon landowner objection before drawing high-tension lines or felling yielding trees.",
    keyTakeaways: [
      "Telegraph authorities do not possess unilateral adjudicatory power to override private property resistance.",
      "Any entry onto land following objection without an order under Section 16(1) is an actionable statutory trespass.",
      "Landowners are entitled to comprehensive diminution-in-land-value compensation under Section 10(d) and Section 16(3).",
    ],
    fullContent: `
### Background & The Statutory Scheme
Under Section 10 of the Indian Telegraph Act, 1885, read with Section 164 of the Electricity Act, 2003, the transmission licensee is authorized to place electric lines and posts under, over, along, or across any immovable property. However, this power is conditioned by Section 10(b), which explicitly provides that the authority acquires ONLY a right of user, and by Section 10(d), which mandates that the authority shall do as little damage as possible and pay full compensation for all damages sustained.

### The Landmark Full Bench Ruling in Valsamma
In Valsamma v. K.S.E.B. [2012 (2) KLT 368], the Full Bench of the High Court of Kerala settled the long-standing controversy regarding what happens when a property owner objects to the entry of KSEB officials. The court held in unequivocal terms:

1. **Mandatory Referral to District Magistrate**: When a landowner or lawful occupier raises an objection or resistance to the proposed line, the transmission authority has NO authority to determine the validity of the objection itself.
2. **Cessation of Work**: The authority must immediately cease execution work on that parcel of land and approach the District Magistrate under Section 16(1) of the Act.
3. **Quasi-Judicial Consideration**: The District Magistrate must issue notice to the landowner, consider alternative routes suggested, evaluate technical feasibility, and pass a speaking order.
4. **Remedy under Article 226**: Any attempt by utility contractors to bypass the District Magistrate and enter with police protection without a Section 16(1) order constitutes an arbitrary exercise of state power, warranting an urgent Writ of Mandamus or Prohibition from the High Court of Kerala.

### Diminution of Land Value: The Doddakka Precedent
In Executive Engineer, KSEB v. Doddakka [(2015) 15 SCC 738], the Hon'ble Supreme Court affirmed that compensation under Section 10(d) is not limited to tree value or crop damage. The corridor beneath high-voltage lines (220kV / 110kV / 66kV) suffers severe building restrictions under the Indian Electricity Rules, leading to permanent diminution in land market value. The District Judge under Section 16(3) is bound to award diminution compensation, generally ranging between 30% and 50% of the land value within the corridor strip.
    `,
  },
  {
    id: "art_bns_concordance",
    title: "The Practical Shift: Transitioning from CrPC 438 to BNSS 482 Before the Kerala High Court",
    author: "Adv. Meera Krishnan",
    designation: "Criminal Practice Desk",
    category: "Criminal Law & Procedure",
    readTime: "7 min read",
    date: "20 Oct 2024",
    summary:
      "A strategic practitioner's guide to the procedural and substantive shifts in anticipatory bail practice following the commencement of the Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023 on 1 July 2024.",
    keyTakeaways: [
      "Section 482 BNSS 2023 replaces legacy Section 438 CrPC for anticipatory bail.",
      "Section 35 BNSS notice of appearance replaces legacy Section 41A CrPC safeguards against arbitrary arrest.",
      "Pleadings must explicitly reference concordance between old IPC sections and new BNS provisions.",
    ],
    fullContent: `
### The New Statutory Landscape
With the formal enforcement of the new criminal codes on 1 July 2024, criminal chamber practice has undergone significant structural realignment. Section 482 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023, now embodies the provisions governing anticipatory bail, formerly codified under Section 438 of the Code of Criminal Procedure, 1973.

### Concordance & The Principle of Prospective Application
Where offences are alleged to have occurred prior to 1 July 2024, the substantive offences remain governed by the Indian Penal Code, 1860, while procedural remedies instituted post-July 1 are governed by BNSS 2023. Our chamber briefs adhere to strict concordance mapping:
- Legacy IPC 420 (Cheating) corresponds to BNS Section 318(4).
- Legacy IPC 406 (Criminal Breach of Trust) corresponds to BNS Section 316.
- Legacy IPC 468/471 (Forgery) corresponds to BNS Section 336/340.

### The Power of Section 35 BNSS (Legacy 41A CrPC)
In matters where the alleged punishment is 7 years or less, Section 35 BNSS makes issuance of a notice of appearance mandatory unless reasons for immediate arrest are recorded in writing. High Court of Kerala practice demonstrates that demonstrating compliance with Section 35 BNSS is often the quickest path to obtaining interim protection against coercive steps.
    `,
  },
  {
    id: "art_perkins_arbitration",
    title: "Unilateral Appointment of Arbitrators Post Perkins Eastman & TRF Limited",
    author: "Chamber Commercial Desk",
    designation: "Arbitration & Insolvency Desk",
    category: "Commercial Arbitration",
    readTime: "11 min read",
    date: "16 Oct 2024",
    summary:
      "An in-depth analysis of Section 12(5) of the Arbitration and Conciliation Act 1996 and the Supreme Court rulings disqualifying unilateral appointment of sole arbitrators in government and commercial contracts.",
    keyTakeaways: [
      "A party interested in the dispute outcome cannot appoint a sole arbitrator.",
      "Unilateral appointment clauses in standard form contracts are void ab initio.",
      "Remedy lies in filing Section 11(6) petition before the High Court for independent arbitrator appointment.",
    ],
    fullContent: `
### The Seventh Schedule Revolution
Following the 2015 Amendments to the Arbitration and Conciliation Act, 1996, the legislature introduced Section 12(5) along with the Seventh Schedule, codifying non-derogable grounds of arbitrator ineligibility based on the IBA Guidelines on Conflicts of Interest.

### From TRF Limited to Perkins Eastman
In TRF Limited v. Energo Engineering Projects Ltd. [(2017) 8 SCC 377], the Supreme Court held that once a person becomes ineligible by operation of law under Section 12(5) (e.g., Managing Director), that person also loses the legal capacity to nominate someone else as arbitrator.

This principle was expanded in Perkins Eastman Architects DPC v. HSCC (India) Ltd. [(2020) 20 SCC 760]. The Court ruled that even if the Managing Director is not acting as the arbitrator himself, he cannot have the unilateral power to choose the sole arbitrator, as the nominating authority has an inherent interest in the outcome.

### Practical Implications for Active Contracts
Any arbitral award rendered by a unilaterally appointed sole arbitrator is vulnerable to challenge under Section 34 on the ground of patent illegality and lack of jurisdiction. When served with a notice invoking arbitration under a unilateral clause, the recommended strategy is to reject the nomination and immediately petition the High Court under Section 11(6).
    `,
  },
  {
    id: "art_ni_postal_presumption",
    title: "Postal Presumption & Section 142(2) Territorial Rules in S.138 Cheque Dishonour",
    author: "Adv. Rajesh V. Varma",
    designation: "Banking Litigation Desk",
    category: "Banking & Negotiable Instruments",
    readTime: "9 min read",
    date: "08 Oct 2024",
    summary:
      "Navigating the statutory presumption of notice service under Section 27 General Clauses Act and establishing territorial jurisdiction based on payee bank branch location under the 2015 NI amendment.",
    keyTakeaways: [
      "Proof of dispatch to correct address raises presumption of service under Section 27 General Clauses Act.",
      "Drawer's deliberate non-claiming or postal avoidance does not defeat statutory notice requirement.",
      "Territorial jurisdiction is anchored to the payee's bank branch under Section 142(2).",
    ],
    fullContent: `
### Section 27 General Clauses Act & Postal Presumption
Under Section 138(c) of the NI Act, the cause of action arises only after the drawer fails to make payment within 15 days of the 'receipt' of the notice. Accused drawers frequently contend that notice was never served.

In K. Bhaskaran v. Sankaran Vaidhyan Balan [(1999) 7 SCC 510] and C.C. Alavi Haji v. Palapetty Muhammed [(2007) 6 SCC 555], the Supreme Court held that once notice is dispatched by registered post / speed post with correct address prepaid, Section 27 of the General Clauses Act, 1897, and Section 114 of the Evidence Act raise a mandatory presumption of service. If the accused claims non-receipt, he has 15 days from the date of summons service in court to tender the cheque amount.

### Section 142(2) Territorial Jurisdiction
The Negotiable Instruments (Amendment) Act, 2015, definitively settled the forum shopping issue. Under Section 142(2)(a), if the cheque is delivered for collection through an account, the offence shall be inquired into and tried only by a court within whose local jurisdiction the branch of the bank where the payee or holder in due course maintains the account is situated.
    `,
  },
];

export const DEFAULT_RESEARCH_BRIEFS = [
  {
    id: "brief_001",
    _id: "brief_001",
    title: "Telegraph Act Section 16 Injunction & Mandatory Magistrate Referral",
    matterReference: "WP(C) 19482/2024 (Gopakumar v. KSEB)",
    category: "Constitutional Writs",
    author: "Adv. Meera Krishnan",
    createdAt: "18 Oct 2024",
    summary:
      "Precedent synthesis establishing that the transmission licensee has no authority to proceed with high-tension line drawing over agricultural holdings upon resistance without obtaining a prior order from the District Magistrate under Section 16(1).",
    legalPropositions: [
      "Transmission licensee acquires only right of user under Section 10(b), not proprietary ownership.",
      "Upon objection by landowner or lawful occupier, work must be paused and referred to District Magistrate.",
      "Land diminution compensation under Section 10(d) & 16(3) is mandatory for line corridor restriction.",
    ],
    citations: [
      {
        citation: "Valsamma v. K.S.E.B.",
        court: "High Court of Kerala (Full Bench)",
        reporter: "2012 (2) KLT 368",
        proposition: "Telegraph authority has no power to adjudicate landowner resistance unilaterally.",
      },
      {
        citation: "Executive Engineer, KSEB v. Doddakka",
        court: "Supreme Court of India",
        reporter: "(2015) 15 SCC 738",
        proposition: "Permanent diminution in land market value must be assessed under Section 10(d).",
      },
      {
        citation: "Power Grid Corp of India v. Century Textiles Ltd",
        court: "Supreme Court of India",
        reporter: "(2017) 5 SCC 143",
        proposition: "Section 164 Electricity Act confers Telegraph Act powers subject to Section 10/16 safeguards.",
      },
    ],
  },
  {
    id: "brief_002",
    _id: "brief_002",
    title: "Invalidity of Unilateral Arbitrator Appointment Clause in Commercial Contracts",
    matterReference: "ARB/NCLT/KOCHI/2024/041 (Malabar Infotech)",
    category: "Commercial Arbitration",
    author: "Adv. Meera Krishnan",
    createdAt: "15 Oct 2024",
    summary:
      "Authority bundle establishing that unilateral appointment of a sole arbitrator by one party or its Managing Director is void ab initio under Section 12(5) read with Seventh Schedule of the 1996 Act.",
    legalPropositions: [
      "A party interested in dispute outcome cannot unilaterally nominate a sole arbitrator.",
      "Ineligible nominee cannot be cured by private contract terms without post-dispute written waiver.",
      "The competent High Court under Section 11(6) must appoint an independent sole arbitrator.",
    ],
    citations: [
      {
        citation: "Perkins Eastman Architects DPC v. HSCC (India) Ltd.",
        court: "Supreme Court of India",
        reporter: "(2020) 20 SCC 760",
        proposition: "A person disqualified from acting as arbitrator cannot nominate an arbitrator.",
      },
      {
        citation: "TRF Limited v. Energo Engineering Projects Ltd.",
        court: "Supreme Court of India",
        reporter: "(2017) 8 SCC 377",
        proposition: "Statutory disqualification under Section 12(5) renders nomination authority void.",
      },
      {
        citation: "Bharat Broadband Network Ltd. v. United Telecoms Ltd.",
        court: "Supreme Court of India",
        reporter: "(2019) 5 SCC 755",
        proposition: "Express agreement in writing required for waiver under Section 12(5) proviso.",
      },
    ],
  },
  {
    id: "brief_003",
    _id: "brief_003",
    title: "Section 482 BNSS Anticipatory Bail for Commercial Dishonour / Cheating Allegations",
    matterReference: "General Chamber Precedent Pool",
    category: "Criminal Jurisprudence",
    author: "Adv. Meera Krishnan",
    createdAt: "12 Oct 2024",
    summary:
      "Synthesis of High Court and Supreme Court authorities guarding against criminalization of civil contractual breaches under IPC 420 / BNS 318 where Section 138 NI Act remedy exists.",
    legalPropositions: [
      "Mere failure to repay a loan or dishonour of a cheque does not constitute cheating without fraudulent intent from inception.",
      "Simultaneous invocation of Section 138 NI Act and criminal cheating requires strict scrutiny to prevent abuse of process.",
      "Custodial interrogation is unwarranted where transaction is fully evidenced by bank statements and contracts.",
    ],
    citations: [
      {
        citation: "Dalip Kaur v. Jagnar Singh",
        court: "Supreme Court of India",
        reporter: "(2009) 14 SCC 696",
        proposition: "Breach of contractual promise does not amount to cheating without dishonest inception.",
      },
      {
        citation: "Arnesh Kumar v. State of Bihar",
        court: "Supreme Court of India",
        reporter: "(2014) 8 SCC 273",
        proposition: "Arrest cannot be made mechanically for offences punishable with up to 7 years imprisonment.",
      },
      {
        citation: "Sushila Aggarwal v. State (NCT of Delhi)",
        court: "Supreme Court of India (Constitution Bench)",
        reporter: "(2020) 5 SCC 1",
        proposition: "Anticipatory bail should not ordinarily be restricted to a predetermined time period.",
      },
    ],
  },
  {
    id: "brief_004",
    _id: "brief_004",
    title: "Specific Performance & Discretionary Injunction under Specific Relief Act 1963",
    matterReference: "OS 412/2023 (Gopakumar v. Varghese Builders)",
    category: "Civil Property & Injunctions",
    author: "Adv. Rajesh V. Varma",
    createdAt: "09 Oct 2024",
    summary:
      "Analysis of Section 10 post-2018 amendment to Specific Relief Act removing judicial discretion in enforcing valid immovable property agreements.",
    legalPropositions: [
      "Specific performance of contracts is mandatory post-2018 amendment unless barred by Section 11, 14, or 16.",
      "Injunction against alienation pendente lite is necessary to preserve property status quo under Section 52 TP Act.",
    ],
    citations: [
      {
        citation: "B. Santoshamma v. D. Sarala",
        court: "Supreme Court of India",
        reporter: "(2020) 19 SCC 80",
        proposition: "Post-2018 amendment, court is bound to enforce specific performance of contracts.",
      },
      {
        citation: "Maharwal Khewaji Trust v. Baldev Dass",
        court: "Supreme Court of India",
        reporter: "(2004) 8 SCC 488",
        proposition: "Status quo must be maintained unless irreparable loss is demonstrated.",
      },
    ],
  },
];

// ============================================================================
// DEFAULT SEED DATA FOR MULTI-PARTY CASE COLLABORATION ROOM (Milestone 2)
// ============================================================================
export const DEFAULT_COLLAB_ROOMS = [
  {
    id: "room_wpc_19482",
    subject: "WP(C) 19482/2024 — High Court Rejoinder & Precedent Briefing",
    matterId: "mat_wpc_19482",
    matterTitle: "WP(C) 19482/2024 — Gopakumar v. KSEB & Anr.",
    status: "in_session",
    scheduledFor: "Today, 10:30 AM",
    meetingLink: "https://meet.wakheel.law/collab-room-wpc-19482",
    pinnedExhibit: {
      id: "exh_survey_p1",
      title: "Annexure P-1: Survey Sketch Re-survey Plan Block 14",
      pages: 4,
      currentPage: 1,
      type: "pdf",
      matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
      verifiedDate: "18 Oct 2024",
    },
    participants: [
      {
        id: "adv_1",
        name: "Adv. Meera Krishnan",
        role: "Lead Advocate (Host)",
        enrollment: "K/1429/2016",
        isOnline: true,
        isMuted: false,
        isVideoOn: true,
        isScreenSharing: false,
      },
      {
        id: "adv_sr_01",
        name: "Sr. Adv. K. Ramachandran Nair",
        role: "Senior Counsel",
        enrollment: "K/0412/1994",
        isOnline: true,
        isMuted: true,
        isVideoOn: true,
        isScreenSharing: false,
      },
      {
        id: "adv_jr_02",
        name: "Adv. Ananya Kurian",
        role: "Chamber Associate",
        enrollment: "K/2180/2021",
        isOnline: true,
        isMuted: true,
        isVideoOn: false,
        isScreenSharing: false,
      },
      {
        id: "default_citizen",
        name: "Gopakumar Nambiar",
        role: "Citizen Litigant",
        phone: "+91 94471 28400",
        isOnline: true,
        isMuted: false,
        isVideoOn: true,
        isScreenSharing: false,
      },
    ],
    availableExhibits: [
      {
        id: "exh_survey_p1",
        title: "Annexure P-1: Survey Sketch Re-survey Plan Block 14",
        pages: 4,
        type: "Survey Sketch / Site Map",
        verifiedDate: "18 Oct 2024",
      },
      {
        id: "exh_counter_p2",
        title: "Annexure P-2: KSEB Executive Engineer Counter Affidavit",
        pages: 8,
        type: "Pleading Counter",
        verifiedDate: "22 Oct 2024",
      },
      {
        id: "exh_telegraph_valsamma",
        title: "Annexure P-3: Valsamma v. KSEB (2012 (2) KLT 368) Full Bench Ratio",
        pages: 3,
        type: "Precedent Ratio Copy",
        verifiedDate: "Precedent",
      },
    ],
    notes:
      "Client Gopakumar confirmed tree-felling commenced without prior District Magistrate notice under Section 16(1). Senior Counsel recommended moving interim stay application tomorrow morning before Bench 2A.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "room_ni_138",
    subject: "Section 138 NI Act — Statutory Demand Notice & Trial Strategy",
    matterId: "mat_not_701",
    matterTitle: "Cheque Dishonour Statutory Demand Notice (Sec 138 NI Act)",
    status: "ready",
    scheduledFor: "Today, 02:30 PM",
    meetingLink: "https://meet.wakheel.law/collab-room-ni-138",
    pinnedExhibit: {
      id: "exh_speedpost_p2",
      title: "Annexure P-2: Speed Post Certified Delivery Report (EK948102391IN)",
      pages: 2,
      currentPage: 1,
      type: "pdf",
      matter: "Sec 138 Notice",
      verifiedDate: "16 Oct 2024",
    },
    participants: [
      {
        id: "adv_1",
        name: "Adv. Meera Krishnan",
        role: "Lead Advocate (Host)",
        enrollment: "K/1429/2016",
        isOnline: true,
        isMuted: false,
        isVideoOn: true,
        isScreenSharing: false,
      },
      {
        id: "default_citizen",
        name: "Gopakumar Nambiar",
        role: "Complainant Payee",
        phone: "+91 94471 28400",
        isOnline: false,
        isMuted: true,
        isVideoOn: false,
        isScreenSharing: false,
      },
    ],
    availableExhibits: [
      {
        id: "exh_speedpost_p2",
        title: "Annexure P-2: Speed Post Certified Delivery Report (EK948102391IN)",
        pages: 2,
        type: "Postal Delivery Proof",
        verifiedDate: "16 Oct 2024",
      },
      {
        id: "exh_bankmemo_p1",
        title: "Annexure P-1: Original Bank Dishonour Debit Advice",
        pages: 1,
        type: "Bank Memo",
        verifiedDate: "10 Oct 2024",
      },
    ],
    notes: "15-day statutory cure window expires in 6 days. Complaint draft ready for JFCM Ernakulam.",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================================================
// DEFAULT SEED DATA FOR COURTROOM VOICE HEARING SIMULATOR (Milestone 3)
// ============================================================================
export const DEFAULT_COURTROOM_SESSIONS = [
  {
    id: "session_001",
    advocateId: "adv_1",
    matterId: "mat_wpc_19482",
    matterTitle: "WP(C) 19482/2024 — Gopakumar v. KSEB & Anr.",
    benchPersona: "division_bench_2a",
    benchName: "Kerala High Court Division Bench 2A (Coram: Mustaque & Eapen, JJ.)",
    finalScore: 94,
    statutoryPrecision: 96,
    disposition: "Interim Stay Granted (4 Weeks)",
    duration: "08:15",
    date: "24 Oct 2024",
    summary:
      "Oral argument successfully countered initial maintainability skepticism by invoking Whirlpool exceptions and secured 4-week interim stay on tree-felling based on the Valsamma Full Bench doctrine.",
    turns: [
      {
        turnIndex: 1,
        benchQuery:
          "Counsel, before we examine the merits of your tree-felling grievance, why should this Division Bench exercise extraordinary prerogative writ jurisdiction when Section 16(3) of the Telegraph Act provides an alternate forum before the District Court?",
        advocateArgument:
          "My Lords, we rely directly on the four exceptions carved in Whirlpool Corporation (1998) 8 SCC 1. Here, the impugned entry is completely without jurisdiction and in ex-facie violation of principles of natural justice without prior notice.",
        score: 88,
        statutoryPrecision: 90,
        disposition: "Engaged on Statutory Jurisdiction",
        recommendedCitation: "Whirlpool Corporation v. Registrar of Trade Marks (1998) 8 SCC 1",
      },
      {
        turnIndex: 2,
        benchQuery:
          "Very well, Counsel. Valsamma is a Full Bench decision binding on us. If resistance was formally lodged and the licensee did not approach the District Magistrate, the entry appears prima facie without authority of law. What interim directions are you seeking?",
        advocateArgument:
          "My Lords, under Valsamma v. KSEB (2012) 2 KLT 368, the authority has no power to adjudicate resistance unilaterally. We pray for an ad-interim stay restraining the respondents from drawing lines or felling 45 yielding rubber trees in Sy. 142/3.",
        score: 96,
        statutoryPrecision: 98,
        disposition: "Interim Stay Granted",
        recommendedCitation: "Valsamma v. KSEB 2012 (2) KLT 368 (Full Bench)",
      },
    ],
  },
  {
    id: "session_002",
    advocateId: "adv_1",
    matterId: "mat_not_701",
    matterTitle: "Cheque Dishonour Statutory Demand Notice (Sec 138 NI Act)",
    benchPersona: "single_bench_writs",
    benchName: "Judicial Magistrate First Class (Court Hall 1)",
    finalScore: 91,
    statutoryPrecision: 93,
    disposition: "Pre-Summoning Cognizance Issued",
    duration: "05:40",
    date: "22 Oct 2024",
    summary:
      "Established postal service presumption under Section 27 General Clauses Act and payee branch territorial jurisdiction under Section 142(2) post-2015 amendment.",
    turns: [
      {
        turnIndex: 1,
        benchQuery:
          "Counsel, the postal tracking record shows the envelope was returned as 'Not Claimed'. How do you satisfy the statutory requirement of notice 'receipt' under Section 138(c)?",
        advocateArgument:
          "Your Honour, as held by the Supreme Court in C.C. Alavi Haji and K. Bhaskaran, when notice is sent to the correct address by registered post, deliberate evasion or non-claiming constitutes deemed service under Section 27 General Clauses Act.",
        score: 91,
        statutoryPrecision: 93,
        disposition: "Satisfied on Deemed Service",
        recommendedCitation: "C.C. Alavi Haji v. Palapetty Muhammed (2007) 6 SCC 555",
      },
    ],
  },
];

// ============================================================================
// DEFAULT CALENDAR CONSTANTS
// ============================================================================
const DEFAULT_CALENDAR_BACKLOG = [
  {
    id: "task-bk-1",
    title: "Draft Section 14 Eviction Notice",
    category: "drafting",
    priority: "high",
    estimatedTime: "1h 30m",
    caseRef: "Tenancy 108/2026",
  },
  {
    id: "task-bk-2",
    title: "Research Article 226 telegraph deviation locus",
    category: "research",
    priority: "urgent",
    estimatedTime: "2h",
    caseRef: "WP(C) 19482/2024",
  },
  {
    id: "task-bk-3",
    title: "Prepare compilation of Supreme Court citations for Bench 4",
    category: "evidence",
    priority: "normal",
    estimatedTime: "45m",
    caseRef: "ARB/NCLT/041/2024",
  },
];

const DEFAULT_CALENDAR_FIXTURES = [
  {
    id: "evt-1",
    title: "WP(C) 19482/2024 — Hearing on Stay Extension",
    category: "hearing",
    date: "2026-10-30",
    time: "10:15 AM",
    duration: "45m",
    caseNumber: "WP(C) 19482/2024",
    forum: "High Court of Kerala (Court Hall 2A)",
    clientName: "Gopakumar Nambiar",
    notes: "Division bench hearing on transmission line alignment stay.",
    status: "confirmed",
  },
  {
    id: "evt-2",
    title: "OS 412/2023 — Plaintiff Witness Cross-Examination",
    category: "hearing",
    date: "2026-11-04",
    time: "11:00 AM",
    duration: "1h",
    caseNumber: "OS 412/2023",
    forum: "Principal Munsiff Court, Ernakulam",
    clientName: "Gopakumar Nambiar",
    notes: "Cross-examination on boundary encroachment and survey sketch.",
    status: "confirmed",
  },
  {
    id: "evt-3",
    title: "ARB/NCLT/041/2024 — Section 17 Interim Relief Hearing",
    category: "hearing",
    date: "2026-11-18",
    time: "02:30 PM",
    duration: "1h 30m",
    caseNumber: "ARB/NCLT/041/2024",
    forum: "NCLT Kochi Bench & Arbitral Tribunal",
    clientName: "Malabar Infotech Solutions",
    notes: "Arguments on escrow deposit preservation.",
    status: "confirmed",
  },
  {
    id: "evt-4",
    title: "Chamber Conference: Supreme Court SLP Strategy with Adv. Parasaran",
    category: "consultation",
    date: "2026-10-30",
    time: "04:30 PM",
    duration: "1h",
    forum: "Chamber Virtual Gateway",
    clientName: "Gopakumar Nambiar",
    notes: "Constitution Bench reference strategy discussion.",
    status: "urgent",
  },
];

// ============================================================================
// DEFAULT PROFESSIONAL NETWORK CONSTANTS
// ============================================================================
const DEFAULT_NETWORK_CONTACTS = [
  {
    id: "c-1",
    name: "Senior Adv. Sneha Kulkarni",
    degree: "2nd",
    role: "Senior Counsel • Constitutional & Civil Writs",
    chamber: "Kulkarni Law Chambers",
    bench: "High Court of Kerala",
    location: "Kochi, Kerala",
    stage: "discover",
    practiceArea: "Constitutional Law",
    source: "Network Recommendation",
    mutualsCount: 11,
    statusQuote: "Connection invitation dispatched via Bar Council Directory",
    lastActive: "1mo ago",
    isOnline: true,
    barEnrollment: "K/001429/2012",
    phone: "+91 94471 28910",
    email: "sneha.kulkarni@hcbar.in",
    briefsCount: 0,
  },
  {
    id: "c-2",
    name: "Adv. Tariq Mansoor",
    degree: "2nd",
    role: "Appellate Counsel • Commercial Disputes",
    chamber: "Mansoor & Associates",
    bench: "Delhi High Court",
    location: "New Delhi",
    stage: "discover",
    practiceArea: "Commercial Arbitration",
    source: "Network Recommendation",
    mutualsCount: 7,
    statusQuote: "Profile vetted for co-counseling in cross-border tech licensing",
    lastActive: "3w ago",
    isOnline: false,
    barEnrollment: "D/1092/2015",
    phone: "+91 98110 43921",
    email: "tariq@mansoorlaw.com",
    briefsCount: 0,
  },
  {
    id: "c-3",
    name: "Adv. Rahul Sharma",
    degree: "1st",
    role: "Chamber Head • Corporate Insolvency & IBC",
    chamber: "Sharma & Partners Law Offices",
    bench: "NCLAT / High Court of Karnataka",
    location: "Bengaluru, India",
    stage: "connected",
    practiceArea: "Corporate & Insolvency",
    source: "Network Recommendation",
    mutualsCount: 18,
    statusQuote: "Connection established; reciprocal briefing agreement shared",
    lastActive: "1mo ago",
    isOnline: true,
    barEnrollment: "KAR/2381/2014",
    phone: "+91 98450 19283",
    email: "rahul@sharmapartners.in",
    briefsCount: 1,
  },
  {
    id: "c-4",
    name: "Adv. Nandita Sengupta",
    degree: "1st",
    role: "Managing Associate • Banking & SARFAESI",
    chamber: "Calcutta Jurists Collective",
    bench: "Calcutta High Court",
    location: "Kolkata, West Bengal",
    stage: "connected",
    practiceArea: "Corporate & Insolvency",
    source: "Bar Council Directory",
    mutualsCount: 14,
    statusQuote: "Mutual referral protocol confirmed for DRT appeals",
    lastActive: "2w ago",
    isOnline: true,
    barEnrollment: "WB/892/2017",
    phone: "+91 98301 77291",
    email: "nandita@caljurists.com",
    briefsCount: 1,
  },
  {
    id: "c-5",
    name: "Adv. Karan Patel",
    degree: "1st",
    role: "Director of Practice & Ops • Dispute Resolution",
    chamber: "Patel & Lex Associates",
    bench: "Bombay High Court",
    location: "Mumbai, India",
    stage: "contacted",
    practiceArea: "Commercial Arbitration",
    source: "LinkedIn Import",
    mutualsCount: 19,
    statusQuote: "Initial partnership message sent with joint case synopsis",
    lastActive: "1mo ago",
    isOnline: false,
    barEnrollment: "MAH/4102/2013",
    phone: "+91 98200 48190",
    email: "karan@patellex.in",
    briefsCount: 1,
  },
  {
    id: "c-6",
    name: "Adv. Vikramaditya Mehta",
    degree: "1st",
    role: "Senior Partner • IP, Trademarks & Media Rights",
    chamber: "Mehta Legal Chambers",
    bench: "High Court of Telangana",
    location: "Hyderabad, India",
    stage: "contacted",
    practiceArea: "Intellectual Property",
    source: "Direct Reachout",
    mutualsCount: 14,
    statusQuote: "Personalized intro message sent with prior judgment citations",
    lastActive: "1mo ago",
    isOnline: true,
    barEnrollment: "TS/1984/2011",
    phone: "+91 98490 33419",
    email: "vikram@mehtalegal.com",
    briefsCount: 1,
  },
  {
    id: "c-7",
    name: "Adv. Priya Sundaram",
    degree: "1st",
    role: "Principal Arbitration Counsel • Infra & Energy",
    chamber: "Sundaram Arbitration Chambers",
    bench: "Bombay High Court",
    location: "Mumbai, India",
    stage: "engaged",
    practiceArea: "Commercial Arbitration",
    source: "HC Bar Conference",
    mutualsCount: 31,
    statusQuote: "Positive response received: 'Would love to review rejoinder brief.'",
    lastActive: "1mo ago",
    isOnline: true,
    barEnrollment: "MAH/1820/2010",
    phone: "+91 98205 99401",
    email: "priya@sundaramchambers.in",
    briefsCount: 2,
  },
  {
    id: "c-8",
    name: "Adv. Arjun Nambiar",
    degree: "1st",
    role: "Senior Chamber Counsel • Public Law & Writs",
    chamber: "Nambiar & Kurian Advocates",
    bench: "Supreme Court of India / High Court of Kerala",
    location: "Bengaluru / Ernakulam",
    stage: "meeting",
    practiceArea: "Constitutional Law",
    source: "Direct Reachout",
    mutualsCount: 22,
    statusQuote: "Chamber pre-trial strategy conference scheduled for Monday 10:30 AM",
    lastActive: "1mo ago",
    isOnline: true,
    barEnrollment: "K/001844/2007",
    phone: "+91 94473 11820",
    email: "arjun@nambiaradvocates.com",
    briefsCount: 3,
  },
  {
    id: "c-9",
    name: "Senior Adv. K. Parasaran",
    degree: "1st",
    role: "Senior Counsel • Supreme Court Constitution Bench",
    chamber: "Parasaran Law Chambers",
    bench: "Supreme Court of India",
    location: "New Delhi",
    stage: "active",
    practiceArea: "Constitutional Law",
    source: "High Court Bar Assn",
    mutualsCount: 68,
    statusQuote: "Active Co-Counsel on WP(C) 19482/2024 Constitution Bench reference",
    lastActive: "1d ago",
    isOnline: true,
    barEnrollment: "SC/00012/1980",
    phone: "+91 98100 11200",
    email: "chambers@parasaran.legal",
    briefsCount: 5,
  },
  {
    id: "c-10",
    name: "Adv. Harish Salve KC",
    degree: "1st",
    role: "King's Counsel & Senior Advocate • Cross-Border Arbitrations",
    chamber: "Blackstone / Salve Chambers",
    bench: "Supreme Court / London Commercial Court",
    location: "Mumbai / London",
    stage: "active",
    practiceArea: "Commercial Arbitration",
    source: "Referral Network",
    mutualsCount: 82,
    statusQuote: "Designated Lead Senior on international enforcement arbitration matter",
    lastActive: "2d ago",
    isOnline: false,
    barEnrollment: "MAH/00055/1982",
    phone: "+44 20 7404 0000",
    email: "salve.clerk@blackstonechambers.com",
    briefsCount: 4,
  },
];

const DEFAULT_NETWORK_ACTIVITIES = [
  {
    id: "act-1",
    type: "connected",
    advocateName: "Adv. Rahul Sharma",
    description: "accepted your connection request and reciprocal referral protocol.",
    timestamp: "2h ago",
  },
  {
    id: "act-2",
    type: "connected",
    advocateName: "Adv. Nandita Sengupta",
    description: "accepted your DRT appeal co-counsel invitation.",
    timestamp: "1d ago",
  },
  {
    id: "act-3",
    type: "transitioned",
    advocateName: "Senior Adv. K. Parasaran",
    description: "transitioned to Active Relationship partner for WP(C) 19482/2024.",
    timestamp: "2d ago",
  },
  {
    id: "act-4",
    type: "brief",
    advocateName: "Adv. Vikramaditya Mehta",
    description: "reviewed your counter-affidavit draft and shared 3 precedent annotations.",
    timestamp: "3d ago",
  },
  {
    id: "act-5",
    type: "meeting",
    advocateName: "Adv. Arjun Nambiar",
    description: "confirmed chamber briefing session for Monday 10:30 AM in Court Hall 4.",
    timestamp: "4d ago",
  },
];

const DEFAULT_NETWORK_FOLLOWUPS = [
  {
    id: "fu-1",
    advocateName: "Adv. Vikramaditya Mehta",
    task: "Send follow-up on rejoinder draft & annexure list",
    dueText: "Due Tomorrow",
    dueUrgent: true,
  },
  {
    id: "fu-2",
    advocateName: "Adv. Arjun Nambiar",
    task: "Prepare compilation of Supreme Court citations for Bench 4",
    dueText: "In 2 days",
    dueUrgent: false,
  },
  {
    id: "fu-3",
    advocateName: "Senior Adv. Harish Salve KC",
    task: "Confirm arbitral hearing timeline & procedural order 2",
    dueText: "In 4 days",
    dueUrgent: false,
  },
];

const DEFAULT_NETWORK_RECOMMENDATIONS = [
  {
    id: "rec-1",
    name: "Adv. Sneha Kulkarni",
    specialty: "Constitutional & Tax • High Court of Kerala",
    bar: "Kerala High Court Bar Association",
    mutuals: 11,
    status: "pending",
  },
  {
    id: "rec-2",
    name: "Adv. Rohan Deshmukh",
    specialty: "Commercial Arbitration & IBC • NCLAT",
    bar: "Bombay High Court Bar Association",
    mutuals: 19,
    status: "connect",
  },
  {
    id: "rec-3",
    name: "Adv. Vrinda Grover",
    specialty: "Criminal Appeals & Writs • Delhi High Court",
    bar: "Delhi High Court Bar Association",
    mutuals: 34,
    status: "pending",
  },
];

// ============================================================================
// DEFAULT TASK MITE CONSTANTS
// ============================================================================
const DEFAULT_TASKMITE_TASKS = [
  {
    id: "task-1",
    title: "File Rejoinder Affidavit in WP(C) 19482/2024 before 04:00 PM",
    caseMatter: "WP(C) 19482/2024",
    status: "in_progress",
    type: "Court Filing",
    dueDate: "Today",
    dueTime: "04:00 PM",
    isDueUrgent: true,
    priority: "urgent",
    assignee: {
      name: "Adv. Rajiv Malhotra",
      role: "Senior Associate",
      avatarInitials: "RM",
    },
    notes: "Ensure Section 16 Indian Telegraph Act objection annexures are sworn before Commissioner of Oaths.",
  },
  {
    id: "task-2",
    title: "Serve advance copy of Bail Application on Public Prosecutor",
    caseMatter: "BA 4192/2026",
    status: "not_started",
    type: "Court Filing",
    dueDate: "Tomorrow",
    dueTime: "11:00 AM",
    isDueUrgent: true,
    priority: "high",
    assignee: {
      name: "Suresh Rawat",
      role: "Chamber Clerk",
      avatarInitials: "SR",
    },
    notes: "Obtain seal acknowledgement from High Court Prosecution Desk.",
  },
  {
    id: "task-3",
    title: "Prepare cross-examination questionnaire for Plaintiff Witness in OS 412/2023",
    caseMatter: "OS 412/2023",
    status: "in_review",
    type: "Hearing Prep",
    dueDate: "04 Nov 2026",
    priority: "high",
    assignee: {
      name: "Adv. Sarah Jenkins",
      role: "Senior Counsel",
      avatarInitials: "SJ",
    },
    notes: "Focus on Advocate Commissioner re-survey revenue marks and western boundary easement.",
  },
  {
    id: "task-4",
    title: "Research Supreme Court citations on retrospective Section 479 BNSS application",
    caseMatter: "Chamber Research",
    status: "in_progress",
    type: "Research",
    dueDate: "06 Nov 2026",
    priority: "medium",
    assignee: {
      name: "Kunal Verma",
      role: "Paralegal",
      avatarInitials: "KV",
    },
    notes: "Cross-reference recent 2024 Division Bench judgments from Bombay and Delhi High Courts.",
  },
  {
    id: "task-5",
    title: "Finalize Section 17 Interim Relief memo for NCLT Arbitral Tribunal",
    caseMatter: "ARB/NCLT/041/2024",
    status: "not_started",
    type: "Drafting",
    dueDate: "14 Nov 2026",
    priority: "high",
    assignee: {
      name: "Adv. Rajesh V. Varma",
      role: "Commercial Counsel",
      avatarInitials: "RV",
    },
    notes: "Attach audited escrow ledger statements and software maintenance logs.",
  },
  {
    id: "task-6",
    title: "Draft Section 14 Eviction Notice for Alex Morgan tenancy matter",
    caseMatter: "Tenancy 108/2026",
    status: "completed",
    type: "Client Notice",
    dueDate: "14 Oct 2026",
    priority: "medium",
    assignee: {
      name: "Adv. Preeti Sharma",
      role: "Litigation Specialist",
      avatarInitials: "PS",
    },
    completedAt: "14 Oct 2026",
  },
];

const DEFAULT_TASKMITE_NOTES = [
  {
    id: "note-1",
    title: "BNSS Section 479 Retrospective Bail Application Precedents",
    category: "precedent_notes",
    categoryLabel: "Precedent Research",
    content:
      "Supreme Court in In Re Policy Strategy for Grant of Bail observed that benevolent criminal procedure amendments apply retrospectively to pending under-trials. Check Article 20(1) protections.",
    tags: ["BNSS", "Bail", "Article 20"],
    updatedAt: "2 hours ago",
    isPinned: true,
  },
  {
    id: "note-2",
    title: "WP(C) 19482/2024 — Division Bench Rejoinder Strategy Notes",
    category: "hearing_memo",
    categoryLabel: "Hearing Memo",
    content:
      "Section 16(1) of Indian Telegraph Act requires prior written notice to occupier before felling yielding trees. KSEB line survey was conducted ex-parte without revenue demarcation.",
    tags: ["High Court", "Telegraph Act", "Stay"],
    updatedAt: "Yesterday",
    isPinned: true,
  },
  {
    id: "note-3",
    title: "Section 34 Arbitration Limitation — 120-Day Inflexible Ceiling",
    category: "precedent_notes",
    categoryLabel: "Arbitration Law",
    content:
      "Supreme Court in Simplex Infrastructure reiterated Section 5 of Limitation Act cannot condone delay beyond 30 days statutory extension. Outer limit is strictly 120 days.",
    tags: ["Arbitration", "Limitation", "Commercial"],
    updatedAt: "3 days ago",
  },
];

// ============================================================================
// DEFAULT PROFILES CONSTANTS (BCI & DIGILOCKER)
// ============================================================================
const DEFAULT_BCI_CREDENTIALS = {
  advocateName: "Adv. Meera Krishnan",
  enrollmentNumber: "K/001429/2012",
  stateBarCouncil: "Bar Council of Kerala",
  enrollmentYear: 2012,
  verificationStatus: "Verified",
  verifiedBy: "Bar Council of India Verification Portal",
  verifiedOn: "2024-01-15T10:00:00.000Z",
  certificateHash: "SHA256:4a8b92c1092e41fa89bc0192e482910fae",
  practiceBenches: ["High Court of Kerala", "Supreme Court of India", "NCLT Kochi Bench"],
  chamberName: "Meera Krishnan & Associates Chambers of Law",
  chamberAddress: "Chamber #402, High Court Lawyers Chambers Complex, Ernakulam, Kochi 682031",
  chamberEmail: "meera.krishnan@keralahc.gov.in",
  chamberPhone: "+91 94470 12849",
};

const DEFAULT_DIGILOCKER_KYC = {
  citizenName: "Gopakumar Nambiar",
  kycStatus: "Verified",
  verificationSource: "DigiLocker / UIDAI Aadhaar e-KYC Gateway",
  digiLockerDocId: "DL-AADHAAR-8921-4412-2024",
  verifiedAt: "2024-02-10T14:30:00.000Z",
  documentType: "Aadhaar e-KYC XML & Verification Hash",
  maskedId: "XXXX-XXXX-4412",
  address: "Sree Krishna Vilas, Near High Court Junction, Ernakulam, Kerala 682018",
  phone: "+91 94471 28930",
  email: "gopakumar.nambiar@inworth.gov.in",
};
