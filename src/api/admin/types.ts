export type AdminUserType = "ADMIN" | "SUPER_ADMIN";
export type Gender = "MALE" | "FEMALE" | "NON_BINARY";

export interface AdminProfile {
  adminId: string;
  userId: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
  gender?: Gender | null;
  age?: string | number | null;
  userType: AdminUserType | string;
  active: boolean;
  userActive?: boolean;
  userVerified?: boolean;
  superAdmin: boolean;
}

/** Raw login response — not wrapped in ApiEnvelope. */
export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: AdminProfile;
}

export interface AdminLoginRequest {
  emailAddress: string;
  password: string;
}

export interface AdminForgotPasswordRequest {
  emailAddress: string;
}

export interface AdminResetPasswordRequest {
  emailAddress: string;
  otp: string;
  newPassword: string;
}

export interface UpdateAdminProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
}

export interface ChangeAdminPasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface CreateAdminRequest {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
  profileColourCode?: string | null;
  gender?: Gender | null;
}

export interface PageResult<T> {
  totalPage: number;
  numberOfElements: number;
  totalElements: number;
  data: T[];
}

export interface ListAdminsParams {
  page?: number;
  size?: number;
}

export interface AdminCustomer {
  customerId: string;
  customerNumber?: string | null;
  referralCode?: string | null;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  emailAddress: string;
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
  age?: string | number | null;
  gender?: Gender | null;
  active: boolean;
  verified: boolean;
  doneKyc: boolean;
}

export interface ListAdminCustomersParams {
  page?: number;
  size?: number;
  searchParam?: string;
}

export interface FilterAdminCustomersParams extends ListAdminCustomersParams {
  active?: boolean;
  verified?: boolean;
  gender?: Gender;
  marketingEmailsEnabled?: boolean;
  registeredFrom?: string;
  registeredTo?: string;
}

export type KycReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type KycDocumentType = "NIN" | "DRIVERS_LICENSE" | "INTERNATIONAL_PASSPORT";

export interface AdminKycDocument {
  documentType: KycDocumentType | string;
  documentNumber: string;
  frontViewUrl: string;
  backViewUrl: string;
  submittedAt: string;
  submissionVersion: number;
  approved: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectedAt?: string | null;
  rejectedBy?: string | null;
  rejectionReason?: string | null;
  reviewStatus: KycReviewStatus | string;
}

export interface AdminKycSubmission {
  customerId: string;
  doneKyc: boolean;
  kycAccepted: boolean;
  kycDocuments: AdminKycDocument[];
}

export interface ListAdminKycParams {
  page?: number;
  size?: number;
  status?: KycReviewStatus;
}

export interface ApproveKycRequest {
  submissionVersion: number;
}

export interface RejectKycRequest {
  submissionVersion: number;
  rejectionReason: string;
}
