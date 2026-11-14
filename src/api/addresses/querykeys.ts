import type { ListAddressesParams } from "@/api/addresses/types";

export const addressKeys = {
  all: ["addresses"] as const,
  lists: () => [...addressKeys.all, "list"] as const,
  list: (params: ListAddressesParams = {}) => [...addressKeys.lists(), params] as const,
};
