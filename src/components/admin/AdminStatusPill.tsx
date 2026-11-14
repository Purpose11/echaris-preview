import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  PENDING:
    "bg-[var(--surface-warning-subtle,#FFF7E8)] text-[var(--text-warning,#9A6700)]",
  APPROVED:
    "bg-[var(--surface-success-subtle,#EAF7EE)] text-[var(--text-success,#067647)]",
  REJECTED: "bg-[var(--surface-danger-subtle,#FEECEC)] text-[var(--text-danger,#B42318)]",
  PAID: "bg-[var(--surface-success-subtle,#EAF7EE)] text-[var(--text-success,#067647)]",
  ACTIVE: "bg-[var(--surface-success-subtle,#EAF7EE)] text-[var(--text-success,#067647)]",
  INACTIVE: "bg-[var(--surface-muted,#F3F1EE)] text-[var(--text-muted)]",
  AWAITING_PAYMENT:
    "bg-[var(--surface-warning-subtle,#FFF7E8)] text-[var(--text-warning,#9A6700)]",
  ACCUMULATING: "bg-[var(--surface-brand-subtle)] text-[var(--text-brand)]",
  MATURED: "bg-[var(--surface-brand-subtle)] text-[var(--text-brand)]",
  LOCKED: "bg-[var(--surface-success-subtle,#EAF7EE)] text-[var(--text-success,#067647)]",
  COMPLETED:
    "bg-[var(--surface-success-subtle,#EAF7EE)] text-[var(--text-success,#067647)]",
  CANCELLED: "bg-[var(--surface-muted,#F3F1EE)] text-[var(--text-muted)]",
  IN_STOCK:
    "bg-[var(--surface-success-subtle,#EAF7EE)] text-[var(--text-success,#067647)]",
  LOW_STOCK:
    "bg-[var(--surface-warning-subtle,#FFF7E8)] text-[var(--text-warning,#9A6700)]",
  OUT_OF_STOCK:
    "bg-[var(--surface-danger-subtle,#FEECEC)] text-[var(--text-danger,#B42318)]",
  MADE_TO_ORDER: "bg-[var(--surface-brand-subtle)] text-[var(--text-brand)]",
};

function labelize(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AdminStatusPill({ status }: { status: string }) {
  const key = status.toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        STYLES[key] ?? "bg-[var(--surface-muted,#F3F1EE)] text-[var(--text-muted)]",
      )}
    >
      {labelize(status)}
    </span>
  );
}
