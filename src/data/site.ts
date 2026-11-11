export interface SiteNavLink {
  href: string;
  label: string;
}

export interface SiteFooterColumn {
  title: string;
  links: Array<{ label: string; href?: string }>;
}

export const SITE_NAV_LINKS: SiteNavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About us" },
  { href: "/services", label: "Services" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/contact", label: "Contact" },
];

export const SITE_FOOTER_COLUMNS: SiteFooterColumn[] = [
  {
    title: "Platform",
    links: [
      { label: "Growth programs" },
      { label: "Marketplace" },
      { label: "Referral rewards" },
      { label: "Client wallet" },
    ],
  },
  {
    title: "Company",
    links: [{ label: "About us" }, { label: "Services" }, { label: "Contact" }],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & conditions" },
      { label: "MOU" },
      { label: "Privacy policy" },
    ],
  },
];
