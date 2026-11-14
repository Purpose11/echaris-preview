import logoOrange from "@/assets/echaris-logo-orange.png";

interface AppErrorFallbackProps {
  error?: Error | null;
  onRetry?: () => void;
}

export function AppErrorFallback({ error, onRetry }: AppErrorFallbackProps) {
  const isDev = import.meta.env.DEV;

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        width: "100%",
        padding: "2.5rem 1.5rem",
        textAlign: "center",
        background: "var(--surface-page, #f7f6f4)",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        boxSizing: "border-box",
      }}
    >
      <img
        src={logoOrange}
        alt="ECharis"
        style={{ height: 28, width: "auto", marginBottom: 28 }}
      />

      <h1
        style={{
          margin: 0,
          fontSize: "clamp(1.5rem, 2.5vw, 1.875rem)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--text-heading, #1a1a1a)",
        }}
      >
        Something went wrong
      </h1>

      <p
        style={{
          margin: "12px 0 0",
          maxWidth: 440,
          fontSize: 15,
          lineHeight: 1.6,
          color: "var(--text-muted, #827c74)",
        }}
      >
        This page hit an unexpected error. You can try again, or reload to continue.
      </p>

      {isDev && error?.message ? (
        <pre
          style={{
            marginTop: 20,
            maxWidth: "min(560px, 100%)",
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid var(--border-subtle, #e3e0dc)",
            background: "var(--surface-card, #fff)",
            color: "var(--text-danger, #b42318)",
            fontSize: 12,
            lineHeight: 1.5,
            textAlign: "left",
            overflow: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {error.message}
        </pre>
      ) : null}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
          marginTop: 28,
        }}
      >
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            style={{
              height: 44,
              padding: "0 22px",
              borderRadius: 8,
              border: "none",
              background: "var(--brand-primary, #ff5a00)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => window.location.assign("/")}
          style={{
            height: 44,
            padding: "0 22px",
            borderRadius: 8,
            border: "1px solid var(--border-default, #cbc7c1)",
            background: "var(--surface-card, #fff)",
            color: "var(--text-heading, #1a1a1a)",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Go home
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            height: 44,
            padding: "0 22px",
            borderRadius: 8,
            border: "1px solid var(--border-default, #cbc7c1)",
            background: "var(--surface-card, #fff)",
            color: "var(--text-heading, #1a1a1a)",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Reload page
        </button>
      </div>
    </div>
  );
}
