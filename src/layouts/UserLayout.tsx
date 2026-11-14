import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { useNotificationStream } from "@/api/notifications/hooks";
import logoOrange from "@/assets/echaris-logo-orange.png";
import { KycProtectedRoute } from "@/components/shared/KycProtectedRoute";
import { UserProtectedRoute } from "@/components/shared/UserProtectedRoute";
import { UserSidebar } from "@/components/user/UserSidebar";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { Logo } from "@/design-system/components/core/Logo.jsx";

export default function UserLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  useNotificationStream(true);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <UserProtectedRoute>
      <KycProtectedRoute>
        <div className="user-shell">
          <div className="user-sidebar-desktop">
            <UserSidebar />
          </div>

          {mobileOpen && (
            <button
              type="button"
              className="user-shell__backdrop"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
          )}

          <div
            className={mobileOpen ? "user-shell__drawer is-open" : "user-shell__drawer"}
            aria-hidden={!mobileOpen}
          >
            <UserSidebar
              onNavigate={() => setMobileOpen(false)}
              onClose={() => setMobileOpen(false)}
            />
          </div>

          <div className="user-shell__main">
            <header className="user-mobile-header">
              <button
                type="button"
                className="user-mobile-header__menu"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
              >
                <Icon name="menu" size={20} />
              </button>
              <Logo height={24} src={logoOrange} className="user-mobile-header__logo" />
            </header>

            <main data-scroll-root className="user-shell__content">
              <Outlet />
            </main>
          </div>
        </div>
      </KycProtectedRoute>
    </UserProtectedRoute>
  );
}
