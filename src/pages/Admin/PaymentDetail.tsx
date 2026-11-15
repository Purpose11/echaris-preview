import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { getAdminCustomer, listAdminCustomers } from "@/api/admin/admin";
import { listAdminCommitments } from "@/api/admin/domain";
import { useAdminPayment, useUpdateAdminPaymentStatus } from "@/api/admin/hooks";
import { adminKeys } from "@/api/admin/querykeys";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { AdminCustomerDetailSkeleton } from "@/components/ui/page-skeleton";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Textarea } from "@/design-system/components/forms/Textarea.jsx";
import { formatCommitmentDate, formatCommitmentNaira } from "@/lib/commitments";
import { normalizeError } from "@/utils/normalizeError";

function customerDisplayName(parts: {
  firstName?: string | null;
  lastName?: string | null;
  emailAddress?: string | null;
}) {
  const name = [parts.firstName, parts.lastName].filter(Boolean).join(" ").trim();
  return name || parts.emailAddress || null;
}

async function resolveCustomerNameByUserId(userId: string) {
  const customers = await listAdminCustomers({
    searchParam: userId,
    page: 1,
    size: 20,
  });
  const match = customers.data?.data?.find((c) => c.userId === userId);
  if (match) return customerDisplayName(match);

  const commitments = await listAdminCommitments({
    userId,
    page: 1,
    size: 1,
  });
  const customerId = commitments.data?.data?.[0]?.customerId?.trim() || "";
  if (!customerId) return null;
  const customer = await getAdminCustomer(customerId);
  return customerDisplayName(customer.data ?? {});
}

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

function labelize(value?: string | null) {
  if (!value) return "—";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function fileExtensionFromUrl(url: string) {
  try {
    const path = new URL(url).pathname;
    const match = path.match(/\.([a-zA-Z0-9]+)(?:$|\?)/);
    return match?.[1]?.toLowerCase() || "pdf";
  } catch {
    return "pdf";
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

async function downloadReceiptFile(url: string, filename: string) {
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

function openReceiptFile(url: string) {
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

function ReceiptRow({ index, url }: { index: number; url: string }) {
  const label = `Receipt ${index}`;
  const fileName = fileNameFromUrl(url, `payment-receipt-${index}`);

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
        onClick={() => openReceiptFile(url)}
      >
        <Icon name="eye" size={18} />
      </button>
      <Button
        type="button"
        className="h-9 shrink-0 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
        style={downloadButtonStyle}
        onClick={() => void downloadReceiptFile(url, fileName)}
      >
        Download
      </Button>
    </div>
  );
}

export default function PaymentDetail() {
  const { paymentId = "" } = useParams();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const paymentQuery = useAdminPayment(paymentId);
  const updateStatusMutation = useUpdateAdminPaymentStatus();

  const payment = paymentQuery.data?.data;
  const userId = payment?.userId?.trim() || "";
  const customerNameQuery = useQuery({
    queryKey: [...adminKeys.all, "payment-customer-name", `u:${userId}`] as const,
    queryFn: () => resolveCustomerNameByUserId(userId),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
  const pending = String(payment?.status || "").toUpperCase() === "PENDING";
  const receipts = (payment?.receiptUrls ?? []).filter(Boolean);
  const customerLabel =
    payment?.customerName?.trim() ||
    customerNameQuery.data ||
    payment?.customerEmail?.trim() ||
    null;

  useEffect(() => {
    if (!rejectOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !updateStatusMutation.isPending) {
        setRejectOpen(false);
        setRejectReason("");
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [rejectOpen, updateStatusMutation.isPending]);

  if (paymentQuery.isLoading) {
    return <AdminCustomerDetailSkeleton />;
  }

  if (paymentQuery.isError || !payment) {
    return (
      <div className="flex w-full flex-col gap-8 md:gap-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          <Link
            to="/admin/payments"
            className="font-semibold text-[var(--text-brand)] no-underline hover:underline"
          >
            Payments
          </Link>
          <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)" }} />
          <span className="text-[var(--text-muted)]">Payment</span>
        </nav>
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm text-[var(--text-danger,#b42318)]">
            {paymentQuery.isError
              ? normalizeError(paymentQuery.error)
              : "Payment not found."}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void paymentQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      </div>
    );
  }

  const amountLabel = formatCommitmentNaira(Number(payment.amount) || 0);

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          to="/admin/payments"
          className="font-semibold text-[var(--text-brand)] no-underline hover:underline"
        >
          Payments
        </Link>
        <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)" }} />
        <span className="truncate font-medium text-[var(--text-heading)]">
          {amountLabel}
        </span>
      </nav>

      <AdminPageHeader
        title={amountLabel}
        description={
          customerLabel
            ? `${customerLabel} · ${labelize(String(payment.purpose || "Payment"))}`
            : labelize(String(payment.purpose || "Payment"))
        }
        actions={
          <>
            <AdminStatusPill status={String(payment.status)} />
            {pending ? (
              <>
                <Button
                  type="button"
                  className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
                  disabled={updateStatusMutation.isPending}
                  onClick={() => setApproveOpen(true)}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
                  style={blackButtonStyle}
                  disabled={updateStatusMutation.isPending}
                  onClick={() => {
                    setRejectOpen(true);
                    setRejectReason("");
                  }}
                >
                  Reject
                </Button>
              </>
            ) : null}
          </>
        }
      />

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
        <h2 className="mt-0 mb-6 text-base font-semibold text-[var(--text-heading)]">
          Payment details
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Customer" value={customerLabel || "—"} />
          <Field label="Amount" value={amountLabel} />
          <Field label="Purpose" value={labelize(String(payment.purpose || "—"))} />
          <Field label="Direction" value={labelize(String(payment.direction || "—"))} />
          {payment.payoutType ? (
            <Field label="Payout type" value={labelize(String(payment.payoutType))} />
          ) : null}
          <Field label="Submitted at" value={formatCommitmentDate(payment.createdAt)} />
          {payment.reasonForRejection ? (
            <Field label="Rejection reason" value={payment.reasonForRejection} />
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
        <div className="mb-5">
          <h2 className="m-0 text-base font-semibold text-[var(--text-heading)]">
            Payment receipts
          </h2>
          <p className="mt-2 mb-0 text-sm text-[var(--text-muted)]">
            View or download proof of payment submitted with this transfer.
          </p>
        </div>

        {receipts.length === 0 ? (
          <p className="m-0 text-sm text-[var(--text-muted)]">
            No receipts uploaded for this payment.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {receipts.map((url, index) => (
              <ReceiptRow
                key={`${payment.id}-receipt-${index}`}
                index={index + 1}
                url={url}
              />
            ))}
          </div>
        )}
      </section>

      <AdminConfirmModal
        open={approveOpen}
        title="Approve payment?"
        description={`Approve this ${amountLabel} payment. This marks the payment as approved.`}
        confirmLabel="Approve payment"
        loading={updateStatusMutation.isPending}
        onClose={() => {
          if (!updateStatusMutation.isPending) setApproveOpen(false);
        }}
        onConfirm={() => {
          updateStatusMutation.mutate(
            {
              userPaymentId: payment.id,
              status: "APPROVED",
            },
            {
              onSuccess: () => setApproveOpen(false),
            },
          );
        }}
      />

      {rejectOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(26,26,26,0.52)] p-4 backdrop-blur-[2px] sm:items-center"
          role="presentation"
          onClick={() => {
            if (!updateStatusMutation.isPending) {
              setRejectOpen(false);
              setRejectReason("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-reject-title"
            className="w-full max-w-[440px] overflow-hidden rounded-[14px] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[0_24px_64px_rgba(26,26,26,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative border-b border-[var(--border-subtle)] px-6 pt-6 pb-5">
              <button
                type="button"
                aria-label="Close"
                disabled={updateStatusMutation.isPending}
                onClick={() => {
                  setRejectOpen(false);
                  setRejectReason("");
                }}
                className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-md border border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--neutral-50)] disabled:opacity-50"
              >
                <Icon name="x" size={16} />
              </button>
              <h2
                id="payment-reject-title"
                className="m-0 pr-10 text-lg font-bold tracking-[-0.02em] text-[var(--text-heading)]"
              >
                Reject payment?
              </h2>
              <p className="mt-2 mb-0 text-sm leading-relaxed text-[var(--text-muted)]">
                Reject this {amountLabel} payment. A rejection reason is required.
              </p>
            </div>

            <div className="px-6 pt-5">
              <FormField
                label="Rejection reason"
                htmlFor="payment-reject-reason"
                required
              >
                <Textarea
                  id="payment-reject-reason"
                  rows={4}
                  value={rejectReason}
                  onChange={(e: { target: { value: string } }) =>
                    setRejectReason(e.target.value)
                  }
                  placeholder="Explain why this payment was rejected"
                  disabled={updateStatusMutation.isPending}
                />
              </FormField>
            </div>

            <div className="flex flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-md px-4 text-sm font-semibold shadow-none"
                disabled={updateStatusMutation.isPending}
                onClick={() => {
                  setRejectOpen(false);
                  setRejectReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
                style={{
                  background: "var(--danger-600, #b42318)",
                  border: "1px solid var(--danger-600, #b42318)",
                  color: "#ffffff",
                  boxShadow: "none",
                }}
                loading={updateStatusMutation.isPending}
                onClick={() => {
                  const reason = rejectReason.trim();
                  if (!reason) {
                    toast.error("Enter a rejection reason.");
                    return;
                  }
                  updateStatusMutation.mutate(
                    {
                      userPaymentId: payment.id,
                      status: "REJECTED",
                      reason,
                    },
                    {
                      onSuccess: () => {
                        setRejectOpen(false);
                        setRejectReason("");
                      },
                    },
                  );
                }}
              >
                Reject payment
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
