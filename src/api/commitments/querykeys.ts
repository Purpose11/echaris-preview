import type { ListCommitmentsParams } from "@/api/commitments/types";

export const commitmentKeys = {
  all: ["commitments"] as const,
  lists: () => [...commitmentKeys.all, "list"] as const,
  list: (params: ListCommitmentsParams = {}) =>
    [...commitmentKeys.lists(), params] as const,
  detail: (id: string) => [...commitmentKeys.all, "detail", id] as const,
  returns: (id: string) => [...commitmentKeys.all, "returns", id] as const,
  durations: () => [...commitmentKeys.all, "durations"] as const,
  rate: () => [...commitmentKeys.all, "rate"] as const,
};
