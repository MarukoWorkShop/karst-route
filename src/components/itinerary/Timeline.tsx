import { useState, type ReactNode } from "react";
import type { DayStop, RouteId } from "@/types";
import { routes } from "@/data/itinerary";
import { places, placeStories } from "@/data/destinations";
import { IconBoat, IconChevron, IconDining, IconLodge, IconVan } from "@/components/icons";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { ReviewsFold } from "@/components/itinerary/ReviewsFold";
import { RoutePlayer } from "@/components/itinerary/RoutePlayer";

export function Timeline({
  routeId,
  onRoute,
}: {
  routeId: RouteId;
  onRoute: (id: RouteId) => void;
}) {
  const { t } = useLocale();
  const route = routes[routeId];
  const stopCount = new Set(route.days.map((d) => d.placeId).filter(Boolean)).size;
  const [open, setOpen] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <section id="itinerary" className="scroll-mt-24 py-12">
      <div className="page-col">
        <p className="text-[13px] font-medium tracking-[0.12em] text-cta uppercase">
          {t(copy.tours.days)}
        </p>
      </div>
      <div className="sticky top-[52px] z-30 border-b border-line bg-paper md:top-[60px]">
        <div role="tablist" className="page-col flex">
          {(["r1", "r2"] as RouteId[]).map((id) => (
            <button
              key={id}
              role="tab"
              aria-selected={routeId === id}
              type="button"
              onClick={() => {
                onRoute(id);
                setOpen(null);
              }}
              className={`h-11 flex-1 text-[14px] font-medium ${
                routeId === id
                  ? "border-b-2 border-cta text-cta"
                  : "border-b-2 border-transparent text-ink-soft"
              }`}
            >
              {id === "r1" ? t(copy.tours.r1Tab) : t(copy.tours.r2Tab)}
            </button>
          ))}
        </div>
      </div>
      <div className={playing ? "bg-cta" : "border-b border-line bg-bone"}>
        <div className="page-col">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="flex w-full items-center gap-3 py-[11px]"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                playing
                  ? "border-[1.5px] border-paper/35 bg-paper/18 text-paper"
                  : "bg-cta text-paper"
              }`}
            >
              {playing ? <CloseMark /> : <PlayMark />}
            </span>
            <span
              className={`flex-1 text-left text-[13px] font-medium ${
                playing ? "text-paper" : "text-cta"
              }`}
            >
              {t(copy.tours.book.viewMap)}
            </span>
            {playing ? null : (
              <span className="text-[11px] text-ink-soft">
                {stopCount} {t(copy.tours.book.mapStops)}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="page-col mt-2">
        <ol className="mx-auto max-w-[640px]">
          {route.days.map((day) => (
            <DayRow
              key={`${routeId}-${day.day}`}
              day={day}
              open={open === day.day}
              onToggle={() => setOpen((cur) => (cur === day.day ? null : day.day))}
            />
          ))}
        </ol>
        <ReviewsFold />
      </div>

      {playing ? <RoutePlayer routeId={routeId} onClose={() => setPlaying(false)} /> : null}
    </section>
  );
}

function DayRow({
  day,
  open,
  onToggle,
}: {
  day: DayStop;
  open: boolean;
  onToggle: () => void;
}) {
  const { t } = useLocale();
  const n = String(day.day).padStart(2, "0");
  const place = day.placeId ? places[day.placeId] : null;
  const story = day.placeId ? placeStories[day.placeId] : null;
  const city = t(day.city);
  const stay = t(day.stay);
  const subtitle = stay === city && place ? t(place.tagline) : stay;
  const photos = (day.photos ?? story?.slides ?? (place ? [place.photo] : [])).slice(0, 3);
  const blurb = day.blurb ?? story?.culture;
  const transport = day.transport ?? day.drive;
  const lodging = day.lodging ?? place?.hotel.title;
  const dining = day.dining ?? (place ? [place.cuisine.title] : undefined);

  return (
    <li
      className="border-b border-line"
    >
      <button
        type="button"
        data-place-node={day.day}
        aria-expanded={open}
        onClick={onToggle}
        className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cta text-[13px] font-medium text-cta">
          {n}
        </span>
        <span className="min-w-0 flex-1 text-[17px] font-medium text-ink">{city}</span>
        <span className="max-w-[46%] shrink-0 truncate text-right text-[13px] text-ink-soft">
          {subtitle}
        </span>
        <IconChevron
          className={`h-4 w-4 shrink-0 text-ink-soft transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="px-4 pb-5">
          {photos.length > 0 ? (
            <div
              className={`grid gap-1.5 ${
                photos.length === 1
                  ? "grid-cols-1"
                  : photos.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
              }`}
            >
              {photos.map((src) => (
                <img loading="lazy"
                  key={src}
                  src={src}
                  alt=""
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
              ))}
            </div>
          ) : null}

          {blurb ? (
            <p className="mt-4 border-l-2 border-gold pl-3 text-[14px] leading-6 text-ink">
              {t(blurb)}
            </p>
          ) : null}

          {day.bullets.length > 0 ? (
            <ul className="mt-3.5 flex flex-col gap-2">
              {day.bullets.map((b) => (
                <li key={b.en} className="flex gap-2.5 text-[14px] leading-[22px] text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {t(b)}
                </li>
              ))}
            </ul>
          ) : null}

          {transport || lodging || dining ? (
            <div className="mt-4 divide-y divide-paper overflow-hidden rounded-2xl bg-sage">
              {transport ? (
                <LogRow
                  icons={
                    <>
                      <IconVan className="h-4 w-4" />
                      <IconBoat className="h-4 w-4" />
                    </>
                  }
                  label={t(copy.tours.book.transport)}
                  lines={[t(transport)]}
                />
              ) : null}
              {lodging ? (
                <LogRow
                  icons={<IconLodge className="h-4 w-4" />}
                  label={t(copy.tours.book.stay)}
                  lines={[t(lodging)]}
                />
              ) : null}
              {dining && dining.length > 0 ? (
                <LogRow
                  icons={<IconDining className="h-4 w-4" />}
                  label={t(copy.tours.book.dining)}
                  lines={dining.map((line) => t(line))}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function LogRow({
  icons,
  label,
  lines,
}: {
  icons: ReactNode;
  label: string;
  lines: string[];
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center gap-0.5 text-ink" aria-hidden>
        {icons}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium text-ink">{label}</span>
        {lines.map((line) => (
          <span key={line} className="mt-0.5 block text-[13px] leading-5 text-ink-soft">
            {line}
          </span>
        ))}
      </span>
    </div>
  );
}

function PlayMark() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor" aria-hidden className="ml-0.5">
      <path d="M2.5 1.5 9.5 5.5 2.5 9.5z" />
    </svg>
  );
}

function CloseMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M2 2l8 8M10 2l-8 8" />
    </svg>
  );
}
