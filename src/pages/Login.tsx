import { zodResolver } from "@hookform/resolvers/zod";
import { type ChangeEvent, type ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useLoginCustomer } from "@/api/customer/hooks";
import logoOrange from "@/assets/echaris-logo-orange.png";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Card } from "@/design-system/components/core/Card.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { Logo } from "@/design-system/components/core/Logo.jsx";
import { Alert } from "@/design-system/components/feedback/Alert.jsx";
import { Checkbox } from "@/design-system/components/forms/Checkbox.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { resolvePostAuthPath } from "@/utils/kycGate";
import { normalizeError } from "@/utils/normalizeError";
import { loginFormSchema, type LoginFormValues } from "@/validations/customer/dto";

function TrustPanel() {
  const items = [
    [
      "lock",
      "Secure connection",
      "Your account information is protected with advanced security encryption to keep your data safe.",
    ],
    [
      "shield-check",
      "Identity verification",
      "Complete identity verification to help maintain a secure and trusted platform.",
    ],
    [
      "bell",
      "Login alerts",
      "Receive email notifications whenever your account is accessed from a new device.",
    ],
  ] as const;

  return (
    <aside className="panel">
      <div className="panel-inner anim-in anim-in-1">
        <div
          className="anim-in anim-in-2"
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <span className="micro">ECharis client portal</span>
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
            Manage your capital, track performance returns, and access marketplace
            financing from one secure platform.
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

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail = (location.state as { email?: string } | null)?.email?.trim() ?? "";

  const [show, setShow] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const loginMutation = useLoginCustomer();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      emailAddress: prefillEmail,
      password: "",
      keepLoggedIn: true,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const res = await loginMutation.mutateAsync({
        emailAddress: values.emailAddress.trim(),
        password: values.password,
      });
      if (res.success === false || !res.data) {
        setFormError(
          res.message ||
            "Email address and password do not match. Check your password or reset it below.",
        );
        return;
      }
      toast.success(res.message || "Customer login successful");
      const from = (
        location.state as {
          from?: { pathname?: string; search?: string } | string;
        } | null
      )?.from;
      const fromPath =
        typeof from === "string"
          ? from
          : from && typeof from === "object"
            ? `${from.pathname || ""}${from.search || ""}`
            : undefined;
      const nextPath = resolvePostAuthPath();
      if (nextPath === "/dashboard" && fromPath?.startsWith("/dashboard")) {
        navigate(fromPath, { replace: true });
      } else {
        navigate(nextPath, { replace: true });
      }
    } catch (error) {
      setFormError(normalizeError(error));
    }
  });

  const eyeToggle = (
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

  const body: ReactNode = (
    <>
      <div
        className="anim-in anim-in-1"
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
      >
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
          Welcome back
        </h1>
        <p style={{ margin: 0, fontSize: "var(--fs-body)", color: "var(--text-muted)" }}>
          Log in to view your capital, returns and wallet balance.
        </p>
      </div>
      <Card padding={28} className="anim-in anim-in-2">
        <form
          onSubmit={onSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
          noValidate
        >
          {formError && (
            <Alert tone="danger" title="Log in failed">
              {formError}
            </Alert>
          )}
          <Controller
            name="emailAddress"
            control={form.control}
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
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormField
                label="Password"
                htmlFor="password"
                error={fieldState.error?.message}
              >
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  iconLeft="lock"
                  placeholder="Enter your password"
                  suffix={eyeToggle}
                  invalid={!!fieldState.error}
                  {...field}
                />
              </FormField>
            )}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <Controller
              name="keepLoggedIn"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  label="Keep me logged in"
                  checked={!!field.value}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    field.onChange(e.target.checked)
                  }
                />
              )}
            />
            <a
              href="/forgot-password"
              onClick={(e) => {
                e.preventDefault();
                navigate("/forgot-password");
              }}
              style={{
                fontSize: "var(--fs-body-sm)",
                fontWeight: "var(--fw-semibold)",
              }}
            >
              Forgot password?
            </a>
          </div>
          <Button type="submit" fullWidth size="lg" loading={loginMutation.isPending}>
            {loginMutation.isPending ? "Logging in" : "Log in"}
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
        New to Echaris?{" "}
        <a
          href="/register"
          onClick={(e) => {
            e.preventDefault();
            navigate("/register");
          }}
          style={{ fontWeight: "var(--fw-semibold)" }}
        >
          Create an account
        </a>
      </p>
    </>
  );

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
