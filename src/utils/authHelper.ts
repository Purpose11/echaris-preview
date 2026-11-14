import { jwtDecode } from "jwt-decode";

import { queryClient } from "@/lib/queryClient";
import { getNavigator } from "@/utils/navigationHelper";

/* ---- Token / user storage keys ---- */
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

/* ---- Token helpers ---- */

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

/* ---- User helpers ---- */

export interface StoredUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: "ADMIN" | "SUPER_ADMIN" | "USER";
  /** From login `customer.doneKyc` — used to gate the dashboard without a KYC fetch. */
  doneKyc?: boolean;
}

export function getLoggedInUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function setLoggedInUser(user: StoredUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function setStoredDoneKyc(doneKyc: boolean) {
  const existing = getLoggedInUser();
  if (!existing) return;
  setLoggedInUser({ ...existing, doneKyc });
}

export function getStoredDoneKyc(): boolean {
  return Boolean(getLoggedInUser()?.doneKyc);
}

export function getAdminRole(): StoredUser["userType"] | null {
  return getLoggedInUser()?.userType ?? null;
}

/* ---- Auth status ---- */

interface JwtPayload {
  exp?: number;
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    if (!exp) return false;
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
}

/* ---- Logout ---- */

function clearAuthStorage() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  queryClient.clear();
}

export function Adminlogout() {
  clearAuthStorage();

  try {
    const navigate = getNavigator();
    navigate("/admin/login", { replace: true });
  } catch {
    window.location.href = "/admin/login";
  }
}

export function UserLogout() {
  clearAuthStorage();

  try {
    const navigate = getNavigator();
    navigate("/login", { replace: true });
  } catch {
    window.location.href = "/login";
  }
}
