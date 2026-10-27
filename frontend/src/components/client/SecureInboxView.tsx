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
} from "lucide-react";

export type InboxMode = "mails" | "messages";
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
  name: string;
  chamber: string;
  court: string;
  specialization: string;
  matter: string;
  avatarText: string;
  online: boolean;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  messages: ChatMessage[];
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
    name: "Adv. Meera Krishnan",
    chamber: "Chamber 402, High Court Road, Kochi",
    court: "High Court of Kerala",
    specialization: "Senior Counsel • Constitutional & Writs",
    matter: "WP(C) 19482/2024",
    avatarText: "MK",
    online: true,
    lastMessage: "Interim stay safely extended until 12 Nov. Stay calm.",
    lastTime: "10:32 AM",
    unreadCount: 1,
    messages: [
      {
        id: "m-1",
        sender: "citizen",
        text: "Namaskaram Adv. Meera, is our writ petition listed on the motion board today?",
        timestamp: "09:45 AM",
        status: "read",
      },
      {
        id: "m-2",
        sender: "advocate",
        text: "Yes Gopakumar, Item No. 18 before Division Bench 2A. I am in Court Hall 2A right now.",
        timestamp: "09:52 AM",
        status: "read",
      },
      {
        id: "m-3",
        sender: "citizen",
        text: "Did the KSEB engineers submit their counter-affidavit?",
        timestamp: "10:10 AM",
        status: "read",
      },
      {
        id: "m-4",
        sender: "advocate",
        text: "They attempted to tender an affidavit, but the Bench sternly rebuked them for violating Section 16 notice norms. Interim stay is safely extended until 12 Nov 2026. Certified copy sent to your mail.",
        timestamp: "10:32 AM",
        status: "read",
        attachments: [
          { name: "Daily_Order_Interim_Stay_Bench_2A.pdf", size: "1.5 MB" },
        ],
      },
    ],
  },
  {
    id: "adv-sarah",
    name: "Adv. Sarah Jenkins",
    chamber: "Chamber 304, District Court Complex, Ernakulam",
    court: "Principal Munsiff Court",
    specialization: "Senior Property & Tenancy Advocate",
    matter: "OS 412/2023",
    avatarText: "SJ",
    online: false,
    lastMessage: "The survey report is completely in our favor.",
    lastTime: "Yesterday",
    unreadCount: 0,
    messages: [
      {
        id: "s-1",
        sender: "citizen",
        text: "Hello Adv. Sarah, did the Advocate Commissioner inspect the western boundary wall?",
        timestamp: "Yesterday, 03:20 PM",
        status: "read",
      },
      {
        id: "s-2",
        sender: "advocate",
        text: "Yes, the survey report confirms an encroachment of 1.8 meters into your plot. The report is completely in our favor for the trial hearing on 04 Nov.",
        timestamp: "Yesterday, 04:15 PM",
        status: "read",
      },
    ],
  },
  {
    id: "adv-rajesh",
    name: "Adv. Rajesh V. Varma",
    chamber: "NCLT Bar Association Chambers, Marine Drive",
    court: "NCLT Kochi & Arbitral Tribunal",
    specialization: "Commercial & Corporate Litigator",
    matter: "ARB/NCLT/KOCHI/2024/041",
    avatarText: "RV",
    online: true,
    lastMessage: "Arbitral hearing confirmed for 18 Nov at 2:30 PM.",
    lastTime: "24 Oct",
    unreadCount: 0,
    messages: [
      {
        id: "r-1",
        sender: "citizen",
        text: "Adv. Rajesh, is the NCLT arbitral hearing confirmed for next month?",
        timestamp: "24 Oct, 11:15 AM",
        status: "read",
      },
      {
        id: "r-2",
        sender: "advocate",
        text: "Yes, Arbitral hearing confirmed for 18 Nov at 2:30 PM. Please have the original ledger statements ready.",
        timestamp: "24 Oct, 02:15 PM",
        status: "read",
      },
    ],
  },
  {
    id: "adv-priya",
    name: "Adv. Priya Nair",
    chamber: "Chamber 12, District Bar Council, Kollam",
    court: "Judicial First Class Magistrate Court",
    specialization: "Civil Rights & Statutory Notices",
    matter: "Section 138 NI Act Notice",
    avatarText: "PN",
    online: false,
    lastMessage: "Notice delivered. 15-day statutory clock is running.",
    lastTime: "22 Oct",
    unreadCount: 0,
    messages: [
      {
        id: "p-1",
        sender: "advocate",
        text: "Statutory demand notice under Section 138 has been dispatched via Speed Post. Notice delivered. 15-day statutory clock is running.",
        timestamp: "22 Oct, 04:50 PM",
        status: "read",
      },
    ],
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
  const [selectedChatId, setSelectedChatId] = useState<string>("adv-meera");
  const [chatInputText, setChatInputText] = useState<string>("");
  const [chatSearchQuery, setChatSearchQuery] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);

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

  const activeChatThread =
    chatThreads.find((c) => c.id === selectedChatId) || chatThreads[0];

  const filteredChatThreads = useMemo(() => {
    const q = chatSearchQuery.toLowerCase().trim();
    if (!q) return chatThreads;
    return chatThreads.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.matter.toLowerCase().includes(q) ||
        c.specialization.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [chatThreads, chatSearchQuery]);

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
          {/* Dual Mode Switcher Pill */}
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
              <span>Legal Mails &amp; Notices</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black text-white dark:bg-white dark:text-black font-mono">
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
              <span>Instant Messages</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
      {inboxMode === "messages" && (
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[700px] rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-xs overflow-hidden">
          {/* -------------------------------------------------------------
              LEFT SUB-COLUMN: Advocates Thread List (~4 Cols in Sketch)
          ------------------------------------------------------------- */}
          <div className="md:col-span-4 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/50 dark:bg-zinc-950/50">
            {/* Search Advocate in chat */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-black dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Instant Conversations
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  Live
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search counsel or matter..."
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Advocate List matching "Adv Meera", "Adv Sarah" in Sketch */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {filteredChatThreads.map((thread) => {
                const isSelected = selectedChatId === thread.id;
                return (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedChatId(thread.id)}
                    className={`p-4 transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? "bg-white dark:bg-black border-l-4 border-black dark:border-white"
                        : "hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs flex items-center justify-center shadow-2xs">
                        {thread.avatarText}
                      </div>
                      {thread.online && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-black" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-black dark:text-white truncate">
                          {thread.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {thread.lastTime}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-zinc-400 block truncate">
                        {thread.matter}
                      </span>

                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
                        {thread.lastMessage}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* -------------------------------------------------------------
              RIGHT CONVERSATION PANE (~8 Cols in Sketch)
              Showing Chat stream and Input Box matching handwritten sketch
          ------------------------------------------------------------- */}
          <div className="md:col-span-8 flex flex-col justify-between bg-white dark:bg-black">
            {/* Header of Active Chat */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs flex items-center justify-center shadow-2xs">
                  {activeChatThread.avatarText}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-black dark:text-white">
                      {activeChatThread.name}
                    </h4>
                    {activeChatThread.online && (
                      <span className="text-[10px] font-mono text-emerald-500 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {activeChatThread.chamber} &bull; {activeChatThread.matter}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onOpenConsultationModal && (
                  <button
                    type="button"
                    onClick={onOpenConsultationModal}
                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                    title="Launch video consultation"
                  >
                    <Video className="w-4 h-4 text-black dark:text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {activeChatThread.messages.map((msg) => {
                const isCitizen = msg.sender === "citizen";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isCitizen ? "justify-end" : "justify-start"}`}
                  >
                    {!isCitizen && (
                      <div className="w-7 h-7 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs mt-1">
                        {activeChatThread.avatarText}
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 space-y-2 text-xs shadow-2xs ${
                        isCitizen
                          ? "bg-black text-white dark:bg-white dark:text-black font-medium"
                          : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                      {/* Attachments inside chat */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="pt-1 space-y-1">
                          {msg.attachments.map((att, i) => (
                            <div
                              key={i}
                              className={`p-2 rounded-xl flex items-center justify-between text-[11px] font-mono ${
                                isCitizen
                                  ? "bg-white/10 text-white dark:bg-black/10 dark:text-black"
                                  : "bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{att.name}</span>
                              </div>
                              <span className="opacity-70 ml-2">{att.size}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div
                        className={`flex items-center justify-end gap-1 text-[9px] font-mono opacity-70 pt-0.5`}
                      >
                        <span>{msg.timestamp}</span>
                        {isCitizen && (
                          <CheckCheck className="w-3 h-3 text-sky-400 dark:text-sky-600" />
                        )}
                      </div>
                    </div>

                    {isCitizen && (
                      <div className="w-7 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-1 text-black dark:text-white">
                        GO
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 flex flex-wrap gap-1.5 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 self-center">
                Quick responses:
              </span>
              {[
                "Understood, thank you Adv.",
                "Should I arrange physical true copies?",
                "When is the next motion sitting?",
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setChatInputText(chip)}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Bottom Instant Message Input Box matching Sketch */}
            <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black space-y-2">
              <div className="flex items-center gap-2">
                {/* Voice Note Button */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  title={isRecording ? "Stop voice memo" : "Record voice memo to counsel"}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                    isRecording
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white animate-pulse"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {isRecording && (
                  <span className="text-[11px] font-mono text-black dark:text-white font-bold animate-pulse">
                    Recording audio memo ({recordingSeconds}s)...
                  </span>
                )}

                {/* Input Field */}
                <input
                  type="text"
                  placeholder={`Instant message to ${activeChatThread.name}...`}
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendChatMessage();
                    }
                  }}
                  className="flex-1 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />

                {/* Send Button */}
                <button
                  type="button"
                  onClick={handleSendChatMessage}
                  disabled={!chatInputText.trim()}
                  className="px-4 py-2 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 disabled:opacity-40 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
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
