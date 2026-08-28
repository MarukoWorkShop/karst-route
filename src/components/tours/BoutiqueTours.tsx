import type { ReactNode } from "react";
import type { RouteId } from "@/types";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import {
  IconClock,
  IconLanding,
  IconTakeoff,
  IconUsers,
} from "@/components/icons";

export function BoutiqueTours({
  route,
  onPick,
  onQuote,
  children,
}: {
  route: RouteId;
  onPick: (id: RouteId) => void;
  onQuote: (id: RouteId) => void;
  children: ReactNode;
}) {
  const { t } = useLocale();
  return (
    <section id="tours" className="scroll-mt-24 py-16">
      <div className="mx-auto max-w-xl px-4">
        <p className="text-[13px] font-medium tracking-[0.16em] text-cta">
          {t(copy.tours.kicker)}
        </p>
        <h2 className="mt-2 text-[22px] leading-8 font-medium md:text-[28px] md:leading-9">
          {t(copy.tours.h2)}
        </h2>
        <p className="mt-2 text-[16px] leading-7 text-ink-soft">{t(copy.tours.sub)}</p>
      </div>
      <div className="mx-auto mt-8 grid max-w-5xl gap-6 px-4 md:grid-cols-2 md:gap-8">
        <RouteCard
          src="/tours/r1-kunming-exit.jpg"
          title={t(copy.tours.r1Title)}
          days={t(copy.tours.r1Days)}
          entry={t(copy.tours.r1Entry)}
          exit={t(copy.tours.r1Exit)}
          audience={t(copy.tours.r1For)}
          active={route === "r1"}
          onView={() => onPick("r1")}
        />
        <RouteCard
          src="/tours/r2-nanning-loop.jpg"
          title={t(copy.tours.r2Title)}
          days={t(copy.tours.r2Days)}
          entry={t(copy.tours.r2Entry)}
          exit={t(copy.tours.r2Exit)}
          audience={t(copy.tours.r2For)}
          active={route === "r2"}
          onView={() => onPick("r2")}
        />
      </div>
      <div className="mx-auto mt-8 max-w-xl px-4">
        <button
          type="button"
          onClick={() => onQuote(route)}
          className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-cta text-[16px] font-medium text-white active:bg-cta-press"
        >
          {t(copy.tours.quote)}
        </button>
      </div>
      {children}
    </section>
  );
}

function RouteCard({
  src,
  title,
  days,
  entry,
  exit,
  audience,
  active,
  onView,
}: {
  src: string;
  title: string;
  days: string;
  entry: string;
  exit: string;
  audience: string;
  active: boolean;
  onView: () => void;
}) {
  const { t } = useLocale();
  return (
    <button
      type="button"
      onClick={onView}
      aria-pressed={active}
      className={`tour-card overflow-hidden rounded-lg bg-surface text-left ring-1 transition duration-200 md:hover:-translate-y-0.5 ${
        active ? "ring-cta" : "ring-line"
      }`}
    >
      <span className="relative block aspect-[16/10] overflow-hidden bg-bone">
        <img src={src} alt={title} className="h-full w-full object-cover" />
        <span className="absolute inset-0 bg-night/15" />
      </span>
      <span className="block px-6 py-6">
        <span className="block text-[22px] leading-8 font-medium text-ink md:text-[24px] md:leading-9">
          {title}
        </span>
        <span className="mt-5 flex flex-col gap-3">
          <Meta icon={<IconClock className="h-[18px] w-[18px]" />} label={t(copy.tours.duration)} value={days} />
          <Meta icon={<IconTakeoff className="h-[18px] w-[18px]" />} label={t(copy.tours.entry)} value={entry} />
          <Meta icon={<IconLanding className="h-[18px] w-[18px]" />} label={t(copy.tours.exit)} value={exit} />
          <Meta icon={<IconUsers className="h-[18px] w-[18px]" />} label={t(copy.tours.for)} value={audience} />
        </span>
      </span>
    </button>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <span className="flex items-center gap-3 text-[15px] leading-6 text-ink">
      <span className="text-ink-soft" aria-hidden>
        {icon}
      </span>
      <span className="sr-only">{label}</span>
      {value}
    </span>
  );
}
