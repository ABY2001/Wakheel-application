"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { syncBooksWithServer } from "@/components/academy/booksData";
import {
  syncAssignmentsWithServer,
  syncSubmissionsWithServer,
} from "@/components/academy/homeworkData";
import { syncLecturesWithServer } from "@/components/academy/lectureAudioData";
import { syncMootHistoryWithServer } from "@/components/academy/courtroomLabData";

export type AcademyEventType =
  | "ACADEMY_NEW_ASSIGNMENT"
  | "ACADEMY_HOMEWORK_SUBMITTED"
  | "ACADEMY_SUBMISSION_GRADED"
  | "ACADEMY_NEW_LECTURE"
  | "ACADEMY_NEW_BOOK"
  | "ACADEMY_MOOT_TRIAL_COMPLETED"
  | string;

export interface AcademyToastNotification {
  id: string;
  type: "assignment" | "submission" | "graded" | "lecture" | "book" | "moot" | "system";
  title: string;
  message: string;
  badge: string;
  timestamp: string;
  data?: any;
  meta?: any;
}

export interface AcademyWebSocketEvent {
  type: AcademyEventType;
  data?: any;
  meta?: {
    title?: string;
    faculty?: string;
    facultyName?: string;
    targetBatch?: string;
    studentName?: string;
    assignmentTitle?: string;
    score?: string | number;
    grade?: string;
    feedback?: string;
    evaluatedBy?: string;
    studentEmail?: string;
    subject?: string;
    author?: string;
    verdict?: string;
    caseTitle?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

export interface UseAcademyWebSocketOptions {
  role?: "student" | "teacher" | "faculty" | "advocate" | string;
  userId?: string;
  enabled?: boolean;
  autoSync?: boolean;
  onEvent?: (event: AcademyWebSocketEvent) => void;
  onNewAssignment?: (event: AcademyWebSocketEvent) => void;
  onHomeworkSubmitted?: (event: AcademyWebSocketEvent) => void;
  onSubmissionGraded?: (event: AcademyWebSocketEvent) => void;
  onNewLecture?: (event: AcademyWebSocketEvent) => void;
  onNewBook?: (event: AcademyWebSocketEvent) => void;
  onMootTrialCompleted?: (event: AcademyWebSocketEvent) => void;
}

export function useAcademyWebSocket(options: UseAcademyWebSocketOptions = {}) {
  const {
    role = "student",
    userId = "dev_student",
    enabled = true,
    autoSync = true,
    onEvent,
    onNewAssignment,
    onHomeworkSubmitted,
    onSubmissionGraded,
    onNewLecture,
    onNewBook,
    onMootTrialCompleted,
  } = options;

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "reconnecting"
  >("disconnected");
  const [lastEvent, setLastEvent] = useState<AcademyWebSocketEvent | null>(null);
  const [liveToast, setLiveToast] = useState<AcademyToastNotification | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const toastDismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef<boolean>(false);

  // Keep callback refs current
  const onEventRef = useRef(onEvent);
  const onNewAssignmentRef = useRef(onNewAssignment);
  const onHomeworkSubmittedRef = useRef(onHomeworkSubmitted);
  const onSubmissionGradedRef = useRef(onSubmissionGraded);
  const onNewLectureRef = useRef(onNewLecture);
  const onNewBookRef = useRef(onNewBook);
  const onMootTrialCompletedRef = useRef(onMootTrialCompleted);

  useEffect(() => {
    onEventRef.current = onEvent;
    onNewAssignmentRef.current = onNewAssignment;
    onHomeworkSubmittedRef.current = onHomeworkSubmitted;
    onSubmissionGradedRef.current = onSubmissionGraded;
    onNewLectureRef.current = onNewLecture;
    onNewBookRef.current = onNewBook;
    onMootTrialCompletedRef.current = onMootTrialCompleted;
  });

  const triggerToast = useCallback((toast: Omit<AcademyToastNotification, "id" | "timestamp">) => {
    const id = "toast_" + Date.now();
    const timestamp = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setLiveToast({
      ...toast,
      id,
      timestamp,
    });

    if (toastDismissTimeoutRef.current) {
      clearTimeout(toastDismissTimeoutRef.current);
    }
    toastDismissTimeoutRef.current = setTimeout(() => {
      setLiveToast(null);
    }, 7000);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastDismissTimeoutRef.current) {
      clearTimeout(toastDismissTimeoutRef.current);
    }
    setLiveToast(null);
  }, []);

  const connect = useCallback(() => {
    if (typeof window === "undefined" || !enabled || isUnmountedRef.current) return;

    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch {}
      socketRef.current = null;
    }

    const host = process.env.NEXT_PUBLIC_WS_HOST || `${window.location.hostname}:5001`;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${host}/ws`;

    setConnectionStatus((prev) => (prev === "connected" ? "reconnecting" : "connecting"));

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (isUnmountedRef.current) return;
        setIsConnected(true);
        setConnectionStatus("connected");

        try {
          socket.send(
            JSON.stringify({
              type: "auth",
              userId,
              role,
            })
          );
        } catch (err) {
          console.warn("[Academy WS] Handshake auth warning:", err);
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
          const event: AcademyWebSocketEvent = JSON.parse(rawEvent.data);
          if (!event || !event.type) return;

          if (
            event.type === "pong" ||
            event.type === "auth_ack" ||
            event.type === "subscribed_matters_ack"
          ) {
            return;
          }

          setLastEvent(event);
          onEventRef.current?.(event);

          const meta = event.meta || {};
          const data = event.data || {};

          switch (event.type) {
            case "ACADEMY_NEW_ASSIGNMENT": {
              if (autoSync) syncAssignmentsWithServer().catch(() => {});
              onNewAssignmentRef.current?.(event);
              triggerToast({
                type: "assignment",
                title: "New Drafting Memorial",
                message: `"${meta.title || data.title || "Legal Memorial"}" assigned by ${
                  meta.faculty || data.faculty || "Faculty"
                }`,
                badge: "ASSIGNMENT",
                data,
                meta,
              });
              break;
            }

            case "ACADEMY_HOMEWORK_SUBMITTED": {
              if (autoSync) syncSubmissionsWithServer().catch(() => {});
              onHomeworkSubmittedRef.current?.(event);
              triggerToast({
                type: "submission",
                title: "Memorial Docket Submitted",
                message: `${meta.studentName || data.studentName || "Scholar"} submitted draft for "${
                  meta.assignmentTitle || data.assignmentTitle || "Memorial"
                }"`,
                badge: "SUBMISSION",
                data,
                meta,
              });
              break;
            }

            case "ACADEMY_SUBMISSION_GRADED": {
              if (autoSync) syncSubmissionsWithServer().catch(() => {});
              onSubmissionGradedRef.current?.(event);
              triggerToast({
                type: "graded",
                title: "Memorial Evaluated",
                message: `Grade: ${meta.grade || data.grade || meta.score || "Graded"} — Evaluated by ${
                  meta.evaluatedBy || data.evaluatedBy || "Chambers Faculty"
                }`,
                badge: "EVALUATION",
                data,
                meta,
              });
              break;
            }

            case "ACADEMY_NEW_LECTURE": {
              if (autoSync) syncLecturesWithServer().catch(() => {});
              onNewLectureRef.current?.(event);
              triggerToast({
                type: "lecture",
                title: "New Audio Masterclass",
                message: `"${meta.title || data.title || "Lecture"}" by ${
                  meta.facultyName || data.facultyName || "Faculty"
                }`,
                badge: "AUDIO STUDIO",
                data,
                meta,
              });
              break;
            }

            case "ACADEMY_NEW_BOOK": {
              if (autoSync) syncBooksWithServer().catch(() => {});
              onNewBookRef.current?.(event);
              triggerToast({
                type: "book",
                title: "New Law Treatise Added",
                message: `"${meta.title || data.title || "Book"}" added to Jurisprudence Repository`,
                badge: "REPOSITORY",
                data,
                meta,
              });
              break;
            }

            case "ACADEMY_MOOT_TRIAL_COMPLETED": {
              if (autoSync) syncMootHistoryWithServer().catch(() => {});
              onMootTrialCompletedRef.current?.(event);
              triggerToast({
                type: "moot",
                title: "Moot Trial Concluded",
                message: `${meta.studentName || data.studentName || "Scholar"} finished "${
                  meta.caseTitle || data.caseTitle || "Moot Problem"
                }" — Verdict: ${meta.verdict || data.verdict || "Bench Ruling"}`,
                badge: "3D LAB",
                data,
                meta,
              });
              break;
            }

            default:
              break;
          }
        } catch (e) {
          console.warn("[Academy WS] Message parsing error:", e);
        }
      };

      socket.onerror = () => {
        // Will auto-reconnect on close
      };

      socket.onclose = () => {
        if (isUnmountedRef.current) return;
        setIsConnected(false);
        setConnectionStatus("disconnected");
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isUnmountedRef.current && enabled) {
            connect();
          }
        }, 4000);
      };
    } catch (e) {
      console.warn("[Academy WS] Failed to initialize WebSocket:", e);
      setIsConnected(false);
      setConnectionStatus("disconnected");
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        if (!isUnmountedRef.current && enabled) {
          connect();
        }
      }, 5000);
    }
  }, [enabled, role, userId, autoSync, triggerToast]);

  useEffect(() => {
    isUnmountedRef.current = false;
    connect();

    return () => {
      isUnmountedRef.current = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (toastDismissTimeoutRef.current) clearTimeout(toastDismissTimeoutRef.current);
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
    liveToast,
    dismissToast,
    triggerToast,
    reconnect: connect,
    sendEvent,
  };
}

export default useAcademyWebSocket;
