import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { createOrUpdateAddress } from "@/api/addresses/addresses";
import type { CreateOrUpdateAddressRequest } from "@/api/addresses/types";
import { normalizeError } from "@/utils/normalizeError";

export function useCreateOrUpdateAddress() {
  return useMutation({
    mutationFn: (payload: CreateOrUpdateAddressRequest) => createOrUpdateAddress(payload),
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}
