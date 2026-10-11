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

const PIN_START = "#2f9e44";
const PIN_MID = "#1e5c3a";
const PIN_END = "#d64545";

function pinFill(index: number, last: number) {
  if (index === 0) return PIN_START;
  if (index === last) return PIN_END;
  return PIN_MID;
}

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

  const { x: dotX, y: dotY, idx } = walkRoute(stops, progress);
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
            className="h-auto w-full md:w-[78%]"
            aria-hidden
          >
            <defs>
              <clipPath id={clipId}>
                <rect x="0" y="0" width={mapView.w} height={mapView.h} />
              </clipPath>
              <filter id="pin-shadow" x="-40%" y="-20%" width="180%" height="160%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.1" floodColor="#1c1c1c" floodOpacity="0.28" />
              </filter>
              <path
                id="map-pin"
                d="M0 1.4C-2.2-10.7-12.2-13.6-12.2-23.8a12.2 12.2 0 1 1 24.4 0C12.2-13.6 2.2-10.7 0 1.4Z"
              />
            </defs>
            <rect className="region-map-sea" width={mapView.w} height={mapView.h} />
            <g clipPath={`url(#${clipId})`}>
              <g className="region-map-land">
                {osmBasemap.land.map((region) =>
                  region.rings.map((ring, i) => <path key={`${region.id}-${i}`} d={ringPath(ring)} />),
                )}
              </g>
              <g className="region-map-core">
                {osmBasemap.core.map((region) =>
                  region.rings.map((ring, i) => <path key={`${region.id}-${i}`} d={ringPath(ring)} />),
                )}
              </g>
              <g className="region-map-water">
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
                    style={locale === "en" ? { letterSpacing: "0.16em" } : undefined}
                  >
                    {locale === "zh" ? region.name.zh : region.name.en.toUpperCase()}
                  </text>
                );
              })}
              <path className="region-map-route" d={track} />
              {stops.slice(0, -1).map((from, i) => {
                const to = stops[i + 1];
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                if (Math.hypot(dx, dy) < 36) return null;
                const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
                return (
                  <path
                    key={`arrow-${from.id}-${i}`}
                    d="M-5 -3.4 L5.2 0 L-5 3.4 Z"
                    fill="#2a2a2a"
                    transform={`translate(${from.x + dx * 0.55} ${from.y + dy * 0.55}) rotate(${angle})`}
                  />
                );
              })}
              <circle cx={dotX} cy={dotY} r="4" fill="#2c2c2c" stroke="#ffffff" strokeWidth="1.6" />
              {stops.map((s, i) => {
                const color = pinFill(i, stops.length - 1);
                const here = i === idx;
                const bump = stops.filter(
                  (other, j) => j !== i && Math.hypot(other.x - s.x, other.y - s.y) < 56,
                ).length;
                const shiftLeft = bump > 0 && i % 2 === 1;
                return (
                  <g key={`${s.id}-${i}`} pointerEvents="none">
                    <g
                      transform={`translate(${s.x} ${s.y}) scale(${here ? 1.06 : 1})`}
                      filter="url(#pin-shadow)"
                    >
                      {here ? <circle cy={-23.8} r={18} fill={color} opacity={0.16} /> : null}
                      <use href="#map-pin" fill={color} />
                      <circle cy={-23.8} r={4.5} fill="#ffffff" />
                    </g>
                    <text
                      x={bump ? s.x + (shiftLeft ? -14 : 14) : s.x}
                      y={bump ? s.y - 8 : s.y + 18}
                      textAnchor={bump ? (shiftLeft ? "end" : "start") : "middle"}
                      className={here ? "region-map-place is-here" : "region-map-place"}
                      stroke="#f7f6f2"
                      strokeWidth="3"
                      paintOrder="stroke"
                    >
                      {t(s.label)}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          <ol className="max-h-[200px] overflow-y-auto md:max-h-none md:w-[22%] md:self-stretch">
            {stops.map((s, i) => {
              const on = i === idx;
              return (
                <li
                  key={`${s.id}-${i}`}
                  className={`flex items-baseline gap-2 border-t border-line py-1 first:border-t-0 ${
                    on ? "text-cta" : "text-ink"
                  }`}
                >
                  <span className="w-5 shrink-0 text-[13px] font-semibold tabular-nums">{s.num}</span>
                  <span className="text-[13px] font-medium">{t(s.label)}</span>
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
