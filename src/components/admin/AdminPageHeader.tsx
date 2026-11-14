import type { ReactNode } from "react";

import { NotificationsBell } from "@/components/user/NotificationsBell";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  showNotifications?: boolean;
}

export function AdminPageHeader({
  title,
  description,
  actions,
  className,
  showNotifications = true,
}: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="m-0 text-[24px] leading-tight font-extrabold tracking-[-0.03em] text-[var(--text-heading)] sm:text-[28px] md:text-[32px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-[560px] text-sm leading-relaxed text-[var(--text-muted)] sm:mt-3 md:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>
      {(showNotifications || actions) && (
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:shrink-0 sm:justify-end">
          {showNotifications ? <NotificationsBell /> : null}
          {actions ? (
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 sm:flex-initial [&_button]:min-h-11 [&_button]:flex-1 sm:[&_button]:flex-none">
              {actions}
            </div>
          ) : null}
        </div>
      )}
    </header>
  );
}
