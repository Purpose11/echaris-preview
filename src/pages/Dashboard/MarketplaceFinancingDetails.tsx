import { ArrowLeft, Coins, Package, TrendingUp } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useMyFinancing, useMyFinancingReturns } from "@/api/marketplace/hooks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCommitmentDate, formatCommitmentNaira } from "@/lib/commitments";
import {
  type DisplayFinancingStatus,
  FINANCING_STATUS_STYLES,
  financingFulfillmentAddress,
  financingProductName,
  financingProductValue,
  financingQuantity,
  financingReturns,
  mapFinancingStatus,
} from "@/lib/marketplace";
import { cn } from "@/lib/utils";
import { normalizeError } from "@/utils/normalizeError";

function StatusPill({ status }: { status: DisplayFinancingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        FINANCING_STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

function FinancingDetailsSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-8 md:gap-10"
      aria-busy="true"
      aria-label="Loading financing details"
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
          {Array.from({ length: 4 }).map((_, i) => (
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

export default function MarketplaceFinancingDetails() {
  const { financingId } = useParams<{ financingId: string }>();
  const financingQuery = useMyFinancing(financingId);
  const returnsQuery = useMyFinancingReturns(financingId, {
    page: 1,
    size: 50,
  });

  const financing = financingQuery.data?.data;
  const displayStatus = mapFinancingStatus(financing?.status);
  const returns = returnsQuery.data?.data?.data ?? [];

  if (financingQuery.isLoading) {
    return <FinancingDetailsSkeleton />;
  }

  if (financingQuery.isError || !financing) {
    return (
      <div className="flex w-full flex-col gap-6">
        <Link
          to="/dashboard/marketplace"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[var(--text-muted)] no-underline hover:text-[var(--text-heading)]"
        >
          <ArrowLeft className="size-4" />
          Back to marketplace
        </Link>
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm leading-relaxed text-[var(--text-danger,#b42318)]">
            {financingQuery.isError
              ? normalizeError(financingQuery.error)
              : "Financing not found."}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void financingQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      </div>
    );
  }

  const productName = financingProductName(financing);
  const productValue = financingProductValue(financing);
  const returnsTotal = financingReturns(financing);
  const quantity = financingQuantity(financing);
  const fulfillment = financing.fulfillment;
  const fulfillmentAddress = financingFulfillmentAddress(financing);
  const monthlyRate = Number(financing.monthlyRate);
  const hasMonthlyRate = Number.isFinite(monthlyRate) && monthlyRate > 0;

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <header className="flex flex-col gap-5">
        <Link
          to="/dashboard/marketplace"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[var(--text-muted)] no-underline hover:text-[var(--text-heading)]"
        >
          <ArrowLeft className="size-4" />
          Back to marketplace
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[32px]">
            {productName}
          </h1>
          <StatusPill status={displayStatus} />
        </div>
        {financing.name && financing.name !== productName ? (
          <p className="m-0 text-sm text-[var(--text-muted)]">{financing.name}</p>
        ) : null}
      </header>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
              Product value
            </p>
            <span className="inline-flex size-8 items-center justify-center rounded-md bg-[var(--surface-brand-subtle)] text-[var(--brand-primary)]">
              <Package className="size-4" />
            </span>
          </div>
          <p className="mt-7 mb-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[30px]">
            {formatCommitmentNaira(productValue)}
          </p>
        </article>

        <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
              Capital commitment
            </p>
            <span className="inline-flex size-8 items-center justify-center rounded-md bg-[var(--surface-brand-subtle)] text-[var(--brand-primary)]">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <p className="mt-7 mb-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[30px]">
            {formatCommitmentNaira(Number(financing.capital) || 0)}
          </p>
        </article>

        <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
              Returns accumulated
            </p>
            <span className="inline-flex size-8 items-center justify-center rounded-md bg-[var(--surface-brand-subtle)] text-[var(--brand-primary)]">
              <Coins className="size-4" />
            </span>
          </div>
          <p className="mt-7 mb-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[30px]">
            {formatCommitmentNaira(returnsTotal)}
          </p>
          {hasMonthlyRate ? (
            <p className="mt-4 mb-0 text-sm text-[var(--text-muted)]">
              At {monthlyRate}% monthly
            </p>
          ) : null}
        </article>
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
        <h2 className="m-0 mb-5 text-base font-bold text-[var(--text-heading)] md:text-lg">
          Details
        </h2>
        <div className="divide-y divide-[var(--border-subtle)]">
          <div className="flex items-center justify-between gap-4 py-4">
            <span className="text-sm text-[var(--text-muted)]">Quantity</span>
            <span className="text-sm font-semibold text-[var(--text-heading)]">
              {quantity}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 py-4">
            <span className="text-sm text-[var(--text-muted)]">Created</span>
            <span className="text-sm font-semibold text-[var(--text-heading)]">
              {formatCommitmentDate(financing.createdAt)}
            </span>
          </div>
          {financing.nextReturnAt ? (
            <div className="flex items-center justify-between gap-4 py-4">
              <span className="text-sm text-[var(--text-muted)]">Next return</span>
              <span className="text-sm font-semibold text-[var(--text-heading)]">
                {formatCommitmentDate(financing.nextReturnAt)}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4 py-4">
            <span className="text-sm text-[var(--text-muted)]">Fulfillment</span>
            <span className="text-sm font-semibold text-[var(--text-heading)]">
              {fulfillment?.type ? String(fulfillment.type).replace(/_/g, " ") : "—"}
            </span>
          </div>
          {fulfillmentAddress ? (
            <div className="flex items-center justify-between gap-4 py-4">
              <span className="text-sm text-[var(--text-muted)]">
                {String(fulfillment?.type ?? "")
                  .toUpperCase()
                  .includes("PICKUP")
                  ? "Pickup address"
                  : "Delivery address"}
              </span>
              <span className="max-w-[60%] text-right text-sm font-semibold text-[var(--text-heading)]">
                {fulfillmentAddress}
              </span>
            </div>
          ) : null}
          {fulfillment?.phoneNumber ? (
            <div className="flex items-center justify-between gap-4 py-4">
              <span className="text-sm text-[var(--text-muted)]">Phone</span>
              <span className="text-sm font-semibold text-[var(--text-heading)]">
                {fulfillment.phoneNumber}
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
        <h2 className="m-0 mb-5 text-base font-bold text-[var(--text-heading)] md:text-lg">
          Returns history
        </h2>
        {returnsQuery.isError ? (
          <p className="m-0 text-sm text-[var(--text-danger,#b42318)]">
            {normalizeError(returnsQuery.error)}
          </p>
        ) : returnsQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : returns.length === 0 ? (
          <p className="m-0 text-sm text-[var(--text-muted)]">No returns recorded yet.</p>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {returns.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="m-0 text-sm font-semibold text-[var(--text-heading)]">
                    {item.monthNumber != null ? `Month ${item.monthNumber}` : "Return"}
                  </p>
                  <p className="mt-1 mb-0 text-xs text-[var(--text-muted)]">
                    {formatCommitmentDate(item.createdAt)}
                    {item.status ? ` · ${item.status}` : ""}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[var(--text-heading)]">
                  {formatCommitmentNaira(Number(item.amount) || 0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
