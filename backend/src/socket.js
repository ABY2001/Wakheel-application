import { WebSocketServer, WebSocket } from "ws";

// In-memory map: userId -> Set of active WebSocket connections
const connectedClients = new Map();

// In-memory map: roomId -> RoomState (Milestone 2: Real-time Multi-Party Case Collaboration Room)
const collabRooms = new Map();

const getOrCreateCollabRoom = (roomId) => {
  if (!collabRooms.has(roomId)) {
    collabRooms.set(roomId, {
      roomId,
      pinnedExhibit: {
        id: "exh_survey_p1",
        title: "Annexure P-1: Survey Sketch Re-survey Plan Block 14",
        pages: 4,
        currentPage: 1,
        type: "pdf",
        matter: "WP(C) 19482/2024 — Gopakumar v. KSEB",
        verifiedDate: "18 Oct 2024",
      },
      page: 1,
      annotations: [
        {
          id: "ann_1",
          page: 1,
          type: "highlight",
          text: "Corridor passing over Survey No. 142/3 marked in red without S.16 sanction.",
          author: "Adv. Meera Krishnan",
          role: "Lead Advocate",
          color: "#ffffff",
          x: 28,
          y: 35,
          timestamp: "10:32 AM",
        },
      ],
      chatMessages: [
        {
          id: "cmsg_1",
          sender: "Adv. Meera Krishnan",
          role: "Lead Advocate",
          text: "Good morning Senior Counsel and Gopakumar. We are examining Annexure P-1 survey map.",
          isPrivileged: true,
          scope: "all",
          timestamp: "10:30 AM",
        },
        {
          id: "cmsg_2",
          sender: "Sr. Adv. K. Ramachandran Nair",
          role: "Senior Counsel",
          text: "I have examined the KSEB counter. Page 3 paragraph 8 has an admission regarding absence of District Magistrate order.",
          isPrivileged: true,
          scope: "all",
          timestamp: "10:31 AM",
        },
      ],
      participants: new Map(), // ws -> userInfo
    });
  }
  return collabRooms.get(roomId);
};

const broadcastToCollabRoom = (roomId, payload, excludeWs = null) => {
  const room = collabRooms.get(roomId);
  if (!room) return;
  const rawData = JSON.stringify(payload);
  room.participants.forEach((info, participantWs) => {
    if (participantWs !== excludeWs && participantWs.readyState === WebSocket.OPEN) {
      participantWs.send(rawData);
    }
  });
};

let wssInstance = null;

/**
 * Initialize WebSocket Server attached to existing HTTP Server
 * @param {import('http').Server} httpServer 
 */
export const initWebSocketServer = (httpServer) => {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wssInstance = wss;

  wss.on("connection", (ws, req) => {
    let authenticatedUserId = null;
    let authenticatedRole = null;

    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (rawMessage) => {
      try {
        const payload = JSON.parse(rawMessage.toString());
        const { type } = payload;

        switch (type) {
          case "auth": {
            // Register socket to user
            const userId = payload.userId || (payload.role === "advocate" ? "adv_1" : "default_citizen");
            authenticatedUserId = userId;
            authenticatedRole = payload.role || "citizen";

            if (!connectedClients.has(userId)) {
              connectedClients.set(userId, new Set());
            }
            connectedClients.get(userId).add(ws);

            ws.send(
              JSON.stringify({
                type: "auth_ack",
                success: true,
                userId,
                role: authenticatedRole,
                timestamp: new Date().toISOString(),
              })
            );
            break;
          }

          case "chat_message": {
            const { message } = payload;
            if (!message || !message.recipientId) return;

            // Broadcast directly to recipient
            broadcastMessageToUser(message.recipientId, {
              type: "new_message",
              message,
            });

            // Echo acknowledgment to sender
            ws.send(
              JSON.stringify({
                type: "message_sent_ack",
                messageId: message._id || message.id,
                timestamp: new Date().toISOString(),
              })
            );
            break;
          }

          case "typing": {
            const { recipientId, isTyping, matterId } = payload;
            if (!recipientId) return;

            broadcastMessageToUser(recipientId, {
              type: "typing_indicator",
              senderId: authenticatedUserId,
              senderRole: authenticatedRole,
              isTyping: !!isTyping,
              matterId: matterId || "",
            });
            break;
          }

          case "read_receipt": {
            const { messageId, senderId } = payload;
            if (!senderId) return;

            broadcastMessageToUser(senderId, {
              type: "message_read",
              messageId,
              readBy: authenticatedUserId,
              readAt: new Date().toISOString(),
            });
            break;
          }

          case "ping": {
            ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
            break;
          }

          // --- Milestone 2: Multi-Party Case Collaboration Room ---
          case "collab:join": {
            const { roomId = "room_wpc_19482", user = {} } = payload;
            const room = getOrCreateCollabRoom(roomId);
            const targetUserId = user.id || authenticatedUserId || "adv_1";

            // Purge any stale socket previously registered to this user in this room
            room.participants.forEach((existingUser, existingWs) => {
              if (existingUser.id === targetUserId && existingWs !== ws) {
                room.participants.delete(existingWs);
              }
            });

            const userInfo = {
              id: targetUserId,
              name: user.name || "Advocate Participant",
              role: user.role || authenticatedRole || "Advocate",
              enrollment: user.enrollment || "K/1429/2016",
              isOnline: true,
              isMuted: !!user.isMuted,
              isVideoOn: user.isVideoOn !== false,
              isScreenSharing: !!user.isScreenSharing,
            };
            room.participants.set(ws, userInfo);

            const participantsList = Array.from(room.participants.values());

            // Send back full room state to the joining participant
            ws.send(
              JSON.stringify({
                type: "collab:room_state",
                roomId,
                pinnedExhibit: room.pinnedExhibit,
                page: room.page,
                annotations: room.annotations,
                chatMessages: room.chatMessages,
                participants: participantsList,
                timestamp: new Date().toISOString(),
              })
            );

            // Notify everyone else that participant joined
            broadcastToCollabRoom(
              roomId,
              {
                type: "collab:participant_joined",
                roomId,
                participant: userInfo,
                participants: participantsList,
              },
              ws
            );
            break;
          }

          case "collab:pin_exhibit": {
            const { roomId = "room_wpc_19482", exhibit } = payload;
            const room = getOrCreateCollabRoom(roomId);
            room.pinnedExhibit = exhibit;
            room.page = 1;
            broadcastToCollabRoom(roomId, {
              type: "collab:exhibit_pinned",
              roomId,
              pinnedExhibit: exhibit,
              page: 1,
              pinnedBy: payload.user || { name: "Advocate" },
            });
            break;
          }

          case "collab:change_page": {
            const { roomId = "room_wpc_19482", page } = payload;
            const room = getOrCreateCollabRoom(roomId);
            room.page = page;
            broadcastToCollabRoom(roomId, {
              type: "collab:page_changed",
              roomId,
              page,
              changedBy: payload.user || { name: "Advocate" },
            });
            break;
          }

          case "collab:annotation_add": {
            const { roomId = "room_wpc_19482", annotation } = payload;
            const room = getOrCreateCollabRoom(roomId);
            room.annotations.push(annotation);
            broadcastToCollabRoom(roomId, {
              type: "collab:annotation_added",
              roomId,
              annotation,
            });
            break;
          }

          case "collab:annotation_clear": {
            const { roomId = "room_wpc_19482", page } = payload;
            const room = getOrCreateCollabRoom(roomId);
            if (page) {
              room.annotations = room.annotations.filter((a) => a.page !== page);
            } else {
              room.annotations = [];
            }
            broadcastToCollabRoom(roomId, {
              type: "collab:annotations_cleared",
              roomId,
              page,
            });
            break;
          }

          case "collab:laser_pointer": {
            const { roomId = "room_wpc_19482", point } = payload;
            broadcastToCollabRoom(
              roomId,
              {
                type: "collab:laser_pointer",
                roomId,
                point,
              },
              ws
            );
            break;
          }

          case "collab:chat_message": {
            const { roomId = "room_wpc_19482", message } = payload;
            const room = getOrCreateCollabRoom(roomId);
            const chatMsg = {
              id: "cmsg_" + Date.now().toString(),
              sender: message.sender || "Chamber Participant",
              role: message.role || "Advocate",
              text: message.text || "",
              isPrivileged: message.isPrivileged !== false,
              scope: message.scope || "all",
              timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
            };
            room.chatMessages.push(chatMsg);
            broadcastToCollabRoom(roomId, {
              type: "collab:new_chat_message",
              roomId,
              message: chatMsg,
            });
            break;
          }

          case "collab:media_toggle": {
            const { roomId = "room_wpc_19482", media } = payload;
            const room = getOrCreateCollabRoom(roomId);
            if (room.participants.has(ws)) {
              const current = room.participants.get(ws);
              const updated = { ...current, ...media };
              room.participants.set(ws, updated);
              broadcastToCollabRoom(roomId, {
                type: "collab:participant_media_updated",
                roomId,
                participant: updated,
                participants: Array.from(room.participants.values()),
              });
            }
            break;
          }

          case "collab:leave": {
            const { roomId = "room_wpc_19482" } = payload;
            const room = collabRooms.get(roomId);
            if (room && room.participants.has(ws)) {
              const departingUser = room.participants.get(ws);
              room.participants.delete(ws);
              broadcastToCollabRoom(roomId, {
                type: "collab:participant_left",
                roomId,
                participant: departingUser,
                participants: Array.from(room.participants.values()),
              });
            }
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error("WebSocket message parsing error:", err.message);
      }
    });

    ws.on("close", () => {
      if (authenticatedUserId && connectedClients.has(authenticatedUserId)) {
        const userSockets = connectedClients.get(authenticatedUserId);
        userSockets.delete(ws);
        if (userSockets.size === 0) {
          connectedClients.delete(authenticatedUserId);
        }
      }

      // Clean up collabRooms
      collabRooms.forEach((room, rId) => {
        if (room.participants.has(ws)) {
          const departing = room.participants.get(ws);
          room.participants.delete(ws);
          broadcastToCollabRoom(rId, {
            type: "collab:participant_left",
            roomId: rId,
            participant: departing,
            participants: Array.from(room.participants.values()),
          });
        }
      });
    });

    ws.on("error", (err) => {
      console.warn("WebSocket client error:", err.message);
    });
  });

  // Heartbeat ping interval to keep connections alive
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(heartbeatInterval);
  });

  console.log("⚡ Real-time WebSocket Gateway attached on path: /ws");
  return wss;
};

/**
 * Broadcast message or event to a specific user's active WebSocket sessions
 * @param {string} userId
 * @param {object} payload
 */
export const broadcastMessageToUser = (userId, payload) => {
  if (!userId) return false;

  // Exact match
  let targetSockets = connectedClients.get(userId);

  // If advocate, also check "adv_1" and advocate aliases
  if ((!targetSockets || targetSockets.size === 0) && (userId.includes("adv") || userId === "advocate")) {
    targetSockets = connectedClients.get("adv_1");
  }

  // If citizen, also check "default_citizen"
  if ((!targetSockets || targetSockets.size === 0) && (userId.includes("citizen") || userId === "default_citizen")) {
    targetSockets = connectedClients.get("default_citizen");
  }

  if (targetSockets && targetSockets.size > 0) {
    const rawData = JSON.stringify(payload);
    targetSockets.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(rawData);
      }
    });
    return true;
  }

  return false;
};
