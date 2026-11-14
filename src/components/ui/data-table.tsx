import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type OnChangeFn,
  type PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Initial / controlled page size. Default 10. */
  pageSize?: number;
  /** Hide pagination when there is only one page. Default true. */
  hidePaginationWhenSinglePage?: boolean;
  emptyMessage?: string;
  className?: string;
  /** Dark header styling used across portal tables. Default true. */
  darkHeader?: boolean;
  /** When true, render a table skeleton instead of rows. */
  isLoading?: boolean;
  /** Skeleton row count while loading. Defaults to pageSize. */
  skeletonRows?: number;
  /** Optional controlled pagination (for server-driven lists later). */
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  pageCount?: number;
  manualPagination?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  hidePaginationWhenSinglePage = true,
  emptyMessage = "No results.",
  className,
  darkHeader = true,
  isLoading = false,
  skeletonRows,
  pagination: controlledPagination,
  onPaginationChange,
  pageCount,
  manualPagination = false,
}: DataTableProps<TData, TValue>) {
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const pagination = controlledPagination ?? internalPagination;
  const setPagination = onPaginationChange ?? setInternalPagination;

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
  });

  const showPagination = !hidePaginationWhenSinglePage || table.getPageCount() > 1;

  if (isLoading) {
    const headers = columns.map((column) => {
      const header = column.header;
      return typeof header === "string" ? header : "";
    });

    return (
      <DataTableSkeleton
        className={className}
        columnCount={columns.length}
        rowCount={skeletonRows ?? pageSize}
        darkHeader={darkHeader}
        headers={headers.some(Boolean) ? headers : undefined}
      />
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]">
        <Table className="border-separate border-spacing-0">
          <TableHeader className={cn(darkHeader && "bg-[#1a1a1a] [&_tr]:border-0")}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className={cn(
                  "border-0 hover:bg-transparent data-[state=selected]:bg-transparent",
                  darkHeader && "bg-[#1a1a1a]",
                )}
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-11 border-0 px-4 text-[11px] font-semibold tracking-[0.06em] uppercase shadow-none",
                      darkHeader ? "bg-[#1a1a1a] text-white" : "text-[var(--text-muted)]",
                    )}
                    style={{
                      width: header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-[var(--border-subtle)] hover:bg-[var(--neutral-50)]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3.5 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 px-4 py-10 text-center text-sm text-[var(--text-muted)]"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination ? <DataTablePagination table={table} /> : null}
    </div>
  );
}
