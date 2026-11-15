import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { AdminCustomerPayout } from "@/api/admin/domain";
import { useAdminCustomerPayouts } from "@/api/admin/hooks";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/design-system/components/core/Button.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { Select } from "@/design-system/components/forms/Select.jsx";
import { formatCommitmentDate, formatCommitmentNaira } from "@/lib/commitments";
import { normalizeError } from "@/utils/normalizeError";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "PAID", label: "Paid" },
];

function labelize(value: string) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Payouts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [customerUserId, setCustomerUserId] = useState("");
  const [submittedCustomerUserId, setSubmittedCustomerUserId] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const payoutsQuery = useAdminCustomerPayouts({
    page: page + 1,
    size: pageSize,
    search: submittedSearch || undefined,
    status: status || undefined,
    customerUserId: submittedCustomerUserId || undefined,
  });

  const rows = payoutsQuery.data?.data?.data ?? [];
  const totalPages = payoutsQuery.data?.data?.totalPage ?? 0;
  const hasFilters =
    Boolean(submittedSearch) || Boolean(status) || Boolean(submittedCustomerUserId);

  const columns = useMemo<ColumnDef<AdminCustomerPayout>[]>(
    () => [
      {
        id: "account",
        header: "Account",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="m-0 font-semibold text-[var(--text-heading)]">
              {row.original.accountName || "—"}
            </p>
            <p className="mt-0.5 mb-0 truncate text-xs text-[var(--text-muted)]">
              {row.original.bankName || "—"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCommitmentNaira(Number(row.original.amount) || 0),
      },
      {
        accessorKey: "payoutType",
        header: "Type",
        cell: ({ row }) => labelize(String(row.original.payoutType || "—")),
      },
      {
        accessorKey: "transferReference",
        header: "Transfer ref",
        cell: ({ row }) => (
          <span className="truncate">{row.original.transferReference || "—"}</span>
        ),
      },
      {
        id: "paidAt",
        header: "Paid at",
        cell: ({ row }) => formatCommitmentDate(row.original.paidAt),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <AdminStatusPill status={String(row.original.status)} />,
      },
    ],
    [],
  );

  const clearFilters = () => {
    setSearch("");
    setSubmittedSearch("");
    setStatus("");
    setCustomerUserId("");
    setSubmittedCustomerUserId("");
    setPage(0);
  };

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <AdminPageHeader
        title="Payouts"
        description="Review recorded customer payouts and settle commitment or marketplace capital."
        actions={
          <Button
            type="button"
            className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
            onClick={() => navigate("/admin/payouts/new")}
          >
            <Plus className="size-4" />
            Record payout
          </Button>
        }
      />

      <form
        className="flex w-full min-w-0 flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
          setSubmittedSearch(search.trim().slice(0, 128));
          setSubmittedCustomerUserId(customerUserId.trim());
        }}
      >
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value.slice(0, 128))}
              placeholder="Search by ID, transfer ref, account or bank"
              iconLeft="search"
              maxLength={128}
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-2xl">
          <FormField label="Status" htmlFor="payout-status">
            <Select
              id="payout-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              options={STATUS_OPTIONS}
            />
          </FormField>
          <FormField label="Customer user ID" htmlFor="payout-user-id">
            <Input
              id="payout-user-id"
              value={customerUserId}
              onChange={(e) => setCustomerUserId(e.target.value)}
              placeholder="Filter by customer user ID"
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

      {payoutsQuery.isError ? (
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm text-[var(--text-danger,#b42318)]">
            {normalizeError(payoutsQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void payoutsQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={payoutsQuery.isLoading}
          emptyMessage="No payouts found."
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
