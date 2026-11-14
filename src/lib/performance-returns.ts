import type { Commitment, InterestReturn } from "@/api/commitments/types";
import { addCommitmentMonths } from "@/lib/commitments";

export type PerformanceChartSeries = {
  labels: string[];
  /** Cumulative realized returns through each month. */
  accumulated: number[];
  /** Cumulative expected returns through each month. */
  expected: number[];
  currentMonthReturn: number;
  totalAccumulated: number;
  nextExpectedReturn: number;
};

function isFundedCommitment(status: string | null | undefined) {
  const normalized = String(status ?? "")
    .trim()
    .toUpperCase();
  return (
    normalized === "LOCKED" ||
    normalized === "ACTIVE" ||
    normalized === "COMPLETED" ||
    normalized === "COMPLETE"
  );
}

function isRealizedReturn(status: string | null | undefined) {
  const normalized = String(status ?? "")
    .trim()
    .toUpperCase();
  return (
    normalized === "PAID" ||
    normalized === "WITHDRAWN" ||
    normalized === "AVAILABLE" ||
    normalized === "CREDITED"
  );
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-GB", { month: "short" });
}

function emptySeries(now = new Date()): PerformanceChartSeries {
  const labels: string[] = [];
  const zeros: number[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(monthLabel(date));
    zeros.push(0);
  }
  return {
    labels,
    accumulated: zeros,
    expected: zeros,
    currentMonthReturn: 0,
    totalAccumulated: 0,
    nextExpectedReturn: 0,
  };
}

type MonthBucket = {
  date: Date;
  expected: number;
  accumulated: number;
};

/**
 * Builds cumulative performance series from funded growth programs and their
 * interest-return schedules. Falls back to capital × monthly rate when returns
 * have not been issued yet.
 */
export function buildPerformanceChartSeries(
  commitments: Commitment[],
  returnsByCommitmentId: Record<string, InterestReturn[]>,
  now = new Date(),
): PerformanceChartSeries {
  const bucketMap = new Map<string, MonthBucket>();

  const ensureBucket = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    const key = monthKey(date);
    let bucket = bucketMap.get(key);
    if (!bucket) {
      bucket = {
        date: new Date(date.getFullYear(), date.getMonth(), 1),
        expected: 0,
        accumulated: 0,
      };
      bucketMap.set(key, bucket);
    }
    return bucket;
  };

  for (const commitment of commitments) {
    if (!isFundedCommitment(commitment.status)) continue;

    const startIso =
      commitment.fundedAt || commitment.startDate || commitment.createdAt || null;
    if (!startIso) continue;

    const returns = returnsByCommitmentId[commitment.id] ?? [];

    if (returns.length > 0) {
      for (const item of returns) {
        const monthNumber = Math.max(1, Number(item.monthNumber) || 1);
        const dueIso = addCommitmentMonths(startIso, monthNumber);
        if (!dueIso) continue;
        const bucket = ensureBucket(dueIso);
        if (!bucket) continue;
        const amount = Number(item.amount) || 0;
        bucket.expected += amount;
        if (isRealizedReturn(item.status)) {
          bucket.accumulated += amount;
        }
      }
      continue;
    }

    const monthly = Math.round(
      (Number(commitment.capital) || 0) * ((Number(commitment.monthlyRate) || 0) / 100),
    );
    if (monthly <= 0) continue;

    const duration = Math.max(0, Number(commitment.durationMonths) || 0);
    for (let month = 1; month <= duration; month += 1) {
      const dueIso = addCommitmentMonths(startIso, month);
      if (!dueIso) continue;
      const due = new Date(dueIso);
      if (Number.isNaN(due.getTime())) continue;
      const bucket = ensureBucket(dueIso);
      if (!bucket) continue;
      bucket.expected += monthly;
      const elapsed =
        due.getFullYear() < now.getFullYear() ||
        (due.getFullYear() === now.getFullYear() && due.getMonth() < now.getMonth());
      if (elapsed) {
        bucket.accumulated += monthly;
      }
    }
  }

  if (bucketMap.size === 0) {
    return emptySeries(now);
  }

  const allSorted = [...bucketMap.values()].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  const window = allSorted.length > 6 ? allSorted.slice(-6) : allSorted;
  const windowStart = window[0]?.date.getTime() ?? 0;

  let runningExpected = 0;
  let runningAccumulated = 0;
  for (const bucket of allSorted) {
    if (bucket.date.getTime() < windowStart) {
      runningExpected += bucket.expected;
      runningAccumulated += bucket.accumulated;
    }
  }

  const labels: string[] = [];
  const expected: number[] = [];
  const accumulated: number[] = [];

  for (const bucket of window) {
    runningExpected += bucket.expected;
    runningAccumulated += bucket.accumulated;
    labels.push(monthLabel(bucket.date));
    expected.push(runningExpected);
    accumulated.push(runningAccumulated);
  }

  const currentBucket =
    allSorted.find(
      (bucket) =>
        bucket.date.getFullYear() === now.getFullYear() &&
        bucket.date.getMonth() === now.getMonth(),
    ) ?? window[window.length - 1];

  let nextExpectedReturn = 0;
  for (const bucket of allSorted) {
    const isCurrentOrFuture =
      bucket.date.getFullYear() > now.getFullYear() ||
      (bucket.date.getFullYear() === now.getFullYear() &&
        bucket.date.getMonth() >= now.getMonth());
    if (!isCurrentOrFuture) continue;
    const pending = Math.max(0, bucket.expected - bucket.accumulated);
    if (pending > 0) {
      nextExpectedReturn = pending;
      break;
    }
  }

  if (nextExpectedReturn === 0) {
    for (const bucket of allSorted) {
      if (bucket.date.getTime() > (currentBucket?.date.getTime() ?? 0)) {
        nextExpectedReturn = bucket.expected;
        if (nextExpectedReturn > 0) break;
      }
    }
  }

  return {
    labels,
    expected,
    accumulated,
    currentMonthReturn: currentBucket?.accumulated || currentBucket?.expected || 0,
    totalAccumulated: accumulated[accumulated.length - 1] || 0,
    nextExpectedReturn,
  };
}

export function formatChartAxisNaira(value: number) {
  if (value === 0) return "₦0";
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `₦${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}m`;
  }
  if (value >= 1_000) {
    return `₦${Math.round(value / 1_000)}k`;
  }
  return `₦${Math.round(value)}`;
}

export function buildChartYTicks(maxValue: number) {
  const ceiling = Math.max(maxValue, 1);
  const rough = ceiling / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = Math.max(magnitude, Math.ceil(rough / magnitude) * magnitude);
  const top = Math.ceil(ceiling / step) * step;
  return [0, step, step * 2, step * 3, top];
}
