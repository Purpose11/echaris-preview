import { Link } from "react-router-dom";

export default function AdminLogin() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "var(--surface-page, #F7F6F4)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800 }}>Admin login</h1>
        <p style={{ margin: "0 0 24px", color: "var(--text-muted)" }}>
          Authentication wiring will connect here. This route stays outside AdminLayout.
        </p>
        <Link to="/admin/forgot-password" style={{ color: "var(--text-brand)" }}>
          Forgot password
        </Link>
      </div>
    </div>
  );
}
