import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import OTPInput from "react-otp-input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  useForgotCustomerPassword,
  useResendCustomerOtp,
  useResetCustomerPassword,
} from "@/api/customer/hooks";
import logoOrange from "@/assets/echaris-logo-orange.png";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Card } from "@/design-system/components/core/Card.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { Logo } from "@/design-system/components/core/Logo.jsx";
import { Alert } from "@/design-system/components/feedback/Alert.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { normalizeError } from "@/utils/normalizeError";
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
  newPasswordFormSchema,
  type NewPasswordFormValues,
  resetOtpFormSchema,
  type ResetOtpFormValues,
} from "@/validations/customer/dto";

type View = "request" | "otp" | "password" | "done";

function TrustPanel() {
  const items = [
    [
      "lock",
      "Secure reset code",
      "The reset code is sent only to the email address on your client account and expires after a short time.",
    ],
    [
      "shield-check",
      "One-time use",
      "Each code works once. Requesting a new code cancels the previous one.",
    ],
    ["bell", "Account alerts", "You receive an email whenever your password is changed."],
  ] as const;

  return (
    <aside className="panel">
      <div className="panel-inner anim-in anim-in-1">
        <div
          className="anim-in anim-in-2"
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <span className="micro">Account recovery</span>
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
            Reset your password and get back to your client account securely.
          </h2>
        </div>
        <div
          className="anim-in anim-in-3"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            paddingTop: 28,
            borderTop: "1px solid rgba(255,255,255,.12)",
          }}
        >
          {items.map(([icon, t, d]) => (
            <div className="trust" key={t}>
              <Icon
                name={icon}
                size={20}
                style={{ color: "var(--brand-primary)", marginTop: 2, flex: "none" }}
              />
              <div>
                <div className="trust-t">{t}</div>
                <div className="trust-d">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

const H1 = {
  margin: 0,
  fontSize: "var(--fs-h1)",
  fontWeight: "var(--fw-extrabold)" as const,
  letterSpacing: "var(--ls-display)",
  lineHeight: "var(--lh-tight)",
  color: "var(--text-heading)",
};
const SUB = {
  margin: 0,
  fontSize: "var(--fs-body)",
  color: "var(--text-muted)",
  lineHeight: 1.55,
};
const RING = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 44,
  height: 44,
  borderRadius: "var(--radius-pill)",
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("request");
  const [email, setEmail] = useState("");
  /** Kept in memory only — never put OTPs in the URL (history, referrers, logs). */
  const [otp, setOtp] = useState("");
  const [show, setShow] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const forgotMutation = useForgotCustomerPassword();
  const resetMutation = useResetCustomerPassword();
  const resendMutation = useResendCustomerOtp();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = window.setTimeout(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [resendCooldown]);

  const requestForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { emailAddress: "" },
  });

  const otpForm = useForm<ResetOtpFormValues>({
    resolver: zodResolver(resetOtpFormSchema),
    defaultValues: { otp: "" },
  });

  const passwordForm = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordFormSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onRequest = requestForm.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const res = await forgotMutation.mutateAsync({
        emailAddress: values.emailAddress.trim(),
      });
      if (res.success === false) {
        setFormError(res.message || "Could not send a reset code.");
        return;
      }
      setEmail(values.emailAddress.trim());
      setOtp("");
      otpForm.reset({ otp: "" });
      setResendCooldown(30);
      setView("otp");
      toast.success(res.message || "Password reset OTP sent successfully");
    } catch (error) {
      setFormError(normalizeError(error));
    }
  });

  const onConfirmOtp = otpForm.handleSubmit((values) => {
    setFormError(null);
    setOtp(values.otp);
    passwordForm.reset({ newPassword: "", confirmPassword: "" });
    setView("password");
  });

  const onSavePassword = passwordForm.handleSubmit(async (values) => {
    setFormError(null);
    if (!email || !otp) {
      setFormError("Your reset session expired. Request a new code.");
      setView("request");
      return;
    }
    try {
      const res = await resetMutation.mutateAsync({
        emailAddress: email,
        otp,
        newPassword: values.newPassword,
      });
      if (res.success === false) {
        setFormError(res.message || "Could not reset your password.");
        return;
      }
      setOtp("");
      setView("done");
      toast.success(res.message || "Password reset successfully");
    } catch (error) {
      const message = normalizeError(error);
      setFormError(message);
      /* Likely invalid/expired OTP — send user back to re-enter code */
      if (/otp|code|expired|invalid/i.test(message)) {
        setOtp("");
        otpForm.reset({ otp: "" });
        setView("otp");
      }
    }
  });

  const onResend = async () => {
    if (resendCooldown > 0 || resendMutation.isPending || !email) return;
    try {
      await resendMutation.mutateAsync({
        emailAddress: email,
        userOtpType: "PASSWORD_RESET",
      });
      setOtp("");
      otpForm.reset({ otp: "" });
      setResendCooldown(30);
    } catch {
      /* toast in mutation */
    }
  };

  const eye = (
    <button
      type="button"
      onClick={() => setShow((s) => !s)}
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

  let body: ReactNode;

  if (view === "request") {
    body = (
      <>
        <div
          className="anim-in anim-in-1"
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          <h1 style={H1}>Reset your password</h1>
          <p style={SUB}>
            Enter the email address on your client account and we send you a code to set a
            new password.
          </p>
        </div>
        <Card padding={28} className="anim-in anim-in-2">
          <form
            onSubmit={onRequest}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
            noValidate
          >
            {formError && (
              <Alert tone="danger" title="Request failed">
                {formError}
              </Alert>
            )}
            <Controller
              name="emailAddress"
              control={requestForm.control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Email address"
                  htmlFor="email"
                  error={fieldState.error?.message}
                >
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    iconLeft="mail"
                    placeholder="Enter your email address"
                    invalid={!!fieldState.error}
                    {...field}
                  />
                </FormField>
              )}
            />
            <Button type="submit" fullWidth size="lg" loading={forgotMutation.isPending}>
              {forgotMutation.isPending ? "Sending reset code" : "Send reset code"}
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
          Remembered it?{" "}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
            style={{ fontWeight: "var(--fw-semibold)" }}
          >
            Back to log in
          </a>
        </p>
      </>
    );
  } else if (view === "otp") {
    body = (
      <>
        <div
          className="anim-in anim-in-1"
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          <h1 style={H1}>Enter verification code</h1>
          <p style={SUB}>
            We sent a 6-digit code to {email}. Enter it to continue resetting your
            password.
          </p>
        </div>
        <Card padding={28} className="anim-in anim-in-2">
          <form
            onSubmit={onConfirmOtp}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
            noValidate
          >
            {formError && (
              <Alert tone="danger" title="Invalid code">
                {formError}
              </Alert>
            )}
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
            <Button type="submit" fullWidth size="lg">
              Continue
            </Button>
            <Button
              type="button"
              variant="secondary"
              iconLeft="refresh-cw"
              onClick={onResend}
              loading={resendMutation.isPending}
              disabled={resendMutation.isPending || resendCooldown > 0}
            >
              {resendMutation.isPending
                ? "Sending"
                : resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : "Resend reset code"}
            </Button>
          </form>
        </Card>
      </>
    );
  } else if (view === "password") {
    body = (
      <>
        <div
          className="anim-in anim-in-1"
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          <h1 style={H1}>Set a new password</h1>
          <p style={SUB}>
            Choose a password you have not used on your client account before.
          </p>
        </div>
        <Card padding={28} className="anim-in anim-in-2">
          <form
            onSubmit={onSavePassword}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
            noValidate
          >
            {formError && (
              <Alert tone="danger" title="Could not reset password">
                {formError}
              </Alert>
            )}
            <Controller
              name="newPassword"
              control={passwordForm.control}
              render={({ field, fieldState }) => (
                <FormField
                  label="New password"
                  htmlFor="next"
                  error={fieldState.error?.message}
                  hint={!fieldState.error ? "At least 8 characters." : undefined}
                >
                  <Input
                    id="next"
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    iconLeft="lock"
                    placeholder="At least 8 characters"
                    suffix={eye}
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
                  htmlFor="confirm"
                  error={fieldState.error?.message}
                >
                  <Input
                    id="confirm"
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    iconLeft="lock"
                    placeholder="Repeat the new password"
                    invalid={!!fieldState.error}
                    {...field}
                  />
                </FormField>
              )}
            />
            <Button type="submit" fullWidth size="lg" loading={resetMutation.isPending}>
              {resetMutation.isPending ? "Reseting Password" : "Reset Passord"}
            </Button>
          </form>
        </Card>
      </>
    );
  } else {
    body = (
      <Card padding={28}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            alignItems: "flex-start",
          }}
        >
          <span
            style={{
              ...RING,
              background: "var(--success-50)",
              color: "var(--text-success)",
            }}
          >
            <Icon name="circle-check" size={22} />
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <h1
              style={{
                ...H1,
                fontSize: "var(--fs-h2)",
                fontWeight: "var(--fw-bold)",
              }}
            >
              Password updated
            </h1>
            <p style={SUB}>
              Your password has been changed. You can log in with your new password.
            </p>
          </div>
          <Button
            fullWidth
            size="lg"
            onClick={() => navigate("/login", { state: { email } })}
            iconRight="arrow-right"
          >
            Log in
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="auth">
      <TrustPanel />
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
