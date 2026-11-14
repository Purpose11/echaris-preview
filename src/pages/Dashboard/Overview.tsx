import { Check, Coins, Copy, Store, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useCommitmentsPerformance } from "@/api/commitments/hooks";
import { useCustomerProfile } from "@/api/customer/hooks";
import { useMyFinancings } from "@/api/marketplace/hooks";
import { DashboardOverviewSkeleton } from "@/components/ui/page-skeleton";
import { NotificationsBell } from "@/components/user/NotificationsBell";
import { mapFinancingStatus } from "@/lib/marketplace";
import type { PerformanceChartSeries } from "@/lib/performance-returns";
import { buildChartYTicks, formatChartAxisNaira } from "@/lib/performance-returns";
import { cn } from "@/lib/utils";
import { getLoggedInUser } from "@/utils/authHelper";

function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function ReturnsChart({ series }: { series: PerformanceChartSeries }) {
  const width = 560;
  const height = 220;
  const pad = { top: 16, right: 12, bottom: 28, left: 52 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const labels = series.labels;
  const accumulated = series.accumulated;
  const expected = series.expected;
  const count = Math.max(labels.length, 1);
  const maxValue = Math.max(...accumulated, ...expected, 0);
  const yTicks = buildChartYTicks(maxValue);
  const maxY = yTicks[yTicks.length - 1] || 1;

  const xAt = (index: number) =>
    pad.left + (count === 1 ? innerW / 2 : (index / (count - 1)) * innerW);
  const yAt = (value: number) => pad.top + innerH - (value / maxY) * innerH;

  const points = (values: number[]) =>
    values.map((value, index) => `${xAt(index)},${yAt(value)}`).join(" ");

  const hasSignal = maxValue > 0;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Performance returns chart"
    >
      {yTicks.map((tick) => {
        const y = yAt(tick);
        return (
          <g key={tick}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={y}
              y2={y}
              stroke="var(--border-subtle)"
              strokeDasharray="4 4"
            />
            <text
              x={pad.left - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-[var(--text-muted)] text-[10px]"
            >
              {formatChartAxisNaira(tick)}
            </text>
          </g>
        );
      })}

      {hasSignal ? (
        <>
          <polyline
            fill="none"
            stroke="var(--brand-primary)"
            strokeWidth="2"
            strokeDasharray="5 5"
            strokeLinecap="round"
            points={points(expected)}
          />
          <polyline
            fill="none"
            stroke="var(--brand-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points(accumulated)}
          />
          {accumulated.map((value, index) => (
            <circle
              key={`${labels[index]}-${index}`}
              cx={xAt(index)}
              cy={yAt(value)}
              r="3.5"
              fill="var(--brand-primary)"
            />
          ))}
        </>
      ) : null}

      {labels.map((label, index) => (
        <text
          key={`${label}-${index}`}
          x={xAt(index)}
          y={height - 6}
          textAnchor="middle"
          className="fill-[var(--text-muted)] text-[10px]"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

export default function DashboardOverview() {
  const user = getLoggedInUser();
  const profileQuery = useCustomerProfile();
  const performance = useCommitmentsPerformance();
  const financingsQuery = useMyFinancings({ page: 1, size: 100 });
  const firstName =
    profileQuery.data?.data?.firstName?.trim() || user?.firstName?.trim() || "there";
  const referralCode = profileQuery.data?.data?.referralCode?.trim() || "";
  const [codeCopied, setCodeCopied] = useState(false);
  const codeCopiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const series = performance.series;

  const activeCommitments = useMemo(() => {
    return performance.commitments.filter((item) => {
      const status = String(item.status ?? "")
        .trim()
        .toUpperCase();
      return status === "LOCKED" || status === "ACTIVE";
    });
  }, [performance.commitments]);

  const totalCapitalCommitment = useMemo(
    () => activeCommitments.reduce((sum, item) => sum + (Number(item.capital) || 0), 0),
    [activeCommitments],
  );

  const activeProgramCount = activeCommitments.length;

  const activeMarketplaceCount = useMemo(() => {
    const rows = financingsQuery.data?.data?.data ?? [];
    return rows.filter((item) => {
      const status = mapFinancingStatus(item.status);
      // Only open positions — exclude completed, cancelled, and unknown/pending.
      return (
        status === "Accumulating" ||
        status === "Ready for delivery" ||
        status === "Awaiting payment"
      );
    }).length;
  }, [financingsQuery.data]);

  useEffect(() => {
    return () => {
      if (codeCopiedTimeoutRef.current) {
        clearTimeout(codeCopiedTimeoutRef.current);
      }
    };
  }, []);

  const clearCodeCopied = () => {
    if (codeCopiedTimeoutRef.current) {
      clearTimeout(codeCopiedTimeoutRef.current);
      codeCopiedTimeoutRef.current = null;
    }
    setCodeCopied(false);
  };

  const copyReferral = async () => {
    if (!referralCode) {
      toast.error("Referral code is not available yet");
      return;
    }
    try {
      await navigator.clipboard.writeText(referralCode);
      setCodeCopied(true);
      if (codeCopiedTimeoutRef.current) {
        clearTimeout(codeCopiedTimeoutRef.current);
      }
      codeCopiedTimeoutRef.current = setTimeout(() => {
        setCodeCopied(false);
        codeCopiedTimeoutRef.current = null;
      }, 2000);
    } catch {
      clearCodeCopied();
      toast.error("Could not copy referral code");
    }
  };

  const isPageLoading =
    profileQuery.isLoading || performance.isLoading || financingsQuery.isLoading;

  if (isPageLoading) {
    return <DashboardOverviewSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <header className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[32px]">
            Welcome Back, {firstName}
          </h1>
          <p className="mt-3 max-w-[540px] text-sm leading-relaxed text-[var(--text-muted)] md:text-[15px]">
            Track your capital commitments, performance returns and marketplace activity
            from one place.
          </p>
        </div>
        <NotificationsBell />
      </header>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-lg bg-[var(--brand-primary)] p-6 text-white md:p-8">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 text-[11px] font-semibold tracking-[0.08em] uppercase opacity-90">
              Total capital commitment
            </p>
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-white/20 text-white">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <p className="mt-7 mb-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] md:text-[30px]">
            {formatNaira(totalCapitalCommitment)}
          </p>
          <p className="mt-4 mb-0 text-sm opacity-90">
            {activeProgramCount === 0
              ? "No active growth programs"
              : `Across ${activeProgramCount} active program${activeProgramCount === 1 ? "" : "s"}`}
          </p>
        </article>

        <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
              Performance returns
            </p>
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--orange-50)] text-[var(--brand-primary)]">
              <Coins className="size-4" />
            </span>
          </div>
          <p className="mt-7 mb-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[30px]">
            {formatNaira(series.currentMonthReturn)}
          </p>
          <p className="mt-4 mb-0 text-sm text-[var(--text-muted)]">Earned this month</p>
        </article>

        <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
              Marketplace financing
            </p>
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--orange-50)] text-[var(--brand-primary)]">
              <Store className="size-4" />
            </span>
          </div>
          <p className="mt-7 mb-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[30px]">
            {activeMarketplaceCount}
          </p>
          <p className="mt-4 mb-0 text-sm text-[var(--text-muted)]">
            {activeMarketplaceCount === 0
              ? "No open marketplace financing"
              : "Open marketplace financing"}
          </p>
        </article>
      </section>

      <section className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
        <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="m-0 text-base font-bold text-[var(--text-heading)] md:text-lg">
              Performance returns overview
            </h2>
            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded bg-[var(--brand-primary)]" />
                Accumulated
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded border border-dashed border-[var(--brand-primary)]" />
                Expected
              </span>
            </div>
          </div>
          <ReturnsChart series={series} />
          {series.totalAccumulated <= 0 &&
          series.expected.every((value) => value <= 0) ? (
            <p className="mt-3 mb-0 text-sm text-[var(--text-muted)]">
              Performance returns will appear here once your growth programs start
              accruing.
            </p>
          ) : null}
          <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[var(--border-subtle)] pt-5 sm:grid-cols-3">
            <div>
              <p className="m-0 text-[10px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
                Current month
              </p>
              <p className="mt-2 mb-0 text-sm font-bold text-[var(--text-heading)]">
                {formatNaira(series.currentMonthReturn)}
              </p>
            </div>
            <div>
              <p className="m-0 text-[10px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
                Total accumulated returns
              </p>
              <p className="mt-2 mb-0 text-sm font-bold text-[var(--text-heading)]">
                {formatNaira(series.totalAccumulated)}
              </p>
            </div>
            <div>
              <p className="m-0 text-[10px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
                Next expected return
              </p>
              <p className="mt-2 mb-0 text-sm font-bold text-[var(--text-heading)]">
                {formatNaira(series.nextExpectedReturn)}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 md:p-6">
          <h2 className="m-0 text-base font-bold text-[var(--text-heading)] md:text-lg">
            Referral rewards
          </h2>
          <div className="mt-4 rounded-md bg-[var(--surface-brand-subtle)] px-4 py-4">
            <p className="m-0 text-[10px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
              Referral code
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="min-w-0 font-mono text-lg font-bold tracking-wide break-all text-[var(--text-heading)]">
                {referralCode || "—"}
              </span>
              <button
                type="button"
                disabled={!referralCode}
                onClick={() => void copyReferral()}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50",
                  codeCopied
                    ? "border-[var(--success-100)] bg-[var(--success-50)] text-[var(--text-success)]"
                    : "border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-heading)] hover:bg-[var(--neutral-100)]",
                )}
              >
                {codeCopied ? (
                  <>
                    <Check
                      className="size-3.5 text-[var(--text-success)]"
                      strokeWidth={3}
                    />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 text-[var(--brand-primary)]" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
