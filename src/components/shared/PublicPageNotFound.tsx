interface PublicPageNotFoundProps {
  entity?: string;
  message?: string;
}

export function PublicPageNotFound({
  entity = "Page",
  message,
}: PublicPageNotFoundProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
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
        {entity} not found
      </h1>
      <p
        style={{
          color: "var(--text-muted, #827c74)",
          fontSize: "var(--fs-body, 15px)",
          maxWidth: "420px",
          lineHeight: 1.6,
        }}
      >
        {message ??
          `The ${entity.toLowerCase()} you're looking for doesn't exist or may have been removed.`}
      </p>
    </div>
  );
}
