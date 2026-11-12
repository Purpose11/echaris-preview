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
  age: number | null;
  gender: Gender | null;
  active: boolean;
  verified: boolean;
  marketingEmailsEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
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
