import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, Copy, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import {
  useCommitmentDurations,
  useCommitmentRate,
  useCreateCommitment,
} from "@/api/commitments/hooks";
import { useSubmitManualPayment } from "@/api/user-payments/hooks";
import { useUploadPublicFile } from "@/api/utilities/hooks";
import { Button } from "@/components/ui/button";
import { CreateCommitmentSkeleton } from "@/components/ui/page-skeleton";
import { FileUpload } from "@/design-system/components/forms/FileUpload.jsx";
import { ECHARIS_BANK_ACCOUNT, echarisBankPaymentFields } from "@/lib/echaris-bank";
import { USER_AGREEMENT } from "@/lib/user-agreement";
import { cn } from "@/lib/utils";
import { normalizeError } from "@/utils/normalizeError";

const BANK_ACCOUNT = ECHARIS_BANK_ACCOUNT;

const STEPS = ["Commitment details", "Review", "Agreement", "Payment"] as const;

/** Only the 3-month term is offered for now. */
const ALLOWED_DURATION_MONTHS = 3;

const FALLBACK_DURATIONS = [{ id: "3", durationMonths: 3, label: "3-month term" }];

const detailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a commitment name.")
    .max(80, "Keep the name under 80 characters."),
  capital: z
    .number({ invalid_type_error: "Enter an amount." })
    .min(50_000, "The minimum is ₦50,000."),
  durationMonths: z
    .number()
    .int()
    .refine((v) => v === ALLOWED_DURATION_MONTHS, {
      message: "Only the 3-month term is available right now.",
    }),
});

type DetailsFormValues = z.infer<typeof detailsSchema>;

function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Digits-only → display string with grouping commas (e.g. 50000 → "50,000"). */
function formatAmountWithCommas(digits: string) {
  const normalized = digits.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!normalized) return "";
  return Number(normalized).toLocaleString("en-NG");
}

function parseAmountDigits(value: string) {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "") || "0";
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="grid grid-cols-4 gap-3 md:gap-4">
      {STEPS.map((label, index) => {
        const n = index + 1;
        const done = step > n;
        const active = step === n;
        return (
          <div key={label} className="flex flex-col gap-2">
            <div
              className={cn(
                "h-1 rounded-full",
                done || active ? "bg-[var(--brand-primary)]" : "bg-[var(--neutral-200)]",
              )}
            />
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  done || active
                    ? "bg-[var(--brand-primary)] text-white"
                    : "bg-[var(--neutral-200)] text-[var(--text-muted)]",
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : n}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-semibold sm:inline md:text-sm",
                  active
                    ? "text-[var(--text-heading)]"
                    : done
                      ? "text-[var(--text-heading)]"
                      : "text-[var(--text-muted)]",
                )}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CreateCommitment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [accountCopied, setAccountCopied] = useState(false);
  const accountCopiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [createdCommitmentId, setCreatedCommitmentId] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  const durationsQuery = useCommitmentDurations();
  const rateQuery = useCommitmentRate();
  const createCommitment = useCreateCommitment();
  const uploadFile = useUploadPublicFile();
  const submitManualPayment = useSubmitManualPayment();

  const form = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      name: "",
      capital: 0,
      durationMonths: ALLOWED_DURATION_MONTHS,
    },
  });

  const durationOptions = useMemo(() => {
    const api = durationsQuery.data?.data;
    if (api?.length) {
      const threeMonth = [...api]
        .filter((d) => d.active !== false && d.durationMonths === ALLOWED_DURATION_MONTHS)
        .map((d) => ({
          id: d.id,
          durationMonths: d.durationMonths,
          label: "3-month term",
        }));
      if (threeMonth.length) return threeMonth;
    }
    return FALLBACK_DURATIONS;
  }, [durationsQuery.data]);

  useEffect(() => {
    form.setValue("durationMonths", ALLOWED_DURATION_MONTHS);
  }, [form]);

  useEffect(() => {
    return () => {
      if (accountCopiedTimeoutRef.current) {
        clearTimeout(accountCopiedTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!receiptDialogOpen) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [receiptDialogOpen]);

  const values = form.watch();
  const monthlyRate = rateQuery.data?.data?.percentage ?? 10;
  const monthlyReturns = Math.round((Number(values.capital) || 0) * (monthlyRate / 100));
  const expectedCompletion = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + ALLOWED_DURATION_MONTHS);
    return date;
  }, []);

  const selectedDuration = durationOptions[0];
  const isBusy =
    createCommitment.isPending || uploadFile.isPending || submitManualPayment.isPending;
  const pageBootstrapping =
    (durationsQuery.isLoading || rateQuery.isLoading) && step === 1;

  const clearAccountCopied = () => {
    if (accountCopiedTimeoutRef.current) {
      clearTimeout(accountCopiedTimeoutRef.current);
      accountCopiedTimeoutRef.current = null;
    }
    setAccountCopied(false);
  };

  const resetPaymentState = () => {
    setAccountDialogOpen(false);
    setReceiptDialogOpen(false);
    clearAccountCopied();
    setCreatedCommitmentId(null);
    setReceiptFile(null);
    setReceiptError(null);
  };

  const openAccountDialog = () => {
    if (createdCommitmentId) {
      setReceiptError(null);
      setReceiptDialogOpen(true);
      return;
    }
    clearAccountCopied();
    setAccountDialogOpen(true);
  };

  const closeAccountDialog = () => {
    if (isBusy) return;
    setAccountDialogOpen(false);
    clearAccountCopied();
  };

  const closeReceiptDialog = () => {
    if (isBusy) return;
    setReceiptDialogOpen(false);
    toast.message(
      "Payment not confirmed yet. Upload your receipt and confirm so admin can verify your transfer.",
    );
  };

  const onContinueDetails = form.handleSubmit(() => {
    resetPaymentState();
    setStep(2);
  });

  const onAcceptAndContinue = () => {
    if (!agreed || isBusy) return;
    /* Commitment is created only after "I've made payment". */
    setStep(4);
  };

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(BANK_ACCOUNT.number);
      setAccountCopied(true);
      if (accountCopiedTimeoutRef.current) {
        clearTimeout(accountCopiedTimeoutRef.current);
      }
      accountCopiedTimeoutRef.current = setTimeout(() => {
        setAccountCopied(false);
        accountCopiedTimeoutRef.current = null;
      }, 2000);
    } catch {
      clearAccountCopied();
      toast.error("Could not copy account number");
    }
  };

  const onMadePayment = async () => {
    if (isBusy) return;
    try {
      let commitmentId = createdCommitmentId;
      if (!commitmentId) {
        const res = await createCommitment.mutateAsync({
          name: values.name.trim(),
          capital: Number(values.capital),
          durationMonths: ALLOWED_DURATION_MONTHS,
          acceptedAgreement: true,
        });
        commitmentId = res.data?.id ?? null;
        if (!commitmentId) {
          throw new Error(res.message || "Could not create commitment.");
        }
        setCreatedCommitmentId(commitmentId);
      }
      setAccountDialogOpen(false);
      setReceiptFile(null);
      setReceiptError(null);
      setReceiptDialogOpen(true);
    } catch (error) {
      if (!createCommitment.isError) {
        toast.error(normalizeError(error));
      }
    }
  };

  const onConfirmPayment = async () => {
    if (isBusy) return;
    if (!receiptFile) {
      setReceiptError("Upload your payment receipt to continue.");
      return;
    }
    if (!createdCommitmentId) {
      toast.error(
        "Something went wrong creating your commitment. Please refresh and try again.",
      );
      return;
    }

    try {
      setReceiptError(null);
      const isPdf = receiptFile.type === "application/pdf";
      const upload = await uploadFile.mutateAsync({
        file: receiptFile,
        category: isPdf ? "DOCUMENT" : "IMAGE",
        usageType: "DOCUMENT",
      });
      const fileUrl = upload.data?.fileUrl;
      if (!fileUrl) {
        throw new Error(upload.message || "Could not upload receipt.");
      }

      const payment = await submitManualPayment.mutateAsync({
        purpose: "COMMITMENT",
        targetId: createdCommitmentId,
        amount: Number(values.capital),
        receiptUrls: [fileUrl],
        ...echarisBankPaymentFields(),
      });

      toast.success(
        payment.message || "Payment receipt submitted. We’ll confirm once it’s reviewed.",
      );
      navigate("/dashboard/commitments");
    } catch (error) {
      if (!uploadFile.isError && !submitManualPayment.isError) {
        toast.error(normalizeError(error));
      }
    }
  };

  const goBackToDetails = () => {
    resetPaymentState();
    setStep(1);
  };

  if (pageBootstrapping) {
    return <CreateCommitmentSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-10 pb-12">
      <header className="flex flex-col gap-8">
        <div>
          <Link
            to="/dashboard/commitments"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] no-underline hover:text-[var(--text-heading)]"
          >
            <ArrowLeft className="size-4" />
            Back to commitments
          </Link>
          <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[32px]">
            Create new capital commitment
          </h1>
          <p className="mt-3 mb-0 max-w-[560px] text-sm leading-relaxed text-[var(--text-muted)] md:text-[15px]">
            Set up a growth program in four steps. Nothing is charged until you complete
            payment.
          </p>
        </div>
        <Stepper step={step} />
      </header>

      {step === 1 ? (
        <form
          onSubmit={onContinueDetails}
          className="flex flex-col gap-0 border-t border-[var(--border-subtle)]"
        >
          <section className="grid gap-5 border-b border-[var(--border-subtle)] py-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] md:gap-12">
            <div>
              <h2 className="m-0 text-base font-bold text-[var(--text-heading)]">
                <span className="text-[var(--text-muted)]">01</span> Name this commitment
              </h2>
              <p className="mt-3 mb-0 text-sm leading-relaxed text-[var(--text-muted)]">
                A short label so you can identify this growth program on your dashboard.
              </p>
            </div>
            <div>
              <label
                htmlFor="commitment-name"
                className="mb-2.5 block text-sm font-medium text-[var(--text-heading)]"
              >
                Commitment name or purpose
              </label>
              <input
                id="commitment-name"
                placeholder="e.g. Personal growth fund"
                className="h-11 w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-card)] px-3 text-sm outline-none focus:border-[var(--brand-primary)]"
                {...form.register("name")}
              />
              {form.formState.errors.name ? (
                <p className="mt-1.5 mb-0 text-sm text-[var(--text-danger,#b42318)]">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-5 border-b border-[var(--border-subtle)] py-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] md:gap-12">
            <div>
              <h2 className="m-0 text-base font-bold text-[var(--text-heading)]">
                <span className="text-[var(--text-muted)]">02</span> Capital commitment
                amount
              </h2>
              <p className="mt-3 mb-0 text-sm leading-relaxed text-[var(--text-muted)]">
                The minimum is ₦50,000. There is no maximum.
              </p>
            </div>
            <div>
              <label
                htmlFor="commitment-amount"
                className="mb-2.5 block text-sm font-medium text-[var(--text-heading)]"
              >
                Amount
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-[var(--text-muted)]">
                  ₦
                </span>
                <input
                  id="commitment-amount"
                  inputMode="numeric"
                  placeholder="0"
                  value={amountInput}
                  onChange={(e) => {
                    const digits = parseAmountDigits(e.target.value);
                    setAmountInput(digits === "0" ? "" : formatAmountWithCommas(digits));
                    form.setValue("capital", Number(digits), {
                      shouldValidate: true,
                    });
                  }}
                  className="h-11 w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-card)] pr-3 pl-8 text-sm outline-none focus:border-[var(--brand-primary)]"
                />
              </div>
              <p className="mt-2 mb-0 text-xs text-[var(--text-muted)]">
                Minimum ₦50,000. There is no upper limit.
              </p>
              {form.formState.errors.capital ? (
                <p className="mt-1.5 mb-0 text-sm text-[var(--text-danger,#b42318)]">
                  {form.formState.errors.capital.message}
                </p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-5 border-b border-[var(--border-subtle)] py-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] md:gap-12">
            <div>
              <h2 className="m-0 text-base font-bold text-[var(--text-heading)]">
                <span className="text-[var(--text-muted)]">03</span> Duration
              </h2>
              <p className="mt-3 mb-0 text-sm leading-relaxed text-[var(--text-muted)]">
                Capital is held for the full term and released on the maturity date.
              </p>
            </div>
            <div>
              <p className="mb-2.5 text-sm font-medium text-[var(--text-heading)]">
                Program term
              </p>
              <div className="grid max-w-sm gap-3">
                {durationOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed="true"
                    onClick={() =>
                      form.setValue("durationMonths", ALLOWED_DURATION_MONTHS, {
                        shouldValidate: true,
                      })
                    }
                    className="flex items-start gap-2.5 rounded-md border border-[var(--brand-primary)] bg-[var(--surface-brand-subtle)] px-3 py-3 text-left"
                  >
                    <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-[var(--brand-primary)] bg-[var(--brand-primary)]">
                      <span className="size-1.5 rounded-full bg-white" />
                    </span>
                    <span className="text-sm font-semibold text-[var(--text-heading)]">
                      {option.durationMonths} months
                      <span className="mt-0.5 block text-xs font-medium text-[var(--text-muted)]">
                        {option.label}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-2 mb-0 text-xs text-[var(--text-muted)]">
                Only the 3-month growth program is available right now.
              </p>
              {form.formState.errors.durationMonths ? (
                <p className="mt-1.5 mb-0 text-sm text-[var(--text-danger,#b42318)]">
                  {form.formState.errors.durationMonths.message}
                </p>
              ) : null}
            </div>
          </section>

          <div className="flex justify-end pt-8">
            <Button
              type="submit"
              className="h-11 rounded-md border-0 px-5 text-sm font-semibold shadow-none ring-0"
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </form>
      ) : null}

      {step === 2 ? (
        <section className="flex flex-col gap-8">
          <div>
            <h2 className="m-0 text-xl font-bold text-[var(--text-heading)]">
              Review commitment
            </h2>
            <p className="mt-3 mb-0 max-w-[520px] text-sm leading-relaxed text-[var(--text-muted)]">
              Check these details before accepting the agreement. Nothing is charged yet.
            </p>
          </div>
          <dl className="m-0 divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            {[
              ["Commitment name", values.name || "—"],
              ["Capital commitment", formatNaira(values.capital || 0)],
              ["Duration", `${ALLOWED_DURATION_MONTHS} months`],
              ["Monthly performance returns", formatNaira(monthlyReturns)],
              ["Expected completion", formatDate(expectedCompletion)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-4">
                <dt className="m-0 text-sm text-[var(--text-muted)]">{label}</dt>
                <dd className="m-0 text-sm font-bold text-[var(--text-heading)]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={goBackToDetails}
              className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-sm font-semibold text-[var(--text-heading)]"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <Button
              type="button"
              className="h-11 rounded-md border-0 px-5 text-sm font-semibold shadow-none ring-0"
              onClick={() => setStep(3)}
            >
              Continue to agreement
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="flex flex-col gap-8">
          <div>
            <h2 className="m-0 text-xl font-bold text-[var(--text-heading)]">
              User Agreement
            </h2>
            <p className="mt-3 mb-0 max-w-[560px] text-sm leading-relaxed text-[var(--text-muted)]">
              Read the Echaris Trading Limited Terms and Conditions of Service before
              accepting.
            </p>
          </div>

          <div className="max-h-[420px] overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-sm leading-relaxed whitespace-pre-wrap text-[var(--text-body)] md:p-6">
            {USER_AGREEMENT}
          </div>

          <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--text-heading)]">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 size-4 accent-[var(--brand-primary)]"
            />
            <span>
              I have read and agree to the Echaris Trading Limited User Agreement: Terms
              and Conditions of Service.
            </span>
          </label>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-sm font-semibold text-[var(--text-heading)] disabled:opacity-50"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <Button
              type="button"
              disabled={!agreed || isBusy}
              className="h-11 rounded-md border-0 px-5 text-sm font-semibold shadow-none ring-0"
              onClick={onAcceptAndContinue}
            >
              Accept and continue
            </Button>
          </div>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="flex flex-col gap-8">
          <div>
            <h2 className="m-0 text-xl font-bold text-[var(--text-heading)]">
              Manual bank transfer
            </h2>
            <p className="mt-3 mb-0 max-w-[560px] text-sm leading-relaxed text-[var(--text-muted)]">
              Transfer the exact amount to the Echaris account, then confirm with your
              receipt so admin is notified of your payment.
            </p>
          </div>

          <div className="rounded-lg bg-[var(--surface-brand-subtle)] p-6 md:p-7">
            <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
              Amount payable
            </p>
            <p className="mt-4 mb-0 text-[28px] font-extrabold tracking-[-0.03em] text-[var(--text-heading)]">
              {formatNaira(values.capital || 0)}
            </p>
            <p className="mt-3 mb-0 text-sm text-[var(--text-muted)]">
              {values.name || "Commitment"} ·{" "}
              {selectedDuration?.durationMonths ?? ALLOWED_DURATION_MONTHS} months
            </p>
          </div>

          {createdCommitmentId && !receiptDialogOpen ? (
            <div className="rounded-lg border border-[var(--border-brand)] bg-[var(--surface-brand-subtle)] px-4 py-3 text-sm leading-relaxed text-[var(--text-brand)]">
              Your transfer is not confirmed yet. Upload your payment receipt and tap
              Confirm my payment so admin can verify it.
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={isBusy || receiptDialogOpen}
              className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-sm font-semibold text-[var(--text-heading)] disabled:opacity-50"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <Button
              type="button"
              disabled={isBusy}
              className="h-11 rounded-md border-0 px-5 text-sm font-semibold shadow-none ring-0"
              onClick={openAccountDialog}
            >
              {createdCommitmentId ? "Confirm payment" : "Make payment"}
            </Button>
          </div>
        </section>
      ) : null}

      {accountDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(26,26,26,0.52)] p-4 backdrop-blur-[2px] sm:items-center"
          role="presentation"
          onClick={closeAccountDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="manual-payment-title"
            className="w-full max-w-[420px] overflow-hidden rounded-[14px] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[0_24px_64px_rgba(26,26,26,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-[linear-gradient(145deg,var(--brand-primary)_0%,var(--brand-secondary)_100%)] px-6 pt-6 pb-7 text-white">
              <button
                type="button"
                aria-label="Close"
                disabled={isBusy}
                onClick={(e) => {
                  e.stopPropagation();
                  closeAccountDialog();
                }}
                className="absolute top-4 right-4 z-10 inline-flex size-9 items-center justify-center rounded-md border-0 bg-white/15 text-white hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="pointer-events-none relative z-10 size-4" />
              </button>

              <p className="m-0 text-[11px] font-semibold tracking-[0.12em] uppercase opacity-90">
                Amount to transfer
              </p>
              <p
                id="manual-payment-title"
                className="mt-2 mb-0 text-[32px] leading-none font-extrabold tracking-[-0.03em]"
              >
                {formatNaira(values.capital || 0)}
              </p>
              <p className="mt-3 mb-0 text-sm leading-relaxed text-white/85">
                Transfer this exact amount to the account below, then confirm once it has
                gone through.
              </p>
            </div>

            <div className="px-6 pt-5 pb-6">
              <div className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--neutral-25)] p-4">
                <div>
                  <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
                    Bank name
                  </p>
                  <p className="mt-2 mb-0 text-sm font-bold text-[var(--text-heading)]">
                    {BANK_ACCOUNT.bank}
                  </p>
                </div>

                <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
                  <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
                    Account number
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="font-mono text-[22px] leading-none font-extrabold tracking-[0.04em] text-[var(--text-heading)]">
                      {BANK_ACCOUNT.number}
                    </span>
                    <button
                      type="button"
                      onClick={() => void copyAccountNumber()}
                      className={cn(
                        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold",
                        accountCopied
                          ? "border-[var(--success-100)] bg-[var(--success-50)] text-[var(--text-success)]"
                          : "border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-heading)] hover:bg-[var(--neutral-100)]",
                      )}
                    >
                      {accountCopied ? (
                        <>
                          <Check
                            className="size-3.5 text-[var(--text-success)]"
                            strokeWidth={3}
                          />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5 text-[var(--brand-primary)]" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
                  <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
                    Account name
                  </p>
                  <p className="mt-2 mb-0 text-sm font-bold text-[var(--text-heading)]">
                    {BANK_ACCOUNT.name}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                disabled={isBusy}
                className="mt-5 h-12 w-full rounded-md border-0 text-sm font-semibold shadow-none ring-0"
                onClick={() => void onMadePayment()}
              >
                {createCommitment.isPending
                  ? "Creating commitment…"
                  : "I've made payment"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {receiptDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(26,26,26,0.52)] p-4 backdrop-blur-[2px] sm:items-center"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-payment-title"
            className="w-full max-w-[440px] overflow-hidden rounded-[14px] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[0_24px_64px_rgba(26,26,26,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative border-b border-[var(--border-subtle)] px-6 pt-6 pb-5">
              <button
                type="button"
                aria-label="Close"
                disabled={isBusy}
                onClick={(e) => {
                  e.stopPropagation();
                  closeReceiptDialog();
                }}
                className="absolute top-4 right-4 z-10 inline-flex size-9 items-center justify-center rounded-md border-0 bg-[var(--neutral-100)] text-[var(--text-heading)] hover:bg-[var(--neutral-200)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="pointer-events-none relative z-10 size-4" />
              </button>

              <h2
                id="confirm-payment-title"
                className="m-0 pr-10 text-xl font-bold text-[var(--text-heading)]"
              >
                Confirm my payment
              </h2>
              <p className="mt-2 mb-0 text-sm leading-relaxed text-[var(--text-muted)]">
                Upload your transfer receipt to notify admin. Without this step, your
                payment will not be reviewed.
              </p>
            </div>

            <div className="flex flex-col gap-5 px-6 pt-5 pb-6">
              <div className="rounded-lg bg-[var(--surface-brand-subtle)] px-4 py-3">
                <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
                  Amount paid
                </p>
                <p className="mt-2 mb-0 text-2xl font-extrabold tracking-[-0.03em] text-[var(--text-heading)]">
                  {formatNaira(values.capital || 0)}
                </p>
              </div>

              <div>
                <p className="mb-2.5 text-sm font-medium text-[var(--text-heading)]">
                  Payment receipt
                </p>
                <FileUpload
                  label="Upload payment receipt"
                  hint="Supported formats: PDF, JPG, PNG · Maximum size: 5MB"
                  accept=".pdf,.jpg,.jpeg,.png,image/*"
                  fileName={receiptFile?.name}
                  invalid={!!receiptError}
                  onFileChange={(file: File | undefined) => {
                    const next = file ?? null;
                    setReceiptFile(next);
                    setReceiptError(
                      next ? null : "Upload your payment receipt to continue.",
                    );
                  }}
                />
                {receiptError ? (
                  <p className="mt-1.5 mb-0 text-sm text-[var(--text-danger,#b42318)]">
                    {receiptError}
                  </p>
                ) : null}
              </div>

              <p className="m-0 text-sm leading-relaxed text-[var(--text-brand)]">
                Admin is only notified after you confirm. Do not close this until your
                receipt is submitted.
              </p>

              <Button
                type="button"
                disabled={isBusy || !receiptFile}
                className="h-12 w-full rounded-md border-0 text-sm font-semibold shadow-none ring-0"
                onClick={() => void onConfirmPayment()}
              >
                {uploadFile.isPending
                  ? "Uploading receipt…"
                  : submitManualPayment.isPending
                    ? "Confirming payment…"
                    : "Confirm my payment"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
