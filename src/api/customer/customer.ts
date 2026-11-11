import { type ApiResponse, coreApi } from "@/api/api";
import type {
  CustomerProfile,
  RegisterCustomerRequest,
  ResendOtpRequest,
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
