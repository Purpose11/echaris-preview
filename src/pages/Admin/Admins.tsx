import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { useAdminCounts, useAdminsList } from "@/api/admin/hooks";
import type { AdminProfile } from "@/api/admin/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/design-system/components/core/Button.jsx";
import { normalizeError } from "@/utils/normalizeError";

export default function Admins() {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const adminsQuery = useAdminsList({ page: page + 1, size: pageSize });
  const countsQuery = useAdminCounts();

  const rows = adminsQuery.data?.data?.data ?? [];
  const totalPages = adminsQuery.data?.data?.totalPage ?? 0;

  const columns = useMemo<ColumnDef<AdminProfile>[]>(
    () => [
      {
        id: "name",
        header: "Admin",
        cell: ({ row }) => (
          <span className="font-semibold text-[var(--text-heading)]">
            {[row.original.firstName, row.original.lastName]
              .filter(Boolean)
              .join(" ")
              .trim() || row.original.emailAddress}
          </span>
        ),
      },
      {
        accessorKey: "emailAddress",
        header: "Email",
      },
      {
        id: "role",
        header: "Role",
        cell: ({ row }) => (row.original.superAdmin ? "Super admin" : "Admin"),
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
        title="Admins"
        description="Manage administrator accounts. Creating and deactivating admins requires super admin access."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        <article className="rounded-lg bg-[var(--brand-primary)] p-5 text-white sm:p-6 md:p-8">
          <p className="m-0 text-[11px] font-semibold tracking-[0.08em] uppercase opacity-90">
            Total admins
          </p>
          <p className="mt-5 mb-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] sm:mt-7">
            {countsQuery.data?.total ?? "—"}
          </p>
        </article>
        <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 md:p-8">
          <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
            Active
          </p>
          <p className="mt-5 mb-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] text-[var(--text-heading)] sm:mt-7">
            {countsQuery.data?.active ?? "—"}
          </p>
        </article>
        <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 md:p-8">
          <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
            Inactive
          </p>
          <p className="mt-5 mb-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] text-[var(--text-heading)] sm:mt-7">
            {countsQuery.data?.inactive ?? "—"}
          </p>
        </article>
      </section>

      {adminsQuery.isError ? (
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm text-[var(--text-danger,#b42318)]">
            {normalizeError(adminsQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void adminsQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={adminsQuery.isLoading}
          emptyMessage="No admin accounts found."
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
