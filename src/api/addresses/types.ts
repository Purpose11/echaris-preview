export type AddressType = "DELIVERY" | "PICKUP" | string;

export interface CreateOrUpdateAddressRequest {
  addressType: AddressType;
  country: string;
  state: string;
  city: string;
  addressLine: string;
  addressLine2?: string | null;
  postalCode?: string | null;
  /** Required for admin delivery saves; omit when a customer saves their own address. */
  userId?: string;
}

export interface AddressRecord {
  addressId: string;
  userId: string;
  addressType: AddressType;
  country: string | null;
  state: string | null;
  city: string | null;
  addressLine: string | null;
  addressLine2: string | null;
  postalCode: string | null;
}

/** Catalog/list shape — API may use `id` or `addressId`. */
export interface Address {
  id: string;
  addressType: AddressType;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  addressLine?: string | null;
  addressLine2?: string | null;
  postalCode?: string | null;
  userId?: string | null;
}

export interface ListAddressesParams {
  page?: number;
  size?: number;
  addressType?: AddressType;
}
