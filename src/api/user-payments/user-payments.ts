import { type ApiResponse, coreApi } from "@/api/api";
import type {
  ManualPayment,
  SubmitManualPaymentRequest,
} from "@/api/user-payments/types";

export async function submitManualPayment(
  payload: SubmitManualPaymentRequest,
): Promise<ApiResponse<ManualPayment>> {
  const { data } = await coreApi.post<ApiResponse<ManualPayment>>(
    "/user-payments/private",
    payload,
  );
  return data;
}
