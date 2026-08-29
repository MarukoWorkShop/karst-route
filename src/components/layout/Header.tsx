import { useEffect, useId, useState } from "react";
import { IconChevron, IconGlobe, IconMenu } from "@/components/icons";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { ToolsDrawer } from "@/components/layout/ToolsDrawer";

export function Header({ onPlan }: { onPlan: () => void }) {
  const { t } = useLocale();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [solid, setSolid] = useState(false);
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

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ink = solid ? "text-cta" : "text-paper";
  const muted = solid ? "text-ink-soft" : "text-paper/80";

  return (
    <>
      <ToolsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <header
        className={`fixed top-0 z-40 w-full transition-colors duration-300 ${
          solid
            ? "border-b border-line bg-paper/95 text-ink backdrop-blur"
            : "border-b border-transparent bg-transparent text-paper"
        }`}
      >
        <div className="grid h-[52px] grid-cols-[1fr_auto_1fr] items-center px-3 md:hidden">
          <div className="flex justify-start">
            <MenuButton onClick={() => setDrawerOpen(true)} className={muted} />
          </div>
          <a
            href="#top"
            className={`text-[14px] font-medium tracking-[0.14em] whitespace-nowrap ${ink}`}
          >
            KARST ROUTE
          </a>
          <div className="flex justify-end">
            <GlobeLangButton className={muted} />
          </div>
        </div>

        <div className="mx-auto hidden h-[60px] max-w-[1060px] items-center px-8 md:flex">
          <a href="#top" className={`w-40 text-[14px] font-medium tracking-[0.14em] ${ink}`}>
            KARST ROUTE
          </a>
          <nav className="flex flex-1 items-center justify-center gap-7">
            <a href="#tours" className={`text-[14px] font-medium ${ink}`}>
              {t(copy.nav.tours)}
            </a>
            <a href="#plan" onClick={onPlan} className={`inline-flex items-center gap-1.5 text-[14px] font-medium ${ink}`}>
              {t(copy.nav.plan)}
              <span
                className={`rounded-full border px-1.5 py-px text-[9px] tracking-[0.12em] ${
                  solid ? "border-cta/25" : "border-paper/35"
                }`}
              >
                AI
              </span>
            </a>
            <span className={`h-4 w-px ${solid ? "bg-line" : "bg-paper/25"}`} aria-hidden />
            <SubMenu label={t(copy.nav.explore)} links={exploreLinks} muted={muted} solid={solid} />
            <SubMenu label={t(copy.nav.tools)} links={toolLinks} muted={muted} solid={solid} />
          </nav>
          <div className="flex items-center justify-end gap-1">
            <MenuButton onClick={() => setDrawerOpen(true)} className={muted} />
            <LangToggle solid={solid} />
          </div>
        </div>
      </header>
    </>
  );
}

function MenuButton({ onClick, className }: { onClick: () => void; className: string }) {
  const { t } = useLocale();
  return (
    <button
      type="button"
      aria-label={t(copy.toolbox.open)}
      onClick={onClick}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${className}`}
    >
      <IconMenu className="h-5 w-5" />
    </button>
  );
}

function GlobeLangButton({ className }: { className: string }) {
  const { locale, setLocale, t } = useLocale();
  return (
    <button
      type="button"
      aria-label={t(copy.nav.lang)}
      onClick={() => setLocale(locale === "en" ? "zh" : "en")}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${className}`}
    >
      <IconGlobe className="h-5 w-5" />
    </button>
  );
}

function LangToggle({ solid }: { solid: boolean }) {
  const { locale, setLocale, t } = useLocale();
  const on = solid ? "font-medium text-cta" : "font-medium text-paper";
  const off = solid ? "text-ink-soft" : "text-paper/55";
  return (
    <div className="flex items-center gap-1.5 text-[13px]" role="group" aria-label={t(copy.nav.lang)}>
      <button type="button" aria-pressed={locale === "en"} onClick={() => setLocale("en")} className={locale === "en" ? on : off}>
        EN
      </button>
      <span className={solid ? "text-ink-soft/40" : "text-paper/35"} aria-hidden>
        |
      </span>
      <button type="button" aria-pressed={locale === "zh"} onClick={() => setLocale("zh")} className={locale === "zh" ? on : off}>
        中文
      </button>
    </div>
  );
}

function SubMenu({
  label,
  links,
  muted,
  solid,
}: {
  label: string;
  links: { href: string; label: string }[];
  muted: string;
  solid: boolean;
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
        className={`inline-flex items-center gap-0.5 text-[12px] font-normal ${muted}`}
      >
        {label}
        <IconChevron className="h-4 w-4" />
      </button>
      {open ? (
        <ul
          id={id}
          className={`absolute top-full left-0 z-50 mt-2 min-w-40 rounded-lg border py-2 ${
            solid ? "border-line bg-surface" : "border-white/15 bg-night/90"
          }`}
        >
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`block px-3 py-2 text-[12px] ${
                  solid ? "text-ink-soft hover:text-ink" : "text-paper/80 hover:text-paper"
                }`}
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
