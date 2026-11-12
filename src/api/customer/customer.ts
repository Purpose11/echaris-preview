import { type ApiResponse, coreApi } from "@/api/api";
import type {
  CustomerKycData,
  CustomerLoginData,
  CustomerLoginRequest,
  CustomerProfile,
  ForgotPasswordData,
  ForgotPasswordRequest,
  RegisterCustomerRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  SubmitKycRequest,
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
