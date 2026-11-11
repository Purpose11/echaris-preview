import { Link } from "react-router-dom";

interface NotFoundProps {
  variant?: "public" | "admin" | "user";
}

const CONFIG = {
  public: { home: "/", label: "Go home" },
  admin: { home: "/admin", label: "Go to dashboard" },
  user: { home: "/dashboard", label: "Go to dashboard" },
} as const;

export default function NotFound({ variant = "public" }: NotFoundProps) {
  const { home, label } = CONFIG[variant];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "3rem 1.5rem",
        textAlign: "center",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      <span
        style={{
          fontSize: "var(--fs-display-xl, 56px)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--text-brand, #e03a00)",
          lineHeight: 1,
        }}
      >
        404
      </span>
      <h1
        style={{
          fontSize: "var(--fs-h2, 24px)",
          fontWeight: 700,
          color: "var(--text-heading, #1a1a1a)",
          margin: "0.75rem 0 0.5rem",
        }}
      >
        Page not found
      </h1>
      <p
        style={{
          color: "var(--text-muted, #827c74)",
          fontSize: "var(--fs-body, 15px)",
          maxWidth: "420px",
          lineHeight: 1.6,
          marginBottom: "1.5rem",
        }}
      >
        Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to={home}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 24px",
          borderRadius: "var(--radius-pill, 999px)",
          background: "var(--brand-primary, #FF5A00)",
          color: "#fff",
          fontWeight: 600,
          fontSize: "var(--fs-body-sm, 14px)",
          textDecoration: "none",
        }}
      >
        {label}
      </Link>
    </div>
  );
}
