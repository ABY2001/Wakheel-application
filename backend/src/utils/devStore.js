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
};
