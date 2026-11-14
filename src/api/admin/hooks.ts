import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  activateCustomer,
  approveAdminKyc,
  changeAdminPassword,
  countActiveAdmins,
  countAdmins,
  countInactiveAdmins,
  deactivateCustomer,
  filterAdminCustomers,
  forgotAdminPassword,
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
  getEcharisAccountDetails,
  listAdminCommitments,
  type ListAdminCommitmentsParams,
  listAdminFinancings,
  type ListAdminFinancingsParams,
  listAdminPayments,
  type ListAdminPaymentsParams,
  listAdminProducts,
  type ListAdminProductsParams,
  updateAdminFinancingPaymentStatus,
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
  FilterAdminCustomersParams,
  ListAdminCustomersParams,
  ListAdminKycParams,
  ListAdminsParams,
  RejectKycRequest,
  UpdateAdminProfileRequest,
} from "@/api/admin/types";
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

export function useAdminCustomers(
  params: ListAdminCustomersParams | FilterAdminCustomersParams = {},
  enabled = true,
) {
  const hasFilters =
    "active" in params ||
    "verified" in params ||
    "gender" in params ||
    "marketingEmailsEnabled" in params ||
    "registeredFrom" in params ||
    "registeredTo" in params;

  return useQuery({
    queryKey: adminKeys.customers(params),
    queryFn: () =>
      hasFilters
        ? filterAdminCustomers(params as FilterAdminCustomersParams)
        : listAdminCustomers(params),
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
    enabled,
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
    enabled,
  });
}

/* ---- Domain lists ---- */

export function useAdminProducts(params: ListAdminProductsParams = {}, enabled = true) {
  return useQuery({
    queryKey: [...adminKeys.all, "products", params] as const,
    queryFn: () => listAdminProducts(params),
    enabled,
  });
}

export function useAdminCommitments(
  params: ListAdminCommitmentsParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: [...adminKeys.all, "commitments", params] as const,
    queryFn: () => listAdminCommitments(params),
    enabled,
  });
}

export function useAdminPayments(params: ListAdminPaymentsParams = {}, enabled = true) {
  return useQuery({
    queryKey: [...adminKeys.all, "payments", params] as const,
    queryFn: () => listAdminPayments(params),
    enabled,
  });
}

export function useAdminFinancings(
  params: ListAdminFinancingsParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: [...adminKeys.all, "financings", params] as const,
    queryFn: () => listAdminFinancings(params),
    enabled,
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
    onSuccess: (res) => {
      toast.success(res.message || "Payment status updated");
      void queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "financings"],
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
