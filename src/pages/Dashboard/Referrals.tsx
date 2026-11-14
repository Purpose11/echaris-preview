import { type ColumnDef } from "@tanstack/react-table";
import { Check, ChevronDown, Copy, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useCustomerProfile, useMyReferrals } from "@/api/customer/hooks";
import type { CustomerReferral } from "@/api/customer/types";
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
import { DashboardReferralsSkeleton } from "@/components/ui/page-skeleton";
import { formatCommitmentDate } from "@/lib/commitments";
import { cn } from "@/lib/utils";
import { normalizeError } from "@/utils/normalizeError";

type ReferralStatus = "Verified" | "Pending";

type StatusFilter = "all" | ReferralStatus;

type ReferralRow = {
  id: string;
  client: string;
  verifiedAt: string | null;
  status: ReferralStatus;
};

const STATUS_FILTER_OPTIONS: readonly StatusFilter[] = [
  "all",
  "Verified",
  "Pending",
] as const;

const HOW_IT_WORKS = [
  {
    title: "Share your code",
    body: "Anyone who signs up with your code or link is linked to your client account.",
  },
  {
    title: "They commit capital",
    body: "When a referred client funds a growth program, their committed capital becomes the basis for your reward.",
  },
  {
    title: "You earn 5%",
    body: "You receive 5% of the capital the referred client committed, credited to your wallet once their growth program activates.",
  },
] as const;

function referralDisplayName(item: CustomerReferral) {
  if (item.fullName?.trim()) return item.fullName.trim();
  const name = [item.firstName, item.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  if (name) return name;
  return item.customerId;
}

function mapReferralStatus(item: CustomerReferral): ReferralStatus {
  return item.verifiedAt ? "Verified" : "Pending";
}

function toReferralRow(item: CustomerReferral): ReferralRow {
  return {
    id: item.customerId,
    client: referralDisplayName(item),
    verifiedAt: item.verifiedAt ?? null,
    status: mapReferralStatus(item),
  };
}

function StatusPill({ status }: { status: ReferralStatus }) {
  const styles: Record<ReferralStatus, string> = {
    Verified: "bg-[var(--success-50)] text-[var(--text-success)]",
    Pending: "bg-[var(--surface-brand-subtle)] text-[var(--text-brand)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}

export default function DashboardReferrals() {
  const profileQuery = useCustomerProfile();
  const referralsQuery = useMyReferrals({ page: 1, size: 100 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [codeCopied, setCodeCopied] = useState(false);
  const codeCopiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const referralCode = profileQuery.data?.data?.referralCode?.trim() || "";

  useEffect(() => {
    return () => {
      if (codeCopiedTimeoutRef.current) {
        clearTimeout(codeCopiedTimeoutRef.current);
      }
    };
  }, []);

  const rows = useMemo(() => {
    const items = referralsQuery.data?.data?.data ?? [];
    return items.map(toReferralRow);
  }, [referralsQuery.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !q || row.client.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const columns = useMemo<ColumnDef<ReferralRow>[]>(
    () => [
      {
        accessorKey: "client",
        header: "Client",
        cell: ({ row }) => (
          <span className="font-semibold text-[var(--text-heading)]">
            {row.original.client}
          </span>
        ),
      },
      {
        accessorKey: "verifiedAt",
        header: "Verified",
        cell: ({ row }) => formatCommitmentDate(row.original.verifiedAt),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusPill status={row.original.status} />,
      },
    ],
    [],
  );

  const filterLabel = statusFilter === "all" ? "All referrals" : statusFilter;

  const clearCodeCopied = () => {
    if (codeCopiedTimeoutRef.current) {
      clearTimeout(codeCopiedTimeoutRef.current);
      codeCopiedTimeoutRef.current = null;
    }
    setCodeCopied(false);
  };

  const copyReferralCode = async () => {
    if (!referralCode) {
      toast.error("Referral code is not available yet");
      return;
    }
    try {
      await navigator.clipboard.writeText(referralCode);
      setCodeCopied(true);
      if (codeCopiedTimeoutRef.current) {
        clearTimeout(codeCopiedTimeoutRef.current);
      }
      codeCopiedTimeoutRef.current = setTimeout(() => {
        setCodeCopied(false);
        codeCopiedTimeoutRef.current = null;
      }, 2000);
    } catch {
      clearCodeCopied();
      toast.error("Could not copy referral code");
    }
  };

  if (profileQuery.isLoading || referralsQuery.isLoading) {
    return <DashboardReferralsSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <header className="min-w-0">
        <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[32px]">
          Referrals
        </h1>
        <p className="mt-3 max-w-[640px] text-sm leading-relaxed text-[var(--text-muted)] md:text-[15px]">
          Share your referral code, track the clients who join through you, and follow the
          rewards credited to your wallet.
        </p>
      </header>

      {profileQuery.isError || referralsQuery.isError ? (
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-5 py-4 text-sm text-[var(--text-muted)]">
          {normalizeError(profileQuery.error ?? referralsQuery.error)}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:grid-cols-2 md:gap-10 md:p-8">
        <div>
          <h2 className="m-0 text-base font-bold text-[var(--text-heading)] md:text-lg">
            Your referral code
          </h2>
          <p className="mt-2 mb-0 max-w-[420px] text-sm leading-relaxed text-[var(--text-muted)]">
            Share your code. You earn 5% of a referred client&apos;s committed capital
            once their growth program activates.
          </p>

          <div className="mt-5 rounded-md bg-[var(--surface-brand-subtle)] px-4 py-4">
            <p className="m-0 font-mono text-lg font-bold tracking-wide text-[var(--text-heading)] md:text-xl">
              {referralCode || "—"}
            </p>
          </div>

          <button
            type="button"
            disabled={!referralCode}
            onClick={() => void copyReferralCode()}
            className={cn(
              "mt-4 inline-flex h-10 items-center gap-1.5 rounded-md border px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50",
              codeCopied
                ? "border-[var(--success-100)] bg-[var(--success-50)] text-[var(--text-success)]"
                : "border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-heading)] hover:bg-[var(--neutral-100)]",
            )}
          >
            {codeCopied ? (
              <>
                <Check className="size-3.5 text-[var(--text-success)]" strokeWidth={3} />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-[var(--brand-primary)]" />
                Copy code
              </>
            )}
          </button>
        </div>

        <div>
          <h2 className="m-0 text-base font-bold text-[var(--text-heading)] md:text-lg">
            How referral rewards work
          </h2>
          <ol className="mt-5 mb-0 flex list-none flex-col gap-5 p-0">
            {HOW_IT_WORKS.map((item, index) => (
              <li key={item.title} className="flex gap-3">
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-brand-subtle)] text-xs font-bold text-[var(--text-brand)]">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="m-0 text-sm font-bold text-[var(--text-heading)]">
                    {item.title}
                  </p>
                  <p className="mt-1 mb-0 text-sm leading-relaxed text-[var(--text-muted)]">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="m-0 text-base font-bold text-[var(--text-heading)] md:text-lg">
            Referred clients
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative block min-w-0 sm:w-[260px]">
              <span className="sr-only">Search referrals</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search referrals"
                className="h-10 w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-card)] pr-3 pl-9 text-sm text-[var(--text-heading)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)]"
              />
            </label>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-card)] px-3 text-sm font-medium text-[var(--text-heading)] outline-none hover:bg-[var(--neutral-50)] focus-visible:border-[var(--brand-primary)] focus-visible:outline-none data-[state=open]:border-[var(--brand-primary)] data-[state=open]:bg-[var(--surface-brand-subtle)]"
                >
                  <SlidersHorizontal className="size-4 text-[var(--text-muted)]" />
                  {filterLabel}
                  <ChevronDown className="size-4 text-[var(--text-muted)]" />
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
                      {option === "all" ? "All referrals" : option}
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
          pageSize={5}
          hidePaginationWhenSinglePage={false}
          emptyMessage="No referrals yet. Share your code to get started."
        />
      </section>
    </div>
  );
}
