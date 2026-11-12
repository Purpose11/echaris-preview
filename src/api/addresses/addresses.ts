import type { AddressRecord, CreateOrUpdateAddressRequest } from "@/api/addresses/types";
import { type ApiResponse, coreApi } from "@/api/api";

export async function createOrUpdateAddress(
  payload: CreateOrUpdateAddressRequest,
): Promise<ApiResponse<AddressRecord>> {
  const { data } = await coreApi.post<ApiResponse<AddressRecord>>(
    "/addresses/private/create-or-update",
    payload,
  );
  return data;
}

export async function getAddressByUserId(
  userId: string,
): Promise<ApiResponse<AddressRecord>> {
  const { data } = await coreApi.get<ApiResponse<AddressRecord>>(
    `/addresses/private/user/${userId}`,
  );
  return data;
}
