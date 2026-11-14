import type {
  Address,
  AddressRecord,
  CreateOrUpdateAddressRequest,
  ListAddressesParams,
} from "@/api/addresses/types";
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

/** API may return a bare array or a page object with `data`. */
export type AddressListPayload =
  Address[] | AddressRecord[] | { data?: Array<Address | AddressRecord> | null };

function toAddress(item: Address | AddressRecord): Address {
  const id = ("id" in item && item.id) || ("addressId" in item && item.addressId) || "";
  return {
    id: String(id),
    addressType: item.addressType,
    country: item.country,
    state: item.state,
    city: item.city,
    addressLine: item.addressLine,
    addressLine2: "addressLine2" in item ? item.addressLine2 : null,
    postalCode: "postalCode" in item ? item.postalCode : null,
    userId: item.userId ?? null,
  };
}

export function normalizeAddressList(
  payload: AddressListPayload | null | undefined,
): Address[] {
  if (!payload) return [];
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.data)
      ? payload.data
      : [];
  return rows.map(toAddress).filter((row) => Boolean(row.id));
}

export async function listAddresses(
  params: ListAddressesParams = {},
): Promise<ApiResponse<AddressListPayload>> {
  const { data } = await coreApi.get<ApiResponse<AddressListPayload>>(
    "/addresses/private",
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 50,
        ...(params.addressType ? { addressType: params.addressType } : {}),
      },
    },
  );
  return data;
}
