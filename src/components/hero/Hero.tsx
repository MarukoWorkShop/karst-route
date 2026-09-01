import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconChevron, IconSparkles } from "@/components/icons";
import { heroSlides } from "@/data/heroPanels";
import { themes } from "@/data/themes";
import type { ThemeId } from "@/types";

const SLIDE_MS = 5500;
const SWIPE_PX = 48;

export function Hero({
  onPlanOwn,
  onOpenTheme,
}: {
  onPlanOwn: () => void;
  onOpenTheme?: (id: ThemeId) => void;
}) {
  const { t, locale } = useLocale();
  const [idx, setIdx] = useState(0);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const slide = heroSlides[idx];
  const zh = locale === "zh";
  const theme = themes.find((item) => item.id === slide.themeId);
  const chip = theme ? (zh ? theme.zh.split("・")[0] : theme.en) : "";
  const count = heroSlides.length;

  const go = useCallback((dir: -1 | 1) => {
    setIdx((i) => (i + dir + count) % count);
  }, [count]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = window.setInterval(() => {
      setIdx((i) => (i + 1) % count);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [idx, count]);

  function onPointerDown(e: PointerEvent<HTMLElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as HTMLElement).closest("a, button")) return;
    drag.current = { x: e.clientX, y: e.clientY };
  }

  function onPointerUp(e: PointerEvent<HTMLElement>) {
    const start = drag.current;
    drag.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? 1 : -1);
  }

  return (
    <section
      id="top"
      className="relative min-h-[100svh] overflow-hidden bg-night"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        drag.current = null;
      }}
    >
      <div className="absolute inset-0">
        {heroSlides.map((photo, i) => (
          <img
            key={photo.id}
            src={photo.src}
            alt={i === idx ? t(photo.alt) : ""}
            className={`absolute inset-0 h-full w-full object-cover ${
              i === idx ? "hero-slide-on" : "hero-slide-off"
            }`}
            style={{ objectPosition: photo.pos }}
          />
        ))}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(8,12,10,0.88) 0%, rgba(8,12,10,0.55) 28%, rgba(8,12,10,0.18) 52%, rgba(8,12,10,0.08) 72%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28"
          style={{
            background: "linear-gradient(to bottom, rgba(8,12,10,0.45) 0%, transparent 100%)",
          }}
        />
      </div>

      <button
        type="button"
        aria-label={t(copy.hero.prev)}
        onClick={() => go(-1)}
        className="absolute top-1/2 left-3 z-[2] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-night/35 text-white backdrop-blur-sm md:left-6 md:h-12 md:w-12"
      >
        <IconChevron className="h-5 w-5 rotate-90" />
      </button>
      <button
        type="button"
        aria-label={t(copy.hero.next)}
        onClick={() => go(1)}
        className="absolute top-1/2 right-3 z-[2] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-night/35 text-white backdrop-blur-sm md:right-6 md:h-12 md:w-12"
      >
        <IconChevron className="h-5 w-5 -rotate-90" />
      </button>

      <div className="relative z-[1] flex min-h-[100svh] flex-col justify-end">
        <div className="page-col pb-[calc(96px+env(safe-area-inset-bottom))] md:pb-14">
          <div key={slide.id} className="hero-copy max-w-[640px]">
            <a
              href="#experience"
              aria-label={t(copy.hero.themesAria)}
              onClick={() => onOpenTheme?.(slide.themeId)}
              className="inline-flex rounded-full border border-[#C5A059]/70 bg-night/35 px-3 py-[5px] text-[10px] font-medium tracking-[0.14em] text-[#C5A059] backdrop-blur-[2px] md:text-[11px]"
            >
              {chip}
            </a>

            <h1
              className={`mt-4 font-bold tracking-[-0.02em] text-white md:mt-5 ${
                zh
                  ? "text-[34px] leading-[42px] md:text-[56px] md:leading-[66px]"
                  : "text-[32px] leading-[38px] md:text-[52px] md:leading-[60px]"
              }`}
            >
              {t(slide.title)}
            </h1>

            <p className="mt-3.5 max-w-[520px] text-[15px] leading-[24px] text-white/90 md:mt-4 md:text-[18px] md:leading-[28px]">
              {t(slide.intro)}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 md:mt-8">
              <a
                href="#tours"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-cta px-6 text-center text-[13px] font-medium text-white md:min-h-[52px] md:px-8 md:text-[14px]"
              >
                {t(copy.hero.ctaA)}
              </a>
              <a
                href="#plan"
                onClick={onPlanOwn}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-6 text-center text-[13px] font-medium text-white backdrop-blur-md md:min-h-[52px] md:px-8 md:text-[14px]"
              >
                <IconSparkles className="h-3.5 w-3.5 shrink-0" />
                {t(copy.hero.ctaB)}
              </a>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-1.5 md:mt-10">
            {heroSlides.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                aria-label={t(photo.alt)}
                aria-current={i === idx}
                onClick={() => setIdx(i)}
                className={`h-1 rounded-full transition-[width,background-color] duration-300 ${
                  i === idx ? "w-8 bg-white" : "w-1.5 bg-white/45"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
