import type { Product, ProductStockStatus } from "@/api/products/types";
import { formatCommitmentNaira } from "@/lib/commitments";

export type DisplayStockLabel =
  "In stock" | "Low stock" | "Out of stock" | "Made to order";

export function productCategoryLabel(product: Product) {
  return product.category?.name?.trim() || product.categoryName?.trim() || "";
}

export function mapProductStockLabel(product: Product): DisplayStockLabel | null {
  if (product.madeToOrder) return "Made to order";

  const status = String(product.stockStatus ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  if (status === "IN_STOCK" || status === "AVAILABLE") return "In stock";
  if (status === "LOW_STOCK") return "Low stock";
  if (status === "OUT_OF_STOCK" || status === "UNAVAILABLE") {
    return "Out of stock";
  }

  const qty = Number(product.stockQuantity);
  if (Number.isFinite(qty)) {
    if (qty <= 0) return "Out of stock";
    if (qty <= 3) return "Low stock";
    return "In stock";
  }

  return null;
}

export const STOCK_LABEL_STYLES: Record<DisplayStockLabel, string> = {
  "In stock": "bg-[var(--success-50)] text-[var(--success-700)]",
  "Low stock": "bg-[#fff6e5] text-[#9a6700]",
  "Out of stock": "bg-[var(--danger-50)] text-[var(--text-danger)]",
  "Made to order": "bg-[var(--neutral-100)] text-[var(--neutral-700)]",
};

export function formatProductPrice(value: number) {
  return formatCommitmentNaira(value);
}

export function productPrimaryImage(product: Product) {
  return product.imageUrls?.find((url) => Boolean(url?.trim())) ?? null;
}

export function isProductFinancable(product: Product) {
  const label = mapProductStockLabel(product);
  return label !== "Out of stock";
}

/** Normalize stock status enums for comparisons. */
export function normalizeStockStatus(status: ProductStockStatus | null | undefined) {
  return String(status ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}
