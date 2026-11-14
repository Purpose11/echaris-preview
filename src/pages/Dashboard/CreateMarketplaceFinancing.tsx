import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, Copy, Package, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { normalizeAddressList } from "@/api/addresses/addresses";
import { useAddresses } from "@/api/addresses/hooks";
import { useCreateMarketFinancing } from "@/api/marketplace/hooks";
import { useCatalogProduct } from "@/api/products/hooks";
import { useSubmitManualPayment } from "@/api/user-payments/hooks";
import { useUploadPublicFile } from "@/api/utilities/hooks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUpload } from "@/design-system/components/forms/FileUpload.jsx";
import { ECHARIS_BANK_ACCOUNT, echarisBankPaymentFields } from "@/lib/echaris-bank";
import { USER_AGREEMENT } from "@/lib/user-agreement";
import { cn } from "@/lib/utils";
import { normalizeError } from "@/utils/normalizeError";

const BANK_ACCOUNT = ECHARIS_BANK_ACCOUNT;

const STEPS = ["Financing details", "Review", "Agreement", "Payment"] as const;

const detailsSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a financing name.")
      .max(80, "Keep the name under 80 characters."),
    capital: z
      .number({ invalid_type_error: "Enter an amount." })
      .min(50_000, "The minimum is ₦50,000."),
    quantity: z
      .number({ invalid_type_error: "Enter a quantity." })
      .int()
      .min(1, "Quantity must be at least 1."),
    fulfillmentType: z.enum(["PICKUP", "DELIVERY"]),
    pickupLocationId: z.string().optional(),
    deliveryAddress: z.string().optional(),
    phoneNumber: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.fulfillmentType === "PICKUP") {
      if (!values.pickupLocationId?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a pickup location.",
          path: ["pickupLocationId"],
        });
      }
      return;
    }
    if (!values.deliveryAddress?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a delivery address.",
        path: ["deliveryAddress"],
      });
    }
    if (!values.phoneNumber?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a phone number.",
        path: ["phoneNumber"],
      });
    }
  });

type DetailsFormValues = z.infer<typeof detailsSchema>;

function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatAmountWithCommas(digits: string) {
  const normalized = digits.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!normalized) return "";
  return Number(normalized).toLocaleString("en-NG");
}

function parseAmountDigits(value: string) {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "") || "0";
}

function formatPickupLabel(address: {
  city?: string | null;
  state?: string | null;
  addressLine?: string | null;
}) {
  return [address.addressLine, address.city, address.state]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
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
                  active || done
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

function CreateFinancingSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-10 pb-12"
      aria-busy="true"
      aria-label="Loading product financing"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-[min(100%,360px)]" />
        <Skeleton className="h-4 w-[min(100%,480px)]" />
      </div>
      <div className="grid grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-1 w-full rounded-full" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  );
}

export default function CreateMarketplaceFinancing() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [searchParams] = useSearchParams();
  const initialQuantity = Math.max(
    1,
    Math.min(99, Number(searchParams.get("quantity")) || 1),
  );

  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [accountCopied, setAccountCopied] = useState(false);
  const accountCopiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [createdFinancingId, setCreatedFinancingId] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  const productQuery = useCatalogProduct(productId);
  const pickupQuery = useAddresses({ addressType: "PICKUP", page: 1, size: 50 });
  const createFinancing = useCreateMarketFinancing();
  const uploadFile = useUploadPublicFile();
  const submitManualPayment = useSubmitManualPayment();

  const product = productQuery.data?.data;
  const pickupLocations = useMemo(
    () => normalizeAddressList(pickupQuery.data?.data),
    [pickupQuery.data],
  );

  const form = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      name: "",
      capital: 0,
      quantity: initialQuantity,
      fulfillmentType: "DELIVERY",
      pickupLocationId: "",
      deliveryAddress: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    if (!product?.name) return;
    const current = form.getValues("name");
    if (!current.trim()) {
      form.setValue("name", `${product.name} financing`);
    }
  }, [product?.name, form]);

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
  const isBusy =
    createFinancing.isPending || uploadFile.isPending || submitManualPayment.isPending;

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
    setCreatedFinancingId(null);
    setReceiptFile(null);
    setReceiptError(null);
  };

  const openAccountDialog = () => {
    if (createdFinancingId) {
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

  const buildFulfillment = (data: DetailsFormValues) => {
    if (data.fulfillmentType === "PICKUP") {
      return {
        type: "PICKUP" as const,
        pickupLocationId: data.pickupLocationId?.trim(),
      };
    }
    return {
      type: "DELIVERY" as const,
      deliveryAddress: data.deliveryAddress?.trim(),
      phoneNumber: data.phoneNumber?.trim(),
    };
  };

  const onMadePayment = async () => {
    if (isBusy || !productId) return;
    try {
      let financingId = createdFinancingId;
      if (!financingId) {
        const res = await createFinancing.mutateAsync({
          productId,
          quantity: Number(values.quantity),
          name: values.name.trim(),
          capital: Number(values.capital),
          agreementAccepted: true,
          fulfillment: buildFulfillment(values),
        });
        financingId = res.data?.id ?? null;
        if (!financingId) {
          throw new Error(res.message || "Could not create financing.");
        }
        setCreatedFinancingId(financingId);
      }
      setAccountDialogOpen(false);
      setReceiptFile(null);
      setReceiptError(null);
      setReceiptDialogOpen(true);
    } catch (error) {
      if (!createFinancing.isError) {
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
    if (!createdFinancingId) {
      toast.error(
        "Something went wrong creating your financing. Please refresh and try again.",
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
        purpose: "MARKETPLACE_FINANCING",
        targetId: createdFinancingId,
        amount: Number(values.capital),
        receiptUrls: [fileUrl],
        ...echarisBankPaymentFields(),
      });

      toast.success(
        payment.message || "Payment receipt submitted. We’ll confirm once it’s reviewed.",
      );
      navigate(`/dashboard/marketplace/${createdFinancingId}`);
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

  const selectedPickup = pickupLocations.find(
    (loc) => loc.id === values.pickupLocationId,
  );

  if (productQuery.isLoading) {
    return <CreateFinancingSkeleton />;
  }

  if (productQuery.isError || !product) {
    return (
      <div className="flex w-full flex-col gap-6">
        <Link
          to="/dashboard/marketplace/browse"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[var(--text-muted)] no-underline hover:text-[var(--text-heading)]"
        >
          <ArrowLeft className="size-4" />
          Back to products
        </Link>
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm leading-relaxed text-[var(--text-danger,#b42318)]">
            {productQuery.isError
              ? normalizeError(productQuery.error)
              : "Product not found."}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void productQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-10 pb-12">
      <header className="flex flex-col gap-8">
        <div>
          <Link
            to={
              productId
                ? `/dashboard/marketplace/products/${productId}`
                : "/dashboard/marketplace/browse"
            }
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] no-underline hover:text-[var(--text-heading)]"
          >
            <ArrowLeft className="size-4" />
            Back to product
          </Link>
          <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[32px]">
            Finance {product.name}
          </h1>
          <p className="mt-3 mb-0 max-w-[560px] text-sm leading-relaxed text-[var(--text-muted)] md:text-[15px]">
            Commit capital toward this product. Nothing is charged until you complete
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
          <section className="flex items-center gap-4 border-b border-[var(--border-subtle)] py-8">
            {product.imageUrls?.[0] ? (
              <img
                src={product.imageUrls[0]}
                alt=""
                className="size-16 rounded-md object-cover"
              />
            ) : (
              <span className="inline-flex size-16 items-center justify-center rounded-md bg-[var(--neutral-100)] text-[var(--text-muted)]">
                <Package className="size-6" />
              </span>
            )}
            <div>
              <p className="m-0 text-base font-semibold text-[var(--text-heading)]">
                {product.name}
              </p>
              <p className="mt-1 mb-0 text-sm text-[var(--text-muted)]">
                Product value {formatNaira(Number(product.price) || 0)}
              </p>
            </div>
          </section>

          <section className="grid gap-5 border-b border-[var(--border-subtle)] py-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] md:gap-12">
            <div>
              <h2 className="m-0 text-base font-bold text-[var(--text-heading)]">
                <span className="text-[var(--text-muted)]">01</span> Name this financing
              </h2>
              <p className="mt-3 mb-0 text-sm leading-relaxed text-[var(--text-muted)]">
                A short label so you can find this financing on your dashboard.
              </p>
            </div>
            <div>
              <label
                htmlFor="financing-name"
                className="mb-2.5 block text-sm font-medium text-[var(--text-heading)]"
              >
                Financing name
              </label>
              <input
                id="financing-name"
                placeholder="e.g. Laptop financing"
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
              </h2>
              <p className="mt-3 mb-0 text-sm leading-relaxed text-[var(--text-muted)]">
                The minimum is ₦50,000. There is no maximum.
              </p>
            </div>
            <div>
              <label
                htmlFor="financing-amount"
                className="mb-2.5 block text-sm font-medium text-[var(--text-heading)]"
              >
                Amount
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-[var(--text-muted)]">
                  ₦
                </span>
                <input
                  id="financing-amount"
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
                <span className="text-[var(--text-muted)]">03</span> Quantity
              </h2>
              <p className="mt-3 mb-0 text-sm leading-relaxed text-[var(--text-muted)]">
                How many units of this product you want to finance.
              </p>
            </div>
            <div>
              <label
                htmlFor="financing-quantity"
                className="mb-2.5 block text-sm font-medium text-[var(--text-heading)]"
              >
                Quantity
              </label>
              <input
                id="financing-quantity"
                type="number"
                min={1}
                step={1}
                className="h-11 w-full max-w-[160px] rounded-md border border-[var(--border-default)] bg-[var(--surface-card)] px-3 text-sm outline-none focus:border-[var(--brand-primary)]"
                {...form.register("quantity", { valueAsNumber: true })}
              />
              {form.formState.errors.quantity ? (
                <p className="mt-1.5 mb-0 text-sm text-[var(--text-danger,#b42318)]">
                  {form.formState.errors.quantity.message}
                </p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-5 border-b border-[var(--border-subtle)] py-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] md:gap-12">
            <div>
              <h2 className="m-0 text-base font-bold text-[var(--text-heading)]">
                <span className="text-[var(--text-muted)]">04</span> Fulfillment
              </h2>
              <p className="mt-3 mb-0 text-sm leading-relaxed text-[var(--text-muted)]">
                Choose pickup or delivery for when the product is ready.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid max-w-sm gap-3">
                {(["PICKUP", "DELIVERY"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={values.fulfillmentType === type}
                    onClick={() =>
                      form.setValue("fulfillmentType", type, {
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "flex items-start gap-2.5 rounded-md border px-3 py-3 text-left",
                      values.fulfillmentType === type
                        ? "border-[var(--brand-primary)] bg-[var(--surface-brand-subtle)]"
                        : "border-[var(--border-default)] bg-[var(--surface-card)]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border",
                        values.fulfillmentType === type
                          ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]"
                          : "border-[var(--border-default)]",
                      )}
                    >
                      {values.fulfillmentType === type ? (
                        <span className="size-1.5 rounded-full bg-white" />
                      ) : null}
                    </span>
                    <span className="text-sm font-semibold text-[var(--text-heading)]">
                      {type === "PICKUP" ? "Pickup" : "Delivery"}
                    </span>
                  </button>
                ))}
              </div>

              {values.fulfillmentType === "PICKUP" ? (
                <div>
                  <label
                    htmlFor="pickup-location"
                    className="mb-2.5 block text-sm font-medium text-[var(--text-heading)]"
                  >
                    Pickup location
                  </label>
                  {pickupQuery.isLoading ? (
                    <Skeleton className="h-11 w-full" />
                  ) : pickupLocations.length === 0 ? (
                    <p className="m-0 text-sm text-[var(--text-muted)]">
                      No pickup locations are available right now. Choose delivery
                      instead.
                    </p>
                  ) : (
                    <select
                      id="pickup-location"
                      className="h-11 w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-card)] px-3 text-sm outline-none focus:border-[var(--brand-primary)]"
                      {...form.register("pickupLocationId")}
                    >
                      <option value="">Select a location</option>
                      {pickupLocations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {formatPickupLabel(loc) || loc.id}
                        </option>
                      ))}
                    </select>
                  )}
                  {form.formState.errors.pickupLocationId ? (
                    <p className="mt-1.5 mb-0 text-sm text-[var(--text-danger,#b42318)]">
                      {form.formState.errors.pickupLocationId.message}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <label
                      htmlFor="delivery-address"
                      className="mb-2.5 block text-sm font-medium text-[var(--text-heading)]"
                    >
                      Delivery address
                    </label>
                    <textarea
                      id="delivery-address"
                      rows={3}
                      placeholder="Street, city, state"
                      className="w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-primary)]"
                      {...form.register("deliveryAddress")}
                    />
                    {form.formState.errors.deliveryAddress ? (
                      <p className="mt-1.5 mb-0 text-sm text-[var(--text-danger,#b42318)]">
                        {form.formState.errors.deliveryAddress.message}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label
                      htmlFor="delivery-phone"
                      className="mb-2.5 block text-sm font-medium text-[var(--text-heading)]"
                    >
                      Phone number
                    </label>
                    <input
                      id="delivery-phone"
                      type="tel"
                      placeholder="+234..."
                      className="h-11 w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-card)] px-3 text-sm outline-none focus:border-[var(--brand-primary)]"
                      {...form.register("phoneNumber")}
                    />
                    {form.formState.errors.phoneNumber ? (
                      <p className="mt-1.5 mb-0 text-sm text-[var(--text-danger,#b42318)]">
                        {form.formState.errors.phoneNumber.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
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
              Review financing
            </h2>
            <p className="mt-3 mb-0 max-w-[520px] text-sm leading-relaxed text-[var(--text-muted)]">
              Check these details before accepting the agreement. Nothing is charged yet.
            </p>
          </div>
          <dl className="m-0 divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            {[
              ["Product", product.name],
              ["Financing name", values.name || "—"],
              ["Capital commitment", formatNaira(values.capital || 0)],
              ["Quantity", String(values.quantity || 1)],
              [
                "Fulfillment",
                values.fulfillmentType === "PICKUP" ? "Pickup" : "Delivery",
              ],
              [
                values.fulfillmentType === "PICKUP"
                  ? "Pickup location"
                  : "Delivery address",
                values.fulfillmentType === "PICKUP"
                  ? formatPickupLabel(selectedPickup ?? {}) ||
                    values.pickupLocationId ||
                    "—"
                  : values.deliveryAddress || "—",
              ],
              ...(values.fulfillmentType === "DELIVERY"
                ? [["Phone", values.phoneNumber || "—"] as const]
                : []),
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-4">
                <dt className="m-0 text-sm text-[var(--text-muted)]">{label}</dt>
                <dd className="m-0 max-w-[60%] text-right text-sm font-bold text-[var(--text-heading)]">
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
              {values.name || product.name}
            </p>
          </div>

          {createdFinancingId && !receiptDialogOpen ? (
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
              {createdFinancingId ? "Confirm payment" : "Make payment"}
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
            aria-labelledby="market-payment-title"
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
                id="market-payment-title"
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
                {createFinancing.isPending ? "Creating financing…" : "I've made payment"}
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
            aria-labelledby="market-confirm-payment-title"
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
                id="market-confirm-payment-title"
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
