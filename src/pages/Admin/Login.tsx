import { zodResolver } from "@hookform/resolvers/zod";
import { type ChangeEvent, type ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useLoginAdmin } from "@/api/admin/hooks";
import logoOrange from "@/assets/echaris-logo-orange.png";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Card } from "@/design-system/components/core/Card.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { Logo } from "@/design-system/components/core/Logo.jsx";
import { Alert } from "@/design-system/components/feedback/Alert.jsx";
import { Checkbox } from "@/design-system/components/forms/Checkbox.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { getAdminRole } from "@/utils/authHelper";
import { normalizeError } from "@/utils/normalizeError";
import { getDefaultAdminRoute } from "@/utils/roleAccess";
import { adminLoginFormSchema, type AdminLoginFormValues } from "@/validations/admin/dto";

function TrustPanel() {
  const items = [
    [
      "lock",
      "Secure admin access",
      "Admin sessions use encrypted credentials and require a valid platform API key.",
    ],
    [
      "shield-check",
      "Role-based control",
      "Access is limited to the features assigned to your admin role.",
    ],
    [
      "bell",
      "Operational alerts",
      "Stay informed about KYC submissions, payments, and marketplace activity.",
    ],
  ] as const;

  return (
    <aside className="panel">
      <div className="panel-inner anim-in anim-in-1">
        <div
          className="anim-in anim-in-2"
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <span className="micro">ECharis admin portal</span>
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
            Review customers, KYC, commitments, payments, and marketplace financing from
            one secure console.
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

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const loginMutation = useLoginAdmin();

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginFormSchema),
    defaultValues: {
      emailAddress: "",
      password: "",
      keepLoggedIn: true,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const data = await loginMutation.mutateAsync({
        emailAddress: values.emailAddress.trim(),
        password: values.password,
      });
      if (!data?.accessToken || !data?.admin) {
        setFormError("Email address and password do not match.");
        return;
      }
      toast.success("Logged in successfully");
      const role = getAdminRole();
      const from = (location.state as { from?: string } | null)?.from;
      if (from?.startsWith("/admin") && from !== "/admin/login") {
        navigate(from, { replace: true });
      } else if (role === "ADMIN" || role === "SUPER_ADMIN") {
        navigate(getDefaultAdminRoute(role), { replace: true });
      } else {
        navigate("/admin", { replace: true });
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
          Admin sign in
        </h1>
        <p style={{ margin: 0, fontSize: "var(--fs-body)", color: "var(--text-muted)" }}>
          Sign in to manage platform operations.
        </p>
      </div>
      <Card padding={28} className="anim-in anim-in-2">
        <form
          onSubmit={onSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
          noValidate
        >
          {formError && (
            <Alert tone="danger" title="Sign in failed">
              {formError}
            </Alert>
          )}
          <Controller
            name="emailAddress"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormField
                label="Email address"
                htmlFor="admin-email"
                error={fieldState.error?.message}
              >
                <Input
                  id="admin-email"
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
                htmlFor="admin-password"
                error={fieldState.error?.message}
              >
                <Input
                  id="admin-password"
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
                  label="Keep me signed in"
                  checked={!!field.value}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    field.onChange(e.target.checked)
                  }
                />
              )}
            />
            <a
              href="/admin/forgot-password"
              onClick={(e) => {
                e.preventDefault();
                navigate("/admin/forgot-password");
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
            {loginMutation.isPending ? "Signing in" : "Sign in"}
          </Button>
        </form>
      </Card>
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
