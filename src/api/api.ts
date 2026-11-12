import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  Adminlogout,
  getAccessToken,
  getAdminRole,
  UserLogout,
} from "@/utils/authHelper";

const BASE_URL = import.meta.env.VITE_BASE_URL ?? "";
const API_KEY =
  import.meta.env.VITE_ECHARIS_API_KEY ||
  import.meta.env.VITE_MANDATE_SPORT_API_KEY ||
  "";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logoutForSession() {
  const role = getAdminRole();
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    Adminlogout();
  } else {
    UserLogout();
  }
}

function createApi(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(API_KEY ? { "x-api-key": API_KEY } : {}),
    },
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (config.data instanceof FormData) {
      config.headers.delete("Content-Type");
    }

    const token = getAccessToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    if (API_KEY) {
      config.headers.set("x-api-key", API_KEY);
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as
        (InternalAxiosRequestConfig & { _retryCount?: number }) | undefined;

      if (!original) {
        return Promise.reject(error);
      }

      /* No refresh-token route in this API — expire session on 401 for private calls */
      if (error.response?.status === 401) {
        const url = original.url ?? "";
        const isPublic = url.includes("/public/") || url.includes("/utilities/public/");
        if (!isPublic && getAccessToken()) {
          logoutForSession();
        }
        return Promise.reject(error);
      }

      const method = (original.method ?? "get").toLowerCase();
      const retriableMethod = method === "get" || method === "head";
      const status = error.response?.status;
      const isTransient =
        !error.response ||
        (typeof status === "number" && status >= 500) ||
        error.code === "ECONNABORTED";

      original._retryCount = original._retryCount ?? 0;
      if (retriableMethod && isTransient && original._retryCount < 3) {
        original._retryCount += 1;
        await sleep(2 ** original._retryCount * 200);
        return instance(original);
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

export const coreApi = createApi(BASE_URL);

export { createApi };
export default createApi;
