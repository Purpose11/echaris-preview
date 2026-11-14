export type FulfillmentType = "PICKUP" | "DELIVERY";

export type MarketFinancingStatus =
  | "AWAITING_PAYMENT"
  | "ACCUMULATING"
  | "ACTIVE"
  | "READY_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED"
  | string;

export type MarketFulfillmentStatus =
  "AWAITING_RELEASE" | "RELEASED" | "DELIVERED" | string;

export interface MarketFulfillment {
  type: FulfillmentType | string;
  pickupLocationId?: string | null;
  /** Address returned by get-my-financings / get-my-financing. */
  address?: string | null;
  /** Alias used when creating/updating fulfillment. */
  deliveryAddress?: string | null;
  phoneNumber?: string | null;
  status?: string | null;
}

export interface MarketFinancingProduct {
  id?: string;
  name?: string | null;
  price?: number | null;
  imageUrls?: string[] | null;
}

/** Row from GET /marketplace/private/get-my-financings. */
export interface MarketFinancing {
  id: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  userId?: string | null;
  productId?: string | null;
  name?: string | null;
  productQuantity?: number | null;
  /** Legacy/create alias — prefer productQuantity from list/detail responses. */
  quantity?: number | null;
  capital: number;
  agreementAccepted?: boolean;
  monthlyRate?: number | null;
  accumulatedReturns?: number | null;
  /** Legacy aliases kept for older payloads. */
  returnsAccumulated?: number | null;
  totalReturns?: number | null;
  status: MarketFinancingStatus;
  fulfillment?: MarketFulfillment | null;
  fulfillmentStatus?: MarketFulfillmentStatus | null;
  fulfillmentHistory?: unknown[] | null;
  agreementAcceptedAt?: string | null;
  fundingPaymentId?: string | null;
  approvedAt?: string | null;
  nextReturnAt?: string | null;
  releasedAt?: string | null;
  maturedAt?: string | null;
  capitalRequestedAt?: string | null;
  capitalPayoutId?: string | null;
  capitalPaidAt?: string | null;
  completed?: boolean;
  completedAt?: string | null;
  productName?: string | null;
  productPrice?: number | null;
  productValue?: number | null;
  product?: MarketFinancingProduct | null;
}

export interface MarketReturn {
  id: string;
  financingId?: string;
  monthNumber?: number;
  amount: number;
  status?: string | null;
  createdAt?: string | null;
}

export interface PageResult<T> {
  totalPage: number;
  numberOfElements: number;
  totalElements: number;
  data: T[];
}

export interface ListFinancingsParams {
  page?: number;
  size?: number;
}

export interface CreateMarketFinancingRequest {
  productId: string;
  quantity: number;
  name: string;
  capital: number;
  agreementAccepted: true;
  fulfillment: {
    type: FulfillmentType;
    pickupLocationId?: string;
    deliveryAddress?: string;
    phoneNumber?: string;
  };
}

export interface UpdateMarketFulfillmentRequest {
  type: FulfillmentType;
  pickupLocationId?: string;
  deliveryAddress?: string;
  phoneNumber?: string;
}
