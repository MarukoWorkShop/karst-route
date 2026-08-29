import type { ReactNode } from "react";
import type { RouteId } from "@/types";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { asset } from "@/lib/asset";
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
}: {
  route: RouteId;
  onPick: (id: RouteId) => void;
  onQuote: (id: RouteId) => void;
}) {
  const { t } = useLocale();
  return (
    <section id="tours" className="scroll-mt-24 py-12 md:py-16">
      <div className="page-col">
        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          <RouteCard
            src={asset("/tours/r1-kunming-exit.jpg")}
            badge={t(copy.tours.r1Badge)}
            name={t(copy.tours.r1Name)}
            tagline={t(copy.tours.r1Tagline)}
            regions={t(copy.tours.r1Regions)}
            feature={t(copy.tours.r1Feature)}
            days={t(copy.tours.r1Days)}
            entry={t(copy.tours.r1Entry)}
            exit={t(copy.tours.r1Exit)}
            audience={t(copy.tours.r1For)}
            active={route === "r1"}
            onView={() => onPick("r1")}
          />
          <RouteCard
            src={asset("/tours/r2-nanning-loop.jpg")}
            badge={t(copy.tours.r2Badge)}
            name={t(copy.tours.r2Name)}
            tagline={t(copy.tours.r2Tagline)}
            regions={t(copy.tours.r2Regions)}
            feature={t(copy.tours.r2Feature)}
            days={t(copy.tours.r2Days)}
            entry={t(copy.tours.r2Entry)}
            exit={t(copy.tours.r2Exit)}
            audience={t(copy.tours.r2For)}
            active={route === "r2"}
            onView={() => onPick("r2")}
          />
        </div>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => onQuote(route)}
            className="text-[14px] font-medium text-cta underline underline-offset-[3px]"
          >
            {t(copy.tours.inquire)}
          </button>
        </div>
      </div>
    </section>
  );
}

function RouteCard({
  src,
  badge,
  name,
  tagline,
  regions,
  feature,
  days,
  entry,
  exit,
  audience,
  active,
  onView,
}: {
  src: string;
  badge: string;
  name: string;
  tagline: string;
  regions: string;
  feature: string;
  days: string;
  entry: string;
  exit: string;
  audience: string;
  active: boolean;
  onView: () => void;
}) {
  const { t } = useLocale();
  return (
    <article
      className={`overflow-hidden rounded-xl bg-surface text-left ${
        active ? "ring-2 ring-cta" : "ring-1 ring-line"
      }`}
    >
      <button
        type="button"
        onClick={onView}
        aria-pressed={active}
        className="block w-full text-left"
      >
        <span className="relative block aspect-[4/3] overflow-hidden bg-bone">
          <img src={src} alt={name} className="h-full w-full object-cover" />
          <span className="absolute top-3 left-3 rounded-md bg-paper/92 px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] text-cta backdrop-blur-sm">
            {badge}
          </span>
          <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-night/75 via-night/10 to-transparent" />
          <span className="absolute right-3.5 bottom-3.5 left-3.5">
            <span className="block text-[20px] leading-tight font-medium text-paper md:text-2xl">
              {name}
            </span>
            <span className="mt-1 block text-[11px] leading-4 text-paper/80">
              {tagline}
            </span>
          </span>
        </span>
        <span className="flex flex-wrap gap-1.5 px-3.5 pt-3 pb-1">
          {regions.split(" · ").map((seg, i) => (
            <span
              key={`${seg}-${i}`}
              className="rounded-full bg-cta/8 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.03em] text-cta"
            >
              {seg}
            </span>
          ))}
        </span>
      </button>
      <div className="mt-1 grid grid-cols-2 gap-px border-t border-line bg-line">
        <Meta icon={<IconClock className="h-4 w-4" />} label={t(copy.tours.duration)} value={days} />
        <Meta icon={<IconTakeoff className="h-4 w-4" />} label={t(copy.tours.entry)} value={entry} />
        <Meta icon={<IconLanding className="h-4 w-4" />} label={t(copy.tours.exit)} value={exit} />
        <Meta icon={<IconUsers className="h-4 w-4" />} label={t(copy.tours.for)} value={audience} />
      </div>
      <p className="border-t border-line bg-paper px-4 py-4 text-[12.5px] leading-[22px] text-ink-soft">
        {feature}
      </p>
    </article>
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
    <span className="flex items-center gap-2 bg-surface px-3.5 py-2.5">
      <span className="shrink-0 text-ink-soft" aria-hidden>
        {icon}
      </span>
      <span>
        <span className="block text-[9.5px] tracking-[0.07em] text-ink-soft uppercase">
          {label}
        </span>
        <span className="block text-[12px] font-medium text-ink">{value}</span>
      </span>
    </span>
  );
}
