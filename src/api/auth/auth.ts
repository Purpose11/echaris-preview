import { coreApi } from "@/api/api";
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
} from "@/api/auth/types";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await coreApi.post<LoginResponse>("/auth/login", data);
  return res.data;
}

export async function logout(): Promise<void> {
  await coreApi.post("/auth/logout");
}

export async function refreshToken(): Promise<RefreshResponse> {
  const res = await coreApi.post<RefreshResponse>("/auth/refresh");
  return res.data;
}

export async function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  const res = await coreApi.post<ForgotPasswordResponse>("/auth/forgot-password", data);
  return res.data;
}
