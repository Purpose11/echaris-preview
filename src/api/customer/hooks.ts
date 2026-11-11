import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  registerCustomer,
  resendCustomerOtp,
  verifyCustomerOtp,
} from "@/api/customer/customer";
import type {
  RegisterCustomerRequest,
  ResendOtpRequest,
  VerifyOtpRequest,
} from "@/api/customer/types";
import { normalizeError } from "@/utils/normalizeError";

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
