import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface DataTableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
  darkHeader?: boolean;
  className?: string;
  /** Optional header labels. Length should match columnCount when provided. */
  headers?: string[];
}

export function DataTableSkeleton({
  columnCount = 6,
  rowCount = 5,
  darkHeader = true,
  className,
  headers,
}: DataTableSkeletonProps) {
  const cols = Math.max(columnCount, headers?.length ?? 0, 1);

  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]">
        <div className="w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <Table className="min-w-[640px] border-separate border-spacing-0">
            <TableHeader className={cn(darkHeader && "bg-[#1a1a1a] [&_tr]:border-0")}>
              <TableRow
                className={cn(
                  "border-0 hover:bg-transparent",
                  darkHeader && "bg-[#1a1a1a]",
                )}
              >
                {Array.from({ length: cols }).map((_, i) => (
                  <TableHead
                    key={i}
                    className={cn(
                      "h-11 border-0 px-4 text-[11px] font-semibold tracking-[0.06em] uppercase shadow-none",
                      darkHeader ? "bg-[#1a1a1a] text-white" : "text-[var(--text-muted)]",
                    )}
                  >
                    {headers?.[i] ? (
                      headers[i]
                    ) : (
                      <Skeleton className={cn("h-3 w-20", darkHeader && "bg-white/20")} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rowCount }).map((_, row) => (
                <TableRow
                  key={row}
                  className="border-[var(--border-subtle)] hover:bg-transparent"
                >
                  {Array.from({ length: cols }).map((_, col) => (
                    <TableCell key={col} className="px-4 py-3.5">
                      <Skeleton
                        className={cn("h-4", col === 0 ? "w-[70%]" : "w-[55%]")}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
