import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { useCreateAdmin } from "@/api/admin/hooks";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { Select } from "@/design-system/components/forms/Select.jsx";
import {
  createAdminFormSchema,
  type CreateAdminFormValues,
} from "@/validations/admin/dto";

const GENDER_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NON_BINARY", label: "Non-binary" },
];

export default function CreateAdmin() {
  const navigate = useNavigate();
  const createMutation = useCreateAdmin();

  const form = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      emailAddress: "",
      password: "",
      phoneNumber: "",
      gender: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const admin = await createMutation.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        emailAddress: values.emailAddress.trim(),
        password: values.password,
        phoneNumber: values.phoneNumber?.trim() || null,
        gender: values.gender ? values.gender : null,
        profilePictureUrl: null,
      });
      navigate(`/admin/admins/${admin.adminId}`, { replace: true });
    } catch {
      /* toast in hook */
    }
  });

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          to="/admin/admins"
          className="font-semibold text-[var(--text-brand)] no-underline hover:underline"
        >
          Admins
        </Link>
        <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)" }} />
        <span className="font-medium text-[var(--text-heading)]">Add admin</span>
      </nav>

      <AdminPageHeader
        title="Add admin"
        description="Create an active, verified regular administrator account."
      />

      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-xl flex-col gap-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 md:p-8"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="First name"
            htmlFor="admin-first-name"
            required
            error={form.formState.errors.firstName?.message}
          >
            <Input
              id="admin-first-name"
              maxLength={80}
              invalid={Boolean(form.formState.errors.firstName)}
              {...form.register("firstName")}
            />
          </FormField>
          <FormField
            label="Last name"
            htmlFor="admin-last-name"
            required
            error={form.formState.errors.lastName?.message}
          >
            <Input
              id="admin-last-name"
              maxLength={80}
              invalid={Boolean(form.formState.errors.lastName)}
              {...form.register("lastName")}
            />
          </FormField>
        </div>

        <FormField
          label="Email address"
          htmlFor="admin-email"
          required
          error={form.formState.errors.emailAddress?.message}
        >
          <Input
            id="admin-email"
            type="email"
            autoComplete="off"
            invalid={Boolean(form.formState.errors.emailAddress)}
            {...form.register("emailAddress")}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="admin-password"
          required
          error={form.formState.errors.password?.message}
        >
          <Input
            id="admin-password"
            type="password"
            autoComplete="new-password"
            invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
        </FormField>

        <FormField
          label="Phone number"
          htmlFor="admin-phone"
          optional
          error={form.formState.errors.phoneNumber?.message}
        >
          <Input
            id="admin-phone"
            type="tel"
            invalid={Boolean(form.formState.errors.phoneNumber)}
            {...form.register("phoneNumber")}
          />
        </FormField>

        <Controller
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormField label="Gender" htmlFor="admin-gender" optional>
              <Select
                id="admin-gender"
                value={field.value}
                onChange={field.onChange}
                options={GENDER_OPTIONS}
              />
            </FormField>
          )}
        />

        <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-md px-4 text-sm font-semibold shadow-none"
            disabled={createMutation.isPending}
            onClick={() => navigate("/admin/admins")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
            loading={createMutation.isPending}
            disabled={createMutation.isPending}
          >
            Create admin
          </Button>
        </div>
      </form>
    </div>
  );
}
