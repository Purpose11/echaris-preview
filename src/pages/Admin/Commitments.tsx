import { useQueries } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { getAdminCustomer } from "@/api/admin/admin";
import type { AdminCommitment } from "@/api/admin/domain";
import { useAdminCommitments } from "@/api/admin/hooks";
import { adminKeys } from "@/api/admin/querykeys";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { formatCommitmentNaira } from "@/lib/commitments";
import { normalizeError } from "@/utils/normalizeError";

function customerDisplayName(parts: {
  firstName?: string | null;
  lastName?: string | null;
  emailAddress?: string | null;
}) {
  const name = [parts.firstName, parts.lastName].filter(Boolean).join(" ").trim();
  return name || parts.emailAddress || null;
}

export default function Commitments() {
  const [userId, setUserId] = useState("");
  const [submittedUserId, setSubmittedUserId] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const commitmentsQuery = useAdminCommitments({
    page: page + 1,
    size: pageSize,
    userId: submittedUserId || undefined,
  });

  const rows = commitmentsQuery.data?.data?.data ?? [];
  const totalPages = commitmentsQuery.data?.data?.totalPage ?? 0;

  const customerIds = useMemo(
    () =>
      Array.from(
        new Set(
          rows
            .map((row) => row.customerId?.trim())
            .filter((id): id is string => Boolean(id)),
        ),
      ),
    [rows],
  );

  const customerQueries = useQueries({
    queries: customerIds.map((customerId) => ({
      queryKey: adminKeys.customerDetail(customerId),
      queryFn: () => getAdminCustomer(customerId),
      staleTime: 60_000,
    })),
  });

  const customerNameById = useMemo(() => {
    const map = new Map<string, string>();
    customerIds.forEach((customerId, index) => {
      const customer = customerQueries[index]?.data?.data;
      if (!customer) return;
      const label = customerDisplayName(customer);
      if (label) map.set(customerId, label);
    });
    return map;
  }, [customerIds, customerQueries]);

  const columns = useMemo<ColumnDef<AdminCommitment>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Commitment",
        cell: ({ row }) => (
          <span className="font-semibold text-[var(--text-heading)]">
            {row.original.name}
          </span>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => {
          const customerId = row.original.customerId?.trim();
          const label =
            (customerId ? customerNameById.get(customerId) : null) ||
            row.original.customerName ||
            row.original.customerEmail ||
            null;

          return (
            <span className="font-medium text-[var(--text-heading)]">{label || "—"}</span>
          );
        },
      },
      {
        accessorKey: "capital",
        header: "Capital",
        cell: ({ row }) => formatCommitmentNaira(Number(row.original.capital) || 0),
      },
      {
        accessorKey: "durationMonths",
        header: "Duration",
        cell: ({ row }) => {
          const months = Number(row.original.durationMonths) || 0;
          return `${months} ${months === 1 ? "month" : "months"}`;
        },
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
    [customerNameById],
  );

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <AdminPageHeader
        title="Commitments"
        description="Review capital commitment programs across all clients."
      />

      <form
        className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
          setSubmittedUserId(userId.trim());
        }}
      >
        <div className="min-w-0 flex-1">
          <Input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Filter by user ID"
            iconLeft="search"
          />
        </div>
        <Button
          type="submit"
          className="h-11 w-full rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0 sm:w-auto"
        >
          <Search className="size-4" />
          Search
        </Button>
        {submittedUserId ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-md px-4 text-sm font-semibold shadow-none sm:w-auto"
            onClick={() => {
              setUserId("");
              setSubmittedUserId("");
              setPage(0);
            }}
          >
            Clear
          </Button>
        ) : null}
      </form>

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
