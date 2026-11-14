import logoOrange from "@/assets/echaris-logo-orange.png";
import { Logo } from "@/design-system/components/core/Logo.jsx";
import {
  USER_AGREEMENT_INTRO,
  USER_AGREEMENT_SECTIONS,
  USER_AGREEMENT_TITLE,
} from "@/lib/user-agreement";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[var(--surface-page,#f7f6f4)] text-[var(--text-body)]">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--surface-card,#fff)]">
        <div className="mx-auto flex w-full max-w-[920px] items-center justify-between gap-4 px-5 py-5 md:px-8">
          <a href="/" className="inline-flex no-underline" aria-label="Echaris home">
            <Logo height={28} src={logoOrange} />
          </a>
          <p className="m-0 text-xs font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
            Legal
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[920px] px-5 py-10 md:px-8 md:py-14">
        <article className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card,#fff)] px-6 py-8 md:px-10 md:py-12">
          <p className="m-0 text-xs font-semibold tracking-[0.08em] text-[var(--text-brand)] uppercase">
            Echaris Trading Limited
          </p>
          <h1 className="mt-3 mb-0 text-[28px] leading-tight font-extrabold tracking-[-0.03em] text-[var(--text-heading)] md:text-[34px]">
            Terms and Conditions
          </h1>
          <p className="mt-3 mb-0 max-w-[640px] text-sm leading-relaxed text-[var(--text-muted)] md:text-[15px]">
            {USER_AGREEMENT_TITLE}
          </p>
          <p className="mt-2 mb-0 text-sm text-[var(--text-muted)]">
            Please read these terms carefully before creating an account or committing
            capital on the Echaris platform.
          </p>

          <div className="mt-8 border-t border-[var(--border-subtle)] pt-8">
            <p className="m-0 text-[15px] leading-relaxed text-[var(--text-body)] md:text-base">
              {USER_AGREEMENT_INTRO}
            </p>

            <div className="mt-10 flex flex-col gap-10">
              {USER_AGREEMENT_SECTIONS.map((section) => (
                <section key={section.heading}>
                  <h2 className="m-0 text-lg font-bold tracking-[-0.02em] text-[var(--text-heading)] md:text-xl">
                    {section.heading}
                  </h2>
                  <div className="mt-4 flex flex-col gap-4">
                    {section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 48)}
                        className="m-0 text-[15px] leading-relaxed text-[var(--text-body)] md:text-base"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <footer className="mt-12 border-t border-[var(--border-subtle)] pt-6">
            <p className="m-0 text-sm leading-relaxed text-[var(--text-muted)]">
              By creating an account or using Echaris services, you acknowledge that you
              have read, understood, and agree to these Terms and Conditions and our
              privacy practices as described herein.
            </p>
          </footer>
        </article>
      </main>
    </div>
  );
}
