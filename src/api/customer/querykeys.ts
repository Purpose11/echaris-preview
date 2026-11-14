import type { ListReferralsParams } from "@/api/customer/types";

export const customerKeys = {
  all: ["customer"] as const,
  profile: () => [...customerKeys.all, "profile"] as const,
  accountAccess: () => [...customerKeys.all, "account-access"] as const,
  kyc: () => [...customerKeys.all, "kyc"] as const,
  payoutAccount: () => [...customerKeys.all, "payout-account"] as const,
  referrals: (params: ListReferralsParams = {}) =>
    [...customerKeys.all, "referrals", params] as const,
};
