import type { AxiosError } from "axios";

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export function normalizeError(error: unknown): string {
  if (typeof error === "string") return error;

  const axiosErr = error as AxiosError<ApiErrorResponse>;
  if (axiosErr?.isAxiosError && axiosErr.response?.data) {
    const data = axiosErr.response.data;
    return data.message ?? data.error ?? axiosErr.message;
  }

  if (error instanceof Error) return error.message;

  return "An unexpected error occurred.";
}
