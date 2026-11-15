import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  useAdminCustomerPayoutAccount,
  useRecordAdminCustomerPayout,
} from "@/api/admin/hooks";
import { useUploadPublicFile } from "@/api/utilities/hooks";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { FileUpload } from "@/design-system/components/forms/FileUpload.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { Select } from "@/design-system/components/forms/Select.jsx";
import { formatCommitmentNaira } from "@/lib/commitments";
import { normalizeError } from "@/utils/normalizeError";
import {
  recordAdminCustomerPayoutFormSchema,
  type RecordAdminCustomerPayoutFormValues,
} from "@/validations/admin/dto";

const PAYOUT_TYPE_OPTIONS = [
  { value: "COMMITMENT_CAPITAL", label: "Commitment capital" },
  { value: "COMMITMENT_RETURN", label: "Commitment return" },
  { value: "MARKETPLACE_CAPITAL", label: "Marketplace capital" },
];

const MAX_RECEIPTS = 10;

function formatAmountInput(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return "";
  const hasDecimal = cleaned.includes(".");
  const [intRaw = "", ...rest] = cleaned.split(".");
  const intPart = intRaw.replace(/^0+(?=\d)/, "") || (hasDecimal ? "0" : "");
  const decPart = rest.join("").replace(/\D/g, "").slice(0, 2);
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (hasDecimal) return `${intFormatted}.${decPart}`;
  return intFormatted;
}

function parseAmountInput(formatted: string) {
  const normalized = formatted.replace(/,/g, "").trim();
  if (!normalized || normalized === ".") return NaN;
  return Number(normalized);
}

function toDatetimeLocalValue(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoFromDatetimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

export default function RecordPayout() {
  const navigate = useNavigate();
  const [amountInput, setAmountInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [lastUploadName, setLastUploadName] = useState<string | null>(null);

  const recordMutation = useRecordAdminCustomerPayout();
  const uploadFile = useUploadPublicFile();

  const form = useForm<RecordAdminCustomerPayoutFormValues>({
    resolver: zodResolver(recordAdminCustomerPayoutFormSchema),
    defaultValues: {
      customerUserId: "",
      payoutType: "COMMITMENT_CAPITAL",
      targetId: "",
      amount: undefined as unknown as number,
      transferReference: "",
      paidAt: toDatetimeLocalValue(),
      receiptUrls: [],
    },
  });

  const customerUserId = form.watch("customerUserId");
  const receiptUrls = form.watch("receiptUrls");
  const payoutAccountQuery = useAdminCustomerPayoutAccount(
    customerUserId.trim(),
    customerUserId.trim().length > 0,
  );
  const payoutAccount = payoutAccountQuery.data?.data;
  const busy = recordMutation.isPending || uploading || uploadFile.isPending;

  useEffect(() => {
    const amountDue = payoutAccount?.details?.amount;
    if (amountDue === undefined || amountDue === null) return;
    if (form.getValues("amount")) return;
    const value = Number(amountDue);
    if (!Number.isFinite(value)) return;
    form.setValue("amount", value, { shouldValidate: true });
    setAmountInput(formatAmountInput(String(value)));
  }, [form, payoutAccount]);

  const onUploadReceipt = async (file?: File | null) => {
    if (!file) return;
    if (receiptUrls.length >= MAX_RECEIPTS) {
      toast.error(`You can add up to ${MAX_RECEIPTS} receipts.`);
      return;
    }

    setUploading(true);
    setLastUploadName(file.name);
    try {
      const isPdf = file.type === "application/pdf";
      const res = await uploadFile.mutateAsync({
        file,
        category: isPdf ? "DOCUMENT" : "IMAGE",
        usageType: "DOCUMENT",
      });
      const url = res.data?.fileUrl?.trim();
      if (res.success === false || !url) {
        throw new Error(res.message || "Could not upload receipt.");
      }
      form.setValue("receiptUrls", [...receiptUrls, url], {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success("Receipt uploaded");
    } catch (error) {
      toast.error(normalizeError(error));
    } finally {
      setUploading(false);
    }
  };

  const removeReceipt = (index: number) => {
    form.setValue(
      "receiptUrls",
      receiptUrls.filter((_, i) => i !== index),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!payoutAccount || payoutAccount.version === undefined) {
      toast.error("Load a valid payout account for this customer first.");
      return;
    }

    const paidAtIso = toIsoFromDatetimeLocal(values.paidAt);
    if (!paidAtIso) {
      toast.error("Enter a valid paid-at date and time.");
      return;
    }
    if (new Date(paidAtIso).getTime() > Date.now()) {
      toast.error("Paid at must be at or before now.");
      return;
    }

    try {
      await recordMutation.mutateAsync({
        customerUserId: values.customerUserId.trim(),
        payoutAccountVersion: payoutAccount.version,
        payoutType: values.payoutType,
        targetId: values.targetId.trim(),
        amount: values.amount,
        receiptUrls: values.receiptUrls,
        transferReference: values.transferReference.trim(),
        paidAt: paidAtIso,
      });
      navigate("/admin/payouts", { replace: true });
    } catch {
      /* toast in hook */
    }
  });

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          to="/admin/payouts"
          className="font-semibold text-[var(--text-brand)] no-underline hover:underline"
        >
          Payouts
        </Link>
        <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)" }} />
        <span className="font-medium text-[var(--text-heading)]">Record payout</span>
      </nav>

      <AdminPageHeader
        title="Record payout"
        description="Record a transfer already made to the customer’s payout account."
      />

      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-3xl flex-col gap-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 md:p-8"
      >
        <FormField
          label="Customer user ID"
          htmlFor="payout-customer-user-id"
          required
          error={form.formState.errors.customerUserId?.message}
          hint={
            payoutAccountQuery.isFetching
              ? "Loading payout account…"
              : payoutAccount
                ? `${payoutAccount.details.accountName} · ${payoutAccount.details.bankName} · ${payoutAccount.details.accountNumber} · version ${payoutAccount.version}`
                : payoutAccountQuery.isError
                  ? normalizeError(payoutAccountQuery.error)
                  : "Enter the customer’s user ID to load their payout account version."
          }
        >
          <Input
            id="payout-customer-user-id"
            invalid={Boolean(form.formState.errors.customerUserId)}
            {...form.register("customerUserId")}
          />
        </FormField>

        {payoutAccount?.details?.amount !== undefined &&
        payoutAccount.details.amount !== null ? (
          <p className="m-0 text-sm text-[var(--text-muted)]">
            Amount due on payout account:{" "}
            <span className="font-semibold text-[var(--text-heading)]">
              {formatCommitmentNaira(Number(payoutAccount.details.amount) || 0)}
            </span>
          </p>
        ) : null}

        <FormField
          label="Payout type"
          htmlFor="payout-type"
          required
          error={form.formState.errors.payoutType?.message}
        >
          <Controller
            control={form.control}
            name="payoutType"
            render={({ field }) => (
              <Select
                id="payout-type"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                options={PAYOUT_TYPE_OPTIONS}
                invalid={Boolean(form.formState.errors.payoutType)}
              />
            )}
          />
        </FormField>

        <FormField
          label="Target ID"
          htmlFor="payout-target-id"
          required
          hint="Commitment ID, return ID, or financing ID depending on payout type."
          error={form.formState.errors.targetId?.message}
        >
          <Input
            id="payout-target-id"
            invalid={Boolean(form.formState.errors.targetId)}
            {...form.register("targetId")}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            label="Amount (₦)"
            htmlFor="payout-amount"
            required
            error={form.formState.errors.amount?.message}
          >
            <Controller
              control={form.control}
              name="amount"
              render={({ field }) => (
                <Input
                  id="payout-amount"
                  inputMode="decimal"
                  prefix="₦"
                  placeholder="0.00"
                  invalid={Boolean(form.formState.errors.amount)}
                  value={amountInput}
                  onChange={(e) => {
                    const next = formatAmountInput(e.target.value);
                    setAmountInput(next);
                    const parsed = parseAmountInput(next);
                    field.onChange(Number.isFinite(parsed) ? parsed : undefined);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />
          </FormField>

          <FormField
            label="Paid at"
            htmlFor="payout-paid-at"
            required
            error={form.formState.errors.paidAt?.message}
          >
            <Input
              id="payout-paid-at"
              type="datetime-local"
              invalid={Boolean(form.formState.errors.paidAt)}
              {...form.register("paidAt")}
            />
          </FormField>
        </div>

        <FormField
          label="Transfer reference"
          htmlFor="payout-transfer-ref"
          required
          error={form.formState.errors.transferReference?.message}
        >
          <Input
            id="payout-transfer-ref"
            invalid={Boolean(form.formState.errors.transferReference)}
            {...form.register("transferReference")}
          />
        </FormField>

        <FormField
          label="Receipts"
          htmlFor="payout-receipts"
          required
          hint="Upload 1–10 receipt files (PDF, PNG, or JPG)."
          error={form.formState.errors.receiptUrls?.message}
        >
          <div className="flex flex-col gap-3">
            {receiptUrls.length > 0 ? (
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {receiptUrls.map((url, index) => (
                  <li
                    key={`${url}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-page)] px-3 py-2"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 truncate text-sm font-medium text-[var(--text-brand)]"
                    >
                      Receipt {index + 1}
                    </a>
                    <button
                      type="button"
                      aria-label={`Remove receipt ${index + 1}`}
                      className="inline-flex size-8 items-center justify-center rounded-md border-0 bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-muted,#EFECE8)]"
                      onClick={() => removeReceipt(index)}
                      disabled={busy}
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {receiptUrls.length < MAX_RECEIPTS ? (
              <FileUpload
                id="payout-receipts"
                accept="image/*,application/pdf"
                label="Upload receipt"
                hint="PDF, PNG or JPG"
                fileName={uploading ? (lastUploadName ?? undefined) : undefined}
                onFileChange={(file) => {
                  if (file) void onUploadReceipt(file);
                }}
                disabled={busy}
              />
            ) : null}
          </div>
        </FormField>

        <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-md px-4 text-sm font-semibold shadow-none"
            disabled={busy}
            onClick={() => navigate("/admin/payouts")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
            loading={recordMutation.isPending}
            disabled={busy || !payoutAccount}
          >
            Record payout
          </Button>
        </div>
      </form>
    </div>
  );
}
