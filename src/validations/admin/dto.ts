import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .email(
    "That email address is not complete. Check for a missing domain, for example .com.",
  );

export const adminLoginFormSchema = z.object({
  emailAddress: emailField,
  password: z.string().min(1, "Enter your password."),
  keepLoggedIn: z.boolean().optional().default(true),
});

export type AdminLoginFormValues = z.infer<typeof adminLoginFormSchema>;

export const adminForgotPasswordFormSchema = z.object({
  emailAddress: emailField,
});

export type AdminForgotPasswordFormValues = z.infer<typeof adminForgotPasswordFormSchema>;

export const adminResetOtpFormSchema = z.object({
  otp: z
    .string()
    .trim()
    .min(1, "Enter the verification code from your email.")
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

export type AdminResetOtpFormValues = z.infer<typeof adminResetOtpFormSchema>;

export const adminNewPasswordFormSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "Enter a new password.")
      .min(12, "Use at least 12 characters.")
      .max(72, "Password must be at most 72 characters."),
    confirmPassword: z.string().min(1, "Repeat your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "The two passwords do not match. Enter the same password in both fields.",
    path: ["confirmPassword"],
  });

export type AdminNewPasswordFormValues = z.infer<typeof adminNewPasswordFormSchema>;

export const adminUpdateProfileFormSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name."),
  lastName: z.string().trim().min(1, "Enter your last name."),
  phoneNumber: z.string().trim().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "NON_BINARY"]).optional().nullable(),
});

export type AdminUpdateProfileFormValues = z.infer<typeof adminUpdateProfileFormSchema>;

export const adminChangePasswordFormSchema = z
  .object({
    oldPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(1, "Enter a new password.")
      .min(12, "Use at least 12 characters.")
      .max(72, "Password must be at most 72 characters."),
    confirmPassword: z.string().min(1, "Repeat your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "The two passwords do not match.",
    path: ["confirmPassword"],
  });

export type AdminChangePasswordFormValues = z.infer<typeof adminChangePasswordFormSchema>;

export const echarisAccountFormSchema = z.object({
  bankName: z.string().trim().min(1, "Enter the bank name."),
  accountName: z.string().trim().min(1, "Enter the account name."),
  accountNumber: z
    .string()
    .trim()
    .min(1, "Enter the account number.")
    .regex(/^\d{10}$/, "Enter a valid 10-digit account number."),
});

export type EcharisAccountFormValues = z.infer<typeof echarisAccountFormSchema>;

export const rejectKycFormSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(1, "Enter a rejection reason.")
    .min(5, "Give a clearer reason (at least 5 characters)."),
});

export type RejectKycFormValues = z.infer<typeof rejectKycFormSchema>;

const httpUrl = z
  .string()
  .trim()
  .url("Enter a valid image URL.")
  .max(2048, "Each image URL must be at most 2,048 characters.")
  .refine((v) => /^https?:\/\//i.test(v), "Image URLs must use HTTP or HTTPS.");

export const createAdminProductFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a product name.")
    .max(150, "Keep the name under 150 characters."),
  description: z
    .string()
    .trim()
    .min(1, "Enter a product description.")
    .max(4000, "Keep the description under 4,000 characters."),
  categoryId: z
    .string()
    .trim()
    .min(1, "Select a category.")
    .max(64, "Category ID must be at most 64 characters."),
  price: z
    .number({ invalid_type_error: "Enter a price." })
    .finite("Enter a valid price.")
    .min(0.01, "Price must be at least ₦0.01.")
    .max(9_999_999_999_999.99, "Price is too large.")
    .refine(
      (v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-8,
      "Use up to 2 decimal places.",
    ),
  stockQuantity: z
    .number({ invalid_type_error: "Enter a stock quantity." })
    .int("Stock must be a whole number.")
    .min(0, "Stock cannot be negative."),
  madeToOrder: z.boolean(),
  active: z.boolean(),
  imageUrls: z.array(httpUrl).max(10, "You can add up to 10 images."),
});

export type CreateAdminProductFormValues = z.infer<typeof createAdminProductFormSchema>;

export const createAdminCategoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a category name.")
    .max(100, "Keep the name under 100 characters."),
  active: z.boolean(),
});

export type CreateAdminCategoryFormValues = z.infer<typeof createAdminCategoryFormSchema>;

export const updateAdminCommitmentRateFormSchema = z.object({
  percentage: z
    .number({ invalid_type_error: "Enter a percentage." })
    .finite("Enter a valid percentage.")
    .min(0.01, "Percentage must be at least 0.01.")
    .max(100, "Percentage must be at most 100.")
    .refine(
      (v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-8,
      "Use up to 2 decimal places.",
    ),
});

export type UpdateAdminCommitmentRateFormValues = z.infer<
  typeof updateAdminCommitmentRateFormSchema
>;

export const recordAdminCustomerPayoutFormSchema = z.object({
  customerUserId: z.string().trim().min(1, "Enter the customer user ID."),
  payoutType: z.enum(["COMMITMENT_CAPITAL", "COMMITMENT_RETURN", "MARKETPLACE_CAPITAL"], {
    required_error: "Select a payout type.",
  }),
  targetId: z.string().trim().min(1, "Enter the target ID."),
  amount: z
    .number({ invalid_type_error: "Enter an amount." })
    .finite("Enter a valid amount.")
    .min(0.01, "Amount must be at least ₦0.01.")
    .refine(
      (v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-8,
      "Use up to 2 decimal places.",
    ),
  transferReference: z.string().trim().min(1, "Enter a transfer reference."),
  paidAt: z.string().trim().min(1, "Enter the paid-at timestamp."),
  receiptUrls: z
    .array(httpUrl)
    .min(1, "Upload at least one receipt.")
    .max(10, "You can add up to 10 receipts."),
});

export type RecordAdminCustomerPayoutFormValues = z.infer<
  typeof recordAdminCustomerPayoutFormSchema
>;

export const createAdminPickupAddressFormSchema = z.object({
  country: z.string().trim().min(1, "Enter a country."),
  state: z.string().trim().min(1, "Enter a state."),
  city: z.string().trim().min(1, "Enter a city."),
  addressLine: z.string().trim().min(1, "Enter an address line."),
  addressLine2: z.string().trim().optional().default(""),
  postalCode: z.string().trim().optional().default(""),
});

export type CreateAdminPickupAddressFormValues = z.infer<
  typeof createAdminPickupAddressFormSchema
>;

const adminPasswordField = z
  .string()
  .min(1, "Enter a password.")
  .min(12, "Use at least 12 characters.")
  .refine(
    (v) => new TextEncoder().encode(v).length <= 72,
    "Password must be at most 72 UTF-8 bytes.",
  );

export const createAdminFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Enter a first name.")
    .max(80, "First name must be at most 80 characters."),
  lastName: z
    .string()
    .trim()
    .min(1, "Enter a last name.")
    .max(80, "Last name must be at most 80 characters."),
  emailAddress: emailField,
  password: adminPasswordField,
  phoneNumber: z.string().trim().optional().default(""),
  gender: z.enum(["", "MALE", "FEMALE", "NON_BINARY"]).optional().default(""),
});

export type CreateAdminFormValues = z.infer<typeof createAdminFormSchema>;
