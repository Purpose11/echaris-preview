import { useQueries } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getAdminCustomer, listAdminCustomers } from "@/api/admin/admin";
import { listAdminCommitments } from "@/api/admin/domain";
import { useAdminFinancings } from "@/api/admin/hooks";
import { adminKeys } from "@/api/admin/querykeys";
import type { MarketFinancing } from "@/api/marketplace/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/design-system/components/core/Button.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { Select } from "@/design-system/components/forms/Select.jsx";
import { formatCommitmentNaira } from "@/lib/commitments";
import { normalizeError } from "@/utils/normalizeError";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "AWAITING_PAYMENT", label: "Awaiting payment" },
  { value: "ACCUMULATING", label: "Accumulating" },
  { value: "MATURED", label: "Matured" },
];

function customerDisplayName(parts: {
  firstName?: string | null;
  lastName?: string | null;
  emailAddress?: string | null;
}) {
  const name = [parts.firstName, parts.lastName].filter(Boolean).join(" ").trim();
  return name || parts.emailAddress || null;
}

async function resolveCustomerNameByUserId(userId: string) {
  const customers = await listAdminCustomers({
    searchParam: userId,
    page: 1,
    size: 20,
  });
  const match = customers.data?.data?.find((c) => c.userId === userId);
  if (match) return customerDisplayName(match);

  const commitments = await listAdminCommitments({
    userId,
    page: 1,
    size: 1,
  });
  const customerId = commitments.data?.data?.[0]?.customerId?.trim() || "";
  if (!customerId) return null;
  const customer = await getAdminCustomer(customerId);
  return customerDisplayName(customer.data ?? {});
}

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const financingsQuery = useAdminFinancings({
    page: page + 1,
    size: pageSize,
    status: status || undefined,
    search: submittedSearch || undefined,
  });

  const rows = financingsQuery.data?.data?.data ?? [];
  const totalPages = financingsQuery.data?.data?.totalPage ?? 0;
  const hasFilters = Boolean(submittedSearch) || Boolean(status);

  const userIds = useMemo(
    () =>
      Array.from(
        new Set(
          rows.map((row) => row.userId?.trim()).filter((id): id is string => Boolean(id)),
        ),
      ),
    [rows],
  );

  const customerNameQueries = useQueries({
    queries: userIds.map((userId) => ({
      queryKey: [...adminKeys.all, "financing-customer-name", userId] as const,
      queryFn: () => resolveCustomerNameByUserId(userId),
      staleTime: 60_000,
    })),
  });

  const customerNameByUserId = useMemo(() => {
    const map = new Map<string, string>();
    userIds.forEach((userId, index) => {
      const label = customerNameQueries[index]?.data;
      if (label) map.set(userId, label);
    });
    return map;
  }, [customerNameQueries, userIds]);

  const columns = useMemo<ColumnDef<MarketFinancing>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Financing",
        cell: ({ row }) => (
          <Link
            to={`/admin/marketplace/${row.original.id}`}
            className="group inline-flex max-w-full items-center gap-1.5 font-semibold no-underline hover:underline hover:decoration-[var(--border-strong)] hover:underline-offset-4"
            style={{ color: "var(--text-heading)" }}
          >
            <span className="truncate">{row.original.name || "—"}</span>
            <ArrowUpRight className="size-3.5 shrink-0 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => {
          const userId = row.original.userId?.trim();
          const label = userId ? customerNameByUserId.get(userId) : null;
          return (
            <span className="font-medium text-[var(--text-heading)]">{label || "—"}</span>
          );
        },
      },
      {
        id: "product",
        header: "Product",
        cell: ({ row }) => row.original.productName || row.original.product?.name || "—",
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
    ],
    [customerNameByUserId],
  );

  const clearFilters = () => {
    setSearch("");
    setSubmittedSearch("");
    setStatus("");
    setPage(0);
  };

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <AdminPageHeader
        title="Marketplace"
        description="Review product financing programs and funding payment status."
      />

      <form
        className="flex w-full min-w-0 flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
          setSubmittedSearch(search.trim());
        }}
      >
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, product, product ID, user ID or financing ID"
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
        </div>

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

        {hasFilters ? (
          <div>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>
        ) : null}
      </form>

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
