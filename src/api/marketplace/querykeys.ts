import type { ListFinancingsParams } from "@/api/marketplace/types";

export const marketplaceKeys = {
  all: ["marketplace"] as const,
  lists: () => [...marketplaceKeys.all, "list"] as const,
  list: (params: ListFinancingsParams = {}) =>
    [...marketplaceKeys.lists(), params] as const,
  detail: (id: string) => [...marketplaceKeys.all, "detail", id] as const,
  returns: (id: string, params: ListFinancingsParams = {}) =>
    [...marketplaceKeys.all, "returns", id, params] as const,
};
