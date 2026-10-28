"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { advocateApi } from "@/lib/api";
import {
  Mail,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Search,
  RefreshCw,
  Shield,
  FileText,
  Clock,
  Download,
  Plus,
  Scale,
  Sparkles,
  PhoneCall,
  X,
  AlertCircle,
  CheckCircle2,
  Building,
  User,
  ExternalLink,
  ChevronRight,
  Wifi,
  WifiOff,
  Bell,
  MessageSquare,
  Star,
  Trash2,
  Archive,
  CornerUpLeft,
  CornerUpRight,
  Folder,
  Tag,
  Video,
  Info,
  AlertTriangle,
} from "lucide-react";

export type InboxMode = "mails" | "messages" | "notifications";
export type MailFolder = "inbox" | "starred" | "drafts" | "sent" | "archive" | "trash";
export type ChamberMailCategory = "all" | "registry" | "arbitration" | "client" | "notices";

export interface MailAttachment {
  name: string;
  size: string;
  type: string;
}

export interface ChamberEmailItem {
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
  category: ChamberMailCategory;
  categoryLabel: string;
  isRead: boolean;
  isStarred: boolean;
  attachments?: MailAttachment[];
}

export interface ChatMessage {
  id: string;
  sender: "client" | "advocate" | "associate";
  senderName?: string;
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  attachments?: { name: string; size: string }[];
}

export interface AdvocateChatThread {
  id: string;
  type: "direct" | "group";
  name: string;
  role: string;
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

export interface ChamberNotificationItem {
  id: string;
  type: "info" | "success" | "warning" | "danger";
  title: string;
  category: "all" | "causelist" | "orders" | "notices" | "filings";
  categoryLabel: string;
  summary: string;
  timestamp: string;
  caseRef?: string;
  isRead: boolean;
  priority: "high" | "normal";
  actionLabel?: string;
}

const INITIAL_CHAMBER_EMAILS: ChamberEmailItem[] = [
  {
    id: "c-mail-1",
    senderName: "Registrar (Judicial), High Court of Kerala",
    senderEmail: "registrar.judicial@keralahighcourt.gov.in",
    senderAvatarText: "HC",
    recipientName: "Adv. Meera Krishnan",
    recipientEmail: "meera.krishnan@keralabar.org",
    matterTitle: "WP(C) 19482/2024 • Division Bench 2A",
    subject: "Motion Slip Admitted & Numbering Defects Cured in WP(C) 19482/2024",
    snippet:
      "Section 16 Telegraph Act rejoinder affidavit and paper book numbering defects have been successfully cured. Listed tomorrow as Item No. 18 before DB-2A...",
    body: [
      "To: Adv. Meera Krishnan, Counsel for Petitioner,",
      "Ref: WP(C) No. 19482/2024 (Gopakumar Nambiar v. Kerala State Electricity Board & Anr.)",
      "This is to formally communicate from the Registry (Judicial) that the scrutiny defects pointed out on 24 October 2026 with respect to Annexure P-4 survey sketch numbering have been cleared.",
      "The motion slip submitted by your junior associate has been accepted by the Hon'ble Division Bench 2A (Hon'ble Mr. Justice P.B. Suresh Kumar and Hon'ble Mr. Justice C. Pratheep Kumar).",
      "The matter stands listed for hearing on stay extension tomorrow, 29 October 2026, as Item No. 18 in Court Hall 2A.",
      "Sd/-\nSection Officer (Judicial Writs)\nHigh Court of Kerala, Ernakulam",
    ],
    timestamp: "10:45 AM",
    fullDate: "28 Oct 2026, 10:45 AM",
    folder: "inbox",
    category: "registry",
    categoryLabel: "High Court Registry",
    isRead: false,
    isStarred: true,
    attachments: [
      {
        name: "High_Court_Motion_Admission_Slip_19482.pdf",
        size: "420 KB",
        type: "pdf",
      },
    ],
  },
  {
    id: "c-mail-2",
    senderName: "Adv. Rajesh V. Varma (Commercial Co-Counsel)",
    senderEmail: "rajesh.varma@arbitrationcouncil.in",
    senderAvatarText: "RV",
    recipientName: "Adv. Meera Krishnan",
    recipientEmail: "meera.krishnan@keralabar.org",
    matterTitle: "ARB/NCLT/KOCHI/2024/041 • Arbitral Tribunal",
    subject: "Arbitral Tribunal Notice: Section 17 Security Hearing Scheduled for 18 Nov",
    snippet:
      "Learned Sole Arbitrator has scheduled the next preliminary procedural hearing on 18 November 2026 at 02:30 PM for hearing our interim bank guarantee plea...",
    body: [
      "Dear Meera,",
      "Please find enclosed the formal procedural order passed by the learned Sole Arbitrator in ARB/NCLT/KOCHI/2024/041.",
      "The Tribunal has directed Coastal Logistics to submit their counter-affidavit to our Section 17 interim relief application by 10 November 2026.",
      "The oral arguments on interim bank guarantee of Rs. 48.6 Lakhs are confirmed for 18 November at the Chamber of the Arbitrator.",
      "Best regards,\nRajesh V. Varma\nCommercial Arbitration Counsel",
    ],
    timestamp: "Yesterday",
    fullDate: "27 Oct 2026, 04:15 PM",
    folder: "inbox",
    category: "arbitration",
    categoryLabel: "Commercial Arbitration",
    isRead: true,
    isStarred: true,
    attachments: [
      {
        name: "Arbitral_Procedural_Order_No_3.pdf",
        size: "1.1 MB",
        type: "pdf",
      },
    ],
  },
  {
    id: "c-mail-3",
    senderName: "Gopakumar Nambiar (Client)",
    senderEmail: "gopakumar.nambiar@wakheel.in",
    senderAvatarText: "GN",
    recipientName: "Adv. Meera Krishnan",
    recipientEmail: "meera.krishnan@keralabar.org",
    matterTitle: "WP(C) 19482/2024 • Property Demarcation",
    subject: "Signed Vakalatnama & Attested Revenue Survey Sketch for Tomorrow",
    snippet:
      "Dear Counsel, I have signed the Vakalatnama and attached the attested land tax receipt and revenue sketch for tomorrow's hearing...",
    body: [
      "Respected Counsel,",
      "As requested during our consultation yesterday, I have executed the fresh Vakalatnama before the Village Notary and scanned the document.",
      "I am also attaching the certified boundary measurement sketch issued by the Taluk Surveyor showing that the 11KV overhead line can easily take the road margin puramboke.",
      "I will be present at Court Hall 2A at 10:15 AM tomorrow.",
      "Thank you,\nGopakumar Nambiar",
    ],
    timestamp: "26 Oct",
    fullDate: "26 Oct 2026, 06:30 PM",
    folder: "inbox",
    category: "client",
    categoryLabel: "Client Instructions",
    isRead: true,
    isStarred: false,
    attachments: [
      {
        name: "Attested_Revenue_Sketch_Sy_142.pdf",
        size: "2.4 MB",
        type: "pdf",
      },
      {
        name: "Signed_Vakalatnama_Attested.pdf",
        size: "890 KB",
        type: "pdf",
      },
    ],
  },
  {
    id: "c-mail-4",
    senderName: "Advocate Commissioner K. M. Balachandran",
    senderEmail: "balachandran.comm@keralabar.org",
    senderAvatarText: "KB",
    recipientName: "Adv. Meera Krishnan",
    recipientEmail: "meera.krishnan@keralabar.org",
    matterTitle: "OS 412/2023 • Principal Munsiff Court",
    subject: "Commission Notice: Physical Boundary Survey Fixed for 30 October 2026 at 10:00 AM",
    snippet:
      "Notice is hereby issued to counsel for plaintiff and defendant that local inspection and boundary measurement of the suit schedule property will commence...",
    body: [
      "To: Adv. Meera Krishnan, Counsel for Plaintiff,",
      "Take notice that in pursuance of the warrant issued by the Hon'ble Principal Munsiff Court in IA 3/2024 in OS 412/2023, I shall execute the local commission on Friday, 30 October 2026 at 10:00 AM.",
      "The Village Assistant and Head Surveyor have been summoned with original Re-Survey Field Measurement Books (FMB).",
      "Counsel or authorized representative is requested to be present at the site with memo of instructions.",
      "Yours faithfully,\nK. M. Balachandran\nAdvocate Commissioner",
    ],
    timestamp: "25 Oct",
    fullDate: "25 Oct 2026, 11:00 AM",
    folder: "inbox",
    category: "notices",
    categoryLabel: "Commission Notice",
    isRead: true,
    isStarred: false,
    attachments: [
      {
        name: "Advocate_Commissioner_Inspection_Warrant.pdf",
        size: "680 KB",
        type: "pdf",
      },
    ],
  },
  {
    id: "c-mail-5",
    senderName: "Speed Post Tracking Alert",
    senderEmail: "speedpost.alert@indiapost.gov.in",
    senderAvatarText: "IP",
    recipientName: "Adv. Meera Krishnan",
    recipientEmail: "meera.krishnan@keralabar.org",
    matterTitle: "Section 138 NI Act • Statutory Notice",
    subject: "Consignment EK984712041IN: Statutory Notice Served on Noticee at Calicut",
    snippet:
      "Consignment EK984712041IN was successfully served on 24 October 2026. The 15-day statutory payment cure period expires on 08 November 2026...",
    body: [
      "India Post Consignment Tracking Department",
      "Consignment Number: EK984712041IN",
      "Booking Date: 22/10/2026",
      "Delivered To: Noticee (Managing Director, Coastal Logistics Pvt Ltd, Calicut)",
      "Delivery Timestamp: 24/10/2026, 03:42 PM",
      "Statutory Note: The 15-day statutory cure clock under Section 138(c) of the Negotiable Instruments Act commences from 25/10/2026.",
      "Certified delivery certificate can be produced before the Judicial First Class Magistrate Court.",
    ],
    timestamp: "24 Oct",
    fullDate: "24 Oct 2026, 05:20 PM",
    folder: "inbox",
    category: "notices",
    categoryLabel: "Statutory Delivery",
    isRead: true,
    isStarred: false,
    attachments: [
      {
        name: "India_Post_Official_Delivery_Certificate.pdf",
        size: "510 KB",
        type: "pdf",
      },
    ],
  },
];

const INITIAL_CHAMBER_THREADS: AdvocateChatThread[] = [
  {
    id: "thread-client-gopa",
    type: "direct",
    name: "Gopakumar Nambiar",
    role: "Client • WP(C) 19482/2024",
    matter: "WP(C) 19482/2024",
    avatarText: "GN",
    avatarBgColor: "bg-black text-white dark:bg-white dark:text-black",
    online: true,
    lastMessage: "Thank you counsel, will the certified order copy be presented?",
    lastTime: "11:20 AM",
    unreadCount: 1,
    messages: [
      {
        id: "m-1",
        sender: "client",
        text: "Namaskaram Adv. Meera, did the High Court Registry clear our Section 16 objection memo?",
        timestamp: "10:15 AM",
        status: "read",
      },
      {
        id: "m-2",
        sender: "advocate",
        text: "Yes Mr. Gopakumar. Division Bench 2A has accepted our motion slip. Our stay extension matter is listed tomorrow as Item No. 18.",
        timestamp: "10:48 AM",
        status: "read",
      },
      {
        id: "m-3",
        sender: "client",
        text: "Thank you counsel, will the certified order copy be presented?",
        timestamp: "11:20 AM",
        status: "delivered",
      },
    ],
  },
  {
    id: "thread-junior-anand",
    type: "direct",
    name: "Adv. Anand (Junior Associate)",
    role: "Chamber Associate • High Court",
    matter: "WP(C) 19482/2024",
    avatarText: "AA",
    avatarBgColor: "bg-[#6B1728] text-white",
    online: true,
    lastMessage: "Registry motion slip submitted for tomorrow. Paper books paginated.",
    lastTime: "09:30 AM",
    unreadCount: 0,
    messages: [
      {
        id: "j-1",
        sender: "advocate",
        text: "Anand, please ensure all 3 sets of paper books for DB-2A contain the certified survey sketch as Exhibit P-4.",
        timestamp: "09:05 AM",
        status: "read",
      },
      {
        id: "j-2",
        sender: "associate",
        senderName: "Adv. Anand",
        text: "Registry motion slip submitted for tomorrow. Paper books paginated and delivered to Court Hall 2A bench clerk.",
        timestamp: "09:30 AM",
        status: "read",
      },
    ],
  },
  {
    id: "thread-team-db2a",
    type: "group",
    name: "High Court Bench 2A Counsel Team",
    role: "Chamber Litigation Taskforce",
    matter: "WP(C) 19482/2024 Defense",
    avatarText: "HC",
    avatarBgColor: "bg-zinc-800 text-white",
    online: true,
    lastMessage: "Adv. Sarah: Caveat search completed. No caveat filed by KSEB.",
    lastTime: "Yesterday",
    unreadCount: 0,
    participants: ["Adv. Meera Krishnan", "Adv. Anand", "Adv. Sarah Jenkins"],
    messages: [
      {
        id: "g-1",
        sender: "associate",
        senderName: "Adv. Sarah Jenkins",
        text: "Adv. Sarah: Caveat search completed. No caveat filed by KSEB as on 4 PM today.",
        timestamp: "Yesterday",
        status: "read",
      },
    ],
  },
  {
    id: "thread-client-david",
    type: "direct",
    name: "David Chen",
    role: "Corporate Client • Employment Law",
    matter: "Executive Agreement Review",
    avatarText: "DC",
    avatarBgColor: "bg-zinc-700 text-white",
    online: false,
    lastMessage: "Received legal opinion with non-compete clause modifications.",
    lastTime: "24 Oct",
    unreadCount: 0,
    messages: [
      {
        id: "d-1",
        sender: "advocate",
        text: "David, the revised executive employment agreement and non-compete indemnity opinion has been uploaded to your portal vault.",
        timestamp: "24 Oct",
        status: "read",
      },
      {
        id: "d-2",
        sender: "client",
        text: "Received legal opinion with non-compete clause modifications. Thank you Meera.",
        timestamp: "24 Oct",
        status: "read",
      },
    ],
  },
];

const INITIAL_CHAMBER_NOTIFICATIONS: ChamberNotificationItem[] = [
  {
    id: "notif-info-1",
    type: "info",
    title: "This is informative message",
    category: "causelist",
    categoryLabel: "Info Alert",
    summary: "Lorem ipsum dolor sit amet, consectetur.",
    timestamp: "Just now",
    isRead: false,
    priority: "normal",
    actionLabel: "Action",
  },
  {
    id: "notif-success-1",
    type: "success",
    title: "This is success message",
    category: "orders",
    categoryLabel: "Success Alert",
    summary: "Lorem ipsum dolor sit amet, consectetur.",
    timestamp: "5 min ago",
    isRead: false,
    priority: "normal",
    actionLabel: "Action",
  },
  {
    id: "notif-warning-1",
    type: "warning",
    title: "This is warning message",
    category: "causelist",
    categoryLabel: "Warning Alert",
    summary: "Lorem ipsum dolor sit amet, consectetur.",
    timestamp: "20 min ago",
    isRead: false,
    priority: "high",
    actionLabel: "Action",
  },
  {
    id: "notif-danger-1",
    type: "danger",
    title: "This is danger message",
    category: "notices",
    categoryLabel: "Danger Alert",
    summary: "Lorem ipsum dolor sit amet, consectetur.",
    timestamp: "1 hour ago",
    isRead: false,
    priority: "high",
    actionLabel: "Action",
  },
  {
    id: "notif-c1",
    type: "warning",
    title: "High Court Causelist Alert: Item No. 18 in Court Hall 2A Tomorrow",
    category: "causelist",
    categoryLabel: "Court Causelist",
    summary: "WP(C) 19482/2024 scheduled before Hon'ble Division Bench 2A at 10:30 AM. Lead appearance confirmed.",
    timestamp: "15 min ago",
    caseRef: "WP(C) 19482/2024",
    isRead: false,
    priority: "high",
    actionLabel: "Action",
  },
  {
    id: "notif-c2",
    type: "success",
    title: "Certified True Copy Issued by High Court Copying Section",
    category: "orders",
    categoryLabel: "Certified Order",
    summary: "Hon'ble DB-2A daily order granting interim stay on tree felling is ready for collection and delivery.",
    timestamp: "45 min ago",
    caseRef: "WP(C) 19482/2024",
    isRead: false,
    priority: "high",
    actionLabel: "Action",
  },
  {
    id: "notif-c3",
    type: "danger",
    title: "Section 138 Statutory 15-Day Cure Notice Expiring on 08 Nov",
    category: "notices",
    categoryLabel: "Statutory Deadline",
    summary: "India Post confirmed notice delivered on 24 Oct. Criminal complaint must be filed before JFCM if unpaid.",
    timestamp: "2 hours ago",
    caseRef: "Sec. 138 NI Act Notice",
    isRead: false,
    priority: "high",
    actionLabel: "Action",
  },
  {
    id: "notif-c4",
    type: "info",
    title: "Advocate Commissioner Notice in OS 412/2023",
    category: "notices",
    categoryLabel: "Commission Notice",
    summary: "Court Advocate Commissioner fixed spot inspection for 30 Oct at 10:00 AM with Village Surveyor.",
    timestamp: "Yesterday",
    caseRef: "OS 412/2023",
    isRead: true,
    priority: "normal",
    actionLabel: "Action",
  },
];

interface AdvocateInboxViewProps {
  token?: string;
  advocateName?: string;
  initialMode?: InboxMode;
  onOpenConsultation?: () => void;
}

export const AdvocateInboxView: React.FC<AdvocateInboxViewProps> = ({
  token,
  advocateName = "Adv. Meera Krishnan",
  initialMode = "mails",
  onOpenConsultation,
}) => {
  const [inboxMode, setInboxMode] = useState<InboxMode>(initialMode);

  // ==========================================
  // MODE 1: MAIL BOX STATE
  // ==========================================
  const [emails, setEmails] = useState<ChamberEmailItem[]>(INITIAL_CHAMBER_EMAILS);
  const [selectedFolder, setSelectedFolder] = useState<MailFolder>("inbox");
  const [selectedMailCategory, setSelectedMailCategory] = useState<ChamberMailCategory>("all");
  const [selectedEmailId, setSelectedEmailId] = useState<string>(INITIAL_CHAMBER_EMAILS[0]?.id || "");
  const [mailSearchQuery, setMailSearchQuery] = useState("");
  const [replyInput, setReplyInput] = useState("");
  const [replySuccess, setReplySuccess] = useState(false);
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeMatter, setComposeMatter] = useState("");
  const [composeBody, setComposeBody] = useState("");

  // ==========================================
  // MODE 2: INSTANT MESSAGES STATE
  // ==========================================
  const [chatThreads, setChatThreads] = useState<AdvocateChatThread[]>(INITIAL_CHAMBER_THREADS);
  const [selectedChatId, setSelectedChatId] = useState<string>(INITIAL_CHAMBER_THREADS[0]?.id || "");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [chatSegment, setChatSegment] = useState<"all" | "direct" | "group">("all");
  const [chatInputText, setChatInputText] = useState("");
  const [isWsConnected, setIsWsConnected] = useState<boolean>(true);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // MODE 3: NOTIFICATIONS STATE
  // ==========================================
  const [notifications, setNotifications] = useState<ChamberNotificationItem[]>(INITIAL_CHAMBER_NOTIFICATIONS);
  const [selectedNotifFilter, setSelectedNotifFilter] = useState<string>("all");

  // Sync mode if initialMode changes
  useEffect(() => {
    if (initialMode) setInboxMode(initialMode);
  }, [initialMode]);

  // Scroll to bottom in chat
  useEffect(() => {
    if (inboxMode === "messages") {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatId, chatThreads, inboxMode]);

  // ==========================================
  // COMPUTED MAIL DATA
  // ==========================================
  const filteredEmails = useMemo(() => {
    return emails.filter((mail) => {
      const matchFolder =
        selectedFolder === "starred"
          ? mail.isStarred
          : mail.folder === selectedFolder;

      const matchCategory =
        selectedMailCategory === "all" || mail.category === selectedMailCategory;

      const q = mailSearchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        mail.senderName.toLowerCase().includes(q) ||
        mail.subject.toLowerCase().includes(q) ||
        mail.matterTitle.toLowerCase().includes(q) ||
        mail.snippet.toLowerCase().includes(q);

      return matchFolder && matchCategory && matchSearch;
    });
  }, [emails, selectedFolder, selectedMailCategory, mailSearchQuery]);

  const activeEmail =
    emails.find((e) => e.id === selectedEmailId) || filteredEmails[0] || emails[0];

  const unreadMailCount = emails.filter((e) => !e.isRead).length;
  const unreadChatCount = chatThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  // Toggle Star
  const handleToggleStar = (emailId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEmails((prev) =>
      prev.map((m) => (m.id === emailId ? { ...m, isStarred: !m.isStarred } : m))
    );
  };

  // Trash Email
  const handleDeleteEmail = (emailId: string) => {
    setEmails((prev) =>
      prev.map((m) => (m.id === emailId ? { ...m, folder: "trash" as MailFolder } : m))
    );
  };

  // Send Quick Reply
  const handleSendMailReply = () => {
    if (!replyInput.trim()) return;
    setReplySuccess(true);
    setReplyInput("");
    setTimeout(() => setReplySuccess(false), 2500);
  };

  // Send New Composed Email
  const handleSendComposedEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim()) return;

    const newEmail: ChamberEmailItem = {
      id: "mail-" + Date.now(),
      senderName: advocateName,
      senderEmail: "meera.krishnan@keralabar.org",
      senderAvatarText: "MK",
      recipientName: composeTo,
      recipientEmail: composeTo.toLowerCase().replace(/\s+/g, ".") + "@keralabar.org",
      matterTitle: composeMatter || "General Chamber Brief",
      subject: composeSubject,
      snippet: composeBody.slice(0, 100) + "...",
      body: composeBody.split("\n").filter(Boolean),
      timestamp: "Just now",
      fullDate: new Date().toLocaleString(),
      folder: "sent",
      category: "registry",
      categoryLabel: "High Court Registry",
      isRead: true,
      isStarred: false,
    };

    setEmails((prev) => [newEmail, ...prev]);
    setComposeModalOpen(false);
    setComposeTo("");
    setComposeSubject("");
    setComposeMatter("");
    setComposeBody("");
  };

  // ==========================================
  // COMPUTED CHAT DATA
  // ==========================================
  const filteredChatThreads = useMemo(() => {
    return chatThreads.filter((thread) => {
      const matchSegment =
        chatSegment === "all" || thread.type === chatSegment;
      const q = chatSearchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        thread.name.toLowerCase().includes(q) ||
        thread.matter.toLowerCase().includes(q) ||
        thread.lastMessage.toLowerCase().includes(q);

      return matchSegment && matchSearch;
    });
  }, [chatThreads, chatSegment, chatSearchQuery]);

  const activeChatThread =
    chatThreads.find((t) => t.id === selectedChatId) ||
    filteredChatThreads[0] ||
    chatThreads[0];

  // Send Instant Message
  const handleSendChatMessage = () => {
    if (!chatInputText.trim() || !activeChatThread) return;

    const newMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "advocate",
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

    // Simulate response after 1.5s
    setTimeout(() => {
      const autoReply: ChatMessage = {
        id: "rep-" + Date.now(),
        sender: activeChatThread.type === "group" ? "associate" : "client",
        senderName: activeChatThread.type === "group" ? "Adv. Anand" : activeChatThread.name,
        text: `Received counsel: "${sentText.slice(0, 40)}...". Attending to this instruction immediately.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "read",
      };

      setChatThreads((prev) =>
        prev.map((thread) => {
          if (thread.id === selectedChatId) {
            return {
              ...thread,
              lastMessage: autoReply.text,
              lastTime: autoReply.timestamp,
              messages: [...thread.messages, autoReply],
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
          TOP HEADER WITH 3 TABS: Mail box | Instant Message | Notifications
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 text-xs font-bold">
            {/* Tab 1: Mail box */}
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
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  inboxMode === "mails"
                    ? "bg-white text-black dark:bg-black dark:text-white"
                    : "bg-black text-white dark:bg-white dark:text-black"
                }`}
              >
                {unreadMailCount}
              </span>
            </button>

            {/* Tab 2: Instant Message */}
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
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  inboxMode === "messages"
                    ? "bg-white text-black dark:bg-black dark:text-white"
                    : "bg-black text-white dark:bg-white dark:text-black"
                }`}
              >
                {unreadChatCount}
              </span>
            </button>

            {/* Tab 3: Notifications */}
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
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  inboxMode === "notifications"
                    ? "bg-[#6B1728] text-white font-bold"
                    : "bg-zinc-300 dark:bg-zinc-700 text-black dark:text-white"
                }`}
              >
                {unreadNotifCount}
              </span>
            </button>
          </div>
        </div>

        {/* Right side utility badge */}
        <div className="flex items-center gap-2">
          {inboxMode === "mails" && (
            <button
              type="button"
              onClick={() => setComposeModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center gap-2 hover:opacity-90 shadow-2xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Formal Brief</span>
            </button>
          )}

          {inboxMode === "messages" && (
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Chamber Live Sync</span>
            </div>
          )}

          {inboxMode === "notifications" && (
            <span className="text-xs font-mono text-zinc-500">
              High Court &amp; Registry Alert Feed
            </span>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODE 1: MAIL BOX (Court Notices, Registry Mails & Client Briefs)
      ========================================================================= */}
      {inboxMode === "mails" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Column A: Folders & Matter Labels (3 Cols) */}
          <div className="lg:col-span-3 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4 space-y-5 shadow-xs">
            <button
              type="button"
              onClick={() => setComposeModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 shadow-2xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Legal Notice</span>
            </button>

            {/* Folder Navigation */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block px-2">
                Chamber Folders
              </span>
              {[
                { id: "inbox", label: "Inbox", icon: Mail, count: unreadMailCount },
                { id: "starred", label: "Starred Notices", icon: Star, count: emails.filter((e) => e.isStarred).length },
                { id: "drafts", label: "Draft Pleadings", icon: FileText, count: 2 },
                { id: "sent", label: "Dispatched Mails", icon: Send, count: 8 },
                { id: "archive", label: "Closed Briefs", icon: Archive, count: 14 },
                { id: "trash", label: "Trash", icon: Trash2, count: 0 },
              ].map((folder) => {
                const Icon = folder.icon;
                const isActive = selectedFolder === folder.id;
                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setSelectedFolder(folder.id as MailFolder)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      isActive
                        ? "bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white font-bold"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{folder.label}</span>
                    </div>
                    {folder.count > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {folder.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Category Filter */}
            <div className="space-y-1 pt-3 border-t border-zinc-100 dark:border-zinc-900">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block px-2">
                Docket Categories
              </span>
              {[
                { id: "all", label: "All Communications" },
                { id: "registry", label: "High Court Registry" },
                { id: "arbitration", label: "Arbitration Tribunal" },
                { id: "client", label: "Client Instructions" },
                { id: "notices", label: "Statutory / Commission" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedMailCategory(cat.id as ChamberMailCategory)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    selectedMailCategory === cat.id
                      ? "text-black dark:text-white font-bold bg-zinc-100 dark:bg-zinc-900"
                      : "text-zinc-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Column B: Email List (4 Cols) */}
          <div className="lg:col-span-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4 space-y-3 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={mailSearchQuery}
                onChange={(e) => setMailSearchQuery(e.target.value)}
                placeholder="Search court registry mails..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>

            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredEmails.map((mail) => {
                const isSelected = activeEmail?.id === mail.id;
                return (
                  <div
                    key={mail.id}
                    onClick={() => {
                      setSelectedEmailId(mail.id);
                      setEmails((prev) =>
                        prev.map((m) => (m.id === mail.id ? { ...m, isRead: true } : m))
                      );
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? "bg-zinc-100 dark:bg-zinc-900 border-black dark:border-white shadow-2xs"
                        : "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-black dark:text-white truncate">
                        {mail.senderName}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                        {mail.timestamp}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-black dark:text-white truncate">
                      {mail.subject}
                    </h4>

                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                      {mail.snippet}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {mail.categoryLabel}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {mail.attachments && mail.attachments.length > 0 && (
                          <Paperclip className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(mail.id, e)}
                          className="p-1 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              mail.isStarred ? "fill-[#6B1728] text-[#6B1728]" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredEmails.length === 0 && (
                <div className="p-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  No emails in this view.
                </div>
              )}
            </div>
          </div>

          {/* Column C: Email Reading Pane (5 Cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-6 space-y-6 shadow-xs min-h-[600px] flex flex-col justify-between">
            {activeEmail ? (
              <div className="space-y-5">
                {/* Email Header */}
                <div className="space-y-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white">
                        {activeEmail.categoryLabel}
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-black dark:text-white mt-1.5 leading-snug">
                        {activeEmail.subject}
                      </h2>
                      <span className="text-xs font-mono text-zinc-500 block mt-0.5">
                        {activeEmail.matterTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleStar(activeEmail.id)}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                        title="Star"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            activeEmail.isStarred ? "fill-[#6B1728] text-[#6B1728]" : ""
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEmail(activeEmail.id)}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-red-500 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold flex items-center justify-center text-[10px]">
                        {activeEmail.senderAvatarText}
                      </div>
                      <div>
                        <span className="font-bold text-black dark:text-white block">
                          {activeEmail.senderName}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {activeEmail.senderEmail}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {activeEmail.fullDate}
                    </span>
                  </div>
                </div>

                {/* Email Body */}
                <div className="space-y-3 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 font-serif whitespace-pre-line max-h-72 overflow-y-auto pr-1">
                  {activeEmail.body.map((para, pIdx) => (
                    <p key={pIdx}>{para}</p>
                  ))}
                </div>

                {/* Attachments */}
                {activeEmail.attachments && activeEmail.attachments.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                      Enclosed Case Records ({activeEmail.attachments.length}):
                    </span>
                    <div className="space-y-1.5">
                      {activeEmail.attachments.map((att, aIdx) => (
                        <div
                          key={aIdx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-black dark:text-white shrink-0" />
                            <span className="font-semibold text-black dark:text-white truncate">
                              {att.name}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              ({att.size})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => alert(`Downloading verified document: ${att.name}`)}
                            className="p-1 rounded text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                            title="Download document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-zinc-400">
                Select an email to view full briefing.
              </div>
            )}

            {/* Quick Reply Form */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Type quick acknowledgement to registry or client..."
                  className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendMailReply}
                  disabled={!replyInput.trim()}
                  className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer hover:opacity-90 disabled:opacity-40"
                >
                  Send
                </button>
              </div>
              {replySuccess && (
                <span className="text-[11px] font-mono text-emerald-600 block">
                  ✓ Reply dispatched via chamber mail server.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODE 2: INSTANT MESSAGES (2-Column Messenger matching user screenshot)
      ========================================================================= */}
      {inboxMode === "messages" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden shadow-xs min-h-[640px]">
          {/* Left Column: Discussions List (4 Cols) */}
          <div className="md:col-span-5 lg:col-span-4 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between p-4 space-y-4">
            <div className="space-y-3">
              {/* Discussions Title & New Button */}
              <div className="flex items-center justify-between pb-1">
                <h2 className="text-base font-bold text-black dark:text-white">
                  Discussions
                </h2>
                <button
                  type="button"
                  onClick={() => alert("Start new client consultation conversation")}
                  className="w-7 h-7 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center cursor-pointer hover:opacity-85"
                  title="New discussion"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder="Search discussions..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none"
                />
              </div>

              {/* Segment Toggle: All | Direct | Group */}
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-[11px] font-semibold">
                {[
                  { id: "all", label: "All" },
                  { id: "direct", label: "Clients" },
                  { id: "group", label: "Chamber Panels" },
                ].map((seg) => (
                  <button
                    key={seg.id}
                    type="button"
                    onClick={() => setChatSegment(seg.id as any)}
                    className={`flex-1 py-1 rounded-lg text-center cursor-pointer transition-all ${
                      chatSegment === seg.id
                        ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-2xs font-bold"
                        : "text-zinc-500 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {seg.label}
                  </button>
                ))}
              </div>

              {/* Threads List */}
              <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-0.5">
                {filteredChatThreads.map((thread) => {
                  const isSelected = activeChatThread?.id === thread.id;
                  return (
                    <div
                      key={thread.id}
                      onClick={() => setSelectedChatId(thread.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                          ? "bg-zinc-100 dark:bg-zinc-900"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                      }`}
                    >
                      {/* Avatar with status indicator */}
                      <div className="relative shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-xs ${
                            thread.avatarBgColor || "bg-black text-white dark:bg-white dark:text-black"
                          }`}
                        >
                          {thread.avatarText}
                        </div>
                        {thread.online && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-black dark:text-white truncate">
                            {thread.name}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                            {thread.lastTime}
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                          {thread.lastMessage}
                        </p>

                        <span className="text-[9px] font-mono text-zinc-400 truncate block mt-0.5">
                          {thread.matter}
                        </span>
                      </div>

                      {/* Unread badge */}
                      {thread.unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#6B1728] text-white shrink-0">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Active Conversation (8 Cols) */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between p-4 sm:p-6 space-y-4 bg-zinc-50/40 dark:bg-zinc-950/40">
            {activeChatThread ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs ${
                        activeChatThread.avatarBgColor || "bg-black text-white dark:bg-white dark:text-black"
                      }`}
                    >
                      {activeChatThread.avatarText}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-black dark:text-white">
                        {activeChatThread.name}
                      </h3>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        {activeChatThread.role} • {activeChatThread.matter}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onOpenConsultation && (
                      <button
                        type="button"
                        onClick={onOpenConsultation}
                        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                        title="Book Chamber Appointment"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => alert(`Launching privileged consultation for ${activeChatThread.name}`)}
                      className="p-2 rounded-xl bg-black text-white dark:bg-white dark:text-black cursor-pointer hover:opacity-90"
                      title="Launch Video Conference"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Attorney-Client Privilege Notice Banner */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#6B1728] shrink-0" />
                  <span>
                    <strong>Privileged Counsel Communication:</strong> Protected under Section 126 of Indian Evidence Act.
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px] pr-1">
                  {activeChatThread.messages.map((msg) => {
                    const isAdvocate = msg.sender === "advocate";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdvocate ? "items-end" : "items-start"}`}
                      >
                        {msg.senderName && (
                          <span className="text-[10px] font-mono text-zinc-400 mb-0.5">
                            {msg.senderName}
                          </span>
                        )}
                        <div
                          className={`p-3.5 rounded-2xl max-w-sm sm:max-w-md text-xs leading-relaxed ${
                            isAdvocate
                              ? "bg-black text-white dark:bg-white dark:text-black rounded-tr-xs"
                              : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-tl-xs shadow-2xs"
                          }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-zinc-400">
                          <span>{msg.timestamp}</span>
                          {isAdvocate && (
                            <CheckCheck className="w-3.5 h-3.5 text-zinc-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatMessagesEndRef} />
                </div>

                {/* Message Input Bar */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xs">
                    <button
                      type="button"
                      onClick={() => alert("Upload case record exhibit to chat")}
                      className="p-1.5 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                      title="Attach file"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChatMessage();
                        }
                      }}
                      placeholder="Type legal instruction or reply..."
                      className="flex-1 text-xs text-black dark:text-white placeholder-zinc-400 bg-transparent focus:outline-none px-1"
                    />

                    <button
                      type="button"
                      onClick={handleSendChatMessage}
                      disabled={!chatInputText.trim()}
                      className="p-2 rounded-xl bg-black text-white dark:bg-white dark:text-black cursor-pointer hover:opacity-90 disabled:opacity-30 transition-all"
                      title="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-xs text-zinc-400">
                Select a conversation thread to start messaging.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODE 3: NOTIFICATIONS (Styled matching media_1793168201378_c5d09ec9.png)
      ========================================================================= */}
      {inboxMode === "notifications" && (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-xs p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#6B1728] dark:text-[#F3A5B5]" />
                <h2 className="text-lg font-black text-black dark:text-white">
                  Chamber &amp; Court Notifications
                </h2>
                {unreadNotifCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#6B1728] text-white">
                    {unreadNotifCount} Unread
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Real-time alerts from High Court registries, causelists, Speed Post tracking, and commission hearings.
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
              { id: "causelist", label: "Causelist Calls", count: notifications.filter((n) => n.category === "causelist").length },
              { id: "orders", label: "Certified Orders", count: notifications.filter((n) => n.category === "orders").length },
              { id: "notices", label: "Statutory Deadlines", count: notifications.filter((n) => n.category === "notices").length },
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

          {/* Notifications Horizontal Strip List matching user screenshot */}
          <div className="space-y-2.5">
            {notifications
              .filter((n) => selectedNotifFilter === "all" || n.category === selectedNotifFilter)
              .map((notif) => {
                const itemType = notif.type || "info";
                const typeConfig = {
                  info: {
                    stripe: "bg-[#6B1728]",
                    textAccent: "text-[#6B1728] dark:text-[#E07A8B]",
                    gradient: "from-[#6B1728]/[0.08] via-[#6B1728]/[0.02] dark:from-[#6B1728]/20 dark:via-[#6B1728]/5",
                    icon: <Info className="w-4 h-4 shrink-0 text-[#6B1728] dark:text-[#E07A8B]" />,
                  },
                  success: {
                    stripe: "bg-[#7A1B2E]",
                    textAccent: "text-[#7A1B2E] dark:text-[#E07A8B]",
                    gradient: "from-[#7A1B2E]/[0.08] via-[#7A1B2E]/[0.02] dark:from-[#7A1B2E]/20 dark:via-[#7A1B2E]/5",
                    icon: <CheckCircle2 className="w-4 h-4 shrink-0 text-[#7A1B2E] dark:text-[#E07A8B]" />,
                  },
                  warning: {
                    stripe: "bg-[#8B1E32]",
                    textAccent: "text-[#8B1E32] dark:text-[#E07A8B]",
                    gradient: "from-[#8B1E32]/[0.08] via-[#8B1E32]/[0.02] dark:from-[#8B1E32]/20 dark:via-[#8B1E32]/5",
                    icon: <AlertTriangle className="w-4 h-4 shrink-0 text-[#8B1E32] dark:text-[#E07A8B]" />,
                  },
                  danger: {
                    stripe: "bg-[#54121E]",
                    textAccent: "text-[#54121E] dark:text-[#E07A8B]",
                    gradient: "from-[#54121E]/[0.08] via-[#54121E]/[0.02] dark:from-[#54121E]/20 dark:via-[#54121E]/5",
                    icon: <AlertCircle className="w-4 h-4 shrink-0 text-[#54121E] dark:text-[#E07A8B]" />,
                  },
                }[itemType];

                return (
                  <div
                    key={notif.id}
                    className={`relative overflow-hidden flex items-center justify-between gap-3 px-4 py-3 sm:py-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs transition-all hover:shadow-xs ${
                      notif.isRead ? "opacity-75" : ""
                    }`}
                  >
                    {/* Left vertical color stripe in burgundy */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 ${typeConfig.stripe}`} />

                    {/* Soft burgundy gradient wash */}
                    <div
                      className={`absolute inset-0 pointer-events-none bg-gradient-to-r ${typeConfig.gradient} to-transparent`}
                    />

                    {/* Content: Icon + Title + Description */}
                    <div className="relative flex items-center gap-3 min-w-0 flex-1 pl-1">
                      {typeConfig.icon}

                      <div className="flex flex-wrap sm:flex-nowrap items-baseline sm:items-center gap-x-2 gap-y-0.5 min-w-0 flex-1">
                        <span className="font-bold text-xs sm:text-sm text-black dark:text-white shrink-0">
                          {notif.title}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate font-normal">
                          {notif.summary}
                        </span>
                        {notif.caseRef && (
                          <span className="hidden md:inline-block text-[10px] font-mono font-semibold text-zinc-400 ml-1">
                            ({notif.caseRef})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side: Action link + Dismiss button */}
                    <div className="relative flex items-center gap-3.5 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => alert(`Action launched for: ${notif.title}`)}
                        className={`text-xs font-semibold ${typeConfig.textAccent} hover:underline cursor-pointer transition-colors`}
                      >
                        {notif.actionLabel || "Action"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
                        }}
                        className="p-1 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors rounded"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

            {notifications.filter((n) => selectedNotifFilter === "all" || n.category === selectedNotifFilter).length === 0 && (
              <div className="p-12 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                No notifications found in this category.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          COMPOSE FORMAL BRIEF MODAL
      ========================================================================= */}
      {composeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-black dark:text-white">
                Compose Formal Chamber Pleading / Notice
              </h3>
              <button
                type="button"
                onClick={() => setComposeModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendComposedEmail} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1 text-black dark:text-white">
                  Recipient (Advocate / Registry / Client)
                </label>
                <input
                  type="text"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="e.g. Registrar (Judicial), High Court or Client Name"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-black dark:text-white">
                  Matter / Case Reference
                </label>
                <input
                  type="text"
                  value={composeMatter}
                  onChange={(e) => setComposeMatter(e.target.value)}
                  placeholder="e.g. WP(C) 19482/2024 • High Court of Kerala"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-black dark:text-white">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="e.g. Objection representation under Section 16(1) of Telegraph Act"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-black dark:text-white">
                  Formal Brief Body
                </label>
                <textarea
                  rows={6}
                  required
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Enter formal notice language, registry motion text, or chamber instructions..."
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none leading-relaxed font-serif"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setComposeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 cursor-pointer shadow-2xs"
                >
                  Dispatch Formal Brief
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
