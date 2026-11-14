import type { StoredUser } from "@/utils/authHelper";

/* ---- Admin features ---- */

export type AdminFeature =
  | "overview"
  | "customers"
  | "kyc"
  | "products"
  | "commitments"
  | "payments"
  | "marketplace"
  | "admins"
  | "settings";

export type AdminRole = Extract<StoredUser["userType"], "ADMIN" | "SUPER_ADMIN">;

export interface NavItem {
  label: string;
  path: string;
  feature: AdminFeature;
  icon: string;
}

export const ROLE_FEATURES: Record<AdminRole, readonly AdminFeature[]> = {
  SUPER_ADMIN: [
    "overview",
    "customers",
    "kyc",
    "products",
    "commitments",
    "payments",
    "marketplace",
    "admins",
    "settings",
  ],
  ADMIN: [
    "overview",
    "customers",
    "kyc",
    "products",
    "commitments",
    "payments",
    "marketplace",
    "settings",
  ],
};

export const ADMIN_NAV_ITEMS: readonly NavItem[] = [
  { label: "Overview", path: "/admin", feature: "overview", icon: "layout-grid" },
  { label: "Customers", path: "/admin/customers", feature: "customers", icon: "users" },
  { label: "KYC review", path: "/admin/kyc", feature: "kyc", icon: "id-card" },
  { label: "Products", path: "/admin/products", feature: "products", icon: "inbox" },
  {
    label: "Commitments",
    path: "/admin/commitments",
    feature: "commitments",
    icon: "trending-up",
  },
  { label: "Payments", path: "/admin/payments", feature: "payments", icon: "wallet" },
  {
    label: "Marketplace",
    path: "/admin/marketplace",
    feature: "marketplace",
    icon: "store",
  },
  { label: "Admins", path: "/admin/admins", feature: "admins", icon: "shield-check" },
  { label: "Settings", path: "/admin/settings", feature: "settings", icon: "settings" },
];

/** Longest / most-specific rules first */
export const PATH_FEATURE_RULES: Array<{ pattern: RegExp; feature: AdminFeature }> = [
  { pattern: /^\/admin\/customers(\/|$)/, feature: "customers" },
  { pattern: /^\/admin\/kyc(\/|$)/, feature: "kyc" },
  { pattern: /^\/admin\/products(\/|$)/, feature: "products" },
  { pattern: /^\/admin\/commitments(\/|$)/, feature: "commitments" },
  { pattern: /^\/admin\/payments(\/|$)/, feature: "payments" },
  { pattern: /^\/admin\/marketplace(\/|$)/, feature: "marketplace" },
  { pattern: /^\/admin\/admins(\/|$)/, feature: "admins" },
  { pattern: /^\/admin\/settings(\/|$)/, feature: "settings" },
  { pattern: /^\/admin\/?$/, feature: "overview" },
];

/* ---- User features ---- */

export type UserFeature =
  "overview" | "commitments" | "marketplace" | "referrals" | "settings";

export interface UserNavItem {
  label: string;
  path: string;
  feature: UserFeature;
  icon: string;
}

export const USER_NAV_ITEMS: readonly UserNavItem[] = [
  {
    label: "Overview",
    path: "/dashboard",
    feature: "overview",
    icon: "layout-grid",
  },
  {
    label: "Capital commitments",
    path: "/dashboard/commitments",
    feature: "commitments",
    icon: "trending-up",
  },
  {
    label: "Marketplace",
    path: "/dashboard/marketplace",
    feature: "marketplace",
    icon: "store",
  },
  {
    label: "Referrals",
    path: "/dashboard/referrals",
    feature: "referrals",
    icon: "users",
  },
  {
    label: "Settings",
    path: "/dashboard/settings",
    feature: "settings",
    icon: "settings",
  },
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
