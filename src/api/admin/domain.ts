import type { PageResult } from "@/api/admin/types";
import { type ApiResponse, coreApi } from "@/api/api";
import type {
  Commitment,
  CommitmentDuration,
  CommitmentRate,
} from "@/api/commitments/types";
import type { MarketFinancing, MarketReturn } from "@/api/marketplace/types";
import type { Product, ProductCategory } from "@/api/products/types";

/* ---- Products (admin) ---- */

export interface ListAdminProductsParams {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: string;
  active?: boolean;
}

export async function listAdminProducts(
  params: ListAdminProductsParams = {},
): Promise<ApiResponse<PageResult<Product>>> {
  const { data } = await coreApi.get<ApiResponse<PageResult<Product>>>(
    "/product/private",
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
        ...(params.search?.trim() ? { search: params.search.trim() } : {}),
        ...(params.categoryId ? { categoryId: params.categoryId } : {}),
        ...(params.active !== undefined ? { active: params.active } : {}),
      },
    },
  );
  return data;
}

export async function getAdminProduct(productId: string): Promise<ApiResponse<Product>> {
  const { data } = await coreApi.get<ApiResponse<Product>>(
    `/product/private/${productId}`,
  );
  return data;
}

export async function listAdminCategories(): Promise<ApiResponse<ProductCategory[]>> {
  const { data } = await coreApi.get<ApiResponse<ProductCategory[]>>(
    "/product/private/categories",
  );
  return data;
}

/* ---- Commitments (admin) ---- */

export interface AdminCommitment extends Commitment {
  userId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
}

export interface ListAdminCommitmentsParams {
  page?: number;
  size?: number;
  userId?: string;
}

export async function listAdminCommitments(
  params: ListAdminCommitmentsParams = {},
): Promise<ApiResponse<PageResult<AdminCommitment>>> {
  const { data } = await coreApi.get<ApiResponse<PageResult<AdminCommitment>>>(
    "/commitments/private/admin",
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
        ...(params.userId ? { userId: params.userId } : {}),
      },
    },
  );
  return data;
}

export async function getAdminCommitmentRate(): Promise<ApiResponse<CommitmentRate>> {
  const { data } = await coreApi.get<ApiResponse<CommitmentRate>>(
    "/commitments/private/admin/rate",
  );
  return data;
}

export async function listAdminCommitmentDurations(): Promise<
  ApiResponse<CommitmentDuration[]>
> {
  const { data } = await coreApi.get<ApiResponse<CommitmentDuration[]>>(
    "/commitments/private/admin/durations",
  );
  return data;
}

/* ---- User payments (admin) ---- */

export type AdminPaymentStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID" | string;

export type AdminPaymentPurpose =
  "COMMITMENT" | "MARKETPLACE_FINANCING" | "ORDER" | "CUSTOMER_PAYOUT" | string;

export interface AdminUserPayment {
  id: string;
  userId?: string | null;
  amount: number;
  status: AdminPaymentStatus;
  direction?: string | null;
  purpose?: AdminPaymentPurpose | null;
  reference?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  paidAt?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
}

export interface ListAdminPaymentsParams {
  page?: number;
  size?: number;
  status?: AdminPaymentStatus;
  direction?: string;
  purpose?: AdminPaymentPurpose;
}

export async function listAdminPayments(
  params: ListAdminPaymentsParams = {},
): Promise<ApiResponse<PageResult<AdminUserPayment>>> {
  const { data } = await coreApi.get<ApiResponse<PageResult<AdminUserPayment>>>(
    "/user-payments/private/admin",
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
        ...(params.status ? { status: params.status } : {}),
        ...(params.direction ? { direction: params.direction } : {}),
        ...(params.purpose ? { purpose: params.purpose } : {}),
      },
    },
  );
  return data;
}

export async function getAdminPayment(
  paymentId: string,
): Promise<ApiResponse<AdminUserPayment>> {
  const { data } = await coreApi.get<ApiResponse<AdminUserPayment>>(
    `/user-payments/private/admin/${paymentId}`,
  );
  return data;
}

/* ---- Marketplace (admin) ---- */

export interface ListAdminFinancingsParams {
  page?: number;
  size?: number;
  status?: string;
}

export async function listAdminFinancings(
  params: ListAdminFinancingsParams = {},
): Promise<ApiResponse<PageResult<MarketFinancing>>> {
  const { data } = await coreApi.get<ApiResponse<PageResult<MarketFinancing>>>(
    "/marketplace/private/get-admin-financings",
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
        ...(params.status ? { status: params.status } : {}),
      },
    },
  );
  return data;
}

export async function getAdminFinancing(
  financingId: string,
): Promise<ApiResponse<MarketFinancing>> {
  const { data } = await coreApi.get<ApiResponse<MarketFinancing>>(
    `/marketplace/private/get-admin-financing/${financingId}`,
  );
  return data;
}

export async function listAdminFinancingReturns(
  financingId: string,
  params: { page?: number; size?: number } = {},
): Promise<ApiResponse<PageResult<MarketReturn>>> {
  const { data } = await coreApi.get<ApiResponse<PageResult<MarketReturn>>>(
    `/marketplace/private/get-admin-returns/${financingId}`,
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
      },
    },
  );
  return data;
}

export async function updateAdminFinancingPaymentStatus(
  financingId: string,
  status: "APPROVED" | "REJECTED",
  reason?: string,
): Promise<ApiResponse<MarketFinancing>> {
  const { data } = await coreApi.put<ApiResponse<MarketFinancing>>(
    `/marketplace/private/update-market-financing-payment-status/${financingId}`,
    null,
    {
      params: {
        status,
        ...(reason?.trim() ? { reason: reason.trim() } : {}),
      },
    },
  );
  return data;
}

/* ---- Echaris account details (admin) ---- */

export interface EcharisAccountDetails {
  id?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  version?: number | null;
  updatedAt?: string | null;
}

export async function getEcharisAccountDetails(): Promise<
  ApiResponse<EcharisAccountDetails | null>
> {
  const { data } = await coreApi.get<ApiResponse<EcharisAccountDetails | null>>(
    "/account-details/private/admin",
  );
  return data;
}

export async function updateEcharisAccountDetails(
  payload: Omit<EcharisAccountDetails, "id" | "updatedAt"> & {
    version?: number | null;
  },
): Promise<ApiResponse<EcharisAccountDetails>> {
  const { data } = await coreApi.put<ApiResponse<EcharisAccountDetails>>(
    "/account-details/private/admin",
    payload,
  );
  return data;
}
