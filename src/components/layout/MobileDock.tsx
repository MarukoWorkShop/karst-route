import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

export function MobileDock({
  onTours,
  onPlan,
}: {
  onTours: () => void;
  onPlan: () => void;
}) {
  const { t } = useLocale();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Main navigation"
    >
      <button
        type="button"
        onClick={onTours}
        className="flex h-14 flex-1 items-center justify-center bg-cta text-[13px] font-medium text-paper"
      >
        {t(copy.dock.tours)}
      </button>
      <button
        type="button"
        onClick={onPlan}
        className="flex h-14 flex-1 items-center justify-center border-l border-line text-[13px] font-medium text-ink"
      >
        {t(copy.dock.plan)}
      </button>
    </nav>
  );
}
