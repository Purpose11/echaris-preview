import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  activateAdmin,
  activateCustomer,
  approveAdminKyc,
  changeAdminPassword,
  countActiveAdmins,
  countAdmins,
  countInactiveAdmins,
  createAdmin,
  deactivateAdmin,
  deactivateCustomer,
  deleteAdmin,
  deleteCustomer,
  filterAdminCustomers,
  forgotAdminPassword,
  getAdmin,
  getAdminCustomer,
  getAdminCustomerKyc,
  getAdminMe,
  listAdminCustomers,
  listAdminKyc,
  listAdminsPaged,
  loginAdmin,
  rejectAdminKyc,
  resetAdminPassword,
  updateAdminProfile,
} from "@/api/admin/admin";
import {
  createAdminCategory,
  type CreateAdminCategoryRequest,
  createAdminProduct,
  type CreateAdminProductRequest,
  deactivateAdminCategory,
  deactivateAdminProduct,
  filterAdminProducts,
  type FilterAdminProductsParams,
  getAdminCategory,
  getAdminCommitmentRate,
  getAdminCustomerPayoutAccount,
  getAdminFinancing,
  getAdminPayment,
  getAdminProduct,
  getEcharisAccountDetails,
  listAdminCategories,
  listAdminCommitments,
  type ListAdminCommitmentsParams,
  listAdminCustomerPayouts,
  type ListAdminCustomerPayoutsParams,
  listAdminFinancings,
  type ListAdminFinancingsParams,
  listAdminPayments,
  type ListAdminPaymentsParams,
  listAdminProducts,
  type ListAdminProductsParams,
  recordAdminCustomerPayout,
  type RecordAdminCustomerPayoutRequest,
  replaceAdminCategory,
  type ReplaceAdminCategoryRequest,
  replaceAdminProduct,
  type ReplaceAdminProductRequest,
  updateAdminCommitmentRate,
  type UpdateAdminCommitmentRateRequest,
  updateAdminFinancingPaymentStatus,
  updateAdminFulfillmentStatus,
  updateAdminPaymentStatus,
  updateEcharisAccountDetails,
} from "@/api/admin/domain";
import { adminKeys } from "@/api/admin/querykeys";
import type {
  AdminForgotPasswordRequest,
  AdminLoginRequest,
  AdminProfile,
  AdminResetPasswordRequest,
  ApproveKycRequest,
  ChangeAdminPasswordRequest,
  CreateAdminRequest,
  FilterAdminCustomersParams,
  ListAdminCustomersParams,
  ListAdminKycParams,
  ListAdminsParams,
  RejectKycRequest,
  UpdateAdminProfileRequest,
} from "@/api/admin/types";
import type { MarketFulfillmentStatus } from "@/api/marketplace/types";
import {
  Adminlogout,
  getAccessToken,
  setAccessToken,
  setLoggedInUser,
  setRefreshToken,
} from "@/utils/authHelper";
import { normalizeError } from "@/utils/normalizeError";

function persistAdminSession(
  accessToken: string,
  refreshToken: string,
  admin: AdminProfile,
) {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
  const isSuper =
    admin.superAdmin === true || String(admin.userType).toUpperCase() === "SUPER_ADMIN";
  setLoggedInUser({
    id: admin.userId || admin.adminId,
    email: admin.emailAddress,
    firstName: admin.firstName ?? "",
    lastName: admin.lastName ?? "",
    userType: isSuper ? "SUPER_ADMIN" : "ADMIN",
  });
}

/* ---- Auth ---- */

export function useLoginAdmin() {
  return useMutation({
    mutationFn: (payload: AdminLoginRequest) => loginAdmin(payload),
    onSuccess: (data) => {
      if (data?.accessToken && data?.admin) {
        persistAdminSession(data.accessToken, data.refreshToken, data.admin);
      }
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useForgotAdminPassword() {
  return useMutation({
    mutationFn: (payload: AdminForgotPasswordRequest) => forgotAdminPassword(payload),
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useResetAdminPassword() {
  return useMutation({
    mutationFn: (payload: AdminResetPasswordRequest) => resetAdminPassword(payload),
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useAdminMe(enabled = true) {
  return useQuery({
    queryKey: adminKeys.me(),
    queryFn: getAdminMe,
    enabled: enabled && Boolean(getAccessToken()),
  });
}

export function useUpdateAdminProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAdminProfileRequest) => updateAdminProfile(payload),
    onSuccess: (res) => {
      if (res.success && res.data) {
        queryClient.setQueryData(adminKeys.me(), res.data);
        const isSuper =
          res.data.superAdmin === true ||
          String(res.data.userType).toUpperCase() === "SUPER_ADMIN";
        setLoggedInUser({
          id: res.data.userId || res.data.adminId,
          email: res.data.emailAddress,
          firstName: res.data.firstName ?? "",
          lastName: res.data.lastName ?? "",
          userType: isSuper ? "SUPER_ADMIN" : "ADMIN",
        });
        toast.success(res.message || "Profile updated");
      }
      void queryClient.invalidateQueries({ queryKey: adminKeys.me() });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useChangeAdminPassword() {
  return useMutation({
    mutationFn: (payload: ChangeAdminPasswordRequest) => changeAdminPassword(payload),
    onSuccess: (res) => {
      toast.success(
        res.message ||
          "Password changed successfully. Please log in with your new password.",
      );
      Adminlogout();
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

/* ---- Customers ---- */

function hasCustomerFilters(params: FilterAdminCustomersParams) {
  return (
    params.active !== undefined ||
    params.verified !== undefined ||
    Boolean(params.gender) ||
    params.marketingEmailsEnabled !== undefined ||
    Boolean(params.registeredFrom?.trim()) ||
    Boolean(params.registeredTo?.trim())
  );
}

export function useAdminCustomers(
  params: ListAdminCustomersParams | FilterAdminCustomersParams = {},
  enabled = true,
) {
  const filterParams = params as FilterAdminCustomersParams;
  const useFilter = hasCustomerFilters(filterParams);

  return useQuery({
    queryKey: adminKeys.customers(params),
    queryFn: () =>
      useFilter ? filterAdminCustomers(filterParams) : listAdminCustomers(params),
    enabled,
  });
}

export function useAdminCustomer(customerId: string, enabled = true) {
  return useQuery({
    queryKey: adminKeys.customerDetail(customerId),
    queryFn: () => getAdminCustomer(customerId),
    enabled: enabled && Boolean(customerId),
  });
}

export function useAdminCustomerPayoutAccount(userId: string, enabled = true) {
  return useQuery({
    queryKey: adminKeys.customerPayoutAccount(userId),
    queryFn: () => getAdminCustomerPayoutAccount(userId),
    enabled: enabled && Boolean(userId),
  });
}

export function useActivateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customerId: string) => activateCustomer(customerId),
    onSuccess: (res, customerId) => {
      toast.success(res.message || "Customer activated");
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "customers"],
      });
      void queryClient.invalidateQueries({
        queryKey: adminKeys.customerDetail(customerId),
      });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useDeactivateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customerId: string) => deactivateCustomer(customerId),
    onSuccess: (res, customerId) => {
      toast.success(res.message || "Customer deactivated");
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "customers"],
      });
      void queryClient.invalidateQueries({
        queryKey: adminKeys.customerDetail(customerId),
      });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customerId: string) => deleteCustomer(customerId),
    onSuccess: (res) => {
      toast.success(res.message || "Customer deleted successfully");
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "customers"],
      });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

/* ---- KYC ---- */

export function useAdminKycList(params: ListAdminKycParams = {}, enabled = true) {
  return useQuery({
    queryKey: adminKeys.kyc(params),
    queryFn: () => listAdminKyc(params),
    enabled,
  });
}

export function useAdminCustomerKyc(customerId: string, enabled = true) {
  return useQuery({
    queryKey: adminKeys.customerKyc(customerId),
    queryFn: () => getAdminCustomerKyc(customerId),
    enabled: enabled && Boolean(customerId),
  });
}

export function useApproveAdminKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      documentType,
      payload,
    }: {
      customerId: string;
      documentType: string;
      payload: ApproveKycRequest;
    }) => approveAdminKyc(customerId, documentType, payload),
    onSuccess: (res, vars) => {
      toast.success(res.message || "KYC document approved");
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "kyc"],
      });
      void queryClient.invalidateQueries({
        queryKey: adminKeys.customerKyc(vars.customerId),
      });
      void queryClient.invalidateQueries({
        queryKey: adminKeys.customerDetail(vars.customerId),
      });
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "customers"],
      });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useRejectAdminKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      documentType,
      payload,
    }: {
      customerId: string;
      documentType: string;
      payload: RejectKycRequest;
    }) => rejectAdminKyc(customerId, documentType, payload),
    onSuccess: (res, vars) => {
      toast.success(res.message || "KYC document rejected");
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "kyc"],
      });
      void queryClient.invalidateQueries({
        queryKey: adminKeys.customerKyc(vars.customerId),
      });
      void queryClient.invalidateQueries({
        queryKey: adminKeys.customerDetail(vars.customerId),
      });
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "customers"],
      });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

/* ---- Admins (SUPER_ADMIN) ---- */

export function useAdminsList(params: ListAdminsParams = {}, enabled = true) {
  return useQuery({
    queryKey: adminKeys.admins(params),
    queryFn: () => listAdminsPaged(params),
    enabled: enabled && Boolean(getAccessToken()),
  });
}

export function useAdminDetail(adminId: string, enabled = true) {
  return useQuery({
    queryKey: adminKeys.adminDetail(adminId),
    queryFn: () => getAdmin(adminId),
    enabled: enabled && Boolean(adminId) && Boolean(getAccessToken()),
  });
}

export function useAdminCounts(enabled = true) {
  return useQuery({
    queryKey: adminKeys.adminCounts(),
    queryFn: async () => {
      const [total, active, inactive] = await Promise.all([
        countAdmins(),
        countActiveAdmins(),
        countInactiveAdmins(),
      ]);
      return { total, active, inactive };
    },
    enabled: enabled && Boolean(getAccessToken()),
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminRequest) => createAdmin(payload),
    onSuccess: () => {
      toast.success("Administrator created");
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "admins"] });
      void queryClient.invalidateQueries({ queryKey: adminKeys.adminCounts() });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useActivateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adminId: string) => activateAdmin(adminId),
    onSuccess: (res, adminId) => {
      toast.success("Administrator activated");
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "admins"] });
      void queryClient.invalidateQueries({ queryKey: adminKeys.adminDetail(adminId) });
      void queryClient.invalidateQueries({ queryKey: adminKeys.adminCounts() });
      return res;
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useDeactivateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adminId: string) => deactivateAdmin(adminId),
    onSuccess: (res, adminId) => {
      toast.success("Administrator deactivated");
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "admins"] });
      void queryClient.invalidateQueries({ queryKey: adminKeys.adminDetail(adminId) });
      void queryClient.invalidateQueries({ queryKey: adminKeys.adminCounts() });
      return res;
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adminId: string) => deleteAdmin(adminId),
    onSuccess: () => {
      toast.success("Administrator deleted");
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "admins"] });
      void queryClient.invalidateQueries({ queryKey: adminKeys.adminCounts() });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

/* ---- Products ---- */

function hasProductFilters(params: FilterAdminProductsParams) {
  return (
    Boolean(params.productId) ||
    params.active !== undefined ||
    params.madeToOrder !== undefined ||
    params.minPrice !== undefined ||
    params.maxPrice !== undefined ||
    params.price !== undefined ||
    params.minStockQuantity !== undefined ||
    params.maxStockQuantity !== undefined ||
    params.stockQuantity !== undefined ||
    Boolean(params.name?.trim()) ||
    Boolean(params.description?.trim()) ||
    Boolean(params.imageUrls?.length)
  );
}

export function useAdminProducts(
  params: ListAdminProductsParams | FilterAdminProductsParams = {},
  enabled = true,
) {
  const filterParams = params as FilterAdminProductsParams;
  const useFilter = hasProductFilters(filterParams);

  return useQuery({
    queryKey: adminKeys.products(params),
    queryFn: () =>
      useFilter ? filterAdminProducts(filterParams) : listAdminProducts(params),
    enabled,
  });
}

export function useAdminProduct(productId: string, enabled = true) {
  return useQuery({
    queryKey: adminKeys.productDetail(productId),
    queryFn: () => getAdminProduct(productId),
    enabled: enabled && Boolean(productId),
  });
}

export function useAdminProductCategories(enabled = true) {
  return useQuery({
    queryKey: adminKeys.productCategories(),
    queryFn: listAdminCategories,
    enabled,
  });
}

export function useAdminCategory(categoryId: string, enabled = true) {
  return useQuery({
    queryKey: adminKeys.categoryDetail(categoryId),
    queryFn: () => getAdminCategory(categoryId),
    enabled: enabled && Boolean(categoryId),
  });
}

export function useCreateAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminCategoryRequest) => createAdminCategory(payload),
    onSuccess: (res) => {
      toast.success(res.message || "Category created");
      void queryClient.invalidateQueries({
        queryKey: adminKeys.productCategories(),
      });
      if (res.data?.id) {
        void queryClient.invalidateQueries({
          queryKey: adminKeys.categoryDetail(res.data.id),
        });
      }
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useReplaceAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: ReplaceAdminCategoryRequest;
    }) => replaceAdminCategory(categoryId, payload),
    onSuccess: (res, vars) => {
      toast.success(res.message || "Category updated");
      void queryClient.invalidateQueries({
        queryKey: adminKeys.productCategories(),
      });
      void queryClient.invalidateQueries({
        queryKey: adminKeys.categoryDetail(vars.categoryId),
      });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useDeactivateAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => deactivateAdminCategory(categoryId),
    onSuccess: (res, categoryId) => {
      toast.success(res.message || "Category deactivated");
      void queryClient.invalidateQueries({
        queryKey: adminKeys.productCategories(),
      });
      void queryClient.invalidateQueries({
        queryKey: adminKeys.categoryDetail(categoryId),
      });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useCreateAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminProductRequest) => createAdminProduct(payload),
    onSuccess: (res) => {
      toast.success(res.message || "Product created");
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "products"],
      });
      if (res.data?.id) {
        void queryClient.invalidateQueries({
          queryKey: adminKeys.productDetail(res.data.id),
        });
      }
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useReplaceAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: string;
      payload: ReplaceAdminProductRequest;
    }) => replaceAdminProduct(productId, payload),
    onSuccess: (res, vars) => {
      toast.success(res.message || "Product updated");
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "products"],
      });
      void queryClient.invalidateQueries({
        queryKey: adminKeys.productDetail(vars.productId),
      });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useDeactivateAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => deactivateAdminProduct(productId),
    onSuccess: (res, productId) => {
      toast.success(res.message || "Product deactivated");
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "products"],
      });
      void queryClient.invalidateQueries({
        queryKey: adminKeys.productDetail(productId),
      });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useAdminCommitments(
  params: ListAdminCommitmentsParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: adminKeys.commitments(params as Record<string, unknown>),
    queryFn: () => listAdminCommitments(params),
    enabled,
  });
}

export function useAdminCommitmentRate(enabled = true) {
  return useQuery({
    queryKey: adminKeys.commitmentRate(),
    queryFn: getAdminCommitmentRate,
    enabled: enabled && Boolean(getAccessToken()),
  });
}

export function useUpdateAdminCommitmentRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAdminCommitmentRateRequest) =>
      updateAdminCommitmentRate(payload),
    onSuccess: (res) => {
      toast.success(res.message || "Monthly rate updated");
      if (res.data) {
        queryClient.setQueryData(adminKeys.commitmentRate(), res);
      }
      void queryClient.invalidateQueries({
        queryKey: adminKeys.commitmentRate(),
      });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useAdminPayments(params: ListAdminPaymentsParams = {}, enabled = true) {
  return useQuery({
    queryKey: adminKeys.payments(params as Record<string, unknown>),
    queryFn: () => listAdminPayments(params),
    enabled,
  });
}

export function useAdminPayment(paymentId: string, enabled = true) {
  return useQuery({
    queryKey: adminKeys.paymentDetail(paymentId),
    queryFn: () => getAdminPayment(paymentId),
    enabled: enabled && Boolean(paymentId) && Boolean(getAccessToken()),
  });
}

export function useUpdateAdminPaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userPaymentId,
      status,
      reason,
    }: {
      userPaymentId: string;
      status: "APPROVED" | "REJECTED";
      reason?: string;
    }) => updateAdminPaymentStatus(userPaymentId, status, reason),
    onSuccess: (res, variables) => {
      toast.success(res.message || "Payment status updated");
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "payments"],
      });
      void queryClient.invalidateQueries({
        queryKey: adminKeys.paymentDetail(variables.userPaymentId),
      });
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "financings"],
      });
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "commitments"],
      });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useAdminCustomerPayouts(
  params: ListAdminCustomerPayoutsParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: adminKeys.customerPayouts(params as Record<string, unknown>),
    queryFn: () => listAdminCustomerPayouts(params),
    enabled,
  });
}

export function useRecordAdminCustomerPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordAdminCustomerPayoutRequest) =>
      recordAdminCustomerPayout(payload),
    onSuccess: (res) => {
      toast.success(res.message || "Customer payout recorded");
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "customer-payouts"],
      });
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "payments"],
      });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useAdminFinancings(
  params: ListAdminFinancingsParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: adminKeys.financings(params as Record<string, unknown>),
    queryFn: () => listAdminFinancings(params),
    enabled,
  });
}

export function useAdminFinancing(financingId: string, enabled = true) {
  return useQuery({
    queryKey: adminKeys.financingDetail(financingId),
    queryFn: () => getAdminFinancing(financingId),
    enabled: enabled && Boolean(financingId),
  });
}

export function useUpdateAdminFinancingPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      financingId,
      status,
      reason,
    }: {
      financingId: string;
      status: "APPROVED" | "REJECTED";
      reason?: string;
    }) => updateAdminFinancingPaymentStatus(financingId, status, reason),
    onSuccess: (res, variables) => {
      toast.success(res.message || "Payment status updated");
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "financings"],
      });
      void queryClient.invalidateQueries({
        queryKey: adminKeys.financingDetail(variables.financingId),
      });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useUpdateAdminFulfillmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      financingId,
      status,
    }: {
      financingId: string;
      status: MarketFulfillmentStatus;
    }) => updateAdminFulfillmentStatus(financingId, status),
    onSuccess: (res, variables) => {
      toast.success(res.message || "Fulfillment status updated");
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "financings"],
      });
      void queryClient.invalidateQueries({
        queryKey: adminKeys.financingDetail(variables.financingId),
      });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useEcharisAccountDetails(enabled = true) {
  return useQuery({
    queryKey: [...adminKeys.all, "account-details"] as const,
    queryFn: getEcharisAccountDetails,
    enabled: enabled && Boolean(getAccessToken()),
  });
}

export function useUpdateEcharisAccountDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEcharisAccountDetails,
    onSuccess: (res) => {
      toast.success(res.message || "Account details saved");
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "account-details"],
      });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}
