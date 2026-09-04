import { useEffect, useState, type ReactNode } from "react";
import type { RouteId, Tx } from "@/types";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { asset } from "@/lib/asset";
import { cosUrl } from "@/lib/media";
import { EXCL_LABELS, INCL_LABELS, routeFacts } from "@/data/tourFacts";
import { reviewsForRoute } from "@/data/reviews";
import { routeMedia } from "@/data/routeMedia";
import { routeContent, type RouteContent } from "@/content/routes";
import {
  IconClock,
  IconClose,
  IconLanding,
  IconTakeoff,
  IconUsers,
} from "@/components/icons";

const ROUTE_IDS: RouteId[] = ["r1", "r2", "r3"];

/** Images on Pages; intro.mp4 is gitignored → COS in production, local public/ in dev. */
function routeVideoSrc(path: string) {
  return import.meta.env.DEV ? asset(`/${path}`) : cosUrl(path);
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
  const [expanded, setExpanded] = useState<RouteId | null>(null);

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
      price: f.price,
      cover: media.cover,
      included: [...f.included],
      excluded: [...f.excluded],
    };
  };

  const contents = Object.fromEntries(
    ROUTE_IDS.map((id) => [id, routeContent(id, fallbackFor(id))]),
  ) as Record<RouteId, RouteContent>;

  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(null);
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
  }

  return (
    <section id="tours" className="scroll-mt-24 py-12 md:py-16">
      <div className="mx-auto w-full max-w-[1180px] px-4 md:px-8">
        {/* 原生三列竖条卡片：初始等高，hover 抬起 */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:items-stretch lg:gap-4 lg:pt-10 lg:pb-6">
          {ROUTE_IDS.map((id) => (
            <RouteCard
              key={id}
              routeId={id}
              content={contents[id]}
              active={route === id}
              onOpen={() => openCard(id)}
              onOpenItinerary={() => onOpenItinerary(id)}
            />
          ))}
        </div>
      </div>

      {expanded ? (
        <RouteExpandModal
          routeId={expanded}
          content={contents[expanded]}
          onClose={() => setExpanded(null)}
          onOpenItinerary={() => {
            const id = expanded;
            setExpanded(null);
            onOpenItinerary(id);
          }}
        />
      ) : null}
    </section>
  );
}

/** 列表态：完整竖条卡片（与原先三列布局一致） */
function RouteCard({
  routeId,
  content,
  active,
  onOpen,
  onOpenItinerary,
}: {
  routeId: RouteId;
  content: RouteContent;
  active: boolean;
  onOpen: () => void;
  onOpenItinerary: () => void;
}) {
  const { t } = useLocale();
  const cover = asset(`/${routeMedia[routeId].cover}`);
  const reviewCount = reviewsForRoute(routeId).length;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-surface text-left ring-1 ring-line shadow-[0_8px_22px_rgba(16,28,22,0.06)] will-change-transform transition-[transform,box-shadow,ring-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-10 hover:-translate-y-3 hover:ring-gold/70 hover:shadow-[0_0_0_1px_rgba(168,140,86,0.45),0_0_28px_rgba(168,140,86,0.28),0_22px_44px_rgba(16,28,22,0.14)]"
    >
      {/* 整卡可点展开（除底部 CTA）；cursor-zoom-in ≈ 放大/展开光标 */}
      <button
        type="button"
        onClick={onOpen}
        aria-pressed={active}
        aria-label={`${t(copy.tours.expandOpen)}：${t(content.name)}`}
        className="absolute inset-0 z-[1] cursor-zoom-in rounded-xl"
      />

      <div className="relative block aspect-[4/3] overflow-hidden bg-bone">
        <img
          loading="lazy"
          src={cover}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
        />
        <span className="absolute top-3 left-3 rounded-md bg-paper/92 px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] text-cta backdrop-blur-sm">
          {t(content.badge)}
        </span>
        <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-night/75 via-night/10 to-transparent" />
        <span className="absolute right-3.5 bottom-3.5 left-3.5">
          <span className="block text-[20px] leading-tight font-medium text-paper md:text-2xl">
            {t(content.name)}
          </span>
          <span className="mt-1 block text-[11px] leading-4 text-paper/80">{t(content.tagline)}</span>
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 px-3.5 pt-3 pb-1">
        {t(content.regions).split(" · ").map((seg, i) => (
          <span
            key={`${seg}-${i}`}
            className="rounded-full bg-cta/8 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.03em] text-cta"
          >
            {seg}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-2 gap-px border-t border-line bg-line">
        <Meta icon={<IconClock className="h-4 w-4" />} label={t(copy.tours.duration)} value={t(content.days)} />
        <Meta icon={<IconTakeoff className="h-4 w-4" />} label={t(copy.tours.entry)} value={t(content.entry)} />
        <Meta icon={<IconLanding className="h-4 w-4" />} label={t(copy.tours.exit)} value={t(content.exit)} />
        <Meta icon={<IconUsers className="h-4 w-4" />} label={t(copy.tours.for)} value={t(content.audience)} />
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-line bg-paper px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.08em] text-ink-soft uppercase">{t(copy.tours.priceLabel)}</p>
          <p className="mt-0.5 text-[18px] font-semibold tracking-[-0.01em] text-cta">{t(content.price)}</p>
        </div>
        {reviewCount > 0 ? (
          <p className="shrink-0 pb-0.5 text-[11px] text-ink-soft">
            <span className="text-gold">★</span>{" "}
            {t(copy.tours.reviews).replace("{n}", String(reviewCount))}
          </p>
        ) : null}
      </div>

      <div className="flex-1 border-t border-line bg-paper px-4 py-4">
        <FeatureParagraphs
          text={t(content.feature)}
          className="text-[12.5px] leading-[22px] text-ink-soft"
        />
      </div>

      <div className="mt-auto border-t border-line px-4 pt-3.5 pb-3.5">
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
        {/* 高于展开热区，保留手型光标 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenItinerary();
          }}
          className="cta-sheen relative z-[2] mt-3.5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-cta px-4 py-[11px] text-[13px] font-medium text-paper transition-colors hover:bg-cta-press"
        >
          {t(copy.tours.quoteBar)}
          <IconArrow />
        </button>
      </div>
    </article>
  );
}

/**
 * 居中展开大卡：左 2×2 等分媒体格（3 图 + 视频），右文案完整呈现（无文案内滚动）。
 * 整卡过高时由遮罩层滚动，介绍本身完整铺开。
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
  const reviewCount = reviewsForRoute(routeId).length;
  const [videoOk, setVideoOk] = useState(false);

  useEffect(() => {
    setVideoOk(false);
  }, [routeId]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-10 md:py-14">
      <button
        type="button"
        aria-label={t(copy.tours.expandClose)}
        className="absolute inset-0 bg-night/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <article
        role="dialog"
        aria-modal="true"
        className="relative z-[1] my-auto grid w-[min(80vw,1080px)] grid-cols-1 gap-5 rounded-xl bg-surface p-5 pt-12 shadow-[0_24px_64px_rgba(16,28,22,0.22)] ring-1 ring-line md:grid-cols-[1.05fr_1fr] md:gap-6 md:p-6 md:pt-6"
      >
        <button
          type="button"
          aria-label={t(copy.tours.expandClose)}
          onClick={onClose}
          className="absolute top-3 right-3 z-[2] flex h-8 w-8 items-center justify-center rounded-full border border-line bg-paper text-ink-soft transition hover:border-cta/40 hover:text-cta"
        >
          <IconClose className="h-4 w-4" />
        </button>

        {/* 左：四个均等方格（圆角克制） */}
        <div className="grid grid-cols-2 gap-2 self-start">
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
                <p className="text-[11px] leading-4 text-ink-soft">{t(copy.tours.videoSoon)}</p>
                <p className="font-mono text-[9px] text-ink-soft/65">{media.video}</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* 右：完整文案，不设文案内滚动 */}
        <div className="flex min-w-0 flex-col">
          <p className="text-[11px] font-bold tracking-[0.12em] text-cta uppercase">{t(content.badge)}</p>
          <h3 className="mt-1 pr-8 text-[24px] leading-tight font-medium text-ink md:text-[26px]">
            {t(content.name)}
          </h3>
          <p className="mt-1.5 text-[13px] leading-5 text-ink-soft">{t(content.tagline)}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {t(content.regions).split(" · ").map((seg, i) => (
              <span
                key={`${seg}-${i}`}
                className="rounded-full bg-cta/8 px-2.5 py-0.5 text-[11px] font-medium text-cta"
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
            <FeatureParagraphs
              text={t(content.feature)}
              className="text-[13px] leading-[22px] text-ink-soft"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {content.included.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-cta/8 px-2 py-1 text-[10.5px] font-medium text-cta"
              >
                <CheckMark />
                {t(INCL_LABELS[id])}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-4">
            <div>
              <p className="text-[10px] tracking-[0.08em] text-ink-soft uppercase">{t(copy.tours.priceLabel)}</p>
              <p className="mt-0.5 text-[20px] font-semibold tracking-[-0.01em] text-cta">{t(content.price)}</p>
              {reviewCount > 0 ? (
                <p className="mt-0.5 text-[11px] text-ink-soft">
                  <span className="text-gold">★</span>{" "}
                  {t(copy.tours.reviews).replace("{n}", String(reviewCount))}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onOpenItinerary}
              className="cta-sheen inline-flex shrink-0 items-center gap-2 rounded-lg bg-cta px-4 py-2.5 text-[13px] font-medium text-paper hover:bg-cta-press"
            >
              {t(copy.tours.quoteBar)}
              <IconArrow />
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

function FeatureParagraphs({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const paras = text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (paras.length === 0) return null;
  return (
    <div className="flex flex-col gap-[1.75em]">
      {paras.map((para, i) => (
        <p key={i} className={className}>
          {para}
        </p>
      ))}
    </div>
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
    <span className="flex items-center gap-2 bg-surface px-3 py-2.5">
      <span className="shrink-0 text-ink-soft" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[9.5px] tracking-[0.07em] text-ink-soft uppercase">{label}</span>
        <span className="block truncate text-[12px] font-medium text-ink">{value}</span>
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
