export const customerKeys = {
  all: ["customer"] as const,
  profile: () => [...customerKeys.all, "profile"] as const,
  accountAccess: () => [...customerKeys.all, "account-access"] as const,
  kyc: () => [...customerKeys.all, "kyc"] as const,
};
