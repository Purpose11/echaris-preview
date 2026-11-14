import type {
  AdminCustomer,
  AdminForgotPasswordRequest,
  AdminKycSubmission,
  AdminLoginRequest,
  AdminLoginResponse,
  AdminProfile,
  AdminResetPasswordRequest,
  ApproveKycRequest,
  ChangeAdminPasswordRequest,
  CreateAdminRequest,
  FilterAdminCustomersParams,
  ListAdminCustomersParams,
  ListAdminKycParams,
  ListAdminsParams,
  PageResult,
  RejectKycRequest,
  UpdateAdminProfileRequest,
} from "@/api/admin/types";
import { type ApiResponse, coreApi } from "@/api/api";

/* ---- Auth (public) ---- */

export async function loginAdmin(
  payload: AdminLoginRequest,
): Promise<AdminLoginResponse> {
  const { data } = await coreApi.post<AdminLoginResponse>("/admin/public/login", payload);
  return data;
}

export async function forgotAdminPassword(
  payload: AdminForgotPasswordRequest,
): Promise<{ message: string }> {
  const { data } = await coreApi.post<{ message: string }>(
    "/admin/public/forgot-password",
    payload,
  );
  return data;
}

export async function resetAdminPassword(
  payload: AdminResetPasswordRequest,
): Promise<void> {
  await coreApi.post("/admin/public/reset-password", payload);
}

/* ---- Profile ---- */

export async function getAdminMe(): Promise<AdminProfile> {
  const { data } = await coreApi.get<AdminProfile>("/admin/private/me");
  return data;
}

export async function updateAdminProfile(
  payload: UpdateAdminProfileRequest,
): Promise<ApiResponse<AdminProfile>> {
  const { data } = await coreApi.patch<ApiResponse<AdminProfile>>(
    "/admin/private/profile",
    payload,
  );
  return data;
}

export async function changeAdminPassword(
  payload: ChangeAdminPasswordRequest,
): Promise<ApiResponse<null>> {
  const { data } = await coreApi.patch<ApiResponse<null>>(
    "/admin/private/change-password",
    payload,
  );
  return data;
}

/* ---- SUPER_ADMIN account management ---- */

export async function listAdminsPaged(
  params: ListAdminsParams = {},
): Promise<ApiResponse<PageResult<AdminProfile>>> {
  const { data } = await coreApi.get<ApiResponse<PageResult<AdminProfile>>>(
    "/admin/private/portal/admins",
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
      },
    },
  );
  return data;
}

export async function createAdmin(payload: CreateAdminRequest): Promise<AdminProfile> {
  const { data } = await coreApi.post<AdminProfile>("/admin/private", payload);
  return data;
}

export async function getAdmin(adminId: string): Promise<AdminProfile> {
  const { data } = await coreApi.get<AdminProfile>(`/admin/private/${adminId}`);
  return data;
}

export async function activateAdmin(adminId: string): Promise<AdminProfile> {
  const { data } = await coreApi.patch<AdminProfile>(
    `/admin/private/${adminId}/activate`,
  );
  return data;
}

export async function deactivateAdmin(adminId: string): Promise<AdminProfile> {
  const { data } = await coreApi.patch<AdminProfile>(
    `/admin/private/${adminId}/deactivate`,
  );
  return data;
}

export async function deleteAdmin(adminId: string): Promise<void> {
  await coreApi.delete(`/admin/private/${adminId}`);
}

export async function countAdmins(): Promise<number> {
  const { data } = await coreApi.get<number>("/admin/private/count");
  return data;
}

export async function countActiveAdmins(): Promise<number> {
  const { data } = await coreApi.get<number>("/admin/private/count/active");
  return data;
}

export async function countInactiveAdmins(): Promise<number> {
  const { data } = await coreApi.get<number>("/admin/private/count/inactive");
  return data;
}

/* ---- Customers ---- */

export async function listAdminCustomers(
  params: ListAdminCustomersParams = {},
): Promise<ApiResponse<PageResult<AdminCustomer>>> {
  const { data } = await coreApi.get<ApiResponse<PageResult<AdminCustomer>>>(
    "/customer/private/admin",
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 10,
        ...(params.searchParam?.trim() ? { searchParam: params.searchParam.trim() } : {}),
      },
    },
  );
  return data;
}

export async function filterAdminCustomers(
  params: FilterAdminCustomersParams = {},
): Promise<ApiResponse<PageResult<AdminCustomer>>> {
  const { data } = await coreApi.post<ApiResponse<PageResult<AdminCustomer>>>(
    "/customer/private/admin/filter",
    null,
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 10,
        ...(params.searchParam?.trim() ? { searchParam: params.searchParam.trim() } : {}),
        ...(params.active !== undefined ? { active: params.active } : {}),
        ...(params.verified !== undefined ? { verified: params.verified } : {}),
        ...(params.gender ? { gender: params.gender } : {}),
        ...(params.marketingEmailsEnabled !== undefined
          ? { marketingEmailsEnabled: params.marketingEmailsEnabled }
          : {}),
        ...(params.registeredFrom ? { registeredFrom: params.registeredFrom } : {}),
        ...(params.registeredTo ? { registeredTo: params.registeredTo } : {}),
      },
    },
  );
  return data;
}

export async function getAdminCustomer(
  customerId: string,
): Promise<ApiResponse<AdminCustomer>> {
  const { data } = await coreApi.get<ApiResponse<AdminCustomer>>(
    `/customer/private/admin/${customerId}`,
  );
  return data;
}

export async function activateCustomer(
  customerId: string,
): Promise<ApiResponse<AdminCustomer>> {
  const { data } = await coreApi.patch<ApiResponse<AdminCustomer>>(
    `/customer/private/admin/${customerId}/activate`,
  );
  return data;
}

export async function deactivateCustomer(
  customerId: string,
): Promise<ApiResponse<AdminCustomer>> {
  const { data } = await coreApi.patch<ApiResponse<AdminCustomer>>(
    `/customer/private/admin/${customerId}/deactivate`,
  );
  return data;
}

export async function deleteCustomer(customerId: string): Promise<ApiResponse<null>> {
  const { data } = await coreApi.delete<ApiResponse<null>>(
    `/customer/private/admin/${customerId}`,
  );
  return data;
}

/* ---- KYC review ---- */

export async function listAdminKyc(
  params: ListAdminKycParams = {},
): Promise<ApiResponse<PageResult<AdminKycSubmission>>> {
  const { data } = await coreApi.get<ApiResponse<PageResult<AdminKycSubmission>>>(
    "/customer/private/admin/kyc",
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
        status: params.status ?? "PENDING",
      },
    },
  );
  return data;
}

export async function getAdminCustomerKyc(
  customerId: string,
): Promise<ApiResponse<AdminKycSubmission>> {
  const { data } = await coreApi.get<ApiResponse<AdminKycSubmission>>(
    `/customer/private/admin/${customerId}/kyc`,
  );
  return data;
}

export async function approveAdminKyc(
  customerId: string,
  documentType: string,
  payload: ApproveKycRequest,
): Promise<ApiResponse<AdminKycSubmission>> {
  const { data } = await coreApi.patch<ApiResponse<AdminKycSubmission>>(
    `/customer/private/admin/${customerId}/kyc/${documentType}/approve`,
    payload,
  );
  return data;
}

export async function rejectAdminKyc(
  customerId: string,
  documentType: string,
  payload: RejectKycRequest,
): Promise<ApiResponse<AdminKycSubmission>> {
  const { data } = await coreApi.patch<ApiResponse<AdminKycSubmission>>(
    `/customer/private/admin/${customerId}/kyc/${documentType}/reject`,
    payload,
  );
  return data;
}
