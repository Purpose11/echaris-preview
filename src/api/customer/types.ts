export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export type Gender = "MALE" | "FEMALE" | "NON_BINARY";

export type UserOtpType = "ACCOUNT_ACTIVATION" | "PASSWORD_RESET";

export interface CustomerProfile {
  customerId: string;
  customerNumber: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  emailAddress: string;
  phoneNumber: string | null;
  profilePictureUrl: string | null;
  dateOfBirth: string | null;
  age: number | string | null;
  gender: Gender | null;
  referralCode?: string | null;
  active: boolean;
  verified: boolean;
  /** Present on login/profile — whether the customer has submitted KYC. */
  doneKyc?: boolean;
  marketingEmailsEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Verified referral row from GET /customer/private/referrals. */
export interface CustomerReferral {
  customerId: string;
  verifiedAt: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
}

export interface PageResult<T> {
  totalPage: number;
  numberOfElements: number;
  totalElements: number;
  data: T[];
}

export interface ListReferralsParams {
  page?: number;
  size?: number;
}

/** PATCH /customer/private/profile */
export interface UpdateCustomerProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  profilePictureUrl?: string | null;
  marketingEmailsEnabled?: boolean;
}

/** PATCH /customer/private/change-password */
export interface ChangeCustomerPasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/** POST /customer/private/payout-account */
export interface UpdatePayoutAccountRequest {
  bankName: string;
  accountName: string;
  accountNumber: string;
  amount: number;
}

export interface PayoutAccountDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  amount: number;
}

/** GET /customer/private/payout-account */
export interface CustomerPayoutAccount {
  details: PayoutAccountDetails;
  version: number;
  updatedAt: string;
}

export interface RegisterCustomerRequest {
  emailAddress: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  acceptedConsent: true;
  referralCode?: string | null;
}

export interface VerifyOtpRequest {
  emailAddress: string;
  otp: string;
}

export interface ResendOtpRequest {
  emailAddress: string;
  userOtpType: UserOtpType;
}

export interface CustomerLoginRequest {
  emailAddress: string;
  password: string;
}

export interface CustomerLoginData {
  accessToken: string;
  refreshToken: string;
  customer: CustomerProfile;
}

export interface ForgotPasswordRequest {
  emailAddress: string;
}

export interface ForgotPasswordData {
  userId: string;
  emailAddress: string;
  otpExpiresAt: string;
}

export interface ResetPasswordRequest {
  emailAddress: string;
  otp: string;
  newPassword: string;
}

export type KycDocumentType = "NIN" | "DRIVERS_LICENSE" | "INTERNATIONAL_PASSPORT";

export type KycReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SubmitKycRequest {
  documentType: KycDocumentType;
  documentNumber: string;
  frontViewUrl: string;
  backViewUrl: string;
}

export interface KycDocument {
  documentType: KycDocumentType;
  documentNumber: string;
  frontViewUrl: string;
  backViewUrl: string;
  submittedAt: string;
  submissionVersion: number;
  approved: boolean;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  reviewStatus: KycReviewStatus;
}

export interface CustomerKycData {
  customerId: string;
  doneKyc: boolean;
  kycAccepted: boolean;
  kycDocuments: KycDocument[];
}
