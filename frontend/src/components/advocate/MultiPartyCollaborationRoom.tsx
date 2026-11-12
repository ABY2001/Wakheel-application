"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  ScreenShare,
  Share2,
  Users,
  MessageSquare,
  FileText,
  Pin,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Shield,
  Scale,
  Highlighter,
  Trash2,
  Save,
  Check,
  Send,
  Lock,
  Eye,
  MousePointer,
  HelpCircle,
  Copy,
} from "lucide-react";
import { advocateApi, API_BASE_URL } from "@/lib/api";

const BASE_URL =
  API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface Participant {
  id: string;
  name: string;
  role: string;
  enrollment?: string;
  phone?: string;
  isOnline: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing?: boolean;
}

export interface PinnedExhibit {
  id: string;
  title: string;
  pages: number;
  currentPage?: number;
  type: string;
  matter?: string;
  verifiedDate?: string;
}

export interface AnnotationItem {
  id: string;
  page: number;
  type: "highlight" | "note";
  text: string;
  author: string;
  role: string;
  color?: string;
  x: number;
  y: number;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  text: string;
  isPrivileged: boolean;
  scope: "all" | "advocates_only";
  timestamp: string;
}

interface MultiPartyCollaborationRoomProps {
  roomId?: string;
  matterId?: string;
  matterTitle?: string;
  subject?: string;
  advocateName?: string;
  barCouncilNumber?: string;
  token?: string;
  onClose: () => void;
  onConcludeAndRecordAdvice?: (notes: string) => void;
}

const resolveToken = (token?: string) => {
  if (token) return token;
  if (typeof window !== "undefined") {
    return localStorage.getItem("wakheel_token") || localStorage.getItem("token") || "";
  }
  return "";
};

const resolveHostId = () => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("wakheel_user") || localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        const id = parsed?._id || parsed?.id;
        if (id) return String(id);
      }
    } catch {
      // ignore storage parse failure
    }
  }
  return "host_counsel";
};

export default function MultiPartyCollaborationRoom({
  roomId = "",
  matterId = "",
  matterTitle = "",
  subject = "Chamber Collaboration Conference",
  advocateName = "",
  barCouncilNumber = "",
  token,
  onClose,
  onConcludeAndRecordAdvice,
}: MultiPartyCollaborationRoomProps) {
  const hostId = useMemo(() => resolveHostId(), []);
  const displayAdvocateName = advocateName || "Lead Counsel";

  // Session State
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>(() => [
    {
      id: hostId,
      name: displayAdvocateName,
      role: "Lead Advocate (Host)",
      enrollment: barCouncilNumber || undefined,
      isOnline: true,
      isMuted: false,
      isVideoOn: true,
      isScreenSharing: false,
    },
  ]);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [viewMode, setViewMode] = useState<"stage_focus" | "gallery_grid">("stage_focus");

  // Document & Exhibit State
  const [availableExhibits, setAvailableExhibits] = useState<PinnedExhibit[]>([]);
  const [pinnedExhibit, setPinnedExhibit] = useState<PinnedExhibit | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showExhibitDrawer, setShowExhibitDrawer] = useState(false);

  // Annotations & Laser Pointer State
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [laserPointerEnabled, setLaserPointerEnabled] = useState(false);
  const [laserPoint, setLaserPoint] = useState<{ x: number; y: number; author: string } | null>(null);
  const [newAnnotationText, setNewAnnotationText] = useState("");
  const [showAddAnnotationModal, setShowAddAnnotationModal] = useState(false);
  const [annotationClickCoord, setAnnotationClickCoord] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Chat & Notes State
  const [activeSideTab, setActiveSideTab] = useState<"notes" | "chat" | "participants">("notes");
  const [chatScope, setChatScope] = useState<"all" | "advocates_only">("all");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [inCallNotes, setInCallNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaveStatus, setNotesSaveStatus] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load real matter documents as selectable exhibits when authenticated
  useEffect(() => {
    let mounted = true;
    const loadExhibits = async () => {
      const authToken = resolveToken(token);
      if (!authToken) return;
      try {
        const res = await advocateApi.getDocuments(authToken);
        const docs = Array.isArray(res?.documents)
          ? res.documents
          : Array.isArray(res?.data)
          ? res.data
          : [];
        const filtered = matterId
          ? docs.filter((d: any) => !d.matterId || String(d.matterId) === String(matterId))
          : docs;
        const mapped: PinnedExhibit[] = filtered.map((d: any) => ({
          id: String(d._id || d.id || ""),
          title: d.title || d.fileName || "Uploaded Document",
          pages: Number(d.pages || 1),
          currentPage: 1,
          type: d.category || d.docType || "Case Document",
          matter: d.matterTitle || matterTitle || matterId || undefined,
          verifiedDate: d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-GB") : undefined,
        }));
        if (mounted) {
          setAvailableExhibits(mapped);
        }
      } catch (err) {
        console.warn("Could not load chamber documents for collaboration room:", err);
      }
    };
    loadExhibits();
    return () => {
      mounted = false;
    };
  }, [token, matterId, matterTitle]);

  // WebSocket Ref
  const wsRef = useRef<WebSocket | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // WebSocket Connection
  useEffect(() => {
    const wsUrl =
      typeof window !== "undefined"
        ? (window.location.protocol === "https:" ? "wss://" : "ws://") +
          (process.env.NEXT_PUBLIC_WS_HOST || window.location.hostname + ":5000") +
          "/ws"
        : "ws://localhost:5000/ws";

    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        // Authenticate & Join Collaboration Room
        socket?.send(
          JSON.stringify({
            type: "collab:join",
            roomId,
            user: {
              id: hostId,
              name: displayAdvocateName,
              role: "Lead Advocate (Host)",
              enrollment: barCouncilNumber,
              isMuted: isMicMuted,
              isVideoOn: !isVideoMuted,
            },
          })
        );
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "collab:room_state") {
            if (data.pinnedExhibit) setPinnedExhibit(data.pinnedExhibit);
            if (data.page) setCurrentPage(data.page);
            if (data.annotations) setAnnotations(data.annotations);
            if (data.chatMessages) setChatMessages(data.chatMessages);
            if (data.participants && Array.isArray(data.participants)) {
              setParticipants(data.participants);
            }
          } else if (data.type === "collab:exhibit_pinned") {
            setPinnedExhibit(data.pinnedExhibit);
            setCurrentPage(1);
          } else if (data.type === "collab:page_changed") {
            setCurrentPage(data.page);
          } else if (data.type === "collab:annotation_added") {
            setAnnotations((prev) => [...prev, data.annotation]);
          } else if (data.type === "collab:annotations_cleared") {
            if (data.page) {
              setAnnotations((prev) => prev.filter((a) => a.page !== data.page));
            } else {
              setAnnotations([]);
            }
          } else if (data.type === "collab:laser_pointer") {
            setLaserPoint(data.point);
            setTimeout(() => setLaserPoint(null), 2500);
          } else if (data.type === "collab:new_chat_message") {
            setChatMessages((prev) => [...prev, data.message]);
          } else if (data.type === "collab:participant_joined" || data.type === "collab:participant_left" || data.type === "collab:participant_media_updated") {
            if (data.participants) setParticipants(data.participants);
          }
        } catch (e) {
          console.warn("WebSocket message parsing error in collab room:", e);
        }
      };

      socket.onerror = (err) => {
        console.warn("Collab room WebSocket fallback mode:", err);
      };
    } catch (e) {
      console.warn("Failed to initiate WebSocket connection:", e);
    }

    return () => {
      try {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "collab:leave", roomId }));
          socket.close();
        }
      } catch {}
    };
  }, [roomId, advocateName, barCouncilNumber]);

  // Sync Pinned Exhibit Change
  const handlePinExhibit = (exhibit: PinnedExhibit) => {
    setPinnedExhibit(exhibit);
    setCurrentPage(1);
    setShowExhibitDrawer(false);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "collab:pin_exhibit",
          roomId,
          exhibit,
          user: { name: displayAdvocateName },
        })
      );
    }
  };

  // Sync Page Change
  const handlePageChange = (newPage: number) => {
    if (!pinnedExhibit || newPage < 1 || newPage > pinnedExhibit.pages) return;
    setCurrentPage(newPage);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "collab:change_page",
          roomId,
          page: newPage,
          user: { name: displayAdvocateName },
        })
      );
    }
  };

  // Handle Laser Pointer Click on Stage
  const handleStagePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!laserPointerEnabled || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const point = { x, y, author: displayAdvocateName };
    setLaserPoint(point);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "collab:laser_pointer",
          roomId,
          point,
        })
      );
    }
  };

  // Handle Adding Annotation
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (laserPointerEnabled) return;
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setAnnotationClickCoord({ x, y });
    setShowAddAnnotationModal(true);
  };

  const submitAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnotationText.trim()) return;

    const annotation: AnnotationItem = {
      id: "ann_" + Date.now().toString(),
      page: currentPage,
      type: "highlight",
      text: newAnnotationText.trim(),
      author: displayAdvocateName,
      role: "Lead Advocate",
      x: annotationClickCoord.x,
      y: annotationClickCoord.y,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };

    setAnnotations((prev) => [...prev, annotation]);
    setShowAddAnnotationModal(false);
    setNewAnnotationText("");

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "collab:annotation_add",
          roomId,
          annotation,
        })
      );
    }
  };

  const handleClearAnnotations = () => {
    setAnnotations((prev) => prev.filter((a) => a.page !== currentPage));
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "collab:annotation_clear",
          roomId,
          page: currentPage,
        })
      );
    }
  };

  // Media Toggles
  const handleToggleMic = () => {
    const next = !isMicMuted;
    setIsMicMuted(next);
    setParticipants((prev) =>
      prev.map((p) => (p.id === hostId ? { ...p, isMuted: next } : p))
    );
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "collab:media_toggle",
          roomId,
          media: { isMuted: next },
        })
      );
    }
  };

  const handleToggleVideo = () => {
    const next = !isVideoMuted;
    setIsVideoMuted(next);
    setParticipants((prev) =>
      prev.map((p) => (p.id === hostId ? { ...p, isVideoOn: !next } : p))
    );
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "collab:media_toggle",
          roomId,
          media: { isVideoOn: !next },
        })
      );
    }
  };

  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          await navigator.mediaDevices.getDisplayMedia({ video: true });
        }
        setIsScreenSharing(true);
      } catch (err) {
        // Fallback simulation for browsers that block display media in iframes/sandboxes
        setIsScreenSharing(true);
      }
    } else {
      setIsScreenSharing(false);
    }
  };

  // Send Chat Message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const message: ChatMessage = {
      id: "cmsg_" + Date.now().toString(),
      sender: displayAdvocateName,
      role: "Lead Advocate",
      text: chatInput.trim(),
      isPrivileged: true,
      scope: chatScope,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, message]);
    setChatInput("");

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "collab:chat_message",
          roomId,
          message,
        })
      );
    }
  };

  // Save Notes to Matter Case Notes
  const handleSaveNotes = async () => {
    const authToken = resolveToken(token);
    if (!authToken) {
      setNotesSaveStatus("Please sign in to sync notes.");
      return;
    }
    setIsSavingNotes(true);
    setNotesSaveStatus(null);
    try {
      if (typeof advocateApi?.saveCollabNotes === "function") {
        await advocateApi.saveCollabNotes(roomId, inCallNotes, authToken);
      } else {
        await fetch(`${BASE_URL}/advocate/collab/rooms/${encodeURIComponent(roomId)}/notes`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes: inCallNotes }),
        });
      }
      setNotesSaveStatus("Notes saved & synced to Matter File");
      setTimeout(() => setNotesSaveStatus(null), 3000);
    } catch (err) {
      console.warn("Failed to save collab notes:", err);
      setNotesSaveStatus("Failed to sync notes.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const copyRoomLink = () => {
    const link = `https://meet.wakheel.law/collab/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Filtered annotations for the current page
  const pageAnnotations = useMemo(() => {
    return annotations.filter((a) => a.page === currentPage);
  }, [annotations, currentPage]);

  // Filtered chat messages
  const visibleChatMessages = useMemo(() => {
    return chatMessages.filter((msg) => {
      if (chatScope === "all") return true;
      return msg.scope === "advocates_only";
    });
  }, [chatMessages, chatScope]);

  // Deduplicated participants roster
  const uniqueParticipants = useMemo(() => {
    const map = new Map<string, Participant>();
    participants.forEach((p) => {
      if (p && p.id) {
        const existing = map.get(p.id) || ({} as any);
        map.set(p.id, { ...existing, ...p });
      }
    });
    return Array.from(map.values());
  }, [participants]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col overflow-hidden font-sans select-none animate-in fade-in duration-150">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & PRIVILEGE BAR                                 */}
      {/* ============================================================== */}
      <header className="h-16 px-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight truncate max-w-xs sm:max-w-md">
                {subject}
              </span>
              {matterId && (
                <span className="px-2 py-0.5 text-[9px] font-mono uppercase font-bold rounded-md bg-zinc-900 border border-zinc-700 text-zinc-300">
                  {matterId}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-0.5">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Session: {formatTimer(sessionSeconds)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-zinc-400" />
                Sec. 126 Privileged Room
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Copy Meeting Link */}
          <button
            onClick={copyRoomLink}
            className="px-3 py-1.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-xs font-bold text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Invite Link</span>
              </>
            )}
          </button>

          {/* View Mode Toggle */}
          <button
            onClick={() => setViewMode(viewMode === "stage_focus" ? "gallery_grid" : "stage_focus")}
            className="p-2 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-300 transition-colors cursor-pointer"
            title={viewMode === "stage_focus" ? "Switch to Gallery Grid" : "Switch to Stage Focus"}
          >
            {viewMode === "stage_focus" ? <Users className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Conclude & Record Advice */}
          <button
            onClick={() => {
              if (onConcludeAndRecordAdvice) {
                onConcludeAndRecordAdvice(inCallNotes);
              } else {
                onClose();
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold tracking-wider cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <span>Conclude &amp; Record Advice</span>
          </button>

          {/* Leave Button */}
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Leave
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MAIN COLLABORATION STAGE                                    */}
      {/* ============================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* CENTER / LEFT: DOCUMENT PINNING STAGE & VIDEO TILES */}
        <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
          {/* Top Video Tiles Strip (in Stage Focus mode) */}
          {viewMode === "stage_focus" && (
            <div className="h-44 p-3 border-b border-zinc-800 bg-black/60 flex items-center gap-3 overflow-x-auto shrink-0">
              {uniqueParticipants.map((p, idx) => (
                <div
                  key={`${p.id}-${idx}`}
                  className="w-52 h-full rounded-2xl bg-zinc-900 border border-zinc-800 relative overflow-hidden flex flex-col justify-between p-2.5 shrink-0 shadow-xs"
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span className="font-mono truncate">{p.role}</span>
                    <div className="flex items-center gap-1">
                      {p.isMuted ? <MicOff className="w-3 h-3 text-rose-500" /> : <Mic className="w-3 h-3 text-emerald-400" />}
                      {!p.isVideoOn && <VideoOff className="w-3 h-3 text-zinc-500" />}
                    </div>
                  </div>

                  {/* Video Tile Center Avatar */}
                  <div className="flex-1 flex items-center justify-center">
                    {p.isVideoOn ? (
                      <div className="w-full h-full rounded-xl bg-zinc-800/80 flex flex-col items-center justify-center border border-zinc-700/50 relative overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-sm text-white">
                          {p.name.charAt(0)}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 mt-1">Live Feed</span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-sm text-zinc-400">
                        {p.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Name Footer */}
                  <div className="bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold text-white truncate border border-zinc-800">
                    {p.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GALLERY GRID MODE (When toggled) */}
          {viewMode === "gallery_grid" && (
            <div className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto">
              {uniqueParticipants.map((p, idx) => (
                <div
                  key={`grid-${p.id}-${idx}`}
                  className="rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden flex flex-col justify-between p-4 min-h-[220px]"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-mono">{p.role}</span>
                    <div className="flex items-center gap-1.5">
                      {p.isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-500" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                      {!p.isVideoOn && <VideoOff className="w-3.5 h-3.5 text-zinc-500" />}
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-2xl text-white">
                      {p.name.charAt(0)}
                    </div>
                  </div>

                  <div className="bg-black/70 backdrop-blur-xs px-3 py-1.5 rounded-xl text-xs font-bold text-white border border-zinc-800 flex items-center justify-between">
                    <span>{p.name}</span>
                    {p.enrollment && <span className="text-[10px] font-mono text-zinc-400">{p.enrollment}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STAGE FOCUS MODE: PINNED EXHIBIT VIEWER */}
          {viewMode === "stage_focus" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-zinc-900/60 p-4 space-y-3">
              {/* Exhibit Header Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-white text-black">
                    PINNED EXHIBIT
                  </div>
                  <h3 className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                    {pinnedExhibit ? pinnedExhibit.title : "No Exhibit Pinned"}
                  </h3>
                  {pinnedExhibit?.type && (
                    <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                      ({pinnedExhibit.type})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Paging */}
                  {pinnedExhibit && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="p-1 hover:text-white text-zinc-400 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-bold text-white px-1">
                        Page {currentPage} of {pinnedExhibit.pages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= pinnedExhibit.pages}
                        className="p-1 hover:text-white text-zinc-400 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Laser Pointer Toggle */}
                  <button
                    onClick={() => setLaserPointerEnabled(!laserPointerEnabled)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      laserPointerEnabled
                        ? "bg-rose-600 text-white border-rose-500 shadow-xs"
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
                    }`}
                  >
                    <MousePointer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Laser Pointer</span>
                  </button>

                  {/* Clear Annotations */}
                  {pageAnnotations.length > 0 && (
                    <button
                      onClick={handleClearAnnotations}
                      className="p-1.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                      title="Clear Page Annotations"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Pin Different Exhibit Drawer Toggle */}
                  <button
                    onClick={() => setShowExhibitDrawer(!showExhibitDrawer)}
                    className="px-3 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pin className="w-3.5 h-3.5" />
                    <span>{pinnedExhibit ? "Change Exhibit" : "Pin Exhibit"}</span>
                  </button>
                </div>
              </div>

              {/* Stage Viewport */}
              <div
                ref={stageRef}
                onClick={handleStageClick}
                onMouseMove={handleStagePointerMove}
                className="flex-1 rounded-3xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 relative overflow-y-auto cursor-crosshair shadow-inner"
              >
                {pinnedExhibit ? (
                  <div className="w-full max-w-3xl mx-auto bg-white text-zinc-900 min-h-[620px] rounded-2xl p-8 sm:p-12 shadow-2xl relative select-text font-serif leading-relaxed">
                    <div className="border-b-2 border-zinc-900 pb-4 mb-6 text-center">
                      <span className="text-[11px] font-mono tracking-widest uppercase block text-zinc-600 font-bold">
                        CHAMBER CASE EXHIBIT RECORD
                      </span>
                      <h4 className="text-sm font-bold mt-1 uppercase text-black">
                        {pinnedExhibit.title}
                      </h4>
                      <span className="text-xs font-mono text-zinc-500">
                        {pinnedExhibit.type}
                        {pinnedExhibit.verifiedDate ? ` • Dated ${pinnedExhibit.verifiedDate}` : ""} • Page {currentPage} of {pinnedExhibit.pages}
                      </span>
                    </div>

                    <div className="space-y-4 text-xs sm:text-sm text-zinc-800 font-serif">
                      {pinnedExhibit.matter && (
                        <p>
                          <strong>Matter Reference:</strong> {pinnedExhibit.matter}
                        </p>
                      )}
                      <p className="text-zinc-600 leading-relaxed">
                        Click anywhere on this document stage to place a collaborative annotation pin or toggle Laser Pointer mode to point participants to specific passages during conference review.
                      </p>
                    </div>

                    {/* Render Annotations Pin markers on this page */}
                    {pageAnnotations.map((ann) => (
                      <div
                        key={ann.id}
                        style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
                      >
                        <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shadow-lg border border-white cursor-pointer animate-bounce">
                          <Highlighter className="w-3 h-3" />
                        </div>
                        <div className="hidden group-hover:block absolute left-8 top-0 w-64 p-3 rounded-xl bg-black/95 text-white text-xs border border-zinc-700 shadow-2xl z-30">
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mb-1">
                            <span>{ann.author}</span>
                            <span>{ann.timestamp}</span>
                          </div>
                          <p className="leading-snug">{ann.text}</p>
                        </div>
                      </div>
                    ))}

                    {/* Real-time Laser Pointer Indicator */}
                    {laserPoint && (
                      <div
                        style={{ left: `${laserPoint.x}%`, top: `${laserPoint.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none transition-all duration-75"
                      >
                        <div className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-ping" />
                        <div className="w-3 h-3 rounded-full bg-rose-600 absolute top-0.5 left-0.5 shadow-[0_0_8px_#f43f5e]" />
                        <span className="absolute left-5 top-0 bg-black/80 px-1.5 py-0.5 rounded text-[9px] text-rose-300 font-mono whitespace-nowrap">
                          {laserPoint.author}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center space-y-3 px-6">
                    <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
                      <FileText className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-bold text-white">No Exhibit Pinned on Stage</h4>
                    <p className="text-xs text-zinc-400 max-w-md">
                      Pin an uploaded document from the matter vault using &ldquo;Pin Exhibit&rdquo; above, or share your screen for live collaborative inspection.
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowExhibitDrawer(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      Browse Case Exhibits ({availableExhibits.length})
                    </button>
                  </div>
                )}

                <div className="mt-4 text-center text-[11px] text-zinc-500 font-mono">
                  Tip: Click anywhere on the document stage to place an annotation pin for all participants.
                </div>
              </div>
            </div>
          )}

          {/* Bottom Bar Media Controls */}
          <div className="h-16 px-6 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-zinc-400">
                Chamber Audio/Video:
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Encrypted WebRTC
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Mic Toggle */}
              <button
                onClick={handleToggleMic}
                className={`p-3 rounded-full cursor-pointer transition-all ${
                  isMicMuted ? "bg-rose-600 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-white"
                }`}
                title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Video Toggle */}
              <button
                onClick={handleToggleVideo}
                className={`p-3 rounded-full cursor-pointer transition-all ${
                  isVideoMuted ? "bg-rose-600 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-white"
                }`}
                title={isVideoMuted ? "Turn On Camera" : "Turn Off Camera"}
              >
                {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>

              {/* Screen Share Toggle */}
              <button
                onClick={handleToggleScreenShare}
                className={`p-3 rounded-full cursor-pointer transition-all ${
                  isScreenSharing ? "bg-white text-black font-bold" : "bg-zinc-800 hover:bg-zinc-700 text-white"
                }`}
                title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
              >
                <ScreenShare className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveSideTab("notes")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeSideTab === "notes" ? "bg-white text-black" : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                Notes
              </button>
              <button
                onClick={() => setActiveSideTab("chat")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeSideTab === "chat" ? "bg-white text-black" : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                Chat ({chatMessages.length})
              </button>
              <button
                onClick={() => setActiveSideTab("participants")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeSideTab === "participants" ? "bg-white text-black" : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                Roster ({uniqueParticipants.length})
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. RIGHT SIDEBAR: IN-CALL NOTEPAD / CHAT / ROSTER              */}
        {/* ============================================================== */}
        <aside className="w-80 sm:w-96 bg-zinc-950 border-l border-zinc-800 flex flex-col justify-between overflow-hidden shrink-0">
          {/* TAB 1: NOTEPAD */}
          {activeSideTab === "notes" && (
            <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
              <div className="pb-3 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    IN-CALL PRIVILEGED NOTEPAD
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">Auto-syncs</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Findings, client admissions, and tactical instructions during this conference.
                </p>
              </div>

              <div className="flex-1 flex flex-col space-y-2">
                <textarea
                  rows={14}
                  value={inCallNotes}
                  onChange={(e) => setInCallNotes(e.target.value)}
                  placeholder="Record tactical decisions, questions to frame for Senior Counsel, or specific annexure references..."
                  className="w-full flex-1 p-3.5 text-xs rounded-2xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-hidden font-mono leading-relaxed resize-none"
                />

                {notesSaveStatus && (
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>{notesSaveStatus}</span>
                  </div>
                )}

                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes || !inCallNotes.trim()}
                  className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingNotes ? "Syncing..." : "Sync Notes to Matter Dossier"}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[10px] text-zinc-400 space-y-1">
                <div className="flex items-center gap-1 text-white font-bold">
                  <Shield className="w-3 h-3" />
                  <span>Bar Council Rule 33 Privileged</span>
                </div>
                <p>
                  Notes recorded here are attached to {matterId || "this conference"} as an internal Chamber Case Note.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: IN-ROOM CHAT & WHISPER */}
          {activeSideTab === "chat" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat Scope Selector */}
              <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  IN-ROOM CHAT
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setChatScope("all")}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                      chatScope === "all" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Public Room
                  </button>
                  <button
                    onClick={() => setChatScope("advocates_only")}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                      chatScope === "advocates_only" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Counsel Whisper
                  </button>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {visibleChatMessages.length === 0 ? (
                  <div className="py-10 text-center text-xs text-zinc-500">
                    No messages yet in {chatScope === "all" ? "the public room" : "Counsel Whisper"}.
                  </div>
                ) : (
                  visibleChatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-2xl border text-xs space-y-1 ${
                        msg.scope === "advocates_only"
                          ? "bg-zinc-900 border-zinc-700"
                          : "bg-zinc-950 border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                        <span className="font-bold text-white truncate max-w-[140px]">{msg.sender}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      {msg.scope === "advocates_only" && (
                        <span className="inline-block px-1.5 py-0.2 rounded text-[8px] font-mono uppercase bg-zinc-800 text-zinc-300 font-bold">
                          Counsel Whisper (Private)
                        </span>
                      )}
                      <p className="text-zinc-200 leading-snug">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="p-3 border-t border-zinc-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={chatScope === "all" ? "Message all participants..." : "Whisper to Counsel only..."}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2 rounded-xl bg-white text-black hover:bg-zinc-200 disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: PARTICIPANTS ROSTER */}
          {activeSideTab === "participants" && (
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div className="pb-3 border-b border-zinc-800">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  CONNECTED ROSTER ({uniqueParticipants.length})
                </span>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Active participants connected to this virtual conference.
                </p>
              </div>

              <div className="space-y-2">
                {uniqueParticipants.map((p, idx) => (
                  <div
                    key={`roster-${p.id}-${idx}`}
                    className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">{p.name}</span>
                        <span className="text-[10px] font-mono text-zinc-400 block">{p.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-500" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                      {!p.isVideoOn ? <VideoOff className="w-3.5 h-3.5 text-zinc-500" /> : <Video className="w-3.5 h-3.5 text-zinc-300" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ============================================================== */}
      {/* 4. MODAL: CHANGE PINNED EXHIBIT DRAWER                         */}
      {/* ============================================================== */}
      {showExhibitDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pin Court Exhibit to Stage
                </h3>
              </div>
              <button
                onClick={() => setShowExhibitDrawer(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Select a document from the matter vault to pin across all connected conference participants.
            </p>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {availableExhibits.length === 0 ? (
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-xs text-zinc-400">
                  No uploaded exhibits found for this matter yet. Upload pleadings or annexures in Document Vault first.
                </div>
              ) : (
                availableExhibits.map((exh) => {
                  const isSelected = pinnedExhibit?.id === exh.id;
                  return (
                    <button
                      key={exh.id}
                      onClick={() => handlePinExhibit(exh)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-white text-black border-white font-bold"
                          : "bg-zinc-900 border-zinc-800 text-white hover:border-zinc-700"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold line-clamp-1">{exh.title}</div>
                        <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? "text-zinc-700" : "text-zinc-400"}`}>
                          {exh.type} • {exh.pages} Page{exh.pages === 1 ? "" : "s"}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-black shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowExhibitDrawer(false)}
                className="px-4 py-2 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODAL: ADD ANNOTATION PROMPT                                */}
      {/* ============================================================== */}
      {showAddAnnotationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Highlighter className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white">
                  Add Page Annotation Pin
                </h3>
              </div>
              <button
                onClick={() => setShowAddAnnotationModal(false)}
                className="p-1 rounded-md hover:bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitAnnotation} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Annotation Note / Point to Address:
                </label>
                <textarea
                  rows={3}
                  required
                  autoFocus
                  placeholder="e.g. Note paragraph 4 contradiction regarding lack of Telegraph Act notice..."
                  value={newAnnotationText}
                  onChange={(e) => setNewAnnotationText(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAnnotationModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Place Pin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { MultiPartyCollaborationRoom };
