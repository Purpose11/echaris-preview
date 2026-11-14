import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { useAdminFinancings, useUpdateAdminFinancingPayment } from "@/api/admin/hooks";
import type { MarketFinancing } from "@/api/marketplace/types";
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
  { value: "AWAITING_PAYMENT", label: "Awaiting payment" },
  { value: "ACCUMULATING", label: "Accumulating" },
  { value: "MATURED", label: "Matured" },
];

export default function Marketplace() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const paymentMutation = useUpdateAdminFinancingPayment();

  const financingsQuery = useAdminFinancings({
    page: page + 1,
    size: pageSize,
    status: status || undefined,
  });

  const rows = financingsQuery.data?.data?.data ?? [];
  const totalPages = financingsQuery.data?.data?.totalPage ?? 0;

  const columns = useMemo<ColumnDef<MarketFinancing>[]>(
    () => [
      {
        id: "product",
        header: "Product",
        cell: ({ row }) => (
          <span className="font-semibold text-[var(--text-heading)]">
            {row.original.productName ||
              row.original.product?.name ||
              row.original.name ||
              "—"}
          </span>
        ),
      },
      {
        accessorKey: "capital",
        header: "Capital",
        cell: ({ row }) => formatCommitmentNaira(Number(row.original.capital) || 0),
      },
      {
        id: "returns",
        header: "Returns",
        cell: ({ row }) =>
          formatCommitmentNaira(
            Number(
              row.original.accumulatedReturns ?? row.original.returnsAccumulated ?? 0,
            ) || 0,
          ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <AdminStatusPill status={String(row.original.status)} />,
      },
      {
        id: "actions",
        header: "Payment review",
        cell: ({ row }) => {
          const awaiting =
            String(row.original.status).toUpperCase() === "AWAITING_PAYMENT";
          if (!awaiting) return "—";
          return (
            <div className="flex min-w-[148px] flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                className="h-9 rounded-md border-0 px-3 text-xs font-semibold shadow-none ring-0"
                loading={paymentMutation.isPending}
                onClick={() =>
                  paymentMutation.mutate({
                    financingId: row.original.id,
                    status: "APPROVED",
                  })
                }
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-md px-3 text-xs font-semibold shadow-none"
                loading={paymentMutation.isPending}
                onClick={() =>
                  paymentMutation.mutate({
                    financingId: row.original.id,
                    status: "REJECTED",
                    reason: "Payment rejected by admin",
                  })
                }
              >
                Reject
              </Button>
            </div>
          );
        },
      },
    ],
    [paymentMutation],
  );

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <AdminPageHeader
        title="Marketplace"
        description="Review financing programs and approve or reject funding payments."
      />

      <div className="w-full min-w-0 sm:max-w-[240px]">
        <FormField label="Status" htmlFor="financing-status">
          <Select
            id="financing-status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            options={STATUS_OPTIONS}
          />
        </FormField>
      </div>

      {financingsQuery.isError ? (
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm text-[var(--text-danger,#b42318)]">
            {normalizeError(financingsQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void financingsQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={financingsQuery.isLoading}
          emptyMessage="No marketplace financings found."
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
