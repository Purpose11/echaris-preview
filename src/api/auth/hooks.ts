import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { forgotPassword, login, logout } from "@/api/auth/auth";
import type { ForgotPasswordRequest, LoginRequest } from "@/api/auth/types";
import {
  Adminlogout,
  setAccessToken,
  setLoggedInUser,
  setRefreshToken,
} from "@/utils/authHelper";
import { normalizeError } from "@/utils/normalizeError";

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setLoggedInUser(data.user);
      toast.success("Logged in successfully");
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      Adminlogout();
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => forgotPassword(data),
    onSuccess: (data) => {
      toast.success(data.message ?? "Reset link sent. Check your email.");
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}
