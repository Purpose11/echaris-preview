import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useAdminCommitmentRate, useUpdateAdminCommitmentRate } from "@/api/admin/hooks";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/design-system/components/core/Button.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { normalizeError } from "@/utils/normalizeError";
import {
  updateAdminCommitmentRateFormSchema,
  type UpdateAdminCommitmentRateFormValues,
} from "@/validations/admin/dto";

function formatRateInput(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return "";

  const hasDecimal = cleaned.includes(".");
  const [intRaw = "", ...rest] = cleaned.split(".");
  const intPart = intRaw.replace(/^0+(?=\d)/, "") || (hasDecimal ? "0" : "");
  const decPart = rest.join("").replace(/\D/g, "").slice(0, 2);

  if (hasDecimal) return `${intPart}.${decPart}`;
  return intPart;
}

function parseRateInput(formatted: string) {
  const normalized = formatted.trim();
  if (!normalized || normalized === ".") return NaN;
  return Number(normalized);
}

export default function ReturnPercentage() {
  const [rateInput, setRateInput] = useState("");
  const rateQuery = useAdminCommitmentRate();
  const updateMutation = useUpdateAdminCommitmentRate();

  const rate = rateQuery.data?.data;

  const form = useForm<UpdateAdminCommitmentRateFormValues>({
    resolver: zodResolver(updateAdminCommitmentRateFormSchema),
    defaultValues: {
      percentage: undefined as unknown as number,
    },
  });

  useEffect(() => {
    if (!rate) return;
    const value = Number(rate.percentage);
    form.reset({ percentage: value });
    setRateInput(Number.isFinite(value) ? String(value) : "");
  }, [form, rate]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!rate || rate.version === undefined || rate.version === null) {
      return;
    }
    try {
      await updateMutation.mutateAsync({
        percentage: values.percentage,
        version: rate.version,
      });
    } catch {
      /* toast in hook; refetch in case version went stale */
      void rateQuery.refetch();
    }
  });

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <AdminPageHeader
        title="Return percentage"
        description="Set the monthly return rate applied to newly created capital commitments."
      />

      {rateQuery.isError ? (
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm text-[var(--text-danger,#b42318)]">
            {normalizeError(rateQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void rateQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      ) : (
        <section className="flex w-full max-w-xl flex-col gap-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
                Current rate
              </p>
              <p className="mt-2 mb-0 text-2xl font-extrabold tracking-[-0.03em] text-[var(--text-heading)]">
                {rateQuery.isLoading
                  ? "—"
                  : `${Number(rate?.percentage ?? 0).toFixed(2)}%`}
              </p>
            </div>
            <div>
              <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
                Version
              </p>
              <p className="mt-2 mb-0 text-2xl font-extrabold tracking-[-0.03em] text-[var(--text-heading)]">
                {rateQuery.isLoading ? "—" : (rate?.version ?? "—")}
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <FormField
              label="New monthly rate (%)"
              htmlFor="return-percentage"
              required
              hint="Must be between 0.01 and 100.00. Changes apply to new commitments only."
              error={form.formState.errors.percentage?.message}
            >
              <Controller
                control={form.control}
                name="percentage"
                render={({ field }) => (
                  <Input
                    id="return-percentage"
                    inputMode="decimal"
                    placeholder="5.00"
                    suffix="%"
                    invalid={Boolean(form.formState.errors.percentage)}
                    disabled={rateQuery.isLoading || updateMutation.isPending}
                    value={rateInput}
                    onChange={(e) => {
                      const next = formatRateInput(e.target.value);
                      setRateInput(next);
                      const parsed = parseRateInput(next);
                      field.onChange(Number.isFinite(parsed) ? parsed : undefined);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                )}
              />
            </FormField>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-md px-4 text-sm font-semibold shadow-none"
                disabled={rateQuery.isLoading || updateMutation.isPending}
                onClick={() => void rateQuery.refetch()}
              >
                Refresh
              </Button>
              <Button
                type="submit"
                className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
                loading={updateMutation.isPending}
                disabled={rateQuery.isLoading || updateMutation.isPending || !rate}
              >
                Update rate
              </Button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
