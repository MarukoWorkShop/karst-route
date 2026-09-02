import { useEffect, useMemo, useState } from "react";
import type { RouteId } from "@/types";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconClose, IconPlay } from "@/components/icons";
import {
  linePath,
  mapView,
  osmBasemap,
  project,
  ringPath,
  routeStops,
  walkRoute,
} from "@/lib/geoMap";

const REGION_LABELS = [
  { id: "yunnan", lon: 103.35, lat: 24.55 },
  { id: "guangxi", lon: 109.05, lat: 23.55 },
  { id: "vietnam", lon: 105.85, lat: 21.35 },
] as const;

export function RoutePlayer({
  routeId,
  onClose,
}: {
  routeId: RouteId;
  onClose: () => void;
}) {
  const { t, locale } = useLocale();
  const stops = useMemo(() => routeStops(routeId), [routeId]);
  const track = useMemo(
    () => stops.map((s, i) => `${i === 0 ? "M" : "L"}${s.x.toFixed(1)},${s.y.toFixed(1)}`).join(" "),
    [stops],
  );
  const [run, setRun] = useState(0);
  const [progress, setProgress] = useState(0);
  const reduce =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (reduce) {
      setProgress(1);
      return;
    }
    setProgress(0);
    let raf = 0;
    const start = performance.now();
    const duration = Math.max(11000, (stops.length - 1) * 2200);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [routeId, reduce, run, stops.length]);

  const { d: drawn, x: dotX, y: dotY, idx } = walkRoute(stops, progress);
  const here = stops[idx];
  const clipId = `route-play-clip-${routeId}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t(copy.tours.book.playBtn)}
    >
      <div className="relative w-full max-w-5xl rounded-lg bg-paper p-4 md:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-lg text-ink"
          aria-label={t(copy.nav.close)}
        >
          <IconClose className="h-5 w-5" />
        </button>
        <p className="pr-12 text-[13px] font-medium tracking-[0.16em] text-cta">
          {t(copy.tours.book.nowAt)}
        </p>
        <p className="mt-1 text-[20px] font-medium">{here ? t(here.label) : ""}</p>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-stretch">
          <svg
            viewBox={`0 0 ${mapView.w} ${mapView.h}`}
            className="h-auto w-full md:w-[68%]"
            aria-hidden
          >
            <defs>
              <clipPath id={clipId}>
                <rect x="0" y="0" width={mapView.w} height={mapView.h} />
              </clipPath>
            </defs>
            <rect width={mapView.w} height={mapView.h} fill="var(--color-paper)" />
            <g clipPath={`url(#${clipId})`}>
              <g
                className="region-map-land"
                fill="#e8e5dc"
                stroke="#5e7368"
                strokeOpacity="0.28"
                strokeWidth="0.9"
                strokeLinejoin="round"
              >
                {osmBasemap.land.map((region) =>
                  region.rings.map((ring, i) => <path key={`${region.id}-${i}`} d={ringPath(ring)} />),
                )}
              </g>
              <g
                className="region-map-core"
                fill="#e4ebe6"
                stroke="#8aa396"
                strokeWidth="1.35"
                strokeLinejoin="round"
              >
                {osmBasemap.core.map((region) =>
                  region.rings.map((ring, i) => <path key={`${region.id}-${i}`} d={ringPath(ring)} />),
                )}
              </g>
              <g
                className="region-map-water"
                fill="none"
                stroke="#b7c7bf"
                strokeWidth="1.4"
                strokeLinecap="round"
              >
                {osmBasemap.rivers.map((river) =>
                  river.lines.map((line, i) => <path key={`${river.name}-${i}`} d={linePath(line)} />),
                )}
              </g>
              {REGION_LABELS.map((lab) => {
                const region = osmBasemap.core.find((c) => c.id === lab.id);
                if (!region) return null;
                const { x, y } = project(lab.lon, lab.lat);
                return (
                  <text
                    key={lab.id}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    className="region-map-label"
                  >
                    {locale === "zh" ? region.name.zh : region.name.en}
                  </text>
                );
              })}
              <path
                d={track}
                fill="none"
                stroke="#c9c4b6"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray="7 9"
              />
              <path
                className="region-map-route"
                d={drawn}
                fill="none"
                stroke="#2f5344"
                strokeWidth="8"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray="22 14"
                strokeDashoffset={-progress * 72}
              />
              <circle cx={dotX} cy={dotY} r="11" fill="#2f5344" stroke="#faf8f2" strokeWidth="3" />
              {stops.map((s, i) => (
                <g key={`${s.id}-${i}`} pointerEvents="none">
                  {/* 地名：仅当前 idx 显示，opacity 跟随切换实现丝滑淡入淡出 */}
                  <text
                    x={s.x}
                    y={s.y - 30}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="600"
                    fill="#2f5344"
                    opacity={i === idx ? 1 : 0}
                    style={{ transition: "opacity 600ms ease-out" }}
                  >
                    {t(s.label)}
                  </text>
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r="22"
                    fill={i === idx ? "#2f5344" : "#faf8f2"}
                    stroke="#2f5344"
                    strokeWidth="2.5"
                  />
                  <text
                    x={s.x}
                    y={s.y + 7}
                    textAnchor="middle"
                    fontSize="18"
                    fontWeight="600"
                    fill={i === idx ? "#faf8f2" : "#2f5344"}
                  >
                    {s.num}
                  </text>
                </g>
              ))}
            </g>
          </svg>

          <ol className="max-h-[320px] overflow-y-auto md:max-h-none md:w-[32%] md:self-stretch">
            {stops.map((s, i) => {
              const on = i === idx;
              return (
                <li
                  key={`${s.id}-${i}`}
                  className={`flex items-baseline gap-2.5 border-t border-line py-2 first:border-t-0 ${
                    on ? "text-cta" : "text-ink"
                  }`}
                >
                  <span className="w-8 shrink-0 text-[20px] font-bold tabular-nums">{s.num}</span>
                  <span className="text-[16px] font-medium">{t(s.label)}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <p className="mt-3 text-[11px] text-ink-soft">{t(copy.tours.book.mapCredit)}</p>

        {progress >= 1 ? (
          <button
            type="button"
            onClick={() => {
              setProgress(0);
              setRun((n) => n + 1);
            }}
            className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-cta font-medium text-white"
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
