import { useLocation } from "react-router-dom";

export default function DashboardPlaceholder() {
  const { pathname } = useLocation();
  const title = pathname.split("/").filter(Boolean).slice(1).join(" / ") || "Dashboard";

  return (
    <div className="flex w-full flex-col gap-3">
      <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-[-0.03em] text-[var(--text-heading)] capitalize md:text-[32px]">
        {title}
      </h1>
      <p className="m-0 max-w-[520px] text-sm leading-relaxed text-[var(--text-muted)] md:text-[15px]">
        Client portal shell — feature pages will land here.
      </p>
    </div>
  );
}
