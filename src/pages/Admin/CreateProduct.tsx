import { Link, useNavigate } from "react-router-dom";

import { useCreateAdminProduct } from "@/api/admin/hooks";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { Icon } from "@/design-system/components/core/Icon.jsx";

export default function CreateProduct() {
  const navigate = useNavigate();
  const createMutation = useCreateAdminProduct();

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
        <span className="font-medium text-[var(--text-heading)]">Add product</span>
      </nav>

      <AdminPageHeader
        title="Add product"
        description="Create a catalog product for marketplace financing. Active products need an active category."
      />

      <AdminProductForm
        mode="create"
        submitLabel="Create product"
        submitting={createMutation.isPending}
        onCancel={() => navigate("/admin/products")}
        onSubmit={async (values) => {
          try {
            const res = await createMutation.mutateAsync(values);
            if (res.data?.id) {
              navigate(`/admin/products/${res.data.id}`, { replace: true });
              return;
            }
            navigate("/admin/products", { replace: true });
          } catch {
            /* toast in hook */
          }
        }}
      />
    </div>
  );
}
