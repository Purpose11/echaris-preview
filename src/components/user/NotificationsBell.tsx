import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMyNotifications,
  useUnreadNotificationCount,
} from "@/api/notifications/hooks";
import type { AppNotification } from "@/api/notifications/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function formatRelativeTime(value: string | null | undefined) {
  if (!value) return "";
  const normalized = /T/.test(value) ? value : value.trim().replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = date.getTime() - Date.now();
  const absSec = Math.round(Math.abs(diffMs) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absSec < 60) return rtf.format(Math.round(diffMs / 1000), "second");
  const absMin = Math.round(absSec / 60);
  if (absMin < 60) return rtf.format(Math.round(diffMs / 60_000), "minute");
  const absHr = Math.round(absMin / 60);
  if (absHr < 24) return rtf.format(Math.round(diffMs / 3_600_000), "hour");
  return rtf.format(Math.round(diffMs / 86_400_000), "day");
}

function notificationHref(item: AppNotification): string | null {
  const type = String(item.referenceType ?? item.type ?? "")
    .trim()
    .toUpperCase();
  const id = item.referenceId?.trim();
  if (!id) return null;

  if (type.includes("COMMITMENT")) {
    return `/dashboard/commitments/${id}`;
  }
  if (type.includes("MARKET") || type.includes("FINANCING") || type.includes("PRODUCT")) {
    return `/dashboard/marketplace/${id}`;
  }
  return null;
}

export function NotificationsBell({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const unreadQuery = useUnreadNotificationCount();
  const inboxQuery = useMyNotifications({ page: 1, size: 20 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const removeNotification = useDeleteNotification();

  const unread = Number(unreadQuery.data?.data) || 0;
  const items = useMemo(() => inboxQuery.data?.data ?? [], [inboxQuery.data]);
  const hasUnread = items.some((item) => !item.readAt) || unread > 0;

  const onOpenItem = async (item: AppNotification) => {
    if (!item.readAt) {
      try {
        await markRead.mutateAsync(item.id);
      } catch {
        // error toast handled in hook
      }
    }
    const href = notificationHref(item);
    setOpen(false);
    if (href) navigate(href);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-heading)] outline-none hover:bg-[var(--neutral-50)] focus-visible:border-[var(--brand-primary)]",
            className,
          )}
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        >
          <Bell className="size-5" />
          {unread > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-primary)] px-1 text-[10px] font-bold text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(100vw-2rem,360px)] p-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <DropdownMenuLabel className="p-0 text-sm font-bold text-[var(--text-heading)]">
            Notifications
          </DropdownMenuLabel>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs font-semibold"
            disabled={!hasUnread || markAllRead.isPending}
            onClick={() => void markAllRead.mutateAsync()}
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        </div>
        <DropdownMenuSeparator className="m-0" />

        <div className="max-h-[min(70vh,420px)] overflow-y-auto">
          {inboxQuery.isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : inboxQuery.isError ? (
            <div className="space-y-3 p-4">
              <p className="m-0 text-sm text-[var(--text-danger,#b42318)]">
                Could not load notifications.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => void inboxQuery.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : items.length === 0 ? (
            <p className="m-0 px-4 py-10 text-center text-sm text-[var(--text-muted)]">
              No notifications yet.
            </p>
          ) : (
            <ul className="m-0 list-none p-0">
              {items.map((item) => {
                const unreadItem = !item.readAt;
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "border-b border-[var(--border-subtle)] last:border-b-0",
                      unreadItem && "bg-[var(--surface-brand-subtle)]",
                    )}
                  >
                    <div className="flex items-start gap-2 px-3 py-3">
                      <button
                        type="button"
                        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-left"
                        onClick={() => void onOpenItem(item)}
                      >
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-[var(--text-heading)]">
                            {item.title}
                          </span>
                          {unreadItem ? (
                            <span className="mt-1 size-2 shrink-0 rounded-full bg-[var(--brand-primary)]" />
                          ) : null}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-[var(--text-muted)]">
                          {item.message}
                        </span>
                        <span className="mt-2 block text-[11px] text-[var(--text-subtle)]">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-[var(--text-muted)] hover:bg-[var(--neutral-100)] hover:text-[var(--text-danger,#b42318)]"
                        aria-label="Delete notification"
                        disabled={removeNotification.isPending}
                        onClick={(event) => {
                          event.stopPropagation();
                          void removeNotification.mutateAsync(item.id);
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
