import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { useNotificationStream } from "@/api/notifications/hooks";
import logoOrange from "@/assets/echaris-logo-orange.png";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/shared/RoleProtectedRoute";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { Logo } from "@/design-system/components/core/Logo.jsx";

export default function AdminLayout() {
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

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 900px)").matches) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <ProtectedRoute>
      <div className="user-shell admin-shell">
        <div className="user-sidebar-desktop">
          <AdminSidebar />
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
          className={`user-shell__drawer${mobileOpen ? "is-open" : ""}`}
          aria-hidden={!mobileOpen}
        >
          <AdminSidebar
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
            <RoleProtectedRoute>
              <Outlet />
            </RoleProtectedRoute>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
