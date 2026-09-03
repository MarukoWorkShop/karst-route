import type { ReactNode } from "react";
import type { RouteId, Tx } from "@/types";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { asset } from "@/lib/asset";
import { EXCL_LABELS, INCL_LABELS, routeFacts } from "@/data/tourFacts";
import { reviewsForRoute } from "@/data/reviews";
import { routeContent, type RouteContent } from "@/content/routes";
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
  /** YAML 缺失或损坏时的保底内容（代码里的默认值） */
  const fallbackFor = (id: RouteId): RouteContent => {
    const f = routeFacts[id];
    const c = copy.tours as unknown as Record<string, Tx>;
    return {
      badge: c[`${id}Badge`],
      name: c[`${id}Name`],
      tagline: c[`${id}Tagline`],
      regions: c[`${id}Regions`],
      feature: c[`${id}Feature`],
      days: c[`${id}Days`],
      entry: c[`${id}Entry`],
      exit: c[`${id}Exit`],
      audience: c[`${id}For`],
      price: f.price,
      included: [...f.included],
      excluded: [...f.excluded],
    };
  };

  // 内容以 content/routes/*.yaml 为准，缺失字段自动回退到上面的默认值
  const c1 = routeContent("r1", fallbackFor("r1"));
  const c2 = routeContent("r2", fallbackFor("r2"));
  const c3 = routeContent("r3", fallbackFor("r3"));

  return (
    <section id="tours" className="scroll-mt-24 py-12 md:py-16">
      <div className="page-col">
        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          <RouteCard
            routeId="r1"
            src={asset("/tours/r1-kunming-exit.jpg")}
            content={c1}
            active={route === "r1"}
            onView={() => onPick("r1")}
            onQuote={() => onQuote("r1")}
          />
          <RouteCard
            routeId="r2"
            src={asset("/tours/r2-nanning-loop.jpg")}
            content={c2}
            active={route === "r2"}
            onView={() => onPick("r2")}
            onQuote={() => onQuote("r2")}
          />
          <RouteCard
            routeId="r3"
            src={asset("/destinations/detian.jpg")}
            content={c3}
            active={route === "r3"}
            onView={() => onPick("r3")}
            onQuote={() => onQuote("r3")}
          />
        </div>
      </div>
    </section>
  );
}

function RouteCard({
  routeId,
  src,
  content,
  active,
  onView,
  onQuote,
}: {
  routeId: RouteId;
  src: string;
  content: RouteContent;
  active: boolean;
  onView: () => void;
  onQuote: () => void;
}) {
  const { t } = useLocale();
  const reviewCount = reviewsForRoute(routeId).length;
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
          <img loading="lazy" src={src} alt={t(content.name)} className="h-full w-full object-cover" />
          <span className="absolute top-3 left-3 rounded-md bg-paper/92 px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] text-cta backdrop-blur-sm">
            {t(content.badge)}
          </span>
          <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-night/75 via-night/10 to-transparent" />
          <span className="absolute right-3.5 bottom-3.5 left-3.5">
            <span className="block text-[20px] leading-tight font-medium text-paper md:text-2xl">
              {t(content.name)}
            </span>
            <span className="mt-1 block text-[11px] leading-4 text-paper/80">
              {t(content.tagline)}
            </span>
          </span>
        </span>
        <span className="flex flex-wrap gap-1.5 px-3.5 pt-3 pb-1">
          {t(content.regions).split(" · ").map((seg, i) => (
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
        <Meta icon={<IconClock className="h-4 w-4" />} label={t(copy.tours.duration)} value={t(content.days)} />
        <Meta icon={<IconTakeoff className="h-4 w-4" />} label={t(copy.tours.entry)} value={t(content.entry)} />
        <Meta icon={<IconLanding className="h-4 w-4" />} label={t(copy.tours.exit)} value={t(content.exit)} />
        <Meta icon={<IconUsers className="h-4 w-4" />} label={t(copy.tours.for)} value={t(content.audience)} />
      </div>
      <div className="flex items-end justify-between gap-3 border-t border-line bg-paper px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.08em] text-ink-soft uppercase">
            {t(copy.tours.priceLabel)}
          </p>
          <p className="mt-0.5 text-[18px] font-semibold tracking-[-0.01em] text-cta">
            {t(content.price)}
          </p>
        </div>
        {reviewCount > 0 ? (
          <p className="shrink-0 pb-0.5 text-[11px] text-ink-soft">
            <span className="text-gold">★</span>{" "}
            {t(copy.tours.reviews).replace("{n}", String(reviewCount))}
          </p>
        ) : null}
      </div>
      <div className="border-t border-line bg-paper px-4 py-4">
        <p className="text-[12.5px] leading-[22px] text-ink-soft">{t(content.feature)}</p>
      </div>
      {/* 费用项按 id 标签渲染：后台表格勾选的 id 数组直接驱动这里 */}
      <div className="border-t border-line px-4 py-3.5">
        <p className="mb-2 text-[10px] font-semibold tracking-[0.1em] text-cta uppercase">
          {t(copy.tours.included)}
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {content.included.map((id) => (
            <li
              key={id}
              className="inline-flex items-center gap-1 rounded-full bg-cta/8 px-2.5 py-[5px] text-[11px] font-medium text-cta"
            >
              <CheckMark />
              {t(INCL_LABELS[id])}
            </li>
          ))}
        </ul>
        <p className="mt-3.5 mb-2 text-[10px] font-semibold tracking-[0.1em] text-ink-soft uppercase">
          {t(copy.tours.excluded)}
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {content.excluded.map((id) => (
            <li
              key={id}
              className="inline-flex items-center gap-1 rounded-full bg-sage px-2.5 py-[5px] text-[11px] text-ink-soft"
            >
              <DashMark />
              {t(EXCL_LABELS[id])}
            </li>
          ))}
        </ul>
        <a
          href="#plan"
          className="mt-3.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-cta underline-offset-[3px] hover:underline"
        >
          {t(copy.tours.quote)}
          <IconArrow />
        </a>
        <button
          type="button"
          onClick={onQuote}
          className="cta-sheen mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-cta px-4 py-[11px] text-[13px] font-medium text-paper transition-colors hover:bg-cta-press"
        >
          {t(copy.tours.quoteBar)}
          <IconArrow />
        </button>
      </div>
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

function CheckMark() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M2 5.8 4.2 8 9 2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashMark() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M2.5 5.5h6" strokeLinecap="round" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M2.5 6.5h7M7 4l2.5 2.5L7 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
