import { useEffect, useRef, useState, type ReactNode } from "react";
import type { RouteId, Tx } from "@/types";
import { about } from "@/content/about";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { asset } from "@/lib/asset";
import { cosUrl } from "@/lib/media";
import { EXCL_LABELS, routeFacts } from "@/data/tourFacts";
import { routeMedia } from "@/data/routeMedia";
import { routeContent, type RouteContent } from "@/content/routes";
import { formatMoney } from "@/lib/estimate";
import { marketPriceRange } from "@/data/routePricing";
import { useFxRates, usePriceCurrency } from "@/hooks/useFx";
import { CurrencyToggle } from "@/components/ui/CurrencyToggle";
import { SectionIntro } from "@/components/ui/SectionIntro";
import {
  IconChevron,
  IconClock,
  IconClose,
  IconLanding,
  IconTakeoff,
  IconUsers,
} from "@/components/icons";

const ROUTE_IDS: RouteId[] = ["r1", "r2", "r3"];

/** 一次页面加载里每张卡只记一次曝光。模块级集合能扛住开发模式的重复挂载。 */
const impressedRoutes = new Set<RouteId>();

function trackRoute(
  name: "route_card_impression" | "route_card_open" | "route_card_close",
  payload: Record<string, string | number>,
) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, payload);
  if (import.meta.env.DEV) console.log(`[GA4] ${name}`, payload);
}

/** Images on Pages; intro.mp4 is gitignored → COS in production, local public/ in dev. */
function routeVideoSrc(path: string) {
  return import.meta.env.DEV ? asset(`/${path}`) : cosUrl(path);
}

function QuoteBarLabel() {
  const { t } = useLocale();
  return (
    <span className="type-btn flex min-w-0 flex-1 flex-col items-center text-center font-semibold">
      <span>{t(copy.tours.quoteBarLead)}</span>
      <span>{t(copy.tours.quoteBarDetail)}</span>
    </span>
  );
}

export function BoutiqueTours({
  route,
  onSelect,
  onOpenItinerary,
}: {
  route: RouteId;
  onSelect: (id: RouteId) => void;
  onOpenItinerary: (id: RouteId) => void;
}) {
  const { locale, t } = useLocale();
  const [expanded, setExpanded] = useState<RouteId | null>(null);
  const layerStart = useRef<{ id: RouteId; at: number } | null>(null);
  const settleRef = useRef<() => void>(() => {});

  const fallbackFor = (id: RouteId): RouteContent => {
    const f = routeFacts[id];
    const c = copy.tours as unknown as Record<string, Tx>;
    const media = routeMedia[id];
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
      priceCny: f.priceCny,
      cover: media.cover,
      included: [...f.included],
      excluded: [...f.excluded],
    };
  };

  const contents = Object.fromEntries(
    ROUTE_IDS.map((id) => [id, routeContent(id, fallbackFor(id))]),
  ) as Record<RouteId, RouteContent>;

  settleRef.current = () => {
    const start = layerStart.current;
    layerStart.current = null;
    if (!start) return;
    const viewMs = Math.round(performance.now() - start.at);
    if (viewMs < 500) {
      if (import.meta.env.DEV) {
        console.log(`[GA4] route_card_close skipped ${start.id} ${viewMs}ms`);
      }
      return;
    }
    trackRoute("route_card_close", {
      route_id: start.id,
      route_title: contents[start.id].name.en,
      language: locale,
      view_ms: viewMs,
    });
  };

  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        settleRef.current();
        setExpanded(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  function openCard(id: RouteId) {
    onSelect(id);
    setExpanded(id);
    layerStart.current = { id, at: performance.now() };
    trackRoute("route_card_open", {
      route_id: id,
      route_title: contents[id].name.en,
      language: locale,
      page_location: window.location.href,
    });
  }

  function closeLayer() {
    settleRef.current();
    setExpanded(null);
  }

  return (
    <section id="tours" className="scroll-mt-24 py-14 md:py-16">
      <div className="mx-auto w-full max-w-[1180px] px-3 md:px-8">
        <SectionIntro
          title={t(copy.tours.moduleTitle)}
          sub={t(copy.tours.moduleSub)}
          desc={t(about.toursIntro)}
        />

        <div className="mt-7 grid grid-cols-1 items-start gap-4 md:mt-8 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-4">
          {ROUTE_IDS.map((id) => (
            <RouteCard
              key={id}
              routeId={id}
              content={contents[id]}
              active={route === id}
              onOpen={() => openCard(id)}
            />
          ))}
        </div>
      </div>

      {expanded ? (
        <RouteExpandModal
          routeId={expanded}
          content={contents[expanded]}
          onClose={closeLayer}
          onOpenItinerary={() => {
            const id = expanded;
            settleRef.current();
            setExpanded(null);
            if (id) onOpenItinerary(id);
          }}
        />
      ) : null}
    </section>
  );
}

/** 列表态：以影像和关键信息为主；完整内容进入详情弹层。 */
function RouteCard({
  routeId,
  content,
  active,
  onOpen,
}: {
  routeId: RouteId;
  content: RouteContent;
  active: boolean;
  onOpen: () => void;
}) {
  const { t, locale } = useLocale();
  const { rates } = useFxRates();
  const { currency } = usePriceCurrency();
  const cardRef = useRef<HTMLElement>(null);
  const cover = asset(`/${routeMedia[routeId].cover}`);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || impressedRoutes.has(routeId)) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.25);
        if (!visible || impressedRoutes.has(routeId)) return;
        impressedRoutes.add(routeId);
        io.disconnect();
        trackRoute("route_card_impression", {
          route_id: routeId,
          route_title: content.name.en,
          language: locale,
          page_location: window.location.href,
        });
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [routeId, locale, content.name.en]);
  const range = marketPriceRange(routeId);
  const fromPrice = range?.adultFrom ?? content.priceCny.from;
  const price = formatMoney(fromPrice, { locale, currency, rates });

  return (
    <article
      ref={cardRef}
      className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-night text-left ring-1 ring-line shadow-[0_8px_24px_rgba(16,28,22,0.08)] will-change-transform transition-[transform,box-shadow,ring-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-10 hover:-translate-y-1 hover:ring-gold/60 hover:shadow-[0_18px_38px_rgba(16,28,22,0.18)] md:aspect-[4/5] lg:aspect-[3/4]"
    >
      <button
        type="button"
        onClick={onOpen}
        aria-pressed={active}
        aria-label={`${t(copy.tours.expandOpen)}：${t(content.name)}`}
        className="absolute inset-0 z-[1] cursor-zoom-in rounded-xl"
      />

      <img
        loading="lazy"
        src={cover}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-night/35 via-night/5 to-night/95" />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-cta-press/45 via-transparent to-transparent" />

      <p className="type-meta absolute top-5 right-5 z-[2] text-paper">
        {t(content.days)}
      </p>

      <div className="pointer-events-none absolute right-5 bottom-5 left-5 z-[2] text-paper md:right-6 md:bottom-6 md:left-6">
        <p className="type-meta text-gold-bright">{t(content.badge)}</p>
        <h3 className="type-h2 mt-2 text-paper">{t(content.name)}</h3>
        <p className="type-aux mt-2 line-clamp-2 text-paper/75">{t(content.regions)}</p>
        <p className="type-body mt-3 line-clamp-2 text-paper/90">{t(content.tagline)}</p>
        <p className="type-sub mt-4 italic text-paper/85">
          {t(copy.tours.priceFrom)} {price} {t(copy.tours.pricePerPerson)}
        </p>
        <span className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-paper/75 px-5 py-2.5 text-sm font-semibold tracking-[0.08em] text-paper uppercase transition-colors group-hover:border-paper group-hover:bg-paper group-hover:text-cta">
          {t(copy.tours.exploreTrip)}
          <IconArrow className="shrink-0" />
        </span>
      </div>
    </article>
  );
}

/**
 * 展开详情：手机全屏；桌面居中双栏大卡。
 */
function RouteExpandModal({
  routeId,
  content,
  onClose,
  onOpenItinerary,
}: {
  routeId: RouteId;
  content: RouteContent;
  onClose: () => void;
  onOpenItinerary: () => void;
}) {
  const { t } = useLocale();
  const media = routeMedia[routeId];
  const [videoOk, setVideoOk] = useState(false);

  useEffect(() => {
    setVideoOk(false);
  }, [routeId]);

  return (
    <div className="fixed inset-0 z-50 flex md:items-start md:justify-center md:overflow-y-auto md:px-4 md:py-14">
      <button
        type="button"
        aria-label={t(copy.tours.expandClose)}
        className="absolute inset-0 bg-night/55 backdrop-blur-[2px] md:bg-night/45"
        onClick={onClose}
      />
      <article
        role="dialog"
        aria-modal="true"
        className="relative z-[1] flex h-dvh w-full flex-col overflow-y-auto overscroll-contain bg-surface p-4 pt-[calc(env(safe-area-inset-top)+3.5rem)] shadow-none ring-0 md:my-auto md:grid md:h-auto md:max-h-none md:w-[min(92vw,1080px)] md:grid-cols-[1.05fr_1fr] md:gap-6 md:overflow-visible md:rounded-xl md:p-6 md:pt-6 md:shadow-[0_24px_64px_rgba(16,28,22,0.22)] md:ring-1 md:ring-line"
      >
        <button
          type="button"
          aria-label={t(copy.tours.expandClose)}
          onClick={onClose}
          className="absolute top-[calc(env(safe-area-inset-top)+0.75rem)] right-3 z-[2] flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper text-ink-soft transition hover:border-cta/40 hover:text-cta md:top-3 md:h-8 md:w-8"
        >
          <IconClose className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-2 gap-1.5 self-start md:gap-2">
          {media.gallery.map((path, i) => (
            <div key={path} className="relative aspect-square overflow-hidden rounded-md bg-bone">
              <img
                src={asset(`/${path}`)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
          {media.video ? (
            <div className="relative aspect-square overflow-hidden rounded-md bg-sage ring-1 ring-line">
              <video
                key={media.video}
                className={`absolute inset-0 h-full w-full object-cover ${videoOk ? "opacity-100" : "opacity-0"}`}
                src={routeVideoSrc(media.video)}
                controls={videoOk}
                playsInline
                preload="metadata"
                poster={asset(`/${media.gallery[0]}`)}
                onLoadedData={() => setVideoOk(true)}
                onError={() => setVideoOk(false)}
              />
              {!videoOk ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-3 text-center">
                  <p className="type-aux text-ink-soft">{t(copy.tours.videoSoon)}</p>
                  <p className="type-meta font-mono font-normal normal-case tracking-normal text-ink-soft/65">
                    {media.video}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex min-w-0 flex-1 flex-col md:mt-0">
          <p className="type-meta text-cta">{t(content.badge)}</p>
          <h3 className="type-h3 mt-1 pr-10 text-ink md:pr-8">
            {t(content.name)}
          </h3>
          <p className="type-aux mt-1.5 text-ink-soft">{t(content.tagline)}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {t(content.regions).split(" · ").map((seg, i) => (
              <span
                key={`${seg}-${i}`}
                className="type-chip rounded-full bg-cta/8 px-2.5 py-0.5 text-cta normal-case"
              >
                {seg}
              </span>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-line ring-1 ring-line">
            <Meta icon={<IconClock className="h-3.5 w-3.5" />} label={t(copy.tours.duration)} value={t(content.days)} />
            <Meta icon={<IconTakeoff className="h-3.5 w-3.5" />} label={t(copy.tours.entry)} value={t(content.entry)} />
            <Meta icon={<IconLanding className="h-3.5 w-3.5" />} label={t(copy.tours.exit)} value={t(content.exit)} />
            <Meta icon={<IconUsers className="h-3.5 w-3.5" />} label={t(copy.tours.for)} value={t(content.audience)} />
          </div>

          <div className="mt-4">
            <FeatureParagraphs text={t(content.feature)} />
          </div>

          <div className="mt-5 border-t border-line pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0">
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end md:justify-between">
              <MarketBudget routeId={routeId} priceCny={content.priceCny} size="modal" />
              <button
                type="button"
                onClick={onOpenItinerary}
                className="cta-sheen inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cta px-4 py-3 text-paper hover:bg-cta-press md:w-auto md:shrink-0"
              >
                <QuoteBarLabel />
                <IconArrow className="shrink-0" />
              </button>
            </div>

            <div className="mt-4 border-t border-line/70 pt-3">
              <p className="type-meta text-ink-soft">{t(copy.tours.excluded)}</p>
              <p className="type-aux mt-1 text-ink-soft">
                {content.excluded.map((id) => t(EXCL_LABELS[id])).join(" · ")}
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

function FeatureParagraphs({
  text,
  collapsible = false,
}: {
  text: string;
  /** 首页列表卡：默认只显示第一段，点小图标展开全文 */
  collapsible?: boolean;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const paras = text
    .split(/\n\s*\n/)
    .map((s) => s.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (paras.length === 0) return null;

  const canToggle = collapsible && paras.length > 1;
  const shown = canToggle && !open ? paras.slice(0, 1) : paras;

  return (
    <div className="border-l-2 border-gold pl-3">
      <div className="flex flex-col gap-4">
        {shown.map((para, i) => {
          const isLast = i === shown.length - 1;
          return (
            <p key={i} className="type-body text-ink">
              {para}
              {canToggle && isLast ? (
                <button
                  type="button"
                  aria-expanded={open}
                  aria-label={t(open ? copy.tours.featureLess : copy.tours.featureMore)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                  }}
                  className="relative z-[2] ml-1 inline-flex h-4 w-4 translate-y-[-1px] items-center justify-center align-middle rounded-full text-ink-soft transition-colors hover:bg-cta/8 hover:text-cta"
                >
                  <IconChevron
                    className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                  />
                </button>
              ) : null}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function MarketBudget({
  routeId,
  priceCny,
  size: _size,
}: {
  routeId: RouteId;
  priceCny: RouteContent["priceCny"];
  size: "card" | "modal";
}) {
  const { t, locale } = useLocale();
  const { rates } = useFxRates();
  const { currency, setCurrency } = usePriceCurrency();
  const range = marketPriceRange(routeId);
  const titleCls = "type-meta text-ink-soft";
  const money = (v: number) => formatMoney(v, { locale, currency, rates });

  const mainPriceCls = "type-price text-cta";

  if (!range) {
    const fallback =
      priceCny.to != null && priceCny.to !== priceCny.from
        ? `${money(priceCny.from)}–${money(priceCny.to)}`
        : locale === "zh"
          ? `${money(priceCny.from)} ${t(copy.tours.priceFrom)}`
          : `${t(copy.tours.priceFrom)} ${money(priceCny.from)}`;
    return (
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={titleCls}>{t(copy.tours.priceLabel)}</p>
          {locale === "en" ? <CurrencyToggle value={currency} onChange={setCurrency} /> : null}
        </div>
        <p className={`mt-1 ${mainPriceCls}`}>
          {fallback}
          <span className="type-meta ml-1 font-normal normal-case tracking-normal text-ink-soft">
            {t(copy.tours.pricePerPerson)}
          </span>
        </p>
        <p className="type-meta mt-1.5 truncate font-normal normal-case tracking-normal text-ink-soft/80">
          {t(copy.tours.fxNote)}
        </p>
      </div>
    );
  }

  const priceRange =
    range.adultFrom === range.adultTo
      ? money(range.adultFrom)
      : `${money(range.adultFrom)}–${money(range.adultTo)}`;
  const childRange =
    range.childFrom === range.childTo
      ? money(range.childFrom)
      : `${money(range.childFrom)}–${money(range.childTo)}`;
  const bands =
    range.adultFrom === range.adultTo
      ? [range.bandFrom]
      : [range.bandFrom, range.bandTo];

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={titleCls}>{t(copy.tours.priceLabel)}</p>
        {locale === "en" ? <CurrencyToggle value={currency} onChange={setCurrency} /> : null}
      </div>
      <div className="mt-1.5 space-y-2.5">
        <div>
          <p className={mainPriceCls}>
            <span className="mr-1.5 font-semibold text-ink">{t(copy.tours.priceAdult)}</span>
            {priceRange}
            <span className="type-meta ml-1 font-normal normal-case tracking-normal text-ink-soft">
              {t(copy.tours.pricePerPerson)}
            </span>
          </p>
          <BandPeopleHint bands={bands} />
        </div>
        <div>
          <p className={mainPriceCls}>
            <span className="mr-1.5 font-semibold text-ink">{t(copy.tours.priceChild)}</span>
            {childRange}
            <span className="type-meta ml-1 font-normal normal-case tracking-normal text-ink-soft">
              {t(copy.tours.pricePerPerson)}
            </span>
          </p>
          <BandPeopleHint bands={bands} />
        </div>
      </div>
      <p className="type-meta mt-2 truncate font-normal normal-case tracking-normal text-ink-soft/80">
        {t(copy.tours.fxNote)}
      </p>
    </div>
  );
}

/** 人数档：小人 icon + 7-10 · 1-3，字重与附注一致 */
function BandPeopleHint({ bands }: { bands: { minN: number; maxN: number }[] }) {
  return (
    <p className="type-meta mt-0.5 flex flex-wrap items-center gap-x-1.5 font-normal normal-case tracking-normal text-ink-soft/80">
      {bands.map((b, i) => {
        const lo = b.minN <= 1 ? 1 : b.minN;
        const label = `${lo}-${b.maxN}`;
        return (
          <span key={`${label}-${i}`} className="inline-flex items-center gap-0.5">
            {i > 0 ? <span className="text-ink-soft/40" aria-hidden>·</span> : null}
            <IconUsers className="h-2.5 w-2.5" strokeWidth={1.5} aria-hidden />
            <span>{label}</span>
          </span>
        );
      })}
    </p>
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
    <span className="flex items-center gap-2 bg-surface px-2.5 py-2 md:px-3 md:py-2.5">
      <span className="shrink-0 text-ink-soft" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="type-meta block text-ink-soft">{label}</span>
        <span className="type-aux block truncate font-medium text-ink">{value}</span>
      </span>
    </span>
  );
}

function IconArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={className}
      aria-hidden
    >
      <path d="M2.5 6.5h7M7 4l2.5 2.5L7 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
