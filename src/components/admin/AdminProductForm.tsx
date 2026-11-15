import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { useAdminProductCategories } from "@/api/admin/hooks";
import type { Product } from "@/api/products/types";
import { useUploadPublicFile } from "@/api/utilities/hooks";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Checkbox } from "@/design-system/components/forms/Checkbox.jsx";
import { FileUpload } from "@/design-system/components/forms/FileUpload.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { Select } from "@/design-system/components/forms/Select.jsx";
import { Textarea } from "@/design-system/components/forms/Textarea.jsx";
import { normalizeError } from "@/utils/normalizeError";
import {
  createAdminProductFormSchema,
  type CreateAdminProductFormValues,
} from "@/validations/admin/dto";

const MAX_IMAGES = 10;

/** Digits (+ optional decimals) → display with grouping commas (e.g. 85000 → "85,000"). */
export function formatPriceInput(raw: string) {
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

export function parsePriceInput(formatted: string) {
  const normalized = formatted.replace(/,/g, "").trim();
  if (!normalized || normalized === ".") return NaN;
  return Number(normalized);
}

function priceToInput(price: number | undefined | null) {
  if (price === undefined || price === null || !Number.isFinite(price)) return "";
  return formatPriceInput(String(price));
}

export type AdminProductFormValues = CreateAdminProductFormValues;

interface AdminProductFormProps {
  mode: "create" | "edit";
  initialProduct?: Product | null;
  submitLabel: string;
  cancelLabel?: string;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: AdminProductFormValues) => Promise<void> | void;
}

export function AdminProductForm({
  mode,
  initialProduct,
  submitLabel,
  cancelLabel = "Cancel",
  submitting = false,
  onCancel,
  onSubmit,
}: AdminProductFormProps) {
  const [uploading, setUploading] = useState(false);
  const [lastUploadName, setLastUploadName] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState(() => priceToInput(initialProduct?.price));
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  const categoriesQuery = useAdminProductCategories();
  const uploadFile = useUploadPublicFile();

  const categoryOptions = useMemo(() => {
    const cats = categoriesQuery.data?.data ?? [];
    return [
      { value: "", label: "Select a category" },
      ...cats.map((c) => ({
        value: c.id,
        label: c.active === false ? `${c.name} (inactive)` : c.name,
      })),
    ];
  }, [categoriesQuery.data?.data]);

  const form = useForm<AdminProductFormValues>({
    resolver: zodResolver(createAdminProductFormSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      price: undefined as unknown as number,
      stockQuantity: 0,
      madeToOrder: false,
      active: true,
      imageUrls: [],
    },
  });

  useEffect(() => {
    if (!initialProduct?.id || hydratedId === initialProduct.id) return;
    form.reset({
      name: initialProduct.name ?? "",
      description: initialProduct.description ?? "",
      categoryId: initialProduct.categoryId ?? "",
      price: Number(initialProduct.price) || (undefined as unknown as number),
      stockQuantity: Number(initialProduct.stockQuantity) || 0,
      madeToOrder: Boolean(initialProduct.madeToOrder),
      active: initialProduct.active !== false,
      imageUrls: (initialProduct.imageUrls ?? []).filter(Boolean),
    });
    setPriceInput(priceToInput(Number(initialProduct.price)));
    setHydratedId(initialProduct.id);
  }, [form, hydratedId, initialProduct]);

  const imageUrls = form.watch("imageUrls");
  const madeToOrder = form.watch("madeToOrder");
  const busy = submitting || uploading || uploadFile.isPending;

  const onUploadImage = async (file?: File | null) => {
    if (!file) return;
    if (imageUrls.length >= MAX_IMAGES) {
      toast.error(`You can add up to ${MAX_IMAGES} images.`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Upload an image file (PNG, JPG, or WebP).");
      return;
    }

    setUploading(true);
    setLastUploadName(file.name);
    try {
      const res = await uploadFile.mutateAsync({
        file,
        category: "IMAGE",
        usageType: "DOCUMENT",
      });
      const url = res.data?.fileUrl?.trim();
      if (res.success === false || !url) {
        throw new Error(res.message || "Could not upload image.");
      }
      if (url.length > 2048) {
        throw new Error("Uploaded image URL is too long.");
      }
      form.setValue("imageUrls", [...imageUrls, url], {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(normalizeError(error));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    form.setValue(
      "imageUrls",
      imageUrls.filter((_, i) => i !== index),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      name: values.name.trim(),
      description: values.description.trim(),
      categoryId: values.categoryId.trim(),
    });
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-3xl flex-col gap-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 md:p-8"
    >
      <FormField
        label="Product name"
        htmlFor="product-name"
        required
        error={form.formState.errors.name?.message}
      >
        <Input
          id="product-name"
          maxLength={150}
          invalid={Boolean(form.formState.errors.name)}
          {...form.register("name")}
        />
      </FormField>

      <FormField
        label="Description"
        htmlFor="product-description"
        required
        error={form.formState.errors.description?.message}
      >
        <Textarea
          id="product-description"
          rows={5}
          maxLength={4000}
          invalid={Boolean(form.formState.errors.description)}
          {...form.register("description")}
        />
      </FormField>

      <FormField
        label="Category"
        htmlFor="product-category"
        required
        error={form.formState.errors.categoryId?.message}
        hint={categoriesQuery.isError ? normalizeError(categoriesQuery.error) : undefined}
      >
        <Controller
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <Select
              id="product-category"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              options={categoryOptions}
              disabled={categoriesQuery.isLoading}
              invalid={Boolean(form.formState.errors.categoryId)}
            />
          )}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          label="Price (₦)"
          htmlFor="product-price"
          required
          error={form.formState.errors.price?.message}
        >
          <Controller
            control={form.control}
            name="price"
            render={({ field }) => (
              <Input
                id="product-price"
                inputMode="decimal"
                placeholder="0.00"
                prefix="₦"
                invalid={Boolean(form.formState.errors.price)}
                value={priceInput}
                onChange={(e) => {
                  const next = formatPriceInput(e.target.value);
                  setPriceInput(next);
                  const parsed = parsePriceInput(next);
                  field.onChange(Number.isFinite(parsed) ? parsed : undefined);
                }}
                onBlur={field.onBlur}
                name={field.name}
              />
            )}
          />
        </FormField>

        <FormField
          label="Stock quantity"
          htmlFor="product-stock"
          required
          error={form.formState.errors.stockQuantity?.message}
          hint={
            mode === "edit"
              ? "Changing stock records an admin set movement."
              : madeToOrder
                ? "Made-to-order products still record an initial stock movement."
                : undefined
          }
        >
          <Input
            id="product-stock"
            type="number"
            min={0}
            step={1}
            invalid={Boolean(form.formState.errors.stockQuantity)}
            {...form.register("stockQuantity", { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-4">
        <Controller
          control={form.control}
          name="madeToOrder"
          render={({ field }) => (
            <Checkbox
              label="Made to order"
              description="Fulfillment is produced on demand instead of from warehouse stock."
              checked={field.value}
              onChange={(e: { target: { checked: boolean } }) =>
                field.onChange(e.target.checked)
              }
            />
          )}
        />
        <Controller
          control={form.control}
          name="active"
          render={({ field }) => (
            <Checkbox
              label="Active"
              description="Active products must belong to an active category."
              checked={field.value}
              onChange={(e: { target: { checked: boolean } }) =>
                field.onChange(e.target.checked)
              }
            />
          )}
        />
      </div>

      <FormField
        label="Product images"
        htmlFor="product-images"
        hint="Upload up to 10 images, or leave empty. PNG, JPG, or WebP."
        error={form.formState.errors.imageUrls?.message}
      >
        <div className="flex flex-col gap-3">
          {imageUrls.length > 0 ? (
            <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3">
              {imageUrls.map((url, index) => (
                <li
                  key={`${url}-${index}`}
                  className="relative overflow-hidden rounded-md border border-[var(--border-subtle)] bg-[var(--surface-page)]"
                >
                  <img
                    src={url}
                    alt={`Product image ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Remove image ${index + 1}`}
                    className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-md border-0 bg-[rgba(23,23,23,0.82)] text-white"
                    onClick={() => removeImage(index)}
                    disabled={busy}
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {imageUrls.length < MAX_IMAGES ? (
            <FileUpload
              id="product-images"
              accept="image/*"
              label="Upload product image"
              hint="PNG, JPG or WebP"
              fileName={uploading ? (lastUploadName ?? undefined) : undefined}
              onFileChange={(file) => {
                if (file) void onUploadImage(file);
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
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
          loading={submitting}
          disabled={busy}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
