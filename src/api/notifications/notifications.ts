import { type ApiResponse, coreApi, createApi } from "@/api/api";
import type { AppNotification, ListNotificationsParams } from "@/api/notifications/types";
import { getAccessToken } from "@/utils/authHelper";

const NOTIFICATION_BASE =
  import.meta.env.VITE_NOTIFICATION_URL?.trim() ||
  import.meta.env.VITE_BASE_URL?.trim() ||
  "";

const notificationApi =
  NOTIFICATION_BASE && NOTIFICATION_BASE !== (import.meta.env.VITE_BASE_URL?.trim() || "")
    ? createApi(NOTIFICATION_BASE)
    : coreApi;

function notificationsBaseUrl() {
  const configured =
    import.meta.env.VITE_NOTIFICATION_URL?.trim() ||
    import.meta.env.VITE_BASE_URL?.trim() ||
    "";
  return configured.replace(/\/$/, "");
}

export async function listMyNotifications(
  params: ListNotificationsParams = {},
): Promise<ApiResponse<AppNotification[]>> {
  const { data } = await notificationApi.get<ApiResponse<AppNotification[]>>(
    "/notifications/private",
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
      },
    },
  );
  return data;
}

export async function getUnreadNotificationCount(): Promise<ApiResponse<number>> {
  const { data } = await notificationApi.get<ApiResponse<number>>(
    "/notifications/private/unread-count",
  );
  return data;
}

export async function markNotificationRead(
  notificationId: string,
): Promise<ApiResponse<AppNotification>> {
  const { data } = await notificationApi.patch<ApiResponse<AppNotification>>(
    `/notifications/private/${notificationId}/read`,
  );
  return data;
}

export async function markAllNotificationsRead(): Promise<ApiResponse<number>> {
  const { data } = await notificationApi.patch<ApiResponse<number>>(
    "/notifications/private/read-all",
  );
  return data;
}

export async function deleteNotification(
  notificationId: string,
): Promise<ApiResponse<null>> {
  const { data } = await notificationApi.delete<ApiResponse<null>>(
    `/notifications/private/${notificationId}`,
  );
  return data;
}

/**
 * Opens the SSE inbox stream with auth headers (EventSource cannot send Bearer).
 * Stream lasts ≤60s — caller should reconnect on close.
 */
export async function openNotificationStream(signal?: AbortSignal): Promise<Response> {
  const token = getAccessToken();
  const apiKey =
    import.meta.env.VITE_ECHARIS_API_KEY ||
    import.meta.env.VITE_MANDATE_SPORT_API_KEY ||
    "";
  const url = `${notificationsBaseUrl()}/notifications/private/stream`;

  return fetch(url, {
    method: "GET",
    headers: {
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(apiKey ? { "x-api-key": apiKey } : {}),
    },
    signal,
    cache: "no-store",
  });
}
