import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import { useAdminFinancing, useUpdateAdminFulfillmentStatus } from "@/api/admin/hooks";
import type { MarketFulfillmentStatus } from "@/api/marketplace/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { AdminCustomerDetailSkeleton } from "@/components/ui/page-skeleton";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { formatCommitmentDate, formatCommitmentNaira } from "@/lib/commitments";
import { normalizeError } from "@/utils/normalizeError";

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
        {label}
      </p>
      <p className="mt-2 mb-0 text-sm font-medium text-[var(--text-heading)]">
        {value || "—"}
      </p>
    </div>
  );
}

function labelize(value?: string | null) {
  if (!value) return "—";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function nextFulfillmentStatus(params: {
  current?: string | null;
  fulfillmentType?: string | null;
}): MarketFulfillmentStatus | null {
  const current = String(params.current || "").toUpperCase();
  const type = String(params.fulfillmentType || "").toUpperCase();

  if (current === "READY_FOR_FULFILLMENT") return "PREPARING";
  if (current === "PREPARING") return "PACKAGED";
  if (current === "PACKAGED") {
    if (type === "PICKUP") return "READY_FOR_PICKUP";
    if (type === "DELIVERY") return "IN_TRANSIT";
    return null;
  }
  if (current === "IN_TRANSIT" && type === "DELIVERY") return "DELIVERED";
  if (current === "READY_FOR_PICKUP" && type === "PICKUP") return "COLLECTED";
  return null;
}

export default function MarketplaceFinancingDetail() {
  const { financingId = "" } = useParams();
  const financingQuery = useAdminFinancing(financingId);
  const fulfillmentMutation = useUpdateAdminFulfillmentStatus();

  const financing = financingQuery.data?.data;

  if (financingQuery.isLoading) {
    return <AdminCustomerDetailSkeleton />;
  }

  if (financingQuery.isError || !financing) {
    return (
      <div className="flex w-full flex-col gap-8 md:gap-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          <Link
            to="/admin/marketplace"
            className="font-semibold text-[var(--text-brand)] no-underline hover:underline"
          >
            Marketplace
          </Link>
          <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)" }} />
          <span className="text-[var(--text-muted)]">Financing</span>
        </nav>
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm text-[var(--text-danger,#b42318)]">
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

  const productName = financing.productName || financing.product?.name || "—";
  const productPrice = Number(financing.productPrice ?? financing.product?.price ?? 0);
  const returns = Number(
    financing.accumulatedReturns ?? financing.returnsAccumulated ?? 0,
  );
  const fulfillment = financing.fulfillment;
  const nextStatus = nextFulfillmentStatus({
    current: financing.fulfillmentStatus,
    fulfillmentType: fulfillment?.type,
  });
  const history = financing.fulfillmentHistory ?? [];

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          to="/admin/marketplace"
          className="font-semibold text-[var(--text-brand)] no-underline hover:underline"
        >
          Marketplace
        </Link>
        <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)" }} />
        <span className="truncate text-[var(--text-muted)]">
          {financing.name || "Financing"}
        </span>
      </nav>

      <AdminPageHeader
        title={financing.name || "Marketplace financing"}
        description={`${productName} · ${formatCommitmentNaira(Number(financing.capital) || 0)}`}
        actions={<AdminStatusPill status={String(financing.status)} />}
      />

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
        <h2 className="mt-0 mb-6 text-base font-semibold text-[var(--text-heading)]">
          Financing details
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Product" value={productName} />
          <Field
            label="Product price"
            value={productPrice > 0 ? formatCommitmentNaira(productPrice) : "—"}
          />
          <Field
            label="Quantity"
            value={financing.productQuantity ?? financing.quantity ?? "—"}
          />
          <Field
            label="Capital"
            value={formatCommitmentNaira(Number(financing.capital) || 0)}
          />
          <Field
            label="Monthly rate"
            value={financing.monthlyRate != null ? `${financing.monthlyRate}%` : "—"}
          />
          <Field label="Accumulated returns" value={formatCommitmentNaira(returns)} />
          <Field
            label="Fulfillment status"
            value={
              financing.fulfillmentStatus ? (
                <AdminStatusPill status={String(financing.fulfillmentStatus)} />
              ) : (
                "—"
              )
            }
          />
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="m-0 text-base font-semibold text-[var(--text-heading)]">
            Fulfillment
          </h2>
          {nextStatus ? (
            <Button
              type="button"
              className="h-10 shrink-0 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
              loading={fulfillmentMutation.isPending}
              onClick={() =>
                fulfillmentMutation.mutate({
                  financingId: financing.id,
                  status: nextStatus,
                })
              }
            >
              Mark as {labelize(nextStatus)}
            </Button>
          ) : null}
        </div>

        {fulfillment ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Type" value={labelize(String(fulfillment.type))} />
            <Field
              label="Address"
              value={fulfillment.address || fulfillment.deliveryAddress || "—"}
            />
            <Field label="Phone number" value={fulfillment.phoneNumber || "—"} />
          </div>
        ) : (
          <p className="m-0 text-sm text-[var(--text-muted)]">
            No fulfillment details available.
          </p>
        )}

        {history.length > 0 ? (
          <div className="mt-8">
            <h3 className="mt-0 mb-4 text-sm font-semibold text-[var(--text-heading)]">
              Status history
            </h3>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {history.map((entry, index) => (
                <li
                  key={`${entry.changedAt || "change"}-${index}`}
                  className="rounded-md border border-[var(--border-subtle)] px-4 py-3"
                >
                  <p className="m-0 text-sm font-medium text-[var(--text-heading)]">
                    {labelize(entry.previousStatus)} → {labelize(entry.newStatus)}
                  </p>
                  <p className="mt-1 mb-0 text-xs text-[var(--text-muted)]">
                    {formatCommitmentDate(entry.changedAt)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
