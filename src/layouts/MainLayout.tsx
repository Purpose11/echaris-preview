import { Outlet, useLocation, useNavigate } from "react-router-dom";

import logoOrange from "@/assets/echaris-logo-orange.png";
import logoWhite from "@/assets/echaris-logo-white.png";
import { SITE_FOOTER_COLUMNS, SITE_NAV_LINKS } from "@/data/site";
import { SiteFooter } from "@/design-system/components/navigation/SiteFooter.jsx";
import { SiteHeader } from "@/design-system/components/navigation/SiteHeader.jsx";

export default function MainLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div data-scroll-root>
      <SiteHeader
        links={SITE_NAV_LINKS}
        activeHref={pathname}
        onNavigate={(href) => navigate(href)}
        onLogin={() => navigate("/login")}
        onRegister={() => navigate("/register")}
        logoSrc={logoOrange}
      />
      <main>
        <Outlet />
      </main>
      <SiteFooter logoSrc={logoWhite} columns={SITE_FOOTER_COLUMNS} />
    </div>
  );
}
