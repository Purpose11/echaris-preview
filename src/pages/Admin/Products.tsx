import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAdminProductCategories, useAdminProducts } from "@/api/admin/hooks";
import type { Product } from "@/api/products/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminRangeSlider } from "@/components/admin/AdminRangeSlider";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/design-system/components/core/Button.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { Select } from "@/design-system/components/forms/Select.jsx";
import { formatCommitmentNaira } from "@/lib/commitments";
import { normalizeError } from "@/utils/normalizeError";

const ACTIVE_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

const MADE_TO_ORDER_OPTIONS = [
  { value: "", label: "All fulfillment" },
  { value: "true", label: "Made to order" },
  { value: "false", label: "Stocked" },
];

const PRICE_RANGE = { min: 0, max: 1_000_000, step: 5_000 } as const;
const STOCK_RANGE = { min: 0, max: 200, step: 1 } as const;

function parseTriState(value: string): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export default function Products() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [madeToOrderFilter, setMadeToOrderFilter] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    PRICE_RANGE.min,
    PRICE_RANGE.max,
  ]);
  const [stockRange, setStockRange] = useState<[number, number]>([
    STOCK_RANGE.min,
    STOCK_RANGE.max,
  ]);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const priceFiltered =
    priceRange[0] > PRICE_RANGE.min || priceRange[1] < PRICE_RANGE.max;
  const stockFiltered =
    stockRange[0] > STOCK_RANGE.min || stockRange[1] < STOCK_RANGE.max;

  const categoriesQuery = useAdminProductCategories();
  const categoryOptions = useMemo(() => {
    const cats = categoriesQuery.data?.data ?? [];
    return [
      { value: "", label: "All categories" },
      ...cats.map((c) => ({ value: c.id, label: c.name })),
    ];
  }, [categoriesQuery.data?.data]);

  const productsQuery = useAdminProducts({
    page: page + 1,
    size: pageSize,
    search: submittedSearch || undefined,
    categoryId: categoryId || undefined,
    active: parseTriState(activeFilter),
    madeToOrder: parseTriState(madeToOrderFilter),
    minPrice: priceFiltered ? priceRange[0] : undefined,
    maxPrice: priceFiltered ? priceRange[1] : undefined,
    minStockQuantity: stockFiltered ? stockRange[0] : undefined,
    maxStockQuantity: stockFiltered ? stockRange[1] : undefined,
  });

  const rows = productsQuery.data?.data?.data ?? [];
  const totalPages = productsQuery.data?.data?.totalPage ?? 0;
  const hasActiveFilters =
    Boolean(submittedSearch) ||
    Boolean(categoryId) ||
    Boolean(activeFilter) ||
    Boolean(madeToOrderFilter) ||
    priceFiltered ||
    stockFiltered;

  const clearFilters = () => {
    setSearch("");
    setSubmittedSearch("");
    setCategoryId("");
    setActiveFilter("");
    setMadeToOrderFilter("");
    setPriceRange([PRICE_RANGE.min, PRICE_RANGE.max]);
    setStockRange([STOCK_RANGE.min, STOCK_RANGE.max]);
    setPage(0);
  };

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => (
          <Link
            to={`/admin/products/${row.original.id}`}
            className="group inline-flex max-w-full items-center gap-1.5 font-semibold no-underline hover:underline hover:decoration-[var(--border-strong)] hover:underline-offset-4"
            style={{ color: "var(--text-heading)" }}
          >
            <span className="truncate">{row.original.name}</span>
            <ArrowUpRight className="size-3.5 shrink-0 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ),
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
        description="Browse active and inactive products used for marketplace financing."
        actions={
          <Button
            type="button"
            className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
            onClick={() => navigate("/admin/products/new")}
          >
            <Plus className="size-4" />
            Add product
          </Button>
        }
      />

      <form
        className="flex w-full min-w-0 flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
          setSubmittedSearch(search.trim().slice(0, 150));
        }}
      >
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value.slice(0, 150))}
              placeholder="Search products by name"
              iconLeft="search"
              maxLength={150}
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Category" htmlFor="product-category">
            <Select
              id="product-category"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(0);
              }}
              options={categoryOptions}
            />
          </FormField>
          <FormField label="Status" htmlFor="product-active">
            <Select
              id="product-active"
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setPage(0);
              }}
              options={ACTIVE_OPTIONS}
            />
          </FormField>
          <FormField label="Fulfillment" htmlFor="product-mto">
            <Select
              id="product-mto"
              value={madeToOrderFilter}
              onChange={(e) => {
                setMadeToOrderFilter(e.target.value);
                setPage(0);
              }}
              options={MADE_TO_ORDER_OPTIONS}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Price range" htmlFor="product-price-range">
            <AdminRangeSlider
              id="product-price-range"
              min={PRICE_RANGE.min}
              max={PRICE_RANGE.max}
              step={PRICE_RANGE.step}
              value={priceRange}
              onValueChange={(next) => {
                setPriceRange(next);
                setPage(0);
              }}
              formatValue={(v) => formatCommitmentNaira(v)}
            />
          </FormField>
          <FormField label="Stock range" htmlFor="product-stock-range">
            <AdminRangeSlider
              id="product-stock-range"
              min={STOCK_RANGE.min}
              max={STOCK_RANGE.max}
              step={STOCK_RANGE.step}
              value={stockRange}
              onValueChange={(next) => {
                setStockRange(next);
                setPage(0);
              }}
            />
          </FormField>
        </div>

        {hasActiveFilters ? (
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
