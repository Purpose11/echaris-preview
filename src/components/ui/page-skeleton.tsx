import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function PageHeaderSkeleton({
  withAction = true,
  className,
}: {
  withAction?: boolean;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-3">
        <Skeleton className="h-9 w-[min(100%,280px)]" />
        <Skeleton className="h-4 w-[min(100%,420px)]" />
        <Skeleton className="h-4 w-[min(100%,320px)]" />
      </div>
      {withAction ? (
        <div className="flex shrink-0 items-center gap-3">
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="h-11 w-[180px]" />
        </div>
      ) : null}
    </header>
  );
}

function StatCardsSkeleton({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "grid grid-cols-1 gap-5",
        count >= 4 ? "sm:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <article
          key={i}
          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8"
        >
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="size-8 rounded-md" />
          </div>
          <Skeleton className="mt-7 h-8 w-36" />
          <Skeleton className="mt-4 h-4 w-40" />
        </article>
      ))}
    </section>
  );
}

export function DashboardCommitmentsSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-8 md:gap-10"
      aria-busy="true"
      aria-label="Loading capital commitments"
    >
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={3} />
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Skeleton className="h-6 w-40" />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Skeleton className="h-10 w-full sm:w-[260px]" />
            <Skeleton className="h-10 w-[140px]" />
          </div>
        </div>
        <DataTableSkeleton
          columnCount={7}
          rowCount={5}
          headers={[
            "Growth program",
            "Capital commitment",
            "Monthly returns",
            "Duration",
            "Start date",
            "Maturity",
            "Status",
          ]}
        />
      </section>
    </div>
  );
}

export function DashboardMarketplaceSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-8 md:gap-10"
      aria-busy="true"
      aria-label="Loading marketplace"
    >
      <PageHeaderSkeleton withAction />
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Skeleton className="h-6 w-48" />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Skeleton className="h-10 w-full sm:w-[260px]" />
            <Skeleton className="h-10 w-[140px]" />
          </div>
        </div>
        <DataTableSkeleton
          columnCount={5}
          rowCount={5}
          headers={[
            "Product",
            "Product value",
            "Capital commitment",
            "Returns accumulated",
            "Status",
          ]}
        />
      </section>
    </div>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-8 md:gap-10"
      aria-busy="true"
      aria-label="Loading overview"
    >
      <header className="flex items-start justify-between gap-5">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-9 w-[min(100%,320px)]" />
          <Skeleton className="h-4 w-[min(100%,480px)]" />
          <Skeleton className="h-4 w-[min(100%,360px)]" />
        </div>
        <Skeleton className="size-11 shrink-0 rounded-full" />
      </header>
      <StatCardsSkeleton count={3} />
      <section className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
        <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Skeleton className="h-6 w-56" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-[220px] w-full rounded-lg" />
          <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[var(--border-subtle)] pt-5 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 md:p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-4 h-28 w-full rounded-md" />
        </article>
      </section>
    </div>
  );
}

export function DashboardReferralsSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-8 md:gap-10"
      aria-busy="true"
      aria-label="Loading referrals"
    >
      <PageHeaderSkeleton withAction={false} />
      <section className="grid grid-cols-1 gap-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:grid-cols-2 md:gap-10 md:p-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full max-w-[360px]" />
          <Skeleton className="h-14 w-full rounded-md" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-52" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-6 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Skeleton className="h-6 w-40" />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Skeleton className="h-10 w-full sm:w-[260px]" />
            <Skeleton className="h-10 w-[140px]" />
          </div>
        </div>
        <DataTableSkeleton
          columnCount={3}
          rowCount={5}
          headers={["Client", "Verified", "Status"]}
        />
      </section>
    </div>
  );
}

export function CreateCommitmentSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-10 pb-12"
      aria-busy="true"
      aria-label="Loading create commitment"
    >
      <header className="flex flex-col gap-8">
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-[min(100%,360px)]" />
          <Skeleton className="h-4 w-[min(100%,480px)]" />
        </div>
        <div className="grid grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-1 w-full rounded-full" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </header>
      <div className="flex flex-col gap-0 border-t border-[var(--border-subtle)]">
        {Array.from({ length: 3 }).map((_, i) => (
          <section
            key={i}
            className="grid gap-5 border-b border-[var(--border-subtle)] py-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] md:gap-12"
          >
            <div className="space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full max-w-[280px]" />
              <Skeleton className="h-4 w-full max-w-[220px]" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-11 w-full" />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export { PageHeaderSkeleton, StatCardsSkeleton };
