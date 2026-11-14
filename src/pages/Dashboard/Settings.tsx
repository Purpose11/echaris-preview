import { zodResolver } from "@hookform/resolvers/zod";
import { type ChangeEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  useChangeCustomerPassword,
  useCustomerPayoutAccount,
  useCustomerProfile,
  useUpdateCustomerPayoutAccount,
  useUpdateCustomerProfile,
} from "@/api/customer/hooks";
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
  changePasswordFormSchema,
  type ChangePasswordFormValues,
  createPayoutAccountFormSchema,
  formatProfileFullName,
  type PayoutAccountFormValues,
  toUpdateProfilePayload,
  updateProfileFormSchema,
  type UpdateProfileFormValues,
} from "@/validations/customer/dto";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NON_BINARY", label: "Non-binary" },
];

/** Default amount required by the payout-account API contract. */
const DEFAULT_PAYOUT_AMOUNT = 0.01;

function resolvePayoutBankSelection(bankName?: string | null) {
  const name = bankName?.trim() ?? "";
  if (!name) {
    return { bank: "", customBankName: "" };
  }
  if ((NIGERIAN_BANKS as readonly string[]).includes(name)) {
    return { bank: name, customBankName: "" };
  }
  return {
    bank: OTHER_BANK_VALUE,
    customBankName: name,
  };
}

type SettingsTab = "profile" | "security" | "payout" | "appearance";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "payout", label: "Payout details" },
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
        "rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8",
        className,
      )}
    >
      <h2 className="m-0 text-base font-bold text-[var(--text-heading)] md:text-lg">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 mb-0 text-sm leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>
      ) : null}
      <div className={cn(description ? "mt-6" : "mt-5")}>{children}</div>
    </section>
  );
}

function ProfilePanel() {
  const profileQuery = useCustomerProfile();
  const updateMutation = useUpdateCustomerProfile();
  const profile = profileQuery.data?.data;

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: "",
    },
  });

  useEffect(() => {
    if (!profile) return;
    form.reset({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      dateOfBirth: profile.dateOfBirth?.slice(0, 10) ?? "",
      gender: profile.gender ?? "",
    });
  }, [profile, form]);

  const onSubmit = form.handleSubmit((values) => {
    updateMutation.mutate(
      toUpdateProfilePayload(values, {
        profilePictureUrl: profile?.profilePictureUrl,
        marketingEmailsEnabled: profile?.marketingEmailsEnabled,
      }),
    );
  });

  if (profileQuery.isLoading) {
    return (
      <SettingsCard title="Personal details" description="Loading your profile…">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </SettingsCard>
    );
  }

  if (profileQuery.isError) {
    return (
      <SettingsCard title="Personal details">
        <p className="m-0 text-sm text-[var(--text-muted)]">
          {normalizeError(profileQuery.error)}
        </p>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard
      title="Personal details"
      description="Update your profile details. Email stays tied to your account."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Controller
            name="firstName"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormField
                label="First name"
                htmlFor="firstName"
                error={fieldState.error?.message}
              >
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  invalid={!!fieldState.error}
                  {...field}
                />
              </FormField>
            )}
          />
          <Controller
            name="lastName"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormField
                label="Last name"
                htmlFor="lastName"
                error={fieldState.error?.message}
              >
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  invalid={!!fieldState.error}
                  {...field}
                />
              </FormField>
            )}
          />
        </div>

        <FormField label="Email address" htmlFor="emailAddress">
          <Input
            id="emailAddress"
            type="email"
            iconLeft="mail"
            value={profile?.emailAddress ?? ""}
            disabled
            readOnly
          />
        </FormField>

        <Controller
          name="phoneNumber"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormField
              label="Phone number"
              htmlFor="phoneNumber"
              error={fieldState.error?.message}
            >
              <Input
                id="phoneNumber"
                type="tel"
                autoComplete="tel"
                invalid={!!fieldState.error}
                {...field}
              />
            </FormField>
          )}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Controller
            name="dateOfBirth"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormField
                label="Date of birth"
                htmlFor="dateOfBirth"
                error={fieldState.error?.message}
              >
                <Input
                  id="dateOfBirth"
                  type="date"
                  autoComplete="bday"
                  invalid={!!fieldState.error}
                  {...field}
                />
              </FormField>
            )}
          />
          <Controller
            name="gender"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormField
                label="Gender"
                htmlFor="gender"
                error={fieldState.error?.message}
              >
                <Select
                  id="gender"
                  placeholder="Select gender"
                  options={GENDER_OPTIONS}
                  invalid={!!fieldState.error}
                  value={field.value ?? ""}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    field.onChange(e.target.value)
                  }
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormField>
            )}
          />
        </div>

        <div>
          <Button
            type="submit"
            className="h-11 min-w-[160px] rounded-md px-5 text-sm font-semibold"
            disabled={updateMutation.isPending || !form.formState.isDirty}
          >
            {updateMutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}

function SecurityPanel() {
  const changePasswordMutation = useChangeCustomerPassword();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    changePasswordMutation.mutate(
      {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          form.reset();
          setShowCurrent(false);
          setShowNew(false);
          setShowConfirm(false);
        },
      },
    );
  });

  return (
    <SettingsCard
      title="Change password"
      description="Use at least 8 characters, with one number and one uppercase letter."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Controller
          name="oldPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormField
              label="Current password"
              htmlFor="oldPassword"
              error={fieldState.error?.message}
            >
              <Input
                id="oldPassword"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                iconLeft="lock"
                placeholder="Enter your current password"
                suffix={
                  <PasswordEye
                    show={showCurrent}
                    onToggle={() => setShowCurrent((v) => !v)}
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
          control={form.control}
          render={({ field, fieldState }) => (
            <FormField
              label="New password"
              htmlFor="newPassword"
              error={fieldState.error?.message}
            >
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                iconLeft="lock"
                placeholder="At least 8 characters"
                suffix={
                  <PasswordEye show={showNew} onToggle={() => setShowNew((v) => !v)} />
                }
                invalid={!!fieldState.error}
                {...field}
              />
            </FormField>
          )}
        />
        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormField
              label="Confirm new password"
              htmlFor="confirmPassword"
              error={fieldState.error?.message}
            >
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                iconLeft="lock"
                placeholder="Repeat the new password"
                suffix={
                  <PasswordEye
                    show={showConfirm}
                    onToggle={() => setShowConfirm((v) => !v)}
                  />
                }
                invalid={!!fieldState.error}
                {...field}
              />
            </FormField>
          )}
        />
        <div>
          <Button
            type="submit"
            className="h-11 min-w-[180px] rounded-md px-5 text-sm font-semibold"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? "Updating…" : "Update password"}
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}

function PayoutPanel() {
  const profileQuery = useCustomerProfile();
  const payoutQuery = useCustomerPayoutAccount();
  const updatePayoutMutation = useUpdateCustomerPayoutAccount();
  const profile = profileQuery.data?.data;
  const firstName = profile?.firstName ?? "";
  const lastName = profile?.lastName ?? "";
  const profileFullName = formatProfileFullName(firstName, lastName);
  const savedDetails = payoutQuery.data?.data?.details ?? null;

  const payoutSchema = useMemo(
    () => createPayoutAccountFormSchema(firstName, lastName),
    [firstName, lastName],
  );

  const form = useForm<PayoutAccountFormValues>({
    resolver: (...args) => zodResolver(payoutSchema)(...args),
    defaultValues: {
      bank: "",
      customBankName: "",
      accountNumber: "",
      accountName: "",
    },
  });

  const selectedBank = form.watch("bank");
  const isOtherBank = selectedBank === OTHER_BANK_VALUE;

  useEffect(() => {
    const bank = resolvePayoutBankSelection(savedDetails?.bankName);
    form.reset({
      bank: bank.bank,
      customBankName: bank.customBankName,
      accountNumber: savedDetails?.accountNumber ?? "",
      accountName: savedDetails?.accountName || profileFullName || "",
    });
  }, [savedDetails, profileFullName, form]);

  const onSubmit = form.handleSubmit((values) => {
    if (!profileFullName) {
      toast.error("Update your profile name before saving a payout account");
      return;
    }
    const bankName =
      values.bank === OTHER_BANK_VALUE ? values.customBankName.trim() : values.bank;
    updatePayoutMutation.mutate({
      bankName,
      accountName: values.accountName.trim(),
      accountNumber: values.accountNumber.trim(),
      amount: savedDetails?.amount ?? DEFAULT_PAYOUT_AMOUNT,
    });
  });

  return (
    <div className="flex flex-col gap-5">
      <SettingsCard
        title="Saved payout account"
        description="Withdrawals are paid to an account in your own name."
      >
        {payoutQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
        ) : payoutQuery.isError ? (
          <p className="m-0 text-sm text-[var(--text-muted)]">
            {normalizeError(payoutQuery.error)}
          </p>
        ) : savedDetails?.accountNumber ? (
          <div className="flex items-start justify-between gap-4 rounded-md border border-[var(--border-default)] px-4 py-4">
            <div className="min-w-0">
              <p className="m-0 text-sm font-bold text-[var(--text-heading)]">
                {savedDetails.bankName} · {savedDetails.accountNumber}
              </p>
              <p className="mt-1 mb-0 text-sm text-[var(--text-muted)]">
                {savedDetails.accountName}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--success-50)] px-2.5 py-1 text-xs font-semibold text-[var(--text-success)]">
              Verified
            </span>
          </div>
        ) : (
          <p className="m-0 text-sm text-[var(--text-muted)]">
            No payout account saved yet.
          </p>
        )}
      </SettingsCard>

      <SettingsCard
        title="Update payout account"
        description="Changes apply to withdrawal requests submitted after saving. The account name must include your first and last name, in any order. A middle name is allowed."
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <Controller
            name="bank"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormField label="Bank" htmlFor="bank" error={fieldState.error?.message}>
                <Select
                  id="bank"
                  placeholder="Select a bank"
                  options={NIGERIAN_BANK_OPTIONS}
                  invalid={!!fieldState.error}
                  value={field.value}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    field.onChange(e.target.value)
                  }
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormField>
            )}
          />

          {isOtherBank ? (
            <Controller
              name="customBankName"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Bank name"
                  htmlFor="customBankName"
                  error={fieldState.error?.message}
                >
                  <Input
                    id="customBankName"
                    placeholder="Type your bank name"
                    autoComplete="organization"
                    invalid={!!fieldState.error}
                    {...field}
                  />
                </FormField>
              )}
            />
          ) : null}

          <Controller
            name="accountNumber"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormField
                label="Account number"
                htmlFor="accountNumber"
                error={fieldState.error?.message}
              >
                <Input
                  id="accountNumber"
                  inputMode="numeric"
                  autoComplete="off"
                  invalid={!!fieldState.error}
                  {...field}
                />
              </FormField>
            )}
          />

          <Controller
            name="accountName"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormField
                label="Account name"
                htmlFor="accountName"
                error={fieldState.error?.message}
              >
                <Input
                  id="accountName"
                  autoComplete="name"
                  placeholder={
                    profileFullName
                      ? `Must include ${profileFullName}`
                      : "Enter the account name"
                  }
                  invalid={!!fieldState.error}
                  {...field}
                />
              </FormField>
            )}
          />

          <div>
            <Button
              type="submit"
              className="h-11 min-w-[180px] rounded-md px-5 text-sm font-semibold"
              disabled={
                profileQuery.isLoading ||
                payoutQuery.isLoading ||
                updatePayoutMutation.isPending
              }
            >
              {updatePayoutMutation.isPending ? "Saving…" : "Save payout account"}
            </Button>
          </div>
        </form>
      </SettingsCard>
    </div>
  );
}

function AppearancePanel() {
  const [theme, toggleTheme] = useTheme();
  const isDark = theme === "dark";

  return (
    <SettingsCard
      title="Theme"
      description="Choose how the dashboard looks. Light mode is the default."
    >
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        role="radiogroup"
        aria-label="Color theme"
      >
        <button
          type="button"
          role="radio"
          aria-checked={!isDark}
          onClick={() => {
            if (isDark) toggleTheme();
          }}
          className={cn(
            "flex items-start gap-3 rounded-md border px-4 py-4 text-left transition-colors outline-none",
            !isDark
              ? "border-[var(--brand-primary)] bg-[var(--surface-brand-subtle)]"
              : "border-[var(--border-default)] bg-[var(--surface-card)] hover:bg-[var(--neutral-50)]",
          )}
        >
          <span
            className={cn(
              "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md",
              !isDark
                ? "bg-[var(--brand-primary)] text-white"
                : "bg-[var(--neutral-100)] text-[var(--text-muted)]",
            )}
          >
            <Icon name="sun" size={16} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[var(--text-heading)]">
              Light
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-[var(--text-muted)]">
              Bright surfaces for daytime use.
            </span>
          </span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={isDark}
          onClick={() => {
            if (!isDark) toggleTheme();
          }}
          className={cn(
            "flex items-start gap-3 rounded-md border px-4 py-4 text-left transition-colors outline-none",
            isDark
              ? "border-[var(--brand-primary)] bg-[var(--surface-brand-subtle)]"
              : "border-[var(--border-default)] bg-[var(--surface-card)] hover:bg-[var(--neutral-50)]",
          )}
        >
          <span
            className={cn(
              "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md",
              isDark
                ? "bg-[var(--brand-primary)] text-white"
                : "bg-[var(--neutral-100)] text-[var(--text-muted)]",
            )}
          >
            <Icon name="moon" size={16} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[var(--text-heading)]">
              Dark
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-[var(--text-muted)]">
              Lower glare for low-light environments.
            </span>
          </span>
        </button>
      </div>
    </SettingsCard>
  );
}

export default function DashboardSettings() {
  const [tab, setTab] = useState<SettingsTab>("profile");

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <header className="min-w-0">
        <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[32px]">
          Settings
        </h1>
        <p className="mt-3 max-w-[640px] text-sm leading-relaxed text-[var(--text-muted)] md:text-[15px]">
          Manage your personal details, security, payout account and appearance.
        </p>
      </header>

      <nav
        className="flex gap-6 overflow-x-auto border-b border-[var(--border-subtle)]"
        aria-label="Settings sections"
      >
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "relative shrink-0 border-0 bg-transparent px-0 pb-3 text-sm outline-none",
                active
                  ? "font-bold text-[var(--text-heading)]"
                  : "font-medium text-[var(--text-muted)] hover:text-[var(--text-heading)]",
              )}
            >
              {item.label}
              {active ? (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--brand-primary)]" />
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="max-w-[560px]">
        {tab === "profile" ? <ProfilePanel /> : null}
        {tab === "security" ? <SecurityPanel /> : null}
        {tab === "payout" ? <PayoutPanel /> : null}
        {tab === "appearance" ? <AppearancePanel /> : null}
      </div>
    </div>
  );
}
