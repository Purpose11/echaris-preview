/** Inbox item from GET /notifications/private. */
export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  referenceType?: string | null;
  referenceId?: string | null;
  data?: Record<string, unknown> | null;
  createdAt: string;
  readAt?: string | null;
}

export interface ListNotificationsParams {
  page?: number;
  size?: number;
}

export type NotificationStreamEventName = "ready" | "notification" | "resync" | string;
