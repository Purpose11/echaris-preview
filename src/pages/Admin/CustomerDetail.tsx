import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  useActivateCustomer,
  useAdminCustomer,
  useAdminCustomerKyc,
  useAdminCustomerPayoutAccount,
  useApproveAdminKyc,
  useDeactivateCustomer,
  useDeleteCustomer,
  useRejectAdminKyc,
} from "@/api/admin/hooks";
import type { AdminKycDocument } from "@/api/admin/types";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import {
  AdminCustomerDetailSkeleton,
  AdminKycDetailSkeleton,
} from "@/components/ui/page-skeleton";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { formatCommitmentNaira } from "@/lib/commitments";
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

function formatGender(gender?: string | null) {
  if (!gender) return "—";
  return gender
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDocType(type: string) {
  return type.replace(/_/g, " ");
}

function fileExtensionFromUrl(url: string) {
  try {
    const path = new URL(url).pathname;
    const match = path.match(/\.([a-zA-Z0-9]+)(?:$|\?)/);
    return match?.[1]?.toLowerCase() || "jpg";
  } catch {
    return "jpg";
  }
}

function fileNameFromUrl(url: string, fallback: string) {
  try {
    const path = new URL(url).pathname;
    const name = decodeURIComponent(path.split("/").pop() || "");
    if (name && name.includes(".")) return name;
  } catch {
    /* ignore */
  }
  return `${fallback}.${fileExtensionFromUrl(url)}`;
}

async function downloadKycFile(url: string, filename: string) {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}

function openKycFile(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

const blackButtonStyle = {
  background: "#171717",
  border: "1px solid #171717",
  color: "#ffffff",
  boxShadow: "none",
} as const;

const downloadButtonStyle = {
  background: "#1e3a5f",
  border: "1px solid #1e3a5f",
  color: "#ffffff",
  boxShadow: "none",
} as const;

function KycDocumentSideRow({
  index,
  label,
  url,
  fallbackName,
}: {
  index: number;
  label: string;
  url: string;
  fallbackName: string;
}) {
  const fileName = fileNameFromUrl(url, fallbackName);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md bg-[var(--surface-page,#F7F5F2)] px-3 py-3 sm:gap-4 sm:px-4">
      <span className="w-5 shrink-0 text-sm font-medium text-[var(--text-muted)]">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm font-medium text-[var(--text-heading)]">
          {label}
        </p>
        <p className="mt-0.5 mb-0 truncate text-xs text-[var(--text-muted)]">
          {fileName}
        </p>
      </div>
      <button
        type="button"
        aria-label={`View ${label}`}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-[var(--text-heading)] hover:bg-[var(--surface-muted,#EFECE8)]"
        onClick={() => openKycFile(url)}
      >
        <Icon name="eye" size={18} />
      </button>
      <Button
        type="button"
        className="h-9 shrink-0 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
        style={downloadButtonStyle}
        onClick={() => void downloadKycFile(url, fileName)}
      >
        Download
      </Button>
    </div>
  );
}

export default function CustomerDetail() {
  const navigate = useNavigate();
  const { customerId = "" } = useParams();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<AdminKycDocument | null>(null);

  const customerQuery = useAdminCustomer(customerId);
  const kycQuery = useAdminCustomerKyc(customerId, Boolean(customerId));
  const customer = customerQuery.data?.data;
  const payoutQuery = useAdminCustomerPayoutAccount(
    customer?.userId ?? "",
    Boolean(customer?.userId),
  );
  const activateMutation = useActivateCustomer();
  const deactivateMutation = useDeactivateCustomer();
  const deleteMutation = useDeleteCustomer();
  const approveMutation = useApproveAdminKyc();
  const rejectMutation = useRejectAdminKyc();

  const kyc = kycQuery.data?.data;
  const payout = payoutQuery.data?.data;
  const documents = kyc?.kycDocuments ?? [];
  const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();
  const busy =
    activateMutation.isPending ||
    deactivateMutation.isPending ||
    deleteMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending;

  const onActivate = () => {
    if (!customer) return;
    if (!customer.verified) {
      toast.error("This customer must be verified before activation.");
      return;
    }
    activateMutation.mutate(customer.customerId);
  };

  const onConfirmDelete = () => {
    if (!customer) return;
    deleteMutation.mutate(customer.customerId, {
      onSuccess: () => {
        setDeleteOpen(false);
        navigate("/admin/customers", { replace: true });
      },
    });
  };

  const onApprove = async (doc: AdminKycDocument) => {
    if (!customer) return;
    try {
      await approveMutation.mutateAsync({
        customerId: customer.customerId,
        documentType: String(doc.documentType),
        payload: { submissionVersion: doc.submissionVersion },
      });
    } catch {
      /* toast in hook */
    }
  };

  const onReject = async () => {
    if (!customer || !rejectTarget) return;
    if (rejectReason.trim().length < 5) {
      toast.error("Enter a rejection reason (at least 5 characters).");
      return;
    }
    try {
      await rejectMutation.mutateAsync({
        customerId: customer.customerId,
        documentType: String(rejectTarget.documentType),
        payload: {
          submissionVersion: rejectTarget.submissionVersion,
          rejectionReason: rejectReason.trim(),
        },
      });
      setRejectTarget(null);
      setRejectReason("");
    } catch {
      /* toast in hook */
    }
  };

  if (customerQuery.isLoading) {
    return <AdminCustomerDetailSkeleton />;
  }

  if (customerQuery.isError || !customer) {
    return (
      <div className="flex w-full flex-col gap-8 md:gap-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          <Link
            to="/admin/customers"
            className="font-semibold text-[var(--text-brand)] no-underline hover:underline"
          >
            Customers
          </Link>
          <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)" }} />
          <span className="text-[var(--text-muted)]">Customer</span>
        </nav>
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

  const displayName = name || customer.emailAddress;

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          to="/admin/customers"
          className="font-semibold text-[var(--text-brand)] no-underline hover:underline"
        >
          Customers
        </Link>
        <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)" }} />
        <span className="truncate font-medium text-[var(--text-heading)]">
          {displayName}
        </span>
      </nav>

      <AdminPageHeader
        title={displayName}
        description={customer.emailAddress}
        actions={
          <>
            {customer.active ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-md px-4 text-sm font-semibold shadow-none"
                loading={deactivateMutation.isPending}
                disabled={busy}
                onClick={() => deactivateMutation.mutate(customer.customerId)}
              >
                Deactivate
              </Button>
            ) : (
              <Button
                type="button"
                className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
                loading={activateMutation.isPending}
                disabled={busy || !customer.verified}
                onClick={onActivate}
              >
                Activate
              </Button>
            )}
            <Button
              type="button"
              className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
              style={blackButtonStyle}
              disabled={busy}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </>
        }
      />

      {!customer.verified && !customer.active ? (
        <p className="m-0 text-sm text-[var(--text-muted)]">
          Activation requires a verified account.
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:grid-cols-2 sm:p-6 md:grid-cols-3 md:p-8">
        <Field label="Email address" value={customer.emailAddress} />
        <Field label="Phone number" value={customer.phoneNumber} />
        <Field label="Gender" value={formatGender(customer.gender)} />
        <Field label="Age" value={customer.age || "—"} />
        <Field label="Referral code" value={customer.referralCode} />
        <Field
          label="Account"
          value={<AdminStatusPill status={customer.active ? "ACTIVE" : "INACTIVE"} />}
        />
        <Field
          label="Verified"
          value={
            <span
              className={
                customer.verified
                  ? "inline-flex items-center rounded-full bg-[var(--surface-success-subtle,#EAF7EE)] px-2.5 py-1 text-xs font-semibold text-[var(--text-success,#067647)]"
                  : "inline-flex items-center rounded-full bg-[var(--surface-muted,#F3F1EE)] px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)]"
              }
            >
              {customer.verified ? "Verified" : "Unverified"}
            </span>
          }
        />
        <Field
          label="KYC submitted"
          value={
            <span
              className={
                customer.doneKyc
                  ? "inline-flex items-center rounded-full bg-[var(--surface-success-subtle,#EAF7EE)] px-2.5 py-1 text-xs font-semibold text-[var(--text-success,#067647)]"
                  : "inline-flex items-center rounded-full bg-[var(--surface-muted,#F3F1EE)] px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)]"
              }
            >
              {customer.doneKyc ? "Submitted" : "Not submitted"}
            </span>
          }
        />
        <Field
          label="KYC accepted"
          value={
            <span
              className={
                kyc?.kycAccepted
                  ? "inline-flex items-center rounded-full bg-[var(--surface-success-subtle,#EAF7EE)] px-2.5 py-1 text-xs font-semibold text-[var(--text-success,#067647)]"
                  : "inline-flex items-center rounded-full bg-[var(--surface-muted,#F3F1EE)] px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)]"
              }
            >
              {kyc?.kycAccepted ? "Accepted" : "Not accepted"}
            </span>
          }
        />
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 md:p-8">
        <div className="mb-5">
          <h2 className="m-0 text-lg font-bold tracking-[-0.02em] text-[var(--text-heading)]">
            Payout account
          </h2>
          <p className="mt-2 mb-0 text-sm text-[var(--text-muted)]">
            Bank details saved by the customer for payouts. Version is required when
            recording a payout.
          </p>
        </div>

        {payoutQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-[var(--surface-muted,#EFECE8)]" />
                <div className="h-5 w-36 animate-pulse rounded bg-[var(--surface-muted,#EFECE8)]" />
              </div>
            ))}
          </div>
        ) : payoutQuery.isError ? (
          <p className="m-0 text-sm text-[var(--text-muted)]">
            {normalizeError(payoutQuery.error) ||
              "No payout account on file for this customer."}
          </p>
        ) : payout?.details ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            <Field label="Bank name" value={payout.details.bankName} />
            <Field label="Account name" value={payout.details.accountName} />
            <Field label="Account number" value={payout.details.accountNumber} />
            <Field
              label="Amount"
              value={
                payout.details.amount !== undefined && payout.details.amount !== null
                  ? formatCommitmentNaira(Number(payout.details.amount) || 0)
                  : "—"
              }
            />
            <Field label="Version" value={String(payout.version)} />
          </div>
        ) : (
          <p className="m-0 text-sm text-[var(--text-muted)]">
            No payout account on file for this customer.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 md:p-8">
        <div className="mb-5">
          <h2 className="m-0 text-lg font-bold tracking-[-0.02em] text-[var(--text-heading)]">
            KYC submissions
          </h2>
          <p className="mt-2 mb-0 text-sm text-[var(--text-muted)]">
            Review submitted identity documents, download uploads, and approve or reject.
          </p>
        </div>

        {kycQuery.isLoading ? (
          <AdminKycDetailSkeleton />
        ) : kycQuery.isError ? (
          <div className="flex flex-col items-start gap-3">
            <p className="m-0 text-sm text-[var(--text-danger,#b42318)]">
              {normalizeError(kycQuery.error)}
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
              onClick={() => void kycQuery.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : documents.length === 0 ? (
          <p className="m-0 text-sm text-[var(--text-muted)]">
            No KYC documents submitted for this customer.
          </p>
        ) : (
          <ul className="m-0 list-none space-y-5 p-0">
            {documents.map((doc) => {
              const pending = String(doc.reviewStatus).toUpperCase() === "PENDING";
              const docLabel = formatDocType(String(doc.documentType));
              const fileSlug = docLabel.toLowerCase().replace(/\s+/g, "-");
              return (
                <li
                  key={`${doc.documentType}-${doc.submissionVersion}`}
                  className="rounded-lg border border-[var(--border-subtle)] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <div>
                        <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
                          Document type
                        </p>
                        <p className="mt-1 mb-0 text-base font-bold text-[var(--text-heading)]">
                          {docLabel}
                        </p>
                      </div>
                      {doc.documentNumber ? (
                        <div>
                          <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
                            {docLabel} number
                          </p>
                          <p className="mt-1 mb-0 text-base font-bold text-[var(--text-heading)]">
                            {doc.documentNumber}
                          </p>
                        </div>
                      ) : null}
                    </div>
                    <AdminStatusPill status={String(doc.reviewStatus)} />
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <KycDocumentSideRow
                      index={1}
                      label="Front view"
                      url={doc.frontViewUrl}
                      fallbackName={`${fileSlug}-front`}
                    />
                    <KycDocumentSideRow
                      index={2}
                      label="Back view"
                      url={doc.backViewUrl}
                      fallbackName={`${fileSlug}-back`}
                    />
                  </div>

                  {doc.rejectionReason ? (
                    <p className="mt-3 mb-0 text-sm text-[var(--text-danger,#b42318)]">
                      Reason: {doc.rejectionReason}
                    </p>
                  ) : null}

                  {pending ? (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Button
                        type="button"
                        className="h-10 w-full rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0 sm:w-auto"
                        loading={approveMutation.isPending}
                        disabled={busy}
                        onClick={() => void onApprove(doc)}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        className="h-10 w-full rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0 sm:w-auto"
                        style={blackButtonStyle}
                        disabled={busy}
                        onClick={() => {
                          setRejectTarget(doc);
                          setRejectReason("");
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        {rejectTarget ? (
          <div className="mt-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-page)] p-4">
            <p className="m-0 text-sm font-semibold text-[var(--text-heading)]">
              Reject {formatDocType(String(rejectTarget.documentType))}
            </p>
            <div className="mt-3">
              <FormField label="Rejection reason" htmlFor="reject-reason">
                <Input
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this document was rejected"
                />
              </FormField>
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                className="h-10 w-full rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0 sm:w-auto"
                style={blackButtonStyle}
                loading={rejectMutation.isPending}
                disabled={busy}
                onClick={() => void onReject()}
              >
                Confirm reject
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full rounded-md px-4 text-sm font-semibold shadow-none sm:w-auto"
                disabled={rejectMutation.isPending}
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <AdminConfirmModal
        open={deleteOpen}
        title={`Delete ${displayName}?`}
        description="This soft-deletes the customer profile and linked user account."
        confirmLabel="Delete customer"
        cancelLabel="Cancel"
        tone="dark"
        loading={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteOpen(false);
        }}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}
