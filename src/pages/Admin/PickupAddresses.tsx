import { type ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { normalizeAddressList } from "@/api/addresses/addresses";
import { useAddresses } from "@/api/addresses/hooks";
import type { Address } from "@/api/addresses/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/design-system/components/core/Button.jsx";
import { normalizeError } from "@/utils/normalizeError";

function formatAddressLine(row: Address) {
  return [row.addressLine, row.addressLine2].filter(Boolean).join(", ") || "—";
}

export default function PickupAddresses() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const addressesQuery = useAddresses({
    addressType: "PICKUP",
    page: 1,
    size: 100,
  });

  const rows = useMemo(
    () => normalizeAddressList(addressesQuery.data?.data),
    [addressesQuery.data?.data],
  );
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize) || 1);
  const pageRows = rows.slice(page * pageSize, page * pageSize + pageSize);

  const columns = useMemo<ColumnDef<Address>[]>(
    () => [
      {
        id: "address",
        header: "Address",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="m-0 font-semibold text-[var(--text-heading)]">
              {formatAddressLine(row.original)}
            </p>
            <p className="mt-0.5 mb-0 truncate text-xs text-[var(--text-muted)]">
              {[row.original.city, row.original.country].filter(Boolean).join(", ") ||
                "—"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "state",
        header: "State",
        cell: ({ row }) => row.original.state || "—",
      },
    ],
    [],
  );

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <AdminPageHeader
        title="Pickup addresses"
        description="Manage pickup locations customers can choose for marketplace financing."
        actions={
          <Button
            type="button"
            className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
            onClick={() => navigate("/admin/pickup-addresses/new")}
          >
            <Plus className="size-4" />
            Add pickup address
          </Button>
        }
      />

      {addressesQuery.isError ? (
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm text-[var(--text-danger,#b42318)]">
            {normalizeError(addressesQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void addressesQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      ) : (
        <DataTable
          columns={columns}
          data={pageRows}
          isLoading={addressesQuery.isLoading}
          emptyMessage="No pickup addresses found."
          manualPagination
          pageCount={totalPages}
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
