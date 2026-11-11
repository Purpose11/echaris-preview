import { useLocation } from "react-router-dom";

export default function DashboardPlaceholder() {
  const { pathname } = useLocation();
  const title = pathname.split("/").filter(Boolean).slice(1).join(" / ") || "Dashboard";

  return (
    <div>
      <h1
        style={{
          margin: "0 0 8px",
          fontSize: 28,
          fontWeight: 800,
          textTransform: "capitalize",
        }}
      >
        {title}
      </h1>
      <p style={{ margin: 0, color: "var(--text-muted)" }}>
        Client portal shell — feature pages will land here.
      </p>
    </div>
  );
}
