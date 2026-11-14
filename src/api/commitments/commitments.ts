import { type ApiResponse, coreApi } from "@/api/api";
import type {
  Commitment,
  CommitmentDuration,
  CommitmentRate,
  CreateCommitmentRequest,
  FundingTransaction,
  InterestReturn,
  ListCommitmentsParams,
  PageResult,
} from "@/api/commitments/types";

export async function listMyCommitments(
  params: ListCommitmentsParams = {},
): Promise<ApiResponse<PageResult<Commitment>>> {
  const { data } = await coreApi.get<ApiResponse<PageResult<Commitment>>>(
    "/commitments/private",
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
      },
    },
  );
  return data;
}

export async function createCommitment(
  payload: CreateCommitmentRequest,
): Promise<ApiResponse<Commitment>> {
  const { data } = await coreApi.post<ApiResponse<Commitment>>(
    "/commitments/private",
    payload,
  );
  return data;
}

export async function startCommitmentFunding(
  commitmentId: string,
  idempotencyKey: string,
): Promise<ApiResponse<FundingTransaction>> {
  const { data } = await coreApi.post<ApiResponse<FundingTransaction>>(
    `/commitments/private/${commitmentId}/funding`,
    {},
    {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    },
  );
  return data;
}

export async function getMyCommitment(
  commitmentId: string,
): Promise<ApiResponse<Commitment>> {
  const { data } = await coreApi.get<ApiResponse<Commitment>>(
    `/commitments/private/${commitmentId}`,
  );
  return data;
}

export async function listCommitmentReturns(
  commitmentId: string,
): Promise<ApiResponse<InterestReturn[]>> {
  const { data } = await coreApi.get<ApiResponse<InterestReturn[]>>(
    `/commitments/private/${commitmentId}/returns`,
  );
  return data;
}

export async function listActiveDurations(): Promise<ApiResponse<CommitmentDuration[]>> {
  const { data } = await coreApi.get<ApiResponse<CommitmentDuration[]>>(
    "/commitments/private/durations",
  );
  return data;
}

export async function getCurrentRate(): Promise<ApiResponse<CommitmentRate>> {
  const { data } = await coreApi.get<ApiResponse<CommitmentRate>>(
    "/commitments/private/rate",
  );
  return data;
}
