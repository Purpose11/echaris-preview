import { ArrowLeft, Minus, Package, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useCatalogProduct } from "@/api/products/hooks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatProductPrice,
  isProductFinancable,
  mapProductStockLabel,
  productCategoryLabel,
  productPrimaryImage,
  STOCK_LABEL_STYLES,
} from "@/lib/products";
import { cn } from "@/lib/utils";
import { normalizeError } from "@/utils/normalizeError";

function ProductDetailsSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-8 md:gap-10"
      aria-busy="true"
      aria-label="Loading product details"
    >
      <Skeleton className="h-4 w-56" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
        <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
        <div className="space-y-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-[min(100%,360px)]" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function MarketplaceProductDetails() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const productQuery = useCatalogProduct(productId);
  const [quantity, setQuantity] = useState(1);

  const product = productQuery.data?.data;
  const stockLabel = product ? mapProductStockLabel(product) : null;
  const category = product ? productCategoryLabel(product) : "";
  const image = product ? productPrimaryImage(product) : null;
  const canFinance = product ? isProductFinancable(product) : false;
  const unitPrice = Number(product?.price) || 0;
  const lineTotal = unitPrice * quantity;

  const quantityLabel = useMemo(() => {
    const units = `${quantity} unit${quantity === 1 ? "" : "s"}`;
    return `${units} · ${formatProductPrice(lineTotal)}`;
  }, [quantity, lineTotal]);

  const decrease = () => setQuantity((q) => Math.max(1, q - 1));
  const increase = () => setQuantity((q) => Math.min(99, q + 1));

  const startFinancing = () => {
    if (!productId || !canFinance) return;
    const params = new URLSearchParams();
    if (quantity > 1) params.set("quantity", String(quantity));
    const query = params.toString();
    navigate(`/dashboard/marketplace/finance/${productId}${query ? `?${query}` : ""}`);
  };

  if (productQuery.isLoading) {
    return <ProductDetailsSkeleton />;
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
        <section className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
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
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--text-muted)]"
      >
        <Link
          to="/dashboard/marketplace"
          className="text-[var(--text-muted)] no-underline hover:text-[var(--text-heading)]"
        >
          Marketplace
        </Link>
        <span aria-hidden>›</span>
        <span className="text-[var(--text-heading)]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-12">
        <div className="flex aspect-[4/3] items-center justify-center rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 md:p-12">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <Package className="size-16 text-[var(--text-muted)]" />
          )}
        </div>

        <div className="flex flex-col gap-6">
          {category ? (
            <p className="m-0 text-[11px] font-semibold tracking-[0.1em] text-[var(--text-muted)] uppercase">
              {category}
            </p>
          ) : null}

          <div>
            <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[36px]">
              {product.name}
            </h1>
            <p className="mt-4 mb-0 text-[28px] leading-none font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[32px]">
              {formatProductPrice(unitPrice)}
            </p>
          </div>

          {product.description?.trim() ? (
            <p className="m-0 text-sm leading-relaxed text-[var(--text-muted)] md:text-[15px]">
              {product.description.trim()}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 border-y border-[var(--border-subtle)] py-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-[var(--text-muted)]">Availability</span>
              {stockLabel ? (
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold",
                    STOCK_LABEL_STYLES[stockLabel],
                  )}
                >
                  {stockLabel}
                </span>
              ) : (
                <span className="text-sm font-semibold text-[var(--text-heading)]">
                  —
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-[var(--text-muted)]">Delivery options</span>
              <span className="text-right text-sm font-semibold text-[var(--text-heading)]">
                Home delivery or pickup station
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-4">
            <div className="min-w-0">
              <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
                Quantity
              </p>
              <p className="mt-1.5 mb-0 text-sm font-bold text-[var(--text-heading)]">
                {quantityLabel}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-md border border-[var(--border-default)] bg-[var(--surface-card)] p-1">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={decrease}
                className="inline-flex size-8 items-center justify-center rounded-md text-[var(--text-heading)] hover:bg-[var(--neutral-50)] disabled:opacity-40"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-8 text-center text-sm font-bold text-[var(--text-heading)]">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={quantity >= 99}
                onClick={increase}
                className="inline-flex size-8 items-center justify-center rounded-md text-[var(--text-heading)] hover:bg-[var(--neutral-50)] disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <p className="m-0 text-sm leading-relaxed text-[var(--text-brand)]">
            Your products are released once accumulated performance returns reach 50% of
            the total value.
          </p>

          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/dashboard/marketplace/browse"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-heading)] no-underline hover:underline hover:underline-offset-4"
              >
                <ArrowLeft className="size-4" />
                Back to products
              </Link>
              <Button
                type="button"
                disabled={!canFinance}
                className="h-12 w-full rounded-md border-0 text-sm font-semibold shadow-none ring-0 sm:max-w-[280px] sm:flex-1"
                onClick={startFinancing}
              >
                Start financing
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
