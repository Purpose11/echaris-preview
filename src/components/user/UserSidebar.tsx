import { NavLink } from "react-router-dom";

import logoWhite from "@/assets/echaris-logo-white.png";
import { Avatar } from "@/design-system/components/core/Avatar.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { Logo } from "@/design-system/components/core/Logo.jsx";
import { cn } from "@/lib/utils";
import { getLoggedInUser, UserLogout } from "@/utils/authHelper";
import { USER_NAV_ITEMS } from "@/utils/roleAccess";

interface UserSidebarProps {
  onNavigate?: () => void;
  /** Shown in the mobile drawer so users can dismiss the menu. */
  onClose?: () => void;
}

function displayName(user: ReturnType<typeof getLoggedInUser>) {
  const full = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  return full || user?.email || "Client";
}

export function UserSidebar({ onNavigate, onClose }: UserSidebarProps) {
  const user = getLoggedInUser();
  const name = displayName(user);

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

      <nav className="user-sidebar__nav" aria-label="Client portal">
        {USER_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn("user-sidebar__link", isActive && "is-active")
            }
          >
            <Icon name={item.icon} size={18} className="user-sidebar__icon" />
            <span className="user-sidebar__label">{item.label}</span>
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
            <div className="user-sidebar__role">client</div>
          </div>
          <button
            type="button"
            className="user-sidebar__logout"
            aria-label="Log out"
            title="Log out"
            onClick={() => UserLogout()}
          >
            <Icon name="log-out" size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
