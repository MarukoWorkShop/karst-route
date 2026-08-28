import { useEffect, useRef, useState } from "react";
import type { RouteId } from "@/types";
import { animationStops } from "@/data/destinations";
import { mapPaths, mapViewBox } from "@/data/regionMap";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconClose, IconPlay } from "@/components/icons";

export function RoutePlayer({
  routeId,
  onClose,
}: {
  routeId: RouteId;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const stops = animationStops[routeId];
  const d = stops.map((s, i) => `${i === 0 ? "M" : "L"}${s.x},${s.y}`).join(" ");
  const pathRef = useRef<SVGPathElement>(null);
  const [run, setRun] = useState(0);
  const [len, setLen] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dot, setDot] = useState({ x: stops[0]?.x ?? 0, y: stops[0]?.y ?? 0 });
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    setLen(total);
    setProgress(0);
    if (reduce) {
      setProgress(1);
      const last = stops[stops.length - 1];
      if (last) setDot(last);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 9000;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setProgress(p);
      const pt = path.getPointAtLength(total * p);
      setDot({ x: pt.x, y: pt.y });
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [d, reduce, stops, run]);

  const idx = Math.min(stops.length - 1, Math.floor(progress * (stops.length - 0.001)));
  const here = stops[idx];
  const clipId = "route-play-clip";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t(copy.tours.book.playBtn)}
    >
      <div className="relative w-full max-w-3xl rounded-lg bg-paper p-4 md:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-lg text-ink"
          aria-label={t(copy.nav.close)}
        >
          <IconClose className="h-5 w-5" />
        </button>
        <p className="pr-12 text-[13px] font-medium tracking-[0.16em] text-cta">
          {t(copy.tours.book.nowAt)}
        </p>
        <p className="mt-1 text-[20px] font-medium">{here ? t(here.label) : ""}</p>
        <svg viewBox={mapViewBox} className="mt-4 h-auto w-full" aria-hidden>
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y="0" width="760" height="560" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <g className="region-map-land" strokeWidth="0.9" strokeLinejoin="round">
              <path d={mapPaths.laos} />
              <path d={mapPaths.vietnam} />
              <path d={mapPaths.guizhou} />
              <path d={mapPaths.guangdong} />
            </g>
            <g className="region-map-core" strokeWidth="1.35" strokeLinejoin="round">
              <path d={mapPaths.yunnan} />
              <path d={mapPaths.guangxi} />
              <path d={mapPaths.vietnamNorth} />
            </g>
            <path
              d={d}
              fill="none"
              stroke="var(--color-line)"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              ref={pathRef}
              d={d}
              fill="none"
              stroke="var(--color-cta)"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={len || 1}
              strokeDashoffset={(1 - progress) * (len || 1)}
            />
            {stops.map((s) => (
              <circle
                key={s.id}
                cx={s.x}
                cy={s.y}
                r="4"
                fill="var(--color-paper)"
                stroke="var(--color-cta)"
                strokeWidth="1.5"
              />
            ))}
            <circle cx={dot.x} cy={dot.y} r="7" fill="var(--color-cta)" />
          </g>
        </svg>
        {progress >= 1 ? (
          <button
            type="button"
            onClick={() => {
              setProgress(0);
              setRun((n) => n + 1);
            }}
            className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-cta font-medium text-white"
          >
            <IconPlay className="h-4 w-4" />
            {t(copy.tours.book.replay)}
          </button>
        ) : (
          <p className="mt-3 text-center text-[13px] text-ink-soft">{t(copy.tours.book.playing)}</p>
        )}
      </div>
    </div>
  );
}
