import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";

import {
  createCommitment,
  getCurrentRate,
  getMyCommitment,
  listActiveDurations,
  listCommitmentReturns,
  listMyCommitments,
  startCommitmentFunding,
} from "@/api/commitments/commitments";
import { commitmentKeys } from "@/api/commitments/querykeys";
import type {
  CreateCommitmentRequest,
  InterestReturn,
  ListCommitmentsParams,
} from "@/api/commitments/types";
import { buildPerformanceChartSeries } from "@/lib/performance-returns";
import { getAccessToken } from "@/utils/authHelper";
import { normalizeError } from "@/utils/normalizeError";

export function useMyCommitments(params: ListCommitmentsParams = {}) {
  return useQuery({
    queryKey: commitmentKeys.list(params),
    queryFn: () => listMyCommitments(params),
    enabled: Boolean(getAccessToken()),
  });
}

function isFundedCommitmentStatus(status: string | null | undefined) {
  const normalized = String(status ?? "")
    .trim()
    .toUpperCase();
  return (
    normalized === "LOCKED" ||
    normalized === "ACTIVE" ||
    normalized === "COMPLETED" ||
    normalized === "COMPLETE"
  );
}

/** Commitments plus per-program returns, shaped for the overview chart. */
export function useCommitmentsPerformance() {
  const commitmentsQuery = useMyCommitments({ page: 1, size: 100 });
  const commitments = commitmentsQuery.data?.data?.data ?? [];

  const fundedIds = useMemo(
    () =>
      commitments
        .filter((item) => isFundedCommitmentStatus(item.status))
        .map((item) => item.id),
    [commitments],
  );

  const returnsQueries = useQueries({
    queries: fundedIds.map((id) => ({
      queryKey: commitmentKeys.returns(id),
      queryFn: () => listCommitmentReturns(id),
      enabled: Boolean(getAccessToken() && id),
    })),
  });

  const returnsByCommitmentId = useMemo(() => {
    const map: Record<string, InterestReturn[]> = {};
    fundedIds.forEach((id, index) => {
      map[id] = returnsQueries[index]?.data?.data ?? [];
    });
    return map;
  }, [fundedIds, returnsQueries]);

  const series = useMemo(
    () => buildPerformanceChartSeries(commitments, returnsByCommitmentId),
    [commitments, returnsByCommitmentId],
  );

  const returnsLoading = returnsQueries.some((query) => query.isLoading);
  const returnsFetching = returnsQueries.some((query) => query.isFetching);

  return {
    series,
    commitments,
    isLoading: commitmentsQuery.isLoading || (fundedIds.length > 0 && returnsLoading),
    isFetching: commitmentsQuery.isFetching || returnsFetching,
    isError: commitmentsQuery.isError,
    error: commitmentsQuery.error,
    refetch: () => {
      void commitmentsQuery.refetch();
      returnsQueries.forEach((query) => {
        void query.refetch();
      });
    },
  };
}

export function useMyCommitment(commitmentId: string | undefined) {
  return useQuery({
    queryKey: commitmentKeys.detail(commitmentId ?? ""),
    queryFn: () => getMyCommitment(commitmentId as string),
    enabled: Boolean(getAccessToken() && commitmentId),
  });
}

export function useCommitmentReturns(commitmentId: string | undefined) {
  return useQuery({
    queryKey: commitmentKeys.returns(commitmentId ?? ""),
    queryFn: () => listCommitmentReturns(commitmentId as string),
    enabled: Boolean(getAccessToken() && commitmentId),
  });
}

export function useCommitmentDurations() {
  return useQuery({
    queryKey: commitmentKeys.durations(),
    queryFn: listActiveDurations,
    enabled: Boolean(getAccessToken()),
  });
}

export function useCommitmentRate() {
  return useQuery({
    queryKey: commitmentKeys.rate(),
    queryFn: getCurrentRate,
    enabled: Boolean(getAccessToken()),
  });
}

export function useCreateCommitment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCommitmentRequest) => createCommitment(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commitmentKeys.lists() });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}

export function useFundCommitment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commitmentId,
      idempotencyKey,
    }: {
      commitmentId: string;
      idempotencyKey: string;
    }) => startCommitmentFunding(commitmentId, idempotencyKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commitmentKeys.lists() });
    },
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}
