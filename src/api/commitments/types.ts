export type CommitmentStatus =
  "AWAITING_PAYMENT" | "LOCKED" | "COMPLETED" | "CANCELLED" | "PENDING";

export interface Commitment {
  id: string;
  name: string;
  capital: number;
  durationMonths: number;
  monthlyRate: number;
  status: CommitmentStatus | string;
  fundedAt: string | null;
  /** Present on some payloads when the API returns schedule bounds. */
  startDate?: string | null;
  maturityDate?: string | null;
  endDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PageResult<T> {
  totalPage: number;
  numberOfElements: number;
  totalElements: number;
  data: T[];
}

export interface ListCommitmentsParams {
  page?: number;
  size?: number;
}

export interface CommitmentDuration {
  id: string;
  durationMonths: number;
  active: boolean;
  version?: number;
}

export interface CommitmentRate {
  id: string;
  percentage: number;
  version: number;
  updatedBy?: string | null;
}

export interface CreateCommitmentRequest {
  name: string;
  capital: number;
  durationMonths: number;
  acceptedAgreement: boolean;
}

export interface FundingTransaction {
  id: string;
  commitmentId: string;
  direction: string;
  purpose: string;
  amount: number;
  reference: string;
  status: string;
  paymentUrl: string | null;
}

export type InterestReturnStatus =
  "AVAILABLE" | "PENDING" | "PAID" | "WITHDRAWN" | string;

export interface InterestReturn {
  id: string;
  commitmentId: string;
  monthNumber: number;
  amount: number;
  status: InterestReturnStatus;
}
