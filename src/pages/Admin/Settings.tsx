import { zodResolver } from "@hookform/resolvers/zod";
import { type ChangeEvent, type ReactNode, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  useAdminMe,
  useChangeAdminPassword,
  useEcharisAccountDetails,
  useUpdateAdminProfile,
  useUpdateEcharisAccountDetails,
} from "@/api/admin/hooks";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { Select } from "@/design-system/components/forms/Select.jsx";
import { useTheme } from "@/hooks/useTheme.ts";
import {
  NIGERIAN_BANK_OPTIONS,
  NIGERIAN_BANKS,
  OTHER_BANK_VALUE,
} from "@/lib/nigerian-banks";
import { cn } from "@/lib/utils";
import { normalizeError } from "@/utils/normalizeError";
import {
  adminChangePasswordFormSchema,
  type AdminChangePasswordFormValues,
  adminUpdateProfileFormSchema,
  type AdminUpdateProfileFormValues,
  echarisAccountFormSchema,
  type EcharisAccountFormValues,
} from "@/validations/admin/dto";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NON_BINARY", label: "Non-binary" },
];

type SettingsTab = "profile" | "security" | "account" | "appearance";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "account", label: "Company account" },
  { id: "appearance", label: "Appearance" },
];

function PasswordEye({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? "Hide password" : "Show password"}
      style={{
        display: "flex",
        alignItems: "center",
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        color: "var(--text-muted)",
      }}
    >
      <Icon name={show ? "eye-off" : "eye"} size={18} />
    </button>
  );
}

function SettingsCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 md:p-8",
        className,
      )}
    >
      <h2 className="m-0 text-lg font-bold tracking-[-0.02em] text-[var(--text-heading)]">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 mb-0 max-w-[520px] text-sm leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function resolveBankSelection(bankName?: string | null) {
  const name = bankName?.trim() ?? "";
  if (!name) return { bank: "", customBankName: "" };
  if ((NIGERIAN_BANKS as readonly string[]).includes(name)) {
    return { bank: name, customBankName: "" };
  }
  return { bank: OTHER_BANK_VALUE, customBankName: name };
}

export default function Settings() {
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [bank, setBank] = useState("");
  const [customBankName, setCustomBankName] = useState("");
  const [theme, toggleTheme] = useTheme();

  const meQuery = useAdminMe();
  const accountQuery = useEcharisAccountDetails(tab === "account");
  const updateProfile = useUpdateAdminProfile();
  const changePassword = useChangeAdminPassword();
  const updateAccount = useUpdateEcharisAccountDetails();

  const profileForm = useForm<AdminUpdateProfileFormValues>({
    resolver: zodResolver(adminUpdateProfileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      gender: null,
    },
  });

  const passwordForm = useForm<AdminChangePasswordFormValues>({
    resolver: zodResolver(adminChangePasswordFormSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const accountForm = useForm<EcharisAccountFormValues>({
    resolver: zodResolver(echarisAccountFormSchema),
    defaultValues: {
      bankName: "",
      accountName: "",
      accountNumber: "",
    },
  });

  useEffect(() => {
    const me = meQuery.data;
    if (!me) return;
    profileForm.reset({
      firstName: me.firstName ?? "",
      lastName: me.lastName ?? "",
      phoneNumber: me.phoneNumber ?? "",
      gender: (me.gender as AdminUpdateProfileFormValues["gender"]) ?? null,
    });
  }, [meQuery.data, profileForm]);

  useEffect(() => {
    const details = accountQuery.data?.data;
    if (!details) return;
    const selection = resolveBankSelection(details.bankName);
    setBank(selection.bank);
    setCustomBankName(selection.customBankName);
    accountForm.reset({
      bankName: details.bankName ?? "",
      accountName: details.accountName ?? "",
      accountNumber: details.accountNumber ?? "",
    });
  }, [accountQuery.data, accountForm]);

  const onSaveProfile = profileForm.handleSubmit(async (values) => {
    await updateProfile.mutateAsync({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phoneNumber: values.phoneNumber?.trim() || null,
      gender: values.gender ?? null,
    });
  });

  const onChangePassword = passwordForm.handleSubmit(async (values) => {
    await changePassword.mutateAsync({
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    });
  });

  const onSaveAccount = accountForm.handleSubmit(async (values) => {
    const bankName =
      bank === OTHER_BANK_VALUE ? customBankName.trim() : bank || values.bankName;
    await updateAccount.mutateAsync({
      bankName,
      accountName: values.accountName.trim(),
      accountNumber: values.accountNumber.trim(),
      version: accountQuery.data?.data?.version ?? undefined,
    });
  });

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <AdminPageHeader
        title="Settings"
        description="Manage your admin profile, security, company payout account, and appearance."
      />

      <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 [-webkit-overflow-scrolling:touch]">
        <div
          className="flex min-w-max gap-2 border-b border-[var(--border-subtle)] pb-1"
          role="tablist"
          aria-label="Settings sections"
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "shrink-0 rounded-md px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
                tab === item.id
                  ? "bg-[var(--surface-brand-subtle)] text-[var(--text-brand)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-heading)]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "profile" ? (
        <SettingsCard
          title="Profile"
          description="Update the name and contact details on your admin account."
        >
          {meQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          ) : meQuery.isError ? (
            <p className="m-0 text-sm text-[var(--text-danger,#b42318)]">
              {normalizeError(meQuery.error)}
            </p>
          ) : (
            <form
              onSubmit={onSaveProfile}
              className="grid max-w-[520px] grid-cols-1 gap-4"
              noValidate
            >
              <Controller
                name="firstName"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <FormField
                    label="First name"
                    htmlFor="admin-first-name"
                    error={fieldState.error?.message}
                  >
                    <Input
                      id="admin-first-name"
                      invalid={!!fieldState.error}
                      {...field}
                    />
                  </FormField>
                )}
              />
              <Controller
                name="lastName"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <FormField
                    label="Last name"
                    htmlFor="admin-last-name"
                    error={fieldState.error?.message}
                  >
                    <Input id="admin-last-name" invalid={!!fieldState.error} {...field} />
                  </FormField>
                )}
              />
              <FormField label="Email address" htmlFor="admin-email-readonly">
                <Input
                  id="admin-email-readonly"
                  value={meQuery.data?.emailAddress ?? ""}
                  disabled
                />
              </FormField>
              <Controller
                name="phoneNumber"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <FormField
                    label="Phone number"
                    htmlFor="admin-phone"
                    error={fieldState.error?.message}
                  >
                    <Input id="admin-phone" invalid={!!fieldState.error} {...field} />
                  </FormField>
                )}
              />
              <Controller
                name="gender"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <FormField
                    label="Gender"
                    htmlFor="admin-gender"
                    error={fieldState.error?.message}
                  >
                    <Select
                      id="admin-gender"
                      placeholder="Select gender"
                      options={GENDER_OPTIONS}
                      value={field.value ?? ""}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        field.onChange(e.target.value || null)
                      }
                    />
                  </FormField>
                )}
              />
              <Button
                type="submit"
                className="mt-2 h-11 w-full rounded-md px-4 text-sm font-semibold sm:w-fit"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? "Saving…" : "Save profile"}
              </Button>
            </form>
          )}
        </SettingsCard>
      ) : null}

      {tab === "security" ? (
        <SettingsCard
          title="Security"
          description="Change your password. You will be signed out after a successful update."
        >
          <form
            onSubmit={onChangePassword}
            className="grid max-w-[520px] grid-cols-1 gap-4"
            noValidate
          >
            <Controller
              name="oldPassword"
              control={passwordForm.control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Current password"
                  htmlFor="admin-old-password"
                  error={fieldState.error?.message}
                >
                  <Input
                    id="admin-old-password"
                    type={showOld ? "text" : "password"}
                    autoComplete="current-password"
                    iconLeft="lock"
                    suffix={
                      <PasswordEye
                        show={showOld}
                        onToggle={() => setShowOld((s) => !s)}
                      />
                    }
                    invalid={!!fieldState.error}
                    {...field}
                  />
                </FormField>
              )}
            />
            <Controller
              name="newPassword"
              control={passwordForm.control}
              render={({ field, fieldState }) => (
                <FormField
                  label="New password"
                  htmlFor="admin-new-password"
                  error={fieldState.error?.message}
                >
                  <Input
                    id="admin-new-password"
                    type={showNew ? "text" : "password"}
                    autoComplete="new-password"
                    iconLeft="lock"
                    suffix={
                      <PasswordEye
                        show={showNew}
                        onToggle={() => setShowNew((s) => !s)}
                      />
                    }
                    invalid={!!fieldState.error}
                    {...field}
                  />
                </FormField>
              )}
            />
            <Controller
              name="confirmPassword"
              control={passwordForm.control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Confirm new password"
                  htmlFor="admin-confirm-password"
                  error={fieldState.error?.message}
                >
                  <Input
                    id="admin-confirm-password"
                    type={showNew ? "text" : "password"}
                    autoComplete="new-password"
                    iconLeft="lock"
                    invalid={!!fieldState.error}
                    {...field}
                  />
                </FormField>
              )}
            />
            <Button
              type="submit"
              className="mt-2 h-11 w-full rounded-md px-4 text-sm font-semibold sm:w-fit"
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? "Updating…" : "Update password"}
            </Button>
          </form>
        </SettingsCard>
      ) : null}

      {tab === "account" ? (
        <SettingsCard
          title="Company account details"
          description="Bank account clients use when funding commitments and marketplace financings."
        >
          {accountQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          ) : (
            <form
              onSubmit={onSaveAccount}
              className="grid max-w-[520px] grid-cols-1 gap-4"
              noValidate
            >
              <FormField label="Bank" htmlFor="company-bank">
                <Select
                  id="company-bank"
                  placeholder="Select a bank"
                  options={NIGERIAN_BANK_OPTIONS}
                  value={bank}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    setBank(e.target.value);
                    if (e.target.value !== OTHER_BANK_VALUE) {
                      setCustomBankName("");
                      accountForm.setValue("bankName", e.target.value);
                    }
                  }}
                />
              </FormField>
              {bank === OTHER_BANK_VALUE ? (
                <FormField label="Bank name" htmlFor="company-bank-custom">
                  <Input
                    id="company-bank-custom"
                    value={customBankName}
                    onChange={(e) => {
                      setCustomBankName(e.target.value);
                      accountForm.setValue("bankName", e.target.value);
                    }}
                    placeholder="Enter bank name"
                  />
                </FormField>
              ) : null}
              <Controller
                name="accountName"
                control={accountForm.control}
                render={({ field, fieldState }) => (
                  <FormField
                    label="Account name"
                    htmlFor="company-account-name"
                    error={fieldState.error?.message}
                  >
                    <Input
                      id="company-account-name"
                      invalid={!!fieldState.error}
                      {...field}
                    />
                  </FormField>
                )}
              />
              <Controller
                name="accountNumber"
                control={accountForm.control}
                render={({ field, fieldState }) => (
                  <FormField
                    label="Account number"
                    htmlFor="company-account-number"
                    error={fieldState.error?.message}
                  >
                    <Input
                      id="company-account-number"
                      inputMode="numeric"
                      invalid={!!fieldState.error}
                      {...field}
                    />
                  </FormField>
                )}
              />
              <Button
                type="submit"
                className="mt-2 h-11 w-full rounded-md px-4 text-sm font-semibold sm:w-fit"
                disabled={updateAccount.isPending}
              >
                {updateAccount.isPending ? "Saving…" : "Save account details"}
              </Button>
            </form>
          )}
        </SettingsCard>
      ) : null}

      {tab === "appearance" ? (
        <SettingsCard
          title="Appearance"
          description="Choose light or dark theme for the admin portal."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                if (theme === "dark") toggleTheme();
              }}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold",
                theme === "light"
                  ? "border-[var(--brand-primary)] bg-[var(--surface-brand-subtle)] text-[var(--text-brand)]"
                  : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-heading)]",
              )}
            >
              <Icon name="sun" size={16} />
              Light
            </button>
            <button
              type="button"
              onClick={() => {
                if (theme === "light") toggleTheme();
              }}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold",
                theme === "dark"
                  ? "border-[var(--brand-primary)] bg-[var(--surface-brand-subtle)] text-[var(--text-brand)]"
                  : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-heading)]",
              )}
            >
              <Icon name="moon" size={16} />
              Dark
            </button>
          </div>
        </SettingsCard>
      ) : null}
    </div>
  );
}
