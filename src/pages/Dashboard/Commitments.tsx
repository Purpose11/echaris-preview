import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpRight,
  Coins,
  Layers,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useMyCommitments } from "@/api/commitments/hooks";
import type { Commitment } from "@/api/commitments/types";
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
import { DashboardCommitmentsSkeleton } from "@/components/ui/page-skeleton";
import {
  addCommitmentMonths,
  COMMITMENT_STATUS_STYLES,
  type DisplayCommitmentStatus,
  formatCommitmentDate,
  formatCommitmentNaira,
  mapCommitmentStatus,
} from "@/lib/commitments";
import { cn } from "@/lib/utils";
import { normalizeError } from "@/utils/normalizeError";

type DisplayStatus = DisplayCommitmentStatus;

type StatusFilter = "all" | DisplayStatus;

const STATUS_FILTER_OPTIONS: readonly StatusFilter[] = [
  "all",
  "Active",
  "Pending",
  "Awaiting payment",
  "Completed",
  "Cancelled",
] as const;

type CommitmentRow = {
  id: string;
  name: string;
  capital: number;
  monthlyReturns: number;
  durationMonths: number;
  startDate: string | null;
  maturityDate: string | null;
  status: DisplayStatus;
  rawStatus: string;
};

const ACTIVE_STATUSES = new Set(["LOCKED", "ACTIVE"]);

function toCommitmentRow(item: Commitment): CommitmentRow {
  const start = item.startDate || item.fundedAt || item.createdAt || null;
  const maturity =
    item.maturityDate ||
    item.endDate ||
    (start ? addCommitmentMonths(start, item.durationMonths) : null);
  const monthlyReturns = Math.round(
    (Number(item.capital) || 0) * ((Number(item.monthlyRate) || 0) / 100),
  );

  return {
    id: item.id,
    name: item.name,
    capital: Number(item.capital) || 0,
    monthlyReturns,
    durationMonths: Number(item.durationMonths) || 0,
    startDate: start,
    maturityDate: maturity,
    status: mapCommitmentStatus(String(item.status ?? "")),
    rawStatus: String(item.status ?? ""),
  };
}

function StatusPill({ status }: { status: DisplayStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        COMMITMENT_STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

function StatIcon({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "on-brand";
}) {
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-md",
        tone === "on-brand"
          ? "bg-white/20 text-white"
          : "bg-[var(--orange-50)] text-[var(--brand-primary)]",
      )}
    >
      {children}
    </span>
  );
}

export default function DashboardCommitments() {
  const navigate = useNavigate();
  const commitmentsQuery = useMyCommitments({ page: 1, size: 100 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const goCreate = () => navigate("/dashboard/commitments/new");

  const programs = useMemo(() => {
    const rows = commitmentsQuery.data?.data?.data ?? [];
    return rows.map(toCommitmentRow);
  }, [commitmentsQuery.data]);

  const activePrograms = programs.filter(
    (p) => ACTIVE_STATUSES.has(p.rawStatus.toUpperCase()) || p.status === "Active",
  );
  const totalCapital = activePrograms.reduce((sum, p) => sum + p.capital, 0);
  const totalReturns = programs.reduce((sum, p) => sum + p.monthlyReturns, 0);
  const isEmpty = !commitmentsQuery.isLoading && programs.length === 0;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return programs.filter((p) => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [programs, search, statusFilter]);

  const columns = useMemo<ColumnDef<CommitmentRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Growth program",
        cell: ({ row }) => (
          <Link
            to={`/dashboard/commitments/${row.original.id}`}
            className="group inline-flex max-w-full items-center gap-1.5 font-semibold no-underline hover:underline hover:decoration-[var(--border-strong)] hover:underline-offset-4"
            style={{ color: "var(--text-heading)" }}
          >
            <span className="truncate">{row.original.name}</span>
            <ArrowUpRight className="size-3.5 shrink-0 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ),
      },
      {
        accessorKey: "capital",
        header: "Capital commitment",
        cell: ({ row }) => formatCommitmentNaira(row.original.capital),
      },
      {
        accessorKey: "monthlyReturns",
        header: "Monthly returns",
        cell: ({ row }) => formatCommitmentNaira(row.original.monthlyReturns),
      },
      {
        accessorKey: "durationMonths",
        header: "Duration",
        cell: ({ row }) => `${row.original.durationMonths} months`,
      },
      {
        accessorKey: "startDate",
        header: "Start date",
        cell: ({ row }) => formatCommitmentDate(row.original.startDate),
      },
      {
        accessorKey: "maturityDate",
        header: "Maturity",
        cell: ({ row }) => formatCommitmentDate(row.original.maturityDate),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusPill status={row.original.status} />,
      },
    ],
    [],
  );

  const filterLabel = statusFilter === "all" ? "All programs" : statusFilter;

  if (commitmentsQuery.isLoading) {
    return <DashboardCommitmentsSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[32px]">
            Capital commitments
          </h1>
          <p className="mt-3 max-w-[560px] text-sm leading-relaxed text-[var(--text-muted)] md:text-[15px]">
            Manage your active growth programs, track performance returns, and monitor
            commitment progress.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 self-start">
          <Button
            type="button"
            className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
            onClick={goCreate}
          >
            <Plus className="size-4" />
            Create new commitment
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <article className="rounded-lg bg-[var(--brand-primary)] p-6 text-white md:p-8">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 text-[11px] font-semibold tracking-[0.08em] uppercase opacity-90">
              Total capital commitment
            </p>
            <StatIcon tone="on-brand">
              <TrendingUp className="size-4" />
            </StatIcon>
          </div>
          <p className="mt-7 mb-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] md:text-[30px]">
            {formatCommitmentNaira(totalCapital)}
          </p>
          <p className="mt-4 mb-0 text-sm opacity-90">
            {activePrograms.length === 0
              ? "No active programs"
              : `Across ${activePrograms.length} active program${activePrograms.length === 1 ? "" : "s"}`}
          </p>
        </article>

        <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
              Active programs
            </p>
            <StatIcon>
              <Layers className="size-4" />
            </StatIcon>
          </div>
          <p className="mt-7 mb-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[30px]">
            {activePrograms.length}
          </p>
          <p className="mt-4 mb-0 text-sm text-[var(--text-muted)]">Currently running</p>
        </article>

        <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
              Total performance returns
            </p>
            <StatIcon>
              <Coins className="size-4" />
            </StatIcon>
          </div>
          <p className="mt-7 mb-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[30px]">
            {formatCommitmentNaira(totalReturns)}
          </p>
          <p className="mt-4 mb-0 text-sm text-[var(--text-muted)]">
            Expected monthly returns
          </p>
        </article>
      </section>

      {commitmentsQuery.isError ? (
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center md:py-24">
          <p className="m-0 max-w-[420px] text-sm leading-relaxed text-[var(--text-danger,#b42318)]">
            {normalizeError(commitmentsQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void commitmentsQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      ) : isEmpty ? (
        <section className="flex flex-col items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center md:px-10 md:py-24">
          <span className="inline-flex size-14 items-center justify-center rounded-lg bg-[var(--neutral-100)] text-[var(--text-muted)]">
            <TrendingUp className="size-6" />
          </span>
          <div className="mt-7 flex max-w-[420px] flex-col items-center gap-3">
            <h2 className="m-0 text-lg font-bold text-[var(--text-heading)] md:text-xl">
              No active capital commitments yet
            </h2>
            <p className="m-0 text-sm leading-relaxed text-[var(--text-muted)] md:text-[15px]">
              Start your first growth program and begin tracking your performance returns.
            </p>
          </div>
          <div className="mt-8">
            <Button
              type="button"
              className="h-11 rounded-md border-0 px-5 text-sm font-semibold shadow-none ring-0"
              onClick={goCreate}
            >
              <Plus className="size-4" />
              Create new commitment
            </Button>
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 md:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="m-0 text-base font-bold text-[var(--text-heading)] md:text-lg">
              Growth programs
            </h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative block min-w-0 sm:w-[260px]">
                <span className="sr-only">Search growth programs</span>
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search growth programs"
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
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
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
                        {option === "all" ? "All programs" : option}
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
            emptyMessage="No growth programs match your search."
          />
        </section>
      )}
    </div>
  );
}
