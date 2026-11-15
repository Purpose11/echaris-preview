import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { useCreateOrUpdateAddress } from "@/api/addresses/hooks";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import {
  createAdminPickupAddressFormSchema,
  type CreateAdminPickupAddressFormValues,
} from "@/validations/admin/dto";

export default function CreatePickupAddress() {
  const navigate = useNavigate();
  const createMutation = useCreateOrUpdateAddress();

  const form = useForm<CreateAdminPickupAddressFormValues>({
    resolver: zodResolver(createAdminPickupAddressFormSchema),
    defaultValues: {
      country: "Nigeria",
      state: "",
      city: "",
      addressLine: "",
      addressLine2: "",
      postalCode: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync({
        addressType: "PICKUP",
        country: values.country.trim(),
        state: values.state.trim(),
        city: values.city.trim(),
        addressLine: values.addressLine.trim(),
        addressLine2: values.addressLine2?.trim() || null,
        postalCode: values.postalCode?.trim() || null,
      });
      navigate("/admin/pickup-addresses", { replace: true });
    } catch {
      /* toast in hook */
    }
  });

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          to="/admin/pickup-addresses"
          className="font-semibold text-[var(--text-brand)] no-underline hover:underline"
        >
          Pickup addresses
        </Link>
        <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)" }} />
        <span className="font-medium text-[var(--text-heading)]">Add pickup address</span>
      </nav>

      <AdminPageHeader
        title="Add pickup address"
        description="Create a new pickup location. Each save adds a new pickup address."
      />

      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-xl flex-col gap-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 md:p-8"
      >
        <FormField
          label="Country"
          htmlFor="pickup-country"
          required
          error={form.formState.errors.country?.message}
        >
          <Input
            id="pickup-country"
            invalid={Boolean(form.formState.errors.country)}
            {...form.register("country")}
          />
        </FormField>

        <FormField
          label="State"
          htmlFor="pickup-state"
          required
          error={form.formState.errors.state?.message}
        >
          <Input
            id="pickup-state"
            invalid={Boolean(form.formState.errors.state)}
            {...form.register("state")}
          />
        </FormField>

        <FormField
          label="City"
          htmlFor="pickup-city"
          required
          error={form.formState.errors.city?.message}
        >
          <Input
            id="pickup-city"
            invalid={Boolean(form.formState.errors.city)}
            {...form.register("city")}
          />
        </FormField>

        <FormField
          label="Address line"
          htmlFor="pickup-address-line"
          required
          error={form.formState.errors.addressLine?.message}
        >
          <Input
            id="pickup-address-line"
            invalid={Boolean(form.formState.errors.addressLine)}
            {...form.register("addressLine")}
          />
        </FormField>

        <FormField
          label="Address line 2"
          htmlFor="pickup-address-line-2"
          optional
          error={form.formState.errors.addressLine2?.message}
        >
          <Input
            id="pickup-address-line-2"
            invalid={Boolean(form.formState.errors.addressLine2)}
            {...form.register("addressLine2")}
          />
        </FormField>

        <FormField
          label="Postal code"
          htmlFor="pickup-postal-code"
          optional
          error={form.formState.errors.postalCode?.message}
        >
          <Input
            id="pickup-postal-code"
            invalid={Boolean(form.formState.errors.postalCode)}
            {...form.register("postalCode")}
          />
        </FormField>

        <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-md px-4 text-sm font-semibold shadow-none"
            disabled={createMutation.isPending}
            onClick={() => navigate("/admin/pickup-addresses")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
            loading={createMutation.isPending}
            disabled={createMutation.isPending}
          >
            Create pickup address
          </Button>
        </div>
      </form>
    </div>
  );
}
