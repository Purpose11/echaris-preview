import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  useAdminCategory,
  useDeactivateAdminCategory,
  useReplaceAdminCategory,
} from "@/api/admin/hooks";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCustomerDetailSkeleton } from "@/components/ui/page-skeleton";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { Checkbox } from "@/design-system/components/forms/Checkbox.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { normalizeError } from "@/utils/normalizeError";
import {
  createAdminCategoryFormSchema,
  type CreateAdminCategoryFormValues,
} from "@/validations/admin/dto";

const blackButtonStyle = {
  background: "#171717",
  border: "1px solid #171717",
  color: "#ffffff",
  boxShadow: "none",
} as const;

export default function EditCategory() {
  const navigate = useNavigate();
  const { categoryId = "" } = useParams();
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const categoryQuery = useAdminCategory(categoryId);
  const replaceMutation = useReplaceAdminCategory();
  const deactivateMutation = useDeactivateAdminCategory();

  const category = categoryQuery.data?.data;

  const form = useForm<CreateAdminCategoryFormValues>({
    resolver: zodResolver(createAdminCategoryFormSchema),
    defaultValues: {
      name: "",
      active: true,
    },
  });

  useEffect(() => {
    if (!category) return;
    form.reset({
      name: category.name ?? "",
      active: category.active !== false,
    });
  }, [category, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!category) return;
    try {
      await replaceMutation.mutateAsync({
        categoryId: category.id,
        payload: {
          name: values.name.trim(),
          active: values.active,
        },
      });
      navigate("/admin/categories", { replace: true });
    } catch {
      /* toast in hook */
    }
  });

  if (categoryQuery.isLoading) {
    return <AdminCustomerDetailSkeleton />;
  }

  if (categoryQuery.isError || !category) {
    return (
      <div className="flex w-full flex-col gap-8 md:gap-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          <Link
            to="/admin/categories"
            className="font-semibold text-[var(--text-brand)] no-underline hover:underline"
          >
            Categories
          </Link>
          <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)" }} />
          <span className="text-[var(--text-muted)]">Edit category</span>
        </nav>
        <AdminPageHeader title="Edit category" />
        <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-16 text-center">
          <p className="m-0 text-sm text-[var(--text-danger,#b42318)]">
            {normalizeError(categoryQuery.error) || "Category not found."}
          </p>
          <Link
            to="/admin/categories"
            className="mt-4 inline-block text-sm font-semibold text-[var(--text-brand)]"
          >
            Back to categories
          </Link>
        </section>
      </div>
    );
  }

  const isActive = category.active !== false;
  const busy = replaceMutation.isPending || deactivateMutation.isPending;

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          to="/admin/categories"
          className="font-semibold text-[var(--text-brand)] no-underline hover:underline"
        >
          Categories
        </Link>
        <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)" }} />
        <span className="truncate font-medium text-[var(--text-heading)]">
          {category.name}
        </span>
      </nav>

      <AdminPageHeader
        title="Edit category"
        description="Replace category details. Names must be unique, including inactive categories."
        actions={
          isActive ? (
            <Button
              type="button"
              className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
              style={blackButtonStyle}
              disabled={busy}
              onClick={() => setDeactivateOpen(true)}
            >
              Deactivate
            </Button>
          ) : null
        }
      />

      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-xl flex-col gap-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 md:p-8"
      >
        <FormField
          label="Category name"
          htmlFor="category-name"
          required
          error={form.formState.errors.name?.message}
        >
          <Input
            id="category-name"
            maxLength={100}
            invalid={Boolean(form.formState.errors.name)}
            {...form.register("name")}
          />
        </FormField>

        <Controller
          control={form.control}
          name="active"
          render={({ field }) => (
            <Checkbox
              label="Active"
              description="Active categories can be used by active products in the catalog."
              checked={field.value}
              onChange={(e: { target: { checked: boolean } }) =>
                field.onChange(e.target.checked)
              }
            />
          )}
        />

        <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-md px-4 text-sm font-semibold shadow-none"
            disabled={busy}
            onClick={() => navigate("/admin/categories")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
            loading={replaceMutation.isPending}
            disabled={busy}
          >
            Save changes
          </Button>
        </div>
      </form>

      <AdminConfirmModal
        open={deactivateOpen}
        title={`Deactivate ${category.name}?`}
        description="Products in this category will leave the shopping catalog, but remain available in admin product reads."
        confirmLabel="Deactivate category"
        cancelLabel="Cancel"
        tone="dark"
        loading={deactivateMutation.isPending}
        onClose={() => {
          if (!deactivateMutation.isPending) setDeactivateOpen(false);
        }}
        onConfirm={() => {
          deactivateMutation.mutate(category.id, {
            onSuccess: () => {
              setDeactivateOpen(false);
              navigate("/admin/categories", { replace: true });
            },
          });
        }}
      />
    </div>
  );
}
