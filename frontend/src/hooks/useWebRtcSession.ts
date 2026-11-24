"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface WebRtcPeerInfo {
  peerId: string;
  name: string;
  role: string;
  isBroadcaster?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isScreenSharing?: boolean;
}

export interface UseWebRtcSessionOptions {
  roomId?: string;
  peerId?: string;
  userName?: string;
  userRole?: string;
  isBroadcaster?: boolean;
  autoConnect?: boolean;
  onRemoteStreamAdded?: (peerId: string, stream: MediaStream) => void;
  onRemoteStreamRemoved?: (peerId: string) => void;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useWebRtcSession({
  roomId = "tuition_main",
  peerId,
  userName = "Law Scholar",
  userRole = "student",
  isBroadcaster = false,
  autoConnect = false,
  onRemoteStreamAdded,
  onRemoteStreamRemoved,
}: UseWebRtcSessionOptions = {}) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [roomPeers, setRoomPeers] = useState<WebRtcPeerInfo[]>([]);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "connected" | "disconnected">("idle");

  const socketRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const myPeerIdRef = useRef<string>(peerId || `peer_${Date.now()}`);

  const onRemoteStreamAddedRef = useRef(onRemoteStreamAdded);
  const onRemoteStreamRemovedRef = useRef(onRemoteStreamRemoved);

  useEffect(() => {
    onRemoteStreamAddedRef.current = onRemoteStreamAdded;
    onRemoteStreamRemovedRef.current = onRemoteStreamRemoved;
  });

  // Safe WebSocket sender
  const sendWs = useCallback((type: string, data: any = {}) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, ...data }));
    }
  }, []);

  // Create an RTCPeerConnection for a target peer
  const createPeerConnection = useCallback((targetPeerId: string, isInitiator: boolean) => {
    if (typeof window === "undefined" || !window.RTCPeerConnection) return null;

    if (peerConnectionsRef.current.has(targetPeerId)) {
      return peerConnectionsRef.current.get(targetPeerId)!;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionsRef.current.set(targetPeerId, pc);

    // Attach local stream tracks to connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // ICE Candidate handler
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWs("webrtc:ice_candidate", {
          roomId,
          targetPeerId,
          senderPeerId: myPeerIdRef.current,
          candidate: event.candidate,
        });
      }
    };

    // Remote Track handler
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        setRemoteStreams((prev) => {
          const updated = new Map(prev);
          updated.set(targetPeerId, stream);
          return updated;
        });
        onRemoteStreamAddedRef.current?.(targetPeerId, stream);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setRemoteStreams((prev) => {
          const updated = new Map(prev);
          updated.delete(targetPeerId);
          return updated;
        });
        onRemoteStreamRemovedRef.current?.(targetPeerId);
      }
    };

    // If initiator, create and send SDP offer
    if (isInitiator) {
      pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          if (pc.localDescription) {
            sendWs("webrtc:offer", {
              roomId,
              targetPeerId,
              senderPeerId: myPeerIdRef.current,
              sdp: pc.localDescription,
            });
          }
        })
        .catch((err) => console.warn("[WebRTC] Create offer error:", err));
    }

    return pc;
  }, [roomId, sendWs]);

  // Start local camera & microphone
  const startLocalMedia = useCallback(async (constraints: MediaStreamConstraints = { audio: true, video: true }) => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) return null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStream(stream);

      // Add tracks to any existing peer connections
      peerConnectionsRef.current.forEach((pc) => {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      });

      return stream;
    } catch (err: any) {
      console.warn("[WebRTC] getUserMedia access notice:", err.message);
      return null;
    }
  }, []);

  // Connect to WebSocket & join room
  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch {}
      socketRef.current = null;
    }

    const host = process.env.NEXT_PUBLIC_WS_HOST || `${window.location.hostname}:5001`;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${host}/ws`;

    setConnectionState("connecting");

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsWsConnected(true);
        setConnectionState("connected");

        // Join WebRTC room
        sendWs("webrtc:join", {
          roomId,
          peerId: myPeerIdRef.current,
          user: {
            name: userName,
            role: userRole,
            isBroadcaster,
            isMuted: isMicMuted,
            isVideoOff: isCameraOff,
            isScreenSharing,
          },
        });
      };

      ws.onmessage = async (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { type } = payload;

          switch (type) {
            case "webrtc:room_joined": {
              const { existingPeers } = payload;
              setRoomPeers(existingPeers || []);
              // Initiate WebRTC peer connection to each existing peer
              if (Array.isArray(existingPeers)) {
                existingPeers.forEach((p: WebRtcPeerInfo) => {
                  createPeerConnection(p.peerId, true);
                });
              }
              break;
            }

            case "webrtc:peer_joined": {
              const { peer } = payload;
              if (peer && peer.peerId !== myPeerIdRef.current) {
                setRoomPeers((prev) => {
                  const filtered = prev.filter((p) => p.peerId !== peer.peerId);
                  return [...filtered, peer];
                });
              }
              break;
            }

            case "webrtc:offer": {
              const { senderPeerId, sdp } = payload;
              const pc = createPeerConnection(senderPeerId, false);
              if (pc && sdp) {
                await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                sendWs("webrtc:answer", {
                  roomId,
                  targetPeerId: senderPeerId,
                  senderPeerId: myPeerIdRef.current,
                  sdp: pc.localDescription,
                });
              }
              break;
            }

            case "webrtc:answer": {
              const { senderPeerId, sdp } = payload;
              const pc = peerConnectionsRef.current.get(senderPeerId);
              if (pc && sdp) {
                await pc.setRemoteDescription(new RTCSessionDescription(sdp));
              }
              break;
            }

            case "webrtc:ice_candidate": {
              const { senderPeerId, candidate } = payload;
              const pc = peerConnectionsRef.current.get(senderPeerId);
              if (pc && candidate) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                  console.warn("[WebRTC] Candidate error:", e);
                }
              }
              break;
            }

            case "webrtc:peer_media_updated": {
              const { peerId: updatedPeerId, media } = payload;
              setRoomPeers((prev) =>
                prev.map((p) => (p.peerId === updatedPeerId ? { ...p, ...media } : p))
              );
              break;
            }

            case "webrtc:peer_left": {
              const { peerId: departingPeerId } = payload;
              setRoomPeers((prev) => prev.filter((p) => p.peerId !== departingPeerId));
              const pc = peerConnectionsRef.current.get(departingPeerId);
              if (pc) {
                pc.close();
                peerConnectionsRef.current.delete(departingPeerId);
              }
              setRemoteStreams((prev) => {
                const updated = new Map(prev);
                updated.delete(departingPeerId);
                return updated;
              });
              onRemoteStreamRemovedRef.current?.(departingPeerId);
              break;
            }

            default:
              break;
          }
        } catch (e) {
          console.warn("[WebRTC] Signaling parse error:", e);
        }
      };

      ws.onclose = () => {
        setIsWsConnected(false);
        setConnectionState("disconnected");
      };
    } catch (e) {
      console.warn("[WebRTC] WebSocket setup error:", e);
      setIsWsConnected(false);
      setConnectionState("disconnected");
    }
  }, [roomId, userName, userRole, isBroadcaster, isMicMuted, isCameraOff, isScreenSharing, sendWs, createPeerConnection]);

  // Toggle Microphone
  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextEnabled = !audioTracks[0].enabled;
        audioTracks[0].enabled = nextEnabled;
        setIsMicMuted(!nextEnabled);
        sendWs("webrtc:media_state", {
          roomId,
          peerId: myPeerIdRef.current,
          media: { isMuted: !nextEnabled },
        });
      }
    }
  }, [roomId, sendWs]);

  // Toggle Camera
  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextEnabled = !videoTracks[0].enabled;
        videoTracks[0].enabled = nextEnabled;
        setIsCameraOff(!nextEnabled);
        sendWs("webrtc:media_state", {
          roomId,
          peerId: myPeerIdRef.current,
          media: { isVideoOff: !nextEnabled },
        });
      }
    }
  }, [roomId, sendWs]);

  // Toggle Screen Sharing
  const toggleScreenShare = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getDisplayMedia) return;

    if (isScreenSharing && screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
      sendWs("webrtc:media_state", {
        roomId,
        peerId: myPeerIdRef.current,
        media: { isScreenSharing: false },
      });
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);

      const videoTrack = screenStream.getVideoTracks()[0];
      peerConnectionsRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      videoTrack.onended = () => {
        setIsScreenSharing(false);
        screenStreamRef.current = null;
        sendWs("webrtc:media_state", {
          roomId,
          peerId: myPeerIdRef.current,
          media: { isScreenSharing: false },
        });
      };

      sendWs("webrtc:media_state", {
        roomId,
        peerId: myPeerIdRef.current,
        media: { isScreenSharing: true },
      });
    } catch (err: any) {
      console.warn("[WebRTC] Screen share canceled or failed:", err.message);
    }
  }, [isScreenSharing, roomId, sendWs]);

  // End Session / Leave
  const leaveSession = useCallback(() => {
    sendWs("webrtc:leave", {
      roomId,
      peerId: myPeerIdRef.current,
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
    }

    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    setRemoteStreams(new Map());
    setRoomPeers([]);
    setConnectionState("idle");
  }, [roomId, sendWs]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      leaveSession();
    };
  }, [autoConnect, connect, leaveSession]);

  return {
    localStream,
    remoteStreams,
    roomPeers,
    isWsConnected,
    isMicMuted,
    isCameraOff,
    isScreenSharing,
    connectionState,
    myPeerId: myPeerIdRef.current,
    connect,
    startLocalMedia,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    leaveSession,
  };
}

export default useWebRtcSession;
