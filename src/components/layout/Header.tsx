import { useEffect, useState } from "react";
import { IconToolbox } from "@/components/icons";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { ToolsDrawer } from "@/components/layout/ToolsDrawer";
import { asset } from "@/lib/asset";

export function Header({ onPlan }: { onPlan: () => void }) {
  const { t } = useLocale();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [solid, setSolid] = useState(false);
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
            <MenuButton onClick={() => setDrawerOpen(true)} className={muted} expanded={drawerOpen} />
          </div>
          <BrandLogo solid={solid} className="justify-center" />
          <div className="flex justify-end">
            <CompactLangToggle className={muted} />
          </div>
        </div>

        <div className="mx-auto hidden h-[60px] max-w-[1060px] items-center px-6 md:flex">
          <div className="flex w-[268px] items-center">
            <MenuButton onClick={() => setDrawerOpen(true)} className={muted} expanded={drawerOpen} />
            <BrandLogo solid={solid} className="min-w-0" />
          </div>
          <nav className="flex flex-1 items-center justify-center gap-7">
            <a href="#tours" className={`type-btn ${ink}`}>
              {t(copy.nav.tours)}
            </a>
            <a href="#plan" onClick={onPlan} className={`type-btn ${ink}`}>
              {t(copy.nav.plan)}
            </a>
            <a href="#about" className={`type-btn ${ink}`}>
              {t(copy.nav.about)}
            </a>
            <span className={`h-4 w-px ${solid ? "bg-line" : "bg-paper/25"}`} aria-hidden />
            <a href="#faq" className={`type-btn ${ink}`}>
              {t(copy.nav.faq)}
            </a>
          </nav>
          <div className="flex w-[268px] items-center justify-end">
            <LangToggle solid={solid} />
          </div>
        </div>
      </header>
    </>
  );
}

function BrandLogo({ solid, className }: { solid: boolean; className?: string }) {
  const { t } = useLocale();
  return (
    <a href="#top" className={`flex items-center ${className ?? ""}`}>
      <img
        src={asset("brand/youxian-logo.png")}
        alt={t(copy.footer.brand)}
        className={`h-[26px] w-auto max-w-[196px] object-contain object-left md:h-8 md:max-w-[220px] ${
          solid ? "" : "invisible opacity-0 pointer-events-none"
        }`}
      />
    </a>
  );
}

function MenuButton({
  onClick,
  className,
  expanded,
}: {
  onClick: () => void;
  className: string;
  expanded: boolean;
}) {
  const { t } = useLocale();
  return (
    <button
      type="button"
      aria-label={t(copy.toolbox.open)}
      aria-expanded={expanded}
      aria-controls="travel-toolbox"
      onClick={onClick}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform hover:scale-105 active:scale-95 ${className}`}
    >
      <IconToolbox className="h-6 w-6" />
    </button>
  );
}

function CompactLangToggle({ className }: { className: string }) {
  const { locale, setLocale, t } = useLocale();
  return (
    <button
      type="button"
      aria-label={t(copy.nav.lang)}
      onClick={() => setLocale(locale === "en" ? "zh" : "en")}
      className={`flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2.5 text-[11px] leading-none tracking-[0.1em] transition-transform hover:scale-105 active:scale-95 ${className}`}
    >
      <span className={locale === "en" ? "font-semibold opacity-100" : "font-medium opacity-55"}>
        EN
      </span>
      <span className="opacity-40" aria-hidden>
        /
      </span>
      <span className={locale === "zh" ? "font-semibold opacity-100" : "font-medium opacity-55"}>
        CHI
      </span>
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
