"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

export interface MessageAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
}

export interface AdvocateMessageItem {
  _id: string;
  id?: string;
  senderId: string;
  senderRole: "citizen" | "advocate" | "system";
  senderName: string;
  recipientId: string;
  recipientRole: "citizen" | "advocate" | "system";
  recipientName: string;
  matterId?: string;
  matterTitle?: string;
  content: string;
  attachments?: MessageAttachment[];
  isRead: boolean;
  readAt?: string;
  isPrivileged: boolean;
  category?: "general" | "hearing_update" | "document_request" | "urgent";
  createdAt: string;
}

export interface ClientThread {
  citizenId: string;
  citizenName: string;
  matterId?: string;
  matterTitle?: string;
  messages: AdvocateMessageItem[];
  lastMessage: AdvocateMessageItem;
  unreadCount: number;
}

interface AdvocateInboxViewProps {
  token?: string;
  advocateName?: string;
  onOpenConsultation?: () => void;
}

export const AdvocateInboxView: React.FC<AdvocateInboxViewProps> = ({
  token,
  advocateName = "Adv. Meera Krishnan",
  onOpenConsultation,
}) => {
  const [threads, setThreads] = useState<ClientThread[]>([]);
  const [activeCitizenId, setActiveCitizenId] = useState<string>("default_citizen");
  const [activeMessages, setActiveMessages] = useState<AdvocateMessageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Composer State
  const [inputContent, setInputContent] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [messageCategory, setMessageCategory] = useState<"general" | "hearing_update" | "document_request" | "urgent">("general");
  const [attachedFiles, setAttachedFiles] = useState<MessageAttachment[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // WebSocket Live Sync State
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [isClientTyping, setIsClientTyping] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of message list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load All Threads
  const loadThreadsAndActiveConversation = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await advocateApi.getAdvocateMessages(token);
      if (res && res.success && Array.isArray(res.threads)) {
        setThreads(res.threads);

        const targetId = activeCitizenId || (res.threads[0]?.citizenId || "default_citizen");
        if (targetId) {
          const threadRes = await advocateApi.getAdvocateThread(targetId, token);
          if (threadRes && threadRes.success && Array.isArray(threadRes.messages)) {
            setActiveMessages(threadRes.messages);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load advocate messages:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Switch Conversation Thread
  const handleSelectThread = async (citizenId: string) => {
    setActiveCitizenId(citizenId);
    try {
      const threadRes = await advocateApi.getAdvocateThread(citizenId, token);
      if (threadRes && threadRes.success && Array.isArray(threadRes.messages)) {
        setActiveMessages(threadRes.messages);
        // Mark as read
        await advocateApi.markAdvocateMessagesRead(citizenId, token);
        // Update unread count in thread locally
        setThreads((prev) =>
          prev.map((t) => (t.citizenId === citizenId ? { ...t, unreadCount: 0 } : t))
        );
      }
    } catch (err) {
      console.error("Failed to switch thread:", err);
    }
  };

  // Initial Load & Fallback Polling (Every 10 seconds)
  useEffect(() => {
    loadThreadsAndActiveConversation();

    const pollInterval = setInterval(() => {
      loadThreadsAndActiveConversation(true);
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  // =========================================================================
  // WEBSOCKET REAL-TIME CONNECTION
  // =========================================================================
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      try {
        const protocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = typeof window !== "undefined" && window.location.hostname === "localhost" ? "localhost:5000" : window.location.host;
        const wsUrl = `${protocol}//${host}/ws`;

        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsWsConnected(true);
          // Authenticate socket as advocate
          ws?.send(
            JSON.stringify({
              type: "auth",
              userId: "adv_1",
              role: "advocate",
              name: advocateName,
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "new_message" && data.message) {
              const newMsg: AdvocateMessageItem = data.message;
              // If message belongs to active thread, append immediately!
              setActiveMessages((prev) => {
                const exists = prev.some((m) => (m._id || m.id) === (newMsg._id || newMsg.id));
                if (exists) return prev;
                return [...prev, newMsg];
              });

              // Refresh thread list metadata
              loadThreadsAndActiveConversation(true);
            } else if (data.type === "typing_indicator") {
              if (data.senderId === activeCitizenId || data.senderRole === "citizen") {
                setIsClientTyping(!!data.isTyping);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                if (data.isTyping) {
                  typingTimeoutRef.current = setTimeout(() => {
                    setIsClientTyping(false);
                  }, 4000);
                }
              }
            } else if (data.type === "message_read") {
              setActiveMessages((prev) =>
                prev.map((m) =>
                  (m._id || m.id) === data.messageId ? { ...m, isRead: true, readAt: data.readAt } : m
                )
              );
            }
          } catch (err) {
            console.warn("WebSocket parse error:", err);
          }
        };

        ws.onclose = () => {
          setIsWsConnected(false);
          // Auto-reconnect after 4s
          reconnectTimeout = setTimeout(connectWebSocket, 4000);
        };

        ws.onerror = () => {
          setIsWsConnected(false);
        };
      } catch (err) {
        console.warn("WebSocket setup error:", err);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [advocateName, activeCitizenId]);

  // Emit typing indicator to citizen via WebSocket
  const handleTyping = (text: string) => {
    setInputContent(text);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "typing",
          senderId: "adv_1",
          recipientId: activeCitizenId,
          isTyping: text.length > 0,
        })
      );
    }
  };

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() && attachedFiles.length === 0) return;

    try {
      setIsSending(true);
      const activeThread = threads.find((t) => t.citizenId === activeCitizenId);

      const payload = {
        content: inputContent.trim(),
        recipientId: activeCitizenId || "default_citizen",
        recipientName: activeThread?.citizenName || "Gopakumar Nambiar",
        matterId: activeThread?.matterId || "mat_wpc_19482",
        matterTitle: activeThread?.matterTitle || "WP(C) 19482/2024 — High Court Writ Representation",
        attachments: attachedFiles,
        category: messageCategory,
      };

      const res = await advocateApi.sendAdvocateMessage(payload, token);
      if (res && res.success && res.messageData) {
        // Append locally
        setActiveMessages((prev) => [...prev, res.messageData]);
        setInputContent("");
        setAttachedFiles([]);

        // Send via WebSocket if open
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "chat_message",
              message: res.messageData,
            })
          );
        }

        // Refresh thread metadata
        loadThreadsAndActiveConversation(true);
      } else {
        setFeedback({ type: "error", text: res?.message || "Failed to dispatch privileged communication." });
      }
    } catch (err: any) {
      console.error("Send message error:", err);
      setFeedback({ type: "error", text: err?.message || "Communication send error." });
    } finally {
      setIsSending(false);
    }
  };

  // File Upload handler (simulated client deed / pleading attachment)
  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: MessageAttachment[] = Array.from(files).map((f) => {
      const sizeMb = (f.size / (1024 * 1024)).toFixed(1);
      return {
        fileName: f.name,
        fileUrl: `/docs/${f.name}`,
        fileType: f.type || "application/pdf",
        fileSize: `${sizeMb} MB`,
      };
    });

    setAttachedFiles((prev) => [...prev, ...newAttachments]);
  };

  const activeThread = threads.find((t) => t.citizenId === activeCitizenId) || threads[0];

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
              Chamber OS • Privileged Client Communications
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 flex items-center gap-1">
              <Shield className="w-3 h-3 text-black dark:text-white" />
              Sec. 126 Privileged
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mt-1">
            Privileged Chamber Inbox &amp; Direct Messaging
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Encrypted client instructions, case hearing broadcasts, and direct legal communication.
          </p>
        </div>

        {/* WebSocket Real-time Status & Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs">
            {isWsConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse" />
                <span className="text-[11px] font-mono font-bold text-black dark:text-white">
                  WebSocket Live
                </span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-zinc-400" />
                <span className="text-[11px] font-mono text-zinc-500">Connecting Gateway...</span>
              </>
            )}
          </div>

          <button
            onClick={() => loadThreadsAndActiveConversation()}
            disabled={loading}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white transition-colors cursor-pointer"
            title="Refresh Conversations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-black dark:text-white">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-black dark:text-white" />
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Master-Detail Grid (Threads List + Chat Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* Left: Threads List (4 Cols on Large) */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            {/* Thread Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search clients or active dockets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 text-[11px] font-semibold overflow-x-auto pb-1">
              {["all", "urgent", "hearing_update", "unread"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-2xs"
                      : "text-zinc-500 hover:text-black dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  {cat.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Conversation Threads */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-900 overflow-y-auto max-h-[500px]">
              {threads.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 space-y-1">
                  <Mail className="w-6 h-6 mx-auto text-zinc-400" />
                  <p>No active client conversation threads yet.</p>
                </div>
              ) : (
                threads
                  .filter((t) => {
                    const matchesSearch =
                      t.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (t.matterTitle && t.matterTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
                      (t.lastMessage && t.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()));

                    if (!matchesSearch) return false;
                    if (categoryFilter === "unread") return t.unreadCount > 0;
                    if (categoryFilter !== "all") return t.lastMessage?.category === categoryFilter;
                    return true;
                  })
                  .map((thread) => {
                    const isSelected = thread.citizenId === activeCitizenId;
                    return (
                      <div
                        key={thread.citizenId}
                        onClick={() => handleSelectThread(thread.citizenId)}
                        className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-start gap-3 my-1 ${
                          isSelected
                            ? "bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-xs"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-950 border border-transparent"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-bold text-xs text-black dark:text-white shrink-0 mt-0.5">
                          {thread.citizenName.charAt(0) || "C"}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-black dark:text-white truncate">
                              {thread.citizenName}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                              {thread.lastMessage?.createdAt
                                ? new Date(thread.lastMessage.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono text-zinc-500 block truncate">
                            {thread.matterTitle || "General Legal Briefing"}
                          </span>

                          <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate line-clamp-1">
                            {thread.lastMessage?.content || "No messages"}
                          </p>
                        </div>

                        {thread.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Privileged Chamber Docket</span>
            <span className="font-mono">{threads.length} Client Channels</span>
          </div>
        </div>

        {/* Right: Privileged Legal Chat Canvas (8 Cols on Large) */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          {/* Conversation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-black dark:text-white">
                  {activeThread?.citizenName || "Gopakumar Nambiar"}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                  Citizen ID: {activeCitizenId}
                </span>
              </div>
              <p className="text-xs text-zinc-500 truncate max-w-lg">
                Active Matter: {activeThread?.matterTitle || "WP(C) 19482/2024 — High Court Writ Representation & Interim Stay"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onOpenConsultation && (
                <button
                  type="button"
                  onClick={onOpenConsultation}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Chamber Session</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto max-h-[460px] space-y-4 pr-1">
            {activeMessages.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-500 space-y-2">
                <Scale className="w-8 h-8 mx-auto text-zinc-400" />
                <p>No messages exchanged in this privileged channel yet.</p>
                <span className="text-[11px] text-zinc-400 block">
                  Send a message below to initiate privileged counsel briefing.
                </span>
              </div>
            ) : (
              activeMessages.map((msg, idx) => {
                const isAdvocate = msg.senderRole === "advocate" || msg.senderId === "adv_1";
                return (
                  <div
                    key={msg._id || msg.id || idx}
                    className={`flex flex-col ${isAdvocate ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[10px] text-zinc-400">
                      <span className="font-semibold text-black dark:text-white">
                        {isAdvocate ? advocateName : msg.senderName || "Citizen"}
                      </span>
                      <span>•</span>
                      <span className="font-mono">
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed max-w-xl space-y-2 ${
                        isAdvocate
                          ? "bg-black text-white dark:bg-white dark:text-black font-medium"
                          : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                      }`}
                    >
                      {msg.category && msg.category !== "general" && (
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            isAdvocate
                              ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black"
                              : "bg-zinc-200 text-black dark:bg-zinc-800 dark:text-white"
                          }`}
                        >
                          {msg.category.replace("_", " ")}
                        </span>
                      )}

                      <div className="whitespace-pre-line">{msg.content}</div>

                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="space-y-1 pt-1.5 border-t border-zinc-800 dark:border-zinc-200/30">
                          {msg.attachments.map((att, aIdx) => (
                            <div
                              key={aIdx}
                              className={`p-2 rounded-xl flex items-center justify-between gap-2 text-[11px] ${
                                isAdvocate
                                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                                  : "bg-white text-black dark:bg-black dark:text-white border border-zinc-200 dark:border-zinc-800"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{att.fileName}</span>
                                <span className="opacity-70 text-[10px]">({att.fileSize})</span>
                              </div>
                              <a
                                href={att.fileUrl || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:opacity-75 cursor-pointer"
                                title="Download Document"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Read receipt tick */}
                    {isAdvocate && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-400 font-mono">
                        {msg.isRead ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-black dark:text-white" />
                            <span>Seen</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Delivered</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Live Typing Notification */}
            {isClientTyping && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 italic py-1">
                <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-ping" />
                <span>Client {activeThread?.citizenName || "Sri. Gopakumar"} is typing a response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Statutory Privileged Banner */}
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-[11px] text-zinc-500">
            <Shield className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
            <span>
              <strong>STATUTORY PRIVILEGE:</strong> Protected under Section 126 of Indian Evidence Act / Section 132 BSA 2023. Communications are strictly confidential between Advocate &amp; Client.
            </span>
          </div>

          {/* Composer Console */}
          <form onSubmit={handleSendMessage} className="space-y-3 pt-2">
            {/* Attachment preview tags */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white font-mono"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[180px]">{f.fileName}</span>
                    <button
                      type="button"
                      onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="hover:opacity-75 cursor-pointer ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-black dark:text-white uppercase tracking-wider text-[10px]">
                CATEGORY:
              </span>
              {(["general", "hearing_update", "document_request", "urgent"] as const).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setMessageCategory(cat)}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                    messageCategory === cat
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-2xs"
                      : "text-zinc-500 hover:text-black dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  {cat.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <textarea
                rows={2}
                value={inputContent}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type privileged legal message, court hearing outcome, or document request... (Enter to dispatch)"
                className="w-full bg-transparent text-xs text-black dark:text-white placeholder-zinc-400 focus:outline-none resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg"
                    onChange={handleFileAttach}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors"
                    title="Attach legal brief, order, or petition"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] text-zinc-400 hidden sm:inline font-mono">
                    Attachments encrypted under chamber key
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSending || (!inputContent.trim() && attachedFiles.length === 0)}
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? "Dispatching..." : "Send Privileged"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
