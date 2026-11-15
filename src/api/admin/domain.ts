import type { PageResult } from "@/api/admin/types";
import { type ApiResponse, coreApi } from "@/api/api";
import type {
  Commitment,
  CommitmentDuration,
  CommitmentRate,
} from "@/api/commitments/types";
import type {
  MarketFinancing,
  MarketFulfillmentStatus,
  MarketReturn,
} from "@/api/marketplace/types";
import type { Product, ProductCategory } from "@/api/products/types";

/* ---- Products (admin) ---- */

export interface ListAdminProductsParams {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: string;
}

export interface FilterAdminProductsParams {
  productId?: string;
  categoryId?: string;
  search?: string;
  name?: string;
  description?: string;
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  imageUrls?: string[];
  stockQuantity?: number;
  minStockQuantity?: number;
  maxStockQuantity?: number;
  madeToOrder?: boolean;
  active?: boolean;
  page?: number;
  size?: number;
}

export async function listAdminProducts(
  params: ListAdminProductsParams = {},
): Promise<ApiResponse<PageResult<Product>>> {
  const search = params.search?.trim().slice(0, 150);
  const { data } = await coreApi.get<ApiResponse<PageResult<Product>>>(
    "/product/private",
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
        ...(search ? { search } : {}),
        ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      },
    },
  );
  return data;
}

export async function filterAdminProducts(
  params: FilterAdminProductsParams = {},
): Promise<ApiResponse<PageResult<Product>>> {
  const search = params.search?.trim().slice(0, 150);
  const body: FilterAdminProductsParams = {
    page: params.page ?? 1,
    size: params.size ?? 20,
    ...(params.productId ? { productId: params.productId } : {}),
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(search ? { search } : {}),
    ...(params.name?.trim() ? { name: params.name.trim() } : {}),
    ...(params.description?.trim() ? { description: params.description.trim() } : {}),
    ...(params.price !== undefined ? { price: params.price } : {}),
    ...(params.minPrice !== undefined ? { minPrice: params.minPrice } : {}),
    ...(params.maxPrice !== undefined ? { maxPrice: params.maxPrice } : {}),
    ...(params.imageUrls?.length ? { imageUrls: params.imageUrls } : {}),
    ...(params.stockQuantity !== undefined
      ? { stockQuantity: params.stockQuantity }
      : {}),
    ...(params.minStockQuantity !== undefined
      ? { minStockQuantity: params.minStockQuantity }
      : {}),
    ...(params.maxStockQuantity !== undefined
      ? { maxStockQuantity: params.maxStockQuantity }
      : {}),
    ...(params.madeToOrder !== undefined ? { madeToOrder: params.madeToOrder } : {}),
    ...(params.active !== undefined ? { active: params.active } : {}),
  };

  const { data } = await coreApi.post<ApiResponse<PageResult<Product>>>(
    "/product/private/filter",
    body,
  );
  return data;
}

export async function getAdminProduct(productId: string): Promise<ApiResponse<Product>> {
  const { data } = await coreApi.get<ApiResponse<Product>>(
    `/product/private/${productId}`,
  );
  return data;
}

export interface CreateAdminProductRequest {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  imageUrls: string[];
  stockQuantity: number;
  madeToOrder: boolean;
  active: boolean;
}

export async function createAdminProduct(
  payload: CreateAdminProductRequest,
): Promise<ApiResponse<Product>> {
  const { data } = await coreApi.post<ApiResponse<Product>>("/product/private", payload);
  return data;
}

export type ReplaceAdminProductRequest = CreateAdminProductRequest;

export async function replaceAdminProduct(
  productId: string,
  payload: ReplaceAdminProductRequest,
): Promise<ApiResponse<Product>> {
  const { data } = await coreApi.put<ApiResponse<Product>>(
    `/product/private/${productId}`,
    payload,
  );
  return data;
}

export async function deactivateAdminProduct(
  productId: string,
): Promise<ApiResponse<null>> {
  const { data } = await coreApi.delete<ApiResponse<null>>(
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

export async function getAdminCategory(
  categoryId: string,
): Promise<ApiResponse<ProductCategory>> {
  const { data } = await coreApi.get<ApiResponse<ProductCategory>>(
    `/product/private/admin/categories/${categoryId}`,
  );
  return data;
}

export interface CreateAdminCategoryRequest {
  name: string;
  active: boolean;
}

export type ReplaceAdminCategoryRequest = CreateAdminCategoryRequest;

export async function createAdminCategory(
  payload: CreateAdminCategoryRequest,
): Promise<ApiResponse<ProductCategory>> {
  const { data } = await coreApi.post<ApiResponse<ProductCategory>>(
    "/product/private/categories",
    payload,
  );
  return data;
}

export async function replaceAdminCategory(
  categoryId: string,
  payload: ReplaceAdminCategoryRequest,
): Promise<ApiResponse<ProductCategory>> {
  const { data } = await coreApi.put<ApiResponse<ProductCategory>>(
    `/product/private/categories/${categoryId}`,
    payload,
  );
  return data;
}

export async function deactivateAdminCategory(
  categoryId: string,
): Promise<ApiResponse<null>> {
  const { data } = await coreApi.delete<ApiResponse<null>>(
    `/product/private/categories/${categoryId}`,
  );
  return data;
}

/* ---- Commitments (admin) ---- */

export interface AdminCommitment extends Commitment {
  customerId?: string | null;
  userId?: string | null;
  maturityAt?: string | null;
  capitalWithdrawnAt?: string | null;
  agreementAcceptedAt?: string | null;
  activeTransactionId?: string | null;
  version?: number | null;
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
        ...(params.userId?.trim() ? { userId: params.userId.trim() } : {}),
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

export interface UpdateAdminCommitmentRateRequest {
  percentage: number;
  version: number;
}

export async function updateAdminCommitmentRate(
  payload: UpdateAdminCommitmentRateRequest,
): Promise<ApiResponse<CommitmentRate>> {
  const { data } = await coreApi.patch<ApiResponse<CommitmentRate>>(
    "/commitments/private/admin/rate",
    payload,
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

export type AdminPaymentDirection = "INCOMING" | "OUTGOING" | string;

export interface AdminUserPayment {
  id: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  userId?: string | null;
  customerId?: string | null;
  purpose?: AdminPaymentPurpose | null;
  direction?: AdminPaymentDirection | null;
  payoutType?: string | null;
  targetId?: string | null;
  amount: number;
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  receiptUrls?: string[] | null;
  transferReference?: string | null;
  status: AdminPaymentStatus;
  recordedByUserId?: string | null;
  reviewedByUserId?: string | null;
  reviewedAt?: string | null;
  paidAt?: string | null;
  reasonForRejection?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
}

export interface ListAdminPaymentsParams {
  page?: number;
  size?: number;
  search?: string;
  status?: AdminPaymentStatus;
  customerUserId?: string;
  direction?: AdminPaymentDirection;
  purpose?: AdminPaymentPurpose;
}

export async function listAdminPayments(
  params: ListAdminPaymentsParams = {},
): Promise<ApiResponse<PageResult<AdminUserPayment>>> {
  const search = params.search?.trim().slice(0, 128);
  const { data } = await coreApi.get<ApiResponse<PageResult<AdminUserPayment>>>(
    "/user-payments/private/admin",
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
        ...(search ? { search } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.customerUserId?.trim()
          ? { customerUserId: params.customerUserId.trim() }
          : {}),
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

export async function updateAdminPaymentStatus(
  userPaymentId: string,
  status: "APPROVED" | "REJECTED",
  reason?: string,
): Promise<ApiResponse<AdminUserPayment>> {
  const trimmedReason = reason?.trim();
  if (status === "REJECTED" && !trimmedReason) {
    throw new Error("A rejection reason is required.");
  }

  const { data } = await coreApi.put<ApiResponse<AdminUserPayment>>(
    `/user-payments/private/admin/${userPaymentId}/update-status`,
    null,
    {
      params: {
        status,
        ...(status === "REJECTED" && trimmedReason ? { reason: trimmedReason } : {}),
      },
    },
  );
  return data;
}

export interface AdminPayoutAccountDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  amount?: number | null;
}

export interface AdminCustomerPayoutAccount {
  details: AdminPayoutAccountDetails;
  version: number;
}

export async function getAdminCustomerPayoutAccount(
  customerUserId: string,
): Promise<ApiResponse<AdminCustomerPayoutAccount>> {
  const { data } = await coreApi.get<ApiResponse<AdminCustomerPayoutAccount>>(
    `/user-payments/private/admin/payout-accounts/${customerUserId}`,
  );
  return data;
}

export type AdminPayoutType =
  "COMMITMENT_CAPITAL" | "COMMITMENT_RETURN" | "MARKETPLACE_CAPITAL" | string;

export interface AdminCustomerPayout {
  id: string;
  userId: string;
  purpose?: AdminPaymentPurpose | null;
  direction?: string | null;
  payoutType: AdminPayoutType;
  targetId: string;
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  amount: number;
  receiptUrls?: string[] | null;
  transferReference?: string | null;
  status: AdminPaymentStatus;
  recordedByUserId?: string | null;
  reviewedByUserId?: string | null;
  reviewedAt?: string | null;
  paidAt?: string | null;
  reasonForRejection?: string | null;
}

export interface ListAdminCustomerPayoutsParams {
  page?: number;
  size?: number;
  search?: string;
  status?: AdminPaymentStatus;
  customerUserId?: string;
}

export async function listAdminCustomerPayouts(
  params: ListAdminCustomerPayoutsParams = {},
): Promise<ApiResponse<PageResult<AdminCustomerPayout>>> {
  const search = params.search?.trim().slice(0, 128);
  const { data } = await coreApi.get<ApiResponse<PageResult<AdminCustomerPayout>>>(
    "/user-payments/private/admin/payouts",
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
        ...(search ? { search } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.customerUserId?.trim()
          ? { customerUserId: params.customerUserId.trim() }
          : {}),
      },
    },
  );
  return data;
}

export interface RecordAdminCustomerPayoutRequest {
  customerUserId: string;
  payoutAccountVersion: number;
  payoutType: AdminPayoutType;
  targetId: string;
  amount: number;
  receiptUrls: string[];
  transferReference: string;
  paidAt: string;
}

export async function recordAdminCustomerPayout(
  payload: RecordAdminCustomerPayoutRequest,
): Promise<ApiResponse<AdminCustomerPayout>> {
  const { data } = await coreApi.post<ApiResponse<AdminCustomerPayout>>(
    "/user-payments/private/admin/payouts",
    payload,
  );
  return data;
}

/* ---- Marketplace (admin) ---- */

export interface ListAdminFinancingsParams {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
}

export async function listAdminFinancings(
  params: ListAdminFinancingsParams = {},
): Promise<ApiResponse<PageResult<MarketFinancing>>> {
  const search = params.search?.trim();
  const { data } = await coreApi.get<ApiResponse<PageResult<MarketFinancing>>>(
    "/marketplace/private/admin/get-admin-financings",
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
        ...(params.status ? { status: params.status } : {}),
        ...(search ? { search } : {}),
      },
    },
  );
  return data;
}

export async function getAdminFinancing(
  financingId: string,
): Promise<ApiResponse<MarketFinancing>> {
  const { data } = await coreApi.get<ApiResponse<MarketFinancing>>(
    `/marketplace/private/admin/get-admin-financing/${financingId}`,
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

export async function updateAdminFulfillmentStatus(
  financingId: string,
  status: MarketFulfillmentStatus,
): Promise<ApiResponse<MarketFinancing>> {
  const { data } = await coreApi.put<ApiResponse<MarketFinancing>>(
    `/marketplace/private/admin/update-fulfillment-status/${financingId}`,
    { status },
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
