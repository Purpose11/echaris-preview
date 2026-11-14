export type ManualPaymentPurpose =
  "COMMITMENT" | "MARKETPLACE_FINANCING" | "ORDER" | "CUSTOMER_PAYOUT";

export type ManualPaymentReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SubmitManualPaymentRequest {
  purpose: ManualPaymentPurpose;
  targetId: string;
  amount: number;
  receiptUrls: string[];
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface ManualPayment {
  id: string;
  purpose: ManualPaymentPurpose | string;
  targetId: string;
  amount: number;
  receiptUrls: string[];
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  transferReference?: string | null;
  status: ManualPaymentReviewStatus | string;
  createdAt?: string | null;
}
