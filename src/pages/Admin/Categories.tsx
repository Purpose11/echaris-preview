import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAdminProductCategories, useDeactivateAdminCategory } from "@/api/admin/hooks";
import type { ProductCategory } from "@/api/products/types";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/design-system/components/core/Button.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { Select } from "@/design-system/components/forms/Select.jsx";
import { normalizeError } from "@/utils/normalizeError";

const ACTIVE_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function Categories() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(0);
  const [deactivateTarget, setDeactivateTarget] = useState<ProductCategory | null>(null);
  const pageSize = 10;

  const categoriesQuery = useAdminProductCategories();
  const deactivateMutation = useDeactivateAdminCategory();

  const filtered = useMemo(() => {
    const rows = categoriesQuery.data?.data ?? [];
    const q = submittedSearch.trim().toLowerCase();
    return rows.filter((row) => {
      if (q && !row.name.toLowerCase().includes(q)) return false;
      if (activeFilter === "true" && row.active === false) return false;
      if (activeFilter === "false" && row.active !== false) return false;
      return true;
    });
  }, [activeFilter, categoriesQuery.data?.data, submittedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
  const pageRows = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const hasActiveFilters = Boolean(submittedSearch) || Boolean(activeFilter);

  const columns = useMemo<ColumnDef<ProductCategory>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Category",
        cell: ({ row }) => (
          <Link
            to={`/admin/categories/${row.original.id}/edit`}
            className="group inline-flex max-w-full items-center gap-1.5 font-semibold no-underline hover:underline hover:decoration-[var(--border-strong)] hover:underline-offset-4"
            style={{ color: "var(--text-heading)" }}
          >
            <span className="truncate">{row.original.name}</span>
            <ArrowUpRight className="size-3.5 shrink-0 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
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
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) =>
          row.original.active === false ? (
            <span className="text-sm text-[var(--text-muted)]">—</span>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-md px-3 text-xs font-semibold shadow-none"
              onClick={() => setDeactivateTarget(row.original)}
            >
              Deactivate
            </Button>
          ),
      },
    ],
    [],
  );

  const clearFilters = () => {
    setSearch("");
    setSubmittedSearch("");
    setActiveFilter("");
    setPage(0);
  };

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <AdminPageHeader
        title="Categories"
        description="Manage product categories used across the catalog and marketplace."
        actions={
          <Button
            type="button"
            className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
            onClick={() => navigate("/admin/categories/new")}
          >
            <Plus className="size-4" />
            Add category
          </Button>
        }
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
              placeholder="Search categories by name"
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

        <div className="grid max-w-sm grid-cols-1 gap-3">
          <FormField label="Status" htmlFor="category-active">
            <Select
              id="category-active"
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setPage(0);
              }}
              options={ACTIVE_OPTIONS}
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

      {categoriesQuery.isError ? (
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm text-[var(--text-danger,#b42318)]">
            {normalizeError(categoriesQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void categoriesQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      ) : (
        <DataTable
          columns={columns}
          data={pageRows}
          isLoading={categoriesQuery.isLoading}
          emptyMessage="No categories found."
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

      <AdminConfirmModal
        open={Boolean(deactivateTarget)}
        title={`Deactivate ${deactivateTarget?.name ?? "category"}?`}
        description="Products in this category will leave the shopping catalog, but remain available in admin product reads."
        confirmLabel="Deactivate category"
        cancelLabel="Cancel"
        tone="dark"
        loading={deactivateMutation.isPending}
        onClose={() => {
          if (!deactivateMutation.isPending) setDeactivateTarget(null);
        }}
        onConfirm={() => {
          if (!deactivateTarget) return;
          deactivateMutation.mutate(deactivateTarget.id, {
            onSuccess: () => setDeactivateTarget(null),
          });
        }}
      />
    </div>
  );
}
