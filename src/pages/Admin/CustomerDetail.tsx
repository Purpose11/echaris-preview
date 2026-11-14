import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import {
  useActivateCustomer,
  useAdminCustomer,
  useAdminCustomerKyc,
  useDeactivateCustomer,
} from "@/api/admin/hooks";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { Button } from "@/design-system/components/core/Button.jsx";
import { normalizeError } from "@/utils/normalizeError";

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
        {label}
      </p>
      <p className="mt-2 mb-0 text-sm font-medium text-[var(--text-heading)]">
        {value || "—"}
      </p>
    </div>
  );
}

export default function CustomerDetail() {
  const { customerId = "" } = useParams();
  const customerQuery = useAdminCustomer(customerId);
  const kycQuery = useAdminCustomerKyc(customerId);
  const activateMutation = useActivateCustomer();
  const deactivateMutation = useDeactivateCustomer();

  const customer = customerQuery.data?.data;
  const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();

  if (customerQuery.isLoading) {
    return (
      <div className="flex w-full flex-col gap-8 md:gap-10">
        <AdminPageHeader title="Customer" description="Loading customer details…" />
      </div>
    );
  }

  if (customerQuery.isError || !customer) {
    return (
      <div className="flex w-full flex-col gap-8 md:gap-10">
        <AdminPageHeader title="Customer" />
        <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-16 text-center">
          <p className="m-0 text-sm text-[var(--text-danger,#b42318)]">
            {normalizeError(customerQuery.error) || "Customer not found."}
          </p>
          <Link
            to="/admin/customers"
            className="mt-4 inline-block text-sm font-semibold text-[var(--text-brand)]"
          >
            Back to customers
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <AdminPageHeader
        title={name || customer.emailAddress}
        description={customer.emailAddress}
        actions={
          <>
            {customer.active ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-md px-4 text-sm font-semibold shadow-none"
                loading={deactivateMutation.isPending}
                onClick={() => deactivateMutation.mutate(customer.customerId)}
              >
                Deactivate
              </Button>
            ) : (
              <Button
                type="button"
                className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
                loading={activateMutation.isPending}
                onClick={() => activateMutation.mutate(customer.customerId)}
              >
                Activate
              </Button>
            )}
          </>
        }
      />

      <section className="grid grid-cols-1 gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:grid-cols-2 sm:p-6 md:grid-cols-3 md:p-8">
        <Field label="Customer number" value={customer.customerNumber} />
        <Field label="Referral code" value={customer.referralCode} />
        <Field label="Phone" value={customer.phoneNumber} />
        <Field
          label="Account"
          value={<AdminStatusPill status={customer.active ? "ACTIVE" : "INACTIVE"} />}
        />
        <Field
          label="Verified"
          value={<AdminStatusPill status={customer.verified ? "APPROVED" : "PENDING"} />}
        />
        <Field
          label="KYC"
          value={<AdminStatusPill status={customer.doneKyc ? "APPROVED" : "PENDING"} />}
        />
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 md:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="m-0 text-lg font-bold tracking-[-0.02em] text-[var(--text-heading)]">
            KYC documents
          </h2>
          <Link
            to={`/admin/kyc?customerId=${customer.customerId}`}
            className="text-sm font-semibold text-[var(--text-brand)] no-underline"
          >
            Open in KYC review
          </Link>
        </div>
        {kycQuery.isLoading ? (
          <p className="mt-4 mb-0 text-sm text-[var(--text-muted)]">Loading…</p>
        ) : (kycQuery.data?.data?.kycDocuments?.length ?? 0) === 0 ? (
          <p className="mt-4 mb-0 text-sm text-[var(--text-muted)]">
            No KYC documents submitted.
          </p>
        ) : (
          <ul className="mt-5 mb-0 list-none space-y-3 p-0">
            {kycQuery.data?.data?.kycDocuments.map((doc) => (
              <li
                key={`${doc.documentType}-${doc.submissionVersion}`}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="m-0 text-sm font-semibold text-[var(--text-heading)]">
                    {String(doc.documentType).replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 mb-0 text-xs text-[var(--text-muted)]">
                    {doc.documentNumber} · v{doc.submissionVersion}
                  </p>
                </div>
                <AdminStatusPill status={String(doc.reviewStatus)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
