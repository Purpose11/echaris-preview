import { NavLink } from "react-router-dom";

import { getAdminRole } from "@/utils/authHelper";
import { type AdminRole, getNavItemsForRole } from "@/utils/roleAccess";

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const role = getAdminRole();
  const items =
    role === "ADMIN" || role === "SUPER_ADMIN"
      ? getNavItemsForRole(role as AdminRole)
      : [];

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        borderRight: "1px solid var(--border-subtle, #E3E0DC)",
        background: "var(--surface-card, #fff)",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minHeight: "100%",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-muted, #827C74)",
          marginBottom: 12,
          paddingInline: 8,
        }}
      >
        Admin
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            onClick={onNavigate}
            style={({ isActive }) => ({
              display: "block",
              padding: "10px 12px",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
              color: isActive
                ? "var(--text-brand, #E03A00)"
                : "var(--text-body, #403C37)",
              background: isActive
                ? "var(--surface-brand-subtle, #FFF3EB)"
                : "transparent",
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
