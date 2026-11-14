import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import type { AdminCommitment } from "@/api/admin/domain";
import { useAdminCommitments } from "@/api/admin/hooks";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/design-system/components/core/Button.jsx";
import { formatCommitmentNaira } from "@/lib/commitments";
import { normalizeError } from "@/utils/normalizeError";

export default function Commitments() {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const commitmentsQuery = useAdminCommitments({
    page: page + 1,
    size: pageSize,
  });

  const rows = commitmentsQuery.data?.data?.data ?? [];
  const totalPages = commitmentsQuery.data?.data?.totalPage ?? 0;

  const columns = useMemo<ColumnDef<AdminCommitment>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Program",
        cell: ({ row }) => (
          <span className="font-semibold text-[var(--text-heading)]">
            {row.original.name}
          </span>
        ),
      },
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
        accessorKey: "capital",
        header: "Capital",
        cell: ({ row }) => formatCommitmentNaira(Number(row.original.capital) || 0),
      },
      {
        accessorKey: "durationMonths",
        header: "Duration",
        cell: ({ row }) => `${row.original.durationMonths} mo`,
      },
      {
        accessorKey: "monthlyRate",
        header: "Monthly rate",
        cell: ({ row }) => `${row.original.monthlyRate}%`,
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
        title="Commitments"
        description="Review capital commitment programs across all clients."
      />

      {commitmentsQuery.isError ? (
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm text-[var(--text-danger,#b42318)]">
            {normalizeError(commitmentsQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void commitmentsQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={commitmentsQuery.isLoading}
          emptyMessage="No commitments found."
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
