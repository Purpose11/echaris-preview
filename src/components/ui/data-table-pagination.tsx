import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  className?: string;
}

export function DataTablePagination<TData>({
  table,
  className,
}: DataTablePaginationProps<TData>) {
  const pageCount = Math.max(table.getPageCount(), 1);
  const pageIndex = table.getState().pagination.pageIndex;
  const currentPage = pageIndex + 1;
  const canPrev = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-1 pt-4 pb-1",
        className,
      )}
    >
      <p className="m-0 text-sm text-[var(--text-muted)]">
        Page {currentPage} of {pageCount}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => table.previousPage()}
          disabled={!canPrev}
          aria-label="Go to previous page"
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-lg border text-[var(--text-heading)] transition-colors",
            canPrev
              ? "border-[var(--border-default)] bg-[var(--surface-card)] hover:bg-[var(--neutral-50)]"
              : "cursor-not-allowed border-transparent bg-[var(--neutral-100)] text-[var(--text-muted)] opacity-70",
          )}
        >
          <ChevronLeft className="size-4" />
        </button>

        <span
          aria-current="page"
          aria-label={`Page ${currentPage}`}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-[var(--brand-primary)] bg-[var(--orange-50)] text-sm font-bold text-[var(--brand-primary)]"
        >
          {currentPage}
        </span>

        <button
          type="button"
          onClick={() => table.nextPage()}
          disabled={!canNext}
          aria-label="Go to next page"
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-lg border text-[var(--text-heading)] transition-colors",
            canNext
              ? "border-[var(--border-default)] bg-[var(--surface-card)] hover:bg-[var(--neutral-50)]"
              : "cursor-not-allowed border-transparent bg-[var(--neutral-100)] text-[var(--text-muted)] opacity-70",
          )}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
