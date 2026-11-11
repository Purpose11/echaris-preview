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
