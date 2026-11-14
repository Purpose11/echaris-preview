import { ArrowLeft, CalendarDays, Coins, TrendingUp } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useMyCommitment } from "@/api/commitments/hooks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  addCommitmentMonths,
  COMMITMENT_STATUS_STYLES,
  type DisplayCommitmentStatus,
  formatCommitmentDate,
  formatCommitmentNaira,
  mapCommitmentStatus,
} from "@/lib/commitments";
import { cn } from "@/lib/utils";
import { normalizeError } from "@/utils/normalizeError";

function StatusPill({ status }: { status: DisplayCommitmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        COMMITMENT_STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

function CommitmentDetailsSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-8 md:gap-10"
      aria-busy="true"
      aria-label="Loading commitment details"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-[min(100%,320px)]" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-[min(100%,420px)]" />
      </div>
      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <article
            key={i}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8"
          >
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-7 h-8 w-36" />
            <Skeleton className="mt-4 h-4 w-32" />
          </article>
        ))}
      </section>
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
        <Skeleton className="mb-5 h-6 w-40" />
        <div className="divide-y divide-[var(--border-subtle)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function CommitmentDetails() {
  const { commitmentId } = useParams<{ commitmentId: string }>();
  const commitmentQuery = useMyCommitment(commitmentId);

  const commitment = commitmentQuery.data?.data;
  const displayStatus = mapCommitmentStatus(commitment?.status);
  const startDate =
    commitment?.startDate || commitment?.fundedAt || commitment?.createdAt || null;
  const maturityDate =
    commitment?.maturityDate ||
    commitment?.endDate ||
    (startDate && commitment
      ? addCommitmentMonths(startDate, commitment.durationMonths)
      : null);
  const monthlyReturns = Math.round(
    (Number(commitment?.capital) || 0) * ((Number(commitment?.monthlyRate) || 0) / 100),
  );
  const expectedTotal = monthlyReturns * (Number(commitment?.durationMonths) || 0);

  if (commitmentQuery.isLoading) {
    return <CommitmentDetailsSkeleton />;
  }

  if (commitmentQuery.isError || !commitment) {
    return (
      <div className="flex w-full flex-col gap-6">
        <Link
          to="/dashboard/commitments"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] no-underline hover:text-[var(--text-heading)]"
        >
          <ArrowLeft className="size-4" />
          Back to commitments
        </Link>
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm leading-relaxed text-[var(--text-danger,#b42318)]">
            {commitmentQuery.isError
              ? normalizeError(commitmentQuery.error)
              : "This commitment could not be found."}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void commitmentQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      </div>
    );
  }

  const detailRows: Array<[string, string]> = [
    ["Commitment name", commitment.name],
    ["Capital commitment", formatCommitmentNaira(Number(commitment.capital) || 0)],
    ["Duration", `${commitment.durationMonths} months`],
    ["Monthly rate", `${Number(commitment.monthlyRate) || 0}%`],
    ["Monthly performance returns", formatCommitmentNaira(monthlyReturns)],
    ["Expected total returns", formatCommitmentNaira(expectedTotal)],
    ["Start date", formatCommitmentDate(startDate)],
    ["Maturity date", formatCommitmentDate(maturityDate)],
    ["Funded at", formatCommitmentDate(commitment.fundedAt)],
    ["Created", formatCommitmentDate(commitment.createdAt)],
  ];

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <header className="flex flex-col gap-5">
        <Link
          to="/dashboard/commitments"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] no-underline hover:text-[var(--text-heading)]"
        >
          <ArrowLeft className="size-4" />
          Back to commitments
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[32px]">
                {commitment.name}
              </h1>
              <StatusPill status={displayStatus} />
            </div>
            <p className="mt-3 mb-0 max-w-[560px] text-sm leading-relaxed text-[var(--text-muted)] md:text-[15px]">
              Review this growth program’s capital, schedule, and performance returns.
            </p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <article className="rounded-lg bg-[var(--brand-primary)] p-6 text-white md:p-8">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 text-[11px] font-semibold tracking-[0.08em] uppercase opacity-90">
              Capital commitment
            </p>
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-white/20 text-white">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <p className="mt-7 mb-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] md:text-[30px]">
            {formatCommitmentNaira(Number(commitment.capital) || 0)}
          </p>
          <p className="mt-4 mb-0 text-sm opacity-90">
            Locked for {commitment.durationMonths} months
          </p>
        </article>

        <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
              Monthly returns
            </p>
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--orange-50)] text-[var(--brand-primary)]">
              <Coins className="size-4" />
            </span>
          </div>
          <p className="mt-7 mb-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[30px]">
            {formatCommitmentNaira(monthlyReturns)}
          </p>
          <p className="mt-4 mb-0 text-sm text-[var(--text-muted)]">
            At {Number(commitment.monthlyRate) || 0}% monthly
          </p>
        </article>

        <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
              Maturity
            </p>
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--neutral-100)] text-[var(--text-muted)]">
              <CalendarDays className="size-4" />
            </span>
          </div>
          <p className="mt-7 mb-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[30px]">
            {formatCommitmentDate(maturityDate)}
          </p>
          <p className="mt-4 mb-0 text-sm text-[var(--text-muted)]">
            Started {formatCommitmentDate(startDate)}
          </p>
        </article>
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
        <h2 className="m-0 text-base font-bold text-[var(--text-heading)] md:text-lg">
          Commitment details
        </h2>
        <dl className="mt-2 mb-0 divide-y divide-[var(--border-subtle)]">
          {detailRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-4">
              <dt className="m-0 text-sm text-[var(--text-muted)]">{label}</dt>
              <dd className="m-0 text-right text-sm font-bold text-[var(--text-heading)]">
                {value}
              </dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-4">
            <dt className="m-0 text-sm text-[var(--text-muted)]">Status</dt>
            <dd className="m-0">
              <StatusPill status={displayStatus} />
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
