import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { commitmentKeys } from "@/api/commitments/querykeys";
import { marketplaceKeys } from "@/api/marketplace/querykeys";
import type { SubmitManualPaymentRequest } from "@/api/user-payments/types";
import { submitManualPayment } from "@/api/user-payments/user-payments";
import { normalizeError } from "@/utils/normalizeError";

export function useSubmitManualPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitManualPaymentRequest) => submitManualPayment(payload),
    onSuccess: (_res, vars) => {
      void queryClient.invalidateQueries({ queryKey: commitmentKeys.lists() });
      if (vars.purpose === "MARKETPLACE_FINANCING") {
        void queryClient.invalidateQueries({
          queryKey: marketplaceKeys.lists(),
        });
      }
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}
