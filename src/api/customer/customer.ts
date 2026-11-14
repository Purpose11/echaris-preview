import { type ApiResponse, coreApi } from "@/api/api";
import type {
  ChangeCustomerPasswordRequest,
  CustomerKycData,
  CustomerLoginData,
  CustomerLoginRequest,
  CustomerPayoutAccount,
  CustomerProfile,
  CustomerReferral,
  ForgotPasswordData,
  ForgotPasswordRequest,
  ListReferralsParams,
  PageResult,
  RegisterCustomerRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  SubmitKycRequest,
  UpdateCustomerProfileRequest,
  UpdatePayoutAccountRequest,
  VerifyOtpRequest,
} from "@/api/customer/types";

export async function registerCustomer(
  payload: RegisterCustomerRequest,
): Promise<ApiResponse<null>> {
  const { data } = await coreApi.post<ApiResponse<null>>(
    "/customer/public/register",
    payload,
  );
  return data;
}

export async function verifyCustomerOtp(
  payload: VerifyOtpRequest,
): Promise<ApiResponse<CustomerProfile>> {
  const { data } = await coreApi.post<ApiResponse<CustomerProfile>>(
    "/customer/public/verify-otp",
    payload,
  );
  return data;
}

export async function resendCustomerOtp(
  payload: ResendOtpRequest,
): Promise<ApiResponse<null>> {
  const { data } = await coreApi.post<ApiResponse<null>>(
    "/customer/public/resend-otp",
    payload,
  );
  return data;
}

export async function loginCustomer(
  payload: CustomerLoginRequest,
): Promise<ApiResponse<CustomerLoginData>> {
  const { data } = await coreApi.post<ApiResponse<CustomerLoginData>>(
    "/customer/public/login",
    payload,
  );
  return data;
}

export async function forgotCustomerPassword(
  payload: ForgotPasswordRequest,
): Promise<ApiResponse<ForgotPasswordData>> {
  const { data } = await coreApi.post<ApiResponse<ForgotPasswordData>>(
    "/customer/public/forgot-password",
    payload,
  );
  return data;
}

export async function resetCustomerPassword(
  payload: ResetPasswordRequest,
): Promise<ApiResponse<null>> {
  const { data } = await coreApi.post<ApiResponse<null>>(
    "/customer/public/reset-password",
    payload,
  );
  return data;
}

export async function getCustomerProfile(): Promise<ApiResponse<CustomerProfile>> {
  const { data } = await coreApi.get<ApiResponse<CustomerProfile>>(
    "/customer/private/profile",
  );
  return data;
}

export async function updateCustomerProfile(
  payload: UpdateCustomerProfileRequest,
): Promise<ApiResponse<CustomerProfile>> {
  const { data } = await coreApi.patch<ApiResponse<CustomerProfile>>(
    "/customer/private/profile",
    payload,
  );
  return data;
}

export async function changeCustomerPassword(
  payload: ChangeCustomerPasswordRequest,
): Promise<ApiResponse<null>> {
  const { data } = await coreApi.patch<ApiResponse<null>>(
    "/customer/private/change-password",
    payload,
  );
  return data;
}

export async function getCustomerPayoutAccount(): Promise<
  ApiResponse<CustomerPayoutAccount | null>
> {
  try {
    const { data } = await coreApi.get<ApiResponse<CustomerPayoutAccount | null>>(
      "/customer/private/payout-account",
    );
    return data;
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 404) {
      return {
        success: true,
        message: "No payout account saved",
        data: null,
      };
    }
    throw error;
  }
}

export async function updateCustomerPayoutAccount(
  payload: UpdatePayoutAccountRequest,
): Promise<ApiResponse<CustomerPayoutAccount>> {
  const { data } = await coreApi.post<ApiResponse<CustomerPayoutAccount>>(
    "/customer/private/payout-account",
    payload,
  );
  return data;
}

export async function listMyReferrals(
  params: ListReferralsParams = {},
): Promise<ApiResponse<PageResult<CustomerReferral>>> {
  const { data } = await coreApi.get<ApiResponse<PageResult<CustomerReferral>>>(
    "/customer/private/referrals",
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 100,
      },
    },
  );
  return data;
}

export async function getCustomerKyc(): Promise<ApiResponse<CustomerKycData>> {
  const { data } = await coreApi.get<ApiResponse<CustomerKycData>>(
    "/customer/private/kyc",
  );
  return data;
}

export async function submitCustomerKyc(
  payload: SubmitKycRequest,
): Promise<ApiResponse<CustomerKycData>> {
  const { data } = await coreApi.post<ApiResponse<CustomerKycData>>(
    "/customer/private/kyc",
    payload,
  );
  return data;
}
