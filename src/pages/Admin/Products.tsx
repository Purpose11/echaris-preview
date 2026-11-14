import { type ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useAdminProducts } from "@/api/admin/hooks";
import type { Product } from "@/api/products/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { formatCommitmentNaira } from "@/lib/commitments";
import { normalizeError } from "@/utils/normalizeError";

export default function Products() {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const productsQuery = useAdminProducts({
    page: page + 1,
    size: pageSize,
    search: submittedSearch || undefined,
  });

  const rows = productsQuery.data?.data?.data ?? [];
  const totalPages = productsQuery.data?.data?.totalPage ?? 0;

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => (
          <span className="font-semibold text-[var(--text-heading)]">
            {row.original.name}
          </span>
        ),
      },
      {
        id: "category",
        header: "Category",
        cell: ({ row }) =>
          row.original.categoryName || row.original.category?.name || "—",
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => formatCommitmentNaira(Number(row.original.price) || 0),
      },
      {
        accessorKey: "stockQuantity",
        header: "Stock",
        cell: ({ row }) =>
          row.original.madeToOrder
            ? "Made to order"
            : (row.original.stockQuantity ?? "—"),
      },
      {
        id: "stockStatus",
        header: "Availability",
        cell: ({ row }) => (
          <AdminStatusPill
            status={
              row.original.madeToOrder
                ? "MADE_TO_ORDER"
                : String(row.original.stockStatus || "IN_STOCK")
            }
          />
        ),
      },
      {
        id: "active",
        header: "Status",
        cell: ({ row }) => (
          <AdminStatusPill
            status={row.original.active === false ? "INACTIVE" : "ACTIVE"}
          />
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <AdminPageHeader
        title="Products"
        description="Browse the product catalog used for marketplace financing."
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
            placeholder="Search products"
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

      {productsQuery.isError ? (
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm text-[var(--text-danger,#b42318)]">
            {normalizeError(productsQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void productsQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={productsQuery.isLoading}
          emptyMessage="No products found."
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
