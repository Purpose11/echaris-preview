import { z } from "zod";

import type { Gender, UpdateCustomerProfileRequest } from "@/api/customer/types";

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
    message: "Accept the terms and conditions to continue.",
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

const genderValues = ["MALE", "FEMALE", "NON_BINARY"] as const;

export const updateProfileFormSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name."),
  lastName: z.string().trim().min(1, "Enter your last name."),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Enter your phone number.")
    .refine((v) => v.replace(/\D/g, "").length >= 7, {
      message: "That phone number is too short.",
    })
    .refine((v) => v.replace(/\D/g, "").length <= 15, {
      message: "That phone number is too long.",
    }),
  dateOfBirth: z
    .string()
    .trim()
    .default("")
    .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), {
      message: "Enter a valid date of birth.",
    })
    .refine((v) => v === "" || new Date(v) < new Date(), {
      message: "Date of birth must be in the past.",
    }),
  gender: z
    .string()
    .default("")
    .refine((v) => v === "" || (genderValues as readonly string[]).includes(v), {
      message: "Select a valid gender.",
    }),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileFormSchema>;

export function toUpdateProfilePayload(
  values: UpdateProfileFormValues,
  existing?: {
    profilePictureUrl?: string | null;
    marketingEmailsEnabled?: boolean;
  },
): UpdateCustomerProfileRequest {
  const gender = values.gender.trim();
  const parsedGender: Gender | null =
    gender === "MALE" || gender === "FEMALE" || gender === "NON_BINARY" ? gender : null;
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phoneNumber: values.phoneNumber.trim(),
    dateOfBirth: values.dateOfBirth.trim() ? values.dateOfBirth.trim() : null,
    gender: parsedGender,
    profilePictureUrl: existing?.profilePictureUrl ?? null,
    marketingEmailsEnabled: existing?.marketingEmailsEnabled ?? false,
  };
}

const passwordStrength = z
  .string()
  .min(1, "Enter a new password.")
  .min(8, "Use at least 8 characters.")
  .max(100, "Password must be at most 100 characters.")
  .refine((v) => /[A-Z]/.test(v), {
    message: "Include at least one uppercase letter.",
  })
  .refine((v) => /\d/.test(v), {
    message: "Include at least one number.",
  });

export const changePasswordFormSchema = z
  .object({
    oldPassword: z.string().min(1, "Enter your current password."),
    newPassword: passwordStrength,
    confirmPassword: z.string().min(1, "Repeat the new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "The two passwords do not match. Enter the same password in both fields.",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export function normalizePersonName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function formatProfileFullName(
  firstName?: string | null,
  lastName?: string | null,
) {
  return [firstName, lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
}

/** Account name must include every profile first/last name token, in any order. */
export function accountNameContainsProfileNames(
  accountName: string,
  firstName?: string | null,
  lastName?: string | null,
) {
  const first = normalizePersonName(firstName ?? "");
  const last = normalizePersonName(lastName ?? "");
  if (!first || !last) return false;

  const tokens = new Set(normalizePersonName(accountName).split(" ").filter(Boolean));
  const required = [...first.split(" "), ...last.split(" ")].filter(Boolean);
  return required.every((part) => tokens.has(part));
}

export function createPayoutAccountFormSchema(
  firstName?: string | null,
  lastName?: string | null,
) {
  const first = firstName?.trim() ?? "";
  const last = lastName?.trim() ?? "";
  const profileLabel = formatProfileFullName(first, last);

  return z
    .object({
      bank: z.string().min(1, "Select a bank."),
      customBankName: z.string().trim().optional().default(""),
      accountNumber: z
        .string()
        .trim()
        .min(1, "Enter your account number.")
        .regex(/^\d{10}$/, "Enter a valid 10-digit account number."),
      accountName: z.string().trim().min(1, "Enter the account name."),
    })
    .superRefine((data, ctx) => {
      if (data.bank === "OTHER" && !data.customBankName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter your bank name.",
          path: ["customBankName"],
        });
      }

      if (!first || !last) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Update your profile name before saving a payout account.",
          path: ["accountName"],
        });
        return;
      }

      if (!accountNameContainsProfileNames(data.accountName, first, last)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Account name must include both your first and last name (${profileLabel}), in any order. A middle name is allowed.`,
          path: ["accountName"],
        });
      }
    });
}

export type PayoutAccountFormValues = z.infer<
  ReturnType<typeof createPayoutAccountFormSchema>
>;

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

/** Maps the KYC address step to POST /addresses/private/create-or-update. */
export function toDeliveryAddressPayload(values: ResidentialAddressFormValues) {
  return {
    addressType: "DELIVERY" as const,
    country: values.country,
    state: values.state,
    city: values.city.trim(),
    addressLine: values.addressLine.trim(),
    addressLine2: values.addressLine2?.trim() || null,
    postalCode: values.postalCode?.trim() || null,
  };
}

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
