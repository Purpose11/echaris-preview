import { type ApiResponse, coreApi } from "@/api/api";
import type {
  CreateMarketFinancingRequest,
  ListFinancingsParams,
  MarketFinancing,
  MarketReturn,
  PageResult,
  UpdateMarketFulfillmentRequest,
} from "@/api/marketplace/types";

export async function createMarketFinancing(
  payload: CreateMarketFinancingRequest,
): Promise<ApiResponse<MarketFinancing>> {
  const { data } = await coreApi.post<ApiResponse<MarketFinancing>>(
    "/marketplace/private/create-financing",
    payload,
  );
  return data;
}

export async function listMyFinancings(
  params: ListFinancingsParams = {},
): Promise<ApiResponse<PageResult<MarketFinancing>>> {
  const { data } = await coreApi.get<ApiResponse<PageResult<MarketFinancing>>>(
    "/marketplace/private/get-my-financings",
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
      },
    },
  );
  return data;
}

export async function getMyFinancing(
  financingId: string,
): Promise<ApiResponse<MarketFinancing>> {
  const { data } = await coreApi.get<ApiResponse<MarketFinancing>>(
    `/marketplace/private/get-my-financing/${financingId}`,
  );
  return data;
}

export async function listMyFinancingReturns(
  financingId: string,
  params: ListFinancingsParams = {},
): Promise<ApiResponse<PageResult<MarketReturn>>> {
  const { data } = await coreApi.get<ApiResponse<PageResult<MarketReturn>>>(
    `/marketplace/private/get-my-returns/${financingId}`,
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
      },
    },
  );
  return data;
}

export async function linkMarketFinancingPayment(
  financingId: string,
  userPaymentId: string,
): Promise<ApiResponse<MarketFinancing | null>> {
  const { data } = await coreApi.post<ApiResponse<MarketFinancing | null>>(
    `/marketplace/private/make-payment-for-market-financing/${financingId}/${userPaymentId}`,
  );
  return data;
}

export async function updateMarketFulfillment(
  financingId: string,
  payload: UpdateMarketFulfillmentRequest,
): Promise<ApiResponse<MarketFinancing>> {
  const { data } = await coreApi.put<ApiResponse<MarketFinancing>>(
    `/marketplace/private/update-fulfillment/${financingId}`,
    payload,
  );
  return data;
}

export async function requestMarketCapitalPayout(
  financingId: string,
): Promise<ApiResponse<MarketFinancing | null>> {
  const { data } = await coreApi.post<ApiResponse<MarketFinancing | null>>(
    `/marketplace/private/request-capital-payout/${financingId}`,
  );
  return data;
}
