import type { StoredUser } from "@/utils/authHelper";

/* ---- Admin features ---- */

export type AdminFeature =
  "overview" | "users" | "products" | "orders" | "settings" | "reports";

export type AdminRole = Extract<StoredUser["userType"], "ADMIN" | "SUPER_ADMIN">;

export interface NavItem {
  label: string;
  path: string;
  feature: AdminFeature;
}

export const ROLE_FEATURES: Record<AdminRole, readonly AdminFeature[]> = {
  SUPER_ADMIN: ["overview", "users", "products", "orders", "settings", "reports"],
  ADMIN: ["overview", "products", "orders"],
};

export const ADMIN_NAV_ITEMS: readonly NavItem[] = [
  { label: "Overview", path: "/admin", feature: "overview" },
  { label: "Users", path: "/admin/users", feature: "users" },
  { label: "Products", path: "/admin/products", feature: "products" },
  { label: "Orders", path: "/admin/orders", feature: "orders" },
  { label: "Reports", path: "/admin/reports", feature: "reports" },
  { label: "Settings", path: "/admin/settings", feature: "settings" },
];

/** Longest / most-specific rules first */
export const PATH_FEATURE_RULES: Array<{ pattern: RegExp; feature: AdminFeature }> = [
  { pattern: /^\/admin\/users(\/|$)/, feature: "users" },
  { pattern: /^\/admin\/products(\/|$)/, feature: "products" },
  { pattern: /^\/admin\/orders(\/|$)/, feature: "orders" },
  { pattern: /^\/admin\/reports(\/|$)/, feature: "reports" },
  { pattern: /^\/admin\/settings(\/|$)/, feature: "settings" },
  { pattern: /^\/admin\/?$/, feature: "overview" },
];

/* ---- User features ---- */

export type UserFeature = "overview" | "profile" | "orders" | "wallet";

export interface UserNavItem {
  label: string;
  path: string;
  feature: UserFeature;
}

export const USER_NAV_ITEMS: readonly UserNavItem[] = [
  { label: "Overview", path: "/dashboard", feature: "overview" },
  { label: "Profile", path: "/dashboard/profile", feature: "profile" },
  { label: "Orders", path: "/dashboard/orders", feature: "orders" },
  { label: "Wallet", path: "/dashboard/wallet", feature: "wallet" },
];

/* ---- Helpers ---- */

export function getFeatureForPath(pathname: string): AdminFeature | null {
  const match = PATH_FEATURE_RULES.find(({ pattern }) => pattern.test(pathname));
  return match?.feature ?? null;
}

export function getNavItemsForRole(role: AdminRole): readonly NavItem[] {
  const allowed = ROLE_FEATURES[role];
  return ADMIN_NAV_ITEMS.filter((item) => allowed.includes(item.feature));
}

export function getUnauthorizedRedirect(role: AdminRole): string {
  return getDefaultAdminRoute(role);
}

export function getDefaultAdminRoute(role: AdminRole): string {
  const items = getNavItemsForRole(role);
  return items[0]?.path ?? "/admin";
}

export function getDefaultUserRoute(): string {
  return "/dashboard";
}
