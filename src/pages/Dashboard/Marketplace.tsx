import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpRight,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Store,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useMyFinancings } from "@/api/marketplace/hooks";
import type { MarketFinancing } from "@/api/marketplace/types";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardMarketplaceSkeleton } from "@/components/ui/page-skeleton";
import { formatCommitmentNaira } from "@/lib/commitments";
import {
  type DisplayFinancingStatus,
  FINANCING_STATUS_STYLES,
  financingProductName,
  financingProductValue,
  financingReturns,
  mapFinancingStatus,
} from "@/lib/marketplace";
import { cn } from "@/lib/utils";
import { normalizeError } from "@/utils/normalizeError";

type DisplayStatus = DisplayFinancingStatus;

type StatusFilter = "all" | DisplayStatus;

type FinancingRow = {
  id: string;
  product: string;
  productValue: number;
  capitalCommitment: number;
  returnsAccumulated: number;
  status: DisplayStatus;
};

const STATUS_FILTER_OPTIONS: readonly StatusFilter[] = [
  "all",
  "Awaiting payment",
  "Accumulating",
  "Ready for delivery",
  "Completed",
  "Cancelled",
  "Pending",
] as const;

function toFinancingRow(item: MarketFinancing): FinancingRow {
  return {
    id: item.id,
    product: financingProductName(item),
    productValue: financingProductValue(item),
    capitalCommitment: Number(item.capital) || 0,
    returnsAccumulated: financingReturns(item),
    status: mapFinancingStatus(item.status),
  };
}

function StatusPill({ status }: { status: DisplayStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        FINANCING_STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

export default function DashboardMarketplace() {
  const navigate = useNavigate();
  const financingsQuery = useMyFinancings({ page: 1, size: 100 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const goBrowse = () => navigate("/dashboard/marketplace/browse");

  const programs = useMemo(() => {
    const rows = financingsQuery.data?.data?.data ?? [];
    return rows.map(toFinancingRow);
  }, [financingsQuery.data]);

  const isEmpty = !financingsQuery.isLoading && programs.length === 0;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return programs.filter((row) => {
      const matchesSearch = !q || row.product.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [programs, search, statusFilter]);

  const columns = useMemo<ColumnDef<FinancingRow>[]>(
    () => [
      {
        accessorKey: "product",
        header: "Product",
        cell: ({ row }) => (
          <Link
            to={`/dashboard/marketplace/${row.original.id}`}
            className="group inline-flex max-w-full items-center gap-1.5 font-semibold no-underline hover:underline hover:decoration-[var(--border-strong)] hover:underline-offset-4"
            style={{ color: "var(--text-heading)" }}
          >
            <span className="truncate">{row.original.product}</span>
            <ArrowUpRight className="size-3.5 shrink-0 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ),
      },
      {
        accessorKey: "productValue",
        header: "Product value",
        cell: ({ row }) => formatCommitmentNaira(row.original.productValue),
      },
      {
        accessorKey: "capitalCommitment",
        header: "Capital commitment",
        cell: ({ row }) => formatCommitmentNaira(row.original.capitalCommitment),
      },
      {
        accessorKey: "returnsAccumulated",
        header: "Returns accumulated",
        cell: ({ row }) => formatCommitmentNaira(row.original.returnsAccumulated),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusPill status={row.original.status} />,
      },
    ],
    [],
  );

  const filterLabel = statusFilter === "all" ? "All products" : statusFilter;

  if (financingsQuery.isLoading) {
    return <DashboardMarketplaceSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[32px]">
            Marketplace
          </h1>
          <p className="mt-3 max-w-[560px] text-sm leading-relaxed text-[var(--text-muted)] md:text-[15px]">
            Track the products you are financing, or browse the marketplace to finance a
            new one.
          </p>
        </div>
        <Button
          type="button"
          className="h-11 shrink-0 self-start rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
          onClick={goBrowse}
        >
          <Store className="size-4" />
          Browse marketplace
        </Button>
      </header>

      {financingsQuery.isError ? (
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center md:py-24">
          <p className="m-0 max-w-[420px] text-sm leading-relaxed text-[var(--text-danger,#b42318)]">
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
      ) : isEmpty ? (
        <section className="flex flex-col items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center md:px-10 md:py-24">
          <span className="inline-flex size-14 items-center justify-center rounded-lg bg-[var(--neutral-100)] text-[var(--text-muted)]">
            <Store className="size-6" />
          </span>
          <div className="mt-7 flex max-w-[420px] flex-col items-center gap-3">
            <h2 className="m-0 text-lg font-bold text-[var(--text-heading)] md:text-xl">
              No active product financing yet
            </h2>
            <p className="m-0 text-sm leading-relaxed text-[var(--text-muted)] md:text-[15px]">
              Browse the marketplace to finance a product and track it here.
            </p>
          </div>
          <div className="mt-8">
            <Button
              type="button"
              className="h-11 rounded-md border-0 px-5 text-sm font-semibold shadow-none ring-0"
              onClick={goBrowse}
            >
              <Store className="size-4" />
              Browse marketplace
            </Button>
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 md:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="m-0 text-base font-bold text-[var(--text-heading)] md:text-lg">
              Active product financing
            </h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative block min-w-0 sm:w-[260px]">
                <span className="sr-only">Search products</span>
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products"
                  className="h-10 w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-card)] pr-3 pl-9 text-sm text-[var(--text-heading)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)]"
                />
              </label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-card)] px-3 text-sm font-medium text-[var(--text-heading)] outline-none hover:bg-[var(--neutral-50)] focus-visible:border-[var(--brand-primary)] focus-visible:outline-none data-[state=open]:border-[var(--brand-primary)] data-[state=open]:bg-[var(--orange-50)]"
                  >
                    <SlidersHorizontal className="size-4 text-[var(--text-muted)]" />
                    {filterLabel}
                    <ChevronDown className="size-4 text-[var(--text-muted)]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[220px]">
                  <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                  >
                    {STATUS_FILTER_OPTIONS.map((option) => (
                      <DropdownMenuRadioItem
                        key={option}
                        value={option}
                        className={cn(
                          statusFilter === option &&
                            "font-semibold text-[var(--text-brand)]",
                        )}
                      >
                        {option === "all" ? "All products" : option}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filtered}
            pageSize={10}
            emptyMessage="No products match your search."
          />
        </section>
      )}
    </div>
  );
}
