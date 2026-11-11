import { useState } from "react";
import { Outlet } from "react-router-dom";

import { UserProtectedRoute } from "@/components/shared/UserProtectedRoute";
import { UserSidebar } from "@/components/user/UserSidebar";

export default function UserLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <UserProtectedRoute>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "var(--surface-page, #F7F6F4)",
        }}
      >
        <div className="user-sidebar-desktop" style={{ display: "none" }}>
          <UserSidebar />
        </div>

        {mobileOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(26,26,26,0.45)",
              border: "none",
              zIndex: 40,
            }}
          />
        )}

        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 50,
            transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 200ms ease",
          }}
        >
          <UserSidebar onNavigate={() => setMobileOpen(false)} />
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <header
            className="user-mobile-header"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              height: 56,
              paddingInline: 16,
              borderBottom: "1px solid var(--border-subtle, #E3E0DC)",
              background: "var(--surface-card, #fff)",
            }}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              style={{
                border: "1px solid var(--border-subtle, #E3E0DC)",
                background: "transparent",
                borderRadius: 8,
                padding: "6px 10px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Menu
            </button>
            <span style={{ fontWeight: 700 }}>ECharis Portal</span>
          </header>

          <main data-scroll-root style={{ flex: 1, overflow: "auto", padding: 24 }}>
            <Outlet />
          </main>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .user-sidebar-desktop { display: block !important; }
          .user-mobile-header { display: none !important; }
        }
      `}</style>
    </UserProtectedRoute>
  );
}
