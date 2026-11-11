import { useLocation } from "react-router-dom";

export default function AdminPlaceholder() {
  const { pathname } = useLocation();
  const title = pathname.split("/").filter(Boolean).slice(1).join(" / ") || "Admin";

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
        Admin resource shell — list / create / edit routes will land here.
      </p>
    </div>
  );
}
