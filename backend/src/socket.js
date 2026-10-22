import { WebSocketServer, WebSocket } from "ws";

// In-memory map: userId -> Set of active WebSocket connections
const connectedClients = new Map();

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
