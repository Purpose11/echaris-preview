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

export const loginFormSchema = z.object({
  emailAddress: emailField,
  password: z.string().min(1, "Enter your password."),
  keepLoggedIn: z.boolean().optional().default(true),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const forgotPasswordFormSchema = z.object({
  emailAddress: emailField,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const resetOtpFormSchema = verifyOtpSchema;

export type ResetOtpFormValues = z.infer<typeof resetOtpFormSchema>;

export const newPasswordFormSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "Enter a new password.")
      .min(8, "Use at least 8 characters.")
      .max(100, "Password must be at most 100 characters."),
    confirmPassword: z.string().min(1, "Repeat your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "The two passwords do not match. Enter the same password in both fields.",
    path: ["confirmPassword"],
  });

export type NewPasswordFormValues = z.infer<typeof newPasswordFormSchema>;

export const kycDocumentUiTypes = ["nin", "dl", "passport"] as const;
export type KycDocumentUiType = (typeof kycDocumentUiTypes)[number];

export const residentialAddressFormSchema = z.object({
  addressLine: z.string().trim().min(1, "Enter your house number and street."),
  addressLine2: z.string().trim().optional().default(""),
  city: z.string().trim().min(1, "Enter your city."),
  state: z.string().min(1, "Select your state."),
  postalCode: z.string().trim().optional().default(""),
  country: z.string().min(1, "Select your country."),
});

export type ResidentialAddressFormValues = z.infer<typeof residentialAddressFormSchema>;

export const identityDocumentFormSchema = z
  .object({
    documentUiType: z
      .string()
      .min(1, "Select the document you want to verify with.")
      .refine(
        (value): value is KycDocumentUiType =>
          (kycDocumentUiTypes as readonly string[]).includes(value),
        { message: "Select the document you want to verify with." },
      ),
    documentNumber: z.string().trim().optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (!data.documentUiType) return;

    const noun =
      data.documentUiType === "nin"
        ? "NIN"
        : data.documentUiType === "dl"
          ? "license number"
          : "passport number";
    const raw = (data.documentNumber ?? "").replace(/\s/g, "");

    if (!raw) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["documentNumber"],
        message: `Enter your ${noun}.`,
      });
      return;
    }

    if (data.documentUiType === "nin") {
      if (!/^\d{11}$/.test(raw)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["documentNumber"],
          message: "That NIN is too short. Enter the 11 digits with no spaces.",
        });
      }
      return;
    }

    if (data.documentUiType === "dl") {
      if (raw.length < 9) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["documentNumber"],
          message:
            "That license number is too short. Enter the number exactly as printed, without spaces.",
        });
      }
      return;
    }

    if (raw.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["documentNumber"],
        message:
          "That passport number is too short. Starts with a letter, followed by the digits.",
      });
    }
  });

export type IdentityDocumentFormValues = z.infer<typeof identityDocumentFormSchema>;

export function toKycDocumentType(
  uiType: KycDocumentUiType,
): "NIN" | "DRIVERS_LICENSE" | "INTERNATIONAL_PASSPORT" {
  if (uiType === "nin") return "NIN";
  if (uiType === "dl") return "DRIVERS_LICENSE";
  return "INTERNATIONAL_PASSPORT";
}
