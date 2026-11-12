import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  forgotCustomerPassword,
  getCustomerKyc,
  loginCustomer,
  registerCustomer,
  resendCustomerOtp,
  resetCustomerPassword,
  submitCustomerKyc,
  verifyCustomerOtp,
} from "@/api/customer/customer";
import { customerKeys } from "@/api/customer/querykeys";
import type {
  CustomerLoginRequest,
  ForgotPasswordRequest,
  RegisterCustomerRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  SubmitKycRequest,
  VerifyOtpRequest,
} from "@/api/customer/types";
import {
  getAccessToken,
  setAccessToken,
  setLoggedInUser,
  setRefreshToken,
} from "@/utils/authHelper";
import { normalizeError } from "@/utils/normalizeError";

function persistCustomerSession(
  accessToken: string,
  refreshToken: string,
  customer: {
    userId: string;
    emailAddress: string;
    firstName: string | null;
    lastName: string | null;
  },
) {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
  setLoggedInUser({
    id: customer.userId,
    email: customer.emailAddress,
    firstName: customer.firstName ?? "",
    lastName: customer.lastName ?? "",
    userType: "USER",
  });
}

export function useRegisterCustomer() {
  return useMutation({
    mutationFn: (payload: RegisterCustomerRequest) => registerCustomer(payload),
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useVerifyCustomerOtp() {
  return useMutation({
    mutationFn: (payload: VerifyOtpRequest) => verifyCustomerOtp(payload),
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useResendCustomerOtp() {
  return useMutation({
    mutationFn: (payload: ResendOtpRequest) => resendCustomerOtp(payload),
    onSuccess: (res) => {
      toast.success(res.message || "Verification OTP sent successfully");
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useLoginCustomer() {
  return useMutation({
    mutationFn: (payload: CustomerLoginRequest) => loginCustomer(payload),
    onSuccess: (res) => {
      if (res.success && res.data) {
        persistCustomerSession(
          res.data.accessToken,
          res.data.refreshToken,
          res.data.customer,
        );
      }
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useForgotCustomerPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordRequest) => forgotCustomerPassword(payload),
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useResetCustomerPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordRequest) => resetCustomerPassword(payload),
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useCustomerKyc(enabled = true) {
  return useQuery({
    queryKey: customerKeys.kyc(),
    queryFn: getCustomerKyc,
    enabled: enabled && Boolean(getAccessToken()),
    retry: false,
  });
}

export function useSubmitCustomerKyc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitKycRequest) => submitCustomerKyc(payload),
    onSuccess: (res) => {
      if (res.success && res.data) {
        queryClient.setQueryData(customerKeys.kyc(), res);
      }
      void queryClient.invalidateQueries({ queryKey: customerKeys.kyc() });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export { persistCustomerSession };
