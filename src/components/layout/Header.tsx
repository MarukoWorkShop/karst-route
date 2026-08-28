import { useEffect, useId, useState } from "react";
import { IconChevron } from "@/components/icons";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

export function Header({ onPlan }: { onPlan: () => void }) {
  const { t } = useLocale();
  const exploreLinks = [
    { href: "#explore-culture", label: t(copy.nav.culture) },
    { href: "#explore-voices", label: t(copy.nav.voices) },
    { href: "#explore-guide", label: t(copy.nav.guide) },
  ];
  const toolLinks = [
    { href: "#tool-visa", label: t(copy.nav.visa) },
    { href: "#tool-season", label: t(copy.nav.season) },
    { href: "#tool-transit", label: t(copy.nav.transit) },
  ];

  return (
    <header className="fixed top-0 z-40 w-full border-b border-line bg-paper/95 text-ink backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <a href="#top" className="text-[13px] font-medium tracking-[0.16em]">
          KARST ROUTE
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          <a href="#tours" className="text-[14px] font-medium text-cta">
            {t(copy.nav.tours)}
          </a>
          <a href="#plan" onClick={onPlan} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-cta">
            {t(copy.nav.plan)}
            <span className="rounded-full border border-cta/25 px-1.5 py-px text-[9px] tracking-[0.12em]">AI</span>
          </a>
          <span className="h-4 w-px bg-line" aria-hidden />
          <SubMenu label={t(copy.nav.explore)} links={exploreLinks} />
          <SubMenu label={t(copy.nav.tools)} links={toolLinks} />
        </nav>
        <LangToggle />
      </div>
      <div className="flex h-10 items-center justify-center gap-6 border-t border-line md:hidden">
        <a href="#tours" className="text-[13px] font-medium text-cta">
          {t(copy.nav.tours)}
        </a>
        <a href="#plan" onClick={onPlan} className="inline-flex items-center gap-1 text-[13px] font-medium text-cta">
          {t(copy.nav.plan)}
          <span className="rounded-full border border-cta/25 px-1.5 py-px text-[9px] tracking-[0.12em]">AI</span>
        </a>
        <MobileMore
          also={t(copy.nav.also)}
          more={t(copy.nav.more)}
          links={[...exploreLinks, ...toolLinks]}
        />
      </div>
    </header>
  );
}

function LangToggle() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div
      className="flex items-center gap-1.5 text-[13px]"
      role="group"
      aria-label={t(copy.nav.lang)}
    >
      <button
        type="button"
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
        className={locale === "en" ? "font-medium text-cta" : "text-ink-soft"}
      >
        EN
      </button>
      <span className="text-ink-soft/40" aria-hidden>
        |
      </span>
      <button
        type="button"
        aria-pressed={locale === "zh"}
        onClick={() => setLocale("zh")}
        className={locale === "zh" ? "font-medium text-cta" : "text-ink-soft"}
      >
        中文
      </button>
    </div>
  );
}

function SubMenu({
  label,
  links,
}: {
  label: string;
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex items-center gap-0.5 text-[12px] font-normal text-ink-soft"
      >
        {label}
        <IconChevron className="h-4 w-4" />
      </button>
      {open ? (
        <ul
          id={id}
          className="absolute top-full left-0 z-50 mt-2 min-w-40 rounded-lg border border-line bg-surface py-2 shadow-none"
        >
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="block px-3 py-2 text-[12px] text-ink-soft hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function MobileMore({
  also,
  more,
  links,
}: {
  also: string;
  more: string;
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, { once: true });
    return () => window.removeEventListener("scroll", close);
  }, [open]);
  return (
    <div className="relative">
      <button
        type="button"
        className="text-[12px] text-ink-soft"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {more}
      </button>
      {open ? (
        <ul className="absolute top-full right-0 z-50 mt-2 w-44 rounded-lg border border-line bg-surface py-2">
          <li className="px-3 py-1 text-[10px] tracking-wider text-ink-soft/80">
            {also}
          </li>
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="block px-3 py-2 text-[12px] text-ink-soft"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
