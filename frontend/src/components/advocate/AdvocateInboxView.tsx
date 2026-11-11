"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { advocateApi, AdvocateNotificationItem, AdvocateClientItem } from "@/lib/api";
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
  citizenId?: string;
  matterId?: string;
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

export type ChamberNotificationItem = AdvocateNotificationItem;

const getInitials = (name: string) =>
  String(name || "CL")
    .replace(/^adv\.?\s*/i, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] || "")
    .join("")
    .toUpperCase() || "CL";

interface AdvocateInboxViewProps {
  token?: string;
  advocateName?: string;
  advocateEmail?: string;
  initialMode?: InboxMode;
  onOpenConsultation?: () => void;
  onNavigateTab?: (tab: string) => void;
  onNotificationsChange?: (notifications: ChamberNotificationItem[]) => void;
}

export const AdvocateInboxView: React.FC<AdvocateInboxViewProps> = ({
  token,
  advocateName = "Advocate",
  advocateEmail = "",
  initialMode = "mails",
  onOpenConsultation,
  onNavigateTab,
  onNotificationsChange,
}) => {
  const [inboxMode, setInboxMode] = useState<InboxMode>(initialMode);

  useEffect(() => {
    setInboxMode(initialMode);
  }, [initialMode]);

  // ==========================================
  // MODE 1: MAIL BOX STATE
  // ==========================================
  const [emails, setEmails] = useState<ChamberEmailItem[]>([]);
  const [isLoadingMails, setIsLoadingMails] = useState<boolean>(false);
  const [selectedFolder, setSelectedFolder] = useState<MailFolder>("inbox");
  const [selectedMailCategory, setSelectedMailCategory] = useState<ChamberMailCategory>("all");
  const [selectedEmailId, setSelectedEmailId] = useState<string>("");
  const [mailSearchQuery, setMailSearchQuery] = useState("");
  const [replyInput, setReplyInput] = useState("");
  const [replySuccess, setReplySuccess] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [composeRecipientId, setComposeRecipientId] = useState("");
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeMatter, setComposeMatter] = useState("");
  const [composeBody, setComposeBody] = useState("");

  // ==========================================
  // MODE 2: INSTANT MESSAGES STATE
  // ==========================================
  const [chatThreads, setChatThreads] = useState<AdvocateChatThread[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState<boolean>(false);
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [chatSegment, setChatSegment] = useState<"all" | "direct" | "group">("all");
  const [chatInputText, setChatInputText] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isWsConnected] = useState<boolean>(true);
  const [clients, setClients] = useState<AdvocateClientItem[]>([]);
  const [newDiscussionOpen, setNewDiscussionOpen] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string>("");
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // MODE 3: NOTIFICATIONS STATE
  // ==========================================
  const [notifications, setNotifications] = useState<ChamberNotificationItem[]>([]);
  const [selectedNotifFilter, setSelectedNotifFilter] = useState<string>("all");
  const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(false);

  const loadNotifications = useCallback(async () => {
    setIsLoadingNotifications(true);
    try {
      const res = await advocateApi.getNotifications(token);
      if (res?.success && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
        onNotificationsChange?.(res.notifications);
      }
    } catch (err) {
      console.warn("Failed to load advocate notifications:", err);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [token, onNotificationsChange]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications, inboxMode]);

  const handleMarkNotifRead = async (id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      onNotificationsChange?.(next);
      return next;
    });
    try {
      await advocateApi.markNotificationRead(id, token);
    } catch {}
  };

  const handleMarkAllNotifsRead = async () => {
    const ids = notifications.map((n) => n.id);
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, isRead: true }));
      onNotificationsChange?.(next);
      return next;
    });
    try {
      await advocateApi.markAllNotificationsRead(ids, token);
    } catch {}
  };

  const handleDismissNotif = async (id: string) => {
    setNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id);
      onNotificationsChange?.(next);
      return next;
    });
    try {
      await advocateApi.dismissNotification(id, token);
    } catch {}
  };

  const handleClearAllNotifs = async () => {
    const ids = notifications.map((n) => n.id);
    setNotifications([]);
    onNotificationsChange?.([]);
    try {
      await advocateApi.clearAllNotifications(ids, token);
    } catch {}
  };

  const handleNotifAction = (notif: ChamberNotificationItem) => {
    if (!notif.isRead) handleMarkNotifRead(notif.id);
    if (notif.targetTab && onNavigateTab) {
      onNavigateTab(notif.targetTab);
    } else if (notif.targetTab === "appointments" && onOpenConsultation) {
      onOpenConsultation();
    }
  };

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

  const loadMails = useCallback(async () => {
    setIsLoadingMails(true);
    try {
      const res = await advocateApi.getMails(token);
      if (res?.success && Array.isArray(res.mails)) {
        setEmails(res.mails);
      }
    } catch (err) {
      console.warn("Failed to load chamber mails:", err);
    } finally {
      setIsLoadingMails(false);
    }
  }, [token]);

  const loadChatThreads = useCallback(async () => {
    setIsLoadingChats(true);
    try {
      const [msgRes, clientRes] = await Promise.all([
        advocateApi.getAdvocateMessages(token),
        advocateApi.getClients(token),
      ]);
      if (clientRes?.success && Array.isArray(clientRes.clients)) {
        setClients(clientRes.clients);
      }
      if (msgRes?.success && Array.isArray(msgRes.threads)) {
        const mapped: AdvocateChatThread[] = msgRes.threads.map((t: any) => {
          const msgs: ChatMessage[] = (Array.isArray(t.messages) ? t.messages : [])
            .slice()
            .sort(
              (a: any, b: any) =>
                new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
            )
            .map((m: any) => ({
              id: String(m.id || m._id || Math.random()),
              sender: m.senderRole === "advocate" ? "advocate" : "client",
              senderName:
                m.senderRole === "advocate" ? undefined : m.senderName || t.citizenName,
              text: String(m.content || ""),
              timestamp: m.createdAt
                ? new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now",
              status: m.isRead ? "read" : "delivered",
            }));
          const last = t.lastMessage || msgs[msgs.length - 1];
          const displayName = t.citizenName || "Registered Client";
          return {
            id: String(t.citizenId || ""),
            citizenId: String(t.citizenId || ""),
            matterId: String(t.matterId || ""),
            type: "direct",
            name: displayName,
            role: t.citizenEmail ? `Client • ${t.citizenEmail}` : "Client",
            matter: t.matterTitle || "Direct Counsel Communication",
            avatarText: getInitials(displayName),
            online: true,
            lastMessage: String(last?.content || last?.text || ""),
            lastTime: last?.createdAt
              ? new Date(last.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : last?.timestamp || "",
            unreadCount: Number(t.unreadCount || 0),
            messages: msgs,
          };
        });
        setChatThreads((prev) => {
          const existingIds = new Set(mapped.map((m) => m.id));
          const pendingEmpty = prev.filter(
            (p) => !existingIds.has(p.id) && p.messages.length === 0
          );
          return [...pendingEmpty, ...mapped];
        });
      }
    } catch (err) {
      console.warn("Failed to load chamber chats:", err);
    } finally {
      setIsLoadingChats(false);
    }
  }, [token]);

  useEffect(() => {
    loadMails();
    loadChatThreads();
  }, [loadMails, loadChatThreads, inboxMode]);

  // ==========================================
  // COMPUTED MAIL DATA
  // ==========================================
  const filteredEmails = useMemo(() => {
    return emails.filter((mail) => {
      const matchFolder =
        selectedFolder === "starred"
          ? mail.isStarred && mail.folder !== "trash"
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
    filteredEmails.find((e) => e.id === selectedEmailId) || filteredEmails[0];

  const unreadMailCount = emails.filter((e) => !e.isRead && e.folder === "inbox").length;
  const unreadChatCount = chatThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  // Select Email & Mark Read
  const handleSelectEmail = async (mail: ChamberEmailItem) => {
    setSelectedEmailId(mail.id);
    if (!mail.isRead) {
      setEmails((prev) =>
        prev.map((m) => (m.id === mail.id ? { ...m, isRead: true } : m))
      );
      try {
        await advocateApi.updateMail(mail.id, { isRead: true }, token);
      } catch (err) {
        console.warn("Failed to mark mail read:", err);
      }
    }
  };

  // Toggle Star
  const handleToggleStar = async (emailId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = emails.find((m) => m.id === emailId);
    const nextStar = !target?.isStarred;
    setEmails((prev) =>
      prev.map((m) => (m.id === emailId ? { ...m, isStarred: nextStar } : m))
    );
    try {
      await advocateApi.updateMail(emailId, { isStarred: nextStar }, token);
    } catch (err) {
      console.warn("Failed to toggle mail star:", err);
    }
  };

  // Trash / Delete Email
  const handleDeleteEmail = async (emailId: string) => {
    const target = emails.find((m) => m.id === emailId);
    const isAlreadyTrash = target?.folder === "trash";
    setEmails((prev) =>
      isAlreadyTrash
        ? prev.filter((m) => m.id !== emailId)
        : prev.map((m) => (m.id === emailId ? { ...m, folder: "trash" as MailFolder } : m))
    );
    try {
      await advocateApi.deleteMail(emailId, token);
    } catch (err) {
      console.warn("Failed to delete mail:", err);
    }
  };

  // Send Quick Reply
  const handleSendMailReply = async () => {
    if (!replyInput.trim() || !activeEmail || isSendingMail) return;
    const text = replyInput.trim();
    setIsSendingMail(true);
    try {
      const res = await advocateApi.replyMail(activeEmail.id, text, token);
      if (res?.success && res.mail) {
        setEmails((prev) => prev.map((m) => (m.id === activeEmail.id ? res.mail : m)));
        setReplySuccess(true);
        setReplyInput("");
        setTimeout(() => setReplySuccess(false), 2500);
      }
    } catch (err) {
      console.warn("Failed to send mail reply:", err);
    } finally {
      setIsSendingMail(false);
    }
  };

  // Send New Composed Email
  const handleSendComposedEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || isSendingMail) return;
    setIsSendingMail(true);
    try {
      const res = await advocateApi.sendMail(
        {
          recipientId: composeRecipientId,
          recipientName: composeTo.trim(),
          recipientEmail: composeTo.includes("@") ? composeTo.trim() : "",
          matterTitle: composeMatter.trim() || "General Chamber Brief",
          subject: composeSubject.trim(),
          body: composeBody.trim(),
          category: "client",
          categoryLabel: "Chamber Notice",
        },
        token
      );
      if (res?.success && res.mail) {
        setEmails((prev) => [res.mail, ...prev]);
        setSelectedFolder("sent");
        setSelectedEmailId(res.mail.id);
      }
      setComposeModalOpen(false);
      setComposeRecipientId("");
      setComposeTo("");
      setComposeSubject("");
      setComposeMatter("");
      setComposeBody("");
    } catch (err) {
      console.warn("Failed to dispatch chamber mail:", err);
    } finally {
      setIsSendingMail(false);
    }
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
    filteredChatThreads.find((t) => t.id === selectedChatId) ||
    chatThreads.find((t) => t.id === selectedChatId) ||
    filteredChatThreads[0] ||
    chatThreads[0];

  const handleSelectThread = async (thread: AdvocateChatThread) => {
    setSelectedChatId(thread.id);
    if (thread.unreadCount > 0 && (thread.citizenId || thread.id)) {
      const targetCitizenId = thread.citizenId || thread.id;
      setChatThreads((prev) =>
        prev.map((t) =>
          t.id === thread.id
            ? {
                ...t,
                unreadCount: 0,
                messages: t.messages.map((m) =>
                  m.sender === "client" ? { ...m, status: "read" } : m
                ),
              }
            : t
        )
      );
      try {
        await advocateApi.markAdvocateMessagesRead(targetCitizenId, token);
      } catch (err) {
        console.warn("Failed to mark thread read:", err);
      }
    }
  };

  const handleStartClientDiscussion = (client: AdvocateClientItem) => {
    const targetId = String(client.citizenId || client._id || "");
    if (!targetId) return;
    const existing = chatThreads.find((t) => t.id === targetId || t.citizenId === targetId);
    if (existing) {
      handleSelectThread(existing);
    } else {
      const created: AdvocateChatThread = {
        id: targetId,
        citizenId: targetId,
        type: "direct",
        name: client.fullName,
        role: client.email ? `Client • ${client.email}` : "Client",
        matter: client.activeMatters?.[0] || "Direct Counsel Communication",
        avatarText: getInitials(client.fullName),
        online: true,
        lastMessage: "Start a privileged consultation message...",
        lastTime: "",
        unreadCount: 0,
        messages: [],
      };
      setChatThreads((prev) => [created, ...prev]);
      setSelectedChatId(created.id);
    }
    setNewDiscussionOpen(false);
  };

  // Send Instant Message
  const handleSendChatMessage = async () => {
    if (!chatInputText.trim() || !activeChatThread || isSendingChat) return;
    const text = chatInputText.trim();
    const targetThreadId = activeChatThread.id;
    const targetCitizenId = activeChatThread.citizenId || activeChatThread.id;
    const tempId = "msg-" + Date.now();
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg: ChatMessage = {
      id: tempId,
      sender: "advocate",
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
      const res = await advocateApi.sendAdvocateMessage(
        {
          recipientId: targetCitizenId,
          recipientName: activeChatThread.name,
          matterId: activeChatThread.matterId || "",
          matterTitle: activeChatThread.matter || "Direct Counsel Communication",
          content: text,
        },
        token
      );
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
      console.warn("Failed to send advocate chat message:", err);
    } finally {
      setIsSendingChat(false);
    }
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
              Chamber Activity &amp; Client Feed
            </span>
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
                { id: "starred", label: "Starred Notices", icon: Star, count: emails.filter((e) => e.isStarred && e.folder !== "trash").length },
                { id: "drafts", label: "Draft Pleadings", icon: FileText, count: emails.filter((e) => e.folder === "drafts").length },
                { id: "sent", label: "Dispatched Mails", icon: Send, count: emails.filter((e) => e.folder === "sent").length },
                { id: "archive", label: "Closed Briefs", icon: Archive, count: emails.filter((e) => e.folder === "archive").length },
                { id: "trash", label: "Trash", icon: Trash2, count: emails.filter((e) => e.folder === "trash").length },
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
                    onClick={() => handleSelectEmail(mail)}
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

              {filteredEmails.length === 0 && !isLoadingMails && (
                <div className="p-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  No correspondence in this folder yet.
                </div>
              )}
              {isLoadingMails && filteredEmails.length === 0 && (
                <div className="p-8 text-center text-xs text-zinc-400">
                  Syncing chamber mailbox...
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
                            onClick={() => setStatusNotice(`Downloading attached document: ${att.name}`)}
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
                {emails.length === 0
                  ? "No mails in your chamber inbox yet. Click 'Compose Legal Notice' to send formal correspondence."
                  : "Select an email to view full briefing."}
              </div>
            )}

            {/* Quick Reply Form */}
            {activeEmail && (
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    placeholder="Type quick reply..."
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendMailReply}
                    disabled={!replyInput.trim() || isSendingMail}
                    className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer hover:opacity-90 disabled:opacity-40"
                  >
                    {isSendingMail ? "Sending..." : "Send"}
                  </button>
                </div>
                {replySuccess && (
                  <span className="text-[11px] font-mono text-emerald-600 block">
                    ✓ Reply dispatched via chamber mail server.
                  </span>
                )}
              </div>
            )}
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
                  onClick={() => setNewDiscussionOpen(true)}
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
                      onClick={() => handleSelectThread(thread)}
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

                {filteredChatThreads.length === 0 && (
                  <div className="p-6 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
                    <p>{isLoadingChats ? "Loading client threads..." : "No client discussions yet."}</p>
                    {!isLoadingChats && (
                      <button
                        type="button"
                        onClick={() => setNewDiscussionOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold cursor-pointer hover:opacity-90"
                      >
                        Start Client Chat
                      </button>
                    )}
                  </div>
                )}
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
                      onClick={() => {
                        if (onNavigateTab) {
                          onNavigateTab("video-meet");
                        } else {
                          setStatusNotice(`Video consultation session ready for ${activeChatThread.name}.`);
                        }
                      }}
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
                      onClick={() => onNavigateTab?.("documents")}
                      className="p-1.5 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                      title="Open Case Documents"
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
                Real-time client interest leads, divorce &amp; civil petitions, consultation requests, filed pleadings, and chamber alerts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadNotifications}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-black dark:text-white cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNotifications ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={handleMarkAllNotifsRead}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-black dark:text-white cursor-pointer transition-colors"
              >
                Mark all as read
              </button>
              <button
                type="button"
                onClick={handleClearAllNotifs}
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
              {
                id: "client_interest",
                label: "Client Interest",
                count: notifications.filter((n) => n.category === "client_interest").length,
              },
              {
                id: "filings",
                label: "Client & Registry Filings",
                count: notifications.filter((n) => n.category === "filings").length,
              },
              {
                id: "causelist",
                label: "Causelist Calls",
                count: notifications.filter((n) => n.category === "causelist").length,
              },
              {
                id: "notices",
                label: "Deadlines & Orders",
                count: notifications.filter((n) => n.category === "notices" || n.category === "orders").length,
              },
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

          {/* Notifications Horizontal Strip List */}
          <div className="space-y-2.5">
            {notifications
              .filter((n) => {
                if (selectedNotifFilter === "all") return true;
                if (selectedNotifFilter === "notices") {
                  return n.category === "notices" || n.category === "orders";
                }
                return n.category === selectedNotifFilter;
              })
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
                    onClick={() => {
                      if (!notif.isRead) handleMarkNotifRead(notif.id);
                    }}
                    className={`relative overflow-hidden flex items-center justify-between gap-3 px-4 py-3 sm:py-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs transition-all hover:shadow-xs cursor-pointer ${
                      notif.isRead ? "opacity-70" : ""
                    }`}
                  >
                    {/* Left vertical color stripe in burgundy */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 ${typeConfig.stripe}`} />

                    {/* Soft burgundy gradient wash */}
                    <div
                      className={`absolute inset-0 pointer-events-none bg-gradient-to-r ${typeConfig.gradient} to-transparent`}
                    />

                    {/* Content: Icon + Title + Description */}
                    <div className="relative flex items-start sm:items-center gap-3 min-w-0 flex-1 pl-1">
                      {typeConfig.icon}

                      <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 shrink-0">
                          {!notif.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6B1728] shrink-0" />
                          )}
                          <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[9px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                            {notif.categoryLabel || "Alert"}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-black dark:text-white">
                            {notif.title}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate font-normal">
                          {notif.summary}
                        </span>
                        {notif.caseRef && (
                          <span className="hidden md:inline-block text-[10px] font-mono font-semibold text-zinc-400 shrink-0">
                            ({notif.caseRef})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side: Timestamp + Action link + Dismiss button */}
                    <div className="relative flex items-center gap-3 shrink-0 ml-2">
                      {notif.timestamp && (
                        <span className="hidden sm:inline text-[10px] font-mono text-zinc-400">
                          {notif.timestamp}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotifAction(notif);
                        }}
                        className={`text-xs font-semibold ${typeConfig.textAccent} hover:underline cursor-pointer transition-colors`}
                      >
                        {notif.actionLabel || "Open"}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismissNotif(notif.id);
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

            {!isLoadingNotifications &&
              notifications.filter((n) => {
                if (selectedNotifFilter === "all") return true;
                if (selectedNotifFilter === "notices") {
                  return n.category === "notices" || n.category === "orders";
                }
                return n.category === selectedNotifFilter;
              }).length === 0 && (
                <div className="p-12 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  No notifications found in this category. New client inquiries, petitions, consultations, and filings will appear here automatically.
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
              {clients.length > 0 && (
                <div>
                  <label className="font-bold block mb-1 text-black dark:text-white">
                    Select Client from Chamber Roster (Optional)
                  </label>
                  <select
                    value={composeRecipientId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setComposeRecipientId(val);
                      const picked = clients.find(
                        (c) => String(c.citizenId || c._id) === val
                      );
                      if (picked) {
                        setComposeTo(picked.fullName);
                        if (!composeMatter && picked.activeMatters?.[0]) {
                          setComposeMatter(picked.activeMatters[0]);
                        }
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white focus:outline-none"
                  >
                    <option value="">-- Enter recipient manually or select client --</option>
                    {clients.map((c) => (
                      <option key={c._id} value={String(c.citizenId || c._id)}>
                        {c.fullName} {c.email ? `(${c.email})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold block mb-1 text-black dark:text-white">
                  Recipient (Client / Counsel / Registry)
                </label>
                <input
                  type="text"
                  required
                  value={composeTo}
                  onChange={(e) => {
                    setComposeTo(e.target.value);
                    if (!e.target.value.trim()) setComposeRecipientId("");
                  }}
                  placeholder="Enter client name or email address"
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
                  placeholder="e.g. Suit / Petition title or docket reference"
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
                  placeholder="Enter formal communication subject"
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
                  disabled={isSendingMail}
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 cursor-pointer shadow-2xs disabled:opacity-40"
                >
                  {isSendingMail ? "Dispatching..." : "Dispatch Formal Brief"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {newDiscussionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-black dark:text-white">
                Start Privileged Client Discussion
              </h3>
              <button
                type="button"
                onClick={() => setNewDiscussionOpen(false)}
                className="p-1 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {clients.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 space-y-2">
                <p>No active clients found in your chamber yet.</p>
                <p className="text-[11px] text-zinc-400">
                  Once a citizen engages you or you add a client in the Clients section, you can message them directly here.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {clients.map((client) => (
                  <button
                    key={client._id}
                    type="button"
                    onClick={() => handleStartClientDiscussion(client)}
                    className="w-full text-left p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white flex items-center justify-between gap-3 transition-all cursor-pointer"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-black dark:text-white block truncate">
                        {client.fullName}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono block truncate">
                        {client.activeMatters?.[0] || client.email || "Direct Counsel"}
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
};
