import type {
  FilterAdminProductsParams,
  ListAdminProductsParams,
} from "@/api/admin/domain";
import type {
  FilterAdminCustomersParams,
  ListAdminCustomersParams,
  ListAdminKycParams,
  ListAdminsParams,
} from "@/api/admin/types";

export const adminKeys = {
  all: ["admin"] as const,
  me: () => [...adminKeys.all, "me"] as const,
  admins: (params: ListAdminsParams = {}) =>
    [...adminKeys.all, "admins", params] as const,
  adminDetail: (adminId: string) => [...adminKeys.all, "admin", adminId] as const,
  adminCounts: () => [...adminKeys.all, "counts"] as const,
  customers: (params: ListAdminCustomersParams | FilterAdminCustomersParams = {}) =>
    [...adminKeys.all, "customers", params] as const,
  customerDetail: (customerId: string) =>
    [...adminKeys.all, "customer", customerId] as const,
  customerPayoutAccount: (userId: string) =>
    [...adminKeys.all, "customer-payout-account", userId] as const,
  customerPayouts: (params: Record<string, unknown> = {}) =>
    [...adminKeys.all, "customer-payouts", params] as const,
  kyc: (params: ListAdminKycParams = {}) => [...adminKeys.all, "kyc", params] as const,
  customerKyc: (customerId: string) =>
    [...adminKeys.all, "customer-kyc", customerId] as const,
  products: (params: ListAdminProductsParams | FilterAdminProductsParams = {}) =>
    [...adminKeys.all, "products", params] as const,
  productDetail: (productId: string) => [...adminKeys.all, "product", productId] as const,
  productCategories: () => [...adminKeys.all, "product-categories"] as const,
  categoryDetail: (categoryId: string) =>
    [...adminKeys.all, "category", categoryId] as const,
  commitments: (params: Record<string, unknown> = {}) =>
    [...adminKeys.all, "commitments", params] as const,
  commitmentRate: () => [...adminKeys.all, "commitment-rate"] as const,
  financings: (params: Record<string, unknown> = {}) =>
    [...adminKeys.all, "financings", params] as const,
  financingDetail: (financingId: string) =>
    [...adminKeys.all, "financing", financingId] as const,
};
