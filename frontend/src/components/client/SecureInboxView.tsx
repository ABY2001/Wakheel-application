"use client";

import React, { useState, useEffect, useRef } from "react";
import { citizenApi } from "@/lib/api";
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
  Building,
} from "lucide-react";

export interface MessageAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
}

export interface CitizenMessageItem {
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

interface SecureInboxViewProps {
  token?: string;
  onOpenConsultationModal?: () => void;
}

export const SecureInboxView: React.FC<SecureInboxViewProps> = ({
  token = "dev_token",
  onOpenConsultationModal,
}) => {
  const [messages, setMessages] = useState<CitizenMessageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMatterFilter, setActiveMatterFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inputContent, setInputContent] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<"general" | "hearing_update" | "document_request" | "urgent">("general");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [attachedFile, setAttachedFile] = useState<MessageAttachment | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await citizenApi.getMessages(token);
      if (res && res.messages) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error("Failed to load inbox messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // WebSocket real-time listener for incoming advocate replies
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      try {
        const protocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = typeof window !== "undefined" && window.location.hostname === "localhost" ? "localhost:5000" : window.location.host;
        const wsUrl = `${protocol}//${host}/ws`;

        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          ws?.send(
            JSON.stringify({
              type: "auth",
              userId: "default_citizen",
              role: "citizen",
              name: "Gopakumar Nambiar",
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "new_message" && data.message) {
              setMessages((prev) => {
                const exists = prev.some((m) => (m._id || m.id) === (data.message._id || data.message.id));
                if (exists) return prev;
                return [...prev, data.message];
              });
            }
          } catch (err) {
            console.warn("WebSocket parse error:", err);
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectWebSocket, 4000);
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
  }, [token]);

  // Scroll to bottom of message thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeMatterFilter]);

  // Filter messages by active matter and search
  const filteredMessages = messages.filter((m) => {
    if (activeMatterFilter !== "ALL") {
      if (activeMatterFilter === "WP_19482" && !m.matterId?.includes("wpc")) return false;
      if (activeMatterFilter === "OS_412" && !m.matterId?.includes("os")) return false;
      if (activeMatterFilter === "SEC_138" && !m.matterId?.includes("not") && !m.matterTitle?.includes("138")) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = m.content.toLowerCase().includes(q);
      const matchTitle = m.matterTitle?.toLowerCase().includes(q);
      const matchSender = m.senderName.toLowerCase().includes(q);
      if (!matchText && !matchTitle && !matchSender) return false;
    }

    return true;
  });

  // Calculate unread count
  const unreadCount = messages.filter((m) => m.senderRole === "advocate" && !m.isRead).length;

  // Send a new privileged message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim() && !attachedFile) return;

    const messageText = inputContent.trim();
    setInputContent("");

    // Optimistic UI update
    const optimisticMsg: CitizenMessageItem = {
      _id: "temp_" + Date.now().toString(),
      senderId: "default_citizen",
      senderRole: "citizen",
      senderName: "Gopakumar Nambiar",
      recipientId: "adv_1",
      recipientRole: "advocate",
      recipientName: "Adv. Meera Krishnan",
      matterId: activeMatterFilter === "WP_19482" ? "mat_wpc_19482" : activeMatterFilter === "OS_412" ? "mat_os_412" : "mat_wpc_19482",
      matterTitle: activeMatterFilter === "WP_19482" ? "WP(C) 19482/2024 — High Court Writ Representation & Interim Stay" : "Legal Counsel Representation",
      content: messageText,
      attachments: attachedFile ? [attachedFile] : [],
      isRead: false,
      isPrivileged: true,
      category: selectedCategory,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setAttachedFile(null);

    try {
      setIsSending(true);
      const res = await citizenApi.sendCitizenMessage(token, {
        content: messageText,
        recipientId: "adv_1",
        recipientName: "Adv. Meera Krishnan",
        matterId: optimisticMsg.matterId,
        matterTitle: optimisticMsg.matterTitle,
        attachments: optimisticMsg.attachments,
        category: selectedCategory,
      });

      if (res && res.messageData) {
        setMessages((prev) =>
          prev.map((m) => (m._id === optimisticMsg._id ? res.messageData : m))
        );
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Message delivery failed. Please check your network connection.");
    } finally {
      setIsSending(false);
    }
  };

  // Quick Chips
  const handleChipClick = (promptText: string) => {
    setInputContent(promptText);
  };

  // Simulate attaching a certified vault document
  const handleAttachVaultDoc = () => {
    setAttachedFile({
      fileName: "Certified_Taluk_Demarcation_Sketch.pdf",
      fileUrl: "/docs/demarcation_sketch.pdf",
      fileType: "application/pdf",
      fileSize: "2.1 MB",
    });
  };

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto space-y-4">
      {/* ============================================================== */}
      {/* 1. Header Bar with Privilege Seal                              */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">
              Privileged Chamber Inbox
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black text-white dark:bg-white dark:text-black">
              ATTORNEY-CLIENT PRIVILEGED
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Direct communications protected under Section 126 of the Indian Evidence Act, 1872 &amp; Section 132 of the Bharatiya Sakshya Adhiniyam, 2023.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenConsultationModal && (
            <button
              onClick={onOpenConsultationModal}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-zinc-500" />
              <span>Book Chamber Conference</span>
            </button>
          )}

          <button
            onClick={fetchMessages}
            title="Refresh messages"
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. Main Two-Column Inbox Workspace                             */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[720px] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-xs">
        
        {/* LEFT COLUMN: THREAD & COUNSEL NAVIGATOR (4 Cols) */}
        <div className="lg:col-span-4 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/50">
          
          {/* Counsel Profile Header Card */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center shrink-0">
                MK
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-black dark:text-white text-sm block truncate">
                  Adv. Meera Krishnan
                </span>
                <span className="text-[11px] text-zinc-500 font-mono block truncate">
                  Roll No: K/001429/2012 &bull; High Court
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-0.5">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-zinc-500">CHAMBERS</span>
                <span className="font-bold text-black dark:text-white">KHCAA COMPLEX, KOCHI</span>
              </div>
              <p className="truncate">Chamber 412, High Court Road, Marine Drive</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages, citations, orders..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          {/* Matter Filter Pills */}
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: "ALL", label: "All Threads" },
              { id: "WP_19482", label: "WP(C) 19482" },
              { id: "OS_412", label: "OS 412/2024" },
              { id: "SEC_138", label: "S.138 Notice" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMatterFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  activeMatterFilter === tab.id
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-black dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Thread List Preview */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
            {filteredMessages.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                No communications found for this filter.
              </div>
            ) : (
              filteredMessages.slice(-6).reverse().map((msg) => (
                <div
                  key={msg._id}
                  className="p-3.5 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black dark:text-white">
                      {msg.senderRole === "citizen" ? "You" : msg.senderName}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {msg.content}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[180px]">
                      {msg.matterTitle || "General Legal Representation"}
                    </span>
                    {msg.category === "hearing_update" && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                        COURT ORDER
                      </span>
                    )}
                    {msg.category === "urgent" && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black text-white dark:bg-white dark:text-black">
                        ACTION REQ
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CONVERSATION CANVAS (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white dark:bg-black">
          
          {/* Active Chat Canvas Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-black">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-bold text-xs text-black dark:text-white">
                MK
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-black dark:text-white">Adv. Meera Krishnan</h3>
                  <span className="w-2 h-2 rounded-full bg-black dark:bg-white" title="Active Chamber Channel" />
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Kerala High Court &bull; Civil, Writ &amp; Property Practice
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white inline-flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                Sec 126 Privileged
              </span>
            </div>
          </div>

          {/* Message Stream Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {loading ? (
              <div className="py-16 text-center space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-zinc-400" />
                <p className="text-xs text-zinc-500">Decrypting confidential chamber records...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Mail className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
                <h4 className="text-sm font-bold text-black dark:text-white">No messages in this thread</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Send a confidential instruction or case query to Adv. Meera Krishnan using the message box below.
                </p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isCitizen = msg.senderRole === "citizen";

                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isCitizen ? "items-end" : "items-start"}`}
                  >
                    {/* Sender & Timestamp Label */}
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-zinc-400 px-1">
                      <span>{isCitizen ? "You" : msg.senderName}</span>
                      <span>&bull;</span>
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {msg.category === "hearing_update" && (
                        <span className="px-1.5 py-0.2 rounded font-bold bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                          HEARING REPORT
                        </span>
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs leading-relaxed space-y-2.5 ${
                        isCitizen
                          ? "bg-black text-white dark:bg-white dark:text-black rounded-tr-xs shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-tl-xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {/* Attachments (if any) */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {msg.attachments.map((att, i) => (
                            <div
                              key={i}
                              className={`p-2 rounded-2xl flex items-center justify-between gap-2 text-xs font-mono ${
                                isCitizen
                                  ? "bg-zinc-800 text-white dark:bg-zinc-100 dark:text-black"
                                  : "bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-4 h-4 shrink-0" />
                                <div className="truncate">
                                  <span className="font-bold truncate block">{att.fileName}</span>
                                  <span className="text-[10px] opacity-70">{att.fileSize}</span>
                                </div>
                              </div>
                              <a
                                href={att.fileUrl || "#"}
                                download
                                className="p-1 rounded hover:opacity-75 transition-opacity"
                                title="Download attachment"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delivery & Read Receipts for Citizen */}
                    {isCitizen && (
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] font-mono text-zinc-400 px-1">
                        <CheckCheck className="w-3.5 h-3.5 text-black dark:text-white" />
                        <span>Delivered to Chamber</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider shrink-0">
              Quick Inquiries:
            </span>
            {[
              "Status of interim stay order?",
              "Demarcation sketch uploaded to vault",
              "When is next court listing date?",
              "Need chamber conference tomorrow",
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip)}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-zinc-400 whitespace-nowrap cursor-pointer transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Attached Document Preview Banner */}
          {attachedFile && (
            <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-black dark:text-white" />
                <span className="font-mono font-bold text-black dark:text-white">
                  Attached: {attachedFile.fileName} ({attachedFile.fileSize})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="p-1 rounded text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Message Input Composer */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAttachVaultDoc}
                title="Attach document from vault"
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="Type confidential instruction or inquiry to Adv. Meera Krishnan..."
                className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />

              <button
                type="submit"
                disabled={isSending || (!inputContent.trim() && !attachedFile)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs transition-opacity"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pt-1">
              <span>Section 126 Indian Evidence Act &bull; Privileged Transmission</span>
              <span>Press Enter to deliver</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
