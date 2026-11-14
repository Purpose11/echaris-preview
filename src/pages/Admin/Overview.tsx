import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  useAdminCommitments,
  useAdminCounts,
  useAdminCustomers,
  useAdminFinancings,
  useAdminKycList,
  useAdminPayments,
  useAdminProducts,
} from "@/api/admin/hooks";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { cn } from "@/lib/utils";
import { getAdminRole } from "@/utils/authHelper";

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
          : "bg-[var(--surface-brand-subtle)] text-[var(--text-brand)]",
      )}
    >
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
  hint,
  href,
  brand = false,
  icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  href: string;
  brand?: boolean;
  icon: string;
}) {
  return (
    <Link
      to={href}
      className={cn(
        "rounded-lg p-5 no-underline transition-opacity hover:opacity-95 sm:p-6 md:p-8",
        brand
          ? "bg-[var(--brand-primary)] text-white"
          : "border border-[var(--border-subtle)] bg-[var(--surface-card)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            "m-0 text-[11px] font-semibold tracking-[0.08em] uppercase",
            brand ? "opacity-90" : "text-[var(--text-muted)]",
          )}
        >
          {label}
        </p>
        <StatIcon tone={brand ? "on-brand" : "brand"}>
          <Icon name={icon} size={16} />
        </StatIcon>
      </div>
      <p
        className={cn(
          "mt-7 mb-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] md:text-[30px]",
          brand ? "text-white" : "text-[var(--text-heading)]",
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "mt-4 mb-0 text-sm",
          brand ? "opacity-90" : "text-[var(--text-muted)]",
        )}
      >
        {hint}
      </p>
    </Link>
  );
}

export default function Overview() {
  const navigate = useNavigate();
  const role = getAdminRole();
  const isSuper = role === "SUPER_ADMIN";

  const customersQuery = useAdminCustomers({ page: 1, size: 1 });
  const kycQuery = useAdminKycList({ page: 1, size: 1, status: "PENDING" });
  const productsQuery = useAdminProducts({ page: 1, size: 1 });
  const commitmentsQuery = useAdminCommitments({ page: 1, size: 1 });
  const paymentsQuery = useAdminPayments({ page: 1, size: 1, status: "PENDING" });
  const financingsQuery = useAdminFinancings({ page: 1, size: 1 });
  const adminCountsQuery = useAdminCounts(isSuper);

  const customers = customersQuery.data?.data?.totalElements ?? "—";
  const pendingKyc = kycQuery.data?.data?.totalElements ?? "—";
  const products = productsQuery.data?.data?.totalElements ?? "—";
  const commitments = commitmentsQuery.data?.data?.totalElements ?? "—";
  const pendingPayments = paymentsQuery.data?.data?.totalElements ?? "—";
  const financings = financingsQuery.data?.data?.totalElements ?? "—";

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <AdminPageHeader
        title="Overview"
        description="Monitor customers, KYC reviews, capital commitments, payments, and marketplace financing."
        actions={
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => {
              void customersQuery.refetch();
              void kycQuery.refetch();
              void productsQuery.refetch();
              void commitmentsQuery.refetch();
              void paymentsQuery.refetch();
              void financingsQuery.refetch();
              if (isSuper) void adminCountsQuery.refetch();
            }}
          >
            <Icon name="refresh-cw" size={16} />
            Refresh
          </Button>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Customers"
          value={customers}
          hint="Registered client accounts"
          href="/admin/customers"
          brand
          icon="users"
        />
        <StatCard
          label="Pending KYC"
          value={pendingKyc}
          hint="Documents awaiting review"
          href="/admin/kyc"
          icon="id-card"
        />
        <StatCard
          label="Products"
          value={products}
          hint="Catalog items"
          href="/admin/products"
          icon="inbox"
        />
        <StatCard
          label="Commitments"
          value={commitments}
          hint="Capital programs"
          href="/admin/commitments"
          icon="trending-up"
        />
        <StatCard
          label="Pending payments"
          value={pendingPayments}
          hint="Awaiting action"
          href="/admin/payments"
          icon="wallet"
        />
        <StatCard
          label="Marketplace financings"
          value={financings}
          hint="Active financing programs"
          href="/admin/marketplace"
          icon="store"
        />
      </section>

      {isSuper ? (
        <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="m-0 text-lg font-bold tracking-[-0.02em] text-[var(--text-heading)]">
                Admin accounts
              </h2>
              <p className="mt-2 mb-0 text-sm text-[var(--text-muted)]">
                {adminCountsQuery.data
                  ? `${adminCountsQuery.data.total} total · ${adminCountsQuery.data.active} active · ${adminCountsQuery.data.inactive} inactive`
                  : "Loading admin counts…"}
              </p>
            </div>
            <Button
              type="button"
              className="h-11 w-full rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0 sm:w-auto"
              onClick={() => navigate("/admin/admins")}
            >
              Manage admins
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
