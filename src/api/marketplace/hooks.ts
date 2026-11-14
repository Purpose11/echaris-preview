import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createMarketFinancing,
  getMyFinancing,
  linkMarketFinancingPayment,
  listMyFinancingReturns,
  listMyFinancings,
  requestMarketCapitalPayout,
  updateMarketFulfillment,
} from "@/api/marketplace/marketplace";
import { marketplaceKeys } from "@/api/marketplace/querykeys";
import type {
  CreateMarketFinancingRequest,
  ListFinancingsParams,
  UpdateMarketFulfillmentRequest,
} from "@/api/marketplace/types";
import { getAccessToken } from "@/utils/authHelper";
import { normalizeError } from "@/utils/normalizeError";

export function useMyFinancings(params: ListFinancingsParams = {}) {
  return useQuery({
    queryKey: marketplaceKeys.list(params),
    queryFn: () => listMyFinancings(params),
    enabled: Boolean(getAccessToken()),
  });
}

export function useMyFinancing(financingId: string | undefined) {
  return useQuery({
    queryKey: marketplaceKeys.detail(financingId ?? ""),
    queryFn: () => getMyFinancing(financingId as string),
    enabled: Boolean(getAccessToken() && financingId),
  });
}

export function useMyFinancingReturns(
  financingId: string | undefined,
  params: ListFinancingsParams = {},
) {
  return useQuery({
    queryKey: marketplaceKeys.returns(financingId ?? "", params),
    queryFn: () => listMyFinancingReturns(financingId as string, params),
    enabled: Boolean(getAccessToken() && financingId),
  });
}

export function useCreateMarketFinancing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMarketFinancingRequest) => createMarketFinancing(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: marketplaceKeys.lists() });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useLinkMarketFinancingPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      financingId,
      userPaymentId,
    }: {
      financingId: string;
      userPaymentId: string;
    }) => linkMarketFinancingPayment(financingId, userPaymentId),
    onSuccess: (_res, vars) => {
      void queryClient.invalidateQueries({ queryKey: marketplaceKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: marketplaceKeys.detail(vars.financingId),
      });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useUpdateMarketFulfillment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      financingId,
      payload,
    }: {
      financingId: string;
      payload: UpdateMarketFulfillmentRequest;
    }) => updateMarketFulfillment(financingId, payload),
    onSuccess: (_res, vars) => {
      toast.success("Fulfillment updated");
      void queryClient.invalidateQueries({
        queryKey: marketplaceKeys.detail(vars.financingId),
      });
      void queryClient.invalidateQueries({ queryKey: marketplaceKeys.lists() });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useRequestMarketCapitalPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (financingId: string) => requestMarketCapitalPayout(financingId),
    onSuccess: (_res, financingId) => {
      toast.success("Capital payout requested");
      void queryClient.invalidateQueries({
        queryKey: marketplaceKeys.detail(financingId),
      });
      void queryClient.invalidateQueries({ queryKey: marketplaceKeys.lists() });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}
