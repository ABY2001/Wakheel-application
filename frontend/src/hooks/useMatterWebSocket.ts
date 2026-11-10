"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type MatterEventType =
  | "MATTER_STAGE_UPDATED"
  | "MATTER_QUERY_UPDATED"
  | "MATTER_AUTHORIZED"
  | "MATTER_CHALLAN_PAID"
  | string;

export interface MatterWebSocketEvent {
  type: MatterEventType;
  matterId?: string;
  matter?: any;
  meta?: {
    action?: string;
    title?: string;
    query?: any;
    queryId?: string;
    stageIndex?: number;
    status?: string;
    authorization?: any;
    signerName?: string;
    signerDesignation?: string;
    signMethod?: string;
    espReference?: string;
    transaction?: any;
    amount?: number;
    voucherNumber?: string;
    category?: string;
    settlementMode?: string;
    clientName?: string;
    authorRole?: string;
    authorName?: string;
    attachmentsCount?: number;
    resolutionNotes?: string;
    caseNumber?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

export interface UseMatterWebSocketOptions {
  role?: "advocate" | "citizen" | "partner" | "auditor";
  userId?: string;
  enabled?: boolean;
  onEvent?: (event: MatterWebSocketEvent) => void;
  onStageUpdated?: (event: MatterWebSocketEvent) => void;
  onQueryUpdated?: (event: MatterWebSocketEvent) => void;
  onAuthorized?: (event: MatterWebSocketEvent) => void;
  onChallanPaid?: (event: MatterWebSocketEvent) => void;
}

export function useMatterWebSocket(options: UseMatterWebSocketOptions = {}) {
  const {
    role = "advocate",
    userId = "adv_1",
    enabled = true,
    onEvent,
    onStageUpdated,
    onQueryUpdated,
    onAuthorized,
    onChallanPaid,
  } = options;

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "reconnecting">("disconnected");
  const [lastEvent, setLastEvent] = useState<MatterWebSocketEvent | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef<boolean>(false);

  // Keep callback refs fresh without causing re-connect loops
  const onEventRef = useRef(onEvent);
  const onStageUpdatedRef = useRef(onStageUpdated);
  const onQueryUpdatedRef = useRef(onQueryUpdated);
  const onAuthorizedRef = useRef(onAuthorized);
  const onChallanPaidRef = useRef(onChallanPaid);

  useEffect(() => {
    onEventRef.current = onEvent;
    onStageUpdatedRef.current = onStageUpdated;
    onQueryUpdatedRef.current = onQueryUpdated;
    onAuthorizedRef.current = onAuthorized;
    onChallanPaidRef.current = onChallanPaid;
  });

  const connect = useCallback(() => {
    if (typeof window === "undefined" || !enabled || isUnmountedRef.current) return;

    // Close any previous socket cleanly
    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch {}
      socketRef.current = null;
    }

    const wsUrl =
      typeof window !== "undefined"
        ? (window.location.protocol === "https:" ? "wss://" : "ws://") +
          (process.env.NEXT_PUBLIC_WS_HOST || window.location.hostname + ":5000") +
          "/ws"
        : "ws://localhost:5000/ws";

    setConnectionStatus((prev) => (prev === "connected" ? "reconnecting" : "connecting"));

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (isUnmountedRef.current) return;
        setIsConnected(true);
        setConnectionStatus("connected");

        // Authenticate with user role and register for matter compliance broadcasts
        try {
          socket.send(
            JSON.stringify({
              type: "auth",
              userId: userId || (role === "advocate" ? "adv_1" : "default_citizen"),
              role,
            })
          );
          socket.send(
            JSON.stringify({
              type: "subscribe_matters",
            })
          );
        } catch (err) {
          console.warn("[Matter WS] Handshake dispatch warning:", err);
        }

        // Heartbeat keep-alive ping every 25s
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "ping" }));
          }
        }, 25000);
      };

      socket.onmessage = (rawEvent) => {
        if (isUnmountedRef.current) return;
        try {
          const data: MatterWebSocketEvent = JSON.parse(rawEvent.data);
          if (!data || !data.type) return;

          // Ignore purely internal ACK/PONG messages
          if (data.type === "pong" || data.type === "auth_ack" || data.type === "subscribed_matters_ack") {
            return;
          }

          setLastEvent(data);

          // Invoke general listener
          onEventRef.current?.(data);

          // Route to specialized event handlers
          switch (data.type) {
            case "MATTER_STAGE_UPDATED":
              onStageUpdatedRef.current?.(data);
              break;
            case "MATTER_QUERY_UPDATED":
              onQueryUpdatedRef.current?.(data);
              break;
            case "MATTER_AUTHORIZED":
              onAuthorizedRef.current?.(data);
              break;
            case "MATTER_CHALLAN_PAID":
              onChallanPaidRef.current?.(data);
              break;
            default:
              break;
          }
        } catch (e) {
          console.warn("[Matter WS] Message parsing error:", e);
        }
      };

      socket.onerror = (e) => {
        console.warn("[Matter WS] Connection encountered error, will retry:", e);
      };

      socket.onclose = () => {
        if (isUnmountedRef.current) return;
        setIsConnected(false);
        setConnectionStatus("disconnected");
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        // Reconnect after 4 seconds
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isUnmountedRef.current && enabled) {
            connect();
          }
        }, 4000);
      };
    } catch (e) {
      console.warn("[Matter WS] Failed to initialize WebSocket:", e);
      setIsConnected(false);
      setConnectionStatus("disconnected");
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        if (!isUnmountedRef.current && enabled) {
          connect();
        }
      }, 5000);
    }
  }, [enabled, role, userId]);

  useEffect(() => {
    isUnmountedRef.current = false;
    connect();

    return () => {
      isUnmountedRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch {}
        socketRef.current = null;
      }
    };
  }, [connect]);

  const sendEvent = useCallback((type: string, payload: any = {}) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, ...payload }));
      return true;
    }
    return false;
  }, []);

  return {
    isConnected,
    connectionStatus,
    lastEvent,
    reconnect: connect,
    sendEvent,
  };
}

export default useMatterWebSocket;
