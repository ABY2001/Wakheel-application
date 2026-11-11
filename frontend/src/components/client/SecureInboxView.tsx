"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { citizenApi } from "@/lib/api";
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
  Info,
  CheckCircle2,
  AlertTriangle,
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
  advocateId?: string;
  matterId?: string;
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
  type?: "info" | "success" | "warning" | "danger";
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

const INITIAL_LEGAL_EMAILS: LegalEmailItem[] = [];

const INITIAL_CHAT_THREADS: ChatAdvocateThread[] = [];

interface AdvocateOption {
  id: string;
  name: string;
  chamber: string;
  specialization: string;
  matterTitle?: string;
}

const getInitials = (name: string) =>
  String(name || "CN")
    .replace(/^adv\.?\s*/i, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] || "")
    .join("")
    .toUpperCase() || "CN";

interface SecureInboxViewProps {
  token?: string;
  citizenName?: string;
  citizenEmail?: string;
  initialMode?: InboxMode;
  onOpenConsultationModal?: () => void;
}

export function SecureInboxView({
  token,
  citizenName = "Citizen",
  citizenEmail = "",
  initialMode = "mails",
  onOpenConsultationModal,
}: SecureInboxViewProps) {
  const [inboxMode, setInboxMode] = useState<InboxMode>(initialMode);

  useEffect(() => {
    setInboxMode(initialMode);
  }, [initialMode]);

  const authToken = useMemo(
    () =>
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("wakheel_token") || localStorage.getItem("token") || ""
        : ""),
    [token]
  );

  const citizenInitials = useMemo(() => getInitials(citizenName || "You"), [citizenName]);

  // Mails State
  const [emails, setEmails] = useState<LegalEmailItem[]>([]);
  const [isLoadingMails, setIsLoadingMails] = useState<boolean>(false);
  const [isSendingMail, setIsSendingMail] = useState<boolean>(false);
  const [selectedFolder, setSelectedFolder] = useState<MailFolder>("inbox");
  const [selectedCategory, setSelectedCategory] = useState<MailCategory>("all");
  const [mailSearchQuery, setMailSearchQuery] = useState<string>("");
  const [selectedEmailId, setSelectedEmailId] = useState<string>("");
  const [composeModalOpen, setComposeModalOpen] = useState<boolean>(false);
  const [replyInput, setReplyInput] = useState<string>("");
  const [replySuccess, setReplySuccess] = useState<boolean>(false);

  // Compose State
  const [composeRecipientId, setComposeRecipientId] = useState<string>("");
  const [composeTo, setComposeTo] = useState<string>("");
  const [composeMatter, setComposeMatter] = useState<string>("");
  const [composeSubject, setComposeSubject] = useState<string>("");
  const [composeBody, setComposeBody] = useState<string>("");

  // Counsel Directory & Instant Messages State
  const [counselOptions, setCounselOptions] = useState<AdvocateOption[]>([]);
  const [chatThreads, setChatThreads] = useState<ChatAdvocateThread[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState<boolean>(false);
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [chatSegment, setChatSegment] = useState<"direct" | "group">("direct");
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [chatInputText, setChatInputText] = useState<string>("");
  const [chatSearchQuery, setChatSearchQuery] = useState<string>("");
  const [newDiscussionOpen, setNewDiscussionOpen] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string>("");
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<LegalNotificationItem[]>([]);
  const [selectedNotifFilter, setSelectedNotifFilter] = useState<string>("all");

  const loadInboxData = useCallback(async () => {
    setIsLoadingMails(true);
    setIsLoadingChats(true);
    try {
      const [mailsRes, msgsRes, notifsRes, advRes, mattersRes, consultRes, grvRes] =
        await Promise.all([
          citizenApi.getMails(authToken).catch(() => null),
          citizenApi.getMessages(authToken).catch(() => null),
          citizenApi.getNotifications(authToken).catch(() => null),
          citizenApi.getAdvocates().catch(() => null),
          authToken ? citizenApi.getMatters(authToken).catch(() => null) : Promise.resolve(null),
          authToken ? citizenApi.getConsultations(authToken).catch(() => null) : Promise.resolve(null),
          authToken ? citizenApi.getGrievances(authToken).catch(() => null) : Promise.resolve(null),
        ]);

      // Build Advocate Directory from citizen's matters/consultations/grievances + registered advocates
      const directoryMap = new Map<string, AdvocateOption>();
      const registerAdvocate = (opt: Partial<AdvocateOption> & { name?: string }) => {
        const cleanName = String(opt.name || "").trim();
        const cleanId = String(opt.id || "").trim();
        const key = cleanId || cleanName.toLowerCase();
        if (!key || !cleanName) return;
        const prev = directoryMap.get(key);
        directoryMap.set(key, {
          id: cleanId || prev?.id || "",
          name: cleanName,
          chamber: opt.chamber || prev?.chamber || "Advocate Chamber",
          specialization: opt.specialization || prev?.specialization || "Legal Counsel",
          matterTitle: opt.matterTitle || prev?.matterTitle,
        });
      };

      if (mattersRes?.success && Array.isArray(mattersRes.matters)) {
        mattersRes.matters.forEach((m: any) =>
          registerAdvocate({
            id: m.advocateId,
            name: m.advocateName,
            chamber: m.courtName || "Assigned Counsel Chamber",
            matterTitle: m.title || m.caseNumber,
          })
        );
      }
      if (consultRes?.success && Array.isArray(consultRes.consultations)) {
        consultRes.consultations.forEach((c: any) =>
          registerAdvocate({
            id: c.advocateId,
            name: c.advocateName,
            matterTitle: c.matterTitle || c.legalIssueSummary,
          })
        );
      }
      if (grvRes?.success && Array.isArray(grvRes.grievances)) {
        grvRes.grievances.forEach((g: any) =>
          registerAdvocate({
            id: g.matchedAdvocateId || g.advocateId,
            name: g.matchedAdvocateName || g.advocateName,
            matterTitle: g.title,
          })
        );
      }
      if (advRes?.success && Array.isArray(advRes.advocates)) {
        advRes.advocates.forEach((a: any) =>
          registerAdvocate({
            id: a.id || a._id || a.advocateId,
            name: a.fullName || a.name,
            chamber: a.court || a.chamber || "Advocate Chamber",
            specialization: a.specialization || "Legal Counsel",
          })
        );
      }

      const directoryList = Array.from(directoryMap.values());
      setCounselOptions(directoryList);

      if (mailsRes?.success && Array.isArray(mailsRes.mails)) {
        setEmails(mailsRes.mails);
      }
      if (notifsRes?.success && Array.isArray(notifsRes.notifications)) {
        setNotifications(notifsRes.notifications);
      }

      if (msgsRes?.success && Array.isArray(msgsRes.messages)) {
        const grouped = new Map<string, ChatAdvocateThread>();
        msgsRes.messages.forEach((m: any) => {
          const isCitizen =
            m.senderRole === "citizen" ||
            (!m.senderRole && m.recipientRole === "advocate");
          const advId = String(
            (isCitizen ? m.recipientId : m.senderId) || m.advocateId || ""
          ).trim();
          const advName = String(
            (isCitizen ? m.recipientName : m.senderName) || "Counsel"
          ).trim();
          const key = advId || advName.toLowerCase();
          if (!key) return;

          const dirMatch = directoryList.find(
            (d) =>
              (advId && d.id === advId) ||
              d.name.toLowerCase() === advName.toLowerCase()
          );

          const chatMsg: ChatMessage = {
            id: String(m.id || m._id || Math.random()),
            sender: isCitizen ? "citizen" : "advocate",
            text: String(m.content || ""),
            timestamp: m.createdAt
              ? new Date(m.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just now",
            status: m.isRead ? "read" : "delivered",
          };

          if (!grouped.has(key)) {
            const displayName = dirMatch?.name || advName;
            grouped.set(key, {
              id: advId || key,
              advocateId: advId || dirMatch?.id || "",
              matterId: String(m.matterId || ""),
              type: "direct",
              name: displayName,
              chamber: dirMatch?.chamber || "Privileged Counsel Chamber",
              court: dirMatch?.chamber || m.matterTitle || "Client Chamber Link",
              specialization: dirMatch?.specialization || "Legal Counsel",
              matter: m.matterTitle || dirMatch?.matterTitle || "General Legal Counsel",
              avatarText: getInitials(displayName),
              avatarBgColor: "bg-black text-white dark:bg-white dark:text-black",
              online: true,
              lastMessage: chatMsg.text,
              lastTime: chatMsg.timestamp,
              unreadCount: !isCitizen && !m.isRead ? 1 : 0,
              messages: [chatMsg],
            });
          } else {
            const existing = grouped.get(key)!;
            existing.messages.push(chatMsg);
            existing.lastMessage = chatMsg.text;
            existing.lastTime = chatMsg.timestamp;
            if (!isCitizen && !m.isRead) {
              existing.unreadCount += 1;
            }
          }
        });

        const threadList = Array.from(grouped.values());
        setChatThreads((prev) => {
          const existingKeys = new Set(threadList.map((t) => t.id));
          const pendingEmpty = prev.filter(
            (p) => !existingKeys.has(p.id) && p.messages.length === 0
          );
          return [...pendingEmpty, ...threadList];
        });
      }
    } catch (err) {
      console.warn("Failed to load citizen inbox:", err);
    } finally {
      setIsLoadingMails(false);
      setIsLoadingChats(false);
    }
  }, [authToken]);

  useEffect(() => {
    loadInboxData();
  }, [loadInboxData, inboxMode]);

  // Auto-scroll chat
  useEffect(() => {
    if (inboxMode === "messages") {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [inboxMode, selectedChatId, chatThreads]);

  // Filtered Mails
  const filteredEmails = useMemo(() => {
    return emails.filter((mail) => {
      const matchFolder =
        selectedFolder === "starred"
          ? mail.isStarred && mail.folder !== "trash"
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
    filteredEmails.find((e) => e.id === selectedEmailId) || filteredEmails[0];

  const unreadInboxCount = emails.filter((e) => !e.isRead && e.folder === "inbox").length;
  const draftsCount = emails.filter((e) => e.folder === "drafts").length;

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
    filteredChatThreads.find((c) => c.id === selectedChatId) ||
    filteredChatThreads[0] ||
    (chatSegment === "direct" ? chatThreads[0] : undefined);

  // Select email & mark read
  const handleSelectEmail = async (mail: LegalEmailItem) => {
    setSelectedEmailId(mail.id);
    if (!mail.isRead) {
      setEmails((prev) =>
        prev.map((m) => (m.id === mail.id ? { ...m, isRead: true } : m))
      );
      try {
        await citizenApi.updateMail(authToken, mail.id, { isRead: true });
      } catch (err) {
        console.warn("Failed to mark mail read:", err);
      }
    }
  };

  // Toggle star
  const handleToggleStar = async (emailId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = emails.find((m) => m.id === emailId);
    const nextStar = !target?.isStarred;
    setEmails((prev) =>
      prev.map((mail) =>
        mail.id === emailId ? { ...mail, isStarred: nextStar } : mail
      )
    );
    try {
      await citizenApi.updateMail(authToken, emailId, { isStarred: nextStar });
    } catch (err) {
      console.warn("Failed to update star status:", err);
    }
  };

  // Archive email
  const handleArchiveEmail = async (emailId: string) => {
    setEmails((prev) =>
      prev.map((mail) =>
        mail.id === emailId ? { ...mail, folder: "archive" as MailFolder } : mail
      )
    );
    try {
      await citizenApi.updateMail(authToken, emailId, { folder: "archive" });
    } catch (err) {
      console.warn("Failed to archive mail:", err);
    }
  };

  // Delete / Trash email
  const handleDeleteEmail = async (emailId: string) => {
    const target = emails.find((m) => m.id === emailId);
    const isAlreadyTrash = target?.folder === "trash";
    setEmails((prev) =>
      isAlreadyTrash
        ? prev.filter((mail) => mail.id !== emailId)
        : prev.map((mail) =>
            mail.id === emailId ? { ...mail, folder: "trash" as MailFolder } : mail
          )
    );
    try {
      await citizenApi.deleteMail(authToken, emailId);
    } catch (err) {
      console.warn("Failed to delete mail:", err);
    }
  };

  // Send quick reply in Mail
  const handleSendMailReply = async () => {
    if (!replyInput.trim() || !activeEmail || isSendingMail) return;
    setIsSendingMail(true);
    try {
      const res = await citizenApi.replyMail(authToken, activeEmail.id, replyInput.trim());
      if (res?.success && res.mail) {
        setEmails((prev) => prev.map((m) => (m.id === activeEmail.id ? res.mail : m)));
        setReplySuccess(true);
        setReplyInput("");
        setTimeout(() => setReplySuccess(false), 2500);
      }
    } catch (err) {
      console.warn("Failed to reply to mail:", err);
    } finally {
      setIsSendingMail(false);
    }
  };

  // Send new compose mail
  const handleSendCompose = async () => {
    if ((!composeRecipientId && !composeTo.trim()) || !composeSubject.trim() || !composeBody.trim() || isSendingMail) return;
    setIsSendingMail(true);
    try {
      const res = await citizenApi.sendMail(authToken, {
        recipientId: composeRecipientId,
        recipientName: composeTo.trim(),
        matterTitle: composeMatter.trim() || "Client Correspondence",
        subject: composeSubject.trim(),
        body: composeBody.trim(),
        category: "work",
        categoryLabel: "Client Instruction",
        categoryColor: "sky",
      });
      if (res?.success && res.mail) {
        setEmails((prev) => [res.mail, ...prev]);
        setSelectedFolder("sent");
        setSelectedEmailId(res.mail.id);
      }
      setComposeModalOpen(false);
      setComposeSubject("");
      setComposeBody("");
      setComposeMatter("");
    } catch (err) {
      console.warn("Failed to transmit mail:", err);
    } finally {
      setIsSendingMail(false);
    }
  };

  // Select chat thread & mark incoming messages read
  const handleSelectChatThread = async (thread: ChatAdvocateThread) => {
    setSelectedChatId(thread.id);
    if (thread.unreadCount > 0) {
      const unreadIds = thread.messages
        .filter((m) => m.sender === "advocate" && m.status !== "read")
        .map((m) => m.id);
      setChatThreads((prev) =>
        prev.map((t) =>
          t.id === thread.id
            ? {
                ...t,
                unreadCount: 0,
                messages: t.messages.map((m) =>
                  m.sender === "advocate" ? { ...m, status: "read" } : m
                ),
              }
            : t
        )
      );
      await Promise.all(
        unreadIds.map((id) => citizenApi.markMessageAsRead(authToken, id).catch(() => null))
      );
    }
  };

  // Start discussion with selected advocate
  const handleStartAdvocateDiscussion = (opt: AdvocateOption) => {
    const targetKey = opt.id || opt.name.toLowerCase();
    const existing = chatThreads.find(
      (t) =>
        (opt.id && (t.id === opt.id || t.advocateId === opt.id)) ||
        t.name.toLowerCase() === opt.name.toLowerCase()
    );
    if (existing) {
      setChatSegment("direct");
      handleSelectChatThread(existing);
    } else {
      const newThread: ChatAdvocateThread = {
        id: opt.id || targetKey,
        advocateId: opt.id,
        type: "direct",
        name: opt.name,
        chamber: opt.chamber || "Advocate Chamber",
        court: opt.chamber || "Privileged Chamber Channel",
        specialization: opt.specialization || "Legal Counsel",
        matter: opt.matterTitle || "General Legal Counsel",
        avatarText: getInitials(opt.name),
        avatarBgColor: "bg-black text-white dark:bg-white dark:text-black",
        online: true,
        lastMessage: "Start a privileged discussion...",
        lastTime: "",
        unreadCount: 0,
        messages: [],
      };
      setChatSegment("direct");
      setChatThreads((prev) => [newThread, ...prev]);
      setSelectedChatId(newThread.id);
    }
    setNewDiscussionOpen(false);
  };

  // Send Instant Chat Message
  const handleSendChatMessage = async () => {
    if (!chatInputText.trim() || !activeChatThread || isSendingChat) return;
    const text = chatInputText.trim();
    const targetThreadId = activeChatThread.id;
    const tempId = "c-msg-" + Date.now();
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg: ChatMessage = {
      id: tempId,
      sender: "citizen",
      text,
      timestamp: nowTime,
      status: "sent",
    };

    setChatThreads((prev) =>
      prev.map((thread) =>
        thread.id === targetThreadId
          ? {
              ...thread,
              lastMessage: newMsg.text,
              lastTime: newMsg.timestamp,
              messages: [...thread.messages, newMsg],
            }
          : thread
      )
    );
    setChatInputText("");
    setIsSendingChat(true);

    try {
      const res = await citizenApi.sendCitizenMessage(authToken, {
        content: text,
        recipientId: activeChatThread.advocateId || (activeChatThread.id.startsWith("adv_") || !activeChatThread.id.includes(" ") ? activeChatThread.id : ""),
        recipientName: activeChatThread.name,
        matterId: activeChatThread.matterId || "",
        matterTitle: activeChatThread.matter || "General Legal Counsel",
      });
      if (res?.success && res.messageData) {
        const savedId = String(res.messageData.id || res.messageData._id || tempId);
        setChatThreads((prev) =>
          prev.map((thread) =>
            thread.id === targetThreadId
              ? {
                  ...thread,
                  messages: thread.messages.map((m) =>
                    m.id === tempId ? { ...m, id: savedId, status: "delivered" } : m
                  ),
                }
              : thread
          )
        );
      }
    } catch (err) {
      console.warn("Failed to send message to advocate:", err);
    } finally {
      setIsSendingChat(false);
    }
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
                {unreadInboxCount}
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

      {statusNotice && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
          <span>{statusNotice}</span>
          <button
            type="button"
            onClick={() => setStatusNotice("")}
            className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
                  { id: "inbox" as MailFolder, label: "Inbox", icon: InboxIcon, badge: unreadInboxCount > 0 ? unreadInboxCount : undefined, badgeColor: "bg-black text-white dark:bg-white dark:text-black" },
                  { id: "starred" as MailFolder, label: "Starred", icon: Star },
                  { id: "drafts" as MailFolder, label: "Drafts", icon: FileEdit, badge: draftsCount > 0 ? draftsCount : undefined, badgeColor: "bg-amber-500 text-white" },
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
                    onClick={() => handleSelectEmail(mail)}
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
                  {isLoadingMails
                    ? "Syncing secure correspondence..."
                    : "No mails in this folder yet."}
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
                      onClick={() => handleArchiveEmail(activeEmail.id)}
                      title="Archive"
                      className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Navigation / Count */}
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                    <span>
                      {filteredEmails.findIndex((e) => e.id === activeEmail.id) + 1} of {filteredEmails.length}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          const idx = filteredEmails.findIndex((e) => e.id === activeEmail.id);
                          if (idx > 0) handleSelectEmail(filteredEmails[idx - 1]);
                        }}
                        className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const idx = filteredEmails.findIndex((e) => e.id === activeEmail.id);
                          if (idx < filteredEmails.length - 1) handleSelectEmail(filteredEmails[idx + 1]);
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
                              onClick={() => setStatusNotice(`Downloading attached document: ${att.name}`)}
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
                            disabled={!replyInput.trim() || isSendingMail}
                            className="px-4 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs disabled:opacity-40 cursor-pointer hover:opacity-90 flex items-center gap-1.5"
                          >
                            <Send className="w-3 h-3" />
                            <span>{isSendingMail ? "Sending..." : "Reply"}</span>
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
                    onClick={() => {
                      setComposeSubject(`Fwd: ${activeEmail.subject}`);
                      setComposeMatter(activeEmail.matterTitle || "");
                      setComposeBody((activeEmail.body || []).join("\n\n"));
                      setComposeModalOpen(true);
                    }}
                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    title="Forward"
                  >
                    <CornerUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center text-xs text-zinc-400">
                {emails.length === 0
                  ? "No correspondence yet. Click 'New Message' to contact an assigned or registered advocate."
                  : "Select an email to view its privileged contents."}
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
                  onClick={() => setNewDiscussionOpen(true)}
                  className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="New Discussion"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Discussions List */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900 px-3 py-2">
              {filteredChatThreads.map((thread) => {
                const isSelected = activeChatThread?.id === thread.id;
                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectChatThread(thread)}
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
                          thread.avatarBgColor || "bg-black text-white dark:bg-white dark:text-black"
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

                    {thread.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#6B1728] text-white shrink-0">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })}

              {filteredChatThreads.length === 0 && (
                <div className="p-8 text-center text-xs text-zinc-400 space-y-3">
                  <p>
                    {isLoadingChats
                      ? "Loading encrypted threads..."
                      : chatSearchQuery
                      ? `No discussions found matching "${chatSearchQuery}".`
                      : chatSegment === "group"
                      ? "No group panels joined yet."
                      : "No counsel discussions yet."}
                  </p>
                  {!isLoadingChats && !chatSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setNewDiscussionOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold cursor-pointer hover:opacity-90"
                    >
                      Start Counsel Chat
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* -------------------------------------------------------------
              COLUMN 2: Right Main Chat Conversation Pane
          ------------------------------------------------------------- */}
          <div className="flex-1 flex flex-col justify-between bg-white dark:bg-black min-w-0">
            {activeChatThread ? (
              <>
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-black">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full ${
                        activeChatThread.avatarBgColor || "bg-black text-white dark:bg-white dark:text-black"
                      } font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                    >
                      {activeChatThread.avatarText}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-black dark:text-white truncate">
                        {activeChatThread.name}
                      </h4>
                      <span className="text-xs text-zinc-400 truncate block">
                        {activeChatThread.court || activeChatThread.chamber || activeChatThread.matter}
                      </span>
                    </div>
                  </div>

                  {/* Action Icons: Video, Phone, Members */}
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
                      onClick={() => setStatusNotice(`Secure audio channel ready with ${activeChatThread.name}.`)}
                      className="p-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      title="Voice Call"
                    >
                      <Phone className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setStatusNotice(
                          `${activeChatThread.name} • ${activeChatThread.specialization} • Matter: ${activeChatThread.matter}`
                        )
                      }
                      className="p-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      title="Members"
                    >
                      <Users className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                  {activeChatThread.messages.length === 0 && (
                    <div className="p-8 text-center text-xs text-zinc-400">
                      Send your first encrypted instruction to {activeChatThread.name}.
                    </div>
                  )}
                  {activeChatThread.messages.map((msg) => {
                    const isCitizen = msg.sender === "citizen";
                    return (
                      <div key={msg.id} className="space-y-1">
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
                          {!isCitizen && (
                            <div
                              className={`w-8 h-8 rounded-full ${
                                activeChatThread.avatarBgColor || "bg-black text-white dark:bg-white dark:text-black"
                              } font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs mb-1`}
                            >
                              {activeChatThread.avatarText}
                            </div>
                          )}

                          <div
                            className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 text-xs shadow-2xs leading-relaxed ${
                              isCitizen
                                ? "bg-[#6B1728] text-white font-medium"
                                : "bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-transparent dark:border-zinc-800/80"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>

                          {isCitizen && (
                            <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-bold text-[11px] flex items-center justify-center shrink-0 mb-1 shadow-2xs">
                              {citizenInitials}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatMessagesEndRef} />
                </div>

                {/* Bottom Input Container */}
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
                      disabled={!chatInputText.trim() || isSendingChat}
                      className="text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                      title="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
                <MessageSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                <p className="text-xs text-zinc-500 max-w-sm">
                  No active advocate discussion selected. Select a conversation or start a direct encrypted message with an advocate.
                </p>
                <button
                  type="button"
                  onClick={() => setNewDiscussionOpen(true)}
                  className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer hover:opacity-90"
                >
                  Start New Discussion
                </button>
              </div>
            )}
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
                onClick={async () => {
                  const ids = notifications.map((n) => n.id);
                  setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                  if (ids.length) {
                    await citizenApi.markAllNotificationsRead(authToken, ids).catch(() => null);
                  }
                }}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-black dark:text-white cursor-pointer transition-colors"
              >
                Mark all as read
              </button>
              <button
                type="button"
                onClick={async () => {
                  const ids = notifications.map((n) => n.id);
                  setNotifications([]);
                  if (ids.length) {
                    await citizenApi.clearAllNotifications(authToken, ids).catch(() => null);
                  }
                }}
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
                    {/* Left vertical color stripe matching reference */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 ${typeConfig.stripe}`} />

                    {/* Soft gradient wash from left matching reference */}
                    <div className={`absolute inset-0 pointer-events-none bg-gradient-to-r ${typeConfig.gradient} to-transparent`} />

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
                        onClick={async () => {
                          setNotifications((prev) =>
                            prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
                          );
                          await citizenApi.markNotificationRead(authToken, notif.id).catch(() => null);
                          if (notif.category === "hearings" && onOpenConsultationModal) {
                            onOpenConsultationModal();
                          } else {
                            setStatusNotice(`${notif.title}: ${notif.summary}`);
                          }
                        }}
                        className={`text-xs font-semibold ${typeConfig.textAccent} hover:underline cursor-pointer transition-colors`}
                      >
                        {notif.actionLabel || "View"}
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
                          await citizenApi.dismissNotification(authToken, notif.id).catch(() => null);
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
              {counselOptions.length > 0 && (
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500 block">Select Counsel:</label>
                  <select
                    value={composeRecipientId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setComposeRecipientId(val);
                      const matched = counselOptions.find((o) => (o.id || o.name) === val);
                      if (matched) {
                        setComposeTo(matched.name);
                        if (!composeMatter && matched.matterTitle) {
                          setComposeMatter(matched.matterTitle);
                        }
                      }
                    }}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none"
                  >
                    <option value="">-- Choose your assigned or registered advocate --</option>
                    {counselOptions.map((adv) => (
                      <option key={adv.id || adv.name} value={adv.id || adv.name}>
                        {adv.name} ({adv.specialization})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-zinc-500 block">Recipient Name / Email:</label>
                <input
                  type="text"
                  placeholder="Select above or type advocate name"
                  value={composeTo}
                  onChange={(e) => {
                    setComposeTo(e.target.value);
                    if (!e.target.value.trim()) setComposeRecipientId("");
                  }}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-500 block">Matter / Reference (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Case title or consultation topic"
                  value={composeMatter}
                  onChange={(e) => setComposeMatter(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-500 block">Subject Line:</label>
                <input
                  type="text"
                  placeholder="Enter message subject"
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
                Protected by Advocate-Client Privilege {citizenEmail ? `• ${citizenEmail}` : ""}
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
                  disabled={(!composeRecipientId && !composeTo.trim()) || !composeSubject.trim() || !composeBody.trim() || isSendingMail}
                  className="px-5 py-2 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-40 font-bold text-xs text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black cursor-pointer transition-all shadow-xs"
                >
                  {isSendingMail ? "Transmitting..." : "Transmit Mail"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {newDiscussionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-black dark:text-white">
                Start Privileged Advocate Discussion
              </h3>
              <button
                type="button"
                onClick={() => setNewDiscussionOpen(false)}
                className="p-1 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {counselOptions.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 space-y-2">
                <p>No registered advocates available yet.</p>
                <p className="text-[11px] text-zinc-400">
                  File a legal petition or book a consultation with an advocate to message them directly.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {counselOptions.map((adv) => (
                  <button
                    key={adv.id || adv.name}
                    type="button"
                    onClick={() => handleStartAdvocateDiscussion(adv)}
                    className="w-full text-left p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white flex items-center justify-between gap-3 transition-all cursor-pointer"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-black dark:text-white block truncate">
                        {adv.name}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono block truncate">
                        {adv.matterTitle || adv.specialization}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
