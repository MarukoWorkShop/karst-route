import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconChevron, IconSparkles, IconVolume, IconVolumeOff } from "@/components/icons";
import { heroBgm, heroSlides } from "@/data/heroPanels";
import { themes } from "@/data/themes";
import type { ThemeId } from "@/types";

const FADE_MS = 1200;
const CLIP_MAX_S = 10;
const POSTER_HOLD_MS = 10_000;
const SWIPE_PX = 48;
const TAP_PX = 12;

type Layer = "a" | "b";

function other(layer: Layer): Layer {
  return layer === "a" ? "b" : "a";
}

function wrap(i: number, count: number) {
  return ((i % count) + count) % count;
}

function bindVideo(el: HTMLVideoElement | null) {
  if (!el) return;
  el.muted = true;
  el.defaultMuted = true;
  el.setAttribute("playsinline", "true");
  el.setAttribute("webkit-playsinline", "true");
  // 不要设置 referrerpolicy="no-referrer"：
  // COS 防盗链靠 Referer 白名单放行本站，去掉 Referer 会被 403 拦截导致视频无法播放。
}

function playSafe(el: HTMLVideoElement | null) {
  if (!el?.getAttribute("src")) return;
  bindVideo(el);
  void el.play().catch(() => {});
}

export function Hero({
  onPlanOwn,
  onOpenTheme,
}: {
  onPlanOwn: () => void;
  onOpenTheme?: (id: ThemeId) => void;
}) {
  const { t, locale } = useLocale();
  const count = heroSlides.length;
  const [active, setActive] = useState(0);
  const [opaque, setOpaque] = useState<Layer>("a");
  const [aIdx, setAIdx] = useState(0);
  const [bIdx, setBIdx] = useState(count > 1 ? 1 : 0);
  const [soundOn, setSoundOn] = useState(false);
  const [reduce, setReduce] = useState(false);

  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const fadingRef = useRef(false);
  const activeRef = useRef(0);
  const opaqueRef = useRef<Layer>("a");
  const reduceRef = useRef(false);

  activeRef.current = active;
  opaqueRef.current = opaque;
  reduceRef.current = reduce;

  const slide = heroSlides[active];
  const zh = locale === "zh";
  const theme = themes.find((item) => item.id === slide.themeId);
  const chip = theme ? (zh ? theme.zh.split("・")[0] : theme.en) : "";

  const layerEl = (layer: Layer) => (layer === "a" ? aRef.current : bRef.current);

  const fadeTo = useCallback((target: number) => {
    const tIdx = wrap(target, count);
    if (tIdx === activeRef.current) return;
    if (fadingRef.current) return;

    if (reduceRef.current) {
      setActive(tIdx);
      setAIdx(tIdx);
      setBIdx(wrap(tIdx + 1, count));
      setOpaque("a");
      aRef.current?.pause();
      bRef.current?.pause();
      return;
    }

    fadingRef.current = true;
    const shown = opaqueRef.current;
    const hidden = other(shown);
    if (hidden === "a") setAIdx(tIdx);
    else setBIdx(tIdx);

    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      playSafe(layerEl(hidden));
      setOpaque(hidden);
      window.setTimeout(() => {
        setActive(tIdx);
        opaqueRef.current = hidden;
        fadingRef.current = false;
        const nxt = wrap(tIdx + 1, count);
        if (hidden === "a") setBIdx(nxt);
        else setAIdx(nxt);
        layerEl(shown)?.pause();
      }, FADE_MS);
    };

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const el = layerEl(hidden);
        const url = heroSlides[tIdx].video;
        if (!el || !url) {
          run();
          return;
        }
        if (el.readyState >= 2) {
          run();
          return;
        }
        const once = () => {
          el.removeEventListener("canplay", once);
          run();
        };
        el.addEventListener("canplay", once);
        window.setTimeout(() => {
          el.removeEventListener("canplay", once);
          if (fadingRef.current) run();
        }, 700);
      });
    });
  }, [count]);

  const go = useCallback(
    (dir: -1 | 1) => {
      fadeTo(activeRef.current + dir);
    },
    [fadeTo],
  );

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduce) {
      aRef.current?.pause();
      bRef.current?.pause();
      return;
    }
    playSafe(layerEl(opaque));
  }, [active, opaque, reduce, aIdx, bIdx]);

  useEffect(() => {
    if (reduce || fadingRef.current) return;
    if (heroSlides[active].video) return;
    const timer = window.setTimeout(() => fadeTo(active + 1), POSTER_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [active, reduce, fadeTo]);

  useEffect(() => {
    const node = audioRef.current;
    if (!node || !heroBgm) return;
    if (soundOn) void node.play().catch(() => setSoundOn(false));
    else {
      node.pause();
    }
  }, [soundOn]);

  function onVideoEnded(layer: Layer) {
    if (layer !== opaqueRef.current) return;
    fadeTo(activeRef.current + 1);
  }

  function onTimeUpdate(layer: Layer, el: HTMLVideoElement) {
    if (layer !== opaqueRef.current) return;
    if (el.currentTime >= CLIP_MAX_S) {
      el.pause();
      onVideoEnded(layer);
    }
  }

  function openArticle() {
    onOpenTheme?.(slide.themeId);
    document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" });
  }

  function onPointerDown(e: PointerEvent<HTMLElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as HTMLElement).closest("a, button")) return;
    drag.current = { x: e.clientX, y: e.clientY };
  }

  function onPointerUp(e: PointerEvent<HTMLElement>) {
    const start = drag.current;
    drag.current = null;
    if (!start) return;
    if ((e.target as HTMLElement).closest("a, button")) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1);
      return;
    }
    if (Math.abs(dx) < TAP_PX && Math.abs(dy) < TAP_PX) openArticle();
  }

  const aSlide = heroSlides[aIdx];
  const bSlide = heroSlides[bIdx];

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
        <img
          src={aSlide.poster}
          alt=""
          className={`hero-video absolute inset-0 h-full w-full object-cover ${
            opaque === "a" ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition: aSlide.pos }}
        />
        <img
          src={bSlide.poster}
          alt=""
          className={`hero-video absolute inset-0 h-full w-full object-cover ${
            opaque === "b" ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition: bSlide.pos }}
        />
        <video
          ref={(el) => {
            aRef.current = el;
            bindVideo(el);
          }}
          className={`hero-video absolute inset-0 h-full w-full object-cover ${
            opaque === "a" && aSlide.video ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition: aSlide.pos }}
          poster={aSlide.poster}
          src={aSlide.video || undefined}
          muted
          playsInline
          autoPlay={opaque === "a" && Boolean(aSlide.video) && !reduce}
          preload={opaque === "a" ? "auto" : "metadata"}
          onEnded={() => onVideoEnded("a")}
          onTimeUpdate={(e) => onTimeUpdate("a", e.currentTarget)}
        />
        <video
          ref={(el) => {
            bRef.current = el;
            bindVideo(el);
          }}
          className={`hero-video absolute inset-0 h-full w-full object-cover ${
            opaque === "b" && bSlide.video ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition: bSlide.pos }}
          poster={bSlide.poster}
          src={bSlide.video || undefined}
          muted
          playsInline
          autoPlay={opaque === "b" && Boolean(bSlide.video) && !reduce}
          preload={opaque === "b" ? "auto" : "metadata"}
          onEnded={() => onVideoEnded("b")}
          onTimeUpdate={(e) => onTimeUpdate("b", e.currentTarget)}
        />
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
        className="pointer-events-auto absolute top-1/2 left-3 z-[2] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-night/35 text-white backdrop-blur-sm md:left-6 md:h-12 md:w-12"
      >
        <IconChevron className="h-5 w-5 rotate-90" />
      </button>
      <button
        type="button"
        aria-label={t(copy.hero.next)}
        onClick={() => go(1)}
        className="pointer-events-auto absolute top-1/2 right-3 z-[2] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-night/35 text-white backdrop-blur-sm md:right-6 md:h-12 md:w-12"
      >
        <IconChevron className="h-5 w-5 -rotate-90" />
      </button>

      {heroBgm ? (
        <>
          <audio ref={audioRef} src={heroBgm} loop preload="none" />
          <button
            type="button"
            aria-label={soundOn ? t(copy.hero.soundOff) : t(copy.hero.soundOn)}
            aria-pressed={soundOn}
            onClick={() => setSoundOn((on) => !on)}
            className="pointer-events-auto absolute right-4 bottom-[calc(88px+env(safe-area-inset-bottom))] z-[3] flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-night/40 text-white backdrop-blur-sm md:right-6 md:bottom-8 md:h-12 md:w-12"
          >
            {soundOn ? <IconVolume className="h-5 w-5" /> : <IconVolumeOff className="h-5 w-5" />}
          </button>
        </>
      ) : null}

      <div className="pointer-events-none relative z-[1] flex min-h-[100svh] flex-col justify-end">
        <div className="page-col pb-[calc(96px+env(safe-area-inset-bottom))] md:pb-14">
          {/* key 用索引而非 slide.id：多个 slide 可共用一个主题，用 id 会导致切换时动画不触发 */}
          <div key={active} className="hero-copy max-w-[640px]">
            <a
              href="#experience"
              aria-label={t(copy.hero.themesAria)}
              onClick={() => onOpenTheme?.(slide.themeId)}
              className="pointer-events-auto inline-flex rounded-full border border-[#C5A059]/70 bg-night/35 px-3 py-[5px] text-[10px] font-medium tracking-[0.14em] text-[#C5A059] backdrop-blur-[2px] md:text-[11px]"
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
                className="pointer-events-auto inline-flex min-h-12 items-center justify-center rounded-lg bg-cta px-6 text-center text-[13px] font-medium text-white md:min-h-[52px] md:px-8 md:text-[14px]"
              >
                {t(copy.hero.ctaA)}
              </a>
              <a
                href="#plan"
                onClick={onPlanOwn}
                className="pointer-events-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-6 text-center text-[13px] font-medium text-white backdrop-blur-md md:min-h-[52px] md:px-8 md:text-[14px]"
              >
                <IconSparkles className="h-3.5 w-3.5 shrink-0" />
                {t(copy.hero.ctaB)}
              </a>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-1.5 md:mt-10">
            {heroSlides.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={t(item.alt)}
                aria-current={i === active ? true : undefined}
                onClick={() => fadeTo(i)}
                className={`pointer-events-auto h-1 rounded-full transition-[width,background-color] duration-300 ${
                  i === active ? "w-8 bg-white" : "w-1.5 bg-white/45"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
