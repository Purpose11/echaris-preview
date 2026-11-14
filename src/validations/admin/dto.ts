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
