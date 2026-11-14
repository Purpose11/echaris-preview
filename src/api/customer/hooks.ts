import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  changeCustomerPassword,
  forgotCustomerPassword,
  getCustomerKyc,
  getCustomerPayoutAccount,
  getCustomerProfile,
  listMyReferrals,
  loginCustomer,
  registerCustomer,
  resendCustomerOtp,
  resetCustomerPassword,
  submitCustomerKyc,
  updateCustomerPayoutAccount,
  updateCustomerProfile,
  verifyCustomerOtp,
} from "@/api/customer/customer";
import { customerKeys } from "@/api/customer/querykeys";
import type {
  ChangeCustomerPasswordRequest,
  CustomerLoginRequest,
  ForgotPasswordRequest,
  ListReferralsParams,
  RegisterCustomerRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  SubmitKycRequest,
  UpdateCustomerProfileRequest,
  UpdatePayoutAccountRequest,
  VerifyOtpRequest,
} from "@/api/customer/types";
import {
  getAccessToken,
  getLoggedInUser,
  setAccessToken,
  setLoggedInUser,
  setRefreshToken,
  setStoredDoneKyc,
  UserLogout,
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
    doneKyc?: boolean;
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
    doneKyc: Boolean(customer.doneKyc),
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

export function useCustomerProfile(enabled = true) {
  return useQuery({
    queryKey: customerKeys.profile(),
    queryFn: getCustomerProfile,
    enabled: enabled && Boolean(getAccessToken()),
  });
}

export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCustomerProfileRequest) => updateCustomerProfile(payload),
    onSuccess: (res) => {
      if (res.success && res.data) {
        queryClient.setQueryData(customerKeys.profile(), res);
        const existing = getLoggedInUser();
        if (existing) {
          setLoggedInUser({
            ...existing,
            firstName: res.data.firstName ?? existing.firstName,
            lastName: res.data.lastName ?? existing.lastName,
            email: res.data.emailAddress || existing.email,
          });
        }
        toast.success(res.message || "Profile updated successfully");
      }
      void queryClient.invalidateQueries({ queryKey: customerKeys.profile() });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useChangeCustomerPassword() {
  return useMutation({
    mutationFn: (payload: ChangeCustomerPasswordRequest) =>
      changeCustomerPassword(payload),
    onSuccess: (res) => {
      toast.success(
        res.message ||
          "Password changed successfully. Please log in with your new password.",
      );
      UserLogout();
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useCustomerPayoutAccount(enabled = true) {
  return useQuery({
    queryKey: customerKeys.payoutAccount(),
    queryFn: getCustomerPayoutAccount,
    enabled: enabled && Boolean(getAccessToken()),
    retry: false,
  });
}

export function useUpdateCustomerPayoutAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePayoutAccountRequest) =>
      updateCustomerPayoutAccount(payload),
    onSuccess: (res) => {
      if (res.success && res.data) {
        queryClient.setQueryData(customerKeys.payoutAccount(), res);
      }
      toast.success(res.message || "Payout account saved");
      void queryClient.invalidateQueries({
        queryKey: customerKeys.payoutAccount(),
      });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useMyReferrals(params: ListReferralsParams = {}) {
  return useQuery({
    queryKey: customerKeys.referrals(params),
    queryFn: () => listMyReferrals(params),
    enabled: Boolean(getAccessToken()),
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
        setStoredDoneKyc(Boolean(res.data.doneKyc ?? true));
      }
      void queryClient.invalidateQueries({ queryKey: customerKeys.kyc() });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export { persistCustomerSession };
