import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import {
  deleteNotification,
  getUnreadNotificationCount,
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  openNotificationStream,
} from "@/api/notifications/notifications";
import { notificationKeys } from "@/api/notifications/querykeys";
import type {
  AppNotification,
  ListNotificationsParams,
  NotificationStreamEventName,
} from "@/api/notifications/types";
import { getAccessToken } from "@/utils/authHelper";
import { normalizeError } from "@/utils/normalizeError";

export function useMyNotifications(params: ListNotificationsParams = {}) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => listMyNotifications(params),
    enabled: Boolean(getAccessToken()),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => getUnreadNotificationCount(),
    enabled: Boolean(getAccessToken()),
    refetchInterval: 60_000,
  });
}

function invalidateNotificationQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: (res) => {
      const updated = res.data;
      queryClient.setQueriesData(
        { queryKey: notificationKeys.lists() },
        (
          current:
            { success: boolean; message: string; data: AppNotification[] } | undefined,
        ) => {
          if (!current?.data || !updated) return current;
          return {
            ...current,
            data: current.data.map((item) => (item.id === updated.id ? updated : item)),
          };
        },
      );
      invalidateNotificationQueries(queryClient);
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: (res, notificationId) => {
      queryClient.setQueriesData(
        { queryKey: notificationKeys.lists() },
        (
          current:
            { success: boolean; message: string; data: AppNotification[] } | undefined,
        ) => {
          if (!current?.data) return current;
          return {
            ...current,
            data: current.data.filter((item) => item.id !== notificationId),
          };
        },
      );
      invalidateNotificationQueries(queryClient);
      toast.success(res.message || "Notification deleted");
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

function parseSseChunk(buffer: string) {
  const events: Array<{ event: NotificationStreamEventName; data: string }> = [];
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";

  for (const part of parts) {
    if (!part.trim() || part.trim().startsWith(":")) continue;
    let event: NotificationStreamEventName = "message";
    const dataLines: string[] = [];
    for (const line of part.split("\n")) {
      if (line.startsWith("event:")) {
        event = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trim());
      }
    }
    events.push({ event, data: dataLines.join("\n") });
  }

  return { events, rest };
}

/** Keeps the SSE inbox stream alive while the client portal is open. */
export function useNotificationStream(enabled = true) {
  const queryClient = useQueryClient();
  const retryRef = useRef(0);

  useEffect(() => {
    if (!enabled || !getAccessToken()) return;

    let cancelled = false;
    let abort: AbortController | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const refreshInbox = () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    };

    const connect = async () => {
      if (cancelled) return;
      abort = new AbortController();

      try {
        const response = await openNotificationStream(abort.signal);
        if (!response.ok || !response.body) {
          throw new Error(`Notification stream failed (${response.status})`);
        }

        retryRef.current = 0;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!cancelled) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parsed = parseSseChunk(buffer);
          buffer = parsed.rest;

          for (const item of parsed.events) {
            if (item.event === "ready" || item.event === "resync") {
              refreshInbox();
              continue;
            }
            if (item.event === "notification") {
              refreshInbox();
              try {
                const payload = JSON.parse(item.data) as AppNotification;
                if (payload?.title) {
                  toast.message(payload.title, {
                    description: payload.message,
                  });
                }
              } catch {
                // data may be a plain string — still refreshed inbox above
              }
            }
          }
        }
      } catch (error) {
        if (cancelled || (error as { name?: string })?.name === "AbortError") {
          return;
        }
      } finally {
        abort = null;
      }

      if (cancelled) return;
      const delay = Math.min(30_000, 1000 * 2 ** retryRef.current);
      retryRef.current += 1;
      reconnectTimer = setTimeout(() => {
        void connect();
      }, delay);
    };

    void connect();

    return () => {
      cancelled = true;
      abort?.abort();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [enabled, queryClient]);
}
