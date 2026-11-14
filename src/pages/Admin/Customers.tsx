import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAdminCustomers } from "@/api/admin/hooks";
import type { AdminCustomer } from "@/api/admin/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { normalizeError } from "@/utils/normalizeError";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const customersQuery = useAdminCustomers({
    page: page + 1,
    size: pageSize,
    searchParam: submittedSearch || undefined,
  });

  const rows = customersQuery.data?.data?.data ?? [];
  const totalPages = customersQuery.data?.data?.totalPage ?? 0;

  const columns = useMemo<ColumnDef<AdminCustomer>[]>(
    () => [
      {
        id: "name",
        header: "Customer",
        cell: ({ row }) => {
          const name = [row.original.firstName, row.original.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
          return (
            <Link
              to={`/admin/customers/${row.original.customerId}`}
              className="group inline-flex max-w-full items-center gap-1.5 font-semibold no-underline hover:underline hover:decoration-[var(--border-strong)] hover:underline-offset-4"
              style={{ color: "var(--text-heading)" }}
            >
              <span className="truncate">{name || row.original.emailAddress}</span>
              <ArrowUpRight className="size-3.5 shrink-0 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          );
        },
      },
      {
        accessorKey: "emailAddress",
        header: "Email",
      },
      {
        accessorKey: "customerNumber",
        header: "Customer no.",
        cell: ({ row }) => row.original.customerNumber || "—",
      },
      {
        id: "kyc",
        header: "KYC",
        cell: ({ row }) => (
          <AdminStatusPill status={row.original.doneKyc ? "APPROVED" : "PENDING"} />
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <AdminStatusPill status={row.original.active ? "ACTIVE" : "INACTIVE"} />
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <AdminPageHeader
        title="Customers"
        description="Search and manage client accounts, activation status, and KYC readiness."
      />

      <form
        className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
          setSubmittedSearch(search.trim());
        }}
      >
        <div className="min-w-0 flex-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or customer number"
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
      </form>

      {customersQuery.isError ? (
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm leading-relaxed text-[var(--text-danger,#b42318)]">
            {normalizeError(customersQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void customersQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={customersQuery.isLoading}
          emptyMessage="No customers found."
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
