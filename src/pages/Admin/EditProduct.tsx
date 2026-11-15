import { Link, useNavigate, useParams } from "react-router-dom";

import { useAdminProduct, useReplaceAdminProduct } from "@/api/admin/hooks";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { AdminCustomerDetailSkeleton } from "@/components/ui/page-skeleton";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { normalizeError } from "@/utils/normalizeError";

export default function EditProduct() {
  const navigate = useNavigate();
  const { productId = "" } = useParams();
  const productQuery = useAdminProduct(productId);
  const replaceMutation = useReplaceAdminProduct();

  const product = productQuery.data?.data;

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
          <span className="text-[var(--text-muted)]">Edit product</span>
        </nav>
        <AdminPageHeader title="Edit product" />
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
        <Link
          to={`/admin/products/${product.id}`}
          className="truncate font-semibold text-[var(--text-brand)] no-underline hover:underline"
        >
          {product.name}
        </Link>
        <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)" }} />
        <span className="font-medium text-[var(--text-heading)]">Edit</span>
      </nav>

      <AdminPageHeader
        title="Edit product"
        description="Replace product details. Stock changes are recorded as an admin set movement."
      />

      <AdminProductForm
        mode="edit"
        initialProduct={product}
        submitLabel="Save changes"
        submitting={replaceMutation.isPending}
        onCancel={() => navigate(`/admin/products/${product.id}`)}
        onSubmit={async (values) => {
          try {
            await replaceMutation.mutateAsync({
              productId: product.id,
              payload: values,
            });
            navigate(`/admin/products/${product.id}`, { replace: true });
          } catch {
            /* toast in hook */
          }
        }}
      />
    </div>
  );
}
