import { useEffect, useState } from "react";
import { IconChevronsUp } from "@/components/icons";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

export function MobileDock({
  onTours,
  onPlan,
  hidden,
}: {
  onTours: () => void;
  onPlan: () => void;
  /** 首屏（Hero 可见）时整组收起，让画面整屏呈现 */
  hidden?: boolean;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);

  function goTours() {
    setOpen(false);
    onTours();
  }

  function goPlan() {
    setOpen(false);
    onPlan();
  }

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-out md:hidden ${
        hidden ? "pointer-events-none translate-y-full" : "translate-y-0"
      }`}
      aria-label="Main navigation"
      aria-hidden={hidden ? true : undefined}
    >
      <div
        id="mobile-dock-actions"
        className={`w-full overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          open ? "max-h-16 opacity-100" : "max-h-0 opacity-0"
        }`}
        inert={!open ? true : undefined}
      >
        <div className="flex border-t border-line bg-surface">
          <button
            type="button"
            onClick={goTours}
            className="flex h-14 flex-1 items-center justify-center bg-cta text-[13px] font-medium text-paper"
          >
            {t(copy.dock.tours)}
          </button>
          <button
            type="button"
            onClick={goPlan}
            className="flex h-14 flex-1 items-center justify-center border-l border-line text-[13px] font-medium text-ink"
          >
            {t(copy.dock.plan)}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-dock-actions"
        aria-label={open ? t(copy.dock.collapse) : t(copy.dock.expand)}
        className="flex h-9 w-12 items-center justify-center text-[#5C5C5A]"
      >
        <IconChevronsUp
          className={`h-5 w-5 transition-transform duration-300 ${
            open ? "rotate-180" : "dock-breathe"
          }`}
        />
      </button>
    </nav>
  );
}
