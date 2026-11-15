import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  useAdminProduct,
  useAdminProductCategories,
  useDeactivateAdminProduct,
} from "@/api/admin/hooks";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { AdminCustomerDetailSkeleton } from "@/components/ui/page-skeleton";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";
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

const blackButtonStyle = {
  background: "#171717",
  border: "1px solid #171717",
  color: "#ffffff",
  boxShadow: "none",
} as const;

export default function ProductDetail() {
  const navigate = useNavigate();
  const { productId = "" } = useParams();
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const productQuery = useAdminProduct(productId);
  const categoriesQuery = useAdminProductCategories();
  const deactivateMutation = useDeactivateAdminProduct();

  const product = productQuery.data?.data;
  const categoryName = useMemo(() => {
    if (!product) return null;
    if (product.categoryName) return product.categoryName;
    if (product.category?.name) return product.category.name;
    const cats = categoriesQuery.data?.data ?? [];
    return cats.find((c) => c.id === product.categoryId)?.name ?? null;
  }, [product, categoriesQuery.data?.data]);

  const onConfirmDeactivate = () => {
    if (!product) return;
    deactivateMutation.mutate(product.id, {
      onSuccess: () => setDeactivateOpen(false),
    });
  };

  if (productQuery.isLoading) {
    return <AdminCustomerDetailSkeleton />;
  }

  if (productQuery.isError || !product) {
    return (
      <div className="flex w-full flex-col gap-8 md:gap-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          <Link
            to="/admin/products"
            className="font-semibold text-[var(--text-brand)] no-underline hover:underline"
          >
            Products
          </Link>
          <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)" }} />
          <span className="text-[var(--text-muted)]">Product</span>
        </nav>
        <AdminPageHeader title="Product" />
        <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-16 text-center">
          <p className="m-0 text-sm text-[var(--text-danger,#b42318)]">
            {normalizeError(productQuery.error) || "Product not found."}
          </p>
          <Link
            to="/admin/products"
            className="mt-4 inline-block text-sm font-semibold text-[var(--text-brand)]"
          >
            Back to products
          </Link>
        </section>
      </div>
    );
  }

  const images = product.imageUrls?.filter(Boolean) ?? [];
  const stockStatus = product.madeToOrder
    ? "MADE_TO_ORDER"
    : String(product.stockStatus || "IN_STOCK");
  const isActive = product.active !== false;

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          to="/admin/products"
          className="font-semibold text-[var(--text-brand)] no-underline hover:underline"
        >
          Products
        </Link>
        <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)" }} />
        <span className="truncate font-medium text-[var(--text-heading)]">
          {product.name}
        </span>
      </nav>

      <AdminPageHeader
        title={product.name}
        description={product.description || undefined}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-md px-4 text-sm font-semibold shadow-none"
              onClick={() => navigate(`/admin/products/${product.id}/edit`)}
            >
              Edit
            </Button>
            {isActive ? (
              <Button
                type="button"
                className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
                style={blackButtonStyle}
                disabled={deactivateMutation.isPending}
                onClick={() => setDeactivateOpen(true)}
              >
                Deactivate
              </Button>
            ) : null}
          </>
        }
      />

      <section className="grid grid-cols-1 gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:grid-cols-2 sm:p-6 md:grid-cols-3 md:p-8">
        <Field label="Price" value={formatCommitmentNaira(Number(product.price) || 0)} />
        <Field label="Category" value={categoryName || "—"} />
        <Field
          label="Status"
          value={<AdminStatusPill status={isActive ? "ACTIVE" : "INACTIVE"} />}
        />
        <Field
          label="Stock quantity"
          value={product.madeToOrder ? "Made to order" : (product.stockQuantity ?? "—")}
        />
        <Field label="Availability" value={<AdminStatusPill status={stockStatus} />} />
        <Field
          label="Fulfillment"
          value={product.madeToOrder ? "Made to order" : "Stocked"}
        />
      </section>

      {images.length > 0 ? (
        <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 md:p-8">
          <h2 className="m-0 text-lg font-bold tracking-[-0.02em] text-[var(--text-heading)]">
            Images
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-md border border-[var(--border-subtle)] bg-[var(--surface-page)]"
              >
                <img
                  src={url}
                  alt={product.name}
                  className="aspect-square w-full object-cover"
                />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <AdminConfirmModal
        open={deactivateOpen}
        title={`Deactivate ${product.name}?`}
        description="This sets the product to inactive. It remains available in admin reads."
        confirmLabel="Deactivate product"
        cancelLabel="Cancel"
        tone="dark"
        loading={deactivateMutation.isPending}
        onClose={() => {
          if (!deactivateMutation.isPending) setDeactivateOpen(false);
        }}
        onConfirm={onConfirmDeactivate}
      />
    </div>
  );
}
