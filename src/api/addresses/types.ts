export interface CreateOrUpdateAddressRequest {
  userId: string;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  addressLine?: string | null;
  addressLine2?: string | null;
  postalCode?: string | null;
}

export interface AddressRecord {
  addressId: string;
  userId: string;
  country: string | null;
  state: string | null;
  city: string | null;
  addressLine: string | null;
  addressLine2: string | null;
  postalCode: string | null;
}
