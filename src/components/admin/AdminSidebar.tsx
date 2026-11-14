import { NavLink } from "react-router-dom";

import logoWhite from "@/assets/echaris-logo-white.png";
import { Avatar } from "@/design-system/components/core/Avatar.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { Logo } from "@/design-system/components/core/Logo.jsx";
import { Adminlogout, getAdminRole, getLoggedInUser } from "@/utils/authHelper";
import { type AdminRole, getNavItemsForRole } from "@/utils/roleAccess";

interface AdminSidebarProps {
  onNavigate?: () => void;
  onClose?: () => void;
}

function displayName(user: ReturnType<typeof getLoggedInUser>) {
  const full = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  return full || user?.email || "Admin";
}

function roleLabel(role: ReturnType<typeof getAdminRole>) {
  if (role === "SUPER_ADMIN") return "super admin";
  if (role === "ADMIN") return "admin";
  return "admin";
}

export function AdminSidebar({ onNavigate, onClose }: AdminSidebarProps) {
  const user = getLoggedInUser();
  const role = getAdminRole();
  const name = displayName(user);
  const items =
    role === "ADMIN" || role === "SUPER_ADMIN"
      ? getNavItemsForRole(role as AdminRole)
      : [];

  return (
    <aside className="user-sidebar">
      <div className="user-sidebar__brand">
        <Logo height={28} variant="white" src={logoWhite} />
        {onClose ? (
          <button
            type="button"
            className="user-sidebar__close"
            aria-label="Close menu"
            onClick={onClose}
          >
            <Icon name="x" size={20} />
          </button>
        ) : null}
      </div>

      <nav className="user-sidebar__nav" aria-label="Admin portal">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `user-sidebar__link${isActive ? "is-active" : ""}`
            }
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="user-sidebar__footer">
        <div className="user-sidebar__profile">
          <Avatar
            name={name}
            size={40}
            style={{ background: "#F3C6B0", color: "#3A2418" }}
          />
          <div className="user-sidebar__profile-text">
            <div className="user-sidebar__name">{name}</div>
            <div className="user-sidebar__role">{roleLabel(role)}</div>
          </div>
          <button
            type="button"
            className="user-sidebar__logout"
            aria-label="Log out"
            title="Log out"
            onClick={() => Adminlogout()}
          >
            <Icon name="log-out" size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
