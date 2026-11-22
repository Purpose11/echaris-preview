import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAdminCustomers } from "@/api/admin/hooks";
import type { AdminCustomer, Gender } from "@/api/admin/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/design-system/components/core/Button.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { Select } from "@/design-system/components/forms/Select.jsx";
import { normalizeError } from "@/utils/normalizeError";

const ACTIVE_OPTIONS = [
  { value: "", label: "All accounts" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

const VERIFIED_OPTIONS = [
  { value: "", label: "All verification" },
  { value: "true", label: "Verified" },
  { value: "false", label: "Unverified" },
];

const GENDER_OPTIONS = [
  { value: "", label: "All genders" },
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NON_BINARY", label: "Non-binary" },
];

function parseTriState(value: string): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export default function Customers() {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [registeredFrom, setRegisteredFrom] = useState("");
  const [registeredTo, setRegisteredTo] = useState("");

  const customersQuery = useAdminCustomers({
    searchParam: submittedSearch || undefined,
    active: parseTriState(activeFilter),
    verified: parseTriState(verifiedFilter),
    gender: (genderFilter as Gender) || undefined,
    registeredFrom: registeredFrom || undefined,
    registeredTo: registeredTo || undefined,
  });

  const rows = customersQuery.data?.data?.data ?? [];
  const hasActiveFilters =
    Boolean(submittedSearch) ||
    Boolean(activeFilter) ||
    Boolean(verifiedFilter) ||
    Boolean(genderFilter) ||
    Boolean(registeredFrom) ||
    Boolean(registeredTo);

  const columns = useMemo<ColumnDef<AdminCustomer>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => {
          const name = [row.original.firstName, row.original.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
          return (
            <Link
              to={`/admin/customers/${row.original.customerId}`}
              className="group inline-flex max-w-full items-center gap-1.5 font-semibold no-underline hover:underline hover:decoration-[var(--border-strong)] hover:underline-offset-4"
              style={{ color: "var(--text-heading)" }}
            >
              <span className="truncate">{name || "—"}</span>
              <ArrowUpRight className="size-3.5 shrink-0 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          );
        },
      },
      {
        accessorKey: "emailAddress",
        header: "Email address",
        cell: ({ row }) => (
          <span className="truncate">{row.original.emailAddress || "—"}</span>
        ),
      },
      {
        accessorKey: "phoneNumber",
        header: "Phone number",
        cell: ({ row }) => row.original.phoneNumber || "—",
      },
      {
        id: "doneKyc",
        header: "KYC submitted",
        cell: ({ row }) => (
          <span
            className={
              row.original.doneKyc
                ? "inline-flex items-center rounded-full bg-[var(--surface-success-subtle,#EAF7EE)] px-2.5 py-1 text-xs font-semibold text-[var(--text-success,#067647)]"
                : "inline-flex items-center rounded-full bg-[var(--surface-muted,#F3F1EE)] px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)]"
            }
          >
            {row.original.doneKyc ? "Submitted" : "Not submitted"}
          </span>
        ),
      },
      {
        id: "active",
        header: "Account",
        cell: ({ row }) => (
          <AdminStatusPill status={row.original.active ? "ACTIVE" : "INACTIVE"} />
        ),
      },
    ],
    [],
  );

  const clearFilters = () => {
    setSearch("");
    setSubmittedSearch("");
    setActiveFilter("");
    setVerifiedFilter("");
    setGenderFilter("");
    setRegisteredFrom("");
    setRegisteredTo("");
  };

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <AdminPageHeader
        title="Customers"
        description="Search and filter client accounts by status, verification, and registration date."
      />

      <form
        className="flex w-full min-w-0 flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmittedSearch(search.trim());
        }}
      >
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone number"
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

        <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <FormField label="Account" htmlFor="filter-active">
            <Select
              id="filter-active"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              options={ACTIVE_OPTIONS}
            />
          </FormField>
          <FormField label="Verified" htmlFor="filter-verified">
            <Select
              id="filter-verified"
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              options={VERIFIED_OPTIONS}
            />
          </FormField>
          <FormField label="Gender" htmlFor="filter-gender">
            <Select
              id="filter-gender"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              options={GENDER_OPTIONS}
            />
          </FormField>
          <FormField label="Registered from" htmlFor="filter-from">
            <Input
              id="filter-from"
              type="date"
              value={registeredFrom}
              onChange={(e) => setRegisteredFrom(e.target.value)}
            />
          </FormField>
          <FormField label="Registered to" htmlFor="filter-to">
            <Input
              id="filter-to"
              type="date"
              value={registeredTo}
              onChange={(e) => setRegisteredTo(e.target.value)}
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

      {customersQuery.isError ? (
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm leading-relaxed text-[var(--text-danger,#b42318)]">
            {normalizeError(customersQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void customersQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={customersQuery.isLoading}
          emptyMessage="No customers found."
        />
      )}
    </div>
  );
}
