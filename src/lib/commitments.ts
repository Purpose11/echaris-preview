export type DisplayCommitmentStatus =
  "Active" | "Completed" | "Pending" | "Awaiting payment" | "Cancelled";

export function mapCommitmentStatus(
  status: string | null | undefined,
): DisplayCommitmentStatus {
  const normalized = String(status ?? "")
    .trim()
    .toUpperCase();
  if (normalized === "LOCKED" || normalized === "ACTIVE") return "Active";
  if (normalized === "COMPLETED" || normalized === "COMPLETE") return "Completed";
  if (normalized === "AWAITING_PAYMENT") return "Awaiting payment";
  if (normalized === "CANCELLED" || normalized === "CANCELED") return "Cancelled";
  if (normalized === "PENDING") return "Pending";
  return "Pending";
}

export const COMMITMENT_STATUS_STYLES: Record<DisplayCommitmentStatus, string> = {
  Active: "bg-[var(--success-50)] text-[var(--text-success)]",
  Completed: "bg-[var(--info-50)] text-[var(--text-info)]",
  "Awaiting payment": "bg-[var(--orange-50)] text-[var(--text-brand)]",
  Pending: "bg-[var(--neutral-100)] text-[var(--text-muted)]",
  Cancelled: "bg-[var(--danger-50)] text-[var(--text-danger)]",
};

export function formatCommitmentNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCommitmentDate(iso: string | null | undefined) {
  if (!iso) return "—";
  // API sometimes returns "YYYY-MM-DD HH:mm:ss" — normalize for reliable parsing.
  const normalized = /T/.test(iso) ? iso : iso.trim().replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function addCommitmentMonths(iso: string, months: number) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result.toISOString();
}
