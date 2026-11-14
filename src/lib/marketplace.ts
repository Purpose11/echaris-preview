import type { MarketFinancing } from "@/api/marketplace/types";

export type DisplayFinancingStatus =
  | "Awaiting payment"
  | "Accumulating"
  | "Ready for delivery"
  | "Completed"
  | "Cancelled"
  | "Pending";

export function mapFinancingStatus(
  status: string | null | undefined,
): DisplayFinancingStatus {
  const normalized = String(status ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  if (normalized === "AWAITING_PAYMENT") return "Awaiting payment";
  if (
    normalized === "ACCUMULATING" ||
    normalized === "ACTIVE" ||
    normalized === "LOCKED" ||
    normalized === "FUNDED"
  ) {
    return "Accumulating";
  }
  if (
    normalized === "READY_FOR_DELIVERY" ||
    normalized === "READY" ||
    normalized === "FULFILLMENT_READY"
  ) {
    return "Ready for delivery";
  }
  if (normalized === "COMPLETED" || normalized === "COMPLETE") {
    return "Completed";
  }
  if (normalized === "CANCELLED" || normalized === "CANCELED") {
    return "Cancelled";
  }
  return "Pending";
}

export const FINANCING_STATUS_STYLES: Record<DisplayFinancingStatus, string> = {
  "Awaiting payment": "bg-[var(--orange-50)] text-[var(--text-brand)]",
  Accumulating: "bg-[var(--orange-50)] text-[var(--text-brand)]",
  "Ready for delivery": "bg-[var(--success-50)] text-[var(--text-success)]",
  Completed: "bg-[var(--info-50)] text-[var(--text-info)]",
  Cancelled: "bg-[var(--danger-50)] text-[var(--text-danger)]",
  Pending: "bg-[var(--neutral-100)] text-[var(--text-muted)]",
};

export function financingProductName(item: MarketFinancing) {
  return (
    item.productName?.trim() ||
    item.product?.name?.trim() ||
    item.name?.trim() ||
    "Product financing"
  );
}

export function financingQuantity(item: MarketFinancing) {
  const qty = Number(item.productQuantity ?? item.quantity);
  return Number.isFinite(qty) && qty > 0 ? qty : 1;
}

export function financingUnitPrice(item: MarketFinancing) {
  return (
    Number(item.productPrice) ||
    Number(item.product?.price) ||
    Number(item.productValue) ||
    0
  );
}

/** Total product value = unit price × quantity when quantity is known. */
export function financingProductValue(item: MarketFinancing) {
  const unit = financingUnitPrice(item);
  if (!unit) return 0;
  return unit * financingQuantity(item);
}

export function financingReturns(item: MarketFinancing) {
  return (
    Number(item.accumulatedReturns) ||
    Number(item.returnsAccumulated) ||
    Number(item.totalReturns) ||
    0
  );
}

export function financingFulfillmentAddress(item: MarketFinancing) {
  const fulfillment = item.fulfillment;
  if (!fulfillment) return null;
  const address =
    fulfillment.address?.trim() || fulfillment.deliveryAddress?.trim() || "";
  return address || null;
}
