"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  Users,
  Radio,
  Sparkles,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Crown,
  Volume2,
} from "lucide-react";
import { useWebRtcSession, WebRtcPeerInfo } from "@/hooks/useWebRtcSession";

interface AcademyLiveChamberModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: string;
  roomTitle: string;
  topic?: string;
  mentorName?: string;
  userName?: string;
  userRole?: "student" | "teacher" | "faculty" | "advocate";
  isBroadcaster?: boolean;
}

function RemotePeerTile({
  peerInfo,
  stream,
}: {
  peerInfo?: WebRtcPeerInfo;
  stream?: MediaStream;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [stream]);

  const name = peerInfo?.name || "Participant";
  const role = peerInfo?.role || "Scholar";
  const isLead = peerInfo?.isBroadcaster || role === "teacher" || role === "faculty";
  const isVideoOff = peerInfo?.isVideoOff || !stream;

  return (
    <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col items-center justify-center min-h-[200px] shadow-lg group">
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover rounded-2xl ${
          isVideoOff ? "hidden" : "block"
        }`}
      />

      {/* Fallback avatar if video is off or audio-only */}
      {isVideoOff && (
        <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-black font-extrabold text-xl shadow-md border-2 border-amber-400/40">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm font-bold text-white tracking-wide">{name}</div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {isLead ? "Faculty / Lead" : "Scholar"}
          </span>
        </div>
      )}

      {/* Top right badge indicators */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        {peerInfo?.isMuted ? (
          <span className="p-1.5 rounded-lg bg-rose-500/90 text-white shadow-xs">
            <MicOff className="w-3.5 h-3.5" />
          </span>
        ) : (
          <span className="p-1.5 rounded-lg bg-emerald-500/90 text-white shadow-xs">
            <Mic className="w-3.5 h-3.5" />
          </span>
        )}
        {peerInfo?.isScreenSharing && (
          <span className="p-1.5 rounded-lg bg-amber-500 text-black font-bold shadow-xs">
            <Monitor className="w-3.5 h-3.5" />
          </span>
        )}
      </div>

      {/* Bottom overlay with peer name */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-xs text-white border border-white/10 z-10">
        <span className="font-bold flex items-center gap-1.5 truncate">
          {isLead && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
          <span className="truncate">{name}</span>
        </span>
        <span className="text-[10px] font-mono text-zinc-400 shrink-0">
          {role.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

export function AcademyLiveChamberModal({
  isOpen,
  onClose,
  roomId = "tuition_chamber_alpha",
  roomTitle,
  topic = "Constitutional Law & Civil Litigation Strategy",
  mentorName = "Prof. Dr. Rajesh Varma",
  userName = "Scholar Advocate",
  userRole = "student",
  isBroadcaster = false,
}: AcademyLiveChamberModalProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mediaAccessError, setMediaAccessError] = useState<string | null>(null);

  const {
    localStream,
    remoteStreams,
    roomPeers,
    isWsConnected,
    isMicMuted,
    isCameraOff,
    isScreenSharing,
    connectionState,
    startLocalMedia,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    leaveSession,
    connect,
  } = useWebRtcSession({
    roomId,
    userName,
    userRole,
    isBroadcaster,
    autoConnect: false,
  });

  // When modal opens, connect WebSocket and initialize local audio/video
  useEffect(() => {
    let mounted = true;
    if (isOpen) {
      connect();
      startLocalMedia({ video: true, audio: true })
        .then((stream) => {
          if (!mounted) return;
          if (localVideoRef.current && stream) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play().catch(() => {});
          }
        })
        .catch((err) => {
          if (mounted) {
            setMediaAccessError(
              "Camera or Mic was not granted. You can still participate in audio/text mode."
            );
          }
        });
    }

    return () => {
      mounted = false;
      if (isOpen) {
        leaveSession();
      }
    };
  }, [isOpen, connect, startLocalMedia, leaveSession]);

  // Bind local stream to video element whenever localStream changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream]);

  if (!isOpen) return null;

  const handleEndSession = () => {
    leaveSession();
    onClose();
  };

  const remotePeerList = Array.from(remoteStreams.entries());
  const totalInRoom = 1 + roomPeers.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-7xl h-[94vh] bg-zinc-950 border border-zinc-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden relative">
        {/* Top Header Bar */}
        <div className="h-16 px-6 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-black uppercase tracking-wider">
                Wakheel Live Chamber
              </span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-zinc-700" />
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate max-w-md">
                {roomTitle}
              </h2>
              <p className="text-[11px] text-zinc-400 truncate max-w-sm">
                Topic: <span className="text-amber-400 font-semibold">{topic}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-xs font-mono text-zinc-300">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>{totalInRoom} in Session</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-[11px] font-mono text-zinc-400">
              <span className="text-zinc-500">Room:</span>
              <span className="text-amber-400 font-bold">{roomId}</span>
            </div>

            <button
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleEndSession}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Leave</span>
            </button>
          </div>
        </div>

        {/* Media Notification Banner (if any) */}
        {mediaAccessError && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between text-xs text-amber-400">
            <span>⚠️ {mediaAccessError}</span>
            <button
              onClick={() => setMediaAccessError(null)}
              className="text-amber-400 hover:text-white font-bold text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Video Canvas Grid */}
        <div className="flex-1 p-4 overflow-y-auto bg-black grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {/* 1. Self Video Tile (Local User) */}
          <div className="relative rounded-2xl bg-zinc-900 border-2 border-amber-500/40 overflow-hidden flex flex-col items-center justify-center min-h-[220px] shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover rounded-2xl ${
                isCameraOff || !localStream ? "hidden" : "block"
              }`}
            />

            {(isCameraOff || !localStream) && (
              <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-black font-black text-2xl shadow-md border-2 border-amber-400">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm font-bold text-white">{userName} (You)</div>
                <span className="text-[10px] font-mono text-amber-400 uppercase bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {userRole}
                </span>
              </div>
            )}

            {/* Self Video Badges */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
              {isMicMuted ? (
                <span className="p-1.5 rounded-lg bg-rose-500 text-white shadow-xs">
                  <MicOff className="w-3.5 h-3.5" />
                </span>
              ) : (
                <span className="p-1.5 rounded-lg bg-emerald-500 text-white shadow-xs">
                  <Mic className="w-3.5 h-3.5" />
                </span>
              )}
              {isScreenSharing && (
                <span className="p-1.5 rounded-lg bg-amber-500 text-black font-bold shadow-xs">
                  <Monitor className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-xs text-white border border-white/10 z-10">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{userName} (You)</span>
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                {isBroadcaster ? "Presenter" : userRole}
              </span>
            </div>
          </div>

          {/* 2. Remote Peer Video Tiles */}
          {remotePeerList.map(([peerId, stream]) => {
            const peerInfo = roomPeers.find((p) => p.peerId === peerId);
            return (
              <RemotePeerTile
                key={peerId}
                peerInfo={peerInfo}
                stream={stream}
              />
            );
          })}

          {/* 3. Waiting for Peers placeholder if solitary */}
          {remotePeerList.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-950/60 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Chamber Gateway Open</h4>
                <p className="text-xs text-zinc-400 max-w-xs mt-1">
                  Connected to real-time WebRTC mesh signaling at{" "}
                  <span className="text-amber-400 font-mono">/ws</span>. Other participants joining this chamber will appear automatically.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                <span>STUN: Google Primary</span>
                <span>•</span>
                <span className="text-emerald-400">Low-Latency P2P</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="h-20 px-6 border-t border-zinc-800 bg-zinc-900 flex items-center justify-between shrink-0">
          {/* Chamber Status Info */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Mentor:</span>
                <span className="text-amber-400">{mentorName}</span>
              </div>
              <div className="text-[11px] font-mono text-zinc-400">
                Status: {connectionState === "connected" ? "⚡ Live Synced" : "Connecting..."}
              </div>
            </div>
          </div>

          {/* Main Media Action Buttons */}
          <div className="flex items-center gap-3 mx-auto sm:mx-0">
            {/* Microphone Toggle */}
            <button
              onClick={toggleMic}
              className={`p-3.5 rounded-2xl font-bold transition-all cursor-pointer flex items-center gap-2 text-xs shadow-md ${
                isMicMuted
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
              }`}
              title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span className="hidden md:inline font-bold">
                {isMicMuted ? "Muted" : "Mute"}
              </span>
            </button>

            {/* Camera Toggle */}
            <button
              onClick={toggleCamera}
              className={`p-3.5 rounded-2xl font-bold transition-all cursor-pointer flex items-center gap-2 text-xs shadow-md ${
                isCameraOff
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
              }`}
              title={isCameraOff ? "Turn Video On" : "Turn Video Off"}
            >
              {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              <span className="hidden md:inline font-bold">
                {isCameraOff ? "Video Off" : "Video"}
              </span>
            </button>

            {/* Screen Share Toggle */}
            <button
              onClick={toggleScreenShare}
              className={`p-3.5 rounded-2xl font-bold transition-all cursor-pointer flex items-center gap-2 text-xs shadow-md ${
                isScreenSharing
                  ? "bg-amber-500 text-black hover:bg-amber-400"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
              }`}
              title={isScreenSharing ? "Stop Screen Share" : "Share Your Screen"}
            >
              <Monitor className="w-5 h-5" />
              <span className="hidden md:inline font-bold">
                {isScreenSharing ? "Sharing" : "Share"}
              </span>
            </button>

            {/* End Call / Leave */}
            <button
              onClick={handleEndSession}
              className="p-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-md"
              title="Leave Live Chamber"
            >
              <PhoneOff className="w-5 h-5" />
              <span className="font-extrabold uppercase tracking-wide">Leave</span>
            </button>
          </div>

          {/* Right Brand Signature */}
          <div className="hidden lg:flex items-center gap-2 text-right">
            <div>
              <div className="text-xs font-black font-mono text-amber-400">
                WAKHEEL LEGAL NET
              </div>
              <div className="text-[10px] font-mono text-zinc-500">
                Secure WebRTC Mesh • E2E
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AcademyLiveChamberModal;
