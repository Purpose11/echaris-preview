import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import type { AdminUserPayment } from "@/api/admin/domain";
import { useAdminPayments } from "@/api/admin/hooks";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/design-system/components/core/Button.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Select } from "@/design-system/components/forms/Select.jsx";
import { formatCommitmentNaira } from "@/lib/commitments";
import { normalizeError } from "@/utils/normalizeError";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "PAID", label: "Paid" },
];

const PURPOSE_OPTIONS = [
  { value: "", label: "All purposes" },
  { value: "COMMITMENT", label: "Commitment" },
  { value: "MARKETPLACE_FINANCING", label: "Marketplace financing" },
  { value: "ORDER", label: "Order" },
  { value: "CUSTOMER_PAYOUT", label: "Customer payout" },
];

export default function Payments() {
  const [status, setStatus] = useState("");
  const [purpose, setPurpose] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const paymentsQuery = useAdminPayments({
    page: page + 1,
    size: pageSize,
    status: status || undefined,
    purpose: purpose || undefined,
  });

  const rows = paymentsQuery.data?.data?.data ?? [];
  const totalPages = paymentsQuery.data?.data?.totalPage ?? 0;

  const columns = useMemo<ColumnDef<AdminUserPayment>[]>(
    () => [
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) =>
          row.original.customerName ||
          row.original.customerEmail ||
          row.original.userId ||
          "—",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCommitmentNaira(Number(row.original.amount) || 0),
      },
      {
        accessorKey: "purpose",
        header: "Purpose",
        cell: ({ row }) => String(row.original.purpose || "—").replace(/_/g, " "),
      },
      {
        accessorKey: "direction",
        header: "Direction",
        cell: ({ row }) => row.original.direction || "—",
      },
      {
        accessorKey: "reference",
        header: "Reference",
        cell: ({ row }) => row.original.reference || "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <AdminStatusPill status={String(row.original.status)} />,
      },
    ],
    [],
  );

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <AdminPageHeader
        title="Payments"
        description="Track user payments and payouts across commitments, marketplace, and orders."
      />

      <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:max-w-[480px] sm:grid-cols-2">
        <FormField label="Status" htmlFor="payment-status">
          <Select
            id="payment-status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            options={STATUS_OPTIONS}
          />
        </FormField>
        <FormField label="Purpose" htmlFor="payment-purpose">
          <Select
            id="payment-purpose"
            value={purpose}
            onChange={(e) => {
              setPurpose(e.target.value);
              setPage(0);
            }}
            options={PURPOSE_OPTIONS}
          />
        </FormField>
      </div>

      {paymentsQuery.isError ? (
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm text-[var(--text-danger,#b42318)]">
            {normalizeError(paymentsQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void paymentsQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={paymentsQuery.isLoading}
          emptyMessage="No payments found."
          manualPagination
          pageCount={Math.max(totalPages, 1)}
          pagination={{ pageIndex: page, pageSize }}
          onPaginationChange={(updater) => {
            const next =
              typeof updater === "function"
                ? updater({ pageIndex: page, pageSize })
                : updater;
            setPage(next.pageIndex);
          }}
          hidePaginationWhenSinglePage={false}
        />
      )}
    </div>
  );
}
