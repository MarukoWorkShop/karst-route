import type { ReactNode } from "react";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconSparkles } from "@/components/icons";

export function MobileDock({
  onTours,
  onPlan,
}: {
  onTours: () => void;
  onPlan: () => void;
}) {
  const { t } = useLocale();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      <DockBtn label={t(copy.dock.tours)} primary onClick={onTours}>
        <span className="text-[11px] font-medium">A</span>
      </DockBtn>
      <DockBtn label={t(copy.dock.plan)} onClick={onPlan}>
        <IconSparkles className="h-4 w-4" />
      </DockBtn>
    </nav>
  );
}

function DockBtn({
  label,
  primary,
  onClick,
  children,
}: {
  label: string;
  primary?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] ${
        primary ? "text-cta" : "text-ink-soft"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          primary ? "bg-cta text-white" : "border border-line"
        }`}
      >
        {children}
      </span>
      {label}
    </button>
  );
}
