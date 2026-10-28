"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Mail,
  MessageSquare,
  Search,
  Plus,
  Send,
  Paperclip,
  Star,
  Trash2,
  Archive,
  Folder,
  Tag,
  Clock,
  Check,
  CheckCheck,
  ChevronRight,
  ChevronLeft,
  X,
  FileText,
  Download,
  AlertCircle,
  Shield,
  Video,
  Phone,
  CornerUpLeft,
  CornerUpRight,
  MoreVertical,
  Inbox as InboxIcon,
  FileEdit,
  Sparkles,
  User,
  Scale,
  Mic,
  MicOff,
  Calendar,
  Bell,
  Home,
  Users,
  Settings,
  Lightbulb,
  Smile,
  Edit2,
  UserPlus,
} from "lucide-react";

export type InboxMode = "mails" | "messages" | "notifications";
export type MailFolder = "inbox" | "starred" | "drafts" | "sent" | "archive" | "trash";
export type MailCategory = "all" | "work" | "property" | "commercial" | "urgent";

export interface MailAttachment {
  name: string;
  size: string;
  type: string;
  color: "sky" | "amber" | "zinc" | "emerald";
}

export interface LegalEmailItem {
  id: string;
  senderName: string;
  senderEmail: string;
  senderAvatarText: string;
  recipientName: string;
  recipientEmail: string;
  matterTitle: string;
  subject: string;
  snippet: string;
  body: string[];
  timestamp: string;
  fullDate: string;
  folder: MailFolder;
  category: MailCategory;
  categoryLabel: string;
  categoryColor: "zinc" | "amber" | "sky" | "emerald" | "purple";
  isRead: boolean;
  isStarred: boolean;
  attachments?: MailAttachment[];
}

export interface ChatMessage {
  id: string;
  sender: "citizen" | "advocate";
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  attachments?: { name: string; size: string }[];
}

export interface ChatAdvocateThread {
  id: string;
  type: "direct" | "group";
  name: string;
  chamber: string;
  court: string;
  specialization: string;
  matter: string;
  avatarText: string;
  avatarBgColor?: string;
  online: boolean;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  messages: ChatMessage[];
  participants?: string[];
}

export interface LegalNotificationItem {
  id: string;
  title: string;
  category: "all" | "orders" | "hearings" | "notices" | "filings" | "system";
  categoryLabel: string;
  summary: string;
  timestamp: string;
  caseRef?: string;
  isRead: boolean;
  priority: "high" | "normal";
  actionLabel?: string;
}

const INITIAL_LEGAL_EMAILS: LegalEmailItem[] = [
  {
    id: "mail-1",
    senderName: "Adv. Meera Krishnan",
    senderEmail: "meera.krishnan@keralabar.org",
    senderAvatarText: "MK",
    recipientName: "Gopakumar Nambiar",
    recipientEmail: "gopakumar.nambiar@wakheel.in",
    matterTitle: "WP(C) 19482/2024 • High Court of Kerala",
    subject: "Hearing Update: Interim Stay Extended in WP(C) 19482/2024",
    snippet:
      "Division Bench 2A has taken our reply affidavit on record and strongly questioned KSEB regarding Section 16 Telegraph Act compliance...",
    body: [
      "Dear Mr. Gopakumar Nambiar,",
      "I am pleased to report that our matter was called before Division Bench 2A (Hon'ble Mr. Justice P.B. Suresh Kumar and Hon'ble Mr. Justice C. Pratheep Kumar) today as Item No. 18.",
      "The Bench took our counter-reply affidavit on record and sternly questioned the Assistant Executive Engineer regarding their failure to serve mandatory prior written notice under Section 16(1) of the Indian Telegraph Act before entering upon your agricultural property.",
      "Consequently, the Hon'ble Court has extended the interim stay order in full force until 12 November 2026. The KSEB contractors are strictly prohibited from moving machinery or cutting standing rubber trees on your holding.",
      "Please find attached the certified true copy of today's Daily Order as well as the marked annexures for your records.",
      "Best regards,\nAdv. Meera Krishnan\nSenior Counsel, High Court of Kerala",
    ],
    timestamp: "12 min ago",
    fullDate: "27 Oct 2026, 10:24 AM",
    folder: "inbox",
    category: "urgent",
    categoryLabel: "High Court Stay Order",
    categoryColor: "zinc",
    isRead: false,
    isStarred: true,
    attachments: [
      {
        name: "WPC_19482_Daily_Order_Bench_2A.pdf",
        size: "1.56 MB",
        type: "pdf",
        color: "sky",
      },
      {
        name: "KSEB_Counter_Affidavit_Scanned.pdf",
        size: "3.82 MB",
        type: "pdf",
        color: "amber",
      },
    ],
  },
  {
    id: "mail-2",
    senderName: "Adv. Sarah Jenkins",
    senderEmail: "sarah.jenkins@ernakulamcourt.org",
    senderAvatarText: "SJ",
    recipientName: "Gopakumar Nambiar",
    recipientEmail: "gopakumar.nambiar@wakheel.in",
    matterTitle: "OS 412/2023 • Principal Munsiff Court",
    subject: "Advocate Commissioner Survey Report Filed in OS 412/2023",
    snippet:
      "The court-appointed Advocate Commissioner has officially filed the re-survey sketch confirming that the adjacent developer encroached 1.8 meters...",
    body: [
      "Dear Mr. Nambiar,",
      "The Advocate Commissioner appointed in OS 412/2023 has submitted their official report and revenue survey sketch before the Principal Munsiff Court today.",
      "Crucially, the report confirms that the western boundary stone of Re-Survey No. 412/1 was shifted by the defendant's construction workers, encroaching 1.8 meters into your registered holding.",
      "The case is posted for examination of the Advocate Commissioner as CW-1 on 04 November 2026. We are in a commanding position to seek a permanent prohibitory decree.",
      "Warm regards,\nAdv. Sarah Jenkins\nChamber 304, District Court Complex",
    ],
    timestamp: "11:42 AM",
    fullDate: "26 Oct 2026, 11:42 AM",
    folder: "inbox",
    category: "property",
    categoryLabel: "Civil & Land Suit",
    categoryColor: "amber",
    isRead: true,
    isStarred: false,
    attachments: [
      {
        name: "Advocate_Commissioner_Survey_Sketch_Sy_412.pdf",
        size: "2.45 MB",
        type: "pdf",
        color: "sky",
      },
    ],
  },
  {
    id: "mail-3",
    senderName: "High Court Registry Notice",
    senderEmail: "registry@hckerala.gov.in",
    senderAvatarText: "HC",
    recipientName: "Gopakumar Nambiar",
    recipientEmail: "gopakumar.nambiar@wakheel.in",
    matterTitle: "WP(C) 19482/2024 • eCourts Cause List",
    subject: "Official eCourts Cause List Publication Notice — Bench 2A",
    snippet:
      "Electronic Registry confirmation: WP(C) 19482/2024 has been listed on the motion board before Division Bench 2A for compliance reporting...",
    body: [
      "NOTICE ISSUED BY REGISTRY, HIGH COURT OF KERALA AT ERNAKULAM",
      "Case Number: WP(C) 19482/2024",
      "Petitioner: Gopakumar Nambiar | Respondent: Kerala State Electricity Board & Anr.",
      "The above-captioned matter stands listed on the Cause List for 12 November 2026 before Division Bench 2A as Item No. 18.",
      "Advocate on Record for Petitioner: Adv. Meera Krishnan (Enrollment No. K/001429/2012).",
      "This is an automated eCourts registry alert under National Judicial Data Grid (NJDG) standards.",
    ],
    timestamp: "Yesterday",
    fullDate: "25 Oct 2026, 06:30 PM",
    folder: "inbox",
    category: "work",
    categoryLabel: "Court Registry Alert",
    categoryColor: "sky",
    isRead: true,
    isStarred: false,
  },
  {
    id: "mail-4",
    senderName: "Adv. Rajesh V. Varma",
    senderEmail: "rajesh.varma@ncltbar.org",
    senderAvatarText: "RV",
    recipientName: "Gopakumar Nambiar",
    recipientEmail: "gopakumar.nambiar@wakheel.in",
    matterTitle: "ARB/NCLT/KOCHI/2024/041 • Commercial Arbitration",
    subject: "Arbitration Statement of Claim Finalized for Execution",
    snippet:
      "The statement of claim for recovery of Rs. 48.6 Lakhs along with Section 17 interim relief application is drafted and ready for review...",
    body: [
      "Dear Gopakumar,",
      "I have finalized our Statement of Claim under Section 23 of the Arbitration and Conciliation Act, 1996 for recovery of Rs. 48.6 Lakhs against Coastal Logistics.",
      "We have also incorporated an urgent Section 17 application requesting the learned Arbitrator to direct the respondent to furnish bank guarantee security.",
      "The next sitting of the Arbitral Tribunal is confirmed for 18 November 2026 at 2:30 PM.",
      "Sincerely,\nAdv. Rajesh V. Varma\nCommercial & Corporate Counsel",
    ],
    timestamp: "24 Oct",
    fullDate: "24 Oct 2026, 02:15 PM",
    folder: "inbox",
    category: "commercial",
    categoryLabel: "Commercial Arbitration",
    categoryColor: "purple",
    isRead: true,
    isStarred: true,
    attachments: [
      {
        name: "Arbitration_Statement_of_Claim_Draft.docx",
        size: "1.20 MB",
        type: "docx",
        color: "amber",
      },
    ],
  },
  {
    id: "mail-5",
    senderName: "Adv. Priya Nair",
    senderEmail: "priya.nair@kollambar.org",
    senderAvatarText: "PN",
    recipientName: "Gopakumar Nambiar",
    recipientEmail: "gopakumar.nambiar@wakheel.in",
    matterTitle: "Section 138 NI Act • Statutory Notice",
    subject: "Statutory 15-Day Demand Notice Dispatched via Speed Post",
    snippet:
      "Statutory demand notice under Section 138(b) was successfully dispatched today via Speed Post with Acknowledgment Due (Consignment EK984712041IN)...",
    body: [
      "Dear Gopakumar,",
      "This is to formally confirm that the Statutory Legal Notice under Section 138(b) of the Negotiable Instruments Act has been dispatched today via Speed Post.",
      "Consignment Number: EK984712041IN.",
      "As per Supreme Court mandates (2024 INSC 782), the noticee has 15 clear days from the date of postal delivery to remit the cheque amount of Rs. 3,50,000/-.",
      "We will monitor the India Post delivery confirmation portal. If payment is defaulted on Day 16, we will lodge the criminal complaint before the JFCM.",
      "Best,\nAdv. Priya Nair",
    ],
    timestamp: "22 Oct",
    fullDate: "22 Oct 2026, 04:50 PM",
    folder: "inbox",
    category: "urgent",
    categoryLabel: "Statutory Notice",
    categoryColor: "zinc",
    isRead: true,
    isStarred: false,
    attachments: [
      {
        name: "India_Post_Speed_Post_Receipt_EK984712041IN.pdf",
        size: "820 KB",
        type: "pdf",
        color: "sky",
      },
    ],
  },
];

const INITIAL_CHAT_THREADS: ChatAdvocateThread[] = [
  {
    id: "adv-meera",
    type: "direct",
    name: "John Doe",
    chamber: "Chamber 402 • High Court of Kerala",
    court: "Manhattan",
    specialization: "Senior Counsel • Constitutional & Writs",
    matter: "WP(C) 19482/2024",
    avatarText: "JD",
    avatarBgColor: "bg-[#0066FF] text-white",
    online: true,
    lastMessage: "The quick brown fox jumps over the lazy dog.",
    lastTime: "Today",
    unreadCount: 1,
    messages: [
      {
        id: "m-1",
        sender: "advocate",
        text: "The quick brown fox jumps over the lazy dog.",
        timestamp: "Sunday",
        status: "read",
      },
      {
        id: "m-2",
        sender: "citizen",
        text: "The quick brown fox jumps over the lazy dog.",
        timestamp: "Today",
        status: "read",
      },
      {
        id: "m-3",
        sender: "advocate",
        text: "The quick brown fox jumps over the lazy dog.",
        timestamp: "Sunday",
        status: "read",
      },
      {
        id: "m-4",
        sender: "citizen",
        text: "The quick brown fox jumps over the lazy dog.",
        timestamp: "Today",
        status: "read",
      },
    ],
  },
  {
    id: "adv-sarah",
    type: "direct",
    name: "John Doe",
    chamber: "Chamber 304 • District Court Complex",
    court: "Manhattan",
    specialization: "Senior Property & Tenancy Advocate",
    matter: "OS 412/2023",
    avatarText: "JD",
    avatarBgColor: "bg-[#00875A] text-white",
    online: true,
    lastMessage: "The quick brown fox jumps over the lazy dog.",
    lastTime: "Sunday",
    unreadCount: 0,
    messages: [
      {
        id: "s-1",
        sender: "advocate",
        text: "The quick brown fox jumps over the lazy dog.",
        timestamp: "Sunday",
        status: "read",
      },
      {
        id: "s-2",
        sender: "citizen",
        text: "The quick brown fox jumps over the lazy dog.",
        timestamp: "Today",
        status: "read",
      },
    ],
  },
  {
    id: "adv-rajesh",
    type: "direct",
    name: "John Doe",
    chamber: "NCLT Bar Chambers • Commercial Tribunal",
    court: "Manhattan",
    specialization: "Commercial & Corporate Litigator",
    matter: "ARB/NCLT/KOCHI/2024/041",
    avatarText: "JD",
    avatarBgColor: "bg-[#00B8D9] text-white",
    online: true,
    lastMessage: "The quick brown fox jumps over the lazy dog.",
    lastTime: "Saturday",
    unreadCount: 0,
    messages: [
      {
        id: "r-1",
        sender: "advocate",
        text: "The quick brown fox jumps over the lazy dog.",
        timestamp: "Sunday",
        status: "read",
      },
      {
        id: "r-2",
        sender: "citizen",
        text: "The quick brown fox jumps over the lazy dog.",
        timestamp: "Today",
        status: "read",
      },
    ],
  },
  {
    id: "adv-priya",
    type: "direct",
    name: "John Doe",
    chamber: "Chamber 12 • Judicial First Class Court",
    court: "Manhattan",
    specialization: "Civil Rights & Statutory Notices",
    matter: "Section 138 NI Act Notice",
    avatarText: "JD",
    avatarBgColor: "bg-[#FFAB00] text-white",
    online: true,
    lastMessage: "The quick brown fox jumps over the lazy dog.",
    lastTime: "Friday",
    unreadCount: 0,
    messages: [
      {
        id: "p-1",
        sender: "advocate",
        text: "The quick brown fox jumps over the lazy dog.",
        timestamp: "Sunday",
        status: "read",
      },
      {
        id: "p-2",
        sender: "citizen",
        text: "The quick brown fox jumps over the lazy dog.",
        timestamp: "Today",
        status: "read",
      },
    ],
  },
  {
    id: "group-hc",
    type: "group",
    name: "High Court Bench 2A Counsel Team",
    chamber: "WP(C) 19482/2024 Legal Defense",
    court: "High Court of Kerala",
    specialization: "Writ Litigation Panel",
    matter: "WP(C) 19482/2024",
    avatarText: "HC",
    avatarBgColor: "bg-black text-white dark:bg-white dark:text-black",
    online: true,
    lastMessage: "Adv. Anand: Registry motion slip submitted for tomorrow.",
    lastTime: "Today",
    unreadCount: 2,
    participants: ["Adv. Meera Krishnan", "Adv. Anand (Junior)", "You"],
    messages: [
      {
        id: "g-1",
        sender: "advocate",
        text: "Division Bench 2A has listed our motion item for first hour call.",
        timestamp: "Today",
        status: "read",
      },
      {
        id: "g-2",
        sender: "citizen",
        text: "Thank you counsel, will the certified order copy be presented?",
        timestamp: "Today",
        status: "read",
      },
      {
        id: "g-3",
        sender: "advocate",
        text: "Adv. Anand: Registry motion slip submitted for tomorrow.",
        timestamp: "Today",
        status: "read",
      },
    ],
  },
  {
    id: "group-property",
    type: "group",
    name: "Property Boundary & Title Panel",
    chamber: "OS 412/2023 Survey Execution",
    court: "Principal Munsiff Court",
    specialization: "Civil Commission Panel",
    matter: "OS 412/2023",
    avatarText: "PB",
    avatarBgColor: "bg-[#6B1728] text-white",
    online: true,
    lastMessage: "Surveyor Raman: Final sketch uploaded to vault.",
    lastTime: "Sunday",
    unreadCount: 0,
    participants: ["Adv. Sarah Jenkins", "Surveyor Raman", "You"],
    messages: [
      {
        id: "gp-1",
        sender: "advocate",
        text: "Survey report uploaded to the shared documents vault.",
        timestamp: "Sunday",
        status: "read",
      },
      {
        id: "gp-2",
        sender: "citizen",
        text: "Received and reviewed. The encroachment measurements are clear.",
        timestamp: "Sunday",
        status: "read",
      },
    ],
  },
  {
    id: "group-corporate",
    type: "group",
    name: "Commercial Arbitral Taskforce",
    chamber: "ARB/NCLT/KOCHI/2024/041",
    court: "NCLT Kochi Bench",
    specialization: "Corporate Insolvency Taskforce",
    matter: "ARB/NCLT/KOCHI/2024/041",
    avatarText: "AT",
    avatarBgColor: "bg-zinc-800 text-white",
    online: false,
    lastMessage: "Statement of claim accepted by sole arbitrator.",
    lastTime: "Friday",
    unreadCount: 0,
    participants: ["Adv. Rajesh V. Varma", "Chartered Accountant Vinod", "You"],
    messages: [
      {
        id: "gc-1",
        sender: "advocate",
        text: "Arbitral Tribunal has admitted our rejoinder submissions.",
        timestamp: "Friday",
        status: "read",
      },
    ],
  },
];

const INITIAL_NOTIFICATIONS: LegalNotificationItem[] = [
  {
    id: "notif-1",
    title: "Interim Stay Order Certified Copy Issued",
    category: "orders",
    categoryLabel: "High Court Order",
    summary: "Hon'ble Division Bench 2A has issued the certified true copy of today's Daily Order in WP(C) 19482/2024. Stay extended until 12 Nov 2026.",
    timestamp: "12 min ago",
    caseRef: "WP(C) 19482/2024",
    isRead: false,
    priority: "high",
    actionLabel: "View Order PDF",
  },
  {
    id: "notif-2",
    title: "Urgent Causelist Listing for Tomorrow",
    category: "hearings",
    categoryLabel: "Court Hearing",
    summary: "Item No. 42 scheduled before Hon'ble Justice P. V. Kunhikrishnan at 10:30 AM. Lead appearance confirmed.",
    timestamp: "45 min ago",
    caseRef: "WP(C) 19482/2024",
    isRead: false,
    priority: "high",
    actionLabel: "View Causelist Item",
  },
  {
    id: "notif-3",
    title: "Speed Post Statutory Notice Delivered",
    category: "notices",
    categoryLabel: "India Post Delivery",
    summary: "Speed Post consignment EK984712041IN successfully served on respondent. 15-day statutory cure clock commenced under Section 138 NI Act.",
    timestamp: "2 hours ago",
    caseRef: "Sec. 138 NI Act Notice",
    isRead: false,
    priority: "normal",
    actionLabel: "Track Speed Post",
  },
  {
    id: "notif-4",
    title: "Advocate Commissioner Survey Report Uploaded",
    category: "filings",
    categoryLabel: "Survey Filing",
    summary: "Court Advocate Commissioner filed the physical boundary measurement report confirming 1.8m encroachment into west plot boundary.",
    timestamp: "Yesterday",
    caseRef: "OS 412/2023",
    isRead: true,
    priority: "normal",
    actionLabel: "Examine Report",
  },
  {
    id: "notif-5",
    title: "Pre-Motion Virtual Chamber Consultation Confirmed",
    category: "hearings",
    categoryLabel: "Chamber Meet",
    summary: "Virtual Chamber session booked with Adv. Sarah Jenkins for 29 Oct at 03:00 PM. Video link secured under Section 126 privilege.",
    timestamp: "2 days ago",
    caseRef: "OS 412/2023",
    isRead: true,
    priority: "normal",
    actionLabel: "Join Chamber Room",
  },
  {
    id: "notif-6",
    title: "Arbitral Tribunal Statement of Claim Received",
    category: "filings",
    categoryLabel: "Tribunal Registry",
    summary: "Claimant submitted 3 volumes of audited ledgers in ARB/NCLT/KOCHI/2024/041. Rejoinder defense preparation underway.",
    timestamp: "3 days ago",
    caseRef: "ARB/NCLT/KOCHI/2024/041",
    isRead: true,
    priority: "normal",
    actionLabel: "Review Documents",
  },
];

interface SecureInboxViewProps {
  token?: string;
  initialMode?: InboxMode;
  onOpenConsultationModal?: () => void;
}

export function SecureInboxView({
  initialMode = "mails",
  onOpenConsultationModal,
}: SecureInboxViewProps) {
  const [inboxMode, setInboxMode] = useState<InboxMode>(initialMode);

  // Mails State
  const [emails, setEmails] = useState<LegalEmailItem[]>(INITIAL_LEGAL_EMAILS);
  const [selectedFolder, setSelectedFolder] = useState<MailFolder>("inbox");
  const [selectedCategory, setSelectedCategory] = useState<MailCategory>("all");
  const [mailSearchQuery, setMailSearchQuery] = useState<string>("");
  const [selectedEmailId, setSelectedEmailId] = useState<string>("mail-1");
  const [composeModalOpen, setComposeModalOpen] = useState<boolean>(false);
  const [replyInput, setReplyInput] = useState<string>("");
  const [replySuccess, setReplySuccess] = useState<boolean>(false);

  // Compose State
  const [composeTo, setComposeTo] = useState<string>("Adv. Meera Krishnan");
  const [composeSubject, setComposeSubject] = useState<string>("");
  const [composeBody, setComposeBody] = useState<string>("");

  // Instant Messages State
  const [chatThreads, setChatThreads] = useState<ChatAdvocateThread[]>(INITIAL_CHAT_THREADS);
  const [chatSegment, setChatSegment] = useState<"direct" | "group">("direct");
  const [selectedChatId, setSelectedChatId] = useState<string>("adv-meera");
  const [chatInputText, setChatInputText] = useState<string>("");
  const [chatSearchQuery, setChatSearchQuery] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<LegalNotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [selectedNotifFilter, setSelectedNotifFilter] = useState<string>("all");

  // Auto-scroll chat
  useEffect(() => {
    if (inboxMode === "messages") {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [inboxMode, selectedChatId, chatThreads]);

  // Voice recording simulation
  const toggleRecording = () => {
    if (isRecording) {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setIsRecording(false);
      setChatInputText(
        (prev) =>
          (prev ? prev + " " : "") +
          "[Voice Note]: Adv. Meera, can you please verify if the court ordered an advocate commissioner for the site inspection?"
      );
      setRecordingSeconds(0);
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    }
  };

  // Filtered Mails
  const filteredEmails = useMemo(() => {
    return emails.filter((mail) => {
      const matchFolder =
        selectedFolder === "starred"
          ? mail.isStarred
          : mail.folder === selectedFolder;

      const matchCategory =
        selectedCategory === "all" || mail.category === selectedCategory;

      const q = mailSearchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        mail.senderName.toLowerCase().includes(q) ||
        mail.subject.toLowerCase().includes(q) ||
        mail.matterTitle.toLowerCase().includes(q) ||
        mail.snippet.toLowerCase().includes(q);

      return matchFolder && matchCategory && matchSearch;
    });
  }, [emails, selectedFolder, selectedCategory, mailSearchQuery]);

  const activeEmail =
    emails.find((e) => e.id === selectedEmailId) || filteredEmails[0] || emails[0];

  const filteredChatThreads = useMemo(() => {
    const segmentFiltered = chatThreads.filter(
      (c) => (c.type || "direct") === chatSegment
    );
    const q = chatSearchQuery.toLowerCase().trim();
    if (!q) return segmentFiltered;
    return segmentFiltered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.matter.toLowerCase().includes(q) ||
        c.specialization.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [chatThreads, chatSegment, chatSearchQuery]);

  const activeChatThread =
    chatThreads.find((c) => c.id === selectedChatId) ||
    filteredChatThreads[0] ||
    chatThreads[0];

  // Toggle star
  const handleToggleStar = (emailId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEmails((prev) =>
      prev.map((mail) =>
        mail.id === emailId ? { ...mail, isStarred: !mail.isStarred } : mail
      )
    );
  };

  // Delete / Trash email
  const handleDeleteEmail = (emailId: string) => {
    setEmails((prev) =>
      prev.map((mail) =>
        mail.id === emailId ? { ...mail, folder: "trash" as MailFolder } : mail
      )
    );
  };

  // Send quick reply in Mail
  const handleSendMailReply = () => {
    if (!replyInput.trim()) return;
    setReplySuccess(true);
    setReplyInput("");
    setTimeout(() => setReplySuccess(false), 2500);
  };

  // Send new compose mail
  const handleSendCompose = () => {
    if (!composeSubject.trim() || !composeBody.trim()) return;

    const newMail: LegalEmailItem = {
      id: "mail-" + Date.now(),
      senderName: "Gopakumar Nambiar",
      senderEmail: "gopakumar.nambiar@wakheel.in",
      senderAvatarText: "GO",
      recipientName: composeTo,
      recipientEmail: "counsel@wakheel.in",
      matterTitle: "WP(C) 19482/2024 • High Court of Kerala",
      subject: composeSubject,
      snippet: composeBody.slice(0, 100),
      body: [composeBody],
      timestamp: "Just now",
      fullDate: new Date().toLocaleString(),
      folder: "sent",
      category: "work",
      categoryLabel: "Client Instruction",
      categoryColor: "sky",
      isRead: true,
      isStarred: false,
    };

    setEmails((prev) => [newMail, ...prev]);
    setComposeModalOpen(false);
    setComposeSubject("");
    setComposeBody("");
  };

  // Send Instant Chat Message
  const handleSendChatMessage = () => {
    if (!chatInputText.trim()) return;

    const newMsg: ChatMessage = {
      id: "c-msg-" + Date.now(),
      sender: "citizen",
      text: chatInputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };

    setChatThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === selectedChatId) {
          return {
            ...thread,
            lastMessage: newMsg.text,
            lastTime: newMsg.timestamp,
            messages: [...thread.messages, newMsg],
          };
        }
        return thread;
      })
    );

    const sentText = chatInputText;
    setChatInputText("");

    // Simulate counsel response after 1.5s
    setTimeout(() => {
      const advocateReply: ChatMessage = {
        id: "c-adv-" + Date.now(),
        sender: "advocate",
        text: `Received: "${sentText.slice(0, 45)}...". I am reviewing this with my junior associates and will prepare the required note for court.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "read",
      };

      setChatThreads((prev) =>
        prev.map((thread) => {
          if (thread.id === selectedChatId) {
            return {
              ...thread,
              lastMessage: advocateReply.text,
              lastTime: advocateReply.timestamp,
              messages: [...thread.messages, advocateReply],
            };
          }
          return thread;
        })
      );
    }, 1500);
  };

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-4">
      {/* =========================================================================
          TOP ACTION BAR & MODE TOGGLE (Mails vs Instant Messages)
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          {/* 3 Header Tabs: Mail box | Instant Message | Notifications */}
          <div className="p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setInboxMode("mails")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                inboxMode === "mails"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-black"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Mail box</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                inboxMode === "mails"
                  ? "bg-white text-black dark:bg-black dark:text-white"
                  : "bg-black text-white dark:bg-white dark:text-black"
              }`}>
                {emails.filter((e) => !e.isRead).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setInboxMode("messages")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                inboxMode === "messages"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-black"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Instant Message</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            <button
              type="button"
              onClick={() => setInboxMode("notifications")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                inboxMode === "notifications"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-black"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#6B1728] text-white">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right Privilege Seal */}
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1.5 rounded-full text-[11px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white inline-flex items-center gap-1.5 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sec. 126 Privileged &bull; Encrypted</span>
          </span>

          {onOpenConsultationModal && (
            <button
              type="button"
              onClick={onOpenConsultationModal}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black font-bold text-xs text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Video className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chamber Meet</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODE 1: MAILS (Exact 3-Column Layout Matching Image 2)
      ========================================================================= */}
      {inboxMode === "mails" && (
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[700px] rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-xs overflow-hidden">
          {/* -------------------------------------------------------------
              COLUMN 1: Mini Sidebar / Folders & Labels (~2-3 Cols)
          ------------------------------------------------------------- */}
          <div className="md:col-span-3 lg:col-span-2 border-r border-zinc-200 dark:border-zinc-800 p-4 space-y-6 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col justify-between">
            <div className="space-y-6">
              {/* New Message Button matching Image 2 */}
              <button
                type="button"
                onClick={() => setComposeModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Message</span>
              </button>

              {/* Folders List */}
              <div className="space-y-1 text-xs">
                {[
                  { id: "inbox" as MailFolder, label: "Inbox", icon: InboxIcon, badge: 8, badgeColor: "bg-black text-white dark:bg-white dark:text-black" },
                  { id: "starred" as MailFolder, label: "Starred", icon: Star },
                  { id: "drafts" as MailFolder, label: "Drafts", icon: FileEdit, badge: 4, badgeColor: "bg-amber-500 text-white" },
                  { id: "sent" as MailFolder, label: "Sent", icon: Send },
                  { id: "archive" as MailFolder, label: "Archive", icon: Archive },
                  { id: "trash" as MailFolder, label: "Trash", icon: Trash2 },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = selectedFolder === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedFolder(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-all cursor-pointer ${
                        isActive
                          ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Categories / Tags Section matching Image 2 */}
              <div className="space-y-2 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block px-2">
                  Practice Tags
                </span>
                <div className="space-y-1">
                  {[
                    { id: "all" as MailCategory, label: "All Mails", dotColor: "bg-zinc-400" },
                    { id: "work" as MailCategory, label: "High Court", dotColor: "bg-sky-500 ring-2 ring-sky-300 dark:ring-sky-900" },
                    { id: "property" as MailCategory, label: "Civil & Land", dotColor: "bg-amber-500 ring-2 ring-amber-300 dark:ring-amber-900" },
                    { id: "commercial" as MailCategory, label: "Commercial", dotColor: "bg-cyan-500 ring-2 ring-cyan-300 dark:ring-cyan-900" },
                    { id: "urgent" as MailCategory, label: "Orders / Notices", dotColor: "bg-black dark:bg-white ring-2 ring-zinc-300 dark:ring-zinc-700" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        selectedCategory === cat.id
                          ? "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-bold"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${cat.dotColor} shrink-0`} />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Status */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
              <span>Encrypted Storage</span>
              <span>100% Secure</span>
            </div>
          </div>

          {/* -------------------------------------------------------------
              COLUMN 2: Message Threads List (~4 Cols)
          ------------------------------------------------------------- */}
          <div className="md:col-span-4 lg:col-span-4 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-black">
            {/* Search Bar at Top of Thread List matching Image 2 */}
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={mailSearchQuery}
                  onChange={(e) => setMailSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Cards List matching Image 2 with Right-edge Color Strip */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
              {filteredEmails.map((mail) => {
                const isSelected = activeEmail?.id === mail.id;

                // Color accent strip matching Image 2
                const stripColor =
                  mail.categoryColor === "zinc"
                    ? "bg-black dark:bg-white"
                    : mail.categoryColor === "amber"
                    ? "bg-amber-500"
                    : mail.categoryColor === "sky"
                    ? "bg-sky-500"
                    : "bg-cyan-500";

                return (
                  <div
                    key={mail.id}
                    onClick={() => {
                      setSelectedEmailId(mail.id);
                      setEmails((prev) =>
                        prev.map((m) => (m.id === mail.id ? { ...m, isRead: true } : m))
                      );
                    }}
                    className={`relative p-4 transition-all cursor-pointer flex gap-3 group ${
                      isSelected
                        ? "bg-zinc-50 dark:bg-zinc-900/70"
                        : "hover:bg-zinc-50/70 dark:hover:bg-zinc-950/70"
                    }`}
                  >
                    {/* Vertical Right Accent Strip matching Image 2 */}
                    <span
                      className={`absolute right-0 top-0 bottom-0 w-1.5 ${stripColor} ${
                        isSelected ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                      }`}
                    />

                    {/* Sender Avatar */}
                    <div className="w-9 h-9 rounded-full bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      {mail.senderAvatarText}
                    </div>

                    {/* Card Content */}
                    <div className="flex-1 min-w-0 pr-3 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-black dark:text-white truncate">
                          {mail.subject}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                          {mail.timestamp}
                        </span>
                      </div>

                      <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block truncate">
                        {mail.senderName}
                      </span>

                      <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                        {mail.snippet}
                      </p>

                      {/* Attachments chip if any */}
                      {mail.attachments && mail.attachments.length > 0 && (
                        <div className="pt-1 flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                          <Paperclip className="w-3 h-3 text-sky-500" />
                          <span>{mail.attachments.length} attached file(s)</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredEmails.length === 0 && (
                <div className="p-8 text-center text-xs text-zinc-500">
                  No mails match your search in this folder.
                </div>
              )}
            </div>
          </div>

          {/* -------------------------------------------------------------
              COLUMN 3: Reading Pane (Flex-1 / ~6 Cols)
          ------------------------------------------------------------- */}
          <div className="md:col-span-5 lg:col-span-6 flex flex-col justify-between bg-white dark:bg-black">
            {activeEmail ? (
              <div className="flex flex-col h-full">
                {/* Top Toolbar matching Image 2 */}
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between gap-2">
                  {/* Action Icons */}
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <button
                      type="button"
                      onClick={() => handleToggleStar(activeEmail.id)}
                      title="Star email"
                      className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          activeEmail.isStarred
                            ? "fill-amber-400 text-amber-400"
                            : "text-zinc-400"
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteEmail(activeEmail.id)}
                      title="Delete email"
                      className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      title="Archive"
                      className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Archive className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      title="Move to Folder"
                      className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Folder className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      title="Apply Tag"
                      className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Tag className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Navigation / Count matching Image 2 */}
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                    <span>
                      {emails.findIndex((e) => e.id === activeEmail.id) + 1} of {emails.length}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          const idx = emails.findIndex((e) => e.id === activeEmail.id);
                          if (idx > 0) setSelectedEmailId(emails[idx - 1].id);
                        }}
                        className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const idx = emails.findIndex((e) => e.id === activeEmail.id);
                          if (idx < emails.length - 1) setSelectedEmailId(emails[idx + 1].id);
                        }}
                        className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email Body Scroll Container */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                  {/* Sender & Recipient Bar */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-900">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-black dark:text-white">
                          {activeEmail.senderName}
                        </span>
                        <span className="text-xs text-zinc-400">
                          to {activeEmail.recipientName}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400 block">
                        Matter: {activeEmail.matterTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono text-zinc-400">
                        {activeEmail.fullDate}
                      </span>
                      <div className="w-9 h-9 rounded-full bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs flex items-center justify-center shadow-2xs">
                        {activeEmail.senderAvatarText}
                      </div>
                    </div>
                  </div>

                  {/* Big Subject Title matching Image 2 */}
                  <h3 className="text-xl sm:text-2xl font-black text-black dark:text-white tracking-tight leading-snug">
                    {activeEmail.subject}
                  </h3>

                  {/* Body Paragraphs */}
                  <div className="space-y-3.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                    {activeEmail.body.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  {/* Attachment Cards matching Image 2 (Blue & Orange Chips) */}
                  {activeEmail.attachments && activeEmail.attachments.length > 0 && (
                    <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                        Verified Legal Attachments:
                      </span>
                      <div className="flex flex-wrap gap-3">
                        {activeEmail.attachments.map((att, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-2xl border flex items-center gap-3 shadow-2xs transition-all ${
                              att.color === "sky"
                                ? "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200"
                                : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                            }`}
                          >
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                att.color === "sky"
                                  ? "bg-sky-500 text-white"
                                  : "bg-amber-500 text-white"
                              }`}
                            >
                              <Paperclip className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-bold text-xs block truncate max-w-[200px]">
                                {att.name}
                              </span>
                              <span className="text-[10px] font-mono opacity-70 block">
                                {att.size}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => alert(`Downloading ${att.name}...`)}
                              className="p-2 rounded-lg bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black transition-colors ml-1 cursor-pointer"
                              title="Download attachment"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Reply Box inside reading pane */}
                  <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 space-y-3">
                    <span className="font-bold text-xs text-black dark:text-white block">
                      Quick Counsel Response:
                    </span>
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <textarea
                        rows={3}
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        placeholder={`Reply directly to ${activeEmail.senderName}...`}
                        className="w-full bg-transparent text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none resize-none leading-relaxed"
                      />
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
                        <span className="text-[10px] font-mono text-zinc-400">
                          Delivered via Privileged Attorney-Client Channel
                        </span>
                        <div className="flex items-center gap-2">
                          {replySuccess && (
                            <span className="text-xs text-emerald-500 font-bold flex items-center gap-1 font-mono">
                              <Check className="w-3.5 h-3.5" /> Transmitted
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={handleSendMailReply}
                            disabled={!replyInput.trim()}
                            className="px-4 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs disabled:opacity-40 cursor-pointer hover:opacity-90 flex items-center gap-1.5"
                          >
                            <Send className="w-3 h-3" />
                            <span>Reply</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Dock matching Image 2 */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStar(activeEmail.id)}
                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    title="Star"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyInput(`Regarding "${activeEmail.subject}": `);
                    }}
                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    title="Reply"
                  >
                    <CornerUpLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Forward dialog opened.")}
                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    title="Forward"
                  >
                    <CornerUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center text-xs text-zinc-400">
                Select an email to view its privileged contents.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODE 2: INSTANT MESSAGES (Exact Match to Image 1 Right Side Sketch)
      ========================================================================= */}
      {/* =========================================================================
          MODE 2: INSTANT MESSAGES (Exact Match to User Uploaded Image)
      ========================================================================= */}
      {inboxMode === "messages" && (
        <div className="flex flex-col md:flex-row min-h-[700px] rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-xs overflow-hidden">
          {/* -------------------------------------------------------------
              COLUMN 1: Discussions / Contacts Column (Matching User Image)
          ------------------------------------------------------------- */}
          <div className="w-full md:w-80 lg:w-84 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex flex-col shrink-0">
            <div className="p-4 space-y-3.5 border-b border-zinc-100 dark:border-zinc-900">
              {/* Search Bar matching screenshot */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-transparent dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none"
                />
              </div>

              {/* Segmented Pill: Direct | Group */}
              <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setChatSegment("direct")}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                    chatSegment === "direct"
                      ? "bg-white dark:bg-black text-[#0066FF] dark:text-white font-bold shadow-xs"
                      : "text-zinc-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  Direct
                </button>
                <button
                  type="button"
                  onClick={() => setChatSegment("group")}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                    chatSegment === "group"
                      ? "bg-white dark:bg-black text-[#0066FF] dark:text-white font-bold shadow-xs"
                      : "text-zinc-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  Group
                </button>
              </div>

              {/* Discussions Header with circular edit/pen icon */}
              <div className="flex items-center justify-between pt-1">
                <h3 className="font-bold text-base text-black dark:text-white">Discussions</h3>
                <button
                  type="button"
                  onClick={() => alert("New Discussion")}
                  className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="New Discussion"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Discussions List matching screenshot */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900 px-3 py-2">
              {filteredChatThreads.map((thread) => {
                const isSelected = activeChatThread.id === thread.id;
                return (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedChatId(thread.id)}
                    className={`py-3 px-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? "bg-zinc-50 dark:bg-zinc-900/60"
                        : "hover:bg-zinc-50/70 dark:hover:bg-zinc-900/30"
                    }`}
                  >
                    {/* Circle Avatar with online status dot at corner */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full ${
                          thread.avatarBgColor || "bg-[#0066FF] text-white"
                        } font-bold text-xs flex items-center justify-center shadow-2xs`}
                      >
                        {thread.avatarText}
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-black" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-xs text-black dark:text-white truncate">
                          {thread.name}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-normal shrink-0">
                          {thread.lastTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {thread.lastMessage}
                      </p>
                    </div>
                  </div>
                );
              })}

              {filteredChatThreads.length === 0 && (
                <div className="p-8 text-center text-xs text-zinc-400">
                  No discussions found matching &quot;{chatSearchQuery}&quot;.
                </div>
              )}
            </div>
          </div>

          {/* -------------------------------------------------------------
              COLUMN 2: Right Main Chat Conversation Pane (Matching User Image)
          ------------------------------------------------------------- */}
          <div className="flex-1 flex flex-col justify-between bg-white dark:bg-black min-w-0">
            {/* Header: Avatar, Name, Manhattan, Video, Phone, Users */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-black">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#0066FF] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                  JD
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-black dark:text-white truncate">
                    {activeChatThread.name}
                  </h4>
                  <span className="text-xs text-zinc-400 truncate block">
                    {activeChatThread.court || "Manhattan"}
                  </span>
                </div>
              </div>

              {/* Action Icons matching screenshot: Video, Phone, Users */}
              <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                {onOpenConsultationModal && (
                  <button
                    type="button"
                    onClick={onOpenConsultationModal}
                    className="p-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    title="Video Call"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => alert(`Placing encrypted call to ${activeChatThread.name}`)}
                  className="p-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  title="Voice Call"
                >
                  <Phone className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => alert(`Participant Info: ${activeChatThread.name}`)}
                  className="p-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  title="Members"
                >
                  <Users className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Message Stream matching screenshot layout */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {activeChatThread.messages.map((msg) => {
                const isCitizen = msg.sender === "citizen";
                return (
                  <div key={msg.id} className="space-y-1">
                    {/* Date / Day Indicator matching screenshot */}
                    <div
                      className={`flex items-center gap-2 text-[11px] text-zinc-400 font-normal px-2 ${
                        isCitizen ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`flex gap-3 items-end ${
                        isCitizen ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Left incoming avatar matching screenshot */}
                      {!isCitizen && (
                        <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs mb-1">
                          JD
                        </div>
                      )}

                      {/* Chat bubble: Soft gray for incoming, Burgundy (#6B1728) for outgoing */}
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 text-xs shadow-2xs leading-relaxed ${
                          isCitizen
                            ? "bg-[#6B1728] text-white font-medium"
                            : "bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-transparent dark:border-zinc-800/80"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>

                      {/* Right outgoing avatar matching screenshot */}
                      {isCitizen && (
                        <div className="w-8 h-8 rounded-full bg-[#00B8D9] text-white font-bold text-[11px] flex items-center justify-center shrink-0 mb-1 shadow-2xs">
                          JD
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Bottom Input Container matching screenshot */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
              <div className="rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-transparent dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setChatInputText((prev) => prev + " ⚖️")}
                  className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  title="Emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  placeholder="Type message..."
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendChatMessage();
                  }}
                  className="flex-1 bg-transparent text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={handleSendChatMessage}
                  disabled={!chatInputText.trim()}
                  className="text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODE 3: NOTIFICATIONS CENTER (Dedicated High-Priority Legal Alerts)
      ========================================================================= */}
      {inboxMode === "notifications" && (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-xs p-6 space-y-6">
          {/* Header with Title and Filter pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#6B1728] dark:text-[#F3A5B5]" />
                <h2 className="text-lg font-black text-black dark:text-white">
                  Court &amp; Legal Notifications
                </h2>
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#6B1728] text-white">
                    {notifications.filter((n) => !n.isRead).length} Unread
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Real-time alerts from High Court registries, causelists, Speed Post tracking, and chamber schedules.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                }}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-black dark:text-white cursor-pointer transition-colors"
              >
                Mark all as read
              </button>
              <button
                type="button"
                onClick={() => setNotifications([])}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Alerts", count: notifications.length },
              { id: "orders", label: "Court Orders", count: notifications.filter((n) => n.category === "orders").length },
              { id: "hearings", label: "Hearing Dates", count: notifications.filter((n) => n.category === "hearings").length },
              { id: "notices", label: "Statutory Notices", count: notifications.filter((n) => n.category === "notices").length },
              { id: "filings", label: "Registry Filings", count: notifications.filter((n) => n.category === "filings").length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedNotifFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  selectedNotifFilter === tab.id
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-70 font-mono">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {notifications
              .filter((n) => selectedNotifFilter === "all" || n.category === selectedNotifFilter)
              .map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    !notif.isRead
                      ? "bg-zinc-50/80 dark:bg-zinc-900/60 border-l-4 border-l-[#6B1728] border-zinc-200 dark:border-zinc-800"
                      : "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 opacity-80"
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          notif.priority === "high"
                            ? "bg-[#6B1728] text-white"
                            : "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white"
                        }`}
                      >
                        {notif.categoryLabel}
                      </span>

                      {notif.caseRef && (
                        <span className="text-[11px] font-mono font-bold text-zinc-500">
                          {notif.caseRef}
                        </span>
                      )}

                      <span className="text-[10px] text-zinc-400 font-mono">
                        &bull; {notif.timestamp}
                      </span>

                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#6B1728]" />
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-black dark:text-white">
                      {notif.title}
                    </h4>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {notif.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {notif.actionLabel && (
                      <button
                        type="button"
                        onClick={() => alert(`Action launched: ${notif.actionLabel}`)}
                        className="px-3.5 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs cursor-pointer transition-colors shadow-2xs"
                      >
                        {notif.actionLabel}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setNotifications((prev) =>
                          prev.map((n) => (n.id === notif.id ? { ...n, isRead: !n.isRead } : n))
                        );
                      }}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                      title={notif.isRead ? "Mark unread" : "Mark read"}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
                      }}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

            {notifications.filter((n) => selectedNotifFilter === "all" || n.category === selectedNotifFilter).length === 0 && (
              <div className="p-12 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                No notifications found in this category.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Email Modal */}
      {composeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-black dark:text-white" />
                <h3 className="font-black text-base text-black dark:text-white">
                  Compose Legal Correspondence
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setComposeModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-500 block">Recipient Counsel:</label>
                <select
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none"
                >
                  <option value="Adv. Meera Krishnan">Adv. Meera Krishnan (High Court Writs)</option>
                  <option value="Adv. Sarah Jenkins">Adv. Sarah Jenkins (Civil &amp; Property)</option>
                  <option value="Adv. Rajesh V. Varma">Adv. Rajesh V. Varma (Commercial NCLT)</option>
                  <option value="Adv. Priya Nair">Adv. Priya Nair (Section 138 Notice)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-500 block">Subject Line:</label>
                <input
                  type="text"
                  placeholder="e.g. Urgent Instructions Regarding Transmission Line Realignment Survey"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-500 block">Confidential Instructions / Message:</label>
                <textarea
                  rows={6}
                  placeholder="Draft your detailed legal instruction, query, or factual submission..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-black dark:text-white focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-400">
                Protected by Advocate-Client Privilege
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setComposeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendCompose}
                  disabled={!composeSubject.trim() || !composeBody.trim()}
                  className="px-5 py-2 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-40 font-bold text-xs text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black cursor-pointer transition-all shadow-xs"
                >
                  Transmit Mail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
