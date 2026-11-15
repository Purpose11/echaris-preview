import { useQueries } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { getAdminCustomer } from "@/api/admin/admin";
import type { AdminUserPayment } from "@/api/admin/domain";
import { listAdminCommitments } from "@/api/admin/domain";
import { useAdminPayments } from "@/api/admin/hooks";
import { adminKeys } from "@/api/admin/querykeys";
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
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "PAID", label: "Paid" },
];

const DIRECTION_OPTIONS = [
  { value: "", label: "All directions" },
  { value: "INCOMING", label: "Incoming" },
  { value: "OUTGOING", label: "Outgoing" },
];

const PURPOSE_OPTIONS = [
  { value: "", label: "All purposes" },
  { value: "COMMITMENT", label: "Commitment" },
  { value: "MARKETPLACE_FINANCING", label: "Marketplace financing" },
  { value: "ORDER", label: "Order" },
  { value: "CUSTOMER_PAYOUT", label: "Customer payout" },
];

function labelize(value: string) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function customerDisplayName(parts: {
  firstName?: string | null;
  lastName?: string | null;
  emailAddress?: string | null;
}) {
  const name = [parts.firstName, parts.lastName].filter(Boolean).join(" ").trim();
  return name || parts.emailAddress || null;
}

async function resolveCustomerName(params: {
  customerId?: string | null;
  userId?: string | null;
}) {
  let customerId = params.customerId?.trim() || "";
  if (!customerId && params.userId?.trim()) {
    const commitments = await listAdminCommitments({
      userId: params.userId.trim(),
      page: 1,
      size: 1,
    });
    customerId = commitments.data?.data?.[0]?.customerId?.trim() || "";
  }
  if (!customerId) return null;
  const customer = await getAdminCustomer(customerId);
  return customerDisplayName(customer.data ?? {});
}

export default function Payments() {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [direction, setDirection] = useState("");
  const [purpose, setPurpose] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const paymentsQuery = useAdminPayments({
    page: page + 1,
    size: pageSize,
    search: submittedSearch || undefined,
    status: status || undefined,
    direction: direction || undefined,
    purpose: purpose || undefined,
  });

  const rows = paymentsQuery.data?.data?.data ?? [];
  const totalPages = paymentsQuery.data?.data?.totalPage ?? 0;
  const hasFilters =
    Boolean(submittedSearch) || Boolean(status) || Boolean(direction) || Boolean(purpose);

  const lookupKeys = useMemo(() => {
    const seen = new Set<string>();
    const keys: Array<{ key: string; customerId?: string; userId?: string }> = [];
    for (const row of rows) {
      if (row.customerName?.trim()) continue;
      const customerId = row.customerId?.trim();
      const userId = row.userId?.trim();
      const key = customerId ? `c:${customerId}` : userId ? `u:${userId}` : "";
      if (!key || seen.has(key)) continue;
      seen.add(key);
      keys.push({ key, customerId, userId });
    }
    return keys;
  }, [rows]);

  const customerNameQueries = useQueries({
    queries: lookupKeys.map((item) => ({
      queryKey: [...adminKeys.all, "payment-customer-name", item.key] as const,
      queryFn: () =>
        resolveCustomerName({
          customerId: item.customerId,
          userId: item.userId,
        }),
      staleTime: 60_000,
    })),
  });

  const customerNameByKey = useMemo(() => {
    const map = new Map<string, string>();
    lookupKeys.forEach((item, index) => {
      const label = customerNameQueries[index]?.data;
      if (label) map.set(item.key, label);
    });
    return map;
  }, [customerNameQueries, lookupKeys]);

  const columns = useMemo<ColumnDef<AdminUserPayment>[]>(
    () => [
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => {
          const customerId = row.original.customerId?.trim();
          const userId = row.original.userId?.trim();
          const key = customerId ? `c:${customerId}` : userId ? `u:${userId}` : "";
          const label =
            row.original.customerName?.trim() ||
            (key ? customerNameByKey.get(key) : null) ||
            row.original.customerEmail?.trim() ||
            null;

          return (
            <span className="font-medium text-[var(--text-heading)]">{label || "—"}</span>
          );
        },
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCommitmentNaira(Number(row.original.amount) || 0),
      },
      {
        accessorKey: "purpose",
        header: "Purpose",
        cell: ({ row }) => labelize(String(row.original.purpose || "—")),
      },
      {
        accessorKey: "direction",
        header: "Direction",
        cell: ({ row }) => labelize(String(row.original.direction || "—")),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <AdminStatusPill status={String(row.original.status)} />,
      },
    ],
    [customerNameByKey],
  );

  const clearFilters = () => {
    setSearch("");
    setSubmittedSearch("");
    setStatus("");
    setDirection("");
    setPurpose("");
    setPage(0);
  };

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <AdminPageHeader
        title="Payments"
        description="Track user payments across commitments, marketplace, orders, and payouts."
      />

      <form
        className="flex w-full min-w-0 flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
          setSubmittedSearch(search.trim().slice(0, 128));
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-3xl lg:grid-cols-3">
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
          <FormField label="Direction" htmlFor="payment-direction">
            <Select
              id="payment-direction"
              value={direction}
              onChange={(e) => {
                setDirection(e.target.value);
                setPage(0);
              }}
              options={DIRECTION_OPTIONS}
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
