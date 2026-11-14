import { ChevronDown, Package, Search, SlidersHorizontal, Store } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCatalogCategories, useCatalogProducts } from "@/api/products/hooks";
import { normalizeCategoryList } from "@/api/products/products";
import type { Product } from "@/api/products/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type DisplayStockLabel,
  formatProductPrice,
  isProductFinancable,
  mapProductStockLabel,
  productCategoryLabel,
  productPrimaryImage,
  STOCK_LABEL_STYLES,
} from "@/lib/products";
import { cn } from "@/lib/utils";
import { normalizeError } from "@/utils/normalizeError";

function StockBadge({ label }: { label: DisplayStockLabel }) {
  return (
    <span
      className={cn(
        "absolute top-3 left-3 z-10 inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold",
        STOCK_LABEL_STYLES[label],
      )}
    >
      {label}
    </span>
  );
}

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const stockLabel = mapProductStockLabel(product);
  const category = productCategoryLabel(product);
  const image = productPrimaryImage(product);
  const canFinance = isProductFinancable(product);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-[var(--neutral-25)] p-6">
        {stockLabel ? <StockBadge label={stockLabel} /> : null}
        {image ? (
          <img src={image} alt="" className="max-h-full max-w-full object-contain" />
        ) : (
          <Package className="size-12 text-[var(--text-muted)]" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="min-w-0">
          {category ? (
            <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
              {category}
            </p>
          ) : null}
          <h3 className="mt-1.5 mb-0 truncate text-base font-bold text-[var(--text-heading)]">
            {product.name}
          </h3>
          <p className="mt-2 mb-0 text-xl font-extrabold tracking-[-0.02em] text-[var(--text-heading)]">
            {formatProductPrice(Number(product.price) || 0)}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-2.5">
          <Button
            type="button"
            disabled={!canFinance}
            className="h-11 w-full rounded-md border-0 text-sm font-semibold shadow-none ring-0"
            onClick={() => navigate(`/dashboard/marketplace/finance/${product.id}`)}
          >
            Start financing
          </Button>
          <Link
            to={`/dashboard/marketplace/products/${product.id}`}
            className="inline-flex h-9 items-center justify-center text-sm font-semibold text-[var(--text-heading)] no-underline hover:underline hover:underline-offset-4"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

function BrowseSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-8 md:gap-10"
      aria-busy="true"
      aria-label="Loading marketplace catalog"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-9 w-[min(100%,280px)]" />
          <Skeleton className="h-4 w-[min(100%,420px)]" />
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
          <Skeleton className="h-11 w-full sm:w-[280px]" />
          <Skeleton className="h-11 w-full sm:w-[160px]" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]"
          >
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="mx-auto h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MarketplaceBrowse() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const categoriesQuery = useCatalogCategories();
  const catalogQuery = useCatalogProducts({
    page: 1,
    size: 50,
    search: debouncedSearch || undefined,
    categoryId: categoryId === "all" ? undefined : categoryId,
  });

  const categories = useMemo(
    () =>
      normalizeCategoryList(categoriesQuery.data?.data).filter(
        (c) => c.active !== false && Boolean(c.id) && Boolean(c.name?.trim()),
      ),
    [categoriesQuery.data],
  );

  const products = useMemo(
    () => catalogQuery.data?.data?.data ?? [],
    [catalogQuery.data],
  );

  const selectedCategoryLabel =
    categoryId === "all"
      ? "All products"
      : categories.find((c) => c.id === categoryId)?.name || "All products";

  const booting =
    (categoriesQuery.isLoading || catalogQuery.isLoading) && !catalogQuery.data;

  if (booting) {
    return <BrowseSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex items-center gap-1.5 text-sm text-[var(--text-muted)]"
          >
            <Link
              to="/dashboard/marketplace"
              className="text-[var(--text-muted)] no-underline hover:text-[var(--text-heading)]"
            >
              Marketplace
            </Link>
            <span aria-hidden>›</span>
            <span className="text-[var(--text-heading)]">Browse products</span>
          </nav>
          <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[32px]">
            Browse products
          </h1>
          <p className="mt-3 max-w-[560px] text-sm leading-relaxed text-[var(--text-muted)] md:text-[15px]">
            Select a product to finance through a structured growth program.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
          <label className="relative block w-full min-w-0 sm:w-[280px]">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              className="h-11 w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-card)] pr-3 pl-9 text-sm text-[var(--text-heading)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)]"
            />
          </label>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-11 w-full items-center gap-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-card)] px-3 text-sm font-medium text-[var(--text-heading)] outline-none hover:bg-[var(--neutral-50)] focus-visible:border-[var(--brand-primary)] focus-visible:outline-none data-[state=open]:border-[var(--brand-primary)] data-[state=open]:bg-[var(--orange-50)] sm:w-auto sm:min-w-[160px]"
              >
                <SlidersHorizontal className="size-4 shrink-0 text-[var(--text-muted)]" />
                <span className="truncate">{selectedCategoryLabel}</span>
                <ChevronDown className="ml-auto size-4 shrink-0 text-[var(--text-muted)]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px]">
              <DropdownMenuLabel>Filter by category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={categoryId} onValueChange={setCategoryId}>
                <DropdownMenuRadioItem
                  value="all"
                  className={cn(
                    categoryId === "all" && "font-semibold text-[var(--text-brand)]",
                  )}
                >
                  All products
                </DropdownMenuRadioItem>
                {categories.map((category) => (
                  <DropdownMenuRadioItem
                    key={category.id}
                    value={category.id}
                    className={cn(
                      categoryId === category.id &&
                        "font-semibold text-[var(--text-brand)]",
                    )}
                  >
                    {category.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {catalogQuery.isError ? (
        <section className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm leading-relaxed text-[var(--text-danger,#b42318)]">
            {normalizeError(catalogQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void catalogQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      ) : products.length === 0 ? (
        <section className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <span className="inline-flex size-14 items-center justify-center rounded-lg bg-[var(--neutral-100)] text-[var(--text-muted)]">
            <Store className="size-6" />
          </span>
          <div className="mt-7 flex max-w-[420px] flex-col items-center gap-3">
            <h2 className="m-0 text-lg font-bold text-[var(--text-heading)]">
              No products found
            </h2>
            <p className="m-0 text-sm leading-relaxed text-[var(--text-muted)]">
              {debouncedSearch || categoryId !== "all"
                ? "Try a different search or category."
                : "Check back soon for products you can finance."}
            </p>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </div>
  );
}
