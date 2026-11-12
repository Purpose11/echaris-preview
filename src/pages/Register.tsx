import { zodResolver } from "@hookform/resolvers/zod";
import { type ChangeEvent, type ReactNode, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import OTPInput from "react-otp-input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  useLoginCustomer,
  useRegisterCustomer,
  useResendCustomerOtp,
  useVerifyCustomerOtp,
} from "@/api/customer/hooks";
import logoOrange from "@/assets/echaris-logo-orange.png";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Card } from "@/design-system/components/core/Card.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { Logo } from "@/design-system/components/core/Logo.jsx";
import { Alert } from "@/design-system/components/feedback/Alert.jsx";
import { Checkbox } from "@/design-system/components/forms/Checkbox.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { Select } from "@/design-system/components/forms/Select.jsx";
import { normalizeError } from "@/utils/normalizeError";
import {
  registerFormSchema,
  type RegisterFormValues,
  toRegisterPayload,
  type VerifyOtpFormValues,
  verifyOtpSchema,
} from "@/validations/customer/dto";

const BENEFITS = [
  [
    "lock",
    "Secure Account Management",
    "Your information is protected with modern security practices.",
  ],
  [
    "trending-up",
    "Track Your Performance",
    "Monitor your capital activities and monthly returns.",
  ],
  [
    "store",
    "Marketplace Access",
    "Explore products and financing opportunities available on the platform.",
  ],
] as const;

const DIALS = [
  { value: "+234", label: "+234 NG" },
  { value: "+233", label: "+233 GH" },
  { value: "+254", label: "+254 KE" },
  { value: "+27", label: "+27 ZA" },
  { value: "+44", label: "+44 UK" },
  { value: "+1", label: "+1 US" },
];

const STRENGTH = [
  ["", "var(--neutral-200)", "var(--text-muted)"],
  ["Weak", "var(--danger-500)", "var(--text-danger)"],
  ["Fair", "var(--brand-accent)", "var(--text-brand)"],
  ["Good", "var(--brand-primary)", "var(--text-brand)"],
  ["Strong", "var(--success-500)", "var(--text-success)"],
] as const;

function passwordScore(p: string) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(4, s);
}

type View = "form" | "otp";

function Panel() {
  return (
    <aside className="panel">
      <div className="panel-inner anim-in anim-in-1">
        <div
          className="anim-in anim-in-2"
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "var(--fs-h1)",
              fontWeight: "var(--fw-extrabold)",
              letterSpacing: "var(--ls-display)",
              lineHeight: "var(--lh-tight)",
              color: "#fff",
            }}
          >
            Start your journey with ECharis
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "var(--fs-body)",
              color: "rgba(255,255,255,.66)",
              lineHeight: 1.6,
            }}
          >
            Create your account and access a secure platform designed to help you manage
            capital commitments, track performance returns, and explore marketplace
            opportunities.
          </p>
        </div>
        <div className="benefits anim-in anim-in-3">
          {BENEFITS.map(([icon, t, d]) => (
            <div className="benefit" key={t}>
              <Icon
                name={icon}
                size={20}
                style={{ color: "var(--brand-primary)", marginTop: 2, flex: "none" }}
              />
              <div>
                <div className="benefit-t">{t}</div>
                <div className="benefit-d">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function Heading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <div
      className="anim-in anim-in-1"
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      <span className="micro" style={{ color: "var(--text-muted)" }}>
        {eyebrow}
      </span>
      <h1
        style={{
          margin: 0,
          fontSize: "var(--fs-h1)",
          fontWeight: "var(--fw-extrabold)",
          letterSpacing: "var(--ls-display)",
          lineHeight: "var(--lh-tight)",
          color: "var(--text-heading)",
        }}
      >
        {title}
      </h1>
      <p
        style={{
          margin: 0,
          fontSize: "var(--fs-body)",
          color: "var(--text-muted)",
          maxWidth: 460,
        }}
      >
        {sub}
      </p>
    </div>
  );
}

function StatusCard({
  tone,
  icon,
  title,
  body,
  children,
}: {
  tone: "brand" | "success" | "danger";
  icon: string;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  const ring = {
    brand: ["var(--orange-50)", "var(--text-brand)"],
    success: ["var(--success-50)", "var(--text-success)"],
    danger: ["var(--danger-50)", "var(--text-danger)"],
  }[tone];

  return (
    <Card padding={28} className="anim-in anim-in-2">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          alignItems: "flex-start",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 52,
            height: 52,
            borderRadius: "var(--radius-pill)",
            background: ring[0],
            color: ring[1],
          }}
        >
          {icon === "spinner" ? (
            <span className="spin" />
          ) : (
            <Icon name={icon} size={26} />
          )}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h2
            style={{
              margin: 0,
              fontSize: "var(--fs-h2)",
              fontWeight: "var(--fw-bold)",
              letterSpacing: "var(--ls-display)",
              color: "var(--text-heading)",
            }}
          >
            {title}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "var(--fs-body)",
              color: "var(--text-muted)",
              lineHeight: 1.55,
            }}
          >
            {body}
          </p>
        </div>
        {children}
      </div>
    </Card>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("form");
  const [showPassword, setShowPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registeredPassword, setRegisteredPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const registerMutation = useRegisterCustomer();
  const verifyMutation = useVerifyCustomerOtp();
  const resendMutation = useResendCustomerOtp();
  const loginMutation = useLoginCustomer();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = window.setTimeout(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [resendCooldown]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      emailAddress: "",
      dial: "+234",
      phone: "",
      password: "",
      referralCode: "",
      acceptedConsent: false,
    },
    mode: "onSubmit",
  });

  const otpForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });

  const password = form.watch("password");
  const sc = passwordScore(password ?? "");

  const onRegister = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const res = await registerMutation.mutateAsync(toRegisterPayload(values));
      if (res.success === false) {
        setFormError(res.message || "Could not create your account.");
        return;
      }
      setRegisteredEmail(values.emailAddress.trim());
      setRegisteredPassword(values.password);
      otpForm.reset({ otp: "" });
      setResendCooldown(30);
      setView("otp");
      toast.success(res.message || "Check your email for the verification OTP");
    } catch (error) {
      setFormError(normalizeError(error));
    }
  });

  const onVerifyOtp = otpForm.handleSubmit(async ({ otp }) => {
    try {
      const res = await verifyMutation.mutateAsync({
        emailAddress: registeredEmail,
        otp,
      });
      if (res.success === false) {
        otpForm.setError("otp", { message: res.message || "Invalid code." });
        return;
      }

      const loginRes = await loginMutation.mutateAsync({
        emailAddress: registeredEmail,
        password: registeredPassword,
      });
      if (loginRes.success === false || !loginRes.data) {
        toast.success(res.message || "Account verified. Please log in.");
        navigate("/login", { replace: true, state: { email: registeredEmail } });
        return;
      }

      toast.success(res.message || "Account verified successfully");
      navigate("/verify", { replace: true });
    } catch (error) {
      otpForm.setError("otp", { message: normalizeError(error) });
    }
  });

  const onResendOtp = async () => {
    if (resendCooldown > 0 || resendMutation.isPending) return;
    try {
      await resendMutation.mutateAsync({
        emailAddress: registeredEmail,
        userOtpType: "ACCOUNT_ACTIVATION",
      });
      setResendCooldown(30);
    } catch {
      /* toast handled in mutation onError */
    }
  };

  const eye = (
    <button
      type="button"
      onClick={() => setShowPassword((s) => !s)}
      aria-label={showPassword ? "Hide password" : "Show password"}
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
      <Icon name={showPassword ? "eye-off" : "eye"} size={18} />
    </button>
  );

  let body: ReactNode;

  if (view === "form") {
    body = (
      <>
        <Heading
          eyebrow="Create account"
          title="Create your account"
          sub="Join ECharis and start managing your financial activities from one secure platform."
        />
        <Card padding={28} className="anim-in anim-in-2">
          <form
            onSubmit={onRegister}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
            noValidate
          >
            {formError && (
              <Alert tone="danger" title="Account not created">
                {formError}
              </Alert>
            )}

            <div className="grid2">
              <Controller
                name="firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FormField
                    label="First name"
                    htmlFor="first"
                    error={fieldState.error?.message}
                  >
                    <Input
                      id="first"
                      autoComplete="given-name"
                      iconLeft="user"
                      placeholder="Enter your first name"
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
                    htmlFor="last"
                    error={fieldState.error?.message}
                  >
                    <Input
                      id="last"
                      autoComplete="family-name"
                      placeholder="Enter your last name"
                      invalid={!!fieldState.error}
                      {...field}
                    />
                  </FormField>
                )}
              />
            </div>

            <Controller
              name="emailAddress"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Email address"
                  htmlFor="email"
                  error={fieldState.error?.message}
                  hint={
                    !fieldState.error
                      ? "Your verification code, statements and payout notices are sent here."
                      : undefined
                  }
                >
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    iconLeft="mail"
                    placeholder="you@example.com"
                    invalid={!!fieldState.error}
                    {...field}
                  />
                </FormField>
              )}
            />

            <div>
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FormField
                    label="Phone number"
                    htmlFor="phone"
                    error={
                      fieldState.error?.message || form.formState.errors.dial?.message
                    }
                  >
                    <div className="phone">
                      <Controller
                        name="dial"
                        control={form.control}
                        render={({ field: dialField }) => (
                          <Select
                            aria-label="Country code"
                            options={DIALS}
                            value={dialField.value}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                              dialField.onChange(e.target.value)
                            }
                          />
                        )}
                      />
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="803 000 0000"
                        invalid={!!fieldState.error}
                        {...field}
                      />
                    </div>
                  </FormField>
                )}
              />
            </div>

            <Controller
              name="referralCode"
              control={form.control}
              render={({ field }) => (
                <FormField label="Referral code (optional)" htmlFor="ref">
                  <Input
                    id="ref"
                    iconLeft="users"
                    placeholder="e.g. ECH-ADAEZE24"
                    {...field}
                  />
                </FormField>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Password"
                  htmlFor="password"
                  error={fieldState.error?.message}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      iconLeft="lock"
                      placeholder="At least 8 characters"
                      suffix={eye}
                      invalid={!!fieldState.error}
                      {...field}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div className="strength">
                        {[1, 2, 3, 4].map((i) => (
                          <span
                            key={i}
                            style={{
                              background:
                                i <= sc ? STRENGTH[sc][1] : "var(--neutral-200)",
                            }}
                          />
                        ))}
                      </div>
                      <span
                        style={{
                          fontSize: "var(--fs-caption)",
                          color: sc ? STRENGTH[sc][2] : "var(--text-muted)",
                        }}
                      >
                        {sc
                          ? `Password strength: ${STRENGTH[sc][0]}`
                          : "Mix upper and lower case, a number and a symbol."}
                      </span>
                    </div>
                  </div>
                </FormField>
              )}
            />

            <Controller
              name="acceptedConsent"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField error={fieldState.error?.message}>
                  <Checkbox
                    checked={field.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      field.onChange(e.target.checked)
                    }
                    label="I accept the terms and conditions and the privacy policy"
                    description="Includes the client agreement covering capital commitments and performance returns."
                  />
                </FormField>
              )}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating your account" : "Create account"}
            </Button>
          </form>
        </Card>
        <p
          className="anim-in anim-in-3"
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: "var(--fs-body-sm)",
            color: "var(--text-muted)",
          }}
        >
          Already have an account?{" "}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
            style={{ fontWeight: "var(--fw-semibold)" }}
          >
            Login
          </a>
        </p>
      </>
    );
  } else if (view === "otp") {
    body = (
      <>
        <Heading
          eyebrow="Confirm your email"
          title="Confirm your email address"
          sub="Your client account is created. Enter the 6-digit code we emailed you to activate it."
        />
        <StatusCard
          tone="brand"
          icon="mail-check"
          title="Check your inbox"
          body="We sent a verification code to the address below. The code expires after a short time."
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "14px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--surface-brand-subtle)",
              border: "1px solid var(--orange-100)",
            }}
          >
            <Icon
              name="mail"
              size={18}
              style={{ color: "var(--text-brand)", flex: "none" }}
            />
            <span
              style={{
                fontSize: "var(--fs-body-sm)",
                fontWeight: "var(--fw-semibold)",
                color: "var(--text-heading)",
                wordBreak: "break-all",
              }}
            >
              {registeredEmail}
            </span>
          </div>

          <form
            onSubmit={onVerifyOtp}
            style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}
            noValidate
          >
            <Controller
              name="otp"
              control={otpForm.control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Verification code"
                  htmlFor="otp-0"
                  error={fieldState.error?.message}
                >
                  <OTPInput
                    value={field.value}
                    onChange={field.onChange}
                    numInputs={6}
                    shouldAutoFocus
                    inputType="tel"
                    skipDefaultStyles
                    containerStyle="otp-boxes"
                    renderInput={(props, index) => (
                      <input
                        {...props}
                        id={index === 0 ? "otp-0" : undefined}
                        className={`otp-box${fieldState.error ? "otp-box--invalid" : ""}`}
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                      />
                    )}
                  />
                </FormField>
              )}
            />
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={verifyMutation.isPending || loginMutation.isPending}
            >
              {verifyMutation.isPending || loginMutation.isPending
                ? "Verifying"
                : "Verify email"}
            </Button>
          </form>

          <p
            style={{
              margin: 0,
              fontSize: "var(--fs-body-sm)",
              color: "var(--text-muted)",
            }}
          >
            Nothing in your inbox after a few minutes? Check your spam folder, then send
            the code again.
          </p>
          <Button
            variant="secondary"
            iconLeft="refresh-cw"
            onClick={onResendOtp}
            loading={resendMutation.isPending}
            disabled={resendMutation.isPending || resendCooldown > 0}
          >
            {resendMutation.isPending
              ? "Sending"
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend verification code"}
          </Button>
        </StatusCard>
      </>
    );
  }

  return (
    <div className="auth auth--wide">
      <Panel />
      <main className="main">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          style={{ alignSelf: "flex-start" }}
        >
          <Logo height={26} src={logoOrange} />
        </a>
        <div className="col">{body}</div>
      </main>
    </div>
  );
}
