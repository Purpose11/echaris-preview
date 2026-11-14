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
  kyc: (params: ListAdminKycParams = {}) => [...adminKeys.all, "kyc", params] as const,
  customerKyc: (customerId: string) =>
    [...adminKeys.all, "customer-kyc", customerId] as const,
};
