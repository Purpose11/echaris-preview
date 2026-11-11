import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .email(
    "That email address is not complete. Check for a missing domain, for example .com.",
  );

export const registerFormSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name."),
  lastName: z.string().trim().min(1, "Enter your last name."),
  emailAddress: emailField,
  dial: z.string().min(1, "Select a country code."),
  phone: z
    .string()
    .trim()
    .min(1, "Enter your phone number.")
    .refine((v) => v.replace(/\D/g, "").length >= 7, {
      message: "That phone number is too short. Enter it without the leading zero.",
    })
    .refine((v) => v.replace(/\D/g, "").length <= 15, {
      message: "That phone number is too long.",
    }),
  password: z
    .string()
    .min(1, "Create a password.")
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password must be at most 100 characters."),
  referralCode: z.string().optional().default(""),
  acceptedConsent: z.boolean().refine((v) => v === true, {
    message: "Accept the terms and privacy policy to continue.",
  }),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function toRegisterPayload(values: RegisterFormValues) {
  const national = values.phone.replace(/\D/g, "").replace(/^0+/, "");
  return {
    emailAddress: values.emailAddress.trim(),
    password: values.password,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phoneNumber: `${values.dial}${national}`,
    acceptedConsent: true as const,
    referralCode: values.referralCode?.trim() ? values.referralCode.trim() : null,
  };
}

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .min(1, "Enter the verification code from your email.")
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;
