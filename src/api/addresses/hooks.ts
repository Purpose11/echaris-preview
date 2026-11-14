import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createOrUpdateAddress, listAddresses } from "@/api/addresses/addresses";
import { addressKeys } from "@/api/addresses/querykeys";
import type {
  CreateOrUpdateAddressRequest,
  ListAddressesParams,
} from "@/api/addresses/types";
import { getAccessToken } from "@/utils/authHelper";
import { normalizeError } from "@/utils/normalizeError";

export function useCreateOrUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrUpdateAddressRequest) => createOrUpdateAddress(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useAddresses(params: ListAddressesParams = {}) {
  return useQuery({
    queryKey: addressKeys.list(params),
    queryFn: () => listAddresses(params),
    enabled: Boolean(getAccessToken()),
  });
}
